# 🎓 EduFlex LLP v3.7.3
*The Complete Enterprise Learning Lifecycle Platform for Modern Education & B2B*

*Developed & maintained by **Alex Weström / Fenrir Studio***  
🇸🇪 Svenska | 🇬🇧 English

![EduFlex Architecture](https://img.shields.io/badge/Architecture-Event--Driven%20Microservices-blue)
![React Version](https://img.shields.io/badge/React-19-61dafb)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4-6db33f)
![Compliance](https://img.shields.io/badge/Compliance-GDPR%20%7C%20ISO%2027001%20Ready-success)

EduFlex LLP är ett Enterprise-redo, molnbaserat ekosystem som ersätter den traditionella, fragmenterade skol-it-miljön (Canvas + Zoom + Moodle + Alvis). Genom en distribuerad mikrotjänstarkitektur, asynkron händelsebuss, svensk myndighetsintegration och marknadens första 100 % spårbara AI-motor, sänker EduFlex kundernas Total Cost of Ownership (TCO) drastiskt.

---

## 🚀 Senaste Uppdateringarna (Changelog)

### v3.7.3 (7 mar 2026) – Stabilitet & Integration
- **Nationell Integration (SUSA/JobEd)**: Implementerat Reverse Sync mot SUSA-navet (export) och utökat JobEd Connect till program-nivå.
- **ISP-Automation**: Möjliggjort direktimport av hela utbildningsprogram till individuella studieplaner.
- **Systemstabilitet**: Fixat 331% CPU-spik i Video-tjänst och optimerat Keycloak-hälsa.
- **UI Design**: Förfinat kontrast i Sidebar (True Black) för bättre visuell separation.

### v3.7.2 (7 mar 2026) – Systemhärdning & UI Kontrast
* **🛡️ Systemstabilitet**: Fixat kritisk CPU-spik (331%) i videotjänsten genom att implementera resursbegränsningar och korrekta hälsokontroller i Docker.
* **🐳 Orkestrering**: Uppdaterat `docker-compose.yml` med minnesgränser för alla mikrotjänster för att förhindra resursutmattning och "Bad Gateway"-fel.
* **🔑 Keycloak Recovery**: Åtgärdat felaktiga hälsokontroller i Keycloak som blockerade systemets startsekvens genom att växla till TCP-baserade sonder.
* **🎨 Sidebar Refinement**: Justerat kontrasten mellan Sidebar-rail och navigeringspanelen för bättre visuell separation och ett mer premium utseende i True Black-temat.

### v3.7.1 (7 mar 2026) – Admin Suite Refactor & Health Check Fix
* **🖤 Extended True Black Refactor**: Completed the systematic refactor of the remaining administration sub-modules. `AdminShopDashboard.jsx`, `ShopItemEditor.jsx`, `CommunityAdmin.jsx`, `AdminTicketManager.jsx`, and `SupportArticleManager.jsx` are now 100% compliant with the "True Black" (#000000) high-contrast theme.
* **🏥 Service Health Fix**: Resolved an issue in the Control Center (`DeployPanel.jsx`) where services would incorrectly show as "Offline" despite being active. Added JWT Bearer authentication to health check probes and improved actuator response parsing for Backend and Redis.
* **✨ UI/UX Polishing**: Replaced all hardcoded colors with CSS variables across the administration panel to ensure perfect consistency and a premium feel.

### v3.7.1 (7 mar 2026) – Infrastructure UI Hardening
* **🖤 True Black Design System**: Commenced the systematic refactor of the administration suite. `SystemSettings.jsx`, `AdministrationPanel.jsx`, and `DeployPanel.jsx` (EduFlex Ops) are now 100% compliant with the "True Black" (#000000) high-contrast theme.

### v3.7.0 (6 mar 2026) – SUSA-navet Integration & Utbildningsnavet (LLP v1)
* **🏫 SUSA-navet Live-integration**: Admin kan nu hämta nationellt godkända YH-program direkt från Skolverkets SusaNav REST-API via en SUN-kod (t.ex. `481a`). Systemet skapar automatiskt kursstruktur med moduler, LIA-flagga och kursplaner baserade på officiell data.
* **📚 Utbildningskatalog (`/programs`)**: Ny sida i sidomenyn – "Utbildningar" – med globövergång från LMS till LLP (Learning Lifecycle Platform). Studenter, sökande och SYV kan bläddra bland nationellt importerade program, filtrera på LIA-innehåll och ansöka direkt.

---

## ✨ Huvudfunktioner & Unika Vallgravar

### 1. Svensk Hyperlokalisering (The Category Killer)
* **EduCareer Portal & JobEd Connect:** Inbyggd sökportal direktkopplad mot **Arbetsförmedlingens JobTech API:er**. AI analyserar studentens kognitiva radar och matchar live mot LIA/praktikplatser.
* **CSN Rapportering Pro:** Automatiserad XML/Excel-export enligt CSN:s exakta krav.
* **Utökad Skolverket Sync 2.0 (SUSA-navet):** Importerar och bygger branschspecifika mallar/programstrukturer dynamiskt baserat på SUN-koder.

### 2. Etisk & Spårbar AI (EduAI Hub)
* **AI Audit Log (Compliance Portal):** Varje enskilt AI-beslut och prompt loggas för 100 % transparens (GDPR/AI Act).
* **AI Resource Generator:** Skapar quiz och studiepass direkt från PDF/Video.

### 3. Inbyggt Ekosystem & "Zero-TCO"
* **LiveKit Premium Video:** Inbyggda videomöten.
* **OnlyOffice Integration:** Kollaborativ dokumentredigering.

---

## 🏛 Systemarkitektur
EduFlex LLP drivs av en händelsedriven mikrotjänstarkitektur.
* **Frontend:** React 19, Vite, Tailwind CSS.
* **Core Backend:** Spring Boot 3.4 (Java 21), Hibernate 6.
* **Microservices:** SCORM, Notifications, PDF, Video, AI (FastAPI).

---

## 🚀 Kom igång (Snabbstart)
```bash
docker compose up --build -d
```

---

## 🗺 Roadmap (Q2 - Q4 2026)
- [x] Schema-baserad Multi-Tenancy & Keycloak SSO
- [x] AI Compliance Portal & Audit Log
- [x] JobTech & CSN Integrationer
- [x] **v3.6.6: GDPR & Privacy Shield**
- [x] B2B E-commerce & Reseller Engine
- [x] Event-Driven Microservices & Redis Event Bus
- [x] Addressing System Instability (Video Service CPU Fix & Healthchecks)
- [/] Q3 2026: React Native Mobile App med Offline-sync.
- [x] Q4 2026: Nationell Utbildningsintegration (SUSA-navet & JobEd Connect).

---

⚖ License & Contact
EduFlex LLP™ © 2026 Alex Weström / Fenrir Studio
Last updated: 2026-03-07 (v3.7.3 - Stability & Sidebar Contrast)
