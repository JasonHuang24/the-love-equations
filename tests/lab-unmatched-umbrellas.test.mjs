import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { normalizeInput } from '../js/lab-intake.js';
import {
  ANALYZER_VERSION,
  RESEARCH_QUEUE_SCHEMA_VERSION,
  analyzeDocument,
} from '../js/lab-analyzer.js';
import {
  UNMATCHED_TRIAGE_SCHEMA_VERSION,
  UNMATCHED_UMBRELLA_TAXONOMY,
  UNMATCHED_UMBRELLA_TAXONOMY_VERSION,
  classifyUnmatchedPassage,
} from '../js/lab-unmatched-umbrellas.js';

const HISTORICAL_EVALUATION = JSON.parse(readFileSync(
  new URL('./fixtures/unmatched-umbrella-evaluation.json', import.meta.url),
  'utf8',
));
const SUCCESSOR = JSON.parse(readFileSync(
  new URL('./fixtures/unmatched-umbrella-evaluation-1.1.json', import.meta.url),
  'utf8',
));

function successorEvaluation(base, successor) {
  const corrections = new Map(successor.caseCorrections.map((item) => [item.id, item]));
  const inherited = base.cases.map((fixture) => {
    const correction = corrections.get(fixture.id) || {};
    return {
      ...fixture,
      ...correction,
      expected: { ...fixture.expected, ...(correction.expected || {}) },
    };
  });
  return { ...successor, cases: [...inherited, ...successor.cases] };
}

const EVALUATION = successorEvaluation(HISTORICAL_EVALUATION, SUCCESSOR);
const CANON = JSON.parse(readFileSync(
  new URL('../data/le-canon-index.json', import.meta.url),
  'utf8',
));
const ADVERSARIAL = JSON.parse(readFileSync(
  new URL('./fixtures/unmatched-umbrella-adversarial-1.1.json', import.meta.url),
  'utf8',
));
const ADVERSARIAL_13 = JSON.parse(readFileSync(
  new URL('./fixtures/unmatched-umbrella-adversarial-1.3.json', import.meta.url),
  'utf8',
));
const EVALUATION_13 = JSON.parse(readFileSync(
  new URL('./fixtures/unmatched-umbrella-evaluation-1.3.json', import.meta.url),
  'utf8',
));
const EVALUATION_14 = JSON.parse(readFileSync(
  new URL('./fixtures/unmatched-umbrella-evaluation-1.4.json', import.meta.url),
  'utf8',
));

const EXPECTED_UMBRELLAS = [
  ['asymmetric-nonhuman-relationships', 'Asymmetric or nonhuman relationships'],
  ['institutional-authority-governance', 'Institutional authority and governance'],
  ['role-unbundling-family-formation', 'Role unbundling and family formation'],
  ['external-recognition-administrative-access', 'External recognition and administrative access'],
  ['brief-nonrelationship-interactions', 'Brief or nonrelationship interactions'],
  ['unclassified', 'Unclassified'],
];
const EXPECTED_REASONS = [
  ['possible-doctrine-gap', 'Possible doctrine gap'],
  ['existing-doctrine-retrieval-miss', 'Existing doctrine, retrieval miss'],
  ['boundary-moderator-directional-evidence', 'Boundary, moderator, or directional evidence'],
  ['descriptive-fact-no-relational-mechanism', 'Descriptive fact without a relational mechanism'],
  ['outside-human-relational-frame', 'Outside the human-relational frame'],
  ['insufficient-evidence', 'Insufficient evidence to classify'],
];

test('taxonomy is versioned, complete, deterministic triage rather than doctrine', () => {
  assert.equal(UNMATCHED_UMBRELLA_TAXONOMY_VERSION, '1.4.6');
  assert.equal(
    UNMATCHED_UMBRELLA_TAXONOMY.schemaVersion,
    'le-lab.unmatched-umbrella-taxonomy/1.4.6',
  );
  assert.deepEqual(
    UNMATCHED_UMBRELLA_TAXONOMY.umbrellas.map(({ id, label }) => [id, label]),
    EXPECTED_UMBRELLAS,
  );
  assert.deepEqual(
    UNMATCHED_UMBRELLA_TAXONOMY.unmatchedReasons.map(({ id, label }) => [id, label]),
    EXPECTED_REASONS,
  );
  assert.match(UNMATCHED_UMBRELLA_TAXONOMY.status, /not doctrine coverage/i);
  const owned = Object.fromEntries(UNMATCHED_UMBRELLA_TAXONOMY.umbrellas
    .map(({ id, currentDoctrineOwners }) => [id, currentDoctrineOwners.map((owner) => owner.id)]));
  assert.deepEqual(owned['asymmetric-nonhuman-relationships'], [
    'frameworks:synthetic-reciprocity',
  ]);
  assert.deepEqual(owned['institutional-authority-governance'], [
    'frameworks:authority-firewall',
  ]);
});

test('historical 1.0 evidence remains intact and 1.1 transparently corrects brief-03', () => {
  const historical = HISTORICAL_EVALUATION.cases.find(({ id }) => id === 'brief-03');
  const successor = EVALUATION.cases.find(({ id }) => id === 'brief-03');
  assert.equal(historical.kind, 'negative-control');
  assert.equal(historical.expected.abstained, false);
  assert.equal(successor.kind, 'positive');
  assert.equal(SUCCESSOR.extends, 'unmatched-umbrella-evaluation.json');
  assert.match(SUCCESSOR.review.historicalCorrection, /contradicted the fixture standard/i);
});

test('sealed 1.1 set has exact umbrella, reason, secondary, and abstention agreement', () => {
  assert.equal(EVALUATION.status, 'sealed-after-1.1-standard-reconciliation-before-final-tuning');
  assert.equal(EVALUATION.cases.length, 61);
  assert.equal(new Set(EVALUATION.cases.map(({ id }) => id)).size, 61);
  const predicted = [];
  for (const fixture of EVALUATION.cases) {
    const first = classifyUnmatchedPassage(fixture.text);
    const second = classifyUnmatchedPassage(fixture.text);
    const normalizedVariant = classifyUnmatchedPassage(
      `  ${fixture.text.toUpperCase().replace(/\s+/g, '   ')}  `,
    );
    const transportVariant = classifyUnmatchedPassage(
      `\u200b${fixture.text.replace(/ /g, '\u00a0').replace(/\. /g, '.\r\n')}\u2060`,
    );
    assert.deepEqual(second, first, `${fixture.id}: classification drifted across identical runs`);
    assert.deepEqual(
      normalizedVariant,
      first,
      `${fixture.id}: category changed under case or whitespace normalization`,
    );
    assert.deepEqual(
      transportVariant,
      first,
      `${fixture.id}: category changed under transport whitespace or invisible controls`,
    );
    assert.equal(first.schemaVersion, UNMATCHED_TRIAGE_SCHEMA_VERSION);
    assert.equal(first.primaryUmbrella.id, fixture.expected.primaryUmbrellaId, fixture.id);
    assert.equal(first.secondaryUmbrella?.id ?? null, fixture.expected.secondaryUmbrellaId, fixture.id);
    assert.equal(first.unmatchedReason.id, fixture.expected.unmatchedReasonId, fixture.id);
    assert.equal(first.abstained, fixture.expected.abstained, fixture.id);
    assert.ok(first.confidence >= 0 && first.confidence <= 0.99, fixture.id);
    assert.match(first.doctrineStatus, /not doctrine coverage or a doctrine match/i);
    predicted.push(first);
  }

  for (const fixture of EVALUATION.cases.filter(({ kind }) => kind === 'negative-control')) {
    assert.equal(fixture.expected.abstained, true, `${fixture.id}: fixture standard`);
    assert.equal(
      classifyUnmatchedPassage(fixture.text).abstained,
      true,
      `${fixture.id}: every successor negative control must actually abstain`,
    );
  }

  const supported = predicted.filter((item) => !item.abstained);
  const abstained = predicted.length - supported.length;
  assert.equal(supported.length, 36);
  assert.equal(abstained, 25);
  assert.equal(Math.round((abstained / predicted.length) * 10_000) / 100, 40.98);
});

