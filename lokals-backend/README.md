# LOKALS Backend

Laravel 12 API for the LOKALS Phase 1 MVP.

## Included modules

- Auth with Sanctum
- Users, profiles, saved addresses, and progressive onboarding
- Follow system
- Alerts and announcements feed
- City service reports
- Marketplace listings
- Jobs and worker profiles
- Delivery requests
- Ride requests
- SOS
- Organizations directory
- Service providers, services, availability, and bookings
- Database notifications
- Trust and safety reports

## Setup

1. Copy `.env.example` to `.env`.
2. Create a PostgreSQL database, or adjust `.env` to your local driver if you use a different database for development.
3. Run `composer install`.
4. Run `php artisan key:generate`.
5. Run `php artisan migrate --seed`.
6. Run `php artisan storage:link`.
7. Run `php artisan serve`.
8. Optional for queued notifications: run `php artisan queue:work`.
9. Optional for scheduled work and news refresh: run `php artisan schedule:work`.

## Demo users

- Super admin: `+264810001000` / `Password123!`
- Town manager: `+264810001001` / `Password123!`
- Citizen: `+264810001050` / `Password123!`
- Business owner: `+264810001101` / `Password123!`
- Service provider: `+264810002203` / `Password123!`

## Important endpoints

- `POST /api/v1/auth/login`
- `GET /api/v1/service-providers`
- `GET /api/v1/service-providers/{id}`
- `GET /api/v1/service-providers/{id}/services`
- `GET /api/v1/service-providers/{id}/availability`
- `POST /api/v1/bookings`
- `GET /api/v1/bookings`
- `GET /api/v1/provider/bookings`
- `PUT /api/v1/bookings/{id}/status`

## Example API usage

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"+264810001050\",\"password\":\"Password123!\"}"
```

```bash
curl http://127.0.0.1:8000/api/v1/service-providers \
  -H "Accept: application/json"
```

```bash
curl -X POST http://127.0.0.1:8000/api/v1/bookings \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"service_id\":1,\"booking_date\":\"2026-04-28\",\"start_time\":\"10:00\",\"notes\":\"Please confirm quickly.\"}"
```

## Notes

- Booking notifications are stored in the database and queued.
- `NotificationDispatchService` includes a TODO marker for future SMS and WhatsApp delivery.
- Simple matching sorts providers by distance when `lat` and `lng` are passed.
- API errors are standardized for validation (`422`), unauthenticated (`401`), forbidden (`403`), and not found (`404`) JSON responses.
- Uploaded avatars, logos, listings, and product images are restricted to common image formats and file-size limits.
