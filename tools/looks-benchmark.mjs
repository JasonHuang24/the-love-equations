#!/usr/bin/env node
/**
 * looks-benchmark — the Face/Body Calc real-photo benchmark: does the score agree with people?
 *
 * WHY THIS EXISTS. The Face Calc's model is the SCUT-FBP5500 ResNet18 (studio faces, Asian + white only)
 * and its percentile reference (2026-08-14) is that same model's output over SCUT. Every recorded check —
 * the calibration report, the percentile remap, the repeatability audit (tools/audit-face-photos.mjs,
 * which by design infers no rating labels) — measures the model against ITSELF. None asks whether the
 * people it ranks high are the people humans rank high, or whether it ranks one ethnicity below another
 * at equal looks. "The scores aren't reasonable" (Jason, 2026-09-28) lives exactly there. This tool runs
 * the tracked roster — 790 ordinary real photos of 192 real people with a frozen reference rating each
 * (tests/fixtures/looks-benchmark-labels.json) — through the SHIPPED pages' own debug batch harnesses
 * (same crop, gates, model, percentile mapping; the harness guards localStorage) and reports four
 * separate things (tools/looks-benchmark-metrics.mjs): ORDER, STABILITY, SHAPE, FAIRNESS.
 *
 * It is a MEASUREMENT, not a gate: no thresholds, exit 0 on a completed run, 1 if the run itself failed.
 * Candidates are measured WITHOUT editing the pages: --face-model/--body-model swap the .onnx at the
 * network layer and --face-ref/--body-ref swap the page's REF_RAW percentile table (a JSON array of the
 * candidate's own reference-population raw percentiles) in the served HTML, asserted to hit exactly
 * once — so a candidate is displayed on the same percentile-of-reference scale as the baseline.
 *
 * Usage:
 *   npm run bench:looks                                   # both calcs, shipped config
 *   node tools/looks-benchmark.mjs --calc face --face-model path/to.onnx --face-ref path/to/ref_raw.json --label cand
 *   node tools/looks-benchmark.mjs --calc face --dump-crops DIR   # also save the exact 224px crops the model sees
 *   node tools/looks-benchmark.mjs --calc face --limit 20         # smoke run
 * Output: artifacts/looks-benchmark/<stamp>-<label>/ (gitignored) — report.json, report.md, per-image CSVs.
 *
 * Browser: Playwright driving the installed Google Chrome (no browser download; LE_BENCH_CHANNEL overrides).
 * The playwright module is resolved from $LE_PLAYWRIGHT (a playwright or playwright-core package dir), then
 * $CODEX_NODE_MODULES/playwright (the audit-face-photos.mjs convention), then a bare import.
 */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import process from 'node:process';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mean, median, quantile, spearman, auc, icc1, residualGaps, histogram } from './looks-benchmark-metrics.mjs';

const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);

// ── args ──
const argv = process.argv.slice(2);
const opt = (k, d = null) => { const i = argv.indexOf('--' + k); return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true) : d; };
const calcs = (opt('calc', 'both') === 'both') ? ['face', 'body'] : [opt('calc')];
const label = String(opt('label', 'shipped')).replace(/[^\w.-]+/g, '-');
const faceModel = opt('face-model'), bodyModel = opt('body-model');
const faceRef = opt('face-ref'), bodyRef = opt('body-ref');
const dumpCrops = opt('dump-crops');
const limit = opt('limit') ? +opt('limit') : Infinity;
const channel = process.env.LE_BENCH_CHANNEL || 'chrome';

