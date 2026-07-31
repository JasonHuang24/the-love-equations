# face and age: eight candidate surfaces, six rejected by measurement, two ready

2026-07-31. Measured against canon `1.0.0+7a8b16547d89` at 488 concepts and all
21 archived sources (2,408 claim-like passages, 1,253 displayed credible
matches). **Not applied** — see §7.

`md/lab-generic-title-aliases.md` closed the alias list with `face` and `age`
recorded as *"dead, and it COSTS — needs a match surface, not an alias"*, and
left that surface unwritten because it is doctrine authoring and a different
decision. This is that pass, and six of the eight things it tried do not ship.

## 1. The rule the survivors have in common

Eight components were built and measured **one at a time** across the whole
archive — causation by variants, not by reasoning per token.

```
component                              archive      probe effect
face misreading 1  (jawline)            +0 / -0     BOTH probes DOWN (0.478->0.476, 0.425->0.422)
face misreading 2  (snap read)          +0 / -0     0.478->0.549 · weak 0.425 -> MAPPED 0.503
face alias  facial attractiveness       +1 / -1     0.555 / 0.519
face alias  attractive face             +0 / -0     nothing at all
age  misreading 1  (younger outranks)   +1 / -1     0.581->0.702, one probe to weak
age  misreading 2  (prices her)         +0 / -0     0.581->0.632
age  alias  younger women               +1 / -0     unreached -> MAPPED 0.540
age  alias  peak age                    +0 / -0     nothing at all
```

**Ships: face misreading 2 and age misreading 2.** Both are free on the archive
and both move the concept. Every other component either costs a correct match,
buys a wrong one, or does nothing.

The two survivors have one property in common and it is the transferable rule:
they are written in the ORDINARY REGISTER OF THE CLAIM, not in the entry's own
vocabulary. `smv:looks:age`'s synopsis says *"Looks are time-stamped… where the
Clock multiplier bites"*; the survivor says *"Men date younger women because a
woman's age is the only number that prices her in the market."* The entry could
already be reached by anyone who wrote in its register. What it could not reach
was anyone writing the claim the way the claim is actually made.

## 2. `younger women` fails the fourth way, and that is a new finding

The generic-title ruling named a fourth failure shape: `age` is not a homonym,
it means exactly what the concept is about, and it still cannot carry it because
in quantitative social science it is the axis every dataset breaks out.

**Making a phrase out of the word does not fix it.** `younger women` is
unambiguous, multi-word, clears every length floor, and is the canonical subject
of the literature. Its one archive gain:

> "Younger women who have used dating sites or apps stand out for experiencing
> unwanted behaviors on these platforms." → `smv:looks:age` @ 0.540

That is a harassment prevalence statistic. `younger women` is the population
being *described*, not the claim being *made* — the identical defect one level
up from the word. One gain, one wrong, which is the same ratio as the 75 the
typing pass produced.

**Ask what a token's presence SIGNALS, not just what it means — and note that
the signal does not improve by lengthening the token.**

## 3. What `facial attractiveness` actually did

`+1 / -1`, and both are the **same sentence**:

> "Men allocated more mate dollars to physical attractiveness than women did…"
> `M-TBD-15` @ 0.450 → `M-TBD-6` @ 0.450

Neither is `smv:looks:face`. Adding the alias shifted IDF enough to swap which of
two Mythbuster entries a reader is shown, at an identical score, on a claim the
alias has nothing to do with. A lateral displacement that buys nothing and
changes a reader's answer is worse than no effect, and a `+1/-1` line in a
summary would have read as neutral.

`attractive face` is simply inert: zero archive movement and zero probe movement.
It was measured rather than assumed, because inert curation is this project's
most repeated defect.

## 4. `smv:looks:age` has exactly one unit of IDF headroom

Its single genuinely correct archive match sits **on** the line:

> "First, because fertility declines faster with age and requires a larger
> physiological cost for women than men, men are hypothesized to show stronger
> preferences for physical characteristics…" → `smv:looks:age` @ **0.430**

`minCredibleScore` is 0.430. Every third misreading tried — age misreading 1,
round-2 candidates A3 and A4 — dropped it below the line, because a misreading
raises the entry's `canonCoverage` denominator. A3 was the most tempting of the
three (it took a probe 0.581 → 0.786) and it still costs this sentence.

**One misreading on this entry is free; two are not.** Anyone extending
`smv:looks:age` later should check this sentence first — it is the canary, and it
has no margin at all.

## 5. Rejected in round 2 as well

