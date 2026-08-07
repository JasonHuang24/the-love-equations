# Calculators — specs and calibration records

A volume of the record shelf (`md/INDEX.md` is the table of contents; one row per section).
Append new records as new `# <name>` sections at the END of the right volume — never as new
md/ files (see "Record hygiene" in CLAUDE.md). Every section below is a byte-exact merge of a
former standalone md/ file; in-text references to `md/<name>.md` resolve to the section of that
name in this or a sibling volume, or to the pre-merge file via the `git show` pointer on the
section header line.


---

# body-cnn-scoping-brief.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/body-cnn-scoping-brief.md`

# Body CNN scoping brief — a trained `models/body-beauty.onnx` for the Body Calculator

**Scope:** find (or build) a trained CNN that scores whole-body attractiveness/physique from a single
RGB photo, runs **in-browser on-device** via onnxruntime-web, and drops into the slot `body.html`
already exposes. **No app code is changed by this brief — it is research + recommendation only.**

**The slot it has to fit** (from `body.html` `MODEL_CONFIG`, lines ~756–807, and `models/README.md`):

| Field | Value the page assumes |
|---|---|
| file | `models/body-beauty.onnx` (onnxruntime-web @1.20.1, WASM EP) |
| input | square RGB **NCHW** `[1,3,224,224]`, ImageNet mean/std |
| crop fed to it | pose-landmark bounding box ×1.15, square, aspect-preserving, from the **full-res** image (full-body framing) |
| output | a single scalar; page maps `[outMin=1.0, outMax=5.0] → [0,1]` then through the lens curves |
| budget | ideally **<~50MB**, hard ceiling **~100MB** (face model is ~43–45MB ResNet18 for comparison) |

Any model we adopt must reduce to **one RGB image → one scalar**. The five `MODEL_CONFIG` constants
(`inputSize`, `mean`, `std`, `outMin`, `outMax`) are the only knobs; anything else requires touching code.

---

## Bottom line up front

**There is no turnkey "body-beauty" checkpoint** — the README's warning holds after a fresh sweep. The
face calc got lucky with SCUT-FBP5500 (clean dataset + a published ResNet18 checkpoint); **no public body
equivalent exists with downloadable weights.** Every "score my physique from a photo" product (LeanLens,
Spren, GainFrame) is **closed-source SaaS** — no weights, no ONNX, often cloud-side.

So the realistic choice is between **two** honest paths, not three:

1. **Train your own regressor** on a real rated-body dataset → export to ONNX (mirrors the SCUT recipe
   exactly). **The dataset to use exists and is downloadable:** the **Connor full-body stimuli set on OSF**
   (726 clothed full-body images, attractiveness ratings among 24 traits, ~3,311 raters). This is the
   single most realistic path to a *true attractiveness* `body-beauty.onnx`. **(RECOMMENDED.)**
2. **Use a leanness/BMI-from-photo proxy** as the magnitude signal instead of "attractiveness." Lean +
   muscular reads as attractive, and a body-fat estimate is **less subjective and less ethically loaded**
   than rating bodies. But the public photo-based bodyfat repos are **weak research code with no released
   weights** — you'd still be training, on worse data than path 1. Usable as a *secondary* signal, not the
   headline.

Both are "train it yourself." The difference is **which dataset/label**. Path 1 gives you the headline the
page actually advertises (attractiveness); path 2 gives you a defensible proxy. **Recommendation: do path 1
on the Connor data; optionally fold a leanness proxy into the geometry breakdown later.**

If neither is worth the effort right now, **staying on geometry is fully defensible** (README path 3) and
the page already degrades gracefully — dropping a model in later is a pure upgrade.

---

## Candidate-by-candidate assessment

### Angle 1 — Direct "body attractiveness" datasets/models (the SCUT analog)

#### ★ Connor full-body stimuli set (OSF) — **the real one; RECOMMENDED training data**
- **What it is:** a social-perception research stimulus set. **726 full-body photographs** of Asian (117),
  Black (269), White (340) individuals, both sexes, **clothed, neutral pose**, on plain backgrounds.
  **490,359 ratings** from **3,311 US adults** across **24 traits — attractiveness is one of them** (also
  warmth, competence, income, etc.).
- **Availability:** **publicly downloadable on OSF** — <https://osf.io/egj7c/> (images + ratings). No
  restrictive license flagged; **citation required**: Connor et al. (2020), *Pers. Soc. Psychol. Bull.*
  47(1):89–105. Linked from the author's stimuli page <https://www.paulconnorpsych.com/stimuli>.
