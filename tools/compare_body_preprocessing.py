#!/usr/bin/env python3
"""Compare production pose-crop inference with a locked full-letterbox candidate.

Connor remains training-contaminated diagnostic evidence. A candidate-lock plus an
independent manifest is required before this tool's output can be treated as a
one-time candidate test.
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

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageOps

from evaluate_body_accuracy import (
    confidence_interval,
    discrimination,
    file_sha256,
    public_half_point,
    quantile,
)


MEAN = np.asarray([0.485, 0.456, 0.406], dtype=np.float32)[:, None, None]
STD = np.asarray([0.229, 0.224, 0.225], dtype=np.float32)[:, None, None]
SIZE = 224
DEFAULT_SEED = 20260818
REF_PATTERN = re.compile(r"const\s+REF_RAW\s*=\s*\[([^\]]+)\]", re.MULTILINE)


def number(value):
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    return result if math.isfinite(result) else None


def preprocess(image_path):
    with Image.open(image_path) as source:
        image = ImageOps.exif_transpose(source).convert("RGB")
        width, height = image.size
        side = max(width, height)
        square = Image.new("RGB", (side, side), (0, 0, 0))
        square.paste(image, ((side - width) // 2, (side - height) // 2))
        square = square.resize((SIZE, SIZE), Image.Resampling.BILINEAR)
        array = np.asarray(square, dtype=np.float32).transpose(2, 0, 1) / 255.0
        return (array - MEAN) / STD, {
            "width": width,
            "height": height,
            "letterbox_fraction": 1.0 - (width * height) / float(side * side),
        }


def load_reference(page_path):
    source = Path(page_path).read_text(encoding="utf-8")
    match = REF_PATTERN.search(source)
    if not match:
        raise ValueError(f"REF_RAW not found in {page_path}")
    values = [float(value) for value in re.findall(r"-?\d+(?:\.\d+)?", match.group(1))]
    if len(values) != 101 or any(right <= left for left, right in zip(values, values[1:])):
        raise ValueError("REF_RAW must contain 101 strictly increasing knots")
    return values


def table_percentile(reference, raw):
    if not raw > reference[0]:
        return 0.0
    if raw >= reference[-1]:
        return 1.0
    low, high = 0, len(reference) - 1
    while high - low > 1:
        middle = (low + high) // 2
        if reference[middle] <= raw:
            low = middle
        else:
            high = middle
    span = reference[high] - reference[low]
    return (low + (raw - reference[low]) / span) / (len(reference) - 1)


def score_from_raw(reference, raw):
    percentile = min(max(table_percentile(reference, raw), 1e-6), 1 - 1e-6)
    score = 5.5 + statistics.NormalDist().inv_cdf(percentile) * 1.4
    return min(10.0, max(1.0, score))


def metric_view(rows, score_key, gaps):
    scores = [row[score_key] for row in rows]
    labels = [row["label"] for row in rows]
    result = discrimination(scores, labels, gaps)
    result["n"] = len(rows)
    result["score"] = {
        "min": min(scores),
        "max": max(scores),
        "mean": statistics.fmean(scores),
        "sd": statistics.pstdev(scores),
    }
    return result


def bootstrap_deltas(rows, gaps, repetitions, seed, cluster_key):
    groups = defaultdict(list)
    for row in rows:
        groups[row.get(cluster_key) or row["image_id"]].append(row)
    keys = sorted(groups)
    rng = random.Random(seed)
    draws = defaultdict(list)
    for _ in range(repetitions):
        sample = []
        for key in rng.choices(keys, k=len(keys)):
            sample.extend(groups[key])
        labels = [row["label"] for row in sample]
        baseline = discrimination([row["baseline_model_raw"] for row in sample], labels, gaps)
        candidate = discrimination([row["candidate_model_raw"] for row in sample], labels, gaps)
        for metric in ("spearman", "pearson", "top_bottom_quartile_auc"):
            left, right = baseline.get(metric), candidate.get(metric)
            draws[metric].append(right - left if left is not None and right is not None else None)
        for gap in map(str, gaps):
            gap = format(float(gap), ".12g")
            left = baseline["pairwise"][gap]["accuracy"]
            right = candidate["pairwise"][gap]["accuracy"]
            draws[f"pairwise_gap_{gap}"].append(
                right - left if left is not None and right is not None else None)
    return {
        "method": f"paired cluster bootstrap by {cluster_key}",
        "repetitions": repetitions,
        "seed": seed,
        "clusters": len(keys),
        "delta_95pct_ci_candidate_minus_baseline": {
            key: confidence_interval(values) for key, values in sorted(draws.items())
        },
    }


def csv_cell(value):
    return "" if value is None else value


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--photos", required=True)
    parser.add_argument("--model", default="models/body-beauty.onnx")
    parser.add_argument("--mapping-page", default="body.html")
    parser.add_argument("--output", required=True)
    parser.add_argument("--rows-output")
    parser.add_argument("--batch-metadata")
    parser.add_argument("--dataset-metadata")
    parser.add_argument("--evaluation-lock")
    parser.add_argument("--candidate-lock")
    parser.add_argument("--label-column")
    parser.add_argument("--batch-size", type=int, default=1)
    parser.add_argument("--bootstrap", type=int, default=1000)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    args = parser.parse_args()

    input_path = Path(args.input).resolve()
    photos = Path(args.photos).resolve()
    model_path = Path(args.model).resolve()
    mapping_page = Path(args.mapping_page).resolve()
    batch_metadata = read_json(args.batch_metadata) if args.batch_metadata else None
    dataset_metadata = read_json(args.dataset_metadata) if args.dataset_metadata else None
    evaluation_lock = read_json(args.evaluation_lock) if args.evaluation_lock else None
    candidate_lock = read_json(args.candidate_lock) if args.candidate_lock else None
    lock_mode = any((args.evaluation_lock, args.candidate_lock, args.dataset_metadata, args.batch_metadata))
    if lock_mode and not all((args.evaluation_lock, args.candidate_lock, args.dataset_metadata, args.batch_metadata)):
        parser.error("locked evaluation requires --batch-metadata, --dataset-metadata, --evaluation-lock, and --candidate-lock")

    label_column = args.label_column or (
        dataset_metadata.get("label", {}).get("field") if dataset_metadata else "attractiveness_mean")
    rows = []
    with input_path.open(newline="", encoding="utf-8-sig") as handle:
        for raw in csv.DictReader(handle):
            baseline = number(raw.get("model_raw"))
            label = number(raw.get(label_column))
            if baseline is None or label is None:
                continue
            filename = raw.get("filename") or f"{raw['image_id']}.png"
            image_path = (photos / filename).resolve()
            if image_path.parent != photos:
                raise ValueError(f"unsafe/nested filename: {filename}")
            rows.append({
                "image_id": raw["image_id"],
                "filename": filename,
                "identity_group": raw.get("identity_group") or raw["image_id"],
                "label": label,
                "baseline_model_raw": baseline,
                "baseline_continuous_score": number(raw.get("bp")),
                "baseline_public_half_point": public_half_point(number(raw.get("bp"))),
                "image_path": image_path,
            })
    if not rows:
        raise ValueError("input has no finite model-route rows")

    model_hash = file_sha256(model_path)
    input_hash = file_sha256(input_path)
    candidate_lock_hash = file_sha256(args.candidate_lock) if args.candidate_lock else None
    evaluation_lock_hash = file_sha256(args.evaluation_lock) if args.evaluation_lock else None
    if lock_mode:
        if batch_metadata.get("output_csv_sha256") != input_hash:
            raise ValueError("batch metadata does not bind input CSV")
        if candidate_lock.get("schema_version") != "body-preprocessing-candidate-lock.v1":
            raise ValueError("unsupported candidate lock schema")
        if candidate_lock.get("parent_evaluation_lock_sha256") != evaluation_lock_hash:
            raise ValueError("candidate lock does not bind evaluation lock")
        manifest_hash = dataset_metadata.get("manifest_sha256")
        if candidate_lock.get("locked_candidate_test", {}).get("manifest_sha256") != manifest_hash:
            raise ValueError("candidate lock does not bind independent manifest")
        if batch_metadata.get("manifest_sha256") != manifest_hash:
            raise ValueError("batch metadata does not bind independent manifest")
        if candidate_lock.get("candidate", {}).get("model_sha256") != model_hash:
            raise ValueError("candidate lock model hash mismatch")
        if evaluation_lock.get("baseline", {}).get("model_sha256") != model_hash:
            raise ValueError("evaluation lock model hash mismatch")

    session = ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])
    input_meta = session.get_inputs()[0]
    input_name = input_meta.name
    output_name = session.get_outputs()[0].name
    fixed_batch = input_meta.shape[0]
    if isinstance(fixed_batch, int) and args.batch_size != fixed_batch:
        raise SystemExit(f"model requires batch size {fixed_batch}; got {args.batch_size}")

    reference = load_reference(mapping_page)
    diagnostics = []
    for offset in range(0, len(rows), args.batch_size):
        chunk = rows[offset:offset + args.batch_size]
        tensors = []
        for row in chunk:
            tensor, diagnostic = preprocess(row["image_path"])
            tensors.append(tensor)
            diagnostics.append(diagnostic)
        output = session.run([output_name], {input_name: np.stack(tensors).astype(np.float32)})[0]
        for row, value in zip(chunk, np.asarray(output).reshape(-1)):
            row["candidate_model_raw"] = float(value)
            row["candidate_continuous_score"] = score_from_raw(reference, row["candidate_model_raw"])
            row["candidate_public_half_point"] = public_half_point(row["candidate_continuous_score"])

    gaps = tuple(float(value) for value in (
        dataset_metadata.get("label", {}).get("pairwise_gaps", [0]) if dataset_metadata else [0, 5, 10, 20, 30]))
    baseline = metric_view(rows, "baseline_model_raw", gaps)
    candidate = metric_view(rows, "candidate_model_raw", gaps)
    baseline_display = metric_view(rows, "baseline_continuous_score", gaps)
    baseline_public = metric_view(rows, "baseline_public_half_point", gaps)
    candidate_display = metric_view(rows, "candidate_continuous_score", gaps)
    candidate_public = metric_view(rows, "candidate_public_half_point", gaps)
    delta = {
        "spearman": candidate["spearman"] - baseline["spearman"],
        "pearson": candidate["pearson"] - baseline["pearson"],
        "top_bottom_quartile_auc": candidate["top_bottom_quartile_auc"] - baseline["top_bottom_quartile_auc"],
        "pairwise": {
            gap: candidate["pairwise"][gap]["accuracy"] - baseline["pairwise"][gap]["accuracy"]
            for gap in baseline["pairwise"]
        },
    }
    paired_bootstrap = bootstrap_deltas(rows, gaps, args.bootstrap, args.seed, "identity_group")
    acceptance = candidate_lock.get("acceptance", {}) if candidate_lock else {}
    ci = paired_bootstrap["delta_95pct_ci_candidate_minus_baseline"]
    narrow_metrics_pass = bool(candidate_lock) and (
        delta["spearman"] >= acceptance["minimum_spearman_gain"]
        and ci["spearman"][0] > acceptance["minimum_spearman_delta_ci_lower_bound"]
        and delta["top_bottom_quartile_auc"] >= -acceptance["maximum_auc_degradation"]
        and all(value >= -acceptance["maximum_pairwise_degradation_at_any_registered_gap"]
                for value in delta["pairwise"].values())
    )

    absolute_deltas = [abs(row["candidate_model_raw"] - row["baseline_model_raw"]) for row in rows]
    report = {
        "schema_version": "body-preprocessing-comparison.v2",
        "command": [sys.executable, str(Path(__file__).resolve()), *sys.argv[1:]],
        "script_sha256": file_sha256(Path(__file__).resolve()),
        "one_time_locked_candidate_test": bool(candidate_lock),
        "warning": (
            "This fixed candidate changes preprocessing and can change ordering. The independent set is "
            "body-specific but narrow; its result cannot by itself authorize a production replacement."
            if candidate_lock else
            "Connor is training-contaminated holistic-attractiveness evidence; diagnostic only."
        ),
        "inputs": {
            "batch_csv_sha256": input_hash,
            "batch_metadata_sha256": file_sha256(args.batch_metadata) if args.batch_metadata else None,
            "dataset_metadata_sha256": file_sha256(args.dataset_metadata) if args.dataset_metadata else None,
            "evaluation_lock_sha256": evaluation_lock_hash,
            "candidate_lock_sha256": candidate_lock_hash,
            "model_sha256": model_hash,
            "mapping_page_sha256": file_sha256(mapping_page),
        },
        "identical_rows": len(rows),
        "model_input_shape": [value if isinstance(value, int) else str(value) for value in input_meta.shape],
        "batch_size": args.batch_size,
        "contracts": {
            "baseline": "production confident pose-landmark square x1.15; Canvas2D resize; ImageNet normalization",
            "candidate": "EXIF-transposed full RGB; centered black square; PIL bilinear 224 resize; ImageNet normalization",
        },
        "registered_label_gaps": list(gaps),
        "baseline_production_pose_crop_raw": baseline,
        "candidate_training_full_letterbox_raw": candidate,
        "paired_metric_delta_candidate_minus_baseline": delta,
        "paired_bootstrap": paired_bootstrap,
        "display_contract_diagnostic": {
            "baseline_continuous_from_batch": baseline_display,
            "baseline_public_half_point_from_batch": baseline_public,
            "candidate_continuous_existing_mapping": candidate_display,
            "candidate_public_half_point_existing_mapping": candidate_public,
            "mapping_note": "Existing REF_RAW mapping only; no calibration was fitted on the independent test.",
        },
        "paired_predictions": {
            "spearman": discrimination(
                [row["baseline_model_raw"] for row in rows],
                [row["candidate_model_raw"] for row in rows], (0,))["spearman"],
            "pearson": np.corrcoef(
                [row["baseline_model_raw"] for row in rows],
                [row["candidate_model_raw"] for row in rows])[0, 1].item(),
            "mean_candidate_minus_baseline": statistics.fmean(
                row["candidate_model_raw"] - row["baseline_model_raw"] for row in rows),
            "mean_absolute_difference": statistics.fmean(absolute_deltas),
            "p95_absolute_difference": quantile(absolute_deltas, 0.95),
        },
        "source_framing": {
            "mean_black_letterbox_fraction": statistics.fmean(item["letterbox_fraction"] for item in diagnostics),
            "median_black_letterbox_fraction": statistics.median(item["letterbox_fraction"] for item in diagnostics),
            "max_black_letterbox_fraction": max(item["letterbox_fraction"] for item in diagnostics),
        },
        "decision": {
            "narrow_locked_metric_screen_passed": narrow_metrics_pass,
            "stability_requirement_evaluated_here": False,
            "broader_scope_requirement_met": False,
            "production_replacement_authorized": False,
            "reason": (
                "Even a narrow metric pass would still require registered transform stability and broader "
                "clothed/bare, male/female body-specific evidence."
            ),
        },
    }

    if args.rows_output:
        columns = [
            "image_id", "filename", "identity_group", "label", "baseline_model_raw",
            "candidate_model_raw", "baseline_continuous_score", "baseline_public_half_point",
            "candidate_continuous_score", "candidate_public_half_point", "candidate_minus_baseline_raw", "letterbox_fraction",
        ]
        rows_output = Path(args.rows_output)
        rows_output.parent.mkdir(parents=True, exist_ok=True)
        with rows_output.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=columns, lineterminator="\n")
            writer.writeheader()
            for row, diagnostic in zip(rows, diagnostics):
                writer.writerow({
                    **{key: csv_cell(row.get(key)) for key in columns},
                    "candidate_minus_baseline_raw": row["candidate_model_raw"] - row["baseline_model_raw"],
                    "letterbox_fraction": diagnostic["letterbox_fraction"],
                })
        report["rows_output"] = {
            "path": str(rows_output),
            "sha256": file_sha256(rows_output),
        }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({
        "rows": len(rows),
        "baseline_spearman": baseline["spearman"],
        "candidate_spearman": candidate["spearman"],
        "spearman_delta": delta["spearman"],
        "spearman_delta_ci": ci["spearman"],
        "narrow_metric_screen_passed": narrow_metrics_pass,
        "production_replacement_authorized": False,
    }, indent=2))


if __name__ == "__main__":
    main()
