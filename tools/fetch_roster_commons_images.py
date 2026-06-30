import ast
import html
import io
import json
import os
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ROSTER_DIR = ROOT / "images" / "roster"
MATCHMAKER = ROOT / "matchmaker.html"
MANIFEST = ROSTER_DIR / "manifest.json"
CREDITS = ROOT / "md" / "roster-image-credits.md"

UA = "TheLoveEquationsRosterImageFetcher/1.0 (local static site maintenance)"
REQUEST_DELAY_SECONDS = float(os.environ.get("ROSTER_FETCH_REQUEST_DELAY", "2.5"))
PERSON_DELAY_SECONDS = float(os.environ.get("ROSTER_FETCH_PERSON_DELAY", "8"))
MAX_PEOPLE_PER_RUN = int(os.environ.get("ROSTER_FETCH_MAX_PEOPLE", "3"))

TARGETS = [
    ("ana-de-armas", "Ana de Armas"),
    ("megan-fox", "Megan Fox"),
    ("victoria-justice", "Victoria Justice"),
    ("emma-watson", "Emma Watson"),
    ("natalie-portman", "Natalie Portman"),
    ("elizabeth-olsen", "Elizabeth Olsen"),
    ("lana-condor", "Lana Condor"),
    ("emmy-rossum", "Emmy Rossum"),
    ("hailee-steinfeld", "Hailee Steinfeld"),
    ("pom-klementieff", "Pom Klementieff"),
    ("rosa-salazar", "Rosa Salazar"),
    ("kylie-jenner", "Kylie Jenner"),
    ("chloe-grace-moretz", "Chloe Grace Moretz"),
    ("jennifer-haben", "Jennifer Haben"),
    ("marina-laswick", "Marina Laswick"),
    ("valkyrae", "Valkyrae"),
    ("alissa-white-gluz", "Alissa White-Gluz"),
    ("melissa-bonny", "Melissa Bonny"),
    ("pokimane", "Pokimane"),
    ("qtcinderella", "QTCinderella"),
    ("maya-higa", "Maya Higa"),
    ("amelia-dimoldenberg", "Amelia Dimoldenberg"),
    ("asmr-darling", "ASMR Darling"),
    ("gibi-asmr", "Gibi ASMR"),
    ("blaire-white", "Blaire White"),
    ("lilypichu", "LilyPichu"),
    ("ihascupquake", "iHasCupquake"),
    ("emma-blackery", "Emma Blackery"),
    ("gab-smolders", "Gab Smolders"),
    ("whispersred", "WhispersRed"),
    ("courtney-clenney", "Courtney Clenney"),
]

# These are too likely to resolve to the wrong person or nonfree art on a blind Commons pass.
KNOWN_SKIP = {
    "alice-lane",
    "shaelah-mcgilton",
    "marz",
    "piia-tamare",
    "callan-exorcist",
    "evil-addams",
    "selene-ashford",
    "tifa-lockhart",
    "vera-lux",
    "aerith-gainsborough",
    "triss-merigold",
    "anna-henrietta",
    "keira-metz",
    "philippa-eilhart",
}

BAD_TITLE = (
    "logo",
    "signature",
    "autograph",
    "poster",
    "cover",
    "album",
    "single",
    "svg",
    "icon",
    "symbol",
    "grave",
    "wax",
    "mural",
    "cosplay",
    "fan art",
)


def fetch_json(url):
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


def name_tokens(name):
    return [t.lower() for t in re.findall(r"[a-z0-9]+", name.lower()) if len(t) > 1]


def search_commons(name):
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": 6,
        "gsrsearch": name,
        "gsrlimit": 18,
        "prop": "imageinfo",
        "iiprop": "url|mime|extmetadata",
        "iiurlwidth": 1100,
    }
    url = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)
    data = fetch_json(url)
    pages = list((data.get("query", {}).get("pages") or {}).values())
    toks = name_tokens(name)
    out = []
    for p in pages:
        ii = (p.get("imageinfo") or [{}])[0]
        title = p.get("title", "")
        low = title.lower()
        if ii.get("mime") not in ("image/jpeg", "image/png", "image/webp"):
            continue
        if any(x in low for x in BAD_TITLE):
            continue
        token_hits = sum(1 for t in toks if t in low)
        if token_hits < max(1, min(2, len(toks))):
            continue
        score = token_hits * 10
        if "crop" in low:
            score += 5
        if "portrait" in low:
            score += 3
        if "red carpet" in low or "festival" in low or "premiere" in low:
            score += 2
        if " with " in low or " and " in low:
            score -= 4
        out.append((score, p, ii))
    out.sort(key=lambda x: x[0], reverse=True)
    return out


def save_jpeg(raw, path, max_size, quality):
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    im.thumbnail(max_size, Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, "JPEG", quality=quality, optimize=True, progressive=True)


