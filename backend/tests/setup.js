/**
 * @fileoverview Vitest Test Setup Configuration
 * @description Global test setup for Vitest testing framework.
 * Configures mocks, test utilities, and global test environment.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { vi, afterEach } from "vitest";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock Sequelize operations globally
global.sequelize = {
  QueryTypes: {
    SELECT: "SELECT",
  },
};

// Mock Date.now for consistent testing
const MOCK_DATE = new Date("2025-10-31T10:00:00.000Z");
global.Date.now = vi.fn(() => MOCK_DATE.getTime());

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Global error handling for unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
