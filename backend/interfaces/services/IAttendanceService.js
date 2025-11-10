/**
 * @fileoverview Attendance Service Interface
 * @description Abstract interface defining business logic operations for attendance management.
 * This interface provides a contract for attendance-related business operations including
 * tracking, validation, analytics, and reporting functionality.
 * @author @NelakaWith
 * @version 1.0.0
 */

/**
 * Abstract Attendance Service Interface
 * @abstract
 * @class IAttendanceService
 * @description Defines business logic operations for attendance management
 */
export class IAttendanceService {
  /**
   * Record attendance for a student with validation
   * @abstract
   * @param {Object} attendanceData - Attendance data to record
   * @param {number} attendanceData.student_id - Student ID
   * @param {Date|string} attendanceData.date - Attendance date
   * @param {string} attendanceData.status - Attendance status (present, absent, late, excused)
   * @param {string} [attendanceData.notes] - Optional notes
   * @returns {Promise<Object>} Recorded attendance with validation results
   * @throws {Error} If attendance recording fails or validation errors
   */
  async recordAttendance(attendanceData) {
    throw new Error("Method 'recordAttendance' must be implemented");
  }

  /**
   * Get attendance record by ID
   * @abstract
   * @param {number} attendanceId - Attendance record ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object|null>} Attendance record or null if not found
   * @throws {Error} If retrieval fails
   */
  async getAttendanceById(attendanceId, options = {}) {
    throw new Error("Method 'getAttendanceById' must be implemented");
  }

  /**
   * Get attendance records for a student with filtering
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Filter and pagination options
   * @returns {Promise<Object>} Attendance records with pagination metadata
   * @throws {Error} If retrieval fails
   */
  async getStudentAttendance(studentId, options = {}) {
    throw new Error("Method 'getStudentAttendance' must be implemented");
  }

  /**
   * Get daily attendance for all students
   * @abstract
   * @param {Date|string} date - Date to get attendance for
   * @param {Object} [options] - Query options
   * @returns {Promise<Object>} Daily attendance summary with student details
   * @throws {Error} If retrieval fails
   */
  async getDailyAttendance(date, options = {}) {
    throw new Error("Method 'getDailyAttendance' must be implemented");
  }

  /**
   * Update attendance record with validation
   * @abstract
   * @param {number} attendanceId - Attendance record ID
   * @param {Object} updates - Fields to update
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<Object|null>} Updated attendance or null if not found
   * @throws {Error} If update fails or validation errors
   */
  async updateAttendance(attendanceId, updates, requestingUserId = null) {
    throw new Error("Method 'updateAttendance' must be implemented");
  }

  /**
   * Delete attendance record with validation
   * @abstract
   * @param {number} attendanceId - Attendance record ID
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<boolean>} True if deleted successfully
   * @throws {Error} If deletion fails or unauthorized
   */
  async deleteAttendance(attendanceId, requestingUserId = null) {
    throw new Error("Method 'deleteAttendance' must be implemented");
  }

  /**
   * Bulk record attendance for multiple students
   * @abstract
   * @param {Array<Object>} attendanceRecords - Array of attendance data
   * @param {Object} [options] - Bulk operation options
   * @returns {Promise<Object>} Bulk operation result with success/failure details
   * @throws {Error} If bulk operation fails
   */
  async bulkRecordAttendance(attendanceRecords, options = {}) {
    throw new Error("Method 'bulkRecordAttendance' must be implemented");
  }

  /**
   * Get attendance statistics for a student
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Comprehensive attendance statistics
   * @throws {Error} If statistics calculation fails
   */
  async getAttendanceStatistics(studentId, dateRange = {}) {
    throw new Error("Method 'getAttendanceStatistics' must be implemented");
  }

  /**
   * Get attendance analytics for multiple students
   * @abstract
   * @param {Array<number>} [studentIds] - Student IDs (if empty, gets all students)
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Attendance analytics and trends
   * @throws {Error} If analytics generation fails
   */
  async getAttendanceAnalytics(studentIds = [], dateRange = {}) {
    throw new Error("Method 'getAttendanceAnalytics' must be implemented");
  }

