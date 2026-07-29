import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  analyzeDocument,
  prepareCanonIndex,
  detectClaimUnits,
  classifyDomainRelevance,
  analyzerInternals,
  SCORING_CONFIG,
} from '../js/lab-analyzer.js';
import { normalizeInput } from '../js/lab-intake.js';

/*
 * Frozen match-behavior benchmark.
 *
 * Sibling of tests/lab-domain-benchmark.test.mjs, and the same contract:
 * append-only cases, no per-round goalpost moves, and every case carries the
 * verdict the shipped analyzer gave when the case was written down. The domain
 * benchmark measures what reaches the matcher; this one measures what the
 * matcher then does with it — which evidence survives retrieval, and what the
 * analyzer says about who is claiming what.
 *
 * The three blocks are deliberately separate because they fail for unrelated
 * reasons and are fixed by unrelated changes.
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const benchmark = JSON.parse(readFileSync(
  new URL('./fixtures/match-behavior-benchmark.json', import.meta.url),
  'utf8',
));
const canonIndex = JSON.parse(readFileSync(path.join(ROOT_DIR, 'data', 'le-canon-index.json'), 'utf8'));
const prepared = prepareCanonIndex(canonIndex);

const STANCE_LABELS = new Set(['Resembles', 'Supports', 'Challenges', 'Contradicts', 'Extends', 'Context only']);

function documentFor(text) {
  return normalizeInput({
    text,
    format: 'auto',
    source: { title: 'match-behavior fixture', type: 'fixture-file', url: null },
    extraction: { method: 'fixture', warnings: [] },
    createdAt: '1970-01-01T00:00:00.000Z',
  });
}

/** The single classified claim unit a one-sentence fixture case produces. */
function unitFor(text) {
  const [unit] = classifyDomainRelevance(detectClaimUnits(documentFor(text)));
  assert.ok(unit, `Fixture text produced no claim unit: ${text}`);
  return unit;
}

async function analyzeCase(text) {
  const unit = unitFor(text);
  if (unit.domainRelevance.status === 'irrelevant') {
    return { gatedOut: true, reasonCode: unit.domainRelevance.reasonCode, matches: [], weakMatches: [] };
  }
  const result = await analyzeDocument(documentFor(text), canonIndex, {});
  const segment = result.segments.find((row) => row.unit.id === unit.id) || result.segments[0];
  return {
    gatedOut: false,
    reasonCode: unit.domainRelevance.reasonCode,
    matches: segment?.matches || [],
    weakMatches: segment?.weakMatches || [],
  };
}

/**
 * The working candidate set for a unit: what survives retrieval and is
 * available to admission, bounded context, and stance.
 */
function candidateSet(unit) {
  return analyzerInternals.candidateSetFor(unit, prepared);
}

/** Every entry above the candidate floor, ranked — the pre-truncation truth. */
function rankedCandidates(unit) {
  return prepared.entries
    .map((entry) => ({ entry, rawScore: analyzerInternals.scoreEntry(unit, entry, prepared.idf) }))
    .filter((row) => row.rawScore.score >= SCORING_CONFIG.candidateScoreFloor)
    .sort((a, b) => b.rawScore.score - a.rawScore.score || a.entry.id.localeCompare(b.entry.id));
}

function carriesExactEvidence(rawScore) {
  return Boolean(rawScore.phraseHits.length || rawScore.exactAliasHits.length || rawScore.signatureHits.length);
}

test('match-behavior fixture is structurally sound', () => {
  assert.equal(benchmark.schema, 'le-lab.match-behavior/1.0');
  const ids = new Set();
  const blocks = Object.entries(benchmark.blocks);
  assert.equal(blocks.length, 3, 'The fixture holds the three adjudicated blocks.');
  blocks.forEach(([name, block]) => {
    assert.ok(block.question && block.ruling, `${name} states its question and its ruling.`);
    assert.ok(Array.isArray(block.cases) && block.cases.length, `${name} holds cases.`);
    block.cases.forEach((entry) => {
      assert.ok(entry.id && !ids.has(entry.id), `Case ID ${entry.id} is unique.`);
      ids.add(entry.id);
      assert.ok(typeof entry.text === 'string' && entry.text.trim().length >= 20, `${entry.id} has substantive text.`);
      assert.ok(entry.observedAtFreeze, `${entry.id} records what the shipped analyzer did at freeze time.`);
    });
  });
  benchmark.blocks.misreadingPolarity.cases.forEach((entry) => {
    assert.ok(STANCE_LABELS.has(entry.expected.stance), `${entry.id} expects a real stance label.`);
    assert.ok(['assert', 'negated', 'attributed'].includes(entry.wrapper), `${entry.id} declares its wrapper.`);
  });
});

