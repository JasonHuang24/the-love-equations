from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


class AuditParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []
        self.refs = []
        self.links = []
        self.labels = []
        self.buttons = []
        self._button_depth = 0
        self._button_text = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if "id" in values:
            self.ids.append(values["id"])
        for name in ("aria-controls", "aria-labelledby", "aria-describedby"):
            if values.get(name):
                self.refs.extend((name, token) for token in values[name].split())
        if tag == "label" and values.get("for"):
            self.labels.append(values["for"])
        for name in ("href", "src"):
            if values.get(name):
                self.links.append((tag, name, values[name]))
        if tag == "button":
            self._button_depth += 1
            self._button_text.append([values.get("aria-label", "")])

    def handle_endtag(self, tag):
        if tag == "button" and self._button_depth:
            self.buttons.append(" ".join(self._button_text.pop()).strip())
            self._button_depth -= 1

    def handle_data(self, data):
        if self._button_depth:
            self._button_text[-1].append(data.strip())


def parse(path):
    parser = AuditParser()
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()
    return parser


errors = []
lab_path = ROOT / "lab.html"
lab = parse(lab_path)
id_set = set(lab.ids)
duplicates = sorted({value for value in lab.ids if lab.ids.count(value) > 1})
if duplicates:
    errors.append(f"duplicate IDs: {', '.join(duplicates)}")

for kind, reference in lab.refs:
    if reference not in id_set:
        errors.append(f"{kind} references missing #{reference}")

for reference in lab.labels:
    if reference not in id_set:
        errors.append(f"label references missing #{reference}")

for index, text in enumerate(lab.buttons, start=1):
    if not text:
        errors.append(f"button {index} has no accessible text")

for tag, attr, target in lab.links:
    parsed = urlparse(target)
    if parsed.scheme or target.startswith("//") or target.startswith("data:"):
        continue
    path_text, _, fragment = target.partition("#")
    target_path = lab_path if not path_text else (ROOT / path_text.split("?", 1)[0])
    if not target_path.exists():
        errors.append(f"{tag}[{attr}] target missing: {target}")
        continue
    if fragment and target_path.suffix.lower() == ".html":
        target_parser = lab if target_path.resolve() == lab_path.resolve() else parse(target_path)
        if fragment not in set(target_parser.ids):
            errors.append(f"fragment target missing: {target}")

html_text = lab_path.read_text(encoding="utf-8")
if "innerHTML" in html_text:
    errors.append("lab.html contains an innerHTML pattern")
if 'data-page="lab"' not in html_text:
    errors.append("lab body is missing data-page=lab")
if 'id="lab-app"' not in html_text or 'id="lab-workspace"' not in html_text:
    errors.append("Lab root/workspace hooks missing")

app_text = (ROOT / "js" / "lab-app.js").read_text(encoding="utf-8")
cache_key_patterns = {
    "css/lab.css": r'css/lab\.css\?v=([0-9.]+)',
    "js/lab-app.js": r'js/lab-app\.js\?v=([0-9.]+)',
    "data/le-canon-index.json": r'data/le-canon-index\.json\?v=([0-9.]+)',
}
cache_versions = {}
for asset, pattern in cache_key_patterns.items():
    source = app_text if asset.startswith("data/") else html_text
    match = re.search(pattern, source)
    if not match:
        errors.append(f"{asset} is missing an explicit cache key")
    else:
        cache_versions[asset] = match.group(1)
if len(set(cache_versions.values())) > 1:
    errors.append(
        "LE Lab cache keys disagree: "
        + ", ".join(f"{asset}={version}" for asset, version in cache_versions.items())
    )
if any(version == "1.0" for version in cache_versions.values()):
    errors.append("LE Lab still exposes the stale v=1.0 asset/index cache key")

css_text = (ROOT / "css" / "lab.css").read_text(encoding="utf-8")
without_comments = re.sub(r"/\*.*?\*/", "", css_text, flags=re.S)
if without_comments.count("{") != without_comments.count("}"):
    errors.append("css/lab.css has unbalanced braces")

nav_text = (ROOT / "partials" / "navigation-bar.html").read_text(encoding="utf-8")
footer_text = (ROOT / "partials" / "footer.html").read_text(encoding="utf-8")
if nav_text.count('data-page="lab"') != 1:
    errors.append("navigation must contain exactly one Lab destination")
if footer_text.count('href="lab.html"') != 1:
    errors.append("footer must contain exactly one Lab destination")

if errors:
    print("LAB UI AUDIT FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(
    "LAB UI AUDIT PASSED "
    f"({len(lab.ids)} unique IDs, {len(lab.refs)} ARIA references, "
    f"{len(lab.labels)} labels, {len(lab.buttons)} named buttons)"
)
