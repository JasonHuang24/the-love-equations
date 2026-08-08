# Corpus pressure test 10 — widening the instrument toward reader-shaped text

**Lane:** single-session run (Claude Opus 5, reasoning high), this checkout on
`main`. Baseline `main` @ 7d41254 (v2.6.24), suite 18/18, canon 579, 21 swept
corpus sources, everything pushed. **No engine edit, no canon edit, no
threshold change, no ruling entered.**

**Why:** pt09 §6. Eleven engine bugs were fixed across v2.6.21–v2.6.24 and
every one of them moved zero corpus rows, because a 21-source archive of
clean-ASCII academic and newsroom prose cannot exercise the surfaces readers
actually type. The corpus is the site's eyes, and it was blind exactly where
readers live.

## 1. What was added — eight sources, ids 23–30

47,082 words across five registers, chosen for balance rather than volume; the
largest is 34% of the tranche and smaller than the corpus's existing largest
source. Per-source provenance, SHA-256s and the verbatim extraction command are
in `lab-corpus.manifest.json` (committed; the text is not, per RERUN §1).

| id | register | words | grade |
|---|---|---:|---|
| 23-slate-prudence-chat | advice **chat transcript**, two columnists | 1,386 | A |
| 24-guardian-ask-philippa | **advice column**, sub-edited broadsheet | 858 | A |
| 25-guardian-philippa-comments | **comment section**, 251 comments on 24 | 17,899 | A− |
| 26-captain-awkward-1455 | **advice blog**, long second-person reply | 1,216 | A |
| 27-loveshack-defensive-partner | **forum thread**, multi-poster | 4,299 | A |
| 28-loveshack-always-the-dumpee | **forum thread**, multi-poster | 4,498 | A |
| 29-dearwendy-too-much-messaging | **advice column**, informal US | 1,036 | A |
| 30-alabama-marriage-handbook | **word-processor / print reader handbook** | 15,890 | B |

Sources 24 and 25 are deliberately paired: the same letter, once in sub-edited
broadsheet register and once in 251 readers' unedited replies to it.

Chains, all reproducible from the raw capture plus the recorded command:
grade **A** = archived raw HTML → `tools/extract-source-text.mjs` with recorded
container/`--drop`/`--cut` arguments. Grade **A−** = source 25 only: the
Guardian discussion API's two JSON pages → a body-concatenation one-liner
recorded verbatim in the manifest (bodies only, in thread order, replies inline
after their parent — **no usernames, no timestamps, no scores**) → the same
committed extractor. Grade **B** = archived raw PDF → `pdftotext -enc UTF-8
-nopgbrk` → CRLF→LF, the house PDF chain.

`CLAIMS.md` records every candidate that was rejected and why — eleven of them,
seven bot-walled.

## 2. The measurement — a widening is additive, and it was proved twice

- **Source 23 alone, first, as the stop condition.** Dump-to-dump against the
  pre-change baseline: 481,851 pre-existing pairs, **0 moved, 0 disappeared**;
  1,756 new pairs. IDF is derived from the canon, not the corpus, so adding
  sources cannot move an existing pair — verified rather than assumed before
  the other seven were archived.
- **All eight.** 2,425 → 3,223 swept passages (+32.9%); pre-existing pairs
  **0 moved, 0 disappeared**; 140,774 new pairs.
- **The band**, regenerated with `--neighbors` and **no `--baseline`** (the
  2026-07-30 widening's precedent — a pair absent from a baseline was never
  measured, not scored zero): 130,744 → 187,919 pairs, and of the 130,744
  previously frozen pairs **0 moved, 0 lost**. Rulings byte-identical at
  36,320: **0 added, 0 changed**. Pending unchanged at 0 credible / 0 weak /
  29,242 candidate-floor census. The retired epoch `421b1f5b859073c1` went into
  `corpusEpochHistory` carrying 36,320 rulings; the corpus is now
  `9429b35a081698e6`, 29 sources.

