# EduFlex 2.0 — Frontend

Modern React-baserad frontend for EduFlex LMS, ett intelligent Learning Management System byggt for svenska skolor och organisationer.

## Tech Stack

- **React 19** med Vite 5
- **Tailwind CSS** for styling (dark mode-stod)
- **React Router 6** for navigering
- **i18next** for flersprakighet (SV/EN)
- **Lucide React** for ikoner
- **Recharts** for diagramvisualisering

## Projektstruktur

```
src/
├── assets/             # Bilder, screenshots, logotyper
├── components/         # Delade komponenter (modaler, layout, avatarer)
├── context/            # React Context (Auth, Theme, Module, Gamification)
├── features/
│   ├── admin/          # Admin-verktyg (PDF-editor, prenumerationer, fakturor)
│   ├── ai/             # AI Tutor & Copilot
│   ├── courses/        # Kurshantering & AI Course Creator
│   ├── dashboard/      # Rollbaserade dashboards (Admin, Larare, Elev, Rektor, Mentor)
│   ├── ebook/          # E-boksbibliotek med EPUB/PDF-lasare
│   ├── gamification/   # XP, Levels, Shop, Badges, Streaks
│   ├── health/         # Elevhalsa (enkater, sjukanmalan)
│   ├── landing/        # Publik landningssida
│   ├── lti/            # LTI 1.3 launch-hantering
│   ├── marketplace/    # Community Hub & Resursbank
│   ├── principal/      # Rektorspaket (Mission Control, Skolstruktur)
│   ├── social/         # Socialt larande (kommentarer, diskussioner)
│   └── system/         # Systemloggar, Debug Terminal
├── hooks/              # Custom React hooks
├── services/           # API-klient (axios) med interceptors
└── i18n/               # Oversattningsfiler (sv.json, en.json)
```

## Nyckelfunktioner

### Rollbaserade Dashboards
- **Admin**: Anvandare, kurser, roller, skolstruktur, PDF-mallar, systemloggar
- **Larare**: Kurshantering, narvarosparning, betygssattning, AI-verktyg
- **Elev**: Kursvy, gamification, e-bocker, AI Tutor
- **Rektor**: Mission Control med 8 realtids-KPI:er, incidenthantering
- **Mentor**: Mentorselever, elevhalsa, sjukanmalan

### AI-funktioner
- AI Course Creator (genererar kurser fran PDF)
- AI Quiz Generator (skapar quiz fran fragebanker)
- AI Tutor & Copilot (RAG-baserad chattbot)
- Prediktiv analys (identifiera riskstudenter)

### Gamification
- XP-system med nivaladder
- Shop for profilteman och items
- Streaks och dagliga utmaningar
- Badges och achievements

### Elevhalsa
- Dynamiskt enkatsystem med 4 fragetyper
- Sjukanmalan med mentorsnotifiering
- Statistikaggregering och uppfoljning

### PDF Whitelabeling
- Visuell editor for certifikat- och betygsmallar
- Logotyp- och bakgrundsbildsuppladdning
- Farg-, text- och layoutkonfiguration
- Live CSS-forhandsvisning

### Integrationer
- LTI 1.3 Advantage (Canvas, Moodle, Blackboard)
- xAPI & cmi5 (Learning Record Store)
- Skolverket API (kursdata, betygskriterier)
- Keycloak SSO (OAuth2/OIDC)

## Utveckling

```bash
# Installera beroenden
npm install

# Starta utvecklingsserver
npm run dev

# Bygg for produktion
npm run build
```

## Miljovariabler

Skapa `.env` i frontend-roten:

```env
VITE_API_URL=http://localhost:8080
```

## Koppling till Backend

Frontend kommunicerar med Spring Boot-backend via REST API. Alla anrop gar genom `src/services/api.js` som hanterar:
- JWT-autentisering (Bearer tokens)
- Automatisk token-refresh
- Tenant-header (`X-Tenant-ID`)
- Felhantering med interceptors
