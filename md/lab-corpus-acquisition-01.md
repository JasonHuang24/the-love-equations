# LE Lab corpus — acquisition worksheet 01

**Status: PENDING GO. Nothing has been fetched.** This worksheet exists so Jason can approve
acquisition per source rather than approving "re-acquire the corpus" as one undifferentiated act.

Scaffolding is in place: `lab-corpus/sources/` and `lab-corpus/exports/` exist, `lab-corpus/` is
gitignored, and `lab-corpus.manifest.json` is committed at the repo root.

---

## The archive decision

RERUN.md §1 left this open: *"these are third-party texts. If they should not live in the repo, put
the archive outside it and record the absolute path plus the SHA-256 in the manifest instead."*

**Decision taken: the corpus stays out of the public repo.**

| | |
|---|---|
| Where | `lab-corpus/` in the working tree, gitignored |
| What is committed | `lab-corpus.manifest.json` at the repo root — identity, provenance, and SHA-256 per source |
| Why not a path outside the repo | A sibling directory drifts when the repo is cloned or moved. Keeping it in-tree-but-ignored means the relative paths in the manifest resolve for anyone who has the files, and the gitignore is what keeps the text unpublished |
| Why this is still verifiable | The manifest carries the SHA-256 of each source file. Anyone holding the corpus can prove theirs is the analyzed text; nobody without it gets a verbatim copy of third-party work from this repo |

This is the arrangement RERUN.md asked for, with the location chosen for path stability. `lab-corpus/`
is currently empty — the manifest records `"state": "scaffolded-empty"`.

---

## The four sources

Provenance is thin by design of the original run: the staging directory `.claude/lab-sources/` was
gitignored and deleted after the run, and no analysis or queue export was committed anywhere. What
survives is the summary tables in `md/RERUN.md` and `md/doctrine-distillation-claude-01.md`.

**No source URL was recorded at capture time for any of the four.** One was recovered afterwards by
matching title and date against an unrelated record elsewhere in the repo; it is labelled `inferred`
in the manifest and should not be treated as capture-time provenance.

| # | Source | Surviving provenance | URL | Re-acquirable | Confidence |
|---|---|---|---|---|---|
| 01 | **Key findings about online dating in the U.S.** — Pew Research Center, Feb 2 2023 | title, publisher, exact date, sample (n=6,034 U.S. adults, fielded July 2022) | **inferred** — recovered by exact title+date match from `md/mythbuster-grading-review.md:394` | **Yes** | High |
| 02 | **Fem-Centrism** — Rollo Tomassi, *The Rational Male*, 2011 | title, author, publication, year | none survives | **Likely** | Medium |
| 03 | **The Four Horsemen** — The Gottman Institute | title, publisher only — **no year, no URL** | none survives | **Uncertain** | Low |
| 04 | **On Heteropessimism** — Asa Seresin, *The New Inquiry*, 2019 | title, author, publication, year | none survives | **Yes** | High |

### Per-source notes

**01 — Pew.** The only one with a URL, and the easiest to re-acquire: a dated Pew short-read with a
fixed slug, which Pew does not silently rewrite. One complication that is not about acquisition: this
source ran on analyzer `v=1.7` and canon `1.0.0+6dc9bff7b0fe`, so its re-run moves **two variables at
once** (analyzer *and* canon) and its delta cannot be attributed to either alone. It also used 4
visitor includes; unit IDs are content-derived, so the old overrides will not match re-acquired text
and must be re-derived from the new run.

**02 — Fem-Centrism.** Availability is not the risk — the post has been live since 2011 and is widely
mirrored. **Drift is.** A self-hosted blog post can be edited silently and there is no dated archival
slug to pin against. Recommend acquiring from a Wayback capture dated on or before 2026-07-27 rather
than the live page. Note that 73% of this source's words were set aside as non-domain in run 01, so
the analyzed population is small and proportionally sensitive to any text change.

**03 — Four Horsemen. This is the weak one, and it is also the most consequential.** No year and no
URL survive, and "The Four Horsemen" names a commercial content-marketing article that Gottman has
published in several revised versions across more than one URL. Identifying *which* page was analyzed
is guesswork. That matters more here than anywhere else, because this run is the dossier's single
most diagnostic result — 885 words, 17 claim-like, **0 mapped** — and a re-run against a different
revision would quietly *replace* that evidence while looking like a reproduction of it.

**04 — Heteropessimism.** A dated 2019 magazine essay in a stable archive; not silently revised the
way a blog post or a marketing page is. It is also the most informative single re-run available:
it carried the only credible canon match in the entire run-01 corpus (1 of 55 claim-like segments,
to "The Market", Medium confidence), so it is the one source where a coverage change can show up as
something other than 0 → non-zero.

---

## What re-acquisition can and cannot prove

Worth stating plainly before any fetching happens, because the distinction determines what the
re-runs are evidence *of*:

- **Nothing acquired now can be byte-verified against what was analyzed in July 2026.** The staging
  was deleted. Every re-acquired file is `capturedBy: "reacquired"` and every re-run **supersedes**
  its predecessor rather than reproducing it.
- Therefore `--mode freeze` is the wrong gate for these. RERUN.md §"Verifying a re-run" reserves
  freeze for byte-identical text; none of these qualify.
- The canon has *also* moved since run 01 — `1.0.0+8c38a2f1d015` → `1.0.0+62c5cb511433` — so even a
  byte-identical text would now produce a different result by design. A re-run measures the current
  instrument against the current canon. That is worth having; it is not a reproduction.
- The archive's real payoff is **prospective**: once these files exist with committed hashes, every
  *future* re-run becomes a true reproduction. That is the point of doing it now.

---

## Recommended order, on GO

1. **04 Heteropessimism** — highest information, high acquisition confidence. The only source that
   can show a coverage change more interesting than 0 → non-zero.
2. **01 Pew** — high confidence, URL in hand, but flag the two-variable problem in its manifest note.
3. **02 Fem-Centrism** — acquire from a dated Wayback capture, not the live page.
4. **03 Four Horsemen** — acquire **only** if a capture dated on or before 2026-07-27 can be
   identified with confidence. If it cannot, **do not substitute a current version.** Keep the
   v2.1.2 artifact, mark it `within-version-only` for peer review, and record in the manifest that
   the source could not be re-identified. A silently-swapped Gottman page would corrupt the strongest
   finding in the run-01 dossier.

---

## What I need from Jason

1. **GO / NO-GO per source** (or a blanket GO for 01, 02, 04 with 03 held).
2. **Intake format** — plain `.txt` extraction of the article body is the assumption. Say if you want
   `.md` with structure preserved; it changes segmentation and therefore the claim counts.
3. **Wayback vs live** for 02 and 03 — my recommendation is Wayback for both, live for 01 and 04.
4. **03 specifically** — confirm the fallback: hold at v2.1.2 and flag, rather than re-run against a
   possibly-different revision.

On GO, each acquisition writes the text plus its `.source.json` sidecar, fills `sourceSha256` and
`capturedBy` in `lab-corpus.manifest.json`, and only then runs
`node fixtures/run-analyzer.mjs --source … --out lab-corpus/exports/…-v2.2.0.json`.
