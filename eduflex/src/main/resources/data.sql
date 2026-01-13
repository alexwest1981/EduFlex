INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('ADMIN', 'System Administrator', 'ADMIN', true) ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('TEACHER', 'Teacher', 'TEACHER', false) ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('STUDENT', 'Student', 'STUDENT', false) ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('PRINCIPAL', 'School Principal', 'PRINCIPAL', false) ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('MENTOR', 'Mentor', 'MENTOR', false) ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('GUARDIAN', 'Guardian', 'STUDENT', false) ON CONFLICT (name) DO NOTHING;
