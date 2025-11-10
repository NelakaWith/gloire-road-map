/**
 * @fileoverview Sequelize Goal Repository Implementation
 * @description Concrete implementation of IGoalRepository using Sequelize ORM.
 * Handles all goal-related database operations using MySQL through Sequelize.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { Op } from "sequelize";
import { IGoalRepository } from "../interfaces/repositories/IGoalRepository.js";

/**
 * Sequelize implementation of Goal repository
 * @class SequelizeGoalRepository
 * @extends IGoalRepository
 * @description Provides goal data access operations using Sequelize ORM
 */
export class SequelizeGoalRepository extends IGoalRepository {
  /**
   * Constructor for SequelizeGoalRepository
   * @param {Object} goalModel - Sequelize Goal model
   * @param {Object} studentModel - Sequelize Student model
   * @param {Object} pointsLogModel - Sequelize PointsLog model
   * @param {Object} sequelize - Sequelize instance for raw queries
   */
  constructor(goalModel, studentModel, pointsLogModel, sequelize) {
    super();
    this.goalModel = goalModel;
    this.studentModel = studentModel;
    this.pointsLogModel = pointsLogModel;
    this.sequelize = sequelize;
  }

  /**
   * Create a new goal
   * @async
   * @param {Object} goalData - Goal data to create
   * @returns {Promise<Object>} Created goal object
   * @throws {Error} If goal creation fails
   */
  async create(goalData) {
    try {
      const goal = await this.goalModel.create({
        student_id: goalData.student_id,
        title: goalData.title,
        description: goalData.description || null,
        target_date: goalData.target_date || null,
        setup_date: new Date(),
        created_at: new Date(),
      });

      return goal.toJSON();
    } catch (error) {
      throw new Error(`Failed to create goal: ${error.message}`);
    }
  }

  /**
   * Find a goal by its ID
   * @async
   * @param {number} id - Goal ID
   * @returns {Promise<Object|null>} Goal object or null if not found
   * @throws {Error} If database query fails
   */
  async findById(id) {
    try {
      const goal = await this.goalModel.findByPk(id, {
        include: [
          {
            model: this.studentModel,
            attributes: ["id", "name"],
          },
        ],
      });

      return goal ? goal.toJSON() : null;
    } catch (error) {
      throw new Error(`Failed to find goal by ID: ${error.message}`);
    }
  }

  /**
   * Find all goals for a specific student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Array of goal objects
   * @throws {Error} If database query fails
   */
  async findByStudentId(studentId, options = {}) {
    try {
      const {
        includeCompleted = true,
        orderBy = "created_at",
        orderDirection = "DESC",
      } = options;

      const whereClause = { student_id: studentId };

      if (!includeCompleted) {
        whereClause.is_completed = false;
      }

      const goals = await this.goalModel.findAll({
        where: whereClause,
        include: [
          {
            model: this.studentModel,
            attributes: ["id", "name"],
          },
        ],
        order: [[orderBy, orderDirection]],
      });

      return goals.map((goal) => goal.toJSON());
    } catch (error) {
      throw new Error(`Failed to find goals by student ID: ${error.message}`);
    }
  }

