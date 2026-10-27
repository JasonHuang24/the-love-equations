"""Download review candidates, never publish them or infer identity from search rank.

Uses Commons' public API and retains per-file attribution/license/date metadata.
The spec is a list of {slug, name, query?}; output stays in .roster-audit/.
Existing metadata makes a run resumable. Human visual/source review is required.
"""
import argparse
import hashlib
import io
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.roster-audit' / 'commons-review'
UA = 'TheLoveEquationsRosterAudit/1.0 (public photo attribution and quality review)'
LAST_REQUEST = 0


def get(url):
    global LAST_REQUEST
    for attempt in range(3):
        time.sleep(max(0, 1.2 - (time.monotonic() - LAST_REQUEST)))
        LAST_REQUEST = time.monotonic()
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=25) as r:
                return r.read()
        except Exception as e:
            if getattr(e, 'code', None) == 429:
                # Stop this job; the caller backs off before any further request.
                raise
            if attempt == 2:
                raise
            time.sleep(1 + attempt)


def fetch(job, limit):
    folder = OUT / job['slug']
    folder.mkdir(parents=True, exist_ok=True)
    manifest = folder / 'sources.json'
    if manifest.exists():
        saved = json.loads(manifest.read_text(encoding='utf-8'))
        if not saved.get('error') and not saved.get('download_errors') and saved.get('query') == job.get('query', '"' + job['name'] + '" filetype:bitmap'):
            return saved
    params = dict(action='query', format='json', generator='search', gsrnamespace=6,
                  gsrsearch=job.get('query', '"' + job['name'] + '" filetype:bitmap'), gsrlimit=limit,
                  prop='imageinfo', iiprop='url|size|extmetadata', iiurlwidth=960)
    if job.get('titles'):
        params = dict(action='query', format='json', titles='|'.join(job['titles']),
                      prop='imageinfo', iiprop='url|size|extmetadata', iiurlwidth=960)
    if job.get('category'):
        params = dict(action='query', format='json', generator='categorymembers',
                      gcmtitle='Category:'+job['category'], gcmnamespace=6, gcmlimit=50,
                      prop='imageinfo', iiprop='url|size|extmetadata', iiurlwidth=960)
    result = {'slug': job['slug'], 'name': job['name'], 'query': params.get('gsrsearch', params.get('titles', params.get('gcmtitle'))), 'files': []}
    try:
        response = json.loads(get('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params)))
        pages = sorted(response.get('query', {}).get('pages', {}).values(), key=lambda p: p.get('index', 0))
        if job.get('category'):
            # One candidate per source date avoids downloading whole event bursts.
            varied, seen_dates = [], set()
            for page in pages:
                info = page.get('imageinfo', [{}])[0]
                date = info.get('extmetadata', {}).get('DateTimeOriginal', {}).get('value', '')
                year = re.search(r'\b(?:19|20)\d{2}\b', date)
                if not year or int(year[0]) < job.get('minYear', 1900):
                    continue
                date_key = date[:10] if re.match(r'\d{4}-\d{2}-\d{2}', date) else year[0]
                if date_key in seen_dates or re.search(r'logo|signature|wax|statue|mural|album|poster|chart', page['title'], re.I):
                    continue
                seen_dates.add(date_key)
                varied.append(page)
            pages = varied[:limit]
        for page in pages:
            info = page.get('imageinfo', [{}])[0]
            if 'url' not in info:
                continue
            title = page['title']
            if min(info.get('width', 0), info.get('height', 0)) < 300:
                continue
            if not re.search(r'\.(jpe?g|png|webp)$', title, re.I):
                continue
            meta = info.get('extmetadata', {})
            fields = {k: meta.get(k, {}).get('value', '') for k in
                      ['Artist', 'Credit', 'LicenseShortName', 'LicenseUrl', 'UsageTerms', 'ImageDescription', 'DateTimeOriginal', 'Copyrighted']}
            record = {'title': title, 'source': info.get('descriptionurl'), 'url': info['url'],
                      'width': info['width'], 'height': info['height'], **fields}
            filename = hashlib.sha256(title.encode()).hexdigest()[:12] + '.jpg'
            try:
                # Use the preview Commons actually serves on its file page. API-generated
                # arbitrary thumbnail sizes can trigger an expensive uncached render/429.
                source_page = BeautifulSoup(get(record['source']), 'html.parser')
                preview = source_page.select_one('.fullImageLink img')
                record['preview_url'] = preview['src'] if preview else info.get('thumburl', info['url'])
                raw = get(record['preview_url'])
                im = Image.open(io.BytesIO(raw)).convert('RGB')
                im.thumbnail((640, 900))
                im.save(folder / filename, quality=90)
                record['file'] = filename
                result['files'].append(record)
            except Exception as e:
                result.setdefault('download_errors', []).append({'title': title, 'url': getattr(e, 'url', ''), 'error': str(e)})
                # Commons also uses 429 for an unavailable thumbnail render. Skip that
                # individual asset; a general rate-limit response stops the whole job.
                if getattr(e, 'code', None) == 429 and 'thumbnail images' not in str(e):
                    break
            time.sleep(.3)
    except Exception as e:
        result['error'] = str(e)
    manifest.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(job['slug'], len(result['files']), 'candidates', result.get('error', ''), flush=True)
    return result


def sheet(result):
    files = result['files']
    if not files:
        return
    font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 15)
    small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 12)
    width, height = 230, 255
    canvas = Image.new('RGB', (width * 6, 30 + height * ((len(files) + 5) // 6)), '#f4f0e9')
    draw = ImageDraw.Draw(canvas)
    draw.text((5, 3), result['slug'], fill='black', font=font)
    for n, item in enumerate(files):
        x, y = (n % 6) * width, 30 + (n // 6) * height
        im = Image.open(OUT / result['slug'] / item['file'])
        im.thumbnail((220, 205))
        canvas.paste(im, (x + (220 - im.width) // 2, y))
        draw.text((x+3, y+207), f"{n+1}: {item['file']}", fill='black', font=small)
        draw.text((x+3, y+224), item['title'][5:37], fill='black', font=small)
        draw.text((x+3, y+239), re.sub('<[^>]+>', '', item['DateTimeOriginal'])[:32], fill='black', font=small)
    canvas.save(OUT / result['slug'] / 'sheet.jpg', quality=90)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--spec', required=True)
    ap.add_argument('--limit', type=int, default=12)
    args = ap.parse_args()
    jobs = json.loads(Path(args.spec).read_text(encoding='utf-8'))
    for job in jobs:
        result = fetch(job, args.limit)
        sheet(result)
        general_limits = [e for e in result.get('download_errors', []) if '429' in e['error'] and 'thumbnail images' not in e['error']]
        if general_limits or '429' in result.get('error', ''):
            print('Commons rate limit: pausing requests for 60 seconds.', flush=True)
            time.sleep(60)
        else:
            time.sleep(3)


if __name__ == '__main__':
    main()
