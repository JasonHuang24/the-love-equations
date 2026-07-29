import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { analyzeDocument } from '../js/lab-analyzer.js';
import { createDemoDocument } from '../js/lab-demo.js';
import {
  ALIGNMENT_LABELS,
  MAPPING_FEEDBACK_SCHEMA,
  MAPPING_FEEDBACK_SCHEMA_VERSION,
  REVIEW_DISPOSITIONS,
  buildMappingFeedback,
  mappingFeedbackFileName,
  mappingFeedbackToJson,
} from '../js/lab-feedback.js';

/*
 * The exporter's contract, tested against a real analysis of the shipped demo
 * rather than a hand-built stub: a payload that agrees with a fixture but not
 * with the analyzer would be worse than useless to an adjudicator.
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonIndex = JSON.parse(readFileSync(path.join(ROOT_DIR, 'data', 'le-canon-index.json'), 'utf8'));
const documentValue = createDemoDocument({ createdAt: '1970-01-01T00:00:00.000Z' });

const analysis = await analyzeDocument(documentValue, canonIndex, { diagnostics: true });
const { diagnostics } = analysis;
const plainAnalysis = { ...analysis };
delete plainAnalysis.diagnostics;

const mappedSegment = analysis.segments.find((segment) => segment.mapped);
const unmappedSegment = analysis.segments.find((segment) => !segment.mapped && segment.unit.isClaimLike);
const setAside = analysis.domainRelevance.ignoredPassages[0];

function flag(segmentId, overrides = {}) {
  return buildMappingFeedback({
    analysis: plainAnalysis,
    diagnostics,
    segmentId,
    labRelease: '2.4.1',
    generatedAt: '2026-07-29T00:00:00.000Z',
    review: { disposition: 'wrong-primary', ...overrides.review },
    ...overrides.options,
  });
}

test('the demo produces one of each row kind, so every path below is exercised', () => {
  assert.ok(mappedSegment, 'a mapped row');
  assert.ok(unmappedSegment, 'an unmapped claim-like row');
  assert.ok(setAside, 'a passage the relevance gate set aside');
  assert.ok(diagnostics, 'the opt-in trace');
});

test('every disposition is routable, uniquely named, and layer-tagged', () => {
  const layers = new Set(['retrieval-ranking', 'alignment', 'domain-gate', 'segmentation']);
  const ids = new Set();
  REVIEW_DISPOSITIONS.forEach((disposition) => {
    assert.ok(!ids.has(disposition.id), `${disposition.id} is unique`);
    ids.add(disposition.id);
    assert.ok(layers.has(disposition.layer), `${disposition.id} names a known failure layer`);
    assert.ok(disposition.label && disposition.hint, `${disposition.id} is legible in the picker`);
  });
  assert.deepEqual([...ids], [
    'wrong-primary', 'false-positive', 'missing-expected-concept', 'should-remain-unmapped',
    'wrong-stance', 'domain-gate-error', 'segmentation-error',
  ]);
});

test('"verdict" is never used as a field name — it is a Mythbuster term', () => {
  const payload = mappingFeedbackToJson(flag(mappedSegment.unit.id));
  assert.equal(/"verdict"/i.test(payload), false);
  assert.ok(payload.includes('"reviewDisposition"'));
});

test('a mapped flag carries the build, the unit, the display, and the whole pre-cap trace', () => {
  const feedback = flag(mappedSegment.unit.id);

  assert.equal(feedback.schema, MAPPING_FEEDBACK_SCHEMA);
  assert.equal(feedback.schemaVersion, MAPPING_FEEDBACK_SCHEMA_VERSION);
  assert.equal(feedback.row, 'mapped');

  assert.equal(feedback.build.labRelease, '2.4.1');
  assert.equal(feedback.build.analysisSchemaVersion, analysis.schemaVersion);
  assert.equal(feedback.build.analyzer.version, analysis.provenance.analyzer.version);
  assert.equal(feedback.build.analyzer.scoringConfigHash, analysis.provenance.analyzer.scoringConfigHash);
  assert.equal(feedback.build.canonIndex.schemaVersion, analysis.canonIndex.schemaVersion);
  assert.equal(feedback.build.canonIndex.version, analysis.canonIndex.version);
  assert.equal(feedback.build.diagnosticsSchemaVersion, diagnostics.schemaVersion);

  assert.equal(feedback.claimUnit.segmentId, mappedSegment.unit.id);
  assert.equal(feedback.claimUnit.excerpt, mappedSegment.unit.text);
  assert.equal(feedback.claimUnit.parentSegmentId, mappedSegment.unit.parentSegmentId);
  assert.equal(feedback.claimUnit.claimLikelihood, mappedSegment.unit.claimLikelihood);
  assert.equal(feedback.claimUnit.speaker, mappedSegment.unit.speaker);
  assert.equal(feedback.claimUnit.startTime, mappedSegment.unit.startTime);
  assert.deepEqual(feedback.claimUnit.sourceBoundary, mappedSegment.unit.sourceBoundary);

  assert.equal(feedback.domainDecision.reasonCode, mappedSegment.unit.domainRelevance.reasonCode);
  assert.deepEqual(feedback.domainDecision.frames, mappedSegment.unit.domainRelevance.frames);

  assert.equal(feedback.display.primary.canonId, mappedSegment.matches[0].canonId);
  assert.equal(feedback.display.primary.alignment.label, mappedSegment.matches[0].alignment.label);
  assert.equal(feedback.display.secondary.length, mappedSegment.matches.length - 1);

  const traced = diagnostics.claimUnits.find((unit) => unit.segmentId === mappedSegment.unit.id);
  assert.equal(feedback.candidateTrace.available, true);
  assert.equal(feedback.candidateTrace.candidateCount, traced.candidates.length);
  assert.deepEqual(feedback.candidateTrace.candidates, traced.candidates);
});

test('the trace includes the candidates the display caps hid, with their fate named', () => {
  // The whole reason the trace exists: the ledger shows at most four matches and
  // three weak ones, and the interesting candidate is usually neither.
  const withHidden = analysis.segments
    .map((segment) => ({
      segment,
      traced: diagnostics.claimUnits.find((unit) => unit.segmentId === segment.unit.id),
    }))
    .find(({ traced }) => traced?.candidates.some((candidate) => candidate.display === 'not-displayed'));
  assert.ok(withHidden, 'the demo has at least one passage with an undisplayed candidate');

  const feedback = flag(withHidden.segment.unit.id, {
    review: { disposition: withHidden.segment.mapped ? 'wrong-primary' : 'missing-expected-concept' },
  });
  const hidden = feedback.candidateTrace.candidates.filter((candidate) => candidate.display === 'not-displayed');
  assert.ok(hidden.length > 0);
  // "Not displayed" and "hidden by a cap" are different facts, and the summary
  // reports them separately: a candidate that never cleared the weak threshold
  // was never a cap's problem, and telling an adjudicator otherwise sends them
  // to the wrong layer.
  assert.equal(feedback.candidateTrace.notDisplayedCount, hidden.length);
  assert.equal(
    feedback.candidateTrace.hiddenByDisplayCaps + feedback.candidateTrace.hiddenBelowWeakThreshold,
    hidden.length,
  );
  hidden.forEach((candidate) => {
    assert.ok(Number.isFinite(candidate.rank));
    assert.ok(candidate.truncationFate.retainedBecause);
    assert.ok(candidate.fate);
    assert.ok(candidate.components && Array.isArray(candidate.penalties));
    assert.ok(candidate.matchSurfaces && candidate.admission);
  });
});

test('a set-aside passage reports retrieval-not-run rather than an empty trace', () => {
  const feedback = flag(setAside.segmentId, { review: { disposition: 'domain-gate-error' } });
  assert.equal(feedback.row, 'set-aside');
  assert.equal(feedback.domainDecision.status, 'irrelevant');
  assert.equal(feedback.domainDecision.reasonCode, setAside.reasonCode);
  assert.equal(feedback.domainDecision.reasonLabel, setAside.reasonLabel);
  assert.equal(feedback.claimUnit.excerpt, setAside.excerpt);

  // Retrieval genuinely did not run for this row. That absence is real, is
  // stated, and is the one thing this pass did NOT change.
  assert.equal(feedback.candidateTrace.available, false);
  assert.equal(feedback.candidateTrace.reason, 'retrieval-not-run');
});

test('a set-aside passage carries every field the analyzer computed before the gate ruled', () => {
  const feedback = flag(setAside.segmentId, { review: { disposition: 'segmentation-error' } });

  // Claim grammar is decided independently of the domain gate, so a passage can
  // be set aside as off-domain and still be perfectly claim-like. Until 2.5
  // these were exported as null and a reviewer could not tell which verdict
  // they were disputing.
  assert.equal(feedback.claimUnit.claimLikelihood, setAside.claimLikelihood);
  assert.ok(Number.isFinite(feedback.claimUnit.claimLikelihood));
  assert.equal(feedback.claimUnit.isClaimLike, setAside.isClaimLike);
  assert.equal(typeof feedback.claimUnit.isClaimLike, 'boolean');

  // The field a segmentation-error report is actually about.
  assert.ok(feedback.claimUnit.sourceBoundary, 'source offsets are published');
  assert.equal(feedback.claimUnit.sourceBoundary.parentSegmentId, setAside.parentSegmentId);
  assert.ok(Number.isFinite(feedback.claimUnit.sourceBoundary.start));
  assert.ok(Number.isFinite(feedback.claimUnit.sourceBoundary.end));

  // The gate's arithmetic, not just its verdict: "no relational frame" and "a
  // relational frame that scored under the threshold" are different complaints.
  assert.equal(feedback.domainDecision.score, setAside.domainScore);
  assert.ok(Number.isFinite(feedback.domainDecision.score));
  assert.equal(feedback.domainDecision.nonDomainScore, setAside.nonDomainScore);
  assert.ok(feedback.domainDecision.frames, 'per-frame scores are published');
  ['participant', 'outcome', 'mechanism', 'nonDomain'].forEach((frame) => {
    assert.equal(typeof feedback.domainDecision.frames[frame].detected, 'boolean');
    assert.ok(Number.isFinite(feedback.domainDecision.frames[frame].score));
  });

  // Nothing pre-retrieval is withheld any more, and the reason says so.
  assert.deepEqual(feedback.claimUnit.unpublishedFields.fields, []);
  assert.match(feedback.claimUnit.unpublishedFields.reason, /retrieval-not-run/);
});

test('a set-aside passage never has a value invented for it', () => {
  const feedback = flag(setAside.segmentId, { review: { disposition: 'domain-gate-error' } });
  // Every published pre-retrieval field equals the analyzer's own record for
  // the same passage. The exporter reads across; it does not recompute, and a
  // number it produced would be indistinguishable from one the analyzer did.
  assert.equal(feedback.claimUnit.wordCount, setAside.wordCount);
  assert.equal(feedback.claimUnit.boundedContext, setAside.boundedContext || null);
  assert.deepEqual(feedback.domainDecision.frames, setAside.frameScores);
  assert.equal(feedback.domainDecision.decisiveReason, setAside.decisiveReason);
  // An anaphoric bridge resolves only when the analyzer recorded one.
  if (!setAside.boundedContext) assert.equal(feedback.claimUnit.predecessor, null);
});

test('an unmapped row keeps its weak matches and maps to the Research Queue case', () => {
  const feedback = flag(unmappedSegment.unit.id, { review: { disposition: 'missing-expected-concept' } });
  assert.equal(feedback.row, 'unmapped');
  assert.equal(feedback.display.mapped, false);
  assert.equal(feedback.display.primary, null);
  assert.equal(feedback.display.weak.length, unmappedSegment.weakMatches.length);
  assert.equal(feedback.review.failureLayer, 'retrieval-ranking');
});

test('source provenance is withheld unless the reviewer opts in', () => {
  const withheld = flag(mappedSegment.unit.id);
  assert.equal(withheld.privacy.provenanceIncluded, false);
  assert.equal(withheld.source.included, false);
  assert.equal(withheld.source.title, undefined);
  assert.equal(withheld.source.url, undefined);

  const included = flag(mappedSegment.unit.id, { options: { includeProvenance: true } });
  assert.equal(included.privacy.provenanceIncluded, true);
  assert.equal(included.source.included, true);
  assert.equal(included.source.title, analysis.source.title);
});

test('the full transcript is never in the payload', () => {
  const feedback = flag(mappedSegment.unit.id, { options: { includeProvenance: true } });
  const payload = mappingFeedbackToJson(feedback);
  assert.equal(feedback.privacy.fullTranscriptIncluded, false);
  assert.equal(feedback.privacy.transport, 'local-download-only');
  assert.equal(feedback.privacy.uploaded, false);
  assert.equal(feedback.privacy.persisted, false);
  assert.equal(feedback.privacy.mutatesFixtures, false);

  // Every other passage in the source stays out of it. The one exception the
  // schema allows is a bounded-context predecessor, which is part of the
  // analyzer's decision about this very unit — assert it is the only one.
  const permitted = new Set([feedback.claimUnit.excerpt, feedback.claimUnit.predecessor?.excerpt]
    .filter(Boolean));
  documentValue.segments.forEach((segment) => {
    const sentence = String(segment.text).split(/(?<=[.!?])\s+/)[0];
    if (!sentence || sentence.length < 30 || permitted.has(sentence)) return;
    assert.equal(payload.includes(sentence), false,
      `an unrelated passage leaked into the flag: ${sentence}`);
  });
});

test('an unroutable or invented disposition is refused, not silently filed', () => {
  assert.throws(() => flag(mappedSegment.unit.id, { review: { disposition: 'looks-wrong' } }),
    /not a review disposition/);
  assert.throws(() => flag(mappedSegment.unit.id, { review: { disposition: '' } }),
    /not a review disposition/);
  assert.throws(() => flag(mappedSegment.unit.id, { review: { expectedAlignment: 'Vibes' } }),
    /alignment labels/);
  ALIGNMENT_LABELS.forEach((label) => {
    const feedback = flag(mappedSegment.unit.id, { review: { expectedAlignment: label } });
    assert.equal(feedback.review.expectedAlignment, label);
  });
});

test('a flag against an unknown passage is refused', () => {
  assert.throws(() => flag('seg-does-not-exist.claim-01'), /No analyzed passage/);
});

test('a trace from a different run is refused rather than exported as evidence', () => {
  const mismatchedHash = { ...diagnostics, scoringConfigHash: 'not-the-hash' };
  assert.throws(() => buildMappingFeedback({
    analysis: plainAnalysis,
    diagnostics: mismatchedHash,
    segmentId: mappedSegment.unit.id,
    review: { disposition: 'wrong-primary' },
  }), /different scoring configuration/);

  const mismatchedText = {
    ...diagnostics,
    claimUnits: diagnostics.claimUnits.map((unit) => (unit.segmentId === mappedSegment.unit.id
      ? { ...unit, excerpt: 'A sentence this analysis never contained.' }
      : unit)),
  };
  assert.throws(() => buildMappingFeedback({
    analysis: plainAnalysis,
    diagnostics: mismatchedText,
    segmentId: mappedSegment.unit.id,
    review: { disposition: 'wrong-primary' },
  }), /describes different text/);

  const missingUnit = {
    ...diagnostics,
    claimUnits: diagnostics.claimUnits.filter((unit) => unit.segmentId !== mappedSegment.unit.id),
  };
  assert.throws(() => buildMappingFeedback({
    analysis: plainAnalysis,
    diagnostics: missingUnit,
    segmentId: mappedSegment.unit.id,
    review: { disposition: 'wrong-primary' },
  }), /no entry for retained passage/);
});

test('expected and forbidden concept lists are cleaned, deduplicated, and preserved', () => {
  const feedback = flag(mappedSegment.unit.id, {
    review: {
      expectedCanonIds: ['smv:money', ' smv:money ', 'smv:looks', ''],
      forbiddenCanonIds: ['frameworks:smv-matching'],
      note: '  Two   spaces collapse.  ',
    },
  });
  assert.deepEqual(feedback.review.expectedCanonIds, ['smv:money', 'smv:looks']);
  assert.deepEqual(feedback.review.forbiddenCanonIds, ['frameworks:smv-matching']);
  assert.equal(feedback.review.note, 'Two spaces collapse.');
});

test('the flag ID is deterministic and the filename is self-describing', () => {
  const first = flag(mappedSegment.unit.id);
  const second = flag(mappedSegment.unit.id);
  assert.equal(first.flagId, second.flagId);
  const other = flag(mappedSegment.unit.id, { review: { disposition: 'wrong-stance' } });
  assert.notEqual(first.flagId, other.flagId);

  const name = mappingFeedbackFileName(first);
  assert.match(name, /^le-lab-feedback-wrong-primary-[a-z0-9-]+\.json$/);
});

test('the payload is JSON-serializable with no undefined leaks in required blocks', () => {
  const feedback = flag(mappedSegment.unit.id);
  const round = JSON.parse(mappingFeedbackToJson(feedback));
  assert.deepEqual(round.review, feedback.review);
  assert.deepEqual(round.build, feedback.build);
  assert.equal(round.candidateTrace.candidateCount, feedback.candidateTrace.candidateCount);
  ['schema', 'schemaVersion', 'flagId', 'generatedAt', 'privacy', 'review', 'build', 'source',
    'row', 'claimUnit', 'domainDecision', 'display', 'candidateTrace'].forEach((key) => {
    assert.ok(key in round, `${key} survives serialization`);
  });
});

/*
 * The router (tools/lab-feedback.mjs) is tested here rather than in its own file
 * because every case it routes is a payload this module built. The two are one
 * contract: a flag the exporter can write and the router cannot read would be a
 * dead letter.
 */