test('generic relational words, furniture, methods, tables, and nonhuman word collisions abstain', () => {
  const controls = [
    'Relationships matter to people in many different ways.',
    'He is my only romantic partner.',
    'Participants were assigned to conditions and Table 4 reports the confidence interval.',
    'ADVERTISEMENT. Read more. Subscribe to the newsletter.',
    'The relationship between pressure and temperature remained linear.',
    'The cloud provider assigned a support role to each Kubernetes pod.',
    'Title: AI Companion Relationships and Well-Being',
    'View a PDF of the paper titled AI Companion Relationships and Well-Being.',
    'Drawing on a hermeneutic literature review and a survey, we develop and test a model of AI companion intimacy.',
    'This is a brief measure of life history strategies that includes a relationship item.',
    'So you mentioned briefly how conversations differ with a longtime partner.',
    'The inclusion criteria for solo mothers required donor insemination and no cohabiting relationship.',
    'In light of the teachers’ response rate, a separate ANCOVA, with family type as a between-subjects factor and parent age as a covariate, was conducted.',
    'Previous Studies on AI Relationship Technologies',
    'Ask yourselves these questions before treatment to make sure your partner will be the legal parent:',
    'Me, My AI Boyfriend, and I (pp. 1–61) [MSc Thesis]. https://example.test/reference',
    'The AI system models relationships between database tables and provides support for joins.',
    'The chatbot service establishes a connection to the support database but has no user companionship function.',
    'University policy requires supervisors to disclose database security incidents and recuse from the audit.',
    'The organization prohibits managers from evaluating access-control requests without notification.',
    'The parent process splits support roles among worker nodes during family formation of containers.',
    'A genetic algorithm separates parent and child roles during model training.',
    'Registered service accounts are automatically eligible for database access.',
    'Administrative recognition grants permission to access the cloud account.',
    'A short interaction between network nodes records latency.',
    'The system briefly rated messages during one interaction between services.',
    'The robot controller forms a connection to its support service.',
    'A virtual companion process manages relationships between schemas.',
    'The customer-support chatbot responds to queries and offers support.',
    'The virtual companion package supports relationships between data models.',
    'Cross-border network access connects two data centers.',
    'A brief interaction connected two systems.',
    'The AI chatbot connection to the API had lower latency.',
  ];
  controls.forEach((fragment) => {
    const result = classifyUnmatchedPassage(fragment);
    assert.equal(result.primaryUmbrella.id, 'unclassified', fragment);
    assert.equal(result.abstained, true, fragment);
  });

  for (const token of [
    'relationship', 'partner', 'support', 'authority', 'policy', 'parent',
    'role', 'access', 'recognition', 'interaction', 'brief', 'AI',
  ]) {
    const fragment = `This note mentions ${token}, but states no specific mechanism.`;
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  assert.equal(
    classifyUnmatchedPassage(
      'What non-monogamous love means is not resolved by this fragment.',
    ).unmatchedReason.id,
    'insufficient-evidence',
    'ordinary verb “means” must not imply a descriptive-statistics reason',
  );
  assert.equal(
    classifyUnmatchedPassage(
      'Table 2 reports standard deviations, confidence intervals, and sample sizes.',
    ).unmatchedReason.id,
    'descriptive-fact-no-relational-mechanism',
    'statistical table language must keep the descriptive-fact reason',
  );
  assert.equal(
    classifyUnmatchedPassage(
      'A longitudinal study is needed, one in which people report outcomes later.',
    ).unmatchedReason.id,
    'insufficient-evidence',
    'the clause “one in which” must not be parsed as a one-in-N statistic',
  );
  assert.equal(
    classifyUnmatchedPassage(
      'Nearly one in three respondents reported the outcome.',
    ).unmatchedReason.id,
    'descriptive-fact-no-relational-mechanism',
    'a genuine one-in-N statistic must keep the descriptive-fact reason',
  );

  for (const technicalFragment of [
    'It does not include objects which have relationships other than parent-child in that tree.',
    "A role that has 'required owned elements' does not imply the reverse relationship.",
    "A role that has 'required context role' does not imply the reverse relationship.",
  ]) {
    assert.equal(
      classifyUnmatchedPassage(technicalFragment).unmatchedReason.id,
      'outside-human-relational-frame',
      technicalFragment,
    );
  }
});

test('adversarial 1.1 probes distinguish direct future-safety from live unmatched results', async () => {
  const liveCounts = { mapped: 0, unmatched: 0, excluded: 0, 'no-claim': 0 };
  for (const fixture of ADVERSARIAL.cases) {
    const direct = classifyUnmatchedPassage(fixture.text);
    assert.equal(direct.primaryUmbrella.id, fixture.directPrimary, `${fixture.id}: direct primary`);
    assert.equal(direct.unmatchedReason.id, fixture.directReason, `${fixture.id}: direct reason`);

    const analysis = await analyzeDocument(normalizeInput({
      title: `Adversarial probe ${fixture.id}`,
      text: fixture.text,
    }), CANON);
    const liveState = analysis.metrics.mappedClaimSegments > 0
      ? 'mapped'
      : analysis.metrics.unmappedClaimSegments > 0
        ? 'unmatched'
        : analysis.metrics.ignoredDomainSegments > 0
          ? 'excluded'
          : 'no-claim';
    assert.equal(liveState, fixture.liveState, `${fixture.id}: live population`);
    liveCounts[liveState] += 1;

    if (liveState === 'unmatched') {
      const item = analysis.researchQueue.items[0];
      assert.equal(item.excerpt, fixture.text, `${fixture.id}: exact live fragment`);
      assert.equal(item.unmatchedTriage.primaryUmbrella.id, fixture.directPrimary, fixture.id);
      assert.equal(item.unmatchedTriage.unmatchedReason.id, fixture.directReason, fixture.id);
      if (fixture.nearestContains) {
        assert.ok(
          item.nearestConcepts.some(({ canonId }) => canonId === fixture.nearestContains),
          `${fixture.id}: expected doctrine owner among nearest nonmatches`,
        );
      }
    }
  }
  assert.deepEqual(liveCounts, { mapped: 1, unmatched: 5, excluded: 13, 'no-claim': 1 });
});

test('owned territory explains retrieval miss without flattening boundary evidence', () => {
  const synthetic = classifyUnmatchedPassage(
    'A Replika partner offers attachment while lacking consent, agency, welfare, or any ability to leave.',
  );
  assert.equal(synthetic.unmatchedReason.id, 'existing-doctrine-retrieval-miss');
  assert.deepEqual(synthetic.currentDoctrineOwners, [{
    id: 'frameworks:synthetic-reciprocity',
    title: 'Synthetic Reciprocity',
  }]);
  assert.match(synthetic.rationale, /Synthetic Reciprocity/);

  const boundary = classifyUnmatchedPassage(
    'The ban does not cover coworkers outside the reporting line unless one can evaluate the other’s pay or promotion.',
  );
  assert.equal(boundary.primaryUmbrella.id, 'institutional-authority-governance');
  assert.equal(boundary.unmatchedReason.id, 'boundary-moderator-directional-evidence');
  assert.deepEqual(boundary.currentDoctrineOwners, [{
    id: 'frameworks:authority-firewall',
    title: 'The Authority Firewall',
  }]);
});

test('live analyzer adds triage only after a passage remains unmatched', async () => {
  const fragment =
    'A relationship outside the reporting chain reduced perceived commitment but produced no significant promotion or raise penalty.';
  const analysis = await analyzeDocument(normalizeInput({
    title: 'Post-match triage integration fixture',
    text: fragment,
  }), CANON);

  assert.equal(ANALYZER_VERSION, '2.7.11');
  assert.equal(RESEARCH_QUEUE_SCHEMA_VERSION, 'le-lab.research-queue/2.3');
  assert.equal(analysis.metrics.mappedClaimSegments, 0);
  assert.equal(analysis.metrics.unmappedClaimSegments, 1);
  assert.equal(analysis.researchQueue.itemCount, 1);
  assert.equal(analysis.researchQueue.items[0].excerpt, fragment);
  assert.equal(
    analysis.researchQueue.items[0].unmatchedTriage.primaryUmbrella.id,
    'institutional-authority-governance',
  );
  assert.match(analysis.researchQueue.items[0].nearestConceptsStatus, /nonmatches/i);
  assert.equal(
    analysis.researchQueue.umbrellaTaxonomy.version,
    UNMATCHED_UMBRELLA_TAXONOMY_VERSION,
  );

  const generic = await analyzeDocument(normalizeInput({
    title: 'Explicit abstention control',
    text: 'Relationships matter to people in many different ways.',
  }), CANON);
  assert.equal(generic.metrics.unmappedClaimSegments, 1);
  assert.equal(generic.researchQueue.items.length, 1);
  assert.equal(generic.researchQueue.items[0].unmatchedTriage.abstained, true);
  assert.equal(
    generic.researchQueue.items[0].unmatchedTriage.primaryUmbrella.id,
    'unclassified',
  );
  assert.equal(
    generic.researchQueue.items[0].unmatchedTriage.unmatchedReason.id,
    'insufficient-evidence',
  );

  const mapped = await analyzeDocument(normalizeInput({
    title: 'Mapped control',
    text: 'Attention is not selection, and selection is not retention.',
  }), CANON);
  assert.ok(mapped.metrics.mappedClaimSegments > 0);
  assert.equal(mapped.researchQueue.itemCount, 0);
  assert.equal(mapped.segments.some((segment) => 'unmatchedTriage' in segment), false);
});

/*
 * v2.7.3 review guards.
 *
 * Each case below was reproduced against v2.7.2 before the rule it guards was
 * written, and each one failed then: 29 of 61 such assertions were red on the
 * shipped build. They are grouped by the review finding they close, so a future
 * regression names the defect it reintroduces rather than a line number.
 */
test('F-1 role unbundling needs a separation mechanism, not the token "separate"', () => {
  for (const fragment of [
    'The clinic keeps separate records for donors and intended parents.',
    'Separate consent forms are stored for each surrogate and each intended parent.',
    'The report lists patients, donors, intended parents, and surrogates in separate columns.',
    'Donors and intended parents are counselled in separate rooms.',
    'The registry stores donor and surrogate data in separate databases.',
    'Separate fees apply to egg donors and to intended parents.',
    'Applicants are seen in separate appointments: the surrogate first, then the intended parents.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  for (const fragment of [
    'In these families the genetic parent, the gestational parent, and the social parent are different people.',
    'Solo mothers by choice separate the decision to have a child from the search for a romantic partner, so the genetic and social parent roles no longer travel together.',
    'These men chose solo fatherhood through surrogacy rather than the search for a romantic partner.',
  ]) {
    assert.equal(
      classifyUnmatchedPassage(fragment).primaryUmbrella.id,
      'role-unbundling-family-formation',
      fragment,
    );
  }
});

test('F-2 external recognition needs an administrative effect, not the word "recognize"', () => {
  for (const fragment of [
    'In a study, parents using Indian surrogates express affection and recognize mutual benefit through compensation, but some feel a loss of control.',
    'Couples recognize the benefit of sharing housework and report higher satisfaction.',
    'Intended parents recognize the benefits of an open donor relationship.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  for (const fragment of [
    'A parental order transfers legal parenthood from the surrogate to the intended parents.',
    "Until the parental order is granted, the surrogate and her spouse remain the child's legal parents and the intended parents have no legal status.",
    'If the surrogate is single, then the man providing the sperm (if he wants to be the father) will automatically be the second legal parent at birth.',
  ]) {
    assert.equal(
      classifyUnmatchedPassage(fragment).primaryUmbrella.id,
      'external-recognition-administrative-access',
      fragment,
    );
  }
});

test('F-4 the technical guard never denies the human frame to relational prose', () => {
  for (const fragment of [
    'Participants said their AI companion felt more emotionally responsive than a customer support agent, despite having no independent needs or welfare.',
    'Users describe their Replika partner as offering attachment while having no welfare, agency, or ability to leave, and the API had lower latency.',
    'The organization bans managers from dating direct reports and requires disclosure; records are stored in sealed containers.',
    'A companion chatbot offers intimacy without reciprocity, unlike the customer support scripts it was built on.',
  ]) {
    assert.notEqual(
      classifyUnmatchedPassage(fragment).unmatchedReason.id,
      'outside-human-relational-frame',
      fragment,
    );
  }

  // The multiword technical terms still have to hold every negative control.
  for (const fragment of [
    'Role-based access control assigns parent and child roles to service accounts in the database.',
    'Cloud service accounts inherit access from the parent project.',
    'The AI system models relationships between database tables and provides support for joins.',
    'The parent process splits support roles among worker nodes during family formation of containers.',
    'The virtual companion package supports relationships between data models.',
    'The customer-support chatbot responds to queries and offers support.',
    'The AI chatbot connection to the API had lower latency.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }
});

test('F-5 no corpus literal decides whether ordinary prose is furniture', () => {
  const opener = classifyUnmatchedPassage(
    'The relationship between a supervisor and a direct report is prohibited when one evaluates the other for promotion or pay.',
  );
  const rewritten = classifyUnmatchedPassage(
    'Any relationship between a supervisor and a direct report is prohibited when one evaluates the other for promotion or pay.',
  );
  assert.equal(opener.primaryUmbrella.id, 'institutional-authority-governance');
  assert.equal(
    opener.primaryUmbrella.id,
    rewritten.primaryUmbrella.id,
    'changing the first word must not change the classification',
  );
  assert.equal(
    classifyUnmatchedPassage(
      'University policy bans supervisors from dating their direct reports and requires disclosure and reassignment.',
    ).primaryUmbrella.id,
    'institutional-authority-governance',
  );
});

test('F-6 a research sample is not an institution governing its members', () => {
  for (const fragment of [
    'Narcissistic traits as mediators in the relationship between parenting styles and nonconsensual nonmonogamy in university students',
    'Their study with 407 university students from Turkey showed lower relationship satisfaction.',
    'Relationship quality was measured in a sample of university students and their partners.',
    'Among students at a large public university, romance was reported by 38 percent.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  for (const fragment of [
    'Therefore, Boston University policy is that no affiliate shall supervise a student with whom the affiliate has a consensual romantic or sexual relationship.',
    'An Employee is prohibited from engaging in an amorous relationship with any undergraduate student, whether matriculated at UVM or enrolled as a non-degree student, regardless of the perception of consent by both participants.',
  ]) {
    assert.equal(
      classifyUnmatchedPassage(fragment).primaryUmbrella.id,
      'institutional-authority-governance',
      fragment,
    );
  }

  assert.equal(
    classifyUnmatchedPassage(
      'The integrity and professionalism of the teacher-student relationship is fundamental to the educational mission of the University.',
    ).abstained,
    true,
    'a dyad label plus institutional importance does not state an authority or governance mechanism',
  );
});

test('F-7 coding and annotation procedure abstains wherever it sits in the sentence', () => {
  for (const fragment of [
    'Multiple LLMs were employed to code 5,504 Reddit posts from eight AI companion communities for relationship focus, primary topic, and emotional valence.',
    'We coded 1,200 transcripts from AI companion apps for relationship type and emotional tone.',
    'Two annotators labelled each AI companion conversation for perceived connection.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  assert.equal(
    classifyUnmatchedPassage(
      'Second, AI companions operate as hyper attachment objects that elicit especially strong attachment behaviors, because they combine reciprocity, perceived empathy, validation, non-judgment, and persistent availability.',
    ).primaryUmbrella.id,
    'asymmetric-nonhuman-relationships',
  );
});

test('F-13 a short verbless title is a title whatever punctuation it ends in', () => {
  for (const fragment of [
    'AI Companion Relationships and Well-Being.',
    'Consensual Relationships Between Faculty and Students!',
    'Donor Conception, Surrogacy and the Intended Parents',
    'Amorous Relationships With Undergraduate Students',
    'The Rise of AI Companions and Simulated Responsiveness',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  // Capitalization is never load-bearing: the audits reclassify upper-cased.
  for (const fragment of [
    'AI Companion Relationships and Well-Being.',
    'An Employee is prohibited from engaging in an amorous relationship with any undergraduate student.',
  ]) {
    assert.deepEqual(
      classifyUnmatchedPassage(fragment.toUpperCase()),
      classifyUnmatchedPassage(fragment),
      fragment,
    );
  }
});

/*
 * v2.7.4 review guards.
 *
 * Every assertion below was reproduced against v2.7.3 before the rule it
 * guards was written, and 23 of these 40 were red on that build; 13 of the red
 * ones reached the live unmatched queue, where a reader saw them. They are
 * grouped by finding so a regression names the defect it reintroduces.
 *
 * The shape each one tests is the same: a family of broad tokens was standing
 * in for the umbrella's actual mechanism, so ordinary prose that merely shared
 * subject matter with the umbrella got classified. The fix in every case is
 * positive mechanism evidence, never a longer blacklist.
 */
test('G-1 an AI used as an instrument is not a relational counterpart', () => {
  for (const fragment of [
    "The AI chatbot analyzed couples' relationship data and summarized attachment patterns.",
    'ChatGPT summarized an article about attachment and emotional support.',
    'An AI chatbot analyzed survey responses about attachment and emotional support.',
    "ChatGPT summarized couples' reports of relationship satisfaction.",
    'Replika was the name of a variable in our attachment analysis.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  // The entity is the counterpart, or it does something relational for a person.
  for (const fragment of [
    'A Replika partner offers attachment while lacking agency, welfare, and any ability to leave.',
    'A companion chatbot offers intimacy without reciprocity, unlike the customer support scripts it was built on.',
  ]) {
    assert.equal(
      classifyUnmatchedPassage(fragment).primaryUmbrella.id,
      'asymmetric-nonhuman-relationships',
      fragment,
    );
  }
});

test('G-2 institutional membership is not authority or governance', () => {
  for (const fragment of [
    'Employees at the university reported that workplace relationships improved morale.',
    'Employees at the university said workplace relationships improved morale.',
    'Faculty at the university studied romantic relationships in the surrounding community.',
    'Managers at the workplace discussed relationships between customer satisfaction and retention.',
    'Students said their relationships with campus staff provided emotional support.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  /*
   * `students` and the other membership nouns stay in the lexicon: deleting
   * them was tried in v2.7.3 and cost five correct classifications on live
   * university-policy prose. What a supported assignment needs is a governance
   * act or a directional power relation, and every sentence below states one.
   */
  for (const fragment of [
    'The relationship between a supervisor and a direct report is prohibited when one evaluates the other for promotion or pay.',
    'Employees must disclose romantic relationships with managers who evaluate their pay.',
    'Therefore, Boston University policy is that no affiliate shall supervise a student with whom the affiliate has a consensual romantic or sexual relationship.',
    'An Employee is prohibited from engaging in an amorous relationship with any undergraduate student, whether matriculated at UVM or enrolled as a non-degree student, regardless of the perception of consent by both participants.',
    'University policy bans supervisors from dating their direct reports and requires disclosure and reassignment.',
  ]) {
    assert.equal(
      classifyUnmatchedPassage(fragment).primaryUmbrella.id,
      'institutional-authority-governance',
      fragment,
    );
  }
});

test('G-3 ordinary recognition and benefits are not administrative access', () => {
  for (const fragment of [
    'Recognition of family support benefits mothers during recovery.',
    'The study challenged conventional recognition of relationships and reported benefits for couples.',
    'Recognition of relationships benefits couples by improving mutual understanding.',
    'The article challenged traditional recognition of marriage and described emotional benefits for families.',
    'Researchers recorded recognition scores and benefits reported by couples.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  for (const fragment of [
    'A parental order transfers legal parenthood from the surrogate to the intended parents.',
    "Until the parental order is granted, the surrogate and her spouse remain the child's legal parents and the intended parents have no legal status.",
    'If the surrogate is single, then the man providing the sperm (if he wants to be the father) will automatically be the second legal parent at birth.',
  ]) {
    assert.equal(
      classifyUnmatchedPassage(fragment).primaryUmbrella.id,
      'external-recognition-administrative-access',
      fragment,
    );
  }
});

test('G-4 ordinary task division is not family-role unbundling', () => {
  for (const fragment of [
    'Parents split practical support roles during the school fundraiser.',
    'Mothers separate support-network roles for a neighborhood event.',
    'Parents split practical support roles during a neighborhood fundraiser.',
    'Mothers separated support roles among volunteers at school.',
    'The parents unbundled support-network roles for the committee.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  for (const fragment of [
    'Donor conception separates genetic parenthood from gestational and social parent roles.',
    'Solo mothers by choice separate the decision to have a child from the search for a romantic partner.',
    'These men chose solo fatherhood through surrogacy rather than the search for a romantic partner.',
    'In these families the genetic parent, the gestational parent, and the social parent are different people.',
  ]) {
    assert.equal(
      classifyUnmatchedPassage(fragment).primaryUmbrella.id,
      'role-unbundling-family-formation',
      fragment,
    );
  }
});

test('G-5 measurement procedure is not a Brief/nonrelationship claim', () => {
  for (const fragment of [
    'Researchers briefly rated romantic messages for emotional support.',
    'Researchers briefly rated romantic messages for emotional support during the laboratory coding procedure.',
    'The research team briefly rated AI companions for emotional support during a pilot methods exercise.',
    'Analysts briefly rated relationship vignettes and romantic messages during instrument validation.',
    'A software model briefly rated AI companions for emotional support.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  /*
   * Two independent rules carry this finding, and each is needed on its own.
   * The furniture guard catches the measurement verb whatever actor performs
   * it; the umbrella's own predicate now requires the nonrelationship claim,
   * which is what stops a short vignette with no `briefly rated` in it.
   */
  assert.equal(
    classifyUnmatchedPassage('A short romance vignette measured impressions of couples.').abstained,
    true,
    'brevity plus adjacent romance vocabulary is not a Brief claim',
  );
  assert.equal(
    classifyUnmatchedPassage(
      'Participants briefly rated noninteractive synthetic characters without repeated contingent interaction.',
    ).primaryUmbrella.id,
    'brief-nonrelationship-interactions',
    'a fragment that states the relational limitation is still a Brief claim',
  );
});

test('1.3 evaluation successor agrees on umbrella, reason, secondary, and abstention', () => {
  assert.equal(EVALUATION_13.taxonomyVersion, '1.3.0');
  assert.ok(
    /NOT a pre-registered holdout/.test(EVALUATION_13.status),
    'the set must keep saying it was authored after implementation',
  );
  let negativeControls = 0;
  for (const fixture of EVALUATION_13.cases) {
    const result = classifyUnmatchedPassage(fixture.text);
    assert.equal(result.abstained, fixture.expected.abstained, `${fixture.id}: abstention`);
    assert.equal(result.primaryUmbrella.id, fixture.expected.primaryUmbrellaId, `${fixture.id}: primary`);
    assert.equal(
      result.secondaryUmbrella ? result.secondaryUmbrella.id : null,
      fixture.expected.secondaryUmbrellaId,
      `${fixture.id}: secondary`,
    );
    assert.equal(result.unmatchedReason.id, fixture.expected.unmatchedReasonId, `${fixture.id}: reason`);
    if (fixture.kind === 'negative-control') {
      negativeControls += 1;
      // Checked individually, not as a rate: one classified control is a defect.
      assert.equal(result.abstained, true, `${fixture.id}: negative control must abstain`);
    }
  }
  assert.equal(negativeControls, 12, 'the 1.3 set carries twelve negative controls');
  assert.equal(EVALUATION_13.cases.length, 23);
});

test('sealed 1.4 review set enforces connected mechanisms and declarative tag questions', () => {
  assert.equal(EVALUATION_14.taxonomyVersion, '1.4.0');
  assert.match(EVALUATION_14.status, /sealed.*before.*remediation/i);
  assert.equal(EVALUATION_14.cases.length, 16);
  assert.equal(new Set(EVALUATION_14.cases.map(({ id }) => id)).size, 16);

  for (const fixture of EVALUATION_14.cases) {
    const result = classifyUnmatchedPassage(fixture.text);
    assert.equal(result.abstained, fixture.expected.abstained, `${fixture.id}: abstention`);
    assert.equal(result.primaryUmbrella.id, fixture.expected.primaryUmbrellaId, `${fixture.id}: primary`);
    assert.equal(
      result.secondaryUmbrella?.id ?? null,
      fixture.expected.secondaryUmbrellaId,
      `${fixture.id}: secondary`,
    );
    assert.equal(result.unmatchedReason.id, fixture.expected.unmatchedReasonId, `${fixture.id}: reason`);
    if (fixture.kind === 'negative-control') {
      assert.equal(result.abstained, true, `${fixture.id}: every negative control abstains`);
    }
  }
});

test('H-1 connected predicates reject longer token lists that still state no mechanism', () => {
  for (const fragment of [
    'The AI companion dataset contains attachment scores.',
    'ChatGPT offers attachment advice to customers.',
    'The policy prohibited employees from discussing romantic relationships.',
    'A supervisor romance novel was not permitted in class.',
    'The registry distinguishes intended parents from donors for mailing lists.',
    'The university recognizes that couples have eligibility preferences for the survey.',
    'Administrative staff recorded that couples were eligible for survey participation.',
    'The AI companion service offers weather forecasts.',
    'Researchers interacted with ChatGPT to collect calibration data.',
    'The log stores chatbot interactions for later analysis.',
    'The relationship between supervisor ratings and direct-report job satisfaction was significant.',
    'Researchers separated genetic parent scores from social support roles.',
    'The survey asked couples about legal status and residence-permit preferences.',
    'The AI companion dataset has no welfare score.',
    'A noninteractive interface displays scripted messages without repeated clicks.',
    'Could the policy ban supervisors from dating direct reports, correct?',
    'Genetic and gestational mothers were separated by age for analysis.',
    'The survey asked couples about legal status variables.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  const supported = new Map([
    [
      'The workplace bans romances between managers and direct reports.',
      'institutional-authority-governance',
    ],
    [
      'A social robot provides companionship without having a stake in the outcome.',
      'asymmetric-nonhuman-relationships',
    ],
    [
      'A parental order grants the intended parents legal parenthood.',
      'external-recognition-administrative-access',
    ],
    [
      'Users chatted with an AI simulated romantic partner.',
      'asymmetric-nonhuman-relationships',
    ],
    [
      'Donor conception separates genetic parenthood from gestational and social parent roles.',
      'role-unbundling-family-formation',
    ],
    [
      'Managers are strongly discouraged from dating their direct reports.',
      'institutional-authority-governance',
    ],
    [
      'A workplace romance triggers disclosure and recusal.',
      'institutional-authority-governance',
    ],
    [
      'The noninteractive synthetic characters were rated without repeated contingent interaction.',
      'brief-nonrelationship-interactions',
    ],
  ]);
  for (const [fragment, expected] of supported) {
    assert.equal(classifyUnmatchedPassage(fragment).primaryUmbrella.id, expected, fragment);
  }
});

test('H-2 generated token-collision matrix abstains across all five supported umbrellas', () => {
  const controls = [];
  for (const entity of [
    'AI companion app',
    'AI companion dataset',
    'Replika customer-support service',
    'ChatGPT report',
    'social robot controller',
  ]) {
    for (const claim of [
      'analyzes attachment scores',
      'reports connection variables',
      'provides emotional support resources',
      'offers companionship advice',
      'stores conversations with users',
      'labels relationship data',
      'tracks consent fields',
      'simulates intimacy measures',
    ]) controls.push(`The ${entity} ${claim} for administrative review.`);
  }
  for (const actor of ['Employees', 'Faculty', 'Managers', 'Students']) {
    for (const pair of [
      'promotion and job satisfaction',
      'grading and test anxiety',
      'pay and retention',
      'authority and morale',
    ]) controls.push(`${actor} modeled the relationship between ${pair}.`);
    for (const action of [
      'reading romance novels',
      'discussing romantic relationships',
      'filing relationship surveys',
      'rating dating profiles',
    ]) controls.push(`The policy prohibited ${actor.toLowerCase()} from ${action} during training.`);
  }
  for (const lead of ['The survey', 'The registry', 'The clinic', 'The database', 'The report']) {
    for (const object of [
      'genetic parents from social parents into response groups',
      'donors from intended parents for mailing lists',
      'gestational mothers from social mothers by age',
      'genetic parent scores from social-role variables',
    ]) controls.push(`${lead} separates ${object}.`);
  }
  for (const lead of ['The survey', 'The consent form', 'The administrative report', 'The intake table']) {
    for (const object of [
      'couples about legal-status preferences',
      'partners about residence-permit variables',
      'intended parents about eligibility scores',
      'families about legal-parenthood measures',
    ]) controls.push(`${lead} asked ${object}.`);
  }
  for (const subject of ['interface', 'notification service', 'test harness', 'support widget']) {
    for (const rest of [
      'displays scripted messages without repeated clicks',
      'uses a noninteractive message for one short test',
      'briefly rates messages in a nonrelationship group',
    ]) controls.push(`The ${subject} ${rest}.`);
  }

  assert.equal(controls.length, 120);
  for (const fragment of controls) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }
});

test('H-3 positive paraphrase matrix retains explicit mechanisms across every umbrella', () => {
  const groups = new Map([
    ['asymmetric-nonhuman-relationships', [
      'An AI companion provides emotional support to an isolated user.',
      'Users formed an attachment to Replika despite its lack of welfare.',
      'The virtual companion served as a confidant while having no needs of its own.',
      'A social robot offers companionship without any stake in the outcome.',
      'A relationship with a chatbot can feel intimate even though the bot lacks agency.',
      'Users bond with Character.AI in what they describe as a romantic relationship.',
    ]],
    ['institutional-authority-governance', [
      'The policy prohibits romantic relationships between faculty and undergraduates.',
      'Managers are discouraged from dating their direct reports.',
      'A relationship between a supervisor and a direct report is prohibited.',
      'An instructor in a romantic relationship with a student must recuse from grading.',
      'A workplace romance triggers disclosure and reassignment.',
      'Coworker relationships outside the reporting line are not covered unless one has evaluative authority.',
    ]],
    ['role-unbundling-family-formation', [
      'Donor conception separates genetic, gestational, and social parenthood among different people.',
      'Reciprocal IVF splits genetic and gestational parent roles.',
      'Families distinguish the biological father from the social father.',
      'Solo motherhood separates the decision to have a child from the search for a romantic partner.',
      'The genetic parent, gestational parent, and social parent are different people.',
      'Donor, genetic contributor, gestational parent, and social parent roles require explicit separation.',
    ]],
    ['external-recognition-administrative-access', [
      'A parental order grants the intended parents legal parenthood.',
      'Immigration authorities recognized the partnership, making the spouse eligible for a residence permit.',
      'Without a court declaration the parent has no legal status and the couple cannot register the birth.',
      'Hospital rules allowed only a partner to stay, excluding the mother who provided support.',
      'Legal-status access changed family formation for cross-border couples.',
      'Institutions recognize support roles that a spouse would otherwise occupy.',
    ]],
    ['brief-nonrelationship-interactions', [
      'A scripted message measured reactions rather than a relationship.',
      'A one-shot speed-dating impression is not relationship maintenance.',
      'A single workplace-romance vignette is not an ongoing couple.',
      'Participants rated noninteractive synthetic characters without repeated contingent interaction.',
      'Connection after one chatbot interaction is not evidence of durable relationship quality.',
    ]],
  ]);

  let total = 0;
  for (const [expected, fragments] of groups) {
    for (const fragment of fragments) {
      total += 1;
      assert.equal(classifyUnmatchedPassage(fragment).primaryUmbrella.id, expected, fragment);
    }
  }
  assert.equal(total, 29);
});

test('H-4 fresh-source mechanisms classify without admitting nearby procedural controls', () => {
  const supported = new Map([
    [
      'The advent of conversational AI offered individuals an interactive partner through one-on-one personalized services.',
      'asymmetric-nonhuman-relationships',
    ],
    [
      'Participants formed an emotional attachment with conversational artificial intelligence.',
      'asymmetric-nonhuman-relationships',
    ],
    [
      "All fathers used gestational surrogacy, whereby a separate donor's egg was used and the surrogate did not use her own egg.",
      'role-unbundling-family-formation',
    ],
    [
      'If both partners give consent before treatment, the partner will be the legal parent.',
      'external-recognition-administrative-access',
    ],
    [
      'If a romantic relationship develops, the person in the position of greater authority must notify Human Resources and arrange alternate reporting.',
      'institutional-authority-governance',
    ],
    [
      'Consensual romantic relationships create inherent dangers when a faculty member has professional responsibility over the other person as a teacher or supervisor.',
      'institutional-authority-governance',
    ],
  ]);
  for (const [fragment, expected] of supported) {
    assert.equal(classifyUnmatchedPassage(fragment).primaryUmbrella.id, expected, fragment);
  }

  for (const fragment of [
    'Conversational artificial intelligence classified emotional-attachment survey responses.',
    "The donor's eggs were separated into labelled vials for gestational surrogacy.",
    'Partners recorded consent ratings and legal-parent variables.',
    'The authority article describes romantic literature for a university course.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }
});

test('H-5 sealed-source citations abstain and disclosure limits remain boundary evidence', async () => {
  const citation = '“Emotional attachment to AI companions and European law,” in MIT Case Studies in Social and Ethical Responsibilities of Computing, Winter 2023.';
  const directCitation = classifyUnmatchedPassage(citation);
  assert.equal(directCitation.abstained, true);
  assert.equal(directCitation.primaryUmbrella.id, 'unclassified');

  const citationAnalysis = await analyzeDocument(normalizeInput({
    title: 'Bibliography furniture probe',
    text: citation,
  }), CANON);
  if (citationAnalysis.metrics.unmappedClaimSegments > 0) {
    assert.equal(citationAnalysis.researchQueue.items[0].unmatchedTriage.abstained, true);
  }

  const boundary = classifyUnmatchedPassage(
    'There is no obligation to disclose relationships that fall into category (b) to other faculty or graduate students.',
  );
  assert.equal(boundary.primaryUmbrella.id, 'institutional-authority-governance');
  assert.equal(boundary.unmatchedReason.id, 'boundary-moderator-directional-evidence');

  const synonymousBoundary = classifyUnmatchedPassage(
    'Students and postgraduates are not obligated to inform the civil-rights office of prohibited relationships or those requiring disclosure.',
  );
  assert.equal(synonymousBoundary.primaryUmbrella.id, 'institutional-authority-governance');
  assert.equal(synonymousBoundary.unmatchedReason.id, 'boundary-moderator-directional-evidence');
});

test('H-6 connected mechanisms reject fiction, display, storage, metadata, and instrument collisions', async () => {
  const negativeControls = [
    'The supervisor romance novel follows a manager and a direct report.',
    'The chart separates genetic and gestational parent labels into colors.',
    'The database stores partners who have legal status documentation.',
    'The AI companion app has no agency policy in its terms of service.',
    'The virtual companion benchmark lacks welfare metadata but reports attachment scores.',
    'A noninteractive scale uses scripted romantic messages rather than a relationship.',
  ];
  for (const fragment of negativeControls) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, `${fragment}: direct`);
    const analysis = await analyzeDocument(normalizeInput({
      title: 'H-6 live collision probe',
      text: fragment,
    }), CANON);
    if (analysis.metrics.unmappedClaimSegments > 0) {
      assert.equal(
        analysis.researchQueue.items[0].unmatchedTriage.abstained,
        true,
        `${fragment}: live unmatched population`,
      );
    }
  }

  const shortClaim = 'Users formed attachments to conversational artificial intelligence.';
  const direct = classifyUnmatchedPassage(shortClaim);
  assert.equal(direct.primaryUmbrella.id, 'asymmetric-nonhuman-relationships');
  const analysis = await analyzeDocument(normalizeInput({
    title: 'H-6 short declarative claim',
    text: shortClaim,
  }), CANON);
  if (analysis.metrics.unmappedClaimSegments > 0) {
    assert.equal(analysis.researchQueue.items[0].excerpt, shortClaim);
    assert.equal(
      analysis.researchQueue.items[0].unmatchedTriage.primaryUmbrella.id,
      'asymmetric-nonhuman-relationships',
    );
  } else {
    assert.ok(
      analysis.metrics.ignoredDomainSegments > 0 || analysis.metrics.mappedClaimSegments > 0,
      'direct future-safety probe is either mapped or excluded by the unchanged analyzer gate',
    );
  }
});

test('H-7 a long predicateless title with a subtitle is furniture, not a mechanism', () => {
  const citationTitle = 'More than just a chat: a taxonomy of consumers’ relationships with conversational AI agents and their well-being implications.';
  assert.equal(classifyUnmatchedPassage(citationTitle).abstained, true);

  const declarativeColon = 'The rule is clear: managers may not enter romantic relationships with their direct reports.';
  assert.equal(
    classifyUnmatchedPassage(declarativeColon).primaryUmbrella.id,
    'institutional-authority-governance',
  );
});

test('H-8 neighboring metadata and fiction forms abstain while explicit partner separation classifies', () => {
  for (const fragment of [
    'AI companion app has no consent documentation for compliance review.',
    'Virtual companion benchmark has no consent documentation for compliance review.',
    'Replika partner dataset has no consent documentation for compliance review.',
    'Social robot specification has no consent documentation for compliance review.',
    'The manager romance story features a direct report.',
    'The workplace romance story features a direct report.',
    'The faculty romance story features a direct report.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }
  assert.equal(
    classifyUnmatchedPassage('Parenthood developed without a romantic partner.').primaryUmbrella.id,
    'role-unbundling-family-formation',
  );
});

test('H-9 incomplete policy fragments and explicitly nonromantic relations abstain; no-prohibition is boundary evidence', () => {
  for (const fragment of [
    'relationships with students for whom such employees have current supervisory, instructional or',
    'employees, regardless of supervisory relationships, that are not romantic in nature.',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  const boundary = classifyUnmatchedPassage(
    'They are not in a direct supervisory or instructional relationship, but there is no prohibition on maintaining the relationship.',
  );
  assert.equal(boundary.primaryUmbrella.id, 'institutional-authority-governance');
  assert.equal(boundary.unmatchedReason.id, 'boundary-moderator-directional-evidence');
});

test('H-10 dangling list introducers abstain in direct and live unmatched triage', async () => {
  const fragment = 'Many users have had romantic relationships with Replika chatbots, often including';
  for (const dangling of [
    fragment,
    'The policy prohibits managers from dating direct reports, such as',
    'Donor conception separates genetic and gestational parent roles, for example',
  ]) {
    const direct = classifyUnmatchedPassage(dangling);
    assert.equal(direct.abstained, true, dangling);
    assert.equal(direct.unmatchedReason.id, 'insufficient-evidence', dangling);
  }

  const analysis = await analyzeDocument(normalizeInput({
    title: 'H-10 live dangling-list probe',
    text: fragment,
  }), CANON);
  assert.equal(analysis.metrics.unmappedClaimSegments, 1);
  assert.equal(analysis.researchQueue.items[0].excerpt, fragment);
  assert.equal(analysis.researchQueue.items[0].unmatchedTriage.abstained, true);
});

test('H-11 dangling correlators and determiners abstain in direct and live triage', async () => {
  const fragments = [
    'When a prohibited relationship exists, the employee must both',
    'Sexual and romantic relationships are prohibited where the faculty member or other',
  ];
  for (const fragment of fragments) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, `${fragment}: direct`);
    const analysis = await analyzeDocument(normalizeInput({
      title: 'H-11 live incomplete-fragment probe',
      text: fragment,
    }), CANON);
    assert.equal(analysis.metrics.unmappedClaimSegments, 1, `${fragment}: live population`);
    assert.equal(analysis.researchQueue.items[0].excerpt, fragment);
    assert.equal(analysis.researchQueue.items[0].unmatchedTriage.abstained, true, `${fragment}: live`);
  }
});

test('H-1 live probes separate reader-visible failures from future-safety coverage', async () => {
  const probes = [
    {
      id: 'institutional-statistical-dyad',
      text: 'The relationship between supervisor ratings and direct-report job satisfaction was significant.',
      expectedPrimary: 'unclassified',
      expectedState: 'unmatched',
    },
    {
      id: 'role-measurement-object',
      text: 'Researchers separated genetic parent scores from social support roles.',
      expectedPrimary: 'unclassified',
      expectedState: 'unmatched',
    },
    {
      id: 'interrogative-with-tag',
      text: 'Could the policy ban supervisors from dating direct reports, correct?',
      expectedPrimary: 'unclassified',
      expectedState: 'unmatched',
    },
    {
      id: 'institutional-connected-policy',
      text: 'Managers are strongly discouraged from dating their direct reports.',
      expectedPrimary: 'institutional-authority-governance',
      expectedState: 'unmatched',
    },
    {
      id: 'role-connected-separation',
      text: 'Donor conception separates genetic parenthood from gestational and social parent roles.',
      expectedPrimary: 'role-unbundling-family-formation',
      expectedState: 'unmatched',
    },
  ];

  for (const probe of probes) {
    const direct = classifyUnmatchedPassage(probe.text);
    assert.equal(direct.primaryUmbrella.id, probe.expectedPrimary, `${probe.id}: direct`);
    const analysis = await analyzeDocument(normalizeInput({
      title: `H-1 live probe ${probe.id}`,
      text: probe.text,
    }), CANON);
    const state = analysis.metrics.mappedClaimSegments > 0
      ? 'mapped'
      : analysis.metrics.unmappedClaimSegments > 0
        ? 'unmatched'
        : analysis.metrics.ignoredDomainSegments > 0
          ? 'excluded'
          : 'no-claim';
    assert.equal(state, probe.expectedState, `${probe.id}: live population`);
    const item = analysis.researchQueue.items[0];
    assert.equal(item.excerpt, probe.text, `${probe.id}: exact live fragment`);
    assert.equal(item.unmatchedTriage.primaryUmbrella.id, probe.expectedPrimary, `${probe.id}: live`);
  }
});

test('sealed 1.4 review probes distinguish direct safety from the live unmatched population', async () => {
  const expectedCounts = { unmatched: 10, excluded: 4, 'no-claim': 2, mapped: 0 };
  const counts = { unmatched: 0, excluded: 0, 'no-claim': 0, mapped: 0 };

  for (const fixture of EVALUATION_14.cases) {
    const direct = classifyUnmatchedPassage(fixture.text);
    const analysis = await analyzeDocument(normalizeInput({
      title: `Sealed 1.4 probe ${fixture.id}`,
      text: fixture.text,
    }), CANON);
    const liveState = analysis.metrics.mappedClaimSegments > 0
      ? 'mapped'
      : analysis.metrics.unmappedClaimSegments > 0
        ? 'unmatched'
        : analysis.metrics.ignoredDomainSegments > 0
          ? 'excluded'
          : 'no-claim';
    counts[liveState] += 1;

    if (liveState === 'unmatched') {
      const item = analysis.researchQueue.items[0];
      assert.equal(item.excerpt, fixture.text, `${fixture.id}: exact fragment`);
      assert.equal(
        item.unmatchedTriage.primaryUmbrella.id,
        direct.primaryUmbrella.id,
        `${fixture.id}: live primary`,
      );
      assert.equal(
        item.unmatchedTriage.unmatchedReason.id,
        direct.unmatchedReason.id,
        `${fixture.id}: live reason`,
      );
    }
  }
  assert.deepEqual(counts, expectedCounts);
});

test('G-1..G-5 adversarial probes hold in the live analyzer, not just the classifier', async () => {
  const liveCounts = { mapped: 0, unmatched: 0, excluded: 0, 'no-claim': 0 };
  for (const fixture of ADVERSARIAL_13.cases) {
    const direct = classifyUnmatchedPassage(fixture.text);
    if (fixture.id === 'g2-authority-teacher-student') {
      /*
       * Historical evidence is preserved verbatim, but 1.4 deliberately
       * overturns this post-hoc 1.3 expectation: naming a teacher-student dyad
       * and calling it important is not an authority/governance mechanism.
       */
      assert.equal(direct.primaryUmbrella.id, 'unclassified', `${fixture.id}: corrected primary`);
      assert.equal(direct.abstained, true, `${fixture.id}: corrected abstention`);
    } else {
      assert.equal(direct.primaryUmbrella.id, fixture.directPrimary, `${fixture.id}: direct primary`);
      assert.equal(direct.unmatchedReason.id, fixture.directReason, `${fixture.id}: direct reason`);
    }

    const analysis = await analyzeDocument(normalizeInput({
      title: `Adversarial probe ${fixture.id}`,
      text: fixture.text,
    }), CANON);
    const liveState = analysis.metrics.mappedClaimSegments > 0
      ? 'mapped'
      : analysis.metrics.unmappedClaimSegments > 0
        ? 'unmatched'
        : analysis.metrics.ignoredDomainSegments > 0
          ? 'excluded'
          : 'no-claim';
    assert.equal(liveState, fixture.liveState, `${fixture.id}: live population`);
    liveCounts[liveState] += 1;

    /*
     * The point of the finding was that these were USER-VISIBLE. A probe that
     * merely abstains in the classifier proves nothing if the gate would have
     * shown it anyway, so every one that reaches the queue is checked on the
     * rendered value: the exact fragment, and the umbrella a reader sees.
     */
    if (liveState === 'unmatched') {
      const item = analysis.researchQueue.items[0];
      const expectedPrimary = fixture.id === 'g2-authority-teacher-student'
        ? 'unclassified'
        : fixture.directPrimary;
      assert.equal(item.excerpt, fixture.text, `${fixture.id}: exact live fragment`);
      assert.equal(item.unmatchedTriage.primaryUmbrella.id, expectedPrimary, `${fixture.id}: live primary`);
      if (fixture.id !== 'g2-authority-teacher-student') {
        assert.equal(item.unmatchedTriage.unmatchedReason.id, fixture.directReason, `${fixture.id}: live reason`);
      }
      if (expectedPrimary === 'unclassified') {
        assert.equal(item.unmatchedTriage.abstained, true, `${fixture.id}: live abstention is explicit`);
      }
    }
  }
  assert.deepEqual(liveCounts, ADVERSARIAL_13.liveCounts);
  assert.equal(ADVERSARIAL_13.cases.length, 42);
});

test('frozen evaluation fixtures are never edited to green a rule', () => {
  /*
   * Byte identity, not shape identity. An expectation quietly edited to match
   * new behaviour is exactly what this exists to catch, and it is the one
   * failure mode a passing evaluation cannot show you. CRLF is normalised so
   * the pin survives a checkout with a different line-ending setting.
   */
  const pin = (name) => createHash('sha256')
    .update(Buffer.from(
      readFileSync(new URL(`./fixtures/${name}`, import.meta.url))
        .filter((byte) => byte !== 0x0d),
    ))
    .digest('hex');
  assert.equal(
    pin('unmatched-umbrella-evaluation.json'),
    '96f04813a2d94f0bf7f45b8642208fdce032ccbf8f3d926cf1ff5ec8d4f2cba0',
    'taxonomy 1.0 evidence must stay byte-identical',
  );
  assert.equal(
    pin('unmatched-umbrella-evaluation-1.1.json'),
    'e34ba158f084c1020825df646eb1f498d715bbd70f051f53be97802004b00f04',
    'taxonomy 1.1 successor must stay byte-identical',
  );
  assert.equal(
    pin('unmatched-umbrella-evaluation-1.4.json'),
    'b0c2fcb646ebc4edc1a6ebc4e399b6220bda36d3437782d70d59513dba340e51',
    'taxonomy 1.4 sealed review evidence must stay byte-identical',
  );
});

test('G-6 a question asserts no mechanism, so it is never a supported umbrella', () => {
  /*
   * Found by the fresh 42-source window rather than by construction: one review
   * article had eight interrogatives classified as Asymmetric at 0.66, section
   * headings and research questions alike. They classified on v2.7.3 too, so
   * this closes an old defect the new corpus exposed. The rule used to require
   * the question to have NO finite verb, which made it nearly dead - every
   * well-formed question has one.
   */
  for (const fragment of [
    'Can Humans Have Close Relationships With AI Chatbots?',
    'Can Close Relationships With Chatbots Fulfill the Functions of Close Relationships With Humans?',
    'Do these capacities enable humans to develop genuine relationships with their chatbot companions?',
    'First, to what extent can interactions with chatbots meet the defining criteria of a close relationship?',
    'Do close relationships with chatbots promote the same downstream consequences for health?',
    'Should a supervisor be permitted to evaluate a direct report they are dating?',
  ]) {
    assert.equal(classifyUnmatchedPassage(fragment).abstained, true, fragment);
  }

  // The declarative form of the same subject matter still classifies.
  assert.equal(
    classifyUnmatchedPassage(
      'Close relationships with chatbots do not promote the same downstream consequences, because a chatbot partner has no welfare of its own.',
    ).primaryUmbrella.id,
    'asymmetric-nonhuman-relationships',
  );
});
