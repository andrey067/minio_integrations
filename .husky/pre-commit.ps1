```powershell
# Pre-commit script for Windows
Write-Host "Running pre-commit checks..." -ForegroundColor Green

# Restore .NET tools
Write-Host "Restoring .NET tools..." -ForegroundColor Yellow
dotnet tool restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to restore .NET tools" -ForegroundColor Red
    exit 1
}

# Format C# files with CSharpier
Write-Host "Formatting C# files with CSharpier..." -ForegroundColor Yellow
dotnet tool run csharpier format .
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to format C# files with CSharpier" -ForegroundColor Red
    exit 1
}

Write-Host "Checking C# formatting with CSharpier..." -ForegroundColor Yellow
dotnet tool run csharpier check .
if ($LASTEXITCODE -ne 0) {
    Write-Host "C# files are still not properly formatted after automatic formatting" -ForegroundColor Red
    exit 1
}

# Build the solution
Write-Host "Building solution..." -ForegroundColor Yellow
dotnet build --configuration Release --no-restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "All pre-commit checks passed!" -ForegroundColor Green
