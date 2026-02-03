DO $$
DECLARE
    tenant_rec RECORD;
    member_count INT;
BEGIN
    -- 1. Skapa temporär tabell
    DROP TABLE IF EXISTS found_tenants;
    CREATE TEMP TABLE found_tenants (
        tenant_name TEXT,
        schema_name TEXT,
        user_count INT
    );

    -- 2. HÄR ÄR NYCKELN: Lägg till "Originalsidan" (Public Schema) manuellt först
    BEGIN
        SELECT count(*) INTO member_count FROM public.app_users;
        INSERT INTO found_tenants VALUES ('Originalsidan (Admin)', 'public', member_count);
    EXCEPTION WHEN OTHERS THEN
        -- Om public.app_users inte finns (ovanligt), logga det
        RAISE NOTICE 'Kunde inte läsa public.app_users';
    END;

    -- 3. Loopa igenom resten av kunderna (Tenants)
    FOR tenant_rec IN 
        SELECT name, db_schema 
        FROM public.tenants 
    LOOP
        BEGIN
            -- Dynamisk SQL för att dyka ner i varje tenants schema
            EXECUTE format('SELECT count(*) FROM %I.app_users', tenant_rec.db_schema) 
            INTO member_count;

            INSERT INTO found_tenants VALUES (tenant_rec.name, tenant_rec.db_schema, member_count);
            
        EXCEPTION WHEN undefined_table THEN
            -- Om en tenant är trasig, visa -1
            INSERT INTO found_tenants VALUES (tenant_rec.name, tenant_rec.db_schema, -1);
        END;
    END LOOP;
END $$;

-- 4. Visa hela listan
SELECT * FROM found_tenants ORDER BY user_count DESC;