// ── the tree under test, first line (house rule: the output names the tree it tested) ──
const git = c => { try { return execSync('git ' + c, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { return '?'; } };
const dirty = git('status --porcelain -- face.html body.html models js tests/fixtures/looks-benchmark-labels.json');
console.log(`looks-benchmark · tree ${git('rev-parse --short HEAD')} (${git('rev-parse --abbrev-ref HEAD')})${dirty ? ' · DIRTY calc inputs:\n' + dirty : ' · calc inputs clean'}`
  + ` · label ${label}${faceModel ? ' · face-model ' + faceModel : ''}${faceRef ? ' · face-ref ' + faceRef : ''}`
  + `${bodyModel ? ' · body-model ' + bodyModel : ''}${bodyRef ? ' · body-ref ' + bodyRef : ''}`);

// ── labels ──
const LABELS = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/looks-benchmark-labels.json'), 'utf8')).people;
const people = Object.entries(LABELS).filter(([, p]) => !p.fictional);
const photoList = people.flatMap(([slug, p]) => p.photos.map(f => ({ slug, url: `/images/roster/${slug}/${f}`, name: `${slug}__${f}` }))).slice(0, limit);
const portraitList = people.filter(([, p]) => p.portrait).map(([slug, p]) => ({ slug, url: `/images/roster/${p.portrait}`, name: `${slug}__portrait.jpg` })).slice(0, limit);

// ── static server (127.0.0.1 so the pages' debug harness switches on) ──
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.onnx': 'application/octet-stream', '.wasm': 'application/wasm', '.task': 'application/octet-stream' };
function rewriteRef(html, refPath, what) {
  if (!refPath) return html;
  const ref = JSON.parse(fs.readFileSync(path.resolve(String(refPath)), 'utf8'));
  if (!Array.isArray(ref) || ref.length < 11 || !ref.every((v, i) => Number.isFinite(v) && (i === 0 || v > ref[i - 1])))
    throw new Error(`--${what}-ref must be a strictly increasing JSON array of reference-population raw percentiles`);
  let hits = 0;
  const out = html.replace(/const REF_RAW = \[[^\]]*\];/g, () => { hits++; return `const REF_RAW = ${JSON.stringify(ref)};`; });
  if (hits !== 1) throw new Error(`${what}.html REF_RAW rewrite hit ${hits} times (expected exactly 1) — the table moved; update the pattern`);
  return out;
}
const server = http.createServer((req, res) => {
  try {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(root, p);
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    if (p === '/models/face-beauty.onnx' && faceModel) file = path.resolve(faceModel);
    if (p === '/models/body-beauty.onnx' && bodyModel) file = path.resolve(bodyModel);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404).end(); return; }
    let body = fs.readFileSync(file);
    if (p === '/face.html') body = rewriteRef(body.toString(), faceRef, 'face');
    if (p === '/body.html') body = rewriteRef(body.toString(), bodyRef, 'body');
    res.writeHead(200, { 'content-type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch (e) { res.writeHead(500).end(String(e.message)); }
});

function loadPlaywright() {
  const tries = [process.env.LE_PLAYWRIGHT, process.env.CODEX_NODE_MODULES && path.join(process.env.CODEX_NODE_MODULES, 'playwright'), 'playwright', 'playwright-core'].filter(Boolean);
  for (const t of tries) { try { return require(t); } catch { /* next */ } }
  throw new Error('playwright not found — set LE_PLAYWRIGHT to a playwright or playwright-core package directory');
}

// ── in-page runner: build Files from URLs (optionally mirrored), run the page's own harness, return rows ──
async function runInPage(page, calc, list, { mirror = false, crops = false } = {}) {
  return page.evaluate(async ({ calc, list, mirror, crops }) => {
    const run = calc === 'face' ? window.__lcBatchRun : window.__bcBatchRun;
    const rows = calc === 'face' ? window.__lcBatchRows : window.__bcBatchRows;
    const files = [];
    for (const it of list) {
      let blob = await (await fetch(it.url)).blob();
      if (mirror) {
        const bmp = await createImageBitmap(blob);
        const c = new OffscreenCanvas(bmp.width, bmp.height), x = c.getContext('2d');
        x.translate(bmp.width, 0); x.scale(-1, 1); x.drawImage(bmp, 0, 0);
        blob = await c.convertToBlob({ type: 'image/jpeg', quality: 0.95 });
      }
      files.push(new File([blob], it.name, { type: 'image/jpeg' }));
    }
    // Crop capture (face only): cropFaceTensor calls window.lcPreprocess with the exact 224² RGBA the model sees.
    // A row is pushed after its image's pipeline ran, so the last crop seen belongs to that row; refused rows get none.
    let origPre = null, origPush = null;
    if (crops && calc === 'face') {
      origPre = window.lcPreprocess;
      window.lcPreprocess = function (rgba, S) {
        const c = new OffscreenCanvas(S, S); c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(rgba), S, S), 0, 0);
        window.__benchCrop = c; return origPre.apply(this, arguments);
      };
      window.__benchCrops = [];
      origPush = rows.push;
      rows.push = function (r) { window.__benchCrops.push({ name: r.filename, canvas: window.__benchCrop || null }); window.__benchCrop = null; return Array.prototype.push.apply(this, arguments); };
    }
    try { await run(files); } finally { if (origPre) window.lcPreprocess = origPre; if (origPush) rows.push = origPush; }
    const out = rows.map(r => Object.assign({}, r));
    // One scale since the 2026-08-14 percentile recalibration: the harness writes the score to both bp and cv.
    const tierOf = s => calc === 'face' ? window.faceTier(s, null) : window.frameTier(s, null);
    for (const r of out) if (r.outcome === 'scored' && r.bp !== '') r.tier = tierOf(+r.bp);
    if (crops && calc === 'face') {
      const toURL = async c => { const b = await c.convertToBlob({ type: 'image/png' }); return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); }); };
      const m = {}; for (const k of window.__benchCrops) if (k.canvas) m[k.name] = await toURL(k.canvas);
      for (const r of out) if (m[r.filename]) r.__crop = m[r.filename];
    }
    return out;
  }, { calc, list, mirror, crops });
}

