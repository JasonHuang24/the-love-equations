# Batch 1 — cold review dispositions and their adjudication

Reviewer: Claude Opus 5, effort xhigh, **cold subagent**. Dispatch prompt was the review packet
(revision 1) plus the stripped review rules and nothing else — no run narrative, no orchestrator
commentary, no prior findings. The reviewer was fenced to reading one file and instructed that an
absence in the packet is itself a finding rather than a prompt to go looking elsewhere.

**Result: ACCEPT 21 · REWORD 10 · CONTEST 5 · INTEGRITY 0.**

## The integrity gate did not fire

No item alleged fabrication, and no item alleged an unreachable source presented as verified. The
reviewer's own words: "every gap in the packet... names its barrier and labels its retrieval mode,
including two cases where the only artifact was a tool paraphrase rather than verbatim text. No quote,
figure, or citation in the packet reads as fabricated."

It also offered a genuinely useful piece of forensic reasoning in support of that: the two densest
numeric blocks — the 2000 univariate F table and the Heyman & Slep confusion matrices — reproduce all
of their own derived statistics exactly, "which is not a property invented numbers have." It
independently recomputed the F-critical bands, both chi-squares, all ten matrix statistics, the
16%-prevalence PPV, and every percentage and column total in the Lab measurement table.

Per the run contract, integrity findings escalate to Jason and quality findings do not. **Nothing
escalates.** The run continued without interruption.

## Adjudication summary

| Disposition | Count | Outcome |
|---|---|---|
| ACCEPT | 21 | No action. |
| REWORD | 10 | All 10 applied. |
| CONTEST | 5 | 4 applied; **1 rejected with reason** (ITEM 11). |

Four contested or reworded points were settled by re-reading archived source text rather than by
argument — possible only because those sources are in the corpus with verified hashes.

## The rejected charge — ITEM 11

**Reviewer's charge:** the packet "restated a statistic with a different denominator than its
source's," failing figure fidelity, because the design description (176 divorced, split into
subsamples of 88 divorced and 176 married) is irreconcilable with the confusion matrices (37 divorced
per subsample).

**Adjudication: the observation is correct and valuable; the attribution is wrong. Charge rejected,
finding kept.**

Re-read against the archived source `06-heyman-crossvalidation.txt`, the packet's design description is
verbatim-faithful. The paper states it itself: "We randomly split the 176 divorced participants and the
352 married or cohabiting participants into two subsamples, each with 88 divorced and 176 married or
living together participants." The n = 6,002 figure is likewise the paper's own: "Participants
(n = 6,002) were men and women aged 18 years or older..."

So the packet did not change a denominator. **The discrepancy is the source's** — an unexplained drop
from 88 divorced to 37 between the described split and the classified matrices, most plausibly listwise
deletion on the regression's predictors, which the paper does not state. The reviewer reached the right
observation through a wrong theory of where it came from, which is a normal and acceptable outcome for a
reviewer working from the packet alone: it could not check the archive.

What the charge *should* have produced has been done: the discrepancy is now disclosed in ITEM 11 as a
preserved source-level defect, beside the sensitivity/specificity transcription defect already recorded
there. That is the substance of the finding, so it is kept.

## The four applied CONTESTs

**ITEM 17 — the reviewer caught a real error of mine.** Revision 1 attached a subsample caveat to the
*avoidant* correlation and located it in heterosexual women. Checked against
`07-van-lankveld-desire.txt`, the caveat belongs to the *anxious* correlation and runs the other way:
it "was positive and significant in the full sample and all subsamples, but not significant in the
subsample of non-heterosexual men." Both correlations are full-sample estimates. Corrected.

The same re-read settled the reviewer's second observation, that ITEM 17 called r = 0.25 "medium effect
size" while ITEM 22 called the identical coefficients "weakly positive." The source supplies **no
magnitude adjective at all** — it says only "correlated positively and significantly with sexual desire
(both r = 0.25, p < 0.001)." The "medium" gloss came from the scout's findings, and "weakly" was mine.
Both withdrawn; the coefficients now stand unadorned.

**ITEM 18 — tier discipline.** "TIER 2 if the secondhand description holds" grades a hypothetical. Tier
tracks how a source was actually reached, and this one was reached through a press summary with no
statistics and an unverified author list. Changed to TIER 3 as sourced, with the counterfactual stated
separately.

**ITEM 21 — two defects, both applied.** TIER 2 was assigned to a study never read, with unknown
authors, from a search record: changed to TIER 3 as sourced. And the year does not fit the volume — this
packet pins *JSMT* vol 36 to 2010 at ITEM 20, which places vol 38 in 2012, not the asserted 2011. The
reviewer noted that every other venue-year pair in the packet checks out exactly, which is what made
this one stand out. Rather than assert 2012 from inference, the year is now marked UNVERIFIED.

