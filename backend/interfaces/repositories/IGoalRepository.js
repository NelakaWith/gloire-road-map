/**
 * @fileoverview Goal Repository Interface
 * @description Defines the contract for goal data access operations.
 * This interface abstracts goal-related database operations from business logic.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

/**
 * Interface for Goal repository operations
 * @interface IGoalRepository
 * @description Provides a contract for all goal-related data access operations.
 * Implementations should handle all database interactions for goals.
 */
export class IGoalRepository {
  /**
   * Create a new goal
   * @async
   * @param {Object} goalData - Goal data to create
   * @param {number} goalData.student_id - Student ID who owns the goal
   * @param {string} goalData.title - Goal title
   * @param {string} [goalData.description] - Optional goal description
   * @param {Date} [goalData.target_date] - Optional target completion date
   * @returns {Promise<Object>} Created goal object
   * @throws {Error} If goal creation fails
   */
  async create(goalData) {
    throw new Error("IGoalRepository.create() must be implemented");
  }

  /**
   * Find a goal by its ID
   * @async
   * @param {number} id - Goal ID
   * @returns {Promise<Object|null>} Goal object or null if not found
   * @throws {Error} If database query fails
   */
  async findById(id) {
    throw new Error("IGoalRepository.findById() must be implemented");
  }

  /**
   * Find all goals for a specific student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @param {boolean} [options.includeCompleted=true] - Include completed goals
   * @param {string} [options.orderBy='created_at'] - Order by field
   * @param {string} [options.orderDirection='DESC'] - Order direction
   * @returns {Promise<Array<Object>>} Array of goal objects
   * @throws {Error} If database query fails
   */
  async findByStudentId(studentId, options = {}) {
    throw new Error("IGoalRepository.findByStudentId() must be implemented");
  }

  /**
   * Find completed goals with optional filtering
   * @async
   * @param {Object} [filters] - Filter criteria
   * @param {number} [filters.studentId] - Filter by student ID
   * @param {Object} [filters.dateRange] - Date range filter
   * @param {Date} [filters.dateRange.start] - Start date
   * @param {Date} [filters.dateRange.end] - End date
   * @param {number} [filters.limit] - Maximum results to return
   * @param {number} [filters.offset] - Results offset for pagination
   * @returns {Promise<Array<Object>>} Array of completed goal objects
   * @throws {Error} If database query fails
   */
  async findCompleted(filters = {}) {
    throw new Error("IGoalRepository.findCompleted() must be implemented");
  }

  /**
   * Update a goal by ID
   * @async
   * @param {number} id - Goal ID
   * @param {Object} updates - Fields to update
   * @param {string} [updates.title] - Updated title
   * @param {string} [updates.description] - Updated description
   * @param {Date} [updates.target_date] - Updated target date
   * @param {boolean} [updates.is_completed] - Completion status
   * @param {Date} [updates.completed_at] - Completion timestamp
   * @returns {Promise<Object|null>} Updated goal object or null if not found
   * @throws {Error} If update operation fails
   */
  async update(id, updates) {
    throw new Error("IGoalRepository.update() must be implemented");
  }

  /**
   * Delete a goal by ID
   * @async
   * @param {number} id - Goal ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   * @throws {Error} If delete operation fails
   */
  async delete(id) {
    throw new Error("IGoalRepository.delete() must be implemented");
  }

  /**
   * Count total goals
   * @async
   * @param {Object} [filters] - Optional filters
   * @param {number} [filters.studentId] - Filter by student ID
   * @param {boolean} [filters.completedOnly] - Count only completed goals
   * @returns {Promise<number>} Total count of goals
   * @throws {Error} If count operation fails
   */
  async countAll(filters = {}) {
    throw new Error("IGoalRepository.countAll() must be implemented");
  }

  /**
   * Count completed goals within date range
   * @async
   * @param {Object} [dateRange] - Date range filter
   * @param {Date} [dateRange.start] - Start date
   * @param {Date} [dateRange.end] - End date
   * @returns {Promise<number>} Count of completed goals
   * @throws {Error} If count operation fails
   */
  async countCompleted(dateRange = {}) {
    throw new Error("IGoalRepository.countCompleted() must be implemented");
  }

  /**
   * Calculate average completion time for goals
   * @async
   * @param {Object} [dateRange] - Date range filter
   * @param {Date} [dateRange.start] - Start date (by completion date)
   * @param {Date} [dateRange.end] - End date (by completion date)
   * @returns {Promise<number|null>} Average days to complete or null if no data
   * @throws {Error} If calculation fails
   */
  async getAverageCompletionTime(dateRange = {}) {
    throw new Error(
      "IGoalRepository.getAverageCompletionTime() must be implemented"
    );
  }

  /**
   * Get goals for analytics (throughput, time-to-complete, etc.)
   * @async
   * @param {Object} [filters] - Filter criteria
   * @param {Date} [filters.startDate] - Start date filter
   * @param {Date} [filters.endDate] - End date filter
   * @param {string} [filters.groupBy] - Group by period ('day', 'week', 'month')
   * @returns {Promise<Array<Object>>} Goals data for analytics
   * @throws {Error} If query fails
   */
  async getForAnalytics(filters = {}) {
    throw new Error("IGoalRepository.getForAnalytics() must be implemented");
  }

  /**
   * Get goal completion statistics by student
   * @async
   * @param {Object} [filters] - Filter criteria
   * @param {Date} [filters.startDate] - Start date filter
   * @param {Date} [filters.endDate] - End date filter
   * @param {number} [filters.limit] - Maximum results
   * @param {number} [filters.offset] - Results offset
   * @returns {Promise<Array<Object>>} Student completion statistics
   * @throws {Error} If query fails
   */
  async getCompletionStatsByStudent(filters = {}) {
    throw new Error(
      "IGoalRepository.getCompletionStatsByStudent() must be implemented"
    );
  }
}
