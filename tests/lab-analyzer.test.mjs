import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { normalizeInput } from '../js/lab-intake.js';
import { createDemoDocument } from '../js/lab-demo.js';
import {
  ANALYSIS_SCHEMA_VERSION,
  analyzeDocument,
  classifyDomainRelevance,
  detectClaimUnits,
  prepareCanonIndex,
} from '../js/lab-analyzer.js';
import {
  analysisToJson,
  analysisToMarkdown,
  researchQueueToJson,
  researchQueueToMarkdown,
} from '../js/lab-export.js';

const CANON = {
  schemaVersion: 'le-canon-index/1.0',
  indexVersion: 'fixture-1',
  generatedAt: '2026-07-26T12:00:00.000Z',
  sourcePages: ['frameworks.html', 'smvlevers.html', 'gender-dynamics.html', 'statistics.html'],
  stats: { conceptCount: 4, sourceCount: 4 },
  entries: [
    {
      id: 'frameworks.conversion-ladder',
      title: 'The Conversion Ladder',
      page: 'frameworks.html',
      anchor: 'conversion-ladder',
      category: 'Rules & Frameworks',
      subcategory: 'Dating stages',
      synopsis: 'Attention, desire, reciprocal selection, and retention are different transitions.',
      evidenceType: 'Lens',
      aliases: ['conversion ladder', 'attention desire selection retention', 'selection compatibility retention'],
      phrases: ['attraction is not selection'],
      dependencies: [],
      related: ['frameworks.readiness-gate'],
      boundaryConditions: ['Clearing one stage does not guarantee the next.'],
      commonMisreadings: ['Attraction guarantees a relationship.'],
      sourceLinks: [],
      pressureTests: ['Use a highly attractive match whose life plans are incompatible.'],
    },
    {
      id: 'frameworks.readiness-gate',
      title: 'Readiness Gate',
      page: 'frameworks.html',
      anchor: 'readiness-gate',
      category: 'Rules & Frameworks',
      subcategory: 'Relationship formation',
      synopsis: 'Mutual attraction and readiness to build the same relationship are separate decisions.',
      evidenceType: 'Framework',
      aliases: ['readiness gate', 'life plans', 'relationship readiness'],
      phrases: [],
      dependencies: ['frameworks.conversion-ladder'],
      related: [],
      boundaryConditions: ['Readiness is specific to timing and the relationship being proposed.'],
      commonMisreadings: [],
      sourceLinks: [],
      pressureTests: ['Hold attraction constant and change timing or life goals.'],
    },
    {
      id: 'levers.five',
      title: 'Five Levers of SMV',
      page: 'smvlevers.html',
      anchor: 'five-levers',
      category: 'Five Levers',
      subcategory: 'Market leverage',
      synopsis: 'Looks, money, status, charm, and exposure shape market leverage, not moral worth.',
      evidenceType: 'Lens',
      aliases: ['looks money status charm exposure', 'five levers', 'market leverage'],
      phrases: ['moral worth'],
      dependencies: [],
      related: [],
      boundaryConditions: ['Market leverage is descriptive and context-dependent.'],
      commonMisreadings: ['A low score makes someone a worse person.'],
      sourceLinks: [],
      pressureTests: ['Hold attention constant while varying moral character.'],
    },
    {
      id: 'gender.overlap',
      title: 'Average sex differences are not universal binaries',
      page: 'gender-dynamics.html',
      anchor: 'average-not-binary',
      category: 'Gender Dynamics',
      subcategory: 'Scope',
      synopsis: 'Group averages can coexist with wide within-sex variation and overlap.',
      evidenceType: 'Evidence',
      aliases: ['average sex differences', 'not universal binaries', 'all women', 'all men'],
      phrases: [],
      dependencies: [],
      related: [],
      boundaryConditions: ['Population, context, and effect size must be stated.'],
      commonMisreadings: ['Every man and every woman follows the group average.'],
      sourceLinks: [{ label: 'Fixture source', url: 'https://example.com/effect-sizes' }],
      pressureTests: ['Inspect the overlap of the two distributions.'],
    },
  ],
};

const REAL_CANON = JSON.parse(
  readFileSync(new URL('../data/le-canon-index.json', import.meta.url), 'utf8'),
);

test('canon preparation retains versioned metadata and usable entries', () => {
  const prepared = prepareCanonIndex(CANON);
  assert.equal(prepared.indexVersion, 'fixture-1');
  assert.equal(prepared.entries.length, 4);
  assert.ok(prepared.idf.size > 5);
});

test('claim detector preserves stable segment references and recovered timestamps', () => {
  const document = normalizeInput({
    text: `WEBVTT

00:00:02.000 --> 00:00:05.000
<v Ana>Attraction is not selection. Compatibility is another test.`,
    format: 'vtt',
    source: { title: 'Timed fixture' },
    createdAt: '2026-07-26T12:00:00.000Z',
  });
  const units = detectClaimUnits(document);
  assert.equal(units.length, 2);
  assert.match(units[0].id, /^seg-\d{5}-[a-z0-9]+\.claim-01$/);
  assert.equal(units[0].parentSegmentId, document.segments[0].id);
  assert.equal(units[0].sourceBoundary.start, 0);
  assert.equal(units[0].startTime, 2_000);
  assert.equal(units[0].endTime, 5_000);
  assert.equal(units[0].sourceBoundary.originalStart, document.segments[0].original.startOffset);
});

test('exact phrases and weighted overlap produce transparent credible matches', async () => {
  const document = normalizeInput({
    text: `Attraction is not selection. Selection, compatibility, and retention are different tests.

Looks, money, status, charm, and exposure can increase market leverage, but a score never establishes moral worth.`,
    source: { title: 'Mapped fixture' },
    createdAt: '2026-07-26T12:00:00.000Z',
  });
  const result = await analyzeDocument(document, CANON);
  assert.equal(result.schemaVersion, ANALYSIS_SCHEMA_VERSION);
  assert.equal(result.canonIndex.version, 'fixture-1');
  assert.ok(result.metrics.mappedClaimSegments >= 2);
  assert.ok(result.strongestMatches.some((match) => match.canonId === 'frameworks.conversion-ladder'));
  assert.ok(result.strongestMatches.some((match) => match.canonId === 'levers.five'));
  const mapped = result.segments.find((segment) =>
    segment.matches.some((match) => match.canonId === 'frameworks.conversion-ladder'));
  assert.ok(mapped);
  assert.ok(mapped.matches[0].whyMatched.some((reason) => /Exact phrase|Distinctive overlap/.test(reason)));
  assert.match(result.coverage.interpretation, /Document coverage/);
});

