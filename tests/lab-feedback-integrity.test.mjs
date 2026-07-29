import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { analyzeDocument, SCORING_CONFIG } from '../js/lab-analyzer.js';
import { createDemoDocument } from '../js/lab-demo.js';
import { buildMappingFeedback } from '../js/lab-feedback.js';

/*
 * ---------------------------------------------------------------------------
 * RED. These cases fail against v2.4.1 on purpose.
 * ---------------------------------------------------------------------------
 * Four defects found in verification review, each frozen here as the behavior
 * the exporter and the trace are supposed to have. Every one of them is a case
 * where a flag file DISAGREES WITH THE ANALYZER WHILE LOOKING CORRECT, which is
 * the only failure mode that matters for an artifact whose whole purpose is to
 * be evidence in someone else's adjudication.
 *
 *   A  a trace that contradicts the row it describes is exported anyway
 *   B  machineClaimLike is read from a path the analyzer never writes
 *   C  two different reviews of one row collide onto one ID and one filename
 *   D  a candidate's fate is reported as evidence-retained when it was not,
 *      and threshold-hidden candidates are counted as cap-hidden
 *
 * None of these can be fixed by moving a score, a stance, or an admission, and
 * a fix that does is out of contract.
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FEEDBACK_TOOL = path.join(ROOT_DIR, 'tools', 'lab-feedback.mjs');
const canonIndex = JSON.parse(readFileSync(path.join(ROOT_DIR, 'data', 'le-canon-index.json'), 'utf8'));
const documentValue = createDemoDocument({ createdAt: '1970-01-01T00:00:00.000Z' });

const analysis = await analyzeDocument(documentValue, canonIndex, { diagnostics: true });
const { diagnostics } = analysis;
const plainAnalysis = { ...analysis };
delete plainAnalysis.diagnostics;

const mappedSegment = analysis.segments.find((segment) => segment.mapped);
const tracedUnit = diagnostics.claimUnits.find((unit) => unit.segmentId === mappedSegment.unit.id);

function flag(overrides = {}) {
  return buildMappingFeedback({
    analysis: plainAnalysis,
    diagnostics,
    segmentId: mappedSegment.unit.id,
    labRelease: '2.4.2',
    generatedAt: '2026-07-29T00:00:00.000Z',
    review: { disposition: 'wrong-primary' },
    ...overrides,
  });
}

/** One trace with one unit's candidates rewritten, everything else untouched. */
function tamper(rewrite) {
  return {
    ...diagnostics,
    claimUnits: diagnostics.claimUnits.map((unit) => (unit.segmentId === mappedSegment.unit.id
      ? { ...unit, ...rewrite(unit) }
      : unit)),
  };
}

/* ===========================================================================
 * A — INTEGRITY. The trace must reproduce the public row, or the export refuses.
 * ===========================================================================
 * v2.4.1 checks the excerpt and the scoring hash and nothing else, so a trace
 * can be swapped for one that describes a different analysis of the same
 * sentence and the file still exports — carrying a displayed primary match
 * above a candidate set that does not contain it. The excerpt still matches,
 * the hashes still match, `available` still reads true. An adjudicator has no
 * way to tell that apart from a real trace, which makes it worse than a missing
 * one.
 */

test('RED A1: a trace with the candidates emptied out must be refused', () => {
  // The exploit in its simplest form. Excerpt preserved, hash preserved,
  // candidates gone. v2.4.1 exports available:true with candidateCount 0 while
  // display.primary names a match at 0.76.
  assert.ok(tracedUnit.candidates.length > 0, 'the row really does have candidates');
  assert.throws(
    () => flag({ diagnostics: tamper(() => ({ candidates: [] })) }),
    /does not reproduce|no longer describes|disagrees with/i,
  );
});

test('RED A2: a trace whose displayed match is a different concept must be refused', () => {
  const swapped = tamper((unit) => ({
    candidates: unit.candidates.map((candidate) => (candidate.display === 'match'
      ? { ...candidate, canonId: 'smv:not-a-real-concept' }
      : candidate)),
  }));
  assert.throws(() => flag({ diagnostics: swapped }), /does not reproduce|canon/i);
});

test('RED A3: a trace whose displayed score disagrees with the row must be refused', () => {
  const rescored = tamper((unit) => ({
    candidates: unit.candidates.map((candidate) => (candidate.display === 'match'
      ? { ...candidate, score: candidate.score + 0.1 }
      : candidate)),
  }));
  assert.throws(() => flag({ diagnostics: rescored }), /does not reproduce|score/i);
});

