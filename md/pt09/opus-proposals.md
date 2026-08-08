# PT09 — proposals from the adversarial & engine lane (Claude Opus 5)

Append-only. These are things the opus lane found but does not own: canon
surfaces, the canon index build, frozen fixtures, and site pages. Nothing here
was edited by this lane. Codex sweeps this file at each integration; anything
still open at close goes to Jason.

## P1 — the canon index hashes working-tree bytes, so a fresh clone is RED

**Owner:** Codex (`scripts/build-canon-index.mjs` + `data/le-canon-index.json`).
**Severity:** blocks any second checkout of the repo from being green.

`buildCanonIndex` hashes each source page's raw file bytes into
`sourcePages[].sha256` and into `indexVersion`. `.gitattributes` guarantees
`* text=auto eol=lf`, so the blob is LF and any CR in a working tree is a local
artifact — but the hash is taken from the working tree, so a local artifact
gets committed into the index and no other checkout can reproduce it.

Measured on 2026-08-07: five pages in the real checkout each carried one stray
CR (`statistics.html`, `lexicon.html`, `deep-dive.html`,
`dd-relationships-throughout-history.html`, `dd-competition-anxiety.html`), and
a fresh `git clone` of green `main` failed `scripts/validate-canon-index.mjs`.

Proposed fix, one line plus its rebuild: fold `\r\n` (and bare `\r`) to `\n`
before hashing, exactly as the repo's own LF contract already promises. This
changes `data/le-canon-index.json` and so must ship as a canon commit with the
suite green, in Codex's lane.

Testable afterwards: clone the repo to a temp path, run `npm run test:lab`,
expect 18/18. That check is worth a suite step of its own if it is cheap to
express.

## P2 — `lexicon:term-conversion-ladder` cannot distinguish its own concept from its misreading, by vocabulary

**Owner:** Codex (canon surfaces).
**Severity:** low now — the engine side is fixed. This is the authoring half.

The entry's synopsis spells the fourth rung "chosen"; its `commonMisreadings`
and its `pressureTests` both spell it "selection". Until
v2.6.x-opus-pt09 that made `selection` a token "distinctive to the misreading",
so a faithful restatement using the concept's own natural vocabulary read
Contradicts at 0.881. The engine fix (pressure tests count as the entry's own
voice) closes the measured case.

The authoring observation stands on its own and is worth a look when that entry
is next touched: an entry whose affirmative surfaces avoid the plainest word
for its own concept is one synonym away from this class returning through a
different token. **This is an observation, not a request to reword a page** —
CLAUDE.md's rule that no site page is reworded so a matcher scores better
applies, and the permitted remedy if one is wanted is an authored alias or
misreading, not a synopsis edit.

## P3 — candidate appends to the frozen fixtures

**Owner:** Jason (both fixtures are append-only by agreement; the opus lane did
not touch either).

- `tests/fixtures/domain-relevance-benchmark.json` — the gate benchmark holds
  no non-ASCII space, no zero-width character and no verb inflection pair. Five
  of its own 89 expected-retain cases flip to `ignore` if a single U+00A0 is
  inserted at some space (im-24, ds-05, ds-07, cr-02, cr-03). Candidate
  appends: one NBSP case, one soft-hyphen case, one past-tense idiom pair.
- `tests/fixtures/match-behavior-benchmark.json` — every case in the
  `stanceComposition` block carries an asserted misreading, so the whole block
  exercises the negation-parity branch and none of it reaches the generic cue
  ladder. That is how a ladder with no polarity at all shipped and stayed
  green. Candidate appends to that block: a negated generic cue, a supposed
  generic cue, and a question.

Both sets are guarded by ordinary unit tests in the opus patch series already,
so nothing is unprotected while these wait for a ruling. The fixture policy
(an append lands in a commit touching no classifier code) is why they are
proposed rather than shipped.

## P4 — observations that are doctrine's, not the engine's

Recorded because they were measured, with no action requested.

- A passage naming a canon concept by a single distinctive word ("hypergamy")
  is not admitted by gate option 2a, which reads multi-word surfaces. That is
  the design; it means single-word concepts depend entirely on frame
  vocabulary being present. "Hypergamy shall mean the tendency to form
  partnerships across and upward in relative status." bins.
- Academic and therapy-speak paraphrases of a canon concept, both containing
  the concept's own name, produced no match at all against
  `pills:page-rp:hypergamy`. This is the thin-surface/participant-vocabulary
  gap already on record, measured again in two more registers.
- Forum register ("women date up, thats just hypergamy bro") is scored
  `isClaimLike: false` and so leaves the coverage denominator entirely, while
  still producing a Context-only match. Whether a lower-case, unpunctuated
  forum assertion should count as a claim is a doctrine question, not an
  engine one.
