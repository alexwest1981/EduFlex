-- Add missing columns to adaptive_recommendations in public schema
-- These columns were missed in V53 but are required by the AdaptiveRecommendation model

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'adaptive_recommendations' 
                   AND column_name = 'content_url') THEN
        ALTER TABLE public.adaptive_recommendations ADD COLUMN content_url VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'adaptive_recommendations' 
                   AND column_name = 'associated_course_id') THEN
        ALTER TABLE public.adaptive_recommendations ADD COLUMN associated_course_id BIGINT;
    END IF;
END $$;
