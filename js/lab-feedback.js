/*
 * LE Lab mapping feedback — le-lab.mapping-feedback/1.1
 * ---------------------------------------------------------------------------
 * One reviewer disagreement about one claim unit, serialized so it can be
 * adjudicated away from the browser that produced it.
 *
 * TRANSPORT: local file download, and nothing else. This module builds a plain
 * object; the caller writes it to the visitor's own disk. There is no endpoint,
 * no localStorage key, no fixture mutation, and no automatic promotion. A flag
 * is a draft addressed to a human, and md/FEEDBACK-PIPELINE.md is where that
 * human picks it up.
 *
 * DERIVED, NEVER RE-DERIVED: every number, label, and trace field here is
 * copied from an analyzer output — the published analysis
 * (le-lab.analysis/2.6) and the opt-in diagnostic trace
 * (le-lab.diagnostics/1.1). This module re-implements no scoring, no
 * classification, and no stance rule. If a value is not in one of those two
 * documents, it is reported as unavailable rather than reconstructed, because a
 * feedback file that quietly disagrees with the analyzer is worse than one that
 * admits a gap.
 *
 * "reviewDisposition", not "verdict": a verdict on this site is a Mythbuster
 * ruling about a claim's truth. This is a reviewer's opinion about a mapping.
 *
 * 1.1 ADDS INTEGRITY, AND CHANGES WHAT REFUSAL MEANS. Through 1.0 the exporter
 * checked that the trace named the same sentence and came from the same scoring
 * configuration. Neither is a property of an ANALYSIS: both hold for a trace of
 * a different run on the same build, which meant a file could carry a displayed
 * match above a candidate set that does not contain it and look entirely
 * ordinary doing it. From 1.1 the exporter rebuilds the ledger row out of the
 * trace's own candidates and refuses unless it comes back identical.
 */

// The one thing this module borrows from the analyzer rather than restating:
// what "the same published row" means. A second implementation of that would be
// a second opinion, and the guard below is worthless unless there is only one.
import { claimUnitRowDigest } from './lab-analyzer.js?v=2.6.2';

export const MAPPING_FEEDBACK_SCHEMA = 'le-lab.mapping-feedback';
export const MAPPING_FEEDBACK_SCHEMA_VERSION = '1.1';

/*
 * The failure layer is the routing key: it names WHERE the analyzer went wrong,
 * which decides which frozen fixture the case belongs to. Two dispositions can
 * share a layer; none may belong to two. The routing table these feed is
 * documented once, in md/FEEDBACK-PIPELINE.md, and mirrored by tools/lab-feedback.mjs.
 */
export const REVIEW_DISPOSITIONS = Object.freeze([
  Object.freeze({
    id: 'wrong-primary',
    label: 'Wrong primary match',
    layer: 'retrieval-ranking',
    hint: 'A credible concept was found, but the top one is not the concept this passage is about.',
  }),
  Object.freeze({
    id: 'false-positive',
    label: 'Should not have matched at all',
    layer: 'retrieval-ranking',
    hint: 'Nothing here belongs to the matched concept; the admission gate let it through anyway.',
  }),
  Object.freeze({
    id: 'missing-expected-concept',
    label: 'A concept is missing',
    layer: 'retrieval-ranking',
    hint: 'The passage names a canon concept that never reached the ledger.',
  }),
  Object.freeze({
    id: 'should-remain-unmapped',
    label: 'Should have stayed unmapped',
    layer: 'retrieval-ranking',
    hint: 'No canon concept covers this passage; the Research Queue was the right destination.',
  }),
  Object.freeze({
    id: 'wrong-stance',
    label: 'Wrong alignment',
    layer: 'alignment',
    hint: 'The right concept, but the wrong thing said about who is claiming what.',
  }),
  Object.freeze({
    id: 'domain-gate-error',
    label: 'Relevance gate got it wrong',
    layer: 'domain-gate',
    hint: 'A real relationship claim was set aside, or non-domain text was retained.',
  }),
  Object.freeze({
    id: 'segmentation-error',
    label: 'Passage boundary is wrong',
    layer: 'segmentation',
    hint: 'The claim unit is split, merged, or cut in the wrong place before anything else runs.',
  }),
]);

