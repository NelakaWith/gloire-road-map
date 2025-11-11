/**
 * @fileoverview Analytics Repository Interface
 * @description Defines the contract for analytics data access operations.
 * This interface abstracts analytics-related database operations from business logic.
 * @author @NelakaWith
 * @version 1.0.0
 */

/**
 * Interface for Analytics repository operations
 * @interface IAnalyticsRepository
 * @description Defines methods for accessing analytics data from the database
 */
export class IAnalyticsRepository {
  /**
   * Get overview statistics data
   * @abstract
   * @param {Object} [dateRange] - Optional date range filter
   * @param {string} [dateRange.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [dateRange.end_date] - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Raw overview statistics data
   * @throws {Error} If data retrieval fails
   */
  async getOverviewStats(dateRange = {}) {
    throw new Error(
      "IAnalyticsRepository.getOverviewStats() must be implemented"
    );
  }

  /**
   * Get goal completions data grouped by time periods
   * @abstract
   * @param {Object} [options] - Query options
   * @param {string} [options.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [options.end_date] - End date in YYYY-MM-DD format
   * @param {string} [options.group_by] - Grouping period: day|week|month
   * @returns {Promise<Array<Object>>} Completion data grouped by time period
   * @throws {Error} If data retrieval fails
   */
  async getCompletionsData(options = {}) {
    throw new Error(
      "IAnalyticsRepository.getCompletionsData() must be implemented"
    );
  }

  /**
   * Get goal creation throughput data
   * @abstract
   * @param {Object} [options] - Query options
   * @param {string} [options.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [options.end_date] - End date in YYYY-MM-DD format
   * @param {string} [options.group_by] - Grouping period: day|week|month
   * @returns {Promise<Array<Object>>} Throughput data grouped by time period
   * @throws {Error} If data retrieval fails
   */
  async getThroughputData(options = {}) {
    throw new Error(
      "IAnalyticsRepository.getThroughputData() must be implemented"
    );
  }

  /**
   * Get current goal backlog data
   * @abstract
   * @param {Object} [options] - Query options
   * @param {string} [options.as_of] - Date to calculate backlog as of
   * @param {number} [options.top_n] - Number of top backlog items to return
   * @returns {Promise<Array<Object>>} Backlog data
   * @throws {Error} If data retrieval fails
   */
  async getBacklogData(options = {}) {
    throw new Error(
      "IAnalyticsRepository.getBacklogData() must be implemented"
    );
  }

  /**
   * Get overdue goals data
   * @abstract
   * @param {Object} [dateRange] - Optional date range filter
   * @param {string} [dateRange.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [dateRange.end_date] - End date in YYYY-MM-DD format
   * @param {string} [dateRange.as_of] - Date to calculate overdue status as of
   * @returns {Promise<Array<Object>>} Overdue goals data
   * @throws {Error} If data retrieval fails
   */
  async getOverdueData(dateRange = {}) {
    throw new Error(
      "IAnalyticsRepository.getOverdueData() must be implemented"
    );
  }

  /**
   * Get time-to-complete statistics data
   * @abstract
   * @param {Object} [dateRange] - Optional date range filter
   * @param {string} [dateRange.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [dateRange.end_date] - End date in YYYY-MM-DD format
   * @returns {Promise<Array<Object>>} Time-to-complete data
   * @throws {Error} If data retrieval fails
   */
  async getTimeToCompleteData(dateRange = {}) {
    throw new Error(
      "IAnalyticsRepository.getTimeToCompleteData() must be implemented"
    );
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
   * @throws {Error} If data retrieval fails
   */
  async getStudentAnalyticsData(options = {}) {
    throw new Error(
      "IAnalyticsRepository.getStudentAnalyticsData() must be implemented"
    );
  }
}
