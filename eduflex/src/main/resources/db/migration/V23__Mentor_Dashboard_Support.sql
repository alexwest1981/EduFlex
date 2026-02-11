-- Add mentor association to ClassGroup
ALTER TABLE class_groups ADD COLUMN mentor_id BIGINT;
ALTER TABLE class_groups ADD CONSTRAINT fk_class_groups_mentor FOREIGN KEY (mentor_id) REFERENCES app_users(id);

-- Create table for Pupil Well-being Surveys
CREATE TABLE class_wellbeing_surveys (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES app_users(id),
    class_group_id BIGINT NOT NULL REFERENCES class_groups(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance on aggregation
CREATE INDEX idx_wellbeing_class ON class_wellbeing_surveys(class_group_id);
CREATE INDEX idx_wellbeing_student ON class_wellbeing_surveys(student_id);
