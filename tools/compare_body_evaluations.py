#!/usr/bin/env python3
"""Paired frozen-before versus final-after Body Calculator evaluation."""

from __future__ import annotations

import argparse
import json
import math
import random
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

from evaluate_body_accuracy import file_sha256, gap_key, load_rows, point_metrics


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def ci(values):
    ordered = sorted(value for value in values if value is not None and math.isfinite(value))
    if not ordered:
        return [None, None]
    def pick(probability):
        position = probability * (len(ordered) - 1)
        lower = math.floor(position)
        upper = math.ceil(position)
        if lower == upper:
            return ordered[lower]
        return ordered[lower] * (upper - position) + ordered[upper] * (position - lower)
    return [pick(.025), pick(.975)]


def metric_rows(pairs, score_key):
    return [{"score": row[score_key], "label": row["label"]}
            for row in pairs if row[score_key] is not None and row["label"] is not None]


def paired_bootstrap(pairs, gaps, repetitions, seed, prefix):
    clusters = defaultdict(list)
    for row in pairs:
        clusters[row["identity_group"]].append(row)
    keys = sorted(clusters)
    rng = random.Random(seed)
    values = defaultdict(list)
    for _ in range(repetitions):
        sample = []
        for key in rng.choices(keys, k=len(keys)):
            sample.extend(clusters[key])
        before = point_metrics(metric_rows(sample, f"before_{prefix}"), gaps)
        after = point_metrics(metric_rows(sample, f"after_{prefix}"), gaps)
        for name in ("spearman", "pearson", "top_bottom_quartile_auc"):
            if before[name] is not None and after[name] is not None:
                values[name].append(after[name] - before[name])
        for gap in map(gap_key, gaps):
            left, right = before["pairwise"][gap]["accuracy"], after["pairwise"][gap]["accuracy"]
            if left is not None and right is not None:
                values[f"pairwise_{gap}"].append(right - left)
    return {
        "method": "paired identity-cluster bootstrap on rows accepted by both snapshots",
        "repetitions": repetitions,
        "seed": seed,
        "clusters": len(keys),
        "delta_95pct_ci_after_minus_before": {key: ci(value) for key, value in sorted(values.items())},
    }


def score_shift(pairs, prefix):
    deltas = [row[f"after_{prefix}"] - row[f"before_{prefix}"] for row in pairs
              if row[f"after_{prefix}"] is not None and row[f"before_{prefix}"] is not None]
    return {
        "n": len(deltas),
        "exactly_unchanged": sum(value == 0 for value in deltas),
        "mean_signed": statistics.fmean(deltas) if deltas else None,
        "mean_absolute": statistics.fmean(abs(value) for value in deltas) if deltas else None,
        "maximum_absolute": max((abs(value) for value in deltas), default=None),
    }


def metric_delta(before, after, gaps):
    return {
        "spearman": after["spearman"] - before["spearman"],
        "pearson": after["pearson"] - before["pearson"],
        "top_bottom_quartile_auc": after["top_bottom_quartile_auc"] - before["top_bottom_quartile_auc"],
        "pairwise": {
            gap_key(gap): after["pairwise"][gap_key(gap)]["accuracy"] - before["pairwise"][gap_key(gap)]["accuracy"]
            for gap in gaps
        },
    }


