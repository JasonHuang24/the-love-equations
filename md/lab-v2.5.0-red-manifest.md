# LE Lab v2.5.0 — RED manifest (commit 1 of 5)

The frozen state of `tests/fixtures/match-behavior-benchmark.json` **before** any production code
changed. Every row below is what the shipped analyzer actually did, measured on this machine at this
commit, not predicted from the review.

```
analyzer ............ 2.4.0
analysis schema ..... le-lab.analysis/2.4
scoringConfigHash ... 1ntbwch
canon index ......... 1.0.0+949aef381d5f  (le-canon-index/1.1, 450 concepts, 19 sources)
```

## Provenance

This pass answers the two **CONTEST** findings from Sol's verification review of v2.4.0 + v2.4.1 that
were still open after v2.4.2:

- **§1 CONTEST** — passage-wide co-fire plus a literal `notAfter` substring is not a safe contextual
  discriminator.
- **§2 CONTEST** — `stanceFor` gets scope, quotation, and mixed-stance cases wrong.

The review's §3 REWORD (trace size) and its §4/§5 findings were addressed and shipped in v2.4.2 and
are not revisited here. Sol's repro passages are reproduced **verbatim**; the extension cases are
written for this pass and labelled as such in the fixture.

**Every number Sol reported reproduces to the decimal.** Seven stance scores (0.739 / 0.681 / 0.602 /
0.786 / 0.629 / 0.673 / 0.676) and both co-fire scores (0.540 / 0.540) were confirmed independently
before any fixture was written. The review is accurate.

`npm run test:lab` **FAILS at this commit**, by design:

```
tests/lab-intake.test.mjs ............ 28 pass / 0 fail
tests/lab-analyzer.test.mjs .......... 41 pass / 0 fail
tests/lab-domain-benchmark.test.mjs ... 3 pass / 0 fail   (152 cases, 1.000 / 1.000 / 0.821)
tests/lab-match-behavior.test.mjs ..... 7 pass / 2 fail
  structural soundness ............................. PASS
  misreading polarity (10 v2.4.0 cases) ............ PASS  ← floor, must stay green
  boundary-only overlap ............................ PASS
  candidate retention .............................. PASS
  working-set widening ............................. PASS
  typed alias (13 v2.4.0 cases) .................... PASS  ← floor, must stay green
  contextual co-fire ............................... FAIL  (5 of 6 cases + occurrence accounting)
  stance composition ............................... FAIL  (8 of 12 cases)
  irony limit is stated as a limit ................. PASS
```

The suite short-circuits at `lab-match-behavior`, so the eight files after it are unrun rather than
failing. They were green at `2e28fc2` and no production code has moved.

---

## Block D — contextual co-fire (5 of 6 RED)

The rule as shipped: a contextual alias is promoted when the passage contains a disqualifying
modifier immediately before it (literal substring) **and** independent relational evidence *somewhere
in the passage*. Both halves are too loose, in opposite directions.

| Case | Expected | **Observed at freeze** | Score |
|---|---|---|---|
| cf-01 | no match | **credible match** | 0.540 |
| cf-02 | no match | **credible match** | 0.540 |
| cf-03 | credible match, 2 occurrences (1 promoted, 1 disqualified) | **no match at all**, no occurrence accounting | — |
| cf-04 | no match | **credible match** | 0.540 |
| cf-05 | no match | **credible match** | 0.540 |
| cf-06 | credible match | credible match | 0.540 (GREEN — guard) |

**cf-01 / cf-02 are Sol's repro table.** `AWS` is not on the denylist and never should be — a rule
that works by enumerating vendors is not a rule. `cloud` *is* on the denylist, and `cloud-based`
defeats it because the check is `normalized.includes("cloud provider")`, a substring test that a
hyphen breaks. In both sentences the promotion is carried by the relationship-outcome frame firing on
`arguing`, which belongs to a different clause than the alias.

