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
