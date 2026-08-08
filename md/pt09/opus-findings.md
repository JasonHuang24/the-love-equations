# PT09 — adversarial & engine lane findings (Claude Opus 5, reasoning high)

Run opened 2026-08-07 15:42 MDT from `main` @ 77c340b. Work happens in a local
clone under the session scratchpad; nothing here is committed to the real tree
except this file, `opus-proposals.md`, `opus-patches/`, and CLAIMS.md appends.
Version numbers in clone commits are `v2.6.x-opus-pt09` placeholders.

**This file is written progressively during the run, not only at close.**

## Instrument facts established up front

- Clone baseline: `npm run test:lab` 18/18 green (after the environment
  finding below), banner naming the clone's HEAD.
- Frozen gate benchmark at baseline: 191 cases, domainRecall 1.0000,
  ignorePrecision 1.0000, junkRecall 0.8529.
- Corpus stance census (all 42 archived sources, every displayed match):
  1,298 rows at 77c340b, 1,300 after Codex's Care Role Split entry.
  Distribution: 914 Resembles · 241 Supports · 86 Context only · 37
  Contradicts · 16 Challenges · 4 Extends.
- Every finding below was measured against BOTH instruments. **Every SHIPPED
  fix moved zero rows in both.** The one finding that does move them (10) is
  the one that did not ship, and for that reason. See "What the instruments
  could not see" below.

## Findings

| # | Surface | Repro | RED test | Fix | Floor impact | Rulings |
|---|---|---|---|---|---|---|
| 1 | env / canon index | fresh `git clone` of `main` + `npm run test:lab` is 17/18 | — (env, not shipped code) | NOT FIXED — out of lane | none | none |
| 2 | misreading firing contract | "The Conversion Ladder separates exposure, attention, attraction, and selection." reads `lexicon:term-conversion-ladder` **Contradicts** 0.881 | `tests/lab-analyzer.test.mjs` — "a token the entry uses only in its own pressure test…" | `js/lab-analyzer.js` — `pressureTests` joins the affirmative surface set | none (label-only; nothing here reaches a score) | none |
| 3 | intake normalization × gate morphology | one U+00A0 between "a" and "provider" bins the passage `no-human-relational-frame` | "the relevance gate reads the same normalized text every other stage reads" | `localDomainRelevance` reads `normalizeText(unit.text)` | 191/1.0000/1.0000/0.8529 unchanged, every verdict byte-identical | none |
| 4 | HTML entity decoding | 89 named entities survive extraction in the Node path, 0 in the browser | "the no-DOM HTML fallback decodes the same typographic entities the corpus extractor does" | `HTML_NAMED_ENTITIES` table + exact-case lookup | unchanged | none |
| 5 | zero-width / format characters | ZWSP inside "hypergamy" drops the match 0.747 → 0.562, silently | "format characters that carry no text are removed at intake" | `FORMAT_CHARACTERS` strip in `cleanControlCharacters` | unchanged | none |
| 6 | generic stance ladder polarity | "It is not true that <claim>" reads **Supports** 0.760; three more inversions | "a generic cue the passage has just denied does not decide the stance" | `cueFires` + `CUE_DEFEATER_BEFORE` | unchanged | none |
| 7 | gate morphology inflections | "He married up last year." bins; "He is marrying up." retains | "the mate-value-mismatch idiom conjugates date and marry…" | `dat(?:e\|es\|ed\|ing)` and `marr(?:y\|ies\|ied\|ying)` | 191/1.0000/1.0000/0.8529 unchanged | none |
| 8 | intake format edges (RTF) | a Word 2019 preamble extracts as "Calibri;Symbol;;;\\*Riched20 10.0.19041;She wanted…" | "an RTF header table is not transcript text" | `stripRtfDestinations` + one-pass brace handling | unchanged | none |
| 9 | stance ladder, hypothetical half | "Is it true that <claim>?" and "It is true that <claim>." both read Supports 0.714 | "a supposed cue and a questioned cue are not asserted cues" | defeater set gains hypothetical subordinators; questions withhold claim-directed cues | unchanged | none |
| 10 | tokenizer possessives | `women's` enters the index as `women'`, unifiable with nothing | built, then reverted | **NOT SHIPPED** — 2,494 crossings need an adjudication window | none moved | none |
| 11 | clause splitting | "…in the U.S. market; that model is wrong." reads Resembles 0.697 where "…in most markets; …" reads Challenges 0.697 | "a decimal point and an abbreviation period do not end a clause" | period joining word chars, comma between digits, and the sentence merger's own abbreviation set | 191/1.0000/1.0000/0.8529 unchanged | none |
| 12 | risk-flag detectors | "80 per cent of …" raises no `unsupported statistic` flag; "80% of …" does | "an unsupported statistic is flagged however the number is spelled" | `STATISTIC_SHAPES` + a lastIndex-safe accessor | unchanged; 6 research items gain the flag | none |
| 13 | claim detection cues | "Women date up in status." scores 0.16 and is NOT a claim; "Women marry up in status." scores 0.30 and is | "claim detection knows the verb this site is about" | `date` added to CLAIM_CUES | unchanged; 1 corpus unit flips (a citation header the gate then bins) | none |
| 13b | same line, `marry` + `\w*` | "Women married up in status." is still NOT claim-like | — | **NOT SHIPPED** — collides with the pt-03 include-override trap | none | none |
| 14 | ordered-list segmentation | a three-item numbered list produces six units, three of them "1." "2." "3." | built, then reverted | **NOT SHIPPED** — renumbers 3,363 frozen band pairs | none moved | none |
| 15 | cue morphology × apostrophe form | "Hypergamy means women can't be satisfied with a lower-status partner." reads **Likely source overreach**; the same sentence with U+2019 reads **Possible LE limitation** | "a typographic apostrophe is the same word to every cue that reads it" | `['\|U+2019]` in all seven contraction-bearing cue regexes | unchanged; 0 of 1,039 corpus segments move | none |

