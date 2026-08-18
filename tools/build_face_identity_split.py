#!/usr/bin/env python3
"""Freeze the Face Calculator evaluation split at the identity level.

The split is deliberately created from the preserved canonical roster artifact before candidate tuning.
Every image for an identity inherits the identity's split; image-level randomization is forbidden.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "data" / "face-roster-pressure-test-before.csv"
ROSTER_HTML = ROOT / "matchmaker.html"
DEFAULT_CSV = ROOT / "data" / "face-identity-split-v1.csv"
DEFAULT_JSON = ROOT / "data" / "face-identity-split-v1.json"

SEED = "face-identity-split-v1:2026-08-18"
RATIOS = {"train": 0.60, "validation": 0.20, "holdout": 0.20}
SPLITS = tuple(RATIOS)
ROSTER_ROW_RE = re.compile(
    r"\{\s*slug:'(?P<slug>[^']+)'[^\n]*?\bg:'(?P<sex>[fm])'"
    r"[^\n]*?\blooks:(?P<looks>[0-9.]+)[^\n]*?\bethnicity:'(?P<ethnicity>[^']+)'"
)
GALLERY_PATH_RE = re.compile(r"images/roster/(?P<slug>[^/'\"]+)/[^'\"]+\.jpg", re.I)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


def stable_key(slug: str) -> str:
    return hashlib.sha256(f"{SEED}:{slug}".encode()).hexdigest()


def label_band(value: float) -> str:
    if value < 5.5:
        return "low_lt_5_5"
    if value < 8.0:
        return "middle_5_5_to_lt_8"
    return "high_ge_8"


def parse_roster_metadata(source: str) -> dict[str, dict]:
    start = source.find("const ROSTER = [")
    end = source.find("\n  ];", start)
    if start < 0 or end < 0:
        raise ValueError("Could not locate Matchmaker ROSTER.")
    rows: dict[str, dict] = {}
    for match in ROSTER_ROW_RE.finditer(source[start:end]):
        item = {
            "identity_id": match.group("slug"),
            "expected_sex": match.group("sex"),
            "expected_looks": float(match.group("looks")),
            "editorial_ethnicity": match.group("ethnicity"),
        }
        if item["identity_id"] in rows:
            raise ValueError(f"Duplicate Matchmaker identity: {item['identity_id']}")
        rows[item["identity_id"]] = item
    if not rows:
        raise ValueError("No Matchmaker identities parsed.")
    return rows


def parse_gallery_paths(source: str) -> dict[str, list[str]]:
    start = source.find("const GALLERY_IMG = {")
    end = source.find(";\n", start)
    if start < 0 or end < 0:
        raise ValueError("Could not locate Matchmaker GALLERY_IMG.")
    grouped: dict[str, list[str]] = defaultdict(list)
    for match in GALLERY_PATH_RE.finditer(source[start:end]):
        relative = match.group(0).replace("\\", "/")
        slug = match.group("slug")
        if relative not in grouped[slug]:
            grouped[slug].append(relative)
    return dict(grouped)


def load_preserved_identities(path: Path, metadata: dict[str, dict], galleries: dict[str, list[str]]) -> list[dict]:
    identities = []
    seen = set()
    with path.open(encoding="utf-8", newline="") as file:
        for row in csv.DictReader(file):
            slug = row["slug"]
            if slug in seen:
                raise ValueError(f"Duplicate preserved identity: {slug}")
            seen.add(slug)
            meta = metadata.get(slug)
            if not meta:
                raise ValueError(f"Preserved identity missing from Matchmaker metadata: {slug}")
            expected_sex = row["expected_sex"]
            expected_looks = float(row["expected_looks"])
            if expected_sex != meta["expected_sex"] or not math.isclose(
                expected_looks, meta["expected_looks"], abs_tol=1e-9
            ):
                raise ValueError(f"Preserved label drift for {slug}")
            paths = galleries.get(slug, [])
            missing = [relative for relative in paths if not (ROOT / relative).is_file()]
            if missing:
                raise ValueError(f"Production gallery paths missing for {slug}: {missing}")
            identities.append({
                **meta,
                "label_band": label_band(expected_looks),
                "gallery_image_count": len(paths),
            })
    if not identities:
        raise ValueError("No preserved identities loaded.")
    return identities


def exact_split_targets(n: int) -> dict[str, int]:
    floors = {name: math.floor(n * ratio) for name, ratio in RATIOS.items()}
    left = n - sum(floors.values())
    order = sorted(SPLITS, key=lambda name: (-(n * RATIOS[name] - floors[name]), SPLITS.index(name)))
    for name in order[:left]:
        floors[name] += 1
    return floors


def allocation_cost(n: int, allocation: tuple[int, int, int]) -> float:
    return sum(
        ((count - n * RATIOS[name]) ** 2) / (n * RATIOS[name] + 1.0)
        for name, count in zip(SPLITS, allocation)
    )


def optimal_stratum_allocations(strata: dict[tuple[str, str], list[dict]], targets: dict[str, int]):
    """Integer dynamic program: exact global sizes, minimum squared stratum-ratio deviation."""
    keys = sorted(strata)
    # state (train, validation) -> (cost, allocations_so_far)
    states: dict[tuple[int, int], tuple[float, list[tuple[int, int, int]]]] = {(0, 0): (0.0, [])}
    processed = 0
    for key in keys:
        n = len(strata[key])
        candidates = []
        for train_n in range(n + 1):
            for validation_n in range(n - train_n + 1):
                holdout_n = n - train_n - validation_n
                candidates.append((allocation_cost(n, (train_n, validation_n, holdout_n)),
                                   (train_n, validation_n, holdout_n)))
        next_states = {}
        for (prior_train, prior_validation), (prior_cost, prior_allocs) in states.items():
            prior_holdout = processed - prior_train - prior_validation
            for cost, allocation in candidates:
                train_n = prior_train + allocation[0]
                validation_n = prior_validation + allocation[1]
                holdout_n = prior_holdout + allocation[2]
                if (train_n > targets["train"] or validation_n > targets["validation"]
                        or holdout_n > targets["holdout"]):
                    continue
                state = (train_n, validation_n)
                candidate = (prior_cost + cost, prior_allocs + [allocation])
                current = next_states.get(state)
                if current is None or candidate[0] < current[0]:
                    next_states[state] = candidate
        states = next_states
        processed += n
    final = states.get((targets["train"], targets["validation"]))
    if final is None:
        raise RuntimeError("Could not satisfy exact split sizes.")
    return keys, final[1], final[0]


def assign_splits(identities: list[dict]) -> tuple[list[dict], dict]:
    strata: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for identity in identities:
        strata[(identity["expected_sex"], identity["label_band"])].append(identity)
    for rows in strata.values():
        rows.sort(key=lambda item: stable_key(item["identity_id"]))

    targets = exact_split_targets(len(identities))
    keys, allocations, cost = optimal_stratum_allocations(strata, targets)
    assigned = []
    allocation_detail = {}
    for key, allocation in zip(keys, allocations):
        rows = strata[key]
        cursor = 0
        allocation_detail["|".join(key)] = dict(zip(SPLITS, allocation))
        for split, count in zip(SPLITS, allocation):
            for identity in rows[cursor:cursor + count]:
                assigned.append({**identity, "split": split})
            cursor += count
        if cursor != len(rows):
            raise AssertionError(f"Allocation omitted identities in {key}")

    assigned.sort(key=lambda item: item["identity_id"])
    if len(assigned) != len(identities) or len({row["identity_id"] for row in assigned}) != len(assigned):
        raise AssertionError("Identity coverage/uniqueness failure.")
    actual = {split: sum(row["split"] == split for row in assigned) for split in SPLITS}
    if actual != targets:
        raise AssertionError(f"Split counts differ: {actual} != {targets}")
    return assigned, {"targets": targets, "actual": actual, "stratum_allocations": allocation_detail,
                      "allocation_cost": cost}


def csv_text(rows: list[dict]) -> str:
    columns = [
        "identity_id", "expected_sex", "expected_looks", "label_band", "split",
        "gallery_image_count", "editorial_ethnicity", "demographic_metadata_source",
    ]
    import io
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=columns, lineterminator="\n")
    writer.writeheader()
    for row in rows:
        writer.writerow({
            **{key: row[key] for key in columns if key in row},
            "expected_looks": f"{row['expected_looks']:.1f}",
            "demographic_metadata_source": "matchmaker.html explicit editorial field; not image-inferred",
        })
    return buffer.getvalue()


def write_frozen(path: Path, text: str) -> str:
    encoded = text.encode("utf-8")
    if path.exists():
        if path.read_bytes() != encoded:
            raise SystemExit(
                f"REFUSING TO OVERWRITE frozen split artifact {path.relative_to(ROOT)}; "
                "create a new version instead."
            )
        return "verified unchanged"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(encoded)
    return "created"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV)
    parser.add_argument("--json", type=Path, default=DEFAULT_JSON)
    args = parser.parse_args()

    source_path = args.source.resolve()
    roster_source = ROSTER_HTML.read_text(encoding="utf-8")
    metadata = parse_roster_metadata(roster_source)
    galleries = parse_gallery_paths(roster_source)
    identities = load_preserved_identities(source_path, metadata, galleries)
    assigned, allocation = assign_splits(identities)

    split_csv = csv_text(assigned)
    csv_hash = sha256_bytes(split_csv.encode("utf-8"))
    manifest = {
        "schema_version": "face-identity-split.v1",
        "frozen_date": "2026-08-18",
        "seed": SEED,
        "unit": "identity",
        "leakage_rule": "Every canonical/gallery image for an identity inherits exactly one split.",
        "ratios": RATIOS,
        "stratification": ["expected_sex", "fixed editorial looks band"],
        "label_bands": {
            "low_lt_5_5": "expected_looks < 5.5",
            "middle_5_5_to_lt_8": "5.5 <= expected_looks < 8.0",
            "high_ge_8": "expected_looks >= 8.0",
        },
        "inputs": {
            "preserved_canonical_batch": {
                "path": source_path.relative_to(ROOT).as_posix(),
                "sha256": sha256_file(source_path),
            },
            "roster_metadata": {
                "path": ROSTER_HTML.relative_to(ROOT).as_posix(),
                "sha256": sha256_file(ROSTER_HTML),
            },
        },
        "output_csv_sha256": csv_hash,
        "identity_count": len(assigned),
        "gallery_identity_count": sum(row["gallery_image_count"] > 0 for row in assigned),
        "gallery_image_count": sum(row["gallery_image_count"] for row in assigned),
        "identities_without_production_gallery": [
            row["identity_id"] for row in assigned if row["gallery_image_count"] == 0
        ],
        "split_counts": allocation["actual"],
        "stratum_allocations": allocation["stratum_allocations"],
        "demographic_policy": {
            "allowed": "Only expected_sex and explicit Matchmaker editorial ethnicity metadata.",
            "forbidden": "Never infer race, ethnicity, or another demographic from images.",
            "reporting_minimum": "Report an ethnicity subgroup only with >=20 eligible identities and both primary classes.",
        },
    }
    json_text = json.dumps(manifest, indent=2, sort_keys=True) + "\n"

    csv_status = write_frozen(args.csv.resolve(), split_csv)
    json_status = write_frozen(args.json.resolve(), json_text)
    print(
        f"[split] {len(assigned)} identities -> "
        + ", ".join(f"{name}={allocation['actual'][name]}" for name in SPLITS)
    )
    print(
        f"[gallery] {manifest['gallery_identity_count']} identities / "
        f"{manifest['gallery_image_count']} production gallery images; "
        f"{len(manifest['identities_without_production_gallery'])} identities have none"
    )
    print(f"[write] {args.csv.resolve().relative_to(ROOT)} ({csv_status})")
    print(f"[write] {args.json.resolve().relative_to(ROOT)} ({json_status})")


if __name__ == "__main__":
    main()
