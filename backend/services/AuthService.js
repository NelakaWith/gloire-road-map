/**
 * @fileoverview Authentication Service Implementation
 * @description Concrete implementation of IAuthService providing authentication business logic
 * including user registration, login, token management, and validation.
 * @author @NelakaWith
 * @version 1.0.0
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { IAuthService } from "../interfaces/services/IAuthService.js";

/**
 * Authentication Service Implementation
 * @class AuthService
 * @extends IAuthService
 * @description Provides authentication business logic operations
 */
export class AuthService extends IAuthService {
  /**
   * Constructor for AuthService
   * @param {IUserRepository} userRepository - User repository instance
   * @param {string} jwtSecret - JWT secret key
   * @param {Object} [options] - Service options
   * @param {number} [options.saltRounds=10] - Bcrypt salt rounds
   * @param {string} [options.tokenExpiry="8h"] - JWT token expiry
   */
  constructor(userRepository, jwtSecret, options = {}) {
    super();
    this.userRepository = userRepository;
    this.jwtSecret = jwtSecret;
    this.saltRounds = options.saltRounds || 10;
    this.tokenExpiry = options.tokenExpiry || "8h";
  }

  /**
   * Register a new admin user
   * @async
   * @param {Object} userData - User registration data
   * @param {string} userData.userName - Unique username
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Plain text password
   * @returns {Promise<Object>} Registration result with user data
   * @throws {Error} If registration fails or user already exists
   */
  async registerAdmin(userData) {
    try {
      // Validate input data
      const validation = await this.validateRegistrationData(userData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      // Check if admin user already exists
      const existingCount = await this.userRepository.countAll();
      if (existingCount > 0) {
        throw new Error("Admin user already exists");
      }

      // Check username and email availability
      const userNameAvailable = await this.userRepository.isUserNameAvailable(
        userData.userName
      );
      if (!userNameAvailable) {
        throw new Error("Username is already taken");
      }

      const emailAvailable = await this.userRepository.isEmailAvailable(
        userData.email
      );
      if (!emailAvailable) {
        throw new Error("Email is already registered");
      }

      // Hash password
      const passwordHash = await this.hashPassword(userData.password);

      // Create user
      const user = await this.userRepository.create({
        userName: userData.userName,
        email: userData.email,
        passwordHash,
      });

      return {
        success: true,
        user: {
          id: user.id,
          userName: user.user_name,
          email: user.email,
        },
        message: "Admin user registered successfully",
      };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  /**
   * Authenticate user credentials
   * @async
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
    try {
      // Find user by username
      const user = await this.userRepository.findByUserName(userName);
      if (!user) {
        return {
          success: false,
          message: "Invalid username or password",
        };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        return {
          success: false,
          message: "Invalid username or password",
        };
      }

      // Generate token
      const token = await this.generateToken(user);

      return {
        success: true,
        user: {
          id: user.id,
          userName: user.user_name,
          email: user.email,
        },
        token,
        message: "Authentication successful",
      };
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Validate JWT token and return user data
   * @async
   * @param {string} token - JWT token to validate
   * @returns {Promise<Object>} Token validation result
   * @returns {boolean} returns.valid - Whether token is valid
   * @returns {Object} [returns.user] - User data if token is valid
   * @returns {string} [returns.message] - Error message if invalid
   * @throws {Error} If token validation process fails
   */
  async validateToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);

      // Verify user still exists
      const user = await this.userRepository.findById(decoded.id);
      if (!user) {
        return {
          valid: false,
          message: "User no longer exists",
        };
      }

      return {
        valid: true,
        user: {
          id: user.id,
          userName: user.user_name,
          email: user.email,
        },
        message: "Token is valid",
      };
    } catch (error) {
      return {
        valid: false,
        message: "Invalid or expired token",
      };
    }
  }

