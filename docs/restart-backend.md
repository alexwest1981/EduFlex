---
description: Safely restart the backend by ensuring port 8080 is free first.
---

1. Stop any process listening on port 8080 (Windows/PowerShell).
   ```powershell
   $process = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue; if ($process) { Stop-Process -Id $process.OwningProcess -Force }
   ```
   // turbo

2. Start the Spring Boot application.
   ```bash
   cd e:\Projekt\EduFlex\eduflex
   mvn spring-boot:run
   ```
