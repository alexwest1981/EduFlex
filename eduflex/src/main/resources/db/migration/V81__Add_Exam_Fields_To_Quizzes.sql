-- Migration to add exam-related fields to quizzes table
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS is_exam BOOLEAN DEFAULT FALSE;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS grading_type VARCHAR(255) DEFAULT 'MANUAL';
