# LE Lab v2.6.1 — release report

A single-defect hotfix on v2.6.0. Sol's verification of that release returned one CONTEST and
otherwise ACCEPT; this is the CONTEST, and nothing else.

**The defect.** `disqualifyingModifier` compared a denylist entry against the words beside a
contextual alias by testing the literal term and a naive `${modifier}s`. For `utility` that asks the
complement whether it contains `utilitys`. It contains `utilities`, and the technical sense walked
straight past the guard v2.6.0 had just built to catch it.

**The shape of it, which is the part worth keeping.** The missing word is not the defect. The defect
is that the two sides of the comparison were in *different representations* — one a written word, the
other a guess at how that word's plural is spelled — and a comparison whose sides disagree about what
a word is will always be defeated by some word. v2.6.0 gave this analyzer a stemmer with a derived-
stem floor. The fix is to use it on both sides rather than keep a second, private idea of a plural.

```
Lab release token ......... v=2.6.0 -> v=2.6.1   (19 references across 8 files)
analyzer .................. 2.6.0 -> 2.6.1
scoringConfigHash ......... bt0a7p           unchanged — no config value added, changed, or removed
canon index ............... 1.0.0+949aef381d5f  unchanged
analysis schema ........... le-lab.analysis/2.6  unchanged
research-queue schema ..... le-lab.research-queue/2.1  unchanged
suite ..................... 170 pass / 0 fail  (+6 benchmark cases inside existing tests)
suite, at the record pass .. 178 pass / 0 fail  (see §4; no analyzer change, Appendix A for why)
```

> **The analyzer version DOES move here, and v2.4.2's rule is why.** That release held the version at
> 2.4.0 because not one of its changes moved a number. This one moves three verdicts. The version
> names the engine that produced the numbers; the numbers changed, so it moves.

| Commit | Subject |
|---|---|
| `5b9c51a` | a plural the denylist cannot spell, frozen RED |
| `fb8a68f` | the denylist and the passage finally speak the same morphology |
| this | release token, manifest, report |

**No stop condition fired.** No non-denylist scoring path changed — `disqualifyingModifier` has one
caller, `promotedAliases`, and it returns before doing anything when the alias has no denylist. No
floor regressed. `stemToken` itself is untouched; the fix consumes it. No schema change was needed.

---

## 1. The denylist, enumerated rather than guessed at

The fix was scoped by reading the canon, not by pattern-matching Sol's repro. The whole canon holds
**one** non-empty `notAfter` list: `smv:money:provisioning-signal`, alias `provider`, sixteen entries.

Two of the sixteen have a real plural the literal-plus-s test cannot produce:

| Entry | Real plural | `literal + s` | Same stem |
|---|---|---|---|
| `utility` | utilities | miss | **hit** |
| `energy` | energies | miss | **hit** |

And — this is the half a careless fix gets wrong — **nine of the sixteen** have a plural the *stemmer*
cannot produce, because this stemmer was never a plural normalizer:

| Entry | Plural | Stem of entry | Stem of plural | Same stem |
|---|---|---|---|---|
| `service` | services | `service` | `servic` | miss |
| `healthcare` | healthcares | `healthcare` | `healthcar` | miss |
| `health care` | health cares | `health care` | `health car` | miss |
| `insurance` | insurances | `insurance` | `insuranc` | miss |
| `hosting` | hostings | `host` | `hosting` | miss |
| `software` | softwares | `software` | `softwar` | miss |
| `care` | cares | `care` | `car` | miss |
| `childcare` | childcares | `childcare` | `childcar` | miss |
| `child care` | child cares | `child care` | `child car` | miss |

Seven unify, nine separate; the two the stemmer repairs are a subset of the seven. The counts were
taken by running every entry and its plural through the shipped `tokenize`, not by eye — an earlier
count by eye said eight and missed `hosting`, and the commit messages on `5b9c51a` and `fb8a68f` carry
that stale number. The argument is unchanged either way.

So **the fix is a union, not a swap.** Replacing literal matching with stemming — the most literal
reading of "put both sides through the stemmer" — repairs two entries by breaking nine, and turns
`cm-03`, a fixture v2.6.0 already shipped, RED. `cm-19` exists to say so out loud.

A union is also the only version of this that is safe by construction: adding a test can only ever
disqualify *more*. Nothing that was rejected before can be promoted by this change.

---

## 2. What moved

Three cases, all of them the defect:

