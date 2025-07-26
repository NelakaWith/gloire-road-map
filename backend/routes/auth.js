import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

// Register admin (only if no users exist)
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const [users] = await pool.query("SELECT COUNT(*) as count FROM users");
  if (users[0].count > 0)
    return res.status(403).json({ message: "Admin already exists" });
  const hash = await bcrypt.hash(password, 10);
  await pool.query("INSERT INTO users (email, password_hash) VALUES (?, ?)", [
    email,
    hash,
  ]);
  res.json({ message: "Admin registered" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  if (!rows.length)
    return res.status(401).json({ message: "Invalid credentials" });
  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "8h" }
  );
  res.json({ token });
});

// Get current user
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "No token" });
  const token = authHeader.split(" ")[1];
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ id: user.id, email: user.email });
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
});

export default router;
