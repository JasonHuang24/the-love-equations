import test from 'node:test';
import assert from 'node:assert/strict';

import {
  analysisToJson,
  analysisToMarkdown,
  researchQueueToJson,
  researchQueueToMarkdown,
} from '../js/lab-export.js';

const TIMES_MS = [1_000, 62_000, 3_723_045];
const LABELS = ['0:01', '1:02', '1:02:03'];

function fixture() {
  const segments = TIMES_MS.map((startTime, index) => ({
    mapped: true,
    unit: {
      id: `seg-map-${index + 1}`,
      speaker: 'Host',
      startTime,
      text: `Mapped passage ${index + 1}.`,
    },
    matches: [{
      alignment: { label: 'Supports' },
      confidence: 'Strong',
      score: 0.91,
      title: 'The Conversion Ladder',
      href: 'frameworks.html#conversion-ladder',
      why: 'The passage distinguishes adjacent dating stages.',
      whyMatched: ['Exact phrase: attraction is not selection'],
    }],
  }));
  const items = TIMES_MS.map((startTime, index) => ({
    id: `rq-${index + 1}`,
    segmentId: `seg-rq-${index + 1}`,
    location: { speaker: 'Guest', startTime },
    excerpt: `Research candidate ${index + 1}.`,
    whyUnmapped: 'No canon entry shared enough distinctive language.',
    nearestConcepts: [],
    suggestedDestination: 'Deep Dive',
    empiricalQuestion: 'Does the proposed effect survive preregistered testing?',
    suggestedSearchTerms: ['longitudinal study'],
    falsifier: 'A well-powered study finds no association.',
    riskFlags: ['causal claim'],
  }));
  return {
    schemaVersion: 'le-lab.analysis/1.0',
    id: 'lea-export-fixture',
    generatedAt: '2026-07-26T12:00:00.000Z',
    analysisMode: { id: 'deterministic-local', label: 'Deterministic local' },
    source: { title: 'Export fixture', type: 'subtitle', extractionWarnings: [] },
    canonIndex: { version: 'fixture-1', conceptCount: 4, sourceCount: 2 },
    metrics: {
      totalWords: 42,
      sourceSegments: 6,
      claimLikeSegments: 6,
      mappedClaimSegments: 3,
      unmappedClaimSegments: 3,
    },
    coverage: { mappedClaimSegmentSharePct: 50, mappedClaimWordSharePct: 52.5 },
    strongestMatches: [],
    segments,
    pressureTests: [],
    researchQueue: { itemCount: items.length, items },
    limitations: ['Fixture results are illustrative.'],
  };
}

test('mapped passage export formats numeric timestamps as milliseconds', () => {
  const markdown = analysisToMarkdown(fixture());
  LABELS.forEach((label, index) => {
    assert.match(markdown, new RegExp(`Host · ${label} · seg-map-${index + 1}`));
  });
  assert.match(markdown, /> Mapped passage 1\./);
  assert.match(markdown, /\*\*Mapped share of claim-like segments:\*\* 50%/);
});

test('research queue export formats numeric timestamps as milliseconds', () => {
  const markdown = researchQueueToMarkdown(fixture());
  LABELS.forEach((label, index) => {
    assert.match(markdown, new RegExp(`Guest · ${label} · seg-rq-${index + 1}`));
  });
  assert.match(markdown, /> Research candidate 3\./);
});

test('string timestamps are preserved verbatim in both Markdown exports', () => {
  const result = fixture();
  result.segments[0].unit.startTime = '00:01.250';
  result.researchQueue.items[0].location.startTime = 'cue 00:01.250';
  assert.match(analysisToMarkdown(result), /Host · 00:01\.250 · seg-map-1/);
  assert.match(researchQueueToMarkdown(result), /Guest · cue 00:01\.250 · seg-rq-1/);
});

test('structured exports retain mapped passages and the research queue', () => {
  const result = fixture();
  const analysis = JSON.parse(analysisToJson(result));
  const queue = JSON.parse(researchQueueToJson(result));
  assert.equal(analysis.segments[0].unit.text, 'Mapped passage 1.');
  assert.equal(analysis.segments[2].unit.startTime, 3_723_045);
  assert.equal(queue.schemaVersion, 'le-lab.research-queue/1.0');
  assert.deepEqual(queue.queue.items.map((item) => item.location.startTime), TIMES_MS);
  assert.equal(queue.queue.items[2].excerpt, 'Research candidate 3.');
});