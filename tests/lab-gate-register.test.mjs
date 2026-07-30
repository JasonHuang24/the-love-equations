import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { detectClaimUnits, classifyDomainRelevance } from '../js/lab-analyzer.js';
import { normalizeInput } from '../js/lab-intake.js';

/*
 * The gate's cultural-register gap, frozen as a measurement instead of an
 * anecdote.
 *
 * localDomainRelevance retains a unit only on a DECISIVE relational-outcome or
 * mechanism frame, or on a participant frame combined with one of those. A
 * participant frame alone is `irrelevant / no-human-relational-frame`. The
 * consequence is that the gate is reliable on claims about relationships and
 * blind to claims about CULTURE SHAPING relationships — which is the register
 * most of the manosphere corpus is written in, and the register the site's own
 * doctrine pages argue with.
 *
 * Measured over the 21 archived sources: 2604 of 4805 claim-like units are
 * discarded. That total is not the finding on its own, because most of it is
 * survey methodology and academic apparatus that SHOULD be discarded. The finding
 * is what the pairs below isolate.
 *
 * Each case states one claim twice. `keyed` contains a word that sits inside a
 * decisive frame — courtship, romance, date, marriage, or a sex noun within 70
 * characters of a selection verb. `plain` makes the same claim without one. A gate
 * deciding whether a passage is about mating gives both the same verdict. At
 * freeze, six of eight disagree, and the sharpest is `cr-frame`, where the
 * discarded phrasing names a canon entry — frameworks:operative-frame — verbatim.
 *
 * This test does NOT assert the gap is fixed. It pins the defect count so that
 * any change to the gate has to state what it did to this measurement, in the
 * same spirit as the benchmark's junkRecall ratchet. Options and costs are worked
 * through in md/lab-gate-cultural-register.md; choosing one is Jason's call,
 * because it changes what the Lab admits for every reader.
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = JSON.parse(readFileSync(
  path.join(ROOT_DIR, 'tests', 'fixtures', 'cultural-register-pairs.json'), 'utf8',
));

function verdictFor(text) {
  const units = classifyDomainRelevance(detectClaimUnits(normalizeInput({
    text,
    format: 'auto',
    source: { title: 'cultural register pairs', type: 'fixture-file', url: null },
    extraction: { method: 'fixture', warnings: [] },
    createdAt: '1970-01-01T00:00:00.000Z',
  }))).filter((unit) => unit.isClaimLike);
  assert.equal(units.length, 1, `fixture case must produce exactly one claim-like unit: ${text}`);
  return units[0].domainRelevance;
}

test('the pair fixture is structurally sound', () => {
  assert.equal(fixture.schema, 'le-lab.cultural-register-pairs/1.0');
  assert.ok(fixture.cases.length >= 8);
  const ids = new Set();
  fixture.cases.forEach((row) => {
    assert.ok(row.id && !ids.has(row.id), `${row.id} is unique`);
    ids.add(row.id);
    ['keyed', 'plain'].forEach((side) => {
      assert.ok(row[side]?.text, `${row.id}.${side} has text`);
      assert.ok(row[side].observedAtFreeze?.status, `${row.id}.${side} records the shipped verdict at freeze`);
    });
    // Both halves must be the same claim, or the pair measures two things.
    assert.notEqual(row.keyed.text, row.plain.text, `${row.id} states its claim twice, differently`);
  });
});

test('every frozen verdict still describes the shipped gate', () => {
  const drifted = [];
  fixture.cases.forEach((row) => {
    ['keyed', 'plain'].forEach((side) => {
      const now = verdictFor(row[side].text);
      const then = row[side].observedAtFreeze;
      if (now.status !== then.status || now.reasonCode !== then.reasonCode) {
        drifted.push(`  ${row.id}.${side}: frozen ${then.status}/${then.reasonCode}, now ${now.status}/${now.reasonCode}`);
      }
    });
  });
  assert.equal(drifted.length, 0,
    'A frozen verdict that no longer matches the analyzer is the record disagreeing with the engine.\n'
    + `${drifted.join('\n')}\nIf the change was intended, re-freeze and say so in the release notes.`);
});

test('the register gap is measured, and the defect count may only go down', () => {
  const splits = fixture.cases.filter((row) => {
    const keyed = verdictFor(row.keyed.text).status === 'irrelevant';
    const plain = verdictFor(row.plain.text).status === 'irrelevant';
    return keyed !== plain;
  });

  assert.ok(splits.length <= fixture.knownSplits,
    `${splits.length} pairs now split against a pinned ${fixture.knownSplits}. `
    + 'This count is a ratchet in the defect direction: a change may close a split, never open one. '
    + `Split now: ${splits.map((row) => row.id).join(', ')}`);

  if (splits.length < fixture.knownSplits) {
    assert.fail(
      `${fixture.knownSplits - splits.length} split(s) closed — good, and the fixture has to say so. `
      + `Set knownSplits to ${splits.length} and record which option was adopted in `
      + 'md/lab-gate-cultural-register.md.',
    );
  }

  // The one that matters most, called out by name: the discarded phrasing names a
  // canon entry. A gate that bins a sentence naming the concept the canon exists
  // to hold is not making a scope judgement, it is missing a keyword.
  const frame = fixture.cases.find((row) => row.id === 'cr-frame');
  assert.ok(frame, 'cr-frame is the load-bearing case and must stay in the fixture');
  assert.match(frame.plain.text, /operative frame/i);
});
