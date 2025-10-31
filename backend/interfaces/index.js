/**
 * @fileoverview Main Interfaces Barrel Export
 * @description Provides centralized exports for all interfaces in the application.
 * This allows importing all interfaces from a single module.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

// Repository Interfaces
export * from "./repositories/index.js";

// Service Interfaces (will be added in Phase 1.4)
// export * from './services/index.js';

/**
 * Interface types enumeration
 * @description Constants for different interface categories
 */
export const INTERFACE_TYPES = {
  REPOSITORY: "repository",
  SERVICE: "service",
  CONTROLLER: "controller",
  MIDDLEWARE: "middleware",
};
