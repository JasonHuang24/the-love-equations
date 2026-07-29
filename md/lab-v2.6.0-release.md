# LE Lab v2.6.0 — a word the stemmer would eat down to a fragment keeps its own name

**Released 2026-07-29.** The first Lab release that deliberately **moves scores**. It answers the
DESIGN ruling and the two CONTEST tables from Sol's break-it review of v2.5.0, and it closes v2.5.0
§7.2 — the item that release called *"the highest-value item on this list"* and deferred precisely
because fixing it corpus-wide is what this release is for.

```
Lab release ......... 2.6.0                    (was 2.5.0)
analyzer ............ 2.6.0                    (was 2.5.0)
analysis schema ..... le-lab.analysis/2.6      (was /2.5)
diagnostics schema .. le-lab.diagnostics/1.1   unchanged
feedback schema ..... le-lab.mapping-feedback/1.1  unchanged
research queue ...... le-lab.research-queue/2.1    unchanged
scoringConfigHash ... bt0a7p                   (was 1qt8p4u)
canon index ......... 1.0.0+949aef381d5f       UNCHANGED — no doctrine moved
canon SHA-256 ....... c7c4183675d606a3…        REPRODUCIBLE for the first time
cache-busters ....... v=2.6.0                  (20 stamps across 9 files)
test suite .......... 170 pass / 0 fail        (was 158)
```

**The hash moved because three keys were added and no existing value changed.** `minCredibleScore`
is still 0.43, `minWeakScore` still 0.25, `candidateScoreFloor` still 0.08,
`misreadingContradictionShare` still 0.36. The additions are `minStemmableLength` (5 — a literal that
was already hard-coded), `minDerivedStemLength` (3 — the fix), and
`contextualAliasComplementLookahead` (4). **No threshold was retuned, and none was permitted to be:**
the release's whole argument is that a fix which moves scores must be adjudicated rather than
absorbed, and a threshold nudged to un-cross an awkward pair is exactly the absorption it refuses.

The six commits were RED-first and separately verified:

```
d09608d  test(lab):   a six-letter word can leave the tokenizer as one character, frozen RED
c52fa14  fix(lab):    a word the stemmer would eat down to a fragment keeps its own name
be394e4  fix(lab):    a dash the normalizer disguised, and a comment that belongs to the weather
e418c3e  docs(lab):   the sentences the clause model cannot read, written down as such
6095925  build(canon): date the index from the doctrine it was built from, not from the clock
(this)   release(lab): v2.6.0
```

---

## 0. The triage, and what it decided

Sol's review carried 22 repros across stance and co-fire plus a DESIGN ruling on the tokenizer. The
architect triaged them into three bins, and the bins were rulings rather than suggestions:

| Bin | Contents | Where it went |
|---|---|---|
| **DESIGN** | Repair tokenization centrally; do not patch only `distinctiveBoost` | Commits 1–2 |
| **1 — mechanical** | Five defects where the code fails to reach a rule the release already claimed | Commit 3 |
| **2 — structural** | Fifteen cases where the reviewer is right and a punctuation-approximated clause model cannot be | Commit 4, frozen as limits |

**Every number in Sol's review reproduces to the decimal.** Verified before a fixture was written:
450 entries, 108 carrying a degenerate stem, 19 raw-token mappings, 16 distinct fragments,
`re` 3.976 / `st` 4.914 / `vi` 4.714 / `n` 5.502 / `r` 5.725 / `f` 6.013, the paired provisioning
repro at 0.300 and 0.156 with all four component values, and the OkCupid → `M-TBD-41` weak match at
0.263. The RED manifest is `md/lab-v2.6.0-red-manifest.md`.

---

# STEMMER

## 1. What was wrong

`tokenize` filtered `length > 1` **before** stemming and never re-checked afterwards. A six-letter
content word could therefore leave the tokenizer as one character, and then act as a concept:
`really` → `re`, `national` → `n`, `fable` → `f` carrying IDF 6.013. Nineteen raw canon words
collapsed onto sixteen fragments across **108 of 450 entries**.

