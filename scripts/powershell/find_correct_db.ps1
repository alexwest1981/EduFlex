$dbs = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;"
foreach ($db in $dbs) {
    if ($db.trim() -ne "") {
        Write-Host "Checking database: $db"
        $count = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -d $db.trim() -t -c "SELECT count(*) FROM information_schema.tables WHERE table_name = 'app_users';"
        if ($count.trim() -eq "1") {
            $userCount = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -U postgres -p 5432 -d $db.trim() -t -c "SELECT count(*) FROM app_users;"
            Write-Host "Database $db has $userCount users."
        }
        else {
            Write-Host "Database $db does not have app_users table."
        }
    }
}