- **Convertibility:** N/A (it's a dataset, not a model) — but it is exactly the right shape to fine-tune a
  ResNet18/EfficientNet on, then export to ONNX with the **same recipe as the face model**.
- **Scores whole-body attractiveness?** **Yes — directly.** You average the per-image attractiveness ratings
  to a 1–N ground-truth score, identical in structure to SCUT's averaged 1–5 beauty score.
- **Caveats (important, state them on the page):**
  - **272 of 726 targets are Photoshop head-swaps** (heads swapped onto bodies for the original study's
    purpose). For a *body* scorer this is arguably fine (or even useful — it decorrelates face from body),
    but you should decide whether to **drop or keep** the composites; document the choice.
  - **N=726 is small** (SCUT-FBP5500 has 5,500). Fine-tune only the head + last block of an ImageNet
    backbone, heavy augmentation, cross-validated — do **not** train from scratch.
  - **Clothed, neutral pose** matches the calc's intended input well, but means the model learns
    *clothed-silhouette* attractiveness, not physique-under-clothing. Honest, and aligned with what a single
    photo can see.
  - **Rater pool is US adults; targets are a fixed 726-person set** → demographic and cultural bias is
    baked in. This is the same class of bias SCUT has (largely Asian female faces) and must be disclosed.
- **Verdict:** **REAL and actionable.** Best available route to a genuine attractiveness headline. Effort:
  one training run (Colab), same toolchain as the face model.

#### Photofeeler-D3 — **strong idea, weights NOT public → dead end as a download**
- **What it is:** a CNN trained on Photofeeler's **Dating Dataset (PDD)** — **>1M images, tens of millions
  of votes** — predicting smart/trustworthy/**attractive**. The "attractive" head reaches SOTA on facial
  beauty and is explicitly whole-person dating photos. arXiv 1904.07435.
- **Availability:** **paper only.** The dataset is **proprietary** (Photofeeler's commercial corpus) and
  **no weights or code are published.** This is the body analog of the dead HuggingFace entries the face
  effort hit.
- **Verdict:** **VAPORWARE for our purposes.** Conceptually the best model in existence for this task;
  practically unobtainable. Do not pursue.

#### Live-streaming / "Hot-or-Not" / LiveBeauty datasets — **face-centric, not whole-body**
- LiveBeauty, Hot-or-Not, LSFCB etc. surface repeatedly but are **facial** attractiveness or are tiny/old.
  Not whole-body. **Skip** — the face calc already covers this turf.

---

### Angle 2 — Physique / muscularity / body-composition models

#### Commercial "physique from photo" apps — LeanLens, Spren, GainFrame — **closed, no weights**
- **What they are:** SaaS that estimate body-fat range, muscle balance, symmetry from 1–4 photos
  (<https://leanlens.ai/how-ai-body-analysis-works>). LeanLens deliberately reports **ranges, not fake-
  precise numbers** — a stance worth borrowing editorially.
- **Availability:** **no public model, no ONNX, no API weights.** Processing is server-side. Cannot be
  embedded on a static site.
- **Verdict:** **DEAD END as a component** (useful only as design/UX precedent: "ranges, not a single
  number" matches the project's ethos).

#### Medical body-composition CNNs (CT/MRI L3 segmentation, XComposition, 3D-morphology) — **wrong modality**
- These segment muscle/fat from **CT, MRI, or chest radiographs**, not consumer photos. Some release code,
  but inputs are clinical scans. **Not usable** for a webcam/phone photo.
- **Verdict:** **DEAD END** (wrong input domain).

#### Bodybuilding / pose-scoring models
- No public, downloadable "score this physique" CNN found. Pose-estimation models (BlazePose, which the
  page already uses) give geometry, not an aesthetic magnitude. **Nothing to repurpose here.**

---

### Angle 3 — BMI / body-fat-from-photo regressors (the less-subjective magnitude proxy)

The thesis is sound: **lean + muscular reads as attractive**, and a bodyfat estimate sidesteps the
"who decides what's hot" subjectivity. But the *public* models are thin.

#### BodyScan (arvkr) — **runnable but not a single-image regressor, and not ONNX-clean**
- **What it is:** Global PyTorch Hackathon 2019 entry. Estimates bodyfat% via a **pipeline**: monocular
  depth net (Mannequin-Challenge / "frozen people" CVPR'19) + a finetuned **RetinaNet** to locate body
  parts → neck/waist circumference → **Navy bodyfat formula**. PyTorch 1.2.
- **Availability:** **code + some checkpoints present** (`checkpoints/test_local`), but it's a **multi-stage
  detector+depth pipeline**, not a clean single-image→scalar net. **License unspecified.**
- **Convertibility:** **Poor.** RetinaNet + a depth network + a hand-coded formula is **not** a single
  `[1,3,224,224] → scalar` graph. Converting the whole pipeline to one ONNX file is a research project, and
  RetinaNet NMS ops are awkward in onnxruntime-web. Old (PyTorch 1.2, Python 3.6).
- **Verdict:** **NOT WORTH IT.** Interesting reference; far too much surgery to fit the slot.

#### Body-Fat-Regression-from-Reddit (Kayse-Johnson) — **right shape, no weights, tiny/noisy data**
- **What it is:** **ResNet, PyTorch, single front-facing 224×224 image → bodyfat% scalar.** This is *exactly*
  the slot's shape.
- **Availability:** **code only — no released checkpoint.** Dataset is **1,022 male images** scraped from
  Reddit (r/guess_my_bf, r/bulk_or_cut), labels from user comments / hand-labeling. **Males only.** Test MSE
  ~10.2 (≈±3.2% bodyfat) — author calls it under-trained.
- **Convertibility:** **High in principle** (plain ResNet → ONNX is trivial), **but there's nothing trained
  to convert** — you'd retrain, on small, noisy, male-only, license-murky scraped data.
- **Verdict:** **CONDITIONAL / weak.** Good architectural template; bad data and no weights. If you wanted a
  *bodyfat* signal you'd be better off relabeling a cleaner set. Not the headline.

#### Celeb-FBI (arXiv 2407.03486) — **full-body height/weight dataset; weight→BMI proxy possible**
- **What it is:** a benchmark of **human full-body images** labeled with **age, gender, height, weight**,
  with deep-learning baselines for estimating those. Weight + (implied) height → **BMI proxy from a full
  body photo.**
- **Availability:** dataset/paper exists; **weight-from-photo is a legitimate, less-subjective magnitude.**
  Need to confirm the dataset's download terms and whether baseline weights are released (paper-stage;
  treat released weights as *unconfirmed* until checked).
- **Convertibility:** baselines are standard CNNs → ONNX-friendly **if** weights ship. Even without weights,
  it's a **second viable training set** for a leanness proxy (cleaner labels than the Reddit set).
- **Verdict:** **PROMISING as proxy data**, secondary to Connor. Verify license + weight availability before
  committing.

#### Silhouette→bodyfat (Broad/IBM, UK Biobank, npj Digit. Med. 2022) — **gold-standard method, wrong inputs, restricted data**
- **What it is:** a CNN that predicts visceral/subcutaneous/gluteofemoral fat volumes from **2D silhouettes**
  derived from **whole-body MRI** of 40,032 UK Biobank participants (R² 0.88–0.93). Representative code in
  `broadinstitute/ml4h/model_zoo/silhouette_mri`.
- **Availability:** **code yes, but data is UK Biobank (gated application), and the silhouettes are
  MRI-derived, not phone photos.** Trained weights are tied to that restricted modality.
- **Convertibility:** the *architecture* (silhouette → fat scalar) is conceptually perfect and the page
  **already produces a silhouette** from Selfie segmentation. But the published model expects MRI-grade
  silhouettes and isn't released as a drop-in photo model.
- **Verdict:** **DEAD END as a download; valuable as a blueprint.** It validates the idea that a *silhouette*
  carries real adiposity signal — which is what the geometry path already exploits.

---

### Angle 4 — Train-it-yourself: the offline recipe (mirrors the SCUT→ONNX recipe)

This is the recommended path. It reuses the **exact toolchain** in `models/README.md` — only the dataset
and the architecture-load step change. The face recipe's hard-won lesson (verify `missing_keys`/
`unexpected_keys`) **does not bite here**, because you are *training* the backbone, not loading a quirky
third-party checkpoint — you control the architecture end to end, so the ONNX export is the clean
torchvision path.

**Dataset:** Connor OSF full-body set (Angle 1). **Backbone:** torchvision **ResNet18** (matches the face
model's ~43MB size and the page's 224 NCHW ImageNet contract) or EfficientNet-B0 (smaller, ~20MB) if you
want headroom under the 50MB budget.

**Offline recipe (Google Colab, one notebook — same spirit as `models/README.md`):**

```python
# 0. install
!pip install -q torch torchvision onnx onnxscript pandas pillow

# 1. get the Connor stimuli from OSF (images + ratings CSV) — https://osf.io/egj7c/
#    Build a table: image_path -> mean(attractiveness rating)  [the ground-truth label]
#    Decide & DOCUMENT whether to drop the 272 Photoshop head-swap composites.
#    Normalize labels to the page's interim 1.0–5.0 band (or train in z-space and set outMin/outMax later).

# 2. model: ImageNet-pretrained ResNet18, single-scalar regression head
import torch, torch.nn as nn, torchvision as tv
model = tv.models.resnet18(weights=tv.models.ResNet18_Weights.IMAGENET1K_V1)
model.fc = nn.Linear(model.fc.in_features, 1)          # 1 scalar out

# 3. preprocessing MUST match body.html cropBodyTensor:
#    - crop a SQUARE person box (pad ~1.15), aspect-preserving, from full-res
#    - resize to 224, ImageNet mean [0.485,0.456,0.406] / std [0.229,0.224,0.225], NCHW
#    Train with heavy aug (flip, color jitter, slight scale/translate). Freeze early blocks; fine-tune
#    layer4 + fc first, then unfreeze more if val MSE keeps dropping. K-fold CV (N=726 is small).

# 4. (loss) MSE or Huber on the mean-attractiveness label; track Pearson r on held-out fold (SCUT-style metric)

# 5. export ONNX — SAME contract as face-beauty.onnx
model.eval()
torch.onnx.export(model, torch.randn(1,3,224,224), "body-beauty.onnx",
                  input_names=["input"], output_names=["score"],
                  opset_version=12, dynamo=False)       # legacy exporter = one self-contained file (~43MB)
# files.download("body-beauty.onnx")  # then drop into models/

# 6. CALIBRATE: run the model on a held-out fold, take the 2nd/98th percentile of raw predictions,
#    and set MODEL_CONFIG.outMin/outMax to those quantiles (README explicitly asks for this).
#    Sanity check: lean/athletic bodies should score high, and the spread should be sane, not a dead band.
```

**Why this works and the others don't:** it's the only path that (a) yields a *true attractiveness* score
the page advertises, (b) has **downloadable, citable, license-clear** training data, (c) drops into the
existing slot with **zero code changes** (matches input size, normalization, scalar output), and (d) reuses
the proven SCUT→ONNX→onnxruntime-web toolchain already documented in `models/README.md`.

**Effort/risk:** one Colab training run; main risk is **small N (726)** → guard with transfer learning +
augmentation + cross-validation, and report the holdout Pearson r honestly. If r is weak, **the model
shouldn't ship** — the geometry fallback is better than a noisy black box.

---

## Recommendation (single most realistic path)

**Build `body-beauty.onnx` by fine-tuning a torchvision ResNet18 on the Connor OSF full-body stimuli set,
exporting to ONNX with the existing face-model recipe, then calibrating `outMin/outMax` from holdout
prediction quantiles.** It is the only route that is simultaneously *real* (downloadable, licensed data),
*honest* (scores the attractiveness the page claims), and *zero-code-change* (fits the slot exactly).

**Best candidates, ranked, with verdicts:**

1. **Connor OSF full-body stimuli (train-your-own attractiveness regressor) — REAL. Pursue.** Downloadable,
   citable, right modality (clothed full-body), attractiveness label present. Small N is the only real risk;
   mitigate with transfer learning.
2. **Celeb-FBI full-body (height/weight → BMI/leanness proxy) — PROMISING, secondary.** A less-subjective
   magnitude proxy; verify license + weight availability. Good as a *breakdown* signal or a fallback label,
   not the headline.
3. **Photofeeler-D3 — VAPORWARE.** The ideal model conceptually; proprietary data, no public weights. Don't.

**Honest verdicts on the rest:** BodyScan = real code but wrong shape (multi-stage, not ONNX-clean);
Reddit-bodyfat = right shape, no weights, tiny male-only noisy data; silhouette-MRI = gold-standard blueprint
but gated MRI data, not a photo model; LeanLens/Spren/commercial = closed SaaS, uncomputable on a static
site. **No drop-in checkpoint exists** — confirming the README.

## Caveats to surface on the page (the project's ethos demands it)

- **Dataset bias:** any model inherits its raters and its targets. Connor = US adult raters over a fixed
  726-person set; SCUT = largely Asian female faces. A "universal" body score is a fiction — **label the
  model's training population.**
- **Ethics / sensitivity:** rating real human bodies is more fraught than rating faces. Prefer the
  README's framing — the **number is a black box; the geometry breakdown is the transparent part** — and
  consider LeanLens's **"ranges, not fake-precise single numbers"** stance for the headline.
- **What a photo can't see:** a single 2D image can't separate muscle from fat reliably, and clothing
  redraws the silhouette. A photo-trained CNN largely learns **BMI + pose + clothing confounds** — say so.
  This is *why* the trained score is demoted to a headline with the geometry kept as the explainable layer.
- **Licensing:** Connor data requires **citation** (Connor et al. 2020); verify Celeb-FBI's terms before
  use; do **not** ship anything built on murky scraped Reddit data without checking rights.
- **Graceful failure is already correct:** with no model present the page scores on geometry and says so.
  Ship a trained model **only if** its holdout correlation justifies it — otherwise geometry wins.


---

# body-calc-hybrid-spec.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/body-calc-hybrid-spec.md`

# Body Calc — Objective-Spine Hybrid Spec (v1 draft)

**Status:** IMPLEMENTED & COMMITTED to main 2026-07-05 (Jason's localhost test passed) — all 6 decision points (DP-1 … DP-6) ruled below.
**Architect:** Fable 5 (this session). **Implementer:** Claude Code, Opus 4.8, Ultracode / xhigh.
**Scope:** `body.html`, `js/composite-score.js` (payload shape only — see §7), new CSS in `css/body.css`.
**Non-scope:** Face Calc code (its remaining work is a calibration *protocol*, Appendix A — no code change).

---

## 1. Why this exists — the documented holes it patches

The current Body Calc is a two-instrument system: the Connor-trained CNN owns clothed
shots (torso skin < 45%), silhouette geometry owns bare physiques (≥ 45%). The mission
ledger documents four structural failures that neither instrument can fix from a photo:

1. **The bare path lost its Tier-1 leanness signal.** WHtR was correctly demoted to
   "measured, not scored" (frontal *width*/height doesn't convert to the circumference
   bands — the P0 units bug). Consequence: the shirtless/swimwear path — the hero
   "rate my physique" use case — scores with **no adiposity term at all**.
