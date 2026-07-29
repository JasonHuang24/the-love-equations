# LE Lab v2.6.1 — Sol verification handover brief

**Status:** written 2026-07-29 for Jason to paste to Sol (GPT-5.6) after the v2.6.1 hotfix push. Head
commit at time of writing is `fb8f31c`; if the head moves before pasting, update the SHA line inside
the block. Maintainer lane for this work: **Claude Opus 5, /effort high**, single fresh session, three
commits, all pushed to `main`.

Context: Sol's verification of v2.6.0 returned one CONTEST and otherwise ACCEPT. This release is that
CONTEST and nothing else. The brief is written to make three specific things easy to attack — a
deliberate departure from the literal wording of Sol's ruling, a false positive the fix knowingly
buys, and one change that goes slightly past the minimum repro — rather than to present a clean bill.

Companion documents: `md/lab-v2.6.1-release.md` (the release report), `md/lab-v2.6.0-release.md` §11
and §13 (the corpus bound and the open items this release does not touch).

```
LE LAB v2.6.1 — VERIFICATION PASS

You reviewed v2.6.0 and returned ACCEPT on everything except one CONTEST:
`disqualifyingModifier` compared a denylist entry against nearby words by testing the
literal term and a naive `${modifier}s`, so `utility` tested `utilitys` and missed
`utilities`. Your ruling: compare modifiers in the same normalized morphological
representation on both sides, by running denylist entries and candidate tokens through
the core stemToken path rather than literal+s matching.

v2.6.1 is that fix and nothing else. Verify it. Read-only.

STATE
- Repo: F:\Programming\The Love Equations\The Love Equations Website, branch main, head fb8f31c.
- Maintainer lane: Claude Opus 5, /effort high.
- analyzer 2.6.0 -> 2.6.1 | release token v=2.6.0 -> v=2.6.1 (19 refs, 8 files)
- scoringConfigHash bt0a7p UNCHANGED — no config value added, changed, or removed
- analysis schema le-lab.analysis/2.6 UNCHANGED | queue /2.1 UNCHANGED
- canon 1.0.0+949aef381d5f UNCHANGED, rebuilds byte-identical (c7c41836…)
- suite 170 pass / 0 fail (test COUNT unchanged; +6 benchmark cases inside existing tests)

  5b9c51a  test(lab): a plural the denylist cannot spell, frozen RED
  fb8a68f  fix(lab): the denylist and the passage finally speak the same morphology
  fb8f31c  release(lab): v2.6.1 — one comparison, one representation

FENCE
- No file writes, no branches, no commits, no PRs. The checkout is the maintainer's live
  working directory. Findings are REPORTS ONLY.
- Classify every finding ACCEPT or CONTEST, same vocabulary as your v2.6.0 pass. A CONTEST
  must carry (a) exact reproduction steps, (b) observed vs expected, (c) which contract or
  ruling it violates.
- OUT OF SCOPE, do not re-litigate: the 123 threshold crossings Jason ruled ACCEPT at
  v2.6.0; the 15 documented limits in the `documentedLimits` block; any threshold VALUE
  (none was retuned, and `coverage.provisional` is still true); the three open items in
  md/lab-v2.6.0-release.md §13. New instances of those are appends for the maintainer, not
  blockers.

THE FIX
js/lab-analyzer.js, `disqualifyingModifier` (line ~1853), the `carries` helper (line ~1882).
One caller: `promotedAliases`. It returns null immediately when the alias has no denylist.
`stemToken` itself is UNTOUCHED — the fix consumes it. No schema change was required.

  const carries = (tokens) => {
    const run = tokens.join(' ');
    const stems = tokens.map(stemToken);
    return modifiers.find((modifier) => {
      if (tokens.includes(modifier) || tokens.includes(`${modifier}s`)) return true;
      if (modifier.includes(' ') && (run.includes(modifier) || run.includes(`${modifier}s`))) return true;
      const wanted = modifier.split(' ').map(stemToken);
      return stems.some((_, at) => wanted.every((stem, offset) => stems[at + offset] === stem));
    }) || null;
  };

ATTACK TARGET 1 — I DEPARTED FROM THE LITERAL WORDING OF YOUR RULING. This is the finding
most likely to be a real CONTEST and it is stated first on purpose.

Your ruling said stemToken "rather than literal+s matching". I ADDED stemming to the literal
tests instead of replacing them. Reason, measured before the fix was designed:

The whole canon holds exactly ONE non-empty notAfter list — smv:money:provisioning-signal,
alias `provider`, 16 entries. Running every entry and its plural through the shipped
`tokenize`, 7 unify under stemming and 9 SEPARATE, because this stemmer is not a plural
normalizer:

  unify   cloud/clouds · internet/internets · medical/medicals · payment/payments
          energy/energies · utility/utilities · network/networks
  separate  service->service vs services->servic · healthcare/healthcar
          health care/health car · insurance/insuranc · hosting->host vs hostings->hosting
          software/softwar · care->care vs cares->car · childcare/childcar · child care/child car

So a literal swap repairs 2 entries by breaking 9 — including cm-03, a fixture v2.6.0 already
shipped and you already ACCEPTed. cm-19 exists to fail that swap. A union is also monotone: it
can only ever ADD disqualifications, so nothing previously rejected can be promoted.

Reproduce the split yourself, read-only, from the shipped module:

  node --input-type=module -e "
  import { readFileSync } from 'node:fs';
  import { pathToFileURL } from 'node:url';
  const a = await import(pathToFileURL('js/lab-analyzer.js').href);
  const canon = JSON.parse(readFileSync('data/le-canon-index.json','utf8'));
  const list = canon.entries.flatMap(e=>e.contextualAliases||[]).flatMap(c=>c.notAfter||[]);
  const stem = t => a.tokenize(t).join(' ');
  const plural = m => { const w=m.split(' '), l=w.at(-1);
    return w.slice(0,-1).concat(/[^aeiou]y\$/.test(l) ? l.slice(0,-1)+'ies' : l+'s').join(' '); };
  for (const m of list) console.log(stem(plural(m))===stem(m)?'UNIFY  ':'SEPARATE', m, '/', plural(m));
  "

Adjudicate: is the union the correct reading of your ruling, or does 'same representation on
both sides' require the swap and therefore require the 9 entries be handled another way? If
you rule swap, note that cm-03 and cm-19 both go RED and say what should replace them.

ATTACK TARGET 2 — THE FIX BUYS A NEW FALSE POSITIVE, FROZEN AS bl-16.
`payment` stems to `pay`, so:

  "During our marriage the provider for paying the mortgage was always him."

is now disqualified when a human reads it as the provisioning sense. Frozen in the
documentedLimits block as bl-16 with humanlyCorrect beside it, family `morphology`, and the
note says explicitly that this limit was CREATED by this release rather than found.

The full widening was enumerated, not estimated. Beyond plurals, stem comparison newly
reaches: host/hosts/hosted (from `hosting`), networked/networking (from `network`), clouded
(from `cloud`), pay/pays/paying/payers (from `payment`). Every family except `pay` is the
technical sense the denylist exists to reject — "the provider of hosted email" and "the
provider for networked storage" are now correctly disqualified.

Adjudicate: is bl-16 an acceptable cost, or does it invalidate the approach? The narrower
alternative is written down in the release report §3 — stem only where the literal test has
already failed — and was NOT applied because it reintroduces a private idea of morphology
beside the analyzer's real one, which is the v2.4.2 defect shape. Say if you disagree.

ATTACK TARGET 3 — ONE CHANGE GOES PAST THE MINIMUM REPRO.
Multiword entries (`health care`, `child care`) moved from substring matching to a contiguous
run of stems, so a longer word merely spanning them can no longer satisfy them. No denylist
entry's observed behavior changes as a result — neither multiword entry is y-final, so neither
had the derived-plural gap — and it removes a latent shape rather than a measured defect.
Adjudicate as scope creep or as the correct generalization of the same fix.

THE FIXTURES (tests/fixtures/match-behavior-benchmark.json, clauseMechanics, defect b)
Appended as defect b deliberately: this is the same complement rule cm-02/cm-03 bought at
v2.6.0, defeated by morphology rather than by word order. Check that placement.

  cm-16  RED->GREEN  provider OF utilities              your repro, verbatim
  cm-17  RED->GREEN  the utilities provider             the BACKWARD lookback — both directions
                                                        call one helper, and a fix written only
                                                        into the v2.6.0 forward branch would pass
                                                        cm-16 and fail this
  cm-18  RED->GREEN  provider of renewable energies     the only other entry with this morphology
  cm-19  GREEN both  financial services provider        fails the swap-instead-of-union fix
  cm-20  GREEN both  the provider for our families      fails a spelling rule that maps any
                                                        `ies` word to its `y` singular
  cm-04  GREEN both  the provider for the household     pre-existing; fails a fix that
                                                        disqualifies on complement SHAPE
  bl-16  new limit   provider for paying the mortgage   target 2 above

VERIFICATION ALREADY RUN — recheck any of it
  npm run test:lab                                       170 pass / 0 fail
  node fixtures/run-analyzer.mjs --out <tmp> --quiet
  node fixtures/diff-analysis.mjs fixtures/demo-v2.6.0.json <tmp>
      -> 2 differences, BOTH provenance (provenance.analyzer.version and
         researchQueue.provenance.analyzer.version), 0 behavioral, 0 score movement, PASS.
         At commit fb8a68f — before the version bump — the capture was BYTE-IDENTICAL to
         fixtures/demo-v2.6.0.json, sha 0ede1173d17c8c65…
  node tools/lab-threshold-sweep.mjs --dump base.json   (at fa4c1c5)
  node tools/lab-threshold-sweep.mjs --baseline base.json  (at HEAD)
      -> 46,350 pairs (103 retained passages x 450 entries), 0 changed, 0 crossings at
         candidateScoreFloor / minWeakScore / minCredibleScore.
  node scripts/build-canon-index.mjs && git diff --stat data/le-canon-index.json  -> empty
  Live: lab.html on a localhost server loads all 10 modules at v=2.6.1 (200 OK), Demo Test
  runs through the worker to 54.5% mapped, zero console errors.

THE CORPUS ZERO IS STRUCTURAL, NOT EVIDENCE OF SAFETY — and I want this attacked too.
`provider` and `breadwinner` occur ZERO times across all three archived sources (01 Pew 99
lines, 02 Fem-Centrism 31, 04 Heteropessimism 46), and `provider` holds the only non-empty
denylist in the canon. The corpus cannot exercise this path at all. That is the same bound
md/lab-v2.6.0-release.md §11 recorded for the bin-1 mechanical fixes. So the 0/46,350 is a
fact about the corpus, not a demonstration that the change is safe — the fixtures are the
demonstration. Corpus NOT re-run and lab-corpus.manifest.json gets no supersession entry, per
the v2.4.1/v2.4.2 precedent. If you think a patch that provably cannot move this corpus still
warrants a re-run, say so.

  grep -ciE "provid|breadwinner" lab-corpus/sources/*.txt      (corpus is gitignored, third-party)

DISCLOSED ERROR, carried forward rather than rewritten.
My first enumeration of the separating entries was done by eye, said EIGHT, and missed
hosting/host. It reached the commit messages on 5b9c51a and fb8a68f before a programmatic
recount caught it. The code comment, cm-19's note and the release report now all say nine;
the two pushed commit messages still say eight, and the report names them as stale. The
argument the number supports — union, not swap — is unchanged. Flag if you would rather the
history were corrected than annotated.

VERSION-BUMP RATIONALE, since v2.4.2 established the opposing rule.
v2.4.2 held analyzer at 2.4.0 because not one of its changes moved a number. This release
moves three verdicts, so the version that names the engine moves with them. The release
TOKEN and the analyzer version therefore agree here, and diverged at v2.4.1/v2.4.2. Check
that reasoning as well as the numbers.

WHAT WOULD MAKE THIS A CONTEST — the maintainer's own stop conditions, unfired:
  - the morphological comparison changing any NON-denylist scoring path
  - any floor regressing
  - the fix requiring stemToken itself to change rather than be consumed
  - a new SCORING_CONFIG value (none added; hash unchanged)
  - a schema change (none)
If you can trip any of these, that is the finding.

Confirm the fence, then start with attack target 1.
```
