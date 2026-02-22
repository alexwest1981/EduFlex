-- Migration V74: Add tier column to tenants table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tenants' AND column_name = 'tier') THEN
        ALTER TABLE public.tenants ADD COLUMN tier VARCHAR(50) DEFAULT 'BASIC';
    END IF;
END $$;

COMMENT ON COLUMN public.tenants.tier IS 'Subscription tier for the tenant (BASIC, PRO, ENTERPRISE)';
