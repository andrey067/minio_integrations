package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"strings"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

const (
	endpoint  = "localhost:9000"
	accessKey = "minioadmin"
	secretKey = "minioadmin"
	useSSL    = false
)

// Operações básicas com MinIO usando Go
func main() {
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("MinIO Go - Operações Básicas")
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
	bucketName := "go-example-bucket"

	// 1. Criar bucket
	fmt.Println("\n1. Criando bucket...")
	if err := createBucket(ctx, client, bucketName); err != nil {
		log.Printf("✗ Erro: %v", err)
	}

	// 2. Upload de string
	fmt.Println("\n2. Fazendo upload de conteúdo...")
	content := "Olá MinIO! Este é um teste com Go."
	if err := uploadString(ctx, client, bucketName, "hello.txt", content); err != nil {
		log.Printf("✗ Erro: %v", err)
	}

	// 3. Upload de arquivo
	fmt.Println("\n3. Criando e fazendo upload de arquivo...")
	tempFile := "/tmp/go-example.txt"
	fileContent := "Este é um arquivo de exemplo criado em Go.\nMinIO é compatível com Amazon S3.\n"
	if err := os.WriteFile(tempFile, []byte(fileContent), 0644); err != nil {
		log.Printf("✗ Erro ao criar arquivo: %v", err)
	} else {
		if err := uploadFile(ctx, client, bucketName, "example.txt", tempFile); err != nil {
			log.Printf("✗ Erro: %v", err)
		}
	}

	// 4. Listar objetos
	fmt.Println("\n4. Listando objetos...")
	if err := listObjects(ctx, client, bucketName); err != nil {
		log.Printf("✗ Erro: %v", err)
	}

	// 5. Obter informações do objeto
	fmt.Println("\n5. Obtendo informações do objeto...")
	if err := getObjectInfo(ctx, client, bucketName, "example.txt"); err != nil {
		log.Printf("✗ Erro: %v", err)
	}

	// 6. Download de arquivo
	fmt.Println("\n6. Fazendo download...")
	downloadPath := "/tmp/downloaded-go-example.txt"
	if err := downloadFile(ctx, client, bucketName, "example.txt", downloadPath); err != nil {
		log.Printf("✗ Erro: %v", err)
	} else {
		downloadedContent, _ := os.ReadFile(downloadPath)
		fmt.Printf("   Conteúdo baixado:\n   %s", string(downloadedContent))
	}

	// 7. Deletar objeto (opcional)
	// fmt.Println("\n7. Removendo objeto...")
	// deleteObject(ctx, client, bucketName, "hello.txt")

	fmt.Println("\n" + strings.Repeat("=", 60))
	fmt.Println("✓ Todos os exemplos foram executados!")
	fmt.Println(strings.Repeat("=", 60))
}

// createBucket cria um novo bucket
func createBucket(ctx context.Context, client *minio.Client, bucketName string) error {
	exists, err := client.BucketExists(ctx, bucketName)
	if err != nil {
		return fmt.Errorf("erro ao verificar bucket: %w", err)
	}

	if !exists {
		err = client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("erro ao criar bucket: %w", err)
		}
		fmt.Printf("✓ Bucket '%s' criado com sucesso!\n", bucketName)
	} else {
		fmt.Printf("✓ Bucket '%s' já existe.\n", bucketName)
	}
	return nil
}

// uploadString faz upload de uma string como objeto
func uploadString(ctx context.Context, client *minio.Client, bucketName, objectName, content string) error {
	reader := bytes.NewReader([]byte(content))
	
	_, err := client.PutObject(ctx, bucketName, objectName, reader, int64(len(content)),
		minio.PutObjectOptions{ContentType: "text/plain"})
	if err != nil {
		return fmt.Errorf("erro no upload: %w", err)
	}

	fmt.Printf("✓ Conteúdo enviado como '%s'\n", objectName)
	return nil
}

// uploadFile faz upload de um arquivo
func uploadFile(ctx context.Context, client *minio.Client, bucketName, objectName, filePath string) error {
	_, err := client.FPutObject(ctx, bucketName, objectName, filePath,
		minio.PutObjectOptions{ContentType: "text/plain"})
	if err != nil {
		return fmt.Errorf("erro no upload: %w", err)
	}

	fmt.Printf("✓ Arquivo '%s' enviado como '%s'\n", filePath, objectName)
	return nil
}

// listObjects lista todos os objetos em um bucket
func listObjects(ctx context.Context, client *minio.Client, bucketName string) error {
	fmt.Printf("\n📋 Objetos no bucket '%s':\n", bucketName)

	objectCh := client.ListObjects(ctx, bucketName, minio.ListObjectsOptions{})
	for object := range objectCh {
		if object.Err != nil {
			return fmt.Errorf("erro ao listar objetos: %w", object.Err)
		}
		fmt.Printf("  - %s (Tamanho: %d bytes)\n", object.Key, object.Size)
	}
	return nil
}

// getObjectInfo obtém informações sobre um objeto
func getObjectInfo(ctx context.Context, client *minio.Client, bucketName, objectName string) error {
	objInfo, err := client.StatObject(ctx, bucketName, objectName, minio.StatObjectOptions{})
	if err != nil {
		return fmt.Errorf("erro ao obter informações: %w", err)
	}

	fmt.Printf("\n📊 Informações do objeto '%s':\n", objectName)
	fmt.Printf("  - Tamanho: %d bytes\n", objInfo.Size)
	fmt.Printf("  - Tipo: %s\n", objInfo.ContentType)
	fmt.Printf("  - Última modificação: %s\n", objInfo.LastModified)
	fmt.Printf("  - ETag: %s\n", objInfo.ETag)
	return nil
}

// downloadFile faz download de um arquivo
func downloadFile(ctx context.Context, client *minio.Client, bucketName, objectName, filePath string) error {
	err := client.FGetObject(ctx, bucketName, objectName, filePath, minio.GetObjectOptions{})
	if err != nil {
		return fmt.Errorf("erro no download: %w", err)
	}

	fmt.Printf("✓ Objeto '%s' baixado para '%s'\n", objectName, filePath)
	return nil
}

// deleteObject remove um objeto do bucket
func deleteObject(ctx context.Context, client *minio.Client, bucketName, objectName string) error {
	err := client.RemoveObject(ctx, bucketName, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("erro ao remover objeto: %w", err)
	}

	fmt.Printf("✓ Objeto '%s' removido\n", objectName)
	return nil
}

// downloadToMemory baixa um objeto para memória
func downloadToMemory(ctx context.Context, client *minio.Client, bucketName, objectName string) ([]byte, error) {
	object, err := client.GetObject(ctx, bucketName, objectName, minio.GetObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("erro ao obter objeto: %w", err)
	}
	defer object.Close()

	data, err := io.ReadAll(object)
	if err != nil {
		return nil, fmt.Errorf("erro ao ler objeto: %w", err)
	}

	return data, nil
}
