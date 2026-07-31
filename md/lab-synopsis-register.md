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

**The mechanism half of the answer is yes and holds up. The outcome half does
not, and is withdrawn.** Read §4a and then §4c before quoting anything in §1: the
synopsis-emptying result reproduced independently across nine entries, and the
ordinary-versus-analytic table below turned out to be three probe *pairs* rather
than a fact about three entries. Six ordinary-register sentences about one claim
span *not reached* to *rank 1 at 0.540* against an unchanged index.

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

## 4a. CONTEST, 2026-07-31 — the finding survives, the instrument did not

The concurrent session extended the harness from three entries to nine, nearly
published *"only 2 of 9 reachable in ordinary register"*, and caught that it was
mostly their own probes. Every claim below was re-run here rather than taken on
trust.

### The harness bug, and it is mine

`probe()` opened with

```js
if (!s || s.unit.domainRelevance.status === 'irrelevant') return 'GATE-BINNED';
```

so `segments.length === 0` reported as **GATE-BINNED**. Those are different
failures: one is the domain gate rejecting a unit, the other is **no unit ever
forming**, with retrieval never running. Four of their nine ordinary probes
returned zero segments and read as *"the gate rejects ordinary register"* — a
much more alarming and completely wrong finding, and the gate is the thing anyone
would then have gone and "fixed".

Confirmed reachable, one claim in three framings:

```
bare conversational   segments 0   residual-pool  NO-UNIT
in a paragraph        segments 1   residual-pool  weak   0.473
declarative rewrite   segments 1   residual-pool  MAPPED 0.582
```

*"Anyone still single at forty is single for a reason, all the good ones got
taken years ago"* — comma-spliced, two clauses, conversational — produces
nothing. The same claim in a paragraph segments and reaches; rewritten
declaratively it maps. **The exact trigger is not isolated here** (splice, clause
count and length are all confounded in that probe); what is established is that
the failure is at segmentation, before the gate and before retrieval.

The label is now split: `NO-UNIT` when no segment forms, `GATE-BINNED` only when
a unit exists and the gate marked it irrelevant.

### §1 and §2 stand, checked

All six probes behind the published table formed units, so nothing in §1–§3
inherits the defect:

```
saturation-rule       ordinary not reached   analytic MAPPED 0.647
survivorship-channel  ordinary MAPPED 0.472  analytic MAPPED 0.654
virality-filter       ordinary not reached   analytic MAPPED 0.765
every probe formed a unit: YES
```

### The effect is real, directional, and NOT universal

Their corrected census over the five comparable pairs of nine: **three show the
asymmetry, one shows none, and one runs backwards** — `local-market` is reachable
in ordinary register and only weak in its own analytic vocabulary. So §1's
framing needs narrowing. **"The synopsis makes entries unreachable" is too
strong.** The honest statement is that the gap is common and directional, not a
property every entry has.

My own check of four extra entries adds one comparable pair and agrees:

```
clearing-order   ordinary MAPPED 0.485   analytic MAPPED 0.652   both reach
```

### And I reproduced the probe defect immediately after being warned about it

Three of my four new probes hit `NO-UNIT` — `local-market` ordinary,
`residual-pool` analytic, and `sex-ratio` in **both** registers. I authored them
in the same hurry the other session did, having just been handed the diagnosis.
**Probe authoring needs its own contract the way `commonMisreading` does:** one
declarative clause, no comma splice, and enough surrounding context to segment.
Until that exists, any register census is measuring the prose of whoever wrote
the probes.

### What survives, and it is a stronger version of the alias conclusion

They report six of nine entries unaffected by emptying the synopsis. I can
corroborate part of it on my own probes and not all of it:

```
residual-pool   ordinary  0.507 -> 0.514   unchanged, agrees
clearing-order  ordinary  0.485 -> 0.488   unchanged, agrees
clearing-order  analytic  0.652 -> 0.566   -0.086, the synopsis contributes
local-market    analytic  0.598 -> 0.511   -0.087, DISAGREES with their 0.404 -> 0.408
```

The `local-market` disagreement is a different probe, not a different answer —
theirs scored 0.404 weak where mine maps at 0.598, so the two measurements are of
different sentences and neither refutes the other. ~~**Recorded as unresolved
rather than averaged.**~~ **SETTLED — see §4b.**

## 4b. Settling the reversal, and there are THREE registers, not two

All four probes, both sessions', against one build. Nothing disagreed: every
number reproduced exactly.

```
theirs  ordinary   MAPPED 0.645 rank 1     synopsis emptied ->  MAPPED 0.645
theirs  analytic   weak   0.404            synopsis emptied ->  weak   0.408
mine    ordinary   NO-UNIT                 synopsis emptied ->  NO-UNIT
mine    analytic   MAPPED 0.598 rank 1     synopsis emptied ->  MAPPED 0.511
```

