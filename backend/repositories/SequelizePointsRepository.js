/**
 * @fileoverview Sequelize Points Repository Implementation
 * @description Concrete implementation of IPointsRepository using Sequelize ORM.
 * Handles all points-related database operations using MySQL through Sequelize.
 * @author @NelakaWith
 * @version 1.0.0
 */

import Sequelize, { Op } from "sequelize";
import { IPointsRepository } from "../interfaces/repositories/IPointsRepository.js";

/**
 * Sequelize implementation of Points repository
 * @class SequelizePointsRepository
 * @extends IPointsRepository
 * @description Provides points data access operations using Sequelize ORM
 */
export class SequelizePointsRepository extends IPointsRepository {
  /**
   * Constructor for SequelizePointsRepository
   * @param {Object} pointsLogModel - Sequelize PointsLog model
   * @param {Object} studentModel - Sequelize Student model
   * @param {Object} goalModel - Sequelize Goal model
   * @param {Object} sequelizeInstance - Sequelize instance for raw queries
   */
  constructor(pointsLogModel, studentModel, goalModel, sequelizeInstance) {
    super();
    this.pointsLogModel = pointsLogModel;
    this.studentModel = studentModel;
    this.goalModel = goalModel;
    this.sequelize = sequelizeInstance;
  }

  /**
   * Create a new points log entry
   * @async
   * @param {Object} pointsData - Points log data to create
   * @returns {Promise<Object>} Created points log entry
   * @throws {Error} If points log creation fails
   */
  async createPointsLog(pointsData) {
    try {
      const pointsLog = await this.pointsLogModel.create({
        student_id: pointsData.student_id,
        points: pointsData.points,
        reason: pointsData.reason || null,
        related_goal_id: pointsData.related_goal_id || null,
        created_at: new Date(),
      });

      return pointsLog.toJSON();
    } catch (error) {
      throw new Error(`Failed to create points log: ${error.message}`);
    }
  }

  /**
   * Find all points transactions with optional filtering
   * @async
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Array of points transaction objects
   * @throws {Error} If database query fails
   */
  async findAll(options = {}) {
    try {
      const {
        studentId,
        startDate,
        endDate,
        includeStudent = false,
        orderBy = "created_at",
        orderDirection = "DESC",
        limit,
        offset,
      } = options;

      const whereClause = {};
      const queryOptions = {
        where: whereClause,
        order: [[orderBy, orderDirection]],
      };

      if (studentId) {
        whereClause.student_id = studentId;
      }

      if (startDate && endDate) {
        whereClause.created_at = {
          [Op.between]: [startDate, endDate],
        };
      } else if (startDate) {
        whereClause.created_at = {
          [Op.gte]: startDate,
        };
      } else if (endDate) {
        whereClause.created_at = {
          [Op.lte]: endDate,
        };
      }

      if (includeStudent) {
        queryOptions.include = [
          {
            model: this.studentModel,
            attributes: ["id", "name"],
            as: "student",
          },
        ];
      }

      if (limit) {
        queryOptions.limit = limit;
      }

      if (offset) {
        queryOptions.offset = offset;
      }

      const pointsLogs = await this.pointsLogModel.findAll(queryOptions);
      return pointsLogs.map((record) => record.toJSON());
    } catch (error) {
      throw new Error(
        `Failed to find all points transactions: ${error.message}`
      );
    }
  }

  /**
   * Find a points transaction by ID
   * @async
   * @param {number} id - Points transaction ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object|null>} Points transaction object or null if not found
   * @throws {Error} If database query fails
   */
  async findById(id, options = {}) {
    try {
      const { includeStudent = false } = options;

      const queryOptions = {
        where: { id },
      };

      if (includeStudent) {
        queryOptions.include = [
          {
            model: this.studentModel,
            attributes: ["id", "name"],
            as: "student",
          },
        ];
      }

      const pointsLog = await this.pointsLogModel.findByPk(id, queryOptions);
      return pointsLog ? pointsLog.toJSON() : null;
    } catch (error) {
      throw new Error(
        `Failed to find points transaction by ID: ${error.message}`
      );
    }
  }

