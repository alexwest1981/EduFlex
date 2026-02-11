-- Drop the restrictive check constraint on role_permissions
-- This constraint is hardcoded to a specific list of permissions and prevents adding new ones.
-- We rely on Java Enum validation instead.

ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_permission_check;
