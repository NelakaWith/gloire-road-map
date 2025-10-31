#!/usr/bin/env node

/**
 * @fileoverview Test Runner Script
 * @description Utility script to run specific test suites or all tests with proper configuration
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

/**
 * Print colored output to console
 * @param {string} message - Message to print
 * @param {string} color - Color to use
 */
function printColored(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Run Jest with specific configuration
 * @param {string[]} args - Arguments to pass to Jest
 * @returns {Promise<number>} - Exit code
 */
function runJest(args = []) {
  return new Promise((resolve) => {
    const jestPath = resolve(__dirname, "../node_modules/.bin/jest");
    const configPath = resolve(__dirname, "package.test.json");

    const jestArgs = ["--config", configPath, "--verbose", "--colors", ...args];

    printColored("\n🧪 Running Tests...", "cyan");
    printColored(`Command: jest ${jestArgs.join(" ")}`, "blue");
    printColored("=" * 50, "blue");

    const child = spawn("node", [jestPath, ...jestArgs], {
      stdio: "inherit",
      cwd: resolve(__dirname, ".."),
    });

    child.on("close", (code) => {
      if (code === 0) {
        printColored("\n✅ All tests passed!", "green");
      } else {
        printColored("\n❌ Some tests failed!", "red");
      }
      resolve(code);
    });

    child.on("error", (error) => {
      printColored(`Error running tests: ${error.message}`, "red");
      resolve(1);
    });
  });
}

/**
 * Display help information
 */
function showHelp() {
  printColored("\n📋 Test Runner Help", "cyan");
  printColored("=" * 30, "cyan");
  printColored("\nUsage: node run-tests.js [options] [test-pattern]", "bright");

  printColored("\nOptions:", "yellow");
  printColored("  --help, -h          Show this help message", "reset");
  printColored(
    "  --watch, -w         Watch for file changes and re-run tests",
    "reset"
  );
  printColored("  --coverage, -c      Generate test coverage report", "reset");
  printColored("  --repositories      Run only repository tests", "reset");
  printColored("  --services          Run only service tests", "reset");
  printColored("  --silent            Reduce output verbosity", "reset");
  printColored("  --bail              Stop after first test failure", "reset");
  printColored("  --update-snapshots  Update test snapshots", "reset");

  printColored("\nExamples:", "yellow");
  printColored(
    "  node run-tests.js                    # Run all tests",
    "reset"
  );
  printColored(
    "  node run-tests.js --coverage         # Run with coverage",
    "reset"
  );
  printColored(
    "  node run-tests.js --repositories     # Run repository tests only",
    "reset"
  );
  printColored(
    "  node run-tests.js --services         # Run service tests only",
    "reset"
  );
  printColored("  node run-tests.js --watch            # Watch mode", "reset");
  printColored(
    "  node run-tests.js GoalService        # Run specific test file",
    "reset"
  );
  printColored(
    "  node run-tests.js --silent --bail    # Quiet mode, stop on failure",
    "reset"
  );

  printColored("\nTest Patterns:", "yellow");
  printColored("  GoalService         Run GoalService tests", "reset");
  printColored("  StudentService      Run StudentService tests", "reset");
  printColored("  AttendanceService   Run AttendanceService tests", "reset");
  printColored("  PointsService       Run PointsService tests", "reset");
  printColored("  Repository          Run all repository tests", "reset");
  printColored("  Service             Run all service tests", "reset");

  printColored("\n", "reset");
}

/**
 * Parse command line arguments
 * @param {string[]} argv - Command line arguments
 * @returns {Object} - Parsed options
 */
function parseArgs(argv) {
  const options = {
    help: false,
    watch: false,
    coverage: false,
    repositories: false,
    services: false,
    silent: false,
    bail: false,
    updateSnapshots: false,
    pattern: null,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--watch":
      case "-w":
        options.watch = true;
        break;
      case "--coverage":
      case "-c":
        options.coverage = true;
        break;
      case "--repositories":
        options.repositories = true;
        break;
      case "--services":
        options.services = true;
        break;
      case "--silent":
        options.silent = true;
        break;
      case "--bail":
        options.bail = true;
        break;
      case "--update-snapshots":
        options.updateSnapshots = true;
        break;
      default:
        if (!arg.startsWith("--")) {
          options.pattern = arg;
        }
        break;
    }
  }

  return options;
}

/**
 * Build Jest arguments based on options
 * @param {Object} options - Parsed options
 * @returns {string[]} - Jest arguments
 */
function buildJestArgs(options) {
  const args = [];

  if (options.watch) {
    args.push("--watch");
  }

  if (options.coverage) {
    args.push("--coverage");
  }

  if (options.silent) {
    args.push("--silent");
  }

  if (options.bail) {
    args.push("--bail");
  }

  if (options.updateSnapshots) {
    args.push("--updateSnapshot");
  }

  // Handle test pattern selection
  if (options.repositories) {
    args.push("--testPathPattern=repositories");
  } else if (options.services) {
    args.push("--testPathPattern=services");
  } else if (options.pattern) {
    args.push("--testNamePattern", options.pattern);
  }

  return args;
}

/**
 * Main function
 */
async function main() {
  const options = parseArgs(process.argv);

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  printColored("🚀 Gloire Road Map Test Suite", "bright");
  printColored("SOLID Architecture Unit Tests", "magenta");

  if (options.coverage) {
    printColored("📊 Coverage report will be generated", "yellow");
  }

  if (options.watch) {
    printColored("👀 Watch mode enabled", "yellow");
  }

  if (options.repositories) {
    printColored("🗄️  Running repository tests only", "yellow");
  } else if (options.services) {
    printColored("⚙️  Running service tests only", "yellow");
  } else if (options.pattern) {
    printColored(`🔍 Running tests matching: ${options.pattern}`, "yellow");
  }

  const jestArgs = buildJestArgs(options);
  const exitCode = await runJest(jestArgs);

  process.exit(exitCode);
}

// Run the script
main().catch((error) => {
  printColored(`Fatal error: ${error.message}`, "red");
  process.exit(1);
});