const DISPOSITIONS_BY_ID = new Map(REVIEW_DISPOSITIONS.map((item) => [item.id, item]));

/** The analyzer's own alignment vocabulary; `expectedAlignment` may only use it. */
export const ALIGNMENT_LABELS = Object.freeze([
  'Supports', 'Resembles', 'Extends', 'Challenges', 'Contradicts', 'Context only',
]);

export const FEEDBACK_PRIVACY_NOTE = 'Written to your own disk by your own browser. LE Lab does not upload this file, does not keep a copy, and changes no fixture. Source provenance is included only when you opt in; the full transcript is never included.';

function text(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function idList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(text).filter(Boolean))];
}

/*
 * Stable and deterministic — the same flag content yields the same ID, and two
 * flags that differ anywhere a reviewer could differ do not. Two fnv1a passes
 * seeded differently, concatenated: one 32-bit hash is a cache key, and a flag
 * ID has to survive a folder of files that are alike in everything except the
 * opinion they carry.
 */
function contentHash(value) {
  const input = String(value);
  let a = 0x811c9dc5;
  let b = 0x9e3779b9;
  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    a = Math.imul(a ^ code, 0x01000193);
    b = Math.imul(b ^ (code + index), 0x85ebca6b);
  }
  return `${(a >>> 0).toString(36)}${(b >>> 0).toString(36)}`;
}

/**
 * The flag ID is a hash of the WHOLE REVIEW, not of the row it is about.
 *
 * Through 1.0 it hashed analysis + unit + disposition, so two reviewers who
 * disagreed about one wrong mapping — or one reviewer revising an opinion —
 * produced one ID and one filename, and the second file quietly replaced the
 * first. Every field a reviewer can set now moves the ID.
 *
 * The concept lists are hashed IN ORDER, deliberately. Order is meaning here:
 * `expectedCanonIds[0]` is what the router drafts as the expected primary, so
 * two reviews listing the same concepts in a different order are two different
 * claims about what should have won, and they get two different files.
 */
function flagIdFor(analysisId, unitId, review, includeProvenance) {
  return `mfb-${contentHash(JSON.stringify({
    analysisId: analysisId || null,
    segmentId: unitId,
    reviewDisposition: review.reviewDisposition,
    expectedCanonIds: review.expectedCanonIds,
    forbiddenCanonIds: review.forbiddenCanonIds,
    expectedAlignment: review.expectedAlignment,
    note: review.note,
    provenanceIncluded: Boolean(includeProvenance),
  }))}`;
}

/**
 * The reviewer's decision, validated. An unknown disposition is a hard error:
 * an unroutable flag is worse than no flag, because it looks filed.
 */
function normalizeReview(review = {}) {
  const disposition = DISPOSITIONS_BY_ID.get(text(review.disposition));
  if (!disposition) {
    throw new Error(`"${text(review.disposition) || '(none)'}" is not a review disposition. Pick one of: ${REVIEW_DISPOSITIONS.map((item) => item.id).join(', ')}.`);
  }
  const expectedAlignment = text(review.expectedAlignment) || null;
  if (expectedAlignment && !ALIGNMENT_LABELS.includes(expectedAlignment)) {
    throw new Error(`"${expectedAlignment}" is not one of the analyzer's alignment labels.`);
  }
  return {
    // Named in full so the key survives being grepped out of context in an
    // inbox folder, and so it can never be read as a Mythbuster verdict.
    reviewDisposition: disposition.id,
    dispositionLabel: disposition.label,
    failureLayer: disposition.layer,
    expectedCanonIds: idList(review.expectedCanonIds),
    forbiddenCanonIds: idList(review.forbiddenCanonIds),
    expectedAlignment,
    note: text(review.note) || null,
  };
}

/** Decision-relevant fields of a displayed match. The full canon record is a lookup away. */
function displayedMatch(match, rank) {
  if (!match) return null;
  return {
    rank,
    canonId: match.canonId,
    title: match.title,
    href: match.href || null,
    category: match.category || null,
    subcategory: match.subcategory || null,
    evidenceType: match.evidenceType || null,
    score: match.score ?? null,
    confidence: match.confidence || null,
    alignment: match.alignment
      ? {
        label: match.alignment.label,
        rationale: match.alignment.rationale || match.why || null,
        evidence: match.alignment.evidence || null,
      }
      : null,
    whyMatched: match.whyMatched || [],
    contextHelp: match.contextHelp || null,
  };
}

