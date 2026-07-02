"""Wikimedia/Wikipedia fallback candidate fetcher for roster members.

    python tools/fetch_wiki_candidates.py --spec .roster-audit/fetch-spec.json --only slug1,slug2

Per member: resolve the English Wikipedia article by name, pull the pageimage
(lead portrait) plus article image files, filter obvious non-portraits, and
download up to --max into .roster-audit/candidates/{slug}/wiki-{n}.jpg with a
wiki-sources.json sidecar. Article-scoped = identity comes from the article.
"""

import argparse
import io
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
import mm_data

CAND_DIR = mm_data.ROOT / ".roster-audit" / "candidates"
UA = "TheLoveEquationsRosterImageFetcher/1.0 (curated local static-site maintenance)"
DELAY = 2.5
SKIP = re.compile(
    r"logo|icon|map|signature|album|cover|poster|flag|seal|chart|graph|stadium|arena|crowd",
    re.I,
)


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=45) as res:
                return res.read()
        except urllib.error.HTTPError as exc:
            if exc.code != 429 or attempt == 3:
                raise
            wait = 60 * (attempt + 1)
            print(f"  ! 429; backing off {wait}s")
            time.sleep(wait)


def api(params):
    qs = urllib.parse.urlencode({**params, "format": "json"})
    return json.loads(get(f"https://en.wikipedia.org/w/api.php?{qs}"))


def article_for(name):
    r = api({"action": "query", "list": "search", "srsearch": name, "srlimit": 1})
    hits = r.get("query", {}).get("search", [])
    return hits[0]["title"] if hits else None


def image_titles(title):
    r = api(
        {
            "action": "query",
            "titles": title,
            "prop": "pageimages|images",
            "piprop": "original",
            "imlimit": 50,
        }
    )
    pages = list(r.get("query", {}).get("pages", {}).values())
    if not pages:
        return None, []
    page = pages[0]
    lead = (page.get("original") or {}).get("source")
    files = [
        im["title"]
        for im in page.get("images", [])
        if im["title"].lower().endswith((".jpg", ".jpeg", ".png"))
        and not SKIP.search(im["title"])
    ]
    return lead, files


def file_url(title, width=960):
    name = title[5:] if title.lower().startswith("file:") else title
    return (
        "https://commons.wikimedia.org/wiki/Special:FilePath/"
        + urllib.parse.quote(name.replace(" ", "_"))
        + f"?width={width}"
    )


def fetch_member(slug, name, max_n):
    title = article_for(name)
    if not title:
        print(f"[wiki] {slug}: no article")
        return 0
    time.sleep(DELAY)
    lead, files = image_titles(title)
    out_dir = CAND_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    sources = []
    n = 0
    urls = ([("(pageimage)", lead)] if lead else []) + [
        (t, file_url(t)) for t in files
    ]
    for src_title, url in urls:
        if n >= max_n:
            break
        try:
            raw = get(url)
            im = Image.open(io.BytesIO(raw)).convert("RGB")
        except Exception as exc:  # noqa: BLE001 - skip broken files, keep sweep alive
            print(f"  ! {src_title}: {exc}")
            continue
        if im.width < 240 or im.height < 240:
            continue
        n += 1
        out = out_dir / f"wiki-{n}.jpg"
        im.save(out, "JPEG", quality=88)
        sources.append({"file": out.name, "title": src_title, "article": title, "w": im.width, "h": im.height})
        time.sleep(DELAY)
    (out_dir / "wiki-sources.json").write_text(
        json.dumps({"slug": slug, "article": title, "files": sources}, indent=1),
        encoding="utf-8",
        newline="\n",
    )
    print(f"[wiki] {slug}: {n} candidates from '{title}'")
    return n


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", required=True)
    ap.add_argument("--only", help="comma-separated slugs")
    ap.add_argument("--max", type=int, default=8)
    args = ap.parse_args()
    spec = json.loads(Path(args.spec).read_text(encoding="utf-8"))
    only = set(args.only.split(",")) if args.only else None
    total = 0
    for job in spec:
        if only and job["slug"] not in only:
            continue
        total += fetch_member(job["slug"], job["name"], args.max)
        time.sleep(DELAY)
    print(f"done: {total} wiki candidates")


if __name__ == "__main__":
    main()
