-- Backfill points for existing students based on completed goals
-- 1. Update students.points with total points
UPDATE students s
JOIN (
  SELECT g.student_id,
    SUM(2) AS completed_points,
    SUM(CASE WHEN g.completed_at IS NOT NULL AND g.completed_at <= g.target_date THEN 3 ELSE 0 END) AS on_time_bonus,
    SUM(2 + CASE WHEN g.completed_at IS NOT NULL AND g.completed_at <= g.target_date THEN 3 ELSE 0 END) AS total_points
  FROM goals g
  WHERE g.is_completed = 1
  GROUP BY g.student_id
) pts ON pts.student_id = s.id
SET s.points = pts.total_points;

-- 2. Insert audit rows into points_log for each completed goal
INSERT INTO points_log (student_id, points, reason, related_goal_id, created_at)
SELECT g.student_id, 2, 'Completed goal', g.id, g.completed_at
FROM goals g
WHERE g.is_completed = 1;

-- 3. Insert bonus audit rows for on-time completions
INSERT INTO points_log (student_id, points, reason, related_goal_id, created_at)
SELECT g.student_id, 3, 'Completed goal on time', g.id, g.completed_at
FROM goals g
WHERE g.is_completed = 1 AND g.completed_at IS NOT NULL AND g.completed_at <= g.target_date;
