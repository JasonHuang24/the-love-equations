# Face Calc — on-device face-rating model

The shipped **`face-beauty.onnx`** is a converted Gustrd/HCIILAB ResNet18 checkpoint trained on
SCUT-FBP5500. The Face Calculator runs it locally through onnxruntime-web; no photo, crop, tensor,
embedding, or score is uploaded. If the model is unavailable, the page shows descriptive geometry
but deliberately shows no headline number. Its output is a rough, photo-sensitive estimate tied to
one fixed rater population and image collection—not objective beauty or universal human consensus.

## The contract the page expects
`face.html` → `MODEL_CONFIG` (top of the MediaPipe `<script type="module">`):

| Field        | Default                | Meaning |
|--------------|------------------------|---------|
| `url`        | `models/face-beauty.onnx` | where the page fetches the model |
| `inputSize`  | `224`                  | square RGB input, **NCHW** `[1,3,224,224]` |
| `mean`/`std` | ImageNet               | `[0.485,0.456,0.406]` / `[0.229,0.224,0.225]` |
| `outMin/outMax` | `1.797` / `4.379`   | legacy normalization bounds passed with the raw result; the headline mapping now uses the full monotone `REF_RAW` reference table in `face.html`. |
| `inputName`/`outputName` | `null`     | `null` = use the graph's first input/output |

A replacement with different color order, normalization, input geometry, or output semantics needs a
separate preprocessing path and golden-tensor tests. Do not swap five constants and assume parity. A new
model also needs a newly frozen reference-output distribution and the locked identity evaluation below.

## Production preprocessing and crop contract

`js/face-crop.js` is the shared, DOM-free specification used by both production crop paths and Node tests.
For the headline model it:

1. finds the finite MediaPipe landmark bounding box in the **original-resolution** source;
2. requests a square whose side is `1.4 × max(face width, face height)`;
3. centers it horizontally and shifts its center upward by `0.06 × face height`;
4. translates the square inside the source whenever that side can fit, without changing scale;
5. when the requested square cannot fit, passes only the contained source intersection to `drawImage`
   and maps it into the 224×224 destination, making the unavoidable padding explicit; and
6. converts RGB to ImageNet-normalized float32 NCHW.

The source rectangle passed to `drawImage` is always contained. Diagnostics report requested fit,
source containment, side, x/y translation, four padding edges, padding-area percentage, and visible-face
percentage. The optional sex model uses the same specification with scale `1.5`, no vertical shift, and
96×96 raw RGB.

## Independent evidence and current ship decision (2026-08-18)

The SCUT checkpoint's SCUT correlations are training-contaminated and optimistic. The independent
Matchmaker labels below are one site's editorial judgments, not scientific ground truth or population
consensus. A monotone display remap cannot improve any ordering metric.

| Test | Before crop repair | After crop repair | Decision |
| --- | ---: | ---: | --- |
| Canonical within-sex top/bottom AUC | 0.647 [0.527, 0.759] | 0.647 [0.530, 0.757] | unchanged |
| Canonical ≥1-point pairwise accuracy | 0.596 [0.535, 0.662] | 0.598 [0.535, 0.664] | +0.002, not material |
| Canonical Spearman rho | 0.213 [0.064, 0.362] | 0.215 [0.070, 0.362] | +0.002, not material |
| Gallery within-sex top/bottom AUC | 0.663 [0.538, 0.758] | 0.666 [0.544, 0.764] | +0.003, not material |
| Gallery ≥1-point pairwise accuracy | 0.591 [0.530, 0.651] | 0.593 [0.532, 0.652] | +0.002, not material |
| Gallery image refusal | 0.205 [0.174, 0.239] | 0.205 [0.174, 0.239] | unchanged |
| Median within-person raw SD / range / MAD | 0.363 / 0.756 / 0.182 | 0.365 / 0.762 / 0.188 | essentially unchanged; slightly worse point estimates |

The crop repair ships because it removes invalid source geometry and exposes unavoidable padding, not
because of score spreading. It did **not** clear the preregistered material-improvement gate. The current
model and raw-mean multi-photo rule remain; the UI rounds to half-points and percentile deciles and names
only model-output bands.
The frozen validation comparison selected the already-shipped raw arithmetic mean as the only aggregation
finalist. On the one-time holdout common cohort (`n=35`), canonical-single versus gallery-mean AUC was
0.765→0.753 (delta -0.012, paired 95% CI [-0.250, 0.202]) and ≥1-point pairwise accuracy was 0.693→0.704
(delta +0.010 [-0.153, 0.168]); expected-female AUC regressed 0.88→0.76. That fails the preregistered ship
gate. Median and trimmed-mean variants did not advance. The mean remains because it is existing behavior
and demonstrably steadies repeated-photo estimates, not because the holdout proved better discrimination.


