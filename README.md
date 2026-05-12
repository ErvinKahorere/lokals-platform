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
- Organization admin: `+264810001020` / `Password123!`
- Citizen: `+264810001050` / `Password123!`
- Business owner: `+264810001101` / `Password123!`
- Service provider: `+264810002203` / `Password123!`

## Okahandja demo mode

Use demo mode for live presentations where every flow should stay safe even if external services are unavailable.

### Demo flags

- Backend demo seed support: `SEED_DEMO_DATA=true`
- Web demo mode: `VITE_APP_MODE=demo`
- Mobile demo mode: `--dart-define=APP_MODE=demo`

### Demo-safe behavior

- No backend SMS, WhatsApp, or email delivery is required for the walkthrough. LOKALS uses in-app updates, seeded records, and safe client-side handoff links.
- Delivery, ride, store posting, accommodation posting, and marketplace publishing already simulate cleanly when demo mode is active on web and mobile.
- Mobile splash and web bootstrap both expose safe offline/demo continuation paths when the app is in demo mode.

### Suggested launch commands

```bash
cd lokals-backend
php artisan migrate:fresh --seed
```

```bash
cd lokals-web
copy .env.example .env
set VITE_APP_MODE=demo
npm run dev
```

```bash
cd lokals-mobile
flutter pub get
flutter run --dart-define=APP_MODE=demo --dart-define=API_BASE_URL=http://10.0.2.2:8000/api/v1
```

### Okahandja council demo checklist

- Flow A: Login as Town manager, send or review a municipal alert, then switch to Citizen and confirm it appears in Alerts, Home updates, and Notifications.
- Flow B: Login as Citizen, submit a report issue, switch to Town manager, update the report status, then switch back to Citizen and confirm the notification and report detail update.
- Flow C: As Citizen or guest, open Directory, choose a public service, and use the call or WhatsApp action.
- Flow D: As Citizen, browse Services, open a provider, complete a booking, and confirm it appears in My Bookings.
- Flow E: As Citizen or guest, browse Local News, Events, and Store, then open an article, reserve an event ticket, and open a local product.

### Presentation notes

- Keep the pilot scoped to Okahandja only. Location pickers, seeded data, and dashboards are tuned for the pilot town.
- Use Town manager for the municipal story, Organization admin for public updates/events, Business owner for store flows, and Service provider for bookings.
- If a live external dependency is unavailable, stay in demo mode and continue with the seeded or simulated success flows.
