-- Add all missing columns to app_users that exist in the JPA entity but not in the database
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS storage_quota BIGINT DEFAULT 1073741824;
