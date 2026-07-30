# RUN-STATE — doctrine research combo run

**This file is the run's checkpoint.** A fresh orchestrator session should be able to resume from it
without reading the conversation that produced it. Updated per batch.

- **Run:** doctrine research combo run, three batches of research scouts feeding the LE Lab.
- **Started:** 2026-07-29. Ratification: Jason's single front-loaded GO for the full three-batch plan.
- **Orchestrator:** Claude Opus 5, effort xhigh. Coordinates only; does not research or review.
- **Instrument:** LE Lab v2.6.1, frozen for the run's duration. No Lab file has been modified.
- **Repo at last update:** branch `main`, parent commit `1081155`. All three batches ingested, reviewed and
  **pushed**. Batch 3 took three cold reviews to clear.

> ## ✅ CURRENT STATE: ALL THREE BATCHES COMPLETE, REVIEWED, AND PUSHED
>
> Batch 3's second cold review returned `INTEGRITY: CONTEST` on unit 34 and halted the run. **Jason ruled: run
> a third cold review of the repaired packet, then push.** Review 3 returned **ACCEPT 36 · REWORD 4 · CONTEST 3
> · INTEGRITY 0**, with unit 34 itself **ACCEPT** and the repair verified. **Escalation closed; all seven
> quality findings applied; batch 3 pushed.** See **§5ac0** for the close-out, **§5ac** for the escalation.
>
> Two things a fresh seat must not miss: **batch 2 is repaired but unre-reviewed** (§5aa) — the one artifact in
> the run whose repair no cold reviewer has seen — and the referee-block spec lives in **§5ad** because it was
> previously carried only in a dispatch prompt.
>
> **The run promoted no doctrine.** That is the outcome, not a shortfall: three clusters came back weaker than
> checkpoint 01 recorded them, one came back with two citation corrections, and the one quantitative finding
> has two live readings the run refuses to choose between. The referee block carries all of it.

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

### Batch 2 — VERIFICATION-FIRST — **sources ingested and committed (`bdfeb2f`); cold review in flight**

All three scouts returned. Six sources archived, manifest 10 → 16, **87 hashes verified, 0 failures**.
Deliverables in `md/doctrine-run/batch2/`: three `S-*-findings.md`, three `S-*-capture.json`,
`review-packet.md` (23 items). Not yet pushed — waiting on the review, per push-per-completed-batch.

| # | Source | Grade | Words | Claim-like | Mapped | Share | Queue | Scout overlap |
|---|---|---|---|---|---|---|---|---|
| 11 | IFS / Wang, Gen Z partner priorities | A | 2,098 | 55 | 7 | 12.7% | 48 | 70.5% |
| 12 | NEP exit-poll methods statement | B | 592 | **0** | 0 | n/a | 0 | 64% |
| 13 | Wheatley "Counterfeit Connections" | B | 8,479 | 129 | 7 | 5.4% | 122 | 88.6% |
| 14 | Common Sense Media / NORC | B | 4,963 | 17 | 1 | 5.9% | 16 | 78.6% |
| 15 | ASC / Cox, American Friendship | A | 4,592 | 17 | 0 | 0% | 17 | 90.9% |
| 16 | Pew, emotional support (ch. 2) | A | 819 | 3 | 0 | 0% | 3 | **40%** |

**C8 did not survive verification.** Figure 1 corrected four ways — sponsor is IFS/YouGov alone (not
AEI/IFS); sample is 2,000 men + 1,000 women, not a balanced 3,000, opt-in panel, no published MOE; **the
36% belongs to conservative WOMEN (36.39), conservative men are 36.98 → 37**, and the recorded
"liberal women 60% vs conservative men 36%" pairing appears in no source; and it is **not a ranking
question** — ten qualities rated independently. The same data undercuts "asymmetrically by sex": liberal
men's political-over-job gap (+8.18) exceeds liberal women's (+5.76), and the conservative sex gap is
0.59 points with men higher. Figure 2 is **UNVERIFIED** — no such instrument exists, two sources
contradict the divergence reading, and "gender gap" carries two incompatible definitions (11 vs 31
points) where the larger double-counts against the historical series.
**C2** weakened: opt-in quota panel, lifetime-ever headline items, user-denominator preference figure, no
current-relationship item, independent source has the wrong population, nothing measures displacement.
**C10** splits three ways rather than confirming: the usual citation genuinely lacks the concentration
step, one wrong-population source finds it, and Pew 2025 finds **no sex gap in partner reliance at all**.

**Source 12 returned zero claim-like segments** — a one-page election-methods statement with no domain
claims, archived for provenance not yield; an empty claim surface is the gate behaving correctly.
**Source 16's 40% overlap was MY extraction, not a scout failure** — investigated and resolved as a span
difference (the scout merged the landing page with the chapter; the whole fetched page holds only 1,626
words including chrome, so 819 is the chapter's real prose, and the decisive sentence is present
verbatim). Recorded because the cross-check is supposed to catch the orchestrator too.

