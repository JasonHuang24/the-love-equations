/** Browser regression checks for the shared shell and reference-page controls.
 * Node >=20 and Playwright (installed or via CODEX_NODE_MODULES) are required.
 * LE_BROWSER_EXECUTABLE can select an installed Chromium browser.
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
const pages = (await fs.readdir(root)).filter(name => name.endsWith('.html')).sort();
const server = http.createServer(async (request, response) => {
  try {
    const target = path.resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://local').pathname)}`);
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Invalid path');
    response.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript',
      '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2' })[path.extname(target)] || 'application/octet-stream');
    response.end(await fs.readFile(target));
  } catch { response.statusCode = 404; response.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true,
  ...(process.env.LE_BROWSER_EXECUTABLE ? { executablePath: process.env.LE_BROWSER_EXECUTABLE } : {}) });
const context = await browser.newContext({ viewport: { width: 390, height: 640 }, reducedMotion: 'reduce' });
// Local UI checks do not depend on CDN availability or download model runtimes.
await context.route('**/*', route => new URL(route.request().url()).origin === base
  ? route.continue() : route.abort());
const page = await context.newPage();
page.setDefaultTimeout(5000);
let failures = 0;
async function check(name, run) {
  try { await run(); console.log(`PASS ${name}`); }
  catch (error) { failures++; console.error(`FAIL ${name}: ${error.message}`); }
}
async function visit(file) {
  await page.goto(`${base}/${file}`, { waitUntil: 'domcontentloaded' });
  await page.locator('.nav-toggle').waitFor({ state: 'attached' });
}
async function noOverflow(label) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${label}: horizontal page overflow`);
}

try {
  for (const file of pages) await check(`${file}: one main landmark and functional first-tab skip link`, async () => {
    await visit(file);
    assert.equal(await page.locator('main, [role="main"]').count(), 1);
    assert.equal(await page.locator('.skip-link').count(), 1);
    assert.equal(await page.locator('.nav-link').count(), 16);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.matches('main, [role="main"]')), true);
    assert.equal(await page.locator('main, [role="main"]').evaluate(el => el.contains(document.querySelector('h1'))), true);
    if (file === 'lab.html') assert.equal(await page.locator('main').getAttribute('id'), 'lab-app');
  });
  await check('Mobile navigation: forward Tab, Escape focus, and responsive reset', async () => {
    await visit('index.html');
    const toggle = page.locator('.nav-toggle');
    await toggle.focus();
    await page.keyboard.press('Enter');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('href')), 'index.html');
    await page.keyboard.press('Escape');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(await toggle.evaluate(el => el === document.activeElement), true);
    await page.keyboard.press('Enter');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForFunction(() => document.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'false');
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    await page.locator('.nav-link').first().focus();
    await page.setViewportSize({ width: 390, height: 640 });
    await page.waitForFunction(() => document.activeElement === document.querySelector('.nav-toggle'));
    assert.equal(await toggle.evaluate(el => el === document.activeElement), true);
    assert.equal(await page.locator('#nav-links').isVisible(), false);
  });
  await check('All 16 menu destinations remain reachable in short mobile/tablet viewports', async () => {
    for (const width of [320, 390, 768, 1280, 1480]) {
      await page.setViewportSize({ width, height: 360 });
      await visit('index.html');
      await page.locator('.nav-toggle').click();
      const last = page.locator('.nav-link').last();
      await last.scrollIntoViewIfNeeded();
      const box = await last.boundingBox();
      assert.ok(box.y >= 0 && box.y + box.height <= 361, `${width}px: last menu destination outside viewport`);
      assert.ok(await page.locator('#nav-links').evaluate(el => el.scrollHeight > el.clientHeight), 'Menu should scroll internally');
    }
    await page.setViewportSize({ width: 390, height: 640 });
  });
  await check('Width toggle survives blocked localStorage and reports its state', async () => {
    const denied = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    try {
      await denied.route('**/*', route => new URL(route.request().url()).origin === base
        ? route.continue() : route.abort());
      await denied.addInitScript(() => {
        Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
        Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
      });
      const target = await denied.newPage();
      await target.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
      const toggle = target.locator('.width-toggle');
      await toggle.click();
      assert.equal(await target.locator('html').getAttribute('data-content-width'), 'wide');
      assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
      await toggle.click();
      assert.equal(await target.locator('html').getAttribute('data-content-width'), 'original');
    } finally { await denied.close(); }
  });
  await check('Skip link remains usable when navigation and footer requests fail', async () => {
    await page.route('**/partials/*.html', route => route.abort());
    try {
      await page.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.getAttribute('role')), 'main');
      assert.equal(await page.locator('h1').count(), 1);
    } finally { await page.unroute('**/partials/*.html'); }
  });
  await check('Five Lexicon lens filters expose selected state; hash changes reveal destinations', async () => {
    await visit('lexicon.html');
    for (const lens of ['all', 'shared', 'black', 'red', 'blue']) {
      await page.locator(`.lex-fbtn[data-lens="${lens}"]`).click();
      assert.equal(await page.locator('.lex-fbtn[aria-pressed="true"]').count(), 1);
      assert.equal(await page.locator('.lex-fbtn[aria-pressed="true"]').getAttribute('data-lens'), lens);
      assert.ok(await page.locator('.lex-card').count() > 0);
      if (lens !== 'all') assert.equal(await page.locator(`.lex-card:not(.lens-${lens})`).count(), 0);
    }
    await page.evaluate(() => { location.hash = 'red'; });
    await page.waitForFunction(() => document.querySelector('.lex-fbtn[data-lens="red"]').getAttribute('aria-pressed') === 'true');
    await page.goBack();
    await page.waitForFunction(() => document.querySelector('.lex-fbtn[data-lens="all"]').getAttribute('aria-pressed') === 'true');
    await page.locator('#lex-search').fill('no-such-lexicon-term-123');
    assert.equal(await page.locator('.lex-card').count(), 0);
    await page.evaluate(() => { location.hash = 'term-assortative-mating'; });
    await page.locator('#term-assortative-mating').waitFor();
    assert.equal(await page.locator('#lex-search').inputValue(), '');
    assert.equal(await page.locator('.lex-fbtn[data-lens="all"]').getAttribute('aria-pressed'), 'true');
  });
  await check('Gender Dynamics ignores malformed URI fragments and retains keyboard cards', async () => {
    const errors = [];
    const listener = error => errors.push(error.message);
    page.on('pageerror', listener);
    try {
      await visit('gender-dynamics.html#%E0%A4%A');
      await page.locator('.tab-btn').nth(1).click();
      const head = page.locator('.dyn-page.visible .dos-head').first();
      const before = await head.getAttribute('aria-expanded');
      await head.focus(); await page.keyboard.press('Enter');
      assert.notEqual(await head.getAttribute('aria-expanded'), before);
      assert.deepEqual(errors, []);
    } finally { page.off('pageerror', listener); }
  });
  for (const width of [390, 1920]) for (const mode of ['original', 'wide']) {
    await check(`Reference panels at ${width}px/${mode}: Dynamics, Five Levers, hierarchy, Mythbuster`, async () => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1080 });
      await visit('gender-dynamics.html');
      await page.evaluate(mode => { document.documentElement.dataset.contentWidth = mode; localStorage.setItem('le-content-width', mode); }, mode);
      const totalCards = await page.locator('.dos-head').count();
      let reviewedCards = 0;
      assert.equal(await page.locator('.tab-btn').count(), 4);
      for (let index = 0; index < 4; index++) {
        await page.locator('.tab-btn').nth(index).click();
        assert.equal(await page.locator('.dyn-page:visible').count(), 1);
        assert.equal(await page.locator('.tab-btn[aria-pressed="true"]').count(), 1);
        const heads = page.locator('.dyn-page.visible .dos-head');
        const count = await heads.count();
        reviewedCards += count;
        assert.equal(await heads.evaluateAll(items => items.every(head => head.getAttribute('role') === 'button'
          && head.tabIndex === 0 && head.getAttribute('aria-expanded') === String(head.nextElementSibling.classList.contains('open')))), true);
        if (count) for (const head of [heads.first(), heads.last()]) {
          const wasOpen = await head.getAttribute('aria-expanded');
          await head.focus(); await page.keyboard.press('Enter');
          assert.notEqual(await head.getAttribute('aria-expanded'), wasOpen);
          await page.keyboard.press('Space');
          assert.equal(await head.getAttribute('aria-expanded'), wasOpen);
        }
        await noOverflow(`Dynamics tab ${index}`);
      }
      assert.equal(reviewedCards, totalCards);

      await visit('smvlevers.html');
      assert.equal(await page.locator('.factor-tab').count(), 5);
      for (let index = 0; index < 5; index++) {
        await page.locator('.factor-tab').nth(index).click();
        assert.equal(await page.locator('.factor-tab[aria-selected="true"]').count(), 1);
        assert.equal(await page.locator('#dossier').getAttribute('aria-labelledby'), `tab-${index}`);
        assert.ok(await page.locator('#dossier .sub-card').count() > 0);
        await noOverflow(`Factor ${index}`);
      }
      await page.locator('#tab-4').focus(); await page.keyboard.press('Home');
      assert.equal(await page.locator('#tab-0').getAttribute('aria-selected'), 'true');
      await page.keyboard.press('End');
      assert.equal(await page.locator('#tab-4').getAttribute('aria-selected'), 'true');

      await visit('hierarchy.html');
      await page.evaluate(() => localStorage.removeItem('loveHierarchyBuilder'));
      await page.reload({ waitUntil: 'domcontentloaded' });
      assert.equal(await page.locator('.gates-collapsible').count(), 4);
      for (const disclosure of await page.locator('.gates-collapsible').all()) {
        await disclosure.locator('summary').click();
        assert.equal(await disclosure.getAttribute('open'), '');
        await noOverflow('Expanded hierarchy gates');
        await disclosure.locator('summary').click();
      }
      assert.equal(await page.locator('#builder-tiers .builder-tier').count(), 3);
      const addControls = page.locator('#builder-tiers .builder-add');
      assert.equal(await addControls.evaluateAll(items => items.every(item => item.tagName === 'BUTTON' && item.type === 'button')), true);
      await addControls.first().focus(); await page.keyboard.press('Enter');
      await page.locator('.bf-input').first().fill('Shared values');
      await page.locator('#builder-tiers .builder-add').last().focus(); await page.keyboard.press('Space');
      assert.equal(await page.locator('.bf-input').count(), 2);
      assert.equal(await page.locator('.bf-input[aria-label]').count(), 2);
      await page.locator('#builder-export-toggle').click();
      assert.equal(await page.locator('#builder-export-toggle').getAttribute('aria-expanded'), 'true');
      const exported = JSON.parse(await page.locator('#export-text').inputValue());
      assert.equal(exported[0].factors[0], 'Shared values');
      await page.locator('#builder-import-toggle').click();
      assert.equal(await page.locator('#builder-export-toggle').getAttribute('aria-expanded'), 'false');
      await page.locator('#import-text').fill('{broken');
      await page.locator('#bpanel-import .btn').click();
      assert.equal(await page.locator('#import-msg').textContent(), 'Invalid JSON');
      assert.equal(await page.locator('.bf-input').count(), 2);
      await page.locator('#import-text').fill(JSON.stringify(exported));
      await page.locator('#bpanel-import .btn').click();
      assert.equal(await page.locator('#import-msg').textContent(), 'Loaded');
      for (let count = 3; count < 6; count++) await page.locator('#add-tier-btn').click();
      assert.equal(await page.locator('#builder-tiers .builder-tier').count(), 6);
      assert.equal(await page.locator('#add-tier-btn').isVisible(), false);
      await page.locator('.bt-remove').last().click();
      assert.equal(await page.locator('#builder-tiers .builder-tier').count(), 5);
      await noOverflow('Custom hierarchy');
      await page.evaluate(() => localStorage.removeItem('loveHierarchyBuilder'));

      await visit('mythbuster.html');
      const cards = page.locator('.mb-card');
      assert.equal(await cards.count(), 65);
      for (const card of [cards.first(), cards.last()]) {
        const details = card.locator('.mb-fold');
        await details.evaluate(el => { el.open = false; });
        await details.locator('summary').focus(); await page.keyboard.press('Enter');
        assert.equal(await details.getAttribute('open'), '');
        await noOverflow('Open Mythbuster ruling');
      }
      for (const chip of await page.locator('.mb-chip').all()) {
        await chip.click();
        const category = await chip.getAttribute('data-category');
        assert.equal(await page.locator('.mb-chip[aria-pressed="true"]').count(), 1);
        assert.ok(await page.locator('.mb-card:visible').count() > 0);
        if (category !== 'all') assert.equal(await page.locator('.mb-card:visible').evaluateAll((items, category) => items.every(item => item.dataset.category === category), category), true);
      }
      await page.locator('.mb-chip[data-category="all"]').click();
      for (const verdict of ['confirmed', 'oversimplified', 'false', 'backwards']) {
        await page.locator('#mb-verdict').selectOption(verdict);
        assert.ok(await page.locator('.mb-card:visible').count() > 0);
        assert.equal(await page.locator('.mb-card:visible').evaluateAll((items, verdict) => items.every(item => item.dataset.verdicts.split(' ').includes(verdict)), verdict), true);
      }
      await page.locator('#mb-verdict').selectOption('all');
      await page.locator('#mb-search').fill('no-such-ruling-123');
      assert.equal(await page.locator('.mb-card:visible').count(), 0);
      assert.equal(await page.locator('#mb-no-results').isVisible(), true);
      await page.locator('#mb-search-clear').click();
      assert.equal(await page.locator('.mb-card:visible').count(), 65);
    });
  }
  for (const width of [320, 390, 1920]) for (const mode of ['original', 'wide']) {
    await check(`All three Pill dossiers fit and switch at ${width}px/${mode}`, async () => {
      await page.setViewportSize({ width, height: width < 1000 ? 844 : 1080 });
      await visit('pills.html');
      await page.evaluate(mode => { document.documentElement.dataset.contentWidth = mode; }, mode);
      for (let index = 0; index < 3; index++) {
        await page.locator('.pill-tab').nth(index).click();
        assert.equal(await page.locator('.pill-page:visible').count(), 1);
        assert.equal(await page.locator('.pill-tab[aria-pressed="true"]').count(), 1);
        await noOverflow(`Pill ${index}`);
        const cards = page.locator('.pill-page.visible .dossier-card');
        assert.ok(await cards.count() > 0);
        for (const card of [cards.first(), cards.last()]) {
          await card.scrollIntoViewIfNeeded();
          const box = await card.boundingBox();
          assert.ok(box.x >= -1 && box.x + box.width <= width + 1);
        }
      }
    });
  }
  const backToTopPages = pages.filter(file => file.startsWith('dd-')
    || ['frameworks.html', 'statistics.html', 'mythbuster.html', 'lexicon.html'].includes(file));
  assert.equal(backToTopPages.length, 12, 'Audit all four reference controls and eight essay controls');
  for (const file of backToTopPages) {
    await check(`${file}: back to top respects reduced motion and restores heading focus`, async () => {
      await visit(file);
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await page.locator('.back-to-top').waitFor({ state: 'visible' });
      await page.evaluate(() => {
        const scroll = window.scrollTo.bind(window);
        window.scrollTo = options => { window.__auditScrollBehavior = options.behavior; scroll(options); };
      });
      await page.locator('.back-to-top').click();
      assert.notEqual(await page.evaluate(() => window.__auditScrollBehavior), 'smooth');
      assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H1');
      assert.equal(await page.evaluate(() => window.scrollY), 0);
    });
  }
} finally {
  await context.close(); await browser.close(); await new Promise(resolve => server.close(resolve));
}
console.log(`Interaction audit: ${pages.length} page shells; ${failures} failure(s). CDN/model operations deliberately excluded.`);
if (failures) process.exitCode = 1;
