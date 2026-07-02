"""Read-only inventory of roster images vs the wiring in matchmaker.html.

    python tools/audit_roster_images.py            # inventory.json + summary
    python tools/audit_roster_images.py --sheets   # + one contact sheet per member
    python tools/audit_roster_images.py --sheets --slugs rebel-wilson,adele

Outputs land in .roster-audit/ (untracked scratch): inventory.json and
sheets/{slug}.jpg. Sheets show the lead avatar, every wired gallery shot in
order, and any orphan disk files, each labeled with filename, WxH, aspect and
stamp status — sized for review at a glance.
"""

import argparse
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import mm_data

AUDIT_DIR = mm_data.ROOT / ".roster-audit"
THUMB = (240, 300)  # tile box (w, h)
LABEL_H = 34
PAD = 8
COLS = 4


def font(size=13):
    try:
        return ImageFont.truetype("C:/Windows/Fonts/arial.ttf", size)
    except OSError:
        return ImageFont.load_default()


def img_info(rel):
    path = mm_data.ROOT / rel
    if not path.is_file():
        return {"path": rel, "exists": False}
    try:
        with Image.open(path) as im:
            w, h = im.size
    except OSError:
        return {"path": rel, "exists": True, "error": "unreadable"}
    return {
        "path": rel,
        "exists": True,
        "w": w,
        "h": h,
        "ar": round(w / h, 2),
        "kb": round(path.stat().st_size / 1024, 1),
    }


def build_inventory(data):
    gal_map = data["GALLERY_IMG"]
    img_map = data["ROSTER_IMG"]
    stamps = data["PHOTO_STAMP"]
    members = []
    for c in data["ROSTER"]:
        slug = c["slug"]
        prof = data["PROFILES"].get(slug, {})
        p_looks = (prof.get("traits", {}).get("looks") or {}).get("s")
        wired = list(gal_map.get(slug, []))
        folder = mm_data.ROSTER_DIR / slug
        disk = (
            sorted(
                f"images/roster/{slug}/{p.name}" for p in folder.iterdir() if p.is_file()
            )
            if folder.is_dir()
            else []
        )
        orphans = [p for p in disk if p not in wired and p != img_map.get(slug)]
        gallery = []
        for p in wired:
            info = img_info(p)
            info["stamp"] = stamps.get(p)
            gallery.append(info)
        members.append(
            {
                "slug": slug,
                "name": c["name"],
                "sex": c["g"],
                "fictional": bool(c.get("fictional")),
                "build": c.get("build"),
                "born": c.get("born") or c.get("bornYear"),
                "career": c.get("career"),
                "roster_looks": c.get("looks"),
                "profile_looks": p_looks,
                "looks_delta": (
                    round(c.get("looks") - p_looks, 2)
                    if isinstance(p_looks, (int, float))
                    else None
                ),
                "lead": {**img_info(img_map.get(slug, "")), "wired": slug in img_map},
                "gallery": gallery,
                "disk_orphans": orphans,
                "gallery_count": len(wired),
                "quota_gap": max(0, 5 - len(wired)),
            }
        )
    return members


def summarize(members):
    hist = {}
    for m in members:
        hist[m["gallery_count"]] = hist.get(m["gallery_count"], 0) + 1
    landscape = sum(
        1 for m in members for g in m["gallery"] if g.get("ar", 0) > 1.15
    )
    square = sum(
        1 for m in members for g in m["gallery"] if 0.9 <= g.get("ar", 9) <= 1.15
    )
    tall = sum(1 for m in members for g in m["gallery"] if g.get("ar", 9) < 0.5)
    tiny = sum(1 for m in members for g in m["gallery"] if g.get("w", 9999) < 300)
    print(f"members: {len(members)}")
    print(f"gallery-count histogram: {dict(sorted(hist.items()))}")
    print(f"below quota (<5): {sum(1 for m in members if m['quota_gap'])}  "
          f"slots to fill: {sum(m['quota_gap'] for m in members)}")
    print(f"geometry: {landscape} landscape (ar>1.15), {square} square-ish, "
          f"{tall} ultra-tall (ar<0.5), {tiny} under 300px wide")
    orphans = [(m["slug"], o) for m in members for o in m["disk_orphans"]]
    print(f"disk orphans: {len(orphans)} {orphans[:6]}")
    deltas = [
        (m["slug"], m["roster_looks"], m["profile_looks"])
        for m in members
        if m["looks_delta"]
    ]
    print(f"ROSTER.looks != PROFILES.looks.s: {len(deltas)} {deltas[:8]}")
    missing = [
        g["path"] for m in members for g in m["gallery"] if not g["exists"]
    ] + [m["lead"]["path"] for m in members if not m["lead"].get("exists")]
    print(f"wired-but-missing files: {len(missing)} {missing[:6]}")


