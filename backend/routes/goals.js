import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Mark goal as completed
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { is_completed } = req.body;
  await pool.query("UPDATE goals SET is_completed = ? WHERE id = ?", [
    is_completed,
    id,
  ]);
  res.json({ message: "Goal updated" });
});

export default router;
