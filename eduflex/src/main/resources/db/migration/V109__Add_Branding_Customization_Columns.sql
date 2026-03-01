-- Add missing branding columns if they don't exist
-- This ensures that all tenant schemas are up to date with the JPA model

ALTER TABLE organization_branding ADD COLUMN IF NOT EXISTS show_logo_in_menu BOOLEAN DEFAULT TRUE;
ALTER TABLE organization_branding ADD COLUMN IF NOT EXISTS primary_color VARCHAR(50) DEFAULT '#6366f1';
ALTER TABLE organization_branding ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(50) DEFAULT '#4f46e5';

-- Update existing column constraints if necessary
ALTER TABLE organization_branding ALTER COLUMN show_logo_in_menu SET NOT NULL;
