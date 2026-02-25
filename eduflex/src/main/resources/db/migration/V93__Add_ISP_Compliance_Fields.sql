-- Add compliance fields for Komvux to Individual Study Plans
ALTER TABLE individual_study_plans
ADD COLUMN IF NOT EXISTS examensmal TEXT,
ADD COLUMN IF NOT EXISTS krav_poang INTEGER;

-- Add points and level to planned courses
ALTER TABLE isp_planned_courses
ADD COLUMN IF NOT EXISTS points INTEGER,
ADD COLUMN IF NOT EXISTS level  VARCHAR(100);
