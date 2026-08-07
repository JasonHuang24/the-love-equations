# LE Lab — pressure test 07 threshold adjudication

**Status:** LIVE and CLOSED. Rulings entered in
`tests/fixtures/threshold-neighbors.json`; suite green (exit 0).

**Credible-line authority for this run:** on 2026-08-06 at 20:58, after the two
integrations were reported to him with both credible verdicts held as
recommendations, **Jason delegated pt07's credible-line adjudication to
Claude in session** ("You do the adjudication please."). The two verdicts below
are therefore entered as **rulings, not recommendations**, and nothing here is
waiting on him. `ruledBy` stays `Claude` in the fixture, which is the accurate
record: Jason delegated the call, he did not make it, and no verdict is
attributed to him. The delegation covers pressure test 07 only — the credible
recommendations standing from pt05 and pt06 are unaffected and remain flagged.

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

### Credible line — 1 crossing, **REJECT** (ruled, under Jason's delegation)

`seg-00041-07zafuy.claim-08|frameworks:attribution-fork|minCredibleScore` ·
`08-mcnulty-early-marriage · 31` · 0.000 → **0.433**

> "As Byers stated, 'Relationship satisfaction at Time 1 was not associated with
> the change in sexu[al satisfaction]…'"

A quoted null result about the satisfaction loop, sitting three thousandths
above the line. It carries no attribution content — nothing in it locates a
desire gap anywhere — and `satisfaction-flywheel` is the entry that owns the
bidirectional loop. **REJECT:** the pair belonged at 0.000 and the crossing was
not earned. No targeted fixture pin follows, because there is no prior good
behaviour to preserve: the pair has never been one the canon wants at any
threshold, and the regenerated band already records the correct side.

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

## Integration 2 — The Ambiguity Tax (canon 567 → 568)

Baseline `--dump` captured at `1.0.0+7a2150b7a15f` **before** any edit.

```
canon      1.0.0+7a2150b7a15f -> 1.0.0+48254605825a  (doctrine moved)
population 2426 retained passages x 568 entries = 1377968 pairs
changed    28895   11501 down / 17394 up
candidateScoreFloor  0.08  791 gain / 35 loss   (census lane, not adjudicable)
minWeakScore         0.25   98 gain / 31 loss
minCredibleScore     0.43    2 gain /  0 loss
```

**97 verdicts entered** (2 weak ACCEPT, 81 weak REJECT, 13 loss ACCEPT, 1
credible REJECT). Same rule as integration 1. The two ACCEPTs are
`07-van-lankveld-desire` 49 and 52 — the partner-responsiveness finding and the
Birnbaum & Reis randomly-paired-strangers study, both of which are about what
one person manages to read off another. Everything else is a methods line, a
scale item, a table caption or a passage about a different mechanism.

### Credible line — 1 crossing, **REJECT** (ruled, under Jason's delegation)

`seg-00093-12c1gq5.claim-03|hierarchy:jasons-hierarchy:secondary-factors:purity-lack-of-baggage|minCredibleScore`
· `09-conroy-beam-discrepancies · 188` · 0.429 → **0.432**

> "Participants were all in ongoing, long-term committed relationships."

A +0.003 IDF drift on a methods sentence that was already sitting a thousandth
under the line, pushed over by one added entry. A participant-description
sentence reaching a hierarchy factor about baggage is wrong at any score.
**REJECT**, and again no targeted pin: the pre-change side was 0.429, itself
only a thousandth below the line, so pinning it would freeze noise rather than
a behaviour worth defending. (The second credible row,
`stat-sexual-communication` at +0.001, already carries Jason's own ACCEPT from
an earlier epoch and stands untouched.)

### Three false positives removed before shipping — including the pt06 hazard, live

