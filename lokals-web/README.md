# LOKALS Web

React + Vite + TypeScript web app for the LOKALS civic platform.

## Setup

1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL in your browser.

## Demo accounts

- Demo Resident: `resident@lokals.test` / `password`
- Demo Driver: `driver@lokals.test` / `password`
- Demo Courier: `courier@lokals.test` / `password`

## Notes

- The app expects the Laravel backend at `http://127.0.0.1:8000/api/v1` locally and `https://lokals-platform.onrender.com/api/v1` in production.
- Pages include public browsing, booking flow, user dashboard views, and simple admin management views.
- Set `VITE_API_URL` or `VITE_API_BASE_URL` in `.env` for staging or production.
- Realtime dashboard updates also need the websocket envs used by your Echo bootstrap, such as `VITE_REVERB_HOST`, `VITE_REVERB_PORT`, `VITE_REVERB_SCHEME`, and `VITE_REVERB_APP_KEY`.
- Run `npm run build` before release validation.