async function openCalc(browser, calc, base) {
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  page.setDefaultTimeout(0);
  page.on('pageerror', e => console.warn(`[${calc} pageerror]`, e.message));
  await page.goto(`${base}/${calc}.html?debug`, { waitUntil: 'load' });
  await page.waitForFunction(c => typeof (c === 'face' ? window.__lcBatchRun : window.__bcBatchRun) === 'function', calc, { timeout: 60000 });
  const stateKey = calc === 'face' ? 'lcState' : 'bcState';
  await page.waitForFunction(k => window[k] && window[k].modelReady === true, stateKey, { timeout: 180000 })
    .catch(() => { throw new Error(`${calc}: trained model never reported ready — the benchmark measures the model path, refusing to run on the fallback`); });
  // Warm-up: the landmarker/pose worker load on their own clocks; retry one known-good image until it scores.
  // Several probes: any single photo may be refused by a quality gate, which says nothing about readiness.
  const probes = calc === 'face'
    ? ['danny-devito/1.jpg', 'russell-brand/6.jpg', 'ana-de-armas/1.jpg', 'margot-robbie/2.jpg']
    : ['idris-elba/2.jpg', 'zendaya/5.jpg', 'emma-stone/4.jpg', 'susan-boyle/2.jpg'];
  let last = null;
  for (let i = 0; i < 30; i++) {
    const r = await runInPage(page, calc, probes.map((u, k) => ({ url: '/images/roster/' + u, name: `probe${k}.jpg` })));
    if (r.some(x => x.outcome === 'scored')) return page;
    last = r[r.length - 1];
    await new Promise(res => setTimeout(res, 2000));
  }
  throw new Error(`${calc}: warm-up probe never scored — pipeline not ready (last: ${last && (last.outcome + ' · ' + last.refusal)})`);
}