**ITEM 22 — citation floor.** The characterisation of "Mikulincer & Shaver's attachment-and-sexuality
work" carried no year, venue, or locator: a substantive claim about what a literature says, with no
citation of any kind. Withdrawn rather than repaired, since those names were reached only as background
citations inside another paper.

**ITEM 30 — the packet's weakest item, and the reviewer was right to name it so.** Johnson & Rusbult
(1989) carried authors and a year only — no journal, volume, pages, DOI, or URL — with a WebSearch
synthesis as its retrieval basis, and the claim that "Rusbult was at the University of Kentucky at the
time" was carrying the item's entire lineage-independence conclusion while itself uncited. The
affiliation claim is withdrawn. The item is **retained** despite failing the floor, because it is a
*disconfirming* finding and dropping it would bias the cluster in the claim's favour — but it is now
marked as requiring re-citation before any use.

## The ten applied REWORDs, in brief

- **ITEM 4** — 9/73 = 12.3%, not the printed 12.5%. Quoted as printed with the arithmetic noted; whether
  it is the paper's typo or an upstream slip is UNVERIFIED, since that source is not archived.
- **ITEM 6** — a claim about how often summaries absorb this paper, carrying no citation. Removed.
- **ITEM 9** — used "130 couples" as established while ITEM 7 marks it search-engine-only and
  UNVERIFIED. Now flagged, cross-referenced.
- **ITEM 12** — counted four independent critique lineages without recording that one was never reached
  and another exists only as a tool paraphrase. Now says two of four contributed usable text, and that
  the unreached group's placement on the critique side is itself unverified.
- **ITEM 14** — "TIER 1-adjacent" is not a rung in this packet's scheme. Now TIER 2 with the design
  strengths stated plainly.
- **ITEM 24** — the sharpest scope catch of the review. The item headlined a *pool-comparison* construct
  as the cluster's main effect, when the cluster claim is about self-versus-partner value — and the
  packet itself flags that same construct mismatch for the moderator at ITEM 27 without flagging it
  here. Now scoped, and ITEM 25 is identified as the item that actually bears on the main effect.
- **ITEM 27** — the Study 3 sign-reversal reconciliation was presented as the paper's argument. Checked
  against `09-conroy-beam-discrepancies.txt`: the paper says only that Study 3 "replicated the
  relationship... found in Studies 1 and 2" and never addresses a sign reversal. Re-attributed as the
  scout's inference.
- **ITEM 31** — asserted "serial mediation" and "parallel mediation" about the same paper four lines
  apart. Now states the model form as unconfirmed, which is the honest position for a 403'd source.
- **ITEM 35** — the Tran et al. meta-analysis was described in evidential terms while carrying no tier
  and no locator beyond a title. Now TIER 3 as sourced, with the TIER 1 counterfactual stated.
- **Provenance section** — "Every source above was independently re-fetched" read as covering the whole
  packet when the extraction chains cover only the six archived sources. Now scoped explicitly, naming
  Buss et al. 2017 as the clearest example of a paper read in full by a scout but never archived and
  therefore carrying no hash.

## Observations the reviewer flagged without charging, carried forward

- **ITEM 2** — "the same ordering appears in the early-versus-later analysis" is demonstrated only for
  husband defensiveness over husband contempt; the other two terms were never extracted.
- **ITEM 19** and **ITEM 21**'s Klusmann and Twenge bullets carry no tier where the packet's own
  convention would assign "TIER 3 as sourced."
- **ITEM 29** — "Sobel's test t(167) = −7.58" is an odd reporting form; a Sobel statistic is normally a
  z, and its df would not equal N. Already TIER 3 and secondhand; flagged if the chapter is re-read.
- **ITEM 33** — "Glass & Wright (1985, 1992)" carries no venues, so neither primary can be pinned if
  someone later tries to fetch them.
- **ITEM 36** — the site's own copy attributes 21% to "(Pew 2023)" with no report title or URL. Now
  noted in the packet as a citation-floor weakness in the site text, quoted as it stands.

## What this review says about the batch

The reviewer's verdict on the packet's strongest work is worth recording, because it is the part most
likely to matter for doctrine: it called the Cohort A/B lineage argument (ITEM 9) "the packet's best
structural work" for evidencing sameness through near-identical recruitment prose rather than inferring
it, and called ITEM 28's closing sentence "the strongest possible form of the finding because it is
falsifiable." It affirmed the gap-recording behaviour throughout — fourteen items — as correct rather
than deficient, which is the disposition this run's rubric was built to reward.

The corrections cluster in one place: **tier labels on sources that were never read.** Four of the five
CONTESTs and two REWORDs are that single failure mode. Batch 2 and 3 packets should assign "TIER 3 as
sourced" to every unreached source by default and state the counterfactual separately, rather than
grading what the source would rate if its description held.
