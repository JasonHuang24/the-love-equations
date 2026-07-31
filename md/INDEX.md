# md/ — the record shelf

One line per record: date the file entered git (`git log --diff-filter=A`), status, and what it
**ruled or measured** — not what it is "about". Grouped by lane, chronological within each.

Status tags: **LIVE** = still operative (a spec, convention, protocol, or open worksheet) ·
**HIST** = accurate record of completed work, superseded by nothing · **SUP → x** = its claims were
replaced; x is the replacement. The 13 `*-threshold-adjudication.md` sheets are rendered snapshots
of `tests/fixtures/threshold-neighbors.json` (each now carries an in-file stamp saying so; the
fixture is the source of truth). **★** marks a record that measured something real and closed
WITHOUT shipping a change — the most valuable kind to find later, and the hardest. **⚠** marks a
record whose own headline was later corrected, with the correction recorded in-file.

## Ops

- 2026-06-08 · [mission-notes.md](mission-notes.md) **LIVE** — the project's why + "neither rage nor cope" tone guardrails; brainstorm stash and the Claude-vs-Codex build-attribution ledger
- 2026-06-09 · [gender-dynamics-conventions.md](gender-dynamics-conventions.md) **LIVE** — dynamics-card contract ruled: one-line cards, one open card per tab, unique icons, 189-card balance; "Game" split still open
- 2026-07-27 · [lab-provenance-stamp.md](lab-provenance-stamp.md) **LIVE** — ruled: Lab-harvest doctrine carries a `.lab-stamp` chip (provenance, not an evidence grade); garnish never stamped

## Lab engine

