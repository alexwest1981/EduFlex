$json = Get-Content -Raw "test_tenant.json"
try {
    $response = Invoke-WebRequest -Method Post -Uri 'http://localhost:8080/api/tenants' -ContentType 'application/json' -Body $json
    Write-Host "SUCCESS! Status:" $response.StatusCode
    Write-Host $response.Content
}
catch {
    Write-Host "Error Status:" $_.Exception.Response.StatusCode.Value__
    Write-Host "Error:" $_.Exception.Message
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    Write-Host "Body:" $reader.ReadToEnd()
}
