/**
 * @fileoverview Points Service Interface
 * @description Abstract interface defining business logic operations for points management.
 * This interface provides a contract for points-related business operations including
 * earning, redemption, validation, analytics, and gamification features.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

/**
 * Abstract Points Service Interface
 * @abstract
 * @class IPointsService
 * @description Defines business logic operations for points management
 */
export class IPointsService {
  /**
   * Award points to a student with validation
   * @abstract
   * @param {Object} pointsData - Points award data
   * @param {number} pointsData.student_id - Student ID
   * @param {number} pointsData.points - Number of points to award
   * @param {string} pointsData.type - Points type (earned, bonus)
   * @param {string} pointsData.description - Description of points award
   * @param {number} [pointsData.goal_id] - Related goal ID if applicable
   * @returns {Promise<Object>} Points award result with transaction details
   * @throws {Error} If points award fails or validation errors
   */
  async awardPoints(pointsData) {
    throw new Error("Method 'awardPoints' must be implemented");
  }

  /**
   * Redeem points for a student with validation
   * @abstract
   * @param {Object} redemptionData - Points redemption data
   * @param {number} redemptionData.student_id - Student ID
   * @param {number} redemptionData.points - Number of points to redeem
   * @param {string} redemptionData.description - Description of redemption
   * @returns {Promise<Object|null>} Redemption result or null if insufficient balance
   * @throws {Error} If redemption fails or validation errors
   */
  async redeemPoints(redemptionData) {
    throw new Error("Method 'redeemPoints' must be implemented");
  }

  /**
   * Get points transaction by ID
   * @abstract
   * @param {number} transactionId - Points transaction ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object|null>} Points transaction or null if not found
   * @throws {Error} If retrieval fails
   */
  async getTransactionById(transactionId, options = {}) {
    throw new Error("Method 'getTransactionById' must be implemented");
  }

  /**
   * Get points balance and history for a student
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object>} Points balance and transaction history
   * @throws {Error} If retrieval fails
   */
  async getStudentPointsBalance(studentId, options = {}) {
    throw new Error("Method 'getStudentPointsBalance' must be implemented");
  }

  /**
   * Get points transactions for a student with filtering
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Filter and pagination options
   * @returns {Promise<Object>} Points transactions with pagination metadata
   * @throws {Error} If retrieval fails
   */
  async getStudentTransactions(studentId, options = {}) {
    throw new Error("Method 'getStudentTransactions' must be implemented");
  }

  /**
   * Update points transaction with validation
   * @abstract
   * @param {number} transactionId - Transaction ID
   * @param {Object} updates - Fields to update
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<Object|null>} Updated transaction or null if not found
   * @throws {Error} If update fails or validation errors
   */
  async updateTransaction(transactionId, updates, requestingUserId = null) {
    throw new Error("Method 'updateTransaction' must be implemented");
  }

  /**
   * Delete points transaction with validation
   * @abstract
   * @param {number} transactionId - Transaction ID
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<boolean>} True if deleted successfully
   * @throws {Error} If deletion fails or unauthorized
   */
  async deleteTransaction(transactionId, requestingUserId = null) {
    throw new Error("Method 'deleteTransaction' must be implemented");
  }

  /**
   * Get points leaderboard with ranking
   * @abstract
   * @param {Object} [options] - Leaderboard options
   * @param {number} [options.limit=10] - Number of students to include
   * @param {Object} [options.dateRange] - Date range filter
   * @param {string} [options.metric='total_balance'] - Ranking metric
   * @returns {Promise<Array<Object>>} Students ranked by points
   * @throws {Error} If leaderboard generation fails
   */
  async getPointsLeaderboard(options = {}) {
    throw new Error("Method 'getPointsLeaderboard' must be implemented");
  }

  /**
   * Get points statistics and analytics
   * @abstract
   * @param {Object} [options] - Analytics options
   * @param {Array<number>} [options.studentIds] - Student IDs to analyze
   * @param {Object} [options.dateRange] - Date range filter
   * @returns {Promise<Object>} Points analytics and statistics
   * @throws {Error} If analytics generation fails
   */
  async getPointsAnalytics(options = {}) {
    throw new Error("Method 'getPointsAnalytics' must be implemented");
  }

  /**
   * Award points for goal completion automatically
   * @abstract
   * @param {number} goalId - Goal ID that was completed
   * @param {number} studentId - Student ID
   * @param {boolean} [onTime=false] - Whether goal was completed on time
   * @returns {Promise<Array<Object>>} Array of points transactions created
   * @throws {Error} If automatic award fails
   */
  async awardGoalCompletionPoints(goalId, studentId, onTime = false) {
    throw new Error("Method 'awardGoalCompletionPoints' must be implemented");
  }

