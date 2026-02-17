# EduFlex Control Center v4.0 — Utvecklingsplan

> **Status:** Planerad  
> **Nuvarande version:** v3.0 (WSL2 Docker)  
> **Teknik:** Java Swing (behålla befintlig stack)  
> **Uppskattad tid:** ~5-6 timmar total  
> **Fil:** `tools/control-center-java/src/main/java/com/eduflex/ops/EduFlexControlCenter.java`

---

## Fas 1 — Live Dashboard ⏱️ ~45 min

Ersätter nuvarande tomma startsida med ett realtids-dashboard.

**Komponenter:**
- 5 hälsokort (Backend, Frontend, PostgreSQL, MinIO, OnlyOffice) med status-emoji + responstid
- CPU/RAM/Disk-mätare (JProgressBar-baserade)
- Antal aktiva användare (via `/api/admin/stats` om tillgänglig)
- Event-feed: senaste 20 systemhändelser (startup, krasch, deploy, etc.)
- Auto-refresh var 10:e sekund

**Datakällor:**
| Service | Healthcheck |
|---------|------------|
| Backend | `GET /actuator/health` |
| Frontend | `GET http://localhost:5173` |
| PostgreSQL | Via backend actuator `db` status |
| MinIO | `GET http://localhost:9000/minio/health/live` |
| OnlyOffice | `wsl curl http://localhost:8081/healthcheck` |

---

## Fas 2 — Database Manager ⏱️ ~60 min

GUI för databashantering utan att behöva terminalen.

**Funktioner:**
- **Backup/Restore:** Knappar för `pg_dump` / `pg_restore` med filväljare
- **Migration Status:** Tabell som visar alla Flyway-migrationer (`flyway_schema_history`)
- **Quick Query:** Textfält + kör-knapp, resultat i JTable
- **Tabell-browser:** Lista alla tabeller med radantal och storlek
- **Seed Data:** Knappar: "Skapa testlärare", "Skapa testelever", "Rensa testdata"

**Implementation:**
- JDBC-anslutning direkt till `localhost:5432/eduflex`
- PreparedStatements för alla queries
- Resultat-rendering i JTable med sortering

---

## Fas 3 — Log Viewer ⏱️ ~45 min

Utökad logg-vy med filtrering och sök.

**Funktioner:**
- Per-service flikar (Backend, Frontend, Cloudflare, OnlyOffice, Deploy)
- **Log-level filter:** Knappar för ERROR / WARN / INFO / DEBUG
- **Sök:** Regex-sökfält som highlightar matchande rader
- **Färgkodning:** Röd=ERROR, Gul=WARN, Grå=DEBUG, Vit=INFO
- **Export:** Spara synliga loggar som `.log`-fil
- **Auto-scroll toggle:** Följ / pausa logg-stream
- **Max buffer:** Begränsa till 10 000 rader för att undvika minnesläckor

---

## Fas 4 — Service Manager ⏱️ ~30 min

Smart service-hantering med dependency-kedja.

**Förbättringar:**
- **Dependency-graf:** Starta Backend → startar automatiskt PostgreSQL + MinIO först
- **Service-ordning:** DB → MinIO → Backend → Frontend → Cloudflare → OnlyOffice
- **Watchdog:** Bakgrundstråd som övervakar processer, startar om vid krasch
- **Port-konflikt-check:** Varna om port redan är upptagen innan start
- **Graceful shutdown:** Stäng processer i omvänd ordning vid app-stängning

**Startordning:**
```
1. PostgreSQL (native Windows, behöver bara kontrolleras)
2. MinIO (om Docker, via WSL2)
3. Backend (Spring Boot via run_backend_local.ps1)
4. Frontend (Vite via run_frontend_local.ps1)
5. Cloudflare Tunnel (cloudflared.exe)
6. OnlyOffice (WSL2 Docker)
```

---

## Fas 5 — Deploy Pipeline ⏱️ ~60 min

Visuell deploy-process med pipeline-steg.

