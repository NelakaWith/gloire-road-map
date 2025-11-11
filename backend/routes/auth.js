/**
 * @fileoverview Authentication routes
 * @description Handles user registration, login, and JWT token management
 * @author @NelakaWith
 * @version 1.0.0
 */

import express from "express";
import DIContainer from "../di-container.js";
import { validate, authSchemas } from "../middleware/validation.js";

const router = express.Router();

// Get service instance from DI container
const authService = DIContainer.getService("auth");

/**
 * Register admin user (restricted to first user only)
 * @route POST /api/auth/register
 * @description Creates the first admin user. Registration is blocked if users already exist.
 * @access Public (but restricted to first user)
 * @param {Object} req.body - Registration data
 * @param {string} req.body.userName - Unique username for the admin
 * @param {string} req.body.email - Admin email address
 * @param {string} req.body.password - Plain text password (will be hashed)
 * @returns {Object} Success message
 * @throws {403} Forbidden if users already exist in the system
 * @throws {500} Internal server error if database operation fails
 * @security Password is hashed using bcrypt with salt rounds of 10

 */
router.post("/register", validate(authSchemas.register), async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    const result = await authService.register(userName, email, password);
    res.json(result);
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Registration failed" });
  }
});

/**
 * User login authentication
 * @route POST /api/auth/login
 * @description Authenticates user credentials and returns JWT token
 * @access Public
 * @param {Object} req.body - Login credentials
 * @param {string} req.body.userName - Username for authentication
 * @param {string} req.body.password - Plain text password
 * @returns {Object} Authentication response
 * @returns {string} returns.token - JWT token for authenticated requests
 * @returns {Object} returns.user - User information (id, userName, email)
 * @throws {400} Bad request if username or password is missing
 * @throws {401} Unauthorized if credentials are invalid
 * @throws {500} Internal server error if database operation fails
 * @security Uses bcrypt for password comparison and JWT for token generation
 */
router.post("/login", validate(authSchemas.login), async (req, res) => {
  try {
    const { userName, password } = req.body;
    const result = await authService.login(userName, password);

    // Set httpOnly cookie with JWT token
    res.cookie("auth_token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    });

    res.json({
      message: "Login successful",
      user: result.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Login failed" });
  }
});

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Invalid Login, Please try again" });
    }

    const result = await authService.getCurrentUser(token);
    if (!result.success) {
      return res.status(result.status || 401).json({ message: result.message });
    }

    res.json(result.user);
  } catch (error) {
    console.error("Get current user error:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Failed to get user data" });
  }
});

/**
 * User logout
 * @route POST /api/auth/logout
 * @description Clears the authentication cookie to log out the user
 * @access Private (requires valid JWT cookie)
 * @returns {Object} Success message
 * @throws {500} Internal server error if cookie clearing fails
 */
router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    const result = await authService.logout(token);

    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ message: result.message || "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Failed to logout" });
  }
});

export default router;
