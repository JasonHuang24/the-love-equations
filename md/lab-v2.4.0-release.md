# LE Lab v2.4.0 — release report

Three behavioral changes, deliberately shipped as three commits so their effects can be told apart,
plus the frozen red state that preceded them and the diagnostic trace that will feed the next pass.

```
analyzer .................. 2.3.0            -> 2.4.0
analysis schema ........... le-lab.analysis/2.3   -> le-lab.analysis/2.4
research-queue schema ..... le-lab.research-queue/2.1  (unchanged — item shape did not move)
diagnostics schema ........ (new) le-lab.diagnostics/1.0
canon index schema ........ le-canon-index/1.0   -> le-canon-index/1.1
canon overlay schema ...... le-canon-overlay/1.0 -> le-canon-overlay/1.1
canon index version ....... 1.0.0+62c5cb511433 -> 1.0.0+949aef381d5f
scoringConfigHash ......... 195c1ld -> 1ntbwch
release token ............. v=2.3.0 -> v=2.4.0  (16 references across 7 files)
```

> **SCORING CONFIG HASH MOVED.** One new key, `minContextualAliasCoFire: 1`, added in commit 4. **No
> existing value changed.** The hash is a fingerprint of the value *set*, so an additive key moves it
> by design; that is what makes it worth having. Every threshold this release could have been tempted
> to touch — `minCredibleScore` 0.43, `minWeakScore` 0.25, `maxCandidatesPerUnit` 8,
> `misreadingContradictionShare` 0.36, `singleAliasStrength` 0.30 — is byte-for-byte what it was.

| Commit | Subject | Fixes |
|---|---|---|
| `887852f` | match-behavior fixtures (RED) | — |
| `d3f63b2` | retrieval keeps every exact hit | block B |
| `103bd66` | stance reads which canon surface an overlap came from | block A |
| `e82647c` | typed aliases | block C |
| this | v2.4.0 rebuild + diagnostic trace | — |

---

## 0. The red state

`md/lab-v2.4.0-red-manifest.md` is the full expected-vs-observed table, frozen at `887852f`, with no
production code changed. `npm run test:lab` FAILED at that commit: 10 of 10 polarity cases wrong, 9
evidence-bearing retention losses, 5 of 5 typed-alias positives refused. All 8 adversarial negatives
were already green and stayed green throughout, which is the only reason the positives passing means
anything.

---

## 1. RETRIEVAL delta — commit `d3f63b2`

**What changed.** Retrieval scored all 450 entries, ranked them, and cut to the top 8 *before*
admission, bounded context, or stance ran. Ranking answers "which entries most resemble this
passage"; it does not answer "which entries did this passage actually name". The working set is now
the union of the top-ranked candidates, every entry carrying exact evidence, and the entries the
previous sentence established plus their declared relations. Display caps apply after the union.

**Score movement: none.** Not "small" — none.

```
demo, v2.3.0 baseline -> commit d3f63b2
  decreased 0 · increased 0 · dropped 0 · gained 0
  behavioral differences: 3, all one thing — segments[6].weakMatches 0 -> 2
```

Segment 6 is the case worth reading:

> *"Suppose someone improves money, status, looks, charm, and exposure, gets more dates, then expects
> a particular person to say yes."*

A sentence that enumerates the five levers by name was showing **no weak matches at all**. The
diagnostic trace now shows why — twelve candidates, of which four were being discarded:

| Rank | Entry | Score | Retained because | Display |
|---|---|---|---|---|
| 1–4 | `smv:overview`, `pills:page-rp`, `lexicon:term-lms…`, `lexicon:term-high-value-man` | 0.82–0.465 | top-ranked | match |
| 5–8 | four more composite entries | 0.45–0.431 | top-ranked | not displayed |
| 9 | **`smv:looks`** — exact alias `looks` | 0.366 | **exact-evidence** | weak match |
| 10 | **`smv:status`** — exact alias `status` | 0.300 | **exact-evidence** | weak match |
| 11 | **`smv:exposure`** — exact alias `exposure` | 0.156 | **exact-evidence** | not displayed |
| 12 | **`smv:money`** — exact alias `money` | 0.156 | **exact-evidence** | not displayed |

