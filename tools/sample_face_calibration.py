"""Draw the Face Calc calibration SAMPLE from the SCUT-FBP5500 label table.

Spec (§2): ~400 images, roughly equal across the four subsets (AF/AM/CF/CM), random within each subset,
PLUS force-include the top and bottom ~15 rated images per subset so the tails are represented. Writes a
reproducible manifest (filename, mean_rating, subset, reason) to a local CSV.

Per subset we take: top TAIL_N by rating + bottom TAIL_N + (PER_SUBSET - 2*TAIL_N) random from the middle,
for PER_SUBSET total. Deterministic (fixed seed) so the sample — and therefore the derived anchors — is
reproducible. Output stays inside the gitignored images/calibration-scut/ tree (dataset-derived, not content).
"""

import argparse
import csv
import random
import sys
from pathlib import Path

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass

ROOT = Path(__file__).resolve().parents[1]
CAL_DIR = ROOT / "images" / "calibration-scut"
LABELS_CSV = CAL_DIR / "labels.csv"
MANIFEST_CSV = CAL_DIR / "sample_manifest.csv"

SEED = 20260706
PER_SUBSET = 100     # 4 subsets * 100 = 400 total
TAIL_N = 15          # forced top-15 and bottom-15 per subset


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-subset", type=int, default=PER_SUBSET)
    ap.add_argument("--tail", type=int, default=TAIL_N)
    ap.add_argument("--seed", type=int, default=SEED)
    args = ap.parse_args()

    rng = random.Random(args.seed)

    by_subset = {}
    with LABELS_CSV.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            by_subset.setdefault(row["subset"], []).append(
                {"filename": row["filename"], "mean_rating": float(row["mean_rating"]), "subset": row["subset"]}
            )

    picked = []
    for subset in sorted(by_subset):
        items = by_subset[subset]
        # sort by rating; ties broken by filename so the sort (and thus the sample) is deterministic
        items_sorted = sorted(items, key=lambda r: (r["mean_rating"], r["filename"]))
        n = len(items_sorted)
        tail = min(args.tail, n // 2)
        bottom = items_sorted[:tail]
        top = items_sorted[-tail:]
        chosen = {r["filename"]: ("bottom%d" % tail) for r in bottom}
        for r in top:
            chosen[r["filename"]] = "top%d" % tail
        # random fill from the middle (everything not already a forced tail)
        middle = [r for r in items_sorted if r["filename"] not in chosen]
        need = max(0, args.per_subset - len(chosen))
        rng.shuffle(middle)
        for r in middle[:need]:
            chosen[r["filename"]] = "random"
        lut = {r["filename"]: r for r in items_sorted}
        for fn, reason in chosen.items():
            r = lut[fn]
            picked.append({"filename": fn, "mean_rating": f"{r['mean_rating']:.6f}",
                           "subset": subset, "reason": reason})

    picked.sort(key=lambda r: (r["subset"], r["filename"]))
    with MANIFEST_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["filename", "mean_rating", "subset", "reason"])
        w.writeheader()
        w.writerows(picked)

    # summary
    from collections import Counter
    per = Counter(r["subset"] for r in picked)
    reasons = Counter(r["reason"] for r in picked)
    print(f"[sample] wrote {MANIFEST_CSV.relative_to(ROOT)}: {len(picked)} images (seed {args.seed})")
    print("[sample] per subset: " + ", ".join(f"{k}={per[k]}" for k in sorted(per)))
    print("[sample] by reason: " + ", ".join(f"{k}={reasons[k]}" for k in sorted(reasons)))
    missing = [r["filename"] for r in picked if not (CAL_DIR / "Images" / r["filename"]).exists()]
    print("[sample] all sampled images present on disk ✓" if not missing else f"[sample] MISSING {len(missing)}: {missing[:5]}")


if __name__ == "__main__":
    main()
