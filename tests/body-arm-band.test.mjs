import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../js/body-arm-band.js', import.meta.url), 'utf8');
const context = { globalThis: {} };
vm.runInNewContext(source, context, { filename: 'js/body-arm-band.js' });
const bodyArmBand = landmarks => JSON.parse(JSON.stringify(context.globalThis.bodyArmBand(landmarks)));

function pose() {
  const landmarks = Array.from({ length: 33 }, () => null);
  landmarks[11] = { x: 0.4, y: 0.2 };
  landmarks[12] = { x: 0.6, y: 0.2 };
  landmarks[23] = { x: 0.42, y: 0.5 };
  landmarks[24] = { x: 0.58, y: 0.5 };
  landmarks[13] = { x: 0.28, y: 0.3 };
  landmarks[14] = { x: 0.72, y: 0.3 };
  landmarks[15] = { x: 0.25, y: 0.55 };
  landmarks[16] = { x: 0.75, y: 0.55 };
  return landmarks;
}

assert.deepEqual(bodyArmBand(null), { waistArm: false, hipArm: false, ok: false });
assert.deepEqual(bodyArmBand([]), { waistArm: false, hipArm: false, ok: false });

for (const index of [11, 12, 23, 24]) {
  const landmarks = pose();
  landmarks[index] = null;
  assert.deepEqual(bodyArmBand(landmarks), { waistArm: false, hipArm: false, ok: false });
}

{
  const landmarks = pose();
  landmarks[23].y = landmarks[11].y + 0.005;
  landmarks[24].y = landmarks[12].y + 0.005;
  assert.deepEqual(bodyArmBand(landmarks), { waistArm: false, hipArm: false, ok: false },
    'degenerate torso spans cannot classify an arm band');
}

assert.deepEqual(bodyArmBand(pose()), { waistArm: false, hipArm: false, ok: true });

for (const armIndex of [13, 14, 15, 16]) {
  const landmarks = pose();
  landmarks[armIndex] = { x: 0.5, y: 0.4 };
  assert.deepEqual(bodyArmBand(landmarks), { waistArm: true, hipArm: false, ok: true },
    `arm landmark ${armIndex} is authoritative in the waist band`);
}

{
  const landmarks = pose();
  landmarks[15] = { x: 0.5, y: 0.52 };
  assert.deepEqual(bodyArmBand(landmarks), { waistArm: false, hipArm: true, ok: true });
}

{
  const landmarks = pose();
  landmarks[13] = { x: 0.5, y: 0.4 };
  landmarks[15] = { x: 0.5, y: 0.52 };
  assert.deepEqual(bodyArmBand(landmarks), { waistArm: true, hipArm: true, ok: true });
}

{
  const landmarks = pose();
  landmarks[13] = { x: 0.62, y: 0.4 };
  assert.deepEqual(bodyArmBand(landmarks), { waistArm: false, hipArm: false, ok: true },
    'an arm outside torso-half-width plus slack does not corrupt the width scan');
}

{
  const left = pose();
  left[13] = { x: 0.45, y: 0.4 };
  const right = left.map(point => point && ({ ...point, x: 1 - point.x }));
  assert.deepEqual(bodyArmBand(left), bodyArmBand(right), 'mirroring preserves arm-band classification');
}

{
  const landmarks = pose();
  landmarks[13] = { x: NaN, y: 0.4 };
  landmarks[14] = { x: 0.5, y: Infinity };
  assert.deepEqual(bodyArmBand(landmarks), { waistArm: false, hipArm: false, ok: true },
    'non-finite arm landmarks are ignored rather than poisoning the torso read');
}

// The predicate deliberately classifies geometry only. Confidence belongs to the shared
// camera/worker caller contract; changing that threshold would change cue survival and needs
// aggregate evidence rather than an arbitrary scoring tweak.
{
  const landmarks = pose();
  landmarks[13] = { x: 0.5, y: 0.4, visibility: 0, presence: 0 };
  assert.equal(bodyArmBand(landmarks).waistArm, true);
}

console.log('body-arm-band: invalid, boundary, elbow/wrist, hip/waist, mirror, and finite cases passed');
