"""
train_body_beauty.py — produce models/body-beauty.onnx for the Body Calculator.

WHAT THIS DOES
  Fine-tunes a torchvision ResNet18 (ImageNet-pretrained) to regress a single
  "attractiveness" score from a full-body photo, then exports it to ONNX with the
  EXACT contract body.html expects, and prints the MODEL_CONFIG.outMin/outMax to set.

  Dataset: the Connor full-body stimulus set (OSF project egj7c) — 726 clothed
  full-body images, "attractiveness" is one of 24 rated traits, ~490k ratings from
  ~3,311 US adults. Publicly downloadable; cite Connor et al. (2020), Pers. Soc.
  Psychol. Bull. 47(1):89-105.  https://osf.io/egj7c/  ·  paulconnorpsych.com/stimuli

WHERE TO RUN
  Google Colab (free GPU) is easiest: New notebook -> Runtime -> Change runtime type ->
  GPU -> in a FIRST cell run `!pip install onnx onnxruntime` (Colab ships torch/torchvision
  /pandas/pillow/scipy but NOT onnx, which torch.onnx.export needs to write the file) ->
  paste this whole file into the next cell -> run.  Or locally:
  `pip install torch torchvision onnx onnxscript onnxruntime pandas pillow scipy`
  then `python train_body_beauty.py`.  Smoke-test the export path with no data:
  `python train_body_beauty.py --smoke`.

HONESTY / STATUS
  - The TRAINING + EXPORT mechanics here mirror the proven face-beauty recipe in
    models/README.md (same ResNet -> ONNX -> onnxruntime-web path).
  - The DATA-LOADING (STEP 1) is wired to the Connor OSF schema VERIFIED against the
    live files (2026-06-19): one 375 MB zip → `aggregated_photo_ratings.csv` (WIDE,
    726 rows) with columns `photo` + `attractiveness_mean`, a 0–100 scale, target id =
    filename stem with '-'->'.', and head-swap composites flagged by a '.' in the id.
    The script still prints the columns + match count so you can confirm before trusting it.
  - N=726 is small. We fine-tune (not train from scratch), augment, and report a
    held-out Pearson/Spearman. If the correlation is weak, DO NOT SHIP the model —
    the geometry fallback is better than a noisy black box (the page degrades to it
    automatically when models/body-beauty.onnx is absent).
"""

import os, sys, glob, math, argparse, urllib.request, zipfile

# ----------------------------------------------------------------------------------
# CONFIG  — the only block you should normally need to touch.  Verify the data-schema
# names against what STEP 1 prints for the actual OSF files.
# ----------------------------------------------------------------------------------
CFG = dict(
    # --- data source (VERIFIED against the live OSF files, 2026-06-19) ---
    osf_zip_url   = "https://osf.io/download/khm9a/",   # "Full-Body Photo Database" zip (osf.io/egj7c, ~375 MB)
    data_dir      = "connor_data",    # local folder the zip downloads + extracts into

    # --- ratings-CSV schema (verified; override only if the printed columns differ) ---
    use_long      = False,            # False = aggregated_photo_ratings.csv (WIDE, 726 rows, ready);
                                      # True  = photo_ratings.csv (LONG, ~498k rows) filtered to trait=='attractiveness'
    ratings_csv   = "aggregated_photo_ratings.csv",   # WIDE file (auto-found under data_dir)
    attr_col      = "attractiveness_mean",            # WIDE column; ignored when use_long=True (uses trait/rating)
    image_col     = "photo",                          # both files: target id = the image filename stem with '-' -> '.'

    # --- which images to use ---
    drop_headswaps = False,           # composites (head-swaps) have a '.' in the photo id — 272 of 726. Keeping them
                                      # is defensible for a *body* scorer (decorrelates face from body); True drops them.

    # --- training ---
    img_size      = 224,
    mean          = [0.485, 0.456, 0.406],   # ImageNet — MUST match body.html MODEL_CONFIG
    std           = [0.229, 0.224, 0.225],
    val_frac      = 0.15,
    epochs        = 40,
    batch_size    = 16,
    lr_head       = 1e-3,             # fc + layer4
    lr_backbone   = 1e-4,             # earlier blocks (unfrozen at half-time)
    weight_decay  = 1e-4,
    seed          = 1337,
    out_onnx      = "body-beauty.onnx",
    calib_lo_pct  = 2.0,              # outMin = this percentile of held-out predictions
    calib_hi_pct  = 98.0,            # outMax = this percentile
)

