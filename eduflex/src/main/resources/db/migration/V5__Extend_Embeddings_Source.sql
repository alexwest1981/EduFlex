-- Migration to support multiple source types in embeddings
ALTER TABLE embeddings RENAME COLUMN document_id TO source_id;
ALTER TABLE embeddings ADD COLUMN source_type VARCHAR(20) NOT NULL DEFAULT 'MATERIAL';
ALTER TABLE embeddings ADD COLUMN source_title VARCHAR(255);
ALTER TABLE embeddings ALTER COLUMN course_id DROP NOT NULL;

DROP INDEX IF EXISTS idx_embedding_document_id;
CREATE INDEX idx_embedding_source_type ON embeddings(source_type);
CREATE INDEX idx_embedding_source_id ON embeddings(source_id);
