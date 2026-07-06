"""Fetch a body-calculator CALIBRATION set from Wikimedia Commons + Openverse.

This is local tooling, NOT site content: it seeds ``images/calibration/`` (gitignored) with candidate
full-body photos to calibrate / validate the Body Calc against real-world shots. The query list is deliberately
tilted AGAINST the fit-and-posed skew of stock body photography — mixed builds, casual/amateur snapshots, mixed
lighting, both sexes, plain standing front-facing frames — plus a small ``stress/`` subset (seated, cropped,
two-person) the calculator is expected to REFUSE or flag rather than score.

Modeled on tools/fetch_roster_commons_images.py and tools/fetch_openverse_roster_candidates.py — same API,
attribution, and PIL-validation patterns. Every saved image carries a logged license in
``images/calibration/credits.md`` (roster-credits format); anything without a determinable license is skipped.

Usage:
    python tools/fetch_calibration_bodies.py --dry-run              # list candidates + licenses, download nothing
    python tools/fetch_calibration_bodies.py --limit 3              # up to 3 images per query
    python tools/fetch_calibration_bodies.py --only commons         # one source
    python tools/fetch_calibration_bodies.py --queries mixed-build-man athletic-woman
"""

import argparse
import hashlib
import html
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

# Windows consoles default to cp1252, which can't encode the licenses/authors/arrows we print — force UTF-8.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001 — older/oddly-wrapped streams; prints just fall back to ASCII-safe text
        pass

ROOT = Path(__file__).resolve().parents[1]
CAL_DIR = ROOT / "images" / "calibration"
STRESS_DIR = CAL_DIR / "stress"
CREDITS = CAL_DIR / "credits.md"
MANIFEST = CAL_DIR / "manifest.json"

UA = "TheLoveEquationsCalibrationFetcher/1.0 (local static-site model calibration)"
REQUEST_DELAY_SECONDS = float(os.environ.get("CAL_FETCH_REQUEST_DELAY", "1.5"))
QUERY_DELAY_SECONDS = float(os.environ.get("CAL_FETCH_QUERY_DELAY", "3"))

# Openverse changed hosts over time; try the current one first, fall back to the legacy host.
OPENVERSE_HOSTS = ["https://api.openverse.org", "https://api.openverse.engineering"]

# Candidate acceptance filters (spec §3).
MIN_BYTES = 200 * 1024
MAX_BYTES = 4 * 1024 * 1024
MIN_SHORT_SIDE = 500
# Full-body frames read taller-than-wide; a very wide frame is almost never a usable standing full-body shot.
# Soft on stress rows (a two-person / seated frame may be landscape).
MAX_ASPECT_W_OVER_H = 1.40

# Commons titles that are structurally not a real person photo.
BAD_TITLE = (
    "logo", "signature", "autograph", "poster", "cover", "album", "diagram", "chart",
    "svg", "icon", "symbol", "map", "anatomy", "sculpture", "statue", "drawing",
    "illustration", "painting", "mannequin", "silhouette", "x-ray", "xray", "skeleton",
)

