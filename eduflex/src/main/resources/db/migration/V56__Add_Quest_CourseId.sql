-- Add course_id to eduai_quests so quests can link to real courses for navigation
ALTER TABLE eduai_quests ADD COLUMN IF NOT EXISTS course_id BIGINT;
