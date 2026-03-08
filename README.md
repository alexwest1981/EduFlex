# 🎓 EduFlex LLP v3.7.4
*Den kompletta Learning Lifecycle-plattformen för modern utbildning och B2B*

*Utvecklas & underhålls av **Alex Weström / Fenrir Studio***  
🇸🇪 Svenska | 🇬🇧 English

![EduFlex Architecture](https://img.shields.io/badge/Architecture-Event--Driven%20Microservices-blue)
![React Version](https://img.shields.io/badge/React-19-61dafb)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6db33f)
![Compliance](https://img.shields.io/badge/Compliance-GDPR%20%7C%20ISO%2027001%20Ready-success)

EduFlex LLP är ett enterprise-redo, molnbaserat ekosystem som ersätter traditionella, fragmenterade skol-it-miljöer (Canvas + Zoom + Moodle + Alvis). Genom en distribuerad mikrotjänstarkitektur, asynkron händelsebuss, svensk myndighetsintegration och marknadens första 100 % spårbara AI-motor, sänker EduFlex kundernas Total Cost of Ownership (TCO) drastiskt.

---

## 🚀 Senaste Uppdateringarna (Changelog)

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

### 1. Svensk Hyperlokalisering
- **EduCareer & JobEd Connect**: Inbyggd sökportal direktkopplad mot **Arbetsförmedlingens JobTech-API:er**.
- **CSN Rapportering Pro**: Automatiserad och exakt export enligt CSN:s krav.
- **Skolverket Sync 2.0 (SUSA-navet)**: Dynamisk import av programstrukturer baserat på SUN-koder.

### 2. Etisk & Spårbar AI (EduAI Hub)
- **AI Audit Log**: Full transparens för alla AI-beslut och prompter (GDPR/AI Act-kompatibel).
- **AI Resource Generator**: Skapar quiz och studiematerial direkt från PDF och video.

### 3. Integrerat Ekosystem
- **LiveKit Premium Video**: Inbyggda videomöten i hög kvalitet.
- **OnlyOffice Integration**: Kollaborativ dokumentredigering direkt i plattformen.

### 4. Enterprise Compliance & Automation (ERP+)
- **LIA Compliance Radar**: Automatisk 8-veckorsvarning för MYH-regelverket.
- **CSN Autopilot & "Ghosting Radar"**: Agerar på dolda avhopp och skickar händelsekoder (99/41/81) per automatik.
- **Yrkesbarometern & JobAd Enrichment (NLP)**: 5-årsprognoser per utbildning och AI-driven kompetensmatchning direkt mot annonser.
- **BankID & E-signering**: Automatiserade trepartsavtal för LIA och validering.
- **MYH Alumn-Tracker**: Automatiserad uppföljning av sysselsättningsgrad 6 månader efter examen.
- **AI Kompetensvalidering**: Automatisk NLP-matchning av CV mot Skolverkets kursmål.

---

## 🏛 Systemarkitektur
EduFlex LLP drivs av en händelsedriven mikrotjänstarkitektur.
- **Frontend**: React 19, Vite, Tailwind CSS.
- **Core Backend**: Spring Boot 3.4 (Java 21), Hibernate 6.
- **Mikrotjänster**: SCORM, Notifications, PDF, Video, AI (FastAPI).

---

## 🚀 Kom igång (Snabbstart)
```bash
docker compose up --build -d
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
- [ ] Q3 2026: React Native mobilapp med offline-sync.
- [x] Q4 2026: Nationell utbildningsintegration (SUSA-navet).

---

⚖ **Licens & Kontakt**  
EduFlex LLP™ © 2026 Alex Weström / Fenrir Studio  
Senast uppdaterad: 2026-03-08 (v3.8.0 - CSN Autopilot, LIA Radar & JobTech)
