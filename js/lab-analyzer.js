/*
 * LE Lab deterministic analyzer
 * --------------------------------
 * A dependency-free, inspectable lexical analyzer for normalized LE Lab
 * documents. It deliberately does not pretend to be an LLM or a truth engine.
 *
 * Contract:
 *   NormalizedDocument (le-lab.normalized-document/1.0)
 *     -> analyzeDocument(document, canonIndex, { domainOverrides })
 *     -> AnalysisResult (le-lab.analysis/2.6)
 *
 * The browser runs this module in a worker when available. Node fixture tests
 * import the same functions; there is no second test-only implementation.
 *
 * The domain-relevance gate is heuristic triage, not ground truth. Analysis
 * v2.1 therefore lists every ignored passage with its decision evidence and
 * accepts per-passage user overrides (include/exclude) as locked inputs, so a
 * misclassification is a visible, reversible suggestion rather than silent
 * data loss.
 */

// Bumped to 2.4 at v2.4.0, again because the analyzer DECIDES differently, in
// three separate ways: retrieval keeps every exact hit instead of ranking it
// away, stance reads which canon surface an overlap came from (so asserting an
// indexed misreading no longer reads as resembling the concept), and curated
// aliases can be typed. Matches carry a new alignment.evidence trace and the
// analysis may carry an opt-in diagnostics block. v2.2.0 was provenance-only
// and deliberately did not move this number; 2.3 and 2.4 both did.
export const ANALYSIS_SCHEMA_VERSION = 'le-lab.analysis/2.6';
// Bumped to 2.1 because the queue object itself now carries a provenance
// block, so a queue lifted out of an analysis is self-describing on its own.
// Held at 2.1 through v2.3.0: the gate change alters how many items reach the
// queue, but not the shape of a queue item. Moved to 2.2 at v2.6.10, which
// does change the item shape: `scoredConceptTotal` and `nearbyBandTotal` say
// what the three nearest concepts are three OF.
export const RESEARCH_QUEUE_SCHEMA_VERSION = 'le-lab.research-queue/2.2';
// Release token for the shipped Lab bundle. Kept in step with the ?v= tokens
// on every Lab module so an export names the build that produced it.
export const ANALYZER_VERSION = '2.6.20';
export const ANALYSIS_MODE = Object.freeze({
  id: 'local-lexical-v2',
  label: 'On-device deterministic lexical analysis',
  semanticModel: false,
  sourceUploaded: false,
});

/*
 * Thresholds in SCORING_CONFIG were authored by judgment, not fitted to a
 * labelled corpus. Every export says so in-band rather than relying on a
 * reader to remember it.
 */
export const COVERAGE_PROVISIONAL = Object.freeze({
  provisional: true,
  reason: 'thresholds uncalibrated',
});

/**
 * Every scoring, gating, and truncation constant the analyzer applies, in one
 * frozen object so a calibration pass moves numbers here and nowhere else.
 *
 * These values are carried over from v2.1.2 UNCHANGED. This object is an
 * externalization, not a retune: the thresholds have never been calibrated
 * against a labelled corpus, which is why every export carries
 * coverage.provisional. SCORING_CONFIG_HASH fingerprints the value set so any
 * export can be traced back to the exact scoring behavior that produced it.
 */
export const SCORING_CONFIG = Object.freeze({
  // Document and passage limits.
  maxAnalysisCharacters: 500_000,
  maxClaimUnits: 2_500,
  maxContextContinuationWords: 18,
  maxContextSourceWords: 60,

  // Claim detection (claimLikelihood, isClaimLike).
  minClaimWords: 4,
  claimLongWordCount: 9,
  claimBaseScoreLong: 0.32,
  claimBaseScoreShort: 0.16,
  claimCueBonus: 0.14,
  claimQuestionWordCount: 8,
  claimQuestionBonus: 0.08,
  claimVerboseWordCount: 80,
  claimVerbosePenalty: 0.06,
  claimLikeThreshold: 0.30,

  // Domain relevance gate.
  domainRelevantScore: 4,
  domainUncertainScore: 1,
  // Carried over from v2.1.2 and still surfaced through analyzerInternals, but
  // no decision in this file reads it.
  //
  // The calibration pass it was flagged for ran on 2026-07-30 and confirmed the
  // finding: two occurrences in the whole repository, this declaration and the
  // analyzerInternals re-export, and no reader anywhere including the tests.
  // KEPT anyway, and now for a stated reason rather than by deferral. Deleting
  // it changes SCORING_CONFIG_HASH, which every export carries as provenance —
  // so a removal that changes no behaviour would make every prior export's
  // config stamp disagree with the current one, and the re-export is a
  // compatibility surface for callers written against v2.1.2. A dead constant
  // that costs nothing is cheaper than a provenance discontinuity that buys
  // nothing.
  nonDomainDecisiveScore: 4,
  // The no-participant threshold for the social-mechanism frame. Its live
  // relationship to the cultural frame's weight is asserted in
  // tests/lab-analyzer.test.mjs — see md/lab-constants-audit.md.
  plausibleSocialStructureScore: 3,

  // Tokenization. Both NEW at v2.6.0; the first surfaces a number that was
  // already hard-coded, the second is the fix.
  //
  // The stripper only runs on tokens at least this long — carried over
  // unchanged from the literal it replaces.
  minStemmableLength: 5,
  // The shortest result the stripper may LEAVE BEHIND. Until v2.6.0 there was
  // no floor at all: `tokenize` filtered `length > 1` before stemming and never
  // re-checked, so `really` reached the index as `re`, `national` as `n`, and
  // `fable` as `f` at IDF 6.013 — nineteen raw canon words collapsing to
  // sixteen fragments across 108 of 450 entries. Three rather than four,
  // because four destroys `dat`, `fix`, `sex` and `pay`, which work. A token
  // the stripper would shorten past this keeps its original surface form
  // instead of being dropped, because `stable`, `viable` and `visible` are
  // concepts and a dropped token cannot match anything.
  minDerivedStemLength: 3,

  // Lexical retrieval.
  minPhraseLength: 4,
  minSingleAliasLength: 5,
  phraseBase: 0.54,
  phraseLengthBonus: 0.035,
  phraseLengthBonusCap: 0.18,
  phraseLengthBonusBaseWords: 2,
  singleAliasStrength: 0.30,
  distinctiveBoostPerToken: 0.045,
  distinctiveBoostCap: 0.16,
  titleBoostCap: 0.12,
  queryCoverageWeight: 0.56,
  canonCoverageWeight: 0.24,

  // Score penalties.
  weakGenericDistinctiveMax: 2,
  weakGenericPenalty: 0.38,
  sparseSharedMin: 2,
  sparseSharePenalty: 0.52,
  shortUnitWordCount: 6,
  shortUnitPenalty: 0.72,

  // Candidate admission.
  candidateScoreFloor: 0.08,
  maxCandidatesPerUnit: 8,
  minCredibleScore: 0.43,
  minWeakScore: 0.25,
  minAdmissionDistinctiveShared: 2,
  minLocalSharedTokens: 2,
  // NEW at v2.4.0. How many distinctive concepts a contextual alias needs
  // beside itself before the text around it counts as relational evidence. One,
  // because a relational role term is the other way to satisfy the same
  // condition and this is the narrower of the two.
  minContextualAliasCoFire: 1,
  // NEW at v2.5.0. How far from a contextual-alias OCCURRENCE the analyzer will
  // look for the evidence that promotes it: tokens, each side, and then clipped
  // to that occurrence's own clause. Eight is set by the two cases it has to
  // separate. It must reach `men` at eight tokens in ta-04, and it must not
  // reach `girlfriend` at eleven in cf-01 — a word that is in the sentence but
  // is about something else in it.
  contextualAliasWindowTokens: 8,
  // NEW at v2.5.0. How many tokens before an occurrence the technical-modifier
  // denylist scans. Three rather than one so an intervening adjective or the
  // second half of a compound cannot hide the modifier: in "cloud-based
  // provider" the disqualifying token is two positions back, not one.
  contextualAliasModifierLookback: 3,
  // NEW at v2.6.0. How far past a contextual-alias occurrence the denylist
  // scans, once the token immediately after it is a complementizer. Four covers
  // "for cloud hosting" and "of payroll services" — a determiner, an adjective
  // and a head noun — and stops well before the verb, so the complement is what
  // is being read and not the rest of the clause.
  contextualAliasComplementLookahead: 4,
  // NEW at v2.5.0, SECONDARY from v2.6.0. The shortest stem that may stand as
  // the "independent canon concept" promoting a contextual alias. Four,
  // matching minPhraseLength, which is this file's existing answer to how short
  // a lexical unit can be and still count as evidence.
  //
  // It was introduced as the local answer to a stemmer that produced "re" from
  // "really" and was found vouching for a provisioning claim about a billing
  // vendor. minDerivedStemLength now stops that fragment ever being produced,
  // so this guard no longer has that job. It is KEPT because it answers a
  // different question from a different direction: the tokenizer floor asks how
  // short a token may be, and this asks how short a token may be and still
  // carry a concept — a three-character stem is a legitimate token and still
  // thin evidence for promoting a borrowed word. Defense in depth, and cheap.
  minCoFireConceptLength: 4,
  maxMatchesPerClaim: 4,
  maxWeakMatches: 3,

  // Bounded-context help.
  contextBoostSameConcept: 0.045,
  contextBoostDependency: 0.035,
  contextBoostRelated: 0.025,

  // NEW at v2.5.0. How many of the entry's misreading tokens a quoted span must
  // contain before it counts as carrying the assertion rather than decorating
  // part of one. Two, because one shared word is a coincidence and the span
  // still has to carry a finite verb on top of this.
  minQuotedAssertionTokens: 2,
  // NEW at v2.5.0. Excerpt length in the stance scope trace. The trace exists
  // so a reader can check the label against the clause it came from; it is not
  // a second copy of the passage, which the row already carries.
  stanceScopeExcerptChars: 120,

  // Confidence, stance, and ambiguity.
  confidenceHigh: 0.72,
  confidenceHighWithPhrase: 0.64,
  confidenceMedium: 0.52,
  misreadingContradictionShare: 0.36,
  contradictionScoreFloor: 0.58,
  ambiguityScoreGap: 0.07,

  // Pressure tests.
  weakMapScore: 0.52,
  pressurePriorityScoreFloor: 0.65,
  maxPressureTests: 18,

  // Research-queue routing.
  lexiconDestinationMaxWords: 35,
  deepDiveDestinationMinWords: 45,
  researchQuestionExcerptChars: 110,

  // Output truncation.
  maxStrongestMatches: 20,
  maxStrongestMatchExcerpts: 3,
  maxAdjacentDoctrine: 20,
  maxNearestConcepts: 3,
  maxResearchSearchTerms: 7,
  maxSharedTokensReported: 12,
  maxDistinctiveSharedReported: 8,
  maxPhraseHitsReported: 3,
  maxAliasHitsReported: 3,
  maxWhyMatchedTokens: 5,
  maxIgnoredFrameEvidence: 6,
  maxContinuitySharedConcepts: 5,

  // Numeric precision.
  scorePrecision: 3,
  domainScorePrecision: 2,
  ambiguityGapPrecision: 2,
  percentPrecision: 1,
});

/**
 * Short, stable fingerprint of the value set above. Sorted-key JSON so source
 * ordering cannot move the hash; fnv1a because the analyzer already ships it
 * and must stay dependency-free.
 */
export function scoringConfigHash(config = SCORING_CONFIG) {
  const sorted = Object.keys(config).sort()
    .reduce((accumulator, key) => Object.assign(accumulator, { [key]: config[key] }), {});
  return fnv1a(JSON.stringify(sorted));
}

export const SCORING_CONFIG_HASH = scoringConfigHash();

const ANAPHORIC_CONTINUATION_CUE = /^(?:it\b|(?:that|this|these|those|which)\b(?=\s+(?:is|are|was|were|can|could|may|might|will|would|makes?|means?|puts?|leaves?|leads?|reduces?|increases?|changes?|shapes?|affects?|limits?|narrows?|becomes?|suggests?|shows?|also\b))|(?:that|this)\s+(?:distinction|effect|pattern|tradeoff|constraint|change|dynamic|result|mechanism)\b|such(?:\s+(?:a|an))?\b|the same\b)/i;

const STOP_WORDS = new Set([
  'a', 'about', 'after', 'again', 'against', 'all', 'also', 'am', 'an', 'and',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'between',
  'both', 'but', 'by', 'can', 'could', 'did', 'do', 'does', 'doing', 'down',
  'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have',
  'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his',
  'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me',
  'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on',
  'once', 'only', 'or', 'other', 'our', 'ours', 'out', 'over', 'own',
  // NEW at v2.6.0, and it belongs here on its own merits: an intensifier, in
  // the company of `just`, `only`, `too` and `very`, which were already on this
  // list. It is also the word the v2.6.0 fallback would otherwise restore — the
  // fragment `re` was found in v2.5.0 §1.4 vouching for a provisioning claim
  // about a billing vendor, and falling back from `re` to `really` would put a
  // full-length non-concept where a two-character one used to be.
  'really',
  'same',
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were',
  'what', 'when', 'where', 'which', 'while', 'who', 'why', 'will', 'with',
  'would', 'you', 'your', 'yours',
]);

const GENERIC_TERMS = new Set([
  'attraction', 'dating', 'relationship', 'relationships', 'people', 'person',
  'men', 'women', 'male', 'female', 'love', 'partner', 'partners', 'market',
  'value', 'behavior', 'choice', 'choices', 'social', 'life', 'good', 'bad',
  'better', 'want', 'wants', 'like', 'likes',
]);

const LOW_INFORMATION_MATCH_TERMS = new Set([
  ...GENERIC_TERMS,
  'available', 'availability', 'build', 'choose', 'common', 'context', 'factor',
  'factors', 'hard', 'harder', 'important', 'keep', 'option', 'options',
  'increase', 'increases', 'long', 'matter', 'matters', 'outcome', 'outcomes',
  'reduce', 'reduces', 'rule', 'same', 'selection', 'stable', 'still', 'sustain',
  'tell', 'time', 'times', 'whether', 'different', 'effect', 'effects', 'general',
  'make', 'makes', 'more',
].flatMap((term) => tokenize(term)));

/*
 * The canon's own packaging vocabulary, muted on the ENTRY SIDE ONLY.
 *
 * This canon is written as site copy, so its prose says `card`, `essay`, `hub`,
 * `the claim that`. Those words describe how the site is BUILT, and an entry
 * offering them as a match surface lets a reader's passage match on the
 * furniture instead of the argument. Frozen for a week as a measured defect:
 * "The card says nothing about whether men who date older women stay longer"
 * reached an entry about making peace with being alone, at 0.434.
 *
 * ASYMMETRIC, and that is the whole idea. These are removed from the entry's
 * token sets and left completely alone in the passage — a reader writing "the
 * claim that women prefer height" keeps every one of their own tokens, and their
 * query length is unchanged. Nothing here can make a passage match LESS because
 * of a word the READER used.
 *
 * Why the earlier attempt failed and this one does not: it demoted the same
 * words into LOW_INFORMATION_MATCH_TERMS, which feeds `admissionDistinctiveShared`
 * and nothing else. That is an ADMISSION lever and it could not move
 * `sharedWeight`, `queryCoverage`, `canonCoverage` or `distinctiveBoost`, so the
 * defect survived every variant that did not also demote `say*` — which cost
 * three displayed mappings on the Pew source, because a survey reporting what
 * respondents SAID is ordinary reported speech. Removing a term from the entry's
 * token set moves all four quantities, and it kills the defect on the nouns
 * alone: measured over all 21 archived sources, 129 displayed matches before and
 * 129 after, none lost and none gained.
 *
 * `say*` is deliberately NOT here. It kills the defect too and costs two
 * displayed matches, and the nouns already do the job for free.
 */
const ENTRY_ARTIFACT_TERMS = new Set([
  'card', 'cards', 'essay', 'essays', 'page', 'pages', 'section', 'sections',
  'entry', 'entries', 'hub', 'hubs', 'dossier', 'dossiers', 'claim', 'claims',
].flatMap((term) => tokenize(term)));

const CLAIM_CUES = [
  /\b(?:is|are|was|were|means?|shows?|proves?|predicts?|causes?|creates?|drives?|leads?)\b/i,
  /\b(?:can|could|may|might|should|must|will|cannot|can't|won't|need to|have to|tend to|more likely|less likely)\b/i,
  /\b(?:always|never|everyone|nobody|all men|all women|most men|most women)\b/i,
  /\b(?:because|therefore|so that|as a result|the reason)\b/i,
  /\b(?:\d+(?:\.\d+)?\s*%|\b(?:study|studies|research|data|survey|sample)\b)\b/i,
  /\b(?:prefer|choose|reject|attract|desire|commit|marry|divorce|retain|leave)\w*\b/i,
  /\b(?:meet|make|put|leave|change|matter|narrow|prolong|reward|encourage|discourage|increase|decrease|reduce|delay|shape|affect|influence|sustain|tolerate)\w*\b/i,
];

/*
 * Domain relevance is deliberately separate from claim grammar and canon
 * retrieval. The gate assembles four inspectable semantic frames:
 * participants, relationship outcomes, human-social mechanisms, and
 * affirmative non-domain senses. Each family contributes at most once, so
 * correlated vocabulary cannot stack into an accidental veto.
 */
const HUMAN_PARTICIPANT_FRAMES = Object.freeze([
  {
    id: 'human-individuals',
    label: 'Human individuals or relationship-seeking population',
    weight: 2,
    /*
     * `males?` and `females?` were added on Jason's ruling of 2026-07-30 (P2 of
     * md/lab-gate-participant-vocabulary.md), the one widening of five whose cost
     * was measured at zero rather than left unmeasured.
     *
     * The reason it holds independently of what it buys: cross-sex-selection in
     * RELATIONAL_OUTCOME_FRAMES below already matches males|females, so until now
     * the analyzer disagreed with itself about whether these words name people,
     * depending on which frame was asking.
     *
     * They are the ONE sense-ambiguous pair here — a male connector and a female
     * coupling are hardware — and that ambiguity is load-bearing enough to be
     * pinned as benchmark cases pv-01 through pv-03. What keeps those out is that
     * no mechanism or outcome frame fires on them, not that the words go
     * unrecognised.
     *
     * The kinship and age-cohort nouns (`boys` … `sisters`) came in with P3a on
     * 2026-07-30, and the line they are on is the finding rather than the words:
     * a participant noun must name PEOPLE, not a category of people. `mothers`
     * and `sons` are people you could point at. `humanity`, `anyone`, `everyone`
     * and `a generation` are abstractions, and every one of them was measured to
     * cost a false positive of the same shape — a generic human word beside
     * `culture` / `institutions` / `rewards` from `cultural-frame-mechanism`.
     * That is the same rule P2 rests on, applied one step further out; it is not
     * the shape of "exclude the one word that breaks the fixture", which this
     * project rejected as variant 2b of the gate options the same week.
     */
    test: (text) => /\b(?:people|persons?|someone|adults?|singles?|couples?|spouses?|husbands?|wives|boyfriends?|girlfriends?|lovers?|men|women|man|woman|males?|females?|boys|girls|guys|sons|daughters|mothers|fathers|brothers|sisters|unattached (?:adults?|residents?)|potential partners?)\b/i.test(text),
  },
  {
    id: 'human-groups',
    label: 'Human household, family, or community group',
    weight: 1.5,
    test: (text) => /\b(?:households?|parents?|famil(?:y|ies)|communities|residents?|roommates?|friends?|friendship networks?|support networks?)\b/i.test(text),
  },
  {
    id: 'human-social-pronouns',
    label: 'Human personal pronoun',
    weight: 0.8,
    test: (text) => /\b(?:he|she|they|we|you|him|her|them)\b/i.test(text),
  },
]);

