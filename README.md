# 🎓 EduFlex LLP v3.9.2 (R2)
*Den kompletta Learning Lifecycle-plattformen för modern utbildning och B2B*

*Utvecklas & underhålls av **Alex Weström / Fenrir Studio***  
🇸🇪 Svenska | 🇬🇧 English | 🇫🇷 Français | 🇩🇪 Deutsch | 🇫🇮 Suomi | 🇳🇴 Norsk | 🇩🇰 Dansk | 🇪🇸 Español | 🇸🇦 العربية

![EduFlex Architecture](https://img.shields.io/badge/Architecture-Kubernetes%20%7C%20Helm-blue)
![React Version](https://img.shields.io/badge/React-19-61dafb)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6db33f)
![Compliance](https://img.shields.io/badge/Compliance-GDPR%20%7C%20ISO%2027001%20Ready-success)

EduFlex LLP är ett enterprise-redo, molnbaserat ekosystem som ersätter traditionella, fragmenterade skol-it-miljöer (Canvas + Zoom + Moodle + Alvis). Genom en distribuerad mikrotjänstarkitektur, asynkron händelsebuss, svensk myndighetsintegration och marknadens första 100 % spårbara AI-motor, sänker EduFlex kundernas Total Cost of Ownership (TCO) drastiskt.

---

## 🚀 Senaste Uppdateringarna (Changelog)

### v3.9.3 (18 mar 2026) – Performance Tuning & Repo Hardening
- **🇳🇴 Norwegian Translation Fix**: Resolved corrupted nested structures in `no.json` files and re-translated the entire locale via the AI sync service.
- **⚡ Frontend Optimization**: Fixed "slow reload" loop during language switching by optimizing Vite's watcher and disabling `i18next` debug mode.
- **🛡️ Repo Security & Cleanup**: Extensively updated the root `.gitignore` to strictly exclude OnlyOffice data, logs, and temporary development files. Untracked and cleaned up accidentally included PII and junk files.
- **📦 Service Stability**: Standardized internal API access for synchronization tools to prevent unauthorized triggers.

### v3.9.2 (13 mar 2026) – Operation Globalization (Full System Localization)
- **🌍 100% Landing Page Localization**: Removed all hardcoded Swedish from `LandingPage.jsx`, `ContactModal.jsx`, and `Footer`.
- **🏗️ Backend i18n Architecture**: Implemented Spring `MessageSource` for dynamic system messages.
- **🌍 Frontend Deep Localization**: Refactored `TentaManager`, `Catalog`, `QuizModule`, and `SkolverketCourseInfo` to use i18n keys.
- **🔄 Robust Language Sync**: All 9 supported languages (EN, FR, DE, ES, AR, NO, DA, FI) are now 100% synchronized via AI-driven hub.
- **⚖️ Compliance & PII**: Enhanced PII masking for international AI sessions.

### v3.9.1 - Global Language Sync & Security Hardening
- **🌍 Landing Page Globalization**: Genomfört en komplett lokalisering av landningssidan (`LandingPage.jsx`). Alla hårdkodade strängar har ersatts med dynamiska nycklar, vilket möjliggör fullt stöd för alla 9+ språk direkt vid första anblick.
- **🔄 Multi-Language AI-Sync**: Synkroniserat över 100 nya översättningsnycklar på tvärs av alla språkfiler (sv, en, fr, de, ar, no, da, fi) via vår Gemini-drivna översättningshub.
- **⚙️ i18n Resource Robustness**: Förbättrat laddningslogiken i `i18n.js` för att hantera exporterade JSON-moduler mer robust, vilket eliminerar "flicker" och laddningsfel vid språkbyte.
- **🛡️ Security Hardening**: Optimerat `SecurityConfig` för att tillåta publik åtkomst till språkvals-API:er på inloggningssidan, samt standardiserat roll-auktorisering (`hasAnyAuthority`).
- **🧬 Database Schema Isolation**: Migrerat Keycloak och Backend till separata databaser för att eliminera schema-konflikter i Kubernetes-miljön.

### v3.9.0 (13 mar 2026) – Cloud-Native Transition (Kubernetes & Helm)
- **☸️ Kubernetes Migration**: Hela ekosystemet har flyttats till Kubernetes (K3s via Helm) för oändlig skalbarhet och automatisk självläkning (Self-healing).
- **📦 Helm Orchestration**: Implementerat en robust Helm-chart för alla 10+ mikrotjänster, inklusive automatiserad databasinitialisering och Ingress-hantering.
- **🔄 Production Data Restoration**: Återställt 79MB produktionsdata till K8s-klustret, vilket inkluderar alla 43 användare, utbildningsprogram och historik.
- **🛠️ Control Center K8s-Link**: Kontrollcenter kan nu bygga, importera och deploya direkt till Kubernetes med ett klick.
- **🛡️ Database Resilience**: Sanerat och optimerat databasbackuper för felfri återställning mellan olika PostgreSQL-versioner.

### v3.8.2 (9 mar 2026) – Enterprise Security & Compliance
- **Enterprise IAM & Privacy**: Implementerat "Skyddad identitet" för studenter med automatiskt dold profil överallt utom för systemadministratörer (GDPR).
- **Data Protection & Audit**: Alla visningar av användarprofiler loggas nu i en spårbar "Read Audit Log", enligt krav från svenska kommuner och myndigheter (ex. Stockholms stad Bilaga 3c).
- **Inbyggd DRM (Enterprise)**: Filskyddsmekanism (DRM) i materialvisaren som förhindrar nedladdning, utskrift och kopiering (right-click) av unikt kursmaterial, optimalt för stängd B2B-distribution.
- **Incident Response Plan**: Nyskriven IRP-dokumentation med procedurer för inneslutning av dataintrång och ransomware för anbud inom offentlig sektor.

### v3.8.1 (8 mar 2026) – Dynamic Language Manager (AI-Powered)
- **🌍 Dynamic Language Manager**: Implementerat ett centralt system för att hantera språk direkt från Kontrollcenter.
- **🤖 AI-Driven översättning**: Nya språk översätts automatiskt med Gemini AI genom att läsa av systemets existerande språkfiler.
- **📦 MinIO Storage**: Alla översättningar lagras persistent i MinIO för att eliminera lokala filberoenden.
- **🔄 Dynamisk i18n**: Frontend hämtar nu tillgängliga språk och översättningar i realtid från backendens API.
- **👤 Profil-integration**: Användare kan nu välja mellan alla administratörs-aktiverade språk i sin profil.

### v3.8.1 (8 mar 2026) – Plug-and-Play & Universal Startup
- **🚀 One-Click Startup**: Implementerat en enhetlig start-metod för Windows (`Start-EduFlex.bat`) och Linux/WSL (`start.sh`).
- **🌐 Browser Automation**: Systemet öppnar nu automatiskt webbläsaren till inloggningssidan (`eduflexlms.se/login`) när tjänsterna är redo.
- **🐧 Bazzite/Linux Support**: Skapat en ren Bash-orkestrerare för Linux-miljöer, optimerad för smärtfri körning utanför Windows.

### v3.8.0 (8 mar 2026) – Enterprise Compliance & Automation (ERP+)
- **CSN Autopilot / Ghosting Radar**: Implementerat en automatiserad kontroll (Ghosting Radar) för att identifiera elever som saknar inloggning på >14 eller >30 dagar och skicka händelsekoder (99/41/81) för att förhindra felaktiga CSN-utbetalningar.
- **LIA Compliance Matrix**: En helt ny administratörsvy (LIA Radar) för att hantera LIA-placeringar, handledare och MYH-krav (8-veckorsregeln), där saknade avtal, mitt- och slutbedömningar flaggas i realtid.
- **JobTech / Yrkesbarometern Integration**: Integrerat Arbetsförmedlingens öppna API:er direkt i kurs-skapandet. Administratörer får direkt regionalarbetsmarknadsdata och 1-årsprognos för valda SSYK-koder innan utbildningen skapas.

### v3.7.4 (8 mar 2026) – Mobil Build-stabilitet & Release Fix
- **📱 Android Release Fix**: Genomfört en komplett åtgärd för `:app:assembleRelease`. Implementerat en manuell `expo export:embed`-brygga i Gradle för att kringgå defekta interna bundling-skript.
- **🎨 Resurs-sanering**: Rensat dubbletter i mipmap-resurser (.png vs .webp) och lagat adaptiva ikoner (`ic_launcher.xml`) för att möjliggöra felfri AAPT-merging.
- **☕ Kotlin Modernisering**: Refaktorerat `MainApplication.kt` för att vara kompatibel med React Native 0.76 och Expo 52 (ny arkitektur).
- **🛠️ Miljö-anpassning**: Tvingat NDK `27.1.12297006` och Build Tools `35.0.0` för att hantera skrivrättigheter i SDK-mappen.
- **📝 Dokumentation**: Städat upp README och standardiserat språket till svenska.

### v3.7.3 (7 mar 2026) – Stabilitet & Integration
- **Nationell Integration (SUSA/JobEd)**: Implementerat Reverse Sync mot SUSA-navet (export) och utökat JobEd Connect till program-nivå.
- **ISP-Automation**: Möjliggjort direktimport av hela utbildningsprogram till individuella studieplaner.
- **Systemstabilitet**: Fixat CPU-spik i Video-tjänst och optimerat Keycloak-hälsa.
- **UI Design**: Förfinat kontrast i Sidebar (True Black) för bättre visuell separation.

### v3.7.2 (7 mar 2026) – Systemhärdning & UI Kontrast
- **🛡️ Systemstabilitet**: Fixat kritisk CPU-spik (331 %) i videotjänsten genom att implementera resursbegränsningar och korrekta hälsokontroller i Docker.
- **🐳 Orkestrering**: Uppdaterat `docker-compose.yml` med minnesgränser för alla mikrotjänster för att förhindra resursutmattning.
- **🔑 Keycloak Recovery**: Åtgärdat felaktiga hälsokontroller i Keycloak genom att växla till TCP-baserade sonder.
- **🎨 Sidebar-förfinig**: Justerat kontrasten i True Black-temat för bättre visuell separation.

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
- **Kursmaterial med DRM**: Restriktiva rättigheter kring delning och utskrift inbyggt direkt i LMS:et.
- **Yrkesbarometern & JobAd Enrichment (NLP)**: 5-årsprognoser per utbildning och AI-driven kompetensmatchning direkt mot annonser.
- **BankID & E-signering**: Automatiserade trepartsavtal för LIA och validering.
- **MYH Alumn-Tracker**: Automatiserad uppföljning av sysselsättningsgrad 6 månader efter examen.
- **AI Kompetensvalidering**: Automatisk NLP-matchning av CV mot Skolverkets kursmål.

### 🏛️ Strategic Enterprise Initiatives (Roadmap Q2-Q4 2026)
- **Ladok Sync Engine**: Direktöverföring av betyg från EduFlex till Ladok (Högskola/YH).
- **Skolfederation (SAML V2)**: Inbyggt stöd för nationell SSO-standard i kommunal sektor.
- **DOS-Lagen & EN 301 549**: Inbyggd tillgänglighetskontroll i kursbyggaren för 100% compliance.
- **AF Personal Data Gateway**: Automatisk verifiering av inskrivningsstatus via Arbetsförmedlingens API.
- **YH-flex Validering**: Modul för att korta studietid baserat på reell kompetens.

---

## 🏛 Systemarkitektur
EduFlex LLP drivs av en händelsedriven mikrotjänstarkitektur.
- **Frontend**: React 19, Vite, Tailwind CSS, i18next Localization.
- **Core Backend**: Spring Boot 3.4 (Java 21), Spring Security i18n, Hibernate 6.
- **Mikrotjänster**: SCORM, Notifications, PDF, Video, AI (FastAPI).

---

## 🚀 Kom igång (Snabbstart)

### Windows (Local-First / No Docker Bloat)
Dubbelklicka på **`scripts\powershell\LocalFix_Start.ps1`** (eller kör via PowerShell). Detta startar din lokala PostgreSQL 18, Redis och kör backend/frontend lokalt för max prestanda och noll disk-bloat.

### Windows (Full Stack / Docker)
Dubbelklicka på **`Start-EduFlex.bat`** i rotkatalogen. Det startar infrastrukturen i Docker (WSL) med log-rotation aktiverad (max 30MB loggar per tjänst).

### Linux / WSL
Kör följande kommando:
```bash
./start.sh
```

---

## 🗺 Roadmap (2026)
- [x] Schema-baserad Multi-Tenancy & Keycloak SSO
- [x] AI Compliance Portal & Audit Log
- [x] JobTech & CSN Integrationer
- [x] **v3.6.6: GDPR & Privacy Shield**
- [x] B2B E-handel & Reseller Engine
- [x] Händelsedriven mikrotjänstarkitektur & Redis Event Bus
- [x] Åtgärdat systeminstabilitet (Video-tjänst CPU-fix)
- [x] **v3.7.4: Android Build Fix & Bridge**
- [x] **v3.8.0: Enterprise Compliance & Automation Hub (ERP+)**
    - [x] CSN Autopilot (Kod 99/41/81) & "Ghosting Radar"
    - [x] LIA Compliance Radar (8-veckorsregeln)
    - [ ] AI Alumn-Tracker & Kompetensvalidering
    - [x] Yrkesbarometern & NLP Deep Match
- [x] **v3.9.0: Cloud-Native Kubernetes (K3s/Helm)**
- [x] **v3.9.1: Global Language Sync & Security Hardening**
- [x] **v3.9.2: Operation Globalization (Full System Localization)**
- [x] **v3.9.3: Performance Tuning & Repo Hardening (OnlyOffice Exclusions)**
- [ ] Q3 2026: React Native mobilapp med offline-sync.
- [x] Q4 2026: Nationell utbildningsintegration (SUSA-navet).

---

⚖ **Licens & Kontakt**  
EduFlex LLP™ © 2026 Alex Weström / Fenrir Studio  
Senast uppdaterad: 2026-03-18 (v3.9.3 - Performance & Repo Hardening)