| Case | Text | Before | After |
|---|---|---|---|
| `cm-16` | During our marriage the provider **of utilities** handled our archive. | credible 0.540 | disqualified |
| `cm-17` | During our marriage the **utilities provider** handled our archive. | credible 0.540 | disqualified |
| `cm-18` | During our marriage the provider **of renewable energies** handled our archive. | credible 0.540 | disqualified |

`cm-17` is not decoration. Both the backward lookback and the v2.6.0 forward complement call one
comparison helper, and a fix written only into the new branch would leave the older one broken while
passing Sol's repro. The case is there to fail that fix.

Guards, green before and after:

| Case | Guards against |
|---|---|
| `cm-19` | `financial services provider` — the swap-instead-of-union fix |
| `cm-20` | `the provider for our families` — a spelling rule that treats any `ies` word as its `y` singular |
| `cm-04` | `the provider for the household` — a fix that disqualifies on the shape of the complement rather than on the denylist |
| `cm-02`, `cm-03` | the v2.6.0 bin-1(b) behavior this release must not disturb |

### 2.1 Multiword entries, as shipped

> **This subsection was rewritten on 2026-07-29 after four review rounds.** It stated its behavior
> wrongly three times, and the corrections that fixed it are preserved unaltered in **Appendix A**.
> They are worth reading: the errors were more instructive than the behavior. What follows is the
> current account only.

`carries()` iterates the **denylist in order** and tries three tests **inside each modifier**,
returning on the first modifier any test matches. The loop order is the part that is easy to get wrong,
and this subsection got it wrong until Sol's fifth review: the tests are not global-priority lanes, so a
literal hit on a LATER modifier never happens — the loop has already returned on an earlier one.

  for (const modifier of denylist) { if (test1) return; if (test2) return; if (test3) return; }

The three tests, in the order they run within one modifier:

| # | Test | Applies to |
|---|---|---|
| 1 | the literal surfaces — `modifier`, `modifier + s` | every entry |
| 2 | `run.includes(modifier)`, a **substring** of the joined complement | multiword entries only |
| 3 | a contiguous run of **stems** | every entry |

Test 3 is what v2.6.1 added. It was **added beside** tests 1 and 2, not substituted for them, and the
union is the whole of the safety argument: a test that only ever adds disqualifications cannot promote
anything an earlier test rejected. That is a proof. It does **not** follow that nothing changes — a test
that adds disqualifications changes behavior every time it adds one, which is exactly what the
`utilities` repair in §1 does.

**Test 2 was retained, so the shape it catches is still caught.** `the provider for health caregivers`
is disqualified by `health care` found inside `caregivers`, and the humanly correct reading there is the
provisioning sense. `bl-17` and `bl-18` freeze that as a documented limit under the `morphology` family.

**Test 3 is reachable and can decide a case alone.** It decides whenever two stems line up and no
earlier test fires, which for the canon's two multiword entries requires suffixing *both* words:

**Read the columns carefully, because they answer two different questions.** The three test columns
are *independent predicates* — which modifiers each test would match if asked about every modifier.
The last two columns are what production actually *does* under the loop order above. Conflating the two
is the error Sol's fifth review found: it made this table wrong for `health care` and `healths care`.

| Complement tokens | Test 1 matches | Test 2 matches | Test 3 matches | Modifier returned | Selected by |
|---|---|---|---|---|---|
| `health caregivers` | — | `health care` | — | `health care` | test 2 |
| `health care` | `care` | `health care` | `health care`, `care` | `health care` | **test 2** |
| `healths care` | `care` | — | `health care`, `care` | `health care` | **test 3** |
| `healthfulness carefulness` | — | — | `health care`, `care` | `health care` | test 3 |
| `childfulness carefulness` | — | — | `care`, `child care` | `care` | test 3 |
| `healths careers` | — | — | `health care`, `care` | `health care` | test 3 |

`health care` and `healths care` both have a literal `care` match that **never happens**: `care` is at
index 13 of the denylist and `health care` at index 2, so the loop returns before `care` is examined. A
literal match on a later modifier is a counterfactual, not an earlier branch.

**So production resolves FOUR of these six through the stem run, not three.** Two properties have to be
kept apart, and both are now asserted separately:

| Property | Sequences | What it establishes |
|---|---|---|
| the stem run **selected** the returned modifier | `healths care`, `healthfulness carefulness`, `childfulness carefulness`, `healths careers` | what production actually does |
| the stem run is the **only** test that could match at all | `healthfulness carefulness`, `childfulness carefulness`, `healths careers` | that the branch is not inert — the counterfactual that refutes the retracted claim |

