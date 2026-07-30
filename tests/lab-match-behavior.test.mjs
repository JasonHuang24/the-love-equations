import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  analyzeDocument,
  prepareCanonIndex,
  detectClaimUnits,
  classifyDomainRelevance,
  analyzerInternals,
  tokenize,
  SCORING_CONFIG,
} from '../js/lab-analyzer.js';
import { normalizeInput } from '../js/lab-intake.js';

/*
 * Frozen match-behavior benchmark.
 *
 * Sibling of tests/lab-domain-benchmark.test.mjs, and the same contract:
 * append-only cases, no per-round goalpost moves, and every case carries the
 * verdict the shipped analyzer gave when the case was written down. The domain
 * benchmark measures what reaches the matcher; this one measures what the
 * matcher then does with it — which evidence survives retrieval, and what the
 * analyzer says about who is claiming what.
 *
 * The three blocks are deliberately separate because they fail for unrelated
 * reasons and are fixed by unrelated changes.
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const benchmark = JSON.parse(readFileSync(
  new URL('./fixtures/match-behavior-benchmark.json', import.meta.url),
  'utf8',
));
const canonIndex = JSON.parse(readFileSync(path.join(ROOT_DIR, 'data', 'le-canon-index.json'), 'utf8'));
const prepared = prepareCanonIndex(canonIndex);

const STANCE_LABELS = new Set(['Resembles', 'Supports', 'Challenges', 'Contradicts', 'Extends', 'Context only']);

function documentFor(text) {
  return normalizeInput({
    text,
    format: 'auto',
    source: { title: 'match-behavior fixture', type: 'fixture-file', url: null },
    extraction: { method: 'fixture', warnings: [] },
    createdAt: '1970-01-01T00:00:00.000Z',
  });
}

/** The single classified claim unit a one-sentence fixture case produces. */
function unitFor(text) {
  const [unit] = classifyDomainRelevance(detectClaimUnits(documentFor(text)));
  assert.ok(unit, `Fixture text produced no claim unit: ${text}`);
  return unit;
}

async function analyzeCase(text) {
  const unit = unitFor(text);
  if (unit.domainRelevance.status === 'irrelevant') {
    return { gatedOut: true, reasonCode: unit.domainRelevance.reasonCode, matches: [], weakMatches: [] };
  }
  const result = await analyzeDocument(documentFor(text), canonIndex, {});
  const segment = result.segments.find((row) => row.unit.id === unit.id) || result.segments[0];
  return {
    gatedOut: false,
    reasonCode: unit.domainRelevance.reasonCode,
    matches: segment?.matches || [],
    weakMatches: segment?.weakMatches || [],
  };
}

/**
 * The working candidate set for a unit: what survives retrieval and is
 * available to admission, bounded context, and stance.
 */
function candidateSet(unit) {
  return analyzerInternals.candidateSetFor(unit, prepared);
}

/** Every entry above the candidate floor, ranked — the pre-truncation truth. */
function rankedCandidates(unit) {
  return prepared.entries
    .map((entry) => ({ entry, rawScore: analyzerInternals.scoreEntry(unit, entry, prepared.idf) }))
    .filter((row) => row.rawScore.score >= SCORING_CONFIG.candidateScoreFloor)
    .sort((a, b) => b.rawScore.score - a.rawScore.score || a.entry.id.localeCompare(b.entry.id));
}

function carriesExactEvidence(rawScore) {
  return Boolean(rawScore.phraseHits.length || rawScore.exactAliasHits.length || rawScore.signatureHits.length);
}

test('match-behavior fixture is structurally sound', () => {
  assert.equal(benchmark.schema, 'le-lab.match-behavior/1.0');
  const ids = new Set();
  const blocks = Object.entries(benchmark.blocks);
  assert.equal(blocks.length, 7, 'The fixture holds the seven adjudicated blocks.');
  blocks.forEach(([name, block]) => {
    assert.ok(block.question && block.ruling, `${name} states its question and its ruling.`);
    assert.ok(Array.isArray(block.cases) && block.cases.length, `${name} holds cases.`);
    block.cases.forEach((entry) => {
      assert.ok(entry.id && !ids.has(entry.id), `Case ID ${entry.id} is unique.`);
      ids.add(entry.id);
      assert.ok(typeof entry.text === 'string' && entry.text.trim().length >= 20, `${entry.id} has substantive text.`);
      assert.ok(entry.observedAtFreeze, `${entry.id} records what the shipped analyzer did at freeze time.`);
    });
  });
  benchmark.blocks.misreadingPolarity.cases.forEach((entry) => {
    assert.ok(STANCE_LABELS.has(entry.expected.stance), `${entry.id} expects a real stance label.`);
    assert.ok(['assert', 'negated', 'attributed'].includes(entry.wrapper), `${entry.id} declares its wrapper.`);
  });
  benchmark.blocks.stanceComposition.cases.forEach((entry) => {
    assert.ok(STANCE_LABELS.has(entry.expected.stance), `${entry.id} expects a real stance label.`);
    assert.ok(entry.wrapper, `${entry.id} declares its wrapper.`);
    // Every case in the block varies the wrapper and nothing else, so the
    // indexed misreading has to be literally present in each one. A case that
    // quietly reworded the proposition would be measuring two things at once.
    assert.ok(
      normalizeForCompare(entry.text).includes(normalizeForCompare(benchmark.blocks.stanceComposition.misreading)),
      `${entry.id} carries the block's misreading verbatim.`,
    );
  });
  benchmark.blocks.contextualCoFire.cases.forEach((entry) => {
    assert.ok(entry.alias && entry.canonId, `${entry.id} names its alias and target.`);
    assert.ok(['positive', 'negative'].includes(entry.polarity), `${entry.id} declares its polarity.`);
  });
  benchmark.blocks.clauseMechanics.cases.forEach((entry) => {
    assert.ok(['a', 'b', 'c', 'd', 'e'].includes(entry.defect),
      `${entry.id} names which of the five adjudicated defects it belongs to.`);
    assert.ok(['co-fire', 'stance'].includes(entry.surface), `${entry.id} declares its surface.`);
    // Every stance case in this block varies the wrapper around one indexed
    // misreading, exactly as stanceComposition does, so a case cannot quietly
    // reword the proposition and measure two things at once.
    if (entry.surface === 'stance') {
      assert.ok(STANCE_LABELS.has(entry.expected.stance), `${entry.id} expects a real stance label.`);
      assert.ok(
        normalizeForCompare(entry.text).includes(normalizeForCompare(benchmark.blocks.clauseMechanics.misreading)),
        `${entry.id} carries the block's misreading verbatim.`,
      );
    } else {
      assert.ok(entry.alias, `${entry.id} names its alias.`);
      assert.ok(['positive', 'negative'].includes(entry.polarity), `${entry.id} declares its polarity.`);
    }
  });
  // Every one of the five has at least one case, so a defect cannot be declared
  // fixed by a commit that never wrote a case for it.
  ['a', 'b', 'c', 'd', 'e'].forEach((defect) => {
    assert.ok(benchmark.blocks.clauseMechanics.cases.some((entry) => entry.defect === defect),
      `Defect ${defect} has no case in clauseMechanics.`);
  });
});

