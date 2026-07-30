# Option 2a shipped: the canon is part of the gate, and the two instruments are now coupled

v2.6.6, 2026-07-30. Adopted by Jason with the coupling ruled **live**.

A passage that names a distinctive canon concept is in the relationship domain by
construction. Distinctive means a **multi-word alias phrase** — 843 of them
today, and not one bare word.

## What it does

`localDomainRelevance` gained a fifth input beside the four vocabulary frames. If
the frames would bin a passage and no affirmative non-domain evidence fired, but
the text contains a full canon phrase, the passage is retained as `uncertain`
with `reasonCode: 'named-canon-concept'`.

It never overrides a non-domain veto. A finance passage that happens to contain a
canon phrase is still a finance passage; this reaches only passages the frames
would bin for having no vocabulary at all.

The evidence entry is recorded whenever it fires, so a reader inspecting a
retained passage can see which concept the canon recognised.

## What it cost, measured

```
domainRecall      1.000   unchanged   (hard floor 0.9)
ignorePrecision   1.000   unchanged   (hard floor 0.95)
junkRecall        0.844   unchanged   (ratchet, may only rise)
cultural recall   10/24 -> 15/24
minimal-pair splits  3/8 -> 2/8
```

Nothing charged. The prediction in `lab-gate-option2.md` — 15/24, both floors
untouched, one split closed — held exactly.

The five newly retained cultural claims are all on surfaces the doctrine merge
authored six commits ago:

```
"...how the feminine reality frames the directions of our lives."
"Put simply, the feminine imperative will not allow this."
"Heteropessimism consists of performative disaffiliations with heterosexuality..."
"...extricate your own straight experience from straightness as an institution."
"Collectively changing the conditions of straight culture is not the purview of..."
```

This is the mechanism the option was chosen for: gate scope grew by **authoring
doctrine**, not by editing a regex.

### The split that closed

`cr-frame`, whose `plain` side had been the clearest single illustration of the
register gap:

```
keyed  "The operative frame in which men and women date is culturally manufactured."
plain  "The operative frame in which the sexes encounter each other is culturally manufactured."
```

The plain side has no participant vocabulary and no decisive relational frame, so
the gate binned it while retaining its twin. It now retains on **"the operative
frame"** — a concept the site authored in the retention doctrine merge. The
frozen verdict moved `irrelevant / no-human-relational-frame` →
`uncertain / named-canon-concept`, `knownSplits` came down 3 → 2, and the ratchet
in `tests/lab-gate-register.test.mjs` demanded both before it would go green.

### On the corpus, which no rig had measured

The frozen band's population pin — added hours earlier in `39415b2` — caught this
before any of it was written down:

```
The swept population is 2398 passages and the band was frozen at 2220.
```

**2a rescues 178 passages across the 21 archived sources**, contributing 27,403
scored pairs, of which **229 clear `minCredibleScore`**. Where they come from is
the sanity check:

```
 67  17-trent-south-sex-ratios          sex ratios and marriage markets
 45  08-mcnulty-early-marriage
 17  10-miller-alternatives
 14  18-li-necessities-luxuries
 13  21-hirschl-assortative-mating
  7  14-common-sense-ai-companions
  5  13-wheatley-counterfeit-connections
  4  04-heteropessimism
  2  02-fem-centrism
  2  11-ifs-genz-partner-priorities
  1  05-kim-generalizability
  1  19-zhang-preference-replication
```

A sex-ratio paper contributing a third of them is the register this option exists
for: social structure shaping mating, argued without a single "he asked her out".

**0 pre-existing pairs moved and 0 were lost.** Retention only widens, and a pair
already being scored is scored from the same unit against the same entry with
canon-derived IDF, so it cannot move. Same additive shape as the source widening,
and verified the same way rather than assumed.

## The part that is a contract change, not a feature

`tests/lab-domain-benchmark.test.mjs` — the gate's acceptance contract — now
loads the shipped canon and passes its surfaces to `classifyCase`. Jason ruled
the consequence explicitly:

> **Canon authoring may move the benchmark's thresholds, and the benchmark is
> re-run on every canon change.**

Adding a multi-word alias to `data/canon-overlay.json` is now a gate change. The
standing rule that a benchmark **append** lands in a commit touching no
classifier code is unchanged; what changed is that a canon commit is a commit
this benchmark can fail on. The policy is written into the file's own header, not
only here.

The alternative Jason rejected was a frozen snapshot of distinctive surfaces
updated deliberately, which keeps the instruments independent at the cost of
letting the snapshot go stale — the same failure that left the threshold sweep
reading three sources for a month.

### The argument stayed optional, so a test carries the contract

`classifyDomainRelevance(units, overrides, canonSurfaces)` has 35 call sites
outside the analyzer, most of them testing one frame's vocabulary in isolation
where a canon is noise. Making the third argument required would have added it to
all 35 to buy nothing.

So the argument is optional and a test enforces that the contract passes it:

```
test('the benchmark measures the gate that ships, canon included')
```

It pins an authored passage that no frame retains — *"Put simply, the feminine
imperative will not allow this."* — asserts it is binned with no canon, and
asserts `classifyCase` retains it with `reasonCode: 'named-canon-concept'`.
RED-verified by deleting the third argument, which produces:

> classifyCase is no longer passing the canon to the gate. Every metric in this
> file is now a true statement about a gate that is not the shipped gate.

`md/lab-gate-option2.md` refused to ship option 2 behind an optional argument for
exactly this reason. The argument is still optional; what changed is that
dropping it now fails a test instead of quietly succeeding.

## Everything else that had to move with it

`tools/lab-threshold-sweep.mjs` and `tests/lab-threshold-neighbors.test.mjs` both
pass the surfaces, because their population must be the product's population — a
sweep without them would have been short by exactly the 178 passages 2a rescued,
and every census it printed would have been quietly narrow. That is the same
defect the sweep widening fixed this morning, and it would have been reintroduced
by shipping 2a without touching them.

`tests/lab-gate-register.test.mjs` passes them too, and it matters most there:
those are minimal pairs, and 2a is precisely a mechanism that reads LE
vocabulary. Measuring the pairs against a canon-free gate would report a keyword
dependency the product does not have.

## What was rejected

**Variant 2b** — multi-word aliases plus curated single-word aliases, minus
`rizz` by name — reaches 16/24 instead of 15/24 and costs nothing on the
benchmark. It is not shipped. Excluding one word by name is fitting the rule to
the fixture, and the rule 2a states instead has a reason: one word is
insufficient evidence, which is the same reason `minSingleAliasLength` exists.

The two cases `rizz` costs are `ds-15` and `ds-16` — a sneaker colorway and a
mascot said to have it. Slang escapes its domain; a phrase does so far less
often.

## The five claims still unrescued

Four of the five are participant-vocabulary cases, unchanged by 2a and waiting on
the narrower design in
[`lab-gate-participant-vocabulary.md`](lab-gate-participant-vocabulary.md). The
fifth needs a concept for consumer-capitalism claims about coupling, which the
canon still lacks — and which is now, under the live coupling, a piece of
doctrine that will move this benchmark when it lands.
