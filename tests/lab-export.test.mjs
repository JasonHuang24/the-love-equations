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
    schemaVersion: 'le-lab.analysis/2.0',
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
    researchQueue: { schemaVersion: 'le-lab.research-queue/2.0', itemCount: items.length, items },
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
  assert.match(markdown, /\*\*Schema:\*\* `le-lab\.research-queue\/2\.0`/);
});

test('research queue Markdown exports unmatched triage while old queue items still render', () => {
  const result = fixture();
  result.researchQueue.schemaVersion = 'le-lab.research-queue/2.3';
  result.researchQueue.items[0].unmatchedTriage = {
    schemaVersion: 'le-lab.unmatched-triage/1.2.0',
    primaryUmbrella: {
      id: 'institutional-authority-governance',
      label: 'Institutional authority and governance',
    },
    secondaryUmbrella: {
      id: 'brief-nonrelationship-interactions',
      label: 'Brief or nonrelationship interactions',
    },
    confidence: 0.86,
    confidenceLabel: 'High',
    abstained: false,
    matchedSignals: ['organizational or policy setting', 'evaluative or supervisory authority'],
    rationale: 'Organizational authority and recusal language identify this territory.',
    unmatchedReason: {
      id: 'boundary-moderator-directional-evidence',
      label: 'Boundary, moderator, or directional evidence',
    },
    doctrineStatus: 'Explanatory triage only — not doctrine coverage or a doctrine match',
  };

  const markdown = researchQueueToMarkdown(result);
  assert.match(markdown, /Unmatched — Institutional authority and governance/);
  assert.match(markdown, /Why this umbrella:.*Organizational authority/);
  assert.match(markdown, /Unmatched reason:.*Boundary, moderator, or directional evidence/);
  assert.match(markdown, /Secondary umbrella:.*Brief or nonrelationship interactions/);
  assert.match(markdown, /Nearest LE concepts by wording \(nonmatches\)/);
  assert.match(markdown, /not doctrine coverage or a doctrine match/);
  assert.match(markdown, /RQ 2 · Deep Dive/, 'legacy queue items keep their old heading');

  const structured = JSON.parse(researchQueueToJson(result));
  assert.equal(
    structured.queue.items[0].unmatchedTriage.primaryUmbrella.id,
    'institutional-authority-governance',
  );
});

test('excerpt Markdown preserves exact whitespace while safely encoding entities', () => {
  const result = fixture();
  const exact = 'First  clause.\nSecond\tclause.\n\n  <tag> & > tail  ';
  result.researchQueue.items[0].excerpt = exact;

  const markdown = researchQueueToMarkdown(result);
  const marker = '> First  clause.\n> Second\tclause.\n>\n>   &lt;tag&gt; &amp; &gt; tail  ';
  assert.ok(markdown.includes(marker), markdown);

  const encodedBlock = markdown.slice(markdown.indexOf('> First  clause.'),
    markdown.indexOf('\n\n- **Location:**', markdown.indexOf('> First  clause.')));
  const reconstructed = encodedBlock
    .split('\n')
    .map((line) => line.replace(/^> ?/, ''))
    .join('\n')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
  assert.equal(reconstructed, exact);

  const json = JSON.parse(researchQueueToJson(result));
  assert.equal(json.queue.items[0].excerpt, exact, 'JSON fragment remains byte-exact');
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
  assert.equal(queue.schemaVersion, 'le-lab.research-queue/2.0');
  assert.deepEqual(queue.queue.items.map((item) => item.location.startTime), TIMES_MS);
  assert.equal(queue.queue.items[2].excerpt, 'Research candidate 3.');
});

test('malformed provenance is omitted from every export surface', () => {
  const result = fixture();
  result.source.url = 'not a URL';

  const analysisMarkdown = analysisToMarkdown(result);
  const researchMarkdown = researchQueueToMarkdown(result);
  const analysis = JSON.parse(analysisToJson(result));
  const queue = JSON.parse(researchQueueToJson(result));

  assert.doesNotMatch(analysisMarkdown, /not a URL/);
  assert.doesNotMatch(researchMarkdown, /not a URL/);
  assert.equal('url' in analysis.source, false);
  assert.equal('url' in queue.source, false);
});

test('valid transcript provenance remains present in Markdown and JSON exports', () => {
  const result = fixture();
  result.source.url = 'https://youtu.be/example';

  assert.match(analysisToMarkdown(result), /https:\/\/youtu\.be\/example/);
  assert.equal(JSON.parse(analysisToJson(result)).source.url, 'https://youtu.be/example');
  assert.equal(
    JSON.parse(researchQueueToJson(result)).source.url,
    'https://youtu.be/example'
  );
});

test('zero-denominator exports represent coverage as unavailable', () => {
  const result = fixture();
  result.metrics.claimLikeSegments = 0;
  result.metrics.mappedClaimSegments = 0;
  result.metrics.unmappedClaimSegments = 0;
  result.metrics.ignoredDomainSegments = 3;
  result.metrics.ignoredDomainWords = 15;
  result.coverage.mappedClaimSegmentSharePct = null;
  result.coverage.unmappedClaimSegmentSharePct = null;
  result.coverage.mappedClaimWordSharePct = null;
  result.segments = [];
  result.researchQueue = {
    schemaVersion: 'le-lab.research-queue/2.0',
    itemCount: 0,
    items: [],
  };

  assert.match(analysisToMarkdown(result), /Mapped share of claim-like segments:\*\* Not applicable/);
  assert.equal(JSON.parse(analysisToJson(result)).coverage.mappedClaimSegmentSharePct, null);
  assert.equal(JSON.parse(researchQueueToJson(result)).schemaVersion, 'le-lab.research-queue/2.0');
  assert.match(researchQueueToMarkdown(result),
    /\*\*Schema:\*\* `le-lab\.research-queue\/2\.0`/);
});

test('research queue Markdown reads its schema from the queue object', () => {
  const result = fixture();
  result.researchQueue.schemaVersion = 'le-lab.research-queue/test-version';
  assert.match(researchQueueToMarkdown(result),
    /\*\*Schema:\*\* `le-lab\.research-queue\/test-version`/);

  result.researchQueue.items = [];
  result.researchQueue.itemCount = 0;
  assert.match(researchQueueToMarkdown(result),
    /\*\*Schema:\*\* `le-lab\.research-queue\/test-version`/);
});
