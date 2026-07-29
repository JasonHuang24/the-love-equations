/*
 * LE Lab mapping feedback — le-lab.mapping-feedback/1.0
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
 * (le-lab.analysis/2.4) and the opt-in diagnostic trace
 * (le-lab.diagnostics/1.0). This module re-implements no scoring, no
 * classification, and no stance rule. If a value is not in one of those two
 * documents, it is reported as unavailable rather than reconstructed, because a
 * feedback file that quietly disagrees with the analyzer is worse than one that
 * admits a gap.
 *
 * "reviewDisposition", not "verdict": a verdict on this site is a Mythbuster
 * ruling about a claim's truth. This is a reviewer's opinion about a mapping.
 */

export const MAPPING_FEEDBACK_SCHEMA = 'le-lab.mapping-feedback';
export const MAPPING_FEEDBACK_SCHEMA_VERSION = '1.0';

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

/* Small, stable, and deterministic — the same flag content yields the same ID. */
function fnv1a(value) {
  let hash = 0x811c9dc5;
  const input = String(value);
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(36);
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
 * A set-aside passage never entered retrieval, so several unit fields the
 * analysis publishes for retained passages are simply not published for it.
 * They are reported as null with a stated reason rather than recomputed here —
 * a number this module invented would be indistinguishable from one the
 * analyzer produced, and only one of those is evidence.
 */
function claimUnitFromPassage(passage) {
  return {
    segmentId: passage.segmentId,
    parentSegmentId: passage.parentSegmentId ?? null,
    excerpt: passage.excerpt,
    wordCount: passage.wordCount,
    claimLikelihood: null,
    isClaimLike: null,
    speaker: passage.location?.speaker ?? null,
    startTime: passage.location?.startTime ?? null,
    endTime: passage.location?.endTime ?? null,
    sourceBoundary: null,
    boundedContext: null,
    predecessor: null,
    unpublishedFields: {
      fields: ['claimLikelihood', 'isClaimLike', 'sourceBoundary', 'boundedContext', 'predecessor'],
      reason: 'The analysis publishes these for retained passages only; a set-aside passage is represented by its gate decision (le-lab.analysis/2.4 domainRelevance.ignoredPassages).',
    },
  };
}

function domainDecisionFromSegment(segment) {
  const relevance = segment.unit.domainRelevance || {};
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
    machineClaimLike: relevance.machineClaimLike ?? null,
  };
}

function domainDecisionFromPassage(passage) {
  return {
    status: 'irrelevant',
    localStatus: passage.localStatus ?? null,
    reasonCode: passage.reasonCode ?? null,
    reasonLabel: passage.reasonLabel ?? null,
    decisiveReason: passage.reasonCode ?? null,
    score: null,
    nonDomainScore: null,
    frames: null,
    frameEvidence: passage.frameEvidence || null,
    contextHelp: null,
    override: passage.overridden ? 'exclude' : null,
    machineClaimLike: null,
  };
}

/**
 * The pre-display candidate trace, lifted whole out of le-lab.diagnostics/1.0.
 *
 * Candidates are copied verbatim: score components, named penalties, evidence
 * surfaces with their provenance types, admission outcome, context assistance,
 * rank, rank at retrieval, and truncation fate — including the hits the display
 * caps hid, which are usually the reason a mapping looks wrong from the ledger.
 */
function candidateTrace(diagnostics, segmentId, expectedExcerpt, rowKind) {
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
  const candidates = traced.candidates || [];
  return {
    available: true,
    schemaVersion: diagnostics.schemaVersion,
    scoringConfigHash: diagnostics.scoringConfigHash,
    candidateCount: candidates.length,
    displayedCount: candidates.filter((candidate) => candidate.display !== 'not-displayed').length,
    hiddenByDisplayCaps: candidates.filter((candidate) => candidate.display === 'not-displayed').length,
    retainedOnEvidenceAfterCap: candidates
      .filter((candidate) => candidate.truncationFate?.survivedTruncationOnEvidence).length,
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
 * Builds one `le-lab.mapping-feedback/1.0` document.
 *
 * @param {object}  input.analysis          A le-lab.analysis/2.4 result.
 * @param {object} [input.diagnostics]      Its le-lab.diagnostics/1.0 trace.
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
    : claimUnitFromPassage(located.passage);
  const domainDecision = located.segment
    ? domainDecisionFromSegment(located.segment)
    : domainDecisionFromPassage(located.passage);

  const matches = located.segment?.matches || [];
  const weak = located.segment?.weakMatches || [];
  const stamp = generatedAt || new Date().toISOString();

  return {
    schema: MAPPING_FEEDBACK_SCHEMA,
    schemaVersion: MAPPING_FEEDBACK_SCHEMA_VERSION,
    flagId: `mfb-${fnv1a(`${analysis.id}|${unitId}|${reviewed.reviewDisposition}`)}`,
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
    candidateTrace: candidateTrace(diagnostics, unitId, claimUnit.excerpt, located.kind),
  };
}

/** `le-lab-feedback-<disposition>-<segment>.json` — sortable, and self-describing in a folder. */
export function mappingFeedbackFileName(feedback) {
  const slug = (value, limit) => text(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, limit);
  const segment = slug(feedback?.claimUnit?.segmentId, 40) || 'passage';
  const disposition = slug(feedback?.review?.reviewDisposition, 30) || 'flag';
  return `le-lab-feedback-${disposition}-${segment}.json`;
}

export function mappingFeedbackToJson(feedback, { pretty = true } = {}) {
  if (!feedback) throw new Error('There is no feedback to serialize.');
  return JSON.stringify(feedback, null, pretty ? 2 : 0);
}
