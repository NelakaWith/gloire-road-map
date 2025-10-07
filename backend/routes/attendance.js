import express from "express";
import { Student, Attendance, sequelize } from "../models.js";
import { Op } from "sequelize";

const router = express.Router();

// Get attendance records with optional filtering
router.get("/", async (req, res) => {
  try {
    const { student_id, date, start_date, end_date, status } = req.query;

    const whereClause = {};

    if (student_id) {
      whereClause.student_id = student_id;
    }

    if (date) {
      whereClause.date = date;
    }

    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date],
      };
    } else if (start_date) {
      whereClause.date = {
        [Op.gte]: start_date,
      };
    } else if (end_date) {
      whereClause.date = {
        [Op.lte]: end_date,
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id", "name"],
        },
      ],
      order: [
        ["date", "DESC"],
        ["student_id", "ASC"],
      ],
    });

    res.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
});

// Get attendance for a specific student
router.get("/student/:student_id", async (req, res) => {
  try {
    const { student_id } = req.params;
    const { start_date, end_date } = req.query;

    const whereClause = { student_id };

    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date],
      };
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id", "name"],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.json(attendance);
  } catch (error) {
    console.error("Error fetching student attendance:", error);
    res.status(500).json({ message: "Failed to fetch student attendance" });
  }
});

// Record attendance for a student
router.post("/", async (req, res) => {
  try {
    const { student_id, date, status, notes } = req.body;

    if (!student_id || !date || !status) {
      return res.status(400).json({
        message: "student_id, date, and status are required",
      });
    }

    // Check if student exists
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if attendance already exists for this student and date
    const existingAttendance = await Attendance.findOne({
      where: { student_id, date },
    });

    if (existingAttendance) {
      return res.status(409).json({
        message: "Attendance already recorded for this student on this date",
      });
    }

    const attendance = await Attendance.create({
      student_id,
      date,
      status,
      notes: notes || null,
    });

    const result = await Attendance.findByPk(attendance.id, {
      include: [
        {
          model: Student,
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error recording attendance:", error);
    res.status(500).json({ message: "Failed to record attendance" });
  }
});

// Update attendance record
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const attendance = await Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    const updateData = {
      updated_at: new Date(),
    };

    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    await Attendance.update(updateData, { where: { id } });

    const updatedAttendance = await Attendance.findByPk(id, {
      include: [
        {
          model: Student,
          attributes: ["id", "name"],
        },
      ],
    });

    res.json(updatedAttendance);
  } catch (error) {
    console.error("Error updating attendance:", error);
    res.status(500).json({ message: "Failed to update attendance" });
  }
});

// Delete attendance record
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByPk(id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    await Attendance.destroy({ where: { id } });
    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({ message: "Failed to delete attendance record" });
  }
});

// Bulk record attendance for multiple students on the same date
router.post("/bulk", async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        message: "date and records array are required",
      });
    }

    const results = [];
    const errors = [];

    for (const record of records) {
      try {
        const { student_id, status, notes } = record;

        if (!student_id || !status) {
          errors.push({
            student_id,
            error: "student_id and status are required",
          });
          continue;
        }

        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({
          where: { student_id, date },
        });

        if (existingAttendance) {
          // Update existing record
          await Attendance.update(
            { status, notes: notes || null, updated_at: new Date() },
            { where: { student_id, date } }
          );

          const updated = await Attendance.findOne({
            where: { student_id, date },
            include: [{ model: Student, attributes: ["id", "name"] }],
          });

          results.push(updated);
        } else {
          // Create new record
          const attendance = await Attendance.create({
            student_id,
            date,
            status,
            notes: notes || null,
          });

          const created = await Attendance.findByPk(attendance.id, {
            include: [{ model: Student, attributes: ["id", "name"] }],
          });

          results.push(created);
        }
      } catch (error) {
        errors.push({
          student_id: record.student_id,
          error: error.message,
        });
      }
    }

    res.json({
      success: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error bulk recording attendance:", error);
    res.status(500).json({ message: "Failed to bulk record attendance" });
  }
});

// Get attendance summary/statistics
router.get("/summary", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const whereClause = {};
    if (start_date && end_date) {
      whereClause.date = {
        [Op.between]: [start_date, end_date],
      };
    }

    const summary = await Attendance.findAll({
      attributes: [
        "student_id",
        [sequelize.fn("COUNT", sequelize.col("*")), "total_records"],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'present' THEN 1 ELSE 0 END")
          ),
          "present_count",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'absent' THEN 1 ELSE 0 END")
          ),
          "absent_count",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'late' THEN 1 ELSE 0 END")
          ),
          "late_count",
        ],
        [
          sequelize.fn(
            "SUM",
            sequelize.literal("CASE WHEN status = 'excused' THEN 1 ELSE 0 END")
          ),
          "excused_count",
        ],
      ],
      where: whereClause,
      include: [
        {
          model: Student,
          attributes: ["id", "name"],
        },
      ],
      group: ["student_id", "Student.id", "Student.name"],
      raw: false,
    });

    res.json(summary);
  } catch (error) {
    console.error("Error generating attendance summary:", error);
    res.status(500).json({ message: "Failed to generate attendance summary" });
  }
});

export default router;
