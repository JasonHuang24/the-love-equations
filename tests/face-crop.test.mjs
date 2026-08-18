import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, '..', 'js', 'face-crop.js'), 'utf8');
const context = vm.createContext({ module: { exports: {} }, console, Math, Number, Object, Array, TypeError, RangeError });
new vm.Script(source, { filename: 'js/face-crop.js' }).runInContext(context);
const { computeSquareCropSpec, DEFAULTS } = context.module.exports;

const EPS = 1e-9;
const close = (actual, expected, message) => {
  assert.ok(Math.abs(actual - expected) <= EPS, `${message}: got ${actual}, expected ${expected}`);
};
const pointsForBounds = (bounds, width, height) => [
  { x: bounds.x / width, y: bounds.y / height },
  { x: bounds.right / width, y: bounds.y / height },
  { x: bounds.right / width, y: bounds.bottom / height },
  { x: bounds.x / width, y: bounds.bottom / height },
];
const specFor = (bounds, width = 1000, height = 800, options = {}) =>
  computeSquareCropSpec(pointsForBounds(bounds, width, height), width, height, options);
const box = (x, y, width, height) => ({ x, y, width, height, right: x + width, bottom: y + height });

function assertContained(spec, label) {
  const s = spec.sourceRect;
  assert.ok(s.x >= -EPS, `${label}: source x below zero`);
  assert.ok(s.y >= -EPS, `${label}: source y below zero`);
  assert.ok(s.right <= spec.sourceSize.width + EPS, `${label}: source right exceeds image`);
  assert.ok(s.bottom <= spec.sourceSize.height + EPS, `${label}: source bottom exceeds image`);
  assert.ok(s.width > 0 && s.height > 0, `${label}: source intersection must be non-empty`);
  const d = spec.destRect;
  assert.ok(d.x >= -EPS && d.y >= -EPS, `${label}: destination starts outside output`);
  assert.ok(d.right <= spec.outputSize + EPS, `${label}: destination right exceeds output`);
  assert.ok(d.bottom <= spec.outputSize + EPS, `${label}: destination bottom exceeds output`);
  for (const value of flattenNumbers(spec)) assert.ok(Number.isFinite(value), `${label}: emitted non-finite diagnostic`);
}

function flattenNumbers(value, output = []) {
  if (typeof value === 'number') output.push(value);
  else if (value && typeof value === 'object') Object.values(value).forEach(item => flattenNumbers(item, output));
  return output;
}

const cases = [];
function test(name, run) { cases.push({ name, run }); }

test('defaults preserve the production beauty-crop semantics', () => {
  assert.equal(DEFAULTS.scale, 1.4);
  assert.equal(DEFAULTS.verticalShift, -0.06);
  assert.equal(DEFAULTS.outputSize, 224);
  const spec = specFor(box(400, 300, 200, 200));
  close(spec.cropRect.x, 360, 'centered x');
  close(spec.cropRect.y, 248, 'forehead-nudged y');
  close(spec.cropRect.width, 280, '1.4x side');
  assert.equal(spec.requestedFits, true);
  assert.equal(spec.face.fullyVisible, true);
  close(spec.padding.areaFraction, 0, 'centered padding');
  close(spec.destRect.width, 224, 'full output width');
  close(spec.destRect.height, 224, 'full output height');
});

for (const edge of ['left', 'right', 'top', 'bottom']) {
  test(`${edge} edge translates a fit-capable square fully in-bounds`, () => {
    const positions = {
      left: box(0, 350, 100, 100),
      right: box(900, 350, 100, 100),
      top: box(450, 0, 100, 100),
      bottom: box(450, 700, 100, 100),
    };
    const spec = specFor(positions[edge], 1000, 800, { scale: 1.4, verticalShift: 0 });
    assert.equal(spec.requestedFits, true);
    close(spec.padding.areaFraction, 0, `${edge} padding`);
    if (edge === 'left') { close(spec.cropRect.x, 0, 'left x'); assert.ok(spec.shift.x > 0); }
    if (edge === 'right') { close(spec.cropRect.right, 1000, 'right edge'); assert.ok(spec.shift.x < 0); }
    if (edge === 'top') { close(spec.cropRect.y, 0, 'top y'); assert.ok(spec.shift.y > 0); }
    if (edge === 'bottom') { close(spec.cropRect.bottom, 800, 'bottom edge'); assert.ok(spec.shift.y < 0); }
    assert.equal(spec.face.fullyVisible, true);
    assertContained(spec, edge);
  });
}

for (const corner of ['top-left', 'top-right', 'bottom-left', 'bottom-right']) {
  test(`${corner} corner translates both fit-capable axes in-bounds`, () => {
    const positions = {
      'top-left': box(0, 0, 100, 100),
      'top-right': box(900, 0, 100, 100),
      'bottom-left': box(0, 700, 100, 100),
      'bottom-right': box(900, 700, 100, 100),
    };
    const spec = specFor(positions[corner], 1000, 800, { scale: 1.4, verticalShift: 0 });
    assert.equal(spec.requestedFits, true);
    close(spec.padding.areaFraction, 0, `${corner} padding`);
    assert.notEqual(spec.shift.x, 0);
    assert.notEqual(spec.shift.y, 0);
    assert.equal(spec.face.fullyVisible, true);
    assertContained(spec, corner);
  });
}

