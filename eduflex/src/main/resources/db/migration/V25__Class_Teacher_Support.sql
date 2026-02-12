-- Add main teacher (huvudansvarig lärare) to class_groups (idempotent)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='class_groups' AND column_name='main_teacher_id') THEN
        ALTER TABLE class_groups ADD COLUMN main_teacher_id BIGINT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_class_groups_main_teacher') THEN
        ALTER TABLE class_groups ADD CONSTRAINT fk_class_groups_main_teacher
            FOREIGN KEY (main_teacher_id) REFERENCES app_users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Join table for multiple teachers per class
CREATE TABLE IF NOT EXISTS class_group_teachers (
    class_group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (class_group_id, user_id),
    CONSTRAINT fk_cgt_class_group FOREIGN KEY (class_group_id) REFERENCES class_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_cgt_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);
