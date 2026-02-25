# 🚀 EduFlex Roadmap: Vision 2026

**Mål:** Pilot-klar för 3–5 svenska kommuner/universitet till juni 2026, med fokus på integrationer, support och referenser för att adressera dealbreakers.

---

## 🚀 Roadmap: v2.4–3.0 (Mars–Juni 2026)

### Mars 2026: Dealbreakers – Pilot-Ready (Fokus: Sälja nu!)
| Prioritet | Funktion | Beskrivning | Ansträngning | Varför |
| :--- | :--- | :--- | :--- | :--- |
| **Hög** | **Integrations Guide + 5 core** | LTI 1.3 (AGS/NRPS), Zoom/Teams, Skolverket batch, SIS CSV-import, Bibliotekssökning + Integration Hub admin-portal. | ✅ **Klar** (v3.0.0) | Kritiskt: "Plug-and-play". |
| **Hög** | **Svensk Support Portal** | SLA, FAQ, video-guides, chat-widget, forum. | ✅ **Klar** | Kritiskt: Skalbar support. |
| **Hög** | **Pilot Kit** | Demo-data, onboarding-wizard, "EduFlex vs Canvas"-whitepaper. | ✅ **Klar** | Kritiskt: Referenser. |
...
| **Fas 2** | **Multi-Channel Notiser** | E-post, SMS, Push (PWA) | ✅ **Klar** (v3.0.0) | Sömlös kommunikation. |
| **Medel** | **Subscriptions Polish** | Auto-invoicing, tier-lås. | ✅ **Klar** | Revenue-ready. |

**Milstolpe:** Första pilot-pitch (t.ex. Falu/Botkyrka) – slutet av mars.

---

### April 2026: Revenue & AI-Differentiator
| Prioritet | Funktion | Beskrivning | Ansträngning | Varför |
| :--- | :--- | :--- | :--- | :--- |
| **Hög** | **Role-Specific AI Coaches** | Principal (KPI), Teacher (risk-warning), Student (study-plan). | ✅ **Klar** | Killer-feature: Unik selling point. |
| **Hög** | **CSN/Upphandlings-rapporter** | Närvaro-export (enskild + bulk), Excel (.xlsx), GDPR Art. 15 registerutdrag, läraråtkomst. | ✅ **Klar** (v3.0.0) | Svenskt krav. |
| **Medel** | **Partner Program** | Resellers (Edtech Studios), affiliate. | 5 dagar | Scale via partners. |
| **Låg** | **Microservices Scale** | Load-test PDF/video (verifiera befintlig implementation). | 2 dagar | Verify. |

**Milstolpe:** Första betalande kund + Kubernetes-deploy (Helm).

---

### April–Maj 2026: Enterprise Security & Compliance (Fokus: Kommuner & Universitet)
| Prioritet | Funktion | Beskrivning | Ansträngning | Varför |
| :--- | :--- | :--- | :--- | :--- |
| **Hög** | **Security Hardening (ISO 27001)** | AES-256 kryptering (resten av PII), MFA stöd, Security Headers (CSP). | ✅ **Klar** (v3.2.0) | Kritiskt för offentlig sektor. |
| **Hög** | **Enhanced Audit Logs** | Global administrativ audit-log (vem gjorde vad, när). GDPR-spårbarhet för all dataåtkomst. | ✅ **Klar** | Compliance-krav. |
| **Medel** | **MFA (Multi-Factor Auth)** | Stöd för TOTP (Google Authenticator) vid admin-inloggning. | ✅ **Klar** | Högre säkerhetskrav. |
| **Medel** | **xAPI/SCORM 2.0** | Full import + State API (suspend_data) för persistens. | ✅ **Klar** (v3.2.0) | Legacy-innehåll. |

**Milstolpe:** Slutförd extern säkerhetsrevision + Pilot-deploy hos kommunal kund.

---

