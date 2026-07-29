#!/usr/bin/env node
/**
 * LE Lab analysis diff — the acceptance gate for analyzer changes.
 *
 * Compares two analysis JSON files produced by fixtures/run-analyzer.mjs and
 * splits every difference into two populations:
 *
 *   PROVENANCE  version strings, provenance stamps, the provisional marker, and
 *               the scoring-config hash. Expected to move on a release bump.
 *   BEHAVIORAL  segments, matches, scores, confidences, stances, tensions,
 *               metrics, coverage numbers, and queue content. These are the
 *               analyzer actually deciding differently.
 *
 * Modes:
 *   --mode freeze  (default) A refactor/version pass. ANY behavioral difference
 *                  fails. This is verification check 1.
 *   --mode alias   A recall pass against a patched canon index. Additive
 *                  matches and score increases pass; any score decrease,
 *                  dropped match, or dropped mapping fails. This is check 2.
 *
 * Usage:
 *   node fixtures/diff-analysis.mjs before.json after.json
 *   node fixtures/diff-analysis.mjs before.json after.json --mode alias
 *   node fixtures/diff-analysis.mjs before.json after.json --json report.json
 *
 * Exit code is 0 when the diff satisfies the mode's contract, 1 otherwise, so
 * this is usable directly as a CI/verification step.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

/**
 * Paths whose movement is provenance, not behavior. Matched against the dotted
 * path with array indices replaced by [] so one rule covers every element.
 */
const PROVENANCE_PATTERNS = [
  /^schemaVersion$/,
  /^id$/,
  /^generatedAt$/,
  /^analysisMode\./,
  /^canonIndex\./,
  /^provenance(\.|$)/,
  /^researchQueue\.schemaVersion$/,
  /^researchQueue\.provenance(\.|$)/,
  /^coverage\.provisional(\.|$)/,
  /^scoringConfig(\.|$)/,
];

/** Paths that are pure prose and never a scoring decision. */
const NARRATIVE_PATTERNS = [
  /^limitations\[\]$/,
  /^coverage\.(denominator|interpretation)$/,
  /^domainRelevance\.note$/,
];

function classify(normalizedPath) {
  if (PROVENANCE_PATTERNS.some((pattern) => pattern.test(normalizedPath))) return 'provenance';
  if (NARRATIVE_PATTERNS.some((pattern) => pattern.test(normalizedPath))) return 'narrative';
  return 'behavioral';
}

function normalizePath(segments) {
  return segments
    .map((segment) => (typeof segment === 'number' ? '[]' : segment))
    .reduce((accumulator, segment) => (
      segment === '[]' ? `${accumulator}[]` : accumulator ? `${accumulator}.${segment}` : segment
    ), '');
}

function displayPath(segments) {
  return segments
    .reduce((accumulator, segment) => (
      typeof segment === 'number' ? `${accumulator}[${segment}]` : accumulator ? `${accumulator}.${segment}` : String(segment)
    ), '');
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function diffValues(before, after, segments, sink) {
  if (before === after) return;

  if (Array.isArray(before) && Array.isArray(after)) {
    const length = Math.max(before.length, after.length);
    if (before.length !== after.length) {
      sink.push({
        path: displayPath([...segments, 'length']),
        normalized: `${normalizePath(segments)}.length`,
        kind: 'length',
        before: before.length,
        after: after.length,
      });
    }
    for (let index = 0; index < length; index += 1) {
      if (index >= before.length) {
        sink.push({
          path: displayPath([...segments, index]),
          normalized: normalizePath([...segments, index]),
          kind: 'added',
          before: undefined,
          after: after[index],
        });
      } else if (index >= after.length) {
        sink.push({
          path: displayPath([...segments, index]),
          normalized: normalizePath([...segments, index]),
          kind: 'removed',
          before: before[index],
          after: undefined,
        });
      } else {
        diffValues(before[index], after[index], [...segments, index], sink);
      }
    }
    return;
  }

  if (isObject(before) && isObject(after) && !Array.isArray(before) && !Array.isArray(after)) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
    keys.forEach((key) => {
      const hasBefore = Object.prototype.hasOwnProperty.call(before, key);
      const hasAfter = Object.prototype.hasOwnProperty.call(after, key);
      if (!hasBefore) {
        sink.push({
          path: displayPath([...segments, key]),
          normalized: normalizePath([...segments, key]),
          kind: 'added',
          before: undefined,
          after: after[key],
        });
      } else if (!hasAfter) {
        sink.push({
          path: displayPath([...segments, key]),
          normalized: normalizePath([...segments, key]),
          kind: 'removed',
          before: before[key],
          after: undefined,
        });
      } else {
        diffValues(before[key], after[key], [...segments, key], sink);
      }
    });
    return;
  }

  sink.push({
    path: displayPath(segments),
    normalized: normalizePath(segments),
    kind: 'changed',
    before,
    after,
  });
}