/** Punctuation-insensitive containment, so a quoted or hyphenated wrapper still matches. */
function normalizeForCompare(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

test('misreading-surface overlap is labelled by who is asserting it', async () => {
  const failures = [];
  for (const entry of benchmark.blocks.misreadingPolarity.cases) {
    const { matches, gatedOut } = await analyzeCase(entry.text);
    const match = matches.find((row) => row.canonId === entry.canonId);
    if (entry.expected.mapped && !match) {
      failures.push(`  [${entry.id}] ${entry.canonId} did not map at all (gatedOut=${gatedOut})`);
      continue;
    }
    const stance = match?.alignment?.label;
    if (stance !== entry.expected.stance) {
      failures.push(
        `  [${entry.id}] ${entry.wrapper}: expected ${entry.expected.stance}, got ${stance} `
        + `(score ${match?.score}) — ${entry.text}`,
      );
    }
  }
  assert.equal(failures.length, 0,
    `${failures.length} polarity case(s) mislabel who is making the claim:\n${failures.join('\n')}`);
});

test('an overlap with nothing but a boundary condition never passes as resemblance', () => {
  // No sentence in the corpus produces a boundary-only credible match today —
  // entries' caveats share vocabulary with their own titles and synopses, and
  // the passages that would not are methodology prose the domain gate sets
  // aside. The rule is asserted directly rather than left untested until a
  // source happens to trip it.
  const surfaces = (hit) => ({
    hit,
    tokens: Object.fromEntries(hit.map((surface) => [surface, ['token']])),
    misreadingOnly: hit.length === 1 && hit[0] === 'commonMisreading',
    boundaryOnly: hit.length === 1 && hit[0] === 'boundaryCondition',
  });
  const matchWith = (hit) => ({
    canonId: 'frameworks:option-pool',
    score: 0.6,
    _rawScore: { misreadingOverlap: 0, matchSurfaces: surfaces(hit) },
  });
  const unit = { text: 'Visible options in a feed are viable reciprocal available options.', isClaimLike: true };

  const boundaryOnly = analyzerInternals.stanceFor(unit, matchWith(['boundaryCondition']));
  assert.equal(boundaryOnly.label, 'Challenges');
  assert.equal(boundaryOnly.evidence.boundaryConditionOnly, true);

  const alsoSynopsis = analyzerInternals.stanceFor(unit, matchWith(['synopsis', 'boundaryCondition']));
  assert.equal(alsoSynopsis.label, 'Resembles',
    'Boundary overlap alongside another surface is an ordinary resemblance, not a scope challenge.');

  const contextOnly = analyzerInternals.stanceFor({ ...unit, isClaimLike: false }, matchWith(['boundaryCondition']));
  assert.equal(contextOnly.label, 'Context only',
    'A non-claim passage stays context-only; the boundary rule never promotes it to a stance.');
});

test('every exact phrase, alias, and signature hit survives retrieval', () => {
  const failures = [];
  for (const entry of benchmark.blocks.candidateRetention.cases) {
    const unit = unitFor(entry.text);
    const retained = new Set(candidateSet(unit).map((candidate) => candidate.canonId));

    (entry.mustRetain || []).forEach((requirement) => {
      if (!retained.has(requirement.canonId)) {
        failures.push(`  [${entry.id}] ${requirement.canonId} (${requirement.evidence}) was dropped before adjudication — ${entry.text}`);
      }
    });

    // The property, over and above the named cases: evidence-bearing entries
    // are never the ones cut. Retention is not credibility — a retained hit
    // still has to earn admission on its own score.
    rankedCandidates(unit)
      .filter((row) => carriesExactEvidence(row.rawScore))
      .forEach((row) => {
        if (!retained.has(row.entry.id)) {
          failures.push(
            `  [${entry.id}] ${row.entry.id} carries exact evidence at ${row.rawScore.score} and is absent `
            + `from the working set of ${retained.size}`,
          );
        }
      });
  }
  assert.equal(failures.length, 0,
    `${failures.length} evidence-bearing candidate(s) vanish before adjudication:\n${failures.join('\n')}`);
});

test('the working set only ever widens, and widening confers no credibility', () => {
  // The other half of the union contract, and the reason this is safe to ship:
  // whatever the old ranked-and-truncated set held is still held, nothing that
  // was admitted stops being admitted, and every newly retained candidate is
  // still judged by the unchanged score-plus-evidence rule.
  for (const entry of benchmark.blocks.candidateRetention.cases) {
    const unit = unitFor(entry.text);
    const ranked = rankedCandidates(unit);
    const working = candidateSet(unit);
    const retained = new Set(working.map((candidate) => candidate.canonId));

    ranked.slice(0, SCORING_CONFIG.maxCandidatesPerUnit).forEach((row) => {
      assert.ok(retained.has(row.entry.id),
        `${entry.id}: ${row.entry.id} was in the top ${SCORING_CONFIG.maxCandidatesPerUnit} and is no longer retained.`);
    });

    // Nothing is invented. The admitted set the working candidates produce is
    // exactly the admitted set the FULL above-floor ranking produces, so the
    // union restores what truncation was hiding and adds nothing else.
    const admittedFromWorking = working
      .filter((candidate) => candidate.score >= SCORING_CONFIG.minCredibleScore
        && analyzerInternals.hasCredibleMatchEvidence(candidate._rawScore))
      .map((candidate) => candidate.canonId)
      .sort();
    const admittedFromFullRanking = ranked
      .filter((row) => row.rawScore.score >= SCORING_CONFIG.minCredibleScore
        && analyzerInternals.hasCredibleMatchEvidence(row.rawScore))
      .map((row) => row.entry.id)
      .sort();
    assert.deepEqual(admittedFromWorking, admittedFromFullRanking,
      `${entry.id}: the working set admits a different population than the full ranking does.`);
  }
});

test('a curated single word is sufficient only under its declared conditions', async () => {
  const failures = [];
  for (const entry of benchmark.blocks.typedAlias.cases) {
    const { matches, gatedOut, reasonCode } = await analyzeCase(entry.text);
    const credible = matches.some((row) => row.canonId === entry.canonId);
    if (credible !== entry.expected.credibleMatch) {
      failures.push(
        `  [${entry.id}] ${entry.polarity} (${entry.aliasClass || entry.trap}): expected credibleMatch=`
        + `${entry.expected.credibleMatch}, got ${credible} for ${entry.canonId}`
        + `${gatedOut ? ` (gated out: ${reasonCode})` : ''} — ${entry.text}`,
      );
    }
  }
  const negatives = benchmark.blocks.typedAlias.cases.filter((entry) => entry.polarity === 'negative');
  const positives = benchmark.blocks.typedAlias.cases.filter((entry) => entry.polarity === 'positive');
  assert.ok(negatives.length >= positives.length,
    'The adversarial negatives at least match the positives one for one.');
  assert.equal(failures.length, 0,
    `${failures.length} typed-alias case(s) disagree with the ruling:\n${failures.join('\n')}`);
});

/**
 * The per-occurrence ledger for a contextual alias, as the analyzer publishes
 * it. Absent until the occurrence-local rewrite lands, which is why the caller
 * treats a missing ledger as a failure rather than a crash.
 */
function contextualAliasTrace(unit, canonId) {
  const entry = prepared.entries.find((row) => row.id === canonId);
  assert.ok(entry, `Fixture names a canon entry that does not exist: ${canonId}`);
  return analyzerInternals.scoreEntry(unit, entry, prepared.idf).contextualAliasTrace || null;
}

test('a contextual alias is promoted by evidence beside that occurrence, not somewhere in the passage', async () => {
  const failures = [];
  for (const entry of benchmark.blocks.contextualCoFire.cases) {
    const { matches, gatedOut, reasonCode } = await analyzeCase(entry.text);
    const credible = matches.some((row) => row.canonId === entry.canonId);
    if (credible !== entry.expected.credibleMatch) {
      failures.push(
        `  [${entry.id}] ${entry.polarity} (${entry.trap}): expected credibleMatch=`
        + `${entry.expected.credibleMatch}, got ${credible} for ${entry.canonId}`
        + `${gatedOut ? ` (gated out: ${reasonCode})` : ''} — ${entry.text}`,
      );
    }

    // Where a case adjudicates occurrence independence, the score object has to
    // account for every occurrence separately. A passage-wide verdict cannot
    // satisfy this even when it happens to produce the right match.
    if (!entry.expected.occurrences) continue;
    const trace = contextualAliasTrace(unitFor(entry.text), entry.canonId);
    if (!trace) {
      failures.push(
        `  [${entry.id}] expects per-occurrence accounting `
        + `(${JSON.stringify(entry.expected.occurrences)}) and the score object publishes none`,
      );
      continue;
    }
    const forAlias = trace.filter((row) => row.alias === entry.alias);
    const observed = {
      total: forAlias.length,
      promoted: forAlias.filter((row) => row.promoted).length,
      disqualified: forAlias.filter((row) => !row.promoted).length,
    };
    assert.deepEqual(observed, entry.expected.occurrences,
      `[${entry.id}] occurrence accounting for “${entry.alias}” — ${entry.text}`);
  }
  assert.equal(failures.length, 0,
    `${failures.length} contextual co-fire case(s) disagree with the ruling:\n${failures.join('\n')}`);
});

test('stance survives negation scope, quotation, attribution, and their compositions', async () => {
  const failures = [];
  for (const entry of benchmark.blocks.stanceComposition.cases) {
    const { matches, gatedOut } = await analyzeCase(entry.text);
    const match = matches.find((row) => row.canonId === entry.canonId);
    if (entry.expected.mapped && !match) {
      failures.push(`  [${entry.id}] ${entry.canonId} did not map at all (gatedOut=${gatedOut}) — ${entry.text}`);
      continue;
    }
    const stance = match?.alignment?.label;
    if (stance !== entry.expected.stance) {
      failures.push(
        `  [${entry.id}] ${entry.wrapper}: expected ${entry.expected.stance}, got ${stance} `
        + `(score ${match?.score}) — ${entry.text}`,
      );
    }
  }
  assert.equal(failures.length, 0,
    `${failures.length} stance-composition case(s) mislabel who is claiming what:\n${failures.join('\n')}`);
});

test('a clause boundary is where the writer put one, and a comment attaches to what it is about', async () => {
  const failures = [];
  for (const entry of benchmark.blocks.clauseMechanics.cases) {
    const { matches, gatedOut, reasonCode } = await analyzeCase(entry.text);

    if (entry.surface === 'co-fire') {
      const credible = matches.some((row) => row.canonId === entry.canonId);
      if (credible !== entry.expected.credibleMatch) {
        failures.push(
          `  [${entry.id}] defect ${entry.defect} (${entry.trap}): expected credibleMatch=`
          + `${entry.expected.credibleMatch}, got ${credible}`
          + `${gatedOut ? ` (gated out: ${reasonCode})` : ''} — ${entry.text}`,
        );
      }
      continue;
    }

    const match = matches.find((row) => row.canonId === entry.canonId);
    if (entry.expected.mapped && !match) {
      failures.push(`  [${entry.id}] ${entry.canonId} did not map at all (gatedOut=${gatedOut}) — ${entry.text}`);
      continue;
    }
    if (match?.alignment?.label !== entry.expected.stance) {
      failures.push(
        `  [${entry.id}] defect ${entry.defect} (${entry.wrapper}): expected ${entry.expected.stance}, `
        + `got ${match?.alignment?.label} (score ${match?.score}) — ${entry.text}`,
      );
    }
  }
  assert.equal(failures.length, 0,
    `${failures.length} clause-mechanics case(s) disagree with the ruling:\n${failures.join('\n')}`);
});

test('the irony limit is stated as a limit and not quietly counted as a pass', () => {
  const documented = benchmark.blocks.stanceComposition.cases.filter((entry) => entry.limitDocumented);
  assert.equal(documented.length, 1, 'Exactly one case in this block is a stated instrument limit.');
  const [limit] = documented;
  // A limit case freezes what the analyzer DOES, so expected and observed have
  // to agree. If a later pass makes them disagree, the case has stopped being a
  // limit and become a defect, and it should be re-adjudicated rather than left
  // sitting in the block asserting something nobody decided.
  assert.equal(limit.expected.stance, limit.observedAtFreeze.stance,
    'A documented limit asserts current behavior; expected and observedAtFreeze must agree.');
  assert.match(limit.note, /LIMIT/,
    'The limit case says so in its own note, not only in the block ruling.');
});

/**
 * The irony rule, generalised. It was written for one case and is now the
 * contract for every limit in the file, in whichever block it lives.
 */
test('a documented limit asserts current behavior, and says what it costs', () => {
  const limits = Object.entries(benchmark.blocks).flatMap(([block, body]) => (body.cases || [])
    .filter((entry) => entry.limitDocumented)
    .map((entry) => ({ block, entry })));
  assert.ok(limits.length >= 15, `Expected the documented-limit population, found ${limits.length}.`);

  limits.forEach(({ block, entry }) => {
    // Every claim `expected` makes has to be echoed by `observedAtFreeze`.
    // observedAtFreeze carries more — scores, clause counts, trace fields — and
    // is not required to carry less.
    Object.keys(entry.expected).forEach((key) => {
      assert.equal(entry.expected[key], entry.observedAtFreeze[key],
        `[${block}/${entry.id}] expected.${key} and observedAtFreeze.${key} disagree. The case has `
        + 'stopped being a limit and become a defect; re-adjudicate it rather than leave it here '
        + 'asserting something nobody decided.');
    });
    // The cost has to be written down. A limit whose humanly correct answer is
    // unrecorded is indistinguishable from behavior somebody meant.
    if (block === 'documentedLimits') {
      assert.ok(entry.humanlyCorrect,
        `[${block}/${entry.id}] records no humanly correct answer, so nothing says what the limit costs.`);
      assert.ok(entry.family, `[${block}/${entry.id}] does not name the syntax that defeats the model.`);
      const [key] = Object.keys(entry.humanlyCorrect);
      assert.notEqual(entry.humanlyCorrect[key], entry.expected[key],
        `[${block}/${entry.id}] agrees with the analyzer, so it is a guard and not a limit — drop `
        + 'limitDocumented from it.');
    }
  });
});

test('the documented limits are what the analyzer actually does today', async () => {
  const failures = [];
  for (const entry of benchmark.blocks.documentedLimits.cases) {
    const { matches, gatedOut } = await analyzeCase(entry.text);
    if (entry.surface === 'co-fire') {
      const credible = matches.some((row) => row.canonId === entry.canonId);
      if (credible !== entry.expected.credibleMatch) {
        failures.push(
          `  [${entry.id}] ${entry.family}: freeze says credibleMatch=${entry.expected.credibleMatch}, `
          + `analyzer says ${credible}${gatedOut ? ' (gated out)' : ''} — ${entry.text}`,
        );
      }
      continue;
    }
    const stance = matches.find((row) => row.canonId === entry.canonId)?.alignment?.label;
    if (stance !== entry.expected.stance) {
      failures.push(
        `  [${entry.id}] ${entry.family}: freeze says ${entry.expected.stance}, analyzer says ${stance} `
        + `— ${entry.text}`,
      );
    }
  }
  assert.equal(failures.length, 0,
    `${failures.length} documented limit(s) no longer describe the analyzer. A limit that has moved `
    + `is a limit nobody is documenting:\n${failures.join('\n')}`);
});

/*
 * The three branches of `carries()`, as a truth table.
 *
 * v2.6.1 §2 claimed multiword entries had moved FROM substring matching TO a
 * contiguous run of stems. They had not; the run of stems was added beside the
 * substring test, which still runs first. The dated correction to that claim then
 * asserted the stem run was therefore NEVER decisive, on the argument that any
 * surface stemming to `care` carries `care` as a prefix — and Sol's verification
 * review refuted it, because the FIRST word of a multiword entry is reachable by
 * suffix removal too. `healths` and `healthfulness` both strip to `health`.
 *
 * So the branch is reachable and can decide a case alone. Two overclaims in a row
 * were both about which code path can be reached, and both were argued in prose
 * from one side of the comparison. This is the enumeration instead.
 *
 * `carries` is not exported, so the per-branch attribution runs against a replica
 * copied from js/lab-analyzer.js. A replica can drift from what it mirrors, so it
 * is ANCHORED: every row whose replica verdict is "disqualified" is also checked
 * end to end through the shipped analyzer below. Exporting `carries` would be the
 * better instrument and is not available to a pass forbidden from touching the
 * analyzer.
 */
/*
 * The denylist, READ FROM THE CANON rather than copied beside it.
 *
 * This was a hand-typed array until Sol's third review pointed out that the census
 * then checked itself against a test-owned copy: canon drift would have been
 * invisible, since the fixture and the copy would still have agreed with each
 * other. Same single-source correction as the suffix inventory, and the same reason
 * — a duplicated registry is a registry that can silently be wrong.
 *
 * The canon holds exactly one non-empty `notAfter` list, which is itself the fact
 * §1 of the release report rests on, so the assertion doubles as a check that it
 * is still true.
 */
const DENYLIST_SOURCES = (() => {
  const found = [];
  const walk = (node) => {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node.notAfter) && node.notAfter.length) {
      found.push({ alias: node.alias, notAfter: node.notAfter });
    }
    Object.values(node).forEach(walk);
  };
  walk(canonIndex);
  return found;
})();

