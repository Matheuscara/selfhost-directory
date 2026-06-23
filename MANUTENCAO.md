# Manutenção — como crescer o site (lotes manuais)

> Guia auto-suficiente. Daqui a semanas/meses, você (ou um Claude Code aberto neste repo)
> consegue gerar um "lote" de conteúdo e publicar **sem depender de chat antigo nem de robô**.

> ⚠️ **TODO o conteúdo do site é em INGLÊS** (público global). Gere blurbs, descrições e intros **sempre em inglês** — este guia (MANUTENCAO.md) está em pt só pra você.

## TL;DR — o ciclo
1. **Descobrir** o que falta (`npm run helper`).
2. **Gerar** o lote com o Claude (prompts prontos na seção 5).
3. **Validar** (`npm run build` + `npm run audit`).
4. **Publicar** (`git push` → Cloudflare publica sozinho em ~2 min).

---

## 1. Como o site funciona
Site **estático** (Astro). As páginas são **geradas a partir de dados**, não escritas à mão:

| Fonte de dados | Gera as páginas |
|---|---|
| `data-src/` (clone de [awesome-selfhosted-data](https://github.com/awesome-selfhosted/awesome-selfhosted-data), baixado no build) | `/tools/*` (1.300+) e `/category/*` |
| `data/alternatives.json` | `/alternative-to/*` ("alternativa self-hosted ao X") |
| `data/comparisons.json` | `/vs/*` ("X vs Y") |
| `data/descriptions.json` | texto único dentro das `/tools/*` |

**Crescer o site = adicionar linhas nesses `data/*.json`.** Cada entrada vira uma página nova.

## 2. Pré-requisitos (uma vez)
```bash
git clone git@github-pessoal:Matheuscara/selfhost-directory.git
cd selfhost-directory
# Na máquina NixOS, prefixe os comandos node com nix-shell:
nix-shell -p nodejs_22 --run 'npm install'
```
> Em qualquer outra máquina com Node 22+, é só `npm install` (sem o nix-shell).
> Nos comandos abaixo, na NixOS use `nix-shell -p nodejs_22 --run '<comando>'`.

## 3. O ciclo de um lote (passo a passo)
```bash
# Passo 1 — descobrir o que falta:
npm run helper -- tags         # tags válidas (use EXATAMENTE esses nomes)
npm run helper -- covered      # proprietários já cobertos (não repetir)
npm run helper -- needdesc 60  # apps populares SEM descrição (candidatos)

# Passo 2 — gerar o lote: abra o Claude Code NESTE repo e cole um prompt da seção 5.
#           (o Claude edita os data/*.json sozinho)

# Passo 3 — validar:
npm run build                  # tem que terminar "Complete!" sem erro
npm run audit                  # confere SEO (sem title>60, description 70–160)
npm run preview                # opcional: abrir http://localhost:4321 e olhar

# Passo 4 — publicar:
git add data/ && git commit -m "content: novo lote" && git push origin main
# Cloudflare rebuilda e publica em selfhostedalternatives.com (~2 min)
```

## 4. Os 3 tipos de lote (schema + regras)

### A) Alternativas — `data/alternatives.json` (MAIOR VALOR de SEO)
Cada entrada vira `/alternative-to/<slug>`. O slug é gerado automático do `proprietary`.
```json
{ "proprietary": "Paid Service Name", "blurb": "1 sentence in ENGLISH.", "tags": ["EXACT Tag", "Other Tag"] }
```
**Regras:**
- `proprietary`: serviço pago famoso que as pessoas querem substituir. **Não repetir** os de `helper covered`.
- `tags`: usar **só nomes EXATOS** de `helper tags`. Tag errada = página vazia.
- 1–2 tags por entrada costuma bastar.

### B) Descrições únicas — `data/descriptions.json` (anti conteúdo duplicado)
Objeto `{ "slug": "texto" }`. Substitui a descrição padrão (que é igual à de mil sites) na página da ferramenta.
```json
{ "slug-name": "2-3 ORIGINAL sentences in ENGLISH: what the app does + self-hosted angle + which paid service it replaces." }
```
**Regras:**
- O `slug` precisa existir — pegue de `helper needdesc` (já vem ordenado por popularidade).
- Texto **original** (não copie o do dataset). Priorize os apps mais populares primeiro.

### C) Comparações — `data/comparisons.json` (páginas "X vs Y")
```json
{ "slug": "x-vs-y", "title": "X vs Y", "intro": "1–2 frases comparando.", "tools": ["slug-x", "slug-y"] }
```
**Regras:**
- `tools`: slugs que **existem** (confira com `npm run helper -- altslugs slug-x slug-y`). Mínimo 2.
- Compare ferramentas do **mesmo tipo** (ex.: servidores de mídia, forjas Git, gerenciadores de senha).

## 5. Prompts prontos (cole no Claude Code, dentro do repo)

**Lote de alternativas (faça este com mais frequência):**
```
Leia MANUTENCAO.md seção 4A. Rode "npm run helper -- tags" e "npm run helper -- covered".
Adicione 40 serviços proprietários NOVOS e populares em data/alternatives.json (sem repetir os
já cobertos), cada um com blurb de 1 frase EM INGLÊS e tags EXATAS da lista. Depois rode
"npm run build" e "npm run audit" e corrija o que aparecer. Não altere mais nenhum arquivo.
```

**Lote de descrições:**
```
Leia MANUTENCAO.md seção 4B. Rode "npm run helper -- needdesc 50". Para esses apps, escreva
descrições originais EM INGLÊS (2-3 frases) em data/descriptions.json, somando às existentes
(não remova nenhuma). Rode "npm run build" e "npm run audit". Não altere mais nenhum arquivo.
```

**Lote de comparações:**
```
Leia MANUTENCAO.md seção 4C. Proponha 10 comparações "X vs Y" de ferramentas populares do mesmo
tipo. Confira os slugs com "npm run helper -- altslugs <slugs>" e adicione as válidas em
data/comparisons.json. Rode "npm run build". Não altere mais nenhum arquivo.
```

## 6. Regras de SEO (o `npm run audit` verifica)
- `title` ≤ 60 caracteres · `description` entre 70 e 160 · 1 `<h1>` por página · JSON-LD válido.
- As descrições curtas das `/tools/*` já são completadas pelo template; o foco do lote é **não criar títulos gigantes** (o audit aponta se acontecer).

## 7. Publicar (detalhe do Git)
- O `origin` aponta pra conta **pessoal**: `git@github-pessoal:Matheuscara/selfhost-directory.git`.
- `git push origin main` → o Cloudflare detecta e **rebuilda/publica sozinho** (~2 min).
- Acompanhe em: Cloudflare → projeto `selfhost-directory` → **Deployments**.

## 8. (Opcional) Rebuild automático semanal — apps novos sem você fazer nada
O dataset upstream ganha apps novos toda semana. Pra o site pegar isso sozinho, **sem lote**:
1. Cloudflare → projeto → **Settings → Deploy Hooks → Create** (branch `main`) → copie a URL.
2. Crie um cron (em qualquer máquina/servidor sempre ligado) que dispara a URL 1x/semana:
   ```
   0 4 * * 1 curl -X POST "https://<sua-deploy-hook-url>"
   ```
Isso rebuilda com os dados frescos. Zero IA, zero custo.

## 9. Checklist do negócio (o que falta pra monetizar)
- [x] Google Search Console + sitemap enviado (23/06/2026).
- [ ] IDs de afiliado reais em `data/affiliates.json` (trocar `YOUR_ID`) quando aprovar nos programas.
- [ ] E-mail de contato em `src/pages/anuncie.astro` (trocar `contato@SEUDOMINIO.com`).
- [ ] Backlinks: postar em r/selfhosted, listas "awesome", etc. (acelera muito a indexação).
- [ ] (Opcional) rebuild semanal automático (seção 8).

---
**Em uma linha:** edite `data/*.json` → `npm run build && npm run audit` → `git push`. O Claude local
faz o trabalho pesado seguindo os prompts da seção 5.