The official ICCV 2025 FPEM/LiveBeauty candidate is **no-ship**: its official LFS checkpoint is currently
unavailable, checkpoint/data production rights are not cleared, the release has browser/export defects,
and it has not passed this site's locked identity holdout. See `md/face-model-candidate-evaluation.md` for
the pinned hashes, exact three-input preprocessing, licensing audit, and PyTorch→ONNX parity gate. See
`md/face-evaluation-preregistration.md`, `md/face-gallery-stability-after.md`, and the machine-readable
artifacts under `data/` for the evaluation contract and full confidence intervals.

## Producing `face-beauty.onnx` — easiest path: Google Colab (no local install)
Open <https://colab.research.google.com> → New notebook → paste this one cell → Run (Shift+Enter).
It downloads a clean ResNet18 SCUT-FBP5500 checkpoint, exports ONNX, and downloads the file to you.

> **Critical:** the Gustrd checkpoint is **not** a `torchvision.models.resnet18`. It was trained with
> HCIILAB's *custom* ResNet (modules named `group1` / `group2` / `fullyconnected`), so loading it into a
> torchvision resnet18 silently matches **zero** keys (`strict=False` hides it) and exports a *random*
> network — every face then scores in a dead ~0.18-wide band. You **must** load into the class below and
> **verify `missing_keys`/`unexpected_keys` are both empty.**

```python
# Google Colab — rebuild with the checkpoint's REAL architecture (HCIILAB custom ResNet, not torchvision).
!pip install -q onnxscript          # PyTorch's ONNX exporter needs this; Colab doesn't ship it
import math, torch, torch.nn as nn, urllib.request
from collections import OrderedDict
from google.colab import files

def conv3x3(inp, outp, stride=1):
    return nn.Conv2d(inp, outp, kernel_size=3, stride=stride, padding=1, bias=False)

class BasicBlock(nn.Module):                      # HCIILAB SCUT-FBP5500 Nets.py — block body wrapped in `group1`
    expansion = 1
    def __init__(self, inplanes, planes, stride=1, downsample=None):
        super().__init__()
        m = OrderedDict()
        m['conv1'] = conv3x3(inplanes, planes, stride); m['bn1'] = nn.BatchNorm2d(planes)
        m['relu1'] = nn.ReLU(inplace=True)
        m['conv2'] = conv3x3(planes, planes);           m['bn2'] = nn.BatchNorm2d(planes)
        self.group1 = nn.Sequential(m)
        self.relu = nn.Sequential(nn.ReLU(inplace=True))
        self.downsample = downsample
    def forward(self, x):
        residual = self.downsample(x) if self.downsample is not None else x
        return self.relu(self.group1(x) + residual)

class ResNet(nn.Module):                          # stem wrapped in `group1`, head in `group2.fullyconnected`
    def __init__(self, block, layers, num_classes=1):
        self.inplanes = 64; super().__init__()
        m = OrderedDict()
        m['conv1'] = nn.Conv2d(3, 64, kernel_size=7, stride=2, padding=3, bias=False)
        m['bn1'] = nn.BatchNorm2d(64); m['relu1'] = nn.ReLU(inplace=True)
        m['maxpool'] = nn.MaxPool2d(kernel_size=3, stride=2, padding=1)
        self.group1 = nn.Sequential(m)
        self.layer1 = self._make_layer(block, 64,  layers[0])
        self.layer2 = self._make_layer(block, 128, layers[1], stride=2)
        self.layer3 = self._make_layer(block, 256, layers[2], stride=2)
        self.layer4 = self._make_layer(block, 512, layers[3], stride=2)
        self.avgpool = nn.Sequential(nn.AvgPool2d(7))
        self.group2 = nn.Sequential(OrderedDict([('fullyconnected', nn.Linear(512*block.expansion, num_classes))]))
    def _make_layer(self, block, planes, blocks, stride=1):
        downsample = None
        if stride != 1 or self.inplanes != planes*block.expansion:
            downsample = nn.Sequential(
                nn.Conv2d(self.inplanes, planes*block.expansion, kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(planes*block.expansion))
        layers = [block(self.inplanes, planes, stride, downsample)]
        self.inplanes = planes*block.expansion
        for _ in range(1, blocks): layers.append(block(self.inplanes, planes))
        return nn.Sequential(*layers)
    def forward(self, x):
        x = self.group1(x)
        x = self.layer1(x); x = self.layer2(x); x = self.layer3(x); x = self.layer4(x)
        x = self.avgpool(x).view(x.size(0), -1)
        return self.group2(x)

# 1. build the right model + load the REAL weights
model = ResNet(BasicBlock, [2, 2, 2, 2], num_classes=1)
urllib.request.urlretrieve(
  "https://huggingface.co/Gustrd/SCUT-FBP5500-PyTorch-Model/resolve/main/resnet18_py3.pth",
  "resnet18_py3.pth")
sd = torch.load("resnet18_py3.pth", map_location="cpu", weights_only=False)  # PyTorch 2.6+ needs this
if isinstance(sd, dict) and "state_dict" in sd: sd = sd["state_dict"]
sd = {k.replace("module.", ""): v for k, v in sd.items()}

# 2. VERIFY the load — both lists MUST print empty, or the weights didn't land
res = model.load_state_dict(sd, strict=False)
print("MISSING  (must be []):", res.missing_keys)
print("UNEXPECTED (must be []):", res.unexpected_keys)
model.eval()

# 3. export ONNX (224x224 RGB NCHW — the contract this page expects)
torch.onnx.export(model, torch.randn(1, 3, 224, 224), "face-beauty.onnx",
                  input_names=["input"], output_names=["score"],
                  opset_version=12, dynamo=False)   # legacy exporter = one self-contained ~43MB file

# 4. download to your computer
files.download("face-beauty.onnx")
```
Then verify the exported hash and parity, document the checkpoint's production/redistribution basis, and
drop `face-beauty.onnx` into this folder. The currently shipped browser asset has SHA-256
`4bdf12f3c3f21306522a33872a30cdf68fd7aa04f027c4581a10ac8638424fb8`.

