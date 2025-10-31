/**
 * @fileoverview Sequelize Student Repository Implementation
 * @description Concrete implementation of IStudentRepository using Sequelize ORM.
 * Handles all student-related database operations using MySQL through Sequelize.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import { Op, sequelize } from "sequelize";
import { IStudentRepository } from "../interfaces/repositories/IStudentRepository.js";

/**
 * Sequelize implementation of Student repository
 * @class SequelizeStudentRepository
 * @extends IStudentRepository
 * @description Provides student data access operations using Sequelize ORM
 */
export class SequelizeStudentRepository extends IStudentRepository {
  /**
   * Constructor for SequelizeStudentRepository
   * @param {Object} studentModel - Sequelize Student model
   * @param {Object} goalModel - Sequelize Goal model
   * @param {Object} attendanceModel - Sequelize Attendance model
   * @param {Object} sequelizeInstance - Sequelize instance for raw queries
   */
  constructor(studentModel, goalModel, attendanceModel, sequelizeInstance) {
    super();
    this.studentModel = studentModel;
    this.goalModel = goalModel;
    this.attendanceModel = attendanceModel;
    this.sequelize = sequelizeInstance;
  }

  /**
   * Find all students with optional filtering and statistics
   * @async
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Array of student objects
   * @throws {Error} If database query fails
   */
  async findAll(options = {}) {
    try {
      const {
        includeAttendanceStats = false,
        includeGoalStats = false,
        orderBy = "name",
        orderDirection = "ASC",
        limit,
        offset,
      } = options;

      const queryOptions = {
        attributes: [
          "id",
          "name",
          "contact_number",
          "address",
          "date_of_birth",
          "points",
          "created_at",
        ],
        order: [[orderBy, orderDirection]],
      };

      if (includeAttendanceStats) {
        queryOptions.attributes.include = [
          [
            this.sequelize.literal(
              '(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id AND attendance.status = "present")'
            ),
            "days_attended",
          ],
          [
            this.sequelize.literal(
              "(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id)"
            ),
            "total_attendance_records",
          ],
        ];
      }

      if (includeGoalStats) {
        queryOptions.attributes.include = [
          ...(queryOptions.attributes.include || []),
          [
            this.sequelize.literal(
              "(SELECT COUNT(*) FROM goals WHERE goals.student_id = Student.id)"
            ),
            "total_goals",
          ],
          [
            this.sequelize.literal(
              "(SELECT COUNT(*) FROM goals WHERE goals.student_id = Student.id AND goals.is_completed = 1)"
            ),
            "completed_goals",
          ],
        ];
      }

      if (limit) {
        queryOptions.limit = limit;
      }

      if (offset) {
        queryOptions.offset = offset;
      }

      const students = await this.studentModel.findAll(queryOptions);
      return students.map((student) => student.toJSON());
    } catch (error) {
      throw new Error(`Failed to find all students: ${error.message}`);
    }
  }

  /**
   * Find a student by ID
   * @async
   * @param {number} id - Student ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object|null>} Student object or null if not found
   * @throws {Error} If database query fails
   */
  async findById(id, options = {}) {
    try {
      const { includeAttendanceStats = false, includeGoalStats = false } =
        options;

      const queryOptions = {
        where: { id },
      };

      if (includeAttendanceStats || includeGoalStats) {
        queryOptions.attributes = {
          include: [],
        };

        if (includeAttendanceStats) {
          queryOptions.attributes.include.push(
            [
              this.sequelize.literal(
                '(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id AND attendance.status = "present")'
              ),
              "days_attended",
            ],
            [
              this.sequelize.literal(
                '(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id AND attendance.status = "absent")'
              ),
              "days_absent",
            ],
            [
              this.sequelize.literal(
                '(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id AND attendance.status = "late")'
              ),
              "days_late",
            ],
            [
              this.sequelize.literal(
                '(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id AND attendance.status = "excused")'
              ),
              "days_excused",
            ],
            [
              this.sequelize.literal(
                "(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id)"
              ),
              "total_attendance_records",
            ]
          );
        }

        if (includeGoalStats) {
          queryOptions.attributes.include.push(
            [
              this.sequelize.literal(
                "(SELECT COUNT(*) FROM goals WHERE goals.student_id = Student.id)"
              ),
              "total_goals",
            ],
            [
              this.sequelize.literal(
                "(SELECT COUNT(*) FROM goals WHERE goals.student_id = Student.id AND goals.is_completed = 1)"
              ),
              "completed_goals",
            ]
          );
        }
      }

      const student = await this.studentModel.findByPk(id, queryOptions);
      return student ? student.toJSON() : null;
    } catch (error) {
      throw new Error(`Failed to find student by ID: ${error.message}`);
    }
  }

