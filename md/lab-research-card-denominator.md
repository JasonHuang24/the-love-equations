# The research card now says what its three nearest concepts are three of

2026-07-31, Lab **v2.6.10**. `maxNearestConcepts` does not move. No threshold
moves. Two fields on the research-queue item, one line on the card, one line in
the Markdown export, one new invariant in the suite.

This is the item `md/lab-constants-audit.md §5` opened and deliberately did not
ship — *"recommended, and it is a small change"* — and it is the same defect
`md/lab-weak-band-label.md` fixed on the ledger at v2.6.9, one surface over.

## What was hidden

`researchItemFor` slices the top three from `result.candidates`, which is itself
the top `maxCandidatesPerUnit` 8 by score plus the union escapes. Two cuts, no
denominator.

```
research-queue items                              1,617
  at the maxNearestConcepts cap        1,607  (99.4%)
```

Measured through `analyzeDocument` over all 21 archived sources at canon
`1.0.0+0d01291161d6`, 479 concepts, 2,632 retained segments. The constants
audit's own figures were 1,634 of 1,643 at 470 concepts; the population moved
because two doctrine batches landed in between, and the ratio did not.

## The measurement that killed the obvious fix

The obvious denominator is `weakBandTotal` — it is what the ledger names, it is
already on the payload, and reusing it would have made the two surfaces read
alike. **It is wrong here, and it is wrong in the exact way the v2.6.9 test
exists to catch.**

`nearestConcepts` is the top of the CANDIDATE set. The band is
`[minWeakScore, minCredibleScore)`. Those are different populations, and the
card would routinely have published a denominator smaller than its own numerator:

```
shown concepts vs the weak band                   1,617 items
  every shown concept is in the band      931  (57.6%)
  some in, some below                     490  (30.3%)
  none in the band                        196  (12.1%)

weakBandTotal < shown                             687
  of which weakBandTotal == 0                     197
candidatesAboveFloor < shown                        0
```

So `"3 of 0 in the nearby band"` on 197 items. Two of those are the sharpest
illustration: a passage in `22-finkel-suffocation` displays three concepts
scoring **0.613 / 0.610 / 0.609** with a band of **zero** — they are *above*
`minCredibleScore` and were refused by ADMISSION, so they sit outside a band
defined by the weak floor and the credible ceiling in both directions.

`candidatesAboveFloor` is safe by measurement rather than by argument: greater
than or equal to the shown count on all 1,617 items, zero violations, never
itself zero.

```
distributions                min   median   p90   max
  weakBandTotal                0        3    11    30
  candidatesAboveFloor         0       45   118   279
  working candidate set        0        8     8    10
```

**The plan for this item had specified a two-branch label** — name the band when
every shown concept is in it, name the scored total otherwise. The census killed
it: a card that switches denominators between rows makes two rows
incomparable, and the branch was only ever there to route around a number that
should not have been the denominator in the first place. One denominator, always
the same one, with the band published beside it as a named subset.

## What shipped

