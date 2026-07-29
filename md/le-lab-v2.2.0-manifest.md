# LE Lab v2.2.0 — release manifest

**Pass:** v2.1.2 → v2.2.0. Version + provenance plumbing, scoring-config externalization, headless
regression rig. **No scoring behavior changed.**

**Epoch**

| | |
|---|---|
| Analyzer version | `2.2.0` |
| Analysis schema | `le-lab.analysis/2.2` |
| Research-queue schema | `le-lab.research-queue/2.1` |
| Scoring config hash | `195c1ld` |
| Canon index | `1.0.0+8c38a2f1d015` (450 concepts, 19 source pages) |
| Canon generated | `2026-07-27T11:25:27.240Z` |

**Commits:** `f16c069` (harness + baseline) · `e512efd` (SCORING_CONFIG) · `e63c870` (version +
provenance) · this manifest.

**Outstanding:** work item 2 (alias/phrase recall expansion) is not in this release. It is blocked on
the `ALIAS_ADDITIONS` block, which arrived as an unfilled placeholder. The canon index is therefore
untouched at `1.0.0+8c38a2f1d015`, and verification check 2 (alias-effect) has not been run.

---

## SHA-256 — changed files

Hashes are over committed blob content. This repo pins `* text=auto eol=lf` in `.gitattributes` and
the working tree is LF, so these verify identically on any platform:

```bash
sha256sum <path>                  # working tree
git show HEAD:<path> | sha256sum  # committed blob
```

| SHA-256 | File |
|---|---|
| `a661e1b9834112de1db8583cb8b8e0a5a5f0c8200efd22239f8dfc79915d8087` | `fixtures/run-analyzer.mjs` |
| `5d5806723e7bf2353d0e0553c0601f71c556b7d383a39af2d3fcdb1f64ab8ddc` | `fixtures/diff-analysis.mjs` |
| `7321c6c69a437f9ce0cd342034f056fe64a95001044d165a95c00e6c8981f662` | `fixtures/demo-v2.1.2.json` |
| `1ba514fe5ed89e74e3ceaea3402ff374b031bb2e6523a7c2801d96c8363f9094` | `fixtures/demo-v2.2.0.json` |
| `5ecc7ccb95d2487cfd63313ce84c824796f7cb27c5144dbf85e396dd0413a9a3` | `js/lab-analyzer.js` |
| `ec3cfb4c46cc8e46f17aa3875951dc339238dd5265f39c8f2995df771dfa3d73` | `js/lab-analyzer-client.js` |
| `614ae163f475c0ca968daaaf0e388e986b7df7ce286c5179796899480b23776c` | `js/lab-analyzer-worker.js` |
| `fbdee6197690592db549c950d636402e798cb5bdc0839d299ec735878f020a47` | `js/lab-app.js` |
| `a73c0f83c4dd81cf5061f0246449280a2ef4a4d15c3e75410ebd66bb4832d128` | `js/lab-demo.js` |
| `a3c4dc22d3013b17153e42b21026671ed1c95bac84ad82ba1bfc440540ec566f` | `js/lab-export.js` |
| `14f8cbbeb749d616f337b1c286b2789b3538cf2e07900abdda9e3c62206928a5` | `js/lab-extractors.js` |
| `1f656f469e4acd1551a6b53d5e738a59cd30ce3d3c785792fd8cab8f6ae90b8c` | `css/lab.css` |
| `133f85b62e152779568dda792faaf50cee577718e090c8eb5d39f5d9e8181cfa` | `lab.html` |
| `6bc49e57d1310d7e1d1bb5198629ddf2bea2dde1449934af6dc57327b8dea4c8` | `tests/lab-analyzer.test.mjs` |
| `c849838f108ad287194e248aca749b252c63f22a0eff04c27b5f0bab33930f91` | `tools/lab_ui_audit.py` |
| `975ff33ced0a83a3f43083d27fd08acc7bac78906be2ff25358b116493a2e1a4` | `md/RERUN.md` |

Unchanged and deliberately so: `data/le-canon-index.json`, `data/canon-overlay.json`,
`scripts/build-canon-index.mjs`, `js/lab-intake.js`, `js/lab-ledger.js`.

---

## Verification record

**Check 1 — behavior freeze (v2.1.2 vs v2.2.0, unpatched canon index).**

```bash
node fixtures/diff-analysis.mjs fixtures/demo-v2.1.2.json fixtures/demo-v2.2.0.json --mode freeze
```

`RESULT: PASS` — 14 differences: 5 provenance, 9 narrative, **0 behavioral**. Score movement: 0
decreased, 0 increased, 0 dropped, 0 gained. No change to segments, matches, scores, confidences,
stances, tensions, metrics, or queue content.

**Check 2 — alias effect.** Not run. Blocked with work item 2.

**Test suite.** `npm run test:lab` green: 28 intake · 37 analyzer · 3 domain-benchmark · 8 export · 5
ledger · canon fixtures (450 concepts / 19 sources) · canon validator · release audit (v=2.2.0) · UI
audit · site integrity. Frozen 134-case domain benchmark unmoved: domainRecall 1.000 · ignorePrecision
1.000 · junkRecall 0.806.

**Browser smoke** (`:8753`, `lab.html`): contract line reads `Input 1.0.0 · Analysis 2.2 · Queue 2.1`;
canon loads at 450 concepts; Demo Test reaches 54.5% mapped, identical to the headless harness;
provisional tag renders `v2.2.0 provisional · thresholds uncalibrated`; all three exports produce
content (28,153 B Markdown / 166,995 B JSON / 5,805 B queue Markdown) carrying the provenance stamp;
Reset returns to empty and re-hides the tag; no console errors.
