/**
 * @fileoverview Points calculation service
 * @description Business logic for calculating and retrieving student points and leaderboards
 * @author @NelakaWith
 * @version 1.0.0
 */

import { sequelize } from "../models.js";

/**
 * Calculate and retrieve points leaderboard
 * @async
 * @function getPointsLeaderboard
 * @description Calculates points for each student based on completed goals and on-time bonuses.
 * Points system: 2 points for completion + 3 bonus points for on-time completion
 * @returns {Promise<Array<Object>>} Promise resolving to leaderboard array
 * @returns {number} returns[].student_id - Student identifier
 * @returns {string} returns[].student_name - Student full name
 * @returns {number} returns[].completed_points - Base points from completed goals (2 per goal)
 * @returns {number} returns[].on_time_bonus - Bonus points for goals completed on or before target date (3 per goal)
 * @returns {number} returns[].total_points - Sum of completed_points and on_time_bonus
 * @throws {Error} Database query error if leaderboard calculation fails
 * @example
 * const leaderboard = await getPointsLeaderboard();
 * // Returns: [{ student_id: 1, student_name: "John Doe", completed_points: 10, on_time_bonus: 6, total_points: 16 }]
 */
export async function getPointsLeaderboard() {
  // Assumes goals table has: student_id, is_completed, completed_at, target_date
  const [results] = await sequelize.query(`
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
