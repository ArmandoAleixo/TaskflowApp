#!/bin/bash
# Este script cria toda a estrutura de taskflow-backend e taskflow-frontend
# Execute com: bash scripts/setup-new-structure.sh

set -e

ARTIFACTS_DIR="artifacts"

echo "📁 Criando estrutura de diretórios..."

# Criar estrutura taskflow-backend
mkdir -p "$ARTIFACTS_DIR/taskflow-backend/src/routes"
mkdir -p "$ARTIFACTS_DIR/taskflow-backend/src/lib"
mkdir -p "$ARTIFACTS_DIR/taskflow-backend/src/middleware"
mkdir -p "$ARTIFACTS_DIR/taskflow-backend/src/services"
mkdir -p "$ARTIFACTS_DIR/taskflow-backend/src/db"

# Criar arquivos para taskflow-backend
cp "$ARTIFACTS_DIR/api-server/package.json" "$ARTIFACTS_DIR/taskflow-backend/package.json"
cp "$ARTIFACTS_DIR/api-server/tsconfig.json" "$ARTIFACTS_DIR/taskflow-backend/tsconfig.json"
cp "$ARTIFACTS_DIR/api-server/build.mjs" "$ARTIFACTS_DIR/taskflow-backend/build.mjs"
cp "$ARTIFACTS_DIR/api-server/.replit-artifact" "$ARTIFACTS_DIR/taskflow-backend/.replit-artifact" 2>/dev/null || true
cp "$ARTIFACTS_DIR/api-server/src/app.ts" "$ARTIFACTS_DIR/taskflow-backend/src/app.ts"
cp "$ARTIFACTS_DIR/api-server/src/index.ts" "$ARTIFACTS_DIR/taskflow-backend/src/index.ts"
cp "$ARTIFACTS_DIR/api-server/src/lib/logger.ts" "$ARTIFACTS_DIR/taskflow-backend/src/lib/logger.ts"
cp "$ARTIFACTS_DIR/api-server/src/routes/index.ts" "$ARTIFACTS_DIR/taskflow-backend/src/routes/index.ts"
cp "$ARTIFACTS_DIR/api-server/src/routes/health.ts" "$ARTIFACTS_DIR/taskflow-backend/src/routes/health.ts"

# Atualizar package.json
sed -i 's/"@workspace\/api-server"/"@workspace\/taskflow-backend"/g' "$ARTIFACTS_DIR/taskflow-backend/package.json"

# Adicionar bcryptjs e jsonwebtoken ao package.json
jq '.dependencies += {"bcryptjs": "^2.4.3", "jsonwebtoken": "^9.0.0"} | .devDependencies += {"@types/bcryptjs": "^2.4.2", "@types/jsonwebtoken": "^9.0.2"}' "$ARTIFACTS_DIR/taskflow-backend/package.json" > "$ARTIFACTS_DIR/taskflow-backend/package.json.tmp"
mv "$ARTIFACTS_DIR/taskflow-backend/package.json.tmp" "$ARTIFACTS_DIR/taskflow-backend/package.json"

echo "✅ taskflow-backend criado!"
echo ""
echo "📝 Próximos passos:"
echo "1. DELETE manualmente: artifacts/api-server"
echo "2. RENAME manualmente: artifacts/taskflow → artifacts/taskflow-frontend"
echo "3. Execute: pnpm install"
echo "4. Execute: pnpm run -r build"
