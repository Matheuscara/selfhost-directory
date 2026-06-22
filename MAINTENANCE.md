# Manutenção automática (agentes paperclip)

O site é estático e o **Cloudflare Pages rebuilda a cada push** na `main`. Os dados de
`awesome-selfhosted` são clonados no build (`npm run fetch:data`), então **basta dar push**
que o deploy sai sozinho. A manutenção por agentes tem 2 frentes:

## 1. Dados sempre frescos (sem agente — só um cron)
`awesome-selfhosted-data` muda toda semana (estrelas, versões, apps novos). Como o build clona
os dados na hora, basta **rebuildar periodicamente**. No Cloudflare Pages:
- Crie um **Deploy Hook** (Settings → Builds → Deploy Hooks) → te dá uma URL.
- Agende um cron (no `node-infra-1` ou paperclip) que faz `curl -X POST <deploy-hook-url>`
  toda segunda 03:00. Pronto — dados atualizados sem tocar no repo.

## 2. Expandir o motor pSEO (agente Claude no paperclip)
O que faz o site crescer em busca: **mais páginas `/alternative-to/<serviço>`**. Um agente
adiciona entradas novas em `data/alternatives.json` (serviço pago → tags reais), valida e dá push.

Helper pronto: `scripts/expand-alternatives.sh` (roda na VM paperclip, que tem `claude` + git).
Ele:
1. `git pull` no repo;
2. chama o `claude` headless com a lista de tags válidas + as alternativas já existentes,
   pedindo **N serviços pagos NOVOS** (sem repetir), cada um mapeado a tags que existem no dataset;
3. valida o JSON (`node -e`/`jq`);
4. commita e dá push → Cloudflare rebuilda.

## 3. Descrições únicas (agente Claude) — combate conteúdo duplicado
A descrição padrão de cada app vem do dataset e é **idêntica à de centenas de outros sites** —
o maior risco de SEO do projeto. O agente reescreve, em lote, descrições originais em pt-BR
(`data/descriptions.json`), começando pelos apps mais populares sem descrição.

Helper: `scripts/write-descriptions.sh N` (default 10). Pega os N apps mais populares que ainda
não têm editorial, pede ao `claude` textos originais, valida o JSON e dá push.

Routine sugerida (2×/semana): `bash /opt/selfhost-directory/scripts/write-descriptions.sh 10`
→ ~20 descrições/semana → cobre os ~500 apps mais buscados em ~6 meses.

### Wiring no paperclip (fazer DEPOIS do deploy)
Pré-requisitos:
- **Deploy key** do repo `Matheuscara/selfhost-directory` na VM paperclip (push via SSH).
- Repo clonado em `/opt/selfhost-directory` na paperclip.
- `claude` CLI autenticado na VM (já está).

Routines sugeridas:
```
# 1) novas páginas "alternativa a X"
nome: selfhost-directory-expand
agenda: dom 04:00
comando: bash /opt/selfhost-directory/scripts/expand-alternatives.sh 5

# 2) descrições únicas (anti-duplicado)
nome: selfhost-directory-descriptions
agenda: qua,sab 04:30
comando: bash /opt/selfhost-directory/scripts/write-descriptions.sh 10
```
Resultado: ~5 páginas-money + ~20 descrições originais por semana, sem você tocar em nada.

> ⚠️ Guardrail: o agente só edita `data/alternatives.json`. Tags devem existir no dataset
> (senão a página fica vazia). O script valida e aborta o push se o JSON quebrar.
