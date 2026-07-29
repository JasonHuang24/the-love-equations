# LE Lab v2.5.0 — occurrence-local co-fire, clause-scoped stance

**Released 2026-07-29.** Behavioral release answering the two open **CONTEST** findings from Sol's
verification review of v2.4.0 + v2.4.1, plus the two provenance/allowlist deferrals from v2.4.2 §7
that this release is entitled to close because it moves the analysis contract anyway.

```
Lab release ......... 2.5.0                    (was 2.4.2)
analyzer ............ 2.5.0                    (was 2.4.0)
analysis schema ..... le-lab.analysis/2.5      (was /2.4)
diagnostics schema .. le-lab.diagnostics/1.1   unchanged
feedback schema ..... le-lab.mapping-feedback/1.1  unchanged
research queue ...... le-lab.research-queue/2.1    unchanged
scoringConfigHash ... 1qt8p4u                  (was 1ntbwch)
canon index ......... 1.0.0+949aef381d5f       UNCHANGED — no doctrine moved
cache-busters ....... v=2.5.0                  (20 stamps across 9 files)
test suite .......... 158 pass / 0 fail        (was 150)
```

**The hash moved because five keys were added and no existing value changed.** Every threshold this
release inherited it also shipped: `minCredibleScore` is still 0.43, `minWeakScore` still 0.25,
`misreadingContradictionShare` still 0.36, `minContextualAliasCoFire` still 1. The five additions are
`contextualAliasWindowTokens` (8), `contextualAliasModifierLookback` (3), `minCoFireConceptLength`
(4), `minQuotedAssertionTokens` (2), and `stanceScopeExcerptChars` (120). Each is documented in place
with the case that fixes its value.

---

## 0. What this release is answering, and what it is not

Sol's review returned **CONTEST** overall. Its §3 REWORD (trace size) and its §4/§5 findings were
addressed and shipped in **v2.4.2**. What remained open, and what this release is:

| Review section | Finding | Status here |
|---|---|---|
| §1 CONTEST | Passage-wide co-fire + literal `notAfter` is not a safe discriminator | **Fixed** — commit 2 |
| §2 CONTEST | `stanceFor` gets scope, quotation, and mixed-stance cases wrong | **Fixed** — commit 3, except the irony case, which is documented as a limit |
| §4 CONTEST-completeness | Ignored rows discard fields the analyzer already computed | **Fixed** — commit 4 |
| v2.4.2 §7.4 | `canonSnapshotHash` / `inputDigest` are provenance nobody can check | **Fixed** — commit 5 |
| v2.4.2 §7.5 | The allowlist covers the match surface, not every depth | **Fixed** — commit 5 |

**Every number in Sol's review reproduces to the decimal.** Seven stance scores
(0.739 / 0.681 / 0.602 / 0.786 / 0.629 / 0.673 / 0.676) and both co-fire scores (0.540 / 0.540) were
confirmed on this machine before a single fixture was written. Where this report disagrees with the
review it says so and shows the measurement; it does not disagree anywhere material.

The five commits were RED-first and separately verified:

```
92128a2  test(lab): where the evidence sits, and which clause the negator is in, frozen RED
9b0dc86  feat(lab): a borrowed word is judged where it stands, not by its sentence
8849024  fix(lab):  a negator belongs to its clause, and a quote to whoever is inside it
e63ff9d  feat(lab): a passage the gate set aside still knows what it is
(this)   release(lab): v2.5.0
```

---

## 1. CO-FIRE — evidence has to be beside the word

### 1.1 What was wrong

A contextual alias — today only `provider` and `breadwinner`, on
`smv:money:provisioning-signal` — was promoted when *independent relational evidence existed anywhere
in the passage*, with a literal substring denylist as the only counterweight. Both halves fail, in
opposite directions.

The passage-global half is too permissive. `relationalCoFire` accepted one participant frame or one
outcome frame from anywhere in the sentence, so a clause about arguing with a girlfriend vouched for
a clause about buying cloud hosting. The denylist half is too brittle: `normalized.includes("cloud
provider")` is defeated by a hyphen, and cannot in principle cover vendor names.

