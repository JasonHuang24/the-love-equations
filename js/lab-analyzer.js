/*
 * LE Lab deterministic analyzer
 * --------------------------------
 * A dependency-free, inspectable lexical analyzer for normalized LE Lab
 * documents. It deliberately does not pretend to be an LLM or a truth engine.
 *
 * Contract:
 *   NormalizedDocument (le-lab.normalized-document/1.0)
 *     -> analyzeDocument(document, canonIndex)
 *     -> AnalysisResult (le-lab.analysis/1.0)
 *
 * The browser runs this module in a worker when available. Node fixture tests
 * import the same functions; there is no second test-only implementation.
 */

export const ANALYSIS_SCHEMA_VERSION = 'le-lab.analysis/1.0';
export const ANALYSIS_MODE = Object.freeze({
  id: 'local-lexical-v1',
  label: 'On-device deterministic lexical analysis',
  semanticModel: false,
  sourceUploaded: false,
});

const MAX_ANALYSIS_CHARACTERS = 500_000;
const MAX_CLAIM_UNITS = 2_500;
const MIN_CREDIBLE_SCORE = 0.43;
const MIN_WEAK_SCORE = 0.25;
const MAX_MATCHES_PER_CLAIM = 4;
const MAX_CONTEXT_CONTINUATION_WORDS = 18;
const MAX_CONTEXT_SOURCE_WORDS = 60;

const REFERENTIAL_CONTINUATION_CUE = /^(?:that|this|these|those|it|which|such(?:\s+(?:a|an))?|the same)\b/i;

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

const CLAIM_CUES = [
  /\b(?:is|are|was|were|means?|shows?|proves?|predicts?|causes?|creates?|drives?|leads?)\b/i,
  /\b(?:can|could|may|might|should|must|will|cannot|can't|won't|need to|have to|tend to|more likely|less likely)\b/i,
  /\b(?:always|never|everyone|nobody|all men|all women|most men|most women)\b/i,
  /\b(?:because|therefore|so that|as a result|the reason)\b/i,
  /\b(?:\d+(?:\.\d+)?\s*%|\b(?:study|studies|research|data|survey|sample)\b)\b/i,
  /\b(?:prefer|choose|reject|attract|desire|commit|marry|divorce|retain|leave)\w*\b/i,
];

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

function round(value, digits = 3) {
  const scale = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * scale) / scale;
}

function percentage(numerator, denominator) {
  return denominator ? round((numerator / denominator) * 100, 1) : 0;
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
    .filter((phrase) => phrase.length >= 4));
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

function splitSentences(text) {
  if (typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
    try {
      const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
      return [...segmenter.segment(String(text || ''))]
        .map((item) => item.segment.trim())
        .filter(Boolean);
    } catch {
      return fallbackSentenceSplit(text);
    }
  }
  return fallbackSentenceSplit(text);
}

function claimLikelihood(text) {
  const words = wordCount(text);
  if (words < 4) return 0;
  let score = words >= 9 ? 0.32 : 0.16;
  CLAIM_CUES.forEach((pattern) => {
    if (pattern.test(text)) score += 0.14;
  });
  if (/^\s*(?:hi|hello|thanks?|okay|right|yeah|um|uh)\b[!.]?\s*$/i.test(text)) score = 0;
  if (/\?$/.test(text)) score += words >= 8 ? 0.08 : -0.08;
  if (words > 80) score -= 0.06;
  return clamp(score);
}