const RELATIONAL_OUTCOME_FRAMES = Object.freeze([
  {
    id: 'romantic-courtship-lifecycle',
    label: 'Dating, courtship, or explicitly romantic lifecycle',
    weight: 5,
    decisive: true,
    test: (text) => /\b(?:dating|courtship|romance|romantic|flirt\w*|speed[- ]dating|online dating|dating apps?|dating markets?|dating profiles?)\b/i.test(text),
  },
  {
    id: 'dating-stage-structure',
    label: 'Attraction, selection, compatibility, or retention stages',
    weight: 5,
    decisive: true,
    test(text) {
      const stages = [
        /\b(?:attention|exposure)\b/i,
        /\b(?:attraction|desire|chemistry)\b/i,
        /\b(?:selection|reciprocal choice)\b/i,
        /\bcompatibility\b/i,
        /\b(?:retention|relationship stability|lasting relationship)\b/i,
      ];
      return stages.filter((pattern) => pattern.test(text)).length >= 2;
    },
  },
  {
    id: 'dating-market-leverage',
    label: 'SMV or dating-market leverage frame',
    weight: 5,
    decisive: true,
    test(text) {
      const leverCount = ['looks', 'money', 'status', 'charm', 'exposure']
        .filter((lever) => new RegExp(`\\b${lever}\\b`, 'i').test(text)).length;
      return /\b(?:smv|sexual market value|dating market value|market leverage|five levers)\b/i.test(text)
        || leverCount >= 4
        || (/\bmarket value\b/i.test(text) && /\b(?:moral worth|human worth|entitlement|consent)\b/i.test(text));
    },
  },
  {
    id: 'cross-sex-selection',
    label: 'Human cross-sex preference or selection outcome',
    weight: 5,
    decisive: true,
    // `marry|marrie[sd]` and not `marry\w*` alone: "married" and "marries"
    // never contain the literal stem "marry", so past and third-person forms
    // were invisible here (crash-test finding 6B). `marr\w*` would be shorter
    // and wrong — it admits "marred". The standalone marriage frame below
    // keeps the narrow stem on purpose: without a participant noun anchoring
    // the clause, "married" is where the metaphors live ("the merger married
    // two incompatible corporate cultures", the pt-03 include fixture).
    test: (text) => /\b(?:men|women|man|woman|males|females)\b.{0,70}\b(?:prefer|want|choose|select|desire|attract|reject|date|marry|marrie[sd])\w*\b.{0,70}\b(?:men|women|man|woman|males|females)\b/i.test(text)
      || /\b(?:men|women|man|woman|males|females)\b.{0,70}\b(?:prefer|want|choose|select|desire|attract|reject|date|marry|marrie[sd])\w*\b/i.test(text),
  },
  {
    id: 'couple-retention',
    label: 'Couple stability or staying-together outcome',
    weight: 5,
    decisive: true,
    test: (text) => /\bcouples?\b.{0,70}\b(?:stay\w* together|last\w*|separat\w*|remain\w* together|relationship)\b/i.test(text)
      || /\b(?:stay\w* together|last\w*|separat\w*|remain\w* together)\b.{0,70}\bcouples?\b/i.test(text),
  },
  {
    id: 'marriage-household-formation',
    label: 'Marriage, cohabitation, or household formation outcome',
    weight: 5,
    decisive: true,
    test: (text) => /\b(?:marriage|marry\w*|remarr\w*|wedding|spouses?|husbands?|wives|widow\w*|cohabit\w*|household formation|combine households?|start(?:ing)? a family|have children together)\b/i.test(text),
  },
  {
    id: 'breakup-relationship-loss',
    label: 'Breakup or human relationship-loss outcome',
    weight: 5,
    decisive: true,
    test: (text) => /\b(?:breakups?|breaks? up|heartbreak|relationship loss|relationship dissolution|after separation|reconciliation|infidelity|cheating)\b/i.test(text),
  },
  {
    id: 'partner-access-formation',
    label: 'Partner access, meeting, selection, or pair formation',
    weight: 5,
    decisive: true,
    test: (text) => /\b(?:meet|met|find|found|choose|chose|select|seek|attract|reject|date)\w*\b.{0,65}\b(?:partners?|mates?|dates?|singles?|spouses?)\b/i.test(text)
      || /\b(?:partners?|mates?|dates?|singles?|spouses?)\b.{0,65}\b(?:meet|met|choose|chose|select|seek|attract|reject|date|pair|match)\w*\b/i.test(text)
      || /\b(?:mate|partner) selection\b|\bpair formation\b|\b(?:future|potential|romantic) partners?\b|\bromantic networks?\b/i.test(text)
      || /\b(?:meet|met|meeting)\b.{0,40}\bsome(?:one|body)\b/i.test(text)
      || /\b(?:first|second|third|blind|next|another)\s+dates?\b|\bdate nights?\b/i.test(text)
      // The gate trusted the gerund `dating` and nothing else, so the plain noun
      // "dates" (romantic outings, or the people one goes on them with) and the
      // verb `date`/`dated` were invisible: "how people date and connect",
      // "going on more dates", "would not date someone", "her dates" were all
      // binned no-human-relational-frame. Same defect SHAPE as the `marry\w*`
      // morphology bug of v2.6.14 — one inflection named, the rest missed
      // (pt08 cycles 1 and 3, two independent captures, with a natural minimal
      // pair: "12% said they were going on more dates" binned while "men were
      // twice as likely to say they were going on more dates" passed on `men`).
      //
      // These are POSITIVE shapes, not `dates?` with calendar senses excluded.
      // A bare `dates?` frame would admit "the release date of the report",
      // "dated 1997", "up to date", "the dates of the conference sessions" —
      // and ignorePrecision has a hard 0.95 floor. Each shape below requires a
      // courtship-specific structure a calendar sense does not take.
      || /\b(?:go|goes|going|went|gone)\s+on\s+(?:\w+\s+){0,3}dates?\b/i.test(text)
      || /\bdate\s+(?:someone|somebody|anyone|anybody|people|him|her|them|men|women|a\s+(?:man|woman|guy|girl))\b/i.test(text)
      || /\b(?:people|men|women|singles|adults|teens|users|respondents|participants|couples|guys|girls)\s+(?:date|dates|dated)\b/i.test(text)
      || /\b(?:his|her|their|my|your|our)\s+dates\b/i.test(text)
      || /\bdated\s+(?:\w+\s+){0,2}(?:men|women|guys|girls|people)\b/i.test(text)
      // Survey register, straight from the pt08 capture: "Seventy-four per cent
      // dated while using the medication". No calendar sense takes this shape.
      || /\b(?:per\s?cent|percent|%)\s+dated\b/i.test(text),
  },
  {
    id: 'relationship-maintenance',
    label: 'Human relationship initiation, maintenance, or retention',
    weight: 4,
    decisive: true,
    test: (text) => /\b(?:relationship (?:initiation|formation|progression|maintenance|satisfaction|stability|quality|readiness|retention)|long-term relationship|committed relationship)\b/i.test(text)
      || /\b(?:initiat\w*|maintain\w*|sustain\w*|retain\w*|build\w*|end\w*)\b.{0,55}\b(?:a |the |their |our )?(?:romantic )?(?:relationships?|partnership)\b/i.test(text),
  },
  {
    id: 'sexual-intimacy',
    label: 'Sexual or intimate relationship outcome',
    weight: 5,
    decisive: true,
    test: (text) => /\b(?:hookups?|hooking up|one-night stands?|casual sex|sex life|sexual (?:attraction|desire|relationships?|partners?|intimacy|compatibility|behavior)|physical intimacy|have sex|having sex|consent to sex)\b/i.test(text),
  },
  {
    id: 'relationship-transition',
    label: 'Potentially human separation, divorce, or exclusivity transition',
    weight: 2.5,
    decisive: false,
    test: (text) => /\b(?:divorce\w*|separat\w*|exclusive|exclusivity|commit(?:ment|ted)?)\b/i.test(text),
  },
  {
    id: 'relationship-concept',
    label: 'Plausible attraction, compatibility, or relationship concept',
    weight: 2.2,
    decisive: false,
    test: (text) => /\b(?:attraction|attractive|desirability|compatib\w*|intimacy|affection|attachment|chemistry|jealousy|rejection|desire|love|relationships?|partners?|mates?|argu(?:e|es|ed|ing|ments?))\b/i.test(text),
  },
  {
    id: 'human-attraction-shorthand',
    label: 'Human-directed attraction shorthand',
    weight: 2,
    decisive: false,
    test: (text) => /\b(?:he|she|they|this (?:man|woman|person)|that (?:man|woman|person)|someone)\b.{0,24}\b(?:is|seems?|looks?)\s+(?:so |very )?(?:hot|beautiful|handsome|sexy)\b/i.test(text)
      || /\b(?:hot|beautiful|handsome|sexy)\b.{0,24}\b(?:to|for)\s+(?:him|her|them|someone|people)\b/i.test(text),
  },
  /*
   * Dating-commentary / seduction register (append #2, 2026-07-29).
   *
   * The canon alias pass added vocabulary the gate then refused to let reach
   * the matcher: "He spent two years learning game and it changed how women
   * responded to him" was rejected `no-human-relational-frame`, which is the
   * exact sentence the `game` alias was added to catch. The blocker was never
   * the alias; it was that this register names relationship dynamics through
   * craft, idiom, and screening vocabulary rather than through the outcome
   * nouns the outcome frames were built from.
   *
   * All four are deliberately NON-DECISIVE. A decisive frame would bypass the
   * affirmative non-domain veto, and every term here is polysemous — game,
   * league, filtered out, provider all have loud non-relationship senses. Left
   * non-decisive they retain through `plausibleRelationalAnchor`, which still
   * defers to sports/computing/corporate evidence. That is why this append
   * moves no SCORING_CONFIG value.
   */
  {
    id: 'seduction-craft-register',
    label: 'Courtship craft, pickup, or approach-skill register',
    weight: 2.5,
    decisive: false,
    test(text) {
      // Vocabulary that has no non-relationship sense: it fires alone.
      const unambiguous = /\b(?:pick-?up artists?|pua\b|pick-?up (?:game|community|industry|scene|artistry)|day ?game\b|night ?game\b|cold approach\w*|approach anxiety|social calibration|inner game|outer game|negging|peacocking|(?:running|runs?|ran|spitting|spits?|learning|learn(?:ed|s)?|studying|studied|tighten(?:ed|ing|s)?) (?:his |her |their |my |your |up )*game\b)/i;
      // "game"/"rizz" alone mean nothing; paired with a relational object they do.
      const ambiguousMarker = /\b(?:games?|rizz|charisma)\b/i;
      const relationalObject = /\b(?:women|woman|men|man|girls?|guys?|dating|dates?|attract\w*|seduc\w*|flirt\w*|romantic|relationships?|mixed signals|instead of saying|what (?:she|he) (?:actually |really )?wants|hard to get|leading (?:him|her) on)\b/i;
      return unambiguous.test(text) || frameHas(text, ambiguousMarker, relationalObject);
    },
  },
  {
    /*
     * `dated`, `married` and `marries` at v2.6.21: the third copy of
     * the inflection defect v2.6.14 fixed in cross-sex-selection and 959d32c
     * fixed in partner-access-formation. Neither of those touched this idiom
     * list, which kept its own half-conjugated verbs — and no archived corpus
     * source contains `dated up`, `married up` or `marries up`, which is why
     * two rounds of fixing this shape left this copy standing.
     *
     * The forms are named rather than stemmed, on v2.6.14's precedent:
     * `marr\w*` is shorter and wrong, because it admits "marred". The
     * directional particle and this frame's relational-object co-requirement
     * both still hold, so no calendar `dated` can reach it.
     */
    id: 'mate-value-mismatch',
    label: 'Mate-value mismatch idiom (league, weight class, settling)',
    weight: 2.5,
    decisive: false,
    test: (text) => frameHas(
      text,
      /\b(?:out of (?:his|her|their|my|your) league|in (?:his|her|their|my) league|punch(?:ing|es|ed)? (?:above|below) (?:his|her|their|my|your) weight|settl(?:e|es|ed|ing) for\b|dat(?:e|es|ed|ing) (?:across|up|down)\b|marr(?:y|ies|ied|ying) (?:up|down)\b)/i,
      /\b(?:women|woman|men|man|girls?|guys?|dating|dates?|marri\w*|attract\w*|boyfriends?|girlfriends?|partners?|hotter|taller|shorter|richer)\b/i,
    ),
  },
  {
    id: 'partner-screening-filter',
    label: 'Screening or filtering criteria applied to candidate partners',
    weight: 2.5,
    decisive: false,
    test(text) {
      const population = /\b(?:men|women|man|woman|guys?|girls?|profiles?|matches|daters?|dating|swipe\w*)\b/i;
      const filtering = /\b(?:filter\w*|screen\w*|weed\w*|sort\w*|rule\w*)\s+(?:out|through)\b/i;
      const criterion = /\b(?:height (?:filter|requirement|cutoff|minimum)|under (?:six|6) feet|over (?:six|6) feet|six feet tall|minimum height|deal ?breakers?)\b/i;
      // Both branches require the criterion or the filtering act to land near a
      // partner population, so recruiting and spam filtering stay out.
      return (filtering.test(text) || criterion.test(text)) && population.test(text);
    },
  },
  {
    id: 'provisioning-role',
    label: 'Provider or breadwinner role expectation',
    weight: 2.5,
    decisive: false,
    test(text) {
      // "provider" is overwhelmingly a vendor word outside this register.
      if (/\b(?:insurance|health(?:care)?|medical|cloud|internet|broadband|hosting|utilit(?:y|ies)|energy|service|payment|wireless|cellular|software|api|vendor|subscriptions?|plans?)\b/i.test(text)) return false;
      return frameHas(
        text,
        /\b(?:a provider|male provider|provider role|provider expectations?|breadwinner\w*|provisioning)\b/i,
        /\b(?:household|famil(?:y|ies)|children|kids|wife|wives|husbands?|marriage|marry\w*|stay-at-home|rais(?:e|es|ed|ing)\b)\b/i,
      );
    },
  },
  {
    id: 'named-le-framework',
    label: 'Named LE relationship framework or market lens',
    weight: 5,
    decisive: true,
    test: (text) => /\b(?:conversion ladder|readiness gate|love hierarchy|smv|sexual market value|dating market value|five levers)\b/i.test(text),
  },
]);

const SOCIAL_MECHANISM_FRAMES = Object.freeze([
  {
    id: 'social-contact-opportunity',
    label: 'Chance contact, repeated exposure, or familiarity mechanism',
    weight: 2.5,
    decisive: false,
    test: (text) => /\b(?:chance|spontaneous|recurring|repeated|regular|social)\s+(?:encounters?|contacts?|exposure|familiarity|access|gatherings?|venues?|spaces?)\b/i.test(text)
      || /\bopportunit\w*\b.{0,55}\b(?:meet|encounter|become familiar|repeated contact|repeated exposure)\b/i.test(text)
      || /\b(?:keeps?|kept|continues?[sd]? to) meet(?:ing)?\b/i.test(text),
  },
  {
    id: 'relationship-time-privacy-constraint',
    label: 'Time, privacy, or realistic-pool constraint on relationships',
    weight: 4,
    decisive: true,
    test: (text) => /\b(?:commut\w*|work hours?|schedules?|time|privacy|realistic pool|dating pool)\b.{0,90}\b(?:meet|date|courtship|romance|relationships?|partnership|partners?|singles?|unattached|(?:realistic|dating|partner) pools?)\b/i.test(text)
      || /\b(?:meet|date|courtship|romance|relationships?|partnership|partners?|singles?|unattached)\b.{0,90}\b(?:commut\w*|work hours?|schedules?|time|privacy|realistic pool|dating pool)\b/i.test(text),
  },
  {
    id: 'community-contact-structure',
    label: 'Community turnover, relocation, or gathering structure',
    weight: 3,
    decisive: false,
    test: (text) => /\b(?:relocat\w*|moving frequently|turnover|community|neighborhood|gatherings?|third spaces?|social spaces?)\b.{0,95}\b(?:contacts?|familiarity|exposure|encounters?|opportunities|partners?|romantic networks?)\b/i.test(text)
      || /\b(?:contacts?|familiarity|exposure|encounters?|opportunities|partners?|romantic networks?)\b.{0,95}\b(?:relocat\w*|turnover|community|neighborhood|gatherings?|third spaces?|social spaces?)\b/i.test(text),
  },
  {
    id: 'household-exit-constraint',
    label: 'Household, custody, debt, or privacy constraint',
    weight: 4,
    decisive: true,
    test: (text) => /\b(?:shared (?:debt|custody|obligations?)|financial obligations?|household wealth|roommates?|living with other adults?|shared ownership|pet custody)\b.{0,95}\b(?:leav\w*|separat\w*|breakups?|marry\w*|marriage|household formation|privacy|romance|courtship)\b/i.test(text)
      || /\b(?:leav\w*|separat\w*|breakups?|marry\w*|marriage|household formation|privacy|romance|courtship)\b.{0,95}\b(?:shared (?:debt|custody|obligations?)|financial obligations?|household wealth|roommates?|living with other adults?|shared ownership|pet custody)\b/i.test(text),
  },
  {
    id: 'support-loss-mechanism',
    label: 'Support or friendship network shaping relationship loss',
    weight: 4,
    decisive: true,
    test: (text) => /\b(?:support|friendship) networks?\b.{0,80}\b(?:relationship loss|breakups?|recover\w*|tolerat\w*|heartbreak)\b/i.test(text)
      || /\b(?:relationship loss|breakups?|recover\w*|tolerat\w*|heartbreak)\b.{0,80}\b(?:support|friendship) networks?\b/i.test(text),
  },
  {
    id: 'reputation-partner-access',
    label: 'Reputation changing access to future partners',
    weight: 4,
    decisive: true,
    test: (text) => /\breputation\b.{0,80}\b(?:access|future partners?|potential partners?|dating pool|romantic)\b/i.test(text)
      || /\b(?:access|future partners?|potential partners?|dating pool|romantic)\b.{0,80}\breputation\b/i.test(text),
  },
  {
    /*
     * Adopted option 1 of md/lab-gate-cultural-register.md, on Jason's ruling.
     *
     * The gate was reliable on claims ABOUT relationships and blind to claims
     * about CULTURE SHAPING relationships — the register most of the archived
     * manosphere corpus is written in, and the register the site's own Pills and
     * Frameworks pages argue with. Measured with minimal pairs, six of eight
     * claims flipped from analysed to discarded on a single word: "the operative
     * frame in which men and women DATE" was relevant, and "the operative frame
     * in which the sexes ENCOUNTER EACH OTHER" was irrelevant. The gate was
     * checking for vocabulary it recognised, not judging subject matter.
     *
     * Weight 2.5 and non-decisive, and both of those are load-bearing. The
     * decision path retains on `participant && mechanism` (uncertain), and
     * separately on `mechanism.score >= plausibleSocialStructureScore` (3) with
     * no participant at all. Frame scores are a MAX over matched definitions, so
     * 2.5 can never reach 3 on its own: this frame cannot retain a passage unless
     * a human participant is also present. That is the whole difference between
     * the adopted option and the rejected one — culture-and-shaping with nobody
     * in the sentence stays out, which is what keeps tax law, the bond market and
     * machine-learning training data on the other side of the line.
     *
     * Paired noun/verb rather than a keyword list, for the same reason
     * dating-app-interaction is: a bare `culture` or `norms` token admits any
     * cultural commentary. A cultural FORCE has to be doing something TO someone.
     */
    id: 'cultural-frame-mechanism',
    label: 'Culture, norms, media, or law shaping expectations between the sexes',
    weight: 2.5,
    decisive: false,
    test(text) {
      const force = /\b(?:culture|cultural|culturally|social conventions?|social norms?|norms?|normali[sz]\w*|normalcy|media|entertainment|advertising|sitcoms?|family law|the law|laws|legally|mandated|conditioning|programming|sociali[sz]ation|institutions?|institutional|narratives?|scripts?|discourse|taboos?|stigma|shame|shaming|feminization|feminisation|masculinity|femininity|patriarchal|patriarchy)\b/i;
      const shaping = /\b(?:shape[sd]?|shaping|frame[sd]?|framing|define[sd]?|defining|dictate[sd]?|encode[sd]?|encoding|reward\w*|punish\w*|teach\w*|taught|train\w*|police[sd]?|policing|assume[sd]?|rewrit\w*|rewrote|inherit\w*|manufactur\w*|instill\w*|internali[sz]\w*|ridicul\w*|discourag\w*|encourag\w*|stop\w*|prevent\w*|changed|change[sd]?|baseline|default)\b/i;
      /*
       * The canon's own names for this register. Kept in the same frame rather
       * than promoted to a decisive one, because promoting them is option 2 and
       * Jason ruled option 1: they still need a participant to retain.
       */
      const named = /\b(?:feminine imperative|male imperative|operative frame|operative framework|fem-?centrism|gynocentrism|feminine primacy|feminine reality|unplugging|locus[- ]of[- ]control shift|heteropessimism)\b/i;
      return named.test(text) || (force.test(text) && shaping.test(text));
    },
  },
  {
    // Agreed benchmark append #1 (md/lab-benchmark-append-proposal-01.md):
    // app-interaction mechanics retain only through paired noun/verb evidence,
    // so affirmative computing/advertising frames still veto the trap senses.
    id: 'dating-app-interaction',
    label: 'Dating-app or courtship messaging interaction mechanics',
    weight: 3,
    decisive: false,
    test: (text) => /\b(?:messages?|matches|swipes?|likes|dating profiles?)\b.{0,60}\b(?:receiv\w*|sent|sends?|get|gets|got|getting|lack(?:ed|ing)?|flood\w*|overwhelm\w*|unseen|ignored|respond\w*|repl(?:y|ies|ied))\b/i.test(text)
      || /\b(?:receiv\w*|sent|sends?|get|gets|got|getting|lack(?:ed|ing)?|flood\w*|overwhelm\w*|respond\w*|repl(?:y|ies|ied)|no|few(?:er)?)\b.{0,60}\b(?:messages?|matches|swipes?|likes|replies|dating profiles?)\b/i.test(text)
      || /\b(?:swip(?:e|es|ed|ing)|unmatch\w*|ghost(?:ed|ing)?)\b/i.test(text),
  },
]);

const NON_DOMAIN_FRAME_DEFINITIONS = Object.freeze([
  {
    id: 'computing',
    label: 'Computing, software, data, or process frame',
    weight: 6,
    test: (text) => frameHas(
      text,
      /\b(?:software|comput\w*|algorith\w*|heuristic\w*|classifi\w*|kernel\w*|operating (?:system|core)|api|endpoint\w*|database\w*|server\w*|linux|postgres\w*|process\w*|network connections?|prediction systems?|pathfind\w*|routing\w*|applications?)\b/i,
      /\b(?:query\w*|execut\w*|run\w*|uses?|kill\w*|stop\w*|terminat\w*|reject\w*|refus\w*|declin\w*|invalid\w*|malform\w*|payload\w*|inputs?|routes?|paths?|certain\w*|confidence|assign\w*|select\w*|pick\w*|rank\w*|one-to-many|unreliable|created?|spawn\w*)\b/i,
    ),
  },
  {
    id: 'sports',
    label: 'Sports, game, or contest frame',
    weight: 6,
    test: (text) => frameHas(
      text,
      /\b(?:teams?|sides?|clubs?|match(?:es)?|games?|contests?|fixtures?|bouts?|tournaments?|leagues?|referees?)\b/i,
      /\b(?:finish\w*|end\w*|level|equal|scores?|draw|won|win\w*|lost|lose\w*|contest)\b/i,
    ),
  },
  {
    id: 'corporate-finance-media',
    label: 'Corporate, finance, property, media, or advertising frame',
    weight: 7,
    test: (text) => frameHas(
      text,
      /\b(?:firms?|business(?:es)?|companies|company|corporat\w*|joint ventures?|capital|stocks?|stock markets?|equities|stock indexes?|financial markets?|trading|property|box office|actors?|advertis\w*|engagement rates?)\b/i,
      /\b(?:split\w*|dissolv\w*|merg\w*|ventures?|partnership|divorce\w*|commit\w*|capital|declin\w*|fall\w*|fell|crash\w*|trad\w*|valu\w*|increas\w*|attract\w*|engagement|competitive)\b/i,
    ) || /\b(?:stock|financial )?market\b.{0,40}\bcompetitive\b/i.test(text),
  },
  {
    id: 'document',
    label: 'Document, report, typography, or page-structure frame',
    weight: 6,
    test: (text) => frameHas(
      text,
      /\b(?:reports?|documents?|main text|texts?|pages?|fonts?|typograph\w*|sections?|profiles?|mountains?|report body|document body)\b/i,
      /\b(?:bod(?:y|ies)|divid\w*|contain\w*|lists?|sections?|parts?|dimensions?|visible|layouts?|fonts?)\b/i,
    ),
  },
  {
    id: 'scientific-mathematical',
    label: 'Scientific, chemical, material, or mathematical frame',
    weight: 6,
    test: (text) => frameHas(
      text,
      /\b(?:atoms?|atomic|electrons?|orbitals?|materials?|tensile|chemical\w*|molecules?|bonds?|functions?|equations?|theorems?|models?|laborator\w*|temperature|pressure)\b/i,
      /\b(?:pairs?|share\w*|orbitals?|shells?|strength|stable|continuous|confidence|certain\w*|measure\w*|linear|structures?)\b/i,
    ),
  },
  {
    id: 'physical-environment',
    label: 'Weather, room, sky, water, or physical-state observation',
    weight: 5,
    test: (text) => frameHas(
      text,
      /\b(?:sky|weather|rooms?|water|temperature|afternoon)\b/i,
      /\b(?:blue|hot|cold|visible|freez\w*|boil\w*|degrees?|celsius|fahrenheit)\b/i,
    ),
  },
  {
    id: 'transport-schedule',
    label: 'Transport arrival, departure, or timetable frame',
    weight: 5,
    test: (text) => frameHas(
      text,
      /\b(?:trains?|buses|bus|flights?|trams?|subways?)\b/i,
      /\b(?:arriv\w*|depart\w*|delay\w*|noon|on time|timetables?)\b/i,
    ),
  },
  {
    id: 'technical-relationship',
    label: 'Technical or scientific use of relationship vocabulary',
    weight: 6,
    test: (text) => /\b(?:database|variables?|measurements?|numbers?|sets?|tables?|equations?|quantities|objects?)\b.{0,75}\brelationships?\b/i.test(text)
      || /\brelationships?\b.{0,75}\b(?:database|variables?|measurements?|numbers?|sets?|tables?|equations?|quantities|objects?|one-to-many)\b/i.test(text)
      || /\b(?:business|research|laboratory|training|project|trade|tennis|debate)\s+partners?\b/i.test(text),
  },
]);
/**
 * The canon surfaces a token overlap can come from, in the order a reader
 * would weigh them. Order is part of the contract: it fixes how the trace
 * lists surfaces, so a diff of two analyses compares like with like.
 */
const MATCH_SURFACES = Object.freeze([
  'title', 'alias', 'synopsis', 'boundaryCondition', 'commonMisreading',
]);

export const MATCH_SURFACE_LABELS = Object.freeze({
  title: 'title',
  alias: 'alias or phrase',
  synopsis: 'synopsis',
  boundaryCondition: 'boundary condition',
  commonMisreading: 'common misreading',
});

/*
 * Denial of the matched misreading. The question this answers is narrow: is the
 * source ASSERTING the indexed misreading or DENYING it? It is deliberately
 * broader than CONTRADICTION_CUES, which asks a different question (does this
 * passage contain disagreement language at all) and was previously being used
 * to answer this one — which is how a verbatim restatement of an LE boundary
 * came to be filed as contradicting LE.
 */
