#!/usr/bin/env node
/**
 * Run every production Matchmaker gallery portrait through face.html's real debug batch harness.
 *
 * Identity, split, label, and explicit editorial-demographic metadata are joined outside the page.
 * The page itself remains the source of truth for detection, crop, preprocessing, gates, ONNX inference,
 * score mapping, diagnostics, and the storage non-mutation guard.
 */

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const out = {
    base: 'http://127.0.0.1:8765/face.html?debug',
    output: path.join(ROOT, 'data', 'face-roster-gallery-batch.csv'),
    metadataOutput: path.join(ROOT, 'data', 'face-roster-gallery-batch.meta.json'),
    split: path.join(ROOT, 'data', 'face-identity-split-v1.csv'),
    playwrightModule: process.env.FACE_PLAYWRIGHT_MODULE || '',
    browserExecutable: process.env.FACE_BROWSER_EXECUTABLE || '',
    limitImages: 0,
    timeoutMinutes: 90,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === '--base' && value) { out.base = value; i += 1; }
    else if (flag === '--out' && value) { out.output = path.resolve(ROOT, value); i += 1; }
    else if (flag === '--metadata-out' && value) { out.metadataOutput = path.resolve(ROOT, value); i += 1; }
    else if (flag === '--split' && value) { out.split = path.resolve(ROOT, value); i += 1; }
    else if (flag === '--playwright-module' && value) { out.playwrightModule = value; i += 1; }
    else if (flag === '--browser-executable' && value) { out.browserExecutable = value; i += 1; }
    else if (flag === '--limit-images' && value) { out.limitImages = Number(value) || 0; i += 1; }
    else if (flag === '--timeout-minutes' && value) { out.timeoutMinutes = Number(value) || 90; i += 1; }
    else if (flag === '--help') {
      console.log('Usage: node tools/run_face_gallery_batch.mjs [--base URL] [--out FILE] [--metadata-out FILE] [--split FILE] [--playwright-module FILE] [--browser-executable FILE] [--limit-images N]');
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

function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') {
      row.push(cell.replace(/\r$/, '')); cell = '';
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell.replace(/\r$/, '')); rows.push(row); }
  const [head, ...body] = rows;
  return body.map(values => Object.fromEntries(head.map((key, index) => [key, values[index] ?? ''])));
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function sha256File(file) {
  return sha256(await fs.readFile(file));
}