## Finding 1 in full — a fresh clone of `main` fails the suite

`scripts/build-canon-index.mjs` hashes the **working-tree bytes** of each
source page into `sourcePages[].sha256` and into `indexVersion`. Five pages in
the real checkout carried one stray CR each — `statistics.html`,
`lexicon.html`, `deep-dive.html`, `dd-relationships-throughout-history.html`,
`dd-competition-anxiety.html` — residue from an editing tool, invisible to git
because `.gitattributes` says `* text=auto eol=lf` and normalizes them away in
the blob.

So the committed index encoded bytes that exist only in one working tree. A
fresh clone checks out the `.gitattributes`-guaranteed LF form, rebuilds a
different hash, and `scripts/validate-canon-index.mjs` throws
"Generated index is stale" — 17/18, on an unmodified checkout of green `main`.

- **Reproduce:** `git clone <repo> x && cd x && npm run test:lab`.
- **Why not fixed here:** the fix is a `\r\n` → `\n` fold before hashing in
  `scripts/build-canon-index.mjs`, and it necessarily rewrites
  `data/le-canon-index.json` — both Codex's lane for this run.
- **Workaround used:** the five files were copied byte-for-byte from the real
  tree into the clone so the baseline was a true 18/18. Codex's later canon
  commits re-stamped the index and the clone went clean on its own at the first
  rebase; the underlying fragility is unchanged.
- **Filed as a proposal** in `md/pt09/opus-proposals.md`.

## What the instruments could not see

Twelve findings, nine of them shipped fixes, and the frozen gate benchmark and
the 42-source corpus moved **zero rows for all but one of them**. Each zero is
attributed rather than assumed:

- No case in the 191-case gate benchmark and no passage in the corpus contains
  a non-ASCII space, a zero-width character, or an undecoded entity.
- `dated up`, `married up` and `marries up` occur zero times across all 42
  sources — which is why two previous rounds of fixing that exact defect shape
  (v2.6.14, 959d32c) left a third copy of it standing.
