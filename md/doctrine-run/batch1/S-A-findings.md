# S-A findings — clusters C1a / C1b (Gottman primary literature and the accuracy-claim critique)

**Provenance of this file.** Scout S-A (Claude Opus 5, effort xhigh) was unable to write its own
`findings.md`: the harness's Write tool refuses files with that name for subagents ("Subagents should
return findings as text, not write report files"), and per that tool's own instruction the scout
returned the full findings as its final message instead. This file transcribes that return. The
scout's `raw-01.txt` / `raw-02.txt` / `capture.json` were written normally; the two raw captures are
superseded as archived artifacts by the orchestrator's own deterministic re-fetch (see
`lab-results-and-residue.md`), and survive here only as the cross-check recorded in the manifest.

Two other scouts hit the same guard. S-B saved its findings as `evidence-notes.md`; S-C wrote under a
staging name and renamed via Bash. Recorded so the pattern is not mistaken for three separate faults.

---

## FLAGGED AT TOP: an independent replication was found, and it FAILED

**Kim, H. K., Capaldi, D. M., & Crosby, L. (2007). "Generalizability of Gottman and Colleagues'
Affective Process Models of Couples' Relationship Outcomes." *Journal of Marriage and Family*
69(1):55–72. DOI 10.1111/j.1741-3737.2006.00343.x. PMID 17372624.**
https://pmc.ncbi.nlm.nih.gov/articles/PMC1828692/

**Oregon Social Learning Center** — zero author overlap with the Gottman lab, separate sample,
separate funders. Abstract, verbatim: "The major findings of Gottman et al. failed to replicate."

- Sample: 85 married/cohabiting couples, at-risk backgrounds, from the Oregon Youth Study (206 men
  recruited via 4th-grade classes ages 9–10 in higher-crime Pacific NW neighbourhoods, 1984–85; 94%
  retention at year 18). T1 ≈ age 21, T2 ≈ 2.5 years later. n = 54 intact, 31 separated; 27
  low-satisfaction, 26 high.
- Used **the same instrument**: "the same affect coding used in the Newlywed Study (Specific Affect
  Code; Gottman, McCoy, & Coan, 1996)."
- Failed to predict relationship status: "men's rejection of their partners' influence, the lack of
  men's deescalation of partners' negative affect, and women's negative start up were not predictive
  of relationship status."

**HONEST LIMIT — do not overread.** Kim et al. state they did *not* test the discriminant function
models, the contingent positive affect path model, or the physiological soothing model. This is a
failed replication of the **affective process models**, not a head-on test of the four-horsemen
divorce-prediction equation. The population also differs (younger, at-risk, lower SES, cohabiting
included, 2.5-year window).

---

## LEG 1 — PRIMARY EMPIRICAL LITERATURE

**L1-C1 — TIER 2.** "Time-1 negative conflict behaviour discriminates later-divorcing couples at
83.5%–93% correct classification in a 79-couple Indiana cohort followed 14 years." Gottman &
Levenson 2000, *JMF* 62:737–745. Full text read:
https://bpl.studentorg.berkeley.edu/docs/61-Timing%20of%20Divorce00.pdf

- Recruitment, verbatim: "Couples were recruited in 1983 in Bloomington, Indiana, using newspaper
  advertisements. Approximately 200 couples... a smaller group of 85 couples was invited... usable
  physiological data were obtained from 79 of these 85 couples."
- Sampling explicitly non-representative; the 2002 companion states it sharply: "the tails were
  over-sampled so that there was uniform power throughout the range of marital satisfaction."
- Follow-up: 4 years (73/79 = 92.4% retained), last follow-up 14 years. "Of the original set of 79
  couples, 22 (27.8%) had divorced after 14 years." Early: 9 couples, mean 7.4 years (SD 1.7).
  Later: 13 couples, mean 13.9 years (SD 5.1).
- Coding: **RCISS** (13 speaker / 9 listener behaviours per turn at speech) plus **SPAFF** (Gottman
  1996); coders trained on Ekman & Friesen FACS; "initial training of coders took more than 200
  hours."
- **Apparatus fact:** the horsemen here are RCISS, not SPAFF — "only the negative RCISS codes dubbed
  the 'Four Horsemen of the Apocalypse' by Gottman (1994)... namely the RCISS codes criticism,
  defensiveness, contempt, and stonewalling."
