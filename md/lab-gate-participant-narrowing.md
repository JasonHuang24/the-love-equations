# The narrower participant design was built, and it does not work

v2.6.7, 2026-07-30. Recommendation 4 of
[`lab-gate-participant-vocabulary.md`](lab-gate-participant-vocabulary.md) asked
for an investigation before any widening shipped:

> require a participant from `human-individuals` or `human-groups`, not the
> pronoun frame, when `cultural-frame-mechanism` is the only mechanism that
> fired. If that holds, it may buy P1b, P3a and P3b's recall while binning all
> three of their costs, and `pv-07` with them.

It was built. **It does not hold.** What shipped instead is one third of P3a, for
a reason the investigation produced rather than the reason it predicted.

## Ten variants, built rather than argued about

Each row is a patched copy of `js/lab-analyzer.js` imported and measured, because
per-word reasoning about which case moves has been wrong twice this month.

```
variant                          cul/24  domRec  ignPrec  junkRec  pv-wrong  pairs
0  shipped (2a)                  15/24  1.000  1.000    0.844     1/12     2/8
1  narrow: individuals|groups    15/24  1.000  1.000    0.844     1/12     2/8
2  narrow: individuals only      15/24  0.988  1.000    0.854     0/12     4/8
3  P1b+P3a+P3b, no narrowing     18/24  1.000  1.000    0.813     4/12     0/8
4  P1b+P3a+P3b + narrow ind|grp  16/24  1.000  1.000    0.823     3/12     0/8
5  P1b+P3a+P3b + narrow ind      16/24  0.988  1.000    0.833     2/12     2/8
6  P3a + narrow ind              16/24  0.988  1.000    0.844     1/12     3/8
7  P3a concrete, no narrowing    15/24  1.000  1.000    0.844     1/12     1/8   <-- shipped
9  P3a concrete + P1b            17/24  1.000  1.000    0.833     2/12     1/8
```

`junkRecall` is a ratchet and may only rise from 0.844. `pairs` is the
minimal-pair split count and may only fall from 2/8.

### Variant 1 is a no-op

Requiring `human-individuals` or `human-groups` when the cultural frame is the
only mechanism changes **nothing** — not one case in four fixtures. There is no
passage anywhere in the benchmark, the pairs, the traps or the cultural set that
is retained on a cultural-only mechanism plus a bare pronoun. The clause the
recommendation proposed has no work to do.

### Variant 2 does real work, and costs more than it buys

Excluding `human-groups` as well is what kills `pv-07` — the software-packages
sentence retained because `parent` is a group noun and `culture` + `rewards`
fires the cultural frame. It also lifts `junkRecall` to 0.854.

It is still refused, on two counts:

```
expected-retain case lost:
  [cr-02] indirect-mechanism
  "Family law encodes one parent's interests as the neutral baseline when a
   household dissolves."
```

`parent` and `household` are precisely the vocabulary a family-law claim is
written in. The narrowing cannot tell that sentence from the monorepo one,
because at the level the gate operates they are the same sentence. And the split
count goes **2/8 → 4/8**, which the ratchet forbids outright.

So `pv-07` stays a known, frozen fail-open miss. It was ruled that way when it
was found and nothing here changes it.

### Every vocabulary widening that includes an abstraction breaks the ratchet

Variants 3, 4, 5 and 9 all drop `junkRecall` below 0.844. Blamed word by word,
the cost is always the same three:

| word | case it retains |
|---|---|
| `humanity` | pv-04 — "Humanity has always shaped its institutions around whichever resource was scarcest." |
| `anyone`, `everyone` | pv-08 — "The engineering culture rewards anyone who ships, and everyone else drifts toward the exit." |
| `i` | pv-11 — "Section i defines the terms and Table I lists the institutions that mandate reporting." |

`i` is the expensive one to lose: variant 9 shows P1b buying **two** cultural
claims for one junk miss. The ratchet does not trade, so it goes.

## What shipped, and the line it is on

Variant 7. Nine nouns into `human-individuals`:

```
boys girls guys sons daughters mothers fathers brothers sisters
```

```
domainRecall     1.000  unchanged
ignorePrecision  1.000  unchanged
junkRecall       0.844  unchanged
cultural recall  15/24  unchanged
minimal-pair splits  2/8 -> 1/8
```

**The rule is that a participant noun must name people, not a category of
people.** `mothers` and `sons` are people you could point at. `humanity`,
`anyone`, `everyone` and `a generation` are abstractions, and every one of them
was measured to cost a false positive of an identical shape — a generic human
word beside `culture` / `institutions` / `rewards`.

That is P2's rule applied one step further out, not the shape of "exclude the one
word that breaks the fixture". The distinction matters because this project
rejected exactly that shape as variant 2b of the gate options four commits ago,
and the difference is that 2b's exclusion had no statable reason and this one
does.

`the sexes` was in the candidate set and is **not** shipped. Measured with and
without it, the split closure is identical — it is `mothers` doing the work, on a
pair where both sides say "their mothers were taught to reject". Adding a term
that buys nothing measurable is how a vocabulary list stops being a measurement.

### The split it closed

```
keyed  Conditioning teaches WOMEN to want the qualities their mothers were taught to reject.
plain  Conditioning teaches A GENERATION to prize the qualities their mothers were taught to reject.
```

The plain side had no participant the gate recognised, so a claim about
conditioning was analysed in one wording and discarded in the other. `mothers` is
in both.

## What it does not buy

**Nothing on the corpus.** The swept population held at 2,398 passages across all
21 archived sources — the pin in `tests/lab-threshold-neighbors.test.mjs` would
have failed if a single passage had been rescued, and it passed. Cultural recall
held at 15/24.

This is a defect-count reduction, not a recall gain. It is worth shipping because
the split it closes is a real instance of the gate reading vocabulary rather than
subject matter, and because the ratchet it moves may only move this way. It is
not worth describing as more than that.

## What is left

`knownSplits` is 1. The surviving pair is `cr-conventions`. Cultural recall is
15/24; the nine unrescued claims are four participant-vocabulary cases that need
`i`, `anyone` or `humanity` and cannot have them under the ratchet, and five that
the cultural frame does not fire on at all.

The honest summary of the whole participant thread: **P2 and P3a-concrete were
free and shipped; P1b, P3b, `humanity`, `our` and `their` are all measured
losses; and the narrowing that was supposed to make them affordable does not
exist in a form that keeps `cr-02`.**

## Reproducing

```
participant-narrow.mjs   the ten variants against all four fixtures
participant-attrib.mjs   which split closes, and which case the narrowing loses
```
