# Gate marriage-morphology red manifest — C1 of the crash-test triage

Date: 2026-07-31
Status: red state frozen BEFORE the fix. The fix ships separately (v2.6.14).
Tested tree: `main d3ddf73 · clean` (v2.6.13). Blast radius measured in an
isolated clone of this tree in the session scratchpad — the working tree was
not touched while the other session's stance releases were in flight.

## The defect

The gate's verb morphology cannot see two ordinary inflections of "marry":

- `marry\w*` matches marry / marrying and nothing else. **"married" and
  "marries" both miss** — `marr-i-ed` and `marr-i-es` never contain the
  literal stem `marry`.
- The pattern appears three times in the frame rules: twice in the
  participant-anchored verb lists (`cross-sex-selection`, both directions,
  js/lab-analyzer.js ~446-447) and once in the standalone
  `marriage-household-formation` topic frame (~462).

Reader-visible consequence (GPT-5.6 cold crash-test finding 6B, reproduced on
screen in md/lab-live-crash-test-01.md): "In 2024 the median American woman
first married at 31.0, while the median man first married at 29.0." — zero
claim-like segments, `no-human-relational-frame`, despite woman/man/married.
This session's probe added the third-person form: "The median American woman
now first marries at 28.6…" is gate-binned the same way. The memory note
"`married` != `marry\w*`" recorded this shape as a canon-authoring rule; here
it is the gate's own vocabulary.

## Red state, frozen

On `main d3ddf73` (pre-fix), all verified this session:

| Probe | Result |
|---|---|
| finding-6B ("woman first married at 31.0…") | ignored, `no-human-relational-frame` |
| "…woman now first marries at 28.6…" (correct-values control) | ignored |
| "The merger married two incompatible corporate cultures." (test fixture pt-03) | ignored — REQUIRED, this is the include-override test's trap |
| "The suspension keeps the car married to the road at speed." | ignored — metaphor control |

## Two fix shapes measured in isolation (clone of fa2ced1 + corpus copy)

**Broad** — fix the morphology in all three sites, including the standalone
topic frame: rescues 37 corpus passages (2448 → 2485), and RETAINS the
metaphor trap "The merger married two incompatible corporate cultures"
(tests/lab-analyzer.test.mjs subtest 31 precondition goes red; that sentence
is a deliberately authored non-domain trap). The standalone frame fires on
bare "married" with no participant anchor, which is exactly where the
metaphors live. REJECTED.

**Narrowed** — fix the morphology only in the two participant-anchored verb
lists (`…|date|marry)` → `…|date|marry|marrie[sd])`), which require a
man/woman/male/female noun within 70 characters; leave the standalone topic
frame byte-identical:

- Rescues 3 corpus passages (2448 → 2451), each genuinely relational:
  - "About 78% of women in this sample married before age 25." (17-trent-south-sex-ratios)
  - "Only 43 percent of married women—and 54 percent of married men—say they
    have a close friend…" (15-asc-american-friendship)
  - "The proportion of American women who had never been married by age 40
    more than doubled…" (22-finkel-suffocation) — whose top new neighbor is
    stat-never-married, the exactly right entry the gate was hiding from it.
- Both metaphor probes stay ignored; subtest 31 stays green.
- Suite in the clone: 17/18 — the only red is the threshold-neighbors
  tripwire (population 2448 → 2451), which is the adjudication gate doing
  its job, not a defect.
- Floors: lab-domain-benchmark and lab-gate-register both green (domainRecall,
  ignorePrecision, junkRecall all inside floors).
- finding-6B retained and mapped ("26 to 31" · Resembles · Medium — the
  numeral-blind steering of Class D remains, a separately recorded limit).

## The measured bill (narrowed fix, clone vs v2.6.12 dump baseline)

Score census: 515 pairs changed, ALL gains, 0 losses, all from the 3 rescued
passages. Crossings: **1 minCredibleScore (BLOCKS until ruled) + 44
minWeakScore (ceiling is 0 — every one blocks until hand-ruled) + 284
candidateScoreFloor (census, not adjudicable)**. The credible crossing is
stat-remarriage-gap at 0.468 on the first-marriage-timing passage — a
remarriage entry reached by a first-marriage stat, REJECT-shaped on first
read; final verdicts will be entered against the regenerated band with each
entry's text in hand, hand-entered per the 91-crossing precedent
(`--rule` is forbidden and was not used; the fixture's counts move in pairs).

## What this fix does NOT do

- The 150/532 gate-binned canon synopses stay 150/532 in the clone — C1 never
  claimed them; they are Class C2 (conflict/outcome-frame vocabulary), which
  stays deferred to its own designed gate-append.
- No canon page, misreading, or fixture value is edited to score better.
- The v2.6.12 stance state is undisturbed in the clone: Contradicts 0/532,
  same tally — C1 and the stance fix are independent, measured so.
