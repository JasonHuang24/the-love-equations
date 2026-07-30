import {
  LabIntakeError,
  applyOptionalSourceMetadata,
  assessSourceInputReadiness,
  classifyLocalFile,
  countWords,
  normalizeInput,
  validSourceProvenanceUrl,
  validateNormalizedDocument,
} from './lab-intake.js?v=2.6.2';
import {
  ExtractionSession,
  attachCompanionTranscript,
  extractClipboardEvent,
  extractFile,
  extractUrlText,
  readSystemClipboard,
} from './lab-extractors.js?v=2.6.2';
import { createDemoDocument } from './lab-demo.js?v=2.6.2';
import { LabAnalyzerClient } from './lab-analyzer-client.js?v=2.6.2';
import { claimUnitRowDigest } from './lab-analyzer.js?v=2.6.2';
import {
  analysisToJson,
  analysisToMarkdown,
  downloadTextFile,
  exportFileName,
  researchQueueToMarkdown,
} from './lab-export.js?v=2.6.2';
import {
  LEDGER_COLUMN_COUNT,
  compareLedgerEntries,
  ledgerFilterIsActive,
  ledgerRowMatchesFilter,
  nextLedgerFilter,
} from './lab-ledger.js?v=2.6.2';
import {
  REVIEW_DISPOSITIONS,
  buildMappingFeedback,
  mappingFeedbackFileName,
  mappingFeedbackToJson,
} from './lab-feedback.js?v=2.6.2';

const CANON_INDEX_URL = 'data/le-canon-index.json?v=2.6.2';
// The Lab build that rendered a flagged row. Deliberately distinct from
// provenance.analyzer.version, which names the engine that produced the numbers:
// a UI-only patch moves this and not that, and triage needs to tell them apart.
const LAB_RELEASE = '2.6.2';
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
  flagDialog: byId('lab-flag-dialog'),
  flagForm: byId('lab-flag-form'),
  flagRowKind: byId('lab-flag-row-kind'),
  flagExcerpt: byId('lab-flag-excerpt'),
  flagCurrent: byId('lab-flag-current'),
  flagDispositions: byId('lab-flag-dispositions'),
  flagExpected: byId('lab-flag-expected'),
  flagForbidden: byId('lab-flag-forbidden'),
  flagAlignment: byId('lab-flag-alignment'),
  flagNote: byId('lab-flag-note'),
  flagProvenance: byId('lab-flag-provenance'),
  flagCanonIds: byId('lab-flag-canon-ids'),
  flagError: byId('lab-flag-error'),
  flagCancel: byId('lab-flag-cancel'),
  flagSubmit: byId('lab-flag-submit'),
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
  coverageProvisional: byId('lab-coverage-provisional'),
  coverageTrack: byId('lab-coverage-track'),
  coverageFill: byId('lab-coverage-fill'),
  coverageMarker: byId('lab-coverage-marker'),
  mapSummary: byId('lab-map-summary'),
  mapTableBody: byId('lab-map-table-body'),
  ledgerFilterNote: byId('lab-ledger-filter-note'),
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
  // The exact inputs behind state.analysis. The diagnostic trace is collected by
  // re-running the analyzer on THESE, not on whatever the intake fields say now,
  // so a trace can never describe a document the visitor has since edited.
  analyzedDocument: null,
  analyzedOverrides: {},
  // Traces are cached per flagged passage, not per analysis: one flag pays for
  // one passage's candidate set, and a session that flags three rows holds
  // three of them rather than the whole document's.
  diagnosticsBySegment: new Map(),
  diagnosticsFor: null,
  flagTarget: null,
  workController: null,
  busy: false,
  resetSequence: 0,
  domainOverrides: new Map(),
  lastAnalyzedDocumentId: null,
  ledgerView: {
    rows: [],
    filter: 'all',
    sort: { key: 'order', dir: 'asc' },
    hadIgnoredDomainSegments: false,
  },
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

