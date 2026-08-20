/**
 * Frozen Body Calculator model identity and small DOM-free reliability helpers.
 * The production loader must validate the exact shipped bytes before ONNX Runtime
 * sees them; a versioned URL alone is not an integrity boundary.
 */

export const BODY_MODEL_ASSET = Object.freeze({
  url: 'models/body-beauty.onnx',
  byteLength: 44698594,
  sha256: '6a75d194ecd3be4651fe4b048c9256a70d82f10922869e240a36982667cbb1f2',
  cacheNamespace: 'le-body-models-v2'
});
export const BODY_MODEL_PREPROCESSING_VERSION = 'pose-square-crop-1.15-imagenet-v1';
export const BODY_REFERENCE_VERSION = 'ref-raw-254-v1+geom-ref-raw-385-v1';
export const BODY_PIPELINE_VERSION = `body-production-2026-08-18|model:${BODY_MODEL_ASSET.sha256}|preprocess:${BODY_MODEL_PREPROCESSING_VERSION}|references:${BODY_REFERENCE_VERSION}`;


export const BODY_MODEL_TIMEOUTS = Object.freeze({
  fetchMs: 60000,
  bytesMs: 30000,
  digestMs: 30000,
  cacheMs: 5000,
  initMs: 45000,
  inferenceMs: 30000
});
/** Describe the exact square source rectangle used by the production CNN crop.
 * Canvas pads source area outside the image with transparent black pixels. This
 * DOM-free calculation lets audits quantify that mechanism without changing it.
 */
export function describeSquareCrop(centerX, centerY, sidePx, imageWidth, imageHeight) {
  if (![centerX, centerY, sidePx, imageWidth, imageHeight].every(Number.isFinite)
      || sidePx <= 0 || imageWidth <= 0 || imageHeight <= 0) return null;
  const sourceX = centerX - sidePx / 2;
  const sourceY = centerY - sidePx / 2;
  const sourceRight = sourceX + sidePx;
  const sourceBottom = sourceY + sidePx;
  const insideWidth = Math.max(0, Math.min(imageWidth, sourceRight) - Math.max(0, sourceX));
  const insideHeight = Math.max(0, Math.min(imageHeight, sourceBottom) - Math.max(0, sourceY));
  let inBoundsFraction = (insideWidth * insideHeight) / (sidePx * sidePx);
  if (inBoundsFraction > 1 - 1e-12) inBoundsFraction = 1;
  inBoundsFraction = Math.max(0, Math.min(1, inBoundsFraction));
  const paddingFraction = 1 - inBoundsFraction;
  return Object.freeze({
    sourceX,
    sourceY,
    sidePx,
    inBoundsFraction,
    paddingFraction,
    outOfBounds: paddingFraction > 0
  });
}


export function modelCacheName(asset = BODY_MODEL_ASSET) {
  return `${asset.cacheNamespace}-${asset.sha256.slice(0, 16)}`;
}

export function modelCacheKey(url, baseUrl, asset = BODY_MODEL_ASSET) {
  const resolved = new URL(url, baseUrl);
  resolved.searchParams.set('body-model-sha256', asset.sha256);
  return resolved.href;
}

function asBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  return null;
}

