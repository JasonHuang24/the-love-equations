# RESEARCH PACKET — BATCH 2 (verification-first) — REVISION 2

**This packet is built under a doctrine change and is structured in two parts.**

Revision 1 was a compression of scout findings, and a cold review found the compression itself to be the
defect: nine of eleven CONTESTs traced to locators shed while summarising findings the scouts had sourced
correctly, one item was escalated `INTEGRITY: CONTEST` for presenting a properly-sourced report as if
unverifiable, and one material counterweight was dropped. Packets are therefore no longer compressions.

- **PART ONE — SYNTHESIS (orchestrator-authored).** Cluster framing, cross-scout tensions, the Lab
  measurement, provenance grades, and the corrections applied at review. This layer is the
  orchestrator's own object and should be graded as such. It **paraphrases no scout claim**; where it
  needs to restate one, it cites the verbatim block in Part Two.
- **PART TWO — SCOUT FINDINGS, VERBATIM (scout-authored).** The complete findings files from scouts S-D,
  S-E and S-F, embedded byte-for-byte with every locator intact. They were **concatenated by script, not
  retyped**, so that "untouched" is a mechanical guarantee rather than an assurance. Every citation,
  URL, tier, sample size, and gap in Part Two is the scout's own.

A reviewer should be able to check any Part One statement against Part Two without leaving this file.

---

# PART ONE — SYNTHESIS (orchestrator-authored)

## Tier definitions, and the rule that resolves an inconsistency found at review

**TIER 1** = peer-reviewed with independent replication, **or** a large-n probability-sample instrument
with published methodology · **TIER 2** = single survey or study, no independent replication · **TIER 3**
= commentary, punditry, trend reporting, convenience or opt-in sample, or a third-party aggregation.

**Unread-source convention:** a source never read primary gets **TIER 3 as sourced** regardless of what
it would rate if read, with the counterfactual stated separately. Batch 1's review found tier inflation
on unread sources to be its most common defect.

**RULE STATED AT REVIEW, resolving an inconsistency the reviewer identified.** Revision 1 called two
probability-panel instruments "TIER 1-eligible on methodology" (n = 2,019 and n = 6,204) while assigning
TIER 2 to a third, larger one (n = 5,837) on a replication criterion the definition's **second limb does
not require**. The rule now applied uniformly:

> A **large-n probability-sample** instrument with published methodology and a published margin of error
> is **TIER 1** under the second limb, regardless of replication status. An **opt-in or quota panel** is
> excluded from the second limb however large it is, and cannot exceed TIER 2 on sample size alone.

Consequences, applied consistently across this packet: the ASC/Cox instrument (Ipsos KnowledgePanel,
n = 2,019, ±2.4), the Pew instrument (American Trends Panel Wave 154, n = 6,204), and the Survey Center on
American Life "Romantic Recession" instrument (Ipsos KnowledgePanel, n = 5,837 / n = 5,244, ±1.4 / ±1.6)
are **all TIER 1** on their published methodology. The Wheatley/Qualtrics instrument (n = 2,969) and the
IFS/YouGov instrument (n = 3,000) are **TIER 2** — both are opt-in quota panels, and the IFS instrument
publishes no margin of error at all. This line — probability versus opt-in — is the substantive
distinction, and it now does the work that sample size was wrongly doing in revision 1.

## Cluster 1 — political alignment as a market-segmenting filter

This was a verification assignment against two figures on record, neither previously verified. **Both
were checked to primary and neither survived as recorded.** The evidence is scout S-D's, in Part Two.

**The corrections, in descending order of consequence.** Each is stated here and evidenced in S-D's
findings; nothing below restates a figure that is not in Part Two.

1. **The 36% is conservative *women*, not conservative men.** Conservative men are 36.98, which rounds
   to 37. The recorded pairing "60% of liberal young women versus 36% of conservative young men" appears
   in no source: the article's prose compares liberal women to liberal men and then groups conservatives
   together without splitting them by sex.
2. **The sponsor is IFS/YouGov alone,** not "AEI/IFS." AEI's contribution is a separate commentary.
3. **It is not a ranking question.** Ten qualities are each rated independently for importance.
4. **The "asymmetrically by sex" reading is undercut by the same table** — see the tension analysis below.
5. **Figure 2's instrument does not exist** as a single series, and two sources contradict the divergence
   reading it is used to support.

**PROVENANCE QUALIFICATION ON THE DECIMAL VALUES — carried forward exactly as the cold reviewer framed
it, neither re-derived nor softened.** The decisive two-decimal figures come from reading Plotly trace
objects in IFS's interactive chart appendix. That appendix is archived beside source 11 with its own
SHA-256 (`c1f9b66fafb71a87cf6f3c72b2ce7dc93969a744dc363101581334d872e60d7f`), but it is **not** one of the
six analyzed corpus sources and its values did **not** pass through the deterministic extraction chain
this run claims for source 11. The reviewer's ruling stands as written: **the direction of the correction
is adequately evidenced; the precision claimed for it is one grade below this run's own extraction
standard.** Values below are marked *Plotly-read* wherever they appear. What does not depend on the
appendix at all is the prose showing conservatives grouped and never split by sex, which independently
establishes that the recorded pairing exists in no source.

*Plotly-read*, per-row `Sex` and `Ideology` fields, item "Political views" rated "very important":

| Subgroup | Political views | Stable job | Political − job |
|---|---|---|---|
| Conservative men | 36.98 → 37% | 42.80 → 43% | −5.82 |
| Conservative women | 36.39 → 36% | 69.74 → 70% | **−33.35** |
| Liberal men | 46.93 → 47% | 38.75 → 39% | +8.18 |
| Liberal women | 60.26 → 60% | 54.50 → 55% | +5.76 |

**ARITHMETIC CORRECTED AT REVIEW:** revision 1 gave the conservative-women difference as −33.34.
36.39 − 69.74 = **−33.35**. The other three differences and all eight roundings were verified correct.

**A tension inside Cluster 1 that the orchestrator is responsible for, not the scout.** The
"asymmetrically by sex" claim behaves differently depending on which quantity is read, and revision 1
reported only the half that suited the correction:

- On the **political-minus-job** metric, the asymmetry *reverses* among liberals (men +8.18, women
  +5.76) and nearly vanishes among conservatives (0.59 points, men higher).
- On the **underlying level**, the sex gap among liberals is **13.33 points in women's favour**
  (60.26 versus 46.93) — pointing the other way, and omitted from revision 1.
- Main effects: ideology ≈ 16.9 points, sex ≈ 6.4 points.

**Honest reading:** ideology is the dominant axis, but sex asymmetry is **not absent** — it is
concentrated among liberals. And "conservatives rate it far below a stable job" holds for conservative
women (−33.35) and only modestly for conservative men (−5.82). Revision 1 overstated this.

**SUPERLATIVE WITHDRAWN AT REVIEW.** Revision 1 called the ASC/Cox instrument "the batch's strongest
instrument." That is contradicted by this packet's own numbers: Pew is n = 6,204 and the Romantic
Recession instrument is n = 5,837, both larger and both now TIER 1 under the rule above. No
strongest-instrument claim is made.

**"Gender gap" carries two incompatible definitions, and the discrepancy is NOT purely definitional —
corrected at review.** CAWP's single-candidate difference gives 11 points; CIRCLE's sum of the two
within-sex margins gives 31. Revision 1 called 31-against-11 "roughly double." It is a factor of
**2.8**. Within one dataset the sum-of-margins is about twice the single-candidate difference (≈15.5),
and **the remainder is attributable to the post-hoc reweighting of 12/13/24 that this packet's own
exit-poll methods source records as superseding election-night figures.** Revision 1 conflated definition
with data vintage. Both effects are real and they are different effects.

**The scope conclusion, which no correction disturbs:** on the evidence in Part Two, "operates as a
filter" is a **stated-preference finding wearing a revealed-behaviour verb.** Revealed-sorting work is
2016–2018, whole-population, and reports no sex asymmetry; no 2020s or Gen-Z-specific revealed-behaviour
instrument was located.

## Cluster 2 — AI companions as a substitute good

The evidence is scout S-E's, in Part Two, which carries the full citation, sampling design, question
wording, and URL for every figure below.

**Three findings, and one restoration.**

1. The primary instrument is an **opt-in Qualtrics quota panel** with no published margin of error →
   TIER 2 under the rule above, not TIER 1, whatever its size.
2. The headline figures are **lifetime-ever items** in the present perfect ("have chatted"), not current
   use. **SCOPED AT REVIEW:** revision 1 asserted the *instrument* contains no current-relationship item.
   The correct statement is narrower — the **published report presents** no such item, and the fielded
   questionnaire was never obtained, so the absence is established for the report's presented results
   rather than for the instrument.
3. The 21% preference figure has a **user denominator**, not a sample denominator.

**RESTORED AT REVIEW — the counterweight revision 1 omitted, and the more serious of its two defects.**
Revision 1 reported the "Secret Soulmates" 54% "replace" figure without its companion result. The same
report finds **68% of regular AI users in relationships said they used AI companions "with the belief
they enhanced their real-life relationships"** — and **the report itself calls the coexistence a
"paradox,"** respondents having not been forced into a single mutually-exclusive bucket. Reporting 54%
without 68% made revision 1 lean toward substitution harder than the source supports.

Full provenance, exactly as S-E recorded it in Part Two: **Wheatley Institute + Institute for Family
Studies, "Secret Soulmates" (2026; Willoughby, Carroll, Toscano, Hakala & Morris)**, n = 2,431 US adults
aged 18–30 currently in a committed relationship, **Qualtrics opt-in/quota panel**, URL
`https://wheatley.byu.edu/0000019e-1cfd-da4c-a5ff-befd20b10001/secret-soulmates-report`. S-E records it
under **"Verified to primary — full report PDF read in full."** **TIER 2** (opt-in panel). The 54% base
is AI-companion users within that partnered sample, not the 2,431.

**Why revision 1's handling of this was escalated, stated plainly rather than sanitised.** The cold
reviewer marked it `INTEGRITY: CONTEST` on the "unverifiable source presented as verified" condition —
explicitly **not** fabrication — because revision 1 reproduced a verbatim survey item and a percentage
with no author, year, URL, tier, or UNVERIFIED marker, and omitted the item from its own list of
unarchived sources. That was correct against revision 1 and incorrect against the source: the scout had
sourced it completely. This was an orchestrator transcription failure, and it is the reason this packet's
structure changed.

4. **Nothing measures displacement.** Every reachable source measures prevalence or self-reported
   belief. The 54%/68% pair is about substitution *within* an existing relationship, not withdrawal from
   the dating market by single men — which is the claim. Recorded as a structural gap.
5. The genuinely independent source has **better methodology and the wrong population** (probability
   panel, ±4.2, but teens 13–17). Its figures cannot be merged with the primary's, and S-E declined to
   merge them. **Independence is claimed only on the dimensions Part Two evidences** — different
   publisher, different data-collection firm, no shared authors; funders were not compared.

