#!/usr/bin/env python3
"""Validation-lock and holdout evaluation for Face Calculator aggregation candidates."""

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
from collections import defaultdict
from pathlib import Path

from audit_face_accuracy import extreme_auc, pairwise_accuracy, quantile, spearman

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_PREREG = ROOT / "data" / "face-evaluation-preregistration-v1.json"
DEFAULT_SPLIT = ROOT / "data" / "face-identity-split-v1.csv"
DEFAULT_CANONICAL = ROOT / "data" / "face-roster-pressure-test-after.csv"
DEFAULT_GALLERY = ROOT / "data" / "face-roster-gallery-after.csv"
DEFAULT_VALIDATION = ROOT / "data" / "face-aggregation-validation-lock-v1.json"
DEFAULT_HOLDOUT = ROOT / "data" / "face-aggregation-holdout-v1.json"
ROUNDS = 2000
SEED = 20260818
CANDIDATES = ("canonical_single", "gallery_mean", "gallery_median", "gallery_trimmed_mean")
CANDIDATE_ORDER = {"gallery_mean": 0, "gallery_median": 1, "gallery_trimmed_mean": 2}

for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except Exception:
        pass


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def finite(value) -> bool:
    return isinstance(value, (int, float)) and math.isfinite(value)


def qci(values):
    return [quantile(values, .025), quantile(values, .975)] if values else [None, None]


def stable_seed(salt):
    return int.from_bytes(hashlib.sha256(f"{SEED}:{salt}".encode()).digest()[:8], "big")


def boot(items, statistic, salt):
    rng = random.Random(stable_seed(salt))
    values = []
    for _ in range(ROUNDS):
        sample = [items[rng.randrange(len(items))] for _ in items]
        value = statistic(sample)
        if finite(value):
            values.append(value)
    return values


def read(path):
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def raw(row):
    text = (row.get("model_raw") or "").strip()
    if not text:
        return None
    value = float(text)
    if not finite(value):
        raise ValueError("NaN/Infinity model_raw.")
    return value


def aggregate(method, values):
    if not values:
        return None
    if method == "gallery_mean":
        return statistics.fmean(values)
    if method == "gallery_median":
        return statistics.median(values)
    if method == "gallery_trimmed_mean":
        ordered = sorted(values)
        return statistics.fmean(ordered[1:-1] if len(ordered) >= 3 else ordered)
    raise ValueError(method)


def load_inputs(split_path, canonical_path, gallery_path):
    frozen = {row["identity_id"]: row for row in read(split_path)}
    if len(frozen) != 199:
        raise ValueError("Frozen split must contain exactly 199 identities.")
    canonical = {}
    for row in read(canonical_path):
        identity = row["slug"]
        if identity in canonical or identity not in frozen:
            raise ValueError(f"Canonical coverage error: {identity}")
        canonical[identity] = raw(row)
    grouped = defaultdict(list)
    for row in read(gallery_path):
        identity = row["identity_id"]
        if identity not in frozen:
            raise ValueError(f"Gallery identity absent from split: {identity}")
        grouped[identity].append(raw(row))
    if set(canonical) != set(frozen) or set(grouped) != set(frozen):
        raise ValueError("Canonical/gallery identities must exactly match frozen split.")
    items = []
    for identity, meta in frozen.items():
        values = [value for value in grouped[identity] if value is not None]
        predictions = {"canonical_single": canonical[identity]}
        for method in CANDIDATES[1:]:
            predictions[method] = aggregate(method, values)
        items.append({
            "identity_id": identity,
            "split": meta["split"],
            "group": meta["expected_sex"],
            "label": float(meta["expected_looks"]),
            "ethnicity": meta["editorial_ethnicity"],
            "gallery_raws": values,
            "predictions": predictions,
        })
    return items


def rows(items, method):
    return [{"id": item["identity_id"], "group": item["group"],
             "label": item["label"], "raw": item["predictions"][method]}
            for item in items if item["predictions"][method] is not None]


