# Pressure test 05 — threshold adjudication (snapshot)

**Date:** 2026-08-06 · **Baseline:** `78a3a67` (canon `1.0.0+ac89d0f96ca5`, 559) ·
**Final canon:** 562 entries. The fixture
(`tests/fixtures/threshold-neighbors.json`) is the source of truth; this sheet is
the snapshot. All rulings entered by Claude, 2026-08-06 — **the credible-line
rulings are Claude's recommendations adopted into the fixture and are flagged
for Jason's review before push.**

## What changed

Three sub-entries shipped (`frameworks:marriage-bar` under the Readiness Gate,
`frameworks:market-maker-cut` under the Search Cost, `frameworks:costless-exit`
under the Third-Party Layer), with overlay aliases, phrases, misreadings,
boundaries and pressure tests. Baseline `--dump` captured first (1,356,134
pairs, matching pt04's census); two `--baseline --neighbors` regens onto the
existing fixture (the second after a misreading rewrite moved 5 weak pairs).

## Rulings

- **minCredibleScore: 10 ruled — 1 ACCEPT / 6 REJECT on gains, 3 losses ACCEPT.**
  The accepted gain is Finkel's "Marriage has increasingly become a capstone
  achievement for individuals who have already achieved some level of social and
  economic success" × `marriage-bar` — the entry's subject stated by a primary
  scholarly source (the pt04 acceptance mechanism, verbatim). Rejected gains:
  two suffocation-model prose rows using marriage-economics vocabulary without
  engaging the bar-to-entry claim, one section heading, one sentence fragment,
  one methods-boilerplate row (dummy codes), and one article-title question
  ("mate retention intensity") whose vocabulary collides with `costless-exit`'s
  retention-without-intent synopsis. One rejected +0.001 drift row: Pew's
  men-pay-more stat reaching `M-TBD-45` (early-dating workload) — that exact
  number is `stat-pay-to-play`'s own synopsis stat; wrong owner. The three
  losses (reference title, garbled fragment, platform-popularity sentence) are
  junk-ish borderline matches pushed under the line by IDF dilution from canon
  growth — precision gains, same as pt04's five.
- **minWeakScore: 316 ruled — 45 ACCEPT / 271 REJECT** across the two regens.
  Standard from pt04: weak = "genuinely related nearby concept"; junk (tables,
  legends, keyword lists, reference titles, methods boilerplate, non-English
  questionnaire items, headings, fragments) and vocabulary coincidences
  rejected. Composition: `marriage-bar` 178 (28 accepted: marriage-formation
  economics, capstone/institutional-transition, marriage-timing and
  socioeconomic-gradient rows; 150 rejected: Finkel suffocation-model internals
  about need-fulfillment within existing marriages, satisfaction/sexual-
  satisfaction process research, methods rows), `costless-exit` 41 (4 accepted:
  Miller attention-to-alternatives rows — option-monitoring is the
  backburner mechanism's nearest measured relative; 37 rejected: "mate
  retention" vocabulary coincidences), `market-maker-cut` 29 (8 accepted: Pew
  paying-user rows, the algorithm-perception row, and the heteropessimism
  essay's "the goal of the big hookup apps is to keep people single" — the
  entry's subject in the corpus; 21 rejected), plus 68 scattered ±0.001 IDF
  drift rows on existing entries (all rejected as coincidences or accepted as
  correct prunings). All 50 existing-entry losses were coincidental borderline
  pairs, accepted as correct prunings (pt04 precedent).
- **candidateScoreFloor: census lane, 13,392 recorded, not adjudicable per
  `md/lab-adjudication-at-scale.md`.** Grew from 11,365 with canon size and
  with passages the new aliases' gate surfaces now retain.

## Magnet check

No pt04-style magnet signature: no flat-score credible cluster on any new
alias. The heaviest surface, `marriage-bar` × Finkel's suffocation treatise
(a 566-passage marriage monograph), produced spread scores 0.25–0.62 and was
ruled row-by-row rather than trimmed — the alias set names the concept
("marriage bar", "capstone marriage"), not a population or a bare token, and
the credible line let only the capstone sentence through. `ghosting` and
`breadcrumbing` as aliases produced zero credible crossings against the
corpus (academic prose does not use the terms; the discourse articles that do
are exactly what the entry is for).

## Misreadings

9/9 fire Contradicts end-to-end at High confidence (0.74–0.80) against their
own entries. Two first drafts failed the mechanical contract and were
rewritten before probing: one contained the morphology trap "dates", one
lacked a decisive relational-frame word and died at the domain gate — the
same two failure modes pt04 measured. The rewrite itself moved 5 weak
crossings (its "promising"/"monthly" tokens brushed AI-companion prose);
re-swept and ruled (3 REJECT / 2 loss-ACCEPT) rather than absorbed.