export function diffAnalyses(before, after) {
  const sink = [];
  diffValues(before, after, [], sink);
  return sink.map((entry) => ({ ...entry, category: classify(entry.normalized) }));
}

/** Every (segmentId, canonId) -> score pair the analysis asserts. */
function scoreLedger(result) {
  const ledger = new Map();
  (result.segments || []).forEach((segment) => {
    const segmentId = segment.unit?.id || 'unknown';
    (segment.matches || []).forEach((match) => {
      ledger.set(`${segmentId}|${match.canonId}`, {
        score: match.score,
        confidence: match.confidence,
        stance: match.alignment?.label,
      });
    });
  });
  (result.strongestMatches || []).forEach((match) => {
    ledger.set(`*strongest*|${match.canonId}`, {
      score: match.bestScore,
      confidence: match.confidence,
      stance: null,
    });
  });
  return ledger;
}

export function scoreMovement(before, after) {
  const from = scoreLedger(before);
  const to = scoreLedger(after);
  const decreased = [];
  const increased = [];
  const dropped = [];
  const gained = [];

  from.forEach((previous, key) => {
    if (!to.has(key)) {
      dropped.push({ key, ...previous });
      return;
    }
    const next = to.get(key);
    if (next.score < previous.score) decreased.push({ key, before: previous.score, after: next.score });
    else if (next.score > previous.score) increased.push({ key, before: previous.score, after: next.score });
  });
  to.forEach((next, key) => {
    if (!from.has(key)) gained.push({ key, ...next });
  });

  return { decreased, increased, dropped, gained };
}

function preview(value) {
  if (value === undefined) return '(absent)';
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > 120 ? `${text.slice(0, 117)}…` : text;
}

