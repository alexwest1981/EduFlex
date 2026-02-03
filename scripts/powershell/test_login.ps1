$tenantId = "curl4"

Write-Host "=== Testing Login with X-Tenant-ID header ===" -ForegroundColor Cyan
Write-Host "Tenant ID: $tenantId"

$loginBody = @{
    username = "admin@curl4.local"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Method Post `
        -Uri 'http://localhost:8080/api/auth/login' `
        -ContentType 'application/json' `
        -Headers @{ "X-Tenant-ID" = $tenantId } `
        -Body $loginBody `
        -UseBasicParsing
    
    Write-Host "SUCCESS! Status:" $response.StatusCode -ForegroundColor Green
    Write-Host $response.Content
}
catch {
    Write-Host "Error Status:" $_.Exception.Response.StatusCode.Value__ -ForegroundColor Red
    Write-Host "Error:" $_.Exception.Message
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Body:" $reader.ReadToEnd()
    }
    catch { }
}