Eight composite entries out-ranked the four levers the sentence actually named. Two of those four are
now visible as weak matches; all four are now visible to the trace. None of them became credible, and
none of the scores moved.

**Corpus-wide.** Across the three acquired sources, 812 candidates were retrieved; **6 were rescued**
that the pre-union analyzer would have discarded — `smv:money:income`, `lexicon:term-desire` ×3,
`lexicon:term-mgtow`, `lexicon:term-desire` — every one at 0.156, the sparse-shared-token penalty
floor, ranked between 13th and 71st, and every one still `not-displayed`. That is the honest shape of
this fix: it is not a recall win, it is the removal of a blind spot. Evidence that used to vanish is
now something a decision can be made about — including the decision to say no.

**Per-fixture.**

| Case | Before | After |
|---|---|---|
| cr-01 | `smv:money:provisioning-signal` absent (0.156, rank 12/17, cap 8) | retained |
| cr-02 | absent (0.300, rank 10/133) | retained |
| cr-03 | absent (0.300, rank 9/141); `smv:money:income` also absent | both retained |
| cr-04 | absent (0.156, rank 10/11) | retained |

The property assertion covers more than the four named cases: no entry carrying exact evidence may be
absent from the working set while a lower-evidence entry is present in it. `smv:money:income` in
cr-03 was found by that property, not written by hand.

---

## 2. STANCE delta — commit `103bd66`

**What changed.** Retrieval concatenates an entry's title, aliases, synopsis, boundary conditions and
common misreadings into one token bag. A token is a token — but what a token *means* depends entirely
on which surface supplied it. Words from `commonMisreadings` are the reading the canon **rejects**;
words from `boundaryConditions` are its caveat, not its claim. Stance had no access to that
distinction and was inferring it from whether the passage happened to contain disagreement words.

Every shared token is now attributed to its surface, and stance is reordered around the result.

**Retrieval is untouched. Every score below is identical before and after.**

| Case | Wrapper | Stance before | Stance after | Score | Surfaces hit |
|---|---|---|---|---|---|
| mp-01 | assert | Resembles | **Contradicts** | 0.665 (=) | alias, synopsis, boundary, misreading |
| mp-02 | assert | Resembles | **Contradicts** | 0.828 (=) | title, alias, misreading |
| mp-03 | assert | Resembles | **Contradicts** | 0.746 (=) | **misreading only** |
| mp-04 | negated | Contradicts | **Supports** | 0.739 (=) | title, alias, misreading |
| mp-05 | negated | Resembles | **Supports** | 0.828 (=) | title, alias, misreading |
| mp-06 | negated | Contradicts | **Supports** | 0.657 (=) | **misreading only** |
| mp-07 | negated | Contradicts | **Supports** | 0.761 (=) | alias, synopsis, boundary, misreading |
| mp-08 | attributed | Resembles | **Context only** | 0.716 (=) | title, alias, misreading |
| mp-09 | attributed | Supports | **Context only** | 0.631 (=) | **misreading only** |
| mp-10 | attributed | Resembles | **Context only** | 0.548 (=) | alias, synopsis, boundary, misreading |

Three findings behind that table:

1. **mp-02 and mp-05 are the same sentence plus one `not`**, and before this release they were
   indistinguishable — same score, same label. Bare `is not` is absent from `CONTRADICTION_CUES`. The
   analyzer had no way to represent the difference between asserting a misreading and denying it.
2. **The negation cases were inverted, not merely weak.** mp-07 —
   *"Passing every listed factor does not create attraction or entitlement to a relationship"* — is a
   near-verbatim paraphrase of an LE boundary and was filed as **contradicting LE at High
   confidence**. The cause was one line: the contradiction branch tested whether the *passage*
   contained disagreement language, then read that as disagreement with the *match*.
3. **mp-09 was the worst of the ten.** *"According to"* tripped the evidence cue, so the analyzer
   reported that the source **Supports** LE while the source was relaying the exact reading LE indexes
   as wrong.

