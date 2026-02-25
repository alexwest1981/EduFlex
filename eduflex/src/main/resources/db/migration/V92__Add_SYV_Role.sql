-- Studie- och yrkesvägledare (SYV) — ny roll för att hantera individuella studieplaner (ISP).
INSERT INTO roles (name, description, default_dashboard, is_super_admin)
VALUES ('SYV', 'Studie- och yrkesvägledare', 'SYV', false)
ON CONFLICT (name) DO NOTHING;
