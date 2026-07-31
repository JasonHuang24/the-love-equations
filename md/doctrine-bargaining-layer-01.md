# Doctrine invention — The Bargaining Layer (batch 05)

**Date:** 2026-07-31 · **Lane:** Claude (Opus 5, high effort), main loop + 3 Opus 5 research scouts
**Target surface:** `frameworks.html` — one new TOC group, three entries (37–39)
**Status:** CONCEPT FORMED, evidence pass in flight.
**Chains from:** batch 01 (`1e64df7`), 02 (`b08f6d3`), 03 (`01f5d61`), 04 (`545b7e9`).

---

## 0. Collision control and tree state

Staking: TOC group **"The bargaining layer"**, ids `#the-surplus`, `#outside-option`,
`#commitment-problem`. Tested claims renumber 37–39 → 40–42.

The blocking credible-line crossing was ruled ACCEPT by Jason at `b6de5a7` and the suite is
green. The `LE Lab Work` session has closed its docket and released the canon files.

## 1. The structural finding

| batch | what it modelled |
| --- | --- |
| 01 transaction layer | what participating costs |
| 02 population layer | who is in the pool, when they leave, what a snapshot licenses |
| 03 market container | the shape nobody chose — ratio and geography |
| 04 advice layer | the market for advice about all of the above |

Every one of those models **a participant facing a market**. None models **two people facing
each other**. The site has an exhaustive one-sided valuation apparatus — five levers, a
hierarchy, a matching curve, gates — and no model of two parties optimising simultaneously,
each with alternatives, each unable to make a promise the other has reason to believe.

Verified by grep across all 39 entries: `bargaining`, `outside option`, `commitment device`,
`credible threat`, `Schelling`, `Nash`, `preference falsification` — **zero as doctrine.**
The only hits are matchmaker prose and one passing use of "negotiation" in a Lexicon gloss.

This is the layer where batch 03 lands. The container sets what each person can get
elsewhere; **nothing has ever said what that does to the two of them.**

## 2. The three entries

### 37 · The Surplus — *The bargaining layer*

A pairing exists because it produces something neither person could produce alone —
economies of scale, insurance against shocks, specialisation, joint production of a
household and children, and consumption that is better shared than not.

**The move the entry makes: the SIZE of the surplus and the SPLIT of it are different
questions, and nearly every argument about relationships conflates them.** "What do men get
out of marriage" is a split question wearing a size question's clothes. A pairing can
produce an enormous surplus that is divided unfairly, or a meagre one divided evenly, and
those call for opposite responses.

The honest complication the scout is chasing: Becker's gains come from *specialisation*, so
they should fall as partners become more similar in market wages — and yet the couples who
have converged most (both graduates, both earning) marry more and divorce less. If the
classical account predicts the opposite of the observed pattern, the entry has to say what
replaced it rather than restate Becker.

### 38 · The Outside Option — *The bargaining layer*

**What each party could get elsewhere sets what they get inside — not contribution, not
fairness, not effort.** Improve someone's alternatives and their treatment improves without
anyone renegotiating anything out loud.

This is the most cynical claim in five batches and the scout brief was written to attack
it. It also has, on paper, the best natural experiments of any entry I have shipped: when
unilateral divorce made exit unilaterally available, what happened to violence and suicide
*inside* surviving marriages; when a child benefit was switched from the father's wallet to
the mother's purse, what happened to spending; when women's relative wages rose, what
happened to domestic violence.

**The counter that must ship in the body:** the finding that wives who out-earn their
husbands do *more* housework, not less — the direct opposite of what bargaining predicts.
If that survives scrutiny, the entry is a bounded claim about some margins rather than a
general law, and it should say so in its own headline.

**Expected honest limit:** this literature is about *households*, not dating. If there is no
dating-market analogue, the entry carries the transfer as ours and labelled.

### 39 · The Commitment Problem — *The bargaining layer*

**A promise that costs nothing to break carries no information and changes no behaviour.**
Schelling's mechanism is that commitment works by *destroying your own option to renege* —
which makes it the exact inverse of how commitment is usually discussed, as a feeling.

