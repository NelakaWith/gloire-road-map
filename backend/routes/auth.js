import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models.js";

const router = express.Router();

// Register admin (only if no users exist)
router.post("/register", async (req, res) => {
  const { user_name, email, password } = req.body;
  const count = await User.count();
  if (count > 0)
    return res.status(403).json({ message: "Admin already exists" });
  const hash = await bcrypt.hash(password, 10);
  await User.create({ user_name, email, password_hash: hash });
  res.json({ message: "Admin registered" });
});

// Login
router.post("/login", async (req, res) => {
  const { user_name, password } = req.body;
  const user = await User.findOne({ where: { user_name } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign(
    { id: user.id, user_name: user.user_name, email: user.email },
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
    res.json({ id: user.id, user_name: user.user_name, email: user.email });
  } catch {
    res.status(403).json({ message: "Invalid token" });
  }
});

export default router;
