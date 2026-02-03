# rebuild_all.ps1
# Full rebuild of all Docker containers and starting the Cloudflare tunnel.

Write-Host "🛑 Stopping all containers..." -ForegroundColor Yellow
docker-compose down

Write-Host "🏗️ Rebuilding and starting containers (this may take a while)..." -ForegroundColor Green
docker-compose up -d --build

Write-Host "🌐 Starting Cloudflare Tunnel..." -ForegroundColor Blue
C:\cloudflared.exe tunnel --config cloudflared_config.yml run
