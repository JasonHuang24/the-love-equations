#!/usr/bin/env node
/**
 * Run the canonical Matchmaker roster portraits through face.html's real debug batch harness.
 *
 * This is intentionally browser-driven: MediaPipe detection, the production crop, ONNX preprocessing,
 * framing gates, and score mapping all execute in the page rather than in a second implementation.
 *
 * Usage:
 *   node tools/run_face_roster_batch.mjs \
 *     --base http://127.0.0.1:8765/face.html?debug \
 *     --out data/face-roster-pressure-test.csv
 *
 * If Playwright is not installed in this project, pass its ESM entry point explicitly:
 *   --playwright-module C:/path/to/node_modules/playwright/index.mjs
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const out = {
    base: 'http://127.0.0.1:8765/face.html?debug',
    output: path.join(ROOT, 'data', 'face-roster-pressure-test.csv'),
    playwrightModule: process.env.FACE_PLAYWRIGHT_MODULE || '',
    browserExecutable: process.env.FACE_BROWSER_EXECUTABLE || '',
    limit: 0,
    timeoutMinutes: 35,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === '--base' && value) { out.base = value; i += 1; }
    else if (flag === '--out' && value) { out.output = path.resolve(ROOT, value); i += 1; }
    else if (flag === '--playwright-module' && value) { out.playwrightModule = value; i += 1; }
    else if (flag === '--browser-executable' && value) { out.browserExecutable = path.resolve(value); i += 1; }
    else if (flag === '--limit' && value) { out.limit = Number(value) || 0; i += 1; }
    else if (flag === '--timeout-minutes' && value) { out.timeoutMinutes = Number(value) || 35; i += 1; }
    else if (flag === '--help') {
      console.log('Usage: node tools/run_face_roster_batch.mjs [--base URL] [--out FILE] [--playwright-module FILE] [--browser-executable FILE] [--limit N]');
      process.exit(0);
    }
  }
  return out;
}

async function loadPlaywright(modulePath) {
  if (modulePath) return import(pathToFileURL(path.resolve(modulePath)).href);
  try { return await import('playwright'); }
  catch (error) {
    throw new Error(`Playwright is unavailable. Install it locally or pass --playwright-module. (${error.message})`);
  }
}

function csvCell(value) {
  const s = String(value ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

async function rosterCases(limit) {
  const html = await fs.readFile(path.join(ROOT, 'matchmaker.html'), 'utf8');
  const start = html.indexOf('const ROSTER = [');
  const end = html.indexOf('\n  ];', start);
  if (start < 0 || end < 0) throw new Error('Could not locate Matchmaker ROSTER data.');
  const block = html.slice(start, end);
  const cases = [];
  const row = /\{\s*slug:'([^']+)'[^\n]*?\bg:'([fm])'[^\n]*?\blooks:([0-9.]+)/g;
  for (const match of block.matchAll(row)) {
    const image = path.join(ROOT, 'images', 'roster', `${match[1]}.jpg`);
    try { await fs.access(image); }
    catch { continue; }
    cases.push({ slug: match[1], sex: match[2], expectedLooks: Number(match[3]), image });
  }
  cases.sort((a, b) => a.slug.localeCompare(b.slug));
  if (!cases.length) throw new Error('No labelled canonical roster portraits were found.');
  return limit > 0 ? cases.slice(0, limit) : cases;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const cases = await rosterCases(options.limit);
  const { chromium } = await loadPlaywright(options.playwrightModule);
  const launchOptions = { headless: true, ...(options.browserExecutable ? { executablePath: options.browserExecutable } : {}) };
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: false });
  const page = await context.newPage();
  page.on('console', message => console.log(`[browser:${message.type()}] ${message.text()}`));
  page.on('pageerror', error => console.error(`[browser:error] ${error.message}`));

  try {
    console.log(`[face roster] opening ${options.base}`);
    await page.goto(options.base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForSelector('#lc-batch:not([hidden])', { timeout: 30_000 });
    // Allow both the remote MediaPipe assets and the local ~45 MB ONNX model to settle. The batch still
    // has its own per-image wait; this avoids wasting the first row on a detector that is visibly loading.
    await page.waitForTimeout(20_000);
    console.log(`[face roster] submitting ${cases.length} canonical portraits`);
    await page.locator('#lc-batch-file').setInputFiles(cases.map(item => item.image));

    const deadline = Date.now() + options.timeoutMinutes * 60_000;
    let lastStatus = '';
    while (Date.now() < deadline) {
      const status = (await page.locator('#lc-batch-status').textContent())?.trim() || '';
      if (status !== lastStatus) {
        console.log(`[face roster] ${status}`);
        lastStatus = status;
      }
      if (status.startsWith('Done')) break;
      await page.waitForTimeout(5_000);
    }
    if (!lastStatus.startsWith('Done')) throw new Error(`Batch timed out after ${options.timeoutMinutes} minutes: ${lastStatus}`);

    const columns = await page.locator('#lc-batch-table th').allTextContents();
    const values = await page.locator('#lc-batch-table tr').evaluateAll(rows => rows.slice(1).map(row =>
      Array.from(row.querySelectorAll('td'), cell => cell.textContent || '')
    ));
    if (values.length !== cases.length) throw new Error(`Expected ${cases.length} batch rows, got ${values.length}.`);
    const byFilename = new Map(values.map(rowValues => [rowValues[0], Object.fromEntries(columns.map((key, i) => [key, rowValues[i] || '']))]));
    const outputColumns = ['slug', 'expected_looks', 'expected_sex', ...columns];
    const lines = [outputColumns.map(csvCell).join(',')];
    for (const item of cases) {
      const measured = byFilename.get(path.basename(item.image));
      if (!measured) throw new Error(`Batch output omitted ${path.basename(item.image)}.`);
      const row = [item.slug, item.expectedLooks.toFixed(1), item.sex, ...columns.map(key => measured[key])];
      lines.push(row.map(csvCell).join(','));
    }
    await fs.mkdir(path.dirname(options.output), { recursive: true });
    await fs.writeFile(options.output, `${lines.join('\n')}\n`, 'utf8');
    console.log(`[face roster] wrote ${path.relative(ROOT, options.output)} (${cases.length} rows)`);
  } finally {
    await browser.close();
  }
}

await main();
