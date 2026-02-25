-- Arkivtabell för genererade rapporter.
-- JSON-rapporter sparar fullständig data; XML/Excel sparar bara metadata.
CREATE TABLE IF NOT EXISTS generated_reports (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(500)  NOT NULL,
    report_type   VARCHAR(50)   NOT NULL,
    format        VARCHAR(20)   NOT NULL,
    education_type VARCHAR(20),
    period_start  VARCHAR(50),
    period_end    VARCHAR(50),
    row_count     INTEGER       NOT NULL DEFAULT 0,
    generated_by  VARCHAR(255),
    created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),
    data_json     TEXT
);

CREATE INDEX IF NOT EXISTS idx_generated_reports_created_at
    ON generated_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_reports_report_type
    ON generated_reports (report_type);
