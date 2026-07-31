# LE Lab — the 91 readable weak crossings, ruled (2026-07-31)

**Status: LIVE.** The adjudication sitting that `md/lab-backlog-headroom.md` §5(a)
recommended. Every verdict below is hand-entered and `ruledBy: "Claude"` — none is
attributed to Jason. Any of them can be re-ruled by him; the fixture is the record.

## What was ruled

The 91 `minWeakScore` pending crossings whose unit ids still exist byte-identical in
the restored corpus (readable set from `md/lab-backlog-headroom.md` §3). Each passage
was read against the canon entry's synopsis before the verdict was assigned; the
reading sheet was rebuilt from the corpus through the shipped
`normalizeInput → detectClaimUnits` path, the same way the sweep builds it.

**Verdicts: 48 ACCEPT · 43 REJECT.** Recording followed the two-edit rule:
`counts.pending` 5241 → 5150 and `counts.pendingByThreshold.minWeakScore` 516 → 425
moved together, and the script cross-checked both against the rulings they summarize
before writing. `WEAK_BACKLOG_CEILING` ratcheted 516 → 425 in the same commit — the
only edit the test file permits. Suite 18/18 green with the corpus present (tripwire
armed, not skipped).

## The standard

Same bar as the 12 prior Claude-ruled weak REJECTs (`smv:looks:face` ×6,
`desire-maintenance-split` ×4): the weak line changes the nearby-concepts list a
reader sees, so ACCEPT means the entry genuinely belongs beside that passage, REJECT
means the crossing is token coincidence — regardless of score magnitude. A hairline
0.249→0.25 gain was ACCEPTed where the association is real (`stat-marriage-age` on
"Fewer men and women will marry, and those that do will marry later in life") and
REJECTed where it is not (`no-good-men-left` on a kindness-vs-attractiveness
point-allocation result, twice).

## Why the reject rate is 47%, not the historical 8%

Not a stricter bar — a different population. The historical 92% accept rate comes
from targeted fix-runs. These 91 are inherited doctrine-batch gains, and the junk
concentrates in two shapes:

1. **Thin narrative sentences that collected batch gains.** Two content-light
   fem-centrism sentences (a radio-show anecdote setup and "neither wanted children
   from the outset") gained 20 entries between them; 17 were rejected. A sentence
   about media portrayals of masculinity gained 6; all rejected.
2. **The operative-frame cluster is the mirror image.** 26 of the 33 fem-centrism
   ACCEPTs are the doctrine cluster (`operative-frame`, `feminine-imperative`,
   `feminine-reality`, `male-imperative`, `locus-of-control-shift`, `fem-centrism`,
   `unplugging`) landing on passages that literally use those terms — eb0f6cd's
   doctrine reaching its own source material, working as designed.

## The two losses rejected as real costs

Ten of the twelve losses were correct drops (spurious associations fading). Two were
not, and the REJECT records what the IDF shift cost:

- `M-TBD-11` (who cares more about looks) lost "These mate-preference sex differences
  are often claimed to be 'universal'" (0.288 → 0.21) — that mythbuster is exactly
  this literature.
- `…the-feminism-trade-off-freedoms-in-guardrails-out` lost the divorce-laws /
  conscription passage (0.252 → 0.245) — the card's no-fault-divorce claim is
  squarely adjacent.

Per standing protocol a REJECT is not a threshold retune; these two are flagged here
as candidates for authored-surface work (aliases/misreadings), the permitted remedy.

## What was not done

No `--rule`, no `--baseline`, no sweep invocation. The 425 orphaned crossings
(unreadable, `md/lab-backlog-headroom.md` §3) were not touched — every remaining
pending weak row is now known-unreadable, and their retirement remains Jason's
explicit class decision (§5b), not made here. `minCredibleScore` stands at 0 pending.
The candidate-floor census (4,725) is unchanged and not adjudicable.