const { validateFeedback, routeFeedback, findExistingCase } = await import('../tools/lab-feedback.mjs');

test('the router accepts what the exporter writes, on every row kind', () => {
  [
    [mappedSegment.unit.id, 'wrong-primary'],
    [unmappedSegment.unit.id, 'missing-expected-concept'],
    [setAside.segmentId, 'domain-gate-error'],
  ].forEach(([segmentId, disposition]) => {
    const validation = validateFeedback(flag(segmentId, { review: { disposition } }));
    assert.deepEqual(validation.errors, [], `${disposition} validates`);
    assert.equal(validation.valid, true);
  });
});

test('the router rejects a file that is not mapping feedback, listing every reason', () => {
  const validation = validateFeedback({ schema: 'le-lab.analysis', schemaVersion: '2.4' });
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((error) => error.includes('le-lab.mapping-feedback')));
  assert.ok(validation.errors.some((error) => error.includes('flagId')));
  assert.ok(validation.errors.some((error) => error.includes('reviewDisposition')));
});

test('a tampered failure layer is caught rather than routed to the wrong fixture', () => {
  const feedback = flag(mappedSegment.unit.id);
  feedback.review.failureLayer = 'domain-gate';
  const validation = validateFeedback(feedback);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((error) => error.includes('belongs to retrieval-ranking')));
});