def tile(canvas, draw, info, tag, x, y, fnt):
    box_w, box_h = THUMB
    label = Path(info["path"]).name if info.get("path") else "(none)"
    if info.get("exists"):
        with Image.open(mm_data.ROOT / info["path"]) as im:
            im = im.convert("RGB")
            im.thumbnail((box_w, box_h))
            canvas.paste(im, (x + (box_w - im.width) // 2, y + (box_h - im.height) // 2))
        meta = f"{info['w']}x{info['h']} ar{info['ar']}"
    else:
        meta = "MISSING"
    stamp = " ·unv" if info.get("stamp") else ""
    draw.rectangle([x, y, x + box_w, y + box_h], outline=(120, 120, 120))
    draw.text((x + 2, y + box_h + 2), f"{tag} {label}", fill=(0, 0, 0), font=fnt)
    draw.text((x + 2, y + box_h + 17), meta + stamp, fill=(90, 90, 90), font=fnt)


def sheet(member, out_dir):
    items = [({**member["lead"]}, "LEAD")]
    items += [(g, f"#{i+1}") for i, g in enumerate(member["gallery"])]
    items += [(img_info(o), "ORPHAN") for o in member["disk_orphans"]]
    rows = (len(items) + COLS - 1) // COLS
    w = COLS * (THUMB[0] + PAD) + PAD
    h = 46 + rows * (THUMB[1] + LABEL_H + PAD)
    canvas = Image.new("RGB", (w, h), (248, 246, 243))
    draw = ImageDraw.Draw(canvas)
    fnt = font(13)
    head = (
        f"{member['name']}  [{member['slug']}]  {member['sex']}  "
        f"build:{member['build']}  born:{member['born']}  "
        f"looks R:{member['roster_looks']}/P:{member['profile_looks']}"
        + ("  FICTIONAL" if member["fictional"] else "")
    )
    draw.text((PAD, 8), head, fill=(0, 0, 0), font=font(16))
    for idx, (info, tag) in enumerate(items):
        x = PAD + (idx % COLS) * (THUMB[0] + PAD)
        y = 46 + (idx // COLS) * (THUMB[1] + LABEL_H + PAD)
        tile(canvas, draw, info, tag, x, y, fnt)
    out = out_dir / f"{member['slug']}.jpg"
    canvas.save(out, "JPEG", quality=80)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sheets", action="store_true")
    ap.add_argument("--slugs", help="comma-separated filter")
    args = ap.parse_args()

    data = mm_data.load_data()
    members = build_inventory(data)
    AUDIT_DIR.mkdir(exist_ok=True)
    (AUDIT_DIR / "inventory.json").write_text(
        json.dumps(members, indent=1), encoding="utf-8", newline="\n"
    )
    summarize(members)

    if args.sheets:
        out_dir = AUDIT_DIR / "sheets"
        out_dir.mkdir(exist_ok=True)
        wanted = set(args.slugs.split(",")) if args.slugs else None
        n = 0
        for m in members:
            if wanted and m["slug"] not in wanted:
                continue
            sheet(m, out_dir)
            n += 1
        print(f"sheets written: {n} -> {out_dir}")


if __name__ == "__main__":
    main()
