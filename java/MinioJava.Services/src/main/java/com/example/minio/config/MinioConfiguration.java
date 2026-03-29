package com.example.minio.config;

import io.minio.MinioClient;

public class MinioConfiguration {

    private final String endpoint;
    private final int port;
    private final String accessKey;
    private final String secretKey;

    public MinioConfiguration(String endpoint, int port, String accessKey, String secretKey) {
        this.endpoint = endpoint;
        this.port = port;
        this.accessKey = accessKey;
        this.secretKey = secretKey;
    }

    public MinioClient buildClient() {
        return MinioClient.builder()
                .endpoint(endpoint, port, false)
                .credentials(accessKey, secretKey)
                .build();
    }
}
