-- seed_goals.sql
-- Sample goals spread across months with created_at and completed_at values
INSERT INTO goals (id, student_id, title, description, created_at, completed_at, is_completed, target_date)
VALUES
  (1, 1, 'Goal A', 'desc', '2025-06-10', '2025-06-15', 1, '2025-06-20'),
  (2, 1, 'Goal B', 'desc', '2025-07-05', '2025-07-20', 1, '2025-07-25'),
  (3, 2, 'Goal C', 'desc', '2025-08-01', NULL, 0, '2025-08-30'),
  (4, 3, 'Goal D', 'desc', '2025-08-15', '2025-09-02', 1, '2025-09-10'),
  (5, 2, 'Goal E', 'desc', '2025-09-01', '2025-09-10', 1, '2025-09-20');
