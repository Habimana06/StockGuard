#!/bin/sh
set -e

echo "Waiting for MySQL to accept connections..."
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15; do
  if npx prisma migrate deploy 2>/dev/null; then
    break
  fi
  echo "  attempt $i — database not ready yet, retrying in 2s..."
  sleep 2
done

npx prisma migrate deploy
echo "Seeding if needed..."
npx prisma db seed || true
echo "Starting API..."
exec node dist/index.js