- 2026-07-26 · [lab-schemas.md](lab-schemas.md) **LIVE** — the versioned data contracts (normalized-document, analysis, queue, diagnostics, feedback); raw source text never persisted or uploaded
- 2026-07-27 · [lab-loop-assignment-02.md](lab-loop-assignment-02.md) **SUP → direct implementation (v=2.0, in-file)** — the ChatGPT loop never delivered; Claude shipped mergeSentenceSplitArtifacts directly
- 2026-07-27 · [lab-pressure-test-brief.md](lab-pressure-test-brief.md) **HIST** — loop re-roled to read-only adversarial pressure-testing of v=2.1 under a hard no-write fence; assignments 1–2 closed
- 2026-07-29 · [FEEDBACK-PIPELINE.md](FEEDBACK-PIPELINE.md) **LIVE** — flag-to-fixture path ruled: collect/redact/adjudicate/promote, every step human; a flag earns a frozen-benchmark seat by surviving adjudication, never by arriving
- 2026-07-29 · [RERUN.md](RERUN.md) **LIVE** — re-run protocol ruled: no archived raw text survives, so re-acquired reruns SUPERSEDE rather than reproduce; the archive makes only future reruns true reproductions
- 2026-07-29 · [lab-canon-alias-pass-01.md](lab-canon-alias-pass-01.md) **HIST** — verdict badges moved off the match surface (all 65 removals attributed to the fix) + 38 ratified aliases; analyzer untouched
- 2026-07-29 · [lab-corpus-acquisition-01.md](lab-corpus-acquisition-01.md) **HIST** — GO executed for Pew/Tomassi/Seresin with SHA-256 manifest chain; Gottman EXCLUDED — an un-reidentifiable revision would corrupt the 0/17 finding while looking like a reproduction
- 2026-07-29 · [le-lab-v2.2.0-manifest.md](le-lab-v2.2.0-manifest.md) **HIST** — provenance/version plumbing with proven zero behavioral change (freeze diff 0/0/0/0); its outstanding alias item closed by canon alias pass 01
- 2026-07-29 · [lab-v2.4.0-red-manifest.md](lab-v2.4.0-red-manifest.md) **HIST** — red state frozen before any fix: 10/10 misreading polarities wrong, 9 exact-alias hits cut pre-admission, 5/5 typed-alias positives refused
- 2026-07-29 · [lab-v2.4.0-release.md](lab-v2.4.0-release.md) **HIST** — retrieval keeps every exact hit (candidate union, zero score movement), stance reads which canon surface an overlap came from, aliases typed; thresholds byte-identical
- 2026-07-29 · [lab-v2.4.1-release.md](lab-v2.4.1-release.md) **HIST** — flag-a-mapping export + review inbox + short-utterance freeze; ruled the release token and analyzer version are not the same number
- 2026-07-29 · [lab-v2.4.2-release.md](lab-v2.4.2-release.md) **HIST** — four ways a flag file could lie, fixed (trace must rebuild its row, accurate fate enum, allowlisted export); no number moved
- 2026-07-29 · [lab-v2.5.0-red-manifest.md](lab-v2.5.0-red-manifest.md) **HIST** — Sol's two CONTESTs frozen red (co-fire 5/6, stance 8/12 failing); every reviewer number reproduced to the decimal before a fixture was written
- 2026-07-29 · [lab-v2.5.0-release.md](lab-v2.5.0-release.md) **HIST** — co-fire made occurrence-local, stance clause-scoped, set-asides keep computed fields; no threshold changed; irony ruled a documented limit
- 2026-07-29 · [lab-v2.6.0-red-manifest.md](lab-v2.6.0-red-manifest.md) **HIST** — degenerate-stem state frozen: 108 of 450 entries carry 1–2-char stems; ruled Sol's 103-retained-passage population correct
- 2026-07-29 · [lab-v2.6.0-release.md](lab-v2.6.0-release.md) **HIST** — first deliberately score-moving release: minDerivedStemLength ends fragment stems; 2,168 pairs moved, 123 crossings to adjudication, zero thresholds retuned
- 2026-07-29 · [lab-v2.6.1-release.md](lab-v2.6.1-release.md) **HIST** — denylist morphology hotfix ("utilitys" asked, "utilities" missed); both comparison sides now stemmed; 3 verdicts moved
- 2026-07-29 · [lab-v2.6.1-sol-handover.md](lab-v2.6.1-sol-handover.md) **HIST** — verification brief that names its own three attack surfaces (departure from Sol's literal ruling, a knowingly bought false positive, one past-minimum change)
- 2026-07-29 · [lab-v2.6.1-record-pass-sol-handover.md](lab-v2.6.1-record-pass-sol-handover.md) **HIST** — fifth-pass brief, CLOSED by Jason: ~17 of 19 findings across passes 2–5 were defects introduced by the corrections — the loop was measuring the editing, not the release
- 2026-07-29 · [lab-v2.6.2-scope.md](lab-v2.6.2-scope.md) **LIVE** — four items carried out of the closed review loop, all ruled non-urgent (publish matchedBy, stale carries comment, stem generalization behind GENERIC_TERMS)
- 2026-07-29 · [limit-hit-ledger.md](limit-hit-ledger.md) **LIVE** — empty by design: 17 documented limits, zero real-source hits — an empty ledger IS the finding; exact-comparison test found 2 unregistered families
- 2026-07-30 · [lab-adjudication-at-scale.md](lab-adjudication-at-scale.md) **LIVE** — three lines, three treatments: minCredible BLOCKS, minWeak RATCHETS at 516, candidate-floor is CENSUS; the gate had self-disarmed
- 2026-07-30 · [lab-calibration-audit.md](lab-calibration-audit.md) **HIST ⚠** — band/dumpFloor/caps re-asked at 2,401 passages: all values kept; §C understated the screen defect by measuring the payload — corrected in-file, see lab-weak-band-label.md
- 2026-07-30 · [lab-constants-audit.md](lab-constants-audit.md) **HIST ★ ⚠** — seven more constants: none moved; 3 true-by-luck relationships asserted; its slang grouping corrected in-file after ruling (see lab-slang-alias-typing.md)
- 2026-07-30 · [lab-entry-side-asymmetry.md](lab-entry-side-asymmetry.md) **HIST** — v2.6.8: ENTRY_ARTIFACT_TERMS stripped from the entry side only — meta-register defect dies at zero displayed cost
- 2026-07-30 · [lab-threshold-sweep-widening.md](lab-threshold-sweep-widening.md) **HIST** — the sweep saw 3 of 21 sources; now manifest-derived (117 → 2,220 passages, credible surface 71 → 904 pairs), provably additive
- 2026-07-30 · [lab-weak-band-label.md](lab-weak-band-label.md) **HIST** — v2.6.9: weakBandTotal published — the ledger drew 1 nearby concept, not the payload's 3, on 70.8% of unmapped rows
- 2026-07-31 · [lab-capture-quality-audit-02.md](lab-capture-quality-audit-02.md) **HIST ⚠** — no magnets in population/sex-ratio batches; §4's framing corrected in-file at §4b: the sweep/product disagreement was hiding the short-unit-penalty exemption bug, fixed v2.6.11 in the sweep's blind spot
- 2026-07-31 · [lab-research-card-denominator.md](lab-research-card-denominator.md) **HIST** — v2.6.10: research card says "3 of N scored"; the obvious weakBandTotal denominator measured wrong ("3 of 0" on 197 items)
- 2026-07-31 · [lab-post-restoration-sweep-532.md](lab-post-restoration-sweep-532.md) **LIVE ⚠** — canon-532 restored-corpus sweep: gate clean; stat-desire-prediction NOT over-broad (the probe aged into the distribution); §4 corrected twice at 77b0293 — fourteen not ten, and "zero captures" meant zero top slots, not zero reach

## Lab gate

- 2026-07-26 · [lab-benchmark-append-proposal-01.md](lab-benchmark-append-proposal-01.md) **HIST** — 6 app-mechanics appends breach the ignorePrecision floor on the shipped build; F1+F3 frame fix restores 1.000 regression-free; F2 anaphora cue prototyped and rejected
- 2026-07-29 · [lab-gate-append-02.md](lab-gate-append-02.md) **HIST** — append #2 RED-first, 4 frame additions, no threshold moved; structural finding: a single-word alias (0.30) can never clear minCredibleScore (0.43) alone
- 2026-07-30 · [lab-gate-cultural-register.md](lab-gate-cultural-register.md) **HIST** — RULED: option 1 shipped (cultural-frame-mechanism, wt 2.5, v2.6.4) — splits 6/8 → 3/8, junkRecall rose; half the gap is doctrine
- 2026-07-30 · [lab-gate-participant-vocabulary.md](lab-gate-participant-vocabulary.md) **SUP → lab-gate-participant-narrowing.md** — P2 (male/female) adopted free; our/their rejected; the "free" set A costs 3 authored FPs the benchmark could not see
- 2026-07-30 · [lab-gate-participant-narrowing.md](lab-gate-participant-narrowing.md) **HIST** — rec-4 narrowing built and refuted (no-op or loses cr-02); shipped 9 concrete nouns instead — name people, not a category of people
- 2026-07-30 · [lab-gate-option2.md](lab-gate-option2.md) **SUP → lab-gate-option2a-shipped.md ★** — re-measured 2a free after doctrine landed (6/24 → 15/24 recall, floors untouched); recommended adoption + an explicit coupling ruling
- 2026-07-30 · [lab-gate-option2a-shipped.md](lab-gate-option2a-shipped.md) **LIVE** — 2a shipped v2.6.6; Jason ruled the coupling LIVE — canon authoring may move benchmark thresholds; 178 corpus passages rescued

## Adjudication

- 2026-07-29 · [lab-v2.6.0-threshold-adjudication.md](lab-v2.6.0-threshold-adjudication.md) **SUP → the fixture (snapshot)** — all 123 tokenizer-fix crossings ruled ACCEPT (Jason); a REJECT becomes a pinned fixture and a cost entry, never a threshold retune
- 2026-07-30 · [lab-doctrine-retention-threshold-adjudication.md](lab-doctrine-retention-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 138 crossings from the retention merge (450→463): 3 credible gains incl. operative-frame 0 → 0.540
- 2026-07-30 · [lab-gate-option1-threshold-adjudication.md](lab-gate-option1-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 783 crossings, all gains, from the option-1 gate widening: 6 credible = eb0f6cd doctrine reaching its own essay
- 2026-07-30 · [lab-gate-p2-threshold-adjudication.md](lab-gate-p2-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 219 crossings, all gains, from the P2 sexed-noun gate widening (v2.6.5): 4 credible, all on 02-fem-centrism
- 2026-07-30 · [lab-overlay-tranche1-threshold-adjudication.md](lab-overlay-tranche1-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 906 crossings from overlay tranche 1 (73 misreadings): 3 credible gains / 1 loss
- 2026-07-30 · [lab-overlay-tranche2-threshold-adjudication.md](lab-overlay-tranche2-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 1,539 crossings from overlay tranche 2 (234 misreadings): 3 credible gains / 1 loss
- 2026-07-30 · [lab-overlay-tranche3-threshold-adjudication.md](lab-overlay-tranche3-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 555 crossings from overlay tranche 3 (56 misreadings): 0 credible gains / 1 loss (stat-pay-to-play −0.001)
- 2026-07-30 · [lab-doctrine-cultural-register-threshold-adjudication.md](lab-doctrine-cultural-register-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 222 crossings from the cultural-register merge: 7 credible gains / 1 loss, ruled via the 29-verdict record
- 2026-07-30 · [lab-consumer-unit-threshold-adjudication.md](lab-consumer-unit-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 5 credible crossings from the consumer-unit merge: Jason ruled 4 ACCEPT / 1 REJECT (the queryCoverage=1.0 one-token pair)
- 2026-07-30 · [lab-doctrine-transaction-layer-threshold-adjudication.md](lab-doctrine-transaction-layer-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 6,640 crossings from the transaction-layer batch; the 153 credible gains later unwound as the AI-companion alias artifact
- 2026-07-30 · [lab-transaction-layer-review-threshold-adjudication.md](lab-transaction-layer-review-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 1,464 crossings from prose-only cold-review edits: rewording moved 32,638 pairs; 3 gains / 4 losses
- 2026-07-30 · [lab-entry-side-threshold-adjudication.md](lab-entry-side-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 294 crossings from the v2.6.8 entry-side demotion: 0 credible in either direction — the fix was free at the reader-visible line
- 2026-07-30 · [lab-mincredible-verdict-recommendations.md](lab-mincredible-verdict-recommendations.md) **HIST** — all 29 reader-visible crossings ruled ACCEPT by Jason; minCredible to zero; the single authoritative record of those verdicts
- 2026-07-30 · [lab-numeral-coincidence.md](lab-numeral-coincidence.md) **HIST ★** — REJECT, reversing a bulk ACCEPT: 4 loose tokens plus a bare "50"; 3 candidate discriminators measured and all refused
- 2026-07-31 · [lab-face-age-adjudication.md](lab-face-age-adjudication.md) **SUP → the fixture** — 93 crossings from the face/age surface edit; blocking pair RULED ACCEPT by Jason (b6de5a7); a verdict is two edits, not one
- 2026-07-31 · [lab-hookup-threshold-adjudication.md](lab-hookup-threshold-adjudication.md) **SUP → the fixture (snapshot)** — 5,312 crossings from the hookup pass: 3 credible gains / 152 losses — the substitution-layer unwinding of its own 153 gains
- 2026-07-31 · [lab-backlog-headroom.md](lab-backlog-headroom.md) **LIVE ★** — 425 of the 516 pending weak crossings are keyed to passages the restored corpus no longer contains; 91 are readable (68 in one source); recommendation: rule the 91, put the orphan class in front of Jason
- 2026-07-31 · [lab-weak-backlog-sitting-91.md](lab-weak-backlog-sitting-91.md) **LIVE** — all 91 readable weak crossings ruled hand-entered (48 ACCEPT / 43 REJECT, ruledBy Claude); ceiling ratcheted 516 → 425; every remaining pending weak row is known-unreadable; 2 losses REJECTed as real costs
- 2026-07-31 · [lab-weak-orphan-retirement.md](lab-weak-orphan-retirement.md) **LIVE ★** — Jason RULED the 425 epoch orphans RETIRED as a class (a record that no verdict is possible, never ACCEPT/REJECT); ceiling ratcheted 425 → 0 — the weak backlog no longer exists and every future weak crossing blocks until ruled

## Doctrine

- 2026-07-06 · [mythbuster-grading-review.md](mythbuster-grading-review.md) **HIST** — 33 double-audited draft rulings with fetch-verified sources proposed for ratification; M-TBD-4 and M-TBD-36 held for failing the sourcing bar
- 2026-07-26 · [doctrine-backlog-harvest-01.md](doctrine-backlog-harvest-01.md) **HIST ⚠** — Harvest #1 fully executed: 5 Pew-derived items shipped + 2 Lab defects fixed; post-triage correction in-file: B1/B3 "gaps" were already live on-site — triage must check the live site, not Lab verdicts
- 2026-07-27 · [doctrine-distillation-claude-01.md](doctrine-distillation-claude-01.md) **HIST ★** — doctrinal sources map ~0% vs Pew's 50% — Gottman 0/17 against 450 concepts named the retention gap as the site's biggest structural hole
- 2026-07-27 · [doctrine-distillation-handoff.md](doctrine-distillation-handoff.md) **HIST** — lane brief ruled: core doctrine only, Opus on scout lanes (Fable safeguards trip on bulk sweeps), "nothing fundamental is missing" is a valid result
- 2026-07-29 · [claude-doctrine-checkpoint-01.md](claude-doctrine-checkpoint-01.md) **HIST ★** — frozen lane submission: 0 doctrine-ready candidates; contempt-predictor cluster capped at 1 empirical lineage (single Gottman program)
- 2026-07-29 · [RUN-STATE.md](RUN-STATE.md) **HIST ★** — combo run closed: 3 batches reviewed and pushed, 0 doctrine promoted — clusters came back weaker than checkpoint 01; batch 2's repair never cold-re-reviewed
- 2026-07-30 · [lab-doctrine-consumer-unit.md](lab-doctrine-consumer-unit.md) **HIST** — consumer-unit term (469→470) rescued the 3 heteropessimism claims no gate option could; the live coupling cost the benchmark nothing
- 2026-07-30 · [doctrine-transaction-layer-01.md](doctrine-transaction-layer-01.md) **HIST ⚠** — batch 01 shipped 6 entries + the sixth ladder rung (470→476); §7 cold review sustained 7 of 8 findings (correlations hardened into laws) and corrected them in-file
- 2026-07-30 · [doctrine-population-flow-01.md](doctrine-population-flow-01.md) **HIST** — batch 02 shipped stock-flow-error/residual-pool/clearing-order (476→479); two entries inverted by their own evidence
- 2026-07-30 · [lab-overlay-tranche3.md](lab-overlay-tranche3.md) **HIST ⚠** — tranche 3 closed misreading coverage 469/469 (was 100/463); the "one pair oscillating" paragraph corrected in-file: three distinct Pew passages, and the loss was the engine getting it right
- 2026-07-30 · [lab-slang-alias-typing.md](lab-slang-alias-typing.md) **HIST** — simp & 4B typed; cope & PSL refused (typing maps the ordinary sense) — multi-word phrases beat typing on both axes
- 2026-07-30 · [lab-generic-title-aliases.md](lab-generic-title-aliases.md) **HIST ★** — face/body/age/game all stay untyped: standalone typing adds 75 credible matches, none right; age is a 4th failure shape
- 2026-07-31 · [doctrine-market-container-01.md](doctrine-market-container-01.md) **HIST** — batch 03 shipped sex-ratio/effective-ratio/local-market (485→488); ACS spine: male surplus peaks 30–34, crossover ~45
- 2026-07-31 · [doctrine-advice-layer-01.md](doctrine-advice-layer-01.md) **HIST** — batch 04 shipped saturation-rule/survivorship-channel/virality-filter (488→491); all three rewritten by their evidence
- 2026-07-31 · [doctrine-bargaining-layer-01.md](doctrine-bargaining-layer-01.md) **HIST ⚠** — batch 05 shipped the-surplus/outside-option/commitment-problem; the commitment-problem central claim recorded in-file as false as drafted and rewritten before ship
- 2026-07-31 · [lab-hookup-transaction-layer.md](lab-hookup-transaction-layer.md) **HIST** — "AI companion" alias was a topic magnet (125 captures at one score); removed, C2 gap honestly reopened; 6 lexicon terms fire
- 2026-07-31 · [lab-retention-reachability.md](lab-retention-reachability.md) **HIST** — retention gap split: artifact 1 was already closed unnoticed; dd-05 retrieval half shipped (loss ruled ACCEPT), dd-28 stays doctrine
- 2026-07-31 · [lab-face-age-match-surface.md](lab-face-age-match-surface.md) **HIST ⚠** — 8 candidate surfaces, 6 rejected by cost; its "any canon growth takes the canary under" rule corrected in-file: the threat is topical overlap plus entry-level edits, not conceptCount
- 2026-07-31 · [lab-synopsis-register.md](lab-synopsis-register.md) **HIST ★ ⚠** — synopsis-emptying mechanism holds; §1's outcome table WITHDRAWN in-file at §4c — three probe pairs, not entry facts; between-probe variance swamps the register difference at n≈4
- 2026-07-31 · [lab-alias-naming-rule.md](lab-alias-naming-rule.md) **LIVE ★** — prospective test VOID for predicative aliases (1/32 fire — the archive has no discourse register); rule sharpened: an alias must name the CONCEPT, not a population it ranges over

## Calculators

- 2026-06-20 · [body-cnn-scoping-brief.md](body-cnn-scoping-brief.md) **HIST ★** — no turnkey body-beauty CNN exists; ruled train-your-own on the Connor OSF set (726 rated bodies) or stay on geometry — research only
- 2026-07-05 · [body-calc-hybrid-spec.md](body-calc-hybrid-spec.md) **LIVE** — hybrid ruled & shipped: objective spine (height/weight/BF% → FFMI) closes the 4 photo holes, photo keeps shape only; all 6 decision points ruled
- 2026-07-06 · [face-calibration-report.md](face-calibration-report.md) **LIVE** — outMin/outMax re-anchored 1.5/4.5 → 1.797/4.379 off 400 SCUT faces through the shipped pipeline; ρ=0.933 but no holdout — optimistic by its own admission
- 2026-07-09 · [smv-recalibration-spec.md](smv-recalibration-spec.md) **LIVE** — v7 quiz contract ruled: date-legible objective questions, checklists over vibes, median ~5.0–5.5, Charm = residual leverage, 30-question invariant

## Roster

- 2026-06-27 · [profiles-codex-brief.md](profiles-codex-brief.md) **LIVE** — the PROFILES schema ruled: 11 women / 10 men traits, the `over` override map, roster-anchored scoring (looks ±0.5), Margot Robbie as gold standard
- 2026-06-27 · [profiles-codex-brief-round2.md](profiles-codex-brief-round2.md) **HIST** — round 1's 11 Codex profiles ruled landed; round 2 ruled append-only direct edits, em-dashes, roster-anchored looks/status for 10–20 more
- 2026-06-27 · [roster-image-credits.md](roster-image-credits.md) **LIVE** — photo QA ruled: no padded galleries, mugshots withheld (5 profiles stay initials-only); per-asset Commons credit ledger
