/**
 * @fileoverview Test Mocks and Utilities for Vitest
 * @description Provides mock implementations for repositories and common test utilities using Vitest.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { vi } from "vitest";

/**
 * Mock Goal Repository
 * @class MockGoalRepository
 */
export class MockGoalRepository {
  constructor() {
    this.findAll = vi.fn();
    this.findById = vi.fn();
    this.findByStudentId = vi.fn();
    this.findCompleted = vi.fn();
    this.create = vi.fn();
    this.update = vi.fn();
    this.delete = vi.fn();
    this.countAll = vi.fn();
    this.countByStudentId = vi.fn();
    this.countCompleted = vi.fn();
    this.getAverageCompletionTime = vi.fn();
    this.getForAnalytics = vi.fn();
    this.getCompletionStatsByStudent = vi.fn();
  }

  reset() {
    Object.values(this).forEach((mock) => {
      if (vi.isMockFunction(mock)) {
        mock.mockReset();
      }
    });
  }
}

/**
 * Mock Student Repository
 * @class MockStudentRepository
 */
export class MockStudentRepository {
  constructor() {
    this.findAll = vi.fn();
    this.findById = vi.fn();
    this.create = vi.fn();
    this.update = vi.fn();
    this.delete = vi.fn();
    this.findWithAttendanceStats = vi.fn();
    this.findWithGoalStats = vi.fn();
    this.search = vi.fn();
    this.countAll = vi.fn();
    this.getLeaderboard = vi.fn();
    this.exists = vi.fn();
    this.findByEmail = vi.fn();
    this.findByName = vi.fn();
    this.findByGradeLevel = vi.fn();
    this.findByEnrollmentStatus = vi.fn();
    this.count = vi.fn();
  }

  reset() {
    Object.values(this).forEach((mock) => {
      if (vi.isMockFunction(mock)) {
        mock.mockReset();
      }
    });
  }
}

/**
 * Mock Attendance Repository
 * @class MockAttendanceRepository
 */
export class MockAttendanceRepository {
  constructor() {
    this.findAll = vi.fn();
    this.findById = vi.fn();
    this.findByStudentId = vi.fn();
    this.findByDate = vi.fn();
    this.findByStatus = vi.fn();
    this.create = vi.fn();
    this.update = vi.fn();
    this.delete = vi.fn();
    this.count = vi.fn();
    this.getAttendanceStats = vi.fn();
    this.getAggregatedStats = vi.fn();
    this.getDailySummary = vi.fn();
    this.existsForStudentAndDate = vi.fn();
    this.bulkCreateOrUpdate = vi.fn();
  }

  reset() {
    Object.values(this).forEach((mock) => {
      if (vi.isMockFunction(mock)) {
        mock.mockReset();
      }
    });
  }
}

/**
 * Mock Points Repository
 * @class MockPointsRepository
 */
export class MockPointsRepository {
  constructor() {
    this.findAll = vi.fn();
    this.findById = vi.fn();
    this.findByStudentId = vi.fn();
    this.findByType = vi.fn();
    this.create = vi.fn();
    this.update = vi.fn();
    this.delete = vi.fn();
    this.getStudentBalance = vi.fn();
    this.getLeaderboard = vi.fn();
    this.getAggregatedStats = vi.fn();
    this.count = vi.fn();
    this.awardGoalPoints = vi.fn();
    this.redeemPoints = vi.fn();
    this.getRecentActivity = vi.fn();
    this.bulkCreate = vi.fn();
    this.getStudentSummary = vi.fn();
    this.getStudentPointsHistory = vi.fn();
    this.findPointsLogByStudent = vi.fn();
    this.createPointsLog = vi.fn();
    this.getTrendData = vi.fn();
  }

  reset() {
    Object.values(this).forEach((mock) => {
      if (vi.isMockFunction(mock)) {
        mock.mockReset();
      }
    });
  }
}

/**
 * Mock Analytics Repository
 * @class MockAnalyticsRepository
 */
export class MockAnalyticsRepository {
  constructor() {
    this.getOverallStats = vi.fn();
    this.getStudentAnalytics = vi.fn();
    this.getGoalAnalytics = vi.fn();
    this.getAttendanceAnalytics = vi.fn();
    this.getPointsAnalytics = vi.fn();
    this.getTrendData = vi.fn();
  }

  reset() {
    Object.values(this).forEach((mock) => {
      if (vi.isMockFunction(mock)) {
        mock.mockReset();
      }
    });
  }
}

