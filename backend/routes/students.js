/**
 * @fileoverview Student management routes
 * @description Handles all student-related API endpoints including CRUD operations,
 * attendance statistics, and goal management
 * @author @NelakaWith
 * @version 1.0.0
 */

import express from "express";
import DIContainer from "../di-container.js";
import {
  validate,
  studentSchemas,
  paramSchemas,
} from "../middleware/validation.js";

const router = express.Router();

// Get service instance from DI container
const studentService = DIContainer.getService("student");

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
    const students = await studentService.getAllStudentsWithAttendance();
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
  try {
    const { name, contact_number, address, date_of_birth } = req.body;
    await studentService.createStudent({
      name,
      contact_number: contact_number || null,
      address: address || null,
      date_of_birth: date_of_birth || null,
    });
    res.json({ message: "Student added" });
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ message: "Failed to create student" });
  }
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
    try {
      const { name, contact_number, address, date_of_birth } = req.body;
      const { id } = req.params;

      await studentService.updateStudent(id, {
        name,
        contact_number: contact_number || null,
        address: address || null,
        date_of_birth: date_of_birth || null,
      });
      res.json({ message: "Student updated" });
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
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
  try {
    const { id } = req.params;
    await studentService.deleteStudent(id);
    res.json({ message: "Student deleted" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Failed to delete student" });
  }
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
    const student = await studentService.getStudentById(id);

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
    try {
      const { id } = req.params;
      const goals = await studentService.getStudentGoals(id);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching student goals:", error);
      res.status(500).json({ message: "Failed to fetch student goals" });
    }
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
    try {
      const { id } = req.params;
      const { title } = req.body;
      await studentService.createStudentGoal(id, title);
      res.json({ message: "Goal added" });
    } catch (error) {
      console.error("Error creating student goal:", error);
      res.status(500).json({ message: "Failed to create goal" });
    }
  }
);

export default router;