test('generic dating language is not forced into canon', async () => {
  const document = normalizeInput({
    text: 'Dating can feel confusing sometimes, and people have good days and bad days.',
    source: { title: 'Generic fixture' },
    createdAt: '2026-07-26T12:00:00.000Z',
  });
  const result = await analyzeDocument(document, CANON);
  assert.equal(result.metrics.mappedClaimSegments, 0);
  assert.equal(result.coverage.mappedClaimSegmentSharePct, 0);
  assert.ok(result.warnings.some((warning) => /No claim-like passage|No claim-like/.test(warning.message)));
});

test('pressure tests prioritize absolutes, sex binaries, stage collapse, and moralized SMV', async () => {
  const document = normalizeInput({
    text: `All women always choose the highest-status man, and all men never care about anything except looks.

Attraction guarantees selection and a lasting compatible marriage.

A low SMV score means someone is an inferior person who deserves rejection.

The Conversion Ladder works everywhere in every culture and every population.`,
    source: { title: 'Pressure fixture' },
    createdAt: '2026-07-26T12:00:00.000Z',
  });
  const result = await analyzeDocument(document, CANON);
  const flags = new Set(result.pressureTests.map((pressure) => pressure.riskFlag));
  assert.ok(flags.has('absolute claim'));
  assert.ok(flags.has('gender generalization'));
  assert.ok(flags.has('stage collapse'));
  assert.ok(flags.has('moral claim'));
  assert.ok(flags.has('scope extrapolation'));
  assert.ok(result.pressureTests.every((pressure) =>
    pressure.boundaryConditions.length
    && pressure.strainScenario
    && pressure.evidenceThatWouldChangeConclusion
    && pressure.inputEvidenceAssessment
    && pressure.tensionType));
});

test('unmapped claims become research candidates rather than doctrine', async () => {
  const document = normalizeInput({
    text: 'Shared music taste causes 82 percent of online couples to stay together for exactly seven extra years.',
    source: { title: 'Residue fixture', url: 'https://example.com/show' },
    createdAt: '2026-07-26T12:00:00.000Z',
  });
  const result = await analyzeDocument(document, CANON);
  assert.equal(result.researchQueue.status, 'Research candidates — not LE doctrine');
  assert.ok(result.researchQueue.items.length >= 1);
  const item = result.researchQueue.items[0];
  assert.ok(item.empiricalQuestion);
  assert.ok(item.falsifier);
  assert.ok(item.suggestedSearchTerms.length);
  assert.ok(item.riskFlags.includes('causal claim'));
});

test('sentence-local signatures keep a novel claim unmapped inside a known-concept paragraph', async () => {
  const known = 'Attraction does not guarantee selection, compatibility, or retention.';
  const novel = 'A totally new claim says lunar phases determine breakups.';
  const document = normalizeInput({
    text: `${known} ${novel}`,
    source: { title: 'Mixed paragraph regression' },
    createdAt: '2026-07-26T12:00:00.000Z',
  });
  const result = await analyzeDocument(document, REAL_CANON);
  const knownResult = result.segments.find((segment) => segment.unit.text === known);
  const novelResult = result.segments.find((segment) => segment.unit.text === novel);

  assert.ok(knownResult?.matches.some((match) => match.canonId === 'frameworks:conversion-ladder'));
  assert.equal(novelResult?.mapped, false);
  assert.equal(result.metrics.claimLikeSegments, 2);
  assert.equal(result.metrics.mappedClaimSegments, 1);
  assert.equal(result.metrics.unmappedClaimSegments, 1);
  assert.equal(result.coverage.mappedClaimSegmentSharePct, 50);
  assert.ok(result.researchQueue.items.some((item) => item.excerpt === novel));
});

test('independent mixed fixtures do not inherit SMV or gender signatures', async () => {
  const fixtures = [
    {
      known: 'Looks, money, status, charm, and exposure shape market leverage without measuring moral worth.',
      expectedCanonId: 'smv:overview',
      novel: 'A new claim says Saturn rings cause romantic partners to delay replies.',
    },
    {
      known: 'All women always choose the highest-status man.',
      expectedCanonId: 'lexicon:term-awalt-all-women-are-like-that',
      novel: 'A new claim says volcanic ash predicts which romantic partner cancels a date.',
    },
  ];

  for (const fixture of fixtures) {
    const result = await analyzeDocument(normalizeInput({
      text: `${fixture.known} ${fixture.novel}`,
      source: { title: 'Independent mixed fixture' },
      createdAt: '2026-07-26T12:00:00.000Z',
    }), REAL_CANON);
    const knownResult = result.segments.find((segment) => segment.unit.text === fixture.known);
    const novelResult = result.segments.find((segment) => segment.unit.text === fixture.novel);

    assert.ok(knownResult?.matches.some((match) => match.canonId === fixture.expectedCanonId));
    assert.equal(novelResult?.mapped, false);
    assert.equal(result.coverage.mappedClaimSegmentSharePct, 50);
    assert.ok(result.researchQueue.items.some((item) => item.excerpt === fixture.novel));
  }
});

test('a short referential continuation receives only traced one-sentence context help', async () => {
  const first = 'Attraction does not guarantee selection, compatibility, or retention.';
  const continuation = 'That distinction means one stage does not guarantee retention.';
  const result = await analyzeDocument(normalizeInput({
    text: `${first} ${continuation}`,
    source: { title: 'Bounded continuation fixture' },
    createdAt: '2026-07-26T12:00:00.000Z',
  }), REAL_CANON);
  const firstResult = result.segments.find((segment) => segment.unit.text === first);
  const continuationResult = result.segments.find((segment) => segment.unit.text === continuation);
  const match = continuationResult?.matches.find((candidate) =>
    candidate.canonId === 'frameworks:conversion-ladder');

  assert.ok(firstResult?.mapped);
  assert.equal(continuationResult?.unit.boundedContext?.sourceUnitId, firstResult?.unit.id);
  assert.ok(match?.contextHelp);
  assert.equal(match.contextHelp.kind, 'previous-sentence');
  assert.equal(match.contextHelp.sourceUnitId, firstResult.unit.id);
  assert.ok(match.contextHelp.localScore < 0.43);
  assert.ok(match.score >= 0.43);
  assert.ok(match.whyMatched.some((reason) => reason.startsWith('Bounded context help:')));
});

