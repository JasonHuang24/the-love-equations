# RESEARCH PACKET — BATCH 2 (verification-first)

Three claim clusters. Every claim carries its source, its evidence tier as assigned, and its figures as
recorded. Gaps are listed with the barrier that produced them. Nothing here has been adjudicated.

Tier assignments: **TIER 1** = peer-reviewed with independent replication, or large-n probability-sample
instrument with published methodology · **TIER 2** = single survey or study, no independent replication ·
**TIER 3** = commentary, punditry, trend reporting, convenience sample, or a third-party aggregation.

**Tier convention, applied throughout this packet:** a source that was never read gets **TIER 3 as
sourced**, regardless of what it would rate if read, with the counterfactual stated separately. Batch 1's
review found tier inflation on unread sources to be its single most common defect; this packet adopts the
correction.

---

## CLUSTER 1 — "Political alignment now operates as a first-class market-segmenting filter among young daters, asymmetrically by sex" (2020s US)

This was a **verification assignment**. Two figures were on record and neither had been independently
verified. Both have now been checked to primary.

### ITEM 1. FIGURE 1 — CORRECTED. The sponsor is wrong as recorded.

The survey is **IFS/YouGov alone**, not "AEI/IFS." Published by Wendy Wang, Institute for Family
Studies, 2026-02-06: https://ifstudies.org/blog/the-one-role-gen-z-women-still-want-men-to-play
AEI's involvement is a **separate commentary** by Samuel J. Abrams (AEIdeas, 2026-03-17), not
co-sponsorship of the instrument.

Method, read from the report: fielded by YouGov 2025-04-07 to 2025-04-15; **n = 3,000 comprising 2,000
men and 1,000 women** aged 18–29 — not a balanced sample; opt-in panel matched to a modelled frame and
propensity-weighted; **no margin of error published**.
TIER 2 (single survey, non-probability panel, no independent replication).

### ITEM 2. FIGURE 1 — CORRECTED. The 36% belongs to conservative WOMEN, not conservative men.

