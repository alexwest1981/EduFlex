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
$results = @()

foreach ($dir in $localeDirs) {
    foreach ($lang in $languages) {
        $filePath = Join-Path $srcDir "$dir/$lang.json"
        if ($dir -eq 'src/locales') {
            # Standard locales are often in src/locales/{lang}/translation.json
            $filePath = Join-Path $srcDir "$dir/$lang/translation.json"
        }
        
        if (Test-Path $filePath) {
            $size = (Get-Item $filePath).Length
            $results += [PSCustomObject]@{
                Directory = $dir
                Language  = $lang
                Size      = $size
                Status    = "Exists"
                Path      = $filePath
            }
        }
        else {
            $results += [PSCustomObject]@{
                Directory = $dir
                Language  = $lang
                Size      = 0
                Status    = "Missing"
                Path      = $filePath
            }
        }
    }
}

$results | Export-Csv -Path "e:/Projekt/EduFlex/tmp/translation_audit.csv" -NoTypeInformation
$results | Format-Table -AutoSize