def value(metric_rows, metric):
    if metric == "auc":
        return extreme_auc(metric_rows, within_group=True)[0]
    if metric == "pairwise":
        return pairwise_accuracy(metric_rows, 1.0, "group")[0]
    if metric == "rho":
        return spearman([row["raw"] for row in metric_rows],
                        [row["label"] for row in metric_rows])
    raise ValueError(metric)


def summary(items, method, salt):
    method_rows = rows(items, method)
    output = {"scored_identities": len(method_rows), "identity_refusal_rate": 1 - len(method_rows) / len(items)}
    for metric in ("auc", "pairwise", "rho"):
        point = value(method_rows, metric)
        samples = boot(items, lambda sample: value(rows(sample, method), metric), f"{salt}:{method}:{metric}")
        detail = {"value": point, "bootstrap_95_ci": qci(samples)}
        if metric == "auc":
            _, low, high = extreme_auc(method_rows, within_group=True)
            detail.update({"low_identities": low, "high_identities": high})
        elif metric == "pairwise":
            _, pairs = pairwise_accuracy(method_rows, 1.0, "group")
            detail["eligible_pairs"] = pairs
        output[metric] = detail
    return output


def paired_delta(items, candidate, salt):
    common = [item for item in items
              if item["predictions"]["canonical_single"] is not None
              and item["predictions"][candidate] is not None]
    output = {"common_scored_identities": len(common)}
    for metric in ("auc", "pairwise", "rho"):
        def delta(sample):
            return value(rows(sample, candidate), metric) - value(rows(sample, "canonical_single"), metric)
        point = delta(common)
        output[metric] = {"value": point, "bootstrap_95_ci": qci(boot(common, delta, f"{salt}:{candidate}:{metric}:delta"))}
    candidate_refusal = sum(item["predictions"][candidate] is None for item in items) / len(items)
    baseline_refusal = sum(item["predictions"]["canonical_single"] is None for item in items) / len(items)
    def refusal_delta(sample):
        return (
            sum(item["predictions"][candidate] is None for item in sample)
            - sum(item["predictions"]["canonical_single"] is None for item in sample)
        ) / len(sample)
    output["identity_refusal_rate_after_minus_baseline"] = {
        "value": candidate_refusal - baseline_refusal,
        "bootstrap_95_ci": qci(boot(items, refusal_delta, f"{salt}:{candidate}:refusal:delta")),
    }
    return output


def loo_stability(items, method, salt):
    eligible = []
    for item in items:
        values = item["gallery_raws"]
        if len(values) < 2:
            continue
        estimates = [aggregate(method, values[:index] + values[index + 1:])
                     for index in range(len(values))]
        eligible.append({
            "sd": statistics.stdev(estimates) if len(estimates) > 1 else 0.0,
            "range": max(estimates) - min(estimates),
        })
    output = {"eligible_identities": len(eligible)}
    for metric in ("sd", "range"):
        point = statistics.median(item[metric] for item in eligible)
        samples = boot(eligible, lambda sample: statistics.median(item[metric] for item in sample),
                       f"{salt}:{method}:loo:{metric}")
        output[f"median_leave_one_out_{metric}"] = {"value": point, "bootstrap_95_ci": qci(samples)}
    return output


def has_primary_classes(items):
    _, low, high = extreme_auc(rows(items, "canonical_single"), within_group=True)
    return bool(low and high)


def subgroup_blocks(items, methods, salt):
    sexes = {
        group: group_items for group in sorted({item["group"] for item in items})
        if (group_items := [item for item in items if item["group"] == group])
    }
    ethnicity_candidates = {
        group: [item for item in items if item["ethnicity"] == group]
        for group in sorted({item["ethnicity"] for item in items})
    }
    ethnicities = {
        group: group_items for group, group_items in ethnicity_candidates.items()
        if len([item for item in group_items if all(item["predictions"][method] is not None for method in methods)]) >= 20
        and has_primary_classes([item for item in group_items
                                 if all(item["predictions"][method] is not None for method in methods)])
    }
    def build(groups, namespace):
        return {
            group: {
                method: summary(group_items, method, f"{salt}:{namespace}:{group}")
                for method in methods
            }
            for group, group_items in groups.items()
        }
    return build(sexes, "sex"), build(ethnicities, "ethnicity")


