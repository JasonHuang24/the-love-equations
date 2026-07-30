# CONSOLIDATED REFEREE BLOCK — doctrine research combo run, Claude lane

**What this is.** A single artifact a referee can read without the run's conversation, its three review
packets, or its checkpoint. It carries the run's state, its batch ledger, every review disposition, the
residue the run did *not* map, the miscorrelation risks its scouts flagged, and an unsanitized disclosure
section that includes a complete record of the orchestrator's own errors.

**How to read it.** Sections 1–3 are the record. Section 4 (residue) and Section 5 (miscorrelations) are
findings the run is *not* claiming as doctrine and is handing over instead. Section 6 is the part written
against the lane's own interest, and Section 6.7 is the one the referee should read first if it is
comparing lanes on discipline rather than output.

**One framing the referee should hold throughout.** This lane's instrument — the LE Lab canon mapper — is
**uncalibrated by design**. Every mapped-share figure in this document carries `coverage.provisional = true`
in its source export. No number here is a measurement of the world. The only quantitative inference the run
claims is a *within-instrument contrast*, and Section 6.7 records the errors made in claiming even that.

---

## 1. RUN-STATE SUMMARY

| | |
|---|---|
| **Run** | Doctrine research combo run — three batches of research scouts feeding the LE Lab |
| **Started** | 2026-07-29. Ratification: Jason's single front-loaded GO for the full three-batch plan |
| **Orchestrator** | Claude Opus 5, effort xhigh. Coordinates only; does not research or review |
| **Scouts dispatched** | **11** (S-A … S-I, then S-I-A and S-I-B). **10 returned; S-I failed** and was recovered as two |
| **Cold reviews run** | **5** — batch 1 ×1, batch 2 ×2, batch 3 ×2. Each a fresh subagent fenced to one file (§3) |
| **Instrument** | LE Lab v2.6.1, frozen for the run's duration. **No Lab file was modified.** |
| **Corpus** | 4 sources → **22 manifest IDs, 21 analyzed** (source 03 carries no export) |
| **Stop conditions fired** | **1 of 4** — cold-review CONTEST alleging an unverifiable source. Fired **three times**: batch 2 ×2 (§6.1, §6.2) and batch 3 (§6.2b). **The third is open; the run is halted on it** |

**What the run set out to do.** Take the residue of doctrine checkpoint 01 — which closed with *zero*
doctrine-ready candidates — and test its strongest claim clusters against outside primary literature under
a harder provenance rule than checkpoint 01 used. The run is checkpoint 01's harder-edged successor, not a
resume of it; there was no orphaned state to recover.

**The provenance rule that shaped everything.** `tools/extract-source-text.mjs` states in its own header
that a model-mediated "read the page and write it out" step is not reproducible byte-for-byte. **Research
scouts are model-mediated.** Therefore: *no scout capture is ever archived as a corpus artifact; every
accepted source is independently re-fetched and re-extracted by the orchestrator; a source that cannot be
fetched reproducibly is recorded as a gap, not ingested.* The scout capture survives only as a cross-check
— 8-word shingle overlap against the deterministic extraction, recorded per source.

**What the run did NOT do.** It promoted **no doctrine**. It produced no site change, no canon change, no
threshold change, and no feedback file. Three clusters came back weaker than the checkpoint recorded them;
one came back with two corrections to a citation; one came back with a quantitative finding whose
interpretation the run explicitly refuses to settle (§3.4, §6.7).

---

## 2. BATCH LEDGER

### 2.1 Sources acquired, by batch

| # | Source | Batch | Grade | Words | Claim-like | Mapped | Share | Residue | Scout overlap |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Pew, online dating | pre-run | A* | — | 62 | 27 | **43.5%** | 35 | — |
| 02 | fem-centrism | pre-run | A* | — | 10 | 0 | 0% | 10 | — |
| 03 | four-horsemen | pre-run | — | — | *no export* | — | — | — | — |
| 04 | heteropessimism | pre-run | A* | — | 28 | 1 | 3.6% | 27 | — |
| 05 | Kim, Capaldi & Crosby 2007 | 1 | A | 9,249 | 159 | 6 | 3.8% | 153 | 84.4% |
| 06 | Heyman & Slep 2001 | 1 | A | 3,484 | 46 | **0** | 0% | 46 | 95.1% |
| 07 | van Lankveld et al. 2021 | 1 | A | 6,642 | 170 | 12 | 7.1% | 158 | 99.0% |
| 08 | McNulty, Wenner & Fisher 2016 | 1 | A | 8,332 | 141 | 20 | 14.2% | 121 | 99.1% |
| 09 | Conroy-Beam, Goetz & Buss 2016 | 1 | B | 7,376 | 262 | 32 | 12.2% | 230 | 78.3% |
| 10 | Miller 2007 | 1 | B | 5,763 | 108 | 7 | 6.5% | 101 | 95.9% |
| 11 | IFS / Wang, Gen Z priorities | 2 | A | 2,098 | 55 | 7 | 12.7% | 48 | 70.5% |
| 12 | NEP exit-poll methods | 2 | B | 592 | **0** | 0 | n/a | 0 | 64% |
| 13 | Wheatley, "Counterfeit Connections" | 2 | B | 8,479 | 129 | 7 | 5.4% | 122 | 88.6% |
| 14 | Common Sense Media / NORC | 2 | B | 4,963 | 17 | 1 | 5.9% | 16 | 78.6% |
| 15 | ASC / Cox, American Friendship | 2 | A | 4,592 | 17 | **0** | 0% | 17 | 90.9% |
| 16 | Pew, emotional support (ch. 2) | 2 | A | 819 | 3 | **0** | 0% | 3 | **40%** |
| 17 | Trent & South, sex ratios (China) | 3 | A | 6,689 | 97 | 16 | 16.5% | 81 | 95.2% |
| 18 | Li et al., necessities & luxuries | 3 | B | 7,588 | 117 | 31 | 26.5% | 86 | 87.9% |
| 19 | Zhang et al., preference replication | 3 | A | 4,257 | 86 | 33 | 38.4% | 53 | 67.9% |
| 20 | Marzoli et al., scenario manipulation | 3 | A | 6,503 | 86 | 9 | 10.5% | 77 | 74.3% |
| 21 | Hirschl et al., assortative mating (WP) | 3 | B | 3,352 | 32 | 6 | 18.8% | 26 | 74.6% |
| 22 | Finkel et al., suffocation (target article) | 3 | B | 26,323 | 576 | 22 | 3.8% | **554** | 61.8% |

**Totals across the 21 analyzed sources: 2,201 claim-like segments · 237 mapped (10.8%) · 1,964 residue ·
4,205 set aside by the relevance gate.** All shares PROVISIONAL.

**A\*** = the chain is grade A (HTML → committed extractor → SHA-256), but these three sources **predate the
grading scheme and carry no `provenanceGrade` field**, so the manifest does not assert the label and neither
does this document. Word counts for 01/02/04 are not recorded in the manifest and are shown as `—` rather
than back-filled. Scout overlap is `—` for all four pre-run sources because there was no scout — they were
acquired before this run. See §6.6.

### 2.2 Instrument constancy — the warrant for comparing across batches

Read out of all 21 analysis exports on disk. **Twelve of thirteen epoch fields are single-valued across
the entire corpus:** analysis schema `le-lab.analysis/2.6` · queue schema `le-lab.research-queue/2.1` ·
mode `local-lexical-v2` · scoring config `bt0a7p` · canon `1.0.0+949aef381d5f` · canon generated
`2026-07-27T11:38:21.000Z` · canon schema `le-canon-index/1.1` · **canon concept count 450** · canon source
count 19 · **canon snapshot hash `1v8z11a1xzrjgp`** · relevance policy
`deterministic-relational-frames-v2` · coverage denominator (one identical sentence).

The thirteenth is the analyzer patch version: **2.6.0** for sources 01/02/04, **2.6.1** for 05–22. The
2.6.0→2.6.1 change was proven unable to move this corpus (`provider` and `breadwinner` occur zero times
across all three 2.6.0 sources; `provider` holds the canon's only non-empty denylist; the threshold sweep
returned 0 changed of 46,350 pairs). `merge-manifest.mjs` hard-fails if any non-analyzer epoch field moves.

**This warrant was asserted before it was evidenced. See §6.7 error E22 — a cold reviewer refused it, and
was right to.**

### 2.3 Hash verification

**159 hashes recorded in the committed manifest, all recomputed from disk, 0 failures.** This covers, per
source: normalized text, raw archive, current analysis export, and three companions (queue, markdown,
labeling sheet), plus superseded exports where present.

### 2.4 Cluster dispositions, as data rather than adjudication

| Cluster | What the checkpoint recorded | What the run found | Direction |
|---|---|---|---|
| **C1b/C1c** (Gottman retention) | thin; accuracy critique exists unlinked | An independent replication exists **and it failed** (Kim et al. 2007, zero author overlap, same SPAFF instrument). The primary table puts **defensiveness above contempt**. The headline accuracies sit on **three different denominators**. C1c's security→desire associations run **positive**, and the attachment-moderation hypothesis was rejected by its own authors | **weaker than recorded** |
| **C2** (AI companions as substitute) | single-survey empirical base | Opt-in quota panel; lifetime-ever headline items; user-denominator preference figure; no current-relationship item; **nothing measures displacement**. The independent source has the wrong population | **weaker** |
| **C4** (sex ratio → market norms) | mechanism half missing from the site | The mechanism **is instrumented**; the structural-power leg came out **weak, mixed, or contradicted** in both direct tests, with named defeaters on both sides. The 1983 book itself was never reached | **revised, not filled** |
| **C8** (political alignment filter) | recorded as a ~3,000-respondent AEI/IFS finding | **Did not survive verification.** Sponsor, sample, subgroup and instrument type all corrected — **the 36% belongs to conservative WOMEN**; conservative men are 37; the recorded pairing appears in no source; it is **not a ranking question**. Figure 2 **UNVERIFIED** | **falsified as recorded** |
| **C9** (budget-structured preferences) | thin | Splits three ways. The **sex-typed allocation pattern** reaches TIER 1 (independent preregistered replication). The **convergence half** is TIER 2 and *structurally cannot* be replicated from the located lineages — neither varied budget size. The surveys-are-free mechanism is **TIER 3 as sourced** | **partly confirmed, partly exposed** |
| **C10** (friendship decline → partner reliance) | thin | Splits three ways: the usual citation lacks the concentration step; one wrong-population source finds it; **Pew 2025 finds no sex gap in partner reliance at all** | **weaker** |
| **C12** (assortative mating) | cited as "Schwartz et al." | **Citation corrected — first author is Hirschl.** The **1990 inflection belongs to homogamy, not hypergamy.** Relation to Esteve 2016 is **refinement, not correction** | **citation-level, corrected** |
| **C1d** (suffocation model) | thin; premise on site uncited | Three components fail three different ways. **Variance widening — the half with predictive content — is never measured in any of the three Finkel sources**, and was consolidated *after* the peer-commentary round. The investment claim is **baseline-year sensitive** | **weaker, and structurally so** |
| **C3** (site-internal null) | DISPOSITION 2, highest-confidence | Re-verified twice at two commits. Unchanged | **stands** |