**cf-04** strips cf-01's `girlfriend` entirely. The passage now contains no relational vocabulary
whatsoever and still promotes, which locates the defect in the passage-global frame test rather than
in any particular noun.

**cf-05** is the cleanest statement of the window rule. `Marriage` is a decisive relational outcome,
so the passage is *correctly* gated relevant — but it sits in the first clause and the alias sits in
the second, and `billing` is not on the denylist. Passage-global co-fire cannot tell this from a real
provisioning claim.

**cf-06** is GREEN at freeze and is in the block as a guard, not a repro. It carries the same word as
cf-05 (`marriage`) in the same sentence, four tokens from the alias in the same clause. The pair
differs only in *where the evidence sits*, which is precisely the discrimination this block exists to
force.

**cf-03 is the occurrence-independence case, and it fails twice.** The passage clears the domain gate
(`explicit-relational-outcome`) and its second `provider` is as relational as ta-03's, yet
`smv:money:provisioning-signal` does not appear even as a weak match: `promotedAliases` finds the
literal string `cloud provider` anywhere in the passage and `continue`s past the alias entirely, so
one disqualified occurrence suppresses every occurrence. It also asserts per-occurrence accounting
(`{total: 2, promoted: 1, disqualified: 1}`) that the score object does not publish at all.

