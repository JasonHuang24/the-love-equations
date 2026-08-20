#!/usr/bin/env node
/** Drive a manifest through body.html's real production debug-batch pipeline. */

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SCRIPT = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(SCRIPT), '..');

function argsFor(argv) {
  const options = {
    base: 'http://127.0.0.1:8765/body.html?debug',
    manifest: '', metadata: '', photos: '', output: '', metadataOutput: '',
    pipelineRoot: ROOT,
    playwrightModule: process.env.BODY_PLAYWRIGHT_MODULE || '',
    browserExecutable: process.env.BODY_BROWSER_EXECUTABLE || '',
    timeoutMinutes: 60,
  };
  const names = new Map([
    ['--base', 'base'], ['--pipeline-root', 'pipelineRoot'], ['--manifest', 'manifest'], ['--dataset-metadata', 'metadata'],
    ['--photos', 'photos'], ['--out', 'output'], ['--metadata-out', 'metadataOutput'],
    ['--playwright-module', 'playwrightModule'], ['--browser-executable', 'browserExecutable'],
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (names.has(flag) && argv[index + 1]) {
      options[names.get(flag)] = argv[++index];
    } else if (flag === '--timeout-minutes' && argv[index + 1]) {
      options.timeoutMinutes = Number(argv[++index]);
    } else if (flag === '--help') {
      console.log('Usage: node tools/run_body_manifest_batch.mjs --manifest CSV --dataset-metadata JSON --photos DIR --out CSV --metadata-out JSON [--base URL] [--pipeline-root DIR] [--playwright-module FILE] [--browser-executable FILE] [--timeout-minutes N]');
      process.exit(0);
    } else {
      throw new Error(`unknown or incomplete argument: ${flag}`);
    }
  }
  for (const key of ['manifest', 'metadata', 'photos', 'output', 'metadataOutput']) {
    if (!options[key]) throw new Error(`missing required --${key.replace(/[A-Z]/g, value => `-${value.toLowerCase()}`)}`);
  }
  for (const key of ['pipelineRoot', 'manifest', 'metadata', 'photos', 'output', 'metadataOutput']) {
    options[key] = path.resolve(ROOT, options[key]);
  }
  if (!Number.isFinite(options.timeoutMinutes) || options.timeoutMinutes <= 0) {
    throw new Error('--timeout-minutes must be a positive number');
  }
  return options;
}

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function fileHash(file) {
  return sha256(await fs.readFile(file));
}

function parseCsv(text) {
  const matrix = [];
  let row = [], cell = '', quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(cell); cell = ''; }
    else if (char === '\n') {
      row.push(cell.replace(/\r$/, '')); cell = '';
      if (row.some(value => value !== '')) matrix.push(row);
      row = [];
    } else cell += char;
  }
  if (quoted) throw new Error('unterminated quoted CSV field');
  if (cell || row.length) { row.push(cell.replace(/\r$/, '')); matrix.push(row); }
  if (!matrix.length) return { columns: [], rows: [] };
  const [columns, ...body] = matrix;
  if (new Set(columns).size !== columns.length) throw new Error('manifest has duplicate columns');
  for (const [index, values] of body.entries()) {
    if (values.length !== columns.length) {
      throw new Error(`manifest row ${index + 2} has ${values.length} cells; expected ${columns.length}`);
    }
  }
  return { columns, rows: body.map(values => Object.fromEntries(columns.map((key, i) => [key, values[i] ?? '']))) };
}

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function loadPlaywright(modulePath) {
  if (modulePath) return import(pathToFileURL(path.resolve(modulePath)).href);
  return import('playwright');
}

function readUrl(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;
    const request = client.get(parsed, response => {
      const status = response.statusCode || 0;
      if (status >= 300 && status < 400 && response.headers.location) {
        response.resume();
        if (redirects <= 0) { reject(new Error(`too many redirects fetching ${url}`)); return; }
        readUrl(new URL(response.headers.location, parsed).href, redirects - 1).then(resolve, reject);
        return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status, body: Buffer.concat(chunks) }));
    });
    request.setTimeout(60_000, () => request.destroy(new Error(`timeout fetching ${url}`)));
    request.on('error', reject);
  });
}

function assertDatasetMetadata(dataset, manifest, manifestHash) {
  if (!dataset || typeof dataset !== 'object' || Array.isArray(dataset)) {
    throw new Error('dataset metadata must be a JSON object');
  }
  if (dataset.manifest_sha256 !== manifestHash) {
    throw new Error('dataset metadata does not bind to manifest bytes');
  }
  if (dataset.cases !== manifest.rows.length) {
    throw new Error(`dataset metadata cases=${dataset.cases}; manifest rows=${manifest.rows.length}`);
  }
  if (!dataset.dataset || typeof dataset.dataset !== 'string') throw new Error('dataset metadata is missing dataset name');
  if (!dataset.label || typeof dataset.label !== 'object') throw new Error('dataset metadata is missing label definition');
  if (!manifest.columns.includes(dataset.label.field)) throw new Error(`manifest is missing declared label field ${dataset.label.field}`);
  if (typeof dataset.label.independent_of_shipped_model !== 'boolean') {
    throw new Error('dataset label metadata must state independent_of_shipped_model');
  }
}

