import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Get all students
router.get("/", async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM students ORDER BY created_at DESC"
  );
  res.json(rows);
});

// Add student
router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });
  await pool.query("INSERT INTO students (name) VALUES (?)", [name]);
  res.json({ message: "Student added" });
});

// Edit student
router.patch("/:id", async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  await pool.query("UPDATE students SET name = ? WHERE id = ?", [name, id]);
  res.json({ message: "Student updated" });
});

// Delete student
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM students WHERE id = ?", [id]);
  res.json({ message: "Student deleted" });
});

// Get goals for a student
router.get("/:id/goals", async (req, res) => {
  const { id } = req.params;
  const [goals] = await pool.query(
    "SELECT * FROM goals WHERE student_id = ? ORDER BY created_at DESC",
    [id]
  );
  res.json(goals);
});

// Add goal to student
router.post("/:id/goals", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: "Title required" });
  await pool.query("INSERT INTO goals (student_id, title) VALUES (?, ?)", [
    id,
    title,
  ]);
  res.json({ message: "Goal added" });
});

export default router;
