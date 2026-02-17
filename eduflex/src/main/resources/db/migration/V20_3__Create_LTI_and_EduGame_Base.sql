-- Migration V20_3: Create base LTI and EduGame tables
-- These tables were missing from the initial migration suite but are required for application bootstrap

-- LTI Keys
CREATE TABLE IF NOT EXISTS public.lti_keys (
    id BIGSERIAL PRIMARY KEY,
    key_id VARCHAR(255) NOT NULL UNIQUE,
    private_key TEXT NOT NULL,
    public_key TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- EduGame Quest Templates
CREATE TABLE IF NOT EXISTS public.edugame_quest_templates (
    id BIGSERIAL PRIMARY KEY,
    title_template VARCHAR(255) NOT NULL,
    description_template TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    hidden_target_count_min INTEGER NOT NULL,
    hidden_target_count_max INTEGER NOT NULL,
    base_reward_xp INTEGER NOT NULL,
    action_key VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL
);

-- Ensure indexes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'lti_keys' AND indexname = 'idx_lti_key_id') THEN
        CREATE INDEX idx_lti_key_id ON public.lti_keys(key_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'edugame_quest_templates' AND indexname = 'idx_quest_template_type') THEN
        CREATE INDEX idx_quest_template_type ON public.edugame_quest_templates(type);
    END IF;
END $$;

COMMENT ON TABLE public.lti_keys IS 'Storage for LTI 1.3 key pairs';
COMMENT ON TABLE public.edugame_quest_templates IS 'Templates for automated quest generation in the EduGame system';