  /**
   * Find points transactions by student ID
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Array of points transaction objects
   * @throws {Error} If database query fails
   */
  async findPointsLogByStudent(studentId, options = {}) {
    try {
      const {
        startDate,
        endDate,
        orderBy = "created_at",
        orderDirection = "DESC",
        limit,
        offset,
      } = options;

      const whereClause = { student_id: studentId };

      if (startDate && endDate) {
        whereClause.created_at = {
          [Op.between]: [startDate, endDate],
        };
      } else if (startDate) {
        whereClause.created_at = {
          [Op.gte]: startDate,
        };
      } else if (endDate) {
        whereClause.created_at = {
          [Op.lte]: endDate,
        };
      }

      const queryOptions = {
        where: whereClause,
        order: [[orderBy, orderDirection]],
      };

      if (limit) {
        queryOptions.limit = limit;
      }

      if (offset) {
        queryOptions.offset = offset;
      }

      const pointsLogs = await this.pointsLogModel.findAll(queryOptions);
      return pointsLogs.map((record) => record.toJSON());
    } catch (error) {
      throw new Error(`Failed to find points by student ID: ${error.message}`);
    }
  }

  /**
   * Find points transactions by goal ID
   * @async
   * @param {number} goalId - Goal ID
   * @returns {Promise<Array<Object>>} Array of points transaction objects
   * @throws {Error} If database query fails
   */
  async findPointsLogByGoal(goalId) {
    try {
      const pointsLogs = await this.pointsLogModel.findAll({
        where: { related_goal_id: goalId },
        order: [["created_at", "DESC"]],
      });

      return pointsLogs.map((record) => record.toJSON());
    } catch (error) {
      throw new Error(`Failed to find points by goal ID: ${error.message}`);
    }
  }

