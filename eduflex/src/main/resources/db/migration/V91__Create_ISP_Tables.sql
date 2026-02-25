-- Individuell Studieplan (ISP) — lagkrav för Komvux (Skollagen 20 kap. 11 §).
-- Varje vuxenstuderande måste ha en individuell studieplan som dokumenterar
-- mål, studietakt, bakgrund och uppföljning.

CREATE TABLE IF NOT EXISTS individual_study_plans (
    id                          BIGSERIAL PRIMARY KEY,
    student_id                  BIGINT NOT NULL REFERENCES app_users(id),
    counselor_id                BIGINT NOT NULL REFERENCES app_users(id),
    status                      VARCHAR(30)  NOT NULL DEFAULT 'DRAFT',
    version                     INTEGER      NOT NULL DEFAULT 1,

    -- Planens textinnehåll
    syfte                       TEXT,
    bakgrund                    TEXT,
    mal                         TEXT,
    stodbehoV                   TEXT,
    counselor_notes             TEXT,

    -- Studieupplägg
    studieform                  VARCHAR(20)  NOT NULL DEFAULT 'PLATS',
    study_pace_pct              INTEGER      NOT NULL DEFAULT 100,

    -- Tidsramar
    planned_start               DATE,
    planned_end                 DATE,

    -- Kvittering
    student_acknowledged_at     TIMESTAMP,

    created_at                  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at                  TIMESTAMP
);

-- Planerade kurser kopplade till en ISP
CREATE TABLE IF NOT EXISTS isp_planned_courses (
    id              BIGSERIAL PRIMARY KEY,
    isp_id          BIGINT       NOT NULL REFERENCES individual_study_plans(id) ON DELETE CASCADE,
    course_id       BIGINT       REFERENCES courses(id),
    course_name     VARCHAR(500) NOT NULL,
    course_code     VARCHAR(50),
    study_pace_pct  INTEGER      NOT NULL DEFAULT 100,
    planned_start   DATE,
    planned_end     DATE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'PLANNED'
);

CREATE INDEX IF NOT EXISTS idx_isp_student_id   ON individual_study_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_isp_counselor_id ON individual_study_plans(counselor_id);
CREATE INDEX IF NOT EXISTS idx_isp_status       ON individual_study_plans(status);
CREATE INDEX IF NOT EXISTS idx_isp_courses_isp  ON isp_planned_courses(isp_id);
