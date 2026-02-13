-- Aggressively drop any check constraints on role_permissions before inserting new permissions.
-- Different schemas might have different auto-generated names for the check constraint.
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint con
        INNER JOIN pg_class rel ON rel.oid = con.conrelid
        WHERE rel.relname = 'role_permissions' 
          AND con.contype = 'c'
    ) 
    LOOP
        EXECUTE 'ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Init ROLE_PRINCIPAL and Permissions
INSERT INTO roles (name, description, default_dashboard, is_super_admin)
VALUES ('ROLE_REKTOR', 'Skolledning / Rektor', 'PRINCIPAL', FALSE)
ON CONFLICT (name) DO NOTHING;

-- Get the role id (since it is generated)
-- Note: In a production script we might use a subselect.
DO $$
DECLARE
    role_id_val BIGINT;
BEGIN
    SELECT id INTO role_id_val FROM roles WHERE name = 'ROLE_REKTOR';

    IF role_id_val IS NOT NULL THEN
        -- Add permissions for Rektor
        INSERT INTO role_permissions (role_id, permission) VALUES
        (role_id_val, 'VIEW_DASHBOARD'),
        (role_id_val, 'VIEW_COURSES'),
        (role_id_val, 'VIEW_PROFILE'),
        (role_id_val, 'COURSE_VIEW_ALL'),
        (role_id_val, 'GRADE_VIEW'),
        (role_id_val, 'USER_VIEW_ALL'),
        (role_id_val, 'AUDIT_VIEW'),
        (role_id_val, 'ORG_MANAGE'),
        (role_id_val, 'STAFF_AUDIT'),
        (role_id_val, 'GRADE_AUDIT_ALL'),
        (role_id_val, 'INCIDENT_MANAGE')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
