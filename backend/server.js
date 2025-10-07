/**
 * @fileoverview Main Express server application
 * @description Entry point for the Gloire Road Map backend API server.
 * Configures middleware, routes, database connection, and starts the HTTP server.
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import goalRoutes from "./routes/goals.js";
import analyticsRoutes from "./routes/analytics.js";
import pointsRoutes from "./routes/points.js";
import attendanceRoutes from "./routes/attendance.js";
import { authenticateJWT } from "./middleware/auth.js";

dotenv.config();

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();

// Middleware configuration
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

/**
 * API Routes Configuration
 * @description Sets up all API endpoints with appropriate authentication middleware
 *
 * Routes:
 * - /api/auth - Public authentication routes (login, register)
 * - /api/students - Protected student management routes
 * - /api/goals - Protected goal management routes
 * - /api/analytics - Protected analytics and reporting routes
 * - /api/points - Public/Protected points system routes
 * - /api/attendance - Protected attendance tracking routes
 */
app.use("/api/auth", authRoutes);
app.use("/api/students", authenticateJWT, studentRoutes);
app.use("/api/goals", authenticateJWT, goalRoutes);
app.use("/api/analytics", authenticateJWT, analyticsRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/attendance", authenticateJWT, attendanceRoutes);

import { sequelize } from "./models.js";

/**
 * Server port configuration
 * @type {number}
 * @default 3001
 */
const PORT = process.env.PORT || 3001;

/**
 * Initialize database connection and start HTTP server
 * @description Synchronizes Sequelize models with database and starts the Express server
 * @async
 */
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });
