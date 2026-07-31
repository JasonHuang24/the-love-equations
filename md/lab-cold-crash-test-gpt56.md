# LE Lab cold crash-test — GPT-5.6

Date: 2026-07-31
Scope: report-only cold test of `lab.html` / production intake and analyzer contract
Tested tree: `main f5ef499 · clean · 0 behind origin/main`

## Cold verdict

The engine did **not** hold up well enough for a reader to trust the current per-claim output without checking it. Retrieval is often impressively specific, but the most important promise — a credible top concept with a trustworthy `Supports` / `Contradicts` direction — fails on exact, affirmative restatements of canon statistics. The relevance gate also drops unmistakably romantic, ordinary-language passages and even a claim containing the canon term “hypergamy,” while retaining some technical and housing prose as research candidates.

The most serious result is reproducible with two clean control claims whose numbers agree with the index: the Lab finds the right statistical concept at High confidence and labels the claim `Contradicts`.

This was a true cold pass. I did not read `md/` or `lab-corpus/` before completing this body, and I did not use any corpus text.

## Setup and test surface

- `npm run test:lab` completed with exit code **0** in 45.7 seconds. The suite reported `testing main f5ef499 · clean · 0 behind origin/main` and `18 steps · 18 ok · 0 failed`.
- I started `python .claude/dev-server.py`, whose configured target is port 8753.
- I had **no usable browser surface**. The prescribed in-app browser process failed twice before page creation with a Windows sandbox ACL startup error. I therefore used the allowed fallback: the production `normalizeInput` path in `js/lab-intake.js` and `analyzeDocument` in `js/lab-analyzer.js`, importing `data/le-canon-index.json` under Node ESM.
- Consequence: this report judges engine output, not what a visitor literally sees. Display defects could be hidden. I did not hard-refresh, because no page ever opened.
- Analyzer reported version `2.6.11`, schema `le-lab.analysis/2.6`.

## Findings

### 1. Correct divorce statistic is labeled `Contradicts`

Severity: **BLOCKS-TRUST**

Input, verbatim:

> Women wanted about 69% of ended marriages, but only around 56% of cohabiting breakups and 53% of breakups among couples who never lived together.

Expected: top match `Women want most divorces — but not most breakups`; High confidence is reasonable; direction should be `Supports` (or, conservatively, `Resembles`).

Observed: the expected top match, score **0.781**, confidence **High**, direction **`Contradicts`**. The reason said, “The source asserts a reading that the canon entry explicitly limits or rejects.” Its displayed assertion scope was only `women wanted about 69% of ended marriages`, which is the canon's own affirmative statistic.

Reader risk: the best-looking row — right concept, High confidence, exact figures — reverses the meaning.

One-line repro: paste the input as plain text, analyze, and inspect the first match's direction and reason.

### 2. Correct orgasm-by-context statistic is labeled `Contradicts`

Severity: **BLOCKS-TRUST**

Input, verbatim:

> Women orgasm in about 11% of first-time hookups and 67% of sex in committed relationships.

Expected: top match `Women's odds of orgasm: casual vs. committed`; direction `Supports`.

Observed: expected top match, score **0.786**, confidence **High**, direction **`Contradicts`**, with the same claim that the source states a rejected reading. The canon synopsis and boundary text carry the same 11% / 67% comparison.

Reader risk: a direct numeric restatement is presented as opposition to the page it restates.

One-line repro: paste the input, analyze, and inspect the High-confidence top row.

### 3. A correct limitation of hypergamy is turned into an AWALT contradiction

Severity: **BLOCKS-TRUST**

Input, verbatim:

> In dating, hypergamy describes a status tilt, not an exceptionless rule that every woman must obey.

Expected: top match `Hypergamy`; direction `Supports`, because the sentence explicitly rejects the iron-law reading.

Observed: top match `AWALT (All Women Are Like That)`, score **0.790**, confidence **High**, direction **`Contradicts`**. The rationale says the source states the blanket overreach directly, even though the source negates it.

Reader risk: both the concept and direction are wrong, with High confidence. The negated phrase appears to dominate the assertion.

One-line repro: paste the input, analyze, and compare the top row with the sentence's `not` clause.

### 4. Ordinary boyfriend/girlfriend discourse can be discarded as off-domain

Severity: **BLOCKS-TRUST**

Input A, verbatim:

> My girlfriend and I turn small disagreements into long text-message fights, and neither of us feels heard by the end. How can we stop repeating that pattern?

Expected: retain as relationship-domain discourse. It may be unmapped, but it should not disappear into the ignored bucket.

