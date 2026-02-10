# =============================================================
#  EduFlex Deploy Script
#  Bygger och deployar till produktion (eduflexlms.se)
# =============================================================
param(
    [ValidateSet("all", "backend", "frontend", "both")]
    [string]$Target = "both",
    [switch]$NoPull,
    [switch]$Logs
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host ""
Write-Host "  EduFlex Deploy" -ForegroundColor Cyan
Write-Host "  Target: $Target" -ForegroundColor Gray
Write-Host "  ========================================" -ForegroundColor DarkGray
Write-Host ""

# --- Steg 1: Git status ---
Write-Host "[1/4] Kontrollerar git-status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "  VARNING: Du har ocommittade andringar:" -ForegroundColor Red
    git status --short
    Write-Host ""
    $continue = Read-Host "  Fortsatt anda? (j/n)"
    if ($continue -ne "j") {
        Write-Host "  Avbryter." -ForegroundColor Gray
        exit 0
    }
}
else {
    Write-Host "  Git: Rent arbetstriad" -ForegroundColor Green
}

# --- Steg 2: Bygga Docker-images ---
Write-Host ""
Write-Host "[2/4] Bygger Docker-images..." -ForegroundColor Yellow

$services = @()
switch ($Target) {
    "backend"  { $services = @("backend") }
    "frontend" { $services = @("frontend") }
    "both"     { $services = @("backend", "frontend") }
    "all"      { $services = @() } # docker compose build utan argument = allt
}

$buildStart = Get-Date
if ($services.Count -gt 0) {
    Write-Host "  Bygger: $($services -join ', ')" -ForegroundColor Gray
    docker compose build --no-cache $services
}
else {
    Write-Host "  Bygger: ALLA tjanster" -ForegroundColor Gray
    docker compose build --no-cache
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "  BUILD MISSLYCKADES!" -ForegroundColor Red
    exit 1
}

$buildTime = [math]::Round(((Get-Date) - $buildStart).TotalSeconds)
Write-Host "  Build klar ($buildTime s)" -ForegroundColor Green

# --- Steg 3: Starta om containers ---
Write-Host ""
Write-Host "[3/4] Startar om containers..." -ForegroundColor Yellow

if ($services.Count -gt 0) {
    docker compose up -d $services
}
else {
    docker compose up -d
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "  UPPSTART MISSLYCKADES!" -ForegroundColor Red
    exit 1
}
Write-Host "  Containers startade" -ForegroundColor Green

# --- Steg 4: Verifiera ---
Write-Host ""
Write-Host "[4/4] Verifierar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$running = docker compose ps --format "table {{.Name}}\t{{.Status}}" 2>&1
Write-Host $running

# Kolla backend health
if ($Target -ne "frontend") {
    Write-Host ""
    Write-Host "  Vantar pa backend health check..." -ForegroundColor Gray
    $maxRetries = 12
    $retry = 0
    $healthy = $false
    while ($retry -lt $maxRetries) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 3 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $healthy = $true
                break
            }
        }
        catch { }
        $retry++
        Write-Host "  Retry $retry/$maxRetries..." -ForegroundColor DarkGray
        Start-Sleep -Seconds 5
    }

    if ($healthy) {
        Write-Host "  Backend: HEALTHY" -ForegroundColor Green
    }
    else {
        Write-Host "  Backend: Svarar inte annu (kan ta lite langre)" -ForegroundColor Yellow
        Write-Host "  Kolla loggar: docker compose logs -f backend" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "  ========================================" -ForegroundColor DarkGray
Write-Host "  Deploy klar!" -ForegroundColor Green
Write-Host "  https://eduflexlms.se" -ForegroundColor Cyan
Write-Host ""

if ($Logs) {
    Write-Host "  Visar loggar (Ctrl+C for att avsluta)..." -ForegroundColor Gray
    docker compose logs -f $services
}
