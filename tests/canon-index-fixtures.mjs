#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT_DIR, buildCanonIndex, extractJsArray } from '../scripts/build-canon-index.mjs';

const index = await buildCanonIndex({ generatedAt: 'fixture' });
const entries = new Map(index.entries.map((entry) => [entry.id, entry]));

function required(id) {
  const entry = entries.get(id);
  assert(entry, `Expected extracted canon concept ${id}`);
  return entry;
}

assert.equal(index.schemaVersion, 'le-canon-index/1.1');
assert.equal(index.stats.conceptCount, 566);
assert.equal(index.stats.sourceCount, 21);
assert.deepEqual(index.stats.byCategory, {
  'Deep Dives': 47,
  'Five Levers': 35,
  'Gender Dynamics': 133,
  Instruments: 5,
  Lexicon: 98,
  'Love Hierarchy': 41,
  Mythbuster: 65,
  'Pill Dossiers': 28,
  'Rules & Frameworks': 63,
  Statistics: 51,
});

/*
 * Match-surface coverage, pinned because it is the thing three overlay tranches
 * were for and nothing else in the suite would notice it disappearing.
 * `commonMisreadings` is the field the Contradicts branch reads: before tranche 2
 * the branch was dark on 132 of 133 Gender Dynamics cards, 36 of 41 Love
 * Hierarchy factors, all 35 Deep Dive entries and 27 of 31 charts. A harvester or
 * overlay regression that dropped them would leave the canon still valid, still
 * 469 concepts, and unable to disagree with anything.
 *
 * Iterated over EVERY category rather than the four tranche 2 covered — tranche 3
 * closed the rest, so naming four would now be a weaker assertion wearing a
 * specific one's clothes. Kept as a per-category loop rather than folded into the
 * total below, because a failure that names the category is worth more than a
 * failure that names a number, and a total can quietly pass when 234 misreadings
 * are replaced by 234 somewhere else.
 */
for (const category of [...new Set(index.entries.map((entry) => entry.category))].sort()) {
  const inCategory = index.entries.filter((entry) => entry.category === category);
  const dark = inCategory.filter((entry) => !entry.commonMisreadings.length);
  assert.equal(dark.length, 0,
    `${category}: ${dark.length} of ${inCategory.length} entries carry no commonMisreading, so `
    + `the Contradicts branch is dark for them (first: ${dark[0]?.id})`);
}
/*
 * ZERO. Tranche 3 closed the backlog on 2026-07-30: every concept in the canon
 * carries a commonMisreading, so the Contradicts branch is live for all of them.
 *
 * This is now the strongest of the three assertions and the one to keep. It
 * started at 100 of 463 before tranche 1, and the three tranches plus the
 * cultural-register doctrine took it to 469 of 469. A new entry authored without
 * a misreading fails here rather than quietly re-opening the gap — which is the
 * whole reason to state it as zero rather than as a count that happens to match.
 */
assert.equal(index.entries.filter((entry) => !entry.commonMisreadings.length).length, 0,
  'Every canon entry must be able to disagree with a reader. An entry with no '
  + 'commonMisreading has a dark Contradicts branch; author one, per the contract in '
  + 'md/lab-overlay-tranche3.md.');
assert.equal(index.entries.filter((entry) => entry.commonMisreadings.length).length, 566);
// Boundaries lag misreadings by design: 12 tranche-3 targets already carried a
// hand-authored boundary, and 6 entries carry a misreading alone because a second
// boundary would only add retrieval mass to the same entry. The 2026-07-31 pills
// expansion widened the lag: 11 of its 13 new dossier entries took the misreading
// alone, and the 9 new charts likewise, so the gap is 17 rather than 8.
// Harvest #2 and media loop 03 each added four concepts with both fields,
// preserving that gap, and the 2026-08-06 pressure-test batches (04 and 05)
// added three more each with both fields, and pressure test 06 added the gray
// divergence, the delegation boundary, and the border bundle, each with both.
assert.equal(index.entries.filter((entry) => entry.boundaryConditions.length).length, 533);