Observed: both sentences were ignored with reason `no-human-relational-frame`; zero analyzed passages, zero claim-like passages, and no research item.

Input B, verbatim:

> I care about my boyfriend, but after three years he still avoids talking about a shared future, and I cannot tell whether to wait or leave.

Expected: retain as relationship-domain discourse; unmapped would be honest.

Observed: ignored with `no-human-relational-frame`; zero analyzed and zero claim-like passages.

Reader risk: the Lab silently sets aside exactly the plain, jargon-free advice-forum language the mission says it should triage honestly.

One-line repro: analyze either input and open the ignored/off-domain result.

### 5. A named canon claim can be ignored until a gate word is added

Severity: **BLOCKS-TRUST**

Input, verbatim:

> Female hypergamy is an exceptionless law: every woman will abandon her current man as soon as a richer and higher-status option appears.

Expected: retain and map to `Hypergamy`, with `Contradicts` because this is the canon's rejected iron-law version.

Observed: ignored with `no-human-relational-frame`; zero analyzed passages and no research item.

Confirmation: adding the prefix `In dating,` made the gate retain the otherwise equivalent claim. It then mapped primarily to `AWALT`, not `Hypergamy`.

Reader risk: a claim can contain the exact canon name and still vanish because retrieval never gets a chance to run.

One-line repro: analyze the input once as written, then once prefixed by `In dating,` and compare triage.

### 6. Direct relationship statistics can be dropped by natural phrasing

Severity: **BLOCKS-TRUST**

Input A, verbatim:

> In about 87% of heterosexual couples the man is taller, slightly above the 90% rate expected from random pairing.

Expected: retain as a claim about heterosexual couples and map to the height-preference statistic; the bad numbers/arithmetic should not make it off-domain.

Observed: ignored with `no-human-relational-frame`; zero analyzed passages.

Input B, verbatim:

> In 2024 the median American woman first married at 31.0, while the median man first married at 29.0.

Expected: retain and map to `Median age at first marriage, U.S.`, then oppose the incorrect sex/value pairing.

Observed: ignored with `no-human-relational-frame`; zero analyzed passages.

Reader risk: explicit `heterosexual couples`, `woman`, `man`, and `married` are not sufficient to establish domain relevance in these constructions.

One-line repro: paste either one-sentence statistic and inspect ignored passages.

### 7. Subtly reversed height statistics are labeled `Supports`

Severity: **BLOCKS-TRUST**

Input, verbatim:

> Among heterosexual marriages the husband is taller in about 89% of couples, slightly below the 90% expected from random pairing.

Expected: top match `Women want taller men more than men want shorter women`; direction `Contradicts`, because the canon says about 92% and a few points **above** the roughly 90% random-pairing baseline.

Observed: expected top concept, score **0.472**, confidence **Low**, direction **`Supports`**. The reason said the source presents the concept affirmatively and includes support/evidence language. A low-confidence warning was present, but no numerical-disagreement warning was.

Control: replacing `89% ... below` with `92% ... above` also produced `Supports` (score 0.594, Medium). The engine did not distinguish the reversed statistic from the correct one.

Reader risk: the direction label can validate a numerically opposite claim merely because it has the right surrounding nouns.

One-line repro: analyze the input and inspect direction; then swap `89/below` to `92/above` and compare.

### 8. Correct provider-norm numbers select the wrong concept and direction

Severity: **BLOCKS-TRUST**

Input, verbatim:

> In opposite-sex marriages husbands still out-earn wives about 55% of the time, while equal-earning and wife-higher marriages together make up roughly 45%.

Expected: top match `The provider norm is halving`; direction `Supports`.

Observed: top match `Equal earnings still do not buy equal time`, score **0.613**, confidence **Medium**, direction **`Contradicts`**. The expected provider-norm row did not win. A close-match warning reported a 0.04 gap.

Reader risk: the phrase `equal-earning` pulls the claim to a household-labor statistic, and the resulting direction implies the correct earnings distribution is rejected.

One-line repro: paste the input and inspect the first match rather than the warning alone.

### 9. A confident body-count mechanism is softened to `Resembles`

Severity: **MISLEADS**

Input, verbatim:

> Each prior sexual partner permanently damages a woman ability to pair-bond, so her divorce risk rises one step at a time with every new partner.

Expected: top match `Body Count & Pair-Bonding`; direction `Contradicts`, because the canon rejects progressive biological damage and a monotonic dose story.

Observed: expected top concept, score **0.492**, confidence **Low**, direction **`Resembles`**. The row said the engine could not infer full agreement. A 0.01 ambiguity warning was present.

Reader risk: the cautious label avoids a false `Supports`, but it does not tell a trusting reader that this is the specifically rejected version of the claim.