This is the Signal Cost Rule from batch 01 aimed at promises rather than claims, and it
closes the loop: batch 01 said a claim is worth what it costs to fake; this says a promise
is worth what it costs to break.

**The counter that has to be answered rather than dodged:** the same divorce reforms that
made exit cheap also reduced domestic violence and female suicide. Any entry mourning the
loss of binding commitment has to reckon with the fact that the binding was, measurably,
holding some people in danger. The entry should not be able to be read as nostalgia.

## 3. Method changes adopted from the register exchange

Two rules from the concurrent Lab session's measurement work, both earned tonight:

1. **Prefer a design where the probe is the control over one where the probe is the
   variable.** The synopsis-emptying test and the alias-remedy test both hold the probe
   constant and vary the index; both reproduced cleanly. The register census varied the
   probe and collapsed under replication. For this batch, that means: **do not run an
   ordinary-versus-analytic reachability census on the new entries.** Run the two designs
   that survived — synopsis-emptying, and alias-varying — before committing.
2. **Alias safety is about what the phrase NAMES, not how many words it has.** `just move`,
   `damaged goods`, `too many women` name the *claim*. `younger women`, `age` name the
   *population the claim is about*, and a phrase naming a population fires on every passage
   describing that population. Aliases for this batch are authored to name claims.

And one from my own hour of being wrong: **when a single case contradicts the pattern,
interrogate the case before rescuing the pattern.** `local-market` ran backwards in both
censuses because it was the one entry with discourse-register aliases, and I spent an hour
treating it as a counterexample instead of asking why it differed.

## 3b. OPERATIONAL RESUME STATE (written before a context compaction)

Everything needed to finish this batch without the preceding conversation.

**Tree:** `b6de5a7` pushed, in sync with origin, `npm run test:lab` green end to end.
Canon **491** concepts, Rules & Frameworks **44**, 39 `rf-entry` blocks on the page.

**In flight when compaction happened:** three Opus 5 scouts, one per entry —
S-G (the surplus: Becker, the modern replacement, what the surplus consists of),
S-H (outside options: Nash/separate-spheres, unilateral divorce, wallet-to-purse, Aizer,
and the Bertrand/Kamenica/Pan counter), S-I (commitment: Schelling, Wolfers on divorce
dynamics, specific investment, covenant marriage, and the violence/suicide counter).
Their briefs all demand exact citations, tier labels, "what this does NOT show", and
UNVERIFIED flags. **Independently re-check any load-bearing figure before publishing it —
that discipline has changed what shipped twice this session.**

**The batch pipeline, as run four times:**

1. Draft each entry as its own file in the session scratchpad, never straight into the page.
2. TOC edit first: add the new `toc-group` before the "Tested claims" group and renumber
   the three tested claims (currently 37–39 → 40–42).
3. Splice with PowerShell, inserting before the unique marker `      <!-- The Wall -->`:
   read with `[System.IO.File]::ReadAllText`, assert the marker occurs exactly once,
   `Replace(marker, entries + marker)`, write with `UTF8Encoding($false)`. Then assert
   CR count is 0 and the new ids are present. The file is LF despite the repo being CRLF.
4. Overlay: append entries to `data/canon-overlay.json` via a Node script keyed after the
   previous batch's last id. Check the diff is `N 0` (additive only).
5. **Validate misreadings programmatically before building**: 10–18 words, no
   `MISREADING_DENIAL_CUES` match, decisive frame. Two failed on the word "false" in
   batch 04; a misreading carrying a negator flips the entry to *support* what it rejects.
6. `node scripts/build-canon-index.mjs`, then move the four pins in
   `tests/canon-index-fixtures.mjs`: `conceptCount`, `Rules & Frameworks`, misreading
   count, boundary count. Pins move in the same commit as the doctrine.
7. `node tools/lab-threshold-sweep.mjs --neighbors tests/fixtures/threshold-neighbors.json`
   — **`--neighbors` and never `--baseline`** (a stale baseline once invented 130,120
   fictional crossings), and **never `--rule`** (it stamps ~4,699 unread rows).
