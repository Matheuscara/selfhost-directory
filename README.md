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
| `/alternative-to/<slug>` | 32 (cresce) | **"alternativa self-hosted ao <serviço pago>"** ← o ouro |
| `/`, `/categories`, `/alternatives` | índices | navegação |

## Dados
`data-src/` é um clone de [awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data)
(CC-BY-SA 3.0), **gitignorado**. O loader (`src/lib/data.ts`) lê os YAMLs em build.
Refresh: `npm run data:update` (os agentes rodam isso e re-buildam).

Curadoria nossa (versionada):
- `data/alternatives.json` — mapa "serviço pago → tags self-hosted" (escalável por agente).
- `data/affiliates.json` — provedores de hospedagem + seus IDs de afiliado (troque `YOUR_ID`).
- `data/featured.json` — listings pagos (vazio até vender o 1º slot).

## Dev / build (node via nix nesta máquina)
```bash
nix-shell -p nodejs_22 --run 'npm install'
nix-shell -p nodejs_22 --run 'npm run dev'     # preview local
nix-shell -p nodejs_22 --run 'npm run build'   # -> dist/ (estático)
```

## Deploy (pendente — decisão do Matheus)
- Repo no GitHub (conta pessoal `Matheuscara`, público) → **Cloudflare Pages** (build `npm run build`, output `dist/`), grátis e global.
- Definir **marca + domínio** (placeholder atual: `SelfHost Directory` / `*.pages.dev`).
- `SITE_URL` no env do Pages aponta pro domínio final.

## Manutenção por agentes (paperclip) — a fazer
Routine semanal: `data:update` → expandir `alternatives.json` (mais serviços pagos) →
gerar conteúdo editorial por página → rebuild/commit → Cloudflare auto-deploy.

## Status (22-06-2026)
✅ MVP buildando: 1.445 páginas estáticas. ⏳ Falta: marca/domínio, deploy, IDs de afiliado, wiring paperclip.
