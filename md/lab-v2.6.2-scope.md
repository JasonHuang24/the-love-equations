# LE Lab v2.6.2 — scope carried out of the v2.6.1 record pass

**Status:** written 2026-07-29 when the v2.6.1 record-fidelity review loop was closed by Jason after
five verification passes. Nothing here is urgent and nothing here is a production defect — the
instrument was ACCEPTed on all five passes and `js/lab-analyzer.js` is byte-identical to its pre-pass
value, `f452c2b326dc4ebf312ca794a7b102cc2554c0c39066585d1e5079b6fe59ba25`. These are the items the record
pass could not do because it was forbidden from touching the analyzer, plus one cleanup.

**Why this file exists rather than another review round.** Of the nineteen findings across passes 2–5,
about seventeen were defects introduced by the previous round's corrections rather than by the shipped
release. The loop had stopped measuring the release and started measuring the editing. Everything below
is actionable from this file alone; none of it needs a sixth brief.

---

## 1. Publish which test matched — `matchedBy`

**The gap.** `contextualAliasTrace` publishes the modifier that refused a contextual alias
(`reason: technical modifier “health care” within 3 tokens`) but not **which of `carries`'s three tests
selected it**. So the branch table in `tests/lab-match-behavior.test.mjs` and §2.1 of
`md/lab-v2.6.1-release.md` attribute per-test behavior with a **replica** of `carries`, anchored on the
returned modifier and the outcome. Production could change the branch while preserving modifier, score,
fate and admission, and the replica's columns would silently go false.

**The change.** Either shape closes it:

- `carries` returns `{ modifier, matchedBy }` instead of a bare modifier, and `disqualifyingModifier`
  forwards `matchedBy` into the trace row; or
- `promotedAliases` adds `matchedBy` to the `contextualAliasTrace` row it already builds.

**Cost.** Additive to `le-lab.diagnostics` (→ `/1.2`) and to the flag-file contract that carries the
trace. Moves the analyzer hash. **Moves no score**, so by v2.4.2's rule the analyzer *version* need not
move — but check that against the release's own reasoning rather than against this sentence.

**What it buys.** §2.1's table stops being a labelled model and becomes a freeze; the replica in
`tests/lab-match-behavior.test.mjs` can be deleted, and with it the drift surface that produced the
worst finding of the whole arc (the lane-priority model, which got two of six rows wrong).

## 2. The comment at `js/lab-analyzer.js:1878`

It still describes the contiguous-stem run as having **replaced** substring matching. That claim was
retracted three times over in the record (Appendix A of the release report) and the comment is the
load-bearing copy — the next person to modify `carries` reads it, not the release note.

Comment-only, no behavior, but it moves the analyzer hash, which is why the record pass left it. Jason
ruled documentation-only at the time and required the divergence be named in the record; it is, in §2.2.
**Fix it in the same commit as item 1**, since that commit is already rewriting the function.

## 3. The contiguous-stem generalization — still queued, still behind `GENERIC_TERMS`

Dropping the substring test so the stem run is the only multiword rule. **Score-moving**, which is why
it is not a record correction. Full argument in §7.2 of the release report; the safety measurement
already exists as `bl-19` (`health care services` stays disqualified without the substring test, because
the stem run matches `health care` directly and `care`/`service` match literally).

Unblocked by a production flag landing on `bl-17`/`bl-18` territory. Ordered behind `GENERIC_TERMS`
(v2.6.0 §13.2) because both are the same defect — a hand-written list compared against a representation
it was not written in — and fixing the smaller one first means touching `carries` twice.

## 4. Cleanup — one attestation without a source

`tests/fixtures/denylist-widening-census.json` requires every surface in `arguableAttested` to carry an
`attestationEvidence` row with a source and either a URL or an explicit note. **`hosters` has the note
and no URL**, which the test permits and which the fixture itself flags as the weakest verdict in the
file. Either cite it or move it to `reachedButUnattested`. Nothing depends on the answer; it is a loose
end recorded so it is not rediscovered as a finding.

---

## Not carried forward, and why

**The `reason`-string change is already covered.** Adding test 3 can change *which* modifier is reported
for an unchanged verdict — `healths care` would have reported `care` at v2.6.0 and reports `health care`
now (§2.1). No further work: the branch table asserts the returned modifier per row, so a future change
to that ordering fails the suite.

**`softwarization` stays a recorded gap, not a task.** It strips to `softwar`, so the denylist cannot see
a live technical term. Widening the denylist to catch it is a vocabulary change and this project's
standing position is that enumerating vendors and spellings is not a rule — see v2.5.0 §1.2 and the
`realButNotReached` note in the census. Recorded so it is not rediscovered; not queued.
