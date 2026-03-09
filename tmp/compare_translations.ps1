$languages = @('ar', 'da', 'de', 'en', 'es', 'fi', 'fr', 'no')
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
$diffs = @()

function Get-Keys ($json, $prefix = "") {
    $keys = @()
    foreach ($prop in $json.psobject.Properties) {
        $key = if ($prefix) { "$prefix.$($prop.Name)" } else { $prop.Name }
        if ($prop.Value -is [System.Management.Automation.PSCustomObject]) {
            $keys += Get-Keys $prop.Value $key
        }
        else {
            $keys += $key
        }
    }
    return $keys
}

foreach ($dir in $localeDirs) {
    $svPath = Join-Path $srcDir "$dir/sv.json"
    if ($dir -eq 'src/locales') { $svPath = Join-Path $srcDir "$dir/sv/translation.json" }
    
    if (-not (Test-Path $svPath)) { continue }
    
    $svJson = Get-Content $svPath -Raw | ConvertFrom-Json
    $svKeys = Get-Keys $svJson
    
    foreach ($lang in $languages) {
        $langPath = Join-Path $srcDir "$dir/$lang.json"
        if ($dir -eq 'src/locales') { $langPath = Join-Path $srcDir "$dir/$lang/translation.json" }
        
        if (Test-Path $langPath) {
            $langJson = Get-Content $langPath -Raw | ConvertFrom-Json
            $langKeys = Get-Keys $langJson
            
            $missingKeys = Compare-Object -ReferenceObject $svKeys -DifferenceObject $langKeys | Where-Object { $_.SideIndicator -eq '<=' } | Select-Object -ExpandProperty InputObject
            
            foreach ($key in $missingKeys) {
                $diffs += [PSCustomObject]@{
                    Directory  = $dir
                    Language   = $lang
                    MissingKey = $key
                }
            }
        }
    }
}

$diffs | Export-Csv -Path "e:/Projekt/EduFlex/tmp/translation_diffs.csv" -NoTypeInformation
$diffs | Format-Table -AutoSize
