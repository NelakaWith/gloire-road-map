/**
 * @fileoverview Attendance Service Implementation
 * @description Concrete implementation of IAttendanceService providing business logic operations
 * for attendance management. Handles attendance validation, tracking, analytics, and
 * comprehensive reporting functionality.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { IAttendanceService } from "../interfaces/services/IAttendanceService.js";
import { POINTS } from "../config/pointsConfig.js";

/**
 * Concrete Attendance Service Implementation
 * @class AttendanceService
 * @extends IAttendanceService
 * @description Provides attendance business logic operations using repository pattern
 */
export class AttendanceService extends IAttendanceService {
  /**
   * Constructor for AttendanceService
   * @param {IAttendanceRepository} attendanceRepository - Attendance repository instance
   * @param {IStudentRepository} studentRepository - Student repository instance
   * @param {IPointsRepository} pointsRepository - Points repository instance
   */
  constructor(attendanceRepository, studentRepository, pointsRepository) {
    super();
    this.attendanceRepository = attendanceRepository;
    this.studentRepository = studentRepository;
    this.pointsRepository = pointsRepository;
  }

  /**
   * Record attendance for a student with validation
   * @async
   * @param {Object} attendanceData - Attendance data to record
   * @returns {Promise<Object>} Recorded attendance with validation results
   */
  async recordAttendance(attendanceData) {
    try {
      // Validate attendance data
      const validationResult = await this.validateAttendanceData(
        attendanceData
      );
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`
        );
      }

      // Check for duplicate attendance
      const isDuplicate = await this.checkDuplicateAttendance(
        attendanceData.student_id,
        attendanceData.date
      );
      if (isDuplicate) {
        throw new Error(
          "Attendance already recorded for this student on this date"
        );
      }

      // Verify student exists
      const studentExists = await this.studentRepository.exists(
        attendanceData.student_id
      );
      if (!studentExists) {
        throw new Error("Student not found");
      }

      // Record attendance
      const attendance = await this.attendanceRepository.create(attendanceData);

      // Award attendance points if present
      if (attendanceData.status === "present") {
        await this.pointsRepository.createPointsLog({
          student_id: attendanceData.student_id,
          points: POINTS.ATTENDANCE_PRESENT,
          reason: "Daily attendance bonus",
          related_goal_id: null,
        });
      }

      return {
        attendance,
        validation: validationResult,
        pointsAwarded:
          attendanceData.status === "present" ? POINTS.ATTENDANCE_PRESENT : 0,
        success: true,
      };
    } catch (error) {
      throw new Error(`Failed to record attendance: ${error.message}`);
    }
  }

  /**
   * Get attendance record by ID
   * @async
   * @param {number} attendanceId - Attendance record ID
   * @param {Object} [options] - Query options
   * @returns {Promise<Object|null>} Attendance record or null if not found
   */
  async getAttendanceById(attendanceId, options = {}) {
    try {
      const attendance = await this.attendanceRepository.findById(
        attendanceId,
        options
      );
      return attendance;
    } catch (error) {
      throw new Error(`Failed to get attendance by ID: ${error.message}`);
    }
  }

  /**
   * Get attendance records with flexible filtering options
   * @async
   * @param {Object} filters - Filter options
   * @param {number} [filters.student_id] - Filter by student ID
   * @param {string} [filters.date] - Filter by specific date (YYYY-MM-DD)
   * @param {string} [filters.start_date] - Filter from start date (YYYY-MM-DD)
   * @param {string} [filters.end_date] - Filter to end date (YYYY-MM-DD)
   * @param {string} [filters.status] - Filter by status (present|absent|late|excused)
   * @returns {Promise<Array>} Array of attendance records matching filters
   */
  async getAttendanceRecords(filters = {}) {
    try {
      const { student_id, date, start_date, end_date, status } = filters;

      // If filtering by single student, use student-specific query
      if (student_id) {
        const options = {};
        if (date) {
          options.date = date;
        }
        if (start_date && end_date) {
          options.dateRange = { start: start_date, end: end_date };
        } else if (start_date) {
          options.dateRange = { start: start_date };
        } else if (end_date) {
          options.dateRange = { end: end_date };
        }
        if (status) {
          options.status = status;
        }

        const result = await this.getStudentAttendance(student_id, options);
        return result.records || result;
      }

      // If filtering by date, use date-specific query
      if (date) {
        const result = await this.getDailyAttendance(date);
        let records = result.attendance || [];

        // Apply additional filters
        if (status) {
          records = records.filter((r) => r.status === status);
        }

        return records;
      }

      // If filtering by date range, find all records in range
      if (start_date || end_date) {
        const options = {
          dateRange: {},
          includeStudent: true,
        };
        if (start_date) options.dateRange.start = start_date;
        if (end_date) options.dateRange.end = end_date;
        if (status) options.status = status;

        const result = await this.attendanceRepository.findAll(options);
        return result || [];
      }

      // If only filtering by status, get all records and filter
      if (status) {
        const allRecords = await this.attendanceRepository.findAll({
          includeStudent: true,
        });
        return (allRecords || []).filter((r) => r.status === status);
      }

      // Return all records
      const allRecords = await this.attendanceRepository.findAll({
        includeStudent: true,
      });
      return allRecords || [];
    } catch (error) {
      throw new Error(`Failed to get attendance records: ${error.message}`);
    }
  }

  /**
   * Get attendance records for a student with filtering
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Filter and pagination options
   * @returns {Promise<Object>} Attendance records with pagination metadata
   */
  async getStudentAttendance(studentId, options = {}) {
    try {
      // Verify student exists
      const studentExists = await this.studentRepository.exists(studentId);
      if (!studentExists) {
        throw new Error("Student not found");
      }

      const {
        page = 1,
        limit = 20,
        startDate,
        endDate,
        status,
        orderBy = "date",
        orderDirection = "DESC",
      } = options;

      const offset = (page - 1) * limit;

      const findOptions = {
        startDate,
        endDate,
        status,
        orderBy,
        orderDirection,
        limit,
        offset,
      };

      const attendance = await this.attendanceRepository.findByStudentId(
        studentId,
        findOptions
      );
      const totalCount = await this.attendanceRepository.count({
        studentId,
        startDate,
        endDate,
        status,
      });

      // Add computed fields
      const enhancedAttendance = attendance.map((record) => ({
        ...record,
        dayOfWeek: this._getDayOfWeek(record.date),
        isRecent: this._isRecentRecord(record.date),
      }));

      return {
        attendance: enhancedAttendance,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get student attendance: ${error.message}`);
    }
  }

  /**
   * Get daily attendance for all students
   * @async
   * @param {Date|string} date - Date to get attendance for
   * @param {Object} [options] - Query options
   * @returns {Promise<Object>} Daily attendance summary with student details
   */
  async getDailyAttendance(date, options = {}) {
    try {
      const { includeStudent = true } = options;

      const attendance = await this.attendanceRepository.findByDate(date, {
        includeStudent,
      });

      const summary = await this.attendanceRepository.getDailySummary(date);

      // Get students who haven't been marked
      const allStudents = await this.studentRepository.findAll();
      const markedStudentIds = attendance.map((record) => record.student_id);
      const unmarkedStudents = allStudents.filter(
        (student) => !markedStudentIds.includes(student.id)
      );

      return {
        date,
        summary,
        attendance,
        unmarkedStudents,
        stats: {
          totalStudents: allStudents.length,
          markedStudents: attendance.length,
          unmarkedStudents: unmarkedStudents.length,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get daily attendance: ${error.message}`);
    }
  }

  /**
   * Update attendance record with validation
   * @async
   * @param {number} attendanceId - Attendance record ID
   * @param {Object} updates - Fields to update
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<Object|null>} Updated attendance or null if not found
   */
  async updateAttendance(attendanceId, updates, requestingUserId = null) {
    try {
      // Validate update data
      const validationResult = await this.validateAttendanceData(updates, true);
      if (!validationResult.isValid) {
        throw new Error(
          `Validation failed: ${validationResult.errors.join(", ")}`
        );
      }

      // Check if attendance exists
      const existingAttendance = await this.attendanceRepository.findById(
        attendanceId
      );
      if (!existingAttendance) {
        return null;
      }

      // Check business rules for updates
      const dateDiff = Math.abs(new Date() - new Date(existingAttendance.date));
      const daysDiff = dateDiff / (1000 * 60 * 60 * 24);

      if (daysDiff > 7) {
        throw new Error("Cannot update attendance records older than 7 days");
      }

      // Handle points adjustment if status changed
      if (updates.status && updates.status !== existingAttendance.status) {
        await this._adjustAttendancePoints(
          existingAttendance.student_id,
          existingAttendance.status,
          updates.status,
          existingAttendance.date
        );
      }

      const updatedAttendance = await this.attendanceRepository.update(
        attendanceId,
        updates
      );
      return updatedAttendance;
    } catch (error) {
      throw new Error(`Failed to update attendance: ${error.message}`);
    }
  }

  /**
   * Delete attendance record with validation
   * @async
   * @param {number} attendanceId - Attendance record ID
   * @param {number} [requestingUserId] - ID of user making the request
   * @returns {Promise<boolean>} True if deleted successfully
   */
  async deleteAttendance(attendanceId, requestingUserId = null) {
    try {
      const attendance = await this.attendanceRepository.findById(attendanceId);
      if (!attendance) {
        return false;
      }

      // Check business rules for deletion
      const dateDiff = Math.abs(new Date() - new Date(attendance.date));
      const daysDiff = dateDiff / (1000 * 60 * 60 * 24);

      if (daysDiff > 7) {
        throw new Error("Cannot delete attendance records older than 7 days");
      }

      // Revert attendance points if present
      if (attendance.status === "present") {
        await this.pointsRepository.createPointsLog({
          student_id: attendance.student_id,
          points: -1,
          reason: "Attendance record deletion adjustment",
          related_goal_id: null,
        });
      }

      const deleted = await this.attendanceRepository.delete(attendanceId);
      return deleted;
    } catch (error) {
      throw new Error(`Failed to delete attendance: ${error.message}`);
    }
  }

  /**
   * Bulk record attendance for multiple students
   * @async
   * @param {Array<Object>} attendanceRecords - Array of attendance data
   * @param {Object} [options] - Bulk operation options
   * @returns {Promise<Object>} Bulk operation result with success/failure details
   */
  async bulkRecordAttendance(attendanceRecords, options = {}) {
    try {
      const { skipDuplicates = true, awardPoints = true } = options;
      const results = {
        successful: [],
        failed: [],
        duplicates: [],
        totalProcessed: attendanceRecords.length,
      };

      for (const attendanceData of attendanceRecords) {
        try {
          // Check for duplicates
          const isDuplicate = await this.checkDuplicateAttendance(
            attendanceData.student_id,
            attendanceData.date
          );

          if (isDuplicate) {
            if (skipDuplicates) {
              results.duplicates.push({
                data: attendanceData,
                reason: "Duplicate record",
              });
              continue;
            } else {
              throw new Error("Duplicate attendance record");
            }
          }

          // Validate data
          const validationResult = await this.validateAttendanceData(
            attendanceData
          );
          if (!validationResult.isValid) {
            throw new Error(
              `Validation failed: ${validationResult.errors.join(", ")}`
            );
          }

          // Create attendance record
          const attendance = await this.attendanceRepository.create(
            attendanceData
          );

          // Award points if applicable
          if (awardPoints && attendanceData.status === "present") {
            await this.pointsRepository.createPointsLog({
              student_id: attendanceData.student_id,
              points: 1,
              reason: "Daily attendance bonus",
              related_goal_id: null,
            });
          }

          results.successful.push(attendance);
        } catch (error) {
          results.failed.push({
            data: attendanceData,
            error: error.message,
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to bulk record attendance: ${error.message}`);
    }
  }

  /**
   * Get attendance statistics for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Comprehensive attendance statistics
   */
  async getAttendanceStatistics(studentId, dateRange = {}) {
    try {
      const studentExists = await this.studentRepository.exists(studentId);
      if (!studentExists) {
        throw new Error("Student not found");
      }

      const stats = await this.attendanceRepository.getAttendanceStats(
        studentId,
        dateRange
      );
      const patterns = await this.getAttendancePatterns(studentId, dateRange);

      return {
        studentId,
        dateRange,
        statistics: stats,
        patterns,
        recommendations: this._generateAttendanceRecommendations(
          stats,
          patterns
        ),
      };
    } catch (error) {
      throw new Error(`Failed to get attendance statistics: ${error.message}`);
    }
  }

  /**
   * Get attendance analytics for multiple students
   * @async
   * @param {Array<number>} [studentIds] - Student IDs
   * @param {Object} [dateRange] - Optional date range filter
   * @returns {Promise<Object>} Attendance analytics and trends
   */
  async getAttendanceAnalytics(studentIds = [], dateRange = {}) {
    try {
      const aggregatedStats =
        await this.attendanceRepository.getAggregatedStats(dateRange);
      const trends = await this.getAttendanceTrends({ dateRange });

      let filteredStats = aggregatedStats;
      if (studentIds.length > 0) {
        filteredStats = aggregatedStats.filter((stat) =>
          studentIds.includes(stat.student_id)
        );
      }

      return {
        dateRange,
        summary: {
          totalStudents: filteredStats.length,
          averageAttendanceRate:
            this._calculateAverageAttendanceRate(filteredStats),
          highPerformers: filteredStats.filter((s) => s.attendance_rate >= 90)
            .length,
          atRiskStudents: filteredStats.filter((s) => s.attendance_rate < 75)
            .length,
        },
        studentStats: filteredStats,
        trends,
        insights: this._generateAttendanceInsights(filteredStats, trends),
      };
    } catch (error) {
      throw new Error(`Failed to get attendance analytics: ${error.message}`);
    }
  }

  /**
   * Generate attendance report for specified period
   * @async
   * @param {Object} reportOptions - Report generation options
   * @returns {Promise<Object>} Generated attendance report
   */
  async generateAttendanceReport(reportOptions) {
    try {
      const {
        studentIds = [],
        startDate,
        endDate,
        format = "summary",
      } = reportOptions;

      if (!startDate || !endDate) {
        throw new Error(
          "Start date and end date are required for report generation"
        );
      }

      const dateRange = { startDate, endDate };

      let analytics;
      if (studentIds.length > 0) {
        analytics = await this.getAttendanceAnalytics(studentIds, dateRange);
      } else {
        analytics = await this.getAttendanceAnalytics([], dateRange);
      }

      const report = {
        reportType: "attendance",
        format,
        period: dateRange,
        generatedAt: new Date(),
        ...analytics,
      };

      if (format === "detailed") {
        report.dailyBreakdown = await this._getDailyBreakdown(
          dateRange,
          studentIds
        );
        report.weeklyTrends = await this._getWeeklyTrends(
          dateRange,
          studentIds
        );
      }

      return report;
    } catch (error) {
      throw new Error(`Failed to generate attendance report: ${error.message}`);
    }
  }

  /**
   * Get students with poor attendance
   * @async
   * @param {Object} [criteria] - Attendance criteria
   * @returns {Promise<Array<Object>>} Students with poor attendance
   */
  async getStudentsWithPoorAttendance(criteria = {}) {
    try {
      const { attendanceThreshold = 75, dateRange = {} } = criteria;

      const aggregatedStats =
        await this.attendanceRepository.getAggregatedStats(dateRange);
      const poorAttendanceStudents = aggregatedStats.filter(
        (stat) => stat.attendance_rate < attendanceThreshold
      );

      // Enhance with additional data
      const enhancedStudents = await Promise.all(
        poorAttendanceStudents.map(async (stat) => {
          const student = await this.studentRepository.findById(
            stat.student_id
          );
          const patterns = await this.getAttendancePatterns(
            stat.student_id,
            dateRange
          );

          return {
            student,
            attendanceStats: stat,
            patterns,
            riskLevel: this._calculateAttendanceRiskLevel(stat.attendance_rate),
            recommendations: this._generateImprovementRecommendations(
              stat,
              patterns
            ),
          };
        })
      );

      return enhancedStudents.sort(
        (a, b) =>
          a.attendanceStats.attendance_rate - b.attendanceStats.attendance_rate
      );
    } catch (error) {
      throw new Error(
        `Failed to get students with poor attendance: ${error.message}`
      );
    }
  }

  /**
   * Get attendance trends over time
   * @async
   * @param {Object} [options] - Trend analysis options
   * @returns {Promise<Array<Object>>} Attendance trends data
   */
  async getAttendanceTrends(options = {}) {
    try {
      const { groupBy = "week", dateRange = {} } = options;

      // This would implement complex trend analysis
      // For now, returning a simplified structure
      const trends = [];

      // Generate sample trend data based on groupBy parameter
      const now = new Date();
      const periods = groupBy === "day" ? 30 : groupBy === "week" ? 12 : 6;

      for (let i = periods; i >= 0; i--) {
        const periodStart = new Date(now);
        const periodEnd = new Date(now);

        if (groupBy === "day") {
          periodStart.setDate(now.getDate() - i);
          periodEnd.setDate(now.getDate() - i);
        } else if (groupBy === "week") {
          periodStart.setDate(now.getDate() - i * 7);
          periodEnd.setDate(now.getDate() - i * 7 + 6);
        } else {
          periodStart.setMonth(now.getMonth() - i);
          periodEnd.setMonth(now.getMonth() - i + 1);
        }

        const periodStats = await this.attendanceRepository.getAggregatedStats({
          startDate: periodStart,
          endDate: periodEnd,
        });

        trends.push({
          period: periodStart.toISOString().split("T")[0],
          averageAttendanceRate:
            this._calculateAverageAttendanceRate(periodStats),
          totalRecords: periodStats.reduce(
            (sum, stat) => sum + stat.total_records,
            0
          ),
          studentsTracked: periodStats.length,
        });
      }

      return trends;
    } catch (error) {
      throw new Error(`Failed to get attendance trends: ${error.message}`);
    }
  }

  /**
   * Validate attendance data before recording or updating
   * @async
   * @param {Object} attendanceData - Attendance data to validate
   * @param {boolean} [isUpdate=false] - Whether this is an update operation
   * @returns {Promise<Object>} Validation result with errors if any
   */
  async validateAttendanceData(attendanceData, isUpdate = false) {
    const errors = [];

    try {
      // Required fields for creation
      if (!isUpdate) {
        if (!attendanceData.student_id) {
          errors.push("Student ID is required");
        }
        if (!attendanceData.date) {
          errors.push("Date is required");
        }
        if (!attendanceData.status) {
          errors.push("Status is required");
        }
      }

      // Validate status
      if (
        attendanceData.status &&
        !["present", "absent", "late", "excused"].includes(
          attendanceData.status
        )
      ) {
        errors.push("Status must be one of: present, absent, late, excused");
      }

      // Validate date
      if (attendanceData.date) {
        const date = new Date(attendanceData.date);
        const today = new Date();

        if (isNaN(date.getTime())) {
          errors.push("Invalid date format");
        } else if (date > today) {
          errors.push("Cannot record attendance for future dates");
        }
      }

      // Validate notes length
      if (attendanceData.notes && attendanceData.notes.length > 500) {
        errors.push("Notes must be 500 characters or less");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ["Validation process failed"],
      };
    }
  }

  /**
   * Check for duplicate attendance records
   * @async
   * @param {number} studentId - Student ID
   * @param {Date|string} date - Date to check
   * @returns {Promise<boolean>} True if duplicate exists
   */
  async checkDuplicateAttendance(studentId, date) {
    try {
      return await this.attendanceRepository.existsForStudentAndDate(
        studentId,
        date
      );
    } catch (error) {
      throw new Error(`Failed to check duplicate attendance: ${error.message}`);
    }
  }

  /**
   * Get attendance patterns for a student
   * @async
   * @param {number} studentId - Student ID
   * @param {Object} [options] - Pattern analysis options
   * @returns {Promise<Object>} Attendance patterns and insights
   */
  async getAttendancePatterns(studentId, options = {}) {
    try {
      const { dateRange = {} } = options;

      const attendance = await this.attendanceRepository.findByStudentId(
        studentId,
        {
          ...dateRange,
          limit: 100,
          orderBy: "date",
          orderDirection: "DESC",
        }
      );

      const patterns = {
        dayOfWeekPattern: this._analyzeDayOfWeekPattern(attendance),
        streaks: this._analyzeAttendanceStreaks(attendance),
        monthlyPattern: this._analyzeMonthlyPattern(attendance),
        seasonalTrends: this._analyzeSeasonalTrends(attendance),
      };

      return patterns;
    } catch (error) {
      throw new Error(`Failed to get attendance patterns: ${error.message}`);
    }
  }

  // Additional methods continue here...

  /**
   * Send attendance notifications
   * @async
   * @param {Object} notificationOptions - Notification options
   * @returns {Promise<Object>} Notification sending result
   */
  async sendAttendanceNotifications(notificationOptions) {
    // Placeholder implementation - would integrate with notification service
    return { success: true, sent: 0 };
  }

  /**
   * Calculate attendance rate for a period
   * @async
   * @param {number|Array<number>} studentIds - Student ID(s)
   * @param {Object} dateRange - Date range for calculation
   * @returns {Promise<Object>} Attendance rate calculation
   */
  async calculateAttendanceRate(studentIds, dateRange) {
    try {
      const ids = Array.isArray(studentIds) ? studentIds : [studentIds];
      const rates = [];

      for (const studentId of ids) {
        const stats = await this.attendanceRepository.getAttendanceStats(
          studentId,
          dateRange
        );
        rates.push({
          studentId,
          attendanceRate: stats.attendance_rate || 0,
          totalRecords: stats.total_records || 0,
        });
      }

      return {
        individual: rates,
        average:
          rates.reduce((sum, rate) => sum + rate.attendanceRate, 0) /
            rates.length || 0,
      };
    } catch (error) {
      throw new Error(`Failed to calculate attendance rate: ${error.message}`);
    }
  }

  /**
   * Get attendance exceptions (unusual patterns or missing records)
   * @async
   * @param {Object} [options] - Exception detection options
   * @returns {Promise<Array<Object>>} Attendance exceptions found
   */
  async getAttendanceExceptions(options = {}) {
    // Placeholder implementation - would detect attendance anomalies
    return [];
  }

  /**
   * Archive old attendance records
   * @async
   * @param {Date} cutoffDate - Date before which records should be archived
   * @returns {Promise<Object>} Archive operation result
   */
  async archiveOldAttendance(cutoffDate) {
    // Placeholder implementation - would archive old records
    return { success: true, archivedCount: 0 };
  }

  /**
   * Get attendance sheet for a specific date (all students with their attendance status)
   * @async
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of students with attendance information
   */
  async getAttendanceSheet(date) {
    try {
      // Get all students
      const students = await this.studentRepository.findAll();
      if (!students || students.length === 0) {
        return [];
      }

      // Get attendance records for this date using correct parameter names
      const attendanceRecords = await this.attendanceRepository.findAll({
        startDate: date,
        endDate: date,
      });

      // Create a map for quick lookup
      const attendanceMap = {};
      if (attendanceRecords) {
        attendanceRecords.forEach((record) => {
          attendanceMap[record.student_id] = record;
        });
      }

      // Build sheet with all students
      return students.map((student) => {
        const attendance = attendanceMap[student.id];
        return {
          student_id: student.id,
          name: student.name,
          status: attendance ? attendance.status : "not_marked",
          notes: attendance ? attendance.notes : null,
          attendance_id: attendance ? attendance.id : null,
        };
      });
    } catch (error) {
      throw new Error(`Failed to get attendance sheet: ${error.message}`);
    }
  }

  /**
   * Mark attendance for multiple students in a session
   * @async
   * @param {string} date - Session date
   * @param {Array} attendanceRecords - Array of attendance records to create/update
   * @returns {Promise<Object>} Results with created/updated records
   */
  async markSessionAttendance(date, attendanceRecords) {
    try {
      const results = {
        created: [],
        updated: [],
        errors: [],
      };

      for (const record of attendanceRecords) {
        try {
          const attendanceData = {
            student_id: record.student_id,
            date,
            status: record.status,
            notes: record.notes || null,
          };

          // Check for existing record
          const existing = await this.checkDuplicateAttendance(
            record.student_id,
            date
          );

          if (existing) {
            // Update existing record
            const updated = await this.updateAttendance(existing.id, {
              status: record.status,
              notes: record.notes || null,
            });
            results.updated.push(updated);
          } else {
            // Create new record
            const created = await this.recordAttendance(attendanceData);
            results.created.push(created);
          }
        } catch (error) {
          results.errors.push({
            student_id: record.student_id,
            error: error.message,
          });
        }
      }

      return {
        message: `Processed ${attendanceRecords.length} records (${results.created.length} created, ${results.updated.length} updated)`,
        created: results.created,
        updated: results.updated,
        errors: results.errors,
      };
    } catch (error) {
      throw new Error(`Failed to mark session attendance: ${error.message}`);
    }
  }

  /**
   * Get all unique session dates with attendance statistics
   * @async
   * @param {Object} filters - Filter options
   * @param {string} [filters.start_date] - Start date for range
   * @param {string} [filters.end_date] - End date for range
   * @returns {Promise<Array>} Array of session dates with statistics
   */
  async getAttendanceSessions(filters = {}) {
    try {
      const options = {};
      if (filters.start_date && filters.end_date) {
        options.startDate = filters.start_date;
        options.endDate = filters.end_date;
      } else if (filters.start_date) {
        options.startDate = filters.start_date;
      } else if (filters.end_date) {
        options.endDate = filters.end_date;
      }

      // Get all attendance records
      const records = await this.attendanceRepository.findAll(options);
      if (!records || records.length === 0) {
        return [];
      }

      // Group by date and count statuses
      const sessionMap = {};
      records.forEach((record) => {
        const date = new Date(record.date).toISOString().split("T")[0];
        if (!sessionMap[date]) {
          sessionMap[date] = {
            date,
            total_students: 0,
            present_count: 0,
            absent_count: 0,
            late_count: 0,
            excused_count: 0,
          };
        }

        sessionMap[date].total_students++;
        if (record.status === "present") {
          sessionMap[date].present_count++;
        } else if (record.status === "absent") {
          sessionMap[date].absent_count++;
        } else if (record.status === "late") {
          sessionMap[date].late_count++;
        } else if (record.status === "excused") {
          sessionMap[date].excused_count++;
        }
      });

      // Convert to array and sort by date descending
      return Object.values(sessionMap).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
    } catch (error) {
      throw new Error(`Failed to get attendance sessions: ${error.message}`);
    }
  }

  /**
   * Get attendance summary grouped by student
   * @async
   * @param {Object} filters - Filter options
   * @param {string} [filters.start_date] - Start date for range
   * @param {string} [filters.end_date] - End date for range
   * @returns {Promise<Array>} Array of attendance summaries per student
   */
  async getAttendanceSummary(filters = {}) {
    try {
      const options = {};
      if (filters.start_date && filters.end_date) {
        options.startDate = filters.start_date;
        options.endDate = filters.end_date;
      } else if (filters.start_date) {
        options.startDate = filters.start_date;
      } else if (filters.end_date) {
        options.endDate = filters.end_date;
      }

      // Get all students
      const students = await this.studentRepository.findAll();
      if (!students || students.length === 0) {
        return [];
      }

      // Get attendance records
      const records = await this.attendanceRepository.findAll(options);

      // Group by student and count statuses
      const summaryMap = {};
      students.forEach((student) => {
        summaryMap[student.id] = {
          student_id: student.id,
          name: student.name,
          total_records: 0,
          present_count: 0,
          absent_count: 0,
          late_count: 0,
          excused_count: 0,
          attendance_rate: 0,
        };
      });

      if (records && records.length > 0) {
        records.forEach((record) => {
          if (summaryMap[record.student_id]) {
            summaryMap[record.student_id].total_records++;
            if (record.status === "present") {
              summaryMap[record.student_id].present_count++;
            } else if (record.status === "absent") {
              summaryMap[record.student_id].absent_count++;
            } else if (record.status === "late") {
              summaryMap[record.student_id].late_count++;
            } else if (record.status === "excused") {
              summaryMap[record.student_id].excused_count++;
            }
          }
        });

        // Calculate attendance rate (present + excused / total)
        Object.values(summaryMap).forEach((summary) => {
          if (summary.total_records > 0) {
            summary.attendance_rate = Math.round(
              ((summary.present_count + summary.excused_count) /
                summary.total_records) *
                100
            );
          }
        });
      }

      return Object.values(summaryMap);
    } catch (error) {
      throw new Error(`Failed to get attendance summary: ${error.message}`);
    }
  }

  // Private helper methods
  async _adjustAttendancePoints(studentId, oldStatus, newStatus, date) {
    // Logic to adjust points when attendance status changes
    if (oldStatus === "present" && newStatus !== "present") {
      // Remove attendance bonus
      await this.pointsRepository.createPointsLog({
        student_id: studentId,
        points: -1,
        reason: `Attendance status change: ${oldStatus} to ${newStatus}`,
        related_goal_id: null,
      });
    } else if (oldStatus !== "present" && newStatus === "present") {
      // Add attendance bonus
      await this.pointsRepository.createPointsLog({
        student_id: studentId,
        points: 1,
        reason: `Attendance status change: ${oldStatus} to ${newStatus}`,
        related_goal_id: null,
      });
    }
  }

  _getDayOfWeek(date) {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date(date).getDay()];
  }

  _isRecentRecord(date) {
    const recordDate = new Date(date);
    const now = new Date();
    const diffDays = (now - recordDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }

  _calculateAverageAttendanceRate(stats) {
    if (stats.length === 0) return 0;
    const sum = stats.reduce((total, stat) => total + stat.attendance_rate, 0);
    return Math.round((sum / stats.length) * 100) / 100;
  }

  _generateAttendanceRecommendations(stats, patterns) {
    const recommendations = [];

    if (stats.attendance_rate < 75) {
      recommendations.push("Improve overall attendance rate");
    }

    if (patterns.dayOfWeekPattern && patterns.dayOfWeekPattern.Monday < 70) {
      recommendations.push("Focus on Monday attendance");
    }

    return recommendations;
  }

  _generateAttendanceInsights(stats, trends) {
    return {
      overallTrend:
        trends.length > 1
          ? trends[trends.length - 1].averageAttendanceRate >
            trends[0].averageAttendanceRate
            ? "improving"
            : "declining"
          : "stable",
      topPerformers: stats.filter((s) => s.attendance_rate >= 95).length,
      needsAttention: stats.filter((s) => s.attendance_rate < 75).length,
    };
  }

  _calculateAttendanceRiskLevel(attendanceRate) {
    if (attendanceRate < 60) return "high";
    if (attendanceRate < 75) return "medium";
    if (attendanceRate < 85) return "low";
    return "none";
  }

  _generateImprovementRecommendations(stats, patterns) {
    return [
      "Set daily attendance reminders",
      "Track attendance patterns",
      "Identify barriers to attendance",
    ];
  }

  _analyzeDayOfWeekPattern(attendance) {
    const dayPattern = {};
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].forEach((day) => {
      const dayRecords = attendance.filter(
        (record) => this._getDayOfWeek(record.date) === day
      );
      const presentCount = dayRecords.filter(
        (record) => record.status === "present"
      ).length;
      dayPattern[day] =
        dayRecords.length > 0 ? (presentCount / dayRecords.length) * 100 : 0;
    });
    return dayPattern;
  }

  _analyzeAttendanceStreaks(attendance) {
    // Analyze consecutive attendance patterns
    return {
      currentStreak: 0,
      longestStreak: 0,
      averageStreak: 0,
    };
  }

  _analyzeMonthlyPattern(attendance) {
    // Analyze attendance by month
    return {};
  }

  _analyzeSeasonalTrends(attendance) {
    // Analyze seasonal attendance patterns
    return {};
  }

  async _getDailyBreakdown(dateRange, studentIds) {
    // Generate daily attendance breakdown
    return [];
  }

  async _getWeeklyTrends(dateRange, studentIds) {
    // Generate weekly attendance trends
    return [];
  }
}
