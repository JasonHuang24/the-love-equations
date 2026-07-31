# Doctrine invention — The Transaction Layer (batch 01)

**Date:** 2026-07-30 · **Lane:** Claude (Fable 5, high effort), main loop, no research subagents
**Target surface:** `frameworks.html` (Rules & Frameworks), plus one structural edit to the
Conversion Ladder graphic.
**Status:** authored and shipped in this session. Lab hookup (retrieval vocabulary beyond the
overlay, lexicon terms, benchmark appends) is a deliberately separate pass — see §6.

---

## 1. The structural finding this batch acts on

The site is a **valuation engine with no transaction layer.**

Every framework currently on the page answers one question in two forms: *what is this person
worth*, and *who does that worth match*. SMV, the Five Levers, the Hierarchy, the Matching Curve,
the Attention Market, the Option Pool, the Charm Ceiling, the Status Trade, the Parity Rule, the
gates — all of it is valuation and sorting. The Retention group added an outcome layer above
Kept, which was the previous batch's finding.

What has never been modelled is everything a market participant faces *once value is known*:

| Missing question | Who asks it | Site coverage before this batch |
| --- | --- | --- |
| What does participating cost me? | everyone in the market | none |
| How do I know any of this is true? | everyone reading a profile | none |
| Who else gets a vote? | anyone with a family | none |
| Where does the exit go? | anyone whose relationship ended | one chart, no framework |
| How wrong is my own number? | every user of every instrument here | none |

These are not five unrelated gaps. They are one gap with five faces: **the site prices the goods
and never prices the transaction.** That is the thesis this batch ships.

