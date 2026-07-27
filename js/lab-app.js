import {
  LabIntakeError,
  applyOptionalSourceMetadata,
  assessSourceInputReadiness,
  classifyLocalFile,
  countWords,
  normalizeInput,
  validSourceProvenanceUrl,
  validateNormalizedDocument,
} from './lab-intake.js?v=1.7';
import {
  ExtractionSession,
  attachCompanionTranscript,
  extractClipboardEvent,
  extractFile,
  extractUrlText,
  readSystemClipboard,
} from './lab-extractors.js?v=1.7';
import { createDemoDocument } from './lab-demo.js?v=1.7';
import { LabAnalyzerClient } from './lab-analyzer-client.js?v=1.7';
import {
  analysisToJson,
  analysisToMarkdown,
  downloadTextFile,
  exportFileName,
  researchQueueToMarkdown,
} from './lab-export.js?v=1.7';

const CANON_INDEX_URL = 'data/le-canon-index.json?v=1.7';
const MAX_RENDERED_CITATIONS = 160;
const MAX_RENDERED_SOURCE_SEGMENTS = 500;
const MAX_RENDERED_LEDGER_ROWS = 300;
const MAX_RENDERED_TRIAGE_ROWS = 120;

const app = document.getElementById('lab-app');
if (!app) throw new Error('LE Lab root was not found.');

function byId(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`LE Lab expected #${id}.`);
  return element;
}

const ui = {
  form: byId('lab-intake-form'),
  sourceTitle: byId('lab-source-title'),
  sourceUrl: byId('lab-source-url'),
  urlNote: byId('lab-url-note'),
  text: byId('lab-text-input'),
  textCount: byId('lab-text-count'),
  pasteButton: byId('lab-paste-button'),
  clearText: byId('lab-clear-text'),
  fileInput: byId('lab-file-input'),
  dropZone: byId('lab-drop-zone'),
  dropStatus: byId('lab-drop-status'),
  fileSummary: byId('lab-file-summary'),
  fileName: byId('lab-file-name'),
  fileMeta: byId('lab-file-meta'),
  removeFile: byId('lab-remove-file'),
  companionInput: byId('lab-companion-input'),
  companionStatus: byId('lab-companion-status'),
  mediaCompanion: byId('lab-media-companion'),
  mediaPreview: byId('lab-media-preview'),
  intakeStatus: byId('lab-intake-status-message'),
  progressWrap: byId('lab-progress-wrap'),
  progressLabel: byId('lab-intake-progress-label'),
  progressValue: byId('lab-intake-progress-value'),
  progress: byId('lab-intake-progress'),
  intakeWarnings: byId('lab-intake-warnings'),
  intakeError: byId('lab-intake-error'),
  intakeErrorMessage: byId('lab-intake-error-message'),
  analyze: byId('lab-analyze'),
  cancel: byId('lab-cancel'),
  reset: byId('lab-reset'),
  readyNote: byId('lab-ready-note'),
  loadDemo: byId('lab-load-demo'),
  workspace: byId('lab-workspace'),
  workspaceSubtitle: byId('lab-workspace-subtitle'),
  analysisStatusDetail: byId('lab-analysis-status-detail'),
  analysisProgressWrap: byId('lab-analysis-progress-wrap'),
  analysisProgress: byId('lab-analysis-progress'),
  indexMeta: byId('lab-index-meta'),
  schemaMeta: byId('lab-schema-meta'),
  analysisMode: byId('lab-analysis-mode'),
  metricWords: byId('lab-metric-words'),
  metricSegments: byId('lab-metric-segments'),
  metricClaims: byId('lab-metric-claims'),
  metricCoverage: byId('lab-metric-coverage'),
  triage: byId('lab-triage'),
  triageHeadline: byId('lab-triage-headline'),
  triageList: byId('lab-triage-list'),
  copyMarkdown: byId('lab-copy-markdown'),
  downloadMarkdown: byId('lab-download-markdown'),
  downloadJson: byId('lab-download-json'),
  exportResearch: byId('lab-export-research'),
  citationCount: byId('lab-citation-count'),
  pressureCount: byId('lab-pressure-count'),
  researchCount: byId('lab-research-count'),
  flowSource: byId('lab-flow-source-count'),
  flowClaims: byId('lab-flow-claims-count'),
  flowCanon: byId('lab-flow-canon-count'),
  flowTension: byId('lab-flow-tension-count'),
  flowUnmapped: byId('lab-flow-unmapped-count'),
  flowSourceLabel: byId('lab-flow-source-label'),
  categorySpectrum: byId('lab-category-spectrum'),
  dominantCategory: byId('lab-dominant-category'),
  coverageReadout: byId('lab-coverage-readout'),
  coverageLabel: byId('lab-coverage-label'),
  coverageTrack: byId('lab-coverage-track'),
  coverageFill: byId('lab-coverage-fill'),
  coverageMarker: byId('lab-coverage-marker'),
  mapSummary: byId('lab-map-summary'),
  mapTableBody: byId('lab-map-table-body'),
  alignmentDistribution: byId('lab-alignment-distribution'),
  evidenceDistribution: byId('lab-evidence-distribution'),
  citationsEmpty: byId('lab-citations-empty'),
  citationsList: byId('lab-citations-list'),
  pressureSummary: byId('lab-pressure-summary'),
  pressureList: byId('lab-pressure-list'),
  researchEmpty: byId('lab-research-empty'),
  researchEmptyTitle: byId('lab-research-empty-title'),
  researchEmptyCopy: byId('lab-research-empty-copy'),
  researchList: byId('lab-research-list'),
  sourceMetaTitle: byId('lab-source-meta-title'),
  sourceMetaType: byId('lab-source-meta-type'),
  sourceMetaMethod: byId('lab-source-meta-method'),
  sourceMetaSpeakers: byId('lab-source-meta-speakers'),
  sourceMetaUrl: byId('lab-source-meta-url'),
  sourceMetaSchema: byId('lab-source-meta-schema'),
  sourceWarnings: byId('lab-source-warnings'),
  extractionWarnings: byId('lab-extraction-warnings'),
  sourceEmpty: byId('lab-source-empty'),
  sourceSegments: byId('lab-source-segments'),
  categoryTemplate: byId('lab-category-bar-template'),
  citationTemplate: byId('lab-citation-template'),
  pressureTemplate: byId('lab-pressure-template'),
  researchTemplate: byId('lab-research-template'),
  sourceSegmentTemplate: byId('lab-source-segment-template'),
  warningTemplate: byId('lab-warning-template'),
};

const state = {
  canonIndex: null,
  canonById: new Map(),
  normalizedDocument: null,
  activeInput: null,
  sourceFile: null,
  companionFile: null,
  media: null,
  analysis: null,
  workController: null,
  busy: false,
  resetSequence: 0,
  domainOverrides: new Map(),
  lastAnalyzedDocumentId: null,
};

const analyzer = new LabAnalyzerClient();
const extractionSession = new ExtractionSession({ onProgress: handleExtractionProgress });

