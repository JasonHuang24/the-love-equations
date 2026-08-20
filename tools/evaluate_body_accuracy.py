#!/usr/bin/env python3
"""Evaluate Body Calculator rows against human labels without conflating concepts.

Discrimination (rank correlation, AUC, and pairwise ordering) is reported separately
from display calibration. A strictly monotone remap preserves ordering metrics;
quantization can introduce ties, but neither operation adds attractiveness intelligence.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import random
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path


DEFAULT_SEED = 20260818


def finite(value):
    return isinstance(value, (int, float)) and math.isfinite(value)


def number(value):
    try:
        result = float(value)
    except (TypeError, ValueError):
        return None
    return result if math.isfinite(result) else None


def display_number(value):
    text = str(value or "").strip()
    if not text:
        return None
    if "–" in text:
        values = [number(part) for part in text.split("–", 1)]
        return sum(values) / 2 if all(item is not None for item in values) else None
    return number(text)


def public_half_point(value):
    """Match Math.round(score * 2) / 2 for the production-positive 1-10 scale."""
    return math.floor(value * 2 + 0.5) / 2 if finite(value) else None


def quantile(values, probability):
    values = sorted(value for value in values if finite(value))
    if not values:
        return None
    if len(values) == 1:
        return values[0]
    position = (len(values) - 1) * probability
    low, high = math.floor(position), math.ceil(position)
    if low == high:
        return values[low]
    return values[low] + (values[high] - values[low]) * (position - low)


def mean(values):
    values = [value for value in values if finite(value)]
    return statistics.fmean(values) if values else None


def stdev(values):
    values = [value for value in values if finite(value)]
    return statistics.pstdev(values) if len(values) > 1 else (0.0 if values else None)


def rankdata(values):
    order = sorted(range(len(values)), key=values.__getitem__)
    ranks = [0.0] * len(values)
    offset = 0
    while offset < len(order):
        end = offset + 1
        while end < len(order) and values[order[end]] == values[order[offset]]:
            end += 1
        rank = (offset + end - 1) / 2 + 1
        for index in range(offset, end):
            ranks[order[index]] = rank
        offset = end
    return ranks


def pearson(xs, ys):
    if len(xs) < 3 or len(xs) != len(ys):
        return None
    x_mean, y_mean = statistics.fmean(xs), statistics.fmean(ys)
    x_delta = [value - x_mean for value in xs]
    y_delta = [value - y_mean for value in ys]
    denominator = math.sqrt(sum(value * value for value in x_delta) * sum(value * value for value in y_delta))
    return sum(x * y for x, y in zip(x_delta, y_delta)) / denominator if denominator else None


def spearman(xs, ys):
    return pearson(rankdata(xs), rankdata(ys)) if len(xs) >= 3 else None


def auc(scores, binary_labels):
    """Mann-Whitney AUC in O(n log n), with score ties worth one half."""
    pairs = sorted(zip(scores, binary_labels), key=lambda pair: pair[0])
    positives = sum(label == 1 for _, label in pairs)
    negatives = sum(label == 0 for _, label in pairs)
    if not positives or not negatives:
        return None
    wins = 0.0
    lower_negatives = 0
    offset = 0
    while offset < len(pairs):
        end = offset + 1
        while end < len(pairs) and pairs[end][0] == pairs[offset][0]:
            end += 1
        tied_positives = sum(label == 1 for _, label in pairs[offset:end])
        tied_negatives = (end - offset) - tied_positives
        wins += tied_positives * lower_negatives + 0.5 * tied_positives * tied_negatives
        lower_negatives += tied_negatives
        offset = end
    return wins / (positives * negatives)


def top_bottom_auc(scores, labels):
    low, high = quantile(labels, 0.25), quantile(labels, 0.75)
    selected = [(score, 1 if label >= high else 0)
                for score, label in zip(scores, labels)
                if label <= low or label >= high]
    return auc([item[0] for item in selected], [item[1] for item in selected]), low, high, len(selected)


def gap_key(gap):
    return format(float(gap), ".12g")


def pairwise_accuracy(scores, labels, gaps=(0,)):
    """Fenwick-tree ordering accuracy; gap 0 means every unequal-label pair."""
    if len(scores) != len(labels):
        raise ValueError("scores and labels must have equal length")
    if any(not finite(gap) or gap < 0 for gap in gaps):
        raise ValueError("pairwise gaps must be finite and non-negative")
    score_rank = {value: index + 1 for index, value in enumerate(sorted(set(scores)))}
    ordered = sorted(zip(labels, scores), key=lambda item: item[0])
    output = {}
    for gap in gaps:
        tree = [0] * (len(score_rank) + 1)

        def add(index):
            while index < len(tree):
                tree[index] += 1
                index += index & -index

        def count(index):
            total = 0
            while index:
                total += tree[index]
                index -= index & -index
            return total

        wins = 0.0
        pairs = eligible = pointer = 0
        for high_label, high_score in ordered:
            limit = high_label if gap == 0 else high_label - gap
            while pointer < len(ordered) and (
                    ordered[pointer][0] < limit if gap == 0 else ordered[pointer][0] <= limit):
                add(score_rank[ordered[pointer][1]])
                eligible += 1
                pointer += 1
            rank = score_rank[high_score]
            lower = count(rank - 1)
            tied = count(rank) - lower
            wins += lower + 0.5 * tied
            pairs += eligible
        output[gap_key(gap)] = {"accuracy": wins / pairs if pairs else None, "pairs": pairs}
    return output


def pairwise_accuracy_naive(scores, labels, gaps=(0,)):
    output = {}
    for gap in gaps:
        wins = 0.0
        pairs = 0
        for left in range(len(scores)):
            for right in range(left + 1, len(scores)):
                difference = labels[left] - labels[right]
                if difference == 0 or (gap > 0 and abs(difference) < gap):
                    continue
                high, low = (left, right) if difference > 0 else (right, left)
                wins += 1 if scores[high] > scores[low] else 0.5 if scores[high] == scores[low] else 0
                pairs += 1
        output[gap_key(gap)] = {"accuracy": wins / pairs if pairs else None, "pairs": pairs}
    return output


def calibration(scores, labels):
    score_mean, label_mean = statistics.fmean(scores), statistics.fmean(labels)
    denominator = sum((score - score_mean) ** 2 for score in scores)
    slope = (sum((score - score_mean) * (label - label_mean)
                 for score, label in zip(scores, labels)) / denominator) if denominator else 0.0
    intercept = label_mean - slope * score_mean
    residuals = [label - (intercept + slope * score) for score, label in zip(scores, labels)]
    return {
        "linear_fit_label_from_score": {"intercept": intercept, "slope": slope},
        "rmse_after_in_sample_linear_fit": math.sqrt(statistics.fmean(value * value for value in residuals)),
        "mae_after_in_sample_linear_fit": statistics.fmean(abs(value) for value in residuals),
        "residual_quantiles": {str(value): quantile(residuals, value)
                               for value in (0, 0.1, 0.25, 0.5, 0.75, 0.9, 1)},
        "warning": "Descriptive in-sample display fit only; not evidence of improved ordering.",
    }


def discrimination(scores, labels, gaps):
    auc_value, low, high, auc_n = top_bottom_auc(scores, labels)
    return {
        "spearman": spearman(scores, labels),
        "pearson": pearson(scores, labels),
        "top_bottom_quartile_auc": auc_value,
        "top_bottom_quartile_n": auc_n,
        "label_q25": low,
        "label_q75": high,
        "pairwise": pairwise_accuracy(scores, labels, gaps),
    }


def point_metrics(rows, gaps, score_key="score", score_limits=(1.0, 10.0)):
    usable = [row for row in rows if finite(row.get(score_key)) and finite(row.get("label"))]
    scores = [row[score_key] for row in usable]
    labels = [row["label"] for row in usable]
    if len(usable) < 3:
        return {"n": len(usable)}
    score_summary = {
        "min": min(scores), "max": max(scores), "mean": mean(scores), "sd": stdev(scores),
        "q01": quantile(scores, 0.01), "q25": quantile(scores, 0.25),
        "median": quantile(scores, 0.5), "q75": quantile(scores, 0.75), "q99": quantile(scores, 0.99),
    }
    if score_limits is not None:
        floor, ceiling = score_limits
        score_summary.update({
            "floor_n": sum(score <= floor + 0.000001 for score in scores),
            "ceiling_n": sum(score >= ceiling - 0.000001 for score in scores),
            "saturation_definition": {"floor": floor, "ceiling": ceiling},
        })
    return {
        "n": len(usable),
        **discrimination(scores, labels, gaps),
        "score": score_summary,
        "label": {"min": min(labels), "max": max(labels), "mean": mean(labels), "sd": stdev(labels)},
        "display_calibration": calibration(scores, labels),
    }


def confidence_interval(values):
    values = sorted(value for value in values if finite(value))
    return [quantile(values, 0.025), quantile(values, 0.975)] if values else [None, None]


def bootstrap(rows, repetitions, seed, gaps, cluster_key):
    groups = defaultdict(list)
    for row in rows:
        if finite(row.get("score")) and finite(row.get("label")):
            groups[row.get(cluster_key) or row.get("image_id")].append(row)
    keys = sorted(groups)
    if not keys:
        return {"method": f"cluster bootstrap by {cluster_key}", "repetitions": repetitions,
                "seed": seed, "clusters": 0, "95pct_ci": {}}
    rng = random.Random(seed)
    draws = defaultdict(list)
    for _ in range(repetitions):
        sample = []
        for key in rng.choices(keys, k=len(keys)):
            sample.extend(groups[key])
        scores = [row["score"] for row in sample]
        labels = [row["label"] for row in sample]
        metrics = discrimination(scores, labels, gaps)
        for key in ("spearman", "pearson", "top_bottom_quartile_auc"):
            draws[key].append(metrics.get(key))
        for gap, value in metrics["pairwise"].items():
            draws[f"pairwise_gap_{gap}"].append(value.get("accuracy"))
    return {
        "method": f"cluster bootstrap by {cluster_key}; clusters sampled with replacement, all rows retained",
        "repetitions": repetitions,
        "seed": seed,
        "clusters": len(keys),
        "95pct_ci": {key: confidence_interval(values) for key, values in sorted(draws.items())},
    }


def cohort_composition(rows):
    fields = ("label_sex", "variant", "demographic_code", "instrument", "routing", "body_exposure", "framing", "framing_quality", "override", "gate_band", "geom_cues")
    return {
        field: dict(sorted(Counter(row.get(field) or "unknown" for row in rows).items()))
        for field in fields
    }


def label_summary(rows):
    labeled = [row for row in rows if finite(row.get("label"))]
    labels = [row["label"] for row in labeled]
    return {
        "n": len(labeled),
        "image_ids": [row.get("image_id") for row in labeled],
        "mean": mean(labels),
        "min": min(labels) if labels else None,
        "q25": quantile(labels, 0.25),
        "median": quantile(labels, 0.5),
        "q75": quantile(labels, 0.75),
        "max": max(labels) if labels else None,
    }


def refusal_selectivity(rows):
    labeled = [row for row in rows if finite(row.get("label"))]
    labels = [row["label"] for row in labeled]
    thresholds = {
        "q25": quantile(labels, 0.25),
        "median": quantile(labels, 0.5),
        "q75": quantile(labels, 0.75),
    }
    groups = {
        "numeric_score": [row for row in labeled if row.get("numeric_scored")],
        "refused_error_or_non_numeric": [row for row in labeled if not row.get("numeric_scored")],
    }
    quartiles = {"q1_lowest": [], "q2": [], "q3": [], "q4_highest": []}
    for row in labeled:
        label = row["label"]
        bucket = ("q1_lowest" if label <= thresholds["q25"] else
                  "q2" if label <= thresholds["median"] else
                  "q3" if label <= thresholds["q75"] else "q4_highest")
        quartiles[bucket].append(row)
    return {
        "selection_warning": (
            "Discrimination on finite accepted rows can be selection-biased when refusal depends on label; "
            "report refusal behavior alongside accepted-row metrics."
        ),
        "all_labels": label_summary(labeled),
        "numeric_score": label_summary(groups["numeric_score"]),
        "refused_error_or_non_numeric": label_summary(groups["refused_error_or_non_numeric"]),
        "refused_labels_by_image_id": {
            row.get("image_id"): row.get("label") for row in groups["refused_error_or_non_numeric"]
        },
        "label_quartile_thresholds": thresholds,
        "refusal_by_label_quartile": {
            key: {
                "submitted": len(value),
                "refused_error_or_non_numeric": sum(not row.get("numeric_scored") for row in value),
                "refusal_rate": (sum(not row.get("numeric_scored") for row in value) / len(value)) if value else None,
                "refused_image_ids": [row.get("image_id") for row in value if not row.get("numeric_scored")],
            }
            for key, value in quartiles.items()
        },
    }


def subgroup_metrics(rows, fields, gaps):
    output = {}
    for field in fields:
        groups = defaultdict(list)
        for row in rows:
            groups[row.get(field) or "unknown"].append(row)
        output[field] = {}
        for key, group in sorted(groups.items()):
            entry = {
                "n": len(group),
                "small_sample": len(group) < 10,
                "metrics_meaningful": len(group) >= 3,
            }
            if len(group) >= 3:
                entry.update(point_metrics(group, gaps))
            output[field][key] = entry
    return output


def identity_stability(rows, identity_key, definition, identity_metadata):
    groups = defaultdict(list)
    for row in rows:
        if finite(row.get("score")):
            groups[row.get(identity_key) or row.get("image_id")].append(row)
    multiple = [values for values in groups.values() if len(values) >= 2]
    deviations = [statistics.pstdev([row["score"] for row in values]) for values in multiple]
    ranges = [max(row["score"] for row in values) - min(row["score"] for row in values) for values in multiple]
    composite_clusters = sum(
        any(str(row.get("variant") or "").lower() == "headswap" for row in values)
        for values in multiple
    )
    evidence_type = identity_metadata.get("evidence_type")
    if not evidence_type and composite_clusters:
        evidence_type = "same pictured-body/head-swap composite clusters, not natural repeat photos, angles, or days"
    elif not evidence_type and multiple:
        evidence_type = "repeated-image structure is unspecified by dataset metadata"
    elif not evidence_type:
        evidence_type = "no scored identity has multiple images"
    return {
        "identity_field": identity_key,
        "identity_definition": definition,
        "identities": len(groups),
        "identities_with_multiple_images": len(multiple),
        "multiple_image_clusters_with_headswap_composites": composite_clusters,
        "evidence_type": evidence_type,
        "natural_repeat_photography": bool(identity_metadata.get("natural_repeat_photography", False)),
        "limitation": "This diagnostic is not general multi-photo identity stability unless dataset metadata establishes natural repeat photographs across poses, angles, sessions, or days.",
        "within_identity_display_sd_mean": mean(deviations),
        "within_identity_display_sd_median": quantile(deviations, 0.5),
        "within_identity_display_sd_p90": quantile(deviations, 0.9),
        "within_identity_display_range_mean": mean(ranges),
        "within_identity_display_range_p90": quantile(ranges, 0.9),
    }


def boolean(value):
    if isinstance(value, bool):
        return value
    normalized = str(value or "").strip().lower()
    if normalized in ("true", "1", "yes"):
        return True
    if normalized in ("false", "0", "no"):
        return False
    return None


def numeric_distribution(values):
    values = [value for value in values if finite(value)]
    return {
        "n": len(values),
        "min": min(values) if values else None,
        "q25": quantile(values, 0.25),
        "median": quantile(values, 0.5),
        "q75": quantile(values, 0.75),
        "p90": quantile(values, 0.9),
        "max": max(values) if values else None,
        "mean": mean(values),
        "nonzero": sum(value > 0 for value in values),
    }


def crop_padding_diagnostic(rows, score_key="score", outcome_key="outcome", delta_key=None):
    instrumented = []
    for row in rows:
        padding = number(row.get("crop_padding_fraction"))
        if padding is None:
            continue
        outside = boolean(row.get("crop_outside"))
        instrumented.append({
            **row,
            "_crop_padding": padding,
            "_crop_outside": padding > 0 if outside is None else outside,
        })

    def outcome_bucket(group):
        refused = sum(str(row.get(outcome_key) or "").lower() != "scored" for row in group)
        return {
            "n": len(group),
            "refused_or_error": refused,
            "refusal_rate": refused / len(group) if group else None,
        }

    def score_bucket(group):
        values = [number(row.get(score_key)) for row in group]
        values = [value for value in values if value is not None]
        return {
            "n": len(values),
            "min": min(values) if values else None,
            "median": quantile(values, 0.5),
            "max": max(values) if values else None,
            "mean": mean(values),
        }

    outside_rows = [row for row in instrumented if row["_crop_outside"]]
    inside_rows = [row for row in instrumented if not row["_crop_outside"]]
    scored = [row for row in instrumented if number(row.get(score_key)) is not None]
    padding_values = [row["_crop_padding"] for row in scored]
    score_values = [number(row.get(score_key)) for row in scored]
    outside_scores = score_bucket(outside_rows)
    inside_scores = score_bucket(inside_rows)
    by_outcome = {}
    for outcome in sorted({str(row.get(outcome_key) or "unknown") for row in rows}):
        group = [row for row in instrumented if str(row.get(outcome_key) or "unknown") == outcome]
        by_outcome[outcome] = {
            "rows": sum(str(row.get(outcome_key) or "unknown") == outcome for row in rows),
            "instrumented_rows": len(group),
            "crop_outside_rows": sum(row["_crop_outside"] for row in group),
            "padding": numeric_distribution([row["_crop_padding"] for row in group]),
        }
    if not instrumented:
        comparison_limitation = "No rows contain crop diagnostics, so crop-padding incidence or effect cannot be estimated from this artifact."
    elif not outside_rows:
        comparison_limitation = "No instrumented crop extended outside the image, so an outside-crop comparison is unavailable."
    elif not inside_rows:
        comparison_limitation = "Every instrumented crop extended outside the image; there is no inside-crop control group, so outside-versus-inside outcome or mean-score effects are unidentifiable."
    else:
        comparison_limitation = "Both outside- and inside-crop rows are present, but their contrast remains observational and confounded by framing."
    diagnostic = {
        "rows": len(rows),
        "instrumented_rows": len(instrumented),
        "unavailable_rows": len(rows) - len(instrumented),
        "crop_outside_rows": len(outside_rows),
        "crop_inside_rows": len(inside_rows),
        "crop_outside_rate_instrumented": len(outside_rows) / len(instrumented) if instrumented else None,
        "padding_fraction": numeric_distribution([row["_crop_padding"] for row in instrumented]),
        "by_outcome": by_outcome,
        "outcome_sensitivity": {
            "crop_outside": outcome_bucket(outside_rows),
            "crop_inside": outcome_bucket(inside_rows),
            "no_diagnostic": outcome_bucket([row for row in rows if number(row.get("crop_padding_fraction")) is None]),
        },
        "score_sensitivity": {
            "scored_instrumented_rows": len(scored),
            "padding_vs_continuous_score_spearman": spearman(padding_values, score_values) if len(scored) >= 3 else None,
            "padding_vs_continuous_score_pearson": pearson(padding_values, score_values) if len(scored) >= 3 else None,
            "crop_outside_scores": outside_scores,
            "crop_inside_scores": inside_scores,
            "outside_minus_inside_mean": (
                outside_scores["mean"] - inside_scores["mean"]
                if finite(outside_scores["mean"]) and finite(inside_scores["mean"]) else None
            ),
        },
        "interpretation": "Descriptive association only. Padding is produced by pose/framing geometry and is not randomized, so score or refusal differences are not causal evidence.",
        "comparison_limitation": comparison_limitation,
    }
    if delta_key:
        def delta_bucket(group):
            values = [number(row.get(delta_key)) for row in group]
            values = [value for value in values if value is not None]
            return {
                "n": len(values),
                "mean_signed": mean(values),
                "mean_absolute": mean([abs(value) for value in values]),
                "maximum_absolute": max((abs(value) for value in values), default=None),
            }
        diagnostic["paired_score_delta_sensitivity"] = {
            "crop_outside": delta_bucket(outside_rows),
            "crop_inside": delta_bucket(inside_rows),
        }
    return diagnostic


def file_sha256(path):
    digest = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def dataset_payload(raw):
    if isinstance(raw, dict) and isinstance(raw.get("label"), dict):
        return raw
    if isinstance(raw, dict) and isinstance(raw.get("dataset"), dict):
        return raw["dataset"]
    raise ValueError("dataset metadata has no label definition")


def load_rows(path, label_field):
    rows = []
    with path.open(newline="", encoding="utf-8-sig") as handle:
        for raw in csv.DictReader(handle):
            label = number(raw.get(label_field))
            score = display_number(raw.get("bp_continuous") or raw.get("bp"))
            explicit_public = display_number(
                raw.get("public_score") or raw.get("public_bp") or raw.get("headline_score")
                or (raw.get("bp") if raw.get("bp_continuous") else None))
            public_score = explicit_public if explicit_public is not None else public_half_point(score)
            model_raw = number(raw.get("model_raw"))
            outcome = raw.get("outcome") or ""
            instrument = "cnn" if model_raw is not None else ("geometry" if score is not None else "none")
            routing = raw.get("routing") or "unknown"
            body_exposure = "bare" if "bare" in routing.lower() else ("clothed" if "clothed" in routing.lower() else "unknown")
            has_override = bool(str(raw.get("override") or "").strip())
            gate_clean = str(raw.get("gate_band") or "").strip().lower() == "pass"
            warning = bool(str(raw.get("pose_warning") or "").strip())
            framing_quality = "override" if has_override else ("clean" if gate_clean and not warning else "degraded")
            rows.append({
                **raw,
                "label": label,
                "score": score,
                "public_score": public_score,
                "public_score_source": "explicit_batch_column" if explicit_public is not None else "derived_half_point_from_bp",
                "model_score": model_raw,
                "instrument": instrument,
                "routing": routing,
                "body_exposure": body_exposure,
                "framing_quality": framing_quality,
                "numeric_scored": outcome == "scored" and score is not None,
            })
    return rows


def fmt(value):
    return "n/a" if not finite(value) else f"{value:.3f}"


def markdown(report):
    continuous = report["continuous_pipeline_score"]
    display = report["public_half_point_display"]
    cnn = report["cnn_raw"]
    label = report["dataset"]["label"]
    interpretation = report["interpretation"]
    lines = [
        "# Body Calculator subjective-accuracy evaluation", "",
        f"Dataset: {report['dataset'].get('dataset', report['dataset'].get('name', 'unspecified'))}<br>",
        f"Label: {label.get('definition', label.get('field', 'unspecified'))}<br>",
        f"Input: `{report['inputs']['batch_csv']['path']}`<br>",
        f"SHA-256: `{report['inputs']['batch_csv']['sha256']}`<br>",
        (f"Evaluation lock: `{report['inputs']['evaluation_lock']['sha256']}` "
         f"({report['evaluation_phase']})<br>" if report['inputs']['evaluation_lock'] else "Evaluation lock: none<br>"),
        f"Rows: {report['rows']} · numeric production results: {report['numeric_display_rows']} · "
        f"refused/error/non-numeric: {report['rows'] - report['numeric_display_rows']}", "",
        "## Evidence classification", "",
        f"- Independent of the shipped model: {str(interpretation['independent_of_shipped_model']).lower()}.",
        f"- Body-specific label: {str(interpretation['body_specific']).lower()}.",
        f"- Interpretation: {interpretation['independence'].rstrip('.')}.",
        "", "## Discrimination", "",
        "| instrument | n | Spearman | Pearson | top-vs-bottom quartile AUC |",
        "| --- | ---: | ---: | ---: | ---: |",
        f"| continuous internal pipeline score (primary metric) | {continuous.get('n', 0)} | "
        f"{fmt(continuous.get('spearman'))} | {fmt(continuous.get('pearson'))} | "
        f"{fmt(continuous.get('top_bottom_quartile_auc'))} |",
        f"| public half-point headline | {display.get('n', 0)} | {fmt(display.get('spearman'))} | "
        f"{fmt(display.get('pearson'))} | {fmt(display.get('top_bottom_quartile_auc'))} |",
        f"| CNN raw, model-route rows | {cnn.get('n', 0)} | {fmt(cnn.get('spearman'))} | "
        f"{fmt(cnn.get('pearson'))} | {fmt(cnn.get('top_bottom_quartile_auc'))} |",
        "", "Pairwise ordering for the public half-point headline (ties receive one half):", "",
        "| minimum label gap | eligible pairs | accuracy |",
        "| ---: | ---: | ---: |",
    ]
    for gap, value in display.get("pairwise", {}).items():
        lines.append(f"| {gap} | {value['pairs']} | {fmt(value['accuracy'])} |")
    lines.extend([
        "", "A strictly monotone remap leaves Spearman, AUC, and pairwise ordering unchanged. Half-point quantization introduces ties and can change tie-aware metrics, but adds no attractiveness intelligence.",
        "", "## Bootstrap uncertainty", "",
        f"Cluster bootstrap: {report['bootstrap']['repetitions']} repetitions, "
        f"{report['bootstrap']['clusters']} clusters, seed {report['bootstrap']['seed']}.", "",
    ])
    for key, bounds in report["bootstrap"]["95pct_ci"].items():
        lines.append(f"- {key}: 95% CI [{fmt(bounds[0])}, {fmt(bounds[1])}]")
    selectivity = report["refusal_selectivity"]
    refused = selectivity["refused_error_or_non_numeric"]
    lines.extend([
        "", "## Refusal selectivity", "",
        f"Refused/error/non-numeric labels: n={refused['n']}, mean={fmt(refused['mean'])}, "
        f"range [{fmt(refused['min'])}, {fmt(refused['max'])}], IDs: "
        + ", ".join(refused["image_ids"]) + ".", "",
    ])
    for key, value in selectivity["refusal_by_label_quartile"].items():
        lines.append(
            f"- {key}: {value['refused_error_or_non_numeric']}/{value['submitted']} refused "
            f"({value['refusal_rate']:.1%}); IDs: {', '.join(value['refused_image_ids']) or 'none'}")
    crop = report["crop_padding_diagnostic"]
    padding = crop["padding_fraction"]
    outside_outcome = crop["outcome_sensitivity"]["crop_outside"]
    inside_outcome = crop["outcome_sensitivity"]["crop_inside"]
    score_effect = crop["score_sensitivity"]
    lines.extend([
        "", "## Production crop padding instrumentation", "",
        f"Crop diagnostics were available for {crop['instrumented_rows']}/{crop['rows']} rows; "
        f"{crop['crop_outside_rows']} instrumented crops extended outside the image "
        f"(fraction {fmt(crop['crop_outside_rate_instrumented'])}).",
        f"Padding-fraction distribution: min {fmt(padding['min'])}, q25 {fmt(padding['q25'])}, "
        f"median {fmt(padding['median'])}, q75 {fmt(padding['q75'])}, p90 {fmt(padding['p90'])}, max {fmt(padding['max'])}.",
        f"Refusal/error rate among instrumented outside crops was {fmt(outside_outcome['refusal_rate'])} "
        f"(n={outside_outcome['n']}); inside crops {fmt(inside_outcome['refusal_rate'])} (n={inside_outcome['n']}).",
        f"Among finite scores, padding-versus-score Spearman was "
        f"{fmt(score_effect['padding_vs_continuous_score_spearman'])}; outside-minus-inside mean score was "
        f"{fmt(score_effect['outside_minus_inside_mean'])}.",
        crop["interpretation"], crop["comparison_limitation"], "",
    ])
    calibration_fit = display.get("display_calibration", {}).get("linear_fit_label_from_score", {})
    lines.extend([
        "", "## Display calibration", "",
        f"The descriptive in-sample label-on-display fit has intercept {fmt(calibration_fit.get('intercept'))} "
        f"and slope {fmt(calibration_fit.get('slope'))}. This is not a locked calibration result and is not "
        "evidence of better attractiveness ordering.",
        "", "## Routing and refusals", "",
        "- Outcomes: " + ", ".join(f"{key}={value}" for key, value in sorted(report["outcomes"].items())),
        "- Instruments: " + ", ".join(f"{key}={value}" for key, value in sorted(report["instruments"].items())),
        "- Production routes: " + ", ".join(f"{key}={value}" for key, value in sorted(report["routing_decisions"].items())),
        "", "## Subgroup and route slices", "",
    ])
    for field, groups in report["subgroups"].items():
        lines.extend([f"### {field}", ""])
        provenance = report.get("subgroup_provenance", {}).get(field)
        if provenance:
            lines.extend([f"> Provenance: {provenance['definition']} Status: {provenance['status']}.", ""])
        lines.extend(["| value | n | small sample | Spearman | AUC |", "|---|---:|:---:|---:|---:|"])
        for value, metrics in groups.items():
            lines.append(
                f"| {value} | {metrics['n']} | {'yes' if metrics['small_sample'] else 'no'} | "
                f"{fmt(metrics.get('spearman'))} | {fmt(metrics.get('top_bottom_quartile_auc'))} |")
        lines.append("")
    identity = report["identity_stability"]
    lines.extend([
        "## Multi-image stability diagnostic", "",
        f"Identity field: `{identity['identity_field']}`. {identity['identity_definition']}", "",
        f"Multiple-image clusters: {identity['identities_with_multiple_images']}; clusters containing head-swap composites: "
        f"{identity['multiple_image_clusters_with_headswap_composites']}. Evidence type: {identity['evidence_type']}.", "",
        identity["limitation"], "",
        "## Limitations", "",
    ])
    limitations = list(report["dataset"].get("limitations") or [])
    if not limitations:
        if not interpretation["body_specific"]:
            limitations.append("Labels are holistic full-person judgments, not body-specific attractiveness ground truth.")
        if report["dataset"].get("training_contaminated") or not interpretation["independent_of_shipped_model"]:
            limitations.append("The dataset is training/model-selection contaminated for the shipped model and is not an independent test.")
        if identity["multiple_image_clusters_with_headswap_composites"]:
            limitations.append("Repeated body-token clusters primarily compare originals with head-swap composites, not natural repeat photographs.")
        license_status = str(report["dataset"].get("license", {}).get("status") or "")
        if license_status:
            limitations.append(f"Source-license status: {license_status}. Source photographs are not committed.")
        if label.get("limitation"):
            limitations.append(label["limitation"])
    if not limitations:
        limitations.append("No additional dataset limitation was supplied; interpret subgroup and calibration summaries conservatively.")
    for limitation in limitations:
        lines.append(f"- {limitation}")
    lines.append("")
    return "\n".join(lines)


def self_test():
    fixtures = 0
    rng = random.Random(90210)
    for _ in range(250):
        count = rng.randint(2, 40)
        scores = [rng.choice([-2, -1, 0, 0, 1, 2, 3]) for _ in range(count)]
        labels = [rng.choice([0, 0.5, 1, 2, 3, 5, 8]) for _ in range(count)]
        gaps = (0, 0.5, 1, 2.5, 10)
        fast = pairwise_accuracy(scores, labels, gaps)
        slow = pairwise_accuracy_naive(scores, labels, gaps)
        for gap in fast:
            assert fast[gap]["pairs"] == slow[gap]["pairs"]
            if fast[gap]["accuracy"] is None:
                assert slow[gap]["accuracy"] is None
            else:
                assert math.isclose(fast[gap]["accuracy"], slow[gap]["accuracy"], abs_tol=1e-15)
        fixtures += 1
    labels = [1, 2, 3, 4, 5, 6]
    original = [0, 1, 1, 4, 9, 16]
    remapped = [math.exp(value / 10) for value in original]
    before = discrimination(original, labels, (0, 1, 2))
    after = discrimination(remapped, labels, (0, 1, 2))
    for key in ("spearman", "top_bottom_quartile_auc"):
        assert before[key] == after[key]
    assert before["pairwise"] == after["pairwise"]
    return {"fenwick_vs_naive_random_fixtures": fixtures, "monotone_ordering_invariance": True}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input")
    parser.add_argument("--batch-metadata")
    parser.add_argument("--dataset-metadata")
    parser.add_argument("--evaluation-lock")
    parser.add_argument("--evaluation-phase", choices=("before", "after", "diagnostic"))
    parser.add_argument("--output-json")
    parser.add_argument("--output-md")
    parser.add_argument("--label-column")
    parser.add_argument("--cluster-key")
    parser.add_argument("--identity-key")
    parser.add_argument("--pairwise-gaps")
    parser.add_argument("--bootstrap", type=int, default=1000)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        print(json.dumps(self_test(), indent=2, sort_keys=True))
        return
    for field in ("input", "output_json"):
        if not getattr(args, field):
            parser.error(f"--{field.replace('_', '-')} is required unless --self-test is used")
    if args.bootstrap < 1:
        parser.error("--bootstrap must be positive")

    input_path = Path(args.input).resolve()
    batch_metadata_path = Path(args.batch_metadata).resolve() if args.batch_metadata else None
    dataset_metadata_path = Path(args.dataset_metadata).resolve() if args.dataset_metadata else None
    evaluation_lock_path = Path(args.evaluation_lock).resolve() if args.evaluation_lock else None
    batch_metadata = read_json(batch_metadata_path) if batch_metadata_path else None
    evaluation_lock = read_json(evaluation_lock_path) if evaluation_lock_path else None
    if evaluation_lock and not args.evaluation_phase:
        parser.error("--evaluation-phase is required with --evaluation-lock")
    if args.evaluation_phase and not evaluation_lock:
        parser.error("--evaluation-lock is required with --evaluation-phase")
    dataset_raw = read_json(dataset_metadata_path) if dataset_metadata_path else (
        batch_metadata if batch_metadata else {
            "dataset": "Unspecified dataset",
            "label": {
                "field": args.label_column or "attractiveness_mean",
                "definition": "Unspecified numeric label",
                "independent_of_shipped_model": False,
                "body_specific": False,
                "limitation": "Dataset metadata was not supplied; independence and construct validity are unknown.",
            },
        })
    dataset = dataset_payload(dataset_raw)
    label = dataset["label"]
    label_field = args.label_column or label.get("field") or "attractiveness_mean"
    if label_field != label.get("field") and dataset_metadata_path:
        raise ValueError(f"--label-column {label_field} contradicts dataset metadata field {label.get('field')}")

    dataset_hash = file_sha256(dataset_metadata_path) if dataset_metadata_path else None
    evaluation_lock_hash = file_sha256(evaluation_lock_path) if evaluation_lock_path else None
    input_hash = file_sha256(input_path)
    if evaluation_lock:
        if evaluation_lock.get("schema_version") != "body-evaluation-lock.v1":
            raise ValueError("unsupported body evaluation lock schema")
        locked_test = evaluation_lock.get("independent_test", {})
        if locked_test.get("manifest_sha256") != dataset.get("manifest_sha256"):
            raise ValueError("evaluation lock manifest hash disagrees with dataset metadata")
        if locked_test.get("rows") != dataset.get("cases"):
            raise ValueError("evaluation lock row count disagrees with dataset metadata")
        if not locked_test.get("independent_of_shipped_model"):
            raise ValueError("evaluation lock does not designate an independent test")
        if batch_metadata:
            locked_model = evaluation_lock.get("baseline", {}).get("model_sha256")
            if batch_metadata.get("pipeline_sha256", {}).get("models/body-beauty.onnx") != locked_model:
                raise ValueError("batch model hash disagrees with evaluation lock")
            if args.evaluation_phase == "before":
                locked_page = evaluation_lock.get("baseline", {}).get("body_html_sha256")
                if batch_metadata.get("pipeline_sha256", {}).get("body.html") != locked_page:
                    raise ValueError("before batch page hash disagrees with evaluation lock")
    if batch_metadata:
        if batch_metadata.get("output_csv_sha256") != input_hash:
            raise ValueError("batch metadata does not bind to input CSV")
        metadata_is_self_contained = (
            dataset_metadata_path is not None
            and batch_metadata_path is not None
            and dataset_metadata_path == batch_metadata_path
        )
        if (dataset_metadata_path and not metadata_is_self_contained
                and batch_metadata.get("dataset_metadata_sha256") != dataset_hash):
            raise ValueError("batch metadata does not bind to dataset metadata")
        if dataset.get("manifest_sha256") and batch_metadata.get("manifest_sha256") != dataset.get("manifest_sha256"):
            raise ValueError("batch metadata manifest hash disagrees with dataset metadata")

    rows = load_rows(input_path, label_field)
    numeric_rows = [row for row in rows if row["numeric_scored"]]
    public_rows = [{**row, "score": row["public_score"]} for row in numeric_rows]
    cnn_rows = [{**row, "score": row["model_score"]}
                for row in rows if finite(row.get("model_score")) and finite(row.get("label"))]
    label_values = [row["label"] for row in numeric_rows if finite(row.get("label"))]
    if args.pairwise_gaps:
        gaps = tuple(float(value) for value in args.pairwise_gaps.split(","))
    elif label.get("pairwise_gaps"):
        gaps = tuple(float(value) for value in label["pairwise_gaps"])
    else:
        span = max(label_values) - min(label_values) if label_values else 0
        gaps = (0, span * 0.05, span * 0.1, span * 0.2, span * 0.3) if span else (0,)
    gaps = tuple(dict.fromkeys(gaps))

    cluster = dataset.get("cluster", {})
    cluster_key = args.cluster_key or cluster.get("field") or "body_id"
    identity_metadata = dataset.get("identity") or dataset.get("cluster") or {}
    identity_key = args.identity_key or identity_metadata.get("field") or "body_id"
    identity_definition = identity_metadata.get(
        "definition", f"Rows sharing {identity_key} are treated as the same pictured body")
    requested_subgroups = dataset.get("subgroup_fields", ["label_sex", "variant", "demographic_code", "instrument", "framing"])
    subgroup_fields = tuple(dict.fromkeys([*requested_subgroups, "label_sex", "variant", "demographic_code",
                                           "instrument", "framing", "routing", "body_exposure",
                                           "framing_quality", "override", "gate_band", "geom_cues"]))
    subgroup_provenance = dict(dataset.get("subgroup_definitions", {}))
    if "demographic_code" in subgroup_fields and "demographic_code" not in subgroup_provenance:
        subgroup_provenance["demographic_code"] = {
            "definition": "Values are unverified codes parsed from a filename token; the dataset metadata supplies no source-backed meaning.",
            "status": "not legitimate demographic ground truth and not fairness evidence",
        }
    continuous = point_metrics(numeric_rows, gaps)
    public_display = point_metrics(public_rows, gaps)
    cnn = point_metrics(cnn_rows, gaps, score_limits=None)
    report = {
        "schema_version": "body-accuracy-evaluation.v2",
        "command": [sys.executable, str(Path(__file__).resolve()), *sys.argv[1:]],
        "script_sha256": file_sha256(Path(__file__).resolve()),
        "inputs": {
            "batch_csv": {"path": str(input_path), "sha256": input_hash},
            "batch_metadata": ({"path": str(batch_metadata_path), "sha256": file_sha256(batch_metadata_path)}
                               if batch_metadata_path else None),
            "dataset_metadata": ({"path": str(dataset_metadata_path), "sha256": dataset_hash}
                                 if dataset_metadata_path else None),
            "evaluation_lock": ({"path": str(evaluation_lock_path), "sha256": evaluation_lock_hash,
                                 "phase": args.evaluation_phase}
                                if evaluation_lock_path else None),
        },
        "dataset": dataset,
        "evaluation_phase": args.evaluation_phase or "unlocked",
        "rows": len(rows),
        "numeric_display_rows": len(numeric_rows),
        "page_scored_without_numeric_display": sum(
            row.get("outcome") == "scored" and not finite(row.get("score")) for row in rows),
        "outcomes": dict(sorted(Counter(row.get("outcome") or "unknown" for row in rows).items())),
        "instruments": dict(sorted(Counter(row["instrument"] for row in rows).items())),
        "routing_decisions": dict(sorted(Counter(row.get("routing") or "unknown" for row in rows).items())),
        "refusal_causes": dict(sorted(Counter(
            (row.get("cause") or row.get("refusal") or "unknown")
            for row in rows if not row["numeric_scored"]).items())),
        "pairwise_label_gaps": list(gaps),
        "score_precision": {
            "continuous_pipeline_score": "two-decimal batch bp from the internal percentile-to-score mapping",
            "public_half_point_display": "headline precision; explicit public_score when emitted, otherwise Math.round(bp*2)/2",
            "public_score_sources": dict(sorted(Counter(row["public_score_source"] for row in numeric_rows).items())),
        },
        "continuous_pipeline_score": continuous,
        "public_half_point_display": public_display,
        "overall_display": public_display,
        "cnn_raw": cnn,
        "discrimination": {
            "continuous_pipeline_score_locked_primary": {key: continuous.get(key) for key in (
                "n", "spearman", "pearson", "top_bottom_quartile_auc", "top_bottom_quartile_n", "pairwise")},
            "public_half_point_display": {key: public_display.get(key) for key in (
                "n", "spearman", "pearson", "top_bottom_quartile_auc", "top_bottom_quartile_n", "pairwise")},
            "cnn_raw_model_route": {key: cnn.get(key) for key in (
                "n", "spearman", "pearson", "top_bottom_quartile_auc", "top_bottom_quartile_n", "pairwise")},
        },
        "display_calibration": public_display.get("display_calibration"),
        "bootstrap": bootstrap(numeric_rows, args.bootstrap, args.seed, gaps, cluster_key),
        "public_display_bootstrap": bootstrap(public_rows, args.bootstrap, args.seed, gaps, cluster_key),
        "refusal_selectivity": refusal_selectivity(rows),
        "crop_padding_diagnostic": crop_padding_diagnostic(rows),
        "cohort_composition": cohort_composition(numeric_rows),
        "subgroups": subgroup_metrics(numeric_rows, subgroup_fields, gaps),
        "subgroup_provenance": subgroup_provenance,
        "identity_stability": identity_stability(numeric_rows, identity_key, identity_definition, identity_metadata),
        "interpretation": {
            "ground_truth": label.get("definition", label_field),
            "body_specific": bool(label.get("body_specific", False)),
            "independent_of_shipped_model": bool(label.get("independent_of_shipped_model", False)),
            "independence": label.get("independence", "Independence not specified by dataset metadata"),
            "mapping_limit": "Strictly monotone calibration leaves rank correlation, AUC, and pairwise ordering unchanged; quantization can introduce ties but adds no attractiveness intelligence.",
            "calibration_limit": "In-sample residual/calibration summaries are descriptive and do not validate a remap.",
        },
    }

    output_json = Path(args.output_json)
    output_json.parent.mkdir(parents=True, exist_ok=True)
    output_json.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")
    if args.output_md:
        output_md = Path(args.output_md)
        output_md.parent.mkdir(parents=True, exist_ok=True)
        output_md.write_text(markdown(report), encoding="utf-8", newline="\n")
    print(json.dumps({
        "rows": report["rows"],
        "numeric_display_rows": report["numeric_display_rows"],
        "spearman": continuous.get("spearman"),
        "pearson": continuous.get("pearson"),
        "auc": continuous.get("top_bottom_quartile_auc"),
        "public_half_point_spearman": public_display.get("spearman"),
        "output_json": str(output_json),
    }, indent=2))


if __name__ == "__main__":
    main()
