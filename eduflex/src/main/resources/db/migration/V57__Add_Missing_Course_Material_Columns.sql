-- Migration to add missing Adaptive Learning Metadata to Course Materials - Ensuring they exist in public schema
-- This addresses the "column m1_0.difficulty_level does not exist" error during flashcard generation

ALTER TABLE public.course_materials ADD COLUMN IF NOT EXISTS difficulty_level INTEGER DEFAULT 3;
ALTER TABLE public.course_materials ADD COLUMN IF NOT EXISTS estimated_time_minutes INTEGER DEFAULT 15;
ALTER TABLE public.course_materials ADD COLUMN IF NOT EXISTS prerequisite_material_id BIGINT;

-- Add foreign key constraint if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_material_prerequisite') THEN
        ALTER TABLE public.course_materials 
        ADD CONSTRAINT fk_material_prerequisite 
        FOREIGN KEY (prerequisite_material_id) REFERENCES public.course_materials(id);
    END IF;
END $$;

-- Index for potential adaptive engine queries
CREATE INDEX IF NOT EXISTS idx_material_difficulty ON public.course_materials(difficulty_level);