### Batch 3 — CITATION-GRADE CLOSERS — **ingested, packeted, reviewed THREE TIMES, repaired twice, pushed**

All four scouts returned (S-G, S-H, S-I-A, S-I-B). Six sources ingested (manifest 16 → 22), packet authored
under the two-part doctrine, **two** cold reviews run, both repair passes applied, dispositions written to
`md/doctrine-run/batch3/review-dispositions.md`. Review 2 returned an `INTEGRITY: CONTEST` and halted the run;
Jason ruled for a third review, which **cleared it** (ACCEPT 36 · REWORD 4 · CONTEST 3 · INTEGRITY 0, with unit
34 itself ACCEPT). **Batch 3 is pushed.** See **§5ac0** for the close-out and **§5ac** for the escalation.

The paragraph that used to sit here said "no source ingested, no packet authored, no review run." That was
true when written and is now stale in every clause; it is replaced rather than annotated so a fresh seat cannot
act on it.

Headline results, as data:
- **S-H (C9):** the gate architecture reaches **TIER 1** — independently preregistered-replicated by Zhang
  et al. 2019 (no author overlap with Li), with Marzoli et al. 2013 *partially failing* to replicate the
  resources-for-women half. But the **convergence half is TIER 2 with no independent replication, and
  cannot be**: neither independent lineage varied budget size, so neither could test it. The
  surveys-are-free inference is **TIER 3 as sourced** — Li's own rationale, never isolated against a real
  unconstrained-survey comparison. The adjacent stated-vs-revealed divergence *is* TIER 1 (Eastwick &
  Finkel 2008, independently replicated by Selterman et al. 2015).
- **S-G (C4):** the dyadic-vs-structural mechanism **is instrumented, and the structural half came out
  weak or contradicted in both direct tests found.** Trent & South 2011 (n=3,821, China) derived competing
  predictions and the data matched demographic-opportunity theory, *not* the structural prediction. Dollar
  2014 found the structural-power operationalisation contradicted the theory in the pooled US sample —
  their words, "relatively weak support for Guttentag and Secord's hypothesis on female structural power
  as a contingency factor." So C4's missing half is not merely absent from the site; it is partly
  falsified. Also: Filser & Preetz 2021 (n=12,402) find objective local sex ratio correlates only weakly
  with *subjective* partner-market experience — a caution for any sex-ratio claim. The G&S book itself was
  never reached; all dyadic/structural definitions come through Dollar's quotation, labelled as such.
