// routes/points.js

import express from "express";
import { getPointsLeaderboard } from "../services/points.js";
import { authenticateJWT } from "../middleware/auth.js";
const router = express.Router();

// GET /api/points/leaderboard
router.get("/leaderboard", authenticateJWT, async (req, res) => {
  try {
    const leaderboard = await getPointsLeaderboard();
    res.json(leaderboard);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch leaderboard", details: err.message });
  }
});

export default router;
