-- Migration to aggressively remove ALL remaining check constraints on adaptive_recommendations
-- This handles variations in singular/plural naming and ensures modern AI types are supported

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'adaptive_recommendations'::regclass 
        AND contype = 'c' -- only check constraints
    ) LOOP
        EXECUTE 'ALTER TABLE adaptive_recommendations DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;
