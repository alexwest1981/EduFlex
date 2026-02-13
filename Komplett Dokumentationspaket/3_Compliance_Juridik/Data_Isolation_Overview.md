# Data Isolation Overview: Schema-per-Tenant

EduFlex LMS 2.0 använder en avancerad "Schema-per-Tenant"-arkitektur för att garantera maximal säkerhet och dataseparation i en SaaS-miljö.

## Konceptet
Istället för att blanda alla kunders data i samma tabeller (med en `tenant_id`-kolumn), får varje kund (skola/koncern) ett eget **databasschema**.

*   **Public Schema:** Innehåller gemensam data (användare, roller, tenants-konfiguration).
*   **Tenant Schema (t.ex. `tenant_acme_school`):** Innehåller all skolspecifik data (kurser, betyg, inlämningar, chattloggar).

## Tekniska Fördelar
1.  **Säkerhet:** Det är fysiskt omöjligt för en SQL-fråga som körs i en tenants kontext att läsa data från en annan tenant, eftersom databasen isolerar scheman.
2.  **Prestanda:** Index och tabeller blir mindre och snabbare eftersom de bara innehåller en kunds data.
3.  **Backup & Restore:** Vi kan återställa en enskild kunds data till en viss tidpunkt utan att påverka andra kunder.
4.  **Anpassning:** Möjliggör framtida anpassningar av datamodellen för specifika "Enterprise"-kunder utan att bryta systemet för andra.

## Implementering
*   **Hibernate Multi-Tenancy:** Applikationen använder Hibernate's inbyggda stöd för multi-tenancy.
*   **Tenant Resolver:** En `CurrentTenantIdentifierResolver` identifierar vilken tenant som anropar systemet (via URL eller Header) och kopplar uppkopplingen till rätt schema.
*   **Flyway Migration:** Databasförändringar (migreringar) körs automatiskt mot alla tenants scheman vid deployment, vilket garanterar att alla är synkade.
