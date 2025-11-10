/**
 * @fileoverview Analytics Service Interface
 * @description Abstract interface defining analytics business logic operations.
 * This interface provides a contract for data analysis, reporting, and metrics generation.
 * @author @NelakaWith
 * @version 1.0.0
 */

/**
 * Abstract Analytics Service Interface
 * @abstract
 * @class IAnalyticsService
 * @description Defines analytics business logic operations
 */
export class IAnalyticsService {
  /**
   * Get analytics overview with key performance indicators
   * @abstract
   * @param {Object} [dateRange] - Optional date range filter
   * @param {string} [dateRange.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [dateRange.end_date] - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Analytics overview data
   * @returns {number} returns.total_goals - Total number of goals
   * @returns {number} returns.completed_goals - Number of completed goals
   * @returns {number} returns.pct_complete - Percentage of goals completed
   * @returns {number} [returns.avg_days_to_complete] - Average days to complete goals
   * @throws {Error} If analytics generation fails
   */
  async getOverview(dateRange = {}) {
    throw new Error("Method 'getOverview' must be implemented");
  }

  /**
   * Get goal completions analytics grouped by time periods
   * @abstract
   * @param {Object} [options] - Query options
   * @param {string} [options.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [options.end_date] - End date in YYYY-MM-DD format
   * @param {string} [options.group_by] - Grouping period: day|week|month
   * @returns {Promise<Array<Object>>} Completion data grouped by time period
   * @throws {Error} If analytics generation fails
   */
  async getCompletions(options = {}) {
    throw new Error("Method 'getCompletions' must be implemented");
  }

  /**
   * Get analytics data aggregated by individual students
   * @abstract
   * @param {Object} [options] - Query options
   * @param {string} [options.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [options.end_date] - End date in YYYY-MM-DD format
   * @param {number} [options.limit] - Maximum results to return
   * @param {number} [options.offset] - Results offset for pagination
   * @returns {Promise<Array<Object>>} Student analytics data
   * @throws {Error} If analytics generation fails
   */
  async getByStudent(options = {}) {
    throw new Error("Method 'getByStudent' must be implemented");
  }

  /**
   * Get goal creation throughput analytics
   * @abstract
   * @param {Object} [options] - Query options
   * @param {string} [options.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [options.end_date] - End date in YYYY-MM-DD format
   * @param {string} [options.group_by] - Grouping period: day|week|month
   * @returns {Promise<Array<Object>>} Throughput data grouped by time period
   * @throws {Error} If analytics generation fails
   */
  async getThroughput(options = {}) {
    throw new Error("Method 'getThroughput' must be implemented");
  }

  /**
   * Get current goal backlog statistics
   * @abstract
   * @param {Object} [options] - Query options
   * @param {string} [options.as_of] - Date to calculate backlog as of
   * @param {number} [options.top_n] - Number of top backlog items to return
   * @returns {Promise<Object>} Backlog analytics data
   * @throws {Error} If analytics generation fails
   */
  async getBacklog(options = {}) {
    throw new Error("Method 'getBacklog' must be implemented");
  }

  /**
   * Get overdue goals analytics
   * @abstract
   * @param {Object} [dateRange] - Optional date range filter
   * @param {string} [dateRange.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [dateRange.end_date] - End date in YYYY-MM-DD format
   * @param {string} [dateRange.as_of] - Date to calculate overdue status as of
   * @returns {Promise<Object>} Overdue goals analytics
   * @throws {Error} If analytics generation fails
   */
  async getOverdue(dateRange = {}) {
    throw new Error("Method 'getOverdue' must be implemented");
  }

  /**
   * Get time-to-complete analytics for goals
   * @abstract
   * @param {Object} [dateRange] - Optional date range filter
   * @param {string} [dateRange.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [dateRange.end_date] - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Time-to-complete analytics with statistics
   * @throws {Error} If analytics generation fails
   */
  async getTimeToComplete(dateRange = {}) {
    throw new Error("Method 'getTimeToComplete' must be implemented");
  }
}
