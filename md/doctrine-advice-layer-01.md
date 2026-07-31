# Doctrine invention — The Advice Layer (batch 04)

**Date:** 2026-07-31 · **Lane:** Claude (Opus 5, high effort), main loop + 3 Opus 5 research scouts
**Target surface:** `frameworks.html` — one new TOC group, three entries (34–36)
**Status:** SHIPPED. Entries 34–36, tested claims renumbered 37–39. Canon 488 → 491, Rules &
Frameworks 41 → 44. `npm run test:lab` green end to end including all three Python audits.
**All three entries were substantially rewritten by their evidence; the Saturation Rule was
rewritten twice.** See §5d.
**Chains from:** batch 01 (transaction layer, `1e64df7`), batch 02 (population layer, `b08f6d3`),
batch 03 (market container, `01f5d61`).

---

## 0. Collision control

Staking: TOC group **"The advice layer"**, entry ids `#saturation-rule`, `#survivorship-channel`,
`#virality-filter`. Tested claims renumber 34–36 → 37–39.

The `LE Lab Work` session holds `data/canon-overlay.json`, `data/le-canon-index.json`,
`tests/canon-index-fixtures.mjs` and `tests/fixtures/threshold-neighbors.json` for its own docket
item 2 (a match surface for `smv:looks:face` and `smv:looks:age`). **I handed those back at
01f5d61 and will not take them again until it says it is done** — this batch's HTML can be drafted
and spliced meanwhile, but the overlay/index/band pass waits.

## 1. The structural finding

Three batches have modelled the market itself:

| batch | what it priced |
| --- | --- |
| 01 transaction layer | what participating costs, what a claim is worth believing, who else votes |
| 02 population layer | who is in the pool, when they leave, what a snapshot licenses |
| 03 market container | the shape nobody chose — the ratio, and the geography |

**All of it models the market. None of it models the market for *advice about the market* — which
is the product category this entire site sits inside.**

That omission is not academic. Every reader arrives holding advice they got from somewhere, and the
site has never given them a way to price it. Worse: the site is itself a producer in that market,
and has never turned its own instruments on its own genre. The Calibration Error fenced our
*measurements*. Nothing fences our *recommendations*.

Verified against the live pages — grepped, not assumed:

| vocabulary | hits |
| --- | --- |
| `saturat` / `diffus` / `arms race` / `Red Queen` | **zero** as doctrine (one unrelated body-calc comment, one "diffuse withdrawal" phrase) |
| `Goodhart` / `Lucas critique` / `reflexiv` / `performativ` | **zero** (only "performative dominance" in the Frame lexicon entry) |
| `survivorship` | **zero** |
| `everyone does it` / `stops working` / `once everyone` | one line on `smvlevers.html` — that manipulative game "stops working on anyone worth keeping," which is about *authenticity*, not saturation |

## 2. The three entries

### 34 · The Saturation Rule — *The advice layer*

**A tactic's edge decays as it diffuses, because its value depended on other people not using it.**
Advice that works is advice that has not saturated yet.

The mechanism is the site's own Signal Cost Rule pointed at the advice market: a signal separates
types only while its cost differs by type. When a tactic becomes universal it stops carrying
information — the honest man who types his real height reads as short, and the man running the
same opener as everyone else reads as everyone else.

Strongest planned anchor: **post-publication decay of published market anomalies** — the cleanest
measured case anywhere of an edge dying because it was written down. If the magnitudes are as
expected it converts a plausible intuition into a measured one, in a domain where the data is
good, and the transfer to dating is explicitly LE's inference.

**The distinction that decides whether this entry is any good** (and which the scout was asked to
attack): saturation should apply to **positional** advice — things whose value is relative and
zero-sum, like an opener, a photo trick, a scarcity tactic — and **not** to non-positional
capability like fitness, income, conversational ease, or emotional regulation. If that distinction
survives, this entry is a usable filter. If it does not, the entry is a slogan and should be cut.