The three sequences in the second row are inflected forms with no natural sentence behind them —
`healthfulness`, `childfulness`, `healths careers`. That is an observation about the examples found, not
a proof that none exists.

### 2.2 What the table is, and what it is not

The table above is frozen in `tests/lab-match-behavior.test.mjs`: every column asserted against the
replica — including `Selected by`, which was declared and never checked until Sol's fifth review, and
was wrong for two rows when it finally was — and both stem-run properties asserted by *identity* rather
than by count, since a count is satisfied by any three or four rows. The replica now executes the
shipped loop order rather than treating the tests as lanes. Frozen against the replica is still not the
same as frozen against production, which is the rest of this subsection.

`carries` is **not exported**, so per-branch attribution is computed by a **replica derived from the
analyzer's source**. Two independent anchors tie it to production, per row:

| Anchor | What it proves |
|---|---|
| candidate `score` 0.156, `fate` `below-weak-threshold`, `admission.credible` false — with a `healths workers` control at 0.540 / `displayed` | the alias was refused, and the sentence frame is not what refused it |
| `contextualAliasTrace`: `disqualifiedBy: "technical-modifier"` and the exact modifier in `reason` | the **denylist** refused it, and production selected the **same first modifier** the replica did |

**What no current anchor proves is which of the three tests selected that modifier.** The trace publishes
one modifier and not the branch that found it, so production could change the branch while preserving the
modifier, the score, the fate and the admission result, and the replica's per-branch columns would go
false while every anchor stayed green. **So §2.1's per-test columns and its `Selected by`
column are a source-derived model, not a production freeze** — and calling them a freeze was itself one
of the four errors Appendix A records. What IS frozen against production is narrower and worth stating
positively: for all six sequences the denylist is what refused the alias, and production named the same
modifier the replica did.

Closing it means publishing the branch: `{modifier, matchedBy}` from `carries`, or a `matchedBy` field on
`contextualAliasTrace`. Both are analyzer changes and belong to **v2.6.2**; §7.2 carries them.

**One copy of the retracted claim is deliberately left standing.** The comment on `carries()` at
`js/lab-analyzer.js:1878` still describes test 3 as having replaced test 2. Correcting a comment moves
the analyzer's hash, which the record pass was not permitted to do; Jason ruled documentation-only and
required the divergence be named rather than left silent. It is queued in §7.2 with the generalization
that rewrites the comment anyway.

---

## 3. What it widens, stated as a cost

> **This section was rewritten on 2026-07-29 after four review rounds**, for the same reason as §2.1.
> Its four corrections are preserved unaltered in **Appendix A**, including the two enumerations that
> were published as complete and were not.

Stemming both sides reaches surfaces beyond plurals. The enumeration lives in
`tests/fixtures/denylist-widening-census.json` (`le-lab.denylist-census/1.2`) rather than in this
paragraph, because two hand-written versions of it shipped wrong.

**Two different claims, and only the first is mechanical.**

1. **What the comparison REACHES.** Every candidate in the census stems to its entry, so the shipped
   comparison disqualifies all of them today. That set is `reachedAndAttested` **plus**
   `reachedButUnattested`, it is complete over the generator the fixture declares, and a test
   regenerates it from `stemToken`'s own suffix inventory read out of the analyzer source. Nothing here
   is a matter of opinion.
2. **Which of those a real source could contain.** A human evidence judgment, recorded per surface and
   revisable. It bounds the *practical* cost, never the reach.

The table below is the **attested** subset — the practical cost. It is not the reach; the census is.

| From | Attested newly reached surfaces |
|---|---|
| `hosting` → `host` | host, hosts, hosted, hosters, hostable |
| `network` | networked, networking, networkers, networkable, networkization |
| `cloud` | clouded, clouding, cloudable |
| `service` | serviceable |
| `medical` | medicalization |
| `internet` | internetization |
| `software` | softwareization |
| `care` | careers, carefulness |
| `payment` → `pay` | pay, paying, payers, payable, payed |
| `energy`, `utility` | energies, utilities *(the two §1 repairs, listed for completeness)* |
| `health care`, `child care` | not describable as single surfaces — see §2.1's truth table |
| `healthcare`, `childcare`, `insurance` | nothing attested |

**Most of these are the technical sense the denylist exists to reject.** `the provider of hosted email`
and `the provider for networked storage` are both now correctly disqualified, and that is the fix
working. **Three are not, and lumping them in was an overclaim this section made twice:**

| Surface | Why it is not simply an improvement |
|---|---|
| the `pay` family | `paying` is the provisioning sense in plain English. `bl-16`, below. |
| `careers` | A common word with no technical sense in this register, and adjacent to the relational meaning the alias exists to catch. |
| `carefulness` | Same, and it reaches `care` through a suffix rule rather than through anything about meaning. |

