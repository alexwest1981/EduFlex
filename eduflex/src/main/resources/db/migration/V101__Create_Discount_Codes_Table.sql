-- V101: Create Discount Codes Table
CREATE TABLE discount_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    discount_percent DOUBLE PRECISION NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    max_uses INTEGER NOT NULL,
    current_uses INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    tenant_id BIGINT
);
