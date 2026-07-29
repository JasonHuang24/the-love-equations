# LE Lab — v2.2.0 re-run protocol

**Why this exists.** v2.2.0 changes what an export *says about itself* (schema versions, provenance
stamp, scoring-config hash, provisional marker) without changing what the analyzer *decides*. Every
source analyzed under v2.1.2 or earlier therefore carries an export that is behaviorally current but
provenance-illegible: it cannot name the analyzer build, the canon snapshot, or the threshold set that
produced it. Re-running brings the corpus to a single version so cross-source comparisons in the
distillation lane are made against one instrument.

**Scope.** This document is the procedure. It is deliberately not executed here.

---

## 0. Precondition — read this first

**The existing corpus has no archived raw text in this repository.** All four previously-processed
sources were staged in `.claude/lab-sources/`, which is gitignored (`.claude/` in `.gitignore`), and the
run-01 dossier records that "staging removed after the run — the tree was clean before and after."
No analysis or queue export is committed anywhere in the tree either.

Consequence: **steps 2–5 below are not executable for the existing corpus until the source texts are
re-acquired** (step 1). A re-acquired text is not guaranteed byte-identical to what was analyzed in
July 2026 — living web pages change. Any re-run built on re-acquired text must be labelled
`reacquired` in the manifest and treated as a *new* measurement that supersedes the old one, not as a
reproduction of it.

The archive introduced in step 1 is what makes every *future* re-run a true reproduction.

### The corpus to re-run

| # | Source | Run | Analyzer | Canon snapshot | Recorded result |
|---|---|---|---|---|---|
| 1 | Pew Research Center, "Key findings about online dating in the U.S." (Feb 2 2023; n=6,034 U.S. adults, July 2022) | Harvest #1, 2026-07-26 | `v=1.7` | `1.0.0+6dc9bff7b0fe` | 34 retained claims · 50% mapped · 17 queue · 4 pressure tests |
| 2 | Rollo Tomassi, "Fem-Centrism", *The Rational Male* (2011) | Distillation run 01, 2026-07-27 | `v=2.1.2` | `1.0.0+8c38a2f1d015` | 1,214 words · 10 claim-like · 0 mapped (0%) · 10 queue |
| 3 | The Gottman Institute, "The Four Horsemen" | Distillation run 01, 2026-07-27 | `v=2.1.2` | `1.0.0+8c38a2f1d015` | 885 words · 17 claim-like · 0 mapped (0%) · 17 queue |
| 4 | Asa Seresin, "On Heteropessimism", *The New Inquiry* (2019) | Distillation run 01, 2026-07-27 | `v=2.1.2` | `1.0.0+8c38a2f1d015` | 2,938 words · 28 claim-like · 1 mapped (3.6%) · 27 queue |

Sources 2–4 are the priority: they ran on the same canon snapshot the Lab still ships, so their
re-runs isolate the v2.1.2 → v2.2.0 delta exactly. Source 1 ran on an older canon and an older
analyzer, so its re-run moves two variables at once — record that in its manifest note.

---

## 1. Establish the source archive

Create a durable, versioned home for raw source text. `.claude/lab-sources/` cannot serve: it is
gitignored and was treated as scratch.

```bash
mkdir -p lab-corpus/sources lab-corpus/exports
```

One file per source, named `<NN>-<slug>.<ext>` (`.txt` / `.md` / `.vtt` — whatever intake format the
source was captured in). Alongside each, a sidecar `<NN>-<slug>.source.json`:

```json
{
  "id": "02-fem-centrism",
  "title": "Fem-Centrism",
  "author": "Rollo Tomassi",
  "publication": "The Rational Male",
  "year": 2011,
  "url": "https://…",
  "capturedAt": "2026-07-29T00:00:00.000Z",
  "capturedBy": "reacquired",
  "format": "txt",
  "sha256": "<sha256 of the text file>",
  "notes": "Re-acquired 2026-07-29; not byte-verified against the 2026-07-27 staging, which was deleted."
}
```

`capturedBy` is `original` only when the file is provably the bytes that were analyzed. For the
existing corpus it is `reacquired`.

**Decide before committing:** these are third-party texts. If they should not live in the repo, put
the archive outside it and record the absolute path plus the SHA-256 in the manifest instead — the
hash is what makes a future run verifiable, not the location. Do not silently commit long verbatim
third-party copy without deciding that first.

---

## 2. Confirm the instrument before re-running

A re-run is only meaningful if the analyzer is the shipped one and the canon index is the shipped one.

```bash
npm run test:lab
```

Then confirm the canon index regenerates byte-identically (guards against a stale artifact):

```bash
node -e "import('./scripts/build-canon-index.mjs').then(async m => { const fs = await import('node:fs/promises'); const cur = JSON.parse(await fs.readFile('data/le-canon-index.json','utf8')); const re = await m.buildCanonIndex({ generatedAt: cur.generatedAt }); console.log('identical:', JSON.stringify(cur,null,2)+'\n' === JSON.stringify(re,null,2)+'\n', cur.indexVersion); })"
```

Record the printed `indexVersion` — it goes in the manifest as the canon snapshot for this re-run
epoch.

---

## 3. Re-analyze each source

Use the headless harness, not the browser. It imports the shipped `js/lab-analyzer.js`, so the result
is the same code path the Lab runs, and it is deterministic (wall-clock fields are stabilized).

```bash
node fixtures/run-analyzer.mjs --source lab-corpus/sources/02-fem-centrism.txt --out lab-corpus/exports/02-fem-centrism-v2.2.0.json
```

Repeat per source. The harness prints a one-line summary to stderr (passages, claims, mapped,
coverage, tensions, queue size) — capture it; it is the row you will compare against the table above.

