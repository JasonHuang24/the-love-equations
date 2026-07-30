# Calibration audit: every constant frozen against 117 passages, re-asked at 2,401

2026-07-30. Prompted by the adjudication gate, which broke by **growing** — a
rule that was right at one population size carried into one 20× larger without
anybody re-asking whether it still meant what it said. Three constants were
chosen the same week and had never been re-asked.

**One change shipped: an invariant that was true by luck is now enforced.**
Everything else is a measurement and, for one of them, a question for Jason.

---

## A. Band width ±0.03 — keep it, and stop overstating what it does

The frozen band pins which SIDE of a line every near-line pair sits on, so a
later change that flips one fails the suite. That only works for pairs **in** the
band; a crossing that started outside it is caught by the explicit `--baseline`
comparison instead.

Of the 5,296 crossings ever recorded:

```
started INSIDE the band    829  (15.7%)
started OUTSIDE it        4467  (84.3%)
  of which "before 0.000"  2992  — never-measured pairs, not drift
```

Excluding the never-measured ones, the band alone would have caught **829 of
2,304 real drift crossings — 36%.** The `--baseline` comparison catches the rest,
and it catches everything the band does.

So the band is a second line of defence for the case where somebody changes
scoring **without** capturing a baseline first. That is a real and likely mistake
and worth guarding, but the fixture's own note calls the band "the population an
implementation detail can move across a line" as though it were the primary
instrument. It is not, and the note now says so.

Measured against the full dump rather than the already-filtered fixture — the
first pass of this audit computed the widening rows off `fixture.scores`, which
is *already* band-filtered, so every width above 0.03 came back identical and the
number was meaningless:

| width | pinned pairs | drift crossings inside | approx fixture |
|---|---|---|---|
| ±0.01 | 21,882 | 406 / 5,296 | ~1.9 MB |
| ±0.02 | 46,312 | 535 / 5,296 | ~4.0 MB |
| **±0.03** | **97,888** | **829 / 5,296** | **~8.5 MB** |
| ±0.05 | 293,307 | 1,941 / 5,296 | ~25.4 MB |
| ±0.08 | 359,207 | 4,953 / 5,296 | ~31.1 MB |

Narrowing to ±0.01 saves 78% of the fixture and halves the catch. Widening to
±0.05 triples the fixture for 2.3× the catch. Neither trade is obviously better
than what is there, and a constant with no argument for moving it should not
move. **Keep 0.03.**

## B. dumpFloor 0.02 — sound, and now actually enforced

A baseline dump keeps pairs at or above `dumpFloor`, and a comparison treats
anything absent as **zero**. So the floor has to sit below the bottom of the
band, or a pair just under `candidateScoreFloor` gets compared against a false
zero and its side is pinned wrong — the tripwire going quiet exactly where it is
densest.

```
lowest threshold 0.08 − band 0.03 = 0.050
dumpFloor 0.02                          0.03 of headroom
```

It holds. It was also **not enforced anywhere**: both constants are defaults in
`tools/lab-threshold-sweep.mjs`, either could be changed alone, and nothing
connected them. `tests/lab-threshold-neighbors.test.mjs` now asserts it,
RED-verified by setting the floor to 0.06:

> dumpFloor 0.06 is above 0.08 − 0.03 = 0.050. The bottom of the band is no
> longer captured by a baseline dump, so pairs just under the lowest threshold
> will compare against a false zero.

This is the whole shipped change from the audit, and it is the shape worth
looking for: not a constant that is wrong, but a relationship between two
constants that was true by luck.

## C. Display caps — two are well calibrated and one has drifted

Across all 2,401 retained claim-like passages in the archive:

```
maxCandidatesPerUnit 8
  candidates above candidateScoreFloor   median 46 · p90 118 · max 273
  units where the retrieval cap truncates   2288 of 2401 (95.3%)

maxMatchesPerClaim 4
  entries at or above minCredibleScore   median 0 · p90 1 · max 12
  units with more credible entries than the cap shows   13 of 2401 (0.5%)

maxWeakMatches 3
  entries in the weak band               median 4 · p90 12 · max 43
  units with more weak entries than the cap shows   1230 of 2401 (51.2%)
```

**`maxCandidatesPerUnit 8` truncates 95.3% of units and that is fine**, which is
worth writing down because the number looks alarming. The list is sorted by score
before the cut, credible entries are median 0 and p90 1, so the top 8 
contains every credible candidate on all but a handful of passages — and
`buildCandidateSet` has two explicit escapes past the cut, for exact evidence and
for context-eligible entries. Nothing reader-visible is being dropped here.

**`maxMatchesPerClaim 4` is well calibrated.** It binds on 0.5% of passages. The
median passage has zero credible matches, which is the coverage number the
project already knows and does not like, but it is not a cap problem.

**`maxWeakMatches 3` has drifted, and it is the one real finding.** It binds on
**more than half the corpus**. The median retained passage has 4 entries in the
weak band and the 90th percentile has 12, so a reader is routinely shown 3 of 12
nearby concepts with nothing indicating there are more.

> **Corrected while shipping the fix.** The payload carries three; the ledger
> displayed **one** — an unmapped row rendered `Nearest: X` from `weakMatches[0]`
> and drew nothing else. On the 1,643 unmapped retained segments the band is a
> median 3 and a p90 11, and that single line stood in for more than one concept
> on **1,163 of them (70.8%)**. The sentence above understated the reader-visible
> defect by measuring the payload instead of the screen. See
> `md/lab-weak-band-label.md`.

The cap is not obviously wrong — weak matches are weak by definition and a
12-item list is noise. But two things make it worth a decision rather than a
shrug:

1. **It grows with the canon.** The weak band is a fixed score window over a
   growing entry set, so median weak count rises every time doctrine lands. 470
   entries today; this number was smaller at 450 and will be larger at 500.
2. **It is silent.** A capped credible list is capped at 4 out of a median 0 —
   the reader is not missing anything. A capped weak list hides a median 1 and
   often 9 or more.

**This is a display decision, not a threshold one, so it is Jason's.** Three
options, none of which I have shipped:

- **Leave it at 3.** Defensible: the weak list is a hint, not a result.
- **Say how many were suppressed** — "3 of 12 nearby concepts". Cheapest honest
  fix, no scoring change, and it makes the growth visible instead of silent.
- **Raise `minWeakScore` above 0.25** so the weak band stops admitting so much.
  This is a threshold change and would move the record; it should not be done to
  fix a display symptom.

I would take the second. **Jason took the second; it shipped in v2.6.9 —
`md/lab-weak-band-label.md`.**

---

## What this audit did not cover

`minPhraseLength 4`, `minSingleAliasLength 5`, `plausibleSocialStructureScore 3`,
`shortUnitWordCount 6` and the three context-boost constants were all chosen in
the same era and are not measured here. The three in this document were the ones
named in `md/lab-adjudication-at-scale.md`; the rest are owed the same treatment
and have not had it.

## Reproducing

```
calibration-audit.mjs   all three sections; the band rows here are the corrected
                        ones, computed from a full dump rather than the fixture
```
