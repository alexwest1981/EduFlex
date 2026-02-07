-- Populate missing package_id for existing records to satisfy NOT NULL constraint
UPDATE scorm_packages SET package_id = 'legacy_' || id WHERE package_id IS NULL;

-- Now safe to enforce NOT NULL if we wanted to, but the Entity already has nullable=false
-- which triggers the Hibernate check even before the DB constraint.

-- Ensure package_id is NOT NULL in database too
ALTER TABLE scorm_packages ALTER COLUMN package_id SET NOT NULL;
