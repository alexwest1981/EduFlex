<p align="center">
  <img src="docs/Logo_top.png" width="600" alt="EduFlex Logo" />
</p>

<h1 align="center">🎓 EduFlex LMS 2.0</h1>

<p align="center">
  <em>The Complete Enterprise Learning Platform for Modern Education</em><br/>
  <em>Developed & maintained by <strong>Alex Weström / Fenrir Studio</strong></em>
</p>

<p align="center">
  <a href="#-svenska">🇸🇪 Svenska</a> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; <a href="#-english">🇬🇧 English</a>
</p>

---

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-3.4-brightgreen?style=for-the-badge&logo=springboot"/>
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-Containerized-blue?style=for-the-badge&logo=docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Kubernetes-Helm-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white"/>
  <img src="https://img.shields.io/badge/Multi--Tenant-SaaS-purple?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/MinIO-S3%20Storage-c72c48?style=for-the-badge&logo=minio&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-Cache-red?style=for-the-badge&logo=redis&logoColor=white"/>
  <img src="https://img.shields.io/badge/Keycloak-SSO-4d4d4d?style=for-the-badge&logo=keycloak&logoColor=white"/>
  <img src="https://img.shields.io/badge/Gemini-AI%20Quiz-8E75B2?style=for-the-badge&logo=google&logoColor=white"/>
  <img src="https://img.shields.io/github/actions/workflow/status/alexwest1981/EduFlex/ci.yml?style=for-the-badge&logo=github&label=CI%20Build"/>
  <img src="https://img.shields.io/badge/EPUB-Reader-orange?style=for-the-badge&logo=book&logoColor=white"/>
  <img src="https://img.shields.io/badge/License-Proprietary-orange?style=for-the-badge"/>
</p>

---

<div id="-svenska"></div>

## 🇸🇪 Svenska

### ⚡ Senaste Uppdateringarna
*   **✅ Gamification 2.0 & Shop (8 feb 2026):**
    *   **EduGame Shop:** Lanserat en komplett butik där studenter kan köpa profilramar, bakgrunder och titlar för sina intjänade poäng.
    *   **Inventory & Utrustning:** Nytt gränssnitt för att hantera och utrusta köpta föremål.
    *   **Sociala Streaks:** Nytt system för att spåra daglig aktivitet med visuella eld-indikatorer.
    *   **Admin Tools:** Fullständigt gränssnitt för att skapa och hantera butiksföremål samt ladda upp assets.
*   **📚 E-boksförbättringar (8 feb 2026):**
    *   **Auto-Cover Extraction:** Systemet extraherar nu automatiskt omslagsbilder från uppladdade PDF:er och EPUB-filer.
    *   **Smart Metadata:** Förbättrad parsing av EPUB-metadata för att hitta titlar och författare.
    *   **Storage Fix:** Löste kritiska problem med fillagring ("split-brain") genom att tvinga backend att använda korrekt MinIO-bucket.
*   **✅ LTI 1.3 Advantage Verifiering & Systemhärdning (7 feb 2026):**
    *   **E2E Verifiering:** Fullt genomförd simulering av LTI 1.3 Advantage (AGS & NRPS) med automatisk användarprovisionering och kursinskrivning.
    *   **Fix: Circular Dependency:** Åtgärdat cirkulärt beroende i `LtiService` via `@Lazy` injicering för stabilare uppstart.
    *   **Infra: Database Port:** Migrerat Docker-databasen till port 5433 för att undvika konflikt med lokala PostgreSQL-tjänster på host-maskinen.
*   **🛠 MinIO & CMI5 Stabilisering (7 feb 2026):**
    *   **Data Recovery:** Identifierat och åtgärdat "Split-Brain" konfiguration mellan Docker och lokal miljö för MinIO.
    *   **CMI5 Launch:** Verifierat korrekt start av CMI5-paket utan JSON-fel.
    *   **LRS:** Påbörjat implementering av "Completion Logic" för att registrera kursavslut via xAPI.
*   **🔗 LTI 1.3 Advantage Integration (6 feb 2026):**
    *   **LTI Advantage Services:** Implementerat fullt stöd för LTI 1.3 Advantage genom nya tjänster för OAuth2 Client Credentials-flöde (`LtiAdvantageService`).
    *   **Betygsrapportering (AGS):** Integrerat automatisk betygsöverföring till LMS efter avslutade quiz via Assignment and Grade Services (`LtiAgsService`).
    *   **Medlemssynkronisering (NRPS):** Implementerat Names and Role Provisioning Services (`LtiNrpsService`) för att automatiskt synkronisera klasslistor och användarroller från LMS.
    *   **Launch Persistence:** Ny databasmodell (`LtiLaunch`) för att spara och spåra aktiva LTI-kontexter, vilket möjliggör sömlös kommunikation med externa plattformar under hela sessionen.
*   **xAPI/cmi5 LRS Support & Analys (7 feb 2026):**
    *   **Teacher Analytics:** Ny dashboard för lärare som visar kursens genomströmning, completion rates och drop-off analys för interaktiva moduler.
    *   **LRS Core:** Förbättrat internt Learning Record Store med `cmi5.xml`-parsning, säker JWT-tokengenerering och indexerad lagring av statements.
    *   **Frontend Integration:** Sömlös integration i "Seminarier & SCORM"-vyn med direkt tillgång till analysverktyg.

*   **🎧 Ljudströmning & Roadmap-konsolidering (6 feb 2026):**
    *   **Stabilisering av ljudböcker:** Åtgärdat "AbortError" och avbrott vid minimering av spelaren genom att införa ett persistent `audio`-element i `FloatingAudioPlayer.jsx`.
    *   **HTTP Range-stöd:** Implementerat stöd för partiell innehållsleverans i `StorageController.java`, vilket möjliggör snabb spolning (seeking) och stabilare streaming av stora ljudfiler.
    *   **Roadmap-unifiering:** Konsoliderat `ROADMAP_2026.md` till huvudfilen `ROADMAP.md` för en tydligare projektvision och enklare underhåll.
    *   **Felhantering:** Förbättrad detektering av saknade filer och lagt till logik för manuell återskapning av AI-ljud direkt från biblioteket.

*   **🛠 Systemhärdning & Repository-städning (5 feb 2026):**
    *   **GitHub Cleanup:** Rensat bort över 24 000 statiska OnlyOffice-filer från Git-indexet för att hålla repot snabbt och rent.
    *   **EduFlex Control Center (Java):** Lanserat ett nytt fristående kontrollcenter byggt i Java (Swing) för att hantera Docker, loggar och backend-tjänster.
    *   **Ämnesexpansion:** Lagt till 12 nya ämneskategorier inklusive Psykologi, Juridik, och Medicin.
    *   **Hotfix: Database Constraint:** Åtgärdat fel i databasschemat som blockerade sparande av nya ämnena.

