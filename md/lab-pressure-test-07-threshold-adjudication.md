# LE Lab — pressure test 07 threshold adjudication

**Status:** LIVE. Rulings entered in `tests/fixtures/threshold-neighbors.json`;
suite green (exit 0). Credible-line verdicts are **recommendations FLAGGED FOR
JASON**, not his rulings.

## Integration 1 — The Attribution Fork (canon 566 → 567)

Baseline `--dump` captured at `1.0.0+c4f092f8c7d3` **before** any edit, per
`md/doctrine-pressure-test-04.md`. Band regenerated with `--neighbors` onto the
existing fixture; the fixture was restored from a pre-sweep copy before each
re-sweep so PENDINGs could not accumulate across drafts.

```
canon      1.0.0+c4f092f8c7d3 -> 1.0.0+3c62a74e5f0c  (doctrine moved)
population 2426 retained passages x 567 entries = 1375542 pairs
changed    27269   15954 down / 11315 up
candidateScoreFloor  0.08  1007 gain / 52 loss   (census lane, not adjudicable)
minWeakScore         0.25   156 gain / 46 loss
minCredibleScore     0.43     1 gain /  0 loss
```

**165 verdicts entered** (the remaining 37 weak crossings already carried
rulings from earlier epochs and stand):

| Line | Direction | ACCEPT | REJECT |
|---|---|--:|--:|
| minWeakScore | gain | 11 | 130 |
| minWeakScore | loss | 23 | 0 |
| minCredibleScore | gain | 0 | 1 |

### The rule applied, stated once

- **Weak losses → ACCEPT.** All 23 are methods lines, participant-description
  lines, reference titles and table fragments that were resting just above 0.25
  on a fragment; the IDF shift from one added entry pushed them under. Nothing
  substantive was lost.
- **Weak gains on other entries → REJECT.** All are IDF churn landing exactly on
  0.250, and each lands on the wrong entry for its passage (e.g. the section
  heading "Do Sexual and Marital Satisfaction Predict Changes in Frequency of
  Sex?" reaching `good-news-rule` and `ownership-load`; "A sexual desire score
  was calculated…" reaching `instruments:face-calculator`).
- **Weak gains on `frameworks:attribution-fork` → ACCEPT only where the passage
  itself locates desire in a named determinant.** Eleven qualify, all in
  `07-van-lankveld-desire`: passages 4, 5, 7, 45, 46, 47, 52, 107, 133, 158, 171
  — attachment-related relational needs, perceived intimacy and partner
  responsiveness, the sex-therapy emphasis on wanting, and the Birnbaum & Reis
  responsiveness study. The other 130 are REJECT: the entry entered the
  candidate set from zero and picked up generic domain vocabulary (*desire*,
  *partner*, *sexual satisfaction*, *relationship*) across sixteen corpus
  sources whose subjects are sex ratios, mate preferences, AI companions,
  friendship and the marital-satisfaction loop.

**The honest reading of that ratio:** the archived corpus contains no passage
that engages the attribution mechanism itself. The entry's evidence came from
the analyzed media captures and from primary sources, not from the corpus, and
the 130 REJECTs record exactly that.

### Credible line — 1 crossing, REJECT (recommendation, FLAGGED FOR JASON)

`seg-…|frameworks:attribution-fork|minCredibleScore` ·
`08-mcnulty-early-marriage · 31` · 0.000 → **0.433**

> "As Byers stated, 'Relationship satisfaction at Time 1 was not associated with
> the change in sexu[al satisfaction]…'"

A quoted null result about the satisfaction loop, sitting three thousandths
above the line. It carries no attribution content, and `satisfaction-flywheel`
is the entry that owns the bidirectional loop. **Recommended REJECT.** Jason's
ruling replaces this one if it differs.

### Two credible false positives removed before shipping, not ruled around

The first draft of the entry put two bibliography lines from
`07-van-lankveld-desire` over the credible line — 0.561 on "A conceptual model
of the determinants of sexual desire" and 0.499 on "Gender and Sexual
Orientation Differences in Sexual Desire". Both were driven by authored surface,
not by the engine:

1. The boundary text carried the word **"conceptual"**, a high-IDF token with no
   business being retrieval mass. Reworded; the 0.561 crossing disappeared.
2. The synopsis carried a long parenthetical example list (*medication,
   endocrine, recovery, trait, orientation, label, resentment, infant, night
   shift*). Those examples moved to a callout, which is not match surface. Weak
   gains fell 187 → 156 and credible gains 2 → 1.

Each edit was followed by a fixture restore and a full re-sweep, per the pt06
lesson that misreading and boundary text is live match surface.

## Verification

- `npm run test:lab` exit **0**, read from the real exit code.
- 3/3 new misreadings fire **Contradicts** end-to-end at High (0.733–0.739).
- Magnet check: `dead bedroom`, `sexless`, `libido`, `mismatched`, `desire
  discrepancy`, `asexual` — **zero** verbatim occurrences across `lab-corpus/`.
  (`sexual desire` has 234, which is the pre-existing magnet recorded in
  `md/pt07/claude-findings.md`, not a surface this entry added.)
- Floors, ratchets and frozen benchmarks untouched. Four authored count pins
  moved: 566 → 567 concepts, 63 → 64 Rules & Frameworks, 566 → 567 misreadings,
  533 → 534 boundaries.
