#!/usr/bin/env node
/*
 * The cliff census — the standing instrument of the T3 ruling in
 * lab-adjudication-2026-08-08 (md/lab-operations.md): every canon- or
 * overlay-touching commit reports what its prose did to the vocabulary and to
 * benchmark margins, BEFORE the change lands. The e61e336 crawl would have
 * announced itself here as "+311 stems, 291 at df 1" instead of arriving as
 * three mysteriously red fixtures.
 *
 * Usage:
 *   node tools/lab-cliff-census.mjs <old-index.json> [new-index.json]
 *   node tools/lab-cliff-census.mjs --selftest
 *
 * new-index defaults to data/le-canon-index.json (the working tree). The old
 * state usually comes from git, WITHOUT touching the checkout:
 *   git show HEAD:data/le-canon-index.json > "$SCRATCH/old-index.json"
 * Output is sized to paste into a commit message. Read-only; exit 0 unless the
 * inputs are unusable (or a selftest expectation fails).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { analyzerInternals, detectClaimUnits, prepareCanonIndex, SCORING_CONFIG } from '../js/lab-analyzer.js';
import { normalizeInput } from '../js/lab-intake.js';

const CREDIBLE = SCORING_CONFIG.minCredibleScore;
const WEAK = SCORING_CONFIG.minWeakScore;
const NEAR = 0.02;

function vocabulary(prepared) {
  const df = new Map();
  prepared.entries.forEach((entry) => {
    new Set(entry._tokens).forEach((token) => df.set(token, (df.get(token) || 0) + 1));
  });
  return df;
}

export function vocabularyCensus(oldPrepared, newPrepared) {
  const oldDf = vocabulary(oldPrepared);
  const newDf = vocabulary(newPrepared);
  const entered = [...newDf.keys()].filter((stem) => !oldDf.has(stem));
  const left = [...oldDf.keys()].filter((stem) => !newDf.has(stem));
  const histogram = {};
  entered.forEach((stem) => {
    const df = newDf.get(stem);
    histogram[df] = (histogram[df] || 0) + 1;
  });
  return { entered, left, histogram };
}

function unitFor(text) {
  const units = detectClaimUnits(normalizeInput({ text }));
  return units[0] || null;
}

function topScore(unit, prepared) {
  let best = 0;
  for (const entry of prepared.entries) {
    const raw = analyzerInternals.scoreEntry(unit, entry, prepared.idf);
    if (raw.score > best) best = raw.score;
  }
  return best;
}

export function marginDiff(cases, oldPrepared, newPrepared) {
  const moved = [];
  for (const { id, text } of cases) {
    const unit = unitFor(text);
    if (!unit) continue;
    const before = topScore(unit, oldPrepared);
    const after = topScore(unit, newPrepared);
    const crossed = (gate) => (before >= gate) !== (after >= gate);
    const nearGate = [CREDIBLE, WEAK].some((gate) => Math.abs(after - gate) < NEAR);
    if (crossed(CREDIBLE) || crossed(WEAK) || (nearGate && Math.abs(after - before) > 0.0005)) {
      moved.push({ id, before, after,
        crossings: [CREDIBLE, WEAK].filter(crossed),
        near: nearGate });
    }
  }
  return moved;
}

function loadPrepared(file) {
  return prepareCanonIndex(JSON.parse(readFileSync(file, 'utf8')));
}

function report(oldFile, newFile) {
  const oldPrepared = loadPrepared(oldFile);
  const newPrepared = loadPrepared(newFile);
  const { entered, left, histogram } = vocabularyCensus(oldPrepared, newPrepared);
  const lines = [];
  lines.push(`cliff census: ${oldPrepared.entries.length} -> ${newPrepared.entries.length} concepts`);
  lines.push(`stems: +${entered.length} entered, -${left.length} left`
    + (entered.length ? ` · df of entrants ${JSON.stringify(histogram)}` : ''));
  if (entered.length) {
    const sample = entered.slice(0, 8).join(', ');
    lines.push(`  entrants${entered.length > 8 ? ' (first 8)' : ''}: ${sample}`);
  }

  const benchmark = JSON.parse(readFileSync(
    new URL('../tests/fixtures/canon-mapping-benchmark.json', import.meta.url), 'utf8',
  ));
  const cases = (benchmark.cases || []).map(({ id, text }) => ({ id, text }));
  const moved = marginDiff(cases, oldPrepared, newPrepared);
  if (!moved.length) {
    lines.push(`benchmark margins (${cases.length} cases): no case crossed or moved near a gate`);
  } else {
    lines.push(`benchmark margins (${cases.length} cases): ${moved.length} to review`);
    for (const m of moved) {
      const flag = m.crossings.length ? `CROSSED ${m.crossings.join(',')}` : 'near-gate move';
      lines.push(`  ${m.id}: ${m.before.toFixed(4)} -> ${m.after.toFixed(4)}  ${flag}`);
    }
  }
  return lines.join('\n');
}

/*
 * Smoke test over two inline micro-canons, so the tool can be trusted without
 * lab-corpus. The Lab suite runs it directly: a pre-commit instrument that can
 * silently lose its margin detector is no instrument at all.
 */