def validation_payload(items, prereg_path, split_path, canonical_path, gallery_path):
    validation = [item for item in items if item["split"] == "validation"]
    common = [item for item in validation
              if all(item["predictions"][method] is not None for method in CANDIDATES)]
    summaries = {method: summary(common, method, "validation:common") for method in CANDIDATES}
    deltas = {method: paired_delta(validation, method, "validation") for method in CANDIDATES[1:]}
    stability = {method: loo_stability(validation, method, "validation") for method in CANDIDATES[1:]}
    mean_stability = stability["gallery_mean"]
    eligible = []
    for method in CANDIDATES[1:]:
        delta = deltas[method]
        auc_delta = delta["auc"]["value"]
        pair_delta = delta["pairwise"]["value"]
        refusal_delta = delta["identity_refusal_rate_after_minus_baseline"]["value"]
        primary_pass = max(auc_delta, pair_delta) >= .03 and min(auc_delta, pair_delta) >= -.01
        refusal_pass = refusal_delta <= .03
        stability_pass = True
        if method != "gallery_mean":
            for metric in ("sd", "range"):
                candidate_value = stability[method][f"median_leave_one_out_{metric}"]["value"]
                reference = mean_stability[f"median_leave_one_out_{metric}"]["value"]
                if reference and candidate_value / reference - 1 > .10:
                    stability_pass = False
        if primary_pass and refusal_pass and stability_pass:
            eligible.append(method)
        delta["validation_gate"] = {
            "primary_pass": primary_pass,
            "refusal_pass": refusal_pass,
            "stability_pass": stability_pass,
            "eligible": primary_pass and refusal_pass and stability_pass,
        }
    eligible.sort(key=lambda method: (
        min(deltas[method]["auc"]["value"], deltas[method]["pairwise"]["value"]),
        deltas[method]["auc"]["value"] + deltas[method]["pairwise"]["value"],
        -CANDIDATE_ORDER[method],
    ), reverse=True)
    selected = eligible[0] if eligible else None
    return {
        "schema_version": "face-aggregation-validation-lock.v1",
        "generated_date": "2026-08-18",
        "phase": "validation",
        "holdout_examined_by_this_artifact": False,
        "inputs": {
            "preregistration": {"path": prereg_path.relative_to(ROOT).as_posix(), "sha256": sha(prereg_path)},
            "identity_split": {"path": split_path.relative_to(ROOT).as_posix(), "sha256": sha(split_path)},
            "canonical_batch": {"path": canonical_path.relative_to(ROOT).as_posix(), "sha256": sha(canonical_path)},
            "gallery_batch": {"path": gallery_path.relative_to(ROOT).as_posix(), "sha256": sha(gallery_path)},
        },
        "identity_count": len(validation),
        "common_scored_identity_count": len(common),
        "candidates": summaries,
        "paired_candidate_minus_canonical": deltas,
        "leave_one_out_stability": stability,
        "selected_candidate": selected,
        "selection_result": "one finalist locked" if selected else "no candidate passed validation; holdout remains closed",
        "label_interpretation": "Independent Matchmaker editorial judgments, not scientific ground truth or universal consensus.",
    }


