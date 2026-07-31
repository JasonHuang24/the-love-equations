# Adjudication for the face/age match surface

2026-07-31. Canon `1.0.0+9fdfcb020ea2` → `1.0.0+07fb1c92bac5`, 491 concepts both
sides — a surface edit inside two existing entries, not a merge. Read alongside
`md/lab-face-age-match-surface.md`, which is why these two strings and not the
other nine.

Every number here is read back **out of** `tests/fixtures/threshold-neighbors.json`,
so this document cannot claim a verdict the suite does not enforce.

```
crossings this change added                93
  minCredibleScore        1    BLOCKING · left PENDING · Jason's
  minWeakScore           15    ruled: 9 ACCEPT / 6 REJECT, ruledBy Claude
  candidateScoreFloor    77    census, not adjudicable at this volume

fixture pendingByThreshold after
  candidateScoreFloor  4699 · minWeakScore 516 · minCredibleScore 1
ruledBy tally in the whole fixture
  Jason 158 · Claude 15
```

`WEAK_BACKLOG_CEILING` is 516 and `minWeakScore` PENDING is back to **exactly
516**. The ceiling did not move and the historical backlog was not touched: the
fifteen ruled here are precisely the crossings absent from the previous
committed fixture, selected by key diff rather than by eye.

**`--rule` was not used and must not be.** It answers every outstanding
crossing, which here would have stamped 4,699 unread candidate-floor rows.
Jason declined the bulk stamp on 2026-07-30. These fifteen were stamped by key.

> **RULED 2026-07-31, `b6de5a7`.** Jason ruled **ACCEPT** in session, stamped by
> key with `ruledBy: Jason`, no `--rule`. He ruled on the reasoning below
> *including the argument against it*, which is therefore recorded as overridden
> rather than dismissed. `minCredibleScore` went to 0 and the suite went green.
>
> **RECORDING A VERDICT IS TWO EDITS, NOT ONE** — learned by the concurrent
> session getting it wrong first, and it applies to every future ruling:
>
> - set `counts.pendingByThreshold.<threshold>` to **`0`**, never delete the key.
>   A deleted key makes the per-threshold assertion compare `undefined` against a
>   counted `0`, and it fails with *"recorded PENDING count for minCredibleScore
>   disagrees with the rulings"* — which reads like the ruling did not take rather
>   than like a missing key.
> - bring `counts.pending` down with it, or test 1 fails on internal consistency.

## The one blocking crossing — PENDING, recommendation only

```
smv:looks:face   gain 0.243 → 0.460
seg-00066-181m2s3.claim-04   [18-li-necessities-luxuries]
```

> "Men wanted to know first that a woman was at least average on physical
> attractiveness."

**Recommended ACCEPT. Not entered — this line is release-blocking with no volume
exception and the verdict is Jason's.** The suite is red until he rules, which is
the standing rule for this run working as intended rather than a regression.

The reasoning, so the verdict can be disagreed with rather than guessed at:

- **It is a granularity error, not a sense error.** Li's finding is about
  physical attractiveness as a whole; `smv:looks:face` is the face sub-lever of
  exactly that lever. That is a different class from the errors the generic-title
  ruling rejected, which were the verb *to face*, the collective *body of
  research*, the adjective *game*, and `age` as a crosstab axis — those match a
  different SENSE of the word. This one matches the right subject at the wrong
  altitude.
- **It ranks fifth and is never shown.** The displayed list for this passage is
  `…physical-attractiveness@0.553`, `…physical-attractiveness@0.540`,
  `smv:looks@0.540`, `hierarchy:a-generic-male@0.467`. The correct home,
  `smv:looks`, is already there and ranked above it; `maxMatchesPerClaim` keeps
  the face entry off the screen entirely. The archive-wide displayed diff for
  this change is **+0 / −0 credible**, and this crossing is why that is a
  retrieval fact rather than a display one.
