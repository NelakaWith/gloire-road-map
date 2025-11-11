/**
 * @fileoverview Analytics Service Implementation
 * @description Concrete implementation of IAnalyticsService providing analytics business logic
 * including data aggregation, calculations, and formatting for dashboard consumption.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { IAnalyticsService } from "../interfaces/services/IAnalyticsService.js";

/**
 * Analytics Service Implementation
 * @class AnalyticsService
 * @extends IAnalyticsService
 * @description Provides analytics business logic operations
 */
export class AnalyticsService extends IAnalyticsService {
  /**
   * Constructor for AnalyticsService
   * @param {IAnalyticsRepository} analyticsRepository - Analytics repository instance
   */
  constructor(analyticsRepository) {
    super();
    this.analyticsRepository = analyticsRepository;
  }

  /**
   * Get analytics overview with key performance indicators
   * @async
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
    try {
      const rawData = await this.analyticsRepository.getOverviewStats(
        dateRange
      );

      // compute percentage complete (0 if no goals)
      const total = Number(rawData.total_goals || 0);
      const completed = Number(rawData.completed_goals || 0);
      const pct_complete =
        total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0;

      return {
        total_goals: total,
        completed_goals: completed,
        pct_complete,
        avg_days_to_complete: rawData.avg_days_to_complete
          ? Number(rawData.avg_days_to_complete)
          : null,
      };
    } catch (error) {
      throw new Error(`Failed to get analytics overview: ${error.message}`);
    }
  }

  /**
   * Get goal completions analytics grouped by time periods
   * @async
   * @param {Object} [options] - Query options
   * @param {string} [options.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [options.end_date] - End date in YYYY-MM-DD format
   * @param {string} [options.group_by] - Grouping period: day|week|month
   * @returns {Promise<Array<Object>>} Completion data grouped by time period
   * @throws {Error} If analytics generation fails
   */
  async getCompletions(options = {}) {
    try {
      return await this.analyticsRepository.getCompletionsData(options);
    } catch (error) {
      throw new Error(`Failed to get completions analytics: ${error.message}`);
    }
  }

  /**
   * Get analytics data aggregated by individual students
   * @async
   * @param {Object} [options] - Query options
   * @param {string} [options.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [options.end_date] - End date in YYYY-MM-DD format
   * @param {number} [options.limit] - Maximum results to return
   * @param {number} [options.offset] - Results offset for pagination
   * @returns {Promise<Array<Object>>} Student analytics data
   * @throws {Error} If analytics generation fails
   */
  async getByStudent(options = {}) {
    try {
      const rawData = await this.analyticsRepository.getStudentAnalyticsData(
        options
      );

      // Format the data for frontend consumption
      return rawData.map((row) => ({
        student_id: row.student_id,
        student_name: row.student_name,
        completions: Number(row.completions || 0),
        avg_days: row.avg_days ? Number(row.avg_days) : null,
      }));
    } catch (error) {
      throw new Error(`Failed to get student analytics: ${error.message}`);
    }
  }

  /**
   * Get goal creation throughput analytics
   * @async
   * @param {Object} [options] - Query options
   * @param {string} [options.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [options.end_date] - End date in YYYY-MM-DD format
   * @param {string} [options.group_by] - Grouping period: day|week|month
   * @returns {Promise<Array<Object>>} Throughput data grouped by time period
   * @throws {Error} If analytics generation fails
   */
  async getThroughput(options = {}) {
    try {
      return await this.analyticsRepository.getThroughputData(options);
    } catch (error) {
      throw new Error(`Failed to get throughput analytics: ${error.message}`);
    }
  }

  /**
   * Get current goal backlog statistics
   * @async
   * @param {Object} [options] - Query options
   * @param {string} [options.as_of] - Date to calculate backlog as of
   * @param {number} [options.top_n] - Number of top backlog items to return
   * @returns {Promise<Object>} Backlog analytics data
   * @throws {Error} If analytics generation fails
   */
  async getBacklog(options = {}) {
    try {
      return await this.analyticsRepository.getBacklogData(options);
    } catch (error) {
      throw new Error(`Failed to get backlog analytics: ${error.message}`);
    }
  }

  /**
   * Get overdue goals analytics
   * @async
   * @param {Object} [dateRange] - Optional date range filter
   * @param {string} [dateRange.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [dateRange.end_date] - End date in YYYY-MM-DD format
   * @param {string} [dateRange.as_of] - Date to calculate overdue status as of
   * @returns {Promise<Object>} Overdue goals analytics
   * @throws {Error} If analytics generation fails
   */
  async getOverdue(dateRange = {}) {
    try {
      return await this.analyticsRepository.getOverdueData(dateRange);
    } catch (error) {
      throw new Error(`Failed to get overdue analytics: ${error.message}`);
    }
  }

  /**
   * Get time-to-complete analytics for goals
   * @async
   * @param {Object} [dateRange] - Optional date range filter
   * @param {string} [dateRange.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [dateRange.end_date] - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Time-to-complete analytics with statistics
   * @throws {Error} If analytics generation fails
   */
  async getTimeToComplete(dateRange = {}) {
    try {
      return await this.analyticsRepository.getTimeToCompleteData(dateRange);
    } catch (error) {
      throw new Error(
        `Failed to get time-to-complete analytics: ${error.message}`
      );
    }
  }
}