v2.5.0 found this by fixture — cf-05 kept promoting a provisioning claim about a billing vendor on
the "independent canon concept" `re` — and fixed it *locally*, inside co-fire, with
`minCoFireConceptLength: 4`, noting that the general fix moves scores corpus-wide.

## 2. The rule, and why each half of it

Sol's, implemented exactly: **compute the stem; if stemming CHANGED the token and left fewer than
three characters, reject the stem and keep the original surface token.**

| Alternative | Why not |
|---|---|
| A four-character derived floor | Destroys `dating/dates/daters → dat`, `fixed/fixes → fix`, `sexes → sex`, `paying/payers → pay`. Four working families, to fix nineteen broken tokens. |
| A floor on the ORIGINAL token | Catches nothing. `really`, `stable`, `viable`, `national` and `rational` all enter long. |
| Testing the stem against the stopword list | Misses `re`, `st`, `vi`, `us`, `n`, `r`, `f` — none of them are stopwords, they are fragments. |
| Dropping the token instead of falling back | Erases `stable`, `viable` and `visible`, which are real concepts in this canon. Sol measured this too: 4,298 pairs changed and **13** credible crossings, against 2,168 and 3. |

Fallback is the only rule that separates all four cases. `men`, `age`, `AI` and `SMV` are untouched,
because the floor applies to a token the stemmer *shortened*, never to one that arrived short.

**`really` joins `STOP_WORDS`**, where it belongs on its own merits — an intensifier, in the company
of `just`, `only`, `too` and `very`, which were already on the list. That placement is also what
satisfies Sol's step 3 without a second filter: the fallback returns the ORIGINAL, and the original is
exactly what the pre-stem filter has just checked.

### A second filter, measured and removed

I implemented "re-run filtering against the accepted representation" as a literal second pass after
stemming, then removed it. Applied there it bites only on the *normal* path, where it deletes
`offers` (→ `off`), `owned` and `owners` (→ `own`), `shoulders` (→ `should`), and
`willing`/`willingness` (→ `will`) — six content words whose stems collide with function words the
first filter had already removed. The collision is harmless today; the deletion is a loss.

It also pushed the census **away** from Sol's counterfactual: 260 increases against his 211, versus
209 without it. That is the useful part — a "safety" addition that makes a measurement worse is
telling you something. The stem-collides-with-a-stopword defect is real and is written up in §9, not
smuggled in here.

## 3. Fixed at the tokenizer, because `distinctiveBoost` was never the only consumer

Sol's §3c paired repro proves it in one line. Two sentences differing by one intensifier:

| | `really` | `just` (stopword control) | after |
|---|---|---|---|
| raw score | **0.300** | 0.156 | **0.156 — identical** |
| shared | `[re, provider]` | `[provider]` | `[provider]` |
| `queryCoverage` | 0.212 | 0.133 | 0.133 |
| `canonCoverage` | 0.111 | 0.063 | 0.067 |
| `distinctiveBoost` | 0.090 | 0.045 | 0.045 |
| sparse-shared penalty | avoided | ×0.52 | ×0.52 |

`distinctiveBoost` accounts for **0.045 of the 0.144 gap**. The rest is both coverage ratios and a
penalty that stopped applying because a fragment counted as a second shared token. And
`minCoFireConceptLength` — v2.5.0's local guard, still in the tree — does nothing at all here:
neither occurrence is promoted in either sentence.

The consumers that read these token sets: document frequency and IDF in `prepareCanonIndex`;
`sharedWeight`, both coverage ratios, `distinctiveBoost`, `titleBoost`, weak-generic detection and
the sparse-token penalty in `scoreEntry`; `matchSurfaces`; `misreadingOverlap`; co-fire inputs;
`contextContinuityEvidence`; `misreadingScope` clause and quotation overlap; and
`researchItemFor` search terms.

