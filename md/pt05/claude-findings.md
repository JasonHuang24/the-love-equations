# PT05 — Claude findings (integrator lane)

Run of 2026-08-06, start 08:04 MDT. Method: `md/doctrine-pressure-test-04.md`;
contract: `md/pt05/PROTOCOL.md`. Canon at analysis time: `1.0.0+ac89d0f96ca5` (559).

## Cycle 1 — lane E — The Conversation: Ghosting and 'breadcrumbing'

- URL: https://theconversation.com/ghosting-and-breadcrumbing-the-psychological-impact-of-our-bad-behaviour-on-dating-apps-258087
- Words: 922 · SHA-256: `b8d57f1f2f69a5ca3f34adef0c94918644e35f087078a0995e29e80ff09757df`
- Analyzer: 28 passages · 26 claims · 2 mapped · mappedShare **7.7%** · 0 tensions

**Reading.** The two mapped rows are defensible: the app-motives claim reaches
`statistics:stat-app-reasons` (correct) and `M-TBD-31` (adjacent, Low); the
fairy-tale "wolf" metaphor brushes `stat-casual-gap` at 0.441/Low (lexical
coincidence, displayed as Low — acceptable). Everything the article is actually
about is dark: breadcrumbing (35% perpetrator/victim; sustained breadcrumbing →
lower life satisfaction), ghosting (~20%; expectation build-up then unilateral
silent exit), deceptive self-presentation on apps, and the friends-first
formation claim ("two thirds of young-adult romances begin as friendships").

**Canon check.** `lexicon:term-situationship` (term entry) and `M-TBD-33`
(situationships-dominant question) exist; "ghosting"/"breadcrumbing" appear only
in synopsis prose of gender-dynamics entries — no entry owns unilateral exit
conduct, no aliases reach it.

**Verdict: GAP** — candidate subject: the exit side of app-mediated courtship
(ghosting, breadcrumbing, silent de-escalation) as one mechanism: zero-cost
unilateral exit in a channel with no shared social graph. Holding the proposal
until 1–2 more lane-E cycles to apply the encompassing standard (merge with
situationship-ambiguity phenomena if they share the mechanism).

**Minor instrument note.** The Conversation's embedded "Read more:" promo links
survive extraction and are counted as claim-like units (3 here). Deflates
mappedShare slightly; a `--drop` pattern for promo blocks would fix it at the
extraction layer. Not an analyzer defect.

## Cycle 2 — lane F — Groundwork Collaborative: Love Behind the Paywall

- URL: https://groundworkcollaborative.org/news/love-behind-the-paywall-new-groundwork-report-explores-how-dating-apps-turn-finding-love-into-a-monthly-charge/
- Words: 621 · SHA-256: `5f479b35f471a24771fe25506d04192766c06e76791fe027fb22568266ec6157`
- Analyzer: 18 passages · 17 claims · 4 mapped · mappedShare **23.5%** · 0 tensions

**Reading.** The report-title claim reaches `smv:exposure:the-online-funnel`
(0.540 Medium, correct) and the paywalled-matches claim reaches
`statistics:stat-pay-to-play` (0.473 Low — right neighborhood: that entry owns
who pays, not why the platform wants them paying). Dark: the platform-side
incentive structure — revenue tied to users staying single, matches hidden to
be sold back, price discrimination (older users charged more; personalized
pricing), Match Group + Bumble duopoly, apps as data-mining operations, the
78%-exhausted stat.

**Canon check.** `search-cost` prices the search from the searcher's side;
`stat-pay-to-play` prices the buyer; `the-online-funnel` prices the channel's
sorting. No entry owns the market-maker itself: the platform whose revenue is
maximized by search *continuing*, not concluding.

**Verdict: GAP** — candidate subject: the platform's incentive (the market-maker
takes its cut from the search, so it is structurally aligned with prolonging it).
Encompasses: paywalled artificial scarcity, engagement-optimized matching,
price discrimination, concentration. Natural parent: the Search Cost (sibling
of pt04's 15.1 Meeting Channel).

**Instrument findings (recorded).** Two Low-band false positives displayed:
"one in ten met their match online" → `statistics:stat-child-marriage`
(0.453/Low — no topical relation); "more than half of adults under 50 have
used online dating" → `M-TBD-54` (0.464/Low — adoption stat mapped to an
unrelated friendship-vs-romance question). Both are Low and capped, but both
are the kind of adjacency the tranche work priced; noted, not fixed here.

