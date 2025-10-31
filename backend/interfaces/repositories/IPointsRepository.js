/**
 * @fileoverview Points Repository Interface
 * @description Defines the contract for points and points log data access operations.
 * This interface abstracts points-related database operations from business logic.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

/**
 * Interface for Points repository operations
 * @interface IPointsRepository
 * @description Provides a contract for all points-related data access operations.
 * Implementations should handle all database interactions for points logs and calculations.
 */
export class IPointsRepository {
  /**
   * Create a new points log entry
   * @async
   * @param {Object} pointsData - Points log data to create
   * @param {number} pointsData.student_id - Student ID
   * @param {number} pointsData.points - Points awarded (positive) or deducted (negative)
   * @param {string} [pointsData.reason] - Reason for the point change
   * @param {number} [pointsData.related_goal_id] - Associated goal ID if point change is goal-related
   * @returns {Promise<Object>} Created points log entry
   * @throws {Error} If points log creation fails
   */
  async createPointsLog(pointsData) {
    throw new Error("IPointsRepository.createPointsLog() must be implemented");
  }

  /**
   * Get points log for a specific student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @param {Date} [options.startDate] - Start date filter
   * @param {Date} [options.endDate] - End date filter
   * @param {number} [options.limit] - Maximum results to return
   * @param {number} [options.offset] - Results offset for pagination
   * @param {string} [options.orderBy='created_at'] - Order by field
   * @param {string} [options.orderDirection='DESC'] - Order direction
   * @returns {Promise<Array<Object>>} Array of points log entries
   * @throws {Error} If database query fails
   */
  async findPointsLogByStudent(studentId, options = {}) {
    throw new Error(
      "IPointsRepository.findPointsLogByStudent() must be implemented"
    );
  }

  /**
   * Get points log for a specific goal
   * @async
   * @param {number} goalId - Goal ID
   * @returns {Promise<Array<Object>>} Array of points log entries related to the goal
   * @throws {Error} If database query fails
   */
  async findPointsLogByGoal(goalId) {
    throw new Error(
      "IPointsRepository.findPointsLogByGoal() must be implemented"
    );
  }

  /**
   * Calculate total points for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Calculation options
   * @param {Date} [options.startDate] - Start date filter for points calculation
   * @param {Date} [options.endDate] - End date filter for points calculation
   * @returns {Promise<number>} Total points earned by the student
   * @throws {Error} If calculation fails
   */
  async calculateTotalPoints(studentId, options = {}) {
    throw new Error(
      "IPointsRepository.calculateTotalPoints() must be implemented"
    );
  }

  /**
   * Get leaderboard with points calculations
   * @async
   * @param {Object} [options] - Query options
   * @param {number} [options.limit=10] - Maximum results to return
   * @param {Date} [options.startDate] - Start date for point calculations
   * @param {Date} [options.endDate] - End date for point calculations
   * @returns {Promise<Array<Object>>} Students ordered by total points
   * @returns {number} returns[].student_id - Student identifier
   * @returns {string} returns[].student_name - Student full name
   * @returns {number} returns[].completed_points - Base points from completed goals
   * @returns {number} returns[].on_time_bonus - Bonus points for on-time completion
   * @returns {number} returns[].total_points - Sum of completed_points and on_time_bonus
   * @throws {Error} If leaderboard calculation fails
   */
  async getLeaderboard(options = {}) {
    throw new Error("IPointsRepository.getLeaderboard() must be implemented");
  }

  /**
   * Update student's total points in the student record
   * @async
   * @param {number} studentId - Student ID
   * @param {number} newTotalPoints - New total points value
   * @returns {Promise<boolean>} True if update was successful
   * @throws {Error} If update operation fails
   */
  async updateStudentPoints(studentId, newTotalPoints) {
    throw new Error(
      "IPointsRepository.updateStudentPoints() must be implemented"
    );
  }