### 35 · The Survivorship Channel — *The advice layer*

**Dating advice is produced almost exclusively by people selected for having succeeded, or for
being able to sell — and the failures are invisible, so the advice looks better than it is.**

Two moves. First, the structural point: a strategy's advocates are drawn from its survivors, so the
observed success rate of any advice is conditioned on success. Second, and harder: **essentially
none of the popular genre has been tested.** The scout is checking whether *any* randomised or
quasi-experimental test of dating advice or coaching exists. If the answer is "essentially none,"
that absence is the entry — a whole industry of confident prescription with no measurement under it.

Fairness requirement, written into the brief: find where popular advice has turned out broadly
right despite thin evidence. An entry that only sneers is a worse entry.

### 36 · The Virality Filter — *The advice layer*

**The advice that reached you was selected by a distribution system optimising for engagement, not
accuracy.** Confidence, grievance and extremity travel; hedged accuracy does not.

Anchors sought: the large-scale measurement of false-versus-true news diffusion, moral-emotional
language and sharing, out-group animosity, and whether expressed confidence buys credibility
independent of accuracy.

**The claim this entry must NOT make**, and the scout was told to push on it: none of that licenses
"popular therefore false." It licenses the much weaker and much more defensible **"popularity is
not evidence of truth, and the selection pressure runs against nuance."** If the evidence only
supports the weak version, the weak version ships.

> **REVISED after S-F (2026-07-31). The weak version ships, and the entry's causal agent changes
> from the algorithm to the audience.** See §5b. My framing — "selected by a distribution system
> optimising for engagement" — is **contradicted where it has been tested**: in a large field RCT,
> switching Facebook users to a reverse-chronological feed *increased* their exposure to
> untrustworthy sources by **68.8%**. Turning the optimiser off made the information diet worse.
> Vosoughi likewise removed bots, re-added them, and concluded the differential was produced by
> **humans, not robots**. The honest entry blames the audience, which includes the reader, which is
> a far better entry than one blaming a faceless algorithm.

## 3. Why these three are one finding

| | the question | the error without it |
| --- | --- | --- |
| Saturation | does this still work? | treating a decayed edge as a live one |
| Survivorship | who is telling me this, and who isn't? | reading a survivor's account as a base rate |
| Virality | why did this reach me at all? | mistaking reach for evidence |

Together they price the advice, the adviser, and the channel — and the site has to accept all three
against itself. `frameworks.html` is a wall of confident recommendations; batch 02's Stock–Flow
Error already forced that discipline onto our statistics page, and this is the same move aimed at
our prescriptions.

## 5b. S-F returned — the mechanism is human, and the best result is about verification

**What survives, and it is enough to carry the entry:**

- **Vosoughi, Roy & Aral (2018, *Science* 359(6380):1146–1151)** — ~126,000 cascades, ~3M people,
  4.5M tweets, 2006–2017. Falsehood **70% more likely** to be retweeted; truth **never diffused
  beyond depth 10** while the top 1% of false cascades reached 1,000–100,000. Proposed mechanism is
  **novelty**, not accuracy. Robustness set of 13,240 cascades never touched by a fact-checker
  (κ = 0.88) reproduces it.
- **Rathje, Van Bavel & van der Linden (2021, *PNAS* 118(26))** — n = 2,730,215 posts. Each
  out-group term raises sharing odds **67%**, about **4.8×** the effect of negative affect and
  **6.7×** that of moral-emotional language.
- **The best single result in the batch — Sah, Moore & MacCoun (2013, *OBHDP* 121(2):246–255).**
  When advisors' accuracy is visible, overconfidence **backfires**. When it is *not* visible:
  confidence drives credibility (F = 7.82, p = .006) and persuasion (F = 9.05, p = .003) while
  **accuracy has literally no effect — F < .01, p = .99**. And people bought **less** verification
  from confident advisors (0.63 vs 1.58 purchases; 35% vs 53% ever bought). Dating advice is the
  no-feedback condition: outcomes are delayed, confounded, and never counterfactually observable.

