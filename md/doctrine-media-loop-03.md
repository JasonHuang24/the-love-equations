# Doctrine media loop 03 -- ten-article cycle

**Run date:** 2026-07-31
**Status:** Implemented and verified; publish decision pending

**Lane:** Media intake -> primary-source verification -> doctrine adjudication -> canon implementation

## 1. Run result

Ten media articles were pasted through the LE Lab intake/analyzer. The suite produced:

- 8,261 normalized words
- 233 claim-like units
- 14 displayed canon mappings
- 219 unmapped units
- 6.0% raw mapping rate
- 2 generated pressure tests

Human review rejected nearly all fourteen displayed mappings as topic-adjacent or false. None captured the mechanisms ultimately promoted. The mapping rate is therefore an instrument result, not a novelty score.

Raw source text was not committed. Passes 9-10 used temporary local inputs and analysis exports that are deleted after adjudication. Their hashes identify the exact normalized test inputs used in this run, including the bounded paraphrase used for pass 9 when a full article capture was unavailable.

## 2. Source ledger

| Pass | Media source | Lab result | SHA-256 |
|---:|---|---:|---|
| 1 | [Harvard Health -- Sleeping apart: Good for your sex life?](https://www.health.harvard.edu/healthy-aging-and-longevity/sleeping-apart-good-for-your-sex-life) | 755 words; 22 claims; 0 mapped | `dfc57e1260ea7d88267c4a3eb16dd5130f3b9ca9b5524d3ce51656776000054d` |
| 2 | [Greater Good -- The Surprising Health Boost of Feeling Happy With Someone Else](https://greatergood.berkeley.edu/article/item/the_surprising_health_boost_of_feeling_happy_with_someone_else) | 985 words; 14 claims; 1 mapped | `c9c2ee917b5839e48ef00a8e0f89e7843e28de98d1359be8c2d9a90f388d90e4` |
| 3 | [PsyPost -- How one's own personality predicts long-term relationship satisfaction](https://www.psypost.org/new-psychology-research-reveals-how-ones-own-personality-predicts-long-term-relationship-satisfaction/) | 548 words; 14 claims; 0 mapped | `00bb75d793c113ae8749f310c4191e2398c40ceaae85cea7bbf04ac9d41e3b7b` |
| 4 | [Bankrate -- Financial infidelity survey 2025](https://www.bankrate.com/credit-cards/news/financial-infidelity-survey-2025/) | 1,704 words; 56 claims; 4 mapped | `f0cc09944a2ef17f5e0926f696b129aa918aa72a6c704e53feca2ad476f272c2` |
| 5 | [AP -- What is microcheating?](https://apnews.com/article/microcheating-infidelity-flirting-social-media-3933161a5cd97365e73b133744e4175c) | 779 words; 19 claims; 2 mapped; 2 pressure tests | `dc8fd5073f2c4eceed50b05cf60ca6f71ba9c4642122ca1a8c3db143daf898b5` |
| 6 | [ABC Australia -- Are couples happier sleeping separately?](https://www.abc.net.au/news/2026-03-08/are-couples-happier-sleeping-separately/106382482) | 1,032 words; 30 claims; 0 mapped | `a25ec0e519d32414ab6d073d786d43282a6a2c7b15d227dab385361a040895e2` |
| 7 | [Guardian -- Non-monogamous people as happy in their love lives as traditional couples](https://www.theguardian.com/lifeandstyle/2025/mar/26/non-monogamous-people-relationships-couple-sexual-satisfaction-study) | 483 words; 14 claims; 3 mapped | `b77e3a4047f8afb0766dea0c7d49a1b59180bc29637e9df534bfd107ab4cc56e5` |
| 8 | [Kellogg Insight -- One Key to a Happy Marriage? A Joint Bank Account](https://insight.kellogg.northwestern.edu/article/key-to-happy-marriage-joint-bank-account) | 1,157 words; 31 claims; 3 mapped | `661d8ab1c09ea1ed0089da9d54a9eb83ad1f4486a50ee702cd9fd6b9bdbf86f5` |
| 9 | [AP -- Can a marriage survive a gender transition?](https://apnews.com/article/marriages-gender-transitions-transgender-853ba976a3b28a78fb557ce4d2810578) | 475 words; 21 claims; 1 mapped | `5d43ac9e820fb38f8d544a303c3bb3e9236b00065ed8ece7bd11b150d06b6eff` |
| 10 | [Guardian -- The social shift towards open relationships](https://www.theguardian.com/lifeandstyle/2025/oct/31/open-marriage-relationships-society-trends-therapy) | 343 words; 12 claims; 0 mapped | `74ba0503929ebf5168cc3da5a538cf20e4c2c87b5b591be8e83ee6310ae655e2` |

## 3. Adjudication

### PROMOTE -- The Agreement Surface

A relationship label is a category, not the relationship's full operating agreement. Boundaries may concern sex, romance, disclosure, hierarchy, time, resources, health, and revision. Consent to a structure is not blanket consent to every act commonly associated with that structure.

Primary support:

- [Anderson et al. (2025/2026)](https://pubmed.ncbi.nlm.nih.gov/40126203/) meta-analysis: 35 studies, N = 24,489; no overall monogamy/CNM difference in relationship or sexual satisfaction.
- [Stewart, Stults & Ristuccia (2021)](https://doi.org/10.1007/s10508-021-01919-8): explicit and implicit rules in ten young gay/bisexual male couples.
- [Mogilski et al. (2026)](https://pmc.ncbi.nlm.nih.gov/articles/PMC13048939/): nine maintenance domains developed across N = 429 and N = 4,290.

Boundaries: self-selection prevents causal structure rankings; agreement may still be coerced; revised rules apply prospectively; ordinary life does not require exhaustive pre-authorization.

### PROMOTE -- The Financial Architecture Split

Account topology and financial fidelity are separate variables. Joint, separate, and hybrid accounts describe where money sits. Fidelity turns on whether behavior stays within disclosed and mutually accepted financial rules.

Primary support:

- [Olson et al. (2023)](https://academic.oup.com/jcr/article/50/4/704/7077142): six-wave, two-year randomized trial of 230 engaged/newlywed couples; assigned full pooling sustained initial relationship quality relative to separate/choice conditions.
- [Garbinsky et al. (2020)](https://academic.oup.com/jcr/article/47/1/1/5610529): twelve-study financial-infidelity program defining the construct as expected partner disapproval plus intentional nondisclosure.

Boundaries: the pooling trial sampled willing, young, mostly White, different-sex first-marriage couples and had differential attrition; it does not establish universal full pooling, reject partial pooling, or override contraindications involving coercion, addiction, abuse, or hidden debt.

### PROMOTE -- Co-Transition

One partner's gender transition changes a relationship without making the partners' stakes or authority symmetrical. The transitioning partner owns identity, body, and care. The other partner retains autonomy over consent, attraction, and their own orientation label. Communication and shared decisions about the relationship can be joint; transition itself is not.

Primary support:

- [Van Acker et al. (2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10252506/): nine Belgian partner interviews.
- [Ostrander (2025)](https://pmc.ncbi.nlm.nih.gov/articles/PMC13015039/): twelve couples; grief/ambiguity, partner identity exploration, and stabilization.
- [Theron & Collier (2013)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3696033/): foundational co-transition account among partners of masculine-identifying trans people.

Boundaries: small qualitative convenience samples, often survivor-selected; no survival-rate estimate, causal recipe, or obligation to remain. The framework is specific to gender transition.

### PROMOTE -- Shared Positive Affect

The statistical card records a measured dyadic biomarker association rather than a relationship intervention: shared above-usual positive emotion was associated with lower concurrent and next-assessment cortisol beyond individual affect.

Primary support:

- [Yoneda et al. (2025)](https://doi.org/10.1037/pspp0000564): 321 older cohabiting couples, ages 56-89, across three intensive studies and 23,931 observations; coexperienced positivity on about 38% of occasions together.

Boundaries: observational, older Germany/Canada samples, cortisol is not relationship quality, physical health, or longevity, and temporal ordering is not randomization.

### EXPAND -- The Great Unbundling: the bed is not the bond

The two sleep articles converged on one bounded extension. Bed-sharing bundles sleep and intimacy; couples can route them separately. The evidence is mixed and does not rank shared or separate sleep generally.

Primary support:

- [Andersen et al. (2025)](https://pubmed.ncbi.nlm.nih.gov/40772335/) narrative review.
- [Drews et al. (2020)](https://pubmed.ncbi.nlm.nih.gov/32670111/), 12 couples: more and less-fragmented REM and greater synchronization during co-sleep.
- [Keller et al. (2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6702108/), 179 couples: attachment-dependent sleep-concordance associations.

Boundary: a separate-sleep arrangement can be practical without being relationally superior; mutuality and an explicit replacement channel for intimacy matter.

### EXPAND -- relationship quality / Personality matters

The nine-year actor-partner study sharpens an existing distinction instead of earning a standalone framework. Own lower neuroticism and higher conscientiousness were associated with own satisfaction; partner effects were not detected.

Primary support:

- [Bach, Koch & Spinath (2025)](https://doi.org/10.1016/j.paid.2024.112887): 972 people / 486 different-sex German couples, three cohorts, nine years.

Boundary: survivor cohorts, brief personality inventory, single-item satisfaction, attrition, and observational design. "No partner effect here" is not "partner personality never matters."

## 4. Holds and mergers

- **Sleep-Intimacy Split:** HOLD as standalone; merged into the Great Unbundling.
- **Actor-Trait Asymmetry:** HOLD as standalone; merged into the relationship-quality statistic and Personality matters.
- **Microcheating:** HOLD as a media term; its useful mechanism merged into the Agreement Surface.
- **Structure-Satisfaction Separation:** retained as a measured subclaim inside the Agreement Surface, not a fifth framework.
- **Financial Pooling Effect / Privacy-Secrecy Split:** merged into one Financial Architecture Split so account arrangement and concealment remain visibly separate.

## 5. Instrument findings

- The mapper dropped the core shared-positive-affect/cortisol claims under `no-human-relational-frame` despite an explicitly dyadic source.
- Displayed mappings repeatedly attached nearby relationship language to unrelated canon surfaces, including height preference and Body Count.
- All four promoted mechanisms were effectively invisible to retrieval even though the media suite contained many claim-like units.
- No engine thresholds, floors, frozen benchmarks, or gate rules are changed by this doctrine run. The failures are recorded for a later engine-specific task.

## 6. Implemented surfaces

- `frameworks.html`: Agreement Surface, Financial Architecture Split, Co-Transition.
- `statistics.html`: Shared Positive Affect card; actor/partner personality clarification.
- `dd-relationships-throughout-history.html`: "The bed is not the bond" Great Unbundling record.
- `lexicon.html`: actor/partner refinement on Personality matters.
- `data/canon-overlay.json`: aliases, phrases, boundaries, misreadings, pressure tests, and related surfaces for all additions and expansions.
- `data/le-canon-index.json`: rebuilt from canon sources after implementation.

All promoted or materially expanded doctrine carries a `.lab-stamp` provenance chip.

## 7. Verification

- Canon index: 536 -> 540 concepts, 19 source pages.
- Threshold sweep: 2,452 passages x 540 entries; 0 pending `minCredibleScore` crossings and 0 pending `minWeakScore` crossings. The 5,009 pending candidate-floor rows are the required census lane, not verdict work.
- `npm run test:all`: PASS -- Lab suite 18/18, SMV calibration panel green, matchmaker verifier green.
- Automated `lab_ui_audit.py` and `site_integrity_audit.py` passed inside the Lab suite. The optional in-app visual browser check could not start because the Windows ACL sandbox helper failed before browser initialization.
