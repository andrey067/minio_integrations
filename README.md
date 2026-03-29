# minio_integrations

Repositório de integrações com **MinIO** — sistema de armazenamento de objetos compatível com **Amazon S3** — implementadas em múltiplas linguagens de programação.

Cada linguagem possui sua própria implementação completa com camada de serviços (interface + implementação), API HTTP e configuração de pre-commit.

## Linguagens

| Linguagem | Framework | Pasta |
|-----------|-----------|-------|
| C# (.NET 9) | ASP.NET Core | [`csharp/`](csharp/) |
| Go 1.23 | net/http | [`go/`](go/) |
| Java 21 | Spring Boot | [`java/`](java/) |
| Node.js 18 (TypeScript) | Express | [`nodejs/`](nodejs/) |
| Python 3.12 | FastAPI | [`python/`](python/) |

## Estrutura do Repositório

Cada pasta de linguagem segue o mesmo padrão:

```
<lang>/
├── <App>/                  # Aplicação (API HTTP)
├── <App>.Services/         # Camada de serviços
│   ├── interfaces/         # Interface IMinioService
│   └── services/           # Implementação MinioService
├── .husky/
│   └── pre-commit          # Hook de build no commit
└── README.md
```

## Pré-requisitos

- Docker (para rodar o MinIO localmente)
- Dependências específicas de cada linguagem (ver README de cada pasta)

## Iniciar o MinIO

```bash
docker-compose up -d
```

Após iniciar, acesse o console web:
- URL: http://localhost:9001
- Usuário: `minioadmin`
- Senha: `minioadmin`

## Pre-commit Hooks

O repositório usa [Husky.Net](https://alirezanet.github.io/Husky.Net/) para executar builds no pre-commit. Cada linguagem tem seu próprio script em `.husky/pre-commit`, ativado automaticamente quando arquivos da respectiva linguagem são alterados.

Para instalar os hooks:

```bash
dotnet tool restore
dotnet husky install
```

## Contribuindo

Consulte o README de cada linguagem para instruções específicas de build e execução.