### Maj–Juni 2026: Skalbarhet & ISP AI (v3.3.0)
| Prioritet | Funktion | Beskrivning | Ansträngning | Varför |
| :--- | :--- | :--- | :--- | :--- |
| **Hög** | **Next-Gen ISP (AI & PDF)** | AI-kursförslag via Gemini, Komvux-PDF export, poäng-visualisering. | ✅ **Klar** (v3.3.0) | Kritiskt för SYV-arbetet. |
| **Hög** | **Scalability Engine (v1.0)** | Implementera formell Event Bus (Redis/Kafka) för cross-service kommunikation. | ✅ **Klar** (v3.3.0) | Hantera 100+ skolor synkront. |
| **Hög** | **Kubernetes Production** | Helm-charts, HPA och autoscaling för enterprise-noder. | ✅ **Klar** (v3.3.1) | Skalbarhet för 500+ användare. |
| **Medel** | **Pilot Kit & Pricing** | Whitepaper, prissida och pitch-material för Borås Ink. | ✅ **Klar** (v3.3.1) | Kommersialisering. |
| **Hög** | **EduAI Hub Refinement** | Refinement av kategori-mappning, Spaced Repetition-integration och Live Radar precision. | ✅ **Klar** | Förbättrad kognitiv profilering. |
| **Hög** | **EduCareer Portal** | Integration med JobTech APIs för lokaliserad LIA-sökning och AI-matchning. | ✅ **Klar** | Studenternas karriärstöd. |
| **Hög** | **AI Tutor 2.0 (Video)** | Automatisk generering av förklaringsvideor via Gemini-script & FFMPEG. | [/] **Pågår** | Nästa generations lärande. |
| **Medel** | **Mobile Hybrid (Expo)** | Förberedelse för Native App Store-wrapper. | 10 dagar | "Check-in-the-box" för IT. |

---

## 🧠 Kategori 1: AI & Agentisk Arkitektur
*Marknaden 2026 kräver att AI inte bara är en "add-on" utan motorn i systemet.*

| Funktion | Beskrivning | Status | Mål / Outcome |
| :--- | :--- | :--- | :--- |
| **Generativt Författande (Quiz)** | Skapa quiz från PDF/Text. | ✅ **Klar** | **-70%** tid på provkonstruktion. |
| **Generativt Författande (Kurser)** | "One-click course creation". Ladda upp PDF/PPT/Video och låt systemet generera kursstruktur, sammanfattningar och quiz automatiskt. | ✅ **Stabil** (V1) | Snabbare onboarding av nytt innehåll. |
| **AI-Tutor & Copilot** | En inbyggd chattbot som svarar på elevers frågor baserat enbart på kursmaterialet (RAG). Rollspelspartner för träning. | ✅ **Klar** (V1) | **+25%** tillgängligt stöd för elever. |
| **MCP-Server** | Gör EduFlex tillgängligt för externa AI-agenter (Model Context Protocol). | ✅ **Klar** (V1) | Framtidssäkrad integration. |
| **Prediktiv Personalisering** | Analyserar beteendedata för att identifiera "at-risk"-studenter och rekommenderar stödmateri | ✅ **Klar** | **v2.7.0** | Identifiera risker **2 veckor** tidigare.|
| Fas 2 | **Rollspecifika AI-coacher** | Rektor & Mentorsstöd | Stable/Completed (Phase 2) | Datadrivna beslut på alla nivåer. |
| Fas 3 | **SKA-motor 2.0** | Planering/Uppföljning | Stable/Completed (Phase 3) | **100%** digitalt SKA-årshjul. |
| **Adaptive Learning Flow** | Elev-anpassning | ✅ **Stabil / Verifierad** | **+15%** högre genomströmning. |
| **EduFlex Control Center v4.0** | Centraliserad drift & loggning. | ✅ **Stabil / Verifierad** | **-50%** tid på felsökning & drift. |
| :--- | :--- | :--- |
| **LTI 1.3 Core** | Grundläggande launch-stöd för externa verktyg. | ✅ **Klar** | Sömlös verktygsinterop. |
| **LTI 1.3 Advantage** | Stöd för AGS (Betyg) och NRPS (Roller/Namn). | ✅ **Stabil / Verifierad** | Automatiserad administration. |
| **AI Audit Log** | Full spårbarhet av alla AI-beslut och rekommendationer för compliance och debugging. | ✅ **Klar** | **100%** transparens (XAI). |
| **Exam Integrity Pro** | Realtidsvideo övervakning och AI-baserad integritetskontroll för tentamen. | ✅ **Klar** | **v3.0.0** | Förbättrad rättssäkerhet vid distansprov. |
| **AI Credit Enforcement** | Tier-baserad åtkomstkontroll (BASIC/PRO/ENTERPRISE) och automatisk provisioning. | ✅ **Klar** | **v2.9.7** |
| **xAPI & cmi5** | Modern spårning (LRS) för mobilt lärande och simuleringar. | ✅ **Verifierad** | Nästa generations analys. |
| **Skills Gap Analysis** | Visualisering av kompetensluckor och progress (Radar charts). | ✅ **Klar** | **v2.5.0** |
| **EduAI Center v2.0** | AI-driven studiehub (Spaced Repetition, AI Coach, Mini-Games). | ✅ **Klar** | **v2.1.0** |
| **Workflow Integration** | Utbildning direkt i Slack/Teams/Salesforce ("Headless LMS"). | ✅ **Stabil / Verifierad** |
| **Social Gamification** | Ligor & Kollektiva klassmål utan individuella rankningar. | ✅ **Klar** | **v2.8.0** |