Each is also a discourse family the Lab currently cannot map — verified by grep against the live
pages, not against Lab verdicts (per the standing discipline from Harvest #1):

- `signal(ing)? theory|costly signal|handicap principle|catfish` → **zero hits site-wide**
- `family approval|friends? approv|social network` → matchmaker prose only, no doctrine
- `search cost|opportunity cost|burnout|fatigue` → one Lexicon clause, one unrelated Good-News row
- `overestimat|self-rated|calibrat` → "calibration" on this site has only ever meant *social*
  calibration (reading signals, escalation speed). Rating accuracy: zero.
- exit/re-entry → `#stat-divorce` exists and is good; no framework consumes it

## 2. The six entries

Numbering below is the shipped TOC numbering.

### 2 · The Calibration Error — *Orientation*

Every number on this site is an estimate of an estimate. Self-rated physical attractiveness
correlates with observer ratings at **r ≈ 0.24** (Feingold 1992 meta-analysis, *Psychological
Bulletin* 111(2)) — close to orthogonal. The error is also **not random**: Greitemeyer (2020,
*Scand. J. Psychol.*, six experiments, N = 1,180) found unattractive participants considerably
overestimated themselves against stranger ratings, while attractive participants were accurate
or slightly *under*-rated themselves.

Two consequences, and the second is the reason this sits in Orientation rather than in a corner:

1. **It fences the site's own instruments.** Every calculator here takes a self-report or an
   eyeball rating as input. The Matching Curve's conditional SD is ≈ 0.9; the *input* error is
   plausibly of the same order. Arguments about half a point are arguments about noise. This is
   the C3 defect from Checkpoint 01 — the site states its nulls and never applies them to its own
   tools — closed on the doctrine side.
2. **It re-aims a discourse claim.** "She thinks she's a 9" is aimed at women. The measured
   pattern is that the *bottom of the distribution* miscalibrates upward, in both sexes, and the
   top slightly under-rates. Directionally right that a gap exists; wrong about who carries it.

### 15 · The Search Cost — *The transaction layer*

Participation has a running cost — time, money, attention, and rejection dosage — and that cost,
not a revaluation of anyone, is what usually ends a search. **People rarely lower their standards
because they changed their mind. They lower them because the budget ran out.**

The load-bearing theoretical result: Burdett & Coles (1997, *QJE* 112(1):141–168) show that in a
market with search frictions and **no preference for similarity whatsoever**, agents endogenously
partition into discrete classes, each accepting only its own band — because waiting for better
costs more than accepting now. This is deflationary about LE's own Matching Curve in a way worth
saying out loud: **the curve does not require anyone to prefer their own level. Search cost alone
produces it.** A moral story ("people settle for their tier") is replaced by an economic one.

Cost evidence: Pew 2020 (n = 4,860, fielded Oct 2019) — past-year users left feeling *frustrated*
(45%) far more than *hopeful* (28%). Pew 2023 (n = 6,034) — 46% report a negative overall
experience; harassment and scam load (38% unsolicited explicit content, 52% suspected scammers)
is a real cost borne unequally.

### 16 · The Signal Cost Rule — *The transaction layer*

**A trait claim carries information in proportion to what it costs to fake.** Spence (1973)
job-market signaling — a signal separates types only when its cost is inversely related to
quality; Zahavi (1975) is the biological form.

Measurement: Toma, Hancock & Ellison (2008, *PSPB*) established ground truth for 80 daters'
height, weight and age. ~80% misstated at least one; men skewed height, women weight; those
farther from the mean lied more; photographs were the most embellished element and relationship
status the most honest; deviations were **small and intentional** (self-rated accuracy tracked
observed accuracy). The finding is ubiquitous minor inflation, *not* widespread fabrication —
which cuts against the catfish panic as hard as it cuts against naive trust.

The LE synthesis, two moves:

- **Cheap signals inflate to the ceiling and stop carrying information.** When everyone can add
  two inches, two inches means nothing and the market re-anchors on the inflated ceiling.
- **Moving courtship online transferred the verification cost rather than removing it.** It used
  to be paid by a community that knew you and whose knowledge was expensive to fake. It is now
  paid by one person with twenty minutes and a coffee. That names what the Interaction Gate
  actually is: not merely where chemistry is tested, but the market's *only remaining
  verification instrument* — and it explains why the Face and Body calculators exist.

### 17 · The Third-Party Layer — *The transaction layer*

Pairing is not dyadic. Networks supply introduction, information, approval, veto, and enforcement.

- Sprecher & Felmlee (1992, *JMF*), three-wave longitudinal: network support predicts survival and
  satisfaction, with the woman's network the stronger predictor.
- Sinclair, Hood & Wright (2014, *Social Psychology* 45(3), N = 396 over 3–4 months) attempted the
  **Romeo and Juliet effect** (Driscoll, Davis & Lipetz 1972 — parental interference *increases*
  love) and failed to find it. Higher interference and lower approval predicted *poorer* quality
  on every measure. The famous counterintuitive result died; the boring one held. That is a
  house-standard honesty beat and it is the entry's centrepiece.

The synthesis connects three existing site assets that currently do not talk to each other:
`#stat-couples-meet` (the collapse of meeting through friends), `dd-third-spaces` (the decline of
the venues), and the Signal Cost Rule. What was lost when courtship left the network was **not
romance — it was verification and enforcement**. Meeting through friends means someone with
reputational skin vouched for you: an expensive signal. An app means nobody did.

### 26 · The Sixth Rung — Ended — *Exit & re-entry* (+ ladder edit)

The Conversion Ladder has always had a sixth state and the site stopped at five. Every
relationship ends — by separation or by death — and the exit has its own drivers, asymmetries,
and a re-entry cost the formation-side model never prices.

1. **Exit is institution-specific, not trait-specific.** Rosenfeld (HCMST): women wanted ~69% of
   divorces, but non-marital breakups ran near 50/50. "Women leave" is really "*wives* leave."
   The site already charts this at `#stat-divorce`; no framework consumed it until now.
2. **Re-entry is not a return to the market you left.** The cohort thinned (the people who paired
   are gone), constraints grew (children, geography, career lock-in, time), and reference prices
   went stale — you re-enter pricing yourself against a market that no longer exists. Applies to
   both sexes; the discourse only ever applies it to women. Graded Lens.
3. **Exit is a rung, so it diagnoses like one.** Someone who repeatedly reaches Kept and then
   Ended has a different problem from someone who never reaches Chosen, and the fixes do not
   transfer.

Boundary carried on the page: **Ended is not a failure state.** Base rate is 100% over a long
enough horizon. The rung records where a relationship stopped, not whether it was worth having.

**Design decision on the graphic:** the sixth stage is styled as a *terminal* cell, visually
distinct from rungs 1–5, and its numeral is a dot rather than a "6". Rendering it as a sixth
equal box would assert "climb to Ended," which is wrong — the first five are achievements, this
is a state.

### 27 · The Substitution Layer — *Exit & re-entry*

Exit from the market is not exit to nothing. It is a switch to substitute goods — gaming, porn,
parasocial media, AI companions — delivering a fraction of the reward at a fraction of the cost
with near-zero rejection risk. **Substitutes are what make withdrawal durable**: a strike with no
alternative ends when hunger wins; a strike with a cheap substitute can run indefinitely.

This closes a hole the site left open in its own text: `#mens-strike` says male withdrawal "can be
waited out or substituted around" and then names no substitute.

Evidence: Aguiar, Bils, Charles & Hurst (*JPE* 2021 / NBER w23552) — young men's video-gaming time
rose ~99 hours/year from 2004–2015 (+50%), and recreational computing behaves as a **leisure
luxury** specifically for young men, not for young women or older men. Their instrumented result
is for *labour supply*, not dating; the dating analogue is LE's inference and is graded Lens.

**The caveat ships in the entry body, not the footnote:** direction is unmeasured. Substitution
and complementarity are observationally identical in cross-section — the man who games because
dating failed and the man who stopped dating because gaming is better generate the same time-use
row. Nobody has separated them. AI companions specifically remain a thin single-survey base and
are recorded as a watch item, not a finding (Checkpoint 01 C2, promoted only this far).

## 3. Expansions to existing entries

| Entry | Change |
| --- | --- |
| Conversion Ladder | sixth terminal stage added to the graphic; "Where the site maps" and the closing rule extended to Ended |
| The Men's Strike | the unnamed substitute is now named and linked |
| The Interaction Gate | re-described as the market's verification instrument, linked to Signal Cost |
| The Matching Curve | the frictions-alone alternative explanation linked in |
| The Spiderman Effect | recalibration jam now also linked to Calibration Error |

## 4. Authoring contract compliance

Every new entry ships with a `commonMisreading` and a `boundaryCondition` in
`data/canon-overlay.json`, per `md/lab-overlay-tranche3.md`. Each misreading was authored against
the three measured rules — decisive frame present, no `MISREADING_DENIAL_CUES` negator, 10–18
words — because a misreading that fails those rules does not merely miss, it flips the entry to
**Supports** the thing it exists to reject.

Fixture pins moved in the same commit as the doctrine, per the standing rule: canon
`conceptCount` 470 → 476, `Rules & Frameworks` 29 → 35, misreading count 470 → 476,
boundary count 464 → 470.

## 5. What this batch deliberately does not claim

- Burdett & Coles is a **sufficiency proof, not a measurement**: search frictions *can* generate
  class partitions, which does not establish that they are what generates LE's Matching Curve.
  Both stories remain live and the entry says so.
- The re-entry discount has no instrumented source. It is stated as a Lens and is the weakest
  item shipped.
- The AI-companion substitution claim is **not** promoted to doctrine. Only the substitution
  *mechanism* is, and its instrumented leg is a labour-supply result.
- Network approval is correlational; approval may be an effect of relationship quality rather
  than a cause. Stated in the entry.

## 6. Measured Lab effect of the merge

Sheet: `md/lab-doctrine-transaction-layer-threshold-adjudication.md`, generated from a
baseline reconstructed by restoring the pre-merge canon (2401 passages × 470 entries,
canon `1.0.0+6cf046c1e769`) and re-sweeping. **`--neighbors` was regenerated before that
baseline was captured**, which per the standing warning silently re-pins scores and
absorbs crossings; the reconstruction is the recovery, and the sheet is the record.

```
canon      1.0.0+6cf046c1e769 -> 1.0.0+aa6cd85db4e5  (doctrine moved)
population 2401 -> 2515 retained passages   (+114)
changed    86901 pairs   42339 down / 44562 up
candidateScoreFloor 0.08   5575 gain / 183 loss
minWeakScore        0.25    604 gain / 122 loss
minCredibleScore    0.43    153 gain /   3 loss
```

**The gate widened by 114 passages** because the shipped gate consumes canon surfaces
(v2.6.6, option 2a) — new doctrine vocabulary rescues passages the gate previously set
aside. This is the batch's most direct Lab capability gain and it was not designed for.

**The 153 credible-line gains are concentrated where the gap was.** The archived
AI-companion sources (`13-wheatley-counterfeit-connections`, `14-common-sense-ai-companions`)
previously scored **zero** against the whole canon — the Checkpoint-01 C2 finding, still
true at 470 concepts. They now land on `frameworks:substitution-layer` at 0.540–0.547.

**Triage of the 3 credible-line losses** (all IDF dilution ≤ 0.03, none a doctrine
conflict). Rulings are Jason's; this is the reading, not a verdict:

| Passage | Lost pair | Still credible elsewhere? |
| --- | --- | --- |
| `seg-00090` Conroy-Beam | M-TBD-56 0.438 → 0.415 | **Yes** — holds 0.575 on `replaceability-asymmetry`, its correct primary home, unmoved. Immaterial. |
| `seg-00037` Pew under-30 | GD *Gen Z has it even worse* 0.435 → 0.405 | **Yes** — holds 0.430 on M-TBD-59, though now sitting on the line. |
| `seg-00036` Pew 42%-easier | `stat-app-reasons` 0.437 → 0.411 | **No** — this passage loses its only credible match. The one materially adverse crossing in the batch. Note `frameworks:search-cost` is its new second-ranked entry at 0.356: thematically the right home (the passage is about whether apps made searching easier), just not yet strong enough to take it. |

## 7. Follow-up: the Lab pass (separate, not done here)

1. **Lexicon terms** for the six new concepts — the Lexicon is the retrieval spine and six new
   frameworks with no glossary rows are under-reachable. Moves Lexicon counts and pins.
2. **Gate vocabulary check.** Three families in this batch use vocabulary the domain gate has
   never been tested against: signaling/verification (`costly signal`, `catfish`, `verification`),
   search economics (`search cost`, `reservation value`, `frictions`), and substitution
   (`substitute good`, `parasocial`, `leisure luxury`). Expect set-asides; if the miss family is
   systematic, that is a benchmark-append proposal under governance, not a quiet classifier change.
3. **Threshold sweep.** Six new entries with fresh alias mass will move neighbour scores on
   existing entries. Run the sweep and adjudicate crossings before trusting any new mapping.
4. **Corpus re-run** of the three Checkpoint-01 sources against the widened canon. C1c
   (desire decay) and C2 (substitution) should now find homes; if they still return zero, the
   deficit is retrieval vocabulary, not doctrine.
