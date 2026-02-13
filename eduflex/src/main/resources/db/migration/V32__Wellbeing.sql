CREATE TABLE wellbeing_support_requests (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    staff_id BIGINT,
    type VARCHAR(50),
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    confidentiality_agreed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_well_student ON wellbeing_support_requests(student_id);
CREATE INDEX idx_well_status ON wellbeing_support_requests(status);
