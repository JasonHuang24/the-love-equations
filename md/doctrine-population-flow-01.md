# Doctrine invention — The Population Layer (batch 02)

**Date:** 2026-07-31 · **Lane:** Claude (Fable 5, high effort), main loop + 3 Opus 5 research scouts
**Target surface:** `frameworks.html` — one new TOC group, three entries (31–33)
**Status:** SHIPPED. Concept was written before implementation deliberately, because a second
session is inventing doctrine on the same page at the same time. Two of the three entries were
**inverted by their own evidence** and ship as corrections of the folk model rather than
endorsements of it — that is the batch's main result, not an accident of it.

**Shipped as:** TOC group "The population layer", entries 28–30 (`#stock-flow-error`,
`#residual-pool`, `#clearing-order`); Tested claims renumbered 28–30 → 31–33. Canon 476 → 479,
Rules & Frameworks 35 → 38. `npm run test:lab` green end to end including all three Python audits.

---

## 0. Collision control (read this first if you are the other session)

A concurrent session is running in this same working tree with a near-identical prompt
("invent doctrine, primarily in rules and frameworks"). This document **stakes** the following
and nothing else:

- **New TOC group:** "The population layer"
- **Entry ids:** `#residual-pool`, `#clearing-order`, `#stock-flow-error`
- **Thesis:** the site models the market as a *standing population*; it is a *flow*.

Deliberately **not** taken here, and left free for the other session — these were the two other
live candidates and both are hereby released:

- **The sex ratio / the local market.** Asserted once on `smvlevers.html` (the Market multiplier,
  Guttentag & Secord, tagged Mixed) and modelled nowhere. A prior run already scouted it
  ("Scout S-G · Guttentag & Secord mechanism half + campus sex-ratio evidence"), and the
  close-out sweep recorded G&S as *never reached* — so it has both a known gap and pending
  research. Highest-value item on the board that this batch does not touch.
- **The Saturation Rule (Red Queen / advice decay).** No framework models what happens to a tactic
  as it diffuses: advice that works is advice that has not saturated yet. It fences the site's own
  advice the way the Calibration Error fences the site's own instruments. Evidence base is thin
  (signalling equilibrium, Goodhart), so it would ship Lens-heavy.

## 1. The structural finding this batch acts on

**Every framework on the site samples from a pool it treats as static.**

The valuation layer asks what a person is worth. The transaction layer (batch 01) asks what
participating costs. Both take *the market* as a given backdrop — an urn of candidates you draw
from, whose contents do not change while you are drawing.

The pool is not an urn. It is a **flow with an entry gate, an exit gate, and a return gate**, and
its composition changes over time for reasons that have nothing to do with any individual in it.
Nothing on this site models that, and the omission produces three distinct errors — one about the
pool, one about time, one about how the whole discourse reads its own statistics.

