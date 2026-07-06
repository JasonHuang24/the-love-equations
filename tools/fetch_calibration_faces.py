"""Fetch the SCUT-FBP5500 face-beauty CALIBRATION set for the Face Calculator.

This is local tooling, NOT site content: it seeds ``images/calibration-scut/`` (gitignored) with the public
SCUT-FBP5500 research dataset (5500 frontal faces, each with the mean of 60 human beauty ratings on a 1-5
scale, across four subsets: Asian-Female AF, Asian-Male AM, Caucasian-Female CF, Caucasian-Male CM). It is
used to calibrate the Face Calc's MODEL_CONFIG.outMin/outMax anchors against the shipped browser pipeline —
mirroring the images/calibration/ pattern from tools/fetch_calibration_bodies.py.

Dataset: SCUT-FBP5500 v2 (Liang et al., 2018, arXiv:1801.06345). Non-commercial research use only.
Source: https://github.com/HCIILAB/SCUT-FBP5500-Database-Release (Google Drive zip, ~172 MB).

Outputs under images/calibration-scut/:
    Images/            5500 original jpgs (original filenames, e.g. AF1.jpg, CM750.jpg)
    All_labels.txt     canonical <filename> <mean_rating> table copied verbatim from the dataset
    labels.csv         built table: filename,mean_rating,subset  (subset from the AF/AM/CF/CM prefix)

Usage:
    python tools/fetch_calibration_faces.py            # download + extract + build labels.csv
    python tools/fetch_calibration_faces.py --skip-download   # re-extract from an already-downloaded zip
"""

import argparse
import csv
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CAL_DIR = ROOT / "images" / "calibration-scut"
IMAGES_DIR = CAL_DIR / "Images"
LABELS_TXT = CAL_DIR / "All_labels.txt"
LABELS_CSV = CAL_DIR / "labels.csv"

GDRIVE_ID = "1w0TorBfTIqbquQVd6k3h_77ypnrvfGwf"   # SCUT-FBP5500_v2.zip, per the official GitHub README
ZIP_PATH = CAL_DIR / "SCUT-FBP5500_v2.zip"

for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass

SUBSET_RE = re.compile(r"^([A-Za-z]+)\d")   # leading letters before the first digit → subset code (AF/AM/CF/CM)


def ensure_gitignore():
    gi = ROOT / ".gitignore"
    entry = "images/calibration-scut/"
    text = gi.read_text(encoding="utf-8") if gi.exists() else ""
    if any(line.strip() == entry for line in text.splitlines()):
        return
    block = ("" if text.endswith("\n") or not text else "\n") + \
        "\n# Face Calc calibration set (SCUT-FBP5500 research dataset; local tooling, not site content)\n" + entry + "\n"
    gi.write_text(text + block, encoding="utf-8")
    print(f"[gitignore] added {entry}")


def download():
    import gdown
    CAL_DIR.mkdir(parents=True, exist_ok=True)
    if ZIP_PATH.exists() and ZIP_PATH.stat().st_size > 100 * 1024 * 1024:
        print(f"[download] zip already present ({ZIP_PATH.stat().st_size // (1024*1024)} MB), skipping")
        return
    print(f"[download] SCUT-FBP5500 zip from Google Drive id={GDRIVE_ID} …")
    gdown.download(id=GDRIVE_ID, output=str(ZIP_PATH), quiet=False)
    print(f"[download] wrote {ZIP_PATH} ({ZIP_PATH.stat().st_size // (1024*1024)} MB)")


def extract():
    """Extract Images/*.jpg and All_labels.txt from the zip, tolerant of the top-level folder name."""
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ZIP_PATH) as z:
        names = z.namelist()
        # images: any entry under a .../Images/ dir ending .jpg/.png
        img_entries = [n for n in names if re.search(r"/Images/[^/]+\.(jpe?g|png)$", n, re.I)]
        if not img_entries:  # some releases flatten differently; fall back to any jpg with an AF/AM/CF/CM stem
            img_entries = [n for n in names if re.search(r"/(AF|AM|CF|CM)\d+\.(jpe?g|png)$", n, re.I)]
        label_entries = [n for n in names if n.lower().endswith("all_labels.txt")]
        print(f"[extract] {len(img_entries)} image entries, {len(label_entries)} label file(s) in zip")
        if not img_entries or not label_entries:
            raise SystemExit(f"[extract] FATAL: expected Images/*.jpg and All_labels.txt; got "
                             f"{len(img_entries)} imgs / {len(label_entries)} labels. Zip top-level: "
                             f"{sorted(set(n.split('/')[0] for n in names))[:5]}")
        written = 0
        for n in img_entries:
            base = Path(n).name
            dest = IMAGES_DIR / base
            if dest.exists() and dest.stat().st_size > 0:
                continue
            with z.open(n) as src:
                dest.write_bytes(src.read())
            written += 1
        print(f"[extract] wrote {written} new image(s) (total {len(list(IMAGES_DIR.glob('*')))} on disk)")
        with z.open(label_entries[0]) as src:
            LABELS_TXT.write_bytes(src.read())
        print(f"[extract] wrote {LABELS_TXT.name}")


def build_labels_csv():
    rows = []
    subset_counts = {}
    for line in LABELS_TXT.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line:
            continue
        parts = line.split()
        if len(parts) < 2:
            continue
        fname, score = parts[0], parts[1]
        try:
            score = float(score)
        except ValueError:
            continue
        m = SUBSET_RE.match(fname)
        subset = m.group(1).upper() if m else "?"
        subset_counts[subset] = subset_counts.get(subset, 0) + 1
        rows.append({"filename": fname, "mean_rating": f"{score:.6f}", "subset": subset})
    rows.sort(key=lambda r: r["filename"])
    with LABELS_CSV.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["filename", "mean_rating", "subset"])
        w.writeheader()
        w.writerows(rows)
    print(f"[labels] wrote {LABELS_CSV.name}: {len(rows)} rows; by subset: "
          + ", ".join(f"{k}={v}" for k, v in sorted(subset_counts.items())))
    # sanity: every labelled file should exist on disk
    missing = [r["filename"] for r in rows if not (IMAGES_DIR / r["filename"]).exists()]
    if missing:
        print(f"[labels] WARNING: {len(missing)} labelled image(s) missing on disk, e.g. {missing[:5]}")
    else:
        print(f"[labels] all {len(rows)} labelled images present on disk ✓")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-download", action="store_true", help="re-extract from an already-downloaded zip")
    args = ap.parse_args()
    ensure_gitignore()
    if not args.skip_download:
        download()
    extract()
    build_labels_csv()
    print("[done] calibration-scut ready.")


if __name__ == "__main__":
    main()
