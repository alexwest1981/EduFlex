-- Migration V20_6: Update Tenants table with Stripe columns
-- Required for Tenant entity mapping

-- Add stripe_customer_id if it likely doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tenants' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE public.tenants ADD COLUMN stripe_customer_id VARCHAR(255) UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tenants' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE public.tenants ADD COLUMN stripe_subscription_id VARCHAR(255) UNIQUE;
    END IF;
END $$;

COMMENT ON COLUMN public.tenants.stripe_customer_id IS 'Stripe Customer ID for billing';
COMMENT ON COLUMN public.tenants.stripe_subscription_id IS 'Stripe Subscription ID for billing';
