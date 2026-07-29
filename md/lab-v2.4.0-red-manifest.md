# LE Lab v2.4.0 — RED manifest (commit 1 of 5)

The frozen state of `tests/fixtures/match-behavior-benchmark.json` **before** any production code
changed. Every row below is what the shipped analyzer actually did, measured, not predicted.

```
analyzer ............ 2.3.0
analysis schema ..... le-lab.analysis/2.3
scoringConfigHash ... 195c1ld
canon index ......... 1.0.0+62c5cb511433  (le-canon-index/1.0, 450 concepts, 19 sources)
```

`npm run test:lab` **FAILS at this commit**, by design:

```
tests/lab-match-behavior.test.mjs .... 2 pass / 3 fail
  structural soundness .............................. PASS
  misreading polarity ............................... FAIL  (10 of 10 cases mislabelled)
  candidate retention ............................... FAIL  (9 evidence-bearing losses)
  working-set widening / no invented credibility .... PASS  (holds trivially pre-union)
  typed alias ....................................... FAIL  (5 of 5 positives, 0 of 8 negatives)
```

Everything else in the suite is green at this commit, including the 152-case domain benchmark, so
the three failures are isolated to what this release is about.

---

## Block A — misreading polarity (10/10 wrong)

The canon records, per entry, the readings it explicitly rejects (`commonMisreadings`). Those strings
are on the match surface, which is correct — a source repeating a misreading *should* retrieve the
entry that corrects it. What the analyzer then says about that overlap is the defect.

| Case | Wrapper | Expected | **Observed at freeze** | Score |
|---|---|---|---|---|
| mp-01 | assert | Contradicts | **Resembles** | 0.665 |
| mp-02 | assert | Contradicts | **Resembles** | 0.828 |
| mp-03 | assert | Contradicts | **Resembles** | 0.746 |
| mp-04 | negated | Supports | **Contradicts** | 0.739 |
| mp-05 | negated | Supports | **Resembles** | 0.828 |
| mp-06 | negated | Supports | **Contradicts** | 0.657 |
| mp-07 | negated | Supports | **Contradicts** | 0.761 |
| mp-08 | attributed | Context only | **Resembles** | 0.716 |
| mp-09 | attributed | Context only | **Supports** | 0.631 |
| mp-10 | attributed | Context only | **Resembles** | 0.548 |

Three things are worth stating plainly, because they are not the same bug wearing three hats:

1. **The assertion cases are silent.** A source asserting a reading the canon explicitly rejects is
   reported as *resembling* that canon entry. The strongest of them, mp-03, has **every single
   shared token drawn from the `commonMisreading` surface and nowhere else** — there is no sense in
   which that passage resembles the concept; it is the error the concept exists to name.

2. **The negation cases are inverted, not merely weak.** mp-04, mp-06 and mp-07 are labelled
   `Contradicts` for stating the canon's own correction. mp-07 —
   *"Passing every listed factor does not create attraction or entitlement to a relationship"* — is a
   near-verbatim paraphrase of the LE boundary and is filed as contradicting LE at **High**
   confidence. The cause is visible in one line of `stanceFor`: the contradiction branch tests
   whether the *passage* contains disagreement language, then reads that as disagreement with the
   *match*, when the passage is in fact disagreeing with the misreading.

3. **mp-02 and mp-05 are the same sentence plus one `not`, and today they are indistinguishable** —
   identical score (0.828), identical label. Bare `is not` is absent from the contradiction cue list.
   The analyzer currently cannot represent the difference between asserting a misreading and denying
   it.

The attribution cases are a distinct failure with a distinct fix: mp-09 trips the evidence cue on
*"According to"* and reports that the source **Supports** LE, while the source is relaying the exact
reading LE indexes as wrong.

## Block B — candidate retention (9 evidence-bearing losses)

Retrieval scores all 450 entries, keeps everything above `candidateScoreFloor`, ranks, and then cuts
to `maxCandidatesPerUnit = 8`. The cut happens **before** admission, bounded context, or stance, so
an exact hit that ranks ninth is not weak — it is gone, and nothing downstream can know it existed.