function triageButton(label, ariaLabel, onClick, variant = '') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `lab-triage-button${variant ? ` is-${variant}` : ''}`;
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
  // Re-included passages stay listed here with their Undo, so every visitor
  // intervention has a control even if its ledger row is truncated.
  applied
    .filter((override) => override.action === 'include')
    .forEach((override) => {
      const segment = (result.segments || [])
        .find((candidate) => candidate.unit.id === override.segmentId);
      if (!segment) return;
      const item = document.createElement('li');
      item.className = 'lab-triage-item';

      const head = document.createElement('div');
      head.className = 'lab-triage-item-head';
      head.appendChild(triageChip('Included by you', 'override'));
      const reference = document.createElement('span');
      reference.className = 'lab-triage-ref';
      reference.textContent = segmentReference(segment.unit);
      head.appendChild(reference);
      item.appendChild(head);

      const excerpt = document.createElement('p');
      excerpt.className = 'lab-triage-excerpt';
      excerpt.textContent = segment.unit.text;
      item.appendChild(excerpt);

      const shortExcerpt = truncateLabel(segment.unit.text, 60);
      item.appendChild(triageButton('Undo include', `Undo your inclusion of “${shortExcerpt}”`, () => setDomainOverride(segment.unit.id, null)));
      ui.triageList.appendChild(item);
    });
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
    const actions = document.createElement('div');
    actions.className = 'lab-triage-actions';
    actions.appendChild(passage.overridden
      ? triageButton('Undo exclude', `Undo your exclusion of “${shortExcerpt}”`, () => setDomainOverride(passage.segmentId, null))
      : triageButton('Include in analysis', `Include “${shortExcerpt}” in the analysis`, () => setDomainOverride(passage.segmentId, 'include')));
    // Including a passage fixes this session; flagging it is how the gate itself
    // gets fixed. A set-aside row has no ledger row, so this is its only flag.
    actions.appendChild(flagButton(passage.segmentId, shortExcerpt));
    item.appendChild(actions);
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

const LEDGER_FILTER_LABELS = {
  all: 'every claim-like segment',
  mapped: 'mapped segments only',
  unmapped: 'unmapped segments only',
};

function matchSection(match) {
  return [match.category, match.subcategory].filter(Boolean).join(' · ');
}

function buildLedgerRow(segment) {
  const row = document.createElement('tr');
  const refCell = document.createElement('td');
  const excerptCell = document.createElement('td');
  const alignmentCell = document.createElement('td');
  const connectionCell = document.createElement('td');
  const sectionCell = document.createElement('td');
  sectionCell.className = 'lab-section-cell';
  const confidenceCell = document.createElement('td');
  const triageCell = document.createElement('td');
  triageCell.className = 'lab-triage-cell';
  const reviewCell = document.createElement('td');
  reviewCell.className = 'lab-review-cell';
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
  reviewCell.appendChild(flagButton(segment.unit.id, shortExcerpt));
  if (segment.mapped) {
    const primary = segment.matches[0];
    alignmentCell.textContent = primary.alignment.label;
    const link = document.createElement('a');
    link.href = primary.href;
    link.textContent = primary.title;
    connectionCell.appendChild(link);
    if (segment.matches.length > 1) {
      const extra = segment.matches.slice(1);
      const details = document.createElement('details');
      details.className = 'lab-adjacent-more';
      const summary = document.createElement('summary');
      summary.textContent = `+ ${extra.length} adjacent`;
      details.appendChild(summary);
      const list = document.createElement('ul');
      extra.forEach((match) => {
        const item = document.createElement('li');
        const extraLink = document.createElement('a');
        extraLink.href = match.href;
        extraLink.textContent = match.title;
        item.appendChild(extraLink);
        const sectionSuffix = matchSection(match);
        item.appendChild(document.createTextNode(
          ` — ${sectionSuffix ? `${sectionSuffix} · ` : ''}${match.alignment.label} · ${confidenceLabel(match)}`,
        ));
        list.appendChild(item);
      });
      details.appendChild(list);
      connectionCell.appendChild(details);
    }
    sectionCell.textContent = matchSection(primary) || '—';
    confidenceCell.textContent = confidenceLabel(primary);
  } else {
    alignmentCell.textContent = 'Unmapped';
    connectionCell.textContent = segment.weakMatches?.[0]
      ? `Nearest: ${segment.weakMatches[0].title}`
      : 'No credible match';
    sectionCell.textContent = segment.weakMatches?.[0]
      ? matchSection(segment.weakMatches[0]) || '—'
      : '—';
    confidenceCell.textContent = segment.weakMatches?.[0]
      ? `Below threshold · ${Math.round(segment.weakMatches[0].score * 100)}/100`
      : '—';
  }
  row.append(refCell, excerptCell, alignmentCell, connectionCell, sectionCell, confidenceCell,
    triageCell, reviewCell);
  return row;
}

