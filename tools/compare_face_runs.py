#!/usr/bin/env python3
"""Generate paired crop delta intervals, diagnostics, and error galleries."""

from __future__ import annotations

import argparse
import csv
import html
import itertools
import json
import math
import statistics
import sys
from collections import Counter, defaultdict
from pathlib import Path

from audit_face_accuracy import extreme_auc, pairwise_accuracy, spearman
from audit_face_gallery import median_absolute_deviation, parse_ref_raw, score_from_raw
from evaluate_face_aggregation_candidates import (
    ROOT, SEED, ROUNDS, aggregate, boot, load_inputs, qci, sha, value,
)

DEFAULT_OUTPUT = ROOT / "data" / "face-before-after-comparison.json"
DEFAULT_ERRORS = ROOT / "data" / "face-crop-error-gallery.csv"
DEFAULT_REPORT = ROOT / "md" / "face-before-after-evaluation.md"
DEFAULT_HTML = ROOT / "md" / "face-crop-error-gallery.html"
SPLIT = ROOT / "data" / "face-identity-split-v1.csv"
CANON_BEFORE = ROOT / "data" / "face-roster-pressure-test-before.csv"
CANON_AFTER = ROOT / "data" / "face-roster-pressure-test-after.csv"
CANON_META = ROOT / "data" / "face-roster-pressure-test-after.meta.json"
GALLERY_BEFORE = ROOT / "data" / "face-roster-gallery-before.csv"
GALLERY_BEFORE_META = ROOT / "data" / "face-roster-gallery-before.meta.json"
GALLERY_AFTER = ROOT / "data" / "face-roster-gallery-after.csv"
GALLERY_AFTER_META = ROOT / "data" / "face-roster-gallery-after.meta.json"
EPS = 1e-12

for stream in (sys.stdout, sys.stderr):
    try:
        stream.reconfigure(encoding="utf-8")
    except Exception:
        pass


