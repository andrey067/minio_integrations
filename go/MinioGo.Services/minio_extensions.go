package miniogoservices

import (
	"fmt"
	"strconv"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// MinioConfig contém as configurações de conexão com o MinIO.
type MinioConfig struct {
	Endpoint  string
	Port      int
	AccessKey string
	SecretKey string
	UseSSL    bool
}

// NewMinioClient cria e retorna um cliente MinIO configurado.
func NewMinioClient(cfg MinioConfig) (*minio.Client, error) {
	endpoint := fmt.Sprintf("%s:%s", cfg.Endpoint, strconv.Itoa(cfg.Port))
	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("erro ao criar cliente MinIO: %w", err)
	}
	return client, nil
}
