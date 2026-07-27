/**
 * Browser-side LE Lab extraction adapters.
 *
 * Privacy contract:
 * - Source text/files/media are read locally and are never uploaded here.
 * - URL extraction performs an explicit fetch of the user-entered URL only.
 * - PDF.js/Tesseract support files are downloaded lazily; those downloads are
 *   library/model downloads, not source uploads.
 * - No source content is written to localStorage or IndexedDB. Tesseract may
 *   browser-cache its language/model assets.
 *
 * PDF.js and Tesseract's top-level browser bundles are loaded through an
 * integrity-checked <script>. Worker/core/model resources do not have a browser
 * SRI hook, so their URLs are exact-version pinned below.
 */

import {
  INTAKE_LIMITS,
  LabIntakeError,
  canonicalizeUrl,
  classifyLocalFile,
  classifySourceUrl,
  createNormalizedDocument,
  detectTextFormat,
  normalizeInput,
  stableHash
} from './lab-intake.js?v=1.7';

export const EXTRACTOR_DEPENDENCIES = Object.freeze({
  pdfjs: Object.freeze({
    name: 'PDF.js',
    version: '3.11.174',
    scriptUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
    scriptIntegrity: 'sha384-/1qUCSGwTur9vjf/z9lmu/eCUYbpOTgSjmpbMQZ1/CtX2v/WcAIKqRv+U1DUCG6e',
    workerUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
    license: 'Apache-2.0'
  }),
  tesseract: Object.freeze({
    name: 'Tesseract.js',
    version: '5.1.1',
    scriptUrl: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js',
    scriptIntegrity: 'sha384-GJqSu7vueQ9qN0E9yLPb3Wtpd7OrgK8KmYzC8T1IysG1bcvxvIO4qtYR/D3A991F',
    workerUrl: 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1',
    languagePath: 'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/4.0.0_best_int',
    language: 'eng',
    license: 'Apache-2.0'
  })
});

export const SPEECH_TO_TEXT_CAPABILITY = Object.freeze({
  available: false,
  mode: 'media-plus-companion-transcript',
  adapter: 'le-lab.speech-to-text@1',
  sendsMediaOffDevice: false,
  reason: 'No browser speech-to-text engine is shipped in this prototype. Local audio/video needs a companion TXT, MD, SRT, VTT, JSON, or CSV transcript.'
});

const loadedScripts = new Map();

function emitProgress(callback, {
  phase,
  status = 'progress',
  progress = null,
  message,
  detail = {}
}) {
  if (typeof callback !== 'function') return;
  callback({
    phase,
    status,
    progress: Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : null,
    message: String(message || ''),
    detail
  });
}

function abortError(message = 'Extraction was cancelled.') {
  if (typeof DOMException !== 'undefined') return new DOMException(message, 'AbortError');
  return new LabIntakeError('CANCELLED', message);
}

function throwIfAborted(signal) {
  if (signal?.aborted) throw signal.reason instanceof Error ? signal.reason : abortError();
}

function raceWithAbort(promise, signal) {
  if (!signal) return promise;
  throwIfAborted(signal);
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      signal.addEventListener('abort', () => {
        reject(signal.reason instanceof Error ? signal.reason : abortError());
      }, { once: true });
    })
  ]);
}

function isAbortError(error) {
  return error?.name === 'AbortError' || error?.code === 'CANCELLED';
}

function requireBrowser(feature) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new LabIntakeError(
      'BROWSER_REQUIRED',
      `${feature} is only available in a browser.`
    );
  }
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return 'unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit ? 1 : 0)} ${units[unit]}`;
}

function assertFileSize(file, limit, label) {
  if (!file || !Number.isFinite(file.size)) {
    throw new LabIntakeError('INVALID_FILE', `Choose a valid ${label} file.`);
  }
  if (file.size > limit) {
    throw new LabIntakeError(
      'FILE_SIZE_LIMIT_EXCEEDED',
      `${file.name || `This ${label}`} is ${formatBytes(file.size)}. The ${label} limit is ${formatBytes(limit)}; use a smaller file or split it first.`,
      { actual: file.size, limit, label }
    );
  }
}

function titleFromFile(file, fallback = 'Untitled source') {
  const name = String(file?.name || '').trim();
  return name ? name.replace(/\.[^.]+$/, '') : fallback;
}

