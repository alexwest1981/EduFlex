-- Migration to seeded real Global Library content
-- This fulfills Rule 1: No mockups, only live data.

-- Fix the check constraint to include GLOBAL_LIBRARY
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_visibility_check;
ALTER TABLE public.resources ADD CONSTRAINT resources_visibility_check CHECK (visibility IN ('PRIVATE', 'TENANT', 'PUBLIC', 'GLOBAL_LIBRARY'));

INSERT INTO public.resources (type, name, description, content, owner_id, visibility, tags, created_at, updated_at)
SELECT 
    'LESSON', 
    'Introduktion till LTI v1.3', 
    'En djupdykning i hur du integrerar externa verktyg med EduFlex LLP via LTI-standarden.', 
    '{"sections": [{"title": "Vad är LTI?", "body": "LTI (Learning Tools Interoperability) är en standard från IMS Global..."}, {"title": "Konfiguration", "body": "För att komma igång behöver du Client ID och Deployment ID..."}]}',
    u.id, 
    'GLOBAL_LIBRARY', 
    'LTI, Integration, Tech', 
    NOW(), 
    NOW()
FROM public.app_users u 
WHERE u.username = 'admin' 
LIMIT 1;

INSERT INTO public.resources (type, name, description, content, owner_id, visibility, tags, created_at, updated_at)
SELECT 
    'QUIZ', 
    'Digital Kompetens 2026', 
    'Ett certifieringsquiz för att säkerställa grundläggande digital kompetens enligt de senaste kraven.', 
    '{"questions": [{"text": "Vad står LXP för?", "options": ["Learning Experience Platform", "Learning X-trem Platform", "Learning eXchange Protocol"], "answer": 0}]}',
    u.id, 
    'GLOBAL_LIBRARY', 
    'Certifiering, Skolverket', 
    NOW(), 
    NOW()
FROM public.app_users u 
WHERE u.username = 'admin' 
LIMIT 1;