assert.match(required('hierarchy:overview').synopsis, /three-tier funnel/i);
assert.equal(required('smv:looks').title, 'Looks');
assert.equal(required('frameworks:conversion-ladder').anchor, 'conversion-ladder');
assert(required('frameworks:conversion-ladder').related.includes('frameworks:interaction-gate'));
assert.equal(required('gender-dynamics:gd-hell-yes').anchor, 'gd-hell-yes');
assert.equal(required('statistics:stat-relationship-quality').sourceLinks.length, 3);
assert.equal(required('M-TBD-10').title, 'Never go to bed angry.');
assert.match(required('pills:page-blk').synopsis, /constraint awareness/i);
assert(required('lexicon:term-smv-sexual-market-value').aliases.includes('SMV'));
assert(required('deep-dive:relationships-throughout-history').related.includes('frameworks:the-wall'));
assert.equal(required('frameworks:desire-state-split').sourceLinks.length, 3);
assert.equal(required('frameworks:ownership-load').sourceLinks.length, 3);
assert(required('frameworks:ownership-load').related.includes('statistics:stat-equal-earner-labor'));
assert(required('lexicon:term-desire').dependencies.includes('frameworks:desire-state-split'));
assert(required('lexicon:term-the-ownership-load').dependencies.includes('frameworks:ownership-load'));
assert(required('lexicon:term-living-apart-together-lat').aliases.includes('LAT'));
assert(required('lexicon:term-living-apart-together-lat').dependencies.includes('deep-dive:relationships-throughout-history:great-unbundling'));
assert.equal(required('frameworks:agreement-surface').sourceLinks.length, 3);
assert(required('frameworks:agreement-surface').aliases.includes('relationship agreement surface'));
assert.equal(required('frameworks:financial-architecture-split').sourceLinks.length, 2);
assert(required('frameworks:financial-architecture-split').related.includes('frameworks:agreement-surface'));
// 2026-08-06 pressure-test batch: three sub-entries filling the gaps five fresh
// articles exposed. Each must keep its parent dependency, its authored match
// surface, and its primary sources.
assert(required('frameworks:meeting-channel').dependencies.includes('frameworks:search-cost'));
assert(required('frameworks:meeting-channel').aliases.includes('how couples meet'));
assert.equal(required('frameworks:meeting-channel').sourceLinks.length, 3);
assert(required('frameworks:ideological-filter').dependencies.includes('frameworks:sex-ratio'));
assert(required('frameworks:ideological-filter').aliases.includes('political sorting'));
assert.equal(required('frameworks:ideological-filter').sourceLinks.length, 3);
assert(required('frameworks:diagnostic-turn').dependencies.includes('frameworks:virality-filter'));
assert(required('frameworks:diagnostic-turn').aliases.includes('attachment styles'));
// "therapy speak" carries the concept; the hyphenated "therapy-speak" is REFUSED
// as a surface: normalizeText keeps the hyphen while tokenize splits it, so a
// hyphenated alias is a dead single token and a hyphenated phrase can never
// substring-match either spelling. Measured 2026-08-06 (pressure test 04); the
// engine-side fix is a future task, not an authoring workaround.
assert(required('frameworks:diagnostic-turn').aliases.includes('therapy speak'));
assert(!required('frameworks:diagnostic-turn').aliases.includes('therapy-speak'));
assert.equal(required('frameworks:diagnostic-turn').sourceLinks.length, 3);
// 2026-08-06 pressure-test 05 batch: three sub-entries from the parallel
// Claude+ChatGPT run (md/pt05/). Same contract as the batch above: parent
// dependency, authored match surface, primary sources.
assert(required('frameworks:marriage-bar').dependencies.includes('frameworks:readiness-gate'));
assert(required('frameworks:marriage-bar').aliases.includes('capstone marriage'));
assert.equal(required('frameworks:marriage-bar').sourceLinks.length, 4);
assert(required('frameworks:market-maker-cut').dependencies.includes('frameworks:search-cost'));
assert(required('frameworks:market-maker-cut').aliases.includes('paywalled matches'));
assert.equal(required('frameworks:market-maker-cut').sourceLinks.length, 1);
assert(required('frameworks:costless-exit').dependencies.includes('frameworks:third-party-layer'));
assert(required('frameworks:costless-exit').aliases.includes('ghosting'));
assert(required('frameworks:costless-exit').aliases.includes('breadcrumbing'));
assert.equal(required('frameworks:costless-exit').sourceLinks.length, 2);
assert(required('frameworks:support-portfolio').dependencies.includes('frameworks:third-party-layer'));
assert(required('frameworks:support-portfolio').aliases.includes('mankeeping'));
assert.equal(required('frameworks:support-portfolio').sourceLinks.length, 6);
assert.equal(required('frameworks:co-transition').sourceLinks.length, 2);
assert.equal(required('statistics:stat-shared-positive-affect').sourceLinks.length, 1);
assert(required('statistics:stat-shared-positive-affect').aliases.includes('Shared Positivity Dividend'));

