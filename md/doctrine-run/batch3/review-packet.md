# RESEARCH PACKET — BATCH 3 (citation-grade closers)

**Structured in two parts, per the packet doctrine.**

- **PART ONE — SYNTHESIS (orchestrator-authored).** Cluster framing, the run's one quantitative finding,
  cross-scout tensions, Lab measurement, provenance grades. This layer is the orchestrator's own object.
  It **paraphrases no scout claim**; where it restates one it anchors to the exact place in Part Two.
- **PART TWO — SCOUT FINDINGS, VERBATIM (scout-authored).** Complete findings files from S-G, S-H, S-I-A
  and S-I-B, embedded byte-for-byte with every locator intact.

## What this structure does and does not let you audit

**⟦UNIT 1⟧**

**It lets you audit the reasoning.** Every Part One claim *restated from* a scout carries an anchor into the
Part Two block that supports it (convention below). **Two exceptions, named because the claim would otherwise
be universal and false:** the two provenance inventories — "Primary reads OUTSIDE the hash chain" and "Scout
cross-check" — are scout-*derived* rather than scout-restated and carry no anchors. **They are not equally
checkable.** The first can be verified line-by-line against the scouts' own CONFIDENCE NOTES. The second's
overlap percentages are **orchestrator-computed, appear nowhere in Part Two**, and are an orchestrator-side
control you are taking on trust. If Part One says something Part Two does not, that
is visible from inside this document, with no other file needed. That is the property this structure is for,
and it is the property a reader fenced to this packet can actually exercise.

**It does not let you audit the bytes.** The embedded blocks were concatenated by script from the scout
files and each block's SHA-256 was recomputed from the written packet and compared against its source file
— but that check ran **on the orchestrator's side, before you received this**. A reader holding only this
document cannot repeat it: the digests below are assertions to you, not verifications by you. Same for the
corpus hashes in PROVENANCE. Treat both as **orchestrator-side controls, disclosed so you know they exist
and know you are taking them on trust.** Where a claim rests on one, this packet says so.

## Review units

Part One is divided into **43 numbered units**, marked `**⟦UNIT n⟧**` immediately before the block
they label. A unit is one claim block: a paragraph, a bullet, or a table with its surrounding sentences.
Part Two carries no unit markers — it is scout-authored and is the evidence against which Part One is
checked, not a claim layer of its own.

## Anchor convention

**⟦UNIT 2⟧**

`[S-G §c2 ▸"relatively weak support"]` means: **scout S-G**, that scout's own section **(c)** numbered item
**2**, and the quoted fragment is a literal string you can find in that scout's Part Two block. The
fragment, not the section number, is the citation — section numbering is the scout's and is given only to
narrow the search. Every anchor string in Part One was checked to occur in its named block.

---

# PART ONE — SYNTHESIS (orchestrator-authored)

## Tier definitions and the probability-versus-opt-in rule

**⟦UNIT 3⟧**

**TIER 1** = peer-reviewed with independent replication, **or** a large-n probability-sample instrument
with published methodology · **TIER 2** = single survey or study, no independent replication · **TIER 3** =
commentary, trend reporting, convenience or opt-in sample, third-party aggregation, **or any source not
read primary** ("TIER 3 as sourced", with the counterfactual stated separately).

> A large-n **probability-sample** instrument with published methodology is TIER 1 under the second limb
> regardless of replication status. **Where no margin of error is published, the assignment rests on sampling
> design alone and is stated as such** — which is the case for **all four** limb-2 assignments this packet
> relies on: Trent & South 2011 and Filser & Preetz 2021 in S-G, and **Esteve et al. 2016** (120 countries,
> 1960–2011, >0.5 billion person-records) and the **Hirschl CDE working paper** (N = 5,059,000) in S-I-A, both
> of which S-I-A grades "TIER 1 as read" on design. An earlier revision of this block named only the first two;
> that undercounted, and Part One relies on the Esteve assignment at the C12 cluster. An **opt-in or quota
> panel** is excluded from that limb however large it is, and cannot exceed TIER 2 on sample size alone.
>
> An earlier draft of this block required "published methodology **and** a published margin of error" in the
> blockquote while requiring only published methodology in the definition line. Neither limb-2 source here is
> shown to publish an MOE, so the stricter reading would have disqualified both assignments the packet makes.

All four batch-3 scouts applied the unread-source convention themselves, unprompted by any correction
round — see their tier strings in Part Two ("TIER 1 as read", "TIER 3 as sourced").

## THE RUN'S ONE QUANTITATIVE FINDING — the retention gap, measured on the instrument

Checkpoint 01 identified the site's formation/maintenance asymmetry by **inventory**: counting frameworks,
charts, rulings and lexicon terms that touch post-pairing territory. This corpus permits a different test —
**how well the canon retrieves claims from formation-side sources versus maintenance-side sources, on one
instrument, one threshold set, one canon snapshot.**

### The load-bearing warrant, evidenced rather than asserted

**⟦UNIT 4⟧**

The comparison is only meaningful if the instrument did not move between the two arms. That warrant was
previously asserted here. It is now read out of **every analysis export on disk** — all 21 of them — and
tabulated. Distinct-value counts across the whole corpus:

| Epoch field (path inside each export) | Distinct values across 21 exports | Value(s) |
|---|---|---|
| `schemaVersion` (analysis schema) | **1** | `le-lab.analysis/2.6` |
| `provenance.analyzer.researchQueueSchemaVersion` | **1** | `le-lab.research-queue/2.1` |
| `provenance.analyzer.mode` | **1** | `local-lexical-v2` |
| `provenance.analyzer.scoringConfigHash` | **1** | `bt0a7p` |
| `canonIndex.version` | **1** | `1.0.0+949aef381d5f` |
| `canonIndex.generatedAt` | **1** | `2026-07-27T11:38:21.000Z` |
| `canonIndex.schemaVersion` | **1** | `le-canon-index/1.1` |
| `canonIndex.conceptCount` | **1** | `450` |
| `canonIndex.sourceCount` | **1** | `19` |
| `provenance.identity.canonSnapshotHash` | **1** | `1v8z11a1xzrjgp` |
| `domainRelevance.policy` | **1** | `deterministic-relational-frames-v2` |
| `coverage.denominator` | **1** | (one identical sentence) |
| `provenance.analyzer.version` | **2** | `2.6.0` — sources 01, 02, 04 · `2.6.1` — sources 05–22 |

**Twelve of thirteen epoch fields are single-valued across the entire corpus. The thirteenth is the
analyzer patch version.** The two that matter most for the obvious confound — *did the canon grow between
the two arms, so that later-analyzed sources map better?* — are `conceptCount` (**450**, invariant) and
`canonSnapshotHash` (**`1v8z11a1xzrjgp`**, invariant). The canon did not grow, shrink, or change identity
at any point in this corpus. It is one snapshot.

**Trust class, flagged because this packet's own policy requires it.** Like the digests and corpus hashes in
PROVENANCE, this tabulation is an **orchestrator-side control** — it was read off the exports on disk before
you received this document, and **a packet-fenced reader cannot repeat it.**

**⟦UNIT 5⟧**

On the remaining analyzer split: sources 01/02/04 were analyzed at 2.6.0 and everything from 05 up at
2.6.1. `md/lab-v2.6.1-sol-handover.md` records the standing ruling that the 2.6.0 → 2.6.1 change provably
cannot move this corpus — `provider` and `breadwinner` occur zero times across all three of the 2.6.0
sources, `provider` holds the canon's only non-empty denylist, and the threshold sweep returned **0 changed
of 46,350 pairs**. `merge-manifest.mjs` hard-fails if any non-analyzer epoch field moves, which is the
mechanism that kept the other twelve fields aligned rather than luck.

**Two honest limits on this warrant.** (1) The zero-of-46,350 sweep is a prior ruling recorded in the repo,
not a measurement in this packet — a packet-fenced reader takes it on trust. (2) **Exactly one of the thirteen
stage-classified sources sits on the 2.6.0 side** — source 01, in the formation arm. The other two 2.6.0
exports, sources 02 and 04, sit in "Other" and are **not stage-classified at all**. An earlier draft of this
sentence said "three of thirteen," which its own parenthetical refuted. The split is therefore as lopsided as
it can be, and **the invariance of the other twelve fields is what carries the warrant, not the sweep.**

### The classification, with every source named

**⟦UNIT 6⟧**

**This classification is the orchestrator's own judgment.** Three disclosures a reader is entitled to before
weighing it. **One:** every source is **named** below so any assignment can be disputed individually, and
**full locators for all 21 — author, year, venue, URL — are in the CITATION APPENDIX**, because a topic label
is not a citation and an earlier revision of this packet offered only the label. **Two:** the classification
was made **with the mapped shares already in hand** — the shares were not blind to it. **Three:** every
per-source figure in this table and the two that follow is an **orchestrator-side control** read off the
exports on disk, on the same footing as the epoch table above — **a packet-fenced reader cannot repeat any of
it.**

| Group | Sources | Claim-like | Mapped | Mapped share |
|---|---|---|---|---|
| **Formation** | 01 Pew online dating · 11 IFS Gen-Z partner priorities · 17 Trent & South sex ratios · 18 Li necessities/luxuries · 19 Zhang preference replication · 20 Marzoli mate preferences · 21 Hirschl assortative mating | 535 | 129 | **24.1%** |
| **Maintenance** | 05 Kim generalizability · 07 van Lankveld desire · 08 McNulty early marriage · 09 Conroy-Beam discrepancies · 10 Miller alternatives · 22 Finkel suffocation | 1,416 | 99 | **7.0%** |
| Other | 02 fem-centrism · 04 heteropessimism · 13 Wheatley counterfeit connections · 14 Common Sense AI companions · 15 ASC American friendship · 16 Pew emotional support | 204 | 9 | 4.4% |
| Method papers | 06 Heyman cross-validation · 12 NEP exit-poll methods | 46 | 0 | 0.0% |
| **Corpus total** | **21 analyzed sources** | **2,201** | **237** | **10.8%** |

**On the denominator: 21, not 22.** Source 03 (four-horsemen) is in the manifest but has **no analysis
export** and contributes nothing to any figure above. Manifest IDs run to 22; analyzed sources number 21.
Earlier drafts of this section labelled a 21-ID enumeration "22 sources"; that was wrong and is corrected
here.

**⟦UNIT 7⟧**

**The canon retrieves formation-side claims about 3.4× as often as maintenance-side claims.**

### Per-source shares, ranked, so the overlap is countable rather than characterized

**⟦UNIT 8⟧**

| Rank | Source | Arm | Share |
|---|---|---|---|
| 1 | 01 Pew online dating | F | **43.5%** |
| 2 | 19 Zhang preference replication | F | 38.4% |
| 3 | 18 Li necessities/luxuries | F | 26.5% |
| 4 | 21 Hirschl assortative mating | F | 18.8% |
| 5 | 17 Trent & South sex ratios | F | 16.5% |
| 6 | 08 McNulty early marriage | **M** | 14.2% |
| 7 | 11 IFS Gen-Z partner priorities | F | 12.7% |
| 8 | 09 Conroy-Beam discrepancies | **M** | 12.2% |
| 9 | 20 Marzoli mate preferences | F | 10.5% |
| 10 | 07 van Lankveld desire | **M** | 7.1% |
| 11 | 10 Miller alternatives | **M** | 6.5% |
| 12 | 05 Kim generalizability | **M** | 3.8% |
| 13 | 22 Finkel suffocation | **M** | 3.8% |

**The overlap, stated exactly.** The band **10.5%–14.2%** contains **four of the thirteen sources — two
from each arm**: formation 11 (12.7%) and 20 (10.5%), maintenance 08 (14.2%) and 09 (12.2%). A previous
draft here said only two sources overlapped and named 20 and 08; that undercounted, and the correct count
is four. The five highest shares are all formation and the four lowest are all maintenance; the middle four
interleave.

### Robustness — every leave-one-out that could matter

**⟦UNIT 9⟧**

| Test | Formation | Maintenance | Ratio |
|---|---|---|---|
| Pooled, all 13 stage-classified sources | 24.1% (129/535) | 7.0% (99/1,416) | 3.45× |
| Excluding source 22 (largest maintenance source, 576 segments) | 24.1% | 9.2% (77/840) | 2.63× |
| Excluding source **01** (highest formation share, and highest in the corpus) | 21.6% (102/473) | 7.0% | 3.08× |
| Excluding source 19 (second-highest formation share) | 21.4% (96/449) | 7.0% | 3.06× |
| Excluding **01 and 22** | 21.6% | 9.2% | 2.35× |
| Median per-source share rather than pooled | 18.8% | 6.8% | 2.76× |

The gap survives every leave-one-out at ≥2.35×, and the median reproduces the pooled result.

### TWO READINGS OF THE SAME NUMBERS. This packet does not choose between them.

**⟦UNIT 10⟧**

The four-group ordering is **formation 24.1% > maintenance 7.0% > other 4.4% > method 0.0%** — monotone.
That ordering is consistent with two different claims about the site, and they are not the same claim.

**Reading A — stage asymmetry.** The canon has a hole where post-pairing content should be. Maintenance
material maps poorly because the canon has comparatively little maintenance doctrine to match it against.
This is checkpoint 01's inventory finding reproduced on a second instrument.

**Reading B — genre-proximity decay.** The canon fires on material topically near its core (mate
preference, market dynamics, formation) and its hit rate decays with distance from that core. Stage is a
*proxy* for distance, not the operative variable. On this reading the monotone four-group ordering is a
single distance gradient with "other" and "method" as its tail, and maintenance's 7.0% is a distance
effect, not a stage-specific deficit.

**What each reading predicts, so they can be told apart:**

| | Reading A (stage asymmetry) | Reading B (proximity decay) |
|---|---|---|
| Hold topic constant, vary stage — e.g. mate value measured pre-pairing vs. post-pairing in the same literature and register | The pre-pairing member maps **substantially better** | The two map **similarly** |
| Within-maintenance spread across near-core vs. far-from-core subject matter | Modest; the arm is uniformly starved | **Large** — comparable to the between-arm gap |
| Canon-side census of entries by stage | An **absolute deficit** of maintenance-topic canon entries | Maintenance entries may be **adequately numerous** yet still under-fire on distant prose |
| A formation source far from the canon's core | Still maps well — it is formation | Maps **poorly** — distance, not stage, governs |

**⟦UNIT 11⟧**

**The datum both readings must accommodate, and which does not separate them.** Within-arm spread is
already as large as the between-arm ratio: maintenance runs 3.8%→14.2% (**3.7×** internal) and formation
10.5%→43.5% (**4.1×** internal), against a between-arm ratio of 3.45×. Reading B says that is the same
mechanism at finer grain. Reading A says sources differ in how much of their prose is on-domain at all, so
within-arm spread is expected and carries no information about the between-arm contrast. **Both
accommodations are available and this corpus does not discriminate between them.**

**⟦UNIT 12⟧**

**Why this is not adjudicated here.** Three of the four tests above are *new measurements* — a canon-side
census, a matched-pair analysis holding topic constant, and a formation source far from the canon's core.
The fourth, the within-maintenance near-core/far-from-core comparison, is a **re-reading of existing corpus
shares under a new topical classification** rather than a new measurement. **None of the four can be performed
inside this packet**, and the two readings imply different remedies for the site: Reading A says write maintenance doctrine, Reading B
says the retrieval is lexically narrow and more doctrine in the same vocabulary will not fix it.
**Choosing between them is a referee question, and it is the most substantive unresolved item in batch 3.**

### What the finding does and does not license, either way

**⟦UNIT 13⟧**

