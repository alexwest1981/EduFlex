# 🎓 EduFlex LLP v3.6.8
*The Complete Enterprise Learning Lifecycle Platform for Modern Education & B2B*

*Developed & maintained by **Alex Weström / Fenrir Studio***  
🇸🇪 Svenska | 🇬🇧 English

![EduFlex Architecture](https://img.shields.io/badge/Architecture-Event--Driven%20Microservices-blue)
![React Version](https://img.shields.io/badge/React-19-61dafb)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6db33f)
![Compliance](https://img.shields.io/badge/Compliance-GDPR%20%7C%20ISO%2027001%20Ready-success)

EduFlex LLP är ett Enterprise-redo, molnbaserat ekosystem som ersätter den traditionella, fragmenterade skol-it-miljön (Canvas + Zoom + Moodle + Alvis). Genom en distribuerad mikrotjänstarkitektur, asynkron händelsebuss, svensk myndighetsintegration och marknadens första 100 % spårbara AI-motor, sänker EduFlex kundernas Total Cost of Ownership (TCO) drastiskt.

---

## 📖 Innehållsförteckning
- [🚀 Senaste Uppdateringarna (Changelog)](#-senaste-uppdateringarna)
- [✨ Huvudfunktioner & "Moats"](#-huvudfunktioner--unika-vallgravar)
- [🏛 Systemarkitektur](#-systemarkitektur)
- [🚀 Kom igång (Quick Start)](#-kom-igång)
- [⚙️ Åtkomst & Konfiguration](#️-åtkomst--konfiguration)
- [👤 Vem är du? (Rollspecifika guider)](#-vem-är-du-snabbguider)
- [🗺 Roadmap](#-roadmap)

---

## 🚀 Senaste Uppdateringarna 

### v3.6.8.2 (5 mar 2026) – Final Mobile Fixes (Logo, Splash, Login)
* **🔧 Critical Login Fix:** Åtgärdat ett import- och context-fel i `RoleRouter.js` som orsakade att inloggningen fastnade i en oändlig spinner. Nu finns även en timeout (15s) som föreslår omstart/logga ut vid nätverksproblem.
* **🎨 Full Visual Sync:** Uppdaterat app-namnet i nativa Android-filer (`strings.xml`, `settings.gradle`) samt ersatt logotyper i alla `mipmap`- och `splashscreen`-mappar. Appen heter nu stolt **EduFlex** överallt.
* **📦 Release APK (v1.3):** Genererat en ny, fullständigt märkt och fungerande APK.

### v3.6.8.0 (5 mar 2026) – Android Mobile App: Dashboard Fix & Release APK
* **📱 Auth Race Condition Fix:** Fixade ett kritiskt problem i `AuthContext.js` där `isLoggedIn()` inte skickade JWT-token explicit i `Authorization`-headern vid app-start. Interceptorn hann inte sätta headern i tid → `/user/me`-anropet fick 401 → `RoleRouter` fastnade i en oändlig spinner-loop → dashboarden laddade aldrig. Nu skickas token explicit, vilket garanterar att dashboarden alltid laddas korrekt.
* **📦 Android Release APK:** Byggt och verifierat en fristående Release APK (`app-release.apk`, 76.8 MB) via `scripts/build_android_release.ps1` med tvingad JDK 21 och korrekt `ANDROID_HOME`. APK:n inkluderar all JavaScript-kod inbundlad och kräver inte Metro Bundler för att köras.

### v3.6.6 (3 mar 2026) – Zero-Trust AI Pipeline & GDPR Shield
*   **GDPR**: Implementerat **Zero-Trust AI Pipeline** med granulär PII-maskering och literal namn-ersättning.
*   **GDPR**: Automatisk lokalt baserad "Zero-Trust Restore" av studentdata i AI-svar.
*   **GDPR**: Valbart "GDPR Safe" läge för finansiella och administrativa excel-exporter.

### v3.6.5 (5 mar 2026) – Stability & Microservice Hotfixes
* **🐳 Docker Networking Fix (WS):** Centralized WebSocket routing via `WS_BASE` using `window.location.origin`, allowing Vite's proxy to handle dynamic routing in Docker environments. Added `VITE_NOTIFICATIONS_URL` to support internal service discovery.
* **🗄️ Database Auto-Initialization:** Implemented `init-db.sql` triggered on Postgres startup to automatically create `eduflex_backend` and `eduflex_scorm` databases, preventing SCORM microservice crashes.
* **🤖 AI PPT Stability:** Hardened `PowerPointService.java` with robust JSON parsing, handling both array and object response formats from Gemini, ensuring reliable slide generation.
* **🔑 BankID 401 Fix:** Whitelisted the public BankID status endpoint in `SecurityConfig.java` to allow unauthenticated access to login status checks.
* **📦 License Audit:** Implemented missing audit endpoints to enable system intelligence in the Control Center.

### v3.6.4 (3 mar 2026) – AI Microservice Extraction & Ops Enhancements


### v3.5.0 (Mars 2026) – B2B Sales Enablement & Compliance
* **🔌 HR Sync API (Zero-Touch):** API-First design with `HrSyncController` för automatisk user provisioning från externa HR-system som Workday.
* **📊 Interactive TCO Calculator:** Inbyggt live-säljverktyg för att räkna ut Enterprise-kunders Return on Investment (ROI).
* **🛡️ Compliance Center:** Gränssnitt för HR/Admins för att övervaka regelefterlevnad med automatisk expiry-tracking av certifikat.
### v3.4.0 (Feb 2026) – Enterprise B2B & Global i18n
* **💼 Extended Enterprise Engine:** "Pointer"-baserad kursdistribution. Återförsäljare (Resellers) kan sälja "Seat Licenses" till andra företag med strikt Tenant-isolering (Single Source of Truth).
* **🌍 AI-Driven i18n Localization:** Automatisk flerspråkighet för 8 språk (bl.a. FR, DE, ES, AR) driven av Googles Gemini-pipeline.

---

## ✨ Huvudfunktioner & Unika Vallgravar

### 1. Svensk Hyperlokalisering (The Category Killer)
Där globala system slutar, börjar EduFlex.
* **EduCareer Portal:** Inbyggd sökportal direktkopplad mot **Arbetsförmedlingens JobTech API:er**. AI analyserar studentens kognitiva radar och matchar live mot LIA/praktikplatser.
* **CSN Rapportering Pro:** Automatiserad XML/Excel-export enligt CSN:s exakta krav, med stöd för bulkhantering och "Dagar sedan senaste inloggning".
* **Skolverket Sync 2.0:** Hämtar automatiskt kursplaner, centralt innehåll och betygskriterier via API.
* **SS 12000 Kryptografi:** Betyg låses och signeras kryptografiskt med en hash-summa i databasen för att förhindra manipulation.

### 2. Etisk & Spårbar AI (EduAI Hub)
* **AI Audit Log (Compliance Portal):** Varje enskilt AI-beslut och prompt loggas i en isolerad databastabell. Ger 100 % transparens för GDPR och AI Act, vilket är ett krav för offentlig sektor.
* **AI Resource Generator:** Skapar quiz, studiepass och inlämningar direkt från uppladdade PDF:er och videor.

### 3. Inbyggt Ekosystem & "Zero-TCO"
Inga dyra tredjepartslicenser krävs.
* **LiveKit Premium Video:** Inbyggda videomöten med bakgrundsoskärpa och chatt.
* **OnlyOffice Integration:** Kollaborativ dokumentredigering direkt i webbläsaren.
* **Exam Integrity Pro:** Kameraövervakning under tentamen som via Event Bus direkt larmar läraren om studenten byter flik eller misstänkt beteende uppstår.

---

## 🏛 Systemarkitektur

EduFlex LLP drivs av en händelsedriven (Event-Driven) mikrotjänstarkitektur, skräddarsydd för massiv skalbarhet via Kubernetes.

* **Frontend:** React 19, Vite, Tailwind CSS, PWA (Progressive Web App).
* **Orchestrator / Core Backend:** Spring Boot 3.4 (Java 21), Hibernate 6. Hanterar Multi-Tenancy (Schema-per-Tenant), RBAC och agerar API Gateway.
* **Microservices:**
  * `eduflex-scorm` (Spring Boot 3): Dedikerad till tunga I/O-operationer för SCORM, cmi5 och xAPI (LRS).
  * `eduflex-notifications` (WebFlux/Node): Asynkrona WebSockets för chatt och larm.
  * `eduflex-pdf` & `eduflex-video`: Isolerad mediebearbetning.
  * `eduflex-ai` (Python FastAPI): Dedikerad AI-motor för generativt innehåll och analys.
* **Infrastruktur:**
  * **PostgreSQL:** Huvuddatabas med isolerade scheman.
  * **Redis (Event Bus):** Hanterar Pub/Sub-händelser mellan mikrotjänster och cache.
  * **MinIO (S3):** Objektlagring för filer och media.

---

## 🚀 Kom igång

### Förutsättningar
* **Docker Desktop** (senaste versionen)
* **Git**

### Snabbstart (Lokal Miljö)
```bash
# 1. Klona projektet
git clone https://github.com/alexwest1981/EduFlex.git
cd EduFlex
```

# 2. Starta systemet (Startar Core, Redis Event Bus, MinIO, DB och Microservices)
```bash
docker compose up --build -d
```

--------------------------------------------------------------------------------
# ⚙️ Åtkomst & Konfiguration

Lokala URL:er efter uppstart:

* LMS (Frontend): http://localhost:5173
* API / Backend: http://localhost:8080/api
* Swagger API Docs: http://localhost:8080/swagger-ui.html
* MinIO Console: http://localhost:9001 (Inloggning: minioadmin / minioadmin)
* EduFlex Ops (Control Center): Nås direkt via Master Admin-inloggning i LMS.
* Kritiska Miljövariabler (.env / system properties):
* SPRING_DATASOURCE_URL – Databasanslutning (Standard: jdbc:postgresql://db:5432/eduflex)
* SPRING_REDIS_HOST – Redis Event Bus / Cache (Standard: redis)
* MINIO_URL – Intern S3 Endpoint (Standard: http://minio:9000)
* EDUFLEX_AUTH_MODE – Autentiseringsläge (Standard: internal / Alternativ: keycloak)
* GEMINI_API_KEY – Krävs för AI-funktioner & Audit Log (Din egen nyckel krävs)


--------------------------------------------------------------------------------
# 👤 Vem är du? (Snabbguider)
* 🎓 För Rektorer & Skolledare: Kolla in Principal Mission Control för realtids-KPI:er, SKA-motorn och interaktiva ROI-rapporter.
* 🍎 För Lärare & Mentorer: Se dokumentationen för EduAI Hub, CSN-rapporteringsverktyget och Exam Integrity Pro.
* 💻 För IT-drift & Investerare: Se vår Architecture Guide och Compliance Documentation för detaljer om vår Event Bus, schema-isolering och Zero-Touch HR Sync.

--------------------------------------------------------------------------------
🗺 Roadmap (Q2 - Q4 2026)
- [x] Schema-baserad Multi-Tenancy & Keycloak SSO
- [x] AI Compliance Portal & Audit Log
- [x] JobTech & CSN Integrationer
- [x] **v3.6.6: GDPR & Privacy Shield**
    - [x] Implementera granulära GDPR-datafilter (PII-maskering).
    - [x] Pseudonymisering av studentdata i AI-sessioner.
    - [x] GDPR-läge för rapportexporter.
- [x] B2B E-commerce & Reseller Engine
- [x] Event-Driven Microservices & Redis Event Bus
- [ ] Q2 2026: AI Microservice Extraction (Python/FastAPI) för framtida lokala LLM-modeller.
- [/] Q3 2026: React Native Mobile App med Offline-sync.
    - [x] Android Release APK byggd och verifierad (v1.0).
    - [x] Dashboard auth race condition fixad.
    - [ ] Offline Redux Persist verifiering.
    - [ ] Push Notifications integration.

--------------------------------------------------------------------------------
⚖ License & Contact
EduFlex LLP™ © 2026 Alex Weström / Fenrir Studio
Proprietary Software. Unauthorized copying or distribution is strictly prohibited.
För kommersiella förfrågningar och licensiering: 📧 alexwestrom81@gmail.com
Last updated: 2026-03-05 (v3.6.8.2 - Final Mobile Fixes)