function weakMatch(match, rank) {
  if (!match) return null;
  return {
    rank,
    canonId: match.canonId,
    title: match.title,
    score: match.score ?? null,
    confidence: match.confidence || null,
  };
}

/**
 * The passage the bounded-context bridge points back at. Looked up in the
 * published analysis rather than re-split from source text, so the excerpt is
 * exactly the unit the analyzer used. A predecessor the gate set aside is still
 * findable — that combination is precisely what a segmentation complaint looks
 * like.
 */
function predecessorFor(analysis, boundedContext) {
  if (!boundedContext?.sourceUnitId) return null;
  const retained = (analysis.segments || [])
    .find((segment) => segment.unit?.id === boundedContext.sourceUnitId);
  if (retained) {
    return {
      segmentId: retained.unit.id,
      excerpt: retained.unit.text,
      status: retained.unit.domainRelevance?.status || null,
      mapped: Boolean(retained.mapped),
    };
  }
  const setAside = (analysis.domainRelevance?.ignoredPassages || [])
    .find((passage) => passage.segmentId === boundedContext.sourceUnitId);
  if (setAside) {
    return {
      segmentId: setAside.segmentId,
      excerpt: setAside.excerpt,
      status: 'irrelevant',
      mapped: false,
    };
  }
  return { segmentId: boundedContext.sourceUnitId, excerpt: null, status: null, mapped: false };
}

/** Locates the flagged row across the two populations a ledger can show. */
function locateRow(analysis, segmentId) {
  const segment = (analysis.segments || []).find((row) => row.unit?.id === segmentId);
  if (segment) {
    return { kind: segment.mapped ? 'mapped' : 'unmapped', segment, passage: null };
  }
  const passage = (analysis.domainRelevance?.ignoredPassages || [])
    .find((row) => row.segmentId === segmentId);
  if (passage) return { kind: 'set-aside', segment: null, passage };
  throw new Error(`No analyzed passage or set-aside passage carries the ID ${segmentId}.`);
}

function claimUnitFromSegment(segment, analysis) {
  const unit = segment.unit;
  return {
    segmentId: unit.id,
    parentSegmentId: unit.parentSegmentId,
    excerpt: unit.text,
    wordCount: unit.wordCount,
    claimLikelihood: unit.claimLikelihood ?? null,
    isClaimLike: unit.isClaimLike ?? null,
    speaker: unit.speaker ?? null,
    startTime: unit.startTime ?? null,
    endTime: unit.endTime ?? null,
    sourceBoundary: unit.sourceBoundary || null,
    boundedContext: unit.boundedContext || null,
    predecessor: predecessorFor(analysis, unit.boundedContext),
  };
}

/*
 * A set-aside passage never entered retrieval, and this module still invents
 * nothing: a number produced here would be indistinguishable from one the
 * analyzer produced, and only one of those is evidence.
 *
 * What changed at le-lab.analysis/2.5 is which fields the analyzer publishes.
 * Claim likelihood, the claim-grammar verdict, the source offsets and the
 * anaphoric bridge were always computed before the gate ruled, and are now
 * carried on the ignored-passage record — so they are read across rather than
 * reported as unpublished. `predecessor` follows from boundedContext and is
 * therefore resolvable too.
 *
 * Nothing about retrieval is recoverable and none is claimed. The candidate
 * trace stays unavailable with reason `retrieval-not-run`, which is a statement
 * about the world and not about this adapter.
 */
function claimUnitFromPassage(passage, analysis) {
  const boundedContext = passage.boundedContext || null;
  return {
    segmentId: passage.segmentId,
    parentSegmentId: passage.parentSegmentId ?? null,
    excerpt: passage.excerpt,
    wordCount: passage.wordCount,
    claimLikelihood: passage.claimLikelihood ?? null,
    isClaimLike: passage.isClaimLike ?? null,
    speaker: passage.location?.speaker ?? null,
    startTime: passage.location?.startTime ?? null,
    endTime: passage.location?.endTime ?? null,
    sourceBoundary: passage.sourceBoundary || null,
    boundedContext,
    predecessor: boundedContext ? predecessorFor(analysis, boundedContext) : null,
    unpublishedFields: {
      fields: [],
      reason: 'The analyzer publishes every pre-retrieval field for set-aside passages from le-lab.analysis/2.5 onward. Retrieval-stage evidence remains unavailable and is reported separately as retrieval-not-run.',
    },
  };
}

