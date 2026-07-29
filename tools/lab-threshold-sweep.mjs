#!/usr/bin/env node
/*
 * LE Lab — corpus-wide threshold sweep.
 *
 * Scores EVERY archived corpus passage against EVERY canon entry with the
 * shipped `scoreEntry`, and reports what sits near an admission threshold.
 * Retrieval-layer only: no display caps, no bounded-context boost, no stance.
 * That is deliberate — this tool exists to measure the raw scoring surface a
 * tokenizer change moves, and everything above retrieval is downstream of it.
 *
 * There is no second implementation of anything here. The tool imports the
 * module the Lab worker imports, so a number it prints is a number the shipped
 * analyzer produced. v2.4.2 was a whole release about flag files that disagree
 * with the analyzer while looking correct; this tool is written not to become
 * one.
 *
 * Two modes, and the second is the point:
 *
 *   --dump <file>       Write every pair at or above --dump-floor. This is a
 *                       BASELINE: capture it before a scoring change.
 *   --baseline <file>   Compare the current tree against a captured baseline
 *                       and report every threshold crossing in both
 *                       directions, plus the score-change census.
 *
 * `--neighbors <file>` writes the threshold-neighbour band (every pair within
 * --band of candidateScoreFloor, minWeakScore, or minCredibleScore) as a frozen
 * JSON fixture. A pair inside that band is one an implementation detail can
 * move across a line, so it is the population a calibration pass has to look at
 * before it accepts a diff.
 *
 * The corpus itself is gitignored (see md/RERUN.md §1) and third-party. This
 * tool therefore emits content-derived unit IDs by default and truncates
 * excerpts hard; pass --excerpt-chars 0 to omit source text entirely.
 *
 * Usage:
 *   node tools/lab-threshold-sweep.mjs --dump scratch/base.json
 *   node tools/lab-threshold-sweep.mjs --baseline scratch/base.json --md out.md
 *   node tools/lab-threshold-sweep.mjs --neighbors tests/fixtures/threshold-neighbors.json
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  prepareCanonIndex,
  detectClaimUnits,
  classifyDomainRelevance,
  analyzerInternals,
  ANALYZER_VERSION,
  SCORING_CONFIG,
  SCORING_CONFIG_HASH,
} from '../js/lab-analyzer.js';
import { normalizeInput } from '../js/lab-intake.js';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/*
 * The archived corpus, in manifest order. 03 (Gottman) is excluded by standing
 * decision and is still a v2.1.2 artifact; including it would mix instruments.
 */
const SOURCES = [
  '01-pew-online-dating',
  '02-fem-centrism',
  '04-heteropessimism',
];

/** The three lines a pair can cross, named so the report can say which one. */
const THRESHOLDS = [
  { name: 'candidateScoreFloor', value: SCORING_CONFIG.candidateScoreFloor },
  { name: 'minWeakScore', value: SCORING_CONFIG.minWeakScore },
  { name: 'minCredibleScore', value: SCORING_CONFIG.minCredibleScore },
];

function parseArgs(argv) {
  const options = {
    dump: null,
    baseline: null,
    neighbors: null,
    md: null,
    band: 0.03,
    dumpFloor: 0.02,
    excerptChars: 96,
    includeSetAside: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const next = () => argv[index += 1];
    if (flag === '--dump') options.dump = next();
    else if (flag === '--baseline') options.baseline = next();
    else if (flag === '--neighbors') options.neighbors = next();
    else if (flag === '--md') options.md = next();
    else if (flag === '--include-set-aside') options.includeSetAside = true;
    else if (flag === '--band') options.band = Number(next());
    else if (flag === '--dump-floor') options.dumpFloor = Number(next());
    else if (flag === '--excerpt-chars') options.excerptChars = Number(next());
    else throw new Error(`Unknown option: ${flag}`);
  }
  return options;
}

function documentFor(text, title) {
  return normalizeInput({
    text,
    format: 'auto',
    source: { title, type: 'corpus-file', url: null },
    extraction: { method: 'corpus-archive', warnings: [] },
    // Pinned: a content-derived unit ID must not depend on when the sweep ran.
    createdAt: '1970-01-01T00:00:00.000Z',
  });
}

/**
 * Every passage the corpus produces, gated exactly as the analyzer gates it.
 *
 * Set-aside passages are EXCLUDED by default, because retrieval genuinely does
 * not run on them: `analyzeDocument` scores a unit only after the domain gate
 * retains it. Sweeping them would measure a number the product never computes
 * and inflate every census in this file by the ratio of set-aside to retained,
 * which for this corpus is roughly 1.7 to 1. `--include-set-aside` widens the
 * population for anyone who wants the counterfactual anyway; it is not the
 * default, and a report built on it must say so.
 */
