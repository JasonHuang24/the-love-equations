# The consumer unit — the last reader-visible loss the cultural-register merge left

2026-07-30. Canon **469 → 470**, `1.0.0+f263ae6219b9`. One new Lexicon term, two
aliases added to an existing one. No analyzer change.

## What was missing

`04-heteropessimism` argues about the ECONOMICS of coupling: marital consumption
as the shape the promised good life took, the couple as the primary consumer
unit, and its replacement by "a new dyad, the individual consumer and her phone."
The canon could only approximate that with `smv:multiplier:market`, so three
claims in that register reached no concept at all. They were the residual
`md/lab-gate-option2.md` recorded as the fifth of the five claims no gate option
rescues.

## What was authored

**`lexicon:term-the-consumer-unit`** — "The consumer unit", shared lens.

Aliases, all phrases: `consumer unit`, `primary consumer unit`,
`marital consumption`, `individual consumer`, `the couple as a consumer unit`.

Not one is a bare word, and that is deliberate twice over. `consumer` and `unit`
are both ordinary English and only the pair names the concept — and under gate
option 2a, shipped four commits earlier, a multi-word alias is also a **gate
surface**. This is the first piece of doctrine authored knowing that.

`privatizing function` and `privatizing function of heterosexuality` went onto
the existing `lexicon:term-heteropessimism` rather than becoming a second
concept. The claim that heteropessimism reinforces the privatizing function of
heterosexuality is a claim *about heteropessimism*; it belongs on the entry that
already exists.

## What it rescues

All three previously unrescued claims, and each of them twice over — through the
gate, and then to a concept:

```
gate: uncertain/named-canon-concept   ->  lexicon:term-the-consumer-unit  0.672
      "If the couple was the primary consumer unit of the past, today this has
       collapsed, or more accurately been replaced by a new dyad..."

gate: uncertain/named-canon-concept   ->  lexicon:term-the-consumer-unit  0.540
      "Quite often framed as an anti-capitalist position, heteropessimism could
       be read as a refusal of the good life of marital consumption..."

gate: uncertain/named-canon-concept   ->  lexicon:term-heteropessimism    0.610
      "In this sense, heteropessimism actually reinforces the privatizing
       function of heterosexuality..."
```

Every one is admitted by `named-canon-concept` — 2a — and would have been binned
without it. This is the coupling Jason ruled live, working in the direction it
was ruled for: **authoring doctrine widened the gate and filled the concept in
the same commit.**

## What the live coupling cost on the benchmark: nothing

This is the first canon change under the rule that canon authoring may move the
domain benchmark's thresholds. Seven new multi-word aliases entered gate scope.

```
domainRecall     1.000   unchanged
ignorePrecision  1.000   unchanged
junkRecall       0.844   unchanged
```

The coupling is a real risk and it did not fire here. One observation is not a
pattern; the value of the rule is that the next one is measured too.

## Threshold adjudication — 5 credible crossings, all gains

Sheet: [`lab-consumer-unit-threshold-adjudication.md`](lab-consumer-unit-threshold-adjudication.md).
Swept population 2,398 → 2,401 passages. Rulings 4,394 → 5,033, PENDING 4,880
(4,403 candidateScoreFloor · 472 minWeakScore · **5 minCredibleScore**).

| pair | before | after | recommended |
|---|---|---|---|
| `the-consumer-unit` · 04-heteropessimism · 20 | 0.000 | 0.672 | **ACCEPT** |
| `heteropessimism` · 04-heteropessimism · 26 | 0.000 | 0.610 | **ACCEPT** |
| `the-consumer-unit` · 04-heteropessimism · 19 | 0.000 | 0.540 | **ACCEPT** |
| `asking-fast-filters…` · 22-finkel · 198 | 0.429 | 0.430 | **ACCEPT** |
| `the-consumer-unit` · 22-finkel · 156 | 0.000 | 0.613 | **REJECT** |

The first three are the entries doing exactly what they were authored to do. The
fourth is +0.001 of IDF drift on an unrelated pair, the same family as
`stat-pay-to-play`, on "Such needs tend to be much more partner specific than
lower altitude needs."

### The fifth is a cost this doctrine bought, and it is stated rather than buried

```
"He also has to be your only romantic partner."   ->  the-consumer-unit  0.613
```

A claim about monogamy expectations matched to an entry about consumption. Blamed:

```
queryCoverage 1.000    canonCoverage 0.033
distinctiveShared  ["romantic"]
```

**One shared token, and queryCoverage of exactly 1.0.** The passage has a single
distinctive token after stopwords, so any entry containing `romantic` covers 100%
of the query. It is the mirror image of the numeral-coincidence defect ruled the
same day: there, four loose tokens and canonCoverage 0.036; here, one token and
queryCoverage 1.0.

Two things keep this from being an argument against the entry:

1. **It does not reach a reader.** `analyzeDocument` returns **zero displayed
   matches** for that passage — the admission guard rejects it even though the
   retrieval score clears 0.43. The sweep measures the retrieval layer and says
   so; the crossing is real there and invisible above it.
2. **It predates this entry.** `M-TBD-37` at 0.610 and `M-TBD-46` at 0.609
   already do the same thing to the same passage. The new entry is the third
   instance of a mechanism that was already there, not the cause of it.

REJECT is still the right recommendation, because the pair belonged below the
line and ACCEPT would record that 0.613 is the right answer for that sentence. A
REJECT here needs no new pin: the admission guard is already the pin, and it
holds.

## Pins moved in the same commit

Per the standing rule that a doctrine merge moves the canon-fixture pins and runs
`test:lab` in one commit:

```
conceptCount              469 -> 470
byCategory.Lexicon         83 -> 84
entries with a misreading 469 -> 470   (dark still 0)
entries with a boundary   463 -> 464
```

`tests/canon-index-fixtures.mjs` also gained a pin for the new term beside the
three cultural-register ones — title, phrase alias, one misreading, one boundary.

## The authoring contract, checked

```
misreading   "Marriage is purely an economic arrangement, so romance and
              attraction are marketing invented to sell households."
             16 words · decisive frame (marriage, romance, attraction) · no negator
             measured: relevant/explicit-relational-outcome, matches its own entry
             at 0.772 with stance CONTRADICTS
boundary     "This describes consumption incentives around coupling, and says
              nothing about how much any individual wants a partner."
```

13 test files at fail 0. 3 audits pass at v=2.6.7.