const MISREADING_DENIAL_CUES = /\b(?:not|never|no|none|false|untrue|myth|mistaken|wrong|isn't|aren't|wasn't|weren't|doesn't|don't|didn't|cannot|can't|won't|nonsense|rarely|hardly)\b/i;

/*
 * The blanket all-women signature behind the AWALT hand ruling in stanceFor.
 * Named because two call sites must agree on it: the test that enters the
 * ruling, and the phrase whose tokens locate the assertion clause when the
 * ruling is scoped.
 */
const AWALT_BLANKET_CUE = /\b(?:all women|women always|women never|every woman)\b/i;

/*
 * Reported speech: the passage relays someone else's claim rather than making
 * one. A reported misreading must not be charged to the speaker relaying it,
 * and equally must not be credited to them as agreement with LE — the sentence
 * carries no stance of its own to record.
 */
const REPORTED_SPEECH_CUES = new RegExp([
  /\b(?:according to|as \w+ puts it|is said to|so-called)\b/.source,
  /\b(?:some|many|most|a lot of|plenty of|these|those)\s+(?:men|women|people|guys|girls|users|commentators|critics|posters)\b[^.]{0,40}?\b(?:claims?|says?|said|argues?|argued|insists?|insisted|believes?|thinks?|maintains?|reckons?)\b/.source,
  /\b(?:he|she|they|critics|commentators|the podcast|the host|the video|the article|the thread|the book)\s+(?:\w+\s+){0,3}?(?:claims?|claiming|says?|said|argues?|arguing|insists?|insisting|believes?|thinks?|maintains?|wrote|posted|tweeted)\b/.source,
].join('|'), 'i');

/*
 * The same negators as MISREADING_DENIAL_CUES, compiled to be COUNTED rather
 * than tested. That difference is the whole of the sc-01 fix: "it is not false
 * that X" contains two negators and asserts X, and a presence test cannot tell
 * it from "it is false that X". Derived from the one source so the two can
 * never drift into disagreeing about what a negator is.
 */
const NEGATION_PARITY_CUES = new RegExp(MISREADING_DENIAL_CUES.source, 'gi');

/*
 * What a speaker does to a claim AFTER handing it to someone else, or after
 * stating it. Each is matched only in clauses that FOLLOW the assertion,
 * because all three are anaphoric — "that is false" points backwards, and a
 * "wrong" in front of the claim is talking about something else.
 */
const ENDORSEMENT_CUES = /\b(?:exactly right|precisely right|quite right|dead right|spot on|is right|are right|is correct|is true|rightly so)\b/i;
const REJECTION_CUES = /\b(?:is wrong|are wrong|was wrong|were wrong|is false|are false|is untrue|is nonsense|is a myth|is mistaken|is incorrect|not true|not the case|got that wrong|got it wrong|backwards)\b/i;
/*
 * Qualification is the third thing, and the reason Challenges exists. A claim
 * that is explicitly half-withdrawn is neither asserted nor denied, and forcing
 * it through that binary overstates whichever side it lands on. Kept disjoint
 * from REJECTION_CUES on purpose: "overstated" is not "wrong".
 */
const QUALIFICATION_CUES = /\b(?:overstated|overstates|overstating|oversimplif\w*|too simple|too simplistic|an exaggeration|exaggerated|only partly|partly true|up to a point|not the whole story|more complicated than|overblown)\b/i;
/*
 * A quoted span carries an assertion only if it contains a finite verb. That
 * one test separates sc-02, where the whole proposition sits inside the quotes
 * and belongs to the editor, from sc-07, where the quotes decorate a bare noun
 * phrase inside the speaker's own sentence and the speaker still owns the claim.
 */
const QUOTED_ASSERTION_VERBS = /\b(?:is|are|was|were|isn't|aren't|wasn't|weren't|means|equals|proves|creates|makes|shows|becomes|remains)\b/i;

const SUPPORT_CUES = /\b(?:supports?|confirms?|consistent with|backs? up|holds up|evidence for|exactly right|true that)\b/i;
const CHALLENGE_CUES = /\b(?:challenges?|questions?|overstates?|too simple|not always|depends on|exception|fails? when|weakens?)\b/i;
const CONTRADICTION_CUES = /\b(?:contradicts?|false|wrong|myth|backwards|no evidence|does not|doesn't|isn't|aren't|cannot|can't)\b/i;
const EXTENSION_CUES = /\b(?:extends?|adds?|missing|overlooks?|also matters?|new factor|beyond|mechanism|edge case)\b/i;
const EVIDENCE_CUES = /\b(?:study|studies|research|data|survey|sample|experiment|longitudinal|meta-analysis|doi|according to)\b|(?:\d+(?:\.\d+)?\s*%)/i;

const PRESSURE_PATTERNS = [
  {
    id: 'absolute-language',
    title: 'Absolute language outruns a probabilistic rule',
    severity: 3,
    test: (text) => /\b(?:always|never|everyone|nobody|no one|every man|every woman|all men|all women|100\s*%|zero exceptions?)\b/i.test(text),
    risk: 'absolute claim',
    strain: 'Find one credible counterexample inside the claimed population and context.',
    evidence: 'A stated scope, base rate, distribution, and documented exceptions.',
  },
  {
    id: 'correlation-causation',
    title: 'Correlation is being promoted to cause',
    severity: 3,
    test: (text) => /\b(?:causes?|caused|makes? (?:men|women|people|someone|them)|leads? to|results? in|because of|drives?|therefore)\b/i.test(text),
    risk: 'causal claim',
    strain: 'Hold the correlation constant while changing the proposed mechanism or a plausible confounder.',
    evidence: 'Longitudinal, experimental, or credible quasi-experimental evidence that separates the proposed cause from selection and confounding.',
  },
  {
    id: 'population-to-destiny',
    title: 'A population average is being treated as an individual destiny',
    severity: 3,
    test: (text) => /\b(?:average|on average|most|majority|more likely|less likely|rate|percent|%)\b/i.test(text)
      && /\b(?:you will|you are doomed|your fate|guarantees?|means you|destined|no chance)\b/i.test(text),
    risk: 'population-to-individual leap',
    strain: 'Test an individual who sits in the overlapping part of the two distributions.',
    evidence: 'Individual-level predictive accuracy, uncertainty intervals, and false-positive/false-negative rates.',
  },
  {
    id: 'attraction-selection-collapse',
    title: 'Attraction is being collapsed into selection',
    severity: 3,
    test: (text) => /\b(?:attract|attractive|desire|hot|looks?)\w*\b/i.test(text)
      && /\b(?:choose|chosen|date|commit|marry|relationship)\w*\b/i.test(text),
    risk: 'stage collapse',
    strain: 'Use a case with strong initial attraction that never becomes reciprocal selection.',
    evidence: 'Separate measures for attention, desire, reciprocal choice, and the transition between them.',
  },
  {
    id: 'selection-retention-collapse',
    title: 'Selection is being collapsed into compatibility or retention',
    severity: 3,
    test: (text) => /\b(?:date|choose|chosen|match|pair)\w*\b/i.test(text)
      && /\b(?:compatible|compatibility|last|retention|stable|marriage|keep|kept)\w*\b/i.test(text),
    risk: 'stage collapse',
    strain: 'Use a mutually chosen couple whose primary attraction clears but whose long-term fit fails.',
    evidence: 'Outcomes measured after selection: satisfaction, stability, conflict, and dissolution over time.',
  },
  {
    id: 'stated-revealed',
    title: 'Stated preference is being treated as revealed behavior',
    severity: 2,
    test: (text) => /\b(?:say|says|said|claim|report|survey|preference|want)\w*\b/i.test(text)
      && /\b(?:choose|date|pair|marry|actually|behavior|do)\w*\b/i.test(text),
    risk: 'stated/revealed preference confusion',
    strain: 'Compare what the same people report with whom they actually contact, choose, and retain.',
    evidence: 'Linked stated-preference and behavioral outcome data from the same decision context.',
  },
  {
    id: 'sex-binary',
    title: 'An average sex difference is being universalized',
    severity: 3,
    test: (text) => /\b(?:men|women|males|females)\b/i.test(text)
      && /\b(?:all|always|never|are wired|by nature|biologically|every|cannot|can't)\b/i.test(text),
    risk: 'gender generalization',
    strain: 'Examine the overlap between male and female distributions and the contexts where the mean difference shrinks or reverses.',
    evidence: 'Effect sizes, within-group variance, overlapping distributions, population definition, and replication across contexts.',
  },
  {
    id: 'smv-moral-worth',
    title: 'Market leverage is being confused with moral worth',
    severity: 4,
    test: (text) => /\b(?:smv|market value|low value|high value|rating|score|looks level)\b/i.test(text)
      && /\b(?:worthless|better person|inferior|superior|deserves?|human worth|bad person|good person)\b/i.test(text),
    risk: 'moral claim',
    strain: 'Hold dating-market attention constant while varying character, care, courage, or moral conduct.',
    evidence: 'A definition that separates descriptive market leverage from human or moral value.',
  },
  {
    id: 'lens-as-law',
    title: 'A lens is being presented as a law',
    severity: 3,
    test: (text) => /\b(?:law|equation proves|guarantees?|inevitable|unbreakable rule|always works|scientific fact)\b/i.test(text),
    risk: 'lens treated as law',
    strain: 'Move the claim into a different market, population, relationship stage, or incentive structure.',
    evidence: 'Pre-registered predictions and repeated out-of-sample tests across the contexts the claim says it covers.',
  },
  {
    id: 'strategy-entitlement',
    title: 'A strategy is being converted into entitlement',
    severity: 4,
    test: (text) => /\b(?:deserve|owed|owes|entitled|should give me|must date|earn(?:ed)? (?:a|her|him)|guaranteed partner)\b/i.test(text),
    risk: 'entitlement claim',
    strain: 'Ask whether the other person remains free to decline after every recommended strategy is followed.',
    evidence: 'No empirical result can establish entitlement; the claim must preserve reciprocal choice.',
  },
  {
    id: 'consent-safety',
    title: 'Consent or safety boundaries may be overridden',
    severity: 5,
    test: (text) => /\b(?:ignore (?:her|his|their) no|keep pushing|won't take no|resistance means|force|coerce|pressure (?:her|him|them)|doesn't need consent|unsafe)\b/i.test(text),
    risk: 'consent/safety boundary',
    strain: 'Treat a clear refusal, discomfort cue, or safety concern as dispositive and stop the strategy.',
    evidence: 'No dating framework overrides consent or safety; the needed change is to the claim, not more proof.',
  },
  {
    id: 'close-call-certainty',
    title: 'A close prior is being presented as certainty',
    severity: 2,
    test: (text) => /\b(?:probably|likely|odds|chance|signal|hint)\b/i.test(text)
      && /\b(?:definitely|certainly|for sure|must mean|proves)\b/i.test(text),
    risk: 'uncertainty collapse',
    strain: 'Test the same cue where the base rate is low or the behavior has a common non-romantic explanation.',
    evidence: 'Calibrated likelihood ratios, base rates, and out-of-sample discrimination.',
  },
  {
    id: 'scope-extrapolation',
    title: 'A framework is being exported beyond its stated population or context',
    severity: 3,
    test: (text) => /\b(?:applies to everyone|works everywhere|every culture|every population|all markets|all ages|regardless of (?:age|context|culture|population)|universal across|same for everyone)\b/i.test(text),
    risk: 'scope extrapolation',
    strain: 'Move the framework into a different culture, age band, market, relationship stage, or source population.',
    evidence: 'Replicated results with the same construct and outcome across the populations and contexts being claimed.',
  },
];

const DESTINATION_BY_CATEGORY = new Map([
  ['rules & frameworks', 'Rules & Frameworks'],
  ['frameworks', 'Rules & Frameworks'],
  ['statistics', 'Statistics'],
  ['mythbuster', 'Mythbuster'],
  ['deep dives', 'Deep Dive'],
  ['deep dive', 'Deep Dive'],
  ['pill dossiers', 'Pill Dossier'],
  ['pills', 'Pill Dossier'],
  ['gender dynamics', 'Gender Dynamics'],
  ['five levers', 'Five Levers'],
  ['smv levers', 'Five Levers'],
  ['lexicon', 'Lexicon'],
]);

// These small, inspectable signatures cover LE concepts whose meaning is
// distributed across a sentence or subtitle cue rather than repeated as a
// title. They are deterministic retrieval rules, not a semantic-model claim.
// Ten media-source replays exposed 31 false mappings across 22 passages:
// generic topical overlap could clear the credible line without the concept's
// defining semantic anchor. A guard never retrieves an entry, adds score, or
// changes a threshold; it only refuses credible admission for that one concept
// when its named anchor is absent. Exact evidence is intentionally still subject
// to the guard. Broad generic-token suppression was measured and rejected after
// losing eight correct mappings and creating eight new ones.
const CONCEPT_ADMISSION_GUARDS = new Map([
  { canonId: 'statistics:stat-relationship-quality', label: 'relationship-quality predictor or actor/partner evidence', test: (text) => /\b(?:personality|neurotic\w*|conscientious\w*|actor effects?|partner effects?|predictive models?|relationship predictors?|appreciation|perceived partner|conflict|pairfam|big five|longitudinal)\b/.test(text) },
  { canonId: 'lexicon:term-personality-matters', label: 'personality trait or actor/partner evidence', test: (text) => /\b(?:personality|neurotic\w*|conscientious\w*|actor effects?|partner effects?|traits?)\b/.test(text) },
  { canonId: 'statistics:height-pref', label: 'height-preference evidence', test: (text) => /\b(?:height|taller|shorter|centimet\w*|inches?|feet)\b/.test(text) },
  { canonId: 'M-TBD-6', label: 'waiting or sexual-timing evidence', test: (text) => /\b(?:take it slow|takes it slow|wait\w*|sexual timing|make a move|made a move|friend[- ]?zon\w*|decisiv\w*|early sex|later sex\w*)\b/.test(text) },
  { canonId: 'M-TBD-17', label: 'male dating-withdrawal evidence', test: (text) => /\b(?:men|male|guys?|single|dating|sexless\w*|checking out|check out|opt\w* out|monk mode|approach\w*)\b/.test(text) },
  { canonId: 'gender-dynamics:female:timing-honesty-the-mirror:you-might-be-the-one-avoiding-commitment', label: 'female commitment-avoidance evidence', test: (text) => /\b(?:women|woman|commitment|situationship|better option|backup|lock it down|gray zone|grey zone|strung along)\b/.test(text) },
  { canonId: 'M-TBD-61', label: 'sex-typed commitment-motive evidence', test: (text) => /\b(?:men|women|male|female|commitment|single|sociosexual\w*|variety|flirt\w*|family life|uncommitted)\b/.test(text) },
  { canonId: 'statistics:stat-cycling', label: 'breakup-and-reconciliation evidence', test: (text) => /\b(?:break ?up|broke up|reconcil\w*|get back together|got back together|restart\w*|cycl\w*|ended the relationship)\b/.test(text) },
  { canonId: 'lexicon:term-living-apart-together-lat', label: 'deliberately separate households or residences', test: (text) => /\b(?:living apart|live apart|lives apart|separate households?|separate homes?|separate residences?|residentially separate|lat)\b/.test(text) },
  { canonId: 'statistics:stat-single-parent-world', label: 'single-parent household evidence', test: (text) => /\b(?:single[- ]parent|one[- ]parent|lone parent|solo parent|parent households?|children?\b.{0,35}\bone parent|one parent\b.{0,35}\bchildren?)\b/.test(text) },
  { canonId: 'frameworks:stock-flow-error', label: 'stock-versus-flow measurement evidence', test: (text) => /\b(?:stock|flow|snapshot|cohort|period measure|state right now|enter\w*|leave\w* over time|right[- ]censor\w*|length[- ]bias\w*)\b/.test(text) },
  { canonId: 'gender-dynamics:both-sides:the-shared-market:the-problem-isnt-the-standards-its-the-dishonesty-about-them', label: 'standards-versus-honesty evidence', test: (text) => /\b(?:standards?|dishonest\w*|honest\w*|accuracy of description|accurate description)\b/.test(text) },
  { canonId: 'M-TBD-11', label: 'looks-preference evidence', test: (text) => /\b(?:looks?|attractiveness|earning prospects?|visual|speed[- ]dating|both sexes)\b/.test(text) || (/\bmen\b/.test(text) && /\bwomen\b/.test(text)) },
  { canonId: 'M-TBD-28', label: 'safety-versus-excitement choice evidence', test: (text) => /\b(?:safe|safety|danger\w*|chaos|dark triad|nice guy|jerk|women|butterflies|stable\b.{0,20}\bbor\w*)\b/.test(text) },
  { canonId: 'frameworks:satisfaction-flywheel', label: 'bidirectional satisfaction evidence', test: (text) => /\b(?:bidirection\w*|two[- ]way|both directions?|reciprocal|feedback loop|predicts? changes?|relationship satisfaction predicts?|sexual satisfaction predicts?|frequency of sex)\b/.test(text) },
  { canonId: 'statistics:stat-marriage-age', label: 'age-at-marriage evidence', test: (text) => /\b(?:age|median|older|younger|twenties|thirties|years old|postwar|1950s|marry later|first marriage at)\b/.test(text) },
  { canonId: 'statistics:stat-shared-positive-affect', label: 'shared positive emotion or cortisol evidence', test: (text) => /\b(?:positive emotions?|positive affect|shared positivity|happy|happiness|relax\w*|interest\w*|cortisol|saliva|moods?|moments?)\b/.test(text) },
  { canonId: 'statistics:stat-sexual-communication', label: 'sexual-communication evidence', test: (text) => /\b(?:communicat\w*|talk\w*|conversation\w*|disclos\w*|bring it up)\b/.test(text) },
  { canonId: 'statistics:stat-childfree-intent', label: 'childbearing-intention evidence', test: (text) => /\b(?:child\w*|parent\w*|nonparent\w*|fertil\w*|mother\w*|father\w*|birth\w*)\b/.test(text) },
  { canonId: 'statistics:stat-wedding-hazard', label: 'wedding-cost or divorce-hazard evidence', test: (text) => /\b(?:wedding|honeymoon|guests?|spend\w*|spent|divorc\w*.{0,24}\bhazard|hazard.{0,24}\bdivorc\w*|ceremony)\b/.test(text) },
  { canonId: 'M-TBD-19', label: 'charisma or first-impression red-flag evidence', test: (text) => /\b(?:charisma|charm\w*|narciss\w*|red flags?|first impressions?|untrust\w*|exploit\w*|entitled)\b/.test(text) },
].map((guard) => [guard.canonId, guard]));

const CONCEPT_SIGNATURES = [
  {
    canonId: 'frameworks:conversion-ladder',
    label: 'separation of dating stages',
    score: 0.76,
    test(text) {
      const stages = [
        /\b(?:attention|seen|noticed|exposure)\b/,
        /\b(?:attraction|attractive|desire|chemistry)\b/,
        /\b(?:selection|selects?|choose|chosen|date)\b/,
        /\b(?:compatibility|compatible|life fit)\b/,
        /\b(?:retention|retain|keep|last|durability|stable)\b/,
      ];
      const stageCount = stages.filter((pattern) => pattern.test(text)).length;
      return stageCount >= 2
        && /\b(?:different|separate|another|not|only|does not|doesn't|fail|fails)\b/.test(text);
    },
  },
  {
    canonId: 'smv:overview',
    label: 'five-lever combination or SMV boundary',
    score: 0.82,
    test(text) {
      const levers = ['looks', 'money', 'status', 'charm', 'exposure'];
      const leverCount = levers.filter((lever) => new RegExp('\\b' + lever + '\\b').test(text)).length;
      return leverCount >= 4
        || (/\b(?:smv|market value|market leverage|leverage)\b/.test(text)
          && /\b(?:moral worth|human worth|entitlement|consent)\b/.test(text));
    },
  },
  {
    canonId: 'lexicon:term-awalt-all-women-are-like-that',
    label: 'blanket all-women generalization',
    score: 0.79,
    test: (text) => /\b(?:all women|women always|women never|every woman)\b/.test(text),
  },
  {
    canonId: 'frameworks:status-trade',
    label: 'status-selection claim',
    score: 0.67,
    test: (text) => /\b(?:women|woman|hypergamy)\b/.test(text)
      && /\b(?:highest status|higher status|status man|status partner|trade up)\b/.test(text),
  },
  {
    canonId: 'frameworks:readiness-gate',
    label: 'life-fit and readiness boundary',
    score: 0.73,
    test: (text) => /\b(?:life plans?|life goals?|timing|readiness|ready)\b/.test(text)
      && /\b(?:compatibility|compatible|long term|build|relationship)\b/.test(text),
  },
  {
    canonId: 'hierarchy:a-generic-male:gate-3-life-fit:practical-compatibility',
    label: 'practical life-fit language',
    score: 0.66,
    test: (text) => /\b(?:life plans?|life goals?|daily life|lifestyle)\b/.test(text)
      && /\b(?:compatibility|compatible|long term|last|relationship)\b/.test(text),
  },
  {
    canonId: 'smv:multiplier:context',
    label: 'market and context modifiers',
    score: 0.70,
    test(text) {
      const modifiers = [
        /\bage\b/, /\bgoals?\b/, /\bopportunity\b/, /\blocation\b/,
        /\bplatform\b/, /\bmarket\b/, /\bactual people\b/,
      ];
      return /\b(?:context|situation|people in the room|actual people)\b/.test(text)
        && modifiers.filter((pattern) => pattern.test(text)).length >= 2;
    },
  },
  {
    canonId: 'pills:page-rp',
    label: 'strategy bounded by autonomy and consent',
    score: 0.70,
    test: (text) => /\b(?:strategy|leverage|market value|improves?)\b/.test(text)
      && /\b(?:entitlement|consent|owed|moral worth|particular person)\b/.test(text),
  },
];

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * The suffix stripper, with a floor on what it is allowed to leave behind.
 *
 * The floor is the v2.6.0 fix. Until then this stripped suffixes without ever
 * re-checking length — `tokenize` filtered `length > 1` BEFORE stemming and
 * never again — so `really` entered the index as `re`, `national` as `n`, and
 * `fable` as `f` carrying IDF 6.013. Nineteen raw canon words, sixteen distinct
 * fragments, 108 of 450 entries holding at least one.
 *
 * Three, and a FALLBACK rather than a drop. Both halves are load-bearing:
 *
 *   - Three, not four. Four would destroy `dating/dates/daters → dat`,
 *     `fixed/fixes → fix`, `sexes → sex` and `paying/payers → pay` — four
 *     working families, to fix nineteen broken tokens.
 *   - The floor applies only to a token stemming SHORTENED. `men`, `age`, `AI`
 *     and `SMV` arrive short and are untouched; an original-length floor would
 *     catch none of the real cases, all of which enter long.
 *   - Fall back, do not drop. Discarding the token would erase `stable`,
 *     `viable` and `visible`, which are real concepts in this canon.
 *
 * The cost, accepted and recorded: `moment`/`moments` and `peer`/`peers` stop
 * unifying, because they only ever unified by collapsing onto a fragment that
 * also swallowed everything else ending the same way.
 *
 * The bare-`s` alternative does not fire after `u` or `s` (v2.6.19). Stripping
 * it there split every s-final singular from its own regular plural: `status`
 * lost its `s` (→ `statu`) while `statuses` lost only `es` (→ `status`), so
 * the two never unified — same for focus/focuses, process/processes,
 * discuss/discusses, boss/bosses (a GPT-5.6 review found the class). A final
 * `s` after `u`/`s` is part of the word, not an inflection: no English plural
 * ends in `ss`, and the `-us`/`-ous` words end that way in the singular.
 * Measured over the 176,207-token canon+corpus vocabulary before shipping:
 * 36 real inflection families unify, 2 false unions die (possible↮poses,
 * impossible↮imposed), and the one real loss is menu/menus.
 */
function stemToken(token) {
  if (token.length < SCORING_CONFIG.minStemmableLength) return token;
  const stem = token
    .replace(/(?:ization|ational|fulness|iveness|ously)$/u, '')
    .replace(/(?:ments|ment|ness|able|ible|ally|edly|ingly)$/u, '')
    .replace(/(?:ies)$/u, 'y')
    .replace(/(?:ing|ers|ed|es|(?<![us])s)$/u, '');
  // A stem that survived unchanged is at least minStemmableLength long, so this
  // rejects only results the stripper actually shortened past the floor.
  return stem.length >= SCORING_CONFIG.minDerivedStemLength ? stem : token;
}

/**
 * Text to the tokens every part of retrieval reasons about.
 *
 * The stopword filter runs BEFORE stemming, and from v2.6.0 that placement is
 * deliberate rather than incidental. Sol's rule asks that filtering be re-run
 * against the accepted representation as well as the original, so that falling
 * back from `re` to `really` cannot restore a word the list had excluded. On
 * the fallback path that is already true by construction: the fallback returns
 * the ORIGINAL, and the original is exactly what this filter has just checked.
 * `really` therefore joins STOP_WORDS and the existing filter catches it.
 *
 * A second pass after stemming was measured and REMOVED. It would bite only on
 * the normal stemming path, where it deletes `offers` (→ `off`), `owned` and
 * `owners` (→ `own`), `shoulders` (→ `should`), and `willing`/`willingness`
 * (→ `will`) — six content words whose stems collide with function words that
 * this filter had already removed, so the collision is harmless today and the
 * deletion is a loss rather than a fix. That is a real defect of its own shape
 * and it is written up rather than smuggled in here.
 */
export function tokenize(value, { keepGeneric = true } = {}) {
  const normalized = normalizeText(value);
  const raw = normalized.match(/[\p{L}\p{N}]+(?:'[\p{L}]+)?/gu) || [];
  return raw
    .map((token) => token.replace(/^'|'$/g, ''))
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token))
    .map(stemToken)
    .filter((token) => keepGeneric || !GENERIC_TERMS.has(token));
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value == null || value === '') return [];
  return [value];
}

function fnv1a(value) {
  let hash = 0x811c9dc5;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits = SCORING_CONFIG.scorePrecision) {
  const scale = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * scale) / scale;
}

function percentage(numerator, denominator) {
  return denominator
    ? round((numerator / denominator) * 100, SCORING_CONFIG.percentPrecision)
    : null;
}

function wordCount(text) {
  return (String(text || '').match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) || []).length;
}

function truncate(value, max = 240) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const boundary = cut.lastIndexOf(' ');
  return `${cut.slice(0, boundary > max * 0.65 ? boundary : max - 1)}…`;
}

