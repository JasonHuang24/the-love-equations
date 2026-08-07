# Doctrine pressure test 07 — third parallel Claude + ChatGPT run

**Run date:** 2026-08-06. Main run **19:44–20:44 MDT (60 minutes)**, extended
from 20:58 at Jason's request. Times are from the commit timestamps, not
estimated. (Claude integrator lane. The scout closed out after **2h01m**; its findings,
proposals and ledger were folded in a fourth integration at Jason's request.)

**Correction, recorded rather than quietly fixed:** the first version of this
record dated the main run 19:44–21:50 and reported it as meeting the protocol's
two-hour floor. It did not. The clock was read once at 20:22 and then estimated
forward across the second integration, so the run was reported at roughly twice
its length. **The two-hour floor was not met in the main run** — the work in it
is unaffected, but the duration claim was wrong.
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
adjudicable crossing, and made all commits. In an extension hour after the
main run closed, Jason delegated the credible-line adjudication to Claude (§4)
and the two unreached lanes were worked: **lanes F (dating after loss) and H
(long-distance) each produced one capture and one gap, both HELD** — see §5. The scout worked
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
| 6 | F | Psychology Today — Married to Two People: The Romantic Life of Widows | 1,362 | 16.4% | gap (the unsevered bond), **HELD** |
| 7 | H | Psychology Today — Can Long-Distance Relationships Really Work? | 461 | **0.0%** | gap → **The Distance Discount** |
| 8 | H | NPR Life Kit — Long-distance relationships are tough | 1,078 | 7.4% | gap (same subject, confirms) |
| 9 | F | VICE — Do You Believe in Love After Loss? | 5,584 | 12.0% | gap (confirms cycle 6) + instrument |

Captures 1–3 ran against canon `1.0.0+c4f092f8c7d3` (566); 4–5 against
`1.0.0+7a2150b7a15f` (567); 6–8 against `1.0.0+48254605825a` (568); 9 against
`1.0.0+c08dbe01725d` (569). Raw source text stayed out of the repo; SHA-256s are
in the findings file.

## 3. Implemented surfaces (canon 566 → 571, four integrations)

- **1.1 The Courtship Buffer** (under the Conversion Ladder; **folded from the
  scout's P3**) — alcohol's measured effects are real, small and land on
  different rungs, while the discourse treats its removal as a reveal. Sayette
  et al. (2012, *Psychological Science* 23(8):869–878; 720 social drinkers,
  360/360, three-stranger groups, alcohol/placebo/control over 36 minutes,
  FACS-coded — the placebo arm is what makes it a pharmacological result);
  Bowdring & Sayette (2018, *Addiction* 113(9):1585–1597; k = 16, n = 1,811,
  **d = 0.19** overall, **d = 0.30** opposite-sex, **d = 0.04** same-sex and not
  significant); Hamilton, Armeli & Tennen (2022, *Journal of American College
  Health*; 540 undergraduates — a drink **offer** related to the odds of sex
  controlling for drinking level, while accepted drinks were not, so the signal
  is a cue rather than a dose).
- **3.2 The Typology Shortcut** (under the Interaction Gate; **folded from the
  scout's P2**) — a folk type becomes an instrument the moment it ranks or
  deletes somebody. Chopik et al. (2025, *Innovation in Aging* 9(Suppl 1):1395;
  954 couples, mean age 55.4 — virtually no evidence that love-language matching
  predicts outcomes beyond personality and attachment); Mostova, Stolarski &
  Matthews (2022, *PLOS ONE* 17(6):e0269429; 100 couples across 31
  nationalities — what tracks satisfaction is the **continuous item-level gap**
  between preferred and felt expression, i.e. responsive behaviour rather than a
  shared category); Pittenger (1993, *RER* 63(4):467–488) on the MBTI's warrant,
  with its 1993 scope stated on the page.
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
- **27.1 The Distance Discount** (under the Agreement Surface) — separation read
  as a defect in a bond rather than a feature of its arrangement, discounted
  before anyone looks at the bond. The parent already records a
  structure–satisfaction separation from its CNM meta-analysis; this is the same
  shape from another direction. Jiang & Hancock (2013, *Journal of
  Communication* 63(3):556–577) name the belief in their own abstract and report
  equal-or-greater trust and satisfaction via more adaptive self-disclosure and
  more idealized perceptions; Stafford, Merolla & Castle (2006, *JSPR*
  23(6):901–919) supply the counterweight — about half of separated couples
  reach proximity, the other half end during separation, and **a third of those
  who reunite end within three months**. Both abstracts read verbatim at source.
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
from a pre-sweep copy before every re-sweep. **405 rulings entered** (integration
1: 165 — 11 weak A / 130 weak R / 23 loss-A / 1 credible REJECT; integration 2:
97 — 2 weak A / 81 weak R / 13 loss-A / 1 credible REJECT; integration 3: 143 —
108 weak R / 33 loss-A / 1 credible REJECT / 1 credible loss-A). **Both credible
verdicts were held as recommendations at first report; Jason then delegated
pt07's credible-line adjudication to Claude in session, so they are entered as
rulings and nothing is outstanding.** `ruledBy` stays `Claude` — the delegation
is recorded in the adjudication sheet rather than by attributing a verdict to
Jason that he did not personally make. Neither REJECT triggers a targeted
fixture pin: neither pair is one the canon wants at any threshold, so there is
no prior behaviour to preserve. 6/6 new misreadings fire
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

## 5. Deliberately NOT implemented — and Jason's rulings on each

**Jason ruled on all three open items on 2026-08-06, approving the recommended
disposition for each.** They are therefore settled decisions, not integrator
recommendations awaiting review. The rulings are recorded inline below.


- **The lane-F entry. RULED: Jason approved holding it (2026-08-06)** — it stays HELD until a primary source is read at source; media-reported figures do not license authoring. *The unsevered bond* — an ending that removes a partner
  from the world without removing them from the relationship, where `sixth-rung`
  owns exit and re-entry but assumes the prior bond is over. Now carried by
  **two captures across two outlets** (cycles 6 and 9) and drafted in the
  findings file, but **not implemented**: neither capture supplies a primary
  source that has been read at source, and authoring a doctrine entry on
  media-reported evidence alone is what the pt04 verification step exists to
  prevent. Lane H took the one remaining integration slot because it was the
  stronger case — a total coverage hole against a partial one.
- **Dargie et al. (2015)'s figures.** Its citation checks out at Crossref
  exactly as the capture reported; its abstract was unreadable at both the
  publisher and Semantic Scholar, and the PMID a search offered belongs to a
  different 2015 *JSMT* article. So N = 1,142, the 56.6% stereotype figure and
  the "few differences" finding stayed capture-reported, and **no number from it
  appears on the page** — it is named as a same-direction replication only.
  - Superseded note: at the two-hour close this section read "lanes F and H were
    not reached." That was true then. The one lane-H URL abandoned during the
    main run was constructed rather than found and 404'd; the capture that
    eventually ran came from a searched URL.
- **P1, the Verification Stack — DEFERRED, not rejected. RULED: Jason approved the deferral (2026-08-06).** It stays deferred until the three gating documents can be read at source, and its Tier 1 leg is repaired or re-tiered before any fold. Jason's fold
  instruction set an explicit precondition: re-read *both full Whitty papers and
  Ofcom's technical report* before adding named stages, accuracy rates,
  predictor sizes or efficacy estimates. That precondition is unmet. The Whitty
  2019 abstract verifies cleanly (261 participants; several correlates of
  accuracy; detection was difficult; the paper itself proposes adding a "human
  detection of scam versus genuine profiles" stage) but neither full paper is
  readable, and Ofcom's technical report is bot-walled — the same wall the scout
  logged as `abandoned(bot-blocked)` in the ledger before citing the RCT's
  figures anyway. **The entry's whole substance is the staged model, which is
  exactly what the precondition gates**, so folding a version stripped of stages
  and rates would ship the shell and lose the point. The proposal is good and
  should be folded when someone can read those three documents. Its **only
  Tier 1 leg cannot stand on an unfetched source** and must be repaired or
  re-tiered first.
- **Lane A, dating and matchmaking television — the scout's "no doctrine
  needed" verdict is preserved.** The Meeting Channel already owns pool
  composition and screening order; the Third-Party Layer is an adjacent analogy
  only, since its evidence concerns social-network approval rather than
  commercial producers. A critic's review, a confounded 169-season
  reconstruction and attributed lawsuit allegations do not create or extend
  doctrine. Production control, casting, compensation, editing, participant
  safety and observed outcomes stay separate variables. **No canon change**, and
  that is the correct outcome rather than a shortfall.
- **The common-bigram magnet class. RULED: Jason approved a dedicated measured pass (2026-08-06)** — the alias audit gets its own baseline, sweep and adjudication rather than riding on a doctrine commit. Starting point in `md/pt07/claude-findings.md`, with the caveat recorded there that `lab-corpus/` is the wrong population for the media-facing risk. The `sexual desire` alias magnet (see §6.1) is the first target. It is an authored-surface
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

0. **The 0.540 exact-phrase magnet is a general defect class, not three
   coincidences.** A canon entry whose title or alias is a common English
   bigram becomes a magnet on that bigram, pinning any sentence containing it
   at **exactly 0.540 Medium** regardless of meaning. Isolated and reproduced
   for `frameworks:the-wall`: "She hung the photographs on the wall above the
   couch in the living room" → 0.540, `whyMatched: Exact phrase: "the wall"`,
   while "He painted the garden wall last summer" → **no candidate**, so the
   trigger is the bigram and not the word. This subsumes pt06's "Wall Street
   Journal" observation, which was recorded then as a finance-adjacency
   artifact — it was not; it was this. Confirmed instances: `the wall`,
   `sexual desire` (below), and pt06's `dating coach`. The remedy is an alias
   audit for common-bigram surfaces with its own baseline and adjudication,
   deliberately not attempted in this run.
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
5. **Extraction offenders for the protocol's drop list.** The Conversation's
   inline "Love IRL / Quarter Life" series-promo block sits *inside* the article
   body and produced 3 claim-like units in cycle 4. Psychology Today needs three
   separate handles on one outlet: `pathways_card` (renders **twice**, top and
   foot), `card-group[^"]*` — **the modifier classes matter**, cycle 5's
   "Essential Reads" residue was not a second widget but a drop pattern too
   narrow to match `card-group--condensed card-group--border-bottom d-lg-none` —
   and a cut at an inline "Other Reads" `<ul>` of author self-links, which no
   drop pattern reaches because it is not a container at all.

## 7. Verification

- `npm run test:lab`: 18/18 (**exit 0**) on both integration commits, read from
  the real exit code. Floors, ratchets and frozen benchmarks untouched; no test
  value moved except the four authored count pins, twice (566 → 568 concepts,
  63 → 65 Rules & Frameworks, 566 → 568 misreadings, 533 → 535 boundaries).
- Commits: `4b12d36`+`cb253ea` (integration 1) · `e2d215c`+`154935a`
  (integration 2) · `dbdf21b`+`745eaf7` (integration 3) · `47788f9`+`c3bbf65`
  (the scout fold) plus the record commits. **Pushed to `origin/main` at
  `fa8b140` on Jason's explicit in-session approval**, suite 18/18 exit 0
  against the exact tree that went up.
- `md/pt06/chatgpt-handoff.md` deleted at Jason's instruction — its purpose was
  served and its source of truth, `md/pt06/chatgpt-findings.md`, is tracked and
  already folded into pt06's run record. The pt07 scout findings and the three
  proposals are **kept**: they are the committed record, and P1 is still live
  work. `md/doctrine-distillation-handoff.md` is not a scout artifact and is
  linked from `md/INDEX.md`, so it also stays.
- The extension hour changed no canon surface, no test and no fixture: it closed
  the adjudication as documentation and added two analyzed captures. Canon
  stands at 568 and the suite at 18/18, exit 0.
