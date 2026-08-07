# Proposed append #5 to `tests/fixtures/domain-relevance-benchmark.json`

**Status: ADOPTED and applied at `c520776`** (2026-08-07). Jason delegated the
outstanding PT08 calls to Claude in session and closed the run; this was
adopted under that delegation, in a commit touching no classifier code, per the
policy quoted below.

Re-measured on the tree it landed on rather than on the figure quoted when it
was proposed — the canon is part of the gate as of v2.6.6 and had since moved
571 → 573. The numbers came out identical: 0.8438 → **0.8529**, misses 15.

The fixture's policy says cases "enter only by explicit agreement between the
maintainer and the reviewer, in a commit that changes no classifier code."
The classifier change (the `date`/`dated`/`dates` gate shapes, pt08 cycles 1
and 3) shipped separately at `959d32c` for that reason. These cases are the
guard for it, and they landed in their own commit at `c520776`.

## Measured

Measured with the classifier fix in the tree, first at proposal time and again
on the tree it was applied to:

| metric | 180 cases | 191 cases | floor |
|---|---|---|---|
| domainRecall | 1.0000 | **1.0000** | 0.9 hard |
| ignorePrecision | 1.0000 | **1.0000** | 0.95 hard |
| junkRecall | 0.8438 | **0.8529** | 0.75 ratchet — this RAISES it |
| fixture misses | 15 | 15 | — |

All 11 pass. `junkRecall` moves in the permitted direction only. `CLAUDE.md`'s
measured note now reads 0.853 over 191 cases; the declared 0.75 minimum was
left alone, as every prior append left it.

## The cases

`dt-01`–`dt-05` are **verbatim binned units** from the pt08 captures (lightly
normalised to stand alone), not authored paraphrases. `dt-06`–`dt-11` are the
calendar-sense traps that hold the ignorePrecision line the courtship shapes
must not cost.

Append inside `"cases"`, one object per line, matching the file's existing
compact style:

```json
{"id": "dt-01", "family": "direct-domain", "expected": "retain", "register": "courtship-date-predicate", "text": "GLP-1 weight-loss drugs are changing how people date and connect.", "note": "Append #5 (pt08, 2026-08-07): the gate trusted the gerund `dating` and missed the plain noun and verb. Real binned unit, pt08 cycle 3 (article thesis sentence)."},
{"id": "dt-02", "family": "direct-domain", "expected": "retain", "register": "courtship-date-predicate", "text": "Twelve per cent said they were going on more dates each month than before.", "note": "Append #5 (pt08, 2026-08-07): real binned unit; its sibling with `men` in it passed, which is the minimal pair."},
{"id": "dt-03", "family": "direct-domain", "expected": "retain", "register": "courtship-date-predicate", "text": "Twenty-six per cent said they would not date someone taking a weight-loss drug.", "note": "Append #5 (pt08, 2026-08-07): real binned unit — a screening claim, as core to the domain as prose gets."},
{"id": "dt-04", "family": "direct-domain", "expected": "retain", "register": "courtship-date-predicate", "text": "Eventually she stopped disclosing the medication to her dates, for two reasons.", "note": "Append #5 (pt08, 2026-08-07): real binned unit — possessive plural meaning the people one dates."},
{"id": "dt-05", "family": "direct-domain", "expected": "retain", "register": "courtship-date-predicate", "text": "Seventy-four per cent dated while using the medication and reported positive outcomes.", "note": "Append #5 (pt08, 2026-08-07): real binned unit; survey register, subject is a percentage."},
{"id": "dt-06", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "The release date of the quarterly earnings report was moved to the following Tuesday.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."},
{"id": "dt-07", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "The manuscript is dated 1997 and the archive has kept it in cold storage since.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."},
{"id": "dt-08", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "Please keep the vulnerability scanner up to date before the compliance audit begins.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."},
{"id": "dt-09", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "Attendees should note the dates of the conference sessions in the printed programme.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."},
{"id": "dt-10", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "His resignation letter was dated the same morning the auditors arrived at the office.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."},
{"id": "dt-11", "family": "polysemous-trap", "expected": "ignore", "register": "calendar-date-traps", "text": "The expiry dates printed on the packaging were illegible after the shipment got wet.", "note": "Append #5 (pt08, 2026-08-07): calendar sense — the ignorePrecision cost the courtship shapes must not buy."}
```

Written by appending these LINES, not by re-serialising the JSON —
`JSON.stringify(…, null, 2)` reformats every existing case and turns an
11-case append into a 1,330-line diff nobody can review. I made that mistake
once, reverted it, and the applied commit is 12 insertions.

(The `note` strings as applied carry the full append-#5 preamble on every row
rather than the shortened form shown above; the ids, families, expectations,
registers and texts are as listed.)

## The twelfth case, deliberately NOT proposed and NOT adopted

> "The carbon dating of the sediment layer places the deposit in the late
> Holocene."

is **retained** (`explicit-relational-outcome`) on the shipped tree — before
the pt08 fix and after it. The gerund `dating`, which the gate has always
trusted unconditionally, leaks on "carbon dating". It is a real pre-existing
ignorePrecision defect. It is excluded from this append because appending a
knowingly-red case would put the suite in the red for a defect this run did
not cause and did not fix, and because narrowing `dating` is a much riskier
change than widening `date` — it would need its own RED manifest and sweep.

Recorded rather than dropped. It fails OPEN (retained and visible), which the
triage-not-verdict contract permits.
