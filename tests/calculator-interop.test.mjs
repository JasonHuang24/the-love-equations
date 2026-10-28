import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const compositeSource = fs.readFileSync(new URL('../js/composite-score.js', import.meta.url), 'utf8');
const matchmakerSource = fs.readFileSync(new URL('../matchmaker.html', import.meta.url), 'utf8');
const FACE_KEY = 'loveEquations.faceScore.v4';
const BODY_KEY = 'loveEquations.bodyScore.v4';
const score = (value = 6, extra = {}) => ({ convention: 'percentile-v3.1', bp: value, cv: value,
  bpMax: 10, cvMax: 10, floor: 1, source: 'model', ts: Date.now(), ...extra });

function composite({ initial = {}, blocked = false, quota = false } = {}) {
  const storage = new Map(Object.entries(initial).map(([key, value]) => [key, JSON.stringify(value)]));
  const host = { innerHTML: '' };
  const context = vm.createContext({ window: { addEventListener() {} },
    document: { getElementById: id => id === 'composite-result' ? host : null, addEventListener() {} },
    localStorage: {
      getItem(key) { if (blocked) throw new Error('Storage blocked'); return storage.get(key) ?? null; },
      setItem(key, value) { if (blocked || quota) throw new Error('Storage unavailable'); storage.set(key, value); },
      removeItem(key) { if (blocked) throw new Error('Storage blocked'); storage.delete(key); }
    }
  });
  vm.runInContext(compositeSource, context);
  return { api: context.window.leComposite, host, storage };
}

test('composite blends current valid scores without changing their scale', () => {
  const { host } = composite({ initial: { [FACE_KEY]: score(6), [BODY_KEY]: score(8) } });
  assert.match(host.innerHTML, /composite-score[^>]*>7\.0 /);
});

for (const [name, invalid] of [
  ['disagreeing score fields', score(6, { bp: 9 })],
  ['above the declared ceiling', score(12)],
  ['below the declared floor', score(0)],
  ['a retired scale', score(6, { convention: 'percentile-v3' })],
  ['different score ceilings', score(6, { bpMax: 9 })]
]) test(`composite refuses ${name}`, () => {
  const { host } = composite({ initial: { [FACE_KEY]: invalid, [BODY_KEY]: score(8) } });
  assert.doesNotMatch(host.innerHTML, /class="composite-score"/);
});

test('blocked storage still permits current-session scores and reset', () => {
  const { api, host } = composite({ blocked: true });
  api.saveFace(score(6)); api.saveBody(score(8));
  assert.match(host.innerHTML, /composite-score[^>]*>7\.0 /);
  assert.match(host.innerHTML, /Could not save the face and body reads/);
  api.reset();
  assert.doesNotMatch(host.innerHTML, /class="composite-score"/);
});

test('a quota failure shows the new score instead of the stale persisted score', () => {
  const { api, host } = composite({ quota: true, initial: { [FACE_KEY]: score(2), [BODY_KEY]: score(8) } });
  api.saveFace(score(6));
  assert.match(host.innerHTML, /composite-score[^>]*>7\.0 /);
  assert.match(host.innerHTML, /Could not save the face read/);
  api.clearFace();
  assert.doesNotMatch(host.innerHTML, /class="composite-score"/);
});

test('stored source labels are escaped before HTML rendering', () => {
  const { host } = composite({ initial: { [FACE_KEY]: score(6, { source: '<img src=x onerror=alert(1)>' }), [BODY_KEY]: score(8) } });
  assert.doesNotMatch(host.innerHTML, /<img src=x/);
});

function importedCompatibility(saved) {
  const start = matchmakerSource.indexOf('  function initImports(){');
  const end = matchmakerSource.indexOf('\n  function calcOverrideCaveat()', start);
  assert.ok(start > 0 && end > start);
  const context = vm.createContext({ readLS: key => key === 'loveEquations.compatibilityCalculator.v1' ? saved : null,
    importedSMV: null, userSex: 'm', MM_KEY: 'loveEquations.matchmaker.v1',
    PYRAMIDS: { you: { describes: 'f' } }, pyramid: 'you', targetSex: () => 'f',
    refreshCalcImports() {}, compatImported: false, compatValues: {}, selfGrades: {} });
  vm.runInContext(matchmakerSource.slice(start, end) + '\ninitImports();', context);
  return context;
}

test('Matchmaker does not import untouched Compatibility midpoints as a scored standard', () => {
  assert.equal(importedCompatibility({ activeKey: 'you', touched: false, values: { 'you-0-0': 5 } }).compatImported, false);
});

test('Matchmaker preserves an explicitly scored all-minimum Compatibility standard', () => {
  const context = importedCompatibility({ activeKey: 'you', touched: true, values: { 'you-0-0': 1 } });
  assert.equal(context.compatImported, true);
  assert.equal(context.selfGrades['you-0-0'], 1);
});

test('Matchmaker continues to accept legacy scored Compatibility records', () => {
  assert.equal(importedCompatibility({ activeKey: 'you', values: { 'you-0-0': 7 } }).compatImported, true);
});

for (const file of ['compatibility.html', 'smvcalc.html', 'matchmaker.html', 'face.html', 'body.html'])
for (const fallback of ['refused', 'throws', 'succeeds'])
test(`${file}: clipboard fallback ${fallback} reports the outcome and removes its textarea`, async () => {
  const source = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  const batch = file === 'face.html' || file === 'body.html';
  const start = source.indexOf(batch ? "btnMd.addEventListener('click', async ()=>{" : 'async function copyToClipboard(');
  const end = source.indexOf(batch ? '\n      btnClear.addEventListener' : file === 'matchmaker.html' ? '\n  }' : '\n    }', start);
  assert.ok(start > 0 && end > start);
  let removed = false;
  const textarea = { style: {}, focus() {}, select() {}, remove() { removed = true; } };
  const status = {};
  let callback;
  const context = vm.createContext({ navigator: { clipboard: { async writeText() { throw new Error('Denied'); } } },
    document: { createElement: () => textarea, body: { appendChild() {}, removeChild() { removed = true; } },
      execCommand() { if (fallback === 'throws') throw new Error('Denied'); return fallback === 'succeeds'; } },
    btnMd: { addEventListener(event, fn) { callback = fn; } }, statusEl: status,
    window: { batchToMarkdown: () => 'example' }, rows: [], COLUMNS: [] });
  vm.runInContext(source.slice(start, batch ? end : end + (file === 'matchmaker.html' ? 4 : 6)), context);
  if (batch) await callback();
  else await context.copyToClipboard('example', status, 'Copied.');
  assert.match(status.textContent, fallback === 'succeeds' ? /copied/i : /Copy failed/);
  assert.equal(removed, true);
});
