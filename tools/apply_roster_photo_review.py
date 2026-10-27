"""Publish an explicitly reviewed local photo selection and preserve attribution.

Spec: {"add": [{"slug", "manifest", "file", "date", "lead"?}],
       "remove": [wired paths], "leads": {slug: existing path}}.
Candidates must already have been inspected. This tool does not select images.
Removed assets are quarantined in ignored scratch; Git retains their prior bytes.
"""
import argparse
import json
import hashlib
import re
import shutil
import subprocess
import os
import tempfile
from pathlib import Path
from bs4 import BeautifulSoup
import mm_data


def js_map(data, compact=False):
    sep = ':' if compact else ': '
    return '{' + ', '.join(repr(k) + sep + repr(v) for k, v in data.items()) + '}'


def atomic_text(path, content):
    """Keep the previous complete document if a Windows file watcher blocks a write."""
    with tempfile.NamedTemporaryFile('w', encoding='utf-8', newline='\n', dir=path.parent, prefix='.roster-write-', suffix='.tmp', delete=False) as temp:
        temp.write(content)
        name = temp.name
    try:
        os.replace(name, path)
    finally:
        Path(name).unlink(missing_ok=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--spec', required=True)
    ap.add_argument('--dry-run', action='store_true')
    args = ap.parse_args()
    spec = json.loads(Path(args.spec).read_text(encoding='utf-8'))
    data = mm_data.load_data(names=mm_data.DATA_NAMES + ('PHOTO_META',))
    members = {c['slug']: c for c in data['ROSTER']}
    text = mm_data.MATCHMAKER.read_text(encoding='utf-8')
    removed = set(spec.get('remove', []))
    for slug, gallery in data['GALLERY_IMG'].items():
        data['GALLERY_IMG'][slug] = [p for p in gallery if p not in removed]
    data['ROSTER_IMG'].update(spec.get('leads', {}))
    copies, credits = [], []
    for pick in spec.get('add', []):
        slug = pick['slug']
        manifest = mm_data.ROOT / pick['manifest']
        source = next(f for f in json.loads(manifest.read_text(encoding='utf-8'))['files'] if f['file'] == pick['file'])
        public_source = source.get('rightsStatus') == 'unverified'
        assert source['source'].startswith('https://'), source
        assert source['source'].startswith('https://commons.wikimedia.org/') or (public_source and pick.get('acceptPublicSource')), 'Public-source additions must be explicitly selected and labeled.'
        if public_source:
            assert pick['date'].startswith('Published ') or (pick.get('dateBasis') == 'capture' and pick.get('dateEvidence')), 'A capture date requires explicit source-caption evidence.'
        assert source['LicenseShortName'] and source['Artist'] and pick['date'], source
        assert re.search(r'\b(19|20)\d{2}\b', pick['date']), pick
        # A plausible filename is not proof of adulthood. Check the reviewed date
        # against the roster DOB; unknown dates/ages need a separate source review.
        born = members[slug].get('born')
        birth_year = int(born[:4]) if born else members[slug].get('bornYear')
        year = int(re.search(r'\b(?:19|20)\d{2}\b', pick['date'])[0])
        assert birth_year is not None and year >= birth_year + 18, f'{slug}: adult capture date is not established'
        if born and year == birth_year + 18:
            assert re.fullmatch(r'\d{4}-\d{2}-\d{2}', pick['date']) and pick['date'][5:] >= born[5:], f'{slug}: verify the exact adult capture date'
        source_hash = hashlib.sha256((manifest.parent / pick['file']).read_bytes()).hexdigest()
        existing = next((p for p in data['GALLERY_IMG'][slug]
                         if data['PHOTO_META'].get(p, {}).get('assetSha256') == source_hash
                         or ((mm_data.ROOT/p).is_file() and hashlib.sha256((mm_data.ROOT/p).read_bytes()).hexdigest() == source_hash)), None)
        if existing:
            if pick.get('lead'):
                data['ROSTER_IMG'][slug] = existing
            continue
        folder = mm_data.ROSTER_DIR / slug
        indices = [int(p.stem) for p in folder.glob('*.jpg') if p.stem.isdigit()]
        indices += [int(Path(dst).stem) for _, dst in copies if Path(dst).parent.name == slug]
        rel = f'images/roster/{slug}/{max(indices, default=0)+1}.jpg'
        copies.append((manifest.parent / pick['file'], rel))
        data['GALLERY_IMG'][slug].append(rel)
        assert len(data['GALLERY_IMG'][slug]) <= 5, f'{slug}: would pad beyond five gallery images'
        meta = dict(date=pick['date'], source=source['source'],
                    assetSource=source.get('url', source['source']), assetSha256=source_hash,
                    author=pick.get('credit') or BeautifulSoup(source['Artist'], 'html.parser').get_text(' ', strip=True),
                    license=source['LicenseShortName'], licenseUrl=source.get('LicenseUrl', ''),
                    changes='Resized and encoded as JPEG; no generative edits.', reviewed='2026-10-27')
        if pick.get('caption'):
            meta['caption'] = pick['caption']
        if public_source:
            meta['rightsStatus'] = 'unverified'
            meta['dateBasis'] = pick.get('dateBasis', 'publication')
            if pick.get('dateEvidence'):
                meta['dateEvidence'] = pick['dateEvidence']
            data['PHOTO_STAMP'][rel] = 'Visual match · reuse rights unverified'
        data['PHOTO_META'][rel] = meta
        if pick.get('lead'):
            data['ROSTER_IMG'][slug] = rel
        credits.append((slug, rel, meta))
    wired = set(data['ROSTER_IMG'].values()) | {p for g in data['GALLERY_IMG'].values() for p in g}
    assert not (removed & wired), f'Removal still used by a lead: {removed & wired}'
    data['PHOTO_STAMP'] = {k:v for k,v in data['PHOTO_STAMP'].items() if k in wired}
    data['PHOTO_META'] = {k:v for k,v in data['PHOTO_META'].items() if k in wired}
    print(f'{len(copies)} additions, {len(removed)} removals, {len(credits)} source records')
    if args.dry_run:
        return
    for name in ['ROSTER_IMG', 'GALLERY_IMG', 'PHOTO_STAMP', 'PHOTO_META']:
        # Match the historical quote style for older wiring tools.
        if name in ['ROSTER_IMG', 'PHOTO_STAMP']:
            literal = js_map(data[name], compact=name == 'ROSTER_IMG')
        elif name == 'GALLERY_IMG':
            literal = '{' + ', '.join(repr(k)+': '+repr(v) for k,v in data[name].items()) + '}'
        else:
            literal = json.dumps(data[name], ensure_ascii=True, indent=2)
        text = mm_data.replace_literal(text, name, literal)
    # Reject a malformed page before changing any published asset or HTML file.
    script, _ = mm_data.inline_script(text)
    parsed = subprocess.run(['node', '--check'], input=script, text=True, encoding='utf-8', capture_output=True)
    if parsed.returncode:
        raise RuntimeError(parsed.stderr)
    for source, rel in copies:
        dst = mm_data.ROOT / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, dst)
    atomic_text(mm_data.MATCHMAKER, text)
    atomic_text(mm_data.ROSTER_DIR / 'manifest.json', json.dumps(dict(sorted(data['ROSTER_IMG'].items())), indent=2)+'\n')
    for rel in removed:
        src = (mm_data.ROOT / rel).resolve()
        assert src.is_relative_to(mm_data.ROSTER_DIR.resolve())
        if src.is_file():
            dst = mm_data.ROOT / '.roster-audit' / 'quarantine' / rel
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            src.unlink()
    credit_file = mm_data.ROOT / 'md' / 'roster.md'
    with credit_file.open('a', encoding='utf-8', newline='\n') as f:
        if credits:
            f.write('\n### 2026-10-27 reviewed photo additions\n\n| Profile | Asset | Source date | Photographer | Rights status | Source |\n| --- | --- | --- | --- | --- | --- |\n')
            for slug, rel, meta in credits:
                author = meta['author'].replace('|', '/')
                f.write(f"| {slug} | `{rel}` | {meta['date']} | {author} | [{meta['license']}]({meta['licenseUrl'] or meta['source']}) | [Source]({meta['source']}) |\n")
            f.write('\nImages resized and encoded as JPEG; no generative edits. Capture dates follow source captions; publication dates are explicitly labeled and are not capture dates. Public visibility is not a reuse licence.\n')


if __name__ == '__main__':
    main()