- The corpus holds no RTF at all.
- For the stance guards the zero is the interesting one: the corpus DOES hold
  47 question-form claim units (11 carrying matches) and 83 matched units
  containing a hypothetical subordinator. The guards are reachable there and
  change nothing, because in every case the cue already sat outside the
  clause-scoped ground or the label was already decided by the misreading
  branch.
- Of the corpus's 782 matched claim units, 66 contain a decimal, 5 a
  thousands comma and 23 an abbreviation period. The clause splitter reaches
  all 94 and changes none of their outcomes.
- The one exception is finding 12: 6 research-queue items across 2 sources gain
  an `unsupported statistic` flag they should always have had. Even there,
  nothing that scores moved.
- Every negation composition in the frozen match-behavior benchmark carries an
  asserted misreading, so all of them route through the parity branch and none
  of them reaches the generic ladder — which is how a whole ladder shipped with
  no polarity at all.

The pt08 lesson generalizes: **this engine's defects live where its corpus
does not.** A corpus of clean, ASCII, declarative, third-person journalism
cannot see Unicode, formats, speech acts, or verb inflections that journalism
does not use.

## Finding 10 — the possessive of every noun is its own token (FOUND, MEASURED, NOT SHIPPED)

The largest finding of the run, and the only one the archived corpus can see.

`tokenize` keeps `women's` whole, then `stemToken` strips the trailing `s` and
leaves the apostrophe. The token that enters the index is `women'` — a string
that can never unify with `women`. The same holds for every possessive:
`men's` → `men'`, `partner's` → `partner'`, `person's` → `person'`,
`wife's` → `wife'`, `mate's` → `mate'`.

Those are canon vocabulary. `partner` is in `RELATIONAL_ROLE_TERMS` and in
canon aliases; `men` and `women` are in half the gate's frame patterns. A
passage that writes "a partner's income" contributes no `partner` token at all.

**Census:** 239 possessives across the 42 archived sources — `one's` x73,
`women's` x17, `partner's` x14, `participant's` x14, `men's` x14,
`person's` x13, `other's` x11, `mate's` x5, `wife's` x4, `people's` x4.

**Candidate fix**, built and measured in the clone, then reverted:

```js
function stripPossessive(token) {
  if (!token.endsWith("'s")) return token;
  const bare = token.slice(0, -2);
  return bare.length >= SCORING_CONFIG.minDerivedStemLength ? bare : token;
}
// in tokenize():  .map((token) => stripPossessive(token.replace(/^'|'$/g, '')))
```

The length floor is not decoration. Without it the strip re-creates exactly the
defect the v2.6.0 floor exists to prevent: `tests/lab-tokenizer.test.mjs` goes
RED with `le's -> le` and `li's -> li`, two-character fragments carrying an IDF
they have not earned. With the floor that step is green.

**Measured with the floor in place:**

| instrument | before | after |
|---|---|---|
| gate benchmark | 191 · 1.0000 · 1.0000 · 0.8529 | identical |
| `tests/lab-tokenizer.test.mjs` | ok | ok |
| corpus stance census rows | 1,300 | 1,304 |
| rows whose SCORE moves | — | 222 |
| rows whose score or label moves | — | 226 |
| threshold crossings in nobody's record | 0 | **2,494** |

**Why it did not ship.** Not a floor problem — no floor moves. An adjudication
problem. `WEAK_BACKLOG_CEILING = 0` means every one of those 2,494 crossings
blocks until ruled, and pt09's delegation is explicit that ruling is
per-crossing, having read the crossing, with `--rule` forbidden in any form.
2,494 crossings cannot be honestly read in the remaining hours of a five-hour
run, and stamping them would be the exact thing Jason declined on 2026-07-30.

**Recommendation for integration:** this is a one-function change with a clean
measurement already taken, and it wants its own session with an adjudication
window — not a corner of a pressure-test run. Everything needed to reproduce
it is in this entry.

## Finding 13 — `marry` still cannot conjugate in CLAIM_CUES (FOUND, NOT SHIPPED)

The `date` half of finding 13's line shipped (see the table). The `marry` half
did not, and the reason is worth recording precisely.

