/**
 * @fileoverview Goal Service Unit Tests
 * @description Comprehensive unit tests for GoalService business logic operations.
 * Tests validation, goal management, analytics, and integration with repositories.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { GoalService } from "../../services/GoalService.js";
import {
  MockGoalRepository,
  MockStudentRepository,
  MockPointsRepository,
  TestDataFactory,
  TestAssertions,
} from "../mocks/index.js";

describe("GoalService", () => {
  let goalService;
  let mockGoalRepository;
  let mockStudentRepository;
  let mockPointsRepository;

  beforeEach(() => {
    mockGoalRepository = new MockGoalRepository();
    mockStudentRepository = new MockStudentRepository();
    mockPointsRepository = new MockPointsRepository();

    goalService = new GoalService(
      mockGoalRepository,
      mockStudentRepository,
      mockPointsRepository
    );

    // Reset all mocks
    mockGoalRepository.reset();
    mockStudentRepository.reset();
    mockPointsRepository.reset();
  });

  describe("createGoal", () => {
    test("should create a goal successfully with valid data", async () => {
      // Arrange
      const goalData = {
        student_id: 1,
        title: "Complete Math Assignment",
        description: "Finish algebra homework",
        target_date: new Date("2025-11-15"),
        priority: "medium",
      };

      const expectedGoal = TestDataFactory.createGoal(goalData);

      mockStudentRepository.exists.mockResolvedValue(true);
      mockGoalRepository.create.mockResolvedValue(expectedGoal);

      // Act
      const result = await goalService.createGoal(goalData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.goal).toEqual(expectedGoal);
      TestAssertions.expectValidationSuccess(result.validation);
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "exists",
        1
      );
      TestAssertions.expectRepositoryMethodCalled(
        mockGoalRepository,
        "create",
        goalData
      );
    });

    test("should reject goal creation with invalid data", async () => {
      // Arrange
      const invalidGoalData = {
        student_id: 1,
        title: "", // Invalid: empty title
        target_date: new Date("2020-01-01"), // Invalid: past date
      };

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => goalService.createGoal(invalidGoalData),
        "Validation failed"
      );

      TestAssertions.expectRepositoryMethodNotCalled(
        mockGoalRepository,
        "create"
      );
    });

    test("should reject goal creation for non-existent student", async () => {
      // Arrange
      const goalData = TestDataFactory.createGoal({ student_id: 999 });
      mockStudentRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => goalService.createGoal(goalData),
        "Student not found"
      );

      TestAssertions.expectRepositoryMethodNotCalled(
        mockGoalRepository,
        "create"
      );
    });
  });

  describe("getGoalById", () => {
    test("should return goal with computed fields when includeProgress is true", async () => {
      // Arrange
      const goal = TestDataFactory.createGoal();
      mockGoalRepository.findById.mockResolvedValue(goal);

      // Act
      const result = await goalService.getGoalById(1, {
        includeProgress: true,
      });

      // Assert
      expect(result).toHaveProperty("daysRemaining");
      expect(result).toHaveProperty("isOverdue");
      expect(result).toHaveProperty("priorityScore");
      TestAssertions.expectRepositoryMethodCalled(
        mockGoalRepository,
        "findById",
        1
      );
    });

    test("should return null for non-existent goal", async () => {
      // Arrange
      mockGoalRepository.findById.mockResolvedValue(null);

      // Act
      const result = await goalService.getGoalById(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getStudentGoals", () => {
    test("should return paginated goals with metadata", async () => {
      // Arrange
      const goals = [
        TestDataFactory.createGoal({ id: 1 }),
        TestDataFactory.createGoal({ id: 2 }),
      ];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockGoalRepository.findByStudentId.mockResolvedValue(goals);
      mockGoalRepository.countByStudentId.mockResolvedValue(10);

      // Act
      const result = await goalService.getStudentGoals(1, {
        page: 1,
        limit: 2,
      });

      // Assert
      expect(result.goals).toHaveLength(2);
      expect(result.pagination.total).toBe(10);
      expect(result.pagination.totalPages).toBe(5);
      expect(result.goals[0]).toHaveProperty("daysRemaining");
      expect(result.goals[0]).toHaveProperty("isOverdue");
    });

    test("should reject request for non-existent student", async () => {
      // Arrange
      mockStudentRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => goalService.getStudentGoals(999),
        "Student not found"
      );
    });
  });

  describe("completeGoal", () => {
    test("should complete goal and award points successfully", async () => {
      // Arrange
      const goal = TestDataFactory.createGoal({
        is_completed: false,
        target_date: new Date("2025-12-01"), // Future date for on-time completion
      });

      const updatedGoal = {
        ...goal,
        is_completed: true,
        completed_at: new Date(),
      };
      const pointsTransactions = [
        TestDataFactory.createPointsTransaction({ points: 2, type: "earned" }),
        TestDataFactory.createPointsTransaction({ points: 3, type: "bonus" }),
      ];

      mockGoalRepository.findById.mockResolvedValue(goal);
      mockGoalRepository.update.mockResolvedValue(updatedGoal);
      mockPointsRepository.awardGoalPoints.mockResolvedValue(
        pointsTransactions
      );

      // Act
      const result = await goalService.completeGoal(1);

      // Assert
      expect(result.goal.is_completed).toBe(true);
      expect(result.pointsAwarded).toEqual(pointsTransactions);
      expect(result.totalPointsEarned).toBe(5);
      expect(result.onTime).toBe(true);
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "awardGoalPoints",
        1,
        1,
        2,
        true
      );
    });

    test("should reject completion of already completed goal", async () => {
      // Arrange
      const completedGoal = TestDataFactory.createGoal({ is_completed: true });
      mockGoalRepository.findById.mockResolvedValue(completedGoal);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => goalService.completeGoal(1),
        "Goal is already completed"
      );
    });

    test("should reject completion of non-existent goal", async () => {
      // Arrange
      mockGoalRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => goalService.completeGoal(999),
        "Goal not found"
      );
    });
  });

  describe("updateGoal", () => {
    test("should update goal with valid data", async () => {
      // Arrange
      const existingGoal = TestDataFactory.createGoal();
      const updates = { title: "Updated Goal Title" };
      const updatedGoal = { ...existingGoal, ...updates };

      mockGoalRepository.findById.mockResolvedValue(existingGoal);
      mockGoalRepository.update.mockResolvedValue(updatedGoal);

      // Act
      const result = await goalService.updateGoal(1, updates);

      // Assert
      expect(result.title).toBe("Updated Goal Title");
      TestAssertions.expectRepositoryMethodCalled(
        mockGoalRepository,
        "update",
        1,
        updates
      );
    });

    test("should return null for non-existent goal", async () => {
      // Arrange
      mockGoalRepository.findById.mockResolvedValue(null);

      // Act
      const result = await goalService.updateGoal(999, { title: "New Title" });

      // Assert
      expect(result).toBeNull();
    });

    test("should reject update with invalid data", async () => {
      // Arrange
      const invalidUpdates = { title: "x".repeat(201) }; // Too long

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => goalService.updateGoal(1, invalidUpdates),
        "Validation failed"
      );
    });
  });

  describe("deleteGoal", () => {
    test("should delete active goal successfully", async () => {
      // Arrange
      const activeGoal = TestDataFactory.createGoal({ is_completed: false });
      mockGoalRepository.findById.mockResolvedValue(activeGoal);
      mockGoalRepository.delete.mockResolvedValue(true);

      // Act
      const result = await goalService.deleteGoal(1);

      // Assert
      expect(result).toBe(true);
      TestAssertions.expectRepositoryMethodCalled(
        mockGoalRepository,
        "delete",
        1
      );
    });

    test("should reject deletion of completed goal", async () => {
      // Arrange
      const completedGoal = TestDataFactory.createGoal({ is_completed: true });
      mockGoalRepository.findById.mockResolvedValue(completedGoal);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => goalService.deleteGoal(1),
        "Cannot delete completed goals"
      );
    });

    test("should return false for non-existent goal", async () => {
      // Arrange
      mockGoalRepository.findById.mockResolvedValue(null);

      // Act
      const result = await goalService.deleteGoal(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getGoalAnalytics", () => {
    test("should return comprehensive analytics for student", async () => {
      // Arrange
      const goals = [
        TestDataFactory.createGoal({
          is_completed: true,
          completed_at: new Date("2025-10-01"),
        }),
        TestDataFactory.createGoal({ is_completed: false }),
        TestDataFactory.createGoal({
          is_completed: true,
          completed_at: new Date("2025-10-02"),
        }),
      ];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockGoalRepository.getForAnalytics.mockResolvedValue(goals);

      // Act
      const result = await goalService.getGoalAnalytics(1);

      // Assert
      expect(result.metrics.totalGoals).toBe(3);
      expect(result.metrics.completedGoals).toBe(2);
      expect(result.metrics.activeGoals).toBe(1);
      expect(result.metrics.completionRate).toBe(66.67);
      expect(result.goals).toEqual(goals);
    });

    test("should reject analytics for non-existent student", async () => {
      // Arrange
      mockStudentRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => goalService.getGoalAnalytics(999),
        "Student not found"
      );
    });
  });

  describe("getOverdueGoals", () => {
    test("should return only overdue goals", async () => {
      // Arrange
      const pastDate = new Date("2025-10-01");
      const overdueGoals = [
        TestDataFactory.createGoal({
          target_date: pastDate,
          is_completed: false,
        }),
      ];

      mockGoalRepository.findByStudentId.mockResolvedValue(overdueGoals);

      // Act
      const result = await goalService.getOverdueGoals(1);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("daysOverdue");
      expect(result[0].daysOverdue).toBeGreaterThan(0);
    });
  });

  describe("validateGoalData", () => {
    test("should validate correct goal data", async () => {
      // Arrange
      const validData = {
        student_id: 1,
        title: "Valid Goal",
        target_date: new Date("2025-12-01"),
        priority: "medium",
      };

      // Act
      const result = await goalService.validateGoalData(validData);

      // Assert
      TestAssertions.expectValidationSuccess(result);
    });

    test("should reject data with missing required fields", async () => {
      // Arrange
      const invalidData = {
        title: "Missing student_id and target_date",
      };

      // Act
      const result = await goalService.validateGoalData(invalidData);

      // Assert
      TestAssertions.expectValidationError(result, "Student ID is required");
      TestAssertions.expectValidationError(result, "Target date is required");
    });

    test("should reject data with invalid priority", async () => {
      // Arrange
      const invalidData = {
        student_id: 1,
        title: "Valid Title",
        target_date: new Date("2025-12-01"),
        priority: "invalid",
      };

      // Act
      const result = await goalService.validateGoalData(invalidData);

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Priority must be low, medium, or high"
      );
    });

    test("should reject data with past target date", async () => {
      // Arrange
      const invalidData = {
        student_id: 1,
        title: "Valid Title",
        target_date: new Date("2020-01-01"),
      };

      // Act
      const result = await goalService.validateGoalData(invalidData);

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Target date cannot be in the past"
      );
    });

    test("should reject data with title too long", async () => {
      // Arrange
      const invalidData = {
        student_id: 1,
        title: "x".repeat(201), // Too long
        target_date: new Date("2025-12-01"),
      };

      // Act
      const result = await goalService.validateGoalData(invalidData);

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Goal title must be 200 characters or less"
      );
    });
  });

  describe("calculateGoalPriorityScore", () => {
    test("should calculate priority score correctly", async () => {
      // Arrange
      const highPriorityGoal = TestDataFactory.createGoal({
        priority: "high",
        target_date: new Date("2025-11-01"), // Very soon
      });

      // Act
      const score = await goalService.calculateGoalPriorityScore(
        highPriorityGoal
      );

      // Assert
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(20);
    });

    test("should handle overdue goals with maximum penalty", async () => {
      // Arrange
      const overdueGoal = TestDataFactory.createGoal({
        priority: "high",
        target_date: new Date("2025-10-01"), // Past date
      });

      // Act
      const score = await goalService.calculateGoalPriorityScore(overdueGoal);

      // Assert
      expect(score).toBe(20); // Maximum score due to overdue penalty
    });
  });

  describe("error handling", () => {
    test("should handle repository errors gracefully", async () => {
      // Arrange
      mockGoalRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => goalService.getGoalById(1),
        "Failed to get goal by ID"
      );
    });

    test("should handle validation errors properly", async () => {
      // Arrange
      const invalidData = { invalid: "data" };

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => goalService.createGoal(invalidData),
        "Validation failed"
      );
    });
  });
});
