# Post-restoration sweep — canon 532, restored corpus

**Date:** 2026-07-31 · **Canon:** 532 (`1.0.0+19b16e04659d`) · **Analyzer:** 2.6.11
**Scoring config:** `bt0a7p` (unchanged) · **Corpus:** restored, 21 sources
Read-only: no entry, overlay, page, band, fixture or threshold was modified by this run.

Run at Jason's instruction after the corpus was re-acquired, to answer two things: what the
adjudication gate says now that it can run again, and whether `statistics:stat-desire-prediction`
is over-broad — the open question behind the deliberate red on `lab-analyzer.test.mjs` test 8.

---

## 1. The gate is clean, and it is genuinely running again

`npm run test:lab` chains with `&&`, so the deliberate red on test 8 stops the suite before the
threshold step. These were therefore run directly:

```
ok 1  the frozen band is internally consistent
ok 2  an outstanding credible-line verdict blocks, and the weak backlog may only fall
ok 3  no corpus pair crosses an admission line without a ruling      (8.0 ms, NOT skipped)

adjudication: 0 credible (blocking) · 516/516 weak (ratchet) · 4725 candidate-floor
```

The sweep reproduces the committed band's provenance exactly — **2448 passages × 532 entries =
1,302,336 pairs**, 428,730 at or above the 0.02 dump floor — matching `scoredPairs` in
`tests/fixtures/threshold-neighbors.json` to the number. Band and tree agree.

**What `ok 3` does and does not license.** It says the current tree crosses no admission line
the band has not already recorded. It is **not** evidence that the 507 → 532 canon growth crossed
none, because the band was **regenerated** after that growth (`127cec7`), and regenerating a
frozen band is a baseline reset — it absorbs crossings rather than reporting them. The
regeneration was measured before it was applied (rulings 5427 → 5427, weak 516/516, credible 0,
no orphaned rulings), which is the right discipline and is why nothing is believed to have been
lost. But the crossings from that growth were **absorbed, not adjudicated**, and no instrument
can now recover them: see §5.

## 2. `stat-desire-prediction` is NOT over-broad — the probe is the thing that aged

The entry's total reach across the whole restored corpus is **two captures**:

| Score | Conf | claim-like | Source | Passage |
| --- | --- | --- | --- | --- |
| 0.486 | Low | yes | `09-conroy-beam-discrepancies` | "In particular, what happens when our mates do not match our preferences?" |
| 0.431 | Low | yes | `01-pew-online-dating` | "Most U.S. adults are skeptical or unsure that dating algorithms can predict love." |

Two captures, two distinct scores, both claim-like, zero non-claim junk, and the second is
*precisely* the entry's subject — dating algorithms predicting love. That is a well-behaved
entry, not a topic magnet, and nothing here resembles the `"AI companion"` defect.

**Consequence for the ruling.** Option (b), narrowing the entry's match surface, would be the
wrong repair: the only thing narrowing protects is a synthetic probe, and the thing it would
cost is the Pew capture, which is correct.

**The sharper measurement.** The probe scores **0.475**. Real corpus text on this topic scores
**0.431–0.486**. The probe now sits *inside* the band of legitimate captures, which is the exact
sense in which it stopped being novel: it can no longer act as a negative control because it is
no longer distinguishable from a true positive. A negative control has to be outside the
distribution it is controlling for.

This is evidence for an adjudication, not the adjudication. Jason has ruled (a) leave red, twice.

## 3. Capture quality of all 20 new entries — no magnets

First capture audit these entries have had. Corpus-wide mapped top-slots: **857** (was 790 at
canon 491, before both the canon growth and the corpus restoration).

| Entry | Captures | Distinct | Med margin | Best | Non-claim |
| --- | --- | --- | --- | --- | --- |
| `stat-sexual-communication` | 11 | 11 | 0.067 | 0.758 | 2 |
| `stat-cycling` | 6 | 4 | 0.124 | 0.646 | 1 |
| `stat-cohab-timing` | 4 | 4 | n/a | 0.523 | 0 |
| `stat-wedding-hazard` | 3 | 3 | n/a | 0.617 | 0 |
| `stat-relationship-education` | 3 | 1 | 0.058 | 0.518 | 0 |
| `stat-desire-prediction` | 2 | 2 | 0.046 | 0.486 | 0 |
| `stat-marriage-market`, `stat-acquaintance-matching`, `stat-sex-frequency` | 0 | — | — | — | — |
| all 11 `pills:` entries | 0 | — | — | — | — |

The magnet signature — many captures at ~one distinct score with a wide runner-up margin — appears
**nowhere**. The densest entry has as many distinct scores as captures.

`stat-relationship-education` is the only one worth a second look (3 captures, 1 distinct score),
but n = 3 is far too small to call a rate, and its margin is a healthy 0.058.

## 4. Ten of the twenty are unvalidated against real text

All eleven `pills:` entries and three statistics entries have **zero** captures. That is expected
rather than alarming — the corpus is 21 academic and journalistic sources, and *shit test*,
*dread*, *cope*, *LMS* and the Black Pill scoreboard do not appear in Pew reports or
marriage-research papers.

But it means their misreadings have only ever fired on **synthetic self-tests**. They are
verified to be authored correctly and are unverified against text a reader would actually paste.
Closing that needs a corpus source in the manosphere register, which is the same gap
`md/lab-hookup-transaction-layer.md` §6 flagged for the AI-companion material.

## 5. The confound that is now permanent, and worth stating once

The corpus that came back is not the corpus that was lost: **1 source byte-exact, 13 within 2%,
7 drifted beyond 2%, 1 excluded by prior decision.** Only `02-fem-centrism` reproduced exactly,
and only because it was captured from an immutable Wayback `id_` URL — the other twenty were
live-fetched, and a live page cannot be re-fetched byte-identically.

So any comparison spanning the loss conflates two independent changes: **canon growth
(507 → 532)** and **corpus drift (20 of 21 sources superseded)**. There is no baseline that
isolates either, and there will never be one. The pre-loss band measured a population that no
longer exists.

Practical rule this leaves behind: a threshold baseline is only meaningful against a fixed
corpus, so **the corpus hash set is part of the baseline's identity**, not context around it.

## 6. What was and was not done

Read-only. The band was not regenerated, no pin was moved, no fixture was touched — in
particular `tests/lab-analyzer.test.mjs` test 8 remains red by ruling, and this record is
evidence for that adjudication rather than a step toward closing it.

Method notes, both downstream of how the corpus was destroyed: the corpus was **copied** into a
detached worktree rather than junctioned, and the copy was deleted before the worktree was
removed. Every number here came from importing the shipped analyzer, not from a re-implementation.

**Open, and needing Jason:**

1. **Test 8** — reword the probe (the measurement in §2 supports it) or leave red. Ruled (a) twice.
2. **The absorbed crossings** (§1) — unrecoverable; noted so no later reader mistakes `ok 3` for
   a statement about the 507 → 532 growth.
3. **The ten unvalidated entries** (§4) — needs a register the current corpus does not contain.
