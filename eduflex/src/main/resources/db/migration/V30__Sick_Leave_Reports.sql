CREATE TABLE sick_leave_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    reason VARCHAR(500),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    reported_at TIMESTAMP DEFAULT NOW(),
    reported_by_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL
);
