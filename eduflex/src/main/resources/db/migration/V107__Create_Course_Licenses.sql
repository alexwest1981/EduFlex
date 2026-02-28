CREATE TABLE IF NOT EXISTS course_licenses (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL,
    total_seats INT NOT NULL DEFAULT 1,
    used_seats INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    order_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_course_licenses_course_id ON course_licenses(course_id);
CREATE INDEX IF NOT EXISTS idx_course_licenses_status ON course_licenses(status);