test('the canon holds exactly one denylist, and it is the one these tests reason about', () => {
  assert.equal(DENYLIST_SOURCES.length, 1,
    `md/lab-v2.6.1-release.md §1 rests on the canon holding exactly ONE non-empty notAfter list; `
    + `found ${DENYLIST_SOURCES.length}. A second one makes every count in §1 and §3 stale, and the `
    + 'widening census incomplete.');
  assert.equal(DENYLIST_SOURCES[0].alias, 'provider',
    'The denylist belongs to the `provider` contextual alias.');
});

const DENYLIST_ENTRIES = DENYLIST_SOURCES[0].notAfter;

/** stemToken via the exported tokenizer; short and stopword tokens keep their surface, as it does. */
const stemOf = (token) => tokenize(token)[0] ?? token;

/** The three branches of `carries()`, reported separately instead of short-circuited. */
function branchesFor(tokens) {
  const run = tokens.join(' ');
  const stems = tokens.map(stemOf);
  const fires = (predicate) => DENYLIST_ENTRIES.filter(predicate);
  const literal = (m) => tokens.includes(m) || tokens.includes(`${m}s`);
  const substring = (m) => m.includes(' ') && (run.includes(m) || run.includes(`${m}s`));
  const stemRun = (m) => {
    const wanted = m.split(' ').map(stemOf);
    return stems.some((_, at) => wanted.every((stem, offset) => stems[at + offset] === stem));
  };
  return {
    literal: fires(literal),
    substring: fires(substring),
    stemRun: fires(stemRun),
    // What `carries` RETURNS, and HOW it got there.
    //
    // The three arrays above are independent predicates: which modifiers each test
    // would match if asked about every modifier. That is NOT the shipped control
    // flow, and an earlier version of this file modelled the difference wrongly.
    // `carries` iterates MODIFIERS in denylist order and tries the three tests
    // INSIDE each modifier, returning on the first modifier any test matches. So a
    // literal hit on a LATER modifier never happens: the loop has already returned.
    //
    // Sol's fifth review found the consequence — `health care` is selected by the
    // substring test, not by the literal `care` entry, because `care` sits at index
    // 13 and `health care` at index 2. Modelling the tests as global-priority lanes
    // got two of six rows wrong.
    ...selectLikeCarries(tokens, literal, substring, stemRun),
  };
}

/** The shipped loop order: modifier outer, the three tests inner, first match wins. */
function selectLikeCarries(tokens, literal, substring, stemRun) {
  for (const modifier of DENYLIST_ENTRIES) {
    if (literal(modifier)) return { modifier, matchedBy: 'literal' };
    if (substring(modifier)) return { modifier, matchedBy: 'substring' };
    if (stemRun(modifier)) return { modifier, matchedBy: 'stemRun' };
  }
  return { modifier: null, matchedBy: null };
}

const BRANCH_TABLE = [
  {
    tokens: ['health', 'caregivers'],
    literal: [], substring: ['health care'], stemRun: [], modifier: 'health care', matchedBy: 'substring',
    note: 'bl-17. The spanned-word shape §2 claimed had been removed. Only the substring test sees it.',
  },
  {
    tokens: ['health', 'care'],
    literal: ['care'], substring: ['health care'], stemRun: ['health care', 'care'], modifier: 'health care', matchedBy: 'substring',
    note: 'bl-19 territory. All three tests see it, which is why dropping the substring test is safe '
      + 'here — the stem run and the single-word `care` entry both still catch it.',
  },
  {
    tokens: ['healths', 'care'],
    literal: ['care'], substring: [], stemRun: ['health care', 'care'], modifier: 'health care', matchedBy: 'stemRun',
    note: 'Refutes the SUBSTRING lemma: `healths` strips to `health`, so `health care` never appears '
      + 'as a substring while the stem run matches, and the STEM RUN is what selects it in production. '
      + 'The single-word `care` entry also matches literally, but `care` sits LATER in denylist order '
      + 'and is never examined, so it is a counterfactual fallback rather than an earlier branch — '
      + 'a distinction this file previously got backwards.',
  },
  {
    tokens: ['healthfulness', 'carefulness'],
    literal: [], substring: [], stemRun: ['health care', 'care'], modifier: 'health care', matchedBy: 'stemRun',
    note: "Sol's counterexample, and the row that does the real work. Suffixing BOTH words is what "
      + 'takes every earlier branch out of play, which is why the double suffix was not decoration.',
  },
  {
    tokens: ['childfulness', 'carefulness'],
    literal: [], substring: [], stemRun: ['care', 'child care'], modifier: 'care', matchedBy: 'stemRun',
    note: 'The other multiword entry, decisive the same way, so the reachability is a property of '
      + "the branch and not of one entry's spelling.",
  },
  {
    tokens: ['healths', 'careers'],
    literal: [], substring: [], stemRun: ['health care', 'care'], modifier: 'health care', matchedBy: 'stemRun',
    note: 'One ordinary plural and one ordinary noun, both stripped by the same rules. The cheapest '
      + 'decisive sequence found.',
  },
];

