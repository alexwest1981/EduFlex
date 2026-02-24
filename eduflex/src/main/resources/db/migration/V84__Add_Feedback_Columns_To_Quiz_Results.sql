-- Adds missing columns to quiz_results to support teacher feedback and AI-generated answer feedback
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS teacher_feedback TEXT;
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS answer_feedback_json TEXT;