---

## 3. DISPOSITIONS IN FULL

**How reviews were run, identically each time.** A **fresh cold subagent** per review, dispatched with the
review packet plus a stripped rules file **and nothing else** — no run narrative, no orchestrator
commentary, no prior findings, and no knowledge that a previous review existed. Each reviewer was fenced to
reading one file and told explicitly that *an absence in the packet is itself a finding rather than a prompt
to go looking elsewhere.* Dispositions are ACCEPT / CONTEST / REWORD, one per numbered unit, with
`INTEGRITY:` reserved for exactly two conditions: an alleged fabrication, or an unverifiable source
presented as verified.

**Aggregate across all reviews**

| Review | Units | ACCEPT | REWORD | CONTEST | INTEGRITY | Outcome |
|---|---|---|---|---|---|---|
| Batch 1 | 36 | 21 | 10 | 5 | **0** | 10 REWORDs applied · 4 CONTESTs applied · **1 rejected with reason** |
| Batch 2, review 1 | 23 | 5 | 7 | 11 | **1** | **RUN HALTED** → escalated (§6.1) → repaired |
| Batch 2, review 2 | 31 | 13 | 8 | 9 | **1** | **RUN HALTED** → escalated (§6.2) → repaired in the batch-3 seat, **unre-reviewed** |
| Batch 3, review 1 | 8 | 1 | 1 | 6 | **0** | Central warrant refused; all confirmed errors repaired |
| **Batch 3, review 2** | **43** | **24** | **9** | **9** | **CONTEST 1** | **RUN HALTED** → escalated (§6.2b) → repaired, **ruling pending** |

**The trend is worth naming.** Batch 1 returned ACCEPT 21 / CONTEST 5. Batch 2 returned ACCEPT 5 / CONTEST
11 and escalated **twice**. The reviewer diagnosed why, and the diagnosis held: **citation completeness
tracked archival status.** Every archived source carried its organisation, year, URL, verbatim strings and
correct tier; the CONTESTs clustered almost entirely on **unarchived sources whose locators the scout files
carried and the packet dropped**.

### 3.1 Batch 1 — ACCEPT 21 · REWORD 10 · CONTEST 5 · INTEGRITY 0

**The integrity gate did not fire.** No unit alleged fabrication and none alleged an unreachable source
presented as verified. The reviewer's own words: *"every gap in the packet… names its barrier and labels its
retrieval mode, including two cases where the only artifact was a tool paraphrase rather than verbatim text.
No quote, figure, or citation in the packet reads as fabricated."*

It also supplied forensic reasoning in support: the two densest numeric blocks — the 2000 univariate F table
and the Heyman & Slep confusion matrices — **reproduce all of their own derived statistics exactly**, *"which
is not a property invented numbers have."* It independently recomputed the F-critical bands, both
chi-squares, all ten matrix statistics, the 16%-prevalence PPV, and every percentage and column total in the
Lab measurement table.

**The one rejected charge — ITEM 11.** Right observation, wrong attribution. Full adjudication at **§6.3**.

**The four applied CONTESTs**

| Unit | Charge | Disposition |
|---|---|---|
| ITEM 17 | Subsample caveat attached to the wrong correlation | **Applied — a real error.** Checked against `07-van-lankveld-desire.txt`: the caveat belongs to the **anxious** correlation, not the avoidant one, and runs the other way — "positive and significant in the full sample and all subsamples, but not significant in the subsample of non-heterosexual men." Both correlations are full-sample estimates. Also settled the second observation: r = 0.25 was called "medium effect size" in one item and "weakly positive" in another. **The source supplies no magnitude adjective at all.** Both withdrawn; coefficients now stand unadorned |
| ITEM 18 | Tier discipline — "TIER 2 if the secondhand description holds" grades a hypothetical | **Applied.** Changed to TIER 3 as sourced, counterfactual stated separately |
| ITEM 21 | Two defects | **Both applied.** TIER 2 on a study never read, unknown authors, from a search record → TIER 3 as sourced. And the year does not fit the volume: the packet pins *JSMT* vol 36 to 2010 elsewhere, which places vol 38 in 2012, not the asserted 2011. Rather than assert 2012 from inference, the year is marked **UNVERIFIED** |
| ITEM 22 | Citation floor | **Applied — withdrawn rather than repaired.** "Mikulincer & Shaver's attachment-and-sexuality work" carried no year, venue or locator: a substantive claim about what a literature says, with no citation of any kind. Those names were reached only as background citations inside another paper |

**Plus ITEM 30 — the packet's weakest unit, and the reviewer was right to name it so.** Johnson & Rusbult
(1989) carried authors and a year only, with a WebSearch synthesis as its retrieval basis, and the claim that
"Rusbult was at the University of Kentucky at the time" was carrying the unit's **entire
lineage-independence conclusion** while itself uncited. The affiliation claim is withdrawn. **The unit is
retained despite failing the floor, because it is a *disconfirming* finding and dropping it would bias the
cluster in the claim's favour** — but it is marked as requiring re-citation before any use.

**The ten applied REWORDs**

| Unit | Change |
|---|---|
| ITEM 4 | 9/73 = 12.3%, not the printed 12.5%. Quoted as printed with the arithmetic noted; whether it is the paper's typo or an upstream slip is UNVERIFIED, since that source is not archived |
| ITEM 6 | A claim about how often summaries absorb this paper, carrying no citation. **Removed** |
| ITEM 9 | Used "130 couples" as established while ITEM 7 marks it search-engine-only and UNVERIFIED. Now flagged and cross-referenced |
| ITEM 12 | Counted four independent critique lineages without recording that one was never reached and another exists only as a tool paraphrase. Now: two of four contributed usable text, and the unreached group's placement on the critique side is itself unverified |
| ITEM 14 | "TIER 1-adjacent" is not a rung in this packet's scheme. Now TIER 2 with design strengths stated plainly |
| ITEM 24 | **The sharpest scope catch of the review.** The unit headlined a *pool-comparison* construct as the cluster's main effect when the cluster claim is self-versus-partner value — and the packet flags that same construct mismatch for the moderator at ITEM 27 **without flagging it here**. Now scoped, with ITEM 25 identified as the unit that actually bears on the main effect |
| ITEM 27 | The Study 3 sign-reversal reconciliation was presented as the paper's argument. Checked against `09-conroy-beam-discrepancies.txt`: the paper says only that Study 3 "replicated the relationship… found in Studies 1 and 2" and **never addresses a sign reversal.** Re-attributed as the scout's inference |
| ITEM 31 | Asserted "serial mediation" and "parallel mediation" about the same paper four lines apart. Now states the model form as unconfirmed — the honest position for a 403'd source |
| ITEM 35 | The Tran et al. meta-analysis described in evidential terms while carrying no tier and no locator beyond a title. Now TIER 3 as sourced, TIER 1 counterfactual stated |
| Provenance | "Every source above was independently re-fetched" read as covering the whole packet when the chains cover only the six archived sources. Now scoped explicitly, naming Buss et al. 2017 as the clearest case of a paper read in full by a scout but never archived and therefore carrying no hash |

**Five observations the reviewer flagged without charging, carried forward:** ITEM 2 (the "same ordering"
claim is demonstrated only for husband defensiveness over husband contempt; the other two terms were never
extracted) · ITEM 19 and ITEM 21's Klusmann and Twenge bullets carry no tier where the packet's own
convention would assign "TIER 3 as sourced" · ITEM 29 ("Sobel's test t(167) = −7.58" is an odd reporting
form; a Sobel statistic is normally a *z*, and its df would not equal *N*) · ITEM 33 ("Glass & Wright (1985,
1992)" carries no venues, so neither primary can be pinned) · ITEM 36 (the site's own copy attributes 21% to
"(Pew 2023)" with no report title or URL — a citation-floor weakness **in the site text**, quoted as it
stands).

**What the reviewer praised, recorded because it is the part most likely to matter for doctrine.** It called
the Cohort A/B lineage argument (ITEM 9) *"the packet's best structural work"* for evidencing sameness
through near-identical recruitment prose rather than inferring it, and called ITEM 28's closing sentence
*"the strongest possible form of the finding because it is falsifiable."* It **affirmed the gap-recording
behaviour throughout — fourteen units — as correct rather than deficient**, which is the disposition the
run's rubric was built to reward.

### 3.2 Batch 2, review 1 — ACCEPT 5 · CONTEST 11 · REWORD 7 · INTEGRITY 1 → HALTED

**Escalated unit: ITEM 15.** Full adjudication at **§6.1**: valid against the packet, invalid against the
source. The scout supplied the full provenance and the orchestrator dropped it while compressing.

**The substantive verification results, which are the batch's actual output**

| Cluster | Result |
|---|---|
| **C8** | **Did not survive verification.** Figure 1 corrected **four ways**: sponsor is IFS/YouGov alone, not AEI/IFS; sample is 2,000 men + 1,000 women, not a balanced 3,000, opt-in panel, no published MOE; **the 36% belongs to conservative WOMEN (36.39) — conservative men are 36.98 → 37** — and the recorded "liberal women 60% vs conservative men 36%" pairing **appears in no source**; and it is **not a ranking question** — ten qualities rated independently. The same data undercuts "asymmetrically by sex": liberal men's political-over-job gap (+8.18) **exceeds** liberal women's (+5.76), and the conservative sex gap is 0.59 points **with men higher**. Figure 2 is **UNVERIFIED** — no such instrument exists, two sources contradict the divergence reading, and "gender gap" carries two incompatible definitions (11 vs 31 points) where the larger double-counts against the historical series |
| **C2** | **Weakened.** Opt-in quota panel; lifetime-ever headline items; user-denominator preference figure; no current-relationship item; **nothing measures displacement** |
| **C10** | **Splits three ways rather than confirming.** The usual citation genuinely lacks the concentration step; one wrong-population source finds it; and **Pew 2025 finds no sex gap in partner reliance at all** |

