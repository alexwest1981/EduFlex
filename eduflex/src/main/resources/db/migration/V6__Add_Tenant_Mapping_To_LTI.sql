-- V6: Add tenant_id to lti_platforms for multi-tenant support
-- Using native ADD COLUMN IF NOT EXISTS for robustness
ALTER TABLE lti_platforms ADD COLUMN IF NOT EXISTS tenant_id VARCHAR(50);

-- Optional: Add index for faster lookup safely
DROP INDEX IF EXISTS idx_lti_platform_tenant_id;
CREATE INDEX idx_lti_platform_tenant_id ON lti_platforms(tenant_id);

-- Update existing records to 'public' if needed
UPDATE lti_platforms SET tenant_id = 'public' WHERE tenant_id IS NULL;
