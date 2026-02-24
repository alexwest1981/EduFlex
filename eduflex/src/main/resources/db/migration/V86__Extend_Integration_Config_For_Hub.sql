-- V86: Extend the V71 integration_config table to support Integration Hub Pro
-- Adds missing columns that the new IntegrationConfig entity expects,
-- then seeds the 6 core integrations. The old integration_configs table
-- (created by V85) is dropped as the new entity uses integration_config instead.

ALTER TABLE integration_config ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE integration_config ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE integration_config ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'NOT_CONFIGURED';
ALTER TABLE integration_config ADD COLUMN IF NOT EXISTS last_sync TIMESTAMP;
ALTER TABLE integration_config ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE integration_config ADD COLUMN IF NOT EXISTS error_count INT DEFAULT 0;

-- Seed de 6 core-integrationerna
INSERT INTO integration_config (id, platform, display_name, description, is_active, status) VALUES
    (gen_random_uuid(), 'LTI',       'LTI 1.3 (AGS/NRPS)',       'Learning Tools Interoperability – koppla till Canvas, Moodle, Blackboard m.fl.', true,  'CONNECTED'),
    (gen_random_uuid(), 'ZOOM',      'Zoom Meetings',              'Skapa och starta videomöten direkt från kursvyn.',                                false, 'NOT_CONFIGURED'),
    (gen_random_uuid(), 'TEAMS',     'Microsoft Teams',            'Starta Teams-möten och synka kalender.',                                          false, 'NOT_CONFIGURED'),
    (gen_random_uuid(), 'SKOLVERKET','Skolverket Kursplaner',      'Hämta ämnen, kursplaner och betygskriterier från Skolverkets API.',               true,  'CONNECTED'),
    (gen_random_uuid(), 'SIS',       'SIS Import (CSV/Excel)',     'Importera elever och klasser via CSV- eller Excel-filer.',                        false, 'NOT_CONFIGURED'),
    (gen_random_uuid(), 'LIBRARY',   'Bibliotekssökning',          'Sök böcker via Open Library API.',                                                false, 'NOT_CONFIGURED')
ON CONFLICT (platform) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description  = EXCLUDED.description;

-- Drop the old integration_configs table (created by V85) – superseded by integration_config
DROP TABLE IF EXISTS integration_configs;
