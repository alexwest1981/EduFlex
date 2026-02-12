CREATE TABLE IF NOT EXISTS pdf_templates (
    id BIGSERIAL PRIMARY KEY,
    template_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT 'Standard',
    is_active BOOLEAN DEFAULT TRUE,

    -- Logo & background (MinIO URLs)
    logo_url VARCHAR(500),
    background_image_url VARCHAR(500),

    -- Colors (hex)
    primary_color VARCHAR(7) DEFAULT '#C5A009',
    secondary_color VARCHAR(7) DEFAULT '#1E293B',
    accent_color VARCHAR(7) DEFAULT '#000000',

    -- Texts
    title_text VARCHAR(255) DEFAULT 'K U R S I N T Y G',
    subtitle_text VARCHAR(255) DEFAULT 'BEVIS PÅ GENOMFÖRD UTBILDNING',
    intro_text VARCHAR(255) DEFAULT 'Härmed intygas att',
    body_text VARCHAR(255) DEFAULT 'Har framgångsrikt genomfört kursen',
    grade_label VARCHAR(100) DEFAULT 'GODKÄND',
    footer_text VARCHAR(500) DEFAULT '',
    signature_title VARCHAR(255) DEFAULT 'Rektor',
    school_name_override VARCHAR(255),

    -- Layout
    show_border BOOLEAN DEFAULT TRUE,
    show_corner_decorations BOOLEAN DEFAULT TRUE,
    show_qr_code BOOLEAN DEFAULT TRUE,
    qr_position VARCHAR(20) DEFAULT 'BOTTOM_RIGHT',
    orientation VARCHAR(20) DEFAULT 'LANDSCAPE',

    -- Font
    title_font_size INTEGER DEFAULT 42,
    body_font_size INTEGER DEFAULT 18,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO pdf_templates (template_type, name) VALUES ('CERTIFICATE', 'Standard Certifikat');
INSERT INTO pdf_templates (template_type, name) VALUES ('GRADE_REPORT', 'Standard Betygsrapport');