  /**
   * Find completed goals with optional filtering
   * @async
   * @param {Object} [filters] - Filter criteria
   * @returns {Promise<Array<Object>>} Array of completed goal objects
   * @throws {Error} If database query fails
   */
  async findCompleted(filters = {}) {
    try {
      const whereClause = { is_completed: true };

      if (filters.studentId) {
        whereClause.student_id = filters.studentId;
      }

      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        if (start && end) {
          whereClause.completed_at = {
            [Op.between]: [start, end],
          };
        } else if (start) {
          whereClause.completed_at = {
            [Op.gte]: start,
          };
        } else if (end) {
          whereClause.completed_at = {
            [Op.lte]: end,
          };
        }
      }

      const queryOptions = {
        where: whereClause,
        include: [
          {
            model: this.studentModel,
            attributes: ["id", "name"],
          },
        ],
        order: [["completed_at", "DESC"]],
      };

      if (filters.limit) {
        queryOptions.limit = filters.limit;
      }

      if (filters.offset) {
        queryOptions.offset = filters.offset;
      }

      const goals = await this.goalModel.findAll(queryOptions);
      return goals.map((goal) => goal.toJSON());
    } catch (error) {
      throw new Error(`Failed to find completed goals: ${error.message}`);
    }
  }

  /**
   * Update a goal by ID
   * @async
   * @param {number} id - Goal ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated goal object or null if not found
   * @throws {Error} If update operation fails
   */
  async update(id, updates) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date(),
      };

      const [affectedRows] = await this.goalModel.update(updateData, {
        where: { id },
      });

      if (affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update goal: ${error.message}`);
    }
  }

  /**
   * Delete a goal by ID
   * @async
   * @param {number} id - Goal ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   * @throws {Error} If delete operation fails
   */
  async delete(id) {
    try {
      const deletedRows = await this.goalModel.destroy({
        where: { id },
      });

      return deletedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete goal: ${error.message}`);
    }
  }

  /**
   * Count total goals
   * @async
   * @param {Object} [filters] - Optional filters
   * @returns {Promise<number>} Total count of goals
   * @throws {Error} If count operation fails
   */
  async countAll(filters = {}) {
    try {
      const whereClause = {};

      if (filters.studentId) {
        whereClause.student_id = filters.studentId;
      }

      if (filters.completedOnly) {
        whereClause.is_completed = true;
      }

      return await this.goalModel.count({
        where: whereClause,
      });
    } catch (error) {
      throw new Error(`Failed to count goals: ${error.message}`);
    }
  }

  /**
   * Count completed goals within date range
   * @async
   * @param {Object} [dateRange] - Date range filter
   * @returns {Promise<number>} Count of completed goals
   * @throws {Error} If count operation fails
   */
  async countCompleted(dateRange = {}) {
    try {
      const whereClause = { is_completed: true };

      if (dateRange.start && dateRange.end) {
        whereClause.completed_at = {
          [Op.between]: [dateRange.start, dateRange.end],
        };
      } else if (dateRange.start) {
        whereClause.completed_at = {
          [Op.gte]: dateRange.start,
        };
      } else if (dateRange.end) {
        whereClause.completed_at = {
          [Op.lte]: dateRange.end,
        };
      }

      return await this.goalModel.count({
        where: whereClause,
      });
    } catch (error) {
      throw new Error(`Failed to count completed goals: ${error.message}`);
    }
  }

  /**
   * Calculate average completion time for goals
   * @async
   * @param {Object} [dateRange] - Date range filter
   * @returns {Promise<number|null>} Average days to complete or null if no data
   * @throws {Error} If calculation fails
   */
  async getAverageCompletionTime(dateRange = {}) {
    try {
      const whereParts = ["completed_at IS NOT NULL", "created_at IS NOT NULL"];
      const replacements = {};

      if (dateRange.start) {
        whereParts.push("completed_at >= :start");
        replacements.start = dateRange.start;
      }

      if (dateRange.end) {
        whereParts.push("completed_at <= :end");
        replacements.end = dateRange.end;
      }

      const sql = `
        SELECT ROUND(AVG(GREATEST(TIMESTAMPDIFF(SECOND, created_at, completed_at), 0))/86400, 2) as avg_days
        FROM goals
        WHERE ${whereParts.join(" AND ")}
      `;

      const [results] = await this.sequelize.query(sql, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      });

      return results.length > 0 ? results[0].avg_days : null;
    } catch (error) {
      throw new Error(
        `Failed to calculate average completion time: ${error.message}`
      );
    }
  }

  /**
   * Get goals for analytics (throughput, time-to-complete, etc.)
   * @async
   * @param {Object} [filters] - Filter criteria
   * @returns {Promise<Array<Object>>} Goals data for analytics
   * @throws {Error} If query fails
   */
  async getForAnalytics(filters = {}) {
    try {
      const whereClause = {};

      if (filters.startDate) {
        whereClause.created_at = {
          [Op.gte]: filters.startDate,
        };
      }

      if (filters.endDate) {
        if (whereClause.created_at) {
          whereClause.created_at[Op.lte] = filters.endDate;
        } else {
          whereClause.created_at = {
            [Op.lte]: filters.endDate,
          };
        }
      }

      const goals = await this.goalModel.findAll({
        where: whereClause,
        attributes: [
          "id",
          "student_id",
          "title",
          "is_completed",
          "created_at",
          "completed_at",
          "target_date",
        ],
        include: [
          {
            model: this.studentModel,
            attributes: ["id", "name"],
          },
        ],
        order: [["created_at", "ASC"]],
      });

      return goals.map((goal) => goal.toJSON());
    } catch (error) {
      throw new Error(`Failed to get goals for analytics: ${error.message}`);
    }
  }

  /**
   * Get goal completion statistics by student
   * @async
   * @param {Object} [filters] - Filter criteria
   * @returns {Promise<Array<Object>>} Student completion statistics
   * @throws {Error} If query fails
   */
  async getCompletionStatsByStudent(filters = {}) {
    try {
      const whereParts = ["g.completed_at IS NOT NULL"];
      const replacements = {
        limit: Number(filters.limit || 50),
        offset: Number(filters.offset || 0),
      };

      if (filters.startDate) {
        whereParts.push("g.completed_at >= :start");
        replacements.start = filters.startDate;
      }

      if (filters.endDate) {
        whereParts.push("g.completed_at <= :end");
        replacements.end = filters.endDate;
      }

      const sql = `
        SELECT
          s.id AS student_id,
          s.name AS student_name,
          COUNT(*) AS completions,
          ROUND(AVG(TIMESTAMPDIFF(SECOND, g.created_at, g.completed_at))/86400, 2) AS avg_days
        FROM goals g
        JOIN students s ON s.id = g.student_id
        WHERE ${whereParts.join(" AND ")}
        GROUP BY s.id, s.name
        ORDER BY completions DESC
        LIMIT :limit OFFSET :offset
      `;

      const results = await this.sequelize.query(sql, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      });

      return results;
    } catch (error) {
      throw new Error(
        `Failed to get completion stats by student: ${error.message}`
      );
    }
  }
}
