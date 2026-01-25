-- =============================================
-- EduFlex Community Tables Migration
-- Version: V4
-- Description: Creates tables for the Community feature
--              (cross-tenant content sharing marketplace)
-- =============================================

-- Create community_items table in public schema for cross-tenant visibility
CREATE TABLE IF NOT EXISTS public.community_items (
    id VARCHAR(36) PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(5000),
    content_json TEXT,
    subject VARCHAR(50),
    difficulty VARCHAR(50),
    grade_level VARCHAR(50),
    download_count INT NOT NULL DEFAULT 0,
    average_rating DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    rating_count INT NOT NULL DEFAULT 0,
    author_name VARCHAR(255),
    author_tenant_id VARCHAR(100),
    author_tenant_name VARCHAR(255),
    author_user_id BIGINT,
    author_profile_picture_url VARCHAR(500),
    published_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_at TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(1000),
    metadata TEXT
);

-- Create community_item_tags table for tag collection
CREATE TABLE IF NOT EXISTS public.community_item_tags (
    community_item_id VARCHAR(36) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    CONSTRAINT fk_community_item_tags_item
        FOREIGN KEY (community_item_id)
        REFERENCES public.community_items(id)
        ON DELETE CASCADE
);

-- Create community_ratings table
CREATE TABLE IF NOT EXISTS public.community_ratings (
    id VARCHAR(36) PRIMARY KEY,
    community_item_id VARCHAR(36) NOT NULL,
    user_id BIGINT NOT NULL,
    tenant_id VARCHAR(100) NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(2000),
    reviewer_name VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uk_community_rating_user_item
        UNIQUE (community_item_id, user_id, tenant_id),
    CONSTRAINT fk_community_ratings_item
        FOREIGN KEY (community_item_id)
        REFERENCES public.community_items(id)
        ON DELETE CASCADE,
    CONSTRAINT chk_rating_range
        CHECK (rating >= 1 AND rating <= 5)
);

-- Create community_downloads table
CREATE TABLE IF NOT EXISTS public.community_downloads (
    id VARCHAR(36) PRIMARY KEY,
    community_item_id VARCHAR(36) NOT NULL,
    user_id BIGINT NOT NULL,
    tenant_id VARCHAR(100) NOT NULL,
    downloaded_at TIMESTAMP,
    local_item_id BIGINT,
    local_item_type VARCHAR(50),
    CONSTRAINT fk_community_downloads_item
        FOREIGN KEY (community_item_id)
        REFERENCES public.community_items(id)
        ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_items_status ON public.community_items(status);
CREATE INDEX IF NOT EXISTS idx_community_items_subject ON public.community_items(subject);
CREATE INDEX IF NOT EXISTS idx_community_items_content_type ON public.community_items(content_type);
CREATE INDEX IF NOT EXISTS idx_community_items_published_at ON public.community_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_items_download_count ON public.community_items(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_items_average_rating ON public.community_items(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_community_items_author ON public.community_items(author_user_id, author_tenant_id);

CREATE INDEX IF NOT EXISTS idx_community_item_tags_item ON public.community_item_tags(community_item_id);
CREATE INDEX IF NOT EXISTS idx_community_item_tags_tag ON public.community_item_tags(tag);

CREATE INDEX IF NOT EXISTS idx_community_ratings_item ON public.community_ratings(community_item_id);
CREATE INDEX IF NOT EXISTS idx_community_ratings_user ON public.community_ratings(user_id, tenant_id);

CREATE INDEX IF NOT EXISTS idx_community_downloads_item ON public.community_downloads(community_item_id);
CREATE INDEX IF NOT EXISTS idx_community_downloads_user ON public.community_downloads(user_id, tenant_id);