test('portrait source stays square and contained', () => {
  const spec = specFor(box(150, 350, 100, 200), 400, 900);
  close(spec.cropRect.width, 280, 'portrait side');
  close(spec.cropRect.height, 280, 'portrait square height');
  assert.equal(spec.requestedFits, true);
  close(spec.padding.areaFraction, 0, 'portrait padding');
  assertContained(spec, 'portrait');
});

test('landscape source stays square and contained', () => {
  const spec = specFor(box(500, 150, 200, 100), 1200, 500);
  close(spec.cropRect.width, 280, 'landscape side');
  close(spec.cropRect.height, 280, 'landscape square height');
  assert.equal(spec.requestedFits, true);
  close(spec.padding.areaFraction, 0, 'landscape padding');
  assertContained(spec, 'landscape');
});

test('very close face uses only contained source pixels and quantifies unavoidable padding', () => {
  const width = 640;
  const height = 480;
  const spec = specFor(box(32, 24, 576, 432), width, height);
  assert.equal(spec.requestedFits, false);
  close(spec.cropRect.width, 806.4, 'close requested side');
  close(spec.sourceRect.x, 0, 'close source x');
  close(spec.sourceRect.y, 0, 'close source y');
  close(spec.sourceRect.width, width, 'close source width');
  close(spec.sourceRect.height, height, 'close source height');
  close(spec.padding.sourcePixels.left, 83.2, 'close left padding');
  close(spec.padding.sourcePixels.right, 83.2, 'close right padding');
  close(spec.padding.sourcePixels.top, 189.12, 'close top padding');
  close(spec.padding.sourcePixels.bottom, 137.28, 'close bottom padding');
  close(spec.padding.areaFraction, 1 - (width * height) / (806.4 ** 2), 'close padded area');
  assert.equal(spec.face.fullyVisible, true);
  assertContained(spec, 'very close');
});

test('very small face preserves requested scale without a hidden pixel floor', () => {
  const spec = specFor(box(1995, 1495, 10, 10), 4000, 3000);
  close(spec.cropRect.width, 14, 'small side');
  close(spec.sourceRect.width, 14, 'small source width');
  assert.equal(spec.requestedFits, true);
  close(spec.padding.areaFraction, 0, 'small padding');
  assertContained(spec, 'very small');
});

test('finite out-of-frame landmarks are retained and face clipping is explicit', () => {
  const spec = specFor(box(-10, 0, 100, 100), 100, 100, { scale: 1, verticalShift: 0, outputSize: 100 });
  assert.equal(spec.requestedFits, true);
  close(spec.sourceRect.x, 0, 'clipped face source x');
  close(spec.face.visibleAreaFraction, 0.9, 'visible face area');
  close(spec.face.clippedAreaFraction, 0.1, 'clipped face area');
  close(spec.face.clippedSourcePixels.left, 10, 'left face clipping');
  assert.equal(spec.face.fullyVisible, false);
  assertContained(spec, 'out-of-frame landmarks');
});

test('exact containment boundary fits with no padding', () => {
  const spec = specFor(box(0, 50, 100, 100), 100, 200, { scale: 1, verticalShift: 0, outputSize: 100 });
  assert.equal(spec.requestedFits, true);
  close(spec.cropRect.x, 0, 'boundary crop x');
  close(spec.cropRect.right, 100, 'boundary crop right');
  close(spec.padding.areaFraction, 0, 'boundary padding');
  assertContained(spec, 'exact boundary');
});

test('one floating-point step beyond containment is diagnosed as padded', () => {
  const spec = specFor(box(0, 50, 100, 100), 100, 200, {
    scale: 1 + Number.EPSILON,
    verticalShift: 0,
    outputSize: 100,
  });
  assert.equal(spec.requestedFits, false);
  assert.ok(spec.padding.areaFraction > 0);
  assertContained(spec, 'over boundary');
});

test('sex-model settings remain expressible through the shared API', () => {
  const spec = specFor(box(400, 300, 200, 200), 1000, 800, {
    scale: 1.5,
    verticalShift: 0,
    outputSize: 96,
  });
  close(spec.cropRect.width, 300, 'sex side');
  close(spec.cropRect.y, 250, 'sex centered y');
  close(spec.destRect.width, 96, 'sex output width');
});

test('invalid and non-finite inputs fail before emitting geometry', () => {
  const valid = [{ x: 0.2, y: 0.2 }, { x: 0.8, y: 0.8 }];
  assert.throws(() => computeSquareCropSpec([], 100, 100), /non-empty/);
  assert.throws(() => computeSquareCropSpec([{ x: NaN, y: 0 }, { x: 1, y: 1 }], 100, 100), /finite/);
  assert.throws(() => computeSquareCropSpec(valid, 0, 100), /greater than zero/);
  assert.throws(() => computeSquareCropSpec(valid, 100, Infinity), /greater than zero/);
  assert.throws(() => computeSquareCropSpec(valid, 100, 100, { scale: 0 }), /greater than zero/);
  assert.throws(() => computeSquareCropSpec(valid, 100, 100, { verticalShift: NaN }), /finite/);
  assert.throws(() => computeSquareCropSpec(valid, 100, 100, { outputSize: 0 }), /greater than zero/);
  assert.throws(() => computeSquareCropSpec([{ x: 0.5, y: 0.5 }, { x: 0.5, y: 0.5 }], 100, 100), /positive width and height/);
});

let failures = 0;
for (const { name, run } of cases) {
  try {
    run();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`not ok - ${name}`);
    console.error(error && error.stack ? error.stack : error);
  }
}

console.log(`\n${cases.length - failures}/${cases.length} face-crop tests passed.`);
if (failures) process.exit(1);
