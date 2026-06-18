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

## Producing `face-beauty.onnx` (one-time, your machine)
```bash
pip install torch torchvision onnx
```
```python
import torch, torchvision
# Use a SCUT-FBP5500 checkpoint. Match the architecture to the checkpoint you grabbed —
# e.g. HCIILAB's ResNet18 (single regression head) from
# github.com/HCIILAB/SCUT-FBP5500-Database-Release (see their trained_models_for_pytorch/forward.py).
model = torchvision.models.resnet18(num_classes=1)
model.load_state_dict(torch.load('resnet18.pth', map_location='cpu'))
model.eval()
torch.onnx.export(
    model, torch.randn(1, 3, 224, 224), 'face-beauty.onnx',
    input_names=['input'], output_names=['score'], opset_version=12)
```
Drop the resulting `face-beauty.onnx` in this folder. (~45 MB for ResNet18 — fine to commit, or
host on a CDN and point `MODEL_CONFIG.url` at it.) A MobileNet/EfficientNet backbone gives a
smaller, web-friendlier file if the checkpoint is available.

## Notes
- The page crops the face box from the MediaPipe landmarks (with margin) before feeding the model,
  so the input is a tight face — match your training crop if it was looser/tighter.
- The score is a **black box** by design here; the geometry breakdown below it is the transparent
  part. See `frameworks.html#bone-pill` for why a single number is a mirror, not a verdict.
