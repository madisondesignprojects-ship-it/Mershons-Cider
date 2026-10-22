// QA: every page at 390px + 1440px (full-page screenshots), 320px overflow, broken images, H1 count, console errors, axe.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const base = process.env.QA_BASE ?? 'http://127.0.0.1:4420';
const out = new URL('.', import.meta.url).pathname;
const SUF = process.env.QA_SUFFIX ?? '';
const pages = ['', 'tasting-room/', 'contact/', 'our-story/', 'order-cider/', 'where-to-find/', 'events/', 'private-events/', '404'];
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
let fail = 0;
for (const [label, vp] of [['mobile', { width: 390, height: 844 }], ['desktop', { width: 1440, height: 900 }], ['w320', { width: 320, height: 640 }]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: label !== 'desktop', hasTouch: label !== 'desktop', timezoneId: 'America/Chicago' });
  for (const p of pages) {
    const page = await ctx.newPage(); const errs = []; const bad = [];
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    page.on('pageerror', (e) => errs.push(String(e)));
    page.on('response', (r) => { if (r.status() >= 400 && !/\/404\/?$|\/does-not-exist/.test(r.url())) bad.push(`${r.status()} ${r.url()}`); });
    const url = p === '404' ? `${base}/does-not-exist/` : `${base}/${p}`;
    const res = await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')); for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } window.scrollTo(0, 0); await new Promise((r) => setTimeout(r, 900)); });
    await page.waitForLoadState('networkidle');
    const name = (p || 'home').replace(/\/$/, '');
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
      imgs: document.images.length,
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().replace(/\s+/g, ' ')),
    }));
    let axe = [];
    if (label !== 'w320') {
      if (label === 'mobile') await page.screenshot({ path: `${out}${name}-mobile-firstscreen${SUF}.png` });
      await page.addStyleTag({ content: '.sticky-bar{position:absolute !important;bottom:auto !important;top:calc(100% - 60px)} body{position:relative} header.sticky{position:relative !important} .card.sticky{position:static !important}' });
      await page.screenshot({ path: `${out}${name}-${label}${SUF}.png`, fullPage: true });
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      axe = r.violations.filter((v) => ['serious', 'critical'].includes(v.impact)).map((v) => `${v.id}(${v.nodes.length}): ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' ; ')}`);
    }
    const status = res.status();
    const okStatus = p === '404' ? status === 404 : status === 200;
    if (p === '404') errs.splice(0, errs.length, ...errs.filter((e) => !/status of 404/.test(e)));
    const ok = okStatus && info.overflow <= 0 && !info.broken.length && info.h1.length === 1 && !errs.length && !bad.length && !axe.length;
    if (!ok) fail++;
    console.log(ok ? 'PASS' : 'FAIL', label, name, status, JSON.stringify(info), errs.join(' | '), bad.join(' | '), axe.join(' || '));
    await page.close();
  }
  await ctx.close();
}
await browser.close();
process.exit(fail ? 1 : 0);
