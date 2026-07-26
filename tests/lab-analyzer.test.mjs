import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { normalizeInput } from '../js/lab-intake.js';
import { createDemoDocument } from '../js/lab-demo.js';
import {
  ANALYSIS_SCHEMA_VERSION,
  analyzeDocument,
  detectClaimUnits,
  prepareCanonIndex,
} from '../js/lab-analyzer.js';
import {
  analysisToJson,
  analysisToMarkdown,
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
  assert.ok(result.coverage.mappedClaimSegmentSharePct > 50);
  assert.ok(result.coverage.mappedClaimSegmentSharePct < 95);
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
  assert.match(markdown, /Coverage percentages describe this document/);
  assert.match(markdown, /&lt;img/);
  assert.doesNotMatch(markdown, /<script>/);
  assert.match(queueMarkdown, /Research candidates/);
  assert.equal(json.schemaVersion, ANALYSIS_SCHEMA_VERSION);
  assert.equal(json.source.url, 'https://example.com/source');
  assert.ok(Array.isArray(json.limitations));
});