function normalizeEntry(raw, index) {
  const page = String(raw.page || raw.sourcePage || '').trim();
  const anchor = String(raw.anchor || '').replace(/^#/, '').trim();
  const title = String(raw.title || raw.name || `Untitled concept ${index + 1}`).trim();
  const synopsis = String(raw.synopsis || raw.summary || raw.description || '').trim();
  const aliases = unique([
    title,
    ...asArray(raw.aliases),
    ...asArray(raw.importantPhrases),
    ...asArray(raw.phrases),
  ].map((item) => String(item).trim()));
  const related = asArray(raw.related).map((item) => (
    typeof item === 'string' ? item : item.id || item.href || item.label
  )).filter(Boolean);
  const sourceLinks = asArray(raw.sourceLinks || raw.sources).map((source) => {
    if (typeof source === 'string') return { label: source, url: source };
    return { label: source.label || source.title || source.url || 'Source', url: source.url || source.href || '' };
  }).filter((source) => source.url);
  const entry = {
    id: String(raw.id || `canon-${fnv1a(`${page}|${anchor}|${title}`)}`),
    title,
    page,
    anchor,
    href: page ? `${page}${anchor ? `#${anchor}` : ''}` : '',
    category: String(raw.category || 'Uncategorized'),
    subcategory: String(raw.subcategory || ''),
    synopsis,
    evidenceType: String(raw.evidenceType || raw.evidenceTier || raw.contentType || 'Unspecified'),
    aliases,
    dependencies: asArray(raw.dependencies).map(String),
    related,
    boundaryConditions: asArray(raw.boundaryConditions || raw.boundaries).map(String),
    commonMisreadings: asArray(raw.commonMisreadings || raw.misreadings).map(String),
    sourceLinks,
    pressureTests: asArray(raw.pressureTests || raw.pressureQuestions).map(String),
  };
  /*
   * The five surfaces an entry offers to the matcher. Retrieval concatenates
   * them — a token is a token — but WHAT a token means depends entirely on
   * which surface supplied it. Words drawn from `commonMisreadings` are the
   * reading the canon rejects; words drawn from `boundaryConditions` are its
   * caveat, not its claim. Scoring is unchanged by this decomposition; only
   * stance and its transparency trace read it.
   */
  const surfaces = {
    title,
    alias: aliases.join(' '),
    synopsis: [synopsis, entry.category, entry.subcategory].join(' '),
    boundaryCondition: entry.boundaryConditions.join(' '),
    commonMisreading: entry.commonMisreadings.join(' '),
  };
  entry._surfaceTokens = Object.fromEntries(MATCH_SURFACES
    .map((surface) => [surface, new Set(tokenize(surfaces[surface]))]));
  const lexicalText = [
    title,
    synopsis,
    entry.category,
    entry.subcategory,
    ...aliases,
    ...entry.boundaryConditions,
    ...entry.commonMisreadings,
  ].join(' ');
  entry._normalized = normalizeText(lexicalText);
  // Entry side only — see ENTRY_ARTIFACT_TERMS. The passage keeps every token
  // it was written with, including these.
  entry._tokens = unique(tokenize(lexicalText))
    .filter((token) => !ENTRY_ARTIFACT_TERMS.has(token));
  entry._distinctiveTokens = unique(tokenize(lexicalText, { keepGeneric: false }))
    .filter((token) => !ENTRY_ARTIFACT_TERMS.has(token));
  entry._phrases = unique(aliases
    .map(normalizeText)
    .filter((phrase) => phrase.length >= SCORING_CONFIG.minPhraseLength));
  /*
   * The union, still used to locate the misreading inside the passage: any
   * rejected reading's words are a legitimate place to look.
   */
  entry._misreadingTokens = unique(tokenize(entry.commonMisreadings.join(' ')));
  /*
   * ...and each rejected reading on its own, because overlap is a SHARE of the
   * set it is measured against. Measured against the union, every misreading an
   * author added raised the bar for all the others — a passage had to cover a
   * share of a bigger set — so the canon was penalised for being thorough and a
   * well-written entry could reject a reading it then failed to recognise.
   */
  entry._misreadingTokenSets = entry.commonMisreadings
    .map((misreading) => unique(tokenize(misreading)))
    .filter((tokens) => tokens.length);
  /*
   * ...and, per rejected reading, the tokens the ENTRY'S OWN VOICE does not
   * use. A misreading mis-states the entry's claim, so most of its tokens are
   * necessarily the entry's; overlap on those says "same topic", not "asserts
   * the rejected reading" — 54 entries fired Contradicts on their own synopsis
   * through exactly that conflation (md/lab-live-crash-test-01.md). Only a
   * token absent from every affirmative surface can evidence the misreading
   * as opposed to the claim. A misreading with no such token (4 of 588 at the
   * freeze) cannot be detected by this branch at all until it is authored one.
   *
   * `pressureTests` joins that affirmative voice at v2.6.21 (pt09
   * adversarial lane). It is authored canon prose about the entry's own claim,
   * written in the entry's own vocabulary; it was omitted here only because it
   * is not a MATCH_SURFACE — it feeds no retrieval text and no score, so it had
   * never needed a token set. Leaving it out left the guard one-sided: a word
   * the synopsis happens to spell differently ("chosen") but the pressure test
   * spells plainly ("selection") counted as evidence of the rejected reading,
   * so "The Conversion Ladder separates exposure, attention, attraction, and
   * selection." — the concept restated correctly — read Contradicts at 0.881
   * against lexicon:term-conversion-ladder, whose misreading CONFLATES the
   * rungs the passage separates. Measured over the 677 authored misreadings in
   * the index: no misreading loses its last distinctive token (5 have none
   * either way), 38 lose some and keep at least one. Labels can move; scores
   * cannot, because nothing here reaches the score.
   */
  const affirmativeSurfaceTokens = new Set([
    ...entry._surfaceTokens.title,
    ...entry._surfaceTokens.alias,
    ...entry._surfaceTokens.synopsis,
    ...entry._surfaceTokens.boundaryCondition,
    ...tokenize(entry.pressureTests.join(' ')),
  ]);
  entry._misreadingDistinctiveSets = entry._misreadingTokenSets
    .map((tokens) => tokens.filter((token) => !affirmativeSurfaceTokens.has(token)));
  /*
   * Alias typing. A single word is insufficient evidence by default, which is
   * why the untyped path below still applies minSingleAliasLength and the
   * low-information filter. These two sets are the curated exceptions:
   *   standalone — a term specific enough that its presence in an already
   *                retained relationship-domain passage IS the concept.
   *   contextual — an ordinary word the concept borrows. It needs independent
   *                relational evidence in the same passage, and it can be
   *                disqualified outright by the modifier in front of it.
   * Typed aliases deliberately skip minSingleAliasLength: curation is the
   * stronger signal, and a length floor exists only because curation was
   * absent.
   */
  entry._singleTokenAliases = unique(aliases
    .map(normalizeText)
    .filter((alias) => alias && !alias.includes(' ')));
  entry._standaloneAliases = new Set(asArray(raw.standaloneAliases)
    .map((alias) => normalizeText(alias)).filter(Boolean));
  entry._contextualAliases = new Map(asArray(raw.contextualAliases)
    .map((item) => (typeof item === 'string' ? { alias: item } : item))
    .filter((item) => item && item.alias)
    .map((item) => [
      normalizeText(item.alias),
      asArray(item.notAfter).map((modifier) => normalizeText(modifier)).filter(Boolean),
    ]));
  return entry;
}

export function prepareCanonIndex(canonIndex) {
  const rawEntries = Array.isArray(canonIndex) ? canonIndex : canonIndex?.entries;
  if (!Array.isArray(rawEntries) || !rawEntries.length) {
    throw new Error('The canon index is missing its entries array.');
  }
  const entries = rawEntries.map(normalizeEntry);
  const documentFrequency = new Map();
  entries.forEach((entry) => {
    new Set(entry._tokens).forEach((token) => {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    });
  });
  const idf = new Map();
  entries.forEach((entry) => {
    entry._tokens.forEach((token) => {
      if (!idf.has(token)) {
        idf.set(token, Math.log((entries.length + 1) / ((documentFrequency.get(token) || 0) + 1)) + 1);
      }
    });
  });
  return {
    schemaVersion: canonIndex.schemaVersion || 'le-canon-index/1.0',
    indexVersion: canonIndex.indexVersion || canonIndex.version || 'unknown',
    generatedAt: canonIndex.generatedAt || null,
    sourcePages: canonIndex.sourcePages || [],
    stats: canonIndex.stats || {},
    entries,
    idf,
  };
}

function fallbackSentenceSplit(text) {
  const pieces = String(text || '')
    .replace(/\r\n?/g, '\n')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"'([])|\n{2,}/u)
    .map((part) => part.trim())
    .filter(Boolean);
  return pieces.length ? pieces : [String(text || '').trim()].filter(Boolean);
}

// Abbreviations that never end a sentence: any break after them is a splitter
// artifact, so the next piece is always rejoined.
const MERGE_ALWAYS_ABBREVIATION = /(?:\bvs\.|\be\.g\.|\bi\.e\.|\bapprox\.)$/i;
// Abbreviations that CAN legitimately end a sentence ("...in the U.S."): rejoin
// only when the next piece starts like a continuation (lowercase, digit, or a
// numeric/currency glyph), never when it opens a fresh capitalized sentence.
// Case-sensitive so the word "no." at a sentence boundary is not mistaken for
// the "No. 5" numbering abbreviation.
const MERGE_CONTINUATION_ABBREVIATION = /(?:\bU\.S\.|\betc\.|\bNo\.|\ba\.m\.|\bp\.m\.)$/;
const CONTINUATION_START = /^[a-z0-9(%$€£&]/;

function hasUnclosedParenthesis(text) {
  let depth = 0;
  for (const character of text) {
    if (character === '(') depth += 1;
    else if (character === ')') depth = Math.max(0, depth - 1);
  }
  return depth > 0;
}

// Both split paths (Intl.Segmenter and the regex fallback) break after
// abbreviation periods like "(34% vs." → "27%).", truncating the parent claim
// and orphaning fragments. Rejoining is a fold so a repaired sentence can keep
// absorbing further artifacts (e.g. nested parentheticals).
function mergeSentenceSplitArtifacts(pieces) {
  const merged = [];
  pieces.forEach((piece) => {
    const previous = merged[merged.length - 1];
    if (previous && (
      MERGE_ALWAYS_ABBREVIATION.test(previous)
      || (MERGE_CONTINUATION_ABBREVIATION.test(previous) && CONTINUATION_START.test(piece))
      || hasUnclosedParenthesis(previous)
    )) {
      merged[merged.length - 1] = `${previous} ${piece}`;
    } else {
      merged.push(piece);
    }
  });
  return merged;
}

function splitSentences(text) {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    try {
      const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
      return mergeSentenceSplitArtifacts([...segmenter.segment(String(text || ''))]
        .map((item) => item.segment.trim())
        .filter(Boolean));
    } catch {
      return mergeSentenceSplitArtifacts(fallbackSentenceSplit(text));
    }
  }
  return mergeSentenceSplitArtifacts(fallbackSentenceSplit(text));
}

function claimLikelihood(text) {
  const words = wordCount(text);
  if (words < SCORING_CONFIG.minClaimWords) return 0;
  let score = words >= SCORING_CONFIG.claimLongWordCount
    ? SCORING_CONFIG.claimBaseScoreLong
    : SCORING_CONFIG.claimBaseScoreShort;
  CLAIM_CUES.forEach((pattern) => {
    if (pattern.test(text)) score += SCORING_CONFIG.claimCueBonus;
  });
  if (/^\s*(?:hi|hello|thanks?|okay|right|yeah|um|uh)\b[!.]?\s*$/i.test(text)) score = 0;
  if (/\?$/.test(text)) {
    score += words >= SCORING_CONFIG.claimQuestionWordCount
      ? SCORING_CONFIG.claimQuestionBonus
      : -SCORING_CONFIG.claimQuestionBonus;
  }
  if (words > SCORING_CONFIG.claimVerboseWordCount) score -= SCORING_CONFIG.claimVerbosePenalty;
  return clamp(score);
}

function boundedPreviousContext(sentences, sentenceIndex, parentSegmentId) {
  if (sentenceIndex < 1) return null;
  const text = String(sentences[sentenceIndex] || '').trim();
  const previousText = String(sentences[sentenceIndex - 1] || '').trim();
  if (!text || !previousText) return null;
  if (!ANAPHORIC_CONTINUATION_CUE.test(text)) return null;
  if (wordCount(text) > SCORING_CONFIG.maxContextContinuationWords) return null;
  if (wordCount(previousText) > SCORING_CONFIG.maxContextSourceWords) return null;
  return {
    kind: 'previous-sentence',
    sourceUnitId: `${parentSegmentId}.claim-${String(sentenceIndex).padStart(2, '0')}`,
    parentSegmentId,
    reason: 'Short referential continuation of the immediately preceding sentence.',
  };
}

export function detectClaimUnits(document) {
  if (!document || !Array.isArray(document.segments)) {
    throw new Error('Normalized document must contain an ordered segments array.');
  }
  const units = [];
  document.segments.forEach((segment, segmentIndex) => {
    const sourceText = String(segment.text || '').trim();
    if (!sourceText) return;
    const sentences = splitSentences(sourceText);
    const parentId = String(segment.id || `seg-${String(segmentIndex + 1).padStart(4, '0')}`);
    let localSearchStart = 0;
    sentences.forEach((sentence, sentenceIndex) => {
      if (!sentence) return;
      const rawOffset = sourceText.indexOf(sentence, localSearchStart);
      const start = rawOffset >= 0 ? rawOffset : localSearchStart;
      const end = start + sentence.length;
      localSearchStart = end;
      const likelihood = claimLikelihood(sentence);
      units.push({
        id: `${parentId}.claim-${String(sentenceIndex + 1).padStart(2, '0')}`,
        parentSegmentId: parentId,
        segmentIndex,
        sentenceIndex,
        text: sentence,
        boundedContext: boundedPreviousContext(sentences, sentenceIndex, parentId),
        speaker: segment.speaker || null,
        startTime: segment.startMs ?? segment.startTime ?? segment.start ?? null,
        endTime: segment.endMs ?? segment.endTime ?? segment.end ?? null,
        sourceBoundary: {
          parentSegmentId: parentId,
          start,
          end,
          originalStart: segment.original?.startOffset ?? segment.originalStart ?? null,
          originalEnd: segment.original?.endOffset ?? segment.originalEnd ?? null,
        },
        wordCount: wordCount(sentence),
        claimLikelihood: round(likelihood),
        isClaimLike: likelihood >= SCORING_CONFIG.claimLikeThreshold,
      });
    });
  });
  return units.slice(0, SCORING_CONFIG.maxClaimUnits);
}

function frameHas(text, entityPattern, predicatePattern) {
  return entityPattern.test(text) && predicatePattern.test(text);
}

function collectFrameEvidence(definitions, text, polarity, frame) {
  return definitions
    .filter((definition) => definition.test(text))
    .map((definition) => ({
      code: definition.id,
      label: definition.label,
      weight: definition.weight,
      decisive: Boolean(definition.decisive),
      polarity,
      frame,
    }));
}

function summarizeFrame(evidence) {
  return {
    detected: evidence.length > 0,
    score: evidence.reduce((maximum, item) => Math.max(maximum, Number(item.weight) || 0), 0),
    evidence: evidence.map(({ code, label, decisive }) => ({ code, label, decisive })),
  };
}

export const DOMAIN_REASON_LABELS = Object.freeze({
  'explicit-relational-outcome': 'Explicit relationship outcome',
  'relational-outcome-overrides-incidental-input': 'Relationship outcome outweighs incidental non-domain vocabulary',
  'explicit-relational-mechanism': 'Explicit human relationship mechanism',
  'plausible-human-relational-frame': 'Plausible human relational frame, retained conservatively',
  'bounded-previous-domain-context': 'Anaphoric continuation of the previous retained passage',
  'affirmative-non-domain-evidence': 'Affirmative non-relationship frame, no relational anchor',
  'no-human-relational-frame': 'No participant, relationship outcome, or human-social mechanism detected',
  'user-override-include': 'Included by the visitor for this session',
  'user-override-exclude': 'Excluded by the visitor for this session',
});

/**
 * What the analyzer knows about a passage it set aside.
 *
 * A set-aside passage is decided before any canon entry is scored, so nothing
 * about retrieval belongs here — no candidates, no scores, no trace. That
 * absence is real and is reported as such downstream.
 *
 * Everything BELOW retrieval is a different matter, and until v2.5.0 this
 * record threw most of it away. Claim likelihood, the claim-grammar verdict,
 * the source offsets, the anaphoric bridge and the per-frame scores were all
 * computed for this unit before the gate ruled on it, and then dropped — so a
 * reviewer disputing a `segmentation-error` was told the boundary data was
 * unpublished when the analyzer had it in hand. Published now, unchanged, with
 * no recomputation: these are the same values the retained rows carry.
 */
function ignoredPassageRecord(unit) {
  const relevance = unit.domainRelevance;
  const frames = relevance.frames || {};
  return {
    segmentId: unit.id,
    parentSegmentId: unit.parentSegmentId,
    location: {
      segmentIndex: unit.segmentIndex,
      sentenceIndex: unit.sentenceIndex ?? null,
      speaker: unit.speaker,
      startTime: unit.startTime,
      endTime: unit.endTime,
    },
    excerpt: unit.text,
    wordCount: unit.wordCount,
    // Claim grammar, decided independently of the domain gate. A passage can be
    // set aside as off-domain and still be perfectly claim-like, and a reviewer
    // arguing the gate was wrong needs to see which of the two is which.
    claimLikelihood: unit.claimLikelihood ?? null,
    isClaimLike: unit.isClaimLike ?? null,
    machineClaimLike: unit.machineClaimLike ?? null,
    // Where the passage came from in the source text. This is the field a
    // segmentation-error report is actually about.
    sourceBoundary: unit.sourceBoundary || null,
    boundedContext: unit.boundedContext || null,
    localStatus: relevance.localStatus,
    reasonCode: relevance.reasonCode,
    reasonLabel: DOMAIN_REASON_LABELS[relevance.reasonCode] || relevance.reasonCode,
    decisiveReason: relevance.decisiveReason ?? null,
    // The full score summary, not just the reason code. "No relational frame"
    // and "a relational frame that scored 2.5 against a threshold of 4" are
    // different complaints and were previously indistinguishable.
    domainScore: relevance.score ?? null,
    nonDomainScore: relevance.nonDomainScore ?? null,
    frameScores: {
      participant: { detected: Boolean(frames.participant?.detected), score: frames.participant?.score ?? 0 },
      outcome: { detected: Boolean(frames.outcome?.detected), score: frames.outcome?.score ?? 0 },
      mechanism: { detected: Boolean(frames.mechanism?.detected), score: frames.mechanism?.score ?? 0 },
      nonDomain: { detected: Boolean(frames.nonDomain?.detected), score: frames.nonDomain?.score ?? 0 },
    },
    frameEvidence: relevance.evidence
      .filter((item) => item.frame !== 'decision')
      .slice(0, SCORING_CONFIG.maxIgnoredFrameEvidence)
      .map(({ code, label, polarity, frame }) => ({ code, label, polarity, frame })),
    overridden: relevance.override === 'exclude',
  };
}

/**
 * Every canon surface distinctive enough to place a passage in the domain on its
 * own — multi-word alias phrases, and nothing else.
 *
 * Single words are excluded on the analyzer's own reasoning rather than to fit a
 * fixture. `minSingleAliasLength` exists because one word is thin evidence, and
 * the measurement agreed: admitting curated single-word aliases too costs two
 * expected-ignore cases, both anchored on `rizz` — applied to a sneaker colorway
 * and to a mascot. Slang escapes its domain; a phrase does so far less often.
 * (`md/lab-gate-option2.md` records the variant that excluded `rizz` by name and
 * reached one more retained claim. It is not shipped: that is fitting the rule
 * to the fixture.)
 */
export function canonAdmissionSurfaces(prepared) {
  const surfaces = new Set();
  for (const entry of prepared?.entries || []) {
    for (const phrase of entry._phrases || []) {
      if (phrase.includes(' ')) surfaces.add(phrase);
    }
  }
  return surfaces;
}

/*
 * Phrase presence, at token boundaries. `String.includes` alone admitted any
 * substring occurrence, so "the supermarket values efficiency" NAMED the canon
 * concept "market value" and scored its exact-phrase bonus — one character of
 * neighbouring word on either side, and the phrase was never in the text at
 * all.
 *
 * The boundary is asymmetric, and the asymmetry was measured before it was
 * chosen (2026-08-07): the LEADING edge is strict, because every embedded
 * false hit found — "supermarket values", "inattention to alternatives" —
 * grows the phrase leftward into a different word. The TRAILING edge admits a
 * plural tail (`s`/`es`) and nothing else, because a strict trailing edge
 * measured against the corpus threw away 27 correctly-admitted passages that
 * name a concept in the plural ("sex ratios" ×21, "social skills" ×6) while
 * the arbitrary-tail hits it exists to kill ("the wallpaper", "sexual desirea"
 * table junk, "frequency of sex[ual]") share no plural shape. A pluralized
 * phrase names the concept; a phrase swallowed by a longer word does not.
 */
const PHRASE_BOUNDARY_CHAR = /[\p{L}\p{N}]/u;
const PHRASE_PLURAL_TAIL = /^(?:s|es)(?![\p{L}\p{N}])/u;

function containsBoundedPhrase(normalized, phrase) {
  let from = 0;
  while (true) {
    const at = normalized.indexOf(phrase, from);
    if (at === -1) return false;
    const before = at === 0 ? '' : normalized[at - 1];
    const tail = normalized.slice(at + phrase.length);
    const boundedAfter = !PHRASE_BOUNDARY_CHAR.test(tail[0] || '') || PHRASE_PLURAL_TAIL.test(tail);
    if (!PHRASE_BOUNDARY_CHAR.test(before) && boundedAfter) return true;
    from = at + 1;
  }
}

function namesCanonSurface(text, canonSurfaces) {
  if (!canonSurfaces?.size) return null;
  const normalized = normalizeText(text);
  for (const phrase of canonSurfaces) {
    if (containsBoundedPhrase(normalized, phrase)) return phrase;
  }
  return null;
}

function localDomainRelevance(unit, canonSurfaces = null) {
  /*
   * Normalized, not raw, from v2.6.21. Retrieval, clause splitting,
   * stance and `namesCanonSurface` (five lines up, inside this same gate) all
   * read `normalizeText` output; only the four frame families read the raw
   * bytes, and that asymmetry was invisible because the frames are written in
   * lower case with `/i` anyway. What it cost was every multi-word pattern
   * spanning a space: one U+00A0 — the character an HTML paste yields from
   * `&nbsp;` — turned "a provider" into a string `provisioning-role` cannot
   * see, and "He wanted a provider who could support a household while he
   * raised their children." went from retained to set aside
   * `no-human-relational-frame`. Same for U+202F, U+3000, a curly apostrophe
   * in a pattern spelled with a straight one, and an en dash where a pattern
   * spells a hyphen.
   *
   * Measured: 0 of the 191 frozen benchmark cases move and 0 of the 1,298
   * corpus matches move, because neither instrument holds a non-ASCII space.
   * Insert one U+00A0 into those same benchmark cases and 5 of the 89
   * expected-retain ones flip to ignore. That is the finding as much as the
   * fix is.
   */
  const text = normalizeText(unit?.text || '');
  const participantEvidence = collectFrameEvidence(
    HUMAN_PARTICIPANT_FRAMES, text, 'domain', 'participant',
  );
  const outcomeEvidence = collectFrameEvidence(
    RELATIONAL_OUTCOME_FRAMES, text, 'domain', 'outcome',
  );
  const mechanismEvidence = collectFrameEvidence(
    SOCIAL_MECHANISM_FRAMES, text, 'domain', 'mechanism',
  );
  const nonDomainEvidence = collectFrameEvidence(
    NON_DOMAIN_FRAME_DEFINITIONS, text, 'non-domain', 'non-domain',
  );
  const frames = {
    participant: summarizeFrame(participantEvidence),
    outcome: summarizeFrame(outcomeEvidence),
    mechanism: summarizeFrame(mechanismEvidence),
    nonDomain: summarizeFrame(nonDomainEvidence),
  };

  const decisiveOutcome = outcomeEvidence.some((evidence) => evidence.decisive);
  const decisiveMechanism = mechanismEvidence.some((evidence) => evidence.decisive);
  const humanGroundedOutcome = frames.participant.detected && frames.outcome.detected;
  const humanSocialMechanism = frames.participant.detected && frames.mechanism.detected;
  const plausibleRelationalAnchor = frames.outcome.detected && !frames.nonDomain.detected;
  const plausibleSocialStructure = frames.mechanism.score >= SCORING_CONFIG.plausibleSocialStructureScore
    && !frames.nonDomain.detected;
  /*
   * Gate option 2a: a passage that NAMES a distinctive canon concept is in the
   * domain by construction, whatever its frame vocabulary looks like. This is
   * how gate scope grows by authoring doctrine instead of by editing a regex —
   * a concept the site takes the trouble to name becomes a concept the Lab can
   * recognise.
   *
   * It does not override an affirmative non-domain veto. A finance passage that
   * happens to contain a canon phrase is still a finance passage, and the four
   * frames stay the primary instrument; this only reaches passages the frames
   * would otherwise bin for having no vocabulary at all.
   */
  const namedCanonSurface = namesCanonSurface(text, canonSurfaces);
  const canonAnchored = Boolean(namedCanonSurface) && !frames.nonDomain.detected;
  const score = round(Math.max(
    frames.outcome.score,
    frames.mechanism.score,
    humanGroundedOutcome || humanSocialMechanism || canonAnchored
      ? SCORING_CONFIG.domainUncertainScore : 0,
  ), SCORING_CONFIG.domainScorePrecision);
  // Non-domain categories are capped at their strongest family. Correlated
  // tokens such as stock/market/finance never become independent veto votes.
  const nonDomainScore = round(frames.nonDomain.score, SCORING_CONFIG.domainScorePrecision);

  let status;
  let reasonCode;
  if (decisiveOutcome) {
    status = 'relevant';
    reasonCode = frames.nonDomain.detected
      ? 'relational-outcome-overrides-incidental-input'
      : 'explicit-relational-outcome';
  } else if (decisiveMechanism) {
    status = 'relevant';
    reasonCode = 'explicit-relational-mechanism';
  } else if (
    humanGroundedOutcome
    || humanSocialMechanism
    || plausibleRelationalAnchor
    || plausibleSocialStructure
  ) {
    status = 'uncertain';
    reasonCode = 'plausible-human-relational-frame';
  } else if (canonAnchored) {
    status = 'uncertain';
    reasonCode = 'named-canon-concept';
  } else if (frames.nonDomain.detected) {
    status = 'irrelevant';
    reasonCode = 'affirmative-non-domain-evidence';
  } else {
    status = 'irrelevant';
    reasonCode = 'no-human-relational-frame';
  }

  const evidence = [
    ...participantEvidence,
    ...outcomeEvidence,
    ...mechanismEvidence,
    ...nonDomainEvidence,
  ];
  if (canonAnchored) {
    // Recorded even when a frame also fired, so a reader inspecting a retained
    // passage can see that the canon had something to say about it.
    evidence.push({
      code: 'named-canon-concept',
      label: `Names a canon concept by its full phrase: “${namedCanonSurface}”`,
      weight: SCORING_CONFIG.domainUncertainScore,
      polarity: 'domain',
      frame: 'canon',
    });
  }
  if (!evidence.length) {
    evidence.push({
      code: reasonCode,
      label: 'No participant, relationship outcome, or human-social mechanism was detected',
      weight: 0,
      polarity: 'non-domain',
      frame: 'decision',
    });
  }

  return {
    status,
    localStatus: status,
    score,
    nonDomainScore,
    reasonCode,
    decisiveReason: reasonCode,
    frames,
    evidence,
    contextHelp: null,
  };
}

function contextContinuityEvidence(unit, previous) {
  if (unit.domainRelevance.frames?.nonDomain?.detected) return null;
  const currentText = normalizeText(unit.text);
  const previousText = normalizeText(previous.text);
  const previousTokens = new Set(tokenize(previousText, { keepGeneric: false })
    .filter((token) => !LOW_INFORMATION_MATCH_TERMS.has(token)));
  const sharedConcepts = tokenize(currentText, { keepGeneric: false })
    .filter((token) => previousTokens.has(token) && !LOW_INFORMATION_MATCH_TERMS.has(token));
  const consequenceLanguage = /\b(?:makes?|puts?|means?|leaves?|leads?|reduces?|increases?|changes?|shapes?|affects?|limits?|narrows?)\b.{0,70}\b(?:photographs?|photos?|profiles?|messages?|swipes?|matches?|meeting|meet|opportunities|choices?|contact|exposure|familiarity|attraction|compatibility|commitment|relationships?|partners?|important|first|harder|easier|likely|unlikely)\b/i.test(unit.text);
  const localFrameContinuity = unit.domainRelevance.frames?.outcome?.detected
    || unit.domainRelevance.frames?.mechanism?.detected;
  if (!localFrameContinuity && !consequenceLanguage && !sharedConcepts.length) return null;
  return {
    code: localFrameContinuity
      ? 'compatible-local-relational-frame'
      : consequenceLanguage
        ? 'approved-consequence-language'
        : 'shared-relationship-concept',
    sharedConcepts: unique(sharedConcepts).slice(0, SCORING_CONFIG.maxContinuitySharedConcepts),
  };
}

const DOMAIN_OVERRIDE_ACTIONS = Object.freeze(['include', 'exclude']);

export function normalizeDomainOverrides(rawOverrides) {
  const normalized = new Map();
  if (!rawOverrides) return normalized;
  const entries = rawOverrides instanceof Map
    ? [...rawOverrides.entries()]
    : Object.entries(rawOverrides);
  entries.forEach(([unitId, action]) => {
    if (typeof unitId !== 'string' || !unitId) return;
    if (!DOMAIN_OVERRIDE_ACTIONS.includes(action)) return;
    normalized.set(unitId, action);
  });
  return normalized;
}

function applyDomainOverride(unit, action) {
  if (!action) return unit;
  const local = unit.domainRelevance;
  const include = action === 'include';
  return {
    ...unit,
    // "Include in analysis" is a locked visitor input: it admits the passage
    // into the analytical population even when claim grammar alone would have
    // kept it context-only. The machine's grammar verdict stays visible as
    // machineClaimLike, exactly like localStatus preserves the domain verdict.
    ...(include ? { isClaimLike: true, machineClaimLike: Boolean(unit.isClaimLike) } : {}),
    domainRelevance: {
      ...local,
      status: include ? 'relevant' : 'irrelevant',
      reasonCode: include ? 'user-override-include' : 'user-override-exclude',
      decisiveReason: include ? 'user-override-include' : 'user-override-exclude',
      override: action,
      evidence: [
        ...local.evidence,
        {
          code: include ? 'user-override-include' : 'user-override-exclude',
          label: include
            ? 'Included by the visitor for this session; the local classifier verdict is preserved above.'
            : 'Excluded by the visitor for this session; the local classifier verdict is preserved above.',
          weight: 'override',
          polarity: include ? 'domain' : 'non-domain',
          frame: 'override',
        },
      ],
    },
  };
}

/**
 * @param {object[]} units
 * @param {Map} [overrides]
 * @param {Set<string>|null} [canonSurfaces] Distinctive canon phrases, from
 *   `canonAdmissionSurfaces(prepareCanonIndex(index))`. Omitting it disables
 *   canon-anchored admission, which is NOT the shipped gate — `analyzeDocument`
 *   always passes it. Anything measuring the gate as a product decision has to
 *   pass it too, and `tests/lab-domain-benchmark.test.mjs` asserts that it does.
 *   Callers that are testing one frame's vocabulary in isolation may leave it
 *   off; callers reporting acceptance numbers may not.
 */
export function classifyDomainRelevance(units, overrides = new Map(), canonSurfaces = null) {
  const classified = (units || []).map((unit) => applyDomainOverride(
    { ...unit, domainRelevance: localDomainRelevance(unit, canonSurfaces) },
    overrides.get(unit.id),
  ));

  for (let index = 1; index < classified.length; index += 1) {
    const unit = classified[index];
    const previous = classified[index - 1];
    const bridge = unit.boundedContext;
    if (unit.domainRelevance.status === 'relevant' || !bridge) continue;
    // An overridden decision is a locked user input; context never reopens it.
    if (unit.domainRelevance.override) continue;
    if (unit.parentSegmentId !== previous.parentSegmentId) continue;
    if (bridge.sourceUnitId !== previous.id) continue;
    if (previous.domainRelevance.override === 'exclude') continue;
    if (previous.domainRelevance.override !== 'include'
      && !['relevant', 'uncertain'].includes(previous.domainRelevance.localStatus)) continue;
    // A context-promoted passage never becomes the source of another hop.
    if (previous.domainRelevance.contextHelp) continue;

    const continuity = contextContinuityEvidence(unit, previous);
    if (!continuity) continue;
    unit.domainRelevance = {
      ...unit.domainRelevance,
      status: 'relevant',
      score: Math.max(SCORING_CONFIG.domainRelevantScore, unit.domainRelevance.score),
      reasonCode: 'bounded-previous-domain-context',
      decisiveReason: 'bounded-previous-domain-context',
      evidence: [
        ...unit.domainRelevance.evidence,
        {
          code: 'bounded-previous-domain-context',
          label: 'Anaphoric continuation with semantic continuity to the immediately previous retained passage',
          weight: 'context',
          polarity: 'domain',
          frame: 'context',
          continuity: continuity.code,
        },
      ],
      contextHelp: {
        kind: bridge.kind,
        sourceUnitId: previous.id,
        localStatus: unit.domainRelevance.localStatus,
        localScore: unit.domainRelevance.score,
        reason: bridge.reason,
        continuity: continuity.code,
        sharedConcepts: continuity.sharedConcepts,
      },
    };
  }

  return classified;
}
/**
 * The passage split into clauses, with every word tagged by the clause it sits
 * in and by its position in the passage.
 *
 * Contextual co-fire and stance both need the same answer to "which clause is
 * this token in", so they share one splitter rather than two that can drift
 * apart. Splitting is on punctuation only — no part of speech is inferred and
 * no grammar is parsed, which keeps this deterministic and cheap.
 *
 * A hyphen ends a clause only when it is NOT joining two word characters. That
 * one rule keeps "cloud-based" inside a single clause while still breaking on a
 * spaced dash. Callers pass `normalizeForClauses` output rather than plain
 * normalized text, which is what makes the rule safe for an UNSPACED em dash
 * too — see that function for why the distinction has to be made before this
 * point rather than inside it.
 */
/*
 * The abbreviations whose period is part of the word.
 *
 * The same set the sentence merger keeps in MERGE_ALWAYS_ABBREVIATION and
 * MERGE_CONTINUATION_ABBREVIATION, case-folded because this splitter reads
 * normalizeText output. A bare "no." is deliberately absent: at clause granularity
 * it cannot be told from the ordinary word "no" ending a clause, and a
 * numbering abbreviation is not worth that trade.
 */
const CLAUSE_ABBREVIATION_TAIL = /(?:\bvs|\be\.g|\bi\.e|\bapprox|\bu\.s|\betc|\ba\.m|\bp\.m)$/i;

function clauseSegments(normalized) {
  const words = [];
  const clauses = [];
  let clause = 0;
  let buffer = '';
  let token = '';

  const flushToken = () => {
    if (token) words.push({ token, clause, index: words.length });
    token = '';
  };
  const flushClause = () => {
    flushToken();
    clauses.push({ index: clause, text: buffer.trim() });
    buffer = '';
    clause += 1;
  };

  for (let position = 0; position < normalized.length; position += 1) {
    const character = normalized[position];
    const joinsWords = /[a-z0-9]/.test(normalized[position - 1] || '')
      && /[a-z0-9]/.test(normalized[position + 1] || '');
    /*
     * The hyphen rule, extended to the other two characters that are not
     * always punctuation. A PERIOD joining two word characters is part of what
     * it joins ("3.5", "u.s", "e.g"); a COMMA between two digits is part of the
     * number ("1,000"); and a period closing a known abbreviation is part of
     * the abbreviation, which is the case the joining rule cannot see because
     * a space follows it ("the u.s. market").
     *
     * All three used to end a clause, and every clause-scoped branch counts
     * forward from the assertion clause, so each of them pushed the claim's
     * real next clause to +2 where nothing reads it. Measured on one claim and
     * one verdict: "…in most markets; that model is wrong." read Challenges
     * 0.697 while "…in the U.S. market; that model is wrong." read Resembles
     * at the same 0.697 — identical score, opposite label, one abbreviation
     * between them.
     */
    const joinsDigits = /[0-9]/.test(normalized[position - 1] || '')
      && /[0-9]/.test(normalized[position + 1] || '');
    const insideNumberOrWord = (character === '.' && joinsWords)
      || (character === ',' && joinsDigits);
    const insideAbbreviation = character === '.' && CLAUSE_ABBREVIATION_TAIL.test(buffer);
    if ((',;:.!?'.includes(character) && !insideNumberOrWord && !insideAbbreviation)
      || (character === '-' && !joinsWords)) {
      flushClause();
      continue;
    }
    buffer += character;
    // Apostrophes split, exactly as `normalized.split(/\W+/)` does elsewhere, so
    // token positions here and alias presence there cannot disagree.
    if (/[a-z0-9]/.test(character)) token += character; else flushToken();
  }
  flushClause();
  return { words, clauses };
}

/**
 * The passage as the clause splitter needs to see it.
 *
 * `normalizeText` folds em and en dashes to an ASCII hyphen. That is right for
 * matching — a reader who types "the 7-7 rule" should find the entry titled
 * "The 7–7 Rule" — and wrong for splitting, because it makes an unspaced
 * "marriage—the" indistinguishable from an intra-word "cloud-based". v2.5.0's
 * splitter rule is correct and was simply being handed text that had already
 * thrown the answer away.
 *
 * Spacing the dash BEFORE that fold keeps both. The splitter sees a hyphen that
 * is not joining two word characters and ends the clause; every token stream is
 * unchanged, because a dash already terminated a token whichever form it took;
 * and nothing downstream of matching sees this text at all.
 */
function normalizeForClauses(value) {
  return normalizeText(String(value ?? '').replace(/[–—]/gu, ' - '));
}

/**
 * Human relational roles, kinship, and relationship outcomes: the vocabulary
 * that makes a borrowed word like "provider" mean the thing this canon entry
 * means, when it appears BESIDE that word.
 *
 * Deliberately narrow. Terms that read as relational in a family sentence and
 * as ordinary business vocabulary in a technical one — support, home, income,
 * bills, rent, dates — are excluded, because this list runs inside a window
 * that has already been chosen for being close to a commercial noun. The cost
 * of a term that is wrong here is a false promotion; the cost of a term that is
 * missing is that the occurrence falls through to the independent-canon-concept
 * path, which is the same evidence measured a different way.
 *
 * Stemmed at load with the analyzer's own stemmer so the set speaks the same
 * token language `tokenize` produces.
 */
const RELATIONAL_ROLE_TERMS = new Set([
  'partner', 'partners', 'husband', 'husbands', 'wife', 'wives', 'spouse', 'spouses',
  'boyfriend', 'boyfriends', 'girlfriend', 'girlfriends', 'fiance', 'fiancee',
  'couple', 'couples', 'suitor', 'suitors',
  'marriage', 'marriages', 'married', 'marry', 'wedding', 'weddings', 'divorce', 'divorced',
  'family', 'families', 'household', 'households', 'homemaker', 'breadwinner', 'breadwinners',
  'children', 'child', 'kids', 'son', 'sons', 'daughter', 'daughters',
  'mother', 'mothers', 'father', 'fathers', 'parent', 'parents',
  'relationship', 'relationships', 'courtship', 'romance', 'romantic',
  'men', 'man', 'women', 'woman', 'male', 'males', 'female', 'females',
].map(stemToken));

/**
 * Relational evidence beside ONE occurrence of a contextual alias.
 *
 * "Beside" is the load-bearing word, and it is what changed at v2.5.0. Evidence
 * anywhere in the passage used to count, which meant a sentence could be about
 * arguing with a girlfriend in one clause and about buying cloud hosting in the
 * next, and the first clause would vouch for the second. Evidence now has to
 * sit within a bounded window of this occurrence AND inside its clause.
 *
 * Two ways to earn it, both independent of the alias itself, which still cannot
 * vouch for itself: a distinctive concept this passage shares with this same
 * canon entry, or a human relational role term. An affirmative non-domain frame
 * still vetoes the lot at the passage level — if the passage has told the gate
 * it is about sport or software, a borrowed word inside it is not suddenly
 * about dating.
 */
function relationalCoFire(unit, occurrence, segments, aliasTokens, admissionDistinctiveShared) {
  if (unit?.domainRelevance?.frames?.nonDomain?.detected) {
    return { promoted: false, reason: 'affirmative non-relationship frame in the passage' };
  }

  const radius = SCORING_CONFIG.contextualAliasWindowTokens;
  const window = segments.words.filter((word) => word.clause === occurrence.clause
    && Math.abs(word.index - occurrence.index) <= radius
    && word.index !== occurrence.index);
  const windowTokens = new Set(tokenize(window.map((word) => word.token).join(' ')));

  const independent = admissionDistinctiveShared
    .filter((token) => !aliasTokens.has(token)
      && token.length >= SCORING_CONFIG.minCoFireConceptLength
      && windowTokens.has(token));
  if (independent.length >= SCORING_CONFIG.minContextualAliasCoFire) {
    return {
      promoted: true,
      reason: `independent canon concept “${independent[0]}” within ${radius} tokens, same clause`,
    };
  }

  const role = window.find((word) => !aliasTokens.has(word.token)
    && RELATIONAL_ROLE_TERMS.has(stemToken(word.token)));
  if (role) {
    return {
      promoted: true,
      reason: `relational role term “${role.token}” within ${radius} tokens, same clause`,
    };
  }

  return {
    promoted: false,
    reason: `no relational evidence within ${radius} tokens of this occurrence, same clause`,
  };
}

/**
 * The two prepositions that introduce a complement of the noun rather than a
 * new adjunct: "provider FOR cloud hosting", "provider OF payroll services".
 * Deliberately not `in`, `on`, `with` or `to`, which far more often start a
 * phrase about the sentence than about the noun that precedes them.
 */
const COMPLEMENT_PREPOSITIONS = new Set(['for', 'of']);

/**
 * The technical modifier disqualifying ONE occurrence, if there is one.
 *
 * Secondary defense, and second for a reason. The window test above is what
 * generalizes: "AWS provider" and "Azure provider" are rejected because nothing
 * relational sits beside them, not because anyone wrote AWS and Azure down. A
 * denylist can only ever catch the vendors someone thought of.
 *
 * It earns its place on the cases the window test would pass for the wrong
 * reason — a technical noun that happens to sit near relational vocabulary. So
 * it is kept, and made token-bounded: it scans the tokens immediately before
 * the occurrence rather than testing the passage for a literal "modifier alias"
 * substring, which is how "cloud-based provider" walked past it.
 */
function disqualifyingModifier(occurrence, segments, modifiers) {
  if (!modifiers.length) return null;

  /*
   * A denylist term matches its own plural — and from v2.6.1, its own plural
   * rather than a guess at how the plural is spelled.
   *
   * The literal tests below ask whether the run contains `service` or
   * `services`, and for `utility` they therefore ask whether it contains
   * `utilitys`. It does not; it contains `utilities`, and the whole guard was
   * walked past by one word's morphology. The fix is to put both sides in the
   * same representation, and the representation this analyzer already has for
   * "the same word" is `stemToken` — the one the derived-stem floor landed on
   * at v2.6.0 — rather than a second, private idea of a plural.
   *
   * Stemming is ADDED to the literal tests, not substituted for them, and the
   * union is the whole of the correctness argument. This stemmer is not a
   * plural normalizer and was never built to be one: it unifies `utility` with
   * `utilities`, and it separates `service` from `services`, which strips to
   * `servic`. NINE of this denylist's sixteen entries fall on the separating
   * side — healthcare, health care, service, insurance, hosting, software,
   * care, childcare, child care — so a swap would fix two entries by breaking
   * nine. Either test alone leaks. Together they do not, and a test that only
   * ever adds disqualifications cannot promote something already rejected.
   *
   * Multiword entries match as a contiguous run of stems rather than by
   * substring, so `health care` still finds those two words in sequence and
   * can no longer be satisfied by a longer word that merely spans them.
   */
  const carries = (tokens) => {
    const run = tokens.join(' ');
    const stems = tokens.map(stemToken);
    return modifiers.find((modifier) => {
      if (tokens.includes(modifier) || tokens.includes(`${modifier}s`)) return true;
      if (modifier.includes(' ') && (run.includes(modifier) || run.includes(`${modifier}s`))) return true;
      const wanted = modifier.split(' ').map(stemToken);
      return stems.some((_, at) => wanted.every((stem, offset) => stems[at + offset] === stem));
    }) || null;
  };
  const tokensIn = (from, to) => segments.words
    .filter((word) => word.index >= from && word.index <= to && word.clause === occurrence.clause)
    .map((word) => word.token);

  // Backwards: the modifier in front of the noun. Multiword entries ("health
  // care") are matched as a contiguous run, so one rule covers both shapes.
  const lookback = SCORING_CONFIG.contextualAliasModifierLookback;
  const before = carries(tokensIn(occurrence.index - lookback, occurrence.index - 1));
  if (before) return before;

  /*
   * Forwards: the complement AFTER the noun, new at v2.6.0.
   *
   * English puts a noun's complement after it at least as often as its modifier
   * before it — "the provider for cloud hosting" says exactly what "the cloud
   * provider" says — so a backwards-only denylist can be walked past by word
   * order alone, with no vocabulary the list is missing.
   *
   * Narrow on purpose. It fires only on a complement the alias actually takes,
   * introduced by `for` or `of` immediately after it, and only when a listed
   * term sits inside that complement. "a provider for the household" is the
   * same shape with a relational complement and must stay promoted, so the
   * denylist and not the shape is what disqualifies.
   */
  const [complementizer] = tokensIn(occurrence.index + 1, occurrence.index + 1);
  if (!COMPLEMENT_PREPOSITIONS.has(complementizer)) return null;
  return carries(tokensIn(
    occurrence.index + 2,
    occurrence.index + 1 + SCORING_CONFIG.contextualAliasComplementLookahead,
  ));
}

/**
 * Single-token aliases the canon has typed, and which this passage earns.
 *
 * Standalone aliases pass on presence. Contextual aliases are adjudicated ONE
 * OCCURRENCE AT A TIME: each occurrence clears a disqualifying modifier of its
 * own and finds relational evidence of its own. The word "provider" in "cloud
 * provider" is not this concept however relational the rest of the sentence is,
 * and — the half that was missing before v2.5.0 — it does not make a second,
 * legitimate "provider" in the same sentence stop being this concept either.
 *
 * Returns the promoted hits and the full per-occurrence ledger, including the
 * occurrences that failed and why. A verdict a reader cannot audit is not much
 * of a verdict.
 */
/*
 * The token set a single-token alias is looked up in.
 *
 * `normalized.split(/\W+/)` on its own silently loses every alias that contains
 * punctuation, because a split on non-word characters cannot produce a token
 * that contains one. `fem-centrism`, `Sub-5` and `AF/BB` were unmatchable no
 * matter what a passage said — excluded from the phrase path for having no
 * space, and from this path for being unproducible. normalizeText keeps
 * punctuation, so the alias and the passage agreed and the lookup still failed.
 *
 * Splitting on whitespace and trimming only EDGE punctuation recovers them. The
 * two splits are UNIONED rather than swapped, which is what makes this safe to
 * add: every token the old split produced is still in the set, so no lookup that
 * succeeded before can begin to fail. "wall." still yields `wall` from the
 * \W+ side while "fem-centrism" now also yields itself whole.
 *
 * It cannot loosen matching either. A punctuated alias fires only on a passage
 * containing that exact punctuated token, which is stricter than the plain
 * tokens already in the set — not a new way for a short generic word to match.
 */
function aliasLookupTokens(normalized) {
  const tokens = normalized.split(/\W+/).filter(Boolean);
  for (const chunk of normalized.split(/\s+/)) {
    const trimmed = chunk.replace(/^[^a-z0-9]+/, '').replace(/[^a-z0-9]+$/, '');
    if (trimmed) tokens.push(trimmed);
  }
  return new Set(tokens);
}

function promotedAliases(unit, entry, normalized, admissionDistinctiveShared) {
  if (!entry._standaloneAliases.size && !entry._contextualAliases.size) {
    return { hits: [], trace: [] };
  }
  const present = aliasLookupTokens(normalized);
  const hits = [];
  const trace = [];
  let segments = null;

  for (const alias of entry._singleTokenAliases) {
    if (!present.has(alias)) continue;
    if (entry._standaloneAliases.has(alias)) {
      hits.push({ alias, aliasClass: 'standalone', because: 'curated high-specificity alias' });
      continue;
    }
    if (!entry._contextualAliases.has(alias)) continue;

    // Only pay for the split when a contextual alias is actually present. The
    // splitter gets its own normalization of the ORIGINAL text: an unspaced em
    // dash separates two claims and `normalized` has already folded it to
    // something indistinguishable from an intra-word hyphen.
    if (!segments) segments = clauseSegments(normalizeForClauses(unit.text));
    const modifiers = entry._contextualAliases.get(alias);
    const aliasTokens = new Set(tokenize(alias));
    const occurrences = segments.words.filter((word) => word.token === alias);
    let promotedHere = null;

    occurrences.forEach((occurrence, ordinal) => {
      const modifier = disqualifyingModifier(occurrence, segments, modifiers);
      const verdict = modifier
        ? { promoted: false, reason: `technical modifier “${modifier}” within ${SCORING_CONFIG.contextualAliasModifierLookback} tokens` }
        : relationalCoFire(unit, occurrence, segments, aliasTokens, admissionDistinctiveShared);
      trace.push({
        alias,
        occurrence: ordinal,
        tokenIndex: occurrence.index,
        clause: occurrence.clause,
        promoted: verdict.promoted,
        reason: verdict.reason,
        // Named separately so a reader can tell the two layers apart at a
        // glance: the denylist fired, or the window test found nothing.
        disqualifiedBy: modifier ? 'technical-modifier' : (verdict.promoted ? null : 'no-local-evidence'),
      });
      if (verdict.promoted && !promotedHere) promotedHere = verdict.reason;
    });

    // One qualifying occurrence is enough to promote the alias for this entry,
    // and no number of disqualified occurrences can take that back.
    if (promotedHere) hits.push({ alias, aliasClass: 'contextual', because: promotedHere });
  }
  return { hits, trace };
}

function scoreEntry(unit, entry, idf) {
  const normalized = normalizeText(unit.text);
  // Signatures are sentence-local. A parent paragraph or speaker turn may
  // contain several independent claims, so sibling sentences cannot satisfy
  // one another's concept signatures.
  const signatureText = normalized;
  const configuredAdmissionGuard = CONCEPT_ADMISSION_GUARDS.get(entry.id);
  const admissionGuard = configuredAdmissionGuard
    ? { required: true, passed: configuredAdmissionGuard.test(normalized), label: configuredAdmissionGuard.label }
    : { required: false, passed: true, label: null };
  const signatureHits = CONCEPT_SIGNATURES
    .filter((signature) => signature.canonId === entry.id && signature.test(signatureText))
    .map((signature) => ({ label: signature.label, score: signature.score }));
  const queryTokens = unique(tokenize(unit.text));
  const queryDistinctive = unique(tokenize(unit.text, { keepGeneric: false }));
  const querySet = new Set(queryTokens);
  const entrySet = new Set(entry._tokens);
  const shared = queryTokens.filter((token) => entrySet.has(token));
  const distinctiveShared = queryDistinctive.filter((token) => entrySet.has(token));
  const admissionDistinctiveShared = distinctiveShared
    .filter((token) => !LOW_INFORMATION_MATCH_TERMS.has(token));

  const queryWeight = queryTokens.reduce((sum, token) => sum + (idf.get(token) || 1), 0) || 1;
  const entryWeight = entry._tokens.reduce((sum, token) => sum + (idf.get(token) || 1), 0) || 1;
  const sharedWeight = shared.reduce((sum, token) => sum + (idf.get(token) || 1), 0);
  const queryCoverage = sharedWeight / queryWeight;
  const canonCoverage = sharedWeight / entryWeight;

  const phraseHits = entry._phrases
    .filter((phrase) => phrase.includes(' ') && containsBoundedPhrase(normalized, phrase))
    .sort((a, b) => b.length - a.length);
  const aliasTokensPresent = aliasLookupTokens(normalized);
  const singleAliasHits = entry._phrases
    .filter((phrase) => !phrase.includes(' ')
      && phrase.length >= SCORING_CONFIG.minSingleAliasLength
      && aliasTokensPresent.has(phrase));
  const credibleSingleAliasHits = singleAliasHits
    .filter((alias) => tokenize(alias)
      .some((token) => !LOW_INFORMATION_MATCH_TERMS.has(token)));
  const { hits: promotedAliasHits, trace: contextualAliasTrace } = promotedAliases(
    unit, entry, normalized, admissionDistinctiveShared,
  );
  const phraseStrength = phraseHits.length
    ? clamp(SCORING_CONFIG.phraseBase + Math.min(
      SCORING_CONFIG.phraseLengthBonusCap,
      (phraseHits[0].split(' ').length - SCORING_CONFIG.phraseLengthBonusBaseWords)
        * SCORING_CONFIG.phraseLengthBonus,
    ))
    // Phrase-class treatment, at the phrase BASE and no length bonus: the bonus
    // rewards multi-word specificity, which a single token does not have. What
    // curation buys is admission, not extra weight.
    : promotedAliasHits.length
      ? SCORING_CONFIG.phraseBase
      : singleAliasHits.length
        ? SCORING_CONFIG.singleAliasStrength
        : 0;

  const distinctiveBoost = Math.min(
    SCORING_CONFIG.distinctiveBoostCap,
    distinctiveShared.length * SCORING_CONFIG.distinctiveBoostPerToken,
  );
  const titleTokens = tokenize(entry.title);
  const titleHits = titleTokens.filter((token) => querySet.has(token));
  const titleBoost = titleTokens.length
    ? Math.min(
      SCORING_CONFIG.titleBoostCap,
      (titleHits.length / titleTokens.length) * SCORING_CONFIG.titleBoostCap,
    )
    : 0;

  const signatureStrength = signatureHits.reduce(
    (strongest, signature) => Math.max(strongest, signature.score), 0,
  );
  const overlapStrength = (queryCoverage * SCORING_CONFIG.queryCoverageWeight)
    + (canonCoverage * SCORING_CONFIG.canonCoverageWeight)
    + distinctiveBoost
    + titleBoost;
  const preScore = Math.max(phraseStrength, signatureStrength, overlapStrength);
  let score = preScore;
  // Recorded, never read by a decision: the diagnostic trace has to be able to
  // say WHY a number is what it is, and reconstructing it after the fact from
  // the final score is guesswork.
  const penaltiesApplied = [];

  // The two OVERLAP penalties ask the same question — "is there anything here
  // beyond loose overlap?" — so a promoted alias answers it exactly as an exact
  // phrase does. Without this, phrase-class treatment would be granted and then
  // immediately taken back by the sparse-token penalty.
  const exactLexicalHit = phraseHits.length || promotedAliasHits.length;
  const weakGenericMatch = !exactLexicalHit
    && distinctiveShared.length < SCORING_CONFIG.weakGenericDistinctiveMax
    && shared.every((token) => GENERIC_TERMS.has(token));
  if (weakGenericMatch && !signatureHits.length) {
    score *= SCORING_CONFIG.weakGenericPenalty;
    penaltiesApplied.push({ code: 'weak-generic', factor: SCORING_CONFIG.weakGenericPenalty });
  }
  if (!exactLexicalHit && !signatureHits.length && shared.length < SCORING_CONFIG.sparseSharedMin) {
    score *= SCORING_CONFIG.sparseSharePenalty;
    penaltiesApplied.push({ code: 'sparse-shared-tokens', factor: SCORING_CONFIG.sparseSharePenalty });
  }
  /*
   * The third penalty asks a DIFFERENT question — is the passage long enough
   * for any score over it to mean something? — and until v2.6.11 it carried the
   * other two's exemption verbatim. Precision does not answer length, and on
   * short text the two correlate the wrong way: a three-word section heading
   * that IS the canon title matches at 100% by construction, so the exemption
   * fired hardest exactly where the passage was least able to support a
   * reading. Measured over the 22-source archived corpus: of 788 mapped
   * top-slots, 14 sat on units under this word count and 13 were units the
   * claim detector had already rejected — "Mate guarding" 0.701, "Sexual
   * Satisfaction" 0.718, both High, both matched against entries authored FROM
   * those very papers.
   *
   * Dropping the exemption outright was the first fix and it was too broad. It
   * failed ta-01, which asserts that a curated standalone alias carries its
   * concept on its own: "Hypergamy shapes modern dating." is four words, and it
   * is a CLAIM. That is the line, and the claim detector already draws it — a
   * label names a topic, a short assertion asserts something. So the exemption
   * survives, conditioned on the passage actually making a claim.
   *
   * Corpus effect, measured: zero of 1,188,070 swept pairs move. The exemption
   * had never once fired on a claim-like unit in the archived corpus, which is
   * why lab-threshold-sweep.mjs — which sweeps claims only — could not see this
   * defect at all. Everything it was doing, it was doing to headings.
   */
  const shortUnitPrecise = exactLexicalHit || signatureHits.length;
  if (unit.wordCount < SCORING_CONFIG.shortUnitWordCount
    && !(unit.isClaimLike && shortUnitPrecise)) {
    score *= SCORING_CONFIG.shortUnitPenalty;
    penaltiesApplied.push({ code: 'short-unit', factor: SCORING_CONFIG.shortUnitPenalty });
  }

  /*
   * The strongest single rejected reading decides. Scored per misreading rather
   * than against the union, so an entry that rejects three readings detects each
   * one as well as an entry that rejects only that one.
   */
  const misreadingSignals = entry._misreadingTokenSets.map((tokens, index) => ({
    share: tokens.filter((token) => querySet.has(token)).length / tokens.length,
    distinctiveHits: entry._misreadingDistinctiveSets[index]
      .filter((token) => querySet.has(token)),
  }));
  const misreadingOverlap = misreadingSignals.length
    ? Math.max(...misreadingSignals.map((signal) => signal.share))
    : 0;
  /*
   * "Asserts the rejected reading" needs BOTH: enough of one misreading's
   * vocabulary (the share threshold, unchanged) AND at least one token that
   * belongs to the misreading and not to the entry's own affirmative surfaces.
   * Share alone is topic evidence — a correct restatement of the entry clears
   * it by construction, which is the crash-test's 54-entry defect. The
   * strongest qualifying misreading speaks for the entry, mirroring the
   * per-misreading share above.
   */
  const assertedMisreading = misreadingSignals
    .filter((signal) => signal.share >= SCORING_CONFIG.misreadingContradictionShare
      && signal.distinctiveHits.length)
    .sort((a, b) => b.share - a.share)[0] || null;

  // Which surface supplied each shared token. Costs one set lookup per token
  // per surface and changes no score; the whole point is that stance can stop
  // guessing what an overlap meant.
  const surfaceTokens = {};
  MATCH_SURFACES.forEach((surface) => {
    const tokens = shared.filter((token) => entry._surfaceTokens[surface].has(token));
    if (tokens.length) surfaceTokens[surface] = tokens.slice(0, SCORING_CONFIG.maxSharedTokensReported);
  });
  const surfacesHit = MATCH_SURFACES.filter((surface) => surfaceTokens[surface]);

  return {
    score: round(clamp(score)),
    queryCoverage: round(queryCoverage),
    canonCoverage: round(canonCoverage),
    signatureHits,
    phraseHits: phraseHits.slice(0, SCORING_CONFIG.maxPhraseHitsReported),
    exactAliasHits: unique([
      ...promotedAliasHits.map((hit) => hit.alias),
      ...credibleSingleAliasHits,
    ]).slice(0, SCORING_CONFIG.maxAliasHitsReported),
    promotedAliasHits,
    // The per-occurrence ledger, including the occurrences that failed. Empty
    // for the overwhelming majority of entries, which have no contextual alias
    // at all, so it costs nothing to carry.
    contextualAliasTrace,
    sharedTokens: shared.slice(0, SCORING_CONFIG.maxSharedTokensReported),
    distinctiveShared: distinctiveShared.slice(0, SCORING_CONFIG.maxDistinctiveSharedReported),
    admissionDistinctiveShared: admissionDistinctiveShared.slice(0, SCORING_CONFIG.maxDistinctiveSharedReported),
    misreadingOverlap: round(misreadingOverlap),
    misreadingAsserted: Boolean(assertedMisreading),
    misreadingDistinctiveHits: assertedMisreading
      ? assertedMisreading.distinctiveHits.slice(0, SCORING_CONFIG.maxSharedTokensReported)
      : [],
    components: {
      phraseStrength: round(phraseStrength),
      signatureStrength: round(signatureStrength),
      overlapStrength: round(overlapStrength),
      queryCoverageContribution: round(queryCoverage * SCORING_CONFIG.queryCoverageWeight),
      canonCoverageContribution: round(canonCoverage * SCORING_CONFIG.canonCoverageWeight),
      distinctiveBoost: round(distinctiveBoost),
      titleBoost: round(titleBoost),
      beforePenalties: round(clamp(preScore)),
    },
    penalties: penaltiesApplied,
    matchSurfaces: {
      hit: surfacesHit,
      tokens: surfaceTokens,
      // "Only" means exactly that: no other surface contributed a single
      // shared token, so there is nothing else the overlap could be about.
      misreadingOnly: surfacesHit.length === 1 && surfacesHit[0] === 'commonMisreading',
      boundaryOnly: surfacesHit.length === 1 && surfacesHit[0] === 'boundaryCondition',
    },
    weakGenericMatch,
    admissionGuard,
  };
}

function confidenceFor(score, phraseHits) {
  if (score >= SCORING_CONFIG.confidenceHigh
    || (score >= SCORING_CONFIG.confidenceHighWithPhrase && phraseHits.length)) return 'High';
  if (score >= SCORING_CONFIG.confidenceMedium) return 'Medium';
  return 'Low';
}

/**
 * Spans the passage has put inside quotation marks.
 *
 * Double quotes are unambiguous. Straight single quotes are only treated as
 * delimiters when neither end sits inside a word, so "doesn't" is a contraction
 * and not the start of a quotation. The closing lookahead admits a dash because
 * normalizeText folds em dashes to "-", and a quote that ends against one is
 * still a quote.
 */
function quotedSpans(normalized) {
  const spans = [];
  let match;
  const double = /"([^"]+)"/g;
  while ((match = double.exec(normalized)) !== null) spans.push(match[1]);
  const single = /(?:^|[\s([])'([^']+)'(?=[\s.,;:!?)\]-]|$)/g;
  while ((match = single.exec(normalized)) !== null) spans.push(match[1]);
  return spans;
}

