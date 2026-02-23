-- V78__Add_Notification_Preferences.sql
DROP TABLE IF EXISTS notification_preferences;
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- CHAT, MESSAGE, CALENDAR, FEEDBACK
    channel VARCHAR(50) NOT NULL,  -- MAIL, SMS, PUSH
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, category, channel)
);

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
