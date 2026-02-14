-- Migration to remove legacy check constraints that block modern AI recommendations
-- These constraints are often left over from Hibernate auto-generation or old schemas

-- Remove from the CURRENT schema (Flyway handled)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all check constraints on adaptive_recommendations that were likely auto-generated
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'adaptive_recommendations'::regclass 
        AND (conname LIKE 'adaptive_recommendation%check' OR conname LIKE 'adaptive_recommendation%')
        AND contype = 'c' -- only check constraints
    ) LOOP
        EXECUTE 'ALTER TABLE adaptive_recommendations DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;
