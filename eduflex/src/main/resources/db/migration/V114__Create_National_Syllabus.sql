CREATE TABLE IF NOT EXISTS national_syllabuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    purpose TEXT,
    central_content TEXT,
    grading_criteria TEXT,
    level VARCHAR(255),
    credits INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS national_syllabus_id UUID REFERENCES national_syllabuses(id),
ADD COLUMN IF NOT EXISTS sun_code VARCHAR(255),
ADD COLUMN IF NOT EXISTS requires_lia BOOLEAN NOT NULL DEFAULT FALSE;
