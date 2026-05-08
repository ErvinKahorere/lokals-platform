# LOKALS Web

React + Vite + TypeScript web app for the LOKALS Phase 1 MVP.

## Setup

1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL in your browser.

## Demo accounts

- Citizen: `+264810000002` / `password`
- Provider: `+264810000003` / `password`
- Admin: `+264810000001` / `password`

## Notes

- The app expects the Laravel backend at `http://127.0.0.1:8000/api/v1` by default.
- Pages include public browsing, booking flow, user dashboard views, and simple admin management views.
- Set `VITE_API_URL` in `.env` for staging or production.
- Run `npm run build` before release validation.
