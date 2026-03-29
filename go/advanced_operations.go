package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net/url"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

const (
	endpoint  = "localhost:9000"
	accessKey = "minioadmin"
	secretKey = "minioadmin"
	useSSL    = false
)

// Operações avançadas com MinIO usando Go
func main() {
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("MinIO Go - Operações Avançadas")
	fmt.Println(strings.Repeat("=", 60))

	// Inicializar cliente MinIO
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalf("✗ Erro ao inicializar cliente: %v", err)
	}
	fmt.Println("✓ Cliente MinIO inicializado")

	ctx := context.Background()
	bucketName := "go-advanced-bucket"

	// Criar bucket se não existir
	fmt.Println("\nVerificando/criando bucket...")
	if err := ensureBucket(ctx, client, bucketName); err != nil {
		log.Fatalf("✗ Erro: %v", err)
	}

	// 1. Upload com metadados
	fmt.Println("\n1. Upload com metadados customizados...")
	metadata := map[string]string{
		"X-Amz-Meta-Author":      "Go Script",
		"X-Amz-Meta-Version":     "1.0",
		"X-Amz-Meta-Description": "Exemplo de arquivo com metadados",
	}
	if err := uploadWithMetadata(ctx, client, bucketName, "document-with-metadata.txt",
		"Este documento possui metadados customizados.", metadata); err != nil {
		log.Printf("✗ Erro: %v", err)
	}

	// 2. Obter informações e metadados
	fmt.Println("\n2. Obtendo informações e metadados...")
	if err := getObjectStats(ctx, client, bucketName, "document-with-metadata.txt"); err != nil {
		log.Printf("✗ Erro: %v", err)
	}

	// 3. Gerar URL pré-assinada para download
	fmt.Println("\n3. Gerando URL pré-assinada para download...")
	if err := generatePresignedURL(ctx, client, bucketName, "document-with-metadata.txt", 30*time.Minute); err != nil {
		log.Printf("✗ Erro: %v", err)
	}

	// 4. Gerar URL pré-assinada para upload
	fmt.Println("\n4. Gerando URL pré-assinada para upload...")
	if err := generatePresignedPutURL(ctx, client, bucketName, "upload-via-url.txt", 30*time.Minute); err != nil {
		log.Printf("✗ Erro: %v", err)
	}

	// 5. Copiar objeto
	fmt.Println("\n5. Copiando objeto...")
	if err := copyObject(ctx, client, bucketName, "document-with-metadata.txt",
		bucketName, "document-copy.txt"); err != nil {
		log.Printf("✗ Erro: %v", err)
	}

	// 6. Listar todos os buckets
	fmt.Println("\n6. Listando todos os buckets...")
	if err := listBuckets(ctx, client); err != nil {
		log.Printf("✗ Erro: %v", err)
	}

	// 7. Verificar se objeto existe
	fmt.Println("\n7. Verificando existência de objeto...")
	if err := checkObjectExists(ctx, client, bucketName, "document-with-metadata.txt"); err != nil {
		log.Printf("✗ Erro: %v", err)
	}

	fmt.Println("\n" + strings.Repeat("=", 60))
	fmt.Println("✓ Exemplos avançados concluídos!")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("\n💡 Dicas:")
	fmt.Println("  - Use presigned URLs para compartilhar objetos temporariamente")
	fmt.Println("  - Metadados são úteis para armazenar informações adicionais")
	fmt.Println("  - O MinIO SDK gerencia automaticamente uploads grandes")
}

// ensureBucket garante que o bucket existe
func ensureBucket(ctx context.Context, client *minio.Client, bucketName string) error {
	exists, err := client.BucketExists(ctx, bucketName)
	if err != nil {
		return fmt.Errorf("erro ao verificar bucket: %w", err)
	}

	if !exists {
		err = client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("erro ao criar bucket: %w", err)
		}
		fmt.Printf("✓ Bucket '%s' criado.\n", bucketName)
	} else {
		fmt.Printf("✓ Usando bucket existente '%s'.\n", bucketName)
	}
	return nil
}

// uploadWithMetadata faz upload com metadados customizados
func uploadWithMetadata(ctx context.Context, client *minio.Client, bucketName, objectName, content string, metadata map[string]string) error {
	reader := bytes.NewReader([]byte(content))

	opts := minio.PutObjectOptions{
		ContentType:  "text/plain",
		UserMetadata: metadata,
	}

	_, err := client.PutObject(ctx, bucketName, objectName, reader, int64(len(content)), opts)
	if err != nil {
		return fmt.Errorf("erro no upload: %w", err)
	}

	fmt.Printf("✓ Objeto '%s' enviado com metadados\n", objectName)
	return nil
}

