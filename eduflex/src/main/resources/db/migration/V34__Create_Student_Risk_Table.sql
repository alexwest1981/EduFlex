-- Migration to create the student_risk_flags table (idempotent)
CREATE TABLE IF NOT EXISTS student_risk_flags (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    risk_level VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    category VARCHAR(50) NOT NULL,    -- ATTENDANCE, PERFORMANCE, ENGAGEMENT, GENERAL
    ai_reasoning TEXT,
    ai_suggestions TEXT,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP INDEX IF EXISTS idx_student_risk_flags_student;
CREATE INDEX idx_student_risk_flags_student ON student_risk_flags(student_id);
DROP INDEX IF EXISTS idx_student_risk_flags_level;
CREATE INDEX idx_student_risk_flags_level ON student_risk_flags(risk_level);
