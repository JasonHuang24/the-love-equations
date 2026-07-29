import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  analyzeDocument,
  classifyDomainRelevance,
  detectClaimUnits,
} from '../js/lab-analyzer.js';
import { normalizeInput } from '../js/lab-intake.js';
import { REVIEW_DISPOSITIONS } from '../js/lab-feedback.js';

/*
 * Frozen canon-mapping benchmark — the validator for
 * tests/fixtures/canon-mapping-benchmark.json and the runner for whatever it
 * holds.
 *
 * Third sibling of the domain-relevance and match-behavior benchmarks, and the
 * destination for adjudicated reviewer flags about retrieval, ranking,
 * admission, and alignment. It is created empty on purpose: cases arrive from
 * md/FEEDBACK-PIPELINE.md by human commit, one adjudication at a time.
 *
 * The structural half of this file runs whether or not there are cases, so the
 * receptacle cannot rot while it waits. Every rule below exists to stop a case
 * being added in a state where it would pass without testing anything.
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const benchmark = JSON.parse(readFileSync(
  new URL('./fixtures/canon-mapping-benchmark.json', import.meta.url),
  'utf8',
));
const canonIndex = JSON.parse(readFileSync(path.join(ROOT_DIR, 'data', 'le-canon-index.json'), 'utf8'));
const canonIds = new Set(canonIndex.entries.map((entry) => entry.id));

const STANCE_LABELS = new Set(['Resembles', 'Supports', 'Challenges', 'Contradicts', 'Extends', 'Context only']);
const DISPOSITION_IDS = new Set(REVIEW_DISPOSITIONS.map((disposition) => disposition.id));
const ASSERTABLE = [
  'mapped', 'primaryCanonId', 'presentCanonIds', 'absentCanonIds', 'alignment', 'weakPresentCanonIds',
];

function documentFor(text) {
  return normalizeInput({
    text,
    format: 'auto',
    source: { title: 'canon-mapping fixture', type: 'fixture-file', url: null },
    extraction: { method: 'fixture', warnings: [] },
    createdAt: '1970-01-01T00:00:00.000Z',
  });
}

async function analyzeCase(text) {
  const documentValue = documentFor(text);
  const [unit] = classifyDomainRelevance(detectClaimUnits(documentValue));
  if (unit?.domainRelevance.status === 'irrelevant') {
    return { gatedOut: true, reasonCode: unit.domainRelevance.reasonCode, matches: [], weakMatches: [] };
  }
  const result = await analyzeDocument(documentValue, canonIndex, {});
  const segment = result.segments.find((row) => row.unit.id === unit?.id) || result.segments[0];
  return {
    gatedOut: false,
    reasonCode: unit?.domainRelevance.reasonCode,
    matches: segment?.matches || [],
    weakMatches: segment?.weakMatches || [],
  };
}

test('the canon-mapping benchmark declares its contract and its freeze point', () => {
  assert.equal(benchmark.schema, 'le-canon-mapping-benchmark/1.0');
  assert.ok(benchmark.contract?.includes('Append-only'), 'the append-only contract is stated in the file');
  assert.ok(benchmark.scope, 'the file says which layers it owns');
  assert.ok(benchmark.frozenAgainst?.analyzer, 'the analyzer it was created against');
  assert.ok(benchmark.frozenAgainst?.canonIndex, 'the canon snapshot it was created against');
  assert.ok(benchmark.frozenAgainst?.scoringConfigHash, 'the threshold set it was created against');
  assert.ok(Array.isArray(benchmark.cases), 'cases is an array, empty or not');
});

test('every case is uniquely identified, sourced, and actually asserts something', () => {
  const ids = new Set();
  const texts = new Set();
  benchmark.cases.forEach((entry) => {
    assert.ok(entry.id && !ids.has(entry.id), `case ID ${entry.id} is unique`);
    ids.add(entry.id);

    assert.ok(typeof entry.text === 'string' && entry.text.trim().length >= 20,
      `${entry.id} has substantive text`);
    const normalized = entry.text.replace(/\s+/g, ' ').trim().toLowerCase();
    assert.ok(!texts.has(normalized), `${entry.id} is not a duplicate of an existing case`);
    texts.add(normalized);

    // Origin is what makes a case reviewable a year from now: which flag, which
    // disposition, who decided, and when.
    assert.ok(entry.origin, `${entry.id} records where it came from`);
    assert.ok(DISPOSITION_IDS.has(entry.origin.reviewDisposition),
      `${entry.id} names a real reviewDisposition`);
    assert.ok(entry.origin.adjudicatedOn && entry.origin.adjudicatedBy,
      `${entry.id} records who adjudicated it and when`);

    assert.ok(entry.observedAtFreeze,
      `${entry.id} records what the shipped analyzer did when the case was written down`);

    const asserted = ASSERTABLE.filter((key) => entry.expected?.[key] !== undefined);
    assert.ok(asserted.length > 0,
      `${entry.id} asserts at least one expectation; a case that asserts nothing passes forever`);
  });
});

test('every canon ID a case names still exists in the shipped index', () => {
  // A case that points at a deleted entry is not a failing test, it is a broken
  // one — and it must be visible as such the moment the canon moves.
  benchmark.cases.forEach((entry) => {
    const referenced = [
      entry.expected?.primaryCanonId,
      ...(entry.expected?.presentCanonIds || []),
      ...(entry.expected?.absentCanonIds || []),
      ...(entry.expected?.weakPresentCanonIds || []),
      entry.expected?.alignment?.canonId,
    ].filter(Boolean);
    referenced.forEach((canonId) => {
      assert.ok(canonIds.has(canonId), `${entry.id} names canon entry ${canonId}, which the index no longer has`);
    });
    if (entry.expected?.alignment) {
      assert.ok(STANCE_LABELS.has(entry.expected.alignment.label),
        `${entry.id} expects a real alignment label`);
      assert.ok(entry.expected.alignment.canonId,
        `${entry.id} says which match must carry that alignment`);
    }
  });
});

test('the analyzer maps every adjudicated case the way the adjudication says', async () => {
  const failures = [];
  for (const entry of benchmark.cases) {
    const { matches, weakMatches, gatedOut, reasonCode } = await analyzeCase(entry.text);
    const matchIds = matches.map((match) => match.canonId);
    const weakIds = weakMatches.map((match) => match.canonId);
    const where = `  [${entry.id}]${gatedOut ? ` (gated out: ${reasonCode})` : ''}`;

    if (entry.expected.mapped !== undefined && Boolean(matches.length) !== entry.expected.mapped) {
      failures.push(`${where} expected mapped=${entry.expected.mapped}, got ${Boolean(matches.length)} — ${entry.text}`);
    }
    if (entry.expected.primaryCanonId && matchIds[0] !== entry.expected.primaryCanonId) {
      failures.push(`${where} expected primary ${entry.expected.primaryCanonId}, got ${matchIds[0] || '(none)'}`);
    }
    (entry.expected.presentCanonIds || []).forEach((canonId) => {
      if (!matchIds.includes(canonId)) failures.push(`${where} ${canonId} is absent from the credible matches`);
    });
    (entry.expected.absentCanonIds || []).forEach((canonId) => {
      if (matchIds.includes(canonId)) failures.push(`${where} ${canonId} matched credibly and should not have`);
    });
    (entry.expected.weakPresentCanonIds || []).forEach((canonId) => {
      if (!weakIds.includes(canonId) && !matchIds.includes(canonId)) {
        failures.push(`${where} ${canonId} was not retained even as a weak match`);
      }
    });
    if (entry.expected.alignment) {
      const match = matches.find((row) => row.canonId === entry.expected.alignment.canonId);
      const label = match?.alignment?.label;
      if (label !== entry.expected.alignment.label) {
        failures.push(`${where} expected ${entry.expected.alignment.canonId} to read ${entry.expected.alignment.label}, got ${label || '(not matched)'}`);
      }
    }
  }
  assert.equal(failures.length, 0,
    `${failures.length} adjudicated mapping case(s) disagree with the analyzer:\n${failures.join('\n')}`);
});
