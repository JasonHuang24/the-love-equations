# Doctrine Distillation — Claude lane, run 01

**Date:** 2026-07-27 · **Lane:** Claude research lane (parallel to the ChatGPT orchestrator lane)
**Repo state at run:** branch `main`, head `e044ebc`, clean tree. LE Lab release token `v=2.1.2`.
**Phase:** COLLECTION ONLY. Nothing in this document has been implemented on the site.

**Correction to the handoff brief:** the brief states canon index `1.0.0+d59d3e3a55be`. The committed
index at `data/le-canon-index.json` is **`1.0.0+8c38a2f1d015`** (450 concepts, 19 source pages), and that
is what every Lab run below was scored against. The brief's hash was stale; no rebuild was performed
this session.

---

## 0. Method

Five Sonnet scouts (effort medium) swept five genres in parallel — manosphere canon and its academic
critics, relationship-science popularizers, podcast/long-form YouTube discourse, the academic mating
literature, and mainstream advice + female-side/critic discourse. Each returned 10–18 candidate themes
with sources, excerpts, and an evidence-caliber note; scouts returned raw data only and made no
judgments about the site.

Three nominated source texts were then run through the LE Lab on `:8753` (staged in the gitignored
`.claude/lab-sources/`, served same-origin, exported via a JSON-blob capture; staging removed after the
run — the tree was clean before and after).

Four Opus verifiers (effort high) then checked every surviving candidate against the **live site files**,
not against Lab verdicts — the standing discipline from Harvest #1. Each was instructed to assume the
gap was *not* a gap and to return one of three verdicts with quoted evidence and an auditable list of
search terms tried. Final ranking and all dispositions below are the main loop's own judgment.

### Lab run stats

| Source | Words | Claim-like | Mapped | Coverage | Research queue | Set aside (non-domain) |
|---|---|---|---|---|---|---|
| Fem-Centrism — Rollo Tomassi, *The Rational Male*, 2011 | 1,214 | 10 | 0 | **0%** | 10 | 41 segs / 889 words |
| The Four Horsemen — The Gottman Institute | 885 | 17 | 0 | **0%** | 17 | 47 segs / 568 words |
| On Heteropessimism — Asa Seresin, *The New Inquiry*, 2019 | 2,938 | 28 | 1 | **3.6%** | 27 | 93 segs / 2,085 words |

Three sources, 55 claim-like segments, **one** credible canon match across all three (Heteropessimism →
"The Market", Medium confidence). Zero pressure tests fired on any run. For comparison, Harvest #1's Pew
source mapped at 50%. That contrast is the headline: the Lab maps *statistical* sources about the
dating market well and maps *doctrinal* sources from adjacent genres almost not at all.

The Gottman run is the single most diagnostic result in this dossier. The canonical text of
relationship-maintenance science produced 17 retained in-domain claims — including "contempt is the
single greatest predictor of divorce," which the gate correctly retained — and **not one of them found a
home in a 450-concept canon index.** That is not a retrieval failure to be fixed with overlay
enrichment; there is nothing to retrieve.

---

## A. Candidate core themes, ranked

Ranked by evidence strength × distinctness from canon. Dispositions follow
`memory: content-placement-and-lexicon` (Pills = worldviews, Frameworks = models, Statistics = numbers).

### A1. The retention gap — the site stops at selection · **NEW ARTIFACTS + EXPANSIONS** · Tier 1–2 evidence

**The claim:** the site models how pairs *form* in exhaustive detail and has almost nothing on how they
*hold*. Everything after the pairing decision — desire decay, conflict repair, what actually predicts
dissolution — is a named but nearly empty room.

**The measurements.** The Conversion Ladder's top rung, `frameworks.html#conversion-ladder`, defines
Kept in four lines. Its drivers are six undefined nouns: "Trust, repair, values, low chaos, loyalty,
lack of baggage." Its own self-audit cell concedes the shape of the hole — every instrument maps to
rungs 1–4, and "the Good-News Rule supplies **one observable Kept behavior**." Site-wide inventory:
2 of 17 frameworks, 1 of 29 charts, 1 of 65 mythbuster entries, 2 of 71 lexicon terms, 0 of 5 deep dives.