test('RED A4: a trace whose alignment disagrees with the row must be refused', () => {
  const restanced = tamper((unit) => ({
    candidates: unit.candidates.map((candidate) => (candidate.display === 'match' && candidate.alignment
      ? { ...candidate, alignment: { ...candidate.alignment, label: 'Contradicts' } }
      : candidate)),
  }));
  const displayedLabel = mappedSegment.matches[0].alignment.label;
  if (displayedLabel === 'Contradicts') return; // nothing to disagree about
  assert.throws(() => flag({ diagnostics: restanced }), /does not reproduce|alignment|stance/i);
});

test('RED A5: a trace that demotes a displayed match to not-displayed must be refused', () => {
  const demoted = tamper((unit) => ({
    candidates: unit.candidates.map((candidate) => (candidate.display === 'match'
      ? { ...candidate, display: 'not-displayed' }
      : candidate)),
  }));
  assert.throws(() => flag({ diagnostics: demoted }), /does not reproduce|display/i);
});

test('RED A6: a trace that disagrees about whether the row mapped must be refused', () => {
  const unmapped = tamper(() => ({ mapped: false }));
  assert.throws(() => flag({ diagnostics: unmapped }), /does not reproduce|mapped/i);
});

test('RED A7: the diagnostics carry the identity of the run that produced them', () => {
  // IDs and versions alone were the exploited gap: they are properties of the
  // BUILD, not of this document, this input, or this passage. A trace lifted
  // from another analysis on the same build satisfies all of them.
  assert.equal(diagnostics.analysisId, analysis.id);
  assert.ok(diagnostics.canonSnapshotHash, 'a canon snapshot hash');
  assert.ok(diagnostics.inputDigest, 'a digest of the analyzed input and its overrides');
  const traced = diagnostics.claimUnits.find((unit) => unit.segmentId === mappedSegment.unit.id);
  assert.ok(traced.unitDigest, 'a per-unit digest binding the trace to the published row');
});

test('RED A8: a trace from a different analysis of the same build is refused', () => {
  const foreign = { ...diagnostics, analysisId: 'lea-someone-elses-document' };
  assert.throws(() => flag({ diagnostics: foreign }), /different analysis|does not reproduce/i);
});

/* ===========================================================================
 * B — machineClaimLike is read from the wrong object.
 * ===========================================================================
 * applyDomainOverride writes it on the UNIT; the exporter reads it from
 * unit.domainRelevance. So the one field that tells an adjudicator "the machine
 * said this was not claim-like and a human overrode that" is always null —
 * silently, on exactly the rows where it decides whether the flag is about the
 * gate or about the reviewer.
 */

test('RED B: an overridden passage exports the machine grammar verdict it preserved', async () => {
  const ignored = analysis.domainRelevance.ignoredPassages;
  assert.ok(ignored.length, 'the demo sets a passage aside');

  let checked = 0;
  for (const passage of ignored) {
    const reanalyzed = await analyzeDocument(documentValue, canonIndex, {
      diagnostics: true,
      domainOverrides: { [passage.segmentId]: 'include' },
    });
    const segment = reanalyzed.segments.find((row) => row.unit.id === passage.segmentId);
    if (!segment || segment.unit.machineClaimLike !== false) continue;

    const plain = { ...reanalyzed };
    delete plain.diagnostics;
    const feedback = buildMappingFeedback({
      analysis: plain,
      diagnostics: reanalyzed.diagnostics,
      segmentId: passage.segmentId,
      labRelease: '2.4.2',
      generatedAt: '2026-07-29T00:00:00.000Z',
      review: { disposition: segment.mapped ? 'wrong-primary' : 'missing-expected-concept' },
    });

    assert.equal(segment.unit.isClaimLike, true, 'the override admitted it');
    assert.equal(feedback.domainDecision.machineClaimLike, false,
      'the exported payload preserves the machine verdict the override overrode');
    assert.equal(feedback.claimUnit.isClaimLike, true);
    checked += 1;
    break;
  }
  assert.equal(checked, 1, 'the demo has an override case that exercises this');
});

/* ===========================================================================
 * C — flagId collides across distinct reviews, and the CLI overwrites.
 * ===========================================================================
 * The ID hashes analysis + unit + disposition. It does not hash the review. Two
 * reviewers who disagree about the same wrong mapping — or one reviewer
 * revising an opinion — produce one ID, one filename, and
 * `--out` silently keeps whichever ran last.
 */

