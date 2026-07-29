import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  prepareCanonIndex,
  detectClaimUnits,
  classifyDomainRelevance,
  analyzerInternals,
  SCORING_CONFIG,
} from '../js/lab-analyzer.js';
import { normalizeInput } from '../js/lab-intake.js';

/*
 * The threshold-neighbour band, frozen.
 *
 * Every corpus pair sitting within ±0.03 of an admission line. These are the
 * pairs an implementation detail can push across a threshold without anyone
 * intending it, so this file exists to make that impossible to do quietly: a
 * pair that changes SIDE has to be adjudicated by a human and recorded in
 * `rulings`, or this test fails.
 *
 * It is deliberately NOT a score assertion. Scores move for legitimate reasons
 * — this whole release is one — and a fixture pinning 4,160 exact numbers would
 * fail on every honest change and train people to regenerate it without
 * looking. Side-preservation is the property worth pinning, because crossing a
 * line is the only thing at this layer a reader ever sees.
 *
 * `rulings` is the record of every pair that has ever crossed, including the
 * ones that crossed from OUTSIDE the band — a pair falling 0.363 → 0.231 clears
 * `minWeakScore` without ever being near it, so the band alone would miss it.
 * While `adjudicationOpen` is true, a PENDING ruling is reported rather than
 * failed, so the release it belongs to can be built in parallel with the human
 * verdict it is waiting for. Closing the adjudication is the release's job.
 *
 * Regenerate the band alone with:
 *   node tools/lab-threshold-sweep.mjs --neighbors tests/fixtures/threshold-neighbors.json
 *
 * Or with a baseline, which also records every crossing it finds as PENDING:
 *   node tools/lab-threshold-sweep.mjs --baseline <dump.json> \
 *       --neighbors tests/fixtures/threshold-neighbors.json \
 *       --md md/lab-v2.6.0-threshold-adjudication.md
 *
 * The fixture never stores source text either way; `--excerpt-chars` reaches
 * only the Markdown sheet.
 *
 * SKIPS when the corpus archive is absent. `lab-corpus/` is gitignored and the
 * texts are third-party (md/RERUN.md §1), so a clone without the archive must
 * still be able to run the suite — but it says so rather than passing silently.
 */

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SOURCES = ['01-pew-online-dating', '02-fem-centrism', '04-heteropessimism'];

const fixture = JSON.parse(readFileSync(
  new URL('./fixtures/threshold-neighbors.json', import.meta.url),
  'utf8',
));

const sourceFiles = SOURCES.map((id) => path.join(ROOT_DIR, 'lab-corpus', 'sources', `${id}.txt`));
const corpusPresent = sourceFiles.every((file) => existsSync(file));

function currentScores() {
  const canonIndex = JSON.parse(readFileSync(path.join(ROOT_DIR, 'data', 'le-canon-index.json'), 'utf8'));
  const prepared = prepareCanonIndex(canonIndex);
  const scores = new Map();
  SOURCES.forEach((id, index) => {
    const document = normalizeInput({
      text: readFileSync(sourceFiles[index], 'utf8'),
      format: 'auto',
      source: { title: id, type: 'corpus-file', url: null },
      extraction: { method: 'corpus-archive', warnings: [] },
      createdAt: '1970-01-01T00:00:00.000Z',
    });
    // Retained passages only: retrieval genuinely does not run on the ones the
    // domain gate set aside, so scoring them here would pin a number the
    // product never computes.
    classifyDomainRelevance(detectClaimUnits(document))
      .filter((unit) => unit.domainRelevance.status !== 'irrelevant')
      .forEach((unit) => {
        prepared.entries.forEach((entry) => {
          const key = `${unit.id}|${entry.id}`;
          if (!Object.hasOwn(fixture.scores, key)) return;
          scores.set(key, analyzerInternals.scoreEntry(unit, entry, prepared.idf).score);
        });
      });
  });
  return scores;
}

const THRESHOLDS = ['candidateScoreFloor', 'minWeakScore', 'minCredibleScore'];

const RULINGS = new Set(['ACCEPT', 'REJECT', 'PENDING']);

