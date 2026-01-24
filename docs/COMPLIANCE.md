# ⚖️ EduFlex Compliance & Data Protection

> **Enterprise Compliance Statement**
> EduFlex 2.0 is designed to meet strict data privacy regulations, including **GDPR (EU)**, **CCPA (California)**, and **Skolverket** data handling guidelines.

---

## 🇪🇺 GDPR Adherence (EU General Data Protection Regulation)

EduFlex acts as a **Data Processor** for our custom tenants (Data Controllers).

### 1. Right to be Forgotten (Article 17)
EduFlex supports complete user anonymization.
*   **Procedure:** Correctly deleting a user in EduFlex does *not* destroy historical records (grades, completed courses) but anonymizes the PII (names, emails are hashed/removed).
*   **Command:** Admin API `DELETE /api/users/{id}?anonymize=true`
*   **Logs:** Audit logs retain the *action* but remove the *actor's* personal details.

### 2. Data Portability (Article 20)
Users have the right to download their data.
*   **Feature:** "Download My Data" button in User Profile.
*   **Format:** Standardized JSON containing:
    *   Course History
    *   Quiz Results
    *   Certificates (PDF links)
    *   Activity Logs

### 3. Data Governance & Residency
*   **Storage:** All data is stored in **PostgreSQL 15** with strict schema isolation per tenant.
*   **Location:** Default deployment is on-premise or EU-based Cloud Regions (e.g., AWS Frankfurt, Azure Sweden Central).
*   **Encryption:**
    *   **At Rest:** Database volumes and MinIO buckets are encrypted (AES-256).
    *   **In Transit:** Forced TLS 1.2/1.3 for all web traffic.

---

## 🇸🇪 Swedish Schools (Skolverket & Grades)

EduFlex is compliant with:
*   **Skollagen (2010:800)** regarding documentation of student results.
*   **SS 12000:** Interface standards for exchange of student data.

### Grade Integrity
*   **Locking:** Once a grade is finalized in EduFlex (Status: `GRADED`), it is cryptographically signed (hash stored in Audit Log) to prevent silent tampering.
*   **Archiving:** Grades are retained for 50 years (configurable per tenant policy).

---

## ♿ Accessibility (WCAG 2.1)

We strive for **AA Level** compliance.
*   **Contrast:** All themes (Classic, Nebula, Voltage) are tested for 4.5:1 contrast ratio.
*   **Keyboard Nav:** Full tab-support for all interactive elements.
*   **Screen Readers:** semantic HTML headers and ARIA labels on all icons.

> **VPAT Report:** Available upon request for Enterprise contracts.

---

## 🔒 Security Certifications (Roadmap)
*   [ ] ISO 27001 (Planned Q3 2026)
*   [ ] SOC 2 Type II (Planned Q4 2026)
