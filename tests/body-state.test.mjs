import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import {
  BODY_MODEL_ASSET,
  BODY_MODEL_PREPROCESSING_VERSION as MODEL_PREPROCESSING_VERSION,
  BODY_PIPELINE_VERSION as MODEL_PIPELINE_VERSION,
  BODY_REFERENCE_VERSION as MODEL_REFERENCE_VERSION
} from '../js/body-model-integrity.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'js', 'body-state.js'), 'utf8');
const context = { globalThis: {}, module: { exports: {} } };
vm.runInNewContext(source, context, { filename: 'js/body-state.js' });
const stateApi = context.module.exports;
assert.ok(stateApi, 'CommonJS API should load without a DOM');
assert.equal(context.globalThis.BodyState, stateApi, 'browser global and CommonJS should expose one API');

const browserContext = { globalThis: {} };
vm.runInNewContext(source, browserContext, { filename: 'js/body-state.js#browser' });
assert.ok(browserContext.globalThis.BodyState, 'browser-global build should not require module or a DOM');

const {
  BODY_MODEL_SHA256,
  BODY_MODEL_PREPROCESSING_VERSION,
  BODY_REFERENCE_VERSION,
  PIPELINE_VERSION,
  STATE_SCHEMA_VERSION,
  INPUTS_SCHEMA_VERSION,
  SHOT_SCHEMA_VERSION,
  SHOT_PROVENANCE_VERSION,
  CAPTURE_PROVENANCE_VERSION,
  IMAGE_ENVELOPE_SCHEMA_VERSION,
  KINDS,
  LIMITS
} = stateApi;
assert.equal(BODY_MODEL_SHA256, BODY_MODEL_ASSET.sha256);
assert.equal(BODY_MODEL_PREPROCESSING_VERSION, MODEL_PREPROCESSING_VERSION);
assert.equal(BODY_REFERENCE_VERSION, MODEL_REFERENCE_VERSION);
assert.equal(PIPELINE_VERSION, MODEL_PIPELINE_VERSION,
  'restore binding and production model module must name one exact pipeline');
assert.ok(PIPELINE_VERSION.includes(BODY_MODEL_SHA256));

const NOW = 1_800_000_000_000;
const TS = NOW - 1000;
const validMetrics = Object.freeze({
  whtr: 0.21,
  whr: 0.82,
  vTaper: 1.42,
  shoulderHip: 1.21,
  legTorso: 1.55,
  symmetry: 0.05
});

function jsonClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function shotProvenance(overrides = {}) {
  return {
    kind: KINDS.SHOT_PROVENANCE,
    version: SHOT_PROVENANCE_VERSION,
    pipelineVersion: PIPELINE_VERSION,
    source: 'upload',
    route: 'model',
    framing: 'full',
    framingBand: 'pass',
    framingOverride: false,
    outlineOverride: false,
    outlineIssues: [],
    bareGeometry: false,
    skinFrac: 0.18,
    timestamp: TS,
    captureProvenance: null,
    ...overrides
  };
}

function modelShot(overrides = {}) {
  const provenance = overrides.provenance || shotProvenance();
  const out = {
    kind: KINDS.SHOT,
    version: SHOT_SCHEMA_VERSION,
    pipelineVersion: PIPELINE_VERSION,
    route: 'model',
    raw: 25,
    provenance,
    ...overrides
  };
  delete out.metrics;
  return out;
}

function geometryShot(overrides = {}) {
  const provenance = overrides.provenance || shotProvenance({
    route: 'geometry',
    bareGeometry: true,
    skinFrac: 0.72
  });
  const out = {
    kind: KINDS.SHOT,
    version: SHOT_SCHEMA_VERSION,
    pipelineVersion: PIPELINE_VERSION,
    route: 'geometry',
    metrics: { ...validMetrics },
    provenance,
    ...overrides
  };
  delete out.raw;
  return out;
}