  /**
   * Create a new student
   * @async
   * @param {Object} studentData - Student data to create
   * @returns {Promise<Object>} Created student object
   * @throws {Error} If student creation fails
   */
  async create(studentData) {
    try {
      const student = await this.studentModel.create({
        name: studentData.name,
        contact_number: studentData.contact_number || null,
        address: studentData.address || null,
        date_of_birth: studentData.date_of_birth || null,
        points: studentData.points || 0,
        created_at: new Date(),
      });

      return student.toJSON();
    } catch (error) {
      throw new Error(`Failed to create student: ${error.message}`);
    }
  }

  /**
   * Update a student by ID
   * @async
   * @param {number} id - Student ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated student object or null if not found
   * @throws {Error} If update operation fails
   */
  async update(id, updates) {
    try {
      const [affectedRows] = await this.studentModel.update(updates, {
        where: { id },
      });

      if (affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update student: ${error.message}`);
    }
  }

  /**
   * Delete a student by ID
   * @async
   * @param {number} id - Student ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   * @throws {Error} If delete operation fails
   */
  async delete(id) {
    try {
      const deletedRows = await this.studentModel.destroy({
        where: { id },
      });

      return deletedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete student: ${error.message}`);
    }
  }

  /**
   * Find student with comprehensive attendance statistics
   * @async
   * @param {number} id - Student ID
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object|null>} Student with attendance stats or null if not found
   * @throws {Error} If database query fails
   */
  async findWithAttendanceStats(id, dateRange = {}) {
    try {
      return await this.findById(id, { includeAttendanceStats: true });
    } catch (error) {
      throw new Error(
        `Failed to find student with attendance stats: ${error.message}`
      );
    }
  }

