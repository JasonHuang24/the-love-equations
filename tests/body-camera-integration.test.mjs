import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');

const context = { globalThis: {} };
vm.runInNewContext(read('js/body-arm-band.js'), context, { filename: 'js/body-arm-band.js' });
vm.runInNewContext(read('js/body-camera-guide.js'), context, { filename: 'js/body-camera-guide.js' });
const guide = context.globalThis.BodyCameraGuide;
assert.equal(typeof guide.createCameraLifecycle, 'function');

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function eventTarget(target = {}) {
  const listeners = new Map();
  target.addEventListener = (type, listener) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type).add(listener);
  };
  target.removeEventListener = (type, listener) => listeners.get(type)?.delete(listener);
  target.emit = type => {
    for (const listener of [...(listeners.get(type) || [])]) listener({ type, target });
  };
  target.listenerCount = type => (listeners.get(type) || new Set()).size;
  return target;
}

function mockStream(name) {
  const track = eventTarget({ name: `${name}-track`, stopCount: 0 });
  track.stop = () => { track.stopCount += 1; };
  const stream = eventTarget({ name, active: true });
  stream.getTracks = () => [track];
  return { stream, track };
}

const tick = () => new Promise(resolve => setImmediate(resolve));

// A late permission grant belongs to the retired request generation: it is stopped and
// never attached, whether retirement came from source switch, reset, or pagehide.
for (const reason of ['source-switch', 'reset', 'pagehide']) {
  const permission = deferred();
  const candidate = mockStream(`late-${reason}`);
  const attached = [], live = [];
  const lifecycle = guide.createCameraLifecycle({
    getUserMedia: () => permission.promise,
    onAttach: stream => { attached.push(stream); },
    onLive: stream => { live.push(stream); }
  });
  const starting = lifecycle.start({ video: true });
  assert.equal(lifecycle.isRequesting(), true, `${reason}: request should be owned`);
  lifecycle.retire(reason);
  permission.resolve(candidate.stream);
  assert.equal(await starting, null, `${reason}: late permission must not become live`);
  assert.equal(candidate.track.stopCount, 1, `${reason}: late stream stopped exactly once`);
  assert.deepEqual(attached, [], `${reason}: stale stream was never attached`);
  assert.deepEqual(live, [], `${reason}: stale stream was never exposed live`);
}

// play() is another asynchronous ownership boundary. Retiring while it is pending must
// detach and stop the candidate, and its eventual completion cannot resurrect the preview.
{
  const candidate = mockStream('late-play');
  const play = deferred();
  const detached = [], live = [];
  const lifecycle = guide.createCameraLifecycle({
    getUserMedia: async () => candidate.stream,
    onAttach: () => play.promise,
    onDetach: (stream, reason) => detached.push([stream?.name || null, reason]),
    onLive: stream => live.push(stream.name)
  });
  const starting = lifecycle.start({ video: true });
  await tick();
  assert.equal(candidate.track.listenerCount('ended'), 1);
  lifecycle.retire('source-switch');
  play.resolve();
  assert.equal(await starting, null);
  assert.equal(candidate.track.stopCount, 1);
  assert.deepEqual(live, []);
  assert.ok(detached.some(([, reason]) => reason === 'source-switch'));
  assert.equal(lifecycle.snapshot().live, false);
}