function modelState(overrides = {}) {
  return {
    kind: KINDS.STATE,
    schemaVersion: STATE_SCHEMA_VERSION,
    pipelineVersion: PIPELINE_VERSION,
    shots: [modelShot()],
    metrics: { ...validMetrics },
    model: 0.55,
    modelRaw: 25,
    score: 5.7,
    sex: 'f',
    sexAuto: false,
    sexSource: 'manual',
    sexConf: null,
    sexManual: true,
    sexClsSex: null,
    sexClsConf: null,
    sexUnknownReason: '',
    reliability: 'Pose and silhouette read completed.',
    framing: 'full',
    framingOverride: false,
    outlineOverride: false,
    outlineIssues: [],
    bareGeometry: false,
    skinFrac: 0.18,
    measuredAt: TS,
    ...overrides
  };
}

function geometryState(overrides = {}) {
  return modelState({
    shots: [geometryShot()],
    model: null,
    modelRaw: null,
    score: 6.1,
    bareGeometry: true,
    skinFrac: 0.72,
    ...overrides
  });
}

function cameraCapture(overrides = {}) {
  return {
    version: CAPTURE_PROVENANCE_VERSION,
    source: 'camera',
    trigger: 'manual',
    guidePassed: true,
    guideCode: 'ready',
    guideMetrics: {
      bodyScale: 0.91,
      bodyWidthScale: 0.84,
      centerOffsetDisplay: 1.2,
      centerOffsetRaw: -1.2,
      feetLineOffset: 0.5,
      headY: 8,
      feetY: 92,
      boundsMinX: 30,
      boundsMaxX: 70,
      boundsMinY: 8,
      boundsMaxY: 92,
      boundsWidth: 40,
      boundsHeight: 84,
      confidentLandmarks: 29,
      minLandmarkConfidence: 0.61,
      torsoCenterX: 50,
      ignored: 999
    },
    poseQuality: {
      ok: true,
      code: 'ok',
      framing: 'full',
      band: 'pass',
      metrics: {
        lowerConfidence: 0.91,
        shoulderTorso: 0.84,
        hipTorso: 0.61,
        yawDeg: 8,
        tilt: 0.04,
        thighVertical: [0.9, 0.88],
        shinVertical: [0.93, 0.92],
        ignored: 999
      },
      landmarks: [{ x: 0.5, y: 0.5 }]
    },
    frameWidth: 1920,
    frameHeight: 1080,
    timestamp: TS - 100,
    image: 'must never survive',
    ...overrides
  };
}

// The valid model and geometry states are copied, allowlisted, finite, and route-consistent.
const cleanModel = stateApi.sanitizeBodyPersistedState(modelState({ injected: '<script>' }), NOW);
assert.ok(cleanModel);
const cleanModelPlain = jsonClone(cleanModel);
assert.equal(cleanModelPlain.kind, 'body-state');
assert.equal(cleanModelPlain.pipelineVersion, PIPELINE_VERSION);
assert.equal(cleanModelPlain.shots.length, 1);
assert.equal(cleanModelPlain.shots[0].route, 'model');
assert.ok(!Object.hasOwn(cleanModelPlain, 'injected'));
assert.ok(!Object.hasOwn(cleanModelPlain.metrics, 'injected'));
assert.ok(stateApi.sanitizeBodyPersistedState(geometryState(), NOW));

// Known metric fields are finite and ranged; unknown keys are never reflected.
const metricResult = jsonClone(stateApi.sanitizeBodyMetrics({ ...validMetrics, arbitrary: 42, __protoPollution: 1 }));
assert.deepEqual(metricResult, validMetrics);
for (const key of Object.keys(validMetrics)) {
  for (const bad of [NaN, Infinity, -Infinity, null, '1']) {
    assert.equal(stateApi.sanitizeBodyMetrics({ ...validMetrics, [key]: bad }), null, `${key} rejects ${String(bad)}`);
  }
}
assert.equal(stateApi.sanitizeBodyMetrics({ ...validMetrics, whr: 3.01 }), null);
assert.equal(stateApi.sanitizeBodyMetrics({}), null);
assert.equal(stateApi.sanitizeBodyMetrics([]), null);