  /**
   * Generate attendance report for specified period
   * @abstract
   * @param {Object} reportOptions - Report generation options
   * @param {Array<number>} [reportOptions.studentIds] - Student IDs
   * @param {Date} reportOptions.startDate - Report start date
   * @param {Date} reportOptions.endDate - Report end date
   * @param {string} [reportOptions.format] - Report format (summary, detailed)
   * @returns {Promise<Object>} Generated attendance report
   * @throws {Error} If report generation fails
   */
  async generateAttendanceReport(reportOptions) {
    throw new Error("Method 'generateAttendanceReport' must be implemented");
  }

  /**
   * Get students with poor attendance
   * @abstract
   * @param {Object} [criteria] - Attendance criteria
   * @param {number} [criteria.attendanceThreshold=75] - Minimum attendance percentage
   * @param {Object} [criteria.dateRange] - Date range to analyze
   * @returns {Promise<Array<Object>>} Students with poor attendance
   * @throws {Error} If analysis fails
   */
  async getStudentsWithPoorAttendance(criteria = {}) {
    throw new Error(
      "Method 'getStudentsWithPoorAttendance' must be implemented"
    );
  }

  /**
   * Get attendance trends over time
   * @abstract
   * @param {Object} [options] - Trend analysis options
   * @param {string} [options.groupBy='week'] - Grouping period (day, week, month)
   * @param {Object} [options.dateRange] - Date range to analyze
   * @returns {Promise<Array<Object>>} Attendance trends data
   * @throws {Error} If trend analysis fails
   */
  async getAttendanceTrends(options = {}) {
    throw new Error("Method 'getAttendanceTrends' must be implemented");
  }

  /**
   * Validate attendance data before recording or updating
   * @abstract
   * @param {Object} attendanceData - Attendance data to validate
   * @param {boolean} [isUpdate=false] - Whether this is an update operation
   * @returns {Promise<Object>} Validation result with errors if any
   * @throws {Error} If validation process fails
   */
  async validateAttendanceData(attendanceData, isUpdate = false) {
    throw new Error("Method 'validateAttendanceData' must be implemented");
  }

  /**
   * Check for duplicate attendance records
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Date|string} date - Date to check
   * @returns {Promise<boolean>} True if duplicate exists
   * @throws {Error} If duplicate check fails
   */
  async checkDuplicateAttendance(studentId, date) {
    throw new Error("Method 'checkDuplicateAttendance' must be implemented");
  }

  /**
   * Get attendance patterns for a student
   * @abstract
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Pattern analysis options
   * @returns {Promise<Object>} Attendance patterns and insights
   * @throws {Error} If pattern analysis fails
   */
  async getAttendancePatterns(studentId, options = {}) {
    throw new Error("Method 'getAttendancePatterns' must be implemented");
  }

  /**
   * Send attendance notifications
   * @abstract
   * @param {Object} notificationOptions - Notification options
   * @param {Array<number>} [notificationOptions.studentIds] - Student IDs
   * @param {string} notificationOptions.type - Notification type
   * @returns {Promise<Object>} Notification sending result
   * @throws {Error} If notification sending fails
   */
  async sendAttendanceNotifications(notificationOptions) {
    throw new Error("Method 'sendAttendanceNotifications' must be implemented");
  }

  /**
   * Calculate attendance rate for a period
   * @abstract
   * @param {number|Array<number>} studentIds - Student ID(s)
   * @param {Object} dateRange - Date range for calculation
   * @returns {Promise<Object>} Attendance rate calculation
   * @throws {Error} If calculation fails
   */
  async calculateAttendanceRate(studentIds, dateRange) {
    throw new Error("Method 'calculateAttendanceRate' must be implemented");
  }

  /**
   * Get attendance exceptions (unusual patterns or missing records)
   * @abstract
   * @param {Object} [options] - Exception detection options
   * @returns {Promise<Array<Object>>} Attendance exceptions found
   * @throws {Error} If exception detection fails
   */
  async getAttendanceExceptions(options = {}) {
    throw new Error("Method 'getAttendanceExceptions' must be implemented");
  }

  /**
   * Archive old attendance records
   * @abstract
   * @param {Date} cutoffDate - Date before which records should be archived
   * @returns {Promise<Object>} Archive operation result
   * @throws {Error} If archiving fails
   */
  async archiveOldAttendance(cutoffDate) {
    throw new Error("Method 'archiveOldAttendance' must be implemented");
  }
}
