# A numeral is not a concept, and the engine cannot tell

Ruled 2026-07-30. **REJECT**, reversing an ACCEPT of 2026-07-29, on
`seg-00025-0dyedk3.claim-02 | statistics:stat-pay-to-play | minCredibleScore`.
No engine change: three candidate discriminators were measured and all three are
refused. Frozen in `tests/lab-match-behavior.test.mjs`.

## The pair

A Pew sentence about which platform leads among users under 50, displayed as a
credible match for an entry about who **pays** for dating apps.

```
score               0.432
sharedTokens        [online, dat, users, 50]
queryCoverage       0.471        canonCoverage  0.036
phraseHits []   exactAliasHits []   signatureHits []   promotedAliasHits []
```

Nothing anchors it. Four loose tokens, and one of them is the bare integer `50`
— the entry's synopsis reports "58% vs 50%", the passage says "under 50". Two
unrelated uses of the same two digits.

It reached credible during the cultural-register doctrine merge, which moved IDF
across the whole canon, and it was swept up in a bulk `--rule ACCEPT` stamp on
2026-07-29. Reopening it was Jason's call on 2026-07-30. The ruling carries a
`supersedes` block recording the verdict it replaces, because a reversal that
erases what it reversed is not a record.

## What was ruled alongside it

Three different Pew passages map to this one entry, all within a thousandth of
0.43, each with its own ruling key. They were being described — by me, in the
handoff and in `md/lab-overlay-tranche3.md` — as one pair oscillating across the
line. They are not, and a ruled key can never re-enter PENDING anyway
(`if (rulings[key]) continue;` in the merge).

```
0.432  seg-00025  REJECT   "Tinder is the top online dating platform among users under 50."
0.431  seg-00030  ACCEPT   "Around six-in-ten paid users (58%) say ... positive ..."
0.429  seg-00013  ACCEPT   "Current or recent online dating users refers to the 9% ..."
```

`seg-00013` is a survey **definition** — it tells you who counts as a current
user. Its fall below the line is the engine getting it right, so ACCEPT.
`seg-00030` is very nearly the entry's own last sentence. Only `seg-00025` is
wrong, and it is wrong in a way the score cannot see.

## Three discriminators, measured over all 21 sources, all refused

### 1. Stop counting bare numerals as distinctive

Of the 904 pairs at or above `minCredibleScore`, **25 share a numeral and 23 of
those have no phrase or alias anchor**. That sounds like a clean target until you
sort them by score:

```
0.638  frameworks:satisfaction-flywheel  [two study eight sexual satisfaction 207 newlyw coupl]
       "...eight assessments of sexual and marital satisfaction from 207 newlywed couples..."
0.634  statistics:stat-pay-to-play       [dat online report paid apps 41 vs 29]
       "Men who have dated online are more likely than women to report having paid ... (41% vs. 29%)."
0.564  statistics:stat-marriage-age      [median age first marriage 20 bureau censu]
       "The median age at first marriage rose from 23.2 to 27.4 for men and from 20.8 to 25.6 ..."
```

The three strongest rows in the set are **correct matches in which the numeral is
the entry's own statistic**. `stat-pay-to-play`'s synopsis literally says "41% of
male users have paid versus 29% of women", and the passage says "(41% vs. 29%)".
On a statistics page the digits *are* the evidence.

Only 2 of the 23 rest on two or fewer non-numeric tokens besides. Banning
numerals removes the best matches in the set to reach the worst.

### 2. Require more canonCoverage

The defect sits at `cc=0.036`, the lowest of the 23, which is suggestive until
the bands are laid side by side:

```
correct      0.634   cc=0.087
coincidental 0.456   cc=0.087
correct      0.523   cc=0.076
coincidental 0.483   cc=0.044
THE DEFECT   0.432   cc=0.036
```

There is no line that keeps 0.076 and drops 0.036 without being fitted to these
particular cases, which is the thing this project keeps refusing to do.

### 3. Exclude numerals from `admissionDistinctiveShared`

The narrowest option, and it does not move this pair at all.
`admissionDistinctiveShared` is `[online, users, 50]`; dropping the numeral
leaves 2, and `minAdmissionDistinctiveShared` is 2. Checked before proposing it,
which is why it is not proposed.

## What is frozen instead

`tests/lab-match-behavior.test.mjs` pins the behavior on **authored** passages —
`lab-corpus/` is gitignored third-party text (md/RERUN.md §1), and the
adjudicated sentence stays in `tests/fixtures/threshold-neighbors.json` as IDs
and scores.

```
"Online dating users spend about 50 minutes a day inside these apps."
    -> statistics:stat-pay-to-play  0.451  DISPLAYED

"Roughly 50 new online dating services launched last year, and most users never heard of them."
    -> statistics:stat-divorce      0.467  DISPLAYED
```

The second is the one worth keeping. A sentence about services launching
displays a **divorce** statistic as a credible match, which makes this a property
of the scoring surface rather than a flaw in one entry's synopsis.

## If it is revisited

The promising direction is not a token rule and not a coverage floor, but asking
whether a numeral is being matched **as the entry's own statistic**. A canon
entry knows its numbers; a passage quoting `41% vs 29%` against an entry whose
synopsis reports 41 and 29 is a different event from a passage saying "under 50"
against an entry that happens to contain a 50. That distinction is available —
the entry side of the comparison has the context — and it was not built.

This is the second finding this month that points at the same missing capability:
the meta-register defect's recorded next step is also "scope it to the ENTRY side
of the comparison." Two independent defects wanting the same asymmetry is worth
noticing.