The denial cue is deliberately a separate regex from `CONTRADICTION_CUES`. They answer different
questions — "is this passage denying the matched misreading" versus "does this passage contain
disagreement language at all" — and using the second to answer the first is the whole defect.

**Boundary-only overlap** is caught at the end so a caveat can never pass as a resemblance. No corpus
sentence produces one today: entries' caveats share vocabulary with their own titles and synopses,
and the passages that would not — methodology prose — are set aside by the domain gate. The rule is
therefore asserted directly against `stanceFor` rather than left untested until a source trips it.

**Elsewhere: zero.** 0 of 13 stance labels changed on the demo, 0 of 49 across the corpus. That is a
real result, not a null one — the demo transcript and all three corpus sources contain no misreading
assertions, so this defect was latent in them, exactly as the verdict-badge leak was latent in the
demo during the alias pass. The ten fixture cases are the demonstration.

**Additive output.** Each `alignment` now carries an `evidence` trace (surfaces hit, misreading
overlap, misreading-only and boundary-only flags, and which wrapper fired), and `whyMatched` gains a
`Match surfaces:` line. Those two additions account for **every** behavioral difference in the
release-wide diff: 145 on the demo, 782 / 48 / 178 on the corpus sources.

---

## 3. ALIAS delta — commit `e82647c`

The doctrine, verbatim:

> **A single word is insufficient by default. A curated high-specificity alias, or a contextual alias
> with independent relational evidence, may be sufficient.**

**What changed.** There was one rule for every single-word alias — worth 0.30 against a 0.43 admission
floor — so `hypergamy` and `provider` fired exactly, were found, and were thrown away. That is a
threshold problem wearing a vocabulary problem's clothes, and no further alias curation could have
fixed it. The overlay and index gain `standaloneAliases` and `contextualAliases`; untyped aliases keep
their current conservative behavior exactly.

**Per-fixture.**

| Case | Class | Alias | Before | After |
|---|---|---|---|---|
| ta-01 | standalone | hypergamy | 0.242, rank 3/10, refused | **0.540, rank 1, credible** |
| ta-02 | standalone | hypergamy | 0.300, rank 14/58, refused | **0.540, rank 1, credible** |
| ta-03 | contextual | provider | 0.156, rank 12/17, refused | **0.540, rank 1, credible** |
| ta-04 | contextual | provider | 0.300, rank 10/133, refused | **0.540, rank 2, credible** |
| ta-05 | contextual | breadwinner | 0.156, rank 10/11, refused | **0.540, rank 1, credible** |
| ta-06 | negative | healthcare provider | gated out | gated out ✓ |
| ta-07 | negative | cloud provider | gated out | gated out ✓ |
| ta-08 | negative | ISP | gated out | gated out ✓ |
| ta-09 | negative | **cloud provider, gate-surviving** | 0.156, refused | **0.156, refused ✓** |
| ta-10–11 | negative | sports / video game | gated out | gated out ✓ |
| ta-12 | negative | **video game, gate-surviving** | 0.198, refused | **not retained, refused ✓** |
| ta-13 | negative | rizz as praise | gated out | gated out ✓ |

Every contextual promotion above fired on a *relationship-outcome frame in the same passage*, and the
trace says so in `whyMatched`.

**ta-09 is the case that decides whether typing an ordinary word is safe**, and it is worth being
explicit about why. Six of the eight negatives are rejected by the domain gate before the alias is
ever consulted — they prove nothing about alias typing. ta-09 survives the gate with **both** a
participant frame and a relationship-outcome frame firing, so the co-fire condition alone does not
separate it from ta-03. What separates them is the modifier immediately in front of the alias:
`cloud provider` is not this concept however relational the rest of the sentence is. That is the
`notAfter` list, and it is the one addition to the adjudicated design — a restriction, so it can only
reject, never invent.

**The decisive check: the match surface did not move.**

```
match-surface strings (aliases + phrases, all 450 entries)
  before ............ 393
  after ............. 393
  ADDED ............. 0
  REMOVED ........... 0
  non-typing field changes across the whole index ... 0
```

