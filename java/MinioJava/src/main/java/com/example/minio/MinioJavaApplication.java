package com.example.minio;

import com.example.minio.config.MinioConfiguration;
import com.example.minio.services.IMinioService;
import com.example.minio.services.MinioService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class MinioJavaApplication {

    public static void main(String[] args) {
        SpringApplication.run(MinioJavaApplication.class, args);
    }

    @Bean
    public IMinioService minioService(
            @Value("${minio.endpoint}") String endpoint,
            @Value("${minio.port}") int port,
            @Value("${minio.accessKey}") String accessKey,
            @Value("${minio.secretKey}") String secretKey
    ) {
        var config = new MinioConfiguration(endpoint, port, accessKey, secretKey);
        return new MinioService(config.buildClient());
    }
}
