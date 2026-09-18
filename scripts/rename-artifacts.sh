#!/bin/bash
set -e

cd "$(dirname "$0")/../.."

echo "🔄 Renaming directories..."

# Rename using git to preserve history
git mv artifacts/api-server artifacts/taskflow-backend || {
  echo "Git mv failed, trying manual copy..."
  cp -r artifacts/api-server artifacts/taskflow-backend
  rm -rf artifacts/api-server
}

git mv artifacts/taskflow artifacts/taskflow-frontend || {
  echo "Git mv failed for taskflow, trying manual copy..."
  cp -r artifacts/taskflow artifacts/taskflow-frontend
  rm -rf artifacts/taskflow
}

echo "✅ Directories renamed!"
echo "📝 Updating package names..."

# Update taskflow-backend package.json
sed -i 's/"@workspace\/api-server"/"@workspace\/taskflow-backend"/g' artifacts/taskflow-backend/package.json

echo "✅ Done! New structure:"
echo "  - artifacts/taskflow-backend"
echo "  - artifacts/taskflow-frontend"
