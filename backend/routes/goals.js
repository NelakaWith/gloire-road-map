/**
 * @fileoverview Goal management routes
 * @description Handles CRUD operations for student goals, including goal completion,
 * points allocation, and progress tracking
 * @author @NelakaWith
 * @version 1.0.0
 */

import express from "express";
import DIContainer from "../di-container.js";
import {
  validate,
  goalSchemas,
  paramSchemas,
} from "../middleware/validation.js";

const router = express.Router();

// Get service instance from DI container
const goalService = DIContainer.getService("goal");

/**
 * Get a single goal by ID
 * @route GET /api/goals/:id
 * @description Retrieves a specific goal by its unique identifier
 * @access Private (requires JWT authentication)
 * @param {string} req.params.id - Goal ID
 * @returns {Object} Goal object with all properties
 * @throws {404} Goal not found
 * @throws {500} Internal server error if database query fails
 */
router.get("/:id", validate(paramSchemas.id, "params"), async (req, res) => {
  try {
    const { id } = req.params;
    const goal = await goalService.getGoalById(id);
    if (!goal) return res.status(404).json({ message: "Goal not found" });
    res.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ message: "Failed to fetch goal" });
  }
});

/**
 * Create a new goal
 * @route POST /api/goals
 * @description Creates a new goal for a student with optional description and target date
 * @access Private (requires JWT authentication)
 * @param {Object} req.body - Goal data
 * @param {number} req.body.student_id - Student ID (required)
 * @param {string} req.body.title - Goal title (required)
 * @param {string} [req.body.description] - Goal description (optional)
 * @param {string} [req.body.target_date] - Target completion date in ISO format (optional)
 * @returns {Object} Success message with created goal data
 * @throws {400} Bad request if required fields are missing
 * @throws {500} Internal server error if database operation fails
 */
router.post("/", validate(goalSchemas.create), async (req, res) => {
  try {
    const { student_id, title, description, target_date } = req.body;
    const goal = await goalService.createGoal({
      student_id,
      title,
      description: description || null,
      target_date: target_date || null,
    });
    res.status(201).json(goal);
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ message: "Failed to create goal" });
  }
});

router.patch(
  "/:id",
  validate(paramSchemas.id, "params"),
  validate(goalSchemas.update),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, target_date, is_completed, completed_at } =
        req.body;

      const updated = await goalService.updateGoal(id, {
        title,
        description,
        target_date,
        is_completed,
        completed_at,
      });

      if (!updated) return res.status(404).json({ message: "Goal not found" });

      res.json(updated);
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  }
);

// Delete a goal
router.delete("/:id", validate(paramSchemas.id, "params"), async (req, res) => {
  try {
    const { id } = req.params;
    await goalService.deleteGoal(id);
    res.json({ message: "Goal deleted" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ message: "Failed to delete goal" });
  }
});

export default router;