*   **🎯 Quiz-modul & Community-förbättringar (4 feb 2026):**
    *   **Generera Quiz:** Återinfört och optimerat funktionen för att slumpmässigt skapa quiz från Frågebanken för lärare.
    *   **Hotfix: Premium UI Recovery:** Åtgärdat layout-fel i `QuizModule` där rubriker och knappar överlappade. Designen är nu fullt responsiv och premium-stajlad.
    *   **Community Modal Redesign:** Ny, tydlig design för publicering till communityt med fyra dedikerade val (Ladda upp CSV, Publicera Quiz/Lektion/Uppgift).
    *   **Lektions-aggregering:** Förbättrad logik för att hämta lektioner från både vanliga lektioner och AI-genererat innehåll vid publicering.
    *   **Hotfix: Video Connectivity:** Åtgärdat fel där studenter inte kunde ansluta till Live-lektioner. Fixat race-condition vid uppstart, inaktiverat P2P-läge och ställt om till `meet.jit.si` som standard för maximal stabilitet genom internettunnlar.
    *   **Städad Kodbas:** Fixat dolda Tailwind-buggar orsakade av felaktig stränghantering.

*   **🏪 Community Marknadsplats Expansion (3 feb 2026):**
    *   **Författarprofiler:** Varje bidragsgivare har nu en dedikerad profil med statistik över nedladdningar, betyg och deras publicerade material.
    *   **Topplista (Leaderboard):** Introducerat en global topplista som främjar engagemang genom att lyfta fram de mest aktiva och högst värderade bidragsgivarna.
    *   **Förbättrad Sökbarhet:** Implementerat "Bläddra efter författare" och avancerad filtrering för att enklare hitta resurser från favoritförfattare.
    *   **Urprungspårning (Attribution):** Allt material som hämtas från communityt spårar nu sitt ursprung via `sourceCommunityItemId`, vilket säkrar attribution för skaparen även efter installation.
    *   **UI-integration:** Sömlös integration av Marknadsplatsen i Resursbanken för en snabbare och lyxigare användarupplevelse.

*   **🔐 Avancerad Systemhärdning & Säkerhet (3 feb 2026):**
    *   **Licensskydd (Anti-Cloning):** Implementerat domän-låsning i `LicenseService`. Systemet validerar nu att domänen i licensfilen matchar den faktiska servern.
    *   **GDPR-kryptering (Data-at-Rest):** Fullständig AES-256 GCM kryptering för känsliga fält i databasen (Personnummer, telefon, adress). Transparent dekryptering via JPA Converters.
    *   **Brute-Force Skydd:** Implementerat `RateLimitingFilter` på inloggning som blockerar IP-adresser i 15 minuter efter 5 misslyckade försök.
    *   **Produktionslåsning:** Tagit bort alla utvecklar-bypassar och miljövariabel-overrides för att garantera 100% säkerhet i kundmiljöer.

*   **🔐 Säker Konfigurationshantering (3 feb 2026):**
    *   **Databas-baserade API-nycklar:** Migrerat alla känsliga API-nycklar (Stripe, Gemini) från `.env`-filer till säker databaslagring.
    *   **Dynamisk Konfiguration:** Administratörer kan nu uppdatera API-nycklar och systemkonfiguration direkt via Admin-panelen utan att behöva starta om servern.
    *   **Konsoliderad AI-konfiguration:** Flyttat all AI-konfiguration till en dedikerad "AI-inställningar"-sektion i systeminställningar för bättre organisation.
    *   **Automatisk Migration:** Skapat PowerShell-script för att automatiskt migrera befintliga nycklar från miljövariabler till databasen.

*   **🚀 Resursbank & AI-expansion (3 feb 2026):**
    *   **Resursbanken:** En central hubb för alla dina quiz, uppgifter och lektioner. Nu med stöd för att dela och hämta material från ett gemensamt Community-bibliotek.
    *   **AI EduTask & EduLesson:** Generera kompletta inlämningsuppgifter och lektionsplaneringar med AI på sekunder.
    *   **Säkerhet:** Uppgraderat hanteringen av API-nycklar och hemligheter för ökad systemsäkerhet.

*   **📦 Lagringskvoter & Avancerad Filhantering (3 feb 2026):**
    *   **Lagringskvoter per användare:** Implementerat ett system för att begränsa hur mycket data varje användare kan ladda upp (standard 1GB).
    *   **Kvothantering:** Administratörer kan nu styra enskilda användares lagringsutrymme direkt via adminpanelen.
    *   **Realtidsstatistik:** Ny sidomeny-del som visar användarens aktuella lagring mot deras kvot med en visuell progress bar.
    *   **System-övergripande lagringsstats:** En ny dedikerad sektion i administrationspanelen visar totalt använt utrymme, antal filer och användarstatistik i hela systemet.
    *   **Förbättrad Säkerhet & Routning:** Separerat admin-statistik till en egen kontroller (`AdminStatsController`) för säkrare hantering av administrativa data.

*   **🎓 Student Records Vault - "Mina Meriter" (3 feb 2026):**
    *   **Officiella handlingar:** Implementerat ett säkert "valv" där elever kan se och ladda ner kursbevis, betyg och intyg.
    *   **Raderingsskydd:** Officiella dokument är skrivskyddade och kan endast hanteras av administratörer för att säkerställa integritet.
    *   **Admin-verktyg:** Nytt gränssnitt för administratörer att ladda upp officiella meriter till enskilda elever.
    *   **Digital Verifiering:** Varje merit visas med en verifierings-status för ökad professionell känsla.

*   **🛠 Systemstabilitet & Infra-fix (3 feb 2026):**
    *   **Fixat 502 Bad Gateway:** Åtgärdat kritiska nätverksfel genom att reparera databasscheman och korrupta Redis-volymer.
    *   **Docker-hälsa:** Implementerat bättre övervakning av Docker-tjänster och automatisk återställning av hängande processer.
    *   **Frontend-stabilitet:** Fixat `ReferenceError` i adminpanelen relaterat till saknade ikonexporter.

*   **🎮 Gamification V2.0 & Privat Video-infra (2 feb 2026):**
    *   **EduGame Engine (V2.0):** Lanserat en komplett backend-motor för `Streaks`, `Quests` och `Friendships`. Systemet automatgenererar nu dagliga uppdrag och spårar social interaktion.
    *   **Customization Shop:** Implementerat en butik där användare kan köpa profilarmer, bakgrunder och unika titlar med intjänad XP/poäng.
    *   **Dynamic UI Rendering:** Profiler och avatars renderar nu utrustade ramar och bakgrunder i realtid med högsta visuella kvalitet.
    *   **Privat Jitsi Server:** Migrerat till en helt självhostad Jitsi-stack via Docker för obegränsade videomöten utan tidsgräns.
    *   **Infrastructure & Docker:** Stabiliserat Docker-miljön på Windows genom att flytta VHDX-lagring och lösa portkonflikter mellan containrar och lokala tjänster.
    *   **Avatar-fix:** Löste kritiska 400 Bad Request-fel vid uppladdning genom att stabilisera MinIO-konfigurationen.

*   **🧩 Sidomeny-refaktorering & Gruppering (1 feb 2026):**
    *   **Kategoriserad Navigation:** Sidomenyn har byggts om från grunden för att minska visuell stress, särskilt för administratörer. Menyval är nu logiskt grupperade i sektioner (Huvudmeny, Utbildning, Verktyg, Administration).
    *   **Utfällbara Sektioner:** Ny `SidebarSection`-komponent som tillåter att grupper fälls in/ut för att spara vertikalt utrymme.
    *   **Modern Profil-area:** Profilsektionen har flyttats till botten för en mer premium "v2.0"-känsla, med snabbåtkomst till inställningar och logga ut.
    *   **Tema-konsistens:** Synkroniserat navigationslogiken över alla fem teman (`Standard`, `Ember`, `Voltage`, `Midnight`, `Nebula`) för en enhetlig upplevelse.
    *   **Desktop Focus (v2.1):** Allt "mobil-tema"-logik (bottom-nav, mobila headers) har tagits bort från desktop-teman för att ge fullt fokus på den kommande Native React-mobilappen.

*   **📊 Kursutvärderingar & AI-analys (1 feb 2026):**
    *   **Komplett Utvärderingssystem:** Nytt system för att skapa, hantera och analysera kursutvärderingar. Redesignat gränssnitt för både lärare och studenter.
    *   **Studentgränssnitt & Notiser:** Mobilvänligt, anonymiserat formulär. Automatiska systemnotiser vid aktivering samt en ny Dashboard-widget ("Din röst är viktig!") för smidig åtkomst.
    *   **AI-Feedback Analys:** Integrerat med Google Gemini för att automatiskt sammanfatta fritextsvar och identifiera förbättringsområden.
    *   **Lärarverktyg:** Dashboard för att hantera mallar, aktivera utvärderingar för specifika kurser och se AI-genererade sammanfattningar i realtid.
    *   **Anonymitet & Säkerhet:** Avancerad hash-teknik för student-ID. Fixat kritiska serialiseringsfel (500 error) och uppdaterat `SecurityConfig` för säker åtkomst till analytics.

*   **⚡ Cloudflare & Automation - Cold Start (1 feb 2026):**
    *   **Cold Start Script:** Nytt `cold_start.ps1`-skript som automatiserar allt från processrensning och Docker-start till att starta Backend/Frontend/Tunnel i separata fönster.
    *   **Cloudflare Source of Truth:** Standardiserat på `logs/cloudflared-config.yml` för fullt stöd för WebSockets (Forum), MinIO och OnlyOffice.
    *   **Cleanup Utility:** Integrerad automatisk avslutning av hängande Java-, Node- och Cloudflared-processer för att förhindra portkonflikter.

*   **💬 Modernisering av Forum-UI (1 feb 2026):**
    *   **Slut på Browser Prompts:** Eliminerat alla `window.prompt` och `window.confirm` i forum-modulen.
    *   **Moderna Modaler:** Implementerat snygga React-modaler (`NewThreadModal`, `NewCategoryModal`) med Lucide-ikoner, validering och full EduFlex-styling.

*   **🤖 Generative Course Creation - AI-kursgenerator (31 jan 2026):**
    *   **One-Click Course Creation:** Ladda upp en studiehandledning (PDF) och låt AI generera moduler, lektioner, sammanfattningar och quiz med ett klick.
    *   **Automatisk Datumläsning:** AI:n identifierar och extraherar nu automatiskt kursens start- och slutdatum från det uppladdade materialet.
    *   **Redigerbar Förhandsvisning:** Granska och justera AI-genererad titel, beskrivning och datum i realtid innan kursen skapas.
    *   **Smartare Kurskoder:** Genererar automatiskt kortfattade förkortningar (t.ex. "DBT") baserat på kursnamnet istället för slumpmässiga AI-id:n.
    *   **Synlighetskontroll:** Ny global kontroll för "Öppen för studenter" direkt i kursadministrationen för enkel hantering av kursstatus.
    *   **Databasstabilitet (Flyway V7):** Implementerat en permanent migration som säkrar att alla skolscheman har rätt struktur för AI-genererat innehåll.
    *   **Kaskadradering:** Möjliggjort säker radering av kurser genom att automatiskt städa bort alla tillhörande material och lektioner.
    *   **Miljörensning:** Rensat bort gamla test-schemas för en stabilare och snabbare utvecklingsmiljö.

*   **🚀 Prestanda & E-boksförbättringar (30 jan 2026):**
    *   **Permanent Cachning:** Aktiverat 1-års cachning (`immutable`) för bokomslag och media, vilket gör biblioteket blixtsnabbt.
    *   **MinIO Proxy:** Smart proxy i `StorageController` som servar gamla `/uploads/`-länkar direkt från MinIO utan databasändringar.
    *   **PDF-motor:** Ny backend-tjänst som extraherar innehållsförteckning och renderar PDF-sidor som bilder för den interaktiva läraren.

*   **📡 Cloudflare Tunnel & OnlyOffice Stabilitet (30 jan 2026):**
    *   **Infrastrukturstabilitet:** Åtgärdat `500 Internal Server Error` och `401 Unauthorized` genom att uppdaterat `SecurityConfig` och `AuthTokenFilter`.
    *   **WebSocket-stöd:** Aktiverat routing för `/ws` och `/ws-log` via Cloudflare Tunnel för fungerande chatt och realtidsloggar.
    *   **OnlyOffice-fix:** Löst "Nedladdning misslyckades (Code -4)" genom att korrigera nätverkskommunikation (`extra_hosts`) och interna sökvägar.
    *   **Lokal Dev-optimering:** Uppdaterat `run_backend_local.ps1` med Windows-kompatibla sökvägar och korrekta publika MinIO-URL:er.

*   **🤖 AI Study Pal & Databasstabilitet (30 jan 2026):**
    *   **PDF Indexering Fixad:** Åtgärdat versionskonflikt mellan Tika och PDFBox (nedgraderat till 2.0.31). AI Study Pal kan nu extrahera text från PDF korrekt.
    *   **Robustare Migrationer:** Uppdaterat Flyway-skript (V5, V6) med `DO`-block för att säkert hantera multi-tenant-miljöer utan krascher.
    *   **Automatiserad Migration:** Implementerat `GlobalMigrationRunner` som automatiskt migrerar ALLA kundscheman vid uppstart.
    *   **Renare Loggar:** Refaktorerat `AiStudyPalService` med svensk, mänsklig ton i loggningen för bättre monitorering.

*   **📚 PDF-stöd i E-boksbiblioteket (30 jan 2026):**
    *   **Interaktiv PDF-läsare:** Ny dedikerad läsare för PDF-dokument med innehållsförteckning.
    *   **Backend-rendering:** Integrerat Apache PDFBox 2.0.31 för rendering av sidor och extraktion av metadata på serversidan.
    *   **Kapitelnavigering:** Automatisk extraktion av PDF-bokmärken för en strukturerad läsupplevelse.

*   **🌍 Frontend-lokalisering & Lärarpanel (28 jan 2026):**
    *   **Lärarpanel:** Fullständig översättning av alla widgets, tabeller och modaler för lärare till svenska och engelska.
    *   **Elevpanel:** Fullständig översättning av alla widgets (Närvaro, Schema, Gamification, Framsteg) till svenska och engelska.

