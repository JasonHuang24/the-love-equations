# LE Lab live crash-test 01 — Claude (Fable 5), on-screen second pass

Date: 2026-07-31
Scope: report-only. Nothing under `js/`, `data/`, `tests/`, `scripts/`, or any canon
page was touched. No fix was applied or attempted; findings are Jason's triage queue.
Tested tree: `main b3ace2d · clean · 0 behind origin/main` — the suite's own banner.
Suite: `npm run test:lab` exit code **0**, 18/18 steps ok, before any testing began.
Analyzer: 2.6.11 (shown on screen as "V2.6.11 PROVISIONAL · THRESHOLDS UNCALIBRATED").
Surface: the real `lab.html` UI, served by `.claude/dev-server.py` on :8753, driven in
the in-app browser with one hard refresh first. Every observation below is what the
screen showed, cross-read against the payload only to name mechanisms.

Second pass over `md/lab-cold-crash-test-gpt56.md` (GPT-5.6, engine-only, no browser).
Jobs, per the brief: (1) reproduce its findings on screen, (2) characterize the
misreading-overlap defect class across every entry carrying `commonMisreadings`,
(3) triage findings 4–14. All three are done. No lab-corpus/ text was read or used;
every input below is authored or taken verbatim from the GPT report or the shipped index.

## Verdict

The GPT-5.6 report is confirmed on screen, finding for finding — **all 14 reproduce,
none failed to reproduce**, and the display carries the engine's wrong labels
faithfully (no display-layer divergence in either direction, one wording exception in
§3.4). The headline defect is worse than the two instances the maintainer pass
confirmed: **54 of 532 canon entries label their own synopsis — the canon's own words,
pasted verbatim — `Contradicts`, every one of them as the top match at High
confidence in the credible band.** The mechanism threshold is 0.36, not the 0.5 the
maintainer pass inferred from its two examples. A second, distinct mechanism (a
hard-coded AWALT branch) produces GPT findings 3 and 10. Stance is wrong in both
directions: correct restatements fire Contradicts, and an asserted misreading (my
80/20 probe) fires Supports.

## 1. On-screen reproduction of GPT findings 1–14

Each input was pasted into the real paste box and "Map this source" clicked; labels
below are transcribed from the connection ledger and the Citations panel.

| # | On-screen observation | Matches GPT? | Severity (upheld) |
|---|---|---|---|
| 1 | `Contradicts` · "Women want most divorces — but not most breakups" · High · 78/100; reason line: "The source asserts a reading that the canon entry explicitly limits or rejects" — rendered directly beside a canon synopsis carrying the same 69/56/53 figures | Yes, exactly | BLOCKS-TRUST |
| 2 | `Contradicts` · "Women's odds of orgasm: casual vs. committed" · High · 79/100, same reason line, same-figures synopsis beside it | Yes | BLOCKS-TRUST |
| 3 | Top match `AWALT` · `Contradicts` · High · 79/100, reason "the source states that overreach directly" — while the excerpt on screen reads "**not** an exceptionless rule"; both Hypergamy entries below it at Resembles/Low | Yes | BLOCKS-TRUST |
| 4 | Girlfriend/text-fights passage: 0 claim-like segments; Research Queue shows "No relationship-domain claims detected — Clearly non-relationship passages were excluded" | Yes (both variants) | BLOCKS-TRUST |
| 5 | "Female hypergamy is an exceptionless law…" — 0 claim-like segments, same "Clearly non-relationship" panel, despite the literal canon term | Yes | BLOCKS-TRUST |
| 6 | Both statistics sentences (87% taller; median first married 31.0/29.0): 0 claim-like segments | Yes (A and B) | BLOCKS-TRUST |
| 7 | Reversed height stat (89%, "below"): `Supports` · Low · 47/100, beside a synopsis saying ~92% and *above*; no numeric warning anywhere on screen | Yes | BLOCKS-TRUST |
| 8 | Top match "Equal earnings still do not buy equal time" · `Contradicts` · Medium · 61/100; correct provider-norm entry second — **also** `Contradicts` | Yes (direction of row 2 additionally wrong on screen) | BLOCKS-TRUST |
| 9 | "Body Count & Pair-Bonding" · `Resembles` · Low · 49/100 on the specifically-rejected dose-response mechanism | Yes | MISLEADS |
| 10 | `AWALT` · `Contradicts` · High · 79/100 wins; wall material displaced to second ("What the Wall Actually Is" · Contradicts · Medium · 53) | Yes in substance; the #2 row on screen is the Deep Dive at Medium, slightly better than the report's weak-0.395 account of "The Wall" | MISLEADS |
| 11 | Kubernetes sentence: retained claim-like, "Research candidate", "A nearby concept exists…", nearest = The Charm Ceiling (29) / early-dating workload (27) / provider norm (25), plus "Possible destination: Lexicon" and suggested search terms | Yes | MISLEADS |
| 12 | Text-fights (retained variant): nearest = Ended (35) / dating-apps-lockout (33) / dating-for-potential (28) | Yes, same three in order | MISLEADS |
| 13 | Housing complaint: nearest = The 2020s: The Ledger (34) / The Market (30) / Search cost (27) | Yes, same three in order | MISLEADS |
| 14 | Wrong marriage ages: top "26 to 31" · `Resembles` · Medium · 63/100, steered away from the median-age statistic | Yes | MISLEADS |

