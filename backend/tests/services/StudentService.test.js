/**
 * @fileoverview Student Service Unit Tests
 * @description Comprehensive unit tests for StudentService business logic operations.
 * Tests student management, profile operations, statistics, and integration with repositories.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { StudentService } from "../../services/StudentService.js";
import {
  MockStudentRepository,
  MockGoalRepository,
  MockAttendanceRepository,
  MockPointsRepository,
  TestDataFactory,
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
      const studentData = {
        name: "John Doe",
        contact_number: "+1234567890",
        address: "123 Test St",
        date_of_birth: "2000-01-01",
      };

      const expectedStudent = TestDataFactory.createStudent(studentData);

      mockStudentRepository.search.mockResolvedValue([]);
      mockStudentRepository.create.mockResolvedValue(expectedStudent);

      const result = await studentService.createStudent(studentData);

      expect(result.success).toBe(true);
      expect(result.student).toEqual(expectedStudent);
      expect(mockStudentRepository.search).toHaveBeenCalledWith(
        studentData.name,
        { exactMatch: true }
      );
      expect(mockStudentRepository.create).toHaveBeenCalledWith(studentData);
    });

    test("should reject student creation with duplicate name", async () => {
      const studentData = TestDataFactory.createStudent();
      const existingStudent = TestDataFactory.createStudent({ id: 2 });

      mockStudentRepository.search.mockResolvedValue([existingStudent]);

      await expect(studentService.createStudent(studentData)).rejects.toThrow(
        "A student with this name already exists"
      );

      expect(mockStudentRepository.create).not.toHaveBeenCalled();
    });

    test("should reject student creation with invalid data", async () => {
      const invalidStudentData = {
        name: "",
        contact_number: "invalid",
      };

      await expect(
        studentService.createStudent(invalidStudentData)
      ).rejects.toThrow("Validation failed");

      expect(mockStudentRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getStudentById", () => {
    test("should return student with basic data", async () => {
      const student = TestDataFactory.createStudent();
      mockStudentRepository.findById.mockResolvedValue(student);

      const result = await studentService.getStudentById(1);

      expect(result).toEqual(student);
      expect(mockStudentRepository.findById).toHaveBeenCalledWith(1, {
        includeAttendanceStats: false,
        includeGoalStats: false,
      });
    });

    test("should return student with attendance stats when requested", async () => {
      const student = TestDataFactory.createStudent();
      mockStudentRepository.findById.mockResolvedValue(student);

      const result = await studentService.getStudentById(1, {
        includeAttendanceStats: true,
      });

      expect(result).toEqual(student);
      expect(mockStudentRepository.findById).toHaveBeenCalledWith(1, {
        includeAttendanceStats: true,
        includeGoalStats: false,
      });
    });

    test("should return null for non-existent student", async () => {
      mockStudentRepository.findById.mockResolvedValue(null);

      const result = await studentService.getStudentById(999);

      expect(result).toBeNull();
    });

    test("should handle repository errors gracefully", async () => {
      mockStudentRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      await expect(studentService.getStudentById(1)).rejects.toThrow(
        "Failed to get student by ID"
      );
    });
  });

  describe("getAllStudents", () => {
    test("should return paginated students", async () => {
      const students = [
        TestDataFactory.createStudent({ id: 1 }),
        TestDataFactory.createStudent({ id: 2 }),
      ];

      mockStudentRepository.findAll.mockResolvedValue(students);
      mockStudentRepository.countAll.mockResolvedValue(10);

      const result = await studentService.getAllStudents({
        page: 1,
        limit: 2,
      });

      expect(result.students).toEqual(students);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(2);
    });

    test("should handle empty results", async () => {
      mockStudentRepository.findAll.mockResolvedValue([]);
      mockStudentRepository.countAll.mockResolvedValue(0);

      const result = await studentService.getAllStudents();

      expect(result.students).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("updateStudent", () => {
    test("should update student with valid data", async () => {
      const existingStudent = TestDataFactory.createStudent();
      const updates = { name: "Updated Name" };
      const updatedStudent = { ...existingStudent, ...updates };

      mockStudentRepository.findById.mockResolvedValue(existingStudent);
      mockStudentRepository.search.mockResolvedValue([]); // No duplicates
      mockStudentRepository.update.mockResolvedValue(updatedStudent);

      const result = await studentService.updateStudent(1, updates);

      expect(result.name).toBe("Updated Name");
      expect(mockStudentRepository.update).toHaveBeenCalledWith(1, updates);
    });

    test("should return null for non-existent student", async () => {
      mockStudentRepository.findById.mockResolvedValue(null);

      const result = await studentService.updateStudent(999, { name: "Test" });

      expect(result).toBeNull();
      expect(mockStudentRepository.update).not.toHaveBeenCalled();
    });

    test("should reject update with invalid data", async () => {
      const invalidUpdates = { contact_number: "invalid" };

      await expect(
        studentService.updateStudent(1, invalidUpdates)
      ).rejects.toThrow("Validation failed");
    });
  });

  describe("deleteStudent", () => {
    test("should delete student successfully", async () => {
      mockStudentRepository.findById.mockResolvedValue(
        TestDataFactory.createStudent()
      );
      mockStudentRepository.delete.mockResolvedValue(true);

      const result = await studentService.deleteStudent(1);

      expect(result).toBe(true);
      expect(mockStudentRepository.delete).toHaveBeenCalledWith(1);
    });

    test("should return false for non-existent student", async () => {
      mockStudentRepository.findById.mockResolvedValue(null);

      const result = await studentService.deleteStudent(999);

      expect(result).toBe(false);
      expect(mockStudentRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe.skip("getStudentProfile - Use getStudentDashboard instead", () => {
    test("should return comprehensive student profile", async () => {
      const student = TestDataFactory.createStudent();
      const goals = [TestDataFactory.createGoal()];
      const attendance = [TestDataFactory.createAttendance()];
      const pointsSummary = { balance: 100, history: [] };

      mockStudentRepository.findById.mockResolvedValue(student);
      mockGoalRepository.findByStudentId.mockResolvedValue(goals);
      mockAttendanceRepository.findByStudentId.mockResolvedValue(attendance);
      mockPointsRepository.getStudentSummary.mockResolvedValue(pointsSummary);

      const result = await studentService.getStudentProfile(1);

      expect(result.student).toEqual(student);
      expect(result.goals).toEqual(goals);
      expect(result.attendance).toEqual(attendance);
      expect(result.points).toEqual(pointsSummary);
    });

    test("should return null for non-existent student", async () => {
      mockStudentRepository.findById.mockResolvedValue(null);

      const result = await studentService.getStudentProfile(999);

      expect(result).toBeNull();
    });
  });

  describe("validateStudentData", () => {
    test("should validate correct student data", async () => {
      const validData = {
        name: "John Doe",
        contact_number: "+1234567890",
        address: "123 Test St",
        date_of_birth: "2000-01-01",
      };

      const result = await studentService.validateStudentData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject data with missing required fields", async () => {
      const invalidData = {
        contact_number: "+1234567890",
      };

      const result = await studentService.validateStudentData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test("should reject data with invalid phone number", async () => {
      const invalidData = {
        name: "John Doe",
        contact_number: "123",
        address: "123 Test St",
        date_of_birth: "2000-01-01",
      };

      const result = await studentService.validateStudentData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("searchStudents", () => {
    test("should search students by name", async () => {
      const students = [TestDataFactory.createStudent({ name: "John Doe" })];

      mockStudentRepository.search.mockResolvedValue(students);

      const result = await studentService.searchStudents("John");

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty("searchRelevance");
      expect(mockStudentRepository.search).toHaveBeenCalledWith("John", {});
    });

    test("should return empty array for no matches", async () => {
      mockStudentRepository.search.mockResolvedValue([]);

      const result = await studentService.searchStudents("nonexistent");

      expect(result).toEqual([]);
    });
  });
});
