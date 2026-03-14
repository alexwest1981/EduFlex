-- Migration: Create Ebook Tables
-- Description: Creates the missing ebooks and ebook_courses tables referenced by later migrations

CREATE TABLE IF NOT EXISTS public.ebooks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    cover_url VARCHAR(500),
    category VARCHAR(100),
    language VARCHAR(50),
    isbn VARCHAR(50),
    type VARCHAR(50) DEFAULT 'EPUB',
    tts_folder_url VARCHAR(500),
    upload_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.ebook_courses (
    ebook_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    PRIMARY KEY (ebook_id, course_id),
    CONSTRAINT fk_ec_ebook FOREIGN KEY (ebook_id) REFERENCES public.ebooks (id) ON DELETE CASCADE,
    CONSTRAINT fk_ec_course FOREIGN KEY (course_id) REFERENCES public.courses (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ebooks_category ON public.ebooks (category);
CREATE INDEX IF NOT EXISTS idx_ebooks_author ON public.ebooks (author);
