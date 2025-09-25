import express from "express";
import {
  getOverview,
  getCompletions,
  getThroughput,
  getBacklog,
  getOverdue,
  getTimeToComplete,
  getByStudent,
} from "../services/analytics.js";

const router = express.Router();

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

// GET /api/analytics/overview
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
    const data = await getOverview({ start_date: start, end_date: end });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/analytics/completions?group_by=day|week|month&start_date=&end_date=
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
    const rows = await getCompletions({
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

// GET /api/analytics/by-student?start_date=&end_date=&limit=&offset=
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

    const rows = await getByStudent({
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

// GET /api/analytics/throughput?group_by=day|week|month&start_date=&end_date=
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

    const rows = await getThroughput({
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

// GET /api/analytics/backlog?as_of=YYYY-MM-DD&top_n=10
router.get("/backlog", async (req, res) => {
  try {
    const as_of = parseDateSafe(req.query.as_of) || null;
    let top_n = Number(req.query.top_n ?? 10);
    if (Number.isNaN(top_n) || top_n < 1) top_n = 10;
    if (top_n > 100) top_n = 100;

    const data = await getBacklog({ as_of, top_n });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/analytics/overdue?start_date=&end_date=&as_of=
router.get("/overdue", async (req, res) => {
  try {
    let start = parseDateSafe(req.query.start_date);
    let end = parseDateSafe(req.query.end_date);
    // as_of uses parseDateSafe semantics but can be omitted
    const as_of = parseDateSafe(req.query.as_of) || null;
    const data = await getOverdue({ start_date: start, end_date: end, as_of });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/analytics/time-to-complete?start_date=&end_date=&buckets=
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
    const result = await getTimeToComplete({
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
