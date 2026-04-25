#!/bin/sh
set -e

echo "Running database migrations..."
/app/.venv/bin/alembic upgrade head

echo "Starting server..."
exec /app/.venv/bin/uvicorn app.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --workers 2 \
  --no-access-log
