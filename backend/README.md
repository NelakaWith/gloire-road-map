# Gloire Road Map — Backend

This folder contains the Express.js API for Gloire Road Map. It implements auth, students, goals, and the Analytics endpoints used by the frontend.

## Quick start (development)

1. Copy `.env.example` to `.env` and set your MySQL credentials and JWT secret.
2. Install dependencies:

```powershell
cd backend
npm install
```

3. Start the dev server (with nodemon/watch in most setups):

```powershell
npm run dev
```

The API will be available on the port configured in `.env` (default: 3000).

## Environment variables

- `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME` — MySQL connection
- `PORT` — server port
- `JWT_SECRET` — secret for JWT tokens
- `NODE_ENV` — `development` or `production`

## Analytics endpoints (important)

The analytics module provides the following endpoints (used by the frontend Analytics page):

- GET `/api/analytics/throughput` — params: `start_date?`, `end_date?`, `group_by=day|week|month`
- GET `/api/analytics/backlog` — params: `as_of?`, `top_n?`
- GET `/api/analytics/overdue` — params: `start_date?`, `end_date?`, `as_of?`
- GET `/api/analytics/time-to-complete` — params: `start_date?`, `end_date?`, `buckets?`

Each endpoint validates dates and defaults to the last 90 days if dates are absent.

## Tests

Unit tests for analytics live in the `test/` folder (Vitest). Run tests with:

```powershell
cd backend
npm test
```

Integration tests are not yet included; see `Next steps` below.

## Deploy notes

- The CI deploy workflow in `.github/workflows/deploy.yml` copies the repository to the droplet and runs commands to install dependencies and restart processes (pm2). Keep the droplet SSH key in `DROPLET_SSH_KEY` secret.
- If your deploy environment uses GitHub Environments with required reviewers, manual approval may be required to release deployments.

## Next steps (backend)

- Add integration tests (supertest) that run against a seeded test DB.
- Add short TTL caching (Redis) for heavy analytics queries.
- Add a non-destructive migration to create recommended indexes on `goals` if desired.
