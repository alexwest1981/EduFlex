# EduFlex Project Roadmap

This document outlines the high-level roadmap and future plans for the EduFlex learning management system.

## 🚀 Current Focus: Resource Bank & AI Expansion (Q1 2026)

We have successfully implemented the core structure for the **Resource Bank**, a unified hub for managing all educational materials.

-   ✅ **Resource Bank UI**: A dedicated section for managing Quizzes, Assignments, and Lessons.
-   ✅ **AI-Powered Content Generation**: Integration with Gemini AI for pedagogical content.
-   ✅ **Advanced Security Hardening**: 
    - Domän-låsning av licenssystem för anti-cloning.
    - Fullständig AES-256 GCM kryptering av känslig användardata (PII).
    - Rate-limiting (Brute-force skydd) på inloggning.
-   ✅ **Secure Configuration**: Migrering av alla API-nycklar till krypterad databaslagring.

## 🔮 Future Plans (Q2 2026 and beyond)

### Community & Marketplace
-   [ ] **Community Marketplace**: A fully browsing-enabled UI for finding and importing shared resources.
-   [ ] **Rating & Reviews**: Allow teachers to rate and review shared materials.
-   [ ] **Author Profiles**: Showcase top contributors and their resources.

### Gamification V2.0 (Enhanced)
-   [ ] **Quest System**: Daily and weekly challenges for students.
-   [ ] **Expanded Shop**: More customizable avatars and themes.
-   [ ] **Leaderboards**: Class-wide and school-wide competitions.

### Advanced Analytics
-   [ ] **Predictive AI**: Early warning system for students at risk of falling behind.
-   [ ] **Learning Path Insights**: Visualizing student progression through course modules.

### Infrastructure
-   [ ] **Kubernetes Migration**: Prepare Helm charts for scalable deployment.
-   [ ] **CI/CD Pipeline**: fully automated testing and deployment workflows.

## 📝 Change Log

### [v0.9.6] - 2026-02-03
-   **Security**: Implemented **Advanced License Protection** (Domain binding & Heartbeat).
-   **Security**: Implemented **Database Encryption** for SSN, phone, and address (AES-GCM).
-   **Security**: Added **Rate Limiting** to auth endpoints for brute-force prevention.
-   **New Feature**: AI Resource Generator and Resource Bank module.
-   **UX**: Consolidated all AI settings into the new "AI-inställningar" panel.
-   **Infrastructure**: Migrated sensitive keys from `.env` to secure database records.
