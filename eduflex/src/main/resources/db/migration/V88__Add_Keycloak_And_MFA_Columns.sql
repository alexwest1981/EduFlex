-- Add Keycloak and MFA columns to app_users
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS keycloak_user_id VARCHAR(255);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(255);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;

-- Add Social Media columns if they are missing
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS instagram_url VARCHAR(255);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(255);
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255);

-- Ensure SSN is present (since it's now encrypted and might have been added recently)
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS ssn VARCHAR(255);
