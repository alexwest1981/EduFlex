CREATE TABLE business_outcomes (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    course_id BIGINT,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bo_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bo_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

CREATE INDEX idx_bo_user ON business_outcomes(user_id);
CREATE INDEX idx_bo_course ON business_outcomes(course_id);