function syncLedgerControls() {
  const { filter, sort } = state.ledgerView;
  document.querySelectorAll('[data-ledger-filter]').forEach((tile) => {
    tile.setAttribute('aria-pressed', String(ledgerFilterIsActive(tile.dataset.ledgerFilter, filter)));
  });
  document.querySelectorAll('.lab-sort-button').forEach((button) => {
    const th = button.closest('th');
    if (!th) return;
    if (button.dataset.sortKey === sort.key) {
      th.setAttribute('aria-sort', sort.dir === 'desc' ? 'descending' : 'ascending');
      th.classList.add('is-sorted');
    } else {
      th.removeAttribute('aria-sort');
      th.classList.remove('is-sorted');
    }
  });
  if (filter === 'all') {
    ui.ledgerFilterNote.hidden = true;
    clearNode(ui.ledgerFilterNote);
  } else {
    ui.ledgerFilterNote.hidden = false;
    clearNode(ui.ledgerFilterNote);
    const label = document.createElement('span');
    label.textContent = `Ledger filtered to ${LEDGER_FILTER_LABELS[filter]}.`;
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'lab-triage-button';
    clear.textContent = 'Show all rows';
    clear.addEventListener('click', () => setLedgerFilter('all'));
    ui.ledgerFilterNote.append(label, clear);
  }
}

function paintLedger() {
  clearNode(ui.mapTableBody);
  const view = state.ledgerView;
  const claims = view.rows;
  const noDomainClaims = claims.length === 0 && view.hadIgnoredDomainSegments;
  const visible = claims
    .filter((entry) => ledgerRowMatchesFilter(entry.segment, view.filter))
    .sort((a, b) => compareLedgerEntries(a, b, view.sort));
  visible.slice(0, MAX_RENDERED_LEDGER_ROWS).forEach((entry) => {
    ui.mapTableBody.appendChild(buildLedgerRow(entry.segment));
  });
  if (visible.length > MAX_RENDERED_LEDGER_ROWS) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = LEDGER_COLUMN_COUNT;
    cell.textContent = `${formatNumber(visible.length - MAX_RENDERED_LEDGER_ROWS)} additional rows are preserved in the Markdown and JSON exports.`;
    row.appendChild(cell);
    ui.mapTableBody.appendChild(row);
  }
  if (!visible.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = LEDGER_COLUMN_COUNT;
    if (claims.length) {
      cell.textContent = `No rows match the active filter (${LEDGER_FILTER_LABELS[view.filter]}).`;
    } else {
      cell.textContent = noDomainClaims
        ? 'No relationship-domain claims were detected in this source.'
        : 'No claim-like passages were detected.';
    }
    row.appendChild(cell);
    ui.mapTableBody.appendChild(row);
  }
  syncLedgerControls();
}

function setLedgerFilter(filter) {
  const next = nextLedgerFilter(state.ledgerView.filter, filter);
  state.ledgerView.filter = next;
  paintLedger();
}

function setLedgerSort(key) {
  const sort = state.ledgerView.sort;
  if (sort.key === key) {
    sort.dir = sort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    sort.key = key;
    // Confidence reads as importance: strongest matches surface first.
    sort.dir = key === 'confidence' ? 'desc' : 'asc';
  }
  paintLedger();
}

function resetLedgerView() {
  state.ledgerView = {
    rows: [],
    filter: 'all',
    sort: { key: 'order', dir: 'asc' },
    hadIgnoredDomainSegments: false,
  };
}

