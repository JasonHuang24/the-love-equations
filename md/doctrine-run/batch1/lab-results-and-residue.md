# Batch 1 — Lab measurement and research-queue residue

Instrument: analyzer **2.6.1**, analysis schema `le-lab.analysis/2.6`, research-queue schema
`le-lab.research-queue/2.1`, scoring config `bt0a7p`, canon `1.0.0+949aef381d5f`. Frozen for the run.
No Lab file was modified.

**Every mapped-share figure on this page is PROVISIONAL.** The analyzer's thresholds were authored by
judgment and have never been fitted to labelled data; each export records `coverage.provisional =
true` with reason `thresholds uncalibrated`. These are document-coverage measurements — not
population statistics, not factual accuracy, and not evidence that any claim is true.

## The six sources

| # | Source | Grade | Words | Claim-like | Mapped | Share | Queue | Set aside |
|---|---|---|---|---|---|---|---|---|
| 05 | Kim, Capaldi & Crosby 2007 | A | 9,249 | 159 | 6 | 3.8% | 153 | 187 |
| 06 | Heyman & Slep 2001 | A | 3,484 | 46 | 0 | 0% | 46 | 96 |
| 07 | van Lankveld et al. 2021 | A | 6,642 | 170 | 12 | 7.1% | 158 | 136 |
| 08 | McNulty, Wenner & Fisher 2016 | A | 8,332 | 141 | 20 | 14.2% | 121 | 143 |
| 09 | Conroy-Beam, Goetz & Buss 2016 | B | 7,376 | 262 | 32 | 12.2% | 230 | 210 |
| 10 | Miller 2007 | B | 5,763 | 108 | 7 | 6.5% | 101 | 185 |
| | **Total** | | **40,846** | **886** | **77** | — | **809** | **957** |

Two of the six are methodological rather than substantive papers. Source 06 mapping at **0%** is the
domain gate behaving correctly on a statistics-methods paper, not a retrieval miss — the same reading
the run-01 corpus needed for its own 0% sources.

Source 08 at 14.2% is the highest mapped share of the batch, which is consistent with its subject
matter: sexual and relationship satisfaction over time is territory the canon already covers in the
Statistics roster.

## The residue — 809 unmapped claim-like segments

Research-queue residue is a first-class deliverable of this run, graded on whether it contains good
unmapped candidates rather than on coverage percentage.

**By suggested destination**

     374  Mythbuster
     242  Statistics
      56  Rules & Frameworks
      42  Gender Dynamics
      29  possible new page
      25  Five Levers
      22  Lexicon
      11  Deep Dive
       8  Pill Dossier

**By primary risk flag**

     673  unsupported assertion
      92  gender generalization
      25  causal claim
      11  moral claim
       8  unsupported statistic

**By why it did not map**

     702  A nearby concept exists, but confidence stayed below the credible-match threshold
     107  The nearest canon concept shares only weak or generic wording

The 702/107 split is worth stating plainly: for the large majority of residue the analyzer found a
nearby concept and declined it on confidence, rather than finding nothing at all. On uncalibrated
thresholds that number is not interpretable as "702 near-misses that should have mapped" — it is
equally consistent with a threshold set that is correctly refusing weak matches. It is the reason the
labelling sheets exist, and it cannot be resolved without graded sheets.

## The 29 "possible new page" candidates, read honestly

This is the destination the Lab assigns when a claim fits no existing surface, so it is where genuinely
novel material would appear. Read in full, **most of these are not doctrine candidates at all** —
they are method sentences, a keyword line, two table captions, and one sentence broken mid-clause:

- Method and instrument description (source 07): the two-item desire measure, the stepwise-regression
  setup, the education non-result, a section heading, a construct-justification sentence.
- Boilerplate closers (source 09): "Further research is necessary to elucidate the relationship
  between mate preference fulfilment and relationship satisfaction."
- Table captions (source 09): "Table 1 Zero-order correlations between relationship satisfaction,
  preference fulfilment, and mate value discrepancies." Twice.
- A fragment (source 10): `who my next partner would be") and set out to create a new scale.`

Recording that plainly matters more than the count does: **"possible new page" is a
no-canon-match signal, not a novelty signal**, and treating its volume as a doctrine yield would
overstate this batch by roughly a factor of three.

The substantive remainder is genuinely interesting, and it clusters:

1. **The desire counter-findings** (source 07, items 2–4, 14–17, 20). "Anxious attachment-related
   relational needs correlated positively with sexual desire." "Avoidant attachment-related relational
   needs correlated negatively with sexual desire." "Anxious and avoidant attachment-related needs,
   however, did not moderate the association between intimacy and sexual desire." "The hypotheses that
   the link between intimacy and sexual desire would be moderated by attachment-related relational
   needs were rejected." The canon has no concept for any of this, which is consistent with the
   site holding no post-pairing desire-maintenance doctrine at all.