test('the three branches of carries(), enumerated rather than argued', () => {
  BRANCH_TABLE.forEach(({ tokens, literal, substring, stemRun, modifier, matchedBy, note }) => {
    const observed = branchesFor(tokens);
    const label = tokens.join(' ');
    // All THREE branches are asserted. The first version of this test declared
    // `literal` and never checked it, so that column could have said anything —
    // which matters, because `literal` is exactly what makes `healths care`
    // non-decisive, and that is the correction this table exists to record.
    assert.deepEqual(observed.literal, literal, `[${label}] literal branch — ${note}`);
    assert.deepEqual(observed.substring, substring, `[${label}] substring branch — ${note}`);
    assert.deepEqual(observed.stemRun, stemRun, `[${label}] stem-run branch — ${note}`);
    assert.equal(observed.modifier, modifier,
      `[${label}] carries() returns the FIRST matching modifier in denylist order, and the analyzer `
      + `puts it in its trace. Expected "${modifier}", replica says "${observed.modifier}".`);
    // The cell that was declared and never checked until Sol's fifth review, and
    // that was WRONG for two rows when it finally was.
    assert.equal(observed.matchedBy, matchedBy,
      `[${label}] modifier “${modifier}” is selected by the ${matchedBy} test under the shipped `
      + `loop order. Replica says ${observed.matchedBy}. Modelling the tests as global-priority lanes `
      + 'rather than as three tests inside a modifier loop is what got this wrong before.');
  });

  // The claim the two retracted paragraphs both got wrong, stated as an assertion:
  // there is at least one token sequence the stem run disqualifies and the earlier
  // two tests do not. If this ever becomes false, the branch has gone inert and the
  // correction blocks in md/lab-v2.6.1-release.md §2 need revisiting again.
  // TWO different properties, and conflating them is how the `Decided by` column
  // came to be wrong. This one is COUNTERFACTUAL: sequences no literal or substring
  // test would match for ANY modifier, so the stem run is the only test that could
  // catch them at all. It is the property that refutes "the stem run is inert".
  const stemRunOnly = BRANCH_TABLE
    .filter(({ tokens }) => {
      const { literal, substring, stemRun } = branchesFor(tokens);
      return stemRun.length && !literal.length && !substring.length;
    })
    .map(({ tokens }) => tokens.join(' '));

  // This one is ACTUAL: sequences where the stem run is what selected the returned
  // modifier under the shipped loop order. It is the larger set, because a stem-run
  // selection can happen on an early modifier while a literal match waits, unreached,
  // on a later one.
  const selectedByStemRun = BRANCH_TABLE
    .filter(({ matchedBy }) => matchedBy === 'stemRun')
    .map(({ tokens }) => tokens.join(' '));
  assert.deepEqual(selectedByStemRun, [
    'healths care',
    'healthfulness carefulness',
    'childfulness carefulness',
    'healths careers',
  ], 'These four sequences are the ones production actually resolves through the stem run. §2.1 '
    + 'claimed three, because it was scoring the counterfactual property below instead.');

  const decisive = stemRunOnly;

  // WHICH sequences, not how many. A count is satisfied by any three rows, so it
  // would survive the set drifting off the double-suffix shape that is the point.
  assert.deepEqual(decisive, [
    'healthfulness carefulness',
    'childfulness carefulness',
    'healths careers',
  ], 'These three sequences, and only these, could ONLY be caught by the stem run — no literal and no '
    + 'substring test matches any modifier for them. §2 asserted the branch was inert. If this set '
    + 'empties the branch really has gone inert and md/lab-v2.6.1-release.md §2.1 needs revisiting; if it '
    + 'changes shape, the refutation has moved and §2.1 should say so. Note this is NOT the same as the '
    + 'four sequences production resolves through the stem run, asserted above.');
});

/** The candidate-level row for one canon entry, plus whether it reached the public list. */
async function candidateFor(text, canonId) {
  const unit = unitFor(text);
  const result = await analyzeDocument(documentFor(text), canonIndex, { diagnostics: true });
  const segment = result.segments.find((row) => row.unit.id === unit.id) || result.segments[0];
  const traced = result.diagnostics.claimUnits.find((row) => row.segmentId === unit.id)
    || result.diagnostics.claimUnits[0];
  return {
    candidate: (traced?.candidates || []).find((row) => row.canonId === canonId) || null,
    credible: (segment?.matches || []).some((row) => row.canonId === canonId),
  };
}

/*
 * Anchors the replica above, at the candidate level rather than at the public one.
 *
 * The first version of this anchor asserted only absence from `matches`, which is
 * too weak to hold a branch attribution: a passage can drop out of the public list
 * for several reasons, so a replica or analyzer drift that still ended in
 * non-promotion would have stayed green. It now pins the candidate score, the fate
 * and the admission verdict — the surface the documentedLimits block records and
 * the one the disqualification actually moves.
 *
 * It ALSO pins the promotion trace — `disqualifiedBy` and the exact modifier in
 * `reason` — which an earlier version of this comment wrongly called unassertable
 * without publishing new analyzer output. `scoreEntry` returns
 * `contextualAliasTrace`, `analyzerInternals` exports `scoreEntry`, and the
 * `contextualAliasTrace()` helper above this block has been reading it since
 * v2.6.0. Sol's third review caught the claim, in the file that already disproved
 * it.
 *
 * The modifier string is the assertion that does the real work: it ties the
 * replica's `firstHit` — first match in denylist order — to what the shipped
 * `carries` actually returned. Score and fate prove the outcome; only the modifier
 * proves the technical-modifier mechanism caused it.
 */
test('every sequence the replica calls disqualified is disqualified by the shipped analyzer', async () => {
  const CANON_ID = 'smv:money:provisioning-signal';
  const DISQUALIFIED_SCORE = 0.156;
  const PROMOTED_SCORE = 0.54;
  const sentence = (complement) => `During our marriage the provider for ${complement} was always him.`;
  const control = 'healths workers';

  for (const { tokens, modifier } of BRANCH_TABLE) {
    const complement = tokens.join(' ');
    const { candidate, credible } = await candidateFor(sentence(complement), CANON_ID);

    // The mechanism, not just the outcome. `carries` returns one modifier and the
    // analyzer names it in the trace, so this is where the replica either agrees
    // with the shipped code about WHY the alias was refused or is caught not to.
    const [trace] = contextualAliasTrace(unitFor(sentence(complement)), CANON_ID) || [];
    assert.ok(trace, `"${complement}" produced no contextual-alias trace row.`);
    assert.equal(trace.promoted, false, `"${complement}" must not promote the alias.`);
    assert.equal(trace.disqualifiedBy, 'technical-modifier',
      `"${complement}" must be refused BY THE DENYLIST, not by the window test. Observed `
      + `${trace.disqualifiedBy}.`);
    // The MODIFIER is the thing under test and stays literal. The token count is
    // not: it comes from the config, so retuning the lookback cannot fail this test
    // for a reason it was never asking about.
    const window = SCORING_CONFIG.contextualAliasModifierLookback;
    assert.equal(trace.reason, `technical modifier “${modifier}” within ${window} tokens`,
      `"${complement}" must be refused by modifier “${modifier}”, the first match in denylist `
      + `order. Observed: ${trace.reason}.`);
    assert.equal(credible, false,
      `"${complement}" fires a denylist branch in the replica, so the analyzer must not promote the `
      + 'contextual alias for it.');
    assert.ok(candidate,
      `"${complement}" produced no candidate at all, so there is nothing here to anchor.`);
    assert.equal(candidate.score, DISQUALIFIED_SCORE,
      `"${complement}" must score ${DISQUALIFIED_SCORE} at the candidate level, the alias-less score `
      + `every disqualified case in this family records. Observed ${candidate.score}.`);
    assert.equal(candidate.fate, 'below-weak-threshold',
      `"${complement}" must fall below the weak line rather than leave the public list some other `
      + `way. Observed fate ${candidate.fate}.`);
    assert.equal(candidate.admission.credible, false,
      `"${complement}" must fail admission, not merely lose a display slot.`);
  }

  // Without a denylist branch the same shape promotes, so the assertions above are
  // measuring the denylist and not the sentence frame. Pinned at the candidate
  // level too: a control that merely appears proves less than one that scores.
  const { candidate, credible } = await candidateFor(sentence(control), CANON_ID);
  assert.equal(credible, true,
    `"${control}" carries no denylist term and must still promote — otherwise the cases above prove `
    + 'nothing about the denylist.');
  assert.equal(candidate.score, PROMOTED_SCORE,
    `"${control}" must score ${PROMOTED_SCORE}, the promoted-alias score. Observed ${candidate.score}.`);
  assert.equal(candidate.fate, 'displayed',
    `"${control}" must be displayed. Observed ${candidate.fate}.`);

  const [controlTrace] = contextualAliasTrace(unitFor(sentence(control)), CANON_ID) || [];
  assert.equal(controlTrace.promoted, true, `"${control}" must promote the alias.`);
  assert.equal(controlTrace.disqualifiedBy, null,
    `"${control}" must reach promotion with NO disqualifier — otherwise the rows above are not `
    + 'measuring the denylist.');
});

