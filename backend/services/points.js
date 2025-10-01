// services/points.js
// Calculate points for each student based on goal completions and on-time completions
const db = require("../models");

async function getPointsLeaderboard() {
  // Assumes goals table has: student_id, is_completed, completed_at, target_date
  const [results] = await db.sequelize.query(`
    SELECT g.student_id, s.name as student_name,
      SUM(2) AS completed_points,
      SUM(CASE WHEN g.completed_at IS NOT NULL AND g.completed_at <= g.target_date THEN 3 ELSE 0 END) AS on_time_bonus,
      SUM(2 + CASE WHEN g.completed_at IS NOT NULL AND g.completed_at <= g.target_date THEN 3 ELSE 0 END) AS total_points
    FROM goals g
    JOIN students s ON g.student_id = s.id
    WHERE g.is_completed = 1
    GROUP BY g.student_id, s.name
    ORDER BY total_points DESC, s.name ASC
  `);
  return results;
}

module.exports = { getPointsLeaderboard };