**The reviewer's rulings on the central corrections.** The 36%-is-conservative-women correction is
*"adequately evidenced"* (per-row Sex/Ideology values plus verbatim prose grouping conservatives and never
splitting them) — **with the qualification that the two-decimal values come from a Plotly read outside the
deterministic extraction chain**, so the direction holds while the claimed precision is one notch weaker
than the run's own rules require. The not-a-ranking-question correction is *"adequately evidenced as an
inference, overstated as a verified fact,"* since no questionnaire was ever published.

**Other confirmed defects, all carried into §6.7:** arithmetic slip at ITEM 2 (−33.35, not −33.34) ·
ITEM 7's "roughly double" for an 11-vs-31 gap that is a factor of **2.8** · ITEM 17's "batch's strongest
instrument" superlative contradicted by the packet's own n = 6,204 and n = 5,837 · a TIER 1/TIER 2
inconsistency across ITEMs 8, 17 and 20 on comparable probability-panel instruments.

**Two source-behaviour findings the run records as correct instrument behaviour, not defects.** Source 12
returned **zero claim-like segments** — a one-page election-methods statement with no domain claims, archived
for provenance rather than yield; an empty claim surface is the relevance gate working. And **source 16's 40%
scout overlap was the ORCHESTRATOR's extraction, not a scout failure** — see §6.6 item 5.

### 3.3 Batch 2, review 2 — ACCEPT 13 · CONTEST 9 · REWORD 8 · INTEGRITY: CONTEST 1 → HALTED

Run against the repaired packet, rebuilt under the new two-part doctrine with all three scout blocks
SHA-verified byte-identical, by a **fresh** reviewer with no knowledge of the first review.

**Escalated unit: 30, the PROVENANCE section itself.** Full adjudication with the per-source read-status
table at **§6.2**. **Repaired in the batch-3 seat; not re-reviewed.**

**The four quality findings worth carrying, all in §6.7:** unit 14 (**the weakest reasoning in the run** —
a residual attributed to a reweighting the cited figure already incorporates, across two different
instruments, with a "≈15.5" pivot that is in no source) · unit 12 (a *level* difference used inside a
bullet scoped to a *difference* metric, **reversing that bullet's conclusion**) · units 10/11 (the two
values carrying the headline −33.35 **appear nowhere in Part Two**) · unit 16 (claimed Part Two carries a URL
"for every figure"; S-E contains exactly one).

**And one finding that goes to promotability rather than accuracy: Cluster 3 fails the citation floor
outright.** S-F contains **zero URLs and zero DOIs** for any of its seven sources. On the run's own stated
floor, C10 cannot be promoted as it stands — see §7 item 3.

**Cluster 1's central correction survived, and more strongly than the orchestrator had claimed it.** The
reviewer found a **second, appendix-independent leg** the packet had under-used: Abrams' AEI commentary,
quoted verbatim in Part Two with its own URL, splits the subgroups as *"conservative young women (36
percent), liberal young men (47 percent), and conservative young men (37 percent)."* **So the subgroup
attribution holds even if the Plotly read is discounted entirely** — which removes the one qualification the
first review had attached to it.

The reviewer also stated that **no fabrication was found anywhere in the packet**, and independently
verified **every DOI as well-formed and venue-consistent**.

### 3.4 Batch 3, review 1 — ACCEPT 1 · REWORD 1 · CONTEST 6 · INTEGRITY 0

Eight units, segmented by the reviewer (the packet carried no markers — see §5 and §6.7).

**No fabrication found.** The reviewer affirmed the gap-recording behaviour and noted that the per-source
shares **reconcile to integer counts**, *"which is what real measurements do and invented ones generally do
not."*

**The central challenge, and its resolution.** The reviewer's strongest finding was that the quantitative
finding's load-bearing warrant — **instrument constancy across both arms** — was documented in the packet for
**6 of 13 sources only**, and that the documentation gap was **asymmetric in the direction that would
manufacture the effect** (5 of 7 formation sources this-batch; 1 of 6 maintenance). If the canon had grown
between batches, later-analyzed sources would map better, and the formation arm is disproportionately
later-analyzed.

**Checked directly against every export on disk, and the confound does not exist in the data.** All 21
analyzed sources share one canon snapshot, one scoring config, one analysis schema — and, decisively,
**`canonIndex.conceptCount` = 450 and `provenance.identity.canonSnapshotHash` = `1v8z11a1xzrjgp` are
invariant across all 21.** The canon did not grow. Only the analyzer patch version differs, and v2.6.1 was
proven behaviorally identical on this corpus (0 of 46,350 pairs moved). `merge-manifest.mjs` hard-fails if
any non-analyzer epoch field moves, which is the mechanism that held it.

**So the finding survives — and it survives because the review forced the check.** The reviewer was right to
refuse the warrant: **the packet asserted constancy without evidencing it.** Same failure class as the
batch-2 provenance defect — knowing something and not putting it in the artifact. The repair was to
**document the epoch constancy from the exports, not to re-argue it** (§6.7 E22).

**The alternative explanation the reviewer raised and the orchestrator had not considered.** "Other" scores
**4.4%, *below* maintenance's 7.0%**, and method papers score **0.0%**. That gradient is at least as
consistent with *"the canon fires on material topically near its core and decays with distance"* as with a
formation/maintenance **stage** asymmetry. Those two readings say different things about the site, and the
packet weighed neither. **The repaired packet now presents both side by side with what each predicts and
what evidence would separate them, and deliberately does not adjudicate** — see §7 item 1.

**Confirmed factual errors, all repaired:** E23–E33 in §6.7. In summary: both superlatives wrong; the
overlap count wrong; a 21-ID enumeration labelled "22 sources"; 15 of 22 sources never named; C4's "partly
falsified" overstating the scout's own "weak, mixed, or contradicted" with three defeaters dropped; C9's gate
architecture misscoped; C1d's flat negative existential over 13 unread commentaries; the GFG "independent
check" that is a re-analysis of the same series; and a materially incomplete provenance enumeration.

**Verdict on the two-part doctrine, from the reviewer — kept, with two required fixes.** *"Because Part Two
carries the locators, tiers and gaps verbatim, most of the defects above were **detectable**… A single-layer
packet would have hidden all three."* The two fixes: **per-claim anchors** into Part Two (cluster-level
pointers are not citations), and **stop advertising byte-auditability a reviewer fenced to one file cannot
perform** — the structure delivers auditability of *reasoning*, not of *bytes*. **Both applied.**

### 3.5 Batch 3, review 2 — ACCEPT 24 · REWORD 9 · CONTEST 9 · INTEGRITY: CONTEST 1 → HALTED

Run against the repaired packet — per-claim anchors, 43 units marked **in the artifact** — by a fresh reviewer
with no knowledge that review 1 existed. **This is the run's current state: halted, awaiting a ruling.**

**Escalated unit: 34, the C1d misattribution paragraph.** Two independent defects in one unit; both charges
accepted, nothing rejected. Full adjudication at **§6.2b**.

**The repair worked on substance.** Review 1 returned ACCEPT 1 of 8; review 2 returned **ACCEPT 24 of 43** on
the same material, and every confirmed factual error from review 1 survived re-inspection as fixed. What is
striking is *how* the ACCEPTs were earned — this reviewer recomputed rather than trusted:

- **Reproduced every row and total** of the classification table independently (7+6+6+2 = 21 sources;
  535+1,416+204+46 = 2,201; 129+99+9+0 = 237) and all four group shares to two decimals.
- **Back-solved every leave-one-out row** against the per-source table, noting that excluding source 01 yields
  27/62 = 43.5% — independently reproducing that source's own share.
- **Recomputed the disputed-assignment arithmetic**: moving source 17 out of formation gives 113/438 = 25.8%
  and a 3.69× ratio, *"so 'would strengthen the gap' is literally true"* — and independently confirmed the
  density confound at 236 claim-like segments per maintenance source vs 76 per formation source.
- **Recomputed the overlap band**, arriving at exactly the four sources named, two per arm.
- **Verified mapped + queue = claim-like for every row individually**, and counted each of the ten SHA-256
  digests to 64 hex characters.
- **Reconstructed the outside-the-hash-chain enumeration independently from Part Two** and found it complete:
  *"nothing omitted and nothing invented"*, with the load-bearing column counting to 8.
- **Checked every anchor fragment** for literal occurrence in its named block.
- Checked the C12 identifiers for internal consistency: *"10.1215 is Duke UP, 00703370 is the journal's ISSN,
  and vol. 61 is 2024."*

It also **affirmed three self-corrections as correct behaviour** rather than treating them as weakness: the GFG
re-analysis self-downgrade (*"grounded in Part Two rather than asserted"*), the withdrawal of the unstated 60%
cross-check floor, and the reassignment of credit for the unreached-book gap to the scout.

**Six of the nine CONTESTs are one systemic defect — the citation floor at cluster scale.** The reviewer's own
summary: the S-H block supplies *"no journal, volume, DOI or URL for any of its five primary sources, deferring
instead to a `capture.json` that is not in the packet"*, and the Dollar dissertation is *"the same failure on
the packet's single most load-bearing unhashed source."* It added that the **substance** of those units is
sound — *"tier logic anti-inflationary, lineage independence correctly refused where authors overlap, scope
correctly split in bucket (c)"* — so **the repair is bibliographic, not evidential.** Repaired by adding a
CITATION APPENDIX (unit 43) built from the committed capture files, which supplies venue, volume and DOI or URL
for 18 sources and **names the five that still fail the floor rather than repairing them**.

**The three remaining CONTESTs, all applied:**

| Unit | Charge | Check |
|---|---|---|
| **5** | *"Only three of thirteen stage-classified sources sit on the 2.6.0 side (01 formation; 02 and 04 are 'other')"* — but 02 and 04 sit in the **Other** group and are not stage-classified at all, so only **one** of thirteen is on the 2.6.0 side. **The sentence's own parenthetical refutes it** | 2 — arithmetic against the packet's own counts |
| **16** | *"failed only for Whites"* dropped S-G's *"where it was also positive (**non-significant**)"* — converting a null into a counter-directional finding, which is what made "masking a subgroup split" read as established | 2, and 1 |
| **27** | *"The abstract was cross-checked word-for-word against the published version"* — but S-I-A's comparand is a **third-party blog's** rendering (schoolinfosystem.org), and the published article was never reached at all | 2 — a secondary retelling attributed to the primary |

