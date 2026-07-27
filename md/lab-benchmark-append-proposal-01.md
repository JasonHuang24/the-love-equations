# Benchmark Append Proposal #1 — dating-app interaction mechanics

**Origin:** Doctrine Backlog Harvest #1 (Pew online-dating findings, 2026-07-26). Four genuine in-domain claims were set aside by the relevance gate; all were recovered via visitor includes (fail-open contract honored). The miss family is systematic: no frame covers dating-app interaction vocabulary (messages, matches, swipes, profiles).

**Governance path:** frozen-benchmark append (maintainer + reviewer agreement) + one systematic classifier fix, per the standing contract. No per-phrasing patches.

## Proposed appends (6 cases)

| id | family | expected | text |
|---|---|---|---|
| ap-01 | indirect-mechanism | retain | By contrast, 64% of men say they have felt insecure because of the lack of messages they received, while four-in-ten women say the same. *(verbatim production miss, Harvest #1)* |
| ap-02 | indirect-mechanism | retain | Women get flooded with matches in their first week on the app, while most men's dating profiles sit unseen. |
| ap-03 | indirect-mechanism | retain | He swipes for an hour every night and gets maybe one match a month. |
| ap-04 | indirect-mechanism | retain | Most women on the apps only respond to messages from a small fraction of male profiles. |
| ap-05 | polysemous-trap | ignore | The server rejected the messages after the connection dropped. |
| ap-06 | polysemous-trap | ignore | The advertising campaign's sponsored posts generated record engagement and matches with target demographics. |

## Proposed systematic fix (two edits, js/lab-analyzer.js)

**F1 — new SOCIAL_MECHANISM_FRAMES entry** (non-decisive, weight 3, so it retains only via participant pairing or in the absence of any affirmative non-domain frame — traps like ap-05/ap-06 stay blocked by their computing/advertising frames):

```js
{
  id: 'dating-app-interaction',
  label: 'Dating-app or courtship messaging interaction mechanics',
  weight: 3,
  decisive: false,
  test: (text) => /\b(?:messages?|matches|swipes?|likes|dating profiles?)\b.{0,60}\b(?:receiv\w*|sent|sends?|get|gets|got|getting|lack(?:ed|ing)?|flood\w*|overwhelm\w*|unseen|ignored|respond\w*|repl(?:y|ies|ied))\b/i.test(text)
    || /\b(?:receiv\w*|sent|sends?|get|gets|got|getting|lack(?:ed|ing)?|flood\w*|overwhelm\w*|respond\w*|repl(?:y|ies|ied)|no|few(?:er)?)\b.{0,60}\b(?:messages?|matches|swipes?|likes|replies|dating profiles?)\b/i.test(text)
    || /\b(?:swip(?:e|es|ed|ing)|unmatch\w*|ghost(?:ed|ing)?)\b/i.test(text),
},
```

**F3 — participant-frame extension**: add `men|women|man|woman` to the `human-individuals` alternation. Participant evidence never retains alone (pairing-gated), so this cannot loosen the gate by itself; it lets sexed subjects ground outcome/mechanism frames the way "people/adults/couples" already do.

## Measured evidence (single-unit harness, scratchpad build — no repo files touched)

| Build | Set | domainRecall | ignorePrecision | junkRecall |
|---|---|---|---|---|
| current (e40f9db) | frozen 128 | 1.000 | 1.000 | 0.800 |
| current (e40f9db) | 128 + 6 appends | 0.955 | **0.947 — below the 0.95 floor** | 0.806 |
| patched (F1+F3) | frozen 128 | 1.000 | 1.000 | 0.800 — **zero verdict changes** |
| patched (F1+F3) | 128 + 6 appends | 1.000 | 1.000 | 0.806 |

The appends make the fix mandatory under the existing thresholds (current build breaches the ignorePrecision floor on the appended set), and the fix is regression-free on the frozen set. This is the intended shape of every future classifier change.

## Explicitly rejected from this proposal

**F2 (anaphora-cue extension for "That includes …")** was prototyped and dropped: the continuity gate still (correctly) blocks promotion because the continuation shares no content tokens with its predecessor — "doing so" carries all the semantics, which a lexical system cannot see. Pronoun-substituted continuations with zero content overlap ("That includes 9% …", "this group", "these programs") remain a **documented known limitation**, recoverable via the one-click include override, which is how all three were handled in Harvest #1. No cue loosening without a measured win.

## Implementation plan (after sign-off)

Single small PR: append the 6 cases to `tests/fixtures/domain-relevance-benchmark.json` (append-only; `achievedAtFreeze` untouched — add an `appends` log entry with date and agreement note), apply F1+F3 to `js/lab-analyzer.js`, add one analyzer test asserting ap-01's sentence is retained with the new frame in its evidence, bump the lab release token, run `npm run test:lab`. Can be executed by me or assigned to the loop; the reviewer verifies with the standard verdict vocabulary.
