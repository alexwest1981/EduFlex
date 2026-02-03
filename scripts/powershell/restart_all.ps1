# EduFlex Restart Script
# This script stops all containers, kills stuck processes on ports, and restarts everything.

Write-Host "Stopping all Docker containers..." -ForegroundColor Yellow
docker-compose down

$ports = @(8080, 5173, 5174, 8180, 9000, 9001, 5433, 6379, 3000, 9090)

foreach ($port in $ports) {
    Write-Host "Checking for processes on port $port..." -ForegroundColor Cyan
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            if ($processId -gt 0) {
                try {
                    $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                    if ($process) {
                        $processName = $process.Name
                        Write-Host "Killing process $processName (PID: $processId) on port $port" -ForegroundColor Red
                        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    }
                }
                catch {
                    Write-Host "Could not stop process PID $processId" -ForegroundColor Gray
                }
            }
        }
    }
}

Write-Host "Restarting the entire system..." -ForegroundColor Green
docker-compose up -d

Write-Host "Done! The system is starting in the background." -ForegroundColor Green
Write-Host "Use 'docker ps' to see status."
