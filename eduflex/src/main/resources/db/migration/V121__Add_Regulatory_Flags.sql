-- Lägg till regulatoriska flaggor för Enterprise Roadmap
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS is_uppdragsutbildning BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_fardighetstraning BOOLEAN DEFAULT FALSE NOT NULL;
