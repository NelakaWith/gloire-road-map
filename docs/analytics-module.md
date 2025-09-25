# Analytics Dashboard — Implementation Checklist

This checklist captures the work required to deliver an MVP Analytics Dashboard (backend + DB + frontend + tests). Use it as a living plan: check items as they are completed, add owners and dates as needed.

## Goal

Deliver an admin-facing Analytics dashboard showing KPIs and time-series of goal completions with filters by date and student.

## Acceptance criteria

- [ ] Dashboard page accessible to authorized users only
- [ ] Overview KPIs: total goals, completed goals, completion rate, average days-to-complete
- [ ] Time-series chart (day/week/month) for completions within selected range
- [ ] Top N students by completions (bar chart or table)
- [ ] API endpoints return JSON matching contract below and are covered by unit tests
- [ ] Queries perform under acceptable latency on staging (<= 500ms for typical ranges)

## Prioritized analytics (recommended implementation order)

The following list prioritizes metrics to implement first for the MVP dashboard. Each item includes a one-line rationale and a suggested endpoint/query target to implement quickly.

1. Goals created vs goals completed per period (conversion rate) - DONE

- Rationale: Gives immediate insight into throughput and backlog trends.
- Suggested endpoint: GET /api/analytics/throughput?group_by=day|week|month

2. Completion rate per period + rolling averages - DONE

- Rationale: Shows trend direction and smooths volatility for product decisions.
- Suggested: extend `/api/analytics/throughput` to include completion_rate and optional rolling window parameter.

3. Time-to-complete distribution (mean, median, p90, histogram) - DONE

- Rationale: Reveals central tendency and tail behavior; useful for SLAs and planning.
- Suggested endpoint: GET /api/analytics/time-to-complete

4. Backlog and age-of-open-goals (0-7, 8-30, 31-90, 90+ days) - DONE

- Rationale: Helps prioritize stale or at-risk goals for intervention.
- Suggested endpoint: GET /api/analytics/backlog

5. Overdue goals and on-time completion rate - DONE

- Rationale: Measures effectiveness against deadlines and highlights problems.
- Suggested endpoint: GET /api/analytics/overdue

6. Active students / Monthly Active Students (MAS)

- Rationale: Engagement metric to track whether students are using the system.
- Suggested endpoint: GET /api/analytics/active-students?group_by=month

7. Top students (by completions, by avg time-to-complete, completion rate)

- Rationale: Identifies high performers and those needing help; useful for recognition.
- Suggested endpoint: extend existing `/api/analytics/by-student` with sort options.

8. Cohort retention (students created in month X -> % completing by 30/60/90 days)

- Rationale: Measures onboarding and long-term engagement.
- Suggested endpoint: GET /api/analytics/cohort-retention?cohort_by=month&window=30

9. Goal throughput velocity (completions per week/month per student or cohort)

- Rationale: Useful for capacity planning and trend detection.
- Suggested endpoint: GET /api/analytics/velocity

10. Change over time for average goals per student

- Rationale: Tracks depth of usage per student; indicates product stickiness.
- Suggested endpoint: GET /api/analytics/avg-goals-per-student?group_by=month

Implementing items 1–4 gives the biggest immediate ROI for the dashboard MVP. Items 5–7 provide useful operational KPIs next, and items 8–10 are higher-effort but valuable for retention and capacity planning.

## Database / Migration

- [x] Ensure `goals.completed_at` exists and is nullable
- [x] Add indexes:
  - `idx_goals_created_at` on `(created_at)`
  - `idx_goals_completed_at` on `(completed_at)`
  - `idx_goals_completed_flag_date` on `(is_completed, completed_at)`
- [ ] (Optional) Create daily aggregated table `daily_goal_stats(date, completions, avg_days_to_complete)` if scale requires
- SQL snippets to run (safe, non-destructive checks):
  - Check column:
    ```sql
    SELECT COUNT(*) FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'goals' AND COLUMN_NAME = 'completed_at';
    ```
  - Create index if missing (example):
    ```sql
    CREATE INDEX IF NOT EXISTS idx_goals_completed_at ON goals(completed_at);
    ```

## Backend — API endpoints

