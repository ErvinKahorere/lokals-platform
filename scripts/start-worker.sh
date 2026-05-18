#!/usr/bin/env sh

set -eu

echo "Starting Laravel queue worker..."
exec php artisan queue:work "${QUEUE_CONNECTION:-database}" \
  --sleep="${QUEUE_WORKER_SLEEP:-3}" \
  --tries="${QUEUE_WORKER_TRIES:-3}" \
  --backoff="${QUEUE_WORKER_BACKOFF:-5}" \
  --timeout="${QUEUE_WORKER_TIMEOUT:-120}" \
  --max-jobs="${QUEUE_WORKER_MAX_JOBS:-500}" \
  --max-time="${QUEUE_WORKER_MAX_TIME:-3600}" \
  --no-interaction
