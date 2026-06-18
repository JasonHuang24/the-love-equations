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
| `outMin/outMax` | `1` / `5`           | raw output range (SCUT-FBP5500); mapped to `[0,1]`, then through each lens's curve |
| `inputName`/`outputName` | `null`     | `null` = use the graph's first input/output |

If your model differs (e.g. 0–100 output, different normalization, 112×112 input), edit those
five constants — no other code changes.

## Producing `face-beauty.onnx` — easiest path: Google Colab (no local install)
Open <https://colab.research.google.com> → New notebook → paste this one cell → Run (Shift+Enter).
It downloads a clean ResNet18 SCUT-FBP5500 checkpoint, exports ONNX, and downloads the file to you.

```python
# Google Colab — torch is preinstalled, nothing to set up.
!pip install -q onnxscript          # PyTorch's ONNX exporter needs this; Colab doesn't ship it
import torch, torchvision, urllib.request
from google.colab import files

# 1. clean ResNet18 SCUT-FBP5500 checkpoint (standard arch, single regression head)
urllib.request.urlretrieve(
  "https://huggingface.co/Gustrd/SCUT-FBP5500-PyTorch-Model/resolve/main/resnet18_py3.pth",
  "resnet18_py3.pth")

# 2. build + load (defensive: unwrap state_dict / strip DataParallel prefixes)
model = torchvision.models.resnet18(num_classes=1)
sd = torch.load("resnet18_py3.pth", map_location="cpu", weights_only=False)  # PyTorch 2.6+ needs this
if isinstance(sd, dict) and "state_dict" in sd: sd = sd["state_dict"]
sd = {k.replace("module.", ""): v for k, v in sd.items()}
model.load_state_dict(sd, strict=False)
model.eval()

# 3. export ONNX (224x224 RGB NCHW — the contract this page expects)
torch.onnx.export(model, torch.randn(1, 3, 224, 224), "face-beauty.onnx",
                  input_names=["input"], output_names=["score"],
                  opset_version=12, dynamo=False)   # legacy exporter = one self-contained ~45MB file

# 4. download to your computer
files.download("face-beauty.onnx")
```
Then drop `face-beauty.onnx` into this `models/` folder and reload the Looks Calc page. (~45 MB —
fine to commit, or host on a CDN and point `MODEL_CONFIG.url` at it.)

**Local alternative (if you prefer):** `pip install torch torchvision`, save the same code (minus the
`google.colab` lines) as `convert.py`, run `python convert.py`. Run it *inside Python* — it is not
Windows-command-prompt code.

**Sanity check after loading:** SCUT-FBP5500 scores run ~1–5, which is what `MODEL_CONFIG.outMin/outMax`
assume. If real faces produce a sane spread, you're set. If scores look random, the checkpoint/arch
didn't match (tell Claude); if they're on a different scale, adjust the two output constants.

## Notes
- The page crops the face box from the MediaPipe landmarks (with margin) before feeding the model,
  so the input is a tight face — match your training crop if it was looser/tighter.
- The score is a **black box** by design here; the geometry breakdown below it is the transparent
  part. See `frameworks.html#bone-pill` for why a single number is a mirror, not a verdict.
