/**
 * @fileoverview Test Mocks and Utilities
 * @description Provides mock implementations for repositories and common test utilities.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { jest } from "@jest/globals";

/**
 * Mock Goal Repository
 * @class MockGoalRepository
 */
export class MockGoalRepository {
  constructor() {
    this.findAll = jest.fn();
    this.findById = jest.fn();
    this.findByStudentId = jest.fn();
    this.findCompleted = jest.fn();
    this.create = jest.fn();
    this.update = jest.fn();
    this.delete = jest.fn();
    this.countAll = jest.fn();
    this.countByStudentId = jest.fn();
    this.countCompleted = jest.fn();
    this.getAverageCompletionTime = jest.fn();
    this.getForAnalytics = jest.fn();
    this.getCompletionStatsByStudent = jest.fn();
  }

  reset() {
    Object.values(this).forEach((mock) => {
      if (jest.isMockFunction(mock)) {
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
    this.findAll = jest.fn();
    this.findById = jest.fn();
    this.create = jest.fn();
    this.update = jest.fn();
    this.delete = jest.fn();
    this.findWithAttendanceStats = jest.fn();
    this.findWithGoalStats = jest.fn();
    this.search = jest.fn();
    this.countAll = jest.fn();
    this.getLeaderboard = jest.fn();
    this.exists = jest.fn();
  }

  reset() {
    Object.values(this).forEach((mock) => {
      if (jest.isMockFunction(mock)) {
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
    this.findAll = jest.fn();
    this.findById = jest.fn();
    this.findByStudentId = jest.fn();
    this.findByDate = jest.fn();
    this.findByStatus = jest.fn();
    this.create = jest.fn();
    this.update = jest.fn();
    this.delete = jest.fn();
    this.count = jest.fn();
    this.getAttendanceStats = jest.fn();
    this.getAggregatedStats = jest.fn();
    this.getDailySummary = jest.fn();
    this.existsForStudentAndDate = jest.fn();
    this.bulkCreateOrUpdate = jest.fn();
  }

  reset() {
    Object.values(this).forEach((mock) => {
      if (jest.isMockFunction(mock)) {
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
    this.findAll = jest.fn();
    this.findById = jest.fn();
    this.findByStudentId = jest.fn();
    this.findByType = jest.fn();
    this.create = jest.fn();
    this.update = jest.fn();
    this.delete = jest.fn();
    this.getStudentBalance = jest.fn();
    this.getLeaderboard = jest.fn();
    this.getAggregatedStats = jest.fn();
    this.count = jest.fn();
    this.awardGoalPoints = jest.fn();
    this.redeemPoints = jest.fn();
    this.getRecentActivity = jest.fn();
    this.bulkCreate = jest.fn();
  }

  reset() {
    Object.values(this).forEach((mock) => {
      if (jest.isMockFunction(mock)) {
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
      type: "earned",
      description: "Goal completion bonus",
      goal_id: 1,
      transaction_date: new Date("2025-10-31T10:00:00.000Z"),
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
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
    bulkCreate: jest.fn(),
  },
  Goal: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
    bulkCreate: jest.fn(),
  },
  Attendance: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
    bulkCreate: jest.fn(),
  },
  Points: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
    bulkCreate: jest.fn(),
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
      if (jest.isMockFunction(method)) {
        method.mockReset();
      }
    });
  });
}