test('separate speaker turns and distant sentences cannot contaminate a novel claim', async () => {
  const known = 'Attraction does not guarantee selection, compatibility, or retention.';
  const speakerNovel = 'That totally new claim says lunar phases determine breakups.';
  const speakerDocument = {
    schemaVersion: 'le-lab.normalized-document/1.0.0',
    id: 'speaker-turn-regression',
    source: { title: 'Separate speaker turns', type: 'transcript' },
    segments: [
      { id: 'seg-speaker-a', speaker: 'Ana', text: known },
      { id: 'seg-speaker-b', speaker: 'Bo', text: speakerNovel },
    ],
  };
  const speakerResult = await analyzeDocument(speakerDocument, REAL_CANON);
  const secondTurn = speakerResult.segments.find((segment) => segment.unit.text === speakerNovel);

  assert.equal(secondTurn?.unit.boundedContext, null);
  assert.equal(secondTurn?.mapped, false);
  assert.ok(speakerResult.researchQueue.items.some((item) => item.excerpt === speakerNovel));

  const filler = Array.from(
    { length: 12 },
    (_, index) => `A separate observation ${index + 1} says mineral colors determine message timing.`,
  ).join(' ');
  const distantNovel = 'That lunar-phase claim says breakups happen at midnight.';
  const longResult = await analyzeDocument(normalizeInput({
    text: `${known} ${filler} ${distantNovel}`,
    source: { title: 'Long mixed paragraph' },
    createdAt: '2026-07-26T12:00:00.000Z',
  }), REAL_CANON);
  const distantResult = longResult.segments.find((segment) => segment.unit.text === distantNovel);

  assert.equal(distantResult?.mapped, false);
  assert.ok(!distantResult?.matches.some((match) => match.canonId === 'frameworks:conversion-ladder'));
  assert.ok(longResult.researchQueue.items.some((item) => item.excerpt === distantNovel));
});
test('the original demonstration yields mapped material, pressure, and residue', async () => {
  const result = await analyzeDocument(
    createDemoDocument({ createdAt: '2026-07-26T12:00:00.000Z' }),
    CANON,
  );
  assert.ok(result.metrics.claimLikeSegments >= 8);
  assert.ok(result.metrics.mappedClaimSegments >= 3);
  assert.ok(result.pressureTests.length >= 3);
  assert.ok(result.researchQueue.items.length >= 1);
});

test('the generated canon index routes the demo through core LE rules without consuming its research residue', async () => {
  const realCanon = JSON.parse(readFileSync(new URL('../data/le-canon-index.json', import.meta.url), 'utf8'));
  const result = await analyzeDocument(
    createDemoDocument({ createdAt: '2026-07-26T12:00:00.000Z' }),
    realCanon,
  );
  const matchedIds = new Set(result.strongestMatches.map((match) => match.canonId));
  assert.ok(matchedIds.has('frameworks:conversion-ladder'));
  assert.ok(matchedIds.has('smv:overview'));
  assert.ok(matchedIds.has('lexicon:term-awalt-all-women-are-like-that'));
  assert.ok(matchedIds.has('frameworks:readiness-gate'));
  assert.equal(result.metrics.claimLikeSegments, 11);
  assert.equal(result.metrics.mappedClaimSegments, 6);
  assert.equal(result.metrics.unmappedClaimSegments, 5);
  assert.equal(result.coverage.mappedClaimSegmentSharePct, 54.5);
  assert.ok(result.researchQueue.items.some((item) => /82 percent/.test(item.excerpt)));
  const awalt = result.segments.flatMap((segment) => segment.matches)
    .find((match) => match.canonId === 'lexicon:term-awalt-all-women-are-like-that');
  assert.equal(awalt?.alignment.label, 'Contradicts');
  assert.ok(awalt?.whyMatched.some((reason) => reason.startsWith('Concept signature:')));
});

test('Markdown and JSON exports carry provenance, schemas, citations, limitations, and inert hostile text', async () => {
  const document = normalizeInput({
    text: '<script>alert(1)</script> Attraction is not selection.',
    source: {
      title: '<img src=x onerror=alert(1)>',
      url: 'https://example.com/source',
    },
    createdAt: '2026-07-26T12:00:00.000Z',
  });
  const result = await analyzeDocument(document, CANON);
  const markdown = analysisToMarkdown(result);
  const queueMarkdown = researchQueueToMarkdown(result);
  const json = JSON.parse(analysisToJson(result));
  assert.match(markdown, /Canon index/);
  assert.match(markdown, /Coverage is the share of retained relationship-domain claim-like segments/);
  assert.match(markdown, /&lt;img/);
  assert.doesNotMatch(markdown, /<script>/);
  assert.match(queueMarkdown, /Research candidates/);
  assert.equal(json.schemaVersion, ANALYSIS_SCHEMA_VERSION);
  assert.equal(json.source.url, 'https://example.com/source');
  assert.ok(Array.isArray(json.limitations));
});

function relevanceDecision(text) {
  const document = normalizeInput({
    text,
    source: { title: 'Relevance decision fixture' },
    createdAt: '2026-07-26T12:00:00.000Z',
  });
  return classifyDomainRelevance(detectClaimUnits(document))[0];
}

test('clearly non-domain assertions are ignored before mapping and residue construction', async () => {
  const sourceText = [
    'The sky is blue.',
    'The weather is hot.',
    'The train always arrived at noon.',
    'Water freezes at zero degrees Celsius.',
    'Copper conducts electricity under ordinary laboratory conditions.',
  ].join(' ');
  const document = normalizeInput({
    text: sourceText,
    source: { title: 'Non-domain fixture' },
    createdAt: '2026-07-26T12:00:00.000Z',
  });
  const result = await analyzeDocument(document, REAL_CANON);

  assert.equal(result.metrics.ignoredDomainSegments, 5);
  assert.ok(result.metrics.ignoredDomainWords > 20);
  assert.equal(result.metrics.claimLikeSegments, 0);
  assert.equal(result.metrics.mappedClaimSegments, 0);
  assert.equal(result.metrics.unmappedClaimSegments, 0);
  assert.equal(result.coverage.mappedClaimSegmentSharePct, null);
  assert.deepEqual(result.segments, []);
  assert.deepEqual(result.strongestMatches, []);
  assert.deepEqual(result.pressureTests, []);
  assert.deepEqual(result.researchQueue.items, []);
  assert.ok(result.warnings.some((warning) => /No relationship-domain claims/.test(warning.message)));
});

