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
