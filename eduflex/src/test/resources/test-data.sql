DELETE FROM roles;
INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('ADMIN', 'System Administrator', 'ADMIN', true);
INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('TEACHER', 'Teacher', 'TEACHER', false);
INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('STUDENT', 'Student', 'STUDENT', false);
INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('PRINCIPAL', 'School Principal', 'PRINCIPAL', false);
INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('MENTOR', 'Mentor', 'MENTOR', false);
INSERT INTO roles (name, description, default_dashboard, is_super_admin) VALUES ('GUARDIAN', 'Guardian', 'STUDENT', false);
