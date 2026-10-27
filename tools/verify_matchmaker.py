"""Pre-commit invariant checker for matchmaker.html.

Run before every commit that touches the matchmaker:
    python tools/verify_matchmaker.py

Checks: inline script parses (node --check), data invariants (slug counts and
cross-references, wired image paths exist on disk, stamp keys are wired, trait
scores in range), LF-only line endings, asset-rev format.
"""

import re
import argparse
import json
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


def eol_consistent(raw):
    """True if the file uses one EOL convention throughout (pure LF or pure CRLF).

    A Windows checkout (core.autocrlf, or a .gitattributes eol=lf tree not yet
    renormalized) can hand us CRLF even though the committed blob is LF-only, so a
    uniform CRLF working tree is fine — .gitattributes normalizes the commit to LF.
    Only a mixed or CR-only file, which would corrupt the commit, is rejected.
    """
    crlf = raw.count(b"\r\n")
    cr = raw.count(b"\r")
    lf = raw.count(b"\n")
    if cr != crlf:                  # a bare CR appears -> CR-only or mixed endings
        return False
    return crlf == 0 or crlf == lf  # pure LF, or every LF paired into CRLF


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--require-quota', action='store_true', help='Fail unless every gallery contains at least five photos; visual distinctness still needs human review.')
    args = parser.parse_args()
    raw = mm_data.MATCHMAKER.read_bytes()
    check(eol_consistent(raw),
          "line endings consistent (LF, or uniform CRLF from a Windows checkout)")

    script, _ = mm_data.inline_script(raw.decode("utf-8"))
    tmp_dir = mm_data.ROOT / ".roster-audit" / "tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        "w", suffix=".js", delete=False, encoding="utf-8", dir=tmp_dir
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
    meta = mm_data.load_data(names=('PHOTO_META',))['PHOTO_META']

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
    check(set(meta) <= wired, 'every PHOTO_META entry is wired')
    check(all(m.get('date') and m.get('author') and m.get('license') and m.get('source', '').startswith('https://')
              and (m['source'].startswith('https://commons.wikimedia.org/') or
                   (m.get('rightsStatus') == 'unverified' and m['license'] == 'Reuse licence unverified'
                    and (m['date'].startswith('Published ') or (m.get('dateBasis') == 'capture' and m.get('dateEvidence'))))) for m in meta.values()),
          f'all {len(meta)} reviewed-photo records have dates, author, license and source')
    manifest = json.loads((mm_data.ROSTER_DIR / 'manifest.json').read_text(encoding='utf-8'))
    check(manifest == img_map, 'generated lead manifest matches ROSTER_IMG')
    gaps = {s: max(0, 5-len(gal_map.get(s, []))) for s in slugs}
    gap_count = sum(gaps.values())
    quota_label = f'five-photo quota: {sum(v == 0 for v in gaps.values())}/{len(slugs)} profiles; {gap_count} slots missing'
    if args.require_quota:
        check(gap_count == 0, quota_label)
    else:
        print('INFO  ' + quota_label + ' (not a visual-quality pass)')

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
    expected_traits = {
        'f': set('looks class desire fun initiative purity values interests avail warmth loyalty'.split()),
        'm': set('confidence status looks spark initiative warmth loyalty values purity desire'.split()),
    }
    roster_by_slug = {c['slug']: c for c in roster}
    for slug, prof in profiles.items():
        if slug in roster_by_slug:
            c = roster_by_slug[slug]
            if set(prof.get('traits', {})) != expected_traits[c['g']]:
                bad_traits.append(f'{slug}:missing/extra trait keys')
            if prof.get('traits', {}).get('looks', {}).get('s') != c['looks']:
                bad_traits.append(f'{slug}:looks anchor drift')
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
