/**
 * @fileoverview Student Service Unit Tests
 * @description Comprehensive unit tests for StudentService business logic operations.
 * Tests student management, profile operations, statistics, and integration with repositories.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { StudentService } from "../../services/StudentService.js";
import {
  MockStudentRepository,
  MockGoalRepository,
  MockAttendanceRepository,
  MockPointsRepository,
  TestDataFactory,
  TestAssertions,
} from "../mocks/index.js";

describe("StudentService", () => {
  let studentService;
  let mockStudentRepository;
  let mockGoalRepository;
  let mockAttendanceRepository;
  let mockPointsRepository;

  beforeEach(() => {
    mockStudentRepository = new MockStudentRepository();
    mockGoalRepository = new MockGoalRepository();
    mockAttendanceRepository = new MockAttendanceRepository();
    mockPointsRepository = new MockPointsRepository();

    studentService = new StudentService(
      mockStudentRepository,
      mockGoalRepository,
      mockAttendanceRepository,
      mockPointsRepository
    );

    // Reset all mocks
    mockStudentRepository.reset();
    mockGoalRepository.reset();
    mockAttendanceRepository.reset();
    mockPointsRepository.reset();
  });

  describe("createStudent", () => {
    test("should create a student successfully with valid data", async () => {
      // Arrange
      const studentData = {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        grade_level: 9,
        parent_name: "Jane Doe",
        parent_phone: "+1234567890",
      };

      const expectedStudent = TestDataFactory.createStudent(studentData);

      mockStudentRepository.findByEmail.mockResolvedValue(null);
      mockStudentRepository.create.mockResolvedValue(expectedStudent);

      // Act
      const result = await studentService.createStudent(studentData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.student).toEqual(expectedStudent);
      TestAssertions.expectValidationSuccess(result.validation);
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "findByEmail",
        studentData.email
      );
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "create",
        studentData
      );
    });

    test("should reject student creation with duplicate email", async () => {
      // Arrange
      const studentData = TestDataFactory.createStudent();
      const existingStudent = TestDataFactory.createStudent({
        email: studentData.email,
      });

      mockStudentRepository.findByEmail.mockResolvedValue(existingStudent);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => studentService.createStudent(studentData),
        "Email already exists"
      );

      TestAssertions.expectRepositoryMethodNotCalled(
        mockStudentRepository,
        "create"
      );
    });

    test("should reject student creation with invalid data", async () => {
      // Arrange
      const invalidStudentData = {
        first_name: "", // Invalid: empty name
        email: "invalid-email", // Invalid: malformed email
        grade_level: 15, // Invalid: grade too high
      };

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => studentService.createStudent(invalidStudentData),
        "Validation failed"
      );

      TestAssertions.expectRepositoryMethodNotCalled(
        mockStudentRepository,
        "create"
      );
    });
  });

  describe("getStudentById", () => {
    test("should return student with computed fields when includeStats is true", async () => {
      // Arrange
      const student = TestDataFactory.createStudent();
      mockStudentRepository.findById.mockResolvedValue(student);

      // Act
      const result = await studentService.getStudentById(1, {
        includeStats: true,
      });

      // Assert
      expect(result).toHaveProperty("age");
      expect(result).toHaveProperty("isActive");
      expect(result).toHaveProperty("enrollmentDuration");
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "findById",
        1
      );
    });

    test("should return null for non-existent student", async () => {
      // Arrange
      mockStudentRepository.findById.mockResolvedValue(null);

      // Act
      const result = await studentService.getStudentById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getAllStudents", () => {
    test("should return paginated students with metadata", async () => {
      // Arrange
      const students = [
        TestDataFactory.createStudent({ id: 1 }),
        TestDataFactory.createStudent({ id: 2 }),
      ];

      mockStudentRepository.findAll.mockResolvedValue(students);
      mockStudentRepository.count.mockResolvedValue(10);

      // Act
      const result = await studentService.getAllStudents({ page: 1, limit: 2 });

      // Assert
      expect(result.students).toHaveLength(2);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.totalPages).toBe(5);
      expect(result.students[0]).toHaveProperty("age");
      expect(result.students[0]).toHaveProperty("isActive");
    });

    test("should filter students by grade level", async () => {
      // Arrange
      const gradeNineStudents = [
        TestDataFactory.createStudent({ grade_level: 9 }),
      ];

      mockStudentRepository.findByGradeLevel.mockResolvedValue(
        gradeNineStudents
      );

      // Act
      const result = await studentService.getAllStudents({ gradeLevel: 9 });

      // Assert
      expect(result.students).toHaveLength(1);
      expect(result.students[0].grade_level).toBe(9);
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "findByGradeLevel",
        9
      );
    });

    test("should filter students by enrollment status", async () => {
      // Arrange
      const activeStudents = [
        TestDataFactory.createStudent({ enrollment_status: "active" }),
      ];

      mockStudentRepository.findByEnrollmentStatus.mockResolvedValue(
        activeStudents
      );

      // Act
      const result = await studentService.getAllStudents({
        enrollmentStatus: "active",
      });

      // Assert
      expect(result.students).toHaveLength(1);
      expect(result.students[0].enrollment_status).toBe("active");
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "findByEnrollmentStatus",
        "active"
      );
    });
  });

  describe("updateStudent", () => {
    test("should update student with valid data", async () => {
      // Arrange
      const existingStudent = TestDataFactory.createStudent();
      const updates = { first_name: "Updated Name" };
      const updatedStudent = { ...existingStudent, ...updates };

      mockStudentRepository.findById.mockResolvedValue(existingStudent);
      mockStudentRepository.update.mockResolvedValue(updatedStudent);

      // Act
      const result = await studentService.updateStudent(1, updates);

      // Assert
      expect(result.first_name).toBe("Updated Name");
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "update",
        1,
        updates
      );
    });

    test("should return null for non-existent student", async () => {
      // Arrange
      mockStudentRepository.findById.mockResolvedValue(null);

      // Act
      const result = await studentService.updateStudent(999, {
        first_name: "New Name",
      });

      // Assert
      expect(result).toBeNull();
    });

    test("should reject update with invalid data", async () => {
      // Arrange
      const invalidUpdates = { email: "invalid-email" };

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => studentService.updateStudent(1, invalidUpdates),
        "Validation failed"
      );
    });

    test("should prevent email update to existing email", async () => {
      // Arrange
      const existingStudent = TestDataFactory.createStudent({ id: 1 });
      const anotherStudent = TestDataFactory.createStudent({
        id: 2,
        email: "taken@example.com",
      });
      const updates = { email: "taken@example.com" };

      mockStudentRepository.findById.mockResolvedValue(existingStudent);
      mockStudentRepository.findByEmail.mockResolvedValue(anotherStudent);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => studentService.updateStudent(1, updates),
        "Email already exists"
      );
    });
  });

  describe("deactivateStudent", () => {
    test("should deactivate active student successfully", async () => {
      // Arrange
      const activeStudent = TestDataFactory.createStudent({
        enrollment_status: "active",
      });
      const deactivatedStudent = {
        ...activeStudent,
        enrollment_status: "inactive",
      };

      mockStudentRepository.findById.mockResolvedValue(activeStudent);
      mockStudentRepository.update.mockResolvedValue(deactivatedStudent);

      // Act
      const result = await studentService.deactivateStudent(1);

      // Assert
      expect(result.enrollment_status).toBe("inactive");
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "update",
        1,
        { enrollment_status: "inactive" }
      );
    });

    test("should reject deactivation of already inactive student", async () => {
      // Arrange
      const inactiveStudent = TestDataFactory.createStudent({
        enrollment_status: "inactive",
      });
      mockStudentRepository.findById.mockResolvedValue(inactiveStudent);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => studentService.deactivateStudent(1),
        "Student is already inactive"
      );
    });

    test("should return null for non-existent student", async () => {
      // Arrange
      mockStudentRepository.findById.mockResolvedValue(null);

      // Act
      const result = await studentService.deactivateStudent(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("reactivateStudent", () => {
    test("should reactivate inactive student successfully", async () => {
      // Arrange
      const inactiveStudent = TestDataFactory.createStudent({
        enrollment_status: "inactive",
      });
      const reactivatedStudent = {
        ...inactiveStudent,
        enrollment_status: "active",
      };

      mockStudentRepository.findById.mockResolvedValue(inactiveStudent);
      mockStudentRepository.update.mockResolvedValue(reactivatedStudent);

      // Act
      const result = await studentService.reactivateStudent(1);

      // Assert
      expect(result.enrollment_status).toBe("active");
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "update",
        1,
        { enrollment_status: "active" }
      );
    });

    test("should reject reactivation of already active student", async () => {
      // Arrange
      const activeStudent = TestDataFactory.createStudent({
        enrollment_status: "active",
      });
      mockStudentRepository.findById.mockResolvedValue(activeStudent);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => studentService.reactivateStudent(1),
        "Student is already active"
      );
    });
  });

  describe("getStudentProfile", () => {
    test("should return comprehensive student profile", async () => {
      // Arrange
      const student = TestDataFactory.createStudent();
      const goals = [TestDataFactory.createGoal()];
      const attendanceRecords = [TestDataFactory.createAttendanceRecord()];
      const pointsSummary = { total: 100, pending: 10, history: [] };

      mockStudentRepository.findById.mockResolvedValue(student);
      mockGoalRepository.findByStudentId.mockResolvedValue(goals);
      mockAttendanceRepository.findByStudentId.mockResolvedValue(
        attendanceRecords
      );
      mockPointsRepository.getStudentSummary.mockResolvedValue(pointsSummary);

      // Act
      const result = await studentService.getStudentProfile(1);

      // Assert
      expect(result.student).toEqual(student);
      expect(result.goals).toEqual(goals);
      expect(result.attendance).toEqual(attendanceRecords);
      expect(result.points).toEqual(pointsSummary);
      expect(result.statistics).toHaveProperty("totalGoals");
      expect(result.statistics).toHaveProperty("attendanceRate");
    });

    test("should return null for non-existent student", async () => {
      // Arrange
      mockStudentRepository.findById.mockResolvedValue(null);

      // Act
      const result = await studentService.getStudentProfile(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getStudentStatistics", () => {
    test("should calculate comprehensive statistics", async () => {
      // Arrange
      const student = TestDataFactory.createStudent();
      const goals = [
        TestDataFactory.createGoal({ is_completed: true }),
        TestDataFactory.createGoal({ is_completed: false }),
      ];
      const attendanceRecords = [
        TestDataFactory.createAttendanceRecord({ status: "present" }),
        TestDataFactory.createAttendanceRecord({ status: "absent" }),
      ];
      const pointsSummary = { total: 150 };

      mockStudentRepository.findById.mockResolvedValue(student);
      mockGoalRepository.findByStudentId.mockResolvedValue(goals);
      mockAttendanceRepository.findByStudentId.mockResolvedValue(
        attendanceRecords
      );
      mockPointsRepository.getStudentSummary.mockResolvedValue(pointsSummary);

      // Act
      const result = await studentService.getStudentStatistics(1);

      // Assert
      expect(result.totalGoals).toBe(2);
      expect(result.completedGoals).toBe(1);
      expect(result.goalCompletionRate).toBe(50);
      expect(result.totalAttendance).toBe(2);
      expect(result.presentDays).toBe(1);
      expect(result.attendanceRate).toBe(50);
      expect(result.totalPoints).toBe(150);
    });

    test("should handle students with no data gracefully", async () => {
      // Arrange
      const student = TestDataFactory.createStudent();

      mockStudentRepository.findById.mockResolvedValue(student);
      mockGoalRepository.findByStudentId.mockResolvedValue([]);
      mockAttendanceRepository.findByStudentId.mockResolvedValue([]);
      mockPointsRepository.getStudentSummary.mockResolvedValue({ total: 0 });

      // Act
      const result = await studentService.getStudentStatistics(1);

      // Assert
      expect(result.totalGoals).toBe(0);
      expect(result.goalCompletionRate).toBe(0);
      expect(result.attendanceRate).toBe(0);
      expect(result.totalPoints).toBe(0);
    });
  });

  describe("searchStudents", () => {
    test("should search students by name", async () => {
      // Arrange
      const students = [
        TestDataFactory.createStudent({ first_name: "John", last_name: "Doe" }),
      ];

      mockStudentRepository.findByName.mockResolvedValue(students);

      // Act
      const result = await studentService.searchStudents("John");

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].first_name).toBe("John");
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "findByName",
        "John"
      );
    });

    test("should search students by email", async () => {
      // Arrange
      const student = TestDataFactory.createStudent({
        email: "test@example.com",
      });

      mockStudentRepository.findByEmail.mockResolvedValue(student);

      // Act
      const result = await studentService.searchStudents("test@example.com");

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe("test@example.com");
    });

    test("should return empty array for no matches", async () => {
      // Arrange
      mockStudentRepository.findByName.mockResolvedValue([]);
      mockStudentRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await studentService.searchStudents("nonexistent");

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe("validateStudentData", () => {
    test("should validate correct student data", async () => {
      // Arrange
      const validData = {
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        grade_level: 9,
        date_of_birth: "2008-01-01",
      };

      // Act
      const result = await studentService.validateStudentData(validData);

      // Assert
      TestAssertions.expectValidationSuccess(result);
    });

    test("should reject data with missing required fields", async () => {
      // Arrange
      const invalidData = {
        email: "test@example.com",
        // Missing first_name, last_name, grade_level
      };

      // Act
      const result = await studentService.validateStudentData(invalidData);

      // Assert
      TestAssertions.expectValidationError(result, "First name is required");
      TestAssertions.expectValidationError(result, "Last name is required");
      TestAssertions.expectValidationError(result, "Grade level is required");
    });

    test("should reject data with invalid email format", async () => {
      // Arrange
      const invalidData = {
        first_name: "John",
        last_name: "Doe",
        email: "invalid-email",
        grade_level: 9,
      };

      // Act
      const result = await studentService.validateStudentData(invalidData);

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Please provide a valid email address"
      );
    });

    test("should reject data with invalid grade level", async () => {
      // Arrange
      const invalidData = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        grade_level: 15, // Invalid: too high
      };

      // Act
      const result = await studentService.validateStudentData(invalidData);

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Grade level must be between 1 and 12"
      );
    });

    test("should reject data with names too long", async () => {
      // Arrange
      const invalidData = {
        first_name: "x".repeat(51), // Too long
        last_name: "x".repeat(51), // Too long
        email: "john@example.com",
        grade_level: 9,
      };

      // Act
      const result = await studentService.validateStudentData(invalidData);

      // Assert
      TestAssertions.expectValidationError(
        result,
        "First name must be 50 characters or less"
      );
      TestAssertions.expectValidationError(
        result,
        "Last name must be 50 characters or less"
      );
    });

    test("should reject data with invalid phone number format", async () => {
      // Arrange
      const invalidData = {
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        grade_level: 9,
        parent_phone: "123", // Invalid: too short
      };

      // Act
      const result = await studentService.validateStudentData(invalidData);

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Please provide a valid phone number"
      );
    });
  });

  describe("calculateAge", () => {
    test("should calculate age correctly", async () => {
      // Arrange
      const birthDate = new Date("2008-01-01");
      const student = TestDataFactory.createStudent({
        date_of_birth: birthDate,
      });

      // Act
      const age = await studentService.calculateAge(student);

      // Assert
      expect(age).toBe(16); // Assuming current year is 2024
    });

    test("should handle students without birth date", async () => {
      // Arrange
      const student = TestDataFactory.createStudent({ date_of_birth: null });

      // Act
      const age = await studentService.calculateAge(student);

      // Assert
      expect(age).toBeNull();
    });
  });

  describe("error handling", () => {
    test("should handle repository errors gracefully", async () => {
      // Arrange
      mockStudentRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => studentService.getStudentById(1),
        "Failed to get student by ID"
      );
    });

    test("should handle validation errors properly", async () => {
      // Arrange
      const invalidData = { invalid: "data" };

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => studentService.createStudent(invalidData),
        "Validation failed"
      );
    });
  });
});