**Nothing is awaiting Jason.** No weak or credible crossing was produced, so no
verdict was needed and none was entered.

## 3. The acceptance test — which fixes the corpus can now see

Full tables in `census.md`. Density per 10,000 words, old corpus vs the pt10
tranche:

**Newly exercised** — U+2019 in the seven cue regexes 1.4 → **45.5** (the
v2.6.21 headline, the curly apostrophe that flipped "source overreach" to "LE
limitation"); denial cues for the polarity-blind ladder 7.3 → **84.3**;
questions for the interrogative-cue guard 7.7 → **68.6**; possessives 59 →
**106**; bare list markers 5.0 → **9.8**; the `date` inflections 1.6 → **3.2**.
Second person — the register itself — 6.8 → **397**, a 58× shift on a 37.6%
increase in words.

**Already covered, so pt09 §6 needs narrowing** (finding F3): decimals and
abbreviation periods (138/10k), word-spelled statistics (19/10k) and the
`marry` conjugation (12/10k) were all *denser in the academic corpus*. Three of
the eleven zeroes have some cause other than blindness.

**Still uncovered:** NBSP, zero-width and format characters, RTF destination
groups — and in both cases the cause is the acquisition chain, not the sources
(findings F1 and F2). The extractor deletes every NBSP a page carries (source
27: 136 in the raw capture, 0 in the archived text), and the sweep's
`format: 'auto'` cannot sniff `{\rtf`, so an archived RTF would be swept as
prose and never reach the fix.

## 4. Findings recorded, not fixed

Six, with repros, in `findings.md`: **F1** the extractor erases NBSP (and a
`--keep-nbsp` flag would archive blank-line noise, not the defect — measured
before recommending) · **F2** `detectTextFormat` has no `{\rtf` content sniff,
so the RTF fix is unreachable from any corpus source · **F3** three of pt09's
eleven zeroes are not corpus blindness · **F4** the gate keeps 34.1% of
reader-shaped claim-like units against 48.2% of academic ones, and spot-checks
say it is right to · **F5** Reddit, Ask MetaFilter and five more are bot-walled
from this environment — a standing constraint on the corpus programme, not a
one-run accident · **F6** the chat register is the least canon-legible thing in
the tranche at 13.3% retention, and it is what a live Lab user is most likely
to paste.

## 5. Verification

Suite **18/18, exit code 0** (read, not grepped) on the final tree; the runner
banner named `main 7d41254 · dirty`. The threshold test ran with **0 skipped**
— corpus present, all four assertions live — and printed
`adjudication: 0 credible (blocking) · 0/0 weak (ratchet) · 29242
candidate-floor (census, not adjudicable)`. The gate benchmark is unmoved at
196 cases · domainRecall 1.000 · ignorePrecision 1.000 · junkRecall 0.854, and
knownSplits and WEAK_BACKLOG_CEILING 0 both stand — no benchmark fixture and no
assertion value was edited.

## 6. What this run deliberately did NOT do

- **No engine edit.** F1 and F2 both have obvious one-line fixes; neither was
  written. A corpus run that also patches the engine cannot report a clean
  additivity measurement.
- **No `--keep-nbsp` flag on the extractor**, though it was the first instinct:
  measured first, and the NBSPs a real forum page carries are blank-line
  spacers, so the flag would have bought noise and called it coverage.
- **No canon, doctrine, overlay or site-page edit**, and no rewording of
  anything for matcher score.
- **No ruling, and no `--baseline` on the regeneration** — the alternative was
  available and would have entered ~64,000 fictional crossings.
- **No push.** Awaits Jason's in-session confirmation.
- **No re-analysis of the eight sources into `lab-corpus/exports/`.** The older
  sources carry export JSON at v2.6.0/v2.6.1; these eight carry none, so the
  archive is not single-version by the RERUN §6 test — it already was not, and
  this run widened the gap rather than closing it. Recorded here rather than
  half-done.