# ── Query set ──────────────────────────────────────────────────────────────────────────────────────────────
# Each entry: slug (filename stem + credits grouping), query (API search), sources, stress (→ stress/ subdir).
# Deliberately seeded to fight the fit/posed skew: mixed builds, casual/amateur, mixed lighting, both sexes,
# standing + front-facing. Tune freely — this list IS the calibration strategy.
QUERIES = [
    # --- everyday standing front-facing, both sexes, mixed builds ---
    {"slug": "standing-man-casual",     "query": "man standing full length casual clothes",   "sources": ["commons", "openverse"]},
    {"slug": "standing-woman-casual",   "query": "woman standing full length casual clothes",  "sources": ["commons", "openverse"]},
    {"slug": "average-build-man",       "query": "average build man full body standing",       "sources": ["commons", "openverse"]},
    {"slug": "average-build-woman",     "query": "average build woman full body standing",     "sources": ["commons", "openverse"]},
    {"slug": "overweight-person",       "query": "overweight person full body standing",       "sources": ["commons", "openverse"]},
    {"slug": "plus-size-person",        "query": "plus size person full length photo",          "sources": ["commons", "openverse"]},
    {"slug": "slim-person",             "query": "slim person full body standing",              "sources": ["commons", "openverse"]},
    {"slug": "athletic-person",         "query": "athletic person full body standing",          "sources": ["commons", "openverse"]},
    {"slug": "elderly-standing",        "query": "elderly person standing full length",         "sources": ["commons", "openverse"]},
    # --- amateur / candid / mixed lighting ---
    {"slug": "candid-street-person",    "query": "candid full length person street snapshot",   "sources": ["commons", "openverse"]},
    {"slug": "amateur-indoor-lowlight", "query": "person full body indoor dim light snapshot",  "sources": ["commons", "openverse"]},
    {"slug": "outdoor-daylight-person", "query": "person full length outdoor daylight casual",  "sources": ["commons", "openverse"]},
    # --- stress subset: the calculator should refuse / flag these, not score them cleanly ---
    {"slug": "seated-person",           "query": "person sitting full body on chair",           "sources": ["commons", "openverse"], "stress": True},
    {"slug": "cropped-waist-up",        "query": "waist up portrait person cropped",            "sources": ["commons", "openverse"], "stress": True},
    {"slug": "two-people-standing",     "query": "two people standing together full length",    "sources": ["commons", "openverse"], "stress": True},
]


def fetch_json(url, host_ok=None):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as res:
        return json.load(res)


def fetch_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as res:
        return res.read()


def strip_tags(s):
    s = re.sub(r"<[^>]*>", "", s or "")
    return html.unescape(s).replace("\n", " ").strip()


def aspect_ok(width, height, stress):
    if not width or not height:
        return True  # unknown → decide after download
    if stress:
        return True
    return (width / height) <= MAX_ASPECT_W_OVER_H


# ── Wikimedia Commons ────────────────────────────────────────────────────────────────────────────────────
def search_commons(query, want):
    """Return up to `want` license-carrying candidates: dicts with url/source/author/license/dims/size."""
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": 6,
        "gsrsearch": query,
        "gsrlimit": 24,
        "prop": "imageinfo",
        "iiprop": "url|mime|size|extmetadata",
        "iiurlwidth": 1400,
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    data = fetch_json(url)
    pages = list((data.get("query", {}).get("pages") or {}).values())
    pages.sort(key=lambda p: p.get("index", 999))
    out = []
    for p in pages:
        title = p.get("title", "")
        low = title.lower()
        if any(x in low for x in BAD_TITLE):
            continue
        ii = (p.get("imageinfo") or [{}])[0]
        if ii.get("mime") not in ("image/jpeg", "image/png"):
            continue
        w, h = ii.get("width"), ii.get("height")
        if w and h and min(w, h) < MIN_SHORT_SIDE:
            continue
        meta = ii.get("extmetadata") or {}
        license_name = strip_tags((meta.get("LicenseShortName") or {}).get("value", ""))
        author = strip_tags((meta.get("Artist") or {}).get("value", "")) or "Unknown"
        if not license_name:
            continue  # NO image without a logged license
        out.append({
            "source_name": "Commons",
            "download_url": ii.get("thumburl") or ii.get("url"),
            "page_url": ii.get("descriptionurl") or ii.get("url"),
            "author": author,
            "license": license_name,
            "width": ii.get("thumbwidth") or w,
            "height": ii.get("thumbheight") or h,
            "title": title,
        })
        if len(out) >= want:
            break
    return out


# ── Openverse (CC-licensed only) ─────────────────────────────────────────────────────────────────────────
def query_openverse(query, want):
    params = urllib.parse.urlencode({"q": query, "license_type": "commercial", "page_size": max(want * 2, 8)})
    results, last_err = None, None
    for host in OPENVERSE_HOSTS:
        try:
            results = fetch_json(host + "/v1/images/?" + params).get("results", [])
            break
        except Exception as exc:  # noqa: BLE001 — network host may be down; try the next
            last_err = exc
            continue
    if results is None:
        print(f"    ! openverse unreachable ({last_err})")
        return []
    out = []
    for r in results:
        lic = r.get("license")
        if not lic:
            continue  # NO image without a logged license
        image_url = r.get("url") or r.get("thumbnail")
        if not image_url:
            continue
        lic_full = lic.upper() + (" " + r["license_version"] if r.get("license_version") else "")
        out.append({
            "source_name": "Openverse/" + (r.get("source") or "?"),
            "download_url": image_url,
            "page_url": r.get("foreign_landing_url") or image_url,
            "author": r.get("creator") or "Unknown",
            "license": "CC " + lic_full,
            "width": r.get("width"),
            "height": r.get("height"),
            "title": r.get("title") or query,
        })
        if len(out) >= want:
            break
    return out


