-- V6: Add tenant_id to lti_platforms for multi-tenant support
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = current_schema() 
                   AND table_name = 'lti_platforms' 
                   AND column_name = 'tenant_id') THEN
        ALTER TABLE public.lti_platforms ADD COLUMN tenant_id VARCHAR(50);
    END IF;
END $$;

-- Optional: Add index for faster lookup safely
DROP INDEX IF EXISTS idx_lti_platform_tenant_id;
CREATE INDEX idx_lti_platform_tenant_id ON public.lti_platforms(tenant_id);

-- Update existing records to 'public' if needed
UPDATE public.lti_platforms SET tenant_id = 'public' WHERE tenant_id IS NULL;
