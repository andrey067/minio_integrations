package com.example.minio.controller;

import com.example.minio.services.IMinioService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

@RestController
public class MinioController {

    private final IMinioService minioService;

    public MinioController(IMinioService minioService) {
        this.minioService = minioService;
    }

    @PostMapping("/create-bucket")
    public ResponseEntity<Void> createBucket(@RequestBody String bucketName) throws Exception {
        minioService.createBucket(bucketName);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/list-buckets")
    public ResponseEntity<List<String>> listBuckets() throws Exception {
        return ResponseEntity.ok(minioService.listBuckets());
    }

    @DeleteMapping("/delete-bucket/{bucketName}")
    public ResponseEntity<Void> deleteBucket(@PathVariable String bucketName) throws Exception {
        minioService.deleteBucket(bucketName);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("bucketName") String bucketName
    ) throws Exception {
        try (InputStream stream = file.getInputStream()) {
            minioService.uploadFile(bucketName, file.getOriginalFilename(), stream, file.getSize(),
                    file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        }
        return ResponseEntity.ok(Map.of("fileName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload"));
    }

    @GetMapping("/download/{bucketName}/{fileName}")
    public ResponseEntity<byte[]> download(
            @PathVariable String bucketName,
            @PathVariable String fileName
    ) throws Exception {
        try (InputStream stream = minioService.downloadFile(bucketName, fileName)) {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(stream.readAllBytes());
        }
    }
}
