-- Migration V20_4: Create base EduGame tables for Shop, Inventory and Profiles
-- These tables are required for the EduGame module initialization (ShopService, etc.)

-- 1. Shop Items
CREATE TABLE IF NOT EXISTS public.edugame_shop_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    image_url VARCHAR(255),
    cost INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    rarity VARCHAR(50) NOT NULL,
    is_limited BOOLEAN DEFAULT FALSE,
    unlock_criteria JSONB
);

-- 2. User Inventory
CREATE TABLE IF NOT EXISTS public.edugame_user_inventory (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES public.edugame_shop_items(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EduGame Profiles
CREATE TABLE IF NOT EXISTS public.edugame_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES public.app_users(id) ON DELETE CASCADE,
    active_frame VARCHAR(255),
    active_background VARCHAR(255),
    active_badge VARCHAR(255),
    current_title VARCHAR(255),
    forum_rank_icon VARCHAR(255),
    forum_activity_points INTEGER DEFAULT 0
);

-- Indexes for performance
DO $$
BEGIN
    -- Shop Items
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'edugame_shop_items' AND indexname = 'idx_shop_item_type') THEN
        CREATE INDEX idx_shop_item_type ON public.edugame_shop_items(type);
    END IF;

    -- User Inventory
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'edugame_user_inventory' AND indexname = 'idx_inventory_user_id') THEN
        CREATE INDEX idx_inventory_user_id ON public.edugame_user_inventory(user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'edugame_user_inventory' AND indexname = 'idx_inventory_item_id') THEN
        CREATE INDEX idx_inventory_item_id ON public.edugame_user_inventory(item_id);
    END IF;

    -- Profiles
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'edugame_profiles' AND indexname = 'idx_profile_user_id') THEN
        CREATE INDEX idx_profile_user_id ON public.edugame_profiles(user_id);
    END IF;
END $$;

COMMENT ON TABLE public.edugame_shop_items IS 'Base table for gamification shop items';
COMMENT ON TABLE public.edugame_user_inventory IS 'Tracks items purchased by users';
COMMENT ON TABLE public.edugame_profiles IS 'Gamification profiles for users';
