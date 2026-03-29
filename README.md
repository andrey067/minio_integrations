# minio_integrations

Este repositório contém exemplos e experimentos de integração do **MinIO**, um sistema de armazenamento de objetos compatível com o **Amazon S3**, utilizando diferentes linguagens de programação.

## Linguagens e Tecnologias

- **Python** - Exemplos usando a biblioteca `minio` para Python
- **Java** - Integração com MinIO usando o SDK oficial Java
- **Node.js** - Exemplos práticos com o cliente MinIO para JavaScript
- **Go** - Implementações usando o SDK MinIO para Go
- **C#** - Integração com MinIO usando o SDK para .NET

## Estrutura do Repositório

Cada diretório representa uma linguagem ou framework e contém exemplos práticos e scripts comentados para facilitar o aprendizado.

```
minio_integrations/
├── python/          # Exemplos em Python
├── java/            # Exemplos em Java
├── nodejs/          # Exemplos em Node.js
├── go/              # Exemplos em Go
├── csharp/          # Exemplos em C#
└── docker-compose.yml  # Configuração do MinIO para testes locais
```

## Pré-requisitos

- MinIO Server (pode usar o docker-compose.yml incluído)
- Dependências específicas de cada linguagem (ver README de cada diretório)

## Como Usar

1. Inicie o servidor MinIO localmente:
   ```bash
   docker-compose up -d
   ```

2. Acesse o diretório da linguagem desejada
3. Siga as instruções no README.md específico de cada linguagem

## MinIO Console

Após iniciar o MinIO com docker-compose, você pode acessar o console web em:
- URL: http://localhost:9001
- Usuário: minioadmin
- Senha: minioadmin

## Contribuindo

Sinta-se à vontade para contribuir com novos exemplos ou melhorias nos existentes.