// Raw, model percentile, and displayed-score domains fail closed.
for (const raw of [-0.001, 100.001, NaN, Infinity]) {
  const candidate = modelState({ modelRaw: raw, shots: [modelShot({ raw })] });
  assert.equal(stateApi.sanitizeBodyPersistedState(candidate, NOW), null, `raw ${raw} rejected`);
}
for (const model of [-0.001, 1.001, NaN, Infinity, '0.5']) {
  assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ model }), NOW), null, `model ${String(model)} rejected`);
}
for (const score of [0.999, 10.001, NaN, Infinity, '5']) {
  assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ score }), NOW), null, `score ${String(score)} rejected`);
}
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ modelRaw: 26 }), NOW), null,
  'state modelRaw must bind to the latest model shot');
assert.equal(stateApi.sanitizeBodyPersistedState(geometryState({ model: 0, modelRaw: 0 }), NOW), null,
  'geometry current shot cannot resurrect a stale model result');

// A shot is one instrument only, and no malformed member is silently filtered from identity aggregation.
assert.equal(stateApi.sanitizeBodyShot({ ...modelShot(), metrics: validMetrics }, NOW), null);
assert.equal(stateApi.sanitizeBodyShot({ ...geometryShot(), raw: 22 }, NOW), null);
assert.equal(stateApi.sanitizeBodyShot(modelShot({
  provenance: shotProvenance({ route: 'geometry' })
}), NOW), null);
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ shots: [] }), NOW), null);
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({
  shots: [modelShot(), modelShot(), modelShot(), modelShot()]
}), NOW), null, 'more than three shots are rejected rather than truncated');
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ shots: [modelShot(), { route: 'model', raw: 20 }] }), NOW), null);

// Exact state/shot/pipeline binding rejects old unversioned records and near-miss versions.
const legacyState = {
  shots: [{ route: 'model', raw: 25 }], metrics: validMetrics, model: 0.5, modelRaw: 25,
  sex: 'f', sexSource: 'manual', sexManual: true, measuredAt: TS
};
assert.equal(stateApi.sanitizeBodyPersistedState(legacyState, NOW), null);
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ schemaVersion: STATE_SCHEMA_VERSION + 1 }), NOW), null);
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ pipelineVersion: `${PIPELINE_VERSION}-stale` }), NOW), null);
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ kind: KINDS.INPUTS }), NOW), null);
assert.equal(stateApi.sanitizeBodyShot(modelShot({ version: SHOT_SCHEMA_VERSION + 1 }), NOW), null);
const incompatibleModelPipeline = PIPELINE_VERSION.replace(BODY_MODEL_SHA256, '0'.repeat(64));
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ pipelineVersion: incompatibleModelPipeline }), NOW), null,
  'a raw shot bound to different ONNX bytes is rejected');

// Sex, source, manual, classifier, and confidence state must describe one coherent precedence path.
for (const patch of [
  { sexSource: 'manual', sexManual: false },
  { sexSource: 'manual', sexAuto: true },
  { sexSource: 'manual', sex: null },
  { sexSource: 'guess', sexManual: false, sexAuto: true, sexConf: 0.4 },
  { sexSource: 'unknown', sex: 'm', sexManual: false, sexAuto: true },
  { sexSource: 'invented' },
  { sexClsSex: 'm', sexClsConf: null },
  { sexClsSex: null, sexClsConf: 0.8 }
]) assert.equal(stateApi.sanitizeBodyPersistedState(modelState(patch), NOW), null, `incoherent sex patch ${JSON.stringify(patch)}`);

const modelSex = modelState({
  sex: 'm', sexAuto: true, sexSource: 'model', sexConf: 0.88, sexManual: false,
  sexClsSex: 'm', sexClsConf: 0.88
});
assert.ok(stateApi.sanitizeBodyPersistedState(modelSex, NOW));
assert.equal(stateApi.sanitizeBodyPersistedState({ ...modelSex, sexClsSex: 'f' }, NOW), null);
const unconfirmedSex = modelState({
  sex: null, sexAuto: true, sexSource: 'unconfirmed', sexConf: 0.7, sexManual: false,
  sexClsSex: 'm', sexClsConf: 0.7, sexUnknownReason: 'The face-model suggestion was below threshold.'
});
assert.ok(stateApi.sanitizeBodyPersistedState(unconfirmedSex, NOW));
assert.equal(stateApi.sanitizeBodyPersistedState({ ...unconfirmedSex, sexUnknownReason: '' }, NOW), null);

