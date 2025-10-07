/**
 * @fileoverview Authentication routes
 * @description Handles user registration, login, and JWT token management
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models.js";

const router = express.Router();

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
router.post("/register", async (req, res) => {
  const { userName, email, password } = req.body;
  const count = await User.count();
  if (count > 0)
    return res.status(403).json({ message: "User already exists" });
  const hash = await bcrypt.hash(password, 10);
  await User.create({ user_name: userName, email, password_hash: hash });
  res.json({ message: "User registered" });
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
router.post("/login", async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  const user = await User.findOne({ where: { user_name: userName } });
  if (!user)
    return res.status(401).json({ message: "Invalid Username or password" });
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match)
    return res.status(401).json({ message: "Invalid Username or password" });
  const token = jwt.sign(
    { id: user.id, userName: user.user_name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
  res.json({ token });
});

// Get current user
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Invalid Login, Please try again" });
  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ id: user.id, userName: user.userName, email: user.email });
  } catch {
    res.status(403).json({ message: "Invalid Login, Please try again" });
  }
});

export default router;
