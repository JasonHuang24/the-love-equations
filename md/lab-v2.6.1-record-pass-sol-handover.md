# LE Lab v2.6.1 record-fidelity pass — Sol verification handover brief

> ## CLOSED. DO NOT PASTE THIS.
>
> **The review loop was closed by Jason on 2026-07-29 after five verification passes.** This file is
> retained as the record of what the fifth pass was asked to check. It is **not** an instruction to send
> anything to anybody, and its contents are stale: the fifth pass returned CONTEST, its findings were
> actioned in `33f0ef1`, `20e5849`, `b974f9b` and `63ea075`, and the sections this brief describes have
> changed since.
>
> **Why it stopped.** Of the nineteen findings across passes 2–5, about seventeen were defects
> introduced by the previous round's corrections rather than by the shipped release. The instrument was
> ACCEPTed on all five passes and `js/lab-analyzer.js` never changed. The loop had stopped measuring the
> release and started measuring the editing, and the editing was mine.
>
> **Work carried forward:** `md/lab-v2.6.2-scope.md`. Four items, each actionable from that file without
> a sixth brief.

**Status:** written 2026-07-29 for the **fifth** pass, now closed. Maintainer lane throughout:
**Claude Opus 5, /effort high**, single session.

**Identity convention, corrected on Sol's fourth-pass finding.** Earlier versions of this brief named
a commit as "this brief," which went stale the moment the file was pushed again — the version Sol read
had been superseded by the one that fixed it. This brief no longer claims a self-hash. **It describes
the state of `main` at the time of writing, names its review range explicitly, and should be read
against the working tree at whatever `HEAD` is when it is pasted.** If `HEAD` has moved past the range
below, the ranges still hold; the intervening commits are the doctrine research lane, which touches
nothing here.

**What changed since the fourth pass.** Sol retired the carry-forward precedent for §§2–3 and ruled
*rewrite*. That is done. The two sections are now one canonical account each, and all seven correction
blocks moved to **Appendix A verbatim** — byte-for-byte preservation asserted by script, not retyped.
Sol's 1(a) finding that the pattern was not closed was also right: four more instances were fixed, one
of which was a claim in the very paragraph that was congratulating itself on having learned the lesson.

**The one place this pass disagrees with the reviewer.** `softwareization` was contested as attested on
ITU and ETSI citations. It is held as unattested, because those bodies write `softwarization`, which
strips to `softwar` and is not reached by this denylist at all. That is attack target 2 and it is stated
as a disagreement rather than buried as a decision.

Companion documents: `md/lab-v2.6.1-release.md` (§2.1, §2.2, §3 canonical; **Appendix A** for the
history), `tests/fixtures/denylist-widening-census.json` (`le-lab.denylist-census/1.2`),
`md/limit-hit-ledger.md`, `md/FEEDBACK-PIPELINE.md` §4.