  /**
   * Calculate total points for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Calculation options
   * @returns {Promise<number>} Total points earned by the student
   * @throws {Error} If calculation fails
   */
  async calculateTotalPoints(studentId, options = {}) {
    try {
      const { startDate, endDate } = options;
      const replacements = { studentId };

      let dateFilter = "";
      if (startDate || endDate) {
        const dateConditions = [];
        if (startDate) {
          dateConditions.push("created_at >= :startDate");
          replacements.startDate = startDate;
        }
        if (endDate) {
          dateConditions.push("created_at <= :endDate");
          replacements.endDate = endDate;
        }
        dateFilter = `AND ${dateConditions.join(" AND ")}`;
      }

      const sql = `
        SELECT COALESCE(SUM(points), 0) as total_points
        FROM points_log
        WHERE student_id = :studentId ${dateFilter}
      `;

      const [result] = await this.sequelize.query(sql, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      });

      return parseInt(result.total_points) || 0;
    } catch (error) {
      throw new Error(`Failed to calculate total points: ${error.message}`);
    }
  }

  /**
   * Update student's total points in the student record
   * @async
   * @param {number} studentId - Student ID
   * @param {number} newTotalPoints - New total points value
   * @returns {Promise<boolean>} True if update was successful
   * @throws {Error} If update operation fails
   */
  async updateStudentPoints(studentId, newTotalPoints) {
    try {
      const [affectedRows] = await this.studentModel.update(
        { points: newTotalPoints },
        { where: { id: studentId } }
      );

      return affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update student points: ${error.message}`);
    }
  }

  /**
   * Delete a points log entry by ID
   * @async
   * @param {number} id - Points log ID to delete
   * @returns {Promise<boolean>} True if deletion was successful
   * @throws {Error} If deletion operation fails
   */
  async delete(id) {
    try {
      const affectedRows = await this.pointsLogModel.destroy({
        where: { id },
      });

      return affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete points log entry: ${error.message}`);
    }
  }

  /**
   * Get total points balance for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Points balance and breakdown
   * @throws {Error} If query fails
   */
  async getStudentBalance(studentId, dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      const replacements = { studentId };

      let dateFilter = "";
      if (startDate || endDate) {
        const dateConditions = [];
        if (startDate) {
          dateConditions.push("created_at >= :startDate");
          replacements.startDate = startDate;
        }
        if (endDate) {
          dateConditions.push("created_at <= :endDate");
          replacements.endDate = endDate;
        }
        dateFilter = `AND ${dateConditions.join(" AND ")}`;
      }

      const sql = `
        SELECT
          SUM(CASE WHEN points > 0 THEN points ELSE 0 END) as total_earned,
          SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END) as total_spent,
          SUM(points) as current_balance,
          COUNT(*) as total_transactions
        FROM points_log
        WHERE student_id = :studentId ${dateFilter}
      `;

      const [result] = await this.sequelize.query(sql, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      });

      return {
        student_id: studentId,
        total_earned: parseInt(result.total_earned) || 0,
        total_spent: parseInt(result.total_spent) || 0,
        current_balance: parseInt(result.current_balance) || 0,
        total_transactions: parseInt(result.total_transactions) || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get student points balance: ${error.message}`);
    }
  }

  /**
   * Get points leaderboard
   * @async
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Students ordered by points balance
   * @throws {Error} If query fails
   */
  async getLeaderboard(options = {}) {
    try {
      const { limit = 10, startDate, endDate } = options;
      const replacements = { limit };

      let dateFilter = "";
      if (startDate || endDate) {
        const dateConditions = [];
        if (startDate) {
          dateConditions.push("p.created_at >= :startDate");
          replacements.startDate = startDate;
        }
        if (endDate) {
          dateConditions.push("p.created_at <= :endDate");
          replacements.endDate = endDate;
        }
        dateFilter = `AND ${dateConditions.join(" AND ")}`;
      }

      const sql = `
        SELECT
          p.student_id,
          s.name as student_name,
          SUM(p.points) as total_balance,
          COUNT(*) as total_transactions
        FROM points_log p
        JOIN students s ON p.student_id = s.id
        WHERE 1=1 ${dateFilter}
        GROUP BY p.student_id, s.name
        ORDER BY total_balance DESC, s.name ASC
        LIMIT :limit
      `;

      const results = await this.sequelize.query(sql, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      });

      return results.map((row) => ({
        student_id: row.student_id,
        student_name: row.student_name,
        total_balance: parseInt(row.total_balance),
        total_transactions: parseInt(row.total_transactions),
      }));
    } catch (error) {
      throw new Error(`Failed to get points leaderboard: ${error.message}`);
    }
  }

  /**
   * Get points statistics for all students
   * @async
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Aggregated points statistics
   * @throws {Error} If query fails
   */
  async getAggregatedStats(dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      const replacements = {};

      let dateFilter = "";
      if (startDate || endDate) {
        const dateConditions = [];
        if (startDate) {
          dateConditions.push("created_at >= :startDate");
          replacements.startDate = startDate;
        }
        if (endDate) {
          dateConditions.push("created_at <= :endDate");
          replacements.endDate = endDate;
        }
        dateFilter = `WHERE ${dateConditions.join(" AND ")}`;
      }

      const sql = `
        SELECT
          COUNT(DISTINCT student_id) as active_students,
          COUNT(*) as total_transactions,
          SUM(CASE WHEN points > 0 THEN points ELSE 0 END) as total_points_awarded,
          SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END) as total_points_spent,
          AVG(ABS(points)) as avg_points_per_transaction,
          SUM(CASE WHEN points > 0 THEN points ELSE 0 END) as earned_points
        FROM points_log
        ${dateFilter}
      `;

      const [result] = await this.sequelize.query(sql, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      });

      return {
        active_students: parseInt(result.active_students) || 0,
        total_transactions: parseInt(result.total_transactions) || 0,
        total_points_awarded: parseInt(result.total_points_awarded) || 0,
        total_points_spent: parseInt(result.total_points_spent) || 0,
        net_points_balance:
          (parseInt(result.total_points_awarded) || 0) -
          (parseInt(result.total_points_spent) || 0),
        avg_points_per_transaction:
          parseFloat(result.avg_points_per_transaction) || 0,
      };
    } catch (error) {
      throw new Error(
        `Failed to get aggregated points stats: ${error.message}`
      );
    }
  }

  /**
   * Count points log entries, optionally filtered by student
   * @async
   * @param {Object} options - Query options
   * @param {number} options.studentId - Optional student ID to filter
   * @returns {Promise<number>} Count of matching points log entries
   * @throws {Error} If count operation fails
   */
  async count(options = {}) {
    try {
      const whereClause = {};

      if (options.studentId) {
        whereClause.student_id = options.studentId;
      }

      return await this.pointsLogModel.count({ where: whereClause });
    } catch (error) {
      throw new Error(`Failed to count points logs: ${error.message}`);
    }
  }

  /**
   * Award points to a student for completing a goal
   * @async
   * @param {number} studentId - Student ID
   * @param {number} pointsToAward - Points to award
   * @param {number} goalId - Goal ID that was completed
   * @returns {Promise<Object>} Created points log entry
   * @throws {Error} If operation fails
   */
  async awardGoalPoints(studentId, pointsToAward, goalId) {
    try {
      return await this.createPointsLog({
        student_id: studentId,
        points: pointsToAward,
        reason: "Goal completion",
        related_goal_id: goalId,
      });
    } catch (error) {
      throw new Error(`Failed to award goal points: ${error.message}`);
    }
  }

  /**
   * Redeem points for a student (deduct from total)
   * @async
   * @param {number} studentId - Student ID
   * @param {number} pointsToRedeem - Points to redeem
   * @param {string} reason - Reason for redemption
   * @returns {Promise<Object>} Created points log entry with negative points
   * @throws {Error} If operation fails
   */
  async redeemPoints(studentId, pointsToRedeem, reason = "Points redemption") {
    try {
      return await this.createPointsLog({
        student_id: studentId,
        points: -pointsToRedeem,
        reason,
        related_goal_id: null,
      });
    } catch (error) {
      throw new Error(`Failed to redeem points: ${error.message}`);
    }
  }

  /**
   * Get recent points activity for analytics
   * @async
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Recent points log entries
   * @throws {Error} If query fails
   */
  async getRecentActivity(options = {}) {
    try {
      const { limit = 20, studentId, days = 30 } = options;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const whereClause = { created_at: { [Op.gte]: startDate } };
      if (studentId) {
        whereClause.student_id = studentId;
      }

      return await this.pointsLogModel.findAll({
        where: whereClause,
        include: [
          {
            model: this.studentModel,
            attributes: ["id", "name"],
            required: false,
          },
        ],
        order: [["created_at", "DESC"]],
        limit,
        raw: false,
      });
    } catch (error) {
      throw new Error(`Failed to get recent points activity: ${error.message}`);
    }
  }

  /**
   * Bulk create points log entries
   * @async
   * @param {Array<Object>} pointsData - Array of points log data
   * @returns {Promise<Array<Object>>} Array of created points log entries
   * @throws {Error} If bulk creation fails
   */
  async bulkCreate(pointsData) {
    try {
      const transactions = await this.pointsLogModel.bulkCreate(
        pointsData.map((data) => ({
          student_id: data.student_id,
          points: data.points,
          reason: data.reason || null,
          related_goal_id: data.related_goal_id || null,
          created_at: data.created_at || new Date(),
        })),
        {
          returning: true,
        }
      );

      return transactions.map((transaction) => transaction.toJSON());
    } catch (error) {
      throw new Error(
        `Failed to bulk create points log entries: ${error.message}`
      );
    }
  }
}
