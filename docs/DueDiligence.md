# Due Diligence - EduFlex LMS Technical Overview

## 1. Executive Summary
EduFlex is a high-performance, multi-tenant Learning Management System (LMS) designed for modern educational environments. It leverages AI (Google Gemini), distributed architecture, and strictly isolated multi-tenancy to provide a secure, scalable, and personalized learning experience. Key differentiators include built-in Systematic Quality Work (SKA), LTI 1.3 Advantage compliance, and a live AI Career Portal.

## 2. Technical Stack
### Backend Architecture
- **Language**: Java 21 (LTS)
- **Framework**: Spring Boot 3.2.3
- **Build Tool**: Maven
- **Database**: PostgreSQL 15 (Multi-schema multi-tenancy)
- **Caching & Event Bus**: Redis (Alpine)
- **Object Storage**: MinIO (S3-compatible API)
- **Identity Provider**: Keycloak 24.0 (OIDC/OAuth2)
- **Messaging**: Kafka (Optional/Service-ready)
- **Microservices**: Dedicated PDF and Video microservices for intensive tasks.

### Frontend Architecture
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Vanilla CSS + TailwindCSS (Utilities)
- **Animations**: Framer Motion
- **Internationalization**: i18next
- **Rich Text**: Tiptap & Quill integration

### Infrastructure & DevOps
- **Containerization**: Docker & Docker Compose
- **Orchestration Readiness**: Kubernetes (Helm charts path)
- **Monitoring**: Prometheus & Grafana (Actuator integration)
- **Backup Strategy**: Automated PostgreSQL backups (point-in-time recovery ready).

## 3. Security & Data Protection
### Authentication & Authorization
- **Hybrid Security**: Support for internal JWT tokens and external Keycloak OIDC tokens.
- **RBAC**: Granular Role-Based Access Control for 8 distinct roles (Admin, Teacher, Student, Principal, Guardian, Rector, Mentor, Supervisor).
- **MFA**: Support for Google Authenticator (TOTP) and BankID (Login logic).
- **API Security**: Rate limiting (Bucket4j), IP-based filtering, and API Key authentication.

### Privacy & Compliance
- **Multi-Tenancy**: Hardware-level logical isolation using separate PostgreSQL schemas per tenant (`TenantFilter`).
- **Data Encryption**: AES-256 encryption for sensitive PII (Personally Identifiable Information).
- **GDPR Readiness**: Data export/deletion handlers and detailed audit logging of administrative actions.
- **Encryption Service**: Centralized `EncryptionUtils` for secure data handling.

## 4. Feature Modules
### AI Intelligence Center
- **Gemini Integration**: Dynamic feedback, automated quiz generation, and career matching.
- **Spaced Repetition**: Adaptive learning based on memory retention algorithms.
- **Cognitive Radar**: Visual mapping of student competency vs. market requirements.

### EduCareer Portal
- **JobTech Live**: Real-time integration with JobSearch API for internships and LIA.
- **Match Score**: AI-driven score calculating student profile relevance to specific job postings.

### Systematic Quality Work (SKA)
- **SKA-motor**: Digitalized processes for continuous quality improvement based on Swedish school regulations.

### LTI 1.3 Advantage
- **Compliance**: Full support for Assignment & Grading Services (AGS) and Names & Role Provisioning Services (NRPS).

## 5. External Integrations
- **OnlyOffice**: Native document collaboration and editing.
- **LiveKit**: WebRTC-based high-performance video lessons.
- **Stripe**: Fully integrated payment processing for course enrollments.
- **Skolverket API**: Future-ready integration for national school data.

## 6. Database & Storage Strategy
- **Isolation**: Tenant isolation at the schema level prevents data leakage between institutions.
- **Storage**: MinIO handles all binary data (documents, videos) with S3-compatible versioning support.
- **Caching**: Redis caches LTI sessions, rate-limit buckets, and frequently accessed course metadata.

## 7. Development Workflow & Quality Assurance
- **Git Strategy**: Versioned releases (v3.4.1+) with detailed change logs in `README.md`.
- **Environment Isolation**: Mandatory separate database tables and isolated environments for any new functionality until full integration.
- **Scripted Operations**: Automated backend management via `scripts/run_backend_local.ps1` to ensure consistent uptime.
- **Documentation First**: All architectural changes and feature launches are documented in `README.md`, `ROADMAP.md`, and dedicated `docs/` artifacts.

## 8. Strategic Roadmap
### Short-term (Planned)
- Enhanced Guardian app with Push Notifications.
- AI-driven adaptive learning paths for personalized education.
- Expanded community marketplace for course resources.

### Long-term (Vision)
- Fully decentralized LRS (Learning Record Store) ecosystem.
- Deep integration with national education registries.
- Advanced Predictive Analytics for student success.

## 9. Risk Management & Commercial Scalability
- **Key-Man Risk Mitigation**: High focus on standardized architectural patterns (SOLID, Spring Boot, React) and extensive documentation ensures the system is "Transfer Friendly" for larger teams. Automated DevOps scripts further reduce dependency on individual knowledge.
- **Mobile Strategy**: Current PWA (Progressive Web App) architecture provides offline-first capabilities and push notifications, covering ~80% of native app use cases. A dedicated Native Hybrid app (Expo/React Native) is scheduled for Q3 2026 to capture the frontline worker segment.
- **Commercial & ARR Path**: Transitioning from a technical proof-of-concept to a "Commercial Pilot" phase. Implementation of the `Pilot Kit`, `Pricing Tiers`, and Stripe-integrated subscription engine provides a clear technical path to Annual Recurring Revenue (ARR).

---
*Last Updated: 2026-02-25*
*Status: Production Ready (v3.4.1)*
