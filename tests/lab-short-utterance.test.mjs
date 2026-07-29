import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SCORING_CONFIG,
  analyzeDocument,
  classifyDomainRelevance,
  detectClaimUnits,
} from '../js/lab-analyzer.js';
import { normalizeInput } from '../js/lab-intake.js';

/*
 * Frozen short-utterance matrix — a FREEZE, not a proposal.
 *
 * Every expectation in tests/fixtures/short-utterance-matrix.json is what the
 * shipped analyzer did on 2026-07-29. Nothing was changed to make it pass, and
 * `minClaimWords` is asserted below to be exactly what it was, so this file
 * cannot quietly become the justification for having moved it.
 *
 * The matrix is green today by construction. Its value is the day it goes red:
 * a structural path through compact utterances then has to decide about each
 * row deliberately, with the previous behavior written down beside it, instead
 * of discovering the movement after the fact.
 *
 * What is asserted: outcome, gate status, decisive reason code, claim-likeness,
 * and the exact set of credible matches. What is recorded but NOT asserted:
 * weak matches and scores, which move by third decimals on any canon edit. A
 * fixture that went red on alias curation would produce noise where this one is
 * meant to produce signal.
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const matrix = JSON.parse(readFileSync(
  new URL('./fixtures/short-utterance-matrix.json', import.meta.url),
  'utf8',
));
const canonIndex = JSON.parse(readFileSync(path.join(ROOT_DIR, 'data', 'le-canon-index.json'), 'utf8'));

const OUTCOMES = new Set(['ignored', 'retained-not-claim-like', 'retained-unmapped', 'mapped']);
const CONSTRAINTS = new Set(['domain-gate', 'claim-word-floor', 'admission-threshold', 'none']);
const allCases = Object.values(matrix.blocks).flatMap((block) => block.cases);

function documentFor(text) {
  return normalizeInput({
    text,
    format: 'auto',
    source: { title: 'short-utterance fixture', type: 'fixture-file', url: null },
    extraction: { method: 'fixture', warnings: [] },
    createdAt: '1970-01-01T00:00:00.000Z',
  });
}

/** Runs one utterance through the shipped pipeline and reduces it to an outcome. */
async function outcomeFor(text) {
  const documentValue = documentFor(text);
  const [unit] = classifyDomainRelevance(detectClaimUnits(documentValue));
  assert.ok(unit, `"${text}" produced no claim unit at all`);
  const relevance = unit.domainRelevance;
  const observed = {
    status: relevance.status,
    reasonCode: relevance.reasonCode,
    claimLikelihood: unit.claimLikelihood,
    isClaimLike: unit.isClaimLike,
    wordCount: unit.wordCount,
    credibleMatches: [],
    weakMatches: [],
  };
  if (relevance.status === 'irrelevant') return { ...observed, outcome: 'ignored' };

  const result = await analyzeDocument(documentValue, canonIndex, {});
  const segment = result.segments.find((row) => row.unit.id === unit.id) || result.segments[0];
  observed.credibleMatches = (segment?.matches || []).map((match) => match.canonId);
  observed.weakMatches = (segment?.weakMatches || []).map((match) => match.canonId);
  const outcome = !unit.isClaimLike
    ? 'retained-not-claim-like'
    : observed.credibleMatches.length ? 'mapped' : 'retained-unmapped';
  return { ...observed, outcome };
}

test('the matrix declares itself a freeze and names the build it froze', () => {
  assert.equal(matrix.schema, 'le-lab.short-utterance-matrix/1.0');
  assert.ok(matrix.contract.includes('FREEZE ONLY'));
  assert.ok(matrix.frozenAgainst.analyzer && matrix.frozenAgainst.canonIndex
    && matrix.frozenAgainst.scoringConfigHash);
  assert.ok(Array.isArray(matrix.findings) && matrix.findings.length >= 5,
    'the matrix states what it found, not only what it observed');
});

test('the freeze changed no threshold, and minClaimWords is untouched', () => {
  // The one guard that makes "freeze only" a property rather than a promise: if
  // a later pass lowers the word floor and updates this fixture to match, this
  // assertion fails and the change has to be argued for somewhere else.
  assert.equal(SCORING_CONFIG.minClaimWords, 4);
  assert.equal(matrix.thresholdsAtFreeze.minClaimWords, SCORING_CONFIG.minClaimWords);
  assert.equal(matrix.thresholdsAtFreeze.claimLikeThreshold, SCORING_CONFIG.claimLikeThreshold);
  assert.equal(matrix.thresholdsAtFreeze.minCredibleScore, SCORING_CONFIG.minCredibleScore);
  assert.equal(matrix.thresholdsAtFreeze.minWeakScore, SCORING_CONFIG.minWeakScore);
  assert.equal(matrix.thresholdsAtFreeze.shortUnitWordCount, SCORING_CONFIG.shortUnitWordCount);
});

test('every case is compact, uniquely identified, and labelled on both axes', () => {
  const ids = new Set();
  assert.ok(allCases.length >= 20, 'the matrix covers claims, non-claims, and traps');
  allCases.forEach((entry) => {
    assert.ok(entry.id && !ids.has(entry.id), `case ID ${entry.id} is unique`);
    ids.add(entry.id);
    assert.ok(OUTCOMES.has(entry.assertedOutcome), `${entry.id} asserts a known outcome`);
    assert.ok(CONSTRAINTS.has(entry.bindingConstraint), `${entry.id} names which layer decided it`);
    assert.ok(entry.humanReading, `${entry.id} records what a reader would say`);
    assert.ok(entry.note, `${entry.id} says why it is in the matrix`);
    assert.ok(Array.isArray(entry.observed.credibleMatches));
  });
});