function selftest() {
  const page = { page: 'frameworks.html', anchor: 'a', href: 'frameworks.html#a' };
  const entry = (id, title, synopsis) => ({
    id, title, synopsis, ...page, category: 'Frameworks', aliases: [],
    boundaryConditions: [], commonMisreadings: [],
  });
  const base = {
    schemaVersion: 'le-canon-index/1.0', indexVersion: 'selftest-old',
    generatedAt: '2026-01-01T00:00:00.000Z', sourcePages: ['frameworks.html'],
    stats: { conceptCount: 2, sourceCount: 1 },
    entries: [
      entry('a', 'Attraction Gate', 'attraction precedes selection in dating markets'),
      entry('b', 'Retention Gap', 'retention diverges from attraction over time'),
    ],
  };
  const grown = {
    ...base,
    indexVersion: 'selftest-new',
    stats: { conceptCount: 3, sourceCount: 1 },
    entries: [...base.entries,
      entry('c', 'Typology Shortcut', 'a typology quiz predicting compatibility outcomes')],
  };
  const oldPrepared = prepareCanonIndex(base);
  const newPrepared = prepareCanonIndex(grown);
  const census = vocabularyCensus(oldPrepared, newPrepared);
  const assert = (ok, what) => {
    if (!ok) { process.stderr.write(`selftest FAILED: ${what}\n`); process.exit(1); }
  };
  assert(census.entered.includes('typology'), 'new stem `typology` reported as entered');
  assert(census.left.length === 0, 'no stems left');
  assert(census.histogram[1] >= 1, 'entrants histogrammed at df 1');
  const moved = marginDiff(
    [{ id: 'probe', text: 'A typology quiz predicts compatibility outcomes.' }],
    oldPrepared, newPrepared,
  );
  assert(moved.length === 1, 'the new exact concept produces one reported margin move');
  assert(moved[0].id === 'probe', 'the moved probe keeps its benchmark identity');
  assert(moved[0].before < WEAK, 'the old canon leaves the probe below the weak gate');
  assert(moved[0].after >= CREDIBLE, 'the grown canon lifts the probe over the credible gate');
  assert(moved[0].crossings.includes(WEAK), 'the weak-gate crossing is reported');
  assert(moved[0].crossings.includes(CREDIBLE), 'the credible-gate crossing is reported');
  assert(moved[0].near === false,
    'a decisive crossing does not masquerade as a near-gate-only move');
  process.stdout.write('cliff-census selftest ok\n');
}

const args = process.argv.slice(2);
if (args[0] === '--selftest') {
  selftest();
} else if (args.length >= 1) {
  process.stdout.write(`${report(args[0], args[1]
    || fileURLToPath(new URL('../data/le-canon-index.json', import.meta.url)))}\n`);
} else {
  process.stdout.write('usage: node tools/lab-cliff-census.mjs <old-index.json> [new-index.json] | --selftest\n');
  process.exit(1);
}
