/**
 * Deterministic rendered coverage audit for the Face Calculator camera guide.
 *
 * This harness loads the production face.html/CSS/guide module, but it never opens a
 * camera and never submits or stores an image. It injects only a synthetic CSS video
 * surface and landmark coordinates, then checks the rendered guide at the requested
 * viewport, width-mode, feed-ratio, and alignment-state matrix.
 */
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const moduleRoot = process.env.CODEX_NODE_MODULES;
if (!moduleRoot) {
  throw new Error('CODEX_NODE_MODULES must point to the bundled node_modules directory.');
}
const { chromium } = require(path.join(moduleRoot, 'playwright'));

const root = path.resolve(import.meta.dirname, '..');
const jsonPath = path.join(root, 'data', 'face-camera-coverage.json');
const reportPath = path.join(root, 'md', 'face-camera-coverage.md');
const screenshotDir = path.join(root, 'artifacts', 'face-camera-coverage');

const viewports = Object.freeze([
  { name: 'mobile-portrait-390x844', width: 390, height: 844, class: 'mobile portrait' },
  { name: 'tablet-820x1180', width: 820, height: 1180, class: 'tablet' },
  { name: 'desktop-1366x768', width: 1366, height: 768, class: 'standard desktop 16:9' },
  { name: 'desktop-1920x1080', width: 1920, height: 1080, class: '1080p 16:9' },
  { name: 'desktop-2560x1440', width: 2560, height: 1440, class: '1440p 16:9' },
  { name: 'desktop-1920x1200', width: 1920, height: 1200, class: 'desktop 16:10' },
  { name: 'desktop-3840x2160', width: 3840, height: 2160, class: '4K 16:9' },
]);
const modes = Object.freeze(['original', 'wide']);
const feeds = Object.freeze([
  {
    name: 'portrait', width: 1080, height: 1920,
    expectedTransform: { scale: 10.8, offsetX: 0, offsetY: 420, renderedWidth: 1080, renderedHeight: 1080 },
  },
  {
    name: '4x3', width: 1440, height: 1080,
    expectedTransform: { scale: 10.8, offsetX: 180, offsetY: 0, renderedWidth: 1080, renderedHeight: 1080 },
  },
  {
    name: '16x9', width: 1920, height: 1080,
    expectedTransform: { scale: 10.8, offsetX: 420, offsetY: 0, renderedWidth: 1080, renderedHeight: 1080 },
  },
]);
const alignmentCodes = Object.freeze([
  'no_face',
  'move_closer',
  'move_back',
  'center_face',
  'align_eyes',
  'level_head',
  'face_camera_square_on',
  'ready',
]);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
  ['.onnx', 'application/octet-stream'],
]);

function nearlyEqual(a, b, tolerance = 1e-6) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
}

function round(value, digits = 3) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function safeName(value) {
  return value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
}

function markdownCell(value) {
  return String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');
}

async function startStaticServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://127.0.0.1');
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'face.html';
      const filePath = path.resolve(root, relative);
      if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      const bytes = await fs.readFile(filePath);
      response.writeHead(200, {
        'Content-Type': mimeTypes.get(path.extname(filePath).toLowerCase()) || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      response.end(bytes);
    } catch (error) {
      response.writeHead(error?.code === 'ENOENT' ? 404 : 500).end('Not found');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  return {
    server,
    baseUrl: `http://127.0.0.1:${address.port}`,
  };
}

async function stubExternalRuntime(page) {
  await page.route('https://**/*', async (route) => {
    const url = route.request().url();
    if (url.includes('vision_bundle.mjs')) {
      await route.fulfill({
        status: 200,
        contentType: 'text/javascript; charset=utf-8',
        body: [
          'export const FilesetResolver={forVisionTasks:async()=>({})};',
          'export const FaceLandmarker={createFromOptions:async()=>({detect:()=>({faceLandmarks:[]}),close(){}})};',
          'export class DrawingUtils{};',
        ].join('\n'),
      });
      return;
    }
    if (url.includes('ort.min.js')) {
      await route.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body: 'window.ort=undefined;' });
      return;
    }
    if (url.endsWith('.css') || url.includes('tabler-icons')) {
      await route.fulfill({ status: 200, contentType: 'text/css; charset=utf-8', body: '' });
      return;
    }
    await route.fulfill({ status: 204, body: '' });
  });
}

function staticPageAudit() {
  const api = window.FaceCameraGuide;
  const stage = document.getElementById('lc-stage');
  const video = document.getElementById('lc-video');
  const canvas = document.getElementById('lc-canvas');
  const guide = document.getElementById('lc-guide');
  const tip = guide.querySelector('.lc-guide-tip');
  const shutter = document.getElementById('lc-shutter');
  const uploadPanel = document.querySelector('[data-panel="upload"]');
  const cameraPanel = document.querySelector('[data-panel="camera"]');
  const srcTabs = [...document.querySelectorAll('.lc-src')];
  if (!api || !stage || !video || !guide || !tip || !shutter) throw new Error('Camera audit DOM/module unavailable.');

  uploadPanel.hidden = true;
  cameraPanel.hidden = false;
  for (const tab of srcTabs) tab.classList.toggle('active', tab.dataset.src === 'camera');
  stage.classList.add('show');
  canvas.hidden = true;
  video.hidden = false;
  guide.hidden = false;
  shutter.hidden = false;
  video.style.backgroundColor = '#2c2622';
  video.style.backgroundImage = 'linear-gradient(90deg, #344d61 0 50%, #5e3f4b 50% 100%)';
  video.style.objectFit = 'cover';
  video.setAttribute('aria-label', 'Synthetic audit feed; no camera opened');
  return true;
}

