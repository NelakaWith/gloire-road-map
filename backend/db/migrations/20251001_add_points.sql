-- migration: add points column to students and create points_log table

-- 1. Add points column to students (default 0)
ALTER TABLE students ADD COLUMN points INT NOT NULL DEFAULT 0;

-- 2. Create points_log table
CREATE TABLE points_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  points INT NOT NULL,
  reason VARCHAR(255),
  related_goal_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (related_goal_id) REFERENCES goals(id)
);
