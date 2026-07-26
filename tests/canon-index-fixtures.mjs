#!/usr/bin/env node

import assert from 'node:assert/strict';
import { buildCanonIndex } from '../scripts/build-canon-index.mjs';

const index = await buildCanonIndex({ generatedAt: 'fixture' });
const entries = new Map(index.entries.map((entry) => [entry.id, entry]));

function required(id) {
  const entry = entries.get(id);
  assert(entry, `Expected extracted canon concept ${id}`);
  return entry;
}

assert.equal(index.schemaVersion, 'le-canon-index/1.0');
assert.equal(index.stats.conceptCount, 446);
assert.equal(index.stats.sourceCount, 19);
assert.deepEqual(index.stats.byCategory, {
  'Deep Dives': 35,
  'Five Levers': 35,
  'Gender Dynamics': 133,
  Instruments: 5,
  Lexicon: 70,
  'Love Hierarchy': 41,
  Mythbuster: 64,
  'Pill Dossiers': 12,
  'Rules & Frameworks': 21,
  Statistics: 30,
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

process.stdout.write(
  `Canon extraction fixtures passed for ${index.stats.conceptCount} concepts across `
  + `${index.stats.sourceCount} sources.\n`,
);
