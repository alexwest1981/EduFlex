-- Migration V99_2: Grant Shop access (ACCESS_SHOP) to ALL roles
-- This ensures the URL is not blocked for anyone, even if not visible in their sidebar.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM roles
    LOOP
        INSERT INTO role_permissions (role_id, permission)
        VALUES (r.id, 'ACCESS_SHOP')
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;
