#!/usr/bin/env sh

set -eu

php artisan optimize:clear || true
php artisan route:clear || true
php artisan config:clear || true
php artisan migrate --force
php artisan storage:link || true
case "${LOKALS_DEMO_SEED:-false}" in
  true|TRUE|1|yes|YES)
    php artisan db:seed --force
    ;;
esac
php artisan route:cache || true

exec php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
