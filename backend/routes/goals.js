import express from "express";
import { Goal } from "../models.js";

const router = express.Router();

// Mark goal as completed
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { is_completed } = req.body;
  await Goal.update({ is_completed }, { where: { id } });
  res.json({ message: "Goal updated" });
});

export default router;