---

## 👥 Kategori 3: Användarupplevelse & Engagemang
*Fokus på "Learning Experience" (LXP) snarare än administration.*

| Funktion | Beskrivning | Status | Mål / Outcome |
| :--- | :--- | :--- | :--- |
| **Socialt Lärande (Basic)** | Community Hub / Marketplace. | ✅ **Klar** | Ökad kunskapsdelning (Peer-to-Peer). |
| **Socialt Lärande (Avancerat)** | P2P-delning, kommentarer i kurser, "YouTube for Learning". | ✅ **Stabil** (V1) | Högre engagemang i kursmaterialet. |
| **Gamification (Basic)** | XP, Levlar, Badges, Streaks. | ✅ **Klar** | **+40%** daglig aktivitet. |
| **EduGame Expansion** | Shop för profil-teman, Sociala Streaks, "Buddy"-system. | ✅ **Stabil** (V1) | Långsiktigt kvarhållande (Retention). |
| **Mobil-först** | Responsiv webbdesign. | ✅ **Klar** | Tillgängligt lärande var som helst. |
| **Media Streaming** | Stabil synkroniserad ljudboksuppspelning med Range-stöd. | ✅ **Klar** | Multimodalt lärande på språng. |
| **Offline-läge / PWA** | Installera som app, cachar app-shell för snabbare laddning. Officiell EduFlex-branding med korrekt manifest och service worker. | ✅ **Klar** | Lärande utan gränser. |

---

## 📊 Kategori 4: Analys & Affärsnytta
*Från att mäta "Completion" till att mäta "ROI".*

| Funktion | Beskrivning | Status |
| :--- | :--- | :--- |
| **Kursutvärdering & Insikter** | Komplett system för kurskvalitet, automatiserade studentnotiser och AI-analys av fritextsvar. | ✅ **Klar** |
| **Enkätsystem (Elevhälsa)** | Dynamiska enkäter med 4 frågetyper, massdistribution per roll, intern notifiering och statistikaggregering. | ✅ **Klar** |
| **Skills Gap Analysis** | Visualisera kompetensluckor baserat på quiz/profiler (Radar charts). | ✅ **Klar** |
| **ROI-rapportering** | Koppla utbildning till affärsdata och Mastery Scores. | ✅ **Klar** |

---

## 🛡️ Kategori 5: Infrastruktur & Säkerhet
*Teknisk ryggrad och skydd av användardata.*