test('the compact block covers the four named utterances and its controls match them for length', () => {
  const compact = matrix.blocks.compactCanonClaims.cases.map((entry) => entry.text);
  ['Hypergamy is real.', 'The wall is real.', 'Provider men win.', 'Men prefer youth.']
    .forEach((text) => assert.ok(compact.includes(text), `${text} is in the matrix`));

  // A three-word claim is only interesting beside a three-word non-claim, and a
  // four-word claim beside a four-word non-claim. Without that, "short text is
  // handled badly" is unfalsifiable.
  const lengths = (block) => new Set(block.cases.map((entry) => entry.wordCount));
  const claimLengths = lengths(matrix.blocks.compactCanonClaims);
  const controlLengths = new Set([
    ...lengths(matrix.blocks.shortNonClaims),
    ...lengths(matrix.blocks.polysemousTraps),
  ]);
  [...claimLengths].forEach((wordCount) => {
    assert.ok(controlLengths.has(wordCount),
      `no non-claim or trap is ${wordCount} words long, so the ${wordCount}-word claim rows have no control`);
  });
});

test('every expanded twin is longer than its compact original and says the same thing', () => {
  const compact = matrix.blocks.compactCanonClaims.cases;
  const expanded = matrix.blocks.expandedTwins.cases;
  assert.equal(expanded.length, compact.length, 'one twin per compact claim, in order');
  expanded.forEach((twin, index) => {
    assert.ok(twin.wordCount > compact[index].wordCount,
      `${twin.id} must be longer than ${compact[index].id} or it tests nothing about length`);
    assert.ok(twin.wordCount >= SCORING_CONFIG.minClaimWords,
      `${twin.id} must clear the claim-word floor for the comparison to isolate the gate`);
  });
});

test('the analyzer treats every utterance exactly as the matrix froze it', async () => {
  const failures = [];
  for (const entry of allCases) {
    const observed = await outcomeFor(entry.text);

    if (observed.outcome !== entry.assertedOutcome) {
      failures.push(`  [${entry.id}] "${entry.text}" — froze ${entry.assertedOutcome}, now ${observed.outcome}`);
    }
    if (observed.status !== entry.observed.status) {
      failures.push(`  [${entry.id}] gate status froze ${entry.observed.status}, now ${observed.status}`);
    }
    if (observed.reasonCode !== entry.observed.reasonCode) {
      failures.push(`  [${entry.id}] reason code froze ${entry.observed.reasonCode}, now ${observed.reasonCode}`);
    }
    if (observed.isClaimLike !== entry.observed.isClaimLike) {
      failures.push(`  [${entry.id}] isClaimLike froze ${entry.observed.isClaimLike}, now ${observed.isClaimLike}`);
    }
    if (observed.wordCount !== entry.wordCount) {
      failures.push(`  [${entry.id}] wordCount recorded ${entry.wordCount}, measured ${observed.wordCount}`);
    }
    const frozenMatches = [...entry.observed.credibleMatches].sort();
    const currentMatches = [...observed.credibleMatches].sort();
    if (JSON.stringify(frozenMatches) !== JSON.stringify(currentMatches)) {
      failures.push(`  [${entry.id}] credible matches froze [${frozenMatches}], now [${currentMatches}]`);
    }
  }
  assert.equal(failures.length, 0,
    `${failures.length} short-utterance row(s) no longer match the freeze. This is not automatically a `
    + `regression — it is a behavior change that must be adjudicated and the fixture re-frozen with a `
    + `note, never silently updated:\n${failures.join('\n')}`);
});

test('the binding constraint each case names is the one the analyzer actually applied', async () => {
  // The matrix's central claim is that the DOMAIN GATE, not the word floor,
  // decides most of these. That claim is checked rather than asserted in prose.
  const failures = [];
  for (const entry of allCases) {
    const observed = await outcomeFor(entry.text);
    const actual = observed.status === 'irrelevant'
      ? 'domain-gate'
      : !observed.isClaimLike
        ? 'claim-word-floor'
        : observed.credibleMatches.length ? 'none' : 'admission-threshold';
    if (actual !== entry.bindingConstraint) {
      failures.push(`  [${entry.id}] claims ${entry.bindingConstraint}, analyzer applied ${actual}`);
    }
  }
  assert.equal(failures.length, 0, `${failures.length} mislabelled constraint(s):\n${failures.join('\n')}`);

  const gated = matrix.blocks.compactCanonClaims.cases
    .filter((entry) => entry.bindingConstraint === 'domain-gate');
  assert.equal(gated.length, 3,
    'three of the four compact canon claims are stopped by the gate, not by length — the matrix headline');
});

test('every short non-claim and polysemous trap stays out', async () => {
  // The adversarial half. If these ever start mapping, the miss rows above stop
  // meaning anything, because "retain more short text" would be trivially achievable.
  const adversarial = [
    ...matrix.blocks.shortNonClaims.cases,
    ...matrix.blocks.polysemousTraps.cases,
  ];
  for (const entry of adversarial) {
    assert.equal(entry.assertedOutcome, 'ignored', `${entry.id} is frozen as ignored`);
    const observed = await outcomeFor(entry.text);
    assert.equal(observed.credibleMatches.length, 0,
      `${entry.id} "${entry.text}" produced a credible match: ${observed.credibleMatches}`);
  }
  assert.ok(adversarial.length >= matrix.blocks.compactCanonClaims.cases.length,
    'the adversarial rows at least match the claim rows one for one');
});
