#!/usr/bin/env sh

set -eu

composer install --no-dev --optimize-autoloader

if [ -z "${APP_KEY:-}" ]; then
  php artisan key:generate --force
fi

echo "Clearing Laravel caches before deployment..."
php artisan cache:clear || true
php artisan route:clear || true
php artisan config:clear || true
php artisan view:clear || true
php artisan event:clear || true

echo "Running Render migrations..."
php artisan migrate --force

SEED_DEMO_DATA="${SEED_DEMO_DATA:-false}"

if [ "$SEED_DEMO_DATA" = "true" ]; then
  echo "SEED_DEMO_DATA=true detected. Running demo seeders..."
  LOKALS_DEMO_SEED=true php artisan db:seed --force
else
  echo "SEED_DEMO_DATA not enabled. Skipping demo seeders."
fi

php artisan storage:link || true
php artisan config:cache
php artisan route:cache
