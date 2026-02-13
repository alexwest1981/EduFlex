-- Fix constraints to allow user deletion (idempotent and schema-aware)
-- 1. Ensure mentor_id exists in class_groups
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='class_groups' 
                     AND column_name='mentor_id' 
                     AND table_schema = current_schema()) THEN
        ALTER TABLE class_groups ADD COLUMN mentor_id BIGINT;
    END IF;
END $$;

-- 2. Class groups should have mentor_id set to NULL if the user is deleted
ALTER TABLE class_groups DROP CONSTRAINT IF EXISTS fk_class_groups_mentor;
ALTER TABLE class_groups ADD CONSTRAINT fk_class_groups_mentor FOREIGN KEY (mentor_id) REFERENCES app_users(id) ON DELETE SET NULL;

-- 2. Wellbeing surveys should be DELETED if the student or class is deleted
ALTER TABLE class_wellbeing_surveys DROP CONSTRAINT IF EXISTS class_wellbeing_surveys_student_id_fkey;
ALTER TABLE class_wellbeing_surveys DROP CONSTRAINT IF EXISTS fk_wellbeing_student;
ALTER TABLE class_wellbeing_surveys ADD CONSTRAINT fk_wellbeing_student FOREIGN KEY (student_id) REFERENCES app_users(id) ON DELETE CASCADE;

ALTER TABLE class_wellbeing_surveys DROP CONSTRAINT IF EXISTS class_wellbeing_surveys_class_group_id_fkey;
ALTER TABLE class_wellbeing_surveys DROP CONSTRAINT IF EXISTS fk_wellbeing_class;
ALTER TABLE class_wellbeing_surveys ADD CONSTRAINT fk_wellbeing_class FOREIGN KEY (class_group_id) REFERENCES class_groups(id) ON DELETE CASCADE;