def markdown(report):
    before = report["identical_accepted_continuous"]["before"]
    after = report["identical_accepted_continuous"]["after"]
    delta = report["identical_accepted_continuous"]["delta_after_minus_before"]
    def fmt(value):
        return "n/a" if value is None else f"{value:.5f}"
    lines = [
        "# Body Calculator frozen-before versus final-after evaluation",
        "",
        "## Result",
        "",
        report["decision"]["summary"],
        "",
        "Engineering reliability and capture consistency are distinct from better ranking against independent human judgments. The primary comparison below uses identical rows accepted by both snapshots and the continuous internal score. Public half-point metrics are reported separately because display quantization introduces ties.",
        "",
        "| Metric | Frozen before | Final after | After − before |",
        "|---|---:|---:|---:|",
        f"| Accepted identical rows | {before['n']} | {after['n']} | 0 |",
        f"| Spearman | {fmt(before['spearman'])} | {fmt(after['spearman'])} | {fmt(delta['spearman'])} |",
        f"| Pearson | {fmt(before['pearson'])} | {fmt(after['pearson'])} | {fmt(delta['pearson'])} |",
        f"| Top-vs-bottom-quartile AUC | {fmt(before['top_bottom_quartile_auc'])} | {fmt(after['top_bottom_quartile_auc'])} | {fmt(delta['top_bottom_quartile_auc'])} |",
        "",
        f"Frozen refusal rate: {report['refusals']['before_rate']:.1%}; final refusal rate: {report['refusals']['after_rate']:.1%}; change: {report['refusals']['delta_after_minus_before']:+.1%}.",
        "",
        "## Paired uncertainty",
        "",
        f"Bootstrap: {report['continuous_paired_bootstrap']['repetitions']} repetitions, {report['continuous_paired_bootstrap']['clusters']} identity clusters, seed {report['continuous_paired_bootstrap']['seed']}.",
    ]
    for name, bounds in report["continuous_paired_bootstrap"]["delta_95pct_ci_after_minus_before"].items():
        lines.append(f"- {name}: [{fmt(bounds[0])}, {fmt(bounds[1])}]")
    lines.extend([
        "",
        "## Interpretation",
        "",
        "A strictly monotone calibration/display remap cannot improve Spearman, AUC, or pairwise ordering. Any reliability gain without a locked discrimination gain must be described as better capture, preprocessing, routing, persistence, or consistency—not better attractiveness intelligence.",
        "",
        "This holdout is body-specific but narrow: synthetic female bodies on one controlled shape continuum, with a Valence M label averaging attractiveness, beauty, and harmony. It cannot authorize a broad model replacement across sexes, clothing, bare torsos, real backgrounds, poses, cameras, or demographics.",
        "",
        "## Provenance",
        "",
        "Exact commands and SHA-256 bindings for both CSVs, both batch metadata files, the manifest, model, page snapshots, evaluator lock, and this comparison tool are recorded in the JSON artifact.",
    ])
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--before", required=True)
    parser.add_argument("--before-metadata", required=True)
    parser.add_argument("--after", required=True)
    parser.add_argument("--after-metadata", required=True)
    parser.add_argument("--dataset-metadata", required=True)
    parser.add_argument("--evaluation-lock", required=True)
    parser.add_argument("--output-json", required=True)
    parser.add_argument("--output-md", required=True)
    parser.add_argument("--bootstrap", type=int, default=1000)
    parser.add_argument("--seed", type=int, default=20260818)
    args = parser.parse_args()

    paths = {name: Path(getattr(args, name.replace("-", "_"))).resolve() for name in (
        "before", "before-metadata", "after", "after-metadata", "dataset-metadata", "evaluation-lock")}
    dataset = read_json(paths["dataset-metadata"])
    lock = read_json(paths["evaluation-lock"])
    before_meta = read_json(paths["before-metadata"])
    after_meta = read_json(paths["after-metadata"])
    manifest_hash = dataset["manifest_sha256"]
    if lock["independent_test"]["manifest_sha256"] != manifest_hash:
        raise ValueError("evaluation lock does not bind to dataset manifest")
    for phase, meta in (("before", before_meta), ("after", after_meta)):
        if meta.get("output_csv_sha256") != file_sha256(paths[phase]):
            raise ValueError(f"{phase} metadata does not bind CSV")
        if meta.get("manifest_sha256") != manifest_hash:
            raise ValueError(f"{phase} metadata does not bind manifest")
        if meta.get("pipeline_sha256", {}).get("models/body-beauty.onnx") != lock["baseline"]["model_sha256"]:
            raise ValueError(f"{phase} model differs from evaluation lock")
    if before_meta.get("pipeline_sha256", {}).get("body.html") != lock["baseline"]["body_html_sha256"]:
        raise ValueError("before page differs from frozen lock")

    label_field = dataset["label"]["field"]
    gaps = tuple(float(value) for value in dataset["label"]["pairwise_gaps"])
    before_rows = load_rows(paths["before"], label_field)
    after_rows = load_rows(paths["after"], label_field)
    before_by_id = {row["image_id"]: row for row in before_rows}
    after_by_id = {row["image_id"]: row for row in after_rows}
    if set(before_by_id) != set(after_by_id):
        raise ValueError("before/after image IDs differ")
    pairs = []
    transitions = Counter()
    for image_id in sorted(before_by_id):
        before, after = before_by_id[image_id], after_by_id[image_id]
        if before["label"] != after["label"]:
            raise ValueError(f"label changed for {image_id}")
        before_state = "accepted" if before["numeric_scored"] else "refused_or_non_numeric"
        after_state = "accepted" if after["numeric_scored"] else "refused_or_non_numeric"
        transitions[f"{before_state} -> {after_state}"] += 1
        pairs.append({
            "image_id": image_id,
            "identity_group": before.get("identity_group") or image_id,
            "label": before["label"],
            "before_continuous": before["score"] if before["numeric_scored"] else None,
            "after_continuous": after["score"] if after["numeric_scored"] else None,
            "before_public": before["public_score"] if before["numeric_scored"] else None,
            "after_public": after["public_score"] if after["numeric_scored"] else None,
        })
    identical = [row for row in pairs if row["before_continuous"] is not None and row["after_continuous"] is not None]
    before_continuous = point_metrics(metric_rows(identical, "before_continuous"), gaps)
    after_continuous = point_metrics(metric_rows(identical, "after_continuous"), gaps)
    before_public = point_metrics(metric_rows(identical, "before_public"), gaps)
    after_public = point_metrics(metric_rows(identical, "after_public"), gaps)
    continuous_delta = metric_delta(before_continuous, after_continuous, gaps)
    public_delta = metric_delta(before_public, after_public, gaps)
    continuous_bootstrap = paired_bootstrap(identical, gaps, args.bootstrap, args.seed, "continuous")
    public_bootstrap = paired_bootstrap(identical, gaps, args.bootstrap, args.seed, "public")
    before_refusal = 1 - sum(row["numeric_scored"] for row in before_rows) / len(before_rows)
    after_refusal = 1 - sum(row["numeric_scored"] for row in after_rows) / len(after_rows)
    acceptance = lock["candidate_policy"]
    ci_low = continuous_bootstrap["delta_95pct_ci_after_minus_before"]["spearman"][0]
    metric_screen = (
        continuous_delta["spearman"] >= acceptance["minimum_spearman_gain"]
        and ci_low is not None and ci_low > acceptance["minimum_spearman_delta_ci_lower_bound"]
        and continuous_delta["top_bottom_quartile_auc"] >= -acceptance["maximum_auc_degradation"]
        and all(value >= -acceptance["maximum_pairwise_degradation_at_any_registered_gap"]
                for value in continuous_delta["pairwise"].values())
        and after_refusal - before_refusal <= acceptance["maximum_refusal_rate_increase"]
    )
    report = {
        "schema_version": "body-before-after-comparison.v1",
        "rows": len(pairs),
        "identical_accepted_rows": len(identical),
        "registered_gaps": list(gaps),
        "identical_accepted_continuous": {
            "before": before_continuous,
            "after": after_continuous,
            "delta_after_minus_before": continuous_delta,
        },
        "identical_accepted_public_half_point": {
            "before": before_public,
            "after": after_public,
            "delta_after_minus_before": public_delta,
        },
        "continuous_paired_bootstrap": continuous_bootstrap,
        "public_paired_bootstrap": public_bootstrap,
        "prediction_shift": {
            "continuous": score_shift(identical, "continuous"),
            "public_half_point": score_shift(identical, "public"),
        },
        "refusals": {
            "before_rate": before_refusal,
            "after_rate": after_refusal,
            "delta_after_minus_before": after_refusal - before_refusal,
            "transitions": dict(sorted(transitions.items())),
        },
        "decision": {
            "registered_metric_screen_passed": metric_screen,
            "meaningful_independent_subjective_discrimination_gain": metric_screen,
            "model_replacement_authorized": False,
            "summary": ("The final pipeline produced a registered meaningful discrimination gain on this narrow holdout, but the lock still forbids model replacement without broader evidence."
                        if metric_screen else
                        "The final pipeline did not demonstrate a registered meaningful gain in independent subjective-attractiveness discrimination; any accepted changes are reliability or consistency improvements."),
            "scope_reason": lock["candidate_policy"]["model_replacement_rule"],
        },
        "provenance": {
            "before_csv": {"path": str(paths["before"]), "sha256": file_sha256(paths["before"])},
            "before_metadata": {"path": str(paths["before-metadata"]), "sha256": file_sha256(paths["before-metadata"])},
            "after_csv": {"path": str(paths["after"]), "sha256": file_sha256(paths["after"])},
            "after_metadata": {"path": str(paths["after-metadata"]), "sha256": file_sha256(paths["after-metadata"])},
            "dataset_metadata": {"path": str(paths["dataset-metadata"]), "sha256": file_sha256(paths["dataset-metadata"])},
            "evaluation_lock": {"path": str(paths["evaluation-lock"]), "sha256": file_sha256(paths["evaluation-lock"])},
            "manifest_sha256": manifest_hash,
            "before_page_sha256": before_meta["pipeline_sha256"]["body.html"],
            "after_page_sha256": after_meta["pipeline_sha256"]["body.html"],
            "model_sha256": lock["baseline"]["model_sha256"],
            "tool_sha256": file_sha256(Path(__file__).resolve()),
            "command": [sys.executable, str(Path(__file__).resolve()), *sys.argv[1:]],
        },
    }
    output_json = Path(args.output_json)
    output_md = Path(args.output_md)
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_md.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8", newline="\n")
    output_md.write_text(markdown(report), encoding="utf-8", newline="\n")
    print(json.dumps({"rows": len(pairs), "identical_accepted": len(identical),
                      "spearman_delta": continuous_delta["spearman"], "metric_screen": metric_screen}, indent=2))


if __name__ == "__main__":
    main()
