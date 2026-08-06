# PT06 — Claude findings (integrator lane)

Run of 2026-08-06, start 17:04 MDT. Method: `md/doctrine-pressure-test-04.md`;
contract: `md/pt06/PROTOCOL.md`. Lanes E–H.

## Cycle 1 — lane E — Pew Research: gray divorce (divorce rates climb for 50+)

- URL: https://www.pewresearch.org/short-reads/2017/03/09/led-by-baby-boomers-divorce-rates-climb-for-americas-50-population/
- Words: 730 · SHA-256: `f6fc88fc96f77ab24a1ab3d284898f23735b1514737e81df655b1294c3596b33`
- Canon at capture: `1.0.0+608b9220122a` (563)
- Analyzer: 27 passages · 27 claims · 5 mapped · mappedShare **18.5%** · 0 tensions
- Extraction: dropped `wp-block-prc-block-story-item` recirculation cards and the
  social-share sheet; cut at the "Related posts:" paragraph.

**Reading.** The five mapped rows are defensible neighbors: median-age-at-first-
marriage → `statistics:stat-marriage-age` (0.489 Low, correct); college-educated
marriers → `stat-remarriage-gap` (adjacent); 50+ divorce trend →
`deep-dive:what-the-wall-actually-is:band-50-plus` (right neighborhood); the
0.618 Medium row is a transitional sentence ("divorce at this stage of life can
also have some downsides") landing on `stat-remarriage-gap` — nearest-neighbor
artifact, displayed confidence acceptable, not a defect. Dark: the article's
actual subject — the age-graded DIVERGENCE of divorce rates. Since 1990 the
rate roughly doubled for 50+, roughly tripled for 65+, while falling by about a
third for 25–39; drivers are the Boomer marital biography (remarriages divorce
at double the rate of first marriages; 48% of 50+ divorcers in 2015 were in a
second+ marriage), and short-duration marriages at older ages; aftermath is
gendered financial insecurity (gray divorcees, especially women).

**Canon check.** `stat-divorce` owns who initiates; `stat-wedding-hazard` owns
what the wedding predicts; `stat-remarriage-gap` owns who re-partners after an
ending; `single-parenthood:divorce-rebuilds`/`route-in-flips` own divorce as a
route into single parenthood by era. No entry owns the trend structure: "the
divorce rate" as a composite that is falling where marriage became selective
and rising where the Boomer remarriage stock aged — which is also the mechanism
under every "divorce rates are rising/50%" myth claim.

**Verdict: GAP** — candidate subject: the divorce-rate divergence (one
mechanism: marriage's increasing selectivity pushes risk down for new
cohorts while the accumulated remarriage stock pushes it up at older ages;
"the" divorce rate is a composite of the two). Holding the proposal for the
encompassing standard until 1–2 more lane-E cycles (divorce-rate myths and
walkaway-wife discourse likely share the surface).

## Cycle 2 — lane E — IFS: The U.S. Divorce Rate Has Hit a 50-Year Low

- URL: https://ifstudies.org/blog/the-us-divorce-rate-has-hit-a-50-year-low
- Words: 683 · SHA-256: `cf55e2365440da3265c34204b20abbe71b3bf02b2b28216e561ba82b2357ae5e`
- Canon at capture: `1.0.0+608b9220122a` (563)
- Analyzer: 24 passages · 24 claims · 8 mapped · mappedShare **33.3%** · 2 tensions
- Extraction: `blog-text-contents` container; dropped related-articles/newsletter/
  email-capture. Residue: two inline "Post This" share tokens in the Highlights
  block and the author bio line (see instrument finding).

**Reading.** Good rows: the top-third-income intact-marriage stat (64% vs 24%)
reaches `frameworks:marriage-bar` (0.457 Low) — the pt05 entry earning its keep
on exactly-in-scope class-gap material. Marriage-rate-all-time-low reaches
`M-TBD-35` (0.533 Medium, correct neighborhood). Both tensions fire on the
pandemic-postponement sentence (absolute-claim + causal-claim risk flags,
priority 3) — defensible reviewer behavior, not misfires. Dark: the falling
side of the divergence — divorce at a 50-year low (14.9 per 1,000 marriages),
"marriages today have a better chance of lasting than they did 10 years ago,"
divorce becoming concentrated among the shrinking, older married stock while
young marrieds are increasingly selected. Nearest matches for those rows are
wrong-neighborhood (`sixth-rung` is the breakup rung of the ladder;
`term-the-re-entry-discount` for "longer marriages" is lexical).

**Instrument finding (real).** The author-bio line "Her work has been featured
in The New York Times, The Wall Street Journal…" mapped to
`frameworks:the-wall` at **0.540 Medium**. "Wall Street" is a lexical magnet
onto The Wall's alias surface — any finance-adjacent sentence can trip it at
displayed-Medium. Extraction-layer fix (cut the bio) masks but does not remove
the surface. Recorded for the run record; no canon edit proposed by itself.

**Verdict: GAP** (same subject as cycle 1 — the two articles are the two
halves of one composite: rising 50+/remarriage-stock side, falling
young-selective side) **+ instrument finding** (the-wall magnet).

## Cycle 3 — lane E — Psychology Today: The Walkaway Wife Syndrome, Revisited

- URL: https://www.psychologytoday.com/us/blog/divorce-busting/202209/the-walkaway-wife-syndrome-revisited
- Words: 1091 · SHA-256: `f28a6c480703023ea318b40611551776ff623b3d1db8ba4dc47d59c8f0e0dc6c`
- Canon at capture: `1.0.0+608b9220122a` (563)
- Analyzer: 46 passages · 39 claims · 7 mapped · mappedShare **17.9%** · 1 tension
- Extraction: `layout-content-main`; dropped pathways cards, subscribe form,
  more-from blocks, ads, social; cut at `social-links-bottom`. Residue: PT
  renders the pathways widget twice and a second instance leaked ~4 promo lines
  ("Take our … quiz", "Why Relationships Matter", an essential-reads title);
  one mapped at 0.431 Low (`M-TBD-30`). Extraction-layer, not instrument.

**Reading.** This is Weiner-Davis (the coiner) revising her own construct. The
mapped rows are the right neighborhoods: filed-by-women → `stat-divorce`;
men-invest-less → `frameworks:commitment-problem`; the sex-desire/investment
loop rows land on the open questions `M-TBD-29/50/21`. The single tension is
the analyzer catching "All my husband thinks about is sex" as a universalized
sex difference — correct reviewer behavior. Dark: the walkaway ARC itself —
years of asking (more time, more connection) → resignation → the Silent Zone
(complaints stop, exit gets planned) → the blindsided husband; and the 2022
revision: intractability works both ways (wives' fixed sexual-refusal stance
mirrors husbands' fixed investment stance).

**Canon check.** `stat-divorce` owns who wants the divorce (69% women-wanted,
CI noted); `stat-demand-withdraw` owns the demand→withdraw loop this arc runs
on; `costless-exit` owns exit economics in stranger markets (wrong mechanism
here — marriage exit has a shared network and is expensive). Nothing owns the
arc's signature endpoint: the silence-before-exit that reads as peace.

**Verdict: COVERED**, with one residual surface to fold at integration: a
misreading on `stat-demand-withdraw` — reading the end of complaints as
repair, when the loop's exhausted end-state is exit preparation. Not a new
entry (encompassing standard: the mechanism is already owned by
demand-withdraw + stat-divorce).

## Integration 1 — commits `62bc887` (entry) + `752c3b9` (stamp)

Cycle-2 verdict revised during canon check: the falling-rate/50%-myth side is
owned by `frameworks:stock-flow-error` (refined rate 22.8→14.2, Kennedy &
Ruggles) — that half was a retrieval miss, not a doctrine gap. What was truly
dark: the divergence itself. Shipped **31.1 The Gray Divergence** under the
Stock–Flow Error (Brown & Lin 2012 doubling 4.9→10.1 per 1,000 and the 1-in-4
share; Pew 2017 rates, remarriage split 16-vs-8, duration gradient; Lin &
Brown 2021 45%/21% aftermath — all verified at source), plus the walkaway
surface on `stat-demand-withdraw` (alias `walkaway wife syndrome` + the
silence-reads-as-peace misreading). Full pt04 procedure: baseline `--dump`
first; 253 rulings (250 weak: 12 ACCEPT / 222 REJECT / 16 loss-ACCEPT; 3
credible REJECT — junk Heyman table headers — **recommendations FLAGGED FOR
JASON**); band regenerated onto the existing fixture; 4/4 misreadings fire
Contradicts (0.73–0.75 High); zero verbatim alias hits in corpus (no magnet);
demo pins untouched; suite 18/18 both commits. Sheet:
`md/lab-pressure-test-06-threshold-adjudication.md`.

After-numbers (canon `1.0.0+79158e0f6247`): Pew gray divorce 18.5% → **74.1%**
(the divergence rows, remarriage rows, duration rows, and aftermath row all
reach the entry with sensible stances); IFS 33.3% → **37.5%**; walkaway
17.9% → **25.0%**.

**Instrument note (new).** In the Pew after-capture, "Their marital
instability earlier in life is contributing to the rising divorce rate…" —
a sentence that AGREES with the entry — displays **Contradicts** at 0.49 Low
against `gray-divergence`, plausibly stance-bleed from the new misreading
surface ("Rising divorce among older couples proves…"). Low-confidence,
correct entry, wrong stance label. Recorded; no fix authored (stance layer is
engine work).

## Cycle 4 — lane G — The Guardian: Going boysober (women who turned to celibacy in 2024)

- URL: https://www.theguardian.com/lifeandstyle/2024/dec/30/dating-culture-celibacy-boysober
- Words: 1295 · SHA-256: `322d59800d98d158a1bc4402a342fc8911ee8388166e629db75a2a343fb9f7d3`
- Canon at capture: `1.0.0+79158e0f6247` (564)
- Analyzer: 28 passages · 25 claims · 11 mapped · mappedShare **44.0%** · 1 tension
- Extraction: Guardian `maincontent` container; dropped figures/asides/gu-islands.

**Reading.** Strong coverage where the canon has surface: all seven 4B rows
reach `lexicon:term-4b` at Medium with differentiated stances (one Supports on
the Google-searches spike, one Challenges on "4B is not an attack" — good
behavior), the TikTok-trend rows reach `frameworks:virality-filter`, and the
women-abstaining row brushes `stat-casual-gap`. The tension (attraction
collapsed into selection, on the 4B-is-not-an-attack quote) is defensible.
Dark: the American individual practice itself — boysober/"celibacy era" as
deliberate, positively-framed market withdrawal (motives: app-slog backlash,
misogyny/safety protest, self-development and "decentering," the "celibate
sluts" distinction — abstaining from the market, not necessarily from sex),
and re-entry with clarified standards.

**Canon check.** `frameworks:mens-strike` owns coordinated male withdrawal AS
A HYPOTHETICAL ("withdrawal is, in principle, men's to attempt");
`lexicon:term-4b` owns the Korean movement and already notes it is "cited as
the women's strike"; `stat-why-single` owns checked-out singles' stated
reasons. Nobody owns the observed, uncoordinated, individual exit-as-practice
— the thing that actually happened here, on the female side, without
coordination.

**Verdict: GAP (candidate)** — subject: deliberate market exit as an
individual strategy (the strike that needs no coordination: one person
withdrawing on bad terms, framed as self-development). Encompasses boysober,
celibacy-era, decentering discourse; siblings: mens-strike (the coordinated
hypothetical), term-4b (the movement), stat-why-single (the stock's stated
reasons). HELD for the encompassing standard — one article is not enough to
ship a framework entry; if no second lane-G source lands this run, record as
deliberately-not-implemented with the candidate shape.

## Cycle 5 — lane H — IFS: Whither Hypergamy?

- URL: https://ifstudies.org/blog/whither-hypergamy
- Words: 1230 · SHA-256: `65a13070611c011784cbd0efff732dafd7df826133d7618262017735c5cfdf35`
- Canon at capture: `1.0.0+79158e0f6247` (564)
- Analyzer: 29 passages · 29 claims · 6 mapped · mappedShare **20.7%** · 2 tensions
- Extraction: IFS `blog-text-contents`; same drops as cycle 2. Same "Post This"
  inline residue.

**Reading.** Mapped rows are neighbors, not owners: the hypergamy-definition
row reaches `frameworks:smv-matching` (0.54 Medium), the hypogamous-divorce
row Challenges `M-TBD-39`, and both tensions are defensible (stated/revealed
preference on "marry for money"). Dark: the article's whole thesis — the
DECOUPLING. Educational hypergamy reversed (women now "partner down" on
diplomas more than men) while income hypergamy persisted (even
more-educated wives usually earn less; the Swedish register finding that men
are the main earners in every union type; highly-educated women's especially
tight preference for high-earning men).

**Canon check.** `stat-provider-norm` owns the earnings-arrangement trend
(85%→55% husband-provides); `term-assortative-mating` owns similarity
pairing; `smv-matching` owns looks-sorting; the corpus carries Hirschl (C12)
on educational homogamy/hypergamy trends. Nobody owns the decoupling as a
subject — the discourse's central "hypergamy is over / hypergamy never left"
fight is exactly this measure confusion.

**Verdict: GAP (candidate), HELD — with a blocking reconciliation.** The
corpus manifest's C12 correction records that in Hirschl's measure the 1990
inflection belongs to HOMOGAMY and "hypergamy's rise runs continuously from
about 1970" — which reads opposite to the IFS "women increasingly marry
down" framing unless the two use "hypergamy" for different measures
(likely: income- vs education-based, or wives'-relative-education
direction conventions). An entry authored before that reconciliation would
risk enshrining the very measure confusion it should dissolve. Not shipped
this run; the reconciliation is the named next step.
