-- Survey Templates
CREATE TABLE IF NOT EXISTS survey_templates (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Survey Questions
CREATE TABLE IF NOT EXISTS survey_questions (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES survey_templates(id) ON DELETE CASCADE,
    question_text VARCHAR(1000) NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    options_json TEXT,
    sort_order INT DEFAULT 0,
    is_required BOOLEAN DEFAULT true
);

-- Survey Distributions
CREATE TABLE IF NOT EXISTS survey_distributions (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT NOT NULL REFERENCES survey_templates(id),
    target_role VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    sent_by_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL,
    sent_at TIMESTAMP,
    deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Survey Responses
CREATE TABLE IF NOT EXISTS survey_responses (
    id BIGSERIAL PRIMARY KEY,
    distribution_id BIGINT NOT NULL REFERENCES survey_distributions(id) ON DELETE CASCADE,
    respondent_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(distribution_id, respondent_id)
);

-- Survey Answers
CREATE TABLE IF NOT EXISTS survey_answers (
    id BIGSERIAL PRIMARY KEY,
    response_id BIGINT NOT NULL REFERENCES survey_responses(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES survey_questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    rating_value INT,
    selected_option VARCHAR(500)
);
