# The adjudication gate had disarmed itself, and the volume is why

2026-07-30. No analyzer change, no canon change. One fixture field, one rewritten
test.

## What was wrong

The crossing record's gate was one flag:

```js
adjudicationOpen: pending > 0
```

While open, the suite REPORTED outstanding crossings instead of failing on them,
so a release could be built in parallel with the adjudication it was waiting for.
Closing it was the release's job. That is a good rule, and it worked while the
sweep covered 117 passages and a change produced a few dozen crossings a human
could read in an afternoon.

The sweep now covers 2,401 passages. Of the 5,138 outstanding crossings, **4,622
are at `candidateScoreFloor`** and nobody is ever going to read them. While they
sit there `adjudicationOpen` is permanently true, which means the branch that
FAILS is permanently unreachable.

**A guard that can only ever report is not a guard.** It had quietly become a
log line. The honest options were to disarm it openly or to arm the part that
matters, and the second is obviously right — the reason the volume is
unadjudicable is that most of it is at the least consequential line, not that
adjudication stopped being worth doing.

## The three lines are three different kinds of event

| line | treatment | outstanding |
|---|---|---|
| `minCredibleScore` | **BLOCKING**, no volume exception | **0** |
| `minWeakScore` | **RATCHET**, may only fall | 516 |
| `candidateScoreFloor` | **CENSUS**, not adjudicable | 4,622 |

**`minCredibleScore` blocks.** It decides whether a reader is shown a match as
credible. There is no volume argument available here and there never will be:
the entire archive has produced **38 of these ever**, across every change since
the record began. If one is outstanding, the suite fails and says which sentence
to go read.

**`minWeakScore` ratchets.** It changes the nearby-concepts list a reader sees,
so it is not a census. But 516 are outstanding from before this rule, and
demanding they be cleared before the next release would just disarm the guard a
second way — this time by making it impossible to satisfy instead of impossible
to trip. The count may only FALL: a change that adds weak crossings has to answer
them, and the historical backlog gets worked down in its own time. Same shape as
`junkRecall`, for the same reason.

**`candidateScoreFloor` is a census.** It decides which entries were CONSIDERED.
It can never put a match in front of a reader: `applyBoundedContext` refuses to
boost anything below `minWeakScore`, and the largest boost available is 0.045
against a 0.17 gap.

It is still **recorded**, and that is deliberate. When the sweep widened I nearly
gave this tier a narrower band to shrink the fixture, and checking stopped it: a
pair clearing the floor on a unit with no stronger candidate becomes `nearest`,
and `nearest` decides an unmapped claim's reason line, its destination, and the
entry title seeded into its research search terms. Not adjudicable is not the
same as invisible, and the record says which one it means.

## What shipped

`counts.pendingByThreshold` in `tests/fixtures/threshold-neighbors.json`, written
by the sweep and cross-checked against `rulings` by the suite so the summary
cannot drift from what it summarises.

`tests/lab-threshold-neighbors.test.mjs` reads it per-threshold. Both new
branches are RED-verified:

```
flip one ACCEPT back to PENDING
  -> "1 minCredibleScore crossing(s) are unruled. This is the line that decides
      whether a reader is shown a match as credible, and it is release-blocking
      with no volume exception"

lower WEAK_BACKLOG_CEILING 516 -> 515
  -> "516 minWeakScore crossings are unruled, above the ceiling of 515. This
      change added weak crossings without answering them."
```

`adjudicationOpen` stays and keeps its meaning — it is the honest one-line
summary of whether anything is outstanding. What changed is that the suite no
longer decides what to do from that flag alone.

The suite now prints its state every run rather than only when something is
wrong:

```
adjudication: 0 credible (blocking) · 516/516 weak (ratchet) · 4622 candidate-floor (census)
```

## What this does not do

It does not reduce the backlog. 4,622 candidate-floor crossings remain recorded
and unread, and that is now the stated policy rather than an accident.

It does not answer whether the band should still store 97,888 scored pairs at
8.4 MB. That is a separate question about the tripwire, not about the verdict
record, and the tripwire is still doing real work — it caught 100 unrecorded
crossings from the entry-side change this afternoon.

## The lesson worth keeping

The gate broke by **growing**, not by being wrong. Every individual decision that
led here was correct: widening the sweep to 21 sources, recording every crossing,
deriving `adjudicationOpen` rather than setting it. The failure was that a rule
calibrated for one population size was carried into a population 20× larger
without anybody re-asking whether it still meant what it said.

Worth checking the same way on the other frozen instruments: the band width
(±0.03), the `dumpFloor` (0.02) and the display caps were all chosen against a
much smaller corpus too.

## Addendum — 2026-07-31: the weak backlog no longer exists

The 516 figures above are the state at ruling time and stay as written. The next
day the backlog was cleared: the 91 readable crossings were ruled hand-entered
(48 ACCEPT / 43 REJECT, `lab-weak-backlog-sitting-91.md`) and Jason ruled the
425 epoch orphans RETIRED as a class (`lab-weak-orphan-retirement.md`).
`WEAK_BACKLOG_CEILING` is now **0**: the ratchet's headroom is spent, and every
future weak crossing blocks until ruled. The three-line governance itself —
BLOCK / RATCHET / CENSUS — is unchanged and still operative.
