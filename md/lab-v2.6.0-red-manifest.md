# LE Lab v2.6.0 — RED manifest (commit 1 of 5)

The frozen state of `tests/fixtures/tokenizer-benchmark.json` and
`tests/fixtures/threshold-neighbors.json` **before** any production code changed. Every row below is
what the shipped analyzer actually did, measured on this machine at this commit, not predicted from
the review.

```
analyzer ............ 2.5.0
analysis schema ..... le-lab.analysis/2.5
scoringConfigHash ... 1qt8p4u
canon index ......... 1.0.0+949aef381d5f  (le-canon-index/1.1, 450 concepts, 19 sources)
commit .............. a878753
```

## Provenance

This pass answers the **DESIGN** ruling from Sol's break-it review of v2.5.0 — §3, *repair
tokenization centrally; do not patch only `distinctiveBoost`* — and the two mechanical bins his
stance and co-fire tables produced. It also closes v2.5.0 §7.2, which named the degenerate stem
**"the highest-value item on this list"** and deferred it on the grounds that the general fix moves
scores corpus-wide. This release is allowed to move scores; that is what it is for.

**Every number in Sol's review reproduces to the decimal.** Verified before a fixture was written:

| Sol's figure | Measured here |
|---|---|
| 450 canon entries | 450 |
| 108 entries carrying ≥1 one- or two-character derived stem | 108 |
| 19 raw-token mappings producing 16 distinct degenerate stems | 19 / 16 |
| `re` 3.976 · `st` 4.914 · `vi` 4.714 · `n` 5.502 · `r` 5.725 · `f` 6.013 | identical |
| `really` variant: raw 0.300, shared `[re, provider]`, qc 0.212, cc 0.111, boost 0.090, no penalty | identical |
| `just` control: raw 0.156, shared `[provider]`, qc 0.133, cc 0.063, boost 0.045, sparse ×0.52 | identical |
| OkCupid → `M-TBD-41` at 0.263 | 0.263 |
| 103 archived v2.5 passages × 450 entries = 46,350 pairs | 46,350 |

The corpus population needs one note. Sol swept **103** passages; `detectClaimUnits` produces **276**
units across the three sources, of which 173 are set aside by the domain gate. Retrieval genuinely
does not run on a set-aside passage — `analyzeDocument` scores a unit only after the gate retains it
— so sweeping all 276 would measure numbers the product never computes and inflate every census by
about 1.7×. Sol's population is the correct one and this pass uses it.
`tools/lab-threshold-sweep.mjs --include-set-aside` produces the wider view for anyone who wants it.

`npm run test:lab` **FAILS at this commit**, by design:

```
tests/lab-intake.test.mjs ................ 28 pass / 0 fail
tests/lab-analyzer.test.mjs .............. 44 pass / 0 fail
tests/lab-domain-benchmark.test.mjs ....... 3 pass / 0 fail   (152 cases, 1.000 / 1.000 / 0.821)
tests/lab-match-behavior.test.mjs ......... 9 pass / 0 fail   ← co-fire, stance, typed-alias floors
tests/lab-export.test.mjs ................. 8 pass / 0 fail
tests/lab-ledger.test.mjs ................. 5 pass / 0 fail
tests/lab-feedback.test.mjs .............. 24 pass / 0 fail
tests/lab-feedback-integrity.test.mjs .... 25 pass / 0 fail
tests/lab-canon-mapping-benchmark.test.mjs  4 pass / 0 fail
tests/lab-short-utterance.test.mjs ........ 8 pass / 0 fail
tests/lab-tokenizer.test.mjs .............. 2 pass / 4 fail   ← NEW
  tokenizer fixture is structurally sound .................. PASS
  stemming never produces a fragment shorter than the concept  FAIL  (19 of 32 cases)
  a valid three-character stem keeps its whole family ....... PASS  ← floor, must stay green
  a degenerate stem moves four scoring mechanisms, not one .. FAIL  (all four)
  no shortened fragment enters the canon index .............. FAIL  (19 raw tokens)
  the collision dies and the concepts do not ................ FAIL  (7 of 7 assertions)
```

