# RUN-STATE — doctrine research combo run

**This file is the run's checkpoint.** A fresh orchestrator session should be able to resume from it
without reading the conversation that produced it. Updated per batch.

- **Run:** doctrine research combo run, three batches of research scouts feeding the LE Lab.
- **Started:** 2026-07-29. Ratification: Jason's single front-loaded GO for the full three-batch plan.
- **Orchestrator:** Claude Opus 5, effort xhigh. Coordinates only; does not research or review.
- **Instrument:** LE Lab v2.6.1, frozen for the run's duration. No Lab file has been modified.
- **Repo at last update:** branch `main`, commit `cb0d654`.

---

## 1. INTAKE CORRECTION — read this before trusting any earlier framing

The handover that started this run described resuming a paused run from a checkpoint, and supplied
`[CHECKPOINT_PATH]` as an **unsubstituted placeholder**. Intake established that **the run it
described had no state in this repository**:

- No `RUN-STATE.md` existed (this file is the first).
- No `scouts/`, `lab-exports/`, or `review-packets/` directories existed.
- The only checkpoint-named artifact, `md/claude-doctrine-checkpoint-01.md`, declares itself a
  FROZEN HISTORICAL ARTIFACT whose lane **closed** — "0 doctrine-ready candidates; lanes closed;
  epoch frozen."

The stop condition "checkpoint conflicts with repo state" did **not** fire: checkpoint 01 is fully
consistent with the tree. What was absent was the combo run's own state. This run is therefore a
**cold start built on checkpoint 01's residue**, not a resume — and checkpoint 01's architecture
(five genre scouts plus four adversarial verifiers) is a *different, older* design than the
scouts/intake/cold-reviewer rig used here. Run 01 closed without promoting doctrine; this run is its
harder-edged successor. There were no orphaned assignments to recover.

## 2. THE THREE RECONCILIATIONS, as resolved

**(a) Epoch — "all sources at v2.6.1" versus the shipped v2.6.1 ruling.** Not re-running sources
01/02/04. `md/lab-v2.6.1-sol-handover.md` records the standing ruling that v2.6.1 provably cannot move
them: `provider` and `breadwinner` occur zero times across all three, `provider` holds the canon's only
non-empty denylist, the threshold sweep returned 0 changed of 46,350 pairs, and the demo capture was
byte-identical before the version bump. Re-running would yield a provenance-only delta and would
reverse a decision already through cold review.
The manifest epoch now reads analyzer **2.6.1** with sources 01/02/04 retaining v2.6.0 exports, and
records that **every other epoch field is identical across the boundary** — analysis schema
`le-lab.analysis/2.6`, queue schema `le-lab.research-queue/2.1`, scoring config `bt0a7p`, canon
`1.0.0+949aef381d5f`. That identity, verified by reading it out of the six new exports rather than
from memory, is what makes cross-version comparison sound. `singleVersionStatus` states both
exclusions (source 03; the 2.6.0/2.6.1 split) in full.

**(b) Deliverable layout versus the not-published corpus ruling.** Raw third-party text cannot be
committed. Resolution: raw captures → `lab-corpus/sources/` (gitignored, hashed in the committed
manifest); analyses and companions → `lab-corpus/exports/` (gitignored, hashed); findings, review
packets, and this checkpoint → `md/` (committed). Batch deliverables live in
`md/doctrine-run/batch<N>/`.

**(c) A stale manifest string.** `singleVersionStatus.reason` claimed the acquired sources were
"single-version at 2.5.0" when the epoch was 2.6.0. Corrected as part of the batch-1 merge.

## 3. PROVENANCE DOCTRINE FOR THIS RUN — the load-bearing decision

`tools/extract-source-text.mjs` states in its own header that a model-mediated "read the page and
write it out" step is not reproducible byte-for-byte and breaks the corpus chain. **Research scouts
are model-mediated.** Therefore:

> **No scout capture is ever archived as a corpus artifact.** Every accepted source is independently
> re-fetched and re-extracted by the orchestrator. A source that cannot be fetched reproducibly is
> recorded as a gap, not ingested.

Two provenance grades, recorded per source in the manifest:

- **Grade A** — archived HTML → committed `tools/extract-source-text.mjs` → SHA-256. Verifiable from
  the repository alone. Same grade as pre-existing sources 01/02/04.
- **Grade B** — archived PDF → `pdftotext` 4.00 with recorded flags (`-enc UTF-8 -nopgbrk`) →
  recorded `awk` anchor truncation → SHA-256. Reproducible with the same tool version, but the
  extractor is an external binary rather than a hashed repo file, so it is **strictly weaker** and
  labelled as such. Used only where the publisher ships no HTML full text.