- Figures the paper itself claims: **"The model predicted divorce with 93% accuracy"** — but that
  model "included marital satisfaction, thoughts of marital dissolution, and affective interaction in
  both conversations," i.e. **not behaviour alone**. Four-horsemen plus satisfaction, whole sample:
  "canonical correlation was .52, with X2 (12) = 22.36, p < .05, with correct classification
  **83.5%**." Early-vs-later divorce, horsemen only, **restricted to the couples who already
  divorced**: "canonical correlation was .85, with X2 (8) = 18.03, P = .0210, with a **95% accuracy**
  in discrimination" — the paper concedes "relatively low power," and df = (1, 18), i.e. ~20 couples
  against 8 predictors.

**L1-C2 — TIER 2. DEFENSIVENESS, NOT CONTEMPT, IS LARGEST IN THE PRIMARY TABLE.** Same paper.
Univariate F ratios, df = (1, 77), verbatim: "husband marital satisfaction, .38, ns; wife marital
satisfaction, 3.14, p = .08; husband positive-minus-negative RCISS codes, 10.27, p < .001; wife
positive-minus-negative RCISS codes, 12.71, p < .001; husband criticism, 1.46, ns; husband
defensiveness, 16.08, p < .001; husband contempt, 4.26, p < .05; husband stonewalling, 7.57, p < .01;
wife criticism, 4.63, p < .05; wife defensiveness, 12.69, p < .001; wife contempt, 9.32, p < .01; and
wife stonewalling, 2.00, ns."

- Defensiveness is largest for **both** spouses (16.08 H, 12.69 W); contempt is 4.26 H / 9.32 W;
  husband criticism and wife stonewalling are **non-significant**. Same ordering in the early-vs-later
  analysis: "husband criticism, F(1, 18) = .95, ns; husband defensiveness, F(1, 18) = 17.50,
  P = .0006... husband contempt, F(1, 18) = 6.88" (contempt's p truncated in extraction —
  **UNVERIFIED**).
- I am not adjudicating whether contempt is strongest overall; I am recording that **this** primary
  table does not support that ordering.

**L1-C3 — TIER 2.** "Time-1 negativity predicts cascade progression over 4 years in 73 couples."
Gottman & Levenson 1992, *JPSP*. Full text:
https://bpl.studentorg.berkeley.edu/docs/41-Marital%20Processes92.pdf

- "Seventy-three married couples were studied in 1983 and 1987." Identical recruitment prose to 2000
  → **same cohort**. RCISS as classifier; "MICS... and SPAFF... were used as measures of convergent
  validity." Kappa .75 overall SPAFF; individual codes .63–.76.
- **The outcome is a cascade, not divorce alone:** "36 of 73 couples (49.3%) reported considering
  dissolving their marriage"; "Eighteen of the 73 couples (24.7%) actually separated"; "Nine of the 73
  couples actually divorced (12.5%)." Regulated vs nonregulated: considered dissolution 33.0% vs
  71.0% (F 3.18); separation 16.7% vs 36.8% (F 1.84); **divorce 7.1% vs 19.0% (F 1.57)** — the weakest
  of the three. Time-1 satisfaction × divorce **r = −.23, p < .05**, the paper's own words:
  "significant, but not very high."
- **The 1992 paper rests on 9 actual divorces.**

**L1-C4 — TIER 3 by the authors' own framing.** Gottman & Levenson 2002, *Family Process* 41:83–96.
https://bpl.studentorg.berkeley.edu/docs/66-Two%20Factor%20Model02.pdf — "attempts to create a post
hoc model that uses Time-1 data to 'predict' the length of time the marriage will last" (their scare
quotes); "Our analyses are admittedly post hoc." n = "the 21 couples (of 79 studied) who divorced."

- Internal inconsistencies across same-cohort papers: "197 couples who responded" vs "approximately
  200"; "a cohort of 70 couples" vs "The original sample of 79 couples"; "26.6% of the sample has
  divorced" and **21** divorced vs 2000's **22 (27.8%)**.