function loadPassages(excerptChars, includeSetAside) {
  const passages = [];
  for (const id of SOURCES) {
    const file = path.join(ROOT_DIR, 'lab-corpus', 'sources', `${id}.txt`);
    if (!fs.existsSync(file)) {
      throw new Error(`Corpus source missing: ${file}\nThe corpus is gitignored; see md/RERUN.md §1.`);
    }
    const text = fs.readFileSync(file, 'utf8');
    const units = classifyDomainRelevance(detectClaimUnits(documentFor(text, id)));
    let index = 0;
    units.forEach((unit) => {
      const status = unit.domainRelevance.status;
      if (status === 'irrelevant' && !includeSetAside) return;
      passages.push({
        source: id,
        index: index += 1,
        unitId: unit.id,
        status,
        excerpt: excerptChars > 0
          ? String(unit.text).replace(/\s+/g, ' ').trim().slice(0, excerptChars)
          : null,
        unit,
      });
    });
  }
  return passages;
}

function sweep(passages, prepared, dumpFloor) {
  const pairs = new Map();
  for (const passage of passages) {
    for (const entry of prepared.entries) {
      const raw = analyzerInternals.scoreEntry(passage.unit, entry, prepared.idf);
      if (raw.score < dumpFloor) continue;
      pairs.set(`${passage.unitId}|${entry.id}`, raw.score);
    }
  }
  return pairs;
}

/** Which side of a threshold a score sits on. */
const above = (score, threshold) => score >= threshold;

function main() {
  const options = parseArgs(process.argv.slice(2));
  const canonIndex = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'data', 'le-canon-index.json'), 'utf8'));
  const prepared = prepareCanonIndex(canonIndex);
  const passages = loadPassages(options.excerptChars, options.includeSetAside);
  const byUnit = new Map(passages.map((row) => [row.unitId, row]));
  const pairs = sweep(passages, prepared, options.dumpFloor);

  const identity = {
    schema: 'le-lab.threshold-sweep/1.0',
    analyzer: ANALYZER_VERSION,
    scoringConfigHash: SCORING_CONFIG_HASH,
    canonIndexVersion: prepared.indexVersion,
    entries: prepared.entries.length,
    passages: passages.length,
    population: options.includeSetAside ? 'retained + set-aside' : 'retained',
    scoredPairs: passages.length * prepared.entries.length,
    dumpFloor: options.dumpFloor,
    thresholds: Object.fromEntries(THRESHOLDS.map((row) => [row.name, row.value])),
  };

  process.stderr.write(
    `sweep: ${passages.length} passages x ${prepared.entries.length} entries `
    + `= ${identity.scoredPairs} pairs, ${pairs.size} at or above ${options.dumpFloor}\n`,
  );

  if (options.dump) {
    fs.writeFileSync(options.dump, `${JSON.stringify({
      ...identity,
      passages: passages.map(({ unit, ...rest }) => rest),
      pairs: Object.fromEntries([...pairs.entries()].sort(([a], [b]) => a.localeCompare(b))),
    }, null, 2)}\n`);
    process.stderr.write(`dump: ${options.dump}\n`);
  }

  if (options.neighbors) {
    /*
     * The band is stored as a flat score map, not as decorated rows. Everything
     * a reader or a test needs — which thresholds a pair is near, which side of
     * each it sits on — is a function of the score and the config, so storing
     * it would be storing a derived value that can disagree with its own
     * source. Source and passage index are likewise derivable from the unit ID
     * via this tool, and excerpts are omitted by default because the corpus is
     * third-party and unpublished (md/RERUN.md §1).
     */
    const scores = {};
    const perThreshold = Object.fromEntries(THRESHOLDS.map((row) => [row.name, 0]));
    for (const [key, score] of [...pairs.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      let near = false;
      for (const threshold of THRESHOLDS) {
        if (Math.abs(score - threshold.value) > options.band) continue;
        perThreshold[threshold.name] += 1;
        near = true;
      }
      if (near) scores[key] = score;
    }
    const existing = fs.existsSync(options.neighbors)
      ? JSON.parse(fs.readFileSync(options.neighbors, 'utf8'))
      : null;
    fs.writeFileSync(options.neighbors, `${JSON.stringify({
      ...identity,
      band: options.band,
      note: 'Frozen threshold-neighbour band: every corpus pair within ±band of an'
        + ' admission line, which is the population an implementation detail can move'
        + ' across one. A pair here that changes SIDE has to be adjudicated, not'
        + ' absorbed — see rulings.',
      counts: { ...perThreshold, pairs: Object.keys(scores).length },
      // Human rulings on crossings, keyed the same way as `scores`. Empty until
      // a calibration pass produces crossings and someone adjudicates them.
      rulings: existing?.rulings ?? {},
      scores,
    }, null, 2)}\n`);
    process.stderr.write(
      `neighbors: ${options.neighbors} (${Object.keys(scores).length} pairs, band ±${options.band}, `
      + `${THRESHOLDS.map((row) => `${row.name}=${perThreshold[row.name]}`).join(' ')})\n`,
    );
  }

  if (options.baseline) {
    const base = JSON.parse(fs.readFileSync(options.baseline, 'utf8'));
    const basePairs = new Map(Object.entries(base.pairs));
    const keys = new Set([...basePairs.keys(), ...pairs.keys()]);
    const changes = [];
    const crossings = [];
    for (const key of keys) {
      const before = basePairs.has(key) ? basePairs.get(key) : 0;
      const after = pairs.has(key) ? pairs.get(key) : 0;
      if (before === after) continue;
      const [unitId, canonId] = key.split('|');
      const passage = byUnit.get(unitId);
      const change = {
        unitId,
        canonId,
        source: passage?.source ?? null,
        passageIndex: passage?.index ?? null,
        excerpt: passage?.excerpt ?? null,
        before,
        after,
        delta: Number((after - before).toFixed(3)),
      };
      changes.push(change);
      for (const threshold of THRESHOLDS) {
        const wasAbove = above(before, threshold.value);
        const isAbove = above(after, threshold.value);
        if (wasAbove === isAbove) continue;
        crossings.push({ ...change, threshold: threshold.name, direction: isAbove ? 'gain' : 'loss' });
      }
    }
    changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    crossings.sort((a, b) => a.threshold.localeCompare(b.threshold)
      || a.direction.localeCompare(b.direction)
      || b.after - a.after);

    const census = {
      baselineAnalyzer: base.analyzer,
      baselineScoringConfigHash: base.scoringConfigHash,
      currentAnalyzer: identity.analyzer,
      currentScoringConfigHash: identity.scoringConfigHash,
      scoredPairs: identity.scoredPairs,
      changed: changes.length,
      decreased: changes.filter((row) => row.delta < 0).length,
      increased: changes.filter((row) => row.delta > 0).length,
      crossings: Object.fromEntries(THRESHOLDS.map((threshold) => [
        threshold.name,
        {
          gains: crossings.filter((row) => row.threshold === threshold.name && row.direction === 'gain').length,
          losses: crossings.filter((row) => row.threshold === threshold.name && row.direction === 'loss').length,
        },
      ])),
    };
    process.stdout.write(`${JSON.stringify({ census, crossings, changes: changes.slice(0, 40) }, null, 2)}\n`);

    if (options.md) {
      fs.writeFileSync(options.md, renderMarkdown(identity, census, crossings));
      process.stderr.write(`md: ${options.md}\n`);
    }
  }
}

