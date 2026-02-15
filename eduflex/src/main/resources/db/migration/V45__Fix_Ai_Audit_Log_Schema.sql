-- Fix for AiAuditLog entity mismatch
-- Drops the incorrect table if it exists (optional, but cleaner) and creates the correct one

DROP TABLE IF EXISTS ai_audit_logs;
DROP TABLE IF EXISTS ai_audit_log;

CREATE TABLE ai_audit_log (
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

CREATE INDEX idx_ai_audit_log_actor_id ON ai_audit_log(actor_id);
CREATE INDEX idx_ai_audit_log_timestamp ON ai_audit_log(timestamp);