/**
 * The interrogative inversion that asserts rather than asks.
 *
 * "Is it not obvious that X?", "Isn't it true that X?" — the negator belongs to
 * the frame, not to X. Anchored to the start of the clause and paired with a
 * question mark by its only caller, because the same words mid-sentence
 * ("she asked whether it is not obvious") are doing something else entirely.
 * One frame, matched literally. It is not the beginning of question semantics.
 */
const RHETORICAL_INVERSION_CUE = new RegExp(
  '^(?:'
  + '(?:is|are|was|were|does|do|did)\\s+(?:it|that|this|there)\\s+not'
  + "|(?:isn't|aren't|wasn't|weren't|doesn't|don't|didn't)\\s+(?:it|that|this|there)"
  + ')\\b',
);

/**
 * The part of the assertion clause that comes AFTER the misreading it carries.
 *
 * "He says [misreading] and he is exactly right" — the endorsement is in the
 * same clause as the claim, and the only thing separating them is where the
 * claim stops. Located by the last word the clause shares with the entry's own
 * misreading surface, so a cue sitting BEFORE the claim — the matrix `false` in
 * "It is false that …: [misreading]" — is never mistaken for a comment on it.
 *
 * Returns '' when the clause ends with the misreading, which is the ordinary
 * case and means there is no in-clause comment to find.
 */
