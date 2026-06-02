#!/bin/sh
set -e
echo "Running database migrations..."
npx prisma migrate deploy
echo "Seeding if needed..."
npx prisma db seed || true
echo "Starting API..."
exec node dist/index.js
