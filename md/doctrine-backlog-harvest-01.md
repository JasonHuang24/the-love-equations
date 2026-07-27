# Doctrine Backlog — Harvest #1

**Source:** Pew Research Center, "Key findings about online dating in the U.S." (Feb 2, 2023; survey of 6,034 U.S. adults, July 2022). Tier 1.
**Run:** LE Lab v=1.7 · canon 1.0.0+6dc9bff7b0fe · 2026-07-26 · 34 retained claims (30 machine + 4 visitor includes) · 50% mapped · 17 research candidates · 4 pressure tests · 5 set-asides (all sentence-splitter shards, correctly binned).

---

## A. What LE already covers (validation, no action)

Seventeen claims mapped, Statistics dominating (~69% of mappings). The source *corroborates* existing canon rather than challenging it — alignments are Supports/Resembles throughout, no Contradicts:

- App usage, motives, and the casual-sex gender gap → "Why people are actually on the apps", "Casual sex is the only reason with a gender gap" (best match of the run, 63/100).
- Meeting-channel shift → "Do most couples meet on dating apps now?"
- Message-volume asymmetry (women's half) + safety-perception gap → "The same market floods one side and starves the other."
- Male disengagement signal → "Are men checking out of dating?"

## B. Doctrine candidates (my triage of the 17 queue items, grouped into proposed artifacts)

Ranked by evidence strength × distinctness from existing canon:

1. **The inbox asymmetry (chart).** 54% of women felt overwhelmed by messages vs 25% of men; 64% of men felt insecure from lack of messages vs 40% of women. The overwhelmed half already maps to "floods one side"; the insecure half is unmapped. One chart, four bars, Tier 1 — the cleanest single-source statistical portrait of the attention imbalance LE already argues. → **Statistics**, companion cross-cite to the floods/starves chart.
2. **Pay-to-play and who pays (chart + Frameworks note).** 35% ever paid; men 41% vs women 29%; paid users report better experiences (58% vs 50% positive). Reads as men buying exposure — a live tie-in to the Exposure lever and the market-asymmetry doctrine. Pressure test correctly flags the selection effect (happier users may simply be the ones who'd pay); keep that caveat in the method line. → **Statistics**, cross-cite Five Levers · Exposure.
3. **The harassment ladder, women under 50 (chart).** 56% unsolicited explicit images / 43% continued contact after refusal / 37% offensive names / 11% threats of physical harm. Pairs with the safety-perception dip (53%→48% since 2019) and 60% support for background checks. → **Statistics**; possible Gender Dynamics cross-cite.
4. **Who actually meets scammers (Mythbuster candidate).** 52% of all users have encountered a suspected scammer — and men under 50 are the *most* likely to say so (63%), against the grandma-victim stereotype. Docket question: "Are romance-scam targets mostly older women?" → **Mythbuster**, with FTC loss-data as the second source before grading.
5. **The abundance trap (doctrine gap — Frameworks candidate).** 37% say the apps offer too many options; only 13% say too few. Queue found no credible canon home — LE appears to have no choice-overload/paradox-of-choice doctrine despite it underpinning several existing arguments (rotation, the 80/20 discourse, decision fatigue). This is the run's genuinest *doctrine* gap. → **Frameworks**, needs the psych literature (Schwartz, Iyengar) before drafting.
6. **Under-30 disillusionment (coverage gap).** 18–29s split 35/33 on whether apps made partner-search easier, vs 42/22 among all adults. LE already asserts this vibe ("Blackpilled before they start", GD) — this is the missing numeric anchor. → **Statistics** garnish or GD card citation upgrade.
7. **Algorithm skepticism (Lexicon/low priority).** Only 21% believe matching algorithms can predict love. Amusing reflexive angle for the compatibility-calc pages' honesty notes.
8. **Platform demographics (context only).** Tinder 46% overall / 79% of under-30 users; Match dominates 50+; usage by age and marital status. Chart garnish, low doctrine value on its own.

## C. Lab defects surfaced by the run (process outputs, not doctrine)

1. **Intake segmentation bug — "vs." shards (loop assignment candidate, small and bounded).** The sentence splitter breaks on the period in "vs." inside parentheticals: five orphan fragments ("27%).", "16%).", …) were set aside, and worse, their parent claims are retained *truncated* ("…more likely than women to have tried online dating (34% vs."). Degrades ledger and export quality on any stats-heavy source. Fix: abbreviation guard (vs., U.S., e.g., i.e., approx., No.) in claim-unit segmentation + a regression test on a parenthetical-stats fixture. Propose as the next loop assignment after the intake cleanup merges.
2. **Gate vocabulary gap — dating-app mechanics (benchmark-append proposal).** Four genuine in-domain claims were set aside because no frame covers app-interaction vocabulary (messages received, matches, profiles, swipes): the men's-insecurity stat, the 9%-past-year continuation, the threats-of-harm stat, and the algorithm-belief continuation. All were recovered via visitor includes (the fail-open contract worked), but the miss family is systematic. Proposal per governance: ~6 agreed benchmark appends (app-mechanics claims labeled retain + 2 non-domain "message/match" traps labeled ignore) + one systematic fix (a dating-app-interaction outcome/mechanism frame). Requires Jason + reviewer sign-off before any classifier change.
3. **Anaphora cue narrowness (note only).** "That includes…" / "By contrast,…" continuations don't qualify for context inheritance. Later prototyping (see `md/lab-benchmark-append-proposal-01.md`) showed the cue extension does not deliver these cases — the continuity gate correctly blocks zero-overlap continuations — so this family is a documented known limitation handled by the include override.

---
*Overrides used in this run: 4 includes, disclosed in the analysis and exports. Set-asides remaining: 5 shard fragments (5 words), correctly non-domain. Follow-ups: C1 → loop assignment 2 (abbreviation-safe segmentation); C2 → `md/lab-benchmark-append-proposal-01.md` (6 appends + measured F1/F3 fix, awaiting maintainer + reviewer sign-off).*