Verified against the live pages, not against Lab verdicts (standing discipline, Harvest #1):

| Vocabulary grepped site-wide | Hits |
| --- | --- |
| `adverse selection\|lemons\|Akerlof\|residual pool\|leftover` | **zero** (one unrelated matchmaker prose hit) |
| `stock\|flow\|period measure\|cohort measure` | **zero** in a statistical sense |
| `50% of marriages\|half of all marriages` | **zero** — the site has never addressed the most-repeated statistic in the subject |
| `cross-section` | **two prose applications, never named** — see below |

**Correction to my own gap claim, recorded rather than quietly dropped.** The first pass of this
grep reported zero coverage for the reasoning error in entry 33. That was wrong. The site already
makes the argument twice, locally and well: `dd-what-the-wall-actually-is.html` sinks the
married-versus-single happiness comparisons on the grounds that they are cross-sectional and
selection-driven, and `statistics.html#body-count` takes the same selection problem apart. So the
honest statement of the gap is **not** "the site has never made this argument" but "**the site makes
this argument ad hoc, in prose, in two places, and has never named it or generalised it into a rule
it applies to itself.**" That is the same shape as the Third-Party Layer in batch 01, which named
what three existing assets were separately gesturing at.

It also sharpens entry 33, because those two instances are a *different* error from the one the
entry is about, and the entry must separate them: **selection bias is about who is in the picture;
the stock–flow error is about what a picture of one moment can tell you about a life.** They co-occur
constantly and are not the same mistake.

Two existing site assets are **unconsumed inputs** to this batch — the same shape as `#stat-divorce`
before the Sixth Rung consumed it:

- `statistics.html#stat-never-married` — 6% (1980) → 25% (2021) never-married at 40, plus the
  age-flip (young surplus of single men becomes an old surplus of single women). That flip is a
  **pure composition effect stated on the site with no framework naming the mechanism.**
- `statistics.html#stat-why-single` — 47% bigger priorities / 44% like being single, and the
  involuntary-singlehood tell (men 26% vs women 12% on "no one would be interested in me").

## 2. The three entries

### 31 · The Residual Pool — *The population layer*

**The single population at 40 is not the single population at 25, ten years older. It is the
residue left after everyone who paired off has been removed.**

The average of a pool can fall while every single person in it improves, because the pool is
losing members non-randomly. That is a composition effect, and it is the mechanism behind an
observation the discourse makes constantly and explains wrongly ("everyone left is damaged").

Three moves the entry makes:

1. **The mechanism is Akerlof's, not a moral one.** Non-random exit degrades the average of what
   remains. No individual has to change for the pool to get worse.
2. **The reflexive sting.** If you are drawing from the residual pool, you are *in* the residual
   pool, and you were left for the same structural reason. The framing is symmetric and the
   discourse only ever aims it outward, at women.
3. **The honest limit, which is what keeps this from becoming a blackpill.** "Selected for
   something" is not "selected for defect." The measured reasons people are still single at 40 run
   heavily benign, and the site's own `#stat-why-single` says so. The composition effect is real;
   the "damaged goods" reading is an unlicensed inference from it, and the entry says that in the
   body, not the footnote.

**Boundary condition:** the pool also *refills*, and not with the same people who left it —
re-entrants arrive with different properties (see the Sixth Rung). Thinning and refilling are
different mechanisms and the entry must not merge them.

> **REVISED after S-1 (2026-07-31). The strong version of this entry does not survive, and the
> entry is better for it.** See §4.1 for the evidence. Short form: the composition mechanism is
> real and formally established in economics, and has been demonstrated once in an actual marriage
> market by a randomised trial — but the US "everyone left is damaged" reading fails on three
> independent counts, one of which is *already house doctrine on this site*. The entry now ships as
> a **correction** of the folk model: the pool is genuinely non-random, and almost none of what the
> discourse infers from that is licensed. The verdict grade is **Confounded** — a real, measured
> correlation (unpartnered adults do differ on employment, earnings and health) with an invented
> cause ("the good ones got taken").

### 32 · The Clearing Order — *The population layer*

**Time in the market is not neutral, because the pool is being drained in an order.**

If exit is even loosely ordered by matchability, then a participant's realistic option set degrades
with time for reasons independent of their own aging — and this is a *separate* mechanism from
The Wall, which is about the participant. This entry is where the batch is most at risk, and the
scout brief was written to try to kill it: US early marriage is **negatively** selected on
education and income, which cuts hard against a naive "the best leave first" story.

Live possibility, to be decided by the evidence: the honest version of this entry may be that the
market clears in *several* orders at once — early on socioeconomic lines that run opposite to
desirability, later on desirability — in which case the entry ships as a correction of the folk
model rather than an endorsement of it. **That would be the better entry.** A framework that says
"this popular intuition has the sign backwards for the first decade" is worth more than one that
confirms it.

### 33 · The Stock–Flow Error — *Orientation*

**Almost every famous statistic in this subject is a snapshot being read as a destiny.** The error
has a direction: it makes transient states look permanent.

Three worked examples, chosen because the site can check its own work against them:

1. **"Half of marriages end in divorce."** A period ratio — this year's divorces over this year's
   marriages — comparing two different populations. It is not, and has never been, a lifetime
   probability for anyone.
2. **"A quarter will never marry."** Never-married-*at-40* is a stock. First marriages after 40
   exist. The site cites this figure and must state the gap between the stock and the projection.
3. **"The top 20% of men get 80% of the likes."** A snapshot of attention on one platform read as
   a lifetime distribution of relationships. Bruch & Newman's desirability hierarchy is real and is
   a *network snapshot*, not an outcome ledger.

This sits in **Orientation**, next to the Calibration Error, and for the same reason: it fences the
site's own instruments. `statistics.html` is largely a wall of cross-sectional snapshots. This
entry is the reading instruction for that page, and it obliges the site to accept the discipline it
is imposing on everyone else.

## 3. Why these three are one finding, not three

Each is the same omission seen from a different angle:

| | The question | The error without it |
| --- | --- | --- |
| Residual Pool | who is left? | reading composition as character |
| Clearing Order | when do they leave? | reading the pool's decay as your own |
| Stock–Flow Error | what does a snapshot mean? | reading a state as a fate |

The site prices the participant, then the transaction. This batch prices **the population** — and
the through-line is that a moving population read as a still photograph produces confident,
specific, wrong conclusions.

## 4. Evidence

### 4.1 S-1 returned — and it inverts entry 31

**What survives, and it is strong:**

- **Akerlof (1970), QJE 84(3):488–500** — verified off the primary. The mechanism is one-sided:
  *only the seller knows.* The words "marriage", "mating" and "spouse" appear zero times. Any
  lemons-in-dating claim is LE's extension, and the entry must say so.
- **Angelucci & Bennett (2021), *Review of Economic Studies* 88(5):2119–2148** — an actual RCT in an
  actual marriage market (Malawi, N = 1,505 women, 8 waves/28 months). High-frequency HIV testing
  raised marriage probability **+7.2 pp (+45%)**; among safe *and* attractive respondents,
  **+11 pp (+92%)**. A single test did nothing. This is the strongest evidence anywhere that
  adverse selection can bind in a marriage market — and it needed a hidden, binary,
  cheaply-testable trait to do it. It is the exception that measures the rule.
- **Autor, Dorn & Hanson (2019), *AER: Insights* 1(2):161–178** — instrumented, 722 commuting zones.
  A one-unit trade shock: male-intensive component **−4.2 pp ever-married** among women 18–39
  (t = 6.6, a 12% decline), male employment **−0.64 pp** relative to women with the whole
  differential landing as idleness, and **+69.6 excess male deaths per 100K** aged 20–39 per decade,
  a third of it drugs and alcohol. **This paper is cited nowhere on this site**, which is a
  standalone finding: the best-identified causal result on male marriageability in existence is
  missing from a site with a Men's Strike entry and a Provider Norm chart.
- **Guner, Kulikova & Llull (2018), *European Economic Review* 104:138–166** — the married/unmarried
  health gap is **~100% selection under 40**, and about half (5 pp of 10 pp) at 55–59.

**Why the strong version dies — three counts:**

1. **Exit is not rank-ordered on a shared index.** Eastwick & Hunt (2014, *JPSP* 106(5):728–751):
   among acquaintances of ~3 years, target variance (shared consensus) is **2.1%** against
   relationship variance (dyad-specific) of **50.1%**, and consensus *falls* as people get to know
   each other. A composition effect on "quality" requires a common queue to deplete from. At the
   layer where marriages form, there barely is one. **This is already on this site**, in
   `#bone-pill`, as the evidence that sinks the Bone Pill — so entry 31's central limit is house
   doctrine already, and the entry should cite our own page, not present it as news.
2. **Individuals really are degraded, not merely sorted.** ADH is the cleanest identification in the
   area and it says the unmarried pool grew because a demand shock made men less employable, idler,
   and likelier to die — not because good types left first.
3. **The pool is not a sealed residue.** A quarter of never-married 40-year-olds marry by 60; 22% of
   never-married 40–44s are already cohabiting; and the unpartnered pool mixes never-married with
   divorced and widowed (Pew 2021/2022/2023).

**And the male-side theory predicts the opposite sign.** Bergstrom & Bagnoli (1993, *JPE*
101(1):185–202): high-prospect men *choose to wait* until their success is revealed. The older
single male pool is enriched in high types by their own choice — which is a live counter to both
entry 31 and entry 32 and must be carried in the body.

**The honest claim the site can make**, and the line entry 31 will be built on:

> Both happen. Selection into marriage is large and measured — essentially all of the under-40
> health gap, and a real earnings and employment gradient for men. But exits are only weakly
> ordered on any shared index, causal shocks degrade people in place, and the pool refills from
> divorce. *Composition, not decay* is a real effect over-claimed as an exclusive one.

**Carried as UNVERIFIED, not to be published without a second pass:** the Ginther & Zavodny "at most
10% selection" figure and its pagination; the Pew 28%-men / 22%-women never-married-at-40 split
(secondary coverage only); Lillard & Panis's exact wording. The 2.6 pp / 69.6-deaths / −4.2 pp
figures above were read off the papers themselves and are safe.

### 4.2 S-2 returned — and it kills entry 32 as written, then replaces it with something better

**The claim "the market clears in roughly desirability order" is dead.** Two independent reasons:

1. **No US study relates attractiveness to the *date* of first marriage or first union.** The
   literature measures attractiveness against the *stock* of ever-married (Jokela 2009; Udry &
   Eckland 1984), never the timing. The one clean test of accelerated exit — Karraker, Sicinski &
   Moynihan (2017, *J Gerontol B* 72(1):187–199, Wisconsin Longitudinal Study, N ≈ 4,066, yearbook
   photos rated by 12 judges) — asked whether adolescent attractiveness predicted **remarriage**
   and came back **null**.
2. **On the one axis where the data is excellent, the order is inverted** — at exactly the ages the
   claim needs. Copen et al. (2012), NSFG 2006–2010: probability of first marriage **by age 20** is
   **27% for women with no high-school diploma against 3% for women with a bachelor's** — a ninefold
   gap running backwards. At 25 it is still 53% vs 37%. **The order flips around 30**, and by 40 the
   graduates lead 89% to 77%. First cohabitation is sharper still: by age 20, **51% vs 8%**.
   The earliest exits are disproportionately the *lowest*-SES, which is not a top-of-market signature.

Also fatal to the entry's weakest sentence — "independent of their own aging": the only large
desirability-by-age measurement (Bruch & Newman) shows women's desirability declining monotonically
from 18 and men's peaking near 50. That is own-aging. **No study holds own age constant and varies
time-in-market**, which is what a pool-composition effect would require. Recorded as a genuine gap.

**What replaces it, and it is Tier 1 all the way down:**

- **The clock moved.** First marriages per 1,000 never-married, 2019: women 18–29 **46.3**, 30–39
  **65.2**, 40–49 **30.2**, 50–59 **15.0**. In **1990** the same series ran **86.5 / 59.9 / 17.2 /
  6.2** — monotone decline. **The modern first-marriage hazard peaks in the 30s, not the 20s**, and
  that is a change from 1990, not a constant. (Brown, Lin & Mellencamp 2022, *JMF* 84(4):1220–1233.)
  This lands directly next to `#the-wall`'s "slope, not a cliff" verdict and strengthens it.
- **The pool turns over.** Previously-married (divorced + widowed) as a share of the unmarried pool:
  women **11.8%** at 30–34 → **24.9%** at 35–39 → **37.8%** at 40–44 → **51.4%** at 45–49. Men run
  roughly a decade behind: **26.2%** at 40–44, **49.5%** at 50–54, **56.5%** at 55–59.
  **Independently verified by me** against ACS 2024 1-year table B12002 pulled from the Census
  Reporter API and recomputed from raw counts — every figure reproduced. One correction to the
  scout: **men do not cross the halfway mark until 55–59**, since 50–54 is 49.5%, just under.
  Disclosed on the page as an LE calculation, not as a published statistic.
- **Exogenous male income does not buy earlier exit.** Kearney & Wilson (2018, *ReStat*
  100(4):678–690) used the fracking boom as a shock to non-college male earnings: marital *and*
  nonmarital birth rates rose, **marriage rates did not**. Tier 1 quasi-experiment, and it bites the
  site's own money lever.

**Entry 32 is therefore reframed:** the market *does* clear in an order — just not the assumed one.
For the first decade it runs backwards on SES, the clock has moved a decade later than the folk
model assumes, and what actually changes with age is **turnover, not skimming**. This also upgrades
the Sixth Rung's re-entry claim, which shipped in batch 01 as a Lens with no instrumented source and
can now cite a measured composition curve.

### 4.3 S-3 returned — and it corrects my own thesis statement

I had written that the stock–flow error "makes transient states look permanent." **That is not
reliably true, and shipping it as stated would have been the exact sin the entry exists to name.**
Kennedy & Ruggles (2014, *Demography* 51(2):587–598) is a documented case running the *other* way:
the unstandardized divorce rate looked flat since 1980 while the **age-standardized rate rose 40%**,
because the married population aged out of high-divorce years. The period measure was
*optimistic*. The correct general statement:

> **A snapshot is biased toward whatever state has the longest dwell time.** That yields
> "transient looks permanent" when the transient state is the one being counted — and the reverse
> when composition drifts underneath you.

The three worked examples are also three *different* errors, which is the entry's best structural
move:

| Case | What the error actually is |
| --- | --- |
| "Half of marriages end in divorce" | A ratio of two incidence flows on **non-overlapping denominators** — a malformed statistic, not a biased one — plus a period-vs-cohort leap and a tempo effect |
| "A quarter never marry" | **Right-censoring** of an incomplete cohort read as completed |
| "Top 20% get 80% of likes" | The genuine **prevalence–incidence / length-biased sampling** case: an app snapshot over-samples those who stay in the pool longest, because successful daters exit |

**The strongest single finding in this scout, and it is Mythbuster-grade:** *no primary source
anywhere states "the top 20% of men get 80% of the likes."* The phrase is a Pareto template laid
over two unrelated Tier 3 claims — a 2015 Medium post based on **one fake profile and 27
self-reporting women**, and OkCupid's 2009 blog finding that women rated **80% of men below
median-looking**, which is a *ratings* distribution and not a likes distribution. The same OkCupid
post reported that women's actual *messaging* tracked the men's bell curve far more closely than
their own harsh ratings did. Treat 80/20 as **unsourced**, not merely low-tier.

And Bruch & Newman's real headline is close to the opposite of the doom reading: reaching above
your own rank is **the norm** for both sexes (men +26%, women +23%), and the authors write that
attracting someone out of one's league is entirely possible — it just takes 2–3× more messages.
Exact sample, from the supplement rather than the press release: **186,935 users** across four
metros, one month (January 2014), a single free platform. Tier 2.

**Useful lifetime numbers to replace the 50% with:** the true-cohort NLSY79 figure — among the
ever-married of the 1957–64 birth cohort, followed to 55, **46% had divorced at least once** — and
that cohort married straight through the divorce peak, so it is a ceiling rather than a forecast.
Current-conditions life tables put first-marriage dissolution near **42%** (IFS 2025, Tier 2,
synthetic cohort).

**Carried as UNVERIFIED across S-1/S-3 and excluded from the page:** the Pew men-vs-women split of
never-married-at-40 (I fetched the Pew piece directly — it says only "a higher share of men than
women had never married" and publishes no percentages, so the 28%/22% pair circulating in secondary
coverage does not ship); the Hinge women's Gini (0.324 vs 0.376 across sources); NLSY79 and NSFG
baseline sample sizes; Ginther & Zavodny's "at most 10%".

- **S-1 Composition/adverse selection** — Akerlof provenance; whether any formal marriage-market
  application exists; measured never-married vs ever-married differences by sex; selection-vs-
  protection in the marriage-health literature; and the strongest reason to reject the claim.
- **S-2 Exit order** — first-marriage hazard by age; whether exit order is measurably related to
  desirability; remarriage inflow by age band; and the negative-selection counter-argument
  developed properly, because it may be fatal.
- **S-3 Stock–flow** — Kennedy & Ruggles period-vs-cohort; the never-married projection; the
  provenance of the 80/20 claim; and the correct formal names (period vs cohort measure,
  prevalence vs incidence, length-biased sampling) for each of the three cases, which may differ.

Every entry ships with a `commonMisreading` and `boundaryCondition` in `data/canon-overlay.json`
authored against the three measured rules (decisive frame, no denial-cue negator, 10–18 words),
and fixture pins move in the same commit as the doctrine, per the standing rule.

## 4.4 Lab effects measured while shipping

1. **The canon widening rescued 3 more corpus passages** (2515 → 2518 swept). Same mechanism as
   batch 01's 114: the gate consumes canon surfaces, so a wider canon retains passages it
   previously set aside. **Widening a population is a measurement, not a change** — the band was
   regenerated and the ratchet re-checked, not argued with.
2. **The adjudication gate fired twice and was right both times.** First on the population change,
   then on 358 crossings after an index rebuild left the frozen band keyed to a stale build. Before
   regenerating the second time I verified the index build is **deterministic** (three consecutive
   builds, identical hashes) and that the sweep tool only *reads* the index — otherwise a
   regenerate-rebuild loop would have been possible and I would have been papering over it.
   Final state: **0 credible (blocking) · 516/516 weak · 4622 candidate-floor**, i.e. the weak
   ratchet held exactly where batch 01 left it and nothing new blocks.
3. **One IDF drift pin moved, 0.538 → 0.537** (`lab-analyzer.test.mjs`, the Availability weak
   match). Expected: IDF is computed across the canon, so every entry that adds text moves it. The
   pin's own comment history was extended rather than silently re-pinned — and this step is the
   first that moved *down while the population moved up*, which is worth recording because the
   previous down-step happened at an unchanged population.
4. Fixture pins moved in the same commit as the doctrine, per the standing rule: `conceptCount`
   476 → 479, `Rules & Frameworks` 35 → 38, misreading count 476 → 479, boundary count 470 → 473.

All seven authored misreadings were checked against the three measured rules programmatically
(10–18 words, decisive frame, no `MISREADING_DENIAL_CUES` negator) before the index was built.

## 5. What this batch will not claim

- That the pool's *average* falling means any individual's prospects fall by the same amount. It
  does not follow, and variance matters more than the mean at the point of one match.
- That exit order is desirability order, unless S-2 comes back with evidence that survives the
  negative-selection counter.
- Any lifetime divorce probability stated as a single number without its cohort and its measure.