// ── metrics over rows ──
const num = v => (v === '' || v == null ? NaN : +v);
function perImage(rows) {
  return rows.map(r => { const [slug] = r.filename.split('__'); const L = LABELS[slug];
    return { ...r, slug, looks: L.looks, ethnicity: L.ethnicity, sex: L.sex, raw: num(r.model_raw), score: num(r.bp), scored: r.outcome === 'scored' && Number.isFinite(num(r.bp)) }; });
}
function summarize(calc, imgs, mirrorPairs) {
  const S = imgs.filter(i => i.scored);
  const bySlug = {};
  for (const i of S) (bySlug[i.slug] = bySlug[i.slug] || []).push(i);
  const persons = Object.entries(bySlug).map(([slug, a]) => ({ slug, looks: LABELS[slug].looks, group: LABELS[slug].ethnicity, n: a.length,
    score: mean(a.map(x => x.score)), range: Math.max(...a.map(x => x.score)) - Math.min(...a.map(x => x.score)) }));
  const refusals = {};
  for (const i of imgs.filter(i => !i.scored)) { const k = String(i.refusal || i.outcome).slice(0, 70); refusals[k] = (refusals[k] || 0) + 1; }
  const hiLo = { attractive: S.filter(i => i.looks >= 8).map(i => i.score), plain: S.filter(i => i.looks <= 5).map(i => i.score) };
  const multi = persons.filter(p => p.n >= 2);
  const fair = residualGaps(persons.map(p => ({ looks: p.looks, score: p.score, group: p.group })), 'black');
  const out = {
    calc, images: imgs.length, scored: S.length, refused: imgs.length - S.length, refusals,
    order: {
      spearmanPersonMean: spearman(persons.map(p => p.looks), persons.map(p => p.score)), persons: persons.length,
      spearmanPerImage: spearman(S.map(i => i.looks), S.map(i => i.score)),
      aucAttractiveOverPlain: auc(hiLo.attractive, hiLo.plain), nAttractive: hiLo.attractive.length, nPlain: hiLo.plain.length,
    },
    stability: {
      icc1: icc1(multi.map(p => bySlug[p.slug].map(x => x.score))).icc, personsWith2plus: multi.length,
      medianWithinPersonRange: median(multi.map(p => p.range)), p90WithinPersonRange: quantile(multi.map(p => p.range), 0.9),
    },
    shape: {
      quantiles: Object.fromEntries([5, 25, 50, 75, 95].map(q => ['p' + q, quantile(S.map(i => i.score), q / 100)])),
      le1_5: S.filter(i => i.score <= 1.5).length, exactly1: S.filter(i => i.score === 1).length, ge8: S.filter(i => i.score >= 8).length,
      tiers: histogram(S.map(i => i.tier), t => t),
    },
    fairness: { method: 'person-mean score residual after OLS on reference looks; gap = Black minus everyone else', gapBlackMinusRest: fair.focusGap, nBlack: fair.focusN, slope: fair.slope, groups: fair.groups },
  };
  if (calc === 'body') {
    const route = {}; for (const i of S) { const k = `${i.routing} / ${i.framing}`; route[k] = (route[k] || 0) + 1; }
    out.bodyRouting = route;
  }
  if (mirrorPairs) {
    const d = mirrorPairs.filter(p => Number.isFinite(p.a) && Number.isFinite(p.b)).map(p => Math.abs(p.a - p.b));
    out.stability.mirror = { pairs: d.length, medianAbsDelta: median(d), p90AbsDelta: quantile(d, 0.9), maxAbsDelta: d.length ? Math.max(...d) : NaN };
  }
  return out;
}

