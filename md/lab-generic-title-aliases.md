# face, body, age, game: all four stay dead, and `age` fails a way nothing else has

2026-07-30. Closes the list `md/lab-constants-audit.md` opened: twelve untyped
single-word aliases silenced by `minSingleAliasLength`, four ruled long ago, four
ruled in `md/lab-slang-alias-typing.md`, these four now.

**Ruling: none of the four is typed.** No canon change; two new guards.

---

## Why the archive is the right instrument this time

The slang terms — `cope`, `simp`, `4B`, `PSL` — were effectively absent from the
21 archived sources, so they had to be judged on authored probes. These four are
the opposite. They are ordinary English in a corpus of mate-preference research,
where faces, bodies and age are the subject matter. The archive can see them, so
it decides.

All four are also **title-derived**. None of these entries carries a single
authored alias, so the bare word reaches `_singleTokenAliases` from the title and
dies at the length floor. Nobody ever chose to add them.

## Typed standalone across all 21 sources

```
displayed credible matches   1,093 -> 1,166      +75 / -2

  smv:looks:age      +68
  smv:looks:face      +5
  smv:looks:body      +1
  lexicon:term-game   +1
```

**Not one of the 75 is right.** The counts are the least interesting part; these
were read.

### Three homonyms, one of them not a homonym at all

**`face` (+5) — the verb.** Every gain in the archive is the verb:

> "Thus, on average women tended to **face** a relative abundance of men in their
> local marriage market."
> "Women's increased sexual activity outside of marriage in the **face** of a male
> surplus…"

Zero of the five is about a human face. This is the `cope` shape exactly.

**`body` (+1) — the collective noun.** "One way to interpret this entire **body**
of existing longitudinal research…"

**`game` (+1) — the adjective.** "…the advice of sex advice columnist Dan Savage
(2007) that they strive to be good, giving, and **game**." Mapped to
`lexicon:term-game`, which is seduction skill.

**`age` (+68) — and this one is new.** `age` is not a homonym. It means exactly
what `smv:looks:age` is about. It still cannot carry the concept, because in
quantitative social science **`age` is the axis every dataset breaks out**:

> "…this varies by income, **age** and education"
> "There are also differences by **age**: 62% of Americans **ages** 65 and older…"
> "…assessed at about **age** 21 years and relationship status approximately 2.5
> years later"

Sixty-eight survey crosstabs. The entry is about looks being time-stamped and the
Clock multiplier biting; a demographic breakdown makes no claim about that at all.

This is a fourth failure shape and the record did not have it. `game`, `Wall` and
`Sham` were ruled dead as *"ordinary English that happens to name a concept"* —
homonyms, where the word means something else. **`age` fails while meaning the
right thing**, because its presence carries no information about whether the
passage is making the claim. A word can be perfectly unambiguous and still be a
terrible match surface.

### And it costs coverage as well as buying noise

`-2`. The new 0.540 hits displaced two correct matches through
`maxMatchesPerClaim`. Typing here is not a precision-for-recall trade; it loses on
both.

## The other half: is the dead alias free?

A dead alias only costs something where the token surface does not already carry
the concept. Probes that plainly make each claim:

```
smv:looks:body      REACHED  0.852 · 0.513
lexicon:term-game   REACHED  0.690 · 0.543
smv:looks:face      weak 0.369 · not reached  (one probe gate-binned)
smv:looks:age       not reached · not reached (one gate-binned; the other went
                                               to smv:overview at 0.540)
```

So **`body` and `game` cost nothing** — same finding as `Wall` and `Sham`, and
their dead alias is free.

**`face` and `age` do cost something.** They are genuinely hard to reach. But the
fix is not typing, because typing them is what produced the seventy-five: it is a
match surface, which is tranche work — boundary conditions and misreadings that
say what a claim about facial attractiveness or about age-pricing looks like.
Recorded rather than done, because that is doctrine authoring and a different
decision.

Two of the probes never reached the matcher at all — the gate binned them. That
is the third time this lane has landed on `md/lab-canon-alias-pass-01.md`'s
recommendation (3): *the binding constraint is not the alias, it is the gate.*

## What is pinned

**`tests/canon-index-fixtures.mjs`** — each of the four must keep zero aliases
(so the bare word is understood to come from the title) and zero typing.

**`tests/lab-match-behavior.test.mjs`** — two tests. The ordinary sense must stay
unmapped, one probe per failure shape; and the two concepts that carry themselves
must keep doing so.

The probes are **authored, not lifted**. The corpus is gitignored third-party text
(`md/RERUN.md` §1), so a committed fixture in this register has to be written.
Two further authored probes were dropped because the gate discards them: a probe
the gate never delivers cannot demonstrate anything about the matcher.

RED-verified by typing each of `Age` and `Face` standalone in the overlay:

> "Responses to the dating survey varied by income, age and education across the
> sample." uses a crosstab axis and now maps to smv:looks:age at 0.54.

> "Men who are rejected early face a longer wait before the next match arrives."
> uses the verb and now maps to smv:looks:face at 0.54.

## Cost

None. No canon change — `data/le-canon-index.json` is byte-identical to the
previous commit, so no scores moved and there was nothing to sweep or adjudicate.

## The list is now closed

```
typed          SMV (x2) · LMS · rizz · simp · 4B
reached by phrase instead                cope · PSL
dead, free (reached anyway)   game (smv:charm) · Wall (x2) · Sham · body · game (lexicon)
dead, and it costs — needs a match surface, not an alias      face · age
```

## Reproducing

```
generic-alias.mjs      exposure + the typed diff over 21 sources, gains dumped
generic-reach.mjs      whether each concept is reached without its alias
generic-authored.mjs   the authored stand-ins, checked to reproduce the failure
```
