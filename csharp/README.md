# MinIO Integration - C#

Este diretório contém exemplos de integração com MinIO usando C# (.NET).

## Pré-requisitos

- .NET 6.0 ou superior
- dotnet CLI

## Instalação

Restaure as dependências:

```bash
dotnet restore
```

## Configuração

Certifique-se de que o MinIO está rodando:

```bash
cd ..
docker-compose up -d
```

## Exemplos Disponíveis

### 1. BasicOperations.cs
Operações básicas:
- Criar bucket
- Upload de arquivo
- Download de arquivo
- Listar objetos
- Deletar objeto

```bash
dotnet run --project BasicOperations
```

### 2. AdvancedOperations.cs
Operações avançadas:
- Upload com metadados
- Presigned URLs
- Gestão de buckets
- Políticas de acesso

```bash
dotnet run --project AdvancedOperations
```

## Compilação

Para compilar os exemplos:

```bash
dotnet build
```

## Estrutura do Projeto

```
csharp/
├── MinioExamples.sln
├── BasicOperations/
│   ├── BasicOperations.csproj
│   └── Program.cs
└── AdvancedOperations/
    ├── AdvancedOperations.csproj
    └── Program.cs
```

## Configuração de Credenciais

Os exemplos usam:
- Endpoint: `localhost:9000`
- Access Key: `minioadmin`
- Secret Key: `minioadmin`

## Documentação

- [MinIO .NET SDK](https://min.io/docs/minio/linux/developers/dotnet/minio-dotnet.html)
