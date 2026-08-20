#!/usr/bin/env node
/**
 * Drive body.html's debug batch with the real production browser pipeline.
 *
 * The page owns pose/segmentation, person crop, ONNX preprocessing/inference,
 * routing, gates, sex handling, geometry, percentile mapping, and composite
 * shaping. This wrapper only supplies files, joins licensed labels/provenance,
 * verifies localStorage invariance, and binds every result to pipeline hashes.
 */

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { bindServedPipeline } from './run_body_manifest_batch.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONNOR_ARCHIVE_SHA256 = '71577e780ca5a9ba7a54653b55cca14bbbefe1be1783362ee9a9c0f581a950e8';
const CONNOR_SOURCE_URL = 'https://osf.io/download/khm9a/';

function parseArgs(argv) {
  const cacheRoot = path.join(ROOT, 'artifacts', 'body-evaluation-cache', 'connor', 'full_body_photo_database');
  const out = {
    base: 'http://127.0.0.1:8765/body.html?debug',
    photos: path.join(cacheRoot, 'photos'),
    labels: path.join(cacheRoot, 'rating data', 'aggregated_photo_ratings.csv'),
    output: path.join(ROOT, 'data', 'body-connor-batch.csv'),
    metadataOutput: path.join(ROOT, 'data', 'body-connor-batch.meta.json'),
    pipelineRoot: ROOT,
    playwrightModule: process.env.BODY_PLAYWRIGHT_MODULE || '',
    browserExecutable: process.env.BODY_BROWSER_EXECUTABLE || '',
    limitImages: 0,
    timeoutMinutes: 120,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (flag === '--base' && value) { out.base = value; i += 1; }
    else if (flag === '--pipeline-root' && value) { out.pipelineRoot = path.resolve(ROOT, value); i += 1; }
    else if (flag === '--photos' && value) { out.photos = path.resolve(ROOT, value); i += 1; }
    else if (flag === '--labels' && value) { out.labels = path.resolve(ROOT, value); i += 1; }
    else if (flag === '--out' && value) { out.output = path.resolve(ROOT, value); i += 1; }
    else if (flag === '--metadata-out' && value) { out.metadataOutput = path.resolve(ROOT, value); i += 1; }
    else if (flag === '--playwright-module' && value) { out.playwrightModule = value; i += 1; }
    else if (flag === '--browser-executable' && value) { out.browserExecutable = value; i += 1; }
    else if (flag === '--limit-images' && value) { out.limitImages = Number(value) || 0; i += 1; }
    else if (flag === '--timeout-minutes' && value) { out.timeoutMinutes = Number(value) || 120; i += 1; }
    else if (flag === '--help') {
      console.log('Usage: node tools/run_body_batch.mjs [--photos DIR] [--labels CSV] [--out CSV] [--metadata-out JSON] [--base URL] [--pipeline-root DIR] [--playwright-module FILE] [--browser-executable FILE] [--limit-images N] [--timeout-minutes N]');
      process.exit(0);
    } else {
      throw new Error(`unknown or incomplete argument: ${flag}`);
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

function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function sha256File(file) {
  return sha256(await fs.readFile(file));
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
  if (!rows.length) return [];
  const [head, ...body] = rows;
  return body.map(values => Object.fromEntries(head.map((key, index) => [key, values[index] ?? ''])));
}

function normalizePhotoId(value) {
  return String(value || '').trim().replaceAll('.', '-');
}

function tokensForId(id) {
  return String(id || '').split('-').filter(Boolean);
}

function tokenSex(token) {
  const match = /^[A-Z]([MF])/i.exec(String(token || ''));
  return match ? match[1].toLowerCase() : '';
}

function tokenRace(token) {
  const match = /^([ABW])[MF]/i.exec(String(token || ''));
  return match ? match[1].toUpperCase() : '';
}

function identityGroups(ids) {
  const parent = new Map();
  const find = value => {
    if (!parent.has(value)) parent.set(value, value);
    let root = value;
    while (parent.get(root) !== root) root = parent.get(root);
    let node = value;
    while (parent.get(node) !== root) {
      const next = parent.get(node);
      parent.set(node, root);
      node = next;
    }
    return root;
  };
  const union = (a, b) => {
    const left = find(a), right = find(b);
    if (left !== right) parent.set(left, right);
  };
  for (const id of ids) {
    const tokens = tokensForId(id);
    for (let i = 1; i < tokens.length; i += 1) union(tokens[0], tokens[i]);
  }
  return new Map(ids.map(id => [id, find(tokensForId(id)[0])]));
}

async function connorCases(options) {
  const labelText = await fs.readFile(options.labels, 'utf8');
  const labelRows = parseCsv(labelText);
  const labelColumn = labelRows.length && Object.keys(labelRows[0]).find(key => key.toLowerCase() === 'attractiveness_mean');
  const photoColumn = labelRows.length && Object.keys(labelRows[0]).find(key => key.toLowerCase() === 'photo');
  if (!labelColumn || !photoColumn) throw new Error('Connor aggregate CSV is missing photo/attractiveness_mean.');

  const ids = labelRows.map(row => normalizePhotoId(row[photoColumn]));
  const groups = identityGroups(ids);
  const cases = [];
  const excludedLabels = [];
  for (let index = 0; index < labelRows.length; index += 1) {
    const row = labelRows[index];
    const imageId = ids[index];
    const label = Number(row[labelColumn]);
    if (!imageId || !Number.isFinite(label)) {
      excludedLabels.push({ image_id: imageId || String(row[photoColumn] || ''), reason: 'missing attractiveness_mean' });
      continue;
    }
    const image = path.join(options.photos, `${imageId}.png`);
    await fs.access(image);
    const tokens = tokensForId(imageId);
    const bodyToken = tokens[tokens.length - 1];
    cases.push({
      imageId,
      image,
      label,
      identityGroup: groups.get(imageId),
      bodyId: bodyToken,
      headId: tokens[0],
      variant: tokens.length > 1 ? 'headswap' : 'original',
      sex: tokenSex(bodyToken),
      demographicCode: tokenRace(bodyToken),
    });
  }
  if (!cases.length) throw new Error('No Connor image/label pairs were found.');
  return {
    cases: options.limitImages > 0 ? cases.slice(0, options.limitImages) : cases,
    usableLabelCases: cases.length,
    sourceStimuli: labelRows.length,
    excludedLabels,
    labelsSha256: sha256(labelText),
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { cases, usableLabelCases, sourceStimuli, excludedLabels, labelsSha256 } = await connorCases(options);
  const pipelineFiles = [
    'body.html', 'css/body.css', 'js/body-pose-worker.js', 'js/body-arm-band.js',
    'js/body-camera-guide.js', 'js/body-state.js', 'js/composite-score.js',
    'models/body-beauty.onnx', 'models/face-sex.onnx',
  ];
  const pipelineBinding = await bindServedPipeline(options.base, options.pipelineRoot, pipelineFiles);

  const { chromium } = await loadPlaywright(options.playwrightModule);
  const launchOptions = { headless: true, ...(options.browserExecutable ? { executablePath: options.browserExecutable } : {}) };
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, acceptDownloads: false });
  const page = await context.newPage();
  page.on('console', message => {
    const text = message.text();
    if (/\[body batch\]|FAILED|DIVERGENCE/i.test(text)) console.log(`[browser:${message.type()}] ${text}`);
  });
  page.on('pageerror', error => console.error(`[browser:error] ${error.message}`));

  let finalStatus = '';
  let storageBefore = '';
  let storageAfter = '';
  let measuredRows = [];
  try {
    console.log(`[body batch] opening ${options.base}`);
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
    console.log(`[body batch] submitting ${cases.length} Connor stimuli`);
    await page.locator('#bc-batch-file').setInputFiles(cases.map(item => item.image));

    const deadline = Date.now() + options.timeoutMinutes * 60_000;
    let lastStatus = '';
    while (Date.now() < deadline) {
      const status = (await page.locator('#bc-batch-status').textContent())?.trim() || '';
      if (status !== lastStatus) {
        console.log(`[body batch] ${status}`);
        lastStatus = status;
      }
      if (status.startsWith('Done')) break;
      await page.waitForTimeout(5_000);
    }
    finalStatus = lastStatus;
    if (!finalStatus.startsWith('Done')) throw new Error(`Batch timed out after ${options.timeoutMinutes} minutes: ${finalStatus}`);

    measuredRows = (await page.evaluate(() => window.__bcBatchRows.map(row => ({ ...row }))))
      .map(row => ({ ...row, timestamp: '' }));
    if (measuredRows.length !== cases.length) throw new Error(`Expected ${cases.length} rows, got ${measuredRows.length}.`);
    storageAfter = await page.evaluate(() => {
      const snapshot = storage => Object.keys(storage).sort().map(key => [key, storage.getItem(key)]);
      return JSON.stringify({ local: snapshot(localStorage), session: snapshot(sessionStorage) });
    });
    if (storageBefore !== storageAfter) throw new Error('Batch mutated localStorage or sessionStorage.');

    const metadataColumns = [
      'image_id', 'attractiveness_mean', 'identity_group', 'body_id', 'head_id',
      'variant', 'label_sex', 'demographic_code',
    ];
    const pageColumns = Object.keys(measuredRows[0] || {});
    const outputColumns = [...metadataColumns, ...pageColumns];
    const lines = [outputColumns.map(csvCell).join(',')];
    for (let index = 0; index < cases.length; index += 1) {
      const item = cases[index];
      const measured = measuredRows[index];
      if (measured.filename !== path.basename(item.image)) {
        throw new Error(`Batch row order mismatch at ${index}: expected ${path.basename(item.image)}, got ${measured.filename}`);
      }
      const row = [
        item.imageId, item.label, item.identityGroup, item.bodyId, item.headId,
        item.variant, item.sex, item.demographicCode,
        ...pageColumns.map(key => measured[key]),
      ];
      lines.push(row.map(csvCell).join(','));
    }
    const outputText = `${lines.join('\n')}\n`;
    await fs.mkdir(path.dirname(options.output), { recursive: true });
    await fs.writeFile(options.output, outputText, 'utf8');

    const outcomeCounts = {};
    const refusalCounts = {};
    const routeCounts = {};
    for (const row of measuredRows) {
      const outcome = row.outcome || 'unknown';
      outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1;
      if (outcome !== 'scored') {
        const reason = row.cause || row.refusal || 'unknown';
        refusalCounts[reason] = (refusalCounts[reason] || 0) + 1;
      }
      const route = row.routing || 'unknown';
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    }
    const metadata = {
      schema_version: 'body-production-batch.v1',
      generated_at: new Date().toISOString(),
      command: process.argv.map(value => /\s/.test(value) ? JSON.stringify(value) : value).join(' '),
      base_url: options.base,
      dataset: {
        name: 'Connor Full-Body Photo Database',
        source_url: CONNOR_SOURCE_URL,
        archive_sha256: CONNOR_ARCHIVE_SHA256,
        labels_sha256: labelsSha256,
        source_stimuli: sourceStimuli,
        usable_labels: usableLabelCases,
        excluded_labels: excludedLabels,
        processed_cases: cases.length,
        label: {
          field: 'attractiveness_mean',
          definition: 'mean holistic attractiveness rating of the full person',
          body_specific: false,
          independent_of_shipped_model: false,
          independence: 'training-contaminated/model-selection diagnostic; not a locked independent test',
          pairwise_gaps: [0, 5, 10, 20, 30],
        },
        cluster: {
          field: 'body_id',
          definition: 'Original and head-swap rows sharing the same body token are one cluster.',
          evidence_type: 'same pictured-body/head-swap composite clusters, not natural repeat photos, angles, or days',
          natural_repeat_photography: false,
        },
        subgroup_definitions: {
          demographic_code: {
            definition: 'Unverified A/B/W code parsed from the final body filename token; no source-backed meaning was established.',
            status: 'not legitimate demographic ground truth and not fairness evidence',
          },
        },
        license: {
          status: 'no license declared in the OSF node/API inspected for this audit',
          repository_policy: 'no source photographs committed; only manifests, hashes, and aggregate results',
        },
        training_contaminated: true,
      },
      page_columns: pageColumns,
      outcome_counts: outcomeCounts,
      refusal_counts: refusalCounts,
      route_counts: routeCounts,
      storage_before_sha256: sha256(storageBefore),
      storage_after_sha256: sha256(storageAfter),
      storage_unchanged: true,
      storage_fixture: {
        love_equations: true,
        unrelated_local_storage: true,
        session_storage: true,
      },
      final_status: finalStatus,
      pipeline_root: options.pipelineRoot,
      pipeline_sha256: pipelineBinding.local,
      served_pipeline_sha256: pipelineBinding.served,
      served_pipeline_matches_root: true,
      normalized_runtime_fields: ['timestamp'],
      tool_sha256: await sha256File(fileURLToPath(import.meta.url)),
      output_csv_sha256: sha256(outputText),
    };
    await fs.mkdir(path.dirname(options.metadataOutput), { recursive: true });
    await fs.writeFile(options.metadataOutput, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
    console.log(`[body batch] wrote ${path.relative(ROOT, options.output)} (${cases.length} rows)`);
    console.log(`[body batch] wrote ${path.relative(ROOT, options.metadataOutput)}; localStorage unchanged`);
  } finally {
    await browser.close();
  }
}

await main();