**What has to be cut or demoted:**

1. **"The distribution system selects against accuracy" — contradicted, but not as cleanly as the
   scout had it.** Guess et al. (2023, *Science* 381(6656)): reverse-chronological feeds *raised*
   untrustworthy-source exposure **68.8%** on Facebook and 22.1% on Instagram, off baselines of
   2.6% and 1.3%. I verified those figures independently — and the same check surfaced a **2024
   technical comment in *Science*** the scout did not report: the study window overlapped Meta's
   emergency election period, **63 "break glass" news-feed changes**, reverted in March 2021. The
   measured effect stands; the inference about the *everyday* algorithm does not. The entry now
   uses it to bound a heavily-moderated feed, and leans the "audience not algorithm" conclusion on
   Vosoughi's bot analysis instead, which the objection does not touch.
   **This is the second time this session that independently checking a scout's "verified" fact
   changed what shipped.** The discipline earns its cost.
2. **"Popular ⇒ probably false" — demoted to a bounded footnote.** 70% more likely to be retweeted
   is a likelihood ratio of ~**1.7**, under one bit of evidence, and only *within the reference
   class of fact-checked contested rumours*. Most dating advice is not a checkable factual claim at
   all.
3. **Popularity is actually a weak *positive* signal.** Salganik, Dodds & Watts (2006, *Science*
   311(5762), n = 14,341): "the best songs rarely did poorly, and the worst rarely did well, but
   any other result was possible." High-variance, low-resolution, truncated at both tails.
4. **Sharing is not believing.** Pennycook et al. (2021, *Nature* 592): veracity has "little effect
   on sharing intentions, despite having a large effect on judgments of accuracy."
5. **My "extremity travels" phrasing conflates two things.** On the *consumption* side —
   Robertson et al. (2023, *Nature Human Behaviour*), 12,448 field RCTs, 205M impressions —
   negative words give **+2.3% CTR** per word, **anger is null (p = .666)**, and **moralised
   language *reduces* clicks (β = −0.024, p < .001)**. The outrage advantage is a *sharing* effect,
   not a reading effect.
6. **The moral-contagion number was overstated ~50%.** The famous 20%/word (Brady 2017) fell to a
   meta-analytic **IRR 1.13** across 27 studies and 4.8M observations (Brady et al. 2025) — after a
   critique showed that counting the letters **X, Y and Z** outperformed moral-emotional words as a
   predictor in 5 of 6 corpora (Burton et al. 2021).

**Two manosphere-specific numbers worth shipping:** only **36.3%** of 102 lay evolutionary
hypotheses extracted from manosphere content explicitly signal that they are speculative (Bachaud
et al. 2025, *Evolutionary Human Sciences* — Tier 3, exploratory, but it measures the *epistemic
form* of the claims rather than their tone). And in a sockpuppet audit, every fresh account was
served toxic content **within 23 minutes** (Baker, Ging & Andreasen 2024 — Tier 2/3, n = 10
accounts). The YouTube figure that circulates as "1 in 5" is **6.3% within five hops** in the
published version (Papadamou et al. 2021) — the site should use the correct number.

**The honest gap:** no study samples popular dating advice and scores it against evidence. The
ecosystem literature measures volume, toxicity and reachability well, and accuracy not at all.

## 5c. S-E returned — the charge is "unmeasured," not "false," and it needs two corrections

**Supported:** no randomised test of the coachable-tactic genre exists. The RCT literature in this
space covers relationship education for existing couples, dating-app safety, and dating-violence
prevention — not attraction, approach, texting or escalation. Negging has never been tested for
efficacy in either direction. The flagship mimicry-in-courtship experiment (Guéguen 2009, *Social
Influence* 4(4)) is **retracted**, its author carrying roughly twenty retractions, and it is still
cited as live evidence. Finkel et al. (2012, *PSPI* 13(1)) found **no compelling evidence** for
matching algorithms and reported finding no published paper explaining any site's criteria — the
nearest thing was authored by two employees of a dating company and said the algorithms must remain
proprietary.

