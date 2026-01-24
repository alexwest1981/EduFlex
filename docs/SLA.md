# ⏱️ EduFlex Service Level Agreement (SLA)

> **Commitment to Reliability**
> EduFlex guarantees high availability and rapid support response for our Enterprise customers.

---

## 1. Uptime Guarantee

| Tier | Availability Target |
|------|---------------------|
| **Standard** | 99.5% (Max 3.6h downtime/month) |
| **Enterprise** | 99.9% (Max 43m downtime/month) |

### Monitoring
Uptime is measured by our external status page (`status.eduflexlms.se`) which checks the `/actuator/health` endpoint every 30 seconds from multiple geographic locations.

### Exclusions
The following do not count as "Downtime":
*   Scheduled Maintenance (announced 48h in advance).
*   Force Majeure events (Cloud Provider regional outages).
*   Issues caused by Customer's custom code/integrations.

---

## 2. Support Response Times

| Priority | Description | Response Time (Enterprise) | Response Time (Standard) |
|----------|-------------|----------------------------|--------------------------|
| **P1** | **Critical:** System down, data loss risk. | < 1 Hour (24/7) | < 4 Hours (Bus. Hrs) |
| **P2** | **High:** Core feature broken (e.g. Grading). | < 4 Hours (Bus. Hrs) | < 1 Business Day |
| **P3** | **Normal:** Minor bug, cosmetic issue. | < 1 Business Day | < 3 Business Days |
| **P4** | **Low:** Feature request / Question. | Best Effort | Best Effort |

---

## 3. SLA Credits

If we fail to meet the Uptime Guarantee in a given billing month, customers are eligible for service credits:

| Uptime | Credit (% of Monthly Fee) |
|--------|---------------------------|
| < 99.9% | 10% |
| < 99.0% | 25% |
| < 95.0% | 50% |

To claim a credit, the Customer must submit a ticket within 30 days of the incident.

---

## 4. Disaster Recovery (DR)

*   **RPO (Data Loss):** Max 5 minutes (PostgreSQL WAL archiving).
*   **RTO (Recovery Time):** Max 4 hours (Automated Kubernetes restoration).
*   **Backup Schedule:**
    *   **Hourly:** Database Incremental
    *   **Daily:** Database Full + MinIO Objects
