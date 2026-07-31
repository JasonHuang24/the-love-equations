# Doctrine invention — The Market Container (batch 03)

**Date:** 2026-07-31 · **Lane:** Claude (Opus 5, high effort), main loop + 3 Opus 5 research scouts
**Target surface:** `frameworks.html` — one new TOC group, three entries (31–33)
**Status:** SHIPPED. Entries 31–33, tested claims renumbered 34–36. Canon 485 → 488, Rules &
Frameworks 38 → 41. `npm run test:lab` green end to end including all three Python audits.
**This batch also corrected two existing pages**, which is the part that matters most: see §4d.
**Chains from:** batch 01 (the transaction layer, `1e64df7`) and batch 02 (the population layer,
`b08f6d3`).

---

## 0. Collision control

A second session (`LE Lab Work`) is running in this same working tree. This document stakes:

- **New TOC group:** "The market container"
- **Entry ids:** `#sex-ratio`, `#effective-ratio`, `#local-market`
- **Renumbering:** Tested claims 31–33 → 34–36.

Two hard rules carried from batch 02, learned the expensive way:

1. `data/le-canon-index.json` and `tests/fixtures/threshold-neighbors.json` are derived from the
   whole of every source page. Rebuilding either while another session holds uncommitted page edits
   bakes their prose into my generated artifact. **Whoever commits second rebuilds.**
2. `git diff -U0` maps insertions to the *preceding* entry. To attribute changes, regex each
   `rf-entry` block out of HEAD and the working tree and compare blocks.

## 1. The structural finding

Batch 01 priced the transaction. Batch 02 priced the pool — who is in it, when they leave, and what
a snapshot of it licenses. All three of those still assume **one undifferentiated market**.

There isn't one. Every participant is in a *specific* market with a shape nobody chose: a **sex
ratio** and a **geography**. And the ratio sets the terms of trade for everyone inside it
**regardless of any individual's quality** — which makes it the one variable on this entire site
that is both first-order and completely absent from every instrument we have built.

The site asserts this and has never modelled it. Verified against the live pages:

| Where it appears | What it is |
| --- | --- |
| `smvlevers.html` Market multiplier | one sentence — "the same profile is a 6 in one city and an 8 in another, depending on the sex ratio" — tagged **Mixed**, citing Guttentag & Secord |
| `smvlevers.html` sub-variable + evidence row | "Geography & sex ratio", same single citation |
| `dd-what-the-wall-actually-is.html` | describes the **age flip** in prose: "the young surplus of single men becomes, decades on, an old surplus of single women" — no mechanism, no framework |
| `gender-dynamics.html` "you had easy mode" | the market-**density** intuition, stated as a regret and never generalised |
| `frameworks.html` | **nothing.** Zero entries in 33. |

Four assets gesture at the container; none names it. That is the same shape as the Third-Party
Layer in batch 01 and the Stock–Flow Error in batch 02, and it is the reliable signature of a real
doctrine gap on this site.

**One more reason this is overdue:** a prior audit recorded that Guttentag & Secord (1983) — the
site's *only* sex-ratio citation, load-bearing in three places — was **never actually reached**.
The batch has to fix that or stop citing it.

## 2. The measured spine (computed before the scouts returned)

Unmarried adults (never married + divorced + widowed), **men per 100 women**, US, ACS 2024 1-year
table B12002, computed from raw counts — an LE calculation, labeled as such:

| age | 20–24 | 25–29 | 30–34 | 35–39 | 40–44 | 45–49 | 50–54 | 55–59 | 60–64 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| men per 100 women | 109.0 | 115.6 | **118.5** | 112.9 | 105.5 | 94.9 | 90.2 | 85.9 | **78.9** |

Three things fall straight out, and all three are new to the site:

1. **The unpartnered market is never balanced at any age.** The nearest it comes to parity is the
   crossover, and everywhere else it is lopsided by 5–20%.
2. **The male surplus peaks at 30–34, not in the twenties** — 118.5 men per 100 women. That is the
   same age band where batch 02 found the first-marriage hazard peaks, which is unlikely to be a
   coincidence and is worth saying carefully.
3. **The crossover sits at ~45.** `dd-what-the-wall` asserts this flip qualitatively; this locates
   it and sizes it. By 60–64 there are 79 unmarried men per 100 unmarried women.

This spine is what makes the batch shippable even if the causal literature disappoints: the
*shape of the container* is measured, whatever one concludes about its effects.

### 2b. The discovery — the age flip is entirely a divorce-and-widowhood effect

I ran the same computation under three definitions of "in the market," to check whether the curve
was an artifact of my own definitional choice. It is not an artifact, but the choice **changes the
direction of the headline claim**, which is a finding in its own right. Men per 100 women:

