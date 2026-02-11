-- Add main teacher (huvudansvarig lärare) to class_groups
ALTER TABLE class_groups ADD COLUMN main_teacher_id BIGINT;
ALTER TABLE class_groups ADD CONSTRAINT fk_class_groups_main_teacher
    FOREIGN KEY (main_teacher_id) REFERENCES app_users(id) ON DELETE SET NULL;

-- Join table for multiple teachers per class
CREATE TABLE class_group_teachers (
    class_group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (class_group_id, user_id),
    CONSTRAINT fk_cgt_class_group FOREIGN KEY (class_group_id) REFERENCES class_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_cgt_user FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);
