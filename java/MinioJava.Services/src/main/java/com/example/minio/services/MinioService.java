package com.example.minio.services;

import io.minio.*;
import io.minio.messages.Bucket;

import java.io.InputStream;
import java.util.List;

public class MinioService implements IMinioService {

    private final MinioClient client;

    public MinioService(MinioClient client) {
        this.client = client;
    }

    @Override
    public void createBucket(String bucketName) throws Exception {
        boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        if (!exists) {
            client.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    @Override
    public List<String> listBuckets() throws Exception {
        return client.listBuckets().stream().map(Bucket::name).toList();
    }

    @Override
    public boolean bucketExists(String bucketName) throws Exception {
        return client.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
    }

    @Override
    public void deleteBucket(String bucketName) throws Exception {
        client.removeBucket(RemoveBucketArgs.builder().bucket(bucketName).build());
    }

    @Override
    public void uploadFile(String bucketName, String objectName, InputStream stream, long size, String contentType) throws Exception {
        client.putObject(PutObjectArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .stream(stream, size, -1)
                .contentType(contentType)
                .build());
    }

    @Override
    public InputStream downloadFile(String bucketName, String objectName) throws Exception {
        return client.getObject(GetObjectArgs.builder()
                .bucket(bucketName)
                .object(objectName)
                .build());
    }
}
