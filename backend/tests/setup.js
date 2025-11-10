/**
 * @fileoverview Jest Test Setup Configuration
 * @description Global test setup for Jest testing framework.
 * Configures mocks, test utilities, and global test environment.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { jest } from "@jest/globals";

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  /**
   * Create a mock repository with common methods
   * @param {Object} customMethods - Custom method implementations
   * @returns {Object} Mock repository
   */
  createMockRepository: (customMethods = {}) => ({
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    count: jest.fn(),
    ...customMethods,
  }),

  /**
   * Create sample test data
   * @param {string} type - Type of test data (student, goal, attendance, points)
   * @param {Object} overrides - Property overrides
   * @returns {Object} Test data object
   */
  createTestData: (type, overrides = {}) => {
    const baseData = {
      student: {
        id: 1,
        name: "Test Student",
        contact_number: "+1234567890",
        address: "123 Test St",
        date_of_birth: "2000-01-01",
        points: 0,
        created_at: new Date(),
      },
      goal: {
        id: 1,
        student_id: 1,
        title: "Test Goal",
        description: "Test goal description",
        target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: "medium",
        is_completed: false,
        created_at: new Date(),
      },
      attendance: {
        id: 1,
        student_id: 1,
        date: new Date().toISOString().split("T")[0],
        status: "present",
        notes: "Test attendance",
        created_at: new Date(),
      },
      points: {
        id: 1,
        student_id: 1,
        points: 10,
        type: "earned",
        description: "Test points",
        transaction_date: new Date(),
        created_at: new Date(),
      },
    };

    return {
      ...baseData[type],
      ...overrides,
    };
  },

  /**
   * Create a mock date that's predictable for testing
   * @param {string} dateString - ISO date string
   * @returns {Date} Mock date
   */
  createMockDate: (dateString = "2025-10-31T10:00:00.000Z") => {
    return new Date(dateString);
  },

  /**
   * Wait for a specific amount of time (for async testing)
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} Promise that resolves after timeout
   */
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),

  /**
   * Assert that a mock was called with specific arguments
   * @param {Function} mockFn - Jest mock function
   * @param {Array} expectedArgs - Expected arguments
   */
  expectCalledWith: (mockFn, ...expectedArgs) => {
    expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
  },

  /**
   * Reset all mocks in an object
   * @param {Object} mockObject - Object containing Jest mocks
   */
  resetMocks: (mockObject) => {
    Object.values(mockObject).forEach((mock) => {
      if (jest.isMockFunction(mock)) {
        mock.mockReset();
      }
    });
  },
};

// Mock Sequelize operations globally
global.sequelize = {
  QueryTypes: {
    SELECT: "SELECT",
  },
};

// Mock Date.now for consistent testing
const MOCK_DATE = new Date("2025-10-31T10:00:00.000Z");
global.Date.now = jest.fn(() => MOCK_DATE.getTime());

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global error handling for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