Latency: every one-sentence analysis completed within the sub-second-to-~2s window
between click and read-back; no spinner ever stayed visible long enough to observe.
No console errors across the whole session; no layout breakage, dead control, or
clipped text observed in the panels exercised (ledger, Citations, Pressure Test count,
Research Queue, Source).

## 2. The defect class at scale: 54 entries contradict their own synopsis

**Method.** For every canon entry carrying `commonMisreadings` — now **all 532**, not
the 407 in the brief (overlay tranche 3 closed coverage and doctrine growth since) —
the entry's own synopsis was fed verbatim through the production path
(`normalizeInput` → `analyzeDocument`, Node ESM, shipped `data/le-canon-index.json`).
An entry's synopsis is definitionally a correct affirmative restatement in the
canon's own words, so any `Contradicts` on a self-match is wrong by construction.
This is a mechanism measurement of the kind `md/lab-synopsis-register.md` §4c says
survives: the probe is held fixed per entry, and no register judgment is involved —
direction on a *reached* match is wrong regardless of register. Per that record's
§4a warning, the gated bucket was verified to be genuine gate rejections
(`ignoredPassages` records exist for every sampled case), not segmentation failures;
zero synopses failed to form units.

**Results (analyzer 2.6.11):**

- 376 / 532 synopses reach their own entry; 373 as the **top** match.
- Stance the entry gives its own words: 247 Resembles · **54 Contradicts** ·
  49 Supports · 15 Challenges · 11 Context only · 6 Extends.
- **All 54 Contradicts are the top match, credible band, High confidence.** None weak.
- All 54 run through the misreading branch: `misreadingSurfaceOverlap` ranges
  0.364–0.800. The branch's threshold is `misreadingContradictionShare: 0.36`
  (`js/lab-analyzer.js:213`) — **not 0.5**; the maintainer pass's 0.5/0.583 were two
  instances above a lower bar. 24 entries sit at ≥ 0.5, 30 more in [0.364, 0.5).
- By category: Gender Dynamics 31, Deep Dives 8, Statistics 7 (incl. stat-divorce and
  stat-orgasm-context — GPT findings 1–2 are members), Love Hierarchy 3, Lexicon 3,
  Rules & Frameworks 2.
- Separately: **150 / 532 synopses (28%) never reach retrieval at all** — every
  detected unit gate-binned `no-human-relational-frame`. Sampled cases include
  M-TBD-31, whose synopsis is "male Tinder test profiles converted just 0.6% of likes
  into matches versus 10.5% for female profiles…". Caveat: synopses are page register,
  not discourse register (`md/lab-synopsis-register.md`), so 28% does not directly
  predict wild-text recall — but the gate refusing the site's own prose at this rate
  is consistent with GPT findings 4–6 and is a clean, probe-authorship-free number.
- 6 synopses retained but judged not claim-like; 0 reached retrieval and missed
  themselves entirely.

**On-screen spot check** (fresh case, not in the GPT report): the synopsis of
`statistics:stat-double-standard` pasted verbatim renders **`Contradicts` · High ·
81/100 against itself** — source excerpt and canon synopsis displayed word-for-word
identical, one above the other, with the reason line "The source asserts a reading
that the canon entry explicitly limits or rejects." Severity: **BLOCKS-TRUST**.
One-line repro: paste any listed entry's synopsis (appendix below) and read the top row.

**Mechanism, named.** `stanceFor` (`js/lab-analyzer.js:2641`) enters the misreading
branch whenever lexical overlap with the entry's `commonMisreading` surface is
≥ 0.36; with no negator, denial, qualification, or reported-speech cue in clause
scope it concludes "asserts the rejected reading" → Contradicts. Misreadings are
authored to share vocabulary with the entry (they are the entry's own claim, wrongly
stated), so a correct affirmative restatement overlaps them heavily. The branch reads
*topic* overlap as *stance* agreement with the rejected reading. The 49 Supports are
largely synopses whose own boundary phrasing ("not a cliff…") trips the denial cue —
the same coin, landing luckily.

