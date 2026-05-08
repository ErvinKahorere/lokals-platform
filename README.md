# LOKALS

LOKALS is a mobile-first local life platform focused on Namibia and similar emerging-market contexts.

## Workspace

- `lokals-backend`: Laravel 12 API
- `lokals-web`: React + Vite + TypeScript
- `lokals-mobile`: Flutter + Riverpod

## Quick start

### Backend

```bash
cd lokals-backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### Web

```bash
cd lokals-web
copy .env.example .env
npm install
npm run dev
```

### Mobile

```bash
cd lokals-mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000/api/v1
```

## Production notes

### Backend

- Set `APP_DEBUG=false`
- Set `APP_URL` to the public backend origin
- Configure `SANCTUM_STATEFUL_DOMAINS` and CORS origins for the web app origin
- Run `php artisan storage:link`
- Run queue workers:

```bash
php artisan queue:work
```

- Run scheduled tasks:

```bash
php artisan schedule:work
```

### Web

- Set `VITE_API_URL` to the public backend API origin
- Run `npm run build` for a production bundle

### Mobile

- Android emulator backend: `http://10.0.2.2:8000/api/v1`
- Physical device over USB: `adb reverse tcp:8000 tcp:8000`
- Physical device over LAN: use the reachable backend host if USB reverse is unavailable

## Demo accounts

- Super admin: `+264810001000` / `Password123!`
- Town manager: `+264810001001` / `Password123!`
- Citizen: `+264810001050` / `Password123!`
- Business owner: `+264810001101` / `Password123!`
- Service provider: `+264810002203` / `Password123!`
