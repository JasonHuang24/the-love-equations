# Doctrine pressure test 07 — third parallel Claude + ChatGPT run

**Run date:** 2026-08-06, 19:44–21:50 MDT (Claude integrator lane; the scout
was still working its lanes at the time of writing and has **not** closed out)
**Status:** Implemented and verified; commits local, **no push without Jason**.
**Lane:** Parallel pressure test under `md/pt07/PROTOCOL.md` — Claude as
integrator/sole committer (**Opus 5, high effort** — pt04–06 ran Fable),
ChatGPT/Codex as scout. Method: `md/doctrine-pressure-test-04.md`, run
two-handed per pt05 and pt06.

## 1. Run design

Third two-agent run on one checkout, coordinated through the append-only ledger
`md/pt07/CLAIMS.md`. Claim collisions observed: zero. Claude worked lane E
(desire-discrepancy discourse, 3 captures) and lane G (neurodivergence and
dating, 2 captures), analyzed 5 articles, ran two full integrations, ruled every
adjudicable crossing, and made all commits. **Lanes F (dating after loss) and H
(long-distance and digital-first) were not reached** — see §5. The scout worked
lanes A–D and had filed 12 claim lines and three proposals by 21:40; its
findings file and proposals stay uncommitted, per the protocol, until its
closeout.

## 2. Claude's source ledger (full detail in `md/pt07/claude-findings.md`)

| # | Lane | Article | Words | mapped % | Verdict |
|--:|---|---|--:|--:|---|
| 1 | E | Psychology Today — Dealing With a Sexless Relationship | 855 | 40.6% | instrument (magnet) + gap candidate |
| 2 | E | VICE — Is Your Sex Life Dead? There's a Subreddit For That | 1,214 | 21.7% | gap + instrument |
| 3 | E | The Conversation — Women's sexual desire often goes undiscussed | 908 | 60.0% | gap → **The Attribution Fork** + instrument |
| 4 | G | The Conversation — Why dating can be tough for autistic people | 724 | 17.4% | gap candidate + instrument |
| 5 | G | Psychology Today — When Rejection Sensitivity Meets the Dating Scene | 697 | **0.0%** | gap → **The Ambiguity Tax** + instrument |

Captures 1–3 ran against canon `1.0.0+c4f092f8c7d3` (566); 4–5 against
`1.0.0+7a2150b7a15f` (567). Raw source text stayed out of the repo; SHA-256s are
in the findings file.

## 3. Implemented surfaces (canon 566 → 568, two integrations)

- **3.1 The Ambiguity Tax** (under the Interaction Gate, `frameworks.html`) —
  running an interaction has an interpretive price: catching hints, weighing
  tone, grading a soft answer, deciding whether a refusal happened. Canon
  already owns courtship vagueness as a *tactic* (the indirect-game group) and
  as a *shield* (the Plausible Deniability Freeze); it did not own the vagueness
  as a **bill with a distribution**. Crompton et al. (2020, *Autism*
  24(7):1704–1712, 72 participants in nine diffusion chains) locates mixed-pair
  information loss in the *pairing*; Hull et al. (2017, *JADD* 47(8):2519–2534,
  92 autistic adults) prices the camouflaging workaround at exhaustion and
  threats to self-perception; Rowney-Smith et al. (2026, *PLoS One*
  21(1):e0314669, five people in two focus groups, tiered accordingly) reports
  anticipated refusal costing more than refusal. Scope stated on the page:
  neurodivergent courtship is the case that makes the distribution visible, not
  the only place the cost falls.
- **24.1 The Attribution Fork** (under the Desire-State Split) — the Desire-State
  Split establishes that a desire gap belongs to the pair; this entry is about
  the move that comes next. A gap gets located in a body, a person, the
  relationship or the situation, and the location chosen decides who is asked to
  change, whether the remedy is clinical or conversational, and whether the
  other partner is present when the answer is settled. Maxwell et al. (2017,
  *JPSP* 112(2):238–279, six studies, N = 1,896) on sexual growth vs destiny
  beliefs; Thomas & Gurevich (2021, *Feminism & Psychology* 31(1):81–98) on the
  diagnostic frame's default direction; Donnelly (1993) as the origin of the
  frequency measure the discourse converts into an identity.

Both entries were authored as `smv-sub` blocks with `data-parent`, deliberately
**outside** their parents' `rf-entry` blocks: the first draft nested inside, and
the build's whole-block link harvest silently pushed `desire-state-split`'s
`sourceLinks` from 3 to 6. Moving the block fixed the parent rather than moving
the pin.

## 4. Adjudication (sheet: `md/lab-pressure-test-07-threshold-adjudication.md`)

Two full pt04 cycles, each with its own baseline `--dump` before any edit and
its own `--neighbors` regen onto the existing fixture, with the fixture restored
from a pre-sweep copy before every re-sweep. **262 rulings entered** (integration
1: 165 — 11 weak A / 130 weak R / 23 loss-A / 1 credible REJECT; integration 2:
97 — 2 weak A / 81 weak R / 13 loss-A / 1 credible REJECT). **Both credible
rulings are recommendations FLAGGED FOR JASON.** 6/6 new misreadings fire
Contradicts end-to-end at High (0.733–0.739). Magnet check: zero verbatim corpus
occurrences for every new alias. Census lane grew 14,354 → 16,181, recorded.

**Five credible-line false positives were removed by revising the authored
surface before shipping, never by a pin or a threshold**, and the pt06 lessons
predicted three of them exactly:

