/**
 * @fileoverview Attendance Service Unit Tests
 * @description Comprehensive unit tests for AttendanceService business logic operations.
 * Tests attendance tracking, analytics, report generation, and integration with repositories.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { AttendanceService } from "../../services/AttendanceService.js";
import {
  MockAttendanceRepository,
  MockStudentRepository,
  MockPointsRepository,
  TestDataFactory,
  TestAssertions,
} from "../mocks/index.js";

describe("AttendanceService", () => {
  let attendanceService;
  let mockAttendanceRepository;
  let mockStudentRepository;
  let mockPointsRepository;

  beforeEach(() => {
    mockAttendanceRepository = new MockAttendanceRepository();
    mockStudentRepository = new MockStudentRepository();
    mockPointsRepository = new MockPointsRepository();

    attendanceService = new AttendanceService(
      mockAttendanceRepository,
      mockStudentRepository,
      mockPointsRepository
    );

    // Reset all mocks
    mockAttendanceRepository.reset();
    mockStudentRepository.reset();
    mockPointsRepository.reset();
  });

  describe("recordAttendance", () => {
    test("should record attendance successfully with valid data", async () => {
      // Arrange
      const attendanceData = {
        student_id: 1,
        date: "2025-11-01",
        status: "present",
      };

      const expectedRecord =
        TestDataFactory.createAttendanceRecord(attendanceData);

      mockStudentRepository.exists.mockResolvedValue(true);
      mockAttendanceRepository.findByStudentAndDate.mockResolvedValue(null);
      mockAttendanceRepository.create.mockResolvedValue(expectedRecord);

      // Act
      const result = await attendanceService.recordAttendance(attendanceData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.attendance).toEqual(expectedRecord);
      TestAssertions.expectValidationSuccess(result.validation);
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "exists",
        1
      );
      TestAssertions.expectRepositoryMethodCalled(
        mockAttendanceRepository,
        "create",
        attendanceData
      );
    });

    test("should award points for present attendance", async () => {
      // Arrange
      const attendanceData = {
        student_id: 1,
        date: "2025-11-01",
        status: "present",
      };

      const attendanceRecord =
        TestDataFactory.createAttendanceRecord(attendanceData);
      const pointsTransaction = TestDataFactory.createPointsTransaction({
        points: 1,
        type: "earned",
      });

      mockStudentRepository.exists.mockResolvedValue(true);
      mockAttendanceRepository.findByStudentAndDate.mockResolvedValue(null);
      mockAttendanceRepository.create.mockResolvedValue(attendanceRecord);
      mockPointsRepository.awardAttendancePoints.mockResolvedValue([
        pointsTransaction,
      ]);

      // Act
      const result = await attendanceService.recordAttendance(attendanceData);

      // Assert
      expect(result.pointsAwarded).toEqual([pointsTransaction]);
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "awardAttendancePoints",
        1,
        1
      );
    });

    test("should not award points for absent attendance", async () => {
      // Arrange
      const attendanceData = {
        student_id: 1,
        date: "2025-11-01",
        status: "absent",
      };

      const attendanceRecord =
        TestDataFactory.createAttendanceRecord(attendanceData);

      mockStudentRepository.exists.mockResolvedValue(true);
      mockAttendanceRepository.findByStudentAndDate.mockResolvedValue(null);
      mockAttendanceRepository.create.mockResolvedValue(attendanceRecord);

      // Act
      const result = await attendanceService.recordAttendance(attendanceData);

      // Assert
      expect(result.pointsAwarded).toBeUndefined();
      TestAssertions.expectRepositoryMethodNotCalled(
        mockPointsRepository,
        "awardAttendancePoints"
      );
    });

    test("should reject attendance for non-existent student", async () => {
      // Arrange
      const attendanceData = TestDataFactory.createAttendanceRecord({
        student_id: 999,
      });
      mockStudentRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => attendanceService.recordAttendance(attendanceData),
        "Student not found"
      );

      TestAssertions.expectRepositoryMethodNotCalled(
        mockAttendanceRepository,
        "create"
      );
    });

    test("should reject duplicate attendance record", async () => {
      // Arrange
      const attendanceData = TestDataFactory.createAttendanceRecord();
      const existingRecord = TestDataFactory.createAttendanceRecord();

      mockStudentRepository.exists.mockResolvedValue(true);
      mockAttendanceRepository.findByStudentAndDate.mockResolvedValue(
        existingRecord
      );

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => attendanceService.recordAttendance(attendanceData),
        "Attendance already recorded for this date"
      );

      TestAssertions.expectRepositoryMethodNotCalled(
        mockAttendanceRepository,
        "create"
      );
    });

    test("should reject attendance with invalid data", async () => {
      // Arrange
      const invalidData = {
        student_id: 1,
        date: "invalid-date",
        status: "invalid-status",
      };

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => attendanceService.recordAttendance(invalidData),
        "Validation failed"
      );

      TestAssertions.expectRepositoryMethodNotCalled(
        mockAttendanceRepository,
        "create"
      );
    });
  });

  describe("getAttendanceRecord", () => {
    test("should return attendance record with computed fields", async () => {
      // Arrange
      const record = TestDataFactory.createAttendanceRecord();
      mockAttendanceRepository.findById.mockResolvedValue(record);

      // Act
      const result = await attendanceService.getAttendanceRecord(1);

      // Assert
      expect(result).toHaveProperty("dayOfWeek");
      expect(result).toHaveProperty("isWeekend");
      expect(result).toHaveProperty("pointsEarned");
      TestAssertions.expectRepositoryMethodCalled(
        mockAttendanceRepository,
        "findById",
        1
      );
    });

    test("should return null for non-existent record", async () => {
      // Arrange
      mockAttendanceRepository.findById.mockResolvedValue(null);

      // Act
      const result = await attendanceService.getAttendanceRecord(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getStudentAttendance", () => {
    test("should return paginated attendance with summary", async () => {
      // Arrange
      const records = [
        TestDataFactory.createAttendanceRecord({ status: "present" }),
        TestDataFactory.createAttendanceRecord({ status: "absent" }),
      ];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockAttendanceRepository.findByStudentId.mockResolvedValue(records);
      mockAttendanceRepository.countByStudentId.mockResolvedValue(20);

      // Act
      const result = await attendanceService.getStudentAttendance(1, {
        page: 1,
        limit: 2,
      });

      // Assert
      expect(result.attendance).toHaveLength(2);
      expect(result.pagination.total).toBe(20);
      expect(result.summary.totalDays).toBe(2);
      expect(result.summary.presentDays).toBe(1);
      expect(result.summary.absentDays).toBe(1);
      expect(result.summary.attendanceRate).toBe(50);
    });

    test("should filter attendance by date range", async () => {
      // Arrange
      const startDate = new Date("2025-11-01");
      const endDate = new Date("2025-11-30");
      const records = [TestDataFactory.createAttendanceRecord()];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockAttendanceRepository.findByDateRange.mockResolvedValue(records);

      // Act
      const result = await attendanceService.getStudentAttendance(1, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Assert
      expect(result.attendance).toEqual(records);
      TestAssertions.expectRepositoryMethodCalled(
        mockAttendanceRepository,
        "findByDateRange",
        1,
        startDate,
        endDate
      );
    });

    test("should reject request for non-existent student", async () => {
      // Arrange
      mockStudentRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => attendanceService.getStudentAttendance(999),
        "Student not found"
      );
    });
  });

  describe("updateAttendance", () => {
    test("should update attendance record successfully", async () => {
      // Arrange
      const existingRecord = TestDataFactory.createAttendanceRecord({
        status: "absent",
      });
      const updates = { status: "present", notes: "Late arrival" };
      const updatedRecord = { ...existingRecord, ...updates };

      mockAttendanceRepository.findById.mockResolvedValue(existingRecord);
      mockAttendanceRepository.update.mockResolvedValue(updatedRecord);

      // Act
      const result = await attendanceService.updateAttendance(1, updates);

      // Assert
      expect(result.status).toBe("present");
      expect(result.notes).toBe("Late arrival");
      TestAssertions.expectRepositoryMethodCalled(
        mockAttendanceRepository,
        "update",
        1,
        updates
      );
    });

    test("should award points when changing from absent to present", async () => {
      // Arrange
      const existingRecord = TestDataFactory.createAttendanceRecord({
        status: "absent",
      });
      const updates = { status: "present" };
      const updatedRecord = { ...existingRecord, ...updates };
      const pointsTransaction = TestDataFactory.createPointsTransaction({
        points: 1,
      });

      mockAttendanceRepository.findById.mockResolvedValue(existingRecord);
      mockAttendanceRepository.update.mockResolvedValue(updatedRecord);
      mockPointsRepository.awardAttendancePoints.mockResolvedValue([
        pointsTransaction,
      ]);

      // Act
      const result = await attendanceService.updateAttendance(1, updates);

      // Assert
      expect(result.pointsAwarded).toEqual([pointsTransaction]);
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "awardAttendancePoints",
        updatedRecord.student_id,
        1
      );
    });

    test("should return null for non-existent record", async () => {
      // Arrange
      mockAttendanceRepository.findById.mockResolvedValue(null);

      // Act
      const result = await attendanceService.updateAttendance(999, {
        status: "present",
      });

      // Assert
      expect(result).toBeNull();
    });

    test("should reject update with invalid data", async () => {
      // Arrange
      const invalidUpdates = { status: "invalid-status" };

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => attendanceService.updateAttendance(1, invalidUpdates),
        "Validation failed"
      );
    });
  });

  describe("deleteAttendance", () => {
    test("should delete attendance record successfully", async () => {
      // Arrange
      const record = TestDataFactory.createAttendanceRecord();
      mockAttendanceRepository.findById.mockResolvedValue(record);
      mockAttendanceRepository.delete.mockResolvedValue(true);

      // Act
      const result = await attendanceService.deleteAttendance(1);

      // Assert
      expect(result).toBe(true);
      TestAssertions.expectRepositoryMethodCalled(
        mockAttendanceRepository,
        "delete",
        1
      );
    });

    test("should return false for non-existent record", async () => {
      // Arrange
      mockAttendanceRepository.findById.mockResolvedValue(null);

      // Act
      const result = await attendanceService.deleteAttendance(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getAttendanceAnalytics", () => {
    test("should return comprehensive analytics for student", async () => {
      // Arrange
      const records = [
        TestDataFactory.createAttendanceRecord({
          status: "present",
          date: new Date("2025-11-01"),
        }),
        TestDataFactory.createAttendanceRecord({
          status: "absent",
          date: new Date("2025-11-02"),
        }),
        TestDataFactory.createAttendanceRecord({
          status: "late",
          date: new Date("2025-11-03"),
        }),
      ];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockAttendanceRepository.getForAnalytics.mockResolvedValue(records);

      // Act
      const result = await attendanceService.getAttendanceAnalytics(1);

      // Assert
      expect(result.overview.totalDays).toBe(3);
      expect(result.overview.presentDays).toBe(1);
      expect(result.overview.absentDays).toBe(1);
      expect(result.overview.lateDays).toBe(1);
      expect(result.overview.attendanceRate).toBe(33.33);
      expect(result.trends).toBeDefined();
      expect(result.patterns).toBeDefined();
    });

    test("should analyze attendance patterns by day of week", async () => {
      // Arrange
      const records = [
        TestDataFactory.createAttendanceRecord({
          status: "present",
          date: new Date("2025-11-04"),
        }), // Monday
        TestDataFactory.createAttendanceRecord({
          status: "absent",
          date: new Date("2025-11-11"),
        }), // Monday
      ];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockAttendanceRepository.getForAnalytics.mockResolvedValue(records);

      // Act
      const result = await attendanceService.getAttendanceAnalytics(1);

      // Assert
      expect(result.patterns.byDayOfWeek).toBeDefined();
      expect(result.patterns.byDayOfWeek.Monday).toEqual({
        total: 2,
        present: 1,
        absent: 1,
        rate: 50,
      });
    });

    test("should reject analytics for non-existent student", async () => {
      // Arrange
      mockStudentRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => attendanceService.getAttendanceAnalytics(999),
        "Student not found"
      );
    });
  });

  describe("generateAttendanceReport", () => {
    test("should generate comprehensive report for date range", async () => {
      // Arrange
      const startDate = new Date("2025-11-01");
      const endDate = new Date("2025-11-30");
      const records = [
        TestDataFactory.createAttendanceRecord({ status: "present" }),
        TestDataFactory.createAttendanceRecord({ status: "absent" }),
      ];

      mockAttendanceRepository.findByDateRange.mockResolvedValue(records);

      // Act
      const result = await attendanceService.generateAttendanceReport({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Assert
      expect(result.summary.totalRecords).toBe(2);
      expect(result.summary.presentCount).toBe(1);
      expect(result.summary.absentCount).toBe(1);
      expect(result.summary.overallAttendanceRate).toBe(50);
      expect(result.details).toEqual(records);
      expect(result.period.start).toEqual(startDate);
      expect(result.period.end).toEqual(endDate);
    });

    test("should filter report by student IDs", async () => {
      // Arrange
      const studentIds = [1, 2];
      const records = [TestDataFactory.createAttendanceRecord()];

      mockAttendanceRepository.findByStudentIds.mockResolvedValue(records);

      // Act
      const result = await attendanceService.generateAttendanceReport({
        studentIds,
        startDate: "2025-11-01",
        endDate: "2025-11-30",
      });

      // Assert
      expect(result.details).toEqual(records);
      TestAssertions.expectRepositoryMethodCalled(
        mockAttendanceRepository,
        "findByStudentIds",
        studentIds
      );
    });
  });

  describe("getAbsentStudents", () => {
    test("should return students absent on specific date", async () => {
      // Arrange
      const date = new Date("2025-11-01");
      const absentRecords = [
        TestDataFactory.createAttendanceRecord({ status: "absent", date }),
      ];

      mockAttendanceRepository.findByDate.mockResolvedValue(absentRecords);

      // Act
      const result = await attendanceService.getAbsentStudents(date);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("absent");
      TestAssertions.expectRepositoryMethodCalled(
        mockAttendanceRepository,
        "findByDate",
        date
      );
    });
  });

  describe("getAttendanceStreak", () => {
    test("should calculate current attendance streak", async () => {
      // Arrange
      const records = [
        TestDataFactory.createAttendanceRecord({
          status: "present",
          date: new Date("2025-11-03"),
        }),
        TestDataFactory.createAttendanceRecord({
          status: "present",
          date: new Date("2025-11-02"),
        }),
        TestDataFactory.createAttendanceRecord({
          status: "present",
          date: new Date("2025-11-01"),
        }),
        TestDataFactory.createAttendanceRecord({
          status: "absent",
          date: new Date("2025-10-31"),
        }),
      ];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockAttendanceRepository.findByStudentId.mockResolvedValue(records);

      // Act
      const result = await attendanceService.getAttendanceStreak(1);

      // Assert
      expect(result.currentStreak).toBe(3);
      expect(result.longestStreak).toBe(3);
      expect(result.streakType).toBe("present");
    });

    test("should handle students with no attendance records", async () => {
      // Arrange
      mockStudentRepository.exists.mockResolvedValue(true);
      mockAttendanceRepository.findByStudentId.mockResolvedValue([]);

      // Act
      const result = await attendanceService.getAttendanceStreak(1);

      // Assert
      expect(result.currentStreak).toBe(0);
      expect(result.longestStreak).toBe(0);
      expect(result.streakType).toBe(null);
    });
  });

  describe("validateAttendanceData", () => {
    test("should validate correct attendance data", async () => {
      // Arrange
      const validData = {
        student_id: 1,
        date: "2025-11-01",
        status: "present",
      };

      // Act
      const result = await attendanceService.validateAttendanceData(validData);

      // Assert
      TestAssertions.expectValidationSuccess(result);
    });

    test("should reject data with missing required fields", async () => {
      // Arrange
      const invalidData = {
        status: "present",
        // Missing student_id and date
      };

      // Act
      const result = await attendanceService.validateAttendanceData(
        invalidData
      );

      // Assert
      TestAssertions.expectValidationError(result, "Student ID is required");
      TestAssertions.expectValidationError(result, "Date is required");
    });

    test("should reject data with invalid status", async () => {
      // Arrange
      const invalidData = {
        student_id: 1,
        date: "2025-11-01",
        status: "invalid",
      };

      // Act
      const result = await attendanceService.validateAttendanceData(
        invalidData
      );

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Status must be present, absent, late, or excused"
      );
    });

    test("should reject data with future date", async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const invalidData = {
        student_id: 1,
        date: futureDate.toISOString().split("T")[0],
        status: "present",
      };

      // Act
      const result = await attendanceService.validateAttendanceData(
        invalidData
      );

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Attendance date cannot be in the future"
      );
    });
  });

  describe("error handling", () => {
    test("should handle repository errors gracefully", async () => {
      // Arrange
      mockAttendanceRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => attendanceService.getAttendanceRecord(1),
        "Failed to get attendance record"
      );
    });

    test("should handle validation errors properly", async () => {
      // Arrange
      const invalidData = { invalid: "data" };

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => attendanceService.recordAttendance(invalidData),
        "Validation failed"
      );
    });
  });
});
