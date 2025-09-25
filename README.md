# Gloire Road Map - Goal Tracking App

## What this repo is now

Gloire Road Map is a small goal-tracking app (admin + students) with a Vue 3 frontend and an Express backend backed by MySQL. The project now includes an MVP Analytics module (backend + tests + frontend components) and a CI/CD workflow that deploys the app to a droplet via SSH.

This README summarizes the current state, a short case study that shows the analytics flow, what was implemented recently, and recommended next steps.

## Stack

- Frontend: Vue 3 + Vite (+ PrimeVue components)
- Backend: Node.js + Express
- Database: MySQL
- CI/CD: GitHub Actions (release + deploy workflows)

## Quick status (high level)

- Analytics endpoints (backend): throughput, backlog, overdue, time-to-complete — implemented and covered by unit tests.
- Frontend: `AnalyticsView.vue` + chart components scaffolded and wired for the MVP (charts and KPI cards present). Additional UI polish remains.
- DB: seed SQL and index suggestions were added to `_db/` (seeds and non-destructive index SQL included).
- CI/CD: Fixed a workflow SyntaxError and improved deployment status handling (exports clean DEPLOYMENT_ID and attempts an `in_progress` status). Note: GitHub Environment protection (required approvals) can still show a deployment as "Ready to deploy (idle)" until released.

## Simple case study — Admin inspects last 30 days throughput

1. Admin opens the Analytics page and selects "Last 30 days" and `group_by=day`.
2. Frontend requests: GET /api/analytics/throughput?start_date=2025-08-26&end_date=2025-09-25&group_by=day
3. Backend returns a zero-filled time series with created/completed counts and completion_rate for each day.

Example (trimmed) response:

```json
[
  {
    "label": "2025-09-01",
    "start": "2025-09-01",
    "end": "2025-09-01",
    "created": 5,
    "completed": 3,
    "completion_rate": 60
  },
  {
    "label": "2025-09-02",
    "start": "2025-09-02",
    "end": "2025-09-02",
    "created": 2,
    "completed": 2,
    "completion_rate": 100
  }
]
```

From that chart and the KPI cards the admin can quickly see whether throughput is improving and whether backlog is growing.

## What we implemented (recent & important)

- Backend analytics endpoints with unit tests:
  - GET /api/analytics/throughput — created vs completed time-series (server-side zero-fill, completion rate)
  - GET /api/analytics/backlog — backlog totals and age buckets
  - GET /api/analytics/overdue — overdue vs on-time completion metrics
  - GET /api/analytics/time-to-complete — mean, median, p90 and histogram buckets
- Frontend MVP components for Analytics (filters, KPI cards, charts).
- Unit tests (Vitest) for backend analytics functions — passing locally.
- CI workflow fixes for `deploy.yml`: removed duplicate declarations that caused a SyntaxError; now exports a clean `DEPLOYMENT_ID` and attempts an `in_progress` status so deployments are correctly tracked where possible.
- DB artifacts: seed SQL and index creation snippets added under `_db/`.

## How to run locally (quick)

1. Install prerequisites: Node.js and MySQL.
2. Import DB schema and seed data (see `mysql/` or `_db/` where provided).
3. In `backend/` and `frontend/` run `npm install`.
4. Copy `.env.example` to `.env` and adjust database and secrets.
5. Run backend and frontend in development mode (or use `start-dev.bat` on Windows if present). Default frontend dev port: 5173.

## How deploys work (notes)

- The GitHub Actions deploy workflow creates a GitHub Deployment and copies files to the droplet via `scp`, then runs a remote `ssh` script to install and restart services (pm2 for backend, build frontend on the host). Secrets required: `DROPLET_HOST`, `DROPLET_USER`, `DROPLET_SSH_KEY`.
- The workflow now writes `DEPLOYMENT_ID` to GITHUB_ENV and tries to set an `in_progress` status right after creation; the final `success`/`failure` steps will set the status after the remote deploy step.
- If you see "Ready to deploy (idle)" in the GitHub UI, check: repository Settings → Environments → production. If that environment requires reviewers/approvals, a human approval is required to release the deployment. Alternatively, remove the `environment` property in the workflow to avoid gating (not recommended for production).

## Next steps (recommended)

1. Wire frontend charts fully to the analytics endpoints (if any leftover wiring remains). Add smoothing and presets (30/90/365 days).
2. Add integration tests (supertest) against a seeded test DB to validate full endpoint behavior end-to-end.
3. Add short TTL caching (Redis or in-memory) for heavy aggregations (60–300s) to keep response latency low in staging/production.
4. Add role-based access to the Analytics page (admin-only) and a feature flag for rollout.
5. If performance becomes a concern, add a nightly aggregation job that writes summary rows to a `daily_goal_stats` table and have endpoints read that table.

## Where to look in the codebase

- Backend analytics code: `backend/services/analytics.js` and `backend/routes/analytics.js`
- Frontend analytics view: `frontend/src/views/AnalyticsView.vue` (and chart components)
- DB scripts and seeds: `_db/` (seed files and index SQL)
- CI deploy workflow: `.github/workflows/deploy.yml`

---

## Troubleshooting (short)

- If the deployment shows as idle: inspect the Actions create-deployment step logs and check repository environment protections (approvals) in Settings → Environments.
- If builds fail during CI: view the Actions log for the failing step; common causes are missing secrets or node module audit/fetch warnings (update packages as needed).