One-line repro: paste the input and inspect the top direction next to the ambiguity warning.

### 10. The Wall claim is displaced by AWALT

Severity: **MISLEADS**

Input, verbatim:

> Every woman hits the same dating cliff on her thirtieth birthday: fertility, desirability, and marriage prospects all collapse together.

Expected: top match `The Wall`; direction `Contradicts`.

Observed: top match `AWALT (All Women Are Like That)`, score **0.790**, confidence **High**, direction `Contradicts`. `The Wall` was only a weak match at 0.395.

Reader risk: the direction is useful, but the nearest doctrine is not. The generic all-women signature overwhelms the much more specific wall vocabulary.

One-line repro: paste the input and compare the top concept with the weak-match list.

### 11. Technical cloud prose is retained and given relationship research leads

Severity: **MISLEADS**

Input, verbatim:

> The Kubernetes provider rotates access tokens every hour and sends failed containers to a separate recovery queue.

Expected: set aside as clearly off-domain.

Observed: retained as `uncertain` with reason `plausible-human-relational-frame`; treated as claim-like and unmapped. The Research Queue said a nearby concept exists. Its nearest concepts began with `The Charm Ceiling`, `Is the early-dating workload as one-sided as men feel it is?`, and `The provider norm is halving`.

Reader risk: both the triage and nearest-concept reason line imply relationship relevance where none exists.

One-line repro: paste the input and inspect the uncertain passage and Research Queue.

### 12. A plain relationship conflict gets an unrelated nearest-concept line

Severity: **MISLEADS**

Input, verbatim:

> The woman I am dating and I turn small disagreements into long text-message fights, and neither of us feels heard by the end.

Expected: retaining and leaving unmapped is reasonable; the nearest-concept line should either identify a genuine communication/conflict concept or state that no useful neighbor exists.

Observed: retained and unmapped, but the Research Queue said a nearby concept exists. The first three neighbors were `Ended`, `Did dating apps lock the bottom two-thirds of men out of the market?`, and `Does dating for potential pay off?`

Reader risk: a user asking about recurring conflict is pointed toward ending-state and dating-market material, which looks like semantic guidance rather than lexical accident.

One-line repro: paste the input, analyze, and read the three nearest concepts in order.

### 13. Incidental partner/housing language produces a spurious research neighbor

Severity: **MISLEADS**

Input, verbatim:

> My partner and I are searching for an apartment, but the housing market is brutal and rent keeps rising.

Expected: set aside as a housing-cost claim, or retain only with an explicit note that the relationship reference is incidental and no canon neighbor is meaningful.

Observed: retained as `uncertain`, claim-like, and unmapped. The first Research Queue neighbor was `The 2020s: The Ledger`, a single-parenthood concept, followed by `The Market` and `Search cost`.

Reader risk: an off-topic economic complaint is converted into a relationship research lead, with the first neighbor especially misleading.

One-line repro: paste the input and inspect the Research Queue ordering.

### 14. Wrong marriage-age values can redirect to an age-band essay

Severity: **MISLEADS**

Input, verbatim:

> Americans now enter first marriage at a median age of 31.0 for women and 29.0 for men.

Expected: top match `Median age at first marriage, U.S.`; direction `Contradicts` because the canon values are 28.6 for women and 30.2 for men.

Observed: top match `26 to 31`, score **0.628**, confidence **Medium**, direction `Resembles`. The analyzer warned that two entries were separated by 0 confidence points.

Control: the correct values (`28.6` women, `30.2` men) selected `Median age at first marriage, U.S.` at 0.793 / High, but only `Resembles`.

Reader risk: wrong values steer the result away from the exact statistical concept that could expose them.

One-line repro: paste the wrong-value input and compare its top row with the same sentence using 28.6 / 30.2.

## Probes that held up or failed safely

These controls matter because the engine is not uniformly noisy.

