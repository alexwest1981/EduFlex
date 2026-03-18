-- V112: Add missing video columns to course_materials for all tenants
-- This ensures that schema drift between public and tenant schemas is resolved

ALTER TABLE course_materials 
ADD COLUMN IF NOT EXISTS video_duration BIGINT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS video_file_size BIGINT,
ADD COLUMN IF NOT EXISTS video_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS video_chapters TEXT,
ADD COLUMN IF NOT EXISTS ai_video_script TEXT,
ADD COLUMN IF NOT EXISTS ai_video_url TEXT;

-- Update existing records if needed (optional)
UPDATE course_materials SET video_status = 'READY' WHERE video_status IS NULL AND type = 'VIDEO' AND (file_url IS NOT NULL OR ai_video_url IS NOT NULL);