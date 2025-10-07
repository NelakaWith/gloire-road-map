/**
 * @fileoverview Points system routes
 * @description Handles points-related API endpoints including leaderboards and point tracking
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import express from "express";
import { getPointsLeaderboard } from "../services/points.js";
import { authenticateJWT } from "../middleware/auth.js";
const router = express.Router();

/**
 * Get points leaderboard
 * @route GET /api/points/leaderboard
 * @description Retrieves the points leaderboard showing student rankings by total points
 * @access Private (requires JWT authentication)
 * @returns {Array<Object>} Array of students with point statistics
 * @returns {number} returns[].student_id - Student identifier
 * @returns {string} returns[].student_name - Student name
 * @returns {number} returns[].completed_points - Points from completed goals
 * @returns {number} returns[].on_time_bonus - Bonus points for on-time completion
 * @returns {number} returns[].total_points - Combined total points
 * @throws {500} Internal server error if leaderboard calculation fails
 */
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