- It does **not** license the absolute numbers. Thresholds are uncalibrated by design
  (`coverage.provisional = true` in all 21 exports), so 24.1% and 7.0% are not measurements of anything in
  the world.
- It **does** license the *comparison*, on the epoch evidence above: both arms went through one analyzer
  mode, one scoring config, one canon snapshot, so the uncalibrated thresholds are held constant across
  arms. That is the one inference an uncalibrated instrument supports.
- **What it licenses is a gap of some kind, not a diagnosis of which kind.** See the two readings.
- Individual assignments worth disputing: source 17 (sex ratios → marriage timing and premarital sex) is
  the most arguable formation assignment; moving it to "other" would *strengthen* the gap. Source 08
  (newlywed satisfaction trajectories) is the maintenance source most plausibly formation-adjacent, and is
  already the highest-mapping maintenance source.
- **Confound named:** maintenance sources here are longer and denser on average, which is why the
  excluding-22 row exists. The gap narrows and survives.

## Cluster C4 — sex ratio, and the mechanism that was tested rather than missing

The evidence is S-G's, in Part Two. The checkpoint's disposition was that the site cites Guttentag &
Secord twice for the individual-value reading and omits the mechanism half — dyadic versus structural
power. **That framing needs revising, and the revision is the finding.**

**⟦UNIT 14⟧**

**The mechanism half is instrumented, not merely asserted** — and in the two most direct tests S-G reached,
the *structural-power* leg fared worse than the *dyadic* leg. S-G's own summary of that asymmetry, which
this packet adopts rather than restating: the structural-power half "came out **weak, mixed, or
contradicted**," while the dyadic/whole-market-availability half "came out comparatively robust," and
"**neither study found grounds to reject the dyadic-power half; both found the structural-power half harder
to confirm than the book's framing implies**" [S-G §c ▸"weak, mixed, or contradicted"].

**The word this packet previously used was "partly falsified," and it is withdrawn — but not for the reason an
earlier revision gave.** That revision said "'falsified' asserts a disconfirmation the two studies do not
deliver," which contradicts this packet's own next two units: Trent & South **did** contradict the
structural-power prediction on three outcomes, and Dollar's pooled result **is** a contradiction. The accurate
reason is narrower: **Dollar's pooled contradiction is self-attenuated** (she attributes it to her own measure)
**and her moderator arm is mixed**, so the record across the two tests is S-G's three-way "weak, mixed, or
contradicted" rather than a falsification. The defeaters below are what make the weaker word the right one.

**⟦UNIT 15⟧**

The two tests:
- **Trent & South (2011)** derived *competing* predictions from sociocultural theory (dyadic **plus**
  structural) against demographic-opportunity theory (no structural component). Both predicted earlier
  female marriage under male-biased ratios — non-discriminating. On premarital sex, extramarital sex and
  multiple partners, the China data matched demographic-opportunity and contradicted the structural-power
  prediction [S-G §c1 ▸"the China data matched demographic-opportunity theory"].
- **Dollar (2014)** — Cindy Brooks Dollar, *Gender-Power Disparity Over Time: Testing the Sex Ratio Thesis,
  1970–2000*, PhD dissertation, North Carolina State University, Department of Sociology; full locator in the
  CITATION APPENDIX below. It is the only source located that *operationalises* structural power as a variable
  (relative female-to-male labour-force participation) and tests it two ways. As a direct outcome of sex
  ratio, the pooled US result ran opposite to the predicted direction [S-G §c2 ▸"the relationship ran positive"]. As a moderator, Dollar reports "**only some support**" — marriage-formation rates conditioned
  in the theorized direction, divorce rates not conditioned at all [S-G §c2 ▸"only some support"].

**⟦UNIT 16⟧**

**Four defeaters Part Two supplies, all of which a previous draft of this section dropped:**
1. **Dollar attributes her own null to her instrument, not to the theory:** the weak support "may be due to
   a combination of my rudimentary measure of female structural power and expectations about equalized
   gendered structural power in the U.S." [S-G §c2 ▸"my rudimentary measure"].
2. **The theorized relationship did hold for Black and Hispanic populations**, and for Whites it ran positive
   **and non-significant** — a null, not a counter-directional result [S-G §c2 ▸"Black and Hispanic populations"].
   An earlier draft said it "failed only for Whites" and dropped the non-significance, which upgrades a null
   into a contrary finding. What the disaggregation supports is that **the pooled contradiction masks a
   subgroup split**; it does not support a White counter-effect.
3. **South (1988) reportedly found stronger, cross-nationally consistent support** on a similar
   labour-force-participation measure — reported by Dollar, **TIER 3 as sourced**, S-G could not verify it
   [S-G §c2 ▸"South (1988) reportedly found"].
4. **Dollar's moderator test is mixed, not negative** — see "only some support" above. A negative
   characterisation of the moderator arm is not available from this record.

**⟦UNIT 17⟧**

**Two limits, correctly attributed:**
1. **Guttentag & Secord (1983) itself was never reached, and S-G flagged this first** — it is GAP 1 in
   S-G's own gaps list, not an orchestrator addition [S-G §GAPS1 ▸"Google Books shows only a title"]. A previous draft credited this observation to the orchestrator. Whose finding it is matters
   here, because the packet's other provenance claims rest on scouts being the ones who name their own
   barriers.
2. **The definitions come through two independent secondary readers, not one.** A previous draft said "all
   dyadic/structural definitions come through Dollar's quotation," understating the base: S-G records them
   "in Guttentag & Secord's own vocabulary **as reported by two independent secondary readers** (Trent &
   South 2011, a peer-reviewed journal article; and Dollar 2014, a dissertation), converging on the same
   terms" [S-G §c ▸"as reported by two independent secondary readers"]. Two converging secondary readers is
   still not the book, but it is a materially stronger base than one.

**⟦UNIT 18⟧**

**Also load-bearing:** Filser & Preetz (2021, n = 12,402, pairfam) find objective local sex ratio
correlates only weakly with individuals' *subjective* partner-market experience [S-G §b ▸"correlated only weakly"] — a caution about the mechanism's plumbing that applies to any sex-ratio claim
the site makes, including the individual-value one it already publishes. **Not archived** (see PROVENANCE).

**⟦UNIT 19⟧**

**Consequence for disposition:** C4's missing half is not a gap the site simply failed to fill. The
mechanism has been tested, the structural leg is the weaker one, and the record on it is mixed with named
defeaters on both sides. Adding it as doctrine without that mixture would import a contested mechanism as
settled; adding it *with* the mixture is a different and more defensible artifact.

## Cluster C9 — budget-structured preferences, and which joint is weak

The evidence is S-H's, in Part Two, which read five sources primary by byte-level extraction.

The three-part claim decomposes cleanly, and the parts have sharply different support:

**⟦UNIT 20⟧**

- **(a) What reaches TIER 1 is the sex-typed allocation pattern — not the budget gate.** Source 19 (Zhang
  et al. 2019) is an independent preregistered replication with no author overlap with the Li program, in
  UK and Chinese samples, and it replicates men allocating more to physical attractiveness and women more
  to social status. But **it used a single fixed 100-mate-dollar budget**, and S-H states the limit itself:
  it "says nothing about budget SIZE and is evidence for (a) only, not (b)" [S-H §a ▸"single fixed 100-mate-dollar budget"]. A necessity-versus-luxury **gate** is a claim about
  what happens *as the budget changes*; a fixed-budget design cannot demonstrate it. So TIER 1 attaches to
  **the sex-typed allocation pattern** [S-H §a ▸"the sex-typed necessity pattern"], and the gate
  architecture itself shares the evidential limit of (b) below. A previous draft of this section wrote "the
  gate / necessity-versus-luxury architecture reaches TIER 1"; that misscoped what Zhang can carry and is
  corrected here.
  Source 20 (Marzoli et al. 2013) is a second independent lineage that confirmed the attractiveness-for-men
  half and **explicitly failed to replicate the resources-for-women half** [S-H §a ▸"we failed to observe"] — archived precisely because a failure is as load-bearing as a
  success. The finer taxonomy (which specific traits are universal necessities versus luxuries) rests on
  source 18 alone and stays TIER 2.
**⟦UNIT 21⟧**

- **(b) The convergence half — sex differences shrinking as budget grows — is TIER 2, and structurally
  cannot be replicated from these lineages.** The finding is genuine and correctly attributed in source 18,
  with explicit Budget × Sex interactions [S-H §b ▸"F(2,278)=12.06"]. But **neither independent lineage
  varied budget size**: both used a single fixed budget, so neither could test convergence even in
  principle [S-H §b ▸"used a SINGLE fixed budget and therefore could not and did not test convergence"].
  This is the weakest joint in the claim, and the assignment anticipated it.
**⟦UNIT 22⟧**

- **(c) The surveys-are-free inference splits in two, and the halves must not be merged.** Li's own
  "unconstrained judges gloss over necessities" argument is the paper's *rationale for building the budget
  task*, never isolated against a real unconstrained-survey comparison condition — **TIER 3 as sourced**
  [S-H §c ▸"gloss over necessities"]. Separately, the stated-versus-revealed divergence in speed dating
  **is TIER 1**, independently replicated by a preregistered Reproducibility Project entry [S-H §c ▸"we fully replicated"]. But that supports an adjacent claim — stated preferences don't
  predict revealed choice — not Li's zero-marginal-cost mechanism, and S-H says so directly [S-H §c
  ▸"CAUTION on strand 2"].

**⟦UNIT 23⟧**

**Program concentration, handled by the scout and worth surfacing:** the later Li-authored extensions all
retain Li as an author and were correctly refused as independent lineages [S-H §"Program-concentration
finding" ▸"all retain Norman Li as an author"]. Two genuinely independent lineages were read primary, plus
a third for bucket (c).

## Cluster C12 — assortative mating, and two corrections to the record

The evidence is S-I-A's, in Part Two. This was scoped as citation-level and it stays there — but with
corrections that matter for citing it at all.

**⟦UNIT 24⟧**

1. **The citation was wrong.** The first author is **Hirschl**, not Schwartz; the prior record's "Schwartz
   et al." misattributes it [S-I-A §1 ▸"first author IS Hirschl, not Schwartz"]. Full particulars —
   journal, volume, pages, DOI, working-paper predecessor — in Part Two.
**⟦UNIT 25⟧**

2. **The 1990 inflection belongs to homogamy, not hypergamy.** The paper's own summary sentence: "trends in
   homogamy stopped increasing in 1990 and have declined primarily because of the increasing odds that
   wives have more education than their husbands" [S-I-A §3 ▸"stopped increasing in 1990"]. Hypogamy's rise runs continuously **from about 1970 to about 2010, with a slight resurgence of
   hypergamy since the 2010s**, and "does not have a clean 1990 kink" of its own [S-I-A §3 ▸"clean 1990 kink"]. The paper's contribution is a decomposition — rising
   hypogamy is what *capped* the rise in homogamy.
**⟦UNIT 26⟧**

3. **The relationship to Esteve et al. (2016) is refinement, not correction.** Esteve "never discusses
   homogamy" as a separate construct and there is no numeric conflict [S-I-A §4 ▸"never discusses homogamy"], so the site's existing Esteve citation is **incomplete rather than wrong or stale**. That
   keeps the disposition citation-level and argues against promotion.

**⟦UNIT 27⟧**

**Provenance limit, load-bearing:** source 21 is the **CDE working paper, not the published article.** The
published *Demography* body text was unreachable (403 from Duke University Press to every method tried).
The abstract was cross-checked
word-for-word — but **against a third-party blog's rendering of the published abstract** (S-I-A names
schoolinfosystem.org's summary post), **not against the publisher's own text, which was never reached at
all.** An earlier draft said "cross-checked against the published version," which attributed a secondary
retelling's text to the primary. Every substantive finding is sourced to the working paper and must be
labelled so [S-I-A §6 ▸"2023 working-paper draft"].

## Cluster C1d — the suffocation model, and the half that never passed commentary

The evidence is S-I-B's, in Part Two, which read four sources primary in full.

**⟦UNIT 28⟧**

**The three components fail in three different ways, and only one of them fails by being unmeasured.** A
previous draft of this section opened with "all three components are asserted rather than measured," which
contradicted its own next bullet — component (ii) *is* measured, on secondary time-diary data. The accurate
statement is component-by-component:

1. **Demand concentration — asserted, TIER 3, and not the claim the popular framing implies.** The article
   **explicitly rejects** the "freighted marriage" reading — that Americans simply ask more of marriage
   than before — and tabulates it as *other people's* view [S-I-B §1(i) ▸"freighted marriage"]. Its own
   claim is an Altitude × Time interaction with the total surface area of the marital dependence zone
   "roughly stable over time" [S-I-B §1(i) ▸"roughly stable over time"] — a change in the *kind* of demand,
   not the *quantity*.
2. **Investment shortfall — measured, but only for clock time, only through secondary data, and
   baseline-sensitive.** The clock-time half "**is** grounded in real time-diary data" [S-I-B §2(ii)
   ▸"grounded in real time-diary data"], though every number is secondary and none was collected to test
   this model. The bandwidth half is an "inference chain," not a measurement [S-I-B §2(ii) ▸"inference chain"].
3. **Variance widening — never measured in any of the three Finkel sources.** The target article contains
   "no dispersion statistic of any kind" — no variance, SD, interquartile range, tail share or
   distributional test [S-I-B §2(iii) ▸"no dispersion statistic of any kind"]. Its strongest empirical citation — **Proulx, Helms & Buehler (2007), a meta-analysis S-I-B places on its
   explicit NOT-read list and therefore grades TIER 3 as sourced** — is *reported* to show a *strengthening
   correlation*, and S-I-B names the gap: "a strengthening correlation is not a widening dispersion"
   [S-I-B §2(iii) ▸"strengthening correlation is not a widening dispersion"]. **This is the half with
   predictive content.** No batch-3 artifact carries a venue, DOI or URL for Proulx et al., so it **fails this
   packet's citation floor** and is named as such rather than repaired — see the CITATION APPENDIX.

**⟦UNIT 29⟧**

**Two structural facts that change how the cluster should be graded:**
- **Source 22 reports no original data.** It is a target article followed by commentaries and a reply;
  every figure in it is adapted from someone else's analysis [S-I-B §3 ▸"reports no new data"]. It is
  therefore **TIER 3 for every empirical claim despite a full read** — grade the claim, not the venue.
- **The variance half was consolidated after the commentary round**, in the reply and a 2015 précis, from
  two tenets the reply itself marks as new [S-I-B §1 ▸"introduced after peer commentary"]. Separately, the
  investment-requirement tenet *was* disputed and Finkel **partly conceded on wording**, offering to drop
  "typically requires" for a claim of strong association [S-I-B §3(b) ▸"typically requires"] — which
  loosens the mechanism the whole demand/investment mismatch depends on.

**⟦UNIT 30⟧**

**On whether the commentaries engaged the variance claim — scoped to what was actually verified.** A
previous draft asserted "no commentary disputed the variance claim," which converted an explicit UNVERIFIED
into a flat negative existential about 13 papers nobody in this run read. Withdrawn. What **is** verified:
the REPLY was read primary in full, it organises itself around three named areas of significant
disagreement, and none of the three is the variance claim [S-I-B §3 ▸"three areas of significant disagreement"]. What is
**UNVERIFIED**: whether any of the 13 commentaries nonetheless touched it — S-I-B read none of them
(paywalled) and says so in terms: "Whether any commentary nonetheless touched it is UNVERIFIED, since I
read none of them" [S-I-B §3 ▸"Whether any commentary nonetheless touched it is UNVERIFIED"]. The commentary S-I-B flags as most likely to bear on the **demand** claim's evidentiary status — Neff &
Morgan's "What We Do and Do Not Know" — is a **named GAP**. An earlier draft assigned that commentary to the
*variance* claim; that is not S-I-B's assignment.
So the defensible form of the point is about the *reply's* agenda, not about the commentary corpus: **the
half with predictive content is absent from the reply's own map of what its critics disputed.**

**⟦UNIT 31⟧**

**A re-analysis of the same time-use series that cuts against the investment claim.** GFG (Genadek, Flood &
Garcia Roman 2015) harmonise American Heritage Time Use Survey data 1965–2012 and find couples **without
children** spending **more** total and **more** alone-together time than in 1965 — while **parents gained
roughly an hour a day of total spouse time but neither gained nor lost alone-together time** — with **both
non-parent series peaking in 1975, Finkel's baseline year** [S-I-B §2(ii) ▸"with both series **peaking in 1975**"].
An earlier draft said "couples," generalising a non-parent result to all couples. Non-parents are −11 min/day measured from
1975 but **+53 min/day measured from 1965** [S-I-B §2(ii) ▸"gained 53 minutes/day"], and the pre-1975
series is not reported in the target article. GFG also record that prior research, naming Dew (2009), "did
not account for measurement variation across surveys," so over-time declines are overestimated [S-I-B
§2(ii) ▸"did not account for measurement variation across surveys"].