// Every persisted string used by result markup is bounded plain text, not sanitized HTML.
assert.equal(stateApi.sanitizePlainText('Arms & hips clear — readable.', 100, false), 'Arms & hips clear — readable.');
for (const hostile of [
  '<img src=x onerror=alert(1)>',
  '&lt;script&gt;alert(1)&lt;/script&gt;',
  'line one\nline two',
  `okay\u0000bad`
]) assert.equal(stateApi.sanitizePlainText(hostile, 1000, true), null, `hostile text rejected: ${hostile}`);
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ reliability: '<b>trusted</b>' }), NOW), null);
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ reliability: 'x'.repeat(LIMITS.MAX_RELIABILITY_LENGTH + 1) }), NOW), null);
assert.equal(stateApi.sanitizeBodyPersistedState(unconfirmedSex && { ...unconfirmedSex, sexUnknownReason: '<img src=x>' }, NOW), null);
const htmlIssueShot = geometryShot({
  provenance: shotProvenance({
    route: 'geometry', bareGeometry: true, skinFrac: 0.72,
    outlineOverride: true, outlineIssues: ['<svg onload=alert(1)>']
  })
});
assert.equal(stateApi.sanitizeBodyShot(htmlIssueShot, NOW), null);

// Override flags, reasons, current state, and latest per-shot provenance cannot contradict each other.
assert.equal(stateApi.sanitizeShotProvenance(shotProvenance({ framingBand: 'degraded' }), NOW), null);
assert.equal(stateApi.sanitizeShotProvenance(shotProvenance({ framingOverride: true }), NOW), null);
assert.equal(stateApi.sanitizeShotProvenance(shotProvenance({ outlineOverride: true, outlineIssues: [] }), NOW), null);
assert.equal(stateApi.sanitizeShotProvenance(shotProvenance({ outlineOverride: false, outlineIssues: ['waist hidden'] }), NOW), null);
assert.equal(stateApi.sanitizeShotProvenance(shotProvenance({ route: 'model', bareGeometry: true }), NOW), null);
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ framing: 'torso' }), NOW), null);
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ skinFrac: 0.2 }), NOW), null);
assert.equal(stateApi.sanitizeBodyPersistedState(modelState({ measuredAt: TS + 1 }), NOW), null);

// BodyCameraGuide-compatible, image-free camera capture provenance is exact and finite.
const cleanCapture = jsonClone(stateApi.sanitizeCaptureProvenance(cameraCapture(), NOW));
assert.deepEqual(cleanCapture.guideMetrics, {
  bodyScale: 0.91,
  bodyWidthScale: 0.84,
  centerOffsetDisplay: 1.2,
  centerOffsetRaw: -1.2,
  feetLineOffset: 0.5,
  headY: 8,
  feetY: 92,
  boundsMinX: 30,
  boundsMaxX: 70,
  boundsMinY: 8,
  boundsMaxY: 92,
  boundsWidth: 40,
  boundsHeight: 84,
  confidentLandmarks: 29,
  minLandmarkConfidence: 0.61,
  torsoCenterX: 50
});
assert.deepEqual(cleanCapture.poseQuality.metrics.thighVertical, [0.9, 0.88]);
assert.ok(!Object.hasOwn(cleanCapture, 'image'));
assert.ok(!Object.hasOwn(cleanCapture.poseQuality, 'landmarks'));
assert.ok(!Object.hasOwn(cleanCapture.guideMetrics, 'ignored'));

for (const capture of [
  cameraCapture({ version: 99 }),
  cameraCapture({ source: 'upload' }),
  cameraCapture({ trigger: 'timer' }),
  cameraCapture({ guideCode: '<img>' }),
  cameraCapture({ guidePassed: false }),
  cameraCapture({ frameWidth: 0 }),
  cameraCapture({ frameWidth: Infinity }),
  cameraCapture({ frameWidth: LIMITS.MAX_FRAME_DIMENSION + 1 }),
  cameraCapture({ timestamp: NOW + LIMITS.MAX_FUTURE_SKEW_MS + 1 }),
  cameraCapture({ guideMetrics: { bodyScale: NaN } }),
  cameraCapture({ guideMetrics: { confidentLandmarks: 2.5 } }),
  cameraCapture({ poseQuality: { ok: true, code: 'standing', framing: 'full', band: 'pass', metrics: {} } }),
  cameraCapture({ poseQuality: { ok: true, code: 'ok', framing: 'full', band: 'pass', metrics: { thighVertical: [0.9, Infinity] } } })
]) assert.equal(stateApi.sanitizeCaptureProvenance(capture, NOW), null);

