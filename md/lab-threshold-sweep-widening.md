# The threshold sweep was measuring 3 of 21 sources. It now measures all 21

Landed 2026-07-30. **117 swept passages → 2,220. 5,242 frozen band pairs → 90,432.
Zero new PENDING rulings.** No analyzer change, no canon change, no threshold change.

## What was wrong

`tools/lab-threshold-sweep.mjs` carried a hand-written three-element array:

```js
const SOURCES = ['01-pew-online-dating', '02-fem-centrism', '04-heteropessimism'];
```

It was written when three sources were the whole archive. Eighteen more were
acquired and analyzed in the doctrine combo run and the array never moved, so
every number this tool produced afterwards described 14% of the corpus while
being reported — in commit messages, in adjudication sheets, and in this
folder — as *corpus-wide*. The tool is the instrument behind the calibration
record for tranches 1, 2 and 3, the retention doctrine merge, gate option 1, P2
and the meta-register decision. Every "corpus-wide, zero losses" claim in those
records means **three sources**. None of them are wrong about what they measured;
all of them are narrower than they sound.

The same array was written out a **second** time, in
`tests/lab-threshold-neighbors.test.mjs`, which is the test guarding the fixture
the tool generates. Those two copies agreed, which was luck rather than a
property: widening the tool alone would have left the test unable to find two
thirds of the pairs it guards, and the failure would have read *"the corpus text
or the canon index has moved under this fixture"* — a true-sounding message
about the wrong cause.

## What replaced it

`tools/lab-corpus-sources.mjs`, imported by both, derives the population from
`lab-corpus.manifest.json`: every source the manifest records a `sourceFile`
for. The manifest is committed even though the archive it describes is not
(md/RERUN.md §1), so this works on a clone with no corpus.

Source 03 (Gottman) leaves the population because the manifest gives it
`sourceFile: null` and `status: 'EXCLUDED — within-version-only artifact'` — the
recorded decision does the excluding, rather than someone remembering to leave an
id out of an array.

## Entering the record without burying it

The handoff flagged this as the open question, and it has a clean answer: **the
eighteen added sources are a measurement, not a change, so nothing crossed and
nothing was recorded as PENDING.** The band was regenerated with `--neighbors`
and no `--baseline`. Rulings came through byte-identical at 4,394, still 4,242
outstanding, still one rulable `minCredibleScore` case.

The alternative was available and would have been a disaster. Comparing the
widened tree against the last three-source baseline treats every pair from a
source that was never swept as a pair that scored **zero** — `compare()` maps
"absent from the dump" to 0 deliberately, because for the sources it was written
for that is true. Measured, that comparison would have entered:

```
candidateScoreFloor  117404
minWeakScore          11883
minCredibleScore        833
                     ------
                     130120 crossings, all fictional
```

PENDING would have gone from 4,242 to 134,362, and the one `minCredibleScore`
ruling a human can actually reach would have been filed behind 130,120 rows
recording that a passage nobody had ever scored went up from a score it never
had. **A pair's absence from a baseline means "never measured", not "scored
zero", and the two are only interchangeable when the population is fixed.**

## The widening was purely additive, and that is provable

Every one of the 5,242 previously frozen pairs is still in the band at the
**identical** score — 0 lost, 0 moved, `rulings` byte-identical. That is not
luck. `prepareCanonIndex` derives IDF from the canon, not from the swept corpus,
so adding sources cannot move an existing pair's score. Widening the population
can only add pairs.

This is worth stating because the opposite is the usual case here: the doctrine
merge and all three overlay tranches moved scores across the whole canon, because
adding *entries* does move IDF. Adding *sources* does not.

## What the instrument was blind to

