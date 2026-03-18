CREATE TABLE IF NOT EXISTS certifications (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_users(id),
    course_id BIGINT NOT NULL REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    certificate_url TEXT,
    issued_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    verify_code VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cert_user ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_cert_status ON certifications(status);
CREATE INDEX IF NOT EXISTS idx_cert_expires ON certifications(expires_at);