function renderMarkdown(identity, census, crossings) {
  const lines = [];
  const table = (rows) => {
    lines.push('', '| Pair | Source · passage | Before | After | Δ | ACCEPT / REJECT |');
    lines.push('|---|---|---|---|---|---|');
    rows.forEach((row) => {
      lines.push(`| \`${row.canonId}\`<br>${row.excerpt ? `“${row.excerpt}…”` : row.unitId} `
        + `| ${row.source} · ${row.passageIndex} | ${row.before.toFixed(3)} | ${row.after.toFixed(3)} `
        + `| ${row.delta > 0 ? '+' : ''}${row.delta.toFixed(3)} |  |`);
    });
  };
  lines.push('# Threshold adjudication sheet', '');
  lines.push('Generated by `tools/lab-threshold-sweep.mjs`. One row per pair that crossed an admission');
  lines.push('threshold. The rightmost column is empty on purpose: it is the human ruling.', '');
  lines.push('```');
  lines.push(`analyzer  ${census.baselineAnalyzer} -> ${census.currentAnalyzer}`);
  lines.push(`config    ${census.baselineScoringConfigHash} -> ${census.currentScoringConfigHash}`);
  lines.push(`canon     ${identity.canonIndexVersion}`);
  lines.push(`pairs     ${census.scoredPairs}  (${identity.passages} passages x ${identity.entries} entries)`);
  lines.push(`changed   ${census.changed}   ${census.decreased} down / ${census.increased} up`);
  lines.push('```', '');
  for (const threshold of THRESHOLDS) {
    const rows = crossings.filter((row) => row.threshold === threshold.name);
    lines.push(`## ${threshold.name} (${threshold.value})`, '');
    const gains = rows.filter((row) => row.direction === 'gain');
    const losses = rows.filter((row) => row.direction === 'loss');
    lines.push(`${gains.length} gain(s), ${losses.length} loss(es).`);
    if (gains.length) { lines.push('', '### Gains'); table(gains); }
    if (losses.length) { lines.push('', '### Losses'); table(losses); }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

main();