This is the strongest form of the claim and it holds for *any* source, not just the ones tested:
typing added no matchable string, so it **cannot invent a match the untyped index would not already
have retrieved**. It can only change what happens to an exact hit that was already found. IDF is
likewise untouched, which is why — unlike the alias pass, where adding 38 strings moved third-decimal
scores everywhere — there is no residual score drift to explain here at all.

**Elsewhere: zero.** 0 typed-alias fires on the demo; 0 across all three corpus sources. Demo freeze
diff after commit 4: **PASS, 0 behavioral differences.**

### Typed, and not typed

Applied — two entries, three aliases:

| Entry | Class | Alias | Guard |
|---|---|---|---|
| `frameworks:smv-matching` | standalone | `hypergamy` | — |
| `smv:money:provisioning-signal` | contextual | `provider` | 16 `notAfter` modifiers |
| `smv:money:provisioning-signal` | contextual | `breadwinner` | — |

**Proposed, not applied.** `smv:charm`'s `game` and `rizz` are named in the ruling as contextual
examples and are deliberately deferred, on a measurement rather than an opinion:

```
if `game` + `rizz` were typed contextual (measured, not applied):
  GAINED  ds-01  "He spent two years learning game and it changed how women responded to him."
  GAINED  ds-03  "The whole pickup game industry sells confidence to men who lack it."
  LOST    ds-13  "The studio patched the game so ranked players get fewer unfair matches."
```

Two for one is arguable. The trade is not symmetric. ds-01 and ds-03 are the exact sentences the
`game` alias was ratified to catch; ds-13 is already on record in the domain benchmark as a KNOWN
MISS, retained fail-open by the append-1 dating-app-interaction frame on *"fewer … matches"*. Typing
`game` would move ds-13 from junk that is merely retained to **junk mapped onto a canon concept** —
putting a wrong claim on the ledger, rather than leaving a right one off it. Those are not equally
bad, and the fail-open contract exists precisely to keep them from being confused.

**The unblocking condition is specific:** fix the ds-13 gate miss, then type `game` and `rizz`. Until
then a 4-character alias remains inert under `minSingleAliasLength` and nothing is lost that was not
already lost.

Also proposed, unmeasured: `SMV` (`smv:overview`), `swiping` (`smv:exposure:the-online-funnel`),
`charisma` (`smv:charm`), `prestige` (`smv:status`), `resources` (`smv:money`), `appearance`
(`smv:looks`); and the title-derived `hypergamy` on `lexicon:term-hypergamy` and
`pills:page-rp:hypergamy`, which today lose the term to `frameworks:smv-matching` — arguably the wrong
destination for a reader looking up the word, and worth a curator's decision rather than mine.

---

## 4. Pass B adapter boundary

Built in this pass, consumed in the next. `analyzeDocument(document, canonIndex,
{ diagnostics: true })` adds a `diagnostics` key; omitting the option leaves the key **absent, not
empty**, so a normal export stays exactly as compact as it was. `LabAnalyzerClient.analyze` forwards
the flag on both the worker route and the main-thread fallback, so the two remain the same analyzer
with the same options rather than two engines that agree on the default path.

**Contract.**

```
diagnostics.schemaVersion        le-lab.diagnostics/1.0   (versioned independently of the
                                                           analysis schema — internal view,
                                                           expected to churn faster)
diagnostics.scoringConfigHash    the config that produced every number below
diagnostics.claimUnits[]         one per analyzed passage
  .segmentId .parentSegmentId .excerpt .wordCount .isClaimLike .mapped
  .domainRelevance               status, reasonCode, score, per-frame detected/score
  .boundedContext                the bridge, if any
  .candidates[]                  THE WHOLE WORKING SET, BEFORE DISPLAY CAPS
    .rank .rankAtRetrieval .candidatesAboveFloor
    .truncationFate              { cap, retainedBecause, survivedTruncationOnEvidence }
                                 retainedBecause ∈ top-ranked | exact-evidence | context-eligible
    .score .localScore
    .components                  phraseStrength, signatureStrength, overlapStrength,
                                 queryCoverageContribution, canonCoverageContribution,
                                 distinctiveBoost, titleBoost, beforePenalties
    .penalties[]                 { code, factor } — named, not inferred
    .evidence                    signature/phrase/alias/promoted-alias hits, distinctive
                                 overlap, misreading overlap
    .matchSurfaces               { hit[], tokens{}, misreadingOnly, boundaryOnly }
    .admission                   { credible, hasCredibleEvidence, clearsCredibleScore,
                                   clearsWeakScore }
    .contextAssistance           the bounded-context help record, if any
    .display                     match | weak-match | not-displayed
    .confidence .alignment
```

