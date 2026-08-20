import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  BODY_MODEL_ASSET,
  BODY_MODEL_TIMEOUTS,
  BODY_MODEL_PREPROCESSING_VERSION,
  BODY_PIPELINE_VERSION,
  BODY_REFERENCE_VERSION,
  createGenerationLease,
  createPoseRetryController,
  describeSquareCrop,
  modelCacheName,
  modelCacheKey,
  routePlan,
  shotSetFacts as modelShotSetFacts,
  validateModelBytes,
  withTimeout
} from '../js/body-model-integrity.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'body.html'), 'utf8');
const marker = html.indexOf('<!-- ===== Pure scoring core (DOM-free, testable) ===== -->');
assert.ok(marker >= 0, 'pure Body scoring core marker should exist');
const scriptStart = html.indexOf('<script>', marker) + '<script>'.length;
const scriptEnd = html.indexOf('</script>', scriptStart);
assert.ok(scriptStart > marker && scriptEnd > scriptStart, 'pure Body scoring core should be extractable');

const context = {
  module: { exports: {} },
  console,
  Math,
  Number,
  Object,
  Array,
  Float32Array,
  Uint8Array,
  Infinity,
  NaN
};
vm.createContext(context);
new vm.Script(html.slice(scriptStart, scriptEnd), { filename: 'body.html#pure-scoring-core' }).runInContext(context);
const core = context.module.exports;

function assertFiniteTree(value, trail = 'root') {
  if (typeof value === 'number') assert.ok(Number.isFinite(value), `${trail} must be finite`);
  else if (Array.isArray(value)) value.forEach((item, index) => assertFiniteTree(item, `${trail}[${index}]`));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([key, item]) => assertFiniteTree(item, `${trail}.${key}`));
}

// Both frozen maps retain their exact percentile-knot contract and are monotone.
for (const [name, table] of [['REF_RAW', core.REF_RAW], ['GEOM_REF_RAW', core.GEOM_REF_RAW]]) {
  assert.equal(table.length, 101, `${name} should contain p0..p100`);
  for (let index = 1; index < table.length; index += 1) {
    assert.ok(table[index] >= table[index - 1], `${name} regressed at knot ${index}`);
  }
  const probes = [table[0] - 1, ...table, ...table.slice(1).map((value, index) => (table[index] + value) / 2), table.at(-1) + 1].sort((a, b) => a - b);
  let previous = -Infinity;
  for (const raw of probes) {
    const percentile = core.tablePercentile(table, raw);
    assert.ok(Number.isFinite(percentile) && percentile >= 0 && percentile <= 1);
    assert.ok(percentile >= previous, `${name} percentile regressed at raw ${raw}`);
    previous = percentile;
  }
}

// Duplicate knots are legal empirical quantiles: boundaries stay finite and monotone.
const duplicateKnots = [0, 0, 1, 2];
const duplicateReads = [-1, 0, Number.EPSILON, 0.5, 1, 2, 3].map(raw => core.tablePercentile(duplicateKnots, raw));
assert.ok(duplicateReads.every(Number.isFinite));
for (let index = 1; index < duplicateReads.length; index += 1) assert.ok(duplicateReads[index] >= duplicateReads[index - 1]);
for (const bad of [NaN, Infinity, -Infinity]) assert.equal(core.tablePercentile(core.REF_RAW, bad), null);
assert.equal(core.tablePercentile([], 1), null);

let previousScore = -Infinity;
for (let percentile = 0; percentile <= 100; percentile += 0.25) {
  const score = core.pctToScore(percentile);
  assert.ok(Number.isFinite(score) && score >= core.SCORE_MIN && score <= core.SCORE_MAX);
  assert.ok(score >= previousScore, `display score regressed at p${percentile}`);
  previousScore = score;
}
for (const bad of [NaN, Infinity, -Infinity]) {
  assert.equal(core.pctToScore(bad), null);
  assert.equal(core.scoreFromRaw(bad), null);
  assert.equal(core.scorePercentile(bad), null);
}
const publicRangeA = core.publicPercentileRange(7.01);
const publicRangeB = core.publicPercentileRange(7.24);
const publicRangeNext = core.publicPercentileRange(7.26);
assert.equal(JSON.stringify(publicRangeA), JSON.stringify(publicRangeB),
  'hidden continuous values with one public half-point must expose one percentile band');
assert.equal(publicRangeA.score, 7);
assert.equal(publicRangeNext.score, 7.5);
assert.notEqual(JSON.stringify(publicRangeA), JSON.stringify(publicRangeNext));
assert.ok([publicRangeA.low, publicRangeA.high].every(value =>
  value === 1 || value === 99 || value % 5 === 0), 'public percentile band uses coarse five-point bounds');
