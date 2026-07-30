# LE Lab v2.6.1 record-fidelity pass — Sol verification handover brief

**Status:** rewritten 2026-07-29 for the **fourth** pass, after three review rounds on the same two
sections. Superseded contents of the first and second versions are not preserved here; the record they
described lives in `md/lab-v2.6.1-release.md`, which carries every correction in dated blocks.
Maintainer lane throughout: **Claude Opus 5, /effort high**, single session.

**The honest framing, and the reason this is not presented as a clean pass.** Sol has now ACCEPTed the
shipped instrument three times running and CONTESTed the *record* three times running. Each round found
real defects, each round's fixes were verified, and each round then produced a new defect of the same
family. Four of the six findings across passes two and three are one error repeated: **a negative claim
about a mechanism, asserted without going to look.** The most recent instance was a paragraph declaring
a value unassertable, written nine lines below the helper that had been asserting it since v2.6.0.

So the fourth pass is not "please confirm this is clean." It is: **audit the pattern, and rule on
whether a record that needed four rounds should still be carried forward in correction blocks at all.**
That question is attack target 1, it is the maintainer's own, and it is the one worth Sol's time before
any of the narrower ones.

Companion documents: `md/lab-v2.6.1-release.md` (§2 and §3 each carry three stacked correction blocks),
`tests/fixtures/denylist-widening-census.json`, `md/limit-hit-ledger.md`, `md/FEEDBACK-PIPELINE.md` §4.