function textValue(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return 'unknown size';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex ? 1 : 0)} ${units[unitIndex]}`;
}

function formatTimestamp(milliseconds) {
  if (!Number.isFinite(milliseconds)) return '';
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function warningMessage(warning) {
  return typeof warning === 'string'
    ? warning
    : warning?.message || 'Unknown extraction warning.';
}

function clearNode(node) {
  node.replaceChildren();
}

function setText(node, value, fallback = '—') {
  node.textContent = value == null || value === '' ? fallback : String(value);
}

function addPill(container, label) {
  if (!label) return;
  const pill = document.createElement('span');
  pill.textContent = label;
  container.appendChild(pill);
}

function setLabState(nextState, detail = '') {
  app.dataset.labState = nextState;
  ui.workspace.setAttribute('aria-busy', ['extracting', 'analyzing'].includes(nextState) ? 'true' : 'false');
  if (detail) ui.analysisStatusDetail.textContent = detail;
}

function setBusy(busy, phase = '') {
  state.busy = busy;
  ui.cancel.hidden = !busy;
  ui.analyze.disabled = busy || !hasPotentialInput() || !state.canonIndex;
  ui.loadDemo.disabled = busy;
  ui.fileInput.disabled = busy;
  ui.companionInput.disabled = busy;
  ui.pasteButton.disabled = busy;
  ui.dropZone.disabled = busy;
  ui.analysisProgressWrap.hidden = !(busy && phase === 'analyzing');
  if (!busy) {
    ui.analysisProgress.value = 0;
    ui.analysisProgressWrap.hidden = true;
  }
  refreshReadyState();
}

function showError(error, { analysisFailure = false } = {}) {
  const message = error instanceof LabIntakeError
    ? error.message
    : error?.message || 'The operation stopped unexpectedly.';
  ui.intakeError.hidden = false;
  ui.intakeErrorMessage.textContent = message;
  ui.intakeStatus.textContent = 'The source needs attention.';
  if (analysisFailure) setLabState('failure', message);
}

function clearError() {
  ui.intakeError.hidden = true;
  ui.intakeErrorMessage.textContent = '';
}

function renderWarnings(warnings = []) {
  clearNode(ui.intakeWarnings);
  warnings.slice(0, 12).forEach((warning) => {
    const fragment = ui.warningTemplate.content.cloneNode(true);
    fragment.querySelector('[data-field="message"]').textContent = warningMessage(warning);
    ui.intakeWarnings.appendChild(fragment);
  });
  if (warnings.length > 12) {
    const item = document.createElement('li');
    const icon = document.createElement('i');
    icon.className = 'ti ti-alert-circle';
    icon.setAttribute('aria-hidden', 'true');
    const span = document.createElement('span');
    span.textContent = `${warnings.length - 12} more warning(s) are preserved in the exports.`;
    item.append(icon, span);
    ui.intakeWarnings.appendChild(item);
  }
}

function handleExtractionProgress(event) {
  if (!event) return;
  const progress = Number.isFinite(event.progress) ? Math.round(event.progress * 100) : null;
  ui.progressWrap.hidden = event.status === 'success' || event.status === 'cancelled';
  ui.progress.removeAttribute('value');
  if (progress != null) {
    ui.progress.value = progress;
    ui.progressValue.textContent = `${progress}%`;
  } else {
    ui.progressValue.textContent = 'working';
  }
  ui.progressLabel.textContent = event.message || 'Preparing source…';
  ui.intakeStatus.textContent = event.message || 'Preparing source…';
  if (state.busy && app.dataset.labState === 'extracting') {
    ui.analysisStatusDetail.textContent = event.message || 'Extracting source text locally.';
  }
}

function handleAnalysisProgress(progress) {
  const value = Math.round(Math.max(0, Math.min(1, progress?.value || 0)) * 100);
  ui.analysisProgress.value = value;
  ui.analysisStatusDetail.textContent = progress?.message || 'Tracing claims through the canon.';
  ui.intakeStatus.textContent = progress?.message || 'Analyzing source locally.';
}

function currentInputReadiness() {
  return assessSourceInputReadiness({
    text: ui.text.value,
    normalizedDocument: state.normalizedDocument,
    sourceUrl: ui.sourceUrl.value,
    companionFile: state.companionFile,
  });
}

function hasPotentialInput(readiness = currentInputReadiness()) {
  return readiness.canAnalyze;
}

function renderUrlGuidance(readiness) {
  const value = ui.sourceUrl.value.trim();
  if (!value) {
    ui.urlNote.textContent = 'A URL alone is not a transcript. If the browser cannot retrieve usable text, the Lab keeps the link and asks you to paste or attach the transcript.';
    return;
  }
  if (readiness.urlError) {
    ui.urlNote.textContent = readiness.metadataUrlWarning
      ? `${readiness.urlError.message} The source can still be analyzed; this value will not be included as provenance.`
      : readiness.urlError.message;
    return;
  }
  const classification = readiness.classification;
  ui.urlNote.textContent = classification.guidance || (
    classification.canFetchText
      ? 'The Lab can attempt a browser-side text fetch. Publisher CORS rules still decide whether it succeeds.'
      : 'Keep this link as provenance and paste or attach the transcript.'
  );
}

function refreshReadyState(readiness = currentInputReadiness()) {
  renderUrlGuidance(readiness);
  const words = countWords(ui.text.value);
  ui.textCount.textContent = `${formatNumber(words)} ${words === 1 ? 'word' : 'words'}`;
  const canAnalyze = hasPotentialInput(readiness) && Boolean(state.canonIndex) && !state.busy;
  ui.analyze.disabled = !canAnalyze;

  if (!state.canonIndex) {
    ui.readyNote.textContent = 'The canon index must load before analysis.';
  } else if (readiness.urlError) {
    ui.readyNote.textContent = readiness.metadataUrlWarning
      ? 'The source is ready to analyze, but this URL is invalid and will be omitted from provenance.'
      : readiness.urlError.message;
  } else if (state.media && !state.normalizedDocument) {
    ui.readyNote.textContent = 'Attach a companion transcript; media alone is not analyzable text.';
  } else if (state.normalizedDocument && state.activeInput === 'document') {
    ui.readyNote.textContent = `${formatNumber(state.normalizedDocument.stats.words)} words normalized and ready.`;
  } else if (ui.text.value.trim()) {
    ui.readyNote.textContent = `${formatNumber(words)} pasted words ready to normalize.`;
  } else if (ui.sourceUrl.value.trim()) {
    ui.readyNote.textContent = readiness.classification.canFetchText
      ? 'The Lab will make an explicit request to this publisher and analyze usable returned text locally.'
      : readiness.classification.guidance;
  } else {
    ui.readyNote.textContent = 'Add analyzable text to begin.';
  }
}

function updateUrlGuidance() {
  refreshReadyState(currentInputReadiness());
}

function documentWithCurrentProvenance(documentValue) {
  return applyOptionalSourceMetadata(documentValue, {
    title: ui.sourceTitle.value,
    sourceUrl: ui.sourceUrl.value,
  });
}

function updateLoadedDocument(documentValue, { inputKind = 'document', announce = true } = {}) {
  const validation = validateNormalizedDocument(documentValue);
  if (!validation.valid) {
    throw new LabIntakeError('INVALID_NORMALIZED_DOCUMENT', validation.errors.join(' '));
  }
  const loadedDocument = documentWithCurrentProvenance(documentValue);
  state.normalizedDocument = loadedDocument;
  state.activeInput = inputKind;
  if (!ui.sourceTitle.value.trim()) ui.sourceTitle.value = loadedDocument.source.title;
  const existingUrl = validSourceProvenanceUrl(loadedDocument.source.url);
  if (!ui.sourceUrl.value.trim() && existingUrl) ui.sourceUrl.value = existingUrl;
  renderNormalizedDocument(loadedDocument);
  renderWarnings(loadedDocument.extraction.warnings);
  if (announce) {
    ui.intakeStatus.textContent = `${formatNumber(loadedDocument.stats.words)} words normalized locally.`;
    setLabState('empty', 'A normalized source is ready. Nothing has been analyzed yet.');
  }
  refreshReadyState();
  return loadedDocument;
}

function setFileSummary(file, classification) {
  state.sourceFile = file;
  ui.fileSummary.hidden = false;
  ui.fileName.textContent = file.name || 'Local source';
  const kind = classification.mediaType || classification.kind;
  ui.fileMeta.textContent = `${kind} · ${formatBytes(file.size)}`;
  ui.dropStatus.textContent = `${file.name || 'Source'} selected.`;
}

function clearFileSummary() {
  state.sourceFile = null;
  ui.fileInput.value = '';
  ui.fileSummary.hidden = true;
  ui.fileName.textContent = '';
  ui.fileMeta.textContent = '';
  ui.dropStatus.textContent = 'Nothing selected.';
}

function renderMediaPreview(media) {
  clearNode(ui.mediaPreview);
  if (!media) {
    ui.mediaPreview.hidden = true;
    return;
  }
  const element = document.createElement(media.mediaType === 'video' ? 'video' : 'audio');
  element.controls = true;
  element.preload = 'metadata';
  element.src = media.objectUrl;
  element.setAttribute('aria-label', `Private local preview of ${media.fileName}`);
  if (media.mediaType === 'video') element.playsInline = true;
  const note = document.createElement('p');
  note.textContent = 'Local preview only · no media was uploaded';
  ui.mediaPreview.append(element, note);
  ui.mediaPreview.hidden = false;
  ui.mediaCompanion.open = true;
}

async function removeCurrentMedia() {
  if (!state.media) return;
  try {
    state.media.cleanup();
  } catch {
    // Object URL cleanup is best effort and repeated by session.reset().
  }
  state.media = null;
  state.companionFile = null;
  ui.companionInput.value = '';
  ui.companionStatus.textContent = 'No companion transcript attached.';
  renderMediaPreview(null);
}

async function prepareSelectedFile(file) {
  if (!file || state.busy) return;
  clearError();
  renderWarnings([]);
  await removeCurrentMedia();
  state.normalizedDocument = null;
  state.activeInput = 'file';
  const classification = classifyLocalFile(file);
  setFileSummary(file, classification);
  setLabState('extracting', `Preparing ${file.name || 'local source'} on this device.`);
  setBusy(true, 'extracting');
  ui.progressWrap.hidden = false;
  const signal = extractionSession.begin();
  try {
    const extracted = await extractFile(file, {
      signal,
      session: extractionSession,
      onProgress: handleExtractionProgress,
      title: ui.sourceTitle.value.trim() || undefined,
      url: currentInputReadiness().provenanceUrl,
    });
    if (extracted?.schema === 'le-lab.local-media') {
      state.media = extracted;
      state.activeInput = 'media';
      renderMediaPreview(extracted);
      renderWarnings(extracted.warnings);
      ui.companionStatus.textContent = 'Add a transcript or subtitle file to analyze this media.';
      ui.intakeStatus.textContent = 'Private media preview ready; no speech-to-text claim was made.';
      setLabState('empty', 'Media metadata is ready. A companion transcript is still required.');
    } else {
      updateLoadedDocument(extracted);
    }
  } catch (error) {
    if (error?.name !== 'AbortError') showError(error, { analysisFailure: true });
  } finally {
    ui.progressWrap.hidden = true;
    setBusy(false);
  }
}

async function prepareCompanion(file) {
  if (!file || !state.media || state.busy) {
    if (file && !state.media) showError(new LabIntakeError('MEDIA_REQUIRED', 'Choose a local audio or video file before adding its companion transcript.'));
    return;
  }
  clearError();
  state.companionFile = file;
  ui.companionStatus.textContent = `${file.name} selected; preparing locally…`;
  setLabState('extracting', `Linking ${file.name} to the local media source.`);
  setBusy(true, 'extracting');
  ui.progressWrap.hidden = false;
  const signal = extractionSession.begin();
  try {
    const documentValue = await attachCompanionTranscript(state.media, file, {
      signal,
      session: extractionSession,
      onProgress: handleExtractionProgress,
      title: ui.sourceTitle.value.trim() || undefined,
      url: currentInputReadiness().provenanceUrl,
    });
    state.activeInput = 'document';
    ui.companionStatus.textContent = `${file.name} linked · ${formatNumber(documentValue.stats.words)} analyzable words.`;
    updateLoadedDocument(documentValue);
  } catch (error) {
    state.companionFile = null;
    ui.companionInput.value = '';
    ui.companionStatus.textContent = 'No companion transcript attached.';
    if (error?.name !== 'AbortError') showError(error, { analysisFailure: true });
  } finally {
    ui.progressWrap.hidden = true;
    setBusy(false);
  }
}

async function prepareClipboard({ event = null } = {}) {
  if (state.busy) return;
  clearError();
  setLabState('extracting', 'Reading the clipboard locally.');
  setBusy(true, 'extracting');
  ui.progressWrap.hidden = false;
  const signal = extractionSession.begin();
  try {
    const documentValue = event
      ? await extractClipboardEvent(event, {
        signal,
        session: extractionSession,
        onProgress: handleExtractionProgress,
        preferImage: true,
        title: ui.sourceTitle.value.trim() || undefined,
        url: currentInputReadiness().provenanceUrl,
      })
      : await readSystemClipboard({
        signal,
        session: extractionSession,
        onProgress: handleExtractionProgress,
        title: ui.sourceTitle.value.trim() || undefined,
        url: currentInputReadiness().provenanceUrl,
      });
    if (documentValue.source.type === 'clipboard-text') {
      ui.text.value = documentValue.text;
      state.activeInput = 'text';
    }
    updateLoadedDocument(documentValue, { inputKind: documentValue.source.type === 'clipboard-text' ? 'text' : 'document' });
  } catch (error) {
    if (error?.name !== 'AbortError') showError(error, { analysisFailure: true });
  } finally {
    ui.progressWrap.hidden = true;
    setBusy(false);
  }
}

async function documentForAnalysis() {
  const pastedText = ui.text.value.trim();
  const readiness = currentInputReadiness();
  if (pastedText && (state.activeInput === 'text' || !state.normalizedDocument)) {
    const documentValue = normalizeInput({
      text: pastedText,
      format: 'auto',
      source: {
        title: ui.sourceTitle.value.trim() || 'Pasted commentary',
        type: 'pasted-text',
        url: readiness.provenanceUrl,
      },
      extraction: { method: 'direct-text' },
    });
    return updateLoadedDocument(documentValue, { inputKind: 'text', announce: false });
  }
  if (state.normalizedDocument) return documentWithCurrentProvenance(state.normalizedDocument);
  if (state.media) {
    throw new LabIntakeError(
      'MEDIA_TRANSCRIPT_REQUIRED',
      'The local media is previewable, but there is no analyzable transcript. Attach TXT, MD, SRT, VTT, JSON, or CSV first.',
    );
  }
  if (readiness.retrievalEligible) {
    setLabState('extracting', 'Attempting an explicit browser-side text fetch.');
    const signal = extractionSession.begin();
    const documentValue = await extractUrlText(readiness.provenanceUrl, {
      signal,
      onProgress: handleExtractionProgress,
      title: ui.sourceTitle.value.trim() || undefined,
    });
    return updateLoadedDocument(documentValue, { inputKind: 'document', announce: false });
  }
  if (readiness.blockingUrlError) throw readiness.blockingUrlError;
  if (readiness.classification?.requiresTranscript) {
    throw new LabIntakeError(
      'URL_TRANSCRIPT_REQUIRED',
      readiness.classification.guidance || 'This source URL needs transcript text before it can be analyzed.'
    );
  }
  throw new LabIntakeError('EMPTY_INPUT', 'Paste text, choose a supported file, or provide a fetchable article URL before analyzing.');
}

function field(fragment, name) {
  const node = fragment.querySelector(`[data-field="${name}"]`);
  if (!node) throw new Error(`Template field ${name} is missing.`);
  return node;
}

function confidenceLabel(match) {
  return `${match.confidence} · ${Math.round(Number(match.score || match.bestScore || 0) * 100)}/100`;
}

function segmentReference(unit) {
  const parts = [
    unit?.speaker,
    formatTimestamp(unit?.startMs ?? unit?.startTime),
    unit?.id,
  ].filter(Boolean);
  return parts.join(' · ');
}

function renderCategorySpectrum(distribution) {
  clearNode(ui.categorySpectrum);
  if (!distribution.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No mapped canon category cleared the credible threshold.';
    ui.categorySpectrum.appendChild(empty);
    ui.dominantCategory.textContent = 'No concentration';
    return;
  }
  ui.dominantCategory.textContent = `${distribution[0].label} leads · ${distribution[0].sharePct}%`;
  distribution.slice(0, 7).forEach((item) => {
    const fragment = ui.categoryTemplate.content.cloneNode(true);
    field(fragment, 'category').textContent = item.label;
    field(fragment, 'count').textContent = `${item.count} · ${item.sharePct}%`;
    field(fragment, 'bar').style.width = `${Math.max(2, item.sharePct)}%`;
    ui.categorySpectrum.appendChild(fragment);
  });
}

function renderDistribution(container, items, labelFormatter = (item) => `${item.label} · ${item.count}`) {
  clearNode(container);
  if (!items.length) {
    const empty = document.createElement('p');
    empty.textContent = 'No distribution to show.';
    container.appendChild(empty);
    return;
  }
  items.forEach((item) => addPill(container, labelFormatter(item)));
}

function alignmentDistribution(result) {
  const counts = new Map();
  result.segments
    .filter((segment) => segment.mapped && segment.matches[0])
    .forEach((segment) => {
      const label = segment.matches[0].alignment.label;
      counts.set(label, (counts.get(label) || 0) + 1);
    });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function triageChip(label, variant = '') {
  const chip = document.createElement('span');
  chip.className = `lab-triage-chip${variant ? ` is-${variant}` : ''}`;
  chip.textContent = label;
  return chip;
}

function triageButton(label, ariaLabel, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'lab-triage-button';
  button.textContent = label;
  button.setAttribute('aria-label', ariaLabel);
  button.addEventListener('click', onClick);
  return button;
}

async function setDomainOverride(unitId, action) {
  if (state.busy) return;
  if (!action) state.domainOverrides.delete(unitId);
  else state.domainOverrides.set(unitId, action);
  await runAnalysis();
}

function renderTriage(result) {
  const relevance = result.domainRelevance || {};
  const ignored = relevance.ignoredPassages || [];
  const applied = relevance.overrides?.applied || [];
  const includes = applied.filter((override) => override.action === 'include').length;
  const excludes = applied.filter((override) => override.action === 'exclude').length;
  const wasOpen = ui.triage.open;
  ui.triage.hidden = !ignored.length && !applied.length;
  ui.triage.open = wasOpen && !ui.triage.hidden;

  const parts = [];
  parts.push(ignored.length
    ? `${formatNumber(ignored.length)} passage${ignored.length === 1 ? '' : 's'} set aside as non-domain (${formatNumber(relevance.ignoredWords || 0)} words)`
    : 'No passages are currently set aside as non-domain');
  if (includes) parts.push(`${formatNumber(includes)} re-included by you`);
  if (excludes) parts.push(`${formatNumber(excludes)} excluded by you`);
  ui.triageHeadline.textContent = `${parts.join(' · ')}. Original text remains intact in Source.`;

  clearNode(ui.triageList);
  ignored.slice(0, MAX_RENDERED_TRIAGE_ROWS).forEach((passage) => {
    const item = document.createElement('li');
    item.className = 'lab-triage-item';

    const head = document.createElement('div');
    head.className = 'lab-triage-item-head';
    head.appendChild(triageChip(
      passage.overridden ? 'Excluded by you' : passage.reasonLabel,
      passage.overridden ? 'override' : 'machine',
    ));
    const reference = document.createElement('span');
    reference.className = 'lab-triage-ref';
    reference.textContent = segmentReference({
      speaker: passage.location?.speaker,
      startTime: passage.location?.startTime,
      id: passage.segmentId,
    });
    head.appendChild(reference);
    item.appendChild(head);

    const excerpt = document.createElement('p');
    excerpt.className = 'lab-triage-excerpt';
    excerpt.textContent = passage.excerpt;
    item.appendChild(excerpt);

    const frames = (passage.frameEvidence || [])
      .filter((evidence) => evidence.frame !== 'override');
    if (!passage.overridden && frames.length) {
      const evidenceLine = document.createElement('p');
      evidenceLine.className = 'lab-triage-evidence';
      evidenceLine.textContent = `Decision frames: ${[...new Set(frames.map((evidence) => evidence.label))].slice(0, 3).join(' · ')}`;
      item.appendChild(evidenceLine);
    }

    const shortExcerpt = truncateLabel(passage.excerpt, 60);
    item.appendChild(passage.overridden
      ? triageButton('Undo exclude', `Undo your exclusion of “${shortExcerpt}”`, () => setDomainOverride(passage.segmentId, null))
      : triageButton('Include in analysis', `Include “${shortExcerpt}” in the analysis`, () => setDomainOverride(passage.segmentId, 'include')));
    ui.triageList.appendChild(item);
  });
  if (ignored.length > MAX_RENDERED_TRIAGE_ROWS) {
    const item = document.createElement('li');
    item.className = 'lab-triage-item';
    const note = document.createElement('p');
    note.textContent = `${formatNumber(ignored.length - MAX_RENDERED_TRIAGE_ROWS)} additional set-aside passages are preserved in the JSON export.`;
    item.appendChild(note);
    ui.triageList.appendChild(item);
  }
}

function truncateLabel(value, limit) {
  const text = String(value || '');
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text;
}

function renderLedger(result) {
  clearNode(ui.mapTableBody);
  const claims = result.segments.filter((segment) => segment.unit.isClaimLike);
  const noDomainClaims = claims.length === 0 && result.metrics.ignoredDomainSegments > 0;
  claims.slice(0, MAX_RENDERED_LEDGER_ROWS).forEach((segment) => {
    const row = document.createElement('tr');
    const refCell = document.createElement('td');
    const excerptCell = document.createElement('td');
    const alignmentCell = document.createElement('td');
    const connectionCell = document.createElement('td');
    const confidenceCell = document.createElement('td');
    const triageCell = document.createElement('td');
    triageCell.className = 'lab-triage-cell';
    refCell.textContent = segmentReference(segment.unit);
    excerptCell.textContent = segment.unit.text;
    const relevance = segment.unit.domainRelevance || {};
    const shortExcerpt = truncateLabel(segment.unit.text, 60);
    if (relevance.override === 'include') {
      triageCell.appendChild(triageChip('Included by you', 'override'));
      triageCell.appendChild(triageButton('Undo', `Undo your inclusion of “${shortExcerpt}”`, () => setDomainOverride(segment.unit.id, null)));
    } else {
      if (relevance.status === 'uncertain') {
        triageCell.appendChild(triageChip('Uncertain · retained', 'uncertain'));
      }
      triageCell.appendChild(triageButton('Exclude', `Exclude “${shortExcerpt}” from the analysis`, () => setDomainOverride(segment.unit.id, 'exclude')));
    }
    if (segment.mapped) {
      const primary = segment.matches[0];
      alignmentCell.textContent = primary.alignment.label;
      const link = document.createElement('a');
      link.href = primary.href;
      link.textContent = primary.title;
      connectionCell.appendChild(link);
      if (segment.matches.length > 1) {
        connectionCell.appendChild(document.createTextNode(` + ${segment.matches.length - 1} adjacent`));
      }
      confidenceCell.textContent = confidenceLabel(primary);
    } else {
      alignmentCell.textContent = 'Unmapped';
      connectionCell.textContent = segment.weakMatches?.[0]
        ? `Nearest: ${segment.weakMatches[0].title}`
        : 'No credible match';
      confidenceCell.textContent = segment.weakMatches?.[0]
        ? `Below threshold · ${Math.round(segment.weakMatches[0].score * 100)}/100`
        : '—';
    }
    row.append(refCell, excerptCell, alignmentCell, connectionCell, confidenceCell, triageCell);
    ui.mapTableBody.appendChild(row);
  });
  if (claims.length > MAX_RENDERED_LEDGER_ROWS) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = `${formatNumber(claims.length - MAX_RENDERED_LEDGER_ROWS)} additional rows are preserved in the Markdown and JSON exports.`;
    row.appendChild(cell);
    ui.mapTableBody.appendChild(row);
  }
  if (!claims.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 6;
    cell.textContent = noDomainClaims
      ? 'No relationship-domain claims were detected in this source.'
      : 'No claim-like passages were detected.';
    row.appendChild(cell);
    ui.mapTableBody.appendChild(row);
  }
  ui.mapSummary.textContent = noDomainClaims
    ? 'No relationship-domain claims were detected in this source.'
    : `${formatNumber(result.metrics.mappedClaimSegments)} of ${formatNumber(result.metrics.claimLikeSegments)} claim-like segments mapped credibly.`;
}

function relatedTitle(id) {
  const entry = state.canonById.get(id);
  return entry?.title || id;
}

function renderCitations(result) {
  clearNode(ui.citationsList);
  const cards = [];
  result.segments.forEach((segment) => {
    segment.matches.forEach((match) => cards.push({ segment, match }));
  });
  ui.citationsEmpty.hidden = cards.length > 0;
  cards.slice(0, MAX_RENDERED_CITATIONS).forEach(({ segment, match }) => {
    const fragment = ui.citationTemplate.content.cloneNode(true);
    field(fragment, 'alignment').textContent = match.alignment.label;
    field(fragment, 'confidence').textContent = confidenceLabel(match);
    field(fragment, 'segment-ref').textContent = segmentReference(segment.unit);
    field(fragment, 'excerpt').textContent = segment.unit.text;
    field(fragment, 'category').textContent = [match.category, match.subcategory].filter(Boolean).join(' · ');
    const link = field(fragment, 'canon-link');
    link.href = match.href;
    field(fragment, 'canon-title').textContent = match.title;
    field(fragment, 'canon-synopsis').textContent = match.synopsis;
    const badges = field(fragment, 'evidence-badges');
    addPill(badges, match.evidenceType);
    addPill(badges, `${Math.round(match.score * 100)}/100 lexical score`);
    const trace = [...(match.whyMatched || []), match.why].filter(Boolean).join(' · ');
    field(fragment, 'reason').textContent = trace;

    const adjacent = field(fragment, 'adjacent');
    const adjacentIds = [...new Set([...(match.dependencies || []), ...(match.related || [])])];
    if (adjacentIds.length) {
      adjacent.textContent = `Adjacent doctrine: ${adjacentIds.slice(0, 6).map(relatedTitle).join(' · ')}`;
    } else {
      adjacent.hidden = true;
    }

    const sources = field(fragment, 'external-sources');
    (match.sourceLinks || []).forEach((source) => {
      const item = document.createElement('li');
      const sourceLink = document.createElement('a');
      sourceLink.href = source.url;
      sourceLink.target = '_blank';
      sourceLink.rel = 'noopener noreferrer';
      sourceLink.textContent = source.label;
      item.appendChild(sourceLink);
      sources.appendChild(item);
    });
    if (!sources.childElementCount) sources.hidden = true;
    ui.citationsList.appendChild(fragment);
  });
  if (cards.length > MAX_RENDERED_CITATIONS) {
    const note = document.createElement('p');
    note.className = 'lab-render-limit-note';
    note.textContent = `${formatNumber(cards.length - MAX_RENDERED_CITATIONS)} additional match cards are preserved in exports.`;
    ui.citationsList.appendChild(note);
  }
  ui.citationCount.textContent = formatNumber(cards.length);
}

function renderPressureTests(result) {
  clearNode(ui.pressureList);
  const pressures = result.pressureTests || [];
  if (!pressures.length) {
    ui.pressureSummary.textContent = '';
    const icon = document.createElement('i');
    icon.className = 'ti ti-gauge';
    icon.setAttribute('aria-hidden', 'true');
    const paragraph = document.createElement('p');
    paragraph.textContent = 'No prioritized reasoning failure was triggered. That is not a declaration that the source is correct.';
    ui.pressureSummary.append(icon, paragraph);
  } else {
    ui.pressureSummary.textContent = '';
    const icon = document.createElement('i');
    icon.className = 'ti ti-gauge';
    icon.setAttribute('aria-hidden', 'true');
    const paragraph = document.createElement('p');
    paragraph.textContent = `${formatNumber(pressures.length)} prioritized tension${pressures.length === 1 ? '' : 's'} surfaced. Flags ask for evidence; they do not automatically convict the source.`;
    ui.pressureSummary.append(icon, paragraph);
  }
  pressures.forEach((pressure, index) => {
    const fragment = ui.pressureTemplate.content.cloneNode(true);
    field(fragment, 'priority').textContent = `Priority ${index + 1}`;
    field(fragment, 'segment-ref').textContent = pressure.segmentId;
    field(fragment, 'title').textContent = pressure.failureMode;
    field(fragment, 'excerpt').textContent = pressure.sourceExcerpt;
    field(fragment, 'canon-rule').textContent = `${pressure.canonRule.title}: ${pressure.canonRule.synopsis}`;
    field(fragment, 'boundaries').textContent = pressure.boundaryConditions.join(' · ');
    field(fragment, 'strain-scenario').textContent = pressure.strainScenario;
    field(fragment, 'change-evidence').textContent = pressure.evidenceThatWouldChangeConclusion;
    field(fragment, 'evidence-supplied').textContent = pressure.inputEvidenceAssessment;
    field(fragment, 'tension-type').textContent = `${pressure.tensionType} — ${pressure.interpretation}`;
    addPill(field(fragment, 'risk-flags'), pressure.riskFlag);
    ui.pressureList.appendChild(fragment);
  });
  ui.pressureCount.textContent = formatNumber(pressures.length);
}

function appendNearestConcepts(container, concepts) {
  if (!concepts?.length) {
    container.textContent = 'No defensible neighbor';
    return;
  }
  concepts.forEach((concept, index) => {
    if (index) container.appendChild(document.createTextNode(' · '));
    const link = document.createElement('a');
    link.href = concept.href;
    link.textContent = `${concept.title} (${Math.round(concept.score * 100)}/100)`;
    container.appendChild(link);
  });
}

function renderResearchQueue(result) {
  clearNode(ui.researchList);
  const items = result.researchQueue?.items || [];
  const noDomainClaims = result.metrics.claimLikeSegments === 0
    && result.metrics.ignoredDomainSegments > 0;
  ui.researchEmpty.hidden = items.length > 0;
  ui.researchEmptyTitle.textContent = noDomainClaims
    ? 'No relationship-domain claims detected'
    : 'No research candidates yet';
  ui.researchEmptyCopy.textContent = noDomainClaims
    ? 'Clearly non-relationship passages were excluded from the assay and remain intact in the normalized Source view.'
    : 'Unmapped claim-like passages will remain visible here instead of being forced into the nearest canon bucket.';
  items.forEach((item) => {
    const fragment = ui.researchTemplate.content.cloneNode(true);
    field(fragment, 'segment-ref').textContent = segmentReference({
      id: item.segmentId,
      speaker: item.location?.speaker,
      startMs: item.location?.startTime,
    });
    field(fragment, 'excerpt').textContent = item.excerpt;
    field(fragment, 'reason').textContent = item.whyUnmapped;
    appendNearestConcepts(field(fragment, 'nearest'), item.nearestConcepts);
    field(fragment, 'destination').textContent = item.suggestedDestination;
    field(fragment, 'question').textContent = item.empiricalQuestion;
    field(fragment, 'falsifier').textContent = item.falsifier;
    field(fragment, 'search-terms').textContent = item.suggestedSearchTerms.join(' · ');
    const risks = field(fragment, 'risk-flags');
    item.riskFlags.forEach((risk) => addPill(risks, risk));
    ui.researchList.appendChild(fragment);
  });
  ui.researchCount.textContent = formatNumber(items.length);
}

function setMetadataUrl(url) {
  clearNode(ui.sourceMetaUrl);
  if (!url) {
    ui.sourceMetaUrl.textContent = '—';
    return;
  }
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = url;
  ui.sourceMetaUrl.appendChild(link);
}

function renderNormalizedDocument(documentValue) {
  if (!documentValue) {
    ui.sourceEmpty.hidden = false;
    clearNode(ui.sourceSegments);
    return;
  }
  const source = documentValue.source;
  setText(ui.sourceMetaTitle, source.title);
  setText(ui.sourceMetaType, source.type);
  setText(ui.sourceMetaMethod, documentValue.extraction.method);
  setText(ui.sourceMetaSpeakers, documentValue.speakers.length ? documentValue.speakers.join(', ') : 'Not recoverable');
  setMetadataUrl(source.url);
  ui.sourceMetaSchema.textContent = `${documentValue.schema}/${documentValue.schemaVersion}`;
  clearNode(ui.extractionWarnings);
  documentValue.extraction.warnings.forEach((warning) => {
    const item = document.createElement('li');
    item.textContent = warningMessage(warning);
    ui.extractionWarnings.appendChild(item);
  });
  ui.sourceWarnings.hidden = !documentValue.extraction.warnings.length;
  ui.sourceEmpty.hidden = true;
  clearNode(ui.sourceSegments);
  documentValue.segments.slice(0, MAX_RENDERED_SOURCE_SEGMENTS).forEach((segment) => {
    const fragment = ui.sourceSegmentTemplate.content.cloneNode(true);
    field(fragment, 'segment-id').textContent = segment.id;
    const time = field(fragment, 'timestamp');
    if (Number.isFinite(segment.startMs)) {
      time.textContent = [
        formatTimestamp(segment.startMs),
        Number.isFinite(segment.endMs) ? formatTimestamp(segment.endMs) : null,
      ].filter(Boolean).join('–');
      time.dateTime = `PT${Math.round(segment.startMs / 1000)}S`;
    } else {
      time.hidden = true;
    }
    const speaker = field(fragment, 'speaker');
    if (segment.speaker) speaker.textContent = segment.speaker;
    else speaker.hidden = true;
    field(fragment, 'text').textContent = segment.text;
    ui.sourceSegments.appendChild(fragment);
  });
  if (documentValue.segments.length > MAX_RENDERED_SOURCE_SEGMENTS) {
    const item = document.createElement('li');
    item.className = 'lab-source-segment';
    const paragraph = document.createElement('p');
    paragraph.textContent = `${formatNumber(documentValue.segments.length - MAX_RENDERED_SOURCE_SEGMENTS)} additional normalized segments are preserved in JSON export.`;
    item.appendChild(paragraph);
    ui.sourceSegments.appendChild(item);
  }
}

function renderResult(result, documentValue) {
  state.analysis = result;
  const coverage = result.coverage.mappedClaimSegmentSharePct;
  const coverageAvailable = Number.isFinite(coverage);
  const ignored = Number(result.metrics.ignoredDomainSegments || 0);
  renderTriage(result);
  setText(ui.metricWords, formatNumber(result.metrics.totalWords));
  setText(ui.metricSegments, formatNumber(result.metrics.sourceSegments));
  setText(ui.metricClaims, formatNumber(result.metrics.claimLikeSegments));
  setText(ui.metricCoverage, coverageAvailable ? `${coverage}%` : 'N/A');
  setText(ui.flowSource, formatNumber(result.metrics.sourceSegments));
  setText(ui.flowClaims, formatNumber(result.metrics.claimLikeSegments));
  setText(ui.flowCanon, formatNumber(result.strongestMatches.length));
  setText(ui.flowTension, formatNumber(result.pressureTests.length));
  setText(ui.flowUnmapped, formatNumber(result.researchQueue.itemCount));
  ui.flowSourceLabel.textContent = `${formatNumber(result.metrics.totalWords)} normalized words`;

  renderCategorySpectrum(result.categoryDistribution);
  ui.coverageReadout.classList.toggle('is-unavailable', !coverageAvailable);
  ui.coverageLabel.textContent = coverageAvailable
    ? `${coverage}% of claim-like segments`
    : 'Not applicable';
  ui.coverageFill.style.width = coverageAvailable ? `${coverage}%` : '0';
  ui.coverageMarker.style.left = coverageAvailable ? `${coverage}%` : '0';
  ui.coverageMarker.style.opacity = coverageAvailable ? '1' : '0';
  if (coverageAvailable) {
    ui.coverageTrack.setAttribute(
      'aria-label',
      `${coverage}% of ${result.metrics.claimLikeSegments} detected claim-like segments mapped to credible canon connections. This is document coverage, not proof.`,
    );
  } else {
    ui.coverageTrack.setAttribute(
      'aria-label',
      'Coverage is unavailable because no relationship-domain claims were detected.',
    );
  }

  renderLedger(result);
  renderDistribution(ui.alignmentDistribution, alignmentDistribution(result));
  renderDistribution(ui.evidenceDistribution, result.evidenceTierDistribution);
  renderCitations(result);
  renderPressureTests(result);
  renderResearchQueue(result);
  renderNormalizedDocument(documentValue);

  const exportButtons = [ui.copyMarkdown, ui.downloadMarkdown, ui.downloadJson, ui.exportResearch];
  exportButtons.forEach((button) => { button.disabled = false; });
  const extractionWarnings = documentValue.extraction.warnings || [];
  const combinedWarnings = [...extractionWarnings, ...(result.warnings || [])];
  renderWarnings(combinedWarnings);

  const mapped = result.metrics.mappedClaimSegments;
  const noDomainClaims = result.metrics.claimLikeSegments === 0 && ignored > 0;
  const nextState = noDomainClaims
    ? 'no-domain'
    : !mapped
      ? 'no-match'
    : extractionWarnings.some((warning) => warning.severity === 'warning' || warning.severity === 'error')
      ? 'partial'
      : 'success';
  const detail = noDomainClaims
    ? 'No relationship-domain claims were detected in this source. Clearly non-domain passages remain intact in Source.'
    : !mapped
    ? `No claim-like passage cleared the credible threshold; ${formatNumber(result.researchQueue.itemCount)} research candidate(s) remain visible.`
    : `${formatNumber(mapped)} of ${formatNumber(result.metrics.claimLikeSegments)} claim-like segments mapped; ${formatNumber(result.pressureTests.length)} prioritized tension(s).`;
  setLabState(nextState, detail);
  ui.workspaceSubtitle.textContent = coverageAvailable
    ? `${result.source.title} · ${coverage}% claim-like-segment coverage · ${result.analysisMode.label}.`
    : `${result.source.title} · coverage not applicable · ${result.analysisMode.label}.`;
  ui.intakeStatus.textContent = nextState === 'partial'
    ? 'Analysis complete with extraction warnings.'
    : 'Analysis complete on this device.';
}

async function runAnalysis(event) {
  event?.preventDefault();
  if (state.busy) return;
  clearError();
  if (!state.canonIndex) {
    showError(new Error('The canon index is unavailable; reload the page before analyzing.'), { analysisFailure: true });
    return;
  }
  state.workController = new AbortController();
  setBusy(true, 'extracting');
  try {
    const documentValue = await documentForAnalysis();
    if (state.workController.signal.aborted) return;
    // Overrides are keyed to content-derived unit IDs; a different document
    // means a different source, so stale decisions never carry across.
    if (state.lastAnalyzedDocumentId !== documentValue.id) {
      state.domainOverrides.clear();
      state.lastAnalyzedDocumentId = documentValue.id;
    }
    setLabState('analyzing', 'Tracing exact terms, weighted overlap, and canon relationships.');
    setBusy(true, 'analyzing');
    ui.analysisProgressWrap.hidden = false;
    const result = await analyzer.analyze(documentValue, state.canonIndex, {
      signal: state.workController.signal,
      onProgress: handleAnalysisProgress,
      domainOverrides: Object.fromEntries(state.domainOverrides),
    });
    if (state.workController.signal.aborted) return;
    (result.domainRelevance?.overrides?.unmatchedIds || [])
      .forEach((unitId) => state.domainOverrides.delete(unitId));
    renderResult(result, documentValue);
  } catch (error) {
    if (error?.name === 'AbortError') {
      ui.intakeStatus.textContent = 'Work cancelled. No partial result was promoted.';
      setLabState(state.analysis ? 'success' : 'empty', 'The current operation was cancelled.');
    } else {
      showError(error, { analysisFailure: true });
    }
  } finally {
    state.workController = null;
    ui.progressWrap.hidden = true;
    setBusy(false);
  }
}

function activateTab(tabName, { focus = false } = {}) {
  const tabs = [...document.querySelectorAll('[data-lab-tab]')];
  const panels = [...document.querySelectorAll('[data-lab-panel]')];
  tabs.forEach((tab) => {
    const active = tab.dataset.labTab === tabName;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
  });
  panels.forEach((panel) => {
    const active = panel.dataset.labPanel === tabName;
    panel.classList.toggle('is-active', active);
    panel.hidden = !active;
  });
}

function wireTabs() {
  const tabs = [...document.querySelectorAll('[data-lab-tab]')];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.labTab));
    tab.addEventListener('keydown', (event) => {
      let target = null;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') target = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') target = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') target = 0;
      if (event.key === 'End') target = tabs.length - 1;
      if (target == null) return;
      event.preventDefault();
      activateTab(tabs[target].dataset.labTab, { focus: true });
    });
  });
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const area = document.createElement('textarea');
  area.value = value;
  area.readOnly = true;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  area.remove();
  if (!copied) throw new Error('Clipboard access was denied. Download the Markdown file instead.');
}

async function exportMarkdownToClipboard() {
  if (!state.analysis) return;
  try {
    await copyText(analysisToMarkdown(state.analysis));
    const original = ui.copyMarkdown.textContent;
    ui.copyMarkdown.textContent = 'Copied';
    setTimeout(() => { ui.copyMarkdown.textContent = original; }, 1_400);
  } catch (error) {
    showError(error);
  }
}

async function cancelWork() {
  state.workController?.abort();
  extractionSession.cancel('Extraction cancelled by the visitor.');
  ui.intakeStatus.textContent = 'Cancelling current work…';
}

function resetVisualResults() {
  state.analysis = null;
  [ui.metricWords, ui.metricSegments, ui.metricClaims, ui.metricCoverage,
    ui.flowSource, ui.flowClaims, ui.flowCanon, ui.flowTension, ui.flowUnmapped]
    .forEach((node) => { node.textContent = '—'; });
  ui.flowSourceLabel.textContent = 'No normalized document';
  ui.categorySpectrum.replaceChildren(Object.assign(document.createElement('p'), {
    textContent: 'Matched categories will form a concentration profile here.',
  }));
  ui.dominantCategory.textContent = 'Waiting for results';
  ui.coverageLabel.textContent = '—';
  ui.coverageReadout.classList.remove('is-unavailable');
  ui.coverageFill.style.width = '0';
  ui.coverageMarker.style.left = '0';
  ui.coverageMarker.style.opacity = '0';
  ui.coverageTrack.setAttribute('aria-label', 'No mapped share of claim-like segments yet');
  ui.triage.hidden = true;
  ui.triage.open = false;
  ui.triageHeadline.textContent = 'No passages were set aside by the relevance gate.';
  clearNode(ui.triageList);
  ui.mapSummary.textContent = 'No source has been mapped.';
  clearNode(ui.mapTableBody);
  const emptyRow = document.createElement('tr');
  emptyRow.id = 'lab-map-table-empty';
  const emptyCell = document.createElement('td');
  emptyCell.colSpan = 5;
  emptyCell.textContent = 'Run an analysis to populate the segment-by-segment map.';
  emptyRow.appendChild(emptyCell);
  ui.mapTableBody.appendChild(emptyRow);
  renderDistribution(ui.alignmentDistribution, []);
  renderDistribution(ui.evidenceDistribution, []);
  clearNode(ui.citationsList);
  ui.citationsEmpty.hidden = false;
  clearNode(ui.pressureList);
  ui.pressureSummary.replaceChildren(Object.assign(document.createElement('p'), {
    textContent: 'Run an analysis to see which matched claims deserve pressure first.',
  }));
  clearNode(ui.researchList);
  ui.researchEmpty.hidden = false;
  ui.researchEmptyTitle.textContent = 'No research candidates yet';
  ui.researchEmptyCopy.textContent = 'Unmapped claim-like passages will remain visible here instead of being forced into the nearest canon bucket.';
  [ui.citationCount, ui.pressureCount, ui.researchCount].forEach((node) => { node.textContent = '0'; });
  [ui.copyMarkdown, ui.downloadMarkdown, ui.downloadJson, ui.exportResearch]
    .forEach((button) => { button.disabled = true; });
}

async function resetLab({ preserveInputs = false } = {}) {
  state.resetSequence += 1;
  state.workController?.abort();
  state.workController = null;
  analyzer.reset();
  await extractionSession.reset();
  state.normalizedDocument = null;
  state.activeInput = null;
  state.sourceFile = null;
  state.companionFile = null;
  state.media = null;
  state.domainOverrides.clear();
  state.lastAnalyzedDocumentId = null;
  if (!preserveInputs) {
    ui.form.reset();
    clearFileSummary();
    renderMediaPreview(null);
  }
  clearError();
  renderWarnings([]);
  ui.progressWrap.hidden = true;
  ui.companionStatus.textContent = 'No companion transcript attached.';
  ui.sourceMetaTitle.textContent = '—';
  ui.sourceMetaType.textContent = '—';
  ui.sourceMetaMethod.textContent = '—';
  ui.sourceMetaSpeakers.textContent = '—';
  ui.sourceMetaUrl.textContent = '—';
  ui.sourceMetaSchema.textContent = 'le-lab.normalized-document/1.0.0';
  ui.sourceWarnings.hidden = true;
  ui.sourceEmpty.hidden = false;
  clearNode(ui.sourceSegments);
  resetVisualResults();
  activateTab('map');
  setBusy(false);
  setLabState('empty', 'No source is loaded. Nothing has been analyzed.');
  ui.intakeStatus.textContent = 'Ready for a source.';
  ui.workspaceSubtitle.textContent = 'The empty instrument shows the route. Run the demonstration or bring a source to populate every chamber with real, source-derived results.';
  refreshReadyState();
}

async function loadDemo() {
  if (state.busy) return;
  await resetLab();
  try {
    const documentValue = createDemoDocument();
    ui.sourceTitle.value = documentValue.source.title;
    updateLoadedDocument(documentValue);
    ui.intakeStatus.textContent = 'Original demonstration loaded. Map it to populate the full Lab.';
    await runAnalysis();
  } catch (error) {
    showError(error, { analysisFailure: true });
  }
}

async function removeFile() {
  extractionSession.cancel('Selected source removed.');
  await removeCurrentMedia();
  clearFileSummary();
  if (state.activeInput === 'document' || state.activeInput === 'file' || state.activeInput === 'media') {
    state.normalizedDocument = null;
    state.activeInput = ui.text.value.trim() ? 'text' : null;
    renderNormalizedDocument(null);
    renderWarnings([]);
  }
  setLabState(state.analysis ? app.dataset.labState : 'empty', state.analysis
    ? ui.analysisStatusDetail.textContent
    : 'The selected source was removed.');
  refreshReadyState();
}

async function loadCanonIndex() {
  try {
    const response = await fetch(CANON_INDEX_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const canonIndex = await response.json();
    if (!Array.isArray(canonIndex.entries) || !canonIndex.entries.length) {
      throw new Error('The generated index has no concepts.');
    }
    state.canonIndex = canonIndex;
    state.canonById = new Map(canonIndex.entries.map((entry) => [entry.id, entry]));
    const concepts = canonIndex.stats?.conceptCount ?? canonIndex.entries.length;
    const sources = canonIndex.stats?.sourceCount
      ?? new Set(canonIndex.entries.map((entry) => entry.page)).size;
    ui.indexMeta.textContent = `Indexed ${formatNumber(concepts)} concepts across ${formatNumber(sources)} LE sources · ${canonIndex.indexVersion}`;
    ui.schemaMeta.textContent = 'Input 1.0.0 · Analysis 2.1 · Queue 2.0';
    ui.analysisMode.textContent = 'On-device lexical · no semantic model';
    refreshReadyState();
  } catch (error) {
    state.canonIndex = null;
    ui.indexMeta.textContent = 'Canon index unavailable';
    showError(new Error(`The generated LE canon index could not load (${error.message}). The Lab will not analyze without it.`), { analysisFailure: true });
    refreshReadyState();
  }
}

function wireDropZone() {
  ui.dropZone.addEventListener('click', () => ui.fileInput.click());
  let dragDepth = 0;
  const setDragging = (active) => {
    app.dataset.dragActive = active ? 'true' : 'false';
    ui.dropZone.classList.toggle('is-dragging', active);
  };
  document.addEventListener('dragenter', (event) => {
    if (!event.dataTransfer?.types?.includes('Files')) return;
    event.preventDefault();
    dragDepth += 1;
    setDragging(true);
  });
  document.addEventListener('dragover', (event) => {
    if (!event.dataTransfer?.types?.includes('Files')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  });
  document.addEventListener('dragleave', (event) => {
    if (!event.dataTransfer?.types?.includes('Files')) return;
    dragDepth = Math.max(0, dragDepth - 1);
    if (!dragDepth) setDragging(false);
  });
  document.addEventListener('drop', (event) => {
    if (!event.dataTransfer?.files?.length) return;
    event.preventDefault();
    dragDepth = 0;
    setDragging(false);
    const [file] = event.dataTransfer.files;
    prepareSelectedFile(file);
  });
}

ui.form.addEventListener('submit', runAnalysis);
ui.text.addEventListener('input', () => {
  if (ui.text.value.trim()) state.activeInput = 'text';
  refreshReadyState();
});
ui.text.addEventListener('paste', (event) => {
  const hasImage = [...(event.clipboardData?.items || [])].some((item) => item.type?.startsWith('image/'));
  const hasText = Boolean(event.clipboardData?.getData('text/plain')?.trim());
  if (hasImage && !hasText) {
    event.preventDefault();
    prepareClipboard({ event });
  }
});
ui.sourceUrl.addEventListener('input', updateUrlGuidance);
ui.sourceTitle.addEventListener('input', refreshReadyState);
ui.pasteButton.addEventListener('click', () => prepareClipboard());
ui.clearText.addEventListener('click', () => {
  ui.text.value = '';
  if (state.activeInput === 'text') state.activeInput = state.normalizedDocument ? 'document' : null;
  refreshReadyState();
  ui.text.focus();
});
ui.fileInput.addEventListener('change', () => prepareSelectedFile(ui.fileInput.files?.[0]));
ui.companionInput.addEventListener('change', () => prepareCompanion(ui.companionInput.files?.[0]));
ui.removeFile.addEventListener('click', removeFile);
ui.cancel.addEventListener('click', cancelWork);
ui.reset.addEventListener('click', () => resetLab());
ui.loadDemo.addEventListener('click', loadDemo);
ui.copyMarkdown.addEventListener('click', exportMarkdownToClipboard);
ui.downloadMarkdown.addEventListener('click', () => {
  if (!state.analysis) return;
  downloadTextFile(
    analysisToMarkdown(state.analysis),
    exportFileName(state.analysis, 'analysis', 'md'),
    'text/markdown;charset=utf-8',
  );
});
ui.downloadJson.addEventListener('click', () => {
  if (!state.analysis) return;
  downloadTextFile(
    analysisToJson(state.analysis),
    exportFileName(state.analysis, 'analysis', 'json'),
    'application/json;charset=utf-8',
  );
});
ui.exportResearch.addEventListener('click', () => {
  if (!state.analysis) return;
  downloadTextFile(
    researchQueueToMarkdown(state.analysis),
    exportFileName(state.analysis, 'research-queue', 'md'),
    'text/markdown;charset=utf-8',
  );
});

wireTabs();
wireDropZone();
window.addEventListener('beforeunload', () => {
  state.workController?.abort();
  analyzer.destroy();
  state.media?.cleanup?.();
});

resetVisualResults();
renderNormalizedDocument(null);
refreshReadyState();
loadCanonIndex();
