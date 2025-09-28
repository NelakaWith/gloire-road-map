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
  // Make description and target_date optional/null if missing or invalid
  let safeDescription =
    description && description.trim() !== "" ? description : null;
  let safeTargetDate = null;
  if (target_date && target_date !== "" && !isNaN(Date.parse(target_date))) {
    safeTargetDate = target_date;
  }
  const goal = await Goal.create({
    student_id,
    title,
    description: safeDescription,
    target_date: safeTargetDate,
    setup_date: new Date(),
    updated_at: new Date(),
    is_completed: false,
  });
  res.status(201).json(goal);
});

// Edit a goal (update any field)
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, target_date, is_completed, completed_at } =
    req.body;
  const updates = { updated_at: new Date() };

  if (title !== undefined) updates.title = title;
  if (description !== undefined)
    updates.description =
      description && description.trim() !== "" ? description : null;

  if (target_date !== undefined) {
    if (target_date && target_date !== "" && !isNaN(Date.parse(target_date))) {
      updates.target_date = target_date;
    } else {
      updates.target_date = null;
    }
  }

  // Allow client to optionally provide a completed_at timestamp. If provided and
  // valid, treat the goal as completed. If explicitly null, treat as not completed.
  if (completed_at !== undefined) {
    if (completed_at === null || completed_at === "") {
      updates.completed_at = null;
      updates.is_completed = false;
    } else if (!isNaN(Date.parse(completed_at))) {
      updates.completed_at = new Date(completed_at);
      updates.is_completed = true;
    }
    // invalid completed_at values are ignored
  }

  // Server-side handling for is_completed flag. When marking completed, if no
  // completed_at was provided above, set it to now. When un-marking, clear it.
  if (is_completed !== undefined) {
    updates.is_completed = is_completed;
    if (is_completed) {
      if (updates.completed_at === undefined) {
        updates.completed_at = new Date();
      }
    } else {
      updates.completed_at = null;
    }
  }

  await Goal.update(updates, { where: { id } });

  const updated = await Goal.findByPk(id);
  if (!updated) return res.status(404).json({ message: "Goal not found" });
  res.json(updated);
});

// Delete a goal
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Goal.destroy({ where: { id } });
  res.json({ message: "Goal deleted" });
});

export default router;