The suite short-circuits at `lab-tokenizer`, so the six checks after it are unrun rather than
failing. Each was run by hand at this commit and is green:

```
tests/lab-threshold-neighbors.test.mjs .... 2 pass / 0 fail   ← NEW, pinning, green by construction
tests/canon-index-fixtures.mjs ........... 450 concepts, 19 sources, 2 typed-alias entries
scripts/validate-canon-index.mjs ......... 1.0.0+949aef381d5f
tools/lab_release_audit.py ............... PASSED (10 modules, 16 edges, 2 resources, v=2.5.0)
tools/lab_ui_audit.py .................... PASSED (151 IDs, 29 ARIA refs, 9 labels, 33 buttons)
tools/site_integrity_audit.py ............ PASSED (24 HTML files, 508 local targets)
```

**The new tests are placed after the existing ones on purpose.** A RED block that short-circuits the
suite before the floors have reported is a RED block nobody can read. This ordering makes the freeze
say "158 green, then four new failures", which is the claim.

---

## Block A — tokenizer degeneracy (19 of 32 RED)

The rule as shipped: `tokenize` filters `length > 1` **before** stemming and never re-checks
afterwards, so a six-letter content word can leave the tokenizer as one character.

| Case | Word | Expected | **Observed at freeze** |
|---|---|---|---|
| tk-01 | `really` | filtered | **`re`** |
| tk-02 | `stable` | `stable` | **`st`** |
| tk-03 | `viable` | `viable` | **`vi`** |
| tk-04 | `visible` | `visible` | **`vi`** |
| tk-05 | `national` | `national` | **`n`** |
| tk-06 | `rational` | `rational` | **`r`** |
| tk-07 | `users` | `users` | **`us`** |
| tk-08 | `using` | `using` | **`us`** |
| tk-09…tk-19 | `bring` `fable` `going` `lament` `lying` `moment` `moments` `peers` `table` `thing` `tying` | themselves | **`br` `f` `go` `la` `ly` `mo` `mo` `pe` `t` `th` `ty`** |
| tk-20…tk-32 | `dating` `dates` `daters` `fixed` `fixes` `sexes` `sex` `paying` `payers` `men` `age` `AI` `SMV` | `dat` `dat` `dat` `fix` `fix` `sex` `sex` `pay` `pay` `men` `age` `ai` `smv` | identical — **GREEN controls** |

**The controls are the argument for three rather than four.** A four-character derived floor would
destroy `dat`, `fix`, `sex` and `pay` — four working families, to fix nineteen broken tokens. An
original-token floor catches nothing: `really`, `stable`, `viable`, `national` and `rational` all
enter long. A stem-in-stopword test misses `re`, `st`, `vi`, `us`, `n`, `r` and `f`. Dropping the
token outright erases `stable`, `viable` and `visible`, which are real concepts in this canon.
Fallback to the surface form is the only rule that separates all four cases, which is why it is the
rule and not a preference.

**`men`, `age`, `AI` and `SMV` are the other half of that.** Two and three characters, untouched,
because nothing was stemmed away from them. The floor applies to a token the stemmer *shortened*,
never to a token that arrived short.

**Two accepted costs, recorded rather than discovered later.** `moment`/`moments` and `peer`/`peers`
unify at freeze only because both halves collapse onto a fragment — and that fragment also swallows
everything else ending the same way. After the fix each is its own token and the families split. The
trade is a false unification for a missed one, on two families, against nineteen fragments carrying
IDF up to 6.013.

## Block B — component isolation (RED on all four mechanisms)

Two sentences differing by one intensifier. `just` is already a stopword; `really` is not.

