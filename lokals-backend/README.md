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
2. Create a MySQL database named `lokals_backend`.
3. Run `composer install`.
4. Run `php artisan key:generate`.
5. Run `php artisan migrate --seed`.
6. Run `php artisan serve`.
7. Optional for queued notifications: run `php artisan queue:listen`.

## Demo users

- Super admin: `+264810000001` / `password`
- Citizen: `+264810000002` / `password`
- Provider barber: `+264810000003` / `password`
- Provider doctor: `+264810000004` / `password`
- Provider mechanic: `+264810000005` / `password`
- Municipality admin: `+264810000006` / `password`

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
  -d "{\"phone\":\"+264810000002\",\"password\":\"password\"}"
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
