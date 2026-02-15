-- Move ai_audit_log from westcode to public if it exists in westcode and not in public
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'westcode' AND tablename = 'ai_audit_log') THEN
        ALTER TABLE westcode.ai_audit_log SET SCHEMA public;
    END IF;
END $$;

-- Ensure the table exists in public (fallback if it wasn't in westcode)
CREATE TABLE IF NOT EXISTS public.ai_audit_log (
    id UUID PRIMARY KEY,
    action_type VARCHAR(255) NOT NULL,
    model_id VARCHAR(255) NOT NULL,
    actor_id VARCHAR(255),
    input_context TEXT,
    ai_response TEXT,
    reasoning_trace TEXT,
    successful BOOLEAN NOT NULL,
    error_message TEXT,
    timestamp TIMESTAMP
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_ai_audit_log_actor_id ON public.ai_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_ai_audit_log_timestamp ON public.ai_audit_log(timestamp);