| age | 25–29 | 30–34 | 35–39 | 40–44 | 45–49 | 50–54 | 55–59 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **A.** never-married + divorced + widowed | 115.6 | 118.5 | 112.9 | 105.5 | **94.9** | 90.2 | 85.9 |
| **B.** never-married only | 117.5 | 125.0 | 125.5 | 125.1 | **117.2** | 114.9 | **119.3** |
| **C.** A + separated | 114.8 | 116.3 | 110.0 | 102.6 | **92.9** | 89.4 | 85.3 |

**The never-married pool is male-surplus at every single age, 115–125 men per 100 women, and it
never crosses over.** The famous flip exists only in definition A — and it is produced entirely by
the divorced and widowed, because women outlive men and men remarry faster.

So `dd-what-the-wall`'s line — "the young surplus of single men becomes an old surplus of single
women" — is **true of the unmarried population and false of the never-married population.** Both
sentences describe the same country. That is precisely the composition trap batch 02 was written
to catch, appearing here in our own prose, and entry 32 is now built around it: *which pool you
count decides the direction of your answer, before any behaviour is considered at all.*

Column mapping for the separated and female blocks was verified against the API's own labels
(B12002096/103, 128/135, 158/165, 173/180) rather than inferred from offsets.

## 3. The three entries

### 31 · The Sex Ratio — *The market container*

**The terms of trade are set by whichever sex is scarcer, and no individual chose them.** The
scarcer side can hold out for more; the abundant side competes harder and concedes more. This
prices something the site's five levers cannot: two identical people in two markets face different
prices, and neither did anything to deserve it.