test('RED C1: two different reviews of one row get two different flag IDs', () => {
  const first = flag({ review: { disposition: 'wrong-primary', expectedCanonIds: ['smv:looks'], note: 'first opinion' } });
  const second = flag({ review: { disposition: 'wrong-primary', expectedCanonIds: ['pills:page-bp'], note: 'a different opinion' } });
  assert.notEqual(first.flagId, second.flagId,
    'a flag ID must be a hash of the review, not of the row it is about');
});

test('RED C2: the ID still hashes to the same value for an identical review', () => {
  const review = { disposition: 'wrong-primary', expectedCanonIds: ['smv:looks'], note: 'the same words' };
  assert.equal(flag({ review }).flagId, flag({ review }).flagId);
});

test('RED C3: every review field participates in the ID', () => {
  const base = { disposition: 'wrong-primary', expectedCanonIds: ['smv:looks'], forbiddenCanonIds: ['smv:money'], expectedAlignment: 'Supports', note: 'a note' };
  const ids = new Set();
  [
    base,
    { ...base, expectedCanonIds: ['smv:money'] },
    { ...base, forbiddenCanonIds: ['smv:looks'] },
    { ...base, expectedAlignment: 'Challenges' },
    { ...base, note: 'a different note' },
    { ...base, disposition: 'false-positive' },
  ].forEach((review) => ids.add(flag({ review }).flagId));
  ids.add(flag({ review: base, includeProvenance: true }).flagId);
  assert.equal(ids.size, 7, 'disposition, both ID lists, alignment, note and provenance all move the ID');
});

test('RED C4: the CLI writes two distinct stubs for two distinct reviews', () => {
  const outDir = mkdtempSync(path.join(os.tmpdir(), 'le-lab-flag-'));
  const inbox = mkdtempSync(path.join(os.tmpdir(), 'le-lab-inbox-'));
  const written = [
    flag({ review: { disposition: 'wrong-primary', expectedCanonIds: ['smv:looks'], note: 'first opinion' } }),
    flag({ review: { disposition: 'wrong-primary', expectedCanonIds: ['pills:page-bp'], note: 'a different opinion' } }),
  ].map((feedback, index) => {
    const file = path.join(inbox, `flag-${index}.json`);
    writeFileSync(file, JSON.stringify(feedback, null, 2), 'utf8');
    execFileSync(process.execPath, [FEEDBACK_TOOL, file, '--out', outDir, '--quiet'], { cwd: ROOT_DIR });
    return feedback;
  });

  const stubs = readdirSync(outDir);
  assert.equal(stubs.length, 2, 'two reviews, two stub files — the second must not overwrite the first');
  const notes = stubs.map((name) => JSON.parse(readFileSync(path.join(outDir, name), 'utf8')).note);
  assert.ok(notes.some((note) => note.includes('first opinion')), 'the first review survived');
  assert.ok(notes.some((note) => note.includes('a different opinion')), 'the second review survived');
  assert.equal(new Set(written.map((feedback) => feedback.flagId)).size, 2);
});

/* ===========================================================================
 * D — the candidate fate fields say things that are not true.
 * ===========================================================================
 * `survivedTruncationOnEvidence` is computed from rank alone, so a candidate
 * the union kept on CONTEXT reports that it was kept on EVIDENCE. And
 * `hiddenByDisplayCaps` counts every undisplayed candidate, so a candidate that
 * never cleared the weak threshold is reported as one the caps pushed off the
 * ledger. Both send an adjudicator to the wrong layer: one says "ranking lost a
 * fact", the other says "the display is too small", and neither is what
 * happened.
 */

const FATES = new Set([
  'displayed', 'failed-admission', 'below-weak-threshold',
  'credible-cap', 'weak-cap', 'retained-after-prefix-cut',
]);

test('RED D1: no candidate claims evidence retention it did not have', () => {
  const contextRetained = diagnostics.claimUnits
    .flatMap((unit) => unit.candidates)
    .filter((candidate) => candidate.truncationFate.retainedBecause === 'context-eligible');
  assert.ok(contextRetained.length >= 2, 'the demo retains candidates on context');

  diagnostics.claimUnits.flatMap((unit) => unit.candidates).forEach((candidate) => {
    assert.equal('survivedTruncationOnEvidence' in candidate.truncationFate, false,
      `${candidate.canonId} still carries the boolean that conflated rank with evidence`);
    assert.equal(typeof candidate.truncationFate.retainedAfterPrefixCut, 'boolean');
    assert.equal(
      candidate.truncationFate.retainedAfterPrefixCut,
      (candidate.rankAtRetrieval || 0) > candidate.truncationFate.cap,
    );
  });
});