async function bindServedPipeline(baseUrl, pipelineRoot, pipelineFiles) {
  const local = {};
  const served = {};
  for (const relative of pipelineFiles) {
    const localPath = path.join(pipelineRoot, ...relative.split('/'));
    let localHash = null;
    try { localHash = await fileHash(localPath); }
    catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    local[relative] = localHash;
    const response = await readUrl(new URL(relative, baseUrl).href);
    const servedHash = response.status === 200 ? sha256(response.body) : null;
    served[relative] = servedHash;
    if (localHash !== servedHash) {
      throw new Error(`served pipeline mismatch for ${relative}: local=${localHash || 'missing'} served=${servedHash || `HTTP ${response.status}`}`);
    }
  }
  return { local, served };
}

function normalizeBatchRow(row) {
  return { ...row, timestamp: '' };
}

async function main() {
  const options = argsFor(process.argv.slice(2));
  const manifestText = await fs.readFile(options.manifest, 'utf8');
  const manifest = parseCsv(manifestText);
  const required = ['image_id', 'filename', 'image_sha256'];
  for (const column of required) if (!manifest.columns.includes(column)) throw new Error(`manifest missing ${column}`);
  if (!manifest.rows.length) throw new Error('manifest has no rows');
  const manifestHash = sha256(manifestText);
  const datasetMetadataText = await fs.readFile(options.metadata, 'utf8');
  const dataset = JSON.parse(datasetMetadataText);
  assertDatasetMetadata(dataset, manifest, manifestHash);

  const files = [];
  const photosRoot = await fs.realpath(options.photos);
  const imageIds = new Set();
  const filenames = new Set();
  for (const row of manifest.rows) {
    if (!row.image_id || imageIds.has(row.image_id)) throw new Error(`missing/duplicate image_id: ${row.image_id}`);
    if (!row.filename || filenames.has(row.filename)) throw new Error(`missing/duplicate filename: ${row.filename}`);
    if (!/^[a-f0-9]{64}$/.test(row.image_sha256)) throw new Error(`invalid image_sha256: ${row.filename}`);
    if (!Number.isFinite(Number(row[dataset.label.field]))) throw new Error(`non-finite ${dataset.label.field}: ${row.image_id}`);
    imageIds.add(row.image_id);
    filenames.add(row.filename);
    const file = path.resolve(photosRoot, row.filename);
    if (path.dirname(file) !== photosRoot || path.basename(row.filename) !== row.filename) {
      throw new Error(`nested/unsafe filename: ${row.filename}`);
    }
    const realFile = await fs.realpath(file);
    if (path.dirname(realFile) !== photosRoot) throw new Error(`image resolves outside photo root: ${row.filename}`);
    const actual = await fileHash(realFile);
    if (actual !== row.image_sha256) throw new Error(`image hash mismatch: ${row.filename}`);
    files.push(realFile);
  }

  const pipelineFiles = [
    'body.html', 'css/body.css', 'js/body-pose-worker.js', 'js/body-arm-band.js',
    'js/body-camera-guide.js', 'js/body-state.js', 'js/body-model-integrity.js', 'js/composite-score.js',
    'models/body-beauty.onnx', 'models/face-sex.onnx',
  ];
  const pipelineBinding = await bindServedPipeline(options.base, options.pipelineRoot, pipelineFiles);

  const { chromium } = await loadPlaywright(options.playwrightModule);
  const browser = await chromium.launch({
    headless: true,
    ...(options.browserExecutable ? { executablePath: options.browserExecutable } : {}),
  });
  const browserVersion = await browser.version();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: false });
  const page = await context.newPage();
  const browserErrors = [];
  const browserDiagnostics = [];
  page.on('pageerror', error => browserErrors.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    const text = message.text();
    if (/\[body batch\]/i.test(text)) console.log(`[browser:${message.type()}] ${text}`);
    if (message.type() === 'error') {
      if (/favicon|Failed to load resource|^INFO: Created TensorFlow Lite XNNPACK delegate for CPU\.?$/i.test(text)) browserDiagnostics.push(`console: ${text}`);
      else browserErrors.push(`console: ${text}`);
    }
  });

  let measured = [], storageBefore = '', storageAfter = '', finalStatus = '';
  try {
    console.log(`[body manifest batch] opening ${options.base}`);
    await page.goto(options.base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await page.waitForSelector('#bc-batch:not([hidden])', { timeout: 30_000 });
    await page.waitForFunction(() => typeof window.__bcBatchRun === 'function', null, { timeout: 30_000 });
    await page.waitForTimeout(20_000);
    storageBefore = await page.evaluate(() => {
      localStorage.setItem('loveEquations.__bodyBatchAudit', '{"sentinel":"preserve-love-equations"}');
      localStorage.setItem('__bodyBatchAuditUnrelated', 'preserve-unrelated-local');
      sessionStorage.setItem('__bodyBatchAuditSession', 'preserve-session');
      const snapshot = storage => Object.keys(storage).sort().map(key => [key, storage.getItem(key)]);
      return JSON.stringify({ local: snapshot(localStorage), session: snapshot(sessionStorage) });
    });
    await page.locator('#bc-batch-file').setInputFiles(files);
    const deadline = Date.now() + options.timeoutMinutes * 60_000;
    let priorStatus = '';
    while (Date.now() < deadline) {
      finalStatus = (await page.locator('#bc-batch-status').textContent())?.trim() || '';
      if (finalStatus !== priorStatus) { console.log(`[body manifest batch] ${finalStatus}`); priorStatus = finalStatus; }
      if (finalStatus.startsWith('Done')) break;
      await page.waitForTimeout(3_000);
    }
    if (!finalStatus.startsWith('Done')) throw new Error(`batch timeout: ${finalStatus}`);
    measured = await page.evaluate(() => window.__bcBatchRows.map(row => ({ ...row })));
    if (measured.length !== manifest.rows.length) throw new Error(`expected ${manifest.rows.length} rows, got ${measured.length}`);
    storageAfter = await page.evaluate(() => {
      const snapshot = storage => Object.keys(storage).sort().map(key => [key, storage.getItem(key)]);
      return JSON.stringify({ local: snapshot(localStorage), session: snapshot(sessionStorage) });
    });
    if (storageAfter !== storageBefore) throw new Error('localStorage or sessionStorage changed');
    if (browserErrors.length) throw new Error(`browser errors: ${browserErrors.join(' | ')}`);
  } finally {
    await browser.close();
  }

  const pageColumns = Object.keys(measured[0] || {});
  const columns = [...manifest.columns, ...pageColumns.filter(column => !manifest.columns.includes(column))];
  const outputRows = [];
  for (let index = 0; index < measured.length; index += 1) {
    const expected = manifest.rows[index];
    const actual = normalizeBatchRow(measured[index]);
    if (actual.filename !== expected.filename) throw new Error(`row order mismatch at ${index}`);
    outputRows.push({ ...expected, ...actual });
  }
  const outputText = [columns.join(','), ...outputRows.map(row => columns.map(column => csvCell(row[column])).join(','))].join('\n') + '\n';
  await fs.mkdir(path.dirname(options.output), { recursive: true });
  await fs.writeFile(options.output, outputText, 'utf8');

  const counts = key => Object.fromEntries(Object.entries(outputRows.reduce((all, row) => {
    const value = row[key] || 'unknown'; all[value] = (all[value] || 0) + 1; return all;
  }, {})).sort());
  const report = {
    schema_version: 'body-production-manifest-batch.v1',
    generated_at: new Date().toISOString(),
    command: [process.execPath, SCRIPT, ...process.argv.slice(2)],
    base_url: options.base,
    dataset,
    dataset_metadata: path.relative(ROOT, options.metadata),
    dataset_metadata_sha256: sha256(datasetMetadataText),
    manifest: path.relative(ROOT, options.manifest),
    manifest_sha256: manifestHash,
    tool_sha256: await fileHash(SCRIPT),
    cases: outputRows.length,
    page_columns: pageColumns,
    outcome_counts: counts('outcome'),
    route_counts: counts('routing'),
    refusal_counts: Object.fromEntries(Object.entries(outputRows.reduce((all, row) => {
      if (row.outcome === 'scored') return all;
      const reason = row.cause || row.refusal || 'unknown'; all[reason] = (all[reason] || 0) + 1; return all;
    }, {})).sort()),
    storage_before_sha256: sha256(storageBefore),
    storage_after_sha256: sha256(storageAfter),
    storage_unchanged: storageBefore === storageAfter,
    storage_fixture: {
      love_equations: true,
      unrelated_local_storage: true,
      session_storage: true,
    },
    browser_errors: browserErrors,
    browser_diagnostics: browserDiagnostics,
    final_status: finalStatus,
    pipeline_root: options.pipelineRoot,
    pipeline_sha256: pipelineBinding.local,
    served_pipeline_sha256: pipelineBinding.served,
    served_pipeline_matches_root: true,
    normalized_runtime_fields: ['timestamp'],
    output_csv_sha256: sha256(outputText),
    runtime: {
      node: process.version,
      browser: browserVersion,
    },
  };
  await fs.mkdir(path.dirname(options.metadataOutput), { recursive: true });
  await fs.writeFile(options.metadataOutput, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ rows: outputRows.length, outcomes: report.outcome_counts, routes: report.route_counts, storage_unchanged: true }, null, 2));
}

const invoked = process.argv[1] && path.resolve(process.argv[1]) === SCRIPT;
if (invoked) await main();

export {
  argsFor,
  assertDatasetMetadata,
  bindServedPipeline,
  normalizeBatchRow,
  parseCsv,
  sha256,
};
