TRUNCATE TABLE public.system_modules;

INSERT INTO public.system_modules (module_key, name, description, is_active, requires_license) VALUES 
('DARK_MODE', 'Dark Mode Core', 'Globalt mörkt tema för hela plattformen.', true, false),
('SUBMISSIONS', 'Inlämningar', 'Hantera inlämningsuppgifter och bedömning.', true, false),
('CHAT', 'EduChat Pro', 'Realtidskommunikation via WebSockets.', true, true),
('FORUM', 'Forum (Community)', 'Gemensam diskussionsforum med trådar och inlägg.', true, true),
('QUIZ_BASIC', 'QuizRunner Basic', 'Skapa och genomför egna quiz (Manuellt).', true, false),
('QUIZ_PRO', 'QuizRunner Pro', 'Avancerad quizhantering med frågebank och AI-generering.', true, true),
('GAMIFICATION', 'Gamification Engine', 'Belöningssystem: Badges, Achievements, Leaderboards.', true, true),
('ANALYTICS', 'Analytics Dashboard', 'Systemanalys & datavisualisering.', true, true),
('ENTERPRISE_WHITELABEL', 'Enterprise Whitelabel', 'Fullt anpassningsbar branding: logotyp, färgtema, favicon och mer. Endast för ENTERPRISE-licens.', true, true),
('SCORM', 'SCORM / xAPI Integration', 'Importera och kör interaktiva kurspaket (SCORM 1.2).', true, true),
('REVENUE', 'Revenue Management', 'Prenumerationer, betalningar och fakturering.', true, true)
ON CONFLICT (module_key) DO NOTHING;
