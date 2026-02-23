CREATE TABLE IF NOT EXISTS gamification_league_settings (
    id BIGSERIAL PRIMARY KEY,
    league_key VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    min_points INTEGER NOT NULL,
    icon VARCHAR(10),
    reward_description TEXT,
    color_hex VARCHAR(20)
);

-- Seed defaults (matching League.java enum)
INSERT INTO gamification_league_settings (league_key, display_name, min_points, icon, color_hex)
VALUES 
('BRONZE', 'Bronsligan', 0, '🥉', '#CD7F32'),
('SILVER', 'Silverligan', 501, '🥈', '#C0C0C0'),
('GOLD', 'Guldligan', 1501, '🥇', '#FFD700'),
('PLATINUM', 'Platinaligan', 3001, '💎', '#E5E4E2'),
('RUBY', 'Rubinligan', 6001, '🔥', '#E0115F')
ON CONFLICT (league_key) DO NOTHING;

-- Add XP multipliers to gamification_config if not already flexible
-- (Assuming we use existing SystemSettings for this, but could be added here if needed)
