"""Derive Face Calc MODEL_CONFIG.outMin/outMax from the shipped-pipeline batch run.

DOM-free analysis (spec §4). Joins the browser batch CSV (model_raw per image, scored through face.html's
EXACT crop + trained model at localhost:8753) with the SCUT-FBP5500 label table (mean rating, subset), then:

  a. Proposed anchors  = p2 / p98 of the model_raw distribution over SCORED images.
  b. Spearman rho      = rank correlation of model_raw vs SCUT mean rating, overall AND per subset.
  c. Contamination     = our face-beauty.onnx is the Gustrd SCUT-FBP5500 checkpoint (models/README.md);
                         no holdout manifest is recorded in-repo / alongside it, so ALL sampled images are
                         treated as training-seen and rho is reported as OPTIMISTIC. Anchors are unaffected
                         (they only locate the output distribution).
  d. Before/after      = at model_raw p5/p25/p50/p75/p95, the displayed Black Pill + Conventional headline
                         under OLD (1.5/4.5) vs NEW anchors, via a faithful port of face.html's mapModelScore,
                         cross-checked against the harness's own bp/cv output under the old anchors.

Pure stdlib + numpy (no scipy/pandas): the Spearman + percentile code is intentionally self-contained so an
independent verifier can re-derive the same numbers with separate code.

Usage:
    python tools/calibrate_face_anchors.py
"""

import csv
import json
import re
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CAL_DIR = ROOT / "images" / "calibration-scut"
BATCH_CSV = CAL_DIR / "batch_results.csv"
LABELS_CSV = CAL_DIR / "labels.csv"
OUT_JSON = CAL_DIR / "anchor_analysis.json"
JOINED_CSV = CAL_DIR / "joined_analysis.csv"

OLD_MIN, OLD_MAX = 1.5, 4.5

# face.html PROFILES (read-only mirror; DO NOT edit the page's copy). gamma shifts the middle; contrast is the
# sigmoid exponent; scaleMax is the top of each lens's displayed range.
PROFILES = {
    "blackpill":    {"gamma": 1.0, "contrast": 1.75, "scaleMax": 8.6},
    "conventional": {"gamma": 0.9, "contrast": 1.35, "scaleMax": 10.0},
}


def map_model_score(t, prof):
    """Faithful port of face.html mapModelScore(t, profKey): t is the normalized model score in [0,1]."""
    x = max(0.0, min(1.0, t))
    k = prof["contrast"]
    if k != 1:
        a = x ** k
        b = (1 - x) ** k
        x = a / (a + b) if (a + b) else x
    x = x ** prof["gamma"]
    return 1 + (prof["scaleMax"] - 1) * x


def norm(raw, lo, hi):
    return max(0.0, min(1.0, (raw - lo) / (hi - lo)))


def displayed(raw, lo, hi, prof):
    return map_model_score(norm(raw, lo, hi), prof)


def js_round2(x):
    """Match JS n2(): (Math.round(x*100)/100).toFixed(2). Math.round is half-UP toward +inf."""
    import math
    r = math.floor(x * 100 + 0.5) / 100.0
    return f"{r:.2f}"


def spearman(x, y):
    """Spearman rho via Pearson on average-tie ranks. Self-contained (no scipy)."""
    x = np.asarray(x, float)
    y = np.asarray(y, float)

    def rankavg(a):
        order = np.argsort(a, kind="mergesort")
        sa = a[order]
        ranks = np.empty(len(a), float)
        i = 0
        while i < len(a):
            j = i
            while j + 1 < len(a) and sa[j + 1] == sa[i]:
                j += 1
            ranks[order[i:j + 1]] = (i + j) / 2.0 + 1.0  # 1-based average rank
            i = j + 1
        return ranks

    rx, ry = rankavg(x), rankavg(y)
    rx = rx - rx.mean()
    ry = ry - ry.mean()
    denom = np.sqrt((rx @ rx) * (ry @ ry))
    return float((rx @ ry) / denom) if denom else float("nan")


def pearson(x, y):
    x = np.asarray(x, float); y = np.asarray(y, float)
    x = x - x.mean(); y = y - y.mean()
    d = np.sqrt((x @ x) * (y @ y))
    return float((x @ y) / d) if d else float("nan")


