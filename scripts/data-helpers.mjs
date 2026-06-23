// Ajudante pra montar um "lote" de conteúdo. Lê data-src/ e os data/*.json.
// Uso: node scripts/data-helpers.mjs [tags|covered|needdesc|altslugs] [N]
//   tags     -> lista as tags válidas (use EXATAMENTE esses nomes em alternatives/comparisons)
//   covered  -> serviços proprietários já cobertos em alternatives.json (não repetir)
//   needdesc -> top N apps populares SEM descrição única (candidatos a descriptions.json)
//   altslugs -> confere se uma lista de slugs existe (passe os slugs após o comando)
import fs from 'node:fs';
import yaml from 'js-yaml';

const SW = 'data-src/software';
const TAGS = 'data-src/tags';
if (!fs.existsSync(SW)) { console.error('Faltam os dados. Rode "npm run fetch:data" antes.'); process.exit(1); }

const mode = process.argv[2] || 'needdesc';
const N = parseInt(process.argv[3] || '60', 10);

function software() {
  return fs.readdirSync(SW).filter((f) => f.endsWith('.yml')).map((f) => {
    const d = yaml.load(fs.readFileSync(`${SW}/${f}`, 'utf8'));
    return { slug: f.replace(/\.yml$/, ''), name: d.name, stars: d.stargazers_count || 0, archived: !!d.archived, desc: (d.description || '').replace(/\s+/g, ' ').trim() };
  }).filter((x) => x.name && !x.archived);
}

if (mode === 'tags') {
  const names = fs.readdirSync(TAGS).filter((f) => f.endsWith('.yml'))
    .map((f) => yaml.load(fs.readFileSync(`${TAGS}/${f}`, 'utf8')).name).sort();
  console.log(names.join('\n'));
} else if (mode === 'covered') {
  const alts = JSON.parse(fs.readFileSync('data/alternatives.json', 'utf8'));
  console.log(alts.map((a) => a.proprietary).sort().join(', '));
} else if (mode === 'needdesc') {
  const have = fs.existsSync('data/descriptions.json') ? Object.keys(JSON.parse(fs.readFileSync('data/descriptions.json', 'utf8'))) : [];
  const list = software().filter((x) => !have.includes(x.slug)).sort((a, b) => b.stars - a.stars).slice(0, N);
  for (const x of list) console.log(`${x.slug} :: ${x.name} :: ${x.stars}★ :: ${x.desc.slice(0, 120)}`);
} else if (mode === 'altslugs') {
  const want = process.argv.slice(3);
  const all = new Set(software().map((x) => x.slug));
  for (const s of want) console.log(`${all.has(s) ? '✅' : '❌'} ${s}`);
} else {
  console.error('modo inválido. use: tags | covered | needdesc | altslugs');
  process.exit(1);
}
