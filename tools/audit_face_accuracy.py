#!/usr/bin/env python3
"""Audit Face Calc discrimination on SCUT calibration rows and the out-of-sample roster batch.

The report separates ranking from display calibration. Any monotone 1–10 remap preserves every ordering,
so Spearman, AUC, and pairwise accuracy measure the model/crop while score distributions measure the map.
SCUT rows are training-contaminated and are reported as an optimistic in-distribution ceiling. The roster
labels are independent but editorial/subjective, so they are a pressure test rather than scientific truth.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import random
import re
import statistics
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCUT_JOINED = ROOT / "images" / "calibration-scut" / "joined_analysis.csv"
SCUT_MANIFEST = ROOT / "images" / "calibration-scut" / "sample_manifest.csv"
ROSTER_BATCH = ROOT / "data" / "face-roster-pressure-test.csv"
DEFAULT_REPORT = ROOT / "md" / "face-pressure-test-baseline.md"
DEFAULT_JSON = ROOT / "data" / "face-pressure-test-baseline.json"

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except Exception:  # pragma: no cover - older/redirected Python streams
        pass


def average_ranks(values: list[float]) -> list[float]:
    order = sorted(range(len(values)), key=values.__getitem__)
    ranks = [0.0] * len(values)
    i = 0
    while i < len(order):
        j = i
        while j + 1 < len(order) and values[order[j + 1]] == values[order[i]]:
            j += 1
        rank = (i + j) / 2 + 1
        for k in range(i, j + 1):
            ranks[order[k]] = rank
        i = j + 1
    return ranks


def pearson(xs: list[float], ys: list[float]) -> float:
    if len(xs) < 2 or len(xs) != len(ys):
        return math.nan
    mx, my = statistics.fmean(xs), statistics.fmean(ys)
    dx, dy = [x - mx for x in xs], [y - my for y in ys]
    denom = math.sqrt(sum(x * x for x in dx) * sum(y * y for y in dy))
    return sum(x * y for x, y in zip(dx, dy)) / denom if denom else math.nan


def spearman(xs: list[float], ys: list[float]) -> float:
    return pearson(average_ranks(xs), average_ranks(ys))


def auc(negative: list[float], positive: list[float]) -> float:
    """Probability that a random positive outranks a random negative; ties count half."""
    if not negative or not positive:
        return math.nan
    wins = 0.0
    for hi in positive:
        for lo in negative:
            wins += 1 if hi > lo else 0.5 if hi == lo else 0
    return wins / (len(negative) * len(positive))


def pairwise_accuracy(rows: list[dict], gap: float, group_key: str | None = None) -> tuple[float, int]:
    correct = ties = total = 0
    for i, left in enumerate(rows):
        for right in rows[i + 1:]:
            if group_key and left[group_key] != right[group_key]:
                continue
            delta = left["label"] - right["label"]
            if abs(delta) < gap:
                continue
            pred = left["raw"] - right["raw"]
            total += 1
            if pred == 0:
                ties += 1
            elif (pred > 0) == (delta > 0):
                correct += 1
    return ((correct + 0.5 * ties) / total if total else math.nan, total)


def quantile(values: list[float], p: float) -> float:
    ordered = sorted(values)
    if not ordered:
        return math.nan
    at = (len(ordered) - 1) * p
    lo, hi = math.floor(at), math.ceil(at)
    return ordered[lo] + (ordered[hi] - ordered[lo]) * (at - lo)


def bootstrap_ci(rows: list[dict], metric, rounds: int = 1000) -> tuple[float, float]:
    rng = random.Random(20260818)
    values = []
    for _ in range(rounds):
        sample = [rows[rng.randrange(len(rows))] for _ in rows]
        value = metric(sample)
        if math.isfinite(value):
            values.append(value)
    return quantile(values, 0.025), quantile(values, 0.975)


def load_scut() -> tuple[list[dict], list[dict]]:
    reasons = {}
    with SCUT_MANIFEST.open(encoding="utf-8", newline="") as file:
        for row in csv.DictReader(file):
            reasons[row["filename"]] = row["reason"]
    rows = []
    with SCUT_JOINED.open(encoding="utf-8", newline="") as file:
        for row in csv.DictReader(file):
            rows.append({
                "id": row["filename"], "group": row["subset"],
                "raw": float(row["model_raw"]), "label": float(row["scut_mean_rating"]),
                "reason": reasons.get(row["filename"], "unknown"),
            })
    return rows, [row for row in rows if row["reason"] == "random"]


def load_roster(path: Path = ROSTER_BATCH) -> tuple[list[dict], dict[str, int]]:
    rows, outcomes = [], defaultdict(int)
    with path.open(encoding="utf-8", newline="") as file:
        for row in csv.DictReader(file):
            outcomes[row["outcome"] or "unknown"] += 1
            if row["outcome"] != "scored" or not row["model_raw"]:
                continue
            rows.append({
                "id": row["slug"], "group": row["expected_sex"],
                "raw": float(row["model_raw"]), "score": float(row["bp"]),
                "label": float(row["expected_looks"]), "reliability": row["reliability"],
            })
    return rows, dict(outcomes)


def extreme_auc(rows: list[dict], within_group: bool) -> tuple[float, int, int]:
    lows, highs = [], []
    groups = defaultdict(list)
    for row in rows:
        groups[row["group"] if within_group else "all"].append(row)
    for group_rows in groups.values():
        q1 = quantile([row["label"] for row in group_rows], 0.25)
        q3 = quantile([row["label"] for row in group_rows], 0.75)
        lows.extend(row["raw"] for row in group_rows if row["label"] <= q1)
        highs.extend(row["raw"] for row in group_rows if row["label"] >= q3)
    return auc(lows, highs), len(lows), len(highs)


def summarize(rows: list[dict]) -> dict:
    xs, ys = [row["raw"] for row in rows], [row["label"] for row in rows]
    rho = spearman(xs, ys)
    lo, hi = bootstrap_ci(rows, lambda sample: spearman([r["raw"] for r in sample], [r["label"] for r in sample]))
    auc_value, n_low, n_high = extreme_auc(rows, within_group=True)
    p05, n05 = pairwise_accuracy(rows, 0.5, "group")
    p10, n10 = pairwise_accuracy(rows, 1.0, "group")
    return {
        "n": len(rows), "rho": rho, "rho_ci": (lo, hi), "pearson": pearson(xs, ys),
        "auc": auc_value, "auc_n": (n_low, n_high), "pair_05": (p05, n05), "pair_10": (p10, n10),
    }


def fmt(value: float, digits: int = 3) -> str:
    return "n/a" if not math.isfinite(value) else f"{value:.{digits}f}"


def table_row(name: str, summary: dict) -> str:
    return (f"| {name} | {summary['n']} | {fmt(summary['rho'])} "
            f"[{fmt(summary['rho_ci'][0])}, {fmt(summary['rho_ci'][1])}] | {fmt(summary['pearson'])} | "
            f"{fmt(summary['auc'])} ({summary['auc_n'][0]}/{summary['auc_n'][1]}) | "
            f"{fmt(summary['pair_05'][0])} (n={summary['pair_05'][1]}) | "
            f"{fmt(summary['pair_10'][0])} (n={summary['pair_10'][1]}) |")


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for block in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def finite_or_none(value: float) -> float | None:
    return value if math.isfinite(value) else None


def summary_payload(summary: dict) -> dict:
    return {
        "n_scored": summary["n"],
        "spearman_rho": finite_or_none(summary["rho"]),
        "spearman_bootstrap_95_ci": [finite_or_none(x) for x in summary["rho_ci"]],
        "pearson_r": finite_or_none(summary["pearson"]),
        "within_group_top_bottom_quartile_auc": finite_or_none(summary["auc"]),
        "top_bottom_counts": {"low": summary["auc_n"][0], "high": summary["auc_n"][1]},
        "within_group_pairwise_accuracy_gap_0_5": {
            "value": finite_or_none(summary["pair_05"][0]), "pairs": summary["pair_05"][1],
        },
        "within_group_pairwise_accuracy_gap_1_0": {
            "value": finite_or_none(summary["pair_10"][0]), "pairs": summary["pair_10"][1],
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", nargs="?", const=str(DEFAULT_REPORT), help="write Markdown report")
    parser.add_argument("--roster", type=Path, default=ROSTER_BATCH,
                        help="roster browser-batch CSV (defaults to the working pressure-test artifact)")
    parser.add_argument("--json", nargs="?", const=str(DEFAULT_JSON), dest="json_output",
                        help="write a machine-readable audit artifact")
    args = parser.parse_args()
    roster_path = args.roster.resolve()

    scut_all, scut_random = load_scut()
    roster, outcomes = load_roster(roster_path)
    summaries = {
        "SCUT balanced, tail-enriched (training-contaminated)": summarize(scut_all),
        "SCUT balanced random-only (training-contaminated)": summarize(scut_random),
        "Roster canonical portraits (independent editorial labels)": summarize(roster),
    }
    subgroup = {group: summarize([row for row in roster if row["group"] == group]) for group in sorted({r["group"] for r in roster})}

    score_values = [row["score"] for row in roster]
    label_values = [row["label"] for row in roster]
    residuals = [row["score"] - row["label"] for row in roster]
    cautions = sum(bool(row["reliability"].strip()) for row in roster)
    roster_auc, n_low, n_high = extreme_auc(roster, within_group=True)

    lines = [
        "# Face Calculator pressure-test baseline",
        "",
        "Generated 2026-08-18 from the shipped `face.html` browser pipeline.",
        "",
        "## Bottom line",
        "",
        (f"The model's out-of-sample roster rank correlation is **ρ={fmt(summaries['Roster canonical portraits (independent editorial labels)']['rho'])}** "
         f"and its within-sex top-vs-bottom-quartile AUC is **{fmt(roster_auc)}** ({n_low} low / {n_high} high). "
         "That is the honest discrimination baseline. A monotone display remap cannot improve either number; it can only redistribute the visible 1–10 values."),
        "",
        "SCUT results are an optimistic ceiling because the shipped ONNX checkpoint was trained on SCUT and no holdout manifest is available. "
        "Roster labels are independent of the model but remain one site's editorial judgments, not universal ground truth.",
        "",
        "## Ranking and extreme separation",
        "",
        "| Dataset | Scored n | Spearman ρ (bootstrap 95% CI) | Pearson r | top/bottom quartile AUC (low/high n) | pairwise accuracy, ≥0.5 label gap | pairwise accuracy, ≥1.0 label gap |",
        "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
        *[table_row(name, summary) for name, summary in summaries.items()],
        "",
        "Pairwise comparisons are within demographic subset for SCUT and within expected sex for the roster, so group-level score offsets cannot inflate the result.",
        "",
        "## Roster capture and scale diagnostics",
        "",
        f"- Batch outcomes: {', '.join(f'{key}={value}' for key, value in sorted(outcomes.items()))}.",
        f"- Reliability cautions among scored rows: {cautions}/{len(roster)}.",
        f"- Displayed score: median {fmt(statistics.median(score_values), 2)}, p10 {fmt(quantile(score_values, .1), 2)}, p90 {fmt(quantile(score_values, .9), 2)}.",
        f"- Editorial label: median {fmt(statistics.median(label_values), 2)}, p10 {fmt(quantile(label_values, .1), 2)}, p90 {fmt(quantile(label_values, .9), 2)}.",
        f"- Display minus editorial label: mean {fmt(statistics.fmean(residuals), 2)}, median {fmt(statistics.median(residuals), 2)}, MAE {fmt(statistics.fmean(abs(x) for x in residuals), 2)}.",
        "",
        "The residual is descriptive only: the Face Calc scale is a percentile transform of SCUT model outputs, while Matchmaker labels are hand-authored 1–10 ratings. "
        "Forcing zero residual would conflate two different conventions and would still not repair ordering errors.",
        "",
        "## Roster subgroups",
        "",
        "| Expected sex | n | Spearman ρ | top/bottom quartile AUC | ≥1.0-gap pairwise accuracy |",
        "| --- | ---: | ---: | ---: | ---: |",
        *[
            f"| {group} | {summary['n']} | {fmt(summary['rho'])} | {fmt(summary['auc'])} | {fmt(summary['pair_10'][0])} (n={summary['pair_10'][1]}) |"
            for group, summary in subgroup.items()
        ],
        "",
        "## Interpretation guardrails",
        "",
        "- High-vs-low separation is the defensible claim; adjacent one-decimal distinctions are much harder and should not be described as precise.",
        "- The SCUT model covers only two race groups, studio-like frontal images, and one rater population. Roster portraits broaden image conditions but do not supply controlled demographic labels.",
        "- Scores can move with crop, focal length, expression, grooming, lighting, age, and image quality. Multi-photo identity stability must be tested separately on the roster galleries.",
        "- Any future recalibration must be fitted on one split and reported on a disjoint holdout. Never select a curve on the same rows used to advertise improvement.",
        "",
    ]
    report = "\n".join(lines)
    print(report)
    if args.write:
        destination = Path(args.write).resolve()
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(report + "\n", encoding="utf-8")
        print(f"\n[write] {destination.relative_to(ROOT)}")
    if args.json_output:
        roster_summary = summaries["Roster canonical portraits (independent editorial labels)"]
        auc_ci = bootstrap_ci(roster, lambda sample: extreme_auc(sample, within_group=True)[0])
        pair_10_ci = bootstrap_ci(roster, lambda sample: pairwise_accuracy(sample, 1.0, "group")[0])
        payload = {
            "schema_version": "face-pressure-test-baseline.v1",
            "generated_date": "2026-08-18",
            "pipeline": "shipped face.html browser batch",
            "inputs": {
                "roster_batch": {
                    "path": roster_path.relative_to(ROOT).as_posix(),
                    "sha256": sha256_file(roster_path),
                    "submitted_rows": sum(outcomes.values()),
                },
                "scut_joined": {
                    "path": SCUT_JOINED.relative_to(ROOT).as_posix(),
                    "sha256": sha256_file(SCUT_JOINED),
                },
                "scut_manifest": {
                    "path": SCUT_MANIFEST.relative_to(ROOT).as_posix(),
                    "sha256": sha256_file(SCUT_MANIFEST),
                },
            },
            "bootstrap": {"rounds": 1000, "seed": 20260818, "resampling_unit": "identity/image row"},
            "datasets": {name: summary_payload(summary) for name, summary in summaries.items()},
            "roster_primary_confidence_intervals": {
                "within_sex_top_bottom_quartile_auc_95_ci": [finite_or_none(x) for x in auc_ci],
                "within_sex_pairwise_accuracy_gap_1_0_95_ci": [finite_or_none(x) for x in pair_10_ci],
            },
            "roster_outcomes": dict(sorted(outcomes.items())),
            "roster_diagnostics": {
                "reliability_cautions": cautions,
                "display_score": {
                    "median": statistics.median(score_values),
                    "p10": quantile(score_values, .1),
                    "p90": quantile(score_values, .9),
                },
                "editorial_label": {
                    "median": statistics.median(label_values),
                    "p10": quantile(label_values, .1),
                    "p90": quantile(label_values, .9),
                },
                "display_minus_editorial": {
                    "mean": statistics.fmean(residuals),
                    "median": statistics.median(residuals),
                    "mae": statistics.fmean(abs(x) for x in residuals),
                },
            },
            "expected_sex_subgroups": {
                group: summary_payload(summary) for group, summary in subgroup.items()
            },
            "interpretation": {
                "roster_labels": "independent Matchmaker editorial judgments, not scientific ground truth or universal consensus",
                "scut": "training-contaminated because the shipped Gustrd checkpoint was trained on SCUT-FBP5500",
                "display_remap": "monotone score remaps cannot improve ranking metrics",
            },
        }
        destination = Path(args.json_output).resolve()
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print(f"\n[write] {destination.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