  /**
   * Generate JWT token for user
   * @async
   * @param {Object} user - User data
   * @param {number} user.id - User ID
   * @param {string} user.user_name - Username
   * @param {string} user.email - Email
   * @returns {Promise<string>} JWT token
   * @throws {Error} If token generation fails
   */
  async generateToken(user) {
    try {
      const payload = {
        id: user.id,
        userName: user.user_name,
        email: user.email,
      };

      return jwt.sign(payload, this.jwtSecret, {
        expiresIn: this.tokenExpiry,
      });
    } catch (error) {
      throw new Error(`Token generation failed: ${error.message}`);
    }
  }

  /**
   * Get current authenticated user data
   * @async
   * @param {string} token - JWT token
   * @returns {Promise<Object>} User data result
   * @returns {boolean} returns.success - Whether user retrieval succeeded
   * @returns {Object} [returns.user] - User data if successful
   * @returns {string} [returns.message] - Error message if failed
   * @throws {Error} If user retrieval fails
   */
  async getCurrentUser(token) {
    try {
      const validation = await this.validateToken(token);

      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
        };
      }

      return {
        success: true,
        user: validation.user,
        message: "User data retrieved successfully",
      };
    } catch (error) {
      throw new Error(`Failed to get current user: ${error.message}`);
    }
  }

  /**
   * Logout user (invalidate token/session)
   * @async
   * @param {string} token - JWT token to invalidate
   * @returns {Promise<Object>} Logout result
   * @returns {boolean} returns.success - Whether logout succeeded
   * @returns {string} [returns.message] - Success/error message
   * @throws {Error} If logout process fails
   */
  async logout(token) {
    try {
      // For stateless JWT, logout is handled client-side by clearing cookies
      // In a more complex system, you might want to implement token blacklisting
      return {
        success: true,
        message: "Logout successful",
      };
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  /**
   * Validate user registration data
   * @async
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
    const errors = [];

    try {
      // Validate username
      if (!userData.userName || userData.userName.trim().length === 0) {
        errors.push("Username is required");
      } else if (userData.userName.length < 3) {
        errors.push("Username must be at least 3 characters long");
      } else if (!/^[a-zA-Z0-9_]+$/.test(userData.userName)) {
        errors.push(
          "Username can only contain letters, numbers, and underscores"
        );
      }

      // Validate email
      if (!userData.email || userData.email.trim().length === 0) {
        errors.push("Email is required");
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push("Invalid email format");
      }

      // Validate password
      if (!userData.password || userData.password.length === 0) {
        errors.push("Password is required");
      } else if (userData.password.length < 6) {
        errors.push("Password must be at least 6 characters long");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ["Validation process failed"],
      };
    }
  }

  /**
   * Hash password using secure algorithm
   * @async
   * @param {string} password - Plain text password
   * @returns {Promise<string>} Hashed password
   * @throws {Error} If password hashing fails
   */
  async hashPassword(password) {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new Error(`Password hashing failed: ${error.message}`);
    }
  }

  /**
   * Verify password against hash
   * @async
   * @param {string} password - Plain text password
   * @param {string} hash - Password hash to verify against
   * @returns {Promise<boolean>} True if password matches hash
   * @throws {Error} If password verification fails
   */
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Password verification failed: ${error.message}`);
    }
  }

  /**
   * Check if admin user already exists
   * @async
   * @returns {Promise<boolean>} True if admin user exists, false otherwise
   * @throws {Error} If check fails
   */
  async adminUserExists() {
    try {
      const count = await this.userRepository.countAll();
      return count > 0;
    } catch (error) {
      throw new Error(`Admin user check failed: ${error.message}`);
    }
  }

  /**
   * Register a new user (alias for registerAdmin)
   * @async
   * @param {string} userName - Unique username
   * @param {string} email - Email address
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} Registration result with user data
   * @throws {Error} If registration fails or user already exists
   */
  async register(userName, email, password) {
    return this.registerAdmin({ userName, email, password });
  }

  /**
   * Login user (alias for authenticate)
   * @async
   * @param {string} userName - Username for authentication
   * @param {string} password - Plain text password
   * @returns {Promise<Object>} Authentication result
   * @throws {Error} If authentication fails
   */
  async login(userName, password) {
    const result = await this.authenticate(userName, password);
    if (!result.success) {
      const error = new Error(result.message);
      error.status = 401;
      throw error;
    }
    return result;
  }
}
