# MinIO Integration - Node.js

Integração com MinIO usando o SDK oficial para Node.js, estruturada como uma API Express com camada de serviços em TypeScript.

## Estrutura do Projeto

```
nodejs/
├── MinioNodejs/               # API Express
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts
├── MinioNodejs.Services/      # Camada de serviços
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts           # Exportações públicas
│       ├── MinioExtensions.ts # Factory do cliente MinIO
│       ├── interfaces/
│       │   └── IMinioService.ts
│       └── services/
│           └── MinioService.ts
└── .husky/
    ├── pre-commit             # Build no pre-commit (bash)
    └── pre-commit.ps1         # Build no pre-commit (PowerShell)
```

## Pré-requisitos

- Node.js 18+
- npm
- MinIO Server (use o `docker-compose.yml` na raiz do repositório)

## Instalação

```bash
cd nodejs/MinioNodejs.Services && npm install
cd ../MinioNodejs && npm install
```

## Configuração

Configure via variáveis de ambiente (padrão para desenvolvimento local):

| Variável | Padrão |
|----------|--------|
| `MINIO_ENDPOINT` | `localhost` |
| `MINIO_PORT` | `9000` |
| `MINIO_ACCESS_KEY` | `minioadmin` |
| `MINIO_SECRET_KEY` | `minioadmin` |
| `PORT` | `3000` |

## Build

```bash
cd nodejs/MinioNodejs.Services && npm run build
cd ../MinioNodejs && npm run build
```

## Executar a API

```bash
cd nodejs/MinioNodejs
npm run dev    # desenvolvimento (ts-node)
npm start      # produção (após build)
```

A API estará disponível em `http://localhost:3000`.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/create-bucket` | Cria um bucket |
| GET | `/list-buckets` | Lista todos os buckets |
| DELETE | `/delete-bucket/:bucketName` | Remove um bucket |
| POST | `/upload?bucketName=...` | Faz upload de arquivo (multipart) |
| GET | `/download/:bucket/:file` | Faz download de arquivo |

## Documentação

- [MinIO JavaScript Client](https://min.io/docs/minio/linux/developers/javascript/minio-javascript.html)
