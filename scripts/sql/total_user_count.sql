DO $$ 
DECLARE 
    r RECORD; 
    total_users INT := 0; 
    schema_users INT; 
BEGIN 
    FOR r IN SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema' LOOP 
        BEGIN 
            EXECUTE format('SELECT count(*) FROM %I.app_users', r.nspname) INTO schema_users; 
            total_users := total_users + schema_users; 
            RAISE NOTICE 'Schema %: % users', r.nspname, schema_users; 
        EXCEPTION WHEN OTHERS THEN 
            CONTINUE; 
        END; 
    END LOOP; 
    RAISE NOTICE 'TOTAL USERS ACROSS ALL SCHEMAS: %', total_users; 
END $$;
