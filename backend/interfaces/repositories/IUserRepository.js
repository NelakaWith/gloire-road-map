/**
 * @fileoverview User Repository Interface
 * @description Defines the contract for user data access operations.
 * This interface abstracts user-related database operations from business logic.
 * @author @NelakaWith
 * @version 1.0.0
 */

/**
 * Interface for User repository operations
 * @interface IUserRepository
 * @description Provides a contract for all user-related data access operations.
 * Implementations should handle all database interactions for users.
 */
export class IUserRepository {
  /**
   * Find user by ID
   * @async
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   * @throws {Error} If database query fails
   */
  async findById(id) {
    throw new Error("IUserRepository.findById() must be implemented");
  }

  /**
   * Find user by username
   * @async
   * @param {string} userName - Username to search for
   * @returns {Promise<Object|null>} User object or null if not found
   * @throws {Error} If database query fails
   */
  async findByUserName(userName) {
    throw new Error("IUserRepository.findByUserName() must be implemented");
  }

  /**
   * Find user by email
   * @async
   * @param {string} email - Email address to search for
   * @returns {Promise<Object|null>} User object or null if not found
   * @throws {Error} If database query fails
   */
  async findByEmail(email) {
    throw new Error("IUserRepository.findByEmail() must be implemented");
  }

  /**
   * Create a new user
   * @async
   * @param {Object} userData - User data to create
   * @param {string} userData.userName - Unique username
   * @param {string} userData.email - Email address
   * @param {string} userData.passwordHash - Hashed password
   * @returns {Promise<Object>} Created user object
   * @throws {Error} If user creation fails
   */
  async create(userData) {
    throw new Error("IUserRepository.create() must be implemented");
  }

  /**
   * Update user by ID
   * @async
   * @param {number} id - User ID
   * @param {Object} updates - Fields to update
   * @param {string} [updates.userName] - Updated username
   * @param {string} [updates.email] - Updated email
   * @param {string} [updates.passwordHash] - Updated password hash
   * @returns {Promise<Object|null>} Updated user object or null if not found
   * @throws {Error} If update operation fails
   */
  async update(id, updates) {
    throw new Error("IUserRepository.update() must be implemented");
  }

  /**
   * Delete user by ID
   * @async
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   * @throws {Error} If delete operation fails
   */
  async delete(id) {
    throw new Error("IUserRepository.delete() must be implemented");
  }

  /**
   * Count total users
   * @async
   * @returns {Promise<number>} Total count of users
   * @throws {Error} If count operation fails
   */
  async countAll() {
    throw new Error("IUserRepository.countAll() must be implemented");
  }

  /**
   * Check if user exists by ID
   * @async
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if user exists, false otherwise
   * @throws {Error} If check operation fails
   */
  async exists(id) {
    throw new Error("IUserRepository.exists() must be implemented");
  }

  /**
   * Check if username is available
   * @async
   * @param {string} userName - Username to check
   * @param {number} [excludeId] - User ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if username is available, false if taken
   * @throws {Error} If check operation fails
   */
  async isUserNameAvailable(userName, excludeId = null) {
    throw new Error(
      "IUserRepository.isUserNameAvailable() must be implemented"
    );
  }

  /**
   * Check if email is available
   * @async
   * @param {string} email - Email to check
   * @param {number} [excludeId] - User ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if email is available, false if taken
   * @throws {Error} If check operation fails
   */
  async isEmailAvailable(email, excludeId = null) {
    throw new Error("IUserRepository.isEmailAvailable() must be implemented");
  }
}