async function loadTrustedScript({
  key,
  url,
  integrity,
  globalName,
  signal,
  onProgress,
  label
}) {
  requireBrowser(label);
  if (globalThis[globalName]) return globalThis[globalName];
  if (loadedScripts.has(key)) return raceWithAbort(loadedScripts.get(key), signal);

  emitProgress(onProgress, {
    phase: 'dependency',
    status: 'start',
    progress: 0,
    message: `Downloading ${label}. Your source stays on this device.`,
    detail: { dependency: key, url }
  });

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.referrerPolicy = 'no-referrer';
    script.integrity = integrity;
    script.dataset.leLabDependency = key;
    script.addEventListener('load', () => {
      const loaded = globalThis[globalName];
      if (!loaded) {
        reject(new LabIntakeError(
          'OPTIONAL_DEPENDENCY_INVALID',
          `${label} loaded, but did not expose the expected browser API.`
        ));
        return;
      }
      emitProgress(onProgress, {
        phase: 'dependency',
        status: 'success',
        progress: 1,
        message: `${label} is ready. Your source was not uploaded.`,
        detail: { dependency: key }
      });
      resolve(loaded);
    }, { once: true });
    script.addEventListener('error', () => {
      script.remove();
      reject(new LabIntakeError(
        'OPTIONAL_DEPENDENCY_UNAVAILABLE',
        `${label} could not be downloaded or failed its integrity check. Check the connection and try again; text and transcript intake still work without it.`,
        { dependency: key, url }
      ));
    }, { once: true });
    document.head.append(script);
  });

  loadedScripts.set(key, promise);
  promise.catch(() => loadedScripts.delete(key));
  return raceWithAbort(promise, signal);
}

/**
 * Owns transient extraction resources. Call begin() before an operation, pass
 * the returned signal to an extractor, and call reset() for the Lab Reset
 * action. Reset aborts active work, terminates registered workers, and revokes
 * every local media object URL.
 */
export class ExtractionSession {
  constructor({ onProgress } = {}) {
    this.onProgress = onProgress;
    this.controller = null;
    this.objectUrls = new Set();
    this.cleanups = new Set();
  }

  begin(message = 'A newer intake operation replaced this one.') {
    this.cancel(message);
    this.controller = new AbortController();
    return this.controller.signal;
  }

  cancel(message = 'Extraction was cancelled.') {
    if (this.controller && !this.controller.signal.aborted) {
      this.controller.abort(abortError(message));
      emitProgress(this.onProgress, {
        phase: 'cancel',
        status: 'cancelled',
        message
      });
    }
    this.controller = null;
  }

  trackObjectUrl(url) {
    if (url) this.objectUrls.add(url);
    return url;
  }

  releaseObjectUrl(url) {
    if (!url || !this.objectUrls.has(url)) return;
    URL.revokeObjectURL(url);
    this.objectUrls.delete(url);
  }

  trackCleanup(cleanup) {
    if (typeof cleanup === 'function') this.cleanups.add(cleanup);
    return () => this.cleanups.delete(cleanup);
  }

  async reset() {
    this.cancel('LE Lab session reset.');
    const cleanups = [...this.cleanups];
    this.cleanups.clear();
    await Promise.allSettled(cleanups.map((cleanup) => Promise.resolve().then(cleanup)));
    for (const url of this.objectUrls) URL.revokeObjectURL(url);
    this.objectUrls.clear();
    emitProgress(this.onProgress, {
      phase: 'reset',
      status: 'success',
      progress: 1,
      message: 'Local source text, previews, and extraction resources were cleared.'
    });
  }
}

function readBlob(file, { signal, onProgress, mode = 'text' } = {}) {
  requireBrowser('Local file extraction');
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const onAbort = () => reader.abort();
    signal?.addEventListener('abort', onAbort, { once: true });
    reader.addEventListener('progress', (event) => {
      emitProgress(onProgress, {
        phase: 'read',
        progress: event.lengthComputable ? event.loaded / event.total : null,
        message: `Reading ${file.name || 'local file'} on this device…`,
        detail: { loadedBytes: event.loaded, totalBytes: event.total || null }
      });
    });
    reader.addEventListener('load', () => {
      signal?.removeEventListener('abort', onAbort);
      resolve(reader.result);
    }, { once: true });
    reader.addEventListener('abort', () => {
      signal?.removeEventListener('abort', onAbort);
      reject(signal?.reason instanceof Error ? signal.reason : abortError());
    }, { once: true });
    reader.addEventListener('error', () => {
      signal?.removeEventListener('abort', onAbort);
      reject(new LabIntakeError(
        'FILE_READ_FAILED',
        `The browser could not read ${file.name || 'the selected file'}.`,
        { cause: reader.error?.message || null }
      ));
    }, { once: true });
    if (mode === 'arrayBuffer') reader.readAsArrayBuffer(file);
    else reader.readAsText(file, 'utf-8');
  });
}

function textDecodeWarnings(text) {
  const replacementCount = (String(text).match(/\uFFFD/g) || []).length;
  if (!replacementCount) return [];
  return [{
    code: 'TEXT_ENCODING_REPLACEMENTS',
    message: `${replacementCount.toLocaleString()} unreadable character(s) were replaced while decoding UTF-8. Review the source view before relying on exact wording.`,
    severity: replacementCount > 20 ? 'warning' : 'info'
  }];
}

