/**
 * @fileoverview Analytics routes
 * @description Handles all analytics-related API endpoints including overview statistics,
 * completion trends, throughput analysis, and performance metrics
 * @author @NelakaWith
 * @version 1.0.0
 */

import express from "express";
import DIContainer from "../di-container.js";

const router = express.Router();

// Get service instance from DI container
const analyticsService = DIContainer.getService("analytics");

// Helper: parse and validate date strings. Returns ISO date string (YYYY-MM-DD) or null
function parseDateSafe(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  // return date-only ISO (keep time off)
  return d.toISOString().slice(0, 10);
}

function defaultRangeLastNDays(n = 90) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - n);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

/**
 * Get analytics overview
 * @route GET /api/analytics/overview
 * @description Retrieves comprehensive analytics overview including key metrics and statistics
 * @access Private (requires JWT authentication)
 * @param {string} [req.query.start_date] - Start date in YYYY-MM-DD format (defaults to 90 days ago)
 * @param {string} [req.query.end_date] - End date in YYYY-MM-DD format (defaults to today)
 * @returns {Object} Analytics overview data with key performance indicators
 * @throws {400} Bad request if start_date > end_date
 * @throws {500} Internal server error if database query fails
 */
router.get("/overview", async (req, res) => {
  try {
    let start = parseDateSafe(req.query.start_date);
    let end = parseDateSafe(req.query.end_date);
    if (!start || !end) {
      const def = defaultRangeLastNDays(90);
      if (!start) start = def.start;
      if (!end) end = def.end;
    }
    // ensure start <= end
    if (new Date(start) > new Date(end)) {
      return res
        .status(400)
        .json({ message: "start_date must be <= end_date" });
    }
    const data = await analyticsService.getOverview({
      start_date: start,
      end_date: end,
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get goal completions analytics
 * @route GET /api/analytics/completions
 * @description Retrieves goal completion statistics grouped by time periods
 * @access Private (requires JWT authentication)
 * @param {string} [req.query.start_date] - Start date in YYYY-MM-DD format (defaults to 90 days ago)
 * @param {string} [req.query.end_date] - End date in YYYY-MM-DD format (defaults to today)
 * @param {string} [req.query.group_by] - Grouping period: day|week|month (defaults to week)
 * @returns {Array<Object>} Array of completion statistics grouped by time period
 * @throws {400} Bad request if start_date > end_date or invalid group_by value
 * @throws {500} Internal server error if database query fails
 */
router.get("/completions", async (req, res) => {
  try {
    let start = parseDateSafe(req.query.start_date);
    let end = parseDateSafe(req.query.end_date);
    if (!start || !end) {
      const def = defaultRangeLastNDays(90);
      if (!start) start = def.start;
      if (!end) end = def.end;
    }
    if (new Date(start) > new Date(end)) {
      return res
        .status(400)
        .json({ message: "start_date must be <= end_date" });
    }
    const allowed = new Set(["day", "week", "month"]);
    const group_by =
      req.query.group_by && allowed.has(req.query.group_by)
        ? req.query.group_by
        : "week";
    const rows = await analyticsService.getCompletions({
      start_date: start,
      end_date: end,
      group_by,
    });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get analytics by student
 * @route GET /api/analytics/by-student
 * @description Retrieves analytics data aggregated by individual students
 * @access Private (requires JWT authentication)
 * @param {string} [req.query.start_date] - Start date in YYYY-MM-DD format (defaults to 90 days ago)
 * @param {string} [req.query.end_date] - End date in YYYY-MM-DD format (defaults to today)
 * @param {number} [req.query.limit] - Maximum number of results to return (defaults to 50, max 1000)
 * @param {number} [req.query.offset] - Number of results to skip for pagination (defaults to 0)
 * @returns {Array<Object>} Array of student analytics data with pagination
 * @throws {400} Bad request if start_date > end_date or invalid pagination parameters
 * @throws {500} Internal server error if database query fails
 */
router.get("/by-student", async (req, res) => {
  try {
    let start = parseDateSafe(req.query.start_date);
    let end = parseDateSafe(req.query.end_date);
    if (!start || !end) {
      const def = defaultRangeLastNDays(90);
      if (!start) start = def.start;
      if (!end) end = def.end;
    }
    if (new Date(start) > new Date(end)) {
      return res
        .status(400)
        .json({ message: "start_date must be <= end_date" });
    }
    const maxLimit = 1000;
    let limit = Number(req.query.limit ?? 50);
    let offset = Number(req.query.offset ?? 0);
    if (Number.isNaN(limit) || limit < 1) limit = 50;
    if (Number.isNaN(offset) || offset < 0) offset = 0;
    if (limit > maxLimit) limit = maxLimit;

    const rows = await analyticsService.getByStudent({
      start_date: start,
      end_date: end,
      limit,
      offset,
    });
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get throughput analytics
 * @route GET /api/analytics/throughput
 * @description Retrieves goal creation throughput statistics over time periods
 * @access Private (requires JWT authentication)
 * @param {string} [req.query.start_date] - Start date in YYYY-MM-DD format (defaults to 90 days ago)
 * @param {string} [req.query.end_date] - End date in YYYY-MM-DD format (defaults to today)
 * @param {string} [req.query.group_by] - Grouping period: day|week|month (defaults to month)
 * @returns {Array<Object>} Array of throughput statistics grouped by time period
 * @throws {400} Bad request if start_date > end_date or invalid group_by value
 * @throws {500} Internal server error if database query fails
 */
router.get("/throughput", async (req, res) => {
  try {
    let start = parseDateSafe(req.query.start_date);
    let end = parseDateSafe(req.query.end_date);
    if (!start || !end) {
      const def = defaultRangeLastNDays(90);
      if (!start) start = def.start;
      if (!end) end = def.end;
    }
    if (new Date(start) > new Date(end)) {
      return res
        .status(400)
        .json({ message: "start_date must be <= end_date" });
    }
    const allowed = new Set(["day", "week", "month"]);
    const group_by =
      req.query.group_by && allowed.has(req.query.group_by)
        ? req.query.group_by
        : "month";

    const rows = await analyticsService.getThroughput({
      start_date: start,
      end_date: end,
      group_by,
    });
    // Zero-fill missing buckets: the service returns all labels present in data; caller may want continuous buckets.
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get backlog analytics
 * @route GET /api/analytics/backlog
 * @description Retrieves current goal backlog statistics and top overdue items
 * @access Private (requires JWT authentication)
 * @param {string} [req.query.as_of] - Date to calculate backlog as of (YYYY-MM-DD, defaults to today)
 * @param {number} [req.query.top_n] - Number of top backlog items to return (defaults to 10, max 100)
 * @returns {Object} Backlog analytics data including overdue goals and statistics
 * @throws {500} Internal server error if database query fails
 */
router.get("/backlog", async (req, res) => {
  try {
    const as_of = parseDateSafe(req.query.as_of) || null;
    let top_n = Number(req.query.top_n ?? 10);
    if (Number.isNaN(top_n) || top_n < 1) top_n = 10;
    if (top_n > 100) top_n = 100;

    const data = await analyticsService.getBacklog({ as_of, top_n });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get overdue goals analytics
 * @route GET /api/analytics/overdue
 * @description Retrieves statistics about overdue goals and completion delays
 * @access Private (requires JWT authentication)
 * @param {string} [req.query.start_date] - Start date in YYYY-MM-DD format
 * @param {string} [req.query.end_date] - End date in YYYY-MM-DD format
 * @param {string} [req.query.as_of] - Date to calculate overdue status as of (YYYY-MM-DD)
 * @returns {Object} Overdue goals analytics and statistics
 * @throws {500} Internal server error if database query fails
 */
router.get("/overdue", async (req, res) => {
  try {
    let start = parseDateSafe(req.query.start_date);
    let end = parseDateSafe(req.query.end_date);
    // as_of uses parseDateSafe semantics but can be omitted
    const as_of = parseDateSafe(req.query.as_of) || null;
    const data = await analyticsService.getOverdue({
      start_date: start,
      end_date: end,
      as_of,
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Get time-to-complete analytics
 * @route GET /api/analytics/time-to-complete
 * @description Retrieves statistics about goal completion times and duration analysis
 * @access Private (requires JWT authentication)
 * @param {string} [req.query.start_date] - Start date in YYYY-MM-DD format (defaults to 90 days ago)
 * @param {string} [req.query.end_date] - End date in YYYY-MM-DD format (defaults to today)
 * @returns {Object} Time-to-complete analytics with duration statistics and distributions
 * @throws {400} Bad request if start_date > end_date
 * @throws {500} Internal server error if database query fails
 */
router.get("/time-to-complete", async (req, res) => {
  try {
    let start = parseDateSafe(req.query.start_date);
    let end = parseDateSafe(req.query.end_date);
    if (!start || !end) {
      const def = defaultRangeLastNDays(90);
      if (!start) start = def.start;
      if (!end) end = def.end;
    }
    if (new Date(start) > new Date(end)) {
      return res
        .status(400)
        .json({ message: "start_date must be <= end_date" });
    }
    const result = await analyticsService.getTimeToComplete({
      start_date: start,
      end_date: end,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