// deep-dive.html wraps each hub card in `<a class="dd-feature" href=...>`, so the
// href sits on the harvested node itself rather than under it. `linkData` walked
// descendants only and every hub entry harvested with an empty relation set; a
// hub whose whole job is pointing at its essay pointed nowhere.
for (const hub of index.entries.filter((entry) => entry.id.startsWith('deep-dive:hub:'))) {
  const essayId = hub.id.replace('deep-dive:hub:', 'deep-dive:');
  assert(
    hub.dependencies.includes(essayId),
    `${hub.id} lost the link to the essay it exists to announce`,
  );
}
assert.match(required('instrument:smv-calculator').synopsis, /Looks, Money, Status, Charm, and Exposure/);

for (const entry of index.entries) {
  const textFields = [entry.title, entry.synopsis, ...entry.aliases, ...entry.phrases];
  assert(
    textFields.every((text) => !/&[A-Za-z][A-Za-z0-9]+;/.test(text)),
    `${entry.id} contains an undecoded named HTML entity`,
  );
}

// A Mythbuster ruling badge ("Holds up", "Oversimplified") is what the canon
// CONCLUDED about a claim, not a name a source would use for the concept. It is
// recorded on its own `verdict` field and must never re-enter the analyzer's
// match surface, where it made every verdict-shaped sentence look like a hit.
const mythbusterSource = await fs.readFile(path.join(ROOT_DIR, 'js/mythbuster.js'), 'utf8');
const badges = new Set(
  extractJsArray(mythbusterSource, 'const ENTRIES').map((item) => item.ruling?.badge).filter(Boolean),
);
assert(badges.size >= 40, `Expected a populated Mythbuster badge set, found ${badges.size}`);

const mythbuster = index.entries.filter((entry) => entry.category === 'Mythbuster');
assert.equal(mythbuster.length, 65, 'Unexpected Mythbuster entry count');
for (const entry of mythbuster) {
  assert(entry.verdict, `${entry.id} lost its ruling verdict`);
  assert(badges.has(entry.verdict), `${entry.id}.verdict is not a ruling badge: ${entry.verdict}`);
}
for (const entry of index.entries) {
  for (const alias of entry.aliases) {
    assert(!badges.has(alias), `${entry.id} carries verdict badge "${alias}" as a match alias`);
  }
  if (entry.category !== 'Mythbuster') {
    assert.equal(entry.verdict, '', `${entry.id} carries a verdict outside the Mythbuster docket`);
  }
}

