-- Add quiz_id column to calendar_events table
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS quiz_id BIGINT;
