/**
 * @fileoverview Repository Interfaces Barrel Export
 * @description Provides centralized exports for all repository interfaces.
 * This allows importing all repository interfaces from a single module.
 * @author @NelakaWith
 * @version 1.0.0
 */

// Repository Interface Exports
export { IGoalRepository } from "./IGoalRepository.js";
export { IStudentRepository } from "./IStudentRepository.js";
export { IAttendanceRepository } from "./IAttendanceRepository.js";
export { IPointsRepository } from "./IPointsRepository.js";

/**
 * Repository interface registry for dependency injection
 * @description Maps repository names to their interface classes for DI container registration
 */
export const REPOSITORY_INTERFACES = {
  IGoalRepository,
  IStudentRepository,
  IAttendanceRepository,
  IPointsRepository,
};

/**
 * Repository interface names as constants
 * @description String constants for repository interface names to avoid typos in DI registration
 */
export const REPOSITORY_INTERFACE_NAMES = {
  GOAL: "IGoalRepository",
  STUDENT: "IStudentRepository",
  ATTENDANCE: "IAttendanceRepository",
  POINTS: "IPointsRepository",
};