And the whole thing was **passage-scoped rather than occurrence-scoped**, so one `cloud provider`
suppressed every other `provider` in the same sentence.

### 1.2 What it is now

Promotion is decided one occurrence at a time. For each occurrence:

1. **Modifier check (secondary).** The `contextualAliasModifierLookback` (3) tokens immediately before
   the occurrence are scanned for a denylist modifier, on token boundaries. Three rather than one so
   an intervening adjective or the second half of a compound cannot hide it — in `cloud-based
   provider` the disqualifying token is two positions back.
2. **Window test (primary).** Evidence must sit within `contextualAliasWindowTokens` (8) tokens of
   *that occurrence* **and** inside *that occurrence's own clause*. Two ways to earn it, neither
   suppliable by the alias itself: a distinctive concept the passage shares with the same canon entry
   (at least `minCoFireConceptLength` = 4 characters), or a human relational role term.
3. **Passage-level veto.** An affirmative non-domain frame still vetoes everything, unchanged.

One qualifying occurrence promotes the alias; no number of disqualified occurrences takes that back.

**The two-layer doctrine, stated once.** The window test is primary because it is the rule that
generalizes: `AWS provider` and `Azure provider` are rejected because nothing relational sits beside
them, not because anyone wrote AWS and Azure down. A denylist can only catch the vendors someone
thought of. The denylist is retained as a secondary defense for the cases the window would pass for
the wrong reason — a technical noun that happens to sit near relational vocabulary — and is now
token-bounded so compounds and hyphens cannot walk past it.

**Why the window is 8.** Set by the two cases it has to separate, not by taste. It must reach `men` at
eight tokens in ta-04, and it must not reach `girlfriend` at eleven in cf-01 — a word that is in the
sentence but is about something else in it. Anything from 8 to 10 separates them; 8 takes the
conservative end.

### 1.3 Per-fixture, before and after

| Case | Trap | Expected | v2.4.2 | **v2.5.0** |
|---|---|---|---|---|
| cf-01 | `AWS provider`, unlisted vendor | no match | **0.540 credible** | no match ✅ |
| cf-02 | `cloud-based provider`, hyphen defeats denylist | no match | **0.540 credible** | no match ✅ |
| cf-03 | one technical + one legitimate occurrence | credible + 2 occurrences accounted | **no match at all** | credible, `{total: 2, promoted: 1, disqualified: 1}` ✅ |
| cf-04 | two vendors, no relational noun anywhere | no match | **0.540 credible** | no match ✅ |
| cf-05 | decisive `marriage` in a different clause | no match | **0.540 credible** | no match ✅ |
| cf-06 | `marriage` four tokens away, same clause | credible | 0.540 credible | 0.540 credible ✅ (guard) |

cf-05 and cf-06 are the pair that carries the argument: the same word, in the same sentence, once
out of reach and once in it. Passage-global co-fire cannot tell them apart. Clause-clipped windows can.

**The typed-alias floor held.** ta-01…ta-13 unmoved, including the five positives the tightening
could plausibly have broken (ta-01, ta-02 `hypergamy`; ta-03, ta-04 `provider`; ta-05 `breadwinner`)
and the four negatives it must keep catching (ta-06…ta-09).

### 1.4 What the fixtures caught that the review did not

**A degenerate stem was standing in as an "independent canon concept."** After the window landed,
cf-05 *still* promoted — on the concept `re`. The stemmer strips suffixes without re-checking length
(`tokenize` filters `length > 1` *before* stemming), so `really` becomes a two-character fragment
that was found vouching for a provisioning claim about a billing vendor.

`minCoFireConceptLength` is set to 4, matching `minPhraseLength` — this file's existing answer to how
short a lexical unit can be and still count as evidence. **It is scoped to co-fire deliberately.**
Filtering degenerate stems out of the shared-token set itself would be the more general fix and would
move scores across the whole corpus, which this pass does not do. Carried to §7 as an open item.

