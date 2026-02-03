# Script to AGGRESSIVELY move Docker Desktop to E:
# Usage: .\scripts\powershell\force_move_docker.ps1

$ErrorActionPreference = "Stop"
$targetRoot = "E:\Docker"
$distro = "docker-desktop"
$targetDir = "$targetRoot\$distro"
$tarFile = "$targetRoot\$distro.tar"

Write-Host "=== FORCING Docker Data to E: Drive ===" -ForegroundColor Red

# 1. KILL EVERYTHING
Write-Host "Killing Docker processes..." -ForegroundColor Yellow
Stop-Process -Name "Docker Desktop" -Force -ErrorAction SilentlyContinue
Stop-Service com.docker.service -Force -ErrorAction SilentlyContinue
wsl --shutdown
Start-Sleep -Seconds 5

# 2. CHECK IF REGISTRY SAYS C:
$reg = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss\*" -ErrorAction SilentlyContinue | Where-Object { $_.DistributionName -eq $distro }
if ($reg.BasePath -match "C:") {
    Write-Host "Detected $distro on C:. Proceeding with move." -ForegroundColor Cyan
    
    # 3. EXPORT
    if (!(Test-Path $tarFile)) {
        Write-Host "Exporting to $tarFile (This takes time)..." -ForegroundColor Yellow
        wsl --export $distro $tarFile
    }
    else {
        Write-Host "Found existing backup at $tarFile. Using it." -ForegroundColor Green
    }

    # 4. UNREGISTER
    Write-Host "Unregistering from C:..." -ForegroundColor Yellow
    wsl --unregister $distro

    # 5. IMPORT TO E:
    if (!(Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
    Write-Host "Importing to $targetDir..." -ForegroundColor Yellow
    wsl --import $distro $targetDir $tarFile --version 2
    
    # 6. VERIFY REGISTRY IMMEDIATELY
    $newReg = Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Lxss\*" | Where-Object { $_.DistributionName -eq $distro }
    Write-Host "New Registry BasePath: $($newReg.BasePath)" -ForegroundColor Magenta
    
    if ($newReg.BasePath -like "E:*") {
        Write-Host "SUCCESS: Registry points to E:" -ForegroundColor Green
        Remove-Item $tarFile -Force
    }
    else {
        Write-Host "FAILURE: Registry still points to C:!" -ForegroundColor Red
        exit 1
    }

}
else {
    Write-Host "It seems $distro is ALREADY on E: (BasePath: $($reg.BasePath))" -ForegroundColor Green
}

Write-Host "`n=== DONE. Starting Docker... ===" -ForegroundColor Cyan
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