- **Red/Black Pill fatalism:** `If a man is below six feet, dating is essentially over for him because every additional inch buys proportionally more romantic success.` → `The Height Pill`, 0.600 / Medium, `Contradicts`. Reasonable.
- **Height symmetry:** `Men seek shorter women just as strongly as women seek taller men, so height preferences are perfectly symmetric.` → the intended height-preference statistic, 0.684 / Medium, `Contradicts`. Reasonable.
- **Negation:** `Women do not end most nonmarital relationships, even though they want a clear majority of divorces.` → intended divorce statistic, 0.582 / Medium, `Supports`. Reasonable.
- **Wrong divorce numbers:** `Women wanted 74% of the marriages that ended, based on a panel containing about 1,200 marital breakups.` → intended divorce statistic, 0.582 / Medium, `Contradicts`. The direction is reasonable, although finding 1 shows the same label is also applied to correct figures.
- **Wrong provider conclusion:** `In opposite-sex marriages wives now out-earn husbands 55% of the time, so the husband-provider arrangement is already a minority.` → intended provider-norm statistic, 0.619 / Medium, `Contradicts`. Reasonable in isolation.
- **Correct Wall limitation:** `There is no universal dating cliff at thirty; fertility, desirability, and marriage prospects change on separate schedules.` → `The Wall`, 0.455 / Low, `Resembles`, with a close-match warning. Cautious and directionally acceptable.
- **Plain chores claim:** `My husband and I earn about the same, but I handle most of the cooking, cleaning, and child care while he gets more free time.` → retained and unmapped; nearest concept `Equal earnings still do not buy equal time` at 0.389 / Low. Honest and useful.
- **Off-domain controls:** the tomato/frost, database foreign-key, hardware connector, and city-council/bus-lane probes were all set aside. The database probe had affirmative non-domain evidence; the others used `no-human-relational-frame`.
- **Short fragments:** `Still waiting.` was set aside; `Height pill.` was retained as uncertain, non-claim context and mapped to the term; `She ghosted me.` was retained as uncertain but not promoted to a claim. These were appropriately cautious.
- **Unmapped app-choice claim:** `When dating apps make thousands of profiles feel immediately available, people become slower to commit because they keep wondering whether someone better is one swipe away.` stayed unmapped, with a plausibly related commitment concept as the first weak/nearest result. This was conservative rather than misleading.

## Latency and UI

Engine latency under Node was acceptable for the tested scale:

- Individual one- or two-sentence probes: roughly **132–248 ms** per `analyzeDocument` call after modules and the canon index were loaded.
- Generated mixed document: **1,900 words**, **11,150 characters**, **100 source segments**; 75 analyzed and 25 ignored; analyzer time **1,811.6 ms**.

This is analyzer-only timing. I could not judge perceived browser latency, worker startup, progress updates, repaint, control responsiveness, layout, overflow, clipping, focus, or whether reason lines render in the same prominence implied by the JSON contract.

No UI breakage is reported because the UI was not observable, not because it was verified clean.

## What I did not test

- Any on-screen layout or interaction, including the required hard refresh, because the browser process was unavailable.
- File upload, SRT/VTT/CSV/JSON/HTML/RTF intake, URL extraction, media paths, exports, ledger, feedback, domain overrides, cancellation, worker fallback, or diagnostics display.
- Mobile/responsive behavior, accessibility, keyboard navigation, or cross-browser behavior.
- Very large documents beyond the 1,900-word / 100-segment latency sample, the 500,000-character boundary, or the 2,500-unit cap.
- Long discourse requiring cross-paragraph context, anaphora, speaker attribution, quotation, irony, or bounded-context carryover.
- Factual verification of the site's source citations. I judged mappings against the shipped canon index, not the external literature.
- Any contents of `lab-corpus/`; it remained unread and untouched.
- `tools/lab-threshold-sweep.mjs`; it was not run in any mode.

## Bottom line

The Lab has useful retrieval and several good guardrails, but its live contract is not presently safe to read as semantic adjudication. The exact-canon controls show that `High` confidence plus the right title does not make `Supports` / `Contradicts` reliable. The relevance gate and nearest-concept line also fail in both directions: real relationship prose can vanish, and technical or incidental prose can acquire confident-looking relationship neighbors.

The shortest honest product description from this cold run would be: **a lexical discovery aid whose triage and stance labels require manual verification, not a claim-direction engine a reader should trust on sight.**

## Postscript after reading md/INDEX.md

The record shelf shows that the project already knew the **classes** of several risks: gate recall/precision and participant vocabulary were an active line of work; polarity failures drove the v2.4 release; clause-scoped stance drove v2.5; weak-neighbor counts and research-card denominators were corrected in v2.6.9-2.6.10; numeral coincidence, generic aliases, and topic magnets were explicitly measured.

What this cold pass adds, based on the index descriptions alone, is current v2.6.11 evidence that those classes still produce reader-visible failures in new forms: exact correct canon statistics labeled `Contradicts`; a negated hypergamy limitation classified as High-confidence AWALT opposition; ordinary boyfriend/girlfriend prose fully ignored; named hypergamy ignored without an extra gate word; reversed percentages labeled `Supports`; and off-domain cloud/housing text receiving semantically misleading research neighbors. None of those exact current-build cases is named in md/INDEX.md.

I did not revise the pre-reading body after consulting the index.
