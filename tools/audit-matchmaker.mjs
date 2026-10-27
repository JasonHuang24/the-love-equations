// Behavioral and responsive audit of the actual static page, served by Playwright routes.
// CODEX_NODE_MODULES points to the bundled Playwright dependency; Chrome is configurable.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(path.join(process.env.CODEX_NODE_MODULES, 'playwright'));
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, '.roster-audit', 'browser');
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.LE_BROWSER_EXECUTABLE || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const context = await browser.newContext({ reducedMotion: 'reduce' });
await context.route('http://matchmaker.test/**', async route => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(route.request().url()).pathname));
  if (!file.startsWith(root + path.sep)) return route.fulfill({ status: 403 });
  try {
    const body = await fs.readFile(file);
    const contentType = ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' })[path.extname(file)] || 'application/octet-stream';
    await route.fulfill({ body, contentType });
  } catch { await route.fulfill({ status: 404, body: 'Missing local asset' }); }
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
await page.goto('http://matchmaker.test/matchmaker.html');
await page.waitForFunction(() => document.querySelector('#mmw'));
const report = { errors, checks: {}, ratings: {}, profiles: [], viewports: [] };
report.ratings = await page.evaluate(() => {
  const result = currentMatches();
  const d = result.d;
  const ctx = { d, mode, uScore: 6, desiredAge: 30, wantPers: new Set(d.wantPers), wantVibe: new Set(d.wantVibe), avoidPers: new Set(d.avoidPers), avoidVibe: new Set(d.avoidVibe), looksPref: d.looksPref, reach: d.reach, looksW: d.looksW, stakes: d.stakes };
  const axes = ['class', 'fun', 'initiative', 'purity', 'warmth', 'loyalty', 'confidence', 'status'];
  const disagreements = ROSTER.flatMap(c => axes.filter(k => PROFILES[c.slug].traits[k]).map(k => ({ slug: c.slug, trait: k, authored: PROFILES[c.slug].traits[k].s, engine: round1(deriveAxis(k,c,ctx)) })).filter(x => Math.abs(x.engine-x.authored) >= 1));
  return { disagreements, examples: ['margot-robbie','susan-boyle','elizabeth-holmes','joe-exotic'].map(slug => {
    const c=ROSTER.find(c=>c.slug===slug);
    return { slug, authoredAvailability: PROFILES[slug].traits.avail?.s, engineAvailability: round1(deriveAxis('avail',c,ctx)), pairingAt10: pairProb(c,10,10,c.g), authoredPurity: PROFILES[slug].traits.purity.s, enginePurity: round1(deriveAxis('purity',c,ctx)) };
  }), defaultMatches: result.scored.map(x=>({slug:x.c.slug,score:x.a.sb.final})) };
});
await page.click('#find-btn');
report.checks.results = await page.locator('#results-host > *').count() > 0;
await page.check('#simple-toggle');
await page.click('#find-btn');
report.checks.simpleTop10 = await page.locator('.mm-srow').count() === 10;
await page.click('#simple-more');
report.checks.simpleAllWomen = await page.locator('.mm-srow').count() === 100;
await page.click('#sex-toggle [data-sex="f"]');
report.checks.inputClearsResults = await page.locator('#results-host > *').count() === 0;
await page.click('#find-btn');
await page.click('#simple-more');
report.checks.simpleAllMen = await page.locator('.mm-srow').count() === 100;
report.checks.malformedSmvFactorHandled = await page.evaluate(()=>{
  try { applySmvPackage({source:'love-equations.smv',version:1,overall:6,factors:[null]}); return true; }
  catch { return false; }
});
report.checks.failedClipboardIsReported = await page.evaluate(async()=>{
  const original=document.execCommand;
  document.execCommand=()=>false;
  const status=document.createElement('span');
  try { await copyToClipboard('test',status,'Copied'); return status.textContent.includes('Copy failed'); }
  finally { document.execCommand=original; }
});
await page.evaluate(()=>{userSex='m';openProfileFor('billie-eilish');setPwMin(false)});
const opener=page.locator('#mmw-card .mmw-photo-button').first();
await opener.focus();
await page.keyboard.press('Enter');
report.checks.keyboardOpensPhoto = await page.locator('dialog[open]').count() === 1;
for(let i=0;i<5;i++) await page.keyboard.press('Tab');
report.checks.photoContainsFocus = await page.evaluate(()=>!!document.activeElement?.closest('dialog'));
await page.keyboard.press('Escape');
report.checks.escapeRestoresPhotoFocus = await opener.evaluate(el=>document.activeElement===el);
await page.setViewportSize({width:1440,height:900});
await page.evaluate(()=>{openProfileFor('margot-robbie');setPwMin(false);document.querySelector('#mmw-card').scrollTop=0;});
await page.locator('#mmw-card img').evaluateAll(async imgs=>{imgs.forEach(im=>im.loading='eager');await Promise.all(imgs.map(im=>im.decode().catch(()=>null)))});
await page.setViewportSize({width:360,height:800});
await page.waitForTimeout(250);
report.checks.carouselArrowsFollowResize = await page.locator('#mmw-card .mmw-car-next').isVisible();
await page.evaluate(() => { setPwLock(false); setPwMin(false); });
const slugs = await page.evaluate(()=>ROSTER.map(c=>c.slug));
for (const slug of slugs) {
  const result = await page.evaluate(async slug => {
    const c=ROSTER.find(x=>x.slug===slug);
    userSex=c.g==='f'?'m':'f';
    openProfileFor(slug);
    const host=document.getElementById('mmw-card');
    const imgs=[...host.querySelectorAll('img')];
    imgs.forEach(im=>im.loading='eager');
    await Promise.all(imgs.map(im=>im.decode().catch(()=>null)));
    return {slug, factors:host.querySelectorAll('.mmw-factor').length, expectedFactors:PYRAMIDS[pwStandard].tiers.reduce((n,t)=>n+t.factors.length,0), gallery:host.querySelectorAll('.mmw-shot').length, expectedCredits:galleryShots(c).filter(s=>s.meta).length, credits:host.querySelectorAll('.mmw-photo-credit').length, failedImages:imgs.filter(im=>!im.naturalWidth).map(im=>im.getAttribute('src'))};
  },slug);
  report.profiles.push(result);
}
const sizes = [[360,800],[390,844],[560,850],[561,850],[700,900],[701,900],[768,1024],[920,900],[921,900],[980,900],[981,900],[1024,768],[1280,800],[1366,768],[1440,900],[1920,1080],[1920,1200],[2560,1440],[2560,1600],[3840,2160],[3840,2400]];
for (const [width,height] of sizes) {
  for(const mode of ['original','wide']) {
    await page.setViewportSize({width,height});
    await page.evaluate(()=>localStorage.clear());
    await page.reload();
    await page.waitForFunction(()=>document.querySelector('#mmw'));
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(mode=>{
      document.documentElement.dataset.contentWidth=mode;
      userSex='m'; simpleMode=false; applySimpleUI();
      setPwMin(true); window.scrollTo(0,0);
    },mode);
    const initial = await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
    await page.evaluate(()=>{openProfileFor('margot-robbie');setPwMin(false);document.querySelector('#mmw-card').scrollTop=0;});
    await page.locator('#mmw-card img').evaluateAll(async imgs=>{imgs.forEach(im=>im.loading='eager');await Promise.all(imgs.map(im=>im.decode().catch(()=>null)))});
    await page.waitForTimeout(250); // Let viewport and panel transitions settle before measuring.
    const profile = await page.evaluate(()=>{
      const host=document.querySelector('#mmw'), card=document.querySelector('#mmw-card'), rect=host.getBoundingClientRect();
      return {left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,cardWidth:card.clientWidth,cardScroll:card.scrollWidth,bodyScroll:document.documentElement.scrollWidth};
    });
    report.viewports.push({width,height,mode,initial,profile});
    if ([[360,800],[768,1024],[1440,900],[1920,1080],[3840,2160]].some(s=>s[0]===width&&s[1]===height)) {
      await page.screenshot({path:path.join(out,`profile-${width}-${mode}.png`)});
      await page.evaluate(()=>{const card=document.querySelector('#mmw-card');card.scrollTop=(card.scrollHeight-card.clientHeight)/2;});
      await page.screenshot({path:path.join(out,`profile-middle-${width}-${mode}.png`)});
      await page.evaluate(()=>{document.querySelector('#mmw-card').scrollTop=10000});
      await page.screenshot({path:path.join(out,`profile-end-${width}-${mode}.png`)});
    }
  }
}
report.checks.allProfilesRender = report.profiles.every(p=>p.factors===p.expectedFactors&&!p.failedImages.length);
report.checks.everyGalleryHasFive = report.profiles.every(p=>p.gallery===5);
report.checks.allReviewedPhotosShowCredits = report.profiles.every(p=>p.credits===p.expectedCredits);
report.checks.noViewportOverflow = report.viewports.every(v=>v.initial.scroll<=v.width+1&&v.profile.bodyScroll<=v.width+1&&v.profile.cardScroll<=v.profile.cardWidth+1&&v.profile.left>=0&&v.profile.right<=v.width+1);
const storagePage=await context.newPage();
const storageErrors=[];
storagePage.on('pageerror',e=>storageErrors.push(e.message));
await storagePage.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new DOMException('Blocked','SecurityError')}});
await storagePage.goto('http://matchmaker.test/matchmaker.html');
report.checks.blockedStorageBoots = await storagePage.locator('#mmw').count()===1 && storageErrors.length===0;
report.storageErrors=storageErrors;
await storagePage.close();
for (const slug of ['billie-eilish','jeff-bezos','whispersred','george-santos']) {
  for (const width of [390,1440]) {
    await page.setViewportSize({width,height:900});
    await page.evaluate(slug=>{userSex=ROSTER.find(c=>c.slug===slug).g==='f'?'m':'f';openProfileFor(slug);setPwMin(false);document.querySelector('#mmw-card').scrollTop=0;},slug);
    await page.locator('#mmw-card img').evaluateAll(async imgs=>{imgs.forEach(im=>im.loading='eager');await Promise.all(imgs.map(im=>im.decode().catch(()=>null)))});
    await page.waitForTimeout(250);
    await page.screenshot({path:path.join(out,`credits-${slug}-${width}.png`)});
  }
}
await page.setViewportSize({width:1440,height:1800});
for (let start=0;start<200;start+=100) {
  await page.evaluate(start=>{
    let style=document.querySelector('#avatar-audit-style');
    if(!style){style=document.createElement('style');style.id='avatar-audit-style';style.textContent='body > *:not(#avatar-audit-grid){display:none!important} #avatar-audit-grid{display:grid;grid-template-columns:repeat(10,1fr);gap:12px;padding:12px} .avatar-audit-cell{height:156px;text-align:center;font:12px sans-serif}';document.head.append(style);}
    let grid=document.querySelector('#avatar-audit-grid');if(!grid){grid=document.createElement('div');grid.id='avatar-audit-grid';document.body.append(grid);}
    grid.innerHTML=ROSTER.slice(start,start+100).map(c=>`<div class="avatar-audit-cell"><span class="mm-avatar mmw-hero-av">${avInitials(c)}${avatarPhoto(c)}</span><div>${escHtml(c.name)}</div></div>`).join('');window.scrollTo(0,0);
  },start);
  await page.locator('#avatar-audit-grid img').evaluateAll(async imgs=>{imgs.forEach(im=>im.loading='eager');await Promise.all(imgs.map(im=>im.decode().catch(()=>null)))});
  await page.screenshot({path:path.join(out,`avatars-${start}.png`)});
}
await fs.writeFile(path.join(out,'audit.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({checks:report.checks,errors,profiles:report.profiles.length,viewportStates:report.viewports.length,traitDisagreements:report.ratings.disagreements.length,examples:report.ratings.examples,overflow:report.viewports.filter(v=>v.profile.cardScroll>v.profile.cardWidth+1||v.initial.scroll>v.width+1)}));
await browser.close();
if(errors.length || Object.values(report.checks).some(v=>v!==true)) process.exitCode=1;
