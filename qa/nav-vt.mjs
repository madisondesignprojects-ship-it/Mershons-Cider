// Verify cross-document view transitions fire on click navigation and that page scripts re-init on each page.
import { chromium } from 'playwright';
const base = process.env.QA_BASE ?? 'http://127.0.0.1:4420';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, timezoneId: 'America/Chicago' });
const p = await ctx.newPage(); const errs = [];
p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
const out = [];
await p.goto(base + '/');
await p.waitForTimeout(800);
const state = async (label) => out.push({ label, url: p.url().replace(base, ''), vt: await p.evaluate(() => window.__vt), badge: await p.textContent('[data-open-badge] [data-text]'), revealed: await p.evaluate(() => document.querySelectorAll('.is-in').length), js: await p.evaluate(() => document.documentElement.className) });
await state('home load');
await p.click('header nav a[href="/order-cider/"]'); await p.waitForLoadState('networkidle'); await p.waitForTimeout(900); await state('-> order-cider');
await p.click('header nav a[href="/where-to-find/"]'); await p.waitForLoadState('networkidle'); await p.waitForTimeout(900); await state('-> where-to-find');
await p.fill('[data-finder-q]', 'stoughton'); const finder = await p.textContent('[data-finder-count]');
await p.click('header nav a[href="/tasting-room/"]'); await p.waitForLoadState('networkidle'); await p.waitForTimeout(900); await state('-> tasting-room');
await p.click('[data-map-load]'); const map = await p.locator('[data-map] iframe').count();
await p.goBack(); await p.waitForLoadState('networkidle'); await p.waitForTimeout(600); await state('back');
// mobile menu after navigation
const m = await b.newPage({ viewport: { width: 390, height: 844 } });
await m.goto(base + '/'); await m.click('[data-menu-open]'); await m.click('[data-menu] a[href="/contact/"]'); await m.waitForLoadState('networkidle'); await m.waitForTimeout(700);
const mvt = await m.evaluate(() => window.__vt); await m.click('[data-menu-open]'); const menu = await m.isVisible('[data-menu]');
await m.keyboard.press('Escape');
await m.click('#contact-form button[type=submit]'); const form = await m.textContent('#contact-form [data-form-msg]');
console.log(JSON.stringify({ out, finder, map, mobileVT: mvt, menuAfterNav: menu, form, errs }, null, 1));
await b.close();
