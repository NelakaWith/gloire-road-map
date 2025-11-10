/**
 * @fileoverview Vitest Configuration for SOLID Architecture Testing
 * @description Comprehensive test configuration for the Gloire Road Map backend
 * covering repository pattern, service layer, and SOLID principles validation
 * @author @NelakaWith
 * @version 1.0.0
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Global test configuration
    globals: true,
    environment: "node",

    // Setup files for test environment
    setupFiles: ["./tests/setup.js"],

    // Test file patterns
    include: ["tests/**/*.test.js", "tests/**/*.spec.js"],

    // Exclude patterns
    exclude: ["node_modules/**", "dist/**", "coverage/**", "*.config.js"],

    // Test execution settings
    testTimeout: 10000,
    hookTimeout: 10000,

    // Reporter configuration
    reporter: ["verbose", "json", "html"],

    // Coverage configuration
    coverage: {
      // Coverage provider
      provider: "v8",

      // Report formats
      reporter: ["text", "json", "html", "lcov"],

      // Output directory
      reportsDirectory: "./coverage",

      // Include patterns - focus on our SOLID architecture
      include: [
        "services/**/*.js",
        "repositories/**/*.js",
        "interfaces/**/*.js",
      ],

      // Exclude patterns
      exclude: [
        "tests/**",
        "node_modules/**",
        "*.config.js",
        "server.js",
        "models.js",
        "routes/**",
        "middleware/**",
        "config/**",
      ],

      // Coverage thresholds for quality gates
      thresholds: {
        global: {
          branches: 80,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        // Specific thresholds for our SOLID components
        "services/**": {
          branches: 85,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        "repositories/**": {
          branches: 85,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        "interfaces/**": {
          branches: 70,
          functions: 100,
          lines: 80,
          statements: 80,
        },
      },

      // Fail tests if coverage is below thresholds
      thresholdAutoUpdate: false,
      skipFull: false,
    },

    // Pool configuration for parallel testing
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },

    // Watch mode configuration
    watch: {
      ignore: ["node_modules/**", "coverage/**", "dist/**"],
    },

    // Mock configuration
    clearMocks: true,
    restoreMocks: true,

    // Environment variables for testing
    env: {
      NODE_ENV: "test",
      DB_HOST: "localhost",
      DB_NAME: "test_gloire_roadmap",
      JWT_SECRET: "test_jwt_secret",
    },
  },
});