## 3. Fresh findings from this session's probes

### 3.1 An asserted misreading gets `Supports` — the class runs both directions

Input, verbatim:

> The 80/20 rule is literal: on dating apps 80% of women only ever match with the top 20% of men, and the rest of the male population gets nothing.

Expected: `Contradicts` — the canon entry ("The 80/20 rule", Lexicon) rules the
lock-out reading false on its face ("Real as app-attention skew; false as a pairing
lock-out").

Observed on screen: top match correct, **`Supports` · Medium · 61/100**, reason "The
source presents the matched concept affirmatively and includes support or evidence
language." The synopsis stating "false as a pairing lock-out" renders directly beside it.

Severity: **BLOCKS-TRUST**. One-line repro: paste the input, read the top row's
direction against the synopsis next to it.

Together with §2: correct restatements → Contradicts, an asserted misreading →
Supports, and GPT finding 9's asserted misreading → Resembles. The stance label on
misreading-adjacent text is not conservative-but-wrong-sometimes; it is close to
uncorrelated with the truth of the matter.

### 3.2 A canonical blackpill fragment is "clearly non-relationship"

Input, verbatim:

> It's over for short guys.

Expected: retained (short-utterance handling may keep it non-claim); "it's over" is
core blackpill vocabulary and height is a canon pillar.

Observed on screen: 0 claim-like segments; "No relationship-domain claims detected —
Clearly non-relationship passages were excluded."

Severity: **MISLEADS**. One-line repro: paste the fragment, open the Research Queue.

### 3.3 Probes that held up (reported as explicitly as the failures)

- Pill-register: "She hit the wall at 35 and now she is back on the apps competing
  with 25-year-olds for the same top guys. Hypergamy does not care about your
  feelings." → The Wall (Tested claims) · Medium · 57, cautious Resembles, adjacent
  doctrine list correct. Reasonable throughout.
- Ordinary-register: "After the baby arrived we stopped having sex almost entirely,
  and now I feel more like a roommate than a husband." → retained, unmapped, first
  nearest concept "The first baby brings a shared satisfaction dip (37/100)" —
  genuinely the right neighbor. Honest and useful.
- The Demo, tabs, sorting chrome, metric tiles, and the flag affordance all rendered
  and responded normally everywhere they were exercised.

### 3.4 Display wording overstates the gate (the one screen/payload divergence)

The payload's ignore records say `no-human-relational-frame` and the analyzer's own
note calls the gate "heuristic triage, not ground truth." The screen renders every
ignored-everything outcome as "**Clearly** non-relationship passages were excluded."
On findings 4–6 and §3.2 that word is false on its face and removes the hedge the
engine itself ships. Severity: **MISLEADS** (display wording, not engine).
One-line repro: any gate-binned input; compare the Research Queue panel text with the
exported JSON's domainRelevance note.

## 4. Triage of GPT findings 4–14 (and 1–3), by mechanism

**Class A — misreading-overlap false stance** (findings 1, 2, and the direction label
in 8; finding 9 is the same class under-firing). NEW defect, now characterized at
scale (§2): 54 entries' own synopses fire it; threshold 0.36; all High confidence.
Engine-side alignment logic; the fix is Jason's call.

**Class B — the AWALT special case** (findings 3 and 10). DISTINCT NEW defect, not
the misreading branch: `stanceFor` short-circuits at `js/lab-analyzer.js:2660` —
if the match is AWALT and the sentence matches `/all women|women always|women never|
every woman/` sentence-wide, it stamps Contradicts before any negation scoping runs.
So finding 3's negation-parity failure is **not** Class A inverted; it is a
hard-coded branch with no clause scoping at all. The same surfaces make AWALT a topic
magnet: its misreading/boundary vocabulary ("…any individual woman dates", "rule",
"individual variation") retrieves it at High on any "every woman X" sentence, which
is how it displaces The Wall in finding 10 (same shape as the retired AI-companion
alias magnet, `md/lab-hookup-transaction-layer.md`).

**Class C — gate outcome-frame vocabulary** (findings 4, 5, 6; §3.2). Known
limitation *class* (participant-vocabulary gap, `md/lab-gate-participant-narrowing.md`)
with new current-build evidence of scope. The mechanism on these exact inputs:
participant nouns fire (girlfriend/boyfriend are in the participant frame), but
retention needs a relational *outcome* frame and none exists for ordinary conflict
vocabulary ("disagreements", "fights", "feels heard") — and the marriage frame regex
(`marriage|marry\w*|…`, `js/lab-analyzer.js:462`) does not match past-tense
"married", which is precisely why finding 6B's "first married at 31.0" vanishes
(the memory note "`married` != `marry\w*`" already recorded this shape as an
authoring rule; here it is the gate's own vocabulary). The 150/532 synopsis number
in §2 is the same class measured against the site's own prose. Severity stands as
GPT filed it; classification: known class, materially wider than recorded.

**Class D — no numeric semantics** (findings 7, 14). Known limitation class (the
engine compares no numbers; `md/lab-numeral-coincidence.md` treats numerals as loose
tokens). The reader-visible consequence — `Supports` on a numerically reversed
statistic rendered beside the correct figure, and wrong values steering to a
different entry — is not previously recorded and is what a trusting reader meets.
Not new mechanism; new severity evidence.

**Class E — research-queue neighbor framing on junk** (findings 11, 12, 13).
Fail-open retention of uncertain text is the designed contract; the defect on screen
is the *framing*: "A nearby concept exists", three named concepts with scores, a
"Possible destination", and suggested search terms are rendered for Kubernetes and
housing prose with nothing marking the neighbors as lexical accident. Partially
known (weak-band label work, v2.6.9, fixed the counts; the honesty of the reason
line on off-domain text was not in scope there). MISLEADS stands.

Could not reproduce: **nothing** — all 14 findings reproduced on screen, with one
benign nuance on finding 10 noted in §1.

## 5. What I did NOT test

- File upload and every non-pasted intake path (SRT/VTT/CSV/JSON/HTML/RTF, PDF, OCR,
  images, audio/video, companion transcripts, URL extraction).
- Exports (Markdown/JSON downloads, Copy Markdown), the flag-a-mapping file write,
  the ledger/feedback pipeline, domain overrides, cancellation, worker fallback,
  diagnostics display, session reset.
- Long documents (all inputs were 1–2 sentences except none; no latency measurement
  at the 100-segment scale — GPT's 1,811 ms engine figure was not re-taken).
- Mobile/responsive layouts, dark mode, accessibility, keyboard navigation,
  cross-browser behavior. Desktop viewport only, one browser.
- Pressure Test tab contents in detail (its count rendered; its rows were not judged).
- The 54-entry list was produced engine-side; exactly one member
  (stat-double-standard) was re-verified on the actual screen. The other 53 carry
  engine-level evidence plus the screen's demonstrated label fidelity, not individual
  screen checks.
- No lab-corpus/ text was read or used anywhere. `tools/lab-threshold-sweep.mjs` was
  not run in any mode.

## 6. Bottom line

The Lab's retrieval remains genuinely good — in most probes the right entry is on
screen, often at rank 1 with an inspectable why-matched line. What a reader cannot
currently trust is everything the UI prints *about* that retrieval: the
Supports/Contradicts stance (wrong in both directions, at High confidence, on the
canon's own words for 1 entry in 10), the triage's "clearly non-relationship"
verdicts on plainly relational text, and the research queue's confident neighbor
framing on junk. GPT-5.6's cold verdict ("a lexical discovery aid whose triage and
stance labels require manual verification") is confirmed on the screen a visitor
actually sees, and the stance half is now measured rather than sampled.

## Appendix — the 54 entries that contradict their own synopsis

Sorted by misreadingSurfaceOverlap (all top match, High confidence, credible band):

```
0.800 gender-dynamics:both-sides:meeting-people-the-odds:why-just-go-to-meetups-is-empty-advice
0.714 statistics:stat-mythbuster
0.700 gender-dynamics:both-sides:how-these-conversations-get-distorted:friendly-isnt-interested-and-men-over-read-it
0.700 deep-dive:third-spaces:parish-and-fair
0.667 gender-dynamics:male:the-macro-picture-why-dating-broke:gen-z-has-it-even-worse
0.667 deep-dive:relationships-throughout-history:church-era
0.636 gender-dynamics:gd-male-window
0.636 deep-dive:what-the-wall-actually-is
0.600 gender-dynamics:female:the-choosing-the-window:commentary
0.600 gender-dynamics:both-sides:how-these-conversations-get-distorted:shame-the-exit-or-fix-the-offer
0.583 statistics:stat-orgasm-context
0.571 gender-dynamics:female:timing-honesty-the-mirror:there-are-no-good-men-left-turn-the-question-inward
0.538 deep-dive:relationships-by-country:sub-saharan-africa
0.500 hierarchy:a-generic-female-claudes-take:primary-factors:physical-attractiveness
0.500 frameworks:desire-maintenance-split
0.500 gender-dynamics:male:directness-delivery-the-indirect-game:smooth-isnt-the-same-as-coy
0.500 gender-dynamics:male:logic-feelings-the-cycle:the-cop-out-slogans
0.500 gender-dynamics:male:game-the-mask-reading-signals:always-attractive-blindness
0.500 gender-dynamics:male:the-cost-of-staying-true:neither-rage-nor-cope
0.500 gender-dynamics:both-sides:meeting-people-the-odds:asking-fast-filters-for-lukewarm-dates
0.500 statistics:stat-divorce
0.500 statistics:stat-double-standard
0.500 lexicon:term-the-great-unbundling
0.500 lexicon:term-the-face-pill
0.455 gender-dynamics:male:logic-feelings-the-cycle:modern-dating-feels-like-a-job-hunt
0.455 gender-dynamics:male:the-female-approval-engine-mixed-signals:cosmetic-surgery-and-the-female-approval-engine
0.444 hierarchy:a-generic-male
0.444 hierarchy:a-generic-female-claudes-take:tertiary-factors:shared-values-goals
0.444 gender-dynamics:male:selection-hypocrisy-how-guys-respond:punishing-honesty-filters-the-pool
0.444 deep-dive:what-the-wall-actually-is:band-50-plus
0.429 gender-dynamics:male:game-the-mask-reading-signals:the-wingwoman-tell-youre-genuinely-friend-zoned
0.429 gender-dynamics:female:how-you-choose-and-what-it-does:be-honest-about-your-emotional-harem
0.429 gender-dynamics:both-sides:meeting-people-the-odds:the-real-problem-isnt-being-quiet-its-being-quiet-and-disconnected
0.429 deep-dive:relationships-throughout-history:alliance-era
0.417 lexicon:term-the-feminine-imperative
0.400 frameworks:abundance-trap
0.400 gender-dynamics:male:the-looks-first-reality:get-a-hobby-is-code-for-give-up
0.400 gender-dynamics:male:standards-leverage-desperation:the-wingwoman-myth
0.400 gender-dynamics:male:the-macro-picture-why-dating-broke:the-final-boss-cope
0.400 gender-dynamics:both-sides:meeting-people-the-odds:the-introverts-catch-22-and-the-way-out
0.400 statistics:stat-casual-gap
0.400 statistics:stat-cohabitation-outcomes
0.375 gender-dynamics:male:game-the-mask-reading-signals:dating-is-fun-if-you-enjoy-the-game-itself
0.375 gender-dynamics:male:game-the-mask-reading-signals:reading-the-signals-when-escalation-is-welcome
0.375 gender-dynamics:male:game-the-mask-reading-signals:the-on-the-clock-trap
0.375 gender-dynamics:both-sides:meeting-people-the-odds:its-not-rigged-extroverts-just-always-had-the-edge
0.375 statistics:stat-first-message
0.375 deep-dive:what-the-wall-actually-is:band-38-49
0.364 gender-dynamics:male:the-default-market:the-inversion-threshold
0.364 gender-dynamics:gd-herd-script
0.364 gender-dynamics:male:game-the-mask-reading-signals:game-is-a-scale-baseline-is-just-not-being-awkward
0.364 gender-dynamics:female:the-choosing-the-window:when-the-dynamic-shifts
0.364 gender-dynamics:both-sides:how-these-conversations-get-distorted:its-not-just-feminism-apps-and-social-media-reshaped-everyone
0.364 deep-dive:relationships-throughout-history:early-modern
```

## Reproducing

The characterization harness (session scratchpad, not committed) does exactly this:
load `data/le-canon-index.json`; for each entry with non-empty `commonMisreadings`,
run `normalizeInput({ text: entry.synopsis.trim() })` → `analyzeDocument(doc, canon)`;
classify gated-out (zero retained segments — verified against
`analysis.domainRelevance.ignoredPassages` to exclude the NO-UNIT confusion of
`md/lab-synopsis-register.md` §4a), not-claim-like, or self-matched (entry id present
in any segment's `matches`/`weakMatches`); record the self-match's
`alignment.label`, `alignment.evidence.misreadingSurfaceOverlap`, score, confidence,
and top-match identity. Every UI observation reproduces by pasting the quoted input
into lab.html on :8753 and reading the labeled panel.