**⟦UNIT 32⟧**

- **This is a re-analysis, not an independent check, and a previous draft called it one.** GFG works the
  **same underlying US time-diary tradition** that supplies Finkel's Dew (2009) figures, harmonised across
  waves and extended back to 1965. Its force comes from *harmonisation and a longer window on the same
  data*, not from a second independent instrument. Labelled accordingly. **TIER 2** — single study, read
  primary as a working paper; the peer-reviewed *Demography* version was not read.
**⟦UNIT 33⟧**

- **GFG's own exculpatory wrinkle, which a previous draft dropped.** S-I-B records it for completeness:
  the increases are concentrated in **leisure and television**, and parents spend a smaller *share* of
  shared time alone together — so "a model that cared about the quality rather than quantity of shared
  time could survive GFG" [S-I-B §5 ▸"One further wrinkle in Finkel"]. S-I-B's reason for not letting that
  rescue the tenet is that Tenet 4 is a quantity claim. Both halves belong in the record.
- **Net:** the investment shortfall is **sensitive to a baseline-year choice the article does not defend**
  — measured from 1975 a decline, measured from 1965 a reversal for total time and a large increase for
  non-parents' alone-together time.

**⟦UNIT 34⟧**

**The misattribution question, evidenced from both texts instead of inferred.** A previous draft asserted
the site "states this premise nearly verbatim" and quoted **neither** text, which left the inference
unsupported. Both are quoted now.

- The site passage — orchestrator's own site-internal read, `dd-relationships-throughout-history.html:271`:
  "The modern love-match asks one person to be everything that three whole institutions — kin, church, and
  economy — used to divide among themselves… **The market did not get harsher. The job description got
  longer** — far longer than any single relationship has ever been asked to carry."
- The model's own position, per S-I-B: it rejects the "more is asked of marriage" reading as other people's
  and claims total demand "roughly stable over time" [S-I-B §1(i) ▸"freighted marriage"].

**So the two texts do conflict — the site asserts the quantity growth the model disclaims.** But the
misattribution is **not in the site's prose**, and the evidence for that is below rather than asserted. An
earlier draft rested this conclusion on a single uncited quotation from a document outside this packet, while
disclosing the trust class of the *site* quote in the same breath and not of that one. That was the defect.
Four checks, all of them reads of repository files:

1. The Framework callout containing the passage (`dd-relationships-throughout-history.html:269–273`) **carries
   no `dd-callout-cite` element**, while **10 other callouts in the same file do** — including the immediately
   preceding one at `:258`, which cites Rosenfeld, Thomas & Hausen (PNAS 2019). The absence of attribution is
   **structural**, not an artifact of how closely the passage was read.
2. The strings `Finkel`, `suffocat`, `Mount Maslow`, `oxygenat` and `all-or-nothing` occur **zero times** in
   that file.
3. Site-wide, `Finkel` appears **only** as a co-author on the speed-dating / stated-versus-revealed
   literature — Joel, Eastwick & Finkel 2017 (`frameworks.html:183`), Eastwick & Finkel 2008
   (`smvlevers.html:158`), Hunt, Eastwick & Finkel 2015 (`statistics.html:256`). **The suffocation model is
   cited nowhere on the site.**
4. Corroborating, and now cited rather than floated: doctrine checkpoint 01's reverse-check records the
   passage as "unnamed, uncited" — `md/claude-doctrine-checkpoint-01.md:89`.

**Trust class, stated in full.** All four checks are **orchestrator reads of repository files** — the same
class as the hash controls, and **a packet-fenced reader can verify none of them.** They are disclosed as
controls, not offered as evidence you can exercise. What changes from the earlier draft is that the conclusion
now rests on a structural feature of the file plus three independent string searches, with the external
document as corroboration rather than as its sole support.

**So the conclusion, scoped:** the published page attributes the passage to nobody, so **it misattributes
nothing.** **The misattribution risk lives in the doctrine record's pairing** of that passage with
"Supporting: Finkel lineage" as its evidence. If the passage is promoted with the Finkel lineage cited behind
it, the site would then be sourcing to a model that disclaims the reading. That is a live defect in the
*candidate doctrine*, not in the published page.

**One corroboration withdrawn as non-independent.** An earlier draft wrote that S-I-B "independently records"
that the site's sentence uses none of the model's distinctive vocabulary. **It is not independent.** S-I-B's
own sentence reads: "the website's premise sentence **(as described in my assignment)** uses none of the
model's distinctive vocabulary" [S-I-B §"Note for the LE Lab" ▸"as described in my assignment"]. The scout
**never saw the page**; its observation is derived from the orchestrator's own description of the sentence, so
it corroborates nothing here. It stands only as a canon-mapping observation about the *described* sentence.
The vocabulary absence is established instead by check 2 above.

**A miscorrelation risk this adjudication surfaced, which did not exist before it:** because `Finkel` **is**
present on the site as a speed-dating co-author, any canon or citation sweep keyed on the surname will find
Finkel cited and could wrongly conclude the suffocation model is sourced. The two Finkel literatures are
unrelated, and only one of them is on the site.

## LAB MEASUREMENT — the six sources archived for this batch

Analyzer 2.6.1, schema `le-lab.analysis/2.6`, scoring config `bt0a7p`, canon `1.0.0+949aef381d5f`,
canon snapshot `1v8z11a1xzrjgp`. **Every mapped-share figure is PROVISIONAL** — thresholds authored by
judgment, never fitted to labelled data. Document-coverage measurements only: not population statistics,
not factual accuracy, not evidence any claim is true.

**⟦UNIT 35⟧**

| # | Source | Grade | Words | Claim-like | Mapped | Share | Queue | Set aside |
|---|---|---|---|---|---|---|---|---|
| 17 | Trent & South, sex ratios (China) | A | 6,689 | 97 | 16 | 16.5% | 81 | 160 |
| 18 | Li et al., necessities & luxuries | B | 7,588 | 117 | 31 | 26.5% | 86 | 321 |
| 19 | Zhang et al., preference replication | A | 4,257 | 86 | 33 | **38.4%** | 53 | 164 |
| 20 | Marzoli et al., scenario manipulation | A | 6,503 | 86 | 9 | 10.5% | 77 | 138 |
| 21 | Hirschl et al., assortative mating (WP) | B | 3,352 | 32 | 6 | 18.8% | 26 | 245 |
| 22 | Finkel et al., suffocation (target article) | B | 26,323 | 576 | 22 | 3.8% | **554** | 765 |
| | **Total** | | **54,712** | **994** | **117** | — | **877** | **1,793** |

**⟦UNIT 36⟧**

**Both superlatives in an earlier draft of this section were wrong, and its own per-source list refuted
them.** Corrected:

- **Source 01 (Pew online dating, 43.5%) is the highest mapped share in the corpus and the highest
  formation share.** Source 19's 38.4% is **second** on both counts, and is the highest share among the six
  sources archived *in this batch*. The earlier claim that 19 was highest in the corpus was asserted twice
  and was false both times.
- Source 22's **554**-item queue on 576 claim-like segments is the largest single residue in the corpus. That
  is a corpus-wide superlative asserted from a batch table, so here is the evidence rather than the assertion:
  **the five largest residues across all 21 analyzed sources are 22 → 554 · 09 → 230 · 07 → 158 · 05 → 153 ·
  13 → 122**, read from the same exports as the epoch table above (an orchestrator-side control — see UNIT 4).
  Four of those five are maintenance-side sources.

Those two facts still sit at opposite ends of the same measurement — the canon retrieves formation-side
mate-preference content well and post-pairing maintenance content poorly — but which reading of *why*
remains open; see the two readings above.

## PROVENANCE

### What is archived, and under which grade

**⟦UNIT 37⟧**

- **Grade A** — archived HTML → committed `tools/extract-source-text.mjs` → SHA-256. **Sources 17, 19, 20.**
  Reproducible from the repository, because the extractor is a hashed repo file.
- **Grade B** — archived PDF → `pdftotext` 4.00 with recorded flags (`-enc UTF-8 -nopgbrk`) and recorded
  `awk` anchor truncation → SHA-256. **Sources 18, 21, 22.** Reproducible with the same external tool
  version; the extractor is a binary rather than a hashed repo file, so this grade is **strictly weaker**.
- **Two grade-B sources carry a further, separate weakness the grade does not capture:** source 18 is a
  **third-party Semantic Scholar mirror**, not a publisher or institutional copy; source 21 is a **working
  paper, not the version of record**.

**⟦UNIT 38⟧**

**Digests, so the assertion is at least checkable by someone holding the repository** (normalized-text
SHA-256; raw-archive and export digests are in `lab-corpus.manifest.json`):

| # | `lab-corpus/sources/<id>.txt` SHA-256 | Grade |
|---|---|---|
| 17 | `a0687bc8dc468b77728f32eba4dff105163d70593da39980a49aac5419779316` | A |
| 18 | `6b222a7e5e3e6796c830f44986f5bccfec04168ef2b9d763784f99afa71e206b` | B |
| 19 | `8c7ce87a0aa6bcf9f6d0b3f1dea1fda5b841bfb5b29db27ca386b6bbba8969e4` | A |
| 20 | `793b49e448816314955670daf422d62f0ea05be6de1dc4ad6951bdcd2d7596c8` | A |
| 21 | `406daa09c098a42807f7d41cc1bd84e87eda78b46e0086e78a7e396ecdb24fce` | B |
| 22 | `61f5f1166434b76a1189edd9e8b679dfcb05f68c8ad73dd83bc669e095073eab` | B |

**Orchestrator-side control, disclosed as such:** every hash recorded in the committed manifest was
recomputed from disk — **159 hashes across all 22 manifest entries, 0 failures**. That check ran before you
received this document and **you cannot repeat it from inside the packet.** It is offered as a disclosure of
what was done, not as evidence you can exercise.

### Primary reads OUTSIDE the hash chain — the complete list

**⟦UNIT 39⟧**

An earlier draft named three ("the Dollar dissertation, Eastwick & Finkel, and Selterman et al."). **That
enumeration was materially incomplete.** The full list of sources a batch-3 scout read primary that carry
**no extraction chain and no hash**, with whether a Part One claim above rests on them:

| Source | Scout | Read as | Part One claim rests on it? |
|---|---|---|---|
| Dollar (2014) dissertation | S-G | full-text PDF | **YES** — the structural-power operationalisation, the pooled contradiction, "only some support", the "rudimentary measure" defeater, the race disaggregation, the South (1988) report, and one of the two definition readings |
| Filser & Preetz (2021), *Human Nature* 32(2) | S-G | full text through Methods | **YES** — the objective-vs-subjective sex-ratio caution |
| Kruger, Fitzgerald & Peterson (2010), *Evolutionary Psychology* 8(3) | S-G | full text | no |
| Secord (1983), *PSPB* | S-G | **abstract only** | no |
| Wikipedia, "Marcia Guttentag" | S-G | full page, provenance facts only | no (and TIER 3 by S-G's own labelling) |
| Eastwick & Finkel (2008) | S-H | full text | **YES** — the TIER 1 stated-vs-revealed leg of C9(c) |
| Selterman, Chagnon & Mackinnon (2015) | S-H | full text | **YES** — the independent-replication half of that same leg |
| Esteve et al. (2016), *PDR* 42(4) | S-I-A | full text | **YES** — the refinement-not-correction finding in C12 |
| Finkel et al. (2014) REPLY, *Psych. Inquiry* 25:120–145 | S-I-B | full text | **YES** — the three-areas-of-disagreement scoping, the "typically requires" concession, the post-commentary consolidation |
| Finkel et al. (2015) PRÉCIS, *CDPS* 24(3) | S-I-B | full text | **YES** — where the all-or-nothing/variance framing lives |
| Genadek, Flood & Garcia Roman (2015), MPC WP 2015-2 | S-I-B | full text | **YES** — the entire time-use counter-evidence and its wrinkle |

**Eight of eleven carry load-bearing Part One claims.** Their locators are in Part Two. This packet claims
**no hash provenance for any of them**, and any Part One claim resting only on them is provenance-weaker
than one traced to the archive. Also outside the hash chain, and disclosed for the same reason: the site
quote in C1d is an **orchestrator read of a repository file**, not a scout capture and not an archived
corpus artifact.

### Scout cross-check

**⟦UNIT 40⟧**

8-word shingle overlap of each scout's own capture against the orchestrator's deterministic extraction:
**17 → 95.2% · 18 → 87.9% · 19 → 67.9% · 20 → 74.3% · 21 → 74.6% · 22 → 61.8%.**

**No pass/fail threshold was ever set for this cross-check.** An earlier draft wrote "none fell below 60%,"
which implies a floor this run never stated; withdrawn. The measure is diagnostic, not a gate: collapsed
overlap would indicate a scout that paraphrased, truncated or invented prose, **but this run set no criterion
for collapse**, so the six values (**61.8%–95.2%**) are reported **without a pass/fail conclusion**. A previous
revision withdrew the 60% floor and then wrote "none of the six collapsed," which smuggles the same unstated
criterion back in; that verdict is withdrawn too.

**⟦UNIT 41⟧**

**The four values below 80% are explained, not waved through** (an earlier draft said "the three lowest"
and then explained four):

- **22 → 61.8%** is the expected consequence of this run's own content-filter mitigation: S-I-B was
  instructed to cap its extract at roughly 1,100 verbatim words drawn from **six named non-contiguous
  sections**, so shingles spanning its section joins have no counterpart in a continuous 26,323-word
  extraction.
- **19 → 67.9%, 20 → 74.3%, 21 → 74.6%** all involve an `r.jina.ai` reader on the scout's side, run against
  the orchestrator's own extraction. **Extractor identity is not a sufficient explanation on its own** —
  source 18 was captured through the same reader and scored **87.9%** — so document format and section
  coverage are doing part of the work here, and **the residual is unexplained.** An earlier draft offered the
  extractor alone as the explanation, which the packet's own 87.9% refutes.
- **Separately, and independently of that:** for source 21 the scout's reader was **also `r.jina.ai`, not its
  own `pdftotext`** — S-I-A records reading the CDE working paper "via r.jina.ai text-extraction proxy," and
  an earlier draft attributed a pdftotext invocation to that scout. `pdftotext` is the **orchestrator's**
  grade-B extractor for source 21, not the scout's reader.

**⟦UNIT 42⟧**

**No scout capture was archived as a corpus artifact.** Every source was independently re-fetched and
re-extracted by the orchestrator, because a model-mediated transcription is not reproducible byte-for-byte.

## CITATION APPENDIX — locators for every source Part One relies on

**⟦UNIT 43⟧**

**Scope, stated first because an earlier revision of this header overclaimed it.** This appendix covers **two
groups**: the sources batch-3 scouts read primary (first table), and the **21 analyzed corpus sources** behind
the quantitative finding (second table). The earlier header said "locators for every source Part One relies
on" while listing only the first group — omitting all 15 pre-batch-3 corpus sources, which were identified by
topic label alone. That was the larger floor failure of the two, and it is cured below. Sources Part One
relies on that **still** fail the floor are named at the end, so the header no longer claims completeness it
does not have.

### Sources the batch-3 scouts read primary

**Why this table exists.** Part Two names many of these by author and year only. Cluster C9's block defers
its locators to a `capture.json` **that is not embedded in this packet**, and the Dollar dissertation — the
single most load-bearing unhashed source in Part One — appears in Part Two as "Dollar (2014) dissertation, NC
State repository" with no title and no URL. On this packet's own citation floor those are **failures**, and
holding the locators in a file the reader does not have does not cure a floor the reader cannot reach. They
are cured here.

**Provenance of this table, stated because it matters:** every row is taken from the **scouts' own
`capture.json` files**, committed alongside this packet at `md/doctrine-run/batch3/S-*-capture.json`. They are
scout artifacts, not orchestrator research — but they sit **outside Part Two**, so a packet-fenced reader is
taking this table on the same trust as the hash controls.

| Source | Venue / locator | URL or DOI |
|---|---|---|
| Trent & South (2011) | *Social Forces* 90(1):247–267; PMC author manuscript PMC3244803, NIHMSID NIHMS338053 | `pmc.ncbi.nlm.nih.gov/articles/PMC3244803/` |
| **Dollar, Cindy Brooks (2014)** | *Gender-Power Disparity Over Time: Testing the Sex Ratio Thesis, 1970–2000*, PhD dissertation, North Carolina State University, Dept. of Sociology (committee chair Charles R. Tittle) | `repository.lib.ncsu.edu/server/api/core/bitstreams/1444bb2d-81f2-4d89-9c55-7fe87dad0e30/content` |
| Filser & Preetz (2021) | *Human Nature* 32(2):406–433; PMC8321994 | `pmc.ncbi.nlm.nih.gov/articles/PMC8321994/` |
| Kruger, Fitzgerald & Peterson (2010) | *Evolutionary Psychology* 8(3):420–431; PMC10481007 | `pmc.ncbi.nlm.nih.gov/articles/PMC10481007/` |
| Secord (1983) — **abstract only** | *Personality and Social Psychology Bulletin* | DOI `10.1177/0146167283094002` |
| Li, Bailey, Kenrick & Linsenmeier (2002) | *Journal of Personality and Social Psychology* 82(6):947–955 | `pdfs.semanticscholar.org/ac8b/4d80ae733ec47f697b4ece632c6cc749d138.pdf` |
| Zhang, Wang, Lee, DeBruine & Jones (2019) | *Royal Society Open Science* 6(11):181243 | `ncbi.nlm.nih.gov/pmc/articles/PMC6894565/` |
| Marzoli, Moretto, Monti, Tocci, Roberts & Tommasi (2013) | *PLOS ONE* 8(9):e74282 | `pmc.ncbi.nlm.nih.gov/articles/PMC3771886/` |
| Eastwick & Finkel (2008) | *Journal of Personality and Social Psychology* 94(2):245–264 | `faculty.wcas.northwestern.edu/eli-finkel/documents/EastwickFinkel2008_JPSP.pdf` |
| Selterman, Chagnon & Mackinnon (2015) | *SAGE Open* 5(3):1–14 | `api.drum.lib.umd.edu/server/api/core/bitstreams/bdf3d914-7d5b-42a2-b436-375f066e81e8/content` |
| Hirschl, Schwartz & Boschetti — **working paper, read** | CDE Working Paper 2022-01, UW–Madison, draft 2023-02-24 | `cde.wisc.edu/wp-content/uploads/sites/278/2023/02/cde-working-paper-2022-01-1.pdf` |
| Hirschl, Schwartz & Boschetti — **published version, NOT read** | *Demography* 61(5):1293–1307 (2024) | DOI `10.1215/00703370-11558914` |
| Esteve, Schwartz, Van Bavel, Permanyer, Klesment & Garcia-Roman (2016) | *Population and Development Review* 42(4):615–625 | `ced.cat/wp-content/uploads/2016/12/Population_Development_Review_2016_A.Esteve_et-al.pdf` |
| Finkel, Hui, Carswell & Larson (2014) — **TA** | *Psychological Inquiry* 25(1):1–41 | DOI `10.1080/1047840X.2014.863723` |
| Finkel, Larson, Carswell & Hui (2014) — **REPLY** | *Psychological Inquiry* 25:120–145 | DOI `10.1080/1047840X.2014.890512` |
| Finkel, Cheung, Emery, Carswell & Larson (2015) — **PRÉCIS** | *Current Directions in Psychological Science* 24(3):238–244 | DOI `10.1177/0963721415569274` |
| Genadek, Flood & Garcia Roman (2015) — **GFG, working paper, read** | Minnesota Population Center WP 2015-2 | DOI `10.18128/MPC2015-2` · `assets.ipums.org/_files/mpc/wp2015-02.pdf` |
| GFG — **peer-reviewed version, NOT read** | *Demography* (2016) | DOI `10.1007/s13524-016-0512-8` |

### The 21 analyzed corpus sources — locators for the quantitative finding

**Why this table exists.** The classification table and every robustness row rest on **21 analyzed corpus
sources**, and an earlier revision of this appendix identified 15 of them **by topic label alone** — "01 Pew
online dating", "05 Kim generalizability" — with no author, year, venue or URL anywhere in the packet, while
this section's header claimed to hold "locators for every source Part One relies on." **The header overclaimed
and the floor failed for those 15.** Both are cured here.

**Provenance:** taken from the committed corpus manifest, `lab-corpus.manifest.json`. Like the capture-file
table above, the manifest sits **outside Part Two**, so a packet-fenced reader takes this on the same trust as
the hash controls.

| # | Author / organisation | Year | Venue | Locator |
|---|---|---|---|---|
| 01 | Emily A. Vogels & Colleen McClain | 2023 | Pew Research Center (Short Reads) | `pewresearch.org/short-reads/2023/02/02/key-findings-about-online-dating-in-the-u-s/` |
| 02 | Rollo Tomassi | 2011 | The Rational Male (blog) | `therationalmale.com/2011/12/21/fem-centrism/` |
| 04 | Asa Seresin | 2019 | The New Inquiry | `thenewinquiry.com/on-heteropessimism/` |
| 05 | Hyoun K. Kim, Deborah M. Capaldi & Lynn Crosby | 2007 | *Journal of Marriage and Family* 69(1):55–72 | `pmc.ncbi.nlm.nih.gov/articles/PMC1828692/` |
| 06 | Richard E. Heyman & Amy M. Smith Slep | 2001 | *Journal of Marriage and Family* 63(2):473–479 | `pmc.ncbi.nlm.nih.gov/articles/PMC1622921/` |
| 07 | Jacques van Lankveld, Marieke Dewitte, Peter Verboon & Susan van Hooren | 2021 | *Frontiers in Psychology* 12 | `pmc.ncbi.nlm.nih.gov/articles/PMC8255964/` |
| 08 | James K. McNulty, Carolyn A. Wenner & Terri D. Fisher | 2016 | *Archives of Sexual Behavior* 45(1):85–97 | `pmc.ncbi.nlm.nih.gov/articles/PMC4472635/` |
| 09 | Daniel Conroy-Beam, Cari D. Goetz & David M. Buss | 2016 | *Evolution and Human Behavior* 37(6):440–448 | `labs.la.utexas.edu/buss/files/2013/02/What-Predicts-Romantic-Relationship-Satisfaction-EHB-in-press-Conroy-Beam-Goetz-Buss-in-press.pdf` |
| 10 | Rowland S. Miller | 2007 | 10th Sydney Symposium of Social Psychology (chapter draft) | `sydneysymposium.unsw.edu.au/2007/Chapters/MillerSSSP07.pdf` |
| 11 | Wendy Wang, Institute for Family Studies | 2026 | IFS blog; survey fielded by YouGov | `ifstudies.org/blog/the-one-role-gen-z-women-still-want-men-to-play` |
| 12 | National Election Pool / Edison Research | 2024 | NEP exit-poll methods statement | `s.abcnews.com/assets/dtci/elections/NEPExitPollMethodologyStatement.pdf` |
| 13 | Brian J. Willoughby, Jason S. Carroll, Nathan Dover & Hailey Hakala (Wheatley Institute, BYU) | 2025 | Wheatley Institute report | `brightspotcdn.byu.edu/a6/a1/c3036cf14686accdae72a4861dd1/counterfeit-connections-report.pdf` |
| 14 | Common Sense Media, with NORC at the University of Chicago | 2025 | Common Sense Media research report | `commonsensemedia.org/sites/default/files/research/report/talk-trust-and-trade-offs_2025_web.pdf` |
| 15 | Daniel A. Cox, Survey Center on American Life | 2021 | American Perspectives Survey | `americansurveycenter.org/research/the-state-of-american-friendship-change-challenges-and-loss/` |
| 16 | Pew Research Center | 2025 | "Men, Women and Social Connections", ch. 2 | `pewresearch.org/social-trends/2025/01/16/where-men-and-women-turn-for-emotional-support-and-social-connection/` |
| 17–22 | *see the table above* | | | batch-3 sources, locators from the scout capture files |

**Source 03 (The Gottman Institute, "The Four Horsemen") is in the manifest with no URL and no analysis
export.** It is excluded from every figure in this packet, which is why the denominator is 21 and not 22
(UNIT 6). It is listed here only so the exclusion is visible rather than silent.

**Two things this table does not fix.** Sources **02** (a blog post) and **04** (a magazine essay) are now
citable but are still **TIER 3 material by this packet's own definitions** — they sit in the "Other" group and
contribute 1 mapped segment between them, so nothing in the quantitative finding turns on them. And a locator
is not a read: these 21 sources were re-fetched and hashed by the orchestrator, which is a provenance property
and **not** a claim that any scout or the orchestrator read them in full for this batch.


**Sources Part One relies on that STILL fail the citation floor — named rather than repaired:**

- **Proulx, Helms & Buehler (2007)** — the strongest empirical citation behind the variance half. **No
  batch-3 artifact carries a venue, DOI or URL**, and S-I-B did not read it. **TIER 3 as sourced, floor
  failed.** Part One's claim about it is that it measures *a different quantity*, which does not depend on the
  locator, but the floor failure stands.
- **Guttentag & Secord (1983), *Too Many Women? The Sex Ratio Question*** — the book itself. **Never
  reached**; S-G's GAP 1, barrier named. Every definition in Part One comes through two secondary readers.
- **Li & Kenrick (2006) · Li, Valentine & Patel (2011) · Thomas, Sulikowski, Li et al. (2020)** — named only
  to establish program concentration, none read primary, no locators recorded. What they support is a
  *refusal* to count them as independent lineages, which is the conservative direction.
- **South & Trent (1988) · South (1988) · Barber (2000–2004) · Lichter, Anderson & Hayward (1995) · Uecker &
  Regnerus (2010) · the five book reviews** — all secondhand inside S-G, all **TIER 3 as sourced** there.
- **Dew (2009) · Amato et al. (2009) · Ramey & Ramey (2010) · Marquardt et al. (2012) · Martin (2006) · the
  13 commentaries** — all unread inside S-I-B, all **TIER 3 as sourced** there.


---

# PART TWO — SCOUT FINDINGS, VERBATIM (scout-authored)

The four files below are embedded byte-for-byte, concatenated by script from the scout files. Every
locator, URL, DOI, sample size, tier assignment and recorded gap is the scout's own and has not been
edited, summarised, or reordered. Where Part One restates any claim from these files it anchors to a
literal string inside them (see the anchor convention above). The per-block SHA-256 shown with each block
is an **orchestrator-side control** — see "What this structure does and does not let you audit."

**One dispatch note relevant to reading S-I-A and S-I-B:** these two scouts replace a single scout (S-I)
that was terminated mid-run by an API output content-filtering block while writing long verbatim extracts.
Its assignment was split in two and its extract length capped. The salvaged partial capture from the failed
run is what first identified the Hirschl authorship correction.


## S-G — C4 sex ratio and the dyadic/structural mechanism — embedded verbatim

> Source file: `S-G-findings.md` · SHA-256 `45b8ed32690d7081f8bf43c1dc9e9849da5ed56d09dd7b11a420b173eb901636`
> Concatenated by script, not retyped. Nothing below this line is orchestrator-authored.

<!-- BEGIN VERBATIM SCOUT BLOCK: S-G — C4 sex ratio and the dyadic/structural mechanism -->
# C4 — Operational sex ratio, whole-market norms, and the dyadic/structural power mechanism

Scout S-G, Batch 3. Claim under investigation: "Operational sex ratio shifts whole-market relational norms and commitment supply, beyond scaling individual value."

## (a) Sex ratio correlates with individual mate value / "exchange rate" (the reading already on the site)

Almost nothing found in this pass is a clean (a)-type claim; nearly every source below measures aggregate/market-level outcomes, not an individual's personal "price." The one exception is secondhand:

- **Lichter, Anderson & Hayward (1995)**, cited inside Dollar (2014) [raw-02.txt]: "women in high sex ratio societies are more likely than women in low sex ratio societies to actualize their preference (Buss 1989) and marry a higher status man." This is a population-average statement about individuals realizing higher-value matches — closest thing to the site's existing "exchange rate" reading found in this pass. TIER 3 as sourced (read only as quoted inside Dollar's dissertation; did not read Lichter et al. 1995 directly).

Note for the maintainer: this scarcity of (a)-type sources in a broad sex-ratio literature search may itself be informative — most of the empirical sex-ratio literature is already operating at (b), market-level outcomes, not individual-value scaling. That is a property of the literature, not a search failure; flagging it rather than asserting it as a finding.

## (b) Sex ratio shifts whole-market norms (commitment, promiscuity, marriage/divorce rates) beyond individual scaling

- **Trent & South (2011), "Too Many Men? Sex Ratios and Women's Partnering Behavior in China," Social Forces 90(1):247-267** [raw-01.txt, read in full, TIER 1 as sourced — peer-reviewed, large nationally-representative probability sample: Chinese Health and Family Life Survey, n=3,821 adults ages 20-64, plus three Chinese censuses for community sex ratios]. Finding: high (male-biased) local sex ratio is associated with earlier female marriage (both competing theories predicted this) AND with *increased* likelihood of premarital sex, extramarital sex, and multiple sexual partners — a whole-market behavioral shift, not merely individual bargaining power translating into "marrying up." Effects held after controls for community-level confounders (fixed-effects models), strengthening a causal reading.

- **Kruger, Fitzgerald & Peterson (2010), "Female Scarcity Reduces Women's Marital Ages and Increases Variance in Men's Marital Ages," Evolutionary Psychology 8(3):420-431**, PMC10481007, open access CC-BY-NC [read in full directly, not saved as a raw file — see note below; TIER 2 as sourced: single ecological-correlational study across the 50 largest US Metropolitan Statistical Areas using 2000 Census data, no independent replication found in this pass]. Finding: female scarcity (male-biased Operational Sex Ratio) correlates with significantly earlier mean/median female marital age and with increased *variance* in male marital age (some men marry earlier, others take longer to accumulate status), but no significant shift in mean male marital age. Explicitly cites Guttentag & Secord (1983) for the claim that female-biased OSR is linked to increased divorce, family conflict, out-of-wedlock births, and violent crime — but that specific G&S-attributed claim is TIER 3 as sourced here (Kruger et al. did not test it; they cite it as background).