assert.ok(publicRangeA.low <= publicRangeA.high);
assert.equal(core.publicPercentileRange(NaN), null);

// Geometry with no surviving scored cue is absence, never a synthetic zero/typicality score.
assert.equal(core.geomWeighted({}, 'blackpill'), null);
assert.equal(core.geomRawFor({}, 'm'), null);
assert.equal(core.geomRawFor({ whtr: 0.45 }, 'f'), null, 'uncalibrated WHtR alone is not a scored geometry cue');
assert.equal(core.shotPercentile({ route: 'geometry', metrics: {} }, 'm'), null);
assert.equal(core.computeComposites({ whtr: 0.45 }, 'm').typicality, null);

const geometryMetrics = { whr: 0.72, vTaper: 1.52, shoulderHip: 1.25, legTorso: 1.05, symmetry: 0.08 };
const geometryM = core.shotPercentile({ route: 'geometry', metrics: geometryMetrics }, 'm');
const geometryF = core.shotPercentile({ route: 'geometry', metrics: geometryMetrics }, 'f');
assert.ok(Number.isFinite(geometryM) && Number.isFinite(geometryF));
assert.notEqual(geometryM, geometryF, 'geometry route should retain sex-specific bands');
const modelShot = { route: 'model', raw: core.REF_RAW[50] };
assert.equal(core.shotPercentile(modelShot, 'm'), core.shotPercentile(modelShot, 'f'), 'model route is sex-agnostic');
assert.equal(core.shotsNeedSex([modelShot]), false);
assert.equal(core.shotsNeedSex([{ route: 'geometry', metrics: geometryMetrics }]), true);
assert.equal(core.photoPercentile([modelShot, { route: 'geometry', metrics: geometryMetrics }], 'm'),
  (core.shotPercentile(modelShot, 'm') + geometryM) / 2, 'mixed routes average their mapped percentiles, not incomparable raws');
assert.equal(core.photoPercentile([{ route: 'model', raw: NaN }], 'm'), null);

// Optional self-report: strict boundaries, finite outputs, unit conversions, and monotone blend behavior.
for (const input of [
  [35, 1, 130, 'm', 'measured'],
  [300, 75, 230, 'f', 'picker'],
  [80, 18, 180, 'm', 'measured'],
  [62, 25, 165, 'f', 'picker']
]) assertFiniteTree(core.computeInputRead(...input));

for (const input of [
  [34.99, 20, 180, 'm', 'measured'], [300.01, 20, 180, 'm', 'measured'],
  [80, 0.99, 180, 'm', 'measured'], [80, 75.01, 180, 'm', 'measured'],
  [80, 20, 129.99, 'm', 'measured'], [80, 20, 230.01, 'm', 'measured'],
  [NaN, 20, 180, 'm', 'measured'], [80, NaN, 180, 'm', 'measured'],
  [80, 20, NaN, 'm', 'measured'], [80, 20, 180, 'x', 'measured'],
  [80, 20, 180, 'm', 'invented']
]) assert.equal(core.computeInputRead(...input), null, `invalid self-report should reject: ${input.join('/')}`);

assert.equal(core.LB_TO_KG * 100, 45.359237);
assert.equal(core.IN_TO_CM * 70, 177.8);
assert.equal(core.interpAnchors([[0, 0], [10, 20]], -1), 0);
assert.equal(core.interpAnchors([[0, 0], [10, 20]], 5), 10);
assert.equal(core.interpAnchors([[0, 0], [10, 20]], 11), 20);
for (const source of ['measured', 'picker']) {
  let prior = -Infinity;
  for (let photo = 0; photo <= 100; photo += 1) {
    const blended = core.blendRaw(50, photo, source);
    assert.ok(Number.isFinite(blended) && blended >= prior, `${source} blend must be monotone in photo percentile`);
    prior = blended;
  }
}
assert.equal(core.blendRaw(NaN, 50, 'measured'), null);
assert.equal(core.blendRaw(50, Infinity, 'picker'), null);
assert.equal(core.blendRaw(50, 50, 'invented'), null);

for (const sex of ['m', 'f']) {
  const band = core.LEANNESS_BAND[sex];
  const center = (band.lo + band.hi) / 2;
  assert.ok(core.leannessScore(center, sex) >= core.leannessScore(center - 4, sex));
  assert.ok(core.leannessScore(center, sex) >= core.leannessScore(center + 4, sex));
}

