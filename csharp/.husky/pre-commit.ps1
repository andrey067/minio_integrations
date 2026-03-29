$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path "$PSScriptRoot\..\.."

Write-Host "▶ [csharp] Building..." -ForegroundColor Yellow
Set-Location "$RepoRoot\csharp"
dotnet build MinioDotnet.sln --configuration Release
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ [csharp] Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ [csharp] Build passed" -ForegroundColor Green
