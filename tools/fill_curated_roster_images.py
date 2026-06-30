import ast
import html
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from urllib.error import HTTPError
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ROSTER_DIR = ROOT / "images" / "roster"
MATCHMAKER = ROOT / "matchmaker.html"
MANIFEST = ROSTER_DIR / "manifest.json"
CREDITS = ROOT / "md" / "roster-image-credits.md"
UA = "TheLoveEquationsRosterImageFetcher/1.0 (curated local static-site maintenance)"
DOWNLOAD_DELAY_SECONDS = float(os.environ.get("ROSTER_CURATED_DOWNLOAD_DELAY", "8"))


def commons_page(title):
    return "https://commons.wikimedia.org/wiki/" + urllib.parse.quote(title.replace(" ", "_"), safe=":/()_%")


def item(title, url):
    return {"title": title, "url": url, "source": commons_page(title)}


def commons_file(title, width=960):
    filename = title[5:] if title.startswith("File:") else title
    url_name = urllib.parse.quote(filename.replace(" ", "_"), safe="()_%,-.")
    url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{url_name}?width={width}"
    return item(title, url)


CURATED = {
    "emma-watson": {
        "avatar": item(
            "File:Emma Watson, 2012.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Emma_Watson%2C_2012.jpg/960px-Emma_Watson%2C_2012.jpg",
        ),
        "gallery": [
            item("File:Emma Watson (5930414886).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Emma_Watson_%285930414886%29.jpg/960px-Emma_Watson_%285930414886%29.jpg"),
            item("File:Emma Watson 2013.jpg", "https://upload.wikimedia.org/wikipedia/commons/7/7f/Emma_Watson_2013.jpg"),
            item("File:Emma Watson ONU 2017.jpg", "https://upload.wikimedia.org/wikipedia/commons/f/f9/Emma_Watson_ONU_2017.jpg"),
            item("File:Emma Watson by Ben Salter.jpg", "https://upload.wikimedia.org/wikipedia/commons/7/7f/Emma_Watson_by_Ben_Salter.jpg"),
            item("File:Emma Watson interview in 2017.jpg", "https://upload.wikimedia.org/wikipedia/commons/0/0a/Emma_Watson_interview_in_2017.jpg"),
        ],
    },
    "natalie-portman": {
        "avatar": item("File:Natalie Portman-4352.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Natalie_Portman-4352.jpg/960px-Natalie_Portman-4352.jpg"),
        "gallery": [
            item("File:Natalie Portman-4353.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Natalie_Portman-4353.jpg/960px-Natalie_Portman-4353.jpg"),
            item("File:Natalie Portman-4361.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Natalie_Portman-4361.jpg/960px-Natalie_Portman-4361.jpg"),
            item("File:Natalie Portman-69211.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Natalie_Portman-69211.jpg/960px-Natalie_Portman-69211.jpg"),
        ],
    },
    "elizabeth-olsen": {
        "avatar": item("File:Elizabeth-olsen-1632123202.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Elizabeth-olsen-1632123202.jpg/960px-Elizabeth-olsen-1632123202.jpg"),
        "gallery": [
            item("File:Elizabeth Olsen.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Elizabeth_Olsen.jpg/960px-Elizabeth_Olsen.jpg"),
            item("File:Elizabeth Olsen (6142727229).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Elizabeth_Olsen_%286142727229%29.jpg/960px-Elizabeth_Olsen_%286142727229%29.jpg"),
            item("File:Elizabeth Olsen by Gage Skidmore.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Elizabeth_Olsen_by_Gage_Skidmore.jpg/960px-Elizabeth_Olsen_by_Gage_Skidmore.jpg"),
            item("File:Elizabeth Olsen - Los Angeles Comic Con 2025.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Elizabeth_Olsen_-_Los_Angeles_Comic_Con_2025.jpg/960px-Elizabeth_Olsen_-_Los_Angeles_Comic_Con_2025.jpg"),
        ],
    },
    "lana-condor": {
        "avatar": item("File:Lana Condor (2020).jpg", "https://upload.wikimedia.org/wikipedia/commons/1/1b/Lana_Condor_%282020%29.jpg"),
        "gallery": [
            item("File:Lana Condor, 2015 (cropped).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Lana_Condor%2C_2015_%28cropped%29.jpg/960px-Lana_Condor%2C_2015_%28cropped%29.jpg"),
            item("File:Lana Condor 2015.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Lana_Condor_2015.jpg/960px-Lana_Condor_2015.jpg"),
            item("File:Lana Condor 2015 (2).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Lana_Condor_2015_%282%29.jpg/960px-Lana_Condor_2015_%282%29.jpg"),
            item("File:Lana Condor 2015 (3).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Lana_Condor_2015_%283%29.jpg/960px-Lana_Condor_2015_%283%29.jpg"),
        ],
    },
    "emmy-rossum": {
        "avatar": item("File:Emmy Rossum in 2016.jpg", "https://upload.wikimedia.org/wikipedia/commons/1/1a/Emmy_Rossum_in_2016.jpg"),
        "gallery": [
            item("File:Emmy Rossum, 2011.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Emmy_Rossum%2C_2011.jpg/960px-Emmy_Rossum%2C_2011.jpg"),
            item("File:Emmy Rossum (24341757766) (cropped).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Emmy_Rossum_%2824341757766%29_%28cropped%29.jpg/960px-Emmy_Rossum_%2824341757766%29_%28cropped%29.jpg"),
            item("File:Emmy Rossum 2011.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Emmy_Rossum_2011.jpg/960px-Emmy_Rossum_2011.jpg"),
            item("File:Emmy Rossum cropped headshot.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Emmy_Rossum_cropped_headshot.jpg/960px-Emmy_Rossum_cropped_headshot.jpg"),
        ],
    },
    "hailee-steinfeld": {
        "avatar": item("File:Hailee Steinfeld 4 (43005821651) (cropped).jpg", "https://upload.wikimedia.org/wikipedia/commons/1/1b/Hailee_Steinfeld_4_%2843005821651%29_%28cropped%29.jpg"),
        "gallery": [
            item("File:Hailee Steinfeld (21604481176).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Hailee_Steinfeld_%2821604481176%29.jpg/960px-Hailee_Steinfeld_%2821604481176%29.jpg"),
            item("File:Hailee Steinfeld 1 (42104424475).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Hailee_Steinfeld_1_%2842104424475%29.jpg/960px-Hailee_Steinfeld_1_%2842104424475%29.jpg"),
            item("File:Hailee Steinfeld 2 (42287125684 ).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Hailee_Steinfeld_2_%2842287125684_%29.jpg/960px-Hailee_Steinfeld_2_%2842287125684_%29.jpg"),
            item("File:Hailee Steinfeld by Gage Skidmore.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Hailee_Steinfeld_by_Gage_Skidmore.jpg/960px-Hailee_Steinfeld_by_Gage_Skidmore.jpg"),
        ],
    },
    "pom-klementieff": {
        "avatar": item("File:Pom Klementieff (36141344391).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Pom_Klementieff_%2836141344391%29.jpg/960px-Pom_Klementieff_%2836141344391%29.jpg"),
        "gallery": [
            item("File:Pom Klementieff IMG 2090 (37440777786).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Pom_Klementieff_IMG_2090_%2837440777786%29.jpg/960px-Pom_Klementieff_IMG_2090_%2837440777786%29.jpg"),
            item("File:Pom Klementieff IMG 2108 (37440773896).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Pom_Klementieff_IMG_2108_%2837440773896%29.jpg/960px-Pom_Klementieff_IMG_2108_%2837440773896%29.jpg"),
            item("File:Pom Klementieff IMG 7514 (37457648972).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Pom_Klementieff_IMG_7514_%2837457648972%29.jpg/960px-Pom_Klementieff_IMG_7514_%2837457648972%29.jpg"),
            item("File:Pom Klementieff IMG 7532 (37488517631).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Pom_Klementieff_IMG_7532_%2837488517631%29.jpg/960px-Pom_Klementieff_IMG_7532_%2837488517631%29.jpg"),
        ],
    },
    "rosa-salazar": {
        "avatar": item("File:Rosa Salazar 2019.png", "https://upload.wikimedia.org/wikipedia/commons/c/c8/Rosa_Salazar_2019.png"),
        "gallery": [
            item("File:Rosa Salazar (51986301072).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Rosa_Salazar_%2851986301072%29.jpg/960px-Rosa_Salazar_%2851986301072%29.jpg"),
            item("File:Rosa Salazar (51987302621).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Rosa_Salazar_%2851987302621%29.jpg/960px-Rosa_Salazar_%2851987302621%29.jpg"),
            item("File:Rosa Salazar (51987368483).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Rosa_Salazar_%2851987368483%29.jpg/960px-Rosa_Salazar_%2851987368483%29.jpg"),
            item("File:Rosa Salazar by Gage Skidmore.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Rosa_Salazar_by_Gage_Skidmore.jpg/960px-Rosa_Salazar_by_Gage_Skidmore.jpg"),
        ],
    },
    "chloe-grace-moretz": {
        "avatar": item("File:Chloë Grace Moretz The Peripheral NYCC 2022 (cropped).jpg", "https://upload.wikimedia.org/wikipedia/commons/a/a0/Chlo%C3%AB_Grace_Moretz_The_Peripheral_NYCC_2022_%28cropped%29.jpg"),
        "gallery": [
            item("File:Chloe Grace Moretz 2019.png", "https://upload.wikimedia.org/wikipedia/commons/d/d0/Chloe_Grace_Moretz_2019.png"),
            item("File:Chloe Grace Moretz 2019 2.png", "https://upload.wikimedia.org/wikipedia/commons/e/e2/Chloe_Grace_Moretz_2019_2.png"),
            item("File:Chloe Grace Moretz 2019 3.png", "https://upload.wikimedia.org/wikipedia/commons/e/e4/Chloe_Grace_Moretz_2019_3.png"),
            item("File:Chloe Moretz 2018 2.jpg", "https://upload.wikimedia.org/wikipedia/commons/5/5a/Chloe_Moretz_2018_2.jpg"),
        ],
    },
    "jennifer-haben": {
        "avatar": item("File:Beyond the Black, Dancing In The Dark Tour, Stuttgart 2024 (28) (cropped).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Beyond_the_Black%2C_Dancing_In_The_Dark_Tour%2C_Stuttgart_2024_%2828%29_%28cropped%29.jpg/960px-Beyond_the_Black%2C_Dancing_In_The_Dark_Tour%2C_Stuttgart_2024_%2828%29_%28cropped%29.jpg"),
        "gallery": [
            item("File:Beyond the Black, Dancing In The Dark Tour, Stuttgart 2024 (06).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Beyond_the_Black%2C_Dancing_In_The_Dark_Tour%2C_Stuttgart_2024_%2806%29.jpg/960px-Beyond_the_Black%2C_Dancing_In_The_Dark_Tour%2C_Stuttgart_2024_%2806%29.jpg"),
            item("File:Beyond the Black, Dancing In The Dark Tour, Stuttgart 2024 (26).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Beyond_the_Black%2C_Dancing_In_The_Dark_Tour%2C_Stuttgart_2024_%2826%29.jpg/960px-Beyond_the_Black%2C_Dancing_In_The_Dark_Tour%2C_Stuttgart_2024_%2826%29.jpg"),
            item("File:Beyond the Black, Dancing In The Dark Tour, Stuttgart 2024 (55).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Beyond_the_Black%2C_Dancing_In_The_Dark_Tour%2C_Stuttgart_2024_%2855%29.jpg/960px-Beyond_the_Black%2C_Dancing_In_The_Dark_Tour%2C_Stuttgart_2024_%2855%29.jpg"),
            item("File:Beyond the Black, European Co-Headline Tour, Ludwigsburg 2022 (03).jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Beyond_the_Black%2C_European_Co-Headline_Tour%2C_Ludwigsburg_2022_%2803%29.jpg/960px-Beyond_the_Black%2C_European_Co-Headline_Tour%2C_Ludwigsburg_2022_%2803%29.jpg"),
        ],
    },
    "valkyrae": {
        "avatar": commons_file("File:Valkyrae in 2023 (cropped).png"),
        "gallery": [
            commons_file("File:Valkyrae for 100 Thieves (cropped).jpg"),
        ],
    },
    "qtcinderella": {
        "avatar": commons_file("File:QTCinderella in 2022 (2).jpg"),
        "gallery": [
            commons_file("File:QTCinderella.jpg"),
        ],
    },
    "maya-higa": {
        "avatar": commons_file("File:Maya Higa in 2023.jpg"),
        "gallery": [
            commons_file("File:Maya Higa.png"),
            commons_file("File:Maya Higa in 2021.png"),
        ],
    },
    "kylie-jenner": {
        "avatar": commons_file("File:Kylie Jenner at Topshop Behind the Scenes.png"),
        "gallery": [
            commons_file("File:Kylie Jenner Complex.png"),
        ],
    },
    "gibi-asmr": {
        "avatar": commons_file("File:Gibi ASMR.jpg"),
        "gallery": [],
    },
    "lilypichu": {
        "avatar": commons_file("File:Lilypichu 2018 (cropped).jpg"),
        "gallery": [
            commons_file("File:LilyPichu at Haradas Bar (2025).png"),
        ],
    },
    "ihascupquake": {
        "avatar": commons_file("File:IHasCupquake.png"),
        "gallery": [],
    },
    "emma-blackery": {
        "avatar": commons_file("File:Emma Blackery 2016 (9).jpg"),
        "gallery": [],
    },
    "blaire-white": {
        "avatar": commons_file("File:Blaire White in June 2019.png"),
        "gallery": [],
    },
}


