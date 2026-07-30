# The entry side of the comparison — the fix two frozen defects asked for

v2.6.8, 2026-07-30. **The meta-register defect is fixed, at zero cost, on the
route its own record named a week ago.**

## The idea, and why it kept getting rejected

The canon is written as site copy. Its prose says `card`, `essay`, `hub`,
`section`, `the claim that` — words that describe how the site is BUILT. Sitting
on the retrieval surface as ordinary content, they let a reader's passage match
on the furniture instead of the argument:

```
"The card says nothing about whether men who date older women stay longer."
    -> gender-dynamics:…make-peace-with-it-or-let-resentment-win   0.434  DISPLAYED
```

A passage about the age of the women men date, credibly matched to an entry about
making peace with being alone.

Three fixes were measured in `fe31f47` and all three lost. Every one of them
demoted the same words into `LOW_INFORMATION_MATCH_TERMS`:

```
card alone ....................... defect survives, archive cost 0
artifact nouns only .............. defect survives, archive cost 0
nouns + claim, state, describe ... defect survives, archive cost 0
say* alone ....................... defect survives, archive cost 3
all of the above ................. defect DIES,     archive cost 3
```

The three lost mappings were on Pew prose full of *"women are more likely to SAY
online dating is not safe"* — a survey reporting what respondents said, which is
ordinary reported speech and not an artifact describing itself. Trading two apt
credible matches for one constructed case was a bad trade, so the defect was
frozen with a closing note:

> the promising direction is neither a denylist nor a rewrite, but scoping the
> demotion to the **entry side** of the comparison.

## Why that note was right, stated precisely

`LOW_INFORMATION_MATCH_TERMS` feeds `admissionDistinctiveShared` **and nothing
else**. It is an ADMISSION lever. It cannot move `sharedWeight`,
`queryCoverage`, `canonCoverage` or `distinctiveBoost` — so `scoreEntry().score`
is identical before and after any change to it, by construction.

Removing a term from the ENTRY's token sets moves all four.

Same vocabulary, different quantity, opposite answer:

| lever | nouns alone | with `say*` |
|---|---|---|
| admission (`LOW_INFORMATION_MATCH_TERMS`) | defect survives, cost 0 | defect dies, **cost 3** |
| scoring (`ENTRY_ARTIFACT_TERMS`) | **defect dies, cost 0** | defect dies, cost 2 |

This is the fourth instrument-blindness finding this month and the first one that
paid: three earlier measurements were true statements about a quantity that could
not move. Checking which quantity a lever actually touches, before believing what
a variant reports, has now been worth the time twice.

## What shipped

```js
const ENTRY_ARTIFACT_TERMS = new Set([
  'card', 'cards', 'essay', 'essays', 'page', 'pages', 'section', 'sections',
  'entry', 'entries', 'hub', 'hubs', 'dossier', 'dossiers', 'claim', 'claims',
].flatMap((term) => tokenize(term)));
```

Filtered out of `entry._tokens` and `entry._distinctiveTokens` in
`prepareCanonIndex`. **The passage is untouched.** A reader writing *"the claim
that women prefer height"* keeps every one of their own tokens and their query
length is unchanged — nothing here can make a passage match less because of a
word the READER used. That asymmetry is what makes the fix free, and it is now
asserted as a property in `tests/lab-match-behavior.test.mjs` rather than left
implied, so a leak from the entry side onto the unit fails a test.

`say*` is deliberately absent. It also kills the defect and costs two displayed
matches; the nouns already do the job for nothing, so the reported-speech half
never comes under threat at all.

## What it cost

Measured as DISPLAYED matches through `analyzeDocument` over all 21 archived
sources — a scoring change that cannot be seen in the product is not the thing
anyone was arguing about:

```
displayed matches   129 -> 129     0 lost, 0 gained
```

The defect itself fell **0.434 → 0.367**: under `minCredibleScore`, still over
`minWeakScore`. The passage now surfaces the concept as *nearby* rather than
asserting a credible mapping, which is the right answer rather than merely a
quieter one.

### Threshold adjudication

Sheet:
[`lab-entry-side-threshold-adjudication.md`](lab-entry-side-threshold-adjudication.md).

```
changed              11730   621 down / 11109 up
candidateScoreFloor  40 gain / 209 loss
minWeakScore         22 gain /  23 loss
minCredibleScore      0 gain /   0 loss
```

**Nothing crossed the reader-visible line in either direction**, so this needs no
verdict at `minCredibleScore` at all. The authored defect passage is not in the
corpus, which is why the one crossing that matters does not appear here.

Most scores went **up**, which sounds wrong for something described as a
demotion and is not: removing tokens from an entry shrinks the `canonCoverage`
denominator, so every surviving shared token is a larger share of a smaller set.
The reason that produced no credible crossings is that the effect is tiny and
uniform, while the defect it kills is concentrated in exactly the passages whose
only real overlap was the furniture.

Rulings 5,033 → 5,296; PENDING 5,138, all of it candidate-floor and weak.

## What this does NOT fix

The numeral-coincidence defect ([`lab-numeral-coincidence.md`](lab-numeral-coincidence.md))
is untouched — measured at 0.451 before and after. It is a different mechanism
that happens to have wanted a similar-sounding fix. Its own record asks a harder
question: whether a numeral is being matched **as the entry's own statistic**,
which is a conditional rather than a removal, and is still not built.

Single-token inflation (`queryCoverage 1.0` on a one-token passage,
[`lab-doctrine-consumer-unit.md`](lab-doctrine-consumer-unit.md)) is also
untouched and was never an entry-side problem.

So of the three defects I described as pointing at one missing capability, **two
did and one did not.** The two that did are the meta-register defect — now
fixed — and the numeral one, which asked for the entry side and needs more than
this.