**L1-C5 — TIER 2.** Carrère, Buehlman, Gottman, Coan & Ruckstuhl 2000, *J Family Psychology*
14(1):42–58. Full text:
https://www.johngottman.net/wp-content/uploads/2011/05/Predicting-Marital-Stability-and-Divorce-in-Newlywed-Couples.pdf
— 95 newlywed couples; DFA "predicted, with 87.4% accuracy" at Time 2 and "81% accuracy" at Time 3.
**Instrument is the Oral History Interview, not SPAFF and not the horsemen** — this paper is often
swept into "Gottman predicts at 90%+" summaries. It is also the verbatim source for Cohort B
recruitment: "Between 1989 and 1992... Puget Sound area... newspaper advertisements... only the wives
were interviewed at this screening stage... married for the first time within 6 months... childless...
no serious illnesses."

**L1-C6 — GAP. Gottman, Coan, Carrère & Swanson 1998**, *JMF* 60:5–22, DOI 10.2307/353438. Semantic
Scholar returns `"status": "CLOSED"`; author-hosted PDF is an **image-only ProQuest scan** stamped
"Further reproduction prohibited without permission," no OCR layer; pdftoppm/poppler absent locally so
visual reading also impossible. Reached only secondhand: via Heyman & Slep (peer-reviewed, quoting
it) — "**n = 60 couples for the prediction analyses**"; "their **80% correct** divorce prediction";
construction "took the total number of divorced couples (**n = 20**) and selected an equal number of
those intact couples with the highest and lowest Marital Adjustment Test... scores"; "the
**artificially imposed prevalence of 33%**." Search-engine-only and **UNVERIFIED**: "130 couples,"
"83% accuracy" for divorce/stability, "80%" for satisfaction — **the 83% conflicts with Heyman's
80%**; unresolved.

**L1-C7 — GAP. Carrère & Gottman 1999**, *Family Process* 38(3):293–301, PMID 10526767. Semantic
Scholar `CLOSED`; Wiley returned **HTTP 402**; johngottman.net PDF again image-only scan. Reached only
the PubMed abstract, and **that abstract was paraphrased by the fetch tool, not delivered verbatim**:
124 newlywed couples, SPAFF, five 3-minute intervals, 6-year outcome. **No accuracy percentage in the
abstract** — relevant to the circulating "96%."

### CONCENTRATION ANALYSIS (the load-bearing control)

**The entire primary corpus is ONE program on TWO cohorts. Not independent lineages.**

**Cohort A — Bloomington, Indiana, 1983.** Newspaper ads, ~200/197 responders → 85 invited → **79
usable**, tails deliberately over-sampled. Papers: Gottman & Levenson 1992 (73 at follow-up, 9
divorces); 2000 (same 79, 22 divorces); 2002 two-factor (the 21 divorced); 2002 reply (same 21).
Sameness established **not by inference but by near-identical recruitment prose** across
1992/2000/2002 — same city, year, ad method, $5 payment, 85-invited/79-usable funnel.

**Cohort B — Puget Sound newlyweds, 1989–92.** Papers: Gottman et al. 1998 (130; n = 60 in
prediction), Carrère & Gottman 1999 (124), Carrère et al. 2000 (95). Confirmed shared design in
Carrère et al. 2000's own text: "a report of the procedures can be found in Gottman et al. (1998)."

**Author overlap:** Gottman is an author on **every** primary paper; Levenson on all four Cohort A
papers; Carrère on 1998/1999/2000; Coan on 1998/2000. **No primary paper in this corpus lacks
Gottman.**

**Shared apparatus:** RCISS (Krokoff, Gottman & Hass 1989) and SPAFF (Gottman & Krokoff 1989; Gottman
1996; Gottman, McCoy & Coan 1996) — instruments built by the same lab. The construct label is
internal too: codes "dubbed the 'Four Horsemen of the Apocalypse' by Gottman (1994)."

**Consequence:** 93%, 95%, 83.5%, 87.4% and 81% must **not** be tallied as five corroborating
results. They are repeated analyses of two small convenience samples with over-sampled tails, by
overlapping authors, on self-authored instruments. Gottman & Levenson's own 2002 reply says "across
studies, we can predict whether or not a couple will divorce" — that "across studies" spans these
same two cohorts.

---

## LEG 2 — CRITIQUE LITERATURE