1. A boundary carrying the high-IDF word *conceptual* put a bibliography line at
   0.561 credible. Reworded; crossing gone.
2. A long parenthetical example list in a synopsis added retrieval mass across
   sixteen corpus sources. Examples moved to a callout (not match surface); weak
   gains 187 → 156, credible 2 → 1.
3. **The pt06 short-unit token pair fired live.** The 8-token corpus sentence
   "He also has to be your only romantic partner." hit the new entry at **0.608
   credible** because two of its misreadings carried *romantic* **and**
   *partner*. Carrying only one of the pair dropped weak gains 158 → 104 and
   credible 5 → 3, and killed a second FP at 0.470 with the same edit.
4. A boundary phrase *five participants … no effect size* reached a methods
   sentence at 0.454. Reworded to *five people … no magnitude estimate*;
   credible 3 → 2, neither remaining row on a new entry.

## 5. Deliberately NOT implemented

- **Lanes F and H were not reached.** Two lanes of four went unclaimed: dating
  after loss (widowhood re-entry) and long-distance/digital-first relationships.
  One lane-H URL was claimed and immediately abandoned — the URL was constructed
  rather than found, returned 404, and no capture was ever made. The lane-E and
  lane-G work each produced a full encompassing entry, and two integrations plus
  262 rulings consumed the run. Both lanes remain open with nothing spent on
  them.
- **The scout's three proposals** (`chatgpt-proposal-verification-stack`,
  `-typology-shortcut`, `-courtship-buffer`). All three arrived well-formed
  against the encompassing standard, and one of them (the Typology Shortcut)
  parents onto the same Interaction Gate this run extended. None was folded: the
  scout had not closed out, and the protocol requires the integrator to
  re-verify every load-bearing figure at its primary source before folding — six
  DOIs and four agency documents across the three, which the remaining run time
  could not cover honestly. They are the first thing a follow-up run should do.
- **The `sexual desire` alias magnet** (see §6.1). It is an authored-surface
  defect with a clean measured fix available — the alias `sexual desire decline`
  on `desire-maintenance-split` — but changing it is a scoring change to an
  entry this run did not otherwise touch, and it deserves its own baseline,
  sweep and adjudication rather than a ride on a doctrine commit. pt06 deferred
  its `dating coach` magnet on the same reasoning.
- **Donnelly's 16% / N = 6,029.** Widely restated and almost certainly correct,
  but the abstract returned 403 at both Taylor & Francis and JSTOR. The paper is
  cited for the definitional point only; no figure from it appears on the site,
  and the page states why.

## 6. Instrument findings (recorded, not fixed here)

1. **The `sexual desire` exact-phrase magnet, measured across three captures.**
   `frameworks:desire-maintenance-split` carries the alias `sexual desire
   decline`, whose leading bigram is a generic domain term. Every sentence
   containing "sexual desire" lands on that entry at **exactly 0.540 Medium**
   regardless of content: 9 of 13 mapped rows in cycle 1, **17 of 21** in cycle
   3, including "Sexual desire is unique to each person" and "Sexual desire is
   not a problem to be solved." Cycle 2 is the control — an article on the same
   subject that never uses the phrase produced zero rows on the entry. The magnet
   also **displaces correct matches**: the cycle-1 thesis sentence is a
   discrepancy claim that `desire-state-split` scored 0.487 and the magnet took
   at 0.540. Same class as pt06's `dating coach` finding, with a much larger
   measured footprint (the corpus carries 234 occurrences of the bigram).
2. **A reproducible whole-capture zero with the domain gate passing.** Cycle 5:
   28 claim units, **not one candidate at any score**, `adjacentDoctrine` empty.
   Both probe sentences re-tested in isolation classify **relevant** at the gate
   and still reach nothing, so this is coverage, not gating. Canon carries 22
   entries mentioning rejection and every one of them is sender-side — how to
   approach and how to read the answer. Nothing addresses the receiver's
   interpretive cost.
3. **The domain gate handles neurodivergent-dating discourse correctly** — 20
   relevant / 6 uncertain / 22 ignored in cycle 4, with no sign of the wholesale
   binning pt04 saw on therapy vignettes and pt06 saw on step-parenting. That
   was the lane's second question and it is a clean negative result.
4. **Two more false positives at displayed Medium on single tokens:** "This
   rejection was a turning point in Dawn's relationship" →
   `when-standards-become-a-shield` at 0.577 (on *rejection*), and "Desire can be
   cultivated at any stage of life" → `stat-remarriage-gap` at 0.615 (on *stage
   of life*). Plus a four-word transition, "Online dating has its own set of
   challenges," taking the **top** score of its capture at 0.654 on
   `signal-cost-rule`.
5. **Two more extraction offenders for the protocol's drop list:** Psychology
   Today's "Essential Reads" inline recirculation block (distinct from the
   already-known `pathways_card`, which renders twice), and The Conversation's
   inline "Love IRL / Quarter Life" series-promo block, which sits *inside* the
   article body and produced 3 claim-like units in cycle 4.

## 7. Verification

- `npm run test:lab`: 18/18 (**exit 0**) on both integration commits, read from
  the real exit code. Floors, ratchets and frozen benchmarks untouched; no test
  value moved except the four authored count pins, twice (566 → 568 concepts,
  63 → 65 Rules & Frameworks, 566 → 568 misreadings, 533 → 535 boundaries).
- Commits: `4b12d36` (integration 1) · `cb253ea` (stamp) · `e2d215c`
  (integration 2) · `154935a` (stamp) — all local only, **not pushed**.
