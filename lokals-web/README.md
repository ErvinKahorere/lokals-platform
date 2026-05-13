# LOKALS Web

React + Vite + TypeScript web app for the LOKALS Phase 1 MVP.

## Setup

1. Copy `.env.example` to `.env`.
2. Run `npm install`.
3. Run `npm run dev`.
4. Open the Vite URL in your browser.

## Demo accounts

- Resident: `+264810001050` / `Password123!`
- Service provider: `+264810002203` / `Password123!`
- Business owner: `+264810001101` / `Password123!`
- Town manager: `+264810001001` / `Password123!`
- Super admin: `+264810001000` / `Password123!`

## Notes

- The app expects the Laravel backend at `http://127.0.0.1:8000/api/v1` locally and `https://lokals-platform.onrender.com/api/v1` in production.
- Pages include public browsing, booking flow, user dashboard views, and simple admin management views.
- Set `VITE_API_URL` in `.env` for staging or production.
- Run `npm run build` before release validation.