export async function extractTextFile(file, options = {}) {
  const {
    signal,
    onProgress,
    title = titleFromFile(file),
    url = null,
    sourceType = 'local-file'
  } = options;
  assertFileSize(file, INTAKE_LIMITS.maxTextFileBytes, 'text/transcript');
  throwIfAborted(signal);
  emitProgress(onProgress, {
    phase: 'read',
    status: 'start',
    progress: 0,
    message: `Reading ${file.name || 'local transcript'} on this device…`
  });
  const text = await readBlob(file, { signal, onProgress, mode: 'text' });
  throwIfAborted(signal);
  if ((String(text).match(/\u0000/g) || []).length > Math.max(4, String(text).length * 0.002)) {
    throw new LabIntakeError(
      'BINARY_FILE_AS_TEXT',
      `${file.name || 'The selected file'} appears to be binary, not a supported text transcript.`
    );
  }
  const classification = classifyLocalFile(file);
  const format = classification.kind === 'text'
    ? classification.format
    : detectTextFormat({ fileName: file.name, mimeType: file.type, text });
  const document = normalizeInput({
    text,
    format,
    source: {
      title,
      type: sourceType,
      url,
      fileName: file.name || null,
      mimeType: file.type || null
    },
    extraction: {
      method: `${format}-file-parser`,
      warnings: textDecodeWarnings(text)
    }
  });
  emitProgress(onProgress, {
    phase: 'normalize',
    status: 'success',
    progress: 1,
    message: `${document.stats.segments.toLocaleString()} segment(s) normalized locally.`,
    detail: { documentId: document.id, format }
  });
  return document;
}

export function loadPdfJs(options = {}) {
  const dependency = EXTRACTOR_DEPENDENCIES.pdfjs;
  return loadTrustedScript({
    key: `pdfjs@${dependency.version}`,
    url: dependency.scriptUrl,
    integrity: dependency.scriptIntegrity,
    globalName: 'pdfjsLib',
    signal: options.signal,
    onProgress: options.onProgress,
    label: `PDF.js ${dependency.version}`
  }).then((pdfjsLib) => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = dependency.workerUrl;
    return pdfjsLib;
  });
}