| Funktion | Beskrivning | Status | Mål / Outcome |
| :--- | :--- | :--- | :--- |
| **Advanced Security** | Domän-låsning, AES-256 GCM kryptering (PII) och Rate-limiting. | ✅ **Klar** | Högsta dataskyddsnivå (GDPR). |
| **Unified Storage** | MinIO standalone restoration & auto-bucket sync. | ✅ **Klar** | Noll dataförlust & hög tillgänglighet. |
| **CI/CD Pipeline** | Fullt automatiserade tester och deployment. | 📅 **Planerad** | Snabbare time-to-market. |
| **Kubernetes Migration** | Helm-charts för skalbarhet. | 📅 **Planerad** | Oändlig skalbarhet (Cloud-native). |
| **Live Classrooms** | LiveKit-powered video conferencing with scheduling, background blur, and glassmorphic UI. | ✅ **Klar** | **+20%** engagemang i distansundervisning. |
| **Rektorspaket (Mission Control)** | Komplett skolledningslager: Organisationshierarki, Dashboard för nyckeltal (8 realtids-KPIer), Incidenthantering, Elevhälsa och Masskommunikation. | ✅ **Klar** | **Mission Control** för hela verksamheten. |
| **PDF Whitelabeling** | Visuell editor för certifikat- och betygsmallar. Ladda upp logotyp, bakgrundsbild, konfigurera färger, texter, QR-position och layout. Live-förhandsvisning. | ✅ **Klar** | Professionell visuell identitet. |
| **Sjukanmälan** | Komplett sjukanmälningssystem med statusuppdateringar, mentorsnotifieringar och historikspårning. | ✅ **Klar** | **-30%** adm-mail från vårdnadshavare. |

---

### [v3.0.0] - 2026-02-24
- **New Feature**: **Exam Integrity Pro**.
  - **Proctoring**: Real-time video proctoring with LiveKit integration.
  - **Enforcement**: Automated "Clear Video" enforcement (disables background blur/effects).
  - **Dashboard**: New "Tentamensvakt Pro" teacher dashboard with live video grid and WebSocket alerts.
  - **Security**: Granular participant grants and encrypted event logging.
- **New Feature**: **Student Activity Tracking (CSN-förberedelse)**.
  - **DTO**: Utökat `UserSummaryDTO` med `lastLogin`, `lastActive` och `activeMinutes`.
  - **Mappning**: `CourseService.convertToDTO()` mappar nu aktivitetsdata korrekt.
  - **Risknivå**: Lärarens dashboard visar "Dagar sedan inloggning" och "Risknivå" baserat på live-data.
- **Bug Fix**: Resolved 500 Error in Quiz fetching (V83: missing `difficulty` column).
- **Bug Fix**: Resolved 500 Error in Student Analytics (V84: missing `teacher_feedback` and `answer_feedback_json` columns).
- **Bug Fix**: Added missing `/api/quizzes/{id}/results` endpoint in `QuizController`.
- **Bug Fix**: Resolved `ReferenceError: useState is not defined` in `UpcomingExamAlert.jsx`.
- **Bug Fix**: Fixed dual active states in `SidebarSection.jsx` navigation highlighting.
- **Enhancement**: Synced `TeacherDashboard` tabs with URL query parameters for consistent navigation.

### [v2.9.7] - 2026-02-23
- **New Feature**: **AI Credit Enforcement & Tier Control**.
- **Backend**: Tier-aware validation in `AiCreditService` and `GeminiService`.
- **Provisioning**: Auto-initialization of 1,000 credits for PRO users; Unlimited for Enterprise.
- **Frontend**: Context-driven feature toggling in Sidebar, Dashboard, and CourseDetail.
- **Security**: Route protection in `App.jsx` for unlicensed tiers.

### [v2.8.5] - 2026-02-22
- **Refactoring**: **Gamification Admin Relocation**.
- **Consolidation**: Moved detailed settings (XP, AI Credits, Toggles) from System Settings to the Gamification Admin dashboard.
- **Backend**: New endpoints for global gamification config and EduAI Hub settings.
- **UX**: Unified administrative workspace for all gamification features.

### [v2.8.0] - 2026-02-22
- **New Feature**: **Social Gamification (Leagues & Class Goals)**.
- **Leagues**: 5 levels (Bronze, Silver, Gold, Platinum, Ruby) based on XP.
- **Class Goals**: Collective progress tracking for shared rewards ("Class Pride").
- **Safety**: Designed to hide individual ranks to prevent bullying.
- **UI**: Added animated Glassmorphic widgets to the Student Dashboard.