2. **A primary source stating the formation/maintenance asymmetry itself** (source 09, items 22–23).
   Verbatim from Conroy-Beam, Goetz & Buss: "But little research examines the role of mate preference
   psychology after mate selection—for instance, in guiding behaviors and affective states within
   relationships and their downstream consequences." And: "Precisely how these preference–partner
   mismatches influence longterm relationships is unclear."
   This is the most load-bearing single item in the residue. The asymmetry that checkpoint 01
   identified inside this site — formation modelled exhaustively, maintenance almost not at all — is
   here asserted as a gap **in the research literature**, by an outside primary source, unprompted.
   That does not make the site's gap acceptable, but it reframes it: the site is thin where its
   sources are also thin, which is a different problem from being thin where good evidence exists.

3. **The failed-replication process list** (source 05, item 1). The specific affect processes Kim et
   al. could not replicate, as a single passage.

## Instrument observations — prose only, for the maintainer

Per the run's contract these are recorded here for Jason's attention and **no feedback file was
generated**. They are observations from research material, not proposed Lab changes, and no Lab defect
is being claimed.

1. **"Four Horsemen" is not one instrument across its own corpus.** In Gottman & Levenson 1992 and
   2000 the horsemen are **RCISS** codes; SPAFF is a separate system used in the same papers for
   different variables. Kim et al. 2007 replicated against **SPAFF** process models. A canon mapping
   that treated "Four Horsemen" / "SPAFF" / "RCISS" as interchangeable surface forms of one concept
   would collapse a distinction the primary papers keep apart.

2. **"Predicts divorce" and "predicts timing of divorce" are different outcomes on different
   denominators, and the largest percentages attach to the second.** 95% discriminates early- from
   later-divorcing couples *among those who already divorced* (~20 couples); 93% comes from a mixed
   model including self-reported satisfaction and thoughts of dissolution, not behaviour alone; 83.5%
   is horsemen-plus-satisfaction on the whole sample. One canon concept for "divorce prediction
   accuracy" would merge three denominators.

3. **The desire cluster should not collapse to one citation.** Sub-claim (a) has real prospective
   support (McNulty et al. 2016) *and* cross-sectional-only support that cannot separate duration from
   cohort or age (van Lankveld et al. 2021). Sub-claim (b) has no primary-verified instrumented
   mechanism test, and the nearest primary-verified associations run *positive*. Sub-claim (c) has no
   located instrumentation at all. A single merged "desire declines with familiarity" line would state
   as one thing three claims with sharply different support.

4. **The C6 conditional should never be encoded as its main effect.** The source paper found that
   people mated to higher-mate-value partners stay satisfied regardless of alternatives, and people
   mated to lower-mate-value partners are also satisfied when alternatives are scarce. "Higher mate
   value than partner leads to dissatisfaction," without the alternatives qualifier, would misstate
   the one study that tested it. Separately, citing both Conroy-Beam et al. 2016 and Buss et al. 2017
   as support for that conditional would double-count a single dataset.

5. **Queue noise worth knowing about, on uncalibrated thresholds.** Table captions and one
   mid-clause fragment surfaced as claim-like queue items. Two of the three came from the two
   grade-B (PDF-extracted) sources, where reading order is reconstructed rather than marked up, so
   the likeliest cause is extraction rather than classification. Recorded so the residue count is read
   with that in mind, not as a defect claim.

## Provenance grades

- **Grade A** — archived HTML → committed `tools/extract-source-text.mjs` → SHA-256. Reproducible from
  the repository alone. Sources 05, 06, 07, 08 (and the pre-existing 01, 02, 04).
- **Grade B** — archived PDF → `pdftotext` 4.00 with recorded flags → recorded `awk` anchor
  truncation → SHA-256. Reproducible with the same tool version, but the extractor is an external
  binary rather than a hashed repository file, so it cannot be verified from the repository alone.
  Sources 09, 10. Used only because neither publisher ships HTML full text.

No scout capture was archived as a corpus artifact. Each was independently re-fetched and
re-extracted, because a model-mediated transcription is not reproducible byte-for-byte — the rule
`tools/extract-source-text.mjs` states in its own header. Scout captures survive as a cross-check:
8-word shingle overlap against the deterministic extraction, recorded per source in the manifest.

| Source | Scout | Overlap | Reading |
|---|---|---|---|
| 05 | S-A | 84.4% | Partial — scout retained a larger span |
| 06 | S-A | 95.1% | Corroborated |
| 07 | S-B | 99.0% | Corroborated |
| 08 | S-B | 99.1% | Corroborated across two different renditions of the same paper |
| 09 | S-C | 78.3% | Partial — scout disclosed aggressive hand-cleaning, tables omitted |
| 10 | S-C | 95.9% | Corroborated |

Nothing fell below 60%. **No scout fabricated prose.** The 99.1% on source 08 is the most informative
figure in the table: the scout read an FSU repository PDF that returned HTTP 403 on independent
re-fetch, so the PMC author manuscript was archived in its place, and the two renditions agree almost
exactly — which is what licenses using that scout's findings against the substituted archive.