| | ci-01 `really` | ci-02 `just` |
|---|---|---|
| raw score | **0.300** | 0.156 |
| shared | **`[re, provider]`** | `[provider]` |
| `queryCoverage` | **0.212** | 0.133 |
| `canonCoverage` | **0.111** | 0.063 |
| `distinctiveBoost` | **0.090** | 0.045 |
| sparse-shared penalty | **avoided** | ×0.52 |

**This is the block that kills the narrow fix.** v2.5.0 §1.4 patched the degenerate stem *locally*,
inside co-fire, with `minCoFireConceptLength: 4`. That guard is still in the tree and still correct,
and it does nothing at all here: neither occurrence is promoted in either sentence, and the score
still nearly doubles. `distinctiveBoost` accounts for 0.045 of a 0.144 gap. The other 0.099 is the
two coverage ratios and a penalty that stopped applying because a fragment counted as a second shared
token.

The expected post-fix state is stated as a **mechanism, not a number**: the two variants must score
*identically*, share exactly `[provider]`, and both carry the sparse-shared penalty. The absolute
value is deliberately not pinned, because this fix legitimately moves the index-wide IDF that both
scores are computed against, and a pinned number would be a threshold assertion wearing a fixture's
clothes.

## Block C — index/IDF provenance (19 raw tokens RED)

| | |
|---|---|
| entries | 450 |
| entries carrying ≥1 degenerate stem | **108** (24%) |
| raw-token mappings producing one | **19** |
| distinct degenerate stems | **16** — `br f go la ly mo n pe r re st t th ty us vi` |

| Original | Stem | Entries with original | DF | IDF |
|---|---|---|---|---|
| `really` | `re` | 18 | 22 | 3.976 |
| `going` | `go` | 19 | 28 | 3.744 |
| `thing` | `th` | 18 | 18 | 4.167 |
| `moment` | `mo` | 17 | 18 | 4.167 |
| `visible` | `vi` | 8 | 10 | 4.714 |
| `stable` | `st` | 8 | 8 | 4.914 |
| `table` | `t` | 7 | 7 | 5.032 |
| `users` | `us` | 6 | 16 | 4.278 |
| `using` | `us` | 4 | 16 | 4.278 |
| `national` | `n` | 4 | 4 | 5.502 |
| `bring` | `br` | 3 | 3 | 5.725 |
| `rational` | `r` | 3 | 3 | 5.725 |
| `viable` | `vi` | 3 | 10 | 4.714 |
| `fable` | `f` | 2 | 2 | 6.013 |
| `moments` | `mo` | 2 | 18 | 4.167 |
| `peers` | `pe` | 2 | 2 | 6.013 |
| `lament` `lying` `tying` | `la` `ly` `ty` | 1 each | 1 | 6.418 |

**The rule is stated over raw tokens, not over the finished sets, and that is load-bearing.** `go`,
`us` and `ai` are legitimate two-character *originals* that must survive; `going`, `users` and `using`
collapsing onto them must not. A test that scanned `_tokens` for short entries could not tell those
apart — the DF column shows exactly that damage, where `us` carries 16 documents against 10 that
actually contain `users` or `using`. Asking the question at the point of transformation is the only
way to ask it correctly.

## Block D — retrieval guards (7 of 7 RED)

Both directions, because either alone would be easy and wrong.

| Case | Pair | Expected | **Observed at freeze** |
|---|---|---|---|
| rg-01 | `OkCupid, eharmony and Hinge…dating users` → `M-TBD-41` | `us` not shared; below `minWeakScore` | **0.263, shared `[dat, us]`, admitted weak** |
| rg-02 | `A stable relationship…` → `smv:money` | shares `stable` | **shares `st`** (0.377) |
| rg-03 | `…only a handful are viable partners…` → `frameworks:option-pool` | shares `viable` | **shares `vi`** (0.211) |
| rg-04 | `The options visible in her feed…` → `frameworks:option-pool` | shares `visible` | **shares `vi`** (0.325) |
| rg-05 | `Most dating app users report…` → `statistics:stat-pay-to-play` | shares `users` | **shares `us`** (0.443) |
| rg-06 | `The risk…is using early rejection as proof…` → `gender-dynamics:gd-male-window` | shares `using` | **shares `us`** (0.636) |

