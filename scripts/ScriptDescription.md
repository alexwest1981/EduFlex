# Script Descriptions

This file documents the purpose of each script in the `scripts` directory to ensure clarity and avoid duplicates.

## PowerShell (`scripts/powershell`)
- `find_correct_db.ps1`: Searches for the correct database schema/backup.
- `list_all_users_all_schemas.ps1`: Lists all users across all identified database schemas.
- `rebuild_backend.ps1`: Rebuilds the backend Docker container.
- `restart_all.ps1`: Multi-purpose script to restart the entire stack (backend, frontend, DB).
- `restore_db_local.ps1`: Restores a local DB backup to the PostgreSQL container.
- `scan_all_dbs.ps1`: Scans all database files in the system.
- `test_login.ps1`: Automates a login test against the API.
- `test_tenant.ps1`: Tests tenant resolution logic.

## Python (`scripts/python`)
- `import_skolverket_data.py`: Imports official course data from Skolverket.
- `skolverket_scraper.py`: Scrapes course information from Skolverket's website.
- `test_login.py`: alternative Python implementation for login testing.
- `update_translations.py`: Syncs and updates i18next translation files.

## Batch (`scripts/batch`)
- `restore-database.bat`: Legacy script for DB restoration.
- `restore-database-fixed.bat`: Updated/Fixed version of the DB restoration script.

## SQL (`scripts/sql`)
- `check_tenants_full.sql`: Comprehensive check of all tenant data.
- `count_users.sql`: Simple script to count total system users.
- `fix_modules.sql`: Fixes module configuration issues.
- `fix_modules_public.sql`: Specific fix for the public tenant modules.
- `total_user_count.sql`: Analytics query for user statistics.