test('the frozen band is internally consistent', () => {
  assert.equal(fixture.schema, 'le-lab.threshold-sweep/1.0');
  assert.equal(fixture.population, 'retained');
  assert.equal(Object.keys(fixture.scores).length, fixture.counts.pairs);
  THRESHOLDS.forEach((name) => {
    assert.equal(fixture.thresholds[name], SCORING_CONFIG[name],
      `The band was measured against a different ${name} than the tree ships.`);
    const inBand = Object.values(fixture.scores)
      .filter((score) => Math.abs(score - SCORING_CONFIG[name]) <= fixture.band).length;
    assert.equal(inBand, fixture.counts[name], `${name} membership disagrees with the recorded count.`);
  });
  Object.entries(fixture.rulings).forEach(([key, row]) => {
    assert.ok(RULINGS.has(row.ruling), `${key} carries an unrecognised ruling: ${row.ruling}`);
    assert.ok(THRESHOLDS.includes(row.threshold), `${key} names an unknown threshold: ${row.threshold}`);
    assert.ok(['gain', 'loss'].includes(row.direction), `${key} names an unknown direction.`);
    assert.ok(key.endsWith(`|${row.threshold}`),
      `${key} is keyed by a different threshold than it records — a pair can cross two lines at `
      + 'once, so the threshold is part of the key.');
    // A recorded crossing has to BE one, or the record is decoration.
    const line = SCORING_CONFIG[row.threshold];
    assert.notEqual(row.before >= line, row.after >= line,
      `${key} is recorded as crossing ${row.threshold} but ${row.before} and ${row.after} sit on the same side.`);
    assert.equal(row.direction, row.after >= line ? 'gain' : 'loss',
      `${key} records a direction its own scores contradict.`);
  });
  assert.equal(Object.keys(fixture.rulings).length, fixture.counts.rulings);
  assert.equal(
    Object.values(fixture.rulings).filter((row) => row.ruling === 'PENDING').length,
    fixture.counts.pending,
  );
});

test('every threshold crossing carries a human verdict', () => {
  const pending = Object.entries(fixture.rulings).filter(([, row]) => row.ruling === 'PENDING');
  if (fixture.adjudicationOpen) {
    // Reported, not failed. The verdicts are outstanding by design while the
    // release that produced them is still being built; what must not happen is
    // that they go outstanding QUIETLY.
    console.log(`      ${pending.length} threshold crossing(s) awaiting adjudication `
      + '(adjudicationOpen: true — md/lab-v2.6.0-threshold-adjudication.md)');
    return;
  }
  assert.equal(pending.length, 0,
    `${pending.length} threshold crossing(s) are still PENDING with the adjudication closed. `
    + 'Either record the verdicts in tests/fixtures/threshold-neighbors.json, or set '
    + `adjudicationOpen back to true:\n  ${pending.map(([key]) => key).slice(0, 20).join('\n  ')}`);
});

test('no corpus pair crosses an admission line without a ruling', { skip: corpusPresent ? false : 'lab-corpus/sources is absent (gitignored third-party archive; see md/RERUN.md §1)' }, () => {
  const current = currentScores();
  const missing = Object.keys(fixture.scores).filter((key) => !current.has(key));
  assert.equal(missing.length, 0,
    `${missing.length} frozen pair(s) no longer exist. The corpus text or the canon index has `
    + `moved under this fixture:\n  ${missing.slice(0, 8).join('\n  ')}`);

  const unrecorded = [];
  for (const [key, before] of Object.entries(fixture.scores)) {
    const after = current.get(key);
    for (const name of THRESHOLDS) {
      const line = SCORING_CONFIG[name];
      const isAbove = after >= line;
      if ((before >= line) === isAbove) continue;
      // A crossing already in `rulings` has been seen by a human, whatever the
      // verdict. One that is not has moved since the band was frozen, which is
      // the thing this file exists to refuse.
      if (fixture.rulings[`${key}|${name}`]) continue;
      unrecorded.push(`  ${key}\n    ${name} ${line}: ${before} -> ${after} (${isAbove ? 'gain' : 'loss'})`);
    }
  }
  assert.equal(unrecorded.length, 0,
    `${unrecorded.length} threshold crossing(s) are in nobody's record. Regenerate the band and the\n`
    + 'sheet together, so the crossing is written down before it is absorbed:\n'
    + '  node tools/lab-threshold-sweep.mjs --baseline <dump> \\\n'
    + '      --neighbors tests/fixtures/threshold-neighbors.json --excerpt-chars 0 \\\n'
    + `      --md md/lab-v2.6.0-threshold-adjudication.md\n${unrecorded.slice(0, 20).join('\n')}`);
});
