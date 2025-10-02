# Analytics Endpoints Guide

This document describes each analytics endpoint in the Gloire Road Map backend API. Each endpoint provides insights into goal tracking data, such as completion rates, throughput, backlog, and performance metrics. All endpoints require authentication and return JSON responses.

## Base URL

All endpoints are prefixed with `/api/analytics/`.

## Common Parameters

- `start_date` (optional): ISO date string (YYYY-MM-DD). Defaults to 90 days ago if omitted.
- `end_date` (optional): ISO date string (YYYY-MM-DD). Defaults to today if omitted.
- `as_of` (optional): ISO date string for point-in-time queries. Defaults to today if omitted.
- `group_by` (optional): Grouping period for time-series data. Allowed: `day`, `week`, `month`. Defaults to `week` or `month` depending on endpoint.
- `limit` (optional): Maximum number of results. Defaults to 50, max 1000.
- `offset` (optional): Pagination offset. Defaults to 0.
- `top_n` (optional): Number of top items to return. Defaults to 10, max 100.

## Endpoints

### 1. GET /api/analytics/overview

**Description**: Provides high-level KPIs for goals within a date range, including totals, completion rates, and average time to complete.

**Parameters**:

- `start_date`, `end_date` (optional)

**Response**:

```json
{
  "total_goals": 150,
  "completed_goals": 120,
  "pct_complete": 80.0,
  "avg_days_to_complete": 14.5
}
```

**Use Cases**:

- Dashboard summary cards showing overall progress.
- Quick health check of goal completion across the system.
- Compare periods to track improvement in completion rates.

### 2. GET /api/analytics/completions

**Description**: Returns a time-series of goal completions grouped by period (day/week/month).

**Parameters**:

- `start_date`, `end_date` (optional)
- `group_by` (optional, default: "week")

**Response**:

```json
[
  {
    "label": "2025-09-01",
    "completions": 25
  },
  {
    "label": "2025-09-08",
    "completions": 30
  }
]
```

**Use Cases**:

- Visualize completion trends over time.
- Identify peak completion periods or slowdowns.
- Track weekly/monthly productivity.

### 3. GET /api/analytics/by-student

**Description**: Lists students with their completion counts and average days to complete within a date range, sorted by completions descending.

**Parameters**:

- `start_date`, `end_date` (optional)
- `limit`, `offset` (optional)

**Response**:

```json
[
  {
    "student_id": 1,
    "student_name": "Alice Johnson",
    "completions": 15,
    "avg_days": 12.3
  },
  {
    "student_id": 2,
    "student_name": "Bob Smith",
    "completions": 10,
    "avg_days": 18.7
  }
]
```

**Use Cases**:

- Identify top-performing students for recognition.
- Spot students needing extra support (low completions or high avg days).
- Paginated leaderboard for large cohorts.

### 4. GET /api/analytics/throughput

**Description**: Time-series of goals created vs completed, with completion rates, grouped by period. Includes zero-filled buckets for continuous data.

**Parameters**:

- `start_date`, `end_date` (optional)
- `group_by` (optional, default: "month")

**Response**:

```json
[
  {
    "label": "2025-09",
    "start": "2025-09-01",
    "end": "2025-09-30",
    "created": 50,
    "completed": 40,
    "completion_rate": 80.0
  },
  {
    "label": "2025-10",
    "start": "2025-10-01",
    "end": "2025-10-31",
    "created": 60,
    "completed": 45,
    "completion_rate": 75.0
  }
]
```

**Use Cases**:

- Monitor creation vs completion trends to detect backlog buildup.
- Measure conversion rates (created to completed).
- Analyze monthly throughput for capacity planning.

### 5. GET /api/analytics/backlog

**Description**: Current backlog status as of a specific date, including totals, age buckets, and top students by open goals.

**Parameters**:

- `as_of` (optional, default: today)
- `top_n` (optional, default: 10)

**Response**:

```json
{
  "as_of": "2025-09-27",
  "total_open": 30,
  "overdue": 5,
  "avg_days_open": 25.4,
  "open_by_age": {
    "0-7": 10,
    "8-30": 12,
    "31-90": 6,
    "90+": 2
  },
  "top_students": [
    {
      "student_id": 1,
      "student_name": "Alice Johnson",
      "open_goals": 8
    }
  ]
}
```

**Use Cases**:

- Assess current workload and prioritize interventions.
- Identify students with the most open goals for targeted support.
- Track backlog growth over time by querying different `as_of` dates.

### 6. GET /api/analytics/overdue

**Description**: Metrics on overdue goals, including counts and on-time completion rates within a date range.

**Parameters**:

- `start_date`, `end_date` (optional)
- `as_of` (optional, default: today)

**Response**:

```json
{
  "as_of": "2025-09-27",
  "open_overdue": 5,
  "completed_count": 120,
  "completed_on_time": 100,
  "on_time_rate": 83.3
}
```

**Use Cases**:

- Measure SLA compliance (on-time completion rate).
- Identify overdue goals for escalation.
- Track improvement in timeliness over periods.

### 7. GET /api/analytics/time-to-complete

**Description**: Distribution of time-to-complete for completed goals, including mean, median, p90, and a histogram.

**Parameters**:

- `start_date`, `end_date` (optional)

**Response**:

```json
{
  "mean": 14.5,
  "median": 12.0,
  "p90": 28.0,
  "histogram": [
    { "bucket": "0-7", "count": 50 },
    { "bucket": "8-14", "count": 40 },
    { "bucket": "15-30", "count": 20 },
    { "bucket": "31+", "count": 10 }
  ]
}
```

**Use Cases**:

- Understand central tendency and outliers in completion times.
- Set realistic SLAs based on p90.
- Identify goals that take unusually long for process improvements.

## Error Handling

All endpoints return standard HTTP status codes:

- 200: Success
- 400: Invalid parameters (e.g., start_date > end_date)
- 500: Internal server error

## Authentication

All endpoints require a valid JWT token in the Authorization header.

## Performance Notes

- Queries are optimized for typical ranges (up to 1 year).
- For large datasets, consider adding caching or aggregation tables.
- Endpoints validate and default dates to prevent excessive data retrieval.
