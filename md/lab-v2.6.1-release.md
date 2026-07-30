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

Multiword entries additionally moved from substring matching to a contiguous run of stems, so
`health care` still finds those two words in sequence and can no longer be satisfied by a longer word
that merely spans them. No denylist entry's behavior changes as a result; it removes a latent
false-positive shape rather than fixing an observed one.

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
> three branches, with a test asserting that exactly three sequences are decisive by stem run alone —
> the number §2 said was zero. `carries` is not exported, so the attribution runs against a replica;
> the replica is anchored by a second test putting every disqualifying row through the shipped analyzer
> end to end, plus a `healths workers` control that must still promote.
>
> **The decisive surfaces are inflected forms the maintainer knows no natural sentence for** —
> `healthfulness`, `childfulness`, `healths careers`. That is an observation about the examples found,
> not a proof that none exists. The distinction is the entire lesson here: this block twice asserted
> something about a code path without enumerating what reaches it.

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

---

## 3. What it widens, stated as a cost

Stemming both sides reaches surfaces beyond plurals. Enumerated over all sixteen entries, the newly
matched words are:

| From | Newly reached |
|---|---|
| `hosting` → `host` | host, hosts, hosted, hosters |
| `network` | networked, networking, networkers |
| `cloud` | clouded, clouding |
| `service` | serviceable |
| `care` | careers |
| `payment` → `pay` | pay, paying, payers, payable, payed |

> **CORRECTION, 2026-07-29.** The table above is the enumeration re-run against the shipped stemmer.
> The version this section first published listed **`pays`, which does not match**, and omitted six
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

All but the `pay` family are the technical sense the denylist exists to reject, and are improvements —
`the provider of hosted email` and `the provider for networked storage` are both now correctly
disqualified. `careers` and `serviceable` are the two where that reading is weakest.

The `pay` family is the cost, and **`bl-16` records it as a limit this release created rather than
found**:

> During our marriage the provider for paying the mortgage was always him.

A human reads that as the provisioning sense. The analyzer now rejects it, because this stemmer takes
`payment` down to `pay`. It is accepted on the same ground v2.6.0 accepted losing `moment`/`moments`:
the alternative is a private idea of morphology sitting beside the analyzer's real one, which is
precisely the class of defect v2.4.2 was a whole release about. The narrower fix — stem only where the
literal test has already failed — is available and written down if a production flag ever lands here.

A fix that quietly buys a new false positive is how a guard rots. This one is in the benchmark.

---

## 4. Verification

| Check | Result |
|---|---|
| `npm run test:lab` | **170 pass / 0 fail** |
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
