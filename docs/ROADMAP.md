# 🚀 EduFlex Roadmap: Vision 2026

**Mål:** Transformera EduFlex från ett administrativt LMS till ett "Intelligent Learning Ecosystem" som är agent-redo, adaptivt och integrerat i arbetsflödet.

---

## 🧠 Kategori 1: AI & Agentisk Arkitektur
*Marknaden 2026 kräver att AI inte bara är en "add-on" utan motorn i systemet.*

| Funktion | Beskrivning | Status |
| :--- | :--- | :--- |
| **Generativt Författande (Quiz)** | Skapa quiz från PDF/Text. | ✅ **Klar** |
| **Generativt Författande (Kurser)** | "One-click course creation". Ladda upp PDF/PPT/Video och låt systemet generera kursstruktur, sammanfattningar och quiz automatiskt. | ✅ **Stabil** (V1) |
| **AI-Tutor & Copilot** | En inbyggd chattbot som svarar på elevers frågor baserat enbart på kursmaterialet (RAG). Rollspelspartner för träning. | ✅ **Klar** (V1) |
| **MCP-Server** | Gör EduFlex tillgängligt för externa AI-agenter (Model Context Protocol). | ✅ **Klar** (V1) |
| **Prediktiv Personalisering** | Analyserar beteendedata för att identifiera "at-risk"-studenter och rekommenderar stödmateri| Fas 1 | **Prediktiv AI-Analys Engine** | Backend-motor färdig | Stable/Completed (Phase 1) |
| Fas 2 | **Rollspecifika AI-coacher** | Rektor & Mentorsstöd | Stable/Completed (Phase 2) |
| Fas 3 | **SKA-motor 2.0** | Planering/Uppföljning | Stable/Completed (Phase 3) |
| Fas 4 | **Adaptive Learning Flow** | Elev-anpassning | ✅ **Stabil / Verifierad** |
| :--- | :--- | :--- |
| **LTI 1.3 Core** | Grundläggande launch-stöd för externa verktyg. | ✅ **Klar** |
| **LTI 1.3 Advantage** | Stöd för AGS (Betyg) och NRPS (Roller/Namn). | ✅ **Stabil / Verifierad** |
| **xAPI & cmi5** | Modern spårning (LRS) för mobilt lärande och simuleringar. | ✅ **Verifierad** |
| **Workflow Integration** | Utbildning direkt i Slack/Teams/Salesforce ("Headless LMS"). | 📅 **Planerad** |

---

## 👥 Kategori 3: Användarupplevelse & Engagemang
*Fokus på "Learning Experience" (LXP) snarare än administration.*

| Funktion | Beskrivning | Status |
| :--- | :--- | :--- |
| **Socialt Lärande (Basic)** | Community Hub / Marketplace. | ✅ **Klar** |
| **Socialt Lärande (Avancerat)** | P2P-delning, kommentarer i kurser, "YouTube for Learning". | ✅ **Stabil** (V1) |
| **Gamification (Basic)** | XP, Levlar, Badges, Streaks. | ✅ **Klar** |
| **EduGame Expansion** | Shop för profil-teman, Sociala Streaks, "Buddy"-system. | ✅ **Stabil** (V1) |
| **Mobil-först** | Responsiv webbdesign. | ✅ **Klar** |
| **Media Streaming** | Stabil synkroniserad ljudboksuppspelning med Range-stöd. | ✅ **Klar** |
| **Offline-läge / PWA** | Installera som app, ladda ner kurser för offline-bruk. | 📅 **Planerad** |

---

## 📊 Kategori 4: Analys & Affärsnytta
*Från att mäta "Completion" till att mäta "ROI".*

| Funktion | Beskrivning | Status |
| :--- | :--- | :--- |
| **Kursutvärdering & Insikter** | Komplett system för kurskvalitet, automatiserade studentnotiser och AI-analys av fritextsvar. | ✅ **Klar** |
| **Enkätsystem (Elevhälsa)** | Dynamiska enkäter med 4 frågetyper, massdistribution per roll, intern notifiering och statistikaggregering. | ✅ **Klar** |
| **Skills Gap Analysis** | Visualisera kompetensluckor baserat på quiz/profiler. | 📅 **Planerad** |
| **ROI-rapportering** | Koppla utbildning till affärsdata (t.ex. säljsiffror). | 📅 **Planerad** |

---

## 🛡️ Kategori 5: Infrastruktur & Säkerhet
*Teknisk ryggrad och skydd av användardata.*

| Funktion | Beskrivning | Status |
| :--- | :--- | :--- |
| **Advanced Security** | Domän-låsning, AES-256 GCM kryptering (PII) och Rate-limiting. | ✅ **Klar** |
| **Unified Storage** | MinIO standalone restoration & auto-bucket sync. | ✅ **Klar** |
| **CI/CD Pipeline** | Fullt automatiserade tester och deployment. | 📅 **Planerad** |
| **Kubernetes Migration** | Helm-charts för skalbarhet. | 📅 **Planerad** |
| **Rektorspaket (Mission Control)** | Komplett skolledningslager: Organisationshierarki, Dashboard för nyckeltal (8 realtids-KPIer), Incidenthantering, Elevhälsa och Masskommunikation. | ✅ **Klar** |
| **PDF Whitelabeling** | Visuell editor för certifikat- och betygsmallar. Ladda upp logotyp, bakgrundsbild, konfigurera färger, texter, QR-position och layout. Live-förhandsvisning. | ✅ **Klar** |
| **Sjukanmälan** | Komplett sjukanmälningssystem med statusuppdateringar, mentorsnotifieringar och historikspårning. | ✅ **Klar** |

---

## 📝 Change Log

### [v1.1.1] - 2026-02-14
- **Wellbeing Center**: Fixed infinite redirection loop for Admins.
- **UX/UI**: **Role-Based Sidebar** - Hidden "Documents" and "Tools" menus for Guardians.
- **Security**: **Role Guarding** - Strengthened frontend route protection for EHT and Guardian pages.
- **Roadmap**: Pivot to **Phase 4: Adaptive Learning**.

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