function renderLedger(result) {
  const claims = result.segments.filter((segment) => segment.unit.isClaimLike);
  const noDomainClaims = claims.length === 0 && result.metrics.ignoredDomainSegments > 0;
  const previous = state.ledgerView || {};
  state.ledgerView = {
    rows: claims.map((segment, order) => ({ segment, order })),
    // Filter and sort survive an override re-run; a fresh document starts clean upstream.
    filter: previous.filter || 'all',
    sort: previous.sort || { key: 'order', dir: 'asc' },
    hadIgnoredDomainSegments: noDomainClaims,
  };
  paintLedger();
  ui.mapSummary.textContent = noDomainClaims
    ? 'No relationship-domain claims were detected in this source.'
    : `${formatNumber(result.metrics.mappedClaimSegments)} of ${formatNumber(result.metrics.claimLikeSegments)} claim-like segments mapped credibly.`;
}

/*
 * ---------------------------------------------------------------------------
 * Mapping feedback — flag a row, download a file, and that is the whole of it.
 * ---------------------------------------------------------------------------
 * No upload, no persistence, no fixture mutation. The payload is built by
 * js/lab-feedback.js from two analyzer outputs — the published analysis and the
 * opt-in diagnostic trace — and written straight to the visitor's disk.
 *
 * The trace is collected ON DEMAND rather than kept for every analysis: it is
 * the whole pre-display candidate set for every passage, which is large, and
 * most sessions never flag anything. The first flag pays for it once; the rest
 * of the session reads the cache. Because the analyzer is deterministic and the
 * re-run uses the stored document and stored overrides, the trace describes the
 * run on screen — and that is checked rather than assumed.
 */
/**
 * Did the trace run reproduce the analysis on screen?
 *
 * IDs, schema versions and counts are not enough, and that is not a theoretical
 * objection: they are all properties of the build or of aggregate shape, and a
 * run that produced entirely different mappings can satisfy every one of them
 * while agreeing on how many rows mapped. This compares the rows themselves —
 * every published row's digest, in order — so "reproduced" means the ledger
 * came back the same, not that the header did.
 */
function rowDigests(result) {
  return (result.segments || []).map(claimUnitRowDigest).join('|');
}

function assertTraceMatchesAnalysis(traced, analysis) {
  const agrees = traced.id === analysis.id
    && traced.schemaVersion === analysis.schemaVersion
    && traced.provenance?.analyzer?.version === analysis.provenance?.analyzer?.version
    && traced.provenance?.analyzer?.scoringConfigHash === analysis.provenance?.analyzer?.scoringConfigHash
    && traced.canonIndex?.version === analysis.canonIndex?.version
    && traced.metrics?.claimLikeSegments === analysis.metrics?.claimLikeSegments
    && traced.metrics?.mappedClaimSegments === analysis.metrics?.mappedClaimSegments;
  if (!agrees) {
    throw new Error('The trace run did not reproduce the analysis on screen, so it cannot be used as evidence about it. Re-run the analysis and flag again.');
  }
  if ((traced.segments || []).length !== (analysis.segments || []).length
    || (traced.domainRelevance?.ignoredPassages || []).length
      !== (analysis.domainRelevance?.ignoredPassages || []).length) {
    throw new Error('The trace run analyzed a different set of passages than the analysis on screen. Re-run the analysis and flag again.');
  }
  if (rowDigests(traced) !== rowDigests(analysis)) {
    throw new Error('The trace run produced different mappings than the analysis on screen, so it cannot be used as evidence about it. Re-run the analysis and flag again.');
  }
  if (!traced.diagnostics) {
    throw new Error('The analyzer returned no diagnostic trace. Re-run the analysis and flag again.');
  }
  if (traced.diagnostics.analysisId !== analysis.id) {
    throw new Error('The diagnostic trace does not carry the identity of the analysis on screen. Re-run the analysis and flag again.');
  }
}

/**
 * The trace for ONE passage, fetched when that passage is flagged.
 *
 * Not the whole document. The document-wide trace is the entire pre-display
 * candidate set for every passage, which is fine for a fixture capture and
 * wrong for an interaction: a reviewer flagging one row does not need — and
 * should not have to wait for, clone across the worker boundary, or hold in
 * memory — the candidate sets of every row they did not flag.
 *
 * The analysis still runs whole, because it always did and because bounded
 * context makes each passage's result depend on its predecessor. What is scoped
 * is the trace assembly, which is where the size is.
 */
