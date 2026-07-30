# The gate's participant vocabulary — a decision, not a patch

> **RULED. P2 shipped in `ca6dab2` (v2.6.5). Recommendation 4's narrower design
> was built in v2.6.7 and DOES NOT WORK; P3a's concrete nouns shipped in its
> place and P1b, P3b, `humanity`, `our` and `their` are all rejected as measured
> losses.** See
> [`lab-gate-participant-narrowing.md`](lab-gate-participant-narrowing.md) for
> the ten variants and the two attributions that settled it.

**Status when written: awaiting a ruling.** Nothing in `js/lab-analyzer.js` moved
for this document. The benchmark append that lands with it changes no classifier
code.

This is the residual left by [`lab-gate-cultural-register.md`](lab-gate-cultural-register.md).
Option 1 shipped as `cultural-frame-mechanism` in `ab62871` and closed five of
the eight minimal-pair splits. Its own Outcome section named what was left:

> the residual **3 splits are a participant-vocabulary gap, not a frame gap.**
> The frame fires on all three; `HUMAN_PARTICIPANT_FRAMES` does not know
> `anyone`, `a generation`, `mothers` or `the sexes`.

That has now been measured properly, and the measurement changed the answer.

## What the gap actually is

`localDomainRelevance` retains a passage on `participant && (outcome ||
mechanism)`. Widening participant vocabulary can change exactly one input to
that rule: `frames.participant.detected`. It enters only through
`humanGroundedOutcome` and `humanSocialMechanism`, both plain conjunctions of
detection — not weighted, not vetoed by `nonDomain`. So for any candidate
vocabulary V, the widened decision is exactly

```
retained_V(unit) = (shipped status != 'irrelevant')
                   || (V matches text && (outcome.detected || mechanism.detected))
```

No other clause moves. Every number below is computed that way, which is why it
needs no patched copy of the analyzer — and why the shipped row of each table is
a check on the instrument rather than a finding.

`HUMAN_PARTICIPANT_FRAMES` today recognises `people`, `persons`, `someone`,
`adults`, `singles`, `couples`, `spouses`, `husbands`, `wives`, `boyfriends`,
`girlfriends`, `lovers`, `men`, `women`, `man`, `woman`; the group frame adds
`households`, `parents`, `families`, `communities`, `residents`, `roommates`,
`friends`; the pronoun frame adds `he`, `she`, `they`, `we`, `you`, `him`, `her`,
`them`.

It does not recognise `I`, `my`, `our`, `their`, `his`, `male`, `female`, `boys`,
`girls`, `guys`, `mothers`, `humanity`, `anyone`, or `the sexes`.

Two of those are not judgment calls but internal disagreements:

- `RELATIONAL_OUTCOME_FRAMES.cross-sex-selection`, in the same file, matches
  `males|females`. So the analyzer currently disagrees with itself about whether
  those words name people.
- The pronoun frame carries the subject and object forms and stops there. `we`
  counts as a person in the sentence; `our` does not.

## Where the corpus actually stands

Post-option-1 and post the cultural-register doctrine merge, of the 24 labelled
cultural claims:

```
8   admitted        (5 of which now reach a canon entry, 3 still show a blank)
16  binned
     11  fire cultural-frame-mechanism at 2.5 and are stopped ONLY by
         participant detection  <-- this document
      5  the frame does not fire at all
```

So the participant gap is worth more than option 1 itself was, and three items
the earlier handoff filed as "missing doctrine" turn out to belong here instead:
`cul-04` names fem-centrism outright, `cul-07` and `cul-09` name conditioning and
the feminine reality. They needed no new concept. They needed the gate to accept
that `I`, `my` and `our` put a person in a sentence.

## Options, measured

Five independent candidates, so they can be ruled on one at a time. Floors:
`domainRecall >= 0.9` (hard), `ignorePrecision >= 0.95` (hard),
`junkRecall >= 0.75` (**ratchet — may only be raised**), measured before this
document's benchmark append, at 168 cases.

| option | vocabulary added | cul/24 | domRec | ignPrec | junkRec | pairs | charged |
|---|---|---|---|---|---|---|---|
| 0 shipped | — | 8 | 1.000 | 1.000 | 0.833 | 3/8 | — |
| P1 possessives | my, mine, our, ours, your, yours, their, theirs, his, hers | 12 | 1.000 | 1.000 | **0.810** | 2/8 | pt-02, pt-11 |
| P1b bare first person | i | 10 | 1.000 | 1.000 | 0.833 | 3/8 | — |
| P2 sexed nouns | male, males, female, females | 10 | 1.000 | 1.000 | 0.833 | 3/8 | — |
| P3a concrete human nouns | boys, girls, guys, sons, daughters, mothers, fathers, brothers, sisters, humanity, the sexes | 9 | 1.000 | 1.000 | 0.833 | 1/8 | — |
| P3b indefinite / collective | anyone, everyone, somebody, nobody, no one, a generation, generations | 8 | 1.000 | 1.000 | 0.833 | 1/8 | — |

And the sets a ruling would actually adopt:

| set | cul/24 | junkRec | pairs | charged |
|---|---|---|---|---|
| A — the free four (P1b+P2+P3a+P3b) | **13** | 0.833 | **0/8** | — |
| B — A + all possessives | 14 | **0.810** | 0/8 | pt-02, pt-11 |
| C — A + possessives minus `our`/`their` | 13 | 0.833 | 0/8 | — |
| D — concrete nouns only (P2+P3a) | 11 | 0.833 | 1/8 | — |

Two things fall straight out.