def fetch_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as res:
                return res.read()
        except HTTPError as exc:
            if exc.code != 429 or attempt == 2:
                raise
            wait = 60 * (attempt + 1)
            print(f"  ! 429 from Wikimedia; backing off {wait}s")
            time.sleep(wait)


def save_jpeg(raw, path, max_size, quality):
    image = Image.open(io.BytesIO(raw)).convert("RGB")
    image.thumbnail(max_size, Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "JPEG", quality=quality, optimize=True, progressive=True)


def save_or_keep(source, path, max_size, quality):
    if path.exists():
        return False
    save_jpeg(fetch_bytes(source["url"]), path, max_size, quality)
    time.sleep(DOWNLOAD_DELAY_SECONDS)
    return True


def js_obj_literal(obj):
    parts = []
    for key in sorted(obj):
        value = obj[key]
        if isinstance(value, list):
            rendered = "[" + ", ".join(repr(x) for x in value) + "]"
        else:
            rendered = repr(value)
        parts.append(f"{repr(key)}:{rendered}")
    return "{" + ", ".join(parts) + "}"


def read_maps():
    text = MATCHMAKER.read_text(encoding="utf-8")
    img_match = re.search(r"const ROSTER_IMG = (\{.*?\});", text, re.S)
    gal_match = re.search(r"const GALLERY_IMG = (\{.*?\});", text, re.S)
    if not img_match or not gal_match:
        raise RuntimeError("Could not locate image maps")
    return text, img_match, gal_match, ast.literal_eval(img_match.group(1)), ast.literal_eval(gal_match.group(1))


