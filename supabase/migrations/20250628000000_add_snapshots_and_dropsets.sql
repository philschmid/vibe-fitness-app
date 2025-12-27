-- Add workout_snapshot to training_sessions
ALTER TABLE training_sessions ADD COLUMN IF NOT EXISTS workout_snapshot JSONB;

-- Add has_dropset to exercises
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS has_dropset BOOLEAN DEFAULT FALSE;

-- Add is_dropset to session_sets
ALTER TABLE session_sets ADD COLUMN IF NOT EXISTS is_dropset BOOLEAN DEFAULT FALSE;

