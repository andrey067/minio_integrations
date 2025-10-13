# MinIO Integration - Java

Este diretório contém exemplos de integração com MinIO usando Java.

## Pré-requisitos

- Java 11+
- Maven 3.6+

## Instalação

Compile o projeto com Maven:

```bash
mvn clean install
```

## Configuração

Certifique-se de que o MinIO está rodando:

```bash
cd ..
docker-compose up -d
```

## Exemplos Disponíveis

### 1. BasicOperations.java
Operações básicas:
- Criar bucket
- Upload de arquivo
- Download de arquivo
- Listar objetos
- Deletar objeto

```bash
mvn exec:java -Dexec.mainClass="com.example.minio.BasicOperations"
```

### 2. AdvancedOperations.java
Operações avançadas:
- Upload com metadados
- Presigned URLs
- Gestão de buckets
- Políticas de acesso

```bash
mvn exec:java -Dexec.mainClass="com.example.minio.AdvancedOperations"
```

## Estrutura do Projeto

```
java/
├── pom.xml
└── src/
    └── main/
        └── java/
            └── com/
                └── example/
                    └── minio/
                        ├── BasicOperations.java
                        └── AdvancedOperations.java
```

## Configuração de Credenciais

Os exemplos usam:
- Endpoint: `http://localhost:9000`
- Access Key: `minioadmin`
- Secret Key: `minioadmin`

## Documentação

- [MinIO Java SDK](https://min.io/docs/minio/linux/developers/java/minio-java.html)
