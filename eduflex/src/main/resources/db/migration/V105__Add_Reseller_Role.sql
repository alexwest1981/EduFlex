INSERT INTO roles (name, description, default_dashboard, is_super_admin)
VALUES ('RESELLER', 'Säljare / Butiksansvarig med ansvar för e-handel och kursutbud', '/admin/sales', false)
ON CONFLICT (name) DO NOTHING;