/*
 * The widening census, checkable instead of asserted.
 *
 * md/lab-v2.6.1-release.md §3 published this enumeration three times as "enumerated
 * over all sixteen entries" and it was wrong all three times — first naming `pays`, which
 * does not match, and omitting seven surfaces; then omitting `carefulness` and
 * `medicalization`, which Sol's verification review found. Both failures were the
 * same step: a mechanical candidate space filtered to real English BY HAND, where
 * a hand that forgets a word leaves no trace in the artifact.
 *
 * So the hand judgments became the fixture. This regenerates the mechanical space
 * from the stemmer's own suffix inventory and requires every candidate in it to
 * carry an explicit verdict — word or non-word. An omission now fails the suite
 * rather than surviving a review.
 */
const census = JSON.parse(readFileSync(
  new URL('./fixtures/denylist-widening-census.json', import.meta.url),
  'utf8',
));

/**
 * stemToken's suffix inventory, read out of the analyzer's own source text.
 *
 * The census generator used to carry a hand-copied list, which is a second copy
 * that can drift — and had already drifted: it carried `er`, which stemToken does
 * not strip. Sol's second review caught it. Extracting the alternations from the
 * `.replace(/(?:…)$/u, …)` chain inside stemToken makes the analyzer the single
 * source of truth, so a suffix added there and not to the fixture fails the suite
 * instead of silently shrinking the candidate space.
 *
 * Reading production source as DATA, which a record pass may do; it writes nothing.
 */
function stemmerSuffixInventory() {
  const source = readFileSync(path.join(ROOT_DIR, 'js', 'lab-analyzer.js'), 'utf8');
  const opens = source.indexOf('function stemToken(');
  assert.notEqual(opens, -1, 'js/lab-analyzer.js no longer defines stemToken.');
  const body = source.slice(opens, source.indexOf('\n}', opens));
  const groups = [...body.matchAll(/\.replace\(\/\(\?:([^)]+)\)\$\/u/gu)];
  assert.ok(groups.length >= 4,
    `Expected stemToken's suffix-stripping chain, found ${groups.length} alternation groups. If the `
    + 'stemmer has been rewritten in another shape, this extraction is stale and the census generator '
    + 'is no longer linked to it.');
  return groups.flatMap((group) => group[1].split('|'));
}

/** The candidate space, regenerated from the stemmer's rules rather than stored. */
function mechanicalCandidates(entry, stem) {
  const { suffixes } = census.generator;
  const candidates = new Set();
  for (const base of [entry, stem]) {
    // The bare base, then every suffix — both for the base as written and for the
    // y-to-i variant. Declared in the fixture's `generator` block.
    for (const suffix of ['', ...suffixes]) {
      candidates.add(base + suffix);
      candidates.add(base.replace(/y$/u, 'i') + suffix);
    }
  }
  return [...candidates]
    .filter((candidate) => candidate
      && candidate !== entry
      && candidate !== `${entry}s`
      && stemOf(candidate) === stem)
    .sort();
}

test('the census generator uses the stemmer\'s own suffix inventory, not a copy of it', () => {
  assert.deepEqual([...census.generator.suffixes].sort(), stemmerSuffixInventory().sort(),
    "The census generator's suffix list and stemToken's own alternations disagree. A suffix the "
    + 'stemmer strips and the generator does not know about is a region of the candidate space nobody '
    + 'ever ruled on, which is the defect that produced two wrong censuses. Regenerate the fixture '
    + 'rather than editing the list to match.');
  assert.ok(!census.generator.suffixes.includes('er'),
    '`er` is not stripped by stemToken and must not be in the inventory — it was the drift Sol found.');
});

test('the widening census is exhaustive over its own stated vocabulary', () => {
  assert.equal(census.schema, 'le-lab.denylist-census/1.3');
  assert.deepEqual(census.entries.map((row) => row.entry), DENYLIST_ENTRIES,
    'The census covers the denylist exactly, in order — a missing entry is how `service` and `care` '
    + 'were left out of the second published version.');

  census.entries.forEach((row) => {
    // The recorded stem has to be the stem the shipped stemmer produces.
    if (!row.multiword) {
      assert.equal(stemOf(row.entry), row.stem,
        `[${row.entry}] the census records stem "${row.stem}" and the tokenizer says `
        + `"${stemOf(row.entry)}".`);
    }

    if (row.multiword) {
      // A single-surface census cannot describe a two-stem run; the truth table
      // above owns those, and the note has to say where they went.
      assert.equal(row.reachedAndAttested.length + row.reachedButUnattested.length, 0,
        `[${row.entry}] is multiword, so its widening belongs to the branch truth table.`);
      assert.ok(row.note && /truth table|decisive/u.test(row.note),
        `[${row.entry}] must point at where its widening IS recorded.`);
      return;
    }

    const generated = mechanicalCandidates(row.entry, row.stem);
    const ruled = [...row.reachedAndAttested, ...row.reachedButUnattested].sort();

    // THE ASSERTION THAT CLOSES THE HOLE: every generated candidate carries a
    // verdict, and no verdict is invented for a candidate the rules do not reach.
    assert.deepEqual(ruled, generated,
      `[${row.entry}] the census and the generator disagree about the candidate space. Unruled `
      + `candidates are the defect that produced two wrong censuses: ${
        generated.filter((word) => !ruled.includes(word)).join(', ') || '(none)'
      }. Invented candidates: ${
        ruled.filter((word) => !generated.includes(word)).join(', ') || '(none)'
      }.`);

    // Every surface claimed as newly reached must actually match by stem and must
    // actually have been missed by the literal tests — the `pays` error, inverted.
    row.reachedAndAttested.forEach((word) => {
      assert.equal(stemOf(word), row.stem,
        `[${row.entry}] claims "${word}" is attested-and-reached, but it stems to "${stemOf(word)}".`);
      assert.ok(word !== row.entry && word !== `${row.entry}s`,
        `[${row.entry}] claims "${word}" is NEWLY reached, but the literal tests already reach it.`);
    });
  });
});

test('the census records the surfaces the release report names, and pays is not one of them', () => {
  const attested = new Map(census.entries.map((row) => [row.entry, row.reachedAndAttested]));

  // The corrections Sol's two reviews produced, pinned so they cannot quietly regress.
  assert.ok(attested.get('care').includes('careers'), '`careers` reaches `care` — first review.');
  assert.ok(attested.get('service').includes('serviceable'), '`serviceable` reaches `service`.');
  assert.ok(attested.get('care').includes('carefulness'), '`carefulness` reaches `care` — second review.');
  assert.ok(attested.get('medical').includes('medicalization'), '`medicalization` reaches `medical`.');
  assert.ok(attested.get('hosting').includes('hostable'), '`hostable` reaches `host` — third review.');
  assert.ok(attested.get('network').includes('networkable'), '`networkable` reaches `network`.');
  assert.ok(attested.get('internet').includes('internetization'),
    '`internetization` reaches `internet` — fourth review.');
  assert.ok(attested.get('network').includes('networkization'), '`networkization` reaches `network`.');

  // The fourth pass ruled `softwareization` unattested on the maintainer's claim that
  // ITU and ETSI write `softwarization` instead. That claim was made without opening
  // either document and it was false; both print `softwareization`. Withdrawn, and
  // pinned the other way so the correction cannot quietly revert.
  assert.ok(attested.get('software').includes('softwareization'),
    '`softwareization` is reached AND attested — ITU FG-NET2030 and ETSI White Paper 38 both print it, '
    + 'and the evidence is recorded in census.attestationEvidence.');
  assert.equal(stemOf('softwareization'), 'software', 'It reaches `software` through the `ization` rule.');

  // The mirror-image finding, which survives the correction and is the more
  // interesting half: the OTHER spelling is real and this denylist cannot see it.
  assert.equal(stemOf('softwarization'), 'softwar',
    '`softwarization` strips to `softwar`, so the denylist never sees it. That is a GAP in the widening '
    + 'rather than a cost of it, recorded in census.realButNotReached.');
  assert.ok(census.realButNotReached && census.realButNotReached.softwarization,
    'The gap has to be written down, or it is a fact nobody kept.');

  // And the word the first census named that never matched at all.
  assert.equal(stemOf('pays'), 'pays',
    '`pays` is below minStemmableLength and returns unstemmed; if this ever changes the census and '
    + 'the report both need rewriting.');
  assert.ok(!attested.get('payment').includes('pays'),
    '`pays` does not reach `payment` and must not be listed as though it does.');
  assert.equal(stemOf('paid'), 'paid', '`paid` is irregular and no suffix rule reaches it.');
});

