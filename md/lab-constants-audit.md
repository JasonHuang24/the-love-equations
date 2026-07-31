# Calibration audit, part two: the constants the first pass named and did not reach

2026-07-30, the same day as `md/lab-calibration-audit.md` and continuing it. That
pass covered the band, the `dumpFloor` and the three display caps and closed by
naming five it had not measured. This is those five, plus two the work turned up.

**No constant moved.** What shipped is three assertions, one exposed internal, and
one comment rewritten from a deferral into a decision. The first pass found the
shape worth hunting — not a value that is wrong, but a relationship between two
constants that is true by luck — and hunting it again found three more.

---

## The finding that reframes the rest

Two of these constants are **almost inert on the 21-source archive, and that is
not evidence against them.** The archive is essays and papers: long sentences,
formal register, few referential fragments. `shortUnitWordCount` governs
utterances of four and five words; the context boosts govern a sentence leaning
on the one before it. Neither is what an academic paper does.

`md/lab-entry-side-asymmetry.md` established that a change must be measured on
the population that can SEE it. The corollary the first pass did not need and
this one does: **the archive is the right population for retrieval and display
constants and the wrong one for discourse and short-utterance constants.** Where
that applies below, the fixture built for the job is measured instead.

---

## 1. The three relationships, now asserted

`tests/lab-analyzer.test.mjs` — *"a constant that is only sound because another
constant holds says so"*. All four branches RED-verified.

### 1a. The cultural frame's weight against `plausibleSocialStructureScore`

This is the one worth the whole pass. Jason ruled option 1 of
`md/lab-gate-cultural-register.md` over option 2, and the entire difference
between them is that a culture-and-shaping passage with **nobody in the sentence**
stays out. The only thing producing that is `weight: 2.5` on
`cultural-frame-mechanism` being unable to reach `plausibleSocialStructureScore:
3`, because a frame score is a MAX over matched definitions. The frame's own
comment says so; nothing enforced it, and the two literals sit ~180 lines apart
in different structures.

Measured from both sides on the domain benchmark, and they are the same defect:

| variant | domainRecall | ignorePrecision | junkRecall | discard-cases retained on this frame |
|---|---|---|---|---|
| **shipped (2.5 vs 3)** | 1.000 | 1.000 | **0.844** | **1** (`pv-07`, a known exception) |
| weight raised to 3 | 1.000 | 1.000 | 0.781 | 7 |
| threshold lowered to 2 | 1.000 | 1.000 | 0.781 | 7 |

Six extra passages the benchmark says to discard — `cr-12` `cr-13` `cr-14`
`cr-15` `pv-04` `pv-08` — retained on culture-and-shaping language alone. That is
rejected option 2, shipping by accident.

**The suite already caught this**, as a `junkRecall` ratchet failure listing six
ids, three hundred lines from either literal. `tests/lab-gate-register.test.mjs`
even guesses at the cause in its failure text — *"or its weight has been raised to
or past plausibleSocialStructureScore"* — as prose in a test that fires for a
different reason. The new assertion names the two numbers directly.

`decisive: false` is asserted alongside it, because a decisive frame retains on
its own and routes around the weight comparison entirely.

### 1b. `minClaimWords 4` against `shortUnitWordCount 6`

The short-unit penalty fires on units under 6 words; a unit under 4 words gets
`claimLikelihood` 0 and is never claim-like. So the window where the penalty can
touch a **claim** is {4, 5} — two word counts wide. Raise the floor to the
ceiling and the penalty vanishes from the ledger, the coverage denominators and
the research queue while still firing out of sight.

**The first draft of this assertion was wrong** and the measurement caught it. I
wrote that a sub-4-word unit is "never scored". It is: `analyzeDocument` scores
every unit the gate retains, and only the reader-facing surfaces filter on
`isClaimLike`. The proof was a discrepancy in my own table — setting the floor to
4 gains 10 displayed credible matches while disabling the penalty outright gains
18, and 8 of them are sub-4-word retained passages that only the exports carry. A
rig disagreeing with the engine is the rig being the bug, including when the rig
is a sentence in a comment.

### 1c. `minPhraseLength 4` against `minSingleAliasLength 5`

A single-word alias must clear `minPhraseLength` to enter `entry._phrases`, then
clear `minSingleAliasLength` to be a hit. The stricter floor decides and the
looser one is invisible, and they are 1,000 lines apart.