  /**
   * Award points to a student and create log entry
   * @async
   * @param {number} studentId - Student ID
   * @param {number} points - Points to award (positive value)
   * @param {string} reason - Reason for awarding points
   * @param {number} [relatedGoalId] - Related goal ID if applicable
   * @returns {Promise<Object>} Results of the operation
   * @returns {Object} returns.pointsLog - Created points log entry
   * @returns {number} returns.newTotalPoints - Student's updated total points
   * @throws {Error} If award operation fails
   */
  async awardPoints(studentId, points, reason, relatedGoalId = null) {
    throw new Error("IPointsRepository.awardPoints() must be implemented");
  }

  /**
   * Deduct points from a student and create log entry
   * @async
   * @param {number} studentId - Student ID
   * @param {number} points - Points to deduct (positive value, will be stored as negative)
   * @param {string} reason - Reason for deducting points
   * @param {number} [relatedGoalId] - Related goal ID if applicable
   * @returns {Promise<Object>} Results of the operation
   * @returns {Object} returns.pointsLog - Created points log entry
   * @returns {number} returns.newTotalPoints - Student's updated total points
   * @throws {Error} If deduction operation fails
   */
  async deductPoints(studentId, points, reason, relatedGoalId = null) {
    throw new Error("IPointsRepository.deductPoints() must be implemented");
  }

  /**
   * Get points summary for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @param {Date} [options.startDate] - Start date filter
   * @param {Date} [options.endDate] - End date filter
   * @returns {Promise<Object>} Points summary
   * @returns {number} returns.total_points - Total points earned
   * @returns {number} returns.points_awarded - Total positive points
   * @returns {number} returns.points_deducted - Total negative points (absolute value)
   * @returns {number} returns.goal_completion_points - Points from goal completions
   * @returns {number} returns.bonus_points - Bonus points (on-time, etc.)
   * @returns {number} returns.total_entries - Total log entries
   * @throws {Error} If summary calculation fails
   */
  async getPointsSummary(studentId, options = {}) {
    throw new Error("IPointsRepository.getPointsSummary() must be implemented");
  }

  /**
   * Get points analytics data
   * @async
   * @param {Object} [options] - Query options
   * @param {Date} [options.startDate] - Start date filter
   * @param {Date} [options.endDate] - End date filter
   * @param {string} [options.groupBy] - Group by period ('day', 'week', 'month')
   * @returns {Promise<Array<Object>>} Points analytics data
   * @throws {Error} If analytics query fails
   */
  async getAnalyticsData(options = {}) {
    throw new Error("IPointsRepository.getAnalyticsData() must be implemented");
  }

  /**
   * Calculate points for goal completion based on configuration
   * @async
   * @param {Object} goal - Goal object
   * @param {boolean} goal.is_completed - Completion status
   * @param {Date} [goal.completed_at] - Completion timestamp
   * @param {Date} [goal.target_date] - Target completion date
   * @returns {Promise<Object>} Points calculation result
   * @returns {number} returns.base_points - Base points for completion
   * @returns {number} returns.bonus_points - Bonus points for on-time completion
   * @returns {number} returns.total_points - Total points to award
   * @returns {boolean} returns.is_on_time - Whether completion was on time
   * @throws {Error} If calculation fails
   */
  async calculateGoalPoints(goal) {
    throw new Error(
      "IPointsRepository.calculateGoalPoints() must be implemented"
    );
  }

  /**
   * Reverse points for a specific goal (when goal is reopened)
   * @async
   * @param {number} goalId - Goal ID
   * @param {string} reason - Reason for point reversal
   * @returns {Promise<Object>} Reversal operation result
   * @returns {Array<Object>} returns.reversedEntries - Points log entries that were reversed
   * @returns {number} returns.totalReversed - Total points reversed
   * @throws {Error} If reversal operation fails
   */
  async reverseGoalPoints(goalId, reason) {
    throw new Error(
      "IPointsRepository.reverseGoalPoints() must be implemented"
    );
  }

  /**
   * Get top performers for a specific time period
   * @async
   * @param {Object} [options] - Query options
   * @param {Date} [options.startDate] - Start date filter
   * @param {Date} [options.endDate] - End date filter
   * @param {number} [options.limit=5] - Maximum results
   * @returns {Promise<Array<Object>>} Top performing students
   * @throws {Error} If query fails
   */
  async getTopPerformers(options = {}) {
    throw new Error("IPointsRepository.getTopPerformers() must be implemented");
  }
}