Read at full precision from IFS's own interactive chart appendix
(https://ifstudies.org/ifs-admin/resources/html_iframe/interactive_partyid_charts.html), which carries
explicit `Sex` and `Ideology` fields per row. Item = "Political views" rated **"very important"**:

| Subgroup | Political views | Stable job | Political − job |
|---|---|---|---|
| Conservative men | 36.98 → **37%** | 42.80 → 43% | **−5.82** |
| Conservative women | 36.39 → **36%** | 69.74 → 70% | **−33.34** |
| Liberal men | 46.93 → 47% | 38.75 → 39% | **+8.18** |
| Liberal women | 60.26 → 60% | 54.50 → 55% | **+5.76** |

The recorded pairing — "60% of liberal young women versus 36% of conservative young men" — **appears in
no source.** The 36 is conservative *women*; conservative *men* are 37. The article's own prose compares
liberal women to liberal men and then groups conservatives together, verbatim: "Among young liberal women
under age 30, a majority (60%) say that finding someone who shares similar political views is 'very
important,' compared with less than half of liberal men (47%), and a much lower share of conservative
young men and women." The 36-versus-37 split exists **only** in the chart appendix, which is why that
appendix is archived alongside the article (sha256 `c1f9b66f…`).

### ITEM 3. FIGURE 1 — CORRECTED. It is not a ranking question.

The instrument rates **ten qualities independently**, each on an importance scale: Confident · Earning
potential · Kind · Mentally & emotionally stable · Moral/religious beliefs · Physically attractive ·
Political views · Sense of humor · Shares ideas about kids · Stable job.
So "ranks political alignment above job stability" is **an analyst's between-item comparison, not
respondent ranking behaviour.** No respondent was asked to order anything.

Where "Political views" actually sits among the ten, by percentage: **liberal women 5th of 10**, liberal
men 6th, conservative men 9th, conservative women 9th. (A prior scout report said 6th for liberal women;
recomputed from the appendix it is 5th. Corrected here.)

### ITEM 4. FIGURE 1 — the "asymmetrically by sex" reading is undercut by the same data.

**Liberal men show a LARGER political-over-job gap (+8.18) than liberal women (+5.76).** Among
conservatives the sex gap on political views is **0.59 points, with men slightly higher** (36.98 vs
36.39). The dominant axis in this table is **ideology, not sex**: liberals rate political views above a
stable job, conservatives rate it far below.
Neither IFS nor the AEI commentary remarks on the liberal-men figure. Recorded as a fact about the data,
not as an adjudication of the cluster claim.

**GAP:** the exact fielded question wording is **UNVERIFIED** — no questionnaire or topline is published.

### ITEM 5. FIGURE 2 — UNVERIFIED. The instrument does not exist as described.

There is no single "Gen-Z exit-poll gender-gap series." It is a **commentator aggregation across at least
four unrelated instruments**, one of which is not an exit poll and one of which measures ideology rather
than vote:
- **Edison/NEP 2024 exit poll** — methods statement archived
  (https://s.abcnews.com/assets/dtci/elections/NEPExitPollMethodologyStatement.pdf).
- **AP VoteCast / AP-NORC 2024** — n = 139,938, Oct 28–Nov 5, MOE ±0.4 pp among voters, 3.1%
  probability-arm response rate. **Not an exit poll.**
- **CIRCLE** re-analysis · **CAWP** re-analysis · **CES** (ideology, not vote).

Exit-poll limits, from the NEP's own archived document: 279 polling places; 27 early-vote sites in only
4 states; absentee and early voters covered by a separate pre-Election-Day intent poll (Oct 24–Nov 2);
**no national margin of error published** (the error table is by subgroup base size only, and gives no
base n for 18–29-by-sex); and a post-hoc reweighting dated 12/13/24 that supersedes election-night
figures.

### ITEM 6. FIGURE 2 — two sources contradict the divergence reading.

- **CAWP**, on the reweighted Edison data
  (https://cawp.rutgers.edu/blog/gender-differences-2024-presidential-vote): "the gender gap among this
  age group was 11 points in 2024, smaller than the 15-point gender gap in 2020."
- **CES replication**
  (https://youngamericans.berkeley.edu/2024/02/are-the-ideologies-of-young-women-and-young-men-in-the-us-diverging/):
  "there is seemingly no trend in the gap over time using the even years of the CES… stood at about 7
  percentage points as of 2022."

### ITEM 7. FIGURE 2 — "gender gap" has two incompatible definitions, and the larger one double-counts.

- **CAWP definition:** difference between the sexes in support for a single candidate → **11 points**.
- **CIRCLE definition:** sum of the two within-sex margins (women Harris +17, men Trump +14) → **31
  points**.

Quoting 31 against the historical CAWP series (4–12 points since 1980) roughly **double-counts**, because
the historical series uses the first definition. This is the single most likely way for this cluster to
be restated wrongly.

### ITEM 8. Stated preference is well instrumented and sex-asymmetric — but it is not the claim.

Survey Center on American Life, "Romantic Recession" — Ipsos KnowledgePanel **probability** panel,
n = 5,837 (Aug 2024, ±1.4) and n = 5,244 (Dec 2024, ±1.6): "More than half (52 percent) of single women
say they would be somewhat less likely or a lot less likely to date a Trump supporter. Only 36 percent of
single men say they would be less inclined."
**Scope limits:** single adults **18+, not Gen Z**, and a **Trump-support item, not generic political
alignment**. TIER 2 (single instrument, probability panel, no independent replication).

### ITEM 9. Revealed sorting exists only as older, whole-population work with no sex asymmetry.

Huber & Malhotra 2017 (online-dating behaviour); Iyengar, Konitzer & Tedin 2018 (voter files); Hersh &
Ghitza 2018. All **2016–2018 and whole-population**, with **no sex asymmetry reported**, and no 2020s or
Gen-Z-specific instrument located.
**TIER 3 as sourced** — none was read primary. Iyengar et al. 2018 was the highest-value target and was
**not reached** (Stanford PDF 403 plus a download dialog; University of Chicago paywalled); its reported
72/73 → 82% spousal-homogeneity trend is the batch's most valuable missing artifact. Were these read,
they would likely rate TIER 2.

**Consequence as recorded:** "operates as a filter" is currently **a stated-preference finding wearing a
revealed-behaviour verb.**

---

## CLUSTER 2 — "AI companions function as a substitute good for the demographic modeled as market-exiting"

Actor: predominantly young men. Mechanism: substitution. Qualifier: interpretation, not finding.

### ITEM 10. The primary instrument is an opt-in quota panel, not a probability sample.

Willoughby, B. J., Carroll, J. S., Dover, N., & Hakala, H. (2025). *Counterfeit Connections: The Rise of
AI Companions and AI Pornography.* Wheatley Institute, BYU.
https://brightspotcdn.byu.edu/a6/a1/c3036cf14686accdae72a4861dd1/counterfeit-connections-report.pdf
Verified against the archived report: "The sample for this study comprised of 2,969 adults (ages 18 and
older) residing in the United States"; data "gathered by Qualtrics"; respondents drawn from "existing
sample panels from Qualtrics and screened based on a quota sampling framework"; plus "an additional
oversample of 1,000 individuals aged 18-29." **No margin of error is published.**
TIER 2.

### ITEM 11. The headline figures are lifetime-ever items, not current use.

Verbatim from the archived report, in the perfect tense throughout: "almost 1 in 5 of adults in the
United States (19%) reporting that they **have chatted** with an AI system meant to simulate a romantic
partner"; and "nearly 1 in 3 young adult men (31%) and 1 in 4 young adult women (23%) reporting that they
**have chatted** with an AI boyfriend or girlfriend."
**The instrument contains no current-relationship-status item at all.** "Have you ever chatted," "would
you consider," and "are you in a relationship with one" are three different questions, and only the first
is measured here.

### ITEM 12. The 21% preference figure has a user denominator, not a sample denominator.

Verbatim: "**Of those who chatted** with AI systems to simulate romantic partners, over 1 in 5 (21%)
agreed that they preferred AI communication over engaging with a real person."
Restating this as "21% of young adults prefer AI to people" would be wrong by the entire base.

### ITEM 13. The independent source has better methodology and the wrong population.

Common Sense Media with NORC at the University of Chicago (2025). *Talk, Trust, and Trade-Offs: How and
Why Teens Use AI Companions.*
https://www.commonsensemedia.org/sites/default/files/research/report/talk-trust-and-trade-offs_2025_web.pdf
Genuinely independent of ITEM 10 — different publisher, funder, and data-collection firm — using an
**AmeriSpeak Teen probability panel** with a calibrated nonprobability supplement and a published MOE of
**±4.2 points**. That is stronger methodology than the primary.
**But it covers teens 13–17, while this cluster concerns adults roughly 18–30.** Its figures cannot be
merged with ITEM 10's. TIER 2 for its own population; **not evidence for this cluster's population.**

### ITEM 14. A third, probability-panel figure could not be verified to primary.

Gallup / Walton Family Foundation, reported via *Harvard Business Review* (Duckworth et al.) — reported
as 10% of 18–28-year-olds using an AI "girlfriend/boyfriend" monthly.
**GAP — UNVERIFIED TO PRIMARY.** HBR is paywalled past the first paragraph and web.archive.org was
unreachable in this environment. The only text obtained is Wheatley quoting Gallup's figure inside its own
later report — a source quoting a source. **TIER 3 as sourced**; would likely rate TIER 1 on methodology
if the primary were read.

### ITEM 15. Nothing measures displacement. Every reachable source measures prevalence.

No source isolates single, dating-market-disengaged men and tests whether AI companion use **reduces
real-world partner-seeking**. The closest available item comes from a **non-independent** Wheatley/IFS
follow-up ("Secret Soulmates," partnered-only sample, n = 2,431): 54% of AI-using partnered young adults
agreed "I use romantic AI companion(s) to replace human relationships."
That measures substitution **within an existing relationship**, not displacement of dating-market entry by
single men — which is the actual claim. Both Wheatley reports **explicitly disclaim causal direction**
(cross-sectional data), and the primary separately links companion use to higher depression and loneliness
without being able to establish direction.
**Recorded as a structural gap, not an oversight.**

### ITEM 16. Six sources were excluded as marketing-tier, one of them cited inside the primary.

Excluded and not used as evidence for any claim: Match.com/Kinsey "Singles in America" (26%; "333%
increase"); Forbes AI-girlfriend search-volume statistics; VentureBeat app-popularity claims; a ZipHealth
survey; a Wiingy study; and **Wheatley's own footnoted "70,000 monthly searches" market estimate.**
Recorded because the exclusion is a finding about the evidence base: much of what circulates on this topic
is vendor and market-research material.

**Other gaps:** Pew's 2025–2026 AI releases surfaced only general chatbot-use figures, not
romantic-companion-specific ones, and were not deep-read — **not confirmed absent**. YouGov not checked.
A same-team peer-reviewed companion article (Willoughby et al., *Journal of Social and Personal
Relationships*, 2025) is cited in the report's own reference list but was not located.

---

## CLUSTER 3 — "Male friendship decline concentrates men's emotional support onto romantic partners as sole channel"

Split three ways and kept separate: **(a)** men have fewer friends / receive less support from friends;
**(b)** men rely on romantic partners for support; **(c)** partners are men's *sole or primary* channel,
such that friendship decline concentrates support there.

### ITEM 17. (a) The verified figure, on the batch's strongest instrument.

Cox, D. A. (2021, June 8). *The State of American Friendship: Change, Challenges, and Loss.* Survey Center
on American Life, American Perspectives Survey.
https://www.americansurveycenter.org/research/the-state-of-american-friendship-change-challenges-and-loss/
**N = 2,019 US adults on the Ipsos KnowledgePanel — a genuine probability panel** — fielded May 14–23
2021, MOE ±2.4 points.
Verified verbatim against the archived page: "Men are also far less likely than women are to have received
emotional support from a friend. Four in 10 (41 percent) women report having received emotional support
from a friend within the past week, compared to 21 percent of men."
**Recall window: "within the past week," stated explicitly.**
Close friends by sex over time, from the companion piece (**fetch-tool extracted, not raw-parsed —
partially verified**): men with 6+ close friends 55% (1990) → 27% (2021); men with zero close friends 3% →
15%; women with 6+ 41% → 24%; women with zero 10% (2021, **no 1990 comparator given**).
TIER 1-eligible on methodology for the headline figure. **GAP:** the literal interviewer-facing question
wording is **not recoverable** — the topline PDF is image-rendered and not machine-extractable.

### ITEM 18. (c) The usual citation for the claim contains no concentration step.

The ASC/Cox report above — the source normally cited for the sole-channel claim — **contains no
concentration or sole-channel finding at all.** The prior integrity flag is **confirmed for this source
specifically**, and this is now verifiable against the archived text rather than asserted.
It is **not** generalizable to "no data anywhere" — see ITEM 19.

### ITEM 19. (c) Instrumented concentration evidence does exist, in the wrong population.

Sun, J., & Schafer, M. H. (2023). "Isolation or Replenishment? The Case of Partner Network Exclusivity."
*The Journals of Gerontology, Series B* 78(4):705–. DOI 10.1093/geronb/gbac190.
Reported: **N = 17,429 partnered SHARE respondents**; men are disproportionately more likely to have a
partner as their **sole core-network member**, and less likely to replenish the network after partner loss.
**Strong methodology, wrong population** — older Europeans, not the US friendship-decline cohort the claim
concerns.
**GAP — full text not reached (ResearchGate 403).** **TIER 3 as sourced**; would rate TIER 1 on
methodology if read. Two supplementary percentages (a 12.7-point gap; <60% versus ~90% replenishment) are
**UNVERIFIED — single-source, tool-extracted, not independently corroborated.**

### ITEM 20. (c) The most direct modern US test points AGAINST the mechanism.

Pew Research Center (2025, January 16). *Where Men and Women Turn for Emotional Support and Social
Connection*, from "Men, Women and Social Connections," American Trends Panel Wave 154.
https://www.pewresearch.org/social-trends/2025/01/16/where-men-and-women-turn-for-emotional-support-and-social-connection/
**n = 6,204**, probability panel. Verified verbatim against the archived page: "About three-quarters of
U.S. adults (74%) say they would be extremely or very likely to turn to their spouse or partner if they
needed emotional support," and decisively — "**Men and women are equally likely to say they'd lean on
their spouse or partner in this way.**"
So **there is no sex gap in partner reliance itself.** The sex gap is in the breadth of *other* channels.
TIER 1-eligible on methodology.

### ITEM 21. (c) No source tests the causal mechanism at all.

No located source tests whether **declining friend networks cause increased partner concentration over
time.** Every source in this cluster is cross-sectional. The mechanism is the claim's load-bearing step and
it is uninstrumented.

### ITEM 22. A near-miss inspected and rejected.

Shin & Park (2023) initially appeared to support (c), but on inspection their "restricted" network type is
**general relational poverty, not partner concentration.** Recorded so it is not later mistaken for
concentration evidence. **TIER 3 as sourced** (secondhand only).
Also reached abstract-only: Dykstra & de Jong Gierveld (2004), Dutch, N = 3,737, 1992 data — bears on
(b)/(c)-adjacent territory. **GAP**, paywalled. **TIER 3 as sourced.**

### ITEM 23. (b) Partial support, from the archived probability-panel source.

The ASC/Cox report carries a "first person you'd turn to" item showing **married men 85% versus married
women 72%** naming their spouse. That is genuine partner-reliance evidence and it is sex-asymmetric —
which sits in tension with ITEM 20's finding of no sex gap on a differently-worded Pew item. Both are
probability panels; the items are not identical, and this packet does not adjudicate between them.

**Other gaps:** McPherson, Smith-Lovin & Brashears 2006 (GSS confidant-network paper) — PDF not
text-extractable, not read.

---

## LAB MEASUREMENT — the six sources archived for this batch

Analyzer 2.6.1, analysis schema `le-lab.analysis/2.6`, scoring config `bt0a7p`, canon
`1.0.0+949aef381d5f`. **Every mapped-share figure is PROVISIONAL** — thresholds were authored by judgment
and never fitted to labelled data (`coverage.provisional = true`). These are document-coverage
measurements, not population statistics, not factual accuracy, and not evidence any claim is true.

| # | Source | Grade | Words | Claim-like | Mapped | Share | Queue | Set aside |
|---|---|---|---|---|---|---|---|---|
| 11 | IFS / Wang (Gen Z partner priorities) | A | 2,098 | 55 | 7 | 12.7% | 48 | 53 |
| 12 | NEP exit-poll methods statement | B | 592 | **0** | 0 | n/a | 0 | 66 |
| 13 | Wheatley "Counterfeit Connections" | B | 8,479 | 129 | 7 | 5.4% | 122 | 476 |
| 14 | Common Sense Media / NORC | B | 4,963 | 17 | 1 | 5.9% | 16 | 383 |
| 15 | ASC / Cox American Friendship | A | 4,592 | 17 | 0 | 0% | 17 | 265 |
| 16 | Pew emotional support (ch. 2) | A | 819 | 3 | 0 | 0% | 3 | 39 |
| | **Total** | | **21,543** | **221** | **15** | — | **206** | **1,282** |

**Source 12 returned zero claim-like segments and therefore has no mapped share to report.** That is a
one-page election-methodology statement containing no relationship-domain claims, so an empty claim
surface is the domain gate behaving correctly — the same reading source 06 needed in batch 1. It is
archived for its provenance value (the exit-poll limits in ITEM 5), not for its claim yield.

**The high set-aside counts on sources 13, 14, and 15 are expected and disclosed.** No anchor truncation
was applied to the batch-2 PDFs, so endnotes, front matter, and chart labels remain in the analyzed text.

## PROVENANCE

Covers the **six archived sources only.** Other sources cited in this packet were read by scouts but never
archived and therefore carry **no extraction chain and no hash** — including every source in ITEMs 8, 9,
14, 19, and 22. Claims traced only to those readings are provenance-weaker than claims traced to the
archive.

- **Grade A** (archived HTML → committed `tools/extract-source-text.mjs` → SHA-256): sources 11, 15, 16.
- **Grade B** (archived PDF → `pdftotext` 4.00 with recorded flags → SHA-256): sources 12, 13, 14.
  Reproducible with the same tool version, but the extractor is an external binary rather than a hashed
  repository file, so it cannot be verified from the repository alone.

Scout-capture cross-check, 8-word shingle overlap against the deterministic extraction: source 11 **70.5%**,
12 **64%**, 13 **88.6%**, 14 **78.6%**, 15 **90.9%**, 16 **40%**.

**Source 16's 40% was investigated and is a span difference, not a fidelity problem.** The scout's capture
merged the report landing page with this chapter; the archive is the chapter alone. The whole fetched page
contains only 1,626 words including all navigation and footer chrome, so 819 words is the chapter's actual
prose, and the decisive sentence quoted in ITEM 20 is present verbatim in the archive. Source 11's 70.5%
is likewise explained: the scout appended machine-read chart values that do not appear in the article
prose. Source 12's 64% reflects a different PDF text extractor (the scout used PyMuPDF; the archive uses
pdftotext).

**One tool observation worth recording:** the scout reported that WebFetch **explicitly refused verbatim
reproduction** of both the IFS and AEI articles, forcing it to use a browser pane, and that the numeric
appendix required reading Plotly trace objects. Plain `curl` had no such difficulty, which is why the
archived artifact is a deterministic extraction rather than a browser read.