function boundedPreviousContext(sentences, sentenceIndex, parentSegmentId) {
  if (sentenceIndex < 1) return null;
  const text = String(sentences[sentenceIndex] || '').trim();
  const previousText = String(sentences[sentenceIndex - 1] || '').trim();
  if (!text || !previousText) return null;
  if (!REFERENTIAL_CONTINUATION_CUE.test(text)) return null;
  if (wordCount(text) > MAX_CONTEXT_CONTINUATION_WORDS) return null;
  if (wordCount(previousText) > MAX_CONTEXT_SOURCE_WORDS) return null;
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
        isClaimLike: likelihood >= 0.30,
      });
    });
  });
  return units.slice(0, MAX_CLAIM_UNITS);
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

  const queryWeight = queryTokens.reduce((sum, token) => sum + (idf.get(token) || 1), 0) || 1;
  const entryWeight = entry._tokens.reduce((sum, token) => sum + (idf.get(token) || 1), 0) || 1;
  const sharedWeight = shared.reduce((sum, token) => sum + (idf.get(token) || 1), 0);
  const queryCoverage = sharedWeight / queryWeight;
  const canonCoverage = sharedWeight / entryWeight;

  const phraseHits = entry._phrases
    .filter((phrase) => phrase.includes(' ') && normalized.includes(phrase))
    .sort((a, b) => b.length - a.length);
  const singleAliasHits = entry._phrases
    .filter((phrase) => !phrase.includes(' ') && phrase.length >= 5 && normalized.split(/\W+/).includes(phrase));
  const phraseStrength = phraseHits.length
    ? clamp(0.54 + Math.min(0.18, (phraseHits[0].split(' ').length - 2) * 0.035))
    : singleAliasHits.length
      ? 0.30
      : 0;

  const distinctiveBoost = Math.min(0.16, distinctiveShared.length * 0.045);
  const titleTokens = tokenize(entry.title);
  const titleHits = titleTokens.filter((token) => querySet.has(token));
  const titleBoost = titleTokens.length
    ? Math.min(0.12, (titleHits.length / titleTokens.length) * 0.12)
    : 0;

  let score = Math.max(
    phraseStrength,
    ...signatureHits.map((signature) => signature.score),
    (queryCoverage * 0.56) + (canonCoverage * 0.24) + distinctiveBoost + titleBoost,
  );

  const weakGenericMatch = !phraseHits.length
    && distinctiveShared.length < 2
    && shared.every((token) => GENERIC_TERMS.has(token));
  if (weakGenericMatch && !signatureHits.length) score *= 0.38;
  if (!phraseHits.length && !signatureHits.length && shared.length < 2) score *= 0.52;
  if (unit.wordCount < 6 && !phraseHits.length && !signatureHits.length) score *= 0.72;

  const misreadingOverlap = entry._misreadingTokens.length
    ? entry._misreadingTokens.filter((token) => querySet.has(token)).length / entry._misreadingTokens.length
    : 0;

  return {
    score: round(clamp(score)),
    queryCoverage: round(queryCoverage),
    canonCoverage: round(canonCoverage),
    signatureHits,
    phraseHits: phraseHits.slice(0, 3),
    sharedTokens: shared.slice(0, 12),
    distinctiveShared: distinctiveShared.slice(0, 8),
    misreadingOverlap: round(misreadingOverlap),
    weakGenericMatch,
  };
}

function confidenceFor(score, phraseHits) {
  if (score >= 0.72 || (score >= 0.64 && phraseHits.length)) return 'High';
  if (score >= 0.52) return 'Medium';
  return 'Low';
}

