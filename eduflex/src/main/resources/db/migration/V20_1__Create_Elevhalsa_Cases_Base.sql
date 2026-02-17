-- Migration V20_1: Create base elevhalsa_cases table
-- This table was missing from the initial migration suite but is required by V21

CREATE TABLE IF NOT EXISTS public.elevhalsa_cases (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES public.app_users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'OPEN',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure index existence separately
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'elevhalsa_cases' AND indexname = 'idx_elevhalsa_student') THEN
        CREATE INDEX idx_elevhalsa_student ON public.elevhalsa_cases(student_id);
    END IF;
END $$;

COMMENT ON TABLE public.elevhalsa_cases IS 'Base table for elevhalsa cases used by Student Health features';