Sol's review could not have caught this: passage-global co-fire was already promoting cf-05 through
the frame path, so the degenerate-stem path was never the deciding one.

### 1.5 Blast radius

**Exactly one canon entry types a contextual alias** (`smv:money:provisioning-signal`, aliases
`provider` and `breadwinner`); one other types a standalone alias (`frameworks:smv-matching`,
`hypergamy`), and the standalone path is untouched. Nothing else in the index can be affected by this
change. That bound is structural, not empirical — see §5 for the corpus measurement that agrees with it.

---

## 2. STANCE — a negator belongs to its clause

### 2.1 What was wrong

`MISREADING_DENIAL_CUES` and `REPORTED_SPEECH_CUES` were sentence-wide booleans. The misreading
branch read those two bits and stopped. That model cannot:

- **count** negators, so `it is not false that X` reads identically to `it is false that X`;
- tell **which clause** a negator belongs to, so a trailing `not a guarantee of marriage` was read as
  negating the preceding assertion;
- see **quotation marks at all** — the v2.4.0 ruling names "quotation or attribution", but
  `REPORTED_SPEECH_CUES` is a verb list and `printed` is not on it;
- read what comes **after** an attribution, so endorsement and rejection were both silence;
- express **partial** assertion, so a half-withdrawn claim came out as a whole one.

### 2.2 What it is now

The clause carrying the misreading is located by token overlap with the entry's own
`commonMisreading` surface, and the rest of the sentence is read relative to it.

| Mechanism | Rule |
|---|---|
| **Negation** | Counted inside the assertion clause; parity decides. Two negators restore the assertion. A negator in a trailing clause negates that clause. |
| **Complement** | Clause splitting is on punctuation only and does **not** split on `that`, so a negator in a matrix clause still scopes into its complement (`does not prove that X`). |
| **Quotation** | A span reports the claim only if it *carries* the claim: at least `minQuotedAssertionTokens` (2) of the misreading **and** a finite verb. |
| **Attribution** | Governs forward — counted in the assertion clause or any clause before it, never one after. |
| **Follow-up** | Exactly one, from clauses after the assertion: qualification → *Challenges*; rejection → speaker denies; endorsement → speaker asserts. Qualification outranks both. |

**No parser and no new dependency.** Clauses come from punctuation, negators are counted, cue sets are
matched per clause. The stop condition in the brief — halt if clause-scoped stance cannot be made
deterministic without a heavier parser — was never approached.

**The clause splitter is shared with co-fire.** Both features need the same answer to "which clause is
this token in", and two splitters that can drift apart is a defect waiting to happen. One rule
carries both: a hyphen ends a clause only when it is **not** joining two word characters, which keeps
`cloud-based` inside one clause while still breaking on an em dash between clauses.

### 2.3 Per-fixture, before and after

| Case | Wrapper | Expected | v2.4.2 | **v2.5.0** |
|---|---|---|---|---|
| sc-01 | negation parity | Contradicts | **Supports** 0.739 | Contradicts ✅ |
| sc-02 | quoted assertion | Context only | **Contradicts** 0.681 | Context only ✅ |
| sc-03 | partial | Challenges | **Contradicts** 0.786 | Challenges ✅ |
| sc-04 | attribution + endorsed | Contradicts | **Context only** 0.629 | Contradicts ✅ |
| sc-05 | attribution + rejected | Supports | **Context only** 0.673 | Supports ✅ |
| sc-06 | negation scope | Contradicts | **Supports** 0.676 | Contradicts ✅ |
| sc-07 | **irony (stated limit)** | Contradicts | Contradicts 0.602 | Contradicts ✅ (held) |
| sc-08 | negation + attribution | Context only | Context only 0.684 | Context only ✅ (guard) |
| sc-09 | attribution + partial | Challenges | **Context only** 0.639 | Challenges ✅ |
| sc-10 | nested quotes | Context only | Context only 0.582 | Context only ✅ (guard) |
| sc-11 | attribution + rejection | Supports | **Context only** 0.676 | Supports ✅ |
| sc-12 | bare rejection | Supports | Supports 0.739 | Supports ✅ (guard, now for the right reason) |