/**
 * Test Data Factory
 * @class TestDataFactory
 */
export class TestDataFactory {
  static createStudent(overrides = {}) {
    return {
      id: 1,
      name: "John Doe",
      contact_number: "+1234567890",
      address: "123 Main St",
      date_of_birth: "2000-01-01",
      points: 0,
      created_at: new Date("2025-10-01T10:00:00.000Z"),
      ...overrides,
    };
  }

  static createGoal(overrides = {}) {
    return {
      id: 1,
      student_id: 1,
      title: "Complete Math Assignment",
      description: "Finish chapters 1-3 of algebra textbook",
      target_date: new Date("2025-11-15T23:59:59.000Z"),
      priority: "medium",
      is_completed: false,
      completed_at: null,
      created_at: new Date("2025-10-15T10:00:00.000Z"),
      ...overrides,
    };
  }

  static createAttendance(overrides = {}) {
    return {
      id: 1,
      student_id: 1,
      date: "2025-10-31",
      status: "present",
      notes: null,
      created_at: new Date("2025-10-31T08:00:00.000Z"),
      ...overrides,
    };
  }

  static createPointsTransaction(overrides = {}) {
    return {
      id: 1,
      student_id: 1,
      points: 10,
      reason: "earned",
      description: "Goal completion bonus",
      related_goal_id: 1,
      created_at: new Date("2025-10-31T10:00:00.000Z"),
      ...overrides,
    };
  }

  static createPointsBalance(overrides = {}) {
    return {
      student_id: 1,
      total_earned: 100,
      total_spent: 20,
      current_balance: 80,
      total_transactions: 15,
      breakdown: {
        earned_points: 85,
        bonus_points: 15,
        redeemed_points: 15,
        penalty_points: 5,
      },
      ...overrides,
    };
  }

  static createAttendanceStats(overrides = {}) {
    return {
      total_records: 20,
      days_present: 18,
      days_absent: 1,
      days_late: 1,
      days_excused: 0,
      attendance_rate: 90.0,
      absence_rate: 10.0,
      ...overrides,
    };
  }

  static createValidationResult(isValid = true, errors = []) {
    return {
      isValid,
      errors,
    };
  }

  static createLeaderboardEntry(overrides = {}) {
    return {
      student_id: 1,
      student_name: "John Doe",
      total_balance: 100,
      earned_points: 85,
      bonus_points: 15,
      total_transactions: 10,
      ...overrides,
    };
  }
}

/**
 * Mock Database Models
 */
export const mockSequelizeModels = {
  Student: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    count: vi.fn(),
    bulkCreate: vi.fn(),
  },
  Goal: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    count: vi.fn(),
    bulkCreate: vi.fn(),
  },
  Attendance: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    count: vi.fn(),
    bulkCreate: vi.fn(),
  },
  PointsLog: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
    count: vi.fn(),
    bulkCreate: vi.fn(),
  },
};

/**
 * Test Assertions Helper
 */
export class TestAssertions {
  static expectValidationError(result, expectedMessage) {
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(expectedMessage);
  }

  static expectValidationSuccess(result) {
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  }

  static expectRepositoryMethodCalled(mockRepo, method, ...args) {
    expect(mockRepo[method]).toHaveBeenCalledWith(...args);
  }

  static expectRepositoryMethodNotCalled(mockRepo, method) {
    expect(mockRepo[method]).not.toHaveBeenCalled();
  }

  static expectServiceResult(result, expectedShape) {
    expect(result).toMatchObject(expectedShape);
  }

  static expectThrowsAsync(asyncFn, expectedMessage) {
    return expect(asyncFn()).rejects.toThrow(expectedMessage);
  }
}

/**
 * Performance Testing Utilities
 */
export class PerformanceTestUtils {
  static async measureExecutionTime(asyncFn) {
    const startTime = process.hrtime.bigint();
    await asyncFn();
    const endTime = process.hrtime.bigint();
    return Number(endTime - startTime) / 1000000; // Convert to milliseconds
  }

  static expectExecutionTimeUnder(actualTime, maxTime) {
    expect(actualTime).toBeLessThan(maxTime);
  }
}

/**
 * Reset all mocks utility
 */
export function resetAllMocks() {
  Object.values(mockSequelizeModels).forEach((model) => {
    Object.values(model).forEach((method) => {
      if (vi.isMockFunction(method)) {
        method.mockReset();
      }
    });
  });
}
