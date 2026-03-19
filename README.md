# 🎓 EduFlex LLP v3.9.6
*Den kompletta Learning Lifecycle-plattformen för modern utbildning och B2B*

*Utvecklas & underhålls av **Alex Weström / Fenrir Studio***  
🇸🇪 Svenska | 🇬🇧 English | 🇫🇷 Français | 🇩🇪 Deutsch | 🇫🇮 Suomi | 🇳🇴 Norsk | 🇩🇰 Dansk | 🇪🇸 Español | 🇸🇦 العربية

![EduFlex Architecture](https://img.shields.io/badge/Architecture-Kubernetes%20%7C%20Helm-blue)
![React Version](https://img.shields.io/badge/React-19-61dafb)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6db33f)
![Compliance](https://img.shields.io/badge/Compliance-GDPR%20%7C%20ISO%2027001%20Ready-success)

EduFlex LLP är ett enterprise-redo, molnbaserat ekosystem som ersätter traditionella, fragmenterade skol-it-miljöer (Canvas + Zoom + Moodle + Alvis). Genom en distribuerad mikrotjänstarkitektur, asynkron händelsebuss, svensk myndighetsintegration och marknadens första 100 % spårbara AI-motor, sänker EduFlex kundernas Total Cost of Ownership (TCO) drastiskt.

---

## 🚀 Senaste Nytt & Roadmap

För en fullständig historik och detaljerad väg framåt, se våra separata dokument:

*   📜 **[Fullständig Changelog](./CHANGELOG.md)** – Se alla detaljer för v3.9.4 och tidigare versioner.
*   🗺️ **[Projekt Roadmap](./ROADMAP.md)** – Visionen för 2026 och kommande mikrotjänster.

### v3.9.6 (19 mar 2026) – EduCareer: Unified Career & LIA Portal
- **🎯 EduCareer Portal**: Samlad karriär- och LIA-portal med tabbar: **EduJob** (AI-matchning mot Arbetsförmedlingen) och **LIA & Praktik** (praktiksökportal med geolocation-filter).
- **🔧 Backend Fixes**: Åtgärdade bygfel i `CourseService.java` (saknade imports + konstruktor) och `JobTechController.java`.
- **✨ Diagnostics**: Amber-varningsbadge i Match-modal när AI skill-extraktionen misslyckas.

### v3.9.5 (19 mar 2026) – JobEd Connect Hub Phase 2 & 3
- **🤖 AI Skill Mapper**: Automatisk extraktion av jobbkrav via Gemini + matchning mot studentens kompetensprofil.
- **📚 Personalized Learning Paths**: Kursrekommendationer baserade på identifierade kompetensglapp.
- **🌍 Full Localization**: Alla karriärfunktioner är fullständigt på svenska och engelska.

---

## ✨ Huvudfunktioner & Fördelar

### 1. Svensk Hyperlokalisering & Global Skalbarhet
- **EduCareer & JobEd Connect**: Inbyggd sökportal direktkopplad mot **Arbetsförmedlingens JobTech-API:er**.
- **CSN Rapportering Pro**: Automatiserad och exakt export enligt CSN:s krav.
- **Full Multi-Language (9+ språk)**: Hela systemet, från landningssida till djupt inbäddade lärarverktyg, är nu 100% lokaliserat.

### 2. Etisk & Spårbar AI (EduAI Hub)
- **AI Audit Log**: Full transparens för alla AI-beslut och prompter (GDPR/AI Act-kompatibel).
- **AI Resource Generator**: Skapar quiz och studiematerial direkt från PDF och video.

### 3. Integrerat Ekosystem
- **LiveKit Premium Video**: Inbyggda videomöten i hög kvalitet.
- **OnlyOffice Integration**: Kollaborativ dokumentredigering direkt i plattformen.

### 4. Enterprise Compliance & Automation (ERP+)
- **LIA Compliance Radar**: Automatisk 8-veckorsvarning för MYH-regelverket.
- **CSN Autopilot & "Ghosting Radar"**: Agerar på dolda avhopp och skickar händelsekoder (99/41/81) per automatik.
- **Protected Identity / Skyddad Id**: Fullständigt automatiserat integritetsskydd över databas (GCM-krypterat) och klient (UI maskering).
- **Read Audit Logs**: Granulär övervakning av all personuppgiftsbehandling enligt offentliga säkerhetskrav.

---

## 🏛 Systemarkitektur
EduFlex LLP drivs av en händelsedriven mikrotjänstarkitektur.
- **Frontend**: React 19, Vite, Tailwind CSS, i18next Localization.
- **Core Backend**: Spring Boot 3.4 (Java 21), Spring Security i18n, Hibernate 6.
- **Mikrotjänster**: SCORM, Notifications, PDF, Video, AI (FastAPI).

---

## 🚀 Kom igång (Snabbstart)

### Windows (Local-First / No Docker Bloat)
Dubbelklicka på **`scripts\powershell\LocalFix_Start.ps1`**. Detta startar din lokala PostgreSQL 18, Redis och kör backend/frontend lokalt.

### Windows (Full Stack / Docker)
Dubbelklicka på **`Start-EduFlex.bat`** i rotkatalogen. Det startar infrastrukturen i Docker (WSL).

### Linux / WSL
Kör följande kommando:
```bash
./start.sh
```

---

⚖ **Licens & Kontakt**  
EduFlex LLP™ © 2026 Alex Weström / Fenrir Studio  
Senast uppdaterad: 2026-03-19 (v3.9.4)

