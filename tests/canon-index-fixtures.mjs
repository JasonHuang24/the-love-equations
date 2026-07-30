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
assert.equal(index.stats.conceptCount, 463);
assert.equal(index.stats.sourceCount, 19);
assert.deepEqual(index.stats.byCategory, {
  'Deep Dives': 35,
  'Five Levers': 35,
  'Gender Dynamics': 133,
  Instruments: 5,
  Lexicon: 77,
  'Love Hierarchy': 41,
  Mythbuster: 65,
  'Pill Dossiers': 12,
  'Rules & Frameworks': 29,
  Statistics: 31,
});

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
assert.equal(typedEntries.length, 2, 'Unexpected number of entries carrying alias typing');
assert.deepEqual(required('frameworks:smv-matching').standaloneAliases, ['hypergamy']);
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
