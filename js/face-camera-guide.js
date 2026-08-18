/* Face Calculator camera-guide geometry.
 *
 * Pure/DOM-free on purpose: the live preview, tests, and coverage audit must all use the
 * same viewBox-to-video mapping and alignment thresholds. The preview is mirrored, while
 * captured pixels are not; `mirrored` therefore changes display coordinates only.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.FaceCameraGuide = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const ALIGNMENT_CODES = Object.freeze({
    NO_FACE: 'no_face',
    MOVE_CLOSER: 'move_closer',
    MOVE_BACK: 'move_back',
    CENTER_FACE: 'center_face',
    ALIGN_EYES: 'align_eyes',
    LEVEL_HEAD: 'level_head',
    SQUARE_ON: 'face_camera_square_on',
    READY: 'ready'
  });

  const ALIGNMENT_HINTS = Object.freeze({
    no_face: 'No face — look at the camera.',
    move_closer: 'Move closer.',
    move_back: 'Move back.',
    center_face: 'Center your face.',
    align_eyes: 'Align your eyes with the bar.',
    level_head: 'Level your head.',
    face_camera_square_on: 'Face the camera square-on.',
    ready: 'Ready — hold still…'
  });

  // These values describe the SVG in face.html. Scale is the mean of cheek-width / oval-width
  // and forehead-to-chin height / oval-height. Thresholds are deliberately symmetric around
  // the drawn guide and stricter than the downstream refusal gate: the guide is for acquiring
  // a standardized capture; the downstream gate remains the final safety check.
  const DEFAULT_CONFIG = Object.freeze({
    viewBox: Object.freeze({ minX: 0, minY: 0, width: 100, height: 100 }),
    oval: Object.freeze({ cx: 50, cy: 46, rx: 20, ry: 27 }),
    eyeLineY: 40,
    minScale: 0.72,
    maxScale: 1.10,
    centerXTolerance: 5,
    eyeYTolerance: 4,
    maxRollDeg: 8,
    maxYawDeg: 12,
    maxPoseSkew: 0.12
  });

  function finite(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function finitePoint(point) {
    return !!point && finite(point.x) && finite(point.y);
  }

  function round(value, digits) {
    if (!finite(value)) return null;
    const factor = 10 ** (digits == null ? 4 : digits);
    return Math.round(value * factor) / factor;
  }
  // Protect inclusive public thresholds from floating-point round-off after coordinate transforms.
  function above(value, limit) {
    return value - limit > 1e-9;
  }


  /** Exact SVG preserveAspectRatio="xMidYMid meet" transform. */
  function computeViewBoxTransform(viewportWidth, viewportHeight, viewBox) {
    const vb = viewBox || DEFAULT_CONFIG.viewBox;
    if (![viewportWidth, viewportHeight, vb.minX, vb.minY, vb.width, vb.height].every(finite)
        || viewportWidth <= 0 || viewportHeight <= 0 || vb.width <= 0 || vb.height <= 0) return null;
    const scale = Math.min(viewportWidth / vb.width, viewportHeight / vb.height);
    const renderedWidth = vb.width * scale;
    const renderedHeight = vb.height * scale;
    const offsetX = (viewportWidth - renderedWidth) / 2;
    const offsetY = (viewportHeight - renderedHeight) / 2;
    return {
      viewportWidth,
      viewportHeight,
      viewBox: { minX: vb.minX, minY: vb.minY, width: vb.width, height: vb.height },
      scale,
      offsetX,
      offsetY,
      renderedWidth,
      renderedHeight
    };
  }

  /** Map an unmirrored, normalized video landmark into SVG guide units. */
  function normalizedVideoPointToGuide(point, transform, mirrored) {
    if (!finitePoint(point) || !transform || !finite(transform.scale) || transform.scale <= 0) return null;
    const xNorm = mirrored === false ? point.x : 1 - point.x;
    const xPx = xNorm * transform.viewportWidth;
    const yPx = point.y * transform.viewportHeight;
    return {
      x: transform.viewBox.minX + (xPx - transform.offsetX) / transform.scale,
      y: transform.viewBox.minY + (yPx - transform.offsetY) / transform.scale
    };
  }

  /** Inverse helper used by deterministic tests and the debug coverage harness. */
  function guidePointToNormalizedVideo(point, transform, mirrored) {
    if (!finitePoint(point) || !transform || !finite(transform.scale) || transform.scale <= 0) return null;
    const shownX = (transform.offsetX + (point.x - transform.viewBox.minX) * transform.scale) / transform.viewportWidth;
    return {
      x: mirrored === false ? shownX : 1 - shownX,
      y: (transform.offsetY + (point.y - transform.viewBox.minY) * transform.scale) / transform.viewportHeight
    };
  }

  function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function noFaceResult(transform) {
    return {
      ready: false,
      code: ALIGNMENT_CODES.NO_FACE,
      hint: ALIGNMENT_HINTS.no_face,
      transform: transform || null,
      metrics: null
    };
  }

  /**
   * Classify one live FaceMesh result against the actual SVG guide.
   * `pose` is computeMetrics(...) output. Only coarse yaw is consumed; roll is recomputed in
   * display coordinates so the live guide and the mirrored preview share one coordinate system.
   */
  function evaluateCameraAlignment(landmarks, videoWidth, videoHeight, pose, options) {
    const opts = options || {};
    const cfg = Object.assign({}, DEFAULT_CONFIG, opts.config || {});
    const transform = computeViewBoxTransform(videoWidth, videoHeight, cfg.viewBox);
    if (!transform || !Array.isArray(landmarks) || landmarks.length < 468) return noFaceResult(transform);

    const required = [10, 33, 133, 152, 234, 263, 362, 454];
    if (required.some(index => !finitePoint(landmarks[index]))) return noFaceResult(transform);
    const mapped = {};
    for (const index of required) {
      mapped[index] = normalizedVideoPointToGuide(landmarks[index], transform, opts.mirrored !== false);
      if (!mapped[index]) return noFaceResult(transform);
    }

    const eyeR = midpoint(mapped[33], mapped[133]);
    const eyeL = midpoint(mapped[263], mapped[362]);
    const eyes = midpoint(eyeR, eyeL);
    const cheeks = midpoint(mapped[234], mapped[454]);
    const faceWidth = distance(mapped[234], mapped[454]);
    const faceHeight = distance(mapped[10], mapped[152]);
    const widthScale = faceWidth / (cfg.oval.rx * 2);
    const heightScale = faceHeight / (cfg.oval.ry * 2);
    const faceScale = (widthScale + heightScale) / 2;
    const centerOffsetDisplay = cheeks.x - cfg.oval.cx;
    const centerOffsetRaw = opts.mirrored === false ? centerOffsetDisplay : -centerOffsetDisplay;
    const eyeLineOffset = eyes.y - cfg.eyeLineY;
    // Use the acute line angle: mirroring reverses eye order, but must never turn a level
    // eye line into 180 degrees or reverse the correction.
    const rollDeg = Math.atan2(Math.abs(eyeL.y - eyeR.y), Math.abs(eyeL.x - eyeR.x)) * 180 / Math.PI;

    const yawDeg = pose && finite(pose.yawDeg) ? Math.abs(pose.yawDeg) : 0;
    const pitchDeg = pose && finite(pose.pitchDeg) ? pose.pitchDeg : 0;
    const poseSkew = pose && finite(pose.poseSkew) ? Math.abs(pose.poseSkew) : 0;
    const zAlive = yawDeg !== 0 || pitchDeg !== 0;
    const squareOn = zAlive ? yawDeg <= cfg.maxYawDeg : poseSkew <= cfg.maxPoseSkew;

    const metrics = {
      faceScale: round(faceScale),
      widthScale: round(widthScale),
      heightScale: round(heightScale),
      centerOffsetDisplay: round(centerOffsetDisplay),
      centerOffsetRaw: round(centerOffsetRaw),
      eyeLineOffset: round(eyeLineOffset),
      rollDeg: round(rollDeg),
      yawDeg: round(yawDeg),
      poseSkew: round(poseSkew),
      guideFaceCenterX: round(cheeks.x),
      guideEyeLineY: round(eyes.y)
    };

    let code = ALIGNMENT_CODES.READY;
    if (!finite(faceScale) || above(cfg.minScale, faceScale)) code = ALIGNMENT_CODES.MOVE_CLOSER;
    else if (above(faceScale, cfg.maxScale)) code = ALIGNMENT_CODES.MOVE_BACK;
    else if (above(Math.abs(centerOffsetDisplay), cfg.centerXTolerance)) code = ALIGNMENT_CODES.CENTER_FACE;
    else if (above(Math.abs(eyeLineOffset), cfg.eyeYTolerance)) code = ALIGNMENT_CODES.ALIGN_EYES;
    else if (above(rollDeg, cfg.maxRollDeg)) code = ALIGNMENT_CODES.LEVEL_HEAD;
    else if (!squareOn) code = ALIGNMENT_CODES.SQUARE_ON;

    return {
      ready: code === ALIGNMENT_CODES.READY,
      code,
      hint: ALIGNMENT_HINTS[code],
      transform,
      metrics
    };
  }

  function cleanMetrics(metrics) {
    if (!metrics || typeof metrics !== 'object') return null;
    const out = {};
    for (const key of Object.keys(metrics)) {
      if (finite(metrics[key])) out[key] = metrics[key];
    }
    return Object.keys(out).length ? out : null;
  }

  /** Structured, image-free provenance for a camera capture. */
  function makeCaptureProvenance(trigger, alignment, frameWidth, frameHeight) {
    const code = alignment && ALIGNMENT_HINTS[alignment.code] ? alignment.code : ALIGNMENT_CODES.NO_FACE;
    return {
      version: 1,
      source: 'camera',
      trigger: trigger === 'auto' ? 'auto' : 'manual',
      guidePassed: code === ALIGNMENT_CODES.READY,
      alignmentCode: code,
      alignmentMetrics: cleanMetrics(alignment && alignment.metrics),
      frameWidth: finite(frameWidth) && frameWidth > 0 ? Math.round(frameWidth) : null,
      frameHeight: finite(frameHeight) && frameHeight > 0 ? Math.round(frameHeight) : null
    };
  }

  return Object.freeze({
    ALIGNMENT_CODES,
    ALIGNMENT_HINTS,
    DEFAULT_CONFIG,
    computeViewBoxTransform,
    normalizedVideoPointToGuide,
    guidePointToNormalizedVideo,
    evaluateCameraAlignment,
    makeCaptureProvenance
  });
}));
