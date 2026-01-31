-- Migration to support multiple source types in embeddings
DO $$ 
BEGIN 
    -- Rename document_id to source_id if it exists in CURRENT schema
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = current_schema() 
               AND table_name = 'embeddings' 
               AND column_name = 'document_id') THEN
        ALTER TABLE embeddings RENAME COLUMN document_id TO source_id;
    END IF;

    -- Add source_type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = current_schema() 
                   AND table_name = 'embeddings' 
                   AND column_name = 'source_type') THEN
        ALTER TABLE embeddings ADD COLUMN source_type VARCHAR(20) NOT NULL DEFAULT 'MATERIAL';
    END IF;

    -- Add source_title if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = current_schema() 
                   AND table_name = 'embeddings' 
                   AND column_name = 'source_title') THEN
        ALTER TABLE embeddings ADD COLUMN source_title VARCHAR(255);
    END IF;
END $$;

-- Drop and recreate indexes safely
-- Ensure course_id can be null (global or tenant-specific)
ALTER TABLE embeddings ALTER COLUMN course_id DROP NOT NULL;

DROP INDEX IF EXISTS idx_embedding_document_id;
DROP INDEX IF EXISTS idx_embedding_source_type;
DROP INDEX IF EXISTS idx_embedding_source_id;

CREATE INDEX idx_embedding_source_type ON embeddings(source_type);
CREATE INDEX idx_embedding_source_id ON embeddings(source_id);
