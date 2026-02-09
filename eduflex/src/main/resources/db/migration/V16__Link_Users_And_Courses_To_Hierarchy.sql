-- Koppling mellan existerande entiteter och den nya skolhierarkin
ALTER TABLE app_users 
ADD COLUMN IF NOT EXISTS class_group_id BIGINT REFERENCES class_groups(id);

ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS class_group_id BIGINT REFERENCES class_groups(id);

-- Index för snabbare sökning
CREATE INDEX IF NOT EXISTS idx_users_class_group ON app_users(class_group_id);
CREATE INDEX IF NOT EXISTS idx_courses_class_group ON courses(class_group_id);
