/**
 * @fileoverview Authentication Service Interface
 * @description Abstract interface defining authentication business logic operations.
 * This interface provides a contract for user authentication, registration, and session management.
 * @author @NelakaWith
 * @version 1.0.0
 */

/**
 * Abstract Authentication Service Interface
 * @abstract
 * @class IAuthService
 * @description Defines authentication business logic operations
 */
export class IAuthService {
  /**
   * Register a new admin user
   * @abstract
   * @param {Object} userData - User registration data
   * @param {string} userData.userName - Unique username
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Plain text password
   * @returns {Promise<Object>} Registration result with user data
   * @throws {Error} If registration fails or user already exists
   */
  async registerAdmin(userData) {
    throw new Error("Method 'registerAdmin' must be implemented");
  }

  /**
   * Authenticate user credentials
   * @abstract
   * @param {string} userName - Username for authentication
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} Authentication result
   * @returns {boolean} returns.success - Whether authentication succeeded
   * @returns {Object} [returns.user] - User data if successful
   * @returns {string} [returns.token] - JWT token if successful
   * @returns {string} [returns.message] - Error message if failed
   * @throws {Error} If authentication process fails
   */
  async authenticate(userName, password) {
    throw new Error("Method 'authenticate' must be implemented");
  }

  /**
   * Validate JWT token and return user data
   * @abstract
   * @param {string} token - JWT token to validate
   * @returns {Promise<Object>} Token validation result
   * @returns {boolean} returns.valid - Whether token is valid
   * @returns {Object} [returns.user] - User data if token is valid
   * @returns {string} [returns.message] - Error message if invalid
   * @throws {Error} If token validation process fails
   */
  async validateToken(token) {
    throw new Error("Method 'validateToken' must be implemented");
  }

  /**
   * Generate JWT token for user
   * @abstract
   * @param {Object} user - User data
   * @param {number} user.id - User ID
   * @param {string} user.userName - Username
   * @param {string} user.email - Email
   * @returns {Promise<string>} JWT token
   * @throws {Error} If token generation fails
   */
  async generateToken(user) {
    throw new Error("Method 'generateToken' must be implemented");
  }

  /**
   * Get current authenticated user data
   * @abstract
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User data result
   * @returns {boolean} returns.success - Whether user retrieval succeeded
   * @returns {Object} [returns.user] - User data if successful
   * @returns {string} [returns.message] - Error message if failed
   * @throws {Error} If user retrieval fails
   */
  async getCurrentUser(token) {
    throw new Error("Method 'getCurrentUser' must be implemented");
  }

  /**
   * Logout user (invalidate token/session)
   * @abstract
   * @param {string} token - JWT token to invalidate
   * @returns {Promise<Object>} Logout result
   * @returns {boolean} returns.success - Whether logout succeeded
   * @returns {string} [returns.message] - Success/error message
   * @throws {Error} If logout process fails
   */
  async logout(token) {
    throw new Error("Method 'logout' must be implemented");
  }

  /**
   * Validate user registration data
   * @abstract
   * @param {Object} userData - User data to validate
   * @param {string} userData.userName - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @returns {Promise<Object>} Validation result
   * @returns {boolean} returns.isValid - Whether data is valid
   * @returns {Array<string>} returns.errors - Validation error messages
   * @throws {Error} If validation process fails
   */
  async validateRegistrationData(userData) {
    throw new Error("Method 'validateRegistrationData' must be implemented");
  }

  /**
   * Hash password using secure algorithm
   * @abstract
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   * @throws {Error} If password hashing fails
   */
  async hashPassword(password) {
    throw new Error("Method 'hashPassword' must be implemented");
  }

  /**
   * Verify password against hash
   * @abstract
   * @param {string} password - Plain text password
   * @param {string} hash - Password hash to verify against
   * @returns {Promise<boolean>} True if password matches hash
   * @throws {Error} If password verification fails
   */
  async verifyPassword(password, hash) {
    throw new Error("Method 'verifyPassword' must be implemented");
  }

  /**
   * Check if admin user already exists
   * @abstract
   * @returns {Promise<boolean>} True if admin user exists, false otherwise
   * @throws {Error} If check fails
   */
  async adminUserExists() {
    throw new Error("Method 'adminUserExists' must be implemented");
  }
}