**Three independent pieces of evidence that the site already knows.**
1. `js/lab-analyzer.js:429` ships a severity-3 tension named `selection-retention-collapse` — "Selection
   is being collapsed into compatibility or retention" — whose evidence field names exactly what the
   canon would need. The Lab detects the collapse and has no rung to route it to.
2. `tests/fixtures/domain-relevance-benchmark.json:55`, case `dd-28`, labelled `retain`: *"The best
   predictor of a lasting marriage is how the couple handles contempt."* The site's own benchmark
   asserts this is in-domain canon material. There is no canon card for it.
3. Same file, case `dd-05`, labelled `retain`: *"Physical attraction fades in a long relationship unless
   it is renewed by shared novelty."* Same situation.

**The four sub-themes, with verdicts:**

| Sub-theme | Verdict | Detail |
|---|---|---|
| Gottman's Four Horsemen; contempt as top dissolution predictor | COVERED THINLY | Gottman is cited exactly once site-wide — `js/mythbuster.js:317`, a support source on an unrelated sleep/conflict ruling — and the only other mention is that entry's own `researchNotes` conceding "Gottman source needs a specific citation and URL." The Horsemen taxonomy does not exist. `contempt` appears ~12 times, always as Red Pill rhetoric or a matchmaker trait, never as a predictor. |
| The replication critique of Gottman's 90%+ accuracy | HOOK ALREADY ON SITE | `statistics.html#stat-relationship-quality` (Joel et al. 2020 PNAS) already states "no model explained more than 5% of change… who would improve or decay was not reliably predicted." The exact epistemics the critique needs, one page away, unlinked. |
| Perel's desire-vs-security paradox | **GENUINELY ABSENT** | Zero hits for Perel, *Mating in Captivity*, eroticism, novelty, desire decay, dead bedroom, sexless, companionate. The site treats desire as a level, never as something with a decay curve. The nearest content ("The spark", GD "butterflies aren't a good match") argues the *inverse* — that intensity is a bad selection signal. |
| Finkel's Suffocation Model | COVERED THINLY, UNNAMED | `dd-relationships-throughout-history.html:271` states Finkel's premise nearly verbatim in LE's own voice — "asks one person to be everything that three whole institutions… used to divide among themselves… The market did not get harsher. The job description got longer" — with no name, no citation, no cross-cite. Missing both load-bearing halves: that investment per marriage did not rise to match, and that the best marriages got better while the rest got worse. The variance half is the part with predictive content. |

**Note on the one sub-theme that is already covered:** Gottman's *bids for connection / turning toward*
is on the site substantively, under Gable's name rather than Gottman's, as
`frameworks.html#good-news-rule` (eyebrow: "Kept rung · positive-event responsiveness"). It covers the
positive-event channel only, not everyday bids. The 5:1 ratio is absent, and that entry's own boundary
language ("no single response is a causal percentage or compatibility score") suggests the site would
reject a ratio rather than adopt one. **Do not propose 5:1.**

**Proposed disposition:** the largest structural gap found in this run.
- **Frameworks (new):** a desire-maintenance model — the site's own version of the Perel paradox, built
  on the empirical desire-decline literature rather than clinical assertion, with the "not a causal
  percentage" discipline the Good-News Rule already models.
- **Frameworks (new):** a dissolution-predictor entry carrying the Horsemen taxonomy *and* the
  post-hoc-fitting critique, cross-cited to `#stat-relationship-quality`. The critique is what makes
  this an LE entry rather than a Gottman repost — the site already owns the harder null.
- **Expansion:** name and cite the Suffocation Model at `dd-relationships-throughout-history.html`, add
  its two missing halves, and cross-cite from the Kept rung.
- **Expansion:** the Kept rung's six nouns need to point somewhere.
- Prior rejections on record in `md/mission-notes.md:440` (Reciprocity Ratchet, Return Ticket, Pool–Queue,
  Constraint Before Clarity, Disclosure Loop) — **none of these are Gottman, Perel, or Finkel.** This
  cluster has not been considered and declined; it has not been considered.

### A2. AI companions as a market force · **NEW ARTIFACT** · Tier 2 evidence

**The claim:** AI companion apps are being adopted at scale by exactly the demographic the site models
as market-exiting, and function as a substitute good for the thing men are said to be withdrawing from.