def js_obj_literal(obj):
    parts = []
    for k in sorted(obj):
        v = obj[k]
        if isinstance(v, list):
            vv = "[" + ",".join(repr(x) for x in v) + "]"
        else:
            vv = repr(v)
        parts.append(f"{repr(k)}:{vv}")
    return "{" + ", ".join(parts) + "}"


def update_js_maps(new_avatar, new_gallery):
    text = MATCHMAKER.read_text(encoding="utf-8")
    img_match = re.search(r"const ROSTER_IMG = (\{.*?\});", text, re.S)
    gal_match = re.search(r"const GALLERY_IMG = (\{.*?\});", text, re.S)
    if not img_match or not gal_match:
        raise RuntimeError("Could not locate image maps")
    img_map = ast.literal_eval(img_match.group(1))
    gal_map = ast.literal_eval(gal_match.group(1))
    img_map.update(new_avatar)
    gal_map.update({k: v for k, v in new_gallery.items() if v})
    text = text[: img_match.start(1)] + js_obj_literal(img_map) + text[img_match.end(1) :]
    gal_match = re.search(r"const GALLERY_IMG = (\{.*?\});", text, re.S)
    text = text[: gal_match.start(1)] + js_obj_literal(gal_map) + text[gal_match.end(1) :]
    MATCHMAKER.write_text(text, encoding="utf-8")


def update_manifest(new_avatar):
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    data.update(new_avatar)
    MANIFEST.write_text(json.dumps(dict(sorted(data.items())), indent=2) + "\n", encoding="utf-8")


def append_credits(rows, skipped):
    if not rows and not skipped:
        return
    lines = [
        "",
        "## 2026-06-30 old-chat roster expansion",
        "",
        "First-pass image fill for the old-chat roster seeds. Files are local optimized derivatives of Wikimedia Commons thumbnails; sparse or skipped entries were left without images rather than padded with wrong-person, nonfree, or low-confidence assets.",
        "",
        "| Kind | Profile | Slot | Source |",
        "| --- | --- | --- | --- |",
    ]
    for kind, slug, slot, src in rows:
        lines.append(f"| {kind} | {slug} | {slot} | [Commons]({src}) |")
    if skipped:
        lines += ["", "Skipped/no verified free Commons hit in this pass: " + ", ".join(sorted(skipped)) + "."]
    CREDITS.write_text(CREDITS.read_text(encoding="utf-8").rstrip() + "\n" + "\n".join(lines) + "\n", encoding="utf-8")


def main():
    new_avatar = {}
    new_gallery = {}
    credit_rows = []
    skipped = set(KNOWN_SKIP)
    processed = 0

    for slug, name in TARGETS:
        if slug in KNOWN_SKIP:
            continue
        if processed >= MAX_PEOPLE_PER_RUN:
            print(f"[stop] batch limit reached ({MAX_PEOPLE_PER_RUN}); rerun later for the next small batch")
            break
        if (ROSTER_DIR / f"{slug}.jpg").exists() or (ROSTER_DIR / slug).exists():
            print(f"[skip] {name} already has local roster images")
            continue
        print(f"[search] {name}")
        try:
            hits = search_commons(name)
        except Exception as e:
            print(f"  ! search failed: {e}")
            skipped.add(slug)
            continue
        if not hits:
            print("  - no usable Commons result")
            skipped.add(slug)
            continue
        selected = hits[:5]
        gallery_paths = []
        for idx, (_, page, ii) in enumerate(selected):
            url = ii.get("thumburl") or ii.get("url")
            source = ii.get("descriptionurl") or ii.get("descriptionshorturl") or ii.get("url")
            if not url:
                continue
            try:
                raw = fetch_bytes(url)
                if idx == 0:
                    av_path = ROSTER_DIR / f"{slug}.jpg"
                    save_jpeg(raw, av_path, (420, 560), 82)
                    new_avatar[slug] = f"images/roster/{slug}.jpg"
                    credit_rows.append(("avatar", slug, "lead", source))
                else:
                    slot = len(gallery_paths) + 1
                    shot_path = ROSTER_DIR / slug / f"{slot}.jpg"
                    save_jpeg(raw, shot_path, (1100, 900), 84)
                    rel = f"images/roster/{slug}/{slot}.jpg"
                    gallery_paths.append(rel)
                    credit_rows.append(("gallery", slug, str(slot), source))
            except Exception as e:
                print(f"  ! download/save failed {page.get('title')}: {e}")
            time.sleep(REQUEST_DELAY_SECONDS)
        if gallery_paths:
            new_gallery[slug] = gallery_paths
        print(f"  + avatar={slug in new_avatar} gallery={len(gallery_paths)}")
        processed += 1
        time.sleep(PERSON_DELAY_SECONDS)

    update_js_maps(new_avatar, new_gallery)
    update_manifest(new_avatar)
    append_credits(credit_rows, skipped)
    print(json.dumps({"avatars": len(new_avatar), "galleries": {k: len(v) for k, v in new_gallery.items()}, "skipped": sorted(skipped)}, indent=2))


if __name__ == "__main__":
    main()
