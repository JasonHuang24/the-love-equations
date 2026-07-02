"""Fetch TMDB profile-image candidates for roster members (no API key needed).

Scrapes the public site: person search -> best name match -> /images/profiles
page -> /t/p/ file paths -> downloads up to --max candidates per member into
.roster-audit/candidates/{slug}/tmdb-{n}.jpg with a sidecar sources.json for
credits. Read-only against the site tree; candidates are curated separately.

    python tools/fetch_tmdb_profiles.py --spec .roster-audit/fetch-spec.json
    python tools/fetch_tmdb_profiles.py --one rebel-wilson "Rebel Wilson" --max 6

Spec format: [{"slug": "rebel-wilson", "name": "Rebel Wilson", "max": 8}, ...]
"""

import argparse
import html
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
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)
DELAY = 2.5
DOWNLOAD_WIDTH = "w780"


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=45) as res:
        return res.read()


def slugify(name):
    s = name.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s


def find_person(name):
    """Return (person_id, person_slug) for the best search match, or None."""
    q = urllib.parse.quote(name)
    page = get(f"https://www.themoviedb.org/search/person?query={q}").decode(
        "utf-8", "replace"
    )
    want = slugify(name)
    hits = re.findall(r'href="/person/(\d+)-([a-z0-9-]+)"', page)
    seen = []
    for pid, pslug in hits:
        if (pid, pslug) not in seen:
            seen.append((pid, pslug))
    for pid, pslug in seen:
        if pslug == want:
            return pid, pslug
    return seen[0] if seen else None


def profile_paths(pid, pslug):
    page = get(
        f"https://www.themoviedb.org/person/{pid}-{pslug}/images/profiles"
    ).decode("utf-8", "replace")
    paths = re.findall(r"/t/p/[a-z0-9_]+/([A-Za-z0-9]+\.jpg)", html.unescape(page))
    out = []
    for p in paths:
        if p not in out:
            out.append(p)
    return out


def fetch_member(slug, name, max_n):
    hit = find_person(name)
    if not hit:
        print(f"[tmdb] {slug}: NO PERSON MATCH")
        return {"slug": slug, "person": None, "files": []}
    pid, pslug = hit
    time.sleep(DELAY)
    paths = profile_paths(pid, pslug)
    print(f"[tmdb] {slug}: person {pid}-{pslug}, {len(paths)} profile images")
    out_dir = CAND_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    files = []
    for i, p in enumerate(paths[:max_n], 1):
        url = f"https://image.tmdb.org/t/p/{DOWNLOAD_WIDTH}/{p}"
        try:
            raw = get(url)
            im = Image.open(io.BytesIO(raw)).convert("RGB")
        except Exception as exc:  # noqa: BLE001 - log and continue the sweep
            print(f"  ! {p}: {exc}")
            continue
        out = out_dir / f"tmdb-{i}.jpg"
        im.save(out, "JPEG", quality=88)
        files.append(
            {
                "file": out.name,
                "w": im.width,
                "h": im.height,
                "source": f"https://www.themoviedb.org/person/{pid}-{pslug}",
                "tmdb_path": p,
            }
        )
        time.sleep(DELAY)
    meta = {"slug": slug, "person": f"{pid}-{pslug}", "files": files}
    (out_dir / "sources.json").write_text(
        json.dumps(meta, indent=1), encoding="utf-8", newline="\n"
    )
    return meta


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--spec", help="JSON list of {slug,name,max}")
    ap.add_argument("--one", nargs=2, metavar=("SLUG", "NAME"))
    ap.add_argument("--max", type=int, default=8)
    args = ap.parse_args()

    jobs = []
    if args.spec:
        jobs = json.loads(Path(args.spec).read_text(encoding="utf-8"))
    elif args.one:
        jobs = [{"slug": args.one[0], "name": args.one[1], "max": args.max}]
    else:
        ap.error("need --spec or --one")

    results = []
    for job in jobs:
        results.append(
            fetch_member(job["slug"], job["name"], job.get("max", args.max))
        )
        time.sleep(DELAY)
    got = sum(len(r["files"]) for r in results)
    misses = [r["slug"] for r in results if not r["files"]]
    print(f"done: {got} candidates across {len(results)} members; misses: {misses}")


if __name__ == "__main__":
    main()
