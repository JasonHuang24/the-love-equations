import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { classifyDomainRelevance } from '../js/lab-analyzer.js';

/*
 * Frozen domain-relevance benchmark.
 * The fixture is the agreed review contract for the relevance gate: append-only
 * cases, quantitative thresholds, no per-round goalpost moves. A failure here
 * is release-blocking; a fresh adversarial paraphrase outside the fixture is a
 * candidate for an agreed append, not an ad-hoc release blocker.
 */

const benchmark = JSON.parse(readFileSync(
  new URL('./fixtures/domain-relevance-benchmark.json', import.meta.url),
  'utf8',
));

const VALID_EXPECTED = ['retain', 'ignore'];
const VALID_FAMILIES = ['direct-domain', 'indirect-mechanism', 'polysemous-trap', 'plain-junk'];

function classifyCase(entry) {
  const [unit] = classifyDomainRelevance([{
    id: entry.id,
    parentSegmentId: `bench-${entry.id}`,
    segmentIndex: 0,
    text: entry.text,
    wordCount: entry.text.trim().split(/\s+/).length,
    isClaimLike: true,
    boundedContext: null,
  }]);
  return {
    verdict: unit.domainRelevance.status === 'irrelevant' ? 'ignore' : 'retain',
    status: unit.domainRelevance.status,
    reasonCode: unit.domainRelevance.reasonCode,
  };
}

test('benchmark fixture is structurally sound', () => {
  assert.equal(benchmark.schema, 'le-lab.domain-benchmark/1.0');
  assert.ok(Array.isArray(benchmark.cases) && benchmark.cases.length >= 120,
    'The frozen benchmark holds at least 120 cases.');
  const ids = new Set();
  benchmark.cases.forEach((entry) => {
    assert.ok(entry.id && !ids.has(entry.id), `Case ID ${entry.id} is unique.`);
    ids.add(entry.id);
    assert.ok(VALID_EXPECTED.includes(entry.expected), `${entry.id} has a valid expected label.`);
    assert.ok(VALID_FAMILIES.includes(entry.family), `${entry.id} has a valid family.`);
    assert.ok(typeof entry.text === 'string' && entry.text.trim().length >= 20,
      `${entry.id} has substantive text.`);
  });
  ['domainRecall', 'ignorePrecision', 'junkRecall'].forEach((metric) => {
    const threshold = benchmark.thresholds?.[metric];
    assert.ok(threshold && threshold.minimum > 0 && threshold.minimum <= 1,
      `Threshold ${metric} is declared in the fixture.`);
  });
});

test('relevance gate meets the frozen benchmark thresholds', () => {
  const results = benchmark.cases.map((entry) => ({ ...entry, ...classifyCase(entry) }));

  const expectedRetain = results.filter((row) => row.expected === 'retain');
  const expectedIgnore = results.filter((row) => row.expected === 'ignore');
  const ignoredAll = results.filter((row) => row.verdict === 'ignore');

  const domainRecall = expectedRetain.filter((row) => row.verdict === 'retain').length
    / expectedRetain.length;
  const ignorePrecision = ignoredAll.length
    ? ignoredAll.filter((row) => row.expected === 'ignore').length / ignoredAll.length
    : 1;
  const junkRecall = expectedIgnore.filter((row) => row.verdict === 'ignore').length
    / expectedIgnore.length;

  const failures = results.filter((row) => row.verdict !== row.expected);
  const detail = failures
    .map((row) => `  [${row.id}] expected=${row.expected} got=${row.verdict} (${row.status} · ${row.reasonCode}) — ${row.text}`)
    .join('\n');

  assert.ok(domainRecall >= benchmark.thresholds.domainRecall.minimum,
    `domainRecall ${domainRecall.toFixed(4)} >= ${benchmark.thresholds.domainRecall.minimum} (real relationship claims must not be silently lost)\n${detail}`);
  assert.ok(ignorePrecision >= benchmark.thresholds.ignorePrecision.minimum,
    `ignorePrecision ${ignorePrecision.toFixed(4)} >= ${benchmark.thresholds.ignorePrecision.minimum} (what the gate bins must genuinely be non-domain)\n${detail}`);
  assert.ok(junkRecall >= benchmark.thresholds.junkRecall.minimum,
    `junkRecall ${junkRecall.toFixed(4)} >= ${benchmark.thresholds.junkRecall.minimum} (ratchet: may only be raised)\n${detail}`);

  // Safety property, independent of ratios: every miss on expected-ignore
  // cases must fail open (retained and visible), never silently. This is the
  // core contract of triage-not-verdict.
  failures
    .filter((row) => row.expected === 'ignore')
    .forEach((row) => {
      assert.ok(['relevant', 'uncertain'].includes(row.status),
        `${row.id}: a junk miss must be a visible fail-open retention.`);
    });

  console.log(`benchmark: ${results.length} cases · domainRecall ${domainRecall.toFixed(3)} · ignorePrecision ${ignorePrecision.toFixed(3)} · junkRecall ${junkRecall.toFixed(3)} · ${failures.length} known misses (all fail-open)`);
});

test('named reviewer false-negative cases stay retained', () => {
  // The prior review rounds' false negatives are the silent-data-loss cases;
  // losing one again is an unconditional regression. Named false POSITIVES are
  // governed by the threshold metrics instead: a trap that stays retained is a
  // visible fail-open miss, not a silent one, and must not become a per-case
  // release blocker again.
  const named = benchmark.cases.filter(
    (entry) => entry.note?.includes('reviewer') && entry.expected === 'retain',
  );
  assert.ok(named.length >= 2, 'The named reviewer false-negative cases stay in the fixture.');
  named.forEach((entry) => {
    const { verdict, status } = classifyCase(entry);
    assert.equal(verdict, 'retain',
      `${entry.id} (${entry.note}) must stay retained, got ${status}: ${entry.text}`);
  });
});