def read_csv(path):
    with path.open(encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        return list(reader.fieldnames or []), list(reader)


def raw(row):
    text = (row.get("model_raw") or "").strip()
    if not text:
        return None
    number = float(text)
    if not math.isfinite(number):
        raise ValueError("NaN/Infinity raw.")
    return number


def number(row, key):
    text = (row.get(key) or "").strip()
    if not text:
        return None
    result = float(text)
    if not math.isfinite(result):
        raise ValueError(f"NaN/Infinity {key}.")
    return result


def validate_meta(meta_path, csv_path, rows):
    metadata = json.loads(meta_path.read_text(encoding="utf-8"))
    counts = dict(sorted(Counter(row["outcome"] for row in rows).items()))
    if metadata.get("output_csv_sha256") != sha(csv_path):
        raise ValueError(f"Output hash mismatch: {meta_path}")
    if metadata.get("cases") != len(rows) or metadata.get("outcome_counts") != counts:
        raise ValueError(f"Coverage mismatch: {meta_path}")
    if metadata.get("storage_unchanged") is not True:
        raise ValueError(f"Storage changed: {meta_path}")
    return metadata


def pair_csv(before_path, after_path, key):
    before_columns, before_rows = read_csv(before_path)
    after_columns, after_rows = read_csv(after_path)
    before = {row[key]: row for row in before_rows}
    after = {row[key]: row for row in after_rows}
    if len(before) != len(before_rows) or len(after) != len(after_rows) or set(before) != set(after):
        raise ValueError(f"Non-identical or duplicate {key} coverage.")
    pairs = []
    for identity, left in before.items():
        right = after[identity]
        if left.get("expected_looks") != right.get("expected_looks") or left.get("expected_sex") != right.get("expected_sex"):
            raise ValueError(f"Metadata drift: {identity}")
        before_raw, after_raw = raw(left), raw(right)
        if (left["outcome"] == "scored") != (before_raw is not None):
            raise ValueError(f"Before outcome mismatch: {identity}")
        if (right["outcome"] == "scored") != (after_raw is not None):
            raise ValueError(f"After outcome mismatch: {identity}")
        pairs.append({
            "key": identity, "before_row": left, "after_row": right,
            "before_raw": before_raw, "after_raw": after_raw,
        })
    return before_columns, after_columns, before_rows, after_rows, pairs


def join_phase(before_items, after_items, method):
    before = {item["identity_id"]: item for item in before_items}
    after = {item["identity_id"]: item for item in after_items}
    output = []
    for identity, left in before.items():
        right = after[identity]
        output.append({
            "identity_id": identity,
            "split": left["split"],
            "group": left["group"],
            "label": left["label"],
            "ethnicity": left["ethnicity"],
            "before_raw": left["predictions"][method],
            "after_raw": right["predictions"][method],
            "before_gallery_raws": left["gallery_raws"],
            "after_gallery_raws": right["gallery_raws"],
        })
    return output


def metric_rows(items, phase):
    return [
        {"id": item["identity_id"], "group": item["group"],
         "label": item["label"], "raw": item[f"{phase}_raw"]}
        for item in items if item[f"{phase}_raw"] is not None
    ]


def metric_value(items, phase, metric):
    return value(metric_rows(items, phase), metric)


def paired_metrics(items, salt):
    common = [item for item in items
              if item["before_raw"] is not None and item["after_raw"] is not None]
    output = {"common_scored_identities": len(common), "metrics": {}}
    for metric in ("auc", "pairwise", "rho"):
        before = metric_value(common, "before", metric)
        after = metric_value(common, "after", metric)
        before_samples = boot(common, lambda sample: metric_value(sample, "before", metric),
                              f"{salt}:{metric}:before")
        after_samples = boot(common, lambda sample: metric_value(sample, "after", metric),
                             f"{salt}:{metric}:after")
        delta_samples = boot(
            common,
            lambda sample: metric_value(sample, "after", metric)
            - metric_value(sample, "before", metric),
            f"{salt}:{metric}:delta",
        )
        before_detail = {"value": before, "bootstrap_95_ci": qci(before_samples)}
        after_detail = {"value": after, "bootstrap_95_ci": qci(after_samples)}
        if metric == "auc":
            _, before_low, before_high = extreme_auc(metric_rows(common, "before"), within_group=True)
            _, after_low, after_high = extreme_auc(metric_rows(common, "after"), within_group=True)
            before_detail.update({"low_identities": before_low, "high_identities": before_high})
            after_detail.update({"low_identities": after_low, "high_identities": after_high})
        if metric == "pairwise":
            _, before_pairs = pairwise_accuracy(metric_rows(common, "before"), 1.0, "group")
            _, after_pairs = pairwise_accuracy(metric_rows(common, "after"), 1.0, "group")
            before_detail["eligible_pairs"] = before_pairs
            after_detail["eligible_pairs"] = after_pairs
        output["metrics"][metric] = {
            "before": before_detail,
            "after": after_detail,
            "after_minus_before": {"value": after - before, "bootstrap_95_ci": qci(delta_samples)},
        }
    return output


def refusal(items, salt):
    def rate(sample, phase):
        return sum(item[f"{phase}_raw"] is None for item in sample) / len(sample)
    before, after = rate(items, "before"), rate(items, "after")
    return {
        "before": {"value": before, "bootstrap_95_ci": qci(boot(items, lambda s: rate(s, "before"), f"{salt}:before"))},
        "after": {"value": after, "bootstrap_95_ci": qci(boot(items, lambda s: rate(s, "after"), f"{salt}:after"))},
        "after_minus_before": {
            "value": after - before,
            "bootstrap_95_ci": qci(boot(items, lambda s: rate(s, "after") - rate(s, "before"), f"{salt}:delta")),
        },
    }


def stability(items):
    eligible = []
    for item in items:
        before, after = item["before_gallery_raws"], item["after_gallery_raws"]
        if len(before) < 2 or len(after) < 2:
            continue
        eligible.append({
            "before": {
                "sd": statistics.stdev(before),
                "range": max(before) - min(before),
                "mad": median_absolute_deviation(before),
            },
            "after": {
                "sd": statistics.stdev(after),
                "range": max(after) - min(after),
                "mad": median_absolute_deviation(after),
            },
        })
    output = {"common_eligible_identities": len(eligible), "metrics": {}}
    for metric in ("sd", "range", "mad"):
        before = statistics.median(item["before"][metric] for item in eligible)
        after = statistics.median(item["after"][metric] for item in eligible)
        output["metrics"][metric] = {
            "before": {
                "value": before,
                "bootstrap_95_ci": qci(boot(
                    eligible, lambda s: statistics.median(item["before"][metric] for item in s),
                    f"stability:{metric}:before",
                )),
            },
            "after": {
                "value": after,
                "bootstrap_95_ci": qci(boot(
                    eligible, lambda s: statistics.median(item["after"][metric] for item in s),
                    f"stability:{metric}:after",
                )),
            },
            "after_minus_before": {
                "value": after - before,
                "bootstrap_95_ci": qci(boot(
                    eligible,
                    lambda s: statistics.median(item["after"][metric] for item in s)
                    - statistics.median(item["before"][metric] for item in s),
                    f"stability:{metric}:delta",
                )),
            },
            "relative_change": after / before - 1,
        }
    return output


def transitions(pairs):
    return dict(sorted(Counter(
        f"{pair['before_row']['outcome']}->{pair['after_row']['outcome']}"
        for pair in pairs
    ).items()))


def pair_transitions(items):
    common = [item for item in items if item["before_raw"] is not None and item["after_raw"] is not None]
    counts = Counter()
    for left, right in itertools.combinations(common, 2):
        if left["group"] != right["group"] or abs(left["label"] - right["label"]) < 1:
            continue
        label_delta = left["label"] - right["label"]
        def correct(phase):
            prediction = left[f"{phase}_raw"] - right[f"{phase}_raw"]
            return .5 if prediction == 0 else float((prediction > 0) == (label_delta > 0))
        before, after = correct("before"), correct("after")
        counts["improved" if after > before else "regressed" if after < before else "unchanged"] += 1
    counts["eligible_pairs"] = sum(counts.values())
    return dict(counts)


CROP_REQUIRED = [
    "source_width", "source_height", "analysis_width", "analysis_height",
    "crop_requested_fits", "crop_source_contained", "crop_side_px",
    "crop_shift_x_px", "crop_shift_y_px", "crop_pad_left_px", "crop_pad_top_px",
    "crop_pad_right_px", "crop_pad_bottom_px", "crop_padding_area_pct",
    "crop_face_visible_pct", "capture_source", "capture_trigger", "guide_passed",
    "alignment_code", "camera_frame_width", "camera_frame_height", "guide_face_scale",
    "guide_center_offset_display", "guide_center_offset_raw", "guide_eye_line_offset",
    "guide_roll_deg", "guide_yaw_deg", "guide_pose_skew",
]


def crop_summary(columns, after_rows, dataset):
    missing = [column for column in CROP_REQUIRED if column not in columns]
    if missing:
        raise ValueError(f"{dataset} missing crop columns: {missing}")
    scored = [row for row in after_rows if row["outcome"] == "scored"]
    parsed = []
    for row in scored:
        if not row["source_width"]:
            raise ValueError(f"{dataset} scored row lacks diagnostics.")
        fits = row["crop_requested_fits"].lower() == "true"
        contained = row["crop_source_contained"].lower() == "true"
        if row["crop_requested_fits"].lower() not in {"true", "false"}:
            raise ValueError("Bad crop_requested_fits.")
        if row["crop_source_contained"].lower() not in {"true", "false"}:
            raise ValueError("Bad crop_source_contained.")
        parsed.append({
            "id": row.get("slug") or row.get("relative_path"),
            "fits": fits, "contained": contained,
            "shift_x": number(row, "crop_shift_x_px"),
            "shift_y": number(row, "crop_shift_y_px"),
            "padding": number(row, "crop_padding_area_pct"),
            "visible": number(row, "crop_face_visible_pct"),
        })
    violations = [item["id"] for item in parsed if item["fits"] and not item["contained"]]
    if violations:
        raise ValueError(f"{dataset} fit-capable containment violation: {violations[:5]}")
    unavoidable = [item for item in parsed if not item["fits"]]
    padding = [item["padding"] for item in unavoidable]
    return {
        "required_columns": CROP_REQUIRED,
        "scored_rows": len(scored),
        "diagnostic_complete_rows": len(parsed),
        "requested_crop_fits": sum(item["fits"] for item in parsed),
        "requested_crop_does_not_fit": len(unavoidable),
        "fit_capable_containment_violations": len(violations),
        "source_contained_rows": sum(item["contained"] for item in parsed),
        "shifted_rows": sum(abs(item["shift_x"]) > EPS or abs(item["shift_y"]) > EPS for item in parsed),
        "padded_rows": sum(item["padding"] > EPS for item in parsed),
        "partially_visible_face_rows": sum(item["visible"] < 100 - EPS for item in parsed),
        "unavoidable_padding_area_pct": {
            "median": statistics.median(padding) if padding else 0,
            "maximum": max(padding, default=0),
        },
        "face_visible_pct": {
            "median": statistics.median(item["visible"] for item in parsed),
            "minimum": min(item["visible"] for item in parsed),
        },
        "maximum_absolute_shift_px": {
            "x": max(abs(item["shift_x"]) for item in parsed),
            "y": max(abs(item["shift_y"]) for item in parsed),
        },
    }


def midranks(items, key):
    output = {}
    grouped = defaultdict(list)
    for item in items:
        grouped[item["group"]].append(item)
    for group_items in grouped.values():
        ordered = sorted(group_items, key=lambda item: item[key])
        start = 0
        while start < len(ordered):
            end = start + 1
            while end < len(ordered) and ordered[end][key] == ordered[start][key]:
                end += 1
            rank = ((start + end - 1) / 2) / (len(ordered) - 1)
            for item in ordered[start:end]:
                output[item["identity_id"]] = rank
            start = end
    return output


ERROR_COLUMNS = [
    "dataset", "identity_id", "split", "expected_sex", "editorial_ethnicity",
    "expected_looks", "image_path", "before_raw", "after_raw", "raw_delta",
    "before_display", "after_display", "before_abs_display_error",
    "after_abs_display_error", "display_error_improvement",
    "before_rank_error", "after_rank_error", "rank_error_improvement",
    "representative_image_before_raw", "representative_image_after_raw",
    "crop_requested_fits", "crop_source_contained", "crop_side_px",
    "crop_shift_x_px", "crop_shift_y_px", "crop_pad_left_px", "crop_pad_top_px",
    "crop_pad_right_px", "crop_pad_bottom_px", "crop_padding_area_pct",
    "crop_face_visible_pct", "reliability",
]


def build_error_rows(items, dataset, ref_raw, canonical_after, gallery_pairs):
    common = [item.copy() for item in items
              if item["before_raw"] is not None and item["after_raw"] is not None]
    labels = midranks(common, "label")
    before_ranks = midranks(common, "before_raw")
    after_ranks = midranks(common, "after_raw")
    gallery_grouped = defaultdict(list)
    for pair in gallery_pairs:
        gallery_grouped[pair["after_row"]["identity_id"]].append(pair)
    output = []
    for item in common:
        identity = item["identity_id"]
        before_display = score_from_raw(item["before_raw"], ref_raw)
        after_display = score_from_raw(item["after_raw"], ref_raw)
        before_rank_error = abs(before_ranks[identity] - labels[identity])
        after_rank_error = abs(after_ranks[identity] - labels[identity])
        if dataset == "canonical":
            after_row = canonical_after[identity]
            image_path = f"images/roster/{identity}.jpg"
            representative_before = item["before_raw"]
            representative_after = item["after_raw"]
        else:
            eligible = [pair for pair in gallery_grouped[identity]
                        if pair["before_raw"] is not None and pair["after_raw"] is not None]
            representative = max(
                eligible, key=lambda pair: abs(pair["after_raw"] - pair["before_raw"])
            )
            after_row = representative["after_row"]
            image_path = after_row["relative_path"]
            representative_before = representative["before_raw"]
            representative_after = representative["after_raw"]
        row = {
            "dataset": dataset,
            "identity_id": identity,
            "split": item["split"],
            "expected_sex": item["group"],
            "editorial_ethnicity": item["ethnicity"],
            "expected_looks": item["label"],
            "image_path": image_path,
            "before_raw": item["before_raw"],
            "after_raw": item["after_raw"],
            "raw_delta": item["after_raw"] - item["before_raw"],
            "before_display": before_display,
            "after_display": after_display,
            "before_abs_display_error": abs(before_display - item["label"]),
            "after_abs_display_error": abs(after_display - item["label"]),
            "display_error_improvement": abs(before_display - item["label"]) - abs(after_display - item["label"]),
            "before_rank_error": before_rank_error,
            "after_rank_error": after_rank_error,
            "rank_error_improvement": before_rank_error - after_rank_error,
            "representative_image_before_raw": representative_before,
            "representative_image_after_raw": representative_after,
            "reliability": after_row.get("reliability", ""),
        }
        for key in ERROR_COLUMNS:
            if key.startswith("crop_"):
                row[key] = after_row.get(key, "")
        output.append(row)
    return output


def image_refusal(gallery_pairs):
    grouped = defaultdict(list)
    for pair in gallery_pairs:
        grouped[pair["after_row"]["identity_id"]].append(pair)
    clusters = list(grouped.values())
    def rate(sample, phase):
        total = sum(len(cluster) for cluster in sample)
        refused = sum(pair[f"{phase}_raw"] is None for cluster in sample for pair in cluster)
        return refused / total
    before, after = rate(clusters, "before"), rate(clusters, "after")
    return {
        "before": {
            "value": before,
            "bootstrap_95_ci": qci(boot(clusters, lambda s: rate(s, "before"), "image-refusal:before")),
        },
        "after": {
            "value": after,
            "bootstrap_95_ci": qci(boot(clusters, lambda s: rate(s, "after"), "image-refusal:after")),
        },
        "after_minus_before": {
            "value": after - before,
            "bootstrap_95_ci": qci(boot(
                clusters, lambda s: rate(s, "after") - rate(s, "before"), "image-refusal:delta"
            )),
        },
    }


def supportable_ethnicity(items):
    grouped = defaultdict(list)
    for item in items:
        if item["before_raw"] is not None and item["after_raw"] is not None:
            grouped[item["ethnicity"]].append(item)
    output = {}
    for group, group_items in sorted(grouped.items()):
        if len(group_items) < 20:
            continue
        _, low, high = extreme_auc(metric_rows(group_items, "before"), within_group=True)
        if low and high:
            output[group] = group_items
    return output


def csv_text(rows):
    import io
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=ERROR_COLUMNS, extrasaction="ignore",
                            lineterminator="\n")
    writer.writeheader()
    for row in rows:
        writer.writerow(row)
    return buffer.getvalue()


