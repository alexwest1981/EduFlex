CREATE TABLE integration_config (
    id UUID PRIMARY KEY,
    platform VARCHAR(50) NOT NULL UNIQUE,
    webhook_url VARCHAR(1024),
    is_active BOOLEAN DEFAULT false,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE integration_log (
    id UUID PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    direction VARCHAR(20) NOT NULL,
    event_type VARCHAR(100),
    payload JSONB,
    status VARCHAR(50),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_integration_log_platform ON integration_log(platform);
CREATE INDEX idx_integration_log_created_at ON integration_log(created_at);
