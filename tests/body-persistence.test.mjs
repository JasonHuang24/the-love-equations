import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const compositeSource = fs.readFileSync(path.join(root, 'js', 'composite-score.js'), 'utf8');
const bodyHtml = fs.readFileSync(path.join(root, 'body.html'), 'utf8');
const bodyStateSource = fs.readFileSync(path.join(root, 'js', 'body-state.js'), 'utf8');

const FACE_KEY = 'loveEquations.faceScore.v3';
const BODY_KEY = 'loveEquations.bodyScore.v3';
const SHOT_KEY = 'loveEquations.bodyShot.v1';
const INPUTS_KEY = 'loveEquations.bodyInputs.v1';
const NOW = Date.now();

class MemoryStorage {
  constructor(entries = []) { this.map = new Map(entries); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
}

const storage = new MemoryStorage();
const host = { innerHTML: '' };
let bodyReset = 0;
let faceReset = 0;
const documentObject = {
  getElementById(id) { return id === 'composite-result' ? host : null; },
  addEventListener() {}
};
const windowObject = {
  addEventListener() {},
  location: { reload() {} },
  bcResetAll() { bodyReset += 1; },
  lcResetAll() { faceReset += 1; }
};
const context = vm.createContext({
  window: windowObject,
  document: documentObject,
  localStorage: storage,
  console
});
vm.runInContext(compositeSource, context, { filename: 'js/composite-score.js' });
const api = windowObject.leComposite;
assert.ok(api, 'shared composite API loads');

function face(overrides = {}) {
  return {
    bp: 5.73,
    cv: 5.73,
    band: 0.7,
    bpMax: 10,
    cvMax: 10,
    floor: 1,
    convention: 'percentile-v3.1',
    photos: 1,
    source: 'model',
    sex: 'f',
    ts: NOW,
    framingOverride: false,
    ...overrides
  };
}

function body(overrides = {}) {
  return {
    schemaVersion: 3,
    bp: 6.5,
    cv: 6.5,
    band: 0.8,
    bpMax: 10,
    cvMax: 10,
    floor: 1,
    convention: 'percentile-v3.1',
    photos: 2,
    source: 'model',
    sex: null,
    sexSource: 'unknown',
    sexConfirmed: false,
    ts: NOW,
    framingOverride: false,
    overrideReason: '',
    ...overrides
  };
}

function setJson(key, value) { storage.setItem(key, JSON.stringify(value)); }

// Face remains backward-compatible: it has no schemaVersion today and may retain exact internal precision.
setJson(FACE_KEY, face());
setJson(BODY_KEY, body());
api.render();
assert.ok(storage.getItem(FACE_KEY), 'current Face payload remains accepted');
assert.ok(storage.getItem(BODY_KEY), 'strict Body payload is accepted');
assert.match(host.innerHTML, /Face <strong>5\.7<\/strong>.*Body <strong>6\.5<\/strong>/s);

// Every field that can affect the blend or reach markup is finite, bounded, versioned, and allowlisted.
const invalidBodies = [
  body({ schemaVersion: 2 }),
  body({ bp: 6.25, cv: 6.25 }),
  body({ bp: 0.9, cv: 0.9 }),
  body({ bpMax: 100 }),
  body({ band: Infinity }),
  body({ photos: 4 }),
  body({ ts: NOW + 10 * 60 * 1000 }),
  body({ source: '<img src=x onerror=alert(1)>' }),
  body({ source: 'geometry', sex: 'm', sexSource: 'guess', sexConfirmed: false }),
  body({ source: 'hybrid', sex: 'f', sexSource: 'manual', sexConfirmed: false }),
  body({ sex: null, sexSource: 'manual', sexConfirmed: true }),
  body({ framingOverride: true, overrideReason: '' }),
  body({ framingOverride: false, overrideReason: 'outline' })
];
for (const candidate of invalidBodies) {
  setJson(BODY_KEY, candidate);
  api.render();
  assert.equal(storage.getItem(BODY_KEY), null, `invalid Body payload removed: ${JSON.stringify(candidate)}`);
  assert.doesNotMatch(host.innerHTML, /onerror|<img src=x/);
}

for (const candidate of [
  face({ source: '<svg onload=alert(1)>' }),
  face({ cv: 6 }),
  face({ bp: NaN }),
  face({ framingOverride: 'yes' })
]) {
  setJson(FACE_KEY, candidate);
  api.render();
  assert.equal(storage.getItem(FACE_KEY), null, 'invalid Face payload is quarantined without changing valid Face semantics');
}

// A geometry/self-report score that still needs confirmed sex uses a separate exact schema.
setJson(BODY_KEY, { schemaVersion: 3, needsSex: true, sexSource: 'guess', ts: NOW });
api.render();
assert.ok(storage.getItem(BODY_KEY));
assert.match(host.innerHTML, /set a sex to resolve its score/);
for (const candidate of [
  { schemaVersion: 2, needsSex: true, sexSource: 'guess', ts: NOW },
  { schemaVersion: 3, needsSex: true, sexSource: '<img>', ts: NOW },
  { schemaVersion: 3, needsSex: true, sexSource: 'manual', ts: NOW },
  { schemaVersion: 3, needsSex: true, sexSource: 'unknown', ts: Infinity }
]) {
  setJson(BODY_KEY, candidate);
  api.render();
  assert.equal(storage.getItem(BODY_KEY), null);
}

// Global reset still preserves the shipped Face behavior while clearing every Body persistence layer.
setJson(FACE_KEY, face());
setJson(BODY_KEY, body());
storage.setItem(SHOT_KEY, 'saved');
storage.setItem(INPUTS_KEY, 'saved');
api.reset();
for (const key of [FACE_KEY, BODY_KEY, SHOT_KEY, INPUTS_KEY]) assert.equal(storage.getItem(key), null);
assert.equal(bodyReset, 1);
assert.equal(faceReset, 1);

// Browser integration contracts: atomic image/state restore, manual-only input sex, half-point public score,
// inferred-sex retirement, input rerender on unknown sex, and quota failure clearing the composite.
for (const fragment of [
  '<script src="js/body-state.js?v=1.0"></script>',
  'BS.sanitizeSavedImageEnvelope(value, Date.now())',
  'const clean = BS.sanitizeBodyPersistedState(value, Date.now())',
  'const manualSex = BC.sexManual',
  'bp:displayedScore, cv:displayedScore',
  "BC.source = 'upload'; BC.captureProvenance = null; BC.pendingShotProvenance = null;",
  'bcResetInferredSex(); bcClearShot();',
  'renderInputsPanel(); renderResult();',
  'catch(e){ bcDropPersistedBody(); }'
]) assert.ok(bodyHtml.includes(fragment), `Body integration must contain: ${fragment}`);

assert.ok(bodyHtml.indexOf('BS.sanitizeSavedImageEnvelope(value, Date.now())')
  < bodyHtml.indexOf('im.src = clean.img'), 'saved pixels are not decoded/painted before atomic envelope acceptance');
const restoreFunctionStart = bodyHtml.indexOf('function bcRestoreShot()');
assert.ok(bodyHtml.indexOf('const restoreGeneration = currentGen;', restoreFunctionStart)
  < bodyHtml.indexOf('im.onload = () => {', restoreFunctionStart));
const savedImageLoadStart = bodyHtml.indexOf('im.onload = () => {', bodyHtml.indexOf('function bcRestoreShot()'));
const savedImagePaint = bodyHtml.indexOf('canvas.width = clean.width', savedImageLoadStart);
const savedImageDimensionCheck = bodyHtml.indexOf('im.naturalWidth === clean.width && im.naturalHeight === clean.height', savedImageLoadStart);
const savedImageGenerationCheck = bodyHtml.indexOf('if (!restoreIsCurrent()) return;', savedImageLoadStart);
assert.ok(savedImageLoadStart > 0 && savedImageDimensionCheck > savedImageLoadStart
  && savedImageGenerationCheck > savedImageLoadStart
  && savedImageGenerationCheck < savedImageDimensionCheck && savedImageDimensionCheck < savedImagePaint,
  'restore generation and decoded raster dimensions must be verified before canvas allocation');
assert.match(bodyHtml.slice(savedImageLoadStart, savedImagePaint), /MAX_SAVED_DIMENSION[\s\S]*MAX_SAVED_PIXELS/);
assert.ok(!bodyHtml.includes('BC.shots = restored;'), 'legacy permissive shot reconstruction is removed');

// The public gate hook is hostile-input safe even though gate prompts are intentionally transient.
// BodyState rejects markup/control text at ingress, and renderResult escapes the accepted strings again.
const stateContext = vm.createContext({ console });
vm.runInContext(bodyStateSource, stateContext, { filename: 'js/body-state.js' });
const gateMatch = bodyHtml.match(/window\.bcShowGate = function\(issues, kind\)\{[\s\S]*?\n    \};/);
assert.ok(gateMatch, 'gate hook should be extractable for hostile-input testing');
const gateBC = {};
let gateRenders = 0;
const gateWindow = {};
const gateContext = vm.createContext({
  window: gateWindow,
  BC: gateBC,
  BS: stateContext.BodyState,
  renderResult() { gateRenders += 1; }
});
vm.runInContext(gateMatch[0], gateContext, { filename: 'body.html gate hook' });
gateWindow.bcShowGate([
  'safe framing issue',
  '<img src=x onerror=alert(1)>',
  '&#x3c;svg onload=alert(1)&#x3e;'
], '<svg onload=alert(1)>');
assert.deepEqual(Array.from(gateBC.gate.issues), ['safe framing issue']);
assert.equal(gateBC.gate.kind, 'framing');
assert.equal(gateRenders, 1);
assert.match(bodyHtml, /BC\.gate\.issues\.map\(t => '<li>'\+htmlText\(t\)\+'<\/li>'\)/,
  'gate issues must be escaped at the innerHTML sink');

console.log('body-persistence: strict composite payloads, inert sources, gate injection defense, atomic restore, half-point binding, manual sex, and reset passed');