- [x] Implement endpoints (protected by existing auth middleware):
- GET `/api/analytics/overview`
  - params: `start_date?`, `end_date?`
  - response: `{ total_goals, completed_goals, pct_complete, avg_days_to_complete }`
- GET `/api/analytics/completions`
  - params: `start_date?`, `end_date?`, `group_by=day|week|month` (default `week`)
  - response: `[{ label, completions }]`
- GET `/api/analytics/by-student`
  - params: `start_date?`, `end_date?`, `limit?`, `offset?`
  - response: `[{ student_id, student_name, completions, avg_days }]`
- [x] Add parameter validation and sane defaults (last 90 days if no dates)

  > Note: server now parses and validates date inputs, defaults start/end to the last 90 days when missing or invalid, validates `group_by` (day|week|month), and clamps `limit`/`offset` for `/by-student`. Route-level unit tests were added to cover these behaviors.

- [ ] Add short TTL caching for heavy aggregations (e.g., 60–300s) using Redis or in-memory cache

## Backend — queries & implementation notes

- Use parameterized `sequelize.query` or query builder. Avoid non-portable SQL constructs.
- Example SQL (overview):
  ```sql
  SELECT
    (SELECT COUNT(*) FROM goals) AS total_goals,
    (SELECT COUNT(*) FROM goals WHERE is_completed = 1) AS completed_goals,
    (SELECT ROUND(AVG(TIMESTAMPDIFF(SECOND, created_at, completed_at))/86400,2) FROM goals WHERE completed_at IS NOT NULL AND created_at IS NOT NULL) AS avg_days_to_complete
  ```
- Example SQL (completions by week):
  ```sql
  SELECT DATE_FORMAT(completed_at, '%Y-%u') AS label, COUNT(*) AS completions
  FROM goals
  WHERE completed_at BETWEEN :start AND :end
  GROUP BY label
  ORDER BY label;
  ```

## Frontend — UI components

- [x] `AnalyticsView.vue` — main page with filter bar and charts
- [x] `KPICards.vue` — shows numeric KPIs
- [x] `TimeSeriesChart.vue` — line/area chart (ApexCharts or Chart.js)
- [x] `StudentBarChart.vue` — top students bar chart
- [x] `FiltersPanel.vue` — date range picker, student selector, group_by
- UX defaults: show last 90 days on first load; allow quick presets (30/90/365)

## Tests & QA

- [x] Unit tests (backend service functions + SQL) — Vitest/Jest
  - happy path + edge cases (no completions, null dates)
- [ ] Integration tests for endpoints (supertest against test DB or in-memory sqlite)
- [ ] Frontend unit tests: components and basic data-transform logic
- [ ] Manual QA checklist
  - [ ] Filter interactions update charts
  - [ ] Timezone sanity checks (display vs. server time)
  - [ ] Performance on staging (measure query durations)

## Monitoring & Ops

- [ ] Add query logging / slow query alerting on staging
- [ ] Instrument endpoints with simple metrics (response time, hit count)
- [ ] If queries become slow, implement a nightly aggregation job to populate a summary table and change endpoints to read the summary

## Rollout plan

1. Implement DB migration and run on staging
2. [x] Implement backend endpoints and unit tests
3. [x] Implement frontend MVP and run manual QA on staging
4. Measure performance; add aggregation/caching if needed
5. Release to production behind feature flag (or admin-only route)

## Example acceptance test cases

- [ ] When there are 0 goals, `overview` returns total_goals=0, completed_goals=0
- [ ] When completed goals exist, `avg_days_to_complete` is numeric and > 0
- [ ] Time-series endpoint returns empty array for date ranges with no completions

## Estimates

- DB migration + indexes: 0.5–1 day
- Backend endpoints + tests: 1–2 days
- Frontend MVP with charts: 1–2 days
- QA + polish: 0.5–1 day

## Owners / Notes

- Backend owner: @backend-dev (replace with actual)
- Frontend owner: @frontend-dev
- Priority: MVP — focus on overview + weekly time-series + top students

---

If you want, I can: add the non-destructive migration file to `db/`, scaffold the `AnalyticsView.vue` in the frontend, or implement `/api/analytics/by-student` next. Which should I do next?