// Explicit routing state distinguishes intent, scheduling, and final instrument.
assert.deepEqual(routePlan({ modelState: 'ready', hasSession: true, bareBody: false, framing: 'full', cropReady: true }),
  { attemptedRoute: 'model', initialRoute: 'model', modelScheduled: true });
assert.deepEqual(routePlan({ modelState: 'ready', hasSession: true, bareBody: false, framing: 'full', cropReady: false }),
  { attemptedRoute: 'model', initialRoute: 'geometry', modelScheduled: false });
assert.deepEqual(routePlan({ modelState: 'ready', hasSession: true, bareBody: true, framing: 'full', cropReady: true }),
  { attemptedRoute: 'geometry', initialRoute: 'geometry', modelScheduled: false });
assert.deepEqual(routePlan({ modelState: 'loading', hasSession: false, bareBody: false, framing: 'torso', cropReady: true }),
  { attemptedRoute: 'geometry', initialRoute: 'geometry', modelScheduled: false });
// Production crop diagnostics quantify Canvas padding without altering crop coordinates.
assert.deepEqual(describeSquareCrop(50, 50, 100, 100, 100), {
  sourceX: 0, sourceY: 0, sidePx: 100, inBoundsFraction: 1, paddingFraction: 0, outOfBounds: false
});
assert.deepEqual(describeSquareCrop(0, 0, 100, 100, 100), {
  sourceX: -50, sourceY: -50, sidePx: 100, inBoundsFraction: 0.25, paddingFraction: 0.75, outOfBounds: true
});
assert.equal(describeSquareCrop(-100, -100, 10, 100, 100).paddingFraction, 1);
assert.equal(describeSquareCrop(0, 0, 0, 100, 100), null);


const factShots = [
  { route: 'model', provenance: { framing: 'full', bareGeometry: false, framingOverride: false, outlineOverride: false } },
  { route: 'geometry', provenance: { framing: 'torso', bareGeometry: true, framingOverride: true, outlineOverride: true } }
];
const facts = modelShotSetFacts(factShots);
assert.deepEqual(facts, {
  count: 2, hasModel: true, hasGeometry: true, mixedRoutes: true, onlyModel: false,
  anyBare: true, anyTorso: true, anyFramingOverride: true, anyOutlineOverride: true
});
assert.deepEqual({ ...core.shotSetFacts(factShots) }, facts, 'UI scoring core and shared route summary must agree');

// The cache identity is bound to the exact checked-in bytes, not a mutable path/cache entry.
assert.equal(BODY_MODEL_ASSET.byteLength, fs.statSync(path.join(root, BODY_MODEL_ASSET.url)).size);
const modelBytes = fs.readFileSync(path.join(root, BODY_MODEL_ASSET.url));
await validateModelBytes(modelBytes, { subtle: webcrypto.subtle });
await assert.rejects(validateModelBytes(modelBytes.subarray(0, modelBytes.length - 1), { subtle: webcrypto.subtle }), /byte length mismatch/);
assert.match(modelCacheName(), new RegExp(BODY_MODEL_ASSET.sha256.slice(0, 16)));
const cacheKey = modelCacheKey(BODY_MODEL_ASSET.url, 'https://example.test/body.html');
assert.equal(new URL(cacheKey).searchParams.get('body-model-sha256'), BODY_MODEL_ASSET.sha256);
assert.ok(Object.values(BODY_MODEL_TIMEOUTS).every(value => Number.isFinite(value) && value > 0));
await assert.rejects(withTimeout(new Promise(() => {}), 5, 'test operation'), /test operation timed out/);
assert.ok(BODY_PIPELINE_VERSION.includes(BODY_MODEL_ASSET.sha256));
assert.ok(BODY_PIPELINE_VERSION.includes(BODY_MODEL_PREPROCESSING_VERSION));
assert.ok(BODY_PIPELINE_VERSION.includes(BODY_REFERENCE_VERSION));
assert.ok(Number.isFinite(BODY_MODEL_TIMEOUTS.inferenceMs) && BODY_MODEL_TIMEOUTS.inferenceMs > 0);

// A stale completion cannot release the newer generation's busy ownership.
const lease = createGenerationLease();
assert.throws(() => lease.claim(-1), /generation/);
lease.claim(1);
const staleRelease = Promise.resolve().then(() => lease.release(1));
lease.claim(2);
assert.equal(await staleRelease, false);
assert.equal(lease.owns(2), true);
assert.equal(lease.release(2), true);
assert.equal(lease.activeGeneration(), null);
assert.equal(await withTimeout(Promise.resolve(42), 50, 'fast operation'), 42);

