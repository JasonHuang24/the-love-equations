# The alias-naming rule, tested: the corpus is blind to half of it

2026-07-31. No canon change. Canon `1.0.0+07fb1c92bac5`, 491 concepts, 21
archived sources.

`md/lab-synopsis-register.md` §4b claimed, from post-hoc data, that multi-word is
not the safety property in an alias — **what the phrase NAMES is** — and recorded
the claim as untested prospectively. This is the test. It half-succeeds, and the
half that fails is more useful than the half that works.

## 1. The design, and why it is prospective

Every multi-word alias in the canon was classified **from its grammar alone**, by
a rule fixed in the script before any occurrence was counted or any passage read:

```
BARE-NP      a noun phrase denoting a topic or a group, no predicate,
             evaluation, quantifier or imperative
PREDICATIVE  anything asserting, evaluating, quantifying or commanding
```

The classifier cannot see the outcome, so a motivated classification was not
available to me. That was the de-biasing the previous round said this needed —
the register census failed precisely because the person with a stake authored the
probes.

**Prediction registered before the numbers existed:** BARE-NP aliases fire on
passages that DESCRIBE their topic; PREDICATIVE aliases fire on passages
ASSERTING something. No split means §4b is wrong and gets withdrawn.

## 2. The test is VOID, and that is the result

```
multi-word aliases (title echoes excluded)     360
  BARE-NP                                      328
  PREDICATIVE                                   32

with at least one literal archive occurrence    29 of 360
  BARE-NP        28/328 fire · 312 occurrences
  PREDICATIVE     1/32  fire ·   1 occurrence
```

**One firing out of thirty-two.** The predicative class has no population in this
corpus, so the comparison cannot be made and a null here means nothing about
safety. That is fact (p) of the triage contract again — the 21-source archive is
essays and papers, and it has no discourse register at all, which is exactly
where predicative aliases live.

The single PREDICATIVE hit is `too many women`, and it is the **title of
Guttentag and Secord's 1983 book**, on the one entry that cites them. n=1, and a
book title is not a claim being made.

### The correction this forces to my own recommendation

§4b and §2 of `lab-synopsis-register.md` recommend discourse-register multi-word
aliases as "the cheapest register bridge available". **That recommendation rests
entirely on authored probes.** `just move` reaches an authored ordinary-register
sentence at 0.645 and occurs **zero times** in twenty-one sources. The archive
cannot confirm it and cannot refute it, and any future claim that the remedy
"works" needs a corpus this one is not.

Also worth stating plainly: **331 of 360 multi-word aliases never occur in the
archive at all.** Most of the alias surface is untested by the only instrument the
project has.

## 3. The salvageable half, and it sharpens the rule

The 28 firing BARE-NP aliases were read. They split cleanly, and not on the axis
§4b proposed:

**Aliases naming the CONCEPT ITSELF land on claims about it.**

```
physical attractiveness   84  -> smv:looks
   "they also place a higher value in a partner's physical attractiveness (39% vs 30%)"
dyadic power               7  -> frameworks:sex-ratio
   "Members of the sex in short supply enjoy greater dyadic power"
mate value discrepancy    19  -> frameworks:replaceability-asymmetry
mate retention behavior   15  -> frameworks:mate-retention-intensity
```

`smv:looks` **is** the physical-attractiveness lever; `sex-ratio` **is** the
dyadic-power mechanism. The alias is the concept's own name in the source
register, and its hits are findings about the concept.

**Aliases naming a POPULATION the concept ranges over land on crosstabs and
figure labels.**

```
previously married         3  -> frameworks:clearing-order
   "Never Married  Previously Married  Married  100 Percent 80 68 60 54 42 40 20 …"
   "The percent of never married, previously married, and married individuals who
    see their parents and their siblings at least weekly"
```

Two of its three hits are a **figure axis label** and its caption. That is the
same failure as `younger women` on `smv:looks:age` — a demographic category
matched wherever a dataset breaks out by it — and it is live in the shipped canon
today.

### The rule, restated

> **An alias must name the CONCEPT, not a population the concept ranges over.**

That is a better axis than claim-versus-population and it explains every case the
project has measured:

```
physical attractiveness  names the concept       fires on claims          GOOD
dyadic power             names the mechanism     fires on the mechanism   GOOD
just move                names the claim         (unmeasurable here)
previously married       names a demographic     fires on figure labels   BAD
younger women            names a population      fires on a harassment stat  BAD
age · face · body        names the concept BUT the name is also a universal
                         axis or a homonym       +75 credible, none right  BAD
```

The last row is why naming the concept is **necessary and not sufficient**: `age`
names `smv:looks:age` exactly and still fails, because the token's presence
carries no information about whether the passage makes the claim. Both conditions
have to hold — name the concept, and pick a name whose appearance is evidence.

## 4. One actionable defect, not mine to fix

`previously married` on `frameworks:clearing-order` is a population-naming alias
firing on figure labels in the shipped canon. It is the concurrent session's
entry and a canon edit, so it is flagged rather than changed. Its measured cost is
small — three archive occurrences — and the fix is to drop the alias, not to
reword anything. Recorded here so the next canon pass has it.

## 5. What would actually test this

A corpus with a discourse register: forum threads, comment sections, transcripts.
`md/lab-constants-audit.md` already needs one for `shortUnitWordCount` and the
three context boosts, all of which are near-inert on essays and papers. **That is
now three separate findings pointing at the same missing instrument**, and it is
the highest-value acquisition on the board — not more analysis of the archive we
have.

## Reproducing

```
alias-naming-census.mjs   grammar classifier, occurrence census, excerpt dump
                          -> alias-naming-census.json
```
