-- Migration V99_1: Grant Shop access to Student and Teacher roles
-- This ensures that users with these roles can actually enter the Shop view.

DO $$
DECLARE
    student_role_id BIGINT;
    teacher_role_id BIGINT;
BEGIN
    -- Get IDs for STUDENT and TEACHER roles
    SELECT id INTO student_role_id FROM roles WHERE name = 'STUDENT';
    SELECT id INTO teacher_role_id FROM roles WHERE name = 'TEACHER';

    -- Grant ACCESS_SHOP to Student
    IF student_role_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission)
        VALUES (student_role_id, 'ACCESS_SHOP')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Grant ACCESS_SHOP to Teacher (optional but usually good)
    IF teacher_role_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission)
        VALUES (teacher_role_id, 'ACCESS_SHOP')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
