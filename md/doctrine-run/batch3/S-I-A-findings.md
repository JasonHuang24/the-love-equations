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
