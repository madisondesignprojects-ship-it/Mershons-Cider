// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Demo hosting: Vercel production URL. Set SITE_URL to the real domain at launch.
const SITE_URL = process.env.SITE_URL ?? 'https://mershons-cider.vercel.app';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(page) })],
  vite: { plugins: [tailwindcss()] },
});