def holdout_payload(items, lock, prereg_path, split_path, canonical_path, gallery_path):
    expected = {
        "preregistration": sha(prereg_path),
        "identity_split": sha(split_path),
        "canonical_batch": sha(canonical_path),
        "gallery_batch": sha(gallery_path),
    }
    for name, digest in expected.items():
        if lock["inputs"][name]["sha256"] != digest:
            raise ValueError(f"Validation lock input drift: {name}")
    selected = lock.get("selected_candidate")
    if not selected:
        return {
            "schema_version": "face-aggregation-holdout.v1",
            "phase": "holdout",
            "status": "not opened: no validation finalist",
            "selected_candidate": None,
            "validation_lock_sha256": None,
        }
    holdout = [item for item in items if item["split"] == "holdout"]
    common = [item for item in holdout
              if item["predictions"]["canonical_single"] is not None
              and item["predictions"][selected] is not None]
    sex, ethnicity = subgroup_blocks(common, ("canonical_single", selected), "holdout")
    return {
        "schema_version": "face-aggregation-holdout.v1",
        "generated_date": "2026-08-18",
        "phase": "holdout",
        "status": "evaluated locked validation finalist once",
        "selected_candidate": selected,
        "identity_count": len(holdout),
        "common_scored_identity_count": len(common),
        "baseline": summary(common, "canonical_single", "holdout"),
        "candidate": summary(common, selected, "holdout"),
        "paired_candidate_minus_canonical": paired_delta(holdout, selected, "holdout"),
        "leave_one_out_stability": {
            "gallery_mean": loo_stability(holdout, "gallery_mean", "holdout"),
            selected: loo_stability(holdout, selected, "holdout"),
        },
        "expected_sex_subgroups": sex,
        "editorial_ethnicity_subgroups": ethnicity,
        "demographic_provenance": {
            "source": "matchmaker.html explicit editorial ethnicity field",
            "image_inference_used": False,
            "minimum_common_scored_identities": 20,
            "no_eligible_groups": not bool(ethnicity),
        },
        "label_interpretation": "Independent Matchmaker editorial judgments, not scientific ground truth or universal consensus.",
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", choices=("validation", "holdout"), required=True)
    parser.add_argument("--prereg", type=Path, default=DEFAULT_PREREG)
    parser.add_argument("--split", type=Path, default=DEFAULT_SPLIT)
    parser.add_argument("--canonical", type=Path, default=DEFAULT_CANONICAL)
    parser.add_argument("--gallery", type=Path, default=DEFAULT_GALLERY)
    parser.add_argument("--validation-lock", type=Path, default=DEFAULT_VALIDATION)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    paths = {name: getattr(args, name).resolve() for name in
             ("prereg", "split", "canonical", "gallery", "validation_lock")}
    prereg = json.loads(paths["prereg"].read_text(encoding="utf-8"))
    if prereg.get("schema_version") != "face-evaluation-preregistration.v1":
        raise ValueError("Wrong preregistration schema.")
    if prereg["identity_split"]["sha256"] != sha(paths["split"]):
        raise ValueError("Frozen split hash differs from preregistration.")
    items = load_inputs(paths["split"], paths["canonical"], paths["gallery"])
    if args.phase == "validation":
        payload = validation_payload(items, paths["prereg"], paths["split"],
                                     paths["canonical"], paths["gallery"])
        output = (args.output or paths["validation_lock"]).resolve()
    else:
        lock = json.loads(paths["validation_lock"].read_text(encoding="utf-8"))
        payload = holdout_payload(items, lock, paths["prereg"], paths["split"],
                                  paths["canonical"], paths["gallery"])
        payload["validation_lock_sha256"] = sha(paths["validation_lock"])
        output = (args.output or DEFAULT_HOLDOUT).resolve()
    output.write_text(json.dumps(payload, indent=2, sort_keys=True, allow_nan=False) + "\n",
                      encoding="utf-8")
    print(json.dumps({
        "phase": args.phase,
        "output": output.relative_to(ROOT).as_posix(),
        "selected_candidate": payload.get("selected_candidate"),
        "selection_result": payload.get("selection_result") or payload.get("status"),
    }, indent=2))


if __name__ == "__main__":
    main()
