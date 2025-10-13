# Makefile para projeto .NET com MinIO

.PHONY: help install restore format check build test clean pre-commit setup-dev

# Configurações
CONFIGURATION ?= Release
DOTNET_FRAMEWORK ?= net9.0

help:  ## Exibe esta mensagem de ajuda
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install:  ## Instala dependências do projeto
	@echo "Instalando dependências..."
	dotnet tool restore
	dotnet restore
	pre-commit install
	@echo "Dependências instaladas!"

restore:  ## Restaura pacotes NuGet
	@echo "Restaurando pacotes..."
	dotnet restore
	@echo "Pacotes restaurados!"

tools-restore:  ## Restaura ferramentas .NET
	@echo "Restaurando ferramentas .NET..."
	dotnet tool restore
	@echo "Ferramentas restauradas!"

format:  ## Formata código C# usando CSharpier
	@echo "Formatando código C#..."
	dotnet csharpier format .
	@echo "Código formatado!"

check:  ## Verifica formatação do código C#
	@echo "Verificando formatação..."
	dotnet csharpier check .
	@echo "Formatação verificada!"

build:  ## Compila o projeto
	@echo "Compilando projeto..."
	dotnet build --configuration $(CONFIGURATION) --no-restore
	@echo "Projeto compilado!"

test:  ## Executa testes
	@echo "Executando testes..."
	dotnet test --configuration $(CONFIGURATION) --no-build --verbosity normal
	@echo "Testes executados!"

clean:  ## Limpa arquivos de build
	@echo "Limpando arquivos de build..."
	dotnet clean
	@echo "Arquivos limpos!"

pre-commit:  ## Executa verificações de pre-commit
	@echo "Executando pre-commit checks..."
	pre-commit run --all-files
	@echo "Pre-commit checks concluídos!"

setup-dev:  ## Configura ambiente de desenvolvimento
	@echo "Configurando ambiente de desenvolvimento..."
	$(MAKE) install
	$(MAKE) tools-restore
	$(MAKE) restore
	$(MAKE) format
	$(MAKE) build
	@echo "Ambiente configurado!"

# Targets para CI/CD
ci-restore:  ## Restaura dependências para CI
	dotnet tool restore
	dotnet restore --locked-mode

ci-build:  ## Compila para CI
	dotnet build --configuration $(CONFIGURATION) --no-restore

ci-test:  ## Executa testes para CI
	dotnet test --configuration $(CONFIGURATION) --no-build --verbosity normal --logger trx --results-directory TestResults

ci-format-check:  ## Verifica formatação para CI
	dotnet csharpier check .

# Target completo para CI
ci: ci-restore ci-format-check ci-build ci-test  ## Pipeline completo de CI