// Pose/segmentation gets one shared transient retry; all terminal actions are explicit.
const recoveredPose = createPoseRetryController();
assert.equal(recoveredPose.workerFailure(), 'retry');
assert.equal(recoveredPose.retryCount(), 1);
assert.equal(recoveredPose.success(), 'commit');
assert.equal(recoveredPose.workerFailure(), 'settled');

const exhaustedPose = createPoseRetryController();
const exhaustedLease = createGenerationLease();
exhaustedLease.claim(77);
let exhaustedBusy = true;
try {
  assert.equal(exhaustedPose.workerFailure(), 'retry');
  assert.equal(exhaustedPose.workerFailure(), 'refuse');
} finally {
  if (exhaustedLease.release(77)) exhaustedBusy = false;
}
assert.equal(exhaustedBusy, false);
assert.equal(exhaustedPose.isSettled(), true);

// A second transient silhouette miss degrades explicitly with retry provenance.
const transientSilhouette = createPoseRetryController();
assert.equal(transientSilhouette.silhouetteFailure(true), 'retry');
assert.equal(transientSilhouette.retryCount(), 1);
assert.equal(transientSilhouette.silhouetteFailure(true), 'degraded');
assert.equal(transientSilhouette.isSettled(), true);
assert.match(html, /outlineDiagnosis\(trace\.poseWarning, trace\.silRetry > 0\)/);
assert.match(html, /const needsGeoOverride = geoIssues\.length > 0/);

// Deterministic silhouette failures never consume a retry.
const deterministicSilhouette = createPoseRetryController();
assert.equal(deterministicSilhouette.silhouetteFailure(false), 'degraded');
assert.equal(deterministicSilhouette.retryCount(), 0);
assert.equal(deterministicSilhouette.isSettled(), true);

// Bind the tested policy to the production loop and its generation-owned cleanup.
assert.match(html, /const poseRetry = createPoseRetryController\(\)/);
assert.match(html, /poseRetry\.workerFailure\(\)/);
assert.match(html, /poseRetry\.silhouetteFailure\(retryable\)/);
assert.match(html, /finally \{[\s\S]*?analysisLease\.release\(gen\)/);

// Browser integration contracts for the state machine and honesty copy.
for (const token of ['attemptedRoute', 'finalRoute', 'modelScheduled']) assert.match(html, new RegExp(`BC\\.${token}`));
assert.match(html, /legacy calibration claim[^<]*not reproducible/i);
assert.match(html, /heuristic sensitivity envelope/i);
assert.match(html, /bcRestoreAcceptedResult/);
assert.doesNotMatch(html, /Scored with the trained model \(raw output/);
for (const accessibleToken of [
  'aria-label="Height feet"', 'aria-label="Height inches"', 'aria-label="Height centimeters"',
  'aria-label="Weight pounds"', 'aria-label="Weight kilograms"',
  'aria-label="Measured body-fat percentage"', 'aria-label="Height unit"', 'aria-label="Weight unit"',
  'aria-label="Sex used for body-fat and score curves"', 'aria-label="Body-fat silhouettes"'
]) assert.match(html, new RegExp(accessibleToken), `missing generated-control accessibility contract: ${accessibleToken}`);
assert.match(html, /class="unit-toggle" role="group" aria-label="Height unit"/);
assert.match(html, /aria-label="Read body as female" aria-pressed=/);
assert.match(html, /rangeLabel = b\.label/);
assert.match(html, /bp_continuous_debug/);
assert.match(html, /storage_invariant/);
assert.match(html, /public_score/);
assert.match(html, /finishBatchRow\(blank/);
assert.match(html, /storageBeforeImage === snapshotStorage\(\)/);

assert.match(html, /crop_padding_fraction/);
assert.match(html, /describeSquareCrop\(cx, cy, side, W, H\)/);
assert.match(html, /const out=await withTimeout\([\s\S]*?session\.run[\s\S]*?BODY_MODEL_TIMEOUTS\.inferenceMs/,
  'production CNN inference is time-bounded');
assert.match(html, /runPoseInWorker\(bitmap, gen, false,[\s\S]*?analysisLease\.owns\(gen\)/,
  'pose dispatch rechecks source ownership after async setup');
assert.doesNotMatch(html, /bc-pct[^\n]*scorePercentile\(score\)/,
  'public percentile copy never reads the hidden continuous score');
console.log('body-core: finite scoring, table knots, zero-cue refusal, route transitions, self-report bounds, model integrity, timeouts, and mixed-shot facts passed');
