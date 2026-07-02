"""Wire curated candidate photos into the roster: crop, number, move, wire.

    python tools/wire_roster_candidates.py --picks .roster-audit/picks.json [--dry]

Picks format (per entry):
{
  "slug": "rebel-wilson",
  "src": ".roster-audit/candidates/rebel-wilson/tmdb-3.jpg",
  "h": 0.5,                  # optional 3:4 crop anchor (default center)
  "stamp": true,             # 'visual match, unverified' caption
  "source": "https://www.themoviedb.org/person/221581-rebel-wilson",
  "lead": false              # also regenerate the lead from this photo
}

Behavior: crop to 3:4 (h anchor, top-biased), save as images/roster/{slug}/{n}.jpg
with n continuing from the highest existing index; append to the slug's
GALLERY_IMG array; add PHOTO_STAMP entry when stamp is true; append a credits
row; leads additionally get a head-safe square written to images/roster/{slug}.jpg.
All mega-line edits are scoped string surgery (no dict re-emission).
"""

import argparse
import json
import re
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import mm_data
from crop_roster_images import crop_to_ratio, head_safe_square, save_jpeg, GALLERY_CAP, LEAD_CAP

CREDITS = mm_data.ROOT / "md" / "roster-image-credits.md"
STAMP_TEXT = "visual match, unverified"


def gallery_append(text, slug, rel):
    m = re.search(rf"'{slug}': \[[^\]]*\]", text)
    if not m:
        raise KeyError(f"GALLERY_IMG entry not found for {slug}")
    seg = m.group(0)
    new_seg = (
        seg[:-1] + (", " if not seg.endswith("[]") else "") + f"'{rel}'" + "]"
    ).replace("[, ", "[")
    return text[: m.start()] + new_seg + text[m.end() :]


def stamp_append(text, rel):
    m = re.search(r"const PHOTO_STAMP = \{[^\n]*\};", text)
    if not m:
        raise KeyError("PHOTO_STAMP line not found")
    line = m.group(0)
    new_line = line[: -len("};")] + f", '{rel}': '{STAMP_TEXT}'" + "};"
    return text[: m.start()] + new_line + text[m.end() :]


def next_index(slug):
    folder = mm_data.ROSTER_DIR / slug
    folder.mkdir(exist_ok=True)
    mx = 0
    for f in folder.iterdir():
        m = re.fullmatch(r"(\d+)\.jpg", f.name)
        if m:
            mx = max(mx, int(m.group(1)))
    return mx + 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--picks", required=True)
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()
    picks = json.loads(Path(args.picks).read_text(encoding="utf-8"))

    text = mm_data.MATCHMAKER.read_text(encoding="utf-8")
    credit_rows = []
    counters = {}
    for pick in picks:
        slug = pick["slug"]
        src = mm_data.ROOT / pick["src"]
        n = counters.get(slug) or next_index(slug)
        counters[slug] = n + 1
        rel = f"images/roster/{slug}/{n}.jpg"
        if args.dry:
            print(f"[dry] {pick['src']} -> {rel}" + (" +lead" if pick.get("lead") else ""))
            continue
        with Image.open(src) as im:
            out = crop_to_ratio(im, pick.get("h", 0.5), 0.0)
            w, h = save_jpeg(out, mm_data.ROOT / rel, GALLERY_CAP)
        text = gallery_append(text, slug, rel)
        if pick.get("stamp", True):
            text = stamp_append(text, rel)
        credit_rows.append(
            ("gallery", slug, str(n), pick.get("source", ""), pick.get("stamp", True))
        )
        print(f"wired {rel} ({w}x{h})")
        if pick.get("lead"):
            with Image.open(src) as im:
                out = head_safe_square(im, pick.get("lead_v", 0.0))
                save_jpeg(out, mm_data.ROSTER_DIR / f"{slug}.jpg", LEAD_CAP)
            want = f"images/roster/{slug}.jpg"
            m = re.search(rf"'{slug}':'([^']+)'", text)
            if m and m.group(1) != want:
                text = text.replace(f"'{slug}':'{m.group(1)}'", f"'{slug}':'{want}'", 1)
            credit_rows.append(("avatar", slug, "lead", pick.get("source", ""), pick.get("stamp", True)))
            print(f"lead {slug} regenerated from {pick['src']}")

    if not args.dry:
        mm_data.MATCHMAKER.write_text(text, encoding="utf-8", newline="\n")
        rows = [
            f"| {kind} | {slug} | {slot} | [{'TMDB' if 'themoviedb' in src else 'source'}]({src})"
            f"{' · unverified stamp' if stamp else ''} |"
            for kind, slug, slot, src, stamp in credit_rows
        ]
        head = (
            "\n## 2026-07-02 audit quota fill\n\n"
            "Quota fill from the matchmaker quality audit: TMDB profile-image portraits "
            "(stamped `visual match, unverified`) plus Wikimedia fallbacks; curated on "
            "contact sheets, cropped 3:4.\n\n| Kind | Profile | Slot | Source |\n| --- | --- | --- | --- |\n"
        )
        txt = CREDITS.read_text(encoding="utf-8").rstrip()
        if "## 2026-07-02 audit quota fill" not in txt:
            txt += head
        else:
            txt += "\n"
        txt += "\n".join(rows) + "\n"
        CREDITS.write_text(txt, encoding="utf-8", newline="\n")
        print(f"credits: {len(credit_rows)} rows appended")


if __name__ == "__main__":
    main()
