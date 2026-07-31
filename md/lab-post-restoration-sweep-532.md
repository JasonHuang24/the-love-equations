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

## 4. Fourteen of the twenty take no top slot — and that is not what it first looked like

**This section was wrong twice in its first version and is corrected here rather than quietly
edited.** It said "ten", and it read the number as evidence the entries were unvalidated. The
count is **fourteen** (all eleven `pills:` entries plus `stat-marriage-market`,
`stat-acquaintance-matching`, `stat-sex-frequency`), and the inference does not survive contact
with the retrieval layer.

**The instrument, not the entries.** §3 counted **top-slot** captures — the entry `analyzeDocument`
ranks first. "Zero captures" was then read as "never surfaces to a reader", and those are not the
same claim. Measured against the sweep dump, none of the fourteen is dark; every one is reachable,
with **224 to 1,562** scored pairs each:

| Entry | Pairs ≥0.02 | Best | ≥weak | ≥credible |
| --- | --- | --- | --- | --- |
| `stat-sex-frequency` | 1562 | 0.483 | 182 | 2 |
| `stat-acquaintance-matching` | 1258 | 0.501 | 52 | 3 |
| `stat-marriage-market` | 1104 | 0.424 | 61 | 0 |
| `pills:page-rp:dread` | 549 | 0.617 | 8 | 1 |
| `pills:page-bp:love-conquers-all` | 224 | 0.521 | 5 | 1 |
| `pills:black-scoreboard` | 970 | 0.414 | 15 | 0 |
| remaining eight `pills:` | 292–643 | 0.263–0.302 | 1–3 | 0 |

**Case A — validated, just outranked.** `stat-sex-frequency` and `stat-acquaintance-matching` are
credible matches on real corpus text, at ranks 3 and 4:

- `stat-sex-frequency` **0.483 credible**, rank 3, on *"Mean Marital Satisfaction, Sexual
  Satisfaction, Sexual Frequency, across Waves of Measurement…"*, behind `satisfaction-flywheel`
  0.564 and `stat-sexual-communication` 0.494.
- `stat-acquaintance-matching` **0.501 credible**, rank 4, on *"The search for a romantic partner:
  the effects of self-esteem and physical attractiveness on romantic behavior."*, behind three
  physical-attractiveness entries tied at 0.540.

They reach readers. They are validated against real text. The earlier claim that they need a
register this corpus does not contain was simply false for these two.

**Case B — the admission gate refusing a coincidence, correctly.** The two highest scores any
`pills:` entry achieves are both *rejected* by the shipped pipeline, and inspecting why is the
most reassuring result in this document:

- `pills:page-rp:dread` scores **0.617** on *"He also has to be your only romantic partner."* —
  and lands in `weakMatches` with **no credible match on that unit at all**.
- `pills:page-bp:love-conquers-all` scores **0.521** on *"I am someone who is looking for love."*
  — also weak-only.

`isCredibleCandidate` is `score >= minCredibleScore` **AND** `hasCredibleMatchEvidence`, which
demands a signature hit, phrase hit, exact alias hit, or ≥2 admission-distinctive shared tokens.
Both sentences clear the score and fail the evidence: they are topic-word coincidences —
*romantic partner*, *love* — on entries about dread game and about love conquering practical
disagreement. **A high score with thin evidence is exactly what that gate exists to refuse, and
it refused it.** This is the gate working, not an entry failing.

**What actually remains.** The eight `pills:` entries topping out at 0.263–0.302 never approach
the credible line, and *shit test*, *cope*, *LMS* and the Black Pill scoreboard genuinely do not
appear in Pew reports or marriage-research papers. Their misreadings have still only fired on
synthetic self-tests. That residual is real and narrower than first stated, and closing it needs a
corpus source in the manosphere register — the same gap `md/lab-hookup-transaction-layer.md` §6
flagged for the AI-companion material. **No entry needs changing.**

**The lesson, which is the third of its kind in this document:** a metric's definition is part of
its claim. "Zero captures" meant zero *top slots*, and was read as zero *reach*. Same family as
§1's `ok 3` (a skipped gate reads as a pass) and §5's absorbed crossings (a regenerated baseline
reads as no change).

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

1. ~~**Test 8**~~ — **RULED AND CLOSED.** Jason adjudicated (c), reword the probe. §2 is why (b)
   was rejected: an entry reaching two passages, one of them exactly on subject, is not
   over-broad, and narrowing it would have cost the correct capture. See §7.
2. **The absorbed crossings** (§1) — unrecoverable; noted so no later reader mistakes `ok 3` for
   a statement about the 507 → 532 growth.
3. **The unvalidated entries** (§4) — **re-scoped after measurement, and it was never ten.** Of
   the fourteen with no top slot, two are credible matches on real text and merely outranked, and
   the two highest-scoring `pills:` matches are coincidences the admission gate correctly refuses.
   The genuine residual is the **eight** `pills:` entries topping out at 0.263–0.302, which needs
   a manosphere-register corpus source. That is a source-acquisition decision for Jason, not an
   entry defect: **no entry needs changing.**

## 7. The ruling, and the selection rule it leaves behind

Jason held (a) until the entry could be measured, then ruled **(c) reword the probe**. The new
probe is *"A new claim says volcanic ash decides which romantic partner sneezes more in autumn."*

It was chosen by measurement against two criteria, because the old one died of being written in
vocabulary the canon later grew into:

1. **Headroom below `minCredibleScore`.** Best match 0.336 (`lexicon:term-the-consumer-unit`)
   against the 0.43 line — **0.094 clear**. Seven candidates were measured.
2. **Outside the canon's growth direction.** *"does the laundry"* (0.346) and *"parks the car"*
   (0.335) scored as well or better and were **rejected anyway**: `statistics` now carries
   `stat-equal-earner-labor`, so household-labour vocabulary is precisely where this canon is
   expanding. Seasonal physiology is not.

**The general rule: a negative control has to sit OUTSIDE the distribution it controls for.**
The old probe's failure was drifting inside it — 0.475 against genuine corpus captures of
0.431–0.486 on the same topic. Headroom alone is not enough, because headroom erodes in whatever
direction the canon is growing. If this probe ages out too, re-measure candidates the same way
rather than taking the first sentence that passes.

Verified after the reword, with the corpus present so the tripwire is armed rather than skipped:
`npm run test:lab` — **18 steps · 18 ok · 0 failed**.
