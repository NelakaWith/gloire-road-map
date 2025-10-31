/**
 * @fileoverview Sequelize Points Repository Implementation
 * @description Concrete implementation of IPointsRepository using Sequelize ORM.
 * Handles all points-related database operations using MySQL through Sequelize.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import { Op, sequelize } from "sequelize";
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
   * @param {Object} pointsModel - Sequelize Points model
   * @param {Object} studentModel - Sequelize Student model
   * @param {Object} goalModel - Sequelize Goal model
   * @param {Object} sequelizeInstance - Sequelize instance for raw queries
   */
  constructor(pointsModel, studentModel, goalModel, sequelizeInstance) {
    super();
    this.pointsModel = pointsModel;
    this.studentModel = studentModel;
    this.goalModel = goalModel;
    this.sequelize = sequelizeInstance;
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
        type,
        includeStudent = false,
        orderBy = "transaction_date",
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
        whereClause.transaction_date = {
          [Op.between]: [startDate, endDate],
        };
      } else if (startDate) {
        whereClause.transaction_date = {
          [Op.gte]: startDate,
        };
      } else if (endDate) {
        whereClause.transaction_date = {
          [Op.lte]: endDate,
        };
      }

      if (type) {
        whereClause.type = type;
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

      const points = await this.pointsModel.findAll(queryOptions);
      return points.map((record) => record.toJSON());
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
      const { includeStudent = false, includeGoal = false } = options;

      const queryOptions = {
        where: { id },
      };

      const includes = [];

      if (includeStudent) {
        includes.push({
          model: this.studentModel,
          attributes: ["id", "name"],
          as: "student",
        });
      }

      if (includeGoal) {
        includes.push({
          model: this.goalModel,
          attributes: ["id", "title", "description"],
          as: "goal",
        });
      }

      if (includes.length > 0) {
        queryOptions.include = includes;
      }

      const points = await this.pointsModel.findByPk(id, queryOptions);
      return points ? points.toJSON() : null;
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
  async findByStudentId(studentId, options = {}) {
    try {
      const {
        startDate,
        endDate,
        type,
        orderBy = "transaction_date",
        orderDirection = "DESC",
        limit,
      } = options;

      const whereClause = { student_id: studentId };

      if (startDate && endDate) {
        whereClause.transaction_date = {
          [Op.between]: [startDate, endDate],
        };
      } else if (startDate) {
        whereClause.transaction_date = {
          [Op.gte]: startDate,
        };
      } else if (endDate) {
        whereClause.transaction_date = {
          [Op.lte]: endDate,
        };
      }

      if (type) {
        whereClause.type = type;
      }

      const queryOptions = {
        where: whereClause,
        order: [[orderBy, orderDirection]],
      };

      if (limit) {
        queryOptions.limit = limit;
      }

      const points = await this.pointsModel.findAll(queryOptions);
      return points.map((record) => record.toJSON());
    } catch (error) {
      throw new Error(`Failed to find points by student ID: ${error.message}`);
    }
  }

  /**
   * Find points transactions by type
   * @async
   * @param {string} type - Transaction type (earned, redeemed, bonus, penalty)
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Array of points transaction objects
   * @throws {Error} If database query fails
   */
  async findByType(type, options = {}) {
    try {
      const {
        studentId,
        startDate,
        endDate,
        includeStudent = false,
        limit,
      } = options;

      const whereClause = { type };

      if (studentId) {
        whereClause.student_id = studentId;
      }

      if (startDate && endDate) {
        whereClause.transaction_date = {
          [Op.between]: [startDate, endDate],
        };
      } else if (startDate) {
        whereClause.transaction_date = {
          [Op.gte]: startDate,
        };
      } else if (endDate) {
        whereClause.transaction_date = {
          [Op.lte]: endDate,
        };
      }

      const queryOptions = {
        where: whereClause,
        order: [["transaction_date", "DESC"]],
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

      if (limit) {
        queryOptions.limit = limit;
      }

      const points = await this.pointsModel.findAll(queryOptions);
      return points.map((record) => record.toJSON());
    } catch (error) {
      throw new Error(`Failed to find points by type: ${error.message}`);
    }
  }

  /**
   * Create a new points transaction
   * @async
   * @param {Object} pointsData - Points transaction data to create
   * @returns {Promise<Object>} Created points transaction object
   * @throws {Error} If points transaction creation fails
   */
  async create(pointsData) {
    try {
      const points = await this.pointsModel.create({
        student_id: pointsData.student_id,
        points: pointsData.points,
        type: pointsData.type,
        description: pointsData.description || null,
        goal_id: pointsData.goal_id || null,
        transaction_date: pointsData.transaction_date || new Date(),
        created_at: new Date(),
      });

      return points.toJSON();
    } catch (error) {
      throw new Error(`Failed to create points transaction: ${error.message}`);
    }
  }

  /**
   * Update a points transaction by ID
   * @async
   * @param {number} id - Points transaction ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated points transaction object or null if not found
   * @throws {Error} If update operation fails
   */
  async update(id, updates) {
    try {
      const [affectedRows] = await this.pointsModel.update(updates, {
        where: { id },
      });

      if (affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update points transaction: ${error.message}`);
    }
  }

  /**
   * Delete a points transaction by ID
   * @async
   * @param {number} id - Points transaction ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   * @throws {Error} If delete operation fails
   */
  async delete(id) {
    try {
      const deletedRows = await this.pointsModel.destroy({
        where: { id },
      });

      return deletedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete points transaction: ${error.message}`);
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
          dateConditions.push("transaction_date >= :startDate");
          replacements.startDate = startDate;
        }
        if (endDate) {
          dateConditions.push("transaction_date <= :endDate");
          replacements.endDate = endDate;
        }
        dateFilter = `AND ${dateConditions.join(" AND ")}`;
      }

      const sql = `
        SELECT
          SUM(CASE WHEN type IN ('earned', 'bonus') THEN points ELSE 0 END) as total_earned,
          SUM(CASE WHEN type IN ('redeemed', 'penalty') THEN points ELSE 0 END) as total_spent,
          SUM(CASE WHEN type IN ('earned', 'bonus') THEN points ELSE -points END) as current_balance,
          COUNT(*) as total_transactions,
          SUM(CASE WHEN type = 'earned' THEN points ELSE 0 END) as earned_points,
          SUM(CASE WHEN type = 'bonus' THEN points ELSE 0 END) as bonus_points,
          SUM(CASE WHEN type = 'redeemed' THEN points ELSE 0 END) as redeemed_points,
          SUM(CASE WHEN type = 'penalty' THEN points ELSE 0 END) as penalty_points
        FROM points
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
        breakdown: {
          earned_points: parseInt(result.earned_points) || 0,
          bonus_points: parseInt(result.bonus_points) || 0,
          redeemed_points: parseInt(result.redeemed_points) || 0,
          penalty_points: parseInt(result.penalty_points) || 0,
        },
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
          dateConditions.push("p.transaction_date >= :startDate");
          replacements.startDate = startDate;
        }
        if (endDate) {
          dateConditions.push("p.transaction_date <= :endDate");
          replacements.endDate = endDate;
        }
        dateFilter = `AND ${dateConditions.join(" AND ")}`;
      }

      const sql = `
        SELECT
          p.student_id,
          s.name as student_name,
          SUM(CASE WHEN p.type IN ('earned', 'bonus') THEN p.points ELSE -p.points END) as total_balance,
          SUM(CASE WHEN p.type = 'earned' THEN p.points ELSE 0 END) as earned_points,
          SUM(CASE WHEN p.type = 'bonus' THEN p.points ELSE 0 END) as bonus_points,
          COUNT(*) as total_transactions
        FROM points p
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
        earned_points: parseInt(row.earned_points),
        bonus_points: parseInt(row.bonus_points),
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
          dateConditions.push("transaction_date >= :startDate");
          replacements.startDate = startDate;
        }
        if (endDate) {
          dateConditions.push("transaction_date <= :endDate");
          replacements.endDate = endDate;
        }
        dateFilter = `WHERE ${dateConditions.join(" AND ")}`;
      }

      const sql = `
        SELECT
          COUNT(DISTINCT student_id) as active_students,
          COUNT(*) as total_transactions,
          SUM(CASE WHEN type IN ('earned', 'bonus') THEN points ELSE 0 END) as total_points_awarded,
          SUM(CASE WHEN type IN ('redeemed', 'penalty') THEN points ELSE 0 END) as total_points_spent,
          AVG(CASE WHEN type IN ('earned', 'bonus') THEN points ELSE 0 END) as avg_points_per_transaction,
          SUM(CASE WHEN type = 'earned' THEN points ELSE 0 END) as earned_points,
          SUM(CASE WHEN type = 'bonus' THEN points ELSE 0 END) as bonus_points,
          SUM(CASE WHEN type = 'redeemed' THEN points ELSE 0 END) as redeemed_points,
          SUM(CASE WHEN type = 'penalty' THEN points ELSE 0 END) as penalty_points
        FROM points
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
        breakdown: {
          earned_points: parseInt(result.earned_points) || 0,
          bonus_points: parseInt(result.bonus_points) || 0,
          redeemed_points: parseInt(result.redeemed_points) || 0,
          penalty_points: parseInt(result.penalty_points) || 0,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to get aggregated points stats: ${error.message}`
      );
    }
  }

  /**
   * Count points transactions with optional filters
   * @async
   * @param {Object} [filters] - Filters to apply
   * @returns {Promise<number>} Total count of points transactions
   * @throws {Error} If count operation fails
   */
  async count(filters = {}) {
    try {
      const whereClause = {};

      if (filters.studentId) {
        whereClause.student_id = filters.studentId;
      }

      if (filters.type) {
        whereClause.type = filters.type;
      }

      if (filters.startDate && filters.endDate) {
        whereClause.transaction_date = {
          [Op.between]: [filters.startDate, filters.endDate],
        };
      } else if (filters.startDate) {
        whereClause.transaction_date = {
          [Op.gte]: filters.startDate,
        };
      } else if (filters.endDate) {
        whereClause.transaction_date = {
          [Op.lte]: filters.endDate,
        };
      }

      return await this.pointsModel.count({ where: whereClause });
    } catch (error) {
      throw new Error(`Failed to count points transactions: ${error.message}`);
    }
  }

  /**
   * Award points to a student for goal completion
   * @async
   * @param {number} studentId - Student ID
   * @param {number} goalId - Goal ID
   * @param {number} basePoints - Base points for completion
   * @param {boolean} onTime - Whether goal was completed on time
   * @returns {Promise<Array<Object>>} Array of created points transactions
   * @throws {Error} If award operation fails
   */
  async awardGoalPoints(studentId, goalId, basePoints = 2, onTime = false) {
    try {
      const transactions = [];

      // Award base points for completion
      const baseTransaction = await this.create({
        student_id: studentId,
        goal_id: goalId,
        points: basePoints,
        type: "earned",
        description: "Goal completion points",
        transaction_date: new Date(),
      });
      transactions.push(baseTransaction);

      // Award bonus points if completed on time
      if (onTime) {
        const bonusTransaction = await this.create({
          student_id: studentId,
          goal_id: goalId,
          points: 3,
          type: "bonus",
          description: "On-time completion bonus",
          transaction_date: new Date(),
        });
        transactions.push(bonusTransaction);
      }

      return transactions;
    } catch (error) {
      throw new Error(`Failed to award goal points: ${error.message}`);
    }
  }

  /**
   * Redeem points for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {number} pointsToRedeem - Number of points to redeem
   * @param {string} description - Description of redemption
   * @returns {Promise<Object|null>} Created redemption transaction or null if insufficient balance
   * @throws {Error} If redemption operation fails
   */
  async redeemPoints(studentId, pointsToRedeem, description) {
    try {
      // Check current balance
      const balance = await this.getStudentBalance(studentId);

      if (balance.current_balance < pointsToRedeem) {
        return null; // Insufficient balance
      }

      const transaction = await this.create({
        student_id: studentId,
        points: pointsToRedeem,
        type: "redeemed",
        description: description,
        transaction_date: new Date(),
      });

      return transaction;
    } catch (error) {
      throw new Error(`Failed to redeem points: ${error.message}`);
    }
  }

  /**
   * Get recent points activity for analytics
   * @async
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Recent points transactions
   * @throws {Error} If query fails
   */
  async getRecentActivity(options = {}) {
    try {
      const { limit = 20, studentId, days = 30 } = options;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      return await this.findAll({
        studentId,
        startDate,
        includeStudent: true,
        limit,
        orderBy: "transaction_date",
        orderDirection: "DESC",
      });
    } catch (error) {
      throw new Error(`Failed to get recent points activity: ${error.message}`);
    }
  }

  /**
   * Bulk create points transactions
   * @async
   * @param {Array<Object>} pointsData - Array of points transaction data
   * @returns {Promise<Array<Object>>} Array of created points transactions
   * @throws {Error} If bulk creation fails
   */
  async bulkCreate(pointsData) {
    try {
      const transactions = await this.pointsModel.bulkCreate(
        pointsData.map((data) => ({
          ...data,
          transaction_date: data.transaction_date || new Date(),
          created_at: new Date(),
        })),
        {
          returning: true,
        }
      );

      return transactions.map((transaction) => transaction.toJSON());
    } catch (error) {
      throw new Error(
        `Failed to bulk create points transactions: ${error.message}`
      );
    }
  }
}