### 📖 Innehållsförteckning
- [Om Projektet](#-om-projektet)
- [Nyckelfunktioner](#-nyckelfunktioner)
- [Multi-Tenancy](#-multi-tenancy-sv)
- [Kom igång](#-kom-igång)
- [Konfiguration](#-konfiguration-sv)
- [Felsökning & Infrastruktur](docs/InfrastructureGuide.md)

---

### 🏫 Om Projektet

**EduFlex 2.0** är ett komplett, molnbaserat **Learning Management System (LMS)** designat för att skala från små utbildningsföretag till stora kommunala verksamheter. Systemet kombinerar modern pedagogik (Gamification, interaktiva element) med affärskritisk funktionalitet (fakturering, prenumerationer) i en säker, Docker-baserad arkitektur.

**Huvudsakliga fördelar:**
- 🏢 **Äkta Multi-Tenancy:** Schema-per-organisation för komplett dataisoleringen
- 🎮 **Inbyggd Gamification:** Poäng, utmärkelser, nivåer och topplistor
- 🇸🇪 **Skolverket-integration:** Direkt koppling till svenska läroplanen
- 💼 **SaaS-redo:** Prenumerationsnivåer, fakturering och betalningar
- 🎨 **White-label:** 8 designsystem med full visuell anpassning

---

### 🌟 Nyckelfunktioner

#### 🍎 Utbildning (Core)
- **Kurshantering:** Rika kurser med text, video, bilagor och quiz
- **AI Quiz & Lektioner:** Generera quiz, uppgifter och lektionsplaner automatiskt med Google Gemini
- **SCORM / xAPI / LTI 1.3 Advantage:** Fullt stöd för Articulate/Captivate-paket samt LMS-integration (Canvas/Moodle/Blackboard).
- **Uppgifter:** Filinlämningar med lärarbedömning
- **Certifikat:** Automatiska, spårbara PDF-diplom
- **E-boksbibliotek:** Fristående bibliotek för EPUB/PDF med kategorier
- **Resursbank:** Centraliserad hantering av allt utbildningsmaterial

#### 🎮 Gamification
- **Poäng & Nivåer:** XP genom aktivitet och framsteg
- **Utmärkelser:** Visuella badges för prestationer
- **Dagliga Utmaningar:** Roterande utmaningar med bonus-XP
- **Streaks:** Spåra konsekutiva inloggningsdagar med bonusar
- **Topplistor:** Frivilliga rankingar per klass/kurs
- **Achievement Toast:** Realtids-popup vid upplåsta prestationer

#### 🔔 Notifikationer
- **WebSocket Push:** Direkta notifikationer via STOMP/SockJS
- **Notifikationsklocka:** Header-komponent med oläst-räknare
- **Flera Typer:** Uppgifter, prestationer, system och sociala notiser

#### 👥 Sociala Funktioner
- **Online-vänner:** Se vilka som är online just nu
- **Snabbkontakt:** Enkla kontaktalternativ för lärare

#### 🏪 Community Marknadsplats
- **Innehållsdelning:** Publicera Quiz, Uppgifter och Lektioner till en delad marknadsplats
- **Moderation:** Admin-godkännande med väntande/publicerad/avvisad status
- **Frågebank-sync:** Quiz-frågor kopieras automatiskt till din Frågebank vid installation
- **20+ Ämnen:** Matematik, Svenska, Engelska, Fysik, Kemi och fler med anpassade ikoner

#### 🇸🇪 Skolverket-integration
- **Kurskoppling:** Direkt Skolverket-databaskoppling
- **Automatisk Import:** Python-verktyg för kurskoder
- **Kunskapskrav:** Betygsmatriser (E-A) direkt i kursvyn

#### 🏢 Multi-Tenancy
- **Schema-isolering:** Varje organisation i eget PostgreSQL-schema
- **Automatisk Provisionering:** Schema + migrationer + admin vid registrering
- **Request-routing:** `X-Tenant-ID` header för organisation-val

---

### 🏢 Multi-Tenancy (Sv)

EduFlex implementerar **schema-baserad multi-tenancy** för komplett dataisolering.

#### Skapa ny Tenant
```bash
curl -X POST http://localhost:8080/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Stockholms Tekniska Gymnasium",
    "domain": "stg.local",
    "dbSchema": "tenant_stg",
    "organizationKey": "stg",
    "adminEmail": "admin@stg.local",
    "adminPassword": "SäkertLösen123",
    "adminFirstName": "Anna",
    "adminLastName": "Andersson"
  }'
```

---

### Senaste Uppdateringar (2026-01-27)
- **Advanced Analytics Dashboard:**
  - Implementerat en omfattande analyspanel för Admins och Lärare.
  - Innehåller grafer för användaraktivitet, kursgenomströmning och betygsfördelning.
  - Automatisk identifiering av "At-Risk" studenter.
  - Backend-stöd via nya endpoints i `AnalyticsController`.

- **OnlyOffice Integration:**
  - Löste startup-problem med Docker-containern (`eduflex-onlyoffice`).
  - Verifierade att API:et svarar korrekt (200 OK) och att integrationen är stabil.

---

### 🚀 Kom igång

#### Förutsättningar
- **Docker Desktop** (senaste versionen)
- **Git**

#### Snabbstart

1. **Klona projektet**
   ```bash
   git clone https://github.com/alexwest1981/EduFlex.git
   cd EduFlex
   ```

2. **Starta systemet**
   ```bash
   docker compose up --build -d
   ```

3. **Öppna applikationen**
   | Tjänst | URL | Inloggning |
   |--------|-----|------------|
   | **LMS (Frontend)** | http://localhost:5173 | – |
   | **API Docs** | http://localhost:8080/swagger-ui.html | – |
   | **MinIO (Filer)** | http://localhost:9001 | minioadmin / minioadmin |

---

### ⚙️ Konfiguration (Sv)

#### Miljövariabler

| Tjänst | Variabel | Beskrivning | Standard |
|--------|----------|-------------|----------|
| **Backend** | `SPRING_DATASOURCE_URL` | Databaslänk | `jdbc:postgresql://db:5432/eduflex` |
| **Backend** | `EDUFLEX_AUTH_MODE` | Autentiseringsläge | `internal` |
| **Backend** | `GEMINI_API_KEY` | Google Gemini API-nyckel för AI Quiz | – |

---

<br/><br/>

<div id="-english"></div>

## 🇬🇧 English

### ⚡ Latest Updates
*   **✅ LTI 1.3 Advantage Verification & System Hardening (Feb 7, 2026):**
    *   **E2E Verification:** Successfully simulated LTI 1.3 Advantage (AGS & NRPS) flow, including automatic account provisioning and course enrollment.
    *   **Circular Dependency Fix:** Resolved a startup-blocking circular dependency in `LtiService` using `@Lazy` injection.
    *   **EntityGraph Optimization:** Fixed a filtering issue where courses without assigned teachers were hidden from auto-enrollment queries.
    *   **Database Port Re-routing:** Switched Docker database mapping to port 5433 to bypass conflicts with local PostgreSQL processes.
    *   **cmi5 Improvements:** Enhanced completion logic and LRS proxy endpoints for robust tracking of third-party educational content.
*   **xAPI/cmi5 Analytics & LRS (Feb 7, 2026):**
    *   **Teacher Analytics:** Comprehensive dashboard for tracking student progress, completion rates, and drop-off analysis in interactive modules.
    *   **Secure LRS:** Enhanced Learning Record Store with token-based security (JWT) and robust cmi5 profile validation.
    *   **Seamless UI:** Integrated analytics tools directly into the course module view.

*   **🎧 Media Streaming & Roadmap Consolidation (Feb 6, 2026):**
    *   **Audiobook Stabilization:** Resolved "AbortError" and playback interruptions during player minimization by unifying the `audio` element in `FloatingAudioPlayer.jsx`.
    *   **HTTP Range Support:** Implemented partial content delivery in `StorageController.java`, enabling seeking and smoother streaming for large audio assets.
    *   **Roadmap Unification:** Merged `ROADMAP_2026.md` into the primary `ROADMAP.md` for a streamlined project vision and better maintainability.
    *   **Resilience:** Enhanced missing file detection and implemented a manual AI-audio regeneration flow directly from the E-book library.

*   **🛠 System Hardening & Repository Cleanup (Feb 5, 2026):**
    *   **GitHub Cleanup:** Removed over 24,000 static OnlyOffice files from the Git index to keep the repository lean.
    *   **EduFlex Control Center (Java):** Launched a new standalone Java-based control center (Swing) for managing Docker, logs, and backend services.
    *   **Subject Expansion:** Added 12 new subject categories including Psychology, Law, and Medicine.
    *   **Hotfix: Database Constraint:** Resolved a database schema error that prevented saving new subjects.

*   **🎯 Quiz Module & Community Enhancements (Feb 4, 2026):**
    *   **Quiz Generator:** Restored and optimized the random quiz generation feature from the Question Bank for teachers.
    *   **Hotfix: Premium UI Recovery:** Resolved layout regressions in `QuizModule` ensuring a fully responsive and premium aesthetic without overlapping elements.
    *   **Community Modal Redesign:** Introduced a clean four-option entry point for community publishing (CSV Upload, Publish Quiz/Lesson/Assignment).
    *   **Lesson Aggregation:** Enhanced logic to aggregate both standard and AI-generated lessons for a complete publishing experience.
    *   **Hotfix: Video Connectivity:** Resolved student join issues in Live Lessons. Fixed startup race conditions, disabled P2P mode, and switched to `meet.jit.si` as default for enhanced stability through internet tunnels.
    *   **Codebase Cleanup:** Fixed hidden Tailwind CSS bugs caused by incorrect string formatting.

*   **🏪 Community Marketplace Expansion (Feb 3, 2026):**
    *   **Author Profiles:** Dedicated profiles for all contributors featuring download stats, ratings, and published resources.
    *   **Contributor Leaderboard:** New global leaderboard to recognize and reward top community contributors.
    *   **Enhanced Discovery:** Added "Browse by Author" and advanced filtering to easily find resources from your favorite creators.
    *   **Origin Tracking (Attribution):** All community-sourced content now tracks its origin via `sourceCommunityItemId`, ensuring proper attribution even after installation.
    *   **UI Modernization:** Seamless integration of the new Marketplace UI into the Resource Bank for a premium user experience.

*   **🔐 Advanced System Hardening & Security (Feb 3, 2026):**
    *   **License Anti-Cloning:** Implemented domain binding in `LicenseService` to prevent unauthorized software redistribution.
    *   **GDPR Data Encryption:** Full AES-256 GCM encryption for sensitive database fields (SSN, phone, address) using JPA attribute converters.
    *   **Brute-Force Mitigation:** New `RateLimitingFilter` blocking suspicious IPs for 15 minutes after 5 failed login attempts.
    *   **Production Lockdown:** Removed all developer bypasses and hardcoded overrides to ensure a secure "live service" experience.

*   **📦 Storage Quotas & Advanced File Management (Feb 3, 2026):**
    *   **Per-User Storage Quotas:** Implemented a system to limit data uploads for each user (default 1GB).
    *   **Quota Management:** Administrators can now control individual user storage limits directly from the admin panel.
    *   **Real-time Usage Stats:** New sidebar widget displaying user-specific storage usage against their quota with a visual progress bar.
    *   **System-wide Storage Statistics:** A new dedicated administration section shows total used storage, file counts, and system-wide user stats.
    *   **Improved Security & Routing:** Isolated administrative statistics to a dedicated controller (`AdminStatsController`) for enhanced security and routing clarity.

*   **🚀 Resursbank & AI Expansion (Feb 3, 2026):**
    *   **Resursbanken:** En central hubb för Quiz, Uppgifter och Lektioner med stöd för Community-delning.
    *   **AI EduTask & EduLesson:** Generera fullständiga inlämningsuppgifter och lektionsplaneringar med AI.
    *   **Community Marketplace:** Dela och hämta material från andra lärare direkt i plattformen.

*   **🎓 Student Records Vault - "My Merits" (Feb 3, 2026):**
    *   **Official Documents:** Implemented a secure "vault" where students can view and download course certificates, grades, and credentials.
    *   **Delete Protection:** Official documents are write-protected and can only be managed by administrators to ensure integrity.
    *   **Admin Tools:** New interface for administrators to upload official records to individual students.

*   **🛠 System Stability & Infra Fix (Feb 3, 2026):**
    *   **Fixed 502 Bad Gateway:** Resolved critical network errors by repairing database schemas and corrupt Redis volumes.
    *   **Docker Health:** Improved monitoring of Docker services and automatic recovery of hanging processes.
    *   **Frontend Stability:** Fixed `ReferenceError` in administration panel related to missing icon exports.

*   **🧩 Sidebar Refactor & Grouping (Feb 1, 2026):**
    *   **Categorized Navigation:** The sidebar has been rebuilt from scratch to reduce visual clutter, especially for administrators. Navigation items are now logically grouped into sections (Main Menu, Education, Tools, Administration).
    *   **Collapsible Sections:** New `SidebarSection` component that allows groups to be collapsed/expanded to save vertical space.
    *   **Modern Profile Area:** The profile section has been moved to the bottom for a more premium "v2.0" feel, with quick access to settings and logout.
    *   **Theme Consistency:** Synchronized navigation logic across all five themes (`Standard`, `Ember`, `Voltage`, `Midnight`, `Nebula`) for a unified experience.
    *   **Desktop Focus (v2.1):** All "mobile theme" logic (bottom-nav, mobile headers) has been removed from desktop themes to maintain full focus on the upcoming Native React mobile app.

*   **📊 Course Evaluations & AI Analysis (Feb 1, 2026):**
    *   **Complete Evaluation System:** New system for creating, managing, and analyzing course evaluations. Redesigned interface for both teachers and students.
    *   **Student Interface & Notifications:** Mobile-friendly, anonymized form. Automatic system notifications upon activation and a new Dashboard widget ("Your voice matters!") for easy access.
    *   **AI-Feedback Analysis:** Integrated with Google Gemini to automatically summarize text answers and identify areas for improvement.
    *   **Security & Stability:** Fixed critical serialization issues (500 error) and hardened access controls.

*   **⚡ Cloudflare & Automation - Cold Start (Feb 1, 2026):**
    *   **Cold Start Script:** New `cold_start.ps1` script automating process cleanup and full stack startup.
    *   **Infrastructure:** Standardized on `logs/cloudflared-config.yml` for reliable WebSocket (Forum) and OnlyOffice support.

*   **💬 Forum UI Modernization (Feb 1, 2026):**
    *   **Native Modals:** Replaced browser prompts with modern React modals for a seamless UX.

### 📖 Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Multi-Tenancy](#-multi-tenancy)
- [Getting Started](#-getting-started-en)
- [Configuration](#-configuration-en)
- [Authentication Modes](#-authentication-modes)
- [API Reference](#-api-reference)
- [Modules Deep Dive](#-modules-deep-dive)
- [Monitoring & Observability](#-monitoring--observability)
- [Localization](#-localization)
- [Deployment Options](#-deployment-options)
- [Roadmap](#-roadmap)
- [License](#-license)

---

### 🏫 About the Project

**EduFlex 2.0** is a robust, cloud-native Learning Management System (LMS) engineered for scalability and user engagement. It bridges the gap between traditional enterprise LMS (often clunky and boring) and modern consumer apps (gamified, fast, and beautiful).

**Key Differentiators:**
- 🏢 **True Multi-Tenancy:** Schema-per-tenant isolation for complete data separation
- 🎮 **Gamification Built-in:** Points, badges, levels, and leaderboards
- 🇸🇪 **Skolverket Integration:** Direct integration with Swedish National Curriculum
- 💼 **SaaS Ready:** Subscription tiers, invoicing, and payment processing
- 🎨 **White-label Support:** 8 design systems with complete visual customization

---

### 🌟 Key Features

#### 🍎 Core Education
| Feature | Description |
|---------|-------------|
| **Course Management** | Rich courses with text, video, attachments, and quizzes |
| **Video Lessons** | Self-hosted video uploads with chapters, speed control, and analytics |
| **Live Classrooms** | Jitsi-powered video conferencing with scheduling and dashboard widget |
| **SCORM / xAPI / LTI 1.3 Advantage** | Import packages from Articulate/Adobe Captivate & LMS Integration |
| **Assignment Engine** | File submissions with teacher grading and feedback |
| **Certification** | Auto-generated verifiable PDF certificates |
| **Lesson Progress** | Track student progress through course materials |
| **Quiz System** | Multiple choice, open-ended, and true/false questions |
| **AI Quiz Generator** | Generate quizzes from documents using Google Gemini AI |
| **E-book Library** | Standalone library for EPUB/PDF with categorized browsing |

#### 🎮 Gamification & Engagement
| Feature | Description |
|---------|-------------|
| **Points & Levels** | XP for logins, lessons, and quiz scores |
| **Badges & Achievements** | Visual achievements with Lucide iconography and unlock conditions |
| **Daily Challenges** | Rotating challenges with bonus XP rewards |
| **Streaks** | Track consecutive login days with streak bonuses |
| **Leaderboards** | Optional class/course rankings |
| **Activity Tracking** | Detailed student activity logs |
| **Per-Tenant Config** | Admins can enable/disable gamification features per organization |
| **Achievement Toast** | Real-time popups when achievements are unlocked |
| **XP Boost Indicator** | Visual indicator for active XP multipliers |

#### 🇸🇪 Skolverket Integration
| Feature | Description |
|---------|-------------|
| **Curriculum Mapping** | Direct Skolverket database integration |
| **Automated Import** | Python tools for course codes and descriptions |
| **Grading Criteria** | "Kunskapskrav" (E-A) directly in course view |
| **CSN Reporting** | Attendance export for CSN compliance |

#### 💼 Revenue & Administration
| Feature | Description |
|---------|-------------|
| **Subscription Tiers** | Free, Pro, Enterprise licensing |
| **Invoicing** | Automatic PDF invoice generation |
| **Payment Integration** | Stripe/Swish abstraction layer |
| **User Management** | Profiles with MinIO-backed avatar uploads |
| **RBAC** | Fine-grained permissions per role |
| **Audit Logging** | Track all critical changes |

#### 🏢 Multi-Tenancy
| Feature | Description |
|---------|-------------|
| **Schema Isolation** | Each tenant in separate PostgreSQL schema |
| **Automatic Provisioning** | Schema + migrations + admin user on registration |
| **Request Routing** | `X-Tenant-ID` header for tenant selection |
| **Tenant API** | Full CRUD for tenant management |

#### 🔔 Real-time Notifications
| Feature | Description |
|---------|-------------|
| **WebSocket Push** | Instant notifications via STOMP/SockJS |
| **Notification Bell** | Header component with unread count badge |
| **Multiple Types** | Assignment, achievement, system, and social notifications |
| **Read/Unread State** | Track which notifications have been seen |
| **Notification History** | Persistent storage with pagination |

#### 👥 Social Features
| Feature | Description |
|---------|-------------|
| **Online Friends Panel** | See who's currently online |
| **Student Contact Modal** | Quick contact options for teachers |
| **Activity Feed** | Recent activity from connections |

#### 🏪 Community Marketplace
| Feature | Description |
|---------|-------------|
| **Content Sharing** | Teachers can publish Quiz, Assignments, and Lessons to a shared marketplace |
| **Moderation Flow** | Admin approval with pending/published/rejected states |
| **Question Bank Sync** | Quiz questions automatically copied to personal Question Bank on install |
| **Subject Categories** | 20+ subject categories with custom icons and colors |
| **Search & Filter** | Find content by subject, type, keywords, and ratings |
| **Ratings & Reviews** | 5-star rating system with user comments |
| **Download Tracking** | Track popular content with download counts |
| **Cross-Tenant** | Content accessible across all EduFlex tenants |

#### 🎨 Enterprise Themes & Whitelabel
Complete visual customization with 8 professional design systems:
- **EduFlex Classic** – Traditional sidebar layout
- **EduFlex Focus** – Minimalist with floating container
- **EduFlex Horizon** – Top navigation with beige gradient
- **EduFlex Nebula** – Glassmorphic purple/lavender
- **EduFlex Ember** – Card sidebar with orange accents
- **EduFlex Voltage** – Acid lime neon with dark sidebar
- **EduFlex Midnight** – Dark mode with mint accents
- **EduFlex Pulse** – Music player-inspired red theme

#### 📊 Analytics & Insights
| Feature | Description |
|---------|-------------|
| **Advanced Analytics Dashboard** | [x] **Advanced Analytics Dashboard** (Implemented Q1 2026)
  - Real-time user activity tracking
  - Course performance metrics
  - At-risk student identification
  - Admin/Teacher specific views |
| **Student Activity Logs** | Deep-dive into individual history |
| **Real-time Debug Terminal** | Matrix-style live log streaming |

#### 🌍 Localization
Fully translated UI supporting:
- 🇸🇪 Swedish (Primary)
- 🇬🇧 English
- 🇸🇦 Arabic
- 🇳🇴 Norwegian
- 🇩🇰 Danish
- 🇫🇮 Finnish
- 🇩🇪 German
- 🇫🇷 French
- 🇪🇸 Spanish

---

### 📸 Screenshots

| <img src="assets/ScreenGrabs/admin_dashboard.png" width="400" alt="Admin Dashboard" /> | <img src="assets/ScreenGrabs/teacher_dashboard.png" width="400" alt="Teacher Dashboard" /> |
|:---:|:---:|
| **Admin Dashboard** | **Teacher Dashboard** |

| <img src="assets/ScreenGrabs/AIQuizGenerator.png" width="400" alt="AI Quiz Generator" /> | <img src="assets/ScreenGrabs/SystemSettings.png" width="400" alt="System Settings" /> |
|:---:|:---:|
| **AI Quiz Generator** | **System Settings** |

| <img src="assets/ScreenGrabs/Analytics.png" width="400" alt="Analytics" /> | <img src="assets/ScreenGrabs/LiveDebugTerminal.png" width="400" alt="Live Debug Terminal" /> |
|:---:|:---:|
| **Analytics & Insights** | **Live Debug Terminal** |

| <img src="assets/ScreenGrabs/Library.png" width="400" alt="E-book Library" /> | <img src="assets/ScreenGrabs/Kurskatalog.png" width="400" alt="Course Catalog" /> |
|:---:|:---:|
| **E-book Library** | **Course Catalog** |

| <img src="assets/ScreenGrabs/Resursbank.png" width="400" alt="Resource Bank" /> | |
|:---:|:---:|
| **Resource Bank / Community** | |

---

### 🛠 System Architecture

EduFlex uses a containerized architecture managed by **Docker Compose** or **Kubernetes (Helm)**.

```mermaid
graph TD
    User((User)) -->|Browser| Frontend[React Frontend]
    
    subgraph "Docker/K8s Network"
        Frontend -->|API + X-Tenant-ID| Backend[Spring Boot API]
        Backend -->|Per-Tenant Schema| DB[(PostgreSQL)]
        Backend -->|Session/Cache| Redis[(Redis)]
        Backend -->|File Storage| MinIO[(MinIO S3)]
        Backend -->|SSO| Keycloak[Keycloak]
        
        Prometheus[Prometheus] -->|Scrape /actuator| Backend
        Grafana[Grafana] -->|Query| Prometheus
    end
    
    Backend -.->|External| Stripe[Stripe API]
    Backend -.->|External| Skolverket[Skolverket Web]
```

#### Multi-Tenancy Data Flow

```mermaid
sequenceDiagram
    participant Client
    participant TenantFilter
    participant TenantContext
    participant Hibernate
    participant PostgreSQL

    Client->>TenantFilter: Request + X-Tenant-ID: "acme"
    TenantFilter->>PostgreSQL: SELECT dbSchema FROM tenants WHERE id='acme'
    TenantFilter->>TenantContext: Set ThreadLocal = "tenant_acme"
    TenantFilter->>Hibernate: Continue filter chain
    Hibernate->>PostgreSQL: SET search_path TO "tenant_acme"
    PostgreSQL-->>Client: Data from tenant_acme schema only
```

---

### 💻 Technology Stack

#### Frontend Service (`eduflex-frontend`)
| Category | Technologies |
|----------|-------------|
| **Core** | React 19, Vite 5 |
| **State** | Zustand, React Context |
| **Styling** | Tailwind CSS v4, CSS Variables |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Real-time** | SockJS + STOMP (WebSockets) |
| **i18n** | i18next (9 languages) |
| **Rich Text** | React-Quill-new |

#### Backend Service (`eduflex-backend`)
| Category | Technologies |
|----------|-------------|
| **Core** | Java 21, Spring Boot 3.4 |
| **Security** | Spring Security 6, JWT, OAuth2 |
| **Data** | Spring Data JPA, Hibernate 6.4 |
| **Database** | PostgreSQL 15 |
| **Caching** | Spring Data Redis |
| **Storage** | MinIO/S3 SDK |
| **PDF** | OpenPDF |
| **Migrations** | Flyway (programmatic per-tenant) |
| **API Docs** | Swagger / OpenAPI 3.0 |
| **Monitoring** | Micrometer + Actuator |

#### Infrastructure
| Component | Technology |
|-----------|------------|
| **Database** | PostgreSQL 15 (Alpine) |
| **Cache** | Redis 7 (Alpine) |
| **Object Storage** | MinIO (S3-compatible) |
| **SSO Provider** | Keycloak 24 |
| **Monitoring** | Prometheus + Grafana |
| **Backups** | Daily PostgreSQL dumps |
| **Container Runtime** | Docker 24+ |
| **Orchestration** | Docker Compose / Kubernetes |

---

### 🏢 Multi-Tenancy

EduFlex implements **schema-based multi-tenancy** for complete data isolation.

#### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                      │
├─────────────────┬─────────────────┬─────────────────────────┤
│  public schema  │  tenant_acme    │  tenant_school2        │
│  ───────────────│  ───────────────│  ───────────────────── │
│  • tenants      │  • app_users    │  • app_users           │
│  (metadata)     │  • roles        │  • roles               │
│                 │  • courses      │  • courses             │
│                 │  • (40+ tables) │  • (40+ tables)        │
└─────────────────┴─────────────────┴─────────────────────────┘
```

#### Creating a Tenant

**Via API:**
```bash
curl -X POST http://localhost:8080/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme School",
    "domain": "acme.local",
    "dbSchema": "tenant_acme",
    "organizationKey": "acme",
    "adminEmail": "admin@acme.local",
    "adminPassword": "SecurePass123",
    "adminFirstName": "John",
    "adminLastName": "Admin"
  }'
```

**What happens automatically:**
1. ✅ Tenant metadata saved to `public.tenants`
2. ✅ PostgreSQL schema `tenant_acme` created
3. ✅ All 40+ tables migrated via Flyway
4. ✅ ADMIN role created
5. ✅ Admin user created with encrypted password

#### Using X-Tenant-ID Header

All API requests must include the tenant header:
```http
X-Tenant-ID: acme
```

#### Key Components
| File | Purpose |
|------|---------|
| `TenantContext.java` | ThreadLocal tenant storage |
| `TenantFilter.java` | Extracts and validates X-Tenant-ID |
| `TenantIdentifierResolver.java` | Hibernate tenant resolution |
| `SchemaMultiTenantConnectionProvider.java` | Sets PostgreSQL search_path |

> 📖 **Full documentation:** [docs/TENANT_ADMIN_GUIDE.md](docs/TENANT_ADMIN_GUIDE.md)

---

<div id="-getting-started-en"></div>

### 🚀 Getting Started

#### Prerequisites
- **Docker Desktop** (latest version)
- **Git**
- **Java 21** (for local backend development)
- **Node.js 20+** (for local frontend development)

#### Quick Start with Docker

1. **Clone the Repository**
   ```bash
   git clone https://github.com/alexwest1981/EduFlex.git
   cd EduFlex
   ```

2. **Start Everything**
   ```bash
   docker compose up --build -d
   ```

3. **Access the Application**
   | Service | URL | Credentials |
   |---------|-----|-------------|
   | **Frontend (LMS)** | http://localhost:5173 | – |
   | **Backend API** | http://localhost:8080/api | – |
   | **Swagger Docs** | http://localhost:8080/swagger-ui.html | – |
   | **MinIO Console** | http://localhost:9001 | minioadmin / minioadmin |
   | **Grafana** | http://localhost:3000 | admin / admin |
   | **Keycloak** | http://localhost:8180 | admin / admin |
   | **Prometheus** | http://localhost:9090 | – |

#### Local Development

**Backend (Spring Boot):**
```bash
cd eduflex
mvn spring-boot:run
```

**Frontend (Vite):**
```bash
cd frontend
npm install
npm run dev
```

---

<div id="-configuration-en"></div>

### ⚙️ Configuration

#### Environment Variables

| Service | Variable | Description | Default |
|---------|----------|-------------|---------|
| **Backend** | `SPRING_DATASOURCE_URL` | DB connection | `jdbc:postgresql://db:5432/eduflex` |
| **Backend** | `MINIO_URL` | S3 endpoint (internal) | `http://minio:9000` |
| **Backend** | `MINIO_PUBLIC_URL` | Public S3 URL (for clients) | `https://storage.eduflexlms.se` |
| **Backend** | `SPRING_REDIS_HOST` | Redis host | `redis` |
| **Backend** | `EDUFLEX_AUTH_MODE` | Auth mode | `internal` |
| **Backend** | `GEMINI_API_KEY` | Google Gemini API key for AI Quiz | – |
| **Frontend** | `VITE_API_BASE_URL` | API endpoint | `http://localhost:8080/api` |

---

### 🔐 Authentication Modes

EduFlex supports three authentication modes:

| Mode | Description | Use Case |
|------|-------------|----------|
| `internal` | JWT-based local authentication | Small deployments, development |
| `keycloak` | Full Keycloak SSO | Enterprise with existing IdP |
| `hybrid` | Both internal and Keycloak | Migration scenarios |

Configure via `eduflex.auth.mode` property.

---

### 📡 API Reference

**Base URL:** `http://localhost:8080/api`

All requests (except `/api/tenants`) require `X-Tenant-ID` header.

#### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tenants` | Create new tenant |
| `POST` | `/api/auth/login` | Authenticate user |
| `GET` | `/api/courses` | List courses |
| `GET` | `/api/users/me` | Current user profile |
| `GET` | `/api/modules` | System modules |

#### Gamification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/gamification/achievements` | List all achievements |
| `GET` | `/api/gamification/achievements/user` | User's unlocked achievements |
| `GET` | `/api/gamification/streak` | Current user's streak info |
| `GET` | `/api/gamification/challenges/daily` | Today's daily challenges |
| `POST` | `/api/gamification/challenges/{id}/complete` | Mark challenge as complete |

> 📖 **Full API docs:** [docs/API.md](docs/API.md) or Swagger UI

---

### 🎛 Modules Deep Dive

EduFlex uses a **"Kernel + Extensions"** architecture. Features are toggleable:

| Module | Description | License |
|--------|-------------|---------|
| **SCORM** | Upload/play courseware | Enterprise |
| **REVENUE** | Subscriptions & invoicing | Pro+ |
| **GAMIFICATION** | XP, Badges, Leaderboards | Pro+ |
| **CHAT** | WebSocket messaging | Pro+ |
| **SSO** | Keycloak integration | Enterprise |
| **WHITELABEL** | Custom branding/themes | Enterprise |

---

### 📊 Monitoring & Observability

#### Prometheus Metrics
Backend exposes metrics at `/actuator/prometheus`:
- JVM memory, GC, threads
- HTTP request latency & counts
- Database connection pool stats
- Custom business metrics

#### Grafana Dashboards
Pre-configured dashboards for:
- System Overview
- JVM Performance
- HTTP Request Analysis
- Database Performance

#### Real-time Debug Terminal
Admin users can access live log streaming via the built-in "Matrix-style" debug terminal in the Admin UI.

---

### 🚢 Deployment Options

#### Option 1: Docker Compose (Recommended for Dev/Small)
```bash
docker compose up -d
```

#### Option 2: Kubernetes with Helm (Production)
```bash
helm install eduflex ./helm/eduflex \
  --namespace eduflex \
  --create-namespace \
  -f values-production.yaml
```

---

### 🗺 Roadmap

| Feature | Status |
|---------|--------|
| Multi-tenancy (Schema-per-tenant) | ✅ Implemented |
| Kubernetes Native (Helm Charts) | ✅ Implemented |
| Keycloak SSO Integration | ✅ Implemented |
| Prometheus/Grafana Monitoring | ✅ Implemented |
| Gamification Engine | ✅ Implemented |
| SCORM/xAPI Support | ✅ Implemented |
| Real-time Notifications (WebSocket) | ✅ Implemented |
| Daily Challenges & Streaks | ✅ Implemented |
| Achievement System | ✅ Implemented |
| Social Features (Online Friends) | ✅ Implemented |
| Support Ticket System | ✅ Implemented |
| HTTPS Storage (Cloudflare Tunnel) | ✅ Implemented |
| Enhanced Calendar (MiniCalendar, Events) | ✅ Implemented |
| Admin UI Redesign (Whitelabel) | ✅ Implemented |
| Video Lessons (Self-hosted, Chapters) | ✅ Implemented |
| Live Classrooms (Jitsi Integration) | ✅ Implemented |
| Community Marketplace | ✅ Implemented |
| Question Bank Integration | ✅ Implemented |
| AI-powered Quiz Generation (Gemini) | ✅ Implemented |
| Advanced Analytics Dashboard | ✅ Implemented |
| Microservices Split (Video/PDF) | 🔜 Q2 2026 |
| Event Bus (Kafka/RabbitMQ) | 🔜 Q3 2026 |
| Mobile App (React Native) | 🔜 Q4 2026 |
| Push Notifications (Mobile) | 🔜 Q4 2026 |

---

<div id="-license"></div>

### ❓ Troubleshooting

#### Common Issues

**1. "Port 8080 is already in use"**
```bash
# Find and kill process
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**2. "Tenant not found" errors**
- Ensure `X-Tenant-ID` header is present
- Verify tenant exists: `curl http://localhost:8080/api/tenants`

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file - overview |
| [HELM_README.md](HELM_README.md) | Kubernetes/Helm deployment |
| [docs/API.md](docs/API.md) | REST API reference |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [docs/TENANT_ADMIN_GUIDE.md](docs/TENANT_ADMIN_GUIDE.md) | Multi-tenancy & Keycloak guide |
| [docs/ROADMAP_2026.md](docs/ROADMAP_2026.md) | Project Roadmap |

---

## ⚖️ License & Contact

**EduFlex™ © 2026 Alex Weström / Fenrir Studio**

**Proprietary Software.**
Unauthorized copying or distribution is strictly prohibited.

For inquiries: 📧 **alexwestrom81@gmail.com**

<p align="center"> 
  <img src="docs/images/fenrir.png" width="60" alt="Fenrir Studio"/> 
</p>

---

*Last updated: 2026-02-01 (Full Language Separation, Course Evaluations & AI Analysis)*