**The nine REWORDs, all applied — one in a stronger form than offered.** Units 1 (the universal anchor claim,
falsified by the packet's own unanchored provenance inventories), 3 (limb 2 of the tier definition stated two
different ways, where the stricter version would disqualify **both** of the packet's limb-2 assignments), 4
(the most load-bearing warrant table exempted from the packet's own trust-class disclosure rule — a sharp
catch), 25 (the hypogamy series' endpoint and post-2010 reversal dropped), 28 (Proulx et al. promoted to
"strongest empirical citation" while unread and stripped of its TIER 3 as sourced label), 30 (wrong anchor, and
Neff & Morgan assigned to the *variance* claim when S-I-B assigns it to the *demand* claim), 31 (a **non-parent**
time-use finding generalised to all couples — which made the counter-evidence against Finkel stronger than the
source supports), 36, and 41.

**Unit 41 deserves its own line: the reviewer refuted an explanation using the packet's own numbers.** The
packet explained three sub-80% cross-check overlaps as *"a different extractor on the scout's side."* But S-H
records all its captures as `curl + r.jina.ai` — which covers source 18, and **source 18 scored 87.9%.** The
residual is now recorded as **unexplained** rather than explained away.

**Unit 36 was applied in a stronger form than the replacement offered.** The reviewer flagged the 554-item
residue as *"an unevidenced superlative in the unit whose purpose is withdrawing two unevidenced
superlatives"* and proposed scoping it to the batch. The claim is in fact **true corpus-wide**, so rather than
withdraw a true statement the packet now **evidences** it — the five largest residues across all 21 analyzed
sources (22→554 · 09→230 · 07→158 · 05→153 · 13→122), flagged as an orchestrator-side control. The diagnosis
is honoured by supplying the data rather than by narrowing the claim.

## 4. RESIDUE, TREATED AS A FIRST-CLASS RESULT

**The run mapped 237 of 2,201 claim-like segments. 1,964 segments — 89.2% of the claim surface — are
residue.** The run reports this as a finding about the instrument, not as a processing backlog.

| Cohort | Claim-like | Mapped | Share | Residue |
|---|---|---|---|---|
| Pre-run (01, 02, 04) | 100 | 28 | 28.0% | 72 |
| Batch 1 (05–10) | 886 | 77 | 8.7% | 809 |
| Batch 2 (11–16) | 221 | 15 | 6.8% | 206 |
| Batch 3 (17–22) | 994 | 117 | 11.8% | 877 |
| **Corpus** | **2,201** | **237** | **10.8%** | **1,964** |

**Five sources returned ZERO mapped segments** — 02 (10 claim-like), 06 (46), 12 (0), 15 (17), 16 (3).
Source 12's *empty claim surface* is the relevance gate behaving correctly: a one-page election-methods
statement with no domain claims, archived for provenance rather than yield. Source 06 is the sharper case —
46 claim-like segments from a cross-validation study of the very instrument cluster C1b concerns, and the
canon fired on none of them.

**The five largest single residues:** 22 → **554** · 09 → 230 · 07 → 158 · 05 → 153 · 13 → 122. Four of
those five are maintenance-side sources.

**The residue's own corroboration of the run's headline gap.** Conroy-Beam et al.'s own sentence — *"little
research examines the role of mate preference psychology after mate selection"* — surfaced as an **unmapped
claim** in source 09. The instrument failed to map a claim about the exact gap the instrument was being used
to measure. The run records this as the single most interpretable item in 1,964.

**What the referee should not conclude from the residue.** A high residue is not evidence the canon is bad;
thresholds are uncalibrated by design, and a conservative mapper *should* leave most prose unmapped. The
residue is offered as (a) the denominator that makes the 10.8% honest, and (b) a queue of 1,964 located,
hashed, re-fetchable segments that a calibration pass could label.

---

## 5. MISCORRELATION ITEMS — scout-flagged, with locators

**Contract:** flag-mapping feedback is Jason's alone. Scouts and the orchestrator record suspected
miscorrelations **in findings prose only**; this run generated **no feedback file** and proposed **no canon
or threshold change**. All nine items below are handed over, not acted on.

Unit IDs: batch 3's packet carries explicit `⟦UNIT n⟧` markers. **Batch 1's packet uses `ITEM n`.
Batch 2's revision-2 packet carries no markers at all** — its 31 "units" were segmented by the reviewer,
so batch-2 unit IDs are reviewer-assigned and *not reproducible from the packet*. That is itself a process
defect, and it is why batch 3 now numbers its units in the artifact. Where a batch-2 unit ID is not
recoverable, the cluster is named instead.

| ID | Scout | The risk | Where the related claim sits |
|---|---|---|---|
| **MC-1** | S-A | **"Four Horsemen" is not one instrument across the corpus.** 1992/2000 horsemen are **RCISS** codes; SPAFF is a separate system used in the same papers for different variables. Kim et al. 2007 replicated against **SPAFF**. Treating Four Horsemen / SPAFF / RCISS as interchangeable surface forms collapses a distinction the primaries keep apart | batch 1, ITEM 1 and ITEM 6 |
| **MC-2** | S-A | **"Predicts divorce" vs "predicts timing of divorce" are different outcomes on different denominators, and the highest percentages attach to the second.** 95% discriminates early- from later-divorcing *among the already-divorced* (~20 couples); 93% is a mixed model including self-reported satisfaction and thoughts of dissolution. Mapping "divorce prediction accuracy" to one concept merges three denominators | batch 1, ITEM 3 and ITEM 10 |
| **MC-3** | S-B | **Collapsing C1c's (a)/(b)/(c) into one "desire declines with familiarity" line.** (a) has real prospective support; (b) has no primary-verified mechanism test and the nearest concurrent data runs the *other way*; (c) is theory only with no located instrumentation. S-B supplies the defensible three-part canon note verbatim | batch 1, ITEMs 14–22 |
| **MC-4** | S-C | **Encoding the main effect without the interaction.** The source paper found people mated to higher-mate-value partners stay satisfied *regardless of alternatives*, and those mated to lower-value partners are *also* satisfied when alternatives are scarce. Encoding "higher mate value than partner → dissatisfaction" without the alternatives qualifier misstates the one study that tested it. Separately: citing "the mate switching hypothesis" and the EHB paper as two independent sources **double-counts one dataset** | batch 1, ITEM 27 and ITEM 28 |
| **MC-5** | S-D | **Four homonym traps in one cluster.** (1) "Gender gap" has two incompatible operationalizations — CAWP single-candidate difference vs CIRCLE sum-of-within-sex-margins: same 2024 reality, **11 points vs 31 points**. (2) **"AEI/IFS" is not one organization** and they run different instruments (IFS/YouGov opt-in n=3,000 vs AEI/Ipsos KnowledgePanel probability n=5,837 / n=5,244) — "exactly how Figure 1's subgroup label got swapped." (3) **Three different populations get called "women"** — liberal women 18–29 (60), young women 18–29 (39/58/61), single women 18+ (52); none substitutes for another. (4) **"Political alignment" and "supports Trump" are different items** | batch 2, Cluster 1 · trap (1) is reviewer-unit 14 |
| **MC-6** | S-D | **Two primary documents contain internal numeric inconsistencies** — CIRCLE's 51/47 vs 52/46 youth topline; CAWP's fact-sheet prose 42% vs table 41% for 2016. A pipeline ingesting both statements from one page sees a real contradiction | batch 2, Cluster 1 |
| **MC-7** | S-E | **Lifetime-ever exposure restated as current substitution.** The headline figures (19% overall / 31% young men / 23% young women "have chatted with an AI romantic partner") are a **lifetime "have you ever"** measure, worded identically regardless of frequency or current status. Reporting it as "X% of young men are currently substituting AI for dating" conflates prevalence with substitution; the source keeps past-tense "have chatted" as the operative verb throughout | batch 2, Cluster 2 |
| **MC-8** | S-F | **Breadth data restated as concentration data.** Auto-correlating "friendship decline" statistics with "partner reliance" statistics would conflate a well-supported **(a)-breadth** claim with a weaker, population-mismatched **(c)-concentration** claim — and would miss that the most direct modern US test of concentration (Pew 2025) **returned a null on the sex gap**: partner-reliance is equal, and the difference is that women name 12–18 points more *other* channels. Any canon rule treating "men + emotional support + partner" as one fuzzy-matchable concept trips this | batch 2, Cluster 3 |
| **MC-9** | S-G | **The (a)/(b)/(c) sex-ratio split is easy to conflate** because published abstracts use "bargaining power" and "dyadic power" loosely across all three at once. A keyword match on "bargaining power" or "sex ratio" cannot distinguish an individual-value claim from a whole-market-norms claim from a structural-power claim. S-G supplies the disambiguator: does the source measure an *aggregate outcome* (b), a *named institutional/economic variable varying by sex* (c), or *an individual's own match quality* (a)? | batch 3, UNITs 14–19 |
| **MC-10** | S-I-B | **Two distinct failure modes on the same claim.** A canon keyed on the model's distinctive vocabulary (*Mount Maslow*, *oxygenation*, *altitude*, *marital dependence zone*, *self-expressive era*, *suffocation*) **will not fire** on the site's paraphrase, which uses none of it; a canon keyed on generic strings like `concentrat*` near `institution*` **will over-fire** on unrelated text. Also: **"suffocation model" and "all-or-nothing marriage" are the same model under two names**, a year apart, and the second name is where the variance claim lives — a canon entry keyed to one name misses half the corpus | batch 3, UNIT 34 |
| **MC-11** | S-G | **A property of the literature, not a search failure:** (a)-type individual-value sex-ratio claims are *scarce* in a broad search because most of the empirical sex-ratio literature already operates at (b), market-level outcomes. Flagged rather than asserted | batch 3, UNIT 14 |
| **MC-12** | *orchestrator, during the unit-34 adjudication — did not exist before it* | **A surname that is present on the site for the wrong literature.** `Finkel` **is** cited on the site — three times, all as a co-author on the **speed-dating / stated-versus-revealed** work (Joel/Eastwick/Finkel 2017 at `frameworks.html:183`; Eastwick & Finkel 2008 at `smvlevers.html:158`; Hunt/Eastwick/Finkel 2015 at `statistics.html:256`). **The suffocation model is cited nowhere.** Any canon or citation sweep keyed on the surname will find Finkel cited and could wrongly conclude the suffocation model is sourced — the inverse of MC-10's problem, and it fires on a *true* string match | batch 3, UNIT 34 |

---

## 6. UNSANITIZED DISCLOSURES

Nothing in this section is softened. Where a defect was the orchestrator's, it says so. Where a charge
against the run was **wrong**, that is recorded too — a disclosure section that only confesses is as
unreliable as one that only defends.

### 6.1 INTEGRITY ESCALATION #1 — batch 2, ITEM 15. Valid against the packet, invalid against the source.

**The charge.** Batch 2's first cold review returned `INTEGRITY: CONTEST` on ITEM 15, which reproduced a
verbatim survey item and a percentage from a Wheatley/IFS follow-up ("Secret Soulmates", n = 2,431; 54%
agreeing "I use romantic AI companion(s) to replace human relationships") with **no author, no year, no
URL, no tier, and no UNVERIFIED marker** — and the packet's own PROVENANCE section omitted ITEM 15 from its
list of unarchived sources. The reviewer escalated on the "unverifiable source presented as verified"
condition and explicitly did **not** allege fabrication.

**Per the run contract, the run halted.** ("Halt if a cold-review CONTEST alleges fabrication or an
unverifiable source; integrity findings escalate to Jason, quality findings do not.")

**The orchestrator's verification, checked against `md/doctrine-run/batch2/S-E-findings.md`.** The scout
sourced it properly and the **orchestrator dropped the provenance while compressing**. S-E supplies the full
author list (Willoughby, Carroll, Toscano, Hakala & Morris), the year (2026), the institutions, the sampling
design (Qualtrics opt-in quota panel, 18–30, currently partnered), the exact question stem with a men's
breakdown (21.5% never / 38.9% sometimes / 21.3% often), a URL, and records the report under "Verified to
primary — full report PDF read in full."

**Resolution.** The escalation is **valid against the packet and invalid against the source**: a
transcription and provenance failure by the orchestrator, not an unverifiable claim and not fabrication.
Fixed by restoring what the scout already supplied.

**A second, worse defect found during that check, which the reviewer could not see.** The packet reported
the 54% "replace" figure **without its counterweight**: the same report finds **68% of the same users said
AI companions enhanced their real-life relationships**, and the report itself calls this a "paradox," with
respondents not forced into a single bucket. Omitting it made the packet read more one-sidedly toward
substitution than the source supports. **This is worse than the missing URL**, and the review process did
not catch it — the orchestrator's own re-read did.

**The reviewer's systemic finding, which is correct and outlived the batch.** Citation completeness tracks
archival status. All six archived sources (11–16) carried organisation, year, URL, verbatim strings and
correct tiers. **Nine of the eleven CONTESTs were against scout-read, unarchived sources missing a URL, a
tier, or both — and in every case checked, the scout findings DO carry the locator and the packet dropped
it.**

### 6.2 INTEGRITY ESCALATION #2 — batch 2 revision 2, unit 30. A false read-status assertion.

**Different defect, same layer.** The batch-2 repair was completed, the packet was rebuilt under the new
two-part doctrine with all three scout blocks SHA-verified byte-identical, and a **fresh** cold reviewer with
no knowledge of the first review was dispatched. It returned **ACCEPT 13 · CONTEST 9 · REWORD 8 ·
INTEGRITY: CONTEST 1** across 31 units.

**The escalated unit is the PROVENANCE section itself.** The orchestrator's scope sentence read: *"Every
other source cited anywhere in this packet — including all of Cluster 1's revealed-sorting literature, the
Romantic Recession instrument, the Gallup/HBR figure, 'Secret Soulmates', Sun & Schafer, Shin & Park,
Dykstra & de Jong Gierveld, and McPherson et al. — **was read by a scout** but never archived."*

**Verified against the embedded scout files: that is false for most of the list.** Of the eight named:

| Named source | Actual retrieval mode, in the scout's own words |
|---|---|
| Romantic Recession (AEI/ASC) | **read to primary** — "the best-methodology stated-preference instrument I reached," verbatim findings, panel methodology |
| "Secret Soulmates" | **read to primary** — "full report PDF read in full" |
| Sun & Schafer 2023 | **abstract only** — full body paywalled, ResearchGate 403 |
| Dykstra & de Jong Gierveld 2004 | **abstract only** — quoted verbatim from PubMed; body paywalled |
| Shin & Park 2023 | **tool summary only** — "Captured only via WebFetch summarization (not raw HTML parse)" |
| Gallup / HBR figure | **not reached** — marked **UNVERIFIED-TO-PRIMARY**, quoted from inside a secondary |
| McPherson et al. 2006 | **not reached** — "not from text I read myself" |
| Cluster 1 revealed-sorting literature | **partly not reached** — "FAILED TO REACH FULL TEXT", "did not fetch the article", "did not fetch it" on three separate items |

The reviewer escalated on the "unverifiable source presented as verified" condition and **located it
correctly**: the provenance layer is precisely where a reader is entitled to rely on read/unread status.

**Mitigation the reviewer itself established, and which the orchestrator confirms:** *no figure from any
unread source is carried into Part One.* No unverified number entered the findings through this door. The
defect is a false read-status assertion, not propagated bad data, and not fabrication — the reviewer states
no fabrication was found anywhere in the packet, and independently verified every DOI as well-formed and
venue-consistent.

**Resolution, and its limit — read this precisely.** The one-sentence fix was ruled available at escalation
time and **was not applied at the time**; the batch-2 packet sat in the working tree carrying the false
assertion. **It has now been applied in the batch-3 repair seat**: the blanket clause is withdrawn, and the
provenance section now states read status in the three tiers tabulated above, applies "TIER 3 as sourced" to
the second and third groups, and records the no-figure-carried mitigation. **The corrected batch-2 packet
has NOT been re-reviewed.** A referee should treat batch 2 as *repaired but unre-reviewed*, which is a
weaker status than batch 1 or batch 3.

### 6.2b INTEGRITY ESCALATION #3 — batch 3 review 2, unit 34. An uncited true statement carrying a conclusion.

**This is the run's current halt.** Two independent defects in one unit; both charges accepted.

**Charge 1.** The packet asserted: *"Checkpoint 01's own reverse-check records that passage as 'unnamed,
uncited': the site attributes it to nobody, so the site is not misattributing anything to Finkel."* The
reviewer found that this quotation comes from a document **not in the packet**, carries **no citation of any
kind**, cannot be located in the packet's own supplied text, and **was the sole support for the unit's
exculpatory conclusion** — while the same unit *did* disclose the trust class of its other unverifiable item
(a site quote) two paragraphs later. Fails check 6: an unverifiable source presented as verified.

**Verified: the quotation is accurate.** `md/claude-doctrine-checkpoint-01.md:89` reads "unnamed, uncited"
verbatim. **So this is not fabrication and not a false statement.** It is an **uncited true statement whose
exculpatory weight the packet rested on without letting the reader check it** — and the selective disclosure
makes it worse rather than better: the orchestrator demonstrably knew to flag trust class, and flagged one of
two items in the same paragraph.

**Charge 2, independent of the first.** The packet wrote that S-I-B *"independently records"* that the site's
sentence uses none of the model's distinctive vocabulary. **It does not.** S-I-B's own sentence reads: *"the
website's premise sentence **(as described in my assignment)** uses none of the model's distinctive
vocabulary."* The scout never saw the page; its observation is derived from the orchestrator's own description
of the sentence. Fails check 4: one source presented as two independent lines.

**Repair.** The conclusion no longer rests on the external quotation. It rests on four checks, three of them
structural facts about the repository:

1. The Framework callout containing the passage (`dd-relationships-throughout-history.html:269–273`) carries
   **no `dd-callout-cite` element**, while **10 other callouts in the same file do** — including the
   immediately preceding one at `:258`, which cites Rosenfeld, Thomas & Hausen (PNAS 2019). The absence of
   attribution is **structural**, not an artifact of how closely the passage was read.
2. `Finkel`, `suffocat`, `Mount Maslow`, `oxygenat`, `all-or-nothing` occur **zero times** in that file.
3. Site-wide, `Finkel` appears **only** as a speed-dating co-author — Joel/Eastwick/Finkel 2017
   (`frameworks.html:183`), Eastwick & Finkel 2008 (`smvlevers.html:158`), Hunt/Eastwick/Finkel 2015
   (`statistics.html:256`). **The suffocation model is cited nowhere on the site.**
4. Checkpoint 01's reverse-check, now **cited at `md/claude-doctrine-checkpoint-01.md:89`** and demoted from
   sole support to corroboration.

All four are disclosed as **orchestrator reads of repository files** — the same trust class as the hash
controls, verifiable by nobody fenced to the packet. "Independently" is withdrawn; the vocabulary absence is
established by check 2 instead.

**The conclusion itself survives unchanged:** the published page attributes the passage to nobody, so **it
misattributes nothing**. The misattribution risk lives in **the doctrine record's pairing** of that passage
with "Supporting: Finkel lineage" as its evidence — a live defect in the *candidate doctrine*, not in the page.

**A miscorrelation risk this adjudication surfaced, which did not exist before it.** Because `Finkel` **is**
present on the site as a speed-dating co-author, any canon or citation sweep keyed on the surname will find
Finkel cited and could wrongly conclude the suffocation model is sourced. Two unrelated Finkel literatures,
only one of them on the site. Recorded as **MC-12**.

**Status: the repair is applied and committed; the escalation is open.** Batch 3 is **not pushed**. What needs
ruling is whether this repair closes it.

### 6.3 A CHARGE THE RUN REJECTED — batch 1, ITEM 11. Right observation, wrong attribution.

**The charge.** The packet "restated a statistic with a different denominator than its source's," failing
figure fidelity, because the design description (176 divorced, split into subsamples of 88 divorced and 176
married) is irreconcilable with the confusion matrices (37 divorced per subsample).

**Adjudication: the observation is correct and valuable; the attribution is wrong. Charge rejected, finding
kept.** Re-read against the archived source `06-heyman-crossvalidation.txt`, the packet's design description
is **verbatim-faithful**. The paper states it itself: *"We randomly split the 176 divorced participants and
the 352 married or cohabiting participants into two subsamples, each with 88 divorced and 176 married or
living together participants."* The n = 6,002 figure is likewise the paper's own.

**So the packet did not change a denominator — the discrepancy is the source's**, an unexplained drop from
88 divorced to 37 between the described split and the classified matrices, most plausibly listwise deletion
on the regression's predictors, which the paper does not state. The reviewer reached the right observation
through a wrong theory of where it came from, which is a **normal and acceptable outcome for a reviewer
working from the packet alone: it could not check the archive.**

The finding was kept and is now disclosed in the packet as a **preserved source-level defect**. This is the
one case in the run where adjudicating *against* a cold reviewer was correct, and it was only possible
because the source is in the corpus with a verified hash.

### 6.4 A SCOUT FAILED — S-I, terminated mid-run by API output content filtering.

**S-I** (Sonnet high) was dispatched with C12 **and** C1d as one two-part assignment. It was **terminated
mid-run by an API output content-filtering block while writing long verbatim extracts.** It had written
`raw-01.txt` (1,766 words) and nothing else — no `capture.json`, no findings.

**The topic was innocuous** (educational assortative mating; a marriage-psychology model), so the trigger
appears to be **output volume and density of verbatim reproduction, not subject matter.**

**The partial capture was still useful**, and this is worth the referee's attention: the salvage identified
the C12 paper as **Hirschl, Noah, Christine R. Schwartz & Elia Boschetti**, *Demography* 61(5):1293–1307
(2024), DOI 10.1215/00703370-11558914 — establishing that the prior record's "Schwartz et al." was a
**citation error**. A failed scout produced the batch's first correction.

**Recovery.** Re-dispatched as two smaller scouts, **S-I-A** (C12, Sonnet) and **S-I-B** (C1d, Opus), with
four mitigations applied to both prompts: one artifact each; verbatim extract **capped at ~1,000–1,400
words** on the most claim-dense passage rather than open-ended "800+"; each file written in a **single Write
call**; and an explicit instruction **not to reproduce verbatim source text in the final chat message**.
Both returned. **S-I-B produced the strongest analytical return of the run.**

**Consequence the referee should carry:** the mitigation worked, but it is visible in the data. Source 22's
scout cross-check overlap is **61.8%**, the lowest in the corpus, precisely because S-I-B's extract was
capped and drawn from six named non-contiguous sections, so shingles spanning its section joins have no
counterpart in a continuous 26,323-word extraction. **A harness constraint left a measurable trace in a
provenance metric.**

### 6.5 THREE HARNESS AND API CONSTRAINTS HIT BY THIS RUN

1. **The Write tool refuses files literally named `findings.md` for subagents.** Cost three scouts time in
   batch 1: one renamed via Bash, one saved under a different name, and **one could not write at all and
   returned its findings as chat text — which is why `S-A-findings.md` is a transcription rather than a
   scout-written file.** Batch 2 onward specified `evidence-notes.md` and the problem disappeared.
   *Referee-relevant consequence:* S-A's Part Two block is byte-identical to a file the **orchestrator**
   typed from the scout's chat output, not to a file the scout wrote. Every other Part Two block in the run
   is scout-written. This is the one place where the "nothing below this line is orchestrator-authored"
   guarantee is weaker than it reads, and it is disclosed here rather than in the packet.
2. **API output content filtering terminated scout S-I mid-run** — see §6.4.
3. **WebFetch refused verbatim reproduction of two specific pages** (the IFS and AEI articles in batch 2),
   forcing scout S-D to use the browser pane, and the numeric appendix required reading Plotly trace
   objects. **Plain `curl` had no difficulty with the same URLs**, which is why the archived artifacts are
   deterministic extractions rather than browser reads — and is a further argument for the
   orchestrator-re-fetch rule.

**A fourth, non-harness constraint worth the same disclosure.** The checkout is **shared and Jason edits it
concurrently.** During batch 1 he committed and pushed three Lab commits, moving HEAD. A test run taken
mid-save reported 150 tests / 1 failure; re-run twice afterwards it returned **171 pass / 0 fail, exit 0**.
The transient was an inconsistent tree snapshot, not a real failure. `js/`, `data/`, `scripts/`, `tools/`
and `fixtures/` were untouched throughout, so the analyzer, canon and extractor used for every analysis are
exactly the committed v2.6.1.

### 6.6 BOTH PROVENANCE GRADES, AND WHAT NEITHER OF THEM GUARANTEES

- **Grade A** — archived HTML → committed `tools/extract-source-text.mjs` → SHA-256. **Verifiable from the
  repository alone**, because the extractor is a hashed repo file. Sources **05, 06, 07, 08, 11, 15, 16, 17,
  19, 20** carry `provenanceGrade: "A"` explicitly.
- **Grade-A-equivalent but unlabelled** — sources **01, 02, 04** predate the grading scheme and carry **no
  `provenanceGrade` field at all**. Their chain is the same (HTML → committed extractor → SHA-256), which is
  why grade A was defined against them, but the manifest does not assert the label and neither does this
  document. Source **03** has no archive and no export.
- **Grade B** — archived PDF → `pdftotext` 4.00 with recorded flags (`-enc UTF-8 -nopgbrk`) and recorded
  `awk` anchor truncation → SHA-256. **Reproducible with the same external tool version, but the extractor
  is a binary rather than a hashed repository file, so it is strictly weaker and is labelled as such.**
  Sources 09, 10, 12, 13, 14, 18, 21, 22.
- **Neither grade, disclosed as its own category** — the IFS chart appendix (source 11's companion),
  archived and hashed but **Plotly-read** rather than deterministically extracted. The two-decimal subgroup
  values that carry batch 2's central correction come from that read, which is why the direction of that
  correction holds while its *claimed precision* is one notch weaker than this run's own rules require.

**Weaknesses the grade letter does not capture, stated separately because it does not:**
- Source 18 is a **third-party Semantic Scholar mirror**, not a publisher or institutional copy.
- Source 21 is a **working paper, not the version of record** — the published *Demography* body text was
  unreachable (Duke University Press 403 to every method tried). The abstract was cross-checked
  word-for-word; every substantive finding is sourced to the working paper.

**What NEITHER grade guarantees, and the referee should not read into them:**
1. **Neither grade means a scout read the source.** Grade attaches to the *orchestrator's* re-fetch. Read
   status is a separate axis, and conflating them is exactly the defect in §6.2.
2. **Neither grade means the source is correct.** Sources 11 and 13 are opt-in quota panels; hashing an
   opt-in panel makes it reproducible, not representative.
3. **Neither grade covers most of the literature the run read.** Across batches, **many primary reads sit
   entirely outside the hash chain** — in batch 3 alone, eleven of them, **eight carrying load-bearing
   synthesis claims** (Dollar 2014; Filser & Preetz 2021; Eastwick & Finkel 2008; Selterman et al. 2015;
   Esteve et al. 2016; the Finkel REPLY and PRÉCIS; Genadek, Flood & Garcia Roman 2015). Any claim resting
   only on those is provenance-weaker than one traced to the archive.
4. **The scout cross-check is diagnostic, not a gate.** No pass/fail threshold was ever set for the 8-word
   shingle overlap. The run has twice written "none fell below 60%," which implies a floor it never stated;
   that phrasing is withdrawn. Observed range across 18 measured sources: **40% to 99.1%.**
5. **Source 16's 40% overlap was the ORCHESTRATOR's extraction, not a scout failure** — investigated and
   resolved as a span difference: the scout merged the landing page with the chapter, the whole fetched page
   holds only 1,626 words including chrome, so 819 is the chapter's real prose, and the decisive sentence is
   present verbatim. Recorded because the cross-check is supposed to catch the orchestrator too, and here it
   did.

### 6.7 THE SYNTHESIS-ERROR RECORD

**This is the section the run is handing over for lane comparison.** Every error below is the
**orchestrator's**, in the synthesis layer. Scout errors are not listed because **no scout fabricated
prose in any batch** and no scout defect was found in any of the four reviews; the failures in this run are
concentrated in one layer, and it is the layer the orchestrator writes.

#### The errors, by batch

**Batch 1 — packet revision 1 → 2** (review: ACCEPT 21 · REWORD 10 · CONTEST 5 · INTEGRITY 0)

| ID | Error | Class |
|---|---|---|
| E1 | ITEM 17 attached a subsample caveat to the **avoidant** correlation when it belongs to the **anxious** one **and runs the opposite way** | attribution / direction |
| E2 | Two magnitude adjectives applied to the same r = 0.25 — "medium effect size" and "weakly positive" — where **the source supplies no adjective at all**. One was the scout's gloss, one was the orchestrator's. Both withdrawn | unsourced characterization |
| E3 | **Tier labels assigned to sources that were never read** (ITEMs 18, 21, 35 among others), including the form "TIER 2 if the secondhand description holds" — which grades a hypothetical | tier-on-unread |
| E4 | ITEM 24 headlined a **pool-comparison construct** as the cluster's main effect when the cluster claim is self-versus-partner value — and the packet flagged that same mismatch elsewhere without flagging it here | scope drift |
| E5 | ITEM 27 presented the scout's inference (a Study 3 sign-reversal reconciliation) as **the paper's own argument**; the paper never addresses it | attribution |
| E6 | ITEM 31 asserted "serial mediation" and "parallel mediation" about the same paper **four lines apart** | internal contradiction |
| E7 | ITEM 30 carried the item's entire lineage-independence conclusion on an **uncited affiliation claim** | citation floor |
| E8 | Provenance scope: "Every source above was independently re-fetched" read as covering the whole packet when the chains cover **only the six archived sources** | **provenance over-scope** |

**Batch 2 — review 1** (ACCEPT 5 · CONTEST 11 · REWORD 7 · INTEGRITY 1)

| ID | Error | Class |
|---|---|---|
| E9 | **ITEM 15 shed the provenance the scout supplied** — author, year, URL, tier all dropped, and ITEM 15 omitted from the packet's own unarchived list → **INTEGRITY ESCALATION #1** | **provenance over-scope** |
| E10 | ITEM 15 reported the 54% "replace" figure **without the 68% "enhanced" counterweight** the same report calls a "paradox" | one-sided selection |
| E11 | Arithmetic: 36.39 − 69.74 = −33.35, printed as −33.34 | arithmetic |
| E12 | "Roughly double" for an 11-vs-31 gap that is a **factor of 2.8** | overstatement |
| E13 | **"The batch's strongest instrument"** — contradicted by the packet's **own** n = 6,204 and n = 5,837 | **superlative unchecked against own data** |
| E14 | TIER 1 / TIER 2 assigned inconsistently across ITEMs 8, 17 and 20 on **comparable probability-panel instruments** | tier discipline |
| E15 | Systemic: **nine of eleven CONTESTs** were locators the scout files carried and the packet dropped | **provenance over-scope** |

**Batch 2 — review 2** (ACCEPT 13 · CONTEST 9 · REWORD 8 · INTEGRITY: CONTEST 1)

| ID | Error | Class |
|---|---|---|
| E16 | **Unit 30: asserted eight named sources "was read by a scout"; false for most** → **INTEGRITY ESCALATION #2** | **provenance over-scope / false read-status** |
| E17 | **Unit 14 — the weakest reasoning in the run.** Attributed a residual to Edison's 12/13/24 reweighting when **the CAWP figure already incorporates it**, and the two numbers come from **different instruments** (Edison vs AP VoteCast) — a distinction **Part Two documents directly**. The "≈15.5" pivot **is in no source** | **fabricated intermediate quantity + instrument conflation** |
| E18 | Unit 12 used the **0.59 level difference** inside a bullet scoped to the political-minus-job metric, where the conservative gap is **27.53** — which **reverses that bullet's conclusion** | figure fidelity, conclusion-reversing |
| E19 | Units 10/11: the two "Stable job" values carrying the headline −33.35 **appear nowhere in Part Two** — the correction asserts a digit its own recorded inputs cannot determine | unevidenced precision |
| E20 | Unit 16 claimed Part Two carries a URL **"for every figure"**; S-E contains **exactly one URL** | false claim about own contents |
| E21 | **Cluster 3 fails the citation floor outright** — S-F contains **zero URLs and zero DOIs** for any of its seven sources, so on the stated floor Cluster 3 cannot be promoted as it stands | floor violation |

**Batch 3 — review 1** (ACCEPT 1 · REWORD 1 · CONTEST 6 · INTEGRITY 0, across 8 reviewer-segmented units)

| ID | Error | Class |
|---|---|---|
| E22 | **The quantitative finding's load-bearing warrant — instrument constancy — was asserted, and documented for only 6 of 13 sources**, with the gap **asymmetric in the direction that would manufacture the effect** (5 of 7 formation sources documented; 1 of 6 maintenance). The reviewer refused the warrant and was right to | **warrant asserted, not evidenced** |
| E23 | **Both superlatives wrong.** Source 19 (38.4%) asserted **twice** as the highest mapped share in the corpus; **source 01 at 43.5% is highest** — and the packet's own per-source list refuted it both times | **superlative unchecked against own data** |
| E24 | Distribution overlap given as **2 of 13**; the correct count is **4** (formation 11 and 20; maintenance 08 and 09) | undercount against own list |
| E25 | **"22 sources" labelling a 21-ID enumeration** — source 03 has no export and contributes nothing | denominator error |
| E26 | **15 of 22 sources never named**, so the stage classification could not be disputed for them — including 5 of 6 maintenance sources supplying 840 of that arm's 1,416 segments. The classification was also made **with the mapped shares already in hand**, undisclosed | **non-falsifiable presentation** |
| E27 | C4: **"partly falsified" overstates S-G's "weak, mixed, or contradicted"**; **three defeaters Part Two supplies were dropped** (Dollar's own attribution of the null to "my rudimentary measure"; the theorized relationship **holding** for Black and Hispanic populations; South 1988 reportedly finding **stronger** support). The unreached-book gap was **mis-credited to the orchestrator** when S-G flagged it first, and the orchestrator **understated its own evidence base** — the definitions come through **two** independent secondary readers, not Dollar alone | **overstatement + selective defeater omission** |
| E28 | C9: the gate architecture claim was **misscoped to TIER 1** on a replication that used a **single fixed budget** and therefore cannot demonstrate a budget-gated architecture | scope drift |
| E29 | C1d: **"No commentary disputed the variance claim" converted an explicit UNVERIFIED into a flat negative existential about 13 unread papers** | **UNVERIFIED → negative existential** |
| E30 | C1d: "All three components are asserted rather than measured" **contradicts the packet's own next bullet**, which reports component (ii) as measured | internal contradiction |
| E31 | C1d: "the site states this premise nearly verbatim" **quoted neither text**, while S-I-B records that the site's sentence "uses none of the model's distinctive vocabulary" — so the misattribution inference was unsupported **and pointed the wrong way** | unevidenced inference |
| E32 | C1d: GFG presented as an **"independent check"** when it **re-analyses the same time-diary series**; its own **exculpatory wrinkle** (increases concentrated in leisure and television; a quality-not-quantity model could survive it) was dropped | **independence overstated + defeater omission** |
| E33 | Provenance: the "three sources not archived" enumeration was **materially incomplete** — the true count is **eleven, eight of them load-bearing**. Source 21's extractor **misattributed to the scout** (S-I-A used r.jina.ai, not pdftotext). "The three lowest" then **explained four**. "None fell below 60%" invoked **a floor stated nowhere**. And **no hash digest appeared anywhere in the packet**, so "verifiable from the repository alone" was **not verifiable from the document** | **provenance over-scope** |

**Batch 3 — review 2** (ACCEPT 24 · CONTEST 9 · REWORD 9 · INTEGRITY: CONTEST 1, across 43 marked units)

| ID | Error | Class |
|---|---|---|
| E34 | **Unit 34: an uncited quotation from a document outside the packet was the sole support for the unit's exculpatory conclusion** — while the trust class of the *other* unverifiable item in the same paragraph *was* disclosed → **INTEGRITY ESCALATION #3** | **provenance over-scope / selective disclosure** |
| E35 | Unit 34: **"S-I-B independently records"** — the scout's observation is derived from the orchestrator's own assignment description ("as described in my assignment"); the scout never saw the page | **independence overstated** |
| E36 | Units 15, 20, 21, 22, 23: **cluster-scale citation-floor failure.** S-H defers all five primary locators to a `capture.json` **not embedded in the packet**; the Dollar dissertation — the most load-bearing unhashed source — carried no title and no URL | **floor violation, second cluster-scale instance** |
| E37 | Unit 5: **"three of thirteen"** stage-classified sources on the 2.6.0 side, **refuted by the same sentence's own parenthetical** (02 and 04 are "Other", so the answer is one) | **count unchecked against own document** |
| E38 | Unit 16: dropped **"(non-significant)"** from the White subgroup result, **upgrading a null into a counter-directional finding** — which is what made "masking a subgroup split" read as established | **qualifier dropped** |
| E39 | Unit 27: "the abstract was cross-checked word-for-word **against the published version**" — the comparand was a **third-party blog's** rendering; the publisher's text was never reached | **secondary retelling attributed to primary** |
| E40 | Unit 1: the universal claim that *every* scout-resting Part One assertion carries an anchor, **falsified by the packet's own two unanchored provenance inventories** | universal claim unchecked |
| E41 | Unit 3: tier limb 2 stated **two different ways** in the same block, and under the stricter version **neither of the packet's own limb-2 TIER 1 assignments qualifies** | **internal contradiction** |
| E42 | Unit 4: **the run's single most load-bearing warrant table was exempted from the packet's own trust-class disclosure rule** — a rule the packet had just adopted and applied elsewhere | **selective disclosure** |
| E43 | Unit 25: dropped the hypogamy series' endpoint ("to about 2010") **and its post-2010 reversal** | qualifier dropped |
| E44 | Unit 28: **Proulx et al. (2007) promoted to "its strongest empirical citation" while unread, with its "TIER 3 as sourced" label omitted** — an unread source promoted by adjective rather than by label | **tier discipline on an unread source** |
| E45 | Unit 30: **Neff & Morgan assigned to the variance claim when S-I-B assigns it to the demand claim**, plus an anchor (`▸"typically requires"`) that supports only one part of the claim it was attached to | misattribution + anchor mismatch |
| E46 | Unit 31: a **non-parent** time-use finding generalised to **all couples** — which made the counter-evidence against Finkel **stronger than the source supports** | **scope drift** |
| E47 | Unit 36: a **corpus-wide superlative asserted from a batch table** — the reviewer's phrasing: *"an unevidenced superlative in the unit whose purpose is withdrawing two unevidenced superlatives"* | **superlative unchecked against own data** |
| E48 | Unit 41: the sub-80% cross-check explanation ("a different extractor on the scout's side") is **refuted by the packet's own 87.9%** — source 18 went through the same reader | explanation unchecked against own data |

**Record defects found in this seat, pre-existing and already pushed** (batch-1/2 vintage, not review findings)

| ID | Error | Class |
|---|---|---|
| E49 | The committed manifest said sources 01/02/04 **"retain their v2.6.1 exports"** and **"sit at analyzer 2.6.1"** when they sit at **2.6.0**; `analyzerVersionsPresent` was the impossible `["2.6.1","2.6.1"]`; `reason` said **"all nine analyzed sources"** when there are 21; `archive.state` repeated the version error. **This directly contradicted the epoch warrant the batch-3 packet rests on.** Corrected; 159 hashes re-verified after the edit, 0 failures | **the record contradicting the artifact** |
| E50 | RUN-STATE described manifest `words` as **"plain `wc -w`"**. It is a whitespace-run count; `wc -w` in this shell's `C` locale mis-splits multibyte text and reads high (source 21: 3403 vs the recorded 3352). The note would have sent a future seat chasing a phantom | imprecise method in the checkpoint |

#### The patterns, which matter more than the individual errors

| Pattern | Instances | Status |
|---|---|---|
| **P1 — Provenance over-scope, read-status inflation, selective disclosure.** The orchestrator knows the provenance, compresses or omits it, and the compressed form reads stronger than the truth. **The scout files always carried it.** | **E8** (b1) → **E9**, **E15** (b2r1, *escalated*) → **E16** (b2r2, *escalated*) → **E33** (b3r1) → **E34**, **E42** (b3r2, *escalated*) | **NOT CLOSED. This is the run's defining failure mode.** Corrected in every batch and recurred in every batch. **All three integrity escalations are instances of it.** By b3r2 it had mutated: not a false claim but a *true* claim left uncheckable, and a disclosure rule the packet wrote and then exempted its own central evidence from |
| **P2 — Superlatives, counts and explanations asserted without checking the packet's own tables.** Every time, the refuting data was **in the same document**. | **E13** (b2r1) → **E23**, **E24**, **E25** (b3r1) → **E37**, **E47**, **E48** (b3r2) | **NOT CLOSED, and it got denser.** E47 is the sharpest single instance in the run: an unevidenced superlative inside the unit whose stated purpose was withdrawing two unevidenced superlatives |
| **P3 — Overstating a source's own language; dropping the qualifiers and defeaters the source supplies.** The scout's hedge is consistently stronger than the synthesis's. | **E2** (b1) → **E12** (b2r1) → **E27**, **E32** (b3r1) → **E38**, **E43**, **E46** (b3r2) | **NOT CLOSED.** Note the direction: E38 and E46 both made the packet's *counter-evidence* stronger than its source supports. The bias is toward whatever sharpens the finding, not toward a side |
| **P4 — UNVERIFIED upgraded, or precision asserted beyond the recorded inputs.** | **E19**, **E20** (b2r2) → **E29** (b3r1) → **E39** (b3r2) | **NOT CLOSED.** |
| **P5 — Internal contradiction inside one section.** | **E6** (b1) → **E30** (b3r1) → **E41** (b3r2) | **NOT CLOSED.** |
| **P6 — Tier discipline on sources that were never read.** | **E3** (b1) → **E44** (b3r2) | **PARTLY CLOSED, and an earlier version of this record wrongly called it closed.** The specific batch-1 failure — *inflating* an unread source's tier, or grading a hypothetical — did **not** recur, and all four batch-3 scouts applied "TIER 3 as sourced" themselves, unprompted. But E44 is the same discipline failing in a form the convention's wording never covered: an unread source **promoted by adjective** ("its strongest empirical citation") with its tier label simply **omitted**. A convention that names one failure mode does not close the family |
| **P7 — The citation floor failing at whole-cluster scale.** | **E21** (b2r2, Cluster 3: S-F, zero URLs and zero DOIs across seven sources) → **E36** (b3r2, Cluster C9: S-H, five primary sources with locators deferred to an unembedded file) | **NOT CLOSED, and it is a process defect rather than a writing defect.** Both times the floor was stated *in the packet* and a whole cluster failed it. Both times the locators existed — in the capture files, or nowhere. **The fix is upstream: scout prompts must require locators inline in the findings file, because the findings file is what gets embedded** |

**The honest summary: of seven patterns, one is partly closed and six are open. Every one of them was caught
by cold review, and not one was caught by the orchestrator reading its own work.**

#### Countermeasures adopted, and whether they worked

| Countermeasure | Adopted after | Verdict |
|---|---|---|
| **"TIER 3 as sourced" for every unreached source**, counterfactual stated separately | batch 1 | **Partly worked.** Tier *inflation* on unread sources did not recur, and the scouts adopted the convention unprompted. But it did not prevent E44 — omitting the label and promoting by adjective instead |
| **Two-part packet doctrine** — synthesis separated from verbatim scout findings | batch 2 review 1 | **Worked, and is why this record exists.** The b3r1 reviewer: *"Because Part Two carries the locators, tiers and gaps verbatim, most of the defects above were detectable… A single-layer packet would have hidden all three."* Every one of b3r2's 18 defects was found from inside a single file with no other context; six by arithmetic on the packet's own tables |
| **Byte-verified script concatenation** of scout blocks (re-extract each block, recompute SHA-256, exit nonzero on mismatch) | batch 2 review 1 | **Worked completely.** **Zero** Part Two defects in any batch and zero locator-shedding in the verbatim layer after adoption. The one layer the orchestrator cannot touch is the one layer with no errors in it |
| **Per-claim anchors** into Part Two, replacing cluster-level pointers | batch 3 review 1 | **Worked, with one caveat.** 42 anchors, all verified to occur literally in their named blocks — the b3r2 reviewer re-checked every one. But E45 shows an anchor can be *present and still mismatched* to the claim it is attached to, and E40 shows the coverage claim was overstated |
| **Explicit unit numbering in the artifact** | batch 3 review 1 | **Worked.** Review 1 segmented 17k words into 8 units of its own; review 2 addressed **43 marked units** and reached a 3× higher ACCEPT rate on the same material — the granularity is what let it be specific enough to be useful |
| **Dropping the byte-auditability claim**; hash checks disclosed as orchestrator-side controls | batch 3 review 1 | **Worked where applied and failed where not.** The reviewer explicitly affirmed the disclosure on units 4 (after repair), 38 and 39 — and escalated unit 34 for **not** applying the same rule to a second unverifiable item in the same paragraph |
| **CITATION APPENDIX** built from committed capture files | batch 3 review 2 | **New, and a patch rather than a fix.** It cures the floor for 18 sources and names 5 that still fail. The underlying process defect (P7) is untouched |
| **Content-filter caps for verbatim-heavy scouts** — one artifact, ~1,000–1,400-word extract, single Write call, no verbatim echo in the final message | S-I failure | **Worked**, with a measurable cost: source 22's 61.8% cross-check overlap is the mitigation's fingerprint (§6.4) |

#### What the referee should take from this section

1. **The scout layer held; the synthesis layer did not.** Across five reviews, **no scout fabricated prose and
   no reviewer found fabrication anywhere in any packet.** The scouts applied the run's own tier convention
   unprompted, named their own barriers, and recorded their own failures to reach sources. **Every one of the
   50 errors above is the orchestrator's.**
2. **The single failure mode is compression, and it is concentrated in the provenance layer.** P1 accounts for
   six errors including **all three integrity escalations**. In every case the correct information was
   **already in the run's own artifacts** and was lost when the orchestrator restated it more confidently than
   the source did. By the third escalation the defect had refined itself into something subtler than a false
   statement: a *true* statement left uncheckable, in a paragraph that disclosed the trust class of a
   neighbouring item and not of this one.
3. **P2 is the cheapest failure to fix and it recurred seven times.** Every instance was refutable by
   arithmetic on a table printed in the same document. This is not a knowledge problem or a sourcing problem.
4. **Cold review, not self-review, found essentially everything.** The two things the orchestrator's own
   re-read found — the missing 68% counterweight, and source 16's 40% overlap being its own extraction —
   were both found *while checking a reviewer's charge*, not while checking its own work. **The one seat that
   went looking for its own errors unprompted (this one, for the manifest defects E49–E50) found them in the
   record, not in the reasoning.**
5. **Two charges were rejected across the run, and both rejections are recorded.** Batch 1 ITEM 11's
   attribution (§6.3), and batch 3 unit 36's proposed narrowing, which was replaced with a *stronger* fix that
   honoured the diagnosis by supplying the missing data rather than withdrawing a true claim. A disclosure
   section that only confesses is as unreliable as one that only defends.
6. **The disclosure asymmetry is the point.** Every defect above is discoverable from the committed artifacts
   by a reader with no access to this conversation. That is a property of the two-part doctrine, and it is the
   strongest single claim this lane makes.

---

## 7. WHAT IS OPEN

**The run is halted.** Batch 3's second cold review returned `INTEGRITY: CONTEST` on unit 34; per the run
contract that halts the run and escalates. The defect is repaired and batch 3 is **committed but not pushed**.
Item 0 below is the blocking one.

| # | Open item | Why it is not closed here |
|---|---|---|
| **0** | **⛔ THE BLOCKING ITEM: does the unit-34 repair close integrity escalation #3?** | §6.2b. Both charges were accepted; the conclusion was re-grounded on four repository checks with the trust class of each disclosed, and the non-independent corroboration was withdrawn. **But the orchestrator adjudicating its own escalation is exactly the arrangement the escalation contract exists to prevent**, which is why it is not marked resolved here. Options a ruling could take: accept the repair and push; require a third cold review of the repaired packet before pushing (the batch-2 precedent argues for this, since batch 2 was repaired and never re-reviewed); or require the C1d unit be cut back to what Part Two alone supports, dropping the site-internal reads entirely |
| **0b** | **P7's process fix is specified and not applied** | §6.7. Both cluster-scale citation-floor failures happened because scouts recorded locators in a **companion `capture.json` that never gets embedded**, while the findings file is what Part Two carries. The batch-3 CITATION APPENDIX patches the symptom for 18 sources. **The fix is upstream — scout prompts must require locators inline in the findings file** — and it applies to any future batch, so it belongs in the run contract rather than in a packet |
| 1 | **Which reading explains the retention gap** — stage asymmetry, or genre-proximity decay | Both are consistent with the observed monotone ordering (formation 24.1% > maintenance 7.0% > other 4.4% > method 0.0%), and the within-arm spread (3.7× maintenance, 4.1× formation) is already as large as the between-arm ratio (3.45×), which **neither reading is excluded by**. Separating them needs a **canon-side census by stage** and a **matched-pair analysis holding topic constant while varying stage** — new measurements, not re-readings. **The two readings imply different remedies**: write maintenance doctrine, versus accept that retrieval is lexically narrow and more doctrine in the same vocabulary will not fix it. **Referee question.** |
| 2 | **Batch 2 is repaired but unre-reviewed** | §6.2. The escalated defect is fixed in the artifact; no cold reviewer has seen the corrected packet. |
| 3 | **Cluster 3 (C10) cannot be promoted as it stands** | §6.7 E21. S-F carries zero URLs and zero DOIs for its seven sources; on the run's own citation floor the cluster fails outright. This is a *citation* failure, not a finding failure — the substantive result (Pew 2025 finds no sex gap in partner reliance) is real and archived. |
| 4 | **C8's Figure 2 remains UNVERIFIED** | No such instrument was located; two sources contradict the divergence reading; "gender gap" carries two incompatible definitions (11 vs 31 points) where the larger double-counts against the historical series. |
| 5 | **Thresholds are uncalibrated and no calibration pass has run** | By design. 1,964 residue segments are located, hashed and re-fetchable — the labelling substrate a calibration pass would need. |
| 6 | **Guttentag & Secord (1983) was never reached** | The site cites a book this run could not read. Every dyadic/structural definition comes through two independent secondary readers. |
| 7 | **The C1d candidate doctrine, not the published page, carries the misattribution risk** | The site's passage carries no attribution element, and the site names the suffocation model nowhere (§6.2b), so it misattributes nothing. Pairing it with "Supporting: Finkel lineage" would source it to a model that **disclaims** the reading. Live defect in the candidate, not the page. |
| 8 | **Eleven batch-3 primary reads sit outside the hash chain, eight load-bearing** | §6.6. Re-fetching them under grade A or B is the remedy; none was attempted, because the run's rule archives only sources it accepts into the corpus. |
| 9 | **12 miscorrelation items are handed over unacted-on** | §5. Flag-mapping feedback is Jason's alone by contract. MC-12 was surfaced by the unit-34 adjudication itself and did not exist before it. |