```
age A3  "Men prefer younger women, so a woman's market value falls every year
         while a man's keeps climbing."          +0 / -1   the fertility sentence
age A4  "A woman past thirty has spent her best years, so men will choose a
         younger woman instead."                 +0 / -1   same loss, buys nothing
face F3 "A weak jaw gets a man rejected on sight, whatever else women want
         from him."                              +1 / -1   see below
```

F3's gain is the same Li sentence the `facial attractiveness` alias reached —
*"Men wanted to know first that a woman was at least average on physical
attractiveness"* — and it displaces `hierarchy:a-generic-male` @ 0.467 through
`maxMatchesPerClaim`. That sentence is about physical attractiveness as a
whole, which is the parent lever, not the face. **A wrong gain that evicts a
right match loses on both axes**, which is exactly what the typing pass measured
at +75 / −2.

## 6. What stays open, stated rather than papered over

The ordinary phrasing **"Men prefer younger women, and the gap widens as the man
gets older"** is STILL not reached, before or after. The only component that
reached it was the `younger women` alias, at 0.540, and that alias buys the Pew
harassment false positive. So this pass narrows the gap for the entry's own
register and does not close it for the market register.

That is not a failure of the surface. It is the fourth failure shape being
load-bearing: to reach that sentence you have to match on `younger women`, and
matching on `younger women` is what goes wrong.

Correction to the record this pass inherited: `tests/lab-match-behavior.test.mjs`
says `face` and `age` were *"measured at weak 0.369 and not-reached respectively
on probes that plainly make the claim."* Measured here, `smv:looks:age` reaches
**0.581 displayed** on *"Her looks are time-stamped: a woman's dating value falls
with age while a man's rises with money and status"* — a probe that plainly makes
the claim. **The failure is register-specific, not absolute**, and the earlier
record's "not reached" is too strong for the concept even though it was true of
its probe.

## 7. NOT APPLIED — the two-line patch, ready

A concurrent session held `data/canon-overlay.json`, `data/le-canon-index.json`,
`tests/canon-index-fixtures.mjs` and `tests/fixtures/threshold-neighbors.json`
for effectively all of this run, across four doctrine batches. Jason's standing
ruling for the run is that I do not operate on their files, so the measurement
landed and the edit did not. The window opened once, between their
market-container and advice-layer batches, and closed while the archive sweep
was still running.

Apply to `data/canon-overlay.json`, appending one string to each entry's existing
`commonMisreadings`:

```jsonc
"smv:looks:face": {
  "commonMisreadings": [
    "An average face is a plain forgettable face, so averageness makes women reject a man.",
    "Men reject a woman on her face in the first second, and that snap read holds forever."
  ]
}

"smv:looks:age": {
  "commonMisreadings": [
    "Women peak at twenty-two and hit a wall, so after that age men stop wanting them.",
    "Men date younger women because a woman's age is the only number that prices her in the market."
  ]
}
```

No `boundaryConditions` — both entries already carry two and the tranche rule is
one per entry, not two. No aliases: all four measured candidates were rejected
above.

**What the pins do:** `conceptCount` stays 488, and both entries already carry a
misreading and two boundaries, so `tests/canon-index-fixtures.mjs` needs **no
change at all** — this is a surface edit inside existing entries, not a merge.
Rebuild the index, regenerate the band with `--neighbors` and **no** `--baseline`,
and adjudicate: at +0/-0 displayed there should be nothing at the credible line,
but the entry token sets move so weak and candidate-floor crossings are expected,
and `WEAK_BACKLOG_CEILING` is at 516 of 516 with zero headroom.

Both strings were checked against the three measured rules before being
proposed: 10–18 words, one sentence, a decisive frame (`cross-sex-selection` on
both — `Men reject a woman`, `Men date younger women`), and no
`MISREADING_DENIAL_CUES` negator. The pinned negative controls
(`Men who are rejected early face a longer wait…`, `Responses to the dating
survey varied by income, age and education…`) were re-run against every variant
and neither ever mapped.

## Reproducing

```
face-age-variants.mjs   the seven package-level variants, probes + controls
age-why.mjs             why the age null result was the PROBES, not the surface
face-age-archive.mjs    displayed credible matches, 21 sources, every gain read
face-age-bisect.mjs     the eight components one at a time — the table in §1
face-age-round2.mjs     the three round-2 candidates, all rejected
```

`age-why.mjs` is worth keeping as the method: the first probe set returned "not
reached" for `age` under **every** variant, which looks like a dead surface and
was a dead PROBE. One probe said *"women who are younger"* where the alias was
`younger women` — a phrase hit needs the exact word ORDER, not merely the exact
inflection, which is the morphology trap with a new face. **Before believing a
null result, check that the probe can see the change.**
