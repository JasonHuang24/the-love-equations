# LE Lab — the 425 epoch orphans, retired as a class (2026-07-31)

**Status: LIVE.** The §5b decision from `md/lab-backlog-headroom.md`, made explicitly
by Jason in-session on 2026-07-31 ("let's retire the 425 orphans"), same day as the
91-crossing sitting (`md/lab-weak-backlog-sitting-91.md`).

## What was ruled, and by whom

All 425 remaining `minWeakScore` PENDING rows carry `ruling: "RETIRED"`,
`ruledBy: "Jason"`, `ruledAt: "2026-07-31"`, and a per-row note stating the ground:
the passage each was measured against did not survive the 2026-07-31 corpus loss and
re-acquisition, and cannot be read by anyone, ever. **RETIRED is not a verdict on the
crossing — it is the record that no verdict is possible.** It is deliberately not
ACCEPT (the association was never endorsed) and not REJECT (it was never refuted).

This is attributed to Jason because he made exactly this decision, about exactly this
class, in-session. It is not the bulk stamp he declined on 2026-07-30: those rows
were unread; these are unreadable, and the instrument that separates the two
(the sweep-identical unit→source rebuild, validated against all 2,438 current unit
ids in `md/lab-backlog-headroom.md` §3) ran again at stamp time — the script refuses
any row whose passage exists in the current corpus. 425 of 425 were orphans; 0
readable rows were touched.

## Mechanics

- The retirement script re-verified per-row unreadability before stamping, then moved
  the two counts together: `counts.pending` 5150 → 4725,
  `counts.pendingByThreshold.minWeakScore` 425 → 0, both cross-checked against the
  rulings they summarize.
- RED-first on the contract: the stamp was run against the unmodified suite first,
  and the value guard fired (`…carries an unrecognised ruling: RETIRED`). Only then
  was `RETIRED` added to the test's `RULINGS` set, with a comment stating it can
  never substitute for ACCEPT/REJECT on a readable row and that `--rule` cannot
  produce it (the sweep's `--rule` still only accepts ACCEPT/REJECT).
- `WEAK_BACKLOG_CEILING` ratcheted 425 → 0 — the only edit the test file permits.
- Suite 18/18 green with the corpus present, tripwire armed.

## What the weak line means from today

The ceiling at 0 ends the grandfather clause. The historical backlog is gone — 91
read and ruled, 425 retired with the epoch — so from now the standing rule applies
with no buffer: **a change that adds any weak crossing cannot ship until that
crossing is ruled.** That was always the principle; the ceiling existed only to keep
the inherited backlog from disarming the guard. The remaining pending population is
exactly the 4,725 `candidateScoreFloor` census rows, which are recorded, not
adjudicable, and stated policy (`md/lab-adjudication-at-scale.md`).

## What was not done

No `--rule` (and `--rule` cannot express RETIRED); no `--baseline`; no sweep run; no
threshold moved; no score touched. The census tier was not touched. `minCredibleScore`
stands at 0 pending. Nothing was deleted from the fixture — all 5,427 ruling rows
remain, every verdict and retirement carrying its author and date.