### [v2.7.0] - 2026-02-22
- **New Feature**: **Predictive AI Analysis (At-Risk Early Warning)**.
- **AI Engine**: Integrated Google Gemini for proactive risk scoring based on Mastery, Activity, and Quiz Trends.
- **Dashboard**: Advanced color-coded "Early Warning" panel on the Teacher Mission Control.
- **Actionable Insights**: AI-generated "Risk Reasons" providing pedagogical context for teachers.
- **Resilience**: Implemented manual threshold fallback for offline/failover support.

### [v2.6.0] - 2026-02-22
- **New Feature**: **Slack Dynamic Integration**.
- **Slash Commands**: Rebuilt `/eduflex kurser` to fetch real-time active course data from the database.
- **Security**: Whitelisted Slack webhooks in `SecurityConfig` for seamless external communication.
- **Stability**: Refactored `CourseRepository` and `SlackIntegrationService` for robust data fetching.

### [v2.5.0] - 2026-02-21
- **New Feature**: **Skills Gap Analysis - Live Integration**.
- **Radar Charts**: Dynamic visualization of Student vs. Target skill levels per category.
- **AI Insights**: Google Gemini analyzes skill gaps and generates actionable learning recommendations.
- **Teacher Dashboard**: Heatmaps representing the average skill gaps across an entire class/course.
- **Data Persistence**: Student skill levels dynamically update based on their performance in AI Sessions and Quizzes.

### [v2.4.0] - 2026-02-21
- **New Feature**: **ROI Reporting Engine**.
- **Correlation**: Link AI Session Mastery scores with Business Outcomes (KPIs).
- **Visualization**: New `RoiDashboard` with interactive Scatter Charts.
- **Insights**: AI-powered ROI analysis via Google Gemini.
- **Export**: Full support for Excel, CSV, XML, and JSON data exports.

### [v2.3.0] - 2026-02-21
- **New Feature**: **Interactive AI Study Sessions & Recommendations**.
- **Wizard**: 5-step wizard in `HubReviewDeck` for generating study material and quizzes.
- **Persistence**: Permanent storage of session results in `ai_session_results`.
- **Analytics**: Integrated AI sessions into Live Radar and Mastery Score calculations.
- **AI Engine**: New **Recommendation Engine** for proactive gap analysis.
- **UI/UX**: Premium Landing Page Hero and Dagens Rekommendation component.
- **Bug Fixes**: Fixed several JavaScript and backend errors related to session completion and XP syncing.

### [v2.2.0] - 2026-02-20
- **New Feature**: **Intelligence Center Merger**.
- **Consolidation**: Merged legacy EduAI into the unified EduAI Hub.
- **Mini-Games**: Fully functional **Memory Match** and **Time Attack** using live student data.
- **Live Analytics**: Dynamic SVG Radar Chart and SM-2 based Mastery Score calculation.
- **UI/UX**: Tabbed Hub interface for Review, Games, and Quests.
- **Clean Up**: Removed legacy EduAI dashboard tab to avoid redundancy.

### [v2.1.0] - 2026-02-20
- **New Feature**: **EduAI Hub v2.1 & Intelligence Center**.
- **Spaced Repetition**: Implemented SM-2 algorithm for Knowledge Fragments.
- **AI Credit System**: New economy system with Balance tracking and Transaction logs.
- **Admin Controls**: Centralized AI settings for XP ratios, credit earn rates, and coach proactivity.
- **UI/UX**: Created glassmorphic `HubReviewDeck` and interactive `IntelligenceBar`.
- **Gamification**: Integrated AI Credits with Daily Review quality scores.
- **Stability**: Fixed critical backend lint errors in `LiveLessonController`, `SystemSettingController`, and `EduAiHubController`.

### [v2.0.22] - 2026-02-20
- **New Feature**: **Collaborative Document Editing (OnlyOffice Fix)**.
- **Support**: Resolved persistent SSL protocol errors and Mixed Content warnings by forcing HTTPS proxy headers.
- **Security**: Fixed JWT signature validation mismatches.
- **Storage**: Implemented smart path-stripping and recursive folder fallback in `MinioStorageService` for document recovery.
- **Infra**: Upgraded OnlyOffice memory limits to 4GB and fixed Flyway pluralization bugs.

