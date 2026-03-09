$languages = @('ar', 'da', 'de', 'en', 'es', 'fi', 'fr', 'no', 'sv')
$localeDirs = @(
    'src/locales',
    'src/features/calendar/locales',
    'src/features/catalog/locales',
    'src/features/documents/locales',
    'src/features/profile/locales',
    'src/modules/assignments/locales',
    'src/modules/chat/locales',
    'src/modules/forum/locales',
    'src/modules/gamification/locales',
    'src/modules/quiz-runner/locales'
)

$srcDir = "e:/Projekt/EduFlex/frontend"
$stats = @()

function Count-Keys ($json) {
    $count = 0
    foreach ($prop in $json.psobject.Properties) {
        $count++
        if ($prop.Value -is [System.Management.Automation.PSCustomObject]) {
            $count += Count-Keys $prop.Value
        }
    }
    return $count
}

foreach ($dir in $localeDirs) {
    foreach ($lang in $languages) {
        $filePath = Join-Path $srcDir "$dir/$lang.json"
        if ($dir -eq 'src/locales') { $filePath = Join-Path $srcDir "$dir/$lang/translation.json" }
        
        if (Test-Path $filePath) {
            try {
                $json = Get-Content $filePath -Raw | ConvertFrom-Json
                $keyCount = Count-Keys $json
                $stats += [PSCustomObject]@{
                    Directory = $dir
                    Language  = $lang
                    KeyCount  = $keyCount
                }
            }
            catch {
                $stats += [PSCustomObject]@{
                    Directory = $dir
                    Language  = $lang
                    KeyCount  = -1 # Error
                }
            }
        }
    }
}

$stats | Export-Csv -Path "e:/Projekt/EduFlex/tmp/translation_key_counts.csv" -NoTypeInformation
$stats | Format-Table -AutoSize
