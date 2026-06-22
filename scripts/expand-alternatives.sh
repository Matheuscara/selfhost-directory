#!/usr/bin/env bash
# Expande data/alternatives.json com N serviços pagos novos usando o claude headless.
# Roda na VM paperclip (tem claude CLI + git). Uso: expand-alternatives.sh [N]
set -euo pipefail

REPO="${REPO:-/opt/selfhost-directory}"
N="${1:-5}"
cd "$REPO"

git pull --ff-only

# garante os dados (pra extrair as tags válidas)
test -d data-src || git clone --depth 1 https://github.com/awesome-selfhosted/awesome-selfhosted-data.git data-src

TAGS=$(for f in data-src/tags/*.yml; do grep -m1 '^name:' "$f" | sed 's/^name: //'; done | sort -u)
EXISTENTES=$(node -e 'console.log(JSON.parse(require("fs").readFileSync("data/alternatives.json")).map(a=>a.proprietary).join(", "))')

PROMPT=$(cat <<EOF
Você mantém um diretório de alternativas self-hosted. Edite SOMENTE o arquivo
data/alternatives.json (um array JSON). Adicione exatamente ${N} serviços pagos/proprietários
NOVOS e populares (que pessoas buscam por "self-hosted alternative"), SEM repetir nenhum destes
já existentes:
${EXISTENTES}

Formato de cada entrada (pt-BR no blurb, 1 frase):
{ "proprietary": "Nome", "blurb": "...", "tags": ["Tag exata", ...] }

REGRAS:
- "tags" DEVE usar apenas nomes EXATOS desta lista (senão a página fica vazia):
${TAGS}
- Mantenha o JSON válido (array), preserve as entradas existentes, adicione as novas no fim.
- Não altere mais nenhum arquivo. Não escreva explicações.
EOF
)

echo "[expand] pedindo $N novas alternativas ao claude..."
claude -p "$PROMPT" --allowedTools "Read,Edit,Write" >/dev/null 2>&1 || { echo "[expand] claude falhou"; exit 1; }

# valida JSON
node -e 'const a=JSON.parse(require("fs").readFileSync("data/alternatives.json"));if(!Array.isArray(a)||!a.every(x=>x.proprietary&&Array.isArray(x.tags)))throw new Error("schema inválido");console.log("[expand] ok, total="+a.length)'

if git diff --quiet data/alternatives.json; then
  echo "[expand] nada novo, sem commit."; exit 0
fi

git add data/alternatives.json
git -c user.name="selfhost-bot" -c user.email="matheus.dias.dev@gmail.com" \
  commit -q -m "content: +$N alternativas (auto)"
git push origin main
echo "[expand] push feito — Cloudflare vai rebuildar."