So there was never a conflict. What the two "analytic" probes are is **not the
same register**, and that is the finding:

```
theirs   "Local marriage markets vary substantially, but migration does not
          causally improve partnering outcomes."
mine     "Participation happens in a metro or a campus rather than in a single
          national dating market."
```

Where each probe's distinctive vocabulary lives on the entry's match surfaces:

```
migration   boundaryConditions only
metro       synopsis · aliases · boundaryConditions
market      synopsis · aliases · misreadings · boundaryConditions
move        aliases          moving  misreadings        city  misreadings · boundaries
```

**Their probe is written in the register of the entry's SOURCES; mine in the
register of its PAGE.** `migration`, `causally`, `partnering outcomes` are the
literature's terms and reach the entry only through a boundary condition.
`metro`, `campus`, `national dating market` are the page's terms and reach the
synopsis directly — which is why removing the synopsis costs mine 0.087 and theirs
0.004. Their hypothesis was right about the cause and slightly wrong about the
mechanism: `migration` is not absent from the entry, it is present on a *thin*
surface.

So the picture has three registers, and only two were named:

1. **Discourse register** — how the claim is made in the wild.
2. **Page register** — the site's analytic prose. This is what the synopsis is.
3. **Source register** — the cited literature's terms. This is what boundary
   conditions often carry, since they are where caveats from papers land.

The synopsis bridges (2) and nothing else. Boundary conditions partly bridge (3).
**Nothing bridges (1) except authored misreadings and aliases**, which is the
whole recommendation, arrived at from a third direction.

### The "reversal" is the mechanism working, not a counterexample

`local-market` reaches its ordinary probe at 0.645 rank 1 **and does not need its
synopsis to do it** (0.645 → 0.645). Look at why: its aliases are
`Local Market`, `market thickness`, `market density`, `metro sex ratio`,
`geographic sorting`, **`just move`**. The last one is an ordinary-register
alias — it is the sentence a person says, not a term an analyst uses. The
neighbouring entries do the same: `too many women` on `sex-ratio`,
`damaged goods` and `leftovers` on `residual-pool`.

**The one pair that ran backwards is the one whose author gave it
discourse-register aliases.** That is the strongest confirmation of the alias
recommendation in either census, and it arrived disguised as a counterexample.

Its author's own note on it is the generalisation worth keeping: those aliases
were written because they sounded like things people say, not from a theory, and
then the entry spent an hour being treated as a counterexample to the finding it
demonstrates. **When one case contradicts the pattern, interrogate the case
before rescuing the pattern** — the odd one out is where the mechanism is
visible, which is the same reason `md/lab-canon-alias-pass-01.md` says a frozen
expectation that breaks may have frozen the bug.

### Are multi-word aliases safe? Not by being multi-word

The standing remedy is now aliases, and the obvious worry is that
`md/lab-generic-title-aliases.md` rejected four aliases for buying false
positives. Those pull in opposite directions only if word count is the variable.
From measurements this project has already made:

```
single token, typed      face · body · age · game     +75 credible, NONE right
multi-word               younger women                 1 gain, WRONG (a harassment stat)
multi-word               facial attractiveness         a lateral swap, buys nothing
multi-word               cope with · is cope           3/4 intent, 0/3 false positives
multi-word               just move                     reaches the ordinary claim, 0.645
```

**Multi-word is not the safety property.** `younger women` is multi-word and
wrong. The distinguishing feature is what the phrase NAMES: `just move`,
`damaged goods` and `cope with` name the CLAIM; `younger women` and `age` name
the POPULATION OR TOPIC the claim is about. A phrase that names the population
fires on every passage describing that population, which is the fourth failure
shape whatever its length.

That rule is stated from existing data and ~~**has not been tested
prospectively**~~ **was tested prospectively the same day —
`md/lab-alias-naming-rule.md`.** The result in short:

- **The test is VOID for the half that matters.** Only 1 of 32 PREDICATIVE
  aliases occurs anywhere in the archive, so the class has no population and a
  null says nothing. The single hit is a book title.
- **Which means the discourse-register recommendation in §2 and §4b rests
  entirely on authored probes.** `just move` reaches an authored sentence at
  0.645 and occurs **zero times** in twenty-one sources. The archive can neither
  confirm nor refute the remedy this document recommends.
- **The surviving half sharpens the axis**: it is not claim-versus-population, it
  is **CONCEPT versus population**. `physical attractiveness` (84 hits) *is* the
  looks lever and lands on claims; `previously married` (3 hits) is a demographic
  category and lands on a figure axis label. Naming the concept is necessary and
  not sufficient — `age` names its concept exactly and still fails, because the
  token's presence is not evidence.
