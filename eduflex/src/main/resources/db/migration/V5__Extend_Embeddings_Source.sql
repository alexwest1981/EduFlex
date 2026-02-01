-- Migration to support multiple source types in embeddings
DO $$ 
BEGIN 
    -- 1. Rename document_id to source_id if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = current_schema() 
               AND table_name = 'embeddings' 
               AND column_name = 'document_id') THEN
        ALTER TABLE embeddings RENAME COLUMN document_id TO source_id;
    END IF;
END $$;

-- 2. Add columns natively (Idempotent)
ALTER TABLE embeddings ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) NOT NULL DEFAULT 'MATERIAL';
ALTER TABLE embeddings ADD COLUMN IF NOT EXISTS source_title VARCHAR(255);

-- Drop and recreate indexes safely
-- Ensure course_id can be null (global or tenant-specific)
ALTER TABLE embeddings ALTER COLUMN course_id DROP NOT NULL;

DROP INDEX IF EXISTS idx_embedding_document_id;
DROP INDEX IF EXISTS idx_embedding_source_type;
DROP INDEX IF EXISTS idx_embedding_source_id;

CREATE INDEX idx_embedding_source_type ON embeddings(source_type);
CREATE INDEX idx_embedding_source_id ON embeddings(source_id);