async function galleryCases(splitPath, limitImages) {
  const [html, splitText] = await Promise.all([
    fs.readFile(path.join(ROOT, 'matchmaker.html'), 'utf8'),
    fs.readFile(splitPath, 'utf8'),
  ]);
  const splitRows = parseCsv(splitText);
  const splitByIdentity = new Map(splitRows.map(row => [row.identity_id, row]));
  if (splitByIdentity.size !== splitRows.length) throw new Error('Identity split contains duplicates.');

  const start = html.indexOf('const GALLERY_IMG = {');
  const end = html.indexOf(';\n', start);
  if (start < 0 || end < 0) throw new Error('Could not locate Matchmaker GALLERY_IMG.');
  const block = html.slice(start, end);
  const pattern = /images\/roster\/([^/'"]+)\/[^'"]+\.jpg/gi;
  const cases = [];
  const seen = new Set();
  for (const match of block.matchAll(pattern)) {
    const relativePath = match[0].replaceAll('\\', '/');
    if (seen.has(relativePath)) throw new Error(`Duplicate production gallery path: ${relativePath}`);
    seen.add(relativePath);
    const identity = splitByIdentity.get(match[1]);
    if (!identity) continue; // deliberate: split is frozen to the preserved 199 canonical identities
    const image = path.join(ROOT, ...relativePath.split('/'));
    await fs.access(image);
    cases.push({
      identityId: identity.identity_id,
      expectedLooks: identity.expected_looks,
      expectedSex: identity.expected_sex,
      editorialEthnicity: identity.editorial_ethnicity,
      split: identity.split,
      imageId: relativePath.slice('images/roster/'.length),
      relativePath,
      image,
    });
  }
  const represented = new Set(cases.map(item => item.identityId));
  const missingIdentities = splitRows.filter(row => !represented.has(row.identity_id)).map(row => row.identity_id);
  if (missingIdentities.length) throw new Error(`Frozen identities without production gallery images: ${missingIdentities.join(', ')}`);
  if (!cases.length) throw new Error('No frozen production gallery portraits were found.');
  return limitImages > 0 ? cases.slice(0, limitImages) : cases;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const cases = await galleryCases(options.split, options.limitImages);
  const pipelineFiles = [
    'face.html',
    'js/face-crop.js',
    'models/face-beauty.onnx',
    'models/face-sex.onnx',
    'data/face-identity-split-v1.csv',
  ];
  const pipelineHashes = {};
  for (const relative of pipelineFiles) {
    const absolute = path.join(ROOT, ...relative.split('/'));
    try { pipelineHashes[relative] = await sha256File(absolute); }
    catch { pipelineHashes[relative] = null; }
  }

  const { chromium } = await loadPlaywright(options.playwrightModule);
  const launchOptions = { headless: true, ...(options.browserExecutable ? { executablePath: options.browserExecutable } : {}) };
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: false });
  const page = await context.newPage();
  page.on('console', message => console.log(`[browser:${message.type()}] ${message.text()}`));
  page.on('pageerror', error => console.error(`[browser:error] ${error.message}`));

  let finalStatus = '';
  let storageBefore = '';
  let storageAfter = '';
  let columns = [];
  try {
    console.log(`[face gallery] opening ${options.base}`);
    await page.goto(options.base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForSelector('#lc-batch:not([hidden])', { timeout: 30_000 });
    await page.waitForFunction(() => typeof window.__lcBatchRun === 'function', null, { timeout: 30_000 });
    await page.waitForTimeout(20_000);
    storageBefore = await page.evaluate(() => window.__lcBatchLS());
    console.log(`[face gallery] submitting ${cases.length} production gallery portraits across ${new Set(cases.map(item => item.identityId)).size} identities`);
    await page.locator('#lc-batch-file').setInputFiles(cases.map(item => item.image));

    const deadline = Date.now() + options.timeoutMinutes * 60_000;
    let lastStatus = '';
    while (Date.now() < deadline) {
      const status = (await page.locator('#lc-batch-status').textContent())?.trim() || '';
      if (status !== lastStatus) {
        console.log(`[face gallery] ${status}`);
        lastStatus = status;
      }
      if (status.startsWith('Done')) break;
      await page.waitForTimeout(5_000);
    }
    finalStatus = lastStatus;
    if (!finalStatus.startsWith('Done')) throw new Error(`Batch timed out after ${options.timeoutMinutes} minutes: ${finalStatus}`);

    columns = await page.locator('#lc-batch-table th').allTextContents();
    const values = await page.locator('#lc-batch-table tr').evaluateAll(rows => rows.slice(1).map(row =>
      Array.from(row.querySelectorAll('td'), cell => cell.textContent || '')
    ));
    if (values.length !== cases.length) throw new Error(`Expected ${cases.length} batch rows, got ${values.length}.`);
    storageAfter = await page.evaluate(() => window.__lcBatchLS());
    if (storageBefore !== storageAfter) throw new Error('Batch mutated loveEquations.* localStorage.');

    const identityColumns = [
      'identity_id', 'expected_looks', 'expected_sex', 'editorial_ethnicity',
      'split', 'image_id', 'relative_path',
    ];
    const outputColumns = [...identityColumns, ...columns];
    const lines = [outputColumns.map(csvCell).join(',')];
    for (let index = 0; index < cases.length; index += 1) {
      const item = cases[index];
      const measuredValues = values[index];
      const measured = Object.fromEntries(columns.map((key, i) => [key, measuredValues[i] || '']));
      if (measured.filename !== path.basename(item.image)) {
        throw new Error(`Batch row order mismatch at ${index}: expected ${path.basename(item.image)}, got ${measured.filename}`);
      }
      const row = [
        item.identityId, item.expectedLooks, item.expectedSex, item.editorialEthnicity,
        item.split, item.imageId, item.relativePath,
        ...columns.map(key => measured[key]),
      ];
      lines.push(row.map(csvCell).join(','));
    }
    const outputText = `${lines.join('\n')}\n`;
    await fs.mkdir(path.dirname(options.output), { recursive: true });
    await fs.writeFile(options.output, outputText, 'utf8');

    const outcomeIndex = columns.indexOf('outcome');
    const outcomeCounts = {};
    for (const row of values) {
      const outcome = outcomeIndex >= 0 ? (row[outcomeIndex] || 'unknown') : 'unknown';
      outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1;
    }
    const metadata = {
      schema_version: 'face-roster-gallery-batch.v1',
      generated_at: new Date().toISOString(),
      base_url: options.base,
      cases: cases.length,
      identities: new Set(cases.map(item => item.identityId)).size,
      page_columns: columns,
      outcome_counts: outcomeCounts,
      storage_unchanged: true,
      final_status: finalStatus,
      pipeline_sha256: pipelineHashes,
      output_csv_sha256: sha256(outputText),
    };
    await fs.mkdir(path.dirname(options.metadataOutput), { recursive: true });
    await fs.writeFile(options.metadataOutput, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
    console.log(`[face gallery] wrote ${path.relative(ROOT, options.output)} (${cases.length} rows)`);
    console.log(`[face gallery] wrote ${path.relative(ROOT, options.metadataOutput)}; localStorage unchanged`);
  } finally {
    await browser.close();
  }
}

await main();