**Correction 1 — "almost none of it has been tested" needs a carve-out**, and the exceptions are
the most useful evidence in the field: Egebark et al. (2021, *JPubE* 196, ~2,700 daters) — attractive
photos raise responses ~**20 points** for both sexes, and men are **5.1 points** less likely to
respond to a university-educated woman while women are indifferent to education; Bapna et al. (2016,
*Management Science* 62(11), **N = 100,000**) — anonymous browsing cut women's matches **4.09 → 3.51**
with no quality compensation; Joel, Eastwick & Finkel (2017, *Psych Science* 28(10)) — over a hundred
pre-date measures could not predict the pair-specific component **at all**, and that component was
the largest share of the variance. The precise claim is that the *coachable-tactic* genre is
untested, not the domain.

**Correction 2 — and this is the better entry.** I had written "the failures are invisible." They
often are not: Walster et al. (1973) published **five failed experiments** before the one that
worked, and Eastwick, Finkel & Simpson (2019) walked their own published effect from **r = .19 to
r = −.04** in print. The failures survive *inside the literature* and are stripped out on the way to
the advice. That is sharper and more defensible than invisibility.

**The specimen worth publishing.** Mirroring advice is widely justified by "a 2020 meta-analysis of
50+ studies, d ≈ 0.3." **I verified this myself rather than relaying it:** the paper those author
names point to is Hale, Ward, Buccheri, Oliver & Hamilton (2020, *Journal of Nonverbal Behavior*),
a **motion-capture study of 31 conversational pairs**. Not a meta-analysis, no fifty studies, no
such number. The genre does not merely lack citations — it manufactures citation-shaped objects.
The irony carried in the entry: mirroring is roughly right anyway, but the best design finds
**liking causes mimicry**, which then raises the partner's liking — a property of a pair going well
rather than a lever one person pulls.

**Fairness column, which the entry gives real space:** "fix your photos" is aimed at the largest
measured lever in the field; "get online" was right and earlier than the experts (Rosenfeld et al.
2019, *PNAS* 116(36)); attachment sits on a 132-study meta-analysis; and the uncertainty
researchers' own conclusion was that popular advice may simply be correct at first meeting.

**Held back as UNVERIFIED:** the Vicaria & Dickens coordination–rapport effect size, Dai/Dong/Jia's
sample sizes, Candel & Turliuc's exact correlations, and Wald's individual memo numbers. The
disputed question of whether Wald himself recommended armour placement is left unresolved on the
page rather than decided.

**A pleasing find for an entry about survivorship:** the Wald parable is itself survivorship-selected.
The memoranda are technical estimates of survival probability per hit; the famous red-dotted aircraft
was **drawn around 2005** for conference slides, and the quotable retort and resisting generals are
unsourced. The founding fable of survivorship bias survived because it was a good story.

## 5d. S-D returned — and it dismantled the entry I set out to write

The falsification condition in §2 was explicit: if the positional/non-positional split failed, the
entry was a slogan and would be cut. **It half-failed, and the replacement is better.**

**The decay is real and large.** McLean & Pontiff (2016, *JF* 71(1):5–32), 97 published predictors:
returns **26% lower out-of-sample** and **58% lower post-publication**. Roughly 42% survives — so
"once it is known it stops working" overshoots its own best evidence.

**But the mechanism is not knowledge diffusion, and three designs establish that:**

1. **Jacobs & Müller (2020, *JFE* 135(1):213–230)** — 241 anomalies across **39 markets**. The US
   replicates (60–65% post-publication decline); **none of the other 38 shows a reliable decline**.
   Journals are not national; arbitrage capital is. What diffuses is the *capacity to act*.
2. **Chen, Lopez-Lira & Zimmermann (2025)** — 29,000 data-mined predictors that were **never
   published** decay by about the same ~50%. Secret strategies decay like public ones.
