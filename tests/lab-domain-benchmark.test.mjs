import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  classifyDomainRelevance,
  prepareCanonIndex,
  canonAdmissionSurfaces,
} from '../js/lab-analyzer.js';

/*
 * Frozen domain-relevance benchmark.
 * The fixture is the agreed review contract for the relevance gate: append-only
 * cases, quantitative thresholds, no per-round goalpost moves. A failure here
 * is release-blocking; a fresh adversarial paraphrase outside the fixture is a
 * candidate for an agreed append, not an ad-hoc release blocker.
 *
 * THE CANON IS PART OF THE GATE AS OF v2.6.6, AND THEREFORE PART OF THIS
 * CONTRACT. Gate option 2a admits a passage that names a distinctive canon
 * concept, so `classifyCase` loads the shipped canon and passes its surfaces —
 * a benchmark that called the gate without one would report true numbers about a
 * gate that is not the gate, which is the failure mode this file exists to
 * prevent.
 *
 * The consequence was ruled on deliberately by Jason on 2026-07-30 and is
 * recorded here because it changes this file's own policy: **canon authoring may
 * now move these thresholds.** Adding a multi-word alias to
 * `data/canon-overlay.json` widens gate scope, so it is a gate change, and this
 * benchmark is re-run on every canon change — not only on classifier changes.
 * The standing rule that a benchmark APPEND lands in a commit touching no
 * classifier code is unchanged; what changed is that a canon commit is now a
 * commit this benchmark can fail on. See md/lab-gate-option2.md.
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const benchmark = JSON.parse(readFileSync(
  new URL('./fixtures/domain-relevance-benchmark.json', import.meta.url),
  'utf8',
));

const canonIndex = JSON.parse(readFileSync(path.join(ROOT_DIR, 'data', 'le-canon-index.json'), 'utf8'));
const CANON_SURFACES = canonAdmissionSurfaces(prepareCanonIndex(canonIndex));

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
  }], new Map(), CANON_SURFACES);
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

/*
 * The one thing that would make every number in this file a lie.
 *
 * `classifyCase` takes a third argument the gate treats as optional. If a future
 * edit drops it — refactoring the call, adding a parameter before it, copying the
 * helper into a new test — this benchmark keeps passing while measuring a gate
 * the product does not ship, and it would keep passing for as long as nobody
 * looked. `md/lab-gate-option2.md` refused to ship option 2 behind an optional
 * argument for exactly this reason; the argument is still optional in the
 * signature, so the contract lives here instead.
 *
 * The passage below is retained ONLY by canon-anchored admission: no participant
 * noun, no relational outcome, no decisive mechanism. Authored, not corpus text.
 */
test('the benchmark measures the gate that ships, canon included', () => {
  assert.ok(CANON_SURFACES.size > 100,
    `only ${CANON_SURFACES.size} distinctive canon surfaces — the canon failed to load, and every `
    + 'threshold below is being measured against a gate with no doctrine in it');

  const canonOnly = 'Put simply, the feminine imperative will not allow this.';
  const bare = classifyDomainRelevance([{
    id: 'canon-contract-bare',
    parentSegmentId: 'canon-contract',
    segmentIndex: 0,
    text: canonOnly,
    wordCount: 9,
    isClaimLike: true,
    boundedContext: null,
  }])[0];
  assert.equal(bare.domainRelevance.status, 'irrelevant',
    'the control case stopped being canon-only — pick another passage that no frame retains, or '
    + 'this test proves nothing');

  const shipped = classifyCase({ id: 'canon-contract-shipped', text: canonOnly });
  assert.equal(shipped.verdict, 'retain',
    'classifyCase is no longer passing the canon to the gate. Every metric in this file is now a '
    + 'true statement about a gate that is not the shipped gate. Restore the third argument.');
  assert.equal(shipped.reasonCode, 'named-canon-concept');
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
