/**
 * @fileoverview Points system configuration
 * @description Centralized configuration for point values used throughout the application
 * @author @NelakaWith
 * @version 1.0.0
 */

/**
 * Points configuration object
 * @namespace POINTS
 * @description Defines point values for different student actions and achievements
 * @property {number} ATTENDANCE_PRESENT - Points awarded for being present (default: 1)
 * @property {number} GOAL_COMPLETION_BASE - Base points awarded for completing a goal (default: 2)
 * @property {number} GOAL_COMPLETION_BONUS - Bonus points for completing a goal on or before target date (default: 1)
 * @property {number} REOPEN_GOAL - Points deducted when a goal is reopened (default: 0)
 * @property {number} REOPEN_ON_TIME - Points deducted when an on-time goal is reopened (default: 0)
 * @example
 * import { POINTS } from './config/pointsConfig.js';
 * For on-time goal completion:
 * const totalPoints = POINTS.GOAL_COMPLETION_BASE + POINTS.GOAL_COMPLETION_BONUS; // 3 points
 * For late goal completion:
 * const latePoints = POINTS.GOAL_COMPLETION_BASE; // 2 points
 * For attendance:
 * const attendancePoints = POINTS.ATTENDANCE_PRESENT; // 1 point
 */
export const POINTS = {
  // Attendance points
  ATTENDANCE_PRESENT: 1,

  // Goal completion points
  GOAL_COMPLETION_BASE: 2,
  GOAL_COMPLETION_BONUS: 1,

  // Goal reopening (future use)
  REOPEN_GOAL: 0,
  REOPEN_ON_TIME: 0,
};
