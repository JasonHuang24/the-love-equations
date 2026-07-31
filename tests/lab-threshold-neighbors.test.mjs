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
import { corpusSources, corpusEpoch } from '../tools/lab-corpus-sources.mjs';

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

  /*
   * WHICH CORPUS the rulings were read against.
   *
   * Rulings are merged across regenerations and keyed by a content-derived
   * unitId, so a verdict survives only while its passage still says the same
   * thing. The 2026-07-31 archive loss and re-acquisition brought back 20 of 21
   * sources changed, and Jason ruled the rulings carry forward rather than being
   * discarded -- which is right, and is only honest if the file records the
   * boundary. This asserts the band was swept against the corpus the MANIFEST
   * describes, so editing one without re-sweeping the other fails here instead
   * of leaving a verdict silently attached to text it was never read against.
   *
   * Manifest-only, so it holds whether or not the gitignored archive is on disk.
   */
  assert.ok(fixture.corpusEpoch, 'the fixture predates the corpus epoch record; regenerate the band');
  assert.equal(fixture.corpusEpoch.fingerprint, corpusEpoch(ROOT_DIR).fingerprint,
    'The band was swept against a different corpus than lab-corpus.manifest.json now describes. '
    + 'Re-sweep, or explain the manifest change -- a ruling keyed to text that has since moved is '
    + 'the failure this record exists to make visible.');
  assert.ok(Array.isArray(fixture.corpusEpochHistory));
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
  /*
   * The band has to fit inside what the dump remembers.
   *
   * A baseline dump keeps pairs at or above `dumpFloor` and a comparison treats
   * anything absent as zero. So if `dumpFloor` ever rises above
   * `lowest threshold − band`, the bottom of the band stops being captured: a
   * pair sitting just under `candidateScoreFloor` would be recorded as 0.000,
   * its side would be pinned wrong, and the tripwire would go quiet exactly
   * where it is densest. Nothing enforced this — both constants are defaults in
   * tools/lab-threshold-sweep.mjs and either could be changed alone.
   *
   * Currently 0.02 against 0.08 − 0.03 = 0.05, so there is 0.03 of headroom.
   * Audited 2026-07-30, md/lab-calibration-audit.md.
   */
  const lowestLine = Math.min(...THRESHOLDS.map((name) => SCORING_CONFIG[name]));
  assert.ok(fixture.dumpFloor <= lowestLine - fixture.band,
    `dumpFloor ${fixture.dumpFloor} is above ${lowestLine} − ${fixture.band} = `
    + `${(lowestLine - fixture.band).toFixed(3)}. The bottom of the band is no longer captured by a `
    + 'baseline dump, so pairs just under the lowest threshold will compare against a false zero. '
    + 'Lower --dump-floor or narrow --band.');

  assert.equal(Object.keys(fixture.rulings).length, fixture.counts.rulings);
  assert.equal(
    Object.values(fixture.rulings).filter((row) => row.ruling === 'PENDING').length,
    fixture.counts.pending,
  );
});

/*
 * WHAT AN OUTSTANDING VERDICT BLOCKS, by which line it sits on. Rewritten
 * 2026-07-30 when the swept population reached 2,401 passages.
 *
 * The original rule was one flag: while `adjudicationOpen` was true the suite
 * REPORTED outstanding crossings instead of failing, so a release could be built
 * in parallel with the adjudication it was waiting for, and closing it was the
 * release's job. That worked at 117 swept passages, where a change produced a
 * few dozen crossings somebody could read in an afternoon.
 *
 * At 2,401 it does not. 4,622 of the outstanding crossings are at
 * `candidateScoreFloor`, they will never be read, and while they sit there
 * `adjudicationOpen` is permanently true — so the branch that FAILS is
 * permanently unreachable. A guard that can only ever report is not a guard, and
 * the honest options were to disarm it openly or to arm the part that matters.
 *
 * The three lines are three different kinds of event and are now treated as such:
 *
 *   minCredibleScore   BLOCKING, no exceptions. This decides whether a reader is
 *                      shown a match as credible. There is no volume argument
 *                      here: the whole archive produced 38 of these ever.
 *
 *   minWeakScore       RATCHET. It changes the nearby-concepts list a reader
 *                      sees, so it is not a census — but 516 are outstanding
 *                      from before this rule and demanding they be cleared first
 *                      would just disarm the guard a second way. The count may
 *                      only FALL: new weak crossings have to be answered, the
 *                      historical backlog can be worked down in its own time.
 *
 *   candidateScoreFloor  CENSUS, explicitly not adjudicable at this volume. It
 *                      decides which entries were CONSIDERED. It can never put a
 *                      match in front of a reader — `applyBoundedContext`
 *                      refuses to boost below `minWeakScore` and the largest
 *                      boost is 0.045 against a 0.17 gap. It is not invisible
 *                      (it can become `nearest` and change an unmapped claim's
 *                      reason line, destination and search terms), which is why
 *                      it is still RECORDED rather than dropped.
 *
 * Lowering WEAK_BACKLOG_CEILING is the only edit to it this file permits.
 */
const WEAK_BACKLOG_CEILING = 425;

test('an outstanding credible-line verdict blocks, and the weak backlog may only fall', () => {
  const pendingBy = fixture.counts.pendingByThreshold;
  assert.ok(pendingBy, 'the fixture predates per-threshold adjudication; regenerate the band');
  THRESHOLDS.forEach((name) => {
    const counted = Object.values(fixture.rulings)
      .filter((row) => row.ruling === 'PENDING' && row.threshold === name).length;
    assert.equal(pendingBy[name], counted, `recorded PENDING count for ${name} disagrees with the rulings`);
  });

  const credible = Object.entries(fixture.rulings)
    .filter(([, row]) => row.ruling === 'PENDING' && row.threshold === 'minCredibleScore');
  assert.equal(credible.length, 0,
    `${credible.length} minCredibleScore crossing(s) are unruled. This is the line that decides `
    + 'whether a reader is shown a match as credible, and it is release-blocking with no volume '
    + 'exception — the whole archive has produced 38 of these ever. Read the sentence and record '
    + `a verdict:\n  ${credible.map(([key]) => key).join('\n  ')}`);

  assert.ok(pendingBy.minWeakScore <= WEAK_BACKLOG_CEILING,
    `${pendingBy.minWeakScore} minWeakScore crossings are unruled, above the ceiling of `
    + `${WEAK_BACKLOG_CEILING}. This change added weak crossings without answering them. Rule the `
    + 'new ones, or work the backlog down and lower the ceiling — it may only fall.');

  console.log(`      adjudication: ${credible.length} credible (blocking) · `
    + `${pendingBy.minWeakScore}/${WEAK_BACKLOG_CEILING} weak (ratchet) · `
    + `${pendingBy.candidateScoreFloor} candidate-floor (census, not adjudicable)`);
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
