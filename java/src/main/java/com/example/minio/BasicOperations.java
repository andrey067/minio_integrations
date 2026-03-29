package com.example.minio;

import io.minio.*;
import io.minio.messages.Item;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;

/**
 * Exemplos básicos de operações com MinIO usando Java.
 * Demonstra operações fundamentais como criar buckets, upload, download e listagem.
 */
public class BasicOperations {

    private static final String ENDPOINT = "http://localhost:9000";
    private static final String ACCESS_KEY = "minioadmin";
    private static final String SECRET_KEY = "minioadmin";

    private static MinioClient minioClient;

    public static void main(String[] args) {
        System.out.println("=".repeat(60));
        System.out.println("MinIO Java - Operações Básicas");
        System.out.println("=".repeat(60));

        try {
            // Inicializar cliente MinIO
            initializeClient();

            String bucketName = "java-example-bucket";

            // 1. Criar bucket
            System.out.println("\n1. Criando bucket...");
            createBucket(bucketName);

            // 2. Upload de string
            System.out.println("\n2. Fazendo upload de conteúdo...");
            uploadString(bucketName, "hello.txt", "Olá MinIO! Este é um teste com Java.");

            // 3. Upload de arquivo
            System.out.println("\n3. Criando e fazendo upload de arquivo...");
            String tempFile = "/tmp/java-example.txt";
            String content = "Este é um arquivo de exemplo criado em Java.\n" +
                           "MinIO é compatível com Amazon S3.\n";
            Files.write(Paths.get(tempFile), content.getBytes());
            uploadFile(bucketName, "example.txt", tempFile);

            // 4. Listar objetos
            System.out.println("\n4. Listando objetos...");
            listObjects(bucketName);

            // 5. Obter informações do objeto
            System.out.println("\n5. Obtendo informações do objeto...");
            getObjectInfo(bucketName, "example.txt");

            // 6. Download de arquivo
            System.out.println("\n6. Fazendo download...");
            String downloadPath = "/tmp/downloaded-java-example.txt";
            downloadFile(bucketName, "example.txt", downloadPath);

            String downloadedContent = new String(Files.readAllBytes(Paths.get(downloadPath)));
            System.out.println("   Conteúdo baixado:");
            System.out.println("   " + downloadedContent);

            // 7. Deletar objeto (opcional)
            // System.out.println("\n7. Removendo objeto...");
            // deleteObject(bucketName, "hello.txt");

            System.out.println("\n" + "=".repeat(60));
            System.out.println("✓ Todos os exemplos foram executados!");
            System.out.println("=".repeat(60));

        } catch (Exception e) {
            System.err.println("✗ Erro na execução: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Inicializa o cliente MinIO
     */
    private static void initializeClient() {
        minioClient = MinioClient.builder()
                .endpoint(ENDPOINT)
                .credentials(ACCESS_KEY, SECRET_KEY)
                .build();
        System.out.println("✓ Cliente MinIO inicializado");
    }

    /**
     * Cria um novo bucket
     */
    private static void createBucket(String bucketName) {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build()
            );

            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build()
                );
                System.out.println("✓ Bucket '" + bucketName + "' criado com sucesso!");
            } else {
                System.out.println("✓ Bucket '" + bucketName + "' já existe.");
            }
        } catch (Exception e) {
            System.err.println("✗ Erro ao criar bucket: " + e.getMessage());
        }
    }

    /**
     * Faz upload de uma string como objeto
     */
    private static void uploadString(String bucketName, String objectName, String content) {
        try {
            byte[] bytes = content.getBytes();
            ByteArrayInputStream bais = new ByteArrayInputStream(bytes);

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(bais, bytes.length, -1)
                            .contentType("text/plain")
                            .build()
            );

            System.out.println("✓ Conteúdo enviado como '" + objectName + "'");
        } catch (Exception e) {
            System.err.println("✗ Erro no upload: " + e.getMessage());
        }
    }

    /**
     * Faz upload de um arquivo
     */
    private static void uploadFile(String bucketName, String objectName, String filePath) {
        try {
            minioClient.uploadObject(
                    UploadObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .filename(filePath)
                            .contentType("text/plain")
                            .build()
            );

            System.out.println("✓ Arquivo '" + filePath + "' enviado como '" + objectName + "'");
        } catch (Exception e) {
            System.err.println("✗ Erro no upload: " + e.getMessage());
        }
    }

    /**
     * Lista todos os objetos em um bucket
     */
    private static void listObjects(String bucketName) {
        try {
            System.out.println("\n📋 Objetos no bucket '" + bucketName + "':");
            
            Iterable<Result<Item>> results = minioClient.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(bucketName)
                            .build()
            );

            for (Result<Item> result : results) {
                Item item = result.get();
                System.out.println("  - " + item.objectName() + 
                                 " (Tamanho: " + item.size() + " bytes)");
            }
        } catch (Exception e) {
            System.err.println("✗ Erro ao listar objetos: " + e.getMessage());
        }
    }

    /**
     * Obtém informações sobre um objeto
     */
    private static void getObjectInfo(String bucketName, String objectName) {
        try {
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );

            System.out.println("\n📊 Informações do objeto '" + objectName + "':");
            System.out.println("  - Tamanho: " + stat.size() + " bytes");
            System.out.println("  - Tipo: " + stat.contentType());
            System.out.println("  - Última modificação: " + stat.lastModified());
            System.out.println("  - ETag: " + stat.etag());
        } catch (Exception e) {
            System.err.println("✗ Erro ao obter informações: " + e.getMessage());
        }
    }

    /**
     * Faz download de um arquivo
     */
    private static void downloadFile(String bucketName, String objectName, String filePath) {
        try {
            minioClient.downloadObject(
                    DownloadObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .filename(filePath)
                            .build()
            );

            System.out.println("✓ Objeto '" + objectName + "' baixado para '" + filePath + "'");
        } catch (Exception e) {
            System.err.println("✗ Erro no download: " + e.getMessage());
        }
    }

    /**
     * Remove um objeto do bucket
     */
    private static void deleteObject(String bucketName, String objectName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );

            System.out.println("✓ Objeto '" + objectName + "' removido");
        } catch (Exception e) {
            System.err.println("✗ Erro ao remover objeto: " + e.getMessage());
        }
    }
}
