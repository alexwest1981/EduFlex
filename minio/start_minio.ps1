# Start MinIO Server
$env:MINIO_ROOT_USER = "minioadmin"
$env:MINIO_ROOT_PASSWORD = "minioadmin"
Start-Process -FilePath "E:\Projekt\EduFlex\minio\minio.exe" -ArgumentList "server", "E:\Projekt\EduFlex\minio-data", "--console-address", ":9001" -WindowStyle Normal
Write-Host "MinIO started on http://localhost:9000 (Console: http://localhost:9001)" -ForegroundColor Green