// Alias typing (schema 1.1). Typing is a statement ABOUT the match surface, so
// it can only name strings that are on it; a typed alias that is not an alias
// would silently do nothing, which is the failure mode worth a fixture.
const typedEntries = index.entries.filter(
  (entry) => entry.standaloneAliases.length || entry.contextualAliases.length,
);
assert.equal(typedEntries.length, 8, 'Unexpected number of entries carrying alias typing');
assert.deepEqual(required('frameworks:smv-matching').standaloneAliases, ['hypergamy']);
/*
 * Four acronym-or-slang aliases typed because minPhraseLength and
 * minSingleAliasLength were discarding them before matching ran. `SMV` is three
 * characters, so it never entered entry._phrases at all — the site's own flagship
 * acronym could not fire the phrase path on either entry that carries it. Typing
 * routes them through promotedAliases, which reads entry._singleTokenAliases and
 * applies no length filter, and standalone is bounded by the gate: it means
 * "present in an ALREADY RETAINED relationship-domain passage".
 */
assert.deepEqual(required('smv:overview').standaloneAliases, ['SMV']);
assert.deepEqual(required('lexicon:term-smv-sexual-market-value').standaloneAliases, ['SMV']);
assert.deepEqual(required('lexicon:term-lms-looks-money-status').standaloneAliases, ['LMS']);
assert.deepEqual(required('smv:charm').standaloneAliases, ['rizz']);
/*
 * Two more, added 2026-07-30 after md/lab-constants-audit.md found that the
 * length floor silences twelve untyped single-word aliases and only four had
 * ever been ruled on. These are the two of the remaining eight where typing is
 * the right instrument, each measured against authored probes because all four
 * words are effectively absent from the 21-source archive — it is academic and
 * journalistic prose and these are forum terms.
 *
 *   simp   +1 intent probe, 0 false positives. The only collision available in
 *          English is a fabricated protocol name, which the gate discards.
 *   4B     already credible at 0.515 through token overlap; typing makes the
 *          bare acronym a phrase hit rather than a coincidence, at 0 cost.
 */
assert.deepEqual(required('lexicon:term-simp').standaloneAliases, ['simp']);
assert.deepEqual(required('lexicon:term-4b').standaloneAliases, ['4B']);
/*
 * And the ones left dead on purpose. `game`, `Wall` and `Sham` are ordinary
 * English words under minSingleAliasLength, which is the shape that produced the
 * `provider` defect; each concept is reached anyway through the token surface
 * (measured in lab-match-behavior.test.mjs), so typing them would buy
 * false-positive risk for no measured recall. Pinned so reviving one is a
 * decision rather than a drift.
 *
 * `cope` and `PSL` join them with a measurement rather than by analogy, and the
 * measurement is the interesting part — see md/lab-slang-alias-typing.md:
 *
 *   cope   standalone maps all three ordinary-English probes at 0.540,
 *          including "Couples who cope with stress together report higher
 *          relationship satisfaction." CONTEXTUAL IS NOT A SAFER STANDALONE
 *          HERE: relationalCoFire promotes on a role term within eight tokens,
 *          and the two survivors are promoted by "men" and "couples" — the two
 *          commonest role nouns in the domain.
 *   PSL    standalone maps a pumpkin spice latte, and buys one fewer intent hit
 *          than the phrase route does.
 *
 * Both are reached instead by multi-word aliases, which need no typing and
 * cannot collide with the ordinary sense: English separates the two
 * grammatically, since the verb takes a complement ("cope with") and the noun is
 * a predicate or object ("is cope", "as cope"). cope 3/4 intent and 0/3 false
 * positives; PSL 2/2 and 0/2.
 */
