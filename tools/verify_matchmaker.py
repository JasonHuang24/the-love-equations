"""Pre-commit invariant checker for matchmaker.html.

Run before every commit that touches the matchmaker:
    python tools/verify_matchmaker.py

Checks: inline script parses (node --check), data invariants (slug counts and
cross-references, wired image paths exist on disk, stamp keys are wired, trait
scores in range), LF-only line endings, asset-rev format.
"""

import re
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import mm_data

BUILDS = {"slim", "average", "athletic", "muscular", "curvy", "heavy"}
FAILURES = []


def check(ok, label):
    print(("PASS  " if ok else "FAIL  ") + label)
    if not ok:
        FAILURES.append(label)


def main():
    raw = mm_data.MATCHMAKER.read_bytes()
    check(b"\r\n" not in raw, "line endings are LF-only")

    script, _ = mm_data.inline_script(raw.decode("utf-8"))
    with tempfile.NamedTemporaryFile(
        "w", suffix=".js", delete=False, encoding="utf-8"
    ) as f:
        f.write(script)
        tmp = f.name
    res = subprocess.run(
        ["node", "--check", tmp], capture_output=True, text=True, encoding="utf-8"
    )
    Path(tmp).unlink(missing_ok=True)
    check(res.returncode == 0, "inline script passes node --check")
    if res.returncode != 0:
        print(res.stderr[:2000])
        finish()

    data = mm_data.load_data()
    roster = data["ROSTER"]
    profiles = data["PROFILES"]
    img_map = data["ROSTER_IMG"]
    gal_map = data["GALLERY_IMG"]
    stamps = data["PHOTO_STAMP"]

    slugs = [c["slug"] for c in roster]
    check(len(slugs) == len(set(slugs)), f"ROSTER slugs unique ({len(slugs)} members)")
    missing_prof = sorted(set(slugs) - set(profiles))
    extra_prof = sorted(set(profiles) - set(slugs))
    check(not missing_prof, f"every ROSTER member has a PROFILES entry {missing_prof[:5]}")
    check(not extra_prof, f"no orphan PROFILES entries {extra_prof[:5]}")
    check(set(img_map) <= set(slugs), "ROSTER_IMG keys are roster slugs")
    check(set(gal_map) <= set(slugs), "GALLERY_IMG keys are roster slugs")

    missing_files = []
    for path in list(img_map.values()) + [p for g in gal_map.values() for p in g]:
        if not (mm_data.ROOT / path).is_file():
            missing_files.append(path)
    check(not missing_files, f"all wired image paths exist on disk {missing_files[:5]}")

    dup_in_gallery = [s for s, g in gal_map.items() if len(g) != len(set(g))]
    check(not dup_in_gallery, f"no duplicate paths within a gallery {dup_in_gallery[:5]}")

    owner = {}
    cross = []
    for s, g in gal_map.items():
        for p in g:
            if p in owner and owner[p] != s:
                cross.append(p)
            owner[p] = s
    check(not cross, f"no gallery path wired to two members {cross[:5]}")

    wired = set(owner) | set(img_map.values())
    unwired_stamps = sorted(set(stamps) - wired)
    check(not unwired_stamps, f"every PHOTO_STAMP key is a wired path {unwired_stamps[:5]}")

    bad_rows = []
    for c in roster:
        for field in ("slug", "name", "g", "career", "looks", "smv", "status",
                      "heightCm", "build", "personality", "vibe"):
            if field not in c:
                bad_rows.append(f"{c.get('slug','?')}:{field}")
        if not ("born" in c or "bornYear" in c or "age" in c):
            bad_rows.append(f"{c.get('slug','?')}:born")
        for k in ("looks", "smv", "status"):
            v = c.get(k)
            if not (isinstance(v, (int, float)) and 1 <= v <= 10):
                bad_rows.append(f"{c.get('slug','?')}:{k}={v}")
        if c.get("build") not in BUILDS:
            bad_rows.append(f"{c.get('slug','?')}:build={c.get('build')}")
    check(not bad_rows, f"ROSTER rows well-formed {bad_rows[:5]}")

    bad_traits = []
    for slug, prof in profiles.items():
        if not prof.get("blurb"):
            bad_traits.append(f"{slug}:blurb")
        for key, t in (prof.get("traits") or {}).items():
            s = t.get("s") if isinstance(t, dict) else None
            if not (isinstance(s, (int, float)) and 1 <= s <= 10):
                bad_traits.append(f"{slug}:{key}={s}")
            elif not t.get("note"):
                bad_traits.append(f"{slug}:{key}:note")
    check(not bad_traits, f"PROFILES traits in range with notes {bad_traits[:5]}")

    rev = data["ROSTER_ASSET_REV"]
    check(bool(re.fullmatch(r"images-\d{8}[a-z]?", rev)), f"asset-rev format ({rev})")

    finish()


def finish():
    if FAILURES:
        print(f"\n{len(FAILURES)} FAILURE(S)")
        sys.exit(1)
    print("\nALL CHECKS PASS")
    sys.exit(0)


if __name__ == "__main__":
    main()
