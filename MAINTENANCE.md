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

### Wiring no paperclip (fazer DEPOIS do deploy)
Pré-requisitos:
- **Deploy key** do repo `Matheuscara/selfhost-directory` na VM paperclip (push via SSH).
- Repo clonado em `/opt/selfhost-directory` na paperclip.
- `claude` CLI autenticado na VM (já está).

Routine sugerida (1×/semana):
```
nome: selfhost-directory-expand
agenda: dom 04:00
comando: bash /opt/selfhost-directory/scripts/expand-alternatives.sh 5
```
Adiciona ~5 páginas-money por semana (~260/ano) sem você tocar em nada.

> ⚠️ Guardrail: o agente só edita `data/alternatives.json`. Tags devem existir no dataset
> (senão a página fica vazia). O script valida e aborta o push se o JSON quebrar.
