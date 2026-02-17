-- Migration V4_1: Create base embeddings table
-- This table was missing from the initial migration suite but is required by V5

CREATE TABLE IF NOT EXISTS public.embeddings (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT,
    document_id BIGINT,
    text_chunk TEXT NOT NULL,
    embedding_vector float8[]
);

-- Ensure index existence separately to prevent failures if table existed partially
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_embedding_document_id') THEN
        CREATE INDEX idx_embedding_document_id ON public.embeddings(document_id);
    END IF;
END $$;

COMMENT ON TABLE public.embeddings IS 'Base table for vector embeddings used by AI features';
