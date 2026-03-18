CREATE TABLE IF NOT EXISTS languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    is_enabled BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    flag_icon VARCHAR(50)
);

-- Insert initial supported languages if they don't exist
INSERT INTO languages (code, name, native_name, is_enabled, is_default)
VALUES
('sv', 'Swedish', 'Svenska', true, true),
('en', 'English', 'English', true, false),
('fr', 'French', 'Français', true, false),
('de', 'German', 'Deutsch', true, false),
('es', 'Spanish', 'Español', true, false),
('ar', 'Arabic', 'العربية', true, false),
('no', 'Norwegian', 'Norsk', true, false),
('da', 'Danish', 'Dansk', true, false),
('fi', 'Finnish', 'Suomi', true, false)
ON CONFLICT (code) DO NOTHING;