### [v2.0.21] - 2026-02-19
- **New Feature**: **Premium Video Infrastructure (LiveKit integration)**.
- **Engine**: Replaced legacy Jitsi with high-performance **LiveKit** engine.
- **Premium Video**: Implemented **Background Blur** (Zoom-style) using `@livekit/track-processors`.
- **UI/UX**: New glassmorphic meeting interface with functional side panels for Chat, Participants, and Settings.
- **Layout**: Optimized video grid and control bar accessibility for all screen sizes.
- **Stability**: Fixed token generation and Flyway migration issues.

### [v2.0.19] - 2026-02-17
- **New Feature**: **EduFlex Control Center v4.0** – A complete technical management portal.
- **Service Manager**: Real-time polling and control of all system services.
- **Log Viewer**: High-performance streaming logs with search and styling.
- **Database Tools**: Integrated SQL runner and backup management.
- **Dashboard**: Visual KPI health check for system administrators.

### [v2.0.18] - 2026-02-17
- **New Feature**: **Whitelabel Text & Messages** – Centralized management for brand names, welcome messages, and footer text.
- **New Feature**: **Advanced CSS Editor** – Real-time CSS editor for deep visual customization with CSS variable support.
- **Improvement**: **PWA & Mobile Consolidation** – Unified branding experience by merging PWA and mobile theme settings.
- **Performance**: **Client-side Image Resizing** – Automatic icon optimization (192x192, 512x512) using Canvas API for PWA compliance.
- **Stability**: **Branding Resilience** – Fixed 500 errors in icon storage with defensive JSON handling and enhanced MinIO logging.
- **Versioning**: **Application-wide Update** – Synchronized version number to **v2.0.18** across all sidebars and UI layouts.

### [v1.3.1] - 2026-02-16
- **Fix**: **PWA Build Crash** - Resolved critical `vite-plugin-pwa` crash caused by Workbox scanning the 210MB gamification folder. Optimized glob patterns, exclusions, and raised size limit to 5MB.
- **Fix**: **React 19 Hook Crash** - Migrated `usePwaInstall.js` from `React.useState` to named imports to fix null default export in React 19.
- **Fix**: **Manifest Syntax Error** - Removed duplicate `<link rel="manifest">` tag from `index.html` that conflicted with vite-plugin-pwa's automatic injection.
- **Branding**: **Official PWA Icons** - All PWA icons (192x192, 512x512, apple-touch-icon) and favicon now use the official EduFlex logo.
- **DX**: **Dev Mode PWA** - Enabled `devOptions.enabled: true` for local PWA testing during development.

### [v1.3.0] - 2026-02-16
- **New Feature**: **Guardian Dashboard 3.0** - Full release with AI-driven child status reports and direct sick leave reporting.
- **Resilience**: **Storage Lazy Sync** - Adaptive 404 recovery mechanism between local storage and MinIO S3.
- **Fix**: **Branding Lockdown** - Resolved persistent favicon 404s by purging broken DB references and standardizing fallback logic.
- **Improvement**: **Controller Consolidation** - Merged redundant Guardian controllers for better startup stability and performance.
- **UX**: **Persona-Based Docs** - Introduced role-specific entry points in documentation for Principals, Teachers, and IT.

### [v1.1.2] - 2026-02-14
- **New Feature**: **Min Lärväg (Adaptive Learning)** - AI-driven analys av studentens inlärningsstil (VAK: Visuell, Auditiv, Kinestetisk) och studietakt.
- **New Feature**: **AI Rekommendationer** - Personliga åtgärdsförslag baserat på prestation och beteende.
- **Dashboard**: Ny student-vy med Radar-diagram och statusindikatorer för studietakt.
- **Backend**: Implementering av `AdaptiveLearningService` med koppling till Google Gemini för analys.

### [v1.1.0] - 2026-02-14
- **Platform Recovery**: **Native Mode Transition** - Fully bypassed Docker Desktop API issues by pivoting to host-based services (PostgreSQL 5432, Redis 6379, Standalone MinIO).
- **Connectivity**: **Cloudflare Tunnel Restoration** - Fixed 502 errors and restored public access to `www.eduflexlms.se`.
- **Backend Fix**: Resolved API mapping conflict in `GuardianController` causing startup failure.
- **Privacy & Security**: **E-hälsa Visibility Refinement** - Strictly restricted internal health dashboards for specific roles (HALSOTEAM) while maintaining student/admin wellbeing access.
- **Storage**: **MinIO & Profile Restoration** - Initialized standalone MinIO with correct credentials and synchronized legacy `uploads/` data, fixing profile picture 404s and upload failures.

