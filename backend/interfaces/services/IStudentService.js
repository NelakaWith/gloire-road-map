/**
 * @fileoverview Student Service Interface
 * @description Abstract interface defining business logic operations for student management.
 * This interface provides a contract for student-related business operations including
 * profile management, academic tracking, and comprehensive analytics.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

/**
 * Abstract Student Service Interface
 * @abstract
 * @class IStudentService
 * @description Defines business logic operations for student management
 */
export class IStudentService {
  /**
   * Create a new student with validation
   * @abstract
   * @param {Object} studentData - Student data to create
   * @param {string} studentData.name - Student name
   * @param {string} [studentData.contact_number] - Contact number
   * @param {string} [studentData.address] - Address
   * @param {Date} [studentData.date_of_birth] - Date of birth
   * @returns {Promise<Object>} Created student with validation results
   * @throws {Error} If student creation fails or validation errors
   */
  async createStudent(studentData) {
    throw new Error("Method 'createStudent' must be implemented");
  }

  /**
   * Get student by ID with comprehensive data
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object|null>} Student with related data or null if not found
   * @throws {Error} If retrieval fails
   */
  async getStudentById(studentId, options = {}) {
    throw new Error("Method 'getStudentById' must be implemented");
  }

  /**
   * Get all students with filtering and pagination
   * @abstract
   * @param {Object} [options] - Filter and pagination options
   * @returns {Promise<Object>} Students with pagination metadata
   * @throws {Error} If retrieval fails
   */
  async getAllStudents(options = {}) {
    throw new Error("Method 'getAllStudents' must be implemented");
  }

  /**
   * Update student with validation
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} updates - Fields to update
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<Object|null>} Updated student or null if not found
   * @throws {Error} If update fails or validation errors
   */
  async updateStudent(studentId, updates, requestingUserId = null) {
    throw new Error("Method 'updateStudent' must be implemented");
  }

  /**
   * Delete student with validation and cleanup
   * @abstract
   * @param {number} studentId - Student ID
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<boolean>} True if deleted successfully
   * @throws {Error} If deletion fails or unauthorized
   */
  async deleteStudent(studentId, requestingUserId = null) {
    throw new Error("Method 'deleteStudent' must be implemented");
  }

  /**
   * Search students by various criteria
   * @abstract
   * @param {string} searchTerm - Search term
   * @param {Object} [options] - Search options
   * @returns {Promise<Array<Object>>} Array of matching students
   * @throws {Error} If search fails
   */
  async searchStudents(searchTerm, options = {}) {
    throw new Error("Method 'searchStudents' must be implemented");
  }

  /**
   * Get comprehensive student dashboard data
   * @abstract
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Dashboard data including goals, attendance, points
   * @throws {Error} If dashboard data generation fails
   */
  async getStudentDashboard(studentId) {
    throw new Error("Method 'getStudentDashboard' must be implemented");
  }

  /**
   * Get student academic progress summary
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Academic progress summary
   * @throws {Error} If progress calculation fails
   */
  async getStudentProgress(studentId, dateRange = {}) {
    throw new Error("Method 'getStudentProgress' must be implemented");
  }

  /**
   * Get student attendance summary with analytics
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Attendance summary and analytics
   * @throws {Error} If attendance summary generation fails
   */
  async getStudentAttendanceSummary(studentId, dateRange = {}) {
    throw new Error("Method 'getStudentAttendanceSummary' must be implemented");
  }

  /**
   * Get student points summary and transaction history
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object>} Points summary and transaction history
   * @throws {Error} If points summary generation fails
   */
  async getStudentPointsSummary(studentId, options = {}) {
    throw new Error("Method 'getStudentPointsSummary' must be implemented");
  }

  /**
   * Generate student performance report
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [reportOptions] - Report generation options
   * @returns {Promise<Object>} Comprehensive performance report
   * @throws {Error} If report generation fails
   */
  async generatePerformanceReport(studentId, reportOptions = {}) {
    throw new Error("Method 'generatePerformanceReport' must be implemented");
  }

  /**
   * Get students leaderboard based on various metrics
   * @abstract
   * @param {Object} [options] - Leaderboard options
   * @returns {Promise<Array<Object>>} Students ranked by selected metric
   * @throws {Error} If leaderboard generation fails
   */
  async getStudentsLeaderboard(options = {}) {
    throw new Error("Method 'getStudentsLeaderboard' must be implemented");
  }

  /**
   * Validate student data before creation or update
   * @abstract
   * @param {Object} studentData - Student data to validate
   * @param {boolean} [isUpdate=false] - Whether this is an update operation
   * @returns {Promise<Object>} Validation result with errors if any
   * @throws {Error} If validation process fails
   */
  async validateStudentData(studentData, isUpdate = false) {
    throw new Error("Method 'validateStudentData' must be implemented");
  }

  /**
   * Check if student is active based on recent activity
   * @abstract
   * @param {number} studentId - Student ID
   * @param {number} [dayThreshold=30] - Days to consider for activity check
   * @returns {Promise<boolean>} True if student is active
   * @throws {Error} If activity check fails
   */
  async isStudentActive(studentId, dayThreshold = 30) {
    throw new Error("Method 'isStudentActive' must be implemented");
  }

  /**
   * Get students at risk (low attendance, overdue goals, etc.)
   * @abstract
   * @param {Object} [criteria] - Risk assessment criteria
   * @returns {Promise<Array<Object>>} Students at risk with risk factors
   * @throws {Error} If risk assessment fails
   */
  async getStudentsAtRisk(criteria = {}) {
    throw new Error("Method 'getStudentsAtRisk' must be implemented");
  }

  /**
   * Calculate student engagement score
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Engagement score with breakdown
   * @throws {Error} If engagement calculation fails
   */
  async calculateEngagementScore(studentId, dateRange = {}) {
    throw new Error("Method 'calculateEngagementScore' must be implemented");
  }

  /**
   * Send notifications to students based on various triggers
   * @abstract
   * @param {number|Array<number>} studentIds - Student ID(s)
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Notification sending result
   * @throws {Error} If notification sending fails
   */
  async sendNotification(studentIds, notificationData) {
    throw new Error("Method 'sendNotification' must be implemented");
  }

  /**
   * Archive inactive students
   * @abstract
   * @param {number} [inactiveDays=90] - Days of inactivity threshold
   * @returns {Promise<Object>} Archive operation result
   * @throws {Error} If archiving fails
   */
  async archiveInactiveStudents(inactiveDays = 90) {
    throw new Error("Method 'archiveInactiveStudents' must be implemented");
  }
}
