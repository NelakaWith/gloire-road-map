import express from "express";
import { Student, Goal } from "../models.js";

const router = express.Router();

// Get all students
router.get("/", async (req, res) => {
  const students = await Student.findAll({ order: [["created_at", "DESC"]] });
  res.json(students);
});

// Add student
router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });
  await Student.create({ name });
  res.json({ message: "Student added" });
});

// Edit student
router.patch("/:id", async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  await Student.update({ name }, { where: { id } });
  res.json({ message: "Student updated" });
});

// Delete student
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Student.destroy({ where: { id } });
  res.json({ message: "Student deleted" });
});

// Get goals for a student
router.get("/:id/goals", async (req, res) => {
  const { id } = req.params;
  const goals = await Goal.findAll({
    where: { student_id: id },
    order: [["created_at", "DESC"]],
  });
  res.json(goals);
});

// Add goal to student
router.post("/:id/goals", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  if (!title) return res.status(400).json({ message: "Title required" });
  await Goal.create({ student_id: id, title });
  res.json({ message: "Goal added" });
});

export default router;
