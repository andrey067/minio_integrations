# MinIO Integration - Python

Integração com MinIO usando o SDK oficial para Python, estruturada como uma API FastAPI com camada de serviços.

## Estrutura do Projeto

```
python/
├── MinioPython/               # API FastAPI
│   ├── requirements.txt
│   └── main.py
├── MinioPython.Services/      # Camada de serviços
│   ├── requirements.txt
│   ├── __init__.py
│   ├── minio_extensions.py    # Factory do cliente MinIO
│   ├── interfaces/
│   │   ├── __init__.py
│   │   └── i_minio_service.py # Interface IMinioService
│   └── services/
│       ├── __init__.py
│       └── minio_service.py   # Implementação MinioService
└── .husky/
    └── pre-commit             # Verificação de sintaxe no pre-commit
```

## Pré-requisitos

- Python 3.12+
- pip
- MinIO Server (use o `docker-compose.yml` na raiz do repositório)

## Instalação

```bash
cd python/MinioPython.Services && pip install -r requirements.txt
cd ../MinioPython && pip install -r requirements.txt
```

## Configuração

Configure via variáveis de ambiente (padrão para desenvolvimento local):

| Variável | Padrão |
|----------|--------|
| `MINIO_ENDPOINT` | `localhost` |
| `MINIO_PORT` | `9000` |
| `MINIO_ACCESS_KEY` | `minioadmin` |
| `MINIO_SECRET_KEY` | `minioadmin` |

## Executar a API

```bash
cd python/MinioPython
uvicorn main:app --reload
```

A API estará disponível em `http://localhost:8000`.
Documentação Swagger: `http://localhost:8000/docs`

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/create-bucket` | Cria um bucket |
| GET | `/list-buckets` | Lista todos os buckets |
| DELETE | `/delete-bucket/{name}` | Remove um bucket |
| POST | `/upload?bucketName=...` | Faz upload de arquivo |
| GET | `/download/{bucket}/{file}` | Faz download de arquivo |

## Documentação

- [MinIO Python SDK](https://min.io/docs/minio/linux/developers/python/minio-py.html)
