## In Progress

- [/] Phase 1: Establish SCORM & xAPI Microservice (`eduflex-scorm`)
    - [x] Initial service project structure (v3.6.3.1)
    - [x] Database model & Repository migration (Decoupled)
    - [x] MinIO Storage integration (ScormService, Cmi5Service)
    - [/] LRS Controller & xAPI implementation
    - [ ] Real-time Progress Callback to Monolith
    - [ ] Docker Integration & Networking

### CSN & GDPR Reports
- [x] Skapa eduflex-notifications projektstruktur och pom.xml
- [x] Implementera WebSocket-konfiguration i den nya mikroservicen
- [x] Implementera Redis Pub/Sub integration (Event Bus)
- [x] Refaktorera monoliten (Social, Chat, Logs, Forum, Notiser) till att använda Redis Event Bus
- [x] Uppdatera Vite Proxy och Docker-konfiguration
- [x] Verifiera realtidskommunikation genom den nya mikroservicen (Loggar, Chatt, Notiser)

### Hotfixes
- [x] Fix `api.js` default export issue
- [x] Fix `Bell` ReferenceError in `LandingPage.jsx`
- [x] Fix metadata error in `ClassSkillsHeatmap.jsx`
- [x] Fix AI PPT 500 errors (dedicated endpoint & prompt logic)
- [x] Fix WebSocket 500 errors (frontend WS_BASE routing to port 8085)
- [x] Fix local AI service port (8008) in application.properties

## Next Steps
- [ ] Implement Automated CSN Export Scheduler
- [ ] Add more granular GDPR data filters
- [ ] Prepare for official v3.0.0 release push
