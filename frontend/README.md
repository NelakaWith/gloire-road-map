# Gloire Road Map — Frontend

This folder contains the Vue 3 frontend app for Gloire Road Map. It includes the admin UI and the Analytics pages used to monitor goals and cohorts.

## Quick start (development)

1. Copy `.env.example` to `.env` and update any API base URLs if needed.
2. Install dependencies and run dev server:

```powershell
cd frontend
npm install
npm run dev
```

The dev server runs on the port configured by Vite (default: 5173).

## Important pages

- Login / Admin dashboard — manage students and goals.
- Analytics page (`AnalyticsView.vue`) — KPIs, time-series, top students, backlog age buckets.

## Build for production

```powershell
cd frontend
npm install
npm run build
```

The build output is in `frontend/dist/` and is what the deploy workflow copies to the droplet.

## Testing & QA

- Frontend unit tests are not fully implemented; focus currently is on wiring charts to the analytics endpoints and manual QA.

## Deploy notes

- The deploy workflow builds the frontend on CI and/or the droplet and copies `dist/` into the NGINX live folder on the server. If the deploy user on the droplet cannot `sudo` without a password, the workflow skips `sudo` steps (see deploy script).

## Next steps (frontend)

- Finish wiring charts to live endpoints, add component tests for chart transforms.
- Add code-splitting to reduce large chunk warnings from Vite (split AnalyticsView or heavy libs).
