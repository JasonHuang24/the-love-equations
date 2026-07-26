"""Static whole-site integrity audit for local HTML, fragments, IDs, and ARIA."""

from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html")) + sorted((ROOT / "partials").glob("*.html"))
LEXICON_FILTERS = {"black", "red", "blue"}
MYTHBUSTER_IDS = set(
    re.findall(
        r"\bid\s*:\s*['\"](M-TBD-\d+)['\"]",
        (ROOT / "js" / "mythbuster.js").read_text(encoding="utf-8"),
    )
)


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.references = []
        self.targets = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"])
        for name in ("aria-controls", "aria-labelledby", "aria-describedby", "aria-owns"):
            if values.get(name):
                self.references.extend((name, token) for token in values[name].split())
        for name in ("href", "src"):
            if values.get(name):
                self.targets.append((tag, name, values[name]))


cache = {}


def parse(path):
    if path not in cache:
        parser = SiteParser()
        parser.feed(path.read_text(encoding="utf-8"))
        parser.close()
        cache[path] = parser
    return cache[path]


def dynamic_fragment_exists(target, fragment):
    if target.name == "mythbuster.html":
        return fragment in MYTHBUSTER_IDS
    if target.name == "lexicon.html":
        return fragment in LEXICON_FILTERS
    return False


errors = []
checked_targets = 0

for source in HTML_FILES:
    document = parse(source)
    duplicate_ids = sorted(value for value, count in Counter(document.ids).items() if count > 1)
    if duplicate_ids:
        errors.append(f"{source.name}: duplicate IDs: {', '.join(duplicate_ids)}")

    source_ids = set(document.ids)
    for kind, reference in document.references:
        if reference not in source_ids:
            errors.append(f"{source.name}: {kind} references missing #{reference}")

    for tag, attribute, raw_target in document.targets:
        if (
            not raw_target
            or raw_target == "#"
            or any(marker in raw_target for marker in ("${", "{{", "<%"))
        ):
            continue
        parsed = urlsplit(raw_target)
        if parsed.scheme or parsed.netloc or raw_target.startswith("//"):
            continue

        relative_path = unquote(parsed.path)
        fragment = unquote(parsed.fragment)
        # Partials are injected into root pages, so their relative targets share
        # the repository root rather than the partials/ directory.
        target = source if not relative_path else (ROOT / relative_path.lstrip("/")).resolve()
        try:
            target.relative_to(ROOT)
        except ValueError:
            errors.append(f"{source.name}: {tag}[{attribute}] escapes the repository: {raw_target}")
            continue

        if not target.exists():
            errors.append(f"{source.name}: {tag}[{attribute}] target missing: {raw_target}")
            continue
        checked_targets += 1

        if fragment and target.suffix.lower() == ".html":
            target_ids = set(parse(target).ids)
            if fragment not in target_ids and not dynamic_fragment_exists(target, fragment):
                errors.append(f"{source.name}: fragment target missing: {raw_target}")


if errors:
    print("SITE INTEGRITY AUDIT FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(
    f"SITE INTEGRITY AUDIT PASSED "
    f"({len(HTML_FILES)} HTML files, {checked_targets} local targets, "
    f"{len(MYTHBUSTER_IDS)} rendered Mythbuster fragments)"
)
