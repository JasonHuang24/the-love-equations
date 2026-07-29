#!/usr/bin/env node
/**
 * LE Lab headless analyzer harness.
 *
 * Runs the shipped analyzer (js/lab-analyzer.js) over a fixture source outside
 * the browser so analysis output can be frozen, diffed, and re-checked across
 * releases. This is the regression rig for threshold calibration: capture a
 * baseline before a change, capture again after, and diff with
 * fixtures/diff-analysis.mjs.
 *
 * There is no test-only analyzer. This harness imports exactly the module the
 * Lab worker imports, so a green diff here is a statement about shipped code.
 *
 * Usage:
 *   node fixtures/run-analyzer.mjs --out fixtures/demo-v2.2.0.json
 *   node fixtures/run-analyzer.mjs --source path/to/transcript.vtt --out out.json
 *   node fixtures/run-analyzer.mjs --canon data/le-canon-index.json --raw
 *
 * Options:
 *   --source <demo|path>  Source to analyze. "demo" (default) is the built-in
 *                         Lab demonstration transcript used by the Demo Test
 *                         button. A path may be a normalized-document JSON
 *                         (schema le-lab.normalized-document) or raw transcript
 *                         text in any intake-supported format.
 *   --format <fmt>        Intake format for text sources (default: auto).
 *   --canon <path>        Canon index (default: data/le-canon-index.json).
 *   --overrides <path>    JSON map of { unitId: "include"|"exclude" } domain
 *                         overrides, applied as locked visitor inputs.
 *   --out <path>          Write JSON here (default: stdout).
 *   --raw                 Keep volatile fields (wall-clock generatedAt) instead
 *                         of stabilizing them. Off by default so output is
 *                         byte-comparable between runs.
 *   --created-at <iso>    Pin the normalized document's createdAt
 *                         (default: 1970-01-01T00:00:00.000Z).
 *   --quiet               Suppress the stderr summary line.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { analyzeDocument, ANALYSIS_SCHEMA_VERSION } from '../js/lab-analyzer.js';
import { createDemoDocument } from '../js/lab-demo.js';
import { normalizeInput } from '../js/lab-intake.js';

const HARNESS_DIR = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(HARNESS_DIR, '..');
export const DEFAULT_CANON_PATH = path.join(ROOT_DIR, 'data', 'le-canon-index.json');

// Pinned so a rerun of the same source produces byte-identical intake output.
export const FIXED_CREATED_AT = '1970-01-01T00:00:00.000Z';

// Fields whose value is wall-clock or environment dependent. They are replaced
// with stable placeholders so a diff surfaces real behavioral change only.
// Canon provenance (generatedAt of the INDEX) is deliberately NOT stabilized:
// it is a recorded input, and a change in it is a change worth seeing.
const VOLATILE_PATHS = [
  ['generatedAt'],
  ['provenance', 'analyzedAt'],
];

function parseArgs(argv) {
  const options = {
    source: 'demo',
    format: 'auto',
    canon: DEFAULT_CANON_PATH,
    overrides: null,
    out: null,
    raw: false,
    createdAt: FIXED_CREATED_AT,
    quiet: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const value = argv[index + 1];
    switch (flag) {
      case '--source': options.source = value; index += 1; break;
      case '--format': options.format = value; index += 1; break;
      case '--canon': options.canon = path.resolve(value); index += 1; break;
      case '--overrides': options.overrides = path.resolve(value); index += 1; break;
      case '--out': options.out = path.resolve(value); index += 1; break;
      case '--created-at': options.createdAt = value; index += 1; break;
      case '--raw': options.raw = true; break;
      case '--quiet': options.quiet = true; break;
      case '--help': case '-h': options.help = true; break;
      default:
        if (flag.startsWith('--')) throw new Error(`Unknown option: ${flag}`);
    }
  }
  return options;
}

function setAtPath(target, segments, value) {
  let node = target;
  for (let index = 0; index < segments.length - 1; index += 1) {
    if (!node || typeof node !== 'object') return;
    node = node[segments[index]];
  }
  const leaf = segments[segments.length - 1];
  if (node && typeof node === 'object' && leaf in node) node[leaf] = value;
}

/** Replace wall-clock fields so two runs of identical code compare equal. */
export function stabilize(result) {
  const copy = JSON.parse(JSON.stringify(result));
  VOLATILE_PATHS.forEach((segments) => setAtPath(copy, segments, `<${segments.join('.')}>`));
  return copy;
}

export async function loadDocument({ source = 'demo', format = 'auto', createdAt = FIXED_CREATED_AT } = {}) {
  if (source === 'demo') return createDemoDocument({ createdAt });

  const resolved = path.resolve(source);
  const raw = await fs.readFile(resolved, 'utf8');

  if (resolved.toLowerCase().endsWith('.json')) {
    const parsed = JSON.parse(raw);
    // A pre-normalized document is used as-is; anything else is treated as a
    // JSON transcript and sent through intake.
    if (Array.isArray(parsed?.segments) && parsed?.schema) return parsed;
  }

  return normalizeInput({
    text: raw,
    format,
    source: { title: path.basename(resolved), type: 'fixture-file', url: null },
    extraction: {
      method: 'harness-file',
      warnings: [{
        code: 'HARNESS_SOURCE',
        message: 'Loaded by fixtures/run-analyzer.mjs; not an in-browser extraction.',
        severity: 'info',
      }],
    },
    createdAt,
  });
}

export async function loadCanonIndex(canonPath = DEFAULT_CANON_PATH) {
  return JSON.parse(await fs.readFile(canonPath, 'utf8'));
}

export async function runAnalysis(options = {}) {
  const document = await loadDocument(options);
  const canonIndex = await loadCanonIndex(options.canon || DEFAULT_CANON_PATH);
  const domainOverrides = options.overrides
    ? JSON.parse(await fs.readFile(options.overrides, 'utf8'))
    : undefined;
  const result = await analyzeDocument(document, canonIndex, { domainOverrides });
  return options.raw ? result : stabilize(result);
}

function summaryLine(result) {
  const metrics = result.metrics || {};
  const coverage = result.coverage || {};
  return [
    `schema=${result.schemaVersion}`,
    `canon=${result.canonIndex?.version}`,
    `passages=${metrics.analyzedPassages}`,
    `claims=${metrics.claimLikeSegments}`,
    `mapped=${metrics.mappedClaimSegments}`,
    `unmapped=${metrics.unmappedClaimSegments}`,
    `ignored=${metrics.ignoredDomainSegments}`,
    `mappedShare=${coverage.mappedClaimSegmentSharePct}%`,
    `tensions=${(result.pressureTests || []).length}`,
    `queue=${result.researchQueue?.itemCount}`,
  ].join(' · ');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(`${String(await fs.readFile(fileURLToPath(import.meta.url), 'utf8'))
      .split('*/')[0].replace(/^\/\*\*?/, '').replace(/^ \* ?/gm, '')}\n`);
    return;
  }
  const result = await runAnalysis(options);
  const json = `${JSON.stringify(result, null, 2)}\n`;
  if (options.out) {
    await fs.mkdir(path.dirname(options.out), { recursive: true });
    await fs.writeFile(options.out, json, 'utf8');
  } else {
    process.stdout.write(json);
  }
  if (!options.quiet) {
    process.stderr.write(`[run-analyzer] ${ANALYSIS_SCHEMA_VERSION} · ${summaryLine(result)}\n`);
    if (options.out) process.stderr.write(`[run-analyzer] wrote ${path.relative(ROOT_DIR, options.out)}\n`);
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
