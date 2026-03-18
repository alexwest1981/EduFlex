-- CSN-rapporteringsinställningar för kommunikation med Centrala studiestödsnämnden.
-- Dessa värden används vid generering av XML-rapportfiler för CSN.
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES
    ('csn.school.code',            '',        'CSN skolkod (4-5 siffror, tilldelas av CSN).'),
    ('csn.municipality.code',      '',        'Kommunkod (4 siffror, t.ex. 1280 för Malmö). Krävs för Komvux.'),
    ('csn.default.education.type', 'KOMVUX',  'Standard utbildningstyp för CSN-export: KOMVUX, YH eller HOGSKOLA.'),
    ('csn.default.study.scope',    '100',     'Standard studieomfattning i % (25, 50, 75 eller 100). Används för Komvux.')
ON CONFLICT (setting_key) DO NOTHING;