- **331 of 360 multi-word aliases never occur in the archive at all.**

What both censuses agree on is the shape: **the synopsis carries an entry only
when the alias set does not already cover the claim's vocabulary.** Where it
carries, that is the signature of a thin alias set rather than of an analytic
register as such. That is a better statement of §2 than §2 makes, and it sharpens
the recommendation: the cheapest lever is multi-word aliases, not prose.

## 4c. The outcome half does not survive its own sample size

The other session tested the standing remedy in memory and reported the thing
that undoes §1: four contract-compliant ordinary-register probes **already
mapping at rank 1** (0.434 / 0.540 / 0.605 / 0.622) against the same two entries
whose ordinary probes came back NOT REACHED in both censuses.

Checked on my own probes, because I have a stake in the finding surviving and
that is precisely when to generate the sample before looking at it. Twelve
probes, six per entry, all authored to the contract and written into the rig
before it was run once:

```
frameworks:virality-filter        comparable 5/6   MAPPED 0   range 0.000–0.000
frameworks:survivorship-channel   comparable 6/6   MAPPED 3   range 0.000–0.540
```

**`survivorship-channel` settles it.** Six ordinary-register sentences about the
same claim, against an unchanged index, span *not reached* to *rank 1 at 0.540*:

```
MAPPED 0.540   "Dating coaches are the people who happened to succeed and then
                started charging for the story."
MAPPED 0.481   "The guys selling dating advice all say it worked for them and
                none of them ever tested it."
MAPPED 0.466   "Nobody who failed with this dating advice is around to tell you
                that it did not work."
weak   0.388   "You only ever hear from the people the dating strategy actually
                worked for."
weak   0.331   "The dating advice industry is built on men who got lucky once and
                called it a method."
not reached    "A dating guru's track record is the guru telling you about his
                own track record."
```

**"Ordinary register" is not a condition. It is a wide distribution of
phrasings, and both sessions sampled it about four times each.** The
between-probe variance swamps the between-register difference at that n.

### What survives, and what is withdrawn

**WITHDRAWN — the outcome claim in §1.** That table is three probe *pairs*, not a
characterisation of three entries, and it should never have been written as
though a single ordinary probe could establish that an entry is unreachable in
ordinary register. §4a narrowed it from "universal" to "common and directional";
this withdraws the directional claim too, at this sample size.

**SURVIVES — the mechanism in §2**, and the reason it survives is structural
rather than lucky: **the synopsis-emptying test holds the probe constant and
varies the index.** Every probe is its own control, so between-probe variance
cannot contaminate it. That is why it reproduced cleanly across nine entries in
two independent censuses while the outcome half did not reproduce across four
probes in one.

**UNRESOLVED, and worth someone's scope.** Pooling both sessions, `virality-filter`
is reached by 2 of 8 ordinary probes and `survivorship-channel` by 5 of 8. That
gap may be real and may track the alias set — `survivorship-channel` carries
`dating coach` and `untested advice`, `virality-filter` carries
`engagement optimisation` and `moral contagion` — but n=8 per entry cannot
support the claim and it is recorded as a hypothesis, not a result.

### The methodological rule this leaves

**Do not publish a register claim off a handful of probes, in either direction,
and do not let the person with a stake in the answer author the probes.** Both
sessions found what they went looking for before catching themselves — one
hoping to confirm a defect already announced, one hoping to confirm a finding
already published, ten minutes apart. A real register measurement needs a probe
set an order of magnitude larger, authored by someone with no position on the
outcome.

The remedy measurement they ran is worth keeping regardless: multi-word
ordinary-register aliases on two entries moved two of four probes by 0.13–0.15
with **no measured collateral** — `smv:looks:age` and `saturation-rule` both
unchanged. That is a mechanism result of the same shape as §2, for the same
reason: the probe is held constant.

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
synopsis-register.mjs    the three matched pairs, the synopsis-stripped variant,
                         and the smv:looks:age control. CARRIES THE LABEL BUG —
                         use round 2 instead.
synopsis-register-2.mjs  NO-UNIT split out from GATE-BINNED, the three published
                         pairs re-verified, the four-framing demonstration, and
                         four more entries
overlap-vs-growth.mjs    the growth-versus-overlap check, three canon points
local-market-settle.mjs  both sessions' probes on one build, plus which surface
                         each probe's vocabulary lives on
register-variance.mjs    twelve probes, six per entry, authored before the rig
                         was run once — the sample that withdrew §1
```

**Do not reuse `synopsis-register.mjs`.** It is kept only because §1–§3 were
measured with it and every probe behind them was verified to form a unit; its
`GATE-BINNED` label is wrong for the `segments.length === 0` case and that is
exactly the confusion §4a is about.