function domainDecisionFromSegment(segment) {
  const relevance = segment.unit.domainRelevance || {};
  /*
   * machineClaimLike lives on the UNIT, not on its domain decision.
   * applyDomainOverride writes it there — beside isClaimLike, which it
   * overwrites — so that "the classifier said no and a visitor said yes" stays
   * legible. Reading it from domainRelevance, as 1.0 did, returned null on
   * every row, silently, and on exactly the rows where an adjudicator needs it:
   * a flag on an overridden passage is either a complaint about the gate or a
   * complaint about the override, and this field is what tells them apart.
   */
  const machineClaimLike = segment.unit.machineClaimLike ?? null;
  return {
    status: relevance.status ?? null,
    localStatus: relevance.localStatus ?? null,
    reasonCode: relevance.reasonCode ?? null,
    reasonLabel: null,
    decisiveReason: relevance.decisiveReason ?? null,
    score: relevance.score ?? null,
    nonDomainScore: relevance.nonDomainScore ?? null,
    frames: relevance.frames || null,
    frameEvidence: relevance.evidence || null,
    contextHelp: relevance.contextHelp || null,
    override: relevance.override ?? null,
    machineClaimLike,
  };
}

/*
 * The gate decision for a set-aside passage, at the same depth as a retained
 * one. `score`, `nonDomainScore` and `frames` used to be flat nulls, which made
 * "no relational frame was detected" and "a relational frame scored 2.5 against
 * a threshold of 4" the same export — two different complaints, one of which is
 * about the gate's vocabulary and one about its threshold.
 */
function domainDecisionFromPassage(passage) {
  return {
    status: 'irrelevant',
    localStatus: passage.localStatus ?? null,
    reasonCode: passage.reasonCode ?? null,
    reasonLabel: passage.reasonLabel ?? null,
    decisiveReason: passage.decisiveReason ?? passage.reasonCode ?? null,
    score: passage.domainScore ?? null,
    nonDomainScore: passage.nonDomainScore ?? null,
    frames: passage.frameScores || null,
    frameEvidence: passage.frameEvidence || null,
    contextHelp: null,
    override: passage.overridden ? 'exclude' : null,
    machineClaimLike: passage.machineClaimLike ?? null,
  };
}

/**
 * The pre-display candidate trace, lifted whole out of le-lab.diagnostics/1.1.
 *
 * Candidates are copied verbatim: score components, named penalties, evidence
 * surfaces with their provenance types, admission outcome, context assistance,
 * rank, rank at retrieval, and truncation fate — including the hits the display
 * caps hid, which are usually the reason a mapping looks wrong from the ledger.
 */
/**
 * Does this trace actually describe the row being flagged?
 *
 * The ledger row is recoverable from the trace: the candidates marked `match`
 * ARE the displayed matches, in order; the ones marked `weak-match` are the
 * weak list. So the check is a reconstruction rather than a comparison of
 * metadata — rebuild the row out of the trace's own candidates and require it
 * to come back identical to the row the analysis published.
 *
 * That is the difference between 1.0 and 1.1. Excerpt, scoring hash, analyzer
 * version, schema version and canon version are all properties of the BUILD;
 * every one of them holds for a trace of a different document analyzed by the
 * same engine. A trace whose candidates were emptied out satisfied all of them
 * and exported a file claiming a primary match at 0.76 above a candidate set of
 * zero. Rebuilding the row is the only check that could not.
 *
 * Every refusal names what disagreed. An adjudicator who gets one of these is
 * being told which of two artifacts to distrust.
 */