The asymmetry is arbitrary rather than principled, and saying so is the point: `carers` and `caregivers`
stem to `car` and `caregiv` and do **not** match, so which care-words the denylist sees is decided by
the stripper's suffix table and not by meaning.

**A reached surface and an attested one are genuinely independent, and `software` is the clean
demonstration — though not in the direction this section first claimed.** `softwareization` is BOTH
reached and attested: ITU FG-NET2030 and ETSI White Paper 38 both print it, with the quotations recorded
in the census's `attestationEvidence`. And the other spelling, **`softwarization`**, strips to `softwar`
and is **not reached at all**, so a live technical term is invisible to this denylist. That is a **gap in
the widening rather than a cost of it**, it is the mirror image of everything else in §3, and it is
recorded as its own finding in the census under `realButNotReached` rather than left as an aside.

> **CORRECTION, 2026-07-29 (fifth pass).** The paragraph above previously asserted the opposite: that
> the standards bodies use `softwarization` and not `softwareization`, so the reached spelling was "visible
> and not real". **That was false, and it was asserted about two specific documents without opening
> either** — from a general web search, against a reviewer who had quoted both. It is the fifth instance
> of the pattern Appendix A records, and the first one committed while contesting the reviewer for the same
> class of error. The maintainer's own attempt to verify returned HTTP 403 on the ETSI PDF, which is a
> reason to defer to a reader who had the text, not a reason to keep the claim. Attestation verdicts now
> carry a URL and a quoted phrase in the fixture so the next one is checkable without trusting anybody.

The `pay` family is the cost, and **`bl-16` records it as a limit this release created rather than
found**:

> During our marriage the provider for paying the mortgage was always him.

A human reads that as the provisioning sense. The analyzer now rejects it, because this stemmer takes
`payment` down to `pay`. It is accepted on the same ground v2.6.0 accepted losing `moment`/`moments`:
the alternative is a private idea of morphology sitting beside the analyzer's real one, which is
precisely the class of defect v2.4.2 was a whole release about. The narrower fix — stem only where the
literal test has already failed — is available and written down if a production flag ever lands here.

A fix that quietly buys a new false positive is how a guard rots. This one is in the benchmark.

## 4. Verification

| Check | Result |
|---|---|
| `npm run test:lab`, release-time | **170 pass / 0 fail** — the suite as this release shipped |
| `npm run test:lab`, record-pass | **178 pass / 0 fail** — after the 2026-07-29 record corrections, which added eight doc- and fixture-facing tests and no analyzer change |
| Match-behavior benchmark | 12 tests green; `cm-16`/`17`/`18` RED → GREEN; every prior case unmoved |
| Domain benchmark, canon-mapping benchmark, short-utterance, tokenizer, threshold-neighbors | all green, unmoved |
| Demo freeze, behavior | `fixtures/demo-v2.6.0.json` regenerates **byte-identical** at the fix commit — `0ede1173…` |
| Demo freeze, at 2.6.1 | 2 differences, **both provenance** (`provenance.analyzer.version`, `researchQueue.provenance.analyzer.version`), **0 behavioral**, 0 score movement — `--mode freeze` **PASS** |
| Corpus sweep vs v2.6.0 baseline | 103 passages × 450 entries = **46,350 pairs**, **0 changed**, **0 crossings** at any of the three admission lines |
| Canon index rebuild | byte-identical, `c7c41836…` |
| Release audit / UI audit / site integrity | PASSED at `v=2.6.1` |

**The corpus zero is structural, not lucky.** `provider` and `breadwinner` occur **zero times** across
all three archived sources, and `provider` holds the only non-empty denylist in the canon. The corpus
cannot exercise this path at all — the same bound v2.6.0 §11 recorded, and the reason that release's
bin-1 mechanical fixes also reported zero. Reporting it as "no movement observed" without saying why
would be reporting a measurement that was never capable of moving.

---

## 5. SHA-256 — v2.6.1 artifacts

| SHA-256 | File |
|---|---|
| `c7c4183675d606a30ce9df6ac22e85d25c31b453da15ebae3c47025f09f06329` | `data/le-canon-index.json` *(unchanged)* |
| `0ede1173d17c8c65c723ee79584ec1963ca80ae509fd43475758e03fc76b3750` | `fixtures/demo-v2.6.0.json` *(unchanged — retained as the behavioral reference)* |