## Cycle 3 — lane G — The Conversation: Why more couples are choosing to live apart

- URL: https://theconversation.com/why-more-couples-are-choosing-to-live-apart-124532
- Words: 928 · SHA-256: `9a5e99eabea877a618a7536fcdc5454c318956c8cc3429c14738872eafc36844`
- Analyzer: 37 passages · 36 claims · 14 mapped · mappedShare **38.9%** · 2 tensions

**Reading.** `lexicon:term-living-apart-together-lat` absorbs the subject
cleanly — 12 of 14 mapped rows land there at Medium (0.575–0.645), all
Resembles. The cohabitation lead-in reaches `stat-cohabitation-outcomes` /
`stat-cohab-timing`. Both tensions are the instrument working: one flags a
Contradicts needing a boundary test, one flags stated-preference-as-revealed
on the autonomy framing — a caveat the LAT entry itself already carries.
Unmapped rows are respondent vignettes and quotes (correctly unmapped
narrative) plus detail-level motivation taxonomy (constraint-LAT vs
preference-LAT) that the encompassing standard says to skip.

**Verdict: COVERED** — control-grade result on lane G ground. No doctrine
needed.

## Integration 1 (after cycles 1–3)

Folded three entries through the full pt04 procedure — my two gaps plus
ChatGPT's `chatgpt-proposal-marriage-bar.md`, which cleared the encompassing
standard (one economic-threshold subject; four sourced claims; contract-shaped
misreadings; the Pew numbers verified against the primary source before
authoring: 29%/27% financial-unreadiness major-reason, 21% career major):

- **4.1 The Marriage Bar** (`frameworks:marriage-bar`, under the Readiness
  Gate) — Pew 2019 stated reasons (Tier 1), Smock–Manning–Porter 2005
  qualitative mechanism (Tier 3), Ishizuka 2018 SIPP prospective transitions
  (Tier 2), Kearney–Wilson 2018 fracking-boom boundary (Tier 2).
- **15.2 The Market-Maker's Cut** (`frameworks:market-maker-cut`, under the
  Search Cost) — duopoly + subscription revenue structure (Tier 2), Groundwork
  2026 practices documentation (Tier 3, advocacy-bounded), pricing audits +
  Candelore v. Tinder (Tier 2), incentive geometry as Lens with the churn
  counterweight and a stated falsifier. The 78%-exhausted survey figure is
  excluded, consistent with 15.1's standing refusal of opt-in panels.