**`js/lab-analyzer.js`.** `scoredConceptTotal` (from `_retrieval.candidatesAboveFloor`,
a per-unit fact already carried on every candidate) and `nearbyBandTotal` (from
the segment's existing `weakBandTotal`) on every research-queue item.
`RESEARCH_QUEUE_SCHEMA_VERSION` `/2.1` → `/2.2`, because the item SHAPE changed
and a standalone queue export is self-describing by design.
`ANALYZER_VERSION` 2.6.9 → **2.6.10**; `SCORING_CONFIG` untouched, so
`scoringConfigHash` stays `bt0a7p`.

**`js/lab-app.js`.** `appendNearestConcepts` gains a `.lab-nearest-scale` line,
silent when the list IS the whole scored set (14 items in 1,617):

```
Nearest LE concepts: "Get a hobby" is code for "give up" (54/100) ·
                     Cold logic keeps reaching the same place (45/100) ·
                     You might be the one avoiding commitment (43/100)
  3 of 72 concepts that scored · 21 in the nearby band
```

**`js/lab-export.js`.** The same sentence on `analysisToMarkdown`'s
*"Nearest LE concepts"* line, as a trailing italic clause.

Verified live on the demo at `localhost:8764`: all five research cards carry the
label, counts 62/72/64/48/43 scored against bands 11/21/14/11/11, computed style
`italic` / `block`, no console errors. No screenshot — the Browser pane was not
displayed this run, so the DOM readout is the evidence (same fallback as v2.6.9).

## The guard, and what it is RED against

`tests/lab-analyzer.test.mjs` pins the RELATIONSHIP, not the counts:
`scoredConceptTotal >= nearestConcepts.length` on every item of a real document;
the cap bites on the chosen item, so the gap is suppression and not scarcity;
and a specimen that freezes *why the band is not the denominator* — an authored
probe whose every shown concept is under the weak floor, so the band is 0 while
three concepts are displayed.

RED-verified by publishing the band as the denominator, which fails on the
specimen with the message that names the choice:

> and the denominator that ships still holds where the band does not

The probe is **authored, not lifted**: the corpus is gitignored third-party text
(`md/RERUN.md` §1), so a committed fixture in this register has to be written —
the same rule the alias probes follow.

## Found on the way, and fixed

`tests/lab-analyzer.test.mjs` asserted the research-queue schema against the
string literal `'le-lab.research-queue/2.1'` — **one line below a comment
reading "The constant, not a literal: … A literal here made a routine version
bump look like a coverage regression."** The queue-shape bump duly failed it as a
fake coverage regression. The line now asserts `RESEARCH_QUEUE_SCHEMA_VERSION`.
This is v2.5.0 fact (g) recurring inside the test that documents it.

## The sweep that had to find nothing

A display change should move no score, and the retrieval layer is where that is
checkable. Run against HEAD's canon in an isolated worktree:

```
104,528 pairs · 2,518 passages · scoringConfigHash bt0a7p
  gained 0 · lost 0 · moved 0     — every pair byte-identical to the fixture
```

Nothing to adjudicate. The record stands at
`0 credible (blocking) · 516/516 weak (ratchet) · 4,622 census`.

## Verified at HEAD, in a worktree, because the tree was not mine alone

A concurrent session was mid-batch in this working tree throughout, with
uncommitted `data/canon-overlay.json` and `data/le-canon-index.json`. Their
in-flight overlay edit had the swept population at **2,404** against a band
frozen at 2,518, so `tests/lab-threshold-neighbors` test 3 was RED in the
working tree while I worked.

**That failure is theirs and the proof is a control, not an argument:** running
the same test with HEAD's `js/lab-analyzer.js` — none of this change present —
returns the identical 2,404. The suite was then verified GREEN in a detached
worktree at HEAD carrying only my twelve files: 13 test files, 176 assertions
across them, plus all three Python audits at `v=2.6.10`.

One caveat for anyone reusing that rig: `scripts/validate-canon-index.mjs`
reports *"Generated index is stale"* in a worktree **even on a pristine HEAD
checkout with no edits at all**, because `generatedAt` derives from the git state
of the build's inputs. Run the pristine control before believing that failure —
it is a property of the harness, not of the change under test.

## What this deliberately did not do

**The 510 mapped ledger rows.** A mapped row draws no weak list, so there is
nothing to label; giving it one is new reader surface, not a fix to an existing
display. Out of scope by standing rule, unchanged from v2.6.9.

**`maxNearestConcepts` itself.** Same reasoning as `maxWeakMatches` at v2.6.9: a
display symptom gets a display fix, and a cap is not moved to fix a disclosure.

## Reproducing

```
nearest-census.mjs   band vs scored vs shown, per research item, all 21 sources
node tools/lab-threshold-sweep.mjs --neighbors <scratch>   then diff .scores
                     against tests/fixtures/threshold-neighbors.json
```
