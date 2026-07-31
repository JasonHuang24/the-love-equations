# The canon is reachable by people who already think like the site

2026-07-31. Measured, not fixed — the fix is not mine to choose and one of the
obvious ones is prohibited. Canon `1.0.0+07fb1c92bac5`, 491 concepts.

Downstream of `md/lab-face-age-match-surface.md`, which found that a
`commonMisreading` written in the entry's own vocabulary buys nothing because
anyone writing in that register could already reach the entry. The concurrent
doctrine session asked the obvious next question about the surface an author does
**not** choose the register of:

> the SYNOPSIS is harvested from my page prose, which is relentlessly analytic —
> "the terms of trade are set by whichever side is scarcer" is not how anyone
> states that claim in the wild. If the synopsis carries retrieval weight, every
> entry I have written is reachable by people who already think like the page and
> invisible to people making the actual claim.

It does, and they are.

## 1. The outcome: same claim, two registers

Three matched pairs, authored against their three newest entries — each pair
states one claim twice, once as someone would say it and once as the page says it.

```
frameworks:saturation-rule
  ordinary   not reached
  analytic   MAPPED 0.647  rank 1
frameworks:survivorship-channel
  ordinary   MAPPED 0.472  rank 1
  analytic   MAPPED 0.654  rank 1
frameworks:virality-filter
  ordinary   not reached
  analytic   MAPPED 0.765  rank 1
```

Every analytic probe maps at **rank 1** and clears the credible line by a wide
margin. Two of three ordinary probes do not reach the entry **at all**.

The ordinary probes are not strawmen. *"Every trick from those dating books
stopped working once every guy on the app started using it"* is the saturation
claim, stated the way it is actually made; it lands on a
`the-wine-at-my-place-move` sub-entry instead. *"The dating takes that blow up
online are the angriest ones, not the ones that turn out to be true"* is the
virality claim; it reaches a Mythbuster entry instead.

## 2. The mechanism: emptying the synopsis, and it is not uniform

Same probes, with `synopsis` emptied on those three entries only:

```
                             analytic probe        ordinary probe
saturation-rule     0.647 → 0.624  (−0.023)      unreached → unreached
survivorship-channel 0.654 → weak 0.419          0.472 → weak 0.379
virality-filter     0.765 → NOT REACHED          unreached → unreached
```

**For two of three the synopsis is the load-bearing surface**; virality-filter
collapses from a 0.765 rank-1 match to nothing without it, and survivorship-channel
falls out of credible entirely. **For saturation-rule it is not** — that entry
loses 0.023 and holds, because its six aliases (`alpha decay`,
`post-publication decay`, `limits to arbitrage`, `signal saturation`…) carry it.

So "the synopsis dominates" is true of most entries and not all, and the
difference is whether the author gave the entry a rich alias set. State it that
way rather than as a universal.

## 3. The control, which is the part that stings

`smv:looks:age`, the entry this run gave an ordinary-register misreading to
three commits ago:

```
  ordinary   "Men prefer younger women and a woman past thirty has a much
              harder time on the apps."               NOT REACHED
  analytic   "Looks are time-stamped, so the Clock multiplier discounts a
              woman's looks score with age."          MAPPED 0.731  rank 1
```

**One authored misreading moved a specific phrasing across the line and did not
move the register asymmetry at all.** `md/lab-face-age-match-surface.md` §6
already recorded that the market-register phrasing stays unreached; this says
why, and says it is structural rather than a gap in that one entry.

## 4. What this is NOT licence to do

**Rewriting synopses in ordinary register is prohibited**, and not incidentally —
the synopsis is harvested from the live page, so "fix the synopsis" is *rewording
a site page so a lexical matcher scores better*. `eb0f6cd` refused that and
everything since has too. The page's register is the site's voice and it is
correct for a reader; the matcher's difficulty with it is the matcher's problem.

The permitted remedy is the one the tranches already use: **authored surfaces** —
`commonMisreadings` and aliases, which exist precisely to say what the claim looks
like in the wild without touching the prose. This measurement says the current
dose is too small: one misreading per entry, authored to a 10–18 word bound,
against a synopsis of 40–60 words harvested from analytic prose.

Two directions that follow, neither of them costed here:

- **More authored surface per entry, not better authored surface.** The
  face/age pass found `smv:looks:age` has zero IDF headroom for a second
  misreading, so "add three misreadings to every entry" has a measured cost and
  is not free. This needs its own pass.
- **Aliases carry more than expected.** saturation-rule survived losing its
  synopsis on six aliases. The alias work this project has done was framed as
  precision-risk (`md/lab-generic-title-aliases.md` rejected four for buying
  false positives); this is the first measurement suggesting a rich, well-chosen
  MULTI-WORD alias set is the cheapest register bridge available. Note it is also
  a gate change under the live coupling (v2.6.6 option 2a).

## 5. Why it stops here

This is a canon-wide structural finding about 491 entries and the remedy is
doctrine authoring at scale. It needs scope only Jason has, which is the loop's
stated stop condition. Recorded with its instrument so the next pass starts from
a measurement rather than an intuition.

It also reframes a fact already in the record: `md/doctrine-distillation-lane.md`
observed that the Lab maps *statistical* sources well and *doctrinal* sources from
adjacent genres essentially not at all — 0% / 0% / 3.6% across three runs — and
called it "the instrument reporting the canon's actual shape". That is right, and
this is the shape: **the canon is written in the register of analysis, and the
sources it fails on are written in the register of argument.**

## Reproducing

```
synopsis-register.mjs   the three matched pairs, the synopsis-stripped variant,
                        and the smv:looks:age control
overlap-vs-growth.mjs   the growth-versus-overlap check, three canon points
```
