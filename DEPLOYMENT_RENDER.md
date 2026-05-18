# LOKALS Render Docker Deployment

This guide covers Docker deployment of the Laravel 12 backend on Render with:

- Render Web Service
- Render PostgreSQL
- Vercel frontend
- Sanctum-compatible cross-domain setup

## Render Setup

1. Create Render services from this repository using [render.yaml](</E:/src/xamp/htdocs/Lokals v1/render.yaml>).
2. Choose `Docker` as the environment for each service.
3. Render will use the repo-root [Dockerfile](</E:/src/xamp/htdocs/Lokals v1/Dockerfile>).
4. Set the web health check path to `/api/health`.
5. Attach a Render PostgreSQL database.
6. Add the backend environment variables listed below to every service that boots Laravel.

### Recommended Render Service Topology

- `lokals-api` web service
- `lokals-queue` worker service
- `lokals-scheduler` cron service
- `lokals-reverb` private service only if self-hosting Reverb

If you use a managed Pusher-compatible broadcaster instead of self-hosting Reverb, omit `lokals-reverb` and configure the `PUSHER_*` variables instead.

## Required Environment Variables

```env
APP_NAME=LOKALS
APP_ENV=production
APP_DEBUG=false
APP_URL=https://lokals-platform.onrender.com
APP_KEY=

FRONTEND_URL=https://lokals-platform.vercel.app

DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
DB_SCHEMA=public
DB_SSLMODE=prefer

SANCTUM_STATEFUL_DOMAINS=lokals-platform.vercel.app
CORS_ALLOWED_ORIGINS=https://lokals-platform.vercel.app,http://localhost:5173,http://127.0.0.1:5173

SESSION_DRIVER=file
SESSION_DOMAIN=
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none
BROADCAST_CONNECTION=reverb
QUEUE_CONNECTION=database
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=
REVERB_APP_ID=
REVERB_APP_KEY=
REVERB_APP_SECRET=
REVERB_HOST=
REVERB_PORT=443
REVERB_SCHEME=https
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=
QUEUE_WORKER_SLEEP=3
QUEUE_WORKER_TRIES=3
QUEUE_WORKER_BACKOFF=5
QUEUE_WORKER_TIMEOUT=120
QUEUE_WORKER_MAX_JOBS=500
QUEUE_WORKER_MAX_TIME=3600
SEED_DEMO_DATA=false
```

## Deploy Process

1. Render builds the repo-root Docker image.
2. The Docker image copies the Laravel backend into `/app`.
3. Composer dependencies are installed with `--no-dev --optimize-autoloader`.
4. The web service starts with [scripts/start-render.sh](</E:/src/xamp/htdocs/Lokals v1/scripts/start-render.sh>) and automatically runs:

```sh
php artisan migrate --force
php artisan storage:link || true
```

5. Laravel then starts with:

```sh
php artisan serve --host=0.0.0.0 --port=$PORT
```

Render injects the runtime `PORT` variable automatically. The container also exposes port `10000` as the default fallback.

### Worker / Scheduler / Reverb Commands

- Queue worker:

```sh
/app/scripts/start-worker.sh
```

- Scheduler cron:

```sh
/app/scripts/run-scheduler.sh
```

with Render schedule:

```txt
*/5 * * * *
```

- Optional Reverb websocket service:

```sh
/app/scripts/start-reverb.sh
```

## Migration Process

The deploy helper script is available at [scripts/deploy-render.sh](</E:/src/xamp/htdocs/Lokals v1/scripts/deploy-render.sh>).

It performs:

1. `composer install --no-dev --optimize-autoloader`
2. `php artisan key:generate --force` only when `APP_KEY` is missing
3. `php artisan migrate --force`
4. `php artisan storage:link`
5. `php artisan optimize:clear`
6. `php artisan config:cache`
7. `php artisan route:cache`

Render free tier does not provide an interactive shell, so automatic startup migrations are the primary deployment path.

## Queue And Background Job Notes

- `QUEUE_CONNECTION=database` is a safe baseline when Redis is not available.
- The `jobs` and `failed_jobs` tables are created by [0001_01_01_000002_create_jobs_table.php](</E:/src/xamp/htdocs/Lokals v1/lokals-backend/database/migrations/0001_01_01_000002_create_jobs_table.php>).
- `GET /api/v1/queue/health` exposes queue driver, pending job visibility, failed job count, and Redis/config presence for authenticated operators.
- Core system notifications now write database notifications synchronously, so residents still see ride, delivery, issue, and approval updates even if the queue worker is temporarily unhealthy.
- Queued jobs such as broadcasts, queued notifications, and future media processing still require a healthy worker.

## PostgreSQL Notes

- Laravel PostgreSQL config is already present in [config/database.php](</E:/src/xamp/htdocs/Lokals v1/lokals-backend/config/database.php>).
- Render PostgreSQL values should be mapped to:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_DATABASE`
  - `DB_USERNAME`
  - `DB_PASSWORD`
- `DB_SSLMODE=prefer` is supported for hosted PostgreSQL environments.

## Sanctum + Vercel Compatibility

- CORS allows `https://lokals-platform.vercel.app`, `FRONTEND_URL`, `http://localhost:5173`, and `http://127.0.0.1:5173`.
- `supports_credentials` remains enabled.
- Sanctum stateful domains are read from `SANCTUM_STATEFUL_DOMAINS`.
- Session settings support secure cross-domain cookies for a Vercel frontend and Render backend.

## Troubleshooting

### Render says no Dockerfile found

- Confirm the service is using the repository root.
- Confirm the repo-root [Dockerfile](</E:/src/xamp/htdocs/Lokals v1/Dockerfile>) is committed.

### Database connection fails

- Recheck `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD`.
- Confirm `DB_CONNECTION=pgsql`.
- Confirm the Render PostgreSQL instance is attached and reachable.

### App key errors

- Set `APP_KEY` in Render, or let the deploy script generate one when missing.

### CSRF or session issues from Vercel

- Confirm `FRONTEND_URL` matches the deployed Vercel origin.
- Confirm `FRONTEND_URL=https://lokals-platform.vercel.app`.
- Confirm `SANCTUM_STATEFUL_DOMAINS=lokals-platform.vercel.app`.
- Confirm `SESSION_SECURE_COOKIE=true`.
- Confirm `SESSION_SAME_SITE=none`.

### Health check fails

- Confirm `/api/health` responds successfully after boot.
- Confirm the Render service points to the correct app and uses the injected `PORT`.

### Migrations did not run

- Confirm the container is using [scripts/start-render.sh](</E:/src/xamp/htdocs/Lokals v1/scripts/start-render.sh>) as its startup command.
- Confirm the database environment variables are available at runtime.

### Realtime or queue updates do not appear

- Confirm a queue worker is running for queued notifications and broadcasts.
- Confirm Reverb or your Pusher-compatible broadcaster is deployed with the `REVERB_*` or `PUSHER_*` variables configured.
- Confirm the frontend websocket host, port, scheme, and app key match the backend broadcaster settings.
- Confirm authenticated operator users can access:
  - `GET /api/v1/realtime/health`
  - `GET /api/v1/queue/health`
- In non-production environments, run:
  - `php artisan lokals:realtime-smoke all`
  - `php artisan lokals:notification-smoke`

### Demo data appeared in production

- Confirm `SEED_DEMO_DATA=false`.
- Demo seeders are intended only for staging, QA, and controlled demos.
