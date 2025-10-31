/**
 * @fileoverview Attendance Repository Interface
 * @description Defines the contract for attendance data access operations.
 * This interface abstracts attendance-related database operations from business logic.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

/**
 * Interface for Attendance repository operations
 * @interface IAttendanceRepository
 * @description Provides a contract for all attendance-related data access operations.
 * Implementations should handle all database interactions for attendance records.
 */
export class IAttendanceRepository {
  /**
   * Find attendance records with optional filtering
   * @async
   * @param {Object} [filters] - Filter criteria
   * @param {number} [filters.studentId] - Filter by student ID
   * @param {Date} [filters.date] - Filter by specific date
   * @param {Date} [filters.startDate] - Filter from start date
   * @param {Date} [filters.endDate] - Filter to end date
   * @param {string} [filters.status] - Filter by status (present|absent|late|excused)
   * @param {number} [filters.limit] - Maximum results to return
   * @param {number} [filters.offset] - Results offset for pagination
   * @param {string} [filters.orderBy='date'] - Order by field
   * @param {string} [filters.orderDirection='DESC'] - Order direction
   * @returns {Promise<Array<Object>>} Array of attendance records with student information
   * @throws {Error} If database query fails
   */
  async findAll(filters = {}) {
    throw new Error("IAttendanceRepository.findAll() must be implemented");
  }

  /**
   * Find attendance records for a specific student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @param {Date} [options.startDate] - Start date filter
   * @param {Date} [options.endDate] - End date filter
   * @param {string} [options.status] - Status filter
   * @param {number} [options.limit] - Maximum results
   * @param {string} [options.orderBy='date'] - Order by field
   * @param {string} [options.orderDirection='DESC'] - Order direction
   * @returns {Promise<Array<Object>>} Array of attendance records for the student
   * @throws {Error} If database query fails
   */
  async findByStudentId(studentId, options = {}) {
    throw new Error(
      "IAttendanceRepository.findByStudentId() must be implemented"
    );
  }

  /**
   * Find attendance record by ID
   * @async
   * @param {number} id - Attendance record ID
   * @returns {Promise<Object|null>} Attendance record or null if not found
   * @throws {Error} If database query fails
   */
  async findById(id) {
    throw new Error("IAttendanceRepository.findById() must be implemented");
  }

  /**
   * Create a new attendance record
   * @async
   * @param {Object} attendanceData - Attendance data to create
   * @param {number} attendanceData.student_id - Student ID
   * @param {Date} attendanceData.date - Attendance date
   * @param {string} attendanceData.status - Status (present|absent|late|excused)
   * @param {string} [attendanceData.notes] - Optional notes
   * @returns {Promise<Object>} Created attendance record with student information
   * @throws {Error} If creation fails or record already exists for student and date
   */
  async create(attendanceData) {
    throw new Error("IAttendanceRepository.create() must be implemented");
  }

  /**
   * Update an attendance record by ID
   * @async
   * @param {number} id - Attendance record ID
   * @param {Object} updates - Fields to update
   * @param {string} [updates.status] - Updated status
   * @param {string} [updates.notes] - Updated notes
   * @returns {Promise<Object|null>} Updated attendance record or null if not found
   * @throws {Error} If update operation fails
   */
  async update(id, updates) {
    throw new Error("IAttendanceRepository.update() must be implemented");
  }

  /**
   * Delete an attendance record by ID
   * @async
   * @param {number} id - Attendance record ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   * @throws {Error} If delete operation fails
   */
  async delete(id) {
    throw new Error("IAttendanceRepository.delete() must be implemented");
  }

  /**
   * Get attendance sheet for a specific date (all students with their status)
   * @async
   * @param {Date} date - Date for attendance sheet
   * @returns {Promise<Array<Object>>} Array of students with attendance information
   * @returns {number} returns[].student_id - Student ID
   * @returns {string} returns[].name - Student name
   * @returns {string} returns[].status - Attendance status or 'not_marked' if no record
   * @returns {string} [returns[].notes] - Attendance notes if any
   * @returns {number} [returns[].attendance_id] - Attendance record ID if exists
   * @throws {Error} If database query fails
   */
  async findByDate(date) {
    throw new Error("IAttendanceRepository.findByDate() must be implemented");
  }

