/**
 * @fileoverview Attendance management routes
 * @description Handles all attendance-related API endpoints including recording,
 * updating, filtering, and statistical analysis of student attendance
 * @author @NelakaWith
 * @version 1.0.0
 */

import express from "express";
import DIContainer from "../di-container.js";
import {
  validate,
  attendanceSchemas,
  paramSchemas,
} from "../middleware/validation.js";

const router = express.Router();

// Get service instance from DI container
const attendanceService = DIContainer.getService("attendance");

/**
 * Get attendance records with optional filtering
 * @route GET /api/attendance
 * @description Retrieves attendance records with optional filtering by student, date range, or status
 * @access Private (requires JWT authentication)
 * @param {string} [req.query.student_id] - Filter by student ID
 * @param {string} [req.query.date] - Filter by specific date (YYYY-MM-DD)
 * @param {string} [req.query.start_date] - Filter from start date (YYYY-MM-DD)
 * @param {string} [req.query.end_date] - Filter to end date (YYYY-MM-DD)
 * @param {string} [req.query.status] - Filter by status (present|absent|late|excused)
 * @returns {Array<Object>} Array of attendance records with student information
 * @throws {500} Internal server error if database query fails
 */
router.get(
  "/",
  validate(attendanceSchemas.query, "query"),
  async (req, res) => {
    try {
      const { student_id, date, start_date, end_date, status } = req.query;

      const attendance = await attendanceService.getAttendanceRecords({
        student_id,
        date,
        start_date,
        end_date,
        status,
      });

      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  }
);

/**
 * Get attendance records for a specific student
 * @route GET /api/attendance/student/:student_id
 * @description Retrieves all attendance records for a specific student with optional date filtering
 * @access Private (requires JWT authentication)
 * @param {string} req.params.student_id - Student ID
 * @param {string} [req.query.start_date] - Filter from start date (YYYY-MM-DD)
 * @param {string} [req.query.end_date] - Filter to end date (YYYY-MM-DD)
 * @returns {Array<Object>} Array of attendance records for the student
 * @throws {500} Internal server error if database query fails
 */
router.get(
  "/student/:student_id",
  validate(paramSchemas.studentId, "params"),
  validate(attendanceSchemas.query, "query"),
  async (req, res) => {
    try {
      const { student_id } = req.params;
      const { start_date, end_date } = req.query;

      const attendance = await attendanceService.getStudentAttendance(
        student_id,
        { start_date, end_date }
      );

      res.json(attendance);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({ message: "Failed to fetch student attendance" });
    }
  }
);

/**
 * Record attendance for a student
 * @route POST /api/attendance
 * @description Creates a new attendance record for a specific student and date
 * @access Private (requires JWT authentication)
 * @param {Object} req.body - Attendance data
 * @param {number} req.body.student_id - Student ID (required)
 * @param {string} req.body.date - Attendance date in YYYY-MM-DD format (required)
 * @param {string} req.body.status - Attendance status: present|absent|late|excused (required)
 * @param {string} [req.body.notes] - Optional notes about the attendance
 * @returns {Object} Created attendance record with student information
 * @throws {400} Bad request if required fields are missing
 * @throws {404} Student not found
 * @throws {409} Conflict if attendance already exists for this student and date
 * @throws {500} Internal server error if database operation fails
 */
router.post("/", validate(attendanceSchemas.create), async (req, res) => {
  try {
    const { student_id, date, status, notes } = req.body;

    const result = await attendanceService.recordAttendance({
      student_id,
      date,
      status,
      notes: notes || null,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error recording attendance:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes("already recorded")) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to record attendance" });
  }
});

/**
 * Update an existing attendance record
 * @route PATCH /api/attendance/:id
 * @description Updates an existing attendance record's status and/or notes
 * @access Private (requires JWT authentication)
 * @param {string} req.params.id - Attendance record ID
 * @param {Object} req.body - Fields to update
 * @param {string} [req.body.status] - New attendance status: present|absent|late|excused
 * @param {string} [req.body.notes] - Updated notes
 * @returns {Object} Updated attendance record with student information
 * @throws {404} Attendance record not found
 * @throws {500} Internal server error if database operation fails
 */
router.patch(
  "/:id",
  validate(paramSchemas.id, "params"),
  validate(attendanceSchemas.update),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updatedAttendance = await attendanceService.updateAttendance(id, {
        status,
        notes,
      });

      res.json(updatedAttendance);
    } catch (error) {
      console.error("Error updating attendance:", error);
      if (error.message.includes("not found")) {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update attendance" });
    }
  }
);

/**
 * Delete an attendance record
 * @route DELETE /api/attendance/:id
 * @description Permanently deletes an attendance record
 * @access Private (requires JWT authentication)
 * @param {string} req.params.id - Attendance record ID to delete
 * @returns {Object} Success message
 * @throws {404} Attendance record not found
 * @throws {500} Internal server error if database operation fails
 * @warning This action is irreversible
 */
router.delete("/:id", validate(paramSchemas.id, "params"), async (req, res) => {
  try {
    const { id } = req.params;

    await attendanceService.deleteAttendance(id);
    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to delete attendance record" });
  }
});

/**
 * Bulk record/update attendance for multiple students
 * @route POST /api/attendance/bulk
 * @description Records or updates attendance for multiple students on the same date
 * @access Private (requires JWT authentication)
 * @param {Object} req.body - Bulk attendance data
 * @param {string} req.body.date - Attendance date in YYYY-MM-DD format (required)
 * @param {Array<Object>} req.body.records - Array of attendance records (required)
 * @param {number} req.body.records[].student_id - Student ID (required)
 * @param {string} req.body.records[].status - Attendance status (required)
 * @param {string} [req.body.records[].notes] - Optional notes
 * @returns {Object} Results object with successful operations and errors
 * @returns {Array<Object>} returns.success - Successfully processed records
 * @returns {Array<Object>} [returns.errors] - Records that failed to process
 * @throws {400} Bad request if date or records array is missing
 * @throws {500} Internal server error if database operation fails
 */
router.post("/bulk", async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        message: "date and records array are required",
      });
    }

    const results = await attendanceService.bulkRecordAttendance(date, records);

    res.json(results);
  } catch (error) {
    console.error("Error bulk recording attendance:", error);
    res.status(500).json({ message: "Failed to bulk record attendance" });
  }
});

