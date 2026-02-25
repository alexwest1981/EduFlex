CREATE TABLE IF NOT EXISTS user_bankid_identities (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES app_users(id),
    ssn_hash VARCHAR(64) UNIQUE NOT NULL,
    linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bankid_ssn_hash ON user_bankid_identities(ssn_hash);
