// Scroll reveal: children of [data-reveal-group] fade/rise in as they enter the viewport, staggered per group.
// Content is only hidden once <html> has the "js" class (set inline in <head>), so no-JS visitors see everything.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const items: HTMLElement[] = [];
document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((g) => {
  [...g.children].forEach((el, i) => { (el as HTMLElement).style.setProperty('--i', String(Math.min(i, 6))); items.push(el as HTMLElement); });
});
if (reduce || !('IntersectionObserver' in window)) {
  items.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      // Reveal on entry, or if a jump (anchor link, fast scroll) carried it past the top unseen.
      if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
  items.forEach((el) => {
    // Already scrolled past (e.g. back/forward restore): show immediately.
    if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-in'); else io.observe(el);
  });
  // A jump (anchor link, fast fling) can carry items from below to above the viewport without the
  // observer ever reporting them; sweep those on scroll so nothing above the fold stays hidden.
  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return; queued = true;
    requestAnimationFrame(() => {
      queued = false;
      items.forEach((el) => {
        if (!el.classList.contains('is-in') && el.getBoundingClientRect().bottom < 0) { el.classList.add('is-in'); io.unobserve(el); }
      });
    });
  }, { passive: true });
}
// Stagger only applies to the first reveal; afterwards hover transitions should be instant to respond.
document.addEventListener('transitionend', (e) => {
  const t = e.target as HTMLElement;
  if (t.classList?.contains('is-in') && e.propertyName === 'opacity') t.style.setProperty('--i', '0');
});
