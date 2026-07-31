# The retention gap, measured: one artifact closed, two open, and they are different problems

2026-07-31. No canon change. One guard in `tests/lab-match-behavior.test.mjs`,
one record. The planned finding was wrong on its first leg and the measurement
is the useful part.

`md/claude-doctrine-checkpoint-01.md` recorded the retention gap as the site's
biggest structural hole and proved it with three artifacts inside this repo,
"three independent pieces of evidence that the site already knows". None had
ever been measured. Measured now, against canon `1.0.0+7a8b16547d89` at 488
concepts and all 21 archived sources (2,515 retained segments), they do not say
the same thing any more.

Every figure below was taken twice: first at canon 479 and again at 488 after a
concurrent session landed two batches mid-run. **Not one conclusion moved** —
the largest drift on any published number was 0.001, and the RED check
reproduced exactly. A finding that survives nine new concepts is a different
kind of claim from one measured once, so the second pass is stated rather than
quietly substituted.

## Artifact 1 — CLOSED, and nobody had noticed

> `js/lab-analyzer.js` ships a severity-3 tension `selection-retention-collapse`
> whose evidence field names exactly what the canon would need. The Lab detects
> the collapse and has no rung to route it to.

It has six rungs now. The retention doctrine merge shipped
`frameworks:retention-gap`, `replaceability-asymmetry`,
`mate-retention-intensity`, `desire-maintenance-split`, `satisfaction-flywheel`
alongside the pre-existing `conversion-ladder`. The tension fired once across
the archive and routed to `frameworks:mate-retention-intensity` at 0.575 —
correctly, on a Conroy-Beam passage about mate preference fulfilment and
retention behaviour.

**The checkpoint was never updated, so a gap read as open for a month after it
was filled.** A frozen epoch is the right instrument for an analysis and the
wrong one for a status; the epoch stays frozen and this record is where the
status lives.

## The tension is structurally blind, and it does not matter

`pressureForResult` opens `const primary = result.matches[0]; if (!primary)
return [];`. A tension only fires on a MAPPED passage, so
`selection-retention-collapse` can report the collapse only where the canon
already reached — it is blind by construction to the passages that *constitute*
the gap it names.

That is true and it is not load-bearing:

```
passages whose TEXT satisfies the tension's own predicate, 2,515 retained
  selection-retention-collapse    mapped  1  ·  UNMAPPED  4
  attraction-selection-collapse   mapped 39  ·  UNMAPPED 17
```

All four counts are identical at 479 concepts and at 488.

Five passages in the whole archive, and the four invisible ones were read:
a woman who dated before marrying, a survey variable definition, an
experimental protocol, a historical periodisation. **All four are false
triggers** on ordinary uses of `date` / `chosen` / `pair` beside `marriage`.
The blindness ratio is no worse than the sibling tension's. Building anything
for a population of four false positives would be building for a population
that does not exist. **Closed with a record, not fixed.**

The predicate was extracted from `js/lab-analyzer.js` **as source text** rather
than retyped, and the extractor asserts it found exactly two halves — a hand
copy beside a thing is this project's recurring silent-omission defect.

## Artifacts 2 and 3 — both open, and they are not one finding

The benchmark labels both `direct-domain` / `retain`: the acceptance contract
asserts this territory is in-domain canon material. Both are retained by the
gate, both are claim-like, and neither maps.

```
dd-05  "Physical attraction fades in a long relationship unless it is renewed
        by shared novelty."
       unmapped · band 10 · nearest 0.410 hierarchy:…:alignment-in-values
       64 candidates above the floor, and NOT ONE of the six retention entries
       reaches the working set of eight

dd-28  "The best predictor of a lasting marriage is how the couple handles
        contempt."
       unmapped · band 1 · nearest 0.278 hierarchy:…:provision-capacity
       17 candidates; best retention entry satisfaction-flywheel at 0.232,
       under the weak floor
```

**dd-05 is a RETRIEVAL failure.** `frameworks:desire-maintenance-split` is
exactly this claim's home — one of its own misreadings is *"Desire declines with
familiarity, and that is one settled finding"* — and it does not reach the top
eight of sixty-one. The entry speaks `desire decline` / `sexual desire decline`;
the claim says `attraction fades` … `renewed by shared novelty`. Disjoint,
synonym for synonym. The doctrine is present and unreachable.

**dd-28 is a DOCTRINE gap.** Nothing in the canon is about conflict repair or
contempt; the nearest concept in 479 is about provision capacity, which is a
claim about money. Checkpoint 01 already ruled on the difficulty — C1a's
empirical recurrence is one research program (the Gottman lab), so the accuracy
critique must ship inside any future entry — and that ruling stands untouched.

