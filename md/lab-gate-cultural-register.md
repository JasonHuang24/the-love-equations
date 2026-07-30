# The gate's cultural-register blindness — a decision, not a patch

**Status: open. Needs Jason's ruling.** Nothing in this document has been applied
to the shipped gate. The measurement is committed
(`tests/fixtures/cultural-register-pairs.json`, `tests/lab-gate-register.test.mjs`)
so the gap is pinned rather than remembered; the options below are prototypes
measured in the session scratchpad.

## What the gate actually does

`localDomainRelevance` assembles four frames — participant, relational outcome,
social mechanism, affirmative non-domain — and retains a unit when:

- a **decisive** outcome frame fires → `relevant`, or
- a **decisive** mechanism frame fires → `relevant`, or
- participant **and** (outcome or mechanism) fire → `uncertain`, or
- an outcome frame fires with no non-domain evidence → `uncertain`.

Otherwise `irrelevant`. A participant frame **on its own** is
`irrelevant / no-human-relational-frame`.

The decisive outcome frames are vocabulary lists: `dating|courtship|romance|
flirt*`; `marriage|marry*|wedding|spouses|husbands|wives|cohabit*`; a sex noun
within 70 characters of `prefer|want|choose|select|desire|attract|reject|date|
marry`; `breakups|infidelity|cheating`; two or more of the five funnel stages;
`smv|sexual market value`.

## The failure

The gate is reliable on claims **about relationships** and blind to claims about
**culture shaping relationships**. That second register is what most of the
archived manosphere corpus is written in, and it is the register the site's own
Pills, Frameworks and Gender Dynamics pages argue with.

Measured over all 21 archived sources: **2604 of 4805 claim-like units discarded
(54%)**. That total is not the finding — most of it is survey methodology and
academic apparatus that *should* go. The finding is what minimal pairs isolate.

### Minimal pairs: the same claim, one word apart

| pair | phrasing | verdict |
|---|---|---|
| `cr-frame` | "The operative frame in which **men and women date** is culturally manufactured, not natural." | `relevant` |
| | "The operative frame in which **the sexes encounter each other** is culturally manufactured, not natural." | **`irrelevant`** |
| `cr-law` | "Family law encodes one sex's interests as the neutral baseline when a **marriage** ends." | `relevant` |
| | "Family law encodes one sex's interests as the neutral baseline when a **household** dissolves." | **`irrelevant`** |
| `cr-media` | "Media that ridiculed masculinity for a generation changed **who young women date**." | `relevant` |
| | "Media that ridiculed masculinity for a generation changed **how young men present themselves**." | **`irrelevant`** |

**Six of eight pairs split.** The gate is not deciding whether a passage is about
mating; it is deciding whether the passage contains a word it recognises.

`cr-frame` is the load-bearing case: the discarded phrasing names
`frameworks:operative-frame` — a canon entry, added deliberately in `eb0f6cd` —
verbatim.

### The same thing, caught in the corpus

The dead-alias commit (`f101f8c`) revived `fem-centrism` as a match surface. The
corpus contains exactly one sentence using the term, and on it the alias now
fires: `scoreEntry` returns `exactAliasHits: ["fem-centrism"]` for both
`frameworks:operative-frame` (0.31) and `lexicon:term-fem-centrism` (0.32).

The threshold sweep reported **0 of 47,689 pairs changed**, because the gate
discards that sentence:

> `irrelevant / no-human-relational-frame`

The canon learned the vocabulary in `eb0f6cd`. The gate throws away the only
sentence in the corpus that uses it. **The doctrine work and the gate are
currently working against each other.**

## The finding that reframes the fix

Of 24 hand-labelled cultural-register claims taken from the two manosphere
sources, **no candidate gate change rescues 13 of them** — and for most of those
the reason is not the gate at all. The canon has no concept for:

`heteropessimism` · `masculinity` · `feminization` · `straight culture` ·
`feminine reality` · `social convention` · `normalcy`

So loosening the gate alone would admit passages the canon then maps to nothing.
That does not increase insight; it increases the unmapped rate and makes the
coverage metric look worse while showing the reader the same blank. **Half of
this problem is a doctrine gap wearing a gate gap's clothes.**

