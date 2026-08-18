import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(root, 'js', 'face-camera-guide.js'), 'utf8');
const context = { globalThis: {} };
vm.runInNewContext(source, context, { filename: 'js/face-camera-guide.js' });
const guide = context.globalThis.FaceCameraGuide;
assert.ok(guide, 'camera guide API should load without a DOM');

function close(actual, expected, epsilon = 1e-9, message = '') {
  assert.ok(Math.abs(actual - expected) <= epsilon, `${message} expected ${expected}, got ${actual}`);
}

// Exact xMidYMid-meet transforms for every requested feed class.
for (const sample of [
  { name: 'portrait 9:16', width: 360, height: 640, scale: 3.6, x: 0, y: 140 },
  { name: '4:3', width: 640, height: 480, scale: 4.8, x: 80, y: 0 },
  { name: '16:9', width: 640, height: 360, scale: 3.6, x: 140, y: 0 }
]) {
  const t = guide.computeViewBoxTransform(sample.width, sample.height);
  close(t.scale, sample.scale, 1e-12, `${sample.name} scale`);
  close(t.offsetX, sample.x, 1e-12, `${sample.name} x offset`);
  close(t.offsetY, sample.y, 1e-12, `${sample.name} y offset`);
  const center = guide.normalizedVideoPointToGuide({ x: 0.5, y: 0.5 }, t, true);
  close(center.x, 50, 1e-12, `${sample.name} center x`);
  close(center.y, 50, 1e-12, `${sample.name} center y`);
}
assert.equal(guide.computeViewBoxTransform(0, 480), null);
assert.equal(guide.computeViewBoxTransform(Infinity, 480), null);

function blankLandmarks() {
  return Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
}

function setGuidePoint(landmarks, transform, index, x, y, mirrored = true) {
  landmarks[index] = guide.guidePointToNormalizedVideo({ x, y }, transform, mirrored);
}

function alignedLandmarks(width = 640, height = 480, mirrored = true) {
  const t = guide.computeViewBoxTransform(width, height);
  const lm = blankLandmarks();
  setGuidePoint(lm, t, 234, 30, 46, mirrored);
  setGuidePoint(lm, t, 454, 70, 46, mirrored);
  setGuidePoint(lm, t, 10, 50, 19, mirrored);
  setGuidePoint(lm, t, 152, 50, 73, mirrored);
  setGuidePoint(lm, t, 33, 36, 40, mirrored);
  setGuidePoint(lm, t, 133, 44, 40, mirrored);
  setGuidePoint(lm, t, 362, 56, 40, mirrored);
  setGuidePoint(lm, t, 263, 64, 40, mirrored);
  return lm;
}

function classify(mutator, pose = { yawDeg: 0, pitchDeg: 1, poseSkew: 0 }, mirrored = true) {
  const width = 640, height = 480;
  const lm = alignedLandmarks(width, height, mirrored);
  if (mutator) mutator(lm, guide.computeViewBoxTransform(width, height), mirrored);
  return guide.evaluateCameraAlignment(lm, width, height, pose, { mirrored });
}

assert.equal(guide.evaluateCameraAlignment(null, 640, 480, null).code, 'no_face');
assert.equal(classify().code, 'ready');

// Every live hint code, with scale checked on both sides.
assert.equal(classify((lm, t, mirrored) => {
  setGuidePoint(lm, t, 234, 39, 46, mirrored); setGuidePoint(lm, t, 454, 61, 46, mirrored);
  setGuidePoint(lm, t, 10, 50, 31, mirrored); setGuidePoint(lm, t, 152, 50, 61, mirrored);
}).code, 'move_closer');
assert.equal(classify((lm, t, mirrored) => {
  setGuidePoint(lm, t, 234, 25, 46, mirrored); setGuidePoint(lm, t, 454, 75, 46, mirrored);
  setGuidePoint(lm, t, 10, 50, 10, mirrored); setGuidePoint(lm, t, 152, 50, 82, mirrored);
}).code, 'move_back');
assert.equal(classify((lm, t, mirrored) => {
  for (const index of [10, 33, 133, 152, 234, 263, 362, 454]) {
    const p = guide.normalizedVideoPointToGuide(lm[index], t, mirrored);
    setGuidePoint(lm, t, index, p.x + 6, p.y, mirrored);
  }
}).code, 'center_face');
assert.equal(classify((lm, t, mirrored) => {
  for (const index of [33, 133, 263, 362]) {
    const p = guide.normalizedVideoPointToGuide(lm[index], t, mirrored);
    setGuidePoint(lm, t, index, p.x, p.y + 5, mirrored);
  }
}).code, 'align_eyes');
assert.equal(classify((lm, t, mirrored) => {
  setGuidePoint(lm, t, 33, 36, 37, mirrored); setGuidePoint(lm, t, 133, 44, 38, mirrored);
  setGuidePoint(lm, t, 362, 56, 42, mirrored); setGuidePoint(lm, t, 263, 64, 43, mirrored);
}).code, 'level_head');
assert.equal(classify(null, { yawDeg: 13, pitchDeg: 1, poseSkew: 0 }).code, 'face_camera_square_on');