- **17.1 The Costless Exit** (`frameworks:costless-exit`, under the Third-Party
  Layer) — Freedman 2019 prevalence + destiny-belief acceptability (Tier 2),
  Navarro 2020 damage-localization (breadcrumbing, not ghosting, carries the
  measured harm — the discourse's expectation inverted; Tier 2), price
  mechanism as Lens with the shared-network falsifier. Numbers verified against
  primary sources before authoring.

Procedure: baseline `--dump` first (1,356,134 pairs); entries + overlay +
rebuilt index (559 → 562) + moved pins in one pass, suite 18/18; sweep
`--baseline --neighbors` onto the existing fixture ×2; **326 crossings ruled**
(10 credible: 1 ACCEPT / 6 REJECT / 3 loss-ACCEPT; 316 weak: 45/271), all
entered as Claude recommendations **FLAGGED FOR JASON**; 9/9 misreadings fire
Contradicts end-to-end; magnet check clean (no flat-score clusters; details in
`md/lab-pressure-test-05-threshold-adjudication.md`). Post-change: ghosting
article 7.7% → 15.4% (ghosting sentence reaches `costless-exit` at
0.579/Medium), Groundwork 23.5% → 58.8% (thesis rows reach `market-maker-cut`
0.43–0.61), LAT control unchanged at 38.9%.

## Cycle 4 — lane H — Public Discourse: The Egg Freezing Industry's False Promises

- URL: https://www.thepublicdiscourse.com/2025/07/98326/
- Words: 1,700 · SHA-256: `30985d0069b3a66a9cf62b8c64842b461e7b4d8ca16bfbe93c82db2209272e87`
- Analyzer: 83 passages · 6 claims retained · 0 mapped · mappedShare **0%** · 77 ignored

**Reading.** The domain gate set aside 77 of 83 passages — the essay is
workplace-benefits policy, bioethics, and meaning-of-life argument, and the
gate is right that those are not dating-market claims (same register behavior
as pt04's therapy-vignette finding, here operating correctly). The six
retained rows are the essay's policy thesis (egg-freezing benefits as
coercive family-unfriendly policy) and its Grant-Study/meaning claims — none
is a market claim, and none has a canon home because none should.

**Canon check.** Fertility timing itself is owned ground: `smv:multiplier:clock`
(The Clock), `statistics:stat-fertility-age` ("a slope with two turns, not a
cliff at 30"), `stat-childfree-intent`, and the Wall band structure. The
essay never states the one market-relevant claim in this discourse (delay
driven by partnerlessness rather than career — the Inhorn finding), so
nothing here tests that surface.

**Verdict: CORRECTLY UNMAPPED** — the pt04 age-gap outcome repeated: subject
owned, essay out of domain, number correctly did not move. No doctrine
authored. (A "buying time on the Clock" sub-entry remains a candidate if lane
H later surfaces the partnerlessness-delay claim from an in-domain article;
deliberately not implemented on this essay's evidence.)

## Integration 2 (after cycle 4)

Folded ChatGPT's `chatgpt-proposal-support-portfolio.md` — it clears the
encompassing standard exactly the way the pt04 diagnostic-turn did: four
lane-D articles (mankeeping, men-need-relationships-more, partner-as-best-
friend, married-and-lonely) merged into one mechanism with the gendered
instance held at its measured size. Verification before authoring: the ASC
41%/21% friend-support stat and the Pew turn-to-spouse/partner parity stat
verified VERBATIM against the corpus archive (15-asc, 16-pew); Mancini 2026
(Sex Roles) and Ferrara & Vergara 2024 verified as real publications.

- **17.2 The Support Portfolio** (`frameworks:support-portfolio`, under the
  Third-Party Layer — sibling of 17.1: the layer's enforcement side and its
  support side). ASC 2021 + Pew 2025 channel stats (Tier 1),
  Marabel-Whitburn 2023 peer-network waves (Tier 2), Pennington 2025
  best-friend-label study (Tier 2), Ferrara & Vergara 2024 theory (Lens),
  Mancini 2026 scale (Tier 2 structure / Tier 3 consequences).

Procedure: baseline `--dump` (1,363,412 pairs) at `d936d9d`; canon 562 → 563;
suite-green with two demo-pin events handled (below); sweep ×1; **137
crossings ruled** (2 credible: 1 REJECT gain — a questionnaire item — and 1
loss-ACCEPT; 135 weak: 19 ACCEPT / 97 REJECT gains, all 18 losses ACCEPT as
correct prunings), Claude recommendations FLAGGED FOR JASON; 3/3 misreadings
contract-pass and fire Contradicts (0.74–0.80); magnet check clean
("mankeeping" has zero corpus presence; the weak mass was spread-score
vocabulary resonance, ruled through).

**Demo-pin events (protocol's check-the-pins step, both diagnosed).** The
first draft's overlay boundary ("romantic quality may drive…") pushed a
novel-matrix demo sentence over the credible line at 0.434 via token
coincidence (community/may/romantic/network). Fix: reworded the authored
boundary (pt04's magnet-removal pattern applied to a boundary surface), NOT
the test — the sentence returned to unmapped and the corpus pin returned to
its committed 0.537. No test values moved in this integration.

**Instrument notes from integration.** (1) The misreading-rewrite ripple: two
rewritten tokens ("promising", "monthly") moved 5 weak corpus crossings —
misreading text is live match surface; edits to it are scoring changes and get
the full sweep treatment. (2) The "one in ten met online" false positive
migrated rather than died: `stat-child-marriage` (0.453) before the change,
`stat-cohab-timing` (0.454) after. Same adjacency class the tranche work
priced; recorded, not fixed. (3) `M-TBD-45` nearly absorbed
`stat-pay-to-play`'s own 41%-vs-29% stat at the credible line via +0.001 IDF
drift — rejected as wrong-owner; worth watching as canon growth keeps diluting
IDF.
