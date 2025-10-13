# Script PowerShell para automação do projeto .NET MinIO
param(
    [Parameter(Position=0)]
    [string]$Command = "help",

    [Parameter()]
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Message)
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Show-Help {
    Write-Host @"
Comandos disponíveis para o projeto MinIO .NET:

  help               Exibe esta mensagem de ajuda
  install            Instala dependências do projeto
  restore            Restaura pacotes NuGet
  tools-restore      Restaura ferramentas .NET
  format             Formata código C# usando CSharpier
  check              Verifica formatação do código C#
  build              Compila o projeto
  test               Executa testes
  clean              Limpa arquivos de build
  pre-commit         Executa verificações de pre-commit
  setup-dev          Configura ambiente de desenvolvimento
  ci                 Pipeline completo de CI

Uso: .\build.ps1 <comando> [-Configuration <Debug|Release>]

Exemplos:
  .\build.ps1 setup-dev
  .\build.ps1 build -Configuration Debug
  .\build.ps1 pre-commit
"@ -ForegroundColor Yellow
}

function Install-Dependencies {
    Write-Header "Instalando dependências"

    try {
        Write-Host "Restaurando ferramentas .NET..."
        dotnet tool restore

        Write-Host "Restaurando pacotes NuGet..."
        dotnet restore

        Write-Host "Instalando hooks do pre-commit..."
        pre-commit install

        Write-Success "Dependências instaladas com sucesso!"
    }
    catch {
        Write-Error "Erro ao instalar dependências: $_"
        exit 1
    }
}

function Restore-Packages {
    Write-Header "Restaurando pacotes NuGet"

    try {
        dotnet restore
        Write-Success "Pacotes restaurados com sucesso!"
    }
    catch {
        Write-Error "Erro ao restaurar pacotes: $_"
        exit 1
    }
}

function Restore-Tools {
    Write-Header "Restaurando ferramentas .NET"

    try {
        dotnet tool restore
        Write-Success "Ferramentas restauradas com sucesso!"
    }
    catch {
        Write-Error "Erro ao restaurar ferramentas: $_"
        exit 1
    }
}

function Format-Code {
    Write-Header "Formatando código C#"

    try {
        dotnet csharpier format .
        Write-Success "Código formatado com sucesso!"
    }
    catch {
        Write-Error "Erro ao formatar código: $_"
        exit 1
    }
}

function Check-Format {
    Write-Header "Verificando formatação do código"

    try {
        dotnet csharpier check .
        Write-Success "Formatação verificada com sucesso!"
    }
    catch {
        Write-Error "Código não está formatado corretamente"
        exit 1
    }
}

function Build-Project {
    Write-Header "Compilando projeto ($Configuration)"

    try {
        dotnet build --configuration $Configuration --no-restore
        Write-Success "Projeto compilado com sucesso!"
    }
    catch {
        Write-Error "Erro ao compilar projeto: $_"
        exit 1
    }
}

function Run-Tests {
    Write-Header "Executando testes"

    try {
        dotnet test --configuration $Configuration --no-build --verbosity normal
        Write-Success "Testes executados com sucesso!"
    }
    catch {
        Write-Error "Falha nos testes: $_"
        exit 1
    }
}

function Clean-Project {
    Write-Header "Limpando arquivos de build"

    try {
        dotnet clean
        Write-Success "Arquivos limpos com sucesso!"
    }
    catch {
        Write-Error "Erro ao limpar arquivos: $_"
        exit 1
    }
}

function Run-PreCommit {
    Write-Header "Executando verificações de pre-commit"

    try {
        pre-commit run --all-files
        Write-Success "Pre-commit checks concluídos com sucesso!"
    }
    catch {
        Write-Error "Falha no pre-commit: $_"
        exit 1
    }
}

function Setup-Development {
    Write-Header "Configurando ambiente de desenvolvimento"

    Install-Dependencies
    Restore-Tools
    Restore-Packages
    Format-Code
    Build-Project

    Write-Success "Ambiente de desenvolvimento configurado!"
}

function Run-CI {
    Write-Header "Executando pipeline de CI"

    try {
        Write-Host "1. Restaurando ferramentas..."
        dotnet tool restore

        Write-Host "2. Restaurando pacotes..."
        dotnet restore --locked-mode

        Write-Host "3. Verificando formatação..."
        dotnet csharpier check .

        Write-Host "4. Compilando..."
        dotnet build --configuration $Configuration --no-restore

        Write-Host "5. Executando testes..."
        dotnet test --configuration $Configuration --no-build --verbosity normal --logger trx --results-directory TestResults

        Write-Success "Pipeline de CI concluído com sucesso!"
    }
    catch {
        Write-Error "Falha no pipeline de CI: $_"
        exit 1
    }
}

# Execução do comando
switch ($Command.ToLower()) {
    "help" { Show-Help }
    "install" { Install-Dependencies }
    "restore" { Restore-Packages }
    "tools-restore" { Restore-Tools }
    "format" { Format-Code }
    "check" { Check-Format }
    "build" { Build-Project }
    "test" { Run-Tests }
    "clean" { Clean-Project }
    "pre-commit" { Run-PreCommit }
    "setup-dev" { Setup-Development }
    "ci" { Run-CI }
    default {
        Write-Error "Comando não reconhecido: $Command"
        Show-Help
        exit 1
    }
}
