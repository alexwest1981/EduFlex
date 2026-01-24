# 🛡️ EduFlex Security Architecture

> **Security First**
> EduFlex 2.0 employs a "Security in Depth" approach, securing data at the Network, Application, and Database layers.

---

## 1. Authentication & Identity

### Identity Management
*   **Protocol:** OAuth 2.0 / OpenID Connect (OIDC).
*   **Providers:**
    *   **Internal:** JWT (RS256 signed) managed by EduFlex.
    *   **External:** Keycloak Integration (supports AD/LDAP, Google, GitHub).
*   **Password Policy:** BCrypt (Strength 10). No plain-text passwords stored.

### Session Management
*   **Tokens:** Stateless JWT Access Tokens (15 min lifespan).
*   **Refresh:** Rotational Refresh Tokens stored in HTTP-Only, Secure Cookies.
*   **Revocation:** Blacklist supported via Redis for instant logout.

---

## 2. Access Control (RBAC)

We maintain a strict Role-Based Access Control model.

| Role | Access Level |
|------|--------------|
| `STUDENT` | **Read:** Own Courses, Events. **Write:** Assignment Submissions, Note-taking. |
| `TEACHER` | **Read:** Assigned Courses. **Write:** Content, Grades, Feedback. **Restricted:** Cannot see other teachers' courses by default. |
| `MENTOR` | **Read-Only:** View progress/attendance for specific list of Students. |
| `PRINCIPAL`| **Read-Only:** Tenant-wide analytics and reports. |
| `ADMIN` | **Full Access:** Tenant configuration, User management, Billing. |

---

## 3. Data Isolation (Multi-Tenancy)

EduFlex uses the **Schema-per-Tenant** pattern, the gold standard for SaaS security.

*   **Isolation:** Tenant A's data lives in schema `tenant_a`. Tenant B lives in `tenant_b`.
*   **Prevention:** The Hibernate `CurrentTenantIdentifierResolver` intercepts *every* database transaction. It is technically impossible for a query to cross tenant boundaries without a valid Tenant Context.
*   **Pentest Note:** `X-Tenant-ID` header injection attacks are mitigated by validating the ID against a secured central `public.tenants` table before switching context.

---

## 4. Operational Security (Hardening)

### Network
*   **TLS:** All traffic over HTTPS (TLS 1.2+).
*   **CORS:** Strict origin policies configured in `WebConfig.java`.
*   **Rate Limiting:** IP-based throttling via Bucket4j to prevent brute-force/DDoS (Default: 1000 req/min).

### Dependencies
*   **Scanning:** Dependabot / Snyk integration in CI/CD pipeline.
*   **Container Security:** Distroless or Alpine-based Docker images to minimize attack surface.

### Audit Logging
Critical actions are logged to an immutable append-only log:
*   Logins / Failed Logins
*   Grade Changes (Old Value -> New Value)
*   User Deletions
*   Role Updates

---

## 5. Vulnerability Reporting
Found a bug? Please report it responsibly.
*   **Email:** security@fenrirstudio.com
*   **Response Time:** < 24 hours.
*   **Bounty:** Available for critical exploits.
