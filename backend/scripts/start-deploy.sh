#!/bin/sh
set -e
echo "=== StockGuard API deploy start ==="
echo "Running migrations..."
npx prisma migrate deploy
echo "Seeding (skip if already done)..."
npx prisma db seed || true
echo "Starting server on port ${PORT:-4000}..."
exec node dist/index.js
