-- Migration to add Adaptive Learning Metadata to Course Materials
ALTER TABLE course_materials 
ADD COLUMN difficulty_level INTEGER DEFAULT 3,
ADD COLUMN prerequisite_material_id BIGINT,
ADD COLUMN estimated_time_minutes INTEGER DEFAULT 15;

-- Add foreign key constraint for prerequisites
ALTER TABLE course_materials 
ADD CONSTRAINT fk_material_prerequisite 
FOREIGN KEY (prerequisite_material_id) REFERENCES course_materials(id);

-- Optional: Index for potential adaptive engine queries
CREATE INDEX idx_material_difficulty ON course_materials(difficulty_level);
