# EduFlex LMS 3.6.3 - Enterprise Learning Platform

![EduFlex Banner](assets/banner.png)

**EduFlex LMS/LLP** är en nästa generations lärplattform, byggd för att möta de specifika behoven i den svenska skolan och företagsutbildning. Med en AI-first arkitektur, strikt dataseparation (multi-tenancy) och djup integration med svenska standarder (Skolverket, SS 12000), erbjuder EduFlex en komplett infrastruktur för modern utbildning.

---

## 🌟 Vision & Kärnvärden

Vår vision är att eliminera den administrativa bördan för lärare och skolledare genom intelligent automation, samtidigt som vi ger eleverna en personlig och adaptiv lärandeupplevelse.

*   **AI-First:** Inte bara en "chatbot på sidan", utan AI integrerat i kärnan för rättning, planering och analys.
*   **Svensk Compliance:** Byggt från grunden för Skollagen, GDPR och svensk läroplan (Lgr22/Gy11).
*   **Säkerhet & Integritet:** Schema-per-Tenant arkitektur garanterar att ingen data någonsin läcker mellan skolor.
*   **Helhetslösning:** Ersätter behovet av separata system för LMS, video, lagring och incidenthantering.

---

## 🚀 Systemstatus & Versionshistorik

### **Current Release: v3.6.3.3 (4 mar 2026)**

#### 🏗️ Microservice Architecture Migration
Vi genomgår en strategisk transformation från monolit till en distribuerad mikrotjänstarkitektur för att öka skalbarhet och prestanda.

### 🚀 **v3.6.3.3** (4 mar 2026) – Microservice Migration Phase 3 & 4 (Real-time & Notifications)
*   **🔔 eduflex-notifications Microservice**: En dedikerad tjänst för all realtidskommunikation via WebSockets (STOMP). Frikopplar chatt, forum-reaktioner och systemnotiser från huvudapplikationen.
*   **📡 Redis Event Bus Architecture**: Implementerat en robust händelsebuss baserad på Redis Pub/Sub som binder samman alla mikrotjänster och möjliggör distribuerade realtidsuppdateringar.
*   **🛡️ JWT-secured WebSockets**: Säkerställt WebSocket-anslutningar med JWT-validering direkt i den nya mikroservicen.
*   **📂 Monolith Decoupling**: Refaktorerat samtliga realtidstjänster i monoliten (`Chat`, `Forum`, `LogTailer`, `Notification`, `ExamIntegrity`, `AITutor`) till att publicera händelser på den gemensamma händelsebussen istället för direktleverans till klienter.

### 🚀 **v3.6.3.2** (4 mar 2026) – Microservice Migration Phase 2 (Integration & Callbacks)
*   **🔌 Frontend Proxy Integration**: Sömlös anslutning av frontenden till den nya SCORM-mikroservicen via Vite-proxy, vilket möjliggör transparent migration av SCORM, CMI5 och LRS-trafik (port 8084).
*   **📡 Internal Callback System**: Implementerat `InternalProgressController` i monoliten för att ta emot säkra framstegsuppdateringar i realtid från mikroservicen.
*   **🛡️ Multi-Service Security**: Konfigurerat `SecurityConfig` för att tillåta interna tjänsteanrop, vilket säkrar kommunikationen mellan mikrotjänsterna och monolit-backenden.

### 🚀 **v3.6.3.1** (4 mar 2026) – Microservice Migration Phase 1 (SCORM & xAPI)
*   **🏗️ eduflex-scorm Microservice**: Initierat en ny, högpresterande Spring Boot 3-mikrotjänst för hantering av SCORM och xAPI.
*   **🔌 Decoupled Architecture**: Frikopplat SCORM- och xAPI-data från monolitens huvuddatabas till ett eget isolerat schema för att radikalt minska trycket på centrala PostgreSQL-anslutningar.
*   **📡 xAPI LRS API**: Fullständigt stöd för statements, state och agent profiles via den nya tjänsten.

### 🕒 Senaste uppdateringarna (2026-03-04)
- **Phase 4 Completion**: `eduflex-notifications` mikrotjänst driftsatt. Hela monoliten refaktorerad för Redis Pub/Sub (Event Bus).
- **Phase 2 Completion**: Full integration av `eduflex-scorm` med monoliten och frontend (WSL Native support).
- **Internal Callbacks**: Realtidsöverföring av xAPI-statements från mikroservice till monolit för poäng- och certifikatuppdateringar.
- **Security Patch**: Öppnat `/api/internal/**` för säkra interna anrop i monolit-backenden.

---

## 🛠️ Teknisk Arkitektur

EduFlex är byggt på en modern, robust stack designad för hög prestanda och säkerhet.

### Backend (Core Monolith + Microservices)
*   **Språk:** Java 21 (LTS)
*   **Ramverk:** Spring Boot 3.2.3
*   **Databas:** PostgreSQL 15 (med PGVector för AI), H2 (Dev)
*   **Säkerhet:** Spring Security 6, OAuth2/OIDC, Stateless JWT
*   **Caching:** Redis (Sessioner, API-cache, Pub/Sub)
*   **Messaging:** Apache Kafka (Audit logs, tunga jobb) & Redis Pub/Sub (Realtid)
*   **Storage:** MinIO (S3-kompatibel objektlagring)

### Frontend (Client)
*   **Ramverk:** React 18.2
*   **Byggverktyg:** Vite
*   **Styling:** Tailwind CSS
*   **State:** React Context API + Custom Hooks
*   **PWA:** Fullt stöd för offline-läge och installation.

### AI & Machine Learning
*   **LLM:** Google Gemini Pro 1.5 (via REST)
*   **RAG:** Retrieval-Augmented Generation med PGVector för kontextmedveten AI.
*   **Funktioner:**
    *   *Magic Quiz:* Generera prov från PDF/Text.
    *   *AI Tutor:* Personlig studiehjälp 24/7.
    *   *Auto-Correct:* AI-stöd vid rättning av inlämningar.

### Multi-Tenancy
EduFlex använder en **Schema-per-Tenant**-arkitektur för maximal dataseparation och säkerhet. Varje skola/organisation får ett eget databasschema, vilket garanterar att data aldrig blandas.

---

## 🗺️ Roadmap 2026+

Vi siktar mot att bli marknadsledande genom djupare personalisering och automatisering.

### 1. Äkta Adaptivitet (AI-driven differentiering)
*   **Personliga lärvägar:** Systemet justerar automatiskt innehåll och svårighetsgrad.
*   **Prediktiv riskmodell:** AI-analys för att identifiera elever i riskzonen innan de misslyckas.
*   **Adaptiva prov:** Frågor anpassas i realtid efter elevens nivå.

### 2. Specialiserade AI-Coacher
*   **Rektor-assistent:** Analyserar dashboards och föreslår prioriteringar.
*   **Mentor-coach:** Genererar underlag för utvecklingssamtal och föräldrakontakt.
*   **Elevhälsa-coach:** Identifierar mönster i välmående (stress, frånvaro).
*   **Elev-coach:** Personlig studiecoach och chatbot.

### 3. Systematiskt Kvalitetsarbete (SKA)
*   **Inbyggd SKA-motor:** Koppla mål till faktiska data (betyg, närvaro).
*   **Årscykel-vy:** Visuell tidslinje för läsåret med checkpoints.
*   **Automatgenererade rapporter:** PDF/Word-rapporter med ett klick.

### 4. Integrerad Elevhälsa (EHT)
*   **Fullskalig EHT-motor:** Bokning, journaler och ärendehantering (SS 12000).
*   **Elevens Välmående-yta:** Anonyma pulsmätningar och check-ins.
*   **Sekretess:** Granulär behörighetsstyrning och "need-to-know" access.

### 5. Engagement Layer & Gamification
*   **Systemnivå-Gamification:** Missions på skolnivå (t.ex. "Nå 95% närvaro").
*   **Socialt Lärande:** Säkra forum och peer-review.
*   **Engagement Insights:** Koppla engagemang till studieresultat.

### 6. Vårdnadshavarupplevelse 2.0
*   **Guidade Lägesrapporter:** Veckovisa sammanfattningar till hemmet.
*   **Smart Filter:** "Action Center" för det som kräver åtgärd (signering, frånvaro).
*   **Interaktiv Onboarding:** Guidad tur för nya användare.

### 7. Integrationer & API-strategi
*   **Öppna API:er:** För integration med externa system (t.ex. Prorenata, Skola24).
*   **Data Export & BI:** Standardiserad dataexport till PowerBI/Tableau.

### 8. AI Transparens & Fairness
*   **Förklaringslager (XAI):** "Varför?"-förklaringar för alla AI-rekommendationer.
*   **Bias-kontroll:** Dashboard för att övervaka och motverka AI-bias.

---

## 📂 Dokumentation & Due Diligence

För investerare och teknisk granskning finns ett komplett dokumentationspaket i mappen `Komplett Dokumentationspaket` (kräver behörighet).

*   **Affärsdokument:** Executive Summary, Replacement Cost Analysis, Revenue Forecast.
*   **Teknisk Arkitektur:** Technical Appendix, Security Architecture, SLA & Disaster Recovery.
*   **Compliance & Juridik:** Compliance Statement (GDPR, Skollagen), Data Isolation Overview, Svensk Skolanpassning.

---

## 📦 Installation & Utveckling

### Förutsättningar
*   **OS:** Windows med WSL 2 (Ubuntu 22.04+)
*   **Container:** Docker (installerat i WSL)
*   **Java:** JDK 21
*   **Node:** Node.js 20+

### Starta Backend (Lokalt)
Använd våra PowerShell-wrappers för att köra i WSL-kontext:
```bash
./scripts/powershell/run_backend_local.ps1
```

### Starta Frontend
```bash
cd frontend
npm install
npm run dev
```

### Databas & Migreringar
Systemet använder Flyway för databasmigreringar. Vid uppstart körs `GlobalMigrationRunner` som automatiskt uppdaterar både det publika schemat och alla tenants scheman.

---

## 📄 Licens & Copyright
EduFlex är en proprietär programvara utvecklad av EduFlex AB.
Copyright © 2024-2026 EduFlex AB. Alla rättigheter förbehållna.
Otillåten kopiering, distribution eller modifiering är förbjuden.
