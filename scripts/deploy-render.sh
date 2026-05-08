#!/usr/bin/env sh

set -eu

composer install --no-dev --optimize-autoloader

if [ -z "${APP_KEY:-}" ]; then
  php artisan key:generate --force
fi

php artisan migrate --force
php artisan storage:link || true
case "${LOKALS_DEMO_SEED:-false}" in
  true|TRUE|1|yes|YES)
    php artisan db:seed --force
    ;;
esac
php artisan optimize:clear
php artisan route:clear
php artisan config:clear
php artisan config:cache
php artisan route:cache
