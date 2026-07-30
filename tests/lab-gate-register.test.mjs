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
 * Measured over the 21 archived sources: 2604 of 4805 claim-like units were
 * discarded. That total was never the finding, because most of it is survey
 * methodology and academic apparatus that SHOULD be discarded. The finding is what
 * the pairs below isolate.
 *
 * Each case states one claim twice. `keyed` contains a word that sits inside a
 * decisive frame — courtship, romance, date, marriage, or a sex noun within 70
 * characters of a selection verb. `plain` makes the same claim without one. A gate
 * deciding whether a passage is about mating gives both the same verdict.
 *
 * At first freeze SIX OF EIGHT disagreed. Option 1 of
 * md/lab-gate-cultural-register.md was then adopted on Jason's ruling — the
 * `cultural-frame-mechanism` frame — and the count is now THREE, re-frozen with
 * the adoption recorded in the fixture.
 *
 * The three that remain share one cause, and it is not the new frame: it fires on
 * all three, but HUMAN_PARTICIPANT_FRAMES does not recognise `anyone`,
 * `a generation`, `mothers` or `the sexes`, so no participant is detected and
 * option 1 requires one. Widening the participant vocabulary is a separate and
 * narrower ruling; taking it here would have changed what option 1 was measured to
 * be. `knownSplits` stays a ratchet in the defect direction so the next attempt has
 * to state what it moved.
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

/*
 * The property that makes the adopted option the adopted option.
 *
 * `cultural-frame-mechanism` carries weight 2.5 against a
 * plausibleSocialStructureScore of 3, and frame scores are a MAX over matched
 * definitions, so it can never retain a passage on its own — a human participant
 * has to be present too. That is the entire difference between option 1 and the
 * rejected option 4, and it is what keeps tax law, the bond market and
 * machine-learning training data on the far side of the line.
 *
 * Asserted as blame attribution rather than as a metric, because a metric can be
 * held up by unrelated movement elsewhere in the fixture. Nothing the benchmark
 * says to discard may be retained BECAUSE of this frame.
 *
 * ONE NAMED EXCEPTION, and the reason it is named rather than fixed.
 *
 * `pv-07` came in with benchmark append #4 (2026-07-30), which exists because the
 * ignore population could not see the vocabulary the participant-widening options
 * would add. It exposed a false positive the frame was ALREADY capable of: the
 * group frame carries `parent`, `culture` + `rewards` fires the cultural frame,
 * and a sentence about software packages reads as a claim about people. Nothing
 * about the frame changed — the population did.
 *
 * It is not deleted, because deleting the case that found the defect is how a
 * benchmark stops being one. It is not fixed here either, because the fix is a
 * classifier change and md/lab-gate-participant-vocabulary.md recommends a
 * specific one (require a participant from human-individuals or human-groups,
 * not the pronoun frame, when the cultural frame is the only mechanism) that is
 * Jason's to rule on. So it is a named, visible debt.
 *
 * The list is a RATCHET IN THE DEFECT DIRECTION: it may only shrink. Adding an id
 * to it means conceding a false positive, which is a decision someone has to make
 * in a diff.
 */
const KNOWN_CULTURAL_FRAME_FALSE_POSITIVES = new Set(['pv-07']);

test('the cultural frame never retains a passage the benchmark says to discard', () => {
  const benchmark = JSON.parse(readFileSync(
    path.join(ROOT_DIR, 'tests', 'fixtures', 'domain-relevance-benchmark.json'), 'utf8',
  ));

  const blamed = [];
  benchmark.cases.filter((row) => row.expected === 'ignore').forEach((row) => {
    const [unit] = classifyDomainRelevance([{
      id: row.id,
      parentSegmentId: `bench-${row.id}`,
      segmentIndex: 0,
      text: row.text,
      wordCount: row.text.trim().split(/\s+/).length,
      isClaimLike: true,
      boundedContext: null,
    }]);
    if (unit.domainRelevance.status === 'irrelevant') return;
    if (unit.domainRelevance.evidence.some((item) => item.code === 'cultural-frame-mechanism')) {
      if (KNOWN_CULTURAL_FRAME_FALSE_POSITIVES.has(row.id)) return;
      blamed.push(`  [${row.id}] ${unit.domainRelevance.status} — ${row.text}`);
    }
  });

  assert.equal(blamed.length, 0,
    'A case the benchmark says to discard is being retained on the cultural frame. '
    + 'Either the frame\'s force/shaping pairing has grown too loose, or its weight has been '
    + 'raised to or past plausibleSocialStructureScore, or a benchmark append has exposed a '
    + 'case the frame could always have caught. The third one is not a licence to add the id '
    + `to KNOWN_CULTURAL_FRAME_FALSE_POSITIVES — read why pv-07 is there first.\n${blamed.join('\n')}`);

  // And the exception list only ever describes live defects. An id that no longer
  // reproduces is a fix nobody recorded, which is the same drift in the other
  // direction.
  const stale = [...KNOWN_CULTURAL_FRAME_FALSE_POSITIVES].filter((id) => {
    const row = benchmark.cases.find((item) => item.id === id);
    if (!row) return true;
    const [unit] = classifyDomainRelevance([{
      id: row.id,
      parentSegmentId: `bench-${row.id}`,
      segmentIndex: 0,
      text: row.text,
      wordCount: row.text.trim().split(/\s+/).length,
      isClaimLike: true,
      boundedContext: null,
    }]);
    return unit.domainRelevance.status === 'irrelevant'
      || !unit.domainRelevance.evidence.some((item) => item.code === 'cultural-frame-mechanism');
  });
  assert.equal(stale.length, 0,
    `${stale.join(', ')} is listed as a known cultural-frame false positive and no longer `
    + 'reproduces. Remove it from the list and say so in the release notes — a conceded defect '
    + 'that quietly fixed itself should be recorded as fixed.');
});

/*
 * And the mechanism behind that guarantee, asserted directly rather than trusted:
 * culture-and-shaping with nobody in the sentence stays out, and the same sentence
 * with a person in it comes in.
 */
test('the cultural frame requires a human participant, by construction', () => {
  const nobody = 'Advertising manufactures cultural anxiety in order to sell moisturiser.';
  const somebody = 'Advertising manufactures cultural anxiety in women, and they internalise it.';

  const withoutPerson = verdictFor(nobody);
  assert.equal(withoutPerson.status, 'irrelevant',
    'a cultural mechanism with no participant must not be enough to retain');
  assert.ok(withoutPerson.frames.mechanism.detected,
    'the frame should still FIRE — it is the participant requirement doing the work, not a miss');
  assert.ok(withoutPerson.frames.mechanism.score < 3,
    'the frame must stay under plausibleSocialStructureScore or it retains on its own');

  const withPerson = verdictFor(somebody);
  assert.notEqual(withPerson.status, 'irrelevant',
    'the same claim with a participant in it is what option 1 exists to admit');
});