/**
 * Session-based attendance marking
 * @route POST /api/attendance/session
 * @description Mark attendance for all students in a session with simplified payload
 * @access Private (requires JWT authentication)
 * @param {Object} req.body - Session attendance data
 * @param {string} req.body.date - Session date in YYYY-MM-DD format (required)
 * @param {Array<Object>} req.body.attendance_records - Array of attendance records (required)
 * @param {number} req.body.attendance_records[].student_id - Student ID (required)
 * @param {string} req.body.attendance_records[].status - Attendance status (required)
 * @param {string} [req.body.attendance_records[].notes] - Optional notes
 * @returns {Object} Results with message and attendance records
 * @returns {string} returns.message - Success message with count
 * @returns {Array<Object>} returns.attendance - Created/updated attendance records
 * @throws {400} Bad request if required fields are missing
 * @throws {500} Internal server error if database operation fails
 */
router.post("/session", async (req, res) => {
  try {
    const { date, attendance_records } = req.body;

    if (!date || !attendance_records || !Array.isArray(attendance_records)) {
      return res.status(400).json({
        message: "date and attendance_records array are required",
      });
    }

    const results = await attendanceService.markSessionAttendance(
      date,
      attendance_records
    );

    res.json(results);
  } catch (error) {
    console.error("Error in session attendance marking:", error);
    res.status(500).json({
      message: error.message || "Failed to mark session attendance",
    });
  }
});

/**
 * Get attendance sheet for a specific date
 * @route GET /api/attendance/sheet/:date
 * @description Gets all students with their attendance status for a specific date
 * @access Private (requires JWT authentication)
 * @param {string} req.params.date - Date in YYYY-MM-DD format
 * @returns {Array<Object>} Array of students with attendance information
 * @returns {number} returns[].student_id - Student ID
 * @returns {string} returns[].name - Student name
 * @returns {string} returns[].status - Attendance status or 'not_marked' if no record
 * @returns {string} [returns[].notes] - Attendance notes if any
 * @returns {number} [returns[].attendance_id] - Attendance record ID if exists
 * @throws {500} Internal server error if database query fails
 */
router.get("/sheet/:date", async (req, res) => {
  try {
    const { date } = req.params;

    const attendanceSheet = await attendanceService.getAttendanceSheet(date);

    res.json(attendanceSheet);
  } catch (error) {
    console.error("Error fetching attendance sheet:", error);
    res.status(500).json({ message: "Failed to fetch attendance sheet" });
  }
});

/**
 * Get available session dates
 * @route GET /api/attendance/sessions
 * @description Gets all unique dates where attendance was recorded
 * @access Private (requires JWT authentication)
 * @param {string} [req.query.start_date] - Filter from start date (YYYY-MM-DD)
 * @param {string} [req.query.end_date] - Filter to end date (YYYY-MM-DD)
 * @returns {Array<Object>} Array of session dates with attendance counts
 * @returns {string} returns[].date - Session date (YYYY-MM-DD)
 * @returns {number} returns[].total_students - Total students with attendance recorded
 * @returns {number} returns[].present_count - Number of students marked present
 * @returns {number} returns[].absent_count - Number of students marked absent
 * @returns {number} returns[].late_count - Number of students marked late
 * @returns {number} returns[].excused_count - Number of students marked excused
 * @throws {500} Internal server error if database query fails
 */
router.get("/sessions", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const sessions = await attendanceService.getAttendanceSessions({
      start_date,
      end_date,
    });

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching attendance sessions:", error);
    res.status(500).json({ message: "Failed to fetch attendance sessions" });
  }
});

/**
 * Get attendance summary and statistics
 * @route GET /api/attendance/summary
 * @description Generates attendance statistics grouped by student with counts for each status
 * @access Private (requires JWT authentication)
 * @param {string} [req.query.start_date] - Filter from start date (YYYY-MM-DD)
 * @param {string} [req.query.end_date] - Filter to end date (YYYY-MM-DD)
 * @returns {Array<Object>} Array of attendance summaries per student
 * @returns {number} returns[].total_records - Total attendance records for the student
 * @returns {number} returns[].present_count - Count of present days
 * @returns {number} returns[].absent_count - Count of absent days
 * @returns {number} returns[].late_count - Count of late days
 * @returns {number} returns[].excused_count - Count of excused days
 * @returns {Object} returns[].Student - Student information (id, name)
 * @throws {500} Internal server error if database query fails
 */
router.get("/summary", async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const summary = await attendanceService.getAttendanceSummary({
      start_date,
      end_date,
    });

    res.json(summary);
  } catch (error) {
    console.error("Error generating attendance summary:", error);
    res.status(500).json({ message: "Failed to generate attendance summary" });
  }
});

export default router;