test('clearly relevant mapped behavior is unchanged by the separate relevance gate', async () => {
  const claim = 'Attraction does not guarantee selection, compatibility, or retention.';
  const result = await analyzeDocument(normalizeInput({
    text: claim,
    source: { title: 'Mapped relevance fixture' },
    createdAt: '2026-07-26T12:00:00.000Z',
  }), REAL_CANON);
  const passage = result.segments[0];

  assert.equal(passage.unit.domainRelevance.status, 'relevant');
  assert.ok(passage.mapped);
  assert.ok(passage.matches.some((match) => match.canonId === 'frameworks:conversion-ladder'));
  assert.equal(result.metrics.claimLikeSegments, 1);
  assert.equal(result.metrics.ignoredDomainSegments, 0);
});

test('novel relationship claims remain retained as unmapped research residue', async () => {
  const claims = [
    'Shared ownership of a pet can make breakups harder to unwind.',
    'Remote work may reduce spontaneous opportunities to meet partners.',
  ];
  const result = await analyzeDocument(normalizeInput({
    text: claims.join(' '),
    source: { title: 'Novel relationship fixture' },
    createdAt: '2026-07-26T12:00:00.000Z',
  }), REAL_CANON);

  assert.deepEqual(result.segments.map((segment) => segment.unit.text), claims);
  assert.ok(result.segments.every((segment) => segment.unit.domainRelevance.status === 'relevant'));
  assert.ok(result.segments.every((segment) => !segment.mapped));
  assert.deepEqual(result.researchQueue.items.map((item) => item.excerpt), claims);
  assert.equal(result.metrics.unmappedClaimSegments, 2);
  assert.equal(result.metrics.ignoredDomainSegments, 0);
});

test('mixed sources exclude non-domain residue while preserving order and the true denominator', async () => {
  const weather = 'The weather is hot.';
  const mapped = 'Attraction is not selection.';
  const science = 'Water freezes at zero degrees Celsius.';
  const novel = 'Shared ownership of a pet can make breakups harder to unwind.';
  const document = normalizeInput({
    text: [weather, mapped, science, novel].join(' '),
    source: { title: 'Mixed relevance fixture' },
    createdAt: '2026-07-26T12:00:00.000Z',
  });
  const result = await analyzeDocument(document, REAL_CANON);

  assert.deepEqual(result.segments.map((segment) => segment.unit.text), [mapped, novel]);
  assert.equal(result.metrics.ignoredDomainSegments, 2);
  assert.equal(result.metrics.claimLikeSegments, 2);
  assert.equal(result.metrics.mappedClaimSegments, 1);
  assert.equal(result.metrics.unmappedClaimSegments, 1);
  assert.equal(result.coverage.mappedClaimSegmentSharePct, 50);
  assert.deepEqual(result.researchQueue.items.map((item) => item.excerpt), [novel]);
  assert.equal(document.text, [weather, mapped, science, novel].join(' '));
});

test('domain relevance uses one bounded predecessor and never cascades', () => {
  const relevantPair = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'Dating apps encourage rapid visual judgments. This makes profile photographs unusually important.',
  })));
  assert.equal(relevantPair[0].domainRelevance.status, 'relevant');
  assert.equal(relevantPair[1].domainRelevance.status, 'relevant');
  assert.equal(relevantPair[1].domainRelevance.contextHelp?.sourceUnitId, relevantPair[0].id);
  assert.equal(relevantPair[1].domainRelevance.localStatus, 'irrelevant');

  const irrelevantPair = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'The sky is blue. This is visible during the afternoon.',
  })));
  assert.ok(irrelevantPair.every((unit) => unit.domainRelevance.status === 'irrelevant'));

  const noContamination = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'Dating apps encourage rapid visual judgments. The train arrived at noon.',
  })));
  assert.equal(noContamination[1].domainRelevance.status, 'irrelevant');

  const noCascade = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'Dating apps encourage rapid visual judgments. This makes profile photos important. This changes everything. This is obvious.',
  })));
  assert.equal(noCascade[1].domainRelevance.status, 'relevant');
  assert.equal(noCascade[2].domainRelevance.status, 'irrelevant');
  assert.equal(noCascade[3].domainRelevance.status, 'irrelevant');
});

test('domain rules disambiguate hot and market language while retaining adjacent outcome claims', () => {
  assert.equal(relevanceDecision('She is hot.').domainRelevance.status, 'uncertain');
  assert.equal(relevanceDecision('The room is hot.').domainRelevance.status, 'irrelevant');
  assert.equal(relevanceDecision('The market is competitive.').domainRelevance.status, 'irrelevant');
  assert.equal(relevanceDecision('The dating market is competitive.').domainRelevance.status, 'relevant');
  assert.equal(relevanceDecision('The relationship between temperature and pressure is linear.').domainRelevance.status, 'irrelevant');
  assert.equal(relevanceDecision('My laboratory partner recorded the temperature.').domainRelevance.status, 'irrelevant');

  const adjacent = [
    'People increasingly meet partners through apps.',
    'Economic insecurity may delay marriage.',
    'Warm weather increases attendance at social venues where singles meet.',
    'Remote work may reduce opportunities for spontaneous pair formation.',
    'Local housing policy can affect when couples marry.',
    'Geography shapes which partners people can meet.',
    'Sexual attraction does not guarantee partner compatibility.',
  ];
  adjacent.forEach((claim) => {
    assert.equal(relevanceDecision(claim).domainRelevance.status, 'relevant', claim);
  });

  assert.equal(relevanceDecision('Attachment can change slowly over time.').domainRelevance.status, 'uncertain');
  assert.equal(relevanceDecision('Dating App Effects').isClaimLike, false);
  assert.equal(relevanceDecision('Dating App Effects').domainRelevance.status, 'relevant');
});

test('rhetorical, quoted, negated, and uncertain relationship claims remain analyzable', async () => {
  const claims = [
    'Could economic insecurity delay marriage?',
    'Dating does not determine compatibility.',
    '"Remote work may reduce opportunities to meet partners," she said.',
    'Attachment can change slowly over time.',
  ];
  const result = await analyzeDocument(normalizeInput({ text: claims.join(' ') }), REAL_CANON);
  assert.deepEqual(result.segments.map((segment) => segment.unit.text), claims);
  assert.ok(result.segments.some((segment) => segment.unit.domainRelevance.status === 'uncertain'));
  assert.equal(result.metrics.ignoredDomainSegments, 0);
  assert.ok(result.researchQueue.items.length >= 1);
});