test('a flag that smuggled a whole transcript in is refused', () => {
  const feedback = flag(mappedSegment.unit.id);
  feedback.privacy.fullTranscriptIncluded = true;
  const validation = validateFeedback(feedback);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((error) => error.includes('never carry a whole source')));
});

test('every disposition routes to exactly one destination, and the table covers all of them', () => {
  const routed = REVIEW_DISPOSITIONS.map((disposition) => {
    const segmentId = disposition.id === 'domain-gate-error' ? setAside.segmentId : mappedSegment.unit.id;
    const feedback = flag(segmentId, { review: { disposition: disposition.id } });
    return { id: disposition.id, route: routeFeedback(feedback) };
  });
  const destinations = Object.fromEntries(routed.map(({ id, route }) => [id, route.destination]));
  assert.deepEqual(destinations, {
    'wrong-primary': 'tests/fixtures/canon-mapping-benchmark.json',
    'false-positive': 'tests/fixtures/canon-mapping-benchmark.json',
    'missing-expected-concept': 'tests/fixtures/canon-mapping-benchmark.json',
    'should-remain-unmapped': 'tests/fixtures/canon-mapping-benchmark.json',
    'wrong-stance': 'tests/fixtures/canon-mapping-benchmark.json',
    'domain-gate-error': 'tests/fixtures/domain-relevance-benchmark.json',
    'segmentation-error': 'tests/lab-intake.test.mjs (intake fixtures)',
  });
  routed.forEach(({ id, route }) => {
    assert.ok(route.stub, `${id} drafts a stub`);
    assert.ok(route.why, `${id} says why it routes there`);
  });
});