```
LE LAB v2.6.1 — RECORD-FIDELITY PASS, FIFTH VERIFICATION

You ruled REWRITE on §§2-3 at the fourth pass and found the unchecked-claim pattern still
open. Both are actioned. This pass asks you to check the rewrite itself, which is a fresh
surface and therefore a fresh chance for the same family of error, and to adjudicate one
finding held AGAINST your fourth pass.

Read-only, as before.

STATE
- Repo: F:\Programming\The Love Equations\The Love Equations Website, branch main.
- Maintainer lane: Claude Opus 5, /effort high.
- No self-hash: read this against the working tree at HEAD. Review ranges are named below and
  do not move.
- js/lab-analyzer.js UNCHANGED across the whole arc, byte-identical to its pre-pass value:
    f452c2b326dc4ebf312ca794a7b102cc2554c0c39066585d1e5079b6fe59ba25
- canon c7c41836… unchanged | demo freeze 0ede1173… unchanged
- analyzer 2.6.1, token v=2.6.1, scoringConfigHash bt0a7p, analysis schema le-lab.analysis/2.6
  — all unchanged. The only version that moved anywhere in this arc is a FIXTURE schema,
  le-lab.denylist-census 1.0 -> 1.1 -> 1.2, twice for a field rename.
- suite: 170 at release time, 178 now. §4 carries BOTH rows rather than overwriting the one
  that describes what shipped — your fourth-pass instruction.

REVIEW TARGET — the rewrite, plus one table-labelling fix made while writing this brief
  1ef31ef  docs(lab): §§2-3 rewritten, four rounds of history moved to Appendix A
  (+ the commit carrying this brief, which also labels §2.1's table as modelled at the point
   of use rather than two paragraphs later — see target 4)

PRIOR ARC, unchanged and already adjudicated by you
  e48c9d5 85a930d 845f56a   pass 1 work
  53657f0 1cf3bf7 02f367f   your pass 2 CONTESTs, fixed
  596fb50 e44c121 141f6cc   your pass 3 CONTESTs, fixed
  2262094 1081155           maintainer-found + brief identity fix
  1ef31ef                   your pass 4 CONTESTs, fixed  <- THIS PASS

FENCE
- No file writes, no branches, no commits, no PRs. Findings are REPORTS ONLY.
- ACCEPT or CONTEST per finding, with reproduction, observed vs expected, contract violated.
- OUT OF SCOPE, already ACCEPTed by you and untouched since: the family registry (pass 3);
  the fixture schema bump and lookback derivation (pass 4); the literal output oracles
  DISQUALIFIED_SCORE / PROMOTED_SCORE (pass 4 — your articulation, that they are oracles and
  not registries, is now the recorded rule); the v2.6.1 fix itself; union-not-swap; bl-16 as
  an accepted cost; any threshold VALUE; md/lab-v2.6.0-release.md §13.
- IN SCOPE and new: everything in the rewritten §2.1, §2.2, §3, and Appendix A. A rewrite is
  a new text, and none of it has been reviewed.

ATTACK TARGET 1 — THE REWRITE. IS §§2-3 NOW EXTRACTABLE, AND IS THE APPENDIX HONEST?

Your ruling: one canonical account of current behavior, complete four-round history moved
UNALTERED to an appendix.

  git show 1ef31ef --stat
  git diff 1081155..1ef31ef -- md/lab-v2.6.1-release.md

Verbatim preservation was asserted by script before the commit, not by eye: every correction
block from the pre-rewrite file was checked to appear byte-for-byte in the new one, 7/7. Check
it independently — the pre-rewrite text is at 1081155.

  git show 1081155:md/lab-v2.6.1-release.md > /tmp/before.md   (or any path you like)

Adjudicate:
  (a) Can a reader now extract current multiword behavior from §2.1 alone, and the current
      widening from §3 alone, without reading Appendix A? That was the failure the ruling
      diagnosed and it is the only test that matters here.
  (b) Is anything LOST rather than moved? The appendix reproduces the blocks and names the
      commits, but a rewrite is the easiest place to drop a qualification silently.
  (c) Is the appendix's framing self-serving? It opens by naming the four errors as one family
      and calling the history "the most useful content in this release." That is either the
      right editorial judgment or a maintainer grading his own mistakes generously. Rule.
  (d) §1 was NOT rewritten and has not been re-audited in this arc at all. Its tables were
      verified once, at release time, by the same by-eye method that produced two wrong
      censuses. Treat it as unreviewed if you have budget.

ATTACK TARGET 2 — HELD AGAINST YOUR FOURTH PASS: `softwareization`.

You ruled it attested, citing ITU FG-NET2030 and ETSI WP38. It is held as UNATTESTED, and the
reason is a spelling distinction that decides the case:

  node --input-type=module -e "
  import { tokenize } from './js/lab-analyzer.js';
  for (const w of ['softwarization','softwareization']) console.log(w.padEnd(18), '->', tokenize(w).join('|'));
  "

    softwarization     -> softwar      NOT REACHED by the `software` denylist entry
    softwareization    -> software     reached

The term the standards bodies use is `softwarization` — one `e` fewer — and it strips to
`softwar`, so this denylist never sees it. The surface that IS reached, `softwareization`, is
not the spelling in those documents. An independent search for the ITU/ETSI usage returned
`softwarization` throughout and did not corroborate the longer spelling.

So the maintainer's position: the reached word is not attested and the attested word is not
reached, and §3 now uses that pair as its cleanest demonstration that reach and attestation are
independent axes. Both facts are pinned as tests.

Adjudicate: does either of your two sources actually print `softwareization`? If it does, this
is a CONTEST the maintainer loses and the fixture flips. If they print `softwarization`, the
interesting consequence is the one now in §3 — a real technical term that this denylist cannot
see, which is a widening GAP rather than a widening cost, and arguably belongs in the record as
its own finding rather than as an illustration.

ATTACK TARGET 3 — `networkization` IS ATTESTED ON YOUR AUTHORITY, NOT ON EVIDENCE THE
MAINTAINER COULD REPRODUCE. This is volunteered, because by this session's own standard it is
the weakest thing in the census.

You cited a ScienceDirect chapter and MDPI Systems. An independent search surfaced
`network-centric` and `networking` and did not corroborate `networkization`. It was accepted
anyway — resolving toward the wider cost, per the fixture's stated bias — and recorded in the
census as "the THINNEST attestation in this file … the verdict most likely to be wrong next."

Adjudicate: firm it up with a quotation, or withdraw it. Accepting a vocabulary judgment on a
reviewer's authority is exactly the shape of deference this whole arc has been correcting, and
the maintainer would rather it were resolved than left standing as a courtesy.

ATTACK TARGET 4 — IS THE NARROWED ATTRIBUTION CLAIM NOW ACCURATE EVERYWHERE?

Your pass-4 ruling: describe the branch table as a source-derived replica/model, not a
production per-branch freeze. Done in §2.2, and while writing this brief the label was moved to
the point of use, because §2.1's table has a `Decided by` column that is itself a per-branch
claim and it sat two paragraphs away from its own disclaimer. It now reads
`Decided by (modelled)` with the caption naming every column as replica-computed.

What is claimed as anchored, and nothing more:
  - the denylist is what refused the alias                     (disqualifiedBy)
  - production selected the same first modifier as the replica (reason)
  - the outcome                                                (score / fate / admission)
What is claimed as modelled:
  - which of the three tests found that modifier
  - the `Decided by` column
  - therefore the whole per-branch split

  node --input-type=module -e "
  import { readFileSync } from 'node:fs';
  import { analyzerInternals, prepareCanonIndex, detectClaimUnits, classifyDomainRelevance } from './js/lab-analyzer.js';
  import { normalizeInput } from './js/lab-intake.js';
  const canon = JSON.parse(readFileSync('data/le-canon-index.json','utf8'));
  const prepared = prepareCanonIndex(canon);
  const entry = prepared.entries.find(e => e.id === 'smv:money:provisioning-signal');
  const doc = t => normalizeInput({ text: t, format: 'auto', source: { title: 'p', type: 'fixture-file', url: null },
    extraction: { method: 'fixture', warnings: [] }, createdAt: '1970-01-01T00:00:00.000Z' });
  for (const c of ['health caregivers','health care','healths care','healthfulness carefulness','childfulness carefulness','healths careers','healths workers']) {
    const [unit] = classifyDomainRelevance(detectClaimUnits(doc('During our marriage the provider for ' + c + ' was always him.')));
    console.log(c.padEnd(28), JSON.stringify(analyzerInternals.scoreEntry(unit, entry, prepared.idf).contextualAliasTrace));
  }
  "

Adjudicate: is the split between anchored and modelled now stated accurately in every place it
appears — §2.1's caption, §2.2's tables, the test's own comments, and bl-16/bl-17/bl-18's notes
— or is there still a surface where the model is presented as a freeze? And: should the table
exist at all before v2.6.2 publishes `matchedBy`, or is a labelled model the right thing to
carry in the interim?

ATTACK TARGET 5 — THE FIFTH CHECK ON THE PATTERN.

Four instances at passes 2-3, four more at pass 4, all one family: a claim about what a
mechanism cannot do, or a universal about what a set contains, asserted without checking. The
pass-4 set is worth restating because one of them is the sharpest example yet — §2 asserted
that the promotion trace "pins the mechanism" in the same breath as recording the lesson that
limitations need evidence.

Every claim in the rewritten text is new and unreviewed. The shapes to hunt:
  - any "cannot", "never", "only", "always", "all but", "no test can"
  - any count stated in prose rather than derived by a test
  - any table whose heading names something broader than its contents (§3's did: it said "the
    newly matched words" and held only the attested subset)
  - any claim a reader cannot check from the repository alone

Two the maintainer already fixed at pass 4 and states here so the count is honest: the "all but
the `pay` family are the technical sense" universal, which the same section contradicted two
paragraphs later; and the census/test still saying SIX omitted surfaces where the report named
seven.

VERIFICATION ALREADY RUN — recheck any of it
  sha256sum js/lab-analyzer.js data/le-canon-index.json fixtures/demo-v2.6.0.json
      -> f452c2b3… / c7c41836… / 0ede1173…, all identical to pre-pass values
  git diff c40cd7f..HEAD --stat -- js data fixtures scripts tools     -> EMPTY
  npm run test:lab                                                   -> 178 pass / 0 fail
  release audit / UI audit / site integrity                          -> PASSED at v=2.6.1
  verbatim appendix check (script, pre-commit)                        -> 7/7 blocks preserved

  Sentinels run across this arc, each by reintroducing the defect it claims to catch:
    corrupted `literal` column                    -> fails on the literal branch
    decisive row made non-decisive, columns kept  -> fails on the decisive-set identity
    wrong expected candidate score                -> fails naming both values
    wrong modifier claimed for childfulness       -> fails naming find-order
    one suffix deleted from the census inventory  -> fails inventory + exhaustiveness
    `telecom` added to the canon denylist         -> fails the census coverage assertion
    guard put back into a routing row             -> fails naming both lists
    family dropped from §4 table, kept in prose   -> fails, where the old test passed

STANDING DEFERRALS, unchanged and disclosed so this pass does not read as though they went away
  - js/lab-analyzer.js:1878 still carries the retracted claim as a code comment. Jason ruled
    documentation-only; you ACCEPTed that at pass 2. Queued in §7.2.
  - `matchedBy` on `carries` or on contextualAliasTrace is the v2.6.2 item that would turn the
    branch table from a model into a freeze. Analyzer change; not available to this pass.
  - Corpus not re-run, no supersession entry: nothing executable changed.
  - lab-corpus.manifest.json and md/doctrine-run/* are dirty from a concurrent research lane,
    unstaged in every commit of this arc, unreviewed here.

WHAT WOULD MAKE THIS A CONTEST
  - js/lab-analyzer.js differing from f452c2b3… in any byte
  - any fixture `expected` value changed, as opposed to an observation or an annotation
  - a correction block that failed to survive the move to Appendix A byte-for-byte
  - a fifth-family instance anywhere in the rewritten §2.1, §2.2, §3 or Appendix A
  - §2.1 or §3 still not readable as a standalone account of current behavior
  - any claim in the record a reader cannot check from the repository alone

Confirm the fence, then start with target 1(a) — if the rewrite did not make the sections
extractable, it failed at the only thing it was for, and the narrower targets can wait.
```
