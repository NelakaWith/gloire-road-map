/**
 * @fileoverview Student management routes
 * @description Handles all student-related API endpoints including CRUD operations,
 * attendance statistics, and goal management
 * @author Gloire Road Map Team
 * @version 1.0.0
 */

import express from "express";
import { Student, Goal, Attendance, sequelize } from "../models.js";
import {
  validate,
  studentSchemas,
  paramSchemas,
} from "../middleware/validation.js";

const router = express.Router();

/**
 * Get all students with attendance statistics
 * @route GET /api/students
 * @description Retrieves all students with their attendance counts
 * @access Private (requires JWT authentication)
 * @returns {Array<Object>} Array of student objects with attendance data
 * @returns {number} returns.days_attended - Number of days marked as present
 * @returns {number} returns.total_attendance_records - Total attendance records
 * @throws {500} Internal server error if database query fails
 *
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     description: Retrieves all students with their attendance statistics
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * Create a new student
 * @route POST /api/students
 * @description Creates a new student record with optional contact and personal information
 * @access Private (requires JWT authentication)
 * @param {Object} req.body - Student data
 * @param {string} req.body.name - Student's full name (required)
 * @param {string} [req.body.contact_number] - Student's contact number
 * @param {string} [req.body.address] - Student's address
 * @param {string} [req.body.date_of_birth] - Student's date of birth (ISO date string)
 * @returns {Object} Success message
 * @throws {400} Bad request if name is missing
 * @throws {500} Internal server error if database operation fails
 */
router.post("/", validate(studentSchemas.create), async (req, res) => {
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

/**
 * Update an existing student
 * @route PATCH /api/students/:id
 * @description Updates student information. Only provided fields will be updated.
 * @access Private (requires JWT authentication)
 * @param {string} req.params.id - Student ID
 * @param {Object} req.body - Student data to update
 * @param {string} [req.body.name] - Student's full name
 * @param {string} [req.body.contact_number] - Student's contact number
 * @param {string} [req.body.address] - Student's address
 * @param {string} [req.body.date_of_birth] - Student's date of birth (ISO date string)
 * @returns {Object} Success message
 * @throws {500} Internal server error if database operation fails
 */
router.patch(
  "/:id",
  validate(paramSchemas.id, "params"),
  validate(studentSchemas.update),
  async (req, res) => {
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
  }
);

/**
 * Delete a student
 * @route DELETE /api/students/:id
 * @description Permanently deletes a student and all associated records
 * @access Private (requires JWT authentication)
 * @param {string} req.params.id - Student ID to delete
 * @returns {Object} Success message
 * @throws {500} Internal server error if database operation fails
 * @warning This action is irreversible and will delete all student data including goals and attendance
 */
router.delete("/:id", validate(paramSchemas.id, "params"), async (req, res) => {
  const { id } = req.params;
  await Student.destroy({ where: { id } });
  res.json({ message: "Student deleted" });
});

/**
 * Get single student with detailed attendance statistics
 * @route GET /api/students/:id
 * @description Retrieves a specific student with comprehensive attendance breakdown
 * @access Private (requires JWT authentication)
 * @param {string} req.params.id - Student ID
 * @returns {Object} Student object with detailed attendance statistics
 * @returns {number} returns.days_attended - Days marked as present
 * @returns {number} returns.days_absent - Days marked as absent
 * @returns {number} returns.days_late - Days marked as late
 * @returns {number} returns.days_excused - Days marked as excused
 * @returns {number} returns.total_attendance_records - Total attendance records
 * @throws {404} Student not found
 * @throws {500} Internal server error if database query fails
 */
router.get("/:id", validate(paramSchemas.id, "params"), async (req, res) => {
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

/**
 * Get all goals for a specific student
 * @route GET /api/students/:id/goals
 * @description Retrieves all goals associated with a student, ordered by creation date
 * @access Private (requires JWT authentication)
 * @param {string} req.params.id - Student ID
 * @returns {Array<Object>} Array of goal objects
 * @throws {500} Internal server error if database query fails
 */
router.get(
  "/:id/goals",
  validate(paramSchemas.id, "params"),
  async (req, res) => {
    const { id } = req.params;
    const goals = await Goal.findAll({
      where: { student_id: id },
      order: [["created_at", "DESC"]],
    });
    res.json(goals);
  }
);

/**
 * Create a new goal for a student
 * @route POST /api/students/:id/goals
 * @description Creates a new goal associated with the specified student
 * @access Private (requires JWT authentication)
 * @param {string} req.params.id - Student ID
 * @param {Object} req.body - Goal data
 * @param {string} req.body.title - Goal title (required)
 * @returns {Object} Success message
 * @throws {400} Bad request if title is missing
 * @throws {500} Internal server error if database operation fails
 */
router.post(
  "/:id/goals",
  validate(paramSchemas.id, "params"),
  validate(studentSchemas.createGoal),
  async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: "Title required" });
    await Goal.create({ student_id: id, title });
    res.json({ message: "Goal added" });
  }
);

export default router;