function assertTraceReproducesRow(traced, segment, segmentId) {
  const refuse = (reason) => {
    throw new Error(`The diagnostic trace does not reproduce the flagged row ${segmentId}: ${reason} Re-run the analysis before flagging.`);
  };
  const candidates = traced.candidates || [];
  const rebuiltMatches = candidates.filter((candidate) => candidate.display === 'match');
  const rebuiltWeak = candidates.filter((candidate) => candidate.display === 'weak-match');
  const matches = segment.matches || [];
  const weak = segment.weakMatches || [];

  if (Boolean(traced.mapped) !== Boolean(segment.mapped)) {
    refuse(`the trace says the row is ${traced.mapped ? 'mapped' : 'unmapped'} and the analysis says it is ${segment.mapped ? 'mapped' : 'unmapped'}.`);
  }
  if (rebuiltMatches.length !== matches.length) {
    refuse(`the trace carries ${rebuiltMatches.length} displayed match(es) and the analysis shows ${matches.length}.`);
  }
  if (rebuiltWeak.length !== weak.length) {
    refuse(`the trace carries ${rebuiltWeak.length} weak match(es) and the analysis shows ${weak.length}.`);
  }

  matches.forEach((match, index) => {
    const traceMatch = rebuiltMatches[index];
    if (traceMatch.canonId !== match.canonId) {
      refuse(`displayed match ${index + 1} is ${traceMatch.canonId} in the trace and ${match.canonId} in the analysis.`);
    }
    if (traceMatch.score !== match.score) {
      refuse(`${match.canonId} scores ${traceMatch.score} in the trace and ${match.score} in the analysis.`);
    }
    if ((traceMatch.alignment?.label ?? null) !== (match.alignment?.label ?? null)) {
      refuse(`${match.canonId} carries the alignment "${traceMatch.alignment?.label ?? 'none'}" in the trace and "${match.alignment?.label ?? 'none'}" in the analysis.`);
    }
    if ((traceMatch.confidence ?? null) !== (match.confidence ?? null)) {
      refuse(`${match.canonId} is ${traceMatch.confidence} confidence in the trace and ${match.confidence} in the analysis.`);
    }
  });

  weak.forEach((match, index) => {
    const traceMatch = rebuiltWeak[index];
    if (traceMatch.canonId !== match.canonId) {
      refuse(`weak match ${index + 1} is ${traceMatch.canonId} in the trace and ${match.canonId} in the analysis.`);
    }
    if (traceMatch.score !== match.score) {
      refuse(`${match.canonId} scores ${traceMatch.score} in the trace and ${match.score} in the analysis.`);
    }
  });

  // Belt to the reconstruction's braces, and the one check that covers a row
  // whose displayed surface is identical but which was produced for a different
  // unit entirely.
  if (traced.unitDigest && traced.unitDigest !== claimUnitRowDigest(segment)) {
    refuse('its per-unit digest was produced for a different row.');
  }
}