  /**
   * Calculate potential points for a goal
   * @abstract
   * @param {Object} goal - Goal object
   * @param {boolean} [onTime=false] - Whether completion would be on time
   * @returns {Promise<Object>} Points breakdown (base points, bonus, total)
   * @throws {Error} If calculation fails
   */
  async calculateGoalPoints(goal, onTime = false) {
    throw new Error("Method 'calculateGoalPoints' must be implemented");
  }

  /**
   * Get points earning opportunities for a student
   * @abstract
   * @param {number} studentId - Student ID
   * @returns {Promise<Array<Object>>} Available earning opportunities
   * @throws {Error} If opportunity retrieval fails
   */
  async getEarningOpportunities(studentId) {
    throw new Error("Method 'getEarningOpportunities' must be implemented");
  }

  /**
   * Get points redemption options available
   * @abstract
   * @param {number} studentId - Student ID
   * @returns {Promise<Array<Object>>} Available redemption options
   * @throws {Error} If redemption options retrieval fails
   */
  async getRedemptionOptions(studentId) {
    throw new Error("Method 'getRedemptionOptions' must be implemented");
  }

  /**
   * Validate points transaction data
   * @abstract
   * @param {Object} transactionData - Transaction data to validate
   * @param {boolean} [isUpdate=false] - Whether this is an update operation
   * @returns {Promise<Object>} Validation result with errors if any
   * @throws {Error} If validation process fails
   */
  async validateTransactionData(transactionData, isUpdate = false) {
    throw new Error("Method 'validateTransactionData' must be implemented");
  }

  /**
   * Check if student has sufficient points for redemption
   * @abstract
   * @param {number} studentId - Student ID
   * @param {number} pointsRequired - Points required
   * @returns {Promise<boolean>} True if sufficient balance
   * @throws {Error} If balance check fails
   */
  async hasSufficientBalance(studentId, pointsRequired) {
    throw new Error("Method 'hasSufficientBalance' must be implemented");
  }

  /**
   * Get points trends over time
   * @abstract
   * @param {Object} [options] - Trend analysis options
   * @param {string} [options.groupBy='week'] - Grouping period (day, week, month)
   * @param {Object} [options.dateRange] - Date range to analyze
   * @param {Array<number>} [options.studentIds] - Student IDs to analyze
   * @returns {Promise<Array<Object>>} Points trends data
   * @throws {Error} If trend analysis fails
   */
  async getPointsTrends(options = {}) {
    throw new Error("Method 'getPointsTrends' must be implemented");
  }

  /**
   * Apply penalty points for violations or infractions
   * @abstract
   * @param {Object} penaltyData - Penalty data
   * @param {number} penaltyData.student_id - Student ID
   * @param {number} penaltyData.points - Penalty points (positive number)
   * @param {string} penaltyData.description - Reason for penalty
   * @returns {Promise<Object>} Penalty transaction result
   * @throws {Error} If penalty application fails
   */
  async applyPenalty(penaltyData) {
    throw new Error("Method 'applyPenalty' must be implemented");
  }

  /**
   * Generate points report for specified period
   * @abstract
   * @param {Object} reportOptions - Report generation options
   * @param {Array<number>} [reportOptions.studentIds] - Student IDs
   * @param {Date} reportOptions.startDate - Report start date
   * @param {Date} reportOptions.endDate - Report end date
   * @param {string} [reportOptions.format] - Report format
   * @returns {Promise<Object>} Generated points report
   * @throws {Error} If report generation fails
   */
  async generatePointsReport(reportOptions) {
    throw new Error("Method 'generatePointsReport' must be implemented");
  }

  /**
   * Send points-related notifications
   * @abstract
   * @param {Object} notificationOptions - Notification options
   * @param {Array<number>} [notificationOptions.studentIds] - Student IDs
   * @param {string} notificationOptions.type - Notification type
   * @param {Object} notificationOptions.data - Notification data
   * @returns {Promise<Object>} Notification sending result
   * @throws {Error} If notification sending fails
   */
  async sendPointsNotifications(notificationOptions) {
    throw new Error("Method 'sendPointsNotifications' must be implemented");
  }

  /**
   * Archive old points transactions
   * @abstract
   * @param {Date} cutoffDate - Date before which transactions should be archived
   * @returns {Promise<Object>} Archive operation result
   * @throws {Error} If archiving fails
   */
  async archiveOldTransactions(cutoffDate) {
    throw new Error("Method 'archiveOldTransactions' must be implemented");
  }

  /**
   * Bulk award points for multiple students
   * @abstract
   * @param {Array<Object>} bulkAwardData - Array of points award data
   * @returns {Promise<Object>} Bulk award operation result
   * @throws {Error} If bulk award fails
   */
  async bulkAwardPoints(bulkAwardData) {
    throw new Error("Method 'bulkAwardPoints' must be implemented");
  }
}
