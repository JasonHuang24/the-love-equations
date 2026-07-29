/*
 * LE Lab deterministic analyzer
 * --------------------------------
 * A dependency-free, inspectable lexical analyzer for normalized LE Lab
 * documents. It deliberately does not pretend to be an LLM or a truth engine.
 *
 * Contract:
 *   NormalizedDocument (le-lab.normalized-document/1.0)
 *     -> analyzeDocument(document, canonIndex, { domainOverrides })
 *     -> AnalysisResult (le-lab.analysis/2.1)
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

export const ANALYSIS_SCHEMA_VERSION = 'le-lab.analysis/2.1';
export const RESEARCH_QUEUE_SCHEMA_VERSION = 'le-lab.research-queue/2.0';
export const ANALYSIS_MODE = Object.freeze({
  id: 'local-lexical-v2',
  label: 'On-device deterministic lexical analysis',
  semanticModel: false,
  sourceUploaded: false,
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
  // no decision in this file reads it. Kept at its original value because this
  // pass changes no values; flagged for the next calibration pass.
  nonDomainDecisiveScore: 4,
  plausibleSocialStructureScore: 3,

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
  maxMatchesPerClaim: 4,
  maxWeakMatches: 3,

  // Bounded-context help.
  contextBoostSameConcept: 0.045,
  contextBoostDependency: 0.035,
  contextBoostRelated: 0.025,

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
  'once', 'only', 'or', 'other', 'our', 'ours', 'out', 'over', 'own', 'same',
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
    test: (text) => /\b(?:people|persons?|someone|adults?|singles?|couples?|spouses?|husbands?|wives|boyfriends?|girlfriends?|lovers?|men|women|man|woman|unattached (?:adults?|residents?)|potential partners?)\b/i.test(text),
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
    test: (text) => /\b(?:men|women|man|woman|males|females)\b.{0,70}\b(?:prefer|want|choose|select|desire|attract|reject|date|marry)\w*\b.{0,70}\b(?:men|women|man|woman|males|females)\b/i.test(text)
      || /\b(?:men|women|man|woman|males|females)\b.{0,70}\b(?:prefer|want|choose|select|desire|attract|reject|date|marry)\w*\b/i.test(text),
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
      || /\b(?:first|second|third|blind|next|another)\s+dates?\b|\bdate nights?\b/i.test(text),
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

function stemToken(token) {
  if (token.length < 5) return token;
  return token
    .replace(/(?:ization|ational|fulness|iveness|ously)$/u, '')
    .replace(/(?:ments|ment|ness|able|ible|ally|edly|ingly)$/u, '')
    .replace(/(?:ies)$/u, 'y')
    .replace(/(?:ing|ers|ed|es|s)$/u, '');
}

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
  entry._tokens = unique(tokenize(lexicalText));
  entry._distinctiveTokens = unique(tokenize(lexicalText, { keepGeneric: false }));
  entry._phrases = unique(aliases
    .map(normalizeText)
    .filter((phrase) => phrase.length >= SCORING_CONFIG.minPhraseLength));
  entry._misreadingTokens = unique(tokenize(entry.commonMisreadings.join(' ')));
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

function ignoredPassageRecord(unit) {
  const relevance = unit.domainRelevance;
  return {
    segmentId: unit.id,
    parentSegmentId: unit.parentSegmentId,
    location: {
      segmentIndex: unit.segmentIndex,
      speaker: unit.speaker,
      startTime: unit.startTime,
      endTime: unit.endTime,
    },
    excerpt: unit.text,
    wordCount: unit.wordCount,
    localStatus: relevance.localStatus,
    reasonCode: relevance.reasonCode,
    reasonLabel: DOMAIN_REASON_LABELS[relevance.reasonCode] || relevance.reasonCode,
    frameEvidence: relevance.evidence
      .filter((item) => item.frame !== 'decision')
      .slice(0, SCORING_CONFIG.maxIgnoredFrameEvidence)
      .map(({ code, label, polarity, frame }) => ({ code, label, polarity, frame })),
    overridden: relevance.override === 'exclude',
  };
}

function localDomainRelevance(unit) {
  const text = String(unit?.text || '').trim();
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
  const score = round(Math.max(
    frames.outcome.score,
    frames.mechanism.score,
    humanGroundedOutcome || humanSocialMechanism ? SCORING_CONFIG.domainUncertainScore : 0,
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

export function classifyDomainRelevance(units, overrides = new Map()) {
  const classified = (units || []).map((unit) => applyDomainOverride(
    { ...unit, domainRelevance: localDomainRelevance(unit) },
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
function scoreEntry(unit, entry, idf) {
  const normalized = normalizeText(unit.text);
  // Signatures are sentence-local. A parent paragraph or speaker turn may
  // contain several independent claims, so sibling sentences cannot satisfy
  // one another's concept signatures.
  const signatureText = normalized;
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
    .filter((phrase) => phrase.includes(' ') && normalized.includes(phrase))
    .sort((a, b) => b.length - a.length);
  const singleAliasHits = entry._phrases
    .filter((phrase) => !phrase.includes(' ')
      && phrase.length >= SCORING_CONFIG.minSingleAliasLength
      && normalized.split(/\W+/).includes(phrase));
  const credibleSingleAliasHits = singleAliasHits
    .filter((alias) => tokenize(alias)
      .some((token) => !LOW_INFORMATION_MATCH_TERMS.has(token)));
  const phraseStrength = phraseHits.length
    ? clamp(SCORING_CONFIG.phraseBase + Math.min(
      SCORING_CONFIG.phraseLengthBonusCap,
      (phraseHits[0].split(' ').length - SCORING_CONFIG.phraseLengthBonusBaseWords)
        * SCORING_CONFIG.phraseLengthBonus,
    ))
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

  let score = Math.max(
    phraseStrength,
    ...signatureHits.map((signature) => signature.score),
    (queryCoverage * SCORING_CONFIG.queryCoverageWeight)
      + (canonCoverage * SCORING_CONFIG.canonCoverageWeight)
      + distinctiveBoost
      + titleBoost,
  );

  const weakGenericMatch = !phraseHits.length
    && distinctiveShared.length < SCORING_CONFIG.weakGenericDistinctiveMax
    && shared.every((token) => GENERIC_TERMS.has(token));
  if (weakGenericMatch && !signatureHits.length) score *= SCORING_CONFIG.weakGenericPenalty;
  if (!phraseHits.length && !signatureHits.length && shared.length < SCORING_CONFIG.sparseSharedMin) {
    score *= SCORING_CONFIG.sparseSharePenalty;
  }
  if (unit.wordCount < SCORING_CONFIG.shortUnitWordCount && !phraseHits.length && !signatureHits.length) {
    score *= SCORING_CONFIG.shortUnitPenalty;
  }

  const misreadingOverlap = entry._misreadingTokens.length
    ? entry._misreadingTokens.filter((token) => querySet.has(token)).length / entry._misreadingTokens.length
    : 0;

  return {
    score: round(clamp(score)),
    queryCoverage: round(queryCoverage),
    canonCoverage: round(canonCoverage),
    signatureHits,
    phraseHits: phraseHits.slice(0, SCORING_CONFIG.maxPhraseHitsReported),
    exactAliasHits: credibleSingleAliasHits.slice(0, SCORING_CONFIG.maxAliasHitsReported),
    sharedTokens: shared.slice(0, SCORING_CONFIG.maxSharedTokensReported),
    distinctiveShared: distinctiveShared.slice(0, SCORING_CONFIG.maxDistinctiveSharedReported),
    admissionDistinctiveShared: admissionDistinctiveShared.slice(0, SCORING_CONFIG.maxDistinctiveSharedReported),
    misreadingOverlap: round(misreadingOverlap),
    weakGenericMatch,
  };
}

function confidenceFor(score, phraseHits) {
  if (score >= SCORING_CONFIG.confidenceHigh
    || (score >= SCORING_CONFIG.confidenceHighWithPhrase && phraseHits.length)) return 'High';
  if (score >= SCORING_CONFIG.confidenceMedium) return 'Medium';
  return 'Low';
}

function stanceFor(unit, match) {
  const text = unit.text;
  const commonMisreading = match._rawScore.misreadingOverlap >= SCORING_CONFIG.misreadingContradictionShare;
  let label = 'Resembles';
  let rationale = 'The source and canon entry share a distinctive concept pattern, but the local engine cannot infer full agreement from wording alone.';

  if (!unit.isClaimLike) {
    label = 'Context only';
    rationale = 'This passage supplies context or a question more than a testable claim.';
  } else if (match.canonId === 'lexicon:term-awalt-all-women-are-like-that'
    && /\b(?:all women|women always|women never|every woman)\b/i.test(text)) {
    label = 'Contradicts';
    rationale = 'LE indexes AWALT as a blanket generalization that fails against individual variation; the source states that overreach directly.';
  } else if (match.canonId === 'frameworks:conversion-ladder'
    && /\b(?:different|separate|another|not|only|does not|doesn't|fail|fails)\b/i.test(text)) {
    label = 'Supports';
    rationale = 'The source preserves the LE distinction between attention, attraction, selection, compatibility, and retention.';
  } else if (match.canonId === 'smv:overview'
    && /\b(?:not|does not|doesn't|is not|isn't)\b.*\b(?:moral worth|human worth|entitlement|consent)\b/i.test(text)) {
    label = 'Supports';
    rationale = 'The source affirms the LE boundary between descriptive dating-market leverage and moral worth, entitlement, or consent.';
  } else if (CONTRADICTION_CUES.test(text)
    && (commonMisreading || match.score >= SCORING_CONFIG.contradictionScoreFloor)) {
    label = commonMisreading ? 'Contradicts' : 'Challenges';
    rationale = commonMisreading
      ? 'The source overlaps a misreading that the canon entry explicitly limits or rejects.'
      : 'The source uses explicit disagreement language around the matched concept.';
  } else if (CHALLENGE_CUES.test(text)) {
    label = 'Challenges';
    rationale = 'The source names an exception, dependency, or scope limit around the matched concept.';
  } else if (EXTENSION_CUES.test(text)) {
    label = 'Extends';
    rationale = 'The source proposes an additional mechanism, factor, or edge case around the matched concept.';
  } else if (SUPPORT_CUES.test(text) || EVIDENCE_CUES.test(text)) {
    label = 'Supports';
    rationale = 'The source presents the matched concept affirmatively and includes support or evidence language.';
  }

  return { label, rationale };
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
  if (rawScore.distinctiveShared.length) {
    reasons.push(`Distinctive overlap: ${rawScore.distinctiveShared.slice(0, SCORING_CONFIG.maxWhyMatchedTokens).join(', ')}`);
  } else if (rawScore.sharedTokens.length) {
    reasons.push(`Keyword overlap: ${rawScore.sharedTokens.slice(0, SCORING_CONFIG.maxWhyMatchedTokens).join(', ')}`);
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
  return Boolean(
    rawScore.signatureHits.length
    || rawScore.phraseHits.length
    || rawScore.exactAliasHits.length
    || rawScore.admissionDistinctiveShared.length >= SCORING_CONFIG.minAdmissionDistinctiveShared
  );
}

function isCredibleCandidate(candidate) {
  return candidate.score >= SCORING_CONFIG.minCredibleScore
    && hasCredibleMatchEvidence(candidate._rawScore);
}

function applyBoundedContext(results, entriesById) {
  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    const bridge = result.unit.boundedContext;
    const previous = results[index - 1];
    if (!bridge || !previous) continue;
    if (result.unit.parentSegmentId !== previous.unit.parentSegmentId) continue;
    if (bridge.sourceUnitId !== previous.unit.id) continue;

    // Only locally credible evidence from the immediately preceding sentence
    // may help. Using the previous candidate's unboosted score prevents context
    // from cascading through a chain of elliptical sentences.
    const previousCanonIds = new Set(previous.candidates
      .filter((candidate) => isCredibleCandidate(candidate))
      .slice(0, SCORING_CONFIG.maxMatchesPerClaim)
      .map((candidate) => candidate.canonId));

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

function classifyRiskFlags(text) {
  const flags = [];
  if (/\b(?:should|ought|deserve|wrong|immoral|good person|bad person|worthless)\b/i.test(text)) flags.push('moral claim');
  if (/\b(?:cause|causes|caused|because|leads? to|drives?|results? in)\b/i.test(text)) flags.push('causal claim');
  if (/\b(?:men|women|male|female|all men|all women)\b/i.test(text)) flags.push('gender generalization');
  if (/\b(?:i knew|my friend|one time|in my experience|someone i know|a guy i know)\b/i.test(text)) flags.push('anecdote');
  if (/(?:\d+(?:\.\d+)?\s*%|\b\d+\s+(?:out of|in)\s+\d+\b)/i.test(text) && !EVIDENCE_CUES.test(text.replace(/\d+(?:\.\d+)?\s*%/g, ''))) {
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
  const reason = !nearest
    ? 'No canon entry shared enough distinctive language for a defensible match.'
    : nearest.score < SCORING_CONFIG.minWeakScore
      ? 'The nearest canon concept shares only weak or generic wording.'
      : 'A nearby concept exists, but confidence stayed below the credible-match threshold.';
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
    suggestedDestination: destination,
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
  const classifiedUnits = classifyDomainRelevance(detectedUnits, domainOverrides);
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

  const candidatesByUnit = [];
  for (let unitIndex = 0; unitIndex < units.length; unitIndex += 1) {
    const unit = units[unitIndex];
    const candidates = prepared.entries
      .map((entry) => publicMatch(entry, scoreEntry(unit, entry, prepared.idf)))
      .filter((match) => match.score >= SCORING_CONFIG.candidateScoreFloor)
      .sort((a, b) => b.score - a.score || a.canonId.localeCompare(b.canonId))
      .slice(0, SCORING_CONFIG.maxCandidatesPerUnit);
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

  const entriesById = new Map(prepared.entries.map((entry) => [entry.id, entry]));
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
      weakMatches: weak.map((match) => {
        const { _rawScore, ...safe } = match;
        return safe;
      }),
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

  const researchItems = unmappedClaims.map(researchItemFor);
  const researchQueue = {
    schemaVersion: RESEARCH_QUEUE_SCHEMA_VERSION,
    status: 'Research candidates — not LE doctrine',
    itemCount: researchItems.length,
    groups: groupResearchItems(researchItems),
    items: researchItems,
  };

  const primaryMatches = mappedClaims.map((result) => result.matches[0]);
  const ambiguityWarnings = segmentResults
    .filter((result) => result.ambiguity)
    .map((result) => ({ segmentId: result.unit.id, message: result.ambiguity }));
  const resultId = `lea-${fnv1a(`${document.id || document.source?.title || ''}|${characters}|${prepared.indexVersion}`)}`;

  const safeSegments = segmentResults.map((result) => ({
    ...result,
    candidates: undefined,
    matches: result.matches.map(({ _rawScore, ...match }) => match),
  }));

  const result = {
    schemaVersion: ANALYSIS_SCHEMA_VERSION,
    id: resultId,
    generatedAt: new Date().toISOString(),
    analysisMode: ANALYSIS_MODE,
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
      'The deterministic relevance gate requires a relationship outcome or a participant-and-mechanism frame; claim grammar alone never establishes domain relevance.',
      'The relevance gate is lexical triage and can misclassify unseen phrasings in either direction; every ignored passage is listed with its decision evidence and any passage can be re-triaged with a per-passage visitor override.',
      'A lexical score clears the credible threshold only when supported by an exact phrase, a concept signature, or at least two distinctive shared concepts.',
      'A match means the source resembles or engages an indexed LE concept; it does not establish that either claim is true.',
      'Alignment labels are cue-based and should be reviewed when language is ironic, quoted, highly implicit, or dependent on distant context.',
      'External sources listed by LE are carried through as citations; this analysis does not re-fetch or re-verify them.',
      'No source text or media was uploaded by this analyzer.',
    ],
  };

  onProgress({ phase: 'complete', value: 1, message: 'Analysis complete' });
  return result;
}

export const analyzerInternals = Object.freeze({
  normalizeText,
  wordCount,
  claimLikelihood,
  localDomainRelevance,
  scoreEntry,
  hasCredibleMatchEvidence,
  classifyRiskFlags,
  // Threshold names kept for callers written against v2.1.2; every value now
  // comes from SCORING_CONFIG, which is the single place to change them.
  DOMAIN_RELEVANT_SCORE: SCORING_CONFIG.domainRelevantScore,
  DOMAIN_UNCERTAIN_SCORE: SCORING_CONFIG.domainUncertainScore,
  NON_DOMAIN_DECISIVE_SCORE: SCORING_CONFIG.nonDomainDecisiveScore,
  MIN_CREDIBLE_SCORE: SCORING_CONFIG.minCredibleScore,
  MIN_WEAK_SCORE: SCORING_CONFIG.minWeakScore,
});