function renderAlignmentCase({ feed, requestedCode }) {
  const api = window.FaceCameraGuide;
  const guide = document.getElementById('lc-guide');
  const tip = guide.querySelector('.lc-guide-tip');
  const video = document.getElementById('lc-video');
  video.width = feed.width;
  video.height = feed.height;
  video.style.aspectRatio = `${feed.width} / ${feed.height}`;
  video.style.height = 'auto';

  const transform = api.computeViewBoxTransform(feed.width, feed.height);
  const landmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  const required = [10, 33, 133, 152, 234, 263, 362, 454];
  const set = (index, x, y, mirrored = true) => {
    landmarks[index] = api.guidePointToNormalizedVideo({ x, y }, transform, mirrored);
  };
  const base = new Map([
    [234, [30, 46]], [454, [70, 46]], [10, [50, 19]], [152, [50, 73]],
    [33, [36, 40]], [133, [44, 40]], [362, [56, 40]], [263, [64, 40]],
  ]);
  for (const [index, point] of base) set(index, point[0], point[1]);
  let pose = { yawDeg: 0, pitchDeg: 1, poseSkew: 0 };

  const setScale = (scale) => {
    set(234, 50 - 20 * scale, 46);
    set(454, 50 + 20 * scale, 46);
    set(10, 50, 46 - 27 * scale);
    set(152, 50, 46 + 27 * scale);
  };
  const shift = (indices, dx, dy) => {
    for (const index of indices) {
      const point = api.normalizedVideoPointToGuide(landmarks[index], transform, true);
      set(index, point.x + dx, point.y + dy);
    }
  };
  if (requestedCode === 'move_closer') setScale(0.6);
  if (requestedCode === 'move_back') setScale(1.2);
  if (requestedCode === 'center_face') shift(required, 6, 0);
  if (requestedCode === 'align_eyes') shift([33, 133, 263, 362], 0, 5);
  if (requestedCode === 'level_head') {
    const rise = Math.tan(10 * Math.PI / 180) * 10;
    set(33, 36, 40 - rise); set(133, 44, 40 - rise);
    set(362, 56, 40 + rise); set(263, 64, 40 + rise);
  }
  if (requestedCode === 'face_camera_square_on') pose = { yawDeg: 13, pitchDeg: 1, poseSkew: 0 };

  const alignment = requestedCode === 'no_face'
    ? api.evaluateCameraAlignment(null, feed.width, feed.height, pose, { mirrored: true })
    : api.evaluateCameraAlignment(landmarks, feed.width, feed.height, pose, { mirrored: true });
  tip.textContent = alignment.hint;
  guide.dataset.alignment = alignment.code;
  guide.classList.toggle('is-ready', alignment.ready);
  window.__lcLastCameraAlignment = alignment;
  return {
    requestedCode,
    classifiedCode: alignment.code,
    hint: alignment.hint,
    ready: alignment.ready,
    metrics: alignment.metrics,
  };
}