No new demo fixture is captured. The v2.6.0 capture is still the behavioral baseline; a v2.6.1
capture would differ from it only in two version strings, which is a fact better recorded in §4 than
frozen as a second artifact.

---

## 6. Corpus

**Not re-run, and for the same reason as v2.4.1 and v2.4.2.** A re-run is only meaningful when the
instrument moved for that corpus, and §4 shows all 46,350 pairs unchanged. Every v2.6.0 export in
`lab-corpus/` remains current and `lab-corpus.manifest.json` needs no supersession entry.

---

## 7. Open, and deliberately not done here

1. **`bl-16`, the `paying` false positive.** Fix available (§3), not applied without a case.
2. **The contiguous-stem generalization — `bl-17`/`bl-18`, and the comment at
   `js/lab-analyzer.js:1878`.** Dropping the substring test and letting the stem run be the only
   multiword rule is what §2 originally claimed had shipped. It would fix both cases, and it is
   **score-moving**, so it is not a record correction and does not belong in this pass.

   Its safety is already measured rather than assumed. `health care services` — the case that would
   break if the substring test were load-bearing — stays disqualified without it: the stem run matches
   `health care` there directly, and `care` and `service` both match literally. It is frozen as the
   GREEN guard `bl-19` so the generalization cannot land without proving that.

   **Queued behind `GENERIC_TERMS`** (v2.6.0 §13.2 — matched against the stemmed token but written
   unstemmed, and deferred there for being score-moving), because both are the same defect: a
   hand-written list compared against a representation it was not written in. Fixing the smaller one
   first would mean touching `carries()` twice. **Unblocked by a production flag on `bl-17`/`bl-18`
   territory** — a real source that loses a provisioning claim to a spanned multiword entry is the
   evidence that moves this ahead of the queue, and it accumulates in `md/limit-hit-ledger.md` under
   `morphology` like any other limit hit.
3. **The fourteen documented limits from v2.6.0** are untouched and `md/limit-hit-ledger.md`
   remains empty.
4. **The denylist is still a denylist.** Everything in §1 makes a hand-written list of sixteen
   technical words compare correctly. It does not make the list complete, and it never will — that is
   why the list is the *secondary* defense and the occurrence-local window is the primary one.


---

## Appendix A. The correction history of §2.1 and §3

These are the dated correction blocks that stood inline in §2 and §3 until 2026-07-29,
reproduced **verbatim and unaltered**. They were moved here on Sol's fourth-pass ruling: at
three and four blocks deep, carry-forward had stopped serving the reader it exists for — a
reader could no longer extract current behavior from either section, which is the one thing a
release record has to be able to do.

**Nothing is retracted by the move and nothing is edited.** The reasoning is the most useful
content in this release, and the counts are worth stating precisely rather than roundly, because
an earlier version of this paragraph said "four errors across three review rounds" for seven
blocks correcting more claims than that:

| | |
|---|---|
| review rounds that returned CONTEST on this record | five |
| correction blocks below | seven |
| distinct false claims they correct | at least nine |
| recurring claim SHAPES | one, with four named variants |

The shape is a claim about what a mechanism *cannot* do, or a universal about what a set
contains, asserted without going to look. Its variants: which code path can be reached (twice),
which words the stemmer reaches (three times), what a test can observe (once), and what a named
source says (once — the fifth-pass `softwareization` error, asserted about two documents the
maintainer had not opened, while contesting the reviewer for this very pattern). In every case
the honest instrument already existed and was cheaper than the paragraph claiming it did not.
**A limitation is a claim and needs the same evidence as a capability.**

Git history carries the same text with its commits: `e48c9d5`, `85a930d`, `53657f0`, `1cf3bf7`,
`596fb50`, `e44c121`, `141f6cc`.

**The superseded text is included below each heading**, because the blocks say "the paragraph
above" and "the table above" and those antecedents no longer exist in §2.1 or §3. Sol's fifth
review found the gap: the blocks survived the move, the text they correct did not, so the appendix
was not self-contained. Both are reproduced from `c40cd7f`, the commit before the record pass began.

### A.1 §2 — the multiword claim, corrected three times

**THE SUPERSEDED PARAGRAPH**, as it stood in §2 at `c40cd7f`, and the antecedent of "the paragraph
above" in block 1:

> Multiword entries additionally moved from substring matching to a contiguous run of stems, so
> `health care` still finds those two words in sequence and can no longer be satisfied by a longer word
> that merely spans them. No denylist entry's behavior changes as a result; it removes a latent
> false-positive shape rather than fixing an observed one.


**Block 1 of 3, as it stood inline:**

