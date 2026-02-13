-- Add mentor association to ClassGroup (idempotent and schema-aware)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='class_groups' 
                     AND column_name='mentor_id' 
                     AND table_schema = current_schema()) THEN
        ALTER TABLE class_groups ADD COLUMN mentor_id BIGINT;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name='fk_class_groups_mentor' 
                     AND table_schema = current_schema()) THEN
        ALTER TABLE class_groups ADD CONSTRAINT fk_class_groups_mentor FOREIGN KEY (mentor_id) REFERENCES app_users(id);
    END IF;
END $$;

-- Create table for Pupil Well-being Surveys
CREATE TABLE IF NOT EXISTS class_wellbeing_surveys (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES app_users(id),
    class_group_id BIGINT NOT NULL REFERENCES class_groups(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wellbeing_class ON class_wellbeing_surveys(class_group_id);
CREATE INDEX IF NOT EXISTS idx_wellbeing_student ON class_wellbeing_surveys(student_id);
