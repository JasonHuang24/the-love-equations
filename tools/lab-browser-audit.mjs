/** Real-browser Lab workflows, record coverage, and responsive geometry.
 * Run with Node >=20, CODEX_NODE_MODULES (or installed Playwright), and optionally
 * LE_BROWSER_EXECUTABLE. Starts its own local static server; writes ignored artifacts.
 * Screenshots are review evidence, not an automated assertion of visual quality.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.CODEX_NODE_MODULES
  ? path.join(process.env.CODEX_NODE_MODULES, 'playwright') : 'playwright');
const output = path.join(root, 'artifacts', 'lab-browser-audit');
await fs.mkdir(output, { recursive: true });
const server = http.createServer(async (request, response) => {
  try {
    const target = path.resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://local').pathname)}`);
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Invalid path');
    response.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript',
      '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2' })[path.extname(target)] || 'application/octet-stream');
    response.end(await fs.readFile(target));
  } catch { response.statusCode = 404; response.end('Not found'); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true,
  ...(process.env.LE_BROWSER_EXECUTABLE ? { executablePath: process.env.LE_BROWSER_EXECUTABLE } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
const results = [];
const geometry = [];
let readingCoverage = [];
page.on('pageerror', (error) => errors.push(error.message));
page.setDefaultTimeout(15_000);

async function check(name, run) {
  try { await run(); results.push({ name, pass: true }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, pass: false, error: error.stack }); console.error(`FAIL ${name}: ${error.message}`); }
}
async function ready(target = page) {
  await target.waitForFunction(() => document.querySelector('#lab-index-meta').textContent.startsWith('Indexed'));
}
async function settled(target = page) {
  await target.waitForFunction(() => document.querySelector('#lab-cancel').hidden, null, { timeout: 180_000 });
}
async function reset() { await page.locator('#lab-reset').click(); await settled(); }
async function analyze(text) {
  await page.locator('#lab-text-input').fill(text);
  await page.locator('#lab-analyze').click();
  await settled();
  assert.equal(await page.locator('#lab-intake-error').isVisible(), false);
}
async function demo() { await page.locator('#lab-load-demo').click(); await settled(); }
async function download(selector) {
  const pending = page.waitForEvent('download');
  await page.locator(selector).click();
  const file = await pending;
  return fs.readFile(await file.path(), 'utf8');
}
async function screenshot(name, selector) {
  if (selector) await page.locator(selector).scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(output, `${name}.png`) });
}

try {
  await page.goto(`${base}/lab.html`, { waitUntil: 'domcontentloaded' });
  await ready();
  await check('Empty input; optional-title edit preserves readiness', async () => {
    assert.equal(await page.locator('#lab-analyze').isEnabled(), false);
    await page.locator('#lab-text-input').fill('Selection, compatibility, and retention are different tests for dating couples.');
    await page.locator('#lab-source-title').fill('A useful source title');
    assert.equal(await page.locator('#lab-analyze').isEnabled(), true);
    await page.locator('#lab-analyze').click(); await settled();
    assert.equal(await page.locator('#lab-source-meta-title').textContent(), 'A useful source title');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'lab-workspace-title');
  });
  await check('Edits mark results stale, preserve Source, and pause four exports plus decisions', async () => {
    const title = await page.locator('#lab-source-meta-title').textContent();
    await page.locator('#lab-source-title').fill('Changed title');
    assert.equal(await page.locator('#lab-results-stale').isVisible(), true);
    assert.equal(await page.locator('#lab-source-meta-title').textContent(), title);
    for (const id of ['lab-copy-markdown', 'lab-download-markdown', 'lab-download-json', 'lab-export-research']) {
      assert.equal(await page.locator(`#${id}`).isEnabled(), false);
    }
    assert.equal(await page.locator('[data-source-decision]:enabled').count(), 0);
    await page.locator('#lab-analyze').click(); await settled();
    assert.equal(await page.locator('#lab-results-stale').isVisible(), false);
    assert.equal(await page.locator('#lab-source-meta-title').textContent(), 'Changed title');
    const exported = JSON.parse(await download('#lab-download-json'));
    assert.equal(exported.source.title, 'Changed title');
    assert.ok(exported.metrics.mappedClaimSegments > 0);
    assert.match(await download('#lab-download-markdown'), /Changed title/);
  });
  await check('Demo; five tabs; keyboard arrows/Home/End; all seven sort controls', async () => {
    await demo();
    assert.ok(Number(await page.locator('#lab-metric-claims').textContent()) > 0);
    for (const name of ['map', 'citations', 'pressure', 'research', 'source']) {
      await page.locator(`#lab-tab-${name}`).click();
      assert.equal(await page.locator(`#lab-panel-${name}`).isVisible(), true);
      assert.equal(await page.locator('[role=tabpanel]:visible').count(), 1);
    }
    await page.locator('#lab-tab-source').focus();
    await page.keyboard.press('Home');
    assert.equal(await page.locator('#lab-tab-map').getAttribute('aria-selected'), 'true');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#lab-tab-citations').getAttribute('aria-selected'), 'true');
    await page.keyboard.press('End');
    assert.equal(await page.locator('#lab-tab-source').getAttribute('aria-selected'), 'true');
    await page.locator('#lab-tab-map').click();
    for (const button of await page.locator('[data-sort-key]').all()) {
      await button.click();
      assert.ok(['ascending', 'descending'].includes(await button.locator('..').getAttribute('aria-sort')));
    }
    assert.equal(await page.locator('[data-sort-key]').count(), 7);
    await page.locator('#lab-metric-coverage-tile').click();
    assert.match(await page.locator('#lab-ledger-filter-note').textContent(), /matched/i);
    await page.locator('#lab-ledger-filter-note button').click();
    assert.equal(await page.locator('#lab-ledger-filter-note').isVisible(), false);
  });
  await check('Clear demo and keyboard-delete pasted text cannot resurrect a cached document', async () => {
    await page.locator('#lab-clear-text').click();
    assert.equal(await page.locator('#lab-analyze').isEnabled(), false);
    assert.equal(await page.locator('#lab-results-stale').isVisible(), true);
    await analyze('Physical attraction can affect dating choices.');
    await page.locator('#lab-text-input').fill('');
    assert.equal(await page.locator('#lab-analyze').isEnabled(), false);
  });
  await check('File replacement, removal, blank-file error, and recovery', async () => {
    await reset(); await demo();
    const priorSource = await page.locator('#lab-source-meta-title').textContent();
    await page.locator('#lab-file-input').setInputFiles({ name: 'new-source.txt', mimeType: 'text/plain', buffer: Buffer.from('Shared values matter in a long-term relationship.') });
    await settled();
    assert.equal(await page.locator('#lab-text-input').inputValue(), '');
    assert.equal(await page.locator('#lab-results-stale').isVisible(), true);
    assert.equal(await page.locator('#lab-source-meta-title').textContent(), priorSource);
    await page.locator('#lab-analyze').click(); await settled();
    assert.equal(await page.locator('#lab-source-meta-title').textContent(), 'new-source');
    await page.locator('#lab-remove-file').click();
    assert.equal(await page.locator('#lab-analyze').isEnabled(), false);
    await page.locator('#lab-file-input').setInputFiles({ name: 'blank.txt', mimeType: 'text/plain', buffer: Buffer.from('') });
    await settled();
    assert.equal(await page.locator('#lab-intake-error').isVisible(), true);
    await analyze('Selection, compatibility, and retention are different tests for dating couples.');
  });
  await check('Provenance-only media URL, invalid optional URL, and non-domain recovery', async () => {
    await reset();
    await page.locator('#lab-source-url').fill('https://www.youtube.com/watch?v=example');
    assert.equal(await page.locator('#lab-analyze').isEnabled(), false);
    await page.locator('#lab-source-url').fill('not a URL');
    await analyze('Selection, compatibility, and retention are different tests for dating couples.');
    const exported = JSON.parse(await download('#lab-download-json'));
    assert.ok(!exported.source.url);
    await reset();
    await analyze('The compiler optimizes database queries. Kubernetes schedules containers across cluster nodes.');
    assert.equal(await page.locator('#lab-metric-coverage').textContent(), 'N/A');
    assert.equal(await page.locator('#lab-app').getAttribute('data-lab-state'), 'no-domain');
    await page.locator('#lab-guide-action').click();
    assert.equal(await page.locator('#lab-triage').getAttribute('open'), '');
    const include = page.locator('#lab-triage-list button').filter({ hasText: 'Add back in' }).first();
    await include.click(); await settled();
    assert.ok((JSON.parse(await download('#lab-download-json'))).domainRelevance.overrides.applied.length > 0);
    await page.locator('#lab-triage-list button').filter({ hasText: 'Undo' }).first().click(); await settled();
    assert.equal((JSON.parse(await download('#lab-download-json'))).domainRelevance.overrides.applied.length, 0);
  });
  await check('Replacing a fetched URL retrieves new text instead of relabeling the old source', async () => {
    await reset();
    await page.route('**/audit-article-*', (route) => route.fulfill({ status: 200, contentType: 'text/plain',
      body: route.request().url().endsWith('-one') ? 'Physical attraction matters in dating.' : 'Shared values support long-term compatibility between partners.' }));
    await page.locator('#lab-source-url').fill(`${base}/audit-article-one`);
    await page.locator('#lab-analyze').click(); await settled();
    assert.match(await page.locator('#lab-source-segments').textContent(), /Physical attraction/);
    await page.locator('#lab-source-url').fill(`${base}/audit-article-two`);
    await page.locator('#lab-analyze').click(); await settled();
    assert.match(await page.locator('#lab-source-segments').textContent(), /Shared values/);
    assert.doesNotMatch(await page.locator('#lab-source-segments').textContent(), /Physical attraction/);
    await page.locator('#lab-source-url').fill('https://www.youtube.com/watch?v=example');
    assert.equal(await page.locator('#lab-analyze').isEnabled(), false);
    await page.unroute('**/audit-article-*');
  });
  await check('No-match result keeps its claim in Open Questions with a usable next step', async () => {
    await reset();
    await analyze('Exactly 93 percent of women will only date men who earn more money than they do.');
    assert.equal(await page.locator('#lab-app').getAttribute('data-lab-state'), 'no-match');
    assert.equal(await page.locator('#lab-metric-coverage').textContent(), '0%');
    assert.equal(await page.locator('#lab-research-count').textContent(), '1');
    await page.locator('#lab-guide-action').click();
    assert.equal(await page.locator('#lab-panel-research').isVisible(), true);
    assert.match(await download('#lab-export-research'), /93 percent/);
  });
  await check('Subtitle timing, HTML sanitization, JSONL, TSV and RTF browser intake', async () => {
    const samples = [
      ['captions.srt', 'application/x-subrip', '1\n00:00:01,000 --> 00:00:03,000\nSelection, compatibility, and retention are different tests.\n'],
      ['article.html', 'text/html', '<h1>A dating article</h1><p>Physical attraction matters in dating.</p><script>window.__labUnsafe=true</script><img src=x onerror="window.__labUnsafe=true">'],
      ['lines.jsonl', 'application/json', '{"text":"Shared values matter in relationships."}\n{"text":"Physical attraction matters in dating."}'],
      ['rows.tsv', 'text/tab-separated-values', 'speaker\ttext\nAda\tPhysical attraction matters in dating.'],
      ['notes.rtf', 'application/rtf', '{\\rtf1\\ansi Physical attraction matters in dating.}'],
    ];
    for (const [name, mimeType, text] of samples) {
      await reset();
      await page.locator('#lab-file-input').setInputFiles({ name, mimeType, buffer: Buffer.from(text) });
      await settled();
      assert.equal(await page.locator('#lab-analyze').isEnabled(), true, name);
      await page.locator('#lab-analyze').click(); await settled();
      assert.equal(await page.locator('#lab-intake-error').isVisible(), false, name);
      assert.ok(Number(await page.locator('#lab-metric-words').textContent()) > 0);
      if (name.endsWith('.srt')) assert.match(await page.locator('#lab-source-segments time').first().textContent(), /0:01/);
      assert.equal(await page.evaluate(() => Boolean(window.__labUnsafe)), false);
    }
  });
  await check('Local media requires transcript; companion parsing and preview cleanup', async () => {
    await reset();
    const wav = Buffer.alloc(44 + 16000);
    wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
    wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28); wav.writeUInt16LE(2, 32);
    wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(16000, 40);
    await page.locator('#lab-file-input').setInputFiles({ name: 'local.wav', mimeType: 'audio/wav', buffer: wav });
    await settled();
    assert.equal(await page.locator('#lab-media-preview audio').count(), 1);
    assert.equal(await page.locator('#lab-analyze').isEnabled(), false);
    await page.locator('#lab-companion-input').setInputFiles({ name: 'transcript.txt', mimeType: 'text/plain', buffer: Buffer.from('Physical attraction matters in dating.') });
    await settled();
    await page.locator('#lab-analyze').click(); await settled();
    assert.equal(await page.locator('#lab-source-meta-type').textContent(), 'media-with-companion-transcript');
    await reset();
    assert.equal(await page.locator('#lab-media-preview audio').count(), 0);
    assert.equal(await page.locator('#lab-analyze').isEnabled(), false);
  });
  await check('Clipboard success and permission failure using a synthetic clipboard', async () => {
    await reset();
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      read: async () => [{ types: ['text/plain'], getType: async () => new Blob(['Physical attraction matters in dating.'], { type: 'text/plain' }) }],
      writeText: async (value) => { window.__labCopied = value; },
    } }));
    await page.locator('#lab-paste-button').click(); await settled();
    assert.match(await page.locator('#lab-text-input').inputValue(), /Physical attraction/);
    await page.locator('#lab-analyze').click(); await settled();
    await page.locator('#lab-copy-markdown').click();
    assert.match(await page.evaluate(() => window.__labCopied), /Physical attraction/);
    await page.evaluate(() => { navigator.clipboard.read = async () => { throw new DOMException('Denied', 'NotAllowedError'); }; });
    await page.locator('#lab-paste-button').click(); await settled();
    assert.match(await page.locator('#lab-intake-error-message').textContent(), /clipboard access/);
    await page.evaluate(() => { delete navigator.clipboard; });
    await analyze('Shared values matter in relationships.');
  });
  await check('Blocked PDF/OCR dependencies leave direct-text intake usable', async () => {
    const dependencyRequests = [];
    await page.route(/\/(?:pdf|tesseract)\.min\.js(?:\?.*)?$/, (route) => {
      dependencyRequests.push(route.request().url()); return route.abort('failed');
    });
    await reset();
    await page.locator('#lab-file-input').setInputFiles({ name: 'text.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF') });
    await settled();
    assert.equal(await page.locator('#lab-intake-error').isVisible(), true);
    await reset();
    const png = await page.screenshot({ clip: { x: 0, y: 0, width: 100, height: 100 } });
    await page.locator('#lab-file-input').setInputFiles({ name: 'text.png', mimeType: 'image/png', buffer: png });
    await settled();
    assert.equal(await page.locator('#lab-intake-error').isVisible(), true);
    assert.ok(dependencyRequests.some((url) => url.includes('pdf.min.js')));
    assert.ok(dependencyRequests.some((url) => url.includes('tesseract.min.js')));
    await page.unroute(/\/(?:pdf|tesseract)\.min\.js(?:\?.*)?$/);
    await analyze('Shared values matter in relationships.');
  });
  await check('Main-thread fallback completes when Worker construction is blocked', async () => {
    const fallback = await context.newPage();
    await fallback.addInitScript(() => { window.Worker = class { constructor() { throw new Error('Worker blocked for audit'); } }; });
    await fallback.goto(`${base}/lab.html`, { waitUntil: 'domcontentloaded' }); await ready(fallback);
    await fallback.locator('#lab-text-input').fill('Selection, compatibility, and retention are different tests for dating couples.');
    await fallback.locator('#lab-analyze').click(); await settled(fallback);
    assert.equal(await fallback.locator('#lab-metric-claims').textContent(), '1');
    assert.equal(await fallback.locator('#lab-metric-coverage').textContent(), '100%');
    await fallback.close();
  });
  await check('Reset cancels an in-flight URL fetch; late completion cannot restore old state', async () => {
    await reset();
    let requested;
    const started = new Promise((resolve) => { requested = resolve; });
    await page.route('**/slow-source.txt', async (route) => {
      requested();
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.fulfill({ status: 200, contentType: 'text/plain', body: 'Physical attraction matters in dating.' }).catch(() => {});
    });
    await page.locator('#lab-source-url').fill(`${base}/slow-source.txt`);
    await page.locator('#lab-analyze').click(); await started;
    assert.equal(await page.locator('#lab-text-input').isEnabled(), false);
    await reset();
    await new Promise((resolve) => setTimeout(resolve, 750));
    assert.equal(await page.locator('#lab-app').getAttribute('data-lab-state'), 'empty');
    assert.equal(await page.locator('#lab-metric-claims').textContent(), '—');
    assert.equal(await page.locator('#lab-download-json').isEnabled(), false);
    await page.unroute('**/slow-source.txt');
  });
  await check('Cancel analysis, then immediately start a fresh successful run', async () => {
    await reset();
    await page.locator('#lab-text-input').fill(Array.from({ length: 200 }, (_, i) => `Selection, compatibility, and retention are different tests for dating couples in example ${i}.`).join('\n\n'));
    await page.locator('#lab-analyze').click();
    await page.locator('#lab-cancel').click(); await settled();
    assert.equal(await page.locator('#lab-download-json').isEnabled(), false);
    await analyze('Physical attraction matters in dating.');
    assert.equal(await page.locator('#lab-download-json').isEnabled(), true);
  });
  await check('All four capped views expose their final record and later skipped passages can be restored', async () => {
    await reset();
    const paragraphs = [
      ...Array.from({ length: 305 }, (_, i) => `Selection, compatibility, and retention are different tests for dating couples in example ${i + 1}.`),
      ...Array.from({ length: 200 }, (_, i) => `The compiler optimizes database queries for Kubernetes cluster ${i + 1}.`),
    ];
    await analyze(paragraphs.join('\n\n'));
    const exported = JSON.parse(await download('#lab-download-json'));
    assert.equal(exported.metrics.sourceSegments, 505);
    assert.ok(exported.metrics.claimLikeSegments > 300);
    const cases = [
      ['ledger', 'map', '#lab-map-table-body > tr', exported.metrics.claimLikeSegments],
      ['citations', 'citations', '#lab-citations-list > article', exported.segments.reduce((n, s) => n + s.matches.length, 0)],
      ['triage', 'map', '#lab-triage-list > li', exported.domainRelevance.ignoredPassages.length],
      ['source', 'source', '#lab-source-segments > li', 505],
    ];
    for (const [kind, tab, selector, total] of cases) {
      await page.locator(`#lab-tab-${tab}`).click();
      if (kind === 'triage') await page.locator('#lab-triage').evaluate((node) => { node.open = true; });
      assert.ok(await page.locator(`[data-load-more="${kind}"]`).count(), `${kind} must exercise a render boundary`);
      while (await page.locator(`[data-load-more="${kind}"]`).count()) await page.locator(`[data-load-more="${kind}"]`).click();
      assert.equal(await page.locator(selector).count(), total, `${kind}: every record reachable`);
    }
    await page.locator('#lab-tab-map').click();
    await page.locator('#lab-triage-list button').filter({ hasText: 'Add back in' }).last().click(); await settled();
    assert.equal((JSON.parse(await download('#lab-download-json'))).domainRelevance.overrides.applied.length, 1);
    console.log(`COVERAGE ledger ${cases[0][3]}, citations ${cases[1][3]}, skipped ${cases[2][3]}, source 505`);
  });
  await check('Responsive geometry: both width modes, 16:9/16:10, and breakpoint neighbors', async () => {
    await demo();
    await page.locator('#lab-triage').evaluate((node) => { node.open = true; });
    await page.locator('.lab-unmatched-disclosure').evaluateAll((nodes) => nodes.forEach((node) => { node.open = true; }));
    readingCoverage = await page.evaluate(() => {
      const selectors = ['.lab-canon-match > p', '.lab-match-reason p', '.lab-adjacent', '.lab-external-sources',
        '.lab-pressure-grid dd', '.lab-research-grid dd', '.lab-source-segment > p', '.lab-triage-excerpt'];
      return selectors.map((selector) => {
        const nodes = [...document.querySelectorAll(selector)];
        return { selector, targets: nodes.length, styled: nodes.filter((node) => parseFloat(getComputedStyle(node).fontSize) >= 14).length };
      });
    });
    assert.ok(readingCoverage.every((row) => row.targets > 0 && row.targets === row.styled));
    const sizes = [[320,740],[360,800],[390,844],[540,900],[541,900],[650,900],[720,1024],[721,1024],
      [768,1024],[820,1180],[900,1000],[901,1000],[980,900],[981,900],[1024,768],[1040,900],[1041,900],
      [1180,900],[1181,900],[1280,720],[1280,800],[1366,768],[1440,900],[1680,1050],[1920,1080],
      [1920,1200],[2560,1440],[2560,1600],[3840,2160],[3840,2400]];
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      for (const mode of ['original', 'wide']) {
        await page.evaluate((value) => { document.documentElement.dataset.contentWidth = value; }, mode);
        for (const tab of ['map', 'citations', 'pressure', 'research', 'source']) {
          await page.locator(`#lab-tab-${tab}`).click();
          const measured = await page.evaluate(() => {
            const vw = document.documentElement.clientWidth;
            const overflow = [];
            for (const node of document.querySelectorAll('#lab-app *')) {
              if (!node.checkVisibility({ checkVisibilityCSS: true })) continue;
              const rect = node.getBoundingClientRect();
              if (rect.width <= 1 || (rect.right <= vw + 2 && rect.left >= -2)) continue;
              // The ledger is intentionally scrollable; its offscreen columns are reachable.
              if (node.closest('.lab-table-scroll') || node.closest('.lab-tab-list') || node.closest('.lab-visually-hidden')) continue;
              overflow.push(node.id || `${node.tagName}.${node.className}`);
            }
            return { root: document.documentElement.scrollWidth > vw + 2, overflow: [...new Set(overflow)] };
          });
          geometry.push({ width, height, mode, tab, ...measured });
        }
      }
    }
    const bad = geometry.filter((row) => row.root || row.overflow.length);
    assert.equal(bad.length, 0, `Overflow in ${bad.length} states: ${JSON.stringify(bad.slice(0, 3))}`);
    for (const [width, height, mode] of [[390,844,'wide'],[768,1024,'wide'],[1440,900,'original'],[1920,1080,'wide'],[3840,2160,'wide']]) {
      await page.setViewportSize({ width, height });
      await page.evaluate((value) => { document.documentElement.dataset.contentWidth = value; }, mode);
      const prefix = `${width}-${mode}`;
      await page.locator('#lab-triage').evaluate((node) => { node.open = false; });
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await screenshot(`${prefix}-top`);
      await screenshot(`${prefix}-intake`, '#lab-intake-title');
      await page.locator('#lab-tab-map').click();
      await screenshot(`${prefix}-results`, '#lab-workspace-title');
      await screenshot(`${prefix}-ledger`, '#lab-map-table');
      await page.locator('#lab-triage').evaluate((node) => { node.open = true; });
      await screenshot(`${prefix}-triage`, '#lab-triage-list');
      await page.locator('#lab-triage').evaluate((node) => { node.open = false; });
      await page.locator('#lab-tab-citations').click();
      await screenshot(`${prefix}-citations`, '#lab-citations-list > article:first-child');
      await page.locator('#lab-tab-pressure').click();
      await screenshot(`${prefix}-pressure`, '#lab-pressure-list > article:first-child');
      await page.locator('#lab-tab-research').click();
      await screenshot(`${prefix}-last`, '#lab-research-list > article:last-child');
    }
  });
  await check('Missing index fails honestly and reload recovers', async () => {
    const broken = await context.newPage();
    await broken.route('**/data/le-canon-index.json*', (route) => route.fulfill({ status: 503, body: 'Unavailable' }));
    await broken.goto(`${base}/lab.html`, { waitUntil: 'domcontentloaded' });
    await broken.locator('#lab-intake-error').waitFor({ state: 'visible' });
    await broken.locator('#lab-text-input').fill('Physical attraction matters in dating.');
    assert.equal(await broken.locator('#lab-analyze').isEnabled(), false);
    await broken.unroute('**/data/le-canon-index.json*'); await broken.reload(); await ready(broken);
    assert.equal(await broken.locator('#lab-intake-error').isVisible(), false);
    await broken.close();
  });
  await check('No uncaught browser errors', async () => assert.deepEqual(errors, []));
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ results, geometry, readingCoverage, errors }, null, 2));
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
console.log(`${results.filter((row) => row.pass).length}/${results.length} browser checks; ${geometry.length} viewport/mode/tab measurements`);
process.exitCode = results.some((row) => !row.pass) ? 1 : 0;
