-- Migration: Create Resources Table
-- Description: Creates the missing resources table referenced by later migrations

CREATE TABLE IF NOT EXISTS public.resources (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    owner_id BIGINT NOT NULL,
    visibility VARCHAR(50) DEFAULT 'PRIVATE',
    tags VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_resources_owner FOREIGN KEY (owner_id) REFERENCES public.app_users (id) ON DELETE CASCADE,
    CONSTRAINT resources_visibility_check CHECK (visibility IN ('PRIVATE', 'TENANT', 'PUBLIC', 'GLOBAL_LIBRARY'))
);

CREATE INDEX IF NOT EXISTS idx_resources_owner ON public.resources (owner_id);
CREATE INDEX IF NOT EXISTS idx_resources_visibility ON public.resources (visibility);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources (type);
