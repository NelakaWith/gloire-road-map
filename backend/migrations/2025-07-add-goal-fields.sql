-- Migration script to update the 'goals' table for new fields
ALTER TABLE goals
  ADD COLUMN description TEXT NULL AFTER title,
  ADD COLUMN target_date DATE NULL AFTER description,
  ADD COLUMN setup_date DATETIME NULL AFTER target_date,
  ADD COLUMN updated_at DATETIME NULL AFTER setup_date;

-- Set setup_date and updated_at for existing rows
UPDATE goals SET setup_date = created_at WHERE setup_date IS NULL OR setup_date = '';
UPDATE goals SET updated_at = created_at WHERE updated_at IS NULL OR updated_at = '';
