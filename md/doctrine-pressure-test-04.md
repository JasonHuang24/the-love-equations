# Doctrine pressure test 04 — five-article cycle

**Run date:** 2026-08-06
**Status:** Implemented and verified; commit pending push confirmation
**Lane:** Pressure test → gap triage → doctrine implementation → adjudication (maintainer lane, Fable, high effort)

## 1. Run design

Five fresh articles — none in the corpus, none from the two prior media loops — chosen to
mix one control on covered ground with four probes at suspected doctrine gaps. Each was
fetched raw, extracted with `tools/extract-source-text.mjs`, and run through the shipped
analyzer headlessly (`fixtures/run-analyzer.mjs`), before and after the doctrine change.
Raw source text was not committed; the SHA-256 below identifies the exact analyzed bytes.
The pre-change instrument was verified first: suite 18/18 at `fdc9b5a`, canon rebuild
byte-identical, threshold fixture at 0 pending on both verdict lines.

## 2. Source ledger

| # | Article | Role | Words | Before | After | SHA-256 |
|--:|---|---|--:|--:|--:|---|
| 1 | [Deseret — Dating app fatigue: A Gen Z diagnosis](https://www.deseret.com/lifestyle/2025/07/01/gen-z-still-swiping/) | control | 1,704 | 12.8% | 15.4% | `e49666586528f78ef0bd74a2b81e8477aadb534924ef70163810b21755cb06d5` |
| 2 | [Refinery29 — What Are The Problems With Attachment Theory?](https://www.refinery29.com/en-gb/2022/06/10771935/attachment-theory-problems) | gap probe | 3,307 | 2.7% | **46.6%** · 6 tensions | `15dd7f89f5e5e0a88f62632934e872054030740aacdf181b020ef9df1c27c529` |
| 3 | [AEI — The Ideological Filter in Gen Z Dating](https://www.aei.org/society-and-culture/the-ideological-filter-in-gen-z-dating/) | gap probe | 775 | 32.1% | 39.3% · 1 tension | `69f51357f6e1d78377c9544539e289d43efad10d1441fb0d6831fa38b1322aa7` |
| 4 | [Katie Couric Media — How Therapy Speak Is Ruining Our Relationships](https://katiecouric.com/health/mental-health/therapy-speak-ruining-our-relationships/) | gap probe | 1,237 | 0% | 11.1% · 1 tension | `574eb0bb9c7746eaaf34c889a6cd9c9f81826b2ec26422c40fbad321bed1aedc` |
| 5 | [Global Comment — Age gap discourse and the power of fake outrage](https://globalcomment.com/age-gap-discourse-and-the-power-of-fake-outrage/) | gap probe | 862 | 11.1% | 11.1% | `f02ea46c58abfbd187393dd7e1f7898eed39e3e0712588ed12eb09d0470c1a13` |

Mapped-share is `mappedClaimSegments / claimLikeSegments` from the analyzer's own summary
line. "Before" is canon `1.0.0+3b3901828bc0` (556 concepts); "after" is `1.0.0+ac89d0f96ca5`
(559).

## 3. What the pressure test found

**On covered ground the engine reads sensibly.** The control article's swipe-fatigue
claims reached `search-cost` (whose aliases already carry "swipe fatigue"), and its one
High-confidence match ("dating in Utah feels like a game") was a defensible Resembles.
The instrument was not the problem where the canon had an answer.

**Three encompassing gaps, all confirmed by zero-candidate unmapped rows:**

1. **The channel.** The control's core story — users leaving the platforms, rerouting to
   in-person and social channels — had no home: the site priced the people and the search,
   never where the search happens.
2. **The ideological filter.** The AEI piece's mechanism — politics as the first screen,
   applied asymmetrically by sex and ideology — mapped only through generic trait entries
   (emotional stability, assets). The filter itself was dark.
3. **The diagnostic turn.** Attachment-style discourse and therapy-speak were a near-total
   blackout: 82 claim-like units across the two articles, ~2 mapped, none to anything on
   topic. The two articles share one mechanism — pop-clinical labels as relationship
   instruments — so they were merged into one entry rather than two.

**One deliberate non-implementation.** The age-gap essay's subject is already owned by
the wall band structure and the remarriage-gap chart; the essay itself is a fake-outrage
media critique. No doctrine was authored, and its number did not move. That is recorded
as the correct outcome, not a miss.

## 4. Implemented surfaces

Three sub-entries on `frameworks.html`, each with a `.lab-stamp` chip, aliases,
contract-compliant misreadings (9/9 fire Contradicts, probed end-to-end), boundaries and
pressure tests in `data/canon-overlay.json`:

- **15.1 The Meeting Channel** (under the Search Cost) — the Rosenfeld/HCMST migration
  (39% met online 2017 vs 22% 2009, friends disintermediated ~2013), the Ofcom 2024
  marginal-decline reversal signal (−594k/−368k/−131k UK reach, total roughly flat), and
  the screening-order model of channels (apps read looks first; friends read context;
  repeated-game channels read conduct) stated as an LE Lens with its falsifier.
- **34.2 The Ideological Filter** (under the Effective Sex Ratio) — the Gallup 15-point
  identification gap (not the discourse's 30), the IFS/YouGov filter rates
  (60% / 47% / 36% / 37% by quadrant), the pool-deletion arithmetic as an LE Lens, and
  the same survey's convergence findings as the entry's own pressure test.
- **38.1 The Diagnostic Turn** (under the Virality Filter) — attachment theory's pop
  dominance vs its modest evidence base (Fraley 2002, r ≈ .27 model-dependent),
  diagnosis-at-a-distance and its blame direction, and therapy-speak's boundary grammar
  test ("I will" vs "you can't"), with Finkel's suffocation model as the interdependence
  counterweight.

Canon 556 → 559; misreading coverage 559/559; boundary coverage 523 → 526; pins moved in
`tests/canon-index-fixtures.mjs` including a refusal pin (below).

## 5. Adjudication

Sheet: `md/lab-pressure-test-04-threshold-adjudication.md` (snapshot; the fixture is the
source of truth). Baseline `fdc9b5a`, final canon `ac89d0f96ca5`. All rulings entered by
Claude, 2026-08-06 — **the credible-line rulings are Claude's recommendations adopted
into the fixture and are flagged for Jason's review before push.**

- **minCredibleScore: 19 ruled — 5 ACCEPT / 9 REJECT on gains, 5 losses ACCEPT.**
  Accepted gains are the ideological-filter × IFS rows (the entry's subject stated by its
  own primary source) and one diagnostic-turn row that states the entry's evidence-base
  claim citing the entry's own source. Rejected gains are one mechanism: academic prose
  *using* attachment/homogamy vocabulary without engaging the entry's claim, plus one
  methods-boilerplate row. The five losses are prior junk-ish borderline matches pushed
  under the line by IDF dilution from canon growth — precision gains, though the dilution
  was this change's doing.
- **minWeakScore: 361 ruled — 42 ACCEPT / 319 REJECT** across two regens. Standard used:
  weak = "genuinely related nearby concept"; junk rows (tables, legends, keyword lists,
  reference titles) and vocabulary coincidences rejected; all existing-entry losses were
  coincidental borderline pairs and were accepted as correct prunings.
- **candidateScoreFloor: census lane, 11,365 recorded, not adjudicable per
  `md/lab-adjudication-at-scale.md`.**

**A topic magnet was caught and removed before it shipped.** First-draft aliases
`anxious attachment` / `avoidant attachment` captured ~40 flat-0.540 credible matches in
one academic source (van Lankveld uses those exact phrases 55 times) — the same signature
as the "AI companion" magnet in the hookup arc. Removed; the discourse article still
reaches the entry through `attachment theory` (28 occurrences) and `attachment style`
(11). Credible pendings fell 52 → 19 before any ruling was needed.

**The demo's planted bait caught a bad alias.** `met online` mapped the demo's
"82 percent of couples who met online said shared music taste…" bait as Supports and
consumed the research residue `lab-analyzer.test.mjs` protects — the population-descriptor
failure shape, verbatim. Removed; the demo pins returned to their committed values
untouched.

## 6. Instrument findings (recorded, not fixed here)

1. **Hyphenated compounds are structurally unreachable by authored surfaces.**
   `normalizeText` keeps hyphens while `tokenize` splits them, so text "therapy-speak"
   can be matched by neither the alias "therapy speak" (space can't match hyphen) nor a
   hyphenated phrase (dead single token). Pinned as a refusal in
   `tests/canon-index-fixtures.mjs`; the fix is an engine change for a future RED-first
   pass, not an authoring workaround.
2. **The domain gate bins therapy-register vignette prose.** 103 of 112 passages of the
   therapy-speak article fall to `no-human-relational-frame` — case vignettes about
   parents, therapists and teenage children. Partly correct (the site's domain is the
   dating market), partly a register limitation already named in loop-03's findings.
   The article's thesis and gaslighting-vignette claims that do survive the gate now map.
3. **One displayed false positive on covered ground, for the record:** the age-gap
   sentence "dating someone older than you by as little as five years…" reaches
   `smv:looks:face` at 0.472/Low. Same face/age adjacency the tranche work measured;
   cost of an existing surface, not of this change.
4. **The sweep's `--md` without `--neighbors` renders every crossing as outstanding**
   because the ruling lookup only loads when the fixture is read; harmless but confusing.

## 7. Verification

- `npm run test:lab`: 18/18 (exit 0) on the final tree; domain-benchmark floors,
  frozen benchmarks and gate registers untouched.
- Threshold fixture: 0 pending at both verdict lines; census lane recorded.
- 9/9 authored misreadings fire Contradicts end-to-end (probe-contract compliant:
  embedded, declarative, single-clause). Two first drafts failed the gate for lacking a
  relational-frame word and were rewritten — the contract's rule 1, measured again.
- Browser check on :8753: all three entries render with titles, stamps, and TOC rows
  15.1 / 34.2 / 38.1; no console errors.
- The overlay phrase edit for the gaslighting surface was proven free against the
  archive: 0 changed of 1,356,134 pairs.
