#!/bin/bash
# Setup backend structure
mkdir -p artifacts/taskflow-backend/{src/{db,routes,services,middleware,types},dist}
cd artifacts/taskflow-backend

# package.json
cat > package.json << 'EOF'
{
  "name": "@workspace/taskflow-backend",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./dist/server.js",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/express": "^4.17.17",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/node": "^20.0.0",
    "drizzle-kit": "^0.20.0",
    "tsx": "^4.21.0",
    "typescript": "~5.9.2"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "drizzle-orm": "^0.30.0",
    "better-sqlite3": "^9.0.0",
    "zod": "catalog:"
  }
}
EOF

echo "Backend structure created!"
