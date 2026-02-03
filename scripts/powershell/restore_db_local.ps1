$env:PGPASSWORD = 'gotland81'
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$db = "eduflex"
$backupFile = "e:\Projekt\EduFlex\backups\daily\eduflex-20260115-clean.sql"

Write-Host "Dropping and recreating public schema in $db..."
& $psql -h localhost -U postgres -p 5432 -d $db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; ALTER SCHEMA public OWNER TO postgres;"

Write-Host "Restoring backup from $backupFile..."
& $psql -h localhost -U postgres -p 5432 -d $db -f $backupFile

Write-Host "Restoration complete."