| Case | Top match | Lost hit | Score | Rank | Above floor |
|---|---|---|---|---|---|
| cr-01 | `deep-dive:…latin-america` 0.452 | `smv:money:provisioning-signal` (exact alias) | 0.156 | 12 | 17 |
| cr-02 | `deep-dive:…latin-america` 0.540 | `smv:money:provisioning-signal` (exact alias) | 0.300 | 10 | 133 |
| cr-03 | `M-TBD-17` 0.394 | `smv:money:provisioning-signal` (exact alias) | 0.300 | 9 | 141 |
| cr-03 | — | `smv:money:income` (exact alias) | 0.156 | — | 141 |
| cr-04 | `statistics:stat-single-parent-world` 0.449 | `smv:money:provisioning-signal` (exact alias) | 0.156 | 10 | 11 |

**cr-01 reproduces the brief's case to the decimal**: the full provider probe maps to a Latin America
Deep Dive at **0.452**, `smv:money` shows weakly at **0.372**, and `smv:money:provisioning-signal`
— the entry whose ratified alias is literally the word `provider` — **disappears entirely**. The
probe text is benchmark case `ds-07` verbatim, the sentence the domain-gate append added so that
this alias could be tested at all.

cr-02 and cr-03 isolate the retention defect from the scoring one: there the alias keeps its full
0.30 and is *still* discarded, purely because eight entries out-rank it on generic overlap. cr-04
is the same loss with only eleven entries above the floor — the cut is not a capacity problem.

`smv:money:income` in cr-03 was found by the property assertion rather than written by hand, which
is the point of asserting the property as well as the named cases.

## Block C — typed alias (5 positives red, 8 negatives already green)

| Case | Class | Alias | Expected | **Observed** | Score / rank |
|---|---|---|---|---|---|
| ta-01 | standalone | hypergamy | credible | **not credible** | 0.242, rank 3/10 |
| ta-02 | standalone | hypergamy | credible | **not credible** | 0.300, rank 14/58 |
| ta-03 | contextual | provider | credible | **not credible** | 0.156, rank 12/17 |
| ta-04 | contextual | provider | credible | **not credible** | 0.300, rank 10/133 |
| ta-05 | contextual | breadwinner | credible | **not credible** | 0.156, rank 10/11 |
| ta-06…ta-13 | negatives | — | not credible | **not credible** ✓ | — |

In all five positives the alias **fires exactly** — `exactAliasHits` is populated — and the match is
still refused, because a single-word alias is worth `singleAliasStrength = 0.30` against a
`minCredibleScore` of 0.43. The evidence is found and then thrown away. That is a threshold problem,
not a vocabulary one, which is the conclusion the alias pass and the gate append had already reached
from the other direction.

**The negatives are all green at freeze and must stay green.** Eight of them, one better than
one-for-one against the positives. Five (ta-06, ta-07, ta-08, ta-10, ta-11, ta-13) are rejected by
the domain gate before the alias is ever consulted — which means they prove nothing about alias
typing on their own, and the manifest says so rather than counting them as evidence of safety.

Two negatives do the real work:

- **ta-09** — *"My girlfriend and I spent the whole weekend arguing about which cloud provider our
  startup should use."* Retained `uncertain`, with **both** a participant frame and a
  relationship-outcome frame firing. The co-fire condition the ruling specifies is therefore
  satisfied by this sentence, and only the alias's own local collocation (`cloud provider`)
  separates it from ta-03. This is the case that decides whether the contextual class is safe.
- **ta-12** — benchmark case `ds-13` verbatim, already on record there as a KNOWN MISS: the
  append-1 dating-app-interaction frame retains a video-game sentence fail-open on
  *"fewer … matches"*. That fail-open retention is exactly what would expose `smv:charm`'s `game`
  alias to video-game prose if `game` were typed contextual.

---

## What this manifest commits to

The three blocks fail for unrelated reasons and are fixed by unrelated changes, which is why they are
frozen as three blocks and fixed in three commits:

| Block | Fixed by | Must not touch |
|---|---|---|
| B — retention | commit 2, candidate union | any score, any threshold, `scoringConfigHash` |
| A — polarity | commit 3, match-surface provenance | retrieval scoring; the 152-case domain floor |
| C — typed alias | commit 4, alias typing | existing untyped alias behavior |

Recording the red state first is the whole point: it is the difference between fixing a defect and
moving a goalpost to fit a result.
