-- Register Mock LTI Platform for testing with lti_simulator.py
INSERT INTO lti_platforms (issuer, client_id, auth_url, token_url, jwks_url, deployment_id)
VALUES (
    'https://mock-lms.com', 
    'eduflex-client-id', 
    'http://localhost:9999/auth', 
    'http://localhost:9999/token', 
    'http://localhost:9999/jwks', 
    'deployment-1'
)
ON CONFLICT (issuer) DO UPDATE 
SET client_id = EXCLUDED.client_id, 
    auth_url = EXCLUDED.auth_url, 
    token_url = EXCLUDED.token_url, 
    jwks_url = EXCLUDED.jwks_url, 
    deployment_id = EXCLUDED.deployment_id;

-- Ensure we can see it
SELECT * FROM lti_platforms WHERE issuer = 'https://mock-lms.com';
