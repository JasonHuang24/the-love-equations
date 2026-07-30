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
    // What `carries` RETURNS, as opposed to which branches would fire: the first
    // modifier in denylist order matched by any test, because the real helper is a
    // `.find` over modifiers with the three tests inside it. This is the value the
    // analyzer puts in its trace, so it is the value that ties this replica to the
    // shipped code rather than merely agreeing with it about the outcome.
    firstHit: DENYLIST_ENTRIES
      .find((m) => literal(m) || substring(m) || stemRun(m)) || null,
  };
}

const BRANCH_TABLE = [
  {
    tokens: ['health', 'caregivers'],
    literal: [], substring: ['health care'], stemRun: [], firstHit: 'health care',
    note: 'bl-17. The spanned-word shape §2 claimed had been removed. Only the substring test sees it.',
  },
  {
    tokens: ['health', 'care'],
    literal: ['care'], substring: ['health care'], stemRun: ['health care', 'care'], firstHit: 'health care',
    note: 'bl-19 territory. All three tests see it, which is why dropping the substring test is safe '
      + 'here — the stem run and the single-word `care` entry both still catch it.',
  },
  {
    tokens: ['healths', 'care'],
    literal: ['care'], substring: [], stemRun: ['health care', 'care'], firstHit: 'health care',
    note: 'Refutes the SUBSTRING lemma: `healths` strips to `health`, so `health care` never appears '
      + 'as a substring while the stem run matches. It does NOT establish decisiveness — the '
      + 'single-word `care` entry fires literally, so an earlier branch would have caught it anyway.',
  },
  {
    tokens: ['healthfulness', 'carefulness'],
    literal: [], substring: [], stemRun: ['health care', 'care'], firstHit: 'health care',
    note: "Sol's counterexample, and the row that does the real work. Suffixing BOTH words is what "
      + 'takes every earlier branch out of play, which is why the double suffix was not decoration.',
  },
  {
    tokens: ['childfulness', 'carefulness'],
    literal: [], substring: [], stemRun: ['care', 'child care'], firstHit: 'care',
    note: 'The other multiword entry, decisive the same way, so the reachability is a property of '
      + "the branch and not of one entry's spelling.",
  },
  {
    tokens: ['healths', 'careers'],
    literal: [], substring: [], stemRun: ['health care', 'care'], firstHit: 'health care',
    note: 'One ordinary plural and one ordinary noun, both stripped by the same rules. The cheapest '
      + 'decisive sequence found.',
  },
];

