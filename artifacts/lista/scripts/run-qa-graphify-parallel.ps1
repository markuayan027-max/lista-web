# Run graphify query per QA area in parallel, write subgraphs to graphify-out/qa-runs/
# Usage: .\scripts\run-qa-graphify-parallel.ps1
# Then paste each qa-runs/*.txt into a separate Cursor Agent chat.

$ErrorActionPreference = "Stop"
$py = "$env:APPDATA\uv\tools\graphifyy\Scripts\python.exe"
if (-not (Test-Path $py)) { throw "graphify python not found at $py" }

$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (Test-Path (Join-Path $PSScriptRoot "..\src\App.tsx")) {
  $listaRoot = Split-Path $PSScriptRoot -Parent
} else {
  $listaRoot = "c:\Users\PC\Documents\LISTA\artifacts\lista"
}
Set-Location $listaRoot

$outDir = Join-Path $listaRoot "graphify-out\qa-runs"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$areas = [ordered]@{
  "01-public"  = "HomePage CoursesPage AssessmentPage ScholarshipsPage CourseDetailPage NewsDetailPage AdmissionsPage"
  "02-auth"    = "LoginPage SignupPage ForgotPasswordPage AuthCallbackPage AuthProvider mapInsForgeUser Protected"
  "03-trainee" = "TraineeRegistrationPage TraineeEnrollPage TraineeProfilePage TraineeTrackingPage trainee-enrollment-insforge registerTraineeFromForm"
  "04-staff"   = "StaffEnrollmentsPage StaffSearchPage StaffSchedulePage StaffOverviewPage StaffAnnouncementsPage"
  "05-admin"   = "AdminEnrollmentsPage AdminUsersPage AdminCertificatesPage AdminExportPage AdminAnnouncementsPage useBulkUpdateEnrollmentStatus"
  "06-shared"  = "PrintModal printable-tesda-form EnrollmentCard StatusBadge Protected use-lista-data lista-insforge-data"
  "07-api"     = "lista-insforge-data fetch updateEnrollmentStatus inviteUser updateUserRole"
}

$jobs = foreach ($kv in $areas.GetEnumerator()) {
  $name = $kv.Key
  $query = $kv.Value
  $outFile = Join-Path $outDir "$name.txt"
  Start-Job -Name $name -ScriptBlock {
    param($py, $dir, $query, $outFile)
    Set-Location $dir
    $header = "graphify query: $query`n$(Get-Date -Format o)`n`n"
    $body = & $py -m graphify query $query --budget 2000 2>&1 |
      Where-Object { $_ -notmatch '\.vercel' }
    Set-Content -Path $outFile -Value ($header + ($body -join "`n")) -Encoding utf8
  } -ArgumentList $py, $listaRoot, $query, $outFile
}

Write-Host "Started $($jobs.Count) graphify jobs..."
$jobs | Wait-Job | Out-Null
$jobs | Receive-Job
$jobs | Remove-Job

Write-Host "Done. Outputs: $outDir"
Get-ChildItem $outDir -Filter "*.txt" | ForEach-Object { Write-Host "  $($_.Name) ($($_.Length) bytes)" }