> **Note on cf-03's wording.** The first draft of this case ended `…for his wife and their two
> children.` and was **gated out** by the domain gate as `no-human-relational-frame` before retrieval
> ran — participant frame detected, outcome frame absent. It never reached the matcher, so it could
> not have tested the matcher. `throughout their marriage` was added to give it a decisive outcome
> frame. This is the v2.4.1 finding again from a different angle: the domain gate, not the retrieval
> layer, is what most often decides whether a compact canon claim is ever seen.

### The 13 typed-alias cases are a floor

ta-01…ta-13 stay green at every commit in this pass. ta-03, ta-04, ta-05 (the provider/breadwinner
positives) and ta-01, ta-02 (the `hypergamy` standalone positives) are the ones the tightening could
plausibly break; ta-06…ta-09 are the negatives it must keep catching. `ta-09` is cf-02's sentence
with a literal space instead of a hyphen, and passes today only for that reason.

---

## Block E — stance composition (8 of 12 RED)

Every case in this block carries the **same** indexed misreading —
`a large inbox is a large pool of relationship candidates`, from `frameworks:option-pool` — so the
wrapper is the only variable. A structural test enforces that, punctuation-insensitively.

| Case | Wrapper | Expected | **Observed at freeze** | Score |
|---|---|---|---|---|
| sc-01 | negation parity | Contradicts | **Supports** | 0.739 |
| sc-02 | quoted assertion | Context only | **Contradicts** | 0.681 |
| sc-03 | partial | Challenges | **Contradicts** | 0.786 |
| sc-04 | attribution + endorsed | Contradicts | **Context only** | 0.629 |
| sc-05 | attribution + rejected | Supports | **Context only** | 0.673 |
| sc-06 | negation scope | Contradicts | **Supports** | 0.676 |
| sc-07 | irony | Contradicts | Contradicts | 0.602 (GREEN — **stated limit**) |
| sc-08 | negation + attribution | Context only | Context only | 0.684 (GREEN — guard) |
| sc-09 | attribution + partial | Challenges | **Context only** | 0.639 |
| sc-10 | nested quotes | Context only | Context only | 0.582 (GREEN — guard) |
| sc-11 | attribution + rejection | Supports | **Context only** | 0.676 |
| sc-12 | bare rejection | Supports | Supports | 0.739 (GREEN — **right for the wrong reason**) |

sc-01 through sc-07 are Sol's table verbatim. sc-08 through sc-12 are the composition variants.

**The shape of the defect.** `MISREADING_DENIAL_CUES` and `REPORTED_SPEECH_CUES` are sentence-wide
booleans. They answer "does a negator appear anywhere" and "does an attribution verb appear
anywhere", and the misreading branch then reads those two bits and stops. That model has no notion of
how many negators there are (sc-01), which clause a negator belongs to (sc-06), whether the
proposition is inside quotation marks at all (sc-02 — the v2.4.0 ruling says "quotation or
attribution" but quotation is never actually detected), or what happens *after* an attribution
(sc-04, sc-05, sc-09, sc-11). It also has no third option between asserted and denied, so a claim
that is explicitly half-withdrawn has to come out as a whole one (sc-03).

**Note the `denial: true` at freeze on sc-05, sc-08, sc-11 and sc-12.** The sentence-global cue *did*
fire on `wrong` / `not` / `false` in all four. In sc-05 and sc-11 it was outranked by the
reported-speech branch and the right answer was lost; in sc-12 it happened to land on the right label
by accident. Four sentences, one cue, three different reasons — which is why the cue is being
replaced rather than reordered.

### sc-07 is a limit, not a defect

The speaker in sc-07 is sarcastically rejecting the misreading, so the humanly correct label is
*Supports*. The analyzer says *Contradicts* and, after this pass, will continue to. Detecting irony
requires world knowledge that a local deterministic stack does not have and should not pretend to
have. The case is frozen **asserting current behavior** with `limitDocumented: true`, and a dedicated
test enforces that a documented limit's `expected` and `observedAtFreeze` agree — so if a later pass
makes them disagree, the case has stopped being a limit and must be re-adjudicated rather than left
in the block asserting something nobody decided.

sc-07 also does real work as a guard. Its quoted span covers a bare noun phrase
(`'large pool of relationship candidates'`) inside the speaker's own sentence, whereas sc-02's quoted
span covers the whole assertion including its copula. The new quoted-span rule has to separate those
two, or fixing sc-02 silently changes sc-07 — and the limit would be being *moved* rather than
*documented*. Irony non-detection is published in the `lab.html` instrument-limits section in commit 5.

### Composition adjudication

The brief permits flagging genuinely undecidable compositions **AMBIGUOUS** rather than forcing a
label, and treats more than three as a signal that the stance model is underpowered.

**Zero cases were flagged AMBIGUOUS.** All five composition variants resolved under a single
consistent reading:

- **sc-08** (`He says it is not true that [M].`) — Context only. The speaker reports someone else
  denying the misreading and takes no position. The standing doctrine already covers this: a reported
  claim carries no stance to record, *whichever way the reported claim points*. Unchanged from freeze.
- **sc-09** (`The podcast says [M], though that equivalence is overstated.`) — Challenges. The
  qualification is the speaker's own, so attribution does not get to end the analysis.
- **sc-10** (nested quotes) — Context only. Two levels of reporting, no endorsement or rejection at
  either level. Unchanged from freeze.
- **sc-11** (`He says [M], but that is false.`) — Supports. sc-05 with the rejection worded
  impersonally, so the fix cannot be a special case for one phrasing.
- **sc-12** (`[M], but that is false.`) — Supports. Currently right by accident; must be reached
  deliberately after the rewrite.

---

## What must not move

- The **10 misreading-polarity cases** (mp-01…mp-10) and the **13 typed-alias cases** (ta-01…ta-13),
  both green at this commit.
- The **domain benchmark**: 152 cases at 1.000 precision / 1.000 recall. The third metric may move up
  only.
- **No existing `SCORING_CONFIG` value changes.** Commits 2 and 3 add keys; they retune nothing.
- The **normalized-source and privacy contracts**, and worker/fallback parity.

## Commits after this one

2. Occurrence-local contextual co-fire — closes Block D.
3. Clause-scoped stance — closes Block E except sc-07, which is a documented limit.
4. Ignored-passage field publication — Sol §4, the last open ACCEPT-adapter/CONTEST-completeness item.
5. v2.5.0 release: schema `le-lab.analysis/2.5`, cache-busters, index regen, corpus re-run, SHA-256
   manifest, plus the two v2.4.2 §7 deferrals (provenance fields, allowlist at every export depth).