  /**
   * Get unique session dates where attendance was recorded
   * @async
   * @param {Object} [options] - Query options
   * @param {Date} [options.startDate] - Start date filter
   * @param {Date} [options.endDate] - End date filter
   * @param {number} [options.limit] - Maximum results
   * @returns {Promise<Array<Object>>} Array of session dates with attendance counts
   * @returns {string} returns[].date - Session date (YYYY-MM-DD)
   * @returns {number} returns[].total_students - Total students with attendance recorded
   * @returns {number} returns[].present_count - Number of students marked present
   * @returns {number} returns[].absent_count - Number of students marked absent
   * @returns {number} returns[].late_count - Number of students marked late
   * @returns {number} returns[].excused_count - Number of students marked excused
   * @throws {Error} If database query fails
   */
  async getSessionDates(options = {}) {
    throw new Error(
      "IAttendanceRepository.getSessionDates() must be implemented"
    );
  }

  /**
   * Get attendance summary statistics grouped by student
   * @async
   * @param {Object} [options] - Query options
   * @param {Date} [options.startDate] - Start date filter
   * @param {Date} [options.endDate] - End date filter
   * @param {number} [options.limit] - Maximum results
   * @returns {Promise<Array<Object>>} Array of attendance summaries per student
   * @returns {number} returns[].student_id - Student ID
   * @returns {number} returns[].total_records - Total attendance records for student
   * @returns {number} returns[].present_count - Count of present days
   * @returns {number} returns[].absent_count - Count of absent days
   * @returns {number} returns[].late_count - Count of late days
   * @returns {number} returns[].excused_count - Count of excused days
   * @returns {Object} returns[].Student - Student information (id, name)
   * @throws {Error} If database query fails
   */
  async getSummaryByStudent(options = {}) {
    throw new Error(
      "IAttendanceRepository.getSummaryByStudent() must be implemented"
    );
  }

  /**
   * Bulk create or update attendance records for multiple students on the same date
   * @async
   * @param {Date} date - Date for attendance records
   * @param {Array<Object>} attendanceRecords - Array of attendance data
   * @param {number} attendanceRecords[].student_id - Student ID
   * @param {string} attendanceRecords[].status - Attendance status
   * @param {string} [attendanceRecords[].notes] - Optional notes
   * @returns {Promise<Object>} Bulk operation results
   * @returns {Array<Object>} returns.successful - Successfully processed records
   * @returns {Array<Object>} returns.errors - Records that failed processing
   * @throws {Error} If bulk operation fails
   */
  async bulkCreateOrUpdate(date, attendanceRecords) {
    throw new Error(
      "IAttendanceRepository.bulkCreateOrUpdate() must be implemented"
    );
  }

  /**
   * Record session attendance (simplified bulk operation)
   * @async
   * @param {Date} date - Session date
   * @param {Array<Object>} attendanceData - Array of student attendance
   * @param {number} attendanceData[].student_id - Student ID
   * @param {string} attendanceData[].status - Attendance status
   * @param {string} [attendanceData[].notes] - Optional notes
   * @returns {Promise<Array<Object>>} Array of created/updated attendance records
   * @throws {Error} If session recording fails
   */
  async recordSession(date, attendanceData) {
    throw new Error(
      "IAttendanceRepository.recordSession() must be implemented"
    );
  }

  /**
   * Check if attendance exists for student on specific date
   * @async
   * @param {number} studentId - Student ID
   * @param {Date} date - Date to check
   * @returns {Promise<Object|null>} Existing attendance record or null
   * @throws {Error} If check operation fails
   */
  async findByStudentAndDate(studentId, date) {
    throw new Error(
      "IAttendanceRepository.findByStudentAndDate() must be implemented"
    );
  }

  /**
   * Get attendance statistics for analytics
   * @async
   * @param {Object} [options] - Query options
   * @param {Date} [options.startDate] - Start date filter
   * @param {Date} [options.endDate] - End date filter
   * @param {string} [options.groupBy] - Group by period ('day', 'week', 'month')
   * @returns {Promise<Array<Object>>} Attendance analytics data
   * @throws {Error} If query fails
   */
  async getAnalyticsData(options = {}) {
    throw new Error(
      "IAttendanceRepository.getAnalyticsData() must be implemented"
    );
  }

  /**
   * Count total attendance records
   * @async
   * @param {Object} [filters] - Optional filters
   * @param {number} [filters.studentId] - Filter by student ID
   * @param {string} [filters.status] - Filter by status
   * @param {Date} [filters.startDate] - Start date filter
   * @param {Date} [filters.endDate] - End date filter
   * @returns {Promise<number>} Total count of attendance records
   * @throws {Error} If count operation fails
   */
  async countAll(filters = {}) {
    throw new Error("IAttendanceRepository.countAll() must be implemented");
  }
}
