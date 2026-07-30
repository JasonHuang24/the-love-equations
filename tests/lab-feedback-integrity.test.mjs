import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { analyzeDocument, SCORING_CONFIG } from '../js/lab-analyzer.js';
import { createDemoDocument } from '../js/lab-demo.js';
import { normalizeInput } from '../js/lab-intake.js';
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

/*
 * The point of this test is that no fate is untested vocabulary. It used to rest
 * on the demo happening to produce all six, which made it a hostage to the canon:
 * enriching previously bare entries changed the demo's candidate mix and the
 * `credible-cap` and `retained-after-prefix-cut` fates simply stopped occurring,
 * failing a guard that had found no defect. Both fates need a claim carrying more
 * credible candidates than the display cap, so that condition is now stated
 * outright instead of hoped for, and the demo covers what it covers.
 */
const CAP_OVERFLOW_CLAIM = 'His looks, money, status, charm and exposure all rank high, '
  + 'which makes him a high-value man on the sexual market.';

test('RED D3: every fate is exercised, so none of them is untested vocabulary', async () => {
  const overflow = await analyzeDocument(
    normalizeInput({
      text: CAP_OVERFLOW_CLAIM,
      source: { title: 'cap-overflow probe' },
      createdAt: '1970-01-01T00:00:00.000Z',
    }),
    canonIndex,
    { diagnostics: true },
  );

  const capCandidates = overflow.diagnostics.claimUnits.flatMap((unit) => unit.candidates);
  const credible = capCandidates.filter((candidate) => candidate.admission.credible);
  assert.ok(credible.length > SCORING_CONFIG.maxMatchesPerClaim,
    `the overflow claim must carry more than ${SCORING_CONFIG.maxMatchesPerClaim} credible candidates `
    + `for the cap fates to exist at all, found ${credible.length}`);

  const seen = new Set([
    ...diagnostics.claimUnits.flatMap((unit) => unit.candidates).map((c) => c.fate),
    ...capCandidates.map((c) => c.fate),
  ]);
  [...FATES].forEach((fate) => assert.ok(seen.has(fate), `some fixture produces a ${fate} candidate`));
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

/* ===========================================================================
 * The weak-match surface, pinned to what the analyzer actually produces.
 * ===========================================================================
 * The v2.4.1 documents described weak matches as carrying alignment and a match
 * trace. They never have: stance runs on credible candidates only, so a weak
 * match has no alignment to report, and its reasons are in candidateTrace. A
 * doc that overstates the payload sends an adjudicator looking for a field and
 * then leaves them wondering which of the two artifacts is broken.
 */

test('a weak match exports rank, ID, title, score and confidence — and no more', () => {
  const rowWithWeak = analysis.segments.find((segment) => (segment.weakMatches || []).length);
  assert.ok(rowWithWeak, 'the demo publishes a weak match');
  const feedback = flag({
    segmentId: rowWithWeak.unit.id,
    review: { disposition: rowWithWeak.mapped ? 'wrong-primary' : 'missing-expected-concept' },
  });

  feedback.display.weak.forEach((match, index) => {
    assert.deepEqual(Object.keys(match), ['rank', 'canonId', 'title', 'score', 'confidence']);
    assert.equal(match.rank, index + 1);
    assert.equal(match.canonId, rowWithWeak.weakMatches[index].canonId);
    assert.equal(match.score, rowWithWeak.weakMatches[index].score);
  });

  // What the docs promised is real, and it is in the trace, one lookup away.
  feedback.display.weak.forEach((weak) => {
    const traced = feedback.candidateTrace.candidates.find((c) => c.canonId === weak.canonId);
    assert.ok(traced, `${weak.canonId} is in the trace`);
    assert.equal(traced.display, 'weak-match');
    assert.equal(traced.alignment, null, 'stance never ran on it');
    assert.ok(Array.isArray(traced.penalties) && traced.components);
  });
});

test('a displayed credible match carries the fields a weak one does not', () => {
  const feedback = flag();
  assert.ok(feedback.display.primary.alignment?.label);
  assert.ok(Array.isArray(feedback.display.primary.whyMatched));
  assert.ok('contextHelp' in feedback.display.primary);
});

/* ===========================================================================
 * Per-unit traces. Scoping changes coverage and nothing else.
 * ===========================================================================
 * The flag flow asks for the flagged passage's trace, not the document's. That
 * is only safe if a scoped trace is the same trace: if the analyzer produced
 * even slightly different candidates when asked for one unit, every flag file
 * would describe a run nobody else could reproduce.
 */

test('a scoped trace covers the requested unit only, and says so', async () => {
  const scoped = await analyzeDocument(documentValue, canonIndex, {
    diagnostics: { segmentIds: [mappedSegment.unit.id] },
  });
  assert.equal(scoped.diagnostics.scope, 'claim-units');
  assert.deepEqual(scoped.diagnostics.requestedSegmentIds, [mappedSegment.unit.id]);
  assert.equal(scoped.diagnostics.claimUnits.length, 1);
  assert.equal(scoped.diagnostics.claimUnits[0].segmentId, mappedSegment.unit.id);
  // The count of what was analyzed is still reported, so a reader can tell a
  // one-unit trace of an eleven-passage document from a one-passage document.
  assert.equal(scoped.diagnostics.analyzedClaimUnitCount, analysis.segments.length);
  assert.equal(diagnostics.scope, 'document');
  assert.equal(diagnostics.claimUnits.length, analysis.segments.length);
});

test('a scoped trace is byte-identical to the same unit in the whole-document trace', async () => {
  const scoped = await analyzeDocument(documentValue, canonIndex, {
    diagnostics: { segmentIds: [mappedSegment.unit.id] },
  });
  assert.equal(scoped.diagnostics.analysisId, diagnostics.analysisId);
  assert.equal(scoped.diagnostics.canonSnapshotHash, diagnostics.canonSnapshotHash);
  assert.equal(scoped.diagnostics.inputDigest, diagnostics.inputDigest);
  assert.equal(
    JSON.stringify(scoped.diagnostics.claimUnits[0]),
    JSON.stringify(diagnostics.claimUnits.find((unit) => unit.segmentId === mappedSegment.unit.id)),
  );
});

test('a flag built from a scoped trace is the flag built from the whole one', async () => {
  const scoped = await analyzeDocument(documentValue, canonIndex, {
    diagnostics: { segmentIds: [mappedSegment.unit.id] },
  });
  const fromScoped = flag({ diagnostics: scoped.diagnostics });
  const fromWhole = flag();
  assert.equal(
    JSON.stringify({ ...fromScoped, candidateTrace: { ...fromScoped.candidateTrace, scope: null } }),
    JSON.stringify({ ...fromWhole, candidateTrace: { ...fromWhole.candidateTrace, scope: null } }),
  );
  assert.equal(fromScoped.candidateTrace.scope, 'claim-units');
  assert.equal(fromWhole.candidateTrace.scope, 'document');
});

test('flagging one unit does not build the document trace', async () => {
  // Measured rather than asserted in the abstract: the point of scoping is a
  // number, and a test that only checks the array length would still pass if a
  // future change made each entry enormous.
  const scoped = await analyzeDocument(documentValue, canonIndex, {
    diagnostics: { segmentIds: [mappedSegment.unit.id] },
  });
  const size = (value) => JSON.stringify(value).length;
  assert.ok(size(scoped.diagnostics) < size(diagnostics) / 2,
    'one passage costs a fraction of the document');
  assert.ok(size(scoped.diagnostics) < 64 * 1024,
    'a single passage trace stays in tens of kilobytes, not megabytes');
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

/*
 * Every documented-limit family has a routing destination, and each row names
 * exactly the limits it routes.
 *
 * `morphology` sat in the fixture block from v2.6.1 and appeared in neither the
 * ledger's family table nor the block's own ruling until 2026-07-29. Nothing was
 * checking, so the gap was invisible rather than accepted: a flag adjudicated
 * onto that family had a case to point at and no row to be recorded in, which is
 * the one state §4 of md/FEEDBACK-PIPELINE.md exists to prevent. The first version
 * of this test found a second gap immediately — `qualification`, unregistered
 * since v2.6.0.
 *
 * Sol's verification review then found two holes in the test itself, both fixed
 * here:
 *
 *   1  it searched the WHOLE of FEEDBACK-PIPELINE.md for each family name, and
 *      both new families are also named in the explanatory prose, so the routing
 *      list could have lost one while the test stayed green — while the test's own
 *      failure message claimed it was checking §4. It now parses the routing table
 *      out of that subsection alone.
 *   2  it accepted any row containing some `bl-*` ID, so a row could list the
 *      wrong cases, or a guard. Guards are not destinations for limit hits: they
 *      record behavior that is already correct. Rows are now compared EXACTLY
 *      against the family's `limitDocumented` cases.
 *
 * The tables are prose, so this reads them as prose. Parsing the markdown is the
 * point rather than a shortcut — the documents ARE the routing table for limit
 * families, exactly as tools/lab-feedback.mjs is for dispositions, and a registry
 * duplicated into code here would be a third place to forget.
 */
test('every limit family in the fixture is registered in the routing table', () => {
  const benchmark = JSON.parse(readFileSync(
    path.join(ROOT_DIR, 'tests', 'fixtures', 'match-behavior-benchmark.json'), 'utf8'));
  const ledger = readFileSync(path.join(ROOT_DIR, 'md', 'limit-hit-ledger.md'), 'utf8');
  const pipeline = readFileSync(path.join(ROOT_DIR, 'md', 'FEEDBACK-PIPELINE.md'), 'utf8');

  const cases = benchmark.blocks.documentedLimits.cases;
  const families = [...new Set(cases.map((entry) => entry.family).filter(Boolean))].sort();
  assert.ok(families.length >= 8,
    `Expected the documented-limit family population, found ${families.length}: ${families}`);

  /** The documented limits of one family, in fixture order. Guards are not routed. */
  const limitsOf = (family) => cases
    .filter((entry) => entry.family === family && entry.limitDocumented)
    .map((entry) => entry.id);

  // Rows of the ledger's "Families, and what a hit on each would mean" table:
  // | `family` | cases | what a hit argues for |
  const registered = new Map();
  for (const line of ledger.split(/\r?\n/)) {
    const row = line.match(/^\|\s*`([a-z-]+)`\s*\|([^|]*)\|/u);
    if (row) registered.set(row[1], row[2].trim());
  }

  const unregistered = families.filter((family) => !registered.has(family));
  assert.equal(unregistered.length, 0,
    `${unregistered.length} limit family/families are in the fixture and not in the routing table of `
    + `md/limit-hit-ledger.md: ${unregistered.join(', ')}. A flag adjudicated onto one of these has a `
    + 'frozen case to point at and nowhere to be recorded. Register it, or the fixture is documenting '
    + 'a limit the pipeline cannot route.');

  // The §4 routing list, parsed from that subsection ONLY. Searching the whole
  // file would pass on a name that appears solely in the surrounding prose.
  const SECTION = 'When adjudication lands on a documented limit';
  const sectionStart = pipeline.indexOf(`### ${SECTION}`);
  assert.notEqual(sectionStart, -1, `md/FEEDBACK-PIPELINE.md no longer has a "${SECTION}" subsection.`);
  const rest = pipeline.slice(sectionStart + SECTION.length);
  const sectionEnd = rest.search(/\r?\n(?:## |---\r?\n)/u);
  const section = sectionEnd === -1 ? rest : rest.slice(0, sectionEnd);
  const routed = new Set([...section.matchAll(/^\|\s*`([a-z-]+)`\s*\|/gmu)].map((row) => row[1]));

  families.forEach((family) => {
    // Each row lists this family's documented limits and nothing else — not a
    // guard, not another family's case, not an ID that has been renamed.
    const listed = [...registered.get(family).matchAll(/bl-[\w]+/gu)].map((hit) => hit[0]);
    assert.deepEqual(listed, limitsOf(family),
      `The routing row for \`${family}\` lists [${listed.join(', ')}] and the fixture's documented `
      + `limits for it are [${limitsOf(family).join(', ')}]. Rows route production hits onto frozen `
      + 'failures, so they carry documented limits only — a guard records behavior that is already '
      + 'correct and is not a destination for a limit hit.');

    assert.ok(routed.has(family),
      `The §4 routing list in md/FEEDBACK-PIPELINE.md does not include \`${family}\`. It is parsed `
      + 'from that subsection alone, so being named in the surrounding prose does not count — the '
      + 'routing document and the routing table must agree about which families exist.');
  });

  // And the reverse, on both tables: a row for a family no fixture case carries
  // is a destination for nothing, which is how a registry drifts from the far side.
  const orphans = [...registered.keys()].filter((family) => !families.includes(family));
  assert.equal(orphans.length, 0,
    `The ledger's routing table registers ${orphans.length} family/families no fixture case carries: `
    + `${orphans.join(', ')}.`);
  const routedOrphans = [...routed].filter((family) => !families.includes(family));
  assert.equal(routedOrphans.length, 0,
    `The §4 routing list names ${routedOrphans.length} family/families no fixture case carries: `
    + `${routedOrphans.join(', ')}.`);
});