def is_headswap(image_id: str) -> bool:
    """Connor composites (a head swapped onto a different body) are encoded by a separator:
    the photo id joins two ids with a '.' (e.g. 'WM77.BM51'); originals have no '.'.
    Verified counts: 272 composites / 454 originals / 726 total."""
    return "." in str(image_id)


def group_id_map(ids):
    """Union-find over the raw id tokens so any two images that share a HEAD or a BODY land in the
    same group. A composite id joins two underlying ids with '.', e.g. 'WM77.BM51' shares head 'WM77'
    with every 'WM77.*' and body 'BM51' with every '*.BM51'; an original 'BM29' is its own single token.
    Returns a parallel list of group roots. Splitting train/val by these groups (a grouped HOLDOUT — one
    split, not k-fold cross-validation) stops the same underlying head or body appearing on BOTH sides of the
    split — which would let the model memorize a body/head in training and be 'tested' on it again, inflating
    the held-out Pearson/Spearman. This is why the ungrouped 0.606 was optimistic; expect the grouped number
    to be lower but HONEST. Note: it's still a single split with the best epoch chosen on that same val set,
    so treat the number as a rough generalization read, not a cross-validated or independent-test estimate."""
    parent = {}
    def find(x):
        parent.setdefault(x, x)
        root = x
        while parent[root] != root:
            root = parent[root]
        while parent[x] != root:
            parent[x], x = root, parent[x]
        return root
    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
    toks_per = []
    for pid in ids:
        toks = str(pid).split(".")
        toks_per.append(toks)
        for t in toks[1:]:
            union(toks[0], t)
    return [find(toks[0]) for toks in toks_per]


# ==================================================================================
# Everything below is the machinery. Read it, but you normally edit only CONFIG.
# ==================================================================================

def smoke_test():
    """Verify the model build + ONNX export + onnxruntime parity with NO dataset.
    Proves the artifact will load in onnxruntime-web before you spend a training run."""
    import torch, torch.nn as nn, torchvision as tv
    import numpy as np
    print("[smoke] building resnet18 -> 1-scalar head")
    model = tv.models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 1)
    model.eval()
    dummy = torch.randn(1, 3, CFG["img_size"], CFG["img_size"])
    torch.onnx.export(model, dummy, CFG["out_onnx"],
                      input_names=["input"], output_names=["score"],
                      opset_version=12, dynamo=False)
    print(f"[smoke] exported {CFG['out_onnx']}")
    import onnxruntime as ort
    sess = ort.InferenceSession(CFG["out_onnx"], providers=["CPUExecutionProvider"])
    print("[smoke] onnx input :", sess.get_inputs()[0].name, sess.get_inputs()[0].shape)
    print("[smoke] onnx output:", sess.get_outputs()[0].name, sess.get_outputs()[0].shape)
    with torch.no_grad():
        t = float(model(dummy).flatten()[0])
    o = float(sess.run(None, {"input": dummy.numpy()})[0].flatten()[0])
    print(f"[smoke] torch={t:.6f}  onnx={o:.6f}  |diff|={abs(t-o):.2e}")
    assert abs(t - o) < 1e-4, "torch/onnx mismatch — export is broken"
    print("[smoke] PASS — export mechanics are sound. The page reads output[0] as the raw score.")


def fetch_osf(zip_url, dest):
    """Download the Connor Full-Body Photo Database zip (~375 MB) and extract it.
    Skips if already extracted. On download failure, prints manual instructions."""
    if glob.glob(os.path.join(dest, "**", "photos", "*.png"), recursive=True):
        print(f"[data] images already extracted under {dest}/ — skipping download")
        return
    os.makedirs(dest, exist_ok=True)
    zpath = os.path.join(dest, "full_body_photo_database.zip")
    if not os.path.exists(zpath):
        print(f"[data] downloading {zip_url}  (~375 MB, one-time)…")
        try:
            urllib.request.urlretrieve(zip_url, zpath)
        except Exception as e:
            print("\n[data] download failed:", e)
            print(f"      Manually download the 'full_body_photo_database.zip' from "
                  f"https://osf.io/egj7c/ into ./{dest}/ and re-run.")
            sys.exit(1)
    print("[data] extracting zip…")
    with zipfile.ZipFile(zpath) as z:
        z.extractall(dest)
    print("[data] extracted.")


