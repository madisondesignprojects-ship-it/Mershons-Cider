import type { ImageMetadata } from 'astro';
const all = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpg,jpeg,png}', { eager: true });
export function img(path: string): ImageMetadata {
  const m = all['/src/assets/images/' + path];
  if (!m) throw new Error(`Missing image: ${path}`);
  return m.default;
}
/** Responsive widths capped at the native width; never upscale. */
export function widthsFor(meta: ImageMetadata, wanted = [400, 640, 960, 1280, 1600]) {
  const w = wanted.filter((x) => x < meta.width);
  w.push(Math.min(meta.width, Math.max(...wanted)));
  return [...new Set(w)].sort((a, b) => a - b);
}
