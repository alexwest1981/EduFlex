# SLA & Disaster Recovery Plan

## Service Level Agreement (SLA)

### Uptime Guarantee
EduFlex garanterar en tillgänglighet på **99,9%** under kontorstid (07:00 - 18:00 CET) och 99,5% övrig tid.

### Support Levels
*   **L1 (Basic):** Lösenordsåterställning, enklare användarfrågor. (Hanteras av kundens super-users).
*   **L2 (Advanced):** Buggrapportering, konfigurationsproblem. (Svarstid: < 4 timmar).
*   **L3 (Expert):** Kritiska systemfel, säkerhetsincidenter. (Svarstid: < 1 timme).

---

## Disaster Recovery (DR) Plan

### RPO & RTO
*   **RPO (Recovery Point Objective):** 5 minuter. (Maximal dataförlust vid totalhaveri).
    *   *Lösning:* Transaktionsloggar (WAL) strömmas kontinuerligt till backup-lagring.
*   **RTO (Recovery Time Objective):** 4 timmar. (Tid att återställa systemet till full drift).
    *   *Lösning:* Automatiserade scripts för att spinna upp ny infrastruktur (Infrastructure as Code).

### Backup Strategy
1.  **Database:**
    *   Full backup varje natt (03:00).
    *   Inkrementell backup var 15:e minut.
    *   Lagras krypterat i S3-bucket (off-site) med versionshantering.
2.  **File Storage (MinIO):**
    *   Replikering till sekundär nod i realtid.
    *   Daglig snapshot till kall lagring (Glacier).

### Katastrofscenarion
1.  **Databas-korruption:**
    *   Återställning från senaste "Point-in-Time" backup till en ny instans.
    *   Verifiering av dataintegritet.
    *   DNS-ompekning.
2.  **Serverhallen brinner ner (Total Region Failure):**
    *   Aktivera DR-miljö i sekundär region (t.ex. AWS Stockholm -> AWS Frankfurt).
    *   Återställ data från off-site backups.
    *   Systemet körs i "Degraded Mode" (endast kärnfunktioner) tills full kapacitet återfåtts.
