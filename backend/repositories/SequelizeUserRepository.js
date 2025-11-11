/**
 * @fileoverview Sequelize User Repository Implementation
 * @description Concrete implementation of IUserRepository using Sequelize ORM
 * for user data access operations. Handles all database interactions for users.
 * @author @NelakaWith
 * @version 1.0.0
 */

import { IUserRepository } from "../interfaces/repositories/IUserRepository.js";

/**
 * Sequelize implementation of User repository
 * @class SequelizeUserRepository
 * @extends IUserRepository
 * @description Provides user data access operations using Sequelize ORM
 */
export class SequelizeUserRepository extends IUserRepository {
  /**
   * Constructor for SequelizeUserRepository
   * @param {Object} User - Sequelize User model
   * @param {Object} sequelize - Sequelize instance
   */
  constructor(User, sequelize) {
    super();
    this.User = User;
    this.sequelize = sequelize;
  }

  /**
   * Find user by ID
   * @async
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   * @throws {Error} If database query fails
   */
  async findById(id) {
    try {
      const user = await this.User.findByPk(id);
      return user ? user.toJSON() : null;
    } catch (error) {
      throw new Error(`Failed to find user by ID: ${error.message}`);
    }
  }

  /**
   * Find user by username
   * @async
   * @param {string} userName - Username to search for
   * @returns {Promise<Object|null>} User object or null if not found
   * @throws {Error} If database query fails
   */
  async findByUserName(userName) {
    try {
      const user = await this.User.findOne({
        where: { user_name: userName },
      });
      return user ? user.toJSON() : null;
    } catch (error) {
      throw new Error(`Failed to find user by username: ${error.message}`);
    }
  }

  /**
   * Find user by email
   * @async
   * @param {string} email - Email address to search for
   * @returns {Promise<Object|null>} User object or null if not found
   * @throws {Error} If database query fails
   */
  async findByEmail(email) {
    try {
      const user = await this.User.findOne({
        where: { email },
      });
      return user ? user.toJSON() : null;
    } catch (error) {
      throw new Error(`Failed to find user by email: ${error.message}`);
    }
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
    try {
      const user = await this.User.create({
        user_name: userData.userName,
        email: userData.email,
        password_hash: userData.passwordHash,
      });
      return user.toJSON();
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
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
    try {
      const [affectedRows] = await this.User.update(
        {
          user_name: updates.userName,
          email: updates.email,
          password_hash: updates.passwordHash,
        },
        { where: { id } }
      );

      if (affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Delete user by ID
   * @async
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   * @throws {Error} If delete operation fails
   */
  async delete(id) {
    try {
      const deletedRows = await this.User.destroy({
        where: { id },
      });
      return deletedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Count total users
   * @async
   * @returns {Promise<number>} Total count of users
   * @throws {Error} If count operation fails
   */
  async countAll() {
    try {
      return await this.User.count();
    } catch (error) {
      throw new Error(`Failed to count users: ${error.message}`);
    }
  }

  /**
   * Check if user exists by ID
   * @async
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if user exists, false otherwise
   * @throws {Error} If check operation fails
   */
  async exists(id) {
    try {
      const count = await this.User.count({
        where: { id },
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Failed to check user existence: ${error.message}`);
    }
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
    try {
      const whereClause = { user_name: userName };
      if (excludeId) {
        whereClause.id = { [this.sequelize.Op.ne]: excludeId };
      }

      const count = await this.User.count({
        where: whereClause,
      });
      return count === 0;
    } catch (error) {
      throw new Error(
        `Failed to check username availability: ${error.message}`
      );
    }
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
    try {
      const whereClause = { email };
      if (excludeId) {
        whereClause.id = { [this.sequelize.Op.ne]: excludeId };
      }

      const count = await this.User.count({
        where: whereClause,
      });
      return count === 0;
    } catch (error) {
      throw new Error(`Failed to check email availability: ${error.message}`);
    }
  }
}
