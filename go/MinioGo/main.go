package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"

	services "github.com/audreyernesto/miniogo-services"
)

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {
	port, _ := strconv.Atoi(getEnv("MINIO_PORT", "9000"))
	client, err := services.NewMinioClient(services.MinioConfig{
		Endpoint:  getEnv("MINIO_ENDPOINT", "localhost"),
		Port:      port,
		AccessKey: getEnv("MINIO_ACCESS_KEY", "DWnAxhH812XRcTBPWXA4"),
		SecretKey: getEnv("MINIO_SECRET_KEY", "FIBwo0raitlamHBnk2nNihdx88xoqeFD6793e3yi"),
	})
	if err != nil {
		log.Fatalf("erro ao criar cliente MinIO: %v", err)
	}

	svc := services.NewMinioService(client)
	mux := http.NewServeMux()

	mux.HandleFunc("POST /create-bucket", func(w http.ResponseWriter, r *http.Request) {
		var body struct{ BucketName string }
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := svc.CreateBucket(r.Context(), body.BucketName); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	})

	mux.HandleFunc("GET /list-buckets", func(w http.ResponseWriter, r *http.Request) {
		buckets, err := svc.ListBuckets(r.Context())
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(buckets)
	})

	mux.HandleFunc("DELETE /delete-bucket/{bucketName}", func(w http.ResponseWriter, r *http.Request) {
		bucketName := r.PathValue("bucketName")
		if err := svc.DeleteBucket(r.Context(), bucketName); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})

	mux.HandleFunc("POST /upload", func(w http.ResponseWriter, r *http.Request) {
		bucketName := r.URL.Query().Get("bucketName")
		if err := r.ParseMultipartForm(32 << 20); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		file, header, err := r.FormFile("file")
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		defer file.Close()
		if err := svc.UploadFile(r.Context(), bucketName, header.Filename, file, header.Size, header.Header.Get("Content-Type")); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"fileName": header.Filename})
	})

	mux.HandleFunc("GET /download/{bucketName}/{fileName}", func(w http.ResponseWriter, r *http.Request) {
		bucketName := r.PathValue("bucketName")
		fileName := r.PathValue("fileName")
		obj, err := svc.DownloadFile(r.Context(), bucketName, fileName)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer obj.Close()
		w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, fileName))
		w.Header().Set("Content-Type", "application/octet-stream")
		io.Copy(w, obj)
	})

	apiPort := getEnv("PORT", "8080")
	log.Printf("MinIO Go API rodando na porta %s", apiPort)
	log.Fatal(http.ListenAndServe(":"+apiPort, mux))
}