- **Dollar (2014) dissertation** [raw-02.txt, TIER 2 as sourced — single dissertation using near-universal US Census tract/county/state data 1970-2000, not independently replicated]. Original analysis (not in raw-02.txt verbatim, read via full-text PDF extraction): sex ratio was consistently related to female marriage rates and familial structure in the theorized direction, but was *positively* (not negatively, as the simple theory implies) related to both female and male divorce rates — Dollar's own interpretation is that this pattern is "consistent with the marriage market approach, which does not take into account gendered patterns of structural power differences," i.e., a whole-market alternative-availability effect rather than a structural-power effect.

- **Filser & Preetz (2021), "Do Local Sex Ratios Approximate Subjective Partner Markets? Evidence from the German Family Panel," Human Nature 32(2):406-433**, PMC8321994, open access CC-BY [read in full through Methods, not saved as raw file; TIER 1 as sourced — large probability-sample panel, pairfam, n=12,402 respondents wave 1, stratified two-stage sampling, published methodology]. This is a *caution* on (b): local (objective) sex ratios, at state/county/municipality level and using standard adult- or operational-sex-ratio definitions, correlated only weakly with individuals' own *subjective* reports of a same-sex "surplus" in their encounters. The authors argue the literature has assumed, without much testing, that objective local sex ratio maps cleanly onto individual/whole-market lived experience, and their data push back on that assumption. This does not contradict (b)-type aggregate correlational findings above, but it weakens the *mechanistic* story connecting a measured sex ratio to a market participant's actual perception of scarcity/abundance.

- **Secondhand only, TIER 3 as sourced in every case** (known via citation inside Trent & South 2011 and/or Dollar 2014, both of which I read primary; I did not read these originals):
  - South & Trent (1988), "Sex Ratios and Women's Roles: A Cross-National Analysis," *American Journal of Sociology* 93(5) — 117-country cross-national study: sex ratio positively related to percentage of women married, inversely related to nonmarital fertility ratio, female literacy rate, and female labor-force participation rate.
  - South (1988) — 111-country cross-national study: similar marriage/divorce patterns; fertility rises and women's age at marriage/labor-force participation/literacy fall with high sex ratios.
  - Barber (2000, 2001, 2003, 2004) — teen pregnancy, divorce, and violent-crime associations with sex ratio (England, Scotland, US historical data; cross-national teen-pregnancy replication).
  - **Uecker & Regnerus (2010), "Bare Market: Campus Sex Ratios, Romantic Relationships, and Sexual Behavior," The Sociological Quarterly 51:408-435** — could not be reached (see GAPS). Via WebSearch snippet only: nationally-representative sample of 986 college women across 212 campuses; women on campuses where women are a larger share of the student body report more negative appraisals of campus men and relationships, fewer dates, lower likelihood of having had a college boyfriend, and higher likelihood of being sexually active. The paper is explicitly framed around a "dyadic power thesis" (scarce men translating into lower relationship commitment and a more sexually permissive climate) — directly on point for this assignment's (b)/(c) split, but not independently verified by this scout.

## (c) The two-sided dyadic-versus-structural power mechanism specifically

This is where the two raw files concentrate, and where the most useful, precise material was found.

