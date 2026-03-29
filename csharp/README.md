# MinIO Integration - C# (.NET)

Integração com MinIO usando o SDK oficial para .NET 9, estruturada como uma Web API com camada de serviços.

## Estrutura do Projeto

```
csharp/
├── MinioDotnet.sln
├── MinioDotnet/               # Web API (ASP.NET Core)
│   ├── MinioDotnet.csproj
│   ├── Program.cs
│   ├── appsettings.json
│   └── Properties/
│       └── launchSettings.json
├── MinioDotnet.Services/      # Camada de serviços
│   ├── MinioDotnet.Services.csproj
│   ├── MinioExtensions.cs     # Extensão para registro de DI
│   ├── Interfaces/
│   │   └── IMinioServices.cs  # Interface do serviço
│   └── Services/
│       └── MinioServices.cs   # Implementação
└── .husky/
    ├── pre-commit             # Build no pre-commit (bash)
    └── pre-commit.ps1         # Build no pre-commit (PowerShell)
```

## Pré-requisitos

- .NET 9 SDK
- MinIO Server (use o `docker-compose.yml` na raiz do repositório)

## Instalação

```bash
cd csharp
dotnet restore
```

## Configuração

Edite `MinioDotnet/appsettings.json`:

```json
{
  "Minio": {
    "Endpoint": "localhost",
    "Port": 9000,
    "AccessKey": "minioadmin",
    "SecretKey": "minioadmin"
  }
}
```

## Build

```bash
cd csharp
dotnet build MinioDotnet.sln --configuration Release
```

## Executar a API

```bash
cd csharp/MinioDotnet
dotnet run
```

Acesse a documentação Swagger em: `http://localhost:5000/swagger`

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/create-bucket` | Cria um bucket |
| GET | `/list-buckets` | Lista todos os buckets |
| DELETE | `/delete-bucket/{name}` | Remove um bucket |
| POST | `/upload?bucketName=...` | Faz upload de arquivo |
| GET | `/download/{bucket}/{file}` | Faz download de arquivo |

## Documentação

- [MinIO .NET SDK](https://min.io/docs/minio/linux/developers/dotnet/minio-dotnet.html)
- [ASP.NET Core](https://docs.microsoft.com/aspnet/core)
