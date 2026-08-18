import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'face.html'), 'utf8');
const marker = html.indexOf('<!-- ===== Pure scoring core (DOM-free, testable) ===== -->');
assert.ok(marker >= 0, 'pure scoring core marker should exist');
const scriptStart = html.indexOf('<script>', marker) + '<script>'.length;
const scriptEnd = html.indexOf('</script>', scriptStart);
assert.ok(scriptStart > marker && scriptEnd > scriptStart, 'pure scoring core script should be extractable');

const context = {
  module: { exports: {} },
  console,
  Math,
  Number,
  Object,
  Array,
  Float32Array,
  Infinity,
  NaN
};
vm.createContext(context);
new vm.Script(html.slice(scriptStart, scriptEnd), { filename: 'face.html#pure-scoring-core' }).runInContext(context);
const core = context.module.exports;

assert.equal(core.REF_RAW.length, 101, 'reference curve should retain percentile knots 0..100');
for (let index = 1; index < core.REF_RAW.length; index += 1) {
  assert.ok(core.REF_RAW[index] > core.REF_RAW[index - 1], `REF_RAW must be strictly increasing at ${index}`);
}

const probes = [
  core.REF_RAW[0] - 10,
  ...core.REF_RAW.flatMap((value, index) => index ? [(core.REF_RAW[index - 1] + value) / 2, value] : [value]),
  core.REF_RAW.at(-1) + 10
];
let previousPercentile = -Infinity;
let previousScore = -Infinity;
for (const raw of probes) {
  const percentile = core.refPercentile(raw);
  const score = core.scoreFromRaw(raw);
  assert.ok(Number.isFinite(percentile) && percentile >= 0 && percentile <= 1);
  assert.ok(Number.isFinite(score) && score >= 1 && score <= 10);
  assert.ok(percentile >= previousPercentile, `reference percentile regressed at raw=${raw}`);
  assert.ok(score >= previousScore, `score map regressed at raw=${raw}`);
  previousPercentile = percentile;
  previousScore = score;
}

for (const bad of [NaN, Infinity, -Infinity]) {
  assert.equal(core.scoreFromRaw(bad), null);
  assert.equal(core.scorePercentile(bad), null);
}

// Multi-photo contract: discard non-finite inputs, average raws, map exactly once.
for (const raws of [
  [2.2],
  [2.2, 3.6],
  [2.2, 3.6, 4.1],
  [2.2, NaN, Infinity, 3.6]
]) {
  const finiteRaws = raws.filter(Number.isFinite);
  const expected = finiteRaws.length
    ? core.scoreFromRaw(finiteRaws.reduce((sum, value) => sum + value, 0) / finiteRaws.length)
    : null;
  assert.equal(core.scoreFromRaws(raws), expected);
}
assert.equal(core.scoreFromRaws([]), null);
assert.equal(core.scoreFromRaws([NaN, Infinity]), null);

// User-facing preprocessing outputs stay finite under the production contract.
const tensor = core.preprocessToTensor(
  new Uint8ClampedArray([0, 127, 255, 255, 255, 0, 127, 255, 23, 42, 61, 255, 99, 100, 101, 255]),
  2,
  [0.485, 0.456, 0.406],
  [0.229, 0.224, 0.225]
);
assert.equal(tensor.length, 12);
assert.ok(Array.from(tensor).every(Number.isFinite), 'preprocessing must not emit NaN/Infinity');

// Framing thresholds: warn/refuse edges are inclusive, and z-less fallback is exclusive of live yaw.
const base = { yawDeg: 0, pitchDeg: 1, rollDeg: 0, poseSkew: 0 };
assert.equal(core.classifyFraming({ ...base, yawDeg: core.FRAMING_GATE.yawDeg.warn - 0.001 }).band, 'pass');
assert.equal(core.classifyFraming({ ...base, yawDeg: core.FRAMING_GATE.yawDeg.warn }).band, 'degraded');
assert.equal(core.classifyFraming({ ...base, yawDeg: core.FRAMING_GATE.yawDeg.refuse }).band, 'refuse');
assert.equal(core.classifyFraming({ ...base, rollDeg: -core.FRAMING_GATE.rollDeg.warn }).band, 'degraded');
assert.equal(core.classifyFraming({ ...base, rollDeg: -core.FRAMING_GATE.rollDeg.refuse }).band, 'refuse');
assert.equal(core.classifyFraming({ yawDeg: 0, pitchDeg: 0, rollDeg: 0, poseSkew: core.FRAMING_GATE.poseSkew.warn - 0.001 }).band, 'pass');
assert.equal(core.classifyFraming({ yawDeg: 0, pitchDeg: 0, rollDeg: 0, poseSkew: core.FRAMING_GATE.poseSkew.warn }).band, 'degraded');
assert.equal(core.classifyFraming({ yawDeg: 0, pitchDeg: 0, rollDeg: 0, poseSkew: core.FRAMING_GATE.poseSkew.refuse }).band, 'refuse');