function candidateTrace(diagnostics, segmentId, expectedExcerpt, rowKind, segment, analysis) {
  // Not a gap in the trace — the analyzer's actual behavior, and the analysis
  // says so itself by listing the passage under domainRelevance.ignoredPassages.
  // A set-aside passage is decided before any canon entry is scored, so there is
  // no candidate set in existence to report.
  if (rowKind === 'set-aside') {
    return {
      available: false,
      reason: 'retrieval-not-run',
      explanation: 'The relevance gate set this passage aside before retrieval, so no canon entry was ever scored against it. The domain decision above is the whole of the analyzer\'s reasoning here.',
      candidates: [],
    };
  }
  if (!diagnostics) {
    return {
      available: false,
      reason: 'no-diagnostics-supplied',
      explanation: 'The opt-in analyzer trace was not collected for this analysis.',
      candidates: [],
    };
  }
  // A trace with no identity is a pre-1.1 trace, and the whole reason 1.1 exists
  // is that the checks available without one do not distinguish this analysis
  // from any other on the same build.
  if (!diagnostics.analysisId) {
    throw new Error('The diagnostic trace carries no analysis identity, so it cannot be shown to describe this analysis. Re-run the analysis before flagging.');
  }
  if (analysis.id && diagnostics.analysisId !== analysis.id) {
    throw new Error(`The diagnostic trace was produced by a different analysis (${diagnostics.analysisId}, not ${analysis.id}). Re-run the analysis before flagging.`);
  }
  const traced = (diagnostics.claimUnits || []).find((unit) => unit.segmentId === segmentId);
  if (!traced) {
    // Every retained unit has a trace entry. Missing means the trace and the
    // analysis came from different runs, and a flag built on that would be fiction.
    throw new Error(`The diagnostic trace has no entry for retained passage ${segmentId}. Re-run the analysis before flagging.`);
  }
  // A trace that describes different text than the row is not a trace of this
  // row. Refusing beats exporting a mismatch a reviewer would have to catch.
  if (text(traced.excerpt) !== text(expectedExcerpt)) {
    throw new Error(`The diagnostic trace for ${segmentId} describes different text than the flagged row. Re-run the analysis before flagging.`);
  }
  assertTraceReproducesRow(traced, segment, segmentId);

  const candidates = traced.candidates || [];
  const notDisplayed = candidates.filter((candidate) => candidate.display === 'not-displayed');
  /*
   * Each count is taken from the thing it names.
   *
   * `hiddenByDisplayCaps` used to be "every candidate that is not displayed",
   * which is a different question with a different answer: on the worked example
   * in the v2.4.1 report all five "hidden by display caps" candidates were
   * sub-threshold hits at 0.119 and below, and nothing on that row was capped at
   * all. An adjudicator reading that number went looking at a cap when the
   * answer was a score.
   *
   * The counts come from each candidate's fate and its retention flag rather
   * than from the fate enum alone: a candidate can be both cap-hidden and
   * union-retained, the enum names only the first of those, and a total taken
   * from it would quietly undershoot.
   */
  return {
    available: true,
    schemaVersion: diagnostics.schemaVersion,
    scoringConfigHash: diagnostics.scoringConfigHash,
    analysisId: diagnostics.analysisId,
    canonSnapshotHash: diagnostics.canonSnapshotHash || null,
    inputDigest: diagnostics.inputDigest || null,
    unitDigest: traced.unitDigest || null,
    // Whether this trace covered the document or only the flagged passages. A
    // reader who finds one unit here should be able to tell "that is all there
    // was" from "that is all that was asked for".
    scope: diagnostics.scope || null,
    candidateCount: candidates.length,
    displayedCount: candidates.length - notDisplayed.length,
    notDisplayedCount: notDisplayed.length,
    hiddenByDisplayCaps: notDisplayed
      .filter((candidate) => candidate.fate === 'credible-cap' || candidate.fate === 'weak-cap').length,
    hiddenBelowWeakThreshold: notDisplayed
      .filter((candidate) => candidate.fate === 'below-weak-threshold').length,
    retainedAfterPrefixCut: candidates
      .filter((candidate) => candidate.truncationFate?.retainedAfterPrefixCut).length,
    retainedOnEvidenceAfterCap: candidates
      .filter((candidate) => candidate.truncationFate?.retainedAfterPrefixCut
        && candidate.truncationFate?.retainedBecause === 'exact-evidence').length,
    candidates,
  };
}

function buildSource(analysis, includeProvenance) {
  if (!includeProvenance) {
    return {
      included: false,
      reason: 'The reviewer did not opt in to source provenance. Title, URL, and extraction route are withheld; the flagged excerpt is not, because it is the subject of the flag.',
    };
  }
  const source = analysis.source || {};
  return {
    included: true,
    title: source.title || null,
    type: source.type || null,
    url: source.url || null,
    extractionMethod: source.extractionMethod || null,
  };
}

/**
 * Builds one `le-lab.mapping-feedback/1.1` document.
 *
 * @param {object}  input.analysis          A le-lab.analysis/2.6 result.
 * @param {object} [input.diagnostics]      Its le-lab.diagnostics/1.1 trace.
 * @param {string}  input.segmentId         The flagged row's stable unit ID.
 * @param {object}  input.review            { disposition, expectedCanonIds, forbiddenCanonIds, expectedAlignment, note }
 * @param {boolean}[input.includeProvenance] Opt-in source identity. Default false.
 * @param {string}  input.labRelease        The Lab release token that rendered the row.
 * @param {string} [input.generatedAt]      ISO timestamp; defaults to now.
 */
