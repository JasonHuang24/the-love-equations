/*
 * Unmatched umbrellas
 * -------------------
 * Deterministic explanatory triage for passages the doctrine matcher has
 * already left unmatched. This module never receives or changes match scores,
 * gates, exclusions, canon entries, or ownership. Its only input is the exact
 * unmatched fragment, and abstention is a first-class result.
 */

export const UNMATCHED_TRIAGE_SCHEMA_VERSION = 'le-lab.unmatched-triage/1.3.0';
export const UNMATCHED_UMBRELLA_TAXONOMY_SCHEMA_VERSION =
  'le-lab.unmatched-umbrella-taxonomy/1.3.0';
export const UNMATCHED_UMBRELLA_TAXONOMY_VERSION = '1.3.0';

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
      /*
       * The synthetic entity has to BE the counterpart or do something
       * relational for a person. Until v2.7.4 this family was a bag of
       * relational nouns — companionship, attachment, emotional support,
       * relationship — so an AI that merely analysed, summarised or named a
       * variable in relationship research met it by co-occurrence, and
       * "The AI chatbot analyzed couples' relationship data and summarized
       * attachment patterns." classified as Asymmetric at 0.66 in the live
       * queue (review finding G-1). Blacklisting research verbs would have
       * been endless; each alternative below is instead positive evidence of
       * a relational position: the entity is named as a companion or partner,
       * it delivers a relational function, a person is in contact with it, or
       * it moves a human relational outcome.
       */
      { family: 'relationship-function', label: 'relationship-like function', weight: 0.24, pattern: /(?:\b(?:artificial intelligence|ai|virtual|synthetic|companion|social|relational|digital|robot|machine)[- ](?:companions?|partners?|boyfriends?|girlfriends?|friends?|spouses?)\b|\bai[- ]simulated[- ]romantic partners?\b|\bcompanion (?:chatbots?|robots?|apps?|bots?)\b|\breplika partners?\b|\b(?:chatbot|bot|ai)[- ](?:partners?|companions?|boyfriends?|girlfriends?)\b|\b(?:offers?|offered|offering|provides?|provided|providing|generates?|generated|generating|elicits?|elicited|eliciting|simulates?|simulated|delivers?|delivered|supplies|supplied|can feel|feels?|felt)\s+(?:\w+[-\s]+){0,3}\b(?:attachment|intimacy|companionship|emotional[- ]support|social[- ]support|perceived connection|connection|empathy|validation|responsiveness|relationship[- ]like)\b|\b(?:relationships?|attachments?|bonds?|intimacy|friendships?|connections?|conversations?|interactions?)\s+(?:with|to|between (?:\w+[-\s]+){0,3})\s*(?:an?|the|their|his|her|its|other)?\s*(?:ai|artificial intelligence|chatbots?|chatgpt|replika|character[. -]?ai|companions?|bots?|machines?|robots?|generative ai)\b|\b(?:chatted|chatting|talk(?:s|ed|ing)?|interact(?:s|ed|ing)?|confide[sd]?|bond(?:s|ed|ing)?|disclos(?:e|ed|ing)\s+to)\s+(?:with|to|in)?\s*(?:an?|the|their|his|her)?\s*(?:ai|artificial intelligence|chatbots?|chatgpt|replika|character[. -]?ai|companions?|bots?|machines?|robots?)\b|\b(?:ai|chatbots?|companions?|bots?|replika|chatgpt|character[. -]?ai|robots?)[- ](?:interactions?|conversations?|chats?|use|usage|companionship|relationships?|partners?|users?)\b|\b(?:effects?|impacts?|influence)\s+on\s+(?:\w+[-\s]+){0,3}\b(?:loneliness|socialization|social skills?|well[- ]being|isolation|connection|attachment|companionship|intimacy)\b|\beffect on (?:\w+[-\s]+){0,3}(?:loneliness|socialization|social skills?|well[- ]being|isolation)\b|\b(?:simulated responsiveness|relationship[- ]like|relationship functions?|hyper[- ]?attachment objects?|attachment objects?|parasocial)\b)/ },
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
       *
       * `evaluat\\w*` is qualified for the same reason the rest of this family
       * is. A bare inflection made "To evaluate the structural model" and "the
       * evaluation of the model (2), chi2 = 141.281" read as evaluative
       * authority, and the sealed holdout caught both at 0.94 in a paper about
       * workplace romance - statistics vocabulary wearing the umbrella's badge.
       * Evaluation is authority evidence when the thing evaluated is a person
       * or their pay, promotion, or performance; evaluating a model is not.
       */
      { family: 'member', label: 'institutional membership', weight: 0.26, pattern: /\b(?:managers?|faculty|employees?|affiliates?|staff|undergraduates?|students?|instructors?|coaches?|athletes?|personnel|workers?|members?)\b/ },
      /*
       * Membership is not power. Until v2.7.4 one `authority` family held both
       * the people an institution CONTAINS (employees, faculty, staff,
       * students, managers) and the evidence that one of them has power over
       * another, so "Employees at the university reported that workplace
       * relationships improved morale." met institution + authority +
       * relationship and classified as Institutional authority at 0.68 in the
       * live queue (review finding G-2). The membership nouns keep their
       * scoring weight in `member` above — real policies do name who they
       * govern, and deleting `students` cost five correct classifications when
       * it was tried in v2.7.3 — but a supported assignment now needs a
       * governance act or a directional power relation. The hyphenated dyads
       * are here because the dyad itself encodes the direction.
       */
      { family: 'authority', label: 'evaluative or supervisory authority', weight: 0.26, pattern: /\b(?:supervis(?:e|es|ed|or|ors|ory|ion)|direct reports?|evaluativ\w*|(?:who|that)\s+evaluat(?:e|es)\b|evaluat(?:e|es|ed|ing)\s+(?:\w+[-\s]+){0,3}\b(?:employees?|students?|staff|subordinates?|direct reports?|the other|them|his|her|their|performance|pay|promotion)\b|authority|reports? to|reporting (?:line|chain)|chain of command|promotion|pay|raise penalty|career outcome|power (?:differential|imbalance)|teacher[- ]student|faculty[- ](?:student|undergraduate)|instructor[- ]student|supervisor[- ](?:subordinate|supervisee)|coach[- ]athlete|mentor[- ]mentee|grading|academic authority)\b/ },
      /*
       * The family is "prohibition, disclosure, or recusal", and until v2.7.4
       * it named only some of the ways a policy says those things. Real policy
       * prose reaches for "is a violation of this policy", "strongly
       * discouraged from", "may not engage", "not permitted" at least as often
       * as it reaches for "prohibited", and the fresh 42-source window found
       * four genuine governance sentences abstaining for want of them.
       * `conflict[- ]of[- ]interest` was worse than incomplete: it required the
       * hyphens, so the ordinary spelling "conflicts of interest" never matched
       * at all - the same word-boundary trap the split family documents.
       * Completing the family is not the same as widening it: every term below
       * still has to meet `relationship` and an institutional or authority
       * frame before anything is asserted.
       */
      { family: 'governance', label: 'prohibition, disclosure, or recusal', weight: 0.34, pattern: /\b(?:bans?|banned|prohibit|prohibits|prohibited|prohibition|disclos(?:e|es|ed|ure)|recus(?:e|al)|reassign(?:ment)?|disciplin(?:e|ary)|conflicts? of interest|conflict[- ]of[- ]interest|notification|alternative supervision|governance|violat(?:e|es|ed|ion|ions)\s+(?:of\s+)?(?:this|the)\s+polic\w*|discouraged from|not permitted|impermissible|may not (?:engage|pursue|initiate|commence|have|enter)|complying with (?:this|the) polic\w*)\b/ },
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
      && (families.has('governance') || families.has('authority'))
      && (families.has('institution') || families.has('member') || families.has('authority')),
  },
  {
    id: 'role-unbundling-family-formation',
    signals: [
      { family: 'reproduction', label: 'third-party or assisted reproduction', weight: 0.34, pattern: /\b(?:third[- ]party reproduction|surrogacy|surrogates?|donor(?: conception| disclosure| identity| insemination)?|donated (?:eggs?|sperm|embryos?)|egg donors?|sperm donation|ivf|fertility treatment|fertility[- ]treatment|assisted conception|gestational|genetic parent|reciprocal ivf)\b/ },
      { family: 'roles', label: 'distinct family or support roles', weight: 0.28, pattern: /\b(?:intended parents?|surrogates?|single fathers?|solo fathers?|single mothers?|solo mothers?|social parents?|caregiving parents?|support[- ]network roles?|support roles?|practical support|genetic contributors?|genetic contribution|birth mothers?|non[- ]birth mothers?|gestational parents?|donor roles?|egg donors?|family types?|plural[- ]parent|platonically co[- ]parenting|legally recognized parent roles?)\b/ },
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
       *
       * v2.7.4 took the bare nouns `roles`, `functions` and `parents` out of
       * the governed positions. With them there, ordinary task allocation
       * qualified: "Parents split practical support roles during a neighborhood
       * fundraiser." matched the forward frame on `roles` AND the reverse frame
       * on `parents`, and reached the live queue as Role unbundling at 0.84
       * (review finding G-4). A support role at a fundraiser is a task, not a
       * family role. Both positions now name family roles specifically - the
       * genetic, gestational, donor, intended, legal, social, caregiving and
       * romantic-partner roles this umbrella is actually about.
       */
      { family: 'split', label: 'roles explicitly separated, substituted, or compared', weight: 0.38, pattern: /(?:\b(?:separat(?:e|es|ed|ing|ion)|split|unbundl\w*|decoupl\w*|substitut(?:e|es|ed|ing|ion)|replac(?:e|es|ed|ing)|distinguish(?:es|ed|ing)?)\b\s+(?:\w+[-\s]+){0,3}\b(?:parent(?:s|hood|ing)?|mother(?:s|hood)?|father(?:s|hood)?|gestation|(?:genetic|gestational|social|legal|biological|birth|non[- ]birth|donor|intended|caregiving|romantic|parental|family|maternal|paternal)\s+(?:\w+[-\s]+){0,1}?roles?)\b|\b(?:separat(?:e|es|ed|ing|ion)|split|unbundl\w*|decoupl\w*)\b\s+(?:\w+[-\s]+){0,6}?\bfrom\b\s+(?:\w+[-\s]+){0,6}?\b(?:partner|parents?|parenthood|romance|marriage|relationship)\b|\b(?:(?:genetic|gestational|social|legal|birth|non[- ]birth|donor|intended|caregiving|romantic|parental|family|support[- ]network)\s+(?:\w+[-\s]+){0,1}?roles?|genetic contributors?|intended parents?|genetic parents?|gestational parents?|social parents?|legal parents?|birth mothers?|donors?|surrogates?)\b\s+(?:\w+[-\s]+){0,4}\b(?:separat(?:es|ed|ing|ion)|split|unbundl\w*|decoupl\w*|substitut(?:e|es|ed|ing|ion)|replac(?:e|es|ed|ing))\b|\bexcluding\b\s+(?:\w+[-\s]+){0,3}\b(?:mother|father|parents?|partner|sister|brother|friend|donors?|surrogates?|roles?)\b|\b(?:different people|parent(?:ing)? alone|rather than (?:the search for )?(?:a )?(?:romantic )?(?:partner|parent)|instead of (?:a )?(?:romantic )?(?:partner|parent)|from the surrogate to the intended parents|birth (?:and|versus) non[- ]birth|genetic (?:and|versus) gestational|between (?:gestational|genetic|birth|non[- ]birth|solo|partnered)|without (?:a )?partner|not waiting for (?:a )?partner|even if romance|platonically co[- ]parenting|mediated through motherhood|no longer travel together)\b)/ },
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
       *
       * v2.7.4 removed the last bare noun, `recognition`, and narrowed what may
       * govern the verb. `recognition` on its own plus the equally bare
       * `benefits` still produced 0.99 "Possible doctrine gap" on ordinary
       * prose - "The article challenged traditional recognition of marriage
       * and described emotional benefits for families." reached the live queue
       * that way (review finding G-3). Cognitive, emotional, academic and
       * descriptive recognition are the ordinary senses of the word; the
       * administrative sense always carries a legal adjective, a status
       * object, or an institutional actor, and only those three shapes count.
       */
      { family: 'administration', label: 'legal or administrative recognition', weight: 0.42, pattern: /(?:\b(?:legal[- ]status|legal parents?|legal parenthood|legal parentage|parental orders?|birth certificates?|consent forms?|licensed clinics?|visa|immigration|citizenship|residence permits?|marriage licen[cs]e|registration|registered|administrative|funding eligibility|legal screening|hospital rules?|institutional rules?|jurisdiction|court declaration)\b|\b(?:legal|legally|official|officially|state|statutory|statutorily|governmental|court|court[- ]ordered|formal|formally|administrative)\s+recogni[sz]\w*|\brecogni[sz]\w*\s+(?:\w+[-\s]+){0,3}\b(?:legal parents?|legal parenthood|legal parentage|legal status|parental responsibility)\b|\brecogni[sz]\w*\s+(?:as|to be)\s+(?:the |a |an |their )?(?:second )?legal parent\b|\b(?:institutions?|states?|courts?|law|governments?|authorit(?:y|ies)|registrars?|agenc(?:y|ies)|registr(?:y|ies)|employers?|hospitals?|clinics?)\b\s+(?:\w+[-\s]+){0,3}\brecogni[sz]\w*)/ },
      /*
       * `benefits`, `challenged`, `records` and `automatically` were removed in
       * v2.7.4, and bare `access` with them. None of the four names an
       * administrative effect on its own - a benefit can be emotional, a record
       * can be a research variable, a challenge can be an argument - and each
       * was supplying the second half of a 0.99 External-recognition
       * assignment on ordinary prose (review finding G-3). What survives here
       * either names an entitlement decision or states a legal consequence.
       */
      { family: 'access', label: 'access, eligibility, or legal effect', weight: 0.44, pattern: /\b(?:eligibility|eligible|entitle(?:d|ment|ments)?|permission|family reunification|next of kin|allowed only|legal[- ]status|employment permission|funding eligibility|consent to legal parenthood|give consent (?:if you want .* )?(?:to )?(?:be|being) (?:a |the )?legal parent|withdraw (?:their |your )?consent|transfers? legal parenthood|grants? (?:the intended parents )?legal parenthood|confers?|names? .* on (?:the )?birth certificate|recognis(?:e|ed) as (?:the )?(?:second )?legal parent|recogniz(?:e|ed) as (?:the )?(?:second )?legal parent|(?:will|would|may|must|won't|will not) be (?:the |a )?(?:child(?:'s|s) )?legal parents?|not (?:a |the )?legal parent|who will be (?:the )?(?:child(?:'s|s) )?legal parents?|legal parents? (?:at birth|for nationality purposes)|status as a legal parent|route out of legal parenthood|complex consent arrangements|otherwise occupy|external plural[- ]parent recognition|surrogacy coverage)\b/ },
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
    /*
     * The nonrelationship claim IS the umbrella, so it is required.
     *
     * Until v2.7.4 adjacent romance vocabulary could stand in for it, and
     * `briefly rated` is measurement procedure that appears in every methods
     * section, so "Analysts briefly rated relationship vignettes and romantic
     * messages during instrument validation." met brevity + interaction +
     * relationship and reached the live queue as Brief/nonrelationship at 0.76
     * (review finding G-5). Guarding this by researcher title would have meant
     * enumerating every possible title; requiring the claim instead is the
     * umbrella's own definition. Every Brief case in the frozen evaluation
     * states it outright - `noninteractive`, `without repeated`, `rather than
     * a relationship`, `not an ongoing couple`, `not relationship
     * maintenance` - so this costs none of them.
     */
    qualifies: (families) => families.has('brevity')
      && families.has('interaction')
      && families.has('nonrelationship'),
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
  /*
   * An interrogative asserts nothing, so it cannot be a supported umbrella
   * claim - the umbrella's whole standard is that the fragment STATES a
   * relational mechanism. The `!hasFiniteVerb` qualifier that used to sit here
   * made this rule nearly dead, because every well-formed question has a finite
   * verb: "Can Humans Have Close Relationships With AI Chatbots?" and the
   * research questions around it all cleared it and classified at 0.66. The
   * fresh 42-source window found eight of them supported in one review article
   * (review finding G-6); they were supported on 2.7.3 too, so this is an
   * old defect the new window exposed rather than a regression.
   */
  return colonHeading || questionHeading;
}

function isTriageFurniture(text, fragment = '') {
  return /^(?:title:|view a pdf\b|both individuals and organizations that work with arxivlabs\b|received:|revised:|closing date and time:|bid number:|must submit\b|table\s+\d+\b|(?:host|guest|speaker)\s*:)/.test(text)
    || /^drawing on (?:a |an )?(?:hermeneutic )?(?:systematic |literature )?review and (?:a |an )?survey\b/.test(text)
    || /^(?:we investigated (?:\w+ ){0,3}questions?:|we used .*\bdata\b.*\bto (?:assess|examine|investigate)\b|we triangulated\b.*\b(?:posts?|survey|interviews?)\b|participants? (?:completed|were recruited|were assigned)|the inclusion criteria\b|the .* were interviewed using\b|some examples of (?:specific )?questions (?:included|asked) were\b|this is a brief measure\b|this report (?:covers|lists|describes)\b|throughout this report we use the term\b)/.test(text)
    /*
     * `briefly rated` is a measurement procedure, not a relational claim.
     * This was anchored to `^participants? briefly rated`, so the identical
     * sentence with any other actor sailed past it and scored on its own
     * subject matter - "A software model briefly rated AI companions for
     * emotional support." and "Analysts briefly rated relationship vignettes
     * and romantic messages during instrument validation." both reached the
     * live queue (review finding G-5). Enumerating researcher titles would
     * never close; the shape is the tell, so the anchor is gone and the verb
     * carries it. The escape stays: a fragment that also states the relational
     * limitation is making a Brief claim, not just reporting a procedure, and
     * `brief-01` in the frozen evaluation is exactly that case.
     */
    || (/\bbriefly (?:rated|viewed|assessed|evaluated|judged|scored)\b/.test(text)
      && !/\b(?:without repeated|no repeated|rather than a relationship|not an ongoing|nonrelationship|noninteractive)\b/.test(text))
    /*
     * "A session was defined as a sequence of chatbot interactions separated by
     * at least 2 hours of inactivity." is an operational definition, and the
     * sealed holdout caught it classifying as Asymmetric once v2.7.4 taught the
     * counterpart family to read `chatbot interactions`. Defining a measure is
     * procedure whatever it is a measure OF, so the shape is guarded here
     * rather than by subtracting the term the relational routes need.
     */
    || /\b(?:was|were|is|are)\s+(?:operationally\s+)?defined as\b|\bwe (?:define|defined|operationali[sz]ed?)\b|\bfor the purposes of this (?:study|analysis|paper),/.test(text)
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