async function ensureDiagnostics(segmentId) {
  if (state.diagnosticsFor === state.analysis?.id && state.diagnosticsBySegment.has(segmentId)) {
    return state.diagnosticsBySegment.get(segmentId);
  }
  if (!state.analysis) throw new Error('There is no analysis to trace.');
  if (!state.analyzedDocument || !state.canonIndex) {
    throw new Error('The analyzed source is no longer loaded in this session. Re-run the analysis before flagging.');
  }
  const restoreStatus = ui.analysisStatusDetail.textContent;
  const restoreIntake = ui.intakeStatus.textContent;
  const controller = new AbortController();
  state.workController = controller;
  setBusy(true, 'analyzing');
  ui.analysisProgressWrap.hidden = false;
  try {
    const traced = await analyzer.analyze(state.analyzedDocument, state.canonIndex, {
      signal: controller.signal,
      onProgress: handleAnalysisProgress,
      domainOverrides: state.analyzedOverrides,
      diagnostics: { segmentIds: [segmentId] },
    });
    assertTraceMatchesAnalysis(traced, state.analysis);
    if (state.diagnosticsFor !== state.analysis.id) {
      state.diagnosticsBySegment.clear();
      state.diagnosticsFor = state.analysis.id;
    }
    state.diagnosticsBySegment.set(segmentId, traced.diagnostics);
    return traced.diagnostics;
  } finally {
    state.workController = null;
    setBusy(false);
    ui.analysisStatusDetail.textContent = restoreStatus;
    ui.intakeStatus.textContent = restoreIntake;
  }
}

function clearDiagnosticsCache() {
  state.diagnosticsBySegment.clear();
  state.diagnosticsFor = null;
}

function flagButton(segmentId, shortExcerpt) {
  return triageButton(
    'Flag',
    `Flag the mapping for “${shortExcerpt}”`,
    () => openFlagDialog(segmentId),
    'flag',
  );
}

/** The row as the ledger currently shows it, so the dialog can describe it. */
function flagRowContext(segmentId) {
  const segment = (state.analysis?.segments || []).find((row) => row.unit.id === segmentId);
  if (segment) {
    const primary = segment.matches?.[0];
    return {
      kind: segment.mapped ? 'mapped' : 'unmapped',
      kindLabel: segment.mapped ? 'Mapped row' : 'Unmapped row',
      excerpt: segment.unit.text,
      reference: segmentReference(segment.unit),
      primaryCanonId: primary?.canonId || null,
      current: primary
        ? `Currently: ${primary.title} · ${primary.alignment?.label} · ${confidenceLabel(primary)}`
        : segment.weakMatches?.[0]
          ? `Currently unmapped. Nearest below threshold: ${segment.weakMatches[0].title} (${Math.round(segment.weakMatches[0].score * 100)}/100).`
          : 'Currently unmapped, with no candidate above the weak threshold.',
      defaultDisposition: segment.mapped ? 'wrong-primary' : 'missing-expected-concept',
    };
  }
  const passage = (state.analysis?.domainRelevance?.ignoredPassages || [])
    .find((row) => row.segmentId === segmentId);
  if (!passage) return null;
  return {
    kind: 'set-aside',
    kindLabel: 'Set aside by the relevance gate',
    excerpt: passage.excerpt,
    reference: segmentReference({
      speaker: passage.location?.speaker,
      startTime: passage.location?.startTime,
      id: passage.segmentId,
    }),
    primaryCanonId: null,
    current: `Currently set aside: ${passage.reasonLabel}. Retrieval never ran, so there is no candidate trace to attach.`,
    defaultDisposition: 'domain-gate-error',
  };
}

function renderDispositionChoices(selectedId) {
  clearNode(ui.flagDispositions);
  REVIEW_DISPOSITIONS.forEach((disposition) => {
    const label = document.createElement('label');
    label.className = 'lab-flag-disposition';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'lab-flag-disposition';
    input.value = disposition.id;
    input.checked = disposition.id === selectedId;
    const body = document.createElement('span');
    const title = document.createElement('strong');
    title.textContent = disposition.label;
    const hint = document.createElement('small');
    hint.textContent = disposition.hint;
    body.append(title, hint);
    label.append(input, body);
    ui.flagDispositions.appendChild(label);
  });
}

