package com.example.minio;

import io.minio.*;
import io.minio.http.Method;
import io.minio.messages.Bucket;
import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Operações avançadas com MinIO usando Java.
 * Demonstra recursos como presigned URLs, metadados customizados e gestão de buckets.
 */
public class AdvancedOperations {

    private static final String ENDPOINT = "http://localhost:9000";
    private static final String ACCESS_KEY = "minioadmin";
    private static final String SECRET_KEY = "minioadmin";

    private static MinioClient minioClient;

    public static void main(String[] args) {
        System.out.println("=".repeat(60));
        System.out.println("MinIO Java - Operações Avançadas");
        System.out.println("=".repeat(60));

        try {
            // Inicializar cliente
            initializeClient();

            String bucketName = "java-advanced-bucket";

            // Criar bucket se não existir
            System.out.println("\nVerificando/criando bucket...");
            createBucket(bucketName);

            // 1. Upload com metadados
            System.out.println("\n1. Upload com metadados customizados...");
            Map<String, String> metadata = new HashMap<>();
            metadata.put("author", "Java Script");
            metadata.put("version", "1.0");
            metadata.put("description", "Exemplo de arquivo com metadados");
            uploadWithMetadata(bucketName, "document-with-metadata.txt",
                    "Este documento possui metadados customizados.", metadata);

            // 2. Obter informações e metadados
            System.out.println("\n2. Obtendo informações e metadados...");
            getObjectStats(bucketName, "document-with-metadata.txt");

            // 3. Gerar URL pré-assinada para download
            System.out.println("\n3. Gerando URL pré-assinada para download...");
            generatePresignedUrl(bucketName, "document-with-metadata.txt", 1800);

            // 4. Gerar URL pré-assinada para upload
            System.out.println("\n4. Gerando URL pré-assinada para upload...");
            generatePresignedPutUrl(bucketName, "upload-via-url.txt", 1800);

            // 5. Copiar objeto
            System.out.println("\n5. Copiando objeto...");
            copyObject(bucketName, "document-with-metadata.txt",
                    bucketName, "document-copy.txt");

            // 6. Listar todos os buckets
            System.out.println("\n6. Listando todos os buckets...");
            listBuckets();

            // 7. Verificar se objeto existe
            System.out.println("\n7. Verificando existência de objeto...");
            checkObjectExists(bucketName, "document-with-metadata.txt");

            System.out.println("\n" + "=".repeat(60));
            System.out.println("✓ Exemplos avançados concluídos!");
            System.out.println("=".repeat(60));
            System.out.println("\n💡 Dicas:");
            System.out.println("  - Use presigned URLs para compartilhar objetos temporariamente");
            System.out.println("  - Metadados são úteis para armazenar informações adicionais");
            System.out.println("  - O MinIO SDK gerencia automaticamente uploads grandes");

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
     * Cria um bucket se não existir
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
                System.out.println("✓ Bucket '" + bucketName + "' criado.");
            } else {
                System.out.println("✓ Usando bucket existente '" + bucketName + "'.");
            }
        } catch (Exception e) {
            System.err.println("✗ Erro ao criar bucket: " + e.getMessage());
        }
    }

    /**
     * Upload com metadados customizados
     */
    private static void uploadWithMetadata(String bucketName, String objectName,
                                          String content, Map<String, String> metadata) {
        try {
            byte[] bytes = content.getBytes();
            ByteArrayInputStream bais = new ByteArrayInputStream(bytes);

            // Converter metadados para o formato esperado (com prefixo x-amz-meta-)
            Map<String, String> headers = new HashMap<>();
            for (Map.Entry<String, String> entry : metadata.entrySet()) {
                headers.put("x-amz-meta-" + entry.getKey(), entry.getValue());
            }

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .stream(bais, bytes.length, -1)
                            .contentType("text/plain")
                            .headers(headers)
                            .build()
            );

            System.out.println("✓ Objeto '" + objectName + "' enviado com metadados");
        } catch (Exception e) {
            System.err.println("✗ Erro no upload: " + e.getMessage());
        }
    }

    /**
     * Obtém estatísticas e metadados do objeto
     */
    private static void getObjectStats(String bucketName, String objectName) {
        try {
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );

            System.out.println("\n📊 Estatísticas do objeto '" + objectName + "':");
            System.out.println("  - Tamanho: " + stat.size() + " bytes");
            System.out.println("  - Tipo: " + stat.contentType());
            System.out.println("  - Última modificação: " + stat.lastModified());
            System.out.println("  - ETag: " + stat.etag());

            // Listar metadados customizados
            System.out.println("  - Metadados customizados:");
            Map<String, String> userMetadata = stat.userMetadata();
            if (userMetadata != null && !userMetadata.isEmpty()) {
                for (Map.Entry<String, String> entry : userMetadata.entrySet()) {
                    System.out.println("    * " + entry.getKey() + ": " + entry.getValue());
                }
            } else {
                System.out.println("    (nenhum metadado customizado)");
            }
        } catch (Exception e) {
            System.err.println("✗ Erro ao obter estatísticas: " + e.getMessage());
        }
    }

    /**
     * Gera URL pré-assinada para download
     */
    private static void generatePresignedUrl(String bucketName, String objectName, int expirySeconds) {
        try {
            String url = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(expirySeconds, TimeUnit.SECONDS)
                            .build()
            );

            System.out.println("\n🔗 URL pré-assinada gerada (válida por " + expirySeconds + "s):");
            System.out.println("  " + url);
        } catch (Exception e) {
            System.err.println("✗ Erro ao gerar URL: " + e.getMessage());
        }
    }

    /**
     * Gera URL pré-assinada para upload
     */
    private static void generatePresignedPutUrl(String bucketName, String objectName, int expirySeconds) {
        try {
            String url = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.PUT)
                            .bucket(bucketName)
                            .object(objectName)
                            .expiry(expirySeconds, TimeUnit.SECONDS)
                            .build()
            );

            System.out.println("\n🔗 URL pré-assinada para upload gerada (válida por " + expirySeconds + "s):");
            System.out.println("  " + url);
        } catch (Exception e) {
            System.err.println("✗ Erro ao gerar URL de upload: " + e.getMessage());
        }
    }

    /**
     * Copia um objeto
     */
    private static void copyObject(String sourceBucket, String sourceObject,
                                  String destBucket, String destObject) {
        try {
            minioClient.copyObject(
                    CopyObjectArgs.builder()
                            .bucket(destBucket)
                            .object(destObject)
                            .source(
                                    CopySource.builder()
                                            .bucket(sourceBucket)
                                            .object(sourceObject)
                                            .build()
                            )
                            .build()
            );

            System.out.println("✓ Objeto copiado de '" + sourceBucket + "/" + sourceObject +
                    "' para '" + destBucket + "/" + destObject + "'");
        } catch (Exception e) {
            System.err.println("✗ Erro ao copiar: " + e.getMessage());
        }
    }

    /**
     * Lista todos os buckets
     */
    private static void listBuckets() {
        try {
            System.out.println("\n🗂️  Buckets disponíveis:");
            for (Bucket bucket : minioClient.listBuckets()) {
                System.out.println("  - " + bucket.name() + 
                                 " (Criado em: " + bucket.creationDate() + ")");
            }
        } catch (Exception e) {
            System.err.println("✗ Erro ao listar buckets: " + e.getMessage());
        }
    }

    /**
     * Verifica se um objeto existe
     */
    private static void checkObjectExists(String bucketName, String objectName) {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectName)
                            .build()
            );
            System.out.println("✓ Objeto '" + objectName + "' existe no bucket '" + bucketName + "'");
        } catch (Exception e) {
            System.out.println("✗ Objeto '" + objectName + "' não existe ou erro: " + e.getMessage());
        }
    }
}
