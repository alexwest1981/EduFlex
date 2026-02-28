-- Migration: Create User Ebook Progress Table
-- Description: Stores progress for e-books and audiobooks (EPUB, PDF, etc.)

CREATE TABLE IF NOT EXISTS public.user_ebook_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ebook_id BIGINT NOT NULL,
    last_location TEXT,
    last_page INTEGER,
    last_timestamp DOUBLE PRECISION,
    percentage DOUBLE PRECISION,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_uep_user FOREIGN KEY (user_id) REFERENCES public.app_users (id) ON DELETE CASCADE,
    CONSTRAINT fk_uep_ebook FOREIGN KEY (ebook_id) REFERENCES public.ebooks (id) ON DELETE CASCADE,
    CONSTRAINT uq_uep_user_ebook UNIQUE (user_id, ebook_id)
);

-- Index for faster lookup
CREATE INDEX IF NOT EXISTS idx_uep_user_ebook ON public.user_ebook_progress (user_id, ebook_id);
