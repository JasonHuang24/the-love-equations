# LE Lab hookup — transaction layer (pass 01)

**Date:** 2026-07-31 · **Canon:** 479 → 485 · **Analyzer:** 2.6.10 · main-loop, no subagents
**Companion:** `md/doctrine-transaction-layer-01.md` §8 defined this pass. Threshold record:
`md/lab-hookup-threshold-adjudication.md`.

This is the separate pass the doctrine batch deferred. It did three things: measured what the
widened canon actually retrieves, **found and fixed a retrieval defect the batch introduced**,
and added the Lexicon vocabulary the six concepts were missing.

---

## 1. The headline: a reported gain that was mostly an artifact

Commit `b004842` claimed the batch's justifying result — that the archived AI-companion sources
(`13-wheatley-counterfeit-connections`, `14-common-sense-ai-companions`), which scored **zero**
against the whole canon at 470 concepts, now landed on `frameworks:substitution-layer` at
0.540–0.547. That was 153 credible-line gains and it was presented as the capability win.

Measuring capture *quality* rather than capture *count* showed what it really was:

```
frameworks:substitution-layer top-slot in 14-common-sense-ai-companions: 125 maps
distinct scores: 1  ->  0.540
margin over runner-up: median 0.226
```

**One score, 125 times.** A single multi-word alias — `"AI companion"` — was firing an exact
phrase hit at a fixed strength and winning by a wide margin over unrelated runners-up (*The
Clock*, *Attention*, *one-parent households*). Multi-word aliases land in the phrase surface,
and a phrase hit also forces **High** confidence, so every bare mention of the words "AI
companion" mapped at High to the Substitution Layer. Among the captures:

- "the suicide of 14-year-old Sewell Setzer III, who had developed an emotional attachment…"
- "a 19-year-old who was encouraged by an AI companion to kill the late Queen Elizabeth"
- "AI chatbots and companions – risks to children and young people"