**Scores did not move.** Every figure above is the same before and after: stance is a label on a
match, not an input to one. Eleven labels changed; zero scores did.

**The ten v2.4.0 polarity cases (mp-01…mp-10) are unmoved.** They route through the entirely new
logic and land exactly where they always did — the parity rule reproduces `it is false that X`
(1 negator, odd, denial) and `does not prove that X` (1 negator, complement scoped in) without either
being special-cased.

**sc-12 deserves a note.** It was green before and is green now, but it was previously right *by
accident*: the sentence-global cue happened to fire on `false` in a trailing clause. It now reaches
the same label deliberately — assertion clause parity zero, following clause rejects. It is in the
block specifically so sc-06 could not be fixed by deleting trailing-clause sensitivity.

### 2.4 Composition adjudication: zero AMBIGUOUS

The brief permitted flagging genuinely undecidable compositions AMBIGUOUS, and treated more than
three as an architecture flag that the stance model is underpowered. **None were flagged.** All five
composition variants resolved under one consistent reading, and all five are green.

The reading that resolved them: *attribution assigns the claim, follow-up reassigns it, qualification
overrides both.* sc-08 stays Context only because a reported denial is still reported — the standing
doctrine that a relayed claim carries no speaker stance applies whichever way the relayed claim
points, and this pass did not need to revisit it.

### 2.5 The irony limit, stated rather than moved

sc-07 — `Sure, a large inbox is a 'large pool of relationship candidates'—and every spam message is a
soulmate.` The speaker is sarcastically rejecting the misreading, so the humanly correct label is
*Supports*. The analyzer says *Contradicts* and will continue to. Detecting irony requires world
knowledge a local deterministic stack does not have and should not pretend to.

It is frozen **asserting current behavior** with `limitDocumented: true`, and a dedicated test
enforces that a documented limit's `expected` and `observedAtFreeze` agree — so if a later pass makes
them disagree, the case has stopped being a limit and must be re-adjudicated rather than left in the
block asserting something nobody decided.

**It also does real work as a guard.** sc-07's quoted span covers a bare noun phrase inside the
speaker's own sentence; sc-02's covers a whole proposition including its copula. The finite-verb test
is what separates them, and without it, fixing sc-02 would silently have changed sc-07 — moving the
limit while appearing to document it. The published trace shows this working: sc-07's scope block
reads `quotation: { spanCount: 1, assertionBearing: false }`, which is precisely why the label lands
where it does.

Published in three places: the `lab.html` instrument-limits section ("Irony is read straight"), the
analysis's own `limitations[]` array, and the fixture note.

### 2.6 The stance trace

`alignment.evidence.scope` is new, present only when the misreading branch ran:

```json
{
  "clauseCount": 2,
  "assertionClause": { "index": 0, "excerpt": "the podcast says a large inbox is a large pool of relationship candidates" },
  "negation":    { "count": 0, "parity": "even", "cues": [] },
  "quotation":   { "spanCount": 0, "assertionBearing": false, "excerpt": null },
  "attribution": { "detected": true, "cue": "the podcast says", "clause": 0 },
  "followUp":    { "kind": "endorsement", "cue": "exactly right", "clause": 1 }
}
```

A reader who disagrees with a label can see the exact span and cue that produced it. The generic cue
ladder below the misreading branch is still sentence-wide and says so by publishing `scope: null`.

**One semantic change to a published field.** `evidence.denial` now reports clause-scoped parity
rather than sentence-wide presence, for matches that took this branch. It stopped driving the
decision, and a published field that disagrees with the decision while looking authoritative is the
exact failure mode v2.4.2 existed to correct. `evidence.reportedSpeech` is likewise now the scoped
answer. Both field names are unchanged so a reader comparing two analyses sees the same keys.

---

## 3. IGNORED FIELDS — a set-aside passage still knows what it is

### 3.1 The finding, and where it actually lived

