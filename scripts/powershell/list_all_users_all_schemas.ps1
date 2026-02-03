$schemas = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -d eduflex -t -P pager=off -c "SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema';"
$env:PGPASSWORD = 'gotland81'

foreach ($schema_raw in $schemas) {
    $schema = $schema_raw.Trim()
    if ($schema -eq "") { continue }
    
    Write-Host "--- Schema: $schema ---"
    
    # Check if app_users exists
    $exists = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -d eduflex -t -P pager=off -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = '$schema' AND table_name = 'app_users';"
    
    if ($exists.Trim() -eq "1") {
        # Search for Gunnar, Alex, Britt or just list all
        $users = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -d eduflex -t -P pager=off -c "SELECT username, first_name, last_name FROM `"$schema`".app_users;"
        Write-Host $users
    }
    else {
        Write-Host "app_users table NOT found."
    }
}