**Everything under `diagnostics` is derived.** It never feeds a decision, so the same document
analyzed with and without it produces the same matches, scores and stances — asserted as a test, not
merely intended. Nothing in the Lab interface reads it. `node fixtures/run-analyzer.mjs
--diagnostics` emits it headlessly.

**One defect found by building it.** The trace exposed that retrieval's internal `_retrieval`
bookkeeping was reaching the public export through `matches[]` and `weakMatches[]`. Internal fields
are now stripped by prefix rather than by name — naming them one at a time is how the leak happened —
and a test walks the entire result asserting that no key beginning with `_` survives.

---

## 5. Verification

```
DETERMINISM
  two pinned canon builds, byte-compare ........... IDENTICAL (613,533 bytes)
  committed index == its own rebuild .............. true (validate-canon-index.mjs, every run)
  demo fixture captured twice, byte-compare ....... IDENTICAL (187,670 bytes)

SUITE  (npm run test:lab)
  lab-intake ...................... 28 pass / 0 fail
  lab-analyzer .................... 39 pass / 0 fail   (+2: diagnostics contract, no-leak)
  lab-domain-benchmark ............ 3 pass / 0 fail
  lab-match-behavior .............. 6 pass / 0 fail    (new)
  lab-export ...................... 8 pass / 0 fail
  lab-ledger ...................... 5 pass / 0 fail
  canon-index-fixtures ............ 450 concepts / 19 sources / 65 verdicts off the match
                                    surface / 2 entries with typed aliases
  validate-canon-index ............ 450 concepts, 1.0.0+949aef381d5f
  lab_release_audit ............... PASSED (9 modules, 13 edges, 2 resources, v=2.4.0)
  lab_ui_audit .................... PASSED
  site_integrity_audit ............ PASSED

FROZEN FLOORS
  domain benchmark, 152 cases ..... domainRecall 1.000 · ignorePrecision 1.000 ·
                                    junkRecall 0.821 · 14 known misses, all fail-open
                                    — IDENTICAL to v2.3.0

DIFFS  (fixtures/diff-analysis.mjs --mode alias, v2.3.0 -> v2.4.0)
  demo ............................ 0 decreased / 0 increased / 0 dropped / 0 gained — PASS
  01-pew-online-dating ............ 0 / 0 / 0 / 0 — PASS
  02-fem-centrism ................. 0 / 0 / 0 / 0 — PASS
  04-heteropessimism .............. 0 / 0 / 0 / 0 — PASS

WORKER / FALLBACK PARITY
  both routes import js/lab-analyzer.js?v=2.4.0 and forward the same options object,
  now including `diagnostics`; there is no second implementation to diverge.
```

**Diffing method.** Segment-level only. The capped `strongestMatches` summary is narrative — the
pass-01 rig recorded a false stop there — so the score ledger is read from `segments[].matches[]`, and
the delta tables above are computed per segment, not from the summary.

**No stop condition fired.** Commit 2 produced no score movement; commit 3 required no retrieval
change; the co-fire condition was expressible with one additive key and no existing value moved; no
floor regressed; worker and fallback did not diverge.

---

## 6. Corpus re-run

All three acquired sources re-analyzed at v2.4.0 with all four artifacts regenerated, per
`md/RERUN.md` §3–4. Nothing deleted; v2.3.0 exports move to `superseded` in
`lab-corpus.manifest.json`.