Sol accepted the adapter's behavior and contested its completeness claim, and was right on both. The
exporter was correct to refuse to recompute — a number it invented would be indistinguishable in the
file from one the analyzer produced, and only one of those is evidence. The mistake was one layer up:
`detectClaimUnits` computes `claimLikelihood`, `isClaimLike`, `sourceBoundary` and `boundedContext`
for every unit **before** the gate rules on it, and `ignoredPassageRecord` then dropped them.

Nothing needed inventing. The analyzer had the values and threw them away, and the exporter
faithfully reported the hole as a limit of the pipeline.

### 3.2 What is published now

`domainRelevance.ignoredPassages[]` gains nine fields, all read across unchanged:

| Field | Why it matters |
|---|---|
| `claimLikelihood`, `isClaimLike`, `machineClaimLike` | Claim grammar is decided independently of the domain gate. A passage can be set aside as off-domain and still be perfectly claim-like; without these a reviewer cannot tell which verdict they are disputing. |
| `sourceBoundary` | The field a `segmentation-error` report is *actually about*. Reviewers filing that disposition were being told the boundary data was unpublished. |
| `boundedContext` | Makes `predecessor` resolvable for set-aside rows. |
| `decisiveReason` | Was collapsed into `reasonCode`. |
| `domainScore`, `nonDomainScore`, `frameScores` | Separates "no relational frame was detected" from "a relational frame scored 2.5 against a threshold of 4". One complaint is about the gate's vocabulary, the other about its threshold; as flat nulls they exported identically. |

`claimUnit.unpublishedFields.fields` is now empty for these rows.

**The candidate trace stays unavailable**, reason `retrieval-not-run`. That one is not a gap to close:
retrieval genuinely did not run.

### 3.3 The v2.4.1 wording

`md/lab-v2.4.1-release.md` §1.4 claimed **"Impact: none on the routing that matters."** That does not
stand, and it is corrected **in place** with a dated correction block rather than quietly edited — it
recorded a real decision made on reasoning that turned out to be wrong about where the values lived,
and the correction says which half was right (refusing to recompute) and which was not (calling it an
adapter limitation, and claiming no routing impact when `segmentation-error` is exactly the
disposition the omission hurt). `md/lab-schemas.md` and `md/FEEDBACK-PIPELINE.md` are updated to the
2.5 contract.

---

## 4. The two v2.4.2 §7 deferrals, folded in

Both were deferred on the same grounds — "additive to `le-lab.analysis`, belongs to a release allowed
to move that contract." This is that release.

### 4.1 §7.4 — provenance that can be checked (`provenance.identity`)

`canonSnapshotHash` and `inputDigest` have been in the diagnostic trace since v2.4.2, with nothing to
check them against: the analysis published no counterpart, so they were provenance a human could
compare across files rather than something a consumer could verify.

The analysis now publishes both under `provenance.identity`, computed **once** and passed to both
sinks, so a trace cannot disagree with its own analysis by construction. A trace produced from a
substituted canon index or a different document is now detectable, not merely comparable by eye. A
test asserts the two agree, that `diagnostics.analysisId === result.id`, and that a different input
moves `inputDigest` while leaving `canonSnapshotHash` fixed.

### 4.2 §7.5 — the allowlist at every export depth

v2.4.2 put the **match** surface behind an allowlist because that is where a working field had
actually leaked. The depths above it stayed a denylist by convention: `safeSegments` spread the whole
segment and set `candidates: undefined`, which leaves the key present, publishes whatever else
retrieval hung on the segment, and publishes the unit whole.

`PUBLIC_SEGMENT_FIELDS` and `PUBLIC_UNIT_FIELDS` now name what those two depths publish, and
`publicSegment()` builds both. The recursive no-underscore walk remains as the backstop everywhere
else.

**An honest note on what this did and did not change in the files.** In a JSON export,
`candidates: undefined` was already invisible — `JSON.stringify` drops it — so the committed v2.4.0
and v2.5.0 export files have identical segment keys. The fix matters for the **live object**, which
is what the app, the ledger, and the feedback exporter actually read, and for the class of failure
rather than the instance: a field named `retrievalBookkeeping` would have shipped everywhere. A test
covers exactly that case.