> **CORRECTION, 2026-07-29.** The paragraph above describes behavior this release did not ship, and
> Sol's verification review was right to reproduce it. Multiword entries did not move *from* substring
> matching. The substring test is still there and still runs first. `carries()` tries three tests in
> order: the literal surfaces, then `run.includes(modifier)` for any entry containing a space, and
> only then the contiguous run of stems. A multiword entry satisfied by a longer word that merely
> spans it is caught by the second test, which returns before the third is reached. Nothing about that
> shape changed. The run of stems was **added**, not substituted.
>
> What does not survive is "removes a latent false-positive shape." **Nothing was removed, and the
> shape is live.** `bl-17` and `bl-18` now hold it: `the provider for health caregivers` is
> disqualified by `health care` matched inside `caregivers`, and the humanly correct reading is the
> provisioning sense.
>
> **The added test is reachable, and can decide a case on its own.** It is a union with the substring
> test, so it cannot promote anything the earlier tests rejected; that is the whole of the safety
> argument and it is the only part of it that is a proof. It does **not** follow that no behavior
> changes — a test that only adds disqualifications changes behavior every time it adds one, which is
> exactly what the `utilities` fix in §1 does. For the multiword branch specifically, the stem run
> decides whenever the two stems line up and the literal substring does not appear:
>
> | Complement tokens | Literal | Substring | Stem run | Decisive |
> |---|---|---|---|---|
> | `health caregivers` | — | `health care` | — | substring |
> | `health care` | `care` | `health care` | `health care`, `care` | all three |
> | `healths care` | `care` | — | `health care`, `care` | literal |
> | `healthfulness carefulness` | — | — | `health care`, `care` | **stem run alone** |
> | `childfulness carefulness` | — | — | `care`, `child care` | **stem run alone** |
> | `healths careers` | — | — | `health care`, `care` | **stem run alone** |
>
> **Suffixing both words is what makes the stem run decisive, and that is why Sol's counterexample used
> a double suffix rather than a plural.** `healths care` refutes the substring lemma — `healths` strips
> to `health`, so `health care` never appears as a substring — but it does not establish decisiveness,
> because the single-word `care` entry catches it literally on the first test. Only when every surface
> in the window is an inflected form does the stem run decide alone. The maintainer's own "simpler"
> plural example was sloppier, not simpler, and the table records both so the difference is visible.
>
> All six rows are frozen in `tests/lab-match-behavior.test.mjs` as an explicit truth table over the
> three branches — **all three columns asserted**, and the decisive set asserted by *identity* rather
> than by count, because any three rows satisfy a count while only these three carry the double-suffix
> shape the refutation turns on.
>
> `carries` is not exported, so attribution runs against a replica, anchored by a second test that puts
> every disqualifying row through the shipped analyzer and pins its **candidate score, fate and
> admission verdict** — `0.156`, `below-weak-threshold`, `credible: false` — plus a `healths workers`
> control pinned at `0.540` and `displayed`. Absence from the public `matches` list alone would have
> been too weak an anchor to hold a branch attribution, since a passage can leave that list several
> ways.
>
> **The anchor also pins the mechanism**, not only the outcome: `disqualifiedBy: "technical-modifier"`
> and the exact modifier named in `reason`, per row. The modifier is the assertion that does the real
> work — it ties the replica's first-match-in-denylist-order to what the shipped `carries` actually
> returned, so the replica now either agrees with production about *why* the alias was refused or is
> caught not to. `childfulness carefulness` is refused by `care` rather than `child care`, because
> `carries` is a `.find` over the denylist in order, and the test asserts that too.

**Block 2 of 3, as it stood inline:**

> **CORRECTION TO THE CORRECTION, 2026-07-29 (later the same day).** The block above originally
> asserted that the stem run is **never** the decisive test for this canon, on the argument that any
> surface stemming to `care` carries `care` as a prefix, so `health ` + that surface always contains
> `health care`. **That is false and Sol's verification review refuted it.** The lemma about the second
> word is sound; the proof forgot that the **first** word is reachable by suffix removal too.
> `healthfulness carefulness` stems to `health care`, contains no `health care` substring, carries no
> literal denylist surface either, and disqualifies end to end on the stem run alone.
>
> The failure is worth more than the fix. This block was written to retract an overclaim and it
> replaced it with a **stronger** overclaim of exactly the same shape — a universal statement about a
> comparison, argued from one side of it. What the earlier paragraph and its first correction have in
> common is asserting that a code path cannot be reached without enumerating what reaches it. The truth
> table above is that enumeration, and it is a test rather than a paragraph for that reason.
>
> **This correction is documentation-only, and one copy of the error is deliberately left standing.**
> The same claim is a comment on `carries()` at `js/lab-analyzer.js:1878`. Correcting a comment would
> move the analyzer's hash, which this pass is not permitted to do — decided explicitly rather than
> overlooked. It is queued with the §7 generalization that rewrites the comment anyway. Until then the
> comment is wrong, and this block is the record that it is known to be wrong.

