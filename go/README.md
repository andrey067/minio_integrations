# MinIO Integration - Go

Este diretório contém exemplos de integração com MinIO usando Go.

## Pré-requisitos

- Go 1.19+

## Instalação

Instale as dependências:

```bash
go mod download
```

## Configuração

Certifique-se de que o MinIO está rodando:

```bash
cd ..
docker-compose up -d
```

## Exemplos Disponíveis

### 1. basic_operations.go
Operações básicas:
- Criar bucket
- Upload de arquivo
- Download de arquivo
- Listar objetos
- Deletar objeto

```bash
go run basic_operations.go
```

### 2. advanced_operations.go
Operações avançadas:
- Upload com metadados
- Presigned URLs
- Gestão de buckets
- Políticas de acesso

```bash
go run advanced_operations.go
```

## Compilação

Para compilar os exemplos:

```bash
go build basic_operations.go
go build advanced_operations.go
```

## Configuração de Credenciais

Os exemplos usam:
- Endpoint: `localhost:9000`
- Access Key: `minioadmin`
- Secret Key: `minioadmin`

## Documentação

- [MinIO Go SDK](https://min.io/docs/minio/linux/developers/go/minio-go.html)
