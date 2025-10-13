# MinIO Integration - Python

Este diretório contém exemplos de integração com MinIO usando Python.

## Pré-requisitos

- Python 3.7+
- pip (gerenciador de pacotes Python)

## Instalação

Instale as dependências necessárias:

```bash
pip install -r requirements.txt
```

## Configuração

Certifique-se de que o MinIO está rodando (use o docker-compose.yml na raiz do projeto):

```bash
cd ..
docker-compose up -d
```

## Exemplos Disponíveis

### 1. basic_operations.py
Operações básicas com MinIO:
- Criar bucket
- Upload de arquivo
- Download de arquivo
- Listar objetos
- Deletar objeto

```bash
python basic_operations.py
```

### 2. advanced_operations.py
Operações avançadas:
- Upload com metadados
- Presigned URLs
- Gestão de políticas de bucket
- Versionamento de objetos

```bash
python advanced_operations.py
```

## Configuração de Credenciais

Os exemplos usam as seguintes credenciais padrão:
- Endpoint: `localhost:9000`
- Access Key: `minioadmin`
- Secret Key: `minioadmin`

Modifique as credenciais nos scripts conforme necessário para seu ambiente.

## Documentação

- [MinIO Python SDK](https://min.io/docs/minio/linux/developers/python/minio-py.html)
- [Documentação Oficial MinIO](https://min.io/docs/minio/linux/index.html)