**Block 3 of 3, as it stood inline:**

> **CORRECTION, 2026-07-29 (third pass).** The first correction block above, in the paragraph now
> headed "The anchor also pins the mechanism", originally said no test here *could* anchor
> `disqualifiedBy` or the modifier string, because they lived only in an internal trace no published
> field carried, and that closing the gap needed an analyzer change. **That was false.**
> `scoreEntry` returns `contextualAliasTrace`, `analyzerInternals` exports `scoreEntry`, and
> `tests/lab-match-behavior.test.mjs` has had a `contextualAliasTrace()` helper reading exactly that
> since v2.6.0 — nine lines above the block that declared it impossible. Sol's third review found the
> claim in the file that already disproved it.
>
> **This is the fourth error in this section of the same family**, and the family is now the finding:
> asserting what a mechanism *cannot* do without going and looking. Twice about which code path can be
> reached, once about which words the stemmer reaches, and now once about what a test can observe. In
> every case the honest instrument was already available and cheaper than the paragraph claiming it was
> not. **A limitation is a claim and needs the same evidence as a capability.**

### A.2 §3 — the widening census, corrected four times

**THE SUPERSEDED LEAD-IN AND TABLE**, as they stood in §3 at `c40cd7f`, and the antecedent of "the
table above" in block 1. This is the enumeration that named `pays`, which never matched, and omitted
seven surfaces that did:

> Stemming both sides reaches surfaces beyond plurals. Enumerated over all sixteen entries, the newly
> matched words are:
> 
> | From | Newly reached |
> |---|---|
> | `hosting` → `host` | host, hosts, hosted |
> | `network` | networked, networking |
> | `cloud` | clouded |
> | `payment` → `pay` | pay, pays, paying, payers |


**Block 1 of 4, as it stood inline:**

> **CORRECTION, 2026-07-29.** The table above is the enumeration re-run against the shipped stemmer.
> The version this section first published listed **`pays`, which does not match**, and omitted seven
> surfaces that do: `hosters`, `networkers`, `clouding`, `payable`, `payed`, and — the two that were
> not a matter of one suffix — **`serviceable` and `careers`**, two entries the original table did not
> reach at all.
>
> **`pays` is excluded by the derived-stem floor, by design.** It is four characters, below
> `minStemmableLength: 5`, so `stemToken` returns it unstemmed and it never meets `payment`'s stem.
> Neither does the literal test, which asks for `payment` and `payments`. The word this section named
> as the clearest instance of the cost is the one word in the family the fix cannot see. `paid` is out
> for a different reason and worth naming beside it: it is irregular, so no suffix rule reaches it
> either.
>
> **The two omitted entries are the part that matters**, because they are not `pay` variants and the
> original enumeration therefore missed a kind rather than a member. `serviceable` reaches `service`
> through the `able` rule, and `careers` reaches `care` through `ers`. `careers` is the widest of the
> lot — a common word, no technical sense, and adjacent to the relational register this alias exists
> to catch. Its asymmetry is arbitrary rather than principled: `carers` and `caregivers` stem to `car`
> and `caregiv` and do **not** match, so which care-words the denylist sees is decided by the
> stripper's suffix table and not by meaning.
>
> **Nothing here moves a verdict.** The stem test was already shipped and these surfaces were already
> reached; what was wrong was the census of them, which is what §3 exists to be. A cost stated as
> smaller than it is is not a cost that was accepted.

**Block 2 of 4, as it stood inline:**