Those are child-safety claims. The Substitution Layer is an economics claim, and its own prose
explicitly **declines** to make findings about AI companions ("a watch item, not a finding …
declines to publish a number"). The canon entry was therefore asserting coverage the page
disclaims — a false signal that the site has doctrine here when the honest state is that it
does not.

**Fix:** removed `"AI companion"` from `aliases` and `"AI girlfriend"` from `phrases`; added
claim-shaped phrases instead — `alternative to real partners`, `replace real relationships`,
`replacement for a real relationship`, `substitute for a partner`, `instead of a relationship`.
The match surface now targets the **claim** (substitution) rather than the **topic** (AI).

Result, verified by probe:

| Probe | Before | After |
| --- | --- | --- |
| "…AI companion apps are a good alternative to real partners if real partners are not available" | 0.547 (topic hit) | **0.610** (claim hit) |
| "Pornography acts as a substitute for a partner, which makes withdrawal easier to sustain" | mapped | **0.610** |
| "He stopped dating entirely and spends his evenings gaming instead of looking for a partner" | mapped | **0.508** |
| Wheatley source, total substitution captures | **143** | **1** — the one passage that makes a substitution claim |

The threshold sheet records the unwinding: **144 of 155 credible-line movements are
`frameworks:substitution-layer`**, 152 of them losses. The earlier "153 credible gains" and this
"152 credible losses" are very nearly the same set, which is the cleanest possible statement
that the gain was an artifact of one over-broad alias.

**Standing lesson.** Alias breadth buys capture count, and capture count is not coverage. Judge
a new entry's retrieval by score *variance* and *runner-up margin*, not by how many passages it
wins: a uniform score across dozens of captures is the signature of a topic magnet. This also
revises the earlier claim in `doctrine-transaction-layer-01.md` §6 — the C2 gap that Checkpoint
01 recorded is **still open**, and the Lab correctly reports it as open again.

## 2. Corpus coverage, 21 sources

Measured with the shipped analyzer against canon 485. Set-asides are excluded, as retrieval
never runs on them.

- **Population:** 2,404 retained claim units / 2,287 set aside (0.91:1).
- Sources 13 and 14 fall back to 15 and 7 mapped respectively — the honest post-fix number, and
  a live doctrine lead rather than a solved problem.
- Checkpoint-01 re-run: `02-fem-centrism` maps 10 of 20 claim units (was zero at 450 concepts,
  before the Operative Frame); `04-heteropessimism` maps 12 of 44 (was 1 of 28). Source 03
  (Gottman) is excluded from the corpus by recorded decision, so S2 was not re-run.

## 3. Gate-vocabulary check

Gated every corpus passage exactly as the analyzer does and inspected the **set-aside** side for
the three vocabulary families this batch introduced. Per governance, a systematic miss family is
a benchmark-append *proposal* requiring Jason + reviewer sign-off — never a quiet classifier
change. Findings:

| Family | Set-aside hits | Verdict |
| --- | --- | --- |
| search economics | **0** | No miss family. A clean null: the gate is not dropping search-cost vocabulary. |
| signal / verification | **2** | Not systematic. One is ACS gender-misreporting (correctly non-domain); one is mate-choice verification of status, arguably in-domain but isolated. |
| substitution | **34** | Dominated by 29 AI-pornography *consumption statistics* in Wheatley. |

**No benchmark append is proposed.** The substitution family is the only candidate, and the
honest reading is that a porn-viewing rate is a consumption statistic, not a relational claim —
the same call the checkpoint made when the gate correctly set aside 73% of Tomassi's law and
media material. Recorded here so the next pass can disagree with a stated reason rather than
rediscovering it.

## 4. Lexicon terms — the retrieval spine

Six terms added (`lexicon.html`, Shared section), one per new framework, chosen to add
*distinct* retrieval vocabulary rather than restate titles:

`Search cost` · `Costly signal` · `Network approval` · `The re-entry discount` ·
`Substitute good` · `The calibration error`

Each carries a `commonMisreading` and a `boundaryCondition` in the overlay, authored against the
measured contract (decisive frame · no `MISREADING_DENIAL_CUES` negator · 10–18 words). **All
six were verified to fire**, rather than assumed to:

| Term | Words | Self-hit | Stance | Score |
| --- | --- | --- | --- | --- |
| Search cost | 15 | ✓ | Contradicts | 0.828 |
| Costly signal | 13 | ✓ | Contradicts | 0.755 |
| Network approval | 14 | ✓ | Contradicts | 0.766 |
| The re-entry discount | 15 | ✓ | Contradicts | 0.751 |
| Substitute good | 13 | ✓ | Contradicts | 0.760 |
| The calibration error | 15 | ✓ | Contradicts | 0.766 |

6/6 self-hit at High, zero negation parity on every one.

## 5. Pins and provenance

Canon 479 → 485; Lexicon 84 → 90; misreadings 485; boundaries 479 — moved in the same commit.
The `lab-analyzer` Availability pin returned to **0.538** at 485: the six Lexicon terms and the
alias removal move IDF in opposite directions and it landed back where it started. Sixth round
trip on a number that has never been the assertion.

**A note on the frozen band.** It was regenerated while the Lab **v2.6.10** release was still in
flight in another session, so it records analyzer 2.6.10 against then-uncommitted code. That
release has since landed as `e02ddda`, and the full suite was re-run green against it before
this commit, so the band and the shipped analyzer agree. `SCORING_CONFIG_HASH` is unchanged
(`bt0a7p`) either side.

## 6. Still open

1. **C2 (AI companionship) is a live doctrine gap again**, correctly. The site has no entry that
   makes a claim about synthetic companionship, and the Lab now reports that instead of hiding
   it behind an alias.
2. Adjudication remains open across three sheets (transaction layer, review, hookup).
3. The other two new frameworks batches (population layer, market container) have had no
   equivalent capture-quality audit. `frameworks:clearing-order` taking a regression equation
   ("where H is husband's education…") at 0.556 and a chart axis label ("Never Married Previously
   Married Married 100") at 0.540 suggests the same audit would be worth running there.