function fmt(x, d = 2) { return Number.isFinite(x) ? x.toFixed(d) : '—'; }
function mdReport(rep) {
  const L = [];
  for (const r of rep.results) {
    L.push(`## ${r.calc === 'face' ? 'Face' : 'Body'} Calc — ${r.scored}/${r.images} scored`);
    L.push(`| metric | value |`, `|---|---|`);
    L.push(`| ORDER · Spearman ρ, person-mean score vs reference (${r.order.persons} people) | ${fmt(r.order.spearmanPersonMean, 3)} |`);
    L.push(`| ORDER · Spearman ρ, per image | ${fmt(r.order.spearmanPerImage, 3)} |`);
    L.push(`| ORDER · AUC attractive(≥8) over plain(≤5), per image (${r.order.nAttractive}/${r.order.nPlain}) | ${fmt(r.order.aucAttractiveOverPlain, 3)} |`);
    L.push(`| STABILITY · ICC(1) across a person's photos (${r.stability.personsWith2plus} people) | ${fmt(r.stability.icc1, 3)} |`);
    L.push(`| STABILITY · median / p90 within-person score range | ${fmt(r.stability.medianWithinPersonRange)} / ${fmt(r.stability.p90WithinPersonRange)} |`);
    if (r.stability.mirror) L.push(`| STABILITY · mirror \\|Δscore\\| median / p90 / max (${r.stability.mirror.pairs} portraits) | ${fmt(r.stability.mirror.medianAbsDelta)} / ${fmt(r.stability.mirror.p90AbsDelta)} / ${fmt(r.stability.mirror.maxAbsDelta)} |`);
    const q = r.shape.quantiles;
    L.push(`| SHAPE · score p5/p25/p50/p75/p95 | ${fmt(q.p5)} / ${fmt(q.p25)} / ${fmt(q.p50)} / ${fmt(q.p75)} / ${fmt(q.p95)} |`);
    L.push(`| SHAPE · ≤1.5 / exactly 1.00 / ≥8.0 | ${r.shape.le1_5} / ${r.shape.exactly1} / ${r.shape.ge8} |`);
    L.push(`| FAIRNESS · Black minus rest, score residual at equal reference looks (n Black ${r.fairness.nBlack}) | ${fmt(r.fairness.gapBlackMinusRest)} |`);
    L.push('');
    L.push('Tiers: ' + Object.entries(r.shape.tiers).map(([k, v]) => `${k} ${v}`).join(' · '));
    L.push('Residual by group (n≥4): ' + Object.entries(r.fairness.groups).filter(([, g]) => g.reported).map(([k, g]) => `${k} ${fmt(g.meanResidual)} (n${g.n})`).join(' · '));
    if (r.bodyRouting) L.push('Routing: ' + Object.entries(r.bodyRouting).map(([k, v]) => `${k} ${v}`).join(' · '));
    L.push('Refusals: ' + (Object.entries(r.refusals).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${v}× ${k}`).join(' · ') || 'none'));
    L.push('');
  }
  return L.join('\n');
}
function toCSV(rows) {
  const cols = [...new Set(rows.flatMap(r => Object.keys(r)))].filter(c => !c.startsWith('__'));
  const cell = v => { const s = v == null ? '' : String(v); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  return [cols.join(',')].concat(rows.map(r => cols.map(c => cell(r[c])).join(','))).join('\n') + '\n';
}

// ── main ──
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const outDir = path.join(root, 'artifacts', 'looks-benchmark', `${stamp}-${label}`);
let browser, exitCode = 0;
try {
  await new Promise(res => server.listen(0, '127.0.0.1', res));
  const base = `http://127.0.0.1:${server.address().port}`;
  const { chromium } = loadPlaywright();
  browser = await chromium.launch({ channel, headless: true });
  fs.mkdirSync(outDir, { recursive: true });
  const report = { tool: 'looks-benchmark', tree: git('rev-parse HEAD'), dirty: !!dirty, label, faceModel, faceRef, bodyModel, bodyRef, startedAt: new Date().toISOString(), results: [] };
  for (const calc of calcs) {
    const t0 = Date.now();
    const page = await openCalc(browser, calc, base);
    process.stdout.write(`${calc}: ${photoList.length} photos… `);
    const rows = await runInPage(page, calc, photoList, { crops: !!dumpCrops });
    let mirrorPairs = null, portraitRows = [], mirrorRows = [];
    if (calc === 'face') {
      portraitRows = await runInPage(page, calc, portraitList);
      mirrorRows = await runInPage(page, calc, portraitList, { mirror: true });
      const m = Object.fromEntries(mirrorRows.map(r => [r.filename, r.outcome === 'scored' ? num(r.bp) : NaN]));
      mirrorPairs = portraitRows.map(r => ({ a: r.outcome === 'scored' ? num(r.bp) : NaN, b: m[r.filename] }));
    }
    const imgs = perImage(rows);
    report.results.push(summarize(calc, imgs, mirrorPairs));
    fs.writeFileSync(path.join(outDir, `${calc}-rows.csv`), toCSV(imgs));
    if (calc === 'face') fs.writeFileSync(path.join(outDir, 'face-portraits-mirror.csv'), toCSV(portraitRows.map((r, i) => ({ ...r, mirror_score: mirrorRows[i] && mirrorRows[i].bp, mirror_raw: mirrorRows[i] && mirrorRows[i].model_raw }))));
    if (dumpCrops && calc === 'face') {
      const dir = path.resolve(String(dumpCrops)); fs.mkdirSync(dir, { recursive: true });
      let n = 0; for (const r of rows) if (r.__crop) { fs.writeFileSync(path.join(dir, r.filename.replace(/\.jpe?g$/i, '.png')), Buffer.from(r.__crop.split(',')[1], 'base64')); n++; }
      process.stdout.write(`(${n} crops → ${dir}) `);
    }
    await page.close();
    console.log(`done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 1));
  const md = `# looks-benchmark · ${label}\n\ntree ${report.tree.slice(0, 7)}${report.dirty ? ' (DIRTY calc inputs)' : ''} · ${report.startedAt}\n\n` + mdReport(report);
  fs.writeFileSync(path.join(outDir, 'report.md'), md);
  console.log('\n' + md);
  console.log(`→ ${path.relative(root, outDir)}`);
} catch (e) {
  console.error('looks-benchmark FAILED:', e.stack || e.message);
  exitCode = 1;
} finally {
  if (browser) await browser.close().catch(() => {});
  server.close();
}
process.exit(exitCode);
