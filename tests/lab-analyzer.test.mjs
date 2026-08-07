import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { normalizeInput } from '../js/lab-intake.js';
import { createDemoDocument } from '../js/lab-demo.js';
import {
  ANALYSIS_SCHEMA_VERSION,
  RESEARCH_QUEUE_SCHEMA_VERSION,
  ANALYZER_VERSION,
  DIAGNOSTICS_SCHEMA_VERSION,
  PUBLIC_MATCH_FIELDS,
  PUBLIC_SEGMENT_FIELDS,
  PUBLIC_UNIT_FIELDS,
  SCORING_CONFIG,
  SCORING_CONFIG_HASH,
  analyzeDocument,
  analyzerInternals,
  classifyDomainRelevance,
  detectClaimUnits,
  prepareCanonIndex,
  scoringConfigHash,
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
      /*
       * Reworded 2026-07-31 at canon 532, by Jason's adjudication. The previous
       * probe read "volcanic ash predicts which romantic partner cancels a date"
       * and had stopped being novel: statistics:stat-desire-prediction is about
       * predicting which two people click, so it mapped there at 0.475 Low.
       *
       * The ruling took three attempts to settle and the record matters, because
       * two sessions greened this in good faith before it was adjudicated. The
       * options were (a) leave red, (b) narrow the entry's match surface,
       * (c) reword the probe. Jason held (a) until the entry could be measured,
       * then chose (c) — and the measurement is why (b) was rejected:
       * stat-desire-prediction reaches exactly TWO passages in the whole corpus,
       * one of them "Most U.S. adults are skeptical or unsure that dating
       * algorithms can predict love", which is precisely its subject. Narrowing
       * it would have cost a correct capture to protect a synthetic sentence.
       * Full record: md/lab-post-restoration-sweep-532.md.
       *
       * WHY THIS REPLACEMENT AND NOT ANOTHER — the selection rule, which is the
       * reusable part. The old probe died because it was written in vocabulary
       * (predict / romantic / date) that the canon later grew into, so a
       * replacement is chosen by MEASUREMENT against two criteria, not by taste:
       *
       *   1. Maximum headroom below minCredibleScore. This one's best match is
       *      0.336 (lexicon:term-the-consumer-unit) against a 0.43 line, so it
       *      sits 0.094 clear. Seven candidates were measured; the runners-up
       *      were "does the laundry" (0.346) and "parks the car" (0.335).
       *   2. Outside the canon's growth direction. "Laundry" and "parks the car"
       *      scored as well or better but were REJECTED: statistics carries
       *      stat-equal-earner-labor, so household-labour vocabulary is exactly
       *      where this canon is expanding — the same trap that killed the last
       *      probe. Seasonal physiology is nowhere near relationship science.
       *
       * A negative control has to sit OUTSIDE the distribution it controls for.
       * The old probe's failure was that it drifted inside: it scored 0.475 while
       * genuine corpus captures on that topic score 0.431-0.486. If this one ages
       * out too, re-measure candidates the same way rather than reaching for the
       * first sentence that passes.
       */
      novel: 'A new claim says volcanic ash decides which romantic partner sneezes more in autumn.',
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

    /*
     * The property this test is NAMED for, asserted directly.
     *
     * `mapped === false` below is the original check and it is worth keeping,
     * but it is a proxy: it cannot distinguish the failure this test exists to
     * catch — the novel claim picking up its neighbour's concept — from a
     * topical match the novel claim earned standing alone. Both read as
     * `mapped: true`, and they route to opposite repairs. When the probe aged
     * into the canon on 2026-07-31 that ambiguity cost three sessions a day:
     * the proxy broke while the property still held, and nothing in the file
     * could say so. Deciding it needed a hand-run diff of the segment's matches
     * against `expectedCanonId`.
     *
     * So both live here now. If a future probe ages in the same way, this line
     * stays green and says the contamination guard is intact, and the argument
     * starts from that fact instead of arriving at it.
     */
    assert.ok(
      !novelResult?.matches.some((match) => match.canonId === fixture.expectedCanonId),
      `the novel claim inherited ${fixture.expectedCanonId} from its neighbour — this is `
      + 'contamination, not the probe ageing into the canon, and the two need different fixes',
    );

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

test('the media-harvest doctrines retrieve from representative article claims', async () => {
  const probes = [
    {
      text: 'Household mental load includes anticipating household needs, planning and assigning tasks, and monitoring household work.',
      expected: 'frameworks:ownership-load',
    },
    {
      text: 'Responsive sexual desire can emerge after willingness and rewarding stimulation begin.',
      expected: 'frameworks:desire-state-split',
    },
    {
      text: 'Some intimate partners maintain separate households in living apart together (LAT) relationships.',
      expected: 'lexicon:term-living-apart-together-lat',
    },
  ];
  const result = await analyzeDocument(normalizeInput({
    text: probes.map((probe) => probe.text).join(' '),
    source: { title: 'Retention media harvest probes' },
  }), REAL_CANON);

  assert.equal(result.segments.length, probes.length);
  for (const probe of probes) {
    const segment = result.segments.find((candidate) => candidate.unit.text === probe.text);
    assert.equal(segment?.mapped, true);
    assert.equal(segment?.matches[0]?.canonId, probe.expected);
  }
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
  // The commitment claim is a recall gain from the verdict-field fix, not a
  // loosened expectation. M-TBD-63's ruling badge ("Signal-preferred, not
  // signal-required") used to sit in the canon's alias set, so "preferring" pulled
  // that ruling into the top slot at 0.416 and crowded out Commitment — which had
  // an exact alias hit at 0.412 — leaving the claim below the mapping gate. With
  // verdicts off the match surface, Commitment ranks first at 0.463 and it maps.
  assert.deepEqual(mappedClaims, [
    'The decline of recurring community spaces reduces opportunities for repeated exposure.',
    'A person can prefer predictability without preferring commitment.',
  ]);
  assert.equal(
    result.segments.find((segment) => segment.unit.text === mappedClaims[0]).matches[0].title,
    'Exposure',
  );
  assert.equal(
    result.segments.find((segment) => segment.unit.text === mappedClaims[1]).matches[0].title,
    'Commitment',
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
  /*
   * The neighbour changed with overlay tranche 2, and it changed in the
   * direction the test is about. Availability ("actually free to invest —
   * emotionally, practically, and in timing") is the apter neighbour for a claim
   * about time to sustain a relationship than Common interests ever was; it
   * gained a match surface in tranche 2 and now outranks it.
   *
   * The point of this test is that score alone cannot admit a match. That got
   * STRONGER, not weaker: the top weak score rose from 0.436 to 0.538 — well
   * past minCredibleScore 0.43 — and the admission guard still refuses to map
   * it. A pin that only ever moved down would not have shown that.
   *
   * IDF is computed across the canon, so this score moves whenever the index
   * gains text. 0.436 at 450 concepts; 0.437 at 463; 0.436 again after tranche 1
   * enriched 73 bare entries; 0.538 once tranche 2 gave this entry its own;
   * 0.539 at 469, the cultural-register doctrine; 0.538 again after tranche 3.
   *
   * That last step went DOWN, and at an unchanged 469 concepts — tranche 3 added
   * no entries, only 56 misreadings and 44 boundaries, so the denominators moved
   * without the population moving. Drift in both directions on the same pin is
   * the clearest argument that the number is not the assertion: the three around
   * it are, and they have held through every one of these steps.
   *
   * 0.538 held at 476 when the transaction-layer batch landed, and went to 0.537
   * when that batch's entries were REWORDED after cold review — no entry added or
   * removed, 476 both sides. Same lesson as the tranche 3 step, from the other
   * direction: prose edits inside existing entries move the denominators too, so
   * this pin drifts on rewrites and not only on growth.
   *
   * Back to 0.538 at 485, the Lab hookup pass: six Lexicon terms added AND the
   * Substitution Layer's "AI companion" alias removed. Both move IDF, in opposite
   * directions, and the pin landed back where it started. Six round trips now on
   * a number that has never once been the assertion.
   *
   * 0.537 at 488, the market-container batch: three entries whose match surfaces
   * are dense in market and ratio vocabulary. Note this is the SECOND time the pin
   * has sat at 0.537 and the second time it got there by a different route — 476
   * by rewording, 488 by growth. A pin that returns to the same value from
   * unrelated causes is measuring the corpus, not the change, which is the whole
   * reason the three assertions around it carry the test.
   *
   * 0.536 at 491, the advice-layer batch. 0.537 at 529, the statistics and pill
   * concepts of bfaff2e. Nine moves now, and the cumulative
   * drift across all of them is 0.003 — three thousandths, against a
   * minCredibleScore of 0.43 that the assertion below actually cares about. The
   * honest summary of this pin's whole history is that canon growth moves it far
   * too little to matter, and it has never once come close to changing the
   * behaviour the test exists to check.
   *
   * 0.537 HELD at 532 when three Lexicon terms landed — the first entry in this
   * log recording a change that moved the pin by nothing at all, which is worth
   * as much as the ones that moved it. Note what the 491 → 529 → 532 stretch
   * actually was: the index had drifted stale at a committed 507 while
   * pills.html and statistics.html grew the canon underneath it, so the 38
   * concepts of the 529 step arrived in one regeneration rather than one batch.
   * The largest population change in this log still produced the same
   * thousandth-scale step a rewording once did. The pin measures the corpus, and
   * it is not sensitive to how the corpus grew.
   *
   * 0.538 at 536 when the retention-media harvest added two frameworks and two
   * Lexicon terms. Ten moves now; cumulative drift is 0.004 against a
   * minCredibleScore of 0.43. The admission guard still blocks the passage, so
   * the behavior this test protects is unchanged.
   *
   * 0.537 at 540 when media loop 03 added three frameworks and one statistics
   * card. Eleven moves; cumulative drift remains 0.003 against 0.43, and the
   * admission guard still blocks the passage. This updates the corpus pin, not
   * the behavior or any threshold.
   *
   * 0.536 at 573 when pressure test 08 folded two scout proposals into
   * frameworks.html — the Authority Firewall under the Meeting Channel and
   * Synthetic Reciprocity under the Substitution Layer. Twelve moves; cumulative
   * drift is back to 0.002 against a minCredibleScore of 0.43. Neither new entry
   * is a candidate for this passage; the movement is IDF alone, which is the
   * same mechanism every prior entry in this log describes. The admission guard
   * still blocks the passage and the two assertions below it still hold, so
   * again this updates the corpus pin and nothing about the behavior.
   */
  assert.equal(weakPassage.weakMatches[0].title, 'Availability');
  assert.equal(weakPassage.weakMatches[0].score, 0.536);
  assert.ok(weakPassage.weakMatches[0].score > SCORING_CONFIG.minCredibleScore);
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

test('the weak list says how much of the band it is', async () => {
  /*
   * maxWeakMatches keeps three, retrieval keeps eight, and until v2.6.9 the
   * payload published neither number — so a consumer could report the weak list
   * as though it were the band. Across the 21-source archive the band is a
   * median 4 and a p90 12, and the ledger's "Nearest: X" line stood in for more
   * than one concept on 1,163 of 1,643 unmapped rows.
   *
   * The pins here are the RELATIONSHIP, not the count. weakBandTotal is an IDF
   * quantity over the whole canon and moves on every doctrine merge; what must
   * never move is that it can be trusted as a denominator.
   */
  const result = await analyzeDocument(normalizeInput({
    text: 'Attraction, commitment, and long-term compatibility are not the same thing, '
      + 'and treating them as one explains most of the confusion people have about dating.',
  }), REAL_CANON);
  const segment = result.segments[0];

  assert.equal(typeof segment.weakBandTotal, 'number');
  assert.ok(segment.weakBandTotal > segment.weakMatches.length,
    'this passage is chosen because the cap bites: the band is wider than the carried list');
  assert.equal(segment.weakMatches.length, SCORING_CONFIG.maxWeakMatches,
    'and the carried list is at the cap, so the difference is suppression and not scarcity');

  // The invariant, on every segment of a real document. A denominator smaller
  // than its numerator would let the UI render "3 of 2 in the nearby band".
  const demo = await analyzeDocument(createDemoDocument(), REAL_CANON);
  demo.segments.forEach((row) => {
    assert.ok(row.weakBandTotal >= row.weakMatches.length,
      `${row.unit.id} publishes a band of ${row.weakBandTotal} under a carried list of ${row.weakMatches.length}`);
  });

  // Nothing retrieved means nothing to be honest about, and zero rather than
  // undefined so a consumer can do arithmetic on it without guarding.
  const empty = await analyzeDocument(normalizeInput({
    text: 'Water freezes at zero degrees Celsius under standard atmospheric pressure.',
  }), REAL_CANON);
  empty.segments.forEach((row) => assert.equal(row.weakBandTotal, 0));
});

test('the research card says what its three nearest concepts are three of', async () => {
  /*
   * `maxNearestConcepts` keeps three behind a retrieval cut to eight, and until
   * v2.6.10 the queue item published neither number: 1,607 of 1,617 research
   * items across the 21-source archive sat at the cap reading as a complete
   * list. Same defect the ledger carried until v2.6.9, one surface over.
   *
   * The pins are the RELATIONSHIP, not the counts — `scoredConceptTotal` is an
   * IDF quantity over the whole canon and moves on every doctrine merge.
   */
  const demo = await analyzeDocument(createDemoDocument(), REAL_CANON);
  const items = demo.researchQueue.items;
  assert.ok(items.length, 'the demo must produce research items for this to measure anything');

  items.forEach((item) => {
    assert.equal(typeof item.scoredConceptTotal, 'number');
    assert.equal(typeof item.nearbyBandTotal, 'number');
    assert.ok(item.scoredConceptTotal >= item.nearestConcepts.length,
      `${item.segmentId} publishes a scored total of ${item.scoredConceptTotal} under a shown list `
      + `of ${item.nearestConcepts.length}`);
  });

  const capped = items.find((item) => item.nearestConcepts.length === SCORING_CONFIG.maxNearestConcepts);
  assert.ok(capped, 'chosen because the cap bites: the list is at the cap, so the gap is suppression');
  assert.ok(capped.scoredConceptTotal > capped.nearestConcepts.length,
    'and there is more behind it than the card shows');

  /*
   * WHY THE BAND IS NOT THE DENOMINATOR, frozen as a specimen.
   *
   * `nearbyBandTotal` is the obvious choice — it is what the ledger names — and
   * it would reintroduce the defect it fixed. The band is [minWeakScore,
   * minCredibleScore); this list is the top of the CANDIDATE set. Measured over
   * the archive the band sits below the shown count on 687 of 1,617 items and
   * is zero on 197, so the card would have read "3 of 0 in the nearby band".
   *
   * This probe is authored rather than lifted: the corpus is gitignored
   * third-party text (md/RERUN.md §1). It clears the gate on a decisive frame,
   * is claim-like, and shares no distinctive canon vocabulary, so every
   * candidate lands under the weak floor and the band is empty while three
   * concepts are still shown.
   */
  const belowBand = await analyzeDocument(normalizeInput({
    text: 'Women who date beekeepers inherit an unexpected quantity of protective netting, '
      + 'smokers, hive tools and unlabelled honey jars.',
  }), REAL_CANON);
  const specimen = belowBand.researchQueue.items[0];
  assert.ok(specimen, 'the probe must reach the research queue for the specimen to mean anything');
  assert.equal(specimen.nearbyBandTotal, 0);
  assert.equal(specimen.nearestConcepts.length, SCORING_CONFIG.maxNearestConcepts);
  specimen.nearestConcepts.forEach((concept) => {
    assert.ok(concept.score < SCORING_CONFIG.minWeakScore,
      'the band is empty because every shown concept is under the weak floor, not because nothing scored');
  });
  assert.ok(specimen.scoredConceptTotal >= specimen.nearestConcepts.length,
    'and the denominator that ships still holds where the band does not');
});

test('coverage distinguishes unavailable, zero, and positive denominators', async () => {
  const noDomain = await analyzeDocument(normalizeInput({
    text: 'The sky is blue. Water freezes at zero degrees Celsius.',
  }), REAL_CANON);
  assert.equal(noDomain.metrics.claimLikeSegments, 0);
  // The constant, not a literal: this asserts that the analysis stamps its own
  // schema version, which is true at every release. A literal here made a
  // routine version bump look like a coverage regression.
  //
  // The queue line was still a literal, one line under that comment, and the
  // v2.6.10 queue-shape bump duly failed it as a fake coverage regression —
  // the exact defect the sentence above describes, sitting inside the test it
  // describes. Same fix, applied for real this time.
  assert.equal(noDomain.schemaVersion, ANALYSIS_SCHEMA_VERSION);
  assert.equal(noDomain.researchQueue.schemaVersion, RESEARCH_QUEUE_SCHEMA_VERSION);
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

test('dating-app interaction mechanics are retained through the agreed append-1 frame', () => {
  // Agreed benchmark append #1 (md/lab-benchmark-append-proposal-01.md): the
  // verbatim Harvest #1 production miss must be retained by the systematic
  // frame, and the polysemous trap senses must stay affirmatively excluded.
  const [retained] = classifyDomainRelevance([{
    id: 'ap-01-unit',
    parentSegmentId: 'bench-ap-01',
    segmentIndex: 0,
    text: 'By contrast, 64% of men say they have felt insecure because of the lack of messages they received, while four-in-ten women say the same.',
    wordCount: 24,
    isClaimLike: true,
    boundedContext: null,
  }]);
  assert.notEqual(retained.domainRelevance.status, 'irrelevant');
  assert.ok(retained.domainRelevance.evidence.some(
    (evidence) => evidence.code === 'dating-app-interaction',
  ));

  const [trap] = classifyDomainRelevance([{
    id: 'ap-05-unit',
    parentSegmentId: 'bench-ap-05',
    segmentIndex: 0,
    text: 'The server rejected the messages after the connection dropped.',
    wordCount: 10,
    isClaimLike: true,
    boundedContext: null,
  }]);
  assert.equal(trap.domainRelevance.status, 'irrelevant');
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

test('abbreviation periods and open parentheticals never shard sentence segmentation', () => {
  // The exact parenthetical-stats regression from Doctrine Harvest #1 (C1):
  // "vs." inside a parenthesis produced truncated parents plus orphan shards.
  const document = normalizeInput({
    text: 'Men are somewhat more likely than women to have tried online dating (34% vs. 27%). '
      + 'Adults who have never been married are much more likely than married adults to report having used them (52% vs. 16%).',
    source: { title: 'Parenthetical stats fixture' },
    createdAt: '2026-07-27T12:00:00.000Z',
  });
  const units = detectClaimUnits(document);
  assert.equal(units.length, 2, 'expected exactly two whole claim units');
  assert.match(units[0].text, /\(34% vs\. 27%\)\.$/, 'first claim must keep its full parenthetical');
  assert.match(units[1].text, /\(52% vs\. 16%\)\.$/, 'second claim must keep its full parenthetical');
  units.forEach((unit) => {
    assert.doesNotMatch(unit.text, /^\d+%\)\.?$/, 'no orphan percentage shards');
    assert.doesNotMatch(unit.text, /vs\.$/, 'no claim truncated at the abbreviation');
  });

  // Always-merge abbreviations rejoin even before a capital.
  const abbrevUnits = detectClaimUnits(normalizeInput({
    text: 'Paid features raise visibility, e.g. Boost placements double impressions. Approx. 41% of men have paid for reach.',
  }));
  assert.equal(abbrevUnits.length, 2);
  assert.match(abbrevUnits[0].text, /e\.g\. Boost placements/);

  // Sentence-final "U.S." before a fresh capitalized sentence must STILL split —
  // the continuation guard only rejoins lowercase/digit starts like "No. 5".
  const boundaryUnits = detectClaimUnits(normalizeInput({
    text: 'Online dating is common in the U.S. Many adults have tried at least one app. The top profile was ranked No. 1 overall.',
  }));
  assert.equal(boundaryUnits.length, 3);
  assert.match(boundaryUnits[2].text, /No\. 1 overall\.$/);
});

test('every export is self-describing: provenance stamp and provisional marker', async () => {
  const result = await analyzeDocument(createDemoDocument(), REAL_CANON);

  // The analysis names the build that produced it.
  assert.equal(result.provenance.analyzer.version, ANALYZER_VERSION);
  assert.equal(result.provenance.analyzer.schemaVersion, ANALYSIS_SCHEMA_VERSION);
  assert.equal(result.provenance.analyzer.mode, result.analysisMode.id);
  assert.equal(result.provenance.analyzer.scoringConfigHash, SCORING_CONFIG_HASH);
  assert.match(result.provenance.analyzer.scoringConfigHash, /^[a-z0-9]+$/);

  // ...and the canon snapshot it ran against.
  assert.equal(result.provenance.canonIndex.indexVersion, REAL_CANON.indexVersion);
  assert.equal(result.provenance.canonIndex.generatedAt, REAL_CANON.generatedAt);
  assert.equal(result.provenance.canonIndex.schemaVersion, REAL_CANON.schemaVersion);

  // A queue lifted out of the analysis carries the same stamp on its own.
  assert.deepEqual(result.researchQueue.provenance, result.provenance);

  // Coverage is flagged provisional until the thresholds are calibrated.
  assert.equal(result.coverage.provisional.provisional, true);
  assert.equal(result.coverage.provisional.reason, 'thresholds uncalibrated');
  assert.ok(result.limitations.some((line) => /thresholds are provisional/i.test(line)));
});

test('the published match surface is exactly the allowlist, and nothing else gets out', async () => {
  // The export surface is built by naming what goes OUT, not by naming what
  // stays in. A denylist is a convention — it holds only while every working
  // field anyone hangs on a candidate happens to be named for it — and this is
  // the one place in the analyzer where a convention is not good enough.
  const result = await analyzeDocument(createDemoDocument(), REAL_CANON);
  const allowed = new Set(PUBLIC_MATCH_FIELDS);

  const matches = result.segments.flatMap((segment) => segment.matches);
  const weak = result.segments.flatMap((segment) => segment.weakMatches);
  assert.ok(matches.length && weak.length, 'the demo publishes both kinds');

  [...matches, ...weak].forEach((match) => {
    Object.keys(match).forEach((key) => {
      assert.ok(allowed.has(key), `${key} is published but not on the allowlist`);
    });
    // Order is part of the contract: the frozen fixture is compared byte for
    // byte, so a reordered allowlist is a fixture break, not a cosmetic change.
    assert.deepEqual(Object.keys(match), PUBLIC_MATCH_FIELDS.filter((field) => field in match));
  });

  // Every allowlisted field is real. A name here that nothing produces is dead
  // vocabulary that would quietly authorize a future leak under that name.
  const produced = new Set([...matches, ...weak].flatMap((match) => Object.keys(match)));
  assert.deepEqual(PUBLIC_MATCH_FIELDS.filter((field) => !produced.has(field)), []);

  // Weak matches carry the same surface minus stance, which only runs on
  // credible candidates.
  const weakKeys = new Set(weak.flatMap((match) => Object.keys(match)));
  assert.equal(weakKeys.has('alignment'), false);
  assert.equal(weakKeys.has('why'), false);
});

test('a working field with an ordinary name is stripped too', async () => {
  // The failure the allowlist exists for. `_retrieval` was caught by the
  // underscore rule; a field called `internalNotes` would not have been.
  const { publicShape } = analyzerInternals;
  const shaped = publicShape({
    canonId: 'smv:looks',
    title: 'Looks',
    score: 0.5,
    _rawScore: { secrets: true },
    internalNotes: 'never meant to ship',
    scratchpad: [1, 2, 3],
  });
  assert.deepEqual(Object.keys(shaped), ['canonId', 'title', 'score']);
});

test('the allowlist reaches the segment and the unit, not only the match', async () => {
  // v2.4.2 named what a MATCH publishes. Above it, `safeSegments` spread the
  // whole segment and set `candidates` to undefined — which leaves the key
  // present, ships whatever else retrieval hung on the segment, and publishes
  // the unit whole. Both depths are named now.
  const result = await analyzeDocument(createDemoDocument(), REAL_CANON, {});
  const segment = result.segments[0];
  assert.ok(segment, 'the demo produces at least one segment');

  assert.deepEqual(Object.keys(segment).sort(), [...PUBLIC_SEGMENT_FIELDS].sort(),
    'A segment publishes exactly the allowlisted fields, and `candidates` is not among them as a key at all.');
  assert.equal('candidates' in segment, false,
    'The working candidate set is absent, not present-and-undefined.');

  const unitKeys = Object.keys(segment.unit);
  unitKeys.forEach((key) => {
    assert.ok(PUBLIC_UNIT_FIELDS.includes(key), `Unit field "${key}" is published without being allowlisted.`);
  });
  // The fields a consumer actually depends on are still there.
  ['id', 'text', 'wordCount', 'claimLikelihood', 'isClaimLike', 'domainRelevance']
    .forEach((field) => assert.ok(unitKeys.includes(field), `Unit no longer publishes ${field}.`));
});

test('an ordinary-named working field on a unit or segment is stripped too', async () => {
  // The same failure the match allowlist exists for, one level up: a field that
  // does not start with an underscore is invisible to the backstop.
  const { publicSegment } = analyzerInternals;
  const shaped = publicSegment({
    unit: { id: 'u1', text: 'x', scratchUnitState: 'never meant to ship' },
    mapped: false,
    matches: [],
    weakMatches: [],
    ambiguity: null,
    candidates: [{ huge: true }],
    retrievalBookkeeping: 'never meant to ship',
  });
  assert.equal('retrievalBookkeeping' in shaped, false);
  assert.equal('candidates' in shaped, false);
  assert.equal('scratchUnitState' in shaped.unit, false);
  assert.deepEqual(Object.keys(shaped.unit), ['id', 'text']);
});

test('the trace names the same canon and the same input as its analysis', async () => {
  // v2.4.2 §7.4: canonSnapshotHash and inputDigest were provenance nobody could
  // check, because the analysis published nothing to check them against. It does
  // now, so a trace produced from a substituted canon or a different document is
  // detectable rather than merely comparable by eye.
  const result = await analyzeDocument(createDemoDocument(), REAL_CANON, { diagnostics: true });
  assert.ok(result.provenance.identity, 'the analysis publishes its identity');
  assert.match(result.provenance.identity.canonSnapshotHash, /^[a-z0-9]+$/);
  assert.match(result.provenance.identity.inputDigest, /^[a-z0-9]+$/);
  assert.equal(result.diagnostics.canonSnapshotHash, result.provenance.identity.canonSnapshotHash);
  assert.equal(result.diagnostics.inputDigest, result.provenance.identity.inputDigest);
  assert.equal(result.diagnostics.analysisId, result.id);

  // The digest is a function of the input, so a different document moves it
  // while the canon snapshot stays put.
  const other = await analyzeDocument(
    normalizeInput({
      text: 'Message concentration proves the same minority monopolizes relationships.',
      source: { title: 'identity fixture' },
      createdAt: '2026-07-26T12:00:00.000Z',
    }),
    REAL_CANON, { diagnostics: true },
  );
  assert.notEqual(other.provenance.identity.inputDigest, result.provenance.identity.inputDigest);
  assert.equal(other.provenance.identity.canonSnapshotHash, result.provenance.identity.canonSnapshotHash);
});

test('no analyzer working field escapes into an export', async () => {
  // The backstop for everywhere the allowlist does not reach: retrieval hangs
  // bookkeeping on objects the whole document carries, and this walks all of it.
  const result = await analyzeDocument(createDemoDocument(), REAL_CANON, { diagnostics: true });
  const leaked = new Set();
  const walk = (node) => {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== 'object') return;
    Object.entries(node).forEach(([key, value]) => {
      if (key.startsWith('_')) leaked.add(key);
      walk(value);
    });
  };
  walk(result);
  assert.deepEqual([...leaked], [], 'Internal working fields reached the analysis output.');
});

test('the diagnostic trace is opt-in, derived, and changes no analysis', async () => {
  const plain = await analyzeDocument(createDemoDocument(), REAL_CANON);
  const traced = await analyzeDocument(createDemoDocument(), REAL_CANON, { diagnostics: true });

  // Off by default, and absent rather than empty — a normal export stays
  // exactly as compact as it was.
  assert.equal('diagnostics' in plain, false);
  assert.equal(traced.diagnostics.schemaVersion, DIAGNOSTICS_SCHEMA_VERSION);

  // Derived only. Same document, same everything, whether or not anyone asked
  // to watch — so turning the trace on can never be the reason a result moved.
  const strip = (result) => JSON.stringify({ ...result, diagnostics: undefined, generatedAt: null });
  assert.equal(strip(plain), strip(traced));

  // It reports the FULL working set, not the displayed subset: that is the
  // point of it, and the reason a feedback exporter needs it at all.
  const unit = traced.diagnostics.claimUnits.find((row) => row.mapped);
  assert.ok(unit, 'The demo yields at least one mapped claim unit.');
  assert.ok(unit.candidates.length >= plain.segments
    .find((segment) => segment.unit.id === unit.segmentId).matches.length);

  const candidate = unit.candidates[0];
  ['rank', 'rankAtRetrieval', 'truncationFate', 'components', 'penalties', 'admission']
    .forEach((field) => assert.ok(candidate[field] !== undefined, `The trace carries ${field}.`));
  assert.ok(['top-ranked', 'exact-evidence', 'context-eligible']
    .includes(candidate.truncationFate.retainedBecause));
  assert.ok(['match', 'weak-match', 'not-displayed'].includes(candidate.display));
  assert.equal(candidate.admission.credible, candidate.display === 'match');

  // Every candidate the trace shows was scored by the config it names.
  assert.equal(traced.diagnostics.scoringConfigHash, SCORING_CONFIG_HASH);
});

test('concept admission guards block topical overlap and publish their decision', async () => {
  const falseDocument = normalizeInput({
    text: 'The first years of marriage are important to its success.',
    source: { title: 'Semantic-guard false-positive fixture' },
    createdAt: '2026-07-31T12:00:00.000Z',
  });
  const blocked = await analyzeDocument(falseDocument, REAL_CANON, { diagnostics: true });
  const blockedSegment = blocked.segments.find((segment) =>
    segment.unit.text.includes('first years of marriage'));
  assert.ok(blockedSegment, 'The passage remains visible after analysis.');
  assert.equal(blockedSegment.matches.some((match) =>
    match.canonId === 'statistics:stat-marriage-age'), false);

  const traceUnit = blocked.diagnostics.claimUnits.find((row) =>
    row.segmentId === blockedSegment.unit.id);
  const guardedCandidate = traceUnit.candidates.find((candidate) =>
    candidate.canonId === 'statistics:stat-marriage-age');
  assert.ok(guardedCandidate, 'The trace retains the scored candidate the guard refused.');
  assert.equal(guardedCandidate.admission.clearsCredibleScore, true,
    'This regression exercises admission, not a score that fell below threshold.');
  assert.deepEqual(guardedCandidate.admission.semanticGuard, {
    required: true,
    passed: false,
    label: 'age-at-marriage evidence',
  });
  assert.equal(guardedCandidate.admission.credible, false);

  const positiveDocument = normalizeInput({
    text: 'The median age at first marriage in the U.S. reached record highs after the postwar 1956 low.',
    source: { title: 'Semantic-guard positive control' },
    createdAt: '2026-07-31T12:00:00.000Z',
  });
  const admitted = await analyzeDocument(positiveDocument, REAL_CANON, { diagnostics: true });
  assert.ok(admitted.segments.some((segment) => segment.matches.some((match) =>
    match.canonId === 'statistics:stat-marriage-age')));
  const admittedCandidate = admitted.diagnostics.claimUnits
    .flatMap((row) => row.candidates)
    .find((candidate) => candidate.canonId === 'statistics:stat-marriage-age');
  assert.deepEqual(admittedCandidate.admission.semanticGuard, {
    required: true,
    passed: true,
    label: 'age-at-marriage evidence',
  });

  const acronymDocument = normalizeInput({
    text: 'LAT is a relationship arrangement used by committed couples.',
    source: { title: 'Lowercase normalization positive control' },
    createdAt: '2026-07-31T12:00:00.000Z',
  });
  const acronymResult = await analyzeDocument(acronymDocument, REAL_CANON);
  assert.ok(acronymResult.segments.some((segment) => segment.matches.some((match) =>
    match.canonId === 'lexicon:term-living-apart-together-lat')),
    'A lowercase-normalized LAT acronym still satisfies its concept guard.');
});

test('the scoring config is frozen, complete, and hashes stably', () => {
  assert.ok(Object.isFrozen(SCORING_CONFIG));
  // Guards the refactor contract: these values must not drift without an
  // explicit calibration pass and a config-hash change in every export.
  assert.equal(SCORING_CONFIG.minCredibleScore, 0.43);
  assert.equal(SCORING_CONFIG.minWeakScore, 0.25);
  assert.equal(SCORING_CONFIG.queryCoverageWeight, 0.56);
  assert.equal(SCORING_CONFIG.canonCoverageWeight, 0.24);
  assert.equal(SCORING_CONFIG.confidenceHigh, 0.72);
  assert.equal(SCORING_CONFIG.maxMatchesPerClaim, 4);

  // Sorted-key JSON: declaration order in source cannot move the hash.
  const shuffled = Object.fromEntries(Object.entries(SCORING_CONFIG).reverse());
  assert.equal(scoringConfigHash(shuffled), SCORING_CONFIG_HASH);
  // ...but a value change must.
  assert.notEqual(
    scoringConfigHash({ ...SCORING_CONFIG, minCredibleScore: 0.44 }),
    SCORING_CONFIG_HASH,
  );
});

/*
 * Constants that only mean what they say because a SECOND constant holds.
 *
 * The calibration audit went looking for a value that was wrong and found
 * something more useful: relationships between two literals, each sound today,
 * each stated only in a comment, and each silent if broken. `dumpFloor` against
 * the band was the first (tests/lab-threshold-neighbors.test.mjs). These are the
 * three the second pass found, and all three sit hundreds of lines from the
 * constant they depend on.
 *
 * A relationship gets an assertion here when breaking it is (a) silent, or (b)
 * reported as an unrelated symptom. Redundant belt-and-braces couplings do not:
 * `max(contextBoost) < minWeakScore - candidateScoreFloor` is true and cited in
 * md/lab-adjudication-at-scale.md, but applyBoundedContext refuses outright to
 * boost anything under minWeakScore, so the numeric margin can never be the only
 * thing standing there. Measured, reported, not pinned.
 */
test('a constant that is only sound because another constant holds says so', () => {
  const { socialMechanismFrames } = analyzerInternals;

  /*
   * 1. The cultural frame's weight against the no-participant threshold.
   *
   * Jason ruled option 1 of md/lab-gate-cultural-register.md over option 2. The
   * entire difference between them is that a culture-and-shaping passage with
   * NOBODY in the sentence stays out — and the only thing producing that is
   * weight 2.5 being unable to reach plausibleSocialStructureScore 3, since a
   * frame score is a MAX over matched definitions.
   *
   * Measured both ways on the domain benchmark: raising the weight to 3 and
   * lowering the threshold to 2 give the IDENTICAL outcome — cases the benchmark
   * says to discard go from 1 retained on this frame to 7, and junkRecall falls
   * 0.844 -> 0.781. So the suite does catch it, as a junkRecall ratchet failure
   * listing six extra cases, three hundred lines from either literal. This says
   * which two numbers to look at.
   */
  const cultural = socialMechanismFrames.find((frame) => frame.id === 'cultural-frame-mechanism');
  assert.ok(cultural, 'the cultural frame is the one Jason ruled on and must stay identifiable');
  assert.ok(cultural.weight < SCORING_CONFIG.plausibleSocialStructureScore,
    `The cultural frame's weight ${cultural.weight} has reached plausibleSocialStructureScore `
    + `${SCORING_CONFIG.plausibleSocialStructureScore}, so culture-and-shaping language now retains a `
    + 'passage with no human participant in it. That is option 2 of md/lab-gate-cultural-register.md, '
    + 'which Jason ruled against; measured, it takes benchmark cases retained on this frame from 1 to 7 '
    + 'and junkRecall from 0.844 to 0.781.');
  assert.equal(cultural.decisive, false,
    'A decisive frame retains on its own, which routes around the weight comparison above entirely.');

  /*
   * 2. minClaimWords against shortUnitWordCount.
   *
   * The short-unit penalty fires on any scored unit under shortUnitWordCount
   * words. A unit under minClaimWords words gets claimLikelihood 0 and so is
   * never claim-like — but it is still RETAINED and still SCORED, which the
   * first draft of this assertion got wrong: analyzeDocument scores every unit
   * the gate keeps, and only the ledger, the coverage denominators and the
   * research queue filter on isClaimLike.
   *
   * Measured, that distinction is worth 8 credible matches: setting the floor to
   * 4 gains 10 displayed credible matches and disabling the penalty outright
   * gains 18, and the difference is entirely sub-4-word retained passages that
   * only the exports carry.
   *
   * So the range where the penalty can touch a CLAIM is [minClaimWords,
   * shortUnitWordCount) — {4, 5} today. Raise the floor to the ceiling and every
   * reader-facing surface stops seeing the penalty while it keeps firing out of
   * sight, which is worse than switching it off.
   */
  assert.ok(SCORING_CONFIG.minClaimWords < SCORING_CONFIG.shortUnitWordCount,
    `minClaimWords ${SCORING_CONFIG.minClaimWords} has reached shortUnitWordCount `
    + `${SCORING_CONFIG.shortUnitWordCount}. No claim-like unit can be short enough for the penalty any `
    + 'more, so it vanishes from the ledger, coverage and the research queue while still firing on '
    + 'retained non-claim passages that only the exports carry.');

  /*
   * 3. minPhraseLength against minSingleAliasLength.
   *
   * A single-word alias must survive minPhraseLength to enter entry._phrases and
   * then clear minSingleAliasLength to be a hit, so the stricter floor decides
   * and the looser one is invisible. md/lab-canon-alias-pass-01.md already warns
   * "do not lower minSingleAliasLength to 4" for exactly this reason — a prose
   * warning in a document, which is where dumpFloor's rule lived too.
   *
   * Measured: the 4-character floor deletes 6 of 798 alias surfaces, and every
   * one of the 6 is under 5 characters, so it currently removes nothing that
   * minSingleAliasLength would not remove anyway.
   */
  assert.ok(SCORING_CONFIG.minPhraseLength <= SCORING_CONFIG.minSingleAliasLength,
    `minPhraseLength ${SCORING_CONFIG.minPhraseLength} is above minSingleAliasLength `
    + `${SCORING_CONFIG.minSingleAliasLength}. Single-word aliases are now filtered out before the floor `
    + 'that is supposed to decide them, so lowering minSingleAliasLength would silently change nothing.');
});

/*
 * A canon entry may reject more than one reading. Overlap used to be measured
 * against every misreading concatenated into one token set, so each misreading
 * an author added made all the others harder to detect: the passage had to cover
 * a share of a bigger set to reach misreadingContradictionShare. The canon was
 * penalised for being thorough, and a well-written entry could reject a reading
 * it could not then recognise.
 *
 * Each misreading is now scored on its own and the strongest one decides.
 */
test('each rejected reading is detected on its own, not diluted by its siblings', async () => {
  const misreadingCanon = (misreadings) => ({
    schemaVersion: 'le-canon-index/1.1',
    indexVersion: 'fixture-misreading',
    generatedAt: '2026-07-30T00:00:00.000Z',
    sourcePages: ['frameworks.html'],
    stats: { conceptCount: 1, sourceCount: 1 },
    entries: [{
      id: 'frameworks.retention-probe',
      title: 'Retention Intensity Probe',
      page: 'frameworks.html',
      anchor: 'retention-probe',
      category: 'Rules & Frameworks',
      subcategory: 'Retention & maintenance',
      synopsis: 'Mate retention behaviour is an output of satisfaction, not a measure of relationship health.',
      evidenceType: 'Framework',
      aliases: ['mate retention intensity', 'retention behaviour'],
      phrases: ['mate retention behaviour'],
      dependencies: [],
      related: [],
      boundaryConditions: [],
      commonMisreadings: misreadings,
      sourceLinks: [],
      pressureTests: [],
    }],
  });

  const target = 'More retention behaviour means a healthier relationship.';
  const document = normalizeInput({ text: `${target} Mate retention intensity is the measure people cite.` });

  const stanceFor = async (canon) => {
    const result = await analyzeDocument(document, canon);
    for (const segment of result.segments) {
      const hit = [...segment.matches, ...segment.weakMatches]
        .find((match) => match.canonId === 'frameworks.retention-probe');
      if (hit) return { stance: hit.alignment?.label, overlap: hit.alignment?.evidence?.misreadingSurfaceOverlap };
    }
    return { stance: null, overlap: null };
  };

  // Alone, this misreading is detected. That is the baseline the siblings must
  // not be able to take away.
  const alone = await stanceFor(misreadingCanon([target]));
  assert.equal(alone.stance, 'Contradicts',
    'a passage asserting the single rejected reading reads as Contradicts');

  // Two unrelated further rejections, neither of which this passage asserts.
  const withSiblings = await stanceFor(misreadingCanon([
    target,
    'Retention effort proves a partner is trustworthy and devoted to the marriage.',
    'Guarding a partner closely is evidence of a secure and contented pairing.',
  ]));
  assert.equal(withSiblings.stance, 'Contradicts',
    'adding further rejected readings must not hide the one the passage actually asserts');
  assert.ok(withSiblings.overlap >= SCORING_CONFIG.misreadingContradictionShare,
    `overlap ${withSiblings.overlap} must still clear ${SCORING_CONFIG.misreadingContradictionShare} `
    + 'when the entry rejects more than one reading');
});

test('a canon phrase inside a longer word is not a phrase hit', async () => {
  /*
   * Red until 2026-08-07 (GPT-5.6 review, finding 2): phrase comparison used
   * String.includes, so "supermarket values" contained "market value" — the
   * passage was admitted through the gate as NAMING the concept and scored the
   * exact-phrase bonus, mapping smv:overview at 0.54 with zero relationship
   * content. Both admission and scoring now demand token boundaries.
   */
  const embedded = await analyzeDocument(normalizeInput({
    text: 'The supermarket values efficiency above all else.',
    source: { title: 'Embedded phrase probe' },
  }), REAL_CANON);
  const embeddedHits = embedded.segments
    .flatMap((segment) => [...segment.matches, ...segment.weakMatches]);
  assert.equal(embeddedHits.length, 0,
    `an embedded substring produced ${embeddedHits.length} match(es): `
    + embeddedHits.map((match) => `${match.canonId}@${match.score}`).join(', '));

  // The boundary test must not cost the real hit, punctuation included.
  const bounded = await analyzeDocument(normalizeInput({
    text: 'Your market value, in this framing, decides who pursues whom in dating.',
    source: { title: 'Bounded phrase control' },
  }), REAL_CANON);
  const boundedHit = bounded.segments
    .flatMap((segment) => [...segment.matches, ...segment.weakMatches])
    .find((match) => (match.whyMatched || []).some((line) => /market value/i.test(line)));
  assert.ok(boundedHit, 'a token-bounded "market value" no longer matches anything');
});

test('the generic cue ladder reads the claim clause and its follow-up, not the whole passage', async () => {
  /*
   * Red until v2.6.20 (GPT-5.6 review, finding 4): the generic cue families
   * were tested against the whole passage, so disagreement wording in an
   * unrelated leading clause flipped a matched claim's stance —
   * frameworks:conversion-ladder went Resembles 0.731 → Challenges 0.610
   * under a prefix about the weather. The ladder now reads the assertion
   * clause plus its follow-up, the same two-clause ground as misreadingScope.
   */
  const ladderLabel = async (text) => {
    const result = await analyzeDocument(normalizeInput({
      text, source: { title: 'Stance scope probe' },
    }), REAL_CANON);
    return result.segments
      .flatMap((segment) => segment.matches)
      .find((match) => match.canonId === 'frameworks:conversion-ladder')?.alignment?.label;
  };
  const claim = 'The Conversion Ladder separates exposure, attention, attraction, and selection';
  assert.equal(await ladderLabel(`${claim}.`), 'Resembles');
  assert.equal(await ladderLabel(`The weather forecast was wrong; ${claim.toLowerCase()}.`), 'Resembles',
    'disagreement about the weather is not disagreement about the claim');
  // Comma-free claim, because clause boundaries are punctuation-approximated:
  // in the list form above, "the claim's next clause" is the list item
  // "attention", not the verdict — the same granularity every clause-scoped
  // branch already lives with.
  const compact = 'The Conversion Ladder separates exposure from attention and selection';
  assert.equal(await ladderLabel(`${compact}; that model is wrong.`), 'Challenges',
    'a verdict in the claim\'s own follow-up clause must still land');
});

test('a token the entry uses only in its own pressure test is not evidence of the misreading', async () => {
  /*
   * Red before v2.6.21 (pt09 adversarial lane, surface:
   * misreading-firing-contract). The v2.5.0 distinctive-token guard exists so
   * that a CORRECT restatement cannot read Contradicts — share alone is topic
   * evidence, so a token has to be absent from the entry's own affirmative
   * voice before it can evidence the rejected reading. That "own voice" was
   * defined as title + aliases + synopsis + boundary conditions, and left out
   * `pressureTests`, which is authored canon prose in exactly the same voice.
   *
   * Repro: "The Conversion Ladder separates exposure, attention, attraction,
   * and selection." — a faithful restatement — read lexicon:term-conversion-
   * ladder as Contradicts at 0.881. Its misreading conflates the rungs
   * ("Attention is attraction, attraction is selection, so a woman who likes
   * your photo has chosen you"); the passage does the opposite. The single
   * distinctive hit was `selection`, a word the entry's synopsis happens to
   * spell "chosen" and its own pressure test spells "selection".
   */
  const result = await analyzeDocument(normalizeInput({
    text: 'The Conversion Ladder separates exposure, attention, attraction, and selection.',
    source: { title: 'Misreading distinctive-token probe' },
  }), REAL_CANON);
  const match = result.segments
    .flatMap((segment) => segment.matches)
    .find((entry) => entry.canonId === 'lexicon:term-conversion-ladder');
  assert.ok(match, 'the lexicon Conversion Ladder entry still matches its own definition');
  assert.deepEqual(match.alignment.evidence.misreadingDistinctiveHits, [],
    '`selection` is the entry\'s own pressure-test vocabulary, not the misreading\'s');
  assert.notEqual(match.alignment.label, 'Contradicts',
    'a faithful restatement of the entry must not read as asserting the reading it rejects');
});
