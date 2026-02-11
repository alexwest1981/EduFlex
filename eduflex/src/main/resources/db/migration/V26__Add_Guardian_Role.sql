-- Migration to add GUARDIAN role and parent-child linkage
INSERT INTO roles (name, description) 
VALUES ('GUARDIAN', 'Vårdnadshavare med tillgång till barnets närvaro, resultat och kommunikation')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS guardian_child_links (
    id SERIAL PRIMARY KEY,
    guardian_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50), -- e.g., 'PARENT', 'LEGAL_GUARDIAN'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_link UNIQUE (guardian_id, student_id)
);