test('no-domain exports disclose set-aside passages as triage, never as analysis rows', async () => {
  const sourceText = 'The sky is blue. Water freezes at zero degrees Celsius.';
  const document = normalizeInput({ text: sourceText, source: { title: 'No-domain export fixture' } });
  const result = await analyzeDocument(document, REAL_CANON);
  const markdown = analysisToMarkdown(result);
  const queueMarkdown = researchQueueToMarkdown(result);
  const json = JSON.parse(analysisToJson(result));
  const queueJson = JSON.parse(researchQueueToJson(result));

  // Set-aside passages appear in the labeled triage disclosure with the gate's
  // reason, but never as passage-map rows, research candidates, or metrics.
  assert.match(markdown, /## Relevance triage/);
  assert.match(markdown, /Affirmative non-relationship frame[^\n]*The sky is blue/);
  assert.match(markdown, /2 clearly non-domain passages ignored/);
  assert.doesNotMatch(markdown, /## Passage map[\s\S]*The sky is blue/);
  assert.doesNotMatch(queueMarkdown, /The sky is blue/);
  assert.match(queueMarkdown, /2 clearly non-domain passages ignored/);
  assert.deepEqual(json.segments, []);
  assert.deepEqual(json.researchQueue.items, []);
  assert.equal(json.metrics.ignoredDomainSegments, 2);
  assert.equal(json.domainRelevance.ignoredPassages.length, 2);
  assert.ok(json.domainRelevance.ignoredPassages.every((passage) =>
    passage.reasonCode && passage.reasonLabel && passage.excerpt && passage.segmentId));
  assert.deepEqual(json.domainRelevance.overrides, { applied: [], unmatchedIds: [] });
  assert.equal(queueJson.domainRelevance.ignoredSegments, 2);
  assert.deepEqual(queueJson.queue.items, []);
  assert.equal(document.text, sourceText);
});

test('the full novel relationship matrix remains analyzable without sentence allowlisting', async () => {
  const claims = [
    'Remote work reduces chance encounters between unattached adults.',
    'Shared custody of a pet can prolong conflict after separation.',
    'A person may optimize for emotional safety rather than maximum desirability.',
    'Moving frequently can make stable pair formation harder.',
    'Economic uncertainty changes when people combine households.',
    'The decline of recurring community spaces reduces opportunities for repeated exposure.',
    'People with strong support networks may tolerate relationship loss differently.',
    'A reputation can affect access to future partners even when appearance remains unchanged.',
    'A demanding schedule can narrow someone’s realistic pool.',
    'Repeated familiarity may matter more than immediate attraction in some environments.',
    'Living with roommates can affect privacy during early courtship.',
    'Long commutes may reduce the time available to sustain a relationship.',
    'Shared financial obligations can increase the cost of leaving.',
    'A person can prefer predictability without preferring commitment.',
    'Communities with high turnover may produce weaker romantic networks.',
  ];
  const document = normalizeInput({
    text: claims.join(' '),
    source: { title: 'Cold-review novel matrix' },
  });
  const result = await analyzeDocument(document, REAL_CANON);
  const analysisJson = JSON.parse(analysisToJson(result));
  const queueMarkdown = researchQueueToMarkdown(result);
  const mappedClaims = result.segments
    .filter((segment) => segment.mapped)
    .map((segment) => segment.unit.text);

  assert.deepEqual(result.segments.map((segment) => segment.unit.text), claims);
  assert.ok(result.segments.every((segment) =>
    ['relevant', 'uncertain'].includes(segment.unit.domainRelevance.status)));
  assert.ok(result.segments.every((segment) => segment.unit.isClaimLike));
  assert.equal(result.metrics.claimLikeSegments, claims.length);
  assert.equal(result.metrics.ignoredDomainSegments, 0);
  assert.deepEqual(mappedClaims, [
    'The decline of recurring community spaces reduces opportunities for repeated exposure.',
  ]);
  assert.equal(
    result.segments.find((segment) => segment.unit.text === mappedClaims[0]).matches[0].title,
    'Exposure',
  );
  result.segments.filter((segment) => !segment.mapped).forEach((segment) => {
    assert.ok(result.researchQueue.items.some((item) => item.segmentId === segment.unit.id));
    assert.match(queueMarkdown, new RegExp(segment.unit.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });
  assert.deepEqual(analysisJson.segments.map((segment) => segment.unit.text), claims);
});

test('the complete non-romantic sense matrix is affirmatively ignored', async () => {
  const claims = [
    'The stock market is competitive.',
    'This material has high tensile strength.',
    'The database relationship is one-to-many.',
    'The actor was attractive at the box office.',
    'The chemical bond is stable.',
    'The company is seeking committed capital.',
    'The selection algorithm chose the fastest route.',
    'The family of functions is continuous.',
    'The model has high confidence.',
    'The value of the property increased.',
    'The operating system terminated the process.',
    'The network connection is unreliable.',
    'The pair of electrons share an orbital.',
    'The application rejected the invalid request.',
    'The parent process created a child process.',
    'The body of the document contains five sections.',
    'The engagement rate increased after the advertisement.',
    'The profile of the mountain is visible.',
    'The match ended in a draw.',
    'The divorce between the two companies was completed.',
  ];
  const document = normalizeInput({
    text: claims.join(' '),
    source: { title: 'Cold-review polysemy matrix' },
  });
  const decisions = classifyDomainRelevance(detectClaimUnits(document));
  const result = await analyzeDocument(document, REAL_CANON);

  assert.equal(decisions.length, claims.length);
  decisions.forEach((unit) => {
    assert.equal(unit.domainRelevance.status, 'irrelevant', unit.text);
    assert.equal(unit.domainRelevance.reasonCode, 'affirmative-non-domain-evidence', unit.text);
    assert.ok(unit.domainRelevance.nonDomainScore >= 4, unit.text);
  });
  assert.equal(result.metrics.ignoredDomainSegments, claims.length);
  assert.equal(result.metrics.claimLikeSegments, 0);
  assert.equal(result.metrics.mappedClaimSegments, 0);
  assert.equal(result.metrics.unmappedClaimSegments, 0);
  assert.deepEqual(result.segments, []);
  assert.deepEqual(result.strongestMatches, []);
  assert.deepEqual(result.pressureTests, []);
  assert.deepEqual(result.researchQueue.items, []);
  assert.equal(result.coverage.mappedClaimSegmentSharePct, null);
  assert.equal(result.coverage.mappedClaimWordSharePct, null);
});

test('domain context requires bounded anaphora plus semantic continuity', () => {
  const legitimate = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'Dating apps encourage rapid visual judgments. This makes photographs unusually important.',
  })));
  assert.equal(legitimate[1].domainRelevance.status, 'relevant');
  assert.equal(legitimate[1].domainRelevance.localStatus, 'irrelevant');
  assert.equal(legitimate[1].domainRelevance.contextHelp?.sourceUnitId, legitimate[0].id);
  assert.equal(legitimate[1].domainRelevance.contextHelp?.continuity, 'approved-consequence-language');

  const validIt = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'Dating apps can reduce offline encounters. It can reduce opportunities to meet.',
  })));
  assert.equal(validIt[1].domainRelevance.status, 'relevant');
  assert.equal(validIt[1].domainRelevance.contextHelp?.sourceUnitId, validIt[0].id);

  [
    'Dating apps encourage rapid visual judgments. This server is running Linux today.',
    'Dating apps encourage rapid visual judgments. This database relationship is one-to-many.',
    'Dating apps encourage rapid visual judgments. This chemical bond is stable.',
    'Dating apps encourage rapid visual judgments. It runs on Linux today.',
  ].forEach((text) => {
    const units = classifyDomainRelevance(detectClaimUnits(normalizeInput({ text })));
    assert.equal(units[1].domainRelevance.status, 'irrelevant', text);
    assert.equal(units[1].domainRelevance.contextHelp, null, text);
  });

  const exactIt = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'Dating apps encourage rapid visual judgments. It reduces opportunities to meet partners.',
  })));
  assert.equal(exactIt[1].domainRelevance.status, 'relevant');
  assert.equal(exactIt[1].boundedContext?.sourceUnitId, exactIt[0].id);

  const nonCascade = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'Dating apps encourage rapid visual judgments. This makes photographs important. This changes everything. It is obvious.',
  })));
  assert.equal(nonCascade[1].domainRelevance.contextHelp?.sourceUnitId, nonCascade[0].id);
  assert.equal(nonCascade[2].domainRelevance.contextHelp, null);
  assert.equal(nonCascade[3].domainRelevance.contextHelp, null);

  const segmentBoundaries = classifyDomainRelevance(detectClaimUnits({
    segments: [
      { id: 'speaker-a', speaker: 'Ana', text: 'Dating apps encourage rapid visual judgments.' },
      { id: 'speaker-b', speaker: 'Bo', text: 'This makes photographs important.' },
    ],
  }));
  assert.equal(segmentBoundaries[1].boundedContext, null);
  assert.equal(segmentBoundaries[1].domainRelevance.contextHelp, null);

  const uncertainPredecessor = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'Attachment can change slowly over time. This makes photographs important.',
  })));
  assert.equal(uncertainPredecessor[0].domainRelevance.localStatus, 'uncertain');
  assert.equal(uncertainPredecessor[1].domainRelevance.status, 'relevant');
  assert.equal(uncertainPredecessor[1].domainRelevance.contextHelp?.sourceUnitId,
    uncertainPredecessor[0].id);

  const irrelevantPredecessor = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'The sky is blue. This makes photographs important.',
  })));
  assert.equal(irrelevantPredecessor[0].domainRelevance.localStatus, 'irrelevant');
  assert.equal(irrelevantPredecessor[1].domainRelevance.contextHelp, null);
});