function stanceFor(unit, match) {
  const text = unit.text;
  const commonMisreading = match._rawScore.misreadingOverlap >= 0.36;
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
  } else if (CONTRADICTION_CUES.test(text) && (commonMisreading || match.score >= 0.58)) {
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
  if (rawScore.distinctiveShared.length) {
    reasons.push(`Distinctive overlap: ${rawScore.distinctiveShared.slice(0, 5).join(', ')}`);
  } else if (rawScore.sharedTokens.length) {
    reasons.push(`Keyword overlap: ${rawScore.sharedTokens.slice(0, 5).join(', ')}`);
  }
  if (entry.subcategory) reasons.push(`Canon context: ${entry.category} / ${entry.subcategory}`);
  if (rawScore.weakGenericMatch) reasons.push('Penalty: only generic dating language overlaps');
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
    || raw.sharedTokens.length >= 2
  );
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
      .filter((candidate) => candidate._rawScore.score >= MIN_CREDIBLE_SCORE)
      .slice(0, MAX_MATCHES_PER_CLAIM)
      .map((candidate) => candidate.canonId));

    result.candidates.forEach((candidate) => {
      const entry = entriesById.get(candidate.canonId);
      if (!entry) return;
      const localScore = candidate._rawScore.score;
      if (localScore < MIN_WEAK_SCORE || !hasLocalConceptEvidence(candidate)) return;

      let boost = 0;
      let relation = '';
      if (previousCanonIds.has(candidate.canonId)) {
        boost = 0.045;
        relation = 'same canon concept';
      } else if (entry.dependencies.some((dependency) => previousCanonIds.has(dependency))) {
        boost = 0.035;
        relation = 'declared dependency';
      } else if (entry.related.some((related) => previousCanonIds.has(related))) {
        boost = 0.025;
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
  if (/\b(?:define|called|term|means)\b/.test(text) && unit.wordCount < 35) return 'Lexicon';
  if (/\b(?:percent|study|data|rate|survey|sample)\b/.test(text)) return 'Statistics';
  if (/\b(?:myth|is it true|claim|false|fact)\b/.test(text)) return 'Mythbuster';
  if (/\b(?:men|women|male|female|gender|sex difference)\b/.test(text)) return 'Gender Dynamics';
  if (/\b(?:looks|money|status|charm|exposure|smv)\b/.test(text)) return 'Five Levers';
  if (unit.wordCount > 45) return 'Deep Dive';
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
  return `Under what population, stage, and market conditions does “${truncate(unit.text, 110)}” hold, and how large is the effect?`;
}

function researchItemFor(result) {
  const nearest = result.candidates[0] || null;
  const risks = classifyRiskFlags(result.unit.text);
  const destination = chooseDestination(result.unit, nearest);
  const distinctiveTerms = unique(tokenize(result.unit.text, { keepGeneric: false })).slice(0, 7);
  const reason = !nearest
    ? 'No canon entry shared enough distinctive language for a defensible match.'
    : nearest.score < MIN_WEAK_SCORE
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
    nearestConcepts: result.candidates.slice(0, 3).map((candidate) => ({
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
    const weakMap = primary.score < 0.52;
    const tensionType = weakMap
      ? 'Genuinely unmapped territory'
      : triggered.length
        ? 'Likely source overreach'
        : 'Possible LE limitation';
    return {
      id: `pt-${fnv1a(`${result.unit.id}|${primary.canonId}|${pattern.id}`)}`,
      segmentId: result.unit.id,
      canonId: primary.canonId,
      priority: pattern.severity + (primary.score >= 0.65 ? 1 : 0),
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
      if (summary.excerpts.length < 3) summary.excerpts.push(result.unit.text);
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
    .slice(0, 20);
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
  if (characters > MAX_ANALYSIS_CHARACTERS) {
    throw new Error(`This transcript contains ${characters.toLocaleString()} characters; the on-device limit is ${MAX_ANALYSIS_CHARACTERS.toLocaleString()}. Split it into parts and try again.`);
  }
  return characters;
}

export async function analyzeDocument(document, canonIndex, options = {}) {
  const onProgress = typeof options.onProgress === 'function' ? options.onProgress : () => {};
  const isCancelled = typeof options.isCancelled === 'function' ? options.isCancelled : () => false;
  const characters = validateDocumentSize(document);
  onProgress({ phase: 'segmenting', value: 0.08, message: 'Detecting claim-like passages' });
  const prepared = prepareCanonIndex(canonIndex);
  const units = detectClaimUnits(document);
  if (!units.length) throw new Error('The extractor found text, but no analyzable passages.');
  if (isCancelled()) throw new DOMException('Analysis cancelled', 'AbortError');

  const candidatesByUnit = [];
  for (let unitIndex = 0; unitIndex < units.length; unitIndex += 1) {
    const unit = units[unitIndex];
    const candidates = prepared.entries
      .map((entry) => publicMatch(entry, scoreEntry(unit, entry, prepared.idf)))
      .filter((match) => match.score >= 0.08)
      .sort((a, b) => b.score - a.score || a.canonId.localeCompare(b.canonId))
      .slice(0, 8);
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
      .filter((candidate) => candidate.score >= MIN_CREDIBLE_SCORE)
      .slice(0, MAX_MATCHES_PER_CLAIM);
    credible.forEach((match) => {
      match.alignment = stanceFor(unit, match);
      match.why = match.alignment.rationale;
    });
    const weak = candidates
      .filter((candidate) => candidate.score >= MIN_WEAK_SCORE && candidate.score < MIN_CREDIBLE_SCORE)
      .slice(0, 3);
    const ambiguity = credible.length > 1 && (credible[0].score - credible[1].score) < 0.07
      ? `Two canon entries are separated by only ${round(credible[0].score - credible[1].score, 2)} confidence points.`
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
    .slice(0, 18);

  const researchItems = unmappedClaims.map(researchItemFor);
  const researchQueue = {
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
      claimLikeSegments: claimResults.length,
      mappedClaimSegments: mappedClaims.length,
      unmappedClaimSegments: unmappedClaims.length,
    },
    coverage: {
      mappedClaimSegmentSharePct: percentage(mappedClaims.length, claimResults.length),
      unmappedClaimSegmentSharePct: percentage(unmappedClaims.length, claimResults.length),
      mappedClaimWordSharePct: percentage(mappedWords, claimWords),
      denominator: 'Detected claim-like segments only; context passages are excluded.',
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
      .slice(0, 20)
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
      ...(units.length >= MAX_CLAIM_UNITS
        ? [{ segmentId: null, message: `Only the first ${MAX_CLAIM_UNITS.toLocaleString()} passages were analyzed.` }]
        : []),
      ...(mappedClaims.length === 0
        ? [{ segmentId: null, message: 'No claim-like passage cleared the credible-match threshold. The Research Queue is the primary output.' }]
        : []),
    ],
    limitations: [
      'Matches are deterministic lexical inferences, not judgments from a language model.',
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
  scoreEntry,
  classifyRiskFlags,
  MIN_CREDIBLE_SCORE,
  MIN_WEAK_SCORE,
});
