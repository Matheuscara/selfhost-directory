#!/usr/bin/env bash
# Gera descrições únicas (pt-BR) para apps que ainda não têm, em data/descriptions.json.
# Reduz conteúdo duplicado (descrição padrão = igual à de mil sites). Roda na VM paperclip.
# Uso: write-descriptions.sh [N]   (default 10)
set -euo pipefail

REPO="${REPO:-/opt/selfhost-directory}"
N="${1:-10}"
cd "$REPO"

git pull --ff-only
test -d data-src || git clone --depth 1 https://github.com/awesome-selfhosted/awesome-selfhosted-data.git data-src

# os N apps mais populares que AINDA não têm descrição editorial
ALVOS=$(node -e '
const fs=require("fs"),yaml=require("js-yaml");
const have=fs.existsSync("data/descriptions.json")?Object.keys(JSON.parse(fs.readFileSync("data/descriptions.json"))):[];
const dir="data-src/software";
const arr=fs.readdirSync(dir).filter(f=>f.endsWith(".yml")).map(f=>{const d=yaml.load(fs.readFileSync(dir+"/"+f));return{slug:f.replace(/\.yml$/,""),name:d.name,desc:(d.description||"").replace(/\n/g," "),stars:d.stargazers_count||0,arch:!!d.archived}}).filter(x=>!x.arch&&!have.includes(x.slug)).sort((a,b)=>b.stars-a.stars).slice(0,'"$N"');
arr.forEach(x=>console.log(x.slug+" :: "+x.name+" :: "+x.desc));
')

[ -n "$ALVOS" ] || { echo "[desc] nada a fazer"; exit 0; }

PROMPT=$(cat <<EOF
Você mantém um diretório de alternativas self-hosted. Edite SOMENTE data/descriptions.json
(um objeto JSON { "slug": "descrição" }). Para cada app abaixo, escreva uma descrição ORIGINAL
em português (pt-BR), de 2 a 3 frases, que NÃO copie o texto-base. Explique o que o app faz e o
ângulo self-hosted (privacidade/controle/sem mensalidade) e, quando fizer sentido, a qual serviço
pago ele é alternativa. Adicione as novas chaves ao objeto existente SEM remover as que já existem.

Apps (slug :: nome :: texto-base de referência):
${ALVOS}

Não altere nenhum outro arquivo. Não escreva explicações fora do JSON.
EOF
)

echo "[desc] pedindo $N descrições ao claude..."
claude -p "$PROMPT" --allowedTools "Read,Edit,Write" >/dev/null 2>&1 || { echo "[desc] claude falhou"; exit 1; }

node -e 'const o=JSON.parse(require("fs").readFileSync("data/descriptions.json"));if(typeof o!=="object"||Array.isArray(o))throw new Error("schema");console.log("[desc] ok, total="+Object.keys(o).length)'

if git diff --quiet data/descriptions.json; then echo "[desc] sem mudanças"; exit 0; fi
git add data/descriptions.json
git -c user.name="selfhost-bot" -c user.email="matheus.dias.dev@gmail.com" commit -q -m "content: +$N descrições únicas (auto)"
git push origin main
echo "[desc] push feito — Cloudflare vai rebuildar."