| Source | passages | claims | mapped | coverage | tensions | queue | Δ vs v2.3.0 |
|---|---|---|---|---|---|---|---|
| 01-pew-online-dating | 64 | 62 | 27 | 43.5% | 9 | 35 | none |
| 02-fem-centrism | 10 | 10 | 0 | 0% | 0 | 10 | none |
| 04-heteropessimism | 29 | 28 | 1 | 3.6% | 0 | 27 | none |

**Every figure is unchanged**, and that is worth stating rather than burying: this release is a
verified no-op on the corpus. 0 stance changes, 0 weak matches gained or lost, 0 typed-alias fires,
0 score movement. The only corpus-visible effect is 6 evidence-bearing candidates retained internally
that used to be discarded — none of which cleared any display threshold.

That is a fact about **these three sources**, not about the changes. A Pew methodology summary, a
short essay, and a literary-criticism piece do not assert LE's indexed misreadings and do not use the
word `hypergamy`, so there was nothing here for two of the three fixes to bite on. The gate append
reached the same conclusion from the other direction and it still holds: the corpus's coverage
problem is a threshold problem. This release removes two ways the analyzer could be *wrong* about
what it did find, and one way it could throw found evidence away — it does not, and was not meant to,
find more.

---

## 7. SHA-256 manifest

| SHA-256 | File |
|---|---|
| `0e86957c461ff5cb3bfbb66cfdfd3c4b15876ee7e610e7f2c3821d3ee0c55a09` | `js/lab-analyzer.js` |
| `84c750697d8a53066354a6c8b14d28d1037a54980c1486a4e29f8ac09df766d2` | `js/lab-analyzer-client.js` |
| `3abe4d5c1c86e843d3ada56fcf185078993ed3067882b8ea03236f532fe50c43` | `data/le-canon-index.json` |
| `6fb85717cdf3ca2de3de47d264b0e324ec1c584d8b8f7bc3f9bd081c3147372e` | `data/canon-overlay.json` |
| `57bab28b7ea45ea4de0033f7b3b584cf271e9cafaec9cc32b7dd138897c12c07` | `fixtures/demo-v2.4.0.json` |
| `8f7c09358ffd9a47711aef32db3922dedd99d415b04727ece15194cc6f51a817` | `tests/fixtures/match-behavior-benchmark.json` |
| `708f438672f151827f93c795bfa147ceb6468c0136d19d81f53a2f8482e47771` | `tests/fixtures/domain-relevance-benchmark.json` |
| `92a319cc5769f562c0fdf613f7218b1c180e1b6b98d90ee76fccd196b59a346f` | `lab-corpus/exports/01-pew-online-dating-v2.4.0.json` |
| `2ea27a723d33ea8d882a13970ff296629358138cdae98e470ffc32eb18cde9f1` | `lab-corpus/exports/02-fem-centrism-v2.4.0.json` |
| `7dae9284f3d89bcda89bfdad4426d811c6b30edb1d3d47585ff57604962813ae` | `lab-corpus/exports/04-heteropessimism-v2.4.0.json` |

Queue, Markdown and labeling-sheet hashes are in `lab-corpus.manifest.json` under each source's
`companions`; the superseded v2.3.0 hashes are retained there under `superseded`.

---

## 8. Open, and deliberately not done here

1. **`game` / `rizz` typing**, blocked on the ds-13 gate miss. §3 above.
2. **Methodology prose is on the match surface.** Building the boundary-only rule surfaced this:
   many `statistics:` and `M-TBD-*` entries carry `boundaryConditions` that are *method notes* — "Pew
   ATP probability panel, weighted", "random-forest prediction within each dataset", DOI-verification
   chatter. Those tokens are matchable today. Nothing in this release changed it, and the domain gate
   currently masks it by setting aside the methodology prose that would collide. It is a real
   surface-hygiene problem and it belongs to a curation pass, not this one.
3. **Threshold calibration remains untouched and every export still carries
   `coverage.provisional`.** The labelling sheets regenerated in §6 are the input that would change
   that; nothing in this release fits a number to data.
4. **The stance cue lists are still cue lists.** `SUPPORT_CUES` matches the verb *"support"* in
   *"support a household"*. This release fixed which QUESTION the cues are asked, not how blunt they
   are.