3. **Ilmanen et al. (2021)** — adding a *pre-sample* window gives an unbiased arbitrage estimate:
   value **p = 0.76**, momentum **p = 0.70**. No detectable publication effect. (All five authors
   work for a factor-selling firm; disclosed on the page because it cuts in their favour.)

**Two nulls any saturation claim must beat first.** Psychology effects halve on plain replication
with zero diffusion — OSC (2015), **r 0.403 → 0.197**, 97% → 36% significant. And Allcott (2015,
*QJE* 130(3)), 111 RCTs over 8.6M households: effects fell **1.34% → 1.05%** purely because
programmes are deployed to their best sites first.

**The theory is sharper than the slogan.** Spence's endpoint for universal adoption is not collapse
but "stable prerequisites … that convey no information by virtue of their existence" — a compulsory,
resource-burning toll. And Grossman & Stiglitz (1980) proves an edge *cannot* decay to zero while it
is costly to acquire: an "equilibrium degree of disequilibrium." The best formal statement for a
**matching** market is Pathak & Sönmez (2008, *AER* 98(4)): sophisticated players' gains come
directly from naive players losing priority, and universal sophistication erases the edge.

**The result that breaks the folk version outright:** Wood & Quinn (2003, *Psych Bulletin* 129(1))
— forewarning moves people **toward** a message (d = +0.37), and warning of persuasive intent makes
it worse (d = +0.42). Resistance appears only under high involvement (d = −0.92) and vanishes when
involvement is low (d = −0.01) or attention is distracted. **"Everyone recognises that move now, so
it stopped working" is contradicted in exactly the low-involvement population of a dating app.**

**On my split:** positional holds (mating is demonstrably positional), but **cost of adoption** is
the better-supported variable and I had it third — promoted to the headline. Two additions I did
not have: capability doesn't decay *as capability*, but in a matching market equal improvement by
everyone leaves ranks unchanged, so "getting fitter never saturates" is **true about your life and
false about your rank**; and a **third category** exists — norms, reciprocity, consent conventions —
that get *more* valuable as they spread.

**The publishable absence:** nobody has ever measured a dating tactic decaying. A major site
analysed **500,000+ first messages** in 2009, published exactly which words drew replies, broadcast
it to millions — and never looked again. The perfect natural experiment was run and abandoned.

**Deliberately dropped:** Goodhart's Law (canonical sentence unverifiable against the 1975 primary,
and a large natural experiment on English hospital waiting targets found the targets simply worked);
the Lucas critique (its author called it a syllogism of "only occasional significance"; a later
literature found virtually no evidence for it); and the 44% banner-CTR figure (one person's
recollection, no instrumentation).

## 5e. Lab effects

- Swept population unchanged at **2408**; band regenerated with `--neighbors` and no `--baseline`.
- Adjudication unchanged: **0 credible / 516/516 weak** — the zero-headroom ratchet held again and
  no crossing needed hand-ruling, so no `--rule` was used.
- The Availability IDF pin moved **0.537 → 0.536**. Eight moves now, cumulative drift **0.003**
  against a minCredibleScore of 0.43. Recorded in the pin's comment history with that summary.
- **Two authored misreadings failed the denial-cue rule** on the word "false" and were reworded
  before the index was built — exactly the failure mode that flips an entry to *support* what it
  exists to reject. The programmatic check caught both.
- The Lab session's new guard (dd-05 / dd-28 pinned retained, claim-like and UNMAPPED) **did not
  fire**, as predicted — the advice layer reaches neither gap.

## 4. What this batch will not claim

- That saturation applies to capability. If the positional/non-positional split fails, the entry is cut.
- That popularity implies falsehood.
- That an absence of RCTs makes advice wrong. It makes it *unmeasured*, which is a different and
  more honest charge.
- Any transfer of the finance decay magnitudes to dating as if measured there. That bridge is a Lens.