**L2-C1 — TIER 2 (principle is textbook).** "These are reconstructions of known outcomes, not
predictions." Heyman & Slep 2001, `raw-02.txt`. Verbatim: "the analyst asks the software to
*reconstruct,* rather than predict, because the computer develops an equation to optimally reconstruct
an already-known group status. This is not a trivial, semantic distinction." On the standard:
"crossvalidation only provides evidence of the accuracy of a predictive equation when the original
weights and cut-points are used; developing another 'highly predictive' equation with new weights and
cut-points is not sufficient."

**L2-C2 — TIER 2.** "No published divorce-prediction study on general-population couples had
cross-validated as of 2001." Verbatim: "No published study predicting divorce with general population
couples has done this to date," with one carve-out for Crane et al. 1995 (therapy sample; one scale
asked about steps already taken toward divorce). Field census: "only 15 published studies have
predicted *who* will get divorced... accuracy... ranging from **67% to 95%**... following couples for
**2–15 years**. Sample sizes ranged from **54 to 286**." On Gottman: "Overfitting can cause extreme
overinflation of predictive powers, especially when oversampled extreme groups and small samples are
used, as was the case with Gottman et al. (1998; n = 60 couples for the prediction analyses)."

**L2-C3 — TIER 2.** "A 90%-accurate equation falls to 69% accuracy / 29% PPV out of sample, and to
21% PPV at the real base rate."

- Data: **1985 National Family Violence Survey**, n = 6,002; 176 divorced + 176 highest- + 176
  lowest-disagreement = 528; split into two independent subsamples of 88 divorced + 176 married each.
  Backward stepwise logistic regression; ROC cut-point 0.222157493.
- **Development:** 34 TP / 18 FP / 3 FN / 149 TN — "Percent correct: 89.71%; sensitivity: 91.89%;
  specificity: 89.22%; PVpos: 65.38%; PVneg: 98.03%."
- **Cross-validation:** 17 TP / 42 FP / 20 FN / 123 TN — "Percent correct: 69.31%; sensitivity:
  45.95%; specificity: 74.55%; PVpos: 28.81%; PVneg: 86.01%."
- **Re-weighted to 16% base rate** (Clarke 1995): "PVpos: 20.99%." Summary: "An equation with an
  initial overall accuracy of 90% ended up with a positive predictive value of 21%."
- Applied to Gottman 1998: assuming 80%/80% at 16% prevalence, "The positive predictive value for
  Gottman et al.'s equation would be **43%**... one would be wrong more than half of the time when one
  told couples 'you are likely to get divorced.'"
- **Their own stated limit:** "the archival data set used was cross-sectional, unlike the prospective
  data of Gottman and colleagues." It is a demonstration of a hazard, **not** a re-analysis of
  Gottman's data.
- Textual defect preserved in raw-02: "sensitivity dropped 45% and its sensitivity dropped 15%" —
  second instance evidently should read *specificity*.

**L2-C4 — TIER 3.** DeKay, Greeno & Houck 2002, *Family Process* 41(1):97–103, DOI
10.1111/j.1545-5300.2002.40102000097.x, PMID 11924094 — **Carnegie Mellon, Heinz School of Public
Policy**; a third independent lineage. **Abstract only, tool-paraphrased:** post hoc OLS inadequate
for divorce timing; duration models preferable; flawed distributional assumptions; omitted variables;
**15 cases**; problematic data points; findings lack replicability and should not inform clinical
interventions.

- **Corroborated from the primary reply side** (full text read:
  https://bpl.studentorg.berkeley.edu/docs/67-Generating%20Hypotheses02.pdf): "the analyses are indeed
  based on a small number of couples (N = 21), and small samples are indeed sensitive to outliers.
  However, perhaps 'outliers' are important under-sampled sub-populations. For this reason, we choose
  to leave in what some may call our outliers." And: "When speculating, one makes an important
  contribution just by being interesting, not necessarily by being right."

**L2-C5 — GAP.** Stanley, Bradbury & Markman 2000, *JMF* 62:256–264 — paywalled, not fetched. Its
counterpart Gottman, Carrère, Swanson & Coan 2000 reply — not reached. Known only via Heyman & Slep's
sentence: "Stanley, Bradbury, and Markman (2000) discussed problems with Gottman et al. (1998; many of
which were disputed in a reply by Gottman, Carrere, Swanson, & Coan, 2000)," and Heyman & Slep scope
off it: "confined to an issue that Stanley et al. did not address."

