-- V88: Lägg till BankID i Integration Hub
INSERT INTO integration_config (id, platform, display_name, description, is_active, status)
VALUES (
    gen_random_uuid(),
    'BANKID',
    'BankID (OIDC)',
    'Hantera BankID via OIDC Broker (t.ex. GrandID eller Criipto). Konfigurera för Live eller Sandbox.',
    false,
    'NOT_CONFIGURED'
) ON CONFLICT (platform) DO UPDATE SET
    description = EXCLUDED.description;