`md/lab-canon-alias-pass-01.md` already warns *"do not lower minSingleAliasLength
to 4"* for exactly this reason. That is where `dumpFloor`'s rule lived too: in a
document, next to the person who happened to write it down.

Measured: the 4-character floor deletes **6 of 798** alias surfaces — `SMV` twice,
`Age`, `4B`, `LMS`, `PSL` — and every one of the six is also under 5 characters,
so it currently removes nothing `minSingleAliasLength` would not remove anyway.

### What was NOT asserted, and why

`max(contextBoost) 0.045 < minWeakScore 0.25 − candidateScoreFloor 0.08` is true,
and `md/lab-adjudication-at-scale.md` cites it as part of why the candidate-floor
tier can never put a match in front of a reader. It is not pinned, because
`applyBoundedContext` refuses outright to boost any candidate whose local score
is under `minWeakScore` — so the numeric margin can never be the only thing
standing there. Belt-and-braces couplings do not earn assertions; silent ones do.

---

## 2. `shortUnitWordCount 6` / `shortUnitPenalty 0.72` — keep, and know what it is

Across the 2,401 retained claim-like segments:

```
word counts   min 4 · median 27 · p90 47
under 6 words   6 of 2,401  (0.2%)
under 8 words  26 of 2,401  (1.1%)
```

Displayed-match diffs over all 21 sources:

| variant | credible | weak |
|---|---|---|
| floor 4 (off for claims) | +10 / −0 | +8 / −10 |
| floor 5 | +7 / −0 | +8 / −7 |
| **floor 6 (shipped)** | — | — |
| floor 7 | +0 / −12 | +11 / −14 |
| floor 8 | +0 / −20 | +20 / −41 |
| floor 10 | +0 / −46 | +46 / −107 |
| penalty OFF (×1.0) | +18 / −0 | +80 / −18 |

So the penalty suppresses 18 credible matches, and the floor is monotone and
well-behaved in both directions — no cliff, no accident.

**And on the population it was built for, it decides nothing.**
`tests/fixtures/short-utterance-matrix.json` is the fixture that exists to ask
what happens to short utterances. Twenty cases; six sit in the penalty's {4, 5}
window; **all six are bound by `domain-gate`**. Across the whole matrix the
binding constraint is the gate on 17 of 20, the claim-word floor on 1, the
admission threshold on 1, and nothing on 1. The penalty is the binding constraint
on **zero**.

That is not an argument to remove it — it suppresses 18 real credible matches on
the archive, and defence in depth behind a gate that can be widened is worth
having. It is an argument against ever tuning it against the short-utterance
fixture, which cannot see it. **Keep 6.**

## 3. The three context boosts — two have never fired here

```
displayed matches carrying a context boost   7 of 2,401 segments
  same canon concept        7 fired · 0 crossed minCredibleScore
  declared dependency       0
  declared related concept  0
```

| variant | credible | weak |
|---|---|---|
| all three OFF | +0 / −0 | +2 / −2 |
| all three doubled | +1 / −1 | +2 / −2 |

Turning the entire bounded-context mechanism off changes **no credible match** on
2,401 passages. `contextBoostDependency 0.035` and `contextBoostRelated 0.025`
have never fired on this archive at all.

Read carefully, because the obvious reading is wrong. The mechanism is exercised
and correct — `tests/lab-analyzer.test.mjs` has a dedicated case for a short
referential continuation receiving traced one-sentence help, and
`applyBoundedContext` carries the strictest evidence requirements in the file.
What the archive lacks is the *discourse shape*: twenty-one essays and papers do
not write "That is why she left" as its own sentence. A transcript does, and
transcripts are what the Lab was built to read.

**Keep all three, and record that this archive cannot judge them.** The honest
next measurement is a transcript corpus, which the Lab does not have. Moving them
on this evidence would be tuning against a population that cannot see them —
exactly the mistake §2 warns about.

## 4. `plausibleSocialStructureScore 3` — keep, and refuse the tempting 4

| value | domainRecall | ignorePrecision | junkRecall | splits |
|---|---|---|---|---|
| 1 | 1.000 | 1.000 | 0.781 | 0 |
| 2 | 1.000 | 1.000 | 0.781 | 0 |
| **3 (shipped)** | **1.000** | **1.000** | **0.844** | **1** |
| 4 | 0.988 | 0.988 | **0.854** | 1 |
| 5 | 0.988 | 0.988 | 0.854 | 1 |

Value 4 clears every floor and *raises* `junkRecall`. It should be refused
anyway, and the two cases that move say why:

```
ds-13  expected ignore   3: retain  ->  4: ignore
       "The studio patched the game so ranked players get fewer unfair matches."
im-22  expected retain   3: retain  ->  4: IGNORE
       "Neighborhood turnover means the faces at the park change before
        familiarity can turn into contact."
```

It bins one video-game false positive by losing one real relationship claim. The
benchmark's own gloss on `domainRecall` is *"real relationship claims must not be
silently lost"*, and it records its known misses as **all fail-open**. Trading a
fail-open miss for a fail-closed one is a regression in this project's terms even
with both metrics above their floors — and `junkRecall` is a ratchet, so 0.854
would be a one-way door bought with a lost claim. **Keep 3.**

Observability note, found on the way: `plausibleRelationalAnchor` and
`plausibleSocialStructure` are separate conditions that share one reason code,
`plausible-human-relational-frame`. The record cannot say which of the two
admitted a passage. Not fixed here — a reason-code split is a change to every
frozen verdict in three fixtures.

## 5. `maxNearestConcepts 3` — the same defect as the weak band, one surface over

```
research-queue items                1,643
nearestConcepts shown  median 3 · max 3
items at the cap       1,634 of 1,643  (99.5%)
```

The research card lists three nearest concepts sliced from `result.candidates`,
which is itself capped at `maxCandidatesPerUnit 8` plus escapes. Two cuts, no
denominator, 99.5% of items truncated — structurally identical to what the ledger
was doing before v2.6.9, and now cheap to fix, because `weakBandTotal` is on the
payload as of this morning.

**Not shipped.** It is new reader-visible surface, which is outside this docket.
Recommended, and it is a small change: the same label on the research card and in
`analysisToMarkdown`'s *"Nearest LE concepts"* line.

## 6. `nonDomainDecisiveScore 4` — dead, and staying

Flagged in v2.1.2 as *"no decision in this file reads it… flagged for the next
calibration pass."* This is that pass, and the flag was right: two occurrences in
the whole repository, the declaration and the `analyzerInternals` re-export, no
reader anywhere including the tests.

**Kept, now for a stated reason rather than by deferral.** Deleting it changes
`SCORING_CONFIG_HASH`, which every export carries as provenance, so a removal that
changes no behaviour would make every prior export's config stamp disagree with
the current one — and the re-export is a compatibility surface for callers
written against v2.1.2. A dead constant that costs nothing is cheaper than a
provenance discontinuity that buys nothing. The comment now says this instead of
promising a later decision.

---

## Handed to other lanes, not done here

**Eight untyped single-word aliases are silenced by `minSingleAliasLength` and
only four of them have been ruled on.** The census:

```
silenced by the 5-character floor   12 of 88 untyped single-word aliases
  ruled dead on purpose (pinned in tests/canon-index-fixtures.mjs)
    game · wall (x2) · sham
  ordinary English, same class, unruled
    face · body · age · game (lexicon:term-game)
  DISTINCTIVE SLANG, same class as the four that WERE typed, unruled
    cope · simp · 4b · psl
```

> **Ruled 2026-07-30, and the grouping above was wrong.** These are not one
> class. `simp` and `4B` were typed; `cope` and `PSL` are reached by multi-word
> aliases instead, because typing them maps the ordinary sense
> (`md/lab-slang-alias-typing.md`). The remaining four — `face`, `body`, `age`,
> `game` — all stay dead: typed standalone they add 75 credible matches across
> the archive of which none are right, and displace two that were
> (`md/lab-generic-title-aliases.md`). **The list is now closed.**

`SMV`, `LMS` and `rizz` were typed `standalone` precisely because the floor was
silencing them. `cope`, `simp`, `4B` and `PSL` are the same shape — Lexicon terms
whose whole purpose is to name a piece of vocabulary — and nothing in the record
says they were considered. This is alias work, not constants work, and typing an
alias is a canon edit, so it goes to that lane rather than being done quietly
here.

## Reproducing

```
constants-a.mjs    alias-surface census; the two length floors; the dead constant
constants-b2.mjs   the gate sweep, with the SUITE'S metric formulas
constants-c.mjs    shortUnitWordCount, the context boosts, maxNearestConcepts,
                   all as displayed-match diffs over the 21 archived sources
```

`constants-b.mjs` is the first draft and is kept as the mistake: it invented its
own definitions of `domainRecall` and `ignorePrecision` from the `family` field
and reported 0.844 where the suite reports 1.000, and guessed a `pairs` key that
does not exist, reporting 0/0 splits. Both numbers looked plausible.
