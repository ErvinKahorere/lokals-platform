# LOKALS Mobile

Flutter mobile app for the LOKALS Phase 1 MVP.

## Setup

1. Run `flutter pub get`.
2. Start the Laravel backend.
3. Run the app with:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000/api/v1
```

Use `http://127.0.0.1:8000/api/v1` for desktop/web Flutter targets when needed.

## Android notes

- Emulator default backend: `http://10.0.2.2:8000/api/v1`
- Physical device over USB: use `adb reverse tcp:8000 tcp:8000`
- Physical device on Wi-Fi can use `http://192.168.0.178:8000/api/v1`
- If multiple backend hosts are configured, the app retries fallback hosts on connection failure
- Run `flutter analyze` before release checks

## Demo accounts

- Resident: `+264810000002` / `password`
- Provider: `+264810000003` / `password`
- Admin: `+264810000001` / `password`

## Included screens

- `ServicesScreen`
- `ProviderDetailsScreen`
- `BookingScreen`
- `MyBookingsScreen`
- `ProviderBookingsScreen`