This is not the full published-schema freeze §7.5 described as "stronger and a larger piece of work".
It is the same inversion applied one level up. Carried to §7.

---

## 5. Index-wide match-surface diff

Segment-level diffing, `2e28fc2` (v2.4.2) → this release, across the three archived corpus sources
and the shipped demo.

```
01-pew-online-dating.txt   64 segments   0 moved
02-fem-centrism.txt        10 segments   0 moved
04-heteropessimism.txt     29 segments   0 moved
built-in demo              11 segments   0 moved
─────────────────────────────────────────────────
TOTAL                     114 segments   0 moved
   matches added 0 · removed 0 · scores moved 0 · stances moved 0 · ignored-count delta 0
```

**The harness proves it can detect this change before it reports zero.** Two sentinels run every time:
cf-01 (co-fire) moves `smv:money:provisioning-signal @0.540 → no match`, and sc-06 (stance) moves
`frameworks:option-pool @0.676 Supports → Contradicts`. Both moved. A zero from a harness that cannot
detect the change it is measuring is not evidence, and this one is instrumented so it cannot make
that claim silently.

### Attribution — why zero is the *expected* answer, not a suspicious one

| Change | Why the corpus does not exercise it |
|---|---|
| **Co-fire** | Structurally bounded: exactly one canon entry types a contextual alias, and no corpus segment was promoting it. The bound is a property of the index, not of these four documents. |
| **Stance** | The rewrite is scoped to the misreading branch, which requires `misreadingOverlap ≥ 0.36`. No passage in this corpus reaches that threshold. Every corpus stance label comes from the generic cue ladder, which is untouched. |
| **Ignored fields** | Purely additive. Fields appear; none change value. |
| **Allowlist** | The removed key was already absent from serialized JSON. |
| **Provenance identity** | Purely additive. |

The corpus is a **regression check** here, not a demonstration. The demonstration is the eighteen
fixture cases in §1.3 and §2.3, which were written precisely because the corpus does not contain
these shapes. Reporting a corpus zero as though it proved the change was safe *in general* would be
the mistake; it proves the change moved nothing that was already working.

### Determinism

Output is byte-identical across repeat runs and identical with diagnostics on or off, for all three
sources:

```
01-pew-online-dating.txt   run1 == run2 ✓   diagnostics-independent ✓   becb3b383c3cfe53…
02-fem-centrism.txt        run1 == run2 ✓   diagnostics-independent ✓   4d80e3dff57a4b60…
04-heteropessimism.txt     run1 == run2 ✓   diagnostics-independent ✓   ed8f963a3d5f6258…
```

### Worker / fallback parity

Verified in the browser at `v=2.5.0`, not by inspection. The demo analyzed through
`LabAnalyzerClient` (worker) and through a direct `analyzeDocument` import (fallback) serialize to
**137,177 identical bytes**, `generatedAt` excluded. Parity is also structural — one implementation,
two call sites — but it is now measured.

---

## 6. Corpus re-run at v2.5.0

Three of four sources; 03 (Gottman) remains excluded by standing decision and is still a v2.1.2
artifact, so `singleVersionStatus.isSingleVersion` stays `false` for the same reason as before.

| Source | Passages | Claim-like | Mapped | Coverage | Queue | Set aside | vs v2.4.0 |
|---|---|---|---|---|---|---|---|
| 01 Pew, online dating | 64 | 62 | 27 | 43.5% | 35 | 41 | identical |
| 02 Tomassi, Fem-Centrism | 10 | 10 | 0 | 0% | 10 | 41 | identical |
| 04 Seresin, Heteropessimism | 29 | 28 | 1 | 3.6% | 27 | 91 | identical |

Every recorded v2.4.0 figure reproduced exactly. The exports differ only additively:

| | 01 | 02 | 04 |
|---|---|---|---|
| match surface | identical | identical | identical |
| bytes | 681,576 → 702,370 | 90,981 → 111,110 | 257,890 → 302,537 |

The growth is entirely the nine new set-aside fields plus `provenance.identity`; it is largest on 04,
which has the most set-aside passages (91), exactly as it should be.

