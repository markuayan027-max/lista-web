$items = Get-ChildItem -Path 'F:\DOWNLOAD\AI PROJECTS\LISTA\facebook_photos\*.jpg' | Sort-Object Name
Write-Output "Total images: $($items.Count)"
$subset = $items | Select-Object -Skip 700 -First 50
foreach ($x in $subset) {
    Write-Output $x.Name
}