def load():
    labels = {}
    for r in csv.DictReader(LABELS_CSV.open(encoding="utf-8")):
        labels[r["filename"]] = {"rating": float(r["mean_rating"]), "subset": r["subset"]}
    rows = []
    for r in csv.DictReader(BATCH_CSV.open(encoding="utf-8", newline="")):
        if r["outcome"] != "scored" or not r["model_raw"]:
            rows.append({"filename": r["filename"], "outcome": r["outcome"], "raw": None,
                         "bp": r["bp"], "cv": r["cv"], "refusal": r["refusal_reason"]})
            continue
        lab = labels.get(r["filename"])
        if lab is None:
            continue
        rows.append({"filename": r["filename"], "outcome": "scored", "raw": float(r["model_raw"]),
                     "bp": r["bp"], "cv": r["cv"], "rating": lab["rating"], "subset": lab["subset"]})
    return rows


def main():
    rows = load()
    scored = [r for r in rows if r["outcome"] == "scored"]
    refused = [r for r in rows if r["outcome"] != "scored"]
    raws = np.array([r["raw"] for r in scored], float)
    ratings = np.array([r["rating"] for r in scored], float)

    print(f"N scored = {len(scored)} | N refused/error = {len(refused)}")
    print(f"model_raw: min={raws.min():.3f} max={raws.max():.3f} mean={raws.mean():.3f} sd={raws.std(ddof=1):.3f}")

    # (a) anchors = p2 / p98 of model_raw over scored
    p2 = float(np.percentile(raws, 2))
    p98 = float(np.percentile(raws, 98))
    new_min, new_max = round(p2, 3), round(p98, 3)
    print(f"\n(a) PROPOSED ANCHORS  outMin=p2={new_min}  outMax=p98={new_max}   (old {OLD_MIN}/{OLD_MAX})")
    clamp_lo_old = int((raws < OLD_MIN).sum()); clamp_hi_old = int((raws > OLD_MAX).sum())
    clamp_lo_new = int((raws < new_min).sum()); clamp_hi_new = int((raws > new_max).sum())
    print(f"    faces clamped (norm hits 0/1):  OLD {clamp_lo_old} low + {clamp_hi_old} high"
          f"  |  NEW {clamp_lo_new} low + {clamp_hi_new} high (~2% each tail by construction)")

    # (b) Spearman overall + per subset
    rho_all = spearman(raws, ratings)
    r_all = pearson(raws, ratings)
    print(f"\n(b) SPEARMAN rho (model_raw vs SCUT mean rating):")
    print(f"    OVERALL  rho={rho_all:.3f}  (Pearson r={r_all:.3f}, n={len(scored)})")
    per_subset = {}
    for sub in sorted(set(r["subset"] for r in scored)):
        idx = [i for i, r in enumerate(scored) if r["subset"] == sub]
        rr = raws[idx]; tt = ratings[idx]
        rho = spearman(rr, tt)
        per_subset[sub] = {"n": len(idx), "rho": rho, "pearson": pearson(rr, tt)}
        print(f"    {sub}  rho={rho:.3f}  (Pearson r={per_subset[sub]['pearson']:.3f}, n={len(idx)})")

    # (c) contamination
    print("\n(c) CONTAMINATION: face-beauty.onnx == Gustrd SCUT-FBP5500 checkpoint (models/README.md);")
    print("    no holdout manifest recorded in-repo/alongside the model -> ALL images treated as training-seen.")
    print("    => rho above is OPTIMISTIC (in-distribution upper bound). Anchors unaffected.")

    # cross-check the mapModelScore port against the harness's own bp/cv (old anchors) on every scored row
    bp_mism = cv_mism = 0
    bp_maxd = cv_maxd = 0.0
    for r in scored:
        bp_port = js_round2(displayed(r["raw"], OLD_MIN, OLD_MAX, PROFILES["blackpill"]))
        cv_port = js_round2(displayed(r["raw"], OLD_MIN, OLD_MAX, PROFILES["conventional"]))
        if bp_port != r["bp"]:
            bp_mism += 1; bp_maxd = max(bp_maxd, abs(float(bp_port) - float(r["bp"])))
        if cv_port != r["cv"]:
            cv_mism += 1; cv_maxd = max(cv_maxd, abs(float(cv_port) - float(r["cv"])))
    print(f"\n[port check] mapModelScore port vs harness bp/cv under OLD anchors over {len(scored)} rows:")
    print(f"    bp exact-match {len(scored)-bp_mism}/{len(scored)} (max |diff| {bp_maxd:.2f});"
          f" cv exact-match {len(scored)-cv_mism}/{len(scored)} (max |diff| {cv_maxd:.2f})")
    print("    (tiny mismatches expected only at a 2-dp rounding boundary, since raw is logged to 3 dp)")

    # (d) before/after table at model_raw p5/p25/p50/p75/p95
    print("\n(d) BEFORE/AFTER at model_raw percentiles (displayed headline BP | CV):")
    print("    pct   raw    | OLD 1.5/4.5  BP    CV   | NEW %.3f/%.3f  BP    CV" % (new_min, new_max))
    table = []
    for pct in (5, 25, 50, 75, 95):
        raw = float(np.percentile(raws, pct))
        old_bp = displayed(raw, OLD_MIN, OLD_MAX, PROFILES["blackpill"])
        old_cv = displayed(raw, OLD_MIN, OLD_MAX, PROFILES["conventional"])
        new_bp = displayed(raw, new_min, new_max, PROFILES["blackpill"])
        new_cv = displayed(raw, new_min, new_max, PROFILES["conventional"])
        table.append({"pct": pct, "raw": round(raw, 3),
                      "old_bp": round(old_bp, 2), "old_cv": round(old_cv, 2),
                      "new_bp": round(new_bp, 2), "new_cv": round(new_cv, 2)})
        print(f"    p{pct:<3} {raw:6.3f} |            {old_bp:5.2f} {old_cv:5.2f} |"
              f"                 {new_bp:5.2f} {new_cv:5.2f}")

    # write joined table + machine-readable summary
    with JOINED_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["filename", "subset", "model_raw", "scut_mean_rating", "bp_old", "cv_old"])
        for r in sorted(scored, key=lambda r: r["filename"]):
            w.writerow([r["filename"], r["subset"], f"{r['raw']:.3f}", f"{r['rating']:.6f}", r["bp"], r["cv"]])

    summary = {
        "n_scored": len(scored), "n_refused": len(refused),
        "model_raw": {"min": round(float(raws.min()), 3), "max": round(float(raws.max()), 3),
                      "mean": round(float(raws.mean()), 3), "sd": round(float(raws.std(ddof=1)), 3)},
        "anchors": {"old": [OLD_MIN, OLD_MAX], "new": [new_min, new_max], "p2": round(p2, 4), "p98": round(p98, 4)},
        "clamp": {"old": [clamp_lo_old, clamp_hi_old], "new": [clamp_lo_new, clamp_hi_new]},
        "spearman": {"overall": round(rho_all, 4), "pearson_overall": round(r_all, 4),
                     "per_subset": {k: {"n": v["n"], "rho": round(v["rho"], 4),
                                        "pearson": round(v["pearson"], 4)} for k, v in per_subset.items()}},
        "contamination": "all-training-seen (Gustrd SCUT checkpoint; no holdout manifest) -> rho optimistic",
        "port_check": {"bp_exact": len(scored) - bp_mism, "cv_exact": len(scored) - cv_mism,
                       "n": len(scored), "bp_maxdiff": round(bp_maxd, 3), "cv_maxdiff": round(cv_maxd, 3)},
        "before_after": table,
    }
    OUT_JSON.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(f"\n[write] {JOINED_CSV.name} + {OUT_JSON.name}")

    # pre-registered thresholds (report only; do NOT act)
    print("\n(5) PRE-REGISTERED THRESHOLDS (report-only; Jason rules on any action):")
    verdict = ("rho >= 0.6 -> scale trustworthy as displayed" if rho_all >= 0.6 else
               "0.4 <= rho < 0.6 -> FLAG: one-decimal display may overstate resolving power (Jason ruling)"
               if rho_all >= 0.4 else
               "rho < 0.4 -> land anchors, flag model discrimination as the finding")
    print(f"    overall rho={rho_all:.3f} (optimistic)  ->  {verdict}")


if __name__ == "__main__":
    main()
