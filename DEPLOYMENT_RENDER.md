# LOKALS Render Docker Deployment

This guide covers Docker deployment of the Laravel 12 backend on Render with:

- Render Web Service
- Render PostgreSQL
- Vercel frontend
- Sanctum-compatible cross-domain setup

## Render Setup

1. Create a new Render Web Service from this repository.
2. Choose `Docker` as the environment.
3. Render will use the repo-root [Dockerfile](</E:/src/xamp/htdocs/Lokals v1/Dockerfile>).
4. Set the health check path to `/api/health`.
5. Attach a Render PostgreSQL database.
6. Add the backend environment variables listed below.

## Required Environment Variables

```env
APP_NAME=LOKALS
APP_ENV=production
APP_DEBUG=false
APP_URL=https://lokals-api.onrender.com
APP_KEY=

FRONTEND_URL=https://lokals.vercel.app

DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
DB_SCHEMA=public
DB_SSLMODE=prefer

SANCTUM_STATEFUL_DOMAINS=lokals.vercel.app
CORS_ALLOWED_ORIGINS=https://lokals.vercel.app,http://localhost:5173,http://127.0.0.1:5173

SESSION_DRIVER=file
SESSION_DOMAIN=
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none
```

## Deploy Process

1. Render builds the repo-root Docker image.
2. The Docker image copies the Laravel backend into `/app`.
3. Composer dependencies are installed with `--no-dev --optimize-autoloader`.
4. On container startup, Render automatically runs:

```sh
php artisan migrate --force
php artisan storage:link || true
```

5. Laravel then starts with:

```sh
php artisan serve --host=0.0.0.0 --port=$PORT
```

Render injects the runtime `PORT` variable automatically. The container also exposes port `10000` as the default fallback.

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

- CORS allows `FRONTEND_URL`, `http://localhost:5173`, and `http://127.0.0.1:5173`.
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
- Confirm `SANCTUM_STATEFUL_DOMAINS=lokals.vercel.app` or your actual Vercel domain.
- Confirm `SESSION_SECURE_COOKIE=true`.
- Confirm `SESSION_SAME_SITE=none`.

### Health check fails

- Confirm `/api/health` responds successfully after boot.
- Confirm the Render service points to the correct app and uses the injected `PORT`.

### Migrations did not run

- Confirm the container is using [scripts/start-render.sh](</E:/src/xamp/htdocs/Lokals v1/scripts/start-render.sh>) as its startup command.
- Confirm the database environment variables are available at runtime.
