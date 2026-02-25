-- Lägg till fält för Validering/Tillgodoräknande i ISP
ALTER TABLE individual_study_plans ADD COLUMN IF NOT EXISTS validering TEXT;
