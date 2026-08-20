import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function source(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

// Load the plain-script arm predicate first. The camera guide must consume this shared
// implementation, not a copied test predicate.
const guideContext = { globalThis: {} };
vm.runInNewContext(source('js/body-arm-band.js'), guideContext, { filename: 'js/body-arm-band.js' });
assert.equal(typeof guideContext.globalThis.bodyArmBand, 'function');
vm.runInNewContext(source('js/body-camera-guide.js'), guideContext, { filename: 'js/body-camera-guide.js' });
const guide = guideContext.globalThis.BodyCameraGuide;
assert.ok(guide, 'body camera guide API should load without a DOM');

// Load the production worker without a worker global so its exported assessPose gate is
// available while MediaPipe initialization remains dormant.
const workerContext = { module: { exports: {} }, console };
vm.runInNewContext(source('js/body-pose-worker.js'), workerContext, { filename: 'js/body-pose-worker.js' });
const { assessPose } = workerContext.module.exports;
assert.equal(typeof assessPose, 'function');

function close(actual, expected, epsilon = 1e-9, message = '') {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${message} expected ${expected}, got ${actual}`);
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

// Exact xMidYMid-meet transforms for the three requested camera-feed classes.
const FEEDS = [
  { name: 'portrait 9:16', width: 360, height: 640, scale: 3.6, x: 0, y: 140 },
  { name: '4:3', width: 640, height: 480, scale: 4.8, x: 80, y: 0 },
  { name: '16:9', width: 640, height: 360, scale: 3.6, x: 140, y: 0 }
];
for (const sample of FEEDS) {
  const transform = guide.computeViewBoxTransform(sample.width, sample.height);
  close(transform.scale, sample.scale, 1e-12, `${sample.name} scale`);
  close(transform.offsetX, sample.x, 1e-12, `${sample.name} x offset`);
  close(transform.offsetY, sample.y, 1e-12, `${sample.name} y offset`);
  const center = guide.normalizedVideoPointToGuide({ x: 0.5, y: 0.5 }, transform, true);
  close(center.x, 50, 1e-12, `${sample.name} center x`);
  close(center.y, 50, 1e-12, `${sample.name} center y`);
  for (const mirrored of [true, false]) {
    const raw = guide.guidePointToNormalizedVideo({ x: 27, y: 91 }, transform, mirrored);
    const roundTrip = guide.normalizedVideoPointToGuide(raw, transform, mirrored);
    close(roundTrip.x, 27, 1e-12, `${sample.name} mirrored=${mirrored} x round-trip`);
    close(roundTrip.y, 91, 1e-12, `${sample.name} mirrored=${mirrored} y round-trip`);
  }
}
assert.equal(guide.computeViewBoxTransform(0, 480), null);
assert.equal(guide.computeViewBoxTransform(Infinity, 480), null);
assert.equal(guide.normalizedVideoPointToGuide({ x: NaN, y: 0.5 },
  guide.computeViewBoxTransform(640, 480)), null);

function setGuidePoint(landmarks, transform, index, x, y, mirrored = true, confidence = 1) {
  landmarks[index] = Object.assign(
    guide.guidePointToNormalizedVideo({ x, y }, transform, mirrored),
    { z: 0, visibility: confidence, presence: confidence }
  );
}

// The coordinates are the landmarks drawn by body.html's SVG: head center y=13,
// shoulders/arms at its line endpoints, hips at the torso base, and feet at y=90.
function alignedLandmarks(width = 640, height = 480, mirrored = true) {
  const transform = guide.computeViewBoxTransform(width, height);
  const landmarks = Array(33).fill(null);
  const points = {
    0: [50, 13],
    11: [38, 25], 12: [62, 25],
    13: [34, 41], 14: [66, 41],
    15: [27, 58], 16: [73, 58],
    23: [42, 56], 24: [58, 56],
    25: [43, 73], 26: [57, 73],
    27: [42, 90], 28: [58, 90],
    29: [41, 90], 30: [59, 90],
    31: [40, 90], 32: [60, 90]
  };
  for (const [index, [x, y]] of Object.entries(points)) {
    setGuidePoint(landmarks, transform, Number(index), x, y, mirrored);
  }
  return landmarks;
}

function qualityFor(landmarks, width = 640, height = 480) {
  return assessPose(landmarks, width, height);
}

function classify(landmarks, width = 640, height = 480, mirrored = true, quality) {
  const resolved = quality === undefined ? qualityFor(landmarks, width, height) : quality;
  return guide.evaluateCameraAlignment(landmarks, width, height, resolved, { mirrored });
}

function mutateInGuide(landmarks, width, height, mirrored, mutator) {
  const transform = guide.computeViewBoxTransform(width, height);
  for (let index = 0; index < landmarks.length; index += 1) {
    if (!landmarks[index]) continue;
    const shown = guide.normalizedVideoPointToGuide(landmarks[index], transform, mirrored);
    const changed = mutator({ x: shown.x, y: shown.y }, index);
    const raw = guide.guidePointToNormalizedVideo(changed || shown, transform, mirrored);
    landmarks[index] = Object.assign({}, landmarks[index], raw);
  }
  return landmarks;
}

// A body positioned on the SVG passes both the real production gate and the guide at
// every aspect ratio. This catches the old normalized-span bug on portrait feeds.
for (const sample of FEEDS) {
  const landmarks = alignedLandmarks(sample.width, sample.height, true);
  const quality = qualityFor(landmarks, sample.width, sample.height);
  assert.equal(quality.ok, true, `${sample.name} production pose should be readable`);
  assert.equal(quality.framing, 'full', `${sample.name} should be production-full`);
  assert.equal(quality.band, 'pass', `${sample.name} should be production-pass`);
  const result = classify(landmarks, sample.width, sample.height, true, quality);
  assert.equal(result.code, 'ready', `${sample.name} should align to the actual SVG`);
  close(result.metrics.bodyScale, 1, 1e-12, `${sample.name} body scale`);
  close(result.metrics.bodyWidthScale, 1, 1e-12, `${sample.name} body width scale`);
  assert.equal(result.ready, true);
  assert.equal(guide.productionGatePassed(quality), true);
}

const BASE_WIDTH = 640, BASE_HEIGHT = 480;
const baseLandmarks = alignedLandmarks();
const baseQuality = qualityFor(baseLandmarks);
assert.equal(classify(baseLandmarks).code, 'ready');

// Every worker refusal/degraded state receives one stable actionable guide code.
for (const [quality, expected] of [
  [{ ok: false, code: 'malformed' }, 'no_body'],
  [{ ok: false, code: 'partial' }, 'move_back'],
  [{ ok: false, code: 'profile' }, 'face_camera_square_on'],
  [{ ok: false, code: 'standing' }, 'straighten_legs'],
  [{ ok: false, code: 'upright' }, 'stand_upright'],
  [{ ok: true, code: 'ok', framing: 'torso', band: 'degraded' }, 'move_back'],
  [{ ok: true, code: 'ok', framing: 'full', band: 'degraded' }, 'level_shoulders_hips']
]) {
  assert.equal(classify(baseLandmarks, BASE_WIDTH, BASE_HEIGHT, true, quality).code, expected,
    `production quality ${quality.code}/${quality.framing || ''}/${quality.band || ''}`);
}
assert.equal(guide.evaluateCameraAlignment(null, BASE_WIDTH, BASE_HEIGHT, null).code, 'no_body');

function scaledFromFeet(scale) {
  return mutateInGuide(alignedLandmarks(), BASE_WIDTH, BASE_HEIGHT, true,
    point => ({ x: point.x, y: 90 - (90 - point.y) * scale }));
}

// Scale thresholds are inclusive; the feet remain on their actual SVG endpoint so this
// isolates scale from the separate foot-line gate.
for (const [scale, expected] of [
  [guide.DEFAULT_CONFIG.minBodyScale, 'ready'],
  [guide.DEFAULT_CONFIG.minBodyScale - 0.001, 'move_closer'],
  [guide.DEFAULT_CONFIG.maxBodyScale, 'ready'],
  [guide.DEFAULT_CONFIG.maxBodyScale + 0.001, 'move_back']
]) {
  const landmarks = scaledFromFeet(scale);
  const quality = qualityFor(landmarks);
  const result = classify(landmarks, BASE_WIDTH, BASE_HEIGHT, true, quality);
  assert.equal(result.code, expected, `body-scale boundary ${scale}`);
  if (result.ready) assert.equal(guide.productionGatePassed(quality), true);
}

function shifted(dx, dy) {
  return mutateInGuide(alignedLandmarks(), BASE_WIDTH, BASE_HEIGHT, true,
    point => ({ x: point.x + dx, y: point.y + dy }));
}

// Horizontal centering and foot-line boundaries are inclusive.
for (const [dx, expected] of [
  [guide.DEFAULT_CONFIG.centerXTolerance, 'ready'],
  [guide.DEFAULT_CONFIG.centerXTolerance + 0.001, 'center_body'],
  [-guide.DEFAULT_CONFIG.centerXTolerance, 'ready'],
  [-guide.DEFAULT_CONFIG.centerXTolerance - 0.001, 'center_body']
]) {
  const landmarks = shifted(dx, 0);
  assert.equal(classify(landmarks).code, expected, `center boundary ${dx}`);
}
for (const [dy, expected] of [
  [guide.DEFAULT_CONFIG.feetYTolerance, 'ready'],
  [guide.DEFAULT_CONFIG.feetYTolerance + 0.001, 'align_feet'],
  [-guide.DEFAULT_CONFIG.feetYTolerance, 'ready'],
  [-guide.DEFAULT_CONFIG.feetYTolerance - 0.001, 'align_feet']
]) {
  const landmarks = shifted(0, dy);
  assert.equal(classify(landmarks).code, expected, `feet boundary ${dy}`);
}

// The confidence boundary uses the worker's min(visibility,presence) semantics.
for (const [confidence, expected] of [
  [guide.DEFAULT_CONFIG.minLandmarkConfidence, 'ready'],
  [guide.DEFAULT_CONFIG.minLandmarkConfidence - 0.001, 'no_body']
]) {
  const landmarks = alignedLandmarks();
  landmarks[0].visibility = confidence;
  landmarks[0].presence = confidence;
  assert.equal(classify(landmarks).code, expected, `head-confidence boundary ${confidence}`);
}
assert.equal(guide.landmarkConfidence({ x: 0, y: 0 }), 1, 'missing confidence fields follow worker semantics');
assert.equal(guide.landmarkConfidence({ x: 0, y: 0, visibility: Infinity }), 0,
  'non-finite supplied confidence is rejected');

// Shared arm-band predicate: an elbow inside the production waist band blocks auto-pass.
const armBlocked = alignedLandmarks();
setGuidePoint(armBlocked, guide.computeViewBoxTransform(BASE_WIDTH, BASE_HEIGHT), 13, 50, 45, true);
const sharedArm = guideContext.globalThis.bodyArmBand(armBlocked);
assert.equal(sharedArm.waistArm, true);
assert.equal(classify(armBlocked).code, 'arms_out');

// Actual production variants prove guide-ready is a strict subset of full/pass, not a
// reimplementation whose thresholds can drift.
const cropped = mutateInGuide(alignedLandmarks(), BASE_WIDTH, BASE_HEIGHT, true, (point, index) => (
  [27, 28, 29, 30, 31, 32].includes(index) ? { x: point.x, y: 99 } : point
));
const croppedQuality = qualityFor(cropped);
assert.equal(croppedQuality.framing, 'torso');
assert.equal(classify(cropped, BASE_WIDTH, BASE_HEIGHT, true, croppedQuality).code, 'move_back');

const tilted = alignedLandmarks();
const tiltedTransform = guide.computeViewBoxTransform(BASE_WIDTH, BASE_HEIGHT);
setGuidePoint(tilted, tiltedTransform, 11, 38, 22, true);
setGuidePoint(tilted, tiltedTransform, 12, 62, 28, true);
setGuidePoint(tilted, tiltedTransform, 23, 42, 53, true);
setGuidePoint(tilted, tiltedTransform, 24, 58, 59, true);
const tiltedQuality = qualityFor(tilted);
assert.equal(tiltedQuality.band, 'degraded');
assert.equal(classify(tilted, BASE_WIDTH, BASE_HEIGHT, true, tiltedQuality).code,
  'level_shoulders_hips');

for (const result of [classify(baseLandmarks), classify(scaledFromFeet(0.8)), classify(shifted(2, 2))]) {
  if (result.ready) {
    assert.equal(result.productionGate.ok, true);
    assert.equal(result.productionGate.code, 'ok');
    assert.equal(result.productionGate.framing, 'full');
    assert.equal(result.productionGate.band, 'pass');
  }
}

// Mirroring reverses the displayed correction, not classification or the raw direction.
const rawShifted = mutateInGuide(alignedLandmarks(BASE_WIDTH, BASE_HEIGHT, false),
  BASE_WIDTH, BASE_HEIGHT, false, point => ({ x: point.x + 4, y: point.y }));
const rawQuality = qualityFor(rawShifted);
const unmirrored = guide.evaluateCameraAlignment(rawShifted, BASE_WIDTH, BASE_HEIGHT,
  rawQuality, { mirrored: false });
const mirrored = guide.evaluateCameraAlignment(rawShifted, BASE_WIDTH, BASE_HEIGHT,
  rawQuality, { mirrored: true });
assert.equal(unmirrored.code, 'ready');
assert.equal(mirrored.code, 'ready');
close(unmirrored.metrics.centerOffsetDisplay, 4);
close(mirrored.metrics.centerOffsetDisplay, -4);
close(unmirrored.metrics.centerOffsetRaw, 4);
close(mirrored.metrics.centerOffsetRaw, 4);

// Required non-finite coordinates can never be green-lit, even if a caller supplies a
// stale/spoofed pass quality object.
const corrupt = alignedLandmarks();
corrupt[25].x = Infinity;
assert.equal(guide.evaluateCameraAlignment(corrupt, BASE_WIDTH, BASE_HEIGHT, baseQuality).code, 'no_body');
const corruptConfidence = alignedLandmarks();
corruptConfidence[0].visibility = NaN;
assert.equal(guide.evaluateCameraAlignment(corruptConfidence, BASE_WIDTH, BASE_HEIGHT,
  qualityFor(corruptConfidence)).code, 'no_body');

// All published numeric thresholds and every ready diagnostic are finite.
for (const value of Object.values(guide.DEFAULT_CONFIG)) {
  if (typeof value === 'number') assert.ok(Number.isFinite(value));
}
for (const value of Object.values(classify(baseLandmarks).metrics)) {
  assert.ok(Number.isFinite(value), `guide metric should be finite: ${value}`);
}

// Structured provenance carries no image, landmark, arbitrary text, or non-finite data.
const ready = classify(baseLandmarks);
const dirtyAlignment = Object.assign({}, ready, {
  metrics: Object.assign({}, ready.metrics, {
    bad: Infinity,
    bodyScale: 1,
    html: '<img src=x onerror=alert(1)>',
    image: 'data:image/png;base64,AAAA'
  })
});
const dirtyQuality = Object.assign({}, baseQuality, {
  tilt: Infinity,
  issues: ['<script>alert(1)</script>'],
  landmarks: baseLandmarks
});
const manual = guide.makeCaptureProvenance('manual', dirtyAlignment, dirtyQuality,
  1920.4, 1080, 1234567890);
assert.equal(manual.version, 1);
assert.equal(manual.source, 'camera');
assert.equal(manual.trigger, 'manual');
assert.equal(manual.guidePassed, true);
assert.equal(manual.guideCode, 'ready');
assert.equal(manual.frameWidth, 1920);
assert.equal(manual.frameHeight, 1080);
assert.equal(manual.timestamp, 1234567890);
assert.equal(manual.guideMetrics.bad, undefined);
assert.equal(manual.guideMetrics.html, undefined);
assert.equal(manual.poseQuality.metrics.tilt, undefined);
const serialized = JSON.stringify(manual);
assert.equal(serialized.includes('data:image'), false);
assert.equal(serialized.includes('<'), false);
assert.equal(serialized.includes('landmarks'), false);
assert.equal(serialized.includes('issues'), false);

const auto = guide.makeCaptureProvenance('auto', ready, baseQuality, 1280, 720, 42);
assert.equal(auto.trigger, 'auto');
assert.equal(auto.guidePassed, true);

// Restored provenance is rebuilt from allowlists: spoofed pass flags are ignored,
// HTML-bearing enums are neutralized, and non-finite/oversized values are rejected.
const sanitized = guide.sanitizeCaptureProvenance({
  version: 1,
  source: 'camera',
  trigger: 'manual',
  guidePassed: true,
  guideCode: 'move_closer',
  guideMetrics: { bodyScale: -2, centerOffsetRaw: 4, confidentLandmarks: 999, bad: Infinity },
  poseQuality: {
    ok: true,
    code: '<img src=x>',
    framing: '<b>full</b>',
    band: 'pass',
    metrics: { lowerConfidence: 2, yawDeg: 12, thighVertical: [0.9, Infinity] }
  },
  frameWidth: 999999,
  frameHeight: Infinity,
  timestamp: NaN,
  image: 'data:image/png;base64,AAAA'
});
assert.deepEqual(plain(sanitized), {
  version: 1,
  source: 'camera',
  trigger: 'manual',
  guidePassed: false,
  guideCode: 'move_closer',
  guideMetrics: { centerOffsetRaw: 4 },
  poseQuality: {
    ok: false,
    code: null,
    framing: null,
    band: 'pass',
    metrics: { yawDeg: 12 }
  },
  frameWidth: null,
  frameHeight: null,
  timestamp: null
});
assert.equal(guide.sanitizeCaptureProvenance({ version: 1, source: '<camera>', trigger: 'manual' }), null);
assert.equal(guide.sanitizeCaptureProvenance({ version: 2, source: 'camera', trigger: 'manual' }), null);
assert.equal(guide.sanitizeCaptureProvenance({ version: 1, source: 'camera', trigger: '<auto>' }), null);

// Every exported guide code has a stable, nonempty hint and was exercised above.
for (const code of Object.values(guide.GUIDE_CODES)) {
  assert.equal(typeof guide.GUIDE_HINTS[code], 'string', `hint for ${code}`);
  assert.ok(guide.GUIDE_HINTS[code].length > 0, `nonempty hint for ${code}`);
}

console.log('body-camera-guide: SVG mapping, production agreement, boundaries, mirroring, and provenance passed');