function parseArgs(argv) {
  const options = { mode: 'freeze', json: null, limit: 40, files: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--mode') { options.mode = argv[index + 1]; index += 1; }
    else if (flag === '--json') { options.json = path.resolve(argv[index + 1]); index += 1; }
    else if (flag === '--limit') { options.limit = Number(argv[index + 1]); index += 1; }
    else if (!flag.startsWith('--')) options.files.push(flag);
    else throw new Error(`Unknown option: ${flag}`);
  }
  if (options.files.length !== 2) throw new Error('Usage: diff-analysis.mjs <before.json> <after.json> [--mode freeze|alias]');
  if (!['freeze', 'alias'].includes(options.mode)) throw new Error(`Unknown mode: ${options.mode}`);
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const [beforePath, afterPath] = options.files.map((file) => path.resolve(file));
  const before = JSON.parse(await fs.readFile(beforePath, 'utf8'));
  const after = JSON.parse(await fs.readFile(afterPath, 'utf8'));

  const differences = diffAnalyses(before, after);
  const movement = scoreMovement(before, after);
  const byCategory = {
    provenance: differences.filter((entry) => entry.category === 'provenance'),
    narrative: differences.filter((entry) => entry.category === 'narrative'),
    behavioral: differences.filter((entry) => entry.category === 'behavioral'),
  };

  const lines = [];
  lines.push(`LE Lab analysis diff · mode=${options.mode}`);
  lines.push(`  before: ${path.relative(process.cwd(), beforePath)}`);
  lines.push(`  after:  ${path.relative(process.cwd(), afterPath)}`);
  lines.push('');
  lines.push(`Differences: ${differences.length} total — `
    + `${byCategory.provenance.length} provenance, `
    + `${byCategory.narrative.length} narrative, `
    + `${byCategory.behavioral.length} behavioral`);
  lines.push('');

  if (byCategory.provenance.length) {
    lines.push('PROVENANCE (expected on a release bump):');
    byCategory.provenance.slice(0, options.limit).forEach((entry) => {
      lines.push(`  ${entry.kind.padEnd(7)} ${entry.path}`);
      lines.push(`          ${preview(entry.before)} -> ${preview(entry.after)}`);
    });
    if (byCategory.provenance.length > options.limit) {
      lines.push(`  …${byCategory.provenance.length - options.limit} more`);
    }
    lines.push('');
  }

  if (byCategory.narrative.length) {
    lines.push('NARRATIVE (prose only, no scoring decision):');
    byCategory.narrative.slice(0, options.limit).forEach((entry) => {
      lines.push(`  ${entry.kind.padEnd(7)} ${entry.path}`);
      lines.push(`          ${preview(entry.before)} -> ${preview(entry.after)}`);
    });
    lines.push('');
  }

  if (byCategory.behavioral.length) {
    lines.push('BEHAVIORAL:');
    byCategory.behavioral.slice(0, options.limit).forEach((entry) => {
      lines.push(`  ${entry.kind.padEnd(7)} ${entry.path}`);
      lines.push(`          ${preview(entry.before)} -> ${preview(entry.after)}`);
    });
    if (byCategory.behavioral.length > options.limit) {
      lines.push(`  …${byCategory.behavioral.length - options.limit} more`);
    }
    lines.push('');
  }

  lines.push('Score movement (segment matches + strongest matches):');
  lines.push(`  decreased: ${movement.decreased.length}`);
  lines.push(`  increased: ${movement.increased.length}`);
  lines.push(`  dropped:   ${movement.dropped.length}`);
  lines.push(`  gained:    ${movement.gained.length}`);
  movement.decreased.slice(0, options.limit).forEach((item) => {
    lines.push(`    DECREASE ${item.key}: ${item.before} -> ${item.after}`);
  });
  movement.dropped.slice(0, options.limit).forEach((item) => {
    lines.push(`    DROPPED  ${item.key} (was ${item.score})`);
  });
  lines.push('');

  let failed = false;
  const failures = [];
  if (options.mode === 'freeze') {
    if (byCategory.behavioral.length) {
      failures.push(`${byCategory.behavioral.length} behavioral difference(s) in a freeze check`);
    }
  } else {
    if (movement.decreased.length) failures.push(`${movement.decreased.length} score decrease(s)`);
    if (movement.dropped.length) failures.push(`${movement.dropped.length} dropped match(es)`);
  }
  failed = failures.length > 0;

  lines.push(failed ? `RESULT: FAIL — ${failures.join('; ')}` : 'RESULT: PASS');
  process.stdout.write(`${lines.join('\n')}\n`);

  if (options.json) {
    await fs.mkdir(path.dirname(options.json), { recursive: true });
    await fs.writeFile(options.json, `${JSON.stringify({
      mode: options.mode,
      before: path.relative(process.cwd(), beforePath),
      after: path.relative(process.cwd(), afterPath),
      counts: {
        total: differences.length,
        provenance: byCategory.provenance.length,
        narrative: byCategory.narrative.length,
        behavioral: byCategory.behavioral.length,
      },
      differences,
      scoreMovement: movement,
      pass: !failed,
    }, null, 2)}\n`, 'utf8');
  }

  if (failed) process.exitCode = 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}
