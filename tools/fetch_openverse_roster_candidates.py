import argparse
import io
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / ".roster-openverse-candidates"
UA = "TheLoveEquationsOpenverseImageQA/1.0 (local static-site maintenance)"


def slugify(value):
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


def fetch_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as response:
        return response.read()


def query_openverse(query, page_size):
    params = urllib.parse.urlencode(
        {
            "q": query,
            "license_type": "commercial",
            "page_size": page_size,
        }
    )
    return fetch_json("https://api.openverse.engineering/v1/images/?" + params).get("results", [])


def save_candidate(raw, path):
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    image.thumbnail((1100, 900), Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "JPEG", quality=84, optimize=True, progressive=True)


def draw_sheet(files, output):
    if not files:
        return
    tile_w, tile_h = 230, 300
    cols = 5
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tile_w, rows * tile_h), (235, 235, 235))
    font = ImageFont.load_default()
    for index, path in enumerate(files):
        image = Image.open(path).convert("RGB")
        image.thumbnail((tile_w, 245), Image.Resampling.LANCZOS)
        tile = Image.new("RGB", (tile_w, tile_h), "white")
        tile.paste(image, ((tile_w - image.width) // 2, 0))
        label = str(path.relative_to(OUT_DIR)).replace("\\", "/")
        ImageDraw.Draw(tile).text((6, 252), label[:42], fill=(0, 0, 0), font=font)
        sheet.paste(tile, ((index % cols) * tile_w, (index // cols) * tile_h))
    output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(output, "JPEG", quality=90)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("queries", nargs="+", help="Use slug=query, or just a query string.")
    parser.add_argument("--page-size", type=int, default=8)
    parser.add_argument("--delay", type=float, default=1.5)
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    all_files = []
    all_meta = {}

    for raw_query in args.queries:
        if "=" in raw_query:
            slug, query = raw_query.split("=", 1)
            slug = slugify(slug)
        else:
            query = raw_query
            slug = slugify(query)
        print(f"[openverse] {slug}: {query}")
        results = query_openverse(query, args.page_size)
        slug_dir = OUT_DIR / slug
        slug_dir.mkdir(parents=True, exist_ok=True)
        slug_meta = []
        for index, result in enumerate(results, start=1):
            image_url = result.get("url") or result.get("thumbnail")
            if not image_url:
                continue
            path = slug_dir / f"cand{index:02d}.jpg"
            try:
                if not path.exists():
                    save_candidate(fetch_bytes(image_url), path)
                    time.sleep(args.delay)
            except Exception as exc:
                slug_meta.append({"rank": index, "error": str(exc), "url": image_url})
                continue
            entry = {
                "rank": index,
                "path": str(path.relative_to(ROOT)).replace("\\", "/"),
                "title": result.get("title"),
                "creator": result.get("creator"),
                "license": result.get("license"),
                "license_version": result.get("license_version"),
                "source": result.get("source"),
                "landing_url": result.get("foreign_landing_url"),
                "image_url": image_url,
            }
            slug_meta.append(entry)
            all_files.append(path)
        all_meta[slug] = slug_meta
        time.sleep(args.delay)

    (OUT_DIR / "metadata.json").write_text(json.dumps(all_meta, indent=2), encoding="utf-8")
    draw_sheet(all_files, OUT_DIR / "contact-sheet.jpg")
    print(json.dumps({"slugs": sorted(all_meta), "files": len(all_files)}, indent=2))


if __name__ == "__main__":
    main()
