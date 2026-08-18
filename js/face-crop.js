/*
 * DOM-free square-crop geometry shared by the Face Calculator's on-device models.
 *
 * Browser:  globalThis.FaceCrop.computeSquareCropSpec(...)
 * CommonJS: require('./face-crop.js') (when loaded in a CommonJS context)
 *
 * This file specifies geometry only. Callers remain responsible for creating a canvas,
 * clearing it (so any intentional padding is transparent), and issuing drawImage with
 * the returned sourceRect and destRect.
 */
(function attachFaceCrop(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module && module.exports) module.exports = api;
  if (root) root.FaceCrop = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createFaceCropApi() {
  'use strict';

  const DEFAULTS = Object.freeze({
    scale: 1.4,
    verticalShift: -0.06,
    outputSize: 224,
  });

  function finitePositive(value, name) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`${name} must be a finite number greater than zero`);
    }
    return value;
  }

  function finite(value, name) {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
    return value;
  }

  function clamp(value, low, high) {
    return Math.min(high, Math.max(low, value));
  }

  function rect(x, y, width, height) {
    return { x, y, width, height, right: x + width, bottom: y + height };
  }

  function intersectionArea(a, b) {
    const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.x, b.x));
    const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y));
    return width * height;
  }

  /*
   * Place one axis of a conceptual square.
   *
   * If it fits, clamp its start to [0, extent-side], which preserves crop scale and
   * makes the eventual source rectangle wholly in-bounds. If it cannot fit, clamp to
   * [extent-side, 0], the complete set of placements that cover the entire image axis;
   * this makes every remaining padded pixel unavoidable at the requested scale.
   */
  function placeAxis(requestedStart, side, extent) {
    return side <= extent
      ? clamp(requestedStart, 0, extent - side)
      : clamp(requestedStart, extent - side, 0);
  }

  function landmarkBounds(landmarks, sourceWidth, sourceHeight) {
    if (!Array.isArray(landmarks) || landmarks.length === 0) {
      throw new TypeError('landmarks must be a non-empty array');
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (let index = 0; index < landmarks.length; index += 1) {
      const point = landmarks[index];
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        throw new TypeError(`landmarks[${index}] must contain finite normalized x/y values`);
      }
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }

    const bounds = rect(
      minX * sourceWidth,
      minY * sourceHeight,
      (maxX - minX) * sourceWidth,
      (maxY - minY) * sourceHeight,
    );
    if (!(bounds.width > 0) || !(bounds.height > 0)) {
      throw new RangeError('landmarks must span a positive width and height');
    }
    return bounds;
  }

  /**
   * Specify an aspect-preserving square crop around normalized face landmarks.
   *
   * @param {Array<{x:number,y:number}>} landmarks normalized MediaPipe-style points.
   *        Finite points outside [0,1] are accepted and reported as clipped; they are
   *        not silently clamped because doing so would move the inferred face centre.
   * @param {number} sourceWidth source image width in pixels.
   * @param {number} sourceHeight source image height in pixels.
   * @param {{scale?:number, verticalShift?:number, outputSize?:number}} options
   *        scale multiplies max(face width, face height); verticalShift is measured in
   *        face-height units (negative moves toward the forehead); outputSize is the
   *        square model input dimension.
   * @returns {object} JSON-safe crop geometry and diagnostics. sourceRect is always
   *          contained by the source image; destRect maps it into the output square.
   */
  function computeSquareCropSpec(landmarks, sourceWidth, sourceHeight, options) {
    const width = finitePositive(sourceWidth, 'sourceWidth');
    const height = finitePositive(sourceHeight, 'sourceHeight');
    const opts = options || {};
    const scale = finitePositive(opts.scale ?? DEFAULTS.scale, 'scale');
    const verticalShift = finite(opts.verticalShift ?? DEFAULTS.verticalShift, 'verticalShift');
    const outputSize = finitePositive(opts.outputSize ?? DEFAULTS.outputSize, 'outputSize');
    const faceBounds = landmarkBounds(landmarks, width, height);

    const side = Math.max(faceBounds.width, faceBounds.height) * scale;
    finitePositive(side, 'requested crop side');

    const desiredCenterX = faceBounds.x + faceBounds.width / 2;
    const desiredCenterY = faceBounds.y + faceBounds.height / 2 + verticalShift * faceBounds.height;
    const requestedRect = rect(desiredCenterX - side / 2, desiredCenterY - side / 2, side, side);

    const placedX = placeAxis(requestedRect.x, side, width);
    const placedY = placeAxis(requestedRect.y, side, height);
    const cropRect = rect(placedX, placedY, side, side);
    const requestedFits = side <= width && side <= height;

    // Intersect explicitly. A caller never has to pass an out-of-bounds source rectangle
    // to drawImage, including the unavoidable-padding case.
    const sourceX = Math.max(0, cropRect.x);
    const sourceY = Math.max(0, cropRect.y);
    const sourceRight = Math.min(width, cropRect.right);
    const sourceBottom = Math.min(height, cropRect.bottom);
    const sourceRect = rect(
      sourceX,
      sourceY,
      Math.max(0, sourceRight - sourceX),
      Math.max(0, sourceBottom - sourceY),
    );

    const outputScale = outputSize / side;
    const destRect = rect(
      (sourceRect.x - cropRect.x) * outputScale,
      (sourceRect.y - cropRect.y) * outputScale,
      sourceRect.width * outputScale,
      sourceRect.height * outputScale,
    );

    const paddingSource = {
      left: Math.max(0, -cropRect.x),
      top: Math.max(0, -cropRect.y),
      right: Math.max(0, cropRect.right - width),
      bottom: Math.max(0, cropRect.bottom - height),
    };
    const paddingOutput = {
      left: destRect.x,
      top: destRect.y,
      right: Math.max(0, outputSize - destRect.right),
      bottom: Math.max(0, outputSize - destRect.bottom),
    };
    const paddingAreaFraction = clamp(
      1 - (sourceRect.width * sourceRect.height) / (side * side),
      0,
      1,
    );

    const faceArea = faceBounds.width * faceBounds.height;
    const visibleAreaFraction = clamp(intersectionArea(faceBounds, sourceRect) / faceArea, 0, 1);
    const faceClippedSource = {
      left: Math.max(0, sourceRect.x - faceBounds.x),
      top: Math.max(0, sourceRect.y - faceBounds.y),
      right: Math.max(0, faceBounds.right - sourceRect.right),
      bottom: Math.max(0, faceBounds.bottom - sourceRect.bottom),
    };

    const shiftX = cropRect.x - requestedRect.x;
    const shiftY = cropRect.y - requestedRect.y;
    return {
      version: 1,
      sourceSize: { width, height },
      outputSize,
      scale,
      verticalShift,
      faceBounds,
      requestedRect,
      cropRect,
      sourceRect,
      destRect,
      requestedFits,
      shift: {
        x: shiftX,
        y: shiftY,
        xFraction: shiftX / side,
        yFraction: shiftY / side,
        distanceFraction: Math.hypot(shiftX, shiftY) / side,
      },
      padding: {
        sourcePixels: paddingSource,
        sourceFractions: {
          left: paddingSource.left / side,
          top: paddingSource.top / side,
          right: paddingSource.right / side,
          bottom: paddingSource.bottom / side,
        },
        outputPixels: paddingOutput,
        areaFraction: paddingAreaFraction,
      },
      face: {
        fullyVisible: visibleAreaFraction >= 1 - 1e-12,
        visibleAreaFraction,
        clippedAreaFraction: 1 - visibleAreaFraction,
        clippedSourcePixels: faceClippedSource,
        clippedFractions: {
          left: faceClippedSource.left / faceBounds.width,
          top: faceClippedSource.top / faceBounds.height,
          right: faceClippedSource.right / faceBounds.width,
          bottom: faceClippedSource.bottom / faceBounds.height,
        },
      },
    };
  }

  return Object.freeze({
    DEFAULTS,
    computeSquareCropSpec,
  });
});
