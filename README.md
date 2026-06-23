# selfhost-directory — diretório de alternativas self-hosted (pSEO)

Site estático (Astro + Tailwind) que lista **alternativas self-hosted/open source** a serviços
pagos, gerado a partir do dataset **awesome-selfhosted-data** (1.327 apps, 94 categorias).
Modelo de receita: **afiliado de hospedagem** (Hetzner/Hostinger/Cloudways) + **featured
listings** pagos. Mantido pelos agentes do paperclip (refresh de dados + novas páginas pSEO).

> Por quê: para US$250/mês com público global, ver a memória `online-income-goal`. Motor de
> dinheiro real = featured listings; afiliado de hosting é complemento (público self-hosted
> compra pouco hosting gerenciado).

## Páginas (motor de SEO)
| Rota | Gera | O que ranqueia |
|---|---|---|
| `/tools/<slug>` | 1.327 | "<app> self-hosted" |
| `/category/<slug>` | ~83 | "<categoria> self-hosted open source" |
| `/alternative-to/<slug>` | 98 (cresce) | **"alternativa self-hosted ao <serviço pago>"** ← o ouro |
| `/vs/<slug>` | 14 (cresce) | **"<X> vs <Y>"** (comparação, alta intenção) |
| `/`, `/categories`, `/alternatives`, `/comparacoes`, `/buscar`, `/anuncie`, `/sobre` | índices/funil | navegação + busca + venda |

## Dados
`data-src/` é um clone de [awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data)
(CC-BY-SA 3.0), **gitignorado**. O loader (`src/lib/data.ts`) lê os YAMLs em build.
Refresh: `npm run data:update` (os agentes rodam isso e re-buildam).

Curadoria nossa (versionada):
- `data/alternatives.json` — mapa "serviço pago → tags self-hosted" (escalável por agente).
- `data/descriptions.json` — descrições únicas pt-BR por slug (anti conteúdo duplicado; agente expande).
- `data/comparisons.json` — comparações "X vs Y" (slugs do dataset).
- `data/affiliates.json` — provedores de hospedagem + seus IDs de afiliado (troque `YOUR_ID`).
- `data/featured.json` — listings pagos (vazio até vender o 1º slot).

## Dev / build (node via nix nesta máquina)
```bash
nix-shell -p nodejs_22 --run 'npm install'
nix-shell -p nodejs_22 --run 'npm run dev'     # preview local
nix-shell -p nodejs_22 --run 'npm run build'   # -> dist/ (estático)
```

## Deploy — NO AR ✅
- **Produção:** https://selfhostedalternatives.com (Cloudflare Workers, assets estáticos via `wrangler.jsonc`).
- Repo GitHub (conta pessoal `Matheuscara`, público); cada push na `main` redeploya automático.
- Domínio padrão fixado em `astro.config.mjs` (canonical/sitemap/robots corretos).

## Manutenção por agentes (paperclip) — a fazer
Routine semanal: `data:update` → expandir `alternatives.json` (mais serviços pagos) →
gerar conteúdo editorial por página → rebuild/commit → Cloudflare auto-deploy.

## Status (22-06-2026)
✅ MVP buildando: **1.530 páginas**. 98 alternativas + 83 categorias + 14 comparações (todas com FAQ + JSON-LD).
**38 descrições únicas** pt-BR nos apps mais populares (anti-duplicado). **Busca** (Pagefind).
**Funil** `/anuncie` (featured listings) + Sobre + 404. SEO: JSON-LD, canonical, Open Graph, robots.
Auto-fetch de dados no build. Manutenção por agente: `expand-alternatives.sh` + `write-descriptions.sh`.
Pushado em github.com/Matheuscara/selfhost-directory.

⏳ Falta (do Matheus, em casa): marca/domínio, deploy Cloudflare Pages, IDs de afiliado, deploy hook + routine paperclip.
