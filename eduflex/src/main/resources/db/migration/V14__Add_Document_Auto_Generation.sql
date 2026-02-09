-- Add columns for automatic document generation and QR code verification
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS source_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS source_id BIGINT,
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(255) UNIQUE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_documents_auto_source ON documents(auto_generated, source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_documents_verification ON documents(verification_code);

-- Update existing documents to set auto_generated = FALSE where NULL
UPDATE documents SET auto_generated = FALSE WHERE auto_generated IS NULL;
