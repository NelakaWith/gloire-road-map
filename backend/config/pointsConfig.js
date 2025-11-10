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
 * @property {number} COMPLETE_GOAL - Points awarded for completing a goal (default: 2)
 * @property {number} COMPLETE_ON_TIME - Bonus points for completing a goal on or before target date (default: 3)
 * @property {number} REOPEN_GOAL - Points awarded/deducted when a goal is reopened (default: 0)
 * @property {number} REOPEN_ON_TIME - Points awarded/deducted when an on-time goal is reopened (default: 0)
 * @example
 * import { POINTS } from './config/pointsConfig.js';
 * const totalPoints = POINTS.COMPLETE_GOAL + POINTS.COMPLETE_ON_TIME; // 5 points for on-time completion
 */
export const POINTS = {
  COMPLETE_GOAL: 2,
  COMPLETE_ON_TIME: 3,
  REOPEN_GOAL: 0,
  REOPEN_ON_TIME: 0,
};