function combinePdfTextItems(items) {
  let output = '';
  for (const item of items) {
    if (!item || typeof item.str !== 'string') continue;
    output += item.str;
    output += item.hasEOL ? '\n' : ' ';
  }
  return output
    .replace(/[ \t]+\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function chunkExtractedText(text, originalBase = {}) {
  const clean = String(text).trim();
  const chunks = [];
  let cursor = 0;
  while (cursor < clean.length) {
    let end = Math.min(
      cursor + INTAKE_LIMITS.maxSegmentCharacters,
      clean.length
    );
    if (end < clean.length) {
      const paragraphBreak = clean.lastIndexOf('\n', end);
      const wordBreak = clean.lastIndexOf(' ', end);
      const preferred = Math.max(paragraphBreak, wordBreak);
      if (preferred > cursor + INTAKE_LIMITS.maxSegmentCharacters * 0.65) end = preferred;
    }
    const rawChunk = clean.slice(cursor, end);
    const chunk = rawChunk.trim();
    if (chunk) {
      const leading = rawChunk.indexOf(chunk);
      chunks.push({
        text: chunk,
        original: {
          source: 'extracted-text',
          startOffset: (originalBase.startOffset || 0) + cursor + Math.max(0, leading),
          endOffset: (originalBase.startOffset || 0) + cursor + Math.max(0, leading) + chunk.length,
          ...(Number.isInteger(originalBase.page) ? { page: originalBase.page } : {})
        }
      });
    }
    cursor = end;
    while (/\s/.test(clean[cursor] || '')) cursor += 1;
  }
  return chunks;
}

export async function extractPdfFile(file, options = {}) {
  const {
    signal,
    onProgress,
    title = titleFromFile(file),
    url = null
  } = options;
  assertFileSize(file, INTAKE_LIMITS.maxPdfBytes, 'PDF');
  throwIfAborted(signal);
  const pdfjsLib = await loadPdfJs({ signal, onProgress });
  throwIfAborted(signal);

  const data = await readBlob(file, { signal, onProgress, mode: 'arrayBuffer' });
  throwIfAborted(signal);
  emitProgress(onProgress, {
    phase: 'pdf',
    status: 'start',
    progress: 0,
    message: 'Extracting the PDF text on this device…'
  });

  const loadingTask = pdfjsLib.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true
  });
  const abortLoading = () => loadingTask.destroy();
  signal?.addEventListener('abort', abortLoading, { once: true });
  loadingTask.onProgress = ({ loaded, total }) => {
    emitProgress(onProgress, {
      phase: 'pdf-load',
      progress: total ? loaded / total : null,
      message: 'Opening the PDF locally…',
      detail: { loadedBytes: loaded, totalBytes: total || null }
    });
  };

  let pdf;
  try {
    pdf = await raceWithAbort(loadingTask.promise, signal);
    const segments = [];
    const warnings = [];
    let extractedOffset = 0;
    let emptyPages = 0;

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      throwIfAborted(signal);
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent({
        includeMarkedContent: false,
        disableNormalization: false
      });
      const pageText = combinePdfTextItems(content.items);
      if (!pageText) {
        emptyPages += 1;
      } else {
        const chunks = chunkExtractedText(pageText, {
          page: pageNumber,
          startOffset: extractedOffset
        });
        segments.push(...chunks);
        extractedOffset += pageText.length + 2;
        if (extractedOffset > INTAKE_LIMITS.maxDocumentCharacters) {
          throw new LabIntakeError(
            'CHARACTER_LIMIT_EXCEEDED',
            `The PDF yielded more than ${INTAKE_LIMITS.maxDocumentCharacters.toLocaleString()} characters. Split it into smaller PDFs before analysis.`
          );
        }
      }
      page.cleanup();
      emitProgress(onProgress, {
        phase: 'pdf',
        progress: pageNumber / pdf.numPages,
        message: `Extracted PDF page ${pageNumber.toLocaleString()} of ${pdf.numPages.toLocaleString()}…`,
        detail: { page: pageNumber, pages: pdf.numPages }
      });
    }

    if (!segments.length) {
      throw new LabIntakeError(
        'PDF_NO_TEXT',
        'The PDF contained no recoverable text. It may be a scan; export its pages as images and use OCR, or provide a companion transcript.'
      );
    }
    if (emptyPages) {
      warnings.push({
        code: 'PDF_PAGES_WITHOUT_TEXT',
        message: `${emptyPages.toLocaleString()} of ${pdf.numPages.toLocaleString()} PDF page(s) yielded no text. The result may be partial.`,
        severity: 'warning'
      });
    }

    const document = createNormalizedDocument({
      source: {
        title,
        type: 'pdf-document',
        url,
        fileName: file.name || null,
        mimeType: file.type || 'application/pdf'
      },
      segments,
      extraction: {
        method: `pdfjs-${EXTRACTOR_DEPENDENCIES.pdfjs.version}`,
        boundarySpace: 'extracted-text',
        warnings
      }
    });
    emitProgress(onProgress, {
      phase: 'pdf',
      status: warnings.length ? 'warning' : 'success',
      progress: 1,
      message: `Recovered ${document.stats.words.toLocaleString()} words from ${pdf.numPages.toLocaleString()} PDF page(s).`,
      detail: { pages: pdf.numPages, emptyPages, documentId: document.id }
    });
    return document;
  } catch (error) {
    if (isAbortError(error) || signal?.aborted) throw abortError();
    if (error instanceof LabIntakeError) throw error;
    if (error?.name === 'PasswordException') {
      throw new LabIntakeError(
        'PDF_PASSWORD_REQUIRED',
        'This PDF is password protected. Save an unlocked copy locally and try again.'
      );
    }
    throw new LabIntakeError(
      'PDF_EXTRACTION_FAILED',
      `PDF text extraction failed: ${error?.message || 'unknown PDF error'}`,
      { cause: error?.message || null }
    );
  } finally {
    signal?.removeEventListener('abort', abortLoading);
    try {
      await pdf?.destroy();
    } catch {
      // Best-effort worker cleanup.
    }
    try {
      await loadingTask.destroy();
    } catch {
      // Best-effort loading-task cleanup.
    }
  }
}

export function loadTesseract(options = {}) {
  const dependency = EXTRACTOR_DEPENDENCIES.tesseract;
  return loadTrustedScript({
    key: `tesseract@${dependency.version}`,
    url: dependency.scriptUrl,
    integrity: dependency.scriptIntegrity,
    globalName: 'Tesseract',
    signal: options.signal,
    onProgress: options.onProgress,
    label: `Tesseract.js ${dependency.version}`
  });
}

async function inspectImage(file, { signal, onProgress } = {}) {
  const warnings = [];
  if (typeof createImageBitmap !== 'function') {
    warnings.push({
      code: 'IMAGE_DIMENSIONS_UNCHECKED',
      message: 'This browser could not preflight image dimensions. OCR will still enforce the compressed file-size limit.',
      severity: 'info'
    });
    return { width: null, height: null, warnings };
  }
  emitProgress(onProgress, {
    phase: 'ocr-preflight',
    progress: 0,
    message: 'Checking image dimensions locally…'
  });
  const bitmap = await raceWithAbort(createImageBitmap(file), signal);
  const { width, height } = bitmap;
  bitmap.close();
  const pixels = width * height;
  if (pixels > INTAKE_LIMITS.maxImagePixels) {
    throw new LabIntakeError(
      'IMAGE_PIXEL_LIMIT_EXCEEDED',
      `This image is ${width.toLocaleString()} × ${height.toLocaleString()} (${pixels.toLocaleString()} pixels). Resize it below ${INTAKE_LIMITS.maxImagePixels.toLocaleString()} pixels before OCR.`,
      { width, height, pixels, limit: INTAKE_LIMITS.maxImagePixels }
    );
  }
  return { width, height, warnings };
}

