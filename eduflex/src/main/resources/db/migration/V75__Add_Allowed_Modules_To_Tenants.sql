-- Migration to add allowed_modules column to tenants table
-- This allows the Master account to whitelist specific modules per tenant

ALTER TABLE IF EXISTS public.tenants 
ADD COLUMN IF NOT EXISTS allowed_modules TEXT;

COMMENT ON COLUMN public.tenants.allowed_modules IS 'Comma-separated list of module keys whitelisted for this tenant';