If a source needs per-passage visitor overrides to reproduce the original run's population (Harvest #1
used 4 visitor includes), pass them:

```bash
node fixtures/run-analyzer.mjs --source lab-corpus/sources/01-pew.txt --overrides lab-corpus/sources/01-pew.overrides.json --out lab-corpus/exports/01-pew-v2.2.0.json
```

The overrides file is `{ "<unitId>": "include" | "exclude" }`. **Unit IDs are content-derived**, so
they only survive if the source text is byte-identical. If the text was re-acquired, the old override
IDs will not match; the harness surfaces this as `domainRelevance.overrides.unmatchedIds` and a
warning. Re-derive them from the new run rather than forcing the old ones.

For the browser path instead (when a human wants to eyeball it): serve on `:8753`
(`python .claude/dev-server.py`), open `lab.html`, paste the source, analyze, and use the export
buttons. Hard-refresh once — the `?v=2.2.0` bump should handle cache, but the local server has bitten
this project before.

---

## 4. Naming and supersession — retain, never delete

**v2.1.2 and earlier exports are retained.** They are the evidence behind the run-01 dossier and the
Harvest #1 backlog; deleting them would orphan conclusions already published in `md/`.

Naming convention for everything in `lab-corpus/exports/`:

```
<NN>-<slug>-<analyzer-version>.json          analysis export
<NN>-<slug>-<analyzer-version>.queue.json    research-queue export
<NN>-<slug>-<analyzer-version>.md            analysis Markdown
```

- `<analyzer-version>` is the release token (`v2.1.2`, `v2.2.0`), matching `provenance.analyzer.version`.
- Never overwrite across versions. Two files with different version suffixes are the point.
- If a source is re-run twice on the same version (e.g. after re-acquiring text), disambiguate with a
  date: `02-fem-centrism-v2.2.0-2026-07-29.json`. Do not add `-final`, `-new`, or `-fixed`.
- Legacy exports that were never captured to disk are simply absent. Record that as
  `"priorExport": null` in the manifest rather than reconstructing one — a reconstructed "v2.1.2
  export" produced by today's code would be a fabrication.

Supersession is recorded in the manifest, not by file deletion or renaming.

---

## 5. Manifest update procedure

`lab-corpus/manifest.json` is the index of the corpus and the record of which export is current.

```json
{
  "schemaVersion": "le-lab.corpus-manifest/1.0",
  "updatedAt": "2026-07-29T00:00:00.000Z",
  "epoch": {
    "analyzerVersion": "2.2.0",
    "analysisSchemaVersion": "le-lab.analysis/2.2",
    "researchQueueSchemaVersion": "le-lab.research-queue/2.1",
    "scoringConfigHash": "195c1ld",
    "canonIndexVersion": "1.0.0+8c38a2f1d015",
    "canonGeneratedAt": "2026-07-27T11:25:27.240Z"
  },
  "sources": [
    {
      "id": "02-fem-centrism",
      "sourceFile": "lab-corpus/sources/02-fem-centrism.txt",
      "sourceSha256": "<sha256>",
      "capturedBy": "reacquired",
      "current": "lab-corpus/exports/02-fem-centrism-v2.2.0.json",
      "superseded": [],
      "priorExport": null,
      "priorRun": {
        "analyzerVersion": "2.1.2",
        "canonIndexVersion": "1.0.0+8c38a2f1d015",
        "recordedIn": "md/doctrine-distillation-claude-01.md",
        "claimLike": 10,
        "mapped": 0,
        "coveragePct": 0
      },
      "result": { "claimLike": null, "mapped": null, "coveragePct": null },
      "delta": "…",
      "notes": "Text re-acquired 2026-07-29; original staging deleted, so this supersedes rather than reproduces."
    }
  ]
}
```

Per re-run, in order:

1. **Append, do not replace.** Move the previous `current` path into `superseded[]` before setting the
   new one. `superseded` is append-only.
2. **Copy the epoch from the export itself**, not from memory: every field in `epoch` is readable from
   `provenance.analyzer` and `provenance.canonIndex` in any v2.2.0 export. If two exports in one
   re-run disagree on the epoch, stop — something re-ran against a different canon mid-pass.
3. **Fill `result`** from the harness summary line.
4. **Write `delta`** as one plain sentence comparing `result` to `priorRun` — e.g. "unchanged: 10
   claim-like, 0 mapped" or "coverage 0% → 6.9% (2 new alias matches)". A re-run with no delta is the
   expected outcome for v2.2.0 and is worth stating explicitly.
5. **Update `updatedAt`.**
6. **Commit the manifest in the same commit as the exports it indexes.** A manifest that points at
   uncommitted files is worse than no manifest.

### Verifying a re-run before you trust it

For sources whose text is byte-identical to the v2.1.2 run, the v2.1.2 → v2.2.0 diff must be
provenance-only:

```bash
node fixtures/diff-analysis.mjs lab-corpus/exports/02-fem-centrism-v2.1.2.json lab-corpus/exports/02-fem-centrism-v2.2.0.json --mode freeze
```

`RESULT: PASS` with `0 behavioral` is the expected outcome. Anything else means the re-run is not the
version bump it claims to be — investigate before updating the manifest.

After a canon alias expansion, use the recall gate instead, which fails on any score decrease or
dropped match:

```bash
node fixtures/diff-analysis.mjs before.json after.json --mode alias
```

---

## 6. When the corpus is single-version

Re-runs are complete when every entry in `manifest.sources` has a `current` export whose
`provenance.analyzer.version` equals the epoch's. At that point the distillation lane's cross-source
comparison (the 0% / 0% / 3.6% vs 50% contrast that produced the retention-gap finding) rests on one
instrument, one threshold set, and one canon snapshot — and the manifest can prove it.