# ── validation + save ────────────────────────────────────────────────────────────────────────────────────
def validate_and_ext(raw, stress):
    """Return the file extension if raw passes the filters, else None (with a printed reason)."""
    if not (MIN_BYTES <= len(raw) <= MAX_BYTES):
        return None, f"bytes {len(raw)//1024}KB out of [200KB,4MB]"
    try:
        im = Image.open(io.BytesIO(raw))
        im.verify()
        im = Image.open(io.BytesIO(raw))
        fmt = (im.format or "").upper()
        w, h = im.size
    except Exception as exc:  # noqa: BLE001
        return None, f"unreadable ({exc})"
    if fmt not in ("JPEG", "PNG"):
        return None, f"format {fmt} not JPEG/PNG"
    if min(w, h) < MIN_SHORT_SIDE:
        return None, f"short side {min(w, h)}px < {MIN_SHORT_SIDE}"
    if not aspect_ok(w, h, stress):
        return None, f"aspect {w}x{h} too wide for a full-body frame"
    return (".png" if fmt == "PNG" else ".jpg"), None


def load_manifest():
    if MANIFEST.exists():
        try:
            return json.loads(MANIFEST.read_text(encoding="utf-8"))
        except Exception:  # noqa: BLE001
            return {}
    return {}


def write_manifest(man):
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(dict(sorted(man.items())), indent=2) + "\n", encoding="utf-8")


def write_credits(man):
    """Regenerate credits.md from the manifest (roster-credits table format). Idempotent, no dup rows."""
    lines = [
        "# Body Calc calibration image credits",
        "",
        "Local calibration / validation set for the Body Calculator (`body.html`). These are **not site content** —",
        "`images/calibration/` is gitignored; the files exist only to score the calculator against real-world",
        "full-body photos. Sourced from Wikimedia Commons and Openverse (CC-licensed); every file below carries a",
        "logged license. Anything without a determinable license was skipped rather than saved.",
        "",
        "The `stress/` subset (seated, cropped, two-person) is included on purpose: the calculator is expected to",
        "**refuse or flag** those, not score them cleanly.",
        "",
        "| Filename | Author | License | Source |",
        "| --- | --- | --- | --- |",
    ]
    for fname in sorted(man):
        e = man[fname]
        lines.append(f"| `{fname}` | {e.get('author', 'Unknown')} | {e.get('license', '?')} | [{e.get('source_name', 'source')}]({e.get('page_url', '')}) |")
    lines.append("")
    CAL_DIR.mkdir(parents=True, exist_ok=True)
    CREDITS.write_text("\n".join(lines), encoding="utf-8")


def ensure_gitignore():
    gi = ROOT / ".gitignore"
    entry = "images/calibration/"
    text = gi.read_text(encoding="utf-8") if gi.exists() else ""
    if any(line.strip() == entry for line in text.splitlines()):
        return
    block = ("" if text.endswith("\n") or not text else "\n") + "\n# Body Calc calibration set (local tooling, not site content)\n" + entry + "\n"
    gi.write_text(text + block, encoding="utf-8")
    print(f"[gitignore] added {entry}")


def dest_dir(entry):
    return STRESS_DIR if entry.get("stress") else CAL_DIR


