# LOKALS Agent Guide

## Project Overview

LOKALS is a mobile-first local life platform focused on emerging markets, starting with Namibia. The repository contains:

- `lokals-backend`: Laravel API powering auth, listings, jobs, providers, bookings, reports, alerts, moderation, and admin analytics.
- `lokals-web`: React + Vite + TypeScript web companion for discovery, booking, commerce, dashboards, and admin operations.
- `lokals-mobile`: Flutter mobile app for the customer-first super-app experience.

Phase 2 emphasizes premium UX, low-data performance, API-safe integration, and reusable design systems across web and mobile.

## Stack

- Backend: Laravel 12, MySQL, Sanctum, Spatie Permission, queues, events, notifications
- Web: React, Vite, TypeScript, Tailwind CSS, TanStack Query, Zustand, Axios, React Router, Framer Motion
- Mobile: Flutter, Riverpod, Dio, go_router, shared_preferences

## Build Commands

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
npm install
npm run dev
npm run build
```

### Mobile

```bash
cd lokals-mobile
flutter pub get
flutter analyze
flutter run
```

## Test Commands

### Backend

```bash
cd lokals-backend
php artisan route:list
php artisan test
```

### Web

```bash
cd lokals-web
npm run build
```

### Mobile

```bash
cd lokals-mobile
flutter analyze
```

## Coding Standards

- Do not rebuild modules from scratch when an existing flow can be safely upgraded.
- Preserve API contracts unless a backend change is clearly required for UI data.
- Keep API payload usage lean and paginated.
- Reuse existing query hooks, repositories, and models before creating new data layers.
- Prefer small composable components over page-specific duplicated UI.
- Keep copy short, friendly, and easy for non-technical users.
- Default to ASCII in source files unless a file already relies on Unicode.

## UI Rules

- Mobile-first always. Desktop should feel like an expanded mobile layout, not a stretched admin table.
- Use the LOKALS brand system:
  - Green: `#16A34A`
  - Charcoal: `#0F172A`
  - Gold: `#FACC15`
  - Soft background: `#F8FAFC`
- Red is reserved for SOS and danger states.
- Use large tap targets, clear hierarchy, premium cards, subtle shadows, and minimal visual clutter.
- Every async screen should support loading, empty, and error states.
- Every form should support labels, placeholders, validation, submit loading, and success feedback.
- Use consistent icon systems:
  - Web: `lucide-react`
  - Mobile: Material icons

## Design System Instructions

### Web

- Shared UI components live in `lokals-web/src/components/ui`.
- Theme tokens live in Tailwind config and `lokals-web/src/styles/theme.ts`.
- Prefer `AppShell`, `Header`, `MobileBottomNav`, `Card`, `Button`, `SearchBar`, and domain cards before adding new primitives.
- Keep Framer Motion tasteful: subtle tap scale, small lift, soft page transitions only.

### Mobile

- Theme files live in `lokals-mobile/lib/core/theme`.
- Shared widgets live in `lokals-mobile/lib/shared/widgets`.
- Preserve the compatibility layer in `lokals-mobile/lib/src/widgets/cards.dart` and `shell.dart` when upgrading screens.
- Use reusable cards, buttons, search bars, badges, and skeletons instead of ad hoc widgets.

## API Safety

- Do not break backend endpoint names, payload shapes, or auth flows without verifying all consumers.
- Web and mobile should match backend pagination and filtering patterns.
- Any backend change must be followed by:
  - `php artisan route:list`
  - `php artisan test` if tests exist
- If a UI needs extra data, prefer additive backend changes over breaking changes.

## Delivery Notes

- Prioritize low-data UX, progressive disclosure, and booking-first flows.
- Keep trust and safety visible through verification, statuses, moderation affordances, and SOS clarity.
- When in doubt, optimize for clarity, speed, and local usability over visual novelty.