// Browser edge cases can yield an already-inactive stream or let the camera lane become
// unselected without dispatching the usual tab callback. Neither may wedge requesting=true.
{
  const inactive = mockStream('already-inactive');
  inactive.stream.active = false;
  const lifecycle = guide.createCameraLifecycle({
    getUserMedia: async () => inactive.stream,
    onAttach: async () => {}
  });
  assert.equal(await lifecycle.start({ video: true }), null);
  assert.equal(inactive.track.stopCount, 1);
  assert.equal(lifecycle.isRequesting(), false);
}
{
  const candidate = mockStream('selection-flip');
  const play = deferred();
  let selected = true;
  const lifecycle = guide.createCameraLifecycle({
    getUserMedia: async () => candidate.stream,
    canActivate: () => selected,
    onAttach: () => play.promise
  });
  const starting = lifecycle.start({ video: true });
  await tick();
  selected = false;
  play.resolve();
  assert.equal(await starting, null);
  assert.equal(candidate.track.stopCount, 1);
  assert.equal(lifecycle.isRequesting(), false);
}
// Hardware-ended and stream-inactive events retire the exact active owner and remove
// listeners. These are the two browser event shapes observed across MediaStream engines.
for (const eventName of ['ended', 'inactive']) {
  const candidate = mockStream(`hardware-${eventName}`);
  const reasons = [];
  const lifecycle = guide.createCameraLifecycle({
    getUserMedia: async () => candidate.stream,
    onAttach: async () => {},
    onRetire: reason => reasons.push(reason)
  });
  const owner = await lifecycle.start({ video: true });
  assert.ok(owner && lifecycle.owns(owner.stream, owner.generation));
  if (eventName === 'ended') candidate.track.emit('ended');
  else candidate.stream.emit('inactive');
  assert.equal(lifecycle.snapshot().live, false);
  assert.equal(candidate.track.stopCount, 1);
  assert.equal(reasons.at(-1), eventName);
  assert.equal(candidate.track.listenerCount('ended'), 0);
}

// Restart retires the old stream before acquiring the new one. Capture ownership is a
// snapshot, so no frame can commit after that source owner has been retired.
{
  const first = mockStream('first');
  const second = mockStream('second');
  const queue = [first.stream, second.stream];
  const lifecycle = guide.createCameraLifecycle({
    getUserMedia: async () => queue.shift(),
    onAttach: async () => {}
  });
  const owner1 = await lifecycle.start({ video: true });
  assert.equal(lifecycle.owns(owner1.stream, owner1.generation), true);
  const owner2 = await lifecycle.start({ video: true });
  assert.equal(first.track.stopCount, 1);
  assert.equal(lifecycle.owns(owner1.stream, owner1.generation), false,
    'retired capture owner must not be allowed to commit');
  assert.equal(lifecycle.owns(owner2.stream, owner2.generation), true);
  lifecycle.retire('reset');
  assert.equal(second.track.stopCount, 1);
  assert.equal(lifecycle.owns(owner2.stream, owner2.generation), false);
}

// A rejected play() is a complete failure path: detach, stop once, expose the error, and
// leave neither requesting nor live state behind.
{
  const candidate = mockStream('play-error');
  const errors = [], detached = [];
  const lifecycle = guide.createCameraLifecycle({
    getUserMedia: async () => candidate.stream,
    onAttach: async () => { throw new Error('NotAllowed during play'); },
    onDetach: (_stream, reason) => detached.push(reason),
    onError: error => errors.push(error.message)
  });
  assert.equal(await lifecycle.start({ video: true }), null);
  assert.equal(candidate.track.stopCount, 1);
  assert.ok(detached.includes('start-error'));
  assert.deepEqual(errors, ['NotAllowed during play']);
  assert.deepEqual({ requesting: lifecycle.snapshot().requesting, live: lifecycle.snapshot().live },
    { requesting: false, live: false });
}

const page = read('body.html');
const css = read('css/body.css');
const worker = read('js/body-pose-worker.js');