### SHA-256 — v2.5.0 analysis exports

| SHA-256 | File |
|---|---|
| `021735953e861d3aa007f195d2964242421e3dcc550aadff3b35c99b2911ce85` | `lab-corpus/exports/01-pew-online-dating-v2.5.0.json` |
| `3ba58583a9b7d003842c428276c490c2875498e1e59bb1adcdf03186212e98b5` | `lab-corpus/exports/02-fem-centrism-v2.5.0.json` |
| `9267cb51690de5c687ab3ad105ca60bfb0aa35a5aff56580c676dfba72dc1796` | `lab-corpus/exports/04-heteropessimism-v2.5.0.json` |

Queue, Markdown and labeling-sheet hashes are in `lab-corpus.manifest.json` under each source's
`companions`. The v2.4.0 exports are retained under `superseded` — they are the *before* side of the
comparison in §5, and deleting them would delete the evidence.

### Canon index: regenerated, unchanged

`node scripts/build-canon-index.mjs` reproduces the file **content byte-for-byte**;
`indexVersion` stays `1.0.0+949aef381d5f` and all 450 concepts are identical. No doctrine moved in
this release.

**One honest caveat on the determinism check.** The file's *SHA-256* is not reproducible, because
`generatedAt` is a wall-clock stamp written on every build. Content identity is carried by
`indexVersion`, which is a content fingerprint and is stable. The timestamp-only regeneration was
therefore **reverted rather than committed** — committing it would have produced a diff that looks
like a canon change and is not. Flagged in §7: the archive doctrine in `md/RERUN.md` treats SHA-256 as
the reproducibility anchor, and for this one file that is not quite true.

---

## 7. Open, and deliberately not done here

1. **Everything open in v2.4.2 §7.1, §7.3 and §7.6 is still open.** `game`/`rizz` typing blocked on
   ds-13; methodology prose on the match surface; threshold calibration, with every export still
   carrying `coverage.provisional`; the mapping benchmark still has no cases, by design; a second flag
   on a row still does not supersede the first. Nothing here touched any of them.
2. **Degenerate stems are still in the distinctive-token set.** `really → re` was fixed *locally* for
   co-fire (§1.4). The general fix — a minimum length applied after stemming, or a stemmer that does
   not produce two-character output — would move `distinctiveBoost` and therefore scores across the
   whole corpus. That belongs to the calibration pass, with a corpus diff, not to a behavioral release
   that has promised to move no scores. **This is the highest-value item on this list**: it is a live
   defect on a path that decides admissions, and it was found by fixture rather than by review.
3. **The published-schema freeze is still not done.** §4.2 extended the allowlist to the segment and
   unit depths, which is where the exposure was. `researchQueue`, `pressureTests`, `strongestMatches`,
   `adjacentDoctrine` and the diagnostics tree still rely on the recursive no-underscore backstop.
4. **Irony is not detected and will not be** without a model. Documented in three places (§2.5). If
   the Lab ever gains a non-local mode, this is the first thing that mode should be measured on.
5. **Pre-posed concessions are not read.** Follow-up cues are matched only in clauses *after* the
   assertion, because endorsement and rejection are anaphoric — "that is false" points backwards.
   `Although that equivalence is overstated, [misreading]` therefore reads as a flat assertion. A
   subordinator-aware pre-scan would fix it; no fixture demanded one and inventing the case to justify
   the code is how cue lists rot.
6. **The canon index SHA-256 is not reproducible** (§6). Either drop `generatedAt` from the built
   file, or state in `md/RERUN.md` that `indexVersion` — not SHA-256 — is this file's identity.
7. **The corpus cannot exercise either fix.** §5 explains why, and it is a statement about the corpus,
   not about the release. Until a source arrives containing a contextual alias in a technical clause
   or a passage that restates an indexed misreading, the fixtures are the only regression surface
   these two behaviors have.

---

## 8. Verification

