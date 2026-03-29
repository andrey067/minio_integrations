package miniogoservices

import (
	"context"
	"fmt"
	"io"

	"github.com/minio/minio-go/v7"
)

// MinioService implementa IMinioService usando o cliente oficial do MinIO.
type MinioService struct {
	client *minio.Client
}

// NewMinioService cria uma nova instância de MinioService.
func NewMinioService(client *minio.Client) *MinioService {
	return &MinioService{client: client}
}

func (s *MinioService) CreateBucket(ctx context.Context, bucketName string) error {
	exists, err := s.client.BucketExists(ctx, bucketName)
	if err != nil {
		return fmt.Errorf("erro ao verificar bucket: %w", err)
	}
	if !exists {
		if err := s.client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{}); err != nil {
			return fmt.Errorf("erro ao criar bucket: %w", err)
		}
	}
	return nil
}

func (s *MinioService) ListBuckets(ctx context.Context) ([]string, error) {
	buckets, err := s.client.ListBuckets(ctx)
	if err != nil {
		return nil, fmt.Errorf("erro ao listar buckets: %w", err)
	}
	names := make([]string, len(buckets))
	for i, b := range buckets {
		names[i] = b.Name
	}
	return names, nil
}

func (s *MinioService) BucketExists(ctx context.Context, bucketName string) (bool, error) {
	return s.client.BucketExists(ctx, bucketName)
}

func (s *MinioService) DeleteBucket(ctx context.Context, bucketName string) error {
	if err := s.client.RemoveBucket(ctx, bucketName); err != nil {
		return fmt.Errorf("erro ao excluir bucket: %w", err)
	}
	return nil
}

func (s *MinioService) UploadFile(
	ctx context.Context,
	bucketName, objectName string,
	reader io.Reader,
	size int64,
	contentType string,
) error {
	_, err := s.client.PutObject(ctx, bucketName, objectName, reader, size,
		minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		return fmt.Errorf("erro no upload: %w", err)
	}
	return nil
}

func (s *MinioService) DownloadFile(ctx context.Context, bucketName, objectName string) (io.ReadCloser, error) {
	obj, err := s.client.GetObject(ctx, bucketName, objectName, minio.GetObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("erro no download: %w", err)
	}
	return obj, nil
}
