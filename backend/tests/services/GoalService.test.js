/**
 * @fileoverview Goal Service Unit Tests
 * @description Comprehensive unit tests for GoalService business logic operations.
 * Tests validation, goal management, analytics, and integration with repositories.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import { GoalService } from "../../services/GoalService.js";
import {
  MockGoalRepository,
  MockStudentRepository,
  MockPointsRepository,
  TestDataFactory,
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
      const goalData = {
        student_id: 1,
        title: "Complete Math Assignment",
        description: "Finish algebra homework",
        target_date: new Date("2025-12-15"),
        priority: "medium",
      };

      const expectedGoal = TestDataFactory.createGoal(goalData);

      mockStudentRepository.exists.mockResolvedValue(true);
      mockGoalRepository.create.mockResolvedValue(expectedGoal);

      const result = await goalService.createGoal(goalData);

      expect(result.success).toBe(true);
      expect(result.goal).toEqual(expectedGoal);
      expect(mockStudentRepository.exists).toHaveBeenCalledWith(1);
      expect(mockGoalRepository.create).toHaveBeenCalledWith(goalData);
    });

    test("should reject goal creation for non-existent student", async () => {
      const goalData = TestDataFactory.createGoal({ student_id: 999 });
      mockStudentRepository.exists.mockResolvedValue(false);

      await expect(goalService.createGoal(goalData)).rejects.toThrow(
        "Student not found"
      );

      expect(mockGoalRepository.create).not.toHaveBeenCalled();
    });

    test("should reject goal creation with invalid data", async () => {
      const invalidGoalData = {
        student_id: 1,
        title: "",
        target_date: null,
      };

      await expect(goalService.createGoal(invalidGoalData)).rejects.toThrow(
        "Validation failed"
      );
    });
  });

  describe("getGoalById", () => {
    test("should return goal with basic data", async () => {
      const goal = TestDataFactory.createGoal();
      mockGoalRepository.findById.mockResolvedValue(goal);

      const result = await goalService.getGoalById(1);

      expect(result).toEqual(goal);
      expect(mockGoalRepository.findById).toHaveBeenCalledWith(1);
    });

    test("should return goal with computed fields when includeProgress is true", async () => {
      const goal = TestDataFactory.createGoal();
      mockGoalRepository.findById.mockResolvedValue(goal);

      const result = await goalService.getGoalById(1, {
        includeProgress: true,
      });

      expect(result).toHaveProperty("daysRemaining");
      expect(result).toHaveProperty("isOverdue");
      expect(result).toHaveProperty("priorityScore");
    });

    test("should return null for non-existent goal", async () => {
      mockGoalRepository.findById.mockResolvedValue(null);

      const result = await goalService.getGoalById(999);

      expect(result).toBeNull();
    });

    test("should handle repository errors gracefully", async () => {
      mockGoalRepository.findById.mockRejectedValue(
        new Error("Database error")
      );

      await expect(goalService.getGoalById(1)).rejects.toThrow(
        "Failed to get goal by ID"
      );
    });
  });

  describe("getStudentGoals", () => {
    test("should return paginated goals for student", async () => {
      const goals = [
        TestDataFactory.createGoal({ id: 1 }),
        TestDataFactory.createGoal({ id: 2 }),
      ];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockGoalRepository.findByStudentId.mockResolvedValue(goals);
      mockGoalRepository.countByStudentId.mockResolvedValue(10);

      const result = await goalService.getStudentGoals(1, {
        page: 1,
        limit: 2,
      });

      expect(result.goals).toBeInstanceOf(Array);
      expect(result.goals.length).toBe(2);
      expect(result.goals[0]).toHaveProperty("daysRemaining");
      expect(result.goals[0]).toHaveProperty("isOverdue");
      expect(result.goals[0]).toHaveProperty("completionRate");
      expect(result.pagination.total).toBe(10);
    });

    test("should reject request for non-existent student", async () => {
      mockStudentRepository.exists.mockResolvedValue(false);

      await expect(goalService.getStudentGoals(999)).rejects.toThrow(
        "Student not found"
      );
    });
  });

  describe("completeGoal", () => {
    test("should complete goal and award points successfully", async () => {
      const goal = TestDataFactory.createGoal({
        is_completed: false,
        target_date: new Date("2025-12-01"),
      });

      const completedGoal = {
        ...goal,
        is_completed: true,
        completed_at: new Date(),
      };

      const pointsTransaction = TestDataFactory.createPointsTransaction({
        points: 10,
        reason: "earned",
      });

      mockGoalRepository.findById.mockResolvedValue(goal);
      mockGoalRepository.update.mockResolvedValue(completedGoal);
      mockPointsRepository.awardGoalPoints.mockResolvedValue([
        pointsTransaction,
      ]);

      const result = await goalService.completeGoal(1);

      expect(result.goal.is_completed).toBe(true);
      expect(mockGoalRepository.update).toHaveBeenCalled();
      expect(mockPointsRepository.awardGoalPoints).toHaveBeenCalled();
    });

    test("should reject completion of already completed goal", async () => {
      const completedGoal = TestDataFactory.createGoal({ is_completed: true });
      mockGoalRepository.findById.mockResolvedValue(completedGoal);

      await expect(goalService.completeGoal(1)).rejects.toThrow(
        "Goal is already completed"
      );
    });

    test("should reject completion of non-existent goal", async () => {
      mockGoalRepository.findById.mockResolvedValue(null);

      await expect(goalService.completeGoal(999)).rejects.toThrow(
        "Goal not found"
      );
    });
  });

  describe("updateGoal", () => {
    test("should update goal with valid data", async () => {
      const existingGoal = TestDataFactory.createGoal();
      const updates = { title: "Updated Goal Title" };
      const updatedGoal = { ...existingGoal, ...updates };

      mockGoalRepository.findById.mockResolvedValue(existingGoal);
      mockGoalRepository.update.mockResolvedValue(updatedGoal);

      const result = await goalService.updateGoal(1, updates);

      expect(result.title).toBe("Updated Goal Title");
      expect(mockGoalRepository.update).toHaveBeenCalledWith(1, updates);
    });

    test("should return null for non-existent goal", async () => {
      mockGoalRepository.findById.mockResolvedValue(null);

      const result = await goalService.updateGoal(999, { title: "New Title" });

      expect(result).toBeNull();
    });

    test("should reject update with invalid data", async () => {
      const invalidUpdates = { title: "x".repeat(201) };

      await expect(goalService.updateGoal(1, invalidUpdates)).rejects.toThrow(
        "Validation failed"
      );
    });
  });

  describe("deleteGoal", () => {
    test("should delete goal successfully", async () => {
      const goal = TestDataFactory.createGoal({ is_completed: false });
      mockGoalRepository.findById.mockResolvedValue(goal);
      mockGoalRepository.delete.mockResolvedValue(true);

      const result = await goalService.deleteGoal(1);

      expect(result).toBe(true);
      expect(mockGoalRepository.delete).toHaveBeenCalledWith(1);
    });

    test("should delete completed goal successfully", async () => {
      const completedGoal = TestDataFactory.createGoal({ is_completed: true });
      mockGoalRepository.findById.mockResolvedValue(completedGoal);
      mockGoalRepository.delete.mockResolvedValue(true);

      const result = await goalService.deleteGoal(1);

      expect(result).toBe(true);
    });

    test("should return false for non-existent goal", async () => {
      mockGoalRepository.findById.mockResolvedValue(null);

      const result = await goalService.deleteGoal(999);

      expect(result).toBe(false);
    });
  });

  describe("validateGoalData", () => {
    test("should validate correct goal data", async () => {
      const validData = {
        student_id: 1,
        title: "Valid Goal",
        target_date: new Date("2025-12-01"),
        priority: "medium",
      };

      const result = await goalService.validateGoalData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("should reject data with missing required fields", async () => {
      const invalidData = {
        title: "Missing student_id and target_date",
      };

      const result = await goalService.validateGoalData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test("should reject data with invalid priority", async () => {
      const invalidData = {
        student_id: 1,
        title: "Valid Title",
        target_date: new Date("2025-12-01"),
        priority: "invalid",
      };

      const result = await goalService.validateGoalData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test("should reject data with title too long", async () => {
      const invalidData = {
        student_id: 1,
        title: "x".repeat(201),
        target_date: new Date("2025-12-01"),
      };

      const result = await goalService.validateGoalData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes("title"))).toBe(true);
    });
  });

  describe("getGoalAnalytics", () => {
    test("should return comprehensive analytics for student", async () => {
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

      const result = await goalService.getGoalAnalytics(1);

      expect(result).toHaveProperty("metrics");
      expect(result.metrics.totalGoals).toBe(3);
      expect(result.metrics.completedGoals).toBe(2);
      expect(result.metrics.activeGoals).toBe(1);
    });

    test("should reject analytics for non-existent student", async () => {
      mockStudentRepository.exists.mockResolvedValue(false);

      await expect(goalService.getGoalAnalytics(999)).rejects.toThrow(
        "Student not found"
      );
    });
  });

  describe("calculateGoalPriorityScore", () => {
    test("should calculate priority score correctly", async () => {
      const highPriorityGoal = TestDataFactory.createGoal({
        priority: "high",
        target_date: new Date("2025-11-20"),
      });

      const score = await goalService.calculateGoalPriorityScore(
        highPriorityGoal
      );

      expect(score).toBeGreaterThan(0);
      expect(typeof score).toBe("number");
    });

    test("should handle low priority goals", async () => {
      const lowPriorityGoal = TestDataFactory.createGoal({
        priority: "low",
        target_date: new Date("2025-12-31"),
      });

      const score = await goalService.calculateGoalPriorityScore(
        lowPriorityGoal
      );

      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
});
