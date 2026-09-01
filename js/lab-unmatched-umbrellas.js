/*
 * Unmatched umbrellas
 * -------------------
 * Deterministic explanatory triage for passages the doctrine matcher has
 * already left unmatched. This module never receives or changes match scores,
 * gates, exclusions, canon entries, or ownership. Its only input is the exact
 * unmatched fragment, and abstention is a first-class result.
 */

export const UNMATCHED_TRIAGE_SCHEMA_VERSION = 'le-lab.unmatched-triage/1.2.0';
export const UNMATCHED_UMBRELLA_TAXONOMY_SCHEMA_VERSION =
  'le-lab.unmatched-umbrella-taxonomy/1.2.0';
export const UNMATCHED_UMBRELLA_TAXONOMY_VERSION = '1.2.0';

const umbrellaDefinitions = [
  {
    id: 'asymmetric-nonhuman-relationships',
    label: 'Asymmetric or nonhuman relationships',
    description: 'Relationship-like territory where reciprocity, welfare, agency, or human status is unequal or absent.',
    currentDoctrineOwners: [
      { id: 'frameworks:synthetic-reciprocity', title: 'Synthetic Reciprocity' },
    ],
  },
  {
    id: 'institutional-authority-governance',
    label: 'Institutional authority and governance',
    description: 'Relationships shaped by organizational authority, prohibition, disclosure, recusal, supervision, or discipline.',
    currentDoctrineOwners: [
      { id: 'frameworks:authority-firewall', title: 'The Authority Firewall' },
    ],
  },
  {
    id: 'role-unbundling-family-formation',
    label: 'Role unbundling and family formation',
    description: 'Family formation that separates romantic, genetic, gestational, donor, caregiving, or social-parent roles.',
    currentDoctrineOwners: [],
  },
  {
    id: 'external-recognition-administrative-access',
    label: 'External recognition and administrative access',
    description: 'Relationships or family roles whose practical consequences depend on legal, institutional, or administrative recognition and access.',
    currentDoctrineOwners: [],
  },
  {
    id: 'brief-nonrelationship-interactions',
    label: 'Brief or nonrelationship interactions',
    description: 'Short, scripted, one-shot, noninteractive, or vignette-based contact that does not establish an ongoing relationship mechanism.',
    currentDoctrineOwners: [],
  },
  {
    id: 'unclassified',
    label: 'Unclassified',
    description: 'No subject umbrella has enough specific evidence to be assigned safely.',
    currentDoctrineOwners: [],
  },
];

const reasonDefinitions = [
  {
    id: 'possible-doctrine-gap',
    label: 'Possible doctrine gap',
    explanation: 'The fragment states a specific relational mechanism in territory that may not have an owning doctrine entry.',
  },
  {
    id: 'existing-doctrine-retrieval-miss',
    label: 'Existing doctrine, retrieval miss',
    explanation: 'The subject is known to have doctrine coverage, but this wording did not retrieve it credibly.',
  },
  {
    id: 'boundary-moderator-directional-evidence',
    label: 'Boundary, moderator, or directional evidence',
    explanation: 'The fragment qualifies a result, names a moderator, or supplies directional evidence rather than a standalone doctrine claim.',
  },
  {
    id: 'descriptive-fact-no-relational-mechanism',
    label: 'Descriptive fact without a relational mechanism',
    explanation: 'The fragment reports a count, sample, method, or descriptive comparison without stating the mechanism that would own it.',
  },
  {
    id: 'outside-human-relational-frame',
    label: 'Outside the human-relational frame',
    explanation: 'The fragment uses adjacent vocabulary but does not describe an ongoing human relational mechanism.',
  },
  {
    id: 'insufficient-evidence',
    label: 'Insufficient evidence to classify',
    explanation: 'The fragment is too generic, fragmentary, or weakly signaled for a reliable subject assignment.',
  },
];

const freezeDefinitions = (definitions) => Object.freeze(definitions.map((definition) => {
  const owners = Object.freeze((definition.currentDoctrineOwners || [])
    .map((owner) => Object.freeze({ ...owner })));
  return Object.freeze({ ...definition, currentDoctrineOwners: owners });
}));

