/**
 * @fileoverview Dependency Injection Container
 * @description Factory for creating and wiring up SOLID architecture components
 * with proper dependency injection. Provides centralized service instantiation.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { Student, Goal, Attendance, PointsLog, User } from "./models.js";
import { sequelize } from "./models.js";

// Import repositories
import { SequelizeStudentRepository } from "./repositories/SequelizeStudentRepository.js";
import { SequelizeGoalRepository } from "./repositories/SequelizeGoalRepository.js";
import { SequelizeAttendanceRepository } from "./repositories/SequelizeAttendanceRepository.js";
import { SequelizePointsRepository } from "./repositories/SequelizePointsRepository.js";
import { SequelizeUserRepository } from "./repositories/SequelizeUserRepository.js";
import { SequelizeAnalyticsRepository } from "./repositories/SequelizeAnalyticsRepository.js";

// Import services
import { StudentService } from "./services/StudentService.js";
import { GoalService } from "./services/GoalService.js";
import { AttendanceService } from "./services/AttendanceService.js";
import { PointsService } from "./services/PointsService.js";
import { AuthService } from "./services/AuthService.js";
import { AnalyticsService } from "./services/AnalyticsService.js";

/**
 * Dependency Injection Container
 * @class DIContainer
 * @description Manages creation and wiring of all SOLID architecture components
 */
class DIContainer {
  constructor() {
    this.repositories = {};
    this.services = {};
    this.initializeRepositories();
    this.initializeServices();
  }

  /**
   * Initialize all repository instances
   * @private
   */
  initializeRepositories() {
    // Student Repository
    this.repositories.student = new SequelizeStudentRepository(
      Student,
      Goal,
      Attendance,
      sequelize
    );

    // Goal Repository
    this.repositories.goal = new SequelizeGoalRepository(
      Goal,
      Student,
      sequelize
    );

    // Attendance Repository
    this.repositories.attendance = new SequelizeAttendanceRepository(
      Attendance,
      Student,
      sequelize
    );

    // Points Repository
    this.repositories.points = new SequelizePointsRepository(
      PointsLog,
      Student,
      Goal,
      sequelize
    );

    // User Repository
    this.repositories.user = new SequelizeUserRepository(User, sequelize);

    // Analytics Repository
    this.repositories.analytics = new SequelizeAnalyticsRepository(sequelize);
  }

  /**
   * Initialize all service instances with proper dependency injection
   * @private
   */
  initializeServices() {
    // Student Service
    this.services.student = new StudentService(
      this.repositories.student,
      this.repositories.goal,
      this.repositories.attendance,
      this.repositories.points
    );

    // Goal Service
    this.services.goal = new GoalService(
      this.repositories.goal,
      this.repositories.student,
      this.repositories.points
    );

    // Attendance Service
    this.services.attendance = new AttendanceService(
      this.repositories.attendance,
      this.repositories.student
    );

    // Points Service
    this.services.points = new PointsService(
      this.repositories.points,
      this.repositories.student,
      this.repositories.goal
    );

    // Auth Service
    this.services.auth = new AuthService(
      this.repositories.user,
      process.env.JWT_SECRET
    );

    // Analytics Service
    this.services.analytics = new AnalyticsService(this.repositories.analytics);
  }

  /**
   * Get a service instance by name
   * @param {string} serviceName - Name of the service to retrieve
   * @returns {Object} Service instance
   * @throws {Error} If service not found
   */
  getService(serviceName) {
    const service = this.services[serviceName];
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }
    return service;
  }

  /**
   * Get a repository instance by name
   * @param {string} repositoryName - Name of the repository to retrieve
   * @returns {Object} Repository instance
   * @throws {Error} If repository not found
   */
  getRepository(repositoryName) {
    const repository = this.repositories[repositoryName];
    if (!repository) {
      throw new Error(`Repository '${repositoryName}' not found`);
    }
    return repository;
  }

  /**
   * Get all services (for testing or debugging)
   * @returns {Object} All service instances
   */
  getAllServices() {
    return { ...this.services };
  }

  /**
   * Get all repositories (for testing or debugging)
   * @returns {Object} All repository instances
   */
  getAllRepositories() {
    return { ...this.repositories };
  }
}

// Create and export singleton instance
const diContainer = new DIContainer();

export { diContainer as DIContainer };
export default diContainer;
