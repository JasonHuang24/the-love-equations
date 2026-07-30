# Gate option 2 — canon-anchored admission. Free on recall, and it needs a ruling anyway

**Status: measured, recommended, NOT implemented.** No analyzer change. The reason
it stopped short of shipping is not the recall or the ratchet — both came out
well — but what it would do to the instrument that guards the gate.

## What option 2 is

A passage that names a **distinctive canon surface** is in the relationship domain
by construction, whatever the frame vocabulary says. Distinctive means a
multi-word alias — never a bare ordinary word like `appearance`.

Its appeal over option 1 was always the mechanism rather than the numbers: gate
scope gets extended by **authoring doctrine**, not by editing a regex. A concept
the site takes the trouble to name becomes a concept the Lab can recognise.

## Why the re-measurement was worth doing

Measured at decision time on 2026-07-30, before the doctrine landed, option 2
looked weak: **6/24** cultural recall for **2 units of the junkRecall ratchet**. The
recommendation then was to hold it until the vocabulary existed, because it "buys
little while the vocabulary is missing".

Re-measured after the cultural-register doctrine (`4b7b1a9`), P2 (`ca6dab2`) and
tranche 3 (`6dbc0b9`):

| variant | cultural recall | domainRecall | junkRecall | pairs | charged |
|---|---|---|---|---|---|
| shipped | 10/24 | 1.000 | 0.802 | 3/8 | — |
| 2 multiword + all typed standalones | **16/24** | 1.000 | 0.781 | 2/8 | ds-15, ds-16 |
| **2a multiword aliases only** | **15/24** | 1.000 | **0.802** | **2/8** | **none** |
| 2b multiword + typed, minus `rizz` | 16/24 | 1.000 | 0.802 | 2/8 | none |

Recall went **6/24 → 16/24**. The prediction held exactly: what the option was
short of was vocabulary, and three passes of doctrine supplied it. The six
admissions it now makes are all on surfaces authored this week — `the feminine
reality`, `feminine imperative`, `straight experience`, `straight culture` — plus
`hypergamy`.

(These junkRecall figures are the rig's, computed through intake, and read lower
than the suite's 0.844 because `classifyCase` in the benchmark forces one synthetic
claim-like unit instead. The comparison across rows is what matters, and it is
measured against a shipped row on the same instrument.)

## The whole ratchet cost was two cases and one word

Option 2's full cost is `ds-15` and `ds-16`, both anchored on **`rizz`**:

```
That new sneaker colorway has rizz, easily the best drop of the year.
The mascot has serious rizz and the crowd loved the whole halftime bit.
```

`rizz` is a typed standalone — a single-word alias curated onto `smv:charm` in the
alias pass. It is also slang that has escaped its domain: it gets applied to shoes
and mascots, which is exactly why the analyzer's own `minSingleAliasLength` floor
exists to distrust single words in the first place.

**2a is therefore the principled variant, not the tuned one.** Restricting
admission to multi-word aliases costs one case of recall against variant 2 (15
rather than 16) and gives back both junk misses, on a rule that states a reason:
one word is insufficient evidence. 2b — excluding `rizz` by name — reaches 16/24
and is listed only to show what overfitting to two benchmark cases would buy. It
should not ship.

So on its own numbers, **2a is free**: +5 cultural claims, one minimal-pair split
closed, `domainRecall` and `junkRecall` both untouched, nothing charged.

## Why it still did not ship

`localDomainRelevance` has no access to the canon. It takes a unit and reads four
vocabulary frames. Option 2 needs canon surfaces at gate time, so it needs them
threaded through `classifyDomainRelevance`, which has 35 call sites outside the
analyzer.

Adding an optional third parameter would be backward-compatible and is the obvious
move. It is also the trap this session hit twice:

> `classifyCase` in `tests/lab-domain-benchmark.test.mjs` calls
> `classifyDomainRelevance([...])` with no canon.

So the frozen benchmark — the instrument that IS the gate's acceptance contract —
would be structurally blind to the new admission path. Every threshold it reports
would be a true statement about a gate that is not the shipped gate. That is the
same shape as two findings already recorded this week: the threshold sweep reports
`scoreEntry` scores and cannot see admission changes at all (`fe31f47`), and the
participant options measured "free" because the ignore population contained none
of their vocabulary (`46f25b3`).

Fixing that means changing how the benchmark harness calls the gate, and that has
a consequence worth a human decision:

**Option 2 couples the two frozen instruments together.** Once gate scope depends
on canon surfaces, every future alias or lexicon row silently moves what the domain
benchmark measures. Adding a multi-word alias becomes a gate change. That coupling
is not a defect — it is the design, and it is the reason to prefer option 2 over
editing regexes — but the benchmark's thresholds are the project's review
stop-condition, and its own policy is that appends land in commits touching no
classifier code. Making the canon able to move those thresholds is a change to the
contract, not a feature behind it.

## Recommendation

1. **Adopt 2a**, multi-word aliases only, on the numbers above.
2. **Thread the canon into `classifyDomainRelevance` as a required-for-measurement
   argument, and update `classifyCase` in the same commit**, so the benchmark
   measures the gate that ships. An optional argument that the contract test
   declines to pass is worse than not shipping the feature.
3. **Reject 2b.** Excluding `rizz` by name is fitting the rule to the fixture.
4. **Decide the coupling explicitly** and write it into the benchmark's policy
   block: either canon authoring may move the gate (and the benchmark is re-run on
   every canon change), or option 2 reads a frozen snapshot of distinctive surfaces
   that is updated deliberately. The first is simpler and truer to the design; the
   second keeps the two instruments independent. I would take the first and say so
   in the fixture.

## Reproducing

Scratchpad rigs, session `79e4d688`:

```
gate-options.mjs     all five original options, re-run against the current canon
opt2-blame.mjs       which expected-ignore cases option 2 retains, and on which phrase
opt2-variants.mjs    2 vs 2a vs 2b against recall, both hard floors, and the pairs
```

## The five claims no option rescues

Unchanged from the original analysis, and still the honest limit:

```
Once I had gotten past the self-shame ... interlocking social conventions ...
What I did not understand was that this was part of my conditioning ...
The ridiculous, pathetic ... masculinity that 50 years of feminization created ...
In this sense, heteropessimism actually reinforces the privatizing function ...
Quite often framed as an anti-capitalist position, heteropessimism could be read ...
```

Four of the five are participant-vocabulary cases — see
[`lab-gate-participant-vocabulary.md`](lab-gate-participant-vocabulary.md), where
P1b, P3a and P3b are held pending the narrower design. The fifth needs a concept
for consumer-capitalism claims about coupling, which the canon still lacks.