```
LE LAB v2.6.1 — RECORD-FIDELITY PASS, FOURTH VERIFICATION

You have reviewed this record three times. Each pass ACCEPTed the instrument and CONTESTed
the record; each set of fixes verified; each round then produced a fresh defect of the same
family. This pass asks you to rule on the pattern, not only on the newest commits.

Read-only, as before.

STATE
- Repo: F:\Programming\The Love Equations\The Love Equations Website, branch main.
- Maintainer lane: Claude Opus 5, /effort high.
- js/lab-analyzer.js UNCHANGED across every commit in this arc, byte-identical to its
  pre-pass value:  f452c2b326dc4ebf312ca794a7b102cc2554c0c39066585d1e5079b6fe59ba25
- canon c7c41836… unchanged | demo freeze 0ede1173… unchanged
- analyzer 2.6.1, token v=2.6.1, scoringConfigHash bt0a7p, schema le-lab.analysis/2.6 —
  all unchanged. No version bump anywhere in the arc except one FIXTURE schema, below.
- suite 170 -> 178 pass / 0 fail. Every added test is doc/fixture-facing.

NEW SINCE YOUR THIRD PASS — review these two closely
  141f6cc  test(lab): a limitation is a claim, and needs the same evidence as a capability
  2262094  test(lab): move the census schema, stop copying the lookback
  (plus one uncommitted-at-write-time ordering fix to §2, in the same commit as this brief)

THE FULL ARC, for the pattern question
  e48c9d5  §2 retraction + bl-17/bl-18/bl-19            pass 1 work
  85a930d  census correction + bl-16 score              pass 1 work
  845f56a  family registration + registry test          pass 1 work
  53657f0  §2 retraction overclaimed -> truth table     your pass 2 CONTEST
  1cf3bf7  census stops being a hand list               your pass 2 CONTEST
  02f367f  registry test scope + guard rows             your pass 2 CONTEST
  596fb50  truth table declared a column it never checked   your pass 3 CONTEST
  e44c121  census generator was a copy of the inventory     your pass 3 CONTEST
  141f6cc  trace was always assertable; denylist was a copy your pass 3 CONTEST
  2262094  fixture schema bump + stop copying the lookback  maintainer-found

FENCE
- No file writes, no branches, no commits, no PRs. Findings are REPORTS ONLY.
- ACCEPT or CONTEST per finding, with reproduction, observed vs expected, and the contract
  violated.
- OUT OF SCOPE: the v2.6.1 fix itself; union-not-swap; bl-16 as an accepted cost; the 123
  v2.6.0 threshold crossings; any threshold VALUE; md/lab-v2.6.0-release.md §13. Also out of
  scope now: the family registry (you ACCEPTed it at pass 3 and nothing has touched it since).

ATTACK TARGET 1 — RULE ON THE PATTERN, AND ON WHETHER CARRY-FORWARD STILL SERVES.

Four findings across passes 2 and 3 are one error repeated:

  pass 2  the substring lemma       "the stem run is never decisive"      refuted by a plural
  pass 2  the census                "enumerated over all sixteen entries"  two words unruled
  pass 3  the census, again         "regenerates from the stemmer's own inventory" — it read a copy
  pass 3  the anchor                "no test can assert the trace"        the helper already existed

Every one is a claim about what a mechanism CANNOT do, made without checking. Three of the four
were cheaper to check than to assert. §2 now records that as the finding — "a limitation is a
claim and needs the same evidence as a capability" — but a lesson written into the same
document that keeps producing the error is weak evidence that it has been learned.

Two questions, and the second is the load-bearing one:

  (a) Is the pattern now closed, or is there a fifth instance in the current text? Every
      negative or universal claim left in §2 and §3 is fair game. The maintainer's own audit
      found and fixed two more (target 4) and cannot be assumed to have found the rest.

  (b) §2 and §3 now carry THREE stacked correction blocks each — original paragraph, then
      correction, then correction-to-the-correction, then a third-pass correction. That is
      the v2.4.1 carry-forward precedent applied four deep. Carry-forward exists so a
      reader can see what was decided and on what reasoning; at some depth it stops serving
      that and becomes a section a reader cannot extract the current truth from. RULE: does
      the precedent still hold here, or should §2 and §3 be REWRITTEN to state current
      behavior plainly with the four-round history moved to an appendix? The maintainer's
      instinct is that the history is the most valuable content in the release and should
      stay inline, but that instinct is exactly what produced a section that is now mostly
      corrections and is not to be trusted on this question.

ATTACK TARGET 2 — THE REPLICA'S PER-BRANCH COLUMNS ARE STILL ONLY THE REPLICA'S CLAIM.

`carries` is not exported. The truth table therefore attributes per-branch behavior using a
replica copied from the analyzer, and since pass 3 it is anchored two ways: candidate
score/fate/admission, and — new at 141f6cc — the promotion trace's `disqualifiedBy` and exact
modifier, which pins the replica's first-match-in-denylist-order against what the shipped
`carries` actually returned.

What is still unanchored: the individual `literal` / `substring` / `stemRun` columns. The trace
publishes ONE modifier, so it cannot distinguish which branch found it. A replica that got the
branch split wrong while agreeing on the first match and the outcome would stay green.

  node --input-type=module -e "
  import { readFileSync } from 'node:fs';
  import { analyzerInternals, prepareCanonIndex, detectClaimUnits, classifyDomainRelevance } from './js/lab-analyzer.js';
  import { normalizeInput } from './js/lab-intake.js';
  const canon = JSON.parse(readFileSync('data/le-canon-index.json','utf8'));
  const prepared = prepareCanonIndex(canon);
  const ID = 'smv:money:provisioning-signal';
  const entry = prepared.entries.find(e => e.id === ID);
  const doc = t => normalizeInput({ text: t, format: 'auto', source: { title: 'p', type: 'fixture-file', url: null },
    extraction: { method: 'fixture', warnings: [] }, createdAt: '1970-01-01T00:00:00.000Z' });
  for (const c of ['health caregivers','health care','healths care','healthfulness carefulness','childfulness carefulness','healths careers','healths workers']) {
    const [unit] = classifyDomainRelevance(detectClaimUnits(doc('During our marriage the provider for ' + c + ' was always him.')));
    console.log(c.padEnd(28), JSON.stringify(analyzerInternals.scoreEntry(unit, entry, prepared.idf).contextualAliasTrace));
  }
  "

Adjudicate: is a replica anchored on first-match + outcome sufficient for a per-branch freeze,
or does the branch split need the analyzer to expose `carries`? If the latter, note that it is
an analyzer change and therefore a v2.6.2 item rather than something this pass may do — and say
whether the truth table should meanwhile stop claiming per-branch attribution and claim only
what it can anchor.

ATTACK TARGET 3 — THE CENSUS REFRAME. DID IT FIX THE FRAME OR DODGE THE JUDGMENT?

Three passes contested word calls: `serviceable`/`careers`, then `carefulness`/`medicalization`,
then `hostable`/`networkable`, then `cloudable`. You won every one. The maintainer's response at
141f6cc was to conclude that word-hood was never the load-bearing claim and to reframe:

  - every candidate in the census stems to its entry, so the shipped comparison REACHES all of
    them — `cloudable` included, before anyone ruled on it. That half is mechanical and complete
    over the generated space.
  - the field formerly called `rejected` is now `reachedButUnattested`, because "rejected" read
    as "not reached" and invited three rounds of argument about vocabulary as though it bounded
    the instrument.
  - attestation is a separate, revisable annotation: which part of that reach a real source
    could plausibly contain.

`cloudable` also moved to attested. Cisco's IBSG SMB cloud research uses "cloudable" spending
for IT spend suitable for cloud delivery — checked independently rather than taken on your
citation, and the scare quotes in Cisco's own text are noted in the fixture.

Adjudicate, and be adversarial about the motive: is this the correct separation of a mechanical
claim from a judgment, or is it a reframe that makes the maintainer's repeated word errors
unfalsifiable by moving them somewhere nothing can be wrong? Specifically:
  (a) Does any consumer of this census actually need the attested/unattested split, or is the
      split now decoration? §3 uses it to say which part of the widening is a practical cost.
  (b) `reachedButUnattested` still contains judgments — `cloudally`, `payible` — that nothing
      tests and nothing can. Is an untestable annotation acceptable inside a fixture whose whole
      purpose was to make judgments reviewable?
  (c) The word standard resolves arguable calls toward the WIDER cost. That is a bias, stated.
      Is it the right one?

ATTACK TARGET 4 — TWO MORE COPIES, FOUND BY THE MAINTAINER AFTER YOUR PASS 3, PLUS ONE ORDERING
DEFECT. Disclosed because you should not have to find them, and because the count matters to
target 1.

Your pass-3 finding was that `DENYLIST_ENTRIES` was a hand-typed array — the same
copy-beside-a-thing defect as the suffix inventory, one level up. Auditing the rest of the two
touched test files after that found:

  1  The census fixture renamed a field after it shipped and left `schema` at
     le-lab.denylist-census/1.0. A rename is a SHAPE change, not an append, so it is now 1.1 —
     the match-behavior benchmark holds at 1.0 through case appends for the opposite reason.
  2  The new trace assertion hand-typed "within 3 tokens", duplicating
     SCORING_CONFIG.contextualAliasModifierLookback. Now derived, so retuning the lookback
     cannot fail a test that was never asking about it.
  3  §2's third-pass correction block had been spliced into the MIDDLE of the first correction
     block, cutting it in half and putting the passes out of chronological order. Reordered in
     the same commit as this brief. A record whose corrections are unreadable in sequence is a
     record-fidelity defect of exactly the kind this pass exists to fix, and it was introduced
     BY this pass.

Deliberately NOT derived, and this is the distinction offered for adjudication:
DISQUALIFIED_SCORE 0.156 and PROMOTED_SCORE 0.54 stay literal, because a test that computes its
expectation from the same configuration it is testing asserts nothing. The rule the maintainer
is applying: a duplicated REGISTRY is a defect, a pinned expected VALUE is the job. 0.54 does
equal SCORING_CONFIG.phraseBase, so a reviewer could call it a third copy. Rule on the line.

ATTACK TARGET 5 — WHAT THE RECORD STILL DEFERS, UNCHANGED AND STILL DISCLOSED.
  - js/lab-analyzer.js:1878 still carries the retracted §2 claim as a code comment. Jason ruled
    doc-only; the divergence is named in the correction block and queued in §7.2. You ACCEPTed
    this at pass 2. It is listed only so the fourth pass does not read as though it went away.
  - The corpus is not re-run and gets no supersession entry: nothing executable changed.
  - lab-corpus.manifest.json and several md/doctrine-run files are dirty in the working tree
    from a concurrent research lane, unstaged in every commit of this arc and unreviewed here.

VERIFICATION ALREADY RUN — recheck any of it
  sha256sum js/lab-analyzer.js data/le-canon-index.json fixtures/demo-v2.6.0.json
      -> f452c2b3… / c7c41836… / 0ede1173…, all identical to their pre-pass values
  git diff c40cd7f..HEAD --stat -- js data fixtures scripts tools     -> EMPTY
  npm run test:lab                                                    -> 178 pass / 0 fail
  release audit / UI audit / site integrity                           -> PASSED at v=2.6.1
  lab.html on localhost:8753                                          -> 6 limit items, grid
                                                                         intact, no console errors

  Sentinels run this arc, each by reintroducing the defect it claims to catch:
    corrupted `literal` column                    -> fails on the literal branch
    decisive row made non-decisive, columns kept  -> fails on the decisive-set identity
    wrong expected candidate score                -> fails naming both values
    wrong modifier claimed for childfulness       -> fails naming find-order
    one suffix deleted from the census inventory  -> fails inventory + exhaustiveness
    `telecom` added to the canon denylist         -> fails the census coverage assertion
    guard put back into a routing row             -> fails naming both lists
    family dropped from §4 table, kept in prose   -> fails, where the old test passed

WHAT WOULD MAKE THIS A CONTEST
  - js/lab-analyzer.js differing from f452c2b3… in any byte
  - any fixture `expected` value changed, as opposed to an observation, a note, or an annotation
  - a fifth instance of the negative-claim-without-looking pattern anywhere in §2 or §3
  - a fourth copy-beside-a-thing in the tests or fixtures
  - a correction block that rewrote pushed prose instead of carrying it forward
  - any claim in §2 or §3 that a reader cannot check from the repository alone

Confirm the fence, then start with attack target 1(b) — the carry-forward ruling gates whether
the narrower findings are worth writing against the current text or against a rewrite.
```