// getObjectStats obtém estatísticas e metadados do objeto
func getObjectStats(ctx context.Context, client *minio.Client, bucketName, objectName string) error {
	objInfo, err := client.StatObject(ctx, bucketName, objectName, minio.StatObjectOptions{})
	if err != nil {
		return fmt.Errorf("erro ao obter estatísticas: %w", err)
	}

	fmt.Printf("\n📊 Estatísticas do objeto '%s':\n", objectName)
	fmt.Printf("  - Tamanho: %d bytes\n", objInfo.Size)
	fmt.Printf("  - Tipo: %s\n", objInfo.ContentType)
	fmt.Printf("  - Última modificação: %s\n", objInfo.LastModified)
	fmt.Printf("  - ETag: %s\n", objInfo.ETag)

	// Listar metadados customizados
	fmt.Println("  - Metadados customizados:")
	if len(objInfo.UserMetadata) > 0 {
		for key, value := range objInfo.UserMetadata {
			cleanKey := strings.TrimPrefix(key, "X-Amz-Meta-")
			fmt.Printf("    * %s: %s\n", cleanKey, value)
		}
	} else {
		fmt.Println("    (nenhum metadado customizado)")
	}
	return nil
}

// generatePresignedURL gera URL pré-assinada para download
func generatePresignedURL(ctx context.Context, client *minio.Client, bucketName, objectName string, expiry time.Duration) error {
	reqParams := make(url.Values)
	presignedURL, err := client.PresignedGetObject(ctx, bucketName, objectName, expiry, reqParams)
	if err != nil {
		return fmt.Errorf("erro ao gerar URL: %w", err)
	}

	fmt.Printf("\n🔗 URL pré-assinada gerada (válida por %v):\n", expiry)
	fmt.Printf("  %s\n", presignedURL.String())
	return nil
}

// generatePresignedPutURL gera URL pré-assinada para upload
func generatePresignedPutURL(ctx context.Context, client *minio.Client, bucketName, objectName string, expiry time.Duration) error {
	presignedURL, err := client.PresignedPutObject(ctx, bucketName, objectName, expiry)
	if err != nil {
		return fmt.Errorf("erro ao gerar URL de upload: %w", err)
	}

	fmt.Printf("\n🔗 URL pré-assinada para upload gerada (válida por %v):\n", expiry)
	fmt.Printf("  %s\n", presignedURL.String())
	return nil
}

// copyObject copia um objeto
func copyObject(ctx context.Context, client *minio.Client, srcBucket, srcObject, dstBucket, dstObject string) error {
	src := minio.CopySrcOptions{
		Bucket: srcBucket,
		Object: srcObject,
	}

	dst := minio.CopyDestOptions{
		Bucket: dstBucket,
		Object: dstObject,
	}

	_, err := client.CopyObject(ctx, dst, src)
	if err != nil {
		return fmt.Errorf("erro ao copiar: %w", err)
	}

	fmt.Printf("✓ Objeto copiado de '%s/%s' para '%s/%s'\n",
		srcBucket, srcObject, dstBucket, dstObject)
	return nil
}

// listBuckets lista todos os buckets
func listBuckets(ctx context.Context, client *minio.Client) error {
	buckets, err := client.ListBuckets(ctx)
	if err != nil {
		return fmt.Errorf("erro ao listar buckets: %w", err)
	}

	fmt.Println("\n🗂️  Buckets disponíveis:")
	for _, bucket := range buckets {
		fmt.Printf("  - %s (Criado em: %s)\n", bucket.Name, bucket.CreationDate)
	}
	return nil
}

// checkObjectExists verifica se um objeto existe
func checkObjectExists(ctx context.Context, client *minio.Client, bucketName, objectName string) error {
	_, err := client.StatObject(ctx, bucketName, objectName, minio.StatObjectOptions{})
	if err != nil {
		return fmt.Errorf("objeto não existe ou erro: %w", err)
	}

	fmt.Printf("✓ Objeto '%s' existe no bucket '%s'\n", objectName, bucketName)
	return nil
}

// removeMultipleObjects remove múltiplos objetos
func removeMultipleObjects(ctx context.Context, client *minio.Client, bucketName string, objectNames []string) error {
	objectsCh := make(chan minio.ObjectInfo)

	go func() {
		defer close(objectsCh)
		for _, name := range objectNames {
			objectsCh <- minio.ObjectInfo{Key: name}
		}
	}()

	opts := minio.RemoveObjectsOptions{}
	errorCh := client.RemoveObjects(ctx, bucketName, objectsCh, opts)

	for e := range errorCh {
		if e.Err != nil {
			return fmt.Errorf("erro ao remover %s: %w", e.ObjectName, e.Err)
		}
	}

	fmt.Printf("✓ %d objetos removidos\n", len(objectNames))
	return nil
}
