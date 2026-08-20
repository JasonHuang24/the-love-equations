/* Body Calculator camera-guide geometry and capture provenance.
 *
 * Pure/DOM-free on purpose: the live preview, deterministic coverage audit, and tests
 * must all use the same SVG-to-video mapping and the worker's production gate result.
 * The preview is mirrored while captured pixels are not; mirroring changes display
 * coordinates only, never whether a pose is accepted.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.BodyCameraGuide = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const GUIDE_CODES = Object.freeze({
    NO_BODY: 'no_body',
    MOVE_CLOSER: 'move_closer',
    MOVE_BACK: 'move_back',
    CENTER_BODY: 'center_body',
    ALIGN_FEET: 'align_feet',
    STAND_UPRIGHT: 'stand_upright',
    SQUARE_ON: 'face_camera_square_on',
    STRAIGHTEN_LEGS: 'straighten_legs',
    LEVEL_BODY: 'level_shoulders_hips',
    ARMS_OUT: 'arms_out',
    READY: 'ready'
  });

  const GUIDE_HINTS = Object.freeze({
    no_body: 'No complete body found - step into the frame.',
    move_closer: 'Step closer - fill the guide from head to feet.',
    move_back: 'Step back - keep your whole body in frame.',
    center_body: 'Move to the center line.',
    align_feet: 'Put your feet on the red line.',
    stand_upright: 'Stand up straight, square to the camera.',
    face_camera_square_on: 'Turn to face the camera square-on.',
    straighten_legs: 'Stand upright with your legs straight.',
    level_shoulders_hips: 'Square up - keep your shoulders and hips level.',
    arms_out: 'Move your arms a few inches out from your waist and hips.',
    ready: 'Ready - hold still...'
  });

  /* These coordinates are the camera SVG in body.html, not an approximate overlay:
   * head circle center (50,13), arm endpoints x=27/73, ankle endpoints y=90,
   * and the visible foot bar y=91. Body landmarks align to the head center and ankle
   * endpoints; the circle radius is deliberately not treated as a landmark.
   */
  const DEFAULT_CONFIG = Object.freeze({
    viewBox: Object.freeze({ minX: 0, minY: 0, width: 100, height: 100 }),
    guide: Object.freeze({
      centerX: 50,
      headLandmarkY: 13,
      feetLandmarkY: 90,
      feetLineY: 91,
      outerLeftX: 27,
      outerRightX: 73
    }),
    minBodyScale: 0.72,
    maxBodyScale: 1.10,
    centerXTolerance: 6,
    feetYTolerance: 5,
    minLandmarkConfidence: 0.30
  });

  const CAPTURE_PROVENANCE_VERSION = 1;
  const MAX_FRAME_DIMENSION = 32768;
  const PRODUCTION_REQUIRED = Object.freeze([0, 11, 12, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
  const BODY_BOUND_INDICES = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]);
  const HEAD_INDICES = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const TORSO_INDICES = Object.freeze([11, 12, 23, 24]);
  const FOOT_INDICES = Object.freeze([27, 28, 29, 30, 31, 32]);
  const POSE_CODES = Object.freeze(['malformed', 'upright', 'partial', 'profile', 'standing', 'ok']);
  const GUIDE_METRIC_RANGES = Object.freeze({
    bodyScale: Object.freeze([0, 10]),
    bodyWidthScale: Object.freeze([0, 10]),
    centerOffsetDisplay: Object.freeze([-1000, 1000]),
    centerOffsetRaw: Object.freeze([-1000, 1000]),
    feetLineOffset: Object.freeze([-1000, 1000]),
    headY: Object.freeze([-1000, 1000]),
    feetY: Object.freeze([-1000, 1000]),
    boundsMinX: Object.freeze([-1000, 1000]),
    boundsMaxX: Object.freeze([-1000, 1000]),
    boundsMinY: Object.freeze([-1000, 1000]),
    boundsMaxY: Object.freeze([-1000, 1000]),
    boundsWidth: Object.freeze([0, 2000]),
    boundsHeight: Object.freeze([0, 2000]),
    confidentLandmarks: Object.freeze([0, 33]),
    minLandmarkConfidence: Object.freeze([0, 1]),
    torsoCenterX: Object.freeze([-1000, 1000])
  });
  const POSE_METRIC_RANGES = Object.freeze({
    lowerConfidence: Object.freeze([0, 1]),
    shoulderTorso: Object.freeze([0, 10]),
    hipTorso: Object.freeze([0, 10]),
    yawDeg: Object.freeze([0, 180]),
    tilt: Object.freeze([0, 10])
  });

  function finite(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function finitePoint(point) {
    return !!point && finite(point.x) && finite(point.y);
  }

  /* Exact worker semantics: absent visibility/presence means the model omitted the
   * signal (assume present); a supplied non-finite signal means corrupt (assume absent).
   */
  function landmarkConfidence(point) {
    if (!point || typeof point !== 'object') return 0;
    const visibility = point.visibility == null ? 1 : point.visibility;
    const presence = point.presence == null ? 1 : point.presence;
    return Math.min(finite(visibility) ? visibility : 0, finite(presence) ? presence : 0);
  }

  function round(value, digits) {
    if (!finite(value)) return null;
    const factor = 10 ** (digits == null ? 4 : digits);
    return Math.round(value * factor) / factor;
  }

  /* Inclusive public thresholds should not flip because an inverse transform left a
   * value a few ulps outside its mathematical boundary.
   */
  function above(value, limit) {
    return value - limit > 1e-9;
  }

  function mergedConfig(override) {
    const custom = override && typeof override === 'object' ? override : {};
    return Object.assign({}, DEFAULT_CONFIG, custom, {
      viewBox: Object.assign({}, DEFAULT_CONFIG.viewBox,
        custom.viewBox && typeof custom.viewBox === 'object' ? custom.viewBox : {}),
      guide: Object.assign({}, DEFAULT_CONFIG.guide,
        custom.guide && typeof custom.guide === 'object' ? custom.guide : {})
    });
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

  /** Map an unmirrored normalized video landmark into SVG guide units. */
  function normalizedVideoPointToGuide(point, transform, mirrored) {
    if (!finitePoint(point) || !transform || !finite(transform.scale) || transform.scale <= 0
        || !finite(transform.viewportWidth) || !finite(transform.viewportHeight)
        || transform.viewportWidth <= 0 || transform.viewportHeight <= 0) return null;
    const xNorm = mirrored === false ? point.x : 1 - point.x;
    const xPx = xNorm * transform.viewportWidth;
    const yPx = point.y * transform.viewportHeight;
    return {
      x: transform.viewBox.minX + (xPx - transform.offsetX) / transform.scale,
      y: transform.viewBox.minY + (yPx - transform.offsetY) / transform.scale
    };
  }

  /** Inverse helper for deterministic fixtures and the browser coverage audit. */
  function guidePointToNormalizedVideo(point, transform, mirrored) {
    if (!finitePoint(point) || !transform || !finite(transform.scale) || transform.scale <= 0
        || !finite(transform.viewportWidth) || !finite(transform.viewportHeight)
        || transform.viewportWidth <= 0 || transform.viewportHeight <= 0) return null;
    const shownX = (transform.offsetX + (point.x - transform.viewBox.minX) * transform.scale)
      / transform.viewportWidth;
    return {
      x: mirrored === false ? shownX : 1 - shownX,
      y: (transform.offsetY + (point.y - transform.viewBox.minY) * transform.scale)
        / transform.viewportHeight
    };
  }

  function average(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Return the display-space bounds of confident BlazePose landmarks. Required anchor
   * groups prevent a confident hand or torso fragment from masquerading as a whole body.
   */
  function computeConfidentBodyBounds(landmarks, transform, options) {
    const opts = options || {};
    const cfg = mergedConfig(opts.config);
    if (!Array.isArray(landmarks) || landmarks.length < 33 || !transform
        || !finite(cfg.minLandmarkConfidence) || cfg.minLandmarkConfidence < 0
        || cfg.minLandmarkConfidence > 1) return null;

    const mapped = new Map();
    for (const index of BODY_BOUND_INDICES) {
      const point = landmarks[index];
      if (!finitePoint(point) || landmarkConfidence(point) + 1e-9 < cfg.minLandmarkConfidence) continue;
      const display = normalizedVideoPointToGuide(point, transform, opts.mirrored !== false);
      if (display && finitePoint(display)) mapped.set(index, display);
    }

    const group = indices => indices.filter(index => mapped.has(index)).map(index => mapped.get(index));
    const heads = group(HEAD_INDICES);
    const torso = group(TORSO_INDICES);
    const feet = group(FOOT_INDICES);
    if (!heads.length || torso.length < 4 || feet.length < 2 || mapped.size < 7) return null;

    const points = Array.from(mapped.values());
    const xs = points.map(point => point.x);
    const ys = points.map(point => point.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const headY = Math.min(...heads.map(point => point.y));
    const feetY = Math.max(...feet.map(point => point.y));
    const torsoCenterX = average(torso.map(point => point.x));
    if (![minX, maxX, minY, maxY, headY, feetY, torsoCenterX].every(finite)
        || !(feetY > headY)) return null;

    return {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
      headY,
      feetY,
      torsoCenterX,
      used: mapped.size,
      indices: Array.from(mapped.keys())
    };
  }

  function productionGatePassed(quality) {
    return !!quality && quality.ok === true && quality.code === 'ok'
      && quality.framing === 'full' && quality.band === 'pass';
  }

  function cleanRangedNumericObject(input, ranges) {
    if (!input || typeof input !== 'object') return null;
    const out = {};
    for (const key of Object.keys(ranges)) {
      const value = input[key];
      const range = ranges[key];
      if (!finite(value) || value < range[0] || value > range[1]) continue;
      if (key === 'confidentLandmarks' && !Number.isInteger(value)) continue;
      out[key] = value;
    }
    return Object.keys(out).length ? out : null;
  }

  function sanitizePoseQuality(quality) {
    if (!quality || typeof quality !== 'object') return null;
    const nested = quality.metrics && typeof quality.metrics === 'object' ? quality.metrics : null;
    const source = nested ? Object.assign({}, quality, nested) : quality;
    const code = typeof source.code === 'string' && POSE_CODES.includes(source.code) ? source.code : null;
    const framing = source.framing === 'full' || source.framing === 'torso' ? source.framing : null;
    const band = source.band === 'pass' || source.band === 'degraded' ? source.band : null;
    const metrics = cleanRangedNumericObject(source, POSE_METRIC_RANGES) || {};
    for (const key of ['thighVertical', 'shinVertical']) {
      const values = source[key];
      if (!Array.isArray(values) || !values.length || values.length > 2) continue;
      if (values.every(value => finite(value) && value >= -1 && value <= 1))
        metrics[key] = values.slice();
    }
    return {
      ok: source.ok === true && code === 'ok',
      code,
      framing,
      band,
      metrics: Object.keys(metrics).length ? metrics : null
    };
  }

  function guideResult(code, transform, metrics, quality, armBand) {
    return {
      ready: code === GUIDE_CODES.READY,
      code,
      hint: GUIDE_HINTS[code],
      transform: transform || null,
      metrics: metrics || null,
      productionGate: sanitizePoseQuality(quality),
      armBand: armBand || null
    };
  }

  function codeForFailedProductionQuality(quality) {
    if (!quality || typeof quality !== 'object') return GUIDE_CODES.NO_BODY;
    if (quality.ok !== true) {
      if (quality.code === 'partial') return GUIDE_CODES.MOVE_BACK;
      if (quality.code === 'profile') return GUIDE_CODES.SQUARE_ON;
      if (quality.code === 'standing') return GUIDE_CODES.STRAIGHTEN_LEGS;
      if (quality.code === 'upright') return GUIDE_CODES.STAND_UPRIGHT;
      return GUIDE_CODES.NO_BODY;
    }
    if (quality.code !== 'ok') return GUIDE_CODES.NO_BODY;
    if (quality.framing !== 'full') return quality.framing === 'torso'
      ? GUIDE_CODES.MOVE_BACK : GUIDE_CODES.NO_BODY;
    if (quality.band !== 'pass') return quality.band === 'degraded'
      ? GUIDE_CODES.LEVEL_BODY : GUIDE_CODES.NO_BODY;
    return null;
  }

  function sharedArmBandResult(landmarks, options) {
    const predicate = options && typeof options.armBand === 'function'
      ? options.armBand
      : root && typeof root.bodyArmBand === 'function' ? root.bodyArmBand : null;
    if (!predicate) return { waistArm: false, hipArm: false, ok: false };
    try {
      const result = predicate(landmarks);
      return {
        waistArm: !!(result && result.waistArm),
        hipArm: !!(result && result.hipArm),
        ok: !!(result && result.ok)
      };
    } catch (_) {
      return { waistArm: false, hipArm: false, ok: false };
    }
  }

  /**
   * Classify one live worker probe against the actual SVG guide. `quality` must be the
   * production worker's assessPose result; this module intentionally does not duplicate
   * its framing thresholds. Ready is therefore a strict subset of full/pass production reads.
   */
  function evaluateCameraAlignment(landmarks, videoWidth, videoHeight, quality, options) {
    const opts = options || {};
    const cfg = mergedConfig(opts.config);
    const transform = computeViewBoxTransform(videoWidth, videoHeight, cfg.viewBox);
    if (!transform || !Array.isArray(landmarks) || landmarks.length < 33
        || PRODUCTION_REQUIRED.some(index => !finitePoint(landmarks[index]))) {
      return guideResult(GUIDE_CODES.NO_BODY, transform, null, quality, null);
    }

    const failedCode = codeForFailedProductionQuality(quality);
    if (failedCode) return guideResult(failedCode, transform, null, quality, null);

    const bounds = computeConfidentBodyBounds(landmarks, transform, opts);
    if (!bounds) return guideResult(GUIDE_CODES.NO_BODY, transform, null, quality, null);

    const armBand = sharedArmBandResult(landmarks, opts);
    if (!armBand.ok) return guideResult(GUIDE_CODES.NO_BODY, transform, null, quality, armBand);

    const guideHeight = cfg.guide.feetLandmarkY - cfg.guide.headLandmarkY;
    const guideWidth = cfg.guide.outerRightX - cfg.guide.outerLeftX;
    if (!(finite(guideHeight) && guideHeight > 0 && finite(guideWidth) && guideWidth > 0)
        || ![cfg.minBodyScale, cfg.maxBodyScale, cfg.centerXTolerance,
          cfg.feetYTolerance, cfg.guide.centerX, cfg.guide.feetLandmarkY].every(finite)) {
      return guideResult(GUIDE_CODES.NO_BODY, transform, null, quality, armBand);
    }

    const bodyScale = (bounds.feetY - bounds.headY) / guideHeight;
    const bodyWidthScale = bounds.width / guideWidth;
    const centerOffsetDisplay = bounds.torsoCenterX - cfg.guide.centerX;
    const centerOffsetRaw = opts.mirrored === false ? centerOffsetDisplay : -centerOffsetDisplay;
    const feetLineOffset = bounds.feetY - cfg.guide.feetLandmarkY;
    const metrics = {
      bodyScale: round(bodyScale),
      bodyWidthScale: round(bodyWidthScale),
      centerOffsetDisplay: round(centerOffsetDisplay),
      centerOffsetRaw: round(centerOffsetRaw),
      feetLineOffset: round(feetLineOffset),
      headY: round(bounds.headY),
      feetY: round(bounds.feetY),
      boundsMinX: round(bounds.minX),
      boundsMaxX: round(bounds.maxX),
      boundsMinY: round(bounds.minY),
      boundsMaxY: round(bounds.maxY),
      boundsWidth: round(bounds.width),
      boundsHeight: round(bounds.height),
      confidentLandmarks: bounds.used,
      minLandmarkConfidence: cfg.minLandmarkConfidence,
      torsoCenterX: round(bounds.torsoCenterX)
    };

    let code = GUIDE_CODES.READY;
    if (!finite(bodyScale) || above(cfg.minBodyScale, bodyScale)) code = GUIDE_CODES.MOVE_CLOSER;
    else if (above(bodyScale, cfg.maxBodyScale)) code = GUIDE_CODES.MOVE_BACK;
    else if (above(Math.abs(centerOffsetDisplay), cfg.centerXTolerance)) code = GUIDE_CODES.CENTER_BODY;
    else if (above(Math.abs(feetLineOffset), cfg.feetYTolerance)) code = GUIDE_CODES.ALIGN_FEET;
    else if (armBand.waistArm || armBand.hipArm) code = GUIDE_CODES.ARMS_OUT;

    /* Defensive invariant: even a future refactor cannot mark ready unless the exact
     * production result is still full/pass.
     */
    if (code === GUIDE_CODES.READY && !productionGatePassed(quality)) code = GUIDE_CODES.NO_BODY;
    return guideResult(code, transform, metrics, quality, armBand);
  }

  function cleanGuideMetrics(metrics) {
    return cleanRangedNumericObject(metrics, GUIDE_METRIC_RANGES);
  }

  function cleanDimension(value) {
    return finite(value) && value > 0 && value <= MAX_FRAME_DIMENSION ? Math.round(value) : null;
  }

  function cleanTimestamp(value) {
    return finite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER ? Math.round(value) : null;
  }

  /** Sanitize restored/untrusted capture provenance by rebuilding only the v1 allowlist. */
  function sanitizeCaptureProvenance(input) {
    if (!input || typeof input !== 'object' || input.version !== CAPTURE_PROVENANCE_VERSION
        || input.source !== 'camera' || (input.trigger !== 'manual' && input.trigger !== 'auto')) return null;
    const code = typeof input.guideCode === 'string' && Object.values(GUIDE_CODES).includes(input.guideCode)
      ? input.guideCode : GUIDE_CODES.NO_BODY;
    return {
      version: CAPTURE_PROVENANCE_VERSION,
      source: 'camera',
      trigger: input.trigger,
      guidePassed: code === GUIDE_CODES.READY,
      guideCode: code,
      guideMetrics: cleanGuideMetrics(input.guideMetrics),
      poseQuality: sanitizePoseQuality(input.poseQuality),
      frameWidth: cleanDimension(input.frameWidth),
      frameHeight: cleanDimension(input.frameHeight),
      timestamp: cleanTimestamp(input.timestamp)
    };
  }

  /** Structured, image-free provenance for one camera shutter event. */
  function makeCaptureProvenance(trigger, alignment, quality, frameWidth, frameHeight, timestamp) {
    const code = alignment && Object.values(GUIDE_CODES).includes(alignment.code)
      ? alignment.code : GUIDE_CODES.NO_BODY;
    return sanitizeCaptureProvenance({
      version: CAPTURE_PROVENANCE_VERSION,
      source: 'camera',
      trigger: trigger === 'auto' ? 'auto' : 'manual',
      guideCode: code,
      guideMetrics: alignment && alignment.metrics,
      poseQuality: quality,
      frameWidth,
      frameHeight,
      timestamp
    });
  }

  /**
   * Generation-owned camera stream lifecycle. Browser bindings are injected so late
   * permission/play completions and hardware-ended events can be tested without a DOM.
   */
  function createCameraLifecycle(options) {
    const opts = options && typeof options === 'object' ? options : {};
    if (typeof opts.getUserMedia !== 'function') throw new TypeError('getUserMedia is required');
    const stopped = typeof WeakSet === 'function' ? new WeakSet() : null;
    let generation = 0, activeStream = null, requesting = false, live = false;
    let removeEndListeners = null;

    function stopStream(candidate) {
      if (!candidate || (stopped && stopped.has(candidate))) return;
      if (stopped) stopped.add(candidate);
      try {
        const tracks = typeof candidate.getTracks === 'function' ? candidate.getTracks() : [];
        tracks.forEach(track => { try { track.stop(); } catch (_) {} });
      } catch (_) {}
    }

    function clearEndListeners() {
      if (!removeEndListeners) return;
      try { removeEndListeners(); } catch (_) {}
      removeEndListeners = null;
    }

    function detach(candidate, reason) {
      if (typeof opts.onDetach === 'function') {
        try { opts.onDetach(candidate || null, reason); } catch (_) {}
      }
    }

    function retire(reason) {
      const why = typeof reason === 'string' && reason ? reason : 'stop';
      generation += 1;
      requesting = false;
      live = false;
      const retired = activeStream;
      activeStream = null;
      clearEndListeners();
      detach(retired, why);
      stopStream(retired);
      if (typeof opts.onRetire === 'function') {
        try { opts.onRetire(why, retired || null); } catch (_) {}
      }
      return generation;
    }

    function owns(candidate, ownerGeneration) {
      return live && candidate === activeStream && ownerGeneration === generation;
    }

    function bindEnd(candidate, ownerGeneration) {
      const removers = [];
      const end = reason => {
        if (candidate !== activeStream || ownerGeneration !== generation) return;
        retire(reason);
      };
      let tracks = [];
      try { tracks = typeof candidate.getTracks === 'function' ? candidate.getTracks() : []; } catch (_) {}
      tracks.forEach(track => {
        if (!track || typeof track.addEventListener !== 'function') return;
        const listener = () => end('ended');
        track.addEventListener('ended', listener);
        removers.push(() => {
          if (typeof track.removeEventListener === 'function') track.removeEventListener('ended', listener);
        });
      });
      if (typeof candidate.addEventListener === 'function') {
        const listener = () => end('inactive');
        candidate.addEventListener('inactive', listener);
        removers.push(() => {
          if (typeof candidate.removeEventListener === 'function') candidate.removeEventListener('inactive', listener);
        });
      }
      removeEndListeners = () => removers.forEach(remove => remove());
    }

    function snapshot() {
      return { stream: activeStream, generation, requesting, live };
    }

    async function start(constraints) {
      retire('restart');
      const requestGeneration = ++generation;
      requesting = true;
      let candidate = null;
      try {
        candidate = await opts.getUserMedia(constraints);
        const canActivate = typeof opts.canActivate !== 'function' || opts.canActivate();
        if (requestGeneration !== generation || !canActivate || !candidate || candidate.active === false) {
          stopStream(candidate);
          if (requestGeneration === generation) {
            generation += 1;
            requesting = false;
            live = false;
          }
          return null;
        }
        activeStream = candidate;
        bindEnd(candidate, requestGeneration);
        if (typeof opts.onAttach === 'function') await opts.onAttach(candidate, requestGeneration);
        const stillSelected = typeof opts.canActivate !== 'function' || opts.canActivate();
        if (requestGeneration !== generation || candidate !== activeStream || !stillSelected) {
          if (candidate === activeStream) {
            activeStream = null;
            clearEndListeners();
            detach(candidate, 'stale-play');
          }
          stopStream(candidate);
          if (requestGeneration === generation) {
            generation += 1;
            requesting = false;
            live = false;
          }
          return null;
        }
        requesting = false;
        live = true;
        if (typeof opts.onLive === 'function') opts.onLive(candidate, requestGeneration);
        return snapshot();
      } catch (error) {
        const current = requestGeneration === generation;
        if (candidate === activeStream) {
          activeStream = null;
          clearEndListeners();
          detach(candidate, 'start-error');
        }
        stopStream(candidate);
        if (current) {
          generation += 1;
          requesting = false;
          live = false;
          if (typeof opts.onError === 'function') {
            try { opts.onError(error); } catch (_) {}
          }
        }
        return null;
      }
    }

    return Object.freeze({
      start,
      retire,
      owns,
      snapshot,
      isRequesting: () => requesting
    });
  }

  return Object.freeze({
    GUIDE_CODES,
    GUIDE_HINTS,
    DEFAULT_CONFIG,
    CAPTURE_PROVENANCE_VERSION,
    computeViewBoxTransform,
    normalizedVideoPointToGuide,
    guidePointToNormalizedVideo,
    landmarkConfidence,
    computeConfidentBodyBounds,
    productionGatePassed,
    evaluateCameraAlignment,
    sanitizeCaptureProvenance,
    makeCaptureProvenance,
    createCameraLifecycle
  });
}));
