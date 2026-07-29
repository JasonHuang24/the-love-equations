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

assert.equal(index.schemaVersion, 'le-canon-index/1.0');
assert.equal(index.stats.conceptCount, 450);
assert.equal(index.stats.sourceCount, 19);
assert.deepEqual(index.stats.byCategory, {
  'Deep Dives': 35,
  'Five Levers': 35,
  'Gender Dynamics': 133,
  Instruments: 5,
  Lexicon: 71,
  'Love Hierarchy': 41,
  Mythbuster: 65,
  'Pill Dossiers': 12,
  'Rules & Frameworks': 22,
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

process.stdout.write(
  `Canon extraction fixtures passed for ${index.stats.conceptCount} concepts across `
  + `${index.stats.sourceCount} sources (${mythbuster.length} verdicts off the match surface).\n`,
);
