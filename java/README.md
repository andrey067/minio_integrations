# MinIO Integration - Java

Integração com MinIO usando o SDK oficial para Java, estruturada como uma API Spring Boot com camada de serviços.

## Estrutura do Projeto

```
java/
├── MinioJava/                 # API Spring Boot
│   ├── pom.xml
│   └── src/main/java/com/example/minio/
│       ├── MinioJavaApplication.java
│       └── controller/
│           └── MinioController.java
├── MinioJava.Services/        # Camada de serviços
│   ├── pom.xml
│   └── src/main/java/com/example/minio/
│       ├── config/
│       │   └── MinioConfiguration.java  # Factory do cliente MinIO
│       └── services/
│           ├── IMinioService.java        # Interface do serviço
│           └── MinioService.java         # Implementação
└── .husky/
    └── pre-commit             # Build no pre-commit
```

## Pré-requisitos

- Java 21+
- Maven 3.9+
- MinIO Server (use o `docker-compose.yml` na raiz do repositório)

## Instalação

```bash
# Instalar a camada de serviços no repositório local Maven
cd java/MinioJava.Services && mvn install -DskipTests

# Instalar dependências da API
cd ../MinioJava && mvn install -DskipTests
```

## Configuração

Edite `MinioJava/src/main/resources/application.properties` (ou `application.yml`):

```properties
minio.endpoint=localhost
minio.port=9000
minio.access-key=minioadmin
minio.secret-key=minioadmin
```

## Build

```bash
cd java/MinioJava.Services && mvn package -DskipTests
cd ../MinioJava && mvn package -DskipTests
```

## Executar a API

```bash
cd java/MinioJava
mvn spring-boot:run
```

A API estará disponível em `http://localhost:8080`.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/create-bucket` | Cria um bucket |
| GET | `/list-buckets` | Lista todos os buckets |
| DELETE | `/delete-bucket/{name}` | Remove um bucket |
| POST | `/upload?bucketName=...` | Faz upload de arquivo (multipart) |
| GET | `/download/{bucket}/{file}` | Faz download de arquivo |

## Documentação

- [MinIO Java SDK](https://min.io/docs/minio/linux/developers/java/minio-java.html)
- [Spring Boot](https://spring.io/projects/spring-boot)