Guttentag & Secord's real contribution is the part the site never carried — their split between
**dyadic power** (the scarce sex's individual bargaining advantage) and **structural power**
(control of institutions), and their argument that the two can point in opposite directions. That
is a more interesting and more honest claim than "scarcity wins," and it is what the scout is
retrieving from the primary.

The evidentiary spine will be the natural experiments (Angrist's immigrant sex ratios;
Abramitzky et al. on WWI French casualties; Charles & Luoh on male incarceration; Wei & Zhang on
China), because those are instrumented and the correlational US literature is not.

**The limit that must ship in the body:** those experiments used *enormous* ratio shocks. If US
metro variation is small by comparison, then the mechanism is real and the local effect size is
modest — and saying so is the difference between doctrine and a horoscope.

### 32 · The Effective Ratio — *The market container*

**The ratio that matters is not how many exist, but how many are actually searching.** Headcount
and effective ratio can point in opposite directions, and this site already holds the data that
proves it: among singles 40+, **71% of women are not looking against 42% of men**
(`#stat-why-single`). Apply that to a 45–49 headcount of 94.9 men per 100 women and the *searching*
ratio moves hard in the opposite direction.

This is the entry that chains most directly off batch 02: the population layer established that a
pool's composition is not its headcount, and this applies that lesson to the ratio specifically.
The formal concept exists in behavioural ecology as the **operational sex ratio** (Emlen & Oring
1977) — receptive individuals, not living ones — and human demography has never had a clean
equivalent.

**Expected honest finding:** nobody has measured a searching-adjusted sex ratio for the US. If the
scout confirms that, the entry ships the arithmetic explicitly as **LE's calculation under stated
assumptions**, with the self-report weakness of "not looking" carried in the body — because people
who say they are not looking still partner.

**Now anchored on §2b, which is stronger than the original plan.** The entry has two stacked
corrections rather than one, and they compound in the same direction:

1. **Which pool you count flips the sign** (never-married stays male-surplus at every age; the
   all-unmarried pool crosses at ~45).
2. **Who is actually searching flips it again**, and the site's own `#stat-why-single` supplies the
   input: 71% of single women 40+ are not looking against 42% of men.

Two composition corrections, each large enough to reverse a confident claim, sitting underneath a
number the discourse quotes as if it were simply "how many men and women there are."

### 33 · The Local Market — *The market container*

**Nobody participates in "the dating market." National statistics describe nobody's actual
market.** A person competes in a metro, a campus, a workplace, a congregation — and those differ
from each other far more than the national aggregate differs from year to year.

This entry finally generalises the `gender-dynamics.html` "easy mode" card: what made school easy
was not youth, it was **density** — a large, age-matched, repeatedly-encountered pool with no
search cost. That is a market-structure fact, and losing it is a market-structure loss, not a
personal failure.

The actionable claim — *moving is a lever most people never consider pulling* — is the weakest
thing in the batch and I expect it to be unmeasured. If it is, it ships graded Lens and says so.

## 4. Evidence pass (in flight, 3 Opus 5 scouts)

- **S-A** — Guttentag & Secord from the primary (dyadic vs structural power); the instrumented
  natural experiments and their magnitudes; how much US metro ratios actually vary; strongest
  reasons to reject.
- **S-B** — operational sex ratio as a formal concept; the measured inputs to a US effective ratio;
  whether adjusting for "actually searching" flips direction in any age band; whether anyone has
  measured it; why self-reported "not looking" is a weak instrument.
- **S-C** — how much US local markets differ; the college sex-ratio claim graded honestly; whether
  geography still binds in the app era; whether moving works; market thickness theory versus its
  untested dating application.

## 4b. S-B returned — and it inverted my own hypothesis

I wrote in §3 that adjusting for who is searching would move the ratio "hard in the opposite
direction" at 40+. It does. **I had the direction backwards**, and shipping the concept as written
would have published a manosphere-flattering number that the arithmetic does not support.

| band | headcount | searching-adjusted |
| --- | --- | --- |
| 18–39 | 112.3 | **123.3** — no flip; the male surplus is *amplified* |
| 40–64 | 90.9 | **181.7** — flips |
| 40+ | 70.3 | **140.7** — flips |

The flip runs **in favour of older women**: an older *searching* woman is choosing among roughly
1.4–1.8 searching men. The apparent surplus of women in older bands is substantially a surplus of
women who have left the market. Every figure above was recomputed by me from ACS 2024 B12002 and
reproduces the scout exactly. (My first attempt returned suspiciously round numbers — 100.0 and
200.0 — from a PowerShell scoping bug; the corrected run matches on all six.)

**What ships is the break-even, not the point estimate**, because the threshold needs only the
census counts and inherits none of the adjustment's fragility:

> Given the headcounts, the female surplus at 40+ survives only if **fewer than 59.2%** of single
> women that age are out of the market. Pew measures **71%**.

**Fragility, stated rather than buried:** swap Pew's 2022 all-age rates in and the 40+ flip
collapses to 100.5 — dead parity. The **40–64** flip survives every scenario run (181.7 / 129.8 /
128.2), which is why that band carries the claim and the older ones do not.

**The verified gap:** nobody has published a searching-adjusted sex ratio for the US. The concept
is 49 years old (Emlen & Oring's operational sex ratio, 1977), the inputs are free and Tier 1, and
no one has multiplied them. Human demography refines on *suitability* (Goldman/Westoff/Hammerslough
availability ratios), never on search.

**The best counter, which ships in the body:** Harknett (2008, *Demography* 45(3):555–571) found
**crude sex ratios outpredicted refined availability ratios** on real relationship outcomes. That is
a direct shot at this entry's central instinct, and the defence is narrow — those refinements
adjust for suitability, and nobody has tested one for search behaviour. Also carried: MacDonald et
al. (2025, *PSPB*) found relationship *amotivation* predicted being partnered six months later, so
"not looking" is not "not available."

**Excluded:** all dating-app sex ratios. Every circulating figure (Tinder ~75% male etc.) traces to
SEO marketing pages with no sample or method. Only Pew's app-use figures ship.

## 4c. S-C returned — the third inverted claim

The entry splits into three claims that do not share a tier:

- **"Markets are local"** — supported, Tier 2. Bruch & Newman (2019, *Sociological Science*
  6:219–234): messaging partitions into **19 geographic communities**; Texas messages Texas even
  where out-of-state users are physically nearer. Bossard (1932): a third of 5,000 Philadelphia
  marriage licences were within five blocks.
- **"They differ enormously"** — supported and quantified. Employed single men per 100 single women,
  ages 25–34: **San Jose 114, Memphis 59** — a 1.9× spread. And the national figure moves **115 →
  84** on the employment filter alone.
- **"So move"** — **measured, and null.** Jang, Casterline & Snyder (2014, *Demographic Research*
  30(47), NLSY79, 7,827 people / 87,931 person-years): the naive migration→marriage effect is
  ~12% (OR 1.12), and correcting for shared unobservables takes it to **b = 0.04, p = 0.58**, with
  the process correlation σ = 0.24. The surviving arrow is the reverse: **marriage → migration,
  OR 1.33.**

Plus the recursion, which is the entry's best move: sex ratios "vary widely between submarkets"
*within* each city, so a metro number describes nobody for exactly the reason a national number
does. There is no level at which the aggregate becomes you.

**Thickness counters, both pointing away from the doctrine:** Li & Netessine (2020, *Management
Science* 66(1)) — doubling market size cut match rates ~15%; Petrongolo & Pissarides (2006, *EJ*
116(508)) — bigger markets raise realised quality but not match counts, because reservation
standards rise. Both are the Abundance Trap arriving from outside the dating literature.

**A genuine hole, stated on the page rather than filled with a survey number:** nobody has published
the *radius* — the median distance between matched or married US partners, before against after
online dating. Bossard 1931 is the last clean distance distribution.

## 4d. S-A returned — the causal core is stronger than we said, and our source was worse

Two findings, pulling in opposite directions, and both shipped.

**The mechanism is Tier 1 and replicated across four independent shocks** — none correlational:
Angrist (2002, *QJE* 117(3), immigrant arrival ratios as instrument, n ≈ 53,000 women): a one-unit
rise in the ratio raises women's ever-married by **0.150** and cuts their labour-force
participation by **0.099**. Abramitzky, Delavande & Vasconcelos (2011, *AEJ: Applied* 3(3), French
WWI mortality — 1.4M dead, **16.5%** of enrolled soldiers, near-uniform across ranks): a fall from
1.00 to 0.90 makes grooms **8.2 points** likelier to marry up and **18.5 points** less likely to
marry a bottom-three-class bride. Brainerd (2017, *ReStat* 99(2), Soviet WWII, ratio **0.60** for
the 1924 cohort): **+68** non-marital births per 1,000 unmarried women against a mean of 43. Wei &
Zhang (2011, *JPE* 119(3)): **+12.1 points** of household savings for son-families.

**But our own citation cannot carry any of it.** Guttentag & Secord (1983) argues from historical
episodes with no sampling frame and no identification strategy — Angrist himself describes it as
*recounting a number of historical episodes*. It is **Tier 3 as causal evidence** and the site's
"Mixed" tag was too generous. Worse, and disclosed on the page: **the primary is still unread** —
out of print, available only via library lending — so it was reconstructed from peer-reviewed work
quoting it. A site that grades other people's sourcing does not get to quietly cite an unopened book.

And the *norms* half of their theory **failed its direct tests**: Trent & South (2011, *Social
Forces* 90(1)) found high Chinese sex ratios produced *more* premarital and extramarital sex among
women, the opposite of the prediction; Dollar (2015, *Sociological Inquiry* 85(4), 65,443 census
tracts) found divorce behaved as predicted in **no** time period.

### The headline: America's imbalance is credentialed, not geographic

Men per 100 women, ages 25–34, **LE calculation from ACS 2024 1-year table B15001**, recomputed by
me from raw counts (the scout's 5-year figures differ by 1–3 points; the gradient is identical):

| attainment | HS grad | some college | associate's | bachelor's | BA+ | graduate |
| --- | --- | --- | --- | --- | --- | --- |
| men per 100 women | **140.0** | 108.2 | 85.0 | 87.8 | **80.7** | **67.0** |

Across US metros the same age band is nearly flat — median ~102, SD ~5, range ~91–116. Applying
Angrist's own coefficient to a move from the worst US metro to the best buys about **3.7 points**
of marriage probability. Sorting by credential moves the ratio **73 points**. A woman with a
graduate degree who requires the same is drawing at **67**, more lopsided than post-war France's
worst départements at 86 — the shock that measurably changed who married whom.

**The limit that keeps this from being a blackpill, and it ships in the body:** a credential is not
a dead generation. A degree gap binds only insofar as people insist on it, and they demonstrably
marry across education lines. The number is *the price of a filter*, chosen and revisable.

**The pressure test that should govern all sex-ratio talk:** Pollet, Stoevenbelt & Kuppens (2017,
*Phil. Trans. R. Soc. B* 372(1729)) correlated **110 theoretically unrelated variables** against
national adult sex ratios and got **35% significant at p = .05** — including *maximum elevation* —
with the sign reversing between national, state and county levels. Any correlational place-level
sex-ratio claim should be assumed noise.

## 4d-ii. The cross-page corrections (the "doctrine isn't only additions" half)

`smvlevers.html` carried the sex-ratio claim in three places on one Tier 3 source. All three moved:

1. **Market multiplier cite:** retagged **Mixed → Solid**, re-sourced to Angrist / Abramitzky /
   Brainerd, with the norms claim explicitly separated out as weaker.
2. **Market multiplier caveat:** previously implied changing your market was a live lever. Now
   carries the measured truth — metro spread is ~5 points, moving tested null, and the large
   imbalance is the credential one you carry with you.
3. **Exposure research rows:** the single "operational sex ratio" row became **two** rows — a
   `solid` bargaining-power row and a `contested` norms row citing the two studies that failed it.
4. **The word "operational" is gone site-wide.** It denotes individuals actively competing to mate;
   every study measures a headcount of adults. Borrowing a stricter term than the data supports is
   quiet overclaiming — verified 0 occurrences remain.

## 5. What this batch will not claim

- That sex-ratio effects measured under wartime casualties, mass incarceration or China's
  one-child imbalance transport at full size to a US metro with a 3-point skew.
- That the effective ratio is known. It will be computed under stated assumptions or not stated.
- That moving improves outcomes, unless S-C returns evidence that survives.
- Any causal reading of the age curve in §2. It is a cross-section, and batch 02's own
  Stock–Flow Error entry forbids reading it as a life course.
