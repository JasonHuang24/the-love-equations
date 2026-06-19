# Looks Calc — trained beauty model

Drop a converted model here as **`face-beauty.onnx`** and the Looks Calculator will use it
for the headline score automatically (on-device, via onnxruntime-web). Until then the page
runs on the transparent geometry heuristic, and the geometry stays the breakdown either way.

## The contract the page expects
`looks.html` → `MODEL_CONFIG` (top of the MediaPipe `<script type="module">`):

| Field        | Default                | Meaning |
|--------------|------------------------|---------|
| `url`        | `models/face-beauty.onnx` | where the page fetches the model |
| `inputSize`  | `224`                  | square RGB input, **NCHW** `[1,3,224,224]` |
| `mean`/`std` | ImageNet               | `[0.485,0.456,0.406]` / `[0.229,0.224,0.225]` |
| `outMin/outMax` | `1.5` / `4.5`       | conservative interim raw range (real SCUT predictions rarely hit 1 or 5); mapped to `[0,1]`, then through each lens's curve. Replace with holdout prediction quantiles once you have a calibration set. |
| `inputName`/`outputName` | `null`     | `null` = use the graph's first input/output |

If your model differs (e.g. 0–100 output, different normalization, 112×112 input), edit those
five constants — no other code changes.

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
Then drop `face-beauty.onnx` into this `models/` folder and reload the Looks Calc page. (~43 MB —
fine to commit, or host on a CDN and point `MODEL_CONFIG.url` at it.)

**Local alternative (if you prefer):** `pip install torch`, save the same code (minus the
`google.colab` lines) as `convert.py`, run `python convert.py`. Run it *inside Python* — it is not
Windows-command-prompt code.

**Sanity check after loading:** `missing_keys`/`unexpected_keys` must both be empty (step 2). SCUT-FBP5500
scores run ~1–5, which is what `MODEL_CONFIG.outMin/outMax` assume. If real faces produce a sane spread
(attractive high, unattractive low), you're set. If scores look random *despite* an empty-keys load, the
preprocessing crop/channel order is off (tell Claude); if they're on a different scale, adjust the two
output constants.

## Notes
- The page crops the face box from the MediaPipe landmarks (with margin) before feeding the model,
  so the input is a tight face — match your training crop if it was looser/tighter.
- The score is a **black box** by design here; the geometry breakdown below it is the transparent
  part. See `frameworks.html#bone-pill` for why a single number is a mirror, not a verdict.

---

# Looks Calc — sex classifier (optional, recommended)

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