export const UNMATCHED_UMBRELLA_TAXONOMY = Object.freeze({
  schemaVersion: UNMATCHED_UMBRELLA_TAXONOMY_SCHEMA_VERSION,
  version: UNMATCHED_UMBRELLA_TAXONOMY_VERSION,
  status: 'Explanatory triage metadata — not doctrine coverage',
  umbrellas: freezeDefinitions(umbrellaDefinitions),
  unmatchedReasons: freezeDefinitions(reasonDefinitions),
});

const UMBRELLA_BY_ID = new Map(
  UNMATCHED_UMBRELLA_TAXONOMY.umbrellas.map((umbrella) => [umbrella.id, umbrella]),
);
const REASON_BY_ID = new Map(
  UNMATCHED_UMBRELLA_TAXONOMY.unmatchedReasons.map((reason) => [reason.id, reason]),
);

function normalizedText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, '')
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const subjectRules = [
  {
    id: 'asymmetric-nonhuman-relationships',
    signals: [
      { family: 'counterpart', label: 'synthetic or nonhuman counterpart', weight: 0.42, pattern: /\b(?:(?:artificial intelligence(?: \(ai\))?|ai)(?:[- ]simulated)?[- ](?:companions?|(?:romantic )?partners?|boyfriends?|girlfriends?)|chatgpt|grok|character[. -]?ai|chatbots?|replika|synthetic (?:characters?|companions?|partners?)|simulated responsiveness|artificial empathy|nonhuman|(?:social|companion|relational) robots?|virtual companions?)\b/ },
      { family: 'relationship-function', label: 'relationship-like function', weight: 0.24, pattern: /\b(?:companionship|relationships?|romantic partners?|ai partners?|(?:perceived|emotional|social|human) connection|(?:emotional|social) support|attachment|simulated responsiveness|bonds?|intimacy|socialization|relationship[- ]like)\b/ },
      { family: 'asymmetry', label: 'absent or unequal reciprocity', weight: 0.26, pattern: /\b(?:reciprocal|reciprocity|bilateral|independent needs?|welfare|agency|stake|consent|one[- ]sided|unable|inability to leave|cannot leave|simulated responsiveness|anthropomorph|contingent (?:relationship function|interaction))\b/ },
      { family: 'duration', label: 'brief synthetic contact', weight: 0.08, pattern: /\b(?:brief|one interaction|noninteractive|scripted)\b/ },
    ],
    qualifies: (families) => families.has('counterpart')
      && (families.has('relationship-function') || families.has('asymmetry')),
  },
  {
    id: 'institutional-authority-governance',
    signals: [
      { family: 'institution', label: 'organizational or policy setting', weight: 0.28, pattern: /\b(?:policy|workplace|organizational|organizations?|institutions?|universit(?:y|ies)|campus|employers?|academic|human resources|hr|reporting (?:chain|line)|career outcome)\b/ },
      /*
       * `students` stays: real policies name the person under authority, and
       * removing the token cost five correct institutional classifications on
       * live university-policy prose ("the teacher-student relationship",
       * "individuals teaching or working at the University and students").
       * Research prose naming its SAMPLE is a different shape and is handled
       * where it belongs, in the research-population guard in isTriageFurniture
       * (review finding F-6). `supervise`, `employee`, `affiliate` and `staff`
       * are added because policies reach this family through them too.
       */
      { family: 'authority', label: 'evaluative or supervisory authority', weight: 0.26, pattern: /\b(?:supervis(?:e|es|ed|or|ory|ion)|managers?|direct reports?|faculty|employees?|affiliates?|staff|undergraduates?|students?|instructors?|coaches?|athletes?|evaluative|authority|reports? to|reporting line|chain of command|promotion|pay|raise penalty|career outcome)\b/ },
      { family: 'governance', label: 'prohibition, disclosure, or recusal', weight: 0.34, pattern: /\b(?:bans?|prohibit|prohibits|prohibited|disclos(?:e|ure)|recus(?:e|al)|reassign(?:ment)?|disciplin(?:e|ary)|conflict[- ]of[- ]interest|notification|alternative supervision|governance)\b/ },
      // `dating` earns its place by measurement, not by guess: two independent
      // probes for findings F-4 and F-5 both landed on the same sentence
      // ("bans managers from dating direct reports"), which reached the queue
      // with every other family satisfied and failed only here. The lookahead
      // is measured too — adding the token surfaced exactly one new assignment
      // in the 43-source window, an Ohio policy line about "dating violence",
      // which is intimate-partner violence and not a consensual-romance
      // governance mechanism.
      { family: 'relationship', label: 'institutional relationship context', weight: 0.14, pattern: /\b(?:romances?|romantic|relationships?|coworkers?|couples?|dating(?!\s+violence))\b/ },
    ],
    qualifies: (families) => families.has('relationship')
      && ((families.has('institution') && families.has('authority'))
        || (families.has('governance') && (families.has('institution') || families.has('authority')))),
  },
  {
    id: 'role-unbundling-family-formation',
    signals: [
      { family: 'reproduction', label: 'third-party or assisted reproduction', weight: 0.34, pattern: /\b(?:third[- ]party reproduction|surrogacy|surrogates?|donor(?: conception| disclosure| identity| insemination)?|donated (?:eggs?|sperm|embryos?)|egg donors?|sperm donation|ivf|fertility treatment|fertility[- ]treatment|assisted conception|gestational|genetic parent|reciprocal ivf)\b/ },
      { family: 'roles', label: 'distinct family or support roles', weight: 0.28, pattern: /\b(?:intended parents?|surrogates?|single fathers?|solo fathers?|social parents?|caregiving parents?|support[- ]network roles?|support roles?|practical support|genetic contributors?|genetic contribution|birth mothers?|non[- ]birth mothers?|gestational parents?|donor roles?|egg donors?|family types?|plural[- ]parent|platonically co[- ]parenting|legally recognized parent roles?)\b/ },
      { family: 'formation', label: 'parenthood or family-formation decision', weight: 0.18, pattern: /\b(?:parenthood|fatherhood|parents?|parenting|co[- ]parents?|solo mothers?|single mothers? by choice|family formation|starting a family|mothers?)\b/ },
      /*
       * The separation evidence must say what is being separated.
       *
       * Until v2.7.3 this family matched the bare token `separate`, so any
       * administrative use of the word plus any reproduction noun qualified:
       * separate records, consent forms, columns, rooms, databases, fees and
       * appointments all classified as role unbundling, six of them at 0.99 and
       * most of them reaching the live queue (review finding F-1). The token
       * was doing no work that a mechanism test could not do better — note
       * that `separately` never matched it, purely because of a word boundary.
       *
       * A separation verb now has to govern a role noun within a short window,
       * or state the separation outright (`different people`, `rather than a
       * partner`). `separate records for donors and intended parents` puts five
       * words between the verb and the role and no longer qualifies; `separates
       * the genetic parent` and `separate the decision ... from the search for
       * a romantic partner` still do.
       */
      { family: 'split', label: 'roles explicitly separated, substituted, or compared', weight: 0.38, pattern: /(?:\b(?:separat(?:e|es|ed|ing|ion)|split|unbundl\w*|decoupl\w*|substitut(?:e|es|ed|ing|ion)|replac(?:e|es|ed|ing)|distinguish(?:es|ed|ing)?)\b\s+(?:\w+[-\s]+){0,3}\b(?:roles?|parent(?:s|hood|ing)?|mother(?:s|hood)?|father(?:s|hood)?|gestation|functions?)\b|\b(?:separat(?:e|es|ed|ing|ion)|split|unbundl\w*|decoupl\w*)\b\s+(?:\w+[-\s]+){0,6}?\bfrom\b\s+(?:\w+[-\s]+){0,6}?\b(?:partner|parents?|parenthood|romance|marriage|relationship)\b|\b(?:roles?|parent(?:s|hood)?|contributors?|donors?|surrogates?)\b\s+(?:\w+[-\s]+){0,4}\b(?:separat(?:es|ed|ing|ion)|split|unbundl\w*|decoupl\w*|substitut(?:e|es|ed|ing|ion)|replac(?:e|es|ed|ing))\b|\bexcluding\b\s+(?:\w+[-\s]+){0,3}\b(?:mother|father|parents?|partner|sister|brother|friend|donors?|surrogates?|roles?)\b|\b(?:different people|parent(?:ing)? alone|rather than (?:the search for )?(?:a )?(?:romantic )?(?:partner|parent)|instead of (?:a )?(?:romantic )?(?:partner|parent)|from the surrogate to the intended parents|birth (?:and|versus) non[- ]birth|genetic (?:and|versus) gestational|between (?:gestational|genetic|birth|non[- ]birth|solo|partnered)|without (?:a )?partner|not waiting for (?:a )?partner|even if romance|platonically co[- ]parenting|mediated through motherhood|no longer travel together)\b)/ },
    ],
    qualifies: (families) => families.has('split')
      && (families.has('reproduction') || families.has('roles') || families.has('formation')),
  },
  {
    id: 'external-recognition-administrative-access',
    signals: [
      /*
       * `recognise` only counts when it is doing administrative work.
       *
       * The bare verb forms used to sit in this list, so "recognize mutual
       * benefit" and "couples recognize the benefit of sharing housework"
       * cleared administration, met `access` on the equally bare `benefit`, and
       * classified as External recognition at 0.99 with reason "Possible
       * doctrine gap" — a sentence about feelings presented to a reviewer as
       * uncovered administrative territory (review finding F-2). The `access`
       * family already carries the administrative senses that matter
       * ("recognised as the second legal parent"), so the qualified forms are
       * kept there, and the verb is kept here only when an institutional actor
       * or a status object governs it — "institutions to recognize support
       * roles" still qualifies, "recognize mutual benefit" no longer does.
       */
      { family: 'administration', label: 'legal or administrative recognition', weight: 0.42, pattern: /(?:\b(?:legal[- ]status|legal parents?|legal parenthood|legal parentage|parental orders?|birth certificates?|consent forms?|licensed clinics?|visa|immigration|citizenship|residence permits?|marriage licen[cs]e|registration|registered|administrative|recognition|funding eligibility|legal screening|hospital rules?|institutional rules?|jurisdiction|court declaration)\b|\brecogni[sz]\w*\s+(?:\w+[-\s]+){0,3}\b(?:roles?|status|legal parents?|parenthood|partnerships?|marriages?|unions?|rights?)\b|\b(?:institutions?|states?|courts?|law|governments?|authorit(?:y|ies)|registrars?)\b\s+(?:\w+[-\s]+){0,3}\brecogni[sz]\w*)/ },
      { family: 'access', label: 'access, eligibility, or legal effect', weight: 0.44, pattern: /\b(?:access|eligibility|eligible|permission|benefits?|family reunification|next of kin|allowed only|excluding|excluded|automatically|legal status|employment permission|funding eligibility|consent to legal parenthood|give consent (?:if you want .* )?(?:to )?(?:be|being) (?:a |the )?legal parent|withdraw (?:their |your )?consent|transfers? legal parenthood|grants? (?:the intended parents )?legal parenthood|confers?|records?|names? .* on (?:the )?birth certificate|recognis(?:e|ed) as (?:the )?(?:second )?legal parent|recogniz(?:e|ed) as (?:the )?(?:second )?legal parent|(?:will|would|may|must|won't|will not) be (?:the |a )?(?:child(?:'s|s) )?legal parents?|not (?:a |the )?legal parent|who will be (?:the )?(?:child(?:'s|s) )?legal parents?|legal parents? (?:at birth|for nationality purposes)|status as a legal parent|route out of legal parenthood|complex consent arrangements|challenged|otherwise occupy|external plural[- ]parent recognition|surrogacy coverage)\b/ },
      { family: 'relationship', label: 'relationship or family status', weight: 0.16, pattern: /\b(?:intended parents?|surrogates?|couples?|spouses?|partners?|pairings?|marriage|intermarriage|relationships?|family|parenthood|plural[- ]parent|fertility[- ]treatment family types?)\b/ },
      { family: 'cross-border', label: 'cross-border status bundle', weight: 0.26, pattern: /\b(?:cross[- ]border|migrating spouses?|mobility|intermarriage formation)\b/ },
    ],
    qualifies: (families) => families.has('administration')
      && families.has('access')
      && families.has('relationship'),
  },
  {
    id: 'brief-nonrelationship-interactions',
    signals: [
      { family: 'brevity', label: 'brief, scripted, or one-shot contact', weight: 0.38, pattern: /\b(?:(?:brief|short) (?:ratings?|interactions?|contact|encounters?|impressions?|vignettes?|messages?|exposure|dates?|(?:[\w-]+ ){0,3}(?:experiment|vignette))|briefly (?:rated|interacted|viewed|encountered)|one(?: \w+){0,2} interaction|one[- ]shot|single (?:workplace[- ]romance )?vignette|scripted messages?|noninteractive|short encounter|speed[- ]dating impression)\b/ },
      { family: 'interaction', label: 'interaction or impression measure', weight: 0.26, pattern: /\b(?:interactions?|rated|ratings?|messages?|vignette|impressions?|encounters?|reaction|attraction)\b/ },
      { family: 'nonrelationship', label: 'no ongoing relationship mechanism', weight: 0.28, pattern: /\b(?:noninteractive|without repeated|no repeated|rather than a relationship|not an ongoing couple|not relationship maintenance|not evidence of durable relationship|nonrelationship|not an ongoing relationship|not an ongoing)\b/ },
      { family: 'relationship', label: 'adjacent relational vocabulary', weight: 0.12, pattern: /\b(?:relationships?|couples?|romance|romantic|(?:perceived|emotional|social|human) connection|(?:emotional|social) support)\b/ },
    ],
    qualifies: (families) => families.has('brevity')
      && families.has('interaction')
      && (families.has('nonrelationship') || families.has('relationship')),
  },
];

const CLASSIFICATION_THRESHOLD = 0.64;
const SECONDARY_THRESHOLD = 0.64;
const MAX_SECONDARY_GAP = 0.35;
const SUBJECT_TIE_PRIORITY = new Map([
  ['external-recognition-administrative-access', 0],
  ['role-unbundling-family-formation', 1],
]);

function roundConfidence(value) {
  return Math.round(Math.max(0, Math.min(0.99, value)) * 100) / 100;
}

function scoreSubject(text, rule) {
  const hits = rule.signals.filter((signal) => signal.pattern.test(text));
  const families = new Set(hits.map((signal) => signal.family));
  const qualified = rule.qualifies(families);
  const rawScore = hits.reduce((sum, signal) => sum + signal.weight, 0);
  return {
    id: rule.id,
    qualified,
    score: roundConfidence(qualified ? rawScore : Math.min(rawScore, 0.55)),
    matchedSignals: hits.map((signal) => signal.label),
  };
}

/*
 * Calibrated, not guessed: the shortest fragment the frozen evaluation expects
 * to be SUPPORTED is 10 words (`authority-02`, `brief-01`), and the titles this
 * has to catch run 5 to 8. Eight leaves a two-word margin against the frozen
 * evidence on one side and catches every title on the other. Raising it past 9
 * starts abstaining on real claims — that is what the fixtures are for.
 */
const HEADING_MAX_WORDS = 8;

/**
 * A short fragment with no finite verb is a title, not a claim.
 *
 * Capitalization is deliberately NOT consulted. Title case is the obvious
 * signal and it is unusable here: the audits reclassify every fragment
 * upper-cased to prove that case is never load-bearing, and a title-case test
 * answers differently for "Donor Conception and the Intended Parents" and its
 * upper-cased twin. Length and predication survive that normalization, and they
 * separate the cases just as well — the titles this has to catch run five to
 * eight words with no predicate, while the policy sentences it must not catch
 * run fourteen to twenty and all predicate something.
 */
function isVerblessTitle(raw, hasFiniteVerb) {
  if (hasFiniteVerb) return false;
  const words = raw.split(/\s+/).filter((word) => /[A-Za-z]/.test(word));
  if (words.length < 3 || words.length > HEADING_MAX_WORDS) return false;
  // A sentence break inside the fragment means prose that was cut, not a title.
  return !/[.!?][”"')\]]?\s+\S/.test(raw);
}

function isHeadingLikeFragment(fragment) {
  const raw = String(fragment || '')
    .replace(/[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!raw) return false;
  const colonHeading = /:[”"')\]]?$/.test(raw);
  const questionHeading = /\?[”"')\]]?$/.test(raw);
  // The lookbehind keeps a hyphenated compound from reading as a predicate:
  // "Well-Being" ends in "Being", and without it every title containing one
  // looks like a sentence.
  const hasFiniteVerb = /(?:['’](?:m|re|s|ve|d|ll)\b|(?<!-)\b(?:am|is|are|was|were|be|been|being|do|does|did|have|has|had|got|get|gets|say|says|said|see|sees|saw|look|looks|looking|call|calls|called|produce|produces|produced|remain|remains|remained|affect|affects|affected|can|could|will|would|shall|should|may|might|must|need|needs|provide|provides|provided|ban|bans|banned|prohibit|prohibits|prohibited|require|requires|required|allow|allows|allowed|separate|separates|separated|transfer|transfers|transferred|grant|grants|granted|recogni[sz]e|recogni[sz]es|describe|describes|described|report|reports|reported|show|shows|showed|offer|offers|offered|operate|operates|operated|elicit|elicits|elicited|include|includes|included|cover|covers|covered|appl(?:y|ies|ied)|depend|depends|means|meant|leave|leaves|left|make|makes|made|take|takes|took|know|knows|knew|think|thinks|thought|feel|feels|felt|want|wants|wanted|use|uses|used|stay|stays|stayed|occur|occurs|occurred)\b)/i.test(raw);
  /*
   * Until v2.7.3 this was a list of fifteen literals lifted from the discovery
   * corpus — `university policy`, `the relationship between`, `details of`,
   * `character.ai companions` and friends. They matched ordinary prose openers,
   * so a sentence was forced to abstain for starting with the wrong three words:
   * "The relationship between a supervisor and a direct report is prohibited…"
   * abstained while "Any relationship between…" classified at 0.68 (review
   * finding F-5). The literals also generalised to nothing outside that corpus.
   *
   * What those fragments actually had in common is that they are headings, and
   * a heading is recognisable without knowing the corpus: it is short and it
   * predicates nothing. Testing that shape instead also closes the gap where a
   * title ending in a period, or in no punctuation at all, was read as a claim
   * (review finding F-13).
   */
  const numberedHeading = /^(?:\d+(?:\.\d+){1,}\s+|aps\s+\d+\b|journal of\b)/i.test(raw);
  if (numberedHeading) return true;
  if (isVerblessTitle(raw, hasFiniteVerb)) return true;
  return colonHeading || (questionHeading && !hasFiniteVerb);
}

function isTriageFurniture(text, fragment = '') {
  return /^(?:title:|view a pdf\b|both individuals and organizations that work with arxivlabs\b|received:|revised:|closing date and time:|bid number:|must submit\b|table\s+\d+\b|(?:host|guest|speaker)\s*:)/.test(text)
    || /^drawing on (?:a |an )?(?:hermeneutic )?(?:systematic |literature )?review and (?:a |an )?survey\b/.test(text)
    || /^(?:we investigated (?:\w+ ){0,3}questions?:|we used .*\bdata\b.*\bto (?:assess|examine|investigate)\b|we triangulated\b.*\b(?:posts?|survey|interviews?)\b|participants? (?:completed|were recruited|were assigned)|the inclusion criteria\b|the .* were interviewed using\b|some examples of (?:specific )?questions (?:included|asked) were\b|this is a brief measure\b|this report (?:covers|lists|describes)\b|throughout this report we use the term\b)/.test(text)
    || (/^participants? briefly rated\b/.test(text)
      && !/\b(?:without repeated|no repeated|rather than a relationship|not an ongoing|nonrelationship)\b/.test(text))
    || /\b(?:blood testing|routine counselling|clinic appointments?)\b/.test(text)
    || /\b(?:meet (?:the )?(?:clinic )?eligibility criteria|complete (?:the )?required consent forms)\b/.test(text)
    || /\b(?:separate ancova|between[- ]subjects? factor|as covariates?|teacher questionnaires?|response rate)\b/.test(text)
    /*
     * Coding and annotation procedure, wherever it sits in the sentence.
     * The anchored openers above only catch methods prose that starts with the
     * participants; a methods sentence that starts with its instrument ("Multiple
     * LLMs were employed to code 5,504 posts…") sailed past them and then scored
     * on its own subject matter, classifying as Asymmetric in the live queue
     * (review finding F-7). This tests the procedure verb, not the sentence head.
     */
    || /\b(?:were employed to code|we (?:coded|annotated|labell?ed)|(?:coders?|annotators?|raters?|assistants?)\s+(?:\w+\s+){0,2}(?:coded|annotated|labell?ed|rated)|were (?:coded|annotated|labell?ed)\s+(?:for|by|independently))\b/.test(text)
    /*
     * A study naming its SAMPLE, not an institution naming who it governs.
     * "407 university students", "a sample of university students and their
     * partners" and "among students at a large public university" were reaching
     * both the institution and the authority family on a population descriptor
     * and classifying as institutional governance (review finding F-6). Policy
     * prose says "the teacher-student relationship" or "supervise a student" and
     * matches none of these frames, so it keeps its authority reading.
     */
    || /\b(?:\d[\d,]*\s+(?:\w+\s+){0,2}(?:students?|undergraduates?|participants?|respondents?)|sample of\s+(?:\w+\s+){0,3}(?:students?|undergraduates?|adults?|participants?|couples?)|among students\b|(?:university|college) students\b)/.test(text)
    || /\b(?:link in the show notes|our sponsor|sponsor(?:'s|ed)? message)\b/.test(text)
    || /\b(?:msc thesis|https?:\/\/|doi:\s*10\.|pp\.\s*\d+[–-]\d+)\b/.test(text)
    || isHeadingLikeFragment(fragment);
}

/*
 * This guard runs BEFORE scoring and empties the candidate list, so a hit is a
 * veto, not a tiebreak — and its reason, "Outside the human-relational frame",
 * is an affirmative claim that the fragment describes no human relationship.
 * Three tokens could not carry that claim: `api`, `containers?` and `customer
 * support` all appear inside ordinary relational prose, and they were vetoing
 * Replika, AI-companion and supervisory-romance sentences (review finding F-4).
 * They are dropped; the multiword technical terms below still hold every
 * negative control in the corpus, measured over eight technical sources.
 */
function isTechnicalNonrelationship(text) {
  return /\b(?:rbac|role[- ]based access control|access[- ]control|database tables?|database joins?|database access|relational databases?|support databases?|sql joins?|support vectors?|service accounts?|cloud (?:providers?|accounts?)|network nodes?|worker nodes?|data (?:models?|centers?)|between (?:services|systems)|support service|robot controllers?|parent process|parent-child(?: vocabulary| in that tree| roles?)?|required owned elements|required context role|genetic algorithms?|model training|kubernetes|relationships? (?:between|among) (?:database tables?|variables?|schemas?|columns?))\b/.test(text);
}

function isDescriptiveEvidence(text) {
  return /\b(?:participants? (?:were recruited|were assigned|briefly rated)|assigned to|table \d+|standard deviations?|confidence intervals?|sample sizes?|survey of|we triangulated|report (?:covers|lists)|throughout this report we use the term|routine blood testing|counselling|clinic appointments?|eligibility criteria|complete the required consent forms|separate ancova|between[- ]subjects? factor|as covariates?|teacher questionnaires?|response rate|rates? by|analytic sample|n\s*=|(?:nearly )?one in (?:two|three|four|five|six|seven|eight|nine|ten|\d+))\b/.test(text);
}

function isBoundaryEvidence(text) {
  return /\b(?:no significant|did not|does not|not evidence|not an ongoing|outside the core|unless|varies|moderator|moderates?|interaction effect|predicted|associated|more likely|less likely|differed across|rather than|only when|reduced perceived|no marked|noncausal|does not cover|fall outside)\b/.test(text);
}

function isOutsideHumanFrame(text) {
  return /\b(?:carbon dating|kubernetes|pods?|cloud providers?|temperature and pressure|laboratory partner|noninteractive|scripted message.*rather than a relationship|one[- ]shot.*not relationship|speed[- ]dating.*not relationship maintenance)\b/.test(text);
}

function doctrineOwnersFor(umbrellaId) {
  return UMBRELLA_BY_ID.get(umbrellaId)?.currentDoctrineOwners || [];
}

function reasonFor(text, abstained, fragment, primaryUmbrellaId) {
  if (isTechnicalNonrelationship(text)) {
    return REASON_BY_ID.get('outside-human-relational-frame');
  }
  if (isOutsideHumanFrame(text)) {
    return REASON_BY_ID.get('outside-human-relational-frame');
  }
  if (isDescriptiveEvidence(text)) {
    return REASON_BY_ID.get('descriptive-fact-no-relational-mechanism');
  }
  if (isTriageFurniture(text, fragment)
      || /\b(?:advertisement|read more|subscribe|newsletter|sponsor message|welcome back|music)\b/.test(text)
      || /^(?:host|guest|speaker)\s*:/.test(text)) {
    return REASON_BY_ID.get('insufficient-evidence');
  }
  if (isBoundaryEvidence(text)) {
    return REASON_BY_ID.get('boundary-moderator-directional-evidence');
  }
  if (!abstained && doctrineOwnersFor(primaryUmbrellaId).length) {
    return REASON_BY_ID.get('existing-doctrine-retrieval-miss');
  }
  if (/\b(?:open relationship|consensual(?:ly)? non[- ]monogam(?:y|ous)|polyamor|egg freezing|biological clock|living apart together|age[- ]gap|met online)\b/.test(text)) {
    return REASON_BY_ID.get('existing-doctrine-retrieval-miss');
  }
  if (abstained) return REASON_BY_ID.get('insufficient-evidence');
  return REASON_BY_ID.get('possible-doctrine-gap');
}

function confidenceLabel(score, abstained) {
  if (abstained) return 'Abstained';
  if (score >= 0.86) return 'High';
  if (score >= 0.72) return 'Medium';
  return 'Low';
}

function publicUmbrella(id) {
  const umbrella = UMBRELLA_BY_ID.get(id);
  return umbrella ? { id: umbrella.id, label: umbrella.label } : null;
}

/**
 * Classify one fragment after the matcher has already left it unmatched.
 * The return value is deterministic, versioned, and safe to serialize.
 */
export function classifyUnmatchedPassage(fragment) {
  const text = normalizedText(fragment);
  const nonrelationalFrame = isTriageFurniture(text, fragment)
    || isTechnicalNonrelationship(text);
  const ranked = nonrelationalFrame
    ? []
    : subjectRules
      .map((rule) => scoreSubject(text, rule))
      .sort((left, right) => right.score - left.score
        || (SUBJECT_TIE_PRIORITY.get(left.id) ?? 10)
          - (SUBJECT_TIE_PRIORITY.get(right.id) ?? 10)
        || umbrellaDefinitions.findIndex((item) => item.id === left.id)
          - umbrellaDefinitions.findIndex((item) => item.id === right.id));
  const supported = ranked.filter((candidate) =>
    candidate.qualified && candidate.score >= CLASSIFICATION_THRESHOLD);
  const strongest = supported[0] || ranked[0] || {
    id: 'unclassified', score: 0, matchedSignals: [], qualified: false,
  };
  const abstained = supported.length === 0;
  const primary = abstained
    ? UMBRELLA_BY_ID.get('unclassified')
    : UMBRELLA_BY_ID.get(strongest.id);
  const secondaryCandidate = !abstained
    ? supported.find((candidate, index) => index > 0
      && candidate.score >= SECONDARY_THRESHOLD
      && strongest.score - candidate.score <= MAX_SECONDARY_GAP)
    : null;
  const reason = reasonFor(text, abstained, fragment, primary.id);
  const doctrineOwners = abstained
    ? []
    : doctrineOwnersFor(primary.id).map((owner) => ({ ...owner }));
  const signals = strongest.matchedSignals.slice(0, 4);
  const signalClause = signals.length
    ? ` The specific signals were ${signals.join(', ')}.`
    : '';
  const ownershipClause = doctrineOwners.length
    ? ` Current explanatory ownership metadata names ${doctrineOwners.map((owner) => owner.title).join(' and ')}; that is not a match decision for this fragment.`
    : '';
  const rationale = abstained
    ? `No subject umbrella cleared the evidence threshold; generic relational wording never classifies a fragment by itself.${signalClause} ${reason.explanation}`
    : `${primary.description}${signalClause} ${reason.explanation}${ownershipClause}`;

  return {
    schemaVersion: UNMATCHED_TRIAGE_SCHEMA_VERSION,
    taxonomy: {
      schemaVersion: UNMATCHED_UMBRELLA_TAXONOMY_SCHEMA_VERSION,
      version: UNMATCHED_UMBRELLA_TAXONOMY_VERSION,
    },
    primaryUmbrella: { id: primary.id, label: primary.label },
    secondaryUmbrella: secondaryCandidate ? publicUmbrella(secondaryCandidate.id) : null,
    confidence: abstained ? roundConfidence(strongest.score) : strongest.score,
    confidenceLabel: confidenceLabel(strongest.score, abstained),
    abstained,
    matchedSignals: signals,
    rationale,
    unmatchedReason: { id: reason.id, label: reason.label },
    currentDoctrineOwners: doctrineOwners,
    doctrineStatus: 'Explanatory triage only — not doctrine coverage or a doctrine match',
  };
}
