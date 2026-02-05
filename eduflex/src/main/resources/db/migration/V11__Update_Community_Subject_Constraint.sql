-- =============================================
-- Update Community Subject Constraint
-- Version: V11
-- Description: Updates the check constraint on community_items.subject
--              to include all 31 new subject categories.
-- =============================================

-- 1. Drop the existing constraint
ALTER TABLE public.community_items 
DROP CONSTRAINT IF EXISTS community_items_subject_check;

-- 2. Add the updated constraint with all current subjects
ALTER TABLE public.community_items 
ADD CONSTRAINT community_items_subject_check 
CHECK (subject::text = ANY (ARRAY[
    'MATEMATIK'::text, 
    'SVENSKA'::text, 
    'ENGELSKA'::text, 
    'FYSIK'::text, 
    'KEMI'::text, 
    'BIOLOGI'::text, 
    'HISTORIA'::text, 
    'SAMHALLSKUNSKAP'::text, 
    'GEOGRAFI'::text, 
    'RELIGIONSKUNSKAP'::text, 
    'TEKNIK'::text, 
    'PROGRAMMERING'::text, 
    'PSYKOLOGI'::text, 
    'FILOSOFI'::text, 
    'SOCIOLOGI'::text, 
    'JURIDIK'::text, 
    'PEDAGOGIK'::text, 
    'NATIONALEKONOMI'::text, 
    'FORETAGSEKONOMI'::text, 
    'ENTREPRENORSKAP'::text, 
    'WEBBUTVECKLING'::text, 
    'NATURKUNSKAP'::text, 
    'MEDICIN'::text, 
    'VARD_OMSORG'::text, 
    'IDROTT'::text, 
    'MUSIK'::text, 
    'BILD'::text, 
    'SLOJD'::text, 
    'HEM_KONSUMENTKUNSKAP'::text, 
    'MODERSMAL'::text, 
    'SPRAK_ANNAT'::text, 
    'OVRIGT'::text
]));
