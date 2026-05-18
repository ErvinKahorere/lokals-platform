# LOKALS Deployment

This guide prepares the current LOKALS MVP for:

- Frontend: Vercel
- Backend API: Render
- Database: Render PostgreSQL

No UI, role, dashboard, or business-flow changes are required for this setup.

## Backend On Render

1. Create a new Render Web Service from the repository root.
2. Render will detect [render.yaml](</E:/src/xamp/htdocs/Lokals v1/render.yaml>) and the repo-root [Dockerfile](</E:/src/xamp/htdocs/Lokals v1/Dockerfile>).
3. Keep the service pointed at the repository root so the Docker build can copy `lokals-backend` and `scripts`.
4. Add the environment variables listed below.
5. After the first deploy, run migrations as part of the deploy flow with [deploy-render.sh](</E:/src/xamp/htdocs/Lokals v1/lokals-backend/scripts/deploy-render.sh>) or your Render start/deploy command setup.
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

## Notes

- Do not commit real secrets.
- Set `APP_KEY` in Render if you prefer managing it manually.
- If `APP_KEY` is empty during deploy, [deploy-render.sh](</E:/src/xamp/htdocs/Lokals v1/lokals-backend/scripts/deploy-render.sh>) generates one safely.
- The backend health endpoint is available at `/api/health`.
- CORS is configured to allow `FRONTEND_URL`, `http://localhost:5173`, and `http://127.0.0.1:5173` with credentials enabled.
- Render production should include a queue worker and websocket/broadcast service alongside the main API if live dashboard updates are required.
