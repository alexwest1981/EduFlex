# Utvecklings- och Driftsättningsmiljö för EduFlex

Detta dokument beskriver de strikta miljöregler som gäller för EduFlex-projektet för att säkerställa stabilitet och prestanda.

## 🛡️ Grundregler (Must Follow)
1. **WSL (Windows Subsystem for Linux)**: All körning av kod, Maven-byggen och script sker uteslutande i WSL-miljön.
2. **Inga Docker Desktop-kopplingar**: Vi använder WSL-nativ Docker-motor om Docker behövs, men undviker Docker Desktop-integrationer för att förhindra nätverks- och filsystemskonflikter.
3. **Logghantering**: Alla loggfiler SKALL ligga i en mapp som heter `logs` i projektroten. Denna mapp är exkluderad i `.gitignore`.
4. **Storage (MinIO)**: Vi använder ALLTID MinIO för all form av lagring. Ingen lokal `localStorage` eller direkt filsystemslagring utanför MinIO-containern i produktion.
5. **Autentisering**: Standardinloggning för admin under utveckling är `admin` / `123`.

## 🛠️ Script och Verktyg
Alla hjälpskript finns i mappen `scripts/` och är kategoriserade för att underlätta navigering. Se [ScriptDescription.md](file:///e:/Projekt/EduFlex/scripts/ScriptDescription.md) för en fullständig lista och beskrivning av varje skript.

### Viktiga Startskript:
- `.\scripts\powershell\run_backend_local.ps1`: Startar huvudbackenden stabilt.
- `.\scripts\powershell\run_notifications_local.ps1`: Startar notifikations-mikrotjänsten.
- `.\scripts\powershell\run_scorm_local.ps1`: Startar SCORM-mikrotjänsten.

## 🚀 Git-rutiner
Innan varje `git push` ska följande ske:
1. Sammanfatta alla ändringar sedan förra pushen.
2. Uppdatera `README.md` under sektionen "Senaste uppdateringarna".
3. Kontrollera att ingen känslig data eller `Tools/`-mappen inkluderas i commiten.
