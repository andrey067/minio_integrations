# MinIO Integration - Node.js

Este diretório contém exemplos de integração com MinIO usando Node.js.

## Pré-requisitos

- Node.js 14+
- npm ou yarn

## Instalação

Instale as dependências:

```bash
npm install
```

## Configuração

Certifique-se de que o MinIO está rodando:

```bash
cd ..
docker-compose up -d
```

## Exemplos Disponíveis

### 1. basicOperations.js
Operações básicas com MinIO:
- Criar bucket
- Upload de arquivo
- Download de arquivo
- Listar objetos
- Deletar objeto

```bash
node basicOperations.js
```

### 2. advancedOperations.js
Operações avançadas:
- Upload com metadados
- Presigned URLs
- Stream de dados
- Gerenciamento de buckets

```bash
node advancedOperations.js
```

### 3. streamOperations.js
Trabalho com streams:
- Upload via stream
- Download via stream
- Processamento de grandes arquivos

```bash
node streamOperations.js
```

## Configuração de Credenciais

Os exemplos usam:
- Endpoint: `localhost:9000`
- Access Key: `minioadmin`
- Secret Key: `minioadmin`

## Documentação

- [MinIO JavaScript Client](https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html)