**Local alternative (if you prefer):** `pip install torch`, save the same code (minus the
`google.colab` lines) as `convert.py`, run `python convert.py`. Run it *inside Python* — it is not
Windows-command-prompt code.

**Sanity check after loading:** `missing_keys`/`unexpected_keys` must both be empty (step 2). Compare
PyTorch and ONNX outputs on fixed golden tensors, then compare native ONNX Runtime and ORT-Web on the same
locked real-photo identities. A visually wide score spread is not validation. Reject NaN/Infinity, require
zero meaningful pair-order flips from conversion, and report maximum error plus the worst fixture. If the
model's raw distribution differs, rebuild `REF_RAW` using training/validation only and evaluate ordering on
the untouched identity holdout; changing display anchors alone cannot improve rank discrimination.

## Notes
- Match the exact shared crop contract above; crop scale and edge handling are model inputs, not cosmetic UI.
- The estimate is a **black box**; the geometry breakdown is an independent descriptive read, not a proof
  that the model is correct. See `frameworks.html#bone-pill` for why a single number is a mirror, not a verdict.

---

# Face Calc — sex classifier (optional, recommended)

Drop **`face-sex.onnx`** here and the panel auto-detects sex on-device to pick the sex-conditional
typical bands (jaw, lips, eyes, nose, dimorphism). Without it, the page falls back to a geometry guess,
which is **unreliable** (front-view landmark ratios don't cleanly separate sex). The sex read only
re-bases the breakdown bands — it never changes the headline score, and the user can flip it one click.

**No PyTorch conversion needed — it's already ONNX.** Use InsightFace's tiny (~1.3 MB) `genderage`
model. In a Google Colab cell:

```python
!pip install -q insightface onnxruntime
from insightface.app import FaceAnalysis
app = FaceAnalysis(name='buffalo_l')      # one-time download of the buffalo_l pack
app.prepare(ctx_id=-1)                     # genderage.onnx now lives under ~/.insightface/models/buffalo_l/
import shutil, os
shutil.copy(os.path.expanduser('~/.insightface/models/buffalo_l/genderage.onnx'), 'face-sex.onnx')
from google.colab import files; files.download('face-sex.onnx')
```

Then drop `face-sex.onnx` into this `models/` folder and reload. The page's `SEX_MODEL_CONFIG`
(top of the MediaPipe module) expects genderage's contract and shouldn't need edits:

| Field        | Default     | Meaning |
|--------------|-------------|---------|
| `url`        | `models/face-sex.onnx` | where the page fetches it |
| `inputSize`  | `96`        | **NCHW** `[1,3,96,96]`, RGB, **raw 0–255** (no normalization) |
| `cropScale`  | `1.5`       | crop = face box × 1.5, centred (matches genderage's framing) |

Output contract the page assumes: `[female_logit, male_logit, age/100]` — `argmax` of the first two
is the sex. If your model's output order differs (male first, or a single sigmoid), tell Claude and the
3-line `sexFromLogits` reader gets adjusted.

---

# Body Calc — trained body model (optional; geometry runs without it)

Drop a converted model here as **`body-beauty.onnx`** and `body.html` will use it for the headline
score automatically (on-device, via onnxruntime-web). Until then the page runs on the transparent
**pose-geometry** composite, and the geometry stays the breakdown either way.

## The contract the page expects
`body.html` → `MODEL_CONFIG` (top of the MediaPipe Pose `<script type="module">`):

| Field        | Default                | Meaning |
|--------------|------------------------|---------|
| `url`        | `models/body-beauty.onnx` | where the page fetches the model |
| `inputSize`  | `224`                  | square RGB input, **NCHW** `[1,3,224,224]` |
| `mean`/`std` | ImageNet               | `[0.485,0.456,0.406]` / `[0.229,0.224,0.225]` |
| `outMin/outMax` | `14.247` / `58.628` | current anchors — the 2026-06-21 **real-photo** recalibration shipped in body.html (it replaced the 26.234/69.261 studio-holdout percentiles, which crushed every real body into 1–3). **Re-anchor** from your own holdout prediction quantiles per real-photo batch; body.html's `MODEL_CONFIG` is the source of truth. |
| `inputName`/`outputName` | `null`     | `null` = use the graph's first input/output |

The page crops a **square, aspect-preserving box around the detected person** (pose-landmark
bounding box × 1.15) from the **original-resolution** image and feeds that — match your training crop
(full-body framing) if it differs. If your model wants a different size / normalization / a tall
(non-square) body aspect, edit those constants.

## Building `body-beauty.onnx` — train it (no turnkey checkpoint exists)
SCUT-FBP5500 gave the face calc a ready, validated checkpoint. **Body attractiveness has no drop-in
public equivalent** — every "score a physique" product is closed SaaS, and the public bodyfat repos
have no released weights (full sweep in `../md/body-cnn-scoping-brief.md`). So you **train a small
regressor**, which **`train_body_beauty.py`** (next to this file) does end-to-end:

1. **Data — the Connor full-body stimulus set** (OSF `egj7c`, <https://osf.io/egj7c/>): 726 clothed
   full-body photos, *attractiveness* among 24 rated traits, ~490k ratings from ~3,311 US adults.
   Downloadable; cite Connor et al. (2020), *Pers. Soc. Psychol. Bull.* 47(1):89–105.
2. **Run it in Google Colab** (free GPU): New notebook → paste `train_body_beauty.py` into one cell →
   set runtime to GPU → run. It downloads the OSF data, fine-tunes an ImageNet ResNet18 to regress the
   mean attractiveness, reports a held-out **Pearson/Spearman**, exports `body-beauty.onnx` with the
   contract above, and **prints the `outMin`/`outMax` to set** (held-out prediction quantiles).
   - Verify the export path first with `python train_body_beauty.py --smoke` (no data, ~10 s) — it
     builds the net, exports ONNX, and runs an onnxruntime parity check.
   - The script is **defensive about the OSF schema** (it auto-discovers files and prints the ratings
     columns); confirm the printed `attr_col` / `image_col` mapping before trusting the model.
3. **Drop it in.** Put `body-beauty.onnx` in this `models/` folder, set the printed `outMin`/`outMax`
   in `body.html` `MODEL_CONFIG`, reload.

**Don't ship a weak model.** N=726 is small; if the held-out Spearman is poor, the geometry fallback is
more honest than a noisy black box — the script warns you and the page degrades to geometry automatically
when no `.onnx` is present (a later drop-in is a pure upgrade). Caveats to keep on the page: the raters /
targets are a fixed US sample (bias is baked in — **label the training population**); 272 targets are
Photoshop head-swaps (the script can drop them); a clothed photo learns *clothed-silhouette*
attractiveness, not physique-under-clothing. The geometry composite (waist-to-hip, the waist-to-height
adiposity proxy, V-taper, breadth, leg-to-torso, symmetry) stays the **black-box-free, evidence-ranked
breakdown** regardless — see `frameworks.html#bone-pill`.

## Notes on the geometry (works today, no model needed)
- **Silhouette, not just skeleton.** BlazePose's 33 keypoints give joint positions but **no waist**
  (waist is soft tissue with no landmark — the body's analog of "the hairline has no landmark"). So the
  page also reads the **segmentation mask**: pose landmarks set the vertical levels (shoulder line, hip
  line), and the silhouette gives the body's actual width at each level. That's what makes waist-to-hip,
  the waist-to-height adiposity proxy, and the V-taper measurable from one photo.
- **Frontal widths ≈ circumference ratios** under an elliptical assumption — a disclosed proxy.
- **Confounds the page flags** (non-blocking): arms at your sides widen the waist silhouette; a tilted
  stance inflates asymmetry; clothing redraws the outline. Best input: facing forward, full body in
  frame, arms slightly out, fitted clothing.
