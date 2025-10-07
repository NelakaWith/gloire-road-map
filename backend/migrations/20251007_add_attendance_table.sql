-- Migration: Add attendance table
-- Date: 2025-10-07
-- Description: Create attendance table to track student attendance records

CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') NOT NULL DEFAULT 'absent',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Ensure one attendance record per student per date
    UNIQUE KEY unique_student_date (student_id, date),

    -- Foreign key constraint
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,

    -- Indexes for better query performance
    INDEX idx_student_id (student_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
);