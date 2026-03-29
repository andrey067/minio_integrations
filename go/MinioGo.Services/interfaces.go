package miniogoservices

import (
	"context"
	"io"
)

// IMinioService define as operações do MinIO.
type IMinioService interface {
	CreateBucket(ctx context.Context, bucketName string) error
	ListBuckets(ctx context.Context) ([]string, error)
	BucketExists(ctx context.Context, bucketName string) (bool, error)
	DeleteBucket(ctx context.Context, bucketName string) error
	UploadFile(ctx context.Context, bucketName, objectName string, reader io.Reader, size int64, contentType string) error
	DownloadFile(ctx context.Context, bucketName, objectName string) (io.ReadCloser, error)
}
