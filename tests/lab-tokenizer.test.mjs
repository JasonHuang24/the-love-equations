import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  prepareCanonIndex,
  detectClaimUnits,
  classifyDomainRelevance,
  analyzerInternals,
  tokenize,
  SCORING_CONFIG,
} from '../js/lab-analyzer.js';
import { normalizeInput } from '../js/lab-intake.js';

/*
 * Frozen tokenizer benchmark.
 *
 * Third sibling of the domain and match-behavior benchmarks, and the same
 * contract: append-only cases, no per-round goalpost moves, and every case
 * carries what the shipped analyzer did when the case was written down.
 *
 * This one measures the layer under both of the others. The domain benchmark
 * asks what reaches the matcher and the match-behavior benchmark asks what the
 * matcher does with it; this asks whether the words those two are reasoning
 * about are words at all. v2.5.0 §1.4 found a two-character fragment vouching
 * for a provisioning claim and fixed it locally, inside co-fire, with a note
 * saying the general fix belonged to a pass willing to move scores. This is
 * that pass, and these are its RED fixtures.
 *
 * The four blocks fail for one reason and are fixed by one change — which is
 * itself the finding. `distinctiveBoost` was never the only consumer.
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const benchmark = JSON.parse(readFileSync(
  new URL('./fixtures/tokenizer-benchmark.json', import.meta.url),
  'utf8',
));
const canonIndex = JSON.parse(readFileSync(path.join(ROOT_DIR, 'data', 'le-canon-index.json'), 'utf8'));
const prepared = prepareCanonIndex(canonIndex);

function documentFor(text) {
  return normalizeInput({
    text,
    format: 'auto',
    source: { title: 'tokenizer fixture', type: 'fixture-file', url: null },
    extraction: { method: 'fixture', warnings: [] },
    createdAt: '1970-01-01T00:00:00.000Z',
  });
}

function unitFor(text) {
  const [unit] = classifyDomainRelevance(detectClaimUnits(documentFor(text)));
  assert.ok(unit, `Fixture text produced no claim unit: ${text}`);
  return unit;
}

function scoreAgainst(text, canonId) {
  const entry = prepared.entries.find((row) => row.id === canonId);
  assert.ok(entry, `Fixture names a canon entry that does not exist: ${canonId}`);
  return analyzerInternals.scoreEntry(unitFor(text), entry, prepared.idf);
}

/** Every raw word the canon offers the tokenizer, before any of it is filtered. */
function canonRawTokens() {
  const seen = new Map();
  for (const entry of prepared.entries) {
    const lexical = [
      entry.title, entry.synopsis, entry.category, entry.subcategory,
      ...entry.aliases, ...entry.boundaryConditions, ...entry.commonMisreadings,
    ].join(' ');
    const normalized = analyzerInternals.normalizeText(lexical);
    const raw = normalized.match(/[\p{L}\p{N}]+(?:'[\p{L}]+)?/gu) || [];
    for (const word of raw) {
      const original = word.replace(/^'|'$/g, '');
      if (!original || seen.has(original)) continue;
      seen.set(original, entry.id);
    }
  }
  return seen;
}

test('tokenizer fixture is structurally sound', () => {
  assert.equal(benchmark.schema, 'le-lab.tokenizer/1.0');
  const ids = new Set();
  const blocks = Object.entries(benchmark.blocks);
  assert.equal(blocks.length, 4, 'The fixture holds the four adjudicated blocks.');
  blocks.forEach(([name, block]) => {
    assert.ok(block.question && block.ruling, `${name} states its question and its ruling.`);
    (block.cases || []).forEach((entry) => {
      assert.ok(entry.id && !ids.has(entry.id), `Case ID ${entry.id} is unique.`);
      ids.add(entry.id);
      assert.ok(entry.observedAtFreeze, `${entry.id} records what the shipped analyzer did at freeze time.`);
    });
  });
  const degeneracy = benchmark.blocks.degeneracy.cases;
  assert.ok(degeneracy.some((entry) => entry.polarity === 'degenerate'));
  assert.ok(
    degeneracy.filter((entry) => entry.polarity === 'control').length >= 10,
    'The controls the fix must not break outnumber a token gesture at them.',
  );
});

test('stemming never produces a fragment shorter than the concept', () => {
  const failures = [];
  for (const entry of benchmark.blocks.degeneracy.cases) {
    const observed = tokenize(entry.word);
    try {
      assert.deepEqual(observed, entry.expected);
    } catch {
      failures.push(
        `  [${entry.id}] ${entry.polarity}: "${entry.word}" -> ${JSON.stringify(observed)}, `
        + `expected ${JSON.stringify(entry.expected)}`,
      );
    }
  }
  assert.equal(failures.length, 0,
    `${failures.length} token(s) do not survive stemming as themselves:\n${failures.join('\n')}`);
});

test('an s-final singular shares a stem with its regular plural', () => {
  /*
   * Red until v2.6.19 (GPT-5.6 review, finding 3): the bare-`s` strip fired
   * after `u` and `s`, so `status` became `statu` while `statuses` became
   * `status` — a singular incompatible with its own regular plural, for every
   * -us/-ss noun and every -ss verb. The final `s` of those words is spelling,
   * not inflection.
   */
  for (const [singular, plural] of [
    ['status', 'statuses'],
    ['focus', 'focuses'],
    ['process', 'processes'],
    ['discuss', 'discusses'],
    ['success', 'successes'],
  ]) {
    assert.deepEqual(tokenize(singular), tokenize(plural),
      `"${singular}" and "${plural}" must share a stem`);
  }
  // The floor-protected families the fix must not disturb.
  assert.deepEqual(tokenize('users'), ['users'], 'users stays floor-protected');
  assert.deepEqual(tokenize('boss bosses'), ['boss', 'boss'], 'boss/bosses unify');
});

test('a valid three-character stem keeps its whole inflection family', () => {
  for (const family of benchmark.blocks.degeneracy.families) {
    for (const member of family.members) {
      assert.deepEqual(tokenize(member), [family.stem],
        `[${family.id}] "${member}" must still stem to "${family.stem}" — a length floor that `
        + 'breaks working families has been set too high.');
    }
  }
});

test('a degenerate stem moves four scoring mechanisms, not one', () => {
  const block = benchmark.blocks.componentIsolation;
  const [withIntensifier, control] = block.cases;
  const a = scoreAgainst(withIntensifier.text, block.canonId);
  const b = scoreAgainst(control.text, block.canonId);

  // The whole claim of this block: once the intensifier stops being a concept,
  // the two sentences ARE the same sentence to the matcher.
  assert.equal(a.score, b.score,
    `The only difference between these two sentences is "${withIntensifier.wrapper}" and `
    + `"${control.wrapper}". Both are intensifiers and neither is a concept, so the scores must `
    + `agree — they are ${a.score} and ${b.score}.`);
  assert.deepEqual(a.sharedTokens, block.expected.sharedTokens);
  assert.deepEqual(b.sharedTokens, block.expected.sharedTokens);

  // Each of the four mechanisms separately, so a partial fix cannot pass.
  assert.equal(a.queryCoverage, b.queryCoverage, 'queryCoverage still differs.');
  assert.equal(a.canonCoverage, b.canonCoverage, 'canonCoverage still differs.');
  assert.equal(a.components.distinctiveBoost, b.components.distinctiveBoost,
    'distinctiveBoost still differs — and it was never the only consumer.');
  const codes = (raw) => raw.penalties.map((penalty) => penalty.code);
  assert.deepEqual(codes(a), codes(b), 'The sparse-shared penalty still applies to only one of them.');
  assert.ok(codes(b).includes('sparse-shared-tokens'),
    'One genuinely shared token is a sparse match and must still be penalised as one.');
});

test('no shortened fragment enters the canon index', () => {
  const violations = [];
  for (const [original, firstEntry] of canonRawTokens()) {
    const [accepted] = tokenize(original);
    if (!accepted) continue;
    if (accepted === original) continue;
    if (accepted.length >= 3) continue;
    violations.push(`  "${original}" -> "${accepted}" (${accepted.length} chars, first seen in ${firstEntry})`);
  }
  assert.equal(violations.length, benchmark.blocks.indexProvenance.expected.violatingRawTokens,
    `${violations.length} canon word(s) are represented in the index by a fragment shorter than `
    + `three characters. Document frequency, IDF, every coverage ratio, the distinctive boost, `
    + `match surfaces, misreading overlap, co-fire evidence, context continuity and research search `
    + `terms all read these sets:\n${violations.sort().join('\n')}`);
});

test('the collision dies and the concepts do not', () => {
  const failures = [];
  for (const entry of benchmark.blocks.retrievalGuards.cases) {
    const raw = scoreAgainst(entry.text, entry.canonId);
    const expected = entry.expected;
    const shared = new Set(raw.sharedTokens);

    if (expected.sharedExcludes && shared.has(expected.sharedExcludes)) {
      failures.push(
        `  [${entry.id}] "${expected.sharedExcludes}" is still a shared token with ${entry.canonId} `
        + `(score ${raw.score}, shared ${JSON.stringify(raw.sharedTokens)})`,
      );
    }
    if (expected.sharedIncludes && !shared.has(expected.sharedIncludes)) {
      failures.push(
        `  [${entry.id}] "${expected.sharedIncludes}" is not a shared token with ${entry.canonId} `
        + `(score ${raw.score}, shared ${JSON.stringify(raw.sharedTokens)})`,
      );
    }
    if (expected.belowThreshold && raw.score >= SCORING_CONFIG[expected.belowThreshold]) {
      failures.push(
        `  [${entry.id}] scores ${raw.score}, at or above ${expected.belowThreshold} `
        + `(${SCORING_CONFIG[expected.belowThreshold]}) — the false collision still admits it`,
      );
    }
    if (expected.atOrAboveThreshold && raw.score < SCORING_CONFIG[expected.atOrAboveThreshold]) {
      failures.push(
        `  [${entry.id}] scores ${raw.score}, below ${expected.atOrAboveThreshold} `
        + `(${SCORING_CONFIG[expected.atOrAboveThreshold]}) — a real concept was removed with the fragment`,
      );
    }
  }
  assert.equal(failures.length, 0,
    `${failures.length} retrieval guard(s) disagree with the ruling:\n${failures.join('\n')}`);
});

test('a possessive contributes the noun it possesses', () => {
  /*
   * Red before v2.6.24 (pt09 finding 10, the largest of the run and the only
   * one the archived corpus can see; shipped in its own adjudication window
   * under Jason's 2026-08-08 ruling). `tokenize` keeps `women's` whole, then
   * `stemToken` strips the trailing `s` and leaves the apostrophe: the token
   * that enters the index is `women'` — a string that can never unify with
   * `women`. Same for every possessive: partner's -> partner', men's -> men',
   * wife's -> wife'. Those are canon vocabulary — a passage that writes
   * "a partner's income" contributed no `partner` token at all.
   *
   * Corpus census: 239 possessives across the 42 archived sources (one's x73,
   * women's x17, partner's x14, men's x14, ...).
   *
   * The length floor is not decoration: without it the strip re-creates the
   * defect the v2.6.0 floor exists to prevent — le's -> le and li's -> li,
   * two-character fragments carrying an IDF they have not earned. The floor
   * cases are pinned below.
   */
  const tokens = (text) => tokenize(text);

  assert.ok(tokens("a partner's income").includes('partner'),
    "partner's contributes partner");
  assert.ok(tokens("women's choices in the market").includes('women'),
    "women's contributes women");
  assert.ok(tokens("her husband's attention").includes('husband'),
    "husband's contributes husband");
  // No apostrophe-bearing fragment survives where the strip applies.
  assert.equal(tokens("a partner's income and women's choices")
    .filter((token) => token.includes("'")).length, 0,
    'no stranded-apostrophe token remains');

  // The floor: a bare stem shorter than minDerivedStemLength is not created.
  assert.ok(!tokens("le's fragment here").includes('le'),
    "le's does not become a two-character token");
  assert.ok(!tokens("li's fragment here").includes('li'),
    "li's does not become a two-character token");

  // Non-possessive apostrophe forms are untouched by the strip.
  assert.ok(tokens("the couples' shared plans").length > 0,
    'plural-possessive text still tokenizes');
});