`CLAIM_CUES` carries `marry\w*`, the exact pattern v2.6.14 replaced in the
relevance gate because it cannot reach `married` or `marries` — those words do
not contain the literal stem `marry`. So:

  "Women marry up in status."     0.30  claim-like
  "Women marrying up in status."  0.30  claim-like
  "Women married up in status."   0.16  NOT claim-like
  "Women marries up in status."   0.16  NOT claim-like

Fixing it to `marr(?:y|ies|ied|ying)` is one edit and it works. It also turns
**"The merger married two incompatible corporate cultures."** claim-like — and
that sentence is frozen benchmark case pt-03 (`polysemous-trap`, expected
`ignore`) and the deliberate trap of the include-override test in
`tests/lab-analyzer.test.mjs`, which asserts `machineClaimLike === false`.

The gate still ignores pt-03 either way, so the frozen benchmark is unaffected
and its floors do not move. What breaks is one incidental assertion in a unit
test whose contract ("a passage the machine did not judge claim-like, when a
visitor force-includes it, must be honoured through every population") does not
depend on WHICH passage carries that property. Greening it means either editing
an assertion or re-choosing the scenario's input sentence.

Both are Jason's call, not a pressure-test run's, so the colliding half was
left out rather than smuggled in beside the half that does not collide.

## Finding 14 — a list marker becomes a passage of its own (FOUND, MEASURED, NOT SHIPPED)

Both sentence-split paths end a sentence at the period of "1.", and
`mergeSentenceSplitArtifacts` only folds BACKWARDS — an abbreviation absorbing
what follows it. A bare enumerator has nothing behind it to absorb into, so it
stands alone.

Repro: a three-item numbered list produces six units — `"1."`, the first item,
`"2."`, the second item, `"3."`, the third. Each marker then reaches the reader
in the set-aside ledger reported as `no-human-relational-frame`, which reads as
a substantive judgement about a list number, and `ignoredDomainSegments`
counted 4 where 1 was real.

**Candidate fix**, built and measured in the clone, then reverted: an
`ENUMERATOR_ONLY` test (`/^\(?(?:\d{1,3}|[a-z]|[ivxlcdm]{1,5})[.)]$/i`) added as
a forward fold at the head of `mergeSentenceSplitArtifacts`. It works, and it is
anchored at both ends so "3.5 per cent of women date up." stays one sentence.

**Why it did not ship:** merging two pieces into one renumbers every later
`claim-NN` in that segment, so **3,363 frozen pairs in
`tests/fixtures/threshold-neighbors.json` cease to exist by ID** and 132 corpus
rows move at score level. Absorbing that means a wholesale regeneration of the
band — which is a file the protocol assigns to the Codex lane in the real tree,
and regenerating it here would put a 3,363-pair rewrite into the opus patch
series to collide with Codex's own. That is a bad trade for a fix whose value is
tidiness in a reader-facing ledger.

**Narrower alternative for integration to weigh:** leave segmentation alone and
suppress bare enumerators at the REPORTING layer only — keep them out of
`domainRelevance.ignoredPassages` and out of `ignoredDomainSegments`. That
changes no unit ID and no score, so it costs no band regeneration. It was not
built, because choosing between the two is a design call.

**Residuals found while measuring, not chased:** `"a) X. b) Y."` is ONE unit —
the splitter never breaks at a closing parenthesis; and in `"i. X. ii. Y."` the
splitter itself attaches `"ii."` to the end of the first sentence. Both are
defeated one stage earlier than the fold, in where sentences END, which is a
much larger claim than where a marker belongs.

## Finding 15 — one apostrophe decides whether the source or the canon is at fault

The engine has two normalizers and they disagree about scope. `normalizeText`
folds the typographic apostrophe (U+2019) to ASCII, and `tokenize` folds it
too — so retrieval, scoring and the gate were never affected, and no benchmark
in the suite could see this. The **cue** layer is different: it matches its
regexes against `unit.text`, the reader's own bytes, which intake deliberately
does not rewrite (the Lab shows the reader their own text back). Seven regex
literals across `lab-analyzer.js` spell their contractions with the ASCII
apostrophe alone, so on the spelling most word processors and CMSs actually
emit, those cues simply stop firing.

**Repro**, one character apart, reader-visible in the pressure-test panel:

    "Hypergamy means women can't be satisfied with a lower-status partner."
      ASCII  -> "The source wording outruns the matched rule or its
                 uncertainty."                     (Likely source overreach)
      U+2019 -> "The source may identify a boundary or case the indexed rule
                 does not yet resolve."            (Possible LE limitation)

The `sex-binary` overreach rule requires `men|women` AND one of
`all|always|never|are wired|by nature|biologically|every|cannot|can't`. Losing
the second half moves the fault from the claim to the canon: the Lab tells the
reader either that their source overreached or that LE is incomplete, decided
by which apostrophe their word processor inserted.

**The seven**, all matched against raw `unit.text`: the modal cue set (341),
`MISREADING_DENIAL_CUES` (855), `QUOTED_ASSERTION_VERBS` (907),
`CONTRADICTION_CUES` (911), the `sex-binary` overreach rule (979), the
`consent-safety` overreach rule (1016), and the retrieval disqualifier (1106).
The consent rule is the one worth naming on its own: `doesn't need consent` did
not fire on the typographic spelling.

**Fix:** every `'` joining two letters INSIDE a regex literal becomes a
two-character class admitting the ASCII apostrophe and U+2019. The substitution
is length-neutral in the text it matches and touches no quote delimiter and no
prose, so every index-based clause slice downstream is unchanged — which is what
makes it safe to apply mechanically to all seven at once.

**Prevalence, and the zero attributed.** The archived corpus is *majority
typographic*: 490 curly against 345 straight intra-word apostrophes, and 12 of
21 files predominantly curly. It contains 17 curly negation contractions
(didn't x3, don't x4, doesn't x2, aren't x2, wasn't x2, weren't x2, hasn't,
can't — all with U+2019). And yet analysing every corpus file twice — as
published, then with U+2019 folded to ASCII — moves **0 of 1,039 segments**.
Those 17 occurrences are real but none of them sits where a cue decides a
label. The zero is a fact about what this corpus is (academic and journalistic
prose, where contractions are rare and rarely load-bearing), not evidence the
engine was right.

**The test guards the source, not the label.** A test wired to one cue can only
catch that cue. The RED test asserts the end-to-end flip AND scans
`js/lab-analyzer.js` for any regex literal containing a contraction spelled
with the ASCII apostrophe alone, so the next one written fails here rather than
in a reader's export three months later.

## Close-out and handoff for integration

**State at close.** Clone at `origin/main` + 22 commits, rebased onto
`origin/main` (Codex through `4149301`), `npm run test:lab` exit 0, banner
`testing main 3dabb01 · clean · 0 behind origin/main`, 18/18. Patch series
exported to `md/pt09/opus-patches/` as 22 files, 0001–0022 — eleven RED/fix
pairs, RED always before its fix, every commit `Co-Authored-By: Claude Opus 5`.

**What the series contains** (apply in order; each fix's parent is its own RED
commit, so the series bisects cleanly):

| Patches | Finding | Files touched |
|---|---|---|
| 0001–0002 | 2 — misreading firing contract | `js/lab-analyzer.js`, `tests/lab-analyzer.test.mjs` |
| 0003–0004 | 3 — gate reads `normalizeText` | `js/lab-analyzer.js`, `tests/lab-analyzer.test.mjs` |
| 0005–0006 | 4, 5 — entity table + format-character strip | `js/lab-intake.js`, `tests/lab-intake.test.mjs` |
| 0007–0008 | 6 — negated-cue defeater | `js/lab-analyzer.js`, `tests/lab-analyzer.test.mjs` |
| 0009–0010 | 7 — mate-value-mismatch conjugation | `js/lab-analyzer.js`, `tests/lab-analyzer.test.mjs` |
| 0011–0012 | 8 — RTF destination groups | `js/lab-intake.js`, `tests/lab-intake.test.mjs` |
| 0013–0014 | 9 — hypothetical / interrogative guard | `js/lab-analyzer.js`, `tests/lab-analyzer.test.mjs` |
| 0015–0016 | 11 — clause splitting | `js/lab-analyzer.js`, `tests/lab-analyzer.test.mjs` |
| 0017–0018 | 12 — statistic shapes | `js/lab-analyzer.js`, `tests/lab-analyzer.test.mjs` |
| 0019–0020 | 13 — `date` in CLAIM_CUES | `js/lab-analyzer.js`, `tests/lab-analyzer.test.mjs` |
| 0021–0022 | 15 — apostrophe form in cue regexes | `js/lab-analyzer.js`, `tests/lab-analyzer.test.mjs` |

No patch touches a site page, `data/canon-overlay.json`,
`data/le-canon-index.json`, a canon pin, or
`tests/fixtures/threshold-neighbors.json`. The lane held.

**Integration must do three things this run could not.**

1. **Assign real version numbers.** Every fix commit says
   `v2.6.x-opus-pt09`. Eleven fixes want numbers; whether they land as eleven
   releases or one is Codex's call, but the placeholder must not survive into
   `main`.
2. **Re-run the suite and a `--dump` baseline on the MERGED result.** Each fix
   was measured alone against the 191-case gate benchmark and the 42-source
   stance census, and each moved zero rows. Eleven zeroes measured separately
   are not a measured zero for the eleven together — nothing here assumes they
   compose, and the merged measurement has not been taken.
3. **Rule nothing yet.** Zero threshold crossings were produced, so zero
   verdicts were entered and `counts.pending` is untouched. If the merged
   measurement produces crossings, they are unruled and blocking
   (`WEAK_BACKLOG_CEILING` is 0).

**Three findings want their own sessions**, and each is blocked on a decision
rather than on work:

- **10 — tokenizer possessives.** `women's` enters the index as `women'`. Fix
  is built (`stripPossessive`, honouring `minDerivedStemLength`) and saved at
  the path recorded in that section. 239 possessives in the corpus, 222 rows
  move, **2,494 threshold crossings**. Needs a scheduled adjudication window,
  not a spare hour.
- **13b — `marry` plus a wildcard in CLAIM_CUES.** One-word fix, but it turns
  frozen benchmark case `pt-03` ("The merger married two incompatible corporate
  cultures.") claim-like, and that case is the deliberate trap of the
  include-override test. Greening it means editing a frozen assertion or
  re-choosing the scenario input — **Jason's ruling, not an agent's.**
- **14 — list-marker units.** The segmentation fix costs a 3,363-pair band
  regeneration; the reporting-layer alternative costs nothing and fixes the
  reader-visible half. A design call between two real options.

**The shape this run kept finding.** Six of the eleven shipped fixes are the
same defect: *an inflection, spelling or format list that names some forms and
misses the rest.* v2.6.14 taught one gate frame to conjugate `marry`; 959d32c
taught another to read `date`; pt09 found the same hole in the
mate-value-mismatch idiom (7), in claim detection itself (13), in the statistic
detector (12), in the HTML entity table (4), and in every contraction-bearing
cue regex (15). The lists were all written by hand from examples, and each one
stopped at the examples its author happened to think of. A list of surface
forms is a liability wherever the engine could derive the forms instead.

**Why the corpus could not have caught any of them.** Every shipped fix moved
zero corpus rows, and that is the finding, not a disappointment. This engine's
defects live where its corpus does not: a corpus of clean ASCII declarative
journalism cannot exercise Unicode spacing, format characters, RTF preambles,
word-form percentages, typographic apostrophes, questions, hypotheticals, or
verb inflections that journalism does not use. Most of the twenty-one archived
sources are academic or newsroom prose. Widening the corpus toward
reader-shaped text — forum posts, chat logs, word-processor pastes — would
change what the instrument can see more than any single fix here changes what
the engine does.
