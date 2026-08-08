import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const moduleRoot = process.env.CODEX_NODE_MODULES;
if (!moduleRoot) throw new Error('CODEX_NODE_MODULES must point to the bundled node_modules directory.');
const { chromium } = require(path.join(moduleRoot, 'playwright'));

const root = path.resolve(import.meta.dirname, '..');
const baseUrl = process.env.LE_AUDIT_BASE_URL || 'http://127.0.0.1:8765';
const outputDir = path.join(root, 'artifacts', 'responsive-audit', 'previews');

const cases = [
  { name: 'mobile-390x844-wide', width: 390, height: 844, mode: 'wide' },
  { name: 'tablet-820x1180-wide', width: 820, height: 1180, mode: 'wide' },
  { name: '1080p-original', width: 1920, height: 1080, mode: 'original' },
  { name: '1080p-wide', width: 1920, height: 1080, mode: 'wide' },
  { name: '1200p-wide', width: 1920, height: 1200, mode: 'wide' },
  { name: '1440p-wide', width: 2560, height: 1440, mode: 'wide' },
  { name: '1600p-wide', width: 2560, height: 1600, mode: 'wide' },
  { name: '4k-16x9-wide', width: 3840, height: 2160, mode: 'wide' },
  { name: '4k-16x10-wide', width: 3840, height: 2400, mode: 'wide' },
];

const scenes = [
  { name: 'home-top', page: 'index.html', selector: null },
  { name: 'home-instruments', page: 'index.html', selector: '.inst' },
  { name: 'hierarchy', page: 'hierarchy.html', selector: '.hierarchy-intro-flat' },
  { name: 'frameworks-toc', page: 'frameworks.html', selector: '.page-toc' },
  { name: 'frameworks-ladder', page: 'frameworks.html', selector: '#conversion-ladder' },
  { name: 'frameworks-readiness', page: 'frameworks.html', selector: '#readiness-gate' },
  { name: 'matchmaker', page: 'matchmaker.html', selector: '.mm-form-wrap' },
  { name: 'lab', page: 'lab.html', selector: '.lab-shell' },
  { name: 'pills', page: 'pills.html', selector: '.dossier-hero' },
  { name: 'statistics-lab-badge', page: 'statistics.html', selector: '#stat-shared-positive-affect' },
  { name: 'deep-dive-callout', page: 'dd-relationships-throughout-history.html', selector: '#great-unbundling' },
];

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.LE_BROWSER_EXECUTABLE || chromium.executablePath(),
});

try {
  for (const captureCase of cases) {
    const caseDir = path.join(outputDir, captureCase.name);
    await fs.mkdir(caseDir, { recursive: true });
    const context = await browser.newContext({
      viewport: { width: captureCase.width, height: captureCase.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    await context.addInitScript((mode) => {
      try { localStorage.setItem('le-content-width', mode); } catch {}
    }, captureCase.mode);
    const page = await context.newPage();

    for (const scene of scenes) {
      await page.goto(`${baseUrl}/${scene.page}?responsive-preview=${captureCase.name}`, {
        waitUntil: 'load',
        timeout: 30_000,
      });
      await page.evaluate(() => document.fonts?.ready);
      if (scene.selector) {
        const target = page.locator(scene.selector).first();
        if (await target.count()) await target.scrollIntoViewIfNeeded();
      } else {
        await page.evaluate(() => scrollTo(0, 0));
      }
      await page.screenshot({ path: path.join(caseDir, `${scene.name}.png`) });
    }
    await context.close();
    console.log(`CAPTURED ${captureCase.name}`);
  }
} finally {
  await browser.close();
}
