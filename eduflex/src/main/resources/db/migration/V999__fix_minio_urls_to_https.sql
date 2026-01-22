-- Migration: Fix MinIO URLs from HTTP to HTTPS
-- This script updates all file URLs stored in the database to use the public HTTPS URL
-- Run this after setting MINIO_PUBLIC_URL=https://storage.eduflexlms.se in production

-- Replace http://localhost:9000 with the public URL
-- Replace http://www.eduflexlms.se:9000 with the public URL
-- Replace http://minio:9000 (Docker internal) with the public URL

-- Update course_materials.file_url
UPDATE course_materials
SET file_url = REPLACE(file_url, 'http://localhost:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://localhost:9000%';

UPDATE course_materials
SET file_url = REPLACE(file_url, 'http://www.eduflexlms.se:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://www.eduflexlms.se:9000%';

UPDATE course_materials
SET file_url = REPLACE(file_url, 'http://minio:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://minio:9000%';

-- Update documents.file_url
UPDATE documents
SET file_url = REPLACE(file_url, 'http://localhost:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://localhost:9000%';

UPDATE documents
SET file_url = REPLACE(file_url, 'http://www.eduflexlms.se:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://www.eduflexlms.se:9000%';

UPDATE documents
SET file_url = REPLACE(file_url, 'http://minio:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://minio:9000%';

-- Update lesson.attachment_url
UPDATE lesson
SET attachment_url = REPLACE(attachment_url, 'http://localhost:9000', 'https://storage.eduflexlms.se')
WHERE attachment_url LIKE 'http://localhost:9000%';

UPDATE lesson
SET attachment_url = REPLACE(attachment_url, 'http://www.eduflexlms.se:9000', 'https://storage.eduflexlms.se')
WHERE attachment_url LIKE 'http://www.eduflexlms.se:9000%';

UPDATE lesson
SET attachment_url = REPLACE(attachment_url, 'http://minio:9000', 'https://storage.eduflexlms.se')
WHERE attachment_url LIKE 'http://minio:9000%';

-- Update message_attachments.file_url
UPDATE message_attachments
SET file_url = REPLACE(file_url, 'http://localhost:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://localhost:9000%';

UPDATE message_attachments
SET file_url = REPLACE(file_url, 'http://www.eduflexlms.se:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://www.eduflexlms.se:9000%';

UPDATE message_attachments
SET file_url = REPLACE(file_url, 'http://minio:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://minio:9000%';

-- Update submission.file_url
UPDATE submission
SET file_url = REPLACE(file_url, 'http://localhost:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://localhost:9000%';

UPDATE submission
SET file_url = REPLACE(file_url, 'http://www.eduflexlms.se:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://www.eduflexlms.se:9000%';

UPDATE submission
SET file_url = REPLACE(file_url, 'http://minio:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://minio:9000%';

-- Update user_documents.file_url
UPDATE user_documents
SET file_url = REPLACE(file_url, 'http://localhost:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://localhost:9000%';

UPDATE user_documents
SET file_url = REPLACE(file_url, 'http://www.eduflexlms.se:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://www.eduflexlms.se:9000%';

UPDATE user_documents
SET file_url = REPLACE(file_url, 'http://minio:9000', 'https://storage.eduflexlms.se')
WHERE file_url LIKE 'http://minio:9000%';

-- Update app_users.profile_picture_url
UPDATE app_users
SET profile_picture_url = REPLACE(profile_picture_url, 'http://localhost:9000', 'https://storage.eduflexlms.se')
WHERE profile_picture_url LIKE 'http://localhost:9000%';

UPDATE app_users
SET profile_picture_url = REPLACE(profile_picture_url, 'http://www.eduflexlms.se:9000', 'https://storage.eduflexlms.se')
WHERE profile_picture_url LIKE 'http://www.eduflexlms.se:9000%';

UPDATE app_users
SET profile_picture_url = REPLACE(profile_picture_url, 'http://minio:9000', 'https://storage.eduflexlms.se')
WHERE profile_picture_url LIKE 'http://minio:9000%';

-- Update organization_branding.logo_url
UPDATE organization_branding
SET logo_url = REPLACE(logo_url, 'http://localhost:9000', 'https://storage.eduflexlms.se')
WHERE logo_url LIKE 'http://localhost:9000%';

UPDATE organization_branding
SET logo_url = REPLACE(logo_url, 'http://www.eduflexlms.se:9000', 'https://storage.eduflexlms.se')
WHERE logo_url LIKE 'http://www.eduflexlms.se:9000%';

UPDATE organization_branding
SET logo_url = REPLACE(logo_url, 'http://minio:9000', 'https://storage.eduflexlms.se')
WHERE logo_url LIKE 'http://minio:9000%';

-- Update organization_branding.favicon_url
UPDATE organization_branding
SET favicon_url = REPLACE(favicon_url, 'http://localhost:9000', 'https://storage.eduflexlms.se')
WHERE favicon_url LIKE 'http://localhost:9000%';

UPDATE organization_branding
SET favicon_url = REPLACE(favicon_url, 'http://www.eduflexlms.se:9000', 'https://storage.eduflexlms.se')
WHERE favicon_url LIKE 'http://www.eduflexlms.se:9000%';

UPDATE organization_branding
SET favicon_url = REPLACE(favicon_url, 'http://minio:9000', 'https://storage.eduflexlms.se')
WHERE favicon_url LIKE 'http://minio:9000%';

-- Update assignment_attachment.url (only for FILE type, not YOUTUBE or LINK)
UPDATE assignment_attachment
SET url = REPLACE(url, 'http://localhost:9000', 'https://storage.eduflexlms.se')
WHERE url LIKE 'http://localhost:9000%' AND type = 'FILE';

UPDATE assignment_attachment
SET url = REPLACE(url, 'http://www.eduflexlms.se:9000', 'https://storage.eduflexlms.se')
WHERE url LIKE 'http://www.eduflexlms.se:9000%' AND type = 'FILE';

UPDATE assignment_attachment
SET url = REPLACE(url, 'http://minio:9000', 'https://storage.eduflexlms.se')
WHERE url LIKE 'http://minio:9000%' AND type = 'FILE';