**`minCoFireConceptLength: 4` stays**, re-documented as secondary. It no longer has the job it was
created for, but it answers a different question from a different direction — the tokenizer floor
asks how short a token may be, and this asks how short a token may be and still *carry a concept*.

## 4. Blast radius, measured against Sol's counterfactual

Same population: the **103 retained** corpus passages × 450 entries = **46,350 pairs**. Set-aside
passages are excluded because retrieval genuinely does not run on them — `analyzeDocument` scores a
unit only after the gate retains it. Sweeping all 276 units would measure numbers the product never
computes and inflate every census by about 1.7×.

| | Sol's counterfactual | Measured |
|---|---|---|
| score changes | 2,210 | **2,168** |
| decreased / increased | 1,999 / 211 | **1,959 / 209** |
| `candidateScoreFloor` crossings | 97 drops | **97 drops, 0 gains** |
| `minWeakScore` crossings | 21 drops / 2 gains | **21 drops / 2 gains** |
| `minCredibleScore` crossings | 3 gains / 0 losses | **3 gains / 0 losses** |
| the three credible gains | Statistics entries, 0.424–0.427 → 0.430–0.435 | **exactly that** |
| OkCupid → `M-TBD-41` | ~0.070 | **0.070** |

**Every crossing count is identical.** The 42-pair difference in the total is the only divergence, and
the split moved *toward* his numbers when the second filter came out. Zero credible losses, so the
release stop condition never fired.

## 5. Adjudication — 123 crossings, all ACCEPT

`md/lab-v2.6.0-threshold-adjudication.md` is the sheet; `tests/fixtures/threshold-neighbors.json` is
its machine-readable twin, and the sheet is *rendered from* the fixture so the two cannot drift.
**Jason ruled ACCEPT on all 123**, recorded per crossing with his name against it.

The three that change what a reader sees:

| Passage | Entry | Before | After |
|---|---|---|---|
| "Tinder is the top online dating platform among users under 50." | `statistics:stat-attention` | 0.427 | **0.435** |
| the same passage | `statistics:stat-pay-to-play` | 0.424 | **0.432** |
| "Among current or recent online dating users, 54% of women say they have felt overwhelmed…" | `statistics:stat-app-reasons` | 0.426 | **0.430** |

All three are the *same mechanism working correctly*: the passages genuinely contain `users`, the
entries genuinely contain `users`, and before this release that overlap was being carried by the
junk fragment `us` — which also matched `using`, and which under-weighted the real word by spreading
its document frequency across sixteen unrelated entries.

**The band pins sides, not scores.** `threshold-neighbors.json` freezes all 4,058 corpus pairs within
±0.03 of an admission line and asserts that none changes which side it sits on without a recorded
ruling. Pinning 4,058 exact numbers would fail on every honest change and teach people to regenerate
without looking. Crossings that begin *outside* the band — 0.363 → 0.231 clears `minWeakScore`
without ever being near it — are caught by the `rulings` record instead, which is why the fixture
carries both.

## 6. What the fix cost, recorded rather than discovered later

- **`moment`/`moments` and `peer`/`peers` stop unifying.** They only ever unified by collapsing onto
  a fragment that also swallowed everything else ending the same way. A false unification traded for
  a missed one, on two families, against nineteen fragments.
- **97 candidate-floor drops** are a census, not 97 decisions: crossing that line changes which
  entries were *considered*, not what any reader is shown.
- **21 weak matches dropped.** The largest, `statistics:stat-fertility-age` 0.299 → 0.242 and a
  gender-dynamics entry 0.363 → 0.231, were sharing `us` and nothing else that mattered.

---

# MECHANICAL

## 7. Five defects, and only five

Each is the code failing to reach a rule the release already claimed. New fixture block
`clauseMechanics`: 15 cases, **11 RED at freeze**, 4 green guards. Measured post-stemmer, since the
stemmer landed first and everything after it is measured against post-stemmer baselines.