### [v1.0.9] - 2026-02-14
- **System Restoration**: **Full Service Stack** - Reactivated OnlyOffice and Jitsi after stability fixes.
- **Docker**: Resolved "Connection refused" errors by decoupling backend startup.
- **Stability**: Full microservice integration restored.

### [v1.0.8] - 2026-02-13
- **New Feature**: **SKA Motor** - Systematic Quality Work engine for Principals.
- **SKA**: Added Goals, Indicators, Year Cycle visualization, and AI-driven reports.
- **Dashboard**: Integrated SKA tools into the Principal Mission Control.

### [v1.0.6 ~ v1.0.7] - 2026-02-13
- **AI**: Role-specific AI Coachers and Predictive Risk Model (Phase 1 & 2).

### [v1.0.5] - 2026-02-13
- **New Feature**: **AI Management Reports** - Automated deep-dive reports with long-term data snapshots and role-based archival.
- **New Feature**: **Skolverket Sync 2.0** - Full refactoring and batch-sync capabilities. Admins can now update the entire course catalog with official data in one click.
- **Engagement**: **Gamification Expansion** - XP rewards integrated for AI Tutor chat, lesson views, video playbacks, and file downloads.
- **Fix**: **Activity Log Resilience** - Resolved database constraint errors and expanded activity tracking to support all core student interactions.
- **Improvement**: **Dashboard Sync** - Fixed sidebar visibility for Principals and corrected tab-aware navigation.

### [v1.0.4] - 2026-02-12
- **New Feature**: **Survey Notification Widget** - Realtidsaviseringar för elever, lärare och mentorer om väntande enkäter direkt på deras dashboards.
- **Optimization**: Förbättrad datahämtning för `SurveyDistribution` med unifierade ID:n för enklare navigering och felhantering.
- **Frontend**: Integrerat `SurveyNotificationWidget` i samtliga elev- och lärardashboards.

### [v1.0.3] - 2026-02-11
- **New Feature**: **PDF Template Editor (Whitelabel)** - Visuell editor i Admin → Utseende för att anpassa certifikat- och betygsmallar. Stöd för logotyp, bakgrundsbild, färger, texter, QR-kodposition, orientering och fontstorlekar med live-förhandsvisning.
- **New Feature**: **Enkätsystem (Elevhälsa)** - Skapa dynamiska enkäter med 4 frågetyper (fritext, betyg, flerval, ja/nej). Massdistribution per roll med automatisk notifiering via internmeddelanden. Komplett statistikvy med aggregerade resultat.
- **New Feature**: **Sjukanmälan** - Elever kan sjukanmäla sig digitalt. Mentorer får automatisk notifiering. Historikspårning och statushantering (sjuk, frisk, pågående).
- **Backend**: Ny `PdfTemplate`-modell med migration, repository, service och REST-controller för mallhantering.
- **Backend**: `CertificateService` och `AutoDocumentService` läser nu från konfigurerbara mallar istället för hårdkodade värden.
- **Backend**: Dynamisk QR-kodpositionering (4 positioner) i genererade PDF:er.
- **Frontend**: Ny `PdfTemplateEditor.jsx` med drag-and-drop bilduppladdning, färgväljare, textinställningar och CSS-baserad live-förhandsvisning.
- **Frontend**: Ny elevhälsa-modul med enkäthantering och sjukanmälan.

### [v1.0.2] - 2026-02-11
- **New Feature**: **Principal Mission Control (Final)** - Refactored dashboard with 100% live data, dynamic initials, and "System Intelligence" bar.
- **New Feature**: **School Structure Management** - Complete system for creating departments, programs, and classes with optimized mentor assignment.
- **Stability**: Resolved all legacy 404 console errors for `RektorLanding` and redundant components.
- **Design**: Completed the comprehensive specification for the upcoming **Guardian Dashboard**.

