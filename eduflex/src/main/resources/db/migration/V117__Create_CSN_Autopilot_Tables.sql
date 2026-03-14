-- Migration for CSN Autopilot (Phase 1)
-- Adds tables for Course Enrollment Details (Study Pace) and CSN Event Logs (Codes 99, 41, 81)

CREATE TABLE IF NOT EXISTS course_enrollment_details (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL,
    study_pace_percentage INTEGER NOT NULL,
    enrolled_at TIMESTAMP NOT NULL,
    status_changed_at TIMESTAMP,
    CONSTRAINT fk_ced_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_ced_student FOREIGN KEY (student_id) REFERENCES app_users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS csn_event_log (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    event_code VARCHAR(20) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    description TEXT,
    is_reported_to_csn BOOLEAN NOT NULL DEFAULT FALSE,
    reported_at TIMESTAMP,
    CONSTRAINT fk_cel_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_cel_student FOREIGN KEY (student_id) REFERENCES app_users (id) ON DELETE CASCADE
);

-- Indexing for performance (IF NOT EXISTS is not standard SQL for indexes in all Postgres versions, but we can use a DO block or just ignore errors if they exist, but standard CREATE INDEX IF NOT EXISTS works in PG 9.5+)
CREATE INDEX IF NOT EXISTS idx_ced_course_student ON course_enrollment_details (course_id, student_id);
CREATE INDEX IF NOT EXISTS idx_ced_status ON course_enrollment_details (status);
CREATE INDEX IF NOT EXISTS idx_cel_unreported ON csn_event_log (is_reported_to_csn) WHERE is_reported_to_csn = false;
