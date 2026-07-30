import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  prepareCanonIndex,
  canonAdmissionSurfaces,
  detectClaimUnits,
  classifyDomainRelevance,
  analyzerInternals,
  SCORING_CONFIG,
} from '../js/lab-analyzer.js';
import { normalizeInput } from '../js/lab-intake.js';
import { corpusSources } from '../tools/lab-corpus-sources.mjs';

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
 * — a doctrine merge is one — and a fixture pinning 90,432 exact numbers would
 * fail on every honest change and train people to regenerate it without
 * looking. Side-preservation is the property worth pinning, because crossing a
 * line is the only thing at this layer a reader ever sees.
 *
 * The band covered 3 of the 21 archived sources until 2026-07-30, when the
 * population widened to the whole archive: 117 passages to 2,220, and 5,242 band
 * pairs to 90,432. The widening was purely additive — every previously frozen
 * pair is still in the band at the identical score, because IDF is derived from
 * the canon rather than from the corpus, so adding sources cannot move an
 * existing pair. See md/lab-threshold-sweep-widening.md.
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

/*
 * The population comes from the same module the sweep tool reads, because this
 * file used to carry its own hand-written copy of it — the same three ids, typed
 * out twice. They agreed, and that was luck: widening the tool alone would have
 * left this test unable to find two thirds of the pairs it is guarding, and the
 * failure would have read as "the corpus moved under this fixture" rather than
 * as "the two lists disagree".
 */
const SOURCES = corpusSources(ROOT_DIR);

const fixture = JSON.parse(readFileSync(
  new URL('./fixtures/threshold-neighbors.json', import.meta.url),
  'utf8',
));

const corpusPresent = SOURCES.every(({ file }) => existsSync(file));

function currentScores() {
  const canonIndex = JSON.parse(readFileSync(path.join(ROOT_DIR, 'data', 'le-canon-index.json'), 'utf8'));
  const prepared = prepareCanonIndex(canonIndex);
  // Same population as the sweep tool, which is the same population as the
  // product: the shipped gate reads canon surfaces as of v2.6.6.
  const surfaces = canonAdmissionSurfaces(prepared);
  const scores = new Map();
  let population = 0;
  SOURCES.forEach(({ id, file }) => {
    const document = normalizeInput({
      text: readFileSync(file, 'utf8'),
      format: 'auto',
      source: { title: id, type: 'corpus-file', url: null },
      extraction: { method: 'corpus-archive', warnings: [] },
      createdAt: '1970-01-01T00:00:00.000Z',
    });
    // Retained CLAIM-LIKE passages only, which is the population the product
    // scores and the population the sweep dumps. Retrieval does not run on a
    // unit the gate set aside, and `analyzeDocument` builds no segment at all
    // for a unit the claim detector rejected — a section heading scored here
    // would pin a number nothing computes (see `bd5dde4`, where three of the 29
    // rulings a human was asked for existed only because two headings were
    // being swept).
    classifyDomainRelevance(detectClaimUnits(document), new Map(), surfaces)
      .filter((unit) => unit.isClaimLike && unit.domainRelevance.status !== 'irrelevant')
      .forEach((unit) => {
        population += 1;
        prepared.entries.forEach((entry) => {
          const key = `${unit.id}|${entry.id}`;
          if (!Object.hasOwn(fixture.scores, key)) return;
          scores.set(key, analyzerInternals.scoreEntry(unit, entry, prepared.idf).score);
        });
      });
  });
  return { scores, population };
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
  const { scores: current, population } = currentScores();

  /*
   * The population is pinned, not just the pairs in it.
   *
   * `corpusSources` derives the swept sources from lab-corpus.manifest.json, so
   * a source acquired tomorrow enters the sweep the moment the manifest records
   * a text for it. That is the right default — an archive the instrument ignores
   * is worse than an instrument that grows — but it means the band could widen
   * or narrow with no code change at all. This assertion turns that into a
   * failure that says so: entering the population is automatic, entering it
   * silently is not. Regenerate the band in the same commit that changes the
   * archive, and record what the new source brought.
   */
  assert.equal(population, fixture.passages,
    `The swept population is ${population} passages and the band was frozen at ${fixture.passages}. `
    + 'A corpus source was added or removed, or the gate now retains a different set. Regenerate:\n'
    + '  node tools/lab-threshold-sweep.mjs --neighbors tests/fixtures/threshold-neighbors.json');

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
