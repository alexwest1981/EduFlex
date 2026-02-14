-- Create elevhalsa_journal_entries table
CREATE TABLE IF NOT EXISTS elevhalsa_journal_entries (
    id BIGSERIAL PRIMARY KEY,
    case_id BIGINT NOT NULL REFERENCES elevhalsa_cases(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES app_users(id),
    content TEXT NOT NULL,
    visibility_level VARCHAR(50) NOT NULL DEFAULT 'INTERNAL',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Create elevhalsa_bookings table
CREATE TABLE IF NOT EXISTS elevhalsa_bookings (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    staff_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'PHYSICAL',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_journal_case_id ON elevhalsa_journal_entries(case_id);
CREATE INDEX idx_booking_student_id ON elevhalsa_bookings(student_id);
CREATE INDEX idx_booking_staff_id ON elevhalsa_bookings(staff_id);
CREATE INDEX idx_booking_start_time ON elevhalsa_bookings(start_time);
