## In Progress

- [/] Phase 1: Establish SCORM & xAPI Microservice (`eduflex-scorm`)
    - [x] Initial service project structure (v3.6.3.1)
    - [x] Database model & Repository migration (Decoupled)
    - [x] MinIO Storage integration (ScormService, Cmi5Service)
    - [/] LRS Controller & xAPI implementation
    - [ ] Real-time Progress Callback to Monolith
    - [ ] Docker Integration & Networking

### CSN & GDPR Reports
- [x] Research Attendance & Audit models
- [x] Create `CsnReportService`
- [x] Create `GdprAuditService`
- [x] Update `ReportController` and `ReportLibrary`
- [x] Update Sidebar & Dashboard navigation (Added explicit CSN links)
- [x] Verify exports and logs

### Hotfixes
- [x] Fix `api.js` default export issue
- [x] Fix `Bell` ReferenceError in `LandingPage.jsx`
- [x] Fix metadata error in `ClassSkillsHeatmap.jsx`

## Next Steps
- [ ] Implement Automated CSN Export Scheduler
- [ ] Add more granular GDPR data filters
- [ ] Prepare for official v3.0.0 release push
