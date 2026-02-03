# start_app.ps1
# Starting backend, frontend, and Cloudflare tunnel.

Write-Host "🚀 Starting database and cache..." -ForegroundColor Gray
docker-compose up -d db redis minio keycloak onlyoffice-ds

Write-Host "🚦 Starting core services (Backend & Frontend)..." -ForegroundColor Green
docker-compose up -d backend frontend

Write-Host "🌐 Starting Cloudflare Tunnel..." -ForegroundColor Blue
C:\cloudflared.exe tunnel --config cloudflared_config.yml run
