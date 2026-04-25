# LOKALS Phase 1 MVP

Production-ready MVP foundation for a mobile-first local life platform focused on Namibia and similar emerging-market contexts.

## Projects

- `lokals-backend` - Laravel 12 API with Sanctum, Spatie Permission, queued database notifications, seed data, booking logic, and role-based modules.
- `lokals-web` - React + Vite + TypeScript web client with Tailwind CSS, TanStack Query, Zustand, and React Router.
- `lokals-mobile` - Flutter mobile client with Riverpod, Dio, go_router, and shared_preferences.

## Workspace structure

```text
Lokals v1/
├── lokals-backend/
├── lokals-web/
├── lokals-mobile/
└── README.md
```

## Quick start

### Backend

```bash
cd lokals-backend
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
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

## Demo accounts

- Super admin: `+264810000001` / `password`
- Citizen: `+264810000002` / `password`
- Provider barber: `+264810000003` / `password`
- Provider doctor: `+264810000004` / `password`
- Provider mechanic: `+264810000005` / `password`
- Municipality admin: `+264810000006` / `password`

## Core modules

- Auth
- Users and profiles
- Follow system
- Alerts and feed
- City services
- Marketplace
- Jobs and workers
- Delivery
- Rides
- SOS
- Organizations directory
- Notifications
- Trust and safety
- Service providers and bookings