**Definitions, in Guttentag & Secord's own vocabulary as reported by two independent secondary readers (Trent & South 2011, a peer-reviewed journal article; and Dollar 2014, a dissertation), converging on the same terms:**
- *Dyadic power*: the relative power each sex holds in two-person (interpersonal) relationships. The scarcer sex is less dependent — more alternative partners are available — so it can negotiate from strength or exit unsatisfying relationships more freely. The oversupplied sex is more dependent, weaker in the relationship.
- *Structural power*: "the relative amount of control that males and females generally have over social, political and economic resources" (Dollar 2014, paraphrasing/quoting Guttentag & Secord 1983:26, 1983:30). Per Trent & South (2011, itself quoting/paraphrasing G&S): "The extent to which dyadic power shapes gender-specific behavior is constrained by the distribution of structural power which resides with men in all but a handful of societies... Women's ability to use dyadic power to gain freedom and independence is limited because men use their structural power to limit and modify women's potential use of dyadic power."
- Dollar (2014) gives specific page citations to the 1983 book for these claims: 1983:26, 1983:30, 1983:154/174/239 (on the possibility of structural power shifting toward women under sustained low sex ratios), and 1983:167 (on the 1960s feminist movement being sparked by a realization of unbalanced dyadic power "further provoked by realizing men's possession of superior structural power").
- Dollar (2014) also argues (her own analytical framing, not G&S's) that G&S's "structural power" is functionally close to what feminist scholars call "patriarchy," though Guttentag and Secord never use that word themselves.

**Is the mechanism actually instrumented/tested anywhere, or only asserted? Both — with mixed-to-negative results for the structural-power half specifically:**

1. **Trent & South (2011)** [raw-01.txt] built the sharpest direct test found in this pass: they derived *competing* hypotheses from "sociocultural theory" (Guttentag & Secord's dyadic+structural mechanism) versus "demographic-opportunity theory" (a whole-market availability mechanism that does *not* invoke structural power at all — more available partners simply means more relationships form, full stop, regardless of who holds institutional power). Both theories correctly predicted earlier female marriage under male-biased sex ratios (non-discriminating outcome). But for premarital sex, extramarital sex, and multiple-partner behavior, the China data matched demographic-opportunity theory's predictions and contradicted sociocultural/structural-power theory's predictions. Their own discussion (verbatim in raw-01.txt) explicitly floats the possibility that China's "economic development, modernization, and ideological liberalization may have altered traditional gender differences in 'structural power'" as one explanation for the mismatch — i.e., they treat structural power as a variable, testable condition, not a constant.

2. **Dollar (2014)** [raw-02.txt + additional full-text read] is the only source found that directly *operationalizes* structural power as a variable (relative female-to-male labor-force participation) and tests it two ways against 1970-2000 US Census data at neighborhood/county/state levels:
   - **As a direct outcome of sex ratio** (does a low sex ratio raise female structural power, as the theory predicts?): For the pooled/full US population, the result *contradicted* the theory — the relationship ran positive (high sex ratio associated with *more*, not less, female structural power), the opposite of the predicted direction. Disaggregated by race/ethnicity, the theorized (negative) relationship *did* hold for Black and Hispanic populations but not for Whites, where it was also positive (non-significant).
   - **As a moderator of sex-ratio's effects on dyadic outcomes** (does structural power condition how sex ratio affects marriage, divorce, marital fertility?): "only some support." Marriage-formation rates were consistently conditioned by relative female structural power in the theorized direction; divorce rates showed *no* conditioning effect at all; conditioning effects on family-structure outcomes (marital fertility, female-headed families) were significant for Whites, only weakly (within-tract) significant for Blacks, and absent for Hispanics.
   - Dollar's own words (read in full text, not reproduced verbatim in the raw files beyond the excerpt given): "my findings regarding the relatively weak support for Guttentag and Secord's hypothesis on female structural power as a contingency factor in male-female relations may be due to a combination of my rudimentary measure of female structural power and expectations about equalized gendered structural power in the U.S." She notes that South (1988) reportedly found *stronger*, cross-nationally consistent support using a similar labor-force-participation measure of structural power — a claim I could not independently verify (TIER 3 as sourced; South 1988 not read directly).

**Bottom line on (c):** the dyadic/structural distinction is instrumented in the literature, not just asserted — but in the two most direct tests reachable in this pass (Trent & South 2011 on China; Dollar 2014 on the 1970-2000 US), the *structural-power* half of the mechanism specifically came out weak, mixed, or contradicted, while the *dyadic*/whole-market-availability half (more available partners changes marriage/relationship timing) came out comparatively robust. Neither study found grounds to reject the dyadic-power half; both found the structural-power half harder to confirm than the book's framing implies.

## Provenance of the 1983 book

- Marcia Guttentag died of a heart attack on November 4, 1977, five days before her 45th birthday, while working on the manuscript. Her husband, Paul F. Secord, completed the work; it was published in 1983 under both names, credited as co-authored. Source: Wikipedia, "Marcia Guttentag" article — TIER 3 as sourced (encyclopedia entry, not a primary biographical record; I did not reach an obituary, memorial article, or the book's own preface/acknowledgments, which would likely state this in the authors' own words).
- Paul Secord separately published a solo article the same year — **Secord, Paul F. (1983), "Imbalanced Sex Ratios: The Social Consequences," Personality and Social Psychology Bulletin** — restating the theory via social exchange theory in his own voice. I retrieved only the abstract, verbatim: "Imbalanced population sex ratios dramatically influence gender roles, shape relationships between them, and produce changes in family structures. This report briefly sketches these findings and, by means of social exchange theory, spells out the linkage between this demographic condition and its social consequences." (https://journals.sagepub.com/doi/10.1177/0146167283094002) — genuinely primary (Secord's own published words) but too short to serve as a raw file on its own, and the full text is paywalled. TIER 2 as sourced for the abstract itself (I did read that fragment directly); the article's substance beyond the abstract is a GAP.
- The book received positive/notable reviews in the Canadian Journal of Sociology, Sociology, Contemporary Psychology, Signs, and The Social Science Journal, and an entry in the American Journal of Sociology — known only via WebSearch snippet blurbs ("fascinating, scholarly, provocative," "a unique contribution," "controversial, ambitious, consciousness-raising"), none of which restate the dyadic/structural distinction with any precision beyond what Trent & South (2011) and Dollar (2014) already provide. TIER 3 as sourced; GAP for their actual content.

## CONFIDENCE NOTES

**Read primary, in full or near-full text, directly by this scout:**
- Trent & South (2011), Social Forces / PMC3244803 — raw-01.txt. TIER 1 as sourced.
- Dollar (2014) dissertation, NC State repository — raw-02.txt. TIER 2 as sourced.
- Kruger, Fitzgerald & Peterson (2010), Evolutionary Psychology / PMC10481007 — full text read, not saved as a separate raw file (assignment specifies raw-01/raw-02 only); URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC10481007/. TIER 2 as sourced.
- Filser & Preetz (2021), Human Nature / PMC8321994 — read through Methods section, not saved as a raw file; URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC8321994/. TIER 1 as sourced.
- Secord (1983) abstract only, via https://journals.sagepub.com/doi/10.1177/0146167283094002.
- Wikipedia "Marcia Guttentag" article, read directly, for provenance facts only (not a scholarly source, cited as such).

**Reached only secondhand (cited inside a primary source I read, or via WebSearch snippet) — all TIER 3 as sourced regardless of what they might rate if read directly:**
- South & Trent (1988), *American Journal of Sociology* 93(5) — 117-country cross-national test. (Would likely be TIER 1 if read directly: peer-reviewed, large cross-national dataset — noted as a counterfactual only, per the tier convention's instruction not to write conditional tiers.)
- South (1988) — 111-country cross-national test, including the structural-power-as-moderator finding.
- Barber (2000, 2001, 2003, 2004) on teen pregnancy, divorce, violent crime.
- Lichter, Anderson & Hayward (1995) on women marrying higher-status men under high sex ratios.
- Uecker & Regnerus (2010), "Bare Market" — see GAPS below.
- The five book reviews listed above.

**GAPS (sources I could not reach, named barrier):**
1. **Guttentag & Secord (1983), *Too Many Women? The Sex Ratio Question*, the book itself.** Not reached. Google Books shows only a title/about page in search results; no full-text preview or scan surfaced. All claims about its contents in this dossier are filtered through Trent & South (2011) and Dollar (2014), both of whom quote with page citations but are themselves secondary readers of the book.
2. **Uecker & Regnerus (2010), "Bare Market," *The Sociological Quarterly* 51:408-435.** Barrier: paywalled at Wiley; the UNC Carolina Digital Repository landing page (https://cdr.lib.unc.edu/downloads/7w62fh63j) returned a bot-detection/navigation-only page to both WebFetch and a direct curl fetch (HTTP 200 but only a 19KB HTML shell, no PDF); the author's own site (markregnerus.com/peer-reviewed) is a JavaScript-rendered Wix site whose PDF links do not appear in the static HTML reachable by curl. This is the single most on-point source named in the assignment brief that I could not deliver primary text for.
3. **South & Trent (1988) and South (1988), *American Journal of Sociology*.** Barrier: paywalled at journals.uchicago.edu; not attempted further given time budget after two independent primary sources (Trent & South 2011, Dollar 2014) already converged on consistent characterizations of their findings.
4. **Secord (1983), "Imbalanced Sex Ratios," full text beyond the abstract.** Barrier: paywalled at Sage Journals.
5. **The five journal book reviews** (Canadian Journal of Sociology, Sociology, Contemporary Psychology, Signs, Social Science Journal, American Journal of Sociology review). Barrier: only WebSearch snippet fragments surfaced; did not attempt paywalled full-text retrieval given the two much stronger primary sources already secured.

**Note for the maintainer (LE Lab), prose only, no feedback file created:** if the Lab's canon mapper is later pointed at sex-ratio material, the (a)/(b)/(c) split in this claim is easy to conflate because most published abstracts use "bargaining power" or "dyadic power" loosely to cover all three readings at once — a shallow keyword match on "bargaining power" or "sex ratio" would not by itself distinguish an individual-value claim from a whole-market-norms claim from a structural-power claim. The clearest disambiguator found in this research pass was whether a source measures an *aggregate outcome* (marriage rate, divorce rate, premarital-sex incidence — (b)) versus a *named institutional/economic variable held constant or varying by sex* (labor-force participation as "structural power" — (c)) versus an *individual's own match quality or price* ((a)). None of that is a proposal to change canon or thresholds — just a flag about where this concept cluster is likely to be ambiguous if it comes up again.

<!-- END VERBATIM SCOUT BLOCK: S-G — C4 sex ratio and the dyadic/structural mechanism -->

## S-H — C9 budget-structured mate preferences — embedded verbatim

> Source file: `S-H-findings.md` · SHA-256 `cec99e30db2a6d36b18c1a9fb0ba7109dd35b8afda7209002888a8e774e94fcc`
> Concatenated by script, not retyped. Nothing below this line is orchestrator-authored.

<!-- BEGIN VERBATIM SCOUT BLOCK: S-H — C9 budget-structured mate preferences -->
# Cluster C9 -- Budget-structured mate preferences: evidence notes

Scope: claim under investigation is a three-part conjunction -- (a) necessities-gate/luxuries-add architecture, (b) sex differences shrink as budget grows, (c) unconstrained surveys overstate pickiness. Each bucket is evidenced separately below. All raw files are in this directory; capture.json gives exact URLs.

## (a) The gate/necessity-versus-luxury architecture exists

**Li, Bailey, Kenrick, & Linsenmeier (2002)** [raw-01.txt] is the origin of this architecture and reports it directly. Three studies (airport-intercept adults, n=71; ASU undergrads, n=178; ASU undergrads, n=58) using two independent methods (budget allocation and a mate-screening/first-inquiry paradigm) converge on: physical attractiveness is a necessity for men (F(1,69)=42.91, p<.001 in Study 1; F(1,176)=11.87, p<.001 in Study 2); intelligence and yearly income/resources are necessities for women (F(1,69)=37.95 and F(1,69)=13.98, p<.001, Study 1) and social level is a necessity for women in Study 2/3; kindness and intelligence emerge as necessities for both sexes; creativity and "special nonwork talents" are luxuries for both sexes. TIER 2 (single research program, no independent replication of the FULL necessity/luxury classification within one study, though see below for partial independent confirmation).

**Zhang, Wang, Lee, DeBruine & Jones (2019)** [raw-02.txt], an unaffiliated, preregistered Registered Report (Univ. of Glasgow + East China Normal University; no author overlap with Li et al.), independently replicates the core sex-difference half of the architecture: men allocate significantly more mate-dollars to physical attractiveness than women in both UK and Chinese samples (F(1,210)=21.09 / F(1,260)=20.28, both p<.001), and women allocate significantly more to social status than men in both samples (F(1,236)=12.01 / F(1,293)=68.63, both p<.001). This is a genuine independent replication of the sex-typed-necessity pattern. TIER 1 (peer-reviewed, preregistered, independently replicated across two new cultures by an unaffiliated team). IMPORTANT LIMIT: this study used a single fixed 100-mate-dollar budget per relationship-context condition -- it says nothing about budget SIZE and is evidence for (a) only, not (b).

**Marzoli, Moretto, Monti, Tocci, Roberts & Tommasi (2013)** [raw-03.txt], another unaffiliated group (Univ. "G. d'Annunzio," Italy + Univ. of Stirling, UK), used a Li-style fixed-budget (120-point) allocation task and found a MIXED result: it replicates men valuing attractiveness more than women, and the general trait hierarchy (intelligence/kindness/attractiveness above wealth/dominance/height), but explicitly reports "we failed to observe the often-reported sex difference according to which women more than men desire partners with economic resources" -- a partial non-replication of the classic resource-necessity finding for women, attributed by the authors to their scenario manipulation possibly masking baseline sex differences. TIER 2 as an independent single study (its scenario-manipulation design is not a clean replication attempt of Li et al.'s specific claims).

Net for (a): the sex-typed necessity pattern (attractiveness->men, status/resources->women) has genuine independent, preregistered replication (Zhang et al. 2019) and one partial non-replication of the resource-for-women half under a different manipulation (Marzoli et al. 2013). The full necessity/luxury taxonomy (including intelligence and kindness as universal necessities, creativity as a universal luxury) has NOT been independently re-tested in the sources found here -- that finer-grained part of (a) remains TIER 2, single-program.

## (b) Sex differences SHRINK as budget grows (the convergence half)

This claim is evidenced ONLY by the original Li et al. (2002) paper [raw-01.txt] in the sources located during this research pass. Verbatim, byte-level support:
- Study 1: "the sex differences on physical attractiveness and resources decreased as the budget increased" with Budget x Sex interactions significant for physical attractiveness, F(2,278)=12.06, p<.001, and yearly income, F(2,278)=9.77, p<.001.
- Study 2: "these differences decreased as budget increased," Budget x Sex interaction for physical attractiveness F(2,352)=8.03, p<.001 (social level and liveliness interactions did not survive Bonferroni correction).
- General Discussion: "As budgets increased, women's and men's preferences were more similar, as the sex differences in attractiveness and status diminished."

This is a real, correctly-attributed finding of the 2002 paper -- it is NOT a misremembering. But: **no independent replication of this specific within-subject low-to-high-budget convergence effect was found.** Both candidate independent replications in this research pass (Zhang et al. 2019 and the Marzoli et al. 2013 scenario study) used a SINGLE fixed budget and therefore could not and did not test convergence-with-budget-size. I also could not locate, within this pass, a Li-lab extension (e.g., Li & Kenrick 2006, Li, Valentine & Patel 2011, or the larger Thomas/Sulikowski/Li 2020 cross-cultural test -- the latter has Norman Li as a co-author, so it would be same-program in any case) that was reachable and read primary to re-verify the convergence effect beyond the 2002 paper itself.

TIER for (b): **TIER 2, single study, no independent replication located.** This is the most exposed part of the three-way claim. GAP: an independent, budget-size-varying replication of the convergence effect is the single most valuable thing a follow-up pass could add.

## (c) Unconstrained surveys overstate pickiness (the surveys-are-free inference)

Two distinct evidentiary strands, kept separate:

**Strand 1 -- Li et al. (2002) [raw-01.txt] itself makes this argument as theoretical motivation**, not as a separate empirical test: "Rating traits one at a time, unconstrained, may not reveal trade-offs normally made when people select mates... The implicit presumption of sufficiency may lead unconstrained judges to gloss over necessities and emphasize traits that may otherwise be luxuries." This is the paper's rationale for building the budget task in the first place, illustrated with the food/water/oxygen ranking-vs-essentiality analogy. It is NOT a within-study empirical comparison of the same people answering an unconstrained survey vs. a budget task and showing inflated pickiness -- Li et al. never ran that head-to-head comparison. TIER 3 as sourced for the specific "surveys inflate stated pickiness" MECHANISM -- it is asserted/argued, not measured, within this paper.

**Strand 2 -- Eastwick & Finkel (2008)** [raw-04.txt], canonical per the assignment, and its independent replication **Selterman, Chagnon & Mackinnon (2015)** [raw-05.txt] (part of the formal Reproducibility Project, unaffiliated authors, preregistered). These show stated ideal-partner preferences (unconstrained, hypothetical) carry sex differences of medium-large size (attractiveness d=.55, earning prospects d=.35, Eastwick & Finkel 2008) that VANISH or become non-significant when the same participants' actual romantic interest toward real speed-dating partners is measured (sex-difference r=.03-.05, all p>.4). Selterman et al. (2015) independently reproduced this pattern with a fresh sample (n=307) and near-identical effect sizes (r=.19 replication vs. r=.18 original for earning prospects), stating plainly: "we fully replicated the primary findings from the original... study." TIER 1 for the narrower claim "stated/hypothetical preferences diverge from preferences revealed in an actual choice context" (peer-reviewed original + independent preregistered replication).

CAUTION on strand 2: this is evidence that STATED preferences don't predict REVEALED behavior in a live dating context -- it is not a demonstration that unconstrained SURVEYS specifically overstate PICKINESS (i.e., inflate the stringency/selectivity of thresholds) relative to a budget-constrained purchase task. The mechanism in Li et al.'s "surveys are free" argument (zero marginal cost per rated trait, encouraging maximal endorsement of many traits) is conceptually adjacent to but distinct from Eastwick & Finkel's "cool state vs. hot state" / introspective-access mechanism (people don't know what will attract them until they meet someone). Both point toward "unconstrained self-report over-predicts real selectivity/behavior," but they are different mechanisms tested by different paradigms, and no source located here puts a budget-constrained task and an unconstrained rating-scale survey side-by-side on the same sample to isolate the "free" mechanism specifically.

Net for (c): the general claim "unconstrained/hypothetical preference reports don't match revealed choice behavior, and sex differences shrink or disappear when they do" is well evidenced (TIER 1, independently replicated) via the speed-dating literature. The SPECIFIC "surveys are free / zero-cost-per-trait inflates pickiness" causal story is Li et al.'s own argument for why they built the budget task, and is TIER 3 as sourced (asserted, not isolated and tested against a real unconstrained-survey comparison condition in any source found here).

## Program-concentration finding

Li, Bailey, Kenrick, and Linsenmeier (2002) are one research program (Li at Arizona State with Kenrick; Bailey and Linsenmeier at Northwestern, co-authors on the same paper). The subsequent Li-authored budget-allocation literature (Li & Kenrick 2006 short/long-term extension; Li, Valentine & Patel 2011 US-Singapore cross-cultural test; Thomas, Sulikowski, Li et al. 2020 East-West cross-cultural test, N=2,477) all retain Norman Li as an author and should NOT be treated as independent lineages even though I did not read them primary in this pass (see GAPS). Two genuinely independent, unaffiliated lineages were located and read primary: Zhang/Wang/Lee/DeBruine/Jones (2019, Glasgow/ECNU) and Marzoli/Moretto/Monti/Tocci/Roberts/Tommasi (2013, Chieti/Stirling) -- both cite Li et al. (2002) as the method's origin, both use a Li-style budget-allocation task, neither shares an author with the Li program. Separately, Eastwick & Finkel (2008, Northwestern) and its independent replicators Selterman/Chagnon/Mackinnon (2015, Maryland/Dalhousie) form a wholly distinct research lineage (speed-dating, not budget-allocation) that is not part of the Li/Kenrick program at all, though two Li-paper co-authors (Bailey, Linsenmeier) are thanked for comments on the Eastwick & Finkel manuscript -- collegial/institutional proximity (both at Northwestern), not shared authorship or method.

## GAPS

1. **No independent replication of the budget-SIZE convergence effect (bucket b) was located or read primary.** This is the single largest hole relative to the assignment's framing ("the convergence half is the one most often asserted and least often checked"). Candidates not reached in this pass: Li & Kenrick (2006, short-term/long-term budgets, same program); Li, Valentine & Patel (2011, US-Singapore, same program, single budget per the citing source in raw-02.txt so may not even test convergence); Thomas, Sulikowski, Li et al. (2020, largest cross-cultural test, N=2,477, same program -- unread, would be TIER 3 as sourced if cited without reading). No unaffiliated group's multi-budget-level replication was found via search in this pass.
2. **No source located that runs an unconstrained trait-rating survey and a budget-constrained task on the SAME sample and directly compares stated pickiness levels.** This would be the cleanest possible test of the "surveys are free" mechanism specifically (as opposed to the adjacent stated-vs-revealed-in-live-context literature used in strand 2 of bucket c).
3. Full text of Li & Kenrick (2006) and Li, Valentine & Patel (2011) was not fetched in this pass (time/scope-boxed to the assignment's explicit primary target plus independent-replication search) -- their claims as characterized by WebSearch summaries and by citing sources (e.g., raw-02.txt's characterization of the US-Singapore study) are TIER 3 as sourced and are NOT relied upon for any tiered claim above; they are mentioned only for the program-concentration finding.
4. Did not attempt academia.edu (403 Forbidden) or ResearchGate (typically login-walled) copies of Li et al. 2002; the Semantic Scholar PDF via jina.ai reader proxy was sufficient and is treated as the primary artifact.

## CONFIDENCE NOTES

- Bucket (a): MODERATE-HIGH. Core sex-typed-necessity pattern independently replicated (TIER 1: Zhang et al. 2019); one dimension (women/resources) partially failed to replicate under a different manipulation (Marzoli et al. 2013). The fuller necessity/luxury taxonomy (intelligence, kindness as universal necessities; creativity as universal luxury) rests on the original paper alone (TIER 2) within this research pass.
- Bucket (b): LOW-MODERATE. Real finding, correctly attributed, from a peer-reviewed paper with two internal studies showing the same convergence pattern (TIER 2, single program, no cross-lab replication located). Flag this explicitly to the maintainer as the weakest joint in the three-part claim.
- Bucket (c): the narrow stated-vs-revealed divergence is well evidenced (TIER 1, independently replicated via Eastwick & Finkel 2008 + Selterman et al. 2015); the specific "unconstrained surveys are free, hence overstate pickiness" causal mechanism as Li et al. frame it is TIER 3 as sourced -- argued, not isolated and measured against a real comparison condition in any source read here.
- All five raw sources were read primary via direct verbatim text extraction (curl + r.jina.ai reader, not an LLM-summarized WebFetch pass) and spot-checked against the raw extracted text with Grep before being cited (see raw-05.txt / Selterman et al. verification). No figure, sample size, or quote in this file was fabricated or estimated; anything not read primary is explicitly marked TIER 3 as sourced above.

<!-- END VERBATIM SCOUT BLOCK: S-H — C9 budget-structured mate preferences -->

## S-I-A — C12 educational assortative mating — embedded verbatim

> Source file: `S-I-A-findings.md` · SHA-256 `64fc2064a77fc1acfa8e603b3e705e6f46891702210039ee8148e7b1712067d1`
> Concatenated by script, not retyped. Nothing below this line is orchestrator-authored.

<!-- BEGIN VERBATIM SCOUT BLOCK: S-I-A — C12 educational assortative mating -->
# Evidence notes -- research cluster C12 (S-I-A)

## 1. Exact citation

Author list (confirmed, first author IS Hirschl, not Schwartz):
**Hirschl, Noah, Christine R. Schwartz, and Elia Boschetti.**
Title: "Eight Decades of Educational Assortative Mating: A Research Note."
Journal: *Demography*, Volume 61, Issue 5, pages 1293-1307.
Published: October 2024 (Duke University Press).
DOI: 10.1215/00703370-11558914.
Working-paper predecessor: CDE Working Paper No. 2022-01, Center for Demography and Ecology,
University of Wisconsin-Madison, draft dated 2023-02-24 (an earlier draft was presented at the
2022 Population Association of America meetings in Atlanta, per the paper's own acknowledgments).
Data source: U.S. decennial censuses 1940-2000 and the American Community Survey (ACS) 2001-2020,
via IPUMS (Ruggles et al. 2022), for different-sex married couples; ACS 2008-2020 for same-sex
couples (married and cohabiting). Sample restricted to couples where the wife (different-sex) or
householder (same-sex) is aged 18-40. N = 5,059,000 person/couple records across 936 cells per the
working paper's Appendix Table S2. Six education categories used (<10 yrs, 10-11, 12/HS grad,
13-15/some college or associate's, 16/bachelor's, 17+/graduate degree) -- a finer split than
Schwartz and Mare's original categories, notably separating bachelor's from graduate degrees.

Confirmed the recorded "Schwartz et al." attribution was wrong: Hirschl is first author on both the
working paper and the published Demography article. Note the paper's own dedication: "This article
is dedicated to Robert Mare and is indebted to his intellectual legacy" -- Mare was Schwartz's
1991/2005 coauthor and died before this update was published.

## 2. Hypergamy reversal vs. homogamy -- separate trends, and do they move independently?

Yes -- the paper treats these as two distinct, separately-modeled quantities, and its central
finding is precisely that they diverged for decades before homogamy's own trend flipped:

- **Homogamy** = spouses in the *same* education category (like marries like). The paper's headline
  metric is the *odds of homogamy relative to hypergamy* from log-linear models.
- **Hypergamy/hypogamy** = the *direction* of difference when spouses are NOT in the same category
  (husband more educated = hypergamy; wife more educated = hypogamy). This is a second, separately
  estimated parameter in their model, added on top of the homogamy parameter.

Their own words (working paper): "Both the odds of hypogamy (Panel A) and homogamy (Panel B)
relative to hypergamy increased between 1970 and about 2010. Thus, if the odds of hypogamy had not
increased, the odds of homogamy would have continued to increase until at least the 2010s rather
than stabilizing around 1990 as observed." This is an explicit statement that the two trends were
moving in ways that could be decomposed and that acted as counterweights on each other -- rising
hypogamy is what capped homogamy's rise, and the paper's appendix table (percent homogamous vs.
percent hypogamous-given-heterogamy, by year, 1940-2020) shows them tracking in opposite directions
after 1990 (percent homogamous drifts down from 47.2% in 2000 to 44.5% in 2020, while percent
hypogamous-given-heterogamy climbs from 51.1% to 61.9% over the same span). So yes: the paper
directly supports that hypergamy reversal (rise of hypogamy) and homogamy stall/decline are distinct
trends that can and did move independently -- indeed the whole "research note" is built on
decomposing exactly that interaction.

## 3. Does it support an inflection point around 1990, and for which trend?

Yes, explicitly, and specifically for **homogamy**, not primarily for hypergamy. Their own summary
sentence: "The main finding is that trends in homogamy stopped increasing in 1990 and have declined
primarily because of the increasing odds that wives have more education than their husbands."
Elsewhere: "the odds of educational homogamy among U.S. different-sex married couples held steady
at around 4 to 1 beginning around 1990 and declined somewhat since the early 2000s." The hypogamy
(hypergamy-reversal) trend itself is described as a longer, more continuous rise "between 1970 and
about 2010" with a "slight resurgence of hypergamy... since the 2010s" -- i.e., hypogamy's own rise
does not have a clean 1990 kink in this paper; 1990 is the year the *homogamy* curve went flat.

## 4. Relationship to Esteve et al. (2016) -- refinement, correction, or contradiction?

**Refinement/extension, not a correction or contradiction.** Hirschl et al. (2024) cite Esteve et
al. (2016) directly and use its finding as a premise, not a target of correction: "The increasing
tendency for women to marry less educated men (hypogamy) has occurred around the world (Esteve et
al., 2016) and may be an important component of the stagnation and decline in homogamy in recent
decades." Esteve et al. (2016), read in full (see capture.json note), is exclusively about the
hypergamy/hypogamy *direction* metric -- "educational hypergamy: the pattern in which husbands have
more education than their wives" -- across 120 countries, 1960-2011 (US included as one of six
example countries: "Argentina, France, Indonesia, Kenya, South Korea, and the United States"). It
never discusses homogamy (like-marries-like) as a separate construct at all; its entire analytic
frame is the direction of the education gap within couples, not whether the couple is matched.
Hirschl et al. take that established global hypogamy-rising finding as a given and use it as the
*mechanism* to explain a different, US-specific outcome (the stalling and later decline of
homogamy) that Esteve et al. never addressed. There is no numeric or directional conflict between
the two papers anywhere I found -- Hirschl et al.'s own hypogamy series (rising from 1970, especially
post-1990) is consistent with, not contradictory to, Esteve et al.'s global hypogamy-rising story.
**Practical implication for the site:** a page that already correctly states the hypergamy-reversal
claim sourced to Esteve (2016) is not wrong and does not need correcting; it is incomplete only in
that it doesn't yet separately name the homogamy metric and its own distinct 1990-stall/2000s-
reversal timeline, which is Hirschl et al.'s (2024) contribution, not Esteve's.

## 5. Does the 1990 inflection come from this paper or from Schwartz & Mare (2005)?

**It belongs to Hirschl et al. (2024), not to Schwartz and Mare (2005), with one nuance.**
Schwartz and Mare's (2005) own abstract (read secondhand -- see Confidence notes) describes
educational homogamy as decreasing 1940-1960, then *increasing* 1960-2003, with no stall or
reversal mentioned -- consistent with their data window ending in 2003, too early to observe a
stall that (per Hirschl et al.) only becomes visible with data extended to 2020. Schwartz and Mare
could not have identified a "stall around 1990" as their own headline finding because their
published trend runs to 2003 and is described as a continued rise across that whole span.
However, Hirschl et al.'s own working paper contains a footnote conceding the underlying data
pattern was already latent in Schwartz and Mare's figures: "The stability in homogamy from 1990 to
2003 is also evident in Schwartz and Mare (2005: Figure 4)." So: the raw stability from 1990-2003
was visible, in hindsight, inside SM (2005)'s own plotted data, but SM (2005) did not frame it as a
stall/turning point in their own analysis or abstract -- that interpretation, the "1990 inflection"
as a named finding, and the subsequent 2000s reversal, is original to Hirschl, Schwartz, and
Boschetti (2024), who had 17 more years of data (through 2020) making the turning point
identifiable as real rather than noise.

## 6. Working paper vs. published version -- any difference found?

**I read the working paper (CDE WP 2022-01, Feb 2023 draft) in full; I could not reach the full text
of the published Demography version to compare body text.** The Duke University Press HTML page and
the direct Duke UP PDF link both returned HTTP 403 Forbidden to every fetch method tried. The one
point of direct comparison available -- the abstract -- matches exactly: the abstract text pulled
from the CDE working-paper landing page (cde.wisc.edu/wp-2022-01/) and the abstract text quoted by a
secondary source describing the published version (schoolinfosystem.org's summary post) are
word-for-word identical to the abstract inside the working-paper PDF itself (all three end on
"...and began reversing in the 2000s" / "...among same- versus different-sex couples" with identical
phrasing throughout). No claim in this note is drawn from anywhere but the working-paper PDF's full
text, so every finding above should be read as sourced to the **2023 working-paper draft**, with the
abstract only corroborated (not the body/results/conclusion) against the published version.

---

## CONFIDENCE NOTES

**Read primary (full text):**
- Hirschl, Schwartz, and Boschetti, CDE Working Paper No. 2022-01 (2023 draft) -- full text read via
  r.jina.ai text-extraction proxy of https://cde.wisc.edu/wp-content/uploads/sites/278/2023/02/cde-working-paper-2022-01-1.pdf.
  **TIER 1** as read (large-n administrative/probability-sample design, N=5,059,000; peer-reviewed
  published version exists; core "stability 1990-2003" pattern independently corroborated in
  Schwartz and Mare's own 2005 Figure 4 per the paper's footnote 5).
- Esteve, Schwartz, Van Bavel, Permanyer, Klesment, and Garcia-Roman (2016), "The End of Hypergamy:
  Global Trends and Implications," *Population and Development Review* 42(4):615-625 -- full text
  read via the same r.jina.ai proxy technique against https://ced.cat/wp-content/uploads/2016/12/Population_Development_Review_2016_A.Esteve_et-al.pdf.
  **TIER 1** as read (large-n probability/census-survey design: 120 countries, 1960-2011, >0.5
  billion person-records, 89% of world population).

**Read secondhand only (not primary):**
- Schwartz, C.R. and Mare, R.D. (2005), "Trends in educational assortative marriage from 1940 to
  2003," *Demography* 42:621-646, DOI 10.1353/dem.2005.0036. Full text attempt via Springer/Project
  MUSE (https://link.springer.com/article/10.1353/dem.2005.0036) returned only the paywalled
  reference list, no abstract or body. Abstract text obtained only via a PubMed page rendering
  (https://pubmed.ncbi.nlm.nih.gov/16463914/) processed through WebFetch's summarizing layer rather
  than raw extracted text -- this is a step removed from a guaranteed byte-verbatim capture, though
  the quoted abstract text is internally consistent with how the finding is described in every other
  source consulted (Hirschl et al.'s own framing of "SM," WebSearch snippets, etc.).
  **TIER 3 as sourced.** Counterfactual: if read primary, this would likely rate TIER 1 (it is the
  foundational, heavily-cited paper in this literature and its core finding has since been directly
  re-tested and partly corroborated by Hirschl et al. 2024's re-analysis on an extended series) --
  but that is a counterfactual, not the rating actually assigned.
- Published Demography version of Hirschl, Schwartz, and Boschetti (2024), 61(5):1293-1307 -- body/
  results/discussion text NOT read (403 Forbidden from Duke University Press on both the HTML
  article page and the direct article-PDF link, tried via both plain WebFetch and the r.jina.ai
  proxy pattern used successfully elsewhere in this task). Only the abstract was corroborated
  (matches the working-paper abstract verbatim, per point 6 above). **TIER 3 as sourced** for any
  claim that would depend specifically on the *published* text differing from the working paper
  (no such claim is made in this note); the substantive findings reported above are instead sourced
  to the working paper, which was read primary and rates TIER 1 as noted.

**Gaps (barrier named):**
- Duke University Press (read.dukeupress.edu) -- HTTP 403 Forbidden on both the article HTML page
  and the article-PDF direct link, with and without the r.jina.ai proxy. Barrier: paywall/access
  gate blocking non-subscriber automated fetches. Not resolved.
- Springer/Project MUSE hosting of Schwartz and Mare (2005) -- page loads but returns only the
  reference list to automated extraction; abstract and body are paywalled. Barrier: paywall.
  Not resolved.
- Wiley Online Library page for Esteve et al. (2016) abstract -- returned HTTP 402 Payment Required
  when fetched directly (worked around by using the open-access CED/UAB-hosted PDF mirror instead,
  which is the authors' own institutional repository copy and was fetchable in full).

No figures, sample sizes, dates, author lists, volume/page numbers, or DOIs in this note were
guessed; all are traceable to a URL recorded in capture.json or flagged above as secondhand/gap.

<!-- END VERBATIM SCOUT BLOCK: S-I-A — C12 educational assortative mating -->

## S-I-B — C1d the suffocation model — embedded verbatim

> Source file: `S-I-B-findings.md` · SHA-256 `8e6ddd63e16f4c124025ef4550786487476c081233fdcc0e196c0beb20745387`
> Concatenated by script, not retyped. Nothing below this line is orchestrator-authored.

<!-- BEGIN VERBATIM SCOUT BLOCK: S-I-B — C1d the suffocation model -->
# S-I-B — research cluster C1d: the suffocation model

Scout: Claude Opus 5, reasoning effort high. Batch 3. Data only; no recommendations.

Sources read PRIMARY and in full (extracted locally with pdftotext):
- **TA** = Finkel, Hui, Carswell & Larson (2014), *Psychological Inquiry* 25(1):1–41, labeled TARGET ARTICLE. 31,508 words extracted.
- **REPLY** = Finkel, Larson, Carswell & Hui (2014), "Marriage at the Summit: Response to the Commentaries," *Psychological Inquiry* 25:120–145. 20,644 words extracted.
- **PRÉCIS** = Finkel, Cheung, Emery, Carswell & Larson (2015), "The Suffocation Model: Why Marriage in America Is Becoming an All-or-Nothing Institution," *Current Directions in Psychological Science* 24(3):238–244. 3,986 words extracted.
- **GFG** = Genadek, Flood & Garcia Roman (2015), "Trends in Spouses' Shared Time in the United States, 1965–2012," Minnesota Population Center WP 2015-2. 8,328 words extracted. (Peer-reviewed version: *Demography* 2016, DOI 10.1007/s13524-016-0512-8 — **not read**.)

NOT read: the 13 commentaries themselves (paywalled), McNulty (2016), Dew (2009), Amato et al. (2009), Ramey & Ramey (2010), Marquardt et al. (2012), Proulx et al. (2007), Martin (2006), and Finkel's 2017 trade book *The All-or-Nothing Marriage*. Everything attributed to them below is **TIER 3 as sourced**.

---

## 1. What the model actually claims, decomposed into the three components

**(i) Demand concentration onto the spouse.** This is *not* the claim the phrase suggests, and the TA is explicit about it. The TA rejects what it calls the "freighted marriage" view — that Americans simply ask more of marriage than before — and it tabulates that view as other people's (a table of illustrative quotes from Gilbert, de Botton, Gillis, DePaulo, Druckerman, Perel). Its own claim is an **Altitude × Time interaction**: Americans ask *less* of marriage at the physiological/safety levels and *more* at the esteem/self-actualization levels, with the total surface area of the "marital dependence zone" roughly stable over time. So the model's demand claim is about a change in the *kind* of demand, not the *quantity*. A second, separable sub-claim (Tenet 1) is that the spouse has become the default provider as access to non-spousal significant others declined.

**(ii) Investment failing to rise.** The TA's claim is stronger than "failed to rise": Tenet 4 says investment of time and psychological resources **fell**, on average, at the same time as the altitude rose. Two currencies: clock time alone with the spouse, and what the PRÉCIS calls bandwidth — cognitive/psychological resources, argued to have shrunk because Americans are more stressed, more information-loaded, more interrupted.

**(iii) Variance widening.** In the TA this half **barely exists**. It appears twice, both times as a subordinate clause: one clause in the abstract (some spouses do invest enough and reap the benefits; most do not) and the parenthetical at the end of Tenet 5. The TA's own Consequences section opens by explicitly bracketing dispersion and studying **normative effects across marriages rather than variation in marital quality**, and its outcome evidence is entirely mean-level. The variance-widening half is foregrounded only *later*: in the REPLY ("the best marriages are better than ever while the majority of marriages are struggling") and in the 2015 PRÉCIS, whose subtitle is the all-or-nothing framing. The REPLY generates it from two tenets that it marks as **not present in the target article** — an *altitude multiplier for satisfaction* tenet (satisfaction = oxygenation weighted by altitude, because high altitudes carry intense rewards) and a *loss aversion* tenet (each unit of oxygen deficiency costs more satisfaction than each unit of surplus adds, leaning on Baumeister et al. 2001). Multiplier + asymmetry ⇒ both tails stretch ⇒ dispersion widens. That is the mechanism, and it was introduced after peer commentary.

---

## 2. MEASURED or ASSERTED — per component

### (i) Demand concentration — **ASSERTED** for the load-bearing part; measured only at the periphery. TIER 3.
- The altitude shift is established by historical/sociological synthesis (Burgess & Locke 1945; Cherlin 2009; Coontz 2005) plus cultural exhibits: a 1939 Eleanor Roosevelt magazine interview, a *Sex and the City* line, a table of quotes from public intellectuals. **No measurement of the altitude of marital expectations over time appears anywhere in the TA.**
- The authors concede the measurement does not exist. The REPLY calls Mount Maslow, the dependence zones and the centroid metaphors or approximations rather than arithmetic, on the stated ground that the literature does not permit precision. That is an author-side admission that (i) is not currently measurable, let alone measured.
- Measured periphery: the decline in time with non-spousal significant others (parents, siblings, neighbours, friends) is drawn from survey data via a reproduced figure — secondary, not read. TIER 3 as sourced.
- Counter-relevant and cited by Finkel himself: Trail & Karney (2012) found Americans across four income bands rate the same 11 marital characteristics as almost identically important. That is a cross-sectional null on *variation in the content of expectations*, not a time trend, and it does not test the historical shift either way.

### (ii) Investment — **MEASURED for clock time (secondary data, contested and baseline-dependent); ASSERTED for bandwidth.** TIER 3 as sourced for the underlying studies.
Evidence the TA actually presents:
- **Spousal time**, from Dew (2009), *Social Forces* 88:519–541, comparing 1975 and 2003 time diaries. TA Figure 9 (hours per day alone with spouse): no children at home 4.44 → 3.10 weekday (−30%), 6.55 → 5.44 weekend (−17%); children at home 1.92 → 1.16 weekday (−40%), 1.72 → 1.80 weekend (+5%, which the TA calls anomalous). The PRÉCIS restates this as 35 → 26 hours/week for childless spouses and 13 → 9 hours/week for parents.
- **Joint activities**, from Amato et al. (2009), 1980 vs 2000: −15% almost always eating the main meal together, −29% leisure out together, −36% visiting friends together, −21% housework together; shared friends 76% → 69%.
- **Childrearing time up**, from Ramey & Ramey (2010): 1993–2008, college-educated fathers 4.2 → 9.7 hr/wk, less-educated fathers 3.8 → 8.0, college-educated mothers 12.0 → 20.5, less-educated mothers 10.5 → 16.0. Also, spouses without children at home spent 26 more minutes/day in paid work in 2003 than 1975 (Dew 2009).
- **Bandwidth**: Cohen & Janicki-Deverts (2012) perceived-stress comparisons across 1983 / 2006 / 2009, plus information overload and multitasking citations (one of them a trade book).

Verdict detail:
- The clock-time half **is** grounded in real time-diary data, so it is measured — but every number is secondary, and none of it was collected to test this model.
- The bandwidth half is an **inference chain**, not a measurement: stress depletes self-regulatory resources → Americans are more stressed → therefore less psychological investment in the marriage. Nobody measured psychological investment in marriage over historical time. **ASSERTED.**
- **The clock-time finding does not survive a longer, harmonized series.** GFG, using American Heritage Time Use Survey data 1965–2012, find couples without children spend **more** total time together and **more** time alone together now than in 1965, with both series **peaking in 1975**; parents' time together rose continuously, most sharply for time with spouse *and* children; a decomposition attributes the change to behaviour rather than demographic composition, with the increases concentrated in leisure. Their explicit numbers: non-parents lost **11 minutes/day** of alone-together time between 1975 and 2012 but **gained 53 minutes/day** between 1965 and 2012; parents **neither gained nor lost** alone-together time 1965→2012, and gained roughly **an hour a day** of total spouse time. GFG also state in a footnote that prior research — naming Dew (2009) — did not account for measurement variation across surveys, so over-time differences in shared spousal time are **overestimated**. **TIER 2** (single study, read primary as a working paper; the peer-reviewed *Demography* version not read).
- Arithmetic note, my own comparison of two published sets of figures, not either author's claim: Dew-via-Finkel implies roughly 1.3 fewer hours of weekday alone-time per day for non-parents 1975→2003; the harmonized series puts the 1975→2012 change at 11 minutes/day. An order-of-magnitude gap, in the direction GFG's harmonization footnote predicts.
- Internal tension inside the TA on this component: it reports childrearing time roughly doubling for all four parent groups 1993–2008, and counts that purely as a subtraction from marital oxygen. Whether time invested in shared children is investment in the marital project is treated as settled and is not argued. **ASSERTED.**

### (iii) Variance widening — **ASSERTED. Never measured, in any of the three Finkel sources read.** TIER 3.
- The TA contains **no dispersion statistic of any kind**. It does not report a variance, standard deviation, interquartile range, tail share, or distributional test for marital quality over time. Its outcome evidence is means: percentage "very happy" 1973–2010 down 9 points for men and 8 for women (Marquardt et al. 2012), with the TA itself conceding the trend is not significant in every study and naming Amato et al. (2009) as a case where it is not.
- The TA's own repair for that weak mean trend **cuts against** a dispersion claim rather than supporting it: it argues the real decline is steeper because divorce removes unhappy marriages from the married sample (13% of ever-married adults divorced/separated in 1980 vs 19% in 2000). Differential selection out of the sample **compresses the observed lower tail** — so any measured widening would be attenuated by the very artifact invoked to rescue the mean.
- The upper tail ("the best marriages are better than ever") rests, in the PRÉCIS, on: a quotation from Maslow about higher-need gratification producing more profound happiness; cross-national/affluence well-being correlates (Howell & Howell 2008; Oishi et al. 1999; Tay & Diener 2011); and Proulx, Helms & Buehler (2007), a meta-analysis showing the marital-quality ↔ well-being association has **strengthened** over time.
- **Logical gap worth naming: a strengthening correlation is not a widening dispersion.** Proulx et al. is about the coupling of two variables, not the spread of either. Marital quality could have constant variance while its correlation with well-being rises. The strongest empirical citation behind the variance half therefore does not measure the variance half.
- The nearest measured dispersion in the Finkel corpus is **between** sociodemographic groups, not within the married population: growing SES gaps in marital outcomes (attributed to Martin 2006 on education differentials in marital dissolution) and rising income concentration (CBO 2011: top-1% income share roughly doubled 1979–2007). That is dispersion in *divorce risk across education groups*, a different quantity from dispersion in *marital quality*. Both citations unread → TIER 3 as sourced.

---

## 3. What kind of article the 2014 piece is, and what the commentaries dispute

**It is a target article, and says so on page 1.** *Psychological Inquiry* 25(1) is the standard target-article issue: TA pp. 1–41, then **13 commentaries by 22 authors** (the REPLY states both counts) at pp. 42–119, then the authors' REPLY pp. 120–145. The TA **reports no new data**: every figure in it is adapted from someone else's published analysis (Ramey & Ramey; Dew; Amato et al.; Liu & Umberson; Cohen & Janicki-Deverts; Marquardt et al.). Under the tier convention this makes the TA **TIER 3 for every empirical claim in it, even though I read it in full.**

Commentary roster (from the Crossref record for the issue, one entry cross-checked against Semantic Scholar; page ranges carry the caveat in CONFIDENCE NOTES):

| pp. | authors | title |
|---|---|---|
| 42–46 | Amato | Tradition, Commitment, and Individualism in American Marriages |
| 47–52 | Aron & Aron | Climbing Diotima's Mountain: Marriage and Achieving Our Highest Goals |
| 53–55 | Baumeister & MacKenzie | The Value of Marriage in the Era of the Glorified Self |
| 56–63 | Conley & Moors | More Oxygen Please!: How Polyamorous Relationship Strategies Might Oxygenate Marriage |
| 64–68 | DePaulo | A Singles Studies Perspective on Mount Marriage |
| 69–79 | Feeney & Collins | Much "I Do" About Nothing? Ascending Mount Maslow With an Oxygenated Marriage |
| 80–83 | Holmes & Murray | A Steep Hill to Climb: Reconciling the Expanding Demands of Marriage |
| 84–87 | Karney | On The Benefits and Challenges of Expecting Personal Fulfillment From Marriage |
| 88–94 | Light & Fitzsimons | Contextualizing Marriage as a Means and a Goal |
| 95–100 | Neff & Morgan | The Rising Expectations of Marriage: What We Do and Do Not Know |
| 101–107 | Patrick | Ascending Mount Maslow With Oxygen to Spare: A Self-Determination Theory Perspective |
| 108–113 | Pietromonaco & Perry-Jenkins | Marriage in Whose America? What the Suffocation Model Misses |
| 114–119 | vanDellen & Campbell | Climbing Mount Me |

**What is disputed** (from the REPLY, read primary — so this is Finkel's rendering of the criticism, not the commentaries' own text):
- The REPLY names its strongest objectors as **Collins, Feeney, Karney and Pietromonaco** — i.e. mainstream relationship scientists, Finkel's own in-group — and organises its response around **three areas of significant disagreement**.
- **(a) Sociodemographic variation.** Pietromonaco & Perry-Jenkins argue the model marginalises gender, class, race/ethnicity and life course, and that no theory of marital needs can average across those groups. Feeney & Collins call the absence of social class from the model's core a critical oversight, given class's role in predicting marital outcomes. Finkel answers that the model is not a model of within-era sociodemographic variation, and that poverty acts through oxygenation.
- **(b) The investment-requirement tenet — this one hits component (ii) directly.** Feeney & Collins dispute Tenet 3, arguing that many behaviours that promote a partner's thriving are simple to enact (encouragement, not interfering, celebrating successes). Finkel's answer is partly a **concession about wording**: he says a more precise version of the abstract's sentence would drop "typically requires" in favour of a claim that bond strength and mutual insight are strongly *associated* with higher-need fulfilment. That downgrade matters — the demand/investment mismatch needs high-altitude support to be genuinely investment-hungry, not merely correlated with insight. Finkel also reports Feeney & Collins as saying the model presupposes a looming crisis in modern marriage, and answers that there is no crisis, only an institution not flourishing on average.
- **(c) Micro vs macro, and blame.** Karney argues the model excessively blames individual couples for insufficient oxygenation; Finkel answers that Karney over-attributes to societal factors and strips couples of agency. Karney separately disputes the "marriage no longer serves lower needs" claim, noting that continuously married people accumulate significantly more wealth by retirement and that married people live significantly longer.
- **On the variance claim specifically: I found no commentary that disputes it, and the structural reason is that the TA had barely asserted it.** The commentators were responding to a mean-level argument. The all-or-nothing/dispersion framing was consolidated in the REPLY and the 2015 PRÉCIS — i.e. *after* the commentary round. **The half of the model with actual predictive content is also the half that never passed through the peer-commentary gauntlet.** Whether any commentary nonetheless touched it is UNVERIFIED, since I read none of them.
- The commentary whose title most directly targets the evidence base — Neff & Morgan, "The Rising Expectations of Marriage: What We Do and Do Not Know" — is **a GAP**. Paywalled at Taylor & Francis; the only free copy located was on a third-party paper-mirror site, which I declined to download. Contents UNVERIFIED. TIER 3 as sourced.

---

## 4. Has anyone tested the model empirically — especially variance widening?

**Variance widening: no test found.** Nothing surfaced that measures the dispersion of marital quality over historical time — no variance-trend, tail-share, quantile-trend or distributional-test study, either supporting or refuting the prediction. Searches run: WebSearch on the suffocation model paired with variance/dispersion/all-or-nothing/test/replication; WebSearch on trends in the distribution and polarization of marital happiness; OpenAlex full-text search on "suffocation model" + marriage (25 results returned, reviewed by title/venue). The TA has ~297 citations per OpenAlex and the PRÉCIS ~78; I did not enumerate the citing literature paper by paper, so **absence here is a search result, not a proof of non-existence.** Recorded as a **GAP**.

Partial tests of *other* tenets that did surface (all **TIER 3 as sourced** — none read primary):
- **McNulty (2016), "Should Spouses Be Demanding Less From Marriage? A Contextual Perspective on the Implications of Interpersonal Standards," *PSPB* 42(4):444–457, DOI 10.1177/0146167216634050.** A 4-year longitudinal newlywed study framed against suffocation-model predictions, reported as finding that the effect of high standards depends on the severity of the couple's problems. Paywalled; Semantic Scholar reports the abstract elided and no OA PDF. This targets Tenet 6's prescription (ask less), not the variance prediction.
- **"Measuring dynamic goals for marriage: Development and validation of the Marital Goal Scale using Rasch modeling," *Psychological Assessment* (2019), DOI 10.1037/pas0000779.** A measurement instrument for the goal/altitude construct. Not read. Worth noting on its own: an instrument for the altitude construct was still being developed and validated five years after the model was published, which is consistent with component (i) having been unmeasured at the time the model was asserted.
- A student-journal content analysis of romantic relationships in films across the companionate vs self-expressive eras (*Modern Psychological Studies*). Content analysis of movies; not a test of demand, investment, or outcome dispersion.
- Finkel's own downstream empirical work cited in the PRÉCIS is intervention work (a 21-minute reappraisal writing task; date nights; portfolio-of-relationships work) — tests of the remedies, not of the three components.

---

## 5. Does the investment claim rest on time-use data, and does that data show what's claimed?

**Yes on the first, no on the second.**

- **Yes, it rests on time-use data.** The load-bearing citation is Dew (2009), a 1975-vs-2003 comparison described in secondary summaries as using nationally representative time-diary data; it supplies TA Figure 9 and the PRÉCIS's 35→26 and 13→9 hours-per-week figures. Ramey & Ramey (2010) supplies the childcare-time diaries. Amato et al. (2009) supplies survey items on joint activities (not diaries).
- **The article does not name the American Time Use Survey.** A grep of the full extracted TA text for "Time Use", "ATUS" and "time diar" returned no hits; the only Bureau of Labor Statistics citation is for women's labour-force participation. Whether Dew's 2003 wave *is* the ATUS is **UNVERIFIED** — I did not read Dew (2009) primary.
- **No, the harmonized long series does not show spousal-time investment falling.** GFG (details in §2(ii)) find more total time together and more alone-together time in 2012 than in 1965 for non-parents, no change in alone-together time for parents, about an hour a day more total spouse time for parents — and **both series peaking in 1975**, the exact year Finkel's comparison uses as its baseline. GFG further state that prior research including Dew (2009) did not harmonise measurement across surveys, so over-time declines in shared spousal time are overestimated.
- **So the investment claim is endpoint-sensitive.** Measured from 1975 it is a decline; measured from 1965 it reverses for total time and, for non-parents' alone-together time, reverses into a large increase. The TA does not disclose that 1975 is a peak, and does not report the pre-1975 series at all.
- One further wrinkle in Finkel's favour, for completeness: GFG note the increases are concentrated in **leisure and television**, and that parents spend a smaller *share* of their shared time alone with each other. A model that cared about the quality rather than quantity of shared time could survive GFG. But that is not the claim Tenet 4 makes — Tenet 4 is about the quantity of time and psychological resources, and the quantity claim is the one that fails on the longer series.

---

## Note for the LE Lab (prose only, no proposals)

One possible miscorrelation risk, flagged for humans, not as a change request: the website's premise sentence (as described in my assignment) uses none of the model's distinctive vocabulary — no *Mount Maslow*, *oxygenation*, *altitude*, *marital dependence zone*, *self-expressive era*, *suffocation*. A canon mapper keyed on those tokens will not fire on the site's paraphrase, while a mapper keyed on generic strings like "concentrat*" near "institution*" would fire on much unrelated text. Also worth a human's attention: "suffocation model" and "all-or-nothing marriage" are the same model under two names, introduced a year apart, and the second name is where the variance claim lives — any canon entry keyed to only one name will miss half the corpus.

---

## CONFIDENCE NOTES

- **High confidence**: that the 2014 piece is a labeled target article in a target-article issue with 13 commentaries and an authors' reply; that the TA presents no original data; that the TA contains no dispersion measure and explicitly brackets variation in favour of normative/mean effects; that the variance-widening half was consolidated after the commentary round via two tenets the REPLY marks as new; that the investment claim's clock-time evidence is Dew (2009) 1975-vs-2003 plus Amato et al. (2009) 1980-vs-2000. All four sources behind these statements were read in full.
- **High confidence, single-source**: the GFG counter-findings and the harmonization critique of Dew (2009). Read primary, but it is one research group's working paper; the peer-reviewed *Demography* version was not read, so I cannot confirm the published numbers are identical to the working paper's.
- **UNVERIFIED — commentary page ranges.** The Crossref/Semantic Scholar page assignments and the REPLY's in-text page citations do not reconcile for at least two records: the REPLY cites Feeney & Collins at pp. 107 and 109 (Crossref and Semantic Scholar both give 69–79) and Pietromonaco & Perry-Jenkins at pp. 53–54 (Crossref gives 108–113), while Light & Fitzsimons at p. 92 does fall inside Crossref's 88–94. Either Crossref's page assignment is shuffled across some records in this issue or the REPLY cites proof-stage pagination. Titles and author pairings are consistent across the two independent APIs and are reported with confidence; **treat page ranges as provisional.**
- **UNVERIFIED — commentary contents.** Everything in §3 about what the commentators argued is Finkel's characterisation of them in the REPLY, including the short phrases he quotes. I read none of the 13 commentaries. A commentator's actual argument may be stronger or differently aimed than the reply's rendering of it, and a reply is a self-interested summary of its critics.
- **GAP — Neff & Morgan (pp. 95–100).** The commentary most likely to bear directly on the evidentiary status of the demand claim. Barrier: Taylor & Francis paywall; the sole free copy located was on a third-party paper-mirror host and was not downloaded.
- **GAP — Dew (2009) primary.** Barrier: not pursued to full text. Consequence: whether the 2003 wave is the ATUS, the exact sample sizes, and the exact measure definition are all unverified, and the harmonization critique therefore cannot be adjudicated from primary sources on both sides.
- **GAP — no dispersion-over-time test located.** Barrier: search coverage, not paywall. I did not enumerate the ~297 works citing the TA. Absence of a test in these searches is reported as absence of a located test.
- **GAP — the 2017 trade book.** Not retrieved, per assignment instruction to prefer the article. Its specific claims and citations are unknown to this scout; the all-or-nothing framing was verified from the 2015 peer-reviewed précis instead, which is the stronger artifact anyway.
- **Not double-counted**: the coherence of the model is not treated anywhere above as evidence for its components, and the TA's and PRÉCIS's own summary sentences are not counted as independent support for the claims they summarise.

<!-- END VERBATIM SCOUT BLOCK: S-I-B — C1d the suffocation model -->
