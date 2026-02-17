-- Migration V20_5: Create License Audit table
-- Required for LicenseService to track validation events

CREATE TABLE IF NOT EXISTS public.license_audit (
    id BIGSERIAL PRIMARY KEY,
    customer_name VARCHAR(255),
    status VARCHAR(50), -- VALID, INVALID, EXPIRED, LOCKED
    reason VARCHAR(255),
    ip_address VARCHAR(255),
    hostname VARCHAR(255),
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance on timestamp (logging queries)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'license_audit' AND indexname = 'idx_license_audit_timestamp') THEN
        CREATE INDEX idx_license_audit_timestamp ON public.license_audit(timestamp);
    END IF;
END $$;

COMMENT ON TABLE public.license_audit IS 'Audit log for license validation events';
