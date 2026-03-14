-- Migration for LIA Placements (Phase 2 compliance)

CREATE TABLE IF NOT EXISTS lia_placements (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    company_name VARCHAR(255),
    company_org_number VARCHAR(50),
    supervisor_name VARCHAR(255),
    supervisor_email VARCHAR(255),
    supervisor_phone VARCHAR(50),
    start_date DATE,
    end_date DATE,
    agreement_signed BOOLEAN NOT NULL DEFAULT FALSE,
    midterm_evaluation_done BOOLEAN NOT NULL DEFAULT FALSE,
    final_evaluation_done BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_lia_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_lia_student FOREIGN KEY (student_id) REFERENCES app_users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lia_course ON lia_placements (course_id);
CREATE INDEX IF NOT EXISTS idx_lia_student ON lia_placements (student_id);
