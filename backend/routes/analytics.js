import express from "express";
import {
  getOverview,
  getCompletions,
  getByStudent,
} from "../services/analytics.js";

const router = express.Router();

// GET /api/analytics/overview
router.get("/overview", async (req, res) => {
  const { start_date, end_date } = req.query;
  const data = await getOverview({ start_date, end_date });
  res.json(data);
});

// GET /api/analytics/completions?group_by=day|week|month&start_date=&end_date=
router.get("/completions", async (req, res) => {
  const { start_date, end_date, group_by } = req.query;
  const rows = await getCompletions({ start_date, end_date, group_by });
  res.json(rows);
});

// GET /api/analytics/by-student?start_date=&end_date=&limit=&offset=
router.get("/by-student", async (req, res) => {
  const { start_date, end_date, limit = 50, offset = 0 } = req.query;
  const rows = await getByStudent({ start_date, end_date, limit, offset });
  res.json(rows);
});

export default router;