function afterMisreading(clauseText, wanted) {
  const words = String(clauseText || '').split(/\s+/).filter(Boolean);
  let last = -1;
  words.forEach((word, index) => {
    if (tokenize(word).some((token) => wanted.has(token))) last = index;
  });
  return last === -1 ? '' : words.slice(last + 1).join(' ');
}

/**
 * Where the misreading sits in the passage, and what the passage does around it.
 *
 * This is the whole of the v2.5.0 stance change. The old model asked two
 * sentence-wide yes/no questions — is there a negator anywhere, is there an
 * attribution verb anywhere — and could therefore not count negators, tell
 * which clause one belonged to, see quotation marks at all, or read what came
 * after an attribution. This locates the clause that carries the misreading and
 * then reads the rest of the sentence relative to it.
 *
 * No grammar is parsed and no part of speech is inferred. Clauses come from
 * punctuation, negators are counted, and the three follow-up cue sets are
 * matched only in clauses that come after the assertion. Every finding is
 * returned rather than consumed, so the label can be audited against the exact
 * span and cue that produced it.
 */
function misreadingScope(text, misreadingTokens) {
  const normalized = normalizeText(text);
  const segments = clauseSegments(normalizeForClauses(text));
  const clauses = segments.clauses.filter((clause) => clause.text);
  const wanted = new Set(misreadingTokens || []);

  // The clause that carries the misreading is the one that shares the most
  // tokens with it. Ties go to the earliest, which is the one a reader meets
  // first and the one later clauses are commenting on.
  let assertion = clauses[0] || { index: 0, text: normalized };
  let best = -1;
  clauses.forEach((clause) => {
    const overlap = unique(tokenize(clause.text)).filter((token) => wanted.has(token)).length;
    if (overlap > best) {
      best = overlap;
      assertion = clause;
    }
  });
  const assertionAt = clauses.indexOf(assertion);
  const following = assertionAt === -1 ? [] : clauses.slice(assertionAt + 1);
  const preceding = assertionAt === -1 ? [] : clauses.slice(0, assertionAt);

  // Negation is COUNTED inside the assertion clause. Two negators restore the
  // assertion; a negator in a trailing clause is negating that clause and has
  // nothing to do with this one.
  const negationCues = assertion.text.match(NEGATION_PARITY_CUES) || [];
  /*
   * One negator is discounted when it belongs to a rhetorical inversion rather
   * than to the proposition: "Is it not obvious that X?" asserts X, and
   * counting its `not` turns a plain assertion of a misreading into a denial of
   * it. New at v2.6.0.
   *
   * As narrow as the case: it needs BOTH the interrogative frame at the start
   * of the assertion clause AND a question mark on the passage. The declarative
   * "It is not obvious that X" keeps its negator and keeps denying, which is
   * the guard that stops this from becoming a rule about the word `not`. No
   * general question semantics are implied and none should be read in.
   */
  const rhetoricalInversion = /\?\s*$/.test(String(text || '').trim())
    && RHETORICAL_INVERSION_CUE.test(assertion.text);
  const negationCount = rhetoricalInversion
    ? Math.max(0, negationCues.length - 1)
    : negationCues.length;
  const negationParity = negationCount % 2 === 1 ? 'odd' : 'even';

  // Attribution governs forward, so it counts in the assertion clause or any
  // clause before it — never one after, which would be commentary instead.
  const attributionClause = [...preceding, assertion]
    .find((clause) => REPORTED_SPEECH_CUES.test(clause.text)) || null;
  const attributionCue = attributionClause
    ? (attributionClause.text.match(REPORTED_SPEECH_CUES) || [])[0] || null
    : null;

  // A quoted span reports the claim only when the span carries the claim: it
  // has to hold enough of the misreading AND a finite verb.
  const spans = quotedSpans(normalized);
  const quotedAssertion = spans.find((span) => {
    const shared = unique(tokenize(span)).filter((token) => wanted.has(token)).length;
    return shared >= SCORING_CONFIG.minQuotedAssertionTokens && QUOTED_ASSERTION_VERBS.test(span);
  }) || null;

  /*
   * The follow-up: what the passage does with the claim once it has stated it.
   *
   * Qualification outranks the other two, because a speaker who half-withdraws
   * a claim has taken a position that is neither an endorsement nor a denial.
   *
   * Two things changed at v2.6.0, both of them making the code do what the
   * v2.5.0 release said it already did:
   *
   *   - EXACTLY ONE CLAUSE is examined, the one immediately after the
   *     assertion. The old loop scanned every later clause until some cue
   *     fired, so "…; the episode then discusses the weather; the forecast is
   *     exactly right" credited the speaker with endorsing the misreading on
   *     the strength of a remark about the forecast. The cost is a rejection
   *     separated from its claim by an inert clause, which now reads as no
   *     follow-up — an under-claim, and frozen as a limit.
   *   - The assertion clause's OWN TAIL is read when no later clause exists to
   *     carry the comment: "He says X and he is exactly right" has no
   *     punctuation, so there was nothing for the old rule to look at. Scanned
   *     strictly AFTER the misreading's own span, so a cue that is part of the
   *     claim cannot be read as a verdict on it — which is also what keeps the
   *     colon-governed "It is false that …: X" from flipping by accident.
   */
  const cueIn = (source, clauseIndex) => {
    const qualification = source.match(QUALIFICATION_CUES);
    if (qualification) return { kind: 'qualification', cue: qualification[0], clause: clauseIndex };
    const rejection = source.match(REJECTION_CUES);
    if (rejection) return { kind: 'rejection', cue: rejection[0], clause: clauseIndex };
    const endorsement = source.match(ENDORSEMENT_CUES);
    if (endorsement) return { kind: 'endorsement', cue: endorsement[0], clause: clauseIndex };
    return null;
  };

  const [nextClause] = following;
  const followUp = (nextClause && cueIn(nextClause.text, nextClause.index))
    || cueIn(afterMisreading(assertion.text, wanted), assertion.index)
    || { kind: 'none', cue: null, clause: null };

  const excerpt = (value) => String(value || '').slice(0, SCORING_CONFIG.stanceScopeExcerptChars);
  return {
    reported: Boolean(attributionClause || quotedAssertion),
    denialParity: negationParity === 'odd',
    followUp,
    trace: {
      clauseCount: clauses.length,
      assertionClause: { index: assertion.index, excerpt: excerpt(assertion.text) },
      negation: {
        count: negationCount,
        parity: negationParity,
        cues: negationCues.slice(0, 4),
        // Published because it is the only way to tell a discounted inversion
        // from a sentence that simply had one fewer negator in it.
        rhetoricalInversion,
      },
      quotation: {
        spanCount: spans.length,
        assertionBearing: Boolean(quotedAssertion),
        excerpt: quotedAssertion ? excerpt(quotedAssertion) : null,
      },
      attribution: {
        detected: Boolean(attributionClause),
        cue: attributionCue,
        clause: attributionClause ? attributionClause.index : null,
      },
      followUp,
    },
  };
}

/*
 * The ground the GENERIC cue ladder reads (v2.6.20): the clause that carries
 * the match, plus the clause immediately after it — the same two-clause shape
 * `misreadingScope` has used since v2.5.0/v2.6.0. Until now the ladder read
 * the WHOLE passage, so "The weather forecast was wrong; the Conversion
 * Ladder separates exposure, attention, attraction, and selection." flipped
 * the ladder match Resembles → Challenges on wording about the weather
 * (GPT-5.6 review, finding 4). The assertion clause is the one sharing the
 * most retrieval tokens with the match; ties go to the earliest.
 *
 * Two costs, named: a verdict in a PRECEDING clause ("That is wrong: X…") no
 * longer reaches the claim — the same forward-only shape the misreading
 * branch's follow-up has; and EVIDENCE_CUES deliberately stay passage-wide,
 * because citing data is a property of the passage, not a verdict aimed at
 * one clause.
 */
function genericCueGround(text, anchorTokens) {
  const clauses = clauseSegments(normalizeForClauses(text)).clauses
    .filter((clause) => clause.text);
  if (clauses.length < 2) return normalizeText(text);
  const wanted = new Set(anchorTokens || []);
  let assertion = clauses[0];
  let best = -1;
  clauses.forEach((clause) => {
    const overlap = unique(tokenize(clause.text)).filter((token) => wanted.has(token)).length;
    if (overlap > best) {
      best = overlap;
      assertion = clause;
    }
  });
  const at = clauses.indexOf(assertion);
  return [assertion.text, clauses[at + 1]?.text].filter(Boolean).join(' ');
}

/*
 * A cue the passage has just denied is not that cue.
 *
 * The generic ladder tests four cue families as bare presence, and presence
 * cannot tell "true that" from "not true that". Measured on crafted input
 * against frameworks:conversion-ladder: "It is not true that <claim>" read
 * Supports, "Nothing here confirms that <claim>" read Supports, "It is not
 * consistent with <claim>" read Supports, and "<claim>; this is not wrong"
 * read Challenges. Four inversions — the label pointing at the opposite of
 * what the passage says, which is the most expensive error this instrument
 * can make.
 *
 * The window is three words, and it is deliberately short. A cue counts unless
 * a negator sits within three words in front of it, in the same ground. That
 * is the distance an English negator actually reaches without a parser ("is
 * not true", "does not appear to support", "nothing here confirms"); widening
 * it starts catching negations that belong to a different proposition, which
 * is the failure the documented-limits block already names for the misreading
 * branch and which no cue-list edit can fix.
 *
 * The negator inside a cue's own text is untouched by construction — the guard
 * reads only what precedes the MATCH, so `no evidence` and `not always`
 * still fire as the cues they are.
 */
/*
 * What defeats a cue: the passage denying it, or the passage supposing it.
 *
 * Negation was the first half (see above). The second half is hypothetical
 * framing, and it costs the same kind of error: measured against
 * frameworks:conversion-ladder, "If it were true that <claim>, dating apps
 * would be simpler" read Supports 0.668, "Suppose it is true that <claim>"
 * read Supports 0.700, and "Unless the study is wrong, <claim>" read
 * Supports 0.612. A supposition is not an endorsement, and a condition on a
 * cue is not that cue.
 */
const CUE_DEFEATER_BEFORE = /\b(?:not|never|nor|neither|nothing|nobody|none|hardly|scarcely|barely|cannot|without|fails? to|failed to|far from|if|unless|whether|suppose|supposing|assuming|imagine|hypothetically|were)\b(?:\s+\S+){0,2}\s*$/i;