  /**
   * Get students with goal completion statistics
   * @async
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Students with goal statistics
   * @throws {Error} If database query fails
   */
  async findWithGoalStats(options = {}) {
    try {
      const {
        startDate,
        endDate,
        limit,
        offset,
        orderBy = "total_goals",
        orderDirection = "DESC",
      } = options;

      let dateFilter = "";
      const replacements = {};

      if (startDate || endDate) {
        const dateConditions = [];
        if (startDate) {
          dateConditions.push("g.created_at >= :startDate");
          replacements.startDate = startDate;
        }
        if (endDate) {
          dateConditions.push("g.created_at <= :endDate");
          replacements.endDate = endDate;
        }
        dateFilter = `AND ${dateConditions.join(" AND ")}`;
      }

      const sql = `
        SELECT
          s.id,
          s.name,
          s.contact_number,
          s.address,
          s.date_of_birth,
          s.points,
          s.created_at,
          COUNT(g.id) as total_goals,
          SUM(CASE WHEN g.is_completed = 1 THEN 1 ELSE 0 END) as completed_goals,
          ROUND(
            CASE
              WHEN COUNT(g.id) > 0
              THEN (SUM(CASE WHEN g.is_completed = 1 THEN 1 ELSE 0 END) / COUNT(g.id)) * 100
              ELSE 0
            END, 2
          ) as completion_rate
        FROM students s
        LEFT JOIN goals g ON s.id = g.student_id ${dateFilter}
        GROUP BY s.id, s.name, s.contact_number, s.address, s.date_of_birth, s.points, s.created_at
        ORDER BY ${orderBy} ${orderDirection}
        ${limit ? `LIMIT ${limit}` : ""}
        ${offset ? `OFFSET ${offset}` : ""}
      `;

      const results = await this.sequelize.query(sql, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      });

      return results;
    } catch (error) {
      throw new Error(
        `Failed to find students with goal stats: ${error.message}`
      );
    }
  }

  /**
   * Search students by name or other criteria
   * @async
   * @param {string} searchTerm - Search term to match against name
   * @param {Object} [options] - Search options
   * @returns {Promise<Array<Object>>} Array of matching students
   * @throws {Error} If search operation fails
   */
  async search(searchTerm, options = {}) {
    try {
      const { exactMatch = false, limit } = options;

      const whereClause = exactMatch
        ? { name: searchTerm }
        : { name: { [Op.like]: `%${searchTerm}%` } };

      const queryOptions = {
        where: whereClause,
        order: [["name", "ASC"]],
      };

      if (limit) {
        queryOptions.limit = limit;
      }

      const students = await this.studentModel.findAll(queryOptions);
      return students.map((student) => student.toJSON());
    } catch (error) {
      throw new Error(`Failed to search students: ${error.message}`);
    }
  }

  /**
   * Count total students
   * @async
   * @param {Object} [filters] - Optional filters
   * @returns {Promise<number>} Total count of students
   * @throws {Error} If count operation fails
   */
  async countAll(filters = {}) {
    try {
      const whereClause = {};

      if (filters.activeOnly) {
        // Define active as having goals or attendance in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeStudentIds = await this.sequelize.query(
          `
          SELECT DISTINCT student_id FROM (
            SELECT student_id FROM goals WHERE created_at >= :thirtyDaysAgo
            UNION
            SELECT student_id FROM attendance WHERE date >= :thirtyDaysAgo
          ) as active_students
        `,
          {
            replacements: { thirtyDaysAgo },
            type: this.sequelize.QueryTypes.SELECT,
          }
        );

        const ids = activeStudentIds.map((row) => row.student_id);
        if (ids.length > 0) {
          whereClause.id = { [Op.in]: ids };
        } else {
          return 0; // No active students
        }
      }

      return await this.studentModel.count({ where: whereClause });
    } catch (error) {
      throw new Error(`Failed to count students: ${error.message}`);
    }
  }

  /**
   * Get students for leaderboard (points-based ranking)
   * @async
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Students ordered by points
   * @throws {Error} If query fails
   */
  async getLeaderboard(options = {}) {
    try {
      const { limit = 10, startDate, endDate } = options;

      let dateFilter = "";
      const replacements = { limit };

      if (startDate || endDate) {
        const dateConditions = [];
        if (startDate) {
          dateConditions.push("g.completed_at >= :startDate");
          replacements.startDate = startDate;
        }
        if (endDate) {
          dateConditions.push("g.completed_at <= :endDate");
          replacements.endDate = endDate;
        }
        dateFilter = `AND ${dateConditions.join(" AND ")}`;
      }

      const sql = `
        SELECT
          g.student_id,
          s.name as student_name,
          SUM(2) AS completed_points,
          SUM(CASE WHEN g.completed_at IS NOT NULL AND g.completed_at <= g.target_date THEN 3 ELSE 0 END) AS on_time_bonus,
          SUM(2 + CASE WHEN g.completed_at IS NOT NULL AND g.completed_at <= g.target_date THEN 3 ELSE 0 END) AS total_points
        FROM goals g
        JOIN students s ON g.student_id = s.id
        WHERE g.is_completed = 1 ${dateFilter}
        GROUP BY g.student_id, s.name
        ORDER BY total_points DESC, s.name ASC
        LIMIT :limit
      `;

      const results = await this.sequelize.query(sql, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      });

      return results;
    } catch (error) {
      throw new Error(`Failed to get leaderboard: ${error.message}`);
    }
  }

  /**
   * Check if student exists
   * @async
   * @param {number} id - Student ID
   * @returns {Promise<boolean>} True if student exists, false otherwise
   * @throws {Error} If check operation fails
   */
  async exists(id) {
    try {
      const count = await this.studentModel.count({
        where: { id },
      });

      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check if student exists: ${error.message}`);
    }
  }
}