| | Defect | Cases | Fix |
|---|---|---|---|
| **a** | An unspaced em dash reads as an intra-word hyphen | cm-01 (co-fire), cm-05 (stance) | `normalizeForClauses` spaces the dash **before** `normalizeText` folds it |
| **b** | `disqualifyingModifier` only looks backwards | cm-02, cm-03 | post-nominal complements after `for`/`of`, plus plural tolerance on denylist terms |
| **c** | "Exactly one follow-up" scanned every later clause | cm-07, cm-08 | one clause, the one immediately after the assertion |
| **d** | A comment in the assertion's own clause was invisible | cm-10, cm-11 | read the clause tail, strictly **after** the misreading's span |
| **e** | `Is it not obvious that X?` counted as a denial | cm-13, cm-14 | interrogative inversion discounts one negator |

**(a) is one fix serving both features.** `normalizeText` folds em and en dashes to an ASCII hyphen,
which is right for matching — a reader who types "the 7-7 rule" should find the entry titled
"The 7–7 Rule" — and fatal for splitting, because "marriage—the" then looks exactly like
"cloud-based". The information is destroyed before the splitter ever sees it, so the fix belongs
before the fold and not inside the splitter, whose rule was correct all along. Every token stream is
identical afterwards, because a dash already terminated a token in either form. cm-06 is cm-05 with
a semicolon and was already right, which is what makes the pair a diagnosis rather than an opinion.

**(b) is narrow by construction.** English puts a noun's complement after it at least as often as its
modifier before it, so "the provider for cloud hosting" walked past a list that already contains both
words. The new check fires only on a complement the alias actually takes — `for` or `of` immediately
after it — and only when a listed term sits inside it. cm-04's "provider for the household" is the
same shape with a relational complement and stays promoted: the denylist disqualifies, not the shape.

**(c) costs one case, and it is frozen.** cm-09, "He says [misreading]; the study, however, is
wrong.", is a genuine rejection separated from its claim by a parenthetical that created two clause
breaks. It now reads as no follow-up. The failure is to *Context only*, which under-claims rather
than over-claims, and it is recorded as an accepted cost rather than found later.

**(d) is why cm-12 is in this block.** "It is false that the following claim holds: [misreading]" is a
documented limit — the colon severs the matrix `false` from what it governs. Scanning the *whole*
assertion clause for a comment would have flipped that case by accident, moving a limit while
appearing to leave it alone. Scanning strictly after the misreading's span is what prevents it, and
cm-12 sits in the mechanical block asserting current behavior so the constraint is tested.

**(e) is one syntactic frame, not question semantics.** It needs both the clause-initial inversion and
a question mark. cm-15, "It is not obvious that X.", keeps its negator and keeps denying — the guard
that stops this becoming a rule about the word `not`. The scope trace now publishes
`negation.rhetoricalInversion` so a discounted negator is visible rather than an unexplained count.

**One additive config key**, `contextualAliasComplementLookahead: 4`. No case was retargeted; every
v2.5.0 fixture passes unmodified.

---

# LIMITS

## 8. Fifteen sentences the clause model cannot read

Frozen in a new `documentedLimits` block, every one **asserting current behavior** with the humanly
correct answer recorded beside it — which is the whole difference between a limit and a defect nobody
got to.

| Family | Cases | The syntax that defeats the approximation |
|---|---|---|
| `coordination` | bl-08, bl-09, bl-10, bl-15 | Coordinated predicates with different subjects and no comma |
| `subordination` | bl-01, bl-07 | A negator inside a subordinate clause; a pre-posed concession |
| `appositive` | bl-13, bl-14 | The comma that makes it an appositive is the comma that clips it |
| `attribution` | bl-03, bl-05 | Named speakers; two-level reporting chains |
| `quotation` | bl-02, bl-04 | Split-quote denial; a passage-global span stealing ownership |
| `window` | bl-11, bl-12 | Nine tokens instead of eight; evidence in the adjacent clause |