def find_images(root):
    exts = ("*.jpg", "*.jpeg", "*.png", "*.bmp", "*.webp")
    files = []
    for e in exts:
        files += glob.glob(os.path.join(root, "**", e), recursive=True)
    return sorted(files)


def build_label_table(root):
    """Return a list of (image_path, score_float) from the Connor files. Verified schema;
    prints the columns + match count so you can confirm before trusting the labels."""
    import pandas as pd

    images = find_images(root)
    if not images:
        sys.exit(f"[data] no images found under {root}/ — check the download")
    by_base = {}                                  # filename stem (lowercased) -> path
    for p in images:
        by_base.setdefault(os.path.splitext(os.path.basename(p))[0].lower(), p)
    print(f"[data] found {len(images)} image files")

    # locate the ratings CSV (verified name; fall back to any matching csv)
    want = "photo_ratings.csv" if CFG["use_long"] else CFG["ratings_csv"]
    hits = glob.glob(os.path.join(root, "**", want), recursive=True) or \
           glob.glob(os.path.join(root, "**", "*.csv"), recursive=True)
    if not hits:
        sys.exit(f"[data] no ratings CSV ('{want}') under {root}/")
    csv = hits[0]
    df = pd.read_csv(csv)
    print(f"[data] ratings file: {csv}")
    print(f"[data] columns: {list(df.columns)}")

    ic = CFG["image_col"]
    if CFG["use_long"]:
        # LONG: key/value rows — keep trait=='attractiveness', value is in 'rating', group per image
        for need in ("trait", "rating", ic):
            if need not in df.columns:
                sys.exit(f"[data] LONG file missing '{need}' — check the columns above / set CFG")
        a = df[df["trait"].astype(str).str.lower() == "attractiveness"].copy()
        a["rating"] = pd.to_numeric(a["rating"], errors="coerce")
        grp = a.dropna(subset=["rating"]).groupby(ic)["rating"].mean()
    else:
        # WIDE: one row per image, attractiveness_mean
        ac = CFG["attr_col"]
        if ac not in df.columns or ic not in df.columns:        # graceful fallback if names shifted
            ac = next((c for c in df.columns if "attract" in str(c).lower() and "mean" in str(c).lower()), ac)
            ic = next((c for c in df.columns if str(c).lower() == "photo"), ic)
            if ac not in df.columns or ic not in df.columns:
                sys.exit(f"[data] expected '{CFG['attr_col']}'/'{CFG['image_col']}' not found — set CFG from the header above")
        df[ac] = pd.to_numeric(df[ac], errors="coerce")
        grp = df.dropna(subset=[ac]).set_index(ic)[ac]
    print(f"[data] {len(grp)} images with a score; native label range "
          f"[{grp.min():.2f}, {grp.max():.2f}]  (Connor attractiveness is a 0–100 slider)")

    rows, missed, comps = [], 0, 0
    for pid, score in grp.items():
        if is_headswap(pid):
            comps += 1
            if CFG["drop_headswaps"]:
                continue
        stem = str(pid).replace(".", "-").lower()    # CSV id 'BM29.BM33' -> file stem 'BM29-BM33'
        path = by_base.get(stem)
        if path is None:
            missed += 1; continue
        rows.append((path, float(score), str(pid)))    # carry the id so we can group-split by body identity
    if missed:
        print(f"[data] WARNING: {missed} ids had no matching image file "
              f"(check the '.'->'-' filename mapping if this is large)")
    if len(rows) < 50:
        sys.exit(f"[data] only {len(rows)} image<->label matches — the id/filename mapping is likely off")
    print(f"[data] {len(rows)} usable (image, score) pairs  ·  {comps} composites/head-swaps "
          f"in the set (drop_headswaps={CFG['drop_headswaps']})")
    return rows


