"""Shared extraction of matchmaker.html inline data (ROSTER, PROFILES, image maps).

The dicts live as JS literals inside the single inline <script>. We slice each
literal out with a string/comment-aware balanced scanner and let node evaluate
them (handles every escape exactly like the browser), then read JSON back.
"""

import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MATCHMAKER = ROOT / "matchmaker.html"
ROSTER_DIR = ROOT / "images" / "roster"

DATA_NAMES = ("ROSTER", "PROFILES", "ROSTER_IMG", "GALLERY_IMG", "PHOTO_STAMP")


def extract_literal(text, name):
    """Return the source text of `const <name> = <literal>` (the literal only)."""
    m = re.search(rf"const {name}\s*=\s*", text)
    if not m:
        raise KeyError(f"const {name} not found")
    i = m.end()
    if text[i] not in "[{":
        raise ValueError(f"const {name} does not open with a bracket")
    depth = 0
    j = i
    n = len(text)
    while j < n:
        ch = text[j]
        if ch in "\"'`":
            quote = ch
            j += 1
            while j < n:
                if text[j] == "\\":
                    j += 2
                    continue
                if text[j] == quote:
                    break
                j += 1
        elif ch == "/" and j + 1 < n and text[j + 1] == "/":
            nl = text.find("\n", j)
            j = n if nl == -1 else nl
        elif ch == "/" and j + 1 < n and text[j + 1] == "*":
            end = text.find("*/", j)
            j = n if end == -1 else end + 1
        elif ch in "[{":
            depth += 1
        elif ch in "]}":
            depth -= 1
            if depth == 0:
                return text[i : j + 1]
        j += 1
    raise ValueError(f"const {name}: unbalanced brackets")


def asset_rev(text=None):
    text = text or MATCHMAKER.read_text(encoding="utf-8")
    m = re.search(r"const ROSTER_ASSET_REV = '([^']+)'", text)
    if not m:
        raise KeyError("ROSTER_ASSET_REV not found")
    return m.group(1)


def load_data(names=DATA_NAMES):
    text = MATCHMAKER.read_text(encoding="utf-8")
    parts = [f"const {n} = {extract_literal(text, n)};" for n in names]
    js = "\n".join(parts) + (
        "\nprocess.stdout.write(JSON.stringify({" + ",".join(names) + "}));"
    )
    tmp_dir = ROOT / ".roster-audit" / "tmp"
    tmp_dir.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        "w", suffix=".js", delete=False, encoding="utf-8", dir=tmp_dir
    ) as f:
        f.write(js)
        tmp = f.name
    try:
        out = subprocess.run(
            ["node", tmp], capture_output=True, text=True, encoding="utf-8"
        )
        if out.returncode != 0:
            raise RuntimeError(f"node eval failed:\n{out.stderr}")
        data = json.loads(out.stdout)
    finally:
        Path(tmp).unlink(missing_ok=True)
    data["ROSTER_ASSET_REV"] = asset_rev(text)
    return data


def inline_script(text=None):
    """Return (script_source, start_line) of the single inline <script> block."""
    text = text or MATCHMAKER.read_text(encoding="utf-8")
    m = re.search(r"<script>\r?\n(.*)\r?\n  </script>", text, re.S)
    if not m:
        raise ValueError("inline <script> block not found")
    return m.group(1), text[: m.start()].count("\n") + 2