function cueFires(ground, pattern) {
  const scan = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`);
  for (const hit of String(ground).matchAll(scan)) {
    if (!CUE_DEFEATER_BEFORE.test(ground.slice(0, hit.index))) return true;
  }
  return false;
}

/**
 * What the source is doing with the matched concept.
 *
 * The ordering below is the whole design. Entry-specific rulings come first
 * because they are hand-adjudicated. Misreading-surface overlap comes next,
 * BEFORE the generic cue ladder, because when a passage overlaps a reading the
 * canon explicitly rejects, the only remaining question is who is asserting it
 * — and that question is not answered by scanning for disagreement words. The
 * generic cues then handle everything else, and a boundary-only overlap is
 * caught at the end so a caveat can never pass as a resemblance.
 */
function stanceFor(unit, match) {
  const text = unit.text;
  const rawScore = match._rawScore;
  const surfaces = rawScore.matchSurfaces || { hit: [], tokens: {}, misreadingOnly: false, boundaryOnly: false };
  // Share of the misreading's vocabulary AND at least one token distinctive to
  // it (absent from every affirmative entry surface) — computed in scoring,
  // decided here. Share alone reads a correct restatement as the rejected
  // reading; see the red manifest (md/lab-stance-distinctive-red-manifest.md).
  const commonMisreading = rawScore.misreadingAsserted;
  // Clause-scoped from v2.5.0, and computed only when the misreading branch can
  // actually run. The two sentence-wide booleans are still derived and still
  // published, because they are what every previous export recorded and a
  // reader comparing two analyses needs to see the same fields — but no
  // decision reads them any more.
  const scope = commonMisreading ? misreadingScope(text, surfaces.tokens?.commonMisreading) : null;
  const reported = scope ? scope.reported : REPORTED_SPEECH_CUES.test(text);
  const denied = scope ? scope.denialParity : MISREADING_DENIAL_CUES.test(text);
  let label = 'Resembles';
  let rationale = 'The source and canon entry share distinctive wording, but wording alone cannot show whether they agree.';

  if (!unit.isClaimLike) {
    label = 'Context only';
    rationale = 'This passage supplies context or a question more than a testable claim.';
  } else if (match.canonId === 'lexicon:term-awalt-all-women-are-like-that'
    && AWALT_BLANKET_CUE.test(text)) {
    /*
     * Hand ruling, clause-scoped since v2.6.13 with the same machinery as the
     * misreading branch below it. The sentence-wide form stamped Contradicts
     * on the NEGATION of the blanket claim — "not an exceptionless rule that
     * every woman must obey" carried the same label as asserting the rule
     * (crash-test finding 3). The blanket phrase's own clause decides, through
     * the identical decision grammar: qualification, then reported speech,
     * then denial, then assertion.
     */
    const blanketPhrase = (text.match(AWALT_BLANKET_CUE) || [''])[0];
    const blanketScope = misreadingScope(text, unique(tokenize(blanketPhrase)));
    const { kind: blanketKind, cue: blanketCue } = blanketScope.followUp;
    if (blanketKind === 'qualification') {
      label = 'Challenges';
      rationale = `The source states the blanket all-women generalization and then withdraws part of it (“${blanketCue}”), which is a scope limit rather than a claim or a denial.`;
    } else if (blanketScope.reported) {
      if (blanketKind === 'endorsement') {
        label = 'Contradicts';
        rationale = `The passage relays someone else's blanket all-women claim and then adopts it (“${blanketCue}”), making the overreach the passage's own.`;
      } else if (blanketKind === 'rejection') {
        label = 'Supports';
        rationale = `The passage relays a blanket all-women claim and then rejects it (“${blanketCue}”), which is the correction the AWALT entry itself states.`;
      } else {
        label = 'Context only';
        rationale = 'The passage relays someone else\'s blanket all-women claim rather than asserting one; the overreach belongs to the person being quoted.';
      }
    } else if (blanketKind === 'rejection'
      || (blanketScope.denialParity && blanketKind !== 'endorsement')) {
      label = 'Supports';
      rationale = 'The source denies the blanket all-women generalization, which is the limit the AWALT entry itself states against individual variation.';
    } else {
      label = 'Contradicts';
      rationale = 'LE indexes AWALT as a blanket generalization that fails against individual variation; the source states that overreach directly.';
    }
  } else if (commonMisreading) {
    const { kind, cue } = scope.followUp;
    if (kind === 'qualification') {
      // Checked before everything else, including attribution: a speaker who
      // qualifies a claim has taken a position of their own on it, whoever
      // originally made it.
      label = 'Challenges';
      rationale = `The source states a reading this entry rejects and then withdraws part of it (“${cue}”), which is a scope limit rather than a claim or a denial.`;
    } else if (reported) {
      if (kind === 'endorsement') {
        label = 'Contradicts';
        rationale = `The passage relays someone else's version of this concept and then adopts it (“${cue}”). Endorsing a reported reading makes it the passage's own claim, and this entry explicitly rejects that reading.`;
      } else if (kind === 'rejection') {
        label = 'Supports';
        rationale = `The passage relays a reading this entry rejects and then rejects it too (“${cue}”), which is the correction the entry itself states.`;
      } else {
        label = 'Context only';
        rationale = 'The passage relays someone else\'s version of this concept rather than asserting one. The reading it reports is one the canon entry explicitly rejects, but that reading belongs to the person being quoted, not to this passage.';
      }
    } else if (kind === 'rejection' || (denied && kind !== 'endorsement')) {
      label = 'Supports';
      rationale = 'The source states the limit the canon entry states: it denies a reading this entry explicitly rejects.';
    } else {
      label = 'Contradicts';
      rationale = 'The source asserts a reading that the canon entry explicitly limits or rejects.';
    }
  } else {
    // Clause-scoped from v2.6.20: the four claim-directed cue families read
    // the assertion clause and its follow-up, not the whole passage. Evidence
    // register alone still reads passage-wide.
    /*
     * A question is not a verdict. "Is it true that <claim>?" and "It is true
     * that <claim>." reached this ladder as the same string once punctuation
     * was stripped, and both read Supports at 0.714 — the interrogative and
     * its own assertion, indistinguishable. The four claim-directed families
     * are withheld inside a question; EVIDENCE_CUES are not, because a
     * question can still cite a study and the citation is a property of the
     * passage. Rhetorical questions therefore under-claim rather than
     * over-claim, which is the direction this instrument prefers.
     */
    const interrogative = /\?/.test(String(unit?.text || ''));
    const cueGround = interrogative ? '' : genericCueGround(text, rawScore.sharedTokens);
    if (cueFires(cueGround, CONTRADICTION_CUES) && match.score >= SCORING_CONFIG.contradictionScoreFloor) {
      label = 'Challenges';
      rationale = 'The source uses explicit disagreement language around the matched concept.';
    } else if (cueFires(cueGround, CHALLENGE_CUES)) {
      label = 'Challenges';
      rationale = 'The source names an exception, dependency, or scope limit around the matched concept.';
    } else if (cueFires(cueGround, EXTENSION_CUES)) {
      label = 'Extends';
      rationale = 'The source proposes an additional mechanism, factor, or edge case around the matched concept.';
    } else if (cueFires(cueGround, SUPPORT_CUES) || EVIDENCE_CUES.test(text)) {
      label = 'Supports';
      rationale = 'The source presents the matched concept affirmatively and includes support or evidence language.';
    }
  }

  // A caveat is not the claim. If every shared token came from the entry's
  // boundary conditions and nowhere else, the source has landed on the scope
  // limit, which is a narrower and different thing than resembling the concept.
  if (label === 'Resembles' && surfaces.boundaryOnly) {
    label = 'Challenges';
    rationale = 'The overlap is entirely with this entry\'s boundary conditions and no other part of it, so the source engages the concept\'s scope limit rather than the concept.';
  }

  return {
    label,
    rationale,
    // The trace, not a second opinion: what the label was derived from, so a
    // reader who disagrees can see exactly which evidence produced it.
    evidence: {
      matchSurfaces: surfaces.hit,
      misreadingSurfaceOverlap: rawScore.misreadingOverlap,
      // The tokens that carried the "asserts the rejected reading" decision —
      // empty whenever the branch did not run, so a reader can see that a high
      // overlap alone no longer decides anything.
      misreadingDistinctiveHits: rawScore.misreadingDistinctiveHits || [],
      misreadingSurfaceOnly: surfaces.misreadingOnly,
      boundaryConditionOnly: surfaces.boundaryOnly,
      reportedSpeech: reported,
      denial: denied,
      // Which spans, cues, and scopes produced the label. Present only when the
      // misreading branch ran, because its scope machinery is the richest; the
      // generic cue ladder reads its own two-clause ground from v2.6.20
      // (genericCueGround) and publishes nothing here.
      scope: scope ? scope.trace : null,
    },
  };
}

function transparentWhy(rawScore, entry) {
  const reasons = [];
  if (rawScore.signatureHits.length) {
    reasons.push('Concept signature: ' + rawScore.signatureHits[0].label);
  }
  if (rawScore.phraseHits.length) {
    reasons.push(`Exact phrase: “${rawScore.phraseHits[0]}”`);
  }
  if (rawScore.exactAliasHits.length) {
    reasons.push(`Exact alias: “${rawScore.exactAliasHits[0]}”`);
  }
  (rawScore.promotedAliasHits || []).forEach((hit) => {
    reasons.push(`Typed alias “${hit.alias}” (${hit.aliasClass}): ${hit.because}`);
  });
  if (rawScore.distinctiveShared.length) {
    reasons.push(`Distinctive overlap: ${rawScore.distinctiveShared.slice(0, SCORING_CONFIG.maxWhyMatchedTokens).join(', ')}`);
  } else if (rawScore.sharedTokens.length) {
    reasons.push(`Keyword overlap: ${rawScore.sharedTokens.slice(0, SCORING_CONFIG.maxWhyMatchedTokens).join(', ')}`);
  }
  if (rawScore.matchSurfaces?.hit.length) {
    reasons.push(`Match surfaces: ${rawScore.matchSurfaces.hit
      .map((surface) => MATCH_SURFACE_LABELS[surface]).join(', ')}`);
  }
  if (entry.subcategory) reasons.push(`Canon context: ${entry.category} / ${entry.subcategory}`);
  if (rawScore.weakGenericMatch) reasons.push('Penalty: only generic dating language overlaps');
  if (!hasCredibleMatchEvidence(rawScore)) {
    reasons.push('Admission guard: no exact phrase, signature, or two distinctive shared concepts');
  }
  return reasons;
}

function publicMatch(entry, rawScore) {
  const score = rawScore.score;
  return {
    canonId: entry.id,
    title: entry.title,
    page: entry.page,
    anchor: entry.anchor,
    href: entry.href,
    category: entry.category,
    subcategory: entry.subcategory,
    synopsis: entry.synopsis,
    evidenceType: entry.evidenceType,
    confidence: confidenceFor(score, rawScore.phraseHits),
    score,
    whyMatched: transparentWhy(rawScore, entry),
    boundaryConditions: entry.boundaryConditions,
    commonMisreadings: entry.commonMisreadings,
    dependencies: entry.dependencies,
    related: entry.related,
    sourceLinks: entry.sourceLinks,
    pressureTests: entry.pressureTests,
    contextHelp: null,
    _rawScore: rawScore,
  };
}

/**
 * Every field a match publishes, in the order it publishes them.
 *
 * `alignment` and `why` are stance output, hung on credible matches only, which
 * is why a weak match legitimately carries nineteen of these twenty-one.
 */
export const PUBLIC_MATCH_FIELDS = Object.freeze([
  'canonId', 'title', 'page', 'anchor', 'href', 'category', 'subcategory', 'synopsis',
  'evidenceType', 'confidence', 'score', 'whyMatched', 'boundaryConditions',
  'commonMisreadings', 'dependencies', 'related', 'sourceLinks', 'pressureTests',
  'contextHelp', 'alignment', 'why',
]);

/**
 * A match as the outside world sees it, built from an ALLOWLIST.
 *
 * It used to be a denylist: drop anything whose name starts with an underscore.
 * That is a convention, not a boundary. It holds only for as long as every
 * working field anyone ever hangs on a candidate happens to be named for it,
 * and the export surface is exactly the wrong place to depend on a habit —
 * `_retrieval` reached an export once already, back when the strip was by name.
 *
 * Naming what goes out inverts the failure: a new field is invisible until
 * someone adds it here, which is a missing feature and gets noticed, instead of
 * shipping by default, which is a leak and does not. The recursive
 * no-underscore test stays as a backstop for the rest of the document.
 */
function publicShape(match) {
  return allowlisted(match, PUBLIC_MATCH_FIELDS);
}

/**
 * Every field a claim unit publishes, and every field its segment publishes.
 *
 * v2.4.2 put the match surface behind an allowlist because that is where a
 * working field had actually leaked. The depths ABOVE it stayed a denylist by
 * convention — `safeSegments` spread the whole segment and set `candidates` to
 * undefined, which leaves the key present, publishes whatever else retrieval
 * hung on the segment, and publishes the unit whole. The same argument applies
 * one level up: a boundary that depends on remembering to delete things fails
 * silently, and a boundary that names what goes out fails loudly.
 */
export const PUBLIC_UNIT_FIELDS = Object.freeze([
  'id', 'parentSegmentId', 'segmentIndex', 'sentenceIndex', 'text',
  'boundedContext', 'speaker', 'startTime', 'endTime', 'sourceBoundary',
  'wordCount', 'claimLikelihood', 'isClaimLike', 'machineClaimLike',
  'domainRelevance',
]);

export const PUBLIC_SEGMENT_FIELDS = Object.freeze([
  'unit', 'mapped', 'matches', 'weakMatches', 'weakBandTotal', 'ambiguity',
]);

function allowlisted(value, fields) {
  const shaped = {};
  for (const field of fields) {
    if (field in value) shaped[field] = value[field];
  }
  return shaped;
}

/** A segment as the outside world sees it, allowlisted at both depths. */
function publicSegment(result) {
  return {
    ...allowlisted(result, PUBLIC_SEGMENT_FIELDS),
    unit: allowlisted(result.unit, PUBLIC_UNIT_FIELDS),
    matches: result.matches.map(publicShape),
  };
}

function hasLocalConceptEvidence(candidate) {
  const raw = candidate._rawScore;
  return Boolean(
    raw.signatureHits.length
    || raw.phraseHits.length
    || raw.distinctiveShared.length
    || raw.sharedTokens.length >= SCORING_CONFIG.minLocalSharedTokens
  );
}

function hasCredibleMatchEvidence(rawScore) {
  if (rawScore.admissionGuard?.passed === false) return false;
  return Boolean(
    rawScore.signatureHits.length
    || rawScore.phraseHits.length
    || rawScore.exactAliasHits.length
    || rawScore.admissionDistinctiveShared.length >= SCORING_CONFIG.minAdmissionDistinctiveShared
  );
}

/**
 * Evidence a reader could verify by eye: the source used this entry's exact
 * words, or tripped one of its hand-written concept signatures. Distinct from
 * hasCredibleMatchEvidence, which also accepts accumulated distinctive overlap
 * — that is an inference, and inferences are allowed to lose a ranking contest.
 * An exact hit is not; losing one is losing a fact.
 */
function carriesExactEvidence(rawScore) {
  return Boolean(
    rawScore.signatureHits.length
    || rawScore.phraseHits.length
    || rawScore.exactAliasHits.length
  );
}

function isCredibleCandidate(candidate) {
  return candidate.score >= SCORING_CONFIG.minCredibleScore
    && hasCredibleMatchEvidence(candidate._rawScore);
}

function byScoreThenId(a, b) {
  return b.score - a.score || a.canonId.localeCompare(b.canonId);
}

/**
 * The canon entries the immediately preceding passage established on its own,
 * or null when no bounded-context bridge connects the two. Shared by retrieval
 * (so a context-eligible entry is retained) and by applyBoundedContext (so the
 * boost is granted on exactly the same footing).
 */
function bridgedCanonIds(result, previous) {
  const bridge = result?.unit?.boundedContext;
  if (!bridge || !previous) return null;
  if (result.unit.parentSegmentId !== previous.unit.parentSegmentId) return null;
  if (bridge.sourceUnitId !== previous.unit.id) return null;
  // Only locally credible evidence from the immediately preceding sentence may
  // help. Using the previous candidate's unboosted score prevents context from
  // cascading through a chain of elliptical sentences.
  return new Set(previous.candidates
    .filter((candidate) => isCredibleCandidate(candidate))
    .slice(0, SCORING_CONFIG.maxMatchesPerClaim)
    .map((candidate) => candidate.canonId));
}

/**
 * The working candidate set for one passage.
 *
 * Ranking answers "which entries most resemble this passage". It does not
 * answer "which entries did this passage actually name", and truncating the
 * ranked list conflates the two: an exact alias hit sitting at rank nine is not
 * a weak match, it is an invisible one, and nothing downstream — admission,
 * bounded context, stance, or a diagnostic trace — can reason about evidence
 * that was discarded before it arrived.
 *
 * So the working set is a union rather than a prefix: the top-ranked
 * candidates, plus every entry carrying exact evidence, plus the entries the
 * previous sentence already established and their declared relations, which are
 * the only ones bounded context can help.
 *
 * Retention is not credibility. Admission still runs on score plus evidence,
 * unchanged; the display caps still apply after this point. Widening this set
 * lets a decision be made about evidence that used to vanish silently — it does
 * not make that decision come out differently.
 */
function buildCandidateSet(unit, prepared, context = null) {
  const ranked = prepared.entries
    .map((entry) => publicMatch(entry, scoreEntry(unit, entry, prepared.idf)))
    .filter((match) => match.score >= SCORING_CONFIG.candidateScoreFloor)
    .sort(byScoreThenId);

  const cap = SCORING_CONFIG.maxCandidatesPerUnit;
  const bridged = context?.bridgedCanonIds || null;
  const working = [];

  // How many canon entries landed in the nearby band for this passage, counted
  // here because here is the only place the whole scored set exists. Two caps
  // stand between this number and the reader — retrieval cuts to the top eight
  // and maxWeakMatches cuts to three — so without it the display can say how
  // many nearby concepts it is SHOWING and not how many there are.
  //
  // Measured before bounded context, which is a bound rather than a
  // discrepancy: applyBoundedContext refuses to boost anything already below
  // minWeakScore, so it can promote an entry out of this band and never into
  // it. The count is an upper bound on the post-boost band and is exact
  // wherever no promotion happened, which is the overwhelming majority.
  const weakBandTotal = ranked.filter((match) => match.score >= SCORING_CONFIG.minWeakScore
    && match.score < SCORING_CONFIG.minCredibleScore).length;

  ranked.forEach((match, index) => {
    // Recorded on every candidate so a diagnostic trace can say what happened
    // to the ones that used to disappear here, and why this one did not.
    const retrieval = {
      rankAtRetrieval: index + 1,
      candidatesAboveFloor: ranked.length,
      weakBandTotal,
      truncationCap: cap,
    };
    if (index < cap) {
      working.push(Object.assign(match, { _retrieval: { ...retrieval, retainedBecause: 'top-ranked' } }));
      return;
    }
    if (carriesExactEvidence(match._rawScore)) {
      working.push(Object.assign(match, { _retrieval: { ...retrieval, retainedBecause: 'exact-evidence' } }));
      return;
    }
    const entry = context?.entriesById?.get(match.canonId);
    const contextEligible = Boolean(bridged && entry && (
      bridged.has(match.canonId)
      || entry.dependencies.some((dependency) => bridged.has(dependency))
      || entry.related.some((related) => bridged.has(related))
    ));
    if (contextEligible) {
      working.push(Object.assign(match, { _retrieval: { ...retrieval, retainedBecause: 'context-eligible' } }));
    }
  });

  return working.sort(byScoreThenId);
}

function applyBoundedContext(results, entriesById) {
  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    const bridge = result.unit.boundedContext;
    const previous = results[index - 1];
    const previousCanonIds = bridgedCanonIds(result, previous);
    if (!previousCanonIds) continue;

    result.candidates.forEach((candidate) => {
      const entry = entriesById.get(candidate.canonId);
      if (!entry) return;
      const localScore = candidate._rawScore.score;
      if (localScore < SCORING_CONFIG.minWeakScore || !hasLocalConceptEvidence(candidate)) return;

      let boost = 0;
      let relation = '';
      if (previousCanonIds.has(candidate.canonId)) {
        boost = SCORING_CONFIG.contextBoostSameConcept;
        relation = 'same canon concept';
      } else if (entry.dependencies.some((dependency) => previousCanonIds.has(dependency))) {
        boost = SCORING_CONFIG.contextBoostDependency;
        relation = 'declared dependency';
      } else if (entry.related.some((related) => previousCanonIds.has(related))) {
        boost = SCORING_CONFIG.contextBoostRelated;
        relation = 'declared related concept';
      }
      if (!boost) return;

      candidate.score = round(clamp(candidate.score + boost));
      candidate.contextHelp = {
        kind: bridge.kind,
        sourceUnitId: bridge.sourceUnitId,
        relation,
        boost,
        localScore,
        reason: bridge.reason,
      };
      candidate.whyMatched.push(
        `Bounded context help: ${relation} in the immediately preceding sentence (+${boost.toFixed(3)}; local score ${localScore.toFixed(3)})`,
      );
      candidate.confidence = confidenceFor(candidate.score, candidate._rawScore.phraseHits);
    });
    result.candidates.sort((a, b) => b.score - a.score || a.canonId.localeCompare(b.canonId));
  }
}

/*
 * The shapes a stated quantity takes in this corpus: the percent symbol, the
 * word in either register, a digit ratio, and a ratio spelled out in words.
 * One expression, used both to detect a quantity and to remove it before
 * asking whether the passage cites anything else.
 *
 * Built with `new RegExp` and reset before each use, because a `g` regex
 * carries `lastIndex` between calls and `.test()` would otherwise answer
 * differently on the same string depending on what was asked before it.
 */
const SPELLED_SMALL_NUMBER = '(?:one|two|three|four|five|six|seven|eight|nine|ten)';
const STATISTIC_SHAPES = new RegExp([
  '\\d+(?:\\.\\d+)?\\s*%',
  '\\b\\d+(?:\\.\\d+)?\\s*per\\s?cent\\w*',
  '\\b\\d+\\s+(?:out of|in)\\s+\\d+\\b',
  `\\b${SPELLED_SMALL_NUMBER}\\s+(?:out of|in)\\s+${SPELLED_SMALL_NUMBER}\\b`,
].join('|'), 'gi');

/** A `g` regex is stateful; every read of the shared one starts from zero. */
function statisticShapes() {
  STATISTIC_SHAPES.lastIndex = 0;
  return STATISTIC_SHAPES;
}

function classifyRiskFlags(text) {
  const flags = [];
  if (/\b(?:should|ought|deserve|wrong|immoral|good person|bad person|worthless)\b/i.test(text)) flags.push('moral claim');
  if (/\b(?:cause|causes|caused|because|leads? to|drives?|results? in)\b/i.test(text)) flags.push('causal claim');
  if (/\b(?:men|women|male|female|all men|all women)\b/i.test(text)) flags.push('gender generalization');
  if (/\b(?:i knew|my friend|one time|in my experience|someone i know|a guy i know)\b/i.test(text)) flags.push('anecdote');
  /*
   * A quantity is a quantity however it is spelled. The detector read the
   * percent SYMBOL and a digit ratio and nothing else, so a word-form
   * percentage and a spelled-out ratio raised no warning at all — 127
   * word-form percentages and 14 spelled ratios against 665 symbol forms in
   * the archived corpus, and the British-register sources are almost
   * entirely word form. `chooseDestination`, one function away, already
   * routes on the word.
   *
   * The strip inside the guard grows with the detector, for the reason it
   * existed: a bare quantity must not count as its own evidence that the
   * quantity is sourced.
   */
  if (statisticShapes().test(text) && !EVIDENCE_CUES.test(text.replace(statisticShapes(), ' '))) {
    flags.push('unsupported statistic');
  }
  return unique(flags);
}

function chooseDestination(unit, nearest) {
  const nearestCategory = normalizeText(nearest?.category || '');
  for (const [category, destination] of DESTINATION_BY_CATEGORY) {
    if (nearestCategory.includes(category)) return destination;
  }
  const text = normalizeText(unit.text);
  if (/\b(?:define|called|term|means)\b/.test(text)
    && unit.wordCount < SCORING_CONFIG.lexiconDestinationMaxWords) return 'Lexicon';
  if (/\b(?:percent|study|data|rate|survey|sample)\b/.test(text)) return 'Statistics';
  if (/\b(?:myth|is it true|claim|false|fact)\b/.test(text)) return 'Mythbuster';
  if (/\b(?:men|women|male|female|gender|sex difference)\b/.test(text)) return 'Gender Dynamics';
  if (/\b(?:looks|money|status|charm|exposure|smv)\b/.test(text)) return 'Five Levers';
  if (unit.wordCount > SCORING_CONFIG.deepDiveDestinationMinWords) return 'Deep Dive';
  return 'possible new page';
}

function makeResearchQuestion(unit, risks, destination) {
  const population = risks.includes('gender generalization')
    ? 'the stated male/female population'
    : 'the population and dating context being claimed';
  if (risks.includes('causal claim')) {
    return `In ${population}, does the proposed cause change the outcome after selection effects and plausible confounders are controlled?`;
  }
  if (risks.includes('unsupported statistic')) {
    return `What is the best replicated estimate for this quantity, in which population, period, and sampling frame?`;
  }
  if (destination === 'Lexicon') {
    return 'Can this term be defined with a stable boundary that distinguishes it from adjacent LE concepts?';
  }
  return `Under what population, stage, and market conditions does “${truncate(unit.text, SCORING_CONFIG.researchQuestionExcerptChars)}” hold, and how large is the effect?`;
}

function researchItemFor(result) {
  const nearest = result.candidates[0] || null;
  const risks = classifyRiskFlags(result.unit.text);
  const destination = chooseDestination(result.unit, nearest);
  const distinctiveTerms = unique(tokenize(result.unit.text, { keepGeneric: false }))
    .slice(0, SCORING_CONFIG.maxResearchSearchTerms);
  /*
   * A passage the gate kept only conservatively must say so in the payload,
   * not just on the screen: exports render the destination verbatim as the
   * item's heading, and a Kubernetes sentence was leaving here with
   * "Possible destination: Lexicon" attached (crash-test findings 11–13).
   * The screen's amber caution reads the same status, so the two surfaces
   * cannot disagree about which passages are doubted.
   */
  const uncertainDomain = result.unit.domainRelevance?.status === 'uncertain';
  const reason = !nearest
    ? 'No canon entry shared enough distinctive language for a defensible match.'
    : nearest.score < SCORING_CONFIG.minWeakScore
      ? 'The nearest canon concept shares only weak or generic wording.'
      : 'A nearby concept exists, but the shared wording is too weak to call it a match.';
  const searchTerms = unique([
    ...distinctiveTerms,
    nearest?.title,
    risks.includes('causal claim') ? 'longitudinal study confounders' : 'systematic review',
    risks.includes('gender generalization') ? 'sex differences effect size overlap' : null,
  ]).filter(Boolean);
  return {
    id: `rq-${fnv1a(result.unit.id)}`,
    segmentId: result.unit.id,
    parentSegmentId: result.unit.parentSegmentId,
    location: {
      segmentIndex: result.unit.segmentIndex,
      speaker: result.unit.speaker,
      startTime: result.unit.startTime,
      endTime: result.unit.endTime,
    },
    excerpt: result.unit.text,
    whyUnmapped: reason,
    nearestConcepts: result.candidates.slice(0, SCORING_CONFIG.maxNearestConcepts).map((candidate) => ({
      canonId: candidate.canonId,
      title: candidate.title,
      href: candidate.href,
      score: candidate.score,
      confidence: candidate.confidence,
    })),
    /*
     * What the top-three slice above is a slice OF.
     *
     * `maxNearestConcepts` cuts to three behind a retrieval cut to
     * `maxCandidatesPerUnit`, and neither was disclosed: measured across the
     * 21-source archive, 1,607 of 1,617 research items (99.4%) sit at the cap
     * with no denominator. Same defect the ledger carried until v2.6.9, one
     * surface over.
     *
     * `scoredConceptTotal` is the denominator and `nearbyBandTotal` is NOT.
     * The band was the obvious choice — it is what the ledger names — and the
     * census says it would reintroduce the exact defect it fixed: the band sits
     * BELOW the shown count on 687 of 1,617 items and is ZERO on 197 of them,
     * because `nearestConcepts` is the top of the candidate set rather than the
     * band. Two of those 197 display three concepts scoring 0.61 that failed
     * ADMISSION, so they are above the credible line and outside a band defined
     * as [minWeakScore, minCredibleScore). "3 of 0 in the nearby band" is a
     * denominator under its numerator.
     *
     * `candidatesAboveFloor` is safe by measurement, not by argument: >= the
     * shown count on all 1,617 items, 0 violations, never zero. The band is
     * still published, as a named SUBSET of the scored set rather than as the
     * denominator of the list.
     */
    scoredConceptTotal: result.candidates[0]?._retrieval?.candidatesAboveFloor ?? 0,
    nearbyBandTotal: result.weakBandTotal ?? 0,
    suggestedDestination: uncertainDomain
      ? 'maybe nowhere — this may not be a relationship claim'
      : destination,
    empiricalQuestion: makeResearchQuestion(result.unit, risks, destination),
    suggestedSearchTerms: searchTerms,
    falsifier: risks.includes('causal claim')
      ? 'A well-powered design that removes the association after temporal order, selection, and confounders are addressed.'
      : `Reliable evidence showing the claim does not generalize beyond the source's anecdote, sample, or stated context.`,
    riskFlags: risks.length ? risks : ['unsupported assertion'],
    status: 'Research candidate — not LE doctrine',
  };
}

function groupResearchItems(items) {
  const groups = new Map();
  items.forEach((item) => {
    const leadingRisk = item.riskFlags[0] || 'unsupported assertion';
    const key = `${item.suggestedDestination}|${leadingRisk}`;
    if (!groups.has(key)) {
      groups.set(key, {
        id: `rqg-${fnv1a(key)}`,
        title: `${item.suggestedDestination}: ${leadingRisk}`,
        suggestedDestination: item.suggestedDestination,
        primaryRisk: leadingRisk,
        itemIds: [],
      });
    }
    groups.get(key).itemIds.push(item.id);
  });
  return [...groups.values()].sort((a, b) =>
    b.itemIds.length - a.itemIds.length || a.title.localeCompare(b.title));
}

function evidenceSupplied(text) {
  if (EVIDENCE_CUES.test(text) && /\b(?:doi|sample|study|data|survey|experiment|meta-analysis)\b/i.test(text)) {
    return 'Evidence is referenced, but the Lab has not verified its design or citation.';
  }
  if (EVIDENCE_CUES.test(text)) return 'A number or evidence cue appears, but no source was verified by the local engine.';
  return 'No supporting evidence is visible in this excerpt.';
}

function pressureForResult(result) {
  const primary = result.matches[0];
  if (!primary) return [];
  const triggered = PRESSURE_PATTERNS.filter((pattern) => pattern.test(result.unit.text));
  const stancePressure = ['Challenges', 'Contradicts', 'Extends'].includes(primary.alignment.label);
  if (!triggered.length && !stancePressure) return [];

  const patterns = triggered.length ? triggered : [{
    id: `stance-${primary.alignment.label.toLowerCase()}`,
    title: `${primary.alignment.label} claim needs an explicit boundary test`,
    severity: primary.alignment.label === 'Contradicts' ? 3 : 2,
    risk: `${primary.alignment.label.toLowerCase()} claim`,
    strain: primary.pressureTests[0] || 'Move the claim to the strongest counterexample or outside the canon entry’s stated scope.',
    evidence: 'Evidence that directly compares the source claim with the canon rule under the same population, stage, and context.',
  }];

  return patterns.map((pattern) => {
    const hasBoundary = primary.boundaryConditions.length > 0;
    const weakMap = primary.score < SCORING_CONFIG.weakMapScore;
    const tensionType = weakMap
      ? 'Genuinely unmapped territory'
      : triggered.length
        ? 'Likely source overreach'
        : 'Possible LE limitation';
    return {
      id: `pt-${fnv1a(`${result.unit.id}|${primary.canonId}|${pattern.id}`)}`,
      segmentId: result.unit.id,
      canonId: primary.canonId,
      priority: pattern.severity + (primary.score >= SCORING_CONFIG.pressurePriorityScoreFloor ? 1 : 0),
      failureMode: pattern.title,
      riskFlag: pattern.risk,
      sourceExcerpt: result.unit.text,
      canonRule: {
        title: primary.title,
        synopsis: primary.synopsis,
        href: primary.href,
        evidenceType: primary.evidenceType,
      },
      boundaryConditions: hasBoundary
        ? primary.boundaryConditions
        : ['No explicit boundary condition was indexed; that absence is itself a research prompt, not proof of universality.'],
      strainScenario: primary.pressureTests[0] || pattern.strain,
      evidenceThatWouldChangeConclusion: pattern.evidence,
      inputEvidenceAssessment: evidenceSupplied(result.unit.text),
      tensionType,
      interpretation: tensionType === 'Likely source overreach'
        ? 'The source wording outruns the matched rule or its uncertainty.'
        : tensionType === 'Possible LE limitation'
          ? 'The source may identify a boundary or case the indexed rule does not yet resolve.'
          : 'The nearest rule is too weak a fit to absorb this claim honestly.',
    };
  });
}

