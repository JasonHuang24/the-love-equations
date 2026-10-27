"""Stage public-image search results for manual review; never publish automatically.

Input rows: {slug, title, source, image}. Source HTML and its published-date
metadata are retained. Public visibility is NOT represented as a reuse licence.
"""
import argparse
import hashlib
import io
import json
import re
import time
import urllib.request
from collections import defaultdict
from pathlib import Path
from PIL import Image
from bs4 import BeautifulSoup
import fetch_roster_audit_candidates as sheets

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.roster-audit' / 'public-review'
UA = 'TheLoveEquationsRosterAudit/1.0 (public image provenance review)'


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=20) as r:
        return r.read(20_000_000)


def collect_dates(value, result):
    if isinstance(value, dict):
        for k, v in value.items():
            if k in ['datePublished', 'dateCreated', 'uploadDate']:
                result.append({'kind': k, 'value': str(v)})
            else:
                collect_dates(v, result)
    elif isinstance(value, list):
        for v in value:
            collect_dates(v, result)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--spec', required=True)
    ap.add_argument('--limit', type=int, default=8)
    args = ap.parse_args()
    groups = defaultdict(list)
    for item in json.loads(Path(args.spec).read_text(encoding='utf-8')):
        if item['image'] not in [r['image'] for r in groups[item['slug']]]:
            groups[item['slug']].append(item)
    sheets.OUT = OUT
    for slug, items in groups.items():
        folder = OUT / slug
        folder.mkdir(parents=True, exist_ok=True)
        manifest = folder / 'sources.json'
        saved = json.loads(manifest.read_text(encoding='utf-8')) if manifest.exists() else {'slug':slug, 'files':[], 'errors':[]}
        done = {r['url'] for r in saved['files']}
        for item in items[:args.limit]:
            if item['image'] in done:
                continue
            key = hashlib.sha256(item['image'].encode()).hexdigest()[:12]
            row = dict(title=item['title'], source=item['source'], url=item['image'],
                       file=key+'.jpg', rightsStatus='unverified', LicenseShortName='Reuse licence unverified',
                       LicenseUrl='', Artist='Photographer uncredited in search result',
                       DateTimeOriginal='', ImageDescription=item['title'], pageDates=[])
            try:
                raw = get(item['image'])
                im = Image.open(io.BytesIO(raw)).convert('RGB')
                if min(im.size) < 240:
                    continue
                row['width'], row['height'] = im.size
                im.thumbnail((960,1280))
                im.save(folder/row['file'],quality=90)
                try:
                    body=get(item['source']).decode('utf-8','replace')
                    (folder/(key+'.html')).write_text(body,encoding='utf-8')
                    soup=BeautifulSoup(body,'html.parser')
                    for tag in soup.select('meta[property="article:published_time"], meta[name="date"], meta[itemprop="datePublished"], time[datetime]'):
                        row['pageDates'].append({'kind':tag.get('property',tag.get('itemprop',tag.name)), 'value':tag.get('content',tag.get('datetime',''))})
                    for tag in soup.select('script[type="application/ld+json"]'):
                        try: collect_dates(json.loads(tag.get_text()),row['pageDates'])
                        except (ValueError,TypeError): pass
                    row['pageTitle']=soup.title.get_text() if soup.title else ''
                    plain=soup.get_text(' ',strip=True)
                    row['dateSnippets']=re.findall(r'.{0,55}(?:Added|Published|Uploaded|posted).{0,110}',plain,re.I)[:8]
                    (folder/(key+'.txt')).write_text(plain,encoding='utf-8')
                except Exception as e:
                    row['pageError']=str(e)
                saved['files'].append(row)
            except Exception as e:
                saved['errors'].append({'url':item['image'],'error':str(e)})
            manifest.write_text(json.dumps(saved,ensure_ascii=False,indent=2),encoding='utf-8')
            time.sleep(1)
        if saved['files']:
            sheets.sheet(saved)
        print(slug, len(saved['files']), 'staged public candidates; rights unverified',flush=True)


if __name__ == '__main__':
    main()
