# LOKALS Deployment

This guide prepares the current LOKALS MVP for:

- Frontend: Vercel
- Backend API: Render
- Database: Render PostgreSQL

No UI, role, dashboard, or business-flow changes are required for this setup.

## Backend On Render

1. Create Render services from the repository root using [render.yaml](</E:/src/xamp/htdocs/Lokals v1/render.yaml>) and the repo-root [Dockerfile](</E:/src/xamp/htdocs/Lokals v1/Dockerfile>).
2. Keep every service pointed at the repository root so the Docker build can copy `lokals-backend` and `scripts`.
3. Provision these services:
   - Laravel web service: `lokals-api`
   - Queue worker: `lokals-queue`
   - Scheduler cron: `lokals-scheduler`
   - Optional websocket service: `lokals-reverb`
4. Add the environment variables listed below to every backend service that boots Laravel.
5. After the first deploy, confirm migrations, queue worker boot, scheduler ticks, and websocket/broadcast connectivity.
6. Confirm health checks at `/api/health`.

### Required Backend Env

```env
APP_NAME=LOKALS
APP_ENV=production
APP_DEBUG=false
APP_URL=https://lokals-platform.onrender.com
FRONTEND_URL=https://lokals-platform.vercel.app
DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
SANCTUM_STATEFUL_DOMAINS=lokals-platform.vercel.app
SESSION_DOMAIN=
SESSION_DRIVER=file
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none
SEED_DEMO_DATA=false
```

### Additional Recommended Backend Env

```env
APP_KEY=
DB_SCHEMA=public
DB_SSLMODE=prefer
CORS_ALLOWED_ORIGINS=https://lokals-platform.vercel.app,http://localhost:5173,http://127.0.0.1:5173
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local
BROADCAST_CONNECTION=reverb
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

### Render PostgreSQL Env Variables

Use the values from your Render PostgreSQL instance:

- `DB_HOST`
- `DB_PORT=5432`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`

If Render provides a connection string, you can also map it to `DB_URL` in Laravel.

## Frontend On Vercel

1. Create a new Vercel project from `lokals-web`.
2. Set the root directory to `lokals-web`.
3. Vercel will use [vercel.json](/E:/src/xamp/htdocs/Lokals%20v1/lokals-web/vercel.json).
4. Add the frontend environment variable below.
5. Deploy and note the final Vercel domain.
6. Update the backend `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, and `SANCTUM_STATEFUL_DOMAINS` to match the final frontend domain.

### Required Frontend Env

```env
VITE_API_URL=https://lokals-platform.onrender.com
```

### Optional Frontend Env

```env
VITE_APP_URL=https://lokals-platform.vercel.app
VITE_USE_SANCTUM_COOKIE_AUTH=false
VITE_API_BASE_URL=https://lokals-platform.onrender.com
VITE_REVERB_HOST=
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
VITE_REVERB_APP_KEY=
```

Set `VITE_USE_SANCTUM_COOKIE_AUTH=true` only if the web app is using Sanctum cookie-based SPA auth. Leave it `false` for bearer-token-only flows.

If the frontend connects directly to Reverb or a Pusher-compatible broadcaster, also set:

```env
VITE_PUSHER_APP_KEY=
VITE_PUSHER_HOST=
VITE_PUSHER_PORT=443
VITE_PUSHER_SCHEME=https
VITE_PUSHER_APP_CLUSTER=
```

## Render Service Commands

- Web service:
  - image default command: [scripts/start-render.sh](</E:/src/xamp/htdocs/Lokals v1/scripts/start-render.sh>)
- Queue worker:
  - command: [scripts/start-worker.sh](</E:/src/xamp/htdocs/Lokals v1/scripts/start-worker.sh>)
- Scheduler cron:
  - command: [scripts/run-scheduler.sh](</E:/src/xamp/htdocs/Lokals v1/scripts/run-scheduler.sh>)
  - schedule: `*/5 * * * *`
- Optional Reverb websocket service:
  - command: [scripts/start-reverb.sh](</E:/src/xamp/htdocs/Lokals v1/scripts/start-reverb.sh>)
  - use only when self-hosting Reverb on Render

## Diagnostics And Smoke Tests

- Public health: `GET /api/health`
- Authenticated ops health:
  - `GET /api/v1/realtime/health`
  - `GET /api/v1/queue/health`
- Non-production smoke commands:
  - `php artisan lokals:realtime-smoke all`
  - `php artisan lokals:notification-smoke`

Use smoke commands only in non-production environments. They are disabled in production.

## Production Seeding Notes

- Leave `SEED_DEMO_DATA=false` in production.
- Enable demo seed data only for staging or controlled demos.
- The transport/demo seeders are idempotent, but production deployments should not rely on them.

## Notes

- Do not commit real secrets.
- Set `APP_KEY` in Render if you prefer managing it manually.
- If `APP_KEY` is empty during deploy, [deploy-render.sh](</E:/src/xamp/htdocs/Lokals v1/lokals-backend/scripts/deploy-render.sh>) generates one safely.
- The backend health endpoint is available at `/api/health`.
- CORS is configured to allow `FRONTEND_URL`, `http://localhost:5173`, and `http://127.0.0.1:5173` with credentials enabled.
- Core system notifications now write to the database synchronously, so ride, delivery, issue, and approval notifications still appear even if a queue worker is delayed.
- Queue workers are still required for queued jobs, queued notifications, and `ShouldBroadcast` event delivery when using async broadcasting.