| source | passages | pairs ≥ 0.25 | pairs ≥ 0.43 |
|---|---|---|---|
| **01-pew-online-dating** | 62 | 866 | 50 |
| **02-fem-centrism** | 18 | 80 | 15 |
| **04-heteropessimism** | 37 | 121 | 6 |
| 05-kim-generalizability | 159 | 729 | 10 |
| 06-heyman-crossvalidation | 46 | 237 | 2 |
| 07-van-lankveld-desire | 170 | 1070 | 122 |
| 08-mcnulty-early-marriage | 141 | 1109 | 96 |
| 09-conroy-beam-discrepancies | 262 | 1366 | 203 |
| 10-miller-alternatives | 108 | 613 | 24 |
| 11-ifs-genz-partner-priorities | 55 | 448 | 19 |
| 12-nep-exit-poll-methods | **0** | 0 | 0 |
| 13-wheatley-counterfeit-connections | 130 | 474 | 12 |
| 14-common-sense-ai-companions | 17 | 56 | 1 |
| 15-asc-american-friendship | 17 | 103 | 0 |
| 16-pew-emotional-support | 3 | 22 | 0 |
| 17-trent-south-sex-ratios | 98 | 632 | 59 |
| 18-li-necessities-luxuries | 117 | 860 | 93 |
| 19-zhang-preference-replication | 86 | 1345 | 110 |
| 20-marzoli-mate-preferences | 86 | 597 | 28 |
| 21-hirschl-assortative-mating | 32 | 197 | 6 |
| 22-finkel-suffocation | 576 | 2025 | 48 |

Bold rows are the three sources the sweep could see. **The credible-clearing
surface — pairs at or above `minCredibleScore`, the line that decides what a
reader is shown — was being measured at 71 pairs. It is 904.** Eight of the ten
largest contributors were outside the instrument entirely, and the three inside
it are the three smallest documents in the archive apart from 14, 15 and 16.

`09-conroy-beam-discrepancies` alone carries 203 credible pairs, nearly three
times the entire population the sweep had been reporting on.

### Source 12 retains nothing, and that is the gate working

`12-nep-exit-poll-methods` produces 66 units, **all 66 set aside** — 35 of them
claim-like, every one of them binned as irrelevant. It is a National Election
Pool exit-poll methodology document, archived for the sampling-methodology
argument rather than for anything about relationships, and the domain gate
refuses the whole file. A 100% bin rate on an off-domain source is the strongest
`ignorePrecision` evidence in the project and none of it was visible before
today, because the source was not in the population.

## What it costs

```
tests/fixtures/threshold-neighbors.json   1.5 MB -> 8.4 MB
npm run test:lab                          32.5s  -> 39.0s   (+6.5s, all of it the neighbours file)
node tools/lab-threshold-sweep.mjs        ~3s    -> 54s     (on-demand tool, not the suite)
```

8.4 MB is real and it is the honest size: the band is the population an
implementation detail can push across a line, and that population is 19× bigger
than the instrument admitted. For scale, the repo already tracks two 43 MB ONNX
models. The band width stays at ±0.03 — narrowing it to shrink the file would
trade a measured guard for a smaller diff, which is the trade this project keeps
refusing.

Of the 90,432 band pairs, 75,404 sit at `candidateScoreFloor`. That threshold is
the cheapest to cross and the least consequential, and the temptation was to give
it a narrower band or drop it from the fixture. Checking first is what stopped
that: a candidate-floor crossing is **not** invisible.

`researchItemFor` reads `result.candidates[0]` as `nearest`, and a pair that
clears the floor on a unit with no stronger candidate *becomes* `nearest`. That
changes three things a reader sees on an unmapped claim — the reason line (*"No
canon entry shared enough distinctive language"* becomes *"The nearest canon
concept shares only weak or generic wording"*), the destination
`chooseDestination` picks, and the entry title seeded into the research search
terms.

It still cannot reach the match list: `applyBoundedContext` refuses to boost any
candidate scoring below `minWeakScore`, and the largest boost it can grant is
0.045 against a 0.17 gap. But "cannot be displayed" is not "cannot be seen", so
candidate-floor pairs stay in the band at full width.

## What is now pinned

`tests/lab-threshold-neighbors.test.mjs` asserts the swept **population**, not
just the pairs in it:

```js
assert.equal(population, fixture.passages, …)
```

Deriving the source list from the manifest means a 23rd source enters the sweep
the moment the manifest records a text for it, with no code change. That is the
right default — an archive the instrument ignores is worse than an instrument
that grows — but it also means the band could widen with nobody touching a file
the reviewer reads. The pin makes that a failure that names its own cause:
entering the population is automatic, entering it **silently** is not.

The test also gained the `isClaimLike` filter the tool got in `bd5dde4`, so the
two descriptions of the population are now the same description in both senses —
one module, one predicate.

## What this does not fix

The 4,242 outstanding rulings are unchanged and still describe the three-source
era. They are not wrong, and re-deriving them against the wide population would
mean re-ruling crossings a human has already answered. The next scoring change
sweeps 2,220 passages and its crossings will be the first adjudication record
that covers the archive.
