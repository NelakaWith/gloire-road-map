/**
 * @fileoverview Goal Service Interface
 * @description Abstract interface defining business logic operations for goal management.
 * This interface provides a contract for goal-related business operations that go beyond
 * simple CRUD operations, including goal validation, completion tracking, and analytics.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

/**
 * Abstract Goal Service Interface
 * @abstract
 * @class IGoalService
 * @description Defines business logic operations for goal management
 */
export class IGoalService {
  /**
   * Create a new goal with validation
   * @abstract
   * @param {Object} goalData - Goal data to create
   * @param {number} goalData.student_id - Student ID
   * @param {string} goalData.title - Goal title
   * @param {string} [goalData.description] - Goal description
   * @param {Date} goalData.target_date - Target completion date
   * @param {string} [goalData.priority] - Goal priority (low, medium, high)
   * @returns {Promise<Object>} Created goal with validation results
   * @throws {Error} If goal creation fails or validation errors
   */
  async createGoal(goalData) {
    throw new Error("Method 'createGoal' must be implemented");
  }

  /**
   * Get goal by ID with related data
   * @abstract
   * @param {number} goalId - Goal ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object|null>} Goal with related data or null if not found
   * @throws {Error} If retrieval fails
   */
  async getGoalById(goalId, options = {}) {
    throw new Error("Method 'getGoalById' must be implemented");
  }

  /**
   * Get goals for a student with filtering and pagination
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Filter and pagination options
   * @returns {Promise<Object>} Goals with pagination metadata
   * @throws {Error} If retrieval fails
   */
  async getStudentGoals(studentId, options = {}) {
    throw new Error("Method 'getStudentGoals' must be implemented");
  }

  /**
   * Update goal with validation
   * @abstract
   * @param {number} goalId - Goal ID
   * @param {Object} updates - Fields to update
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<Object|null>} Updated goal or null if not found
   * @throws {Error} If update fails or validation errors
   */
  async updateGoal(goalId, updates, requestingUserId = null) {
    throw new Error("Method 'updateGoal' must be implemented");
  }

  /**
   * Mark goal as completed with points calculation
   * @abstract
   * @param {number} goalId - Goal ID
   * @param {number} [completedByUserId] - ID of user marking completion
   * @returns {Promise<Object>} Completion result with points awarded
   * @throws {Error} If completion fails
   */
  async completeGoal(goalId, completedByUserId = null) {
    throw new Error("Method 'completeGoal' must be implemented");
  }

  /**
   * Delete goal with validation
   * @abstract
   * @param {number} goalId - Goal ID
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<boolean>} True if deleted successfully
   * @throws {Error} If deletion fails or unauthorized
   */
  async deleteGoal(goalId, requestingUserId = null) {
    throw new Error("Method 'deleteGoal' must be implemented");
  }

  /**
   * Get goal completion analytics for a student
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Goal completion analytics
   * @throws {Error} If analytics generation fails
   */
  async getGoalAnalytics(studentId, dateRange = {}) {
    throw new Error("Method 'getGoalAnalytics' must be implemented");
  }

  /**
   * Get overdue goals for a student
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Array of overdue goals
   * @throws {Error} If retrieval fails
   */
  async getOverdueGoals(studentId, options = {}) {
    throw new Error("Method 'getOverdueGoals' must be implemented");
  }

  /**
   * Get upcoming goals (due soon) for a student
   * @abstract
   * @param {number} studentId - Student ID
   * @param {number} [daysAhead=7] - Number of days to look ahead
   * @returns {Promise<Array<Object>>} Array of upcoming goals
   * @throws {Error} If retrieval fails
   */
  async getUpcomingGoals(studentId, daysAhead = 7) {
    throw new Error("Method 'getUpcomingGoals' must be implemented");
  }

  /**
   * Validate goal data before creation or update
   * @abstract
   * @param {Object} goalData - Goal data to validate
   * @param {boolean} [isUpdate=false] - Whether this is an update operation
   * @returns {Promise<Object>} Validation result with errors if any
   * @throws {Error} If validation process fails
   */
  async validateGoalData(goalData, isUpdate = false) {
    throw new Error("Method 'validateGoalData' must be implemented");
  }

  /**
   * Calculate goal priority score based on various factors
   * @abstract
   * @param {Object} goal - Goal object
   * @returns {Promise<number>} Priority score
   * @throws {Error} If calculation fails
   */
  async calculateGoalPriorityScore(goal) {
    throw new Error("Method 'calculateGoalPriorityScore' must be implemented");
  }

  /**
   * Get goal progress summary for multiple students
   * @abstract
   * @param {Array<number>} [studentIds] - Student IDs (if empty, gets all students)
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Array<Object>>} Goal progress summary per student
   * @throws {Error} If summary generation fails
   */
  async getGoalProgressSummary(studentIds = [], dateRange = {}) {
    throw new Error("Method 'getGoalProgressSummary' must be implemented");
  }

  /**
   * Archive completed goals older than specified date
   * @abstract
   * @param {Date} cutoffDate - Date before which completed goals should be archived
   * @returns {Promise<Object>} Archive operation result
   * @throws {Error} If archiving fails
   */
  async archiveOldGoals(cutoffDate) {
    throw new Error("Method 'archiveOldGoals' must be implemented");
  }

  /**
   * Suggest goals based on student progress and patterns
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Suggestion options
   * @returns {Promise<Array<Object>>} Array of suggested goals
   * @throws {Error} If suggestion generation fails
   */
  async suggestGoals(studentId, options = {}) {
    throw new Error("Method 'suggestGoals' must be implemented");
  }
}