def main():
    parser = argparse.ArgumentParser(description="Fetch a Body Calc calibration set from Commons + Openverse.")
    parser.add_argument("--limit", type=int, default=5, help="max images to DOWNLOAD per query (default 5)")
    parser.add_argument("--dry-run", action="store_true", help="list candidates + licenses, download nothing")
    parser.add_argument("--only", choices=["commons", "openverse"], help="restrict to one source")
    parser.add_argument("--queries", nargs="+", help="only run these query slugs")
    args = parser.parse_args()

    selected = [q for q in QUERIES if not args.queries or q["slug"] in set(args.queries)]
    if not selected:
        print("no matching query slugs; available: " + ", ".join(q["slug"] for q in QUERIES))
        return

    if not args.dry_run:
        CAL_DIR.mkdir(parents=True, exist_ok=True)
        STRESS_DIR.mkdir(parents=True, exist_ok=True)
        ensure_gitignore()

    manifest = load_manifest()
    downloaded = 0
    listed = 0

    for entry in selected:
        slug, query = entry["slug"], entry["query"]
        sources = [s for s in entry["sources"] if not args.only or s == args.only]
        tag = " [stress]" if entry.get("stress") else ""
        print(f"\n[query] {slug}{tag}: {query!r}  (sources: {', '.join(sources) or 'none'})")

        candidates = []
        for src in sources:
            try:
                found = search_commons(query, args.limit) if src == "commons" else query_openverse(query, args.limit)
            except Exception as exc:  # noqa: BLE001
                print(f"    ! {src} search failed: {exc}")
                found = []
            for c in found:
                c["stress"] = entry.get("stress", False)
            candidates.extend(found)
            time.sleep(REQUEST_DELAY_SECONDS)

        if not candidates:
            print("    - no license-carrying candidates")
            continue

        got = 0
        for idx, c in enumerate(candidates, start=1):
            if got >= args.limit:
                break
            dims = f"{c.get('width') or '?'}x{c.get('height') or '?'}"
            if args.dry_run:
                listed += 1
                print(f"    - {c['source_name']:>18} | {c['license']:<14} | {dims:>10} | {c['author'][:28]:<28} | {c['page_url']}")
                got += 1
                continue

            # IDENTITY-stable filename: hash the source page (falling back to the download URL), NOT the positional
            # slot. This keeps idempotency order-independent — a changed search order/count (or a source going
            # briefly unreachable) can't re-download the same photo under a new name or dup its credits row, and a
            # genuinely-new image can't be false-skipped into an occupied slot. (review findings 1 & 2)
            ident = c.get("page_url") or c.get("download_url") or ""
            base = f"{slug}_{hashlib.sha1(ident.encode('utf-8')).hexdigest()[:10]}"
            # The skip key is what's actually ON DISK — a manually-deleted file is re-fetched, not trusted-as-present.
            if list(dest_dir(c).glob(base + ".*")):
                print(f"    = {base} already on disk, skipping")
                got += 1
                continue
            try:
                raw = fetch_bytes(c["download_url"])
            except Exception as exc:  # noqa: BLE001
                print(f"    ! download failed ({exc})")
                continue
            ext, reason = validate_and_ext(raw, c["stress"])
            if not ext:
                print(f"    x rejected {c['source_name']} — {reason}")
                time.sleep(REQUEST_DELAY_SECONDS)
                continue
            fname = base + ext
            path = dest_dir(c) / fname
            path.write_bytes(raw)
            manifest[fname] = {
                "author": c["author"], "license": c["license"],
                "source_name": c["source_name"], "page_url": c["page_url"],
                "query": query, "stress": c["stress"],
            }
            downloaded += 1
            got += 1
            print(f"    + {fname}  ({len(raw)//1024}KB, {c['license']})  <- {c['page_url']}")
            time.sleep(REQUEST_DELAY_SECONDS)

        time.sleep(QUERY_DELAY_SECONDS)

    if args.dry_run:
        print(f"\n[dry-run] {listed} candidate(s) listed across {len(selected)} query(ies); nothing downloaded.")
        return

    # Reconcile with disk so credits.md/manifest never advertise a file that isn't there (e.g. one deleted by
    # hand between runs). Only genuinely-missing files are dropped — entries for untouched queries stay. (finding 2)
    pruned = [k for k in manifest if not ((CAL_DIR / k).exists() or (STRESS_DIR / k).exists())]
    for k in pruned:
        del manifest[k]
    if pruned:
        print(f"[reconcile] dropped {len(pruned)} manifest row(s) whose file is no longer on disk")

    write_manifest(manifest)
    write_credits(manifest)
    print(f"\n[done] {downloaded} new image(s); manifest {len(manifest)} total. credits → {CREDITS.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
