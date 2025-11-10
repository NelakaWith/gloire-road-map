/**
 * @fileoverview Student Repository Interface
 * @description Defines the contract for student data access operations.
 * This interface abstracts student-related database operations from business logic.
 * @author @NelakaWith
 * @version 1.0.0
 */

/**
 * Interface for Student repository operations
 * @interface IStudentRepository
 * @description Provides a contract for all student-related data access operations.
 * Implementations should handle all database interactions for students.
 */
export class IStudentRepository {
  /**
   * Find all students with optional filtering and statistics
   * @async
   * @param {Object} [options] - Query options
   * @param {boolean} [options.includeAttendanceStats=false] - Include attendance statistics
   * @param {boolean} [options.includeGoalStats=false] - Include goal statistics
   * @param {string} [options.orderBy='name'] - Order by field
   * @param {string} [options.orderDirection='ASC'] - Order direction
   * @param {number} [options.limit] - Maximum results to return
   * @param {number} [options.offset] - Results offset for pagination
   * @returns {Promise<Array<Object>>} Array of student objects
   * @throws {Error} If database query fails
   */
  async findAll(options = {}) {
    throw new Error("IStudentRepository.findAll() must be implemented");
  }

  /**
   * Find a student by ID
   * @async
   * @param {number} id - Student ID
   * @param {Object} [options] - Query options
   * @param {boolean} [options.includeAttendanceStats=false] - Include detailed attendance statistics
   * @param {boolean} [options.includeGoalStats=false] - Include goal statistics
   * @returns {Promise<Object|null>} Student object or null if not found
   * @throws {Error} If database query fails
   */
  async findById(id, options = {}) {
    throw new Error("IStudentRepository.findById() must be implemented");
  }

  /**
   * Create a new student
   * @async
   * @param {Object} studentData - Student data to create
   * @param {string} studentData.name - Student full name
   * @param {string} [studentData.contact_number] - Contact phone number
   * @param {string} [studentData.address] - Physical address
   * @param {Date} [studentData.date_of_birth] - Date of birth
   * @param {number} [studentData.points=0] - Initial points
   * @returns {Promise<Object>} Created student object
   * @throws {Error} If student creation fails
   */
  async create(studentData) {
    throw new Error("IStudentRepository.create() must be implemented");
  }

  /**
   * Update a student by ID
   * @async
   * @param {number} id - Student ID
   * @param {Object} updates - Fields to update
   * @param {string} [updates.name] - Updated name
   * @param {string} [updates.contact_number] - Updated contact number
   * @param {string} [updates.address] - Updated address
   * @param {Date} [updates.date_of_birth] - Updated date of birth
   * @param {number} [updates.points] - Updated points
   * @returns {Promise<Object|null>} Updated student object or null if not found
   * @throws {Error} If update operation fails
   */
  async update(id, updates) {
    throw new Error("IStudentRepository.update() must be implemented");
  }

  /**
   * Delete a student by ID
   * @async
   * @param {number} id - Student ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   * @throws {Error} If delete operation fails
   * @warning This will cascade delete all related goals and attendance records
   */
  async delete(id) {
    throw new Error("IStudentRepository.delete() must be implemented");
  }

  /**
   * Find student with comprehensive attendance statistics
   * @async
   * @param {number} id - Student ID
   * @param {Object} [dateRange] - Optional date range filter
   * @param {Date} [dateRange.start] - Start date
   * @param {Date} [dateRange.end] - End date
   * @returns {Promise<Object|null>} Student with attendance stats or null if not found
   * @returns {number} returns.days_attended - Days marked as present
   * @returns {number} returns.days_absent - Days marked as absent
   * @returns {number} returns.days_late - Days marked as late
   * @returns {number} returns.days_excused - Days marked as excused
   * @returns {number} returns.total_attendance_records - Total attendance records
   * @throws {Error} If database query fails
   */
  async findWithAttendanceStats(id, dateRange = {}) {
    throw new Error(
      "IStudentRepository.findWithAttendanceStats() must be implemented"
    );
  }

  /**
   * Get students with goal completion statistics
   * @async
   * @param {Object} [options] - Query options
   * @param {Date} [options.startDate] - Start date for goal statistics
   * @param {Date} [options.endDate] - End date for goal statistics
   * @param {number} [options.limit] - Maximum results
   * @param {number} [options.offset] - Results offset
   * @param {string} [options.orderBy='total_goals'] - Order by field
   * @param {string} [options.orderDirection='DESC'] - Order direction
   * @returns {Promise<Array<Object>>} Students with goal statistics
   * @returns {number} returns[].total_goals - Total goals for student
   * @returns {number} returns[].completed_goals - Completed goals for student
   * @returns {number} returns[].completion_rate - Completion rate percentage
   * @throws {Error} If database query fails
   */
  async findWithGoalStats(options = {}) {
    throw new Error(
      "IStudentRepository.findWithGoalStats() must be implemented"
    );
  }

  /**
   * Search students by name or other criteria
   * @async
   * @param {string} searchTerm - Search term to match against name
   * @param {Object} [options] - Search options
   * @param {boolean} [options.exactMatch=false] - Use exact match instead of partial
   * @param {number} [options.limit] - Maximum results
   * @returns {Promise<Array<Object>>} Array of matching students
   * @throws {Error} If search operation fails
   */
  async search(searchTerm, options = {}) {
    throw new Error("IStudentRepository.search() must be implemented");
  }

  /**
   * Count total students
   * @async
   * @param {Object} [filters] - Optional filters
   * @param {boolean} [filters.activeOnly] - Count only students with recent activity
   * @returns {Promise<number>} Total count of students
   * @throws {Error} If count operation fails
   */
  async countAll(filters = {}) {
    throw new Error("IStudentRepository.countAll() must be implemented");
  }

  /**
   * Get students for leaderboard (points-based ranking)
   * @async
   * @param {Object} [options] - Query options
   * @param {number} [options.limit=10] - Maximum results to return
   * @param {Date} [options.startDate] - Start date for point calculations
   * @param {Date} [options.endDate] - End date for point calculations
   * @returns {Promise<Array<Object>>} Students ordered by points
   * @returns {number} returns[].total_points - Total points earned
   * @returns {number} returns[].completed_goals - Number of completed goals
   * @returns {number} returns[].on_time_bonus - Bonus points for on-time completion
   * @throws {Error} If query fails
   */
  async getLeaderboard(options = {}) {
    throw new Error("IStudentRepository.getLeaderboard() must be implemented");
  }

  /**
   * Check if student exists
   * @async
   * @param {number} id - Student ID
   * @returns {Promise<boolean>} True if student exists, false otherwise
   * @throws {Error} If check operation fails
   */
  async exists(id) {
    throw new Error("IStudentRepository.exists() must be implemented");
  }
}