test('the three branches of carries(), enumerated rather than argued', () => {
  BRANCH_TABLE.forEach(({ tokens, literal, substring, stemRun, firstHit, note }) => {
    const observed = branchesFor(tokens);
    const label = tokens.join(' ');
    // All THREE branches are asserted. The first version of this test declared
    // `literal` and never checked it, so that column could have said anything —
    // which matters, because `literal` is exactly what makes `healths care`
    // non-decisive, and that is the correction this table exists to record.
    assert.deepEqual(observed.literal, literal, `[${label}] literal branch — ${note}`);
    assert.deepEqual(observed.substring, substring, `[${label}] substring branch — ${note}`);
    assert.deepEqual(observed.stemRun, stemRun, `[${label}] stem-run branch — ${note}`);
    assert.equal(observed.firstHit, firstHit,
      `[${label}] carries() returns the FIRST matching modifier in denylist order, and the analyzer `
      + `puts it in its trace. Expected "${firstHit}", replica says "${observed.firstHit}".`);
  });

  // The claim the two retracted paragraphs both got wrong, stated as an assertion:
  // there is at least one token sequence the stem run disqualifies and the earlier
  // two tests do not. If this ever becomes false, the branch has gone inert and the
  // correction blocks in md/lab-v2.6.1-release.md §2 need revisiting again.
  const decisive = BRANCH_TABLE
    .filter(({ tokens }) => {
      const { literal, substring, stemRun } = branchesFor(tokens);
      return stemRun.length && !literal.length && !substring.length;
    })
    .map(({ tokens }) => tokens.join(' '));

  // WHICH sequences are decisive, not how many. A count is satisfied by any three
  // rows, so it would survive the decisive set drifting off the double-suffix shape
  // that is the whole point of the refutation.
  assert.deepEqual(decisive, [
    'healthfulness carefulness',
    'childfulness carefulness',
    'healths careers',
  ], 'These three sequences, and only these, are decisive by stem run alone — no literal hit and no '
    + 'substring hit. §2 asserted the branch was decisive for NONE. If this set empties the branch has '
    + 'gone inert and the correction blocks in md/lab-v2.6.1-release.md §2 need revisiting a third '
    + 'time; if it changes shape, the refutation has moved and §2 should say so.');
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

  for (const { tokens, firstHit } of BRANCH_TABLE) {
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
    assert.equal(trace.reason, `technical modifier “${firstHit}” within 3 tokens`,
      `"${complement}" must be refused by modifier “${firstHit}”, the first match in denylist `
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
 * md/lab-v2.6.1-release.md §3 published this enumeration twice as "enumerated
 * over all sixteen entries" and it was wrong twice — first naming `pays`, which
 * does not match, and omitting six surfaces; then omitting `carefulness` and
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
  assert.equal(census.schema, 'le-lab.denylist-census/1.0');
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
      assert.equal(row.newlyReached.length + row.reachedButUnattested.length, 0,
        `[${row.entry}] is multiword, so its widening belongs to the branch truth table.`);
      assert.ok(row.note && /truth table|decisive/u.test(row.note),
        `[${row.entry}] must point at where its widening IS recorded.`);
      return;
    }

    const generated = mechanicalCandidates(row.entry, row.stem);
    const ruled = [...row.newlyReached, ...row.reachedButUnattested].sort();

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
    row.newlyReached.forEach((word) => {
      assert.equal(stemOf(word), row.stem,
        `[${row.entry}] claims "${word}" is newly reached, but it stems to "${stemOf(word)}".`);
      assert.ok(word !== row.entry && word !== `${row.entry}s`,
        `[${row.entry}] claims "${word}" is NEWLY reached, but the literal tests already reach it.`);
    });
  });
});

test('the census records the surfaces the release report names, and pays is not one of them', () => {
  const reached = new Map(census.entries.map((row) => [row.entry, row.newlyReached]));

  // The corrections Sol's two reviews produced, pinned so they cannot quietly regress.
  assert.ok(reached.get('care').includes('careers'), '`careers` reaches `care` — first review.');
  assert.ok(reached.get('service').includes('serviceable'), '`serviceable` reaches `service`.');
  assert.ok(reached.get('care').includes('carefulness'), '`carefulness` reaches `care` — second review.');
  assert.ok(reached.get('medical').includes('medicalization'), '`medicalization` reaches `medical`.');
  assert.ok(reached.get('hosting').includes('hostable'), '`hostable` reaches `host` — third review.');
  assert.ok(reached.get('network').includes('networkable'), '`networkable` reaches `network`.');

  // And the word the first census named that never matched at all.
  assert.equal(stemOf('pays'), 'pays',
    '`pays` is below minStemmableLength and returns unstemmed; if this ever changes the census and '
    + 'the report both need rewriting.');
  assert.ok(!reached.get('payment').includes('pays'),
    '`pays` does not reach `payment` and must not be listed as though it does.');
  assert.equal(stemOf('paid'), 'paid', '`paid` is irregular and no suffix rule reaches it.');
});

test('every candidate in the census is REACHED, attested or not', () => {
  // The half of this fixture that is mechanical rather than judged. `rejected` was
  // the old name for the second field and it read as "not reached", which is what
  // let three review rounds argue about word calls as though they bounded what the
  // comparison catches. They never did: both fields are reached surfaces.
  census.entries.filter((row) => !row.multiword).forEach((row) => {
    [...row.newlyReached, ...row.reachedButUnattested].forEach((word) => {
      assert.equal(stemOf(word), row.stem,
        `[${row.entry}] "${word}" is listed in this census, so the shipped comparison must reach it `
        + `— it stems to "${stemOf(word)}" and the entry stems to "${row.stem}". A candidate that `
        + 'does not stem-match belongs in neither field.');
    });
  });
});
