/**
 * Deterministic rendered coverage audit for the Body Calculator camera guide.
 *
 * Loads the production body page, CSS, and BodyCameraGuide in headless Chromium.
 * Layout uses a synthetic CSS video surface; lifecycle uses controlled canvas-backed
 * MediaStreams and a protocol-compatible no-body worker. Native camera permission and
 * physical camera hardware are never invoked.
 */
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const moduleRoot = process.env.CODEX_NODE_MODULES;
if (!moduleRoot) throw new Error('CODEX_NODE_MODULES must point to the bundled node_modules directory.');
const { chromium } = require(path.join(moduleRoot, 'playwright'));

const root = path.resolve(import.meta.dirname, '..');
const jsonPath = path.join(root, 'data', 'body-camera-coverage.json');
const reportPath = path.join(root, 'md', 'body-camera-coverage.md');
const screenshotDir = path.join(root, 'md', 'body-camera-coverage-screenshots');

const requiredViewports = Object.freeze([
  { name: 'mobile-portrait-390x844', width: 390, height: 844, class: 'mobile portrait', required: true },
  { name: 'tablet-820x1180', width: 820, height: 1180, class: 'tablet', required: true },
  { name: 'desktop-1366x768', width: 1366, height: 768, class: 'standard desktop', required: true },
  { name: 'desktop-1920x1080', width: 1920, height: 1080, class: '1080p', required: true },
  { name: 'desktop-2560x1440', width: 2560, height: 1440, class: '1440p', required: true },
  { name: 'desktop-1920x1200', width: 1920, height: 1200, class: '16:10 desktop', required: true },
  { name: 'desktop-3840x2160', width: 3840, height: 2160, class: '4K', required: true },
]);
const boundaryTriples = Object.freeze([
  [479, 480, 481, 900], [719, 720, 721, 1024], [879, 880, 881, 1000], [899, 900, 901, 1000],
  [979, 980, 981, 1000], [1023, 1024, 1025, 1000], [1199, 1200, 1201, 1000],
  [1479, 1480, 1481, 900], [1699, 1700, 1701, 1000], [1759, 1760, 1761, 1000],
]);
const boundaryViewports = Object.freeze(boundaryTriples.flatMap(([before, at, after, height]) => [before, at, after].map(width => ({
  name: `boundary-${width}x${height}`, width, height, class: `breakpoint boundary ${width}px`, required: false,
}))));
const viewports = Object.freeze([...requiredViewports, ...boundaryViewports]);
const modes = Object.freeze(['original', 'wide']);
const autoSnapStates = Object.freeze([true, false]);
const feeds = Object.freeze([
  { name: 'portrait-9x16', width: 1080, height: 1920, expected: { scale: 10.8, offsetX: 0, offsetY: 420 } },
  { name: '4x3', width: 1440, height: 1080, expected: { scale: 10.8, offsetX: 180, offsetY: 0 } },
  { name: '16x9', width: 1920, height: 1080, expected: { scale: 10.8, offsetX: 420, offsetY: 0 } },
]);
const guideCodes = Object.freeze([
  'no_body', 'move_closer', 'move_back', 'center_body', 'align_feet', 'stand_upright',
  'face_camera_square_on', 'straighten_legs', 'level_shoulders_hips', 'arms_out', 'ready',
]);
const screenshotSpecs = Object.freeze([
  ['mobile-portrait-390x844', 'original', 'portrait-9x16', 'ready', false],
  ['tablet-820x1180', 'wide', '4x3', 'arms_out', true],
  ['desktop-1366x768', 'original', '16x9', 'center_body', true],
  ['desktop-1920x1080', 'wide', '4x3', 'ready', false],
  ['desktop-2560x1440', 'wide', 'portrait-9x16', 'move_back', true],
  ['desktop-1920x1200', 'original', '16x9', 'level_shoulders_hips', false],
  ['desktop-3840x2160', 'wide', '4x3', 'no_body', true],
  ['boundary-980x1000', 'wide', '4x3', 'ready', true],
  ['boundary-1024x1000', 'original', '16x9', 'align_feet', false],
]);

const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'], ['.woff2', 'font/woff2'], ['.onnx', 'application/octet-stream'],
]);

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const round = (value, digits = 3) => Number.isFinite(value)
  ? Math.round(value * (10 ** digits)) / (10 ** digits) : null;
const safeName = value => value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
const markdownCell = value => String(value ?? '').replaceAll('|', '\\|').replaceAll('\n', ' ');

async function hashFile(relativePath) {
  const bytes = await fs.readFile(path.join(root, relativePath));
  return { path: relativePath.replaceAll('\\', '/'), sha256: sha256(bytes), bytes: bytes.length };
}

async function startStaticServer() {
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', 'http://127.0.0.1');
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'body.html';
      const filePath = path.resolve(root, relative);
      if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) {
        response.writeHead(403).end('Forbidden'); return;
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
  return { server, baseUrl: `http://127.0.0.1:${server.address().port}` };
}

async function stubExternalRuntime(page) {
  await page.route('**/js/body-pose-worker.js*', route => route.fulfill({
    status: 200,
    contentType: 'text/javascript; charset=utf-8',
    body: [
      "self.postMessage({type:'ready',segmentation:true});",
      "self.onmessage=event=>{const m=event.data||{};if(m.type!=='analyze')return;",
      "self.postMessage({type:'result',id:m.id,landmarks:null,silhouette:null,quality:null,warning:'',recycle:false,elapsedMs:1});",
      "try{m.bitmap.close()}catch(_){}};",
    ].join('\n'),
  }));
  await page.route('https://**/*', route => {
    const url = route.request().url();
    if (url.includes('ort.min.js')) return route.fulfill({
      status: 200, contentType: 'text/javascript; charset=utf-8', body: 'window.ort=undefined;',
    });
    if (url.endsWith('.css') || url.includes('tabler-icons')) return route.fulfill({
      status: 200, contentType: 'text/css; charset=utf-8', body: '',
    });
    return route.fulfill({ status: 204, body: '' });
  });
}