test('misreading-surface overlap is labelled by who is asserting it', async () => {
  const failures = [];
  for (const entry of benchmark.blocks.misreadingPolarity.cases) {
    const { matches, gatedOut } = await analyzeCase(entry.text);
    const match = matches.find((row) => row.canonId === entry.canonId);
    if (entry.expected.mapped && !match) {
      failures.push(`  [${entry.id}] ${entry.canonId} did not map at all (gatedOut=${gatedOut})`);
      continue;
    }
    const stance = match?.alignment?.label;
    if (stance !== entry.expected.stance) {
      failures.push(
        `  [${entry.id}] ${entry.wrapper}: expected ${entry.expected.stance}, got ${stance} `
        + `(score ${match?.score}) — ${entry.text}`,
      );
    }
  }
  assert.equal(failures.length, 0,
    `${failures.length} polarity case(s) mislabel who is making the claim:\n${failures.join('\n')}`);
});

test('every exact phrase, alias, and signature hit survives retrieval', () => {
  const failures = [];
  for (const entry of benchmark.blocks.candidateRetention.cases) {
    const unit = unitFor(entry.text);
    const retained = new Set(candidateSet(unit).map((candidate) => candidate.canonId));

    (entry.mustRetain || []).forEach((requirement) => {
      if (!retained.has(requirement.canonId)) {
        failures.push(`  [${entry.id}] ${requirement.canonId} (${requirement.evidence}) was dropped before adjudication — ${entry.text}`);
      }
    });

    // The property, over and above the named cases: evidence-bearing entries
    // are never the ones cut. Retention is not credibility — a retained hit
    // still has to earn admission on its own score.
    rankedCandidates(unit)
      .filter((row) => carriesExactEvidence(row.rawScore))
      .forEach((row) => {
        if (!retained.has(row.entry.id)) {
          failures.push(
            `  [${entry.id}] ${row.entry.id} carries exact evidence at ${row.rawScore.score} and is absent `
            + `from the working set of ${retained.size}`,
          );
        }
      });
  }
  assert.equal(failures.length, 0,
    `${failures.length} evidence-bearing candidate(s) vanish before adjudication:\n${failures.join('\n')}`);
});

test('the working set only ever widens, and widening confers no credibility', () => {
  // The other half of the union contract, and the reason this is safe to ship:
  // whatever the old ranked-and-truncated set held is still held, nothing that
  // was admitted stops being admitted, and every newly retained candidate is
  // still judged by the unchanged score-plus-evidence rule.
  for (const entry of benchmark.blocks.candidateRetention.cases) {
    const unit = unitFor(entry.text);
    const ranked = rankedCandidates(unit);
    const working = candidateSet(unit);
    const retained = new Set(working.map((candidate) => candidate.canonId));

    ranked.slice(0, SCORING_CONFIG.maxCandidatesPerUnit).forEach((row) => {
      assert.ok(retained.has(row.entry.id),
        `${entry.id}: ${row.entry.id} was in the top ${SCORING_CONFIG.maxCandidatesPerUnit} and is no longer retained.`);
    });

    // Nothing is invented. The admitted set the working candidates produce is
    // exactly the admitted set the FULL above-floor ranking produces, so the
    // union restores what truncation was hiding and adds nothing else.
    const admittedFromWorking = working
      .filter((candidate) => candidate.score >= SCORING_CONFIG.minCredibleScore
        && analyzerInternals.hasCredibleMatchEvidence(candidate._rawScore))
      .map((candidate) => candidate.canonId)
      .sort();
    const admittedFromFullRanking = ranked
      .filter((row) => row.rawScore.score >= SCORING_CONFIG.minCredibleScore
        && analyzerInternals.hasCredibleMatchEvidence(row.rawScore))
      .map((row) => row.entry.id)
      .sort();
    assert.deepEqual(admittedFromWorking, admittedFromFullRanking,
      `${entry.id}: the working set admits a different population than the full ranking does.`);
  }
});

test('a curated single word is sufficient only under its declared conditions', async () => {
  const failures = [];
  for (const entry of benchmark.blocks.typedAlias.cases) {
    const { matches, gatedOut, reasonCode } = await analyzeCase(entry.text);
    const credible = matches.some((row) => row.canonId === entry.canonId);
    if (credible !== entry.expected.credibleMatch) {
      failures.push(
        `  [${entry.id}] ${entry.polarity} (${entry.aliasClass || entry.trap}): expected credibleMatch=`
        + `${entry.expected.credibleMatch}, got ${credible} for ${entry.canonId}`
        + `${gatedOut ? ` (gated out: ${reasonCode})` : ''} — ${entry.text}`,
      );
    }
  }
  const negatives = benchmark.blocks.typedAlias.cases.filter((entry) => entry.polarity === 'negative');
  const positives = benchmark.blocks.typedAlias.cases.filter((entry) => entry.polarity === 'positive');
  assert.ok(negatives.length >= positives.length,
    'The adversarial negatives at least match the positives one for one.');
  assert.equal(failures.length, 0,
    `${failures.length} typed-alias case(s) disagree with the ruling:\n${failures.join('\n')}`);
});
