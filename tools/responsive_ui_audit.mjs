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
const outputDir = path.join(root, 'artifacts', 'responsive-audit');

const viewports = [
  { name: 'mobile-360x800', width: 360, height: 800, family: 'mobile' },
  { name: 'mobile-390x844', width: 390, height: 844, family: 'mobile' },
  { name: 'mobile-412x915', width: 412, height: 915, family: 'mobile' },
  { name: 'tablet-768x1024', width: 768, height: 1024, family: 'tablet' },
  { name: 'tablet-820x1180', width: 820, height: 1180, family: 'tablet' },
  { name: 'desktop-1024x768', width: 1024, height: 768, family: 'desktop' },
  { name: '16x9-1280x720', width: 1280, height: 720, family: '16:9' },
  { name: '16x9-1366x768', width: 1366, height: 768, family: '16:9' },
  { name: '16x9-1536x864', width: 1536, height: 864, family: '16:9' },
  { name: '16x9-1600x900', width: 1600, height: 900, family: '16:9' },
  { name: '16x9-1920x1080', width: 1920, height: 1080, family: '16:9' },
  { name: '16x9-2560x1440', width: 2560, height: 1440, family: '16:9' },
  { name: '16x9-3840x2160', width: 3840, height: 2160, family: '16:9' },
  { name: '16x10-1280x800', width: 1280, height: 800, family: '16:10' },
  { name: '16x10-1440x900', width: 1440, height: 900, family: '16:10' },
  { name: '16x10-1680x1050', width: 1680, height: 1050, family: '16:10' },
  { name: '16x10-1920x1200', width: 1920, height: 1200, family: '16:10' },
  { name: '16x10-2560x1600', width: 2560, height: 1600, family: '16:10' },
  { name: '16x10-3840x2400', width: 3840, height: 2400, family: '16:10' },
];

const htmlFiles = (await fs.readdir(root))
  .filter((name) => name.endsWith('.html'))
  .sort();

function modesFor(viewport) {
  return viewport.width <= 980 ? ['wide'] : ['original', 'wide'];
}

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.LE_BROWSER_EXECUTABLE || chromium.executablePath(),
});
const results = [];

try {
  for (const viewport of viewports) {
    for (const mode of modesFor(viewport)) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      });
      await context.addInitScript((widthMode) => {
        try { localStorage.setItem('le-content-width', widthMode); } catch {}
      }, mode);

      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => consoleErrors.push(error.message));

      for (const htmlFile of htmlFiles) {
        consoleErrors.length = 0;
        const url = `${baseUrl}/${htmlFile}?responsive-audit=${viewport.name}-${mode}`;
        let navigationError = '';
        try {
          await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
          await page.evaluate(() => document.fonts?.ready);
        } catch (error) {
          navigationError = error.message;
        }

        const metrics = navigationError ? null : await page.evaluate(() => {
          const viewportWidth = document.documentElement.clientWidth;
          const rootScrollWidth = document.documentElement.scrollWidth;
          const bodyScrollWidth = document.body?.scrollWidth || 0;

          function selectorFor(element) {
            if (element.id) return `#${CSS.escape(element.id)}`;
            const parts = [];
            let current = element;
            while (current && current !== document.body && parts.length < 4) {
              let part = current.tagName.toLowerCase();
              if (current.classList.length) part += `.${[...current.classList].slice(0, 2).map(CSS.escape).join('.')}`;
              parts.unshift(part);
              current = current.parentElement;
            }
            return parts.join(' > ');
          }

          function hasScrollableAncestor(element) {
            for (let current = element.parentElement; current && current !== document.body; current = current.parentElement) {
              const style = getComputedStyle(current);
              if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) return true;
            }
            return false;
          }

          const offenders = [];
          for (const element of document.body.querySelectorAll('*')) {
            const style = getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden') continue;
            const rect = element.getBoundingClientRect();
            if (rect.width <= 0 || rect.height <= 0) continue;
            const leaksLeft = rect.left < -2;
            const leaksRight = rect.right > viewportWidth + 2;
            const clipsOwnContent = element.scrollWidth > element.clientWidth + 2
              && !/(auto|scroll)/.test(style.overflowX);
            if ((leaksLeft || leaksRight || clipsOwnContent) && !hasScrollableAncestor(element)) {
              offenders.push({
                selector: selectorFor(element),
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                clientWidth: element.clientWidth,
                scrollWidth: element.scrollWidth,
                overflowX: style.overflowX,
              });
              if (offenders.length >= 12) break;
            }
          }

          const widthMode = document.documentElement.dataset.contentWidth || '';
          const nav = document.querySelector('.nav-inner');
          const content = document.querySelector('.content');
          const componentFailures = [];
          const ladder = document.querySelector('.ladder-graph');
          if (ladder && viewportWidth > 980 && content) {
            const ladderWidth = ladder.getBoundingClientRect().width;
            const contentWidth = content.getBoundingClientRect().width;
            const minimumUsefulWidth = Math.min(560, contentWidth * 0.75);
            if (ladderWidth + 2 < minimumUsefulWidth) {
              componentFailures.push({
                selector: '.ladder-graph',
                width: Math.round(ladderWidth),
                minimumUsefulWidth: Math.round(minimumUsefulWidth),
              });
            }
          }
          return {
            viewportWidth,
            rootScrollWidth,
            bodyScrollWidth,
            globalOverflow: Math.max(rootScrollWidth, bodyScrollWidth) - viewportWidth,
            widthMode,
            navWidth: nav ? Math.round(nav.getBoundingClientRect().width) : null,
            contentWidth: content ? Math.round(content.getBoundingClientRect().width) : null,
            offenders,
            componentFailures,
          };
        });

        results.push({
          page: htmlFile,
          viewport,
          mode,
          navigationError,
          consoleErrors: [...new Set(consoleErrors)].slice(0, 10),
          metrics,
        });
      }

      await context.close();
    }
  }
} finally {
  await browser.close();
}

const failures = results.filter((result) =>
  result.navigationError
  || !result.metrics
  || result.metrics.globalOverflow > 2
  || result.metrics.componentFailures.length
  || result.metrics.widthMode !== result.mode
);

const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  pages: htmlFiles,
  viewports,
  caseCount: results.length,
  failureCount: failures.length,
  failures,
};

await fs.writeFile(path.join(outputDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(`RESPONSIVE CASES=${results.length}`);
console.log(`RESPONSIVE FAILURES=${failures.length}`);
for (const failure of failures.slice(0, 80)) {
  const reason = failure.navigationError
    || `overflow=${failure.metrics?.globalOverflow ?? 'n/a'} offenders=${failure.metrics?.offenders.length ?? 'n/a'} widthMode=${failure.metrics?.widthMode || 'missing'}`;
  console.log(`${failure.viewport.name} ${failure.mode} ${failure.page}: ${reason}`);
  for (const offender of failure.metrics?.offenders || []) console.log(`  ${JSON.stringify(offender)}`);
}

if (failures.length) process.exitCode = 1;