**Verdict: GENUINELY ABSENT.** Zero hits across all published pages for AI girlfriend/boyfriend/
companion/partner, Replika, character.ai, chatbot, virtual girlfriend, artificial or synthetic intimacy.
`parasocial` appears ~10 times, always about *human* celebrities.

**Two things make this sharper than a normal gap.**
1. `frameworks.html:903` (The Men's Strike) writes the sentence that begs for it — men withholding "can
   be waited out or **substituted around**" — and names no substitute. The site's account of male
   withdrawal cites Lei & South 2021 (gaming, alcohol, employment, co-residence), which predates the
   substitute that actually simulates the withdrawn-from thing.
2. The site's Mythbuster is partly seeded by claims attributed to two AI voices, Mika and Ani, and
   `md/mission-notes.md:80` records that "Mika" turned out to be an AI companion (a Grok persona) rather
   than a person — treated there purely as a credibility caveat about AI agreeableness. **The site has an
   AI companion in its own origin story and no page asking what AI companions do to the market.**

**Evidence caliber:** adoption figures are survey-grade (Wheatley Institute/BYU, Feb 2025: ~19% of US
adults, roughly a third of men in their 20s, have used a romantic AI); market-size projections are
vendor research and should be treated as marketing-tier. The "substitute good / accelerant" framing is
interpretation, not finding — label it as a reasoned call, per house discipline.

**Proposed disposition:** Frameworks entry (a substitution/exit mechanism), cross-cited from the Men's
Strike's "substituted around" clause; a Statistics chart if the adoption survey holds up on independent
check. Lexicon term follows. Companion Mythbuster docket question is available: *does an AI companion
substitute for dating, or does it sit alongside it?* — currently unanswerable at Tier 1, so it would
ship as a hunch-tagged framework, not a ruling.

### A3. The matchmaker honesty fence · **EXPANSION (self-consistency)** · Tier 1 evidence

Not new doctrine — a defect in applying doctrine the site already holds.

`frameworks.html:183` reports Joel/Eastwick/Finkel 2017 correctly and at full strength: ML models on
100+ pre-date traits "explained effectively none of the held-out unique desire for this particular
person (less than 0.1%)." Line 184 draws the right conclusion: "This is also the boundary on the site's
own calculators: they estimate declared fit and constraints conditional on their inputs; **they do not
predict chemistry.**"

That fence has **zero inbound links** from `compatibility.html`, `matchmaker.html`, `smvcalc.html`, or
`hierarchy.html`. Meanwhile `matchmaker.html:20` promises the tool "finds the celebrities you'd actually
match with at your level" and ranks each by a gated hierarchy score. Read plainly, a per-candidate
ranked fit score is a pair-specific claim — the exact quantity the site publishes as unpredictable at
<0.1%. The Lens tag on line 24 disclaims only that the celebrity *ratings* are provisional; it does not
disclaim the ranking's meaning.

The Compatibility Calculator's existing note (`compatibility.html:20`) cites Pew's 21%-believe stat and
a modesty disclaimer. That addresses *public skepticism*, not the null — a reader cannot learn from it
why pair-specific prediction fails.

**Proposed disposition:** expansion — carry the `#interaction-gate` boundary onto every instrument page
in the instruments' own words. This is the highest-confidence, lowest-cost item in the dossier and it is
squarely in the site's honesty DNA.

### A4. Operational sex ratio as a norm-shifting mechanism · **EXPANSION** · Tier 2 evidence

**Verdict: COVERED THINLY.** Guttentag & Secord (1983) is cited exactly twice, both in `smvlevers.html`
(the Market multiplier cite line at :87 and Exposure's research list at :221), and both times the
citation carries the norm-shifting sentence while everything around it is the individual-value read:
"There is no absolute SMV. The same profile is a 6 in one city and an 8 in another… The market sets the
exchange rate; you just hold the currency."

Missing: the **two-sided power split** (the scarce sex gains dyadic power — more choice, less commitment
offered — while the abundant sex may hold more structural power); the **whole-market commitment-supply**
mechanism, which is the part that makes sex ratio a doctrine rather than a scaling factor; and the
campus empirics (Uecker/Regnerus-style: female-majority campuses show more hookups and fewer
relationships). `dyadic power` / `structural power` return only those two lines site-wide; there is no
sex-ratio framework, no chart, and no mythbuster entry.

**Proposed disposition:** expansion of `smvlevers.html` plus a Frameworks entry. This is unusually safe
ground — it deepens a citation the site already trusts and already prints, rather than importing a
contested new authority.

### A5. Female-side ideological exit · **EXPANSION** · Tier 2–3 evidence

**Verdict: COVERED THINLY, and the thinness is asymmetric.** The site does model female exit — the Men's
Strike framework carries a sub-box titled "The asymmetric response — women exit, they don't compete"
with Tier-1 data (among singles 40+, 71% of women aren't looking vs 42% of men), echoed at
`statistics.html#stat-why-single`. Credit where due: the symmetric *market* treatment exists.

What is missing is the ideological, elective version. Heteropessimism (Asa Seresin, 2019), "decentering
men," and boysober return **zero hits**. The site's modelled female exit is *passive attrition at 40+*;
the 2024–26 discourse version is *elective and young*, narrated as self-improvement. Different
mechanism, different age band. The ledger is lopsided: male exit gets three lexicon terms (Men's Strike,
MGTOW, Monk mode) plus a full framework; female exit gets one term (4B) that redirects to the male-side
framework.

**The sharpest unexploited angle:** Seresin's actual mechanism is *performative* disaffiliation that
never actually exits — the gap between the stated exit and the revealed non-exit. Stated-versus-revealed
is the site's house move. It is applied to preferences everywhere and never applied here. The nearest
neighbour, `js/mythbuster.js` M-TBD-42 ("no good men left" as a century-old genre), does the
historical-rerun read instead.

**Evidence caliber:** honest labelling matters here. Seresin is a literary-critical essay, not an
empirical finding; boysober and decentering are media-amplified trends with no research base. This is
Lens/reasoned-call territory, not a Tier-1 claim.

**Proposed disposition:** expansion of `#mens-strike` with an elective-exit counterpart, plus lexicon
terms. Lab run: 28 claim-like segments, 1 mapped (3.6%).

### A6. Mate-value discrepancy × alternatives visibility · **EXPANSION** · Tier 2 evidence

**Verdict: GENUINELY ABSENT**, on a framework that already has the vocabulary for it.

`frameworks.html#parity-rule` is entirely a *pairing-formation* model — the 0.4 tolerance band, the ±1
commitment band, the Sub-5 override — with no post-pairing consequence claim at all. Conroy-Beam & Buss
et al. find that being higher mate-value than your partner lowers satisfaction and predicts infidelity
intent **mainly when attractive alternatives are visibly available** (the mate-switching hypothesis).
The nearest site text is one clause at `frameworks.html:695` ("matched pairs carry less mate-guarding
anxiety"), which gestures at the mechanism from the other side and stops.

This is the item that ties A1 and the Abundance Trap together: it is the mechanism by which a visible
option pool degrades an *existing* pairing, where the Abundance Trap models only how it degrades a
*choosing* single. The Abundance Trap's own scope note already concedes the boundary — "nobody has yet
measured the trap against long-run relationship outcomes."

**Proposed disposition:** expansion of `#parity-rule` as a stated boundary condition.

### A7. Dread game · **NEW ARTIFACT** · Tier 3 evidence (assertion), Tier 2 adjacent literature

**Verdict: GENUINELY ABSENT as doctrine** — the two `dread` hits are ordinary prose (spinster anxiety in
a deep dive) and *dreadlocks* in matchmaker biographies.

What makes this worth listing despite the source being pure community assertion: **the evidence base is
already adjudicated on the site, pointed the other way.** `js/mythbuster.js` M-TBD-8 rules on deliberate
jealousy induction using the Mattingly et al. (2012) Romantic Jealousy-Induction Scale — that is hard
dread, with validated instrumentation — but frames it as *reading a woman's behavior*, never as a man's
prescribed retention tactic. Soft dread's base is likewise present and unassembled: M-TBD-18 on
mate-choice copying (Hill & Buss 2008; Gouda-Vossos 2018 meta, with publication bias flagged) plus the
Preselection lexicon term, both about *acquisition*, not retention inside a pair.

Nobody on the site turns the RJIS around. That is a one-source-away entry.

**Proposed disposition:** Frameworks entry or Mythbuster docket question, inside A1's retention
territory. Grading a prescriptive manosphere tactic against its own literature is exactly the site's
audit DNA — and the honest verdict is likely "documented behavior, terrible prescription," which the
existing sources can carry.

### A8. Political dealignment as a market filter · **NEW ARTIFACT (chart)** · Tier 2 evidence

**Verdict: GENUINELY ABSENT.** No trace of ideology as a market-segmenting force. `hierarchy.html:341`
has "religion/politics if relevant" as a parenthetical inside one lifestyle bullet, and
`compatibility.html:198` reproduces that wording while *dropping* the parenthetical. The site's only
politically-adjacent doctrine (GD's "the feminism trade-off") treats feminism as a historical/economic
shift, never as a live axis sorting today's daters into two pools.

**Evidence:** AEI/IFS survey of ~3,000 18–29-year-olds — 60% of liberal young women vs 36% of
conservative young women rank a partner's political alignment above job stability; ~50-point Gen Z
gender gap in 2024 US exit polling. Real survey data, US-specific, recent.

**Proposed disposition:** Statistics chart plus a hierarchy/compatibility note. Verify the AEI figures
independently before drafting — per house discipline, do not trust a scout's "verified."

### A9. Necessities vs luxuries — the budget paradigm · **EXPANSION (citation upgrade)** · Tier 1 evidence

The site has independently derived a threshold architecture: `frameworks.html:335` distinguishes
"channel factors gate" (hygiene, honesty, stability, respect, reliability, kindness — "a 4 contaminates
the whole, so it disqualifies outright") from "additive goods drag, they don't gate" (ambition, humor,
curiosity), reinforced by the Sub-5 floor and matchmaker's "Tier 1 is a gate, not an average."

That is structurally Li, Bailey, Kenrick & Linsenmeier (2002) — and Li's kindness/intelligence
necessities line up almost item-for-item with LE's channel set. Li is cited twice in `js/mythbuster.js`
(M-TBD-49, M-TBD-55) and read correctly, but only as ammunition inside rulings. Zero hits for
`necessit|luxur|mate dollar|budget|Kenrick` in any instrument page.

Also missing: the **low-budget/high-budget convergence** (sex differences are stark under scarcity and
shrink as the budget grows), and the inference it licenses — that stated preferences overstate pickiness
because surveys are *free*. The site currently treats stated-vs-revealed only as a validity problem
(people misreport), never as a budget problem.

**Proposed disposition:** cheap, high-value expansion — connect the site's own gate/additive
architecture to its empirical warrant on `hierarchy.html` and `smvlevers.html`.

### A10. Male friendship recession → sole-support-channel · **EXPANSION** · Tier 2 evidence, Tier 3 extrapolation

`statistics.html#stat-friend-time` and `dd-third-spaces.html` own this territory well, but **sex-neutrally**
— every friendship number on the site is ATUS time-use for "Americans." Missing: the sex-specific series
(share of men with no close friends rising roughly 3% → 15%, Survey Center on American Life) and the
sole-emotional-support-channel claim.

**Honesty flag, and it is load-bearing:** the source data does *not* itself make the sole-channel claim.
The Cox piece documents the friendship decline and the support gap (21% of men vs 41% of women received
emotional support from a friend in the past week) and stops there; the "so partners become men's only
outlet" step is discourse extrapolation. If this ships, the extrapolation must be tagged as such — this
is precisely the kind of compounding the site exists to catch.

**Proposed disposition:** a sex-split addition to the friend-time chart; the extrapolation as a Lens,
clearly labelled, cross-cited to the Suffocation Model work in A1.

### A11. Epiphany phase — the "maturity" reframing · **EXPANSION** · Tier 3 evidence

`gender-dynamics.html` carries the *content* in two un-anchored cards ("The backup-plan cycle"; "Don't
wait for the wall to course-correct") — "the qualities you'll value at 35 were available at 25 in men
you found boring" — asserted with no evidence tier and no anchor id. The Wall framework is orthogonal:
it rules on the value *curve*, never on a behavioral pivot.

Untreated are the claim's two testable specifics: whether it is a *narrow window* or a continuous drift
(Tomassi himself moved the goalposts from ~29–31 to 24–27, which is itself the tell), and the
**reframed-as-maturity** move, where a constrained recalibration gets narrated as growth. That second one
is a genuine rhetorical mechanism the site has no entry for, and it is symmetrical with several
male-side copes the site already names.

**Proposed disposition:** expansion — give those GD cards anchors and an evidence tag, and add the
reframing as its own named move.

### A12. Assortative mating — the Schwartz 2024 refinement · **OVERLAY / CITATION ONLY** · Tier 1 evidence

**The site is not stale, and the worry that prompted this check was wrong.** LE states in four places
that educational hypergamy has *reversed* (Esteve et al. 2016, 120 countries), and the looks r≈0.4
anchor is already correctly fenced as a Tier-2 model anchor re-analyzing 1980s samples.

Schwartz et al., "Eight Decades of Educational Assortative Mating," *Demography* 2024 adds a US-specific
series with a dated inflection (~1990) and — the part with real content — the distinction between
**hypergamy reversal** (women no longer marrying up) and **homogamy stall/decline** (like no longer
pairing with like). The site carries only the first. A refinement, not a correction.

---

## B. Dead candidates — checked and killed

Recorded so the ChatGPT lane does not rediscover them.

| Candidate | Why it died |
|---|---|
| **The preference-matching null** (Joel/Eastwick/Finkel 2017) as a missing finding | ALREADY COVERED, and it is the site's most rigorous single treatment. `frameworks.html#interaction-gate` states the <0.1% held-out result and correctly separates main effects from perceiver×target variance. Joel et al. 2020 PNAS has its own chart. Only Eastwick et al. 2023 (EJP) is uncited — a redundant confirmation of a null the site already states with a harder number. |
| **Gottman's bids / turning toward** | Substantively covered under Gable's name as `frameworks.html#good-news-rule`, with the 2×2 matrix, sources, and a pressure-test box. Only the everyday-bid (vs positive-event) channel is missing. |
| **The 5:1 magic ratio** | Absent, but `#good-news-rule` explicitly forecloses it: "no single response is a causal percentage or compatibility score." Proposing it would fight the site's own epistemics. Do not resurrect. |
| **"The site says assortative mating is rising"** | False. Checked every `assortative|homogam|hypergam|sorting` hit; the site says the opposite, sourced. See A12. |
| **Baumeister sexual-economics theory already on site** | False positive. The `Baumeister` hit is Baumeister & **Twenge** (2002) on female intrasexual suppression, cited in a mythbuster ruling — not Baumeister & **Vohs** (2004). SET itself is genuinely absent (see below). |
| **Sexual economics / "cheap sex" as a doctrine gap** | Genuinely absent, but **deliberately not recommended.** SET is a contested theory paper with a published rebuttal exchange (Rudman & Fetterolf 2014 vs Vohs & Baumeister 2015), and the site already *rejects* the retail version of the thesis at M-TBD-33 (situationships graded "Common, not dominant," truth 25). `dd-relationships-throughout-history.html:260` stops one inferential step short of the price-of-sex conclusion, and that restraint reads deliberate. Flagging as available, recommending against. |
| **Plate theory as prescriptive doctrine** | Absent, but `#abundance-trap` owns the territory and prescribes the *opposite* ("fix the criteria, cap the browsing"). The interesting residue is that the Abundance Trap's own moderator logic predicts the rotator taxes himself — that is a pressure test for an existing framework, not a new artifact. |
| **The Great Unbundling absorbs the market-structure candidates** | Checked in full. It is substantive and well-built, and it absorbs almost none of A4/A8/A10 — no sex ratio, no politics, and its rising-stakes argument is institutional and sex-neutral. |
| **The Feminine Imperative as a structural claim** | The Lab binned it non-domain by construction (73% of the Fem-Centrism source's words were set aside). Its load-bearing sentence is a claim about law, media, and culture, not about mating. Correctly out of LE's domain; the hypergamy core it rests on is already covered. Not a gap — a scope boundary. |
| **Briffault's Law** | Available as a Mythbuster docket item with an unusually clean kill (Briffault restricted it to non-human animal families and explicitly denied the analogy his manosphere citers build on), but it is a *citation-hygiene* debunk, not core doctrine. Parked. |
| **Alpha widow** | Genuinely absent and mechanically distinct from anything on site (a comparison-anchor claim, not the sequencing claim GD's "backup-plan cycle" makes). Evidence caliber is community lore only, with no instrumented literature to grade it against — unlike dread (A7), which has the RJIS. Parked pending a source. |
| **Mystery Method three-phase model, juggernaut law, geomaxxing, betabuxx, burden of performance, solipsism** | Reviewed and dropped: either already covered by existing pill/lexicon entries, or pure assertion with no gradable literature, or garnish. Betabuxx is the only near-miss — real academic theory (strategic pluralism) weakened by the paternal-discrepancy gap (models predict 6.9–20% cuckoldry, genetic studies find 1–2%) — but the site already handles AF/BB and notes the ovulatory-shift replication failure. |
| **Love-languages debunk, therapy-speak, red/beige-flag culture, date-me docs, sprinkle-sprinkle, FDS vetting, "he's just not that into you"** | Reviewed and dropped as garnish — discourse conventions without load-bearing mechanisms, or already covered by existing pill dossiers. |

---

## C. Process and instrument notes

1. **The Lab maps statistics, not doctrine.** Harvest #1 (a Pew statistical source) mapped at 50%. Three
   doctrinal sources from three different genres mapped at 0%, 0%, and 3.6%. This is not a defect — it is
   the instrument correctly reporting that the canon is built out of *findings about the market* and thin
   on *models of what people do inside relationships*. Worth stating explicitly in the Lab's own framing.
2. **The domain gate behaved correctly on all three runs.** It retained "contempt is the single greatest
   predictor of divorce" and set aside the media/law/culture material. No segmentation defects observed;
   the Harvest #1 "vs." shard bug did not recur. **No benchmark append is proposed from this run** —
   benchmark files were not touched, per standing rules.
3. **Zero pressure tests fired across all three runs.** Pressure tests appear to depend on mapped
   matches, so a 0%-coverage source produces no strain analysis. If that is by design it is worth
   documenting; if not, it is a small gap in the instrument, since a wholly-unmapped source is exactly
   where a reader most wants to know whether the claims strain against each other.
4. **Canon index hash drift** between the handoff brief and the committed file — see the header. Anyone
   quoting run stats should quote `1.0.0+8c38a2f1d015`.

---

## D. Recommended order of work, and what to compare with the other lane

If Jason merges both lanes and wants a single ordering, this lane's recommendation is:

1. **A3 (matchmaker honesty fence)** — highest confidence, lowest cost, pure self-consistency, and it is
   a defect rather than an addition.
2. **A1 (the retention gap)** — the one genuinely structural finding. Largest scope; suggest it be
   sequenced as its own arc rather than folded into a general merge.
3. **A4, A6, A9** — three expansions that deepen citations and frameworks the site already owns. Low
   authority risk, high coherence gain.
4. **A2, A8** — two genuinely new market forces, both needing an independent fact-check pass first.
5. **A5, A10, A11, A12** — real but smaller; several need careful evidence-tier labelling.

**Points of likely disagreement with the ChatGPT lane** — worth checking explicitly rather than assuming
agreement:
- Whether **A1** is one arc or four separate artifacts.
- Whether **sexual economics / cheap sex** (dead-listed here, deliberately) should ship. This lane
  recommends no; a lane that weighted the theory's citation count over its rebuttal exchange would
  plausibly recommend yes.
- Whether the **preference-matching null** is a gap. It is not — but it is the kind of thing a lane
  working from Lab verdicts alone would flag, because the canon's retrieval vocabulary for
  `#interaction-gate` may be thin. If the other lane raises it, the fix is **overlay enrichment**, not
  doctrine. That is Harvest #1's lesson repeating.

*Sources swept via five parallel scout agents (Sonnet 5, medium) across manosphere canon + critics,
relationship-science popularizers, podcast/long-form discourse, academic mating literature, and
mainstream/female-side discourse; ~70 candidate themes returned, triaged to the 12 above plus the
dead-candidates table. Live-site verification by four adversarial agents (Opus 5, high) reading the
actual page files. Ranking, dispositions, and all judgment calls are the Fable main loop's own.*
