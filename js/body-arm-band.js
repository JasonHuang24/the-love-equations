// ── The arm-in-measurement-band predicate. ONE definition, two consumers. ─────────────────────────
// The silhouette scan grows a contiguous run of body pixels outward from the torso centre, so an arm
// pressed against — or resting on — the torso is counted AS torso: the waist and hip widths inflate and
// a tapered physique reads straight. js/body-pose-worker.js therefore zeroes those widths when an elbow
// or wrist sits inside a measurement band, and body.html's camera guide has to refuse to auto-snap on
// exactly the same condition — or the guide green-lights a pose the scan then declines to measure.
//
// It did. The guide checked WRISTS only (poseSkeleton.armNearWaist) while the scan checked elbows OR
// wrists, and 68% of every refusal in the 2026-08-14 battery was that one cause. The fix duplicated the
// scan's predicate into the page, which made the two agree and left them free to drift apart again.
// This file ends that: the worker importScripts() it, the page loads it as a plain script, and neither
// carries its own copy. drawAndScore also compares this function's answer against the widths the worker
// actually zeroed, so a reintroduced duplicate fails loudly on the first photo instead of drifting.
//
// Landmark-only (BlazePose 33-point normalized coords) — no mask, no pixels — so the live alignment
// probe can run it per frame without a silhouette. (DOM-free, testable.)
(function (scope) {
  'use strict';

  // Band edges in units of the shoulder→hip span, measured from the shoulder line (waist) or the hip
  // line (hips). These are the scan's own bands: change them here and BOTH contexts move together.
  var WAIST_FROM_SHOULDER = 0.42, WAIST_TO_HIP = -0.06;
  var HIP_FROM_HIP = -0.04, HIP_TO_HIP = 0.22;
  var TORSO_HALF_SLACK = 1.1;        // "tucked in against the body" = within ~1.1 torso half-widths of centre
  var ARM_IDX = [13, 14, 15, 16];    // elbows + wrists (the scan counts either — a resting elbow is enough)
  var TORSO_IDX = [11, 12, 23, 24];  // shoulders + hips

  function finite(p) { return p && isFinite(p.x) && isFinite(p.y); }

  // → { waistArm, hipArm, ok }. `ok` is false when the torso landmarks cannot support the read at all
  // (missing joints, degenerate span); both flags are then false, which is the same "nothing detected"
  // answer both call sites already treated as the safe default.
  function bodyArmBand(lm) {
    var out = { waistArm: false, hipArm: false, ok: false };
    if (!lm || lm.length < 25) return out;
    for (var t = 0; t < TORSO_IDX.length; t++) if (!finite(lm[TORSO_IDX[t]])) return out;
    var shoulderY = (lm[11].y + lm[12].y) / 2;
    var hipY = (lm[23].y + lm[24].y) / 2;
    var span = hipY - shoulderY;
    if (!(span > 0.01)) return out;
    var centerX = (lm[11].x + lm[12].x + lm[23].x + lm[24].x) / 4;
    var torsoHalf = Math.max(Math.abs(lm[11].x - lm[12].x), Math.abs(lm[23].x - lm[24].x)) / 2;
    var inBand = function (loY, hiY) {
      for (var i = 0; i < ARM_IDX.length; i++) {
        var a = lm[ARM_IDX[i]];
        if (finite(a) && a.y >= loY && a.y <= hiY && Math.abs(a.x - centerX) < torsoHalf * TORSO_HALF_SLACK) return true;
      }
      return false;
    };
    out.ok = true;
    out.waistArm = inBand(shoulderY + WAIST_FROM_SHOULDER * span, hipY + WAIST_TO_HIP * span);
    out.hipArm = inBand(hipY + HIP_FROM_HIP * span, hipY + HIP_TO_HIP * span);
    return out;
  }

  scope.bodyArmBand = bodyArmBand;
})(typeof self !== 'undefined' ? self : globalThis);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { bodyArmBand: (typeof self !== 'undefined' ? self : globalThis).bodyArmBand };
}
