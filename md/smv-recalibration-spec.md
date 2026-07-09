# SMV Calculator Recalibration — Implementation Spec (v7)

This spec is the complete design contract for rebuilding the quiz in `smvcalc.html`.
It was produced in a design session with the owner and is self-contained: an implementer
should need this document plus the existing code, nothing else. Where this spec is silent,
preserve existing behavior.

## 1. Design philosophy (governs every judgment call)

1. **Date-legibility test.** Prefer questions a person would plausibly be asked, or sized
   up by, on an actual date: job title, car, kids, education, "how long was your longest
   relationship." If a question wouldn't come up in real mate evaluation, it's suspect.
2. **Cold numbers over vibes.** No self-assessments of one's own quality. Where a judgment
   is unavoidable, **decompose it into observable facts** (checklists of things that did or
   didn't happen) and compute the judgment from those.
3. **Farming resistance.** Short-window conversion metrics can be farmed by lowering the
   bar; long-horizon retention metrics cannot. Prefer "kept for years" over "converted last
   month."
4. **Absence of a bonus is not a deficit.** The modal/median case scores ~5.0–5.5, never
   low. Low scores are reserved for actively negative facts (bad reputation, felony,
   crushing expense ratio). This principle already exists in the code (followers question).
5. **House style.** Every anchor set and score array gets a code comment explaining the
   percentile reasoning, in the same voice as the existing comments. Keep the existing
   `count`-question machinery (log/linear anchors, sex forks via `anchors: {m, f}` and
   `weights: {m, f}`, `allowNA`/`naIndex` skips, age adjustment) and extend it — do not
   invent a parallel system.
6. **Charm is defined as residual leverage**: what you pull *beyond what your Looks alone
   predict*. Every Charm question is a view of that residual.

**Invariants to preserve:** total question count stays **30** (Looks 6, Money 6, Status 6,
Charm 5, Exposure 7); landing copy "30 questions, no filler" stays true; Profile B manual
sliders, lenses, tiers, import from Face/Body calc, and state persistence keep working.
Update the `FACTORS` `desc`/`lever` copy for Status (now: legible markers — fame, title,
education, record) and Charm (now: retention and leverage — the residual definition).

---

## 2. LOOKS — 6 questions

Q1 sex, Q2 age, Q3 height, Q4 build, Q5 face: **unchanged.**

**Q6 — Presentation, de-vibed.** Replace the 5-option self-rating with a checklist of
objective items; score = count checked. New question type: `checklist`.

> **How many of these are true of you?**
> Sub: "Check what is factually true — each is a thing you do or own, not a judgment."

Items (one sex-forked item):
1. My hair is cut or maintained on a regular cadence (roughly every 4–6 weeks, or a deliberately maintained style)
2. My everyday clothes actually fit — fitted or tailored, not just clean
3. I have a daily skincare routine beyond soap
4. My teeth are straight/white or under active care (whitening, aligners, regular dental work)
5. I wear a fragrance regularly
6. (m) My facial hair is deliberately groomed or deliberately clean-shaven / (f) I have a makeup routine I'd call intentional
7. I own at least one sharp, occasion-ready outfit that I could wear tonight
8. Someone complimented my style or appearance in the last month

Scoring (count → score), weight **0.8** (unchanged):
`anchors: [[0, 2.5], [2, 4.0], [4, 5.5], [6, 7.5], [8, 9.0]]`
Comment rationale: modal adult checks 3–4 → median; all eight ≈ top 5%.

---

## 3. MONEY — 6 questions

**Q7 — Net worth: keep metric + age adjustment, fix the UX.** Same scoring as today.
The single input becomes a 4-line mini-calculator summed live on screen:
- Cash, savings, and investments (including retirement accounts)
- Home: rough market value minus what you owe (0 if you don't own)
- Other big assets (vehicles, business equity)
- Minus: total debts (loans, cards, student debt)
The summed total (can be negative) is the answer and flows into the existing curve. Keep a
"just enter the total" affordance for people who know their number.

**Q8 — Income: add an annual/monthly toggle.** Monthly entry × 12 normalizes to annual
before the existing curve. Store the monthly figure — Q12's scoring needs it.

**Q9 — CUT the emergency-expense question** (it triple-counts net worth + income).
Replace with the car question (weight **0.90**):

> **What do you drive?**
> Sub: "The wealth marker people actually read. Judged as it presents, not by the loan behind it."

Options and scores:
- No car — **metro-adjusted**: if the Q25 metro answer ≥ 4,000,000 (dense, transit-rich), score 5.5 (car-free is neutral in NYC); otherwise 3.5.
- Older economy car / beater → 4.5
- Average commuter car → 5.5
- New or nice mid-range → 6.8
- Luxury brand → 8.0
- Exotic / collector → 9.3
This is the second cross-question adjustment in the codebase (net worth × age is the
precedent) — implement it the same way, at scoring time.

**Q10 housing ladder, Q11 career stage: unchanged.** (Career stage stays even though
Status gains a job-title question: Q11 is the Money-side *ladder level* proxy; Status
scores the *prestige of the occupation*. Do not "fix" this overlap.)

**Q12 — Obligations become a cold ratio.** Replace the 5-option feelings ladder with:

> **What are your total monthly expenses?**
> Sub: "Everything that leaves your account in a normal month — housing, debt payments, dependents, subscriptions, food, all of it. Scored against your income as your disposable share."

Score = **disposable share** = 1 − (monthly expenses ÷ monthly income). Weight **0.85**.
Anchors on the share: `[[<=0, 2.0], [0.05, 4.5], [0.15, 5.5], [0.30, 7.0], [0.50, 8.5], [0.70, 9.5]]`
(US personal saving rate ~5% → just under median; 50% savings rate ≈ top few percent.)
Edge cases: income = 0 with any expenses → floor 2.0; both 0 → treat as unanswerable, score 5.5 soft.

---

## 4. STATUS — 6 questions, full rebuild

The section's new philosophy: **legible markers strangers actually read**, not behaviors
that correlate with status. All six old questions are replaced (old Q13–Q18 delete
entirely; their intents are either absorbed here or relocated — invitations went to
Exposure, romantic pull lives in Charm).

**S1 — Fame, as a count.** Weight **1.15**, type `count`, log scale.

> **Roughly how many people who have never met you know who you are?**
> Sub: "Fame collapsed to a number. Zero is the normal case, not a failure. Count real name/face recognition — a scene, a school, a market, an audience."

`anchors: [[0, 5.0], [500, 6.0], [5000, 7.0], [25000, 7.8], [100000, 8.5], [1000000, 9.5], [10000000, 10]]`
Plus a checkbox: **"My name currently works against me where I'm known"** — if checked,
the question scores 2.5 regardless of reach (reputation compounds slowly, forfeits fast —
kept from the old Q13's floor).

**S2 — Following, itemized by platform.** Weight **0.95** (up from 0.75 — the platform
decomposition removes the noise that justified the old low weight). New input: a grid of
per-platform count boxes. Effective reach = Σ(count × coefficient), displayed live so the
math isn't a black box, then fed to the existing followers anchors
`[[0, 4.8], [200, 5.5], [1000, 6.2], [5000, 7.0], [20000, 7.9], [100000, 8.8], [1000000, 10]]`.

| Platform | Coefficient | Reasoning (comment in code) |
|---|---|---|
| YouTube | 1.0 | Subscription is deliberate; durable, monetizable audiences |
| Twitch | 0.6 | High engagement per active viewer, cheap follows |
| Instagram | 0.45 | Mixed real audience and drive-by follows |
| Twitter/X | 0.4 | Similar, slightly lower engagement per follower |
| Snapchat | 0.3 | Mostly personal-network reach |
| TikTok | 0.2 | Algorithmic feed makes follows the cheapest of all |
| Other (newsletter, podcast, etc.) | 0.5 | Unknown mix, middle coefficient |

**S3 — Job title.** Weight **1.30**, the section anchor. Prestige only — income variance
within a profession is deliberately NOT captured here (Money owns it; see Q11 note).

UI: type-ahead search box over a curated list. **The implementer authors the list**:
~150–200 titles, each `{title, score, keywords[]}`. Calibration contract:
- Scores follow occupational-prestige-style ratings mapped to the quiz's 0–10 curve with
  the median occupation ≈ 5.0–5.3. Calibration points: physician/surgeon 9.0–9.3,
  lawyer 8.0, engineer/software engineer 7.3–7.5, professor 7.8, registered nurse 6.6,
  teacher 6.4, police officer 6.0, electrician/plumber 5.8, office administrator 5.0,
  retail associate 3.8, unemployed 3.0.
- Include **seniority-differentiated entries** where the distinction is socially legible:
  "Attorney (associate)" vs "Law firm partner"; "Resident physician" vs "Attending
  physician"; "Software engineer" vs "Engineering manager" vs "CTO / VP Engineering";
  business owner tiers (solo/small vs established company).
- Synonyms matter more than count: "attorney"→lawyer, "software dev"/"programmer"→software
  engineer, "cop"→police officer, etc. Match case-insensitively on substrings of title+keywords.
- Cover the common-answer mass: medicine, law, engineering/tech, finance, education,
  trades, service/retail/hospitality, transport/logistics, government/military, arts/media,
  sports/fitness, science, agriculture, care work, students, unemployed/homemaker.

**Fallback (mandatory):** if no match, a 6-band self-placement ladder:
student or unemployed 3.8 / service & manual 4.5 / skilled trade or clerical 5.5 /
professional 6.5 / licensed professional or senior management 7.5 / executive or elite professional 8.5.

**S4 — Education: degree × institution tier.** Weight **0.85**. Two-step on one screen:
degree level, then (bachelor's and above only) institution tier.

Degree base scores: no HS diploma 3.0 / high school 4.5 / associate or some college 5.2 /
bachelor's 6.2 / advanced or professional degree 7.2.

Institution tier modifier — at bachelor's level: elite/household-name +1.0, selective/
well-regarded +0.5, typical +0, low-signal (open-enrollment, for-profit) −0.3. At the
advanced-degree level the modifier halves (+0.5 / +0.25 / 0 / −0.15) — for an MD or JD the
title does the talking. Tier labels are self-placed; the four buckets are common knowledge.

**S5 — Kids.** Weight **1.00**. Number of children (0 / 1 / 2 / 3+); if >0, a custody
sub-select (full-time / shared / non-custodial). Sub-text clarifies this measures market
position, not finances (Money Q12 already carries the budget impact — different causal
channel, not double-counting).

Scoring: no kids = 5.5 (modal for the younger bands — unremarkable, not impressive).
Penalty scales with count, is reduced for non-custodial (~40% of the penalty) and shared
(~70%), and is **age-graded** using the existing age answer (net-worth adjustment is the
precedent): full penalty at 18–29, ~75% at 30–34, ~55% at 35–39, ~35% at 40–49, ~15% at 50+.
Full-penalty magnitudes at 18–29, full custody: 1 kid → 3.0, 2 kids → 2.5, 3+ → 2.0
(i.e., subtract the penalty-scaled gap from 5.5). Worked example: 42yo, 1 kid, shared
custody → 5.5 − (2.5 × 0.35 × 0.7) ≈ 4.9. Implement sex-neutral, with a code comment
noting the sex-asymmetric option (`anchors: {m,f}` machinery supports it) was considered
and deferred.

**S6 — Criminal record.** Weight **0.90**. Downside-only.

> **What does your record look like?**
> Sub: "Background checks are a dating-app feature for a reason. Traffic tickets and fines count as clean."

Options: Clean (including tickets/fines) → 5.5 / Misdemeanor → 4.0 / Felony → 2.0 /
Multiple felonies, or currently in the system (probation, parole, pending charges) → 1.2.

---

## 5. CHARM — 5 questions, full rebuild

Old Q19 (conversation engagement) and Q23 (told you're fun): **cut** (vibes).
Old Q20/Q21 (funnel conversions): **cut** (farmable by lowering the bar).
Old Q22: **reframed** into the orbit question. Old Q24 (invitations): **moved to Exposure** unchanged.

### The partner-tier component (reusable)

Several questions classify another person as above / at / below the user's level **without
any self-assessment**: the user's own level is the quiz's computed Looks factor score
(available at scoring time), and the partner's level is decomposed into observables.
Partner checklist (0–4 checked):
- Friends or strangers commented on their looks unprompted
- They got approached or hit on while you were together
- They had visibly abundant options when you met them
- People openly wondered how you pulled them

Partner estimate = 4.0 + 1.5 × (items checked) → 4.0–10.0. Differential = estimate −
user's Looks score. **Above** if ≥ +1.0, **at level** within ±1.0, **below** if ≤ −1.0.
For the C3 distribution question the checklist appears as calibration guidance in the
sub-text rather than being run per-person.

**C1 — Longest committed relationship.** Weight **1.25**. Count (months; UI offers
years/months entry). Age-adjusted like net worth. Skippable never — 0 is a real answer.
Anchor sets by age band (comment the reasoning; interpolate between bands):
- 18–24: `[[0, 4.5], [6, 5.3], [12, 6.0], [24, 7.0], [48, 8.0]]`
- 25–29: `[[0, 3.8], [12, 5.0], [24, 5.8], [48, 7.2], [84, 8.3]]`
- 30–39: `[[0, 3.0], [12, 4.3], [24, 5.5], [60, 7.5], [120, 8.7]]`
- 40+:   `[[0, 2.5], [24, 4.3], [60, 6.0], [120, 8.0], [240, 9.0]]`
Plus the partner-tier tag ("that person, relative to you" — the checklist): above +0.8,
at level +0, below −0.3, applied after the curve, clamped 1–10.

**C2 — Orbit, decomposed into active vs peak.** Weight **1.30**. Two count boxes:
- **Active orbit now**: people you're actively dating, talking to, or who show clear ongoing interest.
- **Peak orbit ever (your PB)**: the most that was ever simultaneously true, plus a recency
  select: within ~2 years (×1.0) / 2–5 years ago (×0.85) / longer ago (×0.7).
Anchors (both boxes, same curve): `[[0, 3.5], [1, 5.0], [2, 5.8], [3, 6.5], [5, 7.5], [8, 8.5], [12, 9.5]]`
Question score = 0.65 × active-score + 0.35 × (PB-score × recency decay). PB rescues the
situationally suppressed (just moved, just exited a long relationship) and marks the
demonstrated ceiling; active dominates because SMV is a current read.

**C3 — Punching above your weight (the residual, directly).** Weight **1.35**. Skippable
(`allowNA`: "Fewer than ~10 people dated recently — skip"). Three boxes summing to ≤10:
of the last ~10 people you dated — how many were **above** your level, **at** your level,
**below**? Sub-text carries the partner-checklist bullets as the definition of "above"
(and notes: leverage from money/fame counts as leverage — the outcome is the signal).

Scoring (base 5.5, asymmetric by design — the owner's rule: *below is only subtractive
when above and at-level are lacking*):
- above_share = above/answered: +0 at 0%, +1.0 at 20%, +2.0 at 40%, +3.0 at ≥60% (interpolate)
- if above_share < 10% AND at_share < 30% (i.e., the pattern is mostly-below): −1.5
- clamp 1–10.

**C4 — Exclusivity retention.** Weight **1.10**. Count 0–5, skippable ("Fewer than ~5
such people — skip"):

> **Of the last ~5 people you dated more than a few times, how many wanted to make it exclusive or keep it going?**
> Sub: "First dates can be farmed; people who know you wanting more of you cannot. Count clear signals — asked for exclusivity, wanted to continue, pushed for more."

`anchors: [[0, 3.0], [1, 4.5], [2, 5.5], [3, 6.8], [4, 8.0], [5, 9.0]]`
Checkbox: "at least one of these was above my level" (checklist definition) → +0.5, clamp 10.

**C5 — Friend retention.** Weight **1.00**. Count:

> **How many friends have you kept for 5+ years?**
> Sub: "Charm outside the romantic arena, and the hardest number here to farm — the only way to score is to have been worth keeping around for half a decade."

`anchors: [[0, 3.0], [1, 4.3], [3, 5.5], [5, 6.5], [8, 7.5], [12, 8.5], [20, 9.5]]`
(Median adult ≈ 2–4 long-tenure friends → 3 = median.)

---

## 6. EXPOSURE — 7 questions

**E1 — Metro size (old Q25): unchanged.**

**E2 — New people met (old Q26): split into two boxes** — met **in person** vs **met
online** (per month). Effective = in-person + 0.6 × online (an IRL exchange is a richer
at-bat); both numbers displayed, effective figure shown live. Same anchors as today on the
effective count. Weight 1.35 (unchanged).

**E3 — Venues (old Q27): becomes a checkbox grid.** Score = count checked, existing
anchors `[[0, 3.2], [1, 5.0], [2, 6.2], [3, 7.3], [5, 8.5], [8, 9.5]]`, weight 1.05.
Venues: gym or fitness classes / hobby clubs or classes / sports leagues / nightlife or
bars / religious community / volunteering / coworking or work-adjacent scenes / regular
friend-group gatherings / other recurring scene (+1 per "other", capped at 2). Keep the
"same 12 people doesn't count" rule in the sub-text.

**E4 — Dating apps (old Q28): kill the full fork.** Everyone gets **two boxes**:
outbound (first messages / intent-driven likes sent per week) and inbound (likes +
messages arriving per week). Weight 1.10. Sex-specific anchors per box; score =
sex-weighted blend: men 0.7 × outbound-score + 0.3 × inbound-score; women 0.3 / 0.7.
- Outbound, men (existing): `[[0, 3.0], [3, 4.5], [10, 5.5], [25, 6.8], [60, 8.0], [150, 9.2]]`
- Inbound, women (existing): `[[0, 2.5], [10, 4.5], [30, 5.5], [75, 6.8], [200, 8.2], [500, 9.3]]`
- Inbound, men (new — rare, thus informative): `[[0, 5.0], [3, 6.0], [10, 7.0], [30, 8.2], [100, 9.3]]`
- Outbound, women (new — initiative is pure upside): `[[0, 5.0], [3, 6.5], [10, 8.0], [30, 9.3]]`
"Not on apps" = 0 in both boxes.

**E5 / E6 — Approaches and inbound interest (old Q29/Q30): add a unit toggle** — per
week / per month / per year, normalized to monthly (year ÷ 12, week × 4.33) before the
existing sex-specific anchors. Everything else (anchors, mirrored sex weights) unchanged.
This makes "4 per year" representable, which today rounds to a false 0.

**E7 — Unsolicited invitations (old Q24, relocated from Charm).** Text, sub, anchors
unchanged; `factor` becomes 4; weight **0.85** within Exposure (it's the softest exposure
signal).

---

## 7. Validation panel — the celebrity pressure test

Create `tests/smv-panel.mjs`, runnable with `node tests/smv-panel.mjs`: it extracts the
scoring logic from `smvcalc.html` (regex-slice the inline `<script>` and evaluate in a VM,
or refactor the scoring core into a shared block the page and the test both use — the
implementer's choice, but the page must remain a single self-contained HTML file), runs
the fixture profiles, prints a table (per-factor scores + total + tier per fixture), and
**exits non-zero when any expectation band is violated**. Fixtures are permanent
regression fixtures — future recalibrations rerun this panel.

Fixtures (fill inputs with real public figures where public; Charm inputs for celebrities
are estimates — mark them as such in comments):
1. **Ceiling** — a top-tier male celebrity (e.g., LeBron James-class: max fame count,
   9-figure net worth, elite following). Expect total ≥ 9.0, tier Elite.
2. **Median** — 35yo teacher, 1.5M metro, $58k income, modest savings, bachelor's typical
   school, clean record, no kids, 2-year longest relationship, small orbit, couple of
   venues, light app use. Expect total 4.6–5.8, tier Average.
3. **Rich-anonymous** — 45yo, $5M net worth, $800k income, luxury car, own outright,
   but median looks, zero fame/following, median charm/exposure. Expect 6.0–7.5 with the
   factor breakdown pointing at Status/Exposure as bottlenecks, never Elite.
4. **Famous-broke** — 24yo viral TikToker: 2M TikTok (note: ×0.2 = 400k effective),
   100k strangers know her, negative net worth, no car, rents with roommates. Expect
   5.8–7.3, Money clearly the bottleneck.
5. **Looks-only** — 26yo model-tier looks (face 9+, build 9, tall), everything else
   median-or-worse. Expect 5.5–7.0, not Elite.
6. **Floor** — 29yo: unemployed, felony record, negative net worth, no car (small town),
   lives with parents, no degree, 2 kids full custody, no relationship over 3 months,
   empty orbit, tiny metro, no venues, no app activity. Expect total ≤ 3.2, tier Low SMV.
7. **The Davidson case** — median-to-modest looks, real fame (millions know him), solid
   money, C3 answered mostly-above, big orbit PB. Expect Charm to read as a top factor and
   total 7.5+, demonstrating the residual-leverage design works.

Also assert the two structural properties: (a) an all-median-inputs profile lands within
±0.5 of 5.5 total; (b) per-sex Exposure weight totals remain equal (the E4/E5/E6 sex
weights must still balance, as old Q28–Q30 did).

## 8. Out of scope — do not touch

Face Calc / Body Calc import machinery (but their imported values keep flowing into Q4/Q5
and the Looks score the partner-tier component reads), Profile B sliders and lenses,
TIERS boundaries and copy, other pages, and md/ docs other than this file. Preserve
localStorage persistence across the new question types (answers serialize; bump the
storage schema version if the shape changes so stale v6 answers don't corrupt v7 state).