// Compile the production module body without executing its DOM bindings. Top-level ESM
// imports are syntax-checked by Node when the helper tests load those modules; vm.Script checks
// the remaining production bindings without requiring a DOM-aware module linker here.
const moduleMatch = page.match(/<script type="module">([\s\S]*?)<\/script>/);
assert.ok(moduleMatch, 'Body production module should be present');
const scriptBody = moduleMatch[1].replace(/^\s*import\s+[^;]+;\s*$/gm, '');
new vm.Script(scriptBody, { filename: 'body.html camera/vision module' });
assert.match(moduleMatch[1], /from ['"]\.\/js\/body-model-integrity\.js['"]/,
  'production module must import the hash-bound Body model loader');

assert.ok(page.indexOf('js/body-camera-guide.js') < page.indexOf('<script type="module">'),
  'DOM-free guide must load before camera bindings');
assert.doesNotMatch(moduleMatch[1], /import\s*\{[^}]*DrawingUtils|tasks-vision[^\n]*import/,
  'page must not have a cosmetic top-level MediaPipe import dependency');
assert.match(page, /aria-live="polite" aria-atomic="true"/);
assert.match(page, /class="bc-srcs" role="group" aria-label="Photo source"/);
assert.match(page, /id="bc-url" aria-label="Image URL"/);
assert.match(page, /id="bc-video"[^>]*aria-label="Mirrored live camera preview"/);
assert.match(page, /id="bc-canvas" role="img" aria-label="Selected body photo for analysis"/);
assert.match(page, /id="bc-shutter"[^>]*aria-label="Capture photo manually"[^>]*aria-describedby="bc-guide-tip"/);
assert.match(css, /\.bc-src:focus-visible/);

// The worker publishes its authoritative quality before segmentation, and every partial
// host path preserves that value. Missing quality is unverified, never default full/pass.
const qualityPost = worker.indexOf("self.postMessage({type:'quality',id,quality})");
assert.ok(qualityPost > worker.indexOf('quality=assessPose('));
assert.ok(qualityPost < worker.indexOf('personSegmenter.segment('));
assert.match(page, /active\.quality = message\.quality \|\| null/);
assert.match(page, /quality:message\.quality \|\| active\.quality \|\| null/);
assert.match(page, /quality:active\.quality \|\| null/);
assert.match(page, /cause\('pose-quality-unverified'\)/);
assert.match(page, /const framing = poseResult\.quality\.framing/);
assert.match(page, /const gateBand = poseResult\.quality\.band/);
assert.doesNotMatch(page, /poseResult\.quality[^\n]*\|\|\s*'full'/);
assert.doesNotMatch(page, /poseResult\.quality[^\n]*\|\|\s*'pass'/);

const alignStart = page.indexOf('async function alignTick(owner)');
const captureStart = page.indexOf('async function captureFrame(trigger)', alignStart);
const alignBlock = page.slice(alignStart, captureStart);
assert.ok(alignStart > 0 && captureStart > alignStart);
assert.doesNotMatch(alignBlock, /!autoSnapChk\.checked\s*\|\|/,
  'auto-snap off must not disable alignment guidance');
assert.match(alignBlock, /showAlignment\(read\.alignment\)/);
assert.match(page, /if \(guideTip\.textContent !== hint\) guideTip\.textContent=hint/,
  'identical aria-live hints must not be rewritten');
assert.match(page, /captureFrame\('manual'\)/);
assert.match(page, /captureFrame\('auto'\)/);
assert.match(page, /cameraLifecycle\.owns\(owner\.stream,owner\.generation\)/);
assert.match(page, /CameraGuide\.makeCaptureProvenance\(/);
assert.match(page, /claimSource\('camera',provenance\)/);
assert.match(page, /video\.pause\(\)/);
assert.match(page, /video\.srcObject=null/);
assert.match(page, /window\.addEventListener\('pagehide',[\s\S]*?window\.bcCancelAnalysis\('pagehide'\)/);
assert.match(page, /function cancelAnalysis\(reason\)[\s\S]*?window\.bcStopCamera\(retireReason\)[\s\S]*?currentGen\+\+[\s\S]*?pendingTensor = null/,
  'reset and pagehide retire camera, source generation, and pending inference together');

for (const source of ['upload', 'drop', 'paste', 'url', 'camera']) {
  assert.ok(page.includes(`'${source}'`), `source provenance includes ${source}`);
}
assert.match(page, /const sourceGen=claimSource\(/);
assert.match(page, /sourceGen===currentGen/);
const settleSourceMatch = page.match(/function settlePendingSourceDecode\(sourceGen\)\{[\s\S]*?\n    \}/);
assert.ok(settleSourceMatch, 'pending source decode must use a generation-owned settlement helper');
const settleSourceContext = {};
vm.runInNewContext(
  `let pendingSourceDecodeGen=12; ${settleSourceMatch[0]};
   globalThis.stale=settlePendingSourceDecode(11);
   globalThis.afterStale=pendingSourceDecodeGen;
   globalThis.current=settlePendingSourceDecode(12);
   globalThis.afterCurrent=pendingSourceDecodeGen;`,
  settleSourceContext
);
assert.equal(settleSourceContext.stale, false);
assert.equal(settleSourceContext.afterStale, 12);
assert.equal(settleSourceContext.current, true);
assert.equal(settleSourceContext.afterCurrent, null);
assert.match(page, /function claimSource\(source,captureProvenance\)[\s\S]*?pendingSourceDecodeGen=null/);
assert.match(page, /function cancelAnalysis\(reason\)[\s\S]*?pendingSourceDecodeGen=null/);
assert.match(page, /function loadFile\(file,source\)[\s\S]*?pendingSourceDecodeGen=sourceGen[\s\S]*?img\.onload=.*settlePendingSourceDecode\(sourceGen\)[\s\S]*?img\.onerror=.*settlePendingSourceDecode\(sourceGen\)/);
assert.match(page, /function loadFromUrl\(u\)[\s\S]*?pendingSourceDecodeGen=sourceGen[\s\S]*?img\.onload=.*settlePendingSourceDecode\(sourceGen\)[\s\S]*?img\.onerror=.*settlePendingSourceDecode\(sourceGen\)/);
const sourceBatchGuard = page.indexOf('if (pendingSourceDecodeGen != null || cameraLifecycle.isRequesting()');
const batchSnapshot = page.indexOf('const snap = snapshot();', sourceBatchGuard);
assert.ok(sourceBatchGuard > 0 && batchSnapshot > sourceBatchGuard,
  'batch must refuse pending decode/camera work before taking its restorable snapshot');
assert.match(page.slice(sourceBatchGuard, batchSnapshot), /cameraState\.live \|\| captureBusy/);
assert.match(page, /cameraTab\.addEventListener\('click',retireForCameraPreview\)/);
assert.match(page, /function retireForCameraPreview\(\)[\s\S]*loadSeq\+\+[\s\S]*currentGen\+\+[\s\S]*pendingSourceDecodeGen=null/);
assert.match(page, /const appendAttempt = BC\.addMode === true/);
assert.match(page, /if \(!appendAttempt\)\{[\s\S]*?window\.bcResetResult/,
  'a non-append source clears the prior in-memory and persisted identity immediately');
assert.match(page, /window\.bcRetirePersistedBody = bcDropPersistedBody/);
assert.match(page, /analysisLease\.claim\(gen\)/);
assert.match(page, /analysisLease\.release\(gen\)/);
assert.match(page, /createImageBitmap\(canvas\)[\s\S]*?analysisLease\.owns\(gen\)[\s\S]*?runPoseInWorker\(bitmap, gen, false/,
  'rapid replacement is checked after bitmap creation and before pose-worker dispatch');
assert.match(page, /const optionalSexPending[\s\S]*?if \(bcBusy \|\| activePose \|\| analysisLease\.activeGeneration\(\) != null \|\| BC\.photoPending/,
  'batch starts only after the single-shot generation/model/sex work settles');

// Pixels are not restored until the complete persisted envelope has been accepted. The
// raw record is size-gated before JSON.parse, and the sanitized image is the only source.
const restoreStart = page.indexOf('function bcRestoreShot()');
const restoreEnd = page.indexOf('bcRestoreShot();', restoreStart);
const restore = page.slice(restoreStart, restoreEnd);
assert.ok(restore.indexOf('raw.length > maxStoredChars') < restore.indexOf('JSON.parse(raw)'));
assert.ok(restore.indexOf('window.bcRestoreSavedEnvelope(saved)') < restore.indexOf('im.src = clean.img'));
assert.match(restore, /const restoreGeneration = currentGen;[\s\S]*const restoreLoadSequence = loadSeq;/);
const restoreOnload = restore.indexOf('im.onload = () => {');
const restoreOnerror = restore.indexOf('im.onerror = () => {');
assert.ok(restore.indexOf('if (!restoreIsCurrent()) return;', restoreOnload)
  < restore.indexOf('canvas.width = clean.width', restoreOnload));
assert.ok(restore.indexOf('if (!restoreIsCurrent()) return;', restoreOnerror)
  < restore.indexOf("localStorage.removeItem('loveEquations.bodyShot.v1')", restoreOnerror));
assert.doesNotMatch(restore, /im\.src\s*=\s*saved\.img/);
assert.doesNotMatch(restore, /bcRestoreState|bcSetShot/);
const batchRestoreStart = page.indexOf('function restore(s)');
const batchRestoreEnd = page.indexOf('// ---- run ----', batchRestoreStart);
const batchRestore = page.slice(batchRestoreStart, batchRestoreEnd);
assert.ok(batchRestoreStart > 0 && batchRestoreEnd > batchRestoreStart);
assert.match(batchRestore, /const restoreGeneration = currentGen;[\s\S]*const restoreLoadSequence = loadSeq;/);
const batchRestoreOnload = batchRestore.indexOf('im.onload=()=>{');
const batchRestoreGuard = batchRestore.indexOf('if (restoreGeneration !== currentGen || restoreLoadSequence !== loadSeq) return;', batchRestoreOnload);
const batchRestoreDraw = batchRestore.indexOf("drawImage(im,0,0,s.w,s.h)", batchRestoreOnload);
assert.ok(batchRestoreOnload >= 0 && batchRestoreGuard > batchRestoreOnload && batchRestoreGuard < batchRestoreDraw,
  'late batch snapshot decode cannot overwrite a newer source');

assert.match(page, /const keepSource = BC\.source/);
assert.match(page, /bcSetSourceProvenance\(keepSource, keepCapture\)/);
assert.match(page, /const batchGen=claimSource\('upload',null\)/);
assert.match(page, /handleImage\(img,batchGen\)/);

// Camera CSS binds the stage to the exact feed aspect, keeps the live hint away from the
// lower-right manual shutter, covers the 980/981 squeeze, caps 4K width, and honors motion.
assert.match(css, /max-width:\s*min\(var\(--container\),\s*90rem\)/);
const stackBreakpoint = css.match(/@media \(max-width:\s*(\d+)px\)\s*\{\s*\.bc-grid/);
assert.ok(stackBreakpoint && Number(stackBreakpoint[1]) >= 1024 && Number(stackBreakpoint[1]) <= 1200,
  'calculator grid must stack by the tablet/small-desktop squeeze');
assert.match(css, /\.bc-stage\.is-camera[\s\S]*aspect-ratio:\s*var\(--bc-feed-ratio/);
assert.match(css, /\.bc-guide-tip\s*\{[\s\S]*top:\s*0\.55rem/);
assert.match(css, /\.bc-shutter\s*\{[\s\S]*right:\s*0\.8rem/);
assert.match(css, /\.bc-guide\.is-ready[^{]*\{\s*stroke:\s*#55e6a5/);
assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.bc-shutter\s*\{\s*transition:\s*none/);
assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length,
  'camera CSS edit must leave balanced blocks');

console.log('body-camera-integration: lifecycle cancellation, hardware cleanup, guide wiring, provenance, restore, and CSS contracts passed');