def letterbox_square(pil_img):
    """Pad to a centered square with BLACK — matches body.html, which draws a square
    crop into a transparent (->black) canvas, so a tall person gets black side-bars.
    A faithful-but-heavier alternative is to run MediaPipe Pose on each training image
    and crop the same landmark bbox x1.15; letterboxing the (already full-body, plain-
    background) Connor images is a close approximation. This is the main train/inference
    distribution-shift knob — note it if scores look off."""
    from PIL import Image
    w, h = pil_img.size
    s = max(w, h)
    canvas = Image.new("RGB", (s, s), (0, 0, 0))
    canvas.paste(pil_img, ((s - w) // 2, (s - h) // 2))
    return canvas


def main():
    import numpy as np, torch, torch.nn as nn, torchvision as tv
    from torch.utils.data import Dataset, DataLoader
    from torchvision import transforms as T
    from PIL import Image
    try:
        from scipy.stats import pearsonr, spearmanr
    except Exception:
        pearsonr = spearmanr = None

    torch.manual_seed(CFG["seed"]); np.random.seed(CFG["seed"])
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[train] device = {dev}")

    fetch_osf(CFG["osf_zip_url"], CFG["data_dir"])
    rows = build_label_table(CFG["data_dir"])

    norm = T.Normalize(CFG["mean"], CFG["std"])
    S = CFG["img_size"]
    train_tf = T.Compose([
        T.Lambda(letterbox_square),
        T.Resize((S, S)),
        T.RandomHorizontalFlip(),
        T.ColorJitter(0.2, 0.2, 0.2, 0.02),
        T.RandomAffine(degrees=4, translate=(0.03, 0.03), scale=(0.95, 1.05)),
        T.ToTensor(), norm,
    ])
    eval_tf = T.Compose([T.Lambda(letterbox_square), T.Resize((S, S)), T.ToTensor(), norm])

    class BodyDS(Dataset):
        def __init__(self, items, tf): self.items, self.tf = items, tf
        def __len__(self): return len(self.items)
        def __getitem__(self, i):
            path, score = self.items[i]
            img = Image.open(path).convert("RGB")
            return self.tf(img), torch.tensor([score], dtype=torch.float32)

    # GROUPED split by body identity (Codex review): no underlying head/body crosses the train/val line,
    # so the held-out Pearson/Spearman measures real generalization, not memorized stimuli. The dataset uses
    # (path, score) pairs; the third tuple element is the id we group on.
    gids  = group_id_map([r[2] for r in rows])
    pairs = [(r[0], r[1]) for r in rows]
    uniq  = sorted(set(gids))
    gperm = np.random.permutation(len(uniq))
    n_val_g = max(1, int(round(len(uniq) * CFG["val_frac"])))
    val_groups  = set(uniq[gperm[i]] for i in range(n_val_g))
    val_items   = [pairs[i] for i in range(len(pairs)) if gids[i] in val_groups]
    train_items = [pairs[i] for i in range(len(pairs)) if gids[i] not in val_groups]
    if len(val_items) < 20 or len(train_items) < 20:
        print(f"[train] *** WARNING: grouped split is imbalanced ({len(train_items)}/{len(val_items)}) — the "
              f"head-swap components merged into few large groups. The number is honest but the val set is "
              f"small; treat the correlation as a rough read. ***")
    print(f"[train] grouped split by body identity: {len(uniq)} groups -> "
          f"{len(train_items)} train / {len(val_items)} val (no head/body crosses the split)")
    tl = DataLoader(BodyDS(train_items, train_tf), batch_size=CFG["batch_size"], shuffle=True,  num_workers=2, drop_last=True)
    vl = DataLoader(BodyDS(val_items,   eval_tf),  batch_size=CFG["batch_size"], shuffle=False, num_workers=2)

    model = tv.models.resnet18(weights=tv.models.ResNet18_Weights.IMAGENET1K_V1)
    model.fc = nn.Linear(model.fc.in_features, 1)
    model = model.to(dev)

    # phase 1: train head + layer4 only; phase 2 (after half the epochs): unfreeze all
    def set_trainable(full):
        for n, p in model.named_parameters():
            p.requires_grad = full or n.startswith(("fc.", "layer4."))
    set_trainable(False)
    opt = torch.optim.AdamW([
        {"params": [p for n, p in model.named_parameters() if n.startswith(("fc.", "layer4."))], "lr": CFG["lr_head"]},
        {"params": [p for n, p in model.named_parameters() if not n.startswith(("fc.", "layer4."))], "lr": CFG["lr_backbone"]},
    ], weight_decay=CFG["weight_decay"])
    lossf = nn.MSELoss()    # raw 0–100 attractiveness target; outMin/outMax come out in interpretable 0–100 units

    best = {"sp": -2, "state": None, "preds": None, "tgts": None}
    for ep in range(CFG["epochs"]):
        if ep == CFG["epochs"] // 2:
            set_trainable(True); print("[train] unfreezing full backbone")
        model.train()
        for x, y in tl:
            x, y = x.to(dev), y.to(dev)
            opt.zero_grad(); loss = lossf(model(x), y); loss.backward(); opt.step()

        model.eval(); P, Tg = [], []
        with torch.no_grad():
            for x, y in vl:
                P += model(x.to(dev)).cpu().flatten().tolist(); Tg += y.flatten().tolist()
        P, Tg = np.array(P), np.array(Tg)
        rmse = float(np.sqrt(((P - Tg) ** 2).mean()))
        pr = pearsonr(P, Tg)[0] if pearsonr else float("nan")
        sp = spearmanr(P, Tg)[0] if spearmanr else float("nan")
        print(f"[ep {ep:02d}] val RMSE={rmse:.3f}  Pearson={pr:.3f}  Spearman={sp:.3f}")
        # NaN Spearman (scipy absent, or a constant-prediction epoch) never beats -2, so without
        # a fallback `best` stays empty for the whole run and the export crashes at the end.
        # Selection: a valid-Spearman checkpoint always outranks a NaN one; among valid, highest
        # Spearman; if the whole run is NaN (no scipy), lowest RMSE.
        prev_valid = best["state"] is not None and best["sp"] == best["sp"]
        if sp == sp:
            improved = (not prev_valid) or sp > best["sp"]
        else:
            improved = best["state"] is None or (not prev_valid and rmse < best.get("rmse", float("inf")))
        if improved:
            best = {"sp": sp, "pr": pr, "rmse": rmse,
                    "state": {k: v.cpu().clone() for k, v in model.state_dict().items()},
                    "preds": P, "tgts": Tg}

    print(f"\n[train] BEST  Spearman={best['sp']:.3f}  Pearson={best.get('pr',float('nan')):.3f}  RMSE={best['rmse']:.3f}")
    if not (best["sp"] == best["sp"]) or best["sp"] < 0.30:
        print("[train] *** WEAK correlation. Do NOT ship this model — the geometry fallback is")
        print("        more honest than a noisy black box. Get more/cleaner data or stop here. ***")
    model.load_state_dict(best["state"]); model.eval().cpu()

    # ---- export ONNX (same contract as face-beauty.onnx) ----
    torch.onnx.export(model, torch.randn(1, 3, S, S), CFG["out_onnx"],
                      input_names=["input"], output_names=["score"],
                      opset_version=12, dynamo=False)
    print(f"[onnx] wrote {CFG['out_onnx']}")
    try:
        import onnxruntime as ort
        sess = ort.InferenceSession(CFG["out_onnx"], providers=["CPUExecutionProvider"])
        d = torch.randn(1, 3, S, S)
        with torch.no_grad(): t = float(model(d).flatten()[0])
        o = float(sess.run(None, {"input": d.numpy()})[0].flatten()[0])
        print(f"[onnx] parity check  torch={t:.5f}  onnx={o:.5f}  |diff|={abs(t-o):.2e}")
    except Exception as e:
        print("[onnx] (skipped parity check — onnxruntime not installed):", e)

    # ---- calibration: outMin/outMax from held-out prediction quantiles ----
    lo = float(np.percentile(best["preds"], CFG["calib_lo_pct"]))
    hi = float(np.percentile(best["preds"], CFG["calib_hi_pct"]))
    print("\n" + "=" * 70)
    print("DROP-IN INSTRUCTIONS")
    print("=" * 70)
    print(f"1. Put {CFG['out_onnx']} in the repo's  models/  folder.")
    print(f"2. In body.html MODEL_CONFIG set:")
    print(f"       outMin: {lo:.3f},   outMax: {hi:.3f}")
    print(f"   (held-out {CFG['calib_lo_pct']:.0f}th/{CFG['calib_hi_pct']:.0f}th pct of predictions, native label scale)")
    print(f"3. Reload the Body Calc. Sanity-check: lean/athletic bodies should land high,")
    print(f"   soft/unbuilt low, with a real spread — not a dead band. If the scale looks off,")
    print(f"   nudge outMin/outMax; if it's random despite a good Spearman, the crop/channel")
    print(f"   order is off (the page feeds RGB, square black-letterboxed, ImageNet-normalized).")
    print("=" * 70)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--smoke", action="store_true", help="verify ONNX export with no dataset")
    # parse_known_args (not parse_args) so the script also runs when pasted straight into a Colab/Jupyter
    # cell, where sys.argv carries the kernel's own args (e.g. '-f /root/.../kernel-xxxx.json'). Those are
    # ignored instead of raising "unrecognized arguments". As a file (`python train_body_beauty.py [--smoke]`)
    # it behaves exactly as before.
    args, _ = ap.parse_known_args()
    smoke_test() if args.smoke else main()