def write_maps(text, img_match, img_map, gal_map):
    text = text[: img_match.start(1)] + js_obj_literal(img_map) + text[img_match.end(1) :]
    gal_match = re.search(r"const GALLERY_IMG = (\{.*?\});", text, re.S)
    text = text[: gal_match.start(1)] + js_obj_literal(gal_map) + text[gal_match.end(1) :]
    MATCHMAKER.write_text(text, encoding="utf-8")


def append_credits(rows):
    if not rows:
        return
    text = CREDITS.read_text(encoding="utf-8").rstrip()
    rendered_rows = [f"| {kind} | {slug} | {slot} | [Commons]({source}) |" for kind, slug, slot, source in rows]
    if "## 2026-06-30 old-chat roster image fill pass 2" in text:
        CREDITS.write_text(text + "\n" + "\n".join(rendered_rows) + "\n", encoding="utf-8")
        return
    lines = [
        "",
        "## 2026-06-30 old-chat roster image fill pass 2",
        "",
        "Curated Commons/Wikipedia portrait fill for public old-chat entries. Files are local optimized derivatives; entries without safe public-photo pools remain initials-only.",
        "",
        "| Kind | Profile | Slot | Source |",
        "| --- | --- | --- | --- |",
    ]
    lines.extend(rendered_rows)
    CREDITS.write_text(text + "\n" + "\n".join(lines) + "\n", encoding="utf-8")