for (const [id, alias] of [
  ['smv:charm', 'game'],
  ['frameworks:the-wall', 'Wall'],
  ['lexicon:term-the-wall', 'Wall'],
  ['lexicon:term-the-sham', 'Sham'],
]) {
  const entry = required(id);
  assert(entry.aliases.includes(alias), `${id} still lists "${alias}"`);
  assert(!entry.standaloneAliases.includes(alias) && !entry.contextualAliases.some((item) => item.alias === alias),
    `"${alias}" on ${id} is left untyped deliberately — it is ordinary English under the length floor`);
}
/*
 * And the last four, ruled 2026-07-30, which closes the list
 * md/lab-constants-audit.md opened. All four are TITLE-derived — none of these
 * entries carries a single authored alias — so the bare word reaches
 * _singleTokenAliases from the title and dies at minSingleAliasLength.
 *
 * Unlike cope/simp/4B/PSL these words are common in the archive, so the archive
 * IS the right population here. Typed standalone across all 21 sources:
 * displayed credible 1,093 -> 1,166, +75 and -2, and on inspection NOT ONE of
 * the 75 is right. Each fails differently, which is the part worth keeping:
 *
 *   face  +5   HOMONYM, the verb. Every archive gain is "women tended to FACE a
 *              relative abundance of men" or "in the FACE of a male surplus".
 *   body  +1   HOMONYM, the collective noun: "this entire BODY of research".
 *   game  +1   HOMONYM, the adjective: Dan Savage's "good, giving, and GAME".
 *   age   +68  NOT A HOMONYM, and a failure shape this record did not have. In
 *              a corpus of quantitative social science `age` is a MEASUREMENT
 *              AXIS every dataset breaks out — "varies by income, age and
 *              education", "assessed at about age 21 years". Its presence says
 *              nothing about whether the passage makes a claim about age, so it
 *              cannot carry the concept even though it means exactly what the
 *              concept is about.
 *
 * The -2 matters too: the new 0.540 hits displaced two correct matches through
 * maxMatchesPerClaim, so typing cost real coverage as well as buying noise.
 *
 * `body` and `game` are reached without their alias anyway (0.852 and 0.690 on
 * probes that make the claim), so their dead alias is free. `face` and `age` are
 * NOT — they need a match surface, which is tranche work and not typing.
 */
for (const [id, bare] of [
  ['smv:looks:face', 'Face'],
  ['smv:looks:body', 'Body'],
  ['smv:looks:age', 'Age'],
  ['lexicon:term-game', 'Game'],
]) {
  const entry = required(id);
  assert.equal(entry.aliases.length, 0,
    `${id} has gained an alias. It had none, so the bare "${bare}" comes from its TITLE — `
    + 'read the block above before adding one.');
  assert.equal(entry.standaloneAliases.length + entry.contextualAliases.length, 0,
    `${id} now types an alias. Typing "${bare}" was measured across all 21 sources and added 75 `
    + 'credible matches of which none were right, while displacing two that were.');
}
for (const [id, bare, phrase] of [
  ['lexicon:term-cope', 'cope', 'is cope'],
  ['lexicon:term-psl', 'PSL', 'on PSL'],
]) {
  const entry = required(id);
  assert.equal(entry.standaloneAliases.length + entry.contextualAliases.length, 0,
    `${id} now types an alias. "${bare}" was ruled untypeable on measurement, not on taste — `
    + 'read the block above before reviving it.');
  assert(!entry.aliases.includes(bare),
    `${id} lists the bare "${bare}" as an alias. Untyped it is inert (under minSingleAliasLength), `
    + 'so it only ever becomes live by someone typing it — which is the decision this pins against.');
  assert(entry.aliases.includes(phrase),
    `${id} lost "${phrase}", which is how the concept is reached instead of by typing.`);
}
/*
 * The cultural-register doctrine, pinned by id because it exists for a measured
 * reason and a lexicon.html edit is all it would take to remove it. Before it
 * landed, the gate admitted cultural-register passages (option 1, ab62871) and
 * the canon had nothing to map them to: of 24 labelled claims, 8 were admitted
 * and only 3 reached a canon entry.
 *
 * `heteropessimism` and `feminization` carry a BARE-WORD alias, which the four
 * cases above are pinned for NOT doing. The difference is distinctiveness, not
 * length: `game` and `Wall` are ordinary English that happens to name a concept,
 * while these two words occur in general prose only when the concept is the
 * subject. Both clear minSingleAliasLength on their own, so neither needs
 * typing — and each is load-bearing, since a single-word title generates no
 * alias and the term could not otherwise reach the exact-phrase surface.
 */
