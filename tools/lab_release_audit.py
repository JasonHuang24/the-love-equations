from pathlib import Path
from urllib.parse import parse_qs, urlsplit
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
LAB_HTML = ROOT / "lab.html"
LAB_MODULE_DIR = ROOT / "js"
# Every relative module reached from lab-app.js is part of the release boundary
# unless it is deliberately listed here as a shared, independently deployed module.
SHARED_SITE_MODULES = set()

EXPECTED_LAB_MODULES = {
    path.relative_to(ROOT).as_posix()
    for path in LAB_MODULE_DIR.glob("lab-*.js")
}
EXPECTED_LAB_RESOURCES = {
    "css/lab.css",
    "data/le-canon-index.json",
}

HTML_REF_RE = re.compile(r"""(?:href|src)=["']([^"']+)["']""")
MODULE_FROM_RE = re.compile(
    r"""(?ms)^[ \t]*(?:import\s+(?:\{.*?\}|\*.*?|[A-Za-z_$].*?)\s+from|"""
    r"""export\s+(?:\{.*?\}|\*)\s+from)\s*["']([^"']+)["']"""
)
SIDE_EFFECT_IMPORT_RE = re.compile(r"""(?m)^[ \t]*import\s*["']([^"']+)["']""")
DYNAMIC_IMPORT_RE = re.compile(r"""\bimport\(\s*["']([^"']+)["']\s*\)""")
MODULE_URL_RE = re.compile(r"""\bnew\s+URL\(\s*["']([^"']+\.js(?:\?[^"']*)?)["']""")
DIRECT_WORKER_RE = re.compile(r"""\bnew\s+Worker\(\s*["']([^"']+)["']""")
DATA_REF_RE = re.compile(r"""["']((?:\./)?data/[^"']+\.json(?:\?[^"']*)?)["']""")
HTTP_REF_RE = re.compile(r"""https?://[^"'()\s]+""")
CSS_IMPORT_RE = re.compile(r"""@import\s+(?:url\(\s*)?["']([^"']+)["']""")


errors = []
release_references = []
graph_edges = []
external_references = set()
shared_modules = set()
reachable_modules = set()
reachable_resources = set()


def add_error(message):
    if message not in errors:
        errors.append(message)


def release_token(owner, reference):
    parsed = urlsplit(reference)
    query = parse_qs(parsed.query, keep_blank_values=True)
    values = query.get("v", [])
    if len(values) != 1 or not values[0]:
        add_error(f"{owner} references {reference} without exactly one non-empty v token")
        return None
    if set(query) != {"v"}:
        add_error(f"{owner} references {reference} with unsupported release query keys")
    token = values[0]
    if token == "1.0":
        add_error(f"{owner} regressed {reference} to the stale v=1.0 token")
    release_references.append((owner, reference, token))
    return token


def root_relative(path):
    try:
        return path.resolve().relative_to(ROOT.resolve()).as_posix()
    except ValueError:
        return None


def resolve_module(owner, reference, kind):
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc or reference.startswith("//"):
        external_references.add(reference)
        return None
    if not parsed.path.endswith(".js"):
        add_error(f"{owner} has a non-JavaScript {kind} edge: {reference}")
        return None
    if not parsed.path.startswith(("./", "../")):
        add_error(f"{owner} has a bare first-party {kind} specifier: {reference}")
        return None

    owner_path = ROOT / owner
    target = (owner_path.parent / parsed.path).resolve()
    relative = root_relative(target)
    if relative is None:
        add_error(f"{owner} resolves {reference} outside the repository")
        return None
    if not target.exists():
        add_error(f"{owner} references missing module {relative}")
        return None

    if relative in SHARED_SITE_MODULES:
        shared_modules.add(relative)
        return None

    release_token(owner, reference)
    graph_edges.append((owner, relative, kind))
    return relative


html_text = LAB_HTML.read_text(encoding="utf-8")
html_references = list(HTML_REF_RE.findall(html_text))
external_references.update(ref for ref in html_references if urlsplit(ref).scheme in {"http", "https"})