- **The honest argument against:** the tokens doing the work are `men`, `first`
  and `woman` — frame vocabulary, not concept content — so the match is right by
  luck rather than by meaning, and a later IDF shift could surface it. A REJECT
  here would pin the pre-change outcome as a fixture plus a report entry
  (v2.6.0's precedent) rather than becoming a threshold change, and would not
  require withdrawing the misreading.

## The fifteen weak crossings — ruled, `ruledBy: Claude`

Each was read out of a whole-document `analyzeDocument` before being stamped. The
six REJECTs are recorded as wrong nearby-concepts rather than quietly accepted;
none of them reaches a reader's displayed weak list (that diff is **+2 / −4**
across 5,646 entries, all lateral swaps or 0.001 jitter), but they do count
toward `weakBandTotal`, which v2.6.9 and v2.6.10 made reader-visible as a number.

| verdict | move | entry | why |
| --- | --- | --- | --- |
| `ACCEPT` | gain 0.243 → 0.460 | `smv:looks:face` | the blocking pair above, at its weak line too |
| `REJECT` | gain 0.241 → 0.297 | `smv:looks:face` | resource-holding and fertility trade-offs; matched on men/mate/first |
| `REJECT` | gain 0.102 → 0.288 | `smv:looks:age` | Pew crosstab, "differences by age: 62% of Americans ages 65 and older" — the documented fourth failure shape, in the band |
| `ACCEPT` | gain 0.238 → 0.284 | `smv:looks:face` | an attractiveness-threshold claim, adjacent and below the line |
| `REJECT` | gain 0.196 → 0.276 | `smv:looks:face` | methods text naming two desire inventories |
| `ACCEPT` | gain 0.147 → 0.274 | `smv:looks:face` | Li's core finding on what each sex asks first |
| `REJECT` | gain 0.239 → 0.271 | `smv:looks:face` | sexual desire scores by gender |
| `ACCEPT` | gain 0.248 → 0.264 | `smv:looks:face` | attractiveness-versus-resources trade-off |
| `REJECT` | gain 0.237 → 0.257 | `smv:looks:face` | statistical-design prose about satisfaction associations |
| `REJECT` | gain 0.223 → 0.251 | `smv:looks:face` | sexual desire by gender again |
| `ACCEPT` | gain 0.249 → 0.250 | `statistics:stat-casual-gap` | 0.001 jitter on an online-dating-by-age statistic |
| `ACCEPT` | loss 0.250 → 0.249 | `frameworks:saturation-rule` | 0.001 jitter dropping a methods sentence out of the band |
| `ACCEPT` | loss 0.250 → 0.249 | `M-TBD-22` | 0.001 jitter on the Li sentence |
| `ACCEPT` | loss 0.250 → 0.249 | `M-TBD-55` | 0.001 jitter; swapped for M-TBD-49 at 0.258 on the same sentence |
| `ACCEPT` | loss 0.250 → 0.249 | `smv:looks:face` | 0.001 jitter on an AI-images sentence; a marginal face entry leaving is right |

**The REJECT pattern is one mechanism, not six accidents.** Every one is a
sentence that contrasts men and women without making a claim about looks, and the
misreading contributed exactly those frame words. That is the cost of authoring
in the ordinary register of the claim — the register is what makes the surface
reachable and it is also what makes it slightly promiscuous. Six wrong entries in
a retrieval band of 16,996 is the price, and it is recorded rather than absorbed.

## The mistake I nearly made, since it is the more useful record

The sweep reported 15 new `minWeakScore` crossings and I read that as 15 wrong
entries appearing in readers' nearby-concept lists, concluded the change cost
more than it bought, and reverted it. That was wrong, and wrong in the exact way
this project keeps correcting: **`tools/lab-threshold-sweep.mjs` dumps
`scoreEntry().score` and is retrieval-only** — no bounded context, no display
caps, no `maxWeakMatches`. The displayed weak band moved **+2 / −4**, not +15,
and both gains are lateral swaps at near-identical scores.

I had spent the evening telling a concurrent session to check which quantity a
lever touches, and then read a retrieval census as a display effect myself. The
check that settled it is the one that should have run first: diff
`weakMatches` through `analyzeDocument`, not crossings through the sweep.

Reproduce: `weak-band-diff.mjs`.