for (const [id, title, alias] of [
  ['lexicon:term-heteropessimism', 'Heteropessimism', 'heteropessimism'],
  ['lexicon:term-the-feminine-reality', 'The feminine reality', 'feminine reality'],
  ['lexicon:term-feminization', 'Feminization', 'feminization'],
  /*
   * The consumer-unit concept, added 2026-07-30. It was the one reader-visible
   * loss the cultural-register merge left: 04-heteropessimism argues about
   * marital consumption and the couple as the unit advertising was aimed at,
   * and the canon could only approximate that with smv:multiplier:market.
   *
   * Its alias is a PHRASE, not a bare word, and deliberately so — `consumer` and
   * `unit` are both ordinary English, and only the pair names the concept. That
   * also makes it a gate surface under option 2a, which is how the three
   * previously unrescued claims reach a reader at all.
   */
  ['lexicon:term-the-consumer-unit', 'The consumer unit', 'consumer unit'],
]) {
  const entry = required(id);
  assert.equal(entry.title, title);
  assert(entry.aliases.includes(alias), `${id} reaches the phrase surface through "${alias}"`);
  assert.equal(entry.commonMisreadings.length, 1, `${id} can disagree with a reader`);
  assert.equal(entry.boundaryConditions.length, 1, `${id} states where it stops`);
}
// The three Frameworks sub-models that had no term-spine entry. Every other
// frameworks.html anchor was referenced by some LEX row; these three were the
// harvest gap. Asserted on the RESOLVED dependency rather than on the href,
// because a row can link a page that has no such anchor and still look right —
// resolution to a canon id is the part that proves the spine connects.
for (const [id, dependency] of [
  ['lexicon:term-looks-rating-support-resistance', 'frameworks:looks-rating'],
  ['lexicon:term-the-matching-curve', 'frameworks:matching-curve'],
  ['lexicon:term-the-option-pool', 'frameworks:option-pool'],
]) {
  assert(required(id).dependencies.includes(dependency),
    `${id} resolves to ${dependency}`);
}

assert.deepEqual(
  required('smv:money:provisioning-signal').contextualAliases.map((item) => item.alias),
  ['provider', 'breadwinner'],
);
assert(
  required('smv:money:provisioning-signal').contextualAliases[0].notAfter.includes('cloud'),
  'The `provider` alias keeps its disqualifying modifiers',
);
for (const entry of index.entries) {
  const aliases = new Set(entry.aliases);
  const typed = [...entry.standaloneAliases, ...entry.contextualAliases.map((item) => item.alias)];
  assert.equal(new Set(typed).size, typed.length, `${entry.id} types an alias twice`);
  for (const alias of typed) {
    assert(aliases.has(alias), `${entry.id} types "${alias}" but it is not one of its aliases`);
    assert(!badges.has(alias), `${entry.id} types verdict badge "${alias}" as an alias`);
    // Typing only reaches single-token aliases: the analyzer's promotion pass
    // iterates the alias list filtered to entries with no space in them, so a
    // multiword typed alias is never consulted. It is not wrong in the way a
    // bad rule is wrong — it is inert, which is worse, because it reads as a
    // rule that works. Multiword aliases already match as phrases.
    assert(!/\s/.test(alias.trim()),
      `${entry.id} types multiword alias "${alias}", which the promotion pass never sees`);
  }
}

process.stdout.write(
  `Canon extraction fixtures passed for ${index.stats.conceptCount} concepts across `
  + `${index.stats.sourceCount} sources (${mythbuster.length} verdicts off the match surface, `
  + `${typedEntries.length} entries with typed aliases).\n`,
);
