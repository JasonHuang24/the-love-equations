# Face model candidate evaluation: FPEM / LiveBeauty

**Decision:** **No ship. Research-only candidate.**
**Audit date:** 2026-08-18
**Pinned source:** official FPEM `main` at [`c2965425247d7bf8b764d27e4483a06fc7a061e5`](https://github.com/Estella-LH/FPEM/commit/c2965425247d7bf8b764d27e4483a06fc7a061e5)

FPEM is relevant because it was designed for live-video facial-attractiveness prediction, but the available evidence does not support putting it into the Face Calculator. The official checkpoint is presently unavailable from its only published source, its redistribution and training-data rights are not established, the released single-image code/export path is not production-ready, and it has not passed the site's locked identity holdout. Its published correlations must not be described as accuracy, objective beauty, universal consensus, or proven camera robustness.

## Pinned artifacts and provenance

The official repository is [Estella-LH/FPEM](https://github.com/Estella-LH/FPEM). It has no tags or GitHub Releases as of the audit date, so all review below is pinned to the commit above rather than to a mutable branch.

| Artifact | Published provenance | Pinned identity | Audit result |
| --- | --- | --- | --- |
| Paper-aligned FPEM checkpoint | Added to the official repository in author commit [`c4af1999fa6957d7200ffc0c4acc2ed040639604`](https://github.com/Estella-LH/FPEM/commit/c4af1999fa6957d7200ffc0c4acc2ed040639604) | [`pretrained/fpem_srcc_0.9243.pth`](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/pretrained/fpem_srcc_0.9243.pth); Git LFS object SHA-256 `5e18fb2a807366bd1f4bf8498493437059c60d4862a2f5b54ab664cc92af9615`; 582,528,073 bytes | Intended candidate. The hash and size come from the committed LFS pointer; the binary could not be independently rehashed because the official repository returned “repository exceeded its LFS budget” on 2026-08-18. |
| Alternate FPEM checkpoint | Same official repository, but no model card explains its relationship to the paper checkpoint | [`experiments/public_fpem/save_dir/ckpt_e_21_0.93325.pth`](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/experiments/public_fpem/save_dir/ckpt_e_21_0.93325.pth); Git LFS object SHA-256 `cd7cccf9edaaa3557ec29298a1705f45b4af31a44f8c848d643104c0ed2c5acd`; 582,528,073 bytes | Not an interchangeable substitute until the authors document the metric, training run, and intended selection rule. |
| FaceNet initializer referenced by the release | Official FPEM LFS pointer named `facenet_20180402_vggface2.pth` | SHA-256 `0183228ec0f3f5c9e05ffc12e73e61e48e5bf8cce8333d7ebd64e2e524ddd8c8`; 112,009,829 bytes | The filename supplies only partial provenance; the release has no signed upstream mapping or training-corpus manifest. |
| SwinFace initializer referenced by the release | Official FPEM LFS pointer named `swinface_step_79999.pth` | SHA-256 `7ba7a2dcba59500ed8a7836eea8536164ac8c30e1dbdf9211da8378cd4070d98`; 882,380,545 bytes | Same provenance limitation. |

The repository commit proves where the pointers were published, not that every underlying model and image right was cleared. A usable candidate must be obtained from the authors or restored official LFS storage and must match the exact paper-checkpoint hash above. An unverified mirror is not acceptable.

## Rights and licensing audit

Code, trained checkpoints, and the training/evaluation images are separate rights questions.

| Layer | Primary-source evidence | Production conclusion |
| --- | --- | --- |
| FPEM source code | The pinned repository has an [MIT license](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/LICENSE). The upstream [OpenAI CLIP](https://github.com/openai/CLIP/blob/main/LICENSE), [facenet-pytorch](https://github.com/timesler/facenet-pytorch/blob/master/LICENSE.md), and [SwinFace](https://github.com/lxq1000/SwinFace/blob/main/LICENSE) repositories also publish MIT code licenses. | Source can be evaluated and adapted subject to preserving applicable notices and auditing the exact vendored dependency set. MIT code licenses do **not** establish rights in trained weights or training images. |
| FPEM checkpoint | The official repository publishes LFS pointers, but no checkpoint-specific license, model card, training-corpus manifest, or exact mapping to all upstream weight revisions. The [CLIP model card](https://github.com/openai/CLIP/blob/main/model-card.md) separately says deployed use needs context-specific testing and documents demographic disparities. | Do not redistribute or ship the checkpoint without written clarification covering production use and redistribution of the combined weights. The CLIP model-card warning is an intended-use/fairness warning, not a replacement copyright license. |
| LiveBeauty database | The official [Tianchi LiveBeauty page](https://tianchi.aliyun.com/dataset/216302) identifies ODC Attribution 1.0; the [ODC-BY 1.0 text](https://opendatacommons.org/licenses/by/1-0/) grants database rights subject to attribution/share-notice terms. The Tianchi description also says the data are only for academic research and requires an emailed identity/institution/intended-use request for the archive password. | No production retraining or redistribution under the currently published record. Obtain written clarification from the dataset publisher because the academic-only access condition is narrower than a normal production grant. |
| LiveBeauty images and depicted people | ODC-BY states that it licenses the database, not independent contents such as individual images; the dataset page does not publish a separate image-copyright, privacy, publicity/personality-rights, or commercial-use grant. | Database licensing alone is insufficient to clear the face images for commercial training or redistribution. Do not infer that a downloadable archive clears these rights. |

This is a provenance/clearance finding, not legal advice. The ship gate remains closed until the relevant rightsholders provide a documented production and redistribution basis.

## Exact released inference contract

The released implementation is **not** a drop-in replacement for the current single `[1,3,224,224]` ImageNet-normalized model. The contract below is taken from the pinned [dataset loader](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/dataloader/dataset.py), [FPEM scoring code](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/nets/Clips.py), [face-prior network](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/nets/VQA.py), and [public configuration](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/experiments/public_fpem/config.yml).

1. Decode with OpenCV, then convert BGR to **RGB**.
2. Read the metadata bounding box as `x y w h`, convert each value with Python `int`, and crop `image[y+2:y+h-2, x+2:x+w-2]`. The release does not define a no-box fallback.
3. For each target size, scale the longer crop side to the target with dimensions computed as `int(original_dimension * target / max(height, width))`.
4. Pad the shorter side with constant black pixels to a square. The configured/default `rightdown` mode adds no left/top padding and puts the remainder on the right/bottom; this is not a centered letterbox.
5. Create three RGB, NCHW, float32 tensors in `[0,1]`: `[N,3,224,224]` for CLIP ViT-B/16, `[N,3,112,112]` for the Swin face-prior branch, and `[N,3,160,160]` for InceptionResnetV1/FaceNet. `ToTensor()` performs the 0–255 scaling; the normalization line is commented out, so neither ImageNet normalization nor standard CLIP mean/std normalization is part of the released path.
6. Use prompts in this exact class order: `bad`, `poor`, `fair`, `good`, `perfect`, with template `a photo of a person with {a} attractiveness`.
7. Softmax the five quality logits and compute the scalar as the expected class value: `sum(probability[i] * (i + 1))`, producing an intended score in `[1,5]`. Preserve both outputs: scalar score `[N,1]` and ordered probabilities `[N,5]`.

The [supplement](https://openaccess.thecvf.com/content/ICCV2025/supplemental/Li_FPEM_Face_Prior_ICCV_2025_supplemental.pdf) describes padding the shorter side and reports horizontal and vertical flip augmentation with probability 0.5. In the released loader the flip call is commented out. That paper/code mismatch must be resolved before claiming faithful reproduction. Crop anchoring, integer rounding, interpolation, and the 2-pixel inset are part of the model contract and must be tested explicitly rather than silently replaced by the site's existing square crop.

## Released-code and browser-deployment blockers

- The official checkpoint cannot currently be fetched from official Git LFS, and there is no tagged release or alternative author-hosted checksum manifest.
- Constructors call `torch.cuda.current_device()`, and the released [`main.py`](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/main/main.py) selects CUDA and calls `.cuda()` unconditionally. A CPU-safe reference wrapper is required before conversion.
- In [`nets/Clips.py`](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/nets/Clips.py), `logits_quality.squeeze()` removes the batch dimension for `N=1`, after which two-dimensional indexing is invalid. Single-photo inference must be repaired and proven equal to the same sample evaluated in a larger batch.
- [`ModelHelper.load`](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/utils/model_helper.py) uses `strict=False`, allowing missing or unexpected keys. The conversion reference must require an exact key-and-shape match.
- [`requirements.txt`](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/requirements.txt) installs OpenAI CLIP from an unpinned Git branch, so the published environment is not reproducible without a new dependency lock.
- The dormant [`deploy_helper.py`](https://github.com/Estella-LH/FPEM/blob/c2965425247d7bf8b764d27e4483a06fc7a061e5/utils/deploy_helper.py) declares three input names but omits the third from dynamic axes, declares only one output although FPEM returns two, and performs no ONNX checker or ONNX Runtime comparison. It is not a supported export recipe.
- The paper supplement reports approximately **140M parameters** and **27.0 GFLOPs**; the checkpoint pointer is about **556 MiB**. There are no published browser/mobile cold-load, peak-memory, latency, cache, thermal, or offline tests. This is not presently a compact ensemble component.

Client-side inference could preserve privacy only if decode, detection, cropping, inference, aggregation, and reliability diagnostics remain on device and no image, crop, embedding, or per-face telemetry is transmitted. Downloading a static model asset is compatible with that design, but privacy does not resolve the rights, robustness, size, or parity blockers.

## Published evidence and its limits

The official [ICCV 2025 paper](https://openaccess.thecvf.com/content/ICCV2025/papers/Li_FPEM_Face_Prior_Enhanced_Facial_Attractiveness_Prediction_for_Live_Videos_ICCV_2025_paper.pdf) reports these correlations:

| Evaluation | SROCC | PLCC | KROCC |
| --- | ---: | ---: | ---: |
| LiveBeauty, within-dataset | 0.924 | 0.896 | 0.773 |
| MEBeauty, within-dataset | 0.783 | 0.795 | 0.593 |
| SCUT, within-dataset | 0.930 | 0.932 | 0.774 |
| Train LiveBeauty, test all MEBeauty | 0.630 | 0.629 | 0.447 |
| Train LiveBeauty, test all SCUT | 0.599 | 0.577 | 0.434 |

These are correlations, not “percent accurate.” The reported within-dataset splits are LiveBeauty 90/10, SCUT 60/40, and MEBeauty 80/20, but the paper/repository does not publish a split seed or identity manifest. It does not report this project's primary metrics (within-sex top/bottom-quartile AUC and at-least-one-point-gap pairwise accuracy), refusal rate, repeated-photo stability, supportable subgroup deltas, or bootstrap confidence intervals.

LiveBeauty is described as 10,000 cleaned faces sourced from more than 9,500 channels on one live-streaming platform and rated by 20 annotators (14 women, 6 men). Its rubric includes makeup, skin condition, influencer status, and celebrity status. The result is evidence about ratings of particular captured presentations in that collection—not an intrinsic property of a face. The public dataset description also says celebrity faces were removed, while the paper discusses celebrity-linked scoring in failure analysis, so the downloadable archive must not be assumed to reproduce the paper's training corpus exactly.

No race should be inferred from images, and neither the paper nor the release supports broad demographic-fairness claims. The independent Matchmaker labels remain editorial judgments, not universal human consensus.

## Preregistered PyTorch-to-ONNX parity gate

Run this gate in order. A failure at any stage blocks deployment. Tuning after seeing the locked holdout, silently changing preprocessing, or accepting a different checkpoint invalidates the comparison.

1. **Acquire and clear.** Obtain `fpem_srcc_0.9243.pth` from an official author-controlled source, verify SHA-256 `5e18...9615`, and document checkpoint/dependency/data production and redistribution rights. Stop if either identity or rights is unresolved.
2. **Freeze the environment.** Pin the source commit, Python/PyTorch versions, exact OpenAI CLIP revision and other dependencies, exporter, ONNX opset, native ONNX Runtime, ORT Web, execution provider, and browser versions. Freeze the identity-level train/validation/holdout split before preprocessing, crop, pruning, or ensemble choices are evaluated.
3. **Build the reference.** Make the three inputs explicit, remove CUDA-only initialization, preserve `[N,5]` through softmax, return score and probabilities, set `eval()`, and enable deterministic execution. Load with an exact key-and-shape match; record all missing/unexpected keys as a hard failure.
4. **Prove batch behavior.** For every fixture, require an `N=1` result to match the corresponding row from an `N>1` batch within the numerical tolerances below. Reject NaN/Infinity at every intermediate and output boundary.
5. **Lock preprocessing with golden tensors.** Compare Python and browser tensors for centered, every-edge, every-corner, portrait, landscape, very-close, and very-small faces, including EXIF orientation. RGB order, 2-pixel inset, integer truncation, resize interpolation, right/down black padding, scaling, shape, and tensor bytes must match. Store fixture tensor hashes.
6. **Export FP32 first.** Export both named outputs and all three named inputs; run `onnx.checker`, shape inference, and an ORT-Web operator-compatibility check. Do not introduce FP16, INT8, distillation, prompt precomputation, text-branch pruning, or graph substitutions in this candidate. Each optimization is a new candidate that repeats this entire gate.
7. **Compare three runtimes.** On PyTorch CPU, native ORT CPU, ORT-Web WASM, and any proposed WebGPU path, test zeros, ones, mid-gray, channel ramps, impulses, `N=1`, `N>1`, all crop fixtures, and the locked real-photo gallery. Compare the scalar and all five ordered probabilities.
8. **Apply the frozen tolerance.** Relative error is `abs(a-b) / max(abs(a), 1e-6)`. Against PyTorch FP32, require both maximum absolute error `<= 1e-5` and maximum relative error `<= 1e-5` for every output on every fixture; probability sums must be within `1e-6` of 1.0. Require Spearman rho exactly `1.0` and zero pair-order flips outside a predeclared numerical-tie epsilon. If WebGPU fails, it does not ship; use the passing WASM path or reject the candidate. Report maxima and worst fixtures, not only averages.
9. **Run the locked evaluation.** Compare candidates on the identical identity holdout. Primary metrics are within-sex top/bottom-quartile AUC and at-least-one-point-gap pairwise accuracy. Secondary metrics are Spearman rho, refusal rate, within-person SD/range/MAD/worst pair, multi-photo aggregation, supportable subgroup deltas, and bootstrap confidence intervals. Do not fit on holdout identities.
10. **Qualify actual devices.** Measure model download/cache behavior, offline behavior, cold start, peak memory, latency, failure handling, and sustained/thermal behavior on mobile portrait, tablet, 1366x768, 1920x1080, 2560x1440, 16:10, 4K, and both site width modes. Verify that no capture, tensor, score, or storage mutation escapes the documented client-side flow.

## Ship gate and claims boundary

FPEM remains **no-ship** until all of the following are true:

- the exact official checkpoint is available and hash-verified;
- checkpoint, dependency-weight, and LiveBeauty production/redistribution rights are documented;
- the repaired FP32 reference and browser model pass the parity gate;
- target-device size, latency, memory, cache, offline, and thermal behavior are acceptable;
- the locked identity holdout materially improves both primary ordering metrics without materially worsening repeated-photo stability, refusal rate, or any supportable subgroup result.

If any condition remains unmet, retain the current model and reduce the strength and precision of UI claims. A defensible description is: “an on-device estimate calibrated to ratings of photos in specific datasets; grooming, makeup, lighting, expression, retouching, and framing can change the result.” Do not claim objective beauty, universal agreement, demographic neutrality, live-camera robustness in general, or “93% accuracy.”