**L2-C6 — TIER 3. Popularization figures I could not trace to any primary paper.** A mirrored
trade-book excerpt ("HOW GOTTMAN PREDICTS DIVORCE," retrieved at covenantcc.co) claims "**96
percent** of the time you can predict the outcome of a conversation based on the first three minutes"
— the object is **the outcome of a conversation, not divorce**; popular retellings convert this into
divorce accuracy. Not captured as raw (popularization, apparently unlicensed book text). A "**94%
accuracy**" figure appears on counselling blogs; **untraceable to any primary paper I read**. Laurie
Abraham's postdiction critique reached only via aggregator (liquisearch), which attributes "**57
couples**" where Heyman says "**60**" — both UNVERIFIED against her original. Gelman's 2010
statmodeling posts not fetched.

### CONCENTRATION ANALYSIS — critique side

Leg 2 is **not** concentrated: **three mutually independent lineages**, no shared authors, none
Gottman-affiliated — Stony Brook (statistical), Oregon Social Learning Center (empirical
replication), Carnegie Mellon (methodological); plus a fourth I could not read (Denver/UCLA).
Convergence from four unrelated institutions on the same structural point — accuracy obtained
in-sample, never validated out-of-sample — weighs against Leg 1's single-program concentration.

---

## NOTE FOR THE LAB MAINTAINER (prose only, no feedback file created)

1. **"Four Horsemen" is not one instrument across the corpus.** In 1992 and 2000 the horsemen are
   **RCISS** codes; SPAFF is a separate system used in the same papers for different variables (in
   1992 only for convergent validity). Kim et al. 2007 replicated against **SPAFF** process models.
   Any mapping treating "Four Horsemen" / "SPAFF" / "RCISS" as interchangeable surface forms of one
   concept collapses a distinction the primaries keep apart.
2. **"Predicts divorce" vs "predicts timing of divorce" are different outcomes on different
   denominators, and the highest percentages attach to the second.** 95% = discriminating early- vs
   later-divorcing *among couples who already divorced* (~20 couples). 93% = a mixed model including
   self-reported satisfaction and self-reported thoughts of dissolution, not behaviour alone. A canon
   mapping "divorce prediction accuracy" to one concept merges three denominators.

---

## CONFIDENCE NOTES

**Verified to primary full text:** Gottman & Levenson 1992 (JPSP); Gottman & Levenson 2000 (JMF
62:737–745); Gottman & Levenson 2002 two-factor (Family Process 41:83–96); Gottman & Levenson 2002
reply (41:105–110); Carrère et al. 2000 (JFP 14:42–58); Heyman & Slep 2001 (PMC author manuscript);
Kim, Capaldi & Crosby 2007 (PMC author manuscript).

**Secondhand only:** Gottman et al. **1998** — the pivotal paper; everything via Heyman & Slep's
quotations or Gottman's own 2002 reply; the "130/83%/80%" triple is search-level and conflicts with
Heyman's 80%. Carrère & Gottman **1999** — PubMed abstract, and that abstract was tool-paraphrased,
not verbatim; no accuracy figure obtained. DeKay et al. **2002** — abstract only, tool-paraphrased.

**Failed to reach:** Gottman et al. 1998 full text (CLOSED; image-only scan; no local PDF renderer);
Carrère & Gottman 1999 full text (CLOSED; HTTP 402; image-only scan); Stanley/Bradbury/Markman 2000
and the Gottman et al. 2000 reply (paywalled); Abraham's original; Gelman's posts.

**Source fence:** I did not fetch, capture, or quote the Gottman Institute's "The Four Horsemen"
article or any revision. I did not land on it accidentally. Two gottman.com URLs appeared in search
listings (a blog post on the 1999 study; a research FAQ) — I fetched neither. The one popularization
retrieved is the third-party-hosted book excerpt in L2-C6, not captured as raw.

**Licensing note for corpus use:** both raw files are free-to-read **NIH author manuscripts** on PMC,
not CC-BY. Publisher versions are paywalled. Treat as free-to-read, not freely redistributable.

**Anti-fabrication:** every figure traces to a URL in capture.json or to the seven full-text URLs
above, except items marked UNVERIFIED. Two partial reads marked: the p-value for husband contempt in
the 2000 early-vs-later analysis (F = 6.88, p truncated) and the bracketed tail of the 1992
low-base-rate sentence. Nothing reconstructed from memory.
