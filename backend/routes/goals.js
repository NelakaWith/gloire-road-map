import express from "express";
import { Goal } from "../models.js";

const router = express.Router();

// Get a single goal by id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const goal = await Goal.findByPk(id);
  if (!goal) return res.status(404).json({ message: "Goal not found" });
  res.json(goal);
});

// Create a new goal
router.post("/", async (req, res) => {
  const { student_id, title, description, target_date } = req.body;
  const goal = await Goal.create({
    student_id,
    title,
    description,
    target_date,
    setup_date: new Date(),
    updated_at: new Date(),
    is_completed: false,
  });
  res.status(201).json(goal);
});

// Edit a goal (update any field)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, target_date, is_completed } = req.body;
  const updates = { updated_at: new Date() };
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (target_date !== undefined) updates.target_date = target_date;
  if (is_completed !== undefined) updates.is_completed = is_completed;
  await Goal.update(updates, { where: { id } });
  res.json({ message: "Goal updated" });
});

// Delete a goal
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Goal.destroy({ where: { id } });
  res.json({ message: "Goal deleted" });
});

export default router;
