# Cluster C10 — "Male friendship decline concentrates men's emotional support onto romantic partners as sole channel"

## TOP-LINE FLAG (read this first)

Contrary to the working assumption handed down for this assignment, **genuine instrumented evidence bearing on the sole/primary-channel step (c) DOES exist** — but it is thin, comes from populations far removed from the "friendship decline" claim (older Europeans, Dutch elders in 1992), and the single most rigorous *direct* test of the analogous claim in a large modern US probability sample (Pew 2025) actually **cuts against** the naive version of (c). See TARGET 2 below for the full breakdown before drawing any conclusion. The prior integrity flag — that the sole-channel step is discourse extrapolation not present in the (a)-type source data — is **CONFIRMED for the specific ASC/Cox friendship-decline dataset** (raw-01.txt): that report never measures or claims partner-concentration. But it would be inaccurate to say no data anywhere touches (c); some does, and it is mixed.

---

## (a) Men have fewer friends / receive less friend-support than women — comparative friendship claim

**Source: raw-01.txt — Daniel A. Cox, "The State of American Friendship: Change, Challenges, and Loss," Survey Center on American Life, June 8, 2021.** TIER 2 (single survey, no independent replication of this exact instrument, but large probability-based sample with published methodology).

- Survey: May 2021 American Perspectives Survey (APS). N=2,019 US adults 18+. Sampling: Ipsos KnowledgePanel, probability-based panel. Field dates: May 14–23, 2021. MOE ±2.4 points at 95% CI, design effect 1.2.
- **Emotional support figure, exact wording as printed in the report** (recall window = past week, NOT past month): "Men are also far less likely than women are to have received emotional support from a friend. Four in 10 (41 percent) women report having received emotional support from a friend within the past week, compared to 21 percent of men."
- Adjacent item, same recall window: "Nearly half of women (48 percent) and less than one-third of men (30 percent) say they have had a private conversation with a friend during which they shared their personal feelings in the past week."
- Close-friends-by-sex-over-time (from the companion piece "Men's Social Circles are Shrinking," same author/publisher, same underlying May 2021 APS, captured via WebFetch extraction not raw HTML — flagged in raw-01.txt): men with 6+ close friends fell from 55% (1990) to 27% (2021); men with zero close friends rose from 3% (1990) to 15% (2021), a "fivefold increase." Women: 6+ close friends fell from 41% (1990) to 24% (2021); women with zero close friends = 10% (2021, no 1990 comparator given in that piece).
- **Important instrument caveats the report itself flags**: the 1990 comparator is a Gallup telephone poll vs. the 2021 online panel — mode-effect / social-desirability-bias risk explicitly noted by the authors (footnote 7). "Close friend" was left undefined/subjective to the respondent (footnote 6).
- I could NOT locate the literal interviewer-facing question wording (the topline questionnaire PDF was not machine-readable in this environment — image-rendered PDF, pypdf extraction returned near-blank text, WebFetch's PDF handler also failed). The report's own narrative sentence is the closest available wording and is what is quoted above.

**Complication worth flagging**: Pew Research Center's 2025 survey (raw-02.txt, n=6,204, fielded Sept 2024) found "men and women are about equally likely to say they have at least one close friend" and 18% of all adults (not sex-split in what I could reach) report zero close friends — in real tension with ASC's 2021 sex-split (15% of men vs 10% of women with zero close friends). These are different surveys, different years, different definitions of "close friend," and I am NOT merging them — but a maintainer citing "men have fewer friends" should know the claim is not uniformly replicated across the two most-cited large US probability surveys on this topic.

**Verdict: (a) is well-evidenced by raw-01.txt, TIER 2, with the mode/definition caveats above. It is NOT unanimous across all major surveys — see the Pew close-friend-parity finding.**

---

## (b) Men rely on romantic partners for emotional support — partner-reliance claim

**Source: raw-01.txt, same ASC 2021 report.** TIER 2.
- "Overall, more than half (53 percent) of Americans say that the first person they talk to when they have a personal problem is their spouse or partner." (Not sex-split at the topline level.)
- Sex-split, married respondents only: "Married men are significantly more likely than married women are to say the first person they talk to when they have a problem is their spouse. Eighty-five percent of married men, compared to 72 percent of married women, say they turn to their spouse when they have a personal problem." — This is a genuine sex-differentiated finding supporting (b): among married people, men lean on the spouse as first-call MORE than married women do (13-point gap). It is a single forced-choice "first person" item, not a network/confidant count, and it says nothing about singles or about friendship decline as a cause.
- Historical note in the same report: a 1990 Gallup poll found 26% of Americans named a friend as first-call (vs. 16% in 2021) — evidence that reliance on friends specifically has fallen, consistent with (a)/(b) co-occurring, but again not evidence of (c) causality.

**Source: Dykstra & de Jong Gierveld (2004), Canadian Journal on Aging, N=3,737, 1992 Dutch survey (NESTOR-LSN).** TIER 2 (single large probability survey, dated, foreign population). Full abstract quoted verbatim (I could not reach the full body text — PubMed abstract page reached; ResearchGate full-text mirror returned HTTP 403):
> "The marital-history differences in emotional and social loneliness are greater among men than women. For men, the marriage bond appears not only to be more central to emotional well-being than is the case for women but also to play a pivotal role in their involvement with others. ... Apparently, whereas men are more likely to find an intimate attachment in marriage, women also find protection from emotional loneliness in other close ties."

This is real instrumented evidence for (b) — and edges toward (c) in its final clause ("women also find protection... in other close ties," implying men find that protection *less* elsewhere) — but it is Dutch older adults surveyed in 1992, not the US friendship-decline cohort under investigation, and it measures loneliness outcomes, not a direct count of confidants or a "sole channel" test.

**Verdict: (b) has real support, TIER 2, from two independent instruments (ASC 2021 married-respondent item; Dykstra & de Jong Gierveld 2004). Both are correlational/cross-sectional, not about friendship decline causing the reliance.**

---

## (c) Romantic partner as SOLE/primary channel, with friendship decline as the causal driver — the actual claim under test

This is where the evidence gets genuinely mixed, and where the highest-value finding of this research pass sits.

### The most direct US test: Pew Research Center 2025 (raw-02.txt) — TIER 1 candidate (n=6,204, two linked probability panels, published methodology)
> "Men and women are equally likely to say they'd lean on their spouse or partner in this way" (74% overall extremely/very likely to turn to spouse/partner for emotional support).

The sex gap in this survey is NOT in partner-reliance (equal) — it is in the number of OTHER available channels: women are 12–18 points more likely than men to also name mother, friend, other family member, or mental-health professional. **This is evidence AGAINST the specific mechanism "men elevate partner-reliance relative to women" and instead supports a narrower, different claim: men have a narrower total repertoire, with partner-reliance held constant across sexes.** That is a materially different, more precise claim than "concentrates onto partner as sole channel" — it is closer to "men have fewer backup channels" than "men lean on the partner more." A maintainer should not let (a)-type breadth data get restated as (c)-type concentration data; this Pew finding is the clearest illustration of why the distinction matters, because on the one item that most directly operationalizes "does the partner carry more relative weight for men," the answer is no.

Caveat: this Pew item is a hypothetical multi-select "how likely would you be to turn to X" battery, not a forced-choice "sole" or "only" measure, and not a measure of actual realized support-seeking behavior. It does not test what happens when the partner is unavailable, and it is not longitudinal/causal with respect to friendship decline.

### The best direct test found anywhere, of any population: Sun & Schafer (2023), Journals of Gerontology: Series B — TIER 1 candidate on methodology (N=17,429 partnered respondents, SHARE Wave 4/2011 & Wave 6/2015, 14 European countries, peer-reviewed), but a DIFFERENT population (older Europeans, not the US friendship-decline cohort)
Full abstract, quoted verbatim (reached via WebFetch against the Oxford Academic abstract page; full text is paywalled, ResearchGate mirror 403'd):
> "People's partners and spouses often provide a wide range of essential emotional and practical support. As crucial as they may be, a nontrivial segment of the older population appears to limit close discussions to their partner alone, a phenomenon we term 'partner network exclusivity.' ... More than a quarter of partnered respondents (28.1%) are in partner-exclusive core networks. **Men, childless individuals, and those with financial difficulties are most likely to occupy such networks.** Individuals in partner exclusivity are especially likely to enlist additional ties upon partner loss. Nevertheless, **men and individuals at early old age are relatively unlikely to rebalance their core networks in case of partner death.** ... widowhood produces patterns of vulnerability for a subset of older adults in partner-exclusive core networks."

This is the single clearest instrumented finding for something like claim (c) that this research pass turned up: men ARE disproportionately more likely than women to have a support network in which the partner is the ONLY member (literally "sole channel" by the paper's own operational definition — "whether one listed their partner as the sole member of the core network"), and men are less likely than women to recover a support network after losing that partner. **This should be flagged prominently to the maintainer as real evidence for a version of (c) — but it is evidence for a *structural sex difference that exists among partnered older Europeans*, not evidence that *friendship decline in America causes or increases* this concentration.** No study in this research pass measured that causal/trend claim directly.

Two specific supplementary numbers surfaced by the extraction tool beyond the abstract text — a "12.7 percentage point" male-female gap in the probability of partner-exclusive networks, and "less than 60% of men vs. about 90% of women add new core-network ties after a partner's death" — **could NOT be independently corroborated against a second reachable copy of the full text and are marked UNVERIFIED.** They are plausible and consistent with the abstract's qualitative claims but should not be cited as confirmed figures without reaching the paywalled full text.

### A secondary, weaker echo: Shin & Park (2023), Frontiers in Psychology, N=620 South Korean adults ages 40–69
Captured only via WebFetch summarization (not raw HTML parse — treat with more caution than raw-01/raw-02). Contains the citation-of-a-citation "men often report that their spouses are their only confidants" — but tracing that citation back, it resolves to the Dykstra & de Jong Gierveld (2004) paper above, i.e. it is not independent evidence, it is the same underlying claim being repeated across the literature. Shin & Park's OWN empirical data (their South Korean LPA typology) found men over-represented in a "restricted" network type (24.4% of men vs. 16.4% of women) — but on inspection, "restricted" was explicitly defined by the authors as small networks with LOW support from family AND friends AND **above-average spousal conflict / lowest marital quality** — i.e., broad relational poverty, not partner-concentration. **This is a case where I initially thought I had found supporting data for (c) and, on closer reading, it does NOT actually support (c) — it is closer to a (a)-type finding (general relational deficit) mislabeled by superficial resemblance.** Flagging this explicitly because it is exactly the kind of near-miss a less careful pass could misattribute.

### What I did NOT find
- No study measuring US men's support networks specifically, tied to the friendship-decline trend documented in raw-01.txt, that tests whether partner-reliance INCREASED as friend-networks shrank (i.e., no causal/longitudinal test of the actual mechanism in the claim).
- No GSS confidant-name-generator breakdown by sex with exact published percentages reachable — McPherson, Smith-Lovin & Brashears (2006), "Social Isolation in America" (ASR), is the landmark study here (1985 vs. 2004 GSS waves, mean network size 2.94→2.08, "confidant networks centered on spouses and parents") but the PDF I located (almendron.com mirror) was not text-extractable by the tools available (compressed/encoded stream, same failure mode as other academic PDFs in this session), and I could not reach a clean HTML version. This is a GAP, not a negative finding — the paper is well-known to discuss spouse-centering of shrinking US networks and would be the single best US-specific test of (c) if reached. Recommend a future pass try Sci-Hub-adjacent legitimate repositories, a university library proxy, or a librarian-assisted request.
- No study directly measuring "what happens to men's support specifically when a ROMANTIC relationship (not just marriage/widowhood) ends" in a way that isolates the sole-channel mechanism from other explanations (e.g., breakup-initiation asymmetry, attachment style, general adjustment disorder). The breakup-distress literature (e.g., Wahring, Simpson & Van Lange, 2024/2025, Behavioral and Brain Sciences target article, "Romantic Relationships Matter More to Men than to Women") documents men suffering more post-breakup distress and lower breakup-initiation rates, which is CONSISTENT with a sole-channel mechanism but does not test it directly — distress could stem from several non-exclusive mechanisms. I could not get verbatim text from this paper (PDF not machine-readable); treat any claims from it as UNVERIFIED/secondhand from search-result summaries only, TIER 3 sourcing quality in my hands even though the underlying journal is TIER 1.

---

## DIRECT ANSWER: does the sole-channel step exist in reachable source data?

**Partial yes, with a major caveat.** It is not simply discourse extrapolation with zero grounding anywhere — Sun & Schafer (2023) is real, peer-reviewed, large-n instrumented evidence that men are disproportionately more likely than women to have a partner-exclusive support network and to fail to replenish it after partner loss. That is a genuine, if population-mismatched, empirical anchor for something like claim (c).

But: (1) that anchor is in older, partnered Europeans, not the American friendship-decline population the claim is actually about; (2) the one large modern US probability survey that directly tested the analogous question (Pew 2025) found NO sex gap in partner-reliance itself — the sex gap is in breadth of alternate channels, a meaningfully different and weaker claim than "concentration onto partner"; (3) no source anywhere in this pass tested the actual mechanism asserted in the claim — that DECLINING friendship networks CAUSE or correlate with INCREASED partner-concentration over time. Every source is cross-sectional.

So: the specific causal chain "friendship decline → concentration onto partner as sole channel" remains unsupported as a tested mechanism. But the destination state it describes — men disproportionately having the partner as their only confidant — has at least one real, if geographically/demographically distant, instrumented anchor. The original integrity flag was right that the ASC/Cox friendship-decline report itself (the primary source usually cited for this claim) contains no such step. It would be an overcorrection to say no data anywhere supports any version of it.

---

## CONFIDENCE NOTES

**Verified to primary (byte-verbatim, raw HTML fetched and parsed by me directly, not tool-summarized):**
- raw-01.txt: ASC/Cox 2021 "The State of American Friendship" main report page — full body text, including methodology and footnotes.
- raw-02.txt: Pew 2025 "Men, Women and Social Connections" — both the landing/methodology page and Chapter 2 ("Where men and women turn...").

**Verified to primary but only at abstract level (full text paywalled/unreachable):**
- Dykstra & de Jong Gierveld (2004) — abstract quoted verbatim from PubMed.
- Sun & Schafer (2023) — abstract quoted verbatim from Oxford Academic; two supplementary percentages beyond the abstract are UNVERIFIED (see above).

**Reached only secondhand (via WebFetch tool summarization of a source I could not raw-parse, or via WebSearch synthesis, not independently corroborated):**
- Daniel A. Cox, "Men's Social Circles are Shrinking" (2021) — appended to raw-01.txt with this caveat noted inline.
- Shin & Park (2023), Frontiers in Psychology — network-type percentages and the "restricted" type definition.
- Wahring, Simpson & Van Lange (2024/2025 BBS target article) — breakup-distress/relationship-centrality claims; PDF not machine-readable, treat as TIER 3 in my hands.
- McPherson, Smith-Lovin & Brashears (2006) "Social Isolation in America" — network-size trend figures (2.94→2.08) came from WebSearch synthesis of the paper's known abstract/citations, not from text I read myself; the specific "confidant networks centered on spouses and parents" phrase is widely quoted secondhand across sources citing this paper, which increases my confidence it is a real quotation, but I did not confirm it against the primary PDF myself.

**Failed to reach / GAPS:**
- The May 2021 APS topline questionnaire PDF (exact instrument-level question wording) — image-rendered PDF, not text-extractable with pypdf or WebFetch in this environment.
- Pew's own topline/questionnaire PDF for ATP Wave 154 — not attempted after the ASC topline failure pattern repeated on two other PDFs this session; likely same failure mode.
- McPherson et al. (2006) full text — PDF mirror found but not text-extractable (compressed stream).
- Sun & Schafer (2023) and Dykstra & de Jong Gierveld (2004) full bodies — paywalled; ResearchGate mirrors both returned HTTP 403.
- Any study directly testing the causal "friendship decline → partner concentration over time" mechanism — not located; may not exist as a direct test in the literature, or may exist under search terms not tried (e.g., specific longitudinal panel studies of network composition pre/post relationship changes).

## NOTE FOR THE LAB MAINTAINER (prose only, no feedback file created per instructions)
If the Lab's analyzer or canon ever tries to auto-correlate "friendship decline" statistics with "partner reliance" statistics as though they were the same claim family, this cluster is a clean illustration of why that would miscorrelate: raw-01.txt (friendship decline, TIER 2, US, 2021) and raw-02.txt (partner-reliance parity, TIER 1-ish, US, 2024/2025) are both real, both about men and emotional support, and they point in different directions on the specific question of whether men elevate partner-reliance — because they are answering different questions ((a)-breadth vs. (c)-concentration). Any canon rule that treats "men + emotional support + partner" as a single fuzzy-matchable concept would conflate a well-supported breadth claim with a much weaker, population-mismatched concentration claim, and would miss that the most direct modern US test of concentration actually returned a null result on the sex gap.
