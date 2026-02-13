# Technical Appendix: EduFlex LMS 2.0

## 1. Tech Stack Overview

### Backend (Core)
*   **Language:** Java 21 (LTS)
*   **Framework:** Spring Boot 3.2.3
*   **Build Tool:** Maven
*   **Database:** PostgreSQL (Production), H2 (Dev/Test)
*   **ORM:** Hibernate / Spring Data JPA
*   **Security:** Spring Security 6, OAuth2, JWT (Stateless)
*   **Caching:** Redis (Session management, API caching)
*   **Messaging:** Apache Kafka (Event-driven architecture for notifications & analytics)

### Frontend (Client)
*   **Framework:** React 18.2
*   **Build Tool:** Vite
*   **Language:** JavaScript (ES6+) / JSX
*   **Styling:** Tailwind CSS
*   **State Management:** React Context API + Custom Hooks
*   **Icons:** Lucide React
*   **Charts:** Recharts

### AI & Machine Learning
*   **LLM Integration:** Google Gemini Pro 1.5 (via REST API)
*   **Vector Database:** PGVector (PostgreSQL extension) for RAG (Retrieval-Augmented Generation)
*   **Features:**
    *   Automatic Quiz Generation (PDF/Text to Quiz)
    *   AI Tutor (Context-aware chat)
    *   Automated Grading & Feedback
    *   Content Summarization

## 2. Architecture Patterns

### Multi-Tenancy
EduFlex uses a **Schema-per-Tenant** approach for maximum data isolation and security.
*   **Tenant Resolution:** Intercepts requests via `X-Tenant-ID` header or subdomain.
*   **Data Isolation:** Each school/organization gets its own database schema. Hibernate handles context switching automatically.
*   **Scalability:** Allows for easy migration of specific tenants to dedicated database servers if needed.

### Microservices-Ready Monolith
Currently deployed as a modular monolith for operational simplicity, but structured with clear domain boundaries (Modules) to facilitate easy extraction into microservices:
*   `com.eduflex.backend.modules.auth`
*   `com.eduflex.backend.modules.course`
*   `com.eduflex.backend.modules.ai`
*   `com.eduflex.backend.modules.analytics`

### Event-Driven Design
Critical system actions trigger asynchronous events via Kafka/Spring Events:
*   `UserRegisteredEvent` -> Triggers email welcome, analytics log.
*   `CourseCompletedEvent` -> Triggers certificate generation, gamification rewards.
*   `IncidentReportedEvent` -> Triggers notifications to Principal/Admin.

## 3. Integrations
*   **Skolverket:** API integration for course codes and curriculum standards.
*   **OnlyOffice:** Integrated document editor for collaborative editing.
*   **Stripe:** Payment processing for subscription management.
*   **LTI 1.3:** Support for external learning tools (Learning Tools Interoperability).
*   **xAPI / CMI5:** Learning Record Store (LRS) compatibility for tracking learning experiences.