### [v1.0.1] - 2026-02-10
- **New Feature**: **Rich Course Management** - Manual course creation now integrates directly with Skolverket data.
- **Frontend**: Integrated `SkolverketCourseSelector` into the "New Course" form for easy data fetching.
- **Backend**: Enhanced `CourseService` to automatically sync descriptions, central content, and grading criteria when a course code is linked.
- **Enrichment**: Support for automatic enrichment via course code for manual entries without a direct Skolverket ID.

### [v1.0.0] - 2026-02-09
- **New Feature**: **Rektorspaket (Phase 6)** - Full launch of the "Mission Control" Dashboard.
- **New Feature**: Added 8 real-time KPIs and inline drill-down capabilities for school leadership.
- **Backend**: New entities for `ElevhalsaCase` and `SchoolFee`.
- **Backend**: Real-time manning overview and unmanned lesson tracking.
- **UI**: High-density action-oriented landing page for principals.

### [v0.9.12] - 2026-02-09
- **Social Learning**: Full launch of **Contextual Comments** for lessons and courses with real-time support.
- **Social Learning**: Resolved 500 errors and proxy conflicts for `/ws-social` endpoints.
- **Security**: Hardened WebSocket access controls in `SecurityConfig.java`.
- **System**: Fixed `spring-boot-maven-plugin` versioning issues in `pom.xml`.

### [v0.9.11] - 2026-02-08
- **Social Learning**: Implemented **Contextual Comments** for lessons and courses.
- **Social Learning**: Added **Like/Heart** functionality for comments.
- **Social Learning**: Integrated **User Avatars** with profile pictures in comment threads.
- **Fix**: Resolved 404 errors for MinIO assets by auto-redirecting `/api/storage` to `/api/files`.
- **Fix**: Fixed `UserAvatar` sizing issues in comment section.

### [v0.9.10] - 2026-02-08
- **Gamification 2.0**: Full launch of Shop, Inventory, Profile Themes, and Social Streaks.
- **Admin**: New "Gamification Management" workspace for creating items and uploading assets.
- **Ebook**: Fixed "Split-brain" storage bug causing 404s. Backend now forces usage of correct MinIO bucket.
- **Ebook**: Implemented **Automated Cover Extraction** for PDFs/EPUBs upon upload.
- **Ebook**: Fixed `about:srcdoc` sandbox error in EpubViewer.
- **System**: Added automated Database Backups in Docker with download capability.

### [v0.9.9] - 2026-02-07
- **LTI**: Successfully verified LTI 1.3 Advantage E2E flow with account provisioning and course enrollment.
- **LTI**: Fixed circular dependency in `LtiService` using `@Lazy` injection.
- **LTI**: Resolved `@EntityGraph` filtering issue by ensuring teacher assignments for courses.
- **Infra**: Switched Docker DB mapping to port 5433 to resolve conflicts with local PostgreSQL processes.
- **xAPI**: Implemented LRS proxy endpoints for cmi5 status updates and statement propagation.

### [v0.9.8] - 2026-02-06
- **Media**: Implemented HTTP Range support in `StorageController` for seamless audio streaming.
- **Media**: Refactored `FloatingAudioPlayer` to use a unified persistent `<audio>` element, fixing AbortErrors during minimization.
- **UX**: Added manual audio regeneration flow for missing assets.
- **Stability**: Fixed "Rules of Hooks" violation and improved player error handling.

### [v0.9.7] - 2026-02-04
- **New Feature**: Restored and renamed **Quiz Generator** for random question bank selection.
- **UX**: Complete redesign of **Community Publishing Modal** with 4 entry types.
- **UI**: Fixed responsiveness and layout regressions in the Quiz Module.
- **Fix**: Enhanced lesson discovery by aggregating standard and AI-generated lessons.
- **Hotfix**: Improved Jitsi stability by disabling P2P and forcing WebSockets.

### [v0.9.6] - 2026-02-03
- **Security**: Implemented **Advanced License Protection** (Domain binding & Heartbeat).
- **Security**: Implemented **Database Encryption** for SSN, phone, and address (AES-GCM).
- **Security**: Added **Rate Limiting** to auth endpoints for brute-force prevention.
- **Infrastructure**: Migrated sensitive keys from `.env` to secure database records.
