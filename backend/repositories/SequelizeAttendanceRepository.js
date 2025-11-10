/**
 * @fileoverview Sequelize Attendance Repository Implementation
 * @description Concrete implementation of IAttendanceRepository using Sequelize ORM.
 * Handles all attendance-related database operations using MySQL through Sequelize.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import Sequelize, { Op } from "sequelize";
import { IAttendanceRepository } from "../interfaces/repositories/IAttendanceRepository.js";

/**
 * Sequelize implementation of Attendance repository
 * @class SequelizeAttendanceRepository
 * @extends IAttendanceRepository
 * @description Provides attendance data access operations using Sequelize ORM
 */
export class SequelizeAttendanceRepository extends IAttendanceRepository {
  /**
   * Constructor for SequelizeAttendanceRepository
   * @param {Object} attendanceModel - Sequelize Attendance model
   * @param {Object} studentModel - Sequelize Student model
   * @param {Object} sequelizeInstance - Sequelize instance for raw queries
   */
  constructor(attendanceModel, studentModel, sequelizeInstance) {
    super();
    this.attendanceModel = attendanceModel;
    this.studentModel = studentModel;
    this.sequelize = sequelizeInstance;
  }

  /**
   * Find all attendance records with optional filtering
   * @async
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Array of attendance objects
   * @throws {Error} If database query fails
   */
  async findAll(options = {}) {
    try {
      const {
        studentId,
        startDate,
        endDate,
        status,
        includeStudent = false,
        orderBy = "date",
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
        whereClause.date = {
          [Op.between]: [startDate, endDate],
        };
      } else if (startDate) {
        whereClause.date = {
          [Op.gte]: startDate,
        };
      } else if (endDate) {
        whereClause.date = {
          [Op.lte]: endDate,
        };
      }

      if (status) {
        whereClause.status = status;
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

      const attendance = await this.attendanceModel.findAll(queryOptions);
      return attendance.map((record) => record.toJSON());
    } catch (error) {
      throw new Error(
        `Failed to find all attendance records: ${error.message}`
      );
    }
  }

  /**
   * Find an attendance record by ID
   * @async
   * @param {number} id - Attendance record ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object|null>} Attendance object or null if not found
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

      const attendance = await this.attendanceModel.findByPk(id, queryOptions);
      return attendance ? attendance.toJSON() : null;
    } catch (error) {
      throw new Error(
        `Failed to find attendance record by ID: ${error.message}`
      );
    }
  }

  /**
   * Find attendance records by student ID
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Array of attendance objects
   * @throws {Error} If database query fails
   */
  async findByStudentId(studentId, options = {}) {
    try {
      const {
        startDate,
        endDate,
        status,
        orderBy = "date",
        orderDirection = "DESC",
        limit,
      } = options;

      const whereClause = { student_id: studentId };

      if (startDate && endDate) {
        whereClause.date = {
          [Op.between]: [startDate, endDate],
        };
      } else if (startDate) {
        whereClause.date = {
          [Op.gte]: startDate,
        };
      } else if (endDate) {
        whereClause.date = {
          [Op.lte]: endDate,
        };
      }

      if (status) {
        whereClause.status = status;
      }

      const queryOptions = {
        where: whereClause,
        order: [[orderBy, orderDirection]],
      };

      if (limit) {
        queryOptions.limit = limit;
      }

      const attendance = await this.attendanceModel.findAll(queryOptions);
      return attendance.map((record) => record.toJSON());
    } catch (error) {
      throw new Error(
        `Failed to find attendance by student ID: ${error.message}`
      );
    }
  }

  /**
   * Find attendance records by date
   * @async
   * @param {Date|string} date - Date to search for
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Array of attendance objects
   * @throws {Error} If database query fails
   */
  async findByDate(date, options = {}) {
    try {
      const { includeStudent = false, status } = options;

      const whereClause = { date };

      if (status) {
        whereClause.status = status;
      }

      const queryOptions = {
        where: whereClause,
        order: [["created_at", "ASC"]],
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

      const attendance = await this.attendanceModel.findAll(queryOptions);
      return attendance.map((record) => record.toJSON());
    } catch (error) {
      throw new Error(`Failed to find attendance by date: ${error.message}`);
    }
  }

  /**
   * Find attendance records by status
   * @async
   * @param {string} status - Status to filter by (present, absent, late, excused)
   * @param {Object} [options] - Query options
   * @returns {Promise<Array<Object>>} Array of attendance objects
   * @throws {Error} If database query fails
   */
  async findByStatus(status, options = {}) {
    try {
      const {
        studentId,
        startDate,
        endDate,
        includeStudent = false,
        limit,
      } = options;

      const whereClause = { status };

      if (studentId) {
        whereClause.student_id = studentId;
      }

      if (startDate && endDate) {
        whereClause.date = {
          [Op.between]: [startDate, endDate],
        };
      } else if (startDate) {
        whereClause.date = {
          [Op.gte]: startDate,
        };
      } else if (endDate) {
        whereClause.date = {
          [Op.lte]: endDate,
        };
      }

      const queryOptions = {
        where: whereClause,
        order: [["date", "DESC"]],
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

      const attendance = await this.attendanceModel.findAll(queryOptions);
      return attendance.map((record) => record.toJSON());
    } catch (error) {
      throw new Error(`Failed to find attendance by status: ${error.message}`);
    }
  }

  /**
   * Create a new attendance record
   * @async
   * @param {Object} attendanceData - Attendance data to create
   * @returns {Promise<Object>} Created attendance object
   * @throws {Error} If attendance creation fails
   */
  async create(attendanceData) {
    try {
      const attendance = await this.attendanceModel.create({
        student_id: attendanceData.student_id,
        date: attendanceData.date,
        status: attendanceData.status,
        notes: attendanceData.notes || null,
        created_at: new Date(),
      });

      return attendance.toJSON();
    } catch (error) {
      throw new Error(`Failed to create attendance record: ${error.message}`);
    }
  }

  /**
   * Update an attendance record by ID
   * @async
   * @param {number} id - Attendance record ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated attendance object or null if not found
   * @throws {Error} If update operation fails
   */
  async update(id, updates) {
    try {
      const [affectedRows] = await this.attendanceModel.update(updates, {
        where: { id },
      });

      if (affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update attendance record: ${error.message}`);
    }
  }

  /**
   * Delete an attendance record by ID
   * @async
   * @param {number} id - Attendance record ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   * @throws {Error} If delete operation fails
   */
  async delete(id) {
    try {
      const deletedRows = await this.attendanceModel.destroy({
        where: { id },
      });

      return deletedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete attendance record: ${error.message}`);
    }
  }

  /**
   * Count attendance records with optional filters
   * @async
   * @param {Object} [filters] - Filters to apply
   * @returns {Promise<number>} Total count of attendance records
   * @throws {Error} If count operation fails
   */
  async count(filters = {}) {
    try {
      const whereClause = {};

      if (filters.studentId) {
        whereClause.student_id = filters.studentId;
      }

      if (filters.status) {
        whereClause.status = filters.status;
      }

      if (filters.startDate && filters.endDate) {
        whereClause.date = {
          [Op.between]: [filters.startDate, filters.endDate],
        };
      } else if (filters.startDate) {
        whereClause.date = {
          [Op.gte]: filters.startDate,
        };
      } else if (filters.endDate) {
        whereClause.date = {
          [Op.lte]: filters.endDate,
        };
      }

      return await this.attendanceModel.count({ where: whereClause });
    } catch (error) {
      throw new Error(`Failed to count attendance records: ${error.message}`);
    }
  }

  /**
   * Get attendance statistics for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Attendance statistics
   * @throws {Error} If query fails
   */
  async getAttendanceStats(studentId, dateRange = {}) {
    try {
      const { startDate, endDate } = dateRange;
      const replacements = { studentId };

      let dateFilter = "";
      if (startDate || endDate) {
        const dateConditions = [];
        if (startDate) {
          dateConditions.push("date >= :startDate");
          replacements.startDate = startDate;
        }
        if (endDate) {
          dateConditions.push("date <= :endDate");
          replacements.endDate = endDate;
        }
        dateFilter = `AND ${dateConditions.join(" AND ")}`;
      }

      const sql = `
        SELECT
          COUNT(*) as total_records,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as days_present,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as days_absent,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as days_late,
          SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as days_excused,
          ROUND(
            (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2
          ) as attendance_rate,
          ROUND(
            (SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2
          ) as absence_rate
        FROM attendance
        WHERE student_id = :studentId ${dateFilter}
      `;

      const [result] = await this.sequelize.query(sql, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      });

      return {
        total_records: parseInt(result.total_records) || 0,
        days_present: parseInt(result.days_present) || 0,
        days_absent: parseInt(result.days_absent) || 0,
        days_late: parseInt(result.days_late) || 0,
        days_excused: parseInt(result.days_excused) || 0,
        attendance_rate: parseFloat(result.attendance_rate) || 0,
        absence_rate: parseFloat(result.absence_rate) || 0,
      };
    } catch (error) {
      throw new Error(`Failed to get attendance stats: ${error.message}`);
    }
  }

  /**
   * Get aggregated attendance statistics for all students
   * @async
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Array<Object>>} Attendance statistics per student
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
          dateConditions.push("a.date >= :startDate");
          replacements.startDate = startDate;
        }
        if (endDate) {
          dateConditions.push("a.date <= :endDate");
          replacements.endDate = endDate;
        }
        dateFilter = `WHERE ${dateConditions.join(" AND ")}`;
      }

      const sql = `
        SELECT
          a.student_id,
          s.name as student_name,
          COUNT(*) as total_records,
          SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as days_present,
          SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as days_absent,
          SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as days_late,
          SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) as days_excused,
          ROUND(
            (SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2
          ) as attendance_rate
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        ${dateFilter}
        GROUP BY a.student_id, s.name
        ORDER BY attendance_rate DESC, s.name ASC
      `;

      const results = await this.sequelize.query(sql, {
        replacements,
        type: this.sequelize.QueryTypes.SELECT,
      });

      return results.map((row) => ({
        student_id: row.student_id,
        student_name: row.student_name,
        total_records: parseInt(row.total_records),
        days_present: parseInt(row.days_present),
        days_absent: parseInt(row.days_absent),
        days_late: parseInt(row.days_late),
        days_excused: parseInt(row.days_excused),
        attendance_rate: parseFloat(row.attendance_rate),
      }));
    } catch (error) {
      throw new Error(
        `Failed to get aggregated attendance stats: ${error.message}`
      );
    }
  }

  /**
   * Get daily attendance summary for a specific date
   * @async
   * @param {Date|string} date - Date to get summary for
   * @returns {Promise<Object>} Daily attendance summary
   * @throws {Error} If query fails
   */
  async getDailySummary(date) {
    try {
      const sql = `
        SELECT
          COUNT(*) as total_students,
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count,
          SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count,
          SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_count,
          ROUND(
            (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2
          ) as attendance_rate
        FROM attendance
        WHERE date = :date
      `;

      const [result] = await this.sequelize.query(sql, {
        replacements: { date },
        type: this.sequelize.QueryTypes.SELECT,
      });

      return {
        date: date,
        total_students: parseInt(result.total_students) || 0,
        present_count: parseInt(result.present_count) || 0,
        absent_count: parseInt(result.absent_count) || 0,
        late_count: parseInt(result.late_count) || 0,
        excused_count: parseInt(result.excused_count) || 0,
        attendance_rate: parseFloat(result.attendance_rate) || 0,
      };
    } catch (error) {
      throw new Error(
        `Failed to get daily attendance summary: ${error.message}`
      );
    }
  }

  /**
   * Check if attendance record exists for student and date
   * @async
   * @param {number} studentId - Student ID
   * @param {Date|string} date - Date to check
   * @returns {Promise<boolean>} True if record exists, false otherwise
   * @throws {Error} If check operation fails
   */
  async existsForStudentAndDate(studentId, date) {
    try {
      const count = await this.attendanceModel.count({
        where: {
          student_id: studentId,
          date: date,
        },
      });

      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check if attendance exists: ${error.message}`);
    }
  }

  /**
   * Bulk create or update attendance records
   * @async
   * @param {Array<Object>} attendanceRecords - Array of attendance data
   * @param {Object} [options] - Options for bulk operation
   * @returns {Promise<Array<Object>>} Array of created/updated attendance records
   * @throws {Error} If bulk operation fails
   */
  async bulkCreateOrUpdate(attendanceRecords, options = {}) {
    try {
      const { updateOnDuplicate = true } = options;
      const results = [];

      for (const record of attendanceRecords) {
        const exists = await this.existsForStudentAndDate(
          record.student_id,
          record.date
        );

        if (exists && updateOnDuplicate) {
          // Update existing record
          const [affectedRows] = await this.attendanceModel.update(
            {
              status: record.status,
              notes: record.notes || null,
            },
            {
              where: {
                student_id: record.student_id,
                date: record.date,
              },
            }
          );

          if (affectedRows > 0) {
            const updated = await this.attendanceModel.findOne({
              where: {
                student_id: record.student_id,
                date: record.date,
              },
            });
            results.push(updated.toJSON());
          }
        } else if (!exists) {
          // Create new record
          const created = await this.create(record);
          results.push(created);
        }
      }

      return results;
    } catch (error) {
      throw new Error(
        `Failed to bulk create or update attendance: ${error.message}`
      );
    }
  }
}
