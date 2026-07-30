# LE Lab v2.6.1 record-fidelity pass — Sol verification handover brief

**Status:** written 2026-07-29 for Jason to paste to Sol (GPT-5.6) after the three record-fidelity
commits were pushed. The review target is the range `c40cd7f..845f56a` — three commits, all pushed to
`main`. `main` has since moved past it (doctrine-run commits `cb0d654`, `ff312c3`, `bdfeb2f`, then
`c8f6b70` adding this brief), all of which touch nothing this pass touched; the range is what matters
and it does not move. Maintainer lane for this work: **Claude Opus 5, /effort high**, single fresh
session.

Context: Sol's verification review of the v2.6.1 hotfix (briefed in `md/lab-v2.6.1-sol-handover.md`)
returned findings against the release *record* rather than against the code — the §2 description of
shipped behavior, the §3 widening census, and an unregistered limit family. This pass is those
corrections and nothing else. **`js/lab-analyzer.js` is byte-identical before and after**, and that
hash is the load-bearing assertion of the whole pass.

The brief is written to make six things easy to attack, and the first two are the ones most likely to
be real CONTESTs: a frozen fixture field the maintainer *edited*, and a retraction that replaced a
false claim with a stronger one than the retraction required. Sol's review text was **not in hand**
when the fixtures were written — target 5 is that disclosure, and it is the one finding that could
invalidate two frozen cases outright.

Companion documents: `md/lab-v2.6.1-release.md` (§2, §3 and §7 all carry new dated correction blocks),
`md/limit-hit-ledger.md`, `md/FEEDBACK-PIPELINE.md` §4, and `md/lab-v2.6.1-sol-handover.md` (the brief
this review answers).