html_targets = {}
for reference in html_references:
    path = urlsplit(reference).path.lstrip("/")
    if path in {"css/lab.css", "js/lab-app.js"}:
        html_targets.setdefault(path, []).append(reference)

for required in ("css/lab.css", "js/lab-app.js"):
    references = html_targets.get(required, [])
    if len(references) != 1:
        add_error(f"lab.html must reference {required} exactly once; found {len(references)}")
        continue
    release_token("lab.html", references[0])
    if not (ROOT / required).exists():
        add_error(f"lab.html references missing resource {required}")

entry_module = "js/lab-app.js"
queue = [entry_module] if (ROOT / entry_module).exists() else []

while queue:
    module = queue.pop(0)
    if module in reachable_modules:
        continue
    reachable_modules.add(module)
    module_path = ROOT / module
    text = module_path.read_text(encoding="utf-8")
    external_references.update(HTTP_REF_RE.findall(text))

    module_edges = []
    module_edges.extend(("static import", ref) for ref in MODULE_FROM_RE.findall(text))
    module_edges.extend(("side-effect import", ref) for ref in SIDE_EFFECT_IMPORT_RE.findall(text))
    dynamic_references = DYNAMIC_IMPORT_RE.findall(text)
    module_edges.extend(("dynamic import", ref) for ref in dynamic_references)
    dynamic_calls = re.findall(r"\bimport\s*\(", text)
    if len(dynamic_calls) != len(dynamic_references):
        add_error(f"{module} has a dynamic import without an inspectable literal URL")

    worker_edges = list(MODULE_URL_RE.findall(text))
    worker_edges.extend(DIRECT_WORKER_RE.findall(text))
    if "new Worker(" in text and not worker_edges:
        add_error(f"{module} constructs a worker without an inspectable literal module URL")
    module_edges.extend(("worker module", ref) for ref in worker_edges)

    for kind, reference in module_edges:
        target = resolve_module(module, reference, kind)
        if target and target not in reachable_modules:
            queue.append(target)

    for reference in DATA_REF_RE.findall(text):
        parsed = urlsplit(reference)
        resource = parsed.path[2:] if parsed.path.startswith("./") else parsed.path
        if not (ROOT / resource).exists():
            add_error(f"{module} references missing runtime data {resource}")
            continue
        reachable_resources.add(resource)
        release_token(module, reference)

missing_modules = sorted(EXPECTED_LAB_MODULES - reachable_modules)
if missing_modules:
    add_error("Lab modules dropped out of traversal: " + ", ".join(missing_modules))

css_path = ROOT / "css" / "lab.css"
if css_path.exists():
    css_text = css_path.read_text(encoding="utf-8")
    for reference in CSS_IMPORT_RE.findall(css_text):
        if urlsplit(reference).scheme in {"http", "https"}:
            external_references.add(reference)
        else:
            release_token("css/lab.css", reference)
else:
    add_error("css/lab.css is missing")
reachable_resources.add("css/lab.css")

missing_resources = sorted(EXPECTED_LAB_RESOURCES - reachable_resources)
unexpected_resources = sorted(reachable_resources - EXPECTED_LAB_RESOURCES)
if missing_resources:
    add_error("Lab resources dropped out of traversal: " + ", ".join(missing_resources))
if unexpected_resources:
    add_error("Unexpected traversed Lab resources: " + ", ".join(unexpected_resources))

tokens = {token for _, _, token in release_references if token}
if len(tokens) != 1:
    formatted = ", ".join(
        f"{owner} -> {reference} ({token or 'missing'})"
        for owner, reference, token in release_references
    )
    add_error(f"Lab release tokens disagree: {formatted}")

active_token = next(iter(tokens), None)
if active_token:
    for reference in sorted(external_references):
        query = parse_qs(urlsplit(reference).query)
        if active_token in query.get("v", []):
            add_error(f"external dependency incorrectly carries the Lab v={active_token} token: {reference}")

if errors:
    print("LAB RELEASE AUDIT FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(
    "LAB RELEASE AUDIT PASSED "
    f"({len(reachable_modules)} modules, {len(graph_edges)} module edges, "
    f"{len(reachable_resources)} release resources, v={active_token})"
)