**`our` and `their` are the entire cost of P1**, isolated word by word. They
retain two existing polysemous traps:

- `pt-02` — "Our company announced a strategic partnership with a hardware firm,
  and analysts say the attraction between the two brands is mutual."
- `pt-11` — "A one-to-many relationship links the customers table to their
  orders."

Both are the shape the trap family exists to catch: a possessive that attaches to
an organization or a database table as readily as to a person. Reject them.

**The other eight possessives buy nothing.** Set C matches set A exactly. Once
P1b, P2, P3a and P3b are in, `my`, `his` and `hers` add no case the others do not
already carry. The possessive question dissolves rather than needing a ruling.

## The finding that reframes the recommendation

Set A looks free. It is not, and the reason the table could not see it is worth
stating plainly.

Of the 84 expected-ignore cases the table above was measured against, **zero
contain P1b's, P2's or P3a's vocabulary, and exactly one contains P3b's**
(`ds-09`, a golf sentence). "junkRecall unchanged at 0.833" was therefore
evidence that the benchmark could not see the change — not evidence that the
change was free. An unmeasured cost is not a zero cost, and reporting it as one
is how a ratchet gets walked down a hundredth at a time.

So twelve adversarial cases were authored, aimed at exactly the words each option
would add, each using them in a non-mating sense next to the shaping verbs and
mechanism nouns that make the rest of the gate fire. Against them:

```
shipped gate wrongly retains   1/12
set A wrongly retains          4/12
cost attributable to set A     3
```

The three set A buys:

| case | text | retained by |
|---|---|---|
| `pv-04` | Humanity has always shaped its institutions around whichever resource was scarcest. | P3a |
| `pv-08` | The engineering culture rewards anyone who ships, and everyone else drifts toward the exit. | P3b |
| `pv-11` | Section i defines the terms and Table I lists the institutions that mandate reporting. | P1b |

Every one is the same shape: **a generic human word plus `culture` /
`institutions` / `rewards` from `cultural-frame-mechanism` at 2.5.** The cost is
not in the vocabulary. It is in the interaction between a generic participant and
the frame option 1 added — which means widening the vocabulary may be the wrong
instrument, and requiring a more specific participant when the cultural frame is
the only mechanism present may be the right one. That is not designed here, and
should not be designed in the same breath as the measurement that suggests it.

`P2` is the exception. All three of its adversarial cases stay binned, including
"Engineers taught the sorter to reject any male housing whose pins are bent" —
sexed noun, shaping verb, and still out.

## And a false positive that is already shipped

`pv-07` — "The parent and sister packages inherit whatever the culture of the
monorepo rewards" — is retained by the **shipped** gate, no option required.
`parent` is in the group frame and `culture` + `rewards` fires the cultural
frame, so a sentence about software packages reads as a claim about people.

That is a cost option 1 bought and nobody caught, because nothing in the
benchmark exercised it. It is now `pv-07`, a known fail-open miss, frozen rather
than quietly fixed — the same rule this project applies to every false positive a
fix buys.

## Recommendation

1. **Adopt P2 alone.** `male` / `female` / `males` / `females` into
   `human-individuals`. It is the only candidate with a measured-at-zero rather
   than unmeasured cost, it takes cultural recall 8/24 → 10/24, and it removes
   the analyzer's disagreement with its own `cross-sex-selection` frame. Free,
   and correct on grounds independent of what it buys.
2. **Reject `our` and `their`** on the existing benchmark evidence.
3. **Hold P1b, P3a and P3b.** Each buys real recall and each costs one authored
   false positive of an identical shape. They are worth taking — but as part of
   the narrower design the shape points at, not as a regex widening measured
   against a population that cannot see it.
4. **Investigate the shape first**: require a participant from
   `human-individuals` or `human-groups`, not the pronoun frame, when
   `cultural-frame-mechanism` is the only mechanism that fired. If that holds, it
   may buy P1b, P3a and P3b's recall while binning all three of their costs, and
   `pv-07` with them.

Adopting P2 alone leaves the minimal pairs at 3/8. That is the honest state and
the pair fixture stays a ratchet in the defect direction, so the next attempt has
to say what it moved.

## What was deliberately not done

- No analyzer change. This is a ruling document.
- The pair fixture's `knownSplits` was not touched. Closing splits with an
  unmeasured widening is precisely the move it exists to catch.
- The declared `junkRecall` minimum stays 0.75, per the precedent of appends #1
  through #3: the achieved number moves, the floor does not.
- The 12 new cases were **authored**, not lifted. `lab-corpus/` is gitignored
  third-party text by standing decision (md/RERUN.md §1).

## Reproducing

Scratchpad rigs, session `79e4d688`:

```
participant-options.mjs      the five options against the benchmark and the pairs
participant-combos.mjs       per-word blame inside P1, plus the four sets
participant-adversarial.mjs  the twelve authored traps
cr-blame.mjs                 frame-vs-participant attribution for the 24 claims
cr-maps.mjs                  what the canon returns for each admitted claim
```

One instrument note worth keeping. `participant-options.mjs` first ran the
benchmark cases through `normalizeInput` + `detectClaimUnits` like every other
fixture, and reported `junkRecall 0.786` for the shipped gate against the suite's
`0.833`. `classifyCase` in `tests/lab-domain-benchmark.test.mjs` bypasses intake
entirely and hands each case to `classifyDomainRelevance` as one synthetic unit
with `isClaimLike` forced true. When a rig and the engine disagree the rig is the
bug; the shipped row of every table above is now the check that it is fixed.