```
LE LAB v2.6.1 — RECORD-FIDELITY PASS, VERIFICATION

Your verification of v2.6.1 returned findings against the RECORD, not the engine: §2
described multiword behavior that never shipped, §3's "enumerated" widening census was
wrong, and the `morphology` limit family was registered nowhere that routes a limit.

These three commits are those corrections. No production behavior changed. Verify that
claim first and the corrections second. Read-only.

STATE
- Repo: F:\Programming\The Love Equations\The Love Equations Website, branch main.
- REVIEW TARGET: the range c40cd7f..845f56a, three commits. main has since moved past it with
  doctrine-run work and this brief; none of that touches anything below. Review the range,
  not the head.
- Maintainer lane: Claude Opus 5, /effort high.
- js/lab-analyzer.js UNCHANGED, byte-identical before and after this pass:
    f452c2b326dc4ebf312ca794a7b102cc2554c0c39066585d1e5079b6fe59ba25
- analyzer 2.6.1 UNCHANGED | release token v=2.6.1 UNCHANGED | NO version bump
- scoringConfigHash bt0a7p UNCHANGED | schema le-lab.analysis/2.6 UNCHANGED | queue /2.1 UNCHANGED
- canon 1.0.0+949aef381d5f UNCHANGED (c7c41836…) | demo freeze UNCHANGED (0ede1173…)
- suite 170 -> 171 pass / 0 fail. The +1 is one new test; the three new fixture cases
  land inside existing tests and move no count.

  e48c9d5  docs(lab): retract the §2 multiword claim, freeze the shape it missed
  85a930d  docs(lab): the widening census, enumerated instead of asserted
  845f56a  test(lab): register the limit families, and assert the registry can't drift

FENCE
- No file writes, no branches, no commits, no PRs. The checkout is the maintainer's live
  working directory. Findings are REPORTS ONLY.
- Classify every finding ACCEPT or CONTEST, same vocabulary as your previous passes. A
  CONTEST must carry (a) exact reproduction steps, (b) observed vs expected, (c) which
  contract or ruling it violates.
- OUT OF SCOPE, do not re-litigate: the v2.6.1 fix itself (you already ruled on it); the
  union-not-swap decision; bl-16 as an acceptable cost; the 123 threshold crossings Jason
  ruled ACCEPT at v2.6.0; any threshold VALUE; the three open items in
  md/lab-v2.6.0-release.md §13. New instances of those are appends, not blockers.
- IN SCOPE and unusual: this pass edited a FROZEN fixture field and left a known error
  standing in production. Both were deliberate. Both are below.

WHAT A RECORD PASS IS ALLOWED TO DO — the contract this pass wrote itself
A record correction may change documentation, fixture NOTES, and fixture observations that
were mis-transcribed. It may not change what the analyzer does, and it may not change an
`expected` value. The assertion that it held is the analyzer hash above, checked before and
after. If any correction had required touching production code, the instruction was to stop
and report it to Jason rather than fix it. That happened once — target 3.

ATTACK TARGET 1 — I EDITED A FROZEN FIELD. Stated first because it is the most likely
CONTEST and because the block it lives in is append-only by policy.

bl-16.observedAtFreeze.score was `null`. It is now `0.156`.

The argument: every other unpublished case in the documentedLimits block records the
CANDIDATE-level score from the diagnostics trace, not a published one. bl-11, bl-12, bl-13,
bl-14 and bl-15 all appear in neither `matches` nor `weakMatches` and all record 0.156.
bl-16's candidate score is also 0.156. So `null` was not a different measurement of a
different surface — it was a transcription error, and nothing in the suite asserts that
field (the limit test compares only the keys `expected` carries, which is credibleMatch or
stance), which is precisely why it could sit wrong through a release and a review.

  node --input-type=module -e "
  import { readFileSync } from 'node:fs';
  import { pathToFileURL } from 'node:url';
  const a = await import(pathToFileURL('js/lab-analyzer.js').href);
  const i = await import(pathToFileURL('js/lab-intake.js').href);
  const canon = JSON.parse(readFileSync('data/le-canon-index.json','utf8'));
  const bench = JSON.parse(readFileSync('tests/fixtures/match-behavior-benchmark.json','utf8'));
  const doc = text => i.normalizeInput({ text, format:'auto', source:{title:'p',type:'fixture-file',url:null},
    extraction:{method:'fixture',warnings:[]}, createdAt:'1970-01-01T00:00:00.000Z' });
  for (const c of bench.blocks.documentedLimits.cases.filter(c=>c.surface==='co-fire')) {
    const r = await a.analyzeDocument(doc(c.text), canon, { diagnostics: true });
    const seg = r.segments[0];
    const cand = (r.diagnostics.claimUnits[0].candidates||[]).find(x=>x.canonId===c.canonId);
    const pub = (seg.matches||[]).find(m=>m.canonId===c.canonId) ? 'matches'
      : (seg.weakMatches||[]).find(m=>m.canonId===c.canonId) ? 'weakMatches' : 'NOT PUBLISHED';
    console.log(c.id.padEnd(7), 'recorded', String(c.observedAtFreeze.score).padEnd(6),
      '| candidate', String(cand?.score).padEnd(6), cand?.fate?.padEnd(20), '|', pub);
  }
  "

Adjudicate: is correcting a mis-transcribed observation inside an append-only block a
legitimate record correction, or a goalpost move that should have been an append plus a
retraction note leaving `null` in place? If you rule the latter, say what the replacement
should look like — the maintainer's reading is that leaving a known-wrong number in a freeze
while writing a correction two lines away is indefensible, but that reading is the thing
under review.

ATTACK TARGET 2 — THE RETRACTION REPLACED A FALSE CLAIM WITH A STRONGER ONE.

§2 said multiword entries "moved from substring matching to a contiguous run of stems, so
`health care` … can no longer be satisfied by a longer word that merely spans them", and
that this "removes a latent false-positive shape". Your finding: not shipped. Confirmed —
`carries()` tries three tests in order and the retained substring test returns first:

  if (tokens.includes(modifier) || tokens.includes(`${modifier}s`)) return true;           // 1
  if (modifier.includes(' ') && (run.includes(modifier) || run.includes(`${modifier}s`)))  // 2
  const wanted = modifier.split(' ').map(stemToken);                                      // 3
  return stems.some((_, at) => wanted.every((stem, offset) => stems[at + offset] === stem));

The correction block does not stop at "test 2 still exists". It asserts the stem run is
NEVER the decisive test for this canon, as a proof rather than a measurement:

  any surface whose stem is `care` is either `care` itself or `care` plus a suffix the
  stripper removes, so it always carries `care` as a prefix; therefore "health " + that
  surface always contains the substring "health care"; therefore test 2 always fires before
  test 3 is reached. Identically for `child care`. Those are the canon's only two multiword
  entries, so test 3 moved no verdict at v2.6.1 and could not have.

  node --input-type=module -e "
  import { pathToFileURL } from 'node:url';
  const a = await import(pathToFileURL('js/lab-analyzer.js').href);
  const st = t => a.tokenize(t)[0] ?? t;   // falls back to the surface for stopwords, as stemToken does for short tokens
  const M = ['cloud','healthcare','health care','service','internet','insurance','medical','hosting',
    'software','payment','energy','utility','network','care','childcare','child care'];
  const hit = (tokens, useSubstring) => {
    const run = tokens.join(' '), stems = tokens.map(st);
    return M.filter(m => {
      if (tokens.includes(m) || tokens.includes(m+'s')) return true;
      if (useSubstring && m.includes(' ') && (run.includes(m) || run.includes(m+'s'))) return true;
      const w = m.split(' ').map(st);
      return stems.some((_, at) => w.every((s, o) => stems[at+o] === s));
    });
  };
  for (const [id, toks] of [['bl-17',['health','caregivers','was']],['bl-18',['child','caregivers','was']],
    ['bl-19',['health','care','services']]])
    console.log(id, 'SHIPPED:', hit(toks,true).join(',')||'-', '| WITHOUT test 2:', hit(toks,false).join(',')||'-');
  "

    bl-17 SHIPPED: health care        | WITHOUT test 2: -
    bl-18 SHIPPED: child care         | WITHOUT test 2: -
    bl-19 SHIPPED: health care,service,care | WITHOUT test 2: health care,service,care

Adjudicate three things separately:
  (a) Is the proof sound, or is there a surface stemming to `care` that does not carry
      `care` as a prefix? The stripper's rules are the /ies/->y branch plus suffix removal;
      the maintainer's claim is that only the /ies/->y branch could produce a non-prefix
      result and it cannot land on `care`. Break it if you can — a counterexample makes the
      correction block overclaim in the same way the paragraph it corrects did.
  (b) The correction keeps one half of the original claim ("no denylist entry's behavior
      changes") on a DIFFERENT ground: a third test that only ever adds disqualifications
      cannot subtract one. Is salvaging half a retracted sentence honest, or should the
      whole paragraph have gone?
  (c) A retraction that lands a stronger claim is exactly the shape that produced the
      original error. The proof is one paragraph of prose with no test behind it. Should it
      be a fixture instead, and if so what would that fixture assert?

ATTACK TARGET 3 — ONE COPY OF THE RETRACTED CLAIM IS LEFT STANDING IN PRODUCTION.

  js/lab-analyzer.js:1878 — "Multiword entries match as a contiguous run of stems rather
  than by substring, so `health care` … can no longer be satisfied by a longer word that
  merely spans them."

That is the same false claim, in the more load-bearing copy: the next person to modify
`carries()` reads it. Correcting a comment moves the analyzer's hash, which this pass was
forbidden to do. The maintainer stopped and put it to Jason as a fork rather than fixing it;
**Jason ruled doc-only, and required the divergence be named in the record** rather than left
silent. It is named in the §2 correction block and queued in §7.2.

Adjudicate: is "documentation corrected, production comment knowingly wrong, divergence
disclosed" an acceptable end state, or does a record pass that cannot reach every copy of an
error fail as a record pass? If you rule the latter, the maintainer's position is that the
answer is a v2.6.2 that corrects the comment and the report together, not a hash change
smuggled into a doc pass.

ATTACK TARGET 4 — THE CENSUS IS RE-ENUMERATED. IS IT COMPLETE NOW?

§3 claimed to be "enumerated over all sixteen entries". Your finding was right and the error
ran both ways. `pays` does NOT match: four characters, below minStemmableLength of 5, so
stemToken returns it unstemmed and it never meets `payment`'s stem `pay`; the literal test
asks only for `payment` and `payments`. The word §3 offered as the clearest instance of the
cost is the one word in that family the fix cannot see. `paid` is out too, being irregular.

Six surfaces were missing, and two of them are a missing KIND rather than a missing member —
two entries the table did not reach at all:

  cloud     clouded, clouding
  network   networked, networking, networkers
  hosting   host, hosts, hosted, hosters
  service   serviceable                       <- entry absent from the original table
  care      careers                           <- entry absent from the original table
  payment   pay, paying, payers, payable, payed

  node --input-type=module -e "
  import { pathToFileURL } from 'node:url';
  const a = await import(pathToFileURL('js/lab-analyzer.js').href);
  const s = t => a.tokenize(t).join('|') || '(dropped)';
  for (const w of ['payment','pay','pays','payed','paying','payers','payable','paid','care','cares',
    'careers','carers','caregivers','service','serviceable','cloud','clouding','network','networkers',
    'hosting','hosters']) console.log(w.padEnd(12), s(w));
  "

`careers` is the widest of them: a common word, no technical sense, and adjacent to the
relational register the alias exists to catch. Its asymmetry is arbitrary rather than
principled — `carers` stems to `car` and `caregivers` to `caregiv`, so neither matches, and
which care-words the denylist sees is decided by the stripper's suffix table and not by
meaning. §3 now says that.

Adjudicate: find a seventh. The candidate space was generated mechanically from the
stemmer's own suffix inventory applied to each entry and each entry's stem, then filtered BY
HAND to real English words — and the hand filter is the weak step, which is how `serviceable`
and `careers` were missed the first time. A surface the maintainer's filter dropped as a
non-word and you judge a real one is a CONTEST. So is any claim in the table you can break.

ATTACK TARGET 5 — YOUR REVIEW TEXT WAS NOT IN HAND. THIS IS THE DISCLOSURE THAT MATTERS.

The maintainer received your findings as a transcription inside Jason's brief, not as your
review. The brief said the review was attached; it was not, and the maintainer halted, said
so, and verified every claim against the code instead. Jason then reaffirmed the three
commits without supplying it, so the work proceeded on measurement rather than on your text.

Consequences, both of which you are better placed to settle than anyone here:
  - bl-17 and bl-18 freeze the sentences AS TRANSCRIBED in Jason's brief:
      "During our marriage the provider for health caregivers was always him."
      "During our marriage the provider for child caregivers was always him."
    If your repro used different sentences, the frozen text is wrong under the right IDs and
    both cases need re-freezing. Confirm the text or correct it.
  - The 0.156 in the brief was initially reported back to Jason as non-reproducing, because
    the first probe read `matches`/`weakMatches` and got null. YOUR NUMBER WAS RIGHT and the
    probe was reading the wrong surface. That correction is what exposed target 1. If any
    other number in your review was checked against a published surface where you meant a
    candidate one, say which.

ATTACK TARGET 6 — THE REGISTRY TEST PARSES MARKDOWN, AND IT FOUND A SECOND GAP.

`morphology` had been a fixture family since v2.6.1 — bl-16 was filed under it — and appeared
in none of the four places that route a limit: the block's own `ruling`, the family table in
md/limit-hit-ledger.md, §4 of md/FEEDBACK-PIPELINE.md, and the instrument-limits list on
lab.html. A flag adjudicated onto it had a frozen case to point at and no row to be recorded
in, which is the one state §4 exists to prevent. All four now name it.

The structural fix is the new case in tests/lab-feedback-integrity.test.mjs: every `family`
present in the fixture block must be registered in the ledger's table with cases listed, must
be named in FEEDBACK-PIPELINE, and the table must register no family no case carries.

  node tests/lab-feedback-integrity.test.mjs

It found a second gap on its first run: **`qualification` (bl-06), unregistered since
v2.6.0.** Two families with frozen cases and no destination, and neither was caught by
reading — because the table and the ruling had each been written from the other rather than
from the cases. Both are registered now.

Adjudicate:
  (a) The test reads two markdown files as the registry. The precedent is that the
      disposition routing table in FEEDBACK-PIPELINE §4 is duplicated as executable code in
      tools/lab-feedback.mjs with a test over the code. The maintainer did NOT duplicate the
      family registry into code, on the grounds that a code copy would be a third place to
      forget and that the document IS the routing table for families. Rule on that: is a
      prose table an acceptable registry, or should there be a LIMIT_FAMILIES export?
  (b) `qualification` was registered retroactively with a row written by the maintainer
      rather than by whoever filed bl-06. Check the row says something true about bl-06.
  (c) The morphology row lists bl-19, a GUARD, alongside three limits. The `window` row
      omits its guard (bl-11b) and the `coordination` row includes its guard (bl-15). The
      existing table is inconsistent about this and the new row picked one side. Say which
      convention is right.

THE FIXTURES (tests/fixtures/match-behavior-benchmark.json, documentedLimits)
Block ruling changed from "These fifteen" to "These seventeen", and now separates the seven
syntax families from the one that is not syntax.

  bl-17  new limit   provider for health caregivers    target 2/5. family morphology.
                                                       0.156, humanlyCorrect credible.
  bl-18  new limit   provider for child caregivers     the sibling that makes it a shape
                                                       rather than an anecdote — a fix
                                                       written against `health care` alone
                                                       would pass bl-17 and fail this, the
                                                       same reason cm-17 sits beside cm-16
  bl-19  new GUARD   provider for health care services the case a reader ASSUMES the
                                                       substring test protects, and does
                                                       not: with test 2 gone the stem run
                                                       matches `health care` directly and
                                                       `care`/`service` match literally.
                                                       Any future fix must keep it green.
  bl-16  corrected   provider for paying the mortgage  score null -> 0.156 (target 1),
                                                       note re-enumerated (target 4)

VERIFICATION ALREADY RUN — recheck any of it
  sha256sum js/lab-analyzer.js
      -> f452c2b326dc4ebf312ca794a7b102cc2554c0c39066585d1e5079b6fe59ba25, identical to the
         pre-pass hash. This is the assertion the whole pass rests on.
  git diff c40cd7f..845f56a --stat -- js/ data/ fixtures/ scripts/ tools/
      -> EMPTY. No js module, canon artifact, demo freeze, builder or tool changed.
  git diff c40cd7f..845f56a --stat
      -> six files, 232 insertions, 24 deletions:
           lab.html                                      1 +      the one shipped-page change
           md/lab-v2.6.1-release.md                     90 +-      §2, §3, §7 correction blocks
           md/FEEDBACK-PIPELINE.md                      33 +-
           md/limit-hit-ledger.md                       26 +-
           tests/fixtures/match-behavior-benchmark.json  47 +-     3 new cases, ruling, bl-16
           tests/lab-feedback-integrity.test.mjs        59 +       the registry test
         lab.html IS production and is counted as such: one added <p> in .lab-limit-grid,
         copy only, no script, no ID, no class. That is the entire executable-surface
         exposure of this pass and it is a paragraph of prose in a static page.
  npm run test:lab                              171 pass / 0 fail
  sha256sum data/le-canon-index.json            c7c41836… unchanged, matches release §5
  sha256sum fixtures/demo-v2.6.0.json           0ede1173… unchanged, matches release §5
  release audit / UI audit / site integrity     PASSED at v=2.6.1
  lab.html live on localhost:8753               6 limit items in .lab-limit-grid, 3-column
                                                grid intact, no horizontal overflow, zero
                                                console errors. Screenshot unavailable (the
                                                Browser pane was not displayed); verified by
                                                DOM read instead.

DISCLOSED, so you do not have to find it
  - The maintainer's first probe of bl-17 reported score null and told Jason your 0.156 did
    not reproduce. It reproduces; the probe was reading published surfaces instead of the
    candidate trace. Corrected before any fixture was written, and it is what surfaced
    target 1. No wrong number reached the repo from it.
  - lab-corpus.manifest.json is dirty in the working tree from a concurrent doctrine
    research run and is deliberately NOT staged in any of these three commits. Commit 845f56a
    says so. It is not part of this pass and its contents are unreviewed here.
  - The corpus was NOT re-run and gets no supersession entry. Nothing executable changed, so
    there is nothing for a re-run to measure — a weaker and more obvious version of the
    v2.4.1/v2.4.2/v2.6.1 precedent.

WHAT WOULD MAKE THIS A CONTEST — the maintainer's own stop conditions
  - js/lab-analyzer.js differing from f452c2b3… in any byte
  - any `expected` value in any fixture changed, as opposed to an observation or a note
  - a score, stance, admission or coverage figure moving anywhere
  - a schema or version bump hiding in the diff
  - a correction that silently rewrote pushed prose instead of carrying it forward with a
    dated block (the v2.4.1 §1.4 precedent)
  - the census in §3 still being incomplete
If you can trip any of these, that is the finding.

Confirm the fence, then start with attack target 1.
```
