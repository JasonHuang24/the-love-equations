"""Apply the photo worklist: re-crop keepers to 3:4, regenerate leads, delete drops.

    python tools/crop_roster_images.py --spec .roster-audit/crop-spec.json [--dry]

Spec format:
{
  "recrops": [{"path": "images/roster/x/2.jpg", "h": 0.5, "v": 0.0}],
  "leads":   [{"slug": "x", "src": "images/roster/x/3.jpg", "v": 0.0}],
  "drops":   ["images/roster/x/4.jpg"]
}

- recrop: cut to 3:4 portrait. h = horizontal anchor (0 left, 0.5 center, 1 right)
  used when the source is too wide; v = vertical anchor (0 top) when too tall.
  Result capped at 675x900, JPEG q84 progressive (site convention).
- lead: head-safe square from src, written to images/roster/{slug}.jpg and
  ROSTER_IMG repointed there if it referenced a different file. Cap 800x800.
- drop: file deleted, path surgically removed from the GALLERY_IMG and
  PHOTO_STAMP mega-lines (string surgery — never reformats the dicts).

Run tools/verify_matchmaker.py afterwards; bump ROSTER_ASSET_REV separately.
"""

import argparse
import json
import re
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import mm_data

RATIO = 3 / 4
GALLERY_CAP = (675, 900)
LEAD_CAP = (800, 800)


def crop_to_ratio(im, h_anchor=0.5, v_anchor=0.0, ratio=RATIO):
    w, h = im.size
    if w / h > ratio:  # too wide
        new_w = int(h * ratio)
        x0 = int((w - new_w) * h_anchor)
        box = (x0, 0, x0 + new_w, h)
    else:  # too tall (or exact)
        new_h = int(w / ratio)
        y0 = int((h - new_h) * v_anchor)
        box = (0, y0, w, y0 + new_h)
    return im.crop(box)


def head_safe_square(im, v_anchor=0.0):
    w, h = im.size
    side = min(w, h)
    x0 = (w - side) // 2
    y0 = int((h - side) * min(v_anchor, 1.0)) if h > side else 0
    return im.crop((x0, y0, x0 + side, y0 + side))


def save_jpeg(im, path, cap):
    im = im.convert("RGB")
    im.thumbnail(cap, Image.Resampling.LANCZOS)
    im.save(path, "JPEG", quality=84, optimize=True, progressive=True)
    return im.size


def line_span(text, const_name):
    m = re.search(rf"const {const_name} = [^\n]*", text)
    if not m:
        raise KeyError(f"const {const_name} not found")
    return m.span()


def splice(text, span, segment):
    return text[: span[0]] + segment + text[span[1] :]


def remove_path_from_text(text, rel):
    """Surgically remove a wired path from GALLERY_IMG and PHOTO_STAMP.

    Each removal is scoped to its own mega-line — a fallback pattern must
    never strike the other dict (singleton/last-element drops previously
    corrupted PHOTO_STAMP by matching there).
    """
    gspan = line_span(text, "GALLERY_IMG")
    gline = text[gspan[0] : gspan[1]]
    for pat in (f"'{rel}', ", f", '{rel}'", f"'{rel}'"):
        if pat in gline:
            gline = gline.replace(pat, "", 1)
            break
    else:
        raise KeyError(f"gallery entry not found for {rel}")
    text = splice(text, gspan, gline)

    sspan = line_span(text, "PHOTO_STAMP")
    sline = text[sspan[0] : sspan[1]]
    for pat_re in (
        rf"'{re.escape(rel)}': '[^']*', ",
        rf", '{re.escape(rel)}': '[^']*'",
    ):
        m = re.search(pat_re, sline)
        if m:
            sline = sline.replace(m.group(0), "", 1)
            break
    return splice(text, sspan, sline)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", required=True)
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()
    spec = json.loads(Path(args.spec).read_text(encoding="utf-8"))

    for job in spec.get("recrops", []):
        path = mm_data.ROOT / job["path"]
        with Image.open(path) as im:
            out = crop_to_ratio(im, job.get("h", 0.5), job.get("v", 0.0))
            if args.dry:
                print(f"[dry] recrop {job['path']} {im.size} -> {out.size}")
                continue
            w, h = save_jpeg(out, path, GALLERY_CAP)
        print(f"recrop {job['path']} -> {w}x{h}")
        if w < 250:
            print(f"  ! WARNING {job['path']} is only {w}px wide after crop")

    for job in spec.get("leads", []):
        src = mm_data.ROOT / job["src"]
        dst = mm_data.ROSTER_DIR / f"{job['slug']}.jpg"
        with Image.open(src) as im:
            out = head_safe_square(im, job.get("v", 0.0))
            if args.dry:
                print(f"[dry] lead {job['slug']} from {job['src']} {im.size} -> {out.size}")
                continue
            w, h = save_jpeg(out, dst, LEAD_CAP)
        print(f"lead {job['slug']} <- {job['src']} -> {w}x{h}")

    drops = spec.get("drops", [])
    if drops and not args.dry:
        text = mm_data.MATCHMAKER.read_text(encoding="utf-8")
        for rel in drops:
            text = remove_path_from_text(text, rel)
            f = mm_data.ROOT / rel
            if f.is_file():
                f.unlink()
            print(f"drop {rel}")
        mm_data.MATCHMAKER.write_text(text, encoding="utf-8", newline="\n")
    elif drops:
        for rel in drops:
            print(f"[dry] drop {rel}")

    # repoint ROSTER_IMG for regenerated leads whose entry used a gallery file
    if not args.dry:
        text = mm_data.MATCHMAKER.read_text(encoding="utf-8")
        for job in spec.get("leads", []):
            slug = job["slug"]
            m = re.search(rf"'{slug}':'([^']+)'", text)
            want = f"images/roster/{slug}.jpg"
            if m and m.group(1) != want:
                text = text.replace(f"'{slug}':'{m.group(1)}'", f"'{slug}':'{want}'", 1)
                print(f"repoint ROSTER_IMG {slug}: {m.group(1)} -> {want}")
        mm_data.MATCHMAKER.write_text(text, encoding="utf-8", newline="\n")

    print("done")


if __name__ == "__main__":
    main()
