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

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/students", authenticateJWT, studentRoutes);
app.use("/api/goals", authenticateJWT, goalRoutes);
app.use("/api/analytics", authenticateJWT, analyticsRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/attendance", authenticateJWT, attendanceRoutes);

import { sequelize } from "./models.js";

const PORT = process.env.PORT || 3001;
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
