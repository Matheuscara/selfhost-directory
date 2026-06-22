import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../../..');
const DATA = path.join(ROOT, 'data-src');

export type Release = { tag?: string; published_at?: string };

export type Software = {
  slug: string;
  name: string;
  website_url?: string;
  description: string;
  descriptionHtml: string;
  licenses: string[];
  platforms: string[];
  tags: string[];
  source_code_url?: string;
  demo_url?: string;
  stargazers_count: number;
  updated_at?: string;
  archived: boolean;
  current_release?: Release;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  descriptionHtml: string;
  count: number;
};

export type Alternative = {
  slug: string;
  proprietary: string;
  blurb: string;
  tags: string[];
};

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// markdown inline (apenas links [txt](url)) -> HTML, escapando o resto
function mdInlineToHtml(s: string): string {
  const esc = (t: string) =>
    t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let out = '';
  let last = 0;
  const re = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    out += esc(s.slice(last, m.index));
    out += `<a href="${m[2]}" rel="nofollow noopener" target="_blank">${esc(m[1])}</a>`;
    last = m.index + m[0].length;
  }
  out += esc(s.slice(last));
  return out;
}

function readYmlDir<T>(dir: string): { file: string; data: T }[] {
  const p = path.join(DATA, dir);
  if (!fs.existsSync(p)) return [];
  return fs
    .readdirSync(p)
    .filter((f) => f.endsWith('.yml'))
    .map((f) => ({
      file: f,
      data: yaml.load(fs.readFileSync(path.join(p, f), 'utf8')) as T,
    }));
}

let _software: Software[] | null = null;
export function getSoftware(): Software[] {
  if (_software) return _software;
  const raw = readYmlDir<any>('software');
  _software = raw
    .map(({ file, data }) => {
      const desc: string = (data.description || '').trim();
      return {
        slug: file.replace(/\.yml$/, ''),
        name: data.name,
        website_url: data.website_url,
        description: desc,
        descriptionHtml: mdInlineToHtml(desc),
        licenses: data.licenses || [],
        platforms: data.platforms || [],
        tags: data.tags || [],
        source_code_url: data.source_code_url,
        demo_url: data.demo_url,
        stargazers_count: data.stargazers_count || 0,
        updated_at: data.updated_at,
        archived: !!data.archived,
        current_release: data.current_release,
      } as Software;
    })
    .filter((s) => s.name && !s.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
  return _software;
}

let _categories: Category[] | null = null;
export function getCategories(): Category[] {
  if (_categories) return _categories;
  const sw = getSoftware();
  const counts = new Map<string, number>();
  for (const s of sw) for (const t of s.tags) counts.set(t, (counts.get(t) || 0) + 1);

  _categories = readYmlDir<any>('tags')
    .map(({ data }) => {
      const desc: string = (data.description || '').trim();
      return {
        slug: slugify(data.name),
        name: data.name,
        description: desc,
        descriptionHtml: mdInlineToHtml(desc),
        count: counts.get(data.name) || 0,
      } as Category;
    })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);
  return _categories;
}

export function getCategory(slug: string): Category | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function softwareByTag(tagName: string): Software[] {
  return getSoftware().filter((s) => s.tags.includes(tagName));
}

export function getTool(slug: string): Software | undefined {
  return getSoftware().find((s) => s.slug === slug);
}

// outras ferramentas que compartilham >=1 tag (para "relacionados")
export function relatedTools(s: Software, limit = 6): Software[] {
  return getSoftware()
    .filter((o) => o.slug !== s.slug && o.tags.some((t) => s.tags.includes(t)))
    .slice(0, limit);
}

// ---- Alternativas (motor pSEO: "alternativa self-hosted ao X") ----
let _alts: Alternative[] | null = null;
export function getAlternatives(): Alternative[] {
  if (_alts) return _alts;
  const file = path.join(ROOT, 'data', 'alternatives.json');
  const arr = JSON.parse(fs.readFileSync(file, 'utf8')) as Omit<Alternative, 'slug'>[];
  _alts = arr.map((a) => ({ ...a, slug: slugify(a.proprietary) }));
  return _alts;
}

export function getAlternative(slug: string): Alternative | undefined {
  return getAlternatives().find((a) => a.slug === slug);
}

// ferramentas que cobrem qualquer uma das tags de uma alternativa
export function toolsForAlternative(a: Alternative, limit = 12): Software[] {
  return getSoftware()
    .filter((s) => s.tags.some((t) => a.tags.includes(t)))
    .slice(0, limit);
}

// ---- Featured (listings pagos) ----
export type Featured = {
  name: string;
  url: string;
  blurb: string;
  badge?: string;
};
export function getFeatured(): Featured[] {
  const file = path.join(ROOT, 'data', 'featured.json');
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Featured[];
}
