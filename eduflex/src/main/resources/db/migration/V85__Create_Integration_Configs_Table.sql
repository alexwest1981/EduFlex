-- Integration Configs – Gemensam tabell för alla externa integrationer
-- Varje rad representerar en konfigurerad integration (Zoom, Teams, SIS, Library etc.)
CREATE TABLE IF NOT EXISTS integration_configs (
    id BIGSERIAL PRIMARY KEY,
    integration_type VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT FALSE,
    config_json TEXT DEFAULT '{}',
    status VARCHAR(30) DEFAULT 'NOT_CONFIGURED',
    last_sync TIMESTAMP,
    last_error TEXT,
    error_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed med de 5 core-integrationerna
INSERT INTO integration_configs (integration_type, display_name, description, status) VALUES
    ('LTI', 'LTI 1.3 (AGS/NRPS)', 'Learning Tools Interoperability – koppla till Canvas, Moodle, Blackboard m.fl.', 'CONNECTED'),
    ('ZOOM', 'Zoom Meetings', 'Skapa och starta videomöten direkt från kursvyn.', 'NOT_CONFIGURED'),
    ('TEAMS', 'Microsoft Teams', 'Starta Teams-möten och synka kalender.', 'NOT_CONFIGURED'),
    ('SKOLVERKET', 'Skolverket Kursplaner', 'Hämta ämnen, kursplaner och betygskriterier från Skolverkets API.', 'CONNECTED'),
    ('SIS', 'SIS Import (CSV/Excel)', 'Importera elever och klasser via CSV- eller Excel-filer.', 'NOT_CONFIGURED'),
    ('LIBRARY', 'Bibliotekssökning', 'Sök böcker via Open Library API.', 'NOT_CONFIGURED')
ON CONFLICT (integration_type) DO NOTHING;
