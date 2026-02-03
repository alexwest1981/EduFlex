-- Migration V10: Advanced File System (Folders & Centralized Sharing)

-- 1. Create Folders table
CREATE TABLE IF NOT EXISTS folders (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_folder_id BIGINT REFERENCES folders(id) ON DELETE CASCADE,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create File Shares table (Reference-based sharing)
CREATE TABLE IF NOT EXISTS file_shares (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- USER, GROUP, COURSE, LESSON, LINK
    target_id BIGINT,                 -- ID of user, group, etc.
    permission VARCHAR(50) NOT NULL,  -- VIEW, EDIT, MANAGE
    shared_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    link_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP WITHOUT TIME ZONE
);

-- 3. Add Folder reference to Documents
ALTER TABLE documents ADD COLUMN IF NOT EXISTS folder_id BIGINT REFERENCES folders(id) ON DELETE SET NULL;

-- 4. Migrate existing data from document_shares to file_shares
-- Wrap in DO block to avoid errors if document_shares doesn't exist or is empty
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'document_shares') THEN
        INSERT INTO file_shares (document_id, target_type, target_id, permission, shared_by_id, shared_at)
        SELECT ds.document_id, 'USER', ds.user_id, 'VIEW', d.user_id, COALESCE(d.uploaded_at, NOW())
        FROM document_shares ds
        JOIN documents d ON ds.document_id = d.id;
        
        -- 5. Drop the old sharing table after migration
        DROP TABLE document_shares;
    END IF;
END $$;
