# cope, simp, 4B, PSL: four words, four answers, and a grammar that decided two of them

2026-07-30. `md/lab-constants-audit.md` found `minSingleAliasLength` silencing
twelve untyped single-word aliases with only four ever ruled on, and handed the
remaining eight to the alias lane. Jason asked for four of them to be typed.

**Two were typed. Two were not, and the two that were not are reached anyway by a
route that measures better than typing does.** All four Lexicon terms are now
reachable from their own vocabulary, which was the ask.

---

## Why the archive could not answer this

The first measurement was a census of the four bare words across all 21 archived
sources:

```
units 6,504 · retained by the gate 2,507

"cope"   2 occurrences, 0 in a RETAINED passage
"simp"   0 — absent from the archive entirely
"4b"     0 — absent
"psl"    0 — absent

and the surfaces on those same entries that ALREADY fire:
"simping" 0 · "simp economy" 0 · "4B movement" 0 · "PSL scale" 0 · "coping" 0
```

The archive is academic and journalistic prose; these are forum terms. It can
measure neither the gain nor the cost, which is the same lesson
`md/lab-constants-audit.md` recorded about `shortUnitWordCount` and the context
boosts: **some constants and some vocabulary have no population here.**

So the instrument is authored probes — which `md/RERUN.md` §1 requires for this
register regardless, since corpus text must not be committed.

## What the probes said

Each word gets INTENT probes (the term used as the concept) and RISK probes (the
same string in its ordinary sense). A standalone alias scores at `phraseBase`
0.540, credible on its own, so a RISK hit is a false positive shipped.

| word | typing | intent | false positives |
|---|---|---|---|
| **simp** | standalone | 1 → 2 of 2 | **0 of 1** |
| **4B** | standalone | 2 → 2 of 2 (0.515 → 0.540) | **0 of 1** |
| cope | standalone | 0 → 2 of 2 | **3 of 3** |
| cope | contextual | 0 → 2 of 2 | **2 of 3** |
| **cope** | **phrases, untyped** | **0 → 3 of 4** | **0 of 3** |
| PSL | standalone | 1 → 1 of 2 | **1 of 2** |
| PSL | contextual | 1 → 1 of 2 | 0 of 2 |
| **PSL** | **phrases, untyped** | **1 → 2 of 2** | **0 of 2** |

### The two that were typed

`simp` is the only one where typing is the right instrument. The word is
unambiguous in English — the only collision available was a fabricated "SIMP
protocol", which the gate discards before matching. `simping` and `simp economy`
already fired; the bare noun did not, and now does.

`4B` is free rather than valuable. It was already credible at 0.515 through token
overlap; typing makes the bare acronym a phrase hit at 0.540 rather than a
coincidence of shared tokens. No probe moved in either direction and nothing
false appeared. Worth doing because a concept reached by accident is one entry
edit away from not being reached.

### The two that were refused, and why contextual was not the answer

**`cope` standalone maps every ordinary use of the verb**, including

> "Couples who cope with stress together report higher relationship satisfaction."

at 0.540 — a real research finding mapped to a slang term about dismissing
arguments.

**Contextual typing is not a safer standalone here, and the trace says why.**
`relationalCoFire` promotes a contextual alias when a relational ROLE term sits
within eight tokens in the same clause. The two probes that survived contextual
typing were promoted by:

```
"cope" promoted=true · relational role term “men” within 8 tokens, same clause
"cope" promoted=true · relational role term “couples” within 8 tokens, same clause
```

`men` and `couples` are the two commonest role nouns in the entire domain. For a
word whose ordinary sense lives in exactly the passages the concept lives in,
contextual typing is standalone with extra steps.

**`PSL` standalone maps a pumpkin spice latte** — "He brought her a PSL on their
second date" at 0.540. Contextual rejects that one, but only because `date` is
not a relational role term and is not shared with the entry; "he bought his
girlfriend a PSL" would promote. That is a rule surviving by luck, and it buys
one fewer intent hit than the alternative.

### The grammar that solved both