2. **Depth blindness.** A gut projects forward; a frontal silhouette sees it edge-on.
   Overweight bodies are systematically overrated on the bare path.
3. **Muscle/fat conflation.** "A lean frame and a soft one can share an outline" — the
   silhouette cannot tell lean-athletic from skinny-fat.
4. **No absolute scale.** Height and mass are unmeasurable from pixels; every ratio is
   relative.

Height + weight + BF% are exactly the three numbers that close all four holes, with real
units and no proxy math. That is the whole argument for the hybrid: the objective spine
supplies what a photo structurally cannot, and the photo supplies shape/distribution,
which the numbers structurally cannot. Complementary instruments, each scoped to its
domain — the same principle Codex's "don't blend unvalidated signals" review established,
except the objective tier is *more* validated than either photo instrument (FFMI and BF%
are real measurements, not learned or proxied).

---

## 2. Architecture — three tiers

```
INPUTS (new)                 PHOTO (existing, unchanged internally)
height · weight · BF%        CNN (clothed) | silhouette geometry (bare)
        │                                  │
        ▼                                  ▼
  TIER 0 · Objective spine          TIER 1 · Photo read
  FFMI + BF% leanness score         shape/distribution score
        │                                  │
        └────────────┬─────────────────────┘
                     ▼
        TIER 2 · Doctrine blend  →  headline
        + cross-check flag (silhouette vs claimed BF%)
```

### Tier 0 — Objective spine (new)

