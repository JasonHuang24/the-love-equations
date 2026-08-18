import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(ROOT, 'face.html'), 'utf8');
const start = html.indexOf('    (function lcBatchMode(){');
const close = html.indexOf('    })();', start);
assert.ok(start >= 0 && close > start, 'debug batch IIFE must be present');
const batchSource = html.slice(start, close + '    })();'.length);

class MemoryStorage {
  constructor(entries = []) { this.values = new Map(entries); }
  get length() { return this.values.size; }
  key(index) { return Array.from(this.values.keys())[index] ?? null; }
  getItem(key) { return this.values.has(String(key)) ? this.values.get(String(key)) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
  clear() { this.values.clear(); }
}

function classList() {
  const values = new Set();
  return {
    add: (...items) => items.forEach(item => values.add(item)),
    remove: (...items) => items.forEach(item => values.delete(item)),
    contains: item => values.has(item),
    toggle: (item, force) => {
      const on = force == null ? !values.has(item) : !!force;
      if (on) values.add(item); else values.delete(item);
      return on;
    }
  };
}

function element(overrides = {}) {
  return Object.assign({
    hidden: false,
    disabled: false,
    innerHTML: '',
    textContent: '',
    value: '',
    classList: classList(),
    addEventListener() {},
    appendChild() {},
    remove() {},
    click() {},
    select() {}
  }, overrides);
}

const elements = new Map([
  ['lc-batch', element({ hidden: true })],
  ['lc-batch-table', element()],
  ['lc-batch-status', element()],
  ['lc-batch-csv', element()],
  ['lc-batch-md', element()],
  ['lc-batch-clear', element()],
  ['lc-batch-run', element()],
  ['lc-batch-file', element()],
  ['lc-batch-drop', element()],
  ['lc-status', element({ innerHTML: 'pre-batch status' })]
]);

const canvas = element({
  hidden: true,
  width: 520,
  height: 390,
  toDataURL: () => 'data:image/jpeg;base64,stub',
  getContext: () => ({ drawImage() {} })
});
const stage = element();
const video = element({ hidden: true });
const localStorage = new MemoryStorage([
  ['loveEquations.keep', 'app-original'],
  ['unrelated.keep', 'external-original']
]);
const sessionStorage = new MemoryStorage([['session.keep', 'session-original']]);
const lcState = {
  geo: null,
  gate: null,
  sex: null,
  sexConf: null,
  sexSource: '',
  reliability: '',
  captureProvenance: null
};

let windowObject;
function attemptPersistentMutations() {
  localStorage.setItem('loveEquations.keep', 'changed');
  localStorage.setItem('unrelated.keep', 'changed');
  localStorage.setItem('new.unrelated.key', 'created');
  localStorage.removeItem('unrelated.keep');
  localStorage.clear();
}

function validDiagnostics() {
  windowObject.__lcLastFrameDiagnostic = {
    sourceWidth: 4000,
    sourceHeight: 3000,
    analysisWidth: 520,
    analysisHeight: 390
  };
  windowObject.__lcLastCropDiagnostic = {
    requestedFits: true,
    sourceSize: { width: 4000, height: 3000 },
    sourceRect: { x: 0, y: 25, width: 1000, height: 1000 },
    cropRect: { width: 1000 },
    shift: { x: 12.345, y: -4.5 },
    padding: {
      sourcePixels: { left: 0, top: 0, right: 0, bottom: 0 },
      areaFraction: 0
    },
    face: { visibleAreaFraction: 1 }
  };
  lcState.captureProvenance = {
    source: 'camera',
    trigger: 'manual',
    guidePassed: false,
    alignmentCode: 'center_face',
    frameWidth: 1920,
    frameHeight: 1080,
    alignmentMetrics: {
      faceScale: 0.91,
      centerOffsetDisplay: -4.25,
      centerOffsetRaw: 4.25,
      eyeLineOffset: 1.5,
      rollDeg: 2.75,
      yawDeg: 3,
      poseSkew: 0.04
    }
  };
}

function invalidDiagnostics() {
  windowObject.__lcLastFrameDiagnostic = {
    sourceWidth: Infinity,
    sourceHeight: NaN,
    analysisWidth: -Infinity,
    analysisHeight: NaN
  };
  windowObject.__lcLastCropDiagnostic = {
    requestedFits: true,
    sourceSize: { width: 100, height: 100 },
    sourceRect: { x: Infinity, y: 0, width: 10, height: 10 },
    cropRect: { width: Infinity },
    shift: { x: NaN, y: -Infinity },
    padding: {
      sourcePixels: { left: NaN, top: Infinity, right: -Infinity, bottom: NaN },
      areaFraction: Infinity
    },
    face: { visibleAreaFraction: NaN }
  };
  lcState.captureProvenance = {
    source: 'camera',
    trigger: 'auto',
    guidePassed: true,
    alignmentCode: 'ready',
    frameWidth: Infinity,
    frameHeight: NaN,
    alignmentMetrics: {
      faceScale: NaN,
      centerOffsetDisplay: Infinity,
      centerOffsetRaw: -Infinity,
      eyeLineOffset: NaN,
      rollDeg: Infinity,
      yawDeg: -Infinity,
      poseSkew: NaN
    }
  };
}

class FakeImage {
  set src(value) {
    this._src = value;
    queueMicrotask(() => {
      if (String(value).includes('decode-error')) this.onerror?.(new Error('decode failure'));
      else this.onload?.();
    });
  }
  get src() { return this._src; }
}

windowObject = {
  lcState,
  lcSetStatus() {},
  lcSetModelScore() {},
  lcSetSex() {},
  scoreFromRaw: raw => raw + 5,
  renderResult: () => localStorage.setItem('render-result-write', 'blocked'),
  lcClearCanvas: () => { canvas.hidden = true; },
  batchToCSV: (rows, columns) => [
    columns.map(column => column.label).join(','),
    ...rows.map(row => columns.map(column => row[column.key]).join(','))
  ].join('\n'),
  batchToMarkdown: () => ''
};

const documentObject = {
  getElementById: id => elements.get(id) || element(),
  createElement: () => element(),
  body: element(),
  execCommand: () => true
};

const dependencyState = {
  canvas,
  stage,
  video,
  handleImage(image) {
    attemptPersistentMutations();
    if (image.src.includes('pipeline-error')) throw new Error('synthetic pipeline failure');
    if (image.src.includes('refused')) {
      lcState.geo = null;
      windowObject.lcSetStatus('<b>off axis</b>', true);
      return;
    }
    lcState.geo = { measured: true };
    lcState.sex = 'f';
    lcState.sexConf = image.src.includes('nonfinite') ? Infinity : 0.91;
    lcState.sexSource = 'model';
    lcState.reliability = 'clean read';
    if (image.src.includes('nonfinite')) {
      invalidDiagnostics();
      windowObject.lcSetModelScore(null, NaN);
    } else {
      validDiagnostics();
      windowObject.lcSetModelScore(7.345, 2.345);
    }
  }
};

const sandbox = {
  window: windowObject,
  document: documentObject,
  location: { search: '?debug', hostname: '127.0.0.1' },
  Storage: MemoryStorage,
  localStorage,
  sessionStorage,
  Image: FakeImage,
  URL: {
    createObjectURL: file => file.name,
    revokeObjectURL() {}
  },
  Blob: class Blob {},
  navigator: { clipboard: { writeText: async () => {} } },
  console: { log() {}, error() {} },
  setTimeout,
  clearTimeout,
  queueMicrotask,
  isFinite,
  __deps: dependencyState
};
vm.createContext(sandbox);
vm.runInContext(`
  let canvas=__deps.canvas, stage=__deps.stage, video=__deps.video;
  let session=null, modelState='idle', sexSession=null;
  let currentGen=0, pendingTensor=null, pendingSexTensor=null;
  let framingAutoOverride=false;
  function handleImage(image){ return __deps.handleImage(image); }
  ${batchSource}
`, sandbox, { filename: 'face-batch-extract.js' });

const columns = Array.from(windowObject.__lcBatchColumns);
const requiredColumns = [
  'filename', 'timestamp', 'outcome', 'refusal', 'model_raw', 'bp', 'cv', 'sex', 'sex_conf', 'sex_source', 'reliability',
  'source_width', 'source_height', 'analysis_width', 'analysis_height',
  'crop_requested_fits', 'crop_source_contained', 'crop_side_px', 'crop_shift_x_px', 'crop_shift_y_px',
  'crop_pad_left_px', 'crop_pad_top_px', 'crop_pad_right_px', 'crop_pad_bottom_px',
  'crop_padding_area_pct', 'crop_face_visible_pct',
  'capture_source', 'capture_trigger', 'guide_passed', 'alignment_code', 'camera_frame_width', 'camera_frame_height',
  'guide_face_scale', 'guide_center_offset_display', 'guide_center_offset_raw', 'guide_eye_line_offset',
  'guide_roll_deg', 'guide_yaw_deg', 'guide_pose_skew'
];
assert.deepEqual(columns, requiredColumns, 'batch schema must expose every requested diagnostic exactly once');

const beforeStorage = windowObject.__lcBatchLS();
await windowObject.__lcBatchRun([
  { name: 'scored.jpg', type: 'image/jpeg' },
  { name: 'refused.jpg', type: 'image/jpeg' },
  { name: 'decode-error.jpg', type: 'image/jpeg' },
  { name: 'pipeline-error.jpg', type: 'image/jpeg' },
  { name: 'nonfinite.jpg', type: 'image/jpeg' }
]);

assert.equal(windowObject.__lcBatchStorageUnchanged, true, 'full localStorage snapshot must remain unchanged');
assert.equal(windowObject.__lcBatchLS(), beforeStorage, 'app and unrelated localStorage values must be identical');
assert.equal(localStorage.getItem('loveEquations.keep'), 'app-original');
assert.equal(localStorage.getItem('unrelated.keep'), 'external-original');
assert.equal(localStorage.getItem('new.unrelated.key'), null);
assert.equal(sessionStorage.getItem('session.keep'), 'session-original', 'persistent-storage guard must not corrupt sessionStorage');

const rows = Array.from(windowObject.__lcBatchRows);
assert.equal(rows.length, 5);
for (const row of rows) {
  assert.deepEqual(Object.keys(row), columns, `${row.filename}: every output column must be present`);
  assert.ok(Object.values(row).every(value => typeof value === 'string'), `${row.filename}: cells must be normalized strings`);
}

const scored = rows.find(row => row.filename === 'scored.jpg');
assert.equal(scored.outcome, 'scored');
assert.equal(scored.source_width, '4000');
assert.equal(scored.analysis_height, '390');
assert.equal(scored.crop_requested_fits, 'true');
assert.equal(scored.crop_source_contained, 'true');
assert.equal(scored.crop_side_px, '1000');
assert.equal(scored.crop_shift_x_px, '12.35');
assert.equal(scored.crop_padding_area_pct, '0');
assert.equal(scored.crop_face_visible_pct, '100');
assert.equal(scored.capture_source, 'camera');
assert.equal(scored.capture_trigger, 'manual');
assert.equal(scored.guide_passed, 'false');
assert.equal(scored.alignment_code, 'center_face');
assert.equal(scored.camera_frame_width, '1920');
assert.equal(scored.guide_center_offset_raw, '4.25');

for (const filename of ['refused.jpg', 'decode-error.jpg', 'pipeline-error.jpg']) {
  const row = rows.find(candidate => candidate.filename === filename);
  assert.ok(row, `${filename}: row must exist`);
  for (const key of requiredColumns.slice(11)) assert.equal(row[key], '', `${filename}.${key} must be an explicit blank`);
}

const nonfinite = rows.find(row => row.filename === 'nonfinite.jpg');
for (const key of ['model_raw', 'bp', 'cv', 'sex_conf', 'source_width', 'source_height', 'analysis_width', 'analysis_height',
  'crop_source_contained', 'crop_side_px', 'crop_shift_x_px', 'crop_shift_y_px', 'crop_pad_left_px', 'crop_pad_top_px',
  'crop_pad_right_px', 'crop_pad_bottom_px', 'crop_padding_area_pct', 'crop_face_visible_pct', 'camera_frame_width',
  'camera_frame_height', 'guide_face_scale', 'guide_center_offset_display', 'guide_center_offset_raw', 'guide_eye_line_offset',
  'guide_roll_deg', 'guide_yaw_deg', 'guide_pose_skew']) {
  assert.equal(nonfinite[key], '', `nonfinite.${key} must not propagate NaN/Infinity`);
}
assert.doesNotMatch(windowObject.__lcBatchCSV(), /(?:^|,)\s*(?:NaN|[+-]?Infinity)(?:\s*,|$)/m);

// The guard must be fully restored after a run; otherwise normal calculator persistence would break.
localStorage.setItem('post-batch-write', 'works');
assert.equal(localStorage.getItem('post-batch-write'), 'works');
localStorage.removeItem('post-batch-write');

console.log(`face-batch: ${rows.length} outcomes × ${columns.length} complete columns; full storage unchanged; non-finite values blanked`);