test('RED D2: every candidate carries exactly one fate, and it is the true one', () => {
  diagnostics.claimUnits.forEach((unit) => {
    unit.candidates.forEach((candidate) => {
      assert.ok(FATES.has(candidate.fate), `${candidate.canonId} has a known fate (got ${candidate.fate})`);
      const displayed = candidate.display !== 'not-displayed';
      if (candidate.fate === 'below-weak-threshold') {
        assert.equal(candidate.score < SCORING_CONFIG.minWeakScore, true);
        assert.equal(displayed, false);
      }
      if (candidate.fate === 'credible-cap') {
        assert.equal(candidate.admission.credible, true);
        assert.equal(displayed, false);
      }
      if (candidate.fate === 'weak-cap') {
        assert.equal(candidate.admission.credible, false);
        assert.equal(candidate.admission.clearsWeakScore, true);
        assert.equal(displayed, false);
      }
      if (candidate.fate === 'failed-admission') {
        assert.equal(candidate.display, 'weak-match');
        assert.equal(candidate.admission.credible, false);
      }
      if (candidate.fate === 'retained-after-prefix-cut') {
        assert.equal(candidate.truncationFate.retainedAfterPrefixCut, true);
        assert.equal(displayed, true);
      }
      if (candidate.fate === 'displayed') {
        assert.equal(candidate.display, 'match');
      }
    });
  });
});

test('RED D3: the demo exercises all six fates, so none of them is untested vocabulary', () => {
  const seen = new Set(diagnostics.claimUnits.flatMap((unit) => unit.candidates).map((c) => c.fate));
  [...FATES].forEach((fate) => assert.ok(seen.has(fate), `the demo produces a ${fate} candidate`));
});

test('RED D4: threshold-hidden candidates are not counted as cap-hidden', () => {
  // The release report's worked example: 8 candidates, 3 displayed, and five
  // reported "HIDDEN BY DISPLAY CAPS" — of which every one was actually below
  // the weak threshold at 0.119, 0.116, 0.105 and lower. Nothing was cap-hidden
  // on that row at all.
  const belowThresholdRow = analysis.segments.find((segment) => {
    const traced = diagnostics.claimUnits.find((unit) => unit.segmentId === segment.unit.id);
    if (!traced) return false;
    const notDisplayed = traced.candidates.filter((c) => c.display === 'not-displayed');
    return notDisplayed.length > 0
      && notDisplayed.every((c) => c.score < SCORING_CONFIG.minWeakScore);
  });
  assert.ok(belowThresholdRow, 'the demo has a row whose hidden candidates are all sub-threshold');

  const feedback = flag({
    segmentId: belowThresholdRow.unit.id,
    review: { disposition: belowThresholdRow.mapped ? 'wrong-primary' : 'missing-expected-concept' },
  });
  assert.equal(feedback.candidateTrace.hiddenByDisplayCaps, 0,
    'no candidate on this row was pushed off the ledger by a cap');
  assert.ok(feedback.candidateTrace.hiddenBelowWeakThreshold > 0,
    'they were hidden by the weak threshold, and the trace says so');
});

test('RED D5: the trace summary adds up, on every row', () => {
  analysis.segments.forEach((segment) => {
    const traced = diagnostics.claimUnits.find((unit) => unit.segmentId === segment.unit.id);
    if (!traced) return;
    const feedback = flag({
      segmentId: segment.unit.id,
      review: { disposition: segment.mapped ? 'wrong-primary' : 'missing-expected-concept' },
    });
    const trace = feedback.candidateTrace;
    assert.equal(trace.displayedCount + trace.notDisplayedCount, trace.candidateCount);
    assert.equal(trace.hiddenByDisplayCaps + trace.hiddenBelowWeakThreshold, trace.notDisplayedCount,
      `${segment.unit.id}: every undisplayed candidate is accounted for by exactly one reason`);
  });
});

test('RED D6: retainedOnEvidenceAfterCap counts evidence retention and nothing else', () => {
  analysis.segments.forEach((segment) => {
    const traced = diagnostics.claimUnits.find((unit) => unit.segmentId === segment.unit.id);
    if (!traced) return;
    const feedback = flag({
      segmentId: segment.unit.id,
      review: { disposition: segment.mapped ? 'wrong-primary' : 'missing-expected-concept' },
    });
    const evidenceOnly = traced.candidates.filter((candidate) =>
      candidate.truncationFate.retainedAfterPrefixCut
      && candidate.truncationFate.retainedBecause === 'exact-evidence').length;
    assert.equal(feedback.candidateTrace.retainedOnEvidenceAfterCap, evidenceOnly,
      `${segment.unit.id}: context-eligible retentions are not evidence retentions`);
  });
});