**Inputs.** Height (dual ft-in/cm — reuse the exact dual-unit input pattern already
shipped in `smvcalc.html`'s de-vibed Looks section), weight (dual lb/kg, same source),
and **BF% via a visual picker**, not a numeric field.

**BF% visual picker.** A sex-conditional grid of 7 reference silhouettes per sex
(m: 6–9% · 10–13% · 14–17% · 18–22% · 23–27% · 28–34% · 35%+;
f: 14–17% · 18–21% · 22–25% · 26–30% · 31–36% · 37–44% · 45%+), each tile an
**illustrated SVG silhouette** in the site's ivory/scarlet palette. Self-estimates skew
~5 pts low; picture-matching is far more honest than typing a number. Selecting a tile
sets BF% to the bucket midpoint. A small "I know my measured BF%" reveal offers a numeric
field for caliper/BIA/DEXA users, with the existing smart-scale accuracy caveat reused.

> **DP-1 — Picker artwork.** (a) Original SVG silhouettes (ship-safe, on-palette,
> CC-buildable — **recommended**); (b) sourced photo grid (more accurate matching,
> licensing burden, style clash). Rule: **(a) Original SVG silhouettes** — ivory/scarlet
> palette, CC-built, no sourced photos. (Parametric `bfSilhouetteSVG(sex, level)`, 7 tiles/sex.)

**Computation.**
- `leanMass = weight × (1 − bf)`
- `FFMI = leanMass(kg) / height(m)²`, then normalized `FFMI_adj = FFMI + 6.1 × (1.8 − h)`
  (Kouri height adjustment, so short/tall frames read on one scale).
- **Frame score (0–100):** sex-conditional curve on FFMI_adj.
  Male anchors (provisional, tunable like INCOME_ANCHORS): 16→15 · 18→40 · 20→65 ·
  22→88 · 23.5→97 · 25→100, plateau above (natural ceiling ≈ 25; beyond it is
  enhancement territory, credited but not extrapolated).
  Female anchors: 13→20 · 14.5→45 · 16→70 · 17.5→90 · 19→100.
- **Leanness score (0–100):** sex-conditional **inverted-U** on BF% — a `band` cue, not
  monotonic. Male band [9, 15] center 12; female band [17, 24] center 20.5; gaussian
  falloff both directions. This deliberately fixes the R1 monotonic-leanness defect from
  the Codex rubric review (an emaciated frame must not bank near-max leanness credit) —
  the objective tier gets the inverted-U the silhouette path couldn't honestly have.
- **Objective score** = weighted mean of frame + leanness.

> **DP-2 — Frame vs leanness weights inside Tier 0.** My draft: 45% frame / 55% leanness
> (leanness is the single strongest replicated cue per Tovée & Cornelissen, and BF% is
> the more reliable input). Rule: **45% frame / 55% leanness** (draft adopted as-is;
> `TIER0_W = { frame: 0.45, leanness: 0.55 }`, provisional/tunable).

All anchors and bands ship as named constants in the pure-core script block with the
`module.exports` test hook, matching the existing sacred-constants pattern.

### Tier 1 — Photo read (existing, internally unchanged)

CNN/geometry routing, gates, refusals, sex chain: all unchanged. What changes is *rank*:
the photo read becomes a component, not the sole headline, whenever Tier 0 inputs exist.

### Tier 2 — Doctrine blend

When both tiers are present:
`headline_raw = W_OBJ × objectiveScore + (1 − W_OBJ) × photoScore` (both 0–100), then
through the existing lens curves (contrast/gamma/scaleMax) exactly as `gradeBody` does
today — the lenses keep interpreting; only the measurement underneath changes.

Lens-differentiated weighting is allowed: Black Pill ("frame" lens) may weight the photo
higher (shape is the frame doctrine); Conventional may weight the objective spine higher
(health/leanness read).

> **DP-3 — The photo-tier bounds (the design's load-bearing decision).**
> How much can the photo move the objective base?
> - (a) **Fixed blend** — my draft: `W_OBJ = 0.60` both lenses, or BP 0.50 / conv 0.65.
>   Simple, transparent, auditable ("your numbers say 6.8; your photo moved it to 7.3").
> - (b) **Bounded modifier** — photo can shift the objective score by at most ±1.5 points
>   (post-lens). Harder cap, even more auditable, slightly more code.
> Rule: **(a) Fixed blend, `W_OBJ = 0.60` for both lenses** — no ±cap variant. Blend on the
> two pre-lens 0–100 scores, then one lens curve (`mapModelScore(blend/100, lens)`).

**Degradation ladder (page identity — photo-first with optional inputs, inverted-pyramid):**

| Present | Headline | Badge |
|---|---|---|
| photo + inputs | Tier-2 blend | "Hybrid — measured inputs × photo read" |
| photo only | current behavior, unchanged | current badges + a nudge: "Add height/weight/BF% for a stronger read" |
| inputs only | objective score alone | "Numbers-only read — add a photo for shape" |

> **DP-4 — Page identity.** The table above keeps photo-first (drop a photo, get the
> current experience, inputs upgrade it) — zero regression for existing users, and the
> inputs panel sits above the drop zone as step 1 of 2. Alternative: inputs-*required*
> (no score without height/weight/BF%), which is more anti-vibes but breaks the
> drag-and-drop-and-forget promise the page copy makes. My rec: photo-first as tabled.
> Rule: **Photo-first, exactly as tabled** — inputs optional (Step 1), the three-state
> degradation ladder as written; zero regression on the photo-only path (verified live).

### Cross-check — the receipts mechanism

When both a bare-physique silhouette and a claimed BF% exist, compare the silhouette's
*frontal* WHtR (its own units — never converted to circumference; that was the P0 bug)
against a provisional frontal-WHtR-by-BF%-bucket table. On gross mismatch (claimed
≤ 13% BF but frontal WHtR reads in the top bucket, or the inverse), render a
non-blocking flag: *"The silhouette and your stated body-fat disagree — one of them is
off (arms/clothing can corrupt the silhouette; self-estimates skew low)."*

> **DP-5 — Flag vs dampen.** (a) **Flag only** (recommended v1 — honest, no fake
> precision; the bucket table is reasoned, not photo-calibrated); (b) dampen the
> objective tier's BF% toward the silhouette read on mismatch (stronger receipts,
> but punishes users for photo artifacts until the table is calibrated). Rule: **(a) Flag
> only** — the cross-check never dampens or modifies any score (verified live: same score
> with the flag firing and not). `crossCheckBF` returns a display flag, not a score delta.

---

## 3. Persistence & interop

- New key `loveEquations.bodyInputs.v1` `{ heightCm, weightKg, bfPct, bfSource:
  'picker'|'measured', sex, ts }` — survives page switches like the shot does; Reset
  clears it (extend `bcResetAll`).
- `bodyScore.v2` **payload shape unchanged** (bp/cv/maxes/floor/source/sex/ts) so
  `composite-score.js` and the SMV calc import keep working untouched. Only additions:
  `source` gains a `'hybrid'` value and an optional `tier0:{ffmi,bf}` field (additive —
  `validScore()` ignores unknown fields). If review finds any consumer switching on
  `source`, bump to v3 with a v2 fallback read.
- SMV calc note (no code this phase): its Build question already imports
  `bodyScore.v2` cv — a hybrid-provenance score makes that import *stronger*; the
  source-aware build weight (1.6 import / 1.25 BMI-only) may later deserve a third tier
  for `'hybrid'`. Logged as follow-up, not built.

## 4. UI

Inputs panel as a new `bc-panel` above the drop zone: height + weight fields (smvcalc
dual-unit pattern), the BF% picker grid, and a one-line honesty note ("Numbers you can
verify: a tape, a scale, a mirror-match. Self-flattery in, garbage out."). Breakdown
panel gains a **Tier 0 section at the top** — FFMI (with the band marker treatment),
BF% leanness (inverted-U band), each with the same measured-vs-typical rendering as the
existing rows, plus the blend arithmetic spelled out: `0.60 × 71 + 0.40 × 64 = 68 → 7.1`.
The math being visible **is** the product.

## 5. Validation — the before/after protocol (locked earlier this session)

Fixed test set 15–30 photos (lean/heavy, muscular/skinny-fat, clothed/bare, good/bad
light, deliberate stress cases: selfie distortion, flexed vs relaxed, baggy clothes) +
per-photo height/weight/BF% ground truth where obtainable. Panel: 3–5 raters, blind,
independent; mean per photo. Metrics: (1) Spearman rank vs panel, before-calc vs hybrid;
(2) consistency — same person, 3 conditions, score swing (hybrid must beat photo-only);
(3) failure-direction audit — hybrid misses should cluster on "bad photo input", and the
cross-check flag should fire on the deliberately mismatched cases. Log the before-calc's
failure modes into mission-notes as boundary markers (why the hybrid exists).

## 6. Test plan (CC session exit criteria)

Node tests on the pure core: FFMI math (incl. Kouri adjustment edge cases), both anchor
curves monotonic within range and plateaued past ceiling, leanness inverted-U (both-side
falloff, sex-conditional), blend arithmetic, degradation ladder (all three presence
states), payload backward-compat (`validScore()` passes with and without `tier0`),
persistence round-trip, Reset clears inputs. Live (localhost:8753): all three ladder
states render with correct badges, picker persists across reload, cross-check flag fires
on a synthetic mismatch, composite + SMV import unaffected, zero console errors.
Uncommitted per standing rule; Jason tests on localhost.

## 7. Explicitly out of scope this phase

Face Calc code (Appendix A is a protocol), CNN retraining, SMV build-weight retune,
matchmaker interop, geometry band recalibration (resumes after the hybrid lands, tuned
against the blend).

Phase 3 candidate: frozen DINOv2/CLIP features + small regression head on Connor labels — same ONNX slot, targets the studio→real-photo drift; revisit after hybrid validation.

---

## Appendix A — Face Calc calibration protocol (Jason runs; no code)

The face model's `outMin/outMax = 1.5/4.5` is the conservative Codex interim — the
ledger flags it as softening scores you liked. Same fix the body model got: collect
10–15 varied clean frontal faces spanning the range, run each on localhost with
`?debug`, record the red `model raw output` line, set `outMin/outMax` to roughly the
2nd/98th percentile of the observed raws (or two-point fit against faces whose scores
you're confident in, as done for the body). One constants edit, revisable per batch.

> **DP-6 — Face recalibration timing.** Fold the constants edit into this CC session's
> diff (you supply the raws before the run), or defer to its own pass. Rule: **Defer** —
> Face Calc is fully out of scope this session; `face.html` and its constants were not touched.


---

# face-calibration-report.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/face-calibration-report.md`

# Face Calc — model-scale calibration report (session F1)

**Date:** 2026-07-06 · **Author:** Claude (Opus 4.8, ultracode) · **Status:** landed in the working tree, **uncommitted** (Jason reviews on `localhost:8753`).

## What changed (and only this)

`face.html` → `MODEL_CONFIG`, **two constants + their comment**:

| | before | after |
| --- | --- | --- |
| `outMin` | `1.5` | **`1.797`** |
| `outMax` | `4.5` | **`4.379`** |

Nothing else that scores changed — `PROFILES` (gamma/contrast/scaleMax/weights), `METRICS`, `MEASURES`, `gradeFace`, `mapModelScore`, tier thresholds, `SEX_MODEL_CONFIG` are byte-untouched. The two constants only relocate where the model's raw output maps onto `[0,1]` before each lens's curve:

```
norm = clamp01( (model_raw − outMin) / (outMax − outMin) )
displayed = mapModelScore(norm, lens)   // unchanged curve
```

This replaces the honest interim confession in the old comment — *"min-max off ~3 faces is fragile"* — with anchors derived from 400 real calibration faces run through the shipped pipeline. It mirrors the Body Calc recalibration of 2026-06-21 (studio percentiles → real-pipeline percentiles).

## The instrument (why the browser, not Python)

Calibration was measured through **`face.html`'s own debug Batch mode at `localhost:8753`** — the exact shipped pipeline: MediaPipe face box → 1.4× square crop with the 0.06 forehead nudge → 224² canvas resample → ImageNet-normalized tensor → `models/face-beauty.onnx`. The crop/framing is itself a distribution shift; calibrating a Python reimplementation would measure the wrong instrument (the Body Calc's *"framing dominates the raw"* lesson). The batch harness (`window.__lcBatchRun`) was driven from fetched image blobs via the connected Chrome browser; **`localStorage` was verified byte-identical before/after every batch** (the harness's own guard + an explicit snapshot compare).

## 1 · Data

**SCUT-FBP5500 v2** (Liang et al., 2018, arXiv:1801.06345) — 5500 frontal faces, each labelled with the **mean of 60 human beauty ratings** on a 1–5 scale, across four subsets: Asian-Female (**AF**, 2000), Asian-Male (**AM**, 2000), Caucasian-Female (**CF**, 750), Caucasian-Male (**CM**, 750). Non-commercial research use only. Obtained via the official GitHub repo's Google-Drive zip (`SCUT-FBP5500_v2.zip`, 171 MB, id `1w0TorBfTIqbquQVd6k3h_77ypnrvfGwf`), stored under `images/calibration-scut/` (**gitignored** — dataset never committed, mirroring `images/calibration/`). Acquisition + label table are reproducible: `tools/fetch_calibration_faces.py`. Label table (`labels.csv`) verified: 5500 rows, AF=2000/AM=2000/CF=750/CM=750, all images present on disk, images are 350×350 RGB.

## 2 · Sample (~400)

`tools/sample_face_calibration.py` (seed `20260706`, deterministic) → `sample_manifest.csv`: **400 images, 100 per subset**, each subset = **top-15 + bottom-15 by rating (forced tails)** + 70 random from the middle. By reason: 60 top15, 60 bottom15, 280 random. 400 unique filenames. Sample rating span **1.017 – 4.750** (full dataset tail-to-tail, by construction).

## 3 · Pipeline run

All 400 fetched (0 fetch failures) and scored through the batch harness.

**Refusal breakdown: 400 scored · 0 refused · 0 error.** SCUT's clean, centered frontal faces are ideal MediaPipe input, so the expected "no face found / too small" refusals did not occur — a documented outcome, not a gap. `model_raw` present on all 400. `localStorage` unchanged ✓. Raw export saved to `images/calibration-scut/batch_results.csv` (29,676 bytes, 400 rows).

`model_raw` distribution over the 400 scored: **min 1.322 · max 4.501 · mean 3.088 · sd 0.744.** Note the old `outMin=1.5` sat *above* the true minimum (3 faces were being floored) and `outMax=4.5` sat at the very top (only 1 face reached norm≈1) — the interim anchors mislocated the distribution.

## 4 · Analysis

`tools/calibrate_face_anchors.py` (DOM-free; stdlib + numpy; self-contained Spearman + percentile so an independent verifier can re-derive).

### (a) Proposed anchors — p2/p98 of `model_raw`

**outMin = p2 = 1.7967 → `1.797`**, **outMax = p98 = 4.3794 → `4.379`** (3 dp, matching Body Calc's convention). Clamping: old `1.5/4.5` → 3 low + 1 high; new → 8 low + 8 high (~2% each tail, by construction).

### (b) Spearman ρ — `model_raw` vs SCUT mean rating (demographic-skew disclosure)

| scope | n | Spearman ρ | Pearson r |
| --- | --- | --- | --- |
| **overall** | 400 | **0.933** | 0.945 |
| AF (Asian F) | 100 | 0.957 | 0.953 |
| AM (Asian M) | 100 | 0.941 | 0.961 |
| CF (Caucasian F) | 100 | 0.917 | 0.937 |
| CM (Caucasian M) | 100 | 0.905 | 0.928 |

The model tracks human ratings tightly and **consistently across all four demographic subsets** (ρ range 0.905–0.957) — no subset where the scale collapses. The Asian subsets edge out the Caucasian ones, plausibly reflecting SCUT's 2000/2000 vs 750/750 training weighting.

### (c) Contamination check → ρ is OPTIMISTIC

Our `models/face-beauty.onnx` **is** the Gustrd `resnet18_py3.pth` SCUT-FBP5500 checkpoint (documented in `models/README.md`, the conversion recipe). The dataset ships an official split (`train_test_files.zip`), but **no holdout manifest is recorded in this repo or alongside our checkpoint** identifying which images Gustrd held out. Per the pre-registered rule, all 400 sampled images are therefore treated as **training-seen**, and the ρ above is an **in-distribution upper bound (optimistic)**.

Context for the size of the optimism: the canonical SCUT-FBP5500 ResNet-18 benchmark reports **test-set Pearson ≈ 0.878** on the official 60/40 split (Liang et al., 2018). Our in-distribution Pearson (0.945) exceeds that by ~0.07 — that gap *is* the contamination inflation. Even the pessimistic held-out figure (~0.88) clears the trustworthiness bar comfortably.

**The anchors are unaffected by contamination** — they only locate the output distribution (a percentile of `model_raw`), which is a property of the model's outputs on realistic inputs regardless of train/test membership. Only the *validation claim* (ρ) carries the caveat.

### (d) Before/after — displayed headline at `model_raw` percentiles

Displayed Black Pill (PSL /8.6) | Conventional (/10), old `1.5/4.5` vs new `1.797/4.379`:

| pct | model_raw | OLD BP | OLD CV | NEW BP | NEW CV |
| --- | --- | --- | --- | --- | --- |
| p5 | 2.004 | 1.44 | 2.17 | **1.10** | **1.45** |
| p25 | 2.604 | 3.12 | 4.27 | **2.53** | **3.64** |
| p50 | 2.846 | 4.12 | 5.22 | **3.58** | **4.72** |
| p75 | 3.838 | 7.85 | 8.74 | **7.92** | **8.83** |
| p95 | 4.313 | 8.53 | 9.80 | **8.59** | **9.94** |

The recalibration **lowers the low-to-mid range** (raising `outMin` 1.5→1.797 pushes a median face from BP 4.12 → 3.58) and barely moves the top (raising the high tail slightly as `outMax` drops 4.5→4.379). Net effect: the page was **over-scoring average faces**; the new anchors seat the median SCUT face — an ordinary person — at a below-average headline, which is the honest reading.

## 5 · Pre-registered thresholds (report-only; Jason rules on any action)

| threshold | met? |
| --- | --- |
| **ρ ≥ 0.6** → scale trustworthy as displayed | **YES** — overall ρ = 0.933 (optimistic); even the ~0.88 held-out benchmark clears it |
| 0.4 ≤ ρ < 0.6 → flag one-decimal display may overstate resolving power | n/a |
| ρ < 0.4 → land anchors, flag model discrimination | n/a |

**Finding: the scale is trustworthy as displayed** against the pre-registered bar. This session made **no** change to display precision, tiers, or copy (authorized to touch exactly the two constants). If Jason wants the contamination caveat surfaced to users, that's a separate copy decision — flagged, not acted on.

## 6 · The landed constants

`face.html` `MODEL_CONFIG` now reads:

```js
outMin: 1.797, outMax: 4.379,  // SCUT-FBP5500 p2/p98 of model_raw through the shipped browser
// pipeline (crop→model), 2026-07-06, N=400 scored / 0 refused; overall Spearman ρ=0.93
// (in-distribution → optimistic: this .onnx is the Gustrd SCUT checkpoint, canonical
// held-out ResNet18 PC≈0.88). See md/face-calibration-report.md
```

## Verification (every claim cites file / CSV row / pasted output)

**Port cross-check (analysis integrity).** The `mapModelScore` port in `calibrate_face_anchors.py` was checked against the harness's *own* `bp`/`cv` output under the OLD anchors on all 400 rows: **bp exact-match 373/400, cv 374/400, max |diff| 0.01** — the ~27 mismatches are all a single 2-dp rounding boundary (the harness computes from full-precision `model_raw`; the CSV logs it to 3 dp). The port faithfully reproduces the page's scoring curve, so the before/after "after" column is trustworthy.

**V1 — independent recompute (separate code, no shared functions).** A verification agent re-derived p2, p98, and ρ (overall + per subset) from `batch_results.csv` + `labels.csv` with its own CSV loader, own numpy percentile call, and a from-scratch average-tie Spearman. All **7/7 numbers matched to 4 dp** (p2 1.7967, p98 4.3794, ρ overall 0.9333, AF 0.9571, AM 0.9412, CF 0.9165, CM 0.9049). It independently confirmed 400 scored / 0 non-scored, clean join (no unmatched filenames), model_raw min/max 1.3220/4.5010, and that tie-handling is genuinely exercised (78 tied points across 38 values). **VERDICT: PASS.**

**V2 — live `:8753` spot-check (page shows exactly norm→curve→displayed under new anchors).** Three images re-scored through the reloaded (edited) page; `model_raw` was **identical** to the pre-edit run (1.322 / 2.783 / 4.033 — proving the edit touched only the display mapping, not the model path). Hand-computed `norm → lens curve → js_round2` under `1.797/4.379` matched the page's displayed bp/cv **to the penny** for all three:

| image | model_raw | norm | page BP / hand | page CV / hand |
| --- | --- | --- | --- | --- |
| AF1986 | 1.322 | 0.000 (floored) | 1.00 / 1.00 ✓ | 1.00 / 1.00 ✓ |
| CF235 | 2.783 | 0.382 | 3.29 / 3.29 ✓ | 4.44 / 4.44 ✓ |
| AF1973 | 4.033 | 0.866 | 8.32 / 8.32 ✓ | 9.39 / 9.39 ✓ |

**VERDICT: PASS.**

**V3 — regression (single-shot / persistence / composite / console / localStorage).**
- Single-shot: drove one image through the real file-input path → headline rendered **"8.3 PSL"** (live `model_raw` 4.0326 → new-anchor BP 8.32). ✓
- Persistence: `loveEquations.faceScore.v2` updated with the new-anchor payload `{bp:8.320, cv:9.393, bpMax:8.6, cvMax:10, floor:1, source:"model", sex:"f", ts}`. ✓
- Face × Body composite: `leComposite.saveFace` writes `FACE_KEY = loveEquations.faceScore.v2` (`js/composite-score.js:182`), which the composite's `overall()` reads — so it now carries new-anchor data. (`compositeLens.v1` correctly unchanged; it stores only the lens-toggle preference, `js/composite-score.js:20,37`.) ✓
- Console: zero errors from the change; the only console message is MediaPipe's benign `INFO: Created TensorFlow Lite XNNPACK delegate for CPU`, pre-existing on every load. ✓
- `localStorage`: batch mode never persisted (`ls_unchanged` true in V2); the single-shot's intentional writes were then **fully restored** from a pre-test snapshot (extra `faceShot.v1` removed, `faceScore.v2` and all 10 keys restored exactly). The user's saved state is untouched. ✓

**VERDICT: PASS.**

## Reproducibility

```bash
python tools/fetch_calibration_faces.py         # download + extract SCUT-FBP5500 → images/calibration-scut/
python tools/sample_face_calibration.py         # deterministic 400-image sample → sample_manifest.csv
# run the sample through face.html Batch mode at localhost:8753 (drive __lcBatchRun with the sampled blobs),
# export → images/calibration-scut/batch_results.csv
python tools/calibrate_face_anchors.py          # anchors, ρ, before/after → anchor_analysis.json + joined_analysis.csv
```

## Appendix — analysis stdout (verbatim, negative results preserved)

```
N scored = 400 | N refused/error = 0
model_raw: min=1.322 max=4.501 mean=3.088 sd=0.744

(a) PROPOSED ANCHORS  outMin=p2=1.797  outMax=p98=4.379   (old 1.5/4.5)
    faces clamped (norm hits 0/1):  OLD 3 low + 1 high  |  NEW 8 low + 8 high (~2% each tail by construction)

(b) SPEARMAN rho (model_raw vs SCUT mean rating):
    OVERALL  rho=0.933  (Pearson r=0.945, n=400)
    AF  rho=0.957  (Pearson r=0.953, n=100)
    AM  rho=0.941  (Pearson r=0.961, n=100)
    CF  rho=0.916  (Pearson r=0.937, n=100)
    CM  rho=0.905  (Pearson r=0.928, n=100)

(c) CONTAMINATION: face-beauty.onnx == Gustrd SCUT-FBP5500 checkpoint (models/README.md);
    no holdout manifest recorded in-repo/alongside the model -> ALL images treated as training-seen.
    => rho above is OPTIMISTIC (in-distribution upper bound). Anchors unaffected.

[port check] mapModelScore port vs harness bp/cv under OLD anchors over 400 rows:
    bp exact-match 373/400 (max |diff| 0.01); cv exact-match 374/400 (max |diff| 0.01)
    (tiny mismatches expected only at a 2-dp rounding boundary, since raw is logged to 3 dp)

(d) BEFORE/AFTER at model_raw percentiles (displayed headline BP | CV):
    pct   raw    | OLD 1.5/4.5  BP    CV   | NEW 1.797/4.379  BP    CV
    p5    2.004 |             1.44  2.17 |                  1.10  1.45
    p25   2.604 |             3.12  4.27 |                  2.53  3.64
    p50   2.846 |             4.12  5.22 |                  3.58  4.72
    p75   3.838 |             7.85  8.74 |                  7.92  8.83
    p95   4.313 |             8.53  9.80 |                  8.59  9.94

(5) PRE-REGISTERED THRESHOLDS (report-only; Jason rules on any action):
    overall rho=0.933 (optimistic)  ->  rho >= 0.6 -> scale trustworthy as displayed
```


---

# smv-recalibration-spec.md

> Merged verbatim 2026-08-07 · pre-merge file: `git show 9109c97:md/smv-recalibration-spec.md`

# SMV Calculator Recalibration — Implementation Spec (v7)

This spec is the complete design contract for rebuilding the quiz in `smvcalc.html`.
It was produced in a design session with the owner and is self-contained: an implementer
should need this document plus the existing code, nothing else. Where this spec is silent,
preserve existing behavior.

## 1. Design philosophy (governs every judgment call)

1. **Date-legibility test.** Prefer questions a person would plausibly be asked, or sized
   up by, on an actual date: job title, car, kids, education, "how long was your longest
   relationship." If a question wouldn't come up in real mate evaluation, it's suspect.
2. **Cold numbers over vibes.** No self-assessments of one's own quality. Where a judgment
   is unavoidable, **decompose it into observable facts** (checklists of things that did or
   didn't happen) and compute the judgment from those.
3. **Farming resistance.** Short-window conversion metrics can be farmed by lowering the
   bar; long-horizon retention metrics cannot. Prefer "kept for years" over "converted last
   month."
4. **Absence of a bonus is not a deficit.** The modal/median case scores ~5.0–5.5, never
   low. Low scores are reserved for actively negative facts (bad reputation, felony,
   crushing expense ratio). This principle already exists in the code (followers question).
5. **House style.** Every anchor set and score array gets a code comment explaining the
   percentile reasoning, in the same voice as the existing comments. Keep the existing
   `count`-question machinery (log/linear anchors, sex forks via `anchors: {m, f}` and
   `weights: {m, f}`, `allowNA`/`naIndex` skips, age adjustment) and extend it — do not
   invent a parallel system.
6. **Charm is defined as residual leverage**: what you pull *beyond what your Looks alone
   predict*. Every Charm question is a view of that residual.

**Invariants to preserve:** total question count stays **30** (Looks 6, Money 6, Status 6,
Charm 5, Exposure 7); landing copy "30 questions, no filler" stays true; Profile B manual
sliders, lenses, tiers, import from Face/Body calc, and state persistence keep working.
Update the `FACTORS` `desc`/`lever` copy for Status (now: legible markers — fame, title,
education, record) and Charm (now: retention and leverage — the residual definition).

---

## 2. LOOKS — 6 questions

Q1 sex, Q2 age, Q3 height, Q4 build, Q5 face: **unchanged.**

**Q6 — Presentation, de-vibed.** Replace the 5-option self-rating with a checklist of
objective items; score = count checked. New question type: `checklist`.

> **How many of these are true of you?**
> Sub: "Check what is factually true — each is a thing you do or own, not a judgment."

Items (one sex-forked item):
1. My hair is cut or maintained on a regular cadence (roughly every 4–6 weeks, or a deliberately maintained style)
2. My everyday clothes actually fit — fitted or tailored, not just clean
3. I have a daily skincare routine beyond soap
4. My teeth are straight/white or under active care (whitening, aligners, regular dental work)
5. I wear a fragrance regularly
6. (m) My facial hair is deliberately groomed or deliberately clean-shaven / (f) I have a makeup routine I'd call intentional
7. I own at least one sharp, occasion-ready outfit that I could wear tonight
8. Someone complimented my style or appearance in the last month

Scoring (count → score), weight **0.8** (unchanged):
`anchors: [[0, 2.5], [2, 4.0], [4, 5.5], [6, 7.5], [8, 9.0]]`
Comment rationale: modal adult checks 3–4 → median; all eight ≈ top 5%.

---

## 3. MONEY — 6 questions

**Q7 — Net worth: keep metric + age adjustment, fix the UX.** Same scoring as today.
The single input becomes a 4-line mini-calculator summed live on screen:
- Cash, savings, and investments (including retirement accounts)
- Home: rough market value minus what you owe (0 if you don't own)
- Other big assets (vehicles, business equity)
- Minus: total debts (loans, cards, student debt)
The summed total (can be negative) is the answer and flows into the existing curve. Keep a
"just enter the total" affordance for people who know their number.

**Q8 — Income: add an annual/monthly toggle.** Monthly entry × 12 normalizes to annual
before the existing curve. Store the monthly figure — Q12's scoring needs it.

**Q9 — CUT the emergency-expense question** (it triple-counts net worth + income).
Replace with the car question (weight **0.90**):

> **What do you drive?**
> Sub: "The wealth marker people actually read. Judged as it presents, not by the loan behind it."

Options and scores:
- No car — **metro-adjusted**: if the Q25 metro answer ≥ 4,000,000 (dense, transit-rich), score 5.5 (car-free is neutral in NYC); otherwise 3.5.
- Older economy car / beater → 4.5
- Average commuter car → 5.5
- New or nice mid-range → 6.8
- Luxury brand → 8.0
- Exotic / collector → 9.3
This is the second cross-question adjustment in the codebase (net worth × age is the
precedent) — implement it the same way, at scoring time.

**Q10 housing ladder, Q11 career stage: unchanged.** (Career stage stays even though
Status gains a job-title question: Q11 is the Money-side *ladder level* proxy; Status
scores the *prestige of the occupation*. Do not "fix" this overlap.)

**Q12 — Obligations become a cold ratio.** Replace the 5-option feelings ladder with:

> **What are your total monthly expenses?**
> Sub: "Everything that leaves your account in a normal month — housing, debt payments, dependents, subscriptions, food, all of it. Scored against your income as your disposable share."

Score = **disposable share** = 1 − (monthly expenses ÷ monthly income). Weight **0.85**.
Anchors on the share: `[[<=0, 2.0], [0.05, 4.5], [0.15, 5.5], [0.30, 7.0], [0.50, 8.5], [0.70, 9.5]]`
(US personal saving rate ~5% → just under median; 50% savings rate ≈ top few percent.)
Edge cases: income = 0 with any expenses → floor 2.0; both 0 → treat as unanswerable, score 5.5 soft.

---

## 4. STATUS — 6 questions, full rebuild

The section's new philosophy: **legible markers strangers actually read**, not behaviors
that correlate with status. All six old questions are replaced (old Q13–Q18 delete
entirely; their intents are either absorbed here or relocated — invitations went to
Exposure, romantic pull lives in Charm).

**S1 — Fame, as a count.** Weight **1.15**, type `count`, log scale.

> **Roughly how many people who have never met you know who you are?**
> Sub: "Fame collapsed to a number. Zero is the normal case, not a failure. Count real name/face recognition — a scene, a school, a market, an audience."

`anchors: [[0, 5.0], [500, 6.0], [5000, 7.0], [25000, 7.8], [100000, 8.5], [1000000, 9.5], [10000000, 10]]`
Plus a checkbox: **"My name currently works against me where I'm known"** — if checked,
the question scores 2.5 regardless of reach (reputation compounds slowly, forfeits fast —
kept from the old Q13's floor).

**S2 — Following, itemized by platform.** Weight **0.95** (up from 0.75 — the platform
decomposition removes the noise that justified the old low weight). New input: a grid of
per-platform count boxes. Effective reach = Σ(count × coefficient), displayed live so the
math isn't a black box, then fed to the existing followers anchors
`[[0, 4.8], [200, 5.5], [1000, 6.2], [5000, 7.0], [20000, 7.9], [100000, 8.8], [1000000, 10]]`.

| Platform | Coefficient | Reasoning (comment in code) |
|---|---|---|
| YouTube | 1.0 | Subscription is deliberate; durable, monetizable audiences |
| Twitch | 0.6 | High engagement per active viewer, cheap follows |
| Instagram | 0.45 | Mixed real audience and drive-by follows |
| Twitter/X | 0.4 | Similar, slightly lower engagement per follower |
| Snapchat | 0.3 | Mostly personal-network reach |
| TikTok | 0.2 | Algorithmic feed makes follows the cheapest of all |
| Other (newsletter, podcast, etc.) | 0.5 | Unknown mix, middle coefficient |

**S3 — Job title.** Weight **1.30**, the section anchor. Prestige only — income variance
within a profession is deliberately NOT captured here (Money owns it; see Q11 note).

UI: type-ahead search box over a curated list. **The implementer authors the list**:
~150–200 titles, each `{title, score, keywords[]}`. Calibration contract:
- Scores follow occupational-prestige-style ratings mapped to the quiz's 0–10 curve with
  the median occupation ≈ 5.0–5.3. Calibration points: physician/surgeon 9.0–9.3,
  lawyer 8.0, engineer/software engineer 7.3–7.5, professor 7.8, registered nurse 6.6,
  teacher 6.4, police officer 6.0, electrician/plumber 5.8, office administrator 5.0,
  retail associate 3.8, unemployed 3.0.
- Include **seniority-differentiated entries** where the distinction is socially legible:
  "Attorney (associate)" vs "Law firm partner"; "Resident physician" vs "Attending
  physician"; "Software engineer" vs "Engineering manager" vs "CTO / VP Engineering";
  business owner tiers (solo/small vs established company).
- Synonyms matter more than count: "attorney"→lawyer, "software dev"/"programmer"→software
  engineer, "cop"→police officer, etc. Match case-insensitively on substrings of title+keywords.
- Cover the common-answer mass: medicine, law, engineering/tech, finance, education,
  trades, service/retail/hospitality, transport/logistics, government/military, arts/media,
  sports/fitness, science, agriculture, care work, students, unemployed/homemaker.

**Fallback (mandatory):** if no match, a 6-band self-placement ladder:
student or unemployed 3.8 / service & manual 4.5 / skilled trade or clerical 5.5 /
professional 6.5 / licensed professional or senior management 7.5 / executive or elite professional 8.5.

**S4 — Education: degree × institution tier.** Weight **0.85**. Two-step on one screen:
degree level, then (bachelor's and above only) institution tier.

Degree base scores: no HS diploma 3.0 / high school 4.5 / associate or some college 5.2 /
bachelor's 6.2 / advanced or professional degree 7.2.

Institution tier modifier — at bachelor's level: elite/household-name +1.0, selective/
well-regarded +0.5, typical +0, low-signal (open-enrollment, for-profit) −0.3. At the
advanced-degree level the modifier halves (+0.5 / +0.25 / 0 / −0.15) — for an MD or JD the
title does the talking. Tier labels are self-placed; the four buckets are common knowledge.

**S5 — Kids.** Weight **1.00**. Number of children (0 / 1 / 2 / 3+); if >0, a custody
sub-select (full-time / shared / non-custodial). Sub-text clarifies this measures market
position, not finances (Money Q12 already carries the budget impact — different causal
channel, not double-counting).

Scoring: no kids = 5.5 (modal for the younger bands — unremarkable, not impressive).
Penalty scales with count, is reduced for non-custodial (~40% of the penalty) and shared
(~70%), and is **age-graded** using the existing age answer (net-worth adjustment is the
precedent): full penalty at 18–29, ~75% at 30–34, ~55% at 35–39, ~35% at 40–49, ~15% at 50+.
Full-penalty magnitudes at 18–29, full custody: 1 kid → 3.0, 2 kids → 2.5, 3+ → 2.0
(i.e., subtract the penalty-scaled gap from 5.5). Worked example: 42yo, 1 kid, shared
custody → 5.5 − (2.5 × 0.35 × 0.7) ≈ 4.9. Implement sex-neutral, with a code comment
noting the sex-asymmetric option (`anchors: {m,f}` machinery supports it) was considered
and deferred.

**S6 — Criminal record.** Weight **0.90**. Downside-only.

> **What does your record look like?**
> Sub: "Background checks are a dating-app feature for a reason. Traffic tickets and fines count as clean."

Options: Clean (including tickets/fines) → 5.5 / Misdemeanor → 4.0 / Felony → 2.0 /
Multiple felonies, or currently in the system (probation, parole, pending charges) → 1.2.

---

## 5. CHARM — 5 questions, full rebuild

Old Q19 (conversation engagement) and Q23 (told you're fun): **cut** (vibes).
Old Q20/Q21 (funnel conversions): **cut** (farmable by lowering the bar).
Old Q22: **reframed** into the orbit question. Old Q24 (invitations): **moved to Exposure** unchanged.

### The partner-tier component (reusable)

Several questions classify another person as above / at / below the user's level **without
any self-assessment**: the user's own level is the quiz's computed Looks factor score
(available at scoring time), and the partner's level is decomposed into observables.
Partner checklist (0–4 checked):
- Friends or strangers commented on their looks unprompted
- They got approached or hit on while you were together
- They had visibly abundant options when you met them
- People openly wondered how you pulled them

Partner estimate = 4.0 + 1.5 × (items checked) → 4.0–10.0. Differential = estimate −
user's Looks score. **Above** if ≥ +1.0, **at level** within ±1.0, **below** if ≤ −1.0.
For the C3 distribution question the checklist appears as calibration guidance in the
sub-text rather than being run per-person.

**C1 — Longest committed relationship.** Weight **1.25**. Count (months; UI offers
years/months entry). Age-adjusted like net worth. Skippable never — 0 is a real answer.
Anchor sets by age band (comment the reasoning; interpolate between bands):
- 18–24: `[[0, 4.5], [6, 5.3], [12, 6.0], [24, 7.0], [48, 8.0]]`
- 25–29: `[[0, 3.8], [12, 5.0], [24, 5.8], [48, 7.2], [84, 8.3]]`
- 30–39: `[[0, 3.0], [12, 4.3], [24, 5.5], [60, 7.5], [120, 8.7]]`
- 40+:   `[[0, 2.5], [24, 4.3], [60, 6.0], [120, 8.0], [240, 9.0]]`
Plus the partner-tier tag ("that person, relative to you" — the checklist): above +0.8,
at level +0, below −0.3, applied after the curve, clamped 1–10.

**C2 — Orbit, decomposed into active vs peak.** Weight **1.30**. Two count boxes:
- **Active orbit now**: people you're actively dating, talking to, or who show clear ongoing interest.
- **Peak orbit ever (your PB)**: the most that was ever simultaneously true, plus a recency
  select: within ~2 years (×1.0) / 2–5 years ago (×0.85) / longer ago (×0.7).
Anchors (both boxes, same curve): `[[0, 3.5], [1, 5.0], [2, 5.8], [3, 6.5], [5, 7.5], [8, 8.5], [12, 9.5]]`
Question score = 0.65 × active-score + 0.35 × (PB-score × recency decay). PB rescues the
situationally suppressed (just moved, just exited a long relationship) and marks the
demonstrated ceiling; active dominates because SMV is a current read.

**C3 — Punching above your weight (the residual, directly).** Weight **1.35**. Skippable
(`allowNA`: "Fewer than ~10 people dated recently — skip"). Three boxes summing to ≤10:
of the last ~10 people you dated — how many were **above** your level, **at** your level,
**below**? Sub-text carries the partner-checklist bullets as the definition of "above"
(and notes: leverage from money/fame counts as leverage — the outcome is the signal).

Scoring (base 5.5, asymmetric by design — the owner's rule: *below is only subtractive
when above and at-level are lacking*):
- above_share = above/answered: +0 at 0%, +1.0 at 20%, +2.0 at 40%, +3.0 at ≥60% (interpolate)
- if above_share < 10% AND at_share < 30% (i.e., the pattern is mostly-below): −1.5
- clamp 1–10.

**C4 — Exclusivity retention.** Weight **1.10**. Count 0–5, skippable ("Fewer than ~5
such people — skip"):

> **Of the last ~5 people you dated more than a few times, how many wanted to make it exclusive or keep it going?**
> Sub: "First dates can be farmed; people who know you wanting more of you cannot. Count clear signals — asked for exclusivity, wanted to continue, pushed for more."

`anchors: [[0, 3.0], [1, 4.5], [2, 5.5], [3, 6.8], [4, 8.0], [5, 9.0]]`
Checkbox: "at least one of these was above my level" (checklist definition) → +0.5, clamp 10.

**C5 — Friend retention.** Weight **1.00**. Count:

> **How many friends have you kept for 5+ years?**
> Sub: "Charm outside the romantic arena, and the hardest number here to farm — the only way to score is to have been worth keeping around for half a decade."

`anchors: [[0, 3.0], [1, 4.3], [3, 5.5], [5, 6.5], [8, 7.5], [12, 8.5], [20, 9.5]]`
(Median adult ≈ 2–4 long-tenure friends → 3 = median.)

---

## 6. EXPOSURE — 7 questions

**E1 — Metro size (old Q25): unchanged.**

**E2 — New people met (old Q26): split into two boxes** — met **in person** vs **met
online** (per month). Effective = in-person + 0.6 × online (an IRL exchange is a richer
at-bat); both numbers displayed, effective figure shown live. Same anchors as today on the
effective count. Weight 1.35 (unchanged).

**E3 — Venues (old Q27): becomes a checkbox grid.** Score = count checked, existing
anchors `[[0, 3.2], [1, 5.0], [2, 6.2], [3, 7.3], [5, 8.5], [8, 9.5]]`, weight 1.05.
Venues: gym or fitness classes / hobby clubs or classes / sports leagues / nightlife or
bars / religious community / volunteering / coworking or work-adjacent scenes / regular
friend-group gatherings / other recurring scene (+1 per "other", capped at 2). Keep the
"same 12 people doesn't count" rule in the sub-text.

**E4 — Dating apps (old Q28): kill the full fork.** Everyone gets **two boxes**:
outbound (first messages / intent-driven likes sent per week) and inbound (likes +
messages arriving per week). Weight 1.10. Sex-specific anchors per box; score =
sex-weighted blend: men 0.7 × outbound-score + 0.3 × inbound-score; women 0.3 / 0.7.
- Outbound, men (existing): `[[0, 3.0], [3, 4.5], [10, 5.5], [25, 6.8], [60, 8.0], [150, 9.2]]`
- Inbound, women (existing): `[[0, 2.5], [10, 4.5], [30, 5.5], [75, 6.8], [200, 8.2], [500, 9.3]]`
- Inbound, men (new — rare, thus informative): `[[0, 5.0], [3, 6.0], [10, 7.0], [30, 8.2], [100, 9.3]]`
- Outbound, women (new — initiative is pure upside): `[[0, 5.0], [3, 6.5], [10, 8.0], [30, 9.3]]`
"Not on apps" = 0 in both boxes.

**E5 / E6 — Approaches and inbound interest (old Q29/Q30): add a unit toggle** — per
week / per month / per year, normalized to monthly (year ÷ 12, week × 4.33) before the
existing sex-specific anchors. Everything else (anchors, mirrored sex weights) unchanged.
This makes "4 per year" representable, which today rounds to a false 0.

**E7 — Unsolicited invitations (old Q24, relocated from Charm).** Text, sub, anchors
unchanged; `factor` becomes 4; weight **0.85** within Exposure (it's the softest exposure
signal).

---

## 7. Validation panel — the celebrity pressure test

Create `tests/smv-panel.mjs`, runnable with `node tests/smv-panel.mjs`: it extracts the
scoring logic from `smvcalc.html` (regex-slice the inline `<script>` and evaluate in a VM,
or refactor the scoring core into a shared block the page and the test both use — the
implementer's choice, but the page must remain a single self-contained HTML file), runs
the fixture profiles, prints a table (per-factor scores + total + tier per fixture), and
**exits non-zero when any expectation band is violated**. Fixtures are permanent
regression fixtures — future recalibrations rerun this panel.

Fixtures (fill inputs with real public figures where public; Charm inputs for celebrities
are estimates — mark them as such in comments):
1. **Ceiling** — a top-tier male celebrity (e.g., LeBron James-class: max fame count,
   9-figure net worth, elite following). Expect total ≥ 9.0, tier Elite.
2. **Median** — 35yo teacher, 1.5M metro, $58k income, modest savings, bachelor's typical
   school, clean record, no kids, 2-year longest relationship, small orbit, couple of
   venues, light app use. Expect total 4.6–5.8, tier Average.
3. **Rich-anonymous** — 45yo, $5M net worth, $800k income, luxury car, own outright,
   but median looks, zero fame/following, median charm/exposure. Expect 6.0–7.5 with the
   factor breakdown pointing at Status/Exposure as bottlenecks, never Elite.
4. **Famous-broke** — 24yo viral TikToker: 2M TikTok (note: ×0.2 = 400k effective),
   100k strangers know her, negative net worth, no car, rents with roommates. Expect
   5.8–7.3, Money clearly the bottleneck.
5. **Looks-only** — 26yo model-tier looks (face 9+, build 9, tall), everything else
   median-or-worse. Expect 5.5–7.0, not Elite.
6. **Floor** — 29yo: unemployed, felony record, negative net worth, no car (small town),
   lives with parents, no degree, 2 kids full custody, no relationship over 3 months,
   empty orbit, tiny metro, no venues, no app activity. Expect total ≤ 3.2, tier Low SMV.
7. **The Davidson case** — median-to-modest looks, real fame (millions know him), solid
   money, C3 answered mostly-above, big orbit PB. Expect Charm to read as a top factor and
   total 7.5+, demonstrating the residual-leverage design works.

Also assert the two structural properties: (a) an all-median-inputs profile lands within
±0.5 of 5.5 total; (b) per-sex Exposure weight totals remain equal (the E4/E5/E6 sex
weights must still balance, as old Q28–Q30 did).

## 8. Out of scope — do not touch (amended by §9: TIERS boundaries are now IN scope)

Face Calc / Body Calc import machinery (but their imported values keep flowing into Q4/Q5
and the Looks score the partner-tier component reads), Profile B sliders and lenses,
TIERS boundaries and copy, other pages, and md/ docs other than this file. Preserve
localStorage persistence across the new question types (answers serialize; bump the
storage schema version if the shape changes so stale v6 answers don't corrupt v7 state).

---

## 9. v7.1 amendment — Status modifiers and tier rescale

Owner review of the v7 panel found the Status ceiling (~8.0) artificial: a 9+ Status must
be achievable for the metric to be legitimate, zero kids / clean record should read as a
*slight upside* rather than dead neutral, and the bottom end should extend lower. This
section supersedes §4 S5/S6 scoring, §7 fixtures 1 and 6, and §8's TIERS lock.

### 9.1 S5 (kids) and S6 (record) become post-average modifiers

Both remain questions #5 and #6 of the Status section in the UI, but they no longer enter
the weighted average. Status = weighted mean of S1–S4 only (weights 1.15 / 0.95 / 1.30 /
0.85), then + kids modifier + record modifier, clamped to [1, 10]. The results screen
still shows both as line items, displayed as their ± adjustment.

**Kids modifier:** no kids → **+0.2**. Otherwise a subtraction:
base (full custody, ages 18–29): 1 kid −2.5, 2 kids −3.0, 3+ −3.5;
× custody factor (full 1.0 / shared 0.7 / non-custodial 0.4);
× age grade (18–29: 1.0 / 30–34: 0.75 / 35–39: 0.55 / 40–49: 0.35 / 50+: 0.15).
Worked example: 42yo, 1 kid, shared → −(2.5 × 0.35 × 0.7) ≈ −0.6. Still sex-neutral with
the deferred-asymmetry comment.

**Record modifier:** clean (incl. tickets/fines) → **+0.2**; misdemeanor → **−1.5**;
felony → **−3.5**; multiple felonies or currently in the system → **−4.5**.

Consequences (the point of the change): max Status ≈ 9.3–9.7 (9+ achievable), min Status
reaches the clamp floor of 1.0, and the two downside questions no longer compress the
range of the four marker questions.

### 9.2 TIERS rescale

TIERS boundaries may now be changed (labels, colors, and desc copy stay). Recalibrate the
boundaries empirically against the panel so that: the Ceiling fixture lands **Elite**, the
Floor fixture lands **Low SMV**, the Median teacher stays **Average**, and the lopsided
fixtures keep their current tiers. Expected landing zone: Elite ≈ ≥9.0, Low SMV ≈ ≤2.9–3.0,
with the middle boundaries nudged only if a fixture's tier would otherwise change. Keep
six tiers.

### 9.3 Panel updates

- Fixture 1 (Ceiling): expect total ≥ 9.0 **and tier Elite** (now honestly enforced).
- Fixture 6 (Floor): expect total ≤ 3.0 **and tier Low SMV**.
- New structural assertion: a max-everything probe profile must reach **Status ≥ 9.0**
  and the Floor-or-worse probe must reach **Status ≤ 1.5** — the ceiling/floor are real.
- All other fixture bands unchanged; re-verify they still pass (the +0.4 clean-profile
  drift on Status will move totals slightly — adjust only the spec-documented bands if a
  fixture sits on a boundary, and log any band you touch).

---

## 10. v7.2 amendment — hiatus windows, invitations cut, body fat

Owner review of the built v7.1 quiz. Four changes; total question count stays 30
(Looks becomes 7, Exposure becomes 6).

### 10.1 E2 (new people met) — reference-window select with staleness decay

A dating hiatus currently zeroes this question unfairly. Both count boxes (in person /
online) gain a single shared window select — "these numbers describe:"
- **A typical month right now** — ×1.0
- **A typical month within the last ~2 years** — ×0.95
- **My last active stretch, 2–5 years ago** — ×0.85
- **My last active stretch, longer ago** — ×0.7
The decay multiplies the effective count before the anchors (same philosophy and similar
constants as the Personal Best recency decay in Charm's orbit question — stale activity
counts, but not at par). Sub-text: answer from your last genuinely active period; the
window tells the quiz how current that evidence is.

### 10.2 E7 (unsolicited invitations) — CUT entirely

Owner rationale, recorded: invite volume is a life-stage artifact (high school/college),
not an adult market signal — even high-status adults are not swamped with invitations.
It was already the weakest-weighted Exposure question and carries a flat sex weight, so
removing it cannot unbalance the per-sex Exposure totals (re-assert this in the panel).

### 10.3 New Looks question — body fat %

Placed between build and face (section order: sex, age, height, build, **body fat**, face,
presentation checklist). Type `count`, unit '%', weight **1.0**. Imported from the Body
Calc when available, exactly like face imports from the Face Calc; otherwise an honest
self-estimate flagged as soft. Sex-specific anchors (piecewise, non-monotonic — score
peaks lean and declines at both extremes), house-style comments required. Calibration
points: male peak 10–12% → 9.0, male median ~25% → 5.2, 38%+ → ≤2.8; female peak
18–21% → 9.0, female median ~38% → 5.2, 50%+ → ≤2.5. Median is median even when the
median is soft.

**Build (Q4) weight drops 1.6 → 1.4** so the body (build + body fat, both Body-Calc-fed)
doesn't double-count against face; the overlap is accepted — build reads frame, body fat
reads leanness.

### 10.4 Copy

Spell out "Personal Best" wherever the orbit question's UI says "PB".

### 10.5 Mechanics

Question indices shift (Looks +1, invitations gone) — bump the localStorage schema
version and purge the stale key. Update the panel fixtures for the new shape (answer the
new body-fat and window inputs per archetype; delete invitation answers), re-assert:
30 questions total, per-sex Exposure weight totals still equal, all existing fixture
bands and tier expectations still pass. Adjust a band only if a fixture sits on a moved
boundary, and log any touched band in a code comment.

