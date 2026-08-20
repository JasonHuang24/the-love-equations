"""Train a reproducible, leakage-aware Body Calculator CNN candidate.

This program stages a candidate and never replaces models/body-beauty.onnx.

Workflow:
  python models/train_body_beauty.py --dry-run
  python models/train_body_beauty.py --smoke \
    --environment-lock data/body-training-environment-lock.txt
  python models/train_body_beauty.py --prepare-manifest \
    --manifest data/body-training-manifest.json
  python models/train_body_beauty.py \
    --environment-lock data/body-training-environment-lock.txt \
    --manifest data/body-training-manifest.json \
    --seeds 1337,2027,4099 \
    --candidate-out models/body-beauty.candidate.onnx \
    --run-report data/body-training-run.json

The Connor corpus is training/model-selection contaminated for the shipped model.
Epoch and seed selection use dev only. The selected candidate gets one locked-test
inference pass after selection. Export requires preregistered gates and asserted
PyTorch/ONNX parity.

full-letterbox preserves the historical training transform but does not match the
production pose-derived 1.15x square person crop. pose-crop-manifest consumes frozen
production crop rectangles. Neither mode alone proves browser/Pillow pixel parity.

Do not tune outMin/outMax. A winning checkpoint needs a newly frozen independent
production-reference batch and regenerated REF_RAW. That monotone remap changes
calibration/display only; it cannot improve rank correlation, AUC, or pairwise order.
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import hashlib
import importlib.metadata
import json
import math
import os
import platform
import random
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path
from typing import Any, Iterable

SCRIPT_VERSION = "2.0.0"
MANIFEST_SCHEMA = "body-training-manifest.v1"
PROVENANCE_SCHEMA = "body-training-provenance.v1"
DRY_SCHEMA = "body-training-dry-run.v1"
OSF_URL = "https://osf.io/download/khm9a/"
OSF_ARCHIVE_SHA256 = "71577e780ca5a9ba7a54653b55cca14bbbefe1be1783362ee9a9c0f581a950e8"
SHIPPED_MODEL = Path(__file__).resolve().with_name("body-beauty.onnx")
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]
IMAGE_SIZE = 224
FULL_LETTERBOX_WARNING = (
    "does not match production: body.html uses a pose-derived 1.15x square person "
    "crop and may sample beyond the source image into black padding"
)
POSE_CROP_WARNING = (
    "uses frozen production crop rectangles, but Pillow bilinear sampling is not "
    "proof of bit-identical browser canvas preprocessing"
)
REQUIRED_TRAINING_DISTRIBUTIONS = (
    "torch",
    "torchvision",
    "onnx",
    "onnxruntime",
    "onnxscript",
    "Pillow",
    "numpy",
    "scipy",
    "pandas",
)


class ContractError(RuntimeError):
    """A dataset, evaluation, or release contract was violated."""


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def valid_sha256(value: str) -> bool:
    return len(value) == 64 and all(char in "0123456789abcdef" for char in value.lower())


def canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def json_safe(value: Any) -> Any:
    if isinstance(value, float) and not math.isfinite(value):
        return None
    if isinstance(value, dict):
        return {str(key): json_safe(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [json_safe(item) for item in value]
    return value


def atomic_json(path: Path, value: Any, *, overwrite: bool) -> None:
    path = path.resolve()
    if path.exists() and not overwrite:
        raise ContractError(f"refusing to overwrite existing file: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(json_safe(value), indent=2, sort_keys=True, ensure_ascii=False) + "\n"
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", newline="\n", dir=path.parent, delete=False) as handle:
        handle.write(payload)
        temporary = Path(handle.name)
    os.replace(temporary, path)


def parse_seeds(raw: str) -> list[int]:
    try:
        seeds = [int(part.strip()) for part in raw.split(",") if part.strip()]
    except ValueError as exc:
        raise argparse.ArgumentTypeError("--seeds must be comma-separated integers") from exc
    if not seeds or len(seeds) != len(set(seeds)):
        raise argparse.ArgumentTypeError("--seeds must contain unique integers")
    if any(seed < 0 or seed > 2**32 - 1 for seed in seeds):
        raise argparse.ArgumentTypeError("seeds must be in [0, 2^32-1]")
    return seeds


def identity_tokens(image_id: str) -> list[str]:
    tokens = [token.strip().upper() for token in str(image_id).split(".") if token.strip()]
    if not tokens or any("/" in token or "\\" in token for token in tokens):
        raise ContractError(f"malformed image id: {image_id!r}")
    return tokens


def is_headswap(image_id: str) -> bool:
    return len(identity_tokens(image_id)) > 1


class UnionFind:
    def __init__(self) -> None:
        self.parent: dict[str, str] = {}

    def find(self, item: str) -> str:
        self.parent.setdefault(item, item)
        root = item
        while self.parent[root] != root:
            root = self.parent[root]
        while self.parent[item] != root:
            parent = self.parent[item]
            self.parent[item] = root
            item = parent
        return root

    def union(self, left: str, right: str) -> None:
        left_root, right_root = self.find(left), self.find(right)
        if left_root != right_root:
            smaller, larger = sorted((left_root, right_root))
            self.parent[larger] = smaller


def connected_components(rows: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    union_find = UnionFind()
    row_tokens: dict[str, list[str]] = {}
    for row in rows:
        image_id = str(row["image_id"])
        tokens = identity_tokens(image_id)
        row_tokens[image_id] = tokens
        union_find.find(tokens[0])
        for token in tokens[1:]:
            union_find.union(tokens[0], token)

    tokens_by_root: dict[str, set[str]] = {}
    for token in sorted(union_find.parent):
        tokens_by_root.setdefault(union_find.find(token), set()).add(token)

    component_for_token: dict[str, str] = {}
    for tokens in tokens_by_root.values():
        component_id = "cc-" + sha256_bytes("\n".join(sorted(tokens)).encode())[:16]
        for token in tokens:
            component_for_token[token] = component_id

    components: dict[str, dict[str, Any]] = {}
    for row in rows:
        tokens = row_tokens[str(row["image_id"])]
        component_id = component_for_token[tokens[0]]
        component = components.setdefault(component_id, {"tokens": set(), "rows": []})
        component["tokens"].update(tokens)
        component["rows"].append(row)
    return components


def assign_splits(
    components: dict[str, dict[str, Any]], split_seed: int, dev_frac: float, test_frac: float
) -> dict[str, str]:
    if len(components) < 3:
        raise ContractError(
            f"only {len(components)} connected identity components; three-way split is impossible"
        )
    names = ("train", "dev", "test")
    fractions = {"train": 1.0 - dev_frac - test_frac, "dev": dev_frac, "test": test_frac}
    total = sum(len(component["rows"]) for component in components.values())
    targets = {name: total * fractions[name] for name in names}
    counts = {name: 0 for name in names}
    assignments: dict[str, str] = {}

    def order(item: tuple[str, dict[str, Any]]) -> tuple[int, str]:
        component_id, component = item
        return (-len(component["rows"]), sha256_bytes(f"{split_seed}:{component_id}".encode()))

    ordered = sorted(components.items(), key=order)
    for index, (component_id, component) in enumerate(ordered):
        size = len(component["rows"])
        empty = [name for name in names if counts[name] == 0]
        remaining = len(ordered) - index - 1
        choices = empty if empty and remaining < len(empty) else list(names)

        def objective(name: str) -> tuple[float, str]:
            hypothetical = dict(counts)
            hypothetical[name] += size
            error = sum(
                ((hypothetical[split] - targets[split]) / max(targets[split], 1.0)) ** 2
                for split in names
            )
            return error, sha256_bytes(f"{split_seed}:{component_id}:{name}".encode())

        selected = min(choices, key=objective)
        assignments[component_id] = selected
        counts[selected] += size
    if any(counts[name] == 0 for name in names):
        raise ContractError(f"split construction produced an empty split: {counts}")
    return assignments


def build_manifest(
    rows: list[dict[str, Any]],
    *,
    source_url: str,
    archive_sha256: str,
    labels_sha256: str,
    split_seed: int,
    dev_frac: float,
    test_frac: float,
    preprocessing_mode: str,
    crop_manifest_sha256: str | None,
    label_source: str,
    drop_headswaps: bool,
) -> dict[str, Any]:
    components = connected_components(rows)
    assignments = assign_splits(components, split_seed, dev_frac, test_frac)
    component_for_image = {
        str(row["image_id"]): component_id
        for component_id, component in components.items()
        for row in component["rows"]
    }
    entries: list[dict[str, Any]] = []
    for row in sorted(rows, key=lambda item: (str(item["image_id"]), str(item["image_relpath"]))):
        image_id = str(row["image_id"])
        component_id = component_for_image[image_id]
        entry: dict[str, Any] = {
            "image_id": image_id,
            "image_relpath": str(row["image_relpath"]).replace("\\", "/"),
            "image_sha256": str(row["image_sha256"]),
            "score": float(row["score"]),
            "identity_tokens": identity_tokens(image_id),
            "identity_component": component_id,
            "variant": "head-swap" if is_headswap(image_id) else "original",
            "split": assignments[component_id],
        }
        if preprocessing_mode == "pose-crop-manifest":
            entry["crop_rect_px"] = [float(value) for value in row["crop_rect_px"]]
            entry["source_dimensions"] = [int(value) for value in row["source_dimensions"]]
        entries.append(entry)
    names = ("train", "dev", "test")
    manifest = {
        "schema_version": MANIFEST_SCHEMA,
        "dataset": {
            "name": "Connor Full-Body Photo Database",
            "source_url": source_url,
            "archive_sha256": archive_sha256,
            "labels_sha256": labels_sha256,
            "training_contaminated_for_shipped_model": True,
            "license": {
                "declared": False,
                "redistribution_assumed": False,
                "note": (
                    "The OSF node and archive expose no declared license; public "
                    "download access is not treated as redistribution permission."
                ),
            },
            "selection": {
                "label_source": label_source,
                "label_field": "attractiveness mean",
                "missing_or_non_finite_labels": "excluded",
                "head_swap_composites": "excluded" if drop_headswaps else "included",
                "unmatched_ratings_or_images": "fail closed; partial corpus forbidden",
            },
        },
        "split_policy": {
            "algorithm": "connected-identity-greedy-v1",
            "split_seed": split_seed,
            "fractions": {
                "train": 1.0 - dev_frac - test_frac,
                "dev": dev_frac,
                "test": test_frac,
            },
            "checkpoint_selection_split": "dev",
            "test_access_policy": "one inference pass after seed/checkpoint selection",
        },
        "preprocessing": {
            "mode": preprocessing_mode,
            "crop_manifest_sha256": crop_manifest_sha256,
            "warning": (
                FULL_LETTERBOX_WARNING
                if preprocessing_mode == "full-letterbox"
                else POSE_CROP_WARNING
            ),
            "input_size": IMAGE_SIZE,
            "normalization": {"mean": MEAN, "std": STD},
        },
        "counts": {
            "rows": len(entries),
            "components": len(components),
            "splits": {name: sum(entry["split"] == name for entry in entries) for name in names},
            "split_components": {
                name: len(
                    {
                        entry["identity_component"]
                        for entry in entries
                        if entry["split"] == name
                    }
                )
                for name in names
            },
        },
        "entries": entries,
    }
    assert_manifest(manifest)
    return manifest


def assert_manifest(manifest: dict[str, Any]) -> None:
    if manifest.get("schema_version") != MANIFEST_SCHEMA:
        raise ContractError("unsupported manifest schema")
    entries = manifest.get("entries")
    if not isinstance(entries, list) or not entries:
        raise ContractError("manifest contains no entries")
    seen_ids: set[str] = set()
    token_splits: dict[str, str] = {}
    component_splits: dict[str, str] = {}
    for entry in entries:
        image_id = str(entry.get("image_id", ""))
        if image_id in seen_ids:
            raise ContractError(f"duplicate manifest image id: {image_id}")
        seen_ids.add(image_id)
        split = entry.get("split")
        if split not in {"train", "dev", "test"}:
            raise ContractError(f"invalid split for {image_id}: {split}")
        component = str(entry.get("identity_component", ""))
        prior_component = component_splits.setdefault(component, split)
        if prior_component != split:
            raise ContractError(f"identity component {component} crosses splits")
        expected_tokens = identity_tokens(image_id)
        if entry.get("identity_tokens") != expected_tokens:
            raise ContractError(f"identity tokens changed for {image_id}")
        for token in expected_tokens:
            prior = token_splits.setdefault(token, split)
            if prior != split:
                raise ContractError(f"identity leakage: token {token} appears in {prior} and {split}")
        score = entry.get("score")
        if not isinstance(score, (int, float)) or not math.isfinite(float(score)):
            raise ContractError(f"non-finite score for {image_id}")
        if not valid_sha256(str(entry.get("image_sha256", ""))):
            raise ContractError(f"invalid image hash for {image_id}")
    if set(token_splits.values()) != {"train", "dev", "test"}:
        raise ContractError("manifest must contain train, dev, and test identities")


def manifest_sha256(manifest: dict[str, Any]) -> str:
    return sha256_bytes(canonical_json(manifest).encode())


def find_images(root: Path) -> list[Path]:
    extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
    return sorted(
        path for path in root.rglob("*")
        if path.is_file() and path.suffix.lower() in extensions
    )


def safe_extract(archive: Path, destination: Path) -> None:
    destination = destination.resolve()
    with zipfile.ZipFile(archive) as bundle:
        for member in bundle.infolist():
            target = (destination / member.filename).resolve()
            try:
                target.relative_to(destination)
            except ValueError as exc:
                raise ContractError(f"unsafe archive path: {member.filename}") from exc
        bundle.extractall(destination)


def fetch_osf(url: str, destination: Path, expected_sha256: str) -> dict[str, str]:
    if not valid_sha256(expected_sha256):
        raise ContractError("archive SHA-256 must contain 64 hexadecimal characters")
    destination.mkdir(parents=True, exist_ok=True)
    archive = destination / "full_body_photo_database.zip"
    if not archive.exists():
        partial = archive.with_suffix(".zip.part")
        if partial.exists():
            partial.unlink()
        print(f"[data] downloading {url} (~375 MB)")
        try:
            urllib.request.urlretrieve(url, partial)
        except Exception:
            if partial.exists():
                partial.unlink()
            raise
        actual = sha256_file(partial)
        if actual != expected_sha256.lower():
            partial.unlink()
            raise ContractError(f"archive hash mismatch: expected {expected_sha256}, got {actual}")
        os.replace(partial, archive)
    actual = sha256_file(archive)
    if actual != expected_sha256.lower():
        raise ContractError(
            f"existing archive hash mismatch: expected {expected_sha256}, got {actual}; "
            "quarantine it and download a verified copy"
        )
    images = find_images(destination)
    if not images:
        safe_extract(archive, destination)
        images = find_images(destination)
    if not images:
        raise ContractError("verified archive extracted without supported images")
    print(f"[data] archive verified: {actual}; images={len(images)}")
    return {"path": str(archive.resolve()), "sha256": actual, "url": url}


def locate_ratings(root: Path, use_long: bool) -> Path:
    wanted = "photo_ratings.csv" if use_long else "aggregated_photo_ratings.csv"
    hits = sorted(root.rglob(wanted))
    if len(hits) != 1:
        raise ContractError(f"expected one {wanted!r}; found {len(hits)}")
    return hits[0]


def build_label_rows(
    root: Path, *, use_long: bool, drop_headswaps: bool
) -> tuple[list[dict[str, Any]], Path]:
    try:
        import pandas as pd
    except ImportError as exc:
        raise ContractError("pandas is required for corpus preparation") from exc

    by_stem: dict[str, Path] = {}
    for path in find_images(root):
        stem = path.stem.lower()
        if stem in by_stem and by_stem[stem] != path:
            raise ContractError(f"duplicate image stem: {stem}")
        by_stem[stem] = path
    ratings = locate_ratings(root, use_long)
    frame = pd.read_csv(ratings)
    if use_long:
        required = {"trait", "rating", "photo"}
        if not required.issubset(frame.columns):
            raise ContractError(f"long ratings file lacks {sorted(required - set(frame.columns))}")
        selected = frame[frame["trait"].astype(str).str.lower() == "attractiveness"].copy()
        selected["rating"] = pd.to_numeric(selected["rating"], errors="coerce")
        labels = selected.dropna(subset=["rating"]).groupby("photo")["rating"].mean()
    else:
        required = {"attractiveness_mean", "photo"}
        if not required.issubset(frame.columns):
            raise ContractError(f"wide ratings file lacks {sorted(required - set(frame.columns))}")
        frame["attractiveness_mean"] = pd.to_numeric(
            frame["attractiveness_mean"], errors="coerce"
        )
        if frame["photo"].duplicated().any():
            raise ContractError("wide ratings file contains duplicate photo ids")
        labels = frame.dropna(subset=["attractiveness_mean"]).set_index("photo")[
            "attractiveness_mean"
        ]

    rows: list[dict[str, Any]] = []
    missed: list[str] = []
    for raw_id, raw_score in labels.items():
        image_id = str(raw_id).strip()
        if drop_headswaps and is_headswap(image_id):
            continue
        score = float(raw_score)
        if not math.isfinite(score):
            continue
        path = by_stem.get(image_id.replace(".", "-").lower())
        if path is None:
            missed.append(image_id)
            continue
        rows.append(
            {
                "image_id": image_id,
                "image_relpath": path.relative_to(root).as_posix(),
                "image_sha256": sha256_file(path),
                "score": score,
            }
        )
    if missed:
        raise ContractError(
            f"{len(missed)} rating ids lack an image (first {missed[0]!r}); refusing a partial corpus"
        )
    if len(rows) < 50:
        raise ContractError(f"only {len(rows)} matched rows")
    if len({row["image_id"] for row in rows}) != len(rows):
        raise ContractError("duplicate image ids after mapping")
    print(
        f"[data] ratings={ratings}; rows={len(rows)}; "
        f"head-swaps={sum(is_headswap(row['image_id']) for row in rows)}"
    )
    return rows, ratings


def attach_pose_crops(rows: list[dict[str, Any]], path: Path) -> str:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("schema_version") != "body-pose-crops.v1":
        raise ContractError("pose crop manifest schema must be body-pose-crops.v1")
    entries = payload.get("entries")
    if not isinstance(entries, list):
        raise ContractError("pose crop manifest entries must be an array")
    by_id = {str(entry.get("image_id")): entry for entry in entries}
    if len(by_id) != len(entries):
        raise ContractError("duplicate image ids in pose crop manifest")
    for row in rows:
        image_id = str(row["image_id"])
        entry = by_id.get(image_id)
        if entry is None:
            raise ContractError(f"missing pose crop for {image_id}")
        if entry.get("source_sha256") != row["image_sha256"]:
            raise ContractError(f"pose crop source hash mismatch for {image_id}")
        rect = entry.get("crop_rect_px")
        dimensions = entry.get("source_dimensions")
        finite_rect = (
            isinstance(rect, list)
            and len(rect) == 4
            and all(
                isinstance(value, (int, float)) and math.isfinite(float(value))
                for value in rect
            )
        )
        if not finite_rect or float(rect[2]) <= 0 or float(rect[3]) <= 0:
            raise ContractError(f"invalid pose crop for {image_id}")
        if abs(float(rect[2]) - float(rect[3])) > max(float(rect[2]), float(rect[3])) * 0.01:
            raise ContractError(f"pose crop for {image_id} is not square")
        if (
            not isinstance(dimensions, list)
            or len(dimensions) != 2
            or any(not isinstance(value, int) or value <= 0 for value in dimensions)
        ):
            raise ContractError(f"invalid source dimensions for {image_id}")
        row["crop_rect_px"] = [float(value) for value in rect]
        row["source_dimensions"] = dimensions
    return sha256_file(path)


def synthetic_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for index in range(12):
        left, right = f"A{index:02d}", f"B{index:02d}"
        for offset, image_id in enumerate((left, right, f"{left}.{right}")):
            rows.append(
                {
                    "image_id": image_id,
                    "image_relpath": f"synthetic/{image_id.replace('.', '-')}.png",
                    "image_sha256": sha256_bytes(f"image:{image_id}".encode()),
                    "score": float(25 + index * 3 + offset),
                }
            )
    return rows


def validate_args(args: argparse.Namespace) -> None:
    if not valid_sha256(args.archive_sha256):
        raise ContractError("archive SHA-256 must contain 64 hexadecimal characters")
    if not (
        0 < args.dev_frac < 0.5
        and 0 < args.test_frac < 0.5
        and args.dev_frac + args.test_frac < 0.5
    ):
        raise ContractError("dev/test fractions must leave more than half for train")
    if (
        args.preprocessing_mode == "pose-crop-manifest"
        and not args.pose_crop_manifest
        and not args.dry_run
    ):
        raise ContractError("pose-crop-manifest mode requires --pose-crop-manifest")
    if args.preprocessing_mode == "full-letterbox" and args.pose_crop_manifest:
        raise ContractError("--pose-crop-manifest requires pose-crop-manifest mode")
    if args.epochs < 1 or args.batch_size < 1 or args.num_workers < 0:
        raise ContractError("epochs and batch size must be positive")
    if not (-1 <= args.min_dev_spearman <= 1 and -1 <= args.min_test_spearman <= 1):
        raise ContractError("Spearman gates must be in [-1, 1]")
    if Path(args.candidate_out).resolve() == SHIPPED_MODEL:
        raise ContractError(
            "this script never writes models/body-beauty.onnx; stage a candidate and "
            "complete browser/subgroup/stability acceptance first"
        )
    if args.num_workers and os.name == "nt":
        raise ContractError("use --num-workers 0 on Windows for deterministic transforms")
    is_training = not (args.dry_run or args.smoke or args.prepare_manifest)
    if is_training:
        if not args.environment_lock:
            raise ContractError(
                "training requires --environment-lock from an archived "
                "'python -m pip freeze --all' environment"
            )
        # Fail before prepare_inputs can read or download the corpus.
        verify_environment_lock(Path(args.environment_lock))
    elif args.smoke and args.environment_lock:
        verify_environment_lock(Path(args.environment_lock))


def prepare_inputs(args: argparse.Namespace) -> tuple[dict[str, Any], Path]:
    data_root = Path(args.data_dir).resolve()
    archive = fetch_osf(args.archive_url, data_root, args.archive_sha256)
    rows, ratings = build_label_rows(
        data_root, use_long=args.use_long, drop_headswaps=args.drop_headswaps
    )
    crop_hash = None
    if args.preprocessing_mode == "pose-crop-manifest":
        crop_hash = attach_pose_crops(rows, Path(args.pose_crop_manifest).resolve())
    manifest = build_manifest(
        rows,
        source_url=args.archive_url,
        archive_sha256=archive["sha256"],
        labels_sha256=sha256_file(ratings),
        split_seed=args.split_seed,
        dev_frac=args.dev_frac,
        test_frac=args.test_frac,
        preprocessing_mode=args.preprocessing_mode,
        crop_manifest_sha256=crop_hash,
        label_source=ratings.name,
        drop_headswaps=args.drop_headswaps,
    )
    return manifest, data_root


def lock_or_verify_manifest(
    path: Path,
    expected: dict[str, Any],
    *,
    prepare: bool,
    regenerate: bool,
) -> dict[str, Any]:
    path = path.resolve()
    if not path.exists():
        if not prepare:
            raise ContractError(
                f"locked manifest missing: {path}; run --prepare-manifest, review it, then train"
            )
        atomic_json(path, expected, overwrite=False)
        print(f"[manifest] locked {path}; sha256={manifest_sha256(expected)}")
        return expected
    actual = json.loads(path.read_text(encoding="utf-8"))
    assert_manifest(actual)
    if canonical_json(actual) != canonical_json(expected):
        if prepare and regenerate:
            atomic_json(path, expected, overwrite=True)
            print(
                f"[manifest] explicitly regenerated {path}; sha256={manifest_sha256(expected)}"
            )
            return expected
        raise ContractError(
            "locked manifest differs from verified corpus/config; investigate first. "
            "Only then use --prepare-manifest --regenerate-manifest"
        )
    print(f"[manifest] verified sha256={manifest_sha256(actual)}")
    return actual


def git_context() -> dict[str, Any]:
    try:
        commit = subprocess.run(
            ["git", "rev-parse", "HEAD"], check=True, capture_output=True, text=True
        ).stdout.strip()
        dirty = bool(
            subprocess.run(
                ["git", "status", "--porcelain"],
                check=True,
                capture_output=True,
                text=True,
            ).stdout.strip()
        )
        return {"commit": commit, "dirty": dirty}
    except Exception:
        return {"commit": None, "dirty": None}


def installed_distribution_versions() -> dict[str, str | None]:
    versions: dict[str, str | None] = {}
    for distribution in REQUIRED_TRAINING_DISTRIBUTIONS:
        try:
            versions[distribution] = importlib.metadata.version(distribution)
        except importlib.metadata.PackageNotFoundError:
            versions[distribution] = None
    return versions


def verify_environment_lock(path: Path) -> dict[str, Any]:
    resolved = path.resolve()
    if not resolved.is_file():
        raise ContractError(f"environment lock missing: {resolved}")
    text = resolved.read_text(encoding="utf-8")
    pinned: dict[str, str] = {}
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "==" not in line:
            continue
        name, version = line.split("==", 1)
        normalized = name.strip().lower().replace("_", "-")
        if normalized and version.strip():
            pinned[normalized] = version.strip()

    installed = installed_distribution_versions()
    mismatches: list[str] = []
    for distribution, actual in installed.items():
        normalized = distribution.lower().replace("_", "-")
        expected = pinned.get(normalized)
        if expected is None:
            mismatches.append(f"{distribution}: exact == pin missing")
        elif actual != expected:
            mismatches.append(f"{distribution}: lock={expected}, installed={actual}")
    if mismatches:
        raise ContractError(
            "environment lock does not match required installed distributions: "
            + "; ".join(mismatches)
        )
    return {
        "path": str(resolved),
        "sha256": sha256_file(resolved),
        "format": "pip-freeze-exact-pins",
        "required_distributions": installed,
    }


def environment_context(
    torch: Any = None,
    torchvision: Any = None,
    environment_lock: dict[str, Any] | None = None,
) -> dict[str, Any]:
    context: dict[str, Any] = {
        "python": sys.version,
        "executable": sys.executable,
        "platform": platform.platform(),
        "machine": platform.machine(),
        "git": git_context(),
        "packages": installed_distribution_versions(),
        "environment_lock": environment_lock,
    }
    if torch is not None:
        context.update(
            {
                "torch": torch.__version__,
                "torchvision": getattr(torchvision, "__version__", None),
                "cuda_available": torch.cuda.is_available(),
                "cuda_version": torch.version.cuda,
                "cudnn_version": (
                    torch.backends.cudnn.version()
                    if torch.backends.cudnn.is_available()
                    else None
                ),
                "devices": [
                    torch.cuda.get_device_name(index)
                    for index in range(torch.cuda.device_count())
                ],
                "deterministic_algorithms": torch.are_deterministic_algorithms_enabled(),
            }
        )
    return context


def initialization_context(torch: Any, weights: Any) -> dict[str, Any]:
    url = getattr(weights, "url", None)
    cached = Path(torch.hub.get_dir()) / "checkpoints" / Path(url).name if url else None
    return {
        "torchvision_weights": str(weights),
        "source_url": url,
        "cached_checkpoint": str(cached) if cached else None,
        "cached_checkpoint_sha256": (
            sha256_file(cached) if cached and cached.exists() else None
        ),
    }


def letterbox_square(image: Any) -> Any:
    from PIL import Image

    width, height = image.size
    side = max(width, height)
    canvas = Image.new("RGB", (side, side), (0, 0, 0))
    canvas.paste(image, ((side - width) // 2, (side - height) // 2))
    return canvas


def pose_crop_square(image: Any, entry: dict[str, Any], size: int) -> Any:
    from PIL import Image

    if list(image.size) != list(entry["source_dimensions"]):
        raise ContractError(
            f"source dimensions changed for {entry['image_id']}: "
            f"expected {entry['source_dimensions']}, got {image.size}"
        )
    x, y, width, height = [float(value) for value in entry["crop_rect_px"]]
    return image.transform(
        (size, size),
        Image.Transform.EXTENT,
        (x, y, x + width, y + height),
        resample=Image.Resampling.BILINEAR,
        fillcolor=(0, 0, 0),
    )


def metrics(predictions: Any, targets: Any, scipy_stats: Any) -> dict[str, Any]:
    import numpy as np

    predictions = np.asarray(predictions, dtype=np.float64)
    targets = np.asarray(targets, dtype=np.float64)
    if len(predictions) != len(targets) or len(predictions) < 3:
        raise ContractError("metrics require equal arrays with at least three rows")
    return {
        "n": len(predictions),
        "rmse": float(np.sqrt(np.mean((predictions - targets) ** 2))),
        "pearson": float(scipy_stats.pearsonr(predictions, targets).statistic),
        "spearman": float(scipy_stats.spearmanr(predictions, targets).statistic),
    }


def bootstrap_spearman(
    predictions: Any,
    targets: Any,
    scipy_stats: Any,
    *,
    seed: int,
    iterations: int,
) -> list[float] | None:
    import numpy as np

    if iterations <= 0:
        return None
    predictions = np.asarray(predictions, dtype=np.float64)
    targets = np.asarray(targets, dtype=np.float64)
    generator = np.random.default_rng(seed)
    values = []
    for _ in range(iterations):
        indices = generator.integers(0, len(predictions), len(predictions))
        value = float(
            scipy_stats.spearmanr(predictions[indices], targets[indices]).statistic
        )
        if math.isfinite(value):
            values.append(value)
    if len(values) < max(100, iterations // 2):
        return None
    return [float(value) for value in np.percentile(values, [2.5, 97.5])]


def load_baseline(path: Path, test_ids: list[str]) -> dict[str, float]:
    if path.suffix.lower() == ".json":
        payload = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(payload, dict):
            mapping = {str(key): float(value) for key, value in payload.items()}
        elif isinstance(payload, list):
            mapping = {
                str(row["image_id"]): float(row["prediction"]) for row in payload
            }
        else:
            raise ContractError("baseline JSON must be an object or row array")
    else:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            if not reader.fieldnames or not {"image_id", "prediction"}.issubset(reader.fieldnames):
                raise ContractError("baseline CSV needs image_id,prediction columns")
            mapping = {str(row["image_id"]): float(row["prediction"]) for row in reader}
    if set(mapping) != set(test_ids):
        missing = sorted(set(test_ids) - set(mapping))
        extra = sorted(set(mapping) - set(test_ids))
        raise ContractError(
            f"baseline must match locked test ids; missing={missing[:3]} extra={extra[:3]}"
        )
    if any(not math.isfinite(value) for value in mapping.values()):
        raise ContractError("baseline contains non-finite predictions")
    return mapping


def run_smoke(args: argparse.Namespace) -> int:
    try:
        import numpy as np
        import onnxruntime as ort
        import torch
        import torch.nn as nn
        import torchvision as tv
    except ImportError as exc:
        raise ContractError(
            "--smoke needs torch, torchvision, onnx, onnxscript, and onnxruntime"
        ) from exc
    torch.manual_seed(args.seeds[0])
    model = tv.models.resnet18(weights=None)
    model.fc = nn.Linear(model.fc.in_features, 1)
    model.eval()
    dummy = torch.randn(4, 3, IMAGE_SIZE, IMAGE_SIZE)
    with tempfile.TemporaryDirectory(prefix="body-training-smoke-") as temporary:
        output = Path(temporary) / "smoke.onnx"
        torch.onnx.export(
            model,
            dummy[:1],
            output,
            input_names=["input"],
            output_names=["score"],
            dynamic_axes={"input": {0: "batch"}, "score": {0: "batch"}},
            opset_version=12,
            dynamo=False,
        )
        session = ort.InferenceSession(str(output), providers=["CPUExecutionProvider"])
        with torch.no_grad():
            torch_values = model(dummy).detach().cpu().numpy()
        onnx_values = session.run(
            None, {session.get_inputs()[0].name: dummy.numpy()}
        )[0]
        np.testing.assert_allclose(
            torch_values, onnx_values, rtol=args.parity_rtol, atol=args.parity_atol
        )
        max_abs = float(np.max(np.abs(torch_values - onnx_values)))
    print(
        f"[smoke] PASS; asserted PyTorch/ONNX parity across 4 rows; max_abs={max_abs:.3e}"
    )
    return 0


def train_candidate(
    args: argparse.Namespace, manifest: dict[str, Any], data_root: Path
) -> int:
    os.environ.setdefault("CUBLAS_WORKSPACE_CONFIG", ":4096:8")
    try:
        import numpy as np
        import onnxruntime as ort
        import torch
        import torch.nn as nn
        import torchvision as tv
        from PIL import Image
        from scipy import stats as scipy_stats
        from torch.utils.data import DataLoader, Dataset
        from torchvision import transforms
    except ImportError as exc:
        raise ContractError(
            "training needs torch, torchvision, onnx, onnxscript, onnxruntime, "
            "pandas, Pillow, scipy, and numpy"
        ) from exc

    torch.use_deterministic_algorithms(True)
    torch.backends.cudnn.benchmark = False
    torch.backends.cudnn.deterministic = True
    if args.device == "cuda" and not torch.cuda.is_available():
        raise ContractError("CUDA requested but unavailable")
    device = (
        "cuda"
        if args.device == "auto" and torch.cuda.is_available()
        else ("cpu" if args.device == "auto" else args.device)
    )

    report_path = Path(args.run_report).resolve()
    candidate_path = Path(args.candidate_out).resolve()
    if candidate_path.exists() and not args.overwrite_candidate:
        raise ContractError(f"candidate exists; use --overwrite-candidate: {candidate_path}")
    if report_path.exists() and not args.overwrite_report:
        raise ContractError(f"run report exists; use --overwrite-report: {report_path}")

    environment_lock = verify_environment_lock(Path(args.environment_lock))

    script_path = Path(__file__).resolve()
    gate = {
        "registered_before_training_at": utc_now(),
        "min_dev_spearman": args.min_dev_spearman,
        "min_test_spearman": args.min_test_spearman,
        "min_test_spearman_delta_vs_baseline": (
            args.min_test_spearman_delta if args.baseline_predictions else None
        ),
        "candidate_export_requires_all_available_thresholds": True,
        "production_model_replacement": "forbidden by this script",
    }
    report: dict[str, Any] = {
        "schema_version": PROVENANCE_SCHEMA,
        "status": "running-dev-selection; locked test not accessed",
        "started_at": utc_now(),
        "command": [sys.executable, *sys.argv],
        "script": {
            "path": str(script_path),
            "version": SCRIPT_VERSION,
            "sha256": sha256_file(script_path),
        },
        "dataset": manifest["dataset"],
        "split_manifest": {
            "path": str(Path(args.manifest).resolve()),
            "sha256": manifest_sha256(manifest),
            "counts": manifest["counts"],
        },
        "preprocessing": manifest["preprocessing"],
        "config": {
            "seeds": args.seeds,
            "epochs": args.epochs,
            "batch_size": args.batch_size,
            "learning_rates": {
                "head_layer4": args.lr_head,
                "backbone": args.lr_backbone,
            },
            "weight_decay": args.weight_decay,
            "device": device,
            "num_workers": args.num_workers,
            "bootstrap_iterations": args.bootstrap_iterations,
        },
        "gate": gate,
        "environment": environment_context(torch, tv, environment_lock),
        "selection": None,
        "test": None,
        "export": None,
        "limitations": [
            "Connor is training/model-selection contaminated for the shipped model.",
            "Passing does not establish independent attractiveness discrimination.",
            "Browser preprocessing, subgroup, route, and stability need separate tests.",
            "A monotone REF_RAW remap cannot improve ordering metrics.",
        ],
    }
    # Durable proof that gates existed before any locked-test access.
    atomic_json(report_path, report, overwrite=args.overwrite_report)

    by_split = {
        name: [entry for entry in manifest["entries"] if entry["split"] == name]
        for name in ("train", "dev", "test")
    }
    size = int(manifest["preprocessing"]["input_size"])
    normalization = transforms.Normalize(MEAN, STD)
    train_transform = transforms.Compose(
        [
            transforms.Resize((size, size)),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(0.2, 0.2, 0.2, 0.02),
            transforms.RandomAffine(
                degrees=4, translate=(0.03, 0.03), scale=(0.95, 1.05)
            ),
            transforms.ToTensor(),
            normalization,
        ]
    )
    eval_transform = transforms.Compose(
        [transforms.Resize((size, size)), transforms.ToTensor(), normalization]
    )

    class BodyDataset(Dataset):
        def __init__(self, entries: list[dict[str, Any]], transform: Any):
            self.entries = entries
            self.transform = transform

        def __len__(self) -> int:
            return len(self.entries)

        def __getitem__(self, index: int) -> tuple[Any, Any, str]:
            entry = self.entries[index]
            path = (data_root / entry["image_relpath"]).resolve()
            try:
                path.relative_to(data_root)
            except ValueError as exc:
                raise ContractError(f"manifest path escapes data root: {path}") from exc
            image = Image.open(path).convert("RGB")
            if manifest["preprocessing"]["mode"] == "full-letterbox":
                image = letterbox_square(image)
            else:
                image = pose_crop_square(image, entry, size)
            return (
                self.transform(image),
                torch.tensor([entry["score"]], dtype=torch.float32),
                entry["image_id"],
            )

    def loader(split: str, training: bool, seed: int) -> Any:
        generator = torch.Generator().manual_seed(seed)
        return DataLoader(
            BodyDataset(
                by_split[split], train_transform if training else eval_transform
            ),
            batch_size=args.batch_size,
            shuffle=training,
            num_workers=args.num_workers,
            generator=generator,
            drop_last=False,
        )

    weights = tv.models.ResNet18_Weights.IMAGENET1K_V1
    report["model_initialization"] = initialization_context(torch, weights)

    def new_model() -> Any:
        model = tv.models.resnet18(weights=weights)
        model.fc = nn.Linear(model.fc.in_features, 1)
        return model

    def evaluate(model: Any, data_loader: Any) -> tuple[Any, Any, list[str], dict[str, Any]]:
        model.eval()
        predictions: list[float] = []
        targets: list[float] = []
        ids: list[str] = []
        with torch.no_grad():
            for images, labels, image_ids in data_loader:
                predictions.extend(
                    model(images.to(device)).detach().cpu().flatten().tolist()
                )
                targets.extend(labels.flatten().tolist())
                ids.extend(list(image_ids))
        return (
            np.asarray(predictions),
            np.asarray(targets),
            ids,
            metrics(predictions, targets, scipy_stats),
        )

    candidates: list[dict[str, Any]] = []
    for seed in args.seeds:
        random.seed(seed)
        np.random.seed(seed)
        torch.manual_seed(seed)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
        model = new_model().to(device)

        def set_trainable(full: bool) -> None:
            for name, parameter in model.named_parameters():
                parameter.requires_grad = full or name.startswith(("fc.", "layer4."))

        set_trainable(False)
        optimizer = torch.optim.AdamW(
            [
                {
                    "params": [
                        parameter
                        for name, parameter in model.named_parameters()
                        if name.startswith(("fc.", "layer4."))
                    ],
                    "lr": args.lr_head,
                },
                {
                    "params": [
                        parameter
                        for name, parameter in model.named_parameters()
                        if not name.startswith(("fc.", "layer4."))
                    ],
                    "lr": args.lr_backbone,
                },
            ],
            weight_decay=args.weight_decay,
        )
        loss_function = nn.MSELoss()
        train_loader = loader("train", True, seed)
        dev_loader = loader("dev", False, seed)
        best: dict[str, Any] | None = None
        epoch_log = []
        for epoch in range(args.epochs):
            if epoch == args.epochs // 2:
                set_trainable(True)
            model.train()
            losses = []
            for images, labels, _ in train_loader:
                images, labels = images.to(device), labels.to(device)
                optimizer.zero_grad(set_to_none=True)
                loss = loss_function(model(images), labels)
                loss.backward()
                optimizer.step()
                losses.append(float(loss.detach().cpu()))
            _, _, _, dev_metrics = evaluate(model, dev_loader)
            epoch_log.append(
                {
                    "epoch": epoch,
                    "train_mse": float(np.mean(losses)),
                    "dev": dev_metrics,
                }
            )
            rank = (
                dev_metrics["spearman"]
                if math.isfinite(dev_metrics["spearman"])
                else -math.inf
            )
            best_rank = best["rank"] if best else -math.inf
            if (
                best is None
                or rank > best_rank
                or (
                    rank == best_rank
                    and dev_metrics["rmse"] < best["metrics"]["rmse"]
                )
            ):
                best = {
                    "rank": rank,
                    "epoch": epoch,
                    "metrics": dev_metrics,
                    "state": {
                        name: value.detach().cpu().clone()
                        for name, value in model.state_dict().items()
                    },
                }
            print(
                f"[seed {seed} ep {epoch:02d}] dev "
                f"RMSE={dev_metrics['rmse']:.3f} "
                f"Pearson={dev_metrics['pearson']:.3f} "
                f"Spearman={dev_metrics['spearman']:.3f}"
            )
        if best is None:
            raise ContractError(f"seed {seed} produced no checkpoint")
        candidates.append(
            {
                "seed": seed,
                "best_epoch": best["epoch"],
                "dev": best["metrics"],
                "state": best["state"],
                "epochs": epoch_log,
            }
        )
        del model
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    selected = max(
        candidates,
        key=lambda item: (
            item["dev"]["spearman"]
            if math.isfinite(item["dev"]["spearman"])
            else -math.inf,
            -item["dev"]["rmse"],
            -item["seed"],
        ),
    )
    report["selection"] = {
        "policy": "highest dev Spearman; dev RMSE then lower seed break ties",
        "candidates": [
            {key: value for key, value in item.items() if key != "state"}
            for item in candidates
        ],
        "selected_seed": selected["seed"],
        "selected_epoch": selected["best_epoch"],
        "selected_dev": selected["dev"],
    }
    if (
        not math.isfinite(selected["dev"]["spearman"])
        or selected["dev"]["spearman"] < args.min_dev_spearman
    ):
        report["status"] = "rejected-on-dev; locked test not accessed; no ONNX exported"
        report["finished_at"] = utc_now()
        atomic_json(report_path, report, overwrite=True)
        print("[gate] REJECTED on dev; test untouched; no export")
        return 2

    selected_model = new_model()
    selected_model.load_state_dict(selected["state"])
    selected_model = selected_model.to(device).eval()
    test_access_count = 0

    def locked_test_once() -> tuple[Any, Any, list[str], dict[str, Any]]:
        nonlocal test_access_count
        if test_access_count:
            raise ContractError("locked test requested more than once")
        test_access_count += 1
        return evaluate(selected_model, loader("test", False, args.split_seed))

    test_predictions, test_targets, test_ids, test_metrics = locked_test_once()
    test_metrics["spearman_bootstrap_95ci"] = bootstrap_spearman(
        test_predictions,
        test_targets,
        scipy_stats,
        seed=args.split_seed + 991,
        iterations=args.bootstrap_iterations,
    )
    baseline = None
    if args.baseline_predictions:
        baseline_path = Path(args.baseline_predictions).resolve()
        baseline_map = load_baseline(baseline_path, test_ids)
        baseline_values = np.asarray([baseline_map[image_id] for image_id in test_ids])
        baseline = metrics(baseline_values, test_targets, scipy_stats)
        baseline.update(
            {
                "source_path": str(baseline_path),
                "source_sha256": sha256_file(baseline_path),
                "spearman_delta_candidate_minus_baseline": (
                    test_metrics["spearman"] - baseline["spearman"]
                ),
            }
        )
    report["test"] = {
        "access_count": test_access_count,
        "accessed_after_selection": True,
        "metrics": test_metrics,
        "baseline": baseline,
        "prediction_binding_sha256": sha256_bytes(
            canonical_json(
                [
                    {"image_id": image_id, "prediction": float(prediction)}
                    for image_id, prediction in zip(test_ids, test_predictions)
                ]
            ).encode()
        ),
    }

    failures = []
    if (
        not math.isfinite(test_metrics["spearman"])
        or test_metrics["spearman"] < args.min_test_spearman
    ):
        failures.append(
            f"test Spearman {test_metrics['spearman']:.4f} < {args.min_test_spearman:.4f}"
        )
    if (
        baseline is not None
        and baseline["spearman_delta_candidate_minus_baseline"]
        < args.min_test_spearman_delta
    ):
        failures.append(
            "test Spearman delta "
            f"{baseline['spearman_delta_candidate_minus_baseline']:.4f} "
            f"< {args.min_test_spearman_delta:.4f}"
        )
    if failures:
        report["status"] = "rejected-on-locked-test; no ONNX exported"
        report["gate"]["failures"] = failures
        report["finished_at"] = utc_now()
        atomic_json(report_path, report, overwrite=True)
        print("[gate] REJECTED: " + "; ".join(failures))
        return 2

    candidate_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = candidate_path.with_name(candidate_path.name + ".tmp.onnx")
    if temporary_path.exists():
        temporary_path.unlink()
    selected_model = selected_model.cpu().eval()
    # Parity uses dev inputs, not a second access to the locked test set.
    parity_loader = loader("dev", False, args.split_seed)
    parity_images, _, _ = next(iter(parity_loader))
    parity_images = parity_images[: min(args.batch_size, len(parity_images))]
    torch.onnx.export(
        selected_model,
        parity_images[:1],
        temporary_path,
        input_names=["input"],
        output_names=["score"],
        dynamic_axes={"input": {0: "batch"}, "score": {0: "batch"}},
        opset_version=12,
        dynamo=False,
    )
    try:
        session = ort.InferenceSession(
            str(temporary_path), providers=["CPUExecutionProvider"]
        )
        with torch.no_grad():
            torch_values = selected_model(parity_images).detach().cpu().numpy()
        onnx_values = session.run(
            None, {session.get_inputs()[0].name: parity_images.numpy()}
        )[0]
        np.testing.assert_allclose(
            torch_values, onnx_values, rtol=args.parity_rtol, atol=args.parity_atol
        )
        max_abs = float(np.max(np.abs(torch_values - onnx_values)))
    except Exception:
        if temporary_path.exists():
            temporary_path.unlink()
        raise
    if candidate_path.exists() and not args.overwrite_candidate:
        temporary_path.unlink()
        raise ContractError(f"candidate appeared during run: {candidate_path}")
    os.replace(temporary_path, candidate_path)
    report["status"] = (
        "candidate-exported; independent acceptance and REF_RAW regeneration required"
    )
    report["export"] = {
        "path": str(candidate_path),
        "sha256": sha256_file(candidate_path),
        "input_contract": {
            "shape": [None, 3, size, size],
            "dtype": "float32",
            "normalization": manifest["preprocessing"]["normalization"],
        },
        "pytorch_onnx_parity": {
            "split": "dev",
            "rows": len(parity_images),
            "rtol": args.parity_rtol,
            "atol": args.parity_atol,
            "max_abs": max_abs,
            "asserted": True,
        },
        "production_replacement_performed": False,
    }
    report["calibration_handoff"] = {
        "action": (
            "Regenerate body.html REF_RAW from a frozen independent, sex-balanced "
            "production-pipeline reference manifest; never from Connor train/dev/test."
        ),
        "forbidden_shortcut": (
            "Do not tune or print outMin/outMax and do not nudge anchors by eye."
        ),
        "interpretation": (
            "Reference remapping changes calibration/display only; it cannot improve "
            "rank correlation, AUC, or pairwise ordering."
        ),
    }
    report["finished_at"] = utc_now()
    atomic_json(report_path, report, overwrite=True)
    print(f"[export] staged {candidate_path}; sha256={report['export']['sha256']}")
    print(
        "[handoff] Do not replace the shipped model. Run independent browser, subgroup, "
        "route, and stability evaluation first."
    )
    print(
        "[handoff] If accepted, regenerate REF_RAW from the frozen production reference; "
        "never hand-tune outMin/outMax."
    )
    return 0


def run_dry(args: argparse.Namespace) -> int:
    manifest = build_manifest(
        synthetic_rows(),
        source_url=args.archive_url,
        archive_sha256=args.archive_sha256.lower(),
        labels_sha256=sha256_bytes(b"synthetic-labels"),
        split_seed=args.split_seed,
        dev_frac=args.dev_frac,
        test_frac=args.test_frac,
        preprocessing_mode="full-letterbox",
        crop_manifest_sha256=None,
        label_source="synthetic-labels",
        drop_headswaps=False,
    )
    report = {
        "schema_version": DRY_SCHEMA,
        "status": "validated-with-synthetic-metadata; no corpus read; no training performed",
        "script_version": SCRIPT_VERSION,
        "archive_sha256": args.archive_sha256.lower(),
        "manifest_sha256": manifest_sha256(manifest),
        "manifest": manifest,
        "invariants": {
            "connected_identity_leakage": False,
            "all_three_splits_nonempty": True,
            "manifest_precedes_training": True,
            "dev_selects_checkpoint_and_seed": True,
            "locked_test_access_limit": 1,
            "onnx_export_requires_thresholds": True,
            "shipped_model_write_forbidden": True,
            "onnx_parity_must_be_asserted": True,
        },
        "commands": {
            "prepare": (
                "python models/train_body_beauty.py --prepare-manifest "
                "--manifest data/body-training-manifest.json"
            ),
            "train": (
                "python models/train_body_beauty.py "
                "--environment-lock data/body-training-environment-lock.txt "
                "--manifest data/body-training-manifest.json "
                "--seeds 1337,2027,4099 "
                "--candidate-out models/body-beauty.candidate.onnx "
                "--run-report data/body-training-run.json"
            ),
            "smoke": "python models/train_body_beauty.py --smoke "
            "--environment-lock data/body-training-environment-lock.txt",
        },
    }
    if args.dry_run_output:
        atomic_json(Path(args.dry_run_output), report, overwrite=args.overwrite_report)
        print(f"[dry-run] PASS; wrote {Path(args.dry_run_output).resolve()}")
    else:
        print(json.dumps(report, indent=2, sort_keys=True))
    return 0


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(
        description="Train a gated Body CNN candidate from a locked identity split."
    )
    modes = result.add_mutually_exclusive_group()
    modes.add_argument(
        "--dry-run",
        action="store_true",
        help="stdlib-only deterministic contract test; no corpus or ML packages",
    )
    modes.add_argument(
        "--smoke",
        action="store_true",
        help="corpus-free asserted PyTorch/ONNX parity test",
    )
    modes.add_argument(
        "--prepare-manifest",
        action="store_true",
        help="verify corpus and lock split manifest; do not train",
    )
    result.add_argument("--data-dir", default="connor_data")
    result.add_argument("--manifest", default="data/body-training-manifest.json")
    result.add_argument(
        "--regenerate-manifest",
        action="store_true",
        help="with --prepare-manifest only, explicitly replace a changed manifest",
    )
    result.add_argument("--archive-url", default=OSF_URL)
    result.add_argument("--archive-sha256", default=OSF_ARCHIVE_SHA256)
    result.add_argument("--use-long", action="store_true")
    result.add_argument("--drop-headswaps", action="store_true")
    result.add_argument(
        "--preprocessing-mode",
        choices=("full-letterbox", "pose-crop-manifest"),
        default="full-letterbox",
    )
    result.add_argument("--pose-crop-manifest")
    result.add_argument("--split-seed", type=int, default=74021)
    result.add_argument("--dev-frac", type=float, default=0.15)
    result.add_argument("--test-frac", type=float, default=0.15)
    result.add_argument("--seeds", type=parse_seeds, default=parse_seeds("1337"))
    result.add_argument("--epochs", type=int, default=40)
    result.add_argument("--batch-size", type=int, default=16)
    result.add_argument("--lr-head", type=float, default=1e-3)
    result.add_argument("--lr-backbone", type=float, default=1e-4)
    result.add_argument("--weight-decay", type=float, default=1e-4)
    result.add_argument("--num-workers", type=int, default=0)
    result.add_argument("--device", choices=("auto", "cpu", "cuda"), default="auto")
    result.add_argument("--min-dev-spearman", type=float, default=0.30)
    result.add_argument("--min-test-spearman", type=float, default=0.30)
    result.add_argument("--min-test-spearman-delta", type=float, default=0.02)
    result.add_argument(
        "--baseline-predictions",
        help="optional locked-test image_id,prediction CSV/JSON from shipped model",
    )
    result.add_argument("--bootstrap-iterations", type=int, default=2000)
    result.add_argument("--candidate-out", default="models/body-beauty.candidate.onnx")
    result.add_argument("--run-report", default="data/body-training-run.json")
    result.add_argument(
        "--environment-lock",
        help=(
            "archived pip-freeze lock; required for training and verified against "
            "torch/torchvision/ONNX/Pillow/NumPy/SciPy/pandas"
        ),
    )
    result.add_argument("--dry-run-output")
    result.add_argument("--overwrite-candidate", action="store_true")
    result.add_argument("--overwrite-report", action="store_true")
    result.add_argument("--parity-rtol", type=float, default=1e-4)
    result.add_argument("--parity-atol", type=float, default=1e-4)
    return result


def main(argv: Iterable[str] | None = None) -> int:
    args = parser().parse_args(list(argv) if argv is not None else None)
    try:
        validate_args(args)
        if args.regenerate_manifest and not args.prepare_manifest:
            raise ContractError("--regenerate-manifest requires --prepare-manifest")
        warning = (
            FULL_LETTERBOX_WARNING
            if args.preprocessing_mode == "full-letterbox"
            else POSE_CROP_WARNING
        )
        print(f"[preprocessing] {args.preprocessing_mode}: WARNING: {warning}")
        if args.dry_run:
            return run_dry(args)
        if args.smoke:
            return run_smoke(args)
        expected_manifest, data_root = prepare_inputs(args)
        locked_manifest = lock_or_verify_manifest(
            Path(args.manifest),
            expected_manifest,
            prepare=args.prepare_manifest,
            regenerate=args.regenerate_manifest,
        )
        if args.prepare_manifest:
            print("[manifest] preparation complete; review and preserve it before training")
            return 0
        return train_candidate(args, locked_manifest, data_root)
    except ContractError as exc:
        print(f"[error] {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