## Cluster 3 — friendship decline concentrating support onto partners

The evidence is scout S-F's, in Part Two. This cluster splits three ways and **does not resolve into a
confirmation or a refutation.**

- **(a)** is verified on a TIER 1 probability panel, with the recall window explicit.
- **(c)** — the causal step the claim rests on — is **uninstrumented**. No located source tests whether
  declining friend networks *cause* increased partner concentration over time. **SCOPED AT REVIEW:** every
  source in this cluster **whose design this packet verified** is cross-sectional; one source's design
  could not be confirmed because its full text was not reached.
- The prior integrity flag on the usual citation is **confirmed against archived text** — that report
  contains no concentration finding. **SCOPED AT REVIEW:** revision 1 said "no concentration or
  sole-channel finding at all," which is too absolute, because the same report supplies a "first person
  you'd turn to" item (married men 85%, married women 72%) that measures *primary-channel* reliance at a
  point in time. The correct statement: nothing in that report links friendship decline to increased
  partner reliance.

**The cross-scout tension this cluster turns on, and which the orchestrator does not adjudicate.** Two
TIER 1 probability panels disagree on differently-worded items: the ASC/Cox "first person you'd turn to"
item is sex-asymmetric (married men 85% versus married women 72%), while the Pew item finds men and women
"equally likely" to lean on a spouse or partner. The items are not identical and this packet takes no
position on which better measures partner reliance. **SCOPED AT REVIEW:** the Pew finding rebuts the
claim's **sex-asymmetry premise**, not its causal step — revision 1's header wrongly said it points
against "the mechanism," which no source tests at all.

## LAB MEASUREMENT — the six sources archived for this batch

Analyzer 2.6.1, analysis schema `le-lab.analysis/2.6`, scoring config `bt0a7p`, canon
`1.0.0+949aef381d5f`. **Every mapped-share figure is PROVISIONAL** — thresholds were authored by judgment
and never fitted to labelled data (`coverage.provisional = true`). These are document-coverage
measurements: not population statistics, not factual accuracy, not evidence any claim is true.

| # | Source | Grade | Words | Claim-like | Mapped | Share | Queue | Set aside |
|---|---|---|---|---|---|---|---|---|
| 11 | IFS / Wang, Gen Z partner priorities | A | 2,098 | 55 | 7 | 12.7% | 48 | 53 |
| 12 | NEP exit-poll methods statement | B | 592 | **0** | 0 | n/a | 0 | 66 |
| 13 | Wheatley "Counterfeit Connections" | B | 8,479 | 129 | 7 | 5.4% | 122 | 476 |
| 14 | Common Sense Media / NORC | B | 4,963 | 17 | 1 | 5.9% | 16 | 383 |
| 15 | ASC / Cox, American Friendship | A | 4,592 | 17 | 0 | 0% | 17 | 265 |
| 16 | Pew, emotional support (ch. 2) | A | 819 | 3 | 0 | 0% | 3 | 39 |
| | **Total** | | **21,543** | **221** | **15** | — | **206** | **1,282** |

**Source 12 returned zero claim-like segments**, so it has no mapped share. A one-page election-methods
statement contains no relationship-domain claims, so an empty claim surface is the domain gate behaving
correctly — the reading source 06 needed in batch 1. Archived for provenance (the exit-poll limits), not
for yield.

**High set-aside counts on sources 13, 14 and 15 are expected and disclosed:** no anchor truncation was
applied to the batch-2 PDFs, so endnotes, front matter and chart labels remain in the analyzed text.

## PROVENANCE

**Scope: the six archived sources only.** Every other source cited anywhere in this packet is **unarchived**
and carries no extraction chain and no hash. Part Two carries their locators; this packet claims no hash
provenance for any of them.

**Read status is NOT uniform across those sources, and this packet does not assert that it is.** An earlier
revision said every one of them "was read by a scout"; that was false for most of the list, and it is
withdrawn. Part Two records each source's own retrieval mode in the scout's own words, and it varies across
three tiers of access:

- **Read to primary, in full.** The Romantic Recession instrument (S-D reports it as "the best-methodology
  stated-preference instrument I reached", with verbatim findings and panel methodology) and "Secret
  Soulmates" (S-E records the full report PDF read in full).
- **Reached, but abstract or tool-summary only.** Sun & Schafer 2023 (abstract quoted verbatim; full body
  paywalled, ResearchGate 403), Dykstra & de Jong Gierveld 2004 (abstract quoted verbatim from PubMed; full
  body paywalled), Shin & Park 2023 (WebFetch summarization, not a raw parse — S-E's own caution).
- **Not reached at all; secondhand or search-snippet only.** The Gallup/HBR figure (S-E marks it
  **UNVERIFIED-TO-PRIMARY**, quoted from inside a secondary), McPherson et al. 2006 (S-F: figures came from
  search synthesis, "not from text I read myself"), and part of Cluster 1's revealed-sorting literature,
  where S-D records "FAILED TO REACH FULL TEXT", "did not fetch the article", and "did not fetch it" for
  three separate items.

**Under this packet's own tier convention, every source in the second and third groups is TIER 3 as
sourced**, whatever it would rate if read. The mitigation that bounds the damage: **no figure from any
unread source is carried into Part One.** The defect this correction repairs was a false read-status
assertion in the provenance layer, not propagated bad data.

- **Grade A** — archived HTML → committed `tools/extract-source-text.mjs` → SHA-256. Verifiable from the
  repository alone. Sources 11, 15, 16.
- **Grade B** — archived PDF → `pdftotext` 4.00 with recorded flags → SHA-256. Reproducible with the same
  tool version, but the extractor is an external binary rather than a hashed repository file, so it
  cannot be verified from the repository alone. Sources 12, 13, 14.
- **Neither grade** — the IFS chart appendix, archived and hashed but Plotly-read rather than
  deterministically extracted. See the qualification in Cluster 1.

No scout capture was archived as a corpus artifact; each source was independently re-fetched and
re-extracted, because a model-mediated transcription is not reproducible byte-for-byte.

Scout cross-check, 8-word shingle overlap against the deterministic extraction: 11 **70.5%**,
12 **64%**, 13 **88.6%**, 14 **78.6%**, 15 **90.9%**, 16 **40%**.

**Source 16's 40% was investigated and is a span difference, not a fidelity problem.** The scout's
capture merged the report landing page with this chapter; the archive is the chapter alone. The whole
fetched page holds only 1,626 words including navigation and footer chrome, so 819 words is the chapter's
actual prose, and the decisive sentence is present verbatim in the archive. Source 11's 70.5% reflects
the scout appending machine-read chart values absent from the article prose. Source 12's 64% reflects a
different PDF text extractor (scout used PyMuPDF; the archive uses pdftotext).

**Tool observation.** S-D reports that WebFetch **refused verbatim reproduction** of both the IFS and AEI
articles, forcing it to use a browser pane, and that the numeric appendix required reading Plotly trace
objects. Plain `curl` had no such difficulty with the same URLs — which is why the archived artifact is a
deterministic extraction, and is a further argument for the orchestrator-re-fetch rule.

---

# PART TWO — SCOUT FINDINGS, VERBATIM (scout-authored)

The three files below are embedded byte-for-byte, concatenated by script rather than retyped. Every
locator, URL, DOI, sample size, tier assignment, question wording, and recorded gap is the scout's own
work and has not been edited, summarised, or reordered. Where Part One restates any claim from these
files, it does so by citation rather than paraphrase.


## S-D — C8 political alignment as a market filter — embedded verbatim

> Source file: `S-D-findings.md` · SHA-256 `92354c14d6a056ff98b820548c304de2b0f548f68b56c7941100068ae9b6c44f`
> Concatenated by script, not retyped. Nothing below this line is orchestrator-authored.

<!-- BEGIN VERBATIM SCOUT BLOCK: S-D — C8 political alignment as a market filter -->
# S-D / cluster C8 — verification of two recorded figures

Claim under investigation: "Political alignment now operates as a first-class market-segmenting
filter among young daters, asymmetrically by sex." Timeframe: 2020s US.
Scout: Claude Opus 5, reasoning effort xhigh. Date of work: 2026-07-29.

Two figures were flagged as unverified in an earlier pass. Verdicts below.

---

## FIGURE 1 — **CORRECTED**

### What was recorded

> An AEI/IFS survey, roughly 3,000 respondents aged 18–29, in which about **60% of liberal
> young women** versus about **36% of conservative young men** rank political alignment
> **above job stability** in a partner.

### What the primary source actually is

- **Instrument:** the **Institute for Family Studies Gen-Z survey**, fielded by **YouGov**.
  IFS/YouGov, full stop. **AEI is not a sponsor of this survey.**
- **Field dates:** April 7–15, **2025**.
- **n = 3,000** — but note the design: **2,000 men and 1,000 women**, ages 18–29, US.
  A deliberate 2:1 male oversample. The recorded "roughly 3,000 aged 18–29" is right; the
  implied symmetry is not, and subgroup precision is *better for men than women*.
- **Design:** YouGov opt-in panel **matched** to a "modeled frame" built from ACS PUMS,
  public voter-file records, the 2020 CPS Voting & Registration supplement, the 2020 NEP exit
  poll and the 2020 CES; matched cases weighted by propensity score, decile-grouped,
  post-stratified. **Not a probability sample. No margin of error is published anywhere.**
  LGBT respondents included but not analyzed separately.
- **First publication of these numbers:** Wendy Wang, IFS blog, **February 6, 2026**.
  <https://ifstudies.org/blog/the-one-role-gen-z-women-still-want-men-to-play>
- **Where the "AEI" came from:** Samuel J. Abrams, "The Ideological Filter in Gen Z Dating,"
  **AEIdeas, March 17, 2026** — a *commentary on IFS's already-published data*, not a
  co-sponsored report. <https://www.aei.org/society-and-culture/the-ideological-filter-in-gen-z-dating/>
  Abrams' numbers are accurate; the transmission chain from Abrams into the LE record is where
  the error entered.

### What the instrument asked

A battery of **10 qualities in a "life partner"**, each rated independently, with the
reported statistic being the share saying that quality is **"very important."**
The instrument's own chart stem, byte-verbatim:

> "% of young adults ages 18 to 29 who say each quality is \"very important\""

The ten item labels as the instrument itself renders them: Confident; Earning potential;
Kind; Mentally & emotionally stable; Moral/religious beliefs; Physically attractive;
**Political views**; Sense of humor; Shares ideas about kids; Stable job.

**Structural correction — this is not a ranking question.** Respondents did not rank, and
were not made to trade off political alignment against job stability. Each of the ten items
was rated separately. "Ranks political alignment above job stability" is an **analyst's
comparison of two independent subgroup percentages**, not a respondent behavior. The recorded
phrasing ("60% … rank political alignment above job stability") misreads a share-saying-
very-important as a share-who-ranked-one-above-the-other. It is not that.

**Exact fielded question wording: not published.** I could not locate a questionnaire, topline,
or codebook for the IFS Gen-Z survey. The prose renders the item three different ways
("sharing political views", "shares similar political views", "finding someone who shares
similar political views") and the chart label is bare "Political views". Item label and
response option are verified; the verbatim stem as fielded is **UNVERIFIED**.

### The actual percentages

Read at full precision out of the report's own Plotly appendix
(<https://ifstudies.org/ifs-admin/resources/html_iframe/interactive_partyid_charts.html>),
"Political views" rated very important:

| Subgroup | % (unrounded) | as displayed |
|---|---|---|
| Conservative women | 36.392 | **36** |
| Conservative men | 36.979 | **37** |
| Liberal men | 46.927 | **47** |
| Liberal women | 60.259 | **60** |

Toplines: **39%** of young women and **33%** of young men overall.

### The correction, precisely

**The 36% is CONSERVATIVE WOMEN. Conservative men are 37%.** The recorded figure attached
conservative women's number to conservative men. Wang's prose states only "a much lower share
of conservative young men and women" without splitting them; Abrams' AEI piece splits them
correctly — "conservative young women (36 percent), liberal young men (47 percent), and
conservative young men (37 percent)" — so the garble happened downstream of both sources.

**The comparison the source actually makes is four-way and ideology-first**, not
liberal-women-vs-conservative-men. The source's own frame is: liberal women (60) vs liberal
men (47) vs conservative men (37) vs conservative women (36).

The task brief's suspicion that "liberal WOMEN versus conservative MEN" was garbled in
transmission is **confirmed**. That pairing appears in no source I reached.

### Two further findings the sources do not state, which bear directly on "asymmetrically by sex"

1. **Liberal men also rate political views above a stable job — by a larger gap than liberal
   women do.** Liberal men: political views 46.93 vs stable job 38.75 (**+8.2**). Liberal
   women: 60.26 vs 54.50 (**+5.8**). Neither IFS nor AEI notes this. The "ranks politics above
   economics" pattern is therefore an **ideological** pattern present in both sexes on the
   left, not a female-specific one. Liberal women lead in *level*; liberal men lead in *gap*.
2. **The sex asymmetry exists only on the left.** Within liberals the sex gap is 60 − 47 =
   **13 points**. Within conservatives it is 36.4 − 37.0 = **−0.6 points** — nil, and pointing
   the other way. So the claim's "asymmetrically by sex" is, in this instrument, better stated
   as *asymmetrically by sex among liberals only*.
3. **Political views ranks 6th of 10 even for liberal women** — below Kind (88), Shares ideas
   about kids (77), Sense of humor (69) and Mentally & emotionally stable (68). Abrams' framing
   that politics is "the first screen through which potential partners are evaluated" is his
   inference, not the ranking. IFS's own conclusion runs the other way: "most Gen Z men and
   women do not place a high value on political compatibility in a life partner."

### Tier

**TIER 2.** Single survey, no independent replication, non-probability matched panel,
no published MOE, no published questionnaire.

---

## FIGURE 2 — **UNVERIFIED** (as described; the named artifact does not exist)

### What was recorded

> A "Gen-Z exit-poll gender-gap series" — young men and young women have diverged politically
> in recent US elections.

### Verdict and why

**No such instrument exists.** There is no "Gen-Z exit-poll gender-gap series" published by
any pollster, academic centre or agency. I found no report, dataset or series under that or
any equivalent name. It is an **aggregation assembled by commentators** out of pieces from at
least four unrelated instruments, at least one of which is not an exit poll at all and at
least one of which measures ideology rather than vote. I label this UNVERIFIED rather than
CORRECTED because there is no primary report to reach and correct — but the underlying pieces
are enumerated below, and **two of them contradict the divergence reading.**

### The underlying sources, enumerated

**(a) Edison Research national exit poll for the National Election Pool (ABC/CBS/CNN/NBC),
November 5 2024.** Methods document reached and captured verbatim in `raw-02.txt`.
<https://s.abcnews.com/assets/dtci/elections/NEPExitPollMethodologyStatement.pdf>

18–29-by-sex figures, from the **reweighted** Edison data (reweighting dated 12/13/2024), as
reported by the **Center for American Women and Politics (CAWP), Rutgers**, Nov 19 2024
(last updated Dec 28 2024): <https://cawp.rutgers.edu/blog/gender-differences-2024-presidential-vote>

- young **women** 18–29: **61%** Harris, **38%** Trump
- young **men** 18–29: **48%** Harris; plurality Trump ("nearly half")
- **The decisive sentence, verbatim:** "the gender gap among this age group was 11 points in
  2024, smaller than the 15-point gender gap in 2020."

**That is the opposite of divergence.** On the exit poll — the instrument the recorded series
names — the youth gender gap **shrank** from 2020 to 2024. CAWP's own framing of the whole
2024 election is titled "The Historic Gender Gap That Wasn't."
<https://cawp.rutgers.edu/news-media/press-releases/historic-gender-gap-wasnt>

CAVEAT ON PROVENANCE: Edison does not publish its crosstabs or microdata. CAWP is an academic
analyst of them, not the pollster. These 61/38/48 figures are therefore reached **secondhand**,
albeit from a credible academic centre that names its source and dates its reweighting.
Election-night (pre-reweighting) figures for the same crossbreak circulated widely and differ
(e.g. men 18–29 Trump 49 / Harris 47). **I did not reach a primary for those and they should
not be used.**

**(b) AP VoteCast (AP-NORC), 2024 — NOT an exit poll.** Methodology reached at primary:
<https://apnorc.org/wp-content/uploads/2025/03/Methodology_2024-FINAL.pdf>

- Conducted by NORC at the University of Chicago for **Fox News, PBS NewsHour, The Wall Street
  Journal and The Associated Press**; funded by AP.
- **n = 139,938 registered voters**, **October 28 – November 5, 2024**. 4,767 by phone,
  135,171 by web.
- Mixed design: probability sample from state voter files (Catalist) + NORC's probability-based
  AmeriSpeak panel + **nonprobability** panels (Dynata, Cint, Prodege, RepData).
- **MOE ±0.4 pp for voters (n=121,059)** and ±1.2 pp for nonvoters (n=18,879), including the
  design effect. Weighted response rate for the voter-file probability sample: **3.1%**.
- Its own caveat, verbatim: "Although there is no statistically agreed upon approach for
  calculating the margin of sampling error for nonprobability samples…"

Youth-by-sex figures come from **CIRCLE (Tufts)** analysing AP VoteCast microdata — AP-NORC's
own published 2024 summary/assessment report contains **no** 18-29-by-sex crossbreak (checked).
<https://circle.tufts.edu/2024-election>

- youth 18–29 overall: Harris **51** / Trump **47** (+4); 2020 Biden +25; 2016 Clinton +18
- young **women**: Harris **58** / Trump **41** (**+17** Harris)
- young **men**: Trump **56** / Harris **42** (**+14** Trump)
- CIRCLE's characterisation, verbatim: "an extraordinary **31-point gap** in youth vote choice
  by gender, with young women favoring Harris by 17 percentage points, and young men favoring
  Trump by 14 points."
- young white men Trump **+28** (63% Trump); young white women **49/49**; young Latino men
  Trump 49 / Harris 47 ("well within the margin of error," per CIRCLE)
- 2020 baselines: young white men Biden +6; young white women Biden +15; young Latino men Biden +40
- turnout: 2024 **50%** young women vs **41%** young men (9-pt gap); 2020 55% vs 44% (11-pt gap)
  — from CIRCLE's voter-file (Catalist) turnout estimate, 40 states,
  <https://circle.tufts.edu/latest-research/new-data-nearly-half-youth-voted-2024>

INTERNAL INCONSISTENCY ON CIRCLE'S OWN PAGE, flagged: the youth topline is given as
"+4 for Harris: 51% to 47%" in most sections but as "by 6 points: 52% to 46%" in the
state-by-state section. Do not treat either as settled without going to the microdata.

**(c) THE METRIC PROBLEM — the most important finding in Figure 2.**
CAWP says the 2024 youth gender gap was **11 points**. CIRCLE says **31 points**. Both are
correct within their own definitions, and the numbers are **not commensurable**:

- **CAWP:** gender gap = (% of women voting for candidate X) − (% of men voting for candidate X).
  One candidate. This is the definition behind the entire 1980–2024 historical series.
- **CIRCLE:** sums the two **within-sex margins** (women's Harris margin +17 **plus** men's
  Trump margin +14 = 31).

Quoting "31 points" next to the historical series (4–12 points since 1980) compares a summed
double-margin against a single-candidate difference. It roughly doubles the apparent gap. Any
"series" that mixes CIRCLE-style and CAWP-style numbers manufactures a trend out of a
definitional switch. **This is the single most likely way the recorded claim goes wrong.**

**(d) The one real multi-election series — and it is not Gen Z.** CAWP's fact sheet
"THE GENDER GAP: Voting Choices In Presidential Elections," whole electorate:
<https://cawp.rutgers.edu/sites/default/files/resources/ggpresvote.pdf> (fact sheet is the
01/2017 edition, running 1980–2016; 2020 and 2024 come from the CAWP posts above).

Gender gap by year: 1980 **8**; 1984 **6**; 1988 **7**; 1992 **4**; 1996 **11**; 2000 **10**;
2004 **7**; 2008 **7**; 2012 **10**; 2016 **11**; 2020 **12** (57% women / 45% men for Biden);
2024 **10** (55% men / 45% women for Trump). Sources per year: CBS News/NYT (1980–88),
Voter News Service (1992–2000), Edison Media Research & Mitofsky (2004–08), Edison Research
(2012–). **No trend of widening.** 2024 is mid-range and *below* 2020.
CAUTION: the fact sheet's prose says "42 percent of women" voted Trump in 2016 while its own
table says **41%**; CAWP's press release says 41%. Use 41; the 42 is an internal error.

**(e) The likely actual origin of the "series" framing — and it is not an exit poll.**
John Burn-Murdoch, "A new global gender divide is emerging," **Financial Times, Jan 26 2024**.
Uses **Gallup self-reported ideology**, not exit polls and not vote choice. Restated claim:
US women aged 18–30 are now ~**30 points** more liberal than male contemporaries, a gap that
opened in ~6 years; Germany ~30, UK ~25. **I did not reach the FT article** (paywalled);
reached only secondhand restatements. **TIER 3** as an aggregation.

**A direct replication attempt on a much larger instrument fails to find the divergence.**
James Hawkins, Berkeley Initiative for Young Americans, **Feb 13 2024**, using the
**Cooperative Election Study** (CES; >50,000 respondents in even years), 2006–2022:
<https://youngamericans.berkeley.edu/2024/02/are-the-ideologies-of-young-women-and-young-men-in-the-us-diverging/>

> "Figure 1 does not seem to support the case for a diverging ideological divide between young
> men and young women in the U.S."

> "The naive measure in Figure 2 makes apparent that there is seemingly no trend in the gap
> over time using the even years of the CES. A simple line of best fit … shows that the average
> size of the ideology gap between women and men is essentially flat over time. At its height in
> 2010, the gap stood at close to 10 percentage points, but has since fallen, and stood at about
> 7 percentage points as of 2022."

### Exit-poll limitations, stated from the instrument's own methods document

All of the following are from `raw-02.txt`, i.e. the NEP's own statement, unless marked:

1. **Thin site coverage.** 279 Election Day polling places nationally; only **27** early
   in-person locations, in only **four states** (GA, NV, NC, OH).
2. **Absentee/early voters are not exit-polled at all.** They are covered by a separate
   Registration-Based-Sample multi-mode poll (landline, cell, SMS, email/web) fielded
   **October 24 – November 2** — i.e. *before* Election Day — "among respondents who said they
   either have or will definitely be voting." An **intent** measure is blended into a statistic
   presented as being about people who voted.
3. **No single national margin of error is published.** Error is published only as a table of
   typical sampling error by subgroup base size. **The base n for an 18-29-by-sex crossbreak is
   not published**, so no MOE for the young-men/young-women figures can be honestly stated.
   For a 50% statistic the table's own values run from ±15 (base 100) down to ±2 (base 5251+) —
   a range wide enough to swallow an 11-point gap at small bases.
4. **The statement's own caveat:** "Other nonsampling factors, including nonresponse, are likely
   to increase the total error."
5. **Crossbreaks are reweighted after the fact.** CAWP's post carries "LAST UPDATED: December 28,
   2024 (reflects 12/13/24 updated weighting of Edison exit poll)". Election-night numbers are
   superseded. A "series" assembled from election-night screenshots is built on retracted values.
6. **Instrument-level disagreement on the same election.** CAWP: Edison gives a 10-point overall
   gender gap (55% men / 45% women for Trump); AP VoteCast gives 9 points (55% men / 46% women).
   Different instruments, same election, different answers — before any subgroup slicing.
7. *Unverified pointer:* a National Congress of American Indians joint statement criticises the
   2024 NEP subgroup coverage (229 Native respondents; none of the surveyed polling places on
   tribal lands). I saw this only in a search snippet and **did not fetch it**. Treat as a lead,
   not a finding.

### Tier

The **Edison/NEP exit poll**: TIER 2 — single instrument per election, stratified probability
design for the in-person component but no published national MOE, no public microdata, and
post-hoc reweighting to the certified count.
**AP VoteCast**: TIER 2, arguably strongest of the set on published methodology and n, but a
hybrid probability/nonprobability design with a 3.1% response rate on the probability arm.
**CES**: TIER 1-adjacent — large academic consortium instrument with published methodology, and
the only source here that supports a *replication* claim.
The **"Gen-Z exit-poll gender-gap series"** as recorded: **TIER 3**, an aggregation assembled by
third parties out of incommensurable metrics.

---

## Stated preference vs. revealed sorting

These are different claims. Keep them apart. The honest summary: **stated preference is well
instrumented and is sex-asymmetric; revealed sorting is instrumented only for older,
whole-population data and is not established as sex-asymmetric, nor as a 2020s Gen-Z
phenomenon.** Nothing I reached lets the second claim rest on the first.

### STATED PREFERENCE — multiple instruments, converging, asymmetric by sex

- **IFS/YouGov Gen-Z 2025** (Figure 1 above). 39% of young women / 33% of young men say
  political views "very important"; liberal women 60, liberal men 47, conservative men 37,
  conservative women 36. Population: all 18–29-year-olds regardless of marital status.
  TIER 2.
- **AEI Survey Center on American Life — "Romantic Recession: How Politics, Pessimism, and
  Anxiety Shape American Courtship."** Daniel A. Cox & Kelsey Eyre Hammond, **January 29, 2025**.
  <https://www.americansurveycenter.org/research/the-state-of-american-romance-how-politics-and-pessimism-influence-dating-experiences/>
  **This is the best-methodology stated-preference instrument I reached** and it is genuinely
  AEI's own: **Ipsos KnowledgePanel**, a probability-based, address-based-sampling panel
  (USPS Delivery Sequence File; offline households provided a tablet and connection).
  Two waves: **n = 5,837** adults 18+, **Aug 16–26 2024**, MOE **±1.4 pp**, design effect 1.1786;
  and **n = 5,244** adults 18+, **Dec 12–19 2024**, MOE **±1.6 pp**, design effect 1.48.
  Findings, verbatim:
  > "More than half (52 percent) of single women say they would be somewhat less likely or a lot
  > less likely to date a Trump supporter. Only 36 percent of single men say they would be less
  > inclined to date someone who supports Trump, while nearly half (47 percent) report that it
  > would make no difference to them."

  > "Nearly three-quarters (73 percent) of college-educated single women would be less likely to
  > date a Trump supporter, including 52 percent who say they would be a lot less likely to."

  > "Nine in 10 single women who voted for Harris say they would be less likely to date someone
  > who favors Trump. Nearly three in four (74 percent) single women who voted for Harris say
  > they would be a lot less inclined to date a Trump supporter."

  **Three cautions.** (i) Population is **all single adults 18+**, NOT 18–29 — this is not a
  Gen Z figure and must not be reported as one. (ii) The item is **support for a specific named
  person (Trump)**, not generic "political alignment"; a person-anchored item is not
  interchangeable with an ideology-alignment item. (iii) **The 36 here is single MEN's
  reluctance-to-date-a-Trump-supporter and is numerically identical to Figure 1's 36 for
  conservative women.** Different survey, different item, different population, coincidental
  collision. High garbling risk. TIER 2, arguably TIER 1 on design (probability panel,
  published methodology, published MOE) but single-wave and unreplicated.
- **UNVERIFIED figure:** Lyman Stone & Brad Wilcox, "Now Political Polarization Comes For
  Marriage Prospects," IFS, **June 19, 2023**
  (<https://ifstudies.org/blog/now-political-polarization-comes-for-marriage-prospects>) state
  that the Survey Center on American Life "recently found that about **two-thirds** of liberal
  and conservative singles would be more likely to 'swipe left' and reject a potential match who
  did not share their politics." **I did not locate the underlying Survey Center report or item
  for that two-thirds figure.** Do not use it. Note also that despite the "swipe left" framing it
  is a **stated** preference, not observed swiping.
- Same IFS piece, GSS-based, for the sex-divergence backdrop: pooled 5-year intervals of
  **General Social Survey** singles aged 18–30; "About 10 percent of such men were conservative
  in the early 1980s, but that share has now risen to about 15 percent (while the proportion of
  single liberal young men has held steady at about 18 percent in recent years)." The article
  truncates and continues at The Atlantic; **I did not reach the Atlantic continuation**, so the
  corresponding women's figures are unreached. TIER 2/3 as published.

### REVEALED SORTING — behavioral, and all of it predates the claim's timeframe

- **Huber & Malhotra, "Political Homophily in Social Relationships: Evidence from Online Dating
  Behavior," *The Journal of Politics* 79(1), 2017** (online Dec 14 2016), DOI 10.1086/687533.
  Two studies: a nationwide randomized-dating-profile experiment **and** behavioral data from a
  national online dating community. Reported finding: people evaluate politically similar
  profiles more favorably and are more likely to reach out to them; effect **comparable to
  educational homophily and about half as large as racial homophily**.
  **This is genuine revealed behavior** — and it is the strongest such evidence I located.
  But: pre-2020s data, not Gen-Z-specific, and **no sex asymmetry reported in anything I reached**.
  I reached only the abstract/summary via Yale ISPS
  (<https://isps.yale.edu/research/publications/isps16-22>); the **full text is paywalled at
  U Chicago Press** and I did not obtain sample sizes or magnitudes. Peer-reviewed
  (TIER 1-eligible), but the specific magnitudes are **UNVERIFIED to full text**.
- **Iyengar, Konitzer & Tedin, "The Home as a Political Fortress: Family Agreement in an Era of
  Polarization," *The Journal of Politics* 80(4), 2018, 1326–38**, DOI 10.1086/698929.
  Design per secondary summary: 2015 original surveys of spouses and offspring **plus the 2014
  and 2016 TargetSmart national voter files**, benchmarked against the 1965 Youth-Parent
  Political Socialization Panel. Reported finding: **spousal political homogeneity rose from
  ~72–73% to ~82%**, attributed principally to **mate selection**; voter-file N described as
  ~20 million spouses.
  **FAILED TO REACH FULL TEXT.** The Stanford PCL open PDF
  (`pcl.sites.stanford.edu/.../iyengar-home-political-fortress.pdf`) returned **HTTP 403** to
  WebFetch and triggered a **file-download dialog** rather than rendering in the browser pane;
  U Chicago Press is paywalled. **The 72/73→82 figures and the ~20M N are reached only via a
  search-engine summary and are UNVERIFIED.** This is the highest-value unreached artifact in
  the whole assignment — it is the closest thing to a *trend* in revealed political sorting.
- **Hersh & Ghitza, "Mixed partisan households and electoral participation in the United
  States," *PLOS ONE*, October 2018**, DOI 10.1371/journal.pone.0203997 (**open access**).
  ~18 million households from a national voter-registration database; reported finding: about
  **three in ten married couples have mismatched party affiliations** (≈70% same-party).
  **UNVERIFIED figure** — I confirmed the article's existence, venue and open-access status but
  **did not fetch the article**. Note this is a *level*, not a trend, and a level of ~70%
  same-party is compatible with strong non-political sorting (geography, education, religion,
  race) rather than a political filter.
- **What does not exist in anything I reached:** any **2020s**, **Gen-Z-specific**,
  **revealed-behavior** instrument showing political alignment operating as a market-segmenting
  filter for young daters. No 2020s dating-app platform data. No marriage-record or voter-file
  sorting series broken out for the 18–29 cohort in the 2020s. The revealed-sorting literature I
  could locate is **2016–2018 vintage, whole-population**, reports high homogamy **without**
  establishing that it is rising among the young or that it is sex-asymmetric.
- **Counter-pointer, unverified:** Abrams (AEI) writes that "Other research from IFS finds that
  politically mixed couples — one Democrat and one Republican — report marital satisfaction
  roughly comparable to Democrat-Independent couples." I did not chase this to source. If the
  filter is functioning as a *quality* screen rather than an identity screen, this would matter;
  treat as a lead.

### Net answer to the secondary question

The claim's *stated-preference* half is supportable and is sex-asymmetric — with the correction
that in the IFS instrument the asymmetry runs only through liberals, and with the caveat that
the strongest asymmetric figure (52 vs 36) is from a different survey, on a Trump-support item,
among single adults of all ages. The claim's *revealed-sorting* half is **not instrumented for
the 2020s at all** in anything I reached. "Operates as a filter" is currently a stated-preference
finding wearing a revealed-behavior verb.

---

## Note for the maintainer on concept collisions (prose only; no feedback file created)

Four homonym traps in this cluster that an analyzer working on this material will trip over:

1. **"Gender gap" has two incompatible operationalizations.** CAWP: single-candidate difference
   between women's and men's support. CIRCLE: sum of the two within-sex margins. Same 2024
   reality, **11 points vs 31 points**. Correlating a "31-point gender gap" token with the
   1980–2024 CAWP series (4–12 points) is a category error, not a magnitude disagreement.
2. **"AEI/IFS" is not one organization and they run different instruments.** IFS/YouGov Gen-Z
   survey (n=3,000, 18–29, opt-in matched panel) vs AEI Survey Center on American Life /
   Ipsos KnowledgePanel (n=5,837 and n=5,244, 18+, probability panel). Different populations,
   different items, different sponsors. Treating "AEI/IFS" as a single source is exactly how
   Figure 1's subgroup label got swapped.
3. **Three different populations get called "women"** across these three surveys: *liberal women
   18–29* (IFS), *young women 18–29* (IFS topline / CIRCLE / CAWP), and *single women 18+*
   (AEI/Ipsos). Their numbers are 60, 39/58/61, and 52 respectively. None substitutes for another.
4. **"Political alignment" and "supports Trump" are different items.** One is an
   ideology-similarity rating; the other is a named-person screen. They produce different
   magnitudes and are not interchangeable operationalizations of "political filter."

Also: two of the primary documents in this cluster contain **internal numeric inconsistencies**
(CIRCLE's 51/47 vs 52/46 youth topline; CAWP's fact sheet prose 42% vs table 41% for 2016). Any
pipeline that ingests both statements from the same page will see a contradiction that is real.

---

## CONFIDENCE NOTES

### Verified to primary (I reached the publishing organization's own artifact and read the number there)

- **Figure 1's four subgroup percentages, at full precision**, read out of IFS's own Plotly
  appendix on ifstudies.org: conservative women 36.392, conservative men 36.979, liberal men
  46.927, liberal women 60.259. Also all four groups' complete 10-item rankings. This is the
  decisive evidence for the correction and it is first-party.
- **Figure 1's sponsor, field dates, n, sex split, panel design and weighting** — from IFS's own
  "About the survey" block, verbatim in `raw-01.txt`.
- **Figure 1's item labels, response option ("very important") and chart stem** — first-party.
- **Figure 1's toplines** (39% young women / 33% young men) — first-party prose.
- **The NEP/Edison exit poll's full design and its error table** — the NEP's own methods
  statement, `raw-02.txt`, extracted from the PDF.
- **AP VoteCast's conductor, clients, funder, n (139,938), field dates, mode split, sample
  architecture, MOE (±0.4 pp voters / ±1.2 pp nonvoters) and 3.1% probability-arm response
  rate** — AP-NORC's own methodology PDF.
- **AEI Survey Center on American Life's two wave n's, field dates, MOEs and design effects,
  and the 52%/36%/47%, 73%/52%, 90%/74% figures** — the report's own page.
- **CIRCLE's youth vote-choice figures and its "31-point gap" characterization** — CIRCLE's own
  page (CIRCLE is the analyst of AP VoteCast, not the pollster; see next section).
- **CAWP's 61/38/48 youth figures, the "11 points in 2024, smaller than the 15-point gender gap
  in 2020" sentence, the 1980–2016 series table and the 2020/2024 toplines** — CAWP's own pages
  and fact-sheet PDF (CAWP is likewise the analyst of Edison, not the pollster).
- **The Berkeley/CES replication failure** — BIFYA's own page, quoted above.
- **The existence and venue of Huber & Malhotra (2017)** — Yale ISPS listing.

### Reached only secondhand (credible analyst, but not the pollster's own crosstab)

- **All 2024 youth-by-sex vote figures, from both instruments.** Neither Edison nor AP-NORC
  publishes an 18-29-by-sex crossbreak in a first-party document I could reach. CAWP and CIRCLE
  are the analysts. They name their source and date their data, which is as good as this gets
  without microdata access — but it is not the pollster's own published table.
- **Conservative men = 37% / conservative women = 36% as *prose*.** Wang's IFS text does not
  split them; Abrams' AEI commentary does. I resolved this to first-party by reading IFS's own
  chart data rather than relying on Abrams — so the *number* is primary even though the
  *prose split* was first seen in commentary.
- **The FT / Burn-Murdoch "30 points more liberal" claim** — paywalled; reached only via
  restatements. Do not quote the 30 as verified.
- **Iyengar, Konitzer & Tedin's 72/73→82% spousal homogeneity and ~20M voter-file N** — search
  summary only.
- **Hersh & Ghitza's "three in ten married couples mismatched"** — search summary only.
- **Huber & Malhotra's effect magnitudes** ("comparable to educational homophily, half as large
  as racial homophily") — ISPS/abstract-level summary, not full text.

### Failed to reach — named barriers

- **The IFS Gen-Z survey questionnaire / topline / codebook.** Not published anywhere I could
  find. Consequence: the **exact fielded wording of the political-views item is UNVERIFIED.**
  Only the item label, the response option and the chart stem are verified. If exact wording
  matters to the LE claim, this must be requested from IFS directly.
- **Iyengar, Konitzer & Tedin (2018) full text.** Stanford PCL's open PDF returns **HTTP 403**
  to WebFetch and triggers a download dialog instead of rendering in the browser pane; U Chicago
  Press paywalled. Highest-value unreached artifact — it is the only candidate *trend* in
  revealed political sorting.
- **Edison Research's own 2024 crosstabs / microdata.** Not public. Only network interactives and
  academic re-analyses exist.
- **AP-NORC's own 18-29-by-sex crossbreak.** Searched the 2024 summary/assessment report; the
  document covers methodology and assessment, not that crossbreak.
- **Financial Times, Burn-Murdoch, Jan 26 2024.** Paywalled.
- **The Atlantic continuation of the Stone/Wilcox GSS piece.** The IFS page truncates with
  "Continue reading at The Atlantic"; not pursued.
- **The Survey Center on American Life item behind the "two-thirds would swipe left" figure.**
  Not located.
- **The NCAI critique of NEP subgroup coverage.** Search snippet only; not fetched.
- **Any 2020s revealed-behavior dating-app or marriage-market dataset broken out for 18–29.**
  Searched; none found. I am reporting absence, not failure to look — but absence of evidence
  from a scout's search is weaker than a systematic literature search, and this specific gap
  is where the LE claim is most exposed.

### Tool-level note affecting reproducibility

**WebFetch refused verbatim reproduction** of both the IFS and AEI articles, returning only
paraphrases with an explicit refusal. All verbatim capture in this cluster was obtained through
the Browser pane's `get_page_text`, and the IFS numeric appendix required reading Plotly trace
objects via `javascript_tool`. WebFetch also returns PDFs as unreadable binary; those were
extracted with PyMuPDF from the copies WebFetch saved to disk. Any future scout repeating this
work should skip WebFetch for verbatim needs.

<!-- END VERBATIM SCOUT BLOCK: S-D — C8 political alignment as a market filter -->

## S-E — C2 AI companions as a substitute good — embedded verbatim

> Source file: `S-E-findings.md` · SHA-256 `5478612e137d65e29bb54773cd73a38d7aefe0703422608645f0645c72264f90`
> Concatenated by script, not retyped. Nothing below this line is orchestrator-authored.

<!-- BEGIN VERBATIM SCOUT BLOCK: S-E — C2 AI companions as a substitute good -->
# Scout S-E — Research cluster C2: "AI companions as substitute good for market-exiting young men"

Claim under investigation: "AI companions function as a substitute good for the demographic modeled as market-exiting." Actor: predominantly young men. Mechanism: substitution. Qualifier: interpretation, not finding.

## (a) Prevalence findings

### Primary target — Wheatley Institute/BYU, "Counterfeit Connections" (Feb 2025) [raw-01.txt]

- **Institution:** Wheatley Institute at Brigham Young University (report authored by Brian J. Willoughby, Jason S. Carroll, Carson R. Dover, Rebekah H. Hakala).
- **Publication date:** February 12-13, 2025 (Wheatley site posting Feb 12; PR Newswire distribution Feb 13, 2025, 10:13 ET).
- **Sample:** 2,969 U.S. adults ages 18+, with an oversample of 1,000 young adults ages 18-29 layered on an initial target of 2,000. Final analytic sample: 49% male / 51% female; mean age 40 (SD=19); 40% not currently in a relationship, 24% dating, 36% engaged/married.
- **Sampling method: NOT a probability sample.** Recruited from Qualtrics's existing opt-in online panels, screened via a **quota** framework (matched to national demographics on sex, age, race/ethnicity) — this is a convenience/opt-in panel with demographic quotas, not a probability-based sample. No margin-of-error or response-rate figures are reported anywhere in the document, which is itself a marker of non-probability survey research.
- **Exact question wording** (this matters — the three constructs the assignment flagged as routinely conflated are in fact three separate items in this survey):
  - Lifetime "have you ever" item (this is the one behind the headline 19%/31%/23% figures): *"Have you ever chatted online with an AI system or downloaded an AI chat app that was meant to simulate a romantic partner?"*
  - A parallel lifetime item for AI social-media image accounts: *"Have you ever intentionally sought out an AI account on a social media platform that generates artificial images of men or women?"*
  - A parallel lifetime item for AI pornography: *"Have you ever viewed pornographic images or videos that were completely AI generated?"*
  - A separate **preference/attitude** item, distinct from the use item: *"I would rather communicate with an AI based relationship program than engage with a real person in a romantic relationship"* (agreement rate 21% among those who chatted with AI to simulate a partner).
  - There is **no "are you currently in a relationship with an AI"/"is this your primary relationship" item** in this survey, and no "would you consider" hypothetical item — the headline figures are strictly lifetime-experience prevalence ("have you ever chatted"), not current-use, not relationship-status, and not hypothetical willingness.
- **Exact reported percentages** (verbatim, see raw-01.txt for full context):
  - Overall: "almost 1 in 5 of adults in the United States (19%)" have ever chatted with an AI system meant to simulate a romantic partner.
  - By sex/age: young adult men 31%, young adult women 23%, adult men (30+) 15%, adult women (30+) 10%.
  - AI social media image accounts (regular/habitual following): young adult men 24%, young adult women 18%, older adult men 10%, older adult women 9%.
  - AI pornography viewing: young adult men 27%, young adult women 12%, adult men 12%, adult women 4%.
  - Preference for AI communication over a real person, among those who chatted with AI: 21% overall; young adult men 29%, adult men 21%, young adult women 17%, adult women 20%.
  - "16% of young adults agreed that AI companion apps are a good alternative to real partners if real partners are not available."

### Independent source — Common Sense Media / NORC, "Talk, Trust, and Trade-Offs" (July 2025) [raw-02.txt]

- **Institution:** Common Sense Media (publisher); data collection by **NORC at the University of Chicago**. Independent of Wheatley/BYU/IFS in publisher, funder, data-collection firm, and sample design.
- **Sample:** 1,060 U.S. **teens ages 13-17** (probability component n=719 from NORC's AmeriSpeak Teen Omnibus; nonprobability supplement n=341 from Prodege, combined via NORC's "TrueNorth" calibration). Published margin of sampling error: ±4.2 percentage points at 95% CI. Fielded April 30-May 14, 2025.
- **This is a stronger-methodology instrument than the primary target** (genuine probability panel base, published MOE, published response/retention rates: final-stage completion 50.5%, weighted household panel response rate 26.1%, cumulative response rate 10.3%), but it samples an **entirely different population — minors, not the 18-30 "market-exiting" young-adult demographic the claim concerns.** Do not merge these figures with the primary target's adult figures.
- **Key prevalence figures:** 72% of teens have used an AI companion at least once; 52% are "regular users" (a few times a month or more); 13% are daily users; 28% have never used one. 33% of teens use AI companions for "social interaction and relationships" (a composite category), within which only 8% specifically selected "romantic or flirtatious interactions" as a use case (multi-select item, base = all respondents).

### Not independently reachable in full, cited only secondhand

- **Gallup / Walton Family Foundation / Harvard Business Review** (Lira, Folk, Ungar, & Duckworth, "How Gen Z Uses Gen AI — and Why It Worries Them," HBR, Jan 28, 2026): survey of "nearly 2,500" U.S. 18-28-year-olds fielded by Gallup in partnership with the Walton Family Foundation, reportedly October 2025. This would be a genuinely independent, probability-panel-based source (Gallup's panel methodology, confirmed separately via news.gallup.com, uses address-based sampling / RDD recruitment — a real probability design, unlike the Wheatley Qualtrics panel). **I could not retrieve the HBR article's full text** — hbr.org is paywalled beyond a preview, and web.archive.org is blocked in this environment. The one figure I can verify is **quoted, not primary**: it appears verbatim inside the Wheatley Institute's own 2026 "Secret Soulmates" follow-up report (see below), which states: *"a recent Gallup survey done for the Walton Family Foundation and the Harvard Business Review... found that 1 in 10 (10%) of 18- to 28-year-olds interact with AI girlfriends or boyfriends at least once a month."* This is a **secondhand quotation of a rival institution's figure by Wheatley itself**, not something I read from Gallup/HBR directly. Treat this 10%/monthly-use figure as UNVERIFIED-TO-PRIMARY. It is nonetheless useful circumstantially: it is in the same rough range as Wheatley's own numbers despite coming from a different institution and a materially different (and stronger) sampling method, which is modest cross-source corroboration on prevalence even though I could not verify it firsthand.

### Read in full but NOT used as raw-02 (not independent — same institution as primary target)

- **Wheatley Institute + Institute for Family Studies, "Secret Soulmates"** (2026; Willoughby, Carroll, Toscano, Hakala, & Morris). I retrieved and read this report's full text (PDF) while chasing the Gallup citation above. It is a **follow-up study by the same lead authors/institution** as the primary target, so it does not count as an independent second source, but it contains directly relevant data I am reporting here for completeness:
  - Sample: 2,431 U.S. adults ages 18-30 who are **currently in a committed relationship** (dating/engaged/married) — again a Qualtrics opt-in/quota panel, not probability-based.
  - 15% of partnered young adults "often" chat with an AI romantic companion; another 34% "had at least experimented."
  - Contains the closest thing to a direct **self-reported substitution item** found anywhere in this cluster: respondents were asked to rate agreement with *"I use romantic AI companion(s) to replace human relationships"* — **54%** of AI-companion users in relationships agreed. (Exact question stem for the "replace" frequency item, per the methods section: users were asked how often AI companions "replace specific human relationships" on a Never/Rarely/Sometimes/Often scale; among men, only 21.5% said "never," while 38.9% said "sometimes" and 21.3% said "often.")
  - However — **this item is not about the claim's population.** It measures whether AI use "replaces" specific relationships among people who are ALREADY in a real-life relationship, not whether AI use displaces partner-seeking among single people who have withdrawn from the dating market ("market-exiting" men). It is a subjective self-report of a belief, not a behavioral measurement.
  - Not used as a capture.json entry because (1) it is not independent of the primary target and (2) it is not the Feb-2025 primary report itself. URL: https://wheatley.byu.edu/0000019e-1cfd-da4c-a5ff-befd20b10001/secret-soulmates-report

## (b) Substitution versus complementarity

No source in this cluster measures substitution in the sense the claim requires (AI companion use **displacing** human partner-seeking among people who have exited or are exiting the dating market). What exists instead:

1. **Preference/attitude items (primary target, Counterfeit Connections):** 21% of AI-chat users said they'd "rather communicate with an AI based relationship program than engage with a real person in a romantic relationship"; 16% of young adults agreed AI companion apps are "a good alternative to real partners if real partners are not available." These are **stated preferences/hypothetical attitudes**, not measured behavior. They speak to what people say they'd rather do, not to whether AI use is actually keeping them out of the dating market versus simply running alongside continued dating effort.

2. **Self-reported "replacement" belief (Secret Soulmates, non-independent follow-up, partnered-only population):** 54% of AI-companion users who are already in a real-life relationship agreed they use AI companions "to replace human relationships." This is the single most direct substitution-flavored self-report found in the whole cluster — but it is about substituting for an *existing partner's* emotional/conversational role, not about substituting for the *pursuit* of a partner among single, market-exiting men. Mechanistically it is closer to "emotional infidelity/displacement within a relationship" than to "AI as a dating-market exit ramp."

3. **Complementarity-leaning evidence (Secret Soulmates):** 68% of regular AI users in relationships said they used AI companions "with the belief they enhanced their real-life relationships" (an enhance/complement framing), sitting alongside the 54% "replace" figure — respondents were not forced into a single mutually exclusive substitution-vs-complementarity bucket, and both beliefs coexist in the same population, which the report itself calls a "paradox."

4. **Cross-sectional correlational data, causal direction explicitly disclaimed by the authors (both Wheatley reports):** Both reports find AI companion use correlates with worse outcomes for real relationships/well-being (higher depression/loneliness risk in the primary target; lower relationship stability/communication quality in Secret Soulmates) but **both reports explicitly state the data cannot establish causal direction.** Verbatim from the primary target: *"It is unclear at this point if this link exists because those with existing mental health struggles are drawn to AI romantic companion apps or if the actual engagement with these technologies lowers mental health and wellbeing over time."* This is exactly the ambiguity the assignment flagged: people who have already withdrawn (lonelier, more depressed, or already in a low-quality relationship) may adopt AI companions rather than AI companions causing the withdrawal — and neither Wheatley report can rule this out, by their own admission.

5. **Complementarity-leaning evidence (independent source, Common Sense Media, teens — different population):** 80% of teen AI-companion users still spend more time with real friends than with AI companions; 67% find AI conversations *less* satisfying than human ones; 46% frame AI companions as "tools," not relationship substitutes; only 8% of all teens surveyed selected "romantic or flirtatious interactions" as a use case. The report's own Discussion section concludes teens mostly use AI companions "pragmatically, rather than as substitutes for human relationships." This is independent, methodologically stronger evidence — but it is about teen friendship/social use, not adult romantic-partner-seeking, and the demographic (13-17-year-olds) is not the "market-exiting young men" population either.

**No source anywhere in this cluster isolates the specific population the claim is about** — single, dating-market-disengaged young men — and asks whether their AI companion use is associated with reduced dating-market participation (fewer dates, less use of dating apps, longer time since last real relationship attempt, stated intention to stop pursuing partners, etc.). Both Wheatley samples are either general-population/mixed-relationship-status (primary target) or explicitly restricted to people who ARE currently partnered (Secret Soulmates) — the opposite of the "market-exiting" population. The Common Sense Media sample is adolescents. This is a structural gap in the available evidence base, not a data point that was overlooked.

## (c) Does anything measure displacement/substitution directly?

**No.** Every source located in this cluster measures **prevalence** (how many people have used/chatted with/viewed AI companion technology) and, at most, **self-reported preference or subjective belief about replacement** (e.g., "I'd rather talk to AI than a real person," "I use AI to replace human relationships"). None measures actual behavioral displacement — i.e., none tracks whether AI companion use causally reduces or is associated with reduced real-world partner-seeking behavior among people not already partnered, using a design (longitudinal, quasi-experimental, or even carefully matched cross-sectional comparison of daters vs. non-daters) that could distinguish substitution from either complementarity or reverse causation (withdrawal-first, AI-adoption-second). Both Wheatley reports explicitly acknowledge this limitation in their own text (cross-sectional data, causal direction "unclear"). This is worth stating plainly per the assignment's instruction: **the evidence base for this cluster is prevalence-only; "substitution" is an inference layered on top of prevalence and correlational/attitudinal data, not a finding any located source actually establishes.**

## Marketing-tier material excluded

The following were encountered during search and explicitly **excluded** as vendor/market-research-firm growth forecasts or company-published figures, per the assignment's hard exclusion, and their figures are NOT used anywhere above:
- Match.com/Kinsey Institute "Singles in America" study (26% of singles using AI to enhance dating, "333% increase") — company-sponsored consumer survey.
- Forbes "AI girlfriend" search-volume growth statistics (search-term trend data, not survey data).
- VentureBeat "AI girlfriends are 7 times more popular than AI boyfriends" (app-download/market framing).
- ZipHealth survey (26% of Gen Z "romantic or sexual interactions with AI") — company-sponsored (sexual health product marketer).
- Wiingy study (41% "in a relationship" with AI) — vendor-adjacent, methodology not surfaced.
- Various "current monthly searches for AI romantic partners exceeding 70,000" and app-download growth claims cited inside the Wheatley report's own introduction (footnote 6) — these are market-estimate citations Wheatley itself uses for scene-setting, not their own survey findings; excluded from the figures reported above.

## CONFIDENCE NOTES

**Verified to primary (I read the actual instrument's report text, not a secondary summary):**
- Wheatley Institute, "Counterfeit Connections" (Feb 2025) — full report PDF read in full (raw-01.txt). This is the assignment's primary target.
- Common Sense Media / NORC, "Talk, Trust, and Trade-Offs" (July 2025) — full report PDF read in full (raw-02.txt). Independent second source.
- Wheatley Institute + IFS, "Secret Soulmates" (2026) — full report PDF read in full, but used only as background/context in this notes file (not independent of the primary target; not saved as a numbered raw file per the assignment's instructions).

**Reached only secondhand / could not verify to primary:**
- Gallup / Walton Family Foundation / Harvard Business Review (Lira, Folk, Ungar, Duckworth, Jan 2026) — the "1 in 10 (10%) of 18-28-year-olds interact with AI girlfriends or boyfriends at least once a month" figure is quoted from inside a Wheatley Institute document, not read directly from Gallup or HBR. HBR's site only renders the article's title/byline/first paragraph without a subscription; the Wayback Machine is blocked in this environment. I confirmed independently (via news.gallup.com and gallup.com/analytics) that Gallup's general panel methodology is a genuine probability-based design (address-based sampling / RDD recruitment, ~1,572-respondent example cited for a different Gallup Gen Z release), which supports treating the underlying Gallup/Walton Family Foundation panel as methodologically stronger than Wheatley's Qualtrics opt-in panel, but I did not verify the exact question wording, exact sample size, or exact percentage for the AI-girlfriend/boyfriend item from a Gallup/HBR primary source. **This entire figure should be flagged UNVERIFIED-TO-PRIMARY if promoted into any doctrine text.**
- A peer-reviewed journal article by the same Wheatley authors — Willoughby, B. J., Dover, C. R., Hakala, R. M., & Carroll, J. S. (2025). "Artificial connections: Romantic relationship engagement with artificial intelligence in the United States." Journal of Social and Personal Relationships, 42, 3363-3387 — is cited in both Wheatley reports' reference lists but was not located/read for this assignment. If it substantially reproduces the Counterfeit Connections dataset (same authors, overlapping subject matter, same year), it would strengthen the primary target's standing (peer review) without making it independent (same team, likely same or overlapping data). Flagged as a GAP: worth chasing in a future pass via a journal-database search (e.g., SAGE Journals) rather than open web search, since it did not surface in general web search or in either Wheatley PDF's inline text.

**Failed to reach / barriers named:**
- hbr.org full article text — paywalled beyond the opening paragraph.
- web.archive.org — blocked for this tool in this environment ("Claude Code is unable to fetch from web.archive.org").
- Journal of Social and Personal Relationships article (Willoughby et al., 2025) — not searched via a journal database in this pass; only its citation-list entry was seen.
- Pew Research Center — searched specifically for AI-companion/romantic-chatbot content; Pew's most relevant 2025-2026 releases ("Teens, Social Media and AI Chatbots 2025"; "How Teens Use and View AI"; "Americans' Views on AI Chatbots...") cover general chatbot/emotional-support use (e.g., "16% of teens say they have used chatbots to have casual conversations," "one in five Americans aged 18-29 have used AI chatbots for emotional support") but nothing specifically framed as romantic-companion/AI-girlfriend-boyfriend use was found in search-result summaries. Not confirmed absent — only confirmed not surfaced by search; a direct page-by-page read of the Pew teens/chatbots report was not performed in this pass due to time, and is a legitimate follow-up if this cluster is revisited.
- YouGov — not checked in this pass at all (GAP; time-boxed out).
- Peer-reviewed Replika/Character.AI user studies (e.g., Pan & Mou 2024; Laestadius et al. 2022 on Replika; Xie, Pentina, & Hancock 2023) — these surfaced only as citations inside the Wheatley/Common-Sense reference lists, not as sources I read directly. They appear to be qualitative/forum-analysis or small-sample studies of existing AI-companion users (studying people already using the product), not population-prevalence or substitution-vs-complementarity studies, so they likely would not resolve the substitution question even if retrieved — but this is inferred from titles/abstracts-via-citation, not confirmed by reading them.

**A note for the maintainer, in case the Lab's analyzer touches this cluster:** the primary target's headline figures (19% overall / 31% young men / 23% young women "have chatted with an AI romantic partner") are a **lifetime "have you ever" exposure measure**, worded and reported identically regardless of frequency, intensity, or current status. Any downstream doctrine text that reports this as "X% of young men are currently substituting AI for dating" would be conflating a lifetime-exposure prevalence figure with an ongoing-substitution claim — the source itself does not support that stronger reading, and says so implicitly by keeping "have chatted" (past-tense, unbounded frequency) as the operative verb throughout.

<!-- END VERBATIM SCOUT BLOCK: S-E — C2 AI companions as a substitute good -->

## S-F — C10 friendship decline and partner reliance — embedded verbatim

> Source file: `S-F-findings.md` · SHA-256 `c69fb8bc71a6cd4aa043e7be2d4b93aac2065d27caf0e315fac7ea446b8c3ba8`
> Concatenated by script, not retyped. Nothing below this line is orchestrator-authored.

<!-- BEGIN VERBATIM SCOUT BLOCK: S-F — C10 friendship decline and partner reliance -->
# Cluster C10 — "Male friendship decline concentrates men's emotional support onto romantic partners as sole channel"

## TOP-LINE FLAG (read this first)

Contrary to the working assumption handed down for this assignment, **genuine instrumented evidence bearing on the sole/primary-channel step (c) DOES exist** — but it is thin, comes from populations far removed from the "friendship decline" claim (older Europeans, Dutch elders in 1992), and the single most rigorous *direct* test of the analogous claim in a large modern US probability sample (Pew 2025) actually **cuts against** the naive version of (c). See TARGET 2 below for the full breakdown before drawing any conclusion. The prior integrity flag — that the sole-channel step is discourse extrapolation not present in the (a)-type source data — is **CONFIRMED for the specific ASC/Cox friendship-decline dataset** (raw-01.txt): that report never measures or claims partner-concentration. But it would be inaccurate to say no data anywhere touches (c); some does, and it is mixed.

---

## (a) Men have fewer friends / receive less friend-support than women — comparative friendship claim

**Source: raw-01.txt — Daniel A. Cox, "The State of American Friendship: Change, Challenges, and Loss," Survey Center on American Life, June 8, 2021.** TIER 2 (single survey, no independent replication of this exact instrument, but large probability-based sample with published methodology).

- Survey: May 2021 American Perspectives Survey (APS). N=2,019 US adults 18+. Sampling: Ipsos KnowledgePanel, probability-based panel. Field dates: May 14–23, 2021. MOE ±2.4 points at 95% CI, design effect 1.2.
- **Emotional support figure, exact wording as printed in the report** (recall window = past week, NOT past month): "Men are also far less likely than women are to have received emotional support from a friend. Four in 10 (41 percent) women report having received emotional support from a friend within the past week, compared to 21 percent of men."
- Adjacent item, same recall window: "Nearly half of women (48 percent) and less than one-third of men (30 percent) say they have had a private conversation with a friend during which they shared their personal feelings in the past week."
- Close-friends-by-sex-over-time (from the companion piece "Men's Social Circles are Shrinking," same author/publisher, same underlying May 2021 APS, captured via WebFetch extraction not raw HTML — flagged in raw-01.txt): men with 6+ close friends fell from 55% (1990) to 27% (2021); men with zero close friends rose from 3% (1990) to 15% (2021), a "fivefold increase." Women: 6+ close friends fell from 41% (1990) to 24% (2021); women with zero close friends = 10% (2021, no 1990 comparator given in that piece).
- **Important instrument caveats the report itself flags**: the 1990 comparator is a Gallup telephone poll vs. the 2021 online panel — mode-effect / social-desirability-bias risk explicitly noted by the authors (footnote 7). "Close friend" was left undefined/subjective to the respondent (footnote 6).
- I could NOT locate the literal interviewer-facing question wording (the topline questionnaire PDF was not machine-readable in this environment — image-rendered PDF, pypdf extraction returned near-blank text, WebFetch's PDF handler also failed). The report's own narrative sentence is the closest available wording and is what is quoted above.

**Complication worth flagging**: Pew Research Center's 2025 survey (raw-02.txt, n=6,204, fielded Sept 2024) found "men and women are about equally likely to say they have at least one close friend" and 18% of all adults (not sex-split in what I could reach) report zero close friends — in real tension with ASC's 2021 sex-split (15% of men vs 10% of women with zero close friends). These are different surveys, different years, different definitions of "close friend," and I am NOT merging them — but a maintainer citing "men have fewer friends" should know the claim is not uniformly replicated across the two most-cited large US probability surveys on this topic.

**Verdict: (a) is well-evidenced by raw-01.txt, TIER 2, with the mode/definition caveats above. It is NOT unanimous across all major surveys — see the Pew close-friend-parity finding.**

---

## (b) Men rely on romantic partners for emotional support — partner-reliance claim

**Source: raw-01.txt, same ASC 2021 report.** TIER 2.
- "Overall, more than half (53 percent) of Americans say that the first person they talk to when they have a personal problem is their spouse or partner." (Not sex-split at the topline level.)
- Sex-split, married respondents only: "Married men are significantly more likely than married women are to say the first person they talk to when they have a problem is their spouse. Eighty-five percent of married men, compared to 72 percent of married women, say they turn to their spouse when they have a personal problem." — This is a genuine sex-differentiated finding supporting (b): among married people, men lean on the spouse as first-call MORE than married women do (13-point gap). It is a single forced-choice "first person" item, not a network/confidant count, and it says nothing about singles or about friendship decline as a cause.
- Historical note in the same report: a 1990 Gallup poll found 26% of Americans named a friend as first-call (vs. 16% in 2021) — evidence that reliance on friends specifically has fallen, consistent with (a)/(b) co-occurring, but again not evidence of (c) causality.

**Source: Dykstra & de Jong Gierveld (2004), Canadian Journal on Aging, N=3,737, 1992 Dutch survey (NESTOR-LSN).** TIER 2 (single large probability survey, dated, foreign population). Full abstract quoted verbatim (I could not reach the full body text — PubMed abstract page reached; ResearchGate full-text mirror returned HTTP 403):
> "The marital-history differences in emotional and social loneliness are greater among men than women. For men, the marriage bond appears not only to be more central to emotional well-being than is the case for women but also to play a pivotal role in their involvement with others. ... Apparently, whereas men are more likely to find an intimate attachment in marriage, women also find protection from emotional loneliness in other close ties."

This is real instrumented evidence for (b) — and edges toward (c) in its final clause ("women also find protection... in other close ties," implying men find that protection *less* elsewhere) — but it is Dutch older adults surveyed in 1992, not the US friendship-decline cohort under investigation, and it measures loneliness outcomes, not a direct count of confidants or a "sole channel" test.

**Verdict: (b) has real support, TIER 2, from two independent instruments (ASC 2021 married-respondent item; Dykstra & de Jong Gierveld 2004). Both are correlational/cross-sectional, not about friendship decline causing the reliance.**

---

## (c) Romantic partner as SOLE/primary channel, with friendship decline as the causal driver — the actual claim under test

This is where the evidence gets genuinely mixed, and where the highest-value finding of this research pass sits.

### The most direct US test: Pew Research Center 2025 (raw-02.txt) — TIER 1 candidate (n=6,204, two linked probability panels, published methodology)
> "Men and women are equally likely to say they'd lean on their spouse or partner in this way" (74% overall extremely/very likely to turn to spouse/partner for emotional support).

The sex gap in this survey is NOT in partner-reliance (equal) — it is in the number of OTHER available channels: women are 12–18 points more likely than men to also name mother, friend, other family member, or mental-health professional. **This is evidence AGAINST the specific mechanism "men elevate partner-reliance relative to women" and instead supports a narrower, different claim: men have a narrower total repertoire, with partner-reliance held constant across sexes.** That is a materially different, more precise claim than "concentrates onto partner as sole channel" — it is closer to "men have fewer backup channels" than "men lean on the partner more." A maintainer should not let (a)-type breadth data get restated as (c)-type concentration data; this Pew finding is the clearest illustration of why the distinction matters, because on the one item that most directly operationalizes "does the partner carry more relative weight for men," the answer is no.

Caveat: this Pew item is a hypothetical multi-select "how likely would you be to turn to X" battery, not a forced-choice "sole" or "only" measure, and not a measure of actual realized support-seeking behavior. It does not test what happens when the partner is unavailable, and it is not longitudinal/causal with respect to friendship decline.

### The best direct test found anywhere, of any population: Sun & Schafer (2023), Journals of Gerontology: Series B — TIER 1 candidate on methodology (N=17,429 partnered respondents, SHARE Wave 4/2011 & Wave 6/2015, 14 European countries, peer-reviewed), but a DIFFERENT population (older Europeans, not the US friendship-decline cohort)
Full abstract, quoted verbatim (reached via WebFetch against the Oxford Academic abstract page; full text is paywalled, ResearchGate mirror 403'd):
> "People's partners and spouses often provide a wide range of essential emotional and practical support. As crucial as they may be, a nontrivial segment of the older population appears to limit close discussions to their partner alone, a phenomenon we term 'partner network exclusivity.' ... More than a quarter of partnered respondents (28.1%) are in partner-exclusive core networks. **Men, childless individuals, and those with financial difficulties are most likely to occupy such networks.** Individuals in partner exclusivity are especially likely to enlist additional ties upon partner loss. Nevertheless, **men and individuals at early old age are relatively unlikely to rebalance their core networks in case of partner death.** ... widowhood produces patterns of vulnerability for a subset of older adults in partner-exclusive core networks."

This is the single clearest instrumented finding for something like claim (c) that this research pass turned up: men ARE disproportionately more likely than women to have a support network in which the partner is the ONLY member (literally "sole channel" by the paper's own operational definition — "whether one listed their partner as the sole member of the core network"), and men are less likely than women to recover a support network after losing that partner. **This should be flagged prominently to the maintainer as real evidence for a version of (c) — but it is evidence for a *structural sex difference that exists among partnered older Europeans*, not evidence that *friendship decline in America causes or increases* this concentration.** No study in this research pass measured that causal/trend claim directly.

Two specific supplementary numbers surfaced by the extraction tool beyond the abstract text — a "12.7 percentage point" male-female gap in the probability of partner-exclusive networks, and "less than 60% of men vs. about 90% of women add new core-network ties after a partner's death" — **could NOT be independently corroborated against a second reachable copy of the full text and are marked UNVERIFIED.** They are plausible and consistent with the abstract's qualitative claims but should not be cited as confirmed figures without reaching the paywalled full text.

### A secondary, weaker echo: Shin & Park (2023), Frontiers in Psychology, N=620 South Korean adults ages 40–69
Captured only via WebFetch summarization (not raw HTML parse — treat with more caution than raw-01/raw-02). Contains the citation-of-a-citation "men often report that their spouses are their only confidants" — but tracing that citation back, it resolves to the Dykstra & de Jong Gierveld (2004) paper above, i.e. it is not independent evidence, it is the same underlying claim being repeated across the literature. Shin & Park's OWN empirical data (their South Korean LPA typology) found men over-represented in a "restricted" network type (24.4% of men vs. 16.4% of women) — but on inspection, "restricted" was explicitly defined by the authors as small networks with LOW support from family AND friends AND **above-average spousal conflict / lowest marital quality** — i.e., broad relational poverty, not partner-concentration. **This is a case where I initially thought I had found supporting data for (c) and, on closer reading, it does NOT actually support (c) — it is closer to a (a)-type finding (general relational deficit) mislabeled by superficial resemblance.** Flagging this explicitly because it is exactly the kind of near-miss a less careful pass could misattribute.

### What I did NOT find
- No study measuring US men's support networks specifically, tied to the friendship-decline trend documented in raw-01.txt, that tests whether partner-reliance INCREASED as friend-networks shrank (i.e., no causal/longitudinal test of the actual mechanism in the claim).
- No GSS confidant-name-generator breakdown by sex with exact published percentages reachable — McPherson, Smith-Lovin & Brashears (2006), "Social Isolation in America" (ASR), is the landmark study here (1985 vs. 2004 GSS waves, mean network size 2.94→2.08, "confidant networks centered on spouses and parents") but the PDF I located (almendron.com mirror) was not text-extractable by the tools available (compressed/encoded stream, same failure mode as other academic PDFs in this session), and I could not reach a clean HTML version. This is a GAP, not a negative finding — the paper is well-known to discuss spouse-centering of shrinking US networks and would be the single best US-specific test of (c) if reached. Recommend a future pass try Sci-Hub-adjacent legitimate repositories, a university library proxy, or a librarian-assisted request.
- No study directly measuring "what happens to men's support specifically when a ROMANTIC relationship (not just marriage/widowhood) ends" in a way that isolates the sole-channel mechanism from other explanations (e.g., breakup-initiation asymmetry, attachment style, general adjustment disorder). The breakup-distress literature (e.g., Wahring, Simpson & Van Lange, 2024/2025, Behavioral and Brain Sciences target article, "Romantic Relationships Matter More to Men than to Women") documents men suffering more post-breakup distress and lower breakup-initiation rates, which is CONSISTENT with a sole-channel mechanism but does not test it directly — distress could stem from several non-exclusive mechanisms. I could not get verbatim text from this paper (PDF not machine-readable); treat any claims from it as UNVERIFIED/secondhand from search-result summaries only, TIER 3 sourcing quality in my hands even though the underlying journal is TIER 1.

---

## DIRECT ANSWER: does the sole-channel step exist in reachable source data?

**Partial yes, with a major caveat.** It is not simply discourse extrapolation with zero grounding anywhere — Sun & Schafer (2023) is real, peer-reviewed, large-n instrumented evidence that men are disproportionately more likely than women to have a partner-exclusive support network and to fail to replenish it after partner loss. That is a genuine, if population-mismatched, empirical anchor for something like claim (c).

But: (1) that anchor is in older, partnered Europeans, not the American friendship-decline population the claim is actually about; (2) the one large modern US probability survey that directly tested the analogous question (Pew 2025) found NO sex gap in partner-reliance itself — the sex gap is in breadth of alternate channels, a meaningfully different and weaker claim than "concentration onto partner"; (3) no source anywhere in this pass tested the actual mechanism asserted in the claim — that DECLINING friendship networks CAUSE or correlate with INCREASED partner-concentration over time. Every source is cross-sectional.

So: the specific causal chain "friendship decline → concentration onto partner as sole channel" remains unsupported as a tested mechanism. But the destination state it describes — men disproportionately having the partner as their only confidant — has at least one real, if geographically/demographically distant, instrumented anchor. The original integrity flag was right that the ASC/Cox friendship-decline report itself (the primary source usually cited for this claim) contains no such step. It would be an overcorrection to say no data anywhere supports any version of it.

---

## CONFIDENCE NOTES

**Verified to primary (byte-verbatim, raw HTML fetched and parsed by me directly, not tool-summarized):**
- raw-01.txt: ASC/Cox 2021 "The State of American Friendship" main report page — full body text, including methodology and footnotes.
- raw-02.txt: Pew 2025 "Men, Women and Social Connections" — both the landing/methodology page and Chapter 2 ("Where men and women turn...").

**Verified to primary but only at abstract level (full text paywalled/unreachable):**
- Dykstra & de Jong Gierveld (2004) — abstract quoted verbatim from PubMed.
- Sun & Schafer (2023) — abstract quoted verbatim from Oxford Academic; two supplementary percentages beyond the abstract are UNVERIFIED (see above).

**Reached only secondhand (via WebFetch tool summarization of a source I could not raw-parse, or via WebSearch synthesis, not independently corroborated):**
- Daniel A. Cox, "Men's Social Circles are Shrinking" (2021) — appended to raw-01.txt with this caveat noted inline.
- Shin & Park (2023), Frontiers in Psychology — network-type percentages and the "restricted" type definition.
- Wahring, Simpson & Van Lange (2024/2025 BBS target article) — breakup-distress/relationship-centrality claims; PDF not machine-readable, treat as TIER 3 in my hands.
- McPherson, Smith-Lovin & Brashears (2006) "Social Isolation in America" — network-size trend figures (2.94→2.08) came from WebSearch synthesis of the paper's known abstract/citations, not from text I read myself; the specific "confidant networks centered on spouses and parents" phrase is widely quoted secondhand across sources citing this paper, which increases my confidence it is a real quotation, but I did not confirm it against the primary PDF myself.

**Failed to reach / GAPS:**
- The May 2021 APS topline questionnaire PDF (exact instrument-level question wording) — image-rendered PDF, not text-extractable with pypdf or WebFetch in this environment.
- Pew's own topline/questionnaire PDF for ATP Wave 154 — not attempted after the ASC topline failure pattern repeated on two other PDFs this session; likely same failure mode.
- McPherson et al. (2006) full text — PDF mirror found but not text-extractable (compressed stream).
- Sun & Schafer (2023) and Dykstra & de Jong Gierveld (2004) full bodies — paywalled; ResearchGate mirrors both returned HTTP 403.
- Any study directly testing the causal "friendship decline → partner concentration over time" mechanism — not located; may not exist as a direct test in the literature, or may exist under search terms not tried (e.g., specific longitudinal panel studies of network composition pre/post relationship changes).

## NOTE FOR THE LAB MAINTAINER (prose only, no feedback file created per instructions)
If the Lab's analyzer or canon ever tries to auto-correlate "friendship decline" statistics with "partner reliance" statistics as though they were the same claim family, this cluster is a clean illustration of why that would miscorrelate: raw-01.txt (friendship decline, TIER 2, US, 2021) and raw-02.txt (partner-reliance parity, TIER 1-ish, US, 2024/2025) are both real, both about men and emotional support, and they point in different directions on the specific question of whether men elevate partner-reliance — because they are answering different questions ((a)-breadth vs. (c)-concentration). Any canon rule that treats "men + emotional support + partner" as a single fuzzy-matchable concept would conflate a well-supported breadth claim with a much weaker, population-mismatched concentration claim, and would miss that the most direct modern US test of concentration actually returned a null result on the sex gap.

<!-- END VERBATIM SCOUT BLOCK: S-F — C10 friendship decline and partner reliance -->