function parseColor(value) {
  const match = String(value).match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const values = match[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
  if (values.length < 3 || values.slice(0, 3).some((item) => !Number.isFinite(item))) return null;
  return { r: values[0], g: values[1], b: values[2], a: Number.isFinite(values[3]) ? values[3] : 1 };
}

function composite(foreground, background) {
  const alpha = foreground.a ?? 1;
  return {
    r: foreground.r * alpha + background.r * (1 - alpha),
    g: foreground.g * alpha + background.g * (1 - alpha),
    b: foreground.b * alpha + background.b * (1 - alpha),
    a: 1,
  };
}

function luminance(color) {
  const channel = (value) => {
    const normalized = value / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

function contrast(foreground, background) {
  const lighter = Math.max(luminance(foreground), luminance(background));
  const darker = Math.min(luminance(foreground), luminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

function rectSnapshot(rect) {
  return {
    x: Math.round(rect.x * 1000) / 1000,
    y: Math.round(rect.y * 1000) / 1000,
    width: Math.round(rect.width * 1000) / 1000,
    height: Math.round(rect.height * 1000) / 1000,
    top: Math.round(rect.top * 1000) / 1000,
    right: Math.round(rect.right * 1000) / 1000,
    bottom: Math.round(rect.bottom * 1000) / 1000,
    left: Math.round(rect.left * 1000) / 1000,
  };
}

function measureRenderedState(expectedCode) {
  const parseColor = (value) => {
    const match = String(value).match(/rgba?\(([^)]+)\)/i);
    if (!match) return null;
    const values = match[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    if (values.length < 3 || values.slice(0, 3).some((item) => !Number.isFinite(item))) return null;
    return { r: values[0], g: values[1], b: values[2], a: Number.isFinite(values[3]) ? values[3] : 1 };
  };
  const composite = (foreground, background) => {
    const alpha = foreground.a ?? 1;
    return {
      r: foreground.r * alpha + background.r * (1 - alpha),
      g: foreground.g * alpha + background.g * (1 - alpha),
      b: foreground.b * alpha + background.b * (1 - alpha),
      a: 1,
    };
  };
  const luminance = (color) => {
    const channel = (value) => {
      const normalized = value / 255;
      return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  };
  const contrast = (foreground, background) => {
    const lighter = Math.max(luminance(foreground), luminance(background));
    const darker = Math.min(luminance(foreground), luminance(background));
    return (lighter + 0.05) / (darker + 0.05);
  };
  const rectSnapshot = (rect) => ({
    x: Math.round(rect.x * 1000) / 1000,
    y: Math.round(rect.y * 1000) / 1000,
    width: Math.round(rect.width * 1000) / 1000,
    height: Math.round(rect.height * 1000) / 1000,
    top: Math.round(rect.top * 1000) / 1000,
    right: Math.round(rect.right * 1000) / 1000,
    bottom: Math.round(rect.bottom * 1000) / 1000,
    left: Math.round(rect.left * 1000) / 1000,
  });
  const round = (value, digits = 3) => {
    const factor = 10 ** digits;
    return Number.isFinite(value) ? Math.round(value * factor) / factor : null;
  };
  const stage = document.getElementById('lc-stage');
  const video = document.getElementById('lc-video');
  const guide = document.getElementById('lc-guide');
  const svg = guide.querySelector('svg');
  const ellipse = guide.querySelector('.g-shape');
  const bar = guide.querySelector('.g-bar');
  const tip = guide.querySelector('.lc-guide-tip');
  const shutter = document.getElementById('lc-shutter');
  const content = document.querySelector('.content');
  const stageRect = stage.getBoundingClientRect();
  const videoRect = video.getBoundingClientRect();
  const guideRect = guide.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();
  const tipRect = tip.getBoundingClientRect();
  const shutterRect = shutter.getBoundingClientRect();
  const tipStyle = getComputedStyle(tip);
  const ellipseStyle = getComputedStyle(ellipse);
  const barStyle = getComputedStyle(bar);
  const transitionDurations = [ellipseStyle, barStyle, tipStyle].flatMap((style) => style.transitionDuration.split(','));
  const videoStyle = getComputedStyle(video);
  const fontSize = parseFloat(tipStyle.fontSize);
  const lineHeight = parseFloat(tipStyle.lineHeight);
  const foreground = parseColor(tipStyle.color);
  const overlay = parseColor(tipStyle.backgroundColor);
  const stageBackground = parseColor(getComputedStyle(stage).backgroundColor) || { r: 44, g: 38, b: 34, a: 1 };
  const blended = foreground && overlay ? composite(overlay, stageBackground) : null;
  const contrastRatio = foreground && blended ? contrast(foreground, blended) : null;
  const overlap = Math.max(0, Math.min(tipRect.bottom, shutterRect.bottom) - Math.max(tipRect.top, shutterRect.top));
  const gap = shutterRect.top - tipRect.bottom;
  const viewportWidth = document.documentElement.clientWidth;
  const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - viewportWidth;
  const expectedReady = expectedCode === 'ready';
  const classified = window.__lcLastCameraAlignment;
  const hintLines = lineHeight > 0 ? Math.max(1, Math.round(tipRect.height / lineHeight)) : null;
  const estimatedCharsPerLine = hintLines ? tip.textContent.length / hintLines : null;
  const within = (inner, outer, tolerance = 1) => inner.left >= outer.left - tolerance
    && inner.right <= outer.right + tolerance && inner.top >= outer.top - tolerance
    && inner.bottom <= outer.bottom + tolerance;
  const sameRect = (a, b, tolerance = 1) => Math.abs(a.left - b.left) <= tolerance
    && Math.abs(a.right - b.right) <= tolerance && Math.abs(a.top - b.top) <= tolerance
    && Math.abs(a.bottom - b.bottom) <= tolerance;
  const mirrorMatrix = videoStyle.transform;
  const mirrored = /^matrix\(-1(?:\.0+)?,\s*0(?:\.0+)?,\s*0(?:\.0+)?,\s*1(?:\.0+)?,/.test(mirrorMatrix);
  const greenReadyStroke = /85,\s*230,\s*165/.test(ellipseStyle.stroke);
  const greenReadyBackground = /15,\s*110,\s*86/.test(tipStyle.backgroundColor);
  const checks = {
    exactClassification: classified?.code === expectedCode,
    exactHint: classified?.hint === window.FaceCameraGuide.ALIGNMENT_HINTS[expectedCode]
      && tip.textContent === window.FaceCameraGuide.ALIGNMENT_HINTS[expectedCode],
    readyClass: guide.classList.contains('is-ready') === expectedReady,
    readyStyling: expectedReady ? greenReadyStroke && greenReadyBackground : !greenReadyStroke && !greenReadyBackground,
    noHorizontalOverflow: overflow <= 1,
    stageInsideViewport: stageRect.left >= -1 && stageRect.right <= viewportWidth + 1,
    videoMatchesStage: sameRect(videoRect, stageRect),
    guideMatchesStage: sameRect(guideRect, stageRect) && sameRect(svgRect, stageRect),
    hintInsideStage: within(tipRect, stageRect),
    shutterInsideStage: within(shutterRect, stageRect),
    hintShutterSeparated: overlap <= 0.5 && gap >= 6,
    hintNotClipped: tip.scrollWidth <= tip.clientWidth + 1 && tip.scrollHeight <= tip.clientHeight + 1,
    readableType: fontSize >= 12 && lineHeight >= fontSize * 1.3,
    readableLineLength: estimatedCharsPerLine != null && estimatedCharsPerLine <= 70,
    readableContrast: contrastRatio != null && contrastRatio >= 4.5,
    shutterTarget: shutterRect.width >= 44 && shutterRect.height >= 44,
    actualPreviewMirrored: mirrored,
    accessibleStatus: guide.getAttribute('role') === 'status'
      && guide.getAttribute('aria-live') === 'polite'
      && guide.getAttribute('aria-atomic') === 'true'
      && svg.getAttribute('aria-hidden') === 'true'
      && shutter.getAttribute('aria-label') === 'Capture photo',
    reducedMotionNoTransitions: transitionDurations.every((duration) => Number.parseFloat(duration) === 0),
  };
  return {
    widthMode: document.documentElement.dataset.contentWidth,
    viewportWidth,
    rootScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    overflow: round(overflow),
    contentWidth: round(content?.getBoundingClientRect().width),
    stage: rectSnapshot(stageRect),
    video: rectSnapshot(videoRect),
    guide: rectSnapshot(guideRect),
    tip: rectSnapshot(tipRect),
    shutter: rectSnapshot(shutterRect),
    hintShutterGapPx: round(gap),
    hintShutterOverlapPx: round(overlap),
    hintLines,
    estimatedCharsPerLine: round(estimatedCharsPerLine),
    hintFontSizePx: round(fontSize),
    hintLineHeightPx: round(lineHeight),
    hintContrastRatio: round(contrastRatio),
    ellipseStroke: ellipseStyle.stroke,
    ellipseDashArray: ellipseStyle.strokeDasharray,
    eyeBarStroke: barStyle.stroke,
    hintColor: tipStyle.color,
    hintBackground: tipStyle.backgroundColor,
    videoTransform: mirrorMatrix,
    transitionDurations,
    checks,
    pass: Object.values(checks).every(Boolean),
  };
}

function measureMapping(feed) {
  const nearlyEqual = (a, b, tolerance = 1e-6) => Number.isFinite(a)
    && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
  const round = (value, digits = 3) => {
    const factor = 10 ** digits;
    return Number.isFinite(value) ? Math.round(value * factor) / factor : null;
  };
  const rectSnapshot = (rect) => ({
    x: Math.round(rect.x * 1000) / 1000,
    y: Math.round(rect.y * 1000) / 1000,
    width: Math.round(rect.width * 1000) / 1000,
    height: Math.round(rect.height * 1000) / 1000,
    top: Math.round(rect.top * 1000) / 1000,
    right: Math.round(rect.right * 1000) / 1000,
    bottom: Math.round(rect.bottom * 1000) / 1000,
    left: Math.round(rect.left * 1000) / 1000,
  });
  const api = window.FaceCameraGuide;
  const stage = document.getElementById('lc-stage');
  const video = document.getElementById('lc-video');
  const guide = document.getElementById('lc-guide');
  const svg = guide.querySelector('svg');
  const ellipse = guide.querySelector('.g-shape');
  const bar = guide.querySelector('.g-bar');
  const tip = guide.querySelector('.lc-guide-tip');
  const shutter = document.getElementById('lc-shutter');
  const stageRect = stage.getBoundingClientRect();
  const videoRect = video.getBoundingClientRect();
  const guideRect = guide.getBoundingClientRect();
  const svgRect = svg.getBoundingClientRect();
  const ellipseRect = ellipse.getBoundingClientRect();
  const barRect = bar.getBoundingClientRect();
  const tipRect = tip.getBoundingClientRect();
  const shutterRect = shutter.getBoundingClientRect();
  const nominal = api.computeViewBoxTransform(feed.width, feed.height);
  const rendered = api.computeViewBoxTransform(stageRect.width, stageRect.height);
  const expectedEllipse = {
    left: stageRect.left + rendered.offsetX + (50 - 20) * rendered.scale,
    right: stageRect.left + rendered.offsetX + (50 + 20) * rendered.scale,
    top: stageRect.top + rendered.offsetY + (46 - 27) * rendered.scale,
    bottom: stageRect.top + rendered.offsetY + (46 + 27) * rendered.scale,
  };
  const expectedBar = {
    left: stageRect.left + rendered.offsetX + 33 * rendered.scale,
    right: stageRect.left + rendered.offsetX + 67 * rendered.scale,
    y: stageRect.top + rendered.offsetY + 40 * rendered.scale,
  };
  const mappingErrors = [
    Math.abs(ellipseRect.left - expectedEllipse.left),
    Math.abs(ellipseRect.right - expectedEllipse.right),
    Math.abs(ellipseRect.top - expectedEllipse.top),
    Math.abs(ellipseRect.bottom - expectedEllipse.bottom),
    Math.abs(barRect.left - expectedBar.left),
    Math.abs(barRect.right - expectedBar.right),
    Math.abs((barRect.top + barRect.bottom) / 2 - expectedBar.y),
  ];
  const maxMappingErrorPx = Math.max(...mappingErrors);
  const baseRaw = new Map([
    [234, [36, 46]], [454, [76, 46]], [10, [56, 19]], [152, [56, 73]],
    [33, [42, 40]], [133, [50, 40]], [362, [62, 40]], [263, [70, 40]],
  ]);
  const shiftedRawLandmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
  for (const [index, point] of baseRaw) {
    shiftedRawLandmarks[index] = api.guidePointToNormalizedVideo({ x: point[0], y: point[1] }, nominal, false);
  }
  const pose = { yawDeg: 0, pitchDeg: 1, poseSkew: 0 };
  const mirroredResult = api.evaluateCameraAlignment(shiftedRawLandmarks, feed.width, feed.height, pose, { mirrored: true });
  const unmirroredResult = api.evaluateCameraAlignment(shiftedRawLandmarks, feed.width, feed.height, pose, { mirrored: false });
  const samplePoint = { x: 0.31, y: 0.62 };
  const mappedPoint = api.normalizedVideoPointToGuide(samplePoint, nominal, true);
  const roundTrip = api.guidePointToNormalizedVideo(mappedPoint, nominal, true);
  const sameRect = (a, b, tolerance = 1) => Math.abs(a.left - b.left) <= tolerance
    && Math.abs(a.right - b.right) <= tolerance && Math.abs(a.top - b.top) <= tolerance
    && Math.abs(a.bottom - b.bottom) <= tolerance;
  const hintEyeBarClearancePx = tipRect.top >= barRect.bottom
    ? tipRect.top - barRect.bottom
    : (barRect.top >= tipRect.bottom
      ? barRect.top - tipRect.bottom
      : -Math.min(tipRect.bottom - barRect.top, barRect.bottom - tipRect.top));
  const ellipseCenterX = (ellipseRect.left + ellipseRect.right) / 2;
  const ellipseCenterY = (ellipseRect.top + ellipseRect.bottom) / 2;
  const ellipseRadiusX = ellipseRect.width / 2;
  const ellipseRadiusY = ellipseRect.height / 2;
  const shutterCenterX = (shutterRect.left + shutterRect.right) / 2;
  const shutterCenterY = (shutterRect.top + shutterRect.bottom) / 2;
  const shutterRadius = Math.max(shutterRect.width, shutterRect.height) / 2;
  let minimumCenterToOvalPx = Infinity;
  for (let index = 0; index < 1440; index += 1) {
    const angle = index * Math.PI * 2 / 1440;
    const dx = ellipseCenterX + ellipseRadiusX * Math.cos(angle) - shutterCenterX;
    const dy = ellipseCenterY + ellipseRadiusY * Math.sin(angle) - shutterCenterY;
    minimumCenterToOvalPx = Math.min(minimumCenterToOvalPx, Math.hypot(dx, dy));
  }
  const shutterCenterNorm = ((shutterCenterX - ellipseCenterX) / ellipseRadiusX) ** 2
    + ((shutterCenterY - ellipseCenterY) / ellipseRadiusY) ** 2;
  const shutterOvalClearancePx = minimumCenterToOvalPx - shutterRadius;
  const shutterOutsideOval = shutterCenterNorm > 1;
  const nominalMatchesExpected = ['scale', 'offsetX', 'offsetY', 'renderedWidth', 'renderedHeight']
    .every((key) => nearlyEqual(nominal[key], feed.expectedTransform[key], 1e-9));
  const checks = {
    nominalTransformExact: nominalMatchesExpected,
    renderedAspectMatchesFeed: Math.abs(stageRect.width / stageRect.height - feed.width / feed.height) <= 0.005,
    videoMatchesStage: sameRect(videoRect, stageRect),
    guideMatchesStage: sameRect(guideRect, stageRect) && sameRect(svgRect, stageRect),
    svgGeometryMatchesTransform: maxMappingErrorPx <= 1,
    hintClearOfEyeBar: hintEyeBarClearancePx >= 4,
    shutterClearOfOval: shutterOutsideOval && shutterOvalClearancePx >= 4,
    mirroredRawRightDisplaysLeft: mirroredResult.code === 'center_face'
      && nearlyEqual(mirroredResult.metrics.centerOffsetDisplay, -6, 0.001)
      && nearlyEqual(mirroredResult.metrics.centerOffsetRaw, 6, 0.001),
    unmirroredRawRightDisplaysRight: unmirroredResult.code === 'center_face'
      && nearlyEqual(unmirroredResult.metrics.centerOffsetDisplay, 6, 0.001)
      && nearlyEqual(unmirroredResult.metrics.centerOffsetRaw, 6, 0.001),
    inverseMappingRoundTrip: nearlyEqual(samplePoint.x, roundTrip.x, 1e-9)
      && nearlyEqual(samplePoint.y, roundTrip.y, 1e-9),
    previewCssMirrored: /^matrix\(-1(?:\.0+)?,\s*0(?:\.0+)?,\s*0(?:\.0+)?,\s*1(?:\.0+)?,/.test(getComputedStyle(video).transform),
  };
  return {
    nominal: {
      scale: round(nominal.scale, 6), offsetX: round(nominal.offsetX, 6), offsetY: round(nominal.offsetY, 6),
      renderedWidth: round(nominal.renderedWidth, 6), renderedHeight: round(nominal.renderedHeight, 6),
    },
    rendered: {
      scale: round(rendered.scale, 6), offsetX: round(rendered.offsetX, 6), offsetY: round(rendered.offsetY, 6),
      renderedWidth: round(rendered.renderedWidth, 6), renderedHeight: round(rendered.renderedHeight, 6),
    },
    stage: rectSnapshot(stageRect),
    ellipse: rectSnapshot(ellipseRect),
    eyeBar: rectSnapshot(barRect),
    hint: rectSnapshot(tipRect),
    shutter: rectSnapshot(shutterRect),
    maxMappingErrorPx: round(maxMappingErrorPx, 6),
    hintEyeBarClearancePx: round(hintEyeBarClearancePx, 6),
    shutterOvalClearancePx: round(shutterOvalClearancePx, 6),
    directionProbe: {
      rawShiftGuideUnits: 6,
      mirroredDisplayOffset: mirroredResult.metrics?.centerOffsetDisplay ?? null,
      mirroredRawOffset: mirroredResult.metrics?.centerOffsetRaw ?? null,
      unmirroredDisplayOffset: unmirroredResult.metrics?.centerOffsetDisplay ?? null,
      unmirroredRawOffset: unmirroredResult.metrics?.centerOffsetRaw ?? null,
    },
    checks,
    pass: Object.values(checks).every(Boolean),
  };
}

function storageSnapshot() {
  const local = {};
  const session = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    local[key] = localStorage.getItem(key);
  }
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    session[key] = sessionStorage.getItem(key);
  }
  const imageLike = [...Object.entries(local), ...Object.entries(session)]
    .filter(([key, value]) => /faceshot|image|photo/i.test(key) || /^data:image\//i.test(value || ''))
    .map(([key]) => key);
  return { local, session, imageLikeKeys: imageLike };
}

function buildMarkdown(report) {
  const viewportRows = report.viewportCases.map((item) => {
    const readyState = item.states.find((state) => state.code === 'ready');
    const maxMapError = Math.max(...item.mappings.map((mapping) => mapping.maxMappingErrorPx));
    return `| ${markdownCell(item.viewport.name)} | ${item.mode} | ${item.pass ? 'PASS' : 'FAIL'} | ${readyState.metrics.contentWidth} | ${readyState.metrics.stage.width}×${readyState.metrics.stage.height} | ${readyState.metrics.overflow} | ${readyState.metrics.hintShutterGapPx} | ${round(maxMapError, 4)} |`;
  }).join('\n');
  const stateRows = alignmentCodes.map((code) => {
    const rows = report.stateCases.filter((item) => item.code === code);
    const passed = rows.filter((item) => item.pass).length;
    return `| ${code} | ${rows[0]?.hint || ''} | ${passed}/${rows.length} |`;
  }).join('\n');
  const feedRows = feeds.map((feed) => {
    const cases = report.mappingCases.filter((item) => item.feed.name === feed.name);
    const first = cases[0];
    const passed = cases.filter((item) => item.pass).length;
    const maxError = Math.max(...cases.map((item) => item.maxMappingErrorPx));
    const minEyeClearance = Math.min(...cases.map((item) => item.hintEyeBarClearancePx));
    const minShutterClearance = Math.min(...cases.map((item) => item.shutterOvalClearancePx));
    return `| ${feed.name} (${feed.width}×${feed.height}) | ${first.nominal.scale} | ${first.nominal.offsetX} | ${first.nominal.offsetY} | ${passed}/${cases.length} | ${round(maxError, 4)} | ${round(minEyeClearance, 2)} | ${round(minShutterClearance, 2)} |`;
  }).join('\n');
  const lifecycleRows = report.lifecycleCases.map((item) => {
    const failed = Object.entries(item.checks).filter(([, pass]) => !pass).map(([name]) => name).join(', ');
    return `| ${markdownCell(item.name)} | ${item.pass ? 'PASS' : 'FAIL'} | ${failed || '—'} |`;
  }).join('\n');
  const failures = report.failures.length
    ? report.failures.map((failure) => `- \`${failure.case}\`: ${failure.failedChecks.join(', ')}`).join('\n')
    : '- None.';
  return `# Face camera rendered coverage audit

Generated: ${report.generatedAt}

## Result

**${report.summary.pass ? 'PASS' : 'FAIL'}** — ${report.summary.viewportCasesPassed}/${report.summary.viewportCases} viewport/mode cases, ${report.summary.mappingCasesPassed}/${report.summary.mappingCases} feed-mapping cases, ${report.summary.stateCasesPassed}/${report.summary.stateCases} rendered alignment-state cases, and ${report.summary.lifecycleCasesPassed}/${report.summary.lifecycleCases} mocked lifecycle/restore cases passed.

This is a deterministic, headless Chromium rendering audit. It loaded the production \`face.html\`, \`css/styles.css\`, \`css/face.css\`, and \`js/face-camera-guide.js\`. Layout cases use a synthetic CSS surface. Lifecycle cases replace native \`getUserMedia\` with a controlled promise returning a canvas-backed synthetic \`MediaStream\`; **no camera hardware, browser permission prompt, physical device sensor, real face, capture frame, model inference, or image persistence was exercised**. Camera-hardware/device validation therefore remains a manual requirement. Screenshots contain only the synthetic surface and production guide UI.

## Literal coverage inventory

- Viewports: **7/7 requested classes** — mobile portrait, tablet, 1366×768, 1920×1080, 2560×1440, desktop 16:10, and 4K.
- Width modes: **2/2 for every viewport** — original and wide, including the intentional ≤980px media-query collapse to the same 100% container.
- Feed shapes: **3/3 for every viewport/mode** — portrait, 4:3, and 16:9.
- Alignment states: **8/8 for every viewport/mode** — no face, closer, back, center, eyes, level, square-on, and ready.
- Lifecycle/restore states: **${report.summary.lifecycleCases}/${report.summary.lifecycleCases} exercised** — pending tab cancellation, track-ended cleanup, pagehide cleanup, stable live-region/reduced-motion behavior, pending-source retirement, and malformed restore rejection.
- Total asserted matrix: **${report.summary.viewportCases} viewport/mode**, **${report.summary.mappingCases} mapping**, **${report.summary.stateCases} rendered state**, and **${report.summary.lifecycleCases} lifecycle/restore** cases.
- Representative screenshots: **${report.screenshots.length}**, listed in the JSON artifact.

## Viewport and width-mode coverage

| Viewport | Mode | Result | Content width px | 4:3 stage px | Horizontal overflow px | Hint/shutter gap px | Max SVG mapping error px |
|---|---:|---:|---:|---:|---:|---:|---:|
${viewportRows}

For mobile and tablet (≤980px), both saved mode values are honored in \`data-content-width\`, while the production media query deliberately resolves both to a 100% container. Desktop original/wide cases measure their distinct container widths.

## Exact viewBox-to-feed mappings

The guide SVG uses \`viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"\`. The table records the exact nominal transform and compares the browser-rendered ellipse/eye bar to it.

| Feed | Scale | Offset X px | Offset Y px | Passed | Worst SVG error px | Min hint-eye px | Min shutter-oval px |
|---|---:|---:|---:|---:|---:|---:|---:|
${feedRows}
Occlusion gates require at least 4px between the actionable hint and eye bar, and at least 4px between the circular shutter and oval.

Each mapping case also verifies that an unmirrored raw-face displacement of +6 guide units appears at −6 in the mirrored preview while structured raw offset remains +6. The production video CSS must compute to \`scaleX(-1)\`; generic “Center your face” copy contains no left/right instruction to reverse.

## Rendered alignment states

| Code | Production hint | Passed viewport/mode cases |
|---|---|---:|
${stateRows}

Every state checks exact classifier output and hint, guide/video/stage bounds, clipping, wrapping, type size and line height, conservative text contrast, hint/shutter separation, 44px shutter target, status semantics, and ready-only green styling.

## Mocked lifecycle and restore coverage

| Case | Result | Failed checks |
|---|---:|---|
${lifecycleRows}

The live-region probe observes the production hint node across repeated 350ms no-face passes and requires zero duplicate text mutations. Computed guide, eye-bar, and hint transition durations must all be zero under \`prefers-reduced-motion: reduce\`. Acquisition candidates are native canvas-backed \`MediaStream\` objects, but the permission API itself is fully mocked and no frame is captured or exported.

## Privacy and limitations

- The harness never called native \`getUserMedia\`, \`captureFrame\`, canvas export, scoring, or local photo-save paths. A mocked \`getUserMedia\` function exercised ownership/cancellation using synthetic canvas-backed streams.
- No image payload persisted. A deliberately malformed data-URL sentinel was written only for the restore-rejection case and production code removed it during page load; layout-case before/after storage snapshots remain in the JSON.
- External CDN dependencies were replaced with inert local route responses so layout results do not depend on the network. This audit therefore does not validate CDN/model availability.
- Synthetic rendered coverage cannot prove physical front-camera orientation, OS/browser permission behavior, sensor rotation metadata, autofocus/exposure, or motion behavior. Those require a real-device manual pass.

## Failures

${failures}

Machine-readable detail: \`data/face-camera-coverage.json\`. Representative screenshots: \`artifacts/face-camera-coverage/\`.
`;
}

await fs.mkdir(path.dirname(jsonPath), { recursive: true });
await fs.mkdir(path.dirname(reportPath), { recursive: true });
await fs.mkdir(screenshotDir, { recursive: true });

const { server, baseUrl } = await startStaticServer();
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.LE_BROWSER_EXECUTABLE || chromium.executablePath(),
});
const viewportCases = [];
const stateCases = [];
const mappingCases = [];
const lifecycleCases = [];
const screenshots = [];
const failures = [];
const recordLifecycle = (name, details) => {
  const checks = details.checks || {};
  const pass = Object.values(checks).every(Boolean);
  const item = { name, ...details, checks, pass };
  lifecycleCases.push(item);
  if (!pass) failures.push({ case: `lifecycle/${name}`, failedChecks: Object.entries(checks).filter(([, ok]) => !ok).map(([key]) => key) });
  return item;
};

try {
  for (const viewport of viewports) {
    for (const mode of modes) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
        colorScheme: 'light',
      });
      await context.addInitScript((widthMode) => {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem('le-content-width', widthMode);
      }, mode);
      const page = await context.newPage();
      await stubExternalRuntime(page);
      const consoleErrors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => consoleErrors.push(error.message));
      let navigationError = '';
      try {
        await page.goto(`${baseUrl}/face.html?camera-coverage=${viewport.name}-${mode}`, {
          waitUntil: 'load', timeout: 30_000,
        });
        await page.evaluate(() => document.fonts?.ready);
        await page.evaluate(staticPageAudit);
      } catch (error) {
        navigationError = error.message;
      }
      const storageBefore = navigationError ? null : await page.evaluate(storageSnapshot);
      const caseStates = [];
      const caseMappings = [];

      if (!navigationError) {
        const stateFeed = feeds.find((feed) => feed.name === '4x3');
        for (const code of alignmentCodes) {
          const classification = await page.evaluate(renderAlignmentCase, { feed: stateFeed, requestedCode: code });
          await page.locator('#lc-stage').scrollIntoViewIfNeeded();
          if (code === 'ready') await page.waitForTimeout(250);
          const metrics = await page.evaluate(measureRenderedState, code);
          const item = {
            viewport,
            mode,
            code,
            hint: classification.hint,
            classification,
            metrics,
            pass: classification.classifiedCode === code && metrics.pass,
          };
          stateCases.push(item);
          caseStates.push(item);
          if (!item.pass) {
            failures.push({
              case: `${viewport.name}/${mode}/state/${code}`,
              failedChecks: [
                ...(classification.classifiedCode === code ? [] : [`classifier=${classification.classifiedCode}`]),
                ...Object.entries(metrics.checks).filter(([, pass]) => !pass).map(([name]) => name),
              ],
            });
          }
          const captureAllStates = viewport.name === 'mobile-portrait-390x844' && mode === 'wide';
          if (captureAllStates || code === 'ready') {
            const filename = `${safeName(viewport.name)}--${mode}--state-${safeName(code)}.png`;
            await page.locator(captureAllStates ? '#lc-stage' : '.lc-panel').first().screenshot({
              path: path.join(screenshotDir, filename), animations: 'disabled',
            });
            screenshots.push(path.relative(root, path.join(screenshotDir, filename)).replaceAll('\\', '/'));
          }
        }

        for (const feed of feeds) {
          await page.evaluate(renderAlignmentCase, { feed, requestedCode: 'ready' });
          const metrics = await page.evaluate(measureMapping, feed);
          const item = { viewport, mode, feed, ...metrics };
          mappingCases.push(item);
          caseMappings.push(item);
          if (!item.pass) {
            failures.push({
              case: `${viewport.name}/${mode}/mapping/${feed.name}`,
              failedChecks: Object.entries(item.checks).filter(([, pass]) => !pass).map(([name]) => name),
            });
          }
          if (viewport.name === 'desktop-1920x1080' && mode === 'original' && feed.name !== '4x3') {
            const filename = `${safeName(viewport.name)}--${mode}--feed-${feed.name}.png`;
            await page.locator('#lc-stage').screenshot({
              path: path.join(screenshotDir, filename), animations: 'disabled',
            });
            screenshots.push(path.relative(root, path.join(screenshotDir, filename)).replaceAll('\\', '/'));
          }
        }
      }

      const storageAfter = navigationError ? null : await page.evaluate(storageSnapshot);
      const storageUnchanged = !navigationError
        && JSON.stringify(storageBefore) === JSON.stringify(storageAfter)
        && storageAfter.imageLikeKeys.length === 0;
      const uniqueConsoleErrors = [...new Set(consoleErrors)];
      const ignoredExternalConsoleErrors = uniqueConsoleErrors
        .filter((message) => /integrity.*tabler-icons|valid digest.*tabler-icons/i.test(message));
      const unexpectedConsoleErrors = uniqueConsoleErrors
        .filter((message) => !ignoredExternalConsoleErrors.includes(message));
      const widthModeApplied = !navigationError && caseStates.every((item) => item.metrics.widthMode === mode);
      const pass = !navigationError && unexpectedConsoleErrors.length === 0 && storageUnchanged && widthModeApplied
        && caseStates.length === alignmentCodes.length && caseStates.every((item) => item.pass)
        && caseMappings.length === feeds.length && caseMappings.every((item) => item.pass);
      const viewportCase = {
        viewport,
        mode,
        modeLayoutCollapsesAt980: viewport.width <= 980,
        navigationError,
        consoleErrors: unexpectedConsoleErrors,
        ignoredExternalConsoleErrors,
        storageBefore,
        storageAfter,
        storageUnchanged,
        widthModeApplied,
        states: caseStates,
        mappings: caseMappings,
        pass,
      };
      viewportCases.push(viewportCase);
      if (!pass && (navigationError || unexpectedConsoleErrors.length || !storageUnchanged || !widthModeApplied)) {
        failures.push({
          case: `${viewport.name}/${mode}/page`,
          failedChecks: [
            ...(navigationError ? ['navigation'] : []),
            ...(unexpectedConsoleErrors.length ? ['consoleErrors'] : []),
            ...(storageUnchanged ? [] : ['storageUnchanged']),
            ...(widthModeApplied ? [] : ['widthModeApplied']),
          ],
        });
      }
      await context.close();
      console.log(`${pass ? 'PASS' : 'FAIL'} ${viewport.name} ${mode}`);
    }
  }

  // One representative production-page context exercises ownership and accessibility behavior that
  // cannot be proven by direct geometry rendering. Native getUserMedia is never called: the mock
  // returns real canvas-backed MediaStreams so srcObject/track teardown follow browser semantics.
  const lifecycleContext = await browser.newContext({
    viewport: { width: 820, height: 1180 }, deviceScaleFactor: 1, reducedMotion: 'reduce', colorScheme: 'light',
  });
  const lifecyclePage = await lifecycleContext.newPage();
  await stubExternalRuntime(lifecyclePage);
  const lifecycleErrors = [];
  lifecyclePage.on('console', (message) => { if (message.type() === 'error') lifecycleErrors.push(message.text()); });
  lifecyclePage.on('pageerror', (error) => lifecycleErrors.push(error.message));
  try {
    await lifecyclePage.goto(`${baseUrl}/face.html?camera-coverage=lifecycle`, { waitUntil: 'load', timeout: 30_000 });
    await lifecyclePage.evaluate(() => {
      const video=document.getElementById('lc-video');
      video.play=async()=>{};
      window.__auditGetUserMediaCalls=0;
      window.__auditLastStream=null;
      window.__auditCanvases=[];
      let resolvePending=null;
      const makeStream=()=>{
        const canvas=document.createElement('canvas'); canvas.width=64; canvas.height=48;
        canvas.getContext('2d').fillRect(0,0,64,48);
        window.__auditCanvases.push(canvas);
        const candidate=canvas.captureStream(1);
        window.__auditLastStream=candidate;
        return candidate;
      };
      const install=(fn)=>Object.defineProperty(navigator.mediaDevices,'getUserMedia',{ configurable:true, value:fn });
      window.__auditDeferredCamera=()=>install(()=>{
        window.__auditGetUserMediaCalls++;
        return new Promise(resolve=>{ resolvePending=resolve; });
      });
      window.__auditResolveCamera=()=>{ const candidate=makeStream(); resolvePending(candidate); return true; };
      window.__auditImmediateCamera=()=>install(async()=>{ window.__auditGetUserMediaCalls++; return makeStream(); });
      window.__auditDeferredCamera();
    });

    await lifecyclePage.locator('.lc-src[data-src="camera"]').click();
    await lifecyclePage.locator('#lc-cam-start').click();
    await lifecyclePage.waitForFunction(() => window.__auditGetUserMediaCalls === 1);
    await lifecyclePage.locator('.lc-src[data-src="upload"]').click();
    await lifecyclePage.evaluate(() => window.__auditResolveCamera());
    await lifecyclePage.waitForFunction(() => window.__auditLastStream?.getTracks()[0]?.readyState === 'ended');
    const pendingTab = await lifecyclePage.evaluate(() => ({
      trackState:window.__auditLastStream.getTracks()[0].readyState,
      srcObjectNull:document.getElementById('lc-video').srcObject === null,
      videoHidden:document.getElementById('lc-video').hidden,
      guideHidden:document.getElementById('lc-guide').hidden,
      shutterHidden:document.getElementById('lc-shutter').hidden,
    }));
    recordLifecycle('pending permission canceled by source switch', {
      ...pendingTab,
      checks:{ candidateStopped:pendingTab.trackState === 'ended', srcObjectDetached:pendingTab.srcObjectNull,
        previewHidden:pendingTab.videoHidden && pendingTab.guideHidden && pendingTab.shutterHidden },
    });

    await lifecyclePage.evaluate(() => {
      window.__auditImmediateCamera();
      window.__auditHintMutations=0;
      const tip=document.querySelector('#lc-guide .lc-guide-tip');
      window.__auditHintObserver=new MutationObserver(records=>{ window.__auditHintMutations+=records.length; });
      window.__auditHintObserver.observe(tip,{ childList:true, characterData:true, subtree:true });
    });
    await lifecyclePage.locator('.lc-src[data-src="camera"]').click();
    await lifecyclePage.locator('#lc-cam-start').click();
    await lifecyclePage.waitForFunction(() => !document.getElementById('lc-video').hidden);
    await lifecyclePage.waitForTimeout(800);
    const stableHint = await lifecyclePage.evaluate(() => {
      window.__auditHintObserver.disconnect();
      const guide=document.getElementById('lc-guide');
      const transitions=[guide.querySelector('.g-shape'),guide.querySelector('.g-bar'),guide.querySelector('.lc-guide-tip')]
        .flatMap(element=>getComputedStyle(element).transitionDuration.split(',').map(value=>Number.parseFloat(value)));
      return { mutations:window.__auditHintMutations, transitions, hint:guide.querySelector('.lc-guide-tip').textContent };
    });
    recordLifecycle('stable no-face hint and reduced motion', {
      ...stableHint,
      checks:{ noDuplicateLiveMutation:stableHint.mutations === 0,
        noGuideTransitions:stableHint.transitions.every(value=>value === 0),
        actionableHint:stableHint.hint === 'No face — look at the camera.' },
    });

    await lifecyclePage.evaluate(() => window.__auditLastStream.getTracks()[0].dispatchEvent(new Event('ended')));
    const hardwareEnded = await lifecyclePage.evaluate(() => ({
      trackState:window.__auditLastStream.getTracks()[0].readyState,
      srcObjectNull:document.getElementById('lc-video').srcObject === null,
      previewHidden:document.getElementById('lc-video').hidden && document.getElementById('lc-guide').hidden && document.getElementById('lc-shutter').hidden,
      status:document.getElementById('lc-status').textContent,
    }));
    recordLifecycle('hardware track ended cleanup', {
      ...hardwareEnded,
      checks:{ trackStopped:hardwareEnded.trackState === 'ended', srcObjectDetached:hardwareEnded.srcObjectNull,
        previewHidden:hardwareEnded.previewHidden, reconnectHint:/Camera ended/.test(hardwareEnded.status) },
    });

    await lifecyclePage.locator('#lc-cam-start').click();
    await lifecyclePage.waitForFunction(() => !document.getElementById('lc-video').hidden);
    await lifecyclePage.evaluate(() => window.dispatchEvent(new Event('pagehide')));
    const pagehide = await lifecyclePage.evaluate(() => ({
      trackState:window.__auditLastStream.getTracks()[0].readyState,
      srcObjectNull:document.getElementById('lc-video').srcObject === null,
      previewHidden:document.getElementById('lc-video').hidden && document.getElementById('lc-guide').hidden && document.getElementById('lc-shutter').hidden,
    }));
    recordLifecycle('pagehide cleanup', {
      ...pagehide,
      checks:{ trackStopped:pagehide.trackState === 'ended', srcObjectDetached:pagehide.srcObjectNull, previewHidden:pagehide.previewHidden },
    });

    const retirement = await lifecyclePage.evaluate(() => {
      const state=window.lcState;
      state.geo={ stale:true }; state.soft={ stale:true }; state.model=0.5; state.modelRaw=3.1;
      state.shots=[3.1]; state.addMode=false; state.reliability='stale'; state.shotDataURL='stale';
      localStorage.setItem('loveEquations.faceShot.v2','stale');
      window.lcRetireForPendingSource();
      return { geo:state.geo, soft:state.soft, model:state.model, modelRaw:state.modelRaw, shots:state.shots,
        shotDataURL:state.shotDataURL, stored:localStorage.getItem('loveEquations.faceShot.v2'),
        emptyResult:/No face yet/.test(document.getElementById('lc-result').textContent) };
    });
    recordLifecycle('accepted source retires prior result', {
      ...retirement,
      checks:{ stateCleared:retirement.geo === null && retirement.soft === null && retirement.model === null && retirement.modelRaw === null
          && retirement.shots.length === 0 && retirement.shotDataURL === null,
        storageCleared:retirement.stored === null, emptyResult:retirement.emptyResult },
    });

    await lifecyclePage.evaluate(() => localStorage.setItem('loveEquations.faceShot.v2',JSON.stringify({
      img:'data:image/png;base64,AA==', state:{ geo:{} },
    })));
    await lifecyclePage.reload({ waitUntil:'load', timeout:30_000 });
    const malformedRestore = await lifecyclePage.evaluate(() => ({
      stored:localStorage.getItem('loveEquations.faceShot.v2'), geo:window.lcState.geo,
      canvasHidden:document.getElementById('lc-canvas').hidden,
      finiteText:!/(NaN|Infinity)/.test(document.getElementById('lc-result').textContent),
    }));
    recordLifecycle('malformed restore rejected', {
      ...malformedRestore,
      checks:{ storageRemoved:malformedRestore.stored === null, stateNotRestored:malformedRestore.geo === null,
        canvasHidden:malformedRestore.canvasHidden, noNonFiniteText:malformedRestore.finiteText },
    });

    const unexpectedLifecycleErrors=[...new Set(lifecycleErrors)].filter((message) => !/integrity.*tabler-icons|valid digest.*tabler-icons/i.test(message));
    recordLifecycle('lifecycle page runtime', {
      consoleErrors:unexpectedLifecycleErrors,
      checks:{ noUnexpectedConsoleErrors:unexpectedLifecycleErrors.length === 0 },
    });
  } catch (error) {
    recordLifecycle('lifecycle harness completion', { error:error.message, checks:{ completed:false } });
  } finally {
    await lifecycleContext.close();
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

const report = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  methodology: {
    kind: 'deterministic headless Chromium render with synthetic camera surface and landmarks',
    productionFilesLoaded: ['face.html', 'css/styles.css', 'css/face.css', 'js/face-camera-guide.js'],
    mocked: ['camera feed pixels', 'getUserMedia permission/acquisition', 'MediaPipe runtime', 'ONNX runtime', 'external icon font'],
    notTested: [
      'physical camera hardware and permissions', 'sensor rotation metadata', 'autofocus and exposure',
      'motion between probe and full-resolution capture', 'real-device browser chrome and safe-area insets',
    ],
    privacy: 'Native getUserMedia, captureFrame, canvas export, model inference, and image persistence were not invoked; lifecycle used only controlled canvas-backed streams.',
  },
  inventory: {
    requestedViewportClasses: 7,
    coveredViewportClasses: viewports.length,
    widthModesPerViewport: modes.length,
    feedShapesPerViewportMode: feeds.length,
    alignmentStatesPerViewportMode: alignmentCodes.length,
    lifecycleAndRestoreCases: lifecycleCases.length,
  },
  viewports,
  modes,
  feeds,
  alignmentCodes,
  summary: {
    viewportCases: viewportCases.length,
    viewportCasesPassed: viewportCases.filter((item) => item.pass).length,
    mappingCases: mappingCases.length,
    mappingCasesPassed: mappingCases.filter((item) => item.pass).length,
    stateCases: stateCases.length,
    stateCasesPassed: stateCases.filter((item) => item.pass).length,
    lifecycleCases: lifecycleCases.length,
    lifecycleCasesPassed: lifecycleCases.filter((item) => item.pass).length,
    failures: failures.length,
    pass: failures.length === 0 && viewportCases.every((item) => item.pass) && lifecycleCases.every((item) => item.pass),
  },
  screenshots,
  failures,
  viewportCases,
  mappingCases,
  stateCases,
  lifecycleCases,
};

await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
await fs.writeFile(reportPath, buildMarkdown(report));

console.log(`CAMERA VIEWPORT/MODE CASES=${report.summary.viewportCasesPassed}/${report.summary.viewportCases}`);
console.log(`CAMERA FEED MAPPINGS=${report.summary.mappingCasesPassed}/${report.summary.mappingCases}`);
console.log(`CAMERA ALIGNMENT STATES=${report.summary.stateCasesPassed}/${report.summary.stateCases}`);
console.log(`CAMERA LIFECYCLE/RESTORE=${report.summary.lifecycleCasesPassed}/${report.summary.lifecycleCases}`);
console.log(`CAMERA SCREENSHOTS=${screenshots.length}`);
console.log(`CAMERA COVERAGE FAILURES=${failures.length}`);
console.log(`CAMERA COVERAGE JSON=${path.relative(root, jsonPath)}`);
console.log(`CAMERA COVERAGE REPORT=${path.relative(root, reportPath)}`);
if (!report.summary.pass) process.exitCode = 1;