Both cases are unchanged at 488 concepts, including the shape of the failure:
dd-05 still has no retention entry anywhere in its working set of eight, and
dd-28's only retention neighbour is still `satisfaction-flywheel` at 0.232.

**Bundling these two as one gap is what made the gap look unfixable.** One is
tranche work and costs an afternoon; the other needs doctrine Jason has not
scoped.

## Measured: one authored misreading closes dd-05

RED-checking the guard required proving its condition is reachable. Adding a
single `commonMisreading` to `frameworks:desire-maintenance-split`, authored
against the three measured rules (10–18 words, decisive frame, no
`MISREADING_DENIAL_CUES` negator) and carrying dd-05's own vocabulary rather
than the entry's research register:

> Attraction always fades in a long relationship, so couples who want desire
> must keep chasing novelty.

```
             before                                    after
  dd-05      unmapped, best 0.410 to alignment-in-values
             ->  MAPPED 0.486 frameworks:desire-maintenance-split
  dd-28      unmapped, best 0.279                       unchanged
```

Exactly the split the diagnosis predicts: the retrieval gap closes on a match
surface, the doctrine gap does not move.

**NOT SHIPPED**, and the reason changed during the run. It began as "a
concurrent session holds `data/canon-overlay.json`". A window opened, item 2's
face/age surfaces went in at `8232ed5` — and then measuring this one for COST
rather than reach gave it a better reason to wait. See §7.

## 7. Measured for cost, and stopped one step short

Reach is not shippability. The face/age pass rejected nine of eleven candidates
on cost alone, so this one was put through the same instrument: displayed
credible **and** displayed weak across all 21 sources.

**The first draft is the one §6 quotes, and it should not ship.**

```
"Attraction always fades in a long relationship, so couples who want desire
 must keep chasing novelty."
      credible  +1 / -1        weak  +13 / -11        dd-05 MAPPED 0.484
```

Its credible GAIN is *"Despite what people desire in a mate, they cannot always
get what they want"* — the word `desire` in the wanting-a-partner sense, not the
sexual-desire sense the entry is about. A sense error, and the same family as
every alias the face/age pass rejected.

**The second draft removes the ambiguous token and is materially better:**

> Attraction fades once a couple gets comfortable, so a long relationship needs
> constant novelty to stay alive.

```
      credible  +0 / -1        weak  +11 / -10        dd-05 MAPPED 0.484
```

Same reach, no wrong credible gain, and it picks up a genuinely right nearby
concept the first draft did not: *"the frequency with which a couple has sex
declines markedly over time in most long-term relationships"* → 0.357. That
sentence is the entry's subject stated plainly.

**Dropping the bare word `desire` from a misreading on the
desire-maintenance entry is what fixed it** — the same rule the face/age
survivors demonstrated, applied to a token instead of a register: write the
claim in the words the claim is made in, and avoid a token whose ordinary sense
lives in the same domain as the concept.

**Why it still does not ship.** Its one credible LOSS is *"We predicted that
mate retention behaviors would be positively related to relationship
satisfaction"* at 0.431 — arguably a correct loss, since that sentence belongs to
`frameworks:mate-retention-intensity` rather than here. But a `minCredibleScore`
loss is a **blocking crossing** by standing rule, with no volume exception, and
HEAD already carries one unruled crossing from `8232ed5` waiting on Jason.
Stacking a second blocking verdict on an unruled first one is not a measurement
problem, it is a scope problem — and the loop's stop condition is exactly *"needs
scope only Jason has"*.

So this closes as **measured, drafted, and one ruling away**. Apply the second
draft to `frameworks:desire-maintenance-split` in `data/canon-overlay.json`,
rebuild, sweep, and adjudicate the single expected credible loss. `conceptCount`
does not move; the entry already carries two misreadings, so no fixture pin
moves either.

Reproduce: `dd05-cost.mjs`.

## 8. SHIPPED — dd-05 is closed, canon `1.0.0+dbc262abfc7e`

Jason ruled the face crossing ACCEPT at `b6de5a7`, which was the ruling this was
waiting behind. The second draft went in unchanged, 491 concepts both sides, no
fixture pin moved.

```
dd-05   unmapped, best 0.410 to the wrong entry
   ->   MAPPED 0.484  frameworks:desire-maintenance-split
dd-28   unchanged, and still the doctrine half
```

**The credible-line crossing this produced is a LOSS and it is the right one.**