function setFlagError(message) {
  ui.flagError.hidden = !message;
  ui.flagError.textContent = message || '';
}

function closeFlagDialog() {
  state.flagTarget = null;
  if (ui.flagDialog.open) ui.flagDialog.close();
}

function openFlagDialog(segmentId) {
  if (state.busy) return;
  const context = flagRowContext(segmentId);
  if (!context) return;
  state.flagTarget = { segmentId, kind: context.kind };
  ui.flagRowKind.textContent = context.kindLabel;
  ui.flagExcerpt.textContent = `“${context.excerpt}”`;
  ui.flagCurrent.textContent = `${context.reference} — ${context.current}`;
  renderDispositionChoices(context.defaultDisposition);
  ui.flagExpected.value = '';
  // Flagging a wrong primary almost always means "not this one"; pre-filling it
  // saves the reviewer retyping an ID they can see on the row.
  ui.flagForbidden.value = context.kind === 'mapped' ? (context.primaryCanonId || '') : '';
  ui.flagAlignment.value = '';
  ui.flagNote.value = '';
  ui.flagProvenance.checked = false;
  setFlagError('');
  ui.flagSubmit.disabled = false;
  if (typeof ui.flagDialog.showModal === 'function') ui.flagDialog.showModal();
  else ui.flagDialog.setAttribute('open', 'open');
  ui.flagDispositions.querySelector('input:checked')?.focus();
}