```
npm run test:lab                          158 pass / 0 fail   (was 150)
  lab-intake                               28
  lab-analyzer                             44   (+3: allowlist depth ×2, provenance identity)
  lab-domain-benchmark                      3   152 cases, 1.000 precision / 1.000 recall
  lab-match-behavior                        9   (+3: co-fire block, stance block, irony limit)
  lab-export                                8
  lab-ledger                                5
  lab-feedback                             24   (+2: set-aside field publication, read-across)
  lab-feedback-integrity                   25
  lab-canon-mapping-benchmark               4
  lab-short-utterance                       8
  canon-index-fixtures                    450 concepts, 19 sources, 2 typed-alias entries
  validate-canon-index                    450 concepts, 1.0.0+949aef381d5f
  lab_release_audit.py                    PASSED  (10 modules, 16 edges, 2 resources, v=2.5.0)
  lab_ui_audit.py                         PASSED  (151 IDs, 29 ARIA refs, 9 labels, 33 buttons)
  site_integrity_audit.py                 PASSED  (24 HTML files, 508 local targets)
```

**Floors, all green and unmoved:** the 152-case domain benchmark at 1.000/1.000 (third metric
unchanged at 0.821); the 10 misreading-polarity cases; the 13 typed-alias cases; the short-utterance
matrix; the empty canon-mapping benchmark.

**Browser verification** at `http://localhost:8761/lab.html`, no console errors, every module and the
canon index served at `v=2.5.0`. A live worker analysis of the demo reports `analyzer 2.5.0`,
`le-lab.analysis/2.5`, `scoringConfigHash 1qt8p4u`, `provenance.identity` present, segment keys
allowlisted with no `candidates` key, set-aside rows carrying their pre-retrieval fields, the irony
limit in `limitations[]`, and 6 mapped segments — the same 6 as v2.4.2.

**One test was changed rather than added.** `tests/lab-analyzer.test.mjs` asserted the literal string
`'le-lab.analysis/2.4'`; it now asserts `ANALYSIS_SCHEMA_VERSION`. The literal made a routine version
bump present as a coverage regression, which is a false alarm that trains people to ignore the test.

**One test contract was rewritten.** The set-aside feedback test asserted that pre-retrieval fields
were *unpublished*. That is the contract this release changes, so it now asserts the new one, split
three ways: the trace is still unavailable, every pre-retrieval field is present and well-typed, and
every published value equals the analyzer's own record for the same passage — so "read across, never
recompute" is tested rather than asserted in a comment.

---

## 9. Files

| File | Change |
|---|---|
| `js/lab-analyzer.js` | Occurrence-local co-fire, clause splitter, relational role terms, clause-scoped stance, ignored-passage fields, segment/unit allowlist, `provenance.identity`, version + schema bump |
| `js/lab-feedback.js` | Set-aside rows read pre-retrieval fields across; empty `unpublishedFields` |
| `js/lab-app.js`, `lab-demo.js`, `lab-export.js`, `lab-extractors.js`, `lab-analyzer-client.js`, `lab-analyzer-worker.js` | Cache-busters, `LAB_RELEASE` |
| `lab.html`, `css/lab.css` | Cache-busters; instrument-limits gains irony non-detection |
| `tests/fixtures/match-behavior-benchmark.json` | Two new blocks: `contextualCoFire` (6), `stanceComposition` (12) |
| `tests/lab-match-behavior.test.mjs` | Three new tests; block count 3 → 5 |
| `tests/lab-analyzer.test.mjs` | Three new tests; one literal → constant |
| `tests/lab-feedback.test.mjs` | Set-aside contract rewritten, one test → three |
| `lab-corpus.manifest.json` | Epoch → 2.5.0; three sources re-run, v2.4.0 superseded |
| `md/lab-v2.5.0-red-manifest.md` | New — the RED freeze |
| `md/lab-v2.5.0-release.md` | This file |
| `md/lab-v2.4.1-release.md` | Dated correction to §1.4 |
| `md/lab-schemas.md`, `md/FEEDBACK-PIPELINE.md` | 2.5 contract |
| `data/le-canon-index.json` | **Unchanged** — regenerated, content-identical |
