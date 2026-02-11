-- Expand elevhalsa_cases table
ALTER TABLE elevhalsa_cases ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'OTHER';
ALTER TABLE elevhalsa_cases ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50) DEFAULT 'LOW';
ALTER TABLE elevhalsa_cases ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE elevhalsa_cases ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITHOUT TIME ZONE;

-- Create join table for team members
CREATE TABLE IF NOT EXISTS elevhalsa_case_team_members (
    case_id BIGINT REFERENCES elevhalsa_cases(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES app_users(id) ON DELETE CASCADE,
    PRIMARY KEY (case_id, user_id)
);

-- Register ROLE_HALSOTEAM if not exists
INSERT INTO roles (name, description, default_dashboard, is_super_admin)
SELECT 'ROLE_HALSOTEAM', 'Student Health Team', 'HALSOTEAM', false
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_HALSOTEAM');

-- Assign permissions to ROLE_HALSOTEAM
-- Assuming we want basic dashboard access + health specific ones
DO $$
DECLARE
    role_id_var BIGINT;
BEGIN
    SELECT id INTO role_id_var FROM roles WHERE name = 'ROLE_HALSOTEAM';
    
    DELETE FROM role_permissions WHERE role_id = role_id_var;
    
    INSERT INTO role_permissions (role_id, permission) VALUES
    (role_id_var, 'VIEW_DASHBOARD'),
    (role_id_var, 'VIEW_PROFILE'),
    (role_id_var, 'ELEVHALSA_VIEW'),
    (role_id_var, 'ELEVHALSA_MANAGE'),
    (role_id_var, 'INCIDENT_MANAGE');
END $$;
