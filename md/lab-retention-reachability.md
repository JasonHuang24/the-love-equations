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

**NOT SHIPPED.** `data/canon-overlay.json` is held by a concurrent session for
the whole of this run and Jason's standing ruling is that I do not operate on
their files. The surface above is measured, authored and ready to apply; it
joins docket item 2's face/age surfaces as one pending canon patch.

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