**rg-01 is verbatim corpus text**, from `01-pew-online-dating.txt`: a sentence about app market share,
matched to a mythbuster ruling on whether dating for financial potential pays off. `dat` is a real
overlap and stays. `us` is `users` pretending to be a concept, and it is the entire reason the pair
clears the weak line.

**rg-03 and rg-04 are the same target entry.** `viable` and `visible` are one token at freeze. After
the fix they are two, and each still has to find the entry that uses it — which is the assertion that
separates "removed the collision" from "removed the concept".

**rg-05 is the other side of rg-01.** `users` genuinely appears in `stat-pay-to-play`. The fragment
must die without taking the word with it.

The guards assert **token identity, not a score band**, for the same reason Block B does.

---

## The threshold-neighbour band — pinned, not asserted

`tests/fixtures/threshold-neighbors.json`, generated by `tools/lab-threshold-sweep.mjs`:

```
population   retained (103 passages x 450 entries = 46,350 pairs)
band         ±0.03
in band      4,160 pairs
  candidateScoreFloor 0.08 .... 3,260
  minWeakScore        0.25 ....   830
  minCredibleScore    0.43 ....    70
rulings      {} (empty)
```

Sol's three predicted credible gains are in it and visible: `statistics:stat-why-single` 0.427,
`statistics:stat-attention` 0.427, `statistics:stat-app-reasons` 0.426, alongside
`stat-pay-to-play` at 0.425/0.424 and `M-TBD-32`/`M-TBD-17` at 0.427/0.426 — a band dense enough that
which three actually cross is a measurement, not a prediction.

**This fixture pins SIDES, not scores.** A pair that changes which side of a line it sits on fails the
test unless a human ruling for it exists in the `rulings` map. Pinning 4,160 exact numbers would fail
on every honest change and teach people to regenerate without looking; pinning the crossing makes
adjudication mandatory and everything else free. It is green at this commit by construction — nothing
has moved yet — and it is the mechanism that will refuse commit 2 until Jason has ruled.

**The fixture carries no corpus prose.** `lab-corpus/` is gitignored third-party text (md/RERUN.md
§1), so the band stores content-derived unit IDs and scores only. Excerpts appear in the human
adjudication sheet, where judgment actually needs them. The test **skips with a stated reason** when
the archive is absent, so a clone without it can still run the suite.

---

## What must not move

- The **152-case domain benchmark** at 1.000 precision / 1.000 recall. The third metric may move up only.
- The **10 misreading-polarity** cases, the **13 typed-alias** cases, the **6 contextual co-fire** cases
  and the **12 stance-composition** cases — all green at this commit.
- The **short-utterance matrix** and the empty canon-mapping benchmark.
- **No existing `SCORING_CONFIG` value changes.** This pass moves scores, not thresholds. Additive
  keys are permitted and reported; a threshold retuned to un-cross a pair is not, and the adjudication
  sheet exists precisely so that temptation has a legitimate alternative.
- The **normalized-source and privacy contracts**, and worker/fallback parity.

## Commits after this one

2. Tokenizer fix at `tokenize`/`prepareCanonIndex` + the threshold adjudication sheet. **Halts pending
   Jason's rulings**; commit 3 is independent and proceeds in the meantime.
3. Bin-1 mechanical fixes — five implementation defects from Sol's stance and co-fire tables, RED first.
4. Bin-2 documented limits — twelve structural cases frozen asserting current behavior, plus the
   clause-approximation limit statement and the feedback routing that turns a limit hit into evidence.
5. v2.6.0 release: schema `le-lab.analysis/2.6`, cache-busters, corpus re-run, SHA-256 manifest, and
   the reproducible canon `generatedAt` carried over from v2.5.0 §7.6.
