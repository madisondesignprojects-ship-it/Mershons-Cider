// Open-now badge + today's row, computed in America/Chicago.
type H = { day: string; open: string; close: string };
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const NAMES: Record<string, string> = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };
const fmt = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''} ${h >= 12 ? 'PM' : 'AM'}`; };
function chicagoNow() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  return { day: g('weekday').toLowerCase().slice(0, 3), mins: Number(g('hour')) * 60 + Number(g('minute')) };
}
const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
function state(hours: H[]) {
  const now = chicagoNow(); const today = hours.find((h) => h.day === now.day);
  if (today && now.mins >= toMin(today.open) && now.mins < toMin(today.close)) return { open: true, text: `Open now · until ${fmt(today.close)}` };
  if (today && now.mins < toMin(today.open)) return { open: false, text: `Opens today at ${fmt(today.open)}` };
  const i = DAYS.indexOf(now.day);
  for (let k = 1; k <= 7; k++) { const d = DAYS[(i + k) % 7]; const h = hours.find((x) => x.day === d); if (h) return { open: false, text: `Closed · opens ${k === 1 ? 'tomorrow' : NAMES[d]} ${fmt(h.open)}` }; }
  return { open: false, text: 'Open Wed–Sun' };
}
document.querySelectorAll<HTMLElement>('[data-open-badge]').forEach((el) => {
  const s = state(JSON.parse(el.dataset.hours!));
  el.querySelector('[data-text]')!.textContent = s.text;
  const dot = el.querySelector<HTMLElement>('[data-dot]')!;
  if (s.open) { dot.style.background = '#3FB950'; dot.style.boxShadow = '0 0 0 3px rgba(63,185,80,.25)'; }
});
{
  const d = chicagoNow().day;
  document.querySelectorAll(`[data-hours-table] tr[data-day="${d}"]`).forEach((tr) => {
    tr.classList.add('today'); tr.querySelectorAll('th,td').forEach((c) => { c.classList.remove('text-parchment', 'text-muted'); c.classList.add('text-ink'); });
    const l = tr.querySelector('.today-label'); if (l) l.textContent = ' (today)';
  });
}

// Click-to-load map.
document.querySelectorAll<HTMLElement>('[data-map]').forEach((wrap) => {
  wrap.querySelector('[data-map-load]')?.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = wrap.dataset.src!; f.title = wrap.dataset.title!; f.loading = 'lazy';
    f.referrerPolicy = 'no-referrer-when-downgrade'; f.className = 'absolute inset-0 h-full w-full border-0';
    wrap.querySelector('[data-map-card]')?.remove(); wrap.appendChild(f); f.focus();
  });
});

// Mobile menu: focus trap, Esc, scroll lock.
{
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (menu && opener) {
    const focusables = () => [...menu.querySelectorAll<HTMLElement>('a[href],button')];
    const close = () => { menu.classList.add('hidden'); document.documentElement.style.overflow = ''; opener.setAttribute('aria-expanded', 'false'); opener.focus(); };
    opener.addEventListener('click', () => { menu.classList.remove('hidden'); document.documentElement.style.overflow = 'hidden'; opener.setAttribute('aria-expanded', 'true'); focusables()[1]?.focus(); });
    menu.querySelector('[data-menu-close]')?.addEventListener('click', close);
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        const f = focusables(); const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
}

// Mail-composer forms (static site, no backend).
document.querySelectorAll<HTMLFormElement>('[data-mailform]').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = form.querySelector('[data-form-msg]')!;
    const missing = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[required]')].filter((f) => !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value)));
    form.querySelectorAll('[aria-invalid]').forEach((f) => f.removeAttribute('aria-invalid'));
    if (missing.length) { missing.forEach((f) => f.setAttribute('aria-invalid', 'true')); missing[0].focus(); msg.textContent = 'Please fill in the highlighted fields.'; return; }
    const lines = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input,textarea')].map((f) => `${form.querySelector(`label[for="${f.id}"]`)?.textContent?.replace('*', '').trim()}: ${f.value}`);
    window.location.href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(form.dataset.subject!)}&body=${encodeURIComponent(lines.join('\n\n'))}`;
    msg.textContent = 'Opening your email app… If nothing happens, email us directly at ' + form.dataset.to + '.';
  });
});

// Where-to-find filter + search.
{
  const root = document.querySelector<HTMLElement>('[data-finder]');
  if (root) {
    const items = [...root.querySelectorAll<HTMLElement>('[data-place]')];
    const groups = [...root.querySelectorAll<HTMLElement>('[data-city-group]')];
    const input = root.querySelector<HTMLInputElement>('[data-finder-q]')!;
    const count = root.querySelector('[data-finder-count]')!;
    const empty = root.querySelector<HTMLElement>('[data-finder-empty]')!;
    let type = 'all';
    const apply = () => {
      const q = input.value.trim().toLowerCase(); let n = 0;
      items.forEach((it) => { const ok = (type === 'all' || it.dataset.type === type) && (!q || it.dataset.search!.includes(q)); it.hidden = !ok; if (ok) n++; });
      groups.forEach((g) => { g.hidden = !g.querySelector('[data-place]:not([hidden])'); });
      count.textContent = `${n} location${n === 1 ? '' : 's'}`; empty.hidden = n > 0;
    };
    root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((b) => b.addEventListener('click', () => {
      type = b.dataset.filter!;
      root.querySelectorAll('[data-filter]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      apply();
    }));
    input.addEventListener('input', apply);
  }
}
