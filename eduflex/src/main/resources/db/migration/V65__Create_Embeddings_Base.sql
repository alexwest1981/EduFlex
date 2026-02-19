-- Migration V4_1: Create base embeddings table
-- This table was missing from the initial migration suite but is required by V5

-- Ensure we don't collide with a shadow table in public schema if search path includes it
-- (Flyway's IF NOT EXISTS might find public.embeddings and skip creating the tenant one)
DROP TABLE IF EXISTS public.embeddings CASCADE;

CREATE TABLE IF NOT EXISTS embeddings (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT,
    document_id BIGINT,
    text_chunk TEXT NOT NULL,
    embedding_vector float8[]
);

-- Ensure document_id exists (in case table was created by an older version of this script)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = CURRENT_SCHEMA AND table_name='embeddings' AND column_name='document_id') THEN
        ALTER TABLE embeddings ADD COLUMN document_id BIGINT;
    END IF;
END $$;

-- Ensure index existence separately to prevent failures if table existed partially
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_embedding_document_id') THEN
        CREATE INDEX idx_embedding_document_id ON embeddings(document_id);
    END IF;
END $$;

COMMENT ON TABLE embeddings IS 'Base table for vector embeddings used by AI features';