function summarizeDistribution(items, key) {
  const counts = new Map();
  items.forEach((item) => {
    const value = String(item[key] || 'Unspecified');
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  const denominator = items.length || 1;
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, sharePct: percentage(count, denominator) }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function strongestMatches(mappedResults) {
  const aggregate = new Map();
  mappedResults.forEach((result) => {
    result.matches.forEach((match, rank) => {
      if (!aggregate.has(match.canonId)) {
        aggregate.set(match.canonId, {
          canonId: match.canonId,
          title: match.title,
          href: match.href,
          category: match.category,
          subcategory: match.subcategory,
          synopsis: match.synopsis,
          evidenceType: match.evidenceType,
          sourceLinks: match.sourceLinks,
          bestScore: match.score,
          confidence: match.confidence,
          matchedSegmentIds: [],
          excerpts: [],
          primaryCount: 0,
        });
      }
      const summary = aggregate.get(match.canonId);
      summary.bestScore = Math.max(summary.bestScore, match.score);
      summary.confidence = confidenceFor(summary.bestScore, match._rawScore?.phraseHits || []);
      summary.matchedSegmentIds.push(result.unit.id);
      if (summary.excerpts.length < SCORING_CONFIG.maxStrongestMatchExcerpts) {
        summary.excerpts.push(result.unit.text);
      }
      if (rank === 0) summary.primaryCount += 1;
    });
  });
  return [...aggregate.values()]
    .map((entry) => ({
      ...entry,
      matchedSegmentIds: unique(entry.matchedSegmentIds),
      matchCount: unique(entry.matchedSegmentIds).length,
      bestScore: round(entry.bestScore),
    }))
    .sort((a, b) =>
      b.primaryCount - a.primaryCount || b.bestScore - a.bestScore || a.title.localeCompare(b.title))
    .slice(0, SCORING_CONFIG.maxStrongestMatches);
}

/**
 * The self-describing stamp carried by every export. It names the code that
 * produced the analysis (analyzer release, schema, mode, scoring-config hash)
 * and the canon snapshot it was run against (index version + generation time),
 * so an export can be reproduced without reference to the session that made it.
 */
/*
 * ---------------------------------------------------------------------------
 * Diagnostic trace — the Pass B adapter boundary.
 * ---------------------------------------------------------------------------
 * Opt-in, off by default, and deliberately NOT part of the analysis contract:
 * a normal export stays exactly as compact as it was, and nothing in the Lab UI
 * reads this. It exists so a feedback exporter can see what the analyzer saw
 * BEFORE display caps — the whole working candidate set per claim unit, with
 * the score decomposed, the penalties named, the evidence surfaces attributed,
 * the admission outcome, any context assistance, and each candidate's rank and
 * truncation fate.
 *
 * Contract, so a consumer can depend on it:
 *   analyzeDocument(doc, canon, { diagnostics: true }) -> result.diagnostics
 *   analyzeDocument(doc, canon, { diagnostics: { segmentIds: [id] } })
 *     -> the same trace covering those claim units only, with scope saying so.
 *   omit the option and the key is absent, not empty.
 *   diagnostics.schemaVersion is versioned independently of the analysis
 *   schema, because the trace is an internal view and is expected to churn
 *   faster than the published one.
 * Everything under diagnostics is derived. It never feeds a decision, so
 * turning it on cannot change an analysis — the same document analyzed with
 * and without it produces the same matches, scores, and stances.
 */
export const DIAGNOSTICS_SCHEMA_VERSION = 'le-lab.diagnostics/1.1';

/*
 * Two independent fnv1a passes over the same string, seeded differently and
 * concatenated. One 32-bit hash is fine for a cache key and too narrow for an
 * identity claim; this is not cryptographic either, and nothing here defends
 * against a determined forger with the analyzer in hand. It defends against the
 * accident and the mix-up: a trace pasted from the wrong run, a stale cache, a
 * file assembled by something that did not read the same document.
 */
function wideHash(value) {
  const text = String(value);
  let a = 0x811c9dc5;
  let b = 0x9e3779b9;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    a = Math.imul(a ^ code, 0x01000193);
    b = Math.imul(b ^ (code + index), 0x85ebca6b);
  }
  return `${(a >>> 0).toString(36)}${(b >>> 0).toString(36)}`;
}

/**
 * The canonical signature of one published claim-unit row: what the ledger
 * shows, and nothing else.
 *
 * Exported because two different modules have to agree on it byte for byte —
 * the analyzer stamps it onto each diagnostic entry, and the feedback exporter
 * recomputes it from the published analysis to check that the trace in hand
 * describes the row being flagged. A second implementation of this function
 * anywhere would be a second opinion about what "the same row" means, and the
 * whole point is that there is only one.
 */
export function claimUnitRowDigest(row) {
  const matches = (row?.matches || []).map((match) =>
    [match.canonId, match.score, match.alignment?.label ?? '', match.confidence ?? ''].join('~'));
  const weak = (row?.weakMatches || []).map((match) => [match.canonId, match.score].join('~'));
  return wideHash([
    row?.unit?.id ?? '',
    row?.mapped ? 'mapped' : 'unmapped',
    matches.join('|'),
    weak.join('|'),
  ].join('::'));
}

/*
 * What the trace was produced FROM, as opposed to what produced it.
 *
 * The build fields — analyzer version, schema, scoring hash — say which engine
 * ran. They say nothing about which document ran through it, which is why a
 * trace of one analysis satisfied every check a consumer could make against a
 * different analysis on the same build. These three close that:
 *
 *   analysisId        the analysis this trace belongs to, and the analysis
 *                     publishes the same value, so a consumer can VERIFY it.
 *   canonSnapshotHash the lexical surface of the canon actually loaded, not the
 *                     version string it claims. A substituted index keeps the
 *                     version and moves this.
 *   inputDigest       the analyzed text and the overrides applied to it.
 *
 * Only analysisId is checkable against the published analysis; the other two
 * are provenance a human or a later tool can compare across files, and the
 * exporter does not pretend otherwise.
 */
function canonSnapshotHash(prepared) {
  return wideHash(prepared.entries.map((entry) => `${entry.id}#${entry._normalized}`).join('\n'));
}

function inputDigest(document, domainOverrides) {
  const overrides = [...domainOverrides.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([unitId, action]) => `${unitId}=${action}`)
    .join(',');
  const text = (document.segments || []).map((segment) => segment.text).join('\n');
  return wideHash(`${document.id || ''}|${overrides}|${text}`);
}

/**
 * What happened to this candidate on the way to the ledger. One value.
 *
 * It replaces a boolean that was computed from rank alone and therefore said
 * "survived truncation ON EVIDENCE" about candidates the union had kept on
 * CONTEXT — two different retrieval rules, reported as one, on rows where the
 * whole point of reading a trace is to tell them apart.
 *
 * The order below IS the definition: each test is reached only when the ones
 * above it did not apply, so the value names the FIRST thing that decided this
 * candidate's visibility. Retention comes first because it is the fact that
 * surprises: a candidate past the prefix cut would not have existed at all
 * before v2.4.0's union, so how it got onto the ledger is more informative than
 * which list it landed in.
 *
 * The other axis is not thrown away for that. `retainedAfterPrefixCut` and
 * `retainedBecause` stay on every candidate, so a row that is both cap-hidden
 * and union-retained still reports both, and no count has to be taken from this
 * enum to be complete.
 */
function candidateFate(candidate, display) {
  const retrieval = candidate._retrieval || {};
  const cap = retrieval.truncationCap ?? SCORING_CONFIG.maxCandidatesPerUnit;
  const displayed = display !== 'not-displayed';
  if ((retrieval.rankAtRetrieval || 0) > cap && displayed) return 'retained-after-prefix-cut';
  if (candidate.score < SCORING_CONFIG.minWeakScore) return 'below-weak-threshold';
  const credible = isCredibleCandidate(candidate);
  if (!displayed) return credible ? 'credible-cap' : 'weak-cap';
  // Above the weak floor, displayed, and not credible: the admission guard is
  // what kept it out of the match list, not a cap and not a threshold.
  if (!credible) return 'failed-admission';
  return 'displayed';
}

function diagnosticCandidate(candidate, displayedIds, weakIds, rank) {
  const raw = candidate._rawScore;
  const retrieval = candidate._retrieval || {};
  const display = displayedIds.has(candidate.canonId)
    ? 'match'
    : weakIds.has(candidate.canonId) ? 'weak-match' : 'not-displayed';
  return {
    canonId: candidate.canonId,
    title: candidate.title,
    rank,
    rankAtRetrieval: retrieval.rankAtRetrieval ?? null,
    candidatesAboveFloor: retrieval.candidatesAboveFloor ?? null,
    fate: candidateFate(candidate, display),
    truncationFate: {
      cap: retrieval.truncationCap ?? SCORING_CONFIG.maxCandidatesPerUnit,
      retainedBecause: retrieval.retainedBecause || 'top-ranked',
      // The pre-union analyzer would have discarded this candidate before
      // anything could look at it. WHY it was kept is retainedBecause's job:
      // exact-evidence and context-eligible are different rules and this field
      // deliberately does not guess between them.
      retainedAfterPrefixCut: (retrieval.rankAtRetrieval || 0)
        > (retrieval.truncationCap ?? SCORING_CONFIG.maxCandidatesPerUnit),
    },
    score: candidate.score,
    localScore: raw.score,
    components: raw.components,
    penalties: raw.penalties,
    evidence: {
      signatureHits: raw.signatureHits,
      phraseHits: raw.phraseHits,
      exactAliasHits: raw.exactAliasHits,
      promotedAliasHits: raw.promotedAliasHits,
      distinctiveShared: raw.distinctiveShared,
      admissionDistinctiveShared: raw.admissionDistinctiveShared,
      misreadingOverlap: raw.misreadingOverlap,
      misreadingAsserted: raw.misreadingAsserted,
      misreadingDistinctiveHits: raw.misreadingDistinctiveHits,
    },
    matchSurfaces: raw.matchSurfaces,
    admission: {
      credible: isCredibleCandidate(candidate),
      hasCredibleEvidence: hasCredibleMatchEvidence(raw),
      clearsCredibleScore: candidate.score >= SCORING_CONFIG.minCredibleScore,
      clearsWeakScore: candidate.score >= SCORING_CONFIG.minWeakScore,
      semanticGuard: raw.admissionGuard,
    },
    contextAssistance: candidate.contextHelp,
    display,
    confidence: candidate.confidence,
    alignment: candidate.alignment || null,
  };
}

/*
 * SCOPE. The trace is the entire pre-display candidate set for a passage, and
 * on a long alias-dense source that is megabytes for the document — built,
 * structured-cloned out of the worker, and held, for a session that in most
 * cases flags nothing at all. Analysis itself is unscoped and always was: every
 * passage is scored regardless, because bounded context makes each passage's
 * result depend on its predecessor. What is scoped is the trace ASSEMBLY, which
 * is where the megabytes are.
 *
 *   diagnostics: true                      the whole document — CLI, fixtures, tests
 *   diagnostics: { segmentIds: [...] }     those claim units only — the flag flow
 *
 * The scope travels in the payload, so a consumer that finds one unit in a
 * trace can tell "this is all there is" from "this is all that was asked for".
 */
function diagnosticScope(option) {
  const requested = Array.isArray(option?.segmentIds)
    ? [...new Set(option.segmentIds.filter((id) => typeof id === 'string' && id))]
    : null;
  return requested?.length ? { scope: 'claim-units', requested } : { scope: 'document', requested: null };
}

function buildDiagnostics(segmentResults, identity, option) {
  const { scope, requested } = diagnosticScope(option);
  const wanted = requested ? new Set(requested) : null;
  const traced = wanted
    ? segmentResults.filter((result) => wanted.has(result.unit.id))
    : segmentResults;
  return {
    schemaVersion: DIAGNOSTICS_SCHEMA_VERSION,
    note: 'Internal analyzer trace, opt-in. Shows the working candidate set before display caps, so a reviewer can see evidence the analysis did not surface. Derived only: enabling it does not change any analysis output.',
    scoringConfigHash: SCORING_CONFIG_HASH,
    analysisId: identity.analysisId,
    canonSnapshotHash: identity.canonSnapshotHash,
    inputDigest: identity.inputDigest,
    scope,
    requestedSegmentIds: requested,
    analyzedClaimUnitCount: segmentResults.length,
    claimUnits: traced.map((result) => {
      const displayedIds = new Set(result.matches.map((match) => match.canonId));
      const weakIds = new Set(result.weakMatches.map((match) => match.canonId));
      return {
        segmentId: result.unit.id,
        parentSegmentId: result.unit.parentSegmentId,
        excerpt: result.unit.text,
        wordCount: result.unit.wordCount,
        isClaimLike: result.unit.isClaimLike,
        mapped: result.mapped,
        // Binds this entry to the row the analysis published for the same unit.
        // It does not certify the candidate list below it — that is checked
        // structurally, by rebuilding the row from these candidates.
        unitDigest: claimUnitRowDigest(result),
        domainRelevance: {
          status: result.unit.domainRelevance.status,
          reasonCode: result.unit.domainRelevance.reasonCode,
          score: result.unit.domainRelevance.score,
          frames: Object.fromEntries(Object.entries(result.unit.domainRelevance.frames || {})
            .map(([frame, summary]) => [frame, { detected: summary.detected, score: summary.score }])),
        },
        boundedContext: result.unit.boundedContext,
        candidates: result.candidates.map((candidate, index) =>
          diagnosticCandidate(candidate, displayedIds, weakIds, index + 1)),
      };
    }),
  };
}

function buildProvenance(prepared, identity = null) {
  return {
    analyzer: {
      version: ANALYZER_VERSION,
      schemaVersion: ANALYSIS_SCHEMA_VERSION,
      researchQueueSchemaVersion: RESEARCH_QUEUE_SCHEMA_VERSION,
      mode: ANALYSIS_MODE.id,
      scoringConfigHash: SCORING_CONFIG_HASH,
    },
    canonIndex: {
      schemaVersion: prepared.schemaVersion,
      indexVersion: prepared.indexVersion,
      generatedAt: prepared.generatedAt,
    },
    /*
     * WHICH canon and WHICH input, not just which engine. New at
     * le-lab.analysis/2.5, and the point of adding them here is that the
     * diagnostic trace has published the same two values since v2.4.2 with
     * nothing to check them against — provenance a reader could compare across
     * files by hand, but no consumer could verify. Published on the analysis,
     * they become checkable: a trace whose canonSnapshotHash or inputDigest
     * disagrees with its analysis was produced from a different canon or a
     * different document, whatever version string it carries.
     */
    identity: identity ? {
      canonSnapshotHash: identity.canonSnapshotHash,
      inputDigest: identity.inputDigest,
    } : null,
  };
}

function indexMetadata(prepared, original) {
  const pages = prepared.sourcePages;
  const sourceCount = original?.stats?.sourceCount
    ?? (Array.isArray(pages) ? pages.length : new Set(prepared.entries.map((entry) => entry.page)).size);
  return {
    schemaVersion: prepared.schemaVersion,
    version: prepared.indexVersion,
    generatedAt: prepared.generatedAt,
    conceptCount: original?.stats?.conceptCount ?? prepared.entries.length,
    sourceCount,
  };
}

function validateDocumentSize(document) {
  const characters = document.segments.reduce((sum, segment) => sum + String(segment.text || '').length, 0);
  if (!characters) throw new Error('There is no analyzable text in this source.');
  if (characters > SCORING_CONFIG.maxAnalysisCharacters) {
    throw new Error(`This transcript contains ${characters.toLocaleString()} characters; the on-device limit is ${SCORING_CONFIG.maxAnalysisCharacters.toLocaleString()}. Split it into parts and try again.`);
  }
  return characters;
}

export async function analyzeDocument(document, canonIndex, options = {}) {
  const onProgress = typeof options.onProgress === 'function' ? options.onProgress : () => {};
  const isCancelled = typeof options.isCancelled === 'function' ? options.isCancelled : () => false;
  const characters = validateDocumentSize(document);
  onProgress({ phase: 'segmenting', value: 0.08, message: 'Classifying relationship-domain passages' });
  const prepared = prepareCanonIndex(canonIndex);
  const detectedUnits = detectClaimUnits(document);
  if (!detectedUnits.length) throw new Error('The extractor found text, but no analyzable passages.');
  const domainOverrides = normalizeDomainOverrides(options.domainOverrides);
  const classifiedUnits = classifyDomainRelevance(
    detectedUnits, domainOverrides, canonAdmissionSurfaces(prepared),
  );
  const detectedUnitIds = new Set(detectedUnits.map((unit) => unit.id));
  const appliedOverrides = [...domainOverrides.entries()]
    .filter(([unitId]) => detectedUnitIds.has(unitId))
    .map(([segmentId, action]) => ({ segmentId, action }));
  const unmatchedOverrideIds = [...domainOverrides.keys()]
    .filter((unitId) => !detectedUnitIds.has(unitId));
  const units = classifiedUnits.filter((unit) => unit.domainRelevance.status !== 'irrelevant');
  const ignoredUnits = classifiedUnits.filter((unit) => unit.domainRelevance.status === 'irrelevant');
  const relevantUnits = classifiedUnits.filter((unit) => unit.domainRelevance.status === 'relevant');
  const uncertainUnits = classifiedUnits.filter((unit) => unit.domainRelevance.status === 'uncertain');
  const ignoredWords = ignoredUnits.reduce((sum, unit) => sum + unit.wordCount, 0);
  if (isCancelled()) throw new DOMException('Analysis cancelled', 'AbortError');

  const entriesById = new Map(prepared.entries.map((entry) => [entry.id, entry]));
  const candidatesByUnit = [];
  for (let unitIndex = 0; unitIndex < units.length; unitIndex += 1) {
    const unit = units[unitIndex];
    // Retrieval is sequential, so the previous passage's own conclusions are
    // already available and the entries bounded context could reach are known
    // before the set is cut rather than after.
    const previous = candidatesByUnit[candidatesByUnit.length - 1];
    const candidates = buildCandidateSet(unit, prepared, {
      entriesById,
      bridgedCanonIds: bridgedCanonIds({ unit }, previous),
    });
    candidatesByUnit.push({ unit, candidates });
    if (unitIndex % 20 === 0) {
      onProgress({
        phase: 'retrieving',
        value: 0.12 + (unitIndex / units.length) * 0.48,
        message: `Comparing passage ${unitIndex + 1} of ${units.length}`,
      });
      // A micro-yield keeps main-thread fallback cancellable; workers simply
      // pay a negligible task hop.
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (isCancelled()) throw new DOMException('Analysis cancelled', 'AbortError');
    }
  }

  applyBoundedContext(candidatesByUnit, entriesById);
  onProgress({ phase: 'evaluating', value: 0.66, message: 'Evaluating stance and confidence' });

  const segmentResults = candidatesByUnit.map(({ unit, candidates }) => {
    const credible = candidates
      .filter((candidate) => isCredibleCandidate(candidate))
      .slice(0, SCORING_CONFIG.maxMatchesPerClaim);
    credible.forEach((match) => {
      match.alignment = stanceFor(unit, match);
      match.why = match.alignment.rationale;
    });
    const weak = candidates
      .filter((candidate) => candidate.score >= SCORING_CONFIG.minWeakScore && !isCredibleCandidate(candidate))
      .slice(0, SCORING_CONFIG.maxWeakMatches);
    const ambiguity = credible.length > 1
      && (credible[0].score - credible[1].score) < SCORING_CONFIG.ambiguityScoreGap
      ? `Two canon entries are separated by only ${round(credible[0].score - credible[1].score, SCORING_CONFIG.ambiguityGapPrecision)} confidence points.`
      : credible[0]?.confidence === 'Low'
        ? 'The strongest credible match is low confidence; inspect the overlap before relying on it.'
        : null;
    return {
      unit,
      mapped: credible.length > 0,
      matches: credible,
      weakMatches: weak.map(publicShape),
      // A per-unit fact carried on every candidate, so which one it is read off
      // does not matter. Zero when nothing was retrieved, which is also when
      // the weak list is empty and there is nothing to be honest about.
      weakBandTotal: candidates[0]?._retrieval?.weakBandTotal ?? 0,
      candidates,
      ambiguity,
    };
  });

  const claimResults = segmentResults.filter((result) => result.unit.isClaimLike);
  const mappedClaims = claimResults.filter((result) => result.mapped);
  const unmappedClaims = claimResults.filter((result) => !result.mapped);
  const mappedWords = mappedClaims.reduce((sum, result) => sum + result.unit.wordCount, 0);
  const claimWords = claimResults.reduce((sum, result) => sum + result.unit.wordCount, 0);

  onProgress({ phase: 'pressure-testing', value: 0.78, message: 'Looking for boundary pressure and reasoning failures' });
  const pressureTests = segmentResults
    .flatMap(pressureForResult)
    .sort((a, b) => b.priority - a.priority || a.segmentId.localeCompare(b.segmentId))
    .filter((item, index, all) => all.findIndex((candidate) =>
      candidate.segmentId === item.segmentId && candidate.failureMode === item.failureMode) === index)
    .slice(0, SCORING_CONFIG.maxPressureTests);

  const analysisIdentity = {
    canonSnapshotHash: canonSnapshotHash(prepared),
    inputDigest: inputDigest(document, domainOverrides),
  };
  const provenance = buildProvenance(prepared, analysisIdentity);
  const researchItems = unmappedClaims.map(researchItemFor);
  const researchQueue = {
    schemaVersion: RESEARCH_QUEUE_SCHEMA_VERSION,
    status: 'Research candidates — not LE doctrine',
    // Duplicated from the analysis root on purpose: the queue is exported on
    // its own, and an export with no provenance is an export nobody can trust.
    provenance,
    itemCount: researchItems.length,
    groups: groupResearchItems(researchItems),
    items: researchItems,
  };

  const primaryMatches = mappedClaims.map((result) => result.matches[0]);
  const ambiguityWarnings = segmentResults
    .filter((result) => result.ambiguity)
    .map((result) => ({ segmentId: result.unit.id, message: result.ambiguity }));
  const resultId = `lea-${fnv1a(`${document.id || document.source?.title || ''}|${characters}|${prepared.indexVersion}`)}`;

  const safeSegments = segmentResults.map(publicSegment);

  const result = {
    schemaVersion: ANALYSIS_SCHEMA_VERSION,
    id: resultId,
    generatedAt: new Date().toISOString(),
    analysisMode: ANALYSIS_MODE,
    provenance,
    source: {
      documentId: document.id || null,
      title: document.source?.title || document.title || 'Untitled source',
      type: document.source?.type || document.sourceType || 'text',
      url: document.source?.url || document.url || null,
      extractionMethod: document.extraction?.method || document.extractionMethod || 'unknown',
      extractionWarnings: document.extraction?.warnings || document.warnings || [],
      speakers: document.speakers || [],
    },
    canonIndex: indexMetadata(prepared, canonIndex),
    metrics: {
      totalWords: document.segments.reduce((sum, segment) => sum + wordCount(segment.text), 0),
      totalCharacters: characters,
      sourceSegments: document.segments.length,
      analyzedPassages: units.length,
      relevantDomainSegments: relevantUnits.length,
      uncertainDomainSegments: uncertainUnits.length,
      ignoredDomainSegments: ignoredUnits.length,
      ignoredDomainWords: ignoredWords,
      claimLikeSegments: claimResults.length,
      mappedClaimSegments: mappedClaims.length,
      unmappedClaimSegments: unmappedClaims.length,
    },
    domainRelevance: {
      policy: 'deterministic-relational-frames-v2',
      relevantSegments: relevantUnits.length,
      uncertainRetainedSegments: uncertainUnits.length,
      ignoredSegments: ignoredUnits.length,
      ignoredWords,
      ignoredPassages: ignoredUnits.map(ignoredPassageRecord),
      overrides: {
        applied: appliedOverrides,
        unmatchedIds: unmatchedOverrideIds,
      },
      note: 'The relevance gate is heuristic triage, not ground truth. Ignored passages are listed with their decision evidence, remain intact in the normalized source, and can be re-included with a per-passage override; retained passages can likewise be excluded. Overrides are session-scoped visitor decisions and are disclosed in every export.',
    },
    coverage: {
      mappedClaimSegmentSharePct: percentage(mappedClaims.length, claimResults.length),
      unmappedClaimSegmentSharePct: percentage(unmappedClaims.length, claimResults.length),
      mappedClaimWordSharePct: percentage(mappedWords, claimWords),
      denominator: 'Detected claim-like relationship-domain segments only; clearly non-domain and context passages are excluded.',
      interpretation: 'Document coverage, not population statistics, factual accuracy, or proof that a claim is true.',
      provisional: COVERAGE_PROVISIONAL,
    },
    categoryDistribution: summarizeDistribution(primaryMatches, 'category'),
    evidenceTierDistribution: summarizeDistribution(primaryMatches, 'evidenceType'),
    strongestMatches: strongestMatches(mappedClaims),
    segments: safeSegments,
    pressureTests,
    researchQueue,
    adjacentDoctrine: unique(mappedClaims.flatMap((mapped) =>
      mapped.matches.flatMap((match) => [...match.dependencies, ...match.related])))
      .filter((id) => !primaryMatches.some((match) => match.canonId === id))
      .slice(0, SCORING_CONFIG.maxAdjacentDoctrine)
      .map((id) => {
        const entry = entriesById.get(id);
        return entry ? {
          canonId: entry.id,
          title: entry.title,
          href: entry.href,
          category: entry.category,
          synopsis: entry.synopsis,
          reason: 'Dependency or related canon entry attached to a direct match.',
        } : null;
      })
      .filter(Boolean),
    warnings: [
      ...ambiguityWarnings,
      ...(unmatchedOverrideIds.length
        ? [{ segmentId: null, message: `${unmatchedOverrideIds.length} domain override(s) referenced passages that no longer exist in this source and were not applied.` }]
        : []),
      ...(detectedUnits.length >= SCORING_CONFIG.maxClaimUnits
        ? [{ segmentId: null, message: `Only the first ${SCORING_CONFIG.maxClaimUnits.toLocaleString()} passages were analyzed.` }]
        : []),
      ...(claimResults.length === 0
        ? [{ segmentId: null, message: 'No relationship-domain claims were detected in this source.' }]
        : mappedClaims.length === 0
        ? [{ segmentId: null, message: 'No claim-like passage cleared the credible-match threshold. The Research Queue is the primary output.' }]
        : []),
    ],
    limitations: [
      'Matches are deterministic lexical inferences, not judgments from a language model.',
      'Scoring thresholds are provisional: they were set by judgment and have never been calibrated against a labelled corpus, so the mapped share is a provisional figure, not a measured one.',
      'The deterministic relevance gate requires a relationship outcome or a participant-and-mechanism frame; claim grammar alone never establishes domain relevance.',
      'The relevance gate is lexical triage and can misclassify unseen phrasings in either direction; every ignored passage is listed with its decision evidence and any passage can be re-triaged with a per-passage visitor override.',
      'A lexical score clears the credible threshold only when supported by an exact phrase, a concept signature, or at least two distinctive shared concepts.',
      'A match means the source resembles or engages an indexed LE concept; it does not establish that either claim is true.',
      'Alignment reads negation parity, quotation, attribution, endorsement, rejection, and qualification within the clause that carries the claim, and the generic agreement and disagreement cues that decide the remaining labels read the claim\'s clause and the clause that follows it (evidence-citation language still counts from anywhere in the passage; a verdict stated in an earlier clause does not reach forward). It cannot detect irony, so a passage that mocks a reading by stating it is recorded as stating it; labels should also be reviewed when a claim is highly implicit or depends on context outside the passage.',
      'Clause boundaries are approximated from punctuation, not parsed. Stance scoping and contextual-alias evidence both depend on that approximation, so coordination without a comma, negation inside a subordinate clause, appositive and relative clauses, and chains of attribution can each attach a word to the wrong claim.',
      'External sources listed by LE are carried through as citations; this analysis does not re-fetch or re-verify them.',
      'No source text or media was uploaded by this analyzer.',
    ],
  };

  // Opt-in only. Omitting the option leaves the key absent, not empty.
  if (options.diagnostics) {
    result.diagnostics = buildDiagnostics(segmentResults, {
      analysisId: resultId,
      // The same two values the analysis publishes under provenance.identity,
      // computed once above so the trace cannot disagree with its own analysis
      // by construction.
      ...analysisIdentity,
    }, options.diagnostics);
  }

  onProgress({ phase: 'complete', value: 1, message: 'Analysis complete' });
  return result;
}

export const analyzerInternals = Object.freeze({
  normalizeText,
  publicSegment,
  wordCount,
  claimLikelihood,
  localDomainRelevance,
  scoreEntry,
  hasCredibleMatchEvidence,
  carriesExactEvidence,
  // The working candidate set for one passage, exposed so a fixture can assert
  // what survives retrieval rather than inferring it from what happens to be
  // displayed. Callers outside analyzeDocument pass no bounded context.
  candidateSetFor: (unit, prepared, context = null) => buildCandidateSet(unit, prepared, context),
  // Exposed so the suite can assert a frame's DECLARED weight against the
  // threshold it must stay under, rather than waiting for a benchmark case to
  // flip and then guessing which of two literals moved. No behaviour changes
  // with it, so the bundle token does not move.
  socialMechanismFrames: SOCIAL_MECHANISM_FRAMES,
  // Exposed so the export boundary can be tested directly rather than only
  // through a whole analysis, where a leak with an ordinary name would have to
  // reach a fixture before anyone saw it.
  publicShape,
  stanceFor,
  classifyRiskFlags,
  // Threshold names kept for callers written against v2.1.2; every value now
  // comes from SCORING_CONFIG, which is the single place to change them.
  DOMAIN_RELEVANT_SCORE: SCORING_CONFIG.domainRelevantScore,
  DOMAIN_UNCERTAIN_SCORE: SCORING_CONFIG.domainUncertainScore,
  NON_DOMAIN_DECISIVE_SCORE: SCORING_CONFIG.nonDomainDecisiveScore,
  MIN_CREDIBLE_SCORE: SCORING_CONFIG.minCredibleScore,
  MIN_WEAK_SCORE: SCORING_CONFIG.minWeakScore,
});
