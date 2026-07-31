# The two sentence-wide hand rulings that outlived their machinery

Date: 2026-07-31
Status: red state and remedy measured together; the fix ships as v2.6.16.
Tested tree: `main 45bc924` (v2.6.15). Remedy measured in the session-scratchpad
clone of the same tree. Queued as residue by md/lab-v2.6.13-release.md; claimed
by this session by cross-session agreement.

## The defect, frozen at v2.6.15

`stanceFor` carried three pre-v2.5 hand rulings that decide stance from a
sentence-wide regex before the clause-scoped machinery runs. v2.6.13 fixed the
AWALT one. The two siblings remained:

- `frameworks:conversion-ladder`: any text containing
  `different|separate|another|not|only|does not|doesn't|fail|fails` → Supports.
- `smv:overview`: any `not|does not|doesn't|is not|isn't` … followed anywhere
  in the sentence by `moral worth|human worth|entitlement|consent` → Supports.

Probe results at HEAD (engine-level, production path):

| Probe | v2.6.15 | Verdict on the label |
|---|---|---|
| CL rejected-reading asserted ("being seen … is proof of desire and selection") | Contradicts (generic misreading branch) | right — the hand ruling never fires on the assert direction |
| CL distinction affirmed | Supports (hand ruling) | right label, shortcut mechanism |
| SMV rejected-reading asserted ("a clinical score that promises…") | Contradicts (generic branch) | right |
| SMV boundary affirmed ("leverage only; not moral worth") | Supports (hand ruling) | right label, shortcut mechanism |
| **"A high SMV means a top man doesn't really need consent…"** | **Supports — "affirms the LE boundary…"** | **false endorsement of a consent-dismissing sentence** |

The trap is the branch's whole shape: it reads a negator plus the word
"consent" anywhere in the sentence as affirming the boundary, with no clause
scoping and no check of what is being negated.

## The remedy, measured in the clone: delete both branches

Both entries carry `commonMisreadings`, and the post-v2.6.12 misreading branch
plus the generic cue ladder already handle every probe's assert direction. With
the two branches deleted:

- Both Contradicts probes: unchanged.
- CL-affirm: Supports, now via the misreading branch's own denial machinery
  ("it denies a reading this entry explicitly rejects") — same verdict,
  principled mechanism.
- **Consent trap: Supports → Challenges** ("explicit disagreement language").
  Not a perfect label, but no longer an endorsement.
- SMV-affirm: Supports → Resembles — the one recall cost. The probe's boundary
  vocabulary shares no misreading-distinctive token, so the branch does not
  enter and the cautious default stands. Under-claim, the safe direction;
  named here as the cost the fix buys.
- CL self-synopsis rows: hand-ruled Supports → Resembles (uniform cautious).

Corpus census, HEAD vs clone, all 21 archived sources: **9 credible rows touch
these entries (all conversion-ladder, all Resembles/Context only) and zero fire
either hand ruling — the deletion moves nothing in the wild.** Suite in the
clone: 18/18; no frozen benchmark pins either branch.

## What was NOT done

- The two entries' `commonMisreadings` are authored in the negated
  boundary-statement register ("…is not proof of…", "…is not a clinical
  score…"), which the misreading authoring contract
  (md/ and the tranche records) says is the shape least likely to fire the
  denial machinery on wild text. Re-authoring them in the asserted-overreach
  register is canon-surface work — the permitted remedy lane for the SMV-affirm
  recall cost above — and is left queued, not folded into an engine release.
- No threshold, score path, or fixture value moved. Stance strings only.
