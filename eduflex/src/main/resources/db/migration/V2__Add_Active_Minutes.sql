ALTER TABLE app_users ADD COLUMN IF NOT EXISTS active_minutes INTEGER DEFAULT 0;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS last_active timestamp(6);
