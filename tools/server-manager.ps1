function Get-BackendProcess {
    $port = 8080
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        return $connections.OwningProcess
    }
    return $null
}

function Start-Server {
    Write-Host "Starting Backend Server..." -ForegroundColor Green
    $process = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "..\eduflex" -PassThru -NoNewWindow
    Write-Host "Server startup initiated. Logs will appear in this window." -ForegroundColor Yellow
}

function Stop-Server {
    $pid = Get-BackendProcess
    if ($pid) {
        Write-Host "Stopping Server (PID: $pid)..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force
        Write-Host "Server stopped." -ForegroundColor Green
    } else {
        Write-Host "Server is not running on port 8080." -ForegroundColor Red
    }
}

function Show-Status {
    $pid = Get-BackendProcess
    if ($pid) {
        Write-Host "Server STATUS: RUNNING (PID: $pid)" -ForegroundColor Green
    } else {
        Write-Host "Server STATUS: STOPPED" -ForegroundColor Red
    }
}

while ($true) {
    Clear-Host
    Write-Host "===========================" -ForegroundColor Cyan
    Write-Host "  EduFlex Server Manager   " -ForegroundColor Cyan
    Write-Host "===========================" -ForegroundColor Cyan
    Show-Status
    Write-Host "---------------------------"
    Write-Host "[1] Start Server"
    Write-Host "[2] Stop Server"
    Write-Host "[3] Restart Server"
    Write-Host "[Q] Quit"
    Write-Host "==========================="
    
    $input = Read-Host "Choose an option"
    
    switch ($input) {
        "1" { Start-Server; Pause }
        "2" { Stop-Server; Pause }
        "3" { Stop-Server; Start-Server; Pause }
        "Q" { exit }
        "q" { exit }
        Default { Write-Host "Invalid option" -ForegroundColor Red; Pause }
    }
}
