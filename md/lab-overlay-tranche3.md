# Overlay tranche 3 — the last 56 dark entries, and the authoring contract that closed them

Tranche 3 landed 2026-07-30 and took `commonMisreadings` coverage from **413 of
469 to 469 of 469**. Every concept in the canon can now disagree with a reader.

The count started at **100 of 463** before tranche 1. The three tranches plus the
cultural-register doctrine merge closed the rest:

| pass | entries given a misreading | coverage after |
|---|---|---|
| tranche 1 (`0ba89e5`) | 73 | 173 of 463 |
| tranche 2 (`687f90d`) | 234 | 407 of 463 |
| doctrine merge (`4b7b1a9`) | 6 new entries, authored with one | 413 of 469 |
| **tranche 3** | **56** | **469 of 469** |

What tranche 3 covered: Lexicon 32, Mythbuster 10, Five Levers 7,
Rules & Frameworks 5, Pill Dossiers 1, Instruments 1.

Twelve of the 56 already carried a hand-authored `boundaryCondition` and took the
misreading alone, per the rule tranche 2 established: a second boundary on the
same entry only adds retrieval mass. Boundaries therefore sit at 463 of 469, and
that lag is deliberate rather than a backlog.

## The contract, in the form that survived three tranches

A `commonMisreading` has to state the WRONG reading assertively enough that the
analyzer's stance logic files it as **Contradicts** when a reader's passage
resembles it. That means it has to clear the domain gate on its own, which is
where most first drafts die.

1. **A decisive frame, not a relational noun.** Naming a person or a relationship
   is not enough. One of:
   - `dating`, `courtship`, `romance`, `romantic`, `flirt*`
   - `marriage`, `marry`, `wedding`
   - a sex noun within 70 characters of
     `prefer|want|choose|select|desire|attract|reject|date|marry`
   - two of the five ladder stages (attention/exposure, attraction/desire/
     chemistry, selection, compatibility, retention/relationship stability)
2. **No negators.** `MISREADING_DENIAL_CUES` is wider than the obvious list and
   includes `wrong`, `rarely`, `hardly`, `nonsense`, `myth`, `mistaken`. A negator
   flips the stance to **Supports**, which is worse than not matching: the entry
   ends up agreeing with the misreading it exists to reject.
3. **10 to 18 words.**
4. **One misreading and one boundary per entry.**
5. **No artifact meta-language** — `claim`, `card`, `essay`, `page`, `section`,
   `entry`, `hub`. See `tests/lab-match-behavior.test.mjs` for the measured reason
   and for why the ENGINE was not changed to compensate.
6. **Do not hand an entry its own synopsis back.** More than four shared
   five-letter-plus words and the guard in the apply script stops the run: heavy
   reuse pushes borderline non-matches over the line.

## The morphology trap, which cost the most time across all three tranches

The decisive-frame patterns are literal-ish. These do NOT match:

| written | pattern | matches? |
|---|---|---|
| `marries` | `marry\w*` | **no** |
| `married` | `marry\w*` | **no** |
| `chosen` | `choose\w*` | **no** |
| `dates` | `dating` | **no** |

Tranche 2 lost three misreadings to `married`. Tranche 3 lost one to `marries`,
one to `chosen` and one to `dates` — after the trap was already written down in
the project's memory, by an author who had read it. Write the exact inflection the
pattern lists (`will marry`, `dating`) rather than the one the sentence wants.

## How it was verified

Ten of 56 failed the first pass, all for contract reasons rather than content
ones: six had no decisive frame, two carried a negator, two hit the morphology
trap. Three more were caught by the synopsis-reuse guard on the apply run.

```
check.mjs t3-mis.json     each misreading in isolation, one at a time
apply-t3.py               merge, lint, and refuse on any contract violation
verify-live.mjs           all 56 live in the built index, plus a false-positive
                          sweep over every expected-ignore benchmark case
```

Final: **56/56 Contradicts** with the whole tranche live, **0 false positives**
across all 96 expected-ignore cases.

## What it cost

Measured against the pre-tranche baseline over the swept corpus (117 passages —
note that the sweep covers 3 of the 21 archived sources, see `ca6dab2`):

```
changed              11997   9568 down / 2429 up
candidateScoreFloor  471 gain / 27 loss
minWeakScore          29 gain / 27 loss
minCredibleScore       0 gain /  1 loss
```

Most scores went DOWN, and that is the expected shape: tranche 3 added 56
misreadings and 44 boundaries without adding a single entry, so IDF denominators
rose across the canon while the population stayed at 469. Per-entry dilution is
the price of a match surface, and it was measured at ~0.009 per boundary in
tranche 1.

The single credible-line loss is `statistics:stat-pay-to-play` at **0.430 →
0.429**, on a Pew passage defining who counts as a current online-dating user.

> **Corrected 2026-07-30.** This paragraph originally said the pair had moved
> +0.001 in the doctrine merge, been ruled ACCEPT, and moved back — "a pair
> sitting exactly on a line and oscillating with every canon change". That is
> wrong, and the correction matters because it changes the verdict. There are
> **three different Pew passages** mapping to this one entry, all within a
> thousandth of 0.43, and each carries its own ruling key. Nothing was re-ruled:
> the merge skips any key already answered (`if (rulings[key]) continue;`), so a
> ruled pair can never re-enter PENDING.
>
> ```
> 0.432  seg-00025  REJECT   "Tinder is the top online dating platform among users under 50."
> 0.431  seg-00030  ACCEPT   "Around six-in-ten paid users (58%) say ... positive ..."
> 0.429  seg-00013  ACCEPT   "Current or recent online dating users refers to the 9% ..."
> ```
>
> Ruled by Jason on 2026-07-30. The loss recorded here — `seg-00013` — is a
> survey **definition** sentence about who counts as a user; it says nothing
> about paying and never belonged above the credible line, so the loss is the
> engine getting it right. `seg-00025` went the other way: it had been ACCEPTed
> on 2026-07-29 and was reopened and REJECTed, because a claim about platform
> share is not a claim about who pays. See
> [`lab-numeral-coincidence.md`](lab-numeral-coincidence.md).

Sheet: `md/lab-overlay-tranche3-threshold-adjudication.md`.

## What is now pinned

`tests/canon-index-fixtures.mjs` asserts **zero** dark entries, per category and
in total. Stated as zero rather than as a count that happens to match, so a new
entry authored without a misreading fails the suite rather than quietly re-opening
the gap. The per-category loop iterates every category rather than the four
tranche 2 covered.
