# EduFlex LMS v3.6.3.3 (Microservice Architecture - Real-time)

The Complete Enterprise Learning Management System, evolved for scale.

---

### 🚀 **v3.6.3.3** (4 mar 2026) – Microservice Migration Phase 3 & 4 (Real-time & Notifications)
*   **🔔 eduflex-notifications Microservice**: En dedikerad tjänst för all realtidskommunikation via WebSockets (STOMP). Frikopplar chatt, forum-reaktioner och systemnotiser från huvudapplikationen.
*   **📡 Redis Event Bus Architecture**: Implementerat en robust händelsebuss baserad på Redis Pub/Sub som binder samman alla mikrotjänster och möjliggör distribuerade realtidsuppdateringar.
*   **🛡️ JWT-secured WebSockets**: Säkerställt WebSocket-anslutningar med JWT-validering direkt i den nya mikroservicen.
*   **📂 Monolith Decoupling**: Refaktorerat samtliga realtidstjänster i monoliten (`Chat`, `Forum`, `LogTailer`, `Notification`, `ExamIntegrity`, `AITutor`) till att publicera händelser på den gemensamma händelsebussen istället för direktleverans till klienter.

---

### 🚀 **v3.6.3.2** (4 mar 2026) – Microservice Migration Phase 2 (Integration & Callbacks)
*   **🔌 Frontend Proxy Integration**: Sömlös anslutning av frontenden till den nya SCORM-mikroservicen via Vite-proxy, vilket möjliggör transparent migration av SCORM, CMI5 och LRS-trafik (port 8084).
*   **📡 Internal Callback System**: Implementerat `InternalProgressController` i monoliten för att ta emot säkra framstegsuppdateringar i realtid från mikroservicen.
*   **🛡️ Multi-Service Security**: Konfigurerat `SecurityConfig` för att tillåta interna tjänsteanrop, vilket säkrar kommunikationen mellan mikrotjänsterna och monolit-backenden.

---

### 🚀 **v3.6.3.1** (4 mar 2026) – Microservice Migration Phase 1 (SCORM & xAPI)
*   **🏗️ eduflex-scorm Microservice**: Initierat en ny, högpresterande Spring Boot 3-mikrotjänst för hantering av SCORM och xAPI.
*   **🔌 Decoupled Architecture**: Frikopplat SCORM- och xAPI-data från monolitens huvuddatabas till ett eget isolerat schema för att radikalt minska trycket på centrala PostgreSQL-anslutningar.
*   **📡 xAPI LRS API**: Fullständigt stöd för statements, state och agent profiles via den nya tjänsten.

---

### 🕒 Senaste uppdateringarna (2026-03-04)
- **Phase 4 Completion**: `eduflex-notifications` mikrotjänst driftsatt. Hela monoliten refaktorerad för Redis Pub/Sub (Event Bus).
- **Phase 2 Completion**: Full integration av `eduflex-scorm` med monoliten och frontend (WSL Native support).
- **Internal Callbacks**: Realtidsöverföring av xAPI-statements från mikroservice till monolit för poäng- och certifikatuppdateringar.
- **Security Patch**: Öppnat `/api/internal/**` för säkra interna anrop i monolit-backenden.

... (rest of the file)