test('credible mappings require score plus inspectable evidence sufficiency', async () => {
  const weakGenericClaim = 'Long commutes may reduce the time available to sustain a relationship.';
  const weakResult = await analyzeDocument(normalizeInput({ text: weakGenericClaim }), REAL_CANON);
  const weakPassage = weakResult.segments[0];
  assert.equal(weakPassage.mapped, false);
  assert.equal(weakPassage.weakMatches[0].title, 'Common interests');
  assert.equal(weakPassage.weakMatches[0].score, 0.436);
  assert.ok(weakPassage.weakMatches[0].whyMatched.some((reason) =>
    reason.startsWith('Admission guard:')));
  assert.deepEqual(weakResult.researchQueue.items.map((item) => item.excerpt), [weakGenericClaim]);

  const phraseResult = await analyzeDocument(normalizeInput({
    text: 'Attraction is not selection.',
  }), REAL_CANON);
  assert.ok(phraseResult.segments[0].matches.some((match) =>
    match.canonId === 'frameworks:conversion-ladder'));

  const multipleDistinctive = await analyzeDocument(normalizeInput({
    text: 'Mutual readiness and life plans can diverge before commitment.',
  }), CANON);
  const readiness = multipleDistinctive.segments[0].matches.find((match) =>
    match.canonId === 'frameworks.readiness-gate');
  assert.ok(readiness);
  assert.ok(readiness.score >= 0.43);
  assert.ok(readiness.whyMatched.some((reason) => /Distinctive overlap|Exact phrase|Concept signature/.test(reason)));
});

test('coverage distinguishes unavailable, zero, and positive denominators', async () => {
  const noDomain = await analyzeDocument(normalizeInput({
    text: 'The sky is blue. Water freezes at zero degrees Celsius.',
  }), REAL_CANON);
  assert.equal(noDomain.metrics.claimLikeSegments, 0);
  assert.equal(noDomain.schemaVersion, 'le-lab.analysis/2.1');
  assert.equal(noDomain.researchQueue.schemaVersion, 'le-lab.research-queue/2.0');
  assert.equal(noDomain.coverage.mappedClaimSegmentSharePct, null);
  assert.equal(noDomain.coverage.unmappedClaimSegmentSharePct, null);
  assert.equal(noDomain.coverage.mappedClaimWordSharePct, null);
  assert.match(analysisToMarkdown(noDomain), /Mapped share of claim-like segments:\*\* Not applicable/);
  assert.doesNotMatch(analysisToMarkdown(noDomain), /Mapped share of claim-like segments:\*\* 0%/);

  const noMatch = await analyzeDocument(normalizeInput({
    text: 'Shared custody of a pet can prolong conflict after separation.',
  }), REAL_CANON);
  assert.equal(noMatch.metrics.claimLikeSegments, 1);
  assert.equal(noMatch.metrics.mappedClaimSegments, 0);
  assert.equal(noMatch.coverage.mappedClaimSegmentSharePct, 0);

  const mapped = await analyzeDocument(normalizeInput({
    text: 'Attraction is not selection.',
  }), REAL_CANON);
  assert.equal(mapped.metrics.claimLikeSegments, 1);
  assert.equal(mapped.metrics.mappedClaimSegments, 1);
  assert.equal(mapped.coverage.mappedClaimSegmentSharePct, 100);
});