**bl-15 is what turns bl-08 from an opinion into a finding.** "We discussed marriage and the AWS
provider failed again" promotes; add one comma before `and` and it correctly finds nothing. One comma
between a right answer and a wrong one on identical content — a punctuation cliff, exactly as Sol
said. **bl-11b does the same for bl-11**: the same sentence with one article removed puts `marriage`
at eight tokens instead of nine and it promotes at 0.540. The window's edge is arithmetic, not
meaning.

Two of these are load-bearing elsewhere, which is the argument against relaxing either casually:
bl-03's finite-verb test is what separates sc-02 from the sc-07 irony limit, and bl-02's unquoted
sibling cm-12 is why the (d) fix scans only after the misreading span.

**The irony rule is now a contract over the whole fixture.** v2.5.0 wrote it for one case; it now says
that a documented limit anywhere in the file must assert what the analyzer does, must record what it
costs, and must *disagree* with the analyzer — a "limit" that agrees is a guard and has to say so. A
third test re-measures all fifteen against the live analyzer, so a limit that quietly moves fails
instead of going stale.

Published three ways, matching how the irony limit is published: the `lab.html` instrument-limits
section ("Clauses are guessed from punctuation"), the analysis's own `limitations[]`, and the fixture.

## 9. The limit-hit ledger, and why it is empty

`md/limit-hit-ledger.md`, created empty, with routing in `md/FEEDBACK-PIPELINE.md` §4. A flag whose
adjudication lands on a documented limit does **not** become a fixture — there is nothing to assert
that the block does not already assert, and a red case nobody intends to fix is a case that trains
people to ignore red. It becomes a ledger line.

That file is the point. All fifteen limits were built from invented sentences, which proves the rules
are breakable and not that anyone writes that way. The ledger counts the families **real sources**
hit, and it is deliberately the only evidence that will be accepted for the decision these limits all
defer: whether this instrument parses clauses instead of approximating them. That is a decision about
what the Lab *is* — deterministic, local, inspectable — not a patch to make because a cue list looked
one word short.

**An empty ledger is a finding too.** It says the limits are real and rarely reached.

---

## 10. Canon provenance — a reproducible SHA-256 at last

v2.5.0 §6 had to note that `md/RERUN.md` treats SHA-256 as the reproducibility anchor and that for
`data/le-canon-index.json` this was not quite true, because `generatedAt` was a wall-clock stamp; §7.6
left it open. v2.5.0 *reverted* a timestamp-only regeneration rather than commit a diff that reads
like a canon change.

`generatedAt` is now the **last commit touching a canon source page**. Two builds of the same tree
produce identical bytes:

```
data/le-canon-index.json   c7c4183675d606a30ce9df6ac22e85d25c31b453da15ebae3c47025f09f06329
                           identical on rebuild ✓
indexVersion               1.0.0+949aef381d5f   unchanged — no doctrine moved
generatedAt                2026-07-27T11:38:21.000Z
```

**The source pages and nothing else, and that is a correction to my own first attempt.** The builder
was in the input list at first, on the reasoning that a change to the extraction logic changes the
artifact as surely as a change to a page does. True, and self-invalidating: committing a builder
change moves the answer, so the index built in that same commit is stale the moment it lands and the
staleness check fails on a tree nobody touched. `indexVersion` is a hash of the built content and
already moves when extraction changes, which is the right instrument for that question. This field
answers a narrower one — when did the doctrine last change.

It **throws** outside a git checkout rather than falling back to a wall clock, because a silent
fallback would restore an irreproducible hash while the file went on looking reproducible.
`CANON_GENERATED_AT` is the escape hatch and also how a re-run reproduces an archived artifact.

`validate-canon-index.mjs` stops pinning `generatedAt` from the committed file. It pinned it because a
wall-clock stamp was the only way to compare the rest; now that the field is derived, dropping the pin
puts the *whole* artifact under the staleness check instead of all-but-one-field. Verified both ways —
clean on the tree, and failing as it should when the stamp is drifted by hand.

