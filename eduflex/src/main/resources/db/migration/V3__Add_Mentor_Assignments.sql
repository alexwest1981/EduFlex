-- Migration V3: Add Mentor Assignments table
-- This table tracks which students are assigned to which mentors

CREATE TABLE IF NOT EXISTS mentor_assignments (
    id BIGSERIAL PRIMARY KEY,
    mentor_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,

    CONSTRAINT fk_mentor_assignments_mentor FOREIGN KEY (mentor_id)
        REFERENCES app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mentor_assignments_student FOREIGN KEY (student_id)
        REFERENCES app_users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mentor_assignments_created_by FOREIGN KEY (created_by)
        REFERENCES app_users(id) ON DELETE SET NULL,

    -- Ensure a student can only have one active mentor at a time
    CONSTRAINT unique_mentor_student UNIQUE (mentor_id, student_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_mentor_id ON mentor_assignments(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_student_id ON mentor_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_assignments_status ON mentor_assignments(status);

-- Add a comment to the table
COMMENT ON TABLE mentor_assignments IS 'Tracks mentor-student assignments for personalized guidance';
COMMENT ON COLUMN mentor_assignments.status IS 'Status of assignment: ACTIVE, INACTIVE, or PENDING';