## Options, measured

`junkRecall` — the share of expected-ignore benchmark cases actually set aside —
is a **ratchet**: minimum 0.75, *"May only be raised, never lowered."* Shipped
sits at 0.821. Any option that lowers it is out of contract without an explicit
ruling.

Recall below is against the 24 labelled cultural-register claims. The junkRecall
column is computed on the benchmark's 74 claim-like ignore units, so the absolute
figures differ slightly from the test's per-case 0.821; the **deltas** are what
the ratchet cares about.

| option | cultural recall | junkRecall | methodology admitted | verdict |
|---|---|---|---|---|
| **0** shipped gate | 0/24 (0%) | 0.811 | 0/10 | the status quo |
| **1** cultural-mechanism frame **+** participant | 9/24 (38%) | 0.811 | 0/10 | **free** — no measured precision cost |
| **2** canon-anchored: a distinctive canon phrase admits | 6/24 (25%) | 0.784 | 0/10 | costs 2 units |
| **3** either 1 or 2 | 11/24 (46%) | 0.784 | 0/10 | best recall per unit of cost |
| **4** participant frame alone is enough | 12/24 (50%) | 0.676 | **5/10** | out — admits survey boilerplate |

Option 1 adds a decisive-adjacent frame for culture acting on people — norms,
media, law, conditioning, institution, imperative, script, discourse — and
requires a participant frame alongside it, so it cannot admit cultural commentary
with nobody in it.

Option 2 admits any passage containing a **distinctive** canon surface: a
multi-word alias or a curated typed alias, never a bare ordinary word like
`appearance`. Its appeal is architectural rather than numerical — it makes the
gate's scope something you extend **by authoring doctrine**, which is the
project's actual workflow, instead of by editing a regex. Every rescue it made
was on a real canon phrase: `the operative frame`, `feminine imperative`,
`hypergamy`.

## Recommendation

**Adopt option 1 now; adopt option 2 only together with the doctrine it depends
on.**

1. **Option 1 is free.** 38% of the register recovered at no measured cost to the
   junkRecall ratchet and zero survey boilerplate admitted. It needs a frozen
   benchmark extension and its own threshold baseline, but it does not need a
   ruling against the ratchet, because it does not move it.

2. **Option 2 should wait for tranche 3.** It is the better long-term design —
   scope maintained by authoring rather than by regex — but it costs 2 units of
   junkRecall today and buys only 25%, because the canon is missing the very
   vocabulary that would make it powerful. Land the Lexicon doctrine for
   `heteropessimism`, `masculinity`, `feminization` and `straight culture` first,
   then re-measure: option 2's recall should rise substantially and its cost
   should not.

3. **Reject option 4.** It admits 5 of 10 survey-methodology sentences and drops
   junkRecall to 0.676, below the 0.75 hard floor. The fail-open argument does not
   save it: fail-open is a safety property for edge cases, not a licence to retain
   a third of the discard population.

4. **Whatever is adopted, the register gap is a doctrine problem as much as an
   engine problem.** The cheapest large win available is not a gate change at all:
   it is Lexicon entries for the seven terms above, which would let option 2 do
   real work and would give the admitted passages something to map to.

## What was deliberately not done

No change to `js/lab-analyzer.js`. The gate decides what every reader of the Lab
is shown, and moving it is exactly the class of change the adjudication gate
exists to stop being absorbed silently. The measurement is committed so the
decision can be made on evidence; the decision is not mine to make.

## Reproducing

- `tests/lab-gate-register.test.mjs` — the pinned pair measurement, in the suite.
- Session scratchpad: `gate-register-census.mjs` (corpus-wide discard census by
  frame bucket), `gate-options.mjs` (the five options against the labelled set and
  the ratchet), `cr-pairs.mjs` (the pair generator).
- The labelled 24-claim set lives in `gate-options.mjs` rather than in the repo,
  because it is verbatim third-party text; `lab-corpus/` is gitignored by standing
  decision and the committed fixture is authored to carry the same structure.