test('visitor overrides lock domain decisions and are disclosed end to end', async () => {
  const document = normalizeInput({
    text: 'The sky is blue. Couples who meet through friends stay together longer than couples who meet on apps.',
    source: { title: 'Override fixture' },
  });
  const baseline = await analyzeDocument(document, REAL_CANON);
  const ignoredId = baseline.domainRelevance.ignoredPassages[0].segmentId;
  const retainedId = baseline.segments[0].unit.id;
  assert.equal(baseline.metrics.claimLikeSegments, 1);
  assert.equal(baseline.metrics.ignoredDomainSegments, 1);

  // Include: the machine's verdict stays visible; the passage joins analysis.
  const included = await analyzeDocument(document, REAL_CANON, {
    domainOverrides: { [ignoredId]: 'include' },
  });
  assert.equal(included.metrics.ignoredDomainSegments, 0);
  assert.equal(included.metrics.claimLikeSegments, 2);
  const includedUnit = included.segments
    .find((segment) => segment.unit.id === ignoredId).unit;
  assert.equal(includedUnit.domainRelevance.status, 'relevant');
  assert.equal(includedUnit.domainRelevance.localStatus, 'irrelevant');
  assert.equal(includedUnit.domainRelevance.override, 'include');
  assert.equal(includedUnit.domainRelevance.reasonCode, 'user-override-include');
  assert.deepEqual(included.domainRelevance.overrides.applied,
    [{ segmentId: ignoredId, action: 'include' }]);

  // Exclude: the retained claim leaves every analytical population but is
  // disclosed as a set-aside with the override reason, and coverage loses its
  // denominator honestly.
  const excluded = await analyzeDocument(document, REAL_CANON, {
    domainOverrides: { [retainedId]: 'exclude' },
  });
  assert.equal(excluded.metrics.claimLikeSegments, 0);
  assert.equal(excluded.metrics.ignoredDomainSegments, 2);
  assert.equal(excluded.coverage.mappedClaimSegmentSharePct, null);
  assert.deepEqual(excluded.researchQueue.items, []);
  const excludedRecord = excluded.domainRelevance.ignoredPassages
    .find((passage) => passage.segmentId === retainedId);
  assert.equal(excludedRecord.reasonCode, 'user-override-exclude');
  assert.equal(excludedRecord.overridden, true);
  const excludedMarkdown = analysisToMarkdown(excluded);
  assert.match(excludedMarkdown, /1 passage excluded by the visitor/);
  assert.match(excludedMarkdown, /Excluded by the visitor for this session[^\n]*Couples who meet through friends/);
  assert.match(researchQueueToMarkdown(excluded), /excluded by the visitor/);

  // Stale overrides are echoed, warned about, and never applied.
  const stale = await analyzeDocument(document, REAL_CANON, {
    domainOverrides: { 'seg-gone.claim-99': 'include', [ignoredId]: 'invalid-action' },
  });
  assert.deepEqual(stale.domainRelevance.overrides.applied, []);
  assert.deepEqual(stale.domainRelevance.overrides.unmatchedIds, ['seg-gone.claim-99']);
  assert.ok(stale.warnings.some((warning) => /override/.test(warning.message)));
  assert.equal(stale.metrics.ignoredDomainSegments, 1);
});

test('an include override admits a context-only set-aside as an analyzable claim', async () => {
  // Reviewer contract-violation reproduction (benchmark case pt-03): a passage
  // whose machine isClaimLike is false was included, echoed, but never entered
  // claims, coverage, or the queue, and lost its Undo surface. A locked
  // visitor input must be honored through every analytical population.
  const document = normalizeInput({
    text: 'The merger married two incompatible corporate cultures.',
    source: { title: 'pt-03 include fixture' },
  });
  const baseline = await analyzeDocument(document, REAL_CANON);
  assert.equal(baseline.metrics.claimLikeSegments, 0);
  assert.equal(baseline.metrics.ignoredDomainSegments, 1);
  const ignoredId = baseline.domainRelevance.ignoredPassages[0].segmentId;

  const included = await analyzeDocument(document, REAL_CANON, {
    domainOverrides: { [ignoredId]: 'include' },
  });
  const unit = included.segments.find((segment) => segment.unit.id === ignoredId)?.unit;
  assert.ok(unit, 'The included passage is present in analysis segments.');
  assert.equal(unit.isClaimLike, true);
  assert.equal(unit.machineClaimLike, false);
  assert.equal(unit.domainRelevance.status, 'relevant');
  assert.equal(unit.domainRelevance.localStatus, 'irrelevant');
  assert.equal(included.metrics.claimLikeSegments, 1);
  assert.equal(included.metrics.ignoredDomainSegments, 0);
  assert.notEqual(included.coverage.mappedClaimSegmentSharePct, null,
    'An included claim gives coverage a denominator.');
  assert.ok(
    included.metrics.mappedClaimSegments === 1
      || included.researchQueue.items.some((item) => item.segmentId === ignoredId),
    'The included claim lands in a mapping or the Research Queue, never in limbo.',
  );
  assert.deepEqual(included.domainRelevance.overrides.applied,
    [{ segmentId: ignoredId, action: 'include' }]);
});

test('held-out non-domain frames are ignored before canon retrieval', async () => {
  const families = {
    computing: [
      'The routing heuristic picked the quickest path.',
      'The pathfinder selected the shortest route.',
      'The kernel killed the task.',
      'The operating core stopped the job.',
      'The API refused the malformed input.',
      'The endpoint declined an invalid payload.',
      'The classifier is 96% certain.',
      'The prediction system assigned high certainty.',
    ],
    corporate: [
      'The firms split, ending their joint venture.',
      'The businesses dissolved their partnership.',
      'The stock index fell sharply.',
      'Equities declined during trading.',
    ],
    sports: [
      'The teams finished level.',
      'The sides ended with equal scores.',
      'The match ended in a draw.',
      'Neither club won the contest.',
    ],
    documents: [
      'The report body is divided into five parts.',
      'The main text contains several sections.',
      'The document profile lists its dimensions.',
    ],
    science: [
      'An atomic pair shares an electron shell.',
      'The composite material retained considerable strength.',
      'This family of functions stays continuous.',
      'The molecular structure remains chemically stable.',
      'The forecasting model reports strong confidence.',
    ],
  };
  const claims = Object.values(families).flat();
  const document = normalizeInput({
    text: claims.join(' '),
    source: { title: 'Held-out non-domain frames' },
  });
  const decisions = classifyDomainRelevance(detectClaimUnits(document));
  const result = await analyzeDocument(document, REAL_CANON);

  assert.equal(decisions.length, claims.length);
  decisions.forEach((unit) => {
    assert.equal(unit.domainRelevance.status, 'irrelevant', unit.text);
    assert.equal(unit.domainRelevance.reasonCode, 'affirmative-non-domain-evidence', unit.text);
    assert.equal(unit.domainRelevance.frames.nonDomain.detected, true, unit.text);
    assert.ok(unit.domainRelevance.frames.nonDomain.evidence.length >= 1, unit.text);
    assert.notEqual(unit.domainRelevance.reasonCode, 'unresolved-claim-retained');
  });
  assert.equal(result.metrics.ignoredDomainSegments, claims.length);
  assert.equal(result.metrics.claimLikeSegments, 0);
  assert.deepEqual(result.segments, []);
  assert.deepEqual(result.strongestMatches, []);
  assert.deepEqual(result.pressureTests, []);
  assert.deepEqual(result.researchQueue.items, []);
  assert.equal(result.coverage.mappedClaimSegmentSharePct, null);
  assert.ok(!result.segments.some((segment) =>
    segment.matches.some((match) => /Body/i.test(match.title))));
});

