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
