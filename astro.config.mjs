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
    // não listar páginas utilitárias/noindex no sitemap (ex.: busca interna)
    sitemap({ filter: (page) => !/\/buscar\/?$/.test(page) }),
  ],
  vite: { plugins: [tailwindcss()] },
});