test('the drafted stub asserts what the disposition actually claims, and nothing more', () => {
  const falsePositive = routeFeedback(flag(mappedSegment.unit.id, {
    review: { disposition: 'false-positive', forbiddenCanonIds: [mappedSegment.matches[0].canonId] },
  })).stub;
  assert.deepEqual(falsePositive.expected, { absentCanonIds: [mappedSegment.matches[0].canonId] });
  assert.equal(falsePositive.expected.primaryCanonId, undefined,
    'a false positive says what must not match, not what should have won instead');

  const unmapped = routeFeedback(flag(mappedSegment.unit.id, {
    review: { disposition: 'should-remain-unmapped' },
  })).stub;
  assert.deepEqual(unmapped.expected, { mapped: false });

  const stance = routeFeedback(flag(mappedSegment.unit.id, {
    review: { disposition: 'wrong-stance', expectedAlignment: 'Contradicts' },
  })).stub;
  assert.equal(stance.expected.alignment.label, 'Contradicts');
  assert.equal(stance.expected.alignment.canonId, mappedSegment.matches[0].canonId);

  // Whatever the disposition, the observed half records the shipped behavior.
  assert.equal(falsePositive.observedAtFreeze.primaryCanonId, mappedSegment.matches[0].canonId);
  assert.equal(falsePositive.observedAtFreeze.candidateCount,
    diagnostics.claimUnits.find((unit) => unit.segmentId === mappedSegment.unit.id).candidates.length);
  assert.ok(falsePositive.origin.adjudicatedBy.startsWith('TBD'),
    'the human fields stay unfilled — the tool drafts, it does not adjudicate');
});

test('a passage already frozen in a benchmark is found rather than duplicated', async () => {
  const known = 'The studio patched the game so ranked players get fewer unfair matches.';
  const existing = await findExistingCase(known);
  assert.ok(existing, 'ds-13 is found by its text');
  assert.equal(existing.case.id, 'ds-13');
  assert.equal(existing.benchmark, 'domain-relevance-benchmark');

  // Whitespace and case are not identity.
  const sloppy = await findExistingCase(`  ${known.toUpperCase()}  `);
  assert.equal(sloppy?.case.id, 'ds-13');

  assert.equal(await findExistingCase('A sentence no benchmark has ever seen, about nothing in particular.'), null);
});