**Funktioner:**
- **Pipeline-vy:** Steg visas som kort: `Git Pull → Build → Test → Deploy → Health Check`
- **Varje steg** har status: ⏳ Väntar → 🔄 Pågår → ✅ Klar → ❌ Misslyckades
- **Rollback:** Snabbknapp som kör `git revert` + rebuild
- **Git info:** Visa nuvarande branch, senaste 5 commits, uncommitted changes
- **Pre-deploy checks:** Kontrollera att alla tester passerar innan deploy
- **Deploy-historik:** Tabell med senaste 20 deploys (datum, mål, resultat)

---

## Fas 6 — Config Manager ⏱️ ~30 min

GUI för systemkonfiguration.

**Funktioner:**
- **System Settings:** Redigera `system_settings`-tabellen via formulär (onlyoffice_url, etc.)
- **application.properties:** Visa och redigera backend-config (read-only för säkerhet, edit = ny deploy)
- **Feature Flags:** Slå on/off funktioner
- **Environment:** Visa aktuella env-variabler (JAVA_HOME, etc.)

---

## Fas 7 — System Monitor ⏱️ ~45 min

Resursmätare och process-lista.

**Funktioner:**
- **CPU-graf:** Linjediagram med senaste 60 mätpunkter (via `wmic`)
- **RAM-graf:** Samma format
- **Disk-användning:** Stapeldiagram per drive
- **Process-lista:** Visa EduFlex-relaterade processer med PID, RAM, CPU
- **Docker Stats:** Container-resursanvändning via `wsl docker stats --no-stream`

**Implementation:**
- `wmic` för Windows-system metrics
- Egen ring-buffer (60 entries) för historik
- Enkel canvas-rendering (Graphics2D) för grafer

---

## Fas 8 — Test Runner ⏱️ ~20 min

Kör verifieringsscript med ett klick.

**Funktioner:**
- Lista alla `scripts/verify_*.js` automatiskt
- Kör-knapp per script
- Resultat: ✅ PASS / ❌ FAIL i tabell
- API endpoint-tester: Konfigurerbara URL:er att pinga
- Batch-kör: "Kör alla tester"

---

## Prioriteringsordning

| Prio | Modul | Varför |
|------|-------|--------|
| 1 | Live Dashboard | Mest synbart värde, ger överblick direkt |
| 2 | Database Manager | Mest praktisk nytta i daglig dev |
| 3 | Log Viewer | Mest debugging-värde |
| 4 | Service Manager | Automatiserar startordning |
| 5 | Deploy Pipeline | Förbättrar deploy-processen |
| 6 | Config Manager | Bekvämlighet |
| 7 | System Monitor | Nice-to-have |
| 8 | Test Runner | Kompletterande |

---

## Filstruktur efter ombyggnad

```
tools/control-center-java/
├── Launch-Java.ps1
├── src/main/java/com/eduflex/ops/
│   ├── EduFlexControlCenter.java   # Huvudfönster + sidebar
│   ├── panels/
│   │   ├── DashboardPanel.java     # Fas 1: Live dashboard
│   │   ├── DatabasePanel.java      # Fas 2: DB manager
│   │   ├── LogViewerPanel.java     # Fas 3: Log viewer
│   │   ├── ServicePanel.java       # Fas 4: Service manager
│   │   ├── DeployPanel.java        # Fas 5: Deploy pipeline
│   │   ├── ConfigPanel.java        # Fas 6: Config manager
│   │   ├── MonitorPanel.java       # Fas 7: System monitor
│   │   └── TestRunnerPanel.java    # Fas 8: Test runner
│   ├── services/
│   │   ├── HealthChecker.java      # Polling-service för alla tjänster
│   │   ├── WslDockerService.java   # WSL2 Docker wrapper
│   │   ├── DatabaseService.java    # JDBC-anslutning + queries
│   │   └── ProcessManager.java     # Start/stop/watchdog
│   └── util/
│       ├── ThemeManager.java       # Dark mode färger
│       └── EventBus.java           # Intern event-hantering
```