1. **The short-unit token pair, exactly as pt06 predicted.** The 8-token corpus
   sentence "He also has to be your only romantic partner." hit
   `frameworks:ambiguity-tax` at **0.608 credible** because two of the entry's
   misreadings carried *romantic* and *partner* across its surfaces. Rewriting
   them to carry only one of the pair ("drawing a partner in", "early courtship
   signalling") dropped that crossing entirely: weak gains 158 → 104, credible
   5 → 3. The pt06 lesson paid for itself on its first live test.
2. `13-wheatley-counterfeit-connections · 40` ("romantic interactions or are")
   at 0.470 died with the same edit.
3. `07-van-lankveld-desire · 53` ("This effect was most prominent in
   participants with low avoidant attachment") reached 0.454 off the boundary
   phrase *five participants … no effect size*. Reworded to "five people … no
   magnitude estimate"; the crossing disappeared and the credible count fell
   3 → 2, neither of them on the new entry.

Each edit was followed by a fixture restore and a full re-sweep.

### Verification

- `npm run test:lab` exit **0**.
- 3/3 misreadings fire **Contradicts** at High (0.734–0.738).
- Magnet check: `ambiguity tax`, `double empathy`, `camouflag`, `neurotype`,
  `unwritten rules` — **zero** corpus occurrences; `masking` 3 and `legibility`
  1, neither in a magnet shape.
- Pins moved: 567 → 568 concepts, 64 → 65 Rules & Frameworks, 567 → 568
  misreadings, 534 → 535 boundaries.

## Integration 3 — The Distance Discount (canon 568 → 569)

Baseline `--dump` captured at `1.0.0+48254605825a` before any edit.

```
canon      1.0.0+48254605825a -> 1.0.0+c08dbe01725d  (doctrine moved)
population 2426 retained passages x 569 entries = 1380394 pairs
minWeakScore         0.25  123 gain / 56 loss
minCredibleScore     0.43    1 gain /  3 loss
```

**143 verdicts entered** (108 weak REJECT, 33 loss ACCEPT, 1 credible REJECT,
1 credible loss-ACCEPT), all under Jason's delegation of pt07's credible line.

### Credible line — 1 gain, REJECT

`frameworks:distance-discount` · `22-finkel-suffocation · 475` · 0.000 →
**0.540** — "With regard to the emotional quality of living apart together
relationships…". A genuine near-neighbour and still the wrong owner:
`lexicon:term-living-apart-together-lat` owns chosen separate households in one
locality, which is not the distance case. **REJECT.** The three credible losses
are ACCEPT (all fragments resting just above the line).

### This integration was authored twice

The first attempt was **reverted in full** rather than committed part-done, and
the second reached green. Four authored-surface defects, each fixed in the
surface and never in a pin:

1. `trust and satisfaction` in the synopsis reached a corpus sentence about
   trust versus satisfaction at 0.435 credible.
2. The alias `living far apart` collided with the corpus's living-apart-together
   passage. Dropped.
3. A 7-token corpus sentence — "I am someone who is looking for love." — hit
   0.452. The short-unit hazard, for the **third** time in this run.
4. **The demo-routing pin tripped**: `mappedClaimSegments` 6 → 7. The entry was
   capturing the demo transcript's research-residue claim *"Did it show
   causation, or did compatible couples simply report more shared…"* on the
   trio **couples / report / share**, all three of which sat in the synopsis
   ("couples separated by geography report as much closeness as couples who
   share an address"). Rewritten to "people separated by geography rate their
   bonds at least as warmly as those living at one address" — pin restored at
   6 / 5 / 54.5% exactly.

A fifth defect was caught by `tools/check-mis.mjs` before it ever reached a
sweep: two successive drafts of the first misreading were **GATE SET ASIDE**,
forming no domain-relevant claim unit. Removing "couple" to dodge defect 4 had
also removed the relational-frame word the gate needs; "Two partners…" restored
it.

### Verification

- `npm run test:lab` exit **0**.
- 3/3 misreadings fire **Contradicts** at High (0.736–0.740).
- Demo pins restored by rewording, never moved.
- Magnet check: `long-distance relationship` 1 corpus occurrence,
  `geographically close` 1, `closing the distance` 0 — no magnet shape.
- Pins moved: 568 → 569 concepts, 65 → 66 Rules & Frameworks, 568 → 569
  misreadings, 535 → 536 boundaries.

## Integration 4 — the scout fold: Courtship Buffer + Typology Shortcut (569 → 571)

Baseline `--dump` at `1.0.0+c08dbe01725d` before any edit. Two entries folded
from the ChatGPT scout's closed proposals; **P1 the Verification Stack was
deferred, not folded** (see the run record §5).

```
canon      1.0.0+c08dbe01725d -> 1.0.0+54d018bff967  (doctrine moved)
population 2426 retained passages x 571 entries = 1385246 pairs
minWeakScore         0.25  340 gain / 99 loss
minCredibleScore     0.43    0 gain /  4 loss
```

**385 verdicts entered** (311 weak REJECT, 71 loss ACCEPT, 3 credible
loss-ACCEPT). **Zero credible gains** — two entries, twelve aliases and six
misreadings added without a single credible false positive surviving to the
ruling stage. That is the first integration in this run to reach the sweep
clean on the credible line, and it took three rounds of surface work to get
there.

### The credible line was cleared by rewording, in three rounds

Round 1 produced **six** credible gains. Round 2 cut them to one, round 3 to
zero. Every fix was to authored surface; no pin and no threshold moved.

1. **The short-unit hazard, fourth appearance this run.** "He also has to be
   your only romantic partner." (8 tokens) hit `typology-shortcut` at 0.607,
   and the 4-token fragment "romantic interactions or are" hit *both* new
   entries at 0.470. Cause: `romantic` sat in a boundary on each entry
   alongside `partner`/`partners`. Removing `romantic` from both — "any
   application to courtship", "mutual interest" — killed all three crossings.
2. `10-miller-alternatives` on attentiveness and replaceability hit
   `typology-shortcut` at 0.451 through the word **attentive** in a misreading.
   Changed to "steady responsiveness".
3. "I am someone who is looking for love." (8 tokens) hit `courtship-buffer` at
   0.452 through the generic **someone**, which sat in both a phrase and the
   synopsis. Removed from both.
4. **The demo pin tripped again, on the same residue claim as integration 3.**
   `mappedClaimSegments` 6 → 7: `typology-shortcut` captured "Did it show
   causation, or did compatible couples simply report more shared…" on the trio
   **show / couples / report / shared**, all four of which had landed across its
   synopsis, a misreading and two boundaries. Reworded; pin restored to
   6 / 5 / 54.5% exactly. This is now **two integrations in a row** where a new
   Interaction-Gate-adjacent entry ate that one demo sentence — worth treating
   as a standing check rather than a surprise.

### Verification

- `npm run test:lab` exit **0**.
- 6/6 misreadings fire **Contradicts** at High (0.732–0.799).
- Analyzer-demo pins restored by rewording, never moved.
- Magnet audit: all **12** authored aliases have **zero** verbatim occurrences
  across `lab-corpus/`.
- Pins moved: 569 → 571 concepts, 66 → 68 Rules & Frameworks, 569 → 571
  misreadings, 536 → 538 boundaries.