export async function extractImageOcr(file, options = {}) {
  const {
    signal,
    onProgress,
    session,
    title = titleFromFile(file, 'Clipboard image'),
    url = null
  } = options;
  assertFileSize(file, INTAKE_LIMITS.maxImageBytes, 'image');
  throwIfAborted(signal);
  const preflight = await inspectImage(file, { signal, onProgress });
  const Tesseract = await loadTesseract({ signal, onProgress });
  throwIfAborted(signal);

  const dependency = EXTRACTOR_DEPENDENCIES.tesseract;
  let worker = null;
  let unregisterCleanup = () => {};
  let abortWorker = () => {};
  try {
    emitProgress(onProgress, {
      phase: 'ocr-model',
      status: 'start',
      progress: 0,
      message: 'Downloading the pinned English OCR model. The image stays on this device.',
      detail: {
        libraryVersion: dependency.version,
        language: dependency.language,
        sourceUploaded: false
      }
    });
    worker = await Tesseract.createWorker(
      dependency.language,
      Tesseract.OEM?.LSTM_ONLY ?? 1,
      {
        workerPath: dependency.workerUrl,
        corePath: dependency.corePath,
        langPath: dependency.languagePath,
        logger: (event) => {
          const status = String(event.status || 'ocr').replace(/_/g, ' ');
          emitProgress(onProgress, {
            phase: status.includes('recognizing') ? 'ocr' : 'ocr-model',
            progress: Number.isFinite(event.progress) ? event.progress : null,
            message: `${status.charAt(0).toUpperCase()}${status.slice(1)}…`,
            detail: {
              workerStatus: event.status || null,
              modelOrLibraryDownload: !status.includes('recognizing'),
              sourceUploaded: false
            }
          });
        }
      }
    );
    abortWorker = () => {
      try {
        worker?.terminate();
      } catch {
        // Termination is best effort.
      }
    };
    signal?.addEventListener('abort', abortWorker, { once: true });
    unregisterCleanup = session?.trackCleanup(abortWorker) || (() => {});
    throwIfAborted(signal);

    emitProgress(onProgress, {
      phase: 'ocr',
      status: 'start',
      progress: 0,
      message: 'Reading the image locally with OCR…',
      detail: { sourceUploaded: false }
    });
    const result = await raceWithAbort(worker.recognize(file), signal);
    throwIfAborted(signal);
    const text = String(result?.data?.text || '').trim();
    const confidence = Number.isFinite(result?.data?.confidence)
      ? Number(result.data.confidence)
      : null;
    if (!text) {
      throw new LabIntakeError(
        'OCR_NO_TEXT',
        'OCR did not recover readable text. Try a sharper, higher-contrast image or paste the transcript directly.'
      );
    }
    const warnings = [...preflight.warnings];
    if (confidence == null || confidence < 70) {
      warnings.push({
        code: 'OCR_LOW_CONFIDENCE',
        message: confidence == null
          ? 'OCR did not return a confidence score. Verify the recovered wording before analysis.'
          : `OCR confidence was ${confidence.toFixed(1)}%. Verify names, numbers, and quoted wording before relying on the analysis.`,
        severity: 'warning',
        details: { confidence }
      });
    }
    warnings.push({
      code: 'OCR_LOCAL_PROCESSING',
      message: 'The source image was processed on-device. OCR libraries and language data may be browser-cached; the image is not persisted by LE Lab.',
      severity: 'info'
    });

    const document = normalizeInput({
      text,
      format: 'text',
      source: {
        title,
        type: 'image-ocr',
        url,
        fileName: file.name || null,
        mimeType: file.type || null
      },
      extraction: {
        method: `tesseract-${dependency.version}-eng`,
        boundarySpace: 'extracted-text',
        confidence,
        warnings
      }
    });
    emitProgress(onProgress, {
      phase: 'ocr',
      status: confidence != null && confidence >= 70 ? 'success' : 'warning',
      progress: 1,
      message: confidence == null
        ? `OCR recovered ${document.stats.words.toLocaleString()} words; confidence was unavailable.`
        : `OCR recovered ${document.stats.words.toLocaleString()} words at ${confidence.toFixed(1)}% confidence.`,
      detail: {
        confidence,
        width: preflight.width,
        height: preflight.height,
        documentId: document.id
      }
    });
    return document;
  } catch (error) {
    if (isAbortError(error) || signal?.aborted) throw abortError();
    if (error instanceof LabIntakeError) throw error;
    throw new LabIntakeError(
      'OCR_FAILED',
      `Browser OCR failed: ${error?.message || 'unknown OCR error'}. Text and transcript uploads still work without OCR.`,
      { cause: error?.message || null }
    );
  } finally {
    signal?.removeEventListener('abort', abortWorker);
    unregisterCleanup();
    try {
      await worker?.terminate();
    } catch {
      // Best-effort worker cleanup.
    }
  }
}