const noBody = cameraCapture({
  guidePassed: false,
  guideCode: 'no_body',
  guideMetrics: null,
  poseQuality: null
});
assert.ok(stateApi.sanitizeCaptureProvenance(noBody, NOW));
assert.equal(stateApi.sanitizeCaptureProvenance({ ...noBody, guideMetrics: { bodyScale: 0 } }, NOW), null);

const cameraProvenance = shotProvenance({
  source: 'camera',
  captureProvenance: cameraCapture()
});
assert.ok(stateApi.sanitizeShotProvenance(cameraProvenance, NOW));
assert.equal(stateApi.sanitizeShotProvenance({ ...cameraProvenance, captureProvenance: null }, NOW), null);
assert.equal(stateApi.sanitizeShotProvenance(shotProvenance({ captureProvenance: cameraCapture() }), NOW), null,
  'non-camera sources cannot smuggle camera provenance');
assert.equal(stateApi.sanitizeShotProvenance({
  ...cameraProvenance,
  captureProvenance: cameraCapture({ timestamp: TS - LIMITS.MAX_CAPTURE_TO_ANALYSIS_MS - 1 })
}, NOW), null);

// Self-report persistence keeps legitimate partial records, but rejects impossible or contradictory values.
function inputs(overrides = {}) {
  return {
    kind: KINDS.INPUTS,
    schemaVersion: INPUTS_SCHEMA_VERSION,
    pipelineVersion: PIPELINE_VERSION,
    heightCm: 178,
    weightKg: 77,
    bfPct: 18,
    bfSource: 'measured',
    sex: 'm',
    skipInputs: false,
    ts: TS,
    ...overrides
  };
}
assert.ok(stateApi.sanitizeBodyInputs(inputs(), NOW));
assert.ok(stateApi.sanitizeBodyInputs(inputs({ heightCm: null, weightKg: null }), NOW), 'partial BF record is valid');
assert.ok(stateApi.sanitizeBodyInputs(inputs({ bfPct: 20, bfSource: 'picker' }), NOW));
assert.ok(stateApi.sanitizeBodyInputs(inputs({
  heightCm: null, weightKg: null, bfPct: null, bfSource: null, sex: null, skipInputs: true
}), NOW), 'an explicit skip-only record is meaningful');
for (const candidate of [
  inputs({ heightCm: NaN }),
  inputs({ heightCm: 129.99 }),
  inputs({ weightKg: 301 }),
  inputs({ bfPct: 76 }),
  inputs({ bfPct: null, bfSource: 'measured' }),
  inputs({ bfPct: 18, bfSource: null }),
  inputs({ bfPct: 18, bfSource: 'picker' }),
  inputs({ bfPct: 20, bfSource: 'picker', sex: null }),
  inputs({ heightCm: 130, weightKg: 300 }),
  inputs({ skipInputs: 1 }),
  inputs({ ts: Infinity }),
  inputs({ pipelineVersion: 'legacy' }),
  { heightCm: 178, weightKg: 77, bfPct: 18, bfSource: 'measured', sex: 'm', skipInputs: false, ts: TS }
]) assert.equal(stateApi.sanitizeBodyInputs(candidate, NOW), null, `bad inputs rejected: ${JSON.stringify(candidate)}`);
assert.equal(stateApi.sanitizeBodyInputs(inputs({
  heightCm: null, weightKg: null, bfPct: null, bfSource: null, sex: null, skipInputs: false
}), NOW), null, 'empty non-skip record is not persisted');

