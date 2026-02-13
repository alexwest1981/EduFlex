-- Migration to fix student_activity_logs constraints
-- 1. Make course_id nullable
ALTER TABLE student_activity_logs ALTER COLUMN course_id DROP NOT NULL;

-- 2. Update activity_type CHECK constraint
ALTER TABLE student_activity_logs DROP CONSTRAINT IF EXISTS student_activity_logs_activity_type_check;

ALTER TABLE student_activity_logs ADD CONSTRAINT student_activity_logs_activity_type_check 
CHECK (activity_type IN (
    'VIEW_LESSON', 
    'DOWNLOAD_FILE', 
    'WATCH_VIDEO', 
    'COURSE_ACCESS', 
    'LOGIN', 
    'QUIZ_ATTEMPT', 
    'ASSIGNMENT_SUBMISSION', 
    'FORUM_POST', 
    'EBOOK_READ', 
    'AI_TUTOR_CHAT'
));