English separates the two senses where the analyzer could not. **The verb takes a
complement — "cope WITH" — and the noun is a predicate or object — "is cope", "as
cope", "just cope".** Multi-word aliases need no typing at all: they clear
`minPhraseLength`, contain a space, and fire as ordinary phrase hits. They cannot
collide with a verb that never takes those shapes.

```
lexicon:term-cope   is cope · as cope · just cope · pure cope · cope harder
lexicon:term-psl    PSL scale · PSL rating · PSL score · on PSL
```

`cope` goes 0 → 3 of 4 intent with 0 of 3 false positives. `PSL` goes 1 → 2 of 2
with 0 of 2. Both beat their typed variants on **both** axes, which is rare enough
to be worth stating plainly: this was not a trade.

The one `cope` miss is the quoted bare word — *Calling a hopeful claim about
dating "cope" is how the forum dismisses it* — which sits at 0.427, a thousandth
under `minCredibleScore`. Left there rather than chased with a phrase that would
have to be fitted to the probe.

## Cost

**Gate: unmoved.** Multi-word aliases reach `canonAdmissionSurfaces`, so this is a
gate change under the live coupling and the benchmark was re-run:

```
domainRecall 1.000 · ignorePrecision 1.000 · junkRecall 0.844
admission surfaces 851 -> 856
```

Identical on all three, and `junkRecall` stays exactly at its ratchet.

**Retrieval: 122 pairs moved, none crossed.**

```
analyzer 2.6.9 -> 2.6.9 · config bt0a7p -> bt0a7p
canon 1.0.0+f263ae6219b9 -> 1.0.0+6cf046c1e769
changed 122   87 down / 35 up
candidateScoreFloor  0 gain / 0 loss
minWeakScore         0 gain / 0 loss
minCredibleScore     0 gain / 0 loss
```

Sub-threshold IDF drift from new alias text entering the index, and nothing else.
The frozen band was regenerated to carry the moved scores; all 5,296 rulings
preserved, `pendingByThreshold` unchanged.

## What is pinned

`tests/canon-index-fixtures.mjs` — typed entries 6 → 8, with `simp` and `4B`
pinned by value, and `cope` and `PSL` pinned as **untypeable on measurement**: the
bare word must not appear as an alias (untyped it is inert, so it only ever
becomes live by someone typing it) and the phrase route must survive.

`tests/lab-match-behavior.test.mjs` — the sense split itself, eight probes,
concept-sense must map and ordinary-sense must not. RED-verified by typing `cope`
standalone:

> "Couples who cope with stress together report higher relationship satisfaction."
> uses the ordinary sense and now maps to lexicon:term-cope at 0.54. That is the
> cost typing this alias would have carried, and it is why it was refused.

## Two mistakes worth keeping

**My first RED check patched the wrong artifact.** I edited
`data/le-canon-index.json` to break the fixture; nothing failed, because
`tests/canon-index-fixtures.mjs` calls `buildCanonIndex()` and never reads the
built file. A RED check that silently passes is worse than no RED check — it
certifies a guard that was never exercised. The real verification patches
`data/canon-overlay.json`.

**I reported all four as one class.** `md/lab-constants-audit.md` grouped them as
"distinctive slang, the same shape as SMV/LMS/rizz". Two of them are; `cope` is
ordinary English and belongs with `game`/`Wall`/`Sham`, and `PSL` has a coffee
collision. The grouping was an assumption dressed as a finding.

## Still unruled

The other four the floor silences: `face`, `body`, `age` on the SMV entries, and
`game` on `lexicon:term-game`. All four are ordinary English in the same class as
the ones already ruled dead, and none has been measured.

## Reproducing

```
slang-exposure.mjs   the four bare words across all 21 sources
slang-typing.mjs     standalone vs contextual vs baseline, authored probes
slang-why.mjs        the relationalCoFire trace that killed contextual for cope
cope-phrase.mjs      the phrase route, with the gate benchmark beside it
psl-probe.mjs        PSL and 4B against gate-passing intent probes
```
