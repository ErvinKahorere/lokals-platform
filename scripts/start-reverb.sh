#!/usr/bin/env sh

set -eu

echo "Starting Laravel Reverb websocket server..."
exec php artisan reverb:start \
  --host=0.0.0.0 \
  --port="${PORT:-10001}" \
  --hostname="${REVERB_HOST:-0.0.0.0}" \
  --no-interaction