```
frameworks:desire-maintenance-split   0.431 -> 0.429
"We predicted that mate retention behaviors would be positively related to
 relationship satisfaction."
displayed now: mate-retention-intensity@0.643 · satisfaction-flywheel@0.457
```

That sentence is about mate retention behaviour, and `mate-retention-intensity`
holds it at **0.643** — far above the entry that let go of it. A marginal second
match leaving while the correct home sits 0.21 above it is the matcher getting
*more* right, not less. **Recommended ACCEPT; left PENDING, because that line is
Jason's by standing rule and nothing here carries a machine verdict on it.**

> **When it is ruled, it is TWO edits, not one** (see
> `md/lab-face-age-adjudication.md`): set
> `counts.pendingByThreshold.minCredibleScore` to **`0`** rather than deleting the
> key — a deleted key compares `undefined` against a counted `0` and fails with
> *"recorded PENDING count … disagrees with the rulings"*, which reads like the
> ruling did not take rather than like a missing key — and bring `counts.pending`
> down with it, or test 1 fails on internal consistency.

Eleven `minWeakScore` crossings, all on the edited entry, ruled by key with
`ruledBy: Claude` — **5 ACCEPT / 6 REJECT**, and the weak backlog held at exactly
516. The six REJECTs are honest and worth stating rather than absorbing:

- four are gains on **methods and affect prose** — sample-inclusion criteria, the
  role of anger, positive affect predicting intactness, Gottman on affect. The
  misreading contributed `couple` / `relationship` / `long`, and those fire on any
  longitudinal-couples paper.
- two are **losses of correct neighbours** — satisfaction predicting changes in
  couples' sexual frequency, and sexual satisfaction predicting marital
  satisfaction. Both are this entry's own subject, both dropped 0.002 out of the
  band. Costed and recorded rather than waved through.

Ratio: 6 of 11 wrong, against the face/age patch's 6 of 15. **This is the more
expensive of the two surfaces**, and it bought a documented gap closure the site's
own acceptance contract had been asserting since Checkpoint 01.

The guard in `tests/lab-match-behavior.test.mjs` now asserts dd-05 **maps, and
maps to the entry the surface was authored on** — mapping to the wrong home is a
different outcome from mapping. RED-verified by removing the misreading from
`data/canon-overlay.json` and rebuilding:

> dd-05 no longer maps. The match surface on
> `frameworks:desire-maintenance-split` is what closed this gap; losing it
> reopens the retrieval half of the retention gap.

dd-28 keeps its original assertion with a sharper failure message: it is the
doctrine half, so its closing means doctrine landed.

Reproduce: `dd05-cost.mjs` · `read-crossings.mjs` · `rule-weak-dd05.mjs`.

The canon was mutated **in memory** for this check. That is legitimate here and
would not be for `tests/canon-index-fixtures.mjs`, which calls
`buildCanonIndex()` and never reads `data/le-canon-index.json` — patching the
artifact there certifies a guard that was never exercised. The analyzer
genuinely consumes the artifact, so an in-memory patch of it runs the real load
path through `prepareCanonIndex` → `normalizeEntry`.

## The guard

`tests/lab-match-behavior.test.mjs` freezes the split so a later pass cannot
move it silently: the six retention entries must stay in the canon (artifact 1
cannot silently reopen), and dd-05 / dd-28 must stay retained, claim-like and
unmapped. It asserts the CONDITION, not the scores, and reads both sentences out
of the domain benchmark rather than copying them, because they are the
acceptance contract's own text.

Asserting the condition rather than the numbers is what let this survive the
canon moving 479 → 488 underneath it mid-run without a single edit.

Either case mapping fails the suite with the instruction rather than a number:

> dd-05 now MAPS, to … That is a retention gap closing and it is good news —
> record which of the two it was (dd-05 is retrieval, dd-28 is doctrine) and
> update this assertion to name the case that is still open.

## A rig disagreed with the engine, and the rig was the bug

The first census keyed on the tension's `id` and reported **0 firings** while
its own table printed **1** on the line above. `pressureTests[].failureMode`
publishes the tension's TITLE; the id never reaches the payload. Had the table
not been printed beside it, "the retention tension has never fired" would have
gone into this document as a headline finding — and the whole of artifact 1's
closure would have been missed.

## Reproducing

```
retention-reach.mjs    tension firings by failure mode, 21 sources; dd-05/dd-28
                       out of a whole-document analyzeDocument
retention-blind.mjs    the population the tension cannot see, predicate read out
                       of js/lab-analyzer.js as source text
retention-red.mjs      the in-memory canon patch and the dd-05 closure
```
