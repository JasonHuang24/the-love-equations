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
  canonAdmissionSurfaces,
  detectClaimUnits,
  classifyDomainRelevance,
  analyzerInternals,
  ANALYZER_VERSION,
  SCORING_CONFIG,
  SCORING_CONFIG_HASH,
} from '../js/lab-analyzer.js';
import { normalizeInput } from '../js/lab-intake.js';
import { corpusSources } from './lab-corpus-sources.mjs';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/*
 * The archived corpus, in manifest order — every source the manifest records an
 * archived text for. 03 (Gottman) is excluded there by standing decision and is
 * still a v2.1.2 artifact; including it would mix instruments.
 *
 * This was a hand-written three-element array until 2026-07-30, so every
 * "corpus-wide" number this tool produced before then covered 3 of the 21
 * archived sources. See md/lab-threshold-sweep-widening.md and
 * ./lab-corpus-sources.mjs.
 */
const SOURCES = corpusSources(ROOT_DIR);

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
    rule: null,
    ruledBy: null,
    ruledAt: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    const next = () => argv[index += 1];
    if (flag === '--dump') options.dump = next();
    else if (flag === '--baseline') options.baseline = next();
    else if (flag === '--neighbors') options.neighbors = next();
    else if (flag === '--md') options.md = next();
    else if (flag === '--rule') options.rule = next();
    else if (flag === '--ruled-by') options.ruledBy = next();
    else if (flag === '--ruled-at') options.ruledAt = next();
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
function loadPassages(excerptChars, includeSetAside, canonSurfaces) {
  const passages = [];
  for (const { id, file } of SOURCES) {
    if (!fs.existsSync(file)) {
      throw new Error(`Corpus source missing: ${file}\nThe corpus is gitignored; see md/RERUN.md §1.`);
    }
    const text = fs.readFileSync(file, 'utf8');
    // The canon surfaces are passed because the SHIPPED gate has them (v2.6.6,
    // option 2a). Without them this tool would sweep a narrower population than
    // the product retains, and every census it prints would be short by exactly
    // the passages canon-anchored admission rescued.
    const units = classifyDomainRelevance(
      detectClaimUnits(documentFor(text, id)), new Map(), canonSurfaces,
    );
    let index = 0;
    units.forEach((unit) => {
      const status = unit.domainRelevance.status;
      if (status === 'irrelevant' && !includeSetAside) return;
      /*
       * A unit the claim detector rejected is never mapped: analyzeDocument
       * builds segments for claim-like units only, so retrieval never runs on it
       * and any score this tool prints for it is measuring nothing.
       *
       * Skipping it is not a filter on top of the gate, it is the same
       * population the analyzer works on. Before this line the sweep scored two
       * section HEADINGS as passages — "Online Dating" and "Romance & Dating",
       * both `isClaimLike: false` with `claimLikelihood: 0` — and because a
       * two-token passage carries almost no query weight, any shared token
       * produced a large coverage ratio. Three of the 29 minCredibleScore
       * rulings a human was asked to make in July 2026 existed only for that
       * reason, and none of the three could ever have reached a reader.
       *
       * Unconditional, including under --include-set-aside: that flag widens the
       * population to passages the GATE set aside, which are still claims. A
       * heading is not.
       */
      if (!unit.isClaimLike) return;
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
  const passages = loadPassages(
    options.excerptChars, options.includeSetAside, canonAdmissionSurfaces(prepared),
  );
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

  /*
   * The baseline comparison runs FIRST when both are asked for, so the band it
   * writes can carry the crossing record the comparison found. A band alone
   * cannot: it holds only pairs that started near a line, and a pair falling
   * from 0.363 to 0.231 crosses `minWeakScore` from well outside it. The band
   * is the tripwire for subtle drift; the crossing record is the complete list.
   */
  const comparison = options.baseline ? compare(options, identity, pairs, byUnit) : null;

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
    /*
     * Rulings are MERGED, never replaced. A verdict a human wrote is the one
     * artifact in this file a regeneration must not be able to destroy; a
     * crossing this run found and nobody has ruled on is recorded as PENDING so
     * it is visibly unanswered rather than silently absent.
     */
    const rulings = { ...(existing?.rulings ?? {}) };
    for (const crossing of comparison?.crossings ?? []) {
      // Keyed by threshold as well as by pair: a single pair can clear two
      // lines in one move, and a ruling that recorded only the first would be
      // a verdict on half of what happened.
      const key = `${crossing.unitId}|${crossing.canonId}|${crossing.threshold}`;
      if (rulings[key]) continue;
      rulings[key] = {
        ruling: 'PENDING',
        threshold: crossing.threshold,
        direction: crossing.direction,
        before: crossing.before,
        after: crossing.after,
      };
    }
    /*
     * Transcribing a human's verdict, not making one.
     *
     * `--rule` stamps every OUTSTANDING crossing with one decision, which is
     * the shape a real adjudication usually takes ("accept all", "reject these
     * three and accept the rest" after the three are recorded by hand). It
     * touches nothing already answered, and it demands `--ruled-by`, because a
     * verdict with no name on it is indistinguishable from a default.
     */
    if (options.rule) {
      if (!['ACCEPT', 'REJECT'].includes(options.rule)) {
        throw new Error(`--rule must be ACCEPT or REJECT, not ${options.rule}`);
      }
      if (!options.ruledBy) throw new Error('--rule requires --ruled-by: a verdict needs an author.');
      Object.values(rulings).forEach((row) => {
        if (row.ruling !== 'PENDING') return;
        row.ruling = options.rule;
        row.ruledBy = options.ruledBy;
        if (options.ruledAt) row.ruledAt = options.ruledAt;
      });
    }
    const pending = Object.values(rulings).filter((row) => row.ruling === 'PENDING').length;
    /*
     * Outstanding verdicts, split by which line they sit on, because at this
     * population they are three different KINDS of thing and one flag cannot
     * say so.
     *
     * The record was designed when the sweep covered 117 passages and a release
     * produced a few dozen crossings a human could read in an afternoon. It now
     * covers 2,401, and 4,622 of the outstanding crossings are at
     * `candidateScoreFloor` — a line that decides which entries were CONSIDERED
     * and can never put a match in front of a reader. Left as one number they
     * hold `adjudicationOpen` permanently true, which disarms the guard: a test
     * that reports instead of failing, forever, is not a gate.
     *
     * So the counts are per-threshold and the suite reads them per-threshold.
     * See tests/lab-threshold-neighbors.test.mjs for which are blocking.
     */
    const pendingByThreshold = Object.fromEntries(THRESHOLDS.map((threshold) => [
      threshold.name,
      Object.values(rulings)
        .filter((row) => row.ruling === 'PENDING' && row.threshold === threshold.name).length,
    ]));
    fs.writeFileSync(options.neighbors, `${JSON.stringify({
      ...identity,
      band: options.band,
      // Open exactly when a verdict is outstanding. Derived rather than set,
      // because "closed, 123 unanswered" and "open, nothing outstanding" are
      // both states this file should not be able to reach — and a hand-edited
      // fixture that reaches either still fails the suite. What OPEN now means
      // for the suite is per-threshold; this flag stays the honest summary.
      adjudicationOpen: pending > 0,
      note: 'Frozen threshold-neighbour band: every corpus pair within ±band of an'
        + ' admission line, which is the population an implementation detail can move'
        + ' across one. `scores` pins which SIDE of each line a pair sits on; `rulings`'
        + ' is the human record for every pair that has ever crossed one, including'
        + ' crossings that began outside the band.',
      counts: {
        ...perThreshold,
        pairs: Object.keys(scores).length,
        rulings: Object.keys(rulings).length,
        pending,
        pendingByThreshold,
      },
      rulings,
      scores,
    }, null, 2)}\n`);
    process.stderr.write(
      `neighbors: ${options.neighbors} (${Object.keys(scores).length} pairs, band ±${options.band}, `
      + `${THRESHOLDS.map((row) => `${row.name}=${perThreshold[row.name]}`).join(' ')}, `
      + `${Object.keys(rulings).length} rulings)\n`,
    );
  }

  if (comparison) {
    process.stdout.write(`${JSON.stringify({
      census: comparison.census,
      crossings: comparison.crossings,
      changes: comparison.changes.slice(0, 40),
    }, null, 2)}\n`);
    if (options.md) {
      // The sheet renders whatever verdicts exist. Empty column before
      // adjudication, the recorded ruling and its author after — same file,
      // same generator, so the human-readable record cannot drift from the
      // machine-readable one it was rendered from.
      const rulings = fs.existsSync(options.neighbors ?? '')
        ? JSON.parse(fs.readFileSync(options.neighbors, 'utf8')).rulings
        : {};
      fs.writeFileSync(options.md, renderMarkdown(identity, comparison.census, comparison.crossings, rulings));
      process.stderr.write(`md: ${options.md}\n`);
    }
  }
}

/** Current scores against a captured baseline: what moved, and what crossed. */
function compare(options, identity, pairs, byUnit) {
  const base = JSON.parse(fs.readFileSync(options.baseline, 'utf8'));
  const basePairs = new Map(Object.entries(base.pairs));
  const keys = new Set([...basePairs.keys(), ...pairs.keys()]);
  const changes = [];
  const crossings = [];
  for (const key of keys) {
    // A pair absent from a dump scored below its floor, which for a threshold
    // comparison is indistinguishable from zero: both are below every line.
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
      if (above(before, threshold.value) === above(after, threshold.value)) continue;
      crossings.push({
        ...change,
        threshold: threshold.name,
        direction: above(after, threshold.value) ? 'gain' : 'loss',
      });
    }
  }
  changes.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  crossings.sort((a, b) => a.threshold.localeCompare(b.threshold)
    || a.direction.localeCompare(b.direction)
    || b.after - a.after);

  return {
    changes,
    crossings,
    census: {
      baselineAnalyzer: base.analyzer,
      baselineScoringConfigHash: base.scoringConfigHash,
      baselineCanonIndexVersion: base.canonIndexVersion,
      currentAnalyzer: identity.analyzer,
      currentScoringConfigHash: identity.scoringConfigHash,
      currentCanonIndexVersion: identity.canonIndexVersion,
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
    },
  };
}

/**
 * The human-facing half of the adjudication record.
 *
 * The machine-readable half lives in tests/fixtures/threshold-neighbors.json
 * and carries no source text, because the corpus is third-party and
 * unpublished. This file carries short excerpts, because a verdict on whether a
 * pair *should* have crossed cannot be reached from an ID and two numbers.
 *
 * Most consequential threshold first. A credible crossing changes what a reader
 * is shown; a candidate-floor crossing changes only which entries were
 * considered, and 97 of those are a census, not 97 decisions.
 */
function renderMarkdown(identity, census, crossings, rulings = {}) {
  const lines = [];
  const verdictOf = (row) => {
    const ruled = rulings[`${row.unitId}|${row.canonId}|${row.threshold}`];
    if (!ruled || ruled.ruling === 'PENDING') return '';
    return `**${ruled.ruling}**${ruled.ruledBy ? ` · ${ruled.ruledBy}` : ''}`;
  };
  const table = (rows) => {
    lines.push('', '| Canon entry | Passage | Before | After | Δ | ACCEPT / REJECT |');
    lines.push('|---|---|---|---|---|---|');
    rows.forEach((row) => {
      const passage = row.excerpt
        ? `${row.source} · ${row.passageIndex}<br>“${row.excerpt}…”`
        : `${row.source} · ${row.passageIndex}<br>\`${row.unitId}\``;
      lines.push(`| \`${row.canonId}\` | ${passage} | ${row.before.toFixed(3)} `
        + `| ${row.after.toFixed(3)} | ${row.delta > 0 ? '+' : ''}${row.delta.toFixed(3)} | ${verdictOf(row)} |`);
    });
    lines.push('');
  };

  const canonMoved = census.baselineCanonIndexVersion !== census.currentCanonIndexVersion;
  lines.push('# LE Lab — threshold adjudication sheet', '');
  lines.push('Generated by `tools/lab-threshold-sweep.mjs`. One row per corpus pair that crossed an');
  lines.push('admission threshold between the captured baseline and the current tree. The rightmost');
  lines.push('column is the ruling, rendered from `tests/fixtures/threshold-neighbors.json` so this');
  lines.push('sheet and the fixture the suite enforces cannot disagree.', '');
  if (canonMoved) {
    lines.push('**The canon moved in this run.** Crossings below are attributable to the doctrine');
    lines.push('change as well as to any scoring change: adding entries moves IDF for every pair,');
    lines.push('and new entries enter the candidate set from a prior score of zero.', '');
  }
  const answered = crossings.filter((row) => {
    const ruled = rulings[`${row.unitId}|${row.canonId}|${row.threshold}`];
    return ruled && ruled.ruling !== 'PENDING';
  }).length;
  lines.push(answered === crossings.length && crossings.length
    ? `**Adjudication closed — all ${crossings.length} crossings ruled.**`
    : `**Adjudication open — ${crossings.length - answered} of ${crossings.length} crossings outstanding.**`, '');
  lines.push('```');
  lines.push(`analyzer   ${census.baselineAnalyzer} -> ${census.currentAnalyzer}`);
  lines.push(`config     ${census.baselineScoringConfigHash} -> ${census.currentScoringConfigHash}`);
  lines.push(`canon      ${census.baselineCanonIndexVersion} -> ${census.currentCanonIndexVersion}`
    + `${canonMoved ? '  (doctrine moved)' : '  (unchanged)'}`);
  lines.push(`population ${identity.passages} retained passages x ${identity.entries} entries = ${census.scoredPairs} pairs`);
  lines.push(`changed    ${census.changed}   ${census.decreased} down / ${census.increased} up`);
  THRESHOLDS.forEach((threshold) => {
    const row = census.crossings[threshold.name];
    lines.push(`${threshold.name.padEnd(20)} ${String(threshold.value).padEnd(5)} `
      + `${row.gains} gain / ${row.losses} loss`);
  });
  lines.push('```', '');
  lines.push('**How to rule.** ACCEPT means the new side is the right side — the pair crossed because');
  lines.push('the old score was resting on a fragment that was never a concept. REJECT means the pair');
  lines.push('belonged where it was, and the fix has cost something real. A REJECT does **not** become a');
  lines.push('threshold change: thresholds are not retuned to un-cross a pair, because that trades one');
  lines.push('adjudicated case for every un-adjudicated one. It becomes a targeted fixture pinning the');
  lines.push('pre-fix outcome and an entry in the release report saying what the fix cost.', '');
  lines.push('Record each verdict in `tests/fixtures/threshold-neighbors.json` under `rulings`, keyed');
  lines.push('`<unitId>|<canonId>|<threshold>`, and set `adjudicationOpen: false` when none are left');
  lines.push('PENDING. The suite enforces that pairing.', '');

  const ordered = [...THRESHOLDS].reverse();
  for (const threshold of ordered) {
    const rows = crossings.filter((row) => row.threshold === threshold.name);
    const gains = rows.filter((row) => row.direction === 'gain');
    const losses = rows.filter((row) => row.direction === 'loss');
    lines.push(`## ${threshold.name} — ${threshold.value}`, '');
    lines.push(`${gains.length} gain(s), ${losses.length} loss(es).`, '');
    if (gains.length) { lines.push('### Gains — pairs that now clear the line'); table(gains); }
    if (losses.length) { lines.push('### Losses — pairs that no longer clear it'); table(losses); }
    if (!rows.length) lines.push('Nothing crossed.', '');
  }
  lines.push('---', '');
  lines.push('**On the excerpts.** `lab-corpus/` is gitignored third-party text (md/RERUN.md §1) and');
  lines.push('this file is committed. The excerpts are capped at a fragment each and appear only');
  lines.push('because a ruling cannot be reached without seeing the sentence. The machine-readable');
  lines.push('record in `tests/fixtures/threshold-neighbors.json` carries none — it is IDs and scores.');
  lines.push('Regenerate with `--excerpt-chars 0` to produce this sheet without source text.', '');
  return `${lines.join('\n')}\n`;
}

main();
