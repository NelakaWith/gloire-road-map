/**
 * @fileoverview Goal management routes
 * @description Handles CRUD operations for student goals, including goal completion,
 * points allocation, and progress tracking
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import express from "express";
import { Goal, Student, PointsLog } from "../models.js";
import { POINTS } from "../config/pointsConfig.js";

const router = express.Router();

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
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const goal = await Goal.findByPk(id);
  if (!goal) return res.status(404).json({ message: "Goal not found" });
  res.json(goal);
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

  // Fetch the goal before update to check previous completion state
  const goalBefore = await Goal.findByPk(id);
  const wasCompleted = goalBefore && goalBefore.is_completed;
  const wasOnTime =
    goalBefore &&
    goalBefore.completed_at &&
    goalBefore.target_date &&
    new Date(goalBefore.completed_at) <= new Date(goalBefore.target_date);

  await Goal.update(updates, { where: { id } });
  const updated = await Goal.findByPk(id);
  if (!updated) return res.status(404).json({ message: "Goal not found" });

  // Award or subtract points based on completion state change
  const student = updated ? await Student.findByPk(updated.student_id) : null;
  if (student) {
    // Goal completed now, wasn't before: add points
    if (updated.is_completed && !wasCompleted) {
      student.points += POINTS.COMPLETE_GOAL;
      await student.save();
      await PointsLog.create({
        student_id: student.id,
        points: POINTS.COMPLETE_GOAL,
        reason: "Completed goal",
        related_goal_id: updated.id,
        created_at: updated.completed_at || new Date(),
      });
      // Bonus for on-time
      if (
        updated.completed_at &&
        updated.target_date &&
        new Date(updated.completed_at) <= new Date(updated.target_date)
      ) {
        student.points += POINTS.COMPLETE_ON_TIME;
        await student.save();
        await PointsLog.create({
          student_id: student.id,
          points: POINTS.COMPLETE_ON_TIME,
          reason: "Completed goal on time",
          related_goal_id: updated.id,
          created_at: updated.completed_at,
        });
      }
    }
    // Goal reopened (was completed, now not): subtract points
    if (!updated.is_completed && wasCompleted) {
      student.points += POINTS.REOPEN_GOAL;
      await student.save();
      await PointsLog.create({
        student_id: student.id,
        points: POINTS.REOPEN_GOAL,
        reason: "Goal reopened (completion revoked)",
        related_goal_id: updated.id,
        created_at: new Date(),
      });
      // Remove on-time bonus if it was previously awarded
      if (wasOnTime) {
        student.points += POINTS.REOPEN_ON_TIME;
        await student.save();
        await PointsLog.create({
          student_id: student.id,
          points: POINTS.REOPEN_ON_TIME,
          reason: "Goal reopened (on-time bonus revoked)",
          related_goal_id: updated.id,
          created_at: new Date(),
        });
      }
    }
  }

  res.json(updated);
});

// Delete a goal
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Goal.destroy({ where: { id } });
  res.json({ message: "Goal deleted" });
});

export default router;
