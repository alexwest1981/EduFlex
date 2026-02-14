-- Migration to add Adaptive Learning Metadata to Course Materials - IDEMPOTENT (Postgres 9.6+)
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 3;
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS prerequisite_material_id BIGINT;
ALTER TABLE course_materials ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER DEFAULT 15;

-- Add foreign key constraint if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_material_prerequisite') THEN
        ALTER TABLE course_materials 
        ADD CONSTRAINT fk_material_prerequisite 
        FOREIGN KEY (prerequisite_material_id) REFERENCES course_materials(id);
    END IF;
END $$;

-- Index for potential adaptive engine queries
CREATE INDEX IF NOT EXISTS idx_material_difficulty ON course_materials(difficulty_level);
