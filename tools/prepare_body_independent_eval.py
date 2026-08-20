#!/usr/bin/env python3
"""Prepare the independent Moussally body-only evaluation manifest.

The 61 copyrighted stimulus images stay in a caller-selected cache. The committed
manifest contains only factual labels, dimensions, hashes, and provenance. Valence
is the paper's mean of attractiveness, beauty, and harmony judgments; it is body-
specific human evidence, but not an attractiveness-only label.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import re
import urllib.request
import zipfile
from pathlib import Path


ARCHIVE_URL = "https://www.unige.ch/fapse/PSY/groups/upnc/BodyImageStimuli.zip"
ARCHIVE_SHA256 = "f011966cb22ef9a8625b2ffa4684a39b70b2c587468dd5ca5d56f4bab658e647"
RATINGS_URL = (
    "https://static-content.springer.com/esm/art%3A10.3758%2F"
    "s13428-016-0703-7/MediaObjects/13428_2016_703_MOESM2_ESM.pdf"
)
RATINGS_SHA256 = "967aaf5655663ce80a8c77cc63b03bd029fb815950b66f5b364dc2f2fb2ec4d7"
INFO_URL = "https://www.unige.ch/fapse/psychoclinique/download_file/view/295/338"
INFO_SHA256 = "b7ff80919364016ed55defeb26ddaee6228231f988ca9f2c6e2402840a97546d"
DOI = "10.3758/s13428-016-0703-7"
IMAGE_DIR = "Low Resolution - R = 200"  # 961x1783 pixels despite the DPI-oriented folder name.
LABEL_RE = re.compile(r"^(T\d{3}|N000|H\d{3})\s+(\d+\.\d+)\s+(\d+\.\d+)\s+", re.MULTILINE)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def download(url: str, destination: Path) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 BodyCalculatorAudit/1.0"})
    destination.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(request, timeout=120) as response, destination.open("wb") as output:
        while chunk := response.read(1024 * 1024):
            output.write(chunk)


def ensure_file(path: Path, url: str, expected_sha256: str, allow_download: bool) -> None:
    if not path.exists():
        if not allow_download:
            raise FileNotFoundError(f"missing {path}; rerun with --download")
        download(url, path)
    actual = sha256_file(path)
    if actual != expected_sha256:
        raise ValueError(f"hash mismatch for {path}: expected {expected_sha256}, got {actual}")


def safe_extract(archive: Path, destination: Path) -> None:
    destination.mkdir(parents=True, exist_ok=True)
    root = destination.resolve()
    with zipfile.ZipFile(archive) as zipped:
        for member in zipped.infolist():
            target = (destination / member.filename).resolve()
            if target != root and root not in target.parents:
                raise ValueError(f"unsafe archive path: {member.filename}")
            file_type = (member.external_attr >> 16) & 0o170000
            if file_type == 0o120000:
                raise ValueError(f"archive contains a symbolic link: {member.filename}")
        zipped.extractall(destination)


def parse_labels(ratings_pdf: Path) -> list[tuple[str, float, float]]:
    try:
        import pdfplumber
    except ImportError as error:
        raise RuntimeError("pdfplumber is required to verify the official ratings PDF") from error
    with pdfplumber.open(ratings_pdf) as document:
        text = "\n".join(page.extract_text() or "" for page in document.pages)
    labels = [(name, float(bmi), float(valence)) for name, bmi, valence in LABEL_RE.findall(text)]
    if len(labels) != 61 or len({name for name, _, _ in labels}) != 61:
        raise ValueError(f"expected 61 unique labels, extracted {len(labels)}")
    return labels


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cache", required=True, help="external cache; copyrighted images remain here")
    parser.add_argument("--out", default="data/body-independent-manifest.csv")
    parser.add_argument("--metadata-out", default="data/body-independent-manifest.meta.json")
    parser.add_argument("--download", action="store_true")
    args = parser.parse_args()

    cache = Path(args.cache).resolve()
    archive = cache / "BodyImageStimuli.zip"
    ratings = cache / "body-independent-ratings.pdf"
    info = cache / "body-stimuli-information.pdf"
    ensure_file(archive, ARCHIVE_URL, ARCHIVE_SHA256, args.download)
    ensure_file(ratings, RATINGS_URL, RATINGS_SHA256, args.download)
    ensure_file(info, INFO_URL, INFO_SHA256, args.download)

    extracted = cache / "body-image-stimuli"
    image_dir = extracted / IMAGE_DIR
    if not image_dir.exists():
        safe_extract(archive, extracted)

    try:
        from PIL import Image
    except ImportError as error:
        raise RuntimeError("Pillow is required to verify stimulus dimensions") from error

    rows = []
    for name, bmi, valence in parse_labels(ratings):
        image_path = image_dir / f"{name}.jpg"
        if not image_path.is_file():
            raise FileNotFoundError(image_path)
        with Image.open(image_path) as image:
            width, height = image.size
            image.verify()
        rows.append({
            "image_id": name,
            "filename": image_path.name,
            "attractiveness_mean": f"{valence:.2f}",
            "bmi": f"{bmi:.2f}",
            "identity_group": name,
            "body_id": name,
            "head_id": "",
            "variant": "synthetic_body_only",
            "label_sex": "f",
            "demographic_code": "synthetic",
            "label_kind": "body_specific_valence_attractiveness_beauty_harmony",
            "image_sha256": sha256_file(image_path),
            "width": width,
            "height": height,
        })

    columns = list(rows[0])
    output = Path(args.out)
    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)

    metadata = {
        "schema_version": "body-independent-manifest.v2",
        "dataset": "Moussally et al. body-only computer-generated pictures of women",
        "doi": DOI,
        "cases": len(rows),
        "source_stimuli": 61,
        "usable_labels": 61,
        "excluded_labels": [],
        "label": {
            "field": "attractiveness_mean",
            "source_name": "Valence M",
            "definition": "mean body valence from attractiveness, beauty, and harmony judgments",
            "scale": {"minimum": 1, "maximum": 9, "higher_is_more_positive": True},
            "raters": "N=77-82 young women per stimulus because of missing data",
            "body_specific": True,
            "independent_of_shipped_model": True,
            "independence": (
                "The shipped CNN was trained on Connor full-body photographs, not these 61 "
                "Moussally synthetic body-only stimuli; no result from this set selected the shipped model."
            ),
            "pairwise_gaps": [0, 0.5, 1, 2],
            "limitation": (
                "The valence aggregate includes attractiveness, beauty, and harmony and is not "
                "an attractiveness-only judgment."
            ),
        },
        "cluster": {
            "field": "identity_group",
            "definition": "Each rendered stimulus is a distinct body; resample the 61 stimuli.",
        },
        "identity": {
            "field": "body_id",
            "definition": "Each rendered stimulus appears once, so this set cannot measure multi-photo identity stability.",
        },
        "subgroup_fields": [],
        "cohort": {
            "sex": "female-presenting synthetic bodies only",
            "construction": (
                "One DAZ Genesis base model manipulated on a single thinness/fatness continuum; "
                "heads removed; white underwear and undershirt."
            ),
        },
        "limitations": [
            "Synthetic female-presenting bodies from one generated shape continuum do not represent natural photographic diversity.",
            "The dataset has no male bodies and no legitimate human demographic subgroup labels.",
            "Each body appears once, so it cannot estimate multi-photo identity stability.",
            "The body-valence aggregate is body-specific but not attractiveness-only.",
        ],
        "sources": {
            "archive": {"url": ARCHIVE_URL, "sha256": ARCHIVE_SHA256},
            "ratings_pdf": {"url": RATINGS_URL, "sha256": RATINGS_SHA256},
            "stimulus_information_pdf": {"url": INFO_URL, "sha256": INFO_SHA256},
        },
        "license": {
            "status": "copyright retained by authors",
            "restriction": "do not distribute stimuli without explicit author consent",
            "repository_policy": "no source images committed; only hashes, factual labels, and aggregates",
        },
        "selected_image_directory": IMAGE_DIR,
        "manifest_sha256": sha256_file(output),
    }
    metadata_output = Path(args.metadata_out)
    metadata_output.parent.mkdir(parents=True, exist_ok=True)
    metadata_output.write_text(json.dumps(metadata, indent=2, sort_keys=True) + "\n", encoding="utf-8", newline="\n")
    print(json.dumps({"rows": len(rows), "manifest": str(output), "sha256": metadata["manifest_sha256"]}, indent=2))


if __name__ == "__main__":
    main()
