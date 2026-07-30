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
assert.equal(index.stats.conceptCount, 469);
assert.equal(index.stats.sourceCount, 19);
assert.deepEqual(index.stats.byCategory, {
  'Deep Dives': 35,
  'Five Levers': 35,
  'Gender Dynamics': 133,
  Instruments: 5,
  Lexicon: 83,
  'Love Hierarchy': 41,
  Mythbuster: 65,
  'Pill Dossiers': 12,
  'Rules & Frameworks': 29,
  Statistics: 31,
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
assert.equal(index.entries.filter((entry) => entry.commonMisreadings.length).length, 469);
// Boundaries lag misreadings by design: 12 tranche-3 targets already carried a
// hand-authored boundary, and 6 entries carry a misreading alone because a second
// boundary would only add retrieval mass to the same entry.
assert.equal(index.entries.filter((entry) => entry.boundaryConditions.length).length, 463);

assert.match(required('hierarchy:overview').synopsis, /three-tier funnel/i);
assert.equal(required('smv:looks').title, 'Looks');
assert.equal(required('frameworks:conversion-ladder').anchor, 'conversion-ladder');
assert(required('frameworks:conversion-ladder').related.includes('frameworks:interaction-gate'));
assert.equal(required('gender-dynamics:gd-hell-yes').anchor, 'gd-hell-yes');
assert.equal(required('statistics:stat-relationship-quality').sourceLinks.length, 2);
assert.equal(required('M-TBD-10').title, 'Never go to bed angry.');
assert.match(required('pills:page-blk').synopsis, /constraint awareness/i);
assert(required('lexicon:term-smv-sexual-market-value').aliases.includes('SMV'));
assert(required('deep-dive:relationships-throughout-history').related.includes('frameworks:the-wall'));

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
assert.equal(typedEntries.length, 6, 'Unexpected number of entries carrying alias typing');
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
 * And the four left dead on purpose. `game`, `Wall` and `Sham` are ordinary
 * English words under minSingleAliasLength, which is the shape that produced the
 * `provider` defect; each concept is reached anyway through the token surface
 * (measured in lab-match-behavior.test.mjs), so typing them would buy
 * false-positive risk for no measured recall. Pinned so reviving one is a
 * decision rather than a drift.
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