The scout capture survives as an **independent cross-check**: 8-word shingle overlap against the
deterministic extraction, recorded per source. A scout that paraphrased, truncated, or invented prose
shows up as collapsed overlap. This is corroboration of the scout, never provenance for the text.

## 4. BATCH STATUS

### Batch 1 — THE RETENTION GAP — **COMPLETE, reviewed, corrected, pushed**

Scouts: **S-A** (Opus 5 xhigh) Gottman primary + critique · **S-B** (Sonnet high) desire-decay
empirical leg · **S-C** (Sonnet high) mate-value discrepancy × alternatives. All three returned.
**C3** required no scout (site-internal) and was re-verified at `c40cd7f` and again at `845f56a`.

Six sources added to the corpus, all analyzed at v2.6.1, manifest 4 → 10 sources:

| # | Source | Grade | Words | Claim-like | Mapped | Share | Queue | Scout overlap |
|---|---|---|---|---|---|---|---|---|
| 05 | Kim, Capaldi & Crosby 2007 | A | 9,249 | 159 | 6 | 3.8% | 153 | 84.4% |
| 06 | Heyman & Slep 2001 | A | 3,484 | 46 | 0 | 0% | 46 | 95.1% |
| 07 | van Lankveld et al. 2021 | A | 6,642 | 170 | 12 | 7.1% | 158 | 99.0% |
| 08 | McNulty, Wenner & Fisher 2016 | A | 8,332 | 141 | 20 | 14.2% | 121 | 99.1% |
| 09 | Conroy-Beam, Goetz & Buss 2016 | B | 7,376 | 262 | 32 | 12.2% | 230 | 78.3% |
| 10 | Miller 2007 | B | 5,763 | 108 | 7 | 6.5% | 101 | 95.9% |
| | **Total** | | **40,846** | **886** | **77** | — | **809** | — |

All mapped shares **PROVISIONAL** (thresholds uncalibrated by design). 51 recorded manifest hashes
verified against disk, 0 failures. No scout fell below 60% overlap; **no scout fabricated prose**.

Substantive results, as data rather than adjudication:
- **An independent replication of the Gottman affective process models exists and FAILED** (Kim et
  al. 2007, Oregon Social Learning Center, zero author overlap, same SPAFF instrument), with a stated
  scope limit: it did not test the four-horsemen prediction equation head-on.
- **The primary table puts defensiveness above contempt** (husband defensiveness F=16.08 p<.001 vs
  contempt F=4.26 p<.05; husband criticism and wife stonewalling non-significant), which does not
  support the claim's own ordering.
- **The headline accuracies sit on three different denominators** (93% includes self-reported
  satisfaction and thoughts of dissolution; 95% discriminates early- from later-divorcing among the
  already-divorced, ~20 couples against 8 predictors; 83.5% is horsemen-plus-satisfaction whole-sample).
- **The primary corpus is one program on two cohorts**, established by near-identical recruitment
  prose; the critique side is four mutually independent lineages.
- **C1c returns a counter-finding**: primary-verified associations between security proxies and desire
  run *positive* (intimacy and partner responsiveness r=.25 each), the attachment-moderation
  hypothesis was rejected by its own authors, no instrumented mechanism test was reached, and
  sub-claim (c) has no located instrumentation at all.
- **C6's interaction test exists** but its "alternatives" term is a computed pool statistic over
  strangers the participant never saw — not the visibility the claim is worded on; and the 2017 review
  citing it as established is the same lab restating one dataset.
- **The residue contains its own corroboration of the retention gap**: Conroy-Beam et al.'s own
  sentence that "little research examines the role of mate preference psychology after mate
  selection" surfaced as an unmapped claim.

Deliverables: `md/doctrine-run/batch1/` — `S-A-findings.md`, `S-B-findings.md`, `S-C-findings.md`,
the three `capture.json` files, `C3-site-internal.md`, `lab-results-and-residue.md`,
`review-packet.md` (36 items, now revision 2), `review-dispositions.md`. Ingestion committed as
`cb0d654`; review corrections in the following commit.

**Cold review: ACCEPT 21 · REWORD 10 · CONTEST 5 · INTEGRITY 0.** All 10 REWORDs applied. 4 of 5
CONTESTs applied; **ITEM 11's charge was rejected with reason** — the packet's design description was
verbatim-faithful to the archived source, so the 88-versus-37 divorced-case discrepancy is the
*paper's* unexplained n drop, not a denominator the packet changed. The observation was kept and is now
disclosed as a preserved source defect. Four contested points were settled by re-reading archived
source text rather than by argument, which is only possible because those sources are in the corpus
with verified hashes.

One reviewer catch was a real error of mine: ITEM 17 had attached a subsample caveat to the *avoidant*
correlation when it belongs to the *anxious* one and runs the opposite way. Corrected. Two magnitude
adjectives ("medium effect size", "weakly positive") applied to the same r = 0.25 were both withdrawn —
the source supplies no adjective.

