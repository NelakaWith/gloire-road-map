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
import { validate, authSchemas } from "../middleware/validation.js";

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
 *
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register admin user
 *     description: Creates the first admin user. Registration is blocked if users already exist.
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - email
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 description: Unique username for the admin
 *                 example: admin
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Plain text password (will be hashed)
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessMessage'
 *       403:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", validate(authSchemas.register), async (req, res) => {
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
 *
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates user credentials and returns JWT token
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userName
 *               - password
 *             properties:
 *               userName:
 *                 type: string
 *                 description: Username for authentication
 *                 example: admin
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Plain text password
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated requests
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userName:
 *                       type: string
 *                       example: admin
 *                     email:
 *                       type: string
 *                       example: admin@example.com
 *       400:
 *         description: Missing username or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", validate(authSchemas.login), async (req, res) => {
  const { userName, password } = req.body;
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