def update_skip_note(filled_slugs):
    text = CREDITS.read_text(encoding="utf-8")
    pattern = r"Skipped/no verified free Commons hit in this pass: ([^.]+)\."

    def repl(match):
        names = [n.strip() for n in match.group(1).split(",")]
        names = [n for n in names if n not in filled_slugs]
        return "Skipped/no verified free Commons hit in this pass: " + ", ".join(names) + "."

    CREDITS.write_text(re.sub(pattern, repl, text, count=1), encoding="utf-8")


def main():
    text, img_match, _gal_match, img_map, gal_map = read_maps()
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    credit_rows = []
    filled = set()
    requested = sys.argv[1:]
    if not requested and os.environ.get("ROSTER_CURATED_SLUGS"):
        requested = [s.strip() for s in os.environ["ROSTER_CURATED_SLUGS"].split(",") if s.strip()]
    if requested:
        missing = [slug for slug in requested if slug not in CURATED]
        if missing:
            raise SystemExit(f"Unknown curated slugs: {', '.join(missing)}")
        items_to_fill = [(slug, CURATED[slug]) for slug in requested]
    else:
        items_to_fill = sorted(CURATED.items())

    for slug, data in items_to_fill:
        print(f"[fill] {slug}")
        avatar = data["avatar"]
        avatar_rel = f"images/roster/{slug}.jpg"
        save_or_keep(avatar, ROSTER_DIR / f"{slug}.jpg", (420, 560), 84)
        img_map[slug] = avatar_rel
        manifest[slug] = avatar_rel
        credit_rows.append(("avatar", slug, "lead", avatar["source"]))
        time.sleep(1.0)

        existing = list(gal_map.get(slug, []))
        gallery = existing[:5]
        next_slot = 1
        for existing_path in existing:
            match = re.search(r"/(\d+)\.jpg$", existing_path)
            if match:
                next_slot = max(next_slot, int(match.group(1)) + 1)

        for shot in data.get("gallery", []):
            if len(gallery) >= 5:
                break
            rel = f"images/roster/{slug}/{next_slot}.jpg"
            save_or_keep(shot, ROSTER_DIR / slug / f"{next_slot}.jpg", (1100, 900), 84)
            gallery.append(rel)
            credit_rows.append(("gallery", slug, str(next_slot), shot["source"]))
            next_slot += 1

        gal_map[slug] = gallery
        filled.add(slug)

    write_maps(text, img_match, img_map, gal_map)
    MANIFEST.write_text(json.dumps(dict(sorted(manifest.items())), indent=2) + "\n", encoding="utf-8")
    append_credits(credit_rows)
    update_skip_note(filled)
    print(json.dumps({"filled": sorted(filled), "credits": len(credit_rows)}, indent=2))


if __name__ == "__main__":
    main()
