/** Site-wide rendered coverage. Starts a temporary server unless LE_AUDIT_BASE_URL is set.
 * CODEX_NODE_MODULES and LE_BROWSER_EXECUTABLE support the bundled runtime.
 * Geometry, keyboard checks, and screenshots are distinct evidence; inspect the
 * screenshots before making a visual-quality claim. No external account needed.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.CODEX_NODE_MODULES
  ? path.join(process.env.CODEX_NODE_MODULES, 'playwright') : 'playwright');
const server = process.env.LE_AUDIT_BASE_URL ? null : http.createServer(async (request, response) => {
  try {
    const target = path.resolve(root, `.${decodeURIComponent(new URL(request.url, 'http://local').pathname)}`);
    if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Invalid path');
    response.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.json': 'application/json', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png',
      '.webp': 'image/webp', '.svg': 'image/svg+xml', '.wasm': 'application/wasm' })[path.extname(target)] || 'application/octet-stream');
    response.end(await fs.readFile(target));
  } catch { response.statusCode = 404; response.end('Not found'); }
});
if (server) await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = process.env.LE_AUDIT_BASE_URL || `http://127.0.0.1:${server.address().port}`;
const output = path.join(root, 'artifacts', 'site-browser-audit');
await fs.mkdir(output, { recursive: true });
const files = (await fs.readdir(root)).filter(name => name.endsWith('.html')
  && (!process.env.LE_AUDIT_PAGES || process.env.LE_AUDIT_PAGES.split(',').includes(name))).sort();
// Breakpoint neighbors, intermediate widths, and both aspect ratios through 4K.
const sizes = [[320,740],[360,800],[390,844],[480,800],[481,800],[540,900],[560,900],
  [561,900],[650,900],[720,1024],[721,1024],[768,1024],[820,1180],[880,900],[881,900],
  [900,1000],[901,1000],[980,900],[981,900],[1024,768],[1180,900],[1280,720],
  [1280,800],[1366,768],[1440,900],[1480,900],[1481,900],[1600,900],[1680,1050],
  [1700,1050],[1701,1050],[1800,1050],[1801,1050],[1920,1080],[1920,1200],[2560,1440],[2560,1600],
  [3840,2160],[3840,2400]];
// Derive the remaining media-query boundaries from the actual stylesheets.
// This keeps coverage honest when a page gains a new breakpoint.
for (const file of (await fs.readdir(path.join(root, 'css'))).filter(name => name.endsWith('.css'))) {
  const css = await fs.readFile(path.join(root, 'css', file), 'utf8');
  for (const match of css.matchAll(/@media[^{}]*\((?:min|max)-width:\s*(\d+)px\)/g)) {
    for (const width of [Number(match[1]) - 1, Number(match[1]), Number(match[1]) + 1]) {
      if (!sizes.some(size => size[0] === width)) sizes.push([width, 900]);
    }
  }
}
sizes.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
const browser = await chromium.launch({ headless: true,
  ...(process.env.LE_BROWSER_EXECUTABLE ? { executablePath: process.env.LE_BROWSER_EXECUTABLE } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await context.newPage();
page.setDefaultTimeout(15_000);
const errors = [], geometry = [], checks = [], coverage = [], screenshots = [];
page.on('pageerror', error => errors.push({ url: page.url(), error: error.message }));

async function check(name, fn) {
  try { await fn(); checks.push({ name, pass: true }); }
  catch (error) { checks.push({ name, pass: false, error: error.message }); console.error(`FAIL ${name}: ${error.message}`); }
}
async function measure(file, width, height, mode, state = 'default') {
  const result = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const outside = [];
    for (const node of document.body.querySelectorAll('*')) {
      if (!node.checkVisibility({ checkVisibilityCSS: true })) continue;
      if (node.closest('.skip-link')) continue; // intentionally offscreen until focused
      const rect = node.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1 || (rect.left >= -2 && rect.right <= vw + 2)) continue;
      let contained = false;
      for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        if (/auto|scroll|hidden|clip/.test(getComputedStyle(parent).overflowX)) { contained = true; break; }
      }
      if (!contained) outside.push(node.id || `${node.tagName}.${node.className}`);
    }
    const nav = document.querySelector('.nav');
    const links = document.querySelector('.nav-links');
    const overflow = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - vw;
    const leaks = overflow > 2 ? [...document.body.querySelectorAll('*')].filter(node => {
      const rect = node.getBoundingClientRect();
      return node.checkVisibility({ checkVisibilityCSS: true }) && rect.width > 0 && rect.right > vw + 2;
    }).slice(0, 30).map(node => ({ selector: node.id || `${node.tagName}.${node.className}`,
      width: Math.round(node.getBoundingClientRect().width), right: Math.round(node.getBoundingClientRect().right) })) : [];
    return { overflow, leaks,
      outside: [...new Set(outside)], navHeight: nav?.getBoundingClientRect().height,
      menuScrollable: links ? links.scrollHeight > links.clientHeight : false };
  });
  geometry.push({ file, width, height, mode, state, ...result });
}
async function capture(name) {
  await page.screenshot({ path: path.join(output, `${name}.png`) });
  screenshots.push(name);
}

try {
  for (const file of files) {
    await page.goto(`${base}/${file}`, { waitUntil: 'load', timeout: 45_000 });
    await page.locator('.nav-link').first().waitFor({ state: 'attached' });
    await page.evaluate(() => document.fonts.ready);
    const inventory = await page.evaluate(() => ({
      main: document.querySelectorAll('main, [role="main"]').length,
      skip: document.querySelectorAll('.skip-link').length,
      navLinks: document.querySelectorAll('.nav-link').length,
      description: document.querySelector('meta[name="description"]')?.content || '',
      headings: document.querySelectorAll('h1').length,
    }));
    coverage.push({ file, ...inventory });
    await check(`${file}: shell coverage`, async () => {
      assert.equal(inventory.main, 1); assert.equal(inventory.skip, 1);
      assert.equal(inventory.navLinks, 16); assert.equal(inventory.headings, 1);
      assert.ok(inventory.description.trim());
    });
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      for (const mode of ['original', 'wide']) {
        await page.evaluate(value => { document.documentElement.dataset.contentWidth = value; }, mode);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        await measure(file, width, height, mode);
      }
    }
    // Mobile menu: all sixteen destinations must remain reachable, including last.
    await page.setViewportSize({ width: 320, height: 568 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await check(`${file}: skip and mobile keyboard navigation`, async () => {
      await page.locator('.skip-link').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.evaluate(() => document.activeElement.matches('main, [role="main"]')), true);
      await page.locator('.nav-toggle').focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('.nav-link')), true);
      await page.locator('.nav-link').last().focus();
      const rect = await page.locator('.nav-link').last().boundingBox();
      assert.ok(rect && rect.y >= 0 && rect.y + rect.height <= 570, JSON.stringify(rect));
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'), 'false');
      assert.equal(await page.locator('.nav-toggle').evaluate(node => node === document.activeElement), true);
    });
    // Representative top, middle, and end of every page, both reading modes.
    if (process.env.LE_AUDIT_SCREENSHOTS !== '0') {
      for (const [width, height, mode] of [[390,844,'original'],[1440,900,'original'],[3840,2160,'wide']]) {
        await page.setViewportSize({ width, height });
        await page.evaluate(value => { document.documentElement.dataset.contentWidth = value; }, mode);
        for (const [label, fraction] of [['top',0],['middle',0.5],['end',1]]) {
          await page.evaluate(value => window.scrollTo({ left: 0, top: (document.documentElement.scrollHeight - innerHeight) * value, behavior: 'instant' }), fraction);
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await capture(`${file.slice(0,-5)}-${width}-${mode}-${label}`);
        }
        if (width === 390) {
          await page.evaluate(() => window.scrollTo({ left: 0,
            top: document.querySelector('main, [role="main"]').getBoundingClientRect().bottom + scrollY - innerHeight,
            behavior: 'instant' }));
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await capture(`${file.slice(0,-5)}-${width}-${mode}-last-content`);
        }
      }
    }
    console.log(`AUDITED ${file}`);
  }
  await check('No uncaught browser exceptions', async () => assert.deepEqual(errors, []));
  await check('No horizontal page overflow or uncontained elements', async () => {
    const failures = geometry.filter(row => row.overflow > 2 || row.outside.length);
    assert.equal(failures.length, 0, JSON.stringify(failures.slice(0, 5)));
  });
} finally {
  const reportName = process.env.LE_AUDIT_PAGES ? 'report-focused.json' : 'report.json';
  await fs.writeFile(path.join(output, reportName), JSON.stringify({ files, sizes, coverage, checks, geometry, errors, screenshots }, null, 2));
  await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
console.log(`${checks.filter(row => row.pass).length}/${checks.length} checks; ${geometry.length} page/viewport/mode measurements; ${screenshots.length} screenshots`);
process.exitCode = checks.some(row => !row.pass) ? 1 : 0;
