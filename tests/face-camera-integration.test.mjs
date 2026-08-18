import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'face.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'css', 'face.css'), 'utf8');

function includes(fragment, message) {
  assert.ok(html.includes(fragment), message);
}

function matches(expression, message) {
  assert.match(html, expression, message);
}

// Shared pure geometry must load synchronously before the production inline pipeline.
const cropScript = html.indexOf('src="js/face-crop.js?v=1.0"');
const cameraScript = html.indexOf('src="js/face-camera-guide.js?v=1.0"');
const productionModule = html.indexOf('<script type="module">');
assert.ok(cropScript >= 0 && cameraScript > cropScript && productionModule > cameraScript);

// Live guidance runs independently of the auto-snap preference, but capture needs three stable passes.
includes('const ALIGN_EVERY_MS=350, ALIGN_STREAK_NEEDED=3;', 'three stable passes stay mandatory');
includes('return CameraGuide.evaluateCameraAlignment(lm,frameWidth,frameHeight,geo,{ mirrored:true });',
  'the shared live/manual classifier uses exact guide mapping against full feed dimensions');
includes('alignStreak=lastAlignment.ready&&autoSnapChk.checked ? alignStreak+1 : 0;',
  'a miss or disabled auto-snap resets the stable-pass streak');
includes("if (autoSnapChk.checked&&alignStreak>=ALIGN_STREAK_NEEDED){ captureFrame('auto'); return; }",
  'auto capture is gated on the stable-pass threshold');
assert.ok(!/if\s*\(\s*!autoSnapChk\.checked[^)]*\)\s*\{[^}]*schedule\(\)/s.test(html),
  'turning auto-snap off must not disable actionable live hints');

// Both capture paths freeze first, then classify those exact pixels for image-free provenance.
includes("shutter.addEventListener('click',()=>captureFrame('manual'));", 'manual shutter stays wired');
matches(/tmp\.getContext\('2d'\)\.drawImage\(video,0,0,w,h\);[\s\S]*?captureAlignment=detectCameraAlignment\(tmp,w,h\)[\s\S]*?makeCaptureProvenance\(mode,captureAlignment,w,h\)/,
  'manual and automatic provenance are recomputed from the exact frozen full-resolution frame');
const captureBody = html.slice(html.indexOf('function captureFrame(trigger)'), html.indexOf("shutter.addEventListener", html.indexOf('function captureFrame(trigger)')));
assert.ok(!/if\s*\(\s*mode\s*===/.test(captureBody), 'the frozen-frame classifier is unconditional for both auto and manual');
assert.ok(html.indexOf("captureAlignment=detectCameraAlignment(tmp,w,h)") < html.indexOf('window.lcStopCamera();', html.indexOf('function captureFrame')),
  'frozen-frame classification completes before the stream is stopped');
includes('&& !captureProvenance.guidePassed;', 'any exact capture that misses the guide is retained as reliability provenance');
includes("captureProvenance.trigger === 'auto' ? 'automatic' : 'manual'", 'the reliability caveat names the actual capture path');

// Full-resolution pixels are captured first. Only the detection/display canvas is width-limited;
// the downstream model crop resolves srcEl.width/height and therefore samples the full temporary frame.
matches(/const w=video\.videoWidth,h=video\.videoHeight;[\s\S]*?tmp\.width=w; tmp\.height=h;[\s\S]*?drawImage\(video,0,0,w,h\)/,
  'camera frame must be copied at the feed\'s full resolution');
includes('drawAndScore(tmp,Math.round(w*scale),Math.round(h*scale),provenance);',
  'only analysis dimensions are scaled when the full-resolution source is handed downstream');
includes('const srcW = srcEl.naturalWidth || srcEl.width || W;', 'model crop derives native source width from the full-resolution source');
includes('const srcH = srcEl.naturalHeight || srcEl.height || H;', 'model crop derives native source height from the full-resolution source');
includes('const cropped = cropFaceTensor(srcEl,lm,srcW,srcH);', 'headline tensor crop uses native source dimensions');
includes('sourceWidth:srcW, sourceHeight:srcH, analysisWidth:W, analysisHeight:H',
  'debug provenance exposes native-versus-analysis dimensions');

// Camera ownership is generation-safe across pending permission, tab switches, pagehide, and hardware end.
includes('let camRequesting=false, cameraRequestGen=0;', 'pending acquisition has a cancellation generation');
includes('if (requestGen !== cameraRequestGen || !cameraLaneSelected()) { stopMediaStream(s); return; }',
  'a permission result cannot reopen a camera lane the user already left');
includes("window.addEventListener('pagehide', () => window.lcStopCamera());", 'pagehide closes or invalidates the camera');
includes("track.addEventListener('ended',ended)", 'hardware track end is observed');
includes("candidate.addEventListener('inactive',ended)", 'stream inactivity is observed');
matches(/window\.lcStopCamera=function\(\)\{[\s\S]*?cameraRequestGen\+\+;[\s\S]*?video\.srcObject=null;[\s\S]*?stopMediaStream\(activeStream\)/,
  'stop invalidates pending acquisition, detaches preview media, and stops active tracks');

// Source and restore boundaries cannot leave an earlier face/result paired with a newer canvas.
includes('window.lcRetireForPendingSource();', 'accepted input retires the prior UI/storage/composite before model availability checks');
assert.ok(html.indexOf('window.lcRetireForPendingSource();') < html.indexOf('if (!landmarker){', html.indexOf('function drawAndScore')),
  'pending-source retirement precedes the detector-loading early return');
includes('const clean=sanitizeFaceRestoreState(s);', 'restore passes through the DOM-free finite schema sanitizer');
includes("/^data:image\\/(?:jpeg|png|webp);base64,/i.test(saved.img)", 'restore accepts only local raster data URLs');
includes("localStorage.removeItem('loveEquations.faceShot.v2')", 'invalid saved payloads are removed');

// Accessibility and final repaired shallow-feed layout are production contracts, not screenshot-only facts.
includes('role="status" aria-live="polite" aria-atomic="true"', 'live hint is announced as one polite status');
includes('if (guideTip.textContent !== next.hint) guideTip.textContent=next.hint;',
  'unchanged hints do not repeatedly mutate the polite live region');
assert.match(css, /\.lc-guide\.is-ready \.g-shape[\s\S]*stroke:\s*#55e6a5/i, 'ready guide has distinct green styling');
assert.match(css, /\.lc-guide-tip\s*\{[\s\S]*top:\s*0\.25rem/, 'hint remains in the safe top band');
assert.match(css, /\.lc-shutter\s*\{[\s\S]*right:\s*0\.55rem[\s\S]*width:\s*48px;\s*height:\s*48px/, 'shutter remains a clear lower-right touch target');
const transitionRule = css.indexOf('.lc-guide .g-shape {');
const reducedGuideRule = css.lastIndexOf('@media (prefers-reduced-motion: reduce)');
assert.ok(transitionRule >= 0 && reducedGuideRule > transitionRule, 'reduced-motion guide override follows the animated declarations in the cascade');
assert.match(css.slice(reducedGuideRule), /\.lc-guide \.g-shape, \.lc-guide \.g-bar, \.lc-guide-tip \{ transition: none; \}/,
  'reduced-motion users get no guide/hint transitions');

console.log('face-camera-integration: stable auto-snap, exact auto/manual provenance, lifecycle, restore retirement, accessibility, and reduced motion passed');
