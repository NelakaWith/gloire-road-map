/**
 * @fileoverview Service Interfaces Barrel Export
 * @description Provides centralized exports for all service interfaces.
 * This allows importing all service interfaces from a single module.
 * @author @NelakaWith
 * @version 1.0.0
 */

// Service Interface Exports
export { IGoalService } from "./IGoalService.js";
export { IStudentService } from "./IStudentService.js";
export { IAttendanceService } from "./IAttendanceService.js";
export { IPointsService } from "./IPointsService.js";
export { IAuthService } from "./IAuthService.js";
export { IAnalyticsService } from "./IAnalyticsService.js";

/**
 * Service interface registry for dependency injection
 * @description Maps service names to their interface classes for DI container registration
 */
export const SERVICE_INTERFACES = {
  IGoalService,
  IStudentService,
  IAttendanceService,
  IPointsService,
  IAuthService,
  IAnalyticsService,
};

/**
 * Service interface names as constants
 * @description String constants for service interface names to avoid typos in DI registration
 */
export const SERVICE_INTERFACE_NAMES = {
  GOAL: "IGoalService",
  STUDENT: "IStudentService",
  ATTENDANCE: "IAttendanceService",
  POINTS: "IPointsService",
  AUTH: "IAuthService",
  ANALYTICS: "IAnalyticsService",
};
