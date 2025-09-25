-- create_indexes.sql
-- Non-destructive index creation for analytics queries
-- Run on staging/production with DBA approval.

CREATE INDEX IF NOT EXISTS idx_goals_created_at ON goals(created_at);
CREATE INDEX IF NOT EXISTS idx_goals_completed_at ON goals(completed_at);
CREATE INDEX IF NOT EXISTS idx_goals_is_completed_created ON goals(is_completed, created_at);
CREATE INDEX IF NOT EXISTS idx_goals_target_date ON goals(target_date);
CREATE INDEX IF NOT EXISTS idx_goals_student_id_is_completed ON goals(student_id, is_completed);
