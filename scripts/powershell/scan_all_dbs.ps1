$dbs = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;"
$env:PGPASSWORD = 'gotland81'

foreach ($db_raw in $dbs) {
    $db = $db_raw.Trim()
    if ($db -eq "") { continue }
    
    Write-Host "--- Scanning Database: $db ---"
    
    # Get all schemas
    $schemas = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -d $db -t -c "SELECT nspname FROM pg_namespace WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema';"
    
    foreach ($schema_raw in $schemas) {
        $schema = $schema_raw.Trim()
        if ($schema -eq "") { continue }
        
        # Check if app_users exists in this schema
        $exists = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -d $db -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = '$schema' AND table_name = 'app_users';"
        
        if ($exists.Trim() -eq "1") {
            $userCount = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -d $db -t -c "SELECT count(*) FROM `"$schema`".app_users;"
            Write-Host "  Schema '$schema': $userCount users"
            
            if ($userCount.Trim() -eq "15") {
                Write-Host "  >>> FOUND DATABASE WITH 15 USERS: $db (Schema: $schema) <<<"
            }
        }
        
        # Also check just 'users' table
        $existsUsers = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -d $db -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = '$schema' AND table_name = 'users';"
        if ($existsUsers.Trim() -eq "1") {
            $userCount = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -d $db -t -c "SELECT count(*) FROM `"$schema`".users;"
            Write-Host "  Schema '$schema' (table 'users'): $userCount users"
        }
    }
}