def fmt(value, digits=3):
    return "n/a" if value is None else f"{value:.{digits}f}"


def metric_ci(metric, digits=3):
    interval = metric["bootstrap_95_ci"]
    return f"{fmt(metric['value'], digits)} [{fmt(interval[0], digits)}, {fmt(interval[1], digits)}]"


def cards(rows, title):
    parts = []
    for row in rows:
        src = "../" + row["image_path"].replace("\\", "/")
        crop = (
            f"shift ({row.get('crop_shift_x_px') or '0'}, {row.get('crop_shift_y_px') or '0'}) px; "
            f"padding {row.get('crop_padding_area_pct') or '0'}%; "
            f"face visible {row.get('crop_face_visible_pct') or 'n/a'}%"
        )
        parts.append(
            "<figure class=\"card\">"
            f"<img src=\"{html.escape(src, quote=True)}\" alt=\"Portrait of {html.escape(row['identity_id'])}\" loading=\"lazy\">"
            "<figcaption>"
            f"<strong>{html.escape(row['identity_id'])}</strong>"
            f"<span>{html.escape(row['dataset'])} / expected-{html.escape(row['expected_sex'])} / editorial label {fmt(row['expected_looks'], 1)}</span>"
            f"<span>aggregate raw {fmt(row['before_raw'])} to {fmt(row['after_raw'])}</span>"
            f"<span>rank error {fmt(row['before_rank_error'])} to {fmt(row['after_rank_error'])} "
            f"(improvement {fmt(row['rank_error_improvement'])})</span>"
            f"<span>display |error| {fmt(row['before_abs_display_error'], 2)} to "
            f"{fmt(row['after_abs_display_error'], 2)} (descriptive)</span>"
            f"<span>{html.escape(crop)}</span>"
            "</figcaption></figure>"
        )
    return f"<section><h2>{html.escape(title)}</h2><div class=\"grid\">{''.join(parts) or '<p>No examples.</p>'}</div></section>"