test('every candidate in the census is REACHED, attested or not', () => {
  // The half of this fixture that is mechanical rather than judged. `rejected` was
  // the old name for the second field and it read as "not reached", which is what
  // let three review rounds argue about word calls as though they bounded what the
  // comparison catches. They never did: both fields are reached surfaces.
  census.entries.filter((row) => !row.multiword).forEach((row) => {
    [...row.reachedAndAttested, ...row.reachedButUnattested].forEach((word) => {
      assert.equal(stemOf(word), row.stem,
        `[${row.entry}] "${word}" is listed in this census, so the shipped comparison must reach it `
        + `— it stems to "${stemOf(word)}" and the entry stems to "${row.stem}". A candidate that `
        + 'does not stem-match belongs in neither field.');
    });
  });
});

test('every contested attestation carries evidence a reader can check', () => {
  // Sol's fifth review: attestation rulings were resting on prose about who said
  // what — a reviewer's uncited citations in one case, and in another a
  // maintainer's assertion about two documents he had not opened. Neither is
  // checkable from the repository, which is the only standard that matters here.
  const { arguableAttested, attestationEvidence } = census;
  assert.ok(Array.isArray(arguableAttested) && arguableAttested.length,
    'The census names which attestations were arguable; a file with none is not being honest.');

  const attestedEverywhere = new Set(census.entries.flatMap((row) => row.reachedAndAttested));
  arguableAttested.forEach((word) => {
    assert.ok(attestedEverywhere.has(word),
      `\`${word}\` is listed as an arguable ATTESTED surface but appears in no entry's `
      + 'reachedAndAttested. Either it was withdrawn and this list is stale, or the list is wrong.');
    const evidence = attestationEvidence[word];
    assert.ok(Array.isArray(evidence) && evidence.length,
      `\`${word}\` was contested and carries no evidence entry. A verdict a reader cannot check is `
      + 'the thing this field exists to end.');
    evidence.forEach((row) => {
      assert.ok(row.source, `\`${word}\` has an evidence row with no source.`);
      assert.ok(row.url || row.note,
        `\`${word}\` has an evidence row with neither a URL nor a note explaining why there is none. `
        + 'An unsourced verdict must at least say that it is unsourced.');
    });
  });

  // And the reverse: evidence for something no entry claims is attested.
  Object.keys(attestationEvidence).forEach((word) => {
    assert.ok(attestedEverywhere.has(word),
      `attestationEvidence carries \`${word}\`, which no entry lists as attested.`);
  });
});

/*
 * §1's 7/9 split, as an oracle rather than as prose.
 *
 * Sol's fifth review ACCEPTed §1's numbers after recomputing them, and noted the
 * one thing left: the split was still a sentence. §1 is the section every later
 * argument rests on — it is why the fix is a union and not a swap — and it was
 * counted by the same by-eye method that produced three wrong censuses.
 */
test('§1 of the release report: seven entries unify with their plural, nine separate', () => {
  /** The plural §1 claims for each entry: `ies` for a consonant-y, else `s`. */
  const pluralOf = (entry) => {
    const words = entry.split(' ');
    const last = words[words.length - 1];
    const plural = /[^aeiou]y$/u.test(last) ? `${last.slice(0, -1)}ies` : `${last}s`;
    return [...words.slice(0, -1), plural].join(' ');
  };
  const stemPhrase = (phrase) => phrase.split(' ').map(stemOf).join(' ');

  const unify = DENYLIST_ENTRIES.filter((entry) => stemPhrase(pluralOf(entry)) === stemPhrase(entry));
  const separate = DENYLIST_ENTRIES.filter((entry) => stemPhrase(pluralOf(entry)) !== stemPhrase(entry));

  assert.equal(unify.length, 7,
    `§1 says seven of the sixteen entries unify with their plural under the shipped stemmer; found `
    + `${unify.length}: ${unify.join(', ')}. If this moves, §1's union-not-swap argument moves with it.`);
  assert.equal(separate.length, 9,
    `§1 says nine separate; found ${separate.length}: ${separate.join(', ')}.`);

  // The two the naive `entry + s` test cannot produce at all, which is the defect
  // v2.6.1 exists to fix.
  ['utility', 'energy'].forEach((entry) => {
    assert.notEqual(pluralOf(entry), `${entry}s`,
      `§1 names \`${entry}\` as a real plural the literal-plus-s form misses.`);
    assert.equal(stemPhrase(pluralOf(entry)), stemPhrase(entry),
      `\`${entry}\` must unify with \`${pluralOf(entry)}\` under the stemmer — that unification IS the fix.`);
  });
});

/*
 * ---------------------------------------------------------------------------
 * RED. Dead aliases. These fail against the canon as committed.
 * ---------------------------------------------------------------------------
 * scoreEntry routes an alias one of exactly two ways (lab-analyzer.js:2029):
 *
 *   phraseHits       phrase.includes(' ')                -> substring match
 *   singleAliasHits  no space, length >= minSingleAliasLength,
 *                    and membership in normalized.split(/\W+/)
 *
 * Two consequences nobody wrote down:
 *
 *   1. A single-token alias containing punctuation is excluded from the phrase
 *      path for having no space, AND from the single path because a /\W+/ split
 *      can never yield a token that contains \W. `fem-centrism`, `Sub-5` and
 *      `AF/BB` are structurally unmatchable. promotedAliases() uses the same
 *      split, so typing them does not rescue them either.
 *
 *   2. An alias shorter than minPhraseLength never enters entry._phrases at all,
 *      so `SMV` — the site's own flagship acronym, on two entries — is discarded
 *      before any matching runs.
 *
 * A census of the committed canon finds eleven aliases that cannot fire. Nine of
 * them are redundant spellings whose concept is retrieved anyway through the
 * token surface; that is measured in the sibling test below, and it is why this
 * commit does not touch `game`, `Wall`, `Sham` or `LMS`. Two are real misses:
 * "SMV" retrieves lexicon:term-high-value-man instead of an SMV entry, and
 * "rizz" retrieves nothing at all.
 */

const DEAD_ALIAS_CASES = [
  {
    label: 'the flagship acronym reaches an SMV entry',
    text: 'His SMV is high because women want him and he can pick.',
    wantAnyOf: ['smv:overview', 'lexicon:term-smv-sexual-market-value'],
    wantAlias: 'smv',
  },
  {
    label: 'rizz reaches Charm',
    text: 'His rizz is what makes women want him on a first date.',
    wantAnyOf: ['smv:charm'],
    wantAlias: 'rizz',
  },
  {
    /*
     * `fem-centrism` is listed on frameworks:operative-frame AND is the whole
     * title of lexicon:term-fem-centrism. The lexicon entry wins it, and that is
     * the site's architecture rather than a competition: the Lexicon is the term
     * spine and the framework is what a reader reaches through it. Written down
     * as the Lexicon entry because that is what the analyzer does, not because
     * the framework was the wrong answer.
     */
    label: 'a hyphenated alias reaches the entry that owns it',
    text: 'Fem-centrism decides what a woman wants before she chooses a man.',
    wantAnyOf: ['lexicon:term-fem-centrism', 'frameworks:operative-frame'],
    wantAlias: 'fem-centrism',
  },
  {
    label: 'a hyphen-plus-digit alias reaches the entry that owns it',
    text: 'A Sub-5 component disqualifies a man however much women want the rest.',
    wantAnyOf: ['lexicon:term-sub-5-auto-disqualification'],
    wantAlias: 'sub-5',
  },
  {
    label: 'a slashed alias reaches the entry that owns it',
    text: 'The AF/BB pattern claims women want genes from one man and provision from another.',
    wantAnyOf: ['lexicon:term-af-bb-alpha-fucks-beta-bucks'],
    wantAlias: 'af/bb',
  },
];

test('RED: an alias a canon author wrote down can actually fire', async () => {
  for (const problem of DEAD_ALIAS_CASES) {
    const result = await analyzeDocument(normalizeInput({
      text: problem.text,
      source: { title: 'dead-alias probe' },
      createdAt: '1970-01-01T00:00:00.000Z',
    }), canonIndex);
    const matches = result.segments.flatMap((segment) => segment.matches);
    const hit = matches.find((match) => problem.wantAnyOf.includes(match.canonId));
    assert.ok(hit,
      `${problem.label}: no credible match among ${problem.wantAnyOf.join(' / ')}. `
      + `Got ${matches.map((m) => `${m.canonId}@${m.score}`).join(', ') || '(nothing)'}`);
    assert.ok(
      hit.whyMatched.some((reason) => reason.toLowerCase().includes(`“${problem.wantAlias}”`)),
      `${problem.label}: ${hit.canonId} matched, but not on the alias — whyMatched was `
      + `${JSON.stringify(hit.whyMatched)}. Retrieval through shared tokens is not the alias firing.`,
    );
  }
});

/*
 * The other half of the finding, and the reason the fix is small: a dead alias
 * usually costs nothing, because the alias text still contributes retrieval
 * tokens. These four concepts are reached without their dead alias, which is why
 * `game` and `Wall` — ordinary English words that minSingleAliasLength is
 * correctly refusing, and the shape that produced the `provider` defect — are
 * left dead on purpose rather than promoted to typed aliases for no measured
 * gain. If that ever stops being true, this test is where it shows up.
 */
const REACHED_WITHOUT_THEIR_ALIAS = [
  { text: 'The LMS model says attraction reduces to looks, money and status for women.', want: 'lexicon:term-lms-looks-money-status' },
  { text: 'She hit the Wall and men stopped wanting her.', want: 'frameworks:the-wall' },
  { text: 'Their Sham marriage persists although neither partner wants the other.', want: 'lexicon:term-the-sham' },
];

