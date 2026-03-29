$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path "$PSScriptRoot\..\.."

Write-Host "▶ [nodejs] Building MinioNodejs.Services..." -ForegroundColor Yellow
Set-Location "$RepoRoot\nodejs\MinioNodejs.Services"
npm install --silent
npm run build:check
if ($LASTEXITCODE -ne 0) { Write-Host "✗ [nodejs] Services build failed" -ForegroundColor Red; exit 1 }

Write-Host "▶ [nodejs] Building MinioNodejs..." -ForegroundColor Yellow
Set-Location "$RepoRoot\nodejs\MinioNodejs"
npm install --silent
npm run build:check
if ($LASTEXITCODE -ne 0) { Write-Host "✗ [nodejs] App build failed" -ForegroundColor Red; exit 1 }

Write-Host "✓ [nodejs] Build passed" -ForegroundColor Green
