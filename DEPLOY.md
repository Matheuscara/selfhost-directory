# Deploy — passo a passo (Cloudflare Pages)

Site estático. O Cloudflare builda do GitHub a cada push. ~10 min no total.

## 1. Registrar o domínio
Recomendado: **selfhostedalternatives.com** (match exato da query "self-hosted alternatives").
Mais barato: registrar no **Cloudflare Registrar** (preço de custo, ~$10/ano) — já fica tudo no mesmo lugar.
- Cloudflare → **Domain Registration → Register Domains** → busca o domínio → compra.

## 2. Criar o projeto no Cloudflare Pages
1. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**.
2. Autorize o GitHub e escolha o repo **Matheuscara/selfhost-directory**.
3. Build settings:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Environment variables** (Settings → Variables):
   - `NODE_VERSION` = `22`
   - `SITE_URL` = `https://selfhostedalternatives.com`  (o domínio final, com https)
5. **Save and Deploy**. O primeiro build leva ~2–4 min (clona os dados + gera ~1.530 páginas).

> Sai no ar em `https://selfhost-directory.pages.dev` já funcionando.

## 3. Apontar o domínio
1. No projeto Pages → **Custom domains → Set up a domain** → digite `selfhostedalternatives.com`.
2. Se o domínio está na Cloudflare, o DNS é configurado sozinho. Adicione também `www` (redireciona pro apex).
3. Confirme que o `SITE_URL` (passo 2.4) é exatamente o domínio final — ele alimenta canonical, sitemap e robots.

## 4. Ajustes finais (commitar no repo)
- **`data/affiliates.json`**: troque os `YOUR_ID` pelos seus IDs quando aprovar nos programas (Hetzner/Hostinger/Cloudways).
- **`src/pages/anuncie.astro`**: troque `contato@SEUDOMINIO.com` pelo seu e-mail de contato.
- Cada push na `main` redeploya automático.

## 5. Pós-deploy (me chame)
- Ligar as **routines de manutenção no paperclip** (precisa de uma deploy key do repo na VM) — ver `MAINTENANCE.md`.
- Cadastrar o site no **Google Search Console** (verificar domínio + enviar `sitemap-index.xml`).
