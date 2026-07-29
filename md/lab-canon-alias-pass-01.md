# LE Lab — canon alias pass 01: verdict fix + ratified alias additions

**Pass:** canon `1.0.0+8c38a2f1d015` → `1.0.0+62c5cb511433`. Analyzer untouched at `2.2.0`.
This closes the work item the v2.2.0 manifest recorded as outstanding ("alias/phrase recall
expansion … blocked on the `ALIAS_ADDITIONS` block, which arrived as an unfilled placeholder").

Two changes, deliberately committed and measured separately so their effects can be told apart:

| Step | Commit | Canon | Change |
|---|---|---|---|
| 1 | `e1f9752` | `…8c38a2f1d015` → `…bac731fc9e56` | Mythbuster verdict badges removed from `aliases`, moved to a new `verdict` field |
| 2 | `ff78a8d` | `…bac731fc9e56` → `…62c5cb511433` | 38 ratified aliases/phrases added across ten entries |

`js/lab-analyzer.js` was **not** touched. Both changes are index-side.

---

## 1. Determinism

Required before any diff is trustworthy.

```
two pinned builds, byte-compare ............ identical (585,055 bytes, both 1.0.0+62c5cb511433)
committed artifact == its own rebuild ...... true
fixture captured twice, byte-compare ....... identical (167,513 bytes)
```

`validate-canon-index.mjs` also rebuilds and deep-equals the committed artifact on every
`npm run test:lab`, so a stale index is a red suite, not a silent drift.

---

## 2. Gate results

`npm run test:lab` — full suite green at each commit.

| Check | Result |
|---|---|
| `lab-intake.test.mjs` | 28 pass / 0 fail |
| `lab-analyzer.test.mjs` | 37 pass / 0 fail |
| `lab-domain-benchmark.test.mjs` (134-case) | 3 pass / 0 fail |
| `lab-export.test.mjs` | 8 pass / 0 fail |
| `lab-ledger.test.mjs` | 5 pass / 0 fail |
| `canon-index-fixtures.mjs` | 450 concepts / 19 sources / 65 verdicts off the match surface |
| `validate-canon-index.mjs` | 450 concepts, `1.0.0+62c5cb511433` |
| `lab_release_audit.py` / `lab_ui_audit.py` / `site_integrity_audit.py` | PASSED |

The 134-case domain benchmark holds its recall/precision floors unchanged. Neither change touches
the relevance gate, which is the only thing that benchmark measures.

**Alias-mode diffs** (`fixtures/diff-analysis.mjs … --mode alias`), demo source:

| Diff | decreased | increased | dropped | gained | Result |
|---|---|---|---|---|---|
| A: v2.2.0 baseline → final | 0 | 4 | 0 | 0 | **PASS** |
| B: verdict-fix-only → final (isolates the 38 additions) | 0 | 2 | 0 | 0 | **PASS** |

No stop condition fired.

### Attribution of removals — the decisive check

The demo source is one document and cannot prove "no non-attributable loss" on its own. The
index-wide match-surface diff can, because it compares the *entire* set of strings the analyzer can
match on, before and after:

```
strings REMOVED from the match surface .................... 65
  of which are not a Mythbuster verdict move .............. 0
  of which exactly equal that entry's new `verdict` field .. 65
strings ADDED to the match surface ........................ 38  (the ratified set, verbatim)
```

Every removal is the verdict fix. Nothing else left the match surface. This is the strongest form of
the "REMOVED matches only where attributable to item 1" requirement — it holds for *any* source, not
just the ones tested.

Residual ±0.001–0.002 score movement on weak matches and research-queue `nearestConcepts` is the IDF
corpus shifting: removing 65 strings and adding 38 changes global document frequency, so third-decimal
scores move everywhere. These are not dropped matches and the alias gate does not count them.

---

## 3. Verdict-fix effect — every baseline match that disappears

**On the demo source: none.** Zero matches dropped, zero scores decreased. The demo transcript
contains no verdict-shaped prose, so the leak was latent there. That is a real result, and it is also
why the demo alone was insufficient evidence.

The leak *is* reachable, and both of its failure modes are demonstrated below on a purpose-built
eight-sentence probe of verdict-worded prose.

### 3a. Invented matches (false positives the fix removes)

Probe result: **2/2 claim-like passages mapped under the old canon, 0/2 under the new one.**

| Sentence | Removed match | Score | Verdict badge that caused it |
|---|---|---|---|
| "Honestly, that argument is half right and half wishful thinking." | `M-TBD-14` *Do women reward the same player behavior they complain about?* | 0.540 | `"Half right"` |
| " | `M-TBD-16` *When women say they want an honest guy…* | 0.540 | `"Half right"` |
| " | `M-TBD-23` *Do men and women desire celebrities differently?* | 0.540 | `"Half right"` |
| "When two people argue about who initiates, it runs both ways." | `M-TBD-55` *Does "like me for me" run both ways?* | 0.575 | `"Runs both ways"` |
| " | `M-TBD-60` *Is dating-market entitlement a women-only problem?* | 0.575 | `"Runs both ways"` |

Each fired as `Exact phrase: "half right"` / `Exact phrase: "runs both ways"`. Three unrelated
rulings tied at 0.540 on one sentence — the signature of matching on a label rather than a concept.
The 65 rulings use only 54 distinct badge strings: 8 of them are shared by two or three entries
each ("Holds up" ×3, "Half right" ×3, "Real but overstated" ×3, then "Advantage Mika", "Oversimplified",
"Both wrong", "True at first sight" and "Runs both ways" ×2), covering 19 entries between them. So a
single verdict-shaped sentence could pull a whole cluster of unrelated rulings at identical scores.

### 3b. Suppressed true positives (the more expensive failure)

The leak did not only add matches — it **crowded correct concepts out of the ranked slots**, and this
cost real coverage. From `tests/lab-analyzer.test.mjs`, the cold-review novel matrix:

> "A person can prefer predictability without preferring commitment."

| | Slot 1 | Slot 2 | mapped? |
|---|---|---|---|
| Before | `M-TBD-63` **0.416** — on the badge token *preferred* | `lexicon:term-commitment` 0.412 — **exact alias hit** | **no** |
| After | `lexicon:term-commitment` **0.463** | `frameworks:readiness-gate` 0.431 | **yes** |

M-TBD-63's badge is `"Signal-preferred, not signal-required"`. The word "preferring" in the claim hit
"preferred" in that badge, which put a ruling about approach signals above the *Commitment* concept
that had matched exactly — and the segment fell below the mapping gate.

The frozen assertion in that test had encoded the suppression. It is corrected in `e1f9752` and now
also asserts the concept the claim maps to, so it fails if the ranking regresses rather than merely
if the count changes.

**Net on the probe corpus: −5 invented matches, +1 recovered true mapping.**

---

## 4. The "game" alias collision

Requested section. Short answer: **"game" fires on nothing, and cannot — it is structurally inert.**

### What co-matches

Two entries carry `game` on the effective match surface (the analyzer folds `title` into the alias
set, so a title counts):

| Entry | How |
|---|---|
| `smv:charm` | the new alias |
| `lexicon:term-game` | its title, *Game* |

61 entries carry the token *game*/*games* in their lexical bag. The largest cluster is Gender
Dynamics, which has a whole subcategory named "Directness & delivery — the indirect game", putting
the word in the subcategory line of six entries.

### Does Gender Dynamics crowd `maxMatchesPerClaim = 4`?

**No — and nothing else does either.** On a seven-sentence probe, control (no `game` alias) and live
are **identical in every ranked slot, every weak match, and every score**. `smv:charm` never surfaced.

Only one "game" sentence survived the domain-relevance gate to be matched at all. Its slots:

```
"Dating is a numbers game once you accept that most matches go nowhere."
  slot 1/4  0.558  M-TBD-12   [Mythbuster]
  slot 2/4  0.448  M-TBD-5    [Mythbuster]
  weak      0.421  M-TBD-48 · 0.394 M-TBD-32 · 0.363 M-TBD-58   [all Mythbuster]
```

Two of four slots filled — the cap was never reached, so no crowding-out occurred. Where crowding
*pressure* exists it comes from **Mythbuster, not Gender Dynamics**: five of five surfaced entries
are rulings, matching on `dat/numb/match` token overlap because the `phrases` field carries each
ruling's full claim texts, which are long and keyword-dense. Flagged, not acted on — out of scope.

### Why it is inert

```js
minPhraseLength: 4,        // "game" survives into entry._phrases …
minSingleAliasLength: 5,   // … but a single-word alias needs 5+ characters
phraseHits    → requires phrase.includes(' ')   // multi-word only → "game" excluded
singleAliasHits → requires length >= 5          // "game" is 4    → excluded
```

`game` passes the filter that *builds* `_phrases` but is rejected by **both** consumers of that
array. It can never produce an exact hit at any score. Its only residual effect is adding one token
to `smv:charm`'s IDF bag — a sub-0.001 shift, which is precisely what the control-vs-live comparison
measured.

The same applies to **`rizz`** (4 chars). These are the only 2 of the 38 additions that are inert;
the other 36 are multi-word or ≥5 characters and fire normally.

### Recommendation — keep as alias, and separately raise the real blocker

1. **Keep `game` and `rizz` as aliases.** They cost nothing measurable, they document the vocabulary
   correctly, and they become live for free if `minSingleAliasLength` is ever lowered to 4. Demoting
   to `phrases` would not help — `phrases` folds into the same `_phrases` array and hits the same two
   filters. Dropping them would lose accurate vocabulary for no gain.
2. **Do not lower `minSingleAliasLength` to 4 as part of this pass.** It is a global threshold; at 4
   it also admits every other 4-character single-word alias index-wide. That belongs in the threshold
   calibration pass, measured against the new baseline fixture.
3. **The binding constraint is not the alias — it is the domain-relevance gate.** Four of five
   seduction-sense "game" sentences were rejected `no-human-relational-frame` *before* matching,
   including "He spent two years learning game and it changed how women responded to him," which is
   unambiguously in-domain and is exactly the sentence the alias was added to catch. No alias change
   can fix a passage that never reaches the matcher. If "game" coverage matters, the work is a
   benchmark append against the gate, not an index edit.

If a single one of these is worth doing next, it is (3).

---

## 5. What the 38 additions actually bought

Eleven-sentence probe, 8 analyzed, **7 mapped**, nearly all on a slot-1 exact phrase hit from a new
string:

| Sentence fragment | Slot 1 | Score |
|---|---|---|
| "Women date across or up…" | `frameworks:smv-matching` | 0.645 |
| "A woman hitting the wall at thirty…" | `frameworks:the-wall` | 0.624 |
| "Her body count is the number of partners…" | `frameworks:body-count` | 0.779 |
| "Taken men seem more attractive… wedding ring effect" | `smv:status:preselection` | 0.747 |
| "…stuck in the friend zone for three years…" | `frameworks:conversion-ladder` | 0.645 |
| "His dating market value dropped…" | `smv:overview` | 0.575 |
| "He gets very few matches on the apps…" | `smv:exposure:the-online-funnel` | 0.610 (slot 2) |

On the demo source the visible gain is `segments[7].matches[0]` picking up
`Exact phrase: "market value"` — the same match, now with inspectable phrase evidence instead of a
bare token overlap.

**Three additions could not be tested**, because the domain gate rejected their probe sentences
`no-human-relational-frame`: `"out of her league"` (`frameworks:smv-matching`), `"under six feet"`
(`smv:looks:height`), and `"provider"` (`smv:money:provisioning-signal`). They are in the index and
correct; whether they ever fire depends on the same gate issue as (3) above.

### Dedup

All 38 were checked against every alias and phrase index-wide before applying: **38 applied, 0
cross-entry duplicates, 0 skipped.**

Two are not duplicates in the index file but do land on an existing *title*, which the analyzer folds
into the alias set — recorded so the co-match is not a surprise later:

| Addition | Also the title of |
|---|---|
| `hypergamy` → `frameworks:smv-matching` | `pills:page-rp:hypergamy`, `lexicon:term-hypergamy` |
| `game` → `smv:charm` | `lexicon:term-game` |

For `hypergamy` this is arguably correct behaviour — a source saying "hypergamy" plausibly wants the
framework, the pill concept, *and* the lexicon entry, and three slots of four can hold all of them.

---

## 6. Pills coverage inventory — report only, no change made

Requested inventory. Exact alias/phrase hits index-wide:

| Term | Covered? | Where |
|---|---|---|
| `red pill` | yes | `pills:page-rp.aliases`, `lexicon:term-the-red-pill.aliases` |
| `black pill` | yes | `pills:page-blk.aliases`, `lexicon:term-the-black-pill.aliases` |
| `blue pill` | yes | `pills:page-bp.aliases`, `lexicon:term-the-blue-pill.aliases` |
| `blackpilled` | **no** | only as substring of a GD card title, `gender-dynamics:male:the-macro-picture-why-dating-broke:blackpilled-before-they-start` |
| `redpilled` | **no** | no occurrence anywhere in the index |

The 12 `pills:*` entries and their current aliases:

| Entry | Aliases |
|---|---|
| `pills:page-blk` | Black Pill, constraint-first lens |
| `pills:height-pill` | Height Pill |
| `pills:face-pill` | Face Pill |
| `pills:just-be-first` | — |
| `pills:page-rp` | Red Pill, strategy-first lens |
| `pills:page-rp:hypergamy` | — |
| `pills:page-rp:preselection` | — |
| `pills:page-rp:frame` | — |
| `pills:page-bp` | Blue Pill, romantic-default lens |
| `pills:page-bp:just-be-yourself` | — |
| `pills:page-bp:personality-matters` | — |
| `pills:page-bp:the-right-person` | right person |

Observation for Jason's decision, not acted on: the three noun forms are covered and the two
**adjectival** forms are not. `blackpilled`/`redpilled` are how the discourse actually uses these
terms about a *person* ("he's blackpilled"), which is a different phrasing from the noun the canon
answers to. Both are 11 and 9 characters, so unlike `game` they would fire immediately as single-word
aliases. Five `pills:*` sub-concepts carry no aliases at all — `pills:page-rp:hypergamy` and
`pills:page-rp:preselection` in particular now sit next to lever entries that just gained the
vocabulary they lack.

---

## 7. Artifacts

| SHA-256 | File |
|---|---|
| `db88deadd3d6210df4bdd3a1073ae42074a0bef93fe8cb0ac21b1006f90ff85a` | `fixtures/demo-v2.2.0-canon-62c5cb511433.json` |
| `e19f6511c05d34a9908c741d21aca8d3817d127c68a9f49efcd53eb72d4114f6` | `data/le-canon-index.json` |
| `6884cbc0f99e5d7e3464e4571c285a8623e5d7c757f31e167f4db4f6fcf2c294` | `data/canon-overlay.json` |
| `15d13ab8a9a49194b934a270899222f69b70f7ef6fe6d04f385d3b63d81989ec` | `scripts/build-canon-index.mjs` |

`fixtures/demo-v2.2.0-canon-62c5cb511433.json` is **the new reference baseline** for the threshold
calibration pass. It is named by canon version because the canon is what moved; the analyzer is still
`2.2.0` and `fixtures/demo-v2.2.0.json` is retained unchanged as the pre-pass reference.

```bash
node fixtures/diff-analysis.mjs fixtures/demo-v2.2.0-canon-62c5cb511433.json after.json --mode alias
```