8. Expect the Availability IDF pin in `tests/lab-analyzer.test.mjs` to drift by ~0.001.
   Extend its comment history rather than silently re-pinning. Eight moves so far,
   cumulative drift 0.003 against a `minCredibleScore` of 0.43.
9. Full-diff review before staging: enumerate every deletion in `frameworks.html` (should
   be only the renumbered TOC lines), and attribute changes **per entry** by regexing
   `rf-entry` blocks out of HEAD and the working tree — `git diff -U0` maps insertions to
   the *preceding* entry and will report your own new entries as changes to someone else's.
   The entry immediately before the insertion point always shows a ~30-char delta; that is
   the trailing HTML comment, not prose.
10. Commit message via `git commit -F <file>` — PowerShell here-strings mangle it.
11. Verify in the browser at `http://localhost:8753/frameworks.html` (preview_start name
    `static`): entry count, titles, dead anchors, entity leaks, TOC tail.

**If a credible-line crossing appears:** it is release-blocking and reserved for Jason.
Recording a verdict takes **two** edits — the ruling (`ruling`, `ruledBy`, `ruledAt`) and
`counts.pending` plus `counts.pendingByThreshold`, where the threshold key must be **set to
0, not removed** (removing it makes the assertion compare `undefined` to `0`).

**At-risk pair to watch:** `smv:looks:age` sits at exactly 0.430 against a 0.430 floor on
the Zhang fertility sentence, surviving only on `>=`. Canon growth alone does not threaten
it — three entries moved it 0.000 — but **topical vocabulary overlap does**. This batch is
about bargaining and commitment, so overlap is expected to be low; measure rather than
assume with `overlap-vs-growth.mjs`.

**Measurement designs to run before committing** (per §3): synopsis-emptying and
alias-varying only. Do **not** run an ordinary-versus-analytic reachability census — that
design was withdrawn by both sessions tonight because between-probe variance swamps it.

## 4. What this batch will not claim

- That the household-bargaining results transfer to dating without a labelled inference.
- That commitment devices are good on net, unless the violence and suicide findings can be
  answered rather than omitted.
- That Becker's specialisation account explains modern marriage, if the education gradient
  points the other way.

---

## 5. OUTCOME — what the evidence did to the three entries

All three shipped. **All three had their central claim changed by the evidence, and two were
inverted outright.** Four Opus 5 scouts ran; every load-bearing figure below was re-checked
against a primary source in the main loop before it reached the page.

### 37 · The Surplus — the thesis was understated, not wrong

The draft said the discourse conflates the SIZE of the surplus with its SPLIT. The literature
does something worse: it can measure the size and **has no coherent theory of the split**. The
leading sharing-rule estimate (0.65 to the wife) is disowned by its own authors as arising
"mechanically". So every "who gets the better deal" claim, from any direction, is unbacked
rather than contested.

Two inversions inside the entry:

- **Becker failed his own test, in his own table.** He predicted negative wage sorting; the 1967
  SEO sample gave **+.32** (whites) and **+.24** (blacks), and he wrote that this "is troublesome
  since the theory predicts a negative correlation." The rescue is *an unpublished memorandum
  extending some work of Gronau (1972)*, and his own sentence is "If his calculations hold up,
  this would be striking confirmation of my theory." Read directly from the NBER reprint,
  pp. 318–319 — not taken from the scout. **Verdict: unfalsifiable as stated, not refuted.**
- **The modern replacement's signature is missing.** College-graduate assortative mating FELL
  from 5× (1962) to 2× (2013); graduate degrees 8.4× → 3.1×. The rise is at the bottom.

The biggest measured component of the surplus turned out to be **insurance**, not specialisation
and not companionship — 63% of the buffer against a husband's permanent wage shock is the wife's
labour supply. And it is asymmetric, which turns a size fact into a split fact immediately.

### 38 · The Outside Option — two of the three drafted assertions did not survive

