-- V87: Remove orphan integration_config rows that were not seeded by V86.
-- These rows have NULL display_name because ON CONFLICT (platform) DO UPDATE
-- in V86 only touched the 6 known platforms (LTI, ZOOM, TEAMS, SKOLVERKET, SIS, LIBRARY).
-- Any pre-existing row with an unknown platform value was left with display_name = NULL.
DELETE FROM integration_config
WHERE display_name IS NULL;