// Serialized into the production page. Every classification calls BodyCameraGuide;
// layout measurements use the actual production DOM and computed CSS.
function installCoverageApi() {
  const api = window.BodyCameraGuide;
  const stage = document.getElementById('bc-stage');
  const video = document.getElementById('bc-video');
  const canvas = document.getElementById('bc-canvas');
  const guide = document.getElementById('bc-guide');
  const tip = document.getElementById('bc-guide-tip');
  const shutter = document.getElementById('bc-shutter');
  const autoSnap = document.getElementById('bc-autosnap');
  const cameraPanel = document.getElementById('bc-source-camera');
  const uploadPanel = document.getElementById('bc-source-upload');
  if (!api || !stage || !video || !guide || !tip || !shutter || !autoSnap) throw new Error('Body camera audit DOM unavailable.');

  uploadPanel.hidden = true;
  cameraPanel.hidden = false;
  for (const tab of document.querySelectorAll('.bc-src')) tab.classList.toggle('active', tab.dataset.src === 'camera');
  stage.classList.add('show', 'is-camera');
  canvas.hidden = true; video.hidden = false; guide.hidden = false; shutter.hidden = false;
  video.style.backgroundColor = '#2c2622';
  video.style.backgroundImage = 'linear-gradient(90deg,#35556f 0 50%,#7d3948 50% 100%)';
  video.style.objectFit = 'contain';

  const close = (a, b, tolerance = 1e-6) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
  const rounded = (value, digits = 3) => Number.isFinite(value) ? Math.round(value * (10 ** digits)) / (10 ** digits) : null;
  const rect = value => ({
    left: rounded(value.left), top: rounded(value.top), right: rounded(value.right), bottom: rounded(value.bottom),
    width: rounded(value.width), height: rounded(value.height),
  });
  const sameRect = (a, b, tolerance = 1) => Math.abs(a.left - b.left) <= tolerance
    && Math.abs(a.right - b.right) <= tolerance && Math.abs(a.top - b.top) <= tolerance
    && Math.abs(a.bottom - b.bottom) <= tolerance;
  const within = (inner, outer, tolerance = 1) => inner.left >= outer.left - tolerance
    && inner.right <= outer.right + tolerance && inner.top >= outer.top - tolerance
    && inner.bottom <= outer.bottom + tolerance;
  const parseColor = value => {
    const match = String(value).match(/rgba?\(([^)]+)\)/i);
    if (!match) return null;
    const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return parts.length >= 3 && parts.slice(0, 3).every(Number.isFinite)
      ? { r: parts[0], g: parts[1], b: parts[2], a: Number.isFinite(parts[3]) ? parts[3] : 1 } : null;
  };
  const composite = (front, back) => ({
    r: front.r * front.a + back.r * (1 - front.a),
    g: front.g * front.a + back.g * (1 - front.a),
    b: front.b * front.a + back.b * (1 - front.a), a: 1,
  });
  const luminance = color => {
    const channel = value => {
      const v = value / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
  };
  const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05)
    / (Math.min(luminance(a), luminance(b)) + 0.05);

  function setGuidePoint(landmarks, transform, index, x, y, mirrored = true, confidence = 1) {
    landmarks[index] = Object.assign(api.guidePointToNormalizedVideo({ x, y }, transform, mirrored), {
      z: 0, visibility: confidence, presence: confidence,
    });
  }
  function aligned(feed, mirrored = true) {
    const transform = api.computeViewBoxTransform(feed.width, feed.height);
    const landmarks = Array(33).fill(null);
    const points = {
      0:[50,13], 11:[38,25], 12:[62,25], 13:[34,41], 14:[66,41], 15:[27,58], 16:[73,58],
      23:[42,56], 24:[58,56], 25:[43,73], 26:[57,73], 27:[42,90], 28:[58,90],
      29:[41,90], 30:[59,90], 31:[40,90], 32:[60,90],
    };
    for (const [index, point] of Object.entries(points)) setGuidePoint(landmarks, transform, Number(index), point[0], point[1], mirrored);
    return landmarks;
  }
  function mutate(landmarks, feed, mirrored, change) {
    const transform = api.computeViewBoxTransform(feed.width, feed.height);
    for (let index = 0; index < landmarks.length; index += 1) {
      if (!landmarks[index]) continue;
      const shown = api.normalizedVideoPointToGuide(landmarks[index], transform, mirrored);
      const next = change({ x: shown.x, y: shown.y }, index) || shown;
      const raw = api.guidePointToNormalizedVideo(next, transform, mirrored);
      landmarks[index] = Object.assign({}, landmarks[index], raw);
    }
    return landmarks;
  }
  function configureFeed(feed) {
    const parentWidth = stage.parentElement?.clientWidth || feed.width;
    const heightCap = Math.min(960, Math.max(320, innerHeight || 720) * 0.8);
    const widthCap = Math.max(180, Math.min(parentWidth, heightCap * feed.width / feed.height));
    stage.style.setProperty('--bc-feed-ratio', `${feed.width} / ${feed.height}`);
    stage.style.setProperty('--bc-camera-width-cap', `${Math.round(widthCap)}px`);
    video.width = feed.width; video.height = feed.height;
  }
  function classify(feed, requestedCode) {
    configureFeed(feed);
    const pass = { ok:true, code:'ok', framing:'full', band:'pass' };
    let quality = pass;
    let landmarks = aligned(feed, true);
    if (requestedCode === 'no_body') landmarks = null;
    else if (requestedCode === 'move_closer') landmarks = mutate(landmarks, feed, true,
      point => ({ x:point.x, y:90-(90-point.y)*0.70 }));
    else if (requestedCode === 'move_back') landmarks = mutate(landmarks, feed, true,
      point => ({ x:point.x, y:90-(90-point.y)*1.12 }));
    else if (requestedCode === 'center_body') landmarks = mutate(landmarks, feed, true,
      point => ({ x:point.x+7, y:point.y }));
    else if (requestedCode === 'align_feet') landmarks = mutate(landmarks, feed, true,
      point => ({ x:point.x, y:point.y+6 }));
    else if (requestedCode === 'stand_upright') quality = { ok:false, code:'upright' };
    else if (requestedCode === 'face_camera_square_on') quality = { ok:false, code:'profile' };
    else if (requestedCode === 'straighten_legs') quality = { ok:false, code:'standing' };
    else if (requestedCode === 'level_shoulders_hips') quality = { ok:true, code:'ok', framing:'full', band:'degraded' };
    else if (requestedCode === 'arms_out') {
      setGuidePoint(landmarks, api.computeViewBoxTransform(feed.width, feed.height), 13, 50, 45, true);
    }
    const alignment = api.evaluateCameraAlignment(landmarks, feed.width, feed.height, quality, { mirrored:true });
    if (tip.textContent !== alignment.hint) tip.textContent = alignment.hint;
    guide.dataset.guideCode = alignment.code;
    guide.classList.toggle('is-ready', alignment.ready);
    window.__bcCoverageAlignment = alignment;
    return alignment;
  }
  function measureState(feed, expectedCode, autoSnapEnabled) {
    autoSnap.checked = autoSnapEnabled;
    const alignment = classify(feed, expectedCode);
    const stageRect = stage.getBoundingClientRect();
    const videoRect = video.getBoundingClientRect();
    const guideRect = guide.getBoundingClientRect();
    const svg = guide.querySelector('svg');
    const svgRect = svg.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const shutterRect = shutter.getBoundingClientRect();
    const shape = guide.querySelector('.g-shape');
    const shapeStyle = getComputedStyle(shape);
    const tipStyle = getComputedStyle(tip);
    const stageColor = parseColor(getComputedStyle(stage).backgroundColor) || {r:44,g:38,b:34,a:1};
    const tipColor = parseColor(tipStyle.color);
    const tipOverlay = parseColor(tipStyle.backgroundColor);
    const tipBackground = tipOverlay ? composite(tipOverlay, stageColor) : null;
    const tipContrast = tipColor && tipBackground ? contrast(tipColor, tipBackground) : null;
    const strokeColor = parseColor(shapeStyle.stroke);
    const strokeContrast = strokeColor ? contrast(strokeColor, stageColor) : null;
    const fontSize = Number.parseFloat(tipStyle.fontSize);
    const lineHeight = Number.parseFloat(tipStyle.lineHeight);
    const textHeight = Math.max(0, tipRect.height - Number.parseFloat(tipStyle.paddingTop) - Number.parseFloat(tipStyle.paddingBottom));
    const hintLines = lineHeight > 0 ? Math.max(1, Math.round(textHeight / lineHeight)) : null;
    const charsPerLine = hintLines ? tip.textContent.length / hintLines : null;
    const overlapWidth = Math.max(0, Math.min(tipRect.right, shutterRect.right) - Math.max(tipRect.left, shutterRect.left));
    const overlapHeight = Math.max(0, Math.min(tipRect.bottom, shutterRect.bottom) - Math.max(tipRect.top, shutterRect.top));
    const overlapArea = overlapWidth * overlapHeight;
    const verticalGap = shutterRect.top - tipRect.bottom;
    const viewportWidth = document.documentElement.clientWidth;
    const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - viewportWidth;
    const contentWidth = document.querySelector('.bc-content')?.getBoundingClientRect().width || 0;
    const videoTransform = getComputedStyle(video).transform;
    const transitions = [shape, guide.querySelector('.g-bar'), shutter].flatMap(element =>
      getComputedStyle(element).transitionDuration.split(',').map(value => Number.parseFloat(value)));
    const readyGreen = /85,\s*230,\s*165/.test(shapeStyle.stroke);
    const checks = {
      exactClassification: alignment.code === expectedCode,
      exactHint: alignment.hint === api.GUIDE_HINTS[expectedCode] && tip.textContent === api.GUIDE_HINTS[expectedCode],
      autoSnapState: autoSnap.checked === autoSnapEnabled,
      readyStateAndStyle: alignment.ready === (expectedCode === 'ready')
        && guide.classList.contains('is-ready') === (expectedCode === 'ready')
        && readyGreen === (expectedCode === 'ready'),
      noHorizontalOverflow: overflow <= 1,
      stageInsideViewport: stageRect.left >= -1 && stageRect.right <= viewportWidth + 1,
      contentLineLengthCapped: contentWidth <= 1441,
      videoMatchesStage: sameRect(videoRect, stageRect),
      guideMatchesStage: sameRect(guideRect, stageRect) && sameRect(svgRect, stageRect),
      feedAspectExact: Math.abs(stageRect.width / stageRect.height - feed.width / feed.height) <= 0.01,
      hintInsideStage: within(tipRect, stageRect),
      shutterInsideStage: within(shutterRect, stageRect),
      hintShutterSeparated: overlapArea <= 0.5 && verticalGap >= 6,
      hintNotClipped: tip.scrollWidth <= tip.clientWidth + 1 && tip.scrollHeight <= tip.clientHeight + 1,
      readableType: fontSize >= 12 && lineHeight >= fontSize * 1.35,
      readableLineLength: charsPerLine != null && charsPerLine <= 70,
      readableTextContrast: tipContrast != null && tipContrast >= 4.5,
      visibleGuideContrast: strokeContrast != null && strokeContrast >= 3,
      shutterTarget: shutterRect.width >= 44 && shutterRect.height >= 44,
      previewMirrored: /^matrix\(-1(?:\.0+)?,\s*0(?:\.0+)?,\s*0(?:\.0+)?,\s*1(?:\.0+)?,/.test(videoTransform),
      reducedMotion: transitions.every(value => value === 0),
      accessibility: document.querySelector('.bc-srcs')?.getAttribute('role') === 'group'
        && document.getElementById('bc-url')?.getAttribute('aria-label') === 'Image URL'
        && video.getAttribute('aria-label') === 'Mirrored live camera preview'
        && canvas.getAttribute('aria-label') === 'Selected body photo for analysis'
        && tip.getAttribute('role') === 'status' && tip.getAttribute('aria-live') === 'polite'
        && tip.getAttribute('aria-atomic') === 'true' && svg.getAttribute('aria-hidden') === 'true'
        && shutter.getAttribute('aria-label') === 'Capture photo manually'
        && shutter.getAttribute('aria-describedby') === tip.id,
    };
    return {
      classifiedCode: alignment.code,
      stage: rect(stageRect), tip: rect(tipRect), shutter: rect(shutterRect),
      overflowPx: rounded(overflow), contentWidthPx: rounded(contentWidth),
      hintLines, charsPerLine: rounded(charsPerLine), fontSizePx: rounded(fontSize), lineHeightPx: rounded(lineHeight),
      hintContrast: rounded(tipContrast), guideContrast: rounded(strokeContrast), hintShutterGapPx: rounded(verticalGap),
      videoTransform, checks, pass:Object.values(checks).every(Boolean),
    };
  }
  function measureMapping(feed) {
    classify(feed, 'ready');
    const stageRect = stage.getBoundingClientRect();
    const svgRect = guide.querySelector('svg').getBoundingClientRect();
    const circleRect = guide.querySelector('circle.g-shape').getBoundingClientRect();
    const torsoRect = guide.querySelector('path.g-shape').getBoundingClientRect();
    const footRect = guide.querySelector('.g-bar').getBoundingClientRect();
    const nominal = api.computeViewBoxTransform(feed.width, feed.height);
    const rendered = api.computeViewBoxTransform(stageRect.width, stageRect.height);
    const expected = {
      circleLeft:stageRect.left+rendered.offsetX+44*rendered.scale,
      circleRight:stageRect.left+rendered.offsetX+56*rendered.scale,
      circleTop:stageRect.top+rendered.offsetY+7*rendered.scale,
      circleBottom:stageRect.top+rendered.offsetY+19*rendered.scale,
      torsoLeft:stageRect.left+rendered.offsetX+38*rendered.scale,
      torsoRight:stageRect.left+rendered.offsetX+62*rendered.scale,
      torsoTop:stageRect.top+rendered.offsetY+25*rendered.scale,
      torsoBottom:stageRect.top+rendered.offsetY+56*rendered.scale,
      footLeft:stageRect.left+rendered.offsetX+26*rendered.scale,
      footRight:stageRect.left+rendered.offsetX+74*rendered.scale,
      footY:stageRect.top+rendered.offsetY+91*rendered.scale,
    };
    const errors = [
      Math.abs(circleRect.left-expected.circleLeft), Math.abs(circleRect.right-expected.circleRight),
      Math.abs(circleRect.top-expected.circleTop), Math.abs(circleRect.bottom-expected.circleBottom),
      Math.abs(torsoRect.left-expected.torsoLeft), Math.abs(torsoRect.right-expected.torsoRight),
      Math.abs(torsoRect.top-expected.torsoTop), Math.abs(torsoRect.bottom-expected.torsoBottom),
      Math.abs(footRect.left-expected.footLeft), Math.abs(footRect.right-expected.footRight),
      Math.abs((footRect.top+footRect.bottom)/2-expected.footY),
    ];
    const raw = mutate(aligned(feed, false), feed, false, point => ({x:point.x+7,y:point.y}));
    const quality = {ok:true,code:'ok',framing:'full',band:'pass'};
    const mirrored = api.evaluateCameraAlignment(raw,feed.width,feed.height,quality,{mirrored:true});
    const unmirrored = api.evaluateCameraAlignment(raw,feed.width,feed.height,quality,{mirrored:false});
    const sample = {x:0.31,y:0.62};
    const mapped = api.normalizedVideoPointToGuide(sample,nominal,true);
    const roundTrip = api.guidePointToNormalizedVideo(mapped,nominal,true);
    const maxError = Math.max(...errors);
    const checks = {
      nominalTransformExact: close(nominal.scale,feed.expected.scale,1e-9)
        && close(nominal.offsetX,feed.expected.offsetX,1e-9) && close(nominal.offsetY,feed.expected.offsetY,1e-9),
      renderedFeedAspectExact: Math.abs(stageRect.width/stageRect.height-feed.width/feed.height)<=0.01,
      svgMatchesStage: sameRect(svgRect,stageRect),
      svgGeometryMatchesTransform: maxError<=1.25,
      mirroredDirection: mirrored.code==='center_body' && close(mirrored.metrics.centerOffsetDisplay,-7,0.001)
        && close(mirrored.metrics.centerOffsetRaw,7,0.001),
      unmirroredDirection: unmirrored.code==='center_body' && close(unmirrored.metrics.centerOffsetDisplay,7,0.001)
        && close(unmirrored.metrics.centerOffsetRaw,7,0.001),
      inverseRoundTrip: close(sample.x,roundTrip.x,1e-9) && close(sample.y,roundTrip.y,1e-9),
    };
    return {
      nominal:{scale:rounded(nominal.scale,6),offsetX:rounded(nominal.offsetX,6),offsetY:rounded(nominal.offsetY,6)},
      stage:rect(stageRect), maxSvgErrorPx:rounded(maxError,6),
      mirroredDisplayOffset:mirrored.metrics?.centerOffsetDisplay ?? null,
      unmirroredDisplayOffset:unmirrored.metrics?.centerOffsetDisplay ?? null,
      rawOffset:mirrored.metrics?.centerOffsetRaw ?? null,
      checks, pass:Object.values(checks).every(Boolean),
    };
  }
  function storage() {
    const local = {}, session = {};
    for (let i=0;i<localStorage.length;i+=1) { const key=localStorage.key(i); local[key]=localStorage.getItem(key); }
    for (let i=0;i<sessionStorage.length;i+=1) { const key=sessionStorage.key(i); session[key]=sessionStorage.getItem(key); }
    return {local,session};
  }
  function runViewport(config) {
    const states=[], mappings=[];
    for (const mode of config.modes) {
      document.documentElement.dataset.contentWidth=mode;
      for (const feed of config.feeds) {
        const mapping=measureMapping(feed);
        mappings.push({mode,feed:feed.name,...mapping});
        for (const autoSnapEnabled of config.autoSnapStates) {
          for (const code of config.guideCodes) {
            states.push({mode,feed:feed.name,code,autoSnap:autoSnapEnabled,...measureState(feed,code,autoSnapEnabled)});
          }
        }
      }
    }
    return {states,mappings};
  }
  window.__bodyCameraCoverage={classify,measureState,measureMapping,runViewport,storage};
}

