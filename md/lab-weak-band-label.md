# The nearby band is now a number the reader can see

2026-07-30. `maxWeakMatches` does not move. No threshold moves. One field on the
segment payload, one `<details>` in the ledger, one new invariant in the suite.

## What the audit said, and what was actually on screen

`md/lab-calibration-audit.md` found that `maxWeakMatches 3` binds on 51.2% of the
archive and wrote that "a reader is routinely shown 3 of 12 nearby concepts with
nothing indicating there are more."

The first half of that was wrong, and wrong in the direction that made the defect
look smaller. The payload carries three. **The ledger displayed one.** An unmapped
row rendered `Nearest: X` from `weakMatches[0]` and nothing else; the second and
third were computed, shipped in the JSON export, and never drawn.

Measured through `analyzeDocument` over all 21 sources:

```
retained claim-like segments                                      2,401
  band exceeds what the payload carries                  1,230  (51.2%)
    of those UNMAPPED — the branch that shows a nearest    720
    of those mapped  — no weak list is drawn at all        510

unmapped retained segments                                        1,643
  weak band            median 3 · p90 11 · max 31
  "Nearest: X" stood in for more than one concept   1,163 of 1,643 (70.8%)
```

So the reader-visible defect was **71% of unmapped rows**, not 51% of everything,
and the understatement was one-of-eleven rather than three-of-twelve.

## Two caps, stacked, neither visible

The list a reader sees is cut twice:

1. `buildCandidateSet` keeps the top `maxCandidatesPerUnit` 8 by score, plus
   exact-evidence and context-eligible escapes.
2. `maxWeakMatches` keeps 3 of whatever survived that and did not clear
   `minCredibleScore`.

Only the second was named in the audit, which is why the shape of the number
matters more than the number. `weakBandTotal` counts entries in the band **at
retrieval**, before either cut — that is the only place the whole scored set
exists, and it is free there because `ranked` is already computed.

It reproduces the audit's standalone figures exactly (median 4, p90 12, max 43
across all 2,401 retained segments), which is the check that the analyzer-side
count and the rig are counting the same thing.

## The one caveat, stated as a bound rather than hidden

`weakBandTotal` is measured before `applyBoundedContext`. Context can only
promote an entry **out** of the band — the boost refuses to touch anything
already below `minWeakScore` — so the published number is an upper bound on the
post-boost band, and exact wherever no promotion happened. A denominator that
can only be generous is the safe direction for this to be wrong in.

## What shipped

**`js/lab-analyzer.js` v2.6.9.** `weakBandTotal` on `_retrieval` (a per-unit fact
carried on every candidate, same as `candidatesAboveFloor`), lifted onto the
segment result and added to `PUBLIC_SEGMENT_FIELDS`. Zero when nothing was
retrieved, which is also when the weak list is empty.

**`js/lab-app.js`.** `appendNearbyBand` on the unmapped branch, reusing the
`lab-adjacent-more` component the mapped branch already uses for `+ N adjacent`.
The summary names the band; the list gives the entries the payload carries; a
final italic line names the ones it does not:

```
Nearest: "Get a hobby" is code for "give up"
  ▸ 20 in the nearby band
      Cold logic keeps reaching the same place — Gender Dynamics · Male · … · 45/100
      You might be the one avoiding commitment — Gender Dynamics · Female · … · 43/100
      and 17 more in the band, not carried in this report
```

Verified live at `localhost:8753` on the demo document: 5 of 11 rows carry the
label, counts 9 / 11 / 11 / 13 / 20, no console errors, the italic style applies.
No screenshot — the browser pane was not displayed this run, so the DOM readout
is the evidence.

**`tests/lab-analyzer.test.mjs`.** A new test pinning the RELATIONSHIP rather
than the count, because `weakBandTotal` is an IDF quantity that moves on every
doctrine merge:

- the cap bites on the chosen passage (band > carried, carried == the cap), so
  the difference is suppression and not scarcity;
- `weakBandTotal >= weakMatches.length` on every segment of a real document — a
  denominator under its numerator would render "3 of 2 in the nearby band";
- zero, not undefined, when nothing was retrieved.

RED-verified by publishing `weak.length` as the band:

> this passage is chosen because the cap bites: the band is wider than the
> carried list

## What this deliberately did not do

**The 510 mapped rows.** A mapped row draws no weak list at all, so there is
nothing to label. Giving it one is new reader-visible surface, not a fix to an
existing display, and it was out of scope for this item.

**`maxNearestConcepts 3`** on the research-queue card has the same shape — a
top-3 slice of `candidates` with no denominator — and was not measured here. It
belongs with the remaining constants audit.

**A cap change or a threshold change.** Jason ruled on the display option
specifically because `minWeakScore` must not be moved to fix a display symptom.
`maxWeakMatches` stays at 3.

## The sweep that had to find nothing

A display change should move no score, and the retrieval layer is where that
claim is checkable. Regenerating the threshold-neighbour band against the tree
carrying both this change and the constants audit:

```
97,888 pairs · 2,401 passages · scoringConfigHash bt0a7p
  gained 0 · lost 0 · moved 0     — every pair byte-identical to the committed fixture
```

The population, the band membership and every individual score are unchanged, so
there are no crossings, nothing to adjudicate, and no fixture to rewrite. The
record stands at `0 credible (blocking) · 516/516 weak (ratchet) · 4,622 census`.

Worth doing rather than assumed: `weakBandTotal` is computed inside
`buildCandidateSet`, which is one function away from `scoreEntry`, and "it only
adds a field" is exactly the kind of claim that turns out to be false.

## Reproducing

```
weak-band-census.mjs   band vs carried through analyzeDocument, all 21 sources
node tools/lab-threshold-sweep.mjs --neighbors <scratch>   then diff .scores
                       against tests/fixtures/threshold-neighbors.json
```