**Lesson for batches 2 and 3:** the corrections cluster in one failure mode — tier labels assigned to
sources that were never read. Four of five CONTESTs and two REWORDs are that. Assign **"TIER 3 as
sourced" to every unreached source by default** and state the counterfactual separately; never grade
what a source would rate if its secondhand description held.

### Batch 2 — VERIFICATION-FIRST — dispatched, scouts running

- **S-D** (Opus 5 xhigh) — C8. Verification IS the deliverable: the AEI/IFS ~3,000-respondent 18–29
  figure (60% liberal young women vs 36% conservative young men ranking alignment above job
  stability) and the Gen-Z exit-poll gender-gap series. Each returns VERIFIED / CORRECTED /
  UNVERIFIED. Secondary: stated preference versus revealed sorting.
- **S-E** (Sonnet high) — C2. The Wheatley/BYU Feb-2025 instrument plus any *independent* survey;
  prevalence versus substitution kept separate; vendor projections excluded as marketing-tier.
- **S-F** (Sonnet high) — C10. The Cox/Survey Center sex split with exact question wording and recall
  window, and an honest test of whether the sole-channel step exists in any source data — the prior
  pass recorded that it does not.

### Batch 3 — CITATION-GRADE CLOSERS — planned, not dispatched

- **S-G** (Sonnet high) — C4. Guttentag & Secord's mechanism half (dyadic vs structural power) plus
  campus sex-ratio empirics.
- **S-H** (Sonnet high) — C9. Li/Bailey/Kenrick/Linsenmeier 2002 budget-allocation primary plus the
  budget-convergence replication line.
- **S-I** (Sonnet high) — C12 + C1d. Schwartz et al. *Demography* 2024 and the Finkel
  suffocation-model primary.

## 5. THE RIG — how to reproduce or continue the pipeline

Lives in the session scratchpad (not committed; it is orchestration, not doctrine):

- `export-companions.mjs` — emits `.queue.json` and `.md` by consuming the frozen `js/lab-export.js`.
  **Validated byte-identical** against the committed v2.6.0 companions of source 04, once a trailing
  newline is appended (the UI's download path adds it; without it every file is one byte short).
- `ingest-source.mjs` — extraction (grade A or B) → scout cross-check → analysis → companions →
  labeling sheet → manifest entry. Metric field names were verified against source 04's committed
  `result` block; three initial guesses were wrong (`mappedClaimSegments`,
  `mappedClaimSegmentSharePct`, and `provisional` being a nested object).
- `run-batch.mjs` — drives a spec array, writes entries to a staging file. Deliberately does **not**
  write the manifest.
- `merge-manifest.mjs` — the only writer of the committed manifest. Refuses on id collision, on epoch
  disagreement among new exports, and if any non-analyzer epoch field has moved. Dry-run by default.

`words` in the manifest is plain `wc -w` on the extracted text, not the analyzer's `totalWords`.

## 6. STOP CONDITIONS — none fired

- Lab analysis failing on a normalized source — **no**, all six analyzed.
- Checkpoint conflicting with repo state — **no** (see §1; the checkpoint was absent, not conflicting).
- A subagent proposing to modify the Lab — **no**. Three scouts returned maintainer-facing
  observations in findings prose, as the contract requires, and generated no feedback files.
- A cold-review CONTEST alleging fabrication or an unverifiable source — **no**. Batch 1's review
  returned **zero INTEGRITY items**; the reviewer stated that every gap named its barrier and labelled
  its retrieval mode, and that no quote, figure, or citation read as fabricated. Its five CONTESTs were
  all quality findings (four of them tier-label defects), which by contract do not escalate.

## 7. OPERATING NOTES

**The checkout is shared and Jason edits it concurrently.** During batch 1 he committed and pushed
three Lab commits (`e48c9d5`, `85a930d`, `845f56a`), moving HEAD off `c40cd7f`. Consequences observed:
- A test run taken mid-save reported 150 tests / 1 failure. Re-run twice afterwards: **171 pass / 0
  fail, exit 0**. The transient was an inconsistent tree snapshot, not a real failure; the count moved
  170 → 171 because his commit adds one test.
- `js/`, `data/`, `scripts/`, `tools/`, and `fixtures/` were untouched throughout, so the analyzer,
  canon, and extractor used for all six analyses are exactly the committed v2.6.1.
- Always stage explicit paths. Never `git add -A`. `artifacts/` is untracked and not this run's.

**Harness quirk, cost three scouts time in batch 1:** the Write tool refuses files literally named
`findings.md` for subagents. Batch 2 prompts specify `evidence-notes.md` instead.

**Flag-mapping feedback is Jason's alone.** Scouts and the orchestrator record suspected
miscorrelations in findings prose only; no feedback file is generated by this run.