async function readMediaMetadata(element, signal) {
  return raceWithAbort(new Promise((resolve) => {
    const finish = (readable) => {
      element.removeEventListener('loadedmetadata', onLoaded);
      element.removeEventListener('error', onError);
      resolve(readable);
    };
    const onLoaded = () => finish(true);
    const onError = () => finish(false);
    element.addEventListener('loadedmetadata', onLoaded, { once: true });
    element.addEventListener('error', onError, { once: true });
  }), signal);
}

export async function prepareMediaFile(file, options = {}) {
  requireBrowser('Local media preview');
  const { signal, onProgress, session } = options;
  assertFileSize(file, INTAKE_LIMITS.maxMediaBytes, 'audio/video');
  const classification = classifyLocalFile(file);
  if (classification.kind !== 'media') {
    throw new LabIntakeError('NOT_MEDIA_FILE', 'Choose a supported local audio or video file.');
  }
  throwIfAborted(signal);

  const objectUrl = URL.createObjectURL(file);
  session?.trackObjectUrl(objectUrl);
  const element = document.createElement(classification.mediaType);
  element.preload = 'metadata';
  element.src = objectUrl;
  emitProgress(onProgress, {
    phase: 'media',
    status: 'start',
    progress: 0,
    message: `Preparing a private local ${classification.mediaType} preview…`
  });
  let metadataReadable = false;
  try {
    metadataReadable = await readMediaMetadata(element, signal);
    throwIfAborted(signal);
  } catch (error) {
    if (!session) URL.revokeObjectURL(objectUrl);
    else session.releaseObjectUrl(objectUrl);
    throw error;
  }

  const durationMs = metadataReadable && Number.isFinite(element.duration)
    ? Math.round(element.duration * 1_000)
    : null;
  const descriptor = {
    schema: 'le-lab.local-media',
    schemaVersion: '1.0.0',
    id: `media-${stableHash(`${file.name}|${file.size}|${file.lastModified || ''}`)}`,
    mediaType: classification.mediaType,
    fileName: file.name || `Local ${classification.mediaType}`,
    mimeType: file.type || null,
    sizeBytes: file.size,
    durationMs,
    width: classification.mediaType === 'video' && metadataReadable ? element.videoWidth || null : null,
    height: classification.mediaType === 'video' && metadataReadable ? element.videoHeight || null : null,
    objectUrl,
    localOnly: true,
    analyzableText: false,
    requiresCompanionTranscript: true,
    transcription: SPEECH_TO_TEXT_CAPABILITY,
    warnings: metadataReadable ? [] : [{
      code: 'MEDIA_METADATA_UNREADABLE',
      message: 'The browser could not read this media format’s metadata. The local preview may not play, but a companion transcript can still be analyzed.',
      severity: 'warning'
    }],
    cleanup() {
      element.removeAttribute('src');
      element.load();
      if (session) session.releaseObjectUrl(objectUrl);
      else URL.revokeObjectURL(objectUrl);
    }
  };
  emitProgress(onProgress, {
    phase: 'media',
    status: metadataReadable ? 'success' : 'warning',
    progress: 1,
    message: `Local ${classification.mediaType} is ready. Add a transcript or subtitle file to analyze it.`,
    detail: {
      mediaId: descriptor.id,
      durationMs,
      metadataReadable,
      sourceUploaded: false
    }
  });
  return descriptor;
}

export function transcribeMedia() {
  throw new LabIntakeError(
    'LOCAL_STT_NOT_SHIPPED',
    SPEECH_TO_TEXT_CAPABILITY.reason,
    SPEECH_TO_TEXT_CAPABILITY
  );
}

export async function attachCompanionTranscript(media, transcriptFile, options = {}) {
  if (!media || media.schema !== 'le-lab.local-media') {
    throw new LabIntakeError('INVALID_MEDIA_DESCRIPTOR', 'Prepare the local media file before attaching its transcript.');
  }
  const transcriptClassification = classifyLocalFile(transcriptFile);
  if (transcriptClassification.kind !== 'text') {
    throw new LabIntakeError(
      'INVALID_COMPANION_TRANSCRIPT',
      'The companion must be TXT, MD, SRT, VTT, JSON, CSV, HTML, or RTF text—not another media file.'
    );
  }
  const transcript = await extractTextFile(transcriptFile, {
    ...options,
    title: options.title || titleFromFile({ name: media.fileName }),
    sourceType: 'companion-transcript'
  });
  const document = createNormalizedDocument({
    source: {
      title: options.title || titleFromFile({ name: media.fileName }),
      type: 'media-with-companion-transcript',
      url: options.url || null,
      fileName: media.fileName,
      mimeType: media.mimeType,
      media: {
        mediaType: media.mediaType,
        fileName: media.fileName,
        mimeType: media.mimeType,
        sizeBytes: media.sizeBytes,
        durationMs: media.durationMs,
        width: media.width,
        height: media.height,
        companionFileName: transcriptFile.name || null
      }
    },
    segments: transcript.segments,
    text: transcript.text,
    extraction: {
      method: `media-companion/${transcript.extraction.method}`,
      boundarySpace: transcript.extraction.boundarySpace,
      confidence: transcript.extraction.confidence,
      warnings: [
        ...transcript.extraction.warnings,
        {
          code: 'COMPANION_TRANSCRIPT',
          message: 'The Lab analyzed the companion transcript, not the audio/video track itself.',
          severity: 'info'
        },
        ...media.warnings
      ]
    }
  });
  emitProgress(options.onProgress, {
    phase: 'media-transcript',
    status: 'success',
    progress: 1,
    message: `Companion transcript linked to ${media.fileName} and normalized locally.`,
    detail: { mediaId: media.id, documentId: document.id }
  });
  return document;
}

