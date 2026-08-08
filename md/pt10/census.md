# PT10 census — what the archive could see, before and after

Two instruments, both run over the manifest's own swept population
(`sourceFile != null`), so "the corpus" here is exactly what
`tools/lab-threshold-sweep.mjs` sweeps.

## 1. Whole-archive surface counts

21 sources / 125,345 words → 29 sources / 172,427 words (+37.6% words).
`srcs` is how many sources carry a nonzero count.

| surface | before | after | Δ | srcs before → after |
|---|---:|---:|---:|---|
| U+2019 (typographic apostrophe) | 602 | 1,369 | +767 | 12/21 → 20/29 |
| curly quotes ‘ “ ” | 272 | 520 | +248 | 12/21 → 19/29 |
| – — … | 189 | 424 | +235 | 12/21 → 18/29 |
| contractions, ASCII `'` | 329 | 871 | +542 | 14/21 → 17/29 |
| contractions, curly `’` | 486 | 1,241 | +755 | 12/21 → 20/29 |
| negated contractions, ASCII | 18 | 231 | +213 | 4/21 → 7/29 |
| negated contractions, curly | 17 | 231 | +214 | 6/21 → 14/29 |
| questions (`?`) | 97 | 420 | +323 | 17/21 → 25/29 |
| bare numeric list markers | 63 | 109 | +46 | 7/21 → 10/29 |
| bullet list markers | 13 | 81 | +68 | 4/21 → 6/29 |
| **NBSP (U+00A0)** | **0** | **0** | **0** | **0/21 → 0/29** |
| **format chars (ZW*, SHY, WJ, BOM)** | **0** | **0** | **0** | **0/21 → 0/29** |
| second person | 85 | 1,955 | +1,870 | 13/21 → 21/29 |
| first person singular | 225 | 1,455 | +1,230 | 11/21 → 19/29 |
| marry/married/marries/marrying | 189 | 210 | +21 | 15/21 → 19/29 |
| date/dated/dates/dating | 148 | 175 | +27 | 17/21 → 24/29 |
| possessives | 739 | 1,240 | +501 | 21/21 → 29/29 |
| word-spelled statistics | 306 | 376 | +70 | 19/21 → 24/29 |
| **RTF preamble** | **0** | **0** | **0** | **0/21 → 0/29** |

## 2. The acceptance test — density, per 10,000 words

Raw counts flatter a bigger corpus. This is the honest form: the same surface
per 10k words in the old corpus (01–22, 125,345 words) and in the pt10 tranche
alone (23–30, 47,082 words), with the surface forms copied from the fix sites
in `js/lab-analyzer.js` rather than invented.

| pt09 fix / surface | old | /10k | pt10 | /10k | pt10 srcs |
|---|---:|---:|---:|---:|---:|
| v2.6.21 #15 seven cue regexes admit U+2019 | 17 | 1.4 | 214 | **45.5** | 8/8 |
| v2.6.21 #6 generic cue ladder polarity (denials) | 92 | 7.3 | 397 | **84.3** | 8/8 |
| v2.6.21 #9 hypothetical / interrogative cues | 97 | 7.7 | 323 | **68.6** | 8/8 |
| v2.6.24 possessives contribute their noun | 739 | 59.0 | 501 | **106.4** | 8/8 |
| v2.6.23 bare list markers open a unit | 63 | 5.0 | 46 | **9.8** | 3/8 |
| v2.6.14 / 959d32c gate inflections (date family) | 20 | 1.6 | 15 | **3.2** | 3/8 |
| reader register — second person | 85 | 6.8 | 1,870 | **397.2** | 8/8 |
| v2.6.21 #11 decimals + abbreviation periods | 1,735 | **138.4** | 10 | 2.1 | 4/8 |
| v2.6.21 #12 statistics spelled in words | 243 | **19.4** | 17 | 3.6 | 3/8 |
| v2.6.22 marry conjugation in CLAIM_CUES | 149 | **11.9** | 19 | 4.0 | 4/8 |
| v2.6.21 #3/#5 NBSP + format characters | 0 | 0.0 | 0 | **0.0** | 0/8 |
| v2.6.21 #8 RTF destination groups | 0 | 0.0 | 0 | **0.0** | 0/8 |

**Newly exercised** (the corpus would now see the defect): U+2019 in cue
regexes (32× denser), cue-ladder polarity (11.6×), interrogative cues (8.9×),
possessives (1.8×), list markers (2×), the date inflections (2×) — and the
register shift itself, second person at 58× density.

**Already covered, and the pt09 §6 blanket needs narrowing:** decimals and
abbreviation periods (138/10k), word-spelled statistics (19/10k) and the marry
inflections (12/10k) were all *denser in the academic corpus than in reader
text*. Those three fixes moved zero corpus rows for some other reason than
blindness — a future engine session should not spend its budget re-widening for
them.

**Still uncovered:** NBSP, zero-width and other format characters, and RTF
destination groups. Both have causes in the acquisition chain rather than in
the sources — findings F1 and F2.

## 3. What the gate does with reader-shaped text

Same population construction as the sweep (shipped gate, canon admission
surfaces). `claim%` = claim-like ÷ units; `keep%` = swept ÷ claim-like.

| | units | claim-like | binned | swept | claim% | keep% |
|---|---:|---:|---:|---:|---:|---:|
| OLD 01–22 (academic + newsroom) | 7,512 | 5,026 | 2,601 | 2,425 | 66.9 | **48.2** |
| PT10 23–30 (reader-shaped) | 3,863 | 2,342 | 1,544 | 798 | 60.6 | **34.1** |

Per source, the tranche ranges from 13.3% (Slate chat) to 44.2% (LoveShack
"always the dumpee"). Spot-checked against source 27's binned units: the
binning is **correct**, not a defect — reader discourse is mostly narrated
particulars ("We both go to the gym 4–5 times per week", "This was on Friday
night"), which is exactly what the gate exists to set aside. The number to
carry forward is that a reader's paste yields roughly two thirds set-aside
where a research paper yields half.

## 4. Population and band

| | before | after |
|---|---:|---:|
| swept sources | 21 | 29 |
| swept passages | 2,425 | 3,223 (+798, +32.9%) |
| dump pairs ≥ 0.02 | 481,851 | 622,625 |
| frozen band pairs | 130,744 | 187,919 |
| rulings | 36,320 | 36,320 (0 added, 0 changed) |
| pending — credible / weak / candidate-floor | 0 / 0 / 29,242 | 0 / 0 / 29,242 |
| corpus epoch | `421b1f5b859073c1` | `9429b35a081698e6` |

**Additivity, measured not assumed.** Dump-to-dump over all 481,851
pre-existing pairs: **0 moved, 0 disappeared**, 140,774 new. Over the 130,744
previously frozen band pairs: **0 moved, 0 lost**. `prepareCanonIndex` derives
IDF from the canon, so adding sources cannot move an existing pair — verified
first on source 23 alone (0 moved) before the other seven were added, per the
run's stop condition. Of the new pairs, 56,378 sit above `candidateScoreFloor`,
7,573 above `minWeakScore`, 337 above `minCredibleScore`; none is a crossing —
a pair from a source that was never swept was never measured, and absence from
a baseline means "never measured", not "scored zero" (`md/lab-history.md`,
`# lab-threshold-sweep-widening.md`). The band was therefore regenerated with
`--neighbors` and **no** `--baseline`, exactly as the 2026-07-30 widening was.
