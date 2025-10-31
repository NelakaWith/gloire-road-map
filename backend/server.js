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
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { specs, swaggerUiOptions } from "./config/swagger.js";
import authRoutes from "./routes/auth.js";
import studentRoutes from "./routes/students.js";
import goalRoutes from "./routes/goals.js";
import analyticsRoutes from "./routes/analytics.js";
import pointsRoutes from "./routes/points.js";
import attendanceRoutes from "./routes/attendance.js";
import { authenticateJWT } from "./middleware/auth.js";

dotenv.config();

/**
 * Rate limiting configuration
 * @description Protects API from abuse and brute force attacks
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();

// Apply rate limiting to all routes
app.use(generalLimiter);

// Middleware configuration
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

/**
 * API Routes Configuration
 * @description Sets up all API endpoints with appropriate authentication middleware and rate limiting
 *
 * Routes:
 * - /api/auth - Public authentication routes (login, register) with strict rate limiting
 * - /api/students - Protected student management routes
 * - /api/goals - Protected goal management routes
 * - /api/analytics - Protected analytics and reporting routes
 * - /api/points - Protected points system routes
 * - /api/attendance - Protected attendance tracking routes
 * - /api-docs - Interactive API documentation (Swagger UI)
 */
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/students", authenticateJWT, studentRoutes);
app.use("/api/goals", authenticateJWT, goalRoutes);
app.use("/api/analytics", authenticateJWT, analyticsRoutes);
app.use("/api/points", authenticateJWT, pointsRoutes);
app.use("/api/attendance", authenticateJWT, attendanceRoutes);

/**
 * Swagger API Documentation
 * @description Serves interactive API documentation at /api-docs
 * @access Public (consider protecting in production)
 * @security Rate limited to prevent abuse
 */
const docsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 docs requests per windowMs
  message: {
    error: "Too many documentation requests, please try again later.",
    retryAfter: "15 minutes",
  },
});

app.use(
  "/api-docs",
  docsLimiter,
  swaggerUi.serve,
  swaggerUi.setup(specs, swaggerUiOptions)
);

/**
 * Root endpoint
 * @description Provides basic API information and links to documentation
 */
app.get("/", (req, res) => {
  res.json({
    name: "Gloire Road Map API",
    version: "1.0.0",
    description: "Student management and goal tracking system",
  });
});

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
      console.log(`✅ Backend running on http://localhost:${PORT}`);
      console.log(`📑 API docs available at http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("🚨 Failed to sync database:", err);
  });