---

## 11. Index-wide match-surface diff

Segment-level, `a878753` (v2.5.0) → this release, across the three archived corpus sources.

```
01-pew-online-dating.txt   64 segments   23 moved   +3 / -0 matches · 22 scores · 0 stances · 22 weak-lists
02-fem-centrism.txt        10 segments    1 moved   +0 / -0 matches ·  0 scores · 0 stances ·  1 weak-lists
04-heteropessimism.txt     29 segments    5 moved   +0 / -0 matches ·  0 scores · 0 stances ·  5 weak-lists
──────────────────────────────────────────────────────────────────────────────────────────────────────────
TOTAL                     103 segments   29 moved   +3 / -0 matches · 22 scores · 0 stances · 28 weak-lists
```

**This release does not need synthetic sentinels.** v2.5.0's diff reported zero and had to prove the
harness could detect the change it was measuring; this one reports a non-zero it can name — the three
gained matches are precisely the three adjudicated credible crossings, on the two passages the sheet
identifies. A harness that finds the change you predicted, in the place you predicted it, has
demonstrated its own sensitivity.

### Attribution

| Change | Corpus effect | Why |
|---|---|---|
| **Stemmer** | 29 segments moved, +3 / -0 matches | The only part of this release the corpus exercises, and it exercises it thoroughly. |
| **Bin-1 mechanical** | **zero** | Verified: the census against the v2.5.0 baseline was byte-for-byte identical before and after commit 3. No corpus passage reaches `misreadingContradictionShare` 0.36, and no corpus segment promotes a contextual alias — the same structural bound v2.5.0 §5 gave. |
| **Bin-2 limits** | zero | Fixtures and documentation; no code path. |
| **Canon `generatedAt`** | provenance only | `canonIndex.generatedAt` moves in every export; `indexVersion` does not. |

**Zero stance labels moved** across 103 segments, through a release that rewrote five things about
stance. That is a fact about a Pew summary, a short essay and a lit-crit piece, not about the changes;
the fixtures are the demonstration and the corpus is the regression check.

### Determinism

```
01-pew-online-dating.txt   run1 == run2 ✓   diagnostics-independent ✓
02-fem-centrism.txt        run1 == run2 ✓   diagnostics-independent ✓
04-heteropessimism.txt     run1 == run2 ✓   diagnostics-independent ✓
```

### Worker / fallback parity

Verified in the browser at `v=2.6.0`, not by inspection. The demo analyzed through
`LabAnalyzerClient` (worker) and through a direct `analyzeDocument` import (fallback) serialize to
**137,533 identical bytes**, `generatedAt` excluded. No console errors; `provenance.identity` present;
`limitations[]` carries the new clause-approximation statement.

---

## 12. Corpus re-run at v2.6.0

Three of four sources; 03 (Gottman) remains excluded by standing decision, so
`singleVersionStatus.isSingleVersion` stays `false` for the same reason as before.

| Source | Passages | Claim-like | Mapped | Coverage | Queue | Set aside | vs v2.5.0 |
|---|---|---|---|---|---|---|---|
| 01 Pew, online dating | 64 | 62 | 27 | 43.5% | 35 | 41 | identical |
| 02 Tomassi, Fem-Centrism | 10 | 10 | 0 | 0% | 10 | 41 | identical |
| 04 Seresin, Heteropessimism | 29 | 28 | 1 | 3.6% | 27 | 91 | identical |

**Every headline figure is unchanged, and that is not the same as nothing happening.** The three
credible gains landed on passages that were *already mapped*, so the mapped count could not move —
what changed is which entries those passages map to. A coverage table is too coarse to show a
retrieval change; §11 is where to look.

The demo is likewise unmoved: 6 of 11 mapped, the same 6 as v2.4.2 and v2.5.0, and
`fixtures/diff-analysis.mjs demo-v2.4.0 demo-v2.6.0 --mode alias` reports **zero** score movement in
either direction.

**A note on `--mode alias`.** It **FAILS** on source 01, reporting 10 score decreases, and that is the
correct output of the wrong gate. `alias` mode exists for recall passes where any decrease is a
regression; this is a calibration pass where decreases are the *product*, all 123 crossings are
adjudicated, and the sheet is the acceptance instrument. Sources 02 and 04 pass it. Recorded here
rather than quietly omitted, because a release that only prints the gates it passes is not reporting.

### SHA-256 — v2.6.0 artifacts

| SHA-256 | File |
|---|---|
| `64df85d3e56013e63c8296ea0acbfd23b80101b8f3b8f26539f1a197d3cbc5ed` | `lab-corpus/exports/01-pew-online-dating-v2.6.0.json` |
| `e87b6546b8b6279eb806d51f563d056cb5fbad3ecc87857d99f78eebd140f267` | `lab-corpus/exports/02-fem-centrism-v2.6.0.json` |
| `c98cb6943151410e6d2c2db34e470796b3e346016b3eee5fedfc8e626a5efe8c` | `lab-corpus/exports/04-heteropessimism-v2.6.0.json` |
| `c7c4183675d606a30ce9df6ac22e85d25c31b453da15ebae3c47025f09f06329` | `data/le-canon-index.json` |
| `0ede1173d17c8c65c723ee79584ec1963ca80ae509fd43475758e03fc76b3750` | `fixtures/demo-v2.6.0.json` |

Queue, Markdown and labeling-sheet hashes are in `lab-corpus.manifest.json` under each source's
`companions`. The v2.5.0 exports are retained under `superseded` — they are the *before* side of §11.

---

## 13. Open, and deliberately not done here

1. **A stem can still collide with a stopword.** `offers` → `off`, `owned`/`owners` → `own`,
   `shoulders` → `should`, `willing`/`willingness` → `will`. Harmless today, because the colliding
   function word was removed before stemming, so the index token means only the content word. It is
   a real defect of the same family as the one this release fixed — a token that is not the word it
   came from — and it needs its own adjudication, because the obvious fix (filter after stemming)
   *deletes* those six words rather than preserving them. §2 has the measurement.
2. **`GENERIC_TERMS` is matched against the stemmed token but written unstemmed.** So `dating` → `dat`
   escapes a filter that names it, along with `choices`, `likes` and `partners`. Same shape as the
   inert 4-char alias and the multiword typed alias: **curation that silently does nothing.** Not
   fixed here because it would move scores in a way Sol's counterfactual did not model, and this
   release's stop conditions are written against that counterfactual.
3. **`md/lab-schemas.md` was one version stale.** Its "Analysis result" header still read
   `le-lab.analysis/2.4` after v2.5.0 claimed to update it. Corrected to `/2.6` here.
4. **Everything open in v2.4.2 §7.1/§7.3/§7.6 and v2.5.0 §7.1/§7.3 is still open.** `game`/`rizz`
   typing blocked on ds-13; methodology prose on the match surface; the full published-schema freeze;
   a second flag on a row still does not supersede the first. Coverage still carries
   `provisional: true` — this release calibrated a *tokenizer*, not the thresholds.
5. **The bin-2 limits are not fixed and should not be patched piecemeal.** §9.
6. **Irony is still not detected and will not be** without a model.
7. **The corpus exercises the stemmer and nothing else** (§11). Until a source arrives containing a
   contextual alias in a technical clause, or a passage that restates an indexed misreading, the
   fixtures are the only regression surface those behaviors have.

---

## 14. Verification

