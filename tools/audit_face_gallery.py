#!/usr/bin/env python3
"""Identity-grouped audit for Face Calculator roster gallery batches.

All resampling is at the identity level. Images never cross train/validation/holdout boundaries.
Matchmaker labels are treated as editorial judgments, not scientific or universal ground truth.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import itertools
import json
import math
import random
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path
from statistics import NormalDist

from audit_face_accuracy import extreme_auc, pairwise_accuracy, pearson, quantile, spearman

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BATCH = ROOT / "data" / "face-roster-gallery-before.csv"
DEFAULT_BATCH_META = ROOT / "data" / "face-roster-gallery-before.meta.json"
DEFAULT_SPLIT = ROOT / "data" / "face-identity-split-v1.csv"
DEFAULT_JSON = ROOT / "data" / "face-gallery-stability-before.json"
DEFAULT_IDENTITIES = ROOT / "data" / "face-gallery-identity-before.csv"
DEFAULT_REPORT = ROOT / "md" / "face-gallery-stability-before.md"
FACE_HTML = ROOT / "face.html"
BOOTSTRAP_SEED = 20260818
BOOTSTRAP_ROUNDS = 1000
DEMOGRAPHIC_MIN_IDENTITIES = 20

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except Exception:
        pass


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def finite(value):
    return isinstance(value, (int, float)) and math.isfinite(value)


def json_number(value):
    return value if finite(value) else None


def fmt(value, digits=3):
    return "n/a" if value is None or not finite(value) else f"{value:.{digits}f}"


def metric_value_ci(metric: dict, digits=3) -> str:
    value = metric.get("value")
    ci = metric.get("bootstrap_95_ci", [None, None])
    return f"{fmt(value, digits)} [{fmt(ci[0], digits)}, {fmt(ci[1], digits)}]"


def stable_seed(salt: str) -> int:
    digest = hashlib.sha256(f"{BOOTSTRAP_SEED}:{salt}".encode()).digest()
    return int.from_bytes(digest[:8], "big")


def bootstrap_ci(items: list, metric, salt: str, rounds: int = BOOTSTRAP_ROUNDS):
    if not items:
        return [None, None]
    rng = random.Random(stable_seed(salt))
    values = []
    for _ in range(rounds):
        sample = [items[rng.randrange(len(items))] for _ in items]
        value = metric(sample)
        if finite(value):
            values.append(value)
    if not values:
        return [None, None]
    return [quantile(values, 0.025), quantile(values, 0.975)]


def median_absolute_deviation(values: list[float]) -> float:
    center = statistics.median(values)
    return statistics.median(abs(value - center) for value in values)


def parse_ref_raw(path: Path) -> list[float]:
    import re
    source = path.read_text(encoding="utf-8")
    match = re.search(r"const REF_RAW = \[(.*?)\];", source, re.S)
    if not match:
        raise ValueError("Could not locate face.html REF_RAW.")
    values = [float(value) for value in re.findall(r"-?[0-9]+(?:\.[0-9]+)?", match.group(1))]
    if len(values) < 2 or any(right <= left for left, right in zip(values, values[1:])):
        raise ValueError("REF_RAW must contain at least two strictly increasing finite values.")
    return values


def ref_percentile(raw: float, ref_raw: list[float]) -> float:
    if not finite(raw):
        raise ValueError("Non-finite raw score.")
    if raw <= ref_raw[0]:
        return 0.0
    if raw >= ref_raw[-1]:
        return 1.0
    lo, hi = 0, len(ref_raw) - 1
    while hi - lo > 1:
        mid = (lo + hi) // 2
        if ref_raw[mid] <= raw:
            lo = mid
        else:
            hi = mid
    fraction = (raw - ref_raw[lo]) / (ref_raw[hi] - ref_raw[lo])
    return (lo + fraction) / (len(ref_raw) - 1)


def score_from_raw(raw: float, ref_raw: list[float]) -> float:
    percentile = min(max(ref_percentile(raw, ref_raw), 1e-6), 1 - 1e-6)
    return min(10.0, max(1.0, 5.5 + NormalDist().inv_cdf(percentile) * 1.4))


def load_split(path: Path) -> dict[str, dict]:
    rows = {}
    with path.open(encoding="utf-8", newline="") as file:
        for row in csv.DictReader(file):
            identity = row["identity_id"]
            if identity in rows:
                raise ValueError(f"Duplicate split identity: {identity}")
            rows[identity] = row
    if not rows:
        raise ValueError("Identity split is empty.")
    return rows


def load_gallery(path: Path, split_rows: dict[str, dict]) -> tuple[list[dict], dict[str, list[dict]]]:
    flat = []
    grouped: dict[str, list[dict]] = defaultdict(list)
    required = {
        "identity_id", "expected_looks", "expected_sex", "editorial_ethnicity", "split",
        "image_id", "relative_path", "outcome", "model_raw",
    }
    with path.open(encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file)
        missing = required - set(reader.fieldnames or [])
        if missing:
            raise ValueError(f"Gallery batch missing columns: {sorted(missing)}")
        for index, row in enumerate(reader):
            identity = row["identity_id"]
            frozen = split_rows.get(identity)
            if not frozen:
                raise ValueError(f"Gallery identity absent from frozen split: {identity}")
            checks = {
                "expected_sex": row["expected_sex"],
                "expected_looks": row["expected_looks"],
                "editorial_ethnicity": row["editorial_ethnicity"],
                "split": row["split"],
            }
            for key, value in checks.items():
                if value != frozen[key]:
                    raise ValueError(f"Frozen metadata mismatch for {identity}: {key}")
            outcome = row["outcome"] or "unknown"
            raw = None
            if outcome == "scored":
                if not row["model_raw"]:
                    raise ValueError(f"Scored row lacks model_raw: {row['relative_path']}")
                raw = float(row["model_raw"])
                if not finite(raw):
                    raise ValueError(f"Non-finite model_raw: {row['relative_path']}")
            elif row["model_raw"]:
                raise ValueError(f"Non-scored row unexpectedly has model_raw: {row['relative_path']}")
            item = {**row, "source_index": index, "label": float(row["expected_looks"]),
                    "group": row["expected_sex"], "raw": raw}
            flat.append(item)
            grouped[identity].append(item)
    if set(grouped) != set(split_rows):
        absent = sorted(set(split_rows) - set(grouped))
        extra = sorted(set(grouped) - set(split_rows))
        raise ValueError(f"Gallery identity coverage mismatch: absent={absent}, extra={extra}")
    for identity, rows in grouped.items():
        expected = int(split_rows[identity]["gallery_image_count"])
        if len(rows) != expected:
            raise ValueError(f"Gallery image count drift for {identity}: {len(rows)} != {expected}")
    return flat, dict(grouped)


def identity_summary(identity: str, rows: list[dict], frozen: dict, ref_raw: list[float]) -> dict:
    scored = [row for row in rows if row["raw"] is not None]
    raws = [row["raw"] for row in scored]
    worst = None
    if len(scored) >= 2:
        left, right = max(itertools.combinations(scored, 2),
                          key=lambda pair: abs(pair[0]["raw"] - pair[1]["raw"]))
        worst = {
            "image_a": left["relative_path"], "raw_a": left["raw"],
            "image_b": right["relative_path"], "raw_b": right["raw"],
            "absolute_raw_gap": abs(left["raw"] - right["raw"]),
        }
    outcome_counts = Counter(row["outcome"] or "unknown" for row in rows)
    raw_mean = statistics.fmean(raws) if raws else None
    return {
        "identity_id": identity,
        "expected_sex": frozen["expected_sex"],
        "expected_looks": float(frozen["expected_looks"]),
        "editorial_ethnicity": frozen["editorial_ethnicity"],
        "split": frozen["split"],
        "submitted_images": len(rows),
        "scored_images": len(scored),
        "refused_images": outcome_counts.get("refused", 0),
        "error_images": len(rows) - len(scored) - outcome_counts.get("refused", 0),
        "refusal_rate": outcome_counts.get("refused", 0) / len(rows),
        "raw_mean": raw_mean,
        "aggregate_display_score": score_from_raw(raw_mean, ref_raw) if raw_mean is not None else None,
        "raw_sd": statistics.stdev(raws) if len(raws) >= 2 else None,
        "raw_range": max(raws) - min(raws) if len(raws) >= 2 else None,
        "raw_mad": median_absolute_deviation(raws) if len(raws) >= 2 else None,
        "worst_pair": worst,
        "raws": raws,
        "scored_paths": [row["relative_path"] for row in scored],
        "refusal_reasons": [row["refusal_reason"] for row in rows if row["outcome"] == "refused"],
    }


def discrimination_rows(items: list[dict]) -> list[dict]:
    return [{"id": item["identity_id"], "group": item["expected_sex"],
             "label": item["expected_looks"], "raw": item["raw_mean"]}
            for item in items if item["raw_mean"] is not None]


def discrimination_summary(items: list[dict], salt: str) -> dict:
    scored = discrimination_rows(items)
    rho = spearman([row["raw"] for row in scored], [row["label"] for row in scored]) if len(scored) >= 2 else math.nan
    auc_value, n_low, n_high = extreme_auc(scored, within_group=True)
    pair_value, pairs = pairwise_accuracy(scored, 1.0, "group")
    return {
        "eligible_identities": len(scored),
        "spearman_rho": {
            "value": json_number(rho),
            "bootstrap_95_ci": bootstrap_ci(
                scored,
                lambda sample: spearman([row["raw"] for row in sample], [row["label"] for row in sample]),
                f"{salt}:rho",
            ),
        },
        "pearson_r": json_number(pearson([row["raw"] for row in scored], [row["label"] for row in scored])
                                 if len(scored) >= 2 else math.nan),
        "within_sex_top_bottom_quartile_auc": {
            "value": json_number(auc_value),
            "bootstrap_95_ci": bootstrap_ci(
                scored, lambda sample: extreme_auc(sample, within_group=True)[0], f"{salt}:auc"
            ),
            "low_identities": n_low, "high_identities": n_high,
        },
        "within_sex_pairwise_accuracy_gap_1_0": {
            "value": json_number(pair_value),
            "bootstrap_95_ci": bootstrap_ci(
                scored, lambda sample: pairwise_accuracy(sample, 1.0, "group")[0], f"{salt}:pair10"
            ),
            "eligible_pairs": pairs,
        },
    }


def median_metric(items: list[dict], key: str, salt: str):
    eligible = [item for item in items if item[key] is not None]
    value = statistics.median(item[key] for item in eligible) if eligible else math.nan
    return {
        "value": json_number(value),
        "bootstrap_95_ci": bootstrap_ci(
            eligible, lambda sample: statistics.median(item[key] for item in sample), salt
        ),
        "eligible_identities": len(eligible),
    }


def split_summary(items: list[dict], salt: str) -> dict:
    submitted = sum(item["submitted_images"] for item in items)
    refused = sum(item["refused_images"] for item in items)
    scored_images = sum(item["scored_images"] for item in items)
    all_refused = sum(item["scored_images"] == 0 for item in items)
    refusal_rate = refused / submitted if submitted else math.nan
    return {
        "identities": len(items),
        "identities_with_score": len(items) - all_refused,
        "identities_all_refused": all_refused,
        "images": {"submitted": submitted, "scored": scored_images, "refused": refused,
                   "errors": submitted - scored_images - refused},
        "image_refusal_rate": {
            "value": json_number(refusal_rate),
            "bootstrap_95_ci": bootstrap_ci(
                items,
                lambda sample: sum(item["refused_images"] for item in sample)
                / sum(item["submitted_images"] for item in sample),
                f"{salt}:refusal",
            ),
        },
        "discrimination": discrimination_summary(items, f"{salt}:disc"),
        "cross_photo_stability_raw": {
            "median_sd": median_metric(items, "raw_sd", f"{salt}:sd"),
            "median_range": median_metric(items, "raw_range", f"{salt}:range"),
            "median_mad": median_metric(items, "raw_mad", f"{salt}:mad"),
        },
    }


def multi_photo_aggregation(items: list[dict], k: int, salt: str,
                            minimum_scored_photos: int = 4) -> dict:
    """Compare k-photo raw means on one fixed >=minimum cohort.

    All-photo consensus error is comparable across k because the eligible identities
    never change. Held-out-remainder error is retained as a secondary diagnostic.
    """
    per_identity = []
    for item in items:
        raws = item["raws"]
        if len(raws) < minimum_scored_photos:
            continue
        consensus = statistics.fmean(raws)
        estimates, consensus_errors, heldout_errors = [], [], []
        indices = range(len(raws))
        for selected in itertools.combinations(indices, k):
            selected_set = set(selected)
            estimate = statistics.fmean(raws[index] for index in selected)
            remainder = statistics.fmean(raws[index] for index in indices if index not in selected_set)
            estimates.append(estimate)
            consensus_errors.append(abs(estimate - consensus))
            heldout_errors.append(abs(estimate - remainder))
        per_identity.append({
            "identity_id": item["identity_id"],
            "consensus_mae": statistics.fmean(consensus_errors),
            "heldout_mae": statistics.fmean(heldout_errors),
            "subset_estimate_sd": statistics.stdev(estimates) if len(estimates) >= 2 else 0.0,
            "subset_estimate_range": max(estimates) - min(estimates),
            "combinations": len(estimates),
        })
    if not per_identity:
        return {
            "photos_averaged": k,
            "minimum_scored_photos": minimum_scored_photos,
            "eligible_identities": 0,
        }
    return {
        "photos_averaged": k,
        "minimum_scored_photos": minimum_scored_photos,
        "eligible_identities": len(per_identity),
        "identity_weighted_mean_absolute_raw_error_to_all_photo_consensus": {
            "value": statistics.fmean(item["consensus_mae"] for item in per_identity),
            "bootstrap_95_ci": bootstrap_ci(
                per_identity, lambda sample: statistics.fmean(item["consensus_mae"] for item in sample),
                f"{salt}:k{k}:consensus-mae",
            ),
        },
        "identity_weighted_mean_heldout_remainder_absolute_raw_error": {
            "value": statistics.fmean(item["heldout_mae"] for item in per_identity),
            "bootstrap_95_ci": bootstrap_ci(
                per_identity, lambda sample: statistics.fmean(item["heldout_mae"] for item in sample),
                f"{salt}:k{k}:heldout-mae",
            ),
        },
        "median_subset_estimate_sd": {
            "value": statistics.median(item["subset_estimate_sd"] for item in per_identity),
            "bootstrap_95_ci": bootstrap_ci(
                per_identity, lambda sample: statistics.median(item["subset_estimate_sd"] for item in sample),
                f"{salt}:k{k}:sd",
            ),
        },
        "median_subset_estimate_range": {
            "value": statistics.median(item["subset_estimate_range"] for item in per_identity),
            "bootstrap_95_ci": bootstrap_ci(
                per_identity, lambda sample: statistics.median(item["subset_estimate_range"] for item in sample),
                f"{salt}:k{k}:range",
            ),
        },
    }

def supportable_ethnicity_groups(items: list[dict]) -> dict[str, list[dict]]:
    grouped = defaultdict(list)
    for item in items:
        grouped[item["editorial_ethnicity"]].append(item)
    eligible = {}
    for group, rows in grouped.items():
        scored = discrimination_rows(rows)
        if len(scored) < DEMOGRAPHIC_MIN_IDENTITIES:
            continue
        _, n_low, n_high = extreme_auc(scored, within_group=True)
        if n_low and n_high:
            eligible[group] = rows
    return dict(sorted(eligible.items()))


def identity_csv_text(items: list[dict]) -> str:
    import io
    columns = [
        "identity_id", "split", "expected_sex", "expected_looks", "editorial_ethnicity",
        "submitted_images", "scored_images", "refused_images", "error_images", "refusal_rate",
        "raw_mean", "aggregate_display_score", "raw_sd", "raw_range", "raw_mad",
        "worst_pair_absolute_raw_gap", "worst_pair_image_a", "worst_pair_raw_a",
        "worst_pair_image_b", "worst_pair_raw_b",
    ]
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=columns, lineterminator="\n")
    writer.writeheader()
    for item in sorted(items, key=lambda row: row["identity_id"]):
        worst = item["worst_pair"] or {}
        row = {key: item.get(key, "") for key in columns}
        row.update({
            "worst_pair_absolute_raw_gap": worst.get("absolute_raw_gap", ""),
            "worst_pair_image_a": worst.get("image_a", ""),
            "worst_pair_raw_a": worst.get("raw_a", ""),
            "worst_pair_image_b": worst.get("image_b", ""),
            "worst_pair_raw_b": worst.get("raw_b", ""),
        })
        for key, value in list(row.items()):
            if value is None or (isinstance(value, float) and not math.isfinite(value)):
                row[key] = ""
        writer.writerow(row)
    return buffer.getvalue()


def markdown_report(payload: dict) -> str:
    all_summary = payload["splits"]["all"]
    lines = [
        "# Face Calculator identity-grouped gallery baseline",
        "",
        "Generated from the production Matchmaker gallery and the shipped on-device browser pipeline. "
        "All metrics group by identity; no image crosses the frozen train/validation/holdout boundary.",
        "",
        "Matchmaker looks labels are independent editorial judgments, not scientific ground truth or universal human consensus.",
        "",
        "## Coverage",
        "",
        f"- Identities: {all_summary['identities']} ({all_summary['identities_with_score']} with at least one score; "
        f"{all_summary['identities_all_refused']} all-refused).",
        f"- Gallery images: {all_summary['images']['submitted']} submitted, {all_summary['images']['scored']} scored, "
        f"{all_summary['images']['refused']} refused, {all_summary['images']['errors']} errors.",
        f"- Image refusal rate: {metric_value_ci(all_summary['image_refusal_rate'])}.",
        "",
        "## Preregistered split metrics",
        "",
        "| Split | identities scored/total | image refusal | within-sex top/bottom AUC (95% CI) | ≥1-point pairwise accuracy (95% CI) | Spearman ρ (95% CI) |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
    ]
    for split in ("train", "validation", "holdout", "all"):
        summary = payload["splits"][split]
        disc = summary["discrimination"]
        lines.append(
            f"| {split} | {summary['identities_with_score']}/{summary['identities']} | "
            f"{metric_value_ci(summary['image_refusal_rate'])} | "
            f"{metric_value_ci(disc['within_sex_top_bottom_quartile_auc'])} | "
            f"{metric_value_ci(disc['within_sex_pairwise_accuracy_gap_1_0'])} | "
            f"{metric_value_ci(disc['spearman_rho'])} |"
        )
    stability = all_summary["cross_photo_stability_raw"]
    lines += [
        "",
        "## Cross-photo stability",
        "",
        "| Identity statistic (raw model units) | median (identity-bootstrap 95% CI) | eligible identities |",
        "| --- | ---: | ---: |",
        f"| within-person SD | {metric_value_ci(stability['median_sd'])} | {stability['median_sd']['eligible_identities']} |",
        f"| within-person range | {metric_value_ci(stability['median_range'])} | {stability['median_range']['eligible_identities']} |",
        f"| within-person MAD | {metric_value_ci(stability['median_mad'])} | {stability['median_mad']['eligible_identities']} |",
        "",
        "The per-identity CSV records each worst-scoring photo pair and its absolute raw gap.",
        "",
        "## Multi-photo raw averaging",
        "",
        "The same common cohort of identities with at least four scored photos is used for k=1, 2, and 3. "
        "Every k-photo raw mean is compared with that identity's all-photo raw mean; identities are weighted equally. "
        "Held-out-remainder error remains available in the machine-readable artifact as a secondary diagnostic.",
        "",
        "| Photos averaged | common-cohort identities | mean absolute raw error to all-photo consensus (95% CI) | median subset-estimate SD (95% CI) | median subset-estimate range (95% CI) |",
        "| ---: | ---: | ---: | ---: | ---: |",
    ]
    for result in payload["multi_photo_aggregation"]:
        lines.append(
            f"| {result['photos_averaged']} | {result['eligible_identities']} | "
            f"{metric_value_ci(result.get('identity_weighted_mean_absolute_raw_error_to_all_photo_consensus', {}))} | "
            f"{metric_value_ci(result.get('median_subset_estimate_sd', {}))} | "
            f"{metric_value_ci(result.get('median_subset_estimate_range', {}))} |"
        )
    lines += [
        "",
        "## Expected-sex subgroups",
        "",
        "| Expected sex | identities scored/total | refusal rate | AUC (95% CI) | ≥1-point pairwise (95% CI) | Spearman ρ (95% CI) |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
    ]
    for group, summary in payload["expected_sex_subgroups"].items():
        disc = summary["discrimination"]
        lines.append(
            f"| {group} | {summary['identities_with_score']}/{summary['identities']} | "
            f"{metric_value_ci(summary['image_refusal_rate'])} | "
            f"{metric_value_ci(disc['within_sex_top_bottom_quartile_auc'])} | "
            f"{metric_value_ci(disc['within_sex_pairwise_accuracy_gap_1_0'])} | "
            f"{metric_value_ci(disc['spearman_rho'])} |"
        )
    lines += [
        "",
        "## Supportable explicit editorial-demographic groups",
        "",
        "These groups come only from the existing explicit matchmaker.html ethnicity field; nothing was inferred from images. "
        f"Groups below meet the preregistered minimum of {DEMOGRAPHIC_MIN_IDENTITIES} scored identities and contain both primary classes.",
        "",
        "| Editorial ethnicity field | identities scored/total | refusal rate | AUC (95% CI) | ≥1-point pairwise (95% CI) | Spearman ρ (95% CI) |",
        "| --- | ---: | ---: | ---: | ---: | ---: |",
    ]
    for group, summary in payload["editorial_ethnicity_subgroups"].items():
        disc = summary["discrimination"]
        lines.append(
            f"| {group} | {summary['identities_with_score']}/{summary['identities']} | "
            f"{metric_value_ci(summary['image_refusal_rate'])} | "
            f"{metric_value_ci(disc['within_sex_top_bottom_quartile_auc'])} | "
            f"{metric_value_ci(disc['within_sex_pairwise_accuracy_gap_1_0'])} | "
            f"{metric_value_ci(disc['spearman_rho'])} |"
        )
    if not payload["editorial_ethnicity_subgroups"]:
        lines.append("| none met the support threshold | — | — | — | — | — |")
    lines += [
        "",
        "## Guardrails",
        "",
        "- Candidate selection may use train and validation only. Holdout is run once after candidate and preprocessing choices are frozen.",
        "- The primary metrics are ordering tests; a monotone display remap cannot improve them.",
        "- Refusal and stability intervals resample identities, preserving all of each sampled identity's photos as a cluster.",
        "- Explicit editorial ethnicity metadata is broad and not a controlled or independently verified demographic dataset; subgroup results are a pressure test only.",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch", type=Path, default=DEFAULT_BATCH)
    parser.add_argument("--batch-meta", type=Path, default=DEFAULT_BATCH_META)
    parser.add_argument("--split", type=Path, default=DEFAULT_SPLIT)
    parser.add_argument("--json", type=Path, default=DEFAULT_JSON)
    parser.add_argument("--identities", type=Path, default=DEFAULT_IDENTITIES)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    args = parser.parse_args()

    batch_path = args.batch.resolve()
    batch_meta_path = args.batch_meta.resolve()
    split_path = args.split.resolve()
    split_rows = load_split(split_path)
    flat, grouped = load_gallery(batch_path, split_rows)
    if len({row["relative_path"] for row in flat}) != len(flat):
        raise ValueError("Gallery batch contains duplicate relative_path values.")

    batch_meta = json.loads(batch_meta_path.read_text(encoding="utf-8"))
    if batch_meta.get("schema_version") != "face-roster-gallery-batch.v1":
        raise ValueError("Unsupported or missing gallery batch metadata schema.")
    if batch_meta.get("output_csv_sha256") != sha256_file(batch_path):
        raise ValueError("Gallery batch hash does not match its preserved browser metadata.")
    if batch_meta.get("cases") != len(flat) or batch_meta.get("identities") != len(grouped):
        raise ValueError("Gallery batch case/identity counts do not match browser metadata.")
    if batch_meta.get("storage_unchanged") is not True:
        raise ValueError("Browser batch did not verify storage non-mutation.")
    actual_outcomes = dict(sorted(Counter(row["outcome"] for row in flat).items()))
    if batch_meta.get("outcome_counts") != actual_outcomes:
        raise ValueError("Gallery outcome counts do not match browser metadata.")
    pipeline_hashes = batch_meta.get("pipeline_sha256") or {}
    if pipeline_hashes.get("data/face-identity-split-v1.csv") != sha256_file(split_path):
        raise ValueError("Frozen identity split hash does not match browser metadata.")

    ref_raw = parse_ref_raw(FACE_HTML)
    ref_raw_sha256 = hashlib.sha256(
        json.dumps(ref_raw, separators=(",", ":"), allow_nan=False).encode("utf-8")
    ).hexdigest()
    identities = [identity_summary(identity, rows, split_rows[identity], ref_raw)
                  for identity, rows in sorted(grouped.items())]
    by_split = {split: [item for item in identities if split == "all" or item["split"] == split]
                for split in ("train", "validation", "holdout", "all")}
    sex_groups = {group: [item for item in identities if item["expected_sex"] == group]
                  for group in sorted({item["expected_sex"] for item in identities})}
    ethnicity_groups = supportable_ethnicity_groups(identities)
    worst_identity = max((item for item in identities if item["worst_pair"]),
                         key=lambda item: item["worst_pair"]["absolute_raw_gap"])

    payload = {
        "schema_version": "face-gallery-stability.v2",
        "generated_date": "2026-08-18",
        "inputs": {
            "gallery_batch": {
                "path": batch_path.relative_to(ROOT).as_posix(),
                "sha256": sha256_file(batch_path),
            },
            "browser_batch_metadata": {
                "path": batch_meta_path.relative_to(ROOT).as_posix(),
                "sha256": sha256_file(batch_meta_path),
            },
            "identity_split": {
                "path": split_path.relative_to(ROOT).as_posix(),
                "sha256": sha256_file(split_path),
            },
            "runtime_pipeline_sha256": pipeline_hashes,
            "score_mapping": {
                "analysis_source_path": FACE_HTML.relative_to(ROOT).as_posix(),
                "analysis_source_sha256": sha256_file(FACE_HTML),
                "runtime_face_html_sha256": pipeline_hashes.get("face.html"),
                "ref_raw_points": len(ref_raw),
                "ref_raw_values_sha256": ref_raw_sha256,
                "display_transform": "clamp(5.5 + inverse_normal_cdf(ref_percentile(raw)) * 1.4, 1, 10)",
            },
        },        "bootstrap": {"rounds": BOOTSTRAP_ROUNDS, "seed": BOOTSTRAP_SEED,
                      "unit": "identity (all photos retained together)"},
        "raw_averaging_rule": "Arithmetic mean of finite model_raw values, then one display mapping.",
        "splits": {split: split_summary(rows, f"split:{split}") for split, rows in by_split.items()},
        "multi_photo_aggregation": [multi_photo_aggregation(identities, k, "all") for k in (1, 2, 3)],
        "expected_sex_subgroups": {
            group: split_summary(rows, f"sex:{group}") for group, rows in sex_groups.items()
        },
        "editorial_ethnicity_subgroups": {
            group: split_summary(rows, f"ethnicity:{group}") for group, rows in ethnicity_groups.items()
        },
        "demographic_provenance": {
            "source": "matchmaker.html explicit editorial ethnicity field",
            "image_inference_used": False,
            "reporting_minimum_identities": DEMOGRAPHIC_MIN_IDENTITIES,
            "limitations": "Broad editorial metadata; not controlled or independently verified demographic ground truth.",
        },
        "largest_within_identity_raw_gap": {
            "identity_id": worst_identity["identity_id"], **worst_identity["worst_pair"]
        },
        "refusal_reason_counts": dict(sorted(Counter(
            row["refusal_reason"] for row in flat if row["outcome"] == "refused"
        ).items())),
        "interpretation": {
            "labels": "Independent Matchmaker editorial judgments, not scientific ground truth or universal consensus.",
            "holdout": "Use only after all candidate, preprocessing, ensemble, and threshold choices are frozen.",
        },
    }

    identity_text = identity_csv_text(identities)
    report = markdown_report(payload)
    args.identities.resolve().parent.mkdir(parents=True, exist_ok=True)
    args.identities.resolve().write_text(identity_text, encoding="utf-8")
    args.json.resolve().parent.mkdir(parents=True, exist_ok=True)
    args.json.resolve().write_text(json.dumps(payload, indent=2, sort_keys=True, allow_nan=False) + "\n", encoding="utf-8")
    args.report.resolve().parent.mkdir(parents=True, exist_ok=True)
    args.report.resolve().write_text(report + "\n", encoding="utf-8")

    all_summary = payload["splits"]["all"]
    print(f"[gallery audit] {all_summary['identities']} identities / {all_summary['images']['submitted']} images: "
          f"{all_summary['images']['scored']} scored, {all_summary['images']['refused']} refused")
    print(f"[primary all] AUC={fmt(all_summary['discrimination']['within_sex_top_bottom_quartile_auc']['value'])}; "
          f"pairwise={fmt(all_summary['discrimination']['within_sex_pairwise_accuracy_gap_1_0']['value'])}; "
          f"rho={fmt(all_summary['discrimination']['spearman_rho']['value'])}")
    print(f"[write] {args.json.resolve().relative_to(ROOT)}")
    print(f"[write] {args.identities.resolve().relative_to(ROOT)}")
    print(f"[write] {args.report.resolve().relative_to(ROOT)}")


if __name__ == "__main__":
    main()
