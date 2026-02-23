-- Skapar en tabell för admin-hanterade support-artiklar (FAQ och videoguider)
-- Helt separat tabell, påverkar inget befintligt.
CREATE TABLE IF NOT EXISTS support_articles (
    id           BIGSERIAL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    content      TEXT,
    category     VARCHAR(100),
    type         VARCHAR(20)  NOT NULL DEFAULT 'FAQ',
    video_url    VARCHAR(500),
    duration     VARCHAR(20),
    thumbnail    VARCHAR(100),
    display_order INT         DEFAULT 0,
    is_published  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMP    DEFAULT NOW(),
    updated_at   TIMESTAMP    DEFAULT NOW()
);