export async function extractFile(file, options = {}) {
  const classification = classifyLocalFile(file);
  if (classification.kind === 'text') return extractTextFile(file, options);
  if (classification.kind === 'pdf') return extractPdfFile(file, options);
  if (classification.kind === 'image') return extractImageOcr(file, options);
  if (classification.kind === 'media') return prepareMediaFile(file, options);
  if (classification.kind === 'unsupported-document') {
    throw new LabIntakeError(
      'UNSUPPORTED_DOCUMENT_FORMAT',
      `${classification.format.toUpperCase()} extraction is not shipped in this static prototype. Export the document as PDF, HTML, Markdown, or plain text first.`,
      { format: classification.format }
    );
  }

  // Extensionless text files are common. Read only within the text limit and
  // let the binary guard in extractTextFile reject unsafe guesses.
  if (!file?.type && file?.size <= INTAKE_LIMITS.maxTextFileBytes) {
    return extractTextFile(file, options);
  }
  throw new LabIntakeError(
    'UNSUPPORTED_FILE_FORMAT',
    `${file?.name || 'This file'} is not a supported transcript, PDF, image, audio, or video format.`
  );
}

async function extractClipboardPayload({ text, image }, options) {
  if (text?.trim() && !options.preferImage) {
    return normalizeInput({
      text,
      format: 'auto',
      source: {
        title: options.title || 'Clipboard text',
        type: 'clipboard-text',
        url: options.url || null
      },
      extraction: { method: 'clipboard-text' }
    });
  }
  if (image) {
    return extractImageOcr(image, {
      ...options,
      title: options.title || 'Clipboard image'
    });
  }
  if (text?.trim()) {
    return normalizeInput({
      text,
      format: 'auto',
      source: {
        title: options.title || 'Clipboard text',
        type: 'clipboard-text',
        url: options.url || null
      },
      extraction: { method: 'clipboard-text' }
    });
  }
  throw new LabIntakeError(
    'EMPTY_CLIPBOARD',
    'The clipboard did not contain readable text or a supported image.'
  );
}

export async function extractClipboardEvent(event, options = {}) {
  const data = event?.clipboardData;
  if (!data) {
    throw new LabIntakeError('CLIPBOARD_EVENT_REQUIRED', 'No clipboard payload was available.');
  }
  const text = data.getData('text/plain');
  const imageItem = [...(data.items || [])].find((item) => item.type?.startsWith('image/'));
  const image = imageItem?.getAsFile() || null;
  return extractClipboardPayload({ text, image }, options);
}

export async function readSystemClipboard(options = {}) {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    throw new LabIntakeError(
      'CLIPBOARD_API_UNAVAILABLE',
      'Clipboard access is unavailable in this browser or non-secure context. Paste into the text box instead.'
    );
  }
  throwIfAborted(options.signal);
  try {
    if (typeof navigator.clipboard.read === 'function') {
      const items = await navigator.clipboard.read();
      let text = '';
      let image = null;
      for (const item of items) {
        if (!text && item.types.includes('text/plain')) {
          text = await (await item.getType('text/plain')).text();
        }
        const imageType = item.types.find((type) => type.startsWith('image/'));
        if (!image && imageType) image = await item.getType(imageType);
      }
      throwIfAborted(options.signal);
      return extractClipboardPayload({ text, image }, options);
    }
    if (typeof navigator.clipboard.readText === 'function') {
      const text = await navigator.clipboard.readText();
      throwIfAborted(options.signal);
      return extractClipboardPayload({ text, image: null }, options);
    }
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new LabIntakeError(
      'CLIPBOARD_PERMISSION_DENIED',
      'The browser did not grant clipboard access. Use Ctrl/Cmd+V in the text box or drop a file instead.',
      { cause: error?.message || null }
    );
  }
  throw new LabIntakeError(
    'CLIPBOARD_API_UNAVAILABLE',
    'This browser cannot read the clipboard directly. Paste into the text box instead.'
  );
}

function titleFromUrl(url, html = '') {
  if (html) {
    const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]
      ?.replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (title) return title.slice(0, 300);
  }
  try {
    const parsed = new URL(url);
    const finalPath = decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || '');
    return finalPath.replace(/[-_]+/g, ' ').replace(/\.[^.]+$/, '').trim()
      || parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'URL source';
  }
}

