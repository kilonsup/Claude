#!/usr/bin/env bash
# Build step for hosted deployments (Vercel, Render, Railway).
# Collects static assets and applies migrations against DATABASE_URL.
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput

# Migrations run here so the schema is ready before the first request. Safe to
# re-run: Django skips migrations that have already been applied.
python manage.py migrate --noinput

# Optional one-time demo content. Set SEED_DEMO_DATA=1 in the environment to
# populate example planners, vendors, events and gallery items.
if [ "${SEED_DEMO_DATA:-0}" = "1" ]; then
  python manage.py seed_demo_data
fi