- **S-I-A (C12):** citation corrected — **Hirschl**, Schwartz & Boschetti, *Demography* 61(5):1293–1307
  (2024), DOI 10.1215/00703370-11558914 (the prior record's "Schwartz et al." is wrong). The **1990
  inflection belongs to homogamy, not hypergamy**; hypogamy's rise is continuous from 1970. Relationship
  to Esteve 2016 is **refinement, not correction** — Esteve never treats homogamy as a construct, and
  there is no numeric conflict, so the site's existing citation is incomplete rather than wrong. Findings
  are sourced to the CDE working paper; the published body text was unreachable (Duke UP 403) with the
  abstract cross-checked word-for-word.
- **S-I-B (C1d):** the strongest analytical return of the run. **All three components of the suffocation
  model are asserted rather than measured, in different ways.** Demand concentration is TIER 3 and *is not
  the claim the phrase implies* — the article explicitly rejects the "more is asked of marriage" reading as
  other people's and claims an Altitude × Time interaction with total demand roughly constant, which means
  the site's uncited premise sentence may misattribute the model. The investment shortfall is measured only
  for clock time and only through secondary sources. **Variance widening is never measured anywhere in the
  three Finkel sources** — no variance, SD, tail share, or quantile trend — and its strongest citation
  (Proulx et al. 2007) reports a *strengthening correlation*, a different quantity from a widening
  dispersion. The 2014 piece is a **target article reporting no original data**, so TIER 3 for every
  empirical claim despite a full read. Two further findings worth keeping: Feeney & Collins denied that
  high-altitude support is especially demanding and Finkel *partly conceded*, weakening the mechanism the
  mismatch depends on; and **no commentary disputed the variance claim because the target article had
  barely made it** — the half with predictive content never passed the commentary round. On time use, the
  harmonised AHTUS 1965–2012 series (Genadek, Flood & Garcia Roman) shows couples spending **more** total
  and alone-together time than in 1965 with both series **peaking in 1975 — Finkel's baseline year**;
  non-parents are −11 min/day from 1975 but **+53 min/day from 1965**, and the pre-1975 series is not
  reported in the target article.

**Batch 3 remaining work: none.** The §5ac escalation was closed by review 3 and the batch is pushed. Everything
on the old checklist — ingest, merge, author, review, dispositions, update this file, commit — is done.

| # | Source | Grade | Words | Claim-like | Mapped | Share | Queue | Scout overlap |
|---|---|---|---|---|---|---|---|---|
| 17 | Trent & South, sex ratios (China) | A | 6,689 | 97 | 16 | 16.5% | 81 | 95.2% |
| 18 | Li et al., necessities & luxuries | B | 7,588 | 117 | 31 | 26.5% | 86 | 87.9% |
| 19 | Zhang et al., preference replication | A | 4,257 | 86 | 33 | 38.4% | 53 | 67.9% |
| 20 | Marzoli et al., scenario manipulation | A | 6,503 | 86 | 9 | 10.5% | 77 | 74.3% |
| 21 | Hirschl et al., assortative mating (WP) | B | 3,352 | 32 | 6 | 18.8% | 26 | 74.6% |
| 22 | Finkel et al., suffocation (target article) | B | 26,323 | 576 | 22 | 3.8% | **554** | 61.8% |
| | **Total** | | **54,712** | **994** | **117** | — | **877** | — |

**159 manifest hashes verified against disk, 0 failures.** Deliverables in `md/doctrine-run/batch3/`: four
`S-*-findings.md`, four `S-*-capture.json`, `review-packet.md` (43 numbered units, 19,030 words),
`review-dispositions.md`.

### Batch 3 dispatch history — one scout failure and a recovery

- **S-G** (Sonnet high) — C4, Guttentag & Secord's dyadic-vs-structural mechanism plus sex-ratio empirics. Running.
- **S-H** (Sonnet high) — C9, Li et al. 2002 budget allocation plus the convergence and surveys-are-free halves. Running.
- **S-I** (Sonnet high) — C12 + C1d as one two-part assignment. **FAILED.** Terminated mid-run by an API
  output content-filtering block while writing long verbatim extracts. It had written `raw-01.txt` (1,766
  words) and nothing else — no `capture.json`, no findings. The partial capture is still useful: it
  identifies the C12 paper as **Hirschl, Noah, Christine R. Schwartz & Elia Boschetti, "Eight Decades of
  Educational Assortative Mating: A Research Note," *Demography* 61(5):1293–1307 (2024), DOI
  10.1215/00703370-11558914** (earlier: CDE Working Paper 2022-01, UW–Madison). Note the first author is
  **Hirschl**, not Schwartz — the claim was recorded as "Schwartz et al.", so that is already a citation
  correction.
- **RECOVERY:** re-dispatched as two smaller scouts, **S-I-A** (C12, Sonnet) and **S-I-B** (C1d Finkel
  suffocation model, Opus). Mitigations applied to both prompts, since the block was on output volume:
  one artifact each, verbatim extract **capped at ~1,000–1,400 words** on the most claim-dense passage
  rather than open-ended "800+", each file written in a single Write call, and an explicit instruction
  **not to reproduce verbatim source text in the final chat message**. This is the third distinct harness
  or API constraint the run has hit; see §7.

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

`words` in the manifest is a **whitespace-run count of the extracted text** (`text.trim().split(/\s+/)`),
not the analyzer's `totalWords`. It is **not** `wc -w`: in this shell's `C` locale `wc -w` mis-splits
multibyte characters and reads high — source 21 (347 multibyte chars) returns 3403 under `wc -w`, 3344 under
`LC_ALL=C.UTF-8 wc -w`, and **3352** by the whitespace-run count the manifest records. Verify `words` in
Node, not in the shell; an earlier version of this note said "plain `wc -w`" and would send a reader chasing
a phantom discrepancy.

## 5ac0. ✅ ESCALATION CLOSED — batch 3 review 3 cleared the repair, and three repairs had introduced new defects

**Jason's ruling on the §5ac escalation:** run a third cold review of the repaired packet, then push. Done.

**Review 3 — fresh subagent, no knowledge of reviews 1 or 2, fenced to the packet: ACCEPT 36 · REWORD 4 ·
CONTEST 3 · INTEGRITY 0** across the same 43 units. **Unit 34, the escalated unit, came back ACCEPT** with the
repair checked rather than accepted: the reviewer verified the "(as described in my assignment)" withdrawal
against S-I-B's own text and confirmed the conclusion is *"correctly narrowed to the candidate doctrine's
pairing rather than the published page."* On the gate overall: *"No claim, quote, figure, DOI or URL in Part One
was found to lack a basis in a cited source."* **The escalation is closed and batch 3 is pushed.**

**All seven quality findings applied, none rejected.** Two are worth carrying beyond this batch:

- **The 15 pre-batch-3 corpus sources had no locators anywhere in the packet** — identified by topic label only
  ("01 Pew online dating") while an appendix claimed to hold "locators for every source Part One relies on."
  The reviewer called that appendix the packet's **weakest unit** for asserting a completeness it did not have.
  Fixed: all 21 corpus sources now carry author, year, venue and URL from the committed manifest.
- **Unit 6's per-source figures carried no trust-class flag** while units 4 and 36 did — the same selective
  disclosure that produced the unit-34 escalation, on its last unflagged holdout. Flagged now.

**THE FINDING THAT MATTERS MOST FOR ANY FUTURE BATCH: three of review 3's seven findings are defects the
review-2 repairs themselves introduced or re-imported.**

- **Unit 3** — the repair named two limb-2 tier assignments when the packet relies on four (Esteve and the
  Hirschl WP are also graded TIER 1 on design). A count refuted by the packet's own contents, committed *while
  fixing* a different defect in the same unit.
- **Unit 40** — the repair withdrew the phantom 60% cross-check floor and then wrote "none of the six
  collapsed," smuggling the same unstated criterion back in.
- **Unit 14** — the repair withdrew "partly falsified" for a reason its own next two units contradict.

**Therefore: a repair pass needs its own verification pass against the same checks the original failed.** Three
of seven is high enough that **"repaired" must not be treated as a stronger status than "reviewed"** until the
repair has itself been reviewed. That is exactly the gap that left batch 2 repaired-but-unre-reviewed, and
exactly why requiring review 3 was substantive rather than ceremonial.

**One pattern did close.** Review 3 found zero integrity items and zero provenance over-scope defects — the
failure mode behind all three escalations. What worked was not a convention or a reminder but a mechanism:
**every unverifiable claim now carries an explicit trust-class flag naming what the reader cannot check.**

## 5ac. Batch 3 review 2 — the THIRD integrity escalation, since closed by review 3 (see §5ac0)

The batch-3 repair was completed as ruled (all five items), the packet was rebuilt with per-claim anchors and
43 numbered units, and a **fresh** cold reviewer with no knowledge of review 1 was dispatched. It returned:

**ACCEPT 24 · CONTEST 9 · REWORD 9 · INTEGRITY: CONTEST 1** across 43 units.

**The escalated unit is 34 — the C1d misattribution paragraph.** Two independent defects in one unit:

1. The packet asserted *"Checkpoint 01's own reverse-check records that passage as 'unnamed, uncited'"* — a
   quotation from a document **not in the packet, with no citation of any kind**, which was the **sole support**
   for the unit's exculpatory conclusion. The same unit disclosed the trust class of its *other* unverifiable
   item (the site quote) two paragraphs later. **The orchestrator knew to flag trust class and flagged one of
   two.**
2. The packet wrote that S-I-B *"independently records"* the vocabulary absence. **It does not.** S-I-B's own
   sentence reads "the website's premise sentence **(as described in my assignment)** uses none of the model's
   distinctive vocabulary" — the scout never saw the page, so its observation is derived from the
   orchestrator's own description. One source presented as two.

**Both charges accepted; nothing rejected.** The quotation is *accurate* (`md/claude-doctrine-checkpoint-01.md:89`
reads it verbatim), so this is not fabrication — it is an uncited true statement carrying a conclusion the
reader was not allowed to check. **Repaired** by grounding the conclusion in four repository checks (the
callout at `dd-relationships-throughout-history.html:269–273` carries no `dd-callout-cite` while 10 others in
the file do; `Finkel`/`suffocat`/`Mount Maslow`/`oxygenat`/`all-or-nothing` occur zero times in that file;
site-wide `Finkel` appears only as a speed-dating co-author; checkpoint 01 now cited at file:line as
corroboration), all disclosed as orchestrator-side controls. "Independently" withdrawn.

**This is the run's third escalation and the third instance of one failure mode** — the orchestrator stating
something more confidently than its own artifacts support, in the provenance layer. Batch 2 ITEM 15 (locators
shed in compression) → batch 2 unit 30 (read status asserted falsely) → batch 3 unit 34 (external quotation,
uncited, selectively undisclosed). **Corrected three times, recurred three times, caught by review every
time and never by the orchestrator's own pass.**

**Also at cluster scale for the second time: the citation floor.** Six of the nine CONTESTs are one defect —
S-H defers all five of its locators to a `capture.json` that is not embedded, and the Dollar dissertation, the
packet's single most load-bearing unhashed source, carried no title and no URL. Batch 2's Cluster 3 failed the
same way (S-F: zero URLs, zero DOIs across seven sources). Repaired by adding a **CITATION APPENDIX** (unit 43)
built from the committed capture files. **That is a patch on the packet, not a fix to the process: future scout
prompts must require locators inline in the findings file, because the findings file is what gets embedded.**

**A miscorrelation risk the adjudication surfaced:** because `Finkel` *is* on the site as a speed-dating
co-author, any canon or citation sweep keyed on the surname will find Finkel cited and could wrongly conclude
the suffocation model is sourced. Two unrelated Finkel literatures, one on the site.

**What Jason needs to rule on:** whether the unit-34 repair closes the escalation and batch 3 may be pushed.
Everything is committed locally. Full adjudication in `md/doctrine-run/batch3/review-dispositions.md`.

## 5ad. THE CONSOLIDATED REFEREE BLOCK — standing spec, recorded here because it was not

The batch-3 seat was told this file carried the referee-block spec. **It did not** — the spec existed only in
the dispatch prompt. Recorded now so it survives the seat. The referee block is
**`md/doctrine-run/referee-block.md`** and it must carry:

1. **Run-state summary** — enough that a referee needs no other file.
2. **Batch ledger** — every source, grade, words, claim-like, mapped, share, residue, scout overlap.
3. **Full dispositions** — every review, every unit, ACCEPT/CONTEST/REWORD/INTEGRITY, with adjudications.
4. **Residue as a first-class result**, not a backlog.
5. **Miscorrelation items with unit IDs**, handed over unacted-on (flag-mapping is Jason's alone).
6. **An UNSANITIZED disclosures section** carrying, at minimum: every integrity escalation with its
   resolution; every charge the run *rejected*, with reasons; scout failures; every harness and API
   constraint; both provenance grades **and what neither guarantees**; and a **synthesis-error record**.
7. **The synthesis-error record is a deliverable, not an appendix** — the referee is comparing lanes on
   exactly this. Enumerate every orchestrator error, group them into failure patterns, state which patterns
   were closed and which recurred, and list every countermeasure with a verdict on whether it worked.

## 5ab. Batch 3 review 1 — no escalation, but the quantitative finding needed repair

**ACCEPT 1 · REWORD 1 · CONTEST 6 · INTEGRITY 0** across 8 units. No fabrication found; the reviewer
affirmed the gap-recording behaviour and noted the per-source shares reconcile to integer counts, "which
is what real measurements do and invented ones generally do not."

**THE CENTRAL CHALLENGE, AND ITS RESOLUTION.** The reviewer's strongest finding was that the quantitative
finding's load-bearing warrant — instrument constancy across both arms — was documented in the packet for
**6 of 13 sources only**, and that the documentation gap was **asymmetric in the direction that would
manufacture the effect** (5 of 7 formation sources this-batch; 1 of 6 maintenance sources). If the canon
had grown between batches, later-analyzed sources would map better and the formation arm is
disproportionately later-analyzed.

**Checked directly against every export on disk, and the confound does not exist in the data:** all 21
analyzed sources share **one canon snapshot `1.0.0+949aef381d5f`, one scoring config `bt0a7p`, and one
analysis schema `le-lab.analysis/2.6`**. Only the analyzer version differs (2.6.0 for sources 01/02/04,
2.6.1 for 05–22), and v2.6.1 was proven behaviorally identical on this corpus (0 of 46,350 pairs moved).
The merge script hard-fails if any non-analyzer epoch field moves, which is why this held.

**So the finding survives — and it survives because the review forced the check.** The reviewer was right
to refuse the warrant: the packet asserted constancy without evidencing it. Same failure class as the
batch-2 provenance defect — knowing something and not putting it in the artifact. **The repair is to
document the epoch constancy across all 22 sources from the manifest, not to re-argue it.**

**ONE ALTERNATIVE EXPLANATION REMAINS GENUINELY OPEN and I did not consider it.** "Other" scores 4.4%,
*below* maintenance's 7.0%, and method papers score 0.0%. That gradient is at least as consistent with
"the canon fires on material topically near its core — mate preference and formation — and decays with
distance" as with a formation/maintenance *stage* asymmetry. Those two readings say different things about
the site, and the packet never weighs them. This is the most substantive unresolved item in batch 3.

**Confirmed factual errors to fix (mine, not the scouts'):**
- **Source 01 at 43.5% is the highest formation share AND the highest in the corpus — not source 19 at
  38.4%.** The packet asserts 19 is highest twice, and its own per-source list refutes it both times.
- Distribution overlap is **3 of 13**, not 2: formation source 11 at 12.7% also sits inside the
  maintenance range (between 09 at 12.2% and 08 at 14.2%).
- "22 sources" labels a 21-ID enumeration (source 03 has no export and contributes nothing).
- **15 of 22 sources are never named**, so the stage classification cannot be disputed for them — including
  5 of 6 maintenance sources supplying 840 of that arm's 1,416 segments. The classification was also made
  with the mapped shares already in hand, which the packet does not disclose.
- C4: **"partly falsified" overstates S-G's "weak, mixed, or contradicted"**, and I dropped three defeaters
  Part Two supplies — Dollar's own attribution of the null to "my rudimentary measure," the theorized
  relationship holding for Black and Hispanic populations, and South (1988) reportedly finding stronger
  support on a similar measure. I also mis-credited the unreached-book gap to myself when S-G flagged it
  first, and *understated* my own evidence base: the dyadic/structural definitions come through **two**
  independent secondary readers, not Dollar alone.
- C9: the gate architecture claim is misscoped — Zhang replicated the sex-typed **allocation** pattern at a
  **single fixed budget**, which cannot demonstrate a budget-gated necessity/luxury architecture.
- C1d: **"No commentary disputed the variance claim" converts an explicit UNVERIFIED into a flat negative
  existential about 13 unread papers.** "All three components are asserted rather than measured"
  contradicts my own next bullet. The "site states this premise nearly verbatim" claim quotes **neither**
  text and S-I-B says the site's sentence "uses none of the model's distinctive vocabulary" — so the
  misattribution inference is unsupported and points the wrong way. GFG is **not** an independent check (it
  re-analyses the same time-diary series), and I dropped its own exculpatory wrinkle.
- Provenance: the "three sources not archived" enumeration is **materially incomplete** — Kruger, Filser &
  Preetz, the Secord abstract, Esteve, and S-I-B's REPLY/PRÉCIS/GFG are all primary reads outside the hash
  chain, and four of them carry load-bearing Part One claims. Source 21's extractor is misattributed
  (S-I-A used r.jina.ai, not pdftotext). "Three lowest" then explains four. "None fell below 60%" invokes a
  floor stated nowhere. No hash digest appears in either packet, so "verifiable from the repository alone"
  is not verifiable from the document.

**Verdict on the two-part doctrine, from the reviewer:** keep it. "Because Part Two carries the locators,
tiers and gaps verbatim, most of the defects above were *detectable*… A single-layer packet would have
hidden all three." Two required fixes: **per-claim anchors** into Part Two (cluster-level pointers are not
citations), and stop advertising byte-auditability a reviewer fenced to one file cannot perform — the
structure delivers auditability of *reasoning*, not of *bytes*.

## 5aa. ⛔ HALTED — batch 2 revision 2, a SECOND and DIFFERENT integrity escalation

The batch-2 repair was completed as ruled (all five items), the packet was rebuilt under the new two-part
doctrine with all three scout blocks **SHA-256-verified byte-identical**, and a **fresh** cold reviewer with
no knowledge of the first review was dispatched. It returned:

**ACCEPT 13 · CONTEST 9 · REWORD 8 · INTEGRITY: CONTEST 1** across 31 units.

**The new escalation is unit 30 — the PROVENANCE section itself.** My scope sentence reads: "Every other
source cited anywhere in this packet — including all of Cluster 1's revealed-sorting literature, the
Romantic Recession instrument, the Gallup/HBR figure, 'Secret Soulmates', Sun & Schafer, Shin & Park,
Dykstra & de Jong Gierveld, and McPherson et al. — **was read by a scout** but never archived."

**Verified against the embedded scout files: that is false for most of the list.** They record, verbatim,
"did not fetch it", "did not fetch the article", "FAILED TO REACH FULL TEXT", "could not retrieve the HBR
article's full text", "UNVERIFIED-TO-PRIMARY", and "not from text I read myself". The reviewer escalated on
the "unverifiable source presented as verified" condition, and located it correctly: the provenance layer is
precisely where a reader is entitled to rely on read/unread status.

**Mitigation the reviewer itself established, and which I confirm:** *no figure from any unread source is
carried into Part One.* No unverified number entered the findings through this door. The defect is a
false read-status assertion, not propagated bad data, and not fabrication — the reviewer states no
fabrication was found anywhere in the packet, and independently verified every DOI as well-formed and
venue-consistent.

**FIX APPLIED in the batch-3 repair seat — read this precisely.** The one-line fix was ruled available at
escalation time and **was not applied then**; the batch-2 packet sat in the working tree still carrying the
false assertion, and a `grep` for "was read by a scout" missed it because the clause line-wraps. It is now
repaired: the blanket claim is withdrawn and replaced with a per-source read-status audit in three tiers —
**read to primary** (Romantic Recession, "Secret Soulmates"), **abstract or tool-summary only** (Sun & Schafer,
Dykstra & de Jong Gierveld, Shin & Park), **not reached at all** (the Gallup/HBR figure, McPherson et al., and
three items in Cluster 1's revealed-sorting literature where S-D records "FAILED TO REACH FULL TEXT", "did not
fetch the article", "did not fetch it"). "TIER 3 as sourced" is now applied to the second and third groups, and
the no-figure-carried mitigation is stated.

**The corrected batch-2 packet has NOT been re-reviewed.** Batch 2's status is **repaired but unre-reviewed**,
which is weaker than batch 1 or batch 3. A referee should treat it as such.

**This defect does NOT obviously repeat in batch 3.** Its equivalent claim ("three sources S-H and S-G read
primary were not archived") is accurate: S-H recorded all five of its raw files as byte-level verbatim
extractions, and S-G read the Dollar dissertation as raw-02. Batch 3's own review is still in flight.

**Other confirmed batch-2 findings worth carrying (quality, not escalating):** unit 14 is the weakest
reasoning in the packet and the reviewer is right — my "gender gap" correction attributed a residual to
Edison's 12/13/24 reweighting when the CAWP figure already incorporates it and the two numbers come from
**different instruments** (Edison vs AP VoteCast), a distinction Part Two documents directly; the "≈15.5"
pivot is in no source. Unit 12 is a real figure-fidelity error: I used the 0.59 *level* difference inside a
bullet scoped to the political-minus-job metric, where the conservative gap is actually 27.53 — which
*reverses* that bullet's conclusion. Units 10 and 11: the two "Stable job" values carrying the headline
−33.35 appear nowhere in Part Two, so that correction asserts a digit its recorded inputs cannot determine.
Unit 16: I claimed Part Two carries a URL "for every figure," and S-E contains exactly one URL.
**Cluster 3 fails the citation floor outright** — S-F contains zero URLs and zero DOIs for any of its seven
sources, so on the stated floor Cluster 3 cannot be promoted as it stands.

**Cluster 1's central correction survives, and more strongly than I claimed it.** The reviewer found a
second, appendix-independent leg I had under-used: Abrams' AEI commentary, quoted verbatim in Part Two with
its own URL, splits the subgroups as "conservative young women (36 percent), liberal young men (47 percent),
and conservative young men (37 percent)." So the subgroup attribution holds even if the Plotly read is
discounted entirely.

## 5a. ⛔ RUN HALTED — batch 2 integrity escalation (FIRST), resolved by Jason's ruling

**Batch 2's cold review returned `INTEGRITY: CONTEST` on ITEM 15.** Per the run contract — "halt if a
cold-review CONTEST alleges fabrication or an unverifiable source (integrity findings escalate to Jason;
quality findings do not)" — the run is halted at batch 2 close-out. **Batch 2 is NOT pushed.**

Batch 2 review totals: **ACCEPT 5 · CONTEST 11 · REWORD 7 · INTEGRITY 1.** Markedly worse than batch 1
(ACCEPT 21 · CONTEST 5), and the reviewer diagnosed why — see the systemic finding below.

**The escalated item, and the orchestrator's verification of it.** ITEM 15 reproduced a verbatim survey
item and a percentage from a Wheatley/IFS follow-up ("Secret Soulmates", n = 2,431; 54% agreeing "I use
romantic AI companion(s) to replace human relationships") with **no author, no year, no URL, no tier, no
UNVERIFIED marker**, and the packet's PROVENANCE section omitted ITEM 15 from its own list of unarchived
sources. The reviewer escalated on the "unverifiable source presented as verified" condition and
explicitly did **not** allege fabrication.

Checked against `md/doctrine-run/batch2/S-E-findings.md`: **the scout sourced it properly and the
orchestrator dropped the provenance when compressing.** S-E supplies the full author list (Willoughby,
Carroll, Toscano, Hakala & Morris), the year (2026), the institutions, the sampling design (Qualtrics
opt-in quota panel, 18–30, currently partnered), the exact question stem with a men's breakdown
(21.5% never / 38.9% sometimes / 21.3% often), a URL
(`https://wheatley.byu.edu/0000019e-1cfd-da4c-a5ff-befd20b10001/secret-soulmates-report`), and records
the report under "Verified to primary — full report PDF read in full."

So the escalation is **valid against the packet and invalid against the source**: a transcription and
provenance failure by the orchestrator, not an unverifiable claim and not fabrication. It is fixable by
restoring what the scout already supplied.

**A second, more substantive defect found during that check, which the reviewer could not see.** The
packet reported the 54% "replace" figure without its counterweight: the same report finds **68% of the
same users said AI companions enhanced their real-life relationships**, and the report itself calls this
a "paradox" with respondents not forced into a single bucket. Omitting it made the packet read more
one-sidedly toward substitution than the source supports. This is worse than the missing URL.

**The reviewer's systemic finding, which is correct and matters beyond this batch:** citation
completeness tracks archival status. All six archived sources (11–16) carry organisation, year, URL,
verbatim strings, and correct tiers. **Nine of the eleven CONTESTs are against scout-read, unarchived
sources missing a URL, a tier, or both** — and in every case checked so far, the scout findings DO carry
the locator and the packet dropped it. Most repairs are mechanical (restore locators from the findings
files); ITEMs 5, 7, 19 and 20 need analytic repair, not just links.

Other confirmed defects worth carrying: an arithmetic slip at ITEM 2 (36.39 − 69.74 = −33.35, not
−33.34); ITEM 7's "roughly double" for an 11-vs-31 gap that is actually a factor of 2.8, with the
remainder attributable to the reweighting the packet's own ITEM 5 records; ITEM 17's "batch's strongest
instrument" superlative contradicted by the packet's own n = 6,204 and n = 5,837; and a TIER 1/TIER 2
inconsistency between ITEMs 8, 17 and 20 on comparable probability-panel instruments.

**Cluster 1's central corrections survive the review.** The reviewer ruled the 36%-is-conservative-women
correction "adequately evidenced" (per-row Sex/Ideology values plus verbatim prose grouping conservatives
and never splitting them), with the qualification that the two-decimal values come from a Plotly read
outside the deterministic extraction chain — so the direction holds and the claimed precision is one
notch weaker than this run's own rules require. The not-a-ranking-question correction is "adequately
evidenced as an inference, overstated as a verified fact," since no questionnaire was ever published.

**Batch 3 scouts were left running** rather than killed — they are independent research and the halt
concerns batch-2 close-out. S-G, S-H, S-I-A and S-I-B may report while this escalation is open; their
output will be archived but batch 3 will not be closed or pushed until Jason rules.

## 6. STOP CONDITIONS — one fired (see §5a)

- Lab analysis failing on a normalized source — **no**, all six analyzed.
- Checkpoint conflicting with repo state — **no** (see §1; the checkpoint was absent, not conflicting).
- A subagent proposing to modify the Lab — **no**. Three scouts returned maintainer-facing
  observations in findings prose, as the contract requires, and generated no feedback files.
- A cold-review CONTEST alleging fabrication or an unverifiable source — **YES, THREE TIMES; all three closed.** Batch 2
  ITEM 15 (§5a), batch 2 revision 2 unit 30 (§5aa), and batch 3 review 2 unit 34 (§5ac). **All three alleged an
  unverifiable source presented as verified; none alleged fabrication, and no reviewer found fabrication
  anywhere in any packet.** All three were valid against the packet and repaired. Batch 1 and batch 3 review 1
  returned zero INTEGRITY items. The third was closed by a third cold review that returned
  zero integrity items (§5ac0). **No stop condition is currently active.**

## 7. OPERATING NOTES

**The checkout is shared and Jason edits it concurrently.** During batch 1 he committed and pushed
three Lab commits (`e48c9d5`, `85a930d`, `845f56a`), moving HEAD off `c40cd7f`. Consequences observed:
- A test run taken mid-save reported 150 tests / 1 failure. Re-run twice afterwards: **171 pass / 0
  fail, exit 0**. The transient was an inconsistent tree snapshot, not a real failure; the count moved
  170 → 171 because his commit adds one test.
- `js/`, `data/`, `scripts/`, `tools/`, and `fixtures/` were untouched throughout, so the analyzer,
  canon, and extractor used for all six analyses are exactly the committed v2.6.1.
- Always stage explicit paths. Never `git add -A`. `artifacts/` is untracked and not this run's.

**Harness and API constraints hit by this run — three distinct ones, all worked around:**

1. **The Write tool refuses files literally named `findings.md` for subagents.** Cost three scouts time in
   batch 1 (one renamed via Bash, one saved under a different name, one could not write at all and returned
   its findings as chat text, which is why `S-A-findings.md` is a transcription). Batch 2 onward specifies
   `evidence-notes.md` and the problem disappeared.
2. **API output content-filtering terminated scout S-I mid-run** while it wrote long verbatim extracts for a
   two-part assignment. Topic was innocuous (educational assortative mating; a marriage-psychology model),
   so the trigger appears to be output volume and density of verbatim reproduction, not subject matter.
   Mitigation that worked: split the assignment, cap the extract at ~1,000–1,400 words on the most
   claim-dense passage, one Write call per file, and forbid echoing verbatim source text in the final
   message. **Any future scout asked for long verbatim capture should carry these caps from the start.**
3. **WebFetch refused verbatim reproduction of two specific pages** (the IFS and AEI articles in batch 2),
   forcing scout S-D to use the browser pane. Plain `curl` had no difficulty with the same URLs, which is
   why the archived artifacts are deterministic extractions rather than browser reads — and is a further
   argument for the orchestrator-re-fetch rule in §3.

**Flag-mapping feedback is Jason's alone.** Scouts and the orchestrator record suspected
miscorrelations in findings prose only; no feedback file is generated by this run.
