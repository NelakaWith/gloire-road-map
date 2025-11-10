/**
 * @fileoverview Points Service Unit Tests
 * @description Comprehensive unit tests for PointsService business logic operations.
 * Tests points management, rewards system, leaderboards, and integration with repositories.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { PointsService } from "../../services/PointsService.js";
import {
  MockPointsRepository,
  MockStudentRepository,
  TestDataFactory,
  TestAssertions,
} from "../mocks/index.js";

describe("PointsService", () => {
  let pointsService;
  let mockPointsRepository;
  let mockStudentRepository;

  beforeEach(() => {
    mockPointsRepository = new MockPointsRepository();
    mockStudentRepository = new MockStudentRepository();

    pointsService = new PointsService(
      mockPointsRepository,
      mockStudentRepository
    );

    // Reset all mocks
    mockPointsRepository.reset();
    mockStudentRepository.reset();
  });

  describe("awardPoints", () => {
    test("should award points successfully with valid data", async () => {
      // Arrange
      const pointsData = {
        student_id: 1,
        points: 10,
        type: "earned",
        source_type: "goal",
        source_id: 1,
        description: "Goal completion bonus",
      };

      const expectedTransaction =
        TestDataFactory.createPointsTransaction(pointsData);

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.create.mockResolvedValue(expectedTransaction);

      // Act
      const result = await pointsService.awardPoints(pointsData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.transaction).toEqual(expectedTransaction);
      TestAssertions.expectValidationSuccess(result.validation);
      TestAssertions.expectRepositoryMethodCalled(
        mockStudentRepository,
        "exists",
        1
      );
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "create",
        pointsData
      );
    });

    test("should reject points award for non-existent student", async () => {
      // Arrange
      const pointsData = TestDataFactory.createPointsTransaction({
        student_id: 999,
      });
      mockStudentRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => pointsService.awardPoints(pointsData),
        "Student not found"
      );

      TestAssertions.expectRepositoryMethodNotCalled(
        mockPointsRepository,
        "create"
      );
    });

    test("should reject points award with invalid data", async () => {
      // Arrange
      const invalidData = {
        student_id: 1,
        points: -5, // Invalid: negative points for earned type
        type: "earned",
      };

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => pointsService.awardPoints(invalidData),
        "Validation failed"
      );

      TestAssertions.expectRepositoryMethodNotCalled(
        mockPointsRepository,
        "create"
      );
    });
  });

  describe("deductPoints", () => {
    test("should deduct points successfully with sufficient balance", async () => {
      // Arrange
      const deductionData = {
        student_id: 1,
        points: 5,
        type: "deducted",
        description: "Late attendance penalty",
      };

      const expectedTransaction =
        TestDataFactory.createPointsTransaction(deductionData);

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.getStudentBalance.mockResolvedValue(10); // Sufficient balance
      mockPointsRepository.create.mockResolvedValue(expectedTransaction);

      // Act
      const result = await pointsService.deductPoints(deductionData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.transaction).toEqual(expectedTransaction);
      expect(result.newBalance).toBe(5);
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "getStudentBalance",
        1
      );
    });

    test("should reject deduction with insufficient balance", async () => {
      // Arrange
      const deductionData = {
        student_id: 1,
        points: 15,
        type: "deducted",
      };

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.getStudentBalance.mockResolvedValue(10); // Insufficient balance

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => pointsService.deductPoints(deductionData),
        "Insufficient points balance"
      );

      TestAssertions.expectRepositoryMethodNotCalled(
        mockPointsRepository,
        "create"
      );
    });

    test("should allow negative balance if allowNegative is true", async () => {
      // Arrange
      const deductionData = {
        student_id: 1,
        points: 15,
        type: "deducted",
      };

      const expectedTransaction =
        TestDataFactory.createPointsTransaction(deductionData);

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.getStudentBalance.mockResolvedValue(10);
      mockPointsRepository.create.mockResolvedValue(expectedTransaction);

      // Act
      const result = await pointsService.deductPoints(deductionData, true);

      // Assert
      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(-5);
    });
  });

  describe("getStudentBalance", () => {
    test("should return current student balance", async () => {
      // Arrange
      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.getStudentBalance.mockResolvedValue(150);

      // Act
      const result = await pointsService.getStudentBalance(1);

      // Assert
      expect(result).toBe(150);
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "getStudentBalance",
        1
      );
    });

    test("should reject request for non-existent student", async () => {
      // Arrange
      mockStudentRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => pointsService.getStudentBalance(999),
        "Student not found"
      );
    });
  });

  describe("getTransactionHistory", () => {
    test("should return paginated transaction history", async () => {
      // Arrange
      const transactions = [
        TestDataFactory.createPointsTransaction({ points: 10, type: "earned" }),
        TestDataFactory.createPointsTransaction({
          points: -5,
          type: "deducted",
        }),
      ];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.findByStudentId.mockResolvedValue(transactions);
      mockPointsRepository.countByStudentId.mockResolvedValue(20);

      // Act
      const result = await pointsService.getTransactionHistory(1, {
        page: 1,
        limit: 2,
      });

      // Assert
      expect(result.transactions).toHaveLength(2);
      expect(result.pagination.total).toBe(20);
      expect(result.pagination.totalPages).toBe(10);
      expect(result.summary.totalEarned).toBe(10);
      expect(result.summary.totalDeducted).toBe(5);
      expect(result.summary.netPoints).toBe(5);
    });

    test("should filter transactions by type", async () => {
      // Arrange
      const earnedTransactions = [
        TestDataFactory.createPointsTransaction({ type: "earned" }),
      ];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.findByType.mockResolvedValue(earnedTransactions);

      // Act
      const result = await pointsService.getTransactionHistory(1, {
        type: "earned",
      });

      // Assert
      expect(result.transactions).toEqual(earnedTransactions);
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "findByType",
        1,
        "earned"
      );
    });

    test("should filter transactions by date range", async () => {
      // Arrange
      const startDate = new Date("2025-11-01");
      const endDate = new Date("2025-11-30");
      const transactions = [TestDataFactory.createPointsTransaction()];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.findByDateRange.mockResolvedValue(transactions);

      // Act
      const result = await pointsService.getTransactionHistory(1, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Assert
      expect(result.transactions).toEqual(transactions);
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "findByDateRange",
        1,
        startDate,
        endDate
      );
    });
  });

  describe("getStudentSummary", () => {
    test("should return comprehensive points summary", async () => {
      // Arrange
      const summary = {
        total: 150,
        pending: 10,
        history: [
          TestDataFactory.createPointsTransaction({
            points: 10,
            type: "earned",
          }),
          TestDataFactory.createPointsTransaction({
            points: -5,
            type: "deducted",
          }),
        ],
      };

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.getStudentSummary.mockResolvedValue(summary);

      // Act
      const result = await pointsService.getStudentSummary(1);

      // Assert
      expect(result).toEqual(summary);
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "getStudentSummary",
        1
      );
    });

    test("should reject request for non-existent student", async () => {
      // Arrange
      mockStudentRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => pointsService.getStudentSummary(999),
        "Student not found"
      );
    });
  });

  describe("getLeaderboard", () => {
    test("should return top students by points", async () => {
      // Arrange
      const leaderboard = [
        { student_id: 1, total_points: 200, rank: 1 },
        { student_id: 2, total_points: 150, rank: 2 },
        { student_id: 3, total_points: 100, rank: 3 },
      ];

      mockPointsRepository.getLeaderboard.mockResolvedValue(leaderboard);

      // Act
      const result = await pointsService.getLeaderboard({ limit: 10 });

      // Assert
      expect(result).toEqual(leaderboard);
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "getLeaderboard",
        10
      );
    });

    test("should filter leaderboard by grade level", async () => {
      // Arrange
      const gradeLeaderboard = [
        { student_id: 1, total_points: 200, rank: 1, grade_level: 9 },
      ];

      mockPointsRepository.getLeaderboardByGrade.mockResolvedValue(
        gradeLeaderboard
      );

      // Act
      const result = await pointsService.getLeaderboard({
        gradeLevel: 9,
        limit: 10,
      });

      // Assert
      expect(result).toEqual(gradeLeaderboard);
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "getLeaderboardByGrade",
        9,
        10
      );
    });
  });

  describe("getPointsAnalytics", () => {
    test("should return comprehensive analytics for student", async () => {
      // Arrange
      const transactions = [
        TestDataFactory.createPointsTransaction({
          points: 10,
          type: "earned",
          source_type: "goal",
          created_at: new Date("2025-11-01"),
        }),
        TestDataFactory.createPointsTransaction({
          points: 5,
          type: "earned",
          source_type: "attendance",
          created_at: new Date("2025-11-02"),
        }),
        TestDataFactory.createPointsTransaction({
          points: -3,
          type: "deducted",
          created_at: new Date("2025-11-03"),
        }),
      ];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.getForAnalytics.mockResolvedValue(transactions);

      // Act
      const result = await pointsService.getPointsAnalytics(1);

      // Assert
      expect(result.summary.totalEarned).toBe(15);
      expect(result.summary.totalDeducted).toBe(3);
      expect(result.summary.netPoints).toBe(12);
      expect(result.breakdown.bySource.goal).toBe(10);
      expect(result.breakdown.bySource.attendance).toBe(5);
      expect(result.trends).toBeDefined();
    });

    test("should analyze earning patterns by source", async () => {
      // Arrange
      const transactions = [
        TestDataFactory.createPointsTransaction({
          points: 10,
          source_type: "goal",
        }),
        TestDataFactory.createPointsTransaction({
          points: 5,
          source_type: "goal",
        }),
        TestDataFactory.createPointsTransaction({
          points: 2,
          source_type: "attendance",
        }),
      ];

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.getForAnalytics.mockResolvedValue(transactions);

      // Act
      const result = await pointsService.getPointsAnalytics(1);

      // Assert
      expect(result.breakdown.bySource.goal).toBe(15);
      expect(result.breakdown.bySource.attendance).toBe(2);
      expect(result.breakdown.percentages.goal).toBe(88.24);
      expect(result.breakdown.percentages.attendance).toBe(11.76);
    });

    test("should reject analytics for non-existent student", async () => {
      // Arrange
      mockStudentRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => pointsService.getPointsAnalytics(999),
        "Student not found"
      );
    });
  });

  describe("generatePointsReport", () => {
    test("should generate comprehensive report for date range", async () => {
      // Arrange
      const startDate = new Date("2025-11-01");
      const endDate = new Date("2025-11-30");
      const transactions = [
        TestDataFactory.createPointsTransaction({ points: 10, type: "earned" }),
        TestDataFactory.createPointsTransaction({
          points: -5,
          type: "deducted",
        }),
      ];

      mockPointsRepository.findByDateRange.mockResolvedValue(transactions);

      // Act
      const result = await pointsService.generatePointsReport({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Assert
      expect(result.summary.totalTransactions).toBe(2);
      expect(result.summary.totalEarned).toBe(10);
      expect(result.summary.totalDeducted).toBe(5);
      expect(result.summary.netPoints).toBe(5);
      expect(result.details).toEqual(transactions);
      expect(result.period.start).toEqual(startDate);
      expect(result.period.end).toEqual(endDate);
    });

    test("should filter report by student IDs", async () => {
      // Arrange
      const studentIds = [1, 2];
      const transactions = [TestDataFactory.createPointsTransaction()];

      mockPointsRepository.findByStudentIds.mockResolvedValue(transactions);

      // Act
      const result = await pointsService.generatePointsReport({
        studentIds,
        startDate: "2025-11-01",
        endDate: "2025-11-30",
      });

      // Assert
      expect(result.details).toEqual(transactions);
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "findByStudentIds",
        studentIds
      );
    });
  });

  describe("redeemPoints", () => {
    test("should redeem points successfully with sufficient balance", async () => {
      // Arrange
      const redeemData = {
        student_id: 1,
        points: 50,
        item_name: "School Store Voucher",
        item_value: 50,
      };

      const expectedTransaction = TestDataFactory.createPointsTransaction({
        ...redeemData,
        type: "redeemed",
      });

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.getStudentBalance.mockResolvedValue(100); // Sufficient balance
      mockPointsRepository.create.mockResolvedValue(expectedTransaction);

      // Act
      const result = await pointsService.redeemPoints(redeemData);

      // Assert
      expect(result.success).toBe(true);
      expect(result.transaction).toEqual(expectedTransaction);
      expect(result.newBalance).toBe(50);
      expect(result.redemption.item_name).toBe("School Store Voucher");
    });

    test("should reject redemption with insufficient balance", async () => {
      // Arrange
      const redeemData = {
        student_id: 1,
        points: 150,
        item_name: "Expensive Item",
      };

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.getStudentBalance.mockResolvedValue(100); // Insufficient balance

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => pointsService.redeemPoints(redeemData),
        "Insufficient points for redemption"
      );

      TestAssertions.expectRepositoryMethodNotCalled(
        mockPointsRepository,
        "create"
      );
    });
  });

  describe("getStudentRank", () => {
    test("should return student rank in leaderboard", async () => {
      // Arrange
      const rank = 5;
      const totalStudents = 100;

      mockStudentRepository.exists.mockResolvedValue(true);
      mockPointsRepository.getStudentRank.mockResolvedValue({
        rank,
        totalStudents,
      });

      // Act
      const result = await pointsService.getStudentRank(1);

      // Assert
      expect(result.rank).toBe(5);
      expect(result.totalStudents).toBe(100);
      expect(result.percentile).toBe(95); // Top 5%
      TestAssertions.expectRepositoryMethodCalled(
        mockPointsRepository,
        "getStudentRank",
        1
      );
    });

    test("should reject request for non-existent student", async () => {
      // Arrange
      mockStudentRepository.exists.mockResolvedValue(false);

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => pointsService.getStudentRank(999),
        "Student not found"
      );
    });
  });

  describe("validatePointsData", () => {
    test("should validate correct points data", async () => {
      // Arrange
      const validData = {
        student_id: 1,
        points: 10,
        type: "earned",
        source_type: "goal",
      };

      // Act
      const result = await pointsService.validatePointsData(validData);

      // Assert
      TestAssertions.expectValidationSuccess(result);
    });

    test("should reject data with missing required fields", async () => {
      // Arrange
      const invalidData = {
        points: 10,
        // Missing student_id and type
      };

      // Act
      const result = await pointsService.validatePointsData(invalidData);

      // Assert
      TestAssertions.expectValidationError(result, "Student ID is required");
      TestAssertions.expectValidationError(
        result,
        "Transaction type is required"
      );
    });

    test("should reject data with invalid points value", async () => {
      // Arrange
      const invalidData = {
        student_id: 1,
        points: 0, // Invalid: zero points
        type: "earned",
      };

      // Act
      const result = await pointsService.validatePointsData(invalidData);

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Points must be greater than 0"
      );
    });

    test("should reject data with invalid transaction type", async () => {
      // Arrange
      const invalidData = {
        student_id: 1,
        points: 10,
        type: "invalid",
      };

      // Act
      const result = await pointsService.validatePointsData(invalidData);

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Type must be earned, deducted, or redeemed"
      );
    });

    test("should reject negative points for earned type", async () => {
      // Arrange
      const invalidData = {
        student_id: 1,
        points: -10,
        type: "earned",
      };

      // Act
      const result = await pointsService.validatePointsData(invalidData);

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Earned points must be positive"
      );
    });

    test("should reject positive points for deducted type", async () => {
      // Arrange
      const invalidData = {
        student_id: 1,
        points: 10,
        type: "deducted",
      };

      // Act
      const result = await pointsService.validatePointsData(invalidData);

      // Assert
      TestAssertions.expectValidationError(
        result,
        "Deducted points must be negative"
      );
    });
  });

  describe("calculatePointsValue", () => {
    test("should calculate monetary value of points", async () => {
      // Arrange
      const points = 100;
      const conversionRate = 0.01; // $0.01 per point

      // Act
      const result = await pointsService.calculatePointsValue(
        points,
        conversionRate
      );

      // Assert
      expect(result.points).toBe(100);
      expect(result.dollarValue).toBe(1.0);
      expect(result.formattedValue).toBe("$1.00");
    });

    test("should use default conversion rate if not provided", async () => {
      // Arrange
      const points = 50;

      // Act
      const result = await pointsService.calculatePointsValue(points);

      // Assert
      expect(result.points).toBe(50);
      expect(result.dollarValue).toBe(0.5); // Default rate: $0.01
      expect(result.formattedValue).toBe("$0.50");
    });
  });

  describe("error handling", () => {
    test("should handle repository errors gracefully", async () => {
      // Arrange
      mockPointsRepository.getStudentBalance.mockRejectedValue(
        new Error("Database error")
      );

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => pointsService.getStudentBalance(1),
        "Failed to get student balance"
      );
    });

    test("should handle validation errors properly", async () => {
      // Arrange
      const invalidData = { invalid: "data" };

      // Act & Assert
      await TestAssertions.expectThrowsAsync(
        () => pointsService.awardPoints(invalidData),
        "Validation failed"
      );
    });
  });
});
