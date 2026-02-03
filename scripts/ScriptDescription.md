# Script Descriptions

This file documents the purposes and usage of scripts in this directory.

## powershell/

### [run_backend_local.ps1](file:///e:/Projekt/EduFlex/scripts/powershell/run_backend_local.ps1)
Runs the Spring Boot backend locally with necessary environment variables, stopping any existing Docker backend container to free port 8080.
Run with: `.\scripts\powershell\run_backend_local.ps1`

### [cold_start.ps1](file:///e:/Projekt/EduFlex/scripts/powershell/cold_start.ps1)
A comprehensive script for a fresh start. It cleans up stale processes (Cloudflared, Java, Node), starts Docker infrastructure, and launches Backend, Frontend, and the Cloudflare Tunnel in separate windows.
Run with: `.\scripts\powershell\cold_start.ps1`

### [install_local_services.ps1](file:///e:/Projekt/EduFlex/scripts/powershell/install_local_services.ps1)
Installs PostgreSQL, Redis, and MinIO locally on Windows via Chocolatey for development without Docker. Creates necessary directories and startup scripts.
Run with: `.\scripts\powershell\install_local_services.ps1`

### [reinstall_docker.ps1](file:///e:/Projekt/EduFlex/scripts/powershell/reinstall_docker.ps1)
Completely uninstalls and reinstalls Docker Desktop to fix chronic stability issues. Includes WSL2 cleanup, file removal, and fresh installation.
Run with: `.\scripts\powershell\reinstall_docker.ps1`

### [LocalFix_Start.ps1](file:///e:/Projekt/EduFlex/scripts/powershell/LocalFix_Start.ps1)
The master startup script for the local (no-Docker) fix. Starts PostgreSQL, Redis, MinIO, Backend, Frontend (port 5174), and Cloudflare Tunnel in separate windows.
Run with: `.\scripts\powershell\LocalFix_Start.ps1`

### [migrate_gemini.ps1](file:///e:/Projekt/EduFlex/scripts/powershell/migrate_gemini.ps1)
Handles migration/setup tasks related to Google Gemini integration.

### [patch_calendar_service.ps1](file:///e:/Projekt/EduFlex/scripts/powershell/patch_calendar_service.ps1)
Applies patches to the Calendar service.

### [migrate_env_to_db.ps1](file:///e:/Projekt/EduFlex/scripts/powershell/migrate_env_to_db.ps1)
Migrates sensitive API keys (Stripe, Gemini) and system URLs from the `.env` file to the database. Requires the backend to be running.
Run with: `.\scripts\powershell\migrate_env_to_db.ps1`

## python/

### [skolverket_scraper.py](file:///e:/Projekt/EduFlex/scripts/python/skolverket_scraper.py)
Scrapes data from Skolverket (Swedish National Agency for Education) for educational content.

### [import_skolverket_data.py](file:///e:/Projekt/EduFlex/scripts/python/import_skolverket_data.py)
Imports the scraped Skolverket data into the EduFlex database.

### [update_translations.py](file:///e:/Projekt/EduFlex/scripts/python/update_translations.py)
Helper script to update i18n translation files.

### [verify_nlm.py](file:///e:/Projekt/EduFlex/scripts/python/verify_nlm.py)
Verifies NLM (Natural Language Model) components.

### [lti_simulator.py](file:///e:/Projekt/EduFlex/scripts/python/lti_simulator.py)
Simulates an LTI 1.3 launch, including a mock JWKS server on port 9999, to verify backend integration.
Run with: `python scripts/python/lti_simulator.py`

## utils/

### [deduplicate_i18n.js](file:///e:/Projekt/EduFlex/scripts/utils/deduplicate_i18n.js)
Deduplicates keys in `sv/translation.json` and `en/translation.json` by parsing and re-stringifying them.
Run with: `node scripts/utils/deduplicate_i18n.js`

### [verify_features.js](file:///e:/Projekt/EduFlex/scripts/utils/verify_features.js)
JavaScript-based feature verification script.

### [sync_translations.js](file:///e:/Projekt/EduFlex/scripts/sync_translations.js)
Synchronizes translation keys from `sv/translation.json` to all other language files.
- If `DEEPL_API_KEY` is set in the environment, it uses DeepL API to translate missing keys.
- If no key is present, it marks missing keys with `[MISSING]`.
Run with: `node scripts/sync_translations.js` (or `$env:DEEPL_API_KEY="your-key"; node scripts/sync_translations.js`)
