# Migration script for EduFlex
# Moves sensitive keys from .env to the database

$baseUrl = "http://localhost:8080/api"
$envFile = ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env file not found" -ForegroundColor Red
    exit
}

# 1. Login to get token
Write-Host "Logging in as admin..."
$loginBody = @{
    username = "admin"
    password = "admin"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "Login successful." -ForegroundColor Green
}
catch {
    Write-Host "Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json"
}

# 2. Parse .env
Write-Host "Parsing .env file..."
$envVars = @{}
Get-Content $envFile | Where-Object { $_ -match "^[^#].+=.+" } | ForEach-Object {
    $parts = $_ -split "=", 2
    $key = $parts[0].Trim()
    $val = $parts[1].Trim()
    $envVars[$key] = $val
}

# 3. Migrate Stripe Settings
$stripeKey = $envVars["STRIPE_SECRET_KEY"]
$stripeWebhook = $envVars["STRIPE_WEBHOOK_SECRET"]
$domainUrl = $envVars["EDUFLEX_DOMAIN_URL"]

if ($stripeKey -or $stripeWebhook -or $domainUrl) {
    Write-Host "Migrating Stripe settings..."
    
    # Get existing settings
    $settings = Invoke-RestMethod -Uri "$baseUrl/payment-settings" -Method Get -Headers $headers
    $stripeSettings = $settings | Where-Object { $_.provider -eq "STRIPE" } | Select-Object -First 1

    $payload = @{
        provider       = "STRIPE"
        apiKey         = if ($stripeKey) { $stripeKey } else { $stripeSettings.apiKey }
        webhookSecret  = if ($stripeWebhook) { $stripeWebhook } else { $stripeSettings.webhookSecret }
        domainUrl      = if ($domainUrl) { $domainUrl } else { "http://localhost:5174" }
        isTestMode     = $true
        isActive       = $true
        enabledMethods = "CARD,SWISH,INVOICE"
    }

    if ($stripeSettings) {
        $id = $stripeSettings.id
        Invoke-RestMethod -Uri "$baseUrl/payment-settings/$id" -Method Put -Headers $headers -Body ($payload | ConvertTo-Json)
        Write-Host "Stripe settings updated (ID: $id)." -ForegroundColor Green
    }
    else {
        Invoke-RestMethod -Uri "$baseUrl/payment-settings" -Method Post -Headers $headers -Body ($payload | ConvertTo-Json)
        Write-Host "Stripe settings created." -ForegroundColor Green
    }
}

# 4. Migrate Gemini Key
$geminiKey = $envVars["GEMINI_API_KEY"]
if ($geminiKey) {
    Write-Host "Migrating Gemini API key..."
    $aiPayload = @{
        apiKey = $geminiKey
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "$baseUrl/ai/quiz/config/api-key" -Method Post -Headers $headers -Body $aiPayload
        Write-Host "Gemini API key migrated successfully." -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to migrate Gemini key: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Migration complete!" -ForegroundColor Cyan