```
npm run test:lab                          170 pass / 0 fail   (was 158)
  lab-intake                               28
  lab-analyzer                             44
  lab-domain-benchmark                      3   152 cases, 1.000 precision / 1.000 recall / 0.821
  lab-match-behavior                       12   (+3: clause mechanics, limit contract, limits are live)
  lab-export                                8
  lab-ledger                                5
  lab-feedback                             24
  lab-feedback-integrity                   25
  lab-canon-mapping-benchmark               4
  lab-short-utterance                       8
  lab-tokenizer                             6   NEW
  lab-threshold-neighbors                   3   NEW
  canon-index-fixtures                    450 concepts, 19 sources, 2 typed-alias entries
  validate-canon-index                    450 concepts, 1.0.0+949aef381d5f
  lab_release_audit.py                    PASSED  (10 modules, 16 edges, 2 resources, v=2.6.0)
  lab_ui_audit.py                         PASSED  (151 IDs, 29 ARIA refs, 9 labels, 33 buttons)
  site_integrity_audit.py                 PASSED  (24 HTML files, 508 local targets)
```

**Floors, all green and unmoved through a corpus-wide scoring change:** the 152-case domain benchmark
at 1.000/1.000 with the third metric unchanged at 0.821; the 10 misreading-polarity cases; the 13
typed-alias cases; the 6 contextual co-fire cases; the 12 stance-composition cases; the
short-utterance matrix; the empty canon-mapping benchmark. **No case was retargeted by any bin-1 fix.**

**The new tests were placed after the existing ones on purpose.** A RED block that short-circuits the
suite before the floors have reported is a RED block nobody can read; commit 1's freeze reads
"158 green, then four new failures", which is the claim it was making.

---

## 15. Files

| File | Change |
|---|---|
| `js/lab-analyzer.js` | Derived-stem floor with surface fallback, `really` → STOP_WORDS, `normalizeForClauses`, post-nominal complement detection, one-clause follow-up, in-clause follow-up after the misreading span, rhetorical-inversion negation discount, clause-approximation limitation, three config keys, version + schema bump |
| `js/lab-feedback.js` | Current-contract references to `le-lab.analysis/2.6`; historical ones left alone |
| `js/lab-app.js`, `lab-demo.js`, `lab-export.js`, `lab-extractors.js`, `lab-analyzer-client.js`, `lab-analyzer-worker.js` | Cache-busters, `LAB_RELEASE` |
| `lab.html`, `css/lab.css` | Cache-busters; instrument-limits gains "Clauses are guessed from punctuation" |
| `scripts/build-canon-index.mjs` | `generatedAt` derived from canon-source git state; throws outside a checkout |
| `scripts/validate-canon-index.mjs` | Stops pinning `generatedAt`, so the staleness check covers the whole artifact |
| `tools/lab-threshold-sweep.mjs` | **New** — corpus-wide sweep, threshold band, crossing census, adjudication sheet |
| `tests/fixtures/tokenizer-benchmark.json` | **New** — four blocks: degeneracy (32), component isolation, index provenance, retrieval guards |
| `tests/fixtures/threshold-neighbors.json` | **New** — 4,058-pair band, 123 rulings, adjudication closed |
| `tests/fixtures/match-behavior-benchmark.json` | Two new blocks: `clauseMechanics` (15), `documentedLimits` (15) |
| `tests/lab-tokenizer.test.mjs`, `tests/lab-threshold-neighbors.test.mjs` | **New** |
| `tests/lab-match-behavior.test.mjs` | Three new tests; block count 5 → 7 |
| `md/limit-hit-ledger.md` | **New** — empty, by design |
| `md/lab-v2.6.0-red-manifest.md`, `md/lab-v2.6.0-threshold-adjudication.md` | **New** |
| `md/FEEDBACK-PIPELINE.md` | §4 routing for flags that land on a documented limit |
| `md/RERUN.md` | §2 rewritten — SHA-256 is now this file's anchor too |
| `md/lab-schemas.md` | Analysis contract corrected to `/2.6` |
| `lab-corpus.manifest.json` | Epoch → 2.6.0; three sources re-run, v2.5.0 superseded |
| `data/le-canon-index.json` | `generatedAt` only; `indexVersion` unchanged, no doctrine moved |