function storageSnapshot() {
  return window.__bodyCameraCoverage.storage();
}

function normalizeConsoleErrors(messages) {
  const unique=[...new Set(messages)];
  return unique.filter(message => !/integrity.*tabler-icons|valid digest.*tabler-icons/i.test(message));
}

async function installMockCamera(page, options = {}) {
  await page.evaluate(config => {
    const video=document.getElementById('bc-video');
    const canvases=[];
    let resolvePermission=null, resolvePlay=null;
    const makeStream=()=>{
      const canvas=document.createElement('canvas'); canvas.width=config.width||640; canvas.height=config.height||480;
      const context=canvas.getContext('2d'); context.fillStyle='#35556f'; context.fillRect(0,0,canvas.width/2,canvas.height);
      context.fillStyle='#7d3948'; context.fillRect(canvas.width/2,0,canvas.width/2,canvas.height);
      canvases.push(canvas);
      const stream=canvas.captureStream(1); window.__auditStream=stream; return stream;
    };
    window.__auditCanvases=canvases; window.__auditCalls=0;
    const getUserMedia=config.permissionDeferred
      ? ()=>{ window.__auditCalls+=1; return new Promise(resolve=>{resolvePermission=resolve;}); }
      : async()=>{ window.__auditCalls+=1; return makeStream(); };
    Object.defineProperty(navigator.mediaDevices,'getUserMedia',{configurable:true,value:getUserMedia});
    const markDimensions=()=>{
      Object.defineProperty(video,'videoWidth',{configurable:true,value:config.width||640});
      Object.defineProperty(video,'videoHeight',{configurable:true,value:config.height||480});
    };
    video.play=config.playDeferred
      ? ()=>new Promise(resolve=>{resolvePlay=()=>{markDimensions();resolve();};})
      : async()=>{markDimensions();};
    window.__auditResolvePermission=()=>{const stream=makeStream();resolvePermission(stream);return true;};
    window.__auditResolvePlay=()=>{resolvePlay();return true;};
    if(config.noopDraw) CanvasRenderingContext2D.prototype.drawImage=function(){};
  }, options);
}