test('a dead alias is only a defect where the token surface does not already carry the concept', async () => {
  for (const probe of REACHED_WITHOUT_THEIR_ALIAS) {
    const result = await analyzeDocument(normalizeInput({
      text: probe.text,
      source: { title: 'token-surface probe' },
      createdAt: '1970-01-01T00:00:00.000Z',
    }), canonIndex);
    const matches = result.segments.flatMap((segment) => segment.matches);
    assert.ok(matches.some((match) => match.canonId === probe.want),
      `${probe.want} is reached without its dead alias; if that changed, promoting the alias `
      + `becomes worth its false-positive risk. Got ${matches.map((m) => m.canonId).join(', ') || '(nothing)'}`);
  }
});

/*
 * Where the four Lexicon slang terms landed, and the grammar that decided it.
 *
 * md/lab-constants-audit.md found the length floor silencing twelve untyped
 * single-word aliases with only four ever ruled on. Jason asked for four of the
 * remainder — cope, simp, 4B, PSL — to be typed. Two were; two were not, and
 * measurement decided which, on AUTHORED probes because all four words are
 * effectively absent from the 21-source archive.
 *
 * The reason two were refused is grammatical rather than statistical, which is
 * why it is worth freezing. `cope` and `PSL` are ordinary strings in the same
 * domain the concept lives in — "couples who cope with stress", "he brought her
 * a PSL" — so typing them manufactures a 0.540 credible match out of the wrong
 * sense. And CONTEXTUAL TYPING IS NOT THE SAFER OPTION HERE: relationalCoFire
 * promotes on a relational role term within eight tokens, and the survivors were
 * promoted by "men" and "couples", the two commonest role nouns in the domain.
 *
 * English separates the two senses where the analyzer could not. The verb takes
 * a complement — "cope WITH" — and the noun is a predicate or object — "is
 * cope", "as cope". Multi-word aliases need no typing, fire as ordinary phrase
 * hits, and cannot collide with a verb that never takes those shapes. Measured:
 * cope 3/4 intent and 0/3 false positives, PSL 2/2 and 0/2, against 2/2 and 3/3
 * for standalone cope, and against 1/2 and 1/2 for standalone PSL.
 *
 * md/lab-slang-alias-typing.md carries the full tables.
 */
const SLANG_SENSE_SPLIT = [
  // The concept, reached by the phrase route.
  { kind: 'concept', want: 'lexicon:term-cope',
    text: 'Every reassuring theory about attraction gets written off as cope by the men who read the blackpill.' },
  { kind: 'concept', want: 'lexicon:term-cope',
    text: 'Any claim that personality matters is just cope, according to the forum.' },
  { kind: 'concept', want: 'lexicon:term-psl',
    text: 'Men on the looksmaxxing forums rate each other on PSL to the decimal and treat the number as destiny.' },
  // The ordinary sense, which typing would have mapped and the phrase route does not.
  { kind: 'ordinary', want: 'lexicon:term-cope',
    text: 'Couples who cope with stress together report higher relationship satisfaction.' },
  { kind: 'ordinary', want: 'lexicon:term-cope',
    text: 'Men who cope badly with rejection tend to withdraw from dating for months.' },
  { kind: 'ordinary', want: 'lexicon:term-psl',
    text: 'He brought her a PSL on their second date and she thought it was sweet.' },
  // And the two that WERE typed, so the gain is pinned next to the refusal.
  { kind: 'concept', want: 'lexicon:term-simp',
    text: 'He was written off as a simp for paying for dinner on the second date.' },
  { kind: 'concept', want: 'lexicon:term-4b',
    text: 'The 4B refusal is cited as proof that women have gone on strike against dating.' },
];

test('slang terms map on the concept sense and not on the ordinary one', async () => {
  for (const probe of SLANG_SENSE_SPLIT) {
    const result = await analyzeDocument(normalizeInput({
      text: probe.text,
      source: { title: 'slang sense probe' },
      createdAt: '1970-01-01T00:00:00.000Z',
    }), canonIndex);
    const matches = result.segments.flatMap((segment) => segment.matches);
    const hit = matches.find((match) => match.canonId === probe.want);
    if (probe.kind === 'concept') {
      assert.ok(hit, `${probe.want} should be reached by "${probe.text}". `
        + `Got ${matches.map((m) => m.canonId).join(', ') || '(nothing)'}`);
    } else {
      assert.equal(hit, undefined,
        `"${probe.text}" uses the ordinary sense and now maps to ${probe.want} at ${hit?.score}. `
        + 'That is the cost typing this alias would have carried, and it is why it was refused.');
    }
  }
});

/*
 * The false positive typing `SMV` buys, frozen rather than hidden.
 *
 * A passage about an unrelated "SMV protocol" now names the SMV concept at 0.54.
 * Worth being precise about who caused it: the gate's dating-market-leverage
 * frame already treats a bare `smv` token as DECISIVE domain evidence
 * (lab-analyzer.js:359), so this passage was retained as relevant before this
 * commit and was always going to be analyzed. What changed is that the SMV
 * entries now match it instead of the passage being retained and mapped to
 * something else.
 *
 * Left in rather than defended against, for two reasons. Suppressing it would
 * mean either un-typing the site's flagship acronym or teaching the matcher a
 * denylist of unrelated SMV expansions, and the triage gate is user-overridable
 * by design — a reader who says this is not about dating can exclude the unit.
 * The frozen case is here so the cost stays visible if anyone revisits it.
 */
test('the cost of typing SMV: an unrelated SMV protocol now names the concept', async () => {
  const offDomain = 'The SMV protocol defines how the sensor module reports voltage to the bus.';
  const document = normalizeInput({
    text: offDomain,
    source: { title: 'SMV collision' },
    createdAt: '1970-01-01T00:00:00.000Z',
  });

  const units = classifyDomainRelevance(detectClaimUnits(document));
  assert.equal(units[0].domainRelevance.status, 'relevant',
    'the gate treats a bare smv token as decisive domain evidence, independent of this commit');

  const result = await analyzeDocument(document, canonIndex);
  const matched = result.segments.flatMap((segment) => segment.matches).map((match) => match.canonId);
  assert.ok(matched.includes('smv:overview'),
    'recorded as the known cost of typing the acronym, not as desired behaviour');

  // The neighbouring senses that DO stay out, and why: no relational frame, so
  // the gate never retains them and the typed alias is never consulted.
  for (const text of [
    'Our LMS tracks every student course completion for the whole department.',
    'The AF/BB connector pinout is documented in appendix four of the manual.',
    'He has real rizz in front of an audience when presenting quarterly numbers.',
  ]) {
    const off = normalizeInput({ text, source: { title: 'off-domain acronym' } });
    const offUnits = classifyDomainRelevance(detectClaimUnits(off));
    assert.ok(offUnits.every((unit) => unit.domainRelevance.status === 'irrelevant'),
      `"${text}" must stay out at the gate — that is what bounds the typed-alias risk`);
    const offResult = await analyzeDocument(off, canonIndex);
    assert.equal(offResult.segments.flatMap((segment) => segment.matches).length, 0);
  }
});

/*
 * A canon entry's words about ITSELF. FIXED 2026-07-30 in v2.6.8, by the route
 * this block's own closing paragraph named a week's worth of measurements ago.
 * The history below is kept verbatim because it is the reason the fix is the
 * shape it is, and because three of the four things tried are still wrong.
 *
 * WHAT SHIPPED: `ENTRY_ARTIFACT_TERMS` in js/lab-analyzer.js removes the site's
 * packaging nouns from the ENTRY's token sets and leaves the passage untouched.
 * The defect below fell 0.434 -> 0.367 — under minCredibleScore, still over
 * minWeakScore, so the passage now surfaces the concept as nearby rather than
 * asserting a credible mapping. Measured over all 21 archived sources: 129
 * displayed matches before, 129 after, none lost and none gained.
 *
 * WHY IT WORKS NOW AND DID NOT THEN, which is the transferable part: every
 * variant below demoted terms into LOW_INFORMATION_MATCH_TERMS. That set feeds
 * `admissionDistinctiveShared` and NOTHING ELSE — an ADMISSION lever that cannot
 * move `sharedWeight`, `queryCoverage`, `canonCoverage` or `distinctiveBoost`.
 * On that lever the nouns bought nothing and only `say*` killed the defect, at a
 * cost of three displayed Pew mappings. On the SCORING lever the nouns alone
 * kill it for free, and `say*` is not needed — so the reported-speech half never
 * comes under threat at all. Same vocabulary, different quantity, opposite
 * answer.
 *
 * ORIGINAL RECORD, 2026-07-30, when this was frozen as a known defect:
 *
 * The site's prose refers to its own artifacts constantly — "the card defines X",
 * "the hub card carries the thesis", "this section records refusals" — and those
 * words sit on the retrieval surface as ordinary content. 132 boundary conditions
 * and 5 misreadings use the register; 71 of those are genuine self-reference.
 *
 * The defect is real. Below, `card` and `says` together carry a CREDIBLE,
 * DISPLAYED match at 0.434 against minCredibleScore 0.43, between a passage about
 * the age of the women men date and an entry about making peace with being alone.
 * Every other shared token is a stopword or already low-information.
 *
 * THREE FIXES WERE MEASURED AND ALL THREE ARE WORSE THAN THE DEFECT.
 *
 * 1. Demote the terms into LOW_INFORMATION_MATCH_TERMS. Causation established by
 *    building each variant, not by re-tokenizing by hand:
 *
 *      card alone .................. defect survives, archive cost 0
 *      artifact nouns only ......... defect survives, archive cost 0
 *      nouns + claim, state, describe  defect survives, archive cost 0
 *      say* alone .................. defect survives, archive cost 3
 *      all of the above ............ defect DIES,     archive cost 3
 *
 *    So `say*` causes the entire cost and the nouns buy nothing on their own; only
 *    the full set kills the defect, and it still pays the 3. Those 3 are displayed
 *    mappings on 01-pew-online-dating, whose prose is full of "women are more
 *    likely to SAY online dating is not safe" — a survey reporting what
 *    respondents said, which is ordinary reported speech and not an artifact
 *    describing itself. One of the three (a romance-scammer entry on a
 *    perceived-safety sentence) was junk anyway; the other two are apt. Trading
 *    two apt credible matches for one constructed case is a bad trade.
 *
 * 2. Reword the register out of the canon. Wrong for a different reason: much of
 *    it is not self-reference at all. "their claim about dating is true" and "a
 *    causal claim about partner outcomes" are ordinary epistemic language, "wild
 *    card" is not even the noun, and "the hub card carries the essay's thesis in
 *    one line; the evidence lives in the essay itself" is real information about
 *    how this site is built. A blanket rewrite deletes that.
 *
 * 3. Do nothing and pretend it is fine. Also wrong, which is why this test exists.
 *
 * Measured benefit of fixing it, on all 21 archived sources: ZERO either way. The
 * archive is 21 PRIMARY sources, so it under-represents the register by
 * construction — a reader pasting commentary about an article is exactly who would
 * write "the card says". That is a reason to keep the finding visible, not a
 * reason to ship a fix that was measured to cost more than it buys.
 *
 * If this is revisited: the promising direction is neither a denylist nor a
 * rewrite, but scoping the demotion to the ENTRY side of the comparison, so an
 * entry describing itself stops contributing while a passage reporting speech is
 * untouched. That was not built.
 */
