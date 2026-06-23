// Auditoria de SEO sobre o build (dist/). Uso: node scripts/seo-audit.mjs [dist]
import fs from 'node:fs';
import path from 'node:path';

const DIST = process.argv[2] || 'dist';
if (!fs.existsSync(DIST)) {
  console.error(`Pasta "${DIST}" não existe. Rode "npm run build" antes.`);
  process.exit(1);
}
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
})(DIST);

const decode = (s = '') =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const urlOf = (f) => {
  let u = '/' + path.relative(DIST, f).replace(/index\.html$/, '').replace(/\\/g, '/');
  return u === '/' ? '/' : u.replace(/\/$/, '');
};
const section = (u) =>
  u === '/' ? 'home'
    : u.startsWith('/tools/') ? 'tools'
    : u.startsWith('/category/') ? 'category'
    : u.startsWith('/alternative-to/') ? 'alternative-to'
    : u.startsWith('/vs/') ? 'vs'
    : 'outras';

const issues = { titleLong: [], descMissing: [], descLong: [], descShort: [], h1bad: [], noCanonical: [], badJsonld: [] };
const stat = {};
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const u = urlOf(f);
  const sec = section(u);
  stat[sec] = (stat[sec] || 0) + 1;
  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim();
  const desc = decode((html.match(/<meta name="description" content="([\s\S]*?)"/) || [])[1] || '').trim();
  const h1 = (html.match(/<h1\b/g) || []).length;
  const noindex = /name="robots" content="noindex/.test(html);
  if (!noindex) {
    if (title.length > 60) issues.titleLong.push(`${u} (${title.length})`);
    if (!desc) issues.descMissing.push(u);
    else { if (desc.length > 160) issues.descLong.push(`${u} (${desc.length})`); if (desc.length < 70) issues.descShort.push(`${u} (${desc.length})`); }
    if (h1 !== 1) issues.h1bad.push(`${u} (h1=${h1})`);
    if (!/<link rel="canonical"/.test(html)) issues.noCanonical.push(u);
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch { issues.badJsonld.push(u); }
  }
}
console.log(`AUDITORIA SEO — ${files.length} páginas`);
console.log('Por seção:', Object.entries(stat).map(([k, v]) => `${k}=${v}`).join('  '), '\n');
const rep = (label, arr) => console.log(`${arr.length ? '⚠️ ' : '✅ '}${label}: ${arr.length}`);
rep('title > 60 chars', issues.titleLong);
rep('sem description', issues.descMissing);
rep('description > 160', issues.descLong);
rep('description < 70', issues.descShort);
rep('h1 != 1', issues.h1bad);
rep('sem canonical', issues.noCanonical);
rep('JSON-LD inválido', issues.badJsonld);
const sample = (a) => a.slice(0, 8).join('\n   ');
if (issues.titleLong.length) console.log('\ntitles longos:\n  ', sample(issues.titleLong));
if (issues.descShort.length) console.log('\ndescrições curtas:\n  ', sample(issues.descShort));
if (issues.badJsonld.length) console.log('\nJSON-LD inválido:\n  ', sample(issues.badJsonld));