export function buildMappingFeedback({
  analysis,
  diagnostics = null,
  segmentId,
  review,
  includeProvenance = false,
  labRelease = null,
  generatedAt = null,
} = {}) {
  if (!analysis) throw new Error('There is no analysis to flag against.');
  const unitId = text(segmentId);
  if (!unitId) throw new Error('A flag must name the passage it is about.');
  const reviewed = normalizeReview(review);
  const located = locateRow(analysis, unitId);

  const scoringConfigHash = analysis.provenance?.analyzer?.scoringConfigHash || null;
  if (diagnostics && scoringConfigHash && diagnostics.scoringConfigHash
    && diagnostics.scoringConfigHash !== scoringConfigHash) {
    throw new Error('The diagnostic trace was produced by a different scoring configuration than the analysis. Re-run the analysis before flagging.');
  }

  const claimUnit = located.segment
    ? claimUnitFromSegment(located.segment, analysis)
    : claimUnitFromPassage(located.passage, analysis);
  const domainDecision = located.segment
    ? domainDecisionFromSegment(located.segment)
    : domainDecisionFromPassage(located.passage);

  const matches = located.segment?.matches || [];
  const weak = located.segment?.weakMatches || [];
  const stamp = generatedAt || new Date().toISOString();

  return {
    schema: MAPPING_FEEDBACK_SCHEMA,
    schemaVersion: MAPPING_FEEDBACK_SCHEMA_VERSION,
    flagId: flagIdFor(analysis.id, unitId, reviewed, includeProvenance),
    generatedAt: stamp,
    status: 'Reviewer feedback — a draft for human adjudication, not a fixture and not LE doctrine.',
    privacy: {
      transport: 'local-download-only',
      uploaded: false,
      persisted: false,
      mutatesFixtures: false,
      provenanceIncluded: Boolean(includeProvenance),
      fullTranscriptIncluded: false,
      note: FEEDBACK_PRIVACY_NOTE,
    },
    review: reviewed,
    build: {
      labRelease,
      analysisId: analysis.id || null,
      analysisGeneratedAt: analysis.generatedAt || null,
      analysisSchemaVersion: analysis.schemaVersion || null,
      analyzer: {
        version: analysis.provenance?.analyzer?.version || null,
        mode: analysis.provenance?.analyzer?.mode || analysis.analysisMode?.id || null,
        scoringConfigHash,
        researchQueueSchemaVersion: analysis.provenance?.analyzer?.researchQueueSchemaVersion || null,
      },
      canonIndex: {
        schemaVersion: analysis.canonIndex?.schemaVersion
          || analysis.provenance?.canonIndex?.schemaVersion || null,
        version: analysis.canonIndex?.version
          || analysis.provenance?.canonIndex?.indexVersion || null,
        generatedAt: analysis.canonIndex?.generatedAt
          || analysis.provenance?.canonIndex?.generatedAt || null,
        conceptCount: analysis.canonIndex?.conceptCount ?? null,
      },
      diagnosticsSchemaVersion: diagnostics?.schemaVersion || null,
    },
    source: buildSource(analysis, includeProvenance),
    row: located.kind,
    claimUnit,
    domainDecision,
    display: {
      mapped: located.kind === 'mapped',
      primary: displayedMatch(matches[0], 1),
      secondary: matches.slice(1).map((match, index) => displayedMatch(match, index + 2)),
      weak: weak.map((match, index) => weakMatch(match, index + 1)),
      ambiguity: located.segment?.ambiguity || null,
    },
    candidateTrace: candidateTrace(
      diagnostics, unitId, claimUnit.excerpt, located.kind, located.segment, analysis,
    ),
  };
}

/**
 * `le-lab-feedback-<disposition>-<segment>-<id>.json` — sortable, and
 * self-describing in a folder.
 *
 * The ID is in the name because the name is the second place a collision
 * happens. Two reviews of one row used to land on one filename as well as one
 * ID, so the browser's own download folder was the first thing to lose a flag.
 */
export function mappingFeedbackFileName(feedback) {
  const slug = (value, limit) => text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, limit);
  const segment = slug(feedback?.claimUnit?.segmentId, 40) || 'passage';
  const disposition = slug(feedback?.review?.reviewDisposition, 30) || 'flag';
  const id = slug(String(feedback?.flagId || '').replace(/^mfb-/, ''), 16);
  return `le-lab-feedback-${disposition}-${segment}${id ? `-${id}` : ''}.json`;
}

export function mappingFeedbackToJson(feedback, { pretty = true } = {}) {
  if (!feedback) throw new Error('There is no feedback to serialize.');
  return JSON.stringify(feedback, null, pretty ? 2 : 0);
}
