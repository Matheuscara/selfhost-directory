// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Troque pelo domínio final quando definirmos a marca.
const SITE = process.env.SITE_URL || 'https://selfhost-directory.pages.dev';

export default defineConfig({
  site: SITE,
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
