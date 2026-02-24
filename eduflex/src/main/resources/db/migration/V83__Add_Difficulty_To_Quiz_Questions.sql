-- Migration to add difficulty column to quiz_questions table
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS difficulty INTEGER DEFAULT 1;