function splitCanonIds(value) {
  return String(value || '')
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function submitFlag(event) {
  event.preventDefault();
  const target = state.flagTarget;
  if (!target || !state.analysis) return;
  const disposition = ui.flagDispositions.querySelector('input:checked')?.value;
  if (!disposition) {
    setFlagError('Choose what the analyzer got wrong before downloading.');
    return;
  }
  setFlagError('');
  ui.flagSubmit.disabled = true;
  try {
    // A set-aside passage was never scored against the canon, so there is no
    // trace to fetch and no reason to make the reviewer wait for one.
    const diagnostics = target.kind === 'set-aside' ? null : await ensureDiagnostics(target.segmentId);
    const feedback = buildMappingFeedback({
      analysis: state.analysis,
      diagnostics,
      segmentId: target.segmentId,
      labRelease: LAB_RELEASE,
      includeProvenance: ui.flagProvenance.checked,
      review: {
        disposition,
        expectedCanonIds: splitCanonIds(ui.flagExpected.value),
        forbiddenCanonIds: splitCanonIds(ui.flagForbidden.value),
        expectedAlignment: ui.flagAlignment.value,
        note: ui.flagNote.value,
      },
    });
    downloadTextFile(
      mappingFeedbackToJson(feedback),
      mappingFeedbackFileName(feedback),
      'application/json;charset=utf-8',
    );
    closeFlagDialog();
    ui.intakeStatus.textContent = `Flag downloaded for ${target.segmentId}. Nothing was sent anywhere.`;
  } catch (error) {
    if (error?.name === 'AbortError') {
      setFlagError('The trace run was cancelled, so no flag file was written.');
    } else {
      setFlagError(error?.message || 'The flag file could not be built.');
    }
  } finally {
    ui.flagSubmit.disabled = false;
  }
}

function populateCanonIdOptions() {
  clearNode(ui.flagCanonIds);
  [...state.canonById.values()].forEach((entry) => {
    const option = document.createElement('option');
    option.value = entry.id;
    option.label = entry.title;
    ui.flagCanonIds.appendChild(option);
  });
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

/*
 * The mapped share is produced by thresholds nobody has calibrated yet. The
 * tag says so next to the number rather than burying it in the export, and it
 * is driven by the result's own coverage.provisional block so the UI cannot
 * claim a calibration the analyzer has not made.
 */
function renderProvisionalTag(result, coverageAvailable) {
  if (!ui.coverageProvisional) return;
  const provisional = result?.coverage?.provisional;
  const show = Boolean(provisional?.provisional) && coverageAvailable;
  ui.coverageProvisional.hidden = !show;
  if (!show) return;
  const version = result?.provenance?.analyzer?.version;
  ui.coverageProvisional.textContent = [
    version ? `v${version} provisional` : 'Provisional',
    provisional.reason,
  ].filter(Boolean).join(' · ');
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
  renderProvisionalTag(result, coverageAvailable);
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
      // A different source also invalidates the ledger's view state.
      resetLedgerView();
    }
    setLabState('analyzing', 'Tracing exact terms, weighted overlap, and canon relationships.');
    setBusy(true, 'analyzing');
    ui.analysisProgressWrap.hidden = false;
    const overrides = Object.fromEntries(state.domainOverrides);
    const result = await analyzer.analyze(documentValue, state.canonIndex, {
      signal: state.workController.signal,
      onProgress: handleAnalysisProgress,
      domainOverrides: overrides,
    });
    if (state.workController.signal.aborted) return;
    (result.domainRelevance?.overrides?.unmatchedIds || [])
      .forEach((unitId) => state.domainOverrides.delete(unitId));
    // A new run means any cached trace describes a run that is no longer on screen.
    closeFlagDialog();
    clearDiagnosticsCache();
    state.analyzedDocument = documentValue;
    state.analyzedOverrides = overrides;
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

function wireLedgerControls() {
  document.querySelectorAll('[data-ledger-filter]').forEach((tile) => {
    tile.addEventListener('click', () => {
      setLedgerFilter(tile.dataset.ledgerFilter);
      activateTab('map');
      document.getElementById('lab-map-table')?.closest('.lab-ledger')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  document.querySelectorAll('[data-lab-goto]').forEach((button) => {
    button.addEventListener('click', () => activateTab(button.dataset.labGoto, { focus: true }));
  });
  document.querySelectorAll('.lab-sort-button').forEach((button) => {
    button.addEventListener('click', () => setLedgerSort(button.dataset.sortKey));
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
  state.analyzedDocument = null;
  state.analyzedOverrides = {};
  closeFlagDialog();
  clearDiagnosticsCache();
  [ui.metricWords, ui.metricSegments, ui.metricClaims, ui.metricCoverage,
    ui.flowSource, ui.flowClaims, ui.flowCanon, ui.flowTension, ui.flowUnmapped]
    .forEach((node) => { node.textContent = '—'; });
  ui.flowSourceLabel.textContent = 'No normalized document';
  ui.categorySpectrum.replaceChildren(Object.assign(document.createElement('p'), {
    textContent: 'Matched categories will form a concentration profile here.',
  }));
  ui.dominantCategory.textContent = 'Waiting for results';
  ui.coverageLabel.textContent = '—';
  if (ui.coverageProvisional) ui.coverageProvisional.hidden = true;
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
  emptyCell.colSpan = LEDGER_COLUMN_COUNT;
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
  syncLedgerControls();
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
  resetLedgerView();
  syncLedgerControls();
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
  ui.workspaceSubtitle.textContent = 'The empty instrument shows the route. Run the Demo Test or bring a source to populate every chamber with real, source-derived results.';
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
    populateCanonIdOptions();
    const concepts = canonIndex.stats?.conceptCount ?? canonIndex.entries.length;
    const sources = canonIndex.stats?.sourceCount
      ?? new Set(canonIndex.entries.map((entry) => entry.page)).size;
    ui.indexMeta.textContent = `Indexed ${formatNumber(concepts)} concepts across ${formatNumber(sources)} LE sources · ${canonIndex.indexVersion}`;
    ui.schemaMeta.textContent = 'Input 1.0.0 · Analysis 2.2 · Queue 2.1';
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
ui.flagForm.addEventListener('submit', submitFlag);
ui.flagCancel.addEventListener('click', closeFlagDialog);
// Esc closes a native dialog without a submit; keep state from pointing at a
// row nobody is looking at any more.
ui.flagDialog.addEventListener('close', () => { state.flagTarget = null; });
ui.exportResearch.addEventListener('click', () => {
  if (!state.analysis) return;
  downloadTextFile(
    researchQueueToMarkdown(state.analysis),
    exportFileName(state.analysis, 'research-queue', 'md'),
    'text/markdown;charset=utf-8',
  );
});

wireTabs();
wireLedgerControls();
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