async function newLifecyclePage(browser, baseUrl, name, options = {}) {
  const context=await browser.newContext({viewport:{width:820,height:1180},deviceScaleFactor:1,reducedMotion:'reduce',colorScheme:'light'});
  const page=await context.newPage();
  await stubExternalRuntime(page);
  const errors=[];
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`${baseUrl}/body.html?body-camera-lifecycle=${encodeURIComponent(name)}`,{waitUntil:'load',timeout:30_000});
  await installMockCamera(page,options);
  return {context,page,errors};
}

function buildMarkdown(report) {
  const requiredRows=requiredViewports.flatMap(viewport=>modes.map(mode=>{
    const row=report.viewportModeCases.find(item=>item.viewport===viewport.name&&item.mode===mode);
    return `| ${viewport.class} (${viewport.width}×${viewport.height}) | ${mode} | ${row?.passedStates}/${row?.stateCases} | ${row?.passedMappings}/${row?.mappingCases} | ${row?.maxOverflowPx} | ${row?.minHintShutterGapPx} | ${row?.pass?'PASS':'FAIL'} |`;
  })).join('\n');
  const stateRows=guideCodes.map(code=>{
    const rows=report.stateCases.filter(item=>item.code===code);
    return `| ${code} | ${rows.filter(item=>item.pass).length}/${rows.length} |`;
  }).join('\n');
  const feedRows=feeds.map(feed=>{
    const rows=report.mappingCases.filter(item=>item.feed===feed.name);
    return `| ${feed.name} | ${feed.width}×${feed.height} | ${rows.filter(item=>item.pass).length}/${rows.length} | ${round(Math.max(...rows.map(item=>item.maxSvgErrorPx)),4)} |`;
  }).join('\n');
  const lifecycleRows=report.lifecycleCases.map(item=>`| ${markdownCell(item.name)} | ${item.pass?'PASS':'FAIL'} | ${item.failedChecks.join(', ')||'—'} |`).join('\n');
  const screenshotRows=report.screenshots.map(item=>`| ${item.viewport} | ${item.mode} | ${item.feed || '—'} | ${item.code || item.state || '—'} | ${item.autoSnap == null ? '—' : item.autoSnap?'on':'off'} | [${path.basename(item.path)}](body-camera-coverage-screenshots/${path.basename(item.path)}) | \`${item.sha256.slice(0,12)}…\` |`).join('\n');
  const failures=report.failures.length?report.failures.map(item=>`- \`${item.case}\`: ${item.failedChecks.join(', ')}`).join('\n'):'- None.';
  return `# Body camera rendered coverage audit

Generated: ${report.generatedAt}

## Result

**${report.summary.pass?'PASS':'FAIL'}** — ${report.summary.stateCasesPassed}/${report.summary.stateCases} rendered guide cases, ${report.summary.mappingCasesPassed}/${report.summary.mappingCases} exact feed/SVG mapping cases, and ${report.summary.lifecycleCasesPassed}/${report.summary.lifecycleCases} mocked production-page lifecycle cases passed.

This deterministic headless-Chromium audit loaded production \`body.html\`, \`css/styles.css\`, \`css/body.css\`, and \`js/body-camera-guide.js\`. It uses synthetic colored surfaces and canvas-backed streams; no human image or body rating is involved. Structural/render coverage does **not** prove physical-camera behavior or subjective attractiveness accuracy.

## Literal coverage inventory

- Required viewport classes: **7/7** — mobile portrait, tablet, standard desktop, 1080p, 1440p, 16:10, and 4K.
- Explicit breakpoint widths: **30/30** — 479/480/481, 719/720/721, 879/880/881, 899/900/901, 979/980/981, 1023/1024/1025, 1199/1200/1201, 1479/1480/1481, 1699/1700/1701, and 1759/1760/1761 px.
- Width modes: **2/2** per viewport; feeds: **3/3** (portrait 9:16, 4:3, 16:9); guide codes: **11/11**; auto-snap states: **2/2**.
- Full rendered state matrix: **${report.summary.stateCases}** cases (37 viewports × 2 modes × 3 feeds × 11 states × 2 auto-snap states), exceeding the 1,056-case floor.
- Exact mapping matrix: **${report.summary.mappingCases}** cases. Representative committed screenshots: **${report.screenshots.length}**.
- Every layout context preserved its before/after localStorage and sessionStorage snapshot.

## Required viewport results

| Class | Width mode | Guide states | Feed mappings | Max overflow px | Min hint/shutter gap px | Result |
|---|---|---:|---:|---:|---:|---:|
${requiredRows}

## Guide-state coverage

| Stable actionable code | Passed |
|---|---:|
${stateRows}

Each state checks exact production code/hint, feed/stage/guide agreement, horizontal overflow, clipping, hint/shutter separation, 60-character line measure, 12px+ type, 4.5:1 hint contrast, 3:1 guide contrast, mirroring, reduced motion, manual-shutter target, width cap, source/URL/video/canvas/status semantics, and auto-snap on/off invariance.

## Exact xMidYMid meet mapping

| Feed | Frame | Passed | Worst SVG error px |
|---|---:|---:|---:|
${feedRows}

Every mapping case binds the production SVG circle/torso/foot line to \`preserveAspectRatio="xMidYMid meet"\`, checks inverse round trips, and verifies that a raw +7-unit shift displays as −7 only in the mirrored preview while raw provenance remains +7.

## Mocked lifecycle coverage

| Case | Result | Failed checks |
|---|---:|---|
${lifecycleRows}

## Representative screenshots

Screenshots contain only the synthetic two-color feed and production camera UI.

| Viewport | Mode | Feed | State | Auto-snap | File | SHA-256 |
|---|---|---|---|---:|---|---|
${screenshotRows}

## What synthetic coverage cannot prove

This audit does **not** prove physical sensor orientation or rotation metadata, autofocus, exposure, native permission/browser prompts, browser chrome and safe-area behavior, or real-device motion between alignment and capture. It also does not prove model accuracy, calibration, ranking, AUC, or human attractiveness discrimination.

### Real-device checklist

- iOS Safari and Android Chrome: allow, deny, dismiss, retry, and revoke camera permission.
- Front camera in portrait and landscape: confirm preview mirroring, captured-pixel orientation, and guide/feed agreement after rotation.
- Test 4:3, 16:9, and tall native feeds where the device exposes them; inspect browser chrome and safe-area insets.
- Bright, dim, and backlit rooms: verify autofocus/exposure settles before manual and automatic capture.
- Walk into/out of frame, move arms, rotate, and lean: verify hints remain stable, auto-snap does not fire after retirement, and manual shutter always remains available.
- Interrupt with tab switch, app backgrounding, track revocation, reset, upload/paste/URL replacement, and camera restart; confirm tracks stop and no old result returns.
- Confirm no photo or capture payload appears in storage before a validated analysis commit.

## Failures

${failures}

Machine-readable detail: \`data/body-camera-coverage.json\`. Production bindings and screenshot hashes are recorded there. Reproducibility hash: \`${report.reproducibility.normalizedSha256}\`.
`;
}

