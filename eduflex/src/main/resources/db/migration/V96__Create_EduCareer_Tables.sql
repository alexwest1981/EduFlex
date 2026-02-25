CREATE TABLE IF NOT EXISTS user_saved_internships (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_users(id),
    job_id VARCHAR(255) NOT NULL,
    headline VARCHAR(500),
    company_name VARCHAR(255),
    logo_url TEXT,
    city VARCHAR(100),
    match_score DOUBLE PRECISION,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_internship_user ON user_saved_internships(user_id);