export async function sha256Hex(value, subtle = globalThis.crypto && globalThis.crypto.subtle) {
  const bytes = asBytes(value);
  if (!bytes) throw new TypeError('Body model bytes must be an ArrayBuffer or typed-array view.');
  if (!subtle || typeof subtle.digest !== 'function') throw new Error('Web Crypto SHA-256 is unavailable.');
  const digest = new Uint8Array(await subtle.digest('SHA-256', bytes));
  return Array.from(digest, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function validateModelBytes(value, options = {}) {
  const asset = options.asset || BODY_MODEL_ASSET;
  const bytes = asBytes(value);
  if (!bytes || bytes.byteLength !== asset.byteLength) {
    const actual = bytes ? bytes.byteLength : 'non-binary';
    throw new Error(`Body model byte length mismatch (expected ${asset.byteLength}, got ${actual}).`);
  }
  const hash = await sha256Hex(bytes, options.subtle);
  if (hash !== asset.sha256) throw new Error(`Body model SHA-256 mismatch (got ${hash}).`);
  return bytes;
}

export function withTimeout(operation, timeoutMs, label = 'operation', onTimeout) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return Promise.reject(new TypeError('timeoutMs must be positive and finite.'));
  let timer = null;
  const work = Promise.resolve().then(() => typeof operation === 'function' ? operation() : operation);
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      try { if (typeof onTimeout === 'function') onTimeout(); } catch (_) {}
      reject(new Error(`${label} timed out after ${timeoutMs} ms.`));
    }, timeoutMs);
  });
  return Promise.race([work, timeout]).finally(() => { if (timer != null) clearTimeout(timer); });
}
export function createGenerationLease() {
  let activeGeneration = null;

  function validateGeneration(generation) {
    if (!Number.isSafeInteger(generation) || generation < 0) throw new TypeError('generation must be a non-negative safe integer.');
  }

  return Object.freeze({
    claim(generation) {
      validateGeneration(generation);
      activeGeneration = generation;
      return generation;
    },
    owns(generation) {
      return activeGeneration === generation;
    },
    release(generation) {
      if (activeGeneration !== generation) return false;
      activeGeneration = null;
      return true;
    },
    activeGeneration() {
      return activeGeneration;
    }
  });
}


/** One retry for native pose/segmentation failures, with explicit exhausted outcomes. */
export function createPoseRetryController() {
  let retryCountValue = 0;
  let settled = false;
  const settle = action => { settled = true; return action; };

  return Object.freeze({
    workerFailure() {
      if (settled) return 'settled';
      if (retryCountValue === 0) { retryCountValue = 1; return 'retry'; }
      return settle('refuse');
    },
    silhouetteFailure(transient) {
      if (settled) return 'settled';
      if (!transient) return settle('degraded');
      if (retryCountValue === 0) { retryCountValue = 1; return 'retry'; }
      return settle('degraded');
    },
    success() {
      if (settled) return 'settled';
      return settle('commit');
    },
    retryCount() {
      return retryCountValue;
    },
    isSettled() {
      return settled;
    }
  });
}

export function routePlan({ modelState, hasSession, bareBody, framing, cropReady }) {
  const modelEligible = (!!hasSession || modelState === 'loading') && !bareBody && framing === 'full';
  const attemptedRoute = modelEligible ? 'model' : 'geometry';
  const modelScheduled = modelEligible && !!cropReady;
  return Object.freeze({
    attemptedRoute,
    initialRoute: modelScheduled ? 'model' : 'geometry',
    modelScheduled
  });
}

export function shotSetFacts(shots) {
  const list = Array.isArray(shots) ? shots.filter(Boolean) : [];
  let hasModel = false;
  let hasGeometry = false;
  let anyBare = false;
  let anyTorso = false;
  let anyFramingOverride = false;
  let anyOutlineOverride = false;
  for (const shot of list) {
    hasModel = hasModel || shot.route === 'model';
    hasGeometry = hasGeometry || shot.route === 'geometry';
    const provenance = shot.provenance;
    if (!provenance || typeof provenance !== 'object') continue;
    anyBare = anyBare || provenance.bareGeometry === true;
    anyTorso = anyTorso || provenance.framing === 'torso';
    anyFramingOverride = anyFramingOverride || provenance.framingOverride === true;
    anyOutlineOverride = anyOutlineOverride || provenance.outlineOverride === true;
  }
  return Object.freeze({
    count: list.length,
    hasModel,
    hasGeometry,
    mixedRoutes: hasModel && hasGeometry,
    onlyModel: hasModel && !hasGeometry,
    anyBare,
    anyTorso,
    anyFramingOverride,
    anyOutlineOverride
  });
}
