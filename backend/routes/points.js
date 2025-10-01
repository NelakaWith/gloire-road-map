// routes/points.js
const express = require("express");
const router = express.Router();
const { getPointsLeaderboard } = require("../services/points");
const { authenticateJWT } = require("../middleware/auth");

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

module.exports = router;
