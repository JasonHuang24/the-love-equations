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
for required_id in (
    "lab-triage",
    "lab-triage-headline",
    "lab-triage-list",
    "lab-coverage-readout",
    "lab-research-empty-title",
    "lab-research-empty-copy",
    "lab-ledger-filter-note",
    "lab-flag-dialog",
    "lab-flag-form",
    "lab-flag-dispositions",
    "lab-flag-error",
    "lab-flag-provenance",
):
    if required_id not in id_set:
        errors.append(f"Lab relevance UI hook missing: #{required_id}")

# The flag export is a local download and nothing else. The page must keep
# saying so where a visitor decides whether to use it, not only in the report.
for disclosure in (
    "Flagging a mapping writes a JSON file to your own disk",
    "Downloads to this device only.",
    "never the full transcript",
):
    if disclosure not in html_text:
        errors.append(f"Lab flag-export privacy disclosure missing: {disclosure}")
if "Demo Test" not in html_text:
    errors.append("hero demo button must be labeled Demo Test")
if "Bring a source <" in html_text:
    errors.append("the redundant hero Bring-a-source button must stay removed")
for hook, minimum in (("data-ledger-filter=", 3), ("data-sort-key=", 7), ("data-lab-goto=", 2)):
    if html_text.count(hook) < minimum:
        errors.append(f"ledger QoL hook underrepresented: {hook} (need >= {minimum})")

css_text = (ROOT / "css" / "lab.css").read_text(encoding="utf-8")
without_comments = re.sub(r"/\*.*?\*/", "", css_text, flags=re.S)
if without_comments.count("{") != without_comments.count("}"):
    errors.append("css/lab.css has unbalanced braces")
for selector in (
    ".lab-triage", ".lab-triage-button", ".lab-triage-chip", ".lab-triage-cell",
    ".lab-sort-button", ".lab-ledger-filter-note", ".lab-adjacent-more",
    ".lab-nearest-scale",
    ".lab-section-cell", "button.lab-metric", "button.lab-assay-stage",
    ".lab-flag-dialog", ".lab-flag-disposition", ".lab-flag-privacy",
    ".lab-review-cell", ".lab-triage-button.is-flag",
):
    if selector not in css_text:
        errors.append(f"Lab QoL control has no page-specific styling: {selector}")
if ".lab-coverage-readout.is-unavailable" not in css_text:
    errors.append("Lab coverage readout has no unavailable-state styling")

# The mapped share is produced by uncalibrated thresholds; the tag saying so
# must stay next to the number, not only in the export.
if ".lab-provisional-tag" not in css_text:
    errors.append("Lab provisional coverage tag has no styling")

app_text = (ROOT / "js" / "lab-app.js").read_text(encoding="utf-8")
for phrase in (
    "No relationship-domain claims were detected in this source.",
    "Original text remains intact in Source.",
    "Coverage is unavailable because no relationship-domain claims were detected.",
    "coverage not applicable",
    "Analysis 2.2 · Queue 2.1",
    "provisional",
    "Include in analysis",
    "Exclude",
    "Included by you",
    "Nothing was sent anywhere.",
):
    if phrase not in app_text:
        errors.append(f"Lab relevance result copy missing: {phrase}")

# The ledger's message rows span the table by a constant in js/lab-ledger.js
# while the static empty row spans it by hand. They drift silently unless
# something says they must agree.
ledger_text = (ROOT / "js" / "lab-ledger.js").read_text(encoding="utf-8")
column_match = re.search(r"LEDGER_COLUMN_COUNT\s*=\s*(\d+)", ledger_text)
header_count = html_text.count('<th scope="col"', html_text.find('id="lab-map-table"'),
                               html_text.find("</thead>", html_text.find('id="lab-map-table"')))
if not column_match:
    errors.append("js/lab-ledger.js no longer exports a readable LEDGER_COLUMN_COUNT")
else:
    columns = int(column_match.group(1))
    if header_count != columns:
        errors.append(
            f"ledger table has {header_count} column headers but LEDGER_COLUMN_COUNT is {columns}"
        )
    if f'colspan="{columns}"' not in html_text:
        errors.append(f"the static empty ledger row does not span {columns} columns")

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
