# 📜 EduFlex LLP: Changelog

All notable changes to the EduFlex Learning Lifecycle Platform (LLP) will be documented in this file.

---

## [v3.9.6] - 2026-03-19
### 🎯 EduCareer – Unified Career & LIA Portal
- **EduCareer Portal**: Samlad karriär- och praktikportal med tabbar. Ersätter separata "JobEd Connect"- och "LIA & Praktik"-sidor med en enda enhetlig upplevelse under `/career`.
- **EduJob-flik**: AI-matchning mot Arbetsförmedlingens JobTech API med skill-gap-analys och personaliserade kursrekommendationer (f.d. CareerDashboard).
- **LIA & Praktik-flik**: Dedikerad sökportal för LIA- och praktikplatser med AI-insikter, geolocation-filter (sökradie) och stad-shortcuts.
- **Navigation Redesign**: Menyn visar nu en enda "EduCareer"-länk (för studenter, lärare och admins) utan licenstier-gating.

### 🔧 Backend Build Fixes
- **CourseService.java**: Åtgärdade 3 saknade imports (`CourseLicenseRepository`, `CourseRepository`, `CourseSkillMappingRepository`), odeklarerat fält och fel variabelreferens (`mappingRepository` → `courseSkillMappingRepository`).
- **JobTechController.java**: Åtgärdade saknad `warning`-variabeldeklaration i `matchJob`-metoden.
- **Containers**: `eduflex-backend` och `eduflex-jobtech` byggs och körs nu korrekt (healthy).

### ✨ UX & Diagnostics
- **Diagnostic Warning Badge**: Amber-badge visas i Match Details Modal när AI-extraktionen misslyckas extrahera skills (totalJobSkills = 0).

---

## [v3.9.5] - 2026-03-19

### 🚀 JobEd Connect Hub (Phase 1)
- **Real-time Job Matching**: Integrated Arbetsförmedlingen JobTech APIs for real-time job searching based on keywords and occupations.
- **Career Dashboard**: Launched a premium UI for students to explore the labor market, including "Trending Jobs" and AI-driven match placeholders.
- **Microservice Extraction**: Deployed `eduflex-jobtech` microservice on port 8087 with multi-stage Docker orchestration.

## [v3.9.4] - 2026-03-19
### 🤖 AI Accessibility Engine (EN 301 549)
- **Automated Compliance Auditor**: Launched the first integrated accessibility scanner for EduFlex, mapped against **149 machine-readable legal requirements**.
- **✨ Editor Integration**: Added a real-time scan button to the `RichTextEditor` with a results sidebar, compliance scoring, and AI-driven fix suggestions.
- **Microservice Orchestration**: Deployed the `eduflex-accessibility` service to handle high-volume compliance checks asynchronously.

### ⚡ Performance Optimization (Turbo Load)
- **Core Hardening**: Initial load time slashed from **~25s to ~5s** (Dev mode) through comprehensive route-based code splitting.
- **Request Reduction**: Reduced initial HTTP requests from **1120 down to 97** by optimizing the startup sequence.
- **Dynamic Localization**: Implemented a lazy-loading i18n backend that only fetches the active language bundle, preventing the "greedy load" of all 12+ languages.

---

## [v3.9.3] - 2026-03-18
### 🛡️ Security Hardening & Repository Audit

### 🤖 AI Service Robustness
- **Gemini Fallback Mechanism**: Implemented a robust fallback strategy in `eduflex-ai/main.py`. The system now automatically cycles through available models (Gemini 1.5 Flash/Pro) if the primary model hits capacity limits (HTTP 503).
- **Graceful Error Handling**: Improved AI error reporting to provide clearer feedback to users when service capacity is reached across all fallback options.

### 🌐 Localization & Documentation
- **Norwegian Translation Fixes**: Resolved missing or incorrect keys in the Norwegian (`no`) translation sets.
- **Landing Page Update**: Integrated "What's New" and "Roadmap" sections into the public landing page to improve transparency for users.
- **Documentation Overhaul**: Restructured `README.md`, `ROADMAP.md`, and created this `CHANGELOG.md` for better project overview.

---

## [v3.9.2] - 2026-03-09
- **Global Language Sync**: Full restoration of language support (9+ languages), AI-driven sync and 100% localization of landing page & modals.
- **Performance**: Optimized frontend asset loading for faster initial paint.

## [v3.9.1] - 2026-03-05
- **Mission Control**: Added 8 real-time KPIs to the Principal Dashboard.
- **Bug Fix**: Resolved WebSocket instability in the Exam Integrity Pro module.

## [v3.9.0] - 2026-03-01
- **Kubernetes Migration**: Official production-ready Helm charts and HPA (Horizontal Pod Autoscaler) templates.
- **Live Classrooms**: LiveKit-powered video conferencing with scheduling and background blur.

---

## [v3.8.2] - 2026-02-28
- **Authority Integration**: Ladok integration for module mapping and "Results to Ladok" flow.
- **Compliance**: Added "Read Audit Logs" and PII masking for students with protected identities.
- **DRM**: Built-in mechanism to restrict downloading/printing of B2B content.

### [v3.8.1] - 2026-02-27
- **Dynamic Language Manager**: Automation for new languages via Gemini AI.
- **Infra**: Unified startup scripts for Windows and Linux/WSL.

### [v3.8.0] - 2026-02-26
- **CSN Autopilot**: Background jobs for identifying "ghosting" students and generating CSN events.
- **MYH Compliance**: LIA Compliance Matrix for monitoring agreements and assessments (8-week rule).

---

> [!NOTE]
> For older version history (v0.9.x to v3.0.x), please refer to the internal documentation in `docs/ROADMAP.md` or the legacy archives.
