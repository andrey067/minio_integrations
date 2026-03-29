# MinIO Integration - Go

Integração com MinIO usando o SDK oficial para Go, estruturada como uma HTTP API com camada de serviços.

## Estrutura do Projeto

```
go/
├── MinioGo/                   # Servidor HTTP
│   ├── go.mod
│   └── main.go
├── MinioGo.Services/          # Camada de serviços
│   ├── go.mod
│   ├── interfaces.go          # Interface IMinioService
│   ├── minio_extensions.go    # Factory do cliente MinIO
│   └── minio_service.go       # Implementação MinioService
└── .husky/
    └── pre-commit             # Build no pre-commit
```

## Pré-requisitos

- Go 1.23+
- MinIO Server (use o `docker-compose.yml` na raiz do repositório)

## Instalação

```bash
cd go/MinioGo.Services && go mod download
cd ../MinioGo && go mod download
```

## Configuração

Configure via variáveis de ambiente (padrão para desenvolvimento local):

| Variável | Padrão |
|----------|--------|
| `MINIO_ENDPOINT` | `localhost` |
| `MINIO_PORT` | `9000` |
| `MINIO_ACCESS_KEY` | `minioadmin` |
| `MINIO_SECRET_KEY` | `minioadmin` |
| `PORT` | `8080` |

## Build

```bash
cd go/MinioGo.Services && go build ./...
cd ../MinioGo && go build ./...
```

## Executar a API

```bash
cd go/MinioGo
go run main.go
```

A API estará disponível em `http://localhost:8080`.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/create-bucket` | Cria um bucket |
| GET | `/list-buckets` | Lista todos os buckets |
| DELETE | `/delete-bucket/{name}` | Remove um bucket |
| POST | `/upload?bucketName=...` | Faz upload de arquivo |
| GET | `/download/{bucket}/{file}` | Faz download de arquivo |

## Documentação

- [MinIO Go SDK](https://min.io/docs/minio/linux/developers/go/minio-go.html)