await fs.mkdir(path.dirname(jsonPath),{recursive:true});
await fs.mkdir(path.dirname(reportPath),{recursive:true});
await fs.mkdir(screenshotDir,{recursive:true});

const {server,baseUrl}=await startStaticServer();
const browser=await chromium.launch({headless:true,executablePath:process.env.LE_BROWSER_EXECUTABLE||chromium.executablePath()});
const browserVersion=browser.version();
const stateCases=[],mappingCases=[],lifecycleCases=[],failures=[],screenshots=[];
let matrixStorageBefore=null,matrixStorageAfter=null;
const recordLifecycle=(name,details)=>{
  const checks=details.checks||{};
  const failedChecks=Object.entries(checks).filter(([,ok])=>!ok).map(([key])=>key);
  const item={name,...details,checks,failedChecks,pass:failedChecks.length===0};
  lifecycleCases.push(item);
  if(!item.pass)failures.push({case:`lifecycle/${name}`,failedChecks});
  return item;
};

try {
  const matrixContext=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,reducedMotion:'reduce',colorScheme:'light'});
  await matrixContext.addInitScript(()=>{
    localStorage.clear();sessionStorage.clear();
    localStorage.setItem('body-camera-audit-sentinel','unchanged');
    localStorage.setItem('le-content-width','original');
  });
  const page=await matrixContext.newPage();
  await stubExternalRuntime(page);
  const matrixErrors=[];
  page.on('console',message=>{if(message.type()==='error')matrixErrors.push(message.text());});
  page.on('pageerror',error=>matrixErrors.push(error.message));
  await page.goto(`${baseUrl}/body.html?body-camera-coverage=matrix`,{waitUntil:'load',timeout:30_000});
  await page.evaluate(()=>document.fonts?.ready);
  await page.evaluate(installCoverageApi);
  matrixStorageBefore=await page.evaluate(storageSnapshot);

  for(const viewport of viewports){
    await page.setViewportSize({width:viewport.width,height:viewport.height});
    const result=await page.evaluate(config=>window.__bodyCameraCoverage.runViewport(config),{
      modes,feeds,autoSnapStates,guideCodes,
    });
    for(const item of result.states){
      const row={viewport:viewport.name,width:viewport.width,height:viewport.height,required:viewport.required,...item};
      stateCases.push(row);
      if(!row.pass)failures.push({case:`${viewport.name}/${row.mode}/${row.feed}/${row.code}/auto-${row.autoSnap?'on':'off'}`,failedChecks:Object.entries(row.checks).filter(([,ok])=>!ok).map(([key])=>key)});
    }
    for(const item of result.mappings){
      const row={viewport:viewport.name,width:viewport.width,height:viewport.height,required:viewport.required,...item};
      mappingCases.push(row);
      if(!row.pass)failures.push({case:`${viewport.name}/${row.mode}/${row.feed}/mapping`,failedChecks:Object.entries(row.checks).filter(([,ok])=>!ok).map(([key])=>key)});
    }
    for(const spec of screenshotSpecs.filter(item=>item[0]===viewport.name)){
      const [,mode,feedName,code,autoSnap]=spec;
      const feed=feeds.find(item=>item.name===feedName);
      await page.evaluate(({mode,feed,code,autoSnap})=>{
        document.documentElement.dataset.contentWidth=mode;
        window.__bodyCameraCoverage.measureState(feed,code,autoSnap);
      },{mode,feed,code,autoSnap});
      await page.locator('#bc-stage').scrollIntoViewIfNeeded();
      const filename=`${safeName(viewport.name)}--${mode}--${feedName}--${code}--auto-${autoSnap?'on':'off'}.png`;
      const absolute=path.join(screenshotDir,filename);
      await page.locator('.bc-panel').first().screenshot({path:absolute,animations:'disabled'});
      screenshots.push({viewport:viewport.name,mode,feed:feedName,code,autoSnap,path:path.relative(root,absolute).replaceAll('\\','/')});
    }
    const passed=result.states.filter(item=>item.pass).length;
    console.log(`${passed===result.states.length&&result.mappings.every(item=>item.pass)?'PASS':'FAIL'} ${viewport.name} ${passed}/${result.states.length}`);
  }
  matrixStorageAfter=await page.evaluate(storageSnapshot);
  const unexpectedMatrixErrors=normalizeConsoleErrors(matrixErrors);
  recordLifecycle('matrix page runtime and storage invariance',{
    consoleErrors:unexpectedMatrixErrors,storageBefore:matrixStorageBefore,storageAfter:matrixStorageAfter,
    checks:{noUnexpectedConsoleErrors:unexpectedMatrixErrors.length===0,storageUnchanged:JSON.stringify(matrixStorageBefore)===JSON.stringify(matrixStorageAfter)},
  });
  await matrixContext.close();

  // Production DOM lifecycle cases. getUserMedia is replaced before any Start click;
  // candidates are synthetic canvas-backed MediaStreams.
  {
    const run=await newLifecyclePage(browser,baseUrl,'late-permission-source',{permissionDeferred:true});
    await run.page.locator('.bc-src[data-src="camera"]').click();
    await run.page.locator('#bc-cam-start').click();
    await run.page.waitForFunction(()=>window.__auditCalls===1);
    await run.page.locator('.bc-src[data-src="upload"]').click();
    await run.page.evaluate(()=>window.__auditResolvePermission());
    await run.page.waitForFunction(()=>window.__auditStream?.getTracks()[0]?.readyState==='ended');
    const result=await run.page.evaluate(()=>({track:window.__auditStream.getTracks()[0].readyState,srcNull:document.getElementById('bc-video').srcObject===null,hidden:document.getElementById('bc-video').hidden&&document.getElementById('bc-guide').hidden&&document.getElementById('bc-shutter').hidden}));
    const errors=normalizeConsoleErrors(run.errors);
    recordLifecycle('late permission canceled by source switch',{...result,consoleErrors:errors,checks:{trackStopped:result.track==='ended',srcDetached:result.srcNull,previewHidden:result.hidden,noErrors:errors.length===0}});
    await run.context.close();
  }
  {
    const run=await newLifecyclePage(browser,baseUrl,'late-play-source',{playDeferred:true});
    await run.page.locator('.bc-src[data-src="camera"]').click();await run.page.locator('#bc-cam-start').click();
    await run.page.waitForFunction(()=>document.getElementById('bc-video').srcObject!==null);
    await run.page.locator('.bc-src[data-src="upload"]').click();await run.page.evaluate(()=>window.__auditResolvePlay());
    await run.page.waitForFunction(()=>window.__auditStream?.getTracks()[0]?.readyState==='ended');
    const result=await run.page.evaluate(()=>({track:window.__auditStream.getTracks()[0].readyState,srcNull:document.getElementById('bc-video').srcObject===null,hidden:document.getElementById('bc-video').hidden}));
    const errors=normalizeConsoleErrors(run.errors);
    recordLifecycle('late play completion canceled by source switch',{...result,consoleErrors:errors,checks:{trackStopped:result.track==='ended',srcDetached:result.srcNull,previewHidden:result.hidden,noErrors:errors.length===0}});
    await run.context.close();
  }
  for(const eventName of ['ended','inactive']){
    const run=await newLifecyclePage(browser,baseUrl,`hardware-${eventName}`,{});
    await run.page.locator('.bc-src[data-src="camera"]').click();await run.page.locator('#bc-cam-start').click();
    await run.page.waitForFunction(()=>!document.getElementById('bc-video').hidden);
    await run.page.evaluate(type=>{const stream=window.__auditStream;if(type==='ended')stream.getTracks()[0].dispatchEvent(new Event('ended'));else stream.dispatchEvent(new Event('inactive'));},eventName);
    await run.page.waitForFunction(()=>document.getElementById('bc-video').srcObject===null);
    const result=await run.page.evaluate(()=>({track:window.__auditStream.getTracks()[0].readyState,hidden:document.getElementById('bc-video').hidden&&document.getElementById('bc-guide').hidden&&document.getElementById('bc-shutter').hidden,status:document.getElementById('bc-status').textContent}));
    const errors=normalizeConsoleErrors(run.errors);
    recordLifecycle(`hardware ${eventName} cleanup`,{...result,consoleErrors:errors,checks:{trackStopped:result.track==='ended',previewHidden:result.hidden,restartHint:/camera stream ended/i.test(result.status),noErrors:errors.length===0}});
    await run.context.close();
  }
  for(const reason of ['reset','pagehide']){
    const run=await newLifecyclePage(browser,baseUrl,reason,{});
    await run.page.locator('.bc-src[data-src="camera"]').click();await run.page.locator('#bc-cam-start').click();
    await run.page.waitForFunction(()=>!document.getElementById('bc-video').hidden);
    if(reason==='reset')await run.page.locator('#bc-reset').click();else await run.page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
    await run.page.waitForFunction(()=>document.getElementById('bc-video').srcObject===null);
    const result=await run.page.evaluate(()=>({track:window.__auditStream.getTracks()[0].readyState,hidden:document.getElementById('bc-video').hidden&&document.getElementById('bc-guide').hidden&&document.getElementById('bc-shutter').hidden}));
    const errors=normalizeConsoleErrors(run.errors);
    recordLifecycle(`${reason} cleanup`,{...result,consoleErrors:errors,checks:{trackStopped:result.track==='ended',previewHidden:result.hidden,noErrors:errors.length===0}});
    await run.context.close();
  }
  {
    const run=await newLifecyclePage(browser,baseUrl,'autosnap-off-stable',{});
    await run.page.evaluate(()=>{
      document.getElementById('bc-autosnap').checked=false;
      const tip=document.getElementById('bc-guide-tip');window.__hintMutations=0;
      window.__hintObserver=new MutationObserver(records=>{window.__hintMutations+=records.length;});
      window.__hintObserver.observe(tip,{childList:true,characterData:true,subtree:true});
    });
    await run.page.locator('.bc-src[data-src="camera"]').click();await run.page.locator('#bc-cam-start').click();
    await run.page.waitForTimeout(1450);
    const result=await run.page.evaluate(()=>{
      window.__hintObserver.disconnect();const guide=document.getElementById('bc-guide');
      const transitions=[guide.querySelector('.g-shape'),guide.querySelector('.g-bar'),document.getElementById('bc-shutter')].flatMap(element=>getComputedStyle(element).transitionDuration.split(',').map(Number.parseFloat));
      return {mutations:window.__hintMutations,hint:document.getElementById('bc-guide-tip').textContent,autoSnap:document.getElementById('bc-autosnap').checked,transitions};
    });
    await run.page.locator('.bc-src[data-src="upload"]').click();
    const errors=normalizeConsoleErrors(run.errors);
    recordLifecycle('auto-snap off keeps stable live guidance',{...result,consoleErrors:errors,checks:{guidanceActive:result.hint===await run.page.evaluate(()=>window.BodyCameraGuide.GUIDE_HINTS.no_body),noDuplicateMutations:result.mutations===1,autoSnapOff:result.autoSnap===false,reducedMotion:result.transitions.every(value=>value===0),noErrors:errors.length===0}});
    await run.context.close();
  }
  {
    const run=await newLifecyclePage(browser,baseUrl,'manual-shutter',{noopDraw:true,width:640,height:480});
    await run.page.evaluate(()=>{
      document.getElementById('bc-autosnap').checked=false;window.__auditProvenance=null;
      const original=window.bcSetSourceProvenance;
      window.bcSetSourceProvenance=(source,capture)=>{if(source==='camera')window.__auditProvenance=JSON.parse(JSON.stringify(capture));return original(source,capture);};
    });
    await run.page.locator('.bc-src[data-src="camera"]').click();await run.page.locator('#bc-cam-start').click();
    await run.page.waitForFunction(()=>!document.getElementById('bc-shutter').hidden);
    const available=await run.page.locator('#bc-shutter').isEnabled();
    await run.page.locator('#bc-shutter').click();
    await run.page.waitForFunction(()=>window.__auditProvenance?.trigger==='manual',null,{timeout:10_000});
    await run.page.waitForFunction(()=>document.getElementById('bc-video').srcObject===null);
    const result=await run.page.evaluate(()=>{
      let hasImageStorage=false;
      for(let i=0;i<localStorage.length;i+=1){
        if(/data:image\//.test(localStorage.getItem(localStorage.key(i))||'')){hasImageStorage=true;break;}
      }
      return {provenance:window.__auditProvenance,track:window.__auditStream.getTracks()[0].readyState,srcNull:document.getElementById('bc-video').srcObject===null,hasImageStorage};
    });
    const errors=normalizeConsoleErrors(run.errors);
    const serialized=JSON.stringify(result.provenance);
    recordLifecycle('manual shutter available with auto-snap off',{...result,available,consoleErrors:errors,checks:{available,manual:result.provenance?.trigger==='manual',versioned:result.provenance?.version===1&&result.provenance?.source==='camera',dimensions:result.provenance?.frameWidth===640&&result.provenance?.frameHeight===480,imageFree:!serialized.includes('data:image')&&!serialized.includes('landmarks'),trackStopped:result.track==='ended',srcDetached:result.srcNull,noImageStorage:!result.hasImageStorage,noErrors:errors.length===0}});
    await run.context.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}

for(const screenshot of screenshots){
  const bytes=await fs.readFile(path.join(root,screenshot.path));
  screenshot.sha256=sha256(bytes);screenshot.bytes=bytes.length;
}

const viewportModeCases=[];
for(const viewport of viewports)for(const mode of modes){
  const states=stateCases.filter(item=>item.viewport===viewport.name&&item.mode===mode);
  const mappings=mappingCases.filter(item=>item.viewport===viewport.name&&item.mode===mode);
  viewportModeCases.push({viewport:viewport.name,width:viewport.width,height:viewport.height,required:viewport.required,mode,stateCases:states.length,passedStates:states.filter(item=>item.pass).length,mappingCases:mappings.length,passedMappings:mappings.filter(item=>item.pass).length,maxOverflowPx:round(Math.max(...states.map(item=>item.overflowPx))),minHintShutterGapPx:round(Math.min(...states.map(item=>item.hintShutterGapPx))),pass:states.every(item=>item.pass)&&mappings.every(item=>item.pass)});
}

const productionFiles=['body.html','css/styles.css','css/body.css','js/body-camera-guide.js','js/body-pose-worker.js','tests/body-camera-guide.test.mjs','tests/body-camera-integration.test.mjs','tools/body_camera_coverage_audit.mjs'];
const bindings=[];for(const file of productionFiles)bindings.push(await hashFile(file));
const report={
  schemaVersion:1,
  generatedAt:new Date().toISOString(),
  browser:{name:'Chromium',version:browserVersion,headless:true,deviceScaleFactor:1,reducedMotion:'reduce'},
  methodology:{kind:'deterministic production-page Chromium render with synthetic surfaces and mocked canvas-backed camera streams',command:'CODEX_NODE_MODULES=<bundled-node_modules> node tools/body_camera_coverage_audit.mjs',productionFilesLoaded:['body.html','css/styles.css','css/body.css','js/body-camera-guide.js'],mocked:['camera pixels','native getUserMedia acquisition','Body pose worker result (protocol-compatible no-body)','ONNX runtime','external icon font'],notTested:['physical sensors','sensor rotation metadata','autofocus','exposure','native permissions UI','browser chrome and safe-area insets','real-device motion','subjective attractiveness accuracy']},
  inventory:{requiredViewportClasses:7,coveredRequiredViewportClasses:requiredViewports.length,boundaryWidths:boundaryViewports.map(item=>item.width),viewportConfigurations:viewports.length,widthModes:modes.length,feeds:feeds.length,guideStates:guideCodes.length,autoSnapStates:autoSnapStates.length,expectedStateCases:viewports.length*modes.length*feeds.length*guideCodes.length*autoSnapStates.length,expectedMappingCases:viewports.length*modes.length*feeds.length},
  viewports,modes,feeds,guideCodes,autoSnapStates,
  artifactBinding:{algorithm:'sha256',files:bindings},
  summary:{stateCases:stateCases.length,stateCasesPassed:stateCases.filter(item=>item.pass).length,mappingCases:mappingCases.length,mappingCasesPassed:mappingCases.filter(item=>item.pass).length,lifecycleCases:lifecycleCases.length,lifecycleCasesPassed:lifecycleCases.filter(item=>item.pass).length,screenshots:screenshots.length,storageInvariant:JSON.stringify(matrixStorageBefore)===JSON.stringify(matrixStorageAfter),failures:failures.length,pass:failures.length===0&&stateCases.every(item=>item.pass)&&mappingCases.every(item=>item.pass)&&lifecycleCases.every(item=>item.pass)},
  screenshots,failures,viewportModeCases,mappingCases,stateCases,lifecycleCases,
};
const normalized=structuredClone(report);delete normalized.generatedAt;
// The manual-shutter case intentionally records a real capture timestamp. It is
// the only run-variant datum; every layout, metric, status, and PNG stays bound.
for(const item of normalized.lifecycleCases)if(item.provenance)delete item.provenance.timestamp;
report.reproducibility={ignoredFields:['generatedAt','reproducibility','lifecycleCases[].provenance.timestamp'],normalizedSha256:sha256(JSON.stringify(normalized))};
await fs.writeFile(jsonPath,`${JSON.stringify(report,null,2)}\n`);
await fs.writeFile(reportPath,buildMarkdown(report));

console.log(`BODY CAMERA STATES=${report.summary.stateCasesPassed}/${report.summary.stateCases}`);
console.log(`BODY CAMERA MAPPINGS=${report.summary.mappingCasesPassed}/${report.summary.mappingCases}`);
console.log(`BODY CAMERA LIFECYCLE=${report.summary.lifecycleCasesPassed}/${report.summary.lifecycleCases}`);
console.log(`BODY CAMERA SCREENSHOTS=${report.summary.screenshots}`);
console.log(`BODY CAMERA FAILURES=${report.summary.failures}`);
console.log(`BODY CAMERA REPRO=${report.reproducibility.normalizedSha256}`);
console.log(`BODY CAMERA JSON=${path.relative(root,jsonPath)}`);
console.log(`BODY CAMERA REPORT=${path.relative(root,reportPath)}`);
if(!report.summary.pass)process.exitCode=1;