def gallery_html(rows):
    sections = []
    for dataset, label in (("canonical", "Canonical portraits"),
                           ("gallery_identity", "Gallery identities")):
        subset = [row for row in rows if row["dataset"] == dataset]
        improvements = sorted(
            [row for row in subset if row["rank_error_improvement"] > EPS],
            key=lambda row: row["rank_error_improvement"], reverse=True,
        )[:10]
        regressions = sorted(
            [row for row in subset if row["rank_error_improvement"] < -EPS],
            key=lambda row: row["rank_error_improvement"],
        )[:10]
        sections.append(cards(improvements, f"{label}: largest rank-error improvements"))
        sections.append(cards(regressions, f"{label}: largest rank-error regressions"))
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Face crop before/after error gallery</title><style>
body{{margin:0;background:#101318;color:#edf1f7;font:16px/1.45 system-ui,sans-serif}}main{{max-width:1500px;margin:auto;padding:32px}}
p{{max-width:92ch;color:#bdc7d6}}section{{margin:40px 0}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}}
.card{{margin:0;background:#1a2029;border:1px solid #344052;border-radius:12px;overflow:hidden}}.card img{{width:100%;height:260px;object-fit:cover;background:#252c36}}
figcaption{{display:grid;gap:5px;padding:12px}}figcaption span{{font-size:.82rem;color:#bdc7d6}}
</style></head><body><main><h1>Face crop before/after error gallery</h1>
<p>Sorted by change in within-expected-sex rank-percentile error against independent Matchmaker editorial labels. Positive means closer and negative means farther. This is a product pressure test, not objective beauty or universal consensus. Display error is descriptive only.</p>
{''.join(sections)}</main></body></html>"""


def report(payload):
    lines = [
        "# Face Calculator paired before/after evaluation",
        "",
        "Both after batches used identical scoring page bytes (SHA-256 "
        f"{payload['runtime_provenance']['evaluated_face_html_sha256']}). "
        "The final page adds post-snapshot UI copy and camera lifecycle, reliability, restore, and accessibility "
        "safeguards; those non-scoring changes are excluded from these metrics.",
        "",
        "Matchmaker labels are independent editorial judgments, not scientific ground truth, "
        "objective beauty, or universal human consensus. Paired intervals use "
        f"{ROUNDS} identity bootstrap resamples (seed {SEED}).",
        "",
    ]
    for name, title in (("canonical", "Canonical portraits"),
                        ("gallery", "Identity-aggregated gallery")):
        block = payload[name]["paired_common"]
        lines += [
            f"## {title}", "",
            f"Common scored identities: {block['common_scored_identities']}; "
            f"outcome transitions: {payload[name]['outcome_transitions']}.", "",
            "| Metric | Before (95% CI) | After (95% CI) | Paired delta (95% CI) |",
            "| --- | ---: | ---: | ---: |",
        ]
        for key, label in (("auc", "Within-sex top/bottom AUC"),
                           ("pairwise", "Within-sex at-least-1-point pairwise"),
                           ("rho", "Spearman rho")):
            metric = block["metrics"][key]
            lines.append(
                f"| {label} | {metric_ci(metric['before'])} | {metric_ci(metric['after'])} | "
                f"{metric_ci(metric['after_minus_before'])} |"
            )
        refusal_metric = payload[name]["refusal"]
        lines += [
            "",
            f"- Identity refusal: {metric_ci(refusal_metric['before'])} to "
            f"{metric_ci(refusal_metric['after'])}; delta {metric_ci(refusal_metric['after_minus_before'])}.",
            f"- Pairwise transitions: {payload[name]['pairwise_transitions']}.", "",
        ]
    image_rate = payload["gallery"]["image_refusal"]
    lines += [
        f"Gallery image refusal remained {metric_ci(image_rate['before'])} to "
        f"{metric_ci(image_rate['after'])}; delta {metric_ci(image_rate['after_minus_before'])}.",
        "",
        "## Cross-photo stability", "",
        "| Identity-median raw statistic | Before (95% CI) | After (95% CI) | Paired delta (95% CI) | Relative change |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for key, label in (("sd", "SD"), ("range", "Range"), ("mad", "MAD")):
        metric = payload["gallery"]["stability"]["metrics"][key]
        lines.append(
            f"| {label} | {metric_ci(metric['before'])} | {metric_ci(metric['after'])} | "
            f"{metric_ci(metric['after_minus_before'])} | {fmt(metric['relative_change'] * 100, 1)}% |"
        )
    lines += ["", "## Crop containment and padding", ""]
    for dataset in ("canonical", "gallery"):
        crop = payload["crop_diagnostics"][dataset]
        lines += [
            f"### {dataset.capitalize()}", "",
            f"- Diagnostics complete: {crop['diagnostic_complete_rows']}/{crop['scored_rows']} scored rows.",
            f"- Requested crop fit in {crop['requested_crop_fits']} rows; unavoidable no-fit in {crop['requested_crop_does_not_fit']}.",
            f"- Fit-capable containment violations: {crop['fit_capable_containment_violations']}.",
            f"- Shifted {crop['shifted_rows']}; padded {crop['padded_rows']}; partially visible face {crop['partially_visible_face_rows']}.",
            f"- Unavoidable padding median {fmt(crop['unavoidable_padding_area_pct']['median'], 2)}%, "
            f"maximum {fmt(crop['unavoidable_padding_area_pct']['maximum'], 2)}%; "
            f"minimum face visible {fmt(crop['face_visible_pct']['minimum'], 2)}%.", "",
        ]
    lines += [
        "## Permitted subgroup deltas", "",
        "Expected-sex labels are reported separately. Other groups use only matchmaker.html's explicit "
        "editorial ethnicity field, require at least 20 common scored identities plus both primary classes, "
        "and are never inferred from images.", "",
        "| Group | n | AUC before to after | Pairwise before to after | rho before to after |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    for namespace, groups in (
        ("expected sex", payload["gallery"]["expected_sex_subgroups"]),
        ("explicit editorial ethnicity", payload["gallery"]["editorial_ethnicity_subgroups"]),
    ):
        if not groups and namespace.startswith("explicit"):
            lines.append("| No group met the threshold | - | - | - | - |")
        for group, block in groups.items():
            metrics = block["metrics"]
            lines.append(
                f"| {namespace}: {group} | {block['common_scored_identities']} | "
                f"{fmt(metrics['auc']['before']['value'])} to {fmt(metrics['auc']['after']['value'])} | "
                f"{fmt(metrics['pairwise']['before']['value'])} to {fmt(metrics['pairwise']['after']['value'])} | "
                f"{fmt(metrics['rho']['before']['value'])} to {fmt(metrics['rho']['after']['value'])} |"
            )
    lines += [
        "", "## Decision", "",
        "The crop repair fixed containment and exposes its diagnostics, but did not materially improve "
        "real-world ordering. Canonical AUC was exactly unchanged; all paired discrimination deltas were tiny "
        "and their confidence intervals included zero. Stability moved slightly worse but stayed inside the "
        "10% guardrail. Retain the current model and arithmetic raw averaging, and make no stronger accuracy claim.",
        "",
        "The validation-locked gallery-mean aggregation finalist also failed holdout: no primary gain reached "
        "0.03, AUC moved slightly backward, and expected-female holdout AUC regressed from 0.88 to 0.76.",
        "",
        "Artifacts: data/face-before-after-comparison.json, data/face-crop-error-gallery.csv, "
        "md/face-crop-error-gallery.html, data/face-aggregation-validation-lock-v1.json, "
        "data/face-aggregation-holdout-v1.json, data/face-gallery-stability-before.json, "
        "data/face-gallery-stability-after.json, and md/face-evaluation-preregistration.md.",
        "",
        "A monotone display remap cannot improve AUC, pairwise ordering, or Spearman rho.",
        "",
    ]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--errors", type=Path, default=DEFAULT_ERRORS)
    parser.add_argument("--report", type=Path, default=DEFAULT_REPORT)
    parser.add_argument("--html", type=Path, default=DEFAULT_HTML)
    args = parser.parse_args()
    before_items = load_inputs(SPLIT, CANON_BEFORE, GALLERY_BEFORE)
    after_items = load_inputs(SPLIT, CANON_AFTER, GALLERY_AFTER)
    canonical = join_phase(before_items, after_items, "canonical_single")
    gallery = join_phase(before_items, after_items, "gallery_mean")

    _, canonical_columns, _, canonical_after_rows, canonical_pairs = pair_csv(
        CANON_BEFORE, CANON_AFTER, "slug"
    )
    _, gallery_columns, gallery_before_rows, gallery_after_rows, gallery_pairs = pair_csv(
        GALLERY_BEFORE, GALLERY_AFTER, "relative_path"
    )
    if len(canonical_pairs) != 199 or len(gallery_pairs) != 825:
        raise ValueError("Exact coverage must be 199 canonical and 825 gallery images.")
    canonical_meta = validate_meta(CANON_META, CANON_AFTER, canonical_after_rows)
    gallery_before_meta = validate_meta(GALLERY_BEFORE_META, GALLERY_BEFORE, gallery_before_rows)
    gallery_after_meta = validate_meta(GALLERY_AFTER_META, GALLERY_AFTER, gallery_after_rows)
    canonical_pipeline = canonical_meta["pipeline_sha256"]
    gallery_pipeline = gallery_after_meta["pipeline_sha256"]
    if canonical_pipeline["face.html"] != gallery_pipeline["face.html"]:
        raise ValueError("After scoring page hashes differ.")
    if canonical_pipeline["models/face-beauty.onnx"] != gallery_pipeline["models/face-beauty.onnx"]:
        raise ValueError("After beauty-model hashes differ.")

    canonical_after_by_id = {row["slug"]: row for row in canonical_after_rows}
    ref_raw = parse_ref_raw(ROOT / "face.html")
    error_rows = (
        build_error_rows(canonical, "canonical", ref_raw, canonical_after_by_id, gallery_pairs)
        + build_error_rows(gallery, "gallery_identity", ref_raw, canonical_after_by_id, gallery_pairs)
    )
    for row in error_rows:
        if not (ROOT / row["image_path"]).is_file():
            raise ValueError(f"Missing error-gallery image: {row['image_path']}")

    sex_groups = {
        group: [item for item in gallery if item["group"] == group]
        for group in sorted({item["group"] for item in gallery})
    }
    ethnicity_groups = supportable_ethnicity(gallery)
    payload = {
        "schema_version": "face-before-after-comparison.v1",
        "generated_date": "2026-08-18",
        "bootstrap": {"rounds": ROUNDS, "seed": SEED, "unit": "identity cluster"},
        "runtime_provenance": {
            "evaluated_face_html_sha256": canonical_pipeline["face.html"],
            "canonical_and_gallery_after_identical_scoring_page": True,
            "gallery_before_face_html_sha256": gallery_before_meta["pipeline_sha256"]["face.html"],
            "face_beauty_model_sha256": canonical_pipeline["models/face-beauty.onnx"],
            "face_sex_model_sha256": canonical_pipeline["models/face-sex.onnx"],
            "canonical_storage_unchanged": canonical_meta["storage_unchanged"],
            "gallery_storage_unchanged": gallery_after_meta["storage_unchanged"],
            "post_snapshot_non_scoring_drift_excluded": canonical_meta.get("provenance_note"),
        },
        "inputs": {
            name: {"path": path.relative_to(ROOT).as_posix(), "sha256": sha(path)}
            for name, path in {
                "canonical_before": CANON_BEFORE, "canonical_after": CANON_AFTER,
                "canonical_after_metadata": CANON_META,
                "gallery_before": GALLERY_BEFORE, "gallery_before_metadata": GALLERY_BEFORE_META,
                "gallery_after": GALLERY_AFTER, "gallery_after_metadata": GALLERY_AFTER_META,
                "identity_split": SPLIT,
            }.items()
        },
        "interpretation": {
            "labels": "Independent Matchmaker editorial judgments, not scientific ground truth, objective beauty, or universal consensus.",
            "display_error": "Descriptive only; the model percentile scale and editorial 1-10 scale use different conventions.",
            "display_remap": "A monotone display remap cannot change AUC, pairwise ordering, or Spearman rho.",
        },
        "canonical": {
            "submitted": len(canonical),
            "paired_common": paired_metrics(canonical, "canonical"),
            "refusal": refusal(canonical, "canonical:refusal"),
            "outcome_transitions": transitions(canonical_pairs),
            "pairwise_transitions": pair_transitions(canonical),
        },
        "gallery": {
            "identities": len(gallery), "images": len(gallery_pairs),
            "paired_common": paired_metrics(gallery, "gallery"),
            "refusal": refusal(gallery, "gallery:identity-refusal"),
            "image_refusal": image_refusal(gallery_pairs),
            "stability": stability(gallery),
            "outcome_transitions": transitions(gallery_pairs),
            "pairwise_transitions": pair_transitions(gallery),
            "expected_sex_subgroups": {
                group: paired_metrics(items, f"gallery:sex:{group}")
                for group, items in sex_groups.items()
            },
            "editorial_ethnicity_subgroups": {
                group: paired_metrics(items, f"gallery:ethnicity:{group}")
                for group, items in ethnicity_groups.items()
            },
            "demographic_provenance": {
                "source": "matchmaker.html explicit editorial ethnicity field",
                "image_inference_used": False,
                "minimum_common_scored_identities": 20,
                "no_eligible_groups": not bool(ethnicity_groups),
            },
        },
        "crop_diagnostics": {
            "canonical": crop_summary(canonical_columns, canonical_after_rows, "canonical"),
            "gallery": crop_summary(gallery_columns, gallery_after_rows, "gallery"),
        },
        "error_gallery": {
            "unit": "identity",
            "sorting_metric": "before minus after absolute within-expected-sex rank-percentile error",
            "machine_readable_path": args.errors.resolve().relative_to(ROOT).as_posix(),
            "html_path": args.html.resolve().relative_to(ROOT).as_posix(),
            "canonical_rows": sum(row["dataset"] == "canonical" for row in error_rows),
            "gallery_identity_rows": sum(row["dataset"] == "gallery_identity" for row in error_rows),
        },
    }
    args.output.resolve().write_text(
        json.dumps(payload, indent=2, sort_keys=True, allow_nan=False) + "\n", encoding="utf-8"
    )
    ordered = sorted(error_rows, key=lambda row: (
        row["dataset"], -row["rank_error_improvement"], row["identity_id"]
    ))
    args.errors.resolve().write_text(csv_text(ordered), encoding="utf-8")
    args.html.resolve().write_text(gallery_html(error_rows), encoding="utf-8")
    args.report.resolve().write_text(report(payload) + "\n", encoding="utf-8")
    for dataset in ("canonical", "gallery"):
        metrics = payload[dataset]["paired_common"]["metrics"]
        print(
            f"[{dataset}] AUC {fmt(metrics['auc']['before']['value'])} to {fmt(metrics['auc']['after']['value'])}; "
            f"pair {fmt(metrics['pairwise']['before']['value'])} to {fmt(metrics['pairwise']['after']['value'])}; "
            f"rho {fmt(metrics['rho']['before']['value'])} to {fmt(metrics['rho']['after']['value'])}"
        )
    print(f"[write] {args.output.resolve().relative_to(ROOT)}")
    print(f"[write] {args.errors.resolve().relative_to(ROOT)}")
    print(f"[write] {args.report.resolve().relative_to(ROOT)}")
    print(f"[write] {args.html.resolve().relative_to(ROOT)}")


if __name__ == "__main__":
    main()
