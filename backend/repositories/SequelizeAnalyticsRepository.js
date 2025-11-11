/**
 * @fileoverview Sequelize Analytics Repository Implementation
 * @description Concrete implementation of IAnalyticsRepository using Sequelize ORM
 * for analytics data access operations. Handles all analytics-related database queries.
 * @author @NelakaWith
 * @version 1.0.0
 */

import Sequelize, { Op } from "sequelize";
import { IAnalyticsRepository } from "../interfaces/repositories/IAnalyticsRepository.js";

/**
 * Sequelize implementation of Analytics repository
 * @class SequelizeAnalyticsRepository
 * @extends IAnalyticsRepository
 * @description Provides analytics data access operations using Sequelize ORM
 */
export class SequelizeAnalyticsRepository extends IAnalyticsRepository {
  /**
   * Constructor for SequelizeAnalyticsRepository
   * @param {Object} sequelize - Sequelize instance
   */
  constructor(sequelize) {
    super();
    this.sequelize = sequelize;
  }

  /**
   * Get overview statistics data
   * @async
   * @param {Object} [dateRange] - Optional date range filter
   * @param {string} [dateRange.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [dateRange.end_date] - End date in YYYY-MM-DD format
   * @returns {Promise<Object>} Raw overview statistics data
   * @throws {Error} If data retrieval fails
   */
  async getOverviewStats(dateRange = {}) {
    // Single-row query returning KPIs
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM goals) AS total_goals,
        (SELECT COUNT(*) FROM goals WHERE is_completed = 1) AS completed_goals,
        -- Use GREATEST(...,0) to avoid negative intervals (protect against bad data)
        (SELECT ROUND(AVG(GREATEST(TIMESTAMPDIFF(SECOND, created_at, completed_at), 0))/86400,2)
           FROM goals WHERE completed_at IS NOT NULL AND created_at IS NOT NULL) AS avg_days_to_complete
    `;

    const rows = await this.sequelize.query(sql, {
      type: this.sequelize.QueryTypes.SELECT,
    });

    return (
      rows[0] || {
        total_goals: 0,
        completed_goals: 0,
        avg_days_to_complete: null,
      }
    );
  }

  /**
   * Get goal completions data grouped by time periods
   * @async
   * @param {Object} [options] - Query options
   * @param {string} [options.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [options.end_date] - End date in YYYY-MM-DD format
   * @param {string} [options.group_by] - Grouping period: day|week|month
   * @returns {Promise<Array<Object>>} Completion data grouped by time period
   * @throws {Error} If data retrieval fails
   */
  async getCompletionsData(options = {}) {
    const { start_date = null, end_date = null, group_by = "week" } = options;

    let labelExpr = "DATE_FORMAT(completed_at, '%Y-%u')"; // week
    if (group_by === "day") labelExpr = "DATE_FORMAT(completed_at, '%Y-%m-%d')";
    if (group_by === "month") labelExpr = "DATE_FORMAT(completed_at, '%Y-%m')";

    const whereParts = ["completed_at IS NOT NULL"];
    const replacements = {};
    if (start_date) {
      whereParts.push("completed_at >= :start");
      replacements.start = start_date;
    }
    if (end_date) {
      whereParts.push("completed_at <= :end");
      replacements.end = end_date;
    }

    const sql = `
      SELECT ${labelExpr} AS label, COUNT(*) AS completions
      FROM goals
      WHERE ${whereParts.join(" AND ")}
      GROUP BY label
      ORDER BY label
    `;

    const rows = await this.sequelize.query(sql, {
      replacements,
      type: this.sequelize.QueryTypes.SELECT,
    });
    return rows;
  }

  /**
   * Get goal creation throughput data
   * @async
   * @param {Object} [options] - Query options
   * @param {string} [options.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [options.end_date] - End date in YYYY-MM-DD format
   * @param {string} [options.group_by] - Grouping period: day|week|month
   * @returns {Promise<Array<Object>>} Throughput data grouped by time period
   * @throws {Error} If data retrieval fails
   */
  async getThroughputData(options = {}) {
    const { start_date = null, end_date = null, group_by = "month" } = options;

    // Decide label expression and bucket boundaries
    let dateFormat = "%Y-%m"; // month
    let startExpr = "DATE_FORMAT(DATE(bucket_start), '%Y-%m-%d')";
    if (group_by === "day") {
      dateFormat = "%Y-%m-%d";
      startExpr = "DATE_FORMAT(DATE(bucket_start), '%Y-%m-%d')";
    } else if (group_by === "week") {
      // year-week (ISO-like)
      dateFormat = "%Y-%u";
      startExpr = "DATE_FORMAT(DATE(bucket_start), '%Y-%m-%d')";
    }

    const wherePartsCreated = [];
    const wherePartsCompleted = ["completed_at IS NOT NULL"];
    const replacements = {};
    if (start_date) {
      wherePartsCreated.push("DATE(created_at) >= :start");
      wherePartsCompleted.push("DATE(completed_at) >= :start");
      replacements.start = start_date;
    }
    if (end_date) {
      wherePartsCreated.push("DATE(created_at) <= :end");
      wherePartsCompleted.push("DATE(completed_at) <= :end");
      replacements.end = end_date;
    }

    // We use two subqueries and then full outer-like join via UNION of labels
    const sqlCreated = `
      SELECT DATE_FORMAT(created_at, '${dateFormat}') AS label,
             MIN(DATE(created_at)) AS bucket_start,
             MAX(DATE(created_at)) AS bucket_end,
             COUNT(*) AS created
      FROM goals
      ${
        wherePartsCreated.length
          ? `WHERE ${wherePartsCreated.join(" AND ")}`
          : ""
      }
      GROUP BY label
    `;

    const sqlCompleted = `
      SELECT DATE_FORMAT(completed_at, '${dateFormat}') AS label,
             MIN(DATE(completed_at)) AS bucket_start,
             MAX(DATE(completed_at)) AS bucket_end,
             COUNT(*) AS completed
      FROM goals
      WHERE ${wherePartsCompleted.join(" AND ")}
      GROUP BY label
    `;

    // Join created and completed by label
    const sql = `
      SELECT COALESCE(c.label, d.label) AS label,
             COALESCE(c.bucket_start, d.bucket_start) AS bucket_start,
             COALESCE(c.bucket_end, d.bucket_end) AS bucket_end,
             COALESCE(c.created,0) AS created,
             COALESCE(d.completed,0) AS completed
      FROM (${sqlCreated}) c
      RIGHT JOIN (${sqlCompleted}) d ON c.label = d.label
      UNION
      SELECT COALESCE(c.label, d.label) AS label,
             COALESCE(c.bucket_start, d.bucket_start) AS bucket_start,
             COALESCE(c.bucket_end, d.bucket_end) AS bucket_end,
             COALESCE(c.created,0) AS created,
             COALESCE(d.completed,0) AS completed
      FROM (${sqlCreated}) c
      LEFT JOIN (${sqlCompleted}) d ON c.label = d.label
      ORDER BY label
    `;

    const rows = await this.sequelize.query(sql, {
      replacements,
      type: this.sequelize.QueryTypes.SELECT,
    });

    // Build a map from label -> data returned by SQL
    const dataMap = new Map();
    for (const r of rows) {
      const label = r.label;
      dataMap.set(label, {
        created: Number(r.created || 0),
        completed: Number(r.completed || 0),
        bucket_start: r.bucket_start ? r.bucket_start.toString() : null,
        bucket_end: r.bucket_end ? r.bucket_end.toString() : null,
      });
    }

    // Helper: format date to YYYY-MM-DD
    function fmtDate(d) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    // Helper: format month label YYYY-MM
    function monthLabel(d) {
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      return `${y}-${m}`;
    }

    // Helper: week label matching MySQL DATE_FORMAT(..., '%Y-%u') approx (Sunday-start week)
    function weekLabel(d) {
      // Use UTC to avoid timezone shifts
      const date = new Date(
        Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
      );
      const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      const diff = Math.floor((date - start) / 86400000);
      const jan1Day = start.getUTCDay(); // 0 = Sunday
      const weekNum = Math.floor((diff + jan1Day) / 7) + 1;
      return `${date.getUTCFullYear()}-${String(weekNum).padStart(2, "0")}`;
    }

    // Generate continuous buckets between start_date and end_date
    const buckets = [];
    const s = start_date ? new Date(`${start_date}T00:00:00Z`) : null;
    const e = end_date ? new Date(`${end_date}T00:00:00Z`) : null;
    if (!s || !e) return [];

    if (group_by === "day") {
      let cur = new Date(s);
      while (cur <= e) {
        const label = fmtDate(cur);
        buckets.push({
          label,
          bucket_start: fmtDate(cur),
          bucket_end: fmtDate(cur),
        });
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    } else if (group_by === "month") {
      let cur = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), 1));
      while (cur <= e) {
        const label = monthLabel(cur);
        const startOfMonth = new Date(
          Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth(), 1)
        );
        const nextMonth = new Date(
          Date.UTC(cur.getUTCFullYear(), cur.getUTCMonth() + 1, 1)
        );
        const endOfMonth = new Date(nextMonth - 1);
        buckets.push({
          label,
          bucket_start: fmtDate(startOfMonth),
          bucket_end: fmtDate(endOfMonth),
        });
        cur.setUTCMonth(cur.getUTCMonth() + 1);
      }
    } else if (group_by === "week") {
      // weeks starting on Sunday
      const startSunday = new Date(s);
      startSunday.setUTCDate(s.getUTCDate() - s.getUTCDay());
      let cur = new Date(
        Date.UTC(
          startSunday.getUTCFullYear(),
          startSunday.getUTCMonth(),
          startSunday.getUTCDate()
        )
      );
      while (cur <= e) {
        const label = weekLabel(cur);
        const startOfWeek = new Date(cur);
        const endOfWeek = new Date(cur);
        endOfWeek.setUTCDate(endOfWeek.getUTCDate() + 6);
        buckets.push({
          label,
          bucket_start: fmtDate(startOfWeek),
          bucket_end: fmtDate(endOfWeek),
        });
        cur.setUTCDate(cur.getUTCDate() + 7);
      }
    }

    // Produce final series by merging SQL results into buckets and zero-filling
    const series = buckets.map((b) => {
      const d = dataMap.get(b.label) || { created: 0, completed: 0 };
      const created = Number(d.created || 0);
      const completed = Number(d.completed || 0);
      return {
        label: b.label,
        start: b.bucket_start,
        end: b.bucket_end,
        created,
        completed,
        completion_rate:
          created > 0 ? Number((completed / created).toFixed(4)) : null,
      };
    });

    return series;
  }

  /**
   * Get current goal backlog data
   * @async
   * @param {Object} [options] - Query options
   * @param {string} [options.as_of] - Date to calculate backlog as of
   * @param {number} [options.top_n] - Number of top backlog items to return
   * @returns {Promise<Object>} Backlog data
   * @throws {Error} If data retrieval fails
   */
  async getBacklogData(options = {}) {
    const { as_of = null, top_n = 10 } = options;

    // as_of is expected as YYYY-MM-DD; default to today if not provided
    const asOfDate = as_of || new Date().toISOString().slice(0, 10);
    let limit = Number(top_n) || 10;
    if (limit < 1) limit = 10;
    const MAX_TOP = 100;
    if (limit > MAX_TOP) limit = MAX_TOP;

    const replacements = { as_of: asOfDate, top_n: limit };

    // Open as of : as created on or before as_of and not completed on or before as_of
    const whereOpen = `DATE(created_at) <= :as_of AND (completed_at IS NULL OR DATE(completed_at) > :as_of)`;

    const sqlTotal = `SELECT COUNT(*) AS total_open FROM goals WHERE ${whereOpen}`;
    const sqlOverdue = `SELECT COUNT(*) AS overdue FROM goals WHERE ${whereOpen} AND target_date IS NOT NULL AND DATE(target_date) < :as_of`;
    const sqlAvgDays = `SELECT ROUND(AVG(DATEDIFF(:as_of, DATE(created_at))),2) AS avg_days_open FROM goals WHERE ${whereOpen}`;

    const sqlByAge = `
      SELECT bucket, COUNT(*) AS count FROM (
        SELECT CASE
          WHEN DATEDIFF(:as_of, DATE(created_at)) <= 7 THEN '0-7'
          WHEN DATEDIFF(:as_of, DATE(created_at)) <= 30 THEN '8-30'
          WHEN DATEDIFF(:as_of, DATE(created_at)) <= 90 THEN '31-90'
          ELSE '90+' END AS bucket
        FROM goals
        WHERE ${whereOpen}
      ) t
      GROUP BY bucket
      ORDER BY FIELD(bucket,'0-7','8-30','31-90','90+')
    `;

    const sqlTopStudents = `
      SELECT s.id AS student_id, s.name AS student_name, COUNT(*) AS open_count
      FROM goals g
      JOIN students s ON s.id = g.student_id
      WHERE ${whereOpen}
      GROUP BY s.id, s.name
      ORDER BY open_count DESC
      LIMIT :top_n
    `;

    // Run queries in parallel
    const [totalRows, overdueRows, avgRows, ageRows, topRows] =
      await Promise.all([
        this.sequelize.query(sqlTotal, {
          replacements,
          type: this.sequelize.QueryTypes.SELECT,
        }),
        this.sequelize.query(sqlOverdue, {
          replacements,
          type: this.sequelize.QueryTypes.SELECT,
        }),
        this.sequelize.query(sqlAvgDays, {
          replacements,
          type: this.sequelize.QueryTypes.SELECT,
        }),
        this.sequelize.query(sqlByAge, {
          replacements,
          type: this.sequelize.QueryTypes.SELECT,
        }),
        this.sequelize.query(sqlTopStudents, {
          replacements,
          type: this.sequelize.QueryTypes.SELECT,
        }),
      ]);

    const total_open =
      (totalRows && totalRows[0] && Number(totalRows[0].total_open)) || 0;
    const overdue =
      (overdueRows && overdueRows[0] && Number(overdueRows[0].overdue)) || 0;
    const avg_days_open =
      avgRows && avgRows[0] && avgRows[0].avg_days_open !== null
        ? Number(avgRows[0].avg_days_open)
        : null;

    // Normalize age buckets to ensure all buckets present
    const bucketsOrder = ["0-7", "8-30", "31-90", "90+"];
    const ageMap = new Map();
    for (const r of ageRows || []) {
      ageMap.set(r.bucket, Number(r.count || 0));
    }
    const open_by_age = bucketsOrder.map((b) => ({
      bucket: b,
      count: ageMap.get(b) || 0,
    }));

    const top_students = (topRows || []).map((r) => ({
      student_id: r.student_id,
      student_name: r.student_name,
      open_count: Number(r.open_count),
    }));

    return {
      as_of: asOfDate,
      total_open,
      overdue,
      avg_days_open,
      open_by_age,
      top_students,
    };
  }

  /**
   * Get overdue goals data
   * @async
   * @param {Object} [dateRange] - Optional date range filter
   * @param {string} [dateRange.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [dateRange.end_date] - End date in YYYY-MM-DD format
   * @param {string} [dateRange.as_of] - Date to calculate overdue status as of
   * @returns {Promise<Object>} Overdue goals data
   * @throws {Error} If data retrieval fails
   */
  async getOverdueData(dateRange = {}) {
    const { start_date = null, end_date = null, as_of = null } = dateRange;

    // as_of defaults to today for open overdue count
    const asOfDate = as_of || new Date().toISOString().slice(0, 10);

    const replacements = { as_of: asOfDate };
    if (start_date) replacements.start = start_date;
    if (end_date) replacements.end = end_date;

    // Open overdue as of as_of
    const sqlOpenOverdue = `
      SELECT COUNT(*) AS open_overdue
      FROM goals
      WHERE is_completed = 0
        AND target_date IS NOT NULL
        AND DATE(target_date) < :as_of
    `;

    // On-time completion rate for completed goals in range (if start/end provided)
    const sqlCompleted = `
      SELECT COUNT(*) AS completed_count,
             SUM(CASE WHEN completed_at <= target_date THEN 1 ELSE 0 END) AS completed_on_time
      FROM goals
      WHERE completed_at IS NOT NULL
        AND target_date IS NOT NULL
        ${
          start_date && end_date
            ? "AND DATE(completed_at) BETWEEN :start AND :end"
            : ""
        }
    `;

    const [openRows, completedRows] = await Promise.all([
      this.sequelize.query(sqlOpenOverdue, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      }),
      this.sequelize.query(sqlCompleted, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      }),
    ]);

    const open_overdue =
      (openRows && openRows[0] && Number(openRows[0].open_overdue)) || 0;
    const completed_count =
      (completedRows &&
        completedRows[0] &&
        Number(completedRows[0].completed_count)) ||
      0;
    const completed_on_time =
      (completedRows &&
        completedRows[0] &&
        Number(completedRows[0].completed_on_time)) ||
      0;
    const on_time_rate =
      completed_count > 0
        ? Number((completed_on_time / completed_count).toFixed(4))
        : null;

    return {
      as_of: asOfDate,
      open_overdue,
      completed_count,
      completed_on_time,
      on_time_rate,
    };
  }

  /**
   * Get time-to-complete statistics data
   * @async
   * @param {Object} [dateRange] - Optional date range filter
   * @param {string} [dateRange.start_date] - Start date in YYYY-MM-DD format
   * @param {string} [dateRange.end_date] - End date in YYYY-MM-DD format
   * @returns {Promise<Array<Object>>} Time-to-complete data
   * @throws {Error} If data retrieval fails
   */
  async getTimeToCompleteData(dateRange = {}) {
    const { start_date = null, end_date = null, buckets = null } = dateRange;

    // Default histogram buckets
    const defaultBuckets = [
      { key: "0-1", min: 0, max: 1 },
      { key: "2-7", min: 2, max: 7 },
      { key: "8-30", min: 8, max: 30 },
      { key: "31-90", min: 31, max: 90 },
      { key: "90+", min: 91, max: Number.MAX_SAFE_INTEGER },
    ];
    const histBuckets = buckets || defaultBuckets;

    const whereParts = ["completed_at IS NOT NULL", "created_at IS NOT NULL"];
    const replacements = {};
    if (start_date) {
      whereParts.push("DATE(completed_at) >= :start");
      replacements.start = start_date;
    }
    if (end_date) {
      whereParts.push("DATE(completed_at) <= :end");
      replacements.end = end_date;
    }

    const sql = `
        SELECT TIMESTAMPDIFF(SECOND, created_at, completed_at)/86400.0 AS days
        FROM goals
        WHERE ${whereParts.join(" AND ")}
      `;

    const rows = await this.sequelize.query(sql, {
      replacements,
      type: this.sequelize.QueryTypes.SELECT,
    });

    const daysArr = (rows || [])
      .map((r) => Number(r.days))
      .filter((d) => Number.isFinite(d) && d >= 0);
    const count = daysArr.length;
    if (count === 0) {
      return {
        count: 0,
        mean_days: null,
        median_days: null,
        p90_days: null,
        histogram: histBuckets.map((b) => ({ bucket: b.key, count: 0 })),
      };
    }

    // mean
    const mean = daysArr.reduce((s, v) => s + v, 0) / count;

    // median and percentiles: sort
    const sorted = daysArr.slice().sort((a, b) => a - b);
    const median =
      count % 2 === 1
        ? sorted[(count - 1) / 2]
        : (sorted[count / 2 - 1] + sorted[count / 2]) / 2;

    // p90 (90th percentile): linear interpolation using rank = 0.9*(n-1)
    const rank = 0.9 * (count - 1);
    const lower = Math.floor(rank);
    const upper = Math.ceil(rank);
    const weight = rank - lower;
    const p90 =
      upper === lower
        ? sorted[rank]
        : sorted[lower] * (1 - weight) + sorted[upper] * weight;

    // histogram
    const histCounts = histBuckets.map((b) => 0);
    for (const d of sorted) {
      for (let i = 0; i < histBuckets.length; i++) {
        const b = histBuckets[i];
        if (d >= b.min && d <= b.max) {
          histCounts[i]++;
          break;
        }
      }
    }

    return {
      count,
      mean_days: Number(mean.toFixed(2)),
      median_days: Number(median.toFixed(2)),
      p90_days: Number(p90.toFixed(2)),
      histogram: histBuckets.map((b, i) => ({
        bucket: b.key,
        count: histCounts[i],
      })),
    };
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
   * @throws {Error} If data retrieval fails
   */
  async getStudentAnalyticsData(options = {}) {
    const {
      start_date = null,
      end_date = null,
      limit = 50,
      offset = 0,
    } = options;

    const whereParts = ["g.completed_at IS NOT NULL"];
    const replacements = { limit: Number(limit), offset: Number(offset) };
    if (start_date) {
      whereParts.push("g.completed_at >= :start");
      replacements.start = start_date;
    }
    if (end_date) {
      whereParts.push("g.completed_at <= :end");
      replacements.end = end_date;
    }

    const sql = `
      SELECT s.id AS student_id, s.name AS student_name, COUNT(*) AS completions,
        ROUND(AVG(TIMESTAMPDIFF(SECOND, g.created_at, g.completed_at))/86400,2) AS avg_days
      FROM goals g
      JOIN students s ON s.id = g.student_id
      WHERE ${whereParts.join(" AND ")}
      GROUP BY s.id, s.name
      ORDER BY completions DESC
      LIMIT :limit OFFSET :offset
    `;

    const rows = await this.sequelize.query(sql, {
      replacements,
      type: this.sequelize.QueryTypes.SELECT,
    });
    return rows;
  }
}
