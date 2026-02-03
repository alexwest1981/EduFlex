DO $$ 
DECLARE 
    r RECORD; 
    user_count INTEGER;
BEGIN 
    FOR r IN SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema' LOOP 
        BEGIN 
            EXECUTE 'SELECT count(*) FROM "' || r.nspname || '".app_users' INTO user_count; 
            RAISE NOTICE 'Schema %: % users', r.nspname, user_count; 
        EXCEPTION WHEN OTHERS THEN 
            RAISE NOTICE 'Schema %: app_users table not found', r.nspname; 
        END; 
    END LOOP; 
END $$;
