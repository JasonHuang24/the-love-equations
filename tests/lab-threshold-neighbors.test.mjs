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
 * Regenerate with:
 *   node tools/lab-threshold-sweep.mjs --neighbors tests/fixtures/threshold-neighbors.json --excerpt-chars 0
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
});

test('no corpus pair crosses an admission line without a ruling', { skip: corpusPresent ? false : 'lab-corpus/sources is absent (gitignored third-party archive; see md/RERUN.md §1)' }, () => {
  const current = currentScores();
  const missing = Object.keys(fixture.scores).filter((key) => !current.has(key));
  assert.equal(missing.length, 0,
    `${missing.length} frozen pair(s) no longer exist. The corpus text or the canon index has `
    + `moved under this fixture:\n  ${missing.slice(0, 8).join('\n  ')}`);

  const unadjudicated = [];
  for (const [key, before] of Object.entries(fixture.scores)) {
    const after = current.get(key);
    for (const name of THRESHOLDS) {
      const line = SCORING_CONFIG[name];
      const wasAbove = before >= line;
      const isAbove = after >= line;
      if (wasAbove === isAbove) continue;
      if (fixture.rulings[key]) continue;
      unadjudicated.push(
        `  ${key}\n    ${name} ${line}: ${before} -> ${after} (${isAbove ? 'gain' : 'loss'})`,
      );
    }
  }
  assert.equal(unadjudicated.length, 0,
    `${unadjudicated.length} threshold crossing(s) have no human ruling. Regenerate the sheet with\n`
    + `  node tools/lab-threshold-sweep.mjs --baseline <dump> --md md/lab-v2.6.0-threshold-adjudication.md\n`
    + `and record each verdict in the fixture's "rulings" map:\n${unadjudicated.slice(0, 20).join('\n')}`);
});
