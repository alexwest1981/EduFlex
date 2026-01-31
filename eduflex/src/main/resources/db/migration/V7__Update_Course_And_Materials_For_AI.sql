-- Add sort_order and other missing columns to course_materials
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS available_from TIMESTAMP;
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(255);
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS video_chapters TEXT;
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS video_duration INTEGER;
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS video_file_size BIGINT;
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS video_status VARCHAR(50);
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 0;

-- Update type constraint to include QUESTIONS and EPUB
ALTER TABLE course_materials DROP CONSTRAINT IF EXISTS course_materials_type_check;
ALTER TABLE course_materials ADD CONSTRAINT course_materials_type_check CHECK (type IN ('TEXT', 'VIDEO', 'FILE', 'LINK', 'LESSON', 'STUDY_MATERIAL', 'QUESTIONS', 'EPUB'));

-- Add missing columns and index to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS tags TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS courses_slug_key ON courses(slug);
