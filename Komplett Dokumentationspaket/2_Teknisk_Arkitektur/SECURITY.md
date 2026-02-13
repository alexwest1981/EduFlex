# Security Architecture: EduFlex LMS 2.0

## 1. Authentication & Authorization
*   **Protocol:** OAuth 2.0 / OpenID Connect (OIDC).
*   **Implementation:** Spring Security 6.
*   **Token Management:** Stateless JWT (JSON Web Tokens) with short lifespan (15 min) and secure refresh tokens.
*   **Role-Based Access Control (RBAC):** Granular permissions (e.g., `COURSE_CREATE`, `GRADE_VIEW`) assigned to roles (`ADMIN`, `TEACHER`, `STUDENT`, `PRINCIPAL`).
*   **MFA:** Support for Multi-Factor Authentication (TOTP).

## 2. Data Protection
*   **Encryption at Rest:** Sensitive fields (SSN, Phone, Address) are encrypted in the database using AES-256 via `AttributeConverter`.
*   **Encryption in Transit:** All traffic enforced over HTTPS (TLS 1.3).
*   **Data Isolation:** Schema-per-Tenant architecture ensures that a SQL injection vulnerability in one tenant cannot access data from another.

## 3. Compliance & Auditing
*   **Audit Logging:** All critical actions (login, grade change, user creation) are logged to an immutable audit table (`audit_logs`).
    *   *Fields:* `timestamp`, `actor_id`, `action`, `entity_id`, `old_value`, `new_value`, `ip_address`.
*   **GDPR:** Built-in "Right to be Forgotten" (Anonymization) and "Data Export" features.
*   **Input Validation:** Strict validation on all API endpoints to prevent XSS and Injection attacks.

## 4. Infrastructure Security
*   **Containerization:** Docker containers running as non-root users.
*   **Rate Limiting:** API rate limiting (Bucket4j) to prevent DDoS and brute-force attacks.
*   **Dependency Scanning:** Automated scanning of Maven/NPM dependencies for known vulnerabilities (CVEs).

## 5. Secure Development Lifecycle (SDLC)
*   Code reviews required for all merges.
*   Automated testing (Unit & Integration) in CI/CD pipeline.
*   Principle of Least Privilege applied to all service accounts.