- **Cut: "not contribution, not fairness, not effort."** The literature rejects income *pooling*.
  It does not license the ranking. Gone from the headline.
- **Cut: the counter we came to publish.** The plan was to close on "wives who out-earn do more
  housework." The density cliff at 0.5 is refuted at Tier 1 — Finnish population registers,
  16.7M couple-years, **zero discontinuity among the 77.8% of couples who do not work together**,
  and a placebo of randomly matched coworkers reproduces it. The housework half is a
  functional-form artifact: let absolute earnings enter as a spline and the relative-earnings
  terms are a precise zero, **F(2,5058) = 0.10, p = 0.90** (verified in the PMC full text, not
  taken on report). What survives is a *rigidity* finding — men's housework is flat in the wage
  ratio — which is not the finding we meant to publish.
- **Also cut, in the other direction: the backlash story.** A fourth scout established that the
  male-backlash literature is thinner than its reputation: across 56 outcomes, **36% significantly
  protective, 2% significantly harmful, 63% null**. The famous Mexican result splits on a
  variable determined by the number and ages of eligible children, and its average effect is a
  null. The Swedish register result disarms itself — the author says it is partly care-seeking
  and absent in the most severe injuries.

What survived is narrower and better evidenced than expected: **Brassiolo (Spain 2005), ~30%
less conflict among couples who STAYED MARRIED** — the "without renegotiating out loud" clause,
measured. Plus the enforcement precondition, which is the entry's real contribution.

### 39 · The Commitment Problem — the central claim was false as drafted

"A promise that costs nothing to break carries no information" is the **babbling equilibrium of
Crawford–Sobel, not the theorem**. It is falsified directly by Lee & Niederle: 613 participants,
randomised endowment of *free* virtual roses, **+20% acceptance**, >+50% on downward offers.
The roses cost no money and were not irreversible — they were **scarce**. That is a third
category the draft had no room for: a budget-constrained signal.

Rewritten rule: *a signal carries information in proportion to what sending it forecloses.*
"Costless therefore worthless" is wrong; "unlimited therefore worthless" is close.

The entry now leads its third box with the number most unflattering to itself: offered a real,
costly, legally binding commitment contract at no charge, **98–99% of couples declined it**.
And the two large RCTs show you can raise marital happiness, lower distress and infidelity, and
**still not move whether couples stay together**.

## 6. PROCESS NOTES worth keeping

1. **The misreading gate caught a live one.** "…carries no information about what someone will
   do" tripped `no` and would have flipped the entry into SUPPORTING the claim it rejects.
   Validating programmatically before building is not ceremony.
2. **The shared tree moved underneath me mid-batch, again, and the derived file was the tell.**
   Two commits landed (`bf9909f`, `532fd09` — the other session ruled the inherited crossing) and
   the other session left uncommitted edits to **`js/lab-analyzer.js` and
   `tools/lab-threshold-sweep.mjs`**. I had already swept. Rebuilt the band in a detached
   worktree at HEAD with only my three source files copied in, so the sweep ran against the
   COMMITTED engine. Result: rulings, counts and every score **identical**; the sole difference
   was `"analyzer": "2.6.11"` vs `"2.6.10"` — their unreleased version string, which would have
   been stamped into my fixture. Took the committed-engine artifact.
   **Their short-unit penalty change moved 0 of 103,303 swept pairs** — worth telling them, and
   consistent with their own note that 13 of the 14 affected units were already claim-rejected.
3. **`cmp` disagreed with the summary line.** The sweep printed identical totals for both runs
   and the files still differed. Compare bytes, not banners.
4. **The at-risk pair moved the right way.** `smv:looks:age` went **0.430 → 0.432**, off the
   floor rather than through it. Bargaining vocabulary has low overlap with a fertility sentence,
   as predicted — and this time it was measured rather than assumed.
5. Splicing before `<!-- The Wall -->` rather than inside an entry meant **no ~30-char delta** on
   the preceding entry: 3 added, 0 removed, 0 existing entries touched.