test('explicit relational outcomes outrank incidental finance inputs without score stacking', async () => {
  const claims = [
    'The stock market crash can delay marriage.',
    'Economic losses in the stock market may postpone marriage.',
    'A collapse in household wealth may cause couples to postpone marrying.',
    'Financial losses may postpone household formation.',
  ];
  const document = normalizeInput({
    text: claims.join(' '),
    source: { title: 'Mixed-domain causal frames' },
  });
  const decisions = classifyDomainRelevance(detectClaimUnits(document));
  const result = await analyzeDocument(document, REAL_CANON);

  assert.deepEqual(result.segments.map((segment) => segment.unit.text), claims);
  assert.equal(result.metrics.ignoredDomainSegments, 0);
  decisions.forEach((unit) => {
    assert.equal(unit.domainRelevance.status, 'relevant', unit.text);
    assert.equal(unit.domainRelevance.frames.outcome.detected, true, unit.text);
    assert.notEqual(unit.domainRelevance.reasonCode, 'affirmative-non-domain-evidence');
  });
  const financeInput = decisions[0].domainRelevance;
  assert.equal(financeInput.frames.nonDomain.evidence.length, 1);
  assert.equal(financeInput.nonDomainScore,
    financeInput.frames.nonDomain.score);
  result.segments.filter((segment) => !segment.mapped).forEach((segment) => {
    assert.ok(result.researchQueue.items.some((item) => item.segmentId === segment.unit.id));
  });
});

test('held-out human relational mechanisms remain analyzable without phrase allowlisting', async () => {
  const claims = [
    'A collapse in household wealth may cause couples to postpone marrying.',
    'Commuting for several hours leaves less time to maintain a partnership.',
    'Frequent relocation reduces repeated contact among unattached residents.',
    'Shared debt can make separation harder.',
    'Irregular work hours shrink the set of people someone can realistically date.',
    'Losing recurring neighborhood gatherings reduces opportunities to become familiar with potential partners.',
    'Strong friendship networks may change how someone recovers after a breakup.',
    'Living with other adults can reduce privacy while a romance is developing.',
  ];
  const result = await analyzeDocument(normalizeInput({
    text: claims.join(' '),
    source: { title: 'Held-out relational mechanisms' },
  }), REAL_CANON);

  assert.deepEqual(result.segments.map((segment) => segment.unit.text), claims);
  assert.equal(result.metrics.ignoredDomainSegments, 0);
  result.segments.forEach((segment) => {
    assert.ok(['relevant', 'uncertain'].includes(segment.unit.domainRelevance.status),
      segment.unit.text);
    const frames = segment.unit.domainRelevance.frames;
    assert.ok(frames.participant.detected || frames.outcome.detected || frames.mechanism.detected,
      segment.unit.text);
    if (!segment.mapped) {
      assert.ok(result.researchQueue.items.some((item) => item.segmentId === segment.unit.id),
        segment.unit.text);
    }
  });
});

test('anaphora is resolved before the independent frame gate and cannot cascade', async () => {
  const source = [
    'Dating apps encourage rapid visual judgments.',
    'This puts photographs first.',
    'It can query PostgreSQL.',
    'It matters a great deal.',
  ].join(' ');
  const document = normalizeInput({ text: source, source: { title: 'Context frame ordering' } });
  const decisions = classifyDomainRelevance(detectClaimUnits(document));
  const result = await analyzeDocument(document, REAL_CANON);

  assert.deepEqual(decisions.map((unit) => unit.domainRelevance.status),
    ['relevant', 'relevant', 'irrelevant', 'irrelevant']);
  assert.equal(decisions[1].domainRelevance.localStatus, 'irrelevant');
  assert.equal(decisions[1].domainRelevance.contextHelp?.sourceUnitId, decisions[0].id);
  assert.equal(decisions[1].domainRelevance.contextHelp?.continuity,
    'approved-consequence-language');
  assert.equal(decisions[2].domainRelevance.frames.nonDomain.evidence[0].code, 'computing');
  assert.equal(decisions[2].domainRelevance.contextHelp, null);
  assert.equal(decisions[3].domainRelevance.reasonCode, 'no-human-relational-frame');
  assert.equal(decisions[3].domainRelevance.contextHelp, null);
  assert.deepEqual(result.segments.map((segment) => segment.unit.text), decisions.slice(0, 2).map((unit) => unit.text));
  assert.equal(result.metrics.ignoredDomainSegments, 2);

  const validVariant = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'Dating apps can reduce repeated contact. That may make repeated exposure harder.',
  })));
  assert.equal(validVariant[1].domainRelevance.status, 'relevant');
  assert.ok(validVariant[1].domainRelevance.contextHelp);

  const invalidVariant = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: 'Dating apps can reduce repeated contact. It uses a different API.',
  })));
  assert.equal(invalidVariant[1].domainRelevance.status, 'irrelevant');
  assert.equal(invalidVariant[1].domainRelevance.contextHelp, null);
});

test('frame diagnostics expose each decision dimension without a claim-like fallback', () => {
  const claims = [
    'The classifier is 96% certain.',
    'The report body is divided into five parts.',
    'An unanchored assertion is supposedly important.',
  ];
  const decisions = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text: claims.join(' '),
  })));

  decisions.forEach((unit) => {
    assert.equal(unit.domainRelevance.status, 'irrelevant');
    assert.ok(unit.domainRelevance.decisiveReason);
    assert.ok(unit.domainRelevance.frames.participant);
    assert.ok(unit.domainRelevance.frames.outcome);
    assert.ok(unit.domainRelevance.frames.mechanism);
    assert.ok(unit.domainRelevance.frames.nonDomain);
    assert.notEqual(unit.domainRelevance.reasonCode, 'unresolved-claim-retained');
  });
});
