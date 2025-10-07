import express from "express";
import { Student, Goal, Attendance, sequelize } from "../models.js";

const router = express.Router();

// Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id AND attendance.status = "present")'
            ),
            "days_attended",
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id)"
            ),
            "total_attendance_records",
          ],
        ],
      },
      order: [["created_at", "DESC"]],
    });
    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

// Add student
router.post("/", async (req, res) => {
  const { name, contact_number, address, date_of_birth } = req.body;
  if (!name) return res.status(400).json({ message: "Name required" });

  // normalize date_of_birth: treat empty string as null, try to parse otherwise
  let dob = null;
  if (date_of_birth) {
    const d = new Date(date_of_birth);
    dob = isNaN(d.getTime()) ? null : d;
  }

  await Student.create({
    name,
    contact_number: contact_number || null,
    address: address || null,
    date_of_birth: dob,
  });
  res.json({ message: "Student added" });
});

// Edit student
router.patch("/:id", async (req, res) => {
  const { name, contact_number, address, date_of_birth } = req.body;
  const { id } = req.params;

  // normalize date_of_birth
  let dob = null;
  if (date_of_birth) {
    const d = new Date(date_of_birth);
    dob = isNaN(d.getTime()) ? null : d;
  }

  const update = {
    ...(name !== undefined ? { name } : {}),
    ...(contact_number !== undefined
      ? { contact_number: contact_number || null }
      : {}),
    ...(address !== undefined ? { address: address || null } : {}),
    ...(date_of_birth !== undefined ? { date_of_birth: dob } : {}),
  };

  await Student.update(update, { where: { id } });
  res.json({ message: "Student updated" });
});

// Delete student
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await Student.destroy({ where: { id } });
  res.json({ message: "Student deleted" });
});

// Get single student with attendance details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id, {
      attributes: {
        include: [
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id AND attendance.status = "present")'
            ),
            "days_attended",
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id AND attendance.status = "absent")'
            ),
            "days_absent",
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id AND attendance.status = "late")'
            ),
            "days_late",
          ],
          [
            sequelize.literal(
              '(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id AND attendance.status = "excused")'
            ),
            "days_excused",
          ],
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM attendance WHERE attendance.student_id = Student.id)"
            ),
            "total_attendance_records",
          ],
        ],
      },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Failed to fetch student" });
  }
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
