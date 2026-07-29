# C3 — site-internal finding, re-verified at HEAD c40cd7f

**No scout assigned.** C3 is entirely site-internal: it needs no external research, only a
re-check that the defect still exists at the current commit. Checkpoint 01 recorded it at
`cdac8b35186fdd2619af54be8aa423bc36d88a71`; the tree has moved to `c40cd7f`, so every locator
below was re-derived rather than copied forward.

**Re-confirmed at `845f56a`.** The maintainer pushed three Lab commits mid-run
(`e48c9d5`, `85a930d`, `845f56a`), moving HEAD off `c40cd7f`. Those commits touch only `lab.html`,
two `md/` files, and two test files — none of the five pages cited below. The published null, the
calculator-boundary sentence, and the 0-of-4 inbound-link count were all re-checked at `845f56a` and
are unchanged.

## The claim

A per-candidate ranked fit score is a pair-specific prediction. The site publishes a null that
fences pair-specific prediction as impossible, and does not apply that fence to its own
instruments.

## Verified locators (current HEAD)

| Element | Location | Verbatim |
|---|---|---|
| The null | [frameworks.html:183](frameworks.html:183) | Joel, Eastwick & Finkel, two speed-dating samples (n=163, n=187), models "explained **effectively none of the held-out unique desire for this particular person (less than 0.1%)**" · Tier 2 |
| The self-fence on calculators | [frameworks.html:184](frameworks.html:184) | "This is also the boundary on the site's own calculators: they estimate declared fit and constraints conditional on their inputs; **they do not predict chemistry**." |
| The anchor | [frameworks.html:145](frameworks.html:145) | `<div class="rf-entry" id="interaction-gate">` — exists, and is linked *within* frameworks.html only ([:45](frameworks.html:45) TOC, [:133](frameworks.html:133) body) |
| The promise | [matchmaker.html:20](matchmaker.html:20) | "then **finds the celebrities you'd actually match with at your level**" |
| Primary sources | [frameworks.html:196](frameworks.html:196) | Joel/Eastwick/Finkel 2017 *Psych Science* (doi 10.1177/0956797617714580); Baxter et al. 2022 *PNAS* (doi 10.1073/pnas.2206925119) |

## Inbound links to `#interaction-gate` from the four instrument pages

    compatibility.html     0
    matchmaker.html        0
    smvcalc.html           0
    hierarchy.html         0

Confirmed still zero at HEAD. The fence is real, sourced, and structurally unreachable from any
instrument it fences.

## Refinement on checkpoint 01 — not a correction, an added distinction

Checkpoint 01 said compatibility.html:20's note "addresses public skepticism (Pew 21%), not the
null." That is accurate, and re-reading the full sentence at HEAD sharpens *why* it matters:

> "The public's instinct here is right: only 21% of Americans think a matching algorithm can tell
> whether two people will fall in love (Pew 2023) — and this tool doesn't claim to either. It
> structures your own judgment; it doesn't replace it."

So compatibility.html carries a self-fence of exactly the **right shape** pointed at the **wrong
authority**: it grounds its modesty in a public-opinion poll rather than in the site's own
measured null sitting one page away. That is a stronger and more specific finding than "the null
is unlinked" — the page already wanted to say this and reached for the weaker warrant.

**matchmaker.html is the sharper instance:** it makes the pair-specific promise outright, with no
fence of any shape, while pulling inputs from three other calculators.

## Grading

- Evidence: SITE-INTERNAL, fully verifiable, no external research required. Not a discourse claim,
  so recurrence analysis does not apply.
- Cost to fix: lowest in the run — the doctrine already exists and is already sourced. What is
  missing is a link and a sentence, not a finding.
- Carries forward as recorded: existing doctrine, unapplied to the site's own instruments.
