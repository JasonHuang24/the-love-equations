# Doctrine Harvest #2 ? retention media suite

**Date:** 2026-07-31
**Surface:** `frameworks.html`, `lexicon.html`, `dd-relationships-throughout-history.html`
**Status:** IMPLEMENTED. Canon 532 ? 536; aggregate site gate green.

---

## 1. Run

The LE Lab was exercised against eight mixed media articles covering household mental load,
sexual desire, relationship structure, relationship cycling, relationship clarity, relationship
anarchy, and authenticity/burnout.

- 11,689 source words
- 232 retained claims
- 41 mapped
- 191 unmapped
- 17.7% aggregate mapping
- 9 pressure tests

Low coverage was useful here: it produced a candidate pool instead of forcing unfamiliar claims
into adjacent canon.

## 2. Rulings

| Candidate | Ruling | Result |
| --- | --- | --- |
| Ownership / cognitive household load | **PROMOTE** | New framework + Lexicon term |
| Spontaneous vs responsive desire; desire discrepancy as dyadic | **PROMOTE** | New framework + expanded Desire definition |
| Household is not the couple / living apart together | **EXPAND** | Great Unbundling record + Lexicon term |
| Relationship cycling | **DUPLICATE** | Already covered by `statistics:stat-cycling` |
| Relationship clarity | **DUPLICATE / retrieval miss** | Existing clarity and Option Pool doctrine already cover it |
| Relationship anarchy | **ABSORB** | Mostly an instance of the Great Unbundling; no standalone framework |
| Authenticity burnout | **HOLD** | Overlaps the Sham and honesty material; evidence too thin for doctrine |

## 3. What entered doctrine

### The Ownership Load

Doing a task and owning it are separate ledgers. Ownership is the anticipating, deciding,
arranging, remembering, and monitoring work around execution. The operational test is what
happens without a reminder.

Evidence spine:

- Petts, Carlson & Wong (2025), *Journal of Marriage and Family*, different-gender partnered
  US parents, N = 2,737: equal cognitive-housework division associated with the highest
  relationship satisfaction for mothers and fathers.
- Coundouris & Henry (2026), *Scientific Reports*: physical, cognitive, and emotional household
  load measured dyadically; disagreement about equality related to poorer relationship quality.
  The journal currently labels the paper an unedited early-access manuscript.
- Harris, Gormezano & van Anders (2022), *Archives of Sexual Behavior*, N = 677 and 396:
  larger household-labor shares associated with lower partner desire through perceived
  unfairness and perceiving the partner as dependent.

Boundary: all are self-report and non-experimental; samples concentrate on different-gender
parents or heterosexual cohabitors. The association is Tier 2. The execution/ownership test is an
LE Lens. Fairness is not forced 50/50.

### The Desire-State Split

Desire can arrive spontaneously before erotic context or responsively after willingness,
attention, and rewarding stimulation begin. A difference between partners is a dyadic
discrepancy, not proof that the lower-desire partner is defective.

Evidence spine:

- Basson (2002), *Journal of Sex & Marital Therapy*: the responsive-cycle model.
- Jodouin et al. (2021), *Archives of Sexual Behavior*, 229 couples, 35-day diary plus
  12 months: discrepancy predicted next-day and later sexual distress; reverse paths were
  nonsignificant.
- Girouard et al. (2025), *International Journal of Clinical and Health Psychology*,
  56-day clinical diary, N = 229 individuals: daily stress covaried with both partners'
  desire, satisfaction, and distress.

Boundary: responsive desire requires genuine willingness and room to stop. It is not consent by
instalments. Basson's model centres women; the stress study centres couples coping with sexual
interest/arousal disorder; no universal sequence or frequency is claimed.

### The household is not the couple

Living apart together (LAT) is a measured case where partnership and residence are separate.

Evidence spine:

- Hu & Coulter (2025), *The Journals of Gerontology: Series B*, UKHLS 2011?2023,
  93,885 observations of 15,237 adults aged 60?85: mental health was better while LAT than
  while single, with little overall difference among LAT, cohabiting, and married states.
  Entry gains and exit declines differed by arrangement.

Boundary: this is an older-adult UK result. Fixed effects reduce stable selection but do not
randomise residence. The result does not show that living apart is generally better.

## 4. Website implementation

- Added Rules & Frameworks entries 24 and 25: `#desire-state-split` and `#ownership-load`;
  renumbered later TOC entries without changing anchors.
- Added Lab provenance stamps to both new frameworks and both new Lexicon artifacts.
- Expanded `term-desire`; added `term-the-ownership-load` and
  `term-living-apart-together-lat`.
- Added the `#household-is-not-the-couple` record inside the Great Unbundling deep dive.
- Added aliases, related concepts, boundaries, common misreadings, and pressure tests for all
  four new canon concepts.
- Added real-canon retrieval probes for representative ownership, responsive-desire, and LAT
  claims.

## 5. Lab effects

- Canon: 532 ? 536 concepts across the same 19 source pages.
- Rules & Frameworks: 47 ? 49.
- Lexicon: 93 ? 95.
- Final sweep: 2,452 retained passages ? 536 entries = 1,314,272 pairs.
- Neighbor band: 117,749 pairs.
- Pending credible crossings: **0**.
- Pending weak crossings: **0**.
- Candidate-floor census: 5,009 rows; census only, not adjudicable.
- The pinned Availability score moved 0.537 ? 0.538; its admission guard still blocks it.
- No thresholds, scoring constants, analyzer logic, or benchmark floors changed.

## 6. Verification

`npm run test:all` passed:

- LE Lab: 18/18 checks
- SMV calibration panel: all fixtures and structural assertions
- Matchmaker verifier: all checks

The final generated canon version is `1.0.0+5f3e2582dc8e`.