// Boundary values are inclusive: exactly at the published threshold passes; epsilon outside fails.
assert.equal(classify(null, { yawDeg: guide.DEFAULT_CONFIG.maxYawDeg, pitchDeg: 1, poseSkew: 0 }).code, 'ready');
assert.equal(classify(null, { yawDeg: guide.DEFAULT_CONFIG.maxYawDeg + 0.001, pitchDeg: 1, poseSkew: 0 }).code, 'face_camera_square_on');
assert.equal(classify(null, { yawDeg: 0, pitchDeg: 0, poseSkew: guide.DEFAULT_CONFIG.maxPoseSkew }).code, 'ready');
assert.equal(classify(null, { yawDeg: 0, pitchDeg: 0, poseSkew: guide.DEFAULT_CONFIG.maxPoseSkew + 0.001 }).code, 'face_camera_square_on');
function setScale(lm, t, mirrored, scale) {
  setGuidePoint(lm, t, 234, 50 - 20 * scale, 46, mirrored);
  setGuidePoint(lm, t, 454, 50 + 20 * scale, 46, mirrored);
  setGuidePoint(lm, t, 10, 50, 46 - 27 * scale, mirrored);
  setGuidePoint(lm, t, 152, 50, 46 + 27 * scale, mirrored);
}
for (const [scale, expected] of [
  [guide.DEFAULT_CONFIG.minScale, 'ready'],
  [guide.DEFAULT_CONFIG.minScale - 0.001, 'move_closer'],
  [guide.DEFAULT_CONFIG.maxScale, 'ready'],
  [guide.DEFAULT_CONFIG.maxScale + 0.001, 'move_back']
]) {
  assert.equal(classify((lm, t, mirrored) => setScale(lm, t, mirrored, scale)).code, expected,
    `face-scale boundary ${scale}`);
}

function shiftRequired(lm, t, mirrored, dx, dy, indices) {
  for (const index of indices || [10, 33, 133, 152, 234, 263, 362, 454]) {
    const p = guide.normalizedVideoPointToGuide(lm[index], t, mirrored);
    setGuidePoint(lm, t, index, p.x + dx, p.y + dy, mirrored);
  }
}
assert.equal(classify((lm, t, mirrored) => {
  shiftRequired(lm, t, mirrored, guide.DEFAULT_CONFIG.centerXTolerance, 0);
}).code, 'ready', 'center tolerance is inclusive');
assert.equal(classify((lm, t, mirrored) => {
  shiftRequired(lm, t, mirrored, guide.DEFAULT_CONFIG.centerXTolerance + 0.001, 0);
}).code, 'center_face', 'center epsilon outside fails');
assert.equal(classify((lm, t, mirrored) => {
  shiftRequired(lm, t, mirrored, 0, guide.DEFAULT_CONFIG.eyeYTolerance, [33, 133, 263, 362]);
}).code, 'ready', 'eye-line tolerance is inclusive');
assert.equal(classify((lm, t, mirrored) => {
  shiftRequired(lm, t, mirrored, 0, guide.DEFAULT_CONFIG.eyeYTolerance + 0.001, [33, 133, 263, 362]);
}).code, 'align_eyes', 'eye-line epsilon outside fails');

function setRoll(lm, t, mirrored, degrees) {
  const rise = 10 * Math.tan(degrees * Math.PI / 180);
  setGuidePoint(lm, t, 33, 36, 40 - rise, mirrored);
  setGuidePoint(lm, t, 133, 44, 40 - rise, mirrored);
  setGuidePoint(lm, t, 362, 56, 40 + rise, mirrored);
  setGuidePoint(lm, t, 263, 64, 40 + rise, mirrored);
}
assert.equal(classify((lm, t, mirrored) => {
  setRoll(lm, t, mirrored, guide.DEFAULT_CONFIG.maxRollDeg);
}).code, 'ready', 'roll tolerance is inclusive');
assert.equal(classify((lm, t, mirrored) => {
  setRoll(lm, t, mirrored, guide.DEFAULT_CONFIG.maxRollDeg + 0.001);
}).code, 'level_head', 'roll epsilon outside fails');

// All published scalar thresholds and computed diagnostics stay finite.
for (const value of Object.values(guide.DEFAULT_CONFIG)) {
  if (typeof value === 'number') assert.ok(Number.isFinite(value));
}
for (const value of Object.values(classify().metrics)) assert.ok(Number.isFinite(value));


// Mirroring changes the signed preview direction, never the classification or hint direction.
const rightInRaw = classify((lm, t, mirrored) => {
  for (const index of [10, 33, 133, 152, 234, 263, 362, 454]) {
    const p = guide.normalizedVideoPointToGuide(lm[index], t, mirrored);
    setGuidePoint(lm, t, index, p.x + 6, p.y, mirrored);
  }
}, undefined, true);
assert.equal(rightInRaw.code, 'center_face');
close(rightInRaw.metrics.centerOffsetDisplay, 6);
close(rightInRaw.metrics.centerOffsetRaw, -6);

// A real raw eye ordering reverses on the CSS-mirrored preview. It must remain level,
// not become an atan2 180-degree false failure.
const rawLevel = alignedLandmarks(640, 480, false);
const mirroredLevel = guide.evaluateCameraAlignment(
  rawLevel, 640, 480, { yawDeg: 0, pitchDeg: 1, poseSkew: 0 }, { mirrored: true }
);
assert.equal(mirroredLevel.code, 'ready');
close(mirroredLevel.metrics.rollDeg, 0);

// Structured provenance contains no image/landmark data and cannot propagate non-finite metrics.
const manual = guide.makeCaptureProvenance('manual', {
  code: 'move_closer', metrics: { faceScale: 0.5, bad: Infinity }
}, 1920, 1080);
assert.deepEqual(JSON.parse(JSON.stringify(manual)), {
  version: 1,
  source: 'camera',
  trigger: 'manual',
  guidePassed: false,
  alignmentCode: 'move_closer',
  alignmentMetrics: { faceScale: 0.5 },
  frameWidth: 1920,
  frameHeight: 1080
});
assert.equal(guide.makeCaptureProvenance('auto', classify(), 1280, 720).guidePassed, true);

console.log('face-camera-guide: all mapping, hint, boundary, mirroring, and provenance tests passed');