async function readLimitedResponse(response, { signal, onProgress }) {
  const declaredLength = Number(response.headers.get('content-length'));
  if (declaredLength > INTAKE_LIMITS.maxRemoteTextBytes) {
    throw new LabIntakeError(
      'REMOTE_SIZE_LIMIT_EXCEEDED',
      `The URL reports ${formatBytes(declaredLength)} of text. The browser limit is ${formatBytes(INTAKE_LIMITS.maxRemoteTextBytes)}.`
    );
  }
  if (!response.body?.getReader) {
    const text = await response.text();
    if (new Blob([text]).size > INTAKE_LIMITS.maxRemoteTextBytes) {
      throw new LabIntakeError('REMOTE_SIZE_LIMIT_EXCEEDED', 'The fetched page exceeded the browser text limit.');
    }
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: false });
  let total = 0;
  let text = '';
  try {
    while (true) {
      throwIfAborted(signal);
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > INTAKE_LIMITS.maxRemoteTextBytes) {
        await reader.cancel();
        throw new LabIntakeError(
          'REMOTE_SIZE_LIMIT_EXCEEDED',
          `The fetched page exceeded ${formatBytes(INTAKE_LIMITS.maxRemoteTextBytes)}.`
        );
      }
      text += decoder.decode(value, { stream: true });
      emitProgress(onProgress, {
        phase: 'url-fetch',
        progress: declaredLength ? total / declaredLength : null,
        message: `Reading the publisher response (${formatBytes(total)})…`,
        detail: { loadedBytes: total, totalBytes: declaredLength || null }
      });
    }
    text += decoder.decode();
    return text;
  } finally {
    reader.releaseLock();
  }
}

export async function extractUrlText(value, options = {}) {
  const { signal, onProgress } = options;
  const classification = classifySourceUrl(value);
  if (!classification.url) {
    throw new LabIntakeError('EMPTY_SOURCE_URL', 'Enter a source URL before fetching.');
  }
  if (!classification.canFetchText) {
    throw new LabIntakeError(
      'URL_TRANSCRIPT_REQUIRED',
      classification.guidance,
      { classification }
    );
  }
  if (typeof fetch !== 'function') {
    throw new LabIntakeError('FETCH_UNAVAILABLE', 'This browser cannot fetch URL text.');
  }

  throwIfAborted(signal);
  emitProgress(onProgress, {
    phase: 'url-fetch',
    status: 'start',
    progress: 0,
    message: 'Requesting the source page. No pasted transcript or local file is being sent.',
    detail: { url: classification.url, sourceContentUploaded: false }
  });
  let response;
  try {
    response = await fetch(classification.url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      signal
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new LabIntakeError(
      'URL_CORS_OR_NETWORK',
      'The page could not be read from this browser. The publisher may block cross-origin access; paste or upload its text and keep the URL as provenance.',
      { cause: error?.message || null, classification }
    );
  }
  if (!response.ok) {
    throw new LabIntakeError(
      'URL_HTTP_ERROR',
      `The source returned HTTP ${response.status}. Paste or upload the transcript instead.`,
      { status: response.status, classification }
    );
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (
    !contentType.startsWith('text/')
    && !contentType.includes('json')
    && !contentType.includes('xml')
    && !contentType.includes('xhtml')
  ) {
    throw new LabIntakeError(
      'URL_NON_TEXT_RESPONSE',
      `The URL returned ${contentType || 'a non-text file'}, not analyzable text. Add a transcript instead.`,
      { contentType, classification }
    );
  }
  const text = await readLimitedResponse(response, { signal, onProgress });
  throwIfAborted(signal);
  const finalUrl = canonicalizeUrl(response.url || classification.url);
  const fileName = new URL(finalUrl).pathname.split('/').pop() || '';
  let format = detectTextFormat({ fileName, mimeType: contentType, text });
  if (contentType.includes('html') || contentType.includes('xml')) format = 'html';
  const document = normalizeInput({
    text,
    format,
    source: {
      title: options.title || titleFromUrl(finalUrl, format === 'html' ? text : ''),
      type: classification.kind === 'rss' ? 'rss-url' : 'article-url',
      url: finalUrl,
      mimeType: contentType || null
    },
    extraction: {
      method: `cors-url-${format}`,
      warnings: [{
        code: 'URL_BROWSER_FETCH',
        message: 'The publisher allowed a browser-side CORS fetch. Page chrome may remain in the extracted text; review the Source view.',
        severity: 'info'
      }]
    }
  });
  emitProgress(onProgress, {
    phase: 'url-fetch',
    status: 'success',
    progress: 1,
    message: `Recovered ${document.stats.words.toLocaleString()} words from the URL.`,
    detail: { documentId: document.id, finalUrl, format }
  });
  return document;
}
