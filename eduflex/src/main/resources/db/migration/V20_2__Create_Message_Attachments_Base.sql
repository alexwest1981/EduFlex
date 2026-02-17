-- Migration V20_2: Create base message_attachments table
-- This table was missing from the initial migration suite but is required by V999

CREATE TABLE IF NOT EXISTS public.message_attachments (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255),
    file_type VARCHAR(255),
    file_url VARCHAR(255),
    message_id BIGINT REFERENCES public.chat_messages(id) ON DELETE CASCADE
);

-- Ensure index existence
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'message_attachments' AND indexname = 'idx_message_attachment_msg_id') THEN
        CREATE INDEX idx_message_attachment_msg_id ON public.message_attachments(message_id);
    END IF;
END $$;

COMMENT ON TABLE public.message_attachments IS 'Base table for chat message attachments';
