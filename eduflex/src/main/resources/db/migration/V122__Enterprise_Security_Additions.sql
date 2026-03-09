-- Enterprise Security Features

-- 1. Read Audit Log for tracking access to sensitive data
CREATE TABLE read_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
    target_user_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
    resource_accessed VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    ip_address VARCHAR(255),
    user_agent VARCHAR(1024)
);

-- 2. Protected Identity flag for users
ALTER TABLE app_users ADD COLUMN is_protected_identity BOOLEAN DEFAULT FALSE NOT NULL;

-- 3. DRM protection flag for course materials
ALTER TABLE course_materials ADD COLUMN is_drm_protected BOOLEAN DEFAULT FALSE NOT NULL;
