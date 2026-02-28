-- Migration: Create User Saved Ebooks Table
-- Description: Tracks books saved/bookmarked by users

CREATE TABLE IF NOT EXISTS public.user_saved_ebooks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ebook_id BIGINT NOT NULL,
    saved_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_use_user FOREIGN KEY (user_id) REFERENCES public.app_users (id) ON DELETE CASCADE,
    CONSTRAINT fk_use_ebook FOREIGN KEY (ebook_id) REFERENCES public.ebooks (id) ON DELETE CASCADE,
    CONSTRAINT uq_use_user_ebook UNIQUE (user_id, ebook_id)
);

CREATE INDEX IF NOT EXISTS idx_use_user ON public.user_saved_ebooks (user_id);