> **CORRECTION TO THE CORRECTION, 2026-07-29 (later the same day).** The correction above was itself
> incomplete, and its own count was wrong. Sol's second verification review found **`carefulness`**
> (reaching `care`) and **`medicalization`** (reaching `medical`), neither of which the literal tests
> reach; and the paragraph said "six surfaces" while naming seven. Both are in the table now.
>
> **Two hand enumerations failed the same way, so the hand is no longer the instrument.** Each version
> generated the candidate space mechanically from the stemmer's suffix rules and then filtered it to
> real English by eye, and a word dropped by eye leaves nothing behind to review — `carefulness` and
> `medicalization` were in the generated space both times and were never ruled on.
>
> The judgments are now a fixture: `tests/fixtures/denylist-widening-census.json` records, per entry,
> every mechanically generated candidate as either newly reached or rejected as a non-word.
> `tests/lab-match-behavior.test.mjs` regenerates the space from the stemmer's own suffix inventory and
> **fails if any candidate carries no verdict**, which is what makes a silent omission impossible
> rather than merely unlikely. It also pins all four surfaces the two reviews contributed, and pins
> that `pays` stems to itself.
>
> **The claim this section makes is now narrower and checkable.** It is not "these are the words the
> widening reaches in English" — that was the unfalsifiable version, twice. It is "these are the
> candidates the stemmer's own rules generate from the sixteen entries, each one ruled on in the open."
> `hosters` and `payed` are recorded as the arguable word calls and counted as words, which widens
> the stated cost rather than narrowing it. A reviewer who disagrees can now contest one verdict
> instead of the whole table.

**Block 3 of 4, as it stood inline:**

> **THIRD CORRECTION, 2026-07-29 (same day).** Sol's second review contested two of those open verdicts
> and the provenance of the generator, and both stand.
>
> **`hostable` and `networkable` move from rejected to newly reached.** Both stem to `host` and
> `network`, neither is reached by the literal tests, and both are in settled technical use in exactly
> the hosting and networking register these two entries come from. They were rejected as coinages, which
> was the wrong call under this file's own `wordStandard`. **This is the mechanism working rather than
> failing**: the verdicts were in the open, so a reviewer contested two of them instead of the table,
> and the correction is two words rather than a rewrite. `cloudable` is now the closest surviving
> rejection and is labelled as the one most likely to be wrong next.
>
> **The generator was not reading "the stemmer's own suffix inventory," and the previous correction
> block said it was.** It read a hand-copied JSON list — a second copy, which had already drifted: it
> carried `er`, which `stemToken` does not strip. So a suffix added to the stemmer and not to the
> fixture would have left a region of the candidate space that nobody ever ruled on, invisibly, which is
> precisely the defect this fixture was built to end. It is now extracted from the `.replace(/(?:…)$/u,
> …)` chain in `js/lab-analyzer.js` as source text and asserted equal to the fixture's list, so drift
> fails the suite. Sentinel-checked by deleting one suffix from the fixture. Dropping `er` changed no
> candidate — nothing it generates survives the stem filter, since `hoster` stems to `hoster`.
>
> The y-to-i variant stays declared rather than derived, and is now labelled as a **generator
> convention, not a stemmer rule**: `stemToken` maps a trailing `ies` to `y`, and the variant is how the
> generator produces the surfaces that rule accepts. That is the one part of the space the stemmer's own
> text cannot supply, and saying so is the difference between this block and the one above it.

**Block 4 of 4, as it stood inline:**

> **FOURTH CORRECTION, 2026-07-29 (third pass), and it retires the argument rather than continuing it.**
> Sol contested `cloudable` and the last remaining hand-copied list. Both stand, and the second one
> matters more.
>
> **`cloudable` joins the attested surfaces.** Cisco's IBSG SMB cloud research uses "cloudable" spending
> for IT spend suitable for cloud delivery — verified independently rather than taken on citation, and
> settled enough for this register even though the scare quotes in Cisco's own text show it began as a
> coinage.
>
> **The denylist itself was still a hand-typed array in the test file**, so the census was checking
> itself against a copy: if the canon's `notAfter` list changed, the fixture and the copy would still
> have agreed with each other and the drift would have been invisible. It is now read from
> `data/le-canon-index.json`, with an assertion that the canon still holds exactly **one** non-empty
> denylist — the fact §1 rests on. Sentinel-checked by adding a term to the canon: the census fails.
> That was the same defect as the suffix inventory, one level up, and finding it twice is the reason to
> distrust every remaining "list beside a thing" in this record.
>
> **And the framing that produced three rounds of this is retired.** Word-hood was never a bound on what
> the comparison *reaches*. Every candidate in the census stems to its entry, so the analyzer
> disqualifies all of them today — `cloudable` included, before anyone ruled on it. The field formerly
> called `rejected` is now **`reachedButUnattested`**, because "rejected" read as "not reached" and
> invited three reviews' worth of argument about vocabulary as though it changed the instrument. It never
> did. **The reach set is mechanical and complete over the generated space; attestation is a separate,
> revisable judgment about which part of that reach a real source could contain.** A future contest over
> one word now moves an annotation and cannot unsettle the census.
