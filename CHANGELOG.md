# 📜 EduFlex LLP: Changelog

All notable changes to the EduFlex Learning Lifecycle Platform (LLP) will be documented in this file.

---

## [v3.9.3] - 2026-03-18 (Current)
### 🛡️ Security Hardening & Repository Audit
- **Non-Root Docker Implementation**: Refactored `eduflex-ai/Dockerfile` to run as a dedicated `aiuser`, significantly mitigating container escape risks.
- **Credential Sanitization**: Removed all hardcoded default passwords and API keys from `k8s/secrets.yaml` and `docker-compose.yml`, replacing them with secure placeholders.
- **Repository Cleanup**: Performed a full audit of the git index to ensure no sensitive files (`.env`, `*.pem`, `*.lic`, `*.apk`, `*.deb`) or local development scripts are being tracked.
- **Strict Exclusions**: Refined `.gitignore` to prevent future accidental commits of large binaries or environment-specific tools.

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
