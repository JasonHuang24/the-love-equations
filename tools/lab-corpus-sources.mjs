/*
 * The swept corpus population, defined once.
 *
 * Until 2026-07-30 this list was written out twice — literally, as the same
 * three-element array in `tools/lab-threshold-sweep.mjs` and again in
 * `tests/lab-threshold-neighbors.test.mjs`. Two copies of a population is the
 * defect class v2.4.2 was a whole release about: a second artifact that can
 * disagree with the first while looking correct. Those two copies happened to
 * agree, which is luck rather than a property, and widening one of them without
 * the other would have made the fixture's own guard fail on pairs it could no
 * longer find.
 *
 * The list is DERIVED from `lab-corpus.manifest.json`, not retyped. The
 * manifest is committed while the archive it describes is gitignored
 * (md/RERUN.md §1), and it already records which sources have an archived text:
 * `sourceFile`. Source 03 (Gottman) carries `sourceFile: null` and
 * `status: 'EXCLUDED — within-version-only artifact'`, so it leaves the
 * population because of the recorded decision rather than because someone
 * remembered to leave it out of an array. A 23rd source acquired tomorrow
 * enters the sweep the moment the manifest says it has a text — which is the
 * right default, and is why the neighbour fixture pins its own population count
 * (see `tests/lab-threshold-neighbors.test.mjs`): entering is automatic,
 * entering SILENTLY is not.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Every archived corpus source, in manifest order.
 *
 * Returns `{ id, file }` with `file` absolute. The path comes from the
 * manifest's own `sourceFile` rather than being rebuilt from the id, so a
 * source archived under a different extension needs no code change here.
 */
export function corpusSources(rootDir) {
  const manifestPath = path.join(rootDir, 'lab-corpus.manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return manifest.sources
    .filter((source) => source.sourceFile)
    .map((source) => ({ id: source.id, file: path.resolve(rootDir, source.sourceFile) }));
}

/** True when every archived source named by the manifest is actually on disk. */
export function corpusPresent(rootDir) {
  return corpusSources(rootDir).every((source) => fs.existsSync(source.file));
}

/*
 * WHICH CORPUS a ruling was keyed to.
 *
 * Rulings in `tests/fixtures/threshold-neighbors.json` are keyed by
 * `unitId|entryId|threshold`, and `unitId` is content-derived — so a ruling
 * survives a regeneration only while the passage it names still says the same
 * thing. On 2026-07-31 the archive was destroyed and re-acquired: 1 of 21
 * sources came back byte-exact (the one captured from a Wayback `id_` URL), 13
 * within 2%, and 7 drifted further, the worst at +25.9%. The rulings carry
 * forward by key regardless, which is Jason's ruling and the right call — the
 * alternative is discarding 185 hand-entered verdicts over a corpus change
 * nobody chose. But a verdict now describes a passage that may no longer be the
 * passage it was read against, and nothing in the file said so.
 *
 * This is that boundary, recorded rather than asserted from memory: a
 * fingerprint over the swept sources' own recorded hashes. It changes exactly
 * when the swept text changes, so a reader can tell which side of the
 * restoration any ruling sits on.
 */
export function corpusEpoch(rootDir, { prior = false } = {}) {
  const manifestPath = path.join(rootDir, 'lab-corpus.manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const swept = manifest.sources.filter((source) => source.sourceFile);
  /*
   * `prior: true` reconstructs the epoch of the corpus that was DESTROYED, from
   * the `priorSourceSha256` the restoration preserved per source. It exists for
   * one job: the fixture predates this field, so its 185 rulings carry no epoch
   * at all, and without a reconstruction the first regeneration would retire
   * nothing and the boundary Jason asked for would be silently absent.
   *
   * It is RECONSTRUCTED, not recorded, and the fixture labels it so. The
   * distinction matters: these hashes are what the manifest says the old text
   * hashed to, not something this tool measured — the text itself is gone.
   */
  if (prior) {
    const basis = swept
      .map((source) => `${source.id}:${source.priorSourceSha256 || source.sourceSha256 || ''}`)
      .sort()
      .join('\n');
    return {
      fingerprint: crypto.createHash('sha256').update(basis).digest('hex').slice(0, 16),
      sources: swept.length,
      reconstructed: true,
    };
  }
  // `sourceSha256` is the ARCHIVED text this sweep actually reads.
  // `currentSha256` is a live re-fetch recorded for drift tracking and is not
  // what gets scored — keying the epoch to it would move the boundary on a
  // change no measurement here ever saw.
  const basis = swept
    .map((source) => `${source.id}:${source.sourceSha256 || ''}`)
    .sort()
    .join('\n');
  return {
    fingerprint: crypto.createHash('sha256').update(basis).digest('hex').slice(0, 16),
    sources: swept.length,
    // Counted, not described: how much of the swept text is provably the text
    // the older rulings were read against.
    byteExact: swept.filter((source) => source.sourceSha256 === source.priorSourceSha256).length,
    restored: swept.filter((source) => source.priorSourceSha256).length,
  };
}
