# Codex catch-up brief — everything since your last review

**For:** Codex · **From:** Claude · **Date:** 2026-06-20
**Your last review:** `composite-gender-rename-review-brief.md` (the 7-finding pass on the Body Calc + composite + Face rename).
**This brief:** orients you to the current `main` so you can re-review. Two of your prior recommendations were **deliberately reversed** after user testing — those are called out first so they're not a surprise.

## Commit lineage
- **`4a4769d`** — the work you reviewed, plus **all 7 of your findings applied**. (Your review's baseline → committed.)
- **`dc0144e`** — decisive-sex toggle, composite raw-scores + lens toggle, photo persistence, F1 reword.
- **working tree (uncommitted)** — the "Athletic structure" read (your F1 idea, built).

Read the real diff: `git diff 4a4769d..HEAD -- body.html face.html js/composite-score.js css/styles.css`.

---

## ⚠️ Two reversals of your prior recommendations (please re-rule on these)

### R1 — Composite F2 normalisation → REVERSED to raw display
You flagged (F2) that `score/max·10` mis-mapped the floor, and we changed it to `(score-floor)/(max-floor)·10`. Shipped in `4a4769d`. **Then the user hit the consequence:** the body calc shows Black Pill **8.3** (the BP lens maxes at 9, labelled "/10"), and the composite normalised that to **9.1/10** — a number matching nothing on screen, and it bumped the tier (Chad→Gigachad). User: "9.1 seems to come from nowhere."

**Now:** the composite shows the **RAW lens score** (8.3) — identical to the calc — and **blends raw**; added a **Black Pill / Conventional toggle** (mirrors the calc toggles, persisted). The floor concern is moot (raw shows the native `[1,scaleMax]`); the fairness cost is negligible (Conventional both max 10 → exact; Black Pill face-PSL 8.6 vs body 9 ≈ 4%). `validScore` + the `v2` payload (with `floor`) are unchanged.

- **Question:** agree the legibility win (composite matches the calcs) justifies dropping the normalisation, or is there a presentation that's both fair *and* recognisable? `js/composite-score.js`.

### R2 — The 3-layer sex defense → PARTIALLY REVERSED to "decisive + toggle"
You validated the sex-gate interaction as sound. **Then the user, after living with it, preferred a decisive male/female call over "Sex undetermined"** (QOL). So:
- the **confidence gate no longer gates** (`SEX_CONF_MIN`→`SEX_LOWCONF`, now only a debug tag) — a low-confidence read commits and shows its % honestly;
- the **occlusion guard no longer forces "undetermined"** — a sunglasses face now falls back to `bcAnalyze`'s decisive **body-frame guess** (better than a confidently-wrong occluded-face read);
- every read gets a **bold one-tap `Wrong? Switch to <other>`** toggle right after the % (in the readout *and* the status line; the status bar was made HTML-capable, `innerHTML` only for our own controlled `bcStatusNote` markup, plain `textContent` for everything else).

The eye-occlusion detection and crop/visibility gates **still exist** — they now route to the frame guess instead of declining. `sexSource='unknown'` survives only for the genuine `guessSex` deadzone.

- **Question:** given a one-tap correction is right there, is decisive-with-toggle the right call vs the cautious decline? (The tension is honest-over-confident vs decisive-QOL; the user owns this call, but flag any case where a confidently-wrong assertion is now worse than declining.) `body.html`.

---

## Other changes since your review

### The weight-sensitivity pass (your F1 "before declaring weights untunable" ask) — DONE
Replicated the body scorer in Node (`.claude/body-sensitivity.js`, gitignored) over reasoned sex×build archetypes. **Accurate verdict (per your finding 4): weight changes are unnecessary, but one band recalibration is viable and was intentionally declined.** A clean, correctly-sexed athletic woman scores **7.5 BP / 8.5 Conv**; a clean overweight man **2.6**. The synthetic "5" reproduced from upstream causes — **mis-sex** (same vector vs male bands → 5.3) or a **degraded silhouette** (→ 5.7) — but the **archetypes can't prove what drove the real-photo scores**. Weight perturbations don't separate (±0.4); however the script's own **female shoulder-band test raises athletic-F 7.5→8.5 while lowering overweight-F 5.3→5.0** — a real non-breaking separation. The user chose to **leave the band as-is** (a value choice), addressed instead by the Tapered-structure read below.

### F1 panel note — reworded per the sensitivity verdict
The committed note ("an athletic non-hourglass frame reads low because the lens rewards the hourglass") **overstated** the rubric cause. Now: *a fit body reading middling is usually an **input** problem (mis-read sex / degraded silhouette), not the rubric — a clean, correctly-sexed read ranks fine.* `body.html` renderResult.

### Athletic-structure read (your F1 "athletic frame breakdown" idea) — BUILT, uncommitted
A **sex-relative** athletic index (`athleticIndex`: V-taper + shoulder breadth vs each sex's own athletic range) shown as a positive 0–100 read in the Tier-1 composites (dedicated `athleticRow`, no out-of-band scarlet flag since high = good). **Surfaces the credit the hourglass lens withholds, never fed into the score.** Verified: athletic woman→"Athletic build 78", overweight→"Soft/straight 4", athletic man→"Athletic-leaning 66".
- **Review:** the sex-relative reference ranges (`f: vTaper[1.25,1.60] shoulderHip[0.98,1.22]`, `m: vTaper[1.45,1.85] shoulderHip[1.30,1.58]`) are reasoned, not fitted — sane? And is "shown, never scored" the right boundary? `body.html`.

### Photo persistence across page switches — NEW feature, both calcs
The dropped photo + result vanished on navigation; the user wanted it kept until replaced or reset. **Each calc now persists `{img, state, ts}` to localStorage** (`bodyShot.v1` / `faceShot.v1`) and **restores instantly on load** (state-restore, not a pipeline re-run). `img` = the overlaid canvas downscaled to a ~768px JPEG; `state` = the serialisable BC/LC analysis fields. **Bridged across each page's two scripts** (UI-wiring owns BC/LC; the MediaPipe module owns the canvas) via `window` hooks (`bcSetShot`/`bcRestoreState`/`bcResetAll`/`bcClearCanvas`). New drop overwrites; failed drop / `bcResetResult` clears; the composite **"Reset both (scores + photos)"** clears shots + scores + the on-page calc UI. `setItem` wrapped for quota.
- **Review:** the localStorage approach + the cross-script hook bridge (any race between the module's `bcRestoreShot` and the UI-wiring `bcRestoreState`?); quota handling; and the **privacy** angle — the photo now lingers on-device until reset (the user declined an in-UI note; flag if you think it needs one). `body.html`, `face.html`, `js/composite-score.js`.

---

## Files & checklist
- `body.html` — decisive sex + bold toggle, status bar HTML-capable, F1 reword, athletic read, photo persistence.
- `face.html` — photo persistence (same pattern).
- `js/composite-score.js` — raw scores + lens toggle + reset clears photos/UI.
- `css/styles.css` — lens-toggle styles + composite footer spacing.

**P1:** R1 (raw vs normalised composite) and R2 (decisive sex vs decline) — do you concur given the new reasoning? Photo-persistence race/quota/privacy.
**P2:** athletic index reference ranges + "never scored" boundary; the status-bar `innerHTML` safety (only `bcStatusNote` markup goes through it).
**Already verified live (don't redo):** all the above were exercised in the Preview browser — composite raw numbers match the calcs (8.3/9.3) + toggle + blend (7.7 Chad); decisive 63% read + bold toggle re-bases 7.5→5.3; photo persist→reload→restore→reset on both calcs; athletic read 78/4/66; consoles clean.

**Note:** the Athletic read is uncommitted; everything else is on `main` through `dc0144e`.
