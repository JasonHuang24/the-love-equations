import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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
  assert.equal(UNMATCHED_UMBRELLA_TAXONOMY_VERSION, '1.2.0');
  assert.equal(
    UNMATCHED_UMBRELLA_TAXONOMY.schemaVersion,
    'le-lab.unmatched-umbrella-taxonomy/1.2.0',
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

  assert.equal(ANALYZER_VERSION, '2.7.3');
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
    'The integrity and professionalism of the teacher-student relationship is fundamental to the educational mission of the University.',
  ]) {
    assert.equal(
      classifyUnmatchedPassage(fragment).primaryUmbrella.id,
      'institutional-authority-governance',
      fragment,
    );
  }
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
