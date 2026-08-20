/*
 * Body Calculator persistence boundary.
 *
 * Browser:  globalThis.BodyState
 * CommonJS: module.exports
 *
 * This module is deliberately DOM-free. Values returned by these functions are new,
 * allowlisted records; callers must never merge the untrusted source object back in.
 */
(function attachBodyState(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module && module.exports) module.exports = api;
  if (root) root.BodyState = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function createBodyStateApi() {
  'use strict';

  const BODY_MODEL_SHA256 = '6a75d194ecd3be4651fe4b048c9256a70d82f10922869e240a36982667cbb1f2';
  const BODY_MODEL_PREPROCESSING_VERSION = 'pose-square-crop-1.15-imagenet-v1';
  const BODY_REFERENCE_VERSION = 'ref-raw-254-v1+geom-ref-raw-385-v1';
  const PIPELINE_VERSION = `body-production-2026-08-18|model:${BODY_MODEL_SHA256}|preprocess:${BODY_MODEL_PREPROCESSING_VERSION}|references:${BODY_REFERENCE_VERSION}`;
  const STATE_SCHEMA_VERSION = 1;
  const INPUTS_SCHEMA_VERSION = 1;
  const SHOT_SCHEMA_VERSION = 1;
  const SHOT_PROVENANCE_VERSION = 1;
  const CAPTURE_PROVENANCE_VERSION = 1;
  const IMAGE_ENVELOPE_SCHEMA_VERSION = 1;

  const KINDS = Object.freeze({
    STATE: 'body-state',
    INPUTS: 'body-inputs',
    SHOT: 'body-shot',
    SHOT_PROVENANCE: 'body-shot-provenance',
    IMAGE_ENVELOPE: 'body-image-envelope'
  });

  const MAX_SHOTS = 3;
  const MAX_OUTLINE_ISSUES = 12;
  const MAX_RELIABILITY_LENGTH = 1000;
  const MAX_REASON_LENGTH = 320;
  const MAX_ISSUE_LENGTH = 280;
  const MAX_FRAME_DIMENSION = 16384;
  const MAX_FRAME_PIXELS = 134217728;
  const MAX_SAVED_DIMENSION = 4096;
  const MAX_SAVED_PIXELS = 16777216;
  const MAX_SAVED_IMAGE_BYTES = 4 * 1024 * 1024;
  const MIN_TIMESTAMP = Date.UTC(2020, 0, 1);
  const MAX_FUTURE_SKEW_MS = 5 * 60 * 1000;
  const MAX_CAPTURE_TO_ANALYSIS_MS = 5 * 60 * 1000;

  const LIMITS = Object.freeze({
    MAX_SHOTS,
    MAX_OUTLINE_ISSUES,
    MAX_RELIABILITY_LENGTH,
    MAX_REASON_LENGTH,
    MAX_ISSUE_LENGTH,
    MAX_FRAME_DIMENSION,
    MAX_FRAME_PIXELS,
    MAX_SAVED_DIMENSION,
    MAX_SAVED_PIXELS,
    MAX_SAVED_IMAGE_BYTES,
    MIN_TIMESTAMP,
    MAX_FUTURE_SKEW_MS,
    MAX_CAPTURE_TO_ANALYSIS_MS,
    MODEL_RAW_MIN: 0,
    MODEL_RAW_MAX: 100,
    MODEL_VALUE_MIN: 0,
    MODEL_VALUE_MAX: 1,
    SCORE_MIN: 1,
    SCORE_MAX: 10,
    HEIGHT_CM_MIN: 130,
    HEIGHT_CM_MAX: 230,
    WEIGHT_KG_MIN: 35,
    WEIGHT_KG_MAX: 300,
    BODY_FAT_MIN: 1,
    BODY_FAT_MAX: 75,
    BMI_MIN: 13,
    BMI_MAX: 60
  });

  const METRIC_RANGES = Object.freeze({
    whtr: Object.freeze([0.01, 2]),
    whr: Object.freeze([0.1, 3]),
    vTaper: Object.freeze([0.1, 5]),
    shoulderHip: Object.freeze([0.1, 5]),
    legTorso: Object.freeze([0.1, 10]),
    symmetry: Object.freeze([0, 5])
  });

  const GUIDE_CODES = Object.freeze([
    'no_body',
    'move_closer',
    'move_back',
    'center_body',
    'align_feet',
    'stand_upright',
    'face_camera_square_on',
    'straighten_legs',
    'level_shoulders_hips',
    'arms_out',
    'ready'
  ]);
  const POSE_CODES = Object.freeze(['malformed', 'upright', 'partial', 'profile', 'standing', 'ok']);
  const CAPTURE_SOURCES = Object.freeze(['upload', 'drop', 'paste', 'url', 'camera']);
  const SEX_SOURCES = Object.freeze(['manual', 'model', 'guess', 'unknown', 'unconfirmed']);

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

  const PICKER_BODY_FAT = Object.freeze({
    m: Object.freeze([7.5, 11.5, 15.5, 20, 25, 31, 38]),
    f: Object.freeze([15.5, 19.5, 23.5, 28, 33.5, 40.5, 48])
  });

  function isRecord(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  function own(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
  }

  function finite(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  function bounded(value, low, high) {
    return finite(value) && value >= low && value <= high;
  }

  function nullableBounded(value, low, high) {
    return value == null ? null : (bounded(value, low, high) ? value : undefined);
  }

  function exactBoolean(value) {
    return value === true || value === false;
  }

  function allowed(value, list) {
    return list.indexOf(value) >= 0;
  }

  function nearlyEqual(a, b, epsilon) {
    return finite(a) && finite(b) && Math.abs(a - b) <= (epsilon == null ? 1e-9 : epsilon);
  }

  function resolveNow(now) {
    return finite(now) && now >= MIN_TIMESTAMP ? Math.floor(now) : Date.now();
  }

  function sanitizeTimestamp(value, now) {
    const ceiling = resolveNow(now) + MAX_FUTURE_SKEW_MS;
    return Number.isSafeInteger(value) && value >= MIN_TIMESTAMP && value <= ceiling ? value : null;
  }

  function hasBinding(value, kind, schemaVersion) {
    return isRecord(value)
      && value.kind === kind
      && value.schemaVersion === schemaVersion
      && value.pipelineVersion === PIPELINE_VERSION;
  }

  function binding(kind, schemaVersion) {
    return { kind, schemaVersion, pipelineVersion: PIPELINE_VERSION };
  }

  // Text reaches HTML-building code in body.html. Reject markup/control-bearing input rather
  // than truncating or trying to strip it into a different message.
  function sanitizePlainText(value, maxLength, allowEmpty) {
    if (typeof value !== 'string' || value.length > maxLength) return null;
    if (/[<>\u0000-\u001f\u007f]/.test(value)) return null;
    if (/&(?:lt|gt|#0*60|#0*62|#x0*3c|#x0*3e);/i.test(value)) return null;
    const clean = value.trim();
    if (!clean && !allowEmpty) return null;
    return clean;
  }

  function sanitizeTextList(value) {
    if (!Array.isArray(value) || value.length > MAX_OUTLINE_ISSUES) return null;
    const out = [];
    for (const item of value) {
      const clean = sanitizePlainText(item, MAX_ISSUE_LENGTH, false);
      if (clean == null) return null;
      out.push(clean);
    }
    return out;
  }

  function sanitizeRangedRecord(value, ranges, requireAny) {
    if (value == null && !requireAny) return null;
    if (!isRecord(value)) return null;
    const out = {};
    for (const key of Object.keys(ranges)) {
      if (!own(value, key)) continue;
      const range = ranges[key];
      if (!bounded(value[key], range[0], range[1])) return null;
      if (key === 'confidentLandmarks' && !Number.isInteger(value[key])) return null;
      out[key] = value[key];
    }
    return Object.keys(out).length || !requireAny ? out : null;
  }

  function sanitizeBodyMetrics(value) {
    return sanitizeRangedRecord(value, METRIC_RANGES, true);
  }

  function sanitizePair(value) {
    if (!Array.isArray(value) || value.length !== 2) return null;
    if (!value.every(item => bounded(item, -1, 1))) return null;
    return [value[0], value[1]];
  }

  function sanitizePoseQuality(value) {
    if (value == null) return null;
    if (!isRecord(value) || !exactBoolean(value.ok) || !allowed(value.code, POSE_CODES)) return null;
    const framing = value.framing == null ? null : (allowed(value.framing, ['full', 'torso']) ? value.framing : undefined);
    const band = value.band == null ? null : (allowed(value.band, ['pass', 'degraded']) ? value.band : undefined);
    if (framing === undefined || band === undefined) return null;
    if (value.ok) {
      if (value.code !== 'ok' || framing == null || band == null) return null;
    } else if (value.code === 'ok' || framing != null || band != null) return null;

    const metrics = value.metrics == null ? null : sanitizeRangedRecord(value.metrics, POSE_METRIC_RANGES, false);
    if (value.metrics != null && metrics == null) return null;
    if (value.metrics && own(value.metrics, 'thighVertical')) {
      const pair = sanitizePair(value.metrics.thighVertical);
      if (!pair) return null;
      metrics.thighVertical = pair;
    }
    if (value.metrics && own(value.metrics, 'shinVertical')) {
      const pair = sanitizePair(value.metrics.shinVertical);
      if (!pair) return null;
      metrics.shinVertical = pair;
    }
    return { ok: value.ok, code: value.code, framing, band, metrics };
  }

  // Compatible with BodyCameraGuide.makeCaptureProvenance. It contains no pixels or landmarks.
  function sanitizeCaptureProvenance(value, now) {
    if (!isRecord(value)
        || value.version !== CAPTURE_PROVENANCE_VERSION
        || value.source !== 'camera'
        || !allowed(value.trigger, ['manual', 'auto'])
        || !allowed(value.guideCode, GUIDE_CODES)
        || !exactBoolean(value.guidePassed)) return null;
    const guidePassed = value.guideCode === 'ready';
    if (value.guidePassed !== guidePassed) return null;

    const guideMetrics = value.guideMetrics == null
      ? null
      : sanitizeRangedRecord(value.guideMetrics, GUIDE_METRIC_RANGES, false);
    if (value.guideMetrics != null && guideMetrics == null) return null;
    const poseQuality = sanitizePoseQuality(value.poseQuality);
    if (value.poseQuality != null && poseQuality == null) return null;
    if (guidePassed && (!poseQuality || !poseQuality.ok || poseQuality.framing !== 'full' || poseQuality.band !== 'pass')) return null;
    if (value.guideCode === 'no_body' && (guideMetrics != null || poseQuality != null)) return null;

    if (!Number.isSafeInteger(value.frameWidth) || !Number.isSafeInteger(value.frameHeight)
        || value.frameWidth <= 0 || value.frameHeight <= 0
        || value.frameWidth > MAX_FRAME_DIMENSION || value.frameHeight > MAX_FRAME_DIMENSION
        || value.frameWidth * value.frameHeight > MAX_FRAME_PIXELS) return null;
    const timestamp = sanitizeTimestamp(value.timestamp, now);
    if (timestamp == null) return null;

    return {
      version: CAPTURE_PROVENANCE_VERSION,
      source: 'camera',
      trigger: value.trigger,
      guidePassed,
      guideCode: value.guideCode,
      guideMetrics,
      poseQuality,
      frameWidth: value.frameWidth,
      frameHeight: value.frameHeight,
      timestamp
    };
  }

  function sanitizeShotProvenance(value, now) {
    if (!isRecord(value)
        || value.kind !== KINDS.SHOT_PROVENANCE
        || value.version !== SHOT_PROVENANCE_VERSION
        || value.pipelineVersion !== PIPELINE_VERSION
        || !allowed(value.source, CAPTURE_SOURCES)
        || !allowed(value.route, ['model', 'geometry'])
        || !allowed(value.framing, ['full', 'torso'])
        || !allowed(value.framingBand, ['pass', 'degraded'])
        || !exactBoolean(value.framingOverride)
        || !exactBoolean(value.outlineOverride)
        || !exactBoolean(value.bareGeometry)) return null;

    const timestamp = sanitizeTimestamp(value.timestamp, now);
    if (timestamp == null) return null;
    if ((value.framingBand === 'degraded') !== value.framingOverride) return null;
    if (value.bareGeometry && value.route !== 'geometry') return null;

    const outlineIssues = sanitizeTextList(value.outlineIssues);
    if (!outlineIssues || value.outlineOverride !== (outlineIssues.length > 0)) return null;
    const skinFrac = nullableBounded(value.skinFrac, 0, 1);
    if (skinFrac === undefined) return null;

    let captureProvenance = null;
    if (value.source === 'camera') {
      captureProvenance = sanitizeCaptureProvenance(value.captureProvenance, now);
      if (!captureProvenance) return null;
      if (captureProvenance.timestamp > timestamp
          || timestamp - captureProvenance.timestamp > MAX_CAPTURE_TO_ANALYSIS_MS) return null;
    } else if (value.captureProvenance != null) return null;

    return {
      kind: KINDS.SHOT_PROVENANCE,
      version: SHOT_PROVENANCE_VERSION,
      pipelineVersion: PIPELINE_VERSION,
      source: value.source,
      route: value.route,
      framing: value.framing,
      framingBand: value.framingBand,
      framingOverride: value.framingOverride,
      outlineOverride: value.outlineOverride,
      outlineIssues,
      bareGeometry: value.bareGeometry,
      skinFrac,
      timestamp,
      captureProvenance
    };
  }

  function sanitizeBodyShot(value, now) {
    if (!isRecord(value)
        || value.kind !== KINDS.SHOT
        || value.version !== SHOT_SCHEMA_VERSION
        || value.pipelineVersion !== PIPELINE_VERSION
        || !allowed(value.route, ['model', 'geometry'])) return null;
    const provenance = sanitizeShotProvenance(value.provenance, now);
    if (!provenance || provenance.route !== value.route) return null;

    if (value.route === 'model') {
      if (!bounded(value.raw, LIMITS.MODEL_RAW_MIN, LIMITS.MODEL_RAW_MAX)) return null;
      if (value.metrics != null) return null;
      return {
        kind: KINDS.SHOT,
        version: SHOT_SCHEMA_VERSION,
        pipelineVersion: PIPELINE_VERSION,
        route: 'model',
        raw: value.raw,
        provenance
      };
    }

    if (value.raw != null) return null;
    const metrics = sanitizeBodyMetrics(value.metrics);
    if (!metrics) return null;
    return {
      kind: KINDS.SHOT,
      version: SHOT_SCHEMA_VERSION,
      pipelineVersion: PIPELINE_VERSION,
      route: 'geometry',
      metrics,
      provenance
    };
  }

  function sanitizeClassifierPair(value) {
    const sex = value.sexClsSex == null ? null : (allowed(value.sexClsSex, ['m', 'f']) ? value.sexClsSex : undefined);
    const conf = nullableBounded(value.sexClsConf, 0, 1);
    if (sex === undefined || conf === undefined || (sex == null) !== (conf == null)) return null;
    return { sex, conf };
  }

  function sanitizeSexState(value) {
    const sex = value.sex == null ? null : (allowed(value.sex, ['m', 'f']) ? value.sex : undefined);
    const source = allowed(value.sexSource, SEX_SOURCES) ? value.sexSource : null;
    const conf = nullableBounded(value.sexConf, 0, 1);
    if (sex === undefined || !source || conf === undefined
        || !exactBoolean(value.sexAuto) || !exactBoolean(value.sexManual)) return null;
    const classifier = sanitizeClassifierPair(value);
    if (!classifier) return null;
    const reason = sanitizePlainText(value.sexUnknownReason == null ? '' : value.sexUnknownReason, MAX_REASON_LENGTH, true);
    if (reason == null) return null;

    if (source === 'manual') {
      if (sex == null || !value.sexManual || value.sexAuto || conf != null || reason) return null;
    } else if (source === 'model') {
      if (sex == null || value.sexManual || !value.sexAuto || !bounded(conf, 0.75, 1)
          || classifier.sex !== sex || !nearlyEqual(classifier.conf, conf) || reason) return null;
    } else if (source === 'guess') {
      if (sex == null || value.sexManual || !value.sexAuto || conf != null
          || classifier.sex != null || reason) return null;
    } else if (source === 'unknown') {
      if (sex != null || value.sexManual || !value.sexAuto || conf != null || classifier.sex != null) return null;
    } else {
      if (sex != null || value.sexManual || !value.sexAuto || !bounded(conf, 0, 0.749999999)
          || classifier.sex == null || !nearlyEqual(classifier.conf, conf) || !reason) return null;
    }

    return {
      sex,
      sexAuto: value.sexAuto,
      sexSource: source,
      sexConf: conf,
      sexManual: value.sexManual,
      sexClsSex: classifier.sex,
      sexClsConf: classifier.conf,
      sexUnknownReason: reason
    };
  }

  function sameTextList(a, b) {
    return a.length === b.length && a.every((value, index) => value === b[index]);
  }

  function sanitizeBodyPersistedState(value, now) {
    if (!hasBinding(value, KINDS.STATE, STATE_SCHEMA_VERSION)) return null;
    const currentNow = resolveNow(now);
    const measuredAt = sanitizeTimestamp(value.measuredAt, currentNow);
    if (measuredAt == null) return null;
    const metrics = sanitizeBodyMetrics(value.metrics);
    if (!metrics || !Array.isArray(value.shots) || value.shots.length < 1 || value.shots.length > MAX_SHOTS) return null;
    const shots = [];
    for (const candidate of value.shots) {
      const shot = sanitizeBodyShot(candidate, currentNow);
      if (!shot) return null;
      shots.push(shot);
    }
    const latest = shots[shots.length - 1];
    if (latest.provenance.timestamp !== measuredAt) return null;

    const modelRaw = nullableBounded(value.modelRaw, LIMITS.MODEL_RAW_MIN, LIMITS.MODEL_RAW_MAX);
    const model = nullableBounded(value.model, LIMITS.MODEL_VALUE_MIN, LIMITS.MODEL_VALUE_MAX);
    const score = own(value, 'score') ? nullableBounded(value.score, LIMITS.SCORE_MIN, LIMITS.SCORE_MAX) : null;
    if (modelRaw === undefined || model === undefined || score === undefined) return null;
    if (latest.route === 'model') {
      if (modelRaw == null || model == null || !nearlyEqual(modelRaw, latest.raw)) return null;
    } else if (modelRaw != null || model != null) return null;

    const sexState = sanitizeSexState(value);
    if (!sexState) return null;
    if (!allowed(value.framing, ['full', 'torso'])
        || !exactBoolean(value.framingOverride)
        || !exactBoolean(value.outlineOverride)
        || !exactBoolean(value.bareGeometry)) return null;
    const outlineIssues = sanitizeTextList(value.outlineIssues);
    if (!outlineIssues || value.outlineOverride !== (outlineIssues.length > 0)) return null;
    const reliability = sanitizePlainText(value.reliability == null ? '' : value.reliability, MAX_RELIABILITY_LENGTH, true);
    const skinFrac = nullableBounded(value.skinFrac, 0, 1);
    if (reliability == null || skinFrac === undefined) return null;

    const provenance = latest.provenance;
    if (provenance.framing !== value.framing
        || provenance.framingOverride !== value.framingOverride
        || provenance.outlineOverride !== value.outlineOverride
        || !sameTextList(provenance.outlineIssues, outlineIssues)
        || provenance.bareGeometry !== value.bareGeometry
        || provenance.skinFrac !== skinFrac) return null;

    return Object.assign(binding(KINDS.STATE, STATE_SCHEMA_VERSION), {
      shots,
      metrics,
      model,
      modelRaw,
      score,
      sex: sexState.sex,
      sexAuto: sexState.sexAuto,
      sexSource: sexState.sexSource,
      sexConf: sexState.sexConf,
      sexManual: sexState.sexManual,
      sexClsSex: sexState.sexClsSex,
      sexClsConf: sexState.sexClsConf,
      sexUnknownReason: sexState.sexUnknownReason,
      reliability,
      framing: value.framing,
      framingOverride: value.framingOverride,
      outlineOverride: value.outlineOverride,
      outlineIssues,
      bareGeometry: value.bareGeometry,
      skinFrac,
      measuredAt
    });
  }

  function pickerValueAllowed(sex, value) {
    return !!sex && PICKER_BODY_FAT[sex].some(candidate => nearlyEqual(candidate, value));
  }

  function sanitizeBodyInputs(value, now) {
    if (!hasBinding(value, KINDS.INPUTS, INPUTS_SCHEMA_VERSION) || !exactBoolean(value.skipInputs)) return null;
    const timestamp = sanitizeTimestamp(value.ts, now);
    if (timestamp == null) return null;
    const heightCm = nullableBounded(value.heightCm, LIMITS.HEIGHT_CM_MIN, LIMITS.HEIGHT_CM_MAX);
    const weightKg = nullableBounded(value.weightKg, LIMITS.WEIGHT_KG_MIN, LIMITS.WEIGHT_KG_MAX);
    const bfPct = nullableBounded(value.bfPct, LIMITS.BODY_FAT_MIN, LIMITS.BODY_FAT_MAX);
    const sex = value.sex == null ? null : (allowed(value.sex, ['m', 'f']) ? value.sex : undefined);
    const bfSource = value.bfSource == null
      ? null
      : (allowed(value.bfSource, ['measured', 'picker']) ? value.bfSource : undefined);
    if (heightCm === undefined || weightKg === undefined || bfPct === undefined || sex === undefined || bfSource === undefined) return null;
    if ((bfPct == null) !== (bfSource == null)) return null;
    if (bfSource === 'picker' && !pickerValueAllowed(sex, bfPct)) return null;
    if (heightCm != null && weightKg != null) {
      const bmi = weightKg / ((heightCm / 100) ** 2);
      if (!bounded(bmi, LIMITS.BMI_MIN, LIMITS.BMI_MAX)) return null;
    }
    if (heightCm == null && weightKg == null && bfPct == null && sex == null && !value.skipInputs) return null;

    return Object.assign(binding(KINDS.INPUTS, INPUTS_SCHEMA_VERSION), {
      heightCm,
      weightKg,
      bfPct,
      bfSource,
      sex,
      skipInputs: value.skipInputs,
      ts: timestamp
    });
  }

  function sanitizeRasterDataURL(value) {
    if (typeof value !== 'string') return null;
    const prefix = /^data:image\/(jpeg|png|webp);base64,/i.exec(value);
    if (!prefix) return null;
    const payload = value.slice(prefix[0].length);
    const maxEncodedLength = Math.ceil(MAX_SAVED_IMAGE_BYTES / 3) * 4;
    if (!payload || payload.length > maxEncodedLength || payload.length % 4 !== 0) return null;
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(payload) || /=/.test(payload.slice(0, -2))) return null;
    const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0;
    const byteLength = payload.length / 4 * 3 - padding;
    if (!Number.isSafeInteger(byteLength) || byteLength <= 0 || byteLength > MAX_SAVED_IMAGE_BYTES) return null;
    const mimeType = `image/${prefix[1].toLowerCase()}`;
    return { dataURL: `${mimeType};base64,${payload}`.replace(/^/, 'data:'), mimeType, byteLength };
  }

  function sanitizeSavedImageEnvelope(value, now) {
    if (!hasBinding(value, KINDS.IMAGE_ENVELOPE, IMAGE_ENVELOPE_SCHEMA_VERSION)) return null;
    const image = sanitizeRasterDataURL(value.img);
    if (!image) return null;
    if (!Number.isSafeInteger(value.width) || !Number.isSafeInteger(value.height)
        || value.width <= 0 || value.height <= 0
        || value.width > MAX_SAVED_DIMENSION || value.height > MAX_SAVED_DIMENSION
        || value.width * value.height > MAX_SAVED_PIXELS) return null;
    const timestamp = sanitizeTimestamp(value.ts, now);
    const state = sanitizeBodyPersistedState(value.state, now);
    if (timestamp == null || !state || timestamp !== state.measuredAt) return null;
    return Object.assign(binding(KINDS.IMAGE_ENVELOPE, IMAGE_ENVELOPE_SCHEMA_VERSION), {
      img: image.dataURL,
      mimeType: image.mimeType,
      byteLength: image.byteLength,
      width: value.width,
      height: value.height,
      state,
      ts: timestamp
    });
  }

  return Object.freeze({
    BODY_MODEL_SHA256,
    BODY_MODEL_PREPROCESSING_VERSION,
    BODY_REFERENCE_VERSION,
    PIPELINE_VERSION,
    STATE_SCHEMA_VERSION,
    INPUTS_SCHEMA_VERSION,
    SHOT_SCHEMA_VERSION,
    SHOT_PROVENANCE_VERSION,
    CAPTURE_PROVENANCE_VERSION,
    IMAGE_ENVELOPE_SCHEMA_VERSION,
    KINDS,
    LIMITS,
    METRIC_RANGES,
    GUIDE_CODES,
    POSE_CODES,
    CAPTURE_SOURCES,
    SEX_SOURCES,
    GUIDE_METRIC_RANGES,
    POSE_METRIC_RANGES,
    PICKER_BODY_FAT,
    binding,
    sanitizeTimestamp,
    sanitizePlainText,
    sanitizeBodyMetrics,
    sanitizeCaptureProvenance,
    sanitizeShotProvenance,
    sanitizeBodyShot,
    sanitizeBodyPersistedState,
    sanitizeBodyInputs,
    sanitizeRasterDataURL,
    sanitizeSavedImageEnvelope
  });
}));