test('the canon describing itself no longer reaches a reader as a credible match', async () => {
  const passage = 'The card says nothing about whether men who date older women stay longer.';
  const resentment = 'gender-dynamics:male:the-cost-of-staying-true:make-peace-with-it-or-let-resentment-win';
  const document = normalizeInput({
    text: passage,
    source: { title: 'meta-register, fixed in 2.6.8' },
    createdAt: '1970-01-01T00:00:00.000Z',
  });

  const result = await analyzeDocument(document, canonIndex);
  const matches = result.segments.flatMap((segment) => segment.matches);
  const meta = matches.find((match) => match.canonId === resentment);

  assert.equal(meta, undefined,
    'The meta-register defect is back: a passage about the age of the women men date is again a '
    + 'CREDIBLE match for an entry about making peace with being alone, on the words the site '
    + 'uses for its own furniture. Check ENTRY_ARTIFACT_TERMS is still applied to '
    + '`entry._tokens` and `entry._distinctiveTokens`, and that nothing reintroduced those '
    + 'words on the entry side.');

  // The half the fix had to not break, and did not: a passage REPORTING a domain
  // claim still reaches the concept its domain words point at. This is what the
  // rejected admission-side variants cost, and it is asymmetry that protects it —
  // `says` was never removed from anything, and even the entry-side nouns are
  // absent from the passage side entirely, so a reader's own wording cannot be
  // demoted by this change under any circumstances.
  const reported = normalizeInput({
    text: 'She says that women in their thirties get far less attention on dating apps than before.',
    source: { title: 'reported domain claim' },
    createdAt: '1970-01-01T00:00:00.000Z',
  });
  const reportedResult = await analyzeDocument(reported, canonIndex);
  assert.ok(reportedResult.segments.flatMap((segment) => segment.matches).length > 0,
    'a claim someone is quoting must keep reaching its concept — demoting `say` is what cost '
    + 'three displayed mappings on 01-pew-online-dating');

  /*
   * And the passage side, stated as a property rather than left implied: a
   * reader who writes `claim` gets no worse a match than one who does not. If
   * this ever fails, the filter has leaked from `prepareCanonIndex` onto the
   * unit, and the asymmetry that makes the fix free has quietly become a
   * symmetric demotion.
   */
  const readerWords = normalizeInput({
    text: 'The claim that women prefer taller men holds up across every dating app dataset.',
    source: { title: 'reader using the register' },
    createdAt: '1970-01-01T00:00:00.000Z',
  });
  const plainWords = normalizeInput({
    text: 'Women prefer taller men, and it holds up across every dating app dataset.',
    source: { title: 'same claim without it' },
    createdAt: '1970-01-01T00:00:00.000Z',
  });
  const withRegister = await analyzeDocument(readerWords, canonIndex);
  const without = await analyzeDocument(plainWords, canonIndex);
  assert.ok(withRegister.segments.flatMap((segment) => segment.matches).length > 0
    && without.segments.flatMap((segment) => segment.matches).length > 0,
  'a reader writing "the claim that ..." must still reach a concept — ENTRY_ARTIFACT_TERMS is '
  + 'an entry-side filter and must never touch the passage');
});

/*
 * A NUMERAL IS NOT A CONCEPT, AND THE ENGINE CANNOT TELL. Frozen by adjudication.
 *
 * Jason ruled REJECT on 2026-07-30, reversing an ACCEPT of 2026-07-29, for
 * `seg-00025-0dyedk3.claim-02 | statistics:stat-pay-to-play | minCredibleScore`
 * — a Pew sentence about which platform leads among users under 50, displayed as
 * a credible match for an entry about who PAYS for dating apps. It scored 0.432
 * on four loose tokens with no phrase, alias, or signature hit anywhere:
 *
 *   sharedTokens        [online, dat, users, 50]
 *   queryCoverage       0.471      canonCoverage  0.036
 *   phraseHits []  exactAliasHits []  signatureHits []  promotedAliasHits []
 *
 * `50` is the bare integer. The entry's synopsis reports "58% vs 50%"; the
 * passage says "under 50". Two unrelated uses of the same two digits.
 *
 * THREE DISCRIMINATORS WERE MEASURED. ALL THREE ARE REFUSED.
 *
 * 1. Stop counting bare numerals as distinctive. Measured over all 21 archived
 *    sources: of 904 pairs at or above minCredibleScore, 25 share a numeral and
 *    23 of those have no phrase/alias anchor. But the STRONGEST of the 23 are
 *    correct matches in which the numeral is the entry's own statistic —
 *
 *      0.634  stat-pay-to-play   "...paid for these sites and apps (41% vs. 29%)"
 *      0.638  satisfaction-flywheel  "...eight assessments of sexual and marital
 *                                     satisfaction from 207 newlywed couples..."
 *      0.564  stat-marriage-age  "median age at first marriage rose from 23.2..."
 *
 *    On a statistics page the digits ARE the evidence. Banning them costs the
 *    best matches in the set to remove the worst, and only 2 of the 23 rest on
 *    two or fewer non-numeric tokens besides.
 *
 * 2. Require more canonCoverage. It does not separate them. The bands overlap
 *    exactly where it matters: the correct 0.634 row sits at cc=0.087 and the
 *    coincidental 0.456 row sits at cc=0.087 too. This defect is at cc=0.036,
 *    the lowest of the 23, but there is no line that keeps 0.076 and drops 0.036
 *    without being fitted to these three cases.
 *
 * 3. Exclude numerals from `admissionDistinctiveShared`. Would not move this pair
 *    at all: it drops from 3 tokens to 2, and `minAdmissionDistinctiveShared` is
 *    2. Checked before proposing, which is why it is not proposed.
 *
 * So the ruling is recorded and the behavior is frozen, per the sheet's own rule
 * that a REJECT becomes a pinned outcome and a written cost rather than a
 * threshold change. The passages below are AUTHORED — `lab-corpus/` is
 * gitignored third-party text (md/RERUN.md §1) and the adjudicated sentence
 * stays in the sweep fixture as IDs and scores.
 *
 * Record: md/lab-numeral-coincidence.md
 */
test('a shared numeral can carry an unrelated statistic to a credible match', async () => {
  const document = normalizeInput({
    text: 'Online dating users spend about 50 minutes a day inside these apps.',
    source: { title: 'numeral coincidence, frozen' },
    createdAt: '1970-01-01T00:00:00.000Z',
  });
  const result = await analyzeDocument(document, canonIndex);
  const match = result.segments.flatMap((segment) => segment.matches)
    .find((row) => row.canonId === 'statistics:stat-pay-to-play');

  assert.ok(match, 'The defect no longer reproduces. If that was deliberate, say which of the '
    + 'three measured discriminators was adopted and what it cost — the reasoning above is the '
    + 'only record of the measurement, and Jason ruled REJECT on the real pair expecting it to '
    + 'stay visible.');
  assert.ok(match.score >= SCORING_CONFIG.minCredibleScore,
    `frozen at credible: ${match.score}. A claim about screen time is not a claim about who pays.`);

  /*
   * Not specific to one entry, which is the part that makes it a defect in the
   * scoring surface rather than a defect in one synopsis: a sentence about
   * services launching reaches a DIVORCE statistic.
   */
  const elsewhere = normalizeInput({
    text: 'Roughly 50 new online dating services launched last year, and most users never heard of them.',
    source: { title: 'numeral coincidence, second entry' },
    createdAt: '1970-01-01T00:00:00.000Z',
  });
  const elsewhereResult = await analyzeDocument(elsewhere, canonIndex);
  assert.ok(elsewhereResult.segments.flatMap((segment) => segment.matches)
    .some((row) => row.canonId === 'statistics:stat-divorce'),
  'the second half of the finding stopped reproducing; re-measure before deleting it');
});