// Saved image envelopes accept only bounded local raster data URLs and must bind to the exact state timestamp.
const onePixelPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
function envelope(overrides = {}) {
  return {
    kind: KINDS.IMAGE_ENVELOPE,
    schemaVersion: IMAGE_ENVELOPE_SCHEMA_VERSION,
    pipelineVersion: PIPELINE_VERSION,
    img: onePixelPng,
    width: 768,
    height: 1024,
    state: modelState(),
    ts: TS,
    ...overrides
  };
}
const cleanEnvelope = jsonClone(stateApi.sanitizeSavedImageEnvelope(envelope({ injected: '<script>' }), NOW));
assert.equal(cleanEnvelope.mimeType, 'image/png');
assert.ok(cleanEnvelope.byteLength > 0 && cleanEnvelope.byteLength < 1000);
assert.ok(!Object.hasOwn(cleanEnvelope, 'injected'));
for (const candidate of [
  envelope({ img: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=' }),
  envelope({ img: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBA==' }),
  envelope({ img: 'data:image/png;base64,not valid' }),
  envelope({ img: 'data:image/png;base64,AAA' }),
  envelope({ width: 0 }),
  envelope({ width: 100.5 }),
  envelope({ width: LIMITS.MAX_SAVED_DIMENSION + 1 }),
  envelope({ width: 4096, height: 4097 }),
  envelope({ ts: TS + 1 }),
  envelope({ state: legacyState }),
  envelope({ schemaVersion: 0 }),
  { img: onePixelPng, state: modelState(), ts: TS }
]) assert.equal(stateApi.sanitizeSavedImageEnvelope(candidate, NOW), null);

const oversizedPayload = 'A'.repeat(Math.ceil((LIMITS.MAX_SAVED_IMAGE_BYTES + 3) / 3) * 4);
assert.equal(stateApi.sanitizeRasterDataURL(`data:image/jpeg;base64,${oversizedPayload}`), null,
  'oversized data URLs are rejected before persistence');

// Deterministic hostile-value fuzz: sanitizers never throw, echo object identity, or emit non-finite/HTML values.
const hostileValues = [
  undefined, null, true, false, 0, -1, NaN, Infinity, -Infinity, 1n, Symbol('x'),
  '', '<script>', '&lt;img&gt;', [], [NaN], {}, { __proto__: { polluted: true } },
  { kind: KINDS.STATE, schemaVersion: STATE_SCHEMA_VERSION, pipelineVersion: PIPELINE_VERSION }
];

let seed = 0x5eed1234;
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed / 0x100000000;
}
function fuzzValue(depth = 0) {
  const scalars = [null, true, false, NaN, Infinity, -Infinity, random() * 1e20, '<img onerror=x>', 'plain'];
  if (depth > 2 || random() < 0.55) return scalars[Math.floor(random() * scalars.length)];
  if (random() < 0.5) return Array.from({ length: Math.floor(random() * 6) }, () => fuzzValue(depth + 1));
  const out = {};
  for (let index = 0; index < Math.floor(random() * 8); index += 1) out[`k${index}`] = fuzzValue(depth + 1);
  return out;
}
for (let index = 0; index < 400; index += 1) hostileValues.push(fuzzValue());

function assertSafeOutput(value, trail = 'root') {
  if (typeof value === 'number') assert.ok(Number.isFinite(value), `${trail} finite`);
  else if (typeof value === 'string') assert.ok(!/[<>\u0000-\u001f\u007f]/.test(value), `${trail} inert text`);
  else if (Array.isArray(value)) value.forEach((item, index) => assertSafeOutput(item, `${trail}[${index}]`));
  else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) assertSafeOutput(item, `${trail}.${key}`);
  }
}

for (const hostile of hostileValues) {
  for (const sanitizer of [
    stateApi.sanitizeBodyMetrics,
    stateApi.sanitizeCaptureProvenance,
    stateApi.sanitizeShotProvenance,
    stateApi.sanitizeBodyShot,
    stateApi.sanitizeBodyPersistedState,
    stateApi.sanitizeBodyInputs,
    stateApi.sanitizeRasterDataURL,
    stateApi.sanitizeSavedImageEnvelope
  ]) {
    let result;
    assert.doesNotThrow(() => { result = sanitizer(hostile, NOW); });
    if (result != null) {
      assert.notEqual(result, hostile, 'sanitizer returns a fresh allowlisted record');
      assertSafeOutput(result);
    }
  }
}

console.log('body-state: strict binding, route/sex coherence, finite bounds, inert text, capture provenance, image envelopes, and fuzz tests passed');
