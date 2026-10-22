import site from '../content/site.json';
import products from '../content/products.json';
import retailers from '../content/retailers.json';
import events from '../content/events.json';
export { site, products, retailers, events };

/** Internal URL with trailing slash (matches static directory output). */
export const u = (path = '/') => {
  const [p, hash] = path.split('#');
  let out = p.startsWith('/') ? p : '/' + p;
  if (!/\.[a-z0-9]+$/i.test(out) && !out.endsWith('/')) out += '/';
  return out + (hash ? '#' + hash : '');
};
export const abs = (path: string) => new URL(u(path), import.meta.env.SITE).href;

export const DAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export const DAY_NAMES: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
export function fmtTime(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${m ? ':' + String(m).padStart(2, '0') : ''} ${ap}`;
}
export const fmtRange = (o: string, c: string) => `${fmtTime(o).replace(' PM', '').replace(' AM', '')}–${fmtTime(c)}`;
export const fullAddress = `${site.street}, ${site.city}, ${site.state} ${site.zip}`;
export const shortDesc = (s: string) => s.split(/(?<=[.!])\s/)[0];
