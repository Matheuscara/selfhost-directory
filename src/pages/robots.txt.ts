import type { APIRoute } from 'astro';

// Gera /robots.txt em build usando o SITE_URL (não precisa editar à mão).
export const GET: APIRoute = ({ site }) => {
  const base = (site?.href ?? 'https://selfhostedalternatives.com/').replace(/\/$/, '');
  const body = `User-agent: *
Allow: /

Sitemap: ${base}/sitemap-index.xml
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