// Persisted localStorage state is untrusted: every field consumed by rendering must be finite and whitelisted.
const validGeo = {
  symmetry: 0.02, jaw: 0.9, midface: 0.95, fwhr: 2.1, canthal: 4,
  eyeSpacing: 1.01, lips: 0.5, leanness: 0.52, noseWidth: 0.3, eyeOpen: 0.27,
  poseSkew: 0.01, yawDeg: 2, pitchDeg: 1, rollDeg: 1
};
const validSoft = { skin: 80, evenness: 81, undereye: 82, brightness: 83 };
const restored = core.sanitizeFaceRestoreState({
  geo: { ...validGeo, injected: 99 },
  soft: { ...validSoft, injected: 99 },
  shots: [2.5, NaN, 3.1, Infinity, 3.4, 9.9],
  model: 0.5,
  modelRaw: 3.4,
  sex: 'f',
  sexAuto: false,
  sexSource: 'manual',
  sexManual: true,
  sexConf: NaN,
  sexClsSex: 'm',
  sexClsConf: 0.91,
  reliability: 42,
  framingOverride: true,
  measuredAt: Infinity,
  captureProvenance: {
    version: 900,
    source: 'camera',
    trigger: 'manual',
    guidePassed: true,
    alignmentCode: 'center_face',
    alignmentMetrics: { faceScale: 0.9, centerOffsetRaw: 6, yawDeg: Infinity, secret: 5 },
    frameWidth: 1919.6,
    frameHeight: -5,
    image: 'must-not-survive'
  },
  injected: '<script>'
}, 123456);
const restoredPlain = JSON.parse(JSON.stringify(restored));
assert.deepEqual(restoredPlain.geo, validGeo, 'restore keeps only the complete finite geometry schema');
assert.deepEqual(restoredPlain.soft, validSoft, 'restore keeps only the complete finite pixel schema');
assert.deepEqual(restoredPlain.shots, [2.5, 3.1, 3.4], 'restore filters non-finite raws and enforces MAX_SHOTS');
assert.equal(restoredPlain.reliability, '', 'non-string reliability cannot reach string rendering methods');
assert.equal(restoredPlain.measuredAt, 123456, 'non-finite timestamp uses the supplied finite fallback');
assert.deepEqual(restoredPlain.captureProvenance, {
  version: 1,
  source: 'camera',
  trigger: 'manual',
  guidePassed: false,
  alignmentCode: 'center_face',
  alignmentMetrics: { faceScale: 0.9, centerOffsetRaw: 6 },
  frameWidth: 1920,
  frameHeight: null
}, 'camera restore provenance is image-free, finite, whitelisted, and derives guidePassed from the code');
assert.ok(!Object.hasOwn(restoredPlain, 'injected'));
assert.ok(!Object.hasOwn(restoredPlain.captureProvenance, 'image'));

for (const key of Object.keys(validGeo)) {
  const malformed = { ...validGeo, [key]: key === 'yawDeg' ? Infinity : undefined };
  assert.equal(core.sanitizeFaceRestoreState({ geo: malformed }, 1), null, `missing/non-finite geo.${key} rejects the restore`);
}
assert.equal(core.sanitizeFaceRestoreState({ geo: {} }, 1), null);
assert.equal(core.sanitizeFaceRestoreState(null, 1), null);
assert.equal(core.sanitizeFaceRestoreState({ geo: validGeo, soft: { skin: NaN } }, 1).soft, null,
  'malformed optional pixel metrics are discarded as a block');
assert.equal(core.sanitizeCaptureProvenance({ source: 'upload' }), null);
assert.equal(core.sanitizeCaptureProvenance({ source: 'camera', alignmentCode: 'invented' }).alignmentCode, 'no_face');

function assertFiniteNumbers(value, trail = 'root') {
  if (typeof value === 'number') assert.ok(Number.isFinite(value), `${trail} must be finite`);
  else if (Array.isArray(value)) value.forEach((item, index) => assertFiniteNumbers(item, `${trail}[${index}]`));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => assertFiniteNumbers(item, `${trail}.${key}`));
}
assertFiniteNumbers(restoredPlain);

console.log('face-core: monotonicity, raw averaging, framing boundaries, finite outputs, and restore sanitization passed');
