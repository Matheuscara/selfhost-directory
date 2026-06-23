// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import tailwindcss from '@tailwindcss/vite';

// Domínio final do site (pode sobrescrever via env SITE_URL se mudar).
const SITE = process.env.SITE_URL || 'https://selfhostedalternatives.com';

export default defineConfig({
  site: SITE,
  integrations: [
    pagefind(),
    // don't list utility/noindex pages in the sitemap (e.g. internal search)
    sitemap({ filter: (page) => !/\/search\/?$/.test(page) }),
  ],
  vite: { plugins: [tailwindcss()] },
});
